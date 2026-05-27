import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plane, Globe2, Banknote, Lock, ShieldCheck } from "lucide-react";
import { SelectField, TextField, UploadField } from "./FormField";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";

export function NRIRegister() {
  const navigate = useNavigate();
  const { refresh } = useSession();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "United States",
    passportNumber: "",
    nriCategory: "Investor",
    panNumber: "",
    preferredCity: "Hyderabad",
    investmentRange: "₹2 Cr – ₹5 Cr",
    fundingSource: "NRE Account",
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
    if (form.password !== form.confirm) return setErr("Passwords do not match");
    if (!form.accept) return setErr("Please accept the terms to continue");
    setBusy(true);
    try {
      const data = await api.register({
        role: "nri",
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        country: form.country,
        preferredCity: form.preferredCity,
        investmentRange: form.investmentRange
      });
      await refresh();
      navigate(data.redirect || "/dashboard/nri");
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
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-100 text-gold-700">
            <Plane className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-2xl leading-tight">NRI Terminal Registration</h2>
            <p className="text-[12.5px] text-ink-500">
              For Non-Resident Indian investors. We unlock the NRI Terminal — currency, repatriation,
              and investment-grade analytics.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-6 py-6 sm:px-8">
        {err && <div className="rounded-md bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{err}</div>}

        <Section title="Account Information" icon={<Globe2 className="h-4 w-4" />} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField required label="Full Name" placeholder="As on passport" value={form.name} onChange={(e) => up("name", e.target.value)} />
          <TextField required label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => up("email", e.target.value)} />
          <TextField label="Mobile Number (with country code)" placeholder="+1 408 555 0182" value={form.phone} onChange={(e) => up("phone", e.target.value)} />
          <SelectField label="Country of Residence" value={form.country} onChange={(e) => up("country", e.target.value)}>
            {["United States", "United Kingdom", "United Arab Emirates", "Canada", "Australia", "Singapore", "Germany", "Other"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </SelectField>
          <TextField label="Passport Number" placeholder="A1234567" value={form.passportNumber} onChange={(e) => up("passportNumber", e.target.value)} />
          <TextField label="PAN Card (India)" placeholder="ABCDE1234F" value={form.panNumber} onChange={(e) => up("panNumber", e.target.value)} />
        </div>

        <Section title="Investment Preferences" icon={<Banknote className="h-4 w-4" />} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField label="NRI Category" value={form.nriCategory} onChange={(e) => up("nriCategory", e.target.value)}>
            {["Investor", "End User", "Both"].map((c) => <option key={c}>{c}</option>)}
          </SelectField>
          <SelectField label="Preferred City in India" value={form.preferredCity} onChange={(e) => up("preferredCity", e.target.value)}>
            {["Hyderabad", "Bengaluru", "Mumbai", "Pune", "Chennai", "Delhi NCR", "Kolkata"].map((c) => <option key={c}>{c}</option>)}
          </SelectField>
          <SelectField label="Investment Range" value={form.investmentRange} onChange={(e) => up("investmentRange", e.target.value)}>
            {["₹50 L – ₹1 Cr", "₹1 Cr – ₹2 Cr", "₹2 Cr – ₹5 Cr", "₹5 Cr – ₹10 Cr", "Above ₹10 Cr"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </SelectField>
          <SelectField label="Funding Source" value={form.fundingSource} onChange={(e) => up("fundingSource", e.target.value)}>
            {["NRE Account", "NRO Account", "FCNR Account", "Foreign Currency Loan"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </SelectField>
          <UploadField label="Passport Front (Optional)" />
          <UploadField label="Visa / OCI / PIO Card (Optional)" />
        </div>

        <Section title="Security" icon={<Lock className="h-4 w-4" />} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField required label="Password" type="password" placeholder="Create a password" value={form.password} onChange={(e) => up("password", e.target.value)} />
          <TextField required label="Confirm Password" type="password" placeholder="Confirm your password" value={form.confirm} onChange={(e) => up("confirm", e.target.value)} />
        </div>

        <label className="flex items-start gap-2 text-[13px] text-ink-700">
          <input type="checkbox" checked={form.accept} onChange={(e) => up("accept", e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-gold-500" />
          I confirm I am a Non-Resident Indian and accept the
          <Link to="/legal/terms" className="font-medium text-gold-700 hover:underline"> NRI Terms</Link> and
          <Link to="/legal/privacy" className="font-medium text-gold-700 hover:underline"> Privacy Policy</Link>.
        </label>

        <button disabled={busy} className="btn-gold w-full">
          <ShieldCheck className="h-4 w-4" />
          {busy ? "Creating account…" : "Activate NRI Terminal"}
        </button>

        <div className="text-center text-[12.5px] text-ink-500">
          Already have an account? <Link to="/" className="font-medium text-gold-700 hover:underline">Login</Link>
        </div>
      </div>
    </form>
  );
}

function Section({ title, icon }) {
  return (
    <div className="flex items-center gap-2.5 pt-1">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-gold-100 text-gold-700">{icon}</span>
      <h3 className="text-[14.5px] font-semibold text-ink-900">{title}</h3>
    </div>
  );
}
