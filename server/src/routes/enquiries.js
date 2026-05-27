const express = require("express");
const mongoose = require("mongoose");
const Enquiry = require("../models/Enquiry");
const Property = require("../models/Property");
const User = require("../models/User");
const { requireRole } = require("../middleware/auth");
const { notify, notifyMany } = require("../lib/notifications");

const router = express.Router();

// POST /api/enquiries — anyone (with or without a session) can send.
router.post("/", async (req, res) => {
  const { propertyId, name, email, phone, message, source } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  let propertyTitle;
  let propertyRef = null;
  let builderId = null;
  if (propertyId && mongoose.isValidObjectId(propertyId)) {
    const p = await Property.findById(propertyId).select("title builderId").lean();
    if (p) {
      propertyRef = p._id;
      propertyTitle = p.title;
      builderId = p.builderId;
      await Property.findByIdAndUpdate(p._id, { $inc: { visitRequests: 1 } });
    }
  }
  const doc = await Enquiry.create({
    propertyId: propertyRef,
    propertyTitle,
    name,
    email: String(email).toLowerCase().trim(),
    phone,
    message,
    source: source || (propertyRef ? "property" : "contact"),
    fromUserId: req.user?.userId
  });

  // Fan out notifications: the property's builder + every admin.
  const targets = new Set();
  if (builderId) targets.add(String(builderId));
  try {
    const admins = await User.find({ role: "admin" }).select("_id").lean();
    for (const a of admins) targets.add(String(a._id));
  } catch { /* ignore */ }

  await notifyMany(Array.from(targets), {
    type: "enquiry_received",
    title: propertyTitle ? `New enquiry on "${propertyTitle}"` : "New contact-form enquiry",
    body: `${name} (${email}) — ${(message || "No message").slice(0, 140)}`,
    link: propertyTitle ? `/dashboard/properties/${propertyRef}` : "/dashboard/admin#enquiries",
    icon: "mail"
  });

  res.status(201).json({ ok: true, enquiry: doc.toJSON() });
});

// GET /api/enquiries — admin only.
router.get("/", requireRole("admin"), async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const items = await Enquiry.find().sort({ createdAt: -1 }).limit(limit).lean({ virtuals: true });
  res.json({
    items: items.map((e) => ({
      ...e,
      id: e._id.toString(),
      _id: undefined,
      __v: undefined
    }))
  });
});

module.exports = router;
