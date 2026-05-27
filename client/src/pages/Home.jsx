import { Brand } from "@/components/Brand";
import { Footer } from "@/components/Footer";
import { LoginCard } from "@/components/LoginCard";
import { ShieldCheck, Globe2, BadgeCheck, HeartHandshake, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(140deg, rgba(7,13,34,.86) 0%, rgba(7,13,34,.55) 45%, rgba(7,13,34,.85) 100%), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=70')"
        }}
      />
      <div className="absolute inset-0 -z-10 bg-noise opacity-60 mix-blend-overlay" aria-hidden />

      <header className="container flex items-center justify-between py-5">
        <Brand inverted />
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] backdrop-blur sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-gold-300" />
            <span className="text-white/90">Secure & Trusted</span>
            <span className="text-white/50">·</span>
            <span className="text-white/60">Your data is 100% safe</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] backdrop-blur">
            <Globe2 className="h-3.5 w-3.5 text-white/80" />
            <span>English</span>
          </div>
        </div>
      </header>

      <main className="container grid grid-cols-1 gap-10 pb-16 pt-6 lg:grid-cols-12 lg:gap-12 lg:pb-20 lg:pt-10">
        <section className="lg:col-span-5 animate-fade-up">
          <p className="text-[12px] uppercase tracking-[0.3em] text-gold-300">Welcome to</p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05] tracking-tight md:text-6xl">
            1 CRORE
            <br />
            <span className="text-gold-300">PROPERTY</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/80">
            Premium properties from{" "}
            <span className="font-semibold text-white">₹1 Cr – ₹199 Cr</span>. Where luxury meets
            innovation, and trust is the only currency.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
            <Stat n="10K+" label="Premium Properties" />
            <Stat n="25K+" label="Happy Customers" />
          </div>

          <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur sm:max-w-md">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-300/15 text-gold-300">
              <BadgeCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="font-semibold leading-tight">TRUSTED BY</div>
              <div className="text-[13px] text-white/70">25,000+ Home Seekers</div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <LoginCard />
        </section>
      </main>

      <div className="border-t border-white/5 bg-white/3 backdrop-blur">
        <div className="container grid grid-cols-1 gap-4 py-4 text-[12.5px] text-white/80 sm:grid-cols-3">
          <TrustItem icon={<HeartHandshake className="h-4 w-4 text-gold-300" />} title="Dedicated Support" sub="We are here to help" />
          <TrustItem icon={<BadgeCheck className="h-4 w-4 text-gold-300" />} title="Verified Listings" sub="100% verified properties" />
          <TrustItem icon={<Lock className="h-4 w-4 text-gold-300" />} title="Secure Transactions" sub="Safe & transparent deals" />
        </div>
      </div>

      <Footer variant="dark" />
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
      <div className="font-display text-2xl text-white">{n}</div>
      <div className="text-[12px] text-white/65">{label}</div>
    </div>
  );
}

function TrustItem({ icon, title, sub }) {
  return (
    <div className="flex items-center gap-2.5">
      <span>{icon}</span>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-white/55">{sub}</div>
      </div>
    </div>
  );
}
