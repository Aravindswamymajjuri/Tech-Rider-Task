import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, User2, Plane, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { api, apiUrl } from "@/lib/api";
import { useSession } from "@/lib/session";

const portals = [
  {
    key: "builder",
    title: "Builder / Developer",
    subtitle: "Manage & List Properties",
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=70"
  },
  {
    key: "buyer",
    title: "Customer / Buyer",
    subtitle: "Find Your Dream Home",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=70"
  },
  {
    key: "nri",
    title: "NRI Terminal",
    subtitle: "For NRI Investors",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=70"
  }
];

const icons = {
  builder: <Building2 className="h-4 w-4" />,
  buyer: <User2 className="h-4 w-4" />,
  nri: <Plane className="h-4 w-4" />
};

export function LoginCard() {
  const [portal, setPortal] = useState("builder");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [providers, setProviders] = useState({ google: false, microsoft: false });
  const navigate = useNavigate();
  const { refresh } = useSession();

  useEffect(() => {
    api.config().then((c) => setProviders(c.oauth || {})).catch(() => {});
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = await api.login({ email, password, role: portal });
      await refresh();
      navigate(data.redirect || "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  function fillDemo() {
    if (portal === "builder") {
      setEmail("builder@1crore.in");
      setPassword("builder@123");
    } else if (portal === "buyer") {
      setEmail("buyer@1crore.in");
      setPassword("buyer@123");
    } else {
      setEmail("nri@1crore.in");
      setPassword("nri@123");
    }
  }

  function fillAdmin() {
    setEmail("admin@1crore.in");
    setPassword("admin@123");
  }

  return (
    <div className="card overflow-hidden bg-white/95 text-ink-900 shadow-ring backdrop-blur lg:ml-auto lg:max-w-[640px]">
      <div className="p-6 sm:p-8">
        <h2 className="text-center font-display text-2xl tracking-tight text-ink-900">
          Login to Your Account
        </h2>
        <p className="mt-1 text-center text-[13px] text-ink-500">
          Choose your portal to continue
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {portals.map((p) => {
            const active = p.key === portal;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setPortal(p.key)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border text-left transition-all",
                  active ? "border-gold-400 ring-2 ring-gold-200" : "border-ink-200 hover:border-ink-300"
                )}
              >
                <div
                  className="h-[90px] w-full bg-cover bg-center"
                  style={{ backgroundImage: `linear-gradient(180deg, rgba(7,13,34,.15), rgba(7,13,34,.55)), url(${p.image})` }}
                />
                <div className="px-3 pb-3 pt-3">
                  <div className="text-[13px] font-semibold leading-tight text-ink-900">{p.title}</div>
                  <div className="text-[11px] text-ink-500">{p.subtitle}</div>
                </div>
                <span
                  className={cn(
                    "absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm",
                    active ? "bg-gold-500" : "bg-ink-900/70"
                  )}
                >
                  {icons[p.key]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center gap-2 text-[12px] text-ink-500">
          <span className="h-px flex-1 bg-ink-100" />
          <span>Or continue with</span>
          <span className="h-px flex-1 bg-ink-100" />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SocialBtn label="Google" enabled={providers.google} href={apiUrl("/api/auth/google")} />
          <SocialBtn label="Microsoft" enabled={providers.microsoft} href={apiUrl("/api/auth/microsoft")} />
        </div>

        <div className="mt-5 flex items-center gap-2 text-[12px] text-ink-500">
          <span className="h-px flex-1 bg-ink-100" />
          <span>or login with email</span>
          <span className="h-px flex-1 bg-ink-100" />
        </div>

        <form onSubmit={onSubmit} className="mt-3 space-y-3">
          <div className="field">
            <input
              type="email"
              placeholder="Enter your email address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <input
              type={show ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="text-ink-400 hover:text-ink-700"
              aria-label="toggle password"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-[12.5px]">
            <label className="inline-flex items-center gap-2 text-ink-700">
              <input type="checkbox" className="h-4 w-4 rounded border-ink-300 accent-gold-500" />
              Remember me
            </label>
            <Link to="/forgot-password" className="font-medium text-gold-700 hover:underline">
              Forgot Password?
            </Link>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{error}</div>
          )}

          <button type="submit" disabled={busy} className="btn-gold w-full">
            {busy ? "Signing in…" : "Login"}
          </button>

          <div className="flex items-center justify-between text-[12.5px] text-ink-500">
            <span>
              Don&apos;t have an account?{" "}
              <Link
                to={
                  portal === "builder"
                    ? "/register/builder"
                    : portal === "buyer"
                      ? "/register/buyer"
                      : "/register/nri"
                }
                className="font-medium text-gold-700 hover:underline"
              >
                Sign Up
              </Link>
            </span>
            <button
              type="button"
              onClick={fillDemo}
              className="text-ink-500 underline-offset-2 hover:text-ink-900 hover:underline"
            >
              Use demo {portal} credentials
            </button>
          </div>
          <div className="text-center text-[11.5px] text-ink-400">
            Admin?{" "}
            <button
              type="button"
              onClick={fillAdmin}
              className="font-medium text-gold-700 underline-offset-2 hover:underline"
            >
              Fill admin credentials (admin@1crore.in / admin@123)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SocialBtn({ label, href, enabled }) {
  const swatch = (
    <span
      aria-hidden
      className="inline-block h-4 w-4 rounded-sm"
      style={{
        background:
          label === "Google"
            ? "linear-gradient(45deg,#4285F4,#EA4335,#FBBC04,#34A853)"
            : "linear-gradient(135deg,#F25022,#7FBA00,#00A4EF,#FFB900)"
      }}
    />
  );
  // Unconfigured providers still link through — the server renders a friendly
  // "set these env vars" page so admins know exactly how to wire it up.
  return (
    <a
      href={href}
      className="btn-outline relative w-full justify-center px-3 py-2 text-[12.5px]"
      title={
        enabled
          ? `Sign in with ${label}`
          : `${label} SSO is not configured — click for setup instructions`
      }
    >
      {swatch}
      {label}
      {!enabled && (
        <span
          className="absolute right-1 top-1 inline-block h-1.5 w-1.5 rounded-full bg-gold-500"
          aria-label="Setup required"
        />
      )}
    </a>
  );
}
