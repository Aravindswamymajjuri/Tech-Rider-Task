import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { useSession } from "@/lib/session";
import { Award, Building2, Compass, Globe2, Handshake, ShieldCheck, Sparkles, Users } from "lucide-react";

const stats = [
  { v: "10K+", l: "Premium Properties" },
  { v: "25K+", l: "Happy Customers" },
  { v: "1.2K+", l: "Verified Builders" },
  { v: "₹6,800 Cr", l: "Closed Transactions" }
];

const values = [
  { Icon: ShieldCheck, t: "Verified Listings", d: "Every property is independently verified for RERA, title and possession status before going live." },
  { Icon: Handshake, t: "Buyer-First", d: "We negotiate prices on your behalf and never accept commissions from buyers." },
  { Icon: Globe2, t: "Built for NRIs", d: "Currency, FEMA and DTAA workflows that just work — no lawyer-in-the-middle." },
  { Icon: Sparkles, t: "Designed for Trust", d: "An interface that feels concierge, not classifieds. Premium by default." }
];

const team = [
  { name: "Aditi Menon", role: "Founder & CEO", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=70" },
  { name: "Rajesh Reddy", role: "Head of Developer Relations", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=70" },
  { name: "Anika Iyer", role: "NRI Concierge Lead", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=70" },
  { name: "Karthik Rao", role: "VP, Engineering", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=70" }
];

export default function About() {
  const { user } = useSession();
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <SiteHeader sessionUser={user} />
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=70')" }}
        />
        <div className="container relative grid grid-cols-1 gap-8 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-7">
            <p className="text-[12px] uppercase tracking-[0.3em] text-gold-300">About 1 Crore Property</p>
            <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
              Premium real estate, without the<br className="hidden sm:inline" /> guesswork.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/80">
              We started 1 Crore Property in 2024 with a simple belief: buying a home
              should feel like a celebration, not a survival exercise. Every listing on
              our platform is RERA-verified, every transaction is shepherded by a
              human, and every customer — buyer, builder, NRI — gets the same
              concierge-level care.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/properties" className="btn-gold">Browse Properties</Link>
              <Link to="/contact" className="btn-outline border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">Talk to our team</Link>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.l} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="font-display text-3xl text-gold-300">{s.v}</div>
                  <div className="mt-1 text-[12.5px] text-white/70">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-display text-3xl text-ink-900">Our Mission</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-700">
              India's residential market touches ₹50 lakh crore in value, and yet most
              buyers still walk into the biggest financial decision of their lives armed
              with little more than a WhatsApp forward. We're here to change that.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-700">
              We obsess over three things: verified inventory, honest pricing, and
              support that doesn't disappear after the sale.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {values.map(({ Icon, t, d }) => (
              <div key={t} className="card p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-100 text-gold-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-[15px] font-semibold text-ink-900">{t}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink-100 bg-white py-14">
        <div className="container">
          <h2 className="font-display text-3xl text-ink-900">Leadership</h2>
          <p className="mt-1 text-[13.5px] text-ink-500">Built by operators from real estate, finance and product.</p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {team.map((m) => (
              <div key={m.name} className="card overflow-hidden">
                <div className="h-44 w-full bg-cover bg-center" style={{ backgroundImage: `url(${m.img})` }} />
                <div className="p-3">
                  <div className="text-[14px] font-semibold text-ink-900">{m.name}</div>
                  <div className="text-[12px] text-ink-500">{m.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-14">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Pillar Icon={Building2} t="Verified Inventory" />
          <Pillar Icon={Compass} t="Curated Discovery" />
          <Pillar Icon={Users} t="Relationship Managers" />
          <Pillar Icon={Award} t="Best-Price Promise" />
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Pillar({ Icon, t }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-100 text-gold-800">
        <Icon className="h-5 w-5" />
      </span>
      <div className="text-[13.5px] font-semibold text-ink-900">{t}</div>
    </div>
  );
}
