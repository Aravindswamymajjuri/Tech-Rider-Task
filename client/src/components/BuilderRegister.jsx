import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeCheck, Building2, ClipboardCheck, FileCheck2, MapPin, ShieldCheck, Send, UserCog } from "lucide-react";
import { Stepper } from "./Stepper";
import { SelectField, TextField, UploadField } from "./FormField";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";

const steps = ["Account Details", "Company Details", "Verification"];

export function BuilderRegister() {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();
  const { refresh } = useSession();

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    gstin: "",
    rera: "",
    officeAddress: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    authorizedName: "",
    designation: "",
    panNumber: "",
    aadhaar: "",
    accept: false,
    accept2: false
  });

  function up(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function next() {
    if (step === 0) {
      if (!form.name || !form.email || !form.password || form.password !== form.confirm) {
        setErr("Please complete all required fields and make sure passwords match");
        return;
      }
      if (!form.accept) {
        setErr("You must accept the Terms & Privacy Policy to continue");
        return;
      }
    }
    setErr(null);
    setStep((s) => Math.min(2, s + 1));
  }
  function back() {
    setErr(null);
    setStep((s) => Math.max(0, s - 1));
  }

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      const data = await api.register({
        role: "builder",
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        company: form.company,
        rera: form.rera,
        gstin: form.gstin,
        city: form.city
      });
      await refresh();
      navigate(data.redirect || "/dashboard/admin");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card bg-white text-ink-900 shadow-ring">
      <div className="border-b border-ink-100 px-6 pb-5 pt-6 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-100 text-gold-700">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-2xl leading-tight">
              {step === 0 ? "Builder Registration" : "Builder / Developer Registration"}
            </h2>
            <p className="text-[12.5px] text-ink-500">
              {step === 0
                ? "Create your account to get started"
                : "Create your account to list and manage your properties"}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <Stepper steps={steps} current={step} tone="gold" />
        </div>
      </div>

      <div className="space-y-5 px-6 py-6 sm:px-8">
        {err && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{err}</div>
        )}

        {step === 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField required label="Full Name" placeholder="Enter your full name" value={form.name} onChange={(e) => up("name", e.target.value)} />
            <TextField label="Company Name" placeholder="Enter company name" value={form.company} onChange={(e) => up("company", e.target.value)} />
            <TextField required label="Email Address" type="email" placeholder="Enter your email" value={form.email} onChange={(e) => up("email", e.target.value)} />
            <TextField label="Mobile Number" placeholder="+91 ••••• •••••" value={form.phone} onChange={(e) => up("phone", e.target.value)} />
            <TextField required label="Password" type="password" placeholder="Create a password" value={form.password} onChange={(e) => up("password", e.target.value)} />
            <TextField required label="Confirm Password" type="password" placeholder="Confirm password" value={form.confirm} onChange={(e) => up("confirm", e.target.value)} />
            <TextField label="GST Number (Optional)" placeholder="Enter GST number" value={form.gstin} onChange={(e) => up("gstin", e.target.value)} className="sm:col-span-2" />
            <div className="sm:col-span-2">
              <label className="flex items-start gap-2 text-[13px] text-ink-700">
                <input type="checkbox" checked={form.accept} onChange={(e) => up("accept", e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-gold-500" />
                I agree to the <Link to="/legal/terms" className="font-medium text-gold-700 hover:underline">Terms & Conditions</Link> and <Link to="/legal/privacy" className="font-medium text-gold-700 hover:underline">Privacy Policy</Link>
              </label>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <SectionTitle icon={<MapPin className="h-4 w-4" />} title="Register Office Geo Location" hint="(For approval office location)" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Building / Office Name" placeholder="Building / office name" value={form.officeAddress} onChange={(e) => up("officeAddress", e.target.value)} className="sm:col-span-2" />
              <TextField label="Landmark (Optional)" placeholder="Nearby landmark" value={form.landmark} onChange={(e) => up("landmark", e.target.value)} />
              <TextField label="Pincode" placeholder="500 081" value={form.pincode} onChange={(e) => up("pincode", e.target.value)} />
              <TextField label="City" placeholder="Hyderabad" value={form.city} onChange={(e) => up("city", e.target.value)} />
              <SelectField label="State" value={form.state} onChange={(e) => up("state", e.target.value)}>
                <option value="">Select state</option>
                {["Telangana", "Karnataka", "Maharashtra", "Tamil Nadu", "Delhi", "Gujarat"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </SelectField>
              <SelectField label="Country" value="India" disabled>
                <option>India</option>
              </SelectField>
            </div>

            <SectionTitle icon={<FileCheck2 className="h-4 w-4" />} title="Upload RERA Related Documents" hint="(Required for Government and Insurance verification)" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UploadCard title="Incorporation Certificate" subtitle="Issued by MCA / Registrar" />
              <UploadCard title="GST Registration Certificate" subtitle="As issued by GST authority" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <SectionTitle icon={<UserCog className="h-4 w-4" />} title="Verification" hint="Verify your identity and complete details to activate your application" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Authorised Person Name" required placeholder="Full name of signatory" value={form.authorizedName} onChange={(e) => up("authorizedName", e.target.value)} />
              <TextField label="Designation" required placeholder="e.g., Director" value={form.designation} onChange={(e) => up("designation", e.target.value)} />
              <TextField label="PAN Card" placeholder="ABCDE1234F" value={form.panNumber} onChange={(e) => up("panNumber", e.target.value)} />
              <TextField label="Aadhaar Card" placeholder="XXXX XXXX XXXX" value={form.aadhaar} onChange={(e) => up("aadhaar", e.target.value)} />
              <UploadField label="PAN Card" hint="Front side, ≤ 5 MB" />
              <UploadField label="Aadhaar Card" hint="Front + Back, ≤ 5 MB" />
            </div>

            <div className="rounded-lg border border-ink-100 bg-ink-50/60 p-4">
              <h4 className="text-[13px] font-semibold text-ink-900">What happens next?</h4>
              <ul className="mt-2 space-y-1.5 text-[12.5px] text-ink-600">
                <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-sage-600" /> Review & Progress is initiated within 24 hours.</li>
                <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-sage-600" /> No Profile Lock — start exploring while we verify.</li>
                <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-sage-600" /> Approval & Activation upon successful verification.</li>
              </ul>
            </div>

            <label className="flex items-start gap-2 text-[13px] text-ink-700">
              <input type="checkbox" checked={form.accept2} onChange={(e) => up("accept2", e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-ink-300 accent-gold-500" />
              <span>
                I hereby declare that all information provided above is true and complete to the best of my knowledge. I understand that any false information may lead to rejection of my application or termination of services.
              </span>
            </label>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          {step > 0 ? (
            <button type="button" onClick={back} className="btn-outline">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <Link to="/" className="btn-ghost text-ink-600">
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>
          )}
          {step < 2 ? (
            <button type="button" onClick={next} className="btn-gold">
              {step === 0 ? "Register as Builder" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={busy || !form.accept2} className="btn-gold">
              <ShieldCheck className="h-4 w-4" />
              {busy ? "Submitting…" : "Submit for Verification"}
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="border-t border-ink-100 pt-3 text-center text-[12.5px] text-ink-500">
          Already have an account?{" "}
          <Link to="/" className="font-medium text-gold-700 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title, hint }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-ink-900">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-gold-100 text-gold-700">{icon}</span>
      <h3 className="text-[14.5px] font-semibold">{title}</h3>
      {hint && <span className="text-[12px] text-ink-400">{hint}</span>}
    </div>
  );
}

function UploadCard({ title, subtitle }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-4">
      <div className="mb-2 flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4 text-gold-700" />
        <div className="text-[13px] font-semibold text-ink-900">{title}</div>
      </div>
      <p className="mb-3 text-[12px] text-ink-500">{subtitle}</p>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-ink-200 bg-white px-3 py-3 text-[12px] text-ink-500 transition-colors hover:border-gold-400 hover:bg-gold-50/40">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="text-ink-700">Upload Certificate</span>
        <span className="text-[11px] text-ink-400">PDF / JPG, max 5 MB</span>
        <input type="file" className="hidden" />
      </label>
    </div>
  );
}
