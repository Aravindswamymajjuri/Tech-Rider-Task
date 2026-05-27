require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");

const { connectDatabase } = require("./db");
const { attachUser } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const oauthRoutes = require("./routes/oauth");
const propertyRoutes = require("./routes/properties");
const meRoutes = require("./routes/me");
const enquiryRoutes = require("./routes/enquiries");
const { seedIfEmpty } = require("./seed");

const PORT = process.env.PORT || 4000;
const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, "");
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);
const ALLOW_VERCEL_PREVIEWS = process.env.ALLOW_VERCEL_PREVIEWS === "true";

function isAllowedOrigin(origin) {
  const normalized = normalizeOrigin(origin);
  if (CLIENT_ORIGINS.includes(normalized)) return true;
  return ALLOW_VERCEL_PREVIEWS && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalized);
}

async function start() {
  await connectDatabase();
  await seedIfEmpty();

  const app = express();
  app.set("trust proxy", 1);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || isAllowedOrigin(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked origin: ${origin}`));
      },
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use(attachUser);

  app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

  // What OAuth providers are wired up — the SPA uses this to enable/disable
  // SSO buttons.
  app.get("/api/config", (_req, res) => {
    const oauth = {};
    for (const name of Object.keys(oauthRoutes.PROVIDERS)) {
      oauth[name] = oauthRoutes.isConfigured(name);
    }
    res.json({ oauth });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/auth", oauthRoutes); // /api/auth/{google,microsoft,apple,linkedin}
  app.use("/api/properties", propertyRoutes);
  app.use("/api/me", meRoutes);
  app.use("/api/enquiries", enquiryRoutes);

  // Centralised error handler
  app.use((err, _req, res, _next) => {
    console.error("[error]", err);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
  });

  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
    console.log(`[server] CORS allowing ${CLIENT_ORIGINS.join(", ")} with credentials`);
    if (ALLOW_VERCEL_PREVIEWS) console.log("[server] CORS allowing Vercel preview deployments");
  });
}

start().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
