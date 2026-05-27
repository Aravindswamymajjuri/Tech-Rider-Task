import { useEffect, useState } from "react";
import { Link, NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { Brand } from "./Brand";
import { dashboardPathFor, initials } from "@/lib/utils";

const LINKS = [
  { to: "/properties", label: "Properties" },
  { to: "/about", label: "About Us" },
  { to: "/resources", label: "Resources" },
  { to: "/contact", label: "Contact Us" }
];

/**
 * Header used on every public page (Properties, PropertyDetail, About,
 * Resources, Contact). Sticky, with a real mobile hamburger drawer.
 */
export function SiteHeader({ sessionUser, accent }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Close drawer on route change.
  useEffect(() => { setOpen(false); }, [location.pathname, location.search]);

  // Body scroll lock when drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  function onSearch(e) {
    e.preventDefault();
    const v = q.trim();
    navigate(v ? `/properties?q=${encodeURIComponent(v)}` : "/properties");
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/85 backdrop-blur">
      <div className="container flex h-16 items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="grid h-9 w-9 place-items-center rounded-lg text-ink-700 hover:bg-ink-100 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Brand />
        <nav className="ml-3 hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <RouterNavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                [
                  "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                  isActive ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-100"
                ].join(" ")
              }
            >
              {l.label}
            </RouterNavLink>
          ))}
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden flex-1 max-w-xs items-center md:flex">
          <div className="field !py-2">
            <Search className="h-4 w-4 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search properties…" />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <Link
            to="/properties?category=premium"
            className={`btn ${accent === "sage" ? "btn-sage" : "btn-gold"} !py-1.5 !text-[12px]`}
          >
            <span className="hidden sm:inline">Exclusive </span>★
          </Link>
          {sessionUser ? (
            <Link
              to={dashboardPathFor(sessionUser.role)}
              className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-white px-1.5 py-1 hover:bg-ink-50"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-ink-900 text-[11.5px] font-semibold text-white">
                {initials(sessionUser.name)}
              </span>
              <span className="hidden text-[12.5px] font-medium text-ink-800 sm:inline">{sessionUser.name}</span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-ink-500 sm:inline" />
            </Link>
          ) : (
            <Link to="/" className="btn-outline !py-1.5 text-[12px]">Sign in</Link>
          )}
        </div>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-20 bg-ink-950/30 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-0 top-16 z-30 border-b border-ink-100 bg-white shadow-soft lg:hidden">
            <div className="container space-y-3 py-4">
              <form onSubmit={onSearch}>
                <div className="field !py-2">
                  <Search className="h-4 w-4 text-ink-400" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search properties…" />
                </div>
              </form>
              <nav className="flex flex-col gap-1">
                {LINKS.map((l) => (
                  <RouterNavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    className={({ isActive }) =>
                      [
                        "rounded-lg px-3 py-2 text-[14px] font-medium",
                        isActive ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-100"
                      ].join(" ")
                    }
                  >
                    {l.label}
                  </RouterNavLink>
                ))}
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
