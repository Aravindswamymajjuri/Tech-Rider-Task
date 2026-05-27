import { Link } from "react-router-dom";
import { DashboardShell, NavLink } from "@/components/DashboardShell";
import { Sparkline } from "@/components/Sparkline";
import { PropertyCard } from "@/components/PropertyCard";
import { relativeTime } from "@/lib/utils";
import { useSession } from "@/lib/session";
import {
  ArrowUpRight,
  BadgeCheck,
  Bookmark,
  CheckCircle2,
  Eye,
  HeartHandshake,
  Lock,
  Save,
  Scale,
  Search,
  Star
} from "lucide-react";

export function BuyerDashboard({ user, properties, stats }) {
  const { favourites, compareList } = useSession();
  const favouritesCount = favourites.length;
  const compareCount = compareList.length;
  const recommended = properties.slice(0, 3);
  const totalListings = properties.length;

  const avgPricePerSqft = (() => {
    const withRate = properties.filter((p) => p.pricePerSqft);
    if (!withRate.length) return 0;
    return Math.round(withRate.reduce((s, p) => s + (p.pricePerSqft ?? 0), 0) / withRate.length);
  })();

  const sortedByDate = [...properties].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const baseSqft = sortedByDate[0]?.pricePerSqft || avgPricePerSqft || 100;
  const trend = sortedByDate.length
    ? sortedByDate.slice(-12).map((p, i, arr) => {
        const rolling = arr.slice(0, i + 1).reduce((s, x) => s + (x.pricePerSqft ?? baseSqft), 0) / (i + 1);
        return Math.round((rolling / baseSqft) * 100);
      })
    : [100];
  const yoy = trend.length >= 2 ? (((trend[trend.length - 1] - trend[0]) / trend[0]) * 100).toFixed(1) : "0.0";

  const recentListings = [...properties]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <DashboardShell
      user={user}
      tone="sage"
      nav={
        <>
          <NavLink to="/dashboard/buyer">Dashboard</NavLink>
          <NavLink to="/properties">Browse Properties</NavLink>
          <NavLink to="/dashboard/wishlist">Wishlist</NavLink>
          <NavLink to="/dashboard/compare">Compare</NavLink>
          <NavLink to="/dashboard/notifications">Notifications</NavLink>
        </>
      }
    >
      {/* Welcome hero — matches "Welcome back, Rahul Sharma 👋" design */}
      <section className="card relative overflow-hidden p-6">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(ellipse_at_right,rgba(101,162,102,0.18),transparent_60%)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-ink-900 sm:text-3xl">Welcome back, {user.name} 👋</h2>
            <p className="mt-1 text-[13.5px] text-ink-500">
              Discover and find your dream home that matches your lifestyle and budget.
            </p>
          </div>
          <Link to="/properties" className="btn-sage">
            <Search className="h-4 w-4" /> Find Properties
          </Link>
        </div>
      </section>

      {/* Four-stat row — matches the design's Wish List / Compare / Saved Searches / Recent Views */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Mini
          icon={<Bookmark className="h-5 w-5" />}
          value={favouritesCount}
          label="Wish List"
          tone="sage"
          to="/dashboard/wishlist"
        />
        <Mini
          icon={<Scale className="h-5 w-5" />}
          value={compareCount}
          label="Compare"
          tone="violet"
          to="/dashboard/compare"
        />
        <Mini
          icon={<Save className="h-5 w-5" />}
          value={stats.popularLocations.length}
          label="Saved Searches"
          tone="gold"
          to="/properties"
        />
        <Mini
          icon={<Eye className="h-5 w-5" />}
          value={totalListings}
          label="Recent Views"
          tone="ink"
          to="/properties"
        />
      </section>

      {/* Recommended + Your Activity */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-ink-900">Recommended Properties</h3>
              <p className="text-[12px] text-ink-500">Hand-picked properties for your budget</p>
            </div>
            <Link to="/properties" className="text-[12.5px] font-medium text-sage-700 hover:underline">
              View All
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {recommended.map((p) => (
              <PropertyCard key={p.id} property={p} compact />
            ))}
          </div>
          <div className="mt-3 rounded-lg border border-sage-200 bg-sage-50/60 p-3 text-[12.5px] text-sage-800">
            ✨ Every property on 1 Crore Property is RERA-verified.
          </div>
        </div>

        <div className="card p-5" id="activity">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink-900">Your Activity</h3>
            <Link to="/dashboard/notifications" className="text-[12.5px] font-medium text-sage-700 hover:underline">View All</Link>
          </div>
          <ul className="mt-3 space-y-3 text-[12.5px]">
            {recentListings.map((p) => (
              <li key={p.id} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-sage-100 text-sage-700">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-ink-700">
                    <span className="font-semibold text-ink-900">New listing:</span>{" "}
                    <Link to={`/properties/${p.id}`} className="hover:underline">{p.title}</Link>
                  </div>
                  <div className="text-[11px] text-ink-400">{relativeTime(p.createdAt)} · {p.location}</div>
                </div>
              </li>
            ))}
            {recentListings.length === 0 && <li className="text-ink-500">No activity yet.</li>}
          </ul>
        </div>
      </section>

      {/* Explore More — three big actionable cards */}
      <section>
        <h3 className="text-[15px] font-semibold text-ink-900">Explore More</h3>
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
          <ExploreTile
            Icon={Bookmark}
            tone="sage"
            title="Wish List"
            count={favouritesCount}
            cta="View Wish List"
            to="/dashboard/wishlist"
            body="Properties you've bookmarked — synced across all your devices."
          />
          <ExploreTile
            Icon={Scale}
            tone="violet"
            title="Compare Properties"
            count={compareCount}
            cta="Compare Now"
            to="/dashboard/compare"
            body="Up to 4 homes side-by-side, with verified specs and price/sqft."
          />
          <ExploreTile
            Icon={Save}
            tone="gold"
            title="Saved Searches"
            count={stats.popularLocations.length}
            cta="View Saved Searches"
            to="/properties"
            body="Browse the locations and budgets buyers like you are searching."
          />
        </div>
      </section>

      {/* Trending searches + Market Insights — wider chart */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3" id="saved">
        <div className="card p-5">
          <h3 className="text-[15px] font-semibold text-ink-900">Trending Searches</h3>
          <p className="text-[12px] text-ink-500">Most-listed locations right now</p>
          <ul className="mt-3 space-y-2.5 text-[13px]">
            {stats.popularLocations.map((s) => (
              <li key={s.location} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2">
                <Link to={`/properties?city=${encodeURIComponent(s.location.split(",").pop()?.trim() ?? "")}`} className="text-ink-700 hover:text-ink-900">
                  {s.location}
                </Link>
                <span className="text-[11.5px] text-ink-500">{s.count} match{s.count === 1 ? "" : "es"}</span>
              </li>
            ))}
            {stats.popularLocations.length === 0 && <li className="text-ink-500">No locations yet.</li>}
          </ul>
        </div>

        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-ink-900">Market Insights</h3>
            <span className="rounded-md border border-ink-200 px-2 py-1 text-[12px] text-ink-600">{stats.topCities[0]?.city ?? "All Cities"}</span>
          </div>
          <p className="text-[12px] text-ink-500">Property Price Trend over the last 12 months</p>
          <Sparkline values={trend} color="#306838" fill="rgba(48,104,56,0.15)" height={140} />
          <div className="mt-2 grid grid-cols-3 gap-3 text-center">
            <Tile k="Avg ₹/sqft" v={avgPricePerSqft ? `₹${avgPricePerSqft.toLocaleString("en-IN")}` : "—"} />
            <Tile k="Trend" v={`${Number(yoy) >= 0 ? "+" : ""}${yoy}%`} pos={Number(yoy) >= 0} />
            <Tile k="Active Listings" v={totalListings.toLocaleString("en-IN")} />
          </div>
        </div>
      </section>

      {/* Trust strip — matches the bottom row of the design */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Pillar Icon={BadgeCheck} title="Verified Listings" sub="Only RERA-verified" tone="sage" />
        <Pillar Icon={Star} title="Best Price Guarantee" sub="Negotiated rates" tone="gold" />
        <Pillar Icon={HeartHandshake} title="Expert Support" sub="Dedicated RM" tone="violet" />
        <Pillar Icon={Lock} title="Safe & Secure" sub="Encrypted documents" tone="ink" />
      </section>
    </DashboardShell>
  );
}

const TONE = {
  sage: "bg-sage-100 text-sage-800",
  gold: "bg-gold-100 text-gold-800",
  violet: "bg-violet-100 text-violet-800",
  ink: "bg-ink-100 text-ink-800"
};

function Mini({ icon, value, label, tone, to }) {
  const inner = (
    <>
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${TONE[tone]}`}>{icon}</span>
      <div>
        <div className="font-display text-2xl text-ink-900">{Number(value).toLocaleString("en-IN")}</div>
        <div className="text-[12.5px] text-ink-500">{label}</div>
      </div>
    </>
  );
  return to ? (
    <Link to={to} className="card flex items-center gap-3 p-4 transition-shadow hover:shadow-ring">{inner}</Link>
  ) : (
    <div className="card flex items-center gap-3 p-4">{inner}</div>
  );
}

function ExploreTile({ Icon, tone, title, count, cta, to, body }) {
  return (
    <Link to={to} className="card group flex flex-col gap-3 p-5 transition-shadow hover:shadow-ring">
      <div className="flex items-center justify-between">
        <span className={`grid h-12 w-12 place-items-center rounded-2xl ${TONE[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-[11.5px] font-semibold text-ink-700">{count} item{count === 1 ? "" : "s"}</span>
      </div>
      <div>
        <h4 className="text-[15px] font-semibold text-ink-900">{title}</h4>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{body}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-[12.5px] font-medium text-sage-700 group-hover:underline">
        {cta} <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function Tile({ k, v, pos }) {
  return (
    <div className="rounded-lg border border-ink-100 px-3 py-2">
      <div className={`font-display text-lg ${pos ? "text-sage-700" : "text-ink-900"}`}>{v}</div>
      <div className="text-[11px] text-ink-500">{k}</div>
    </div>
  );
}

function Pillar({ Icon, title, sub, tone }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={`grid h-10 w-10 place-items-center rounded-full ${TONE[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="text-[13.5px] font-semibold text-ink-900">{title}</div>
        <div className="text-[11.5px] text-ink-500">{sub}</div>
      </div>
    </div>
  );
}
