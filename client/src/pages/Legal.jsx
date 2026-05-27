import { Brand } from "@/components/Brand";
import { Footer } from "@/components/Footer";

export function Privacy() {
  return (
    <Wrap title="Privacy Policy">
      <p>1 Crore Property values your privacy. We collect minimum personal information required to operate the platform — your name, email, phone and KYC documents. None of this information is sold to third parties.</p>
      <p>We use industry-standard encryption for stored documents, and access is restricted to verified personnel only. Please contact <a className="font-medium text-gold-700 underline-offset-2 hover:underline" href="mailto:privacy@1croreproperties.com">privacy@1croreproperties.com</a> for any data request.</p>
    </Wrap>
  );
}

export function Terms() {
  return (
    <Wrap title="Terms & Conditions">
      <p>By using 1 Crore Property, you agree that listings and verification statuses are provided in good faith but may change. Final sale terms are between the buyer and the listed builder.</p>
      <p>Disputes are subject to the jurisdiction of courts in Hyderabad, India.</p>
    </Wrap>
  );
}

function Wrap({ title, children }) {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <header className="border-b border-ink-100 bg-white"><div className="container py-4"><Brand /></div></header>
      <main className="container max-w-3xl space-y-4 py-10 text-[14px] leading-relaxed text-ink-700">
        <h1 className="font-display text-3xl text-ink-900">{title}</h1>
        {children}
      </main>
      <Footer />
    </div>
  );
}
