const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { setSessionCookie, clearSessionCookie, requireAuth } = require("../middleware/auth");
const { notify, notifyMany } = require("../lib/notifications");

const router = express.Router();

function redirectFor(role) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "builder") return "/dashboard/builder";
  if (role === "buyer") return "/dashboard/buyer";
  return "/dashboard/nri";
}

router.post("/login", async (req, res) => {
  const { email, password, role } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return res.status(401).json({ error: "Account not found" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Incorrect password" });

  // Admin may sign in via any portal selector.
  if (role && user.role !== role && user.role !== "admin") {
    return res.status(401).json({ error: `This account is registered as ${user.role}` });
  }

  setSessionCookie(res, user);
  return res.json({
    ok: true,
    redirect: redirectFor(user.role),
    user: { id: user._id.toString(), role: user.role, name: user.name }
  });
});

router.post("/register", async (req, res) => {
  const { role, email, password, name } = req.body || {};
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!["builder", "buyer", "nri"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  const lowerEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: lowerEmail });
  if (existing) return res.status(409).json({ error: "An account with this email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const base = { email: lowerEmail, name, passwordHash, phone: req.body.phone };
  let doc;
  if (role === "builder") {
    doc = await User.create({
      ...base,
      role: "builder",
      company: req.body.company,
      rera: req.body.rera,
      gstin: req.body.gstin,
      city: req.body.city,
      verified: false
    });
  } else if (role === "buyer") {
    doc = await User.create({
      ...base,
      role: "buyer",
      city: req.body.city,
      category: req.body.category,
      budgetMin: req.body.budgetMin,
      budgetMax: req.body.budgetMax,
      preferences: req.body.preferences
    });
  } else {
    doc = await User.create({
      ...base,
      role: "nri",
      country: req.body.country,
      preferredCity: req.body.preferredCity,
      investmentRange: req.body.investmentRange
    });
  }

  setSessionCookie(res, doc);

  // Welcome the new user + tell admins someone signed up.
  try {
    await notify({
      userId: doc._id.toString(),
      type: "welcome",
      title: `Welcome to 1 Crore Property, ${doc.name.split(" ")[0]} 👋`,
      body: doc.role === "builder"
        ? "List your first property to start receiving enquiries."
        : doc.role === "nri"
          ? "We've unlocked the NRI Terminal for you. Complete KYC to enable repatriation."
          : "Bookmark properties you love — your wishlist follows you across devices.",
      link: redirectFor(doc.role),
      icon: "sparkles"
    });
    const admins = await User.find({ role: "admin" }).select("_id").lean();
    await notifyMany(admins.map((a) => a._id.toString()), {
      type: "user_signup",
      title: `New ${doc.role} signed up`,
      body: `${doc.name} (${doc.email}) just created an account.`,
      link: "/dashboard/admin#users",
      icon: "user-plus"
    });
  } catch { /* ignore */ }

  return res.json({ ok: true, redirect: redirectFor(doc.role) });
});

router.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

// Convenience GET so a normal anchor tag works as a logout link.
router.get("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.redirect((process.env.CLIENT_ORIGIN || "/") + "/");
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.get("/session", (req, res) => {
  res.json({ user: req.user || null });
});

module.exports = router;
