import { Link } from "react-router-dom";
import { DashboardShell, NavLink } from "@/components/DashboardShell";
import { BarChart, Donut, Sparkline } from "@/components/Sparkline";
import { formatINR, relativeTime } from "@/lib/utils";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Eye,
  Inbox,
  ListTodo,
  Mail,
  PieChart,
  Plus,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users
} from "lucide-react";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function trailingMonthLabels(n) {
  const now = new Date();
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(MONTH_LABELS[d.getMonth()][0]);
  }
  return out;
}

export function AdminDashboard({ user, properties, stats, activities, enquiries = [] }) {
  const totalProperties = stats.totals.properties;
  const labels = trailingMonthLabels(stats.monthlyListings.length);
  const maxCity = stats.topCities[0]?.count || 1;

  return (
    <DashboardShell
      title="Admin Dashboard"
      subtitle="A bird's-eye view of properties, users and revenue across 1 Crore Property."
      user={user}
      tone="gold"
      nav={
        <>
          <NavLink to="/dashboard/admin">Overview</NavLink>
          <NavLink to="/properties">Properties</NavLink>
          <NavLink to="/dashboard/admin#enquiries">Enquiries</NavLink>
          <NavLink to="/dashboard/admin#leads">Leads</NavLink>
          <NavLink to="/dashboard/properties/new">Add Property</NavLink>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Stat icon={<Building2 className="h-5 w-5" />} value={totalProperties.toLocaleString("en-IN")} label="Total Properties" tone="gold" />
        <Stat icon={<CheckCircle2 className="h-5 w-5" />} value={stats.breakdown.available.toLocaleString("en-IN")} label="Active Properties" tone="sage" />
        <Stat icon={<UserPlus className="h-5 w-5" />} value={stats.breakdown.pending.toLocaleString("en-IN")} label="Under Review" tone="violet" />
        <Stat icon={<ShieldCheck className="h-5 w-5" />} value={stats.breakdown.sold.toLocaleString("en-IN")} label="Sold / Closed" tone="rose" />
        <Stat icon={<Users className="h-5 w-5" />} value={stats.totals.users.toLocaleString("en-IN")} label="Total Users" tone="ink" />
        <Stat icon={<TrendingUp className="h-5 w-5" />} value={(stats.roleCounts.builder ?? 0).toLocaleString("en-IN")} label="Active Builders" tone="gold" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-ink-900">Property Overview</h2>
              <p className="text-[12px] text-ink-500">Properties listed across the last 12 months</p>
            </div>
            <span className="rounded-md border border-ink-200 bg-white px-2 py-1 text-[12px] text-ink-600">
              Last 12 Months
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[12.5px] text-ink-600">
            <Legend dot="#cea735" label="Properties Listed" />
            <Legend dot="#65a266" label="Active Properties" />
            <Legend dot="#9683ff" label="Under Review" />
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2">
            <Sparkline values={stats.monthlyListings} color="#cea735" fill="rgba(206,167,53,0.2)" height={120} />
            <Sparkline values={stats.monthlyListings.map((v) => Math.round(v * (stats.breakdown.available / Math.max(1, totalProperties))))} color="#65a266" fill="rgba(101,162,102,0.18)" height={80} />
            <Sparkline values={stats.monthlyListings.map((v) => Math.round(v * (stats.breakdown.pending / Math.max(1, totalProperties))))} color="#9683ff" fill="rgba(150,131,255,0.18)" height={50} />
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-ink-900">Property Status Distribution</h2>
            <PieChart className="h-4 w-4 text-ink-500" />
          </div>
          <div className="mt-3">
            <Donut
              segments={[
                { label: "Active", value: stats.breakdown.available, color: "#65a266" },
                { label: "Pending", value: stats.breakdown.pending, color: "#cea735" },
                { label: "Sold", value: stats.breakdown.sold, color: "#9683ff" }
              ]}
              centerLabel={{ value: totalProperties.toLocaleString("en-IN"), label: "Total" }}
            />
          </div>
        </div>
      </div>

      <div className="card p-5" id="leads">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-ink-900">Recent Properties</h2>
            <p className="text-[12px] text-ink-500">Latest listings across the platform</p>
          </div>
          <Link to="/properties" className="inline-flex items-center gap-1 text-[12.5px] font-medium text-gold-700 hover:underline">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-ink-500">
              <tr className="border-b border-ink-100">
                <th className="py-2 pr-4 font-medium">Property</th>
                <th className="py-2 pr-4 font-medium">Location</th>
                <th className="py-2 pr-4 font-medium">Builder</th>
                <th className="py-2 pr-4 font-medium">Price</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {properties.slice(0, 6).map((p) => (
                <tr key={p.id} className="border-b border-ink-100/70 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-14 rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${p.imageUrl})` }} />
                      <div>
                        <div className="font-medium text-ink-900">{p.title}</div>
                        <div className="text-[11.5px] uppercase tracking-wide text-ink-400">{p.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-ink-700">{p.location}</td>
                  <td className="py-3 pr-4 text-ink-700">{p.builderName}</td>
                  <td className="py-3 pr-4 font-semibold">{formatINR(p.price)}</td>
                  <td className="py-3 pr-4">
                    <StatusPill status={p.status} />
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/properties/${p.id}`} className="inline-flex items-center gap-1 text-gold-700 hover:underline">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                      <Link to={`/dashboard/properties/${p.id}`} className="text-ink-500 hover:underline">
                        Metrics
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold text-ink-900">Quick Actions</h3>
          <p className="text-[12px] text-ink-500">Frequently used controls</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/dashboard/properties/new" className="btn-outline justify-start">
              <Plus className="h-4 w-4" /> Add Property
            </Link>
            <a href="#users" className="btn-outline justify-start"><Users className="h-4 w-4" /> Manage Users</a>
            <a href="#leads" className="btn-outline justify-start"><ListTodo className="h-4 w-4" /> Manage Leads</a>
            <Link to="/properties" className="btn-outline justify-start"><ClipboardList className="h-4 w-4" /> Listings</Link>
          </div>
        </div>

        <div className="card p-5" id="activity">
          <h3 className="text-[14px] font-semibold text-ink-900">Recent Activities</h3>
          <ul className="mt-3 space-y-3 text-[12.5px] text-ink-700">
            {activities.map((a, i) => {
              const initialsText = a.who.split(" ").map((p) => p[0]).join("").slice(0, 2);
              const palette = ["bg-gold-100 text-gold-800","bg-sage-100 text-sage-800","bg-violet-100 text-violet-800","bg-ink-100 text-ink-800"];
              return (
                <li key={`${a.who}-${a.whenISO}-${i}`} className="flex items-start gap-3">
                  <span className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold ${palette[i % palette.length]}`}>
                    {initialsText}
                  </span>
                  <div>
                    <div><span className="font-semibold">{a.who}</span> {a.what}</div>
                    <div className="text-[11px] text-ink-400">{relativeTime(a.whenISO)}</div>
                  </div>
                </li>
              );
            })}
            {activities.length === 0 && <li className="text-ink-500">No recent activity yet.</li>}
          </ul>
        </div>

        <div className="card p-5" id="users">
          <h3 className="text-[14px] font-semibold text-ink-900">Top Locations By Active Properties</h3>
          <ul className="mt-3 space-y-2.5 text-[12.5px]">
            {stats.topCities.map((c) => {
              const pct = Math.round((c.count / maxCity) * 100);
              return (
                <li key={c.city} className="flex items-center gap-3">
                  <span className="w-24 text-ink-700">{c.city}</span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-300 to-gold-600" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right font-semibold text-ink-900">{c.count}</span>
                </li>
              );
            })}
            {stats.topCities.length === 0 && <li className="text-ink-500">No data yet.</li>}
          </ul>
        </div>
      </div>

      <div className="card p-5" id="enquiries">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[14px] font-semibold text-ink-900">Recent Enquiries</h3>
            <p className="text-[12px] text-ink-500">Form submissions from buyers and visitors</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-medium text-gold-800">
            <Inbox className="h-3 w-3" /> {enquiries.length} new
          </span>
        </div>
        {enquiries.length === 0 ? (
          <p className="mt-4 text-[13px] text-ink-500">No enquiries yet. Enquiries from the Contact page and property pages land here.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="text-ink-500">
                <tr className="border-b border-ink-100">
                  <th className="py-2 pr-4 font-medium">Contact</th>
                  <th className="py-2 pr-4 font-medium">Property</th>
                  <th className="py-2 pr-4 font-medium">Source</th>
                  <th className="py-2 pr-4 font-medium">Received</th>
                  <th className="py-2 pr-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((e) => (
                  <tr key={e.id} className="border-b border-ink-100/70 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-ink-900">{e.name}</div>
                      <div className="text-[11.5px] text-ink-500">{e.email}{e.phone ? ` · ${e.phone}` : ""}</div>
                    </td>
                    <td className="py-3 pr-4 text-ink-700">
                      {e.propertyTitle ? (
                        <Link to={`/properties/${e.propertyId}`} className="hover:underline">{e.propertyTitle}</Link>
                      ) : (
                        <span className="text-ink-500">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-ink-700 capitalize">{e.source}</td>
                    <td className="py-3 pr-4 text-ink-500">{relativeTime(e.createdAt)}</td>
                    <td className="py-3 pr-4">
                      <a href={`mailto:${e.email}`} className="inline-flex items-center gap-1 text-gold-700 hover:underline">
                        <Mail className="h-3.5 w-3.5" /> Reply
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-ink-900">Monthly Listings & Revenue</h3>
            <p className="text-[12px] text-ink-500">Estimated platform commission revenue</p>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl text-ink-900">{formatINR(stats.totalRevenueINR)}</div>
            <div className="text-[11.5px] text-ink-500">Estimated last 12 months</div>
          </div>
        </div>
        <div className="mt-3">
          <BarChart values={stats.monthlyListings} labels={labels} color="#cea735" />
        </div>
      </div>
    </DashboardShell>
  );
}

function Legend({ dot, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: dot }} /> {label}
    </span>
  );
}

const TONE_BG = {
  gold: "bg-gold-100 text-gold-800",
  sage: "bg-sage-100 text-sage-800",
  violet: "bg-violet-100 text-violet-800",
  rose: "bg-red-100 text-red-700",
  ink: "bg-ink-100 text-ink-800"
};

function Stat({ icon, value, label, tone }) {
  return (
    <div className="stat-card">
      <div>
        <div className="font-display text-2xl text-ink-900">{value}</div>
        <div className="mt-0.5 text-[12.5px] text-ink-500">{label}</div>
      </div>
      <span className={`grid h-9 w-9 place-items-center rounded-full ${TONE_BG[tone]}`}>{icon}</span>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    available: "bg-sage-100 text-sage-800",
    sold: "bg-ink-100 text-ink-800",
    pending: "bg-gold-100 text-gold-800"
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${map[status] || "bg-ink-100 text-ink-800"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
