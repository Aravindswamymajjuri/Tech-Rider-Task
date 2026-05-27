import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ImagePlus, MapPin, Sparkles, ShieldCheck, Send, Compass, BadgeCheck, FileCheck2 } from "lucide-react";
import { SelectField, TextArea, TextField, UploadField, Label } from "./FormField";
import { api } from "@/lib/api";

const SECTIONS = [
  { key: "basic", title: "Basic Details", icon: <Building2 className="h-4 w-4" /> },
  { key: "media", title: "Media & Visuals", icon: <ImagePlus className="h-4 w-4" /> },
  { key: "location", title: "Location & Pricing", icon: <MapPin className="h-4 w-4" /> },
  { key: "compare", title: "Compare & Boost", icon: <Sparkles className="h-4 w-4" /> }
];

export function AddPropertyForm() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [form, setForm] = useState({
    title: "",
    project: "",
    type: "apartment",
    config: "3 BHK",
    listingFor: "Sale",
    waterSupply: "Municipal + Borewell",
    walkthroughVideo: "",
    droneView: "",
    matterportUrl: "",
    address: "",
    city: "Hyderabad",
    state: "Telangana",
    landmark: "",
    facing: "East",
    pricePerSqft: 9500,
    price: 19500000,
    areaSqft: 1980,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    bestTime: "Anytime",
    additionalCity: "",
    description: ""
  });

  function up(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const data = await api.createProperty({
        title: form.title || form.project,
        category: form.type,
        bhk: form.type === "plot" ? undefined : form.config,
        city: form.city,
        location: `${form.address}, ${form.city}`,
        price: Number(form.price),
        areaSqft: Number(form.areaSqft),
        pricePerSqft: Number(form.pricePerSqft),
        facing: form.facing,
        description: form.description,
        amenities: [],
        highlights: ["New Listing"]
      });
      navigate(`/dashboard/properties/${data.property.id}`);
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Failed to add property");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <aside className="card sticky top-20 h-max p-4 xl:col-span-3">
        <ol className="space-y-1.5">
          {SECTIONS.map((s, i) => (
            <li key={s.key} className="flex items-center gap-3 rounded-lg px-2 py-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gold-100 text-gold-700">{s.icon}</span>
              <span className="text-[13px] font-medium text-ink-800">{i + 1}. {s.title}</span>
            </li>
          ))}
        </ol>
        <div className="mt-3 rounded-lg border border-ink-100 bg-ink-50/60 p-3 text-[12px] text-ink-600">
          Listings on 1 Crore Property go through a manual review (≤ 24 hrs) before being published.
        </div>
      </aside>

      <div className="space-y-6 xl:col-span-9">
        {err && <div className="rounded-md bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{err}</div>}

        <Block title="Basic Details" icon={<Building2 className="h-4 w-4" />}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField required label="Property Title" placeholder="e.g., Premium Sky Tower 3 BHK" value={form.title} onChange={(e) => up("title", e.target.value)} />
            <TextField label="Project / Society Name" placeholder="e.g., Skyline Crest" value={form.project} onChange={(e) => up("project", e.target.value)} />
            <SelectField label="Property Type" value={form.type} onChange={(e) => up("type", e.target.value)}>
              {[
                ["apartment", "Apartment / Flat"],
                ["villa", "Villa"],
                ["independent", "Independent House"],
                ["plot", "Open Plot"],
                ["commercial", "Commercial"]
              ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </SelectField>
            <SelectField label="Configuration" value={form.config} onChange={(e) => up("config", e.target.value)} disabled={form.type === "plot"}>
              {["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK"].map((c) => <option key={c}>{c}</option>)}
            </SelectField>
            <SelectField label="Listing For" value={form.listingFor} onChange={(e) => up("listingFor", e.target.value)}>
              {["Sale", "Rent"].map((c) => <option key={c}>{c}</option>)}
            </SelectField>
            <SelectField label="Water Supply" value={form.waterSupply} onChange={(e) => up("waterSupply", e.target.value)}>
              {["Municipal Only", "Borewell Only", "Municipal + Borewell"].map((c) => <option key={c}>{c}</option>)}
            </SelectField>
          </div>
        </Block>

        <Block title="Media & Visuals" icon={<ImagePlus className="h-4 w-4" />}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Walkthrough Video URL" placeholder="https://youtube.com/…" value={form.walkthroughVideo} onChange={(e) => up("walkthroughVideo", e.target.value)} />
            <TextField label="Drone View URL" placeholder="https://vimeo.com/…" value={form.droneView} onChange={(e) => up("droneView", e.target.value)} />
            <TextField label="Matterport / 360° tour" placeholder="https://my.matterport.com/…" value={form.matterportUrl} onChange={(e) => up("matterportUrl", e.target.value)} />
          </div>
          <div>
            <Label>Project Images</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <label key={i} className="flex h-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-ink-200 bg-ink-50/60 text-[11px] text-ink-500 hover:border-gold-400 hover:bg-gold-50/40">
                  + Upload image
                  <input type="file" className="hidden" />
                </label>
              ))}
            </div>
          </div>
        </Block>

        <Block title="Location & Pricing" icon={<MapPin className="h-4 w-4" />}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Address Line" required placeholder="Street, sector, area" value={form.address} onChange={(e) => up("address", e.target.value)} />
            <TextField label="Landmark" placeholder="Nearby landmark" value={form.landmark} onChange={(e) => up("landmark", e.target.value)} />
            <SelectField label="City" value={form.city} onChange={(e) => up("city", e.target.value)}>
              {["Hyderabad", "Bengaluru", "Mumbai", "Pune", "Chennai", "Delhi NCR"].map((c) => <option key={c}>{c}</option>)}
            </SelectField>
            <SelectField label="State" value={form.state} onChange={(e) => up("state", e.target.value)}>
              {["Telangana", "Karnataka", "Maharashtra", "Tamil Nadu", "Delhi"].map((c) => <option key={c}>{c}</option>)}
            </SelectField>
            <SelectField label="Facing" value={form.facing} onChange={(e) => up("facing", e.target.value)}>
              {["East", "West", "North", "South", "North-East", "South-West"].map((c) => <option key={c}>{c}</option>)}
            </SelectField>
            <TextField type="number" label="Carpet Area (sqft)" required value={form.areaSqft} onChange={(e) => up("areaSqft", Number(e.target.value))} />
            <TextField type="number" label="Price per sqft (₹)" value={form.pricePerSqft} onChange={(e) => up("pricePerSqft", Number(e.target.value))} />
            <TextField type="number" label="Total Price (₹)" required value={form.price} onChange={(e) => up("price", Number(e.target.value))} />
          </div>
          <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-4">
            <div className="flex items-center gap-2 text-[12.5px] text-ink-700">
              <Compass className="h-4 w-4 text-gold-700" />
              Preview map will appear here once you save the address — interactive map view powered by OpenStreetMap.
            </div>
          </div>
        </Block>

        <Block title="Point of Contact at Property" icon={<BadgeCheck className="h-4 w-4" />}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Name" placeholder="Site contact name" value={form.contactName} onChange={(e) => up("contactName", e.target.value)} />
            <TextField label="Phone" placeholder="+91 ••••• •••••" value={form.contactPhone} onChange={(e) => up("contactPhone", e.target.value)} />
            <TextField label="Email" type="email" placeholder="contact@example.com" value={form.contactEmail} onChange={(e) => up("contactEmail", e.target.value)} />
            <SelectField label="Best Time to Visit" value={form.bestTime} onChange={(e) => up("bestTime", e.target.value)}>
              {["Anytime", "Morning (10 - 12)", "Afternoon (12 - 4)", "Evening (4 - 7)"].map((c) => <option key={c}>{c}</option>)}
            </SelectField>
          </div>
        </Block>

        <Block title="Additional Details" icon={<FileCheck2 className="h-4 w-4" />}>
          <TextArea label="Description" placeholder="Tell buyers about this property — highlights, neighborhood, possession date…" value={form.description} onChange={(e) => up("description", e.target.value)} />
          <UploadField label="RERA Approval Document (Optional)" />
        </Block>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white p-4">
          <label className="flex items-center gap-2 text-[12.5px] text-ink-700">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-ink-300 accent-gold-500" />
            I confirm all the information provided is accurate and ready to be reviewed.
          </label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => alert("Draft saved locally (demo)")} className="btn-outline">Save as Draft</button>
            <button disabled={busy} type="submit" className="btn-gold">
              <ShieldCheck className="h-4 w-4" />
              {busy ? "Submitting…" : "Submit Property"}
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Block({ title, icon, children }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-gold-100 text-gold-700">{icon}</span>
        <h2 className="text-[14.5px] font-semibold text-ink-900">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
