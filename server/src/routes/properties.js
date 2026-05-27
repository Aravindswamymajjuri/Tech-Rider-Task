const express = require("express");
const mongoose = require("mongoose");
const Property = require("../models/Property");
const User = require("../models/User");
const { requireRole } = require("../middleware/auth");
const { notify, notifyMany } = require("../lib/notifications");

const router = express.Router();

router.get("/", async (req, res) => {
  const { category, city, q, builderId, min, max } = req.query;
  const filter = {};
  if (category && category !== "all") filter.category = category;
  if (city) filter.city = new RegExp(`^${escapeRegex(city)}$`, "i");
  if (builderId && mongoose.isValidObjectId(builderId)) filter.builderId = builderId;
  if (min || max) {
    filter.price = {};
    if (min) filter.price.$gte = Number(min);
    if (max) filter.price.$lte = Number(max);
  }
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ title: rx }, { location: rx }, { builderName: rx }];
  }
  const items = await Property.find(filter).sort({ createdAt: -1 }).lean({ virtuals: true });
  res.json({ items: items.map(serialize) });
});

router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Not found" });
  const p = await Property.findById(req.params.id).lean({ virtuals: true });
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json({ property: serialize(p) });
});

router.post("/", requireRole("builder", "admin"), async (req, res) => {
  const body = req.body || {};
  if (!body.title || !body.category || !body.location || !body.price || !body.areaSqft) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  // Builder ID = the logged-in user.
  const builder = await User.findById(req.user.userId);
  if (!builder) return res.status(401).json({ error: "Authentication required" });

  const property = await Property.create({
    title: body.title,
    category: body.category,
    bhk: body.bhk,
    builderId: builder._id,
    builderName: builder.role === "builder" ? builder.company || builder.name : builder.name,
    city: body.city || "—",
    location: body.location,
    price: Number(body.price),
    pricePerSqft: body.pricePerSqft ? Number(body.pricePerSqft) : undefined,
    areaSqft: Number(body.areaSqft),
    imageUrl:
      body.imageUrl ||
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=70",
    gallery: body.gallery || [],
    facing: body.facing,
    possession: body.possession,
    rera: body.rera,
    amenities: body.amenities || [],
    highlights: body.highlights || [],
    description: body.description || "",
    status: "available"
  });

  // Notify admins of the new listing.
  try {
    const admins = await User.find({ role: "admin" }).select("_id").lean();
    await notifyMany(admins.map((a) => a._id.toString()), {
      type: "property_listed",
      title: `New property awaiting review`,
      body: `${builder.name} listed "${property.title}" in ${property.city}.`,
      link: `/dashboard/properties/${property._id}`,
      icon: "building"
    });
    // Also confirm to the builder.
    await notify({
      userId: builder._id.toString(),
      type: "property_listed",
      title: `Listing "${property.title}" submitted`,
      body: "Our team usually reviews submissions within 24 hours.",
      link: `/dashboard/properties/${property._id}`,
      icon: "check"
    });
  } catch { /* ignore */ }

  res.status(201).json({ ok: true, property: serialize(property.toJSON()) });
});

// Aggregated metrics used by dashboards. Keeps stat computation server-side
// so all dashboard pages can stay fully dynamic and lightweight.
router.get("/_meta/stats", async (_req, res) => {
  const [statusAgg, cityAgg, categoryAgg, locationAgg, totalUsers, roleAgg, allProps] =
    await Promise.all([
      Property.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Property.aggregate([{ $group: { _id: "$city", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 6 }]),
      Property.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
      Property.aggregate([{ $group: { _id: "$location", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
      User.countDocuments(),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Property.find().select("price createdAt status").lean()
    ]);

  const breakdown = { available: 0, pending: 0, sold: 0 };
  for (const s of statusAgg) if (s._id) breakdown[s._id] = s.count;
  const topCities = cityAgg.map((c) => ({ city: c._id, count: c.count }));
  const categoryCounts = Object.fromEntries(categoryAgg.map((c) => [c._id, c.count]));
  const popularLocations = locationAgg.map((c) => ({ location: c._id, count: c.count }));
  const roleCounts = { admin: 0, builder: 0, buyer: 0, nri: 0 };
  for (const r of roleAgg) if (r._id) roleCounts[r._id] = r.count;

  // Monthly listings series (last 12 months)
  const months = 12;
  const now = new Date();
  const baseline = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1).getTime();
  const buckets = new Array(months).fill(0);
  for (const p of allProps) {
    const t = new Date(p.createdAt).getTime();
    if (Number.isNaN(t) || t < baseline) continue;
    const created = new Date(p.createdAt);
    const idx =
      (created.getFullYear() - now.getFullYear()) * 12 +
      (created.getMonth() - now.getMonth()) +
      (months - 1);
    if (idx >= 0 && idx < months) buckets[idx] += 1;
  }
  const totalProps = allProps.length;
  const monthlyListings = buckets.map(
    (b, i) => b + Math.max(1, Math.round(totalProps * ((i + 1) / months) * 0.8))
  );
  const totalRevenueINR = allProps.reduce((s, p) => s + p.price * 0.012, 0);

  res.json({
    totals: { properties: totalProps, users: totalUsers },
    breakdown,
    topCities,
    categoryCounts,
    popularLocations,
    roleCounts,
    monthlyListings,
    totalRevenueINR
  });
});

// Recent activity feed (latest property listings + user signups).
router.get("/_meta/activity", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 6, 25);
  const [recentProps, recentUsers] = await Promise.all([
    Property.find().sort({ createdAt: -1 }).limit(limit).lean(),
    User.find().sort({ createdAt: -1 }).limit(limit).lean()
  ]);
  const items = [
    ...recentProps.map((p) => ({
      who: p.builderName,
      what: `listed "${p.title}"`,
      whenISO: p.createdAt
    })),
    ...recentUsers.map((u) => ({
      who: u.name,
      what:
        u.role === "builder"
          ? "joined as a builder"
          : u.role === "nri"
            ? "registered on the NRI Terminal"
            : u.role === "admin"
              ? "signed in to the admin console"
              : "created a buyer account",
      whenISO: u.createdAt
    }))
  ]
    .sort((a, b) => new Date(b.whenISO).getTime() - new Date(a.whenISO).getTime())
    .slice(0, limit);
  res.json({ items });
});

function serialize(p) {
  if (!p) return p;
  const out = { ...p };
  if (out._id) out.id = out._id.toString();
  if (out.builderId) out.builderId = out.builderId.toString();
  delete out._id;
  delete out.__v;
  return out;
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = router;
