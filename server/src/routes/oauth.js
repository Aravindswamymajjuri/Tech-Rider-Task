const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");
const { setSessionCookie } = require("../middleware/auth");

const router = express.Router();

// Microsoft tenant — defaults to "common" (any Microsoft account). Set
// MICROSOFT_TENANT_ID to your tenant GUID when the app is restricted to
// "My organization only" in Entra; "common" sign-ins fail for those apps.
const MS_TENANT = process.env.MICROSOFT_TENANT_ID || "common";

const PROVIDERS = {
  google: {
    label: "Google",
    authorize: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
    userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
    scope: "openid email profile",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    normalize: (u) => ({
      providerId: u.sub,
      email: u.email,
      name: u.name || u.email,
      avatarUrl: u.picture
    })
  },
  microsoft: {
    label: "Microsoft",
    authorize: `https://login.microsoftonline.com/${MS_TENANT}/oauth2/v2.0/authorize`,
    token: `https://login.microsoftonline.com/${MS_TENANT}/oauth2/v2.0/token`,
    userinfo: "https://graph.microsoft.com/v1.0/me",
    scope: "openid email profile User.Read",
    clientIdEnv: "MICROSOFT_CLIENT_ID",
    clientSecretEnv: "MICROSOFT_CLIENT_SECRET",
    normalize: (u) => ({
      providerId: u.id,
      email: u.mail || u.userPrincipalName,
      name: u.displayName || u.givenName || u.userPrincipalName,
      avatarUrl: null
    })
  }
};

const STATE_COOKIE = "1crore_oauth_state";

function isConfigured(provider) {
  const cfg = PROVIDERS[provider];
  if (!cfg) return false;
  return Boolean(process.env[cfg.clientIdEnv] && process.env[cfg.clientSecretEnv]);
}

function appBase(req) {
  // CLIENT_ORIGIN is where the SPA lives — final redirect target.
  return process.env.CLIENT_ORIGIN || `${req.protocol}://${req.get("host")}`;
}

function apiBase(req) {
  // The API origin (used for the OAuth callback URL).
  // Defaults to the same host as this request, which is correct for prod and
  // for dev when the SPA proxies /api to this server.
  return process.env.API_ORIGIN || `${req.protocol}://${req.get("host")}`;
}

function notConfiguredPage(provider) {
  const cfg = PROVIDERS[provider];
  return `<!doctype html><html><head><meta charset="utf-8"><title>${cfg.label} sign-in not configured</title>
  <style>body{font-family:system-ui,sans-serif;max-width:560px;margin:60px auto;padding:0 24px;color:#0c1530}
  code{background:#eceff7;padding:2px 6px;border-radius:4px;font-size:.9em}
  .card{border:1px solid #eceff7;border-radius:14px;padding:24px;box-shadow:0 8px 30px rgba(7,13,34,.08)}
  a{color:#946c1d}</style></head><body>
  <div class="card">
    <h1 style="margin-top:0">${cfg.label} sign-in isn't configured yet</h1>
    <p>To enable Sign in with ${cfg.label}, set the following environment variables in <code>server/.env</code>:</p>
    <pre><code>${cfg.clientIdEnv}=…
${cfg.clientSecretEnv}=…
CLIENT_ORIGIN=http://localhost:5173</code></pre>
    <p>Then register this callback URL with ${cfg.label}:</p>
    <pre><code>{API_ORIGIN}/api/auth/${provider}/callback</code></pre>
    <p><a href="/">← Back to sign-in</a></p>
  </div>
  </body></html>`;
}

router.get("/:provider", (req, res) => {
  const { provider } = req.params;
  const cfg = PROVIDERS[provider];
  if (!cfg) return res.status(404).send("Unknown provider");
  const clientId = process.env[cfg.clientIdEnv];
  if (!clientId) {
    return res.status(503).type("html").send(notConfiguredPage(provider));
  }
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
    path: "/api/auth"
  });
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${apiBase(req)}/api/auth/${provider}/callback`,
    scope: cfg.scope,
    state,
    access_type: "offline",
    prompt: "select_account"
  });
  res.redirect(`${cfg.authorize}?${params.toString()}`);
});

router.get("/:provider/callback", async (req, res) => {
  const { provider } = req.params;
  const cfg = PROVIDERS[provider];
  if (!cfg) return res.status(404).send("Unknown provider");

  const code = req.query.code;
  const returnedState = req.query.state;
  const expectedState = req.cookies?.[STATE_COOKIE];
  res.clearCookie(STATE_COOKIE, { path: "/api/auth" });

  if (!code || !returnedState || returnedState !== expectedState) {
    return res.status(400).send("Invalid OAuth state — please try again.");
  }

  const clientId = process.env[cfg.clientIdEnv];
  const clientSecret = process.env[cfg.clientSecretEnv];
  if (!clientId || !clientSecret) {
    return res.status(503).type("html").send(notConfiguredPage(provider));
  }

  try {
    // Exchange code → access token
    const tokenRes = await fetch(cfg.token, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${apiBase(req)}/api/auth/${provider}/callback`
      })
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      console.error("[oauth] token exchange failed", tokenJson);
      return res.status(502).send("OAuth token exchange failed");
    }

    // Fetch userinfo
    const meRes = await fetch(cfg.userinfo, {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` }
    });
    const meJson = await meRes.json();
    if (!meRes.ok || !meJson) {
      console.error("[oauth] userinfo failed", meJson);
      return res.status(502).send("OAuth userinfo failed");
    }

    const norm = cfg.normalize(meJson);
    if (!norm.email) return res.status(400).send("OAuth provider returned no email");

    // Find or create user. OAuth signups land as "buyer" by default — they
    // can apply for builder/NRI status later via the regular registration.
    let user = await User.findOne({
      $or: [
        { provider, providerId: norm.providerId },
        { email: norm.email.toLowerCase() }
      ]
    });
    if (!user) {
      user = await User.create({
        role: "buyer",
        name: norm.name,
        email: norm.email.toLowerCase(),
        passwordHash: "oauth:" + crypto.randomBytes(16).toString("hex"),
        provider,
        providerId: norm.providerId,
        avatarUrl: norm.avatarUrl
      });
    } else if (user.provider !== provider) {
      user.provider = provider;
      user.providerId = norm.providerId;
      if (norm.avatarUrl && !user.avatarUrl) user.avatarUrl = norm.avatarUrl;
      await user.save();
    }

    setSessionCookie(res, user);

    const redirect =
      user.role === "admin"
        ? "/dashboard/admin"
        : user.role === "builder"
          ? "/dashboard/builder"
          : user.role === "buyer"
            ? "/dashboard/buyer"
            : "/dashboard/nri";
    res.redirect(`${appBase(req)}${redirect}`);
  } catch (err) {
    console.error("[oauth] callback error", err);
    res.status(500).send("OAuth callback failed");
  }
});

// Exposed so /api/config can report which providers are wired up without
// re-implementing the isConfigured check.
router.isConfigured = isConfigured;
router.PROVIDERS = PROVIDERS;

module.exports = router;
