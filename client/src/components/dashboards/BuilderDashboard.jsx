import { Link } from "react-router-dom";
import { DashboardShell, NavLink } from "@/components/DashboardShell";
import { BarChart, Donut, Sparkline } from "@/components/Sparkline";
import { formatINR, relativeTime } from "@/lib/utils";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  Inbox,
  Mail,
  MapPin,
  Phone,
  PieChart,
  Plus,
  Send,
  ShieldCheck,
  TrendingUp,
  Users
} from "lucide-react";

const MONTH_LABELS = ["J","F","M","A","M","J","J","A","S","O","N","D"];

function trailingMonths(n) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return MONTH_LABELS[d.getMonth()];
  });
}

export function BuilderDashboard({ user, properties, enquiries = [], notifications = [] }) {
  const totalListings = properties.length;
  const activeListings = properties.filter((p) => p.status === "available").length;
  const totalViews = properties.reduce((s, p) => s + (p.views || 0), 0);
  const totalDownloads = properties.reduce((s, p) => s + (p.brochureDownloads || 0), 0);
  const totalVisits = properties.reduce((s, p) => s + (p.visitRequests || 0), 0);
  const portfolioValueINR = properties.reduce((s, p) => s + p.price, 0);

  // Synthesise a 12-month engagement series from listing creation dates.
  const labels = trailingMonths(12);
  const monthBuckets = new Array(12).fill(0);
  const now = new Date();
  for (const p of properties) {
    const t = new Date(p.createdAt);
    const idx = (t.getFullYear() - now.getFullYear()) * 12 + (t.getMonth() - now.getMonth()) + 11;
    if (idx >= 0 && idx < 12) monthBuckets[idx] += 1;
  }
  const viewSeries = monthBuckets.map((c, i) => Math.max(8, Math.round((totalViews / 12) * (0.6 + i * 0.05) + c * 12)));
  const downloadSeries = viewSeries.map((v) => Math.round(v * (totalDownloads / Math.max(1, totalViews))));
  const visitSeries = viewSeries.map((v) => Math.round(v * (totalVisits / Math.max(1, totalViews))));

  const categoryCounts = properties.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardShell
      user={user}
      tone="gold"
      title="Builder Dashboard"
      subtitle={`Manage every property listed by ${user.name === "Rajesh Reddy" ? "Skyline Crest" : user.name}, your leads and your CRM in one place.`}
      nav={
        <>
          <NavLink to="/dashboard/builder">Overview</NavLink>
          <NavLink to="/dashboard/builder#listings">My Listings</NavLink>
          <NavLink to="/dashboard/builder#leads">Leads</NavLink>
          <NavLink to="/dashboard/properties/new">Add Property</NavLink>
          <NavLink to="/dashboard/notifications">Inbox</NavLink>
        </>
      }
    >
      {/* Hero stats — six metrics, two-up on mobile, six-up on xl */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Stat icon={<Building2 className="h-5 w-5" />} value={totalListings.toLocaleString("en-IN")} label="My Properties" tone="gold" />
        <Stat icon={<CheckCircle2 className="h-5 w-5" />} value={activeListings.toLocaleString("en-IN")} label="Active" tone="sage" />
        <Stat icon={<Eye className="h-5 w-5" />} value={totalViews.toLocaleString("en-IN")} label="Total Views" tone="violet" />
        <Stat icon={<BadgeCheck className="h-5 w-5" />} value={totalDownloads.toLocaleString("en-IN")} label="Brochure Downloads" tone="ink" />
        <Stat icon={<Phone className="h-5 w-5" />} value={totalVisits.toLocaleString("en-IN")} label="Visit Requests" tone="rose" />
        <Stat icon={<TrendingUp className="h-5 w-5" />} value={formatINR(portfolioValueINR)} label="Portfolio Value" tone="gold" />
      </div>

      {/* Engagement chart + portfolio mix */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-semibold text-ink-900">User Engagement Overview</h2>
              <p className="text-[12px] text-ink-500">Views, downloads & visit requests across all your listings</p>
            </div>
            <span className="rounded-md border border-ink-200 bg-white px-2 py-1 text-[12px] text-ink-600">Last 12 Months</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-ink-600">
            <Legend dot="#cea735" label="Views" />
            <Legend dot="#65a266" label="Brochure Downloads" />
            <Legend dot="#9683ff" label="Visit Requests" />
          </div>
          <div className="mt-2 space-y-2">
            <Sparkline values={viewSeries} color="#cea735" fill="rgba(206,167,53,0.18)" height={120} />
            <Sparkline values={downloadSeries} color="#65a266" fill="rgba(101,162,102,0.18)" height={70} />
            <Sparkline values={visitSeries} color="#9683ff" fill="rgba(150,131,255,0.18)" height={50} />
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-ink-900">Portfolio Mix</h2>
            <PieChart className="h-4 w-4 text-ink-500" />
          </div>
          <p className="text-[12px] text-ink-500">Listings by category</p>
          <div className="mt-3">
            <Donut
              segments={
                Object.entries(categoryCounts).length
                  ? Object.entries(categoryCounts).map(([k, v], i) => ({
                      label: k.charAt(0).toUpperCase() + k.slice(1),
                      value: v,
                      color: ["#cea735", "#65a266", "#9683ff", "#94a3b8", "#306838"][i % 5]
                    }))
                  : [{ label: "No listings", value: 1, color: "#94a3b8" }]
              }
              centerLabel={{ value: totalListings.toString(), label: "Listings" }}
            />
          </div>
        </div>
      </div>

      {/* My listings table */}
      <div className="card p-5" id="listings">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-semibold text-ink-900">My Listings</h2>
            <p className="text-[12px] text-ink-500">Click a row to drill into per-property metrics.</p>
          </div>
          <Link to="/dashboard/properties/new" className="btn-gold !py-1.5 !text-[12px]">
            <Plus className="h-4 w-4" /> Add Property
          </Link>
        </div>
        {properties.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-ink-200 bg-ink-50/60 p-8 text-center">
            <h3 className="font-display text-lg text-ink-900">You haven't listed any properties yet</h3>
            <p className="mt-1 text-[13px] text-ink-500">Add your first listing — it usually takes &lt; 2 minutes.</p>
            <Link to="/dashboard/properties/new" className="btn-gold mt-4 inline-flex"><Plus className="h-4 w-4" /> Add Property</Link>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="text-ink-500">
                <tr className="border-b border-ink-100">
                  <th className="py-2 pr-4 font-medium">Property</th>
                  <th className="py-2 pr-4 font-medium">Location</th>
                  <th className="py-2 pr-4 font-medium">Price</th>
                  <th className="py-2 pr-4 font-medium">Views</th>
                  <th className="py-2 pr-4 font-medium">Visits</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p.id} className="border-b border-ink-100/70 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${p.imageUrl})` }} />
                        <div>
                          <Link to={`/properties/${p.id}`} className="font-medium text-ink-900 hover:underline">{p.title}</Link>
                          <div className="text-[11.5px] uppercase tracking-wide text-ink-400">{p.category}{p.bhk ? ` · ${p.bhk}` : ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-ink-700">{p.location}</td>
                    <td className="py-3 pr-4 font-semibold">{formatINR(p.price)}</td>
                    <td className="py-3 pr-4 text-ink-700">{p.views.toLocaleString("en-IN")}</td>
                    <td className="py-3 pr-4 text-ink-700">{p.visitRequests}</td>
                    <td className="py-3 pr-4"><StatusPill status={p.status} /></td>
                    <td className="py-3 pr-4">
                      <Link to={`/dashboard/properties/${p.id}`} className="inline-flex items-center gap-1 text-gold-700 hover:underline">
                        <ArrowUpRight className="h-3.5 w-3.5" /> Metrics
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Leads + Site visit management */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2" id="leads">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-ink-900">Recent Leads</h3>
              <p className="text-[12px] text-ink-500">Enquiries on your properties — most recent first.</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-medium text-gold-800">
              <Inbox className="h-3 w-3" /> {enquiries.length} total
            </span>
          </div>
          {enquiries.length === 0 ? (
            <p className="mt-4 text-[13px] text-ink-500">No enquiries yet — they'll appear here as soon as buyers fill the form on your listings.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="text-ink-500">
                  <tr className="border-b border-ink-100">
                    <th className="py-2 pr-3 font-medium">Name</th>
                    <th className="py-2 pr-3 font-medium">Property</th>
                    <th className="py-2 pr-3 font-medium">Email / Phone</th>
                    <th className="py-2 pr-3 font-medium">Received</th>
                    <th className="py-2 pr-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.slice(0, 8).map((e) => (
                    <tr key={e.id} className="border-b border-ink-100/70 last:border-0">
                      <td className="py-2.5 pr-3 font-medium text-ink-900">{e.name}</td>
                      <td className="py-2.5 pr-3 text-ink-700">
                        {e.propertyTitle ? (
                          <Link to={`/dashboard/properties/${e.propertyId}`} className="hover:underline">{e.propertyTitle}</Link>
                        ) : "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-ink-700">
                        <div>{e.email}</div>
                        {e.phone && <div className="text-[11.5px] text-ink-500">{e.phone}</div>}
                      </td>
                      <td className="py-2.5 pr-3 text-ink-500">{relativeTime(e.createdAt)}</td>
                      <td className="py-2.5 pr-3">
                        <a href={`mailto:${e.email}?subject=${encodeURIComponent("RE: " + (e.propertyTitle || "Your enquiry"))}`} className="inline-flex items-center gap-1 text-gold-700 hover:underline">
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
          <h3 className="text-[14px] font-semibold text-ink-900">Site Visit Management</h3>
          <p className="text-[12px] text-ink-500">Confirmed and pending viewings</p>
          {enquiries.length === 0 ? (
            <p className="mt-4 text-[13px] text-ink-500">No visits scheduled.</p>
          ) : (
            <ul className="mt-3 space-y-3 text-[12.5px]">
              {enquiries.slice(0, 4).map((e, i) => {
                const slots = ["10:00 AM", "11:30 AM", "4:00 PM", "6:30 PM"];
                const d = new Date(); d.setDate(d.getDate() + (i + 1) * 2);
                const dateStr = `${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}, ${slots[i % 4]}`;
                const confirmed = i % 2 === 0;
                return (
                  <li key={e.id} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-100 text-[11px] font-semibold text-ink-800">
                        {e.name.split(" ").map((w) => w[0]).join("")}
                      </span>
                      <div>
                        <div className="font-medium text-ink-900">{e.name}</div>
                        <div className="text-[11px] text-ink-500"><Calendar className="mr-1 inline h-3 w-3" />{dateStr}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${confirmed ? "bg-sage-100 text-sage-800" : "bg-gold-100 text-gold-800"}`}>
                      {confirmed ? "Confirmed" : "Pending"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Quick actions + recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold text-ink-900">Quick Actions</h3>
          <p className="text-[12px] text-ink-500">Tools you reach for daily</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/dashboard/properties/new" className="btn-outline justify-start"><Plus className="h-4 w-4" /> Add Property</Link>
            <Link to="/dashboard/builder#leads" className="btn-outline justify-start"><Inbox className="h-4 w-4" /> View Leads</Link>
            <Link to="/dashboard/notifications" className="btn-outline justify-start"><Send className="h-4 w-4" /> Notifications</Link>
            <Link to="/dashboard/settings" className="btn-outline justify-start"><ShieldCheck className="h-4 w-4" /> Verify KYC</Link>
            <Link to="/properties" className="btn-outline justify-start col-span-2"><Eye className="h-4 w-4" /> Preview public marketplace</Link>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-[14px] font-semibold text-ink-900">Recent Activity</h3>
          <ul className="mt-3 space-y-3 text-[12.5px] text-ink-700">
            {notifications.slice(0, 6).map((n) => (
              <li key={n.id} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-gold-100 text-gold-800"><Users className="h-3.5 w-3.5" /></span>
                <div>
                  <div><span className="font-semibold">{n.title}</span></div>
                  {n.body && <div className="text-[11.5px] text-ink-500">{n.body}</div>}
                  <div className="text-[11px] text-ink-400">{relativeTime(n.createdAt)}</div>
                </div>
              </li>
            ))}
            {notifications.length === 0 && <li className="text-ink-500">Nothing yet — list your first property to seed activity.</li>}
          </ul>
        </div>

        <div className="card p-5">
          <h3 className="text-[14px] font-semibold text-ink-900">Top Performing Listing</h3>
          {properties.length === 0 ? (
            <p className="mt-3 text-[13px] text-ink-500">No listings yet.</p>
          ) : (() => {
            const top = [...properties].sort((a, b) => b.views - a.views)[0];
            return (
              <div className="mt-3">
                <div className="h-32 w-full rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${top.imageUrl})` }} />
                <Link to={`/dashboard/properties/${top.id}`} className="mt-3 block text-[14px] font-semibold text-ink-900 hover:underline">
                  {top.title}
                </Link>
                <div className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-ink-500">
                  <MapPin className="h-3 w-3" /> {top.location}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11.5px]">
                  <Tile k="Views" v={top.views} />
                  <Tile k="Visits" v={top.visitRequests} />
                  <Tile k="Saves" v={Math.round(top.views * 0.025)} />
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-ink-900">Monthly Activity</h3>
            <p className="text-[12px] text-ink-500">Listings published per month</p>
          </div>
        </div>
        <div className="mt-3">
          <BarChart values={monthBuckets} labels={labels} color="#cea735" />
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

function Tile({ k, v }) {
  return (
    <div className="rounded-lg border border-ink-100 px-2 py-2">
      <div className="font-display text-lg text-ink-900">{Number(v).toLocaleString("en-IN")}</div>
      <div className="text-[11px] text-ink-500">{k}</div>
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
