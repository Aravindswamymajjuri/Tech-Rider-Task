import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Menu, Search, Settings, User as UserIcon, X } from "lucide-react";
import { Brand } from "./Brand";
import { NotificationsBell } from "./NotificationsBell";
import { dashboardPathFor, initials } from "@/lib/utils";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";

export function DashboardShell({ title, subtitle, user, nav, children, tone = "gold" }) {
  const { setUser } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [search, setSearch] = useState("");
  const userMenuRef = useRef(null);

  // Close drawers on route change.
  useEffect(() => {
    setMenuOpen(false);
    setUserOpen(false);
  }, [location.pathname, location.hash]);

  // Click-outside closes the user menu.
  useEffect(() => {
    if (!userOpen) return;
    function onDown(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [userOpen]);

  // Smooth-scroll to hash anchors on every route/hash change (sticky-header aware).
  useEffect(() => {
    if (!location.hash) return;
    const el = document.querySelector(location.hash);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [location.pathname, location.hash]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  async function signOut() {
    try { await api.logout(); } catch { /* ignore */ }
    setUser(null);
    navigate("/", { replace: true });
  }

  function onSearchSubmit(e) {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/properties?q=${encodeURIComponent(q)}` : "/properties");
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/85 backdrop-blur">
        <div className="container flex h-16 items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-700 hover:bg-ink-100 xl:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Brand />
          <nav className="ml-2 hidden items-center gap-1 xl:flex">{nav}</nav>

          <form onSubmit={onSearchSubmit} className="ml-auto hidden flex-1 max-w-sm items-center md:flex xl:max-w-md">
            <div className="field !py-2">
              <Search className="h-4 w-4 text-ink-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search properties, builders, locations…"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1.5 md:ml-2">
            <NotificationsBell tone={tone} />

            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserOpen((o) => !o)}
                className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-white px-1.5 py-1 hover:bg-ink-50"
                aria-haspopup="menu"
                aria-expanded={userOpen}
              >
                <span className={`grid h-7 w-7 place-items-center rounded-full text-[11.5px] font-semibold ${tone === "gold" ? "bg-gold-100 text-gold-800" : "bg-sage-100 text-sage-800"}`}>
                  {initials(user.name) || "U"}
                </span>
                <span className="hidden text-[12.5px] font-medium text-ink-800 sm:inline">{user.name}</span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-ink-500 sm:inline" />
              </button>
              {userOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-ring"
                >
                  <div className="border-b border-ink-100 px-4 py-3">
                    <div className="text-[13px] font-semibold text-ink-900">{user.name}</div>
                    <div className="mt-0.5 text-[11.5px] uppercase tracking-wider text-ink-500">{user.role}</div>
                  </div>
                  <Link
                    to={dashboardPathFor(user.role)}
                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-ink-700 hover:bg-ink-50"
                    role="menuitem"
                  >
                    <UserIcon className="h-3.5 w-3.5 text-ink-500" /> My dashboard
                  </Link>
                  <Link
                    to="/properties"
                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-ink-700 hover:bg-ink-50"
                    role="menuitem"
                  >
                    <UserIcon className="h-3.5 w-3.5 text-ink-500" /> Browse properties
                  </Link>
                  <Link
                    to="/dashboard/notifications"
                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-ink-700 hover:bg-ink-50"
                    role="menuitem"
                  >
                    <UserIcon className="h-3.5 w-3.5 text-ink-500" /> Notifications
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-ink-700 hover:bg-ink-50"
                    role="menuitem"
                  >
                    <Settings className="h-3.5 w-3.5 text-ink-500" /> Settings
                  </Link>
                  <button
                    type="button"
                    onClick={signOut}
                    className="flex w-full items-center gap-2 border-t border-ink-100 px-4 py-2.5 text-left text-[13px] font-medium text-red-700 hover:bg-red-50"
                    role="menuitem"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile / tablet drawer */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-20 bg-ink-950/30 backdrop-blur-sm xl:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed inset-x-0 top-16 z-30 border-b border-ink-100 bg-white shadow-soft xl:hidden">
            <div className="container space-y-3 py-4">
              <form onSubmit={onSearchSubmit} className="md:hidden">
                <div className="field !py-2">
                  <Search className="h-4 w-4 text-ink-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search properties…"
                  />
                </div>
              </form>
              <nav className="flex flex-col gap-1">{nav}</nav>
              <div className="flex items-center justify-between border-t border-ink-100 pt-3">
                <div className="text-[12.5px] text-ink-500">
                  Signed in as <span className="font-medium text-ink-800">{user.name}</span>
                </div>
                <button type="button" onClick={signOut} className="btn-outline !py-1.5 !text-[12px]">
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {title && (
        <section className="container pb-2 pt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl tracking-tight text-ink-900 sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-[13.5px] text-ink-500">{subtitle}</p>}
            </div>
          </div>
        </section>
      )}

      <main className="container space-y-6 py-6">{children}</main>
    </div>
  );
}

/**
 * NavLink that auto-detects active state from the current URL.
 * Active when target pathname matches AND hashes align.
 */
export function NavLink({ to, active, children }) {
  const location = useLocation();

  let computedActive = active;
  if (computedActive === undefined) {
    try {
      const target = new URL(to, "http://_");
      const samePath = target.pathname === location.pathname || (target.pathname === "/" && to.startsWith("#"));
      const sameHash = target.hash === location.hash;
      computedActive = samePath && sameHash;
    } catch {
      computedActive = false;
    }
  }

  return (
    <Link
      to={to}
      className={[
        "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
        computedActive ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-100"
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
