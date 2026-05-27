import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Home, LandPlot, TreePine, MapPin, ShieldCheck, FileCheck2, UserCircle2, Compass, Lock } from "lucide-react";
import { SelectField, TextField, UploadField } from "./FormField";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";

const KIND_META = {
  apartment: { title: "Apartment / Flat", icon: <Building2 className="h-4 w-4" /> },
  villa: { title: "Villa", icon: <Home className="h-4 w-4" /> },
  plot: { title: "Open Plot / Land", icon: <LandPlot className="h-4 w-4" /> },
  independent: { title: "Independent House", icon: <TreePine className="h-4 w-4" /> }
};

const propertyTypeChips = [
  { key: "north", label: "North", icon: <Compass className="h-4 w-4" /> },
  { key: "east", label: "East", icon: <Compass className="h-4 w-4" /> },
  { key: "west", label: "West", icon: <Compass className="h-4 w-4" /> },
  { key: "south", label: "South", icon: <Compass className="h-4 w-4" /> }
];

export function BuyerRegister({ initialType }) {
  const [kind, setKind] = useState(initialType ?? "apartment");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();
  const { refresh } = useSession();

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    dob: "",
    gender: "",
    nationality: "Indian",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    budgetMin: 5_000_000,
    budgetMax: 15_000_000,
    preferredLocation: "",
    amenities: [],
    facing: "east",
    purpose: "Self Use",
    panNumber: "",
    aadhaar: "",
    password: "",
    confirm: "",
    accept: false
  });

  function up(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    if (form.password !== form.confirm) {
      setErr("Passwords do not match");
      return;
    }
    if (!form.accept) {
      setErr("Please accept the terms to continue");
      return;
    }
    setBusy(true);
    try {
      const data = await api.register({
        role: "buyer",
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.mobile,
        city: form.city,
        category: kind,
        budgetMin: form.budgetMin,
        budgetMax: form.budgetMax,
        preferences: form.amenities
      });
      await refresh();
      navigate(data.redirect || "/dashboard/buyer");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card bg-white text-ink-900 shadow-ring">
      <div className="border-b border-ink-100 px-6 pb-5 pt-6 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-sage-100 text-sage-700">
            <UserCircle2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-2xl leading-tight">Customer Registration</h2>
            <p className="text-[12.5px] text-ink-500">
              Create your account and let us know what you are looking for. We will help you find the perfect property fit.
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {["plot", "villa", "apartment", "independent"].map((k) => {
            const active = k === kind;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={[
                  "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-medium transition-colors",
                  active
                    ? "border-sage-400 bg-sage-50 text-sage-800 ring-1 ring-sage-300"
                    : "border-ink-200 text-ink-700 hover:border-ink-300"
                ].join(" ")}
              >
                {KIND_META[k].icon}
                {KIND_META[k].title}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6 px-6 py-6 sm:px-8">
        {err && <div className="rounded-md bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{err}</div>}

        <SectionTitle icon={<UserCircle2 className="h-4 w-4" />} title="1. Personal Information" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField required label="Full Name" placeholder="Enter your full name" value={form.name} onChange={(e) => up("name", e.target.value)} />
          <TextField required label="Mobile Number" placeholder="+91 ••••• •••••" value={form.mobile} onChange={(e) => up("mobile", e.target.value)} />
          <TextField required label="Email Address" type="email" placeholder="Enter your email address" value={form.email} onChange={(e) => up("email", e.target.value)} />
          <TextField label="Date of Birth" type="date" value={form.dob} onChange={(e) => up("dob", e.target.value)} />
          <SelectField label="Gender" value={form.gender} onChange={(e) => up("gender", e.target.value)}>
            <option value="">Select gender</option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </SelectField>
          <SelectField label="Nationality" value={form.nationality} onChange={(e) => up("nationality", e.target.value)}>
            {["Indian", "American", "British", "Canadian", "Australian", "Singaporean", "Other"].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </SelectField>
        </div>

        <SectionTitle icon={<MapPin className="h-4 w-4" />} title="2. Address Information" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField label="Address Line 1" placeholder="House / Flat no., Building name" value={form.address1} onChange={(e) => up("address1", e.target.value)} />
          <TextField label="Address Line 2 (Optional)" placeholder="Area, Street, Sector" value={form.address2} onChange={(e) => up("address2", e.target.value)} />
          <TextField label="City" placeholder="City" value={form.city} onChange={(e) => up("city", e.target.value)} />
          <TextField label="Pincode" placeholder="Pincode" value={form.pincode} onChange={(e) => up("pincode", e.target.value)} />
          <SelectField label="State" value={form.state} onChange={(e) => up("state", e.target.value)}>
            <option value="">Select state</option>
            {["Telangana", "Karnataka", "Maharashtra", "Tamil Nadu", "Delhi", "Gujarat"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </SelectField>
          <SelectField label="Country" value={form.country} onChange={(e) => up("country", e.target.value)}>
            {["India", "United States", "United Kingdom", "United Arab Emirates", "Singapore"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </SelectField>
          <label className="col-span-full mt-1 flex items-center gap-2 text-[12.5px] text-ink-600">
            <input type="checkbox" className="h-4 w-4 rounded border-ink-300 accent-sage-500" /> Same as Above (Permanent address)
          </label>
        </div>

        <SectionTitle
          icon={KIND_META[kind].icon}
          title={`3. ${kind === "plot" ? "Open Plot" : kind === "villa" ? "Villa" : kind === "independent" ? "Independent House" : "Property"} Requirements`}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kind !== "plot" && (
            <SelectField label="BHK Configuration" defaultValue="3 BHK">
              {["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK"].map((s) => <option key={s}>{s}</option>)}
            </SelectField>
          )}
          <SelectField label="Plot Area / Carpet Area" defaultValue="1500-2000 sqft">
            {["Below 800 sqft","800-1200 sqft","1200-1500 sqft","1500-2000 sqft","2000-3000 sqft","Above 3000 sqft"].map((s) => <option key={s}>{s}</option>)}
          </SelectField>
          <SelectField label="Budget Range">
            {["₹50 L – ₹1 Cr","₹1 Cr – ₹2 Cr","₹2 Cr – ₹5 Cr","₹5 Cr – ₹10 Cr","Above ₹10 Cr"].map((s) => <option key={s}>{s}</option>)}
          </SelectField>
          <TextField label="Preferred Location" placeholder="Hyderabad, Bengaluru…" value={form.preferredLocation} onChange={(e) => up("preferredLocation", e.target.value)} />
          <SelectField label="Purpose">
            {["Self Use", "Investment", "Rental Income", "Resale"].map((s) => <option key={s}>{s}</option>)}
          </SelectField>
          <div>
            <div className="field-label">Preferred Facing</div>
            <div className="grid grid-cols-4 gap-2">
              {propertyTypeChips.map((p) => {
                const active = form.facing === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => up("facing", p.key)}
                    className={[
                      "inline-flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[12px]",
                      active ? "border-sage-400 bg-sage-50 text-sage-800" : "border-ink-200 text-ink-700"
                    ].join(" ")}
                  >
                    {p.icon}
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="field-label">Amenities Preference (Optional)</div>
          <div className="flex flex-wrap gap-2">
            {["Gated Community","Swimming Pool","Gym","Clubhouse","Kids Play","24x7 Security","Power Backup","EV Charging","Sports Area"].map((a) => {
              const active = form.amenities.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() =>
                    up("amenities", active ? form.amenities.filter((x) => x !== a) : [...form.amenities, a])
                  }
                  className={active ? "chip-active" : "chip"}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </div>

        <SectionTitle icon={<FileCheck2 className="h-4 w-4" />} title="4. Identity Information (Optional)" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField label="PAN Card (Optional)" placeholder="ABCDE1234F" value={form.panNumber} onChange={(e) => up("panNumber", e.target.value)} />
          <TextField label="Aadhaar Card (Optional)" placeholder="XXXX XXXX XXXX" value={form.aadhaar} onChange={(e) => up("aadhaar", e.target.value)} />
          <UploadField label="Aadhaar Card (Optional)" />
        </div>

        <SectionTitle icon={<Lock className="h-4 w-4" />} title="5. Security" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TextField required label="Password" type="password" placeholder="Create a password" value={form.password} onChange={(e) => up("password", e.target.value)} />
          <TextField required label="Confirm Password" type="password" placeholder="Confirm your password" value={form.confirm} onChange={(e) => up("confirm", e.target.value)} />
        </div>

        <label className="flex items-start gap-2 text-[13px] text-ink-700">
          <input type="checkbox" checked={form.accept} onChange={(e) => up("accept", e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-sage-500" />
          I agree to the <Link to="/legal/terms" className="font-medium text-sage-700 hover:underline">Terms & Conditions</Link> and <Link to="/legal/privacy" className="font-medium text-sage-700 hover:underline">Privacy Policy</Link>
        </label>

        <button type="submit" disabled={busy} className="btn-sage w-full">
          <ShieldCheck className="h-4 w-4" />
          {busy ? "Creating account…" : "Create Account"}
        </button>

        <div className="text-center text-[12.5px] text-ink-500">
          Already have an account? <Link to="/" className="font-medium text-sage-700 hover:underline">Login</Link>
        </div>
      </div>
    </form>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-sage-100 text-sage-700">{icon}</span>
      <h3 className="text-[14.5px] font-semibold text-ink-900">{title}</h3>
    </div>
  );
}
