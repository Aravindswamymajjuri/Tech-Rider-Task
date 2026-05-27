const jwt = require("jsonwebtoken");
const User = require("../models/User");

const COOKIE_NAME = "1crore_session";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET || "dev-secret-change-me",
    { expiresIn: "7d" }
  );
}

function setSessionCookie(res, user) {
  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SEVEN_DAYS_MS,
    path: "/"
  });
  return token;
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

async function attachUser(req, _res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret-change-me");
    const user = await User.findById(payload.sub).lean();
    if (user) {
      req.user = {
        userId: user._id.toString(),
        role: user.role,
        name: user.name,
        email: user.email
      };
    }
  } catch {
    // Invalid / expired token — fall through unauthenticated.
  }
  return next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  return next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    return next();
  };
}

module.exports = {
  COOKIE_NAME,
  setSessionCookie,
  clearSessionCookie,
  attachUser,
  requireAuth,
  requireRole
};
