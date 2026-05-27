import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { useSession } from "@/lib/session";
import { api } from "@/lib/api";
import { Mail, MapPin, Phone, Send, ShieldCheck } from "lucide-react";

export default function Contact() {
  const { user } = useSession();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    message: ""
  });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  function up(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await api.createEnquiry({ ...form, source: "contact" });
      setStatus("Thanks — our team will reach out within 24 hours.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not send your message");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <SiteHeader sessionUser={user} />

      <section className="container py-10">
        <p className="text-[12px] uppercase tracking-[0.3em] text-gold-700">Contact</p>
        <h1 className="mt-2 font-display text-3xl text-ink-900 sm:text-4xl">Let's talk.</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-600">
          Drop us a note — sales, partnerships or just to say hello. We reply within
          one business day.
        </p>
      </section>

      <section className="container grid grid-cols-1 gap-6 pb-16 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Info Icon={Mail} title="Email" body="hello@1croreproperties.com" href="mailto:hello@1croreproperties.com" />
          <Info Icon={Phone} title="Phone" body="+91 98765 43210" href="tel:+919876543210" />
          <Info Icon={MapPin} title="HQ" body="Hitech City, Hyderabad — Telangana, India" />
          <div className="card p-5">
            <div className="flex items-center gap-2 text-[13.5px] font-semibold text-ink-900">
              <ShieldCheck className="h-4 w-4 text-sage-700" /> Verified, encrypted
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-600">
              We never share your contact details with builders unless you ask us to.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="card lg:col-span-2 space-y-4 p-5 sm:p-6">
          {status && <div className="rounded-md bg-sage-50 px-3 py-2 text-[12.5px] text-sage-800">{status}</div>}
          {err && <div className="rounded-md bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{err}</div>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Labelled label="Your name" required>
              <input value={form.name} onChange={(e) => up("name", e.target.value)} required placeholder="Full name" />
            </Labelled>
            <Labelled label="Email" required>
              <input type="email" value={form.email} onChange={(e) => up("email", e.target.value)} required placeholder="you@example.com" />
            </Labelled>
            <Labelled label="Phone" className="sm:col-span-2">
              <input value={form.phone} onChange={(e) => up("phone", e.target.value)} placeholder="+91 ••••• •••••" />
            </Labelled>
          </div>
          <Labelled label="Message" required>
            <textarea
              rows={5}
              value={form.message}
              onChange={(e) => up("message", e.target.value)}
              required
              placeholder="Tell us what you're looking for…"
              className="min-h-[120px]"
            />
          </Labelled>
          <div className="flex items-center justify-between">
            <p className="text-[11.5px] text-ink-400">By sending you agree to our <a href="/legal/privacy" className="underline">Privacy Policy</a>.</p>
            <button type="submit" disabled={busy} className="btn-gold">
              <Send className="h-4 w-4" />
              {busy ? "Sending…" : "Send message"}
            </button>
          </div>
        </form>
      </section>

      <Footer />
    </div>
  );
}

function Info({ Icon, title, body, href }) {
  const Content = (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-100 text-gold-800">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="text-[12px] uppercase tracking-wider text-ink-500">{title}</div>
        <div className="mt-0.5 text-[13.5px] font-medium text-ink-900">{body}</div>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="card block p-4 hover:shadow-ring">{Content}</a>
  ) : (
    <div className="card p-4">{Content}</div>
  );
}

function Labelled({ label, required, className = "", children }) {
  return (
    <div className={`w-full ${className}`}>
      <label className="field-label">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="field">{children}</div>
    </div>
  );
}
