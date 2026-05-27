import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { useSession } from "@/lib/session";
import { ArrowRight, BookOpen, Calculator, Compass, FileText, GraduationCap, ShieldCheck } from "lucide-react";

const guides = [
  { Icon: BookOpen, t: "First-time Buyer's Handbook", d: "How to budget, what to inspect, and the documents you must have before signing.", read: "8 min read" },
  { Icon: ShieldCheck, t: "RERA Verification Checklist", d: "A line-by-line guide to verifying a builder's RERA registration in 5 minutes.", read: "5 min read" },
  { Icon: Compass, t: "Choosing a Locality", d: "Connectivity, schools, commercial growth — how to score a neighbourhood objectively.", read: "10 min read" },
  { Icon: Calculator, t: "EMI & Affordability", d: "A practical look at the 28/36 rule, prepayment maths and floating vs fixed rates.", read: "7 min read" },
  { Icon: FileText, t: "Sale Deed vs Sale Agreement", d: "Which document does what, why both matter, and what to insist on.", read: "6 min read" },
  { Icon: GraduationCap, t: "NRI Purchase Walkthrough", d: "FEMA, NRE/NRO funding, Power of Attorney, and repatriation explained simply.", read: "12 min read" }
];

const tools = [
  { t: "EMI Calculator", to: "/properties" },
  { t: "Budget Recommender", to: "/properties" },
  { t: "Locality Score", to: "/properties" },
  { t: "Stamp Duty Estimator", to: "/properties" }
];

export default function Resources() {
  const { user } = useSession();
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <SiteHeader sessionUser={user} />

      <section className="container py-10">
        <p className="text-[12px] uppercase tracking-[0.3em] text-gold-700">Resources</p>
        <h1 className="mt-2 font-display text-3xl text-ink-900 sm:text-4xl">Buy smarter. Decide faster.</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-600">
          Handbooks, checklists and calculators put together with our team and a panel
          of real-estate lawyers, bankers and architects. Free, no email gate.
        </p>
      </section>

      <section className="container pb-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map(({ Icon, t, d, read }) => (
            <article key={t} className="card flex flex-col p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-100 text-gold-700">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-3 text-[15px] font-semibold text-ink-900">{t}</h2>
              <p className="mt-1 flex-1 text-[13px] leading-relaxed text-ink-600">{d}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11.5px] uppercase tracking-wider text-ink-400">{read}</span>
                <button
                  type="button"
                  onClick={() => alert(`"${t}" opens in the reader — articles publish next sprint.`)}
                  className="inline-flex items-center gap-1 text-[12.5px] font-medium text-gold-700 hover:underline"
                >
                  Read guide <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-ink-100 bg-white py-12">
        <div className="container">
          <h2 className="font-display text-2xl text-ink-900">Free tools</h2>
          <p className="mt-1 text-[13.5px] text-ink-500">Make the maths boring so the decision can be exciting.</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tools.map((t) => (
              <Link
                key={t.t}
                to={t.to}
                className="card flex items-center justify-between p-4 text-[13.5px] font-semibold text-ink-900 hover:shadow-ring"
              >
                {t.t}
                <ArrowRight className="h-4 w-4 text-gold-700" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
