const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Property = require("../models/Property");
const Notification = require("../models/Notification");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const MAX_COMPARE = 4;

function serializeProperty(p) {
  if (!p) return p;
  const out = { ...p };
  if (out._id) out.id = out._id.toString();
  if (out.builderId) out.builderId = out.builderId.toString();
  delete out._id;
  delete out.__v;
  return out;
}

function publicUser(u) {
  return {
    id: u._id.toString(),
    role: u.role,
    name: u.name,
    email: u.email,
    phone: u.phone || "",
    avatarUrl: u.avatarUrl || "",
    provider: u.provider || "local",
    company: u.company || "",
    rera: u.rera || "",
    gstin: u.gstin || "",
    city: u.city || "",
    category: u.category || "",
    budgetMin: u.budgetMin ?? null,
    budgetMax: u.budgetMax ?? null,
    preferences: u.preferences || {},
    country: u.country || "",
    preferredCity: u.preferredCity || "",
    investmentRange: u.investmentRange || "",
    favourites: (u.favourites || []).map(String),
    compareList: (u.compareList || []).map(String),
    createdAt: u.createdAt
  };
}

// === Profile ===
router.get("/", requireAuth, async (req, res) => {
  const u = await User.findById(req.user.userId).lean();
  if (!u) return res.status(404).json({ error: "Not found" });
  res.json({ user: publicUser(u) });
});

router.patch("/", requireAuth, async (req, res) => {
  const allowed = [
    "name", "phone", "city", "avatarUrl",
    // Builder
    "company", "rera", "gstin",
    // Buyer
    "category", "budgetMin", "budgetMax",
    // NRI
    "country", "preferredCity", "investmentRange"
  ];
  const update = {};
  for (const k of allowed) if (k in req.body) update[k] = req.body[k];
  const u = await User.findByIdAndUpdate(req.user.userId, update, { new: true, runValidators: true }).lean();
  if (!u) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true, user: publicUser(u) });
});

router.patch("/preferences", requireAuth, async (req, res) => {
  const prefs = req.body || {};
  const set = {};
  for (const k of ["emailEnquiries", "emailWeeklyDigest", "emailMarketing", "pushAlerts"]) {
    if (k in prefs) set[`preferences.${k}`] = Boolean(prefs[k]);
  }
  const u = await User.findByIdAndUpdate(req.user.userId, { $set: set }, { new: true }).lean();
  if (!u) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true, preferences: u.preferences });
});

router.post("/password", requireAuth, async (req, res) => {
  const { current, next } = req.body || {};
  if (!next || next.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters" });
  const u = await User.findById(req.user.userId);
  if (!u) return res.status(404).json({ error: "Not found" });
  if (u.provider && u.provider !== "local") {
    return res.status(400).json({ error: `Your account is managed by ${u.provider} — change your password there.` });
  }
  if (!current) return res.status(400).json({ error: "Current password is required" });
  const ok = await bcrypt.compare(current, u.passwordHash);
  if (!ok) return res.status(401).json({ error: "Current password is incorrect" });
  u.passwordHash = await bcrypt.hash(next, 10);
  await u.save();
  res.json({ ok: true });
});

// === Favourites ===
router.get("/favourites", requireRole("buyer", "nri", "admin"), async (req, res) => {
  const u = await User.findById(req.user.userId).lean();
  if (!u) return res.status(404).json({ error: "Not found" });
  const ids = (u.favourites || []).filter(mongoose.isValidObjectId);
  if (!ids.length) return res.json({ items: [] });
  const items = await Property.find({ _id: { $in: ids } }).lean({ virtuals: true });
  res.json({ items: items.map(serializeProperty) });
});

router.post("/favourites/:id", requireRole("buyer", "nri", "admin"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  const property = await Property.findById(req.params.id).lean();
  if (!property) return res.status(404).json({ error: "Property not found" });
  const updated = await User.findByIdAndUpdate(
    req.user.userId,
    { $addToSet: { favourites: property._id } },
    { new: true }
  ).lean();
  res.json({ ok: true, favourites: (updated.favourites || []).map(String) });
});

router.delete("/favourites/:id", requireRole("buyer", "nri", "admin"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  const updated = await User.findByIdAndUpdate(
    req.user.userId,
    { $pull: { favourites: req.params.id } },
    { new: true }
  ).lean();
  res.json({ ok: true, favourites: (updated.favourites || []).map(String) });
});

// === Compare ===
router.get("/compare", requireRole("buyer", "nri", "admin"), async (req, res) => {
  const u = await User.findById(req.user.userId).lean();
  if (!u) return res.status(404).json({ error: "Not found" });
  const ids = (u.compareList || []).filter(mongoose.isValidObjectId);
  if (!ids.length) return res.json({ items: [] });
  const items = await Property.find({ _id: { $in: ids } }).lean({ virtuals: true });
  const byId = new Map(items.map((p) => [p._id.toString(), serializeProperty(p)]));
  res.json({ items: ids.map((id) => byId.get(id.toString())).filter(Boolean) });
});

router.post("/compare/:id", requireRole("buyer", "nri", "admin"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  const property = await Property.findById(req.params.id).lean();
  if (!property) return res.status(404).json({ error: "Property not found" });
  const u = await User.findById(req.user.userId);
  if (!u) return res.status(404).json({ error: "Not found" });
  const list = (u.compareList || []).map(String);
  if (!list.includes(property._id.toString())) {
    if (list.length >= MAX_COMPARE) {
      return res.status(409).json({ error: `You can compare at most ${MAX_COMPARE} properties at a time` });
    }
    u.compareList.push(property._id);
    await u.save();
  }
  res.json({ ok: true, compareList: u.compareList.map(String) });
});

router.delete("/compare/:id", requireRole("buyer", "nri", "admin"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  const updated = await User.findByIdAndUpdate(
    req.user.userId,
    { $pull: { compareList: req.params.id } },
    { new: true }
  ).lean();
  res.json({ ok: true, compareList: (updated.compareList || []).map(String) });
});

router.delete("/compare", requireRole("buyer", "nri", "admin"), async (req, res) => {
  await User.findByIdAndUpdate(req.user.userId, { $set: { compareList: [] } });
  res.json({ ok: true, compareList: [] });
});

// === My properties (builder/admin) ===
router.get("/properties", requireRole("builder", "admin"), async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { builderId: req.user.userId };
  const items = await Property.find(filter).sort({ createdAt: -1 }).lean({ virtuals: true });
  res.json({ items: items.map(serializeProperty) });
});

// === Notifications ===
router.get("/notifications", requireAuth, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 30, 100);
  const items = await Notification.find({ userId: req.user.userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean({ virtuals: true });
  const unread = await Notification.countDocuments({ userId: req.user.userId, read: false });
  res.json({
    items: items.map((n) => ({ ...n, id: n._id.toString(), _id: undefined, __v: undefined })),
    unread
  });
});

router.patch("/notifications/read-all", requireAuth, async (req, res) => {
  await Notification.updateMany({ userId: req.user.userId, read: false }, { $set: { read: true } });
  res.json({ ok: true });
});

router.patch("/notifications/:id/read", requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  await Notification.updateOne(
    { _id: req.params.id, userId: req.user.userId },
    { $set: { read: true } }
  );
  res.json({ ok: true });
});

router.delete("/notifications/:id", requireAuth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid id" });
  await Notification.deleteOne({ _id: req.params.id, userId: req.user.userId });
  res.json({ ok: true });
});

module.exports = router;
