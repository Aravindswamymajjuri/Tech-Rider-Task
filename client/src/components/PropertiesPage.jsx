import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Building2, ChevronRight, Eye, Grid3x3, Home, LandPlot, MapPin, Search, Store } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { Footer } from "./Footer";
import { PropertyCard } from "./PropertyCard";

const CATEGORIES = [
  { key: "all", label: "All Properties", icon: <Grid3x3 className="h-4 w-4" /> },
  { key: "apartment", label: "Apartments", icon: <Building2 className="h-4 w-4" /> },
  { key: "villa", label: "Villas", icon: <Home className="h-4 w-4" /> },
  { key: "independent", label: "Independent Houses", icon: <Home className="h-4 w-4" /> },
  { key: "plot", label: "Open Plots", icon: <LandPlot className="h-4 w-4" /> },
  { key: "commercial", label: "Commercial", icon: <Store className="h-4 w-4" /> }
];

const BUDGET_RANGES = {
  any: [0, Infinity],
  under1: [0, 1_00_00_000],
  "1to2": [1_00_00_000, 2_00_00_000],
  "2to5": [2_00_00_000, 5_00_00_000],
  above5: [5_00_00_000, Infinity]
};

export function PropertiesPage({ items, sessionUser, filterCategory }) {
  const [view, setView] = useState("grid");
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("any");
  const [sort, setSort] = useState("recommended");

  const filtered = useMemo(() => {
    const lq = q.toLowerCase();
    const [min, max] = BUDGET_RANGES[budget];
    const out = items.filter(
      (p) =>
        (!lq || p.title.toLowerCase().includes(lq) || p.location.toLowerCase().includes(lq) || p.builderName.toLowerCase().includes(lq)) &&
        (!city || p.city.toLowerCase() === city.toLowerCase()) &&
        p.price >= min &&
        p.price < max
    );
    if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
    else if (sort === "newest") out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return out;
  }, [items, q, city, budget, sort]);

  const priceBuckets = useMemo(() => {
    const buckets = [
      { l: "Below ₹1 Cr", min: 0, max: 1_00_00_000 },
      { l: "₹1 Cr - ₹2 Cr", min: 1_00_00_000, max: 2_00_00_000 },
      { l: "₹2 Cr - ₹5 Cr", min: 2_00_00_000, max: 5_00_00_000 },
      { l: "Above ₹5 Cr", min: 5_00_00_000, max: Infinity }
    ];
    const total = items.length || 1;
    return buckets.map((b) => {
      const matches = items.filter((p) => p.price >= b.min && p.price < b.max).length;
      return { l: b.l, v: Math.round((matches / total) * 100), count: matches };
    });
  }, [items]);

  const popularLocations = useMemo(() => {
    const counts = new Map();
    for (const p of items) counts.set(p.location, (counts.get(p.location) ?? 0) + 1);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));
  }, [items]);

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <SiteHeader sessionUser={sessionUser} />

      <section className="border-b border-ink-100 bg-white">
        <form onSubmit={(e) => e.preventDefault()} className="container grid grid-cols-1 items-center gap-3 py-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
          <div className="field !py-2 lg:min-w-[260px] lg:flex-1">
            <Search className="h-4 w-4 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search property name, location, builder…" />
          </div>
          <select className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px]" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">All Cities</option>
            {[...new Set(items.map((p) => p.city))].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px]" value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="any">Any Budget</option>
            <option value="under1">Below ₹1 Cr</option>
            <option value="1to2">₹1 Cr - ₹2 Cr</option>
            <option value="2to5">₹2 Cr - ₹5 Cr</option>
            <option value="above5">Above ₹5 Cr</option>
          </select>
          <button type="reset" onClick={() => { setQ(""); setCity(""); setBudget("any"); }} className="btn-outline !py-2 sm:col-span-2 lg:col-span-1">
            Clear filters
          </button>
        </form>

        <div className="container flex flex-wrap items-center gap-2 pb-3">
          {CATEGORIES.map((c) => {
            const active = (filterCategory || "all") === c.key;
            return (
              <Link
                key={c.key}
                to={c.key === "all" ? "/properties" : `/properties?category=${c.key}`}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                  active
                    ? "border-gold-300 bg-gold-50 text-gold-800"
                    : "border-ink-200 text-ink-700 hover:border-ink-300"
                ].join(" ")}
              >
                {c.icon}
                {c.label}
              </Link>
            );
          })}
        </div>
      </section>

      <main className="container grid grid-cols-1 gap-6 py-6 lg:grid-cols-12">
        <section className="lg:col-span-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl text-ink-900">
                {filtered.length.toLocaleString("en-IN")} Properties Found
              </h1>
              <p className="text-[12.5px] text-ink-500">
                {q ? <>Matching <strong className="text-ink-700">"{q}"</strong>{city ? ` in ${city}` : ""}</> : city ? `Showing listings in ${city}` : "Showing all live listings"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setView("grid")} className={view === "grid" ? "btn-ink !py-1.5 !text-[12px]" : "btn-outline !py-1.5 !text-[12px]"}><Grid3x3 className="h-4 w-4" /> Grid</button>
              <button onClick={() => setView("map")} className={view === "map" ? "btn-ink !py-1.5 !text-[12px]" : "btn-outline !py-1.5 !text-[12px]"}><MapPin className="h-4 w-4" /> Map</button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-lg border border-ink-200 px-2 py-1.5 text-[12.5px]"
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="price-asc">Price (low to high)</option>
                <option value="price-desc">Price (high to low)</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="card flex flex-col items-center gap-2 p-10 text-center">
              <Search className="h-8 w-8 text-ink-300" />
              <h3 className="font-display text-xl">No properties match your filters</h3>
              <p className="text-[13px] text-ink-500">Try widening your budget or clearing the search.</p>
            </div>
          )}
        </section>

        <aside className="lg:col-span-4 space-y-4">
          <div className="card p-3">
            <div className="relative h-72 w-full overflow-hidden rounded-xl bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=900&q=70')" }}>
              <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11.5px] text-ink-700 shadow">
                <MapPin className="h-3 w-3 text-gold-700" /> {city || "Bengaluru"}
              </div>
              {filtered.slice(0, 6).map((p, i) => (
                <span key={p.id} className="absolute inline-flex items-center justify-center rounded-full bg-gold-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow"
                  style={{ top: `${20 + (i * 27) % 200}px`, left: `${20 + (i * 73) % 240}px` }}>
                  {p.bhk?.split(" ")[0] || "₹"}
                </span>
              ))}
            </div>
            <div className="px-1 pt-3 text-[12.5px] text-ink-500">
              Interactive map preview (illustrative). Zoom in to view all listings.
            </div>
          </div>

          <div className="card p-4">
            <h4 className="text-[13.5px] font-semibold">Price Range Distribution</h4>
            <ul className="mt-3 space-y-2.5 text-[12.5px]">
              {priceBuckets.map((b) => (
                <li key={b.l}>
                  <div className="flex items-center justify-between text-ink-700">
                    <span>{b.l}</span>
                    <span className="font-medium">{b.count} · {b.v}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-600" style={{ width: `${b.v}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-4">
            <h4 className="text-[13.5px] font-semibold">Popular Locations</h4>
            <ul className="mt-2 space-y-1.5 text-[13px]">
              {popularLocations.map((l) => (
                <li key={l.location} className="flex items-center justify-between">
                  <Link to={`/properties?city=${encodeURIComponent(l.location.split(",").pop()?.trim() ?? "")}`} className="text-ink-700 hover:text-ink-900">
                    {l.location}
                  </Link>
                  <span className="inline-flex items-center gap-1 text-ink-500">
                    <span className="text-[11.5px]">{l.count}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-ink-400" />
                  </span>
                </li>
              ))}
              {popularLocations.length === 0 && <li className="text-ink-500">No locations yet.</li>}
            </ul>
          </div>
        </aside>
      </main>

      <section className="border-t border-ink-100 bg-white">
        <div className="container grid grid-cols-1 gap-4 py-5 sm:grid-cols-2 lg:grid-cols-5 text-[12.5px] text-ink-700">
          {[
            ["Verified Properties", "All listings are RERA-verified"],
            ["Best Price Guarantee", "Negotiated for our buyers"],
            ["Virtual Tour", "Walkthrough from anywhere"],
            ["Easy Site Visits", "Confirmed in <24 hrs"],
            ["Secure Transactions", "End-to-end document vault"]
          ].map(([t, s]) => (
            <div key={t} className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-100 text-gold-800"><Eye className="h-4 w-4" /></span>
              <div>
                <div className="font-semibold text-ink-900">{t}</div>
                <div className="text-[11.5px] text-ink-500">{s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

