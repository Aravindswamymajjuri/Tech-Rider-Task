import { Link } from "react-router-dom";
import { DashboardShell, NavLink } from "@/components/DashboardShell";
import { BarChart, Donut, Sparkline } from "@/components/Sparkline";
import { formatINR } from "@/lib/utils";
import { ArrowLeft, BadgeCheck, Calendar, Eye, Heart, MapPin, Phone, ShieldCheck, Users } from "lucide-react";

const MONTH_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function trailingMonths(now, n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return MONTH_LABELS[d.getMonth()];
  });
}

function viewSeries(totalViews, n = 12) {
  const target = Math.max(12, Math.round(totalViews / 4));
  return Array.from({ length: n }, (_, i) => {
    const ratio = (i + 1) / n;
    return Math.max(1, Math.round(target * ratio));
  });
}

export function PropertyDashboard({ user, property, leads }) {
  const downloads = property.brochureDownloads;
  const visits = property.visitRequests;
  const series = viewSeries(property.views);
  const labels = trailingMonths(new Date(), series.length);
  const saved = Math.round(property.views * 0.025);
  const engagedLeads = leads.length + Math.round(property.brochureDownloads / 4);
  const verifiedInquiries = Math.round(visits * 1.4);

  return (
    <DashboardShell
      user={user}
      tone="gold"
      nav={
        <>
          <NavLink to="/dashboard/admin">Overview</NavLink>
          <NavLink to="/properties">Properties</NavLink>
          <NavLink to="/dashboard/properties/new">Add Property</NavLink>
        </>
      }
    >
      <Link to="/dashboard/admin" className="inline-flex items-center gap-2 text-[12.5px] text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
      </Link>

      <section className="card overflow-hidden">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
          <div className="h-44 w-full bg-cover bg-center md:h-full" style={{ backgroundImage: `url(${property.imageUrl})` }} />
          <div className="md:col-span-2 p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-[12px] uppercase tracking-wide text-ink-400">{property.category}</div>
                <h1 className="font-display text-2xl text-ink-900">{property.title}</h1>
                <div className="mt-0.5 inline-flex items-center gap-1 text-[13px] text-ink-500">
                  <MapPin className="h-3.5 w-3.5" /> {property.location}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl text-ink-900">{formatINR(property.price)}</div>
                <div className="text-[11.5px] text-ink-500">RERA: {property.rera || "—"}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Stat icon={<Eye className="h-4 w-4" />} v={property.views.toString()} l="Total Views" />
              <Stat icon={<BadgeCheck className="h-4 w-4" />} v={downloads.toString()} l="Brochure Downloads" />
              <Stat icon={<Phone className="h-4 w-4" />} v={visits.toString()} l="Visit Requests" />
              <Stat icon={<Heart className="h-4 w-4" />} v={saved.toString()} l="Saved by Buyers" />
              <Stat icon={<Users className="h-4 w-4" />} v={engagedLeads.toString()} l="Engaged Leads" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold">User Engagement Overview</h2>
              <p className="text-[12px] text-ink-500">Views, downloads & visit requests over the last 12 months</p>
            </div>
            <span className="rounded-md border border-ink-200 px-2 py-1 text-[12px] text-ink-600">Last 12 Months</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-ink-600">
            <Legend dot="#cea735" label="Views" />
            <Legend dot="#65a266" label="Brochure Downloads" />
            <Legend dot="#9683ff" label="Visit Requests" />
          </div>
          <div className="mt-2 space-y-2">
            <Sparkline values={series} color="#cea735" fill="rgba(206,167,53,0.18)" height={120} />
            <Sparkline values={series.map((v) => Math.round(v * (downloads / Math.max(1, property.views))))} color="#65a266" fill="rgba(101,162,102,0.18)" height={70} />
            <Sparkline values={series.map((v) => Math.round(v * (visits / Math.max(1, property.views))))} color="#9683ff" fill="rgba(150,131,255,0.18)" height={50} />
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-[15px] font-semibold">Audience Insights</h2>
          <p className="text-[12px] text-ink-500">Where engagement comes from</p>
          <div className="mt-3">
            <Donut
              segments={[
                { label: "Buyers", value: Math.max(1, leads.filter((l) => l.source !== "NRI Terminal").length * 38), color: "#cea735" },
                { label: "NRIs", value: Math.max(1, leads.filter((l) => l.source === "NRI Terminal").length * 27 + 8), color: "#9683ff" },
                { label: "Investors", value: Math.max(1, Math.round(visits * 0.5)), color: "#65a266" },
                { label: "Others", value: Math.max(1, Math.round(visits * 0.3)), color: "#94a3b8" }
              ]}
              centerLabel={{ value: property.views.toLocaleString("en-IN"), label: "Visitors" }}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <h3 className="text-[14px] font-semibold">Recent Leads & Activities</h3>
          <table className="mt-3 w-full text-left text-[13px]">
            <thead className="text-ink-500">
              <tr className="border-b border-ink-100">
                <th className="py-2 pr-3 font-medium">Name</th>
                <th className="py-2 pr-3 font-medium">Email</th>
                <th className="py-2 pr-3 font-medium">Source</th>
                <th className="py-2 pr-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((r) => (
                <tr key={r.email} className="border-b border-ink-100/70 last:border-0">
                  <td className="py-2.5 pr-3 font-medium text-ink-900">{r.name}</td>
                  <td className="py-2.5 pr-3 text-ink-700">{r.email}</td>
                  <td className="py-2.5 pr-3 text-ink-700">{r.source}</td>
                  <td className="py-2.5 pr-3">
                    <span className="inline-flex items-center rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-medium text-gold-800">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan={4} className="py-3 pr-3 text-ink-500">No leads yet — share the brochure link to attract enquiries.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <h3 className="text-[14px] font-semibold">Site Visit Management</h3>
          <ul className="mt-3 space-y-3 text-[12.5px]">
            {leads.slice(0, 4).map((v, i) => {
              const slots = ["10:00 AM", "11:30 AM", "4:00 PM", "6:30 PM"];
              const date = new Date();
              date.setDate(date.getDate() + (i + 1) * 2);
              const dateStr = `${date.getDate()} ${date.toLocaleString("en-US", { month: "short" })}, ${slots[i % slots.length]}`;
              const confirmed = i % 2 === 0;
              return (
                <li key={v.email} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-100 text-[11px] font-semibold text-ink-800">
                      {v.name.split(" ").map((p) => p[0]).join("")}
                    </span>
                    <div>
                      <div className="font-medium text-ink-900">{v.name}</div>
                      <div className="text-[11px] text-ink-500"><Calendar className="mr-1 inline h-3 w-3" />{dateStr}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${confirmed ? "bg-sage-100 text-sage-800" : "bg-gold-100 text-gold-800"}`}>
                    {confirmed ? "Confirmed" : "Pending"}
                  </span>
                </li>
              );
            })}
            {leads.length === 0 && <li className="text-ink-500">No visits scheduled yet.</li>}
          </ul>
        </div>
      </section>

      <section className="card p-5">
        <h3 className="text-[14px] font-semibold">Who's Engaging With Your Property</h3>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Engage icon={<Eye className="h-4 w-4" />} v={property.views.toString()} l="Views" />
          <Engage icon={<BadgeCheck className="h-4 w-4" />} v={downloads.toString()} l="Brochure Downloads" />
          <Engage icon={<Phone className="h-4 w-4" />} v={visits.toString()} l="Visit Requests" />
          <Engage icon={<ShieldCheck className="h-4 w-4" />} v={verifiedInquiries.toString()} l="Verified Inquiries" />
        </div>
        <div className="mt-4">
          <BarChart values={series} labels={labels} color="#cea735" />
        </div>
      </section>
    </DashboardShell>
  );
}

function Stat({ icon, v, l }) {
  return (
    <div className="rounded-lg border border-ink-100 px-3 py-2">
      <div className="flex items-center gap-1.5 text-ink-500">
        {icon}
        <span className="text-[11px] uppercase tracking-wide">{l}</span>
      </div>
      <div className="mt-0.5 font-display text-xl">{v}</div>
    </div>
  );
}

function Engage({ icon, v, l }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/40 p-4">
      <div className="flex items-center gap-2 text-gold-800"><span className="grid h-7 w-7 place-items-center rounded-md bg-gold-100">{icon}</span><span className="text-[12px] font-semibold uppercase tracking-wide text-ink-700">{l}</span></div>
      <div className="mt-2 font-display text-2xl text-ink-900">{v}</div>
    </div>
  );
}

function Legend({ dot, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: dot }} /> {label}
    </span>
  );
}
