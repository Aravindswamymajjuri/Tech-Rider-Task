import { Brand } from "./Brand";
import { Footer } from "./Footer";
import { ShieldCheck, Globe2 } from "lucide-react";

export function AuthLayout({
  children,
  heroImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=70",
  tone = "gold"
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(140deg, rgba(7,13,34,.86) 0%, rgba(7,13,34,.5) 45%, rgba(7,13,34,.85) 100%), url('${heroImage}')`
        }}
      />
      <header className="container flex items-center justify-between py-5">
        <Brand inverted />
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] backdrop-blur sm:flex">
            <ShieldCheck className={`h-3.5 w-3.5 ${tone === "gold" ? "text-gold-300" : "text-sage-300"}`} />
            <span className="text-white/90">Secure & Trusted</span>
            <span className="text-white/50">·</span>
            <span className="text-white/60">Your data is 100% safe</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] backdrop-blur">
            <Globe2 className="h-3.5 w-3.5" />
            <span>English</span>
          </div>
        </div>
      </header>

      <main className="container grid grid-cols-1 gap-8 pb-12 pt-2 lg:grid-cols-12 lg:gap-10">
        <section className="lg:col-span-4 animate-fade-up">
          <p className="text-[12px] uppercase tracking-[0.3em] text-white/70">Welcome to</p>
          <h1 className="mt-2 font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
            1 CRORE
            <br />
            <span className={tone === "gold" ? "text-gold-300" : "text-sage-300"}>PROPERTY</span>
          </h1>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/75">
            Premium properties from <span className="font-semibold text-white">₹1 Cr – ₹199 Cr</span>.
            Where luxury meets innovation.
          </p>

          <div className="mt-6 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <div className="font-display text-xl">10K+</div>
              <div className="text-[12px] text-white/65">Premium Properties</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <div className="font-display text-xl">25K+</div>
              <div className="text-[12px] text-white/65">Happy Customers</div>
            </div>
          </div>

          <div className="mt-5 inline-flex max-w-md items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
            <span className={`grid h-9 w-9 place-items-center rounded-full ${tone === "gold" ? "bg-gold-300/15 text-gold-300" : "bg-sage-300/15 text-sage-300"}`}>
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <div className="font-semibold leading-tight text-white">TRUSTED BY</div>
              <div className="text-[12.5px] text-white/65">25,000+ Home Seekers</div>
            </div>
          </div>
        </section>
        <section className="lg:col-span-8">{children}</section>
      </main>

      <Footer variant="dark" />
    </div>
  );
}
