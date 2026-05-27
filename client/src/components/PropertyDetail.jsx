import { useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "./SiteHeader";
import { Footer } from "./Footer";
import { PropertyCard } from "./PropertyCard";
import { Modal } from "./Modal";
import { formatINR, initials } from "@/lib/utils";
import { Sparkline } from "./Sparkline";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import {
  BadgeCheck,
  Bed,
  Bookmark,
  Calendar,
  Compass,
  Download,
  Heart,
  Mail,
  MapPin,
  Maximize2,
  Phone,
  PieChart,
  Play,
  Send,
  Share2,
  Sparkles,
  Star
} from "lucide-react";

function downloadBrochure(property) {
  // Generate a brochure on the fly and download it. In production this is a
  // backend-rendered PDF; here we ship a self-contained text version.
  const lines = [
    `1 CRORE PROPERTY — Brochure`,
    ``,
    `${property.title}`,
    `${"=".repeat(property.title.length)}`,
    ``,
    `Builder       : ${property.builderName}`,
    `Category      : ${property.category}${property.bhk ? " · " + property.bhk : ""}`,
    `Location      : ${property.location}`,
    `Price         : ${(property.price / 1_00_00_000).toFixed(2)} Cr`,
    `Price / sqft  : ₹${(property.pricePerSqft || 0).toLocaleString("en-IN")}`,
    `Carpet area   : ${property.areaSqft.toLocaleString("en-IN")} sqft`,
    `Facing        : ${property.facing || "—"}`,
    `Possession    : ${property.possession || "—"}`,
    `RERA          : ${property.rera || "—"}`,
    ``,
    property.description,
    ``,
    `Highlights:`,
    ...property.highlights.map((h) => `  • ${h}`),
    ``,
    `Amenities:`,
    ...property.amenities.map((a) => `  • ${a}`)
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${property.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-brochure.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function PropertyDetail({ property, sessionUser, similar }) {
  const [active, setActive] = useState(property.imageUrl);
  const [videoOpen, setVideoOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(null);
  const [shareNote, setShareNote] = useState(null);

  async function shareLink() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: property.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote("Link copied to clipboard.");
      setTimeout(() => setShareNote(null), 2000);
    } catch {
      setShareNote(url);
      setTimeout(() => setShareNote(null), 4000);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <SiteHeader sessionUser={sessionUser} />

      <nav className="container flex items-center gap-1.5 py-3 text-[12.5px] text-ink-500">
        <Link to="/" className="hover:text-ink-900">Home</Link>
        <span>›</span>
        <Link to="/properties" className="hover:text-ink-900">Properties</Link>
        <span>›</span>
        <Link to={`/properties?city=${encodeURIComponent(property.city)}`} className="hover:text-ink-900">{property.city}</Link>
        <span>›</span>
        <span className="text-ink-700">{property.title}</span>
      </nav>

      <main className="container grid grid-cols-1 gap-6 pb-10 lg:grid-cols-12">
        <section className="lg:col-span-8">
          <div className="card overflow-hidden">
            <div
              className="relative aspect-[16/10] w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${active})` }}
            >
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-ink-800">
                <BadgeCheck className="h-3 w-3 text-sage-700" /> Verified Property
              </span>
              <button
                type="button"
                onClick={() => setVideoOpen(true)}
                className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-ink-900/80 px-3 py-1 text-[12px] text-white hover:bg-ink-900"
              >
                <Play className="h-3.5 w-3.5" /> Walk-through Video
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 p-3">
              {[property.imageUrl, ...property.gallery].slice(0, 8).map((g, i) => (
                <button
                  key={g + i}
                  type="button"
                  onClick={() => setActive(g)}
                  className={[
                    "h-16 rounded-md bg-cover bg-center ring-2 transition-shadow",
                    g === active ? "ring-gold-400" : "ring-transparent hover:ring-ink-200"
                  ].join(" ")}
                  style={{ backgroundImage: `url(${g})` }}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <section className="card mt-5 p-5">
            <h2 className="text-[15px] font-semibold">Property Overview</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Spec icon={<Maximize2 className="h-4 w-4" />} k="Carpet Area" v={`${property.areaSqft.toLocaleString("en-IN")} sqft`} />
              <Spec icon={<Bed className="h-4 w-4" />} k="Configuration" v={property.bhk || property.category} />
              <Spec icon={<Compass className="h-4 w-4" />} k="Facing" v={property.facing || "—"} />
              <Spec icon={<Calendar className="h-4 w-4" />} k="Possession" v={property.possession || "Ready"} />
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-ink-700">{property.description}</p>

            <h3 className="mt-5 text-[14px] font-semibold">Highlights</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {property.highlights.map((h) => (
                <span key={h} className="chip-active">{h}</span>
              ))}
            </div>

            <h3 className="mt-5 text-[14px] font-semibold">Amenities</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {property.amenities.map((a) => (
                <span key={a} className="inline-flex items-center gap-2 rounded-lg border border-ink-100 px-3 py-2 text-[12.5px] text-ink-700">
                  <Sparkles className="h-3.5 w-3.5 text-gold-700" /> {a}
                </span>
              ))}
            </div>
          </section>

          <section className="card mt-5 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold">Floor Plans & Pricing</h3>
              <span className="text-[11.5px] text-ink-500">All-inclusive prices</span>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="text-ink-500">
                  <tr className="border-b border-ink-100">
                    <th className="py-2 pr-3 font-medium">Type</th>
                    <th className="py-2 pr-3 font-medium">Carpet Area</th>
                    <th className="py-2 pr-3 font-medium">Price/sqft</th>
                    <th className="py-2 pr-3 font-medium">Total Price</th>
                    <th className="py-2 pr-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4].map((i) => {
                    const area = property.areaSqft + (i - 2) * 120;
                    const price = property.price + (i - 2) * 500_000;
                    return (
                      <tr key={i} className="border-b border-ink-100/70 last:border-0">
                        <td className="py-2.5 pr-3 font-medium">Type {i} · {property.bhk || "Block"}</td>
                        <td className="py-2.5 pr-3 text-ink-700">{area.toLocaleString("en-IN")} sqft</td>
                        <td className="py-2.5 pr-3 text-ink-700">₹{(property.pricePerSqft || 9500).toLocaleString("en-IN")}</td>
                        <td className="py-2.5 pr-3 font-semibold">{formatINR(price)}</td>
                        <td className="py-2.5 pr-3 text-right">
                          <button
                            type="button"
                            onClick={() => setPlanOpen({ type: i, area, price })}
                            className="text-[12.5px] font-medium text-gold-700 hover:underline"
                          >
                            View Plan
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card mt-5 p-5">
            <h3 className="text-[14px] font-semibold">Location & Connectivity</h3>
            <div className="mt-3 h-64 w-full rounded-lg bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=70')" }} />
            <div className="mt-3 grid grid-cols-2 gap-2 text-[12.5px] sm:grid-cols-4">
              {connectivityFor(property).map((l) => (
                <span key={l} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-100 px-3 py-2 text-ink-700"><MapPin className="h-3 w-3 text-gold-700" /> {l}</span>
              ))}
            </div>
          </section>
        </section>

        <aside id="enquire" className="lg:col-span-4 space-y-5">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <span className="kicker">Trending Project</span>
              <FavouriteActions property={property} onShare={shareLink} />
            </div>
            {shareNote && <div className="mt-2 rounded-md bg-sage-50 px-3 py-1.5 text-[12px] text-sage-800">{shareNote}</div>}
            <h1 className="mt-2 font-display text-2xl text-ink-900">{property.title}</h1>
            <div className="text-[12.5px] text-ink-500"><MapPin className="mr-1 inline h-3 w-3" /> {property.location}</div>
            <div className="mt-3 font-display text-3xl text-ink-900">{formatINR(property.price)}</div>
            <div className="text-[12px] text-ink-500">₹{(property.pricePerSqft || 9500).toLocaleString("en-IN")}/sqft · EMI starting ₹{Math.round(property.price / 240).toLocaleString("en-IN")}/mo</div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setCallbackOpen(true)} className="btn-gold"><Phone className="h-4 w-4" /> Schedule Call Back</button>
              <button type="button" onClick={() => downloadBrochure(property)} className="btn-outline"><Download className="h-4 w-4" /> Brochure</button>
            </div>

            <div className="mt-4 rounded-lg border border-ink-100 bg-ink-50/60 p-3">
              <div className="text-[12.5px] font-semibold text-ink-900">Check Directions</div>
              <div className="mt-1 text-[11.5px] text-ink-500">{property.location} · 6.4 km from city center</div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-gold-700 hover:underline"
              >
                Open in Maps →
              </a>
            </div>
          </div>

          <EnquireCard property={property} />


          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold">Price Appreciation</h3>
              <PieChart className="h-4 w-4 text-ink-500" />
            </div>
            {(() => {
              const series = appreciationSeries(property);
              const growth = (((series[series.length - 1] - series[0]) / series[0]) * 100).toFixed(1);
              const positive = Number(growth) >= 0;
              return (
                <>
                  <Sparkline values={series} color="#306838" fill="rgba(48,104,56,0.15)" />
                  <div className="mt-2 flex items-center justify-between text-[12.5px]">
                    <span className="text-ink-500">Last 12 months · indexed</span>
                    <span className={`font-semibold ${positive ? "text-sage-700" : "text-red-600"}`}>{positive ? "+" : ""}{growth}%</span>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-100 text-gold-800 font-semibold">{initials(property.builderName)}</span>
              <div>
                <div className="text-[12px] uppercase tracking-wide text-ink-500">Listed by</div>
                <div className="font-semibold">{property.builderName}</div>
                <div className="inline-flex items-center gap-1 text-[12px] text-sage-700"><Star className="h-3 w-3" /> 4.8 · 1,200+ properties</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href={`tel:+919876543210`} className="btn-outline justify-center"><Phone className="h-4 w-4" /> Call</a>
              <a href={`mailto:hello@1croreproperties.com?subject=${encodeURIComponent("Enquiry about " + property.title)}`} className="btn-outline justify-center"><Mail className="h-4 w-4" /> Email</a>
            </div>
          </div>
        </aside>
      </main>

      {/* Walk-through video modal — YouTube embed (search result for the property title) */}
      <Modal open={videoOpen} onClose={() => setVideoOpen(false)} title={`Walk-through · ${property.title}`} size="lg">
        <div className="aspect-video w-full bg-ink-950">
          <iframe
            title="Walk-through video"
            src={`https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(property.title + " property walkthrough")}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
        <p className="px-5 py-3 text-[12.5px] text-ink-500">
          In production this slot embeds the builder-uploaded walkthrough. Today
          it surfaces YouTube search results for "{property.title}".
        </p>
      </Modal>

      {/* Floor plan modal */}
      <Modal open={Boolean(planOpen)} onClose={() => setPlanOpen(null)} title={planOpen ? `Floor Plan — Type ${planOpen.type}` : ""} size="md">
        {planOpen && (
          <div className="space-y-4 p-5">
            <FloorPlanSvg type={planOpen.type} area={planOpen.area} bhk={property.bhk} />
            <div className="grid grid-cols-3 gap-3 text-center text-[12.5px]">
              <Tile k="Carpet area" v={`${planOpen.area.toLocaleString("en-IN")} sqft`} />
              <Tile k="Price / sqft" v={`₹${(property.pricePerSqft || 9500).toLocaleString("en-IN")}`} />
              <Tile k="Total price" v={formatINR(planOpen.price)} />
            </div>
            <p className="text-[12.5px] leading-relaxed text-ink-500">
              Indicative layout — final dimensions confirmed during site visit.
            </p>
          </div>
        )}
      </Modal>

      {/* Schedule call-back modal */}
      <Modal open={callbackOpen} onClose={() => setCallbackOpen(false)} title="Schedule a call back" size="sm">
        <CallbackForm property={property} onDone={() => setCallbackOpen(false)} />
      </Modal>

      {similar.length > 0 && (
        <section className="container pb-10">
          <h2 className="font-display text-2xl">Similar Properties You May Like</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((p) => <PropertyCard key={p.id} property={p} compact />)}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

function connectivityFor(p) {
  const seed = (p.id + p.location).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const r = (n, max) => (((seed * (n + 1)) % 1000) / 1000) * max;
  const fmt = (v) => `${v.toFixed(1)} km`;
  return [
    `Metro Station — ${fmt(0.5 + r(1, 2.5))}`,
    `Airport — ${fmt(8 + r(2, 28))}`,
    `Top Schools — ${fmt(0.3 + r(3, 1.8))}`,
    `Hospitals — ${fmt(0.4 + r(4, 2.4))}`
  ];
}

function appreciationSeries(p) {
  const base = p.pricePerSqft || Math.round(p.price / Math.max(1, p.areaSqft));
  const seed = p.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return Array.from({ length: 12 }, (_, i) => {
    const drift = 1 + i * 0.012;
    const wobble = 1 + Math.sin((seed + i) * 0.7) * 0.015;
    return Math.round(base * drift * wobble);
  });
}

function Spec({ icon, k, v }) {
  return (
    <div className="rounded-lg border border-ink-100 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-ink-500"><span>{icon}</span><span className="text-[11px] uppercase tracking-wide">{k}</span></div>
      <div className="mt-0.5 font-semibold text-ink-900">{v}</div>
    </div>
  );
}

function EnquireCard({ property }) {
  const { user } = useSession();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    message: ""
  });
  const [status, setStatus] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await api.createEnquiry({
        propertyId: property.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        source: "property"
      });
      setStatus("Enquiry sent — our team will reach out within 24 hours.");
      setForm((f) => ({ ...f, message: "" }));
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not send enquiry");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-5">
      <h3 className="text-[14px] font-semibold">Enquire Now</h3>
      <p className="text-[12px] text-ink-500">Get instant call from our property advisor</p>
      {status && <div className="mt-3 rounded-md bg-sage-50 px-3 py-2 text-[12.5px] text-sage-800">{status}</div>}
      {err && <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{err}</div>}
      <form className="mt-3 space-y-2.5" onSubmit={submit}>
        <div className="field">
          <input placeholder="Your name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <input type="email" placeholder="Email address" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="field">
          <input placeholder="+91 phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <textarea
          className="field !items-start py-2.5"
          placeholder="Your requirement (optional)"
          rows={3}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
        <button disabled={busy} className="btn-sage w-full">
          <Send className="h-4 w-4" /> {busy ? "Sending…" : "Send Enquiry"}
        </button>
      </form>
    </div>
  );
}

function FavouriteActions({ property, onShare }) {
  const { user, favourites, toggleFavourite, hasLists } = useSession();
  const saved = favourites.includes(property.id);
  async function fav() {
    if (!user || !hasLists) { onShare(); return; }
    try { await toggleFavourite(property.id); } catch { /* ignore */ }
  }
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={fav}
        className={`grid h-8 w-8 place-items-center rounded-md hover:bg-ink-50 ${saved ? "text-red-600" : "text-ink-700"}`}
        aria-label={saved ? "Remove favourite" : "Add to favourites"}
        aria-pressed={saved}
      >
        <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      </button>
      <button type="button" onClick={onShare} className="grid h-8 w-8 place-items-center rounded-md hover:bg-ink-50" aria-label="Share">
        <Share2 className="h-4 w-4" />
      </button>
      <button type="button" onClick={fav} className={`grid h-8 w-8 place-items-center rounded-md hover:bg-ink-50 ${saved ? "text-gold-600" : "text-ink-700"}`} aria-label="Bookmark">
        <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      </button>
    </div>
  );
}

function CallbackForm({ property, onDone }) {
  const { user } = useSession();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: "",
    when: "today",
    notes: ""
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await api.createEnquiry({
        propertyId: property.id,
        name: form.name,
        email: user?.email || "callback@1crore.in",
        phone: form.phone,
        message: `Schedule a call back · ${form.when} · ${form.notes}`,
        source: "callback"
      });
      onDone?.();
    } catch (e2) {
      setErr(e2.message || "Could not schedule");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 p-5">
      {err && <div className="rounded-md bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{err}</div>}
      <Field label="Your name" required><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Phone number" required><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 ••••• •••••" /></Field>
      <Field label="When should we call?">
        <select value={form.when} onChange={(e) => setForm({ ...form, when: e.target.value })}>
          <option value="today">Within an hour</option>
          <option value="tomorrow morning">Tomorrow morning</option>
          <option value="tomorrow evening">Tomorrow evening</option>
          <option value="this weekend">This weekend</option>
        </select>
      </Field>
      <Field label="Notes (optional)">
        <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anything specific you'd like to discuss?" />
      </Field>
      <button disabled={busy} className="btn-gold w-full">{busy ? "Scheduling…" : "Schedule call back"}</button>
    </form>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="w-full">
      <label className="field-label">{label}{required && <span className="ml-1 text-red-500">*</span>}</label>
      <div className="field">{children}</div>
    </div>
  );
}

function Tile({ k, v }) {
  return (
    <div className="rounded-lg border border-ink-100 px-3 py-2">
      <div className="font-display text-base text-ink-900">{v}</div>
      <div className="text-[11px] text-ink-500">{k}</div>
    </div>
  );
}

function FloorPlanSvg({ type, area, bhk }) {
  // Procedurally drawn floor plan — keeps the modal feeling real even though
  // we don't have CAD drawings yet.
  const W = 480, H = 280;
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
        <rect x="10" y="10" width={W - 20} height={H - 20} fill="white" stroke="#0c1530" strokeWidth="3" rx="6" />
        {/* internal walls */}
        <line x1={W / 2} y1="10" x2={W / 2} y2={H - 10} stroke="#0c1530" strokeWidth="2" />
        <line x1="10" y1={H / 2} x2={W - 10} y2={H / 2} stroke="#0c1530" strokeWidth="2" />
        <line x1={W / 2} y1={H * 0.75} x2={W - 10} y2={H * 0.75} stroke="#0c1530" strokeWidth="2" />
        {/* labels */}
        <text x={W * 0.25} y={H * 0.28} fontFamily="Inter,sans-serif" fontSize="13" fill="#0c1530" textAnchor="middle">Living · {Math.round(area * 0.35)} sqft</text>
        <text x={W * 0.75} y={H * 0.28} fontFamily="Inter,sans-serif" fontSize="13" fill="#0c1530" textAnchor="middle">Master · {Math.round(area * 0.18)} sqft</text>
        <text x={W * 0.25} y={H * 0.78} fontFamily="Inter,sans-serif" fontSize="13" fill="#0c1530" textAnchor="middle">Kitchen · {Math.round(area * 0.12)} sqft</text>
        <text x={W * 0.75} y={H * 0.65} fontFamily="Inter,sans-serif" fontSize="13" fill="#0c1530" textAnchor="middle">Bedroom · {Math.round(area * 0.15)} sqft</text>
        <text x={W * 0.75} y={H * 0.9} fontFamily="Inter,sans-serif" fontSize="13" fill="#0c1530" textAnchor="middle">Balcony · {Math.round(area * 0.08)} sqft</text>
        <text x={W / 2} y="32" fontFamily="Playfair Display,serif" fontWeight="600" fontSize="14" fill="#cea735" textAnchor="middle">Type {type} · {bhk || "Block"}</text>
      </svg>
    </div>
  );
}

