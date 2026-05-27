import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSession } from "@/lib/session";
import { api } from "@/lib/api";
import { DashboardShell, NavLink } from "@/components/DashboardShell";
import { PageSkeleton } from "@/components/PageSkeleton";
import { PropertyCard } from "@/components/PropertyCard";
import { Bookmark } from "lucide-react";

export default function WishlistPage() {
  const { user, loading, hasLists, favourites } = useSession();
  const [items, setItems] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!user || !hasLists) return;
    let alive = true;
    setItems(null);
    api.favourites()
      .then((d) => alive && setItems(d.items))
      .catch((e) => alive && setErr(e.message));
    return () => { alive = false; };
    // Re-fetch whenever the favourites array changes (eg. user toggled off here).
  }, [user, hasLists, favourites.length]);

  if (loading) return <PageSkeleton />;
  if (!user) return <Navigate to="/" replace />;
  if (!hasLists) return <Navigate to="/dashboard/admin" replace />;
  const tone = user.role === "nri" ? "gold" : "sage";
  const baseDash = user.role === "nri" ? "/dashboard/nri" : "/dashboard/buyer";

  return (
    <DashboardShell
      title="Your Wishlist"
      subtitle="Properties you've bookmarked across the platform."
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

      {!items && !err && <PageSkeleton message="Loading your wishlist…" />}

      {items && items.length === 0 && (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <span className={`grid h-12 w-12 place-items-center rounded-full ${tone === "gold" ? "bg-gold-100 text-gold-800" : "bg-sage-100 text-sage-800"}`}>
            <Bookmark className="h-5 w-5" />
          </span>
          <h2 className="font-display text-xl text-ink-900">No bookmarks yet</h2>
          <p className="max-w-md text-[13.5px] text-ink-500">
            Tap the bookmark icon on any property card to save it here. Wishlisted
            properties stay in sync across devices.
          </p>
          <Link to="/properties" className={`btn ${tone === "gold" ? "btn-gold" : "btn-sage"}`}>
            Browse Properties
          </Link>
        </div>
      )}

      {items && items.length > 0 && (
        <>
          <div className="text-[12.5px] text-ink-500">{items.length} saved propert{items.length === 1 ? "y" : "ies"}</div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
