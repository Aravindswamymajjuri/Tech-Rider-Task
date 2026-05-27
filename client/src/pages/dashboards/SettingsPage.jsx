import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Bell, KeyRound, ShieldCheck, User as UserIcon } from "lucide-react";
import { DashboardShell, NavLink } from "@/components/DashboardShell";
import { PageSkeleton } from "@/components/PageSkeleton";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { dashboardPathFor } from "@/lib/utils";

const TABS = [
  { key: "profile", label: "Profile", Icon: UserIcon },
  { key: "notifications", label: "Notifications", Icon: Bell },
  { key: "security", label: "Security", Icon: KeyRound },
  { key: "verification", label: "Verification", Icon: ShieldCheck }
];

export default function SettingsPage() {
  const { user, loading, refresh } = useSession();
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.me().then((d) => setProfile(d.user)).catch(() => {});
  }, [user]);

  if (loading) return <PageSkeleton />;
  if (!user) return <Navigate to="/" replace />;
  if (!profile) return <PageSkeleton message="Loading your settings…" />;

  const tone = user.role === "buyer" ? "sage" : "gold";
  const baseDash = dashboardPathFor(user.role);

  return (
    <DashboardShell
      user={{ name: user.name, role: user.role }}
      tone={tone}
      title="Settings"
      subtitle="Manage your profile, notifications and security in one place."
      nav={
        <>
          <NavLink to={baseDash}>Dashboard</NavLink>
          <NavLink to="/dashboard/settings">Settings</NavLink>
          <NavLink to="/dashboard/notifications">Notifications</NavLink>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <nav className="card flex flex-col gap-1 p-2">
            {TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                  tab === key ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-100"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="lg:col-span-9">
          {tab === "profile" && <ProfileTab profile={profile} onSaved={(u) => { setProfile(u); refresh(); }} />}
          {tab === "notifications" && <NotificationsTab profile={profile} onSaved={(p) => setProfile(p)} />}
          {tab === "security" && <SecurityTab profile={profile} />}
          {tab === "verification" && <VerificationTab profile={profile} />}
        </section>
      </div>
    </DashboardShell>
  );
}

// === Profile tab ===
function ProfileTab({ profile, onSaved }) {
  const [form, setForm] = useState({
    name: profile.name,
    phone: profile.phone || "",
    avatarUrl: profile.avatarUrl || "",
    city: profile.city || "",
    company: profile.company || "",
    rera: profile.rera || "",
    gstin: profile.gstin || "",
    category: profile.category || "apartment",
    budgetMin: profile.budgetMin ?? 5_000_000,
    budgetMax: profile.budgetMax ?? 15_000_000,
    country: profile.country || "United States",
    preferredCity: profile.preferredCity || "Hyderabad",
    investmentRange: profile.investmentRange || "₹2 Cr – ₹5 Cr"
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null);
    try {
      const res = await api.updateProfile(form);
      setMsg("Profile updated.");
      onSaved(res.user);
    } catch (e2) {
      setErr(e2.message || "Could not update profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold text-ink-900">Profile</h2>
      <p className="text-[12.5px] text-ink-500">This is what appears across the platform.</p>

      {msg && <div className="mt-4 rounded-md bg-sage-50 px-3 py-2 text-[12.5px] text-sage-800">{msg}</div>}
      {err && <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{err}</div>}

      <div className="mt-5 flex items-center gap-4">
        <div
          className="h-16 w-16 rounded-full border border-ink-100 bg-cover bg-center text-center font-display text-xl leading-[64px] text-ink-500"
          style={{ backgroundImage: form.avatarUrl ? `url(${form.avatarUrl})` : undefined }}
        >
          {!form.avatarUrl && (profile.name?.[0] || "U")}
        </div>
        <div className="flex-1">
          <Field label="Avatar URL">
            <input value={form.avatarUrl} onChange={(e) => up("avatarUrl", e.target.value)} placeholder="https://…" />
          </Field>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" required>
          <input value={form.name} onChange={(e) => up("name", e.target.value)} required />
        </Field>
        <Field label="Email">
          <input value={profile.email} readOnly className="cursor-not-allowed text-ink-500" />
        </Field>
        <Field label="Phone">
          <input value={form.phone} onChange={(e) => up("phone", e.target.value)} placeholder="+91 ••••• •••••" />
        </Field>
        <Field label="City">
          <input value={form.city} onChange={(e) => up("city", e.target.value)} placeholder="Hyderabad" />
        </Field>

        {profile.role === "builder" && (
          <>
            <Field label="Company"><input value={form.company} onChange={(e) => up("company", e.target.value)} /></Field>
            <Field label="RERA registration"><input value={form.rera} onChange={(e) => up("rera", e.target.value)} placeholder="e.g. TG-RERA-2024-A-0041" /></Field>
            <Field label="GSTIN" className="sm:col-span-2"><input value={form.gstin} onChange={(e) => up("gstin", e.target.value)} placeholder="36ABCDE1234F1Z5" /></Field>
          </>
        )}
        {profile.role === "buyer" && (
          <>
            <Field label="Looking for">
              <select value={form.category} onChange={(e) => up("category", e.target.value)}>
                {["apartment","villa","independent","plot","commercial"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Budget — min (₹)"><input type="number" value={form.budgetMin} onChange={(e) => up("budgetMin", Number(e.target.value))} /></Field>
            <Field label="Budget — max (₹)"><input type="number" value={form.budgetMax} onChange={(e) => up("budgetMax", Number(e.target.value))} /></Field>
          </>
        )}
        {profile.role === "nri" && (
          <>
            <Field label="Country of residence"><input value={form.country} onChange={(e) => up("country", e.target.value)} /></Field>
            <Field label="Preferred city in India"><input value={form.preferredCity} onChange={(e) => up("preferredCity", e.target.value)} /></Field>
            <Field label="Investment range" className="sm:col-span-2">
              <select value={form.investmentRange} onChange={(e) => up("investmentRange", e.target.value)}>
                {["₹50 L – ₹1 Cr","₹1 Cr – ₹2 Cr","₹2 Cr – ₹5 Cr","₹5 Cr – ₹10 Cr","Above ₹10 Cr"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <button type="submit" disabled={busy} className="btn-gold">{busy ? "Saving…" : "Save changes"}</button>
      </div>
    </form>
  );
}

// === Notifications tab ===
function NotificationsTab({ profile, onSaved }) {
  const [prefs, setPrefs] = useState(profile.preferences || {});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  async function toggle(k, v) {
    setPrefs((p) => ({ ...p, [k]: v }));
    setBusy(true); setErr(null); setMsg(null);
    try {
      const res = await api.updatePreferences({ [k]: v });
      setMsg("Preferences saved.");
      onSaved({ ...profile, preferences: res.preferences });
    } catch (e2) {
      setErr(e2.message || "Could not save");
      setPrefs((p) => ({ ...p, [k]: !v }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold text-ink-900">Notification preferences</h2>
      <p className="text-[12.5px] text-ink-500">Choose how we keep you updated.</p>
      {msg && <div className="mt-4 rounded-md bg-sage-50 px-3 py-2 text-[12.5px] text-sage-800">{msg}</div>}
      {err && <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{err}</div>}

      <div className="mt-4 divide-y divide-ink-100">
        <Toggle
          checked={prefs.emailEnquiries !== false}
          onChange={(v) => toggle("emailEnquiries", v)}
          title="Email me about new enquiries"
          desc="Get an email each time someone enquires on one of your listings."
          disabled={busy}
        />
        <Toggle
          checked={prefs.emailWeeklyDigest !== false}
          onChange={(v) => toggle("emailWeeklyDigest", v)}
          title="Weekly performance digest"
          desc="Every Monday morning — saved searches, top properties, market trends."
          disabled={busy}
        />
        <Toggle
          checked={!!prefs.emailMarketing}
          onChange={(v) => toggle("emailMarketing", v)}
          title="Product news & marketing"
          desc="Occasional updates about new features. We never share your email."
          disabled={busy}
        />
        <Toggle
          checked={prefs.pushAlerts !== false}
          onChange={(v) => toggle("pushAlerts", v)}
          title="In-app alerts"
          desc="Show the notification bell badge when something needs attention."
          disabled={busy}
        />
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, title, desc, disabled }) {
  return (
    <label className="flex items-start justify-between gap-4 py-4">
      <div>
        <div className="text-[13.5px] font-semibold text-ink-900">{title}</div>
        <div className="text-[12.5px] text-ink-500">{desc}</div>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
          checked ? "bg-gold-500" : "bg-ink-200"
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}

// === Security tab ===
function SecurityTab({ profile }) {
  const isOAuth = profile.provider && profile.provider !== "local";
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setMsg(null); setErr(null);
    if (form.next !== form.confirm) return setErr("New passwords do not match.");
    if (form.next.length < 6) return setErr("New password must be at least 6 characters.");
    setBusy(true);
    try {
      await api.changePassword({ current: form.current, next: form.next });
      setMsg("Password changed. You're still signed in.");
      setForm({ current: "", next: "", confirm: "" });
    } catch (e2) {
      setErr(e2.message || "Could not change password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-5 sm:p-6">
        <h2 className="text-[16px] font-semibold text-ink-900">Change password</h2>
        <p className="text-[12.5px] text-ink-500">Pick something long and unique.</p>
        {msg && <div className="mt-4 rounded-md bg-sage-50 px-3 py-2 text-[12.5px] text-sage-800">{msg}</div>}
        {err && <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{err}</div>}
        {isOAuth ? (
          <div className="mt-4 rounded-md bg-ink-50 px-3 py-3 text-[13px] text-ink-700">
            You signed in with <strong className="text-ink-900 capitalize">{profile.provider}</strong>. Change your password from your <strong>{profile.provider}</strong> account.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Current password" required>
              <input type="password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} required autoComplete="current-password" />
            </Field>
            <Field label="New password" required>
              <input type="password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} required autoComplete="new-password" />
            </Field>
            <Field label="Confirm new password" required>
              <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required autoComplete="new-password" />
            </Field>
            <div className="sm:col-span-3 flex justify-end">
              <button type="submit" disabled={busy} className="btn-gold">{busy ? "Updating…" : "Update password"}</button>
            </div>
          </form>
        )}
      </div>

      <div className="card p-5 sm:p-6">
        <h2 className="text-[16px] font-semibold text-ink-900">Sessions</h2>
        <p className="text-[12.5px] text-ink-500">You're signed in on this device with a 7-day session cookie. Signing out from the top-right user menu invalidates the cookie everywhere.</p>
      </div>
    </div>
  );
}

// === Verification tab ===
function VerificationTab({ profile }) {
  const items = profile.role === "builder"
    ? [
        { t: "RERA Certificate", ok: !!profile.rera, hint: "Add your RERA number in the Profile tab." },
        { t: "GST Registration", ok: !!profile.gstin },
        { t: "Company address", ok: !!profile.city },
        { t: "Phone verified", ok: !!profile.phone }
      ]
    : profile.role === "nri"
      ? [
          { t: "Passport details", ok: false, hint: "Upload via Profile → Documents (coming next sprint)." },
          { t: "OCI / Visa", ok: false },
          { t: "PAN", ok: false },
          { t: "NRE bank statement", ok: false }
        ]
      : [
          { t: "Phone verified", ok: !!profile.phone },
          { t: "Profile complete", ok: !!profile.city }
        ];

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold text-ink-900">Verification</h2>
      <p className="text-[12.5px] text-ink-500">Verified accounts receive priority responses on every enquiry.</p>
      <ul className="mt-4 divide-y divide-ink-100">
        {items.map((i) => (
          <li key={i.t} className="flex items-start justify-between gap-3 py-3">
            <div>
              <div className="text-[13.5px] font-semibold text-ink-900">{i.t}</div>
              {i.hint && !i.ok && <div className="text-[12.5px] text-ink-500">{i.hint}</div>}
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${i.ok ? "bg-sage-100 text-sage-800" : "bg-gold-100 text-gold-800"}`}>
              <ShieldCheck className="h-3 w-3" /> {i.ok ? "Verified" : "Pending"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, required, children, className = "" }) {
  return (
    <div className={className}>
      <label className="field-label">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="field">{children}</div>
    </div>
  );
}
