import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSession } from "@/lib/session";
import { api } from "@/lib/api";
import { DashboardShell, NavLink } from "@/components/DashboardShell";
import { PageSkeleton } from "@/components/PageSkeleton";
import { formatINR } from "@/lib/utils";
import { BadgeCheck, Bed, Compass, Maximize2, ScanEye, ShieldCheck, Trash2, Users } from "lucide-react";

const ROWS = [
  { key: "price", label: "Price", render: (p) => formatINR(p.price) },
  { key: "pricePerSqft", label: "Price / sqft", render: (p) => p.pricePerSqft ? `₹${p.pricePerSqft.toLocaleString("en-IN")}` : "—" },
  { key: "areaSqft", label: "Carpet area", render: (p) => `${p.areaSqft.toLocaleString("en-IN")} sqft`, Icon: Maximize2 },
  { key: "bhk", label: "Config", render: (p) => p.bhk || p.category, Icon: Bed },
  { key: "facing", label: "Facing", render: (p) => p.facing || "—", Icon: Compass },
  { key: "possession", label: "Possession", render: (p) => p.possession || "—" },
  { key: "rera", label: "RERA", render: (p) => p.rera || "—", Icon: ShieldCheck },
  { key: "views", label: "Views", render: (p) => p.views.toLocaleString("en-IN"), Icon: ScanEye },
  { key: "city", label: "City", render: (p) => p.city },
  { key: "builderName", label: "Builder", render: (p) => p.builderName }
];

export default function ComparePage() {
  const { user, loading, hasLists, compareList, toggleCompare } = useSession();
  const [items, setItems] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !hasLists) return;
    let alive = true;
    setItems(null);
    api.compareList()
      .then((d) => alive && setItems(d.items))
      .catch((e) => alive && setErr(e.message));
    return () => { alive = false; };
  }, [user, hasLists, compareList.length]);

  async function remove(id) {
    setBusy(true);
    try { await toggleCompare(id); } finally { setBusy(false); }
  }

  async function clearAll() {
    setBusy(true);
    try {
      await api.clearCompare();
      // Force a session refresh to update compareList state.
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not clear");
    } finally { setBusy(false); }
  }

  if (loading) return <PageSkeleton />;
  if (!user) return <Navigate to="/" replace />;
  if (!hasLists) return <Navigate to="/dashboard/admin" replace />;
  const tone = user.role === "nri" ? "gold" : "sage";
  const baseDash = user.role === "nri" ? "/dashboard/nri" : "/dashboard/buyer";

  return (
    <DashboardShell
      title="Compare Properties"
      subtitle="Side-by-side comparison of up to 4 shortlisted homes."
      user={{ name: user.name, role: user.role }}
      tone={tone}
      nav={
        <>
          <NavLink to={baseDash}>Dashboard</NavLink>
          <NavLink to="/properties">Browse Properties</NavLink>
          <NavLink to="/dashboard/wishlist">Wishlist</NavLink>
          <NavLink to="/dashboard/compare">Compare</NavLink>
        </>
      }
    >
      {err && <div className="rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-700">{err}</div>}

      {!items && !err && <PageSkeleton message="Loading your comparison…" />}

      {items && items.length === 0 && (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <span className={`grid h-12 w-12 place-items-center rounded-full ${tone === "gold" ? "bg-gold-100 text-gold-800" : "bg-sage-100 text-sage-800"}`}>
            <Users className="h-5 w-5" />
          </span>
          <h2 className="font-display text-xl text-ink-900">Compare list is empty</h2>
          <p className="max-w-md text-[13.5px] text-ink-500">
            Hit "Add to Compare" on any property card to line up to 4 side by side.
          </p>
          <Link to="/properties" className={`btn ${tone === "gold" ? "btn-gold" : "btn-sage"}`}>
            Browse Properties
          </Link>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-ink-500">
            <span>{items.length} of 4 properties compared</span>
            <button type="button" onClick={clearAll} disabled={busy} className="btn-outline !py-1.5 !text-[12px]">
              <Trash2 className="h-3.5 w-3.5" /> Clear all
            </button>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr>
                  <th className="w-40 border-b border-ink-100 px-4 py-3 align-bottom text-[11px] uppercase tracking-wider text-ink-500">
                    Property
                  </th>
                  {items.map((p) => (
                    <th key={p.id} className="min-w-[220px] border-b border-ink-100 px-4 py-3 align-top">
                      <div
                        className="h-32 w-full rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url(${p.imageUrl})` }}
                      />
                      <div className="mt-3 flex items-start justify-between gap-2">
                        <div>
                          <Link to={`/properties/${p.id}`} className="line-clamp-2 font-semibold text-ink-900 hover:underline">
                            {p.title}
                          </Link>
                          <div className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-ink-500">
                            <BadgeCheck className="h-3 w-3 text-sage-700" /> {p.location}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(p.id)}
                          disabled={busy}
                          className="grid h-7 w-7 place-items-center rounded-md text-ink-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Remove from compare"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.key} className="border-b border-ink-100/70 last:border-0">
                    <td className="px-4 py-3 align-top text-[12.5px] font-medium text-ink-700">
                      <span className="inline-flex items-center gap-1.5">
                        {r.Icon && <r.Icon className="h-3.5 w-3.5 text-ink-400" />} {r.label}
                      </span>
                    </td>
                    {items.map((p) => (
                      <td key={p.id + r.key} className={`px-4 py-3 align-top ${r.key === "price" ? "font-display text-lg text-ink-900" : "text-ink-800"}`}>
                        {r.render(p)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="px-4 py-4 align-top text-[12.5px] font-medium text-ink-700">Amenities</td>
                  {items.map((p) => (
                    <td key={p.id + "amen"} className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-1">
                        {p.amenities.slice(0, 6).map((a) => (
                          <span key={a} className="rounded-full border border-ink-100 bg-ink-50 px-2 py-0.5 text-[11px] text-ink-700">{a}</span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
