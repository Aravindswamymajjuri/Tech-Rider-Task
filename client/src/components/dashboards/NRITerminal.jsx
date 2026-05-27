import { Link } from "react-router-dom";
import { useState } from "react";
import { DashboardShell, NavLink } from "@/components/DashboardShell";
import { BarChart, Donut, Sparkline } from "@/components/Sparkline";
import { PropertyCard } from "@/components/PropertyCard";
import { formatINR } from "@/lib/utils";
import {
  ArrowDownToLine,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Globe2,
  Landmark,
  Plane,
  ScanEye,
  TrendingUp,
  Wallet
} from "lucide-react";

const CURRENCIES = {
  USD: { sym: "$", rate: 0.012 },
  GBP: { sym: "£", rate: 0.0095 },
  AED: { sym: "AED", rate: 0.044 },
  SGD: { sym: "S$", rate: 0.016 },
  EUR: { sym: "€", rate: 0.011 }
};

const PALETTE = ["#cea735", "#65a266", "#9683ff", "#94a3b8", "#306838", "#b48a25"];

export function NRITerminal({ user, properties, stats }) {
  const [currency, setCurrency] = useState("USD");
  const fx = CURRENCIES[currency];

  const portfolio = [...properties].sort((a, b) => b.price - a.price).slice(0, 4);
  const portfolioINR = portfolio.reduce((s, p) => s + p.price, 0);
  const annualRentalINR = Math.round(portfolioINR * 0.04);
  const allocation = Object.entries(stats.categoryCounts).map(([label, value], i) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value,
    color: PALETTE[i % PALETTE.length]
  }));

  const baselineRate = portfolio[0]?.pricePerSqft || 100;
  const performance = portfolio.length
    ? portfolio
        .concat(portfolio)
        .concat(portfolio)
        .slice(0, 12)
        .map((p, i, arr) => {
          const rolling = arr.slice(0, i + 1).reduce((s, x) => s + (x.pricePerSqft ?? baselineRate), 0) / (i + 1);
          return Math.round((rolling / baselineRate) * 100);
        })
    : [100];
  const capitalGain = portfolio.reduce((s, p) => s + p.price * 0.08, 0);
  const monthlyYield = Math.round(annualRentalINR / 12);

  const rentalSeries = Array.from({ length: 12 }, (_, i) => Math.round((monthlyYield / 100_000) * (1 + i * 0.01) * 10) / 10);

  const documents = [
    { title: "Passport", status: "verified" },
    { title: "OCI / Visa", status: "verified" },
    { title: "PAN", status: "pending" },
    { title: "NRE Bank Statement", status: "pending" }
  ];

  return (
    <DashboardShell
      user={user}
      tone="gold"
      nav={
        <>
          <NavLink to="/dashboard/nri">NRI Terminal</NavLink>
          <NavLink to="/properties">Marketplace</NavLink>
          <NavLink to="/dashboard/wishlist">Wishlist</NavLink>
          <NavLink to="/dashboard/compare">Compare</NavLink>
          <NavLink to="/dashboard/nri#portfolio">Portfolio</NavLink>
        </>
      }
    >
      <section className="card overflow-hidden p-0">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
          <div className="bg-ink-950 p-6 text-white">
            <div className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.3em] text-gold-300">
              <Plane className="h-3.5 w-3.5" /> NRI Terminal
            </div>
            <h2 className="mt-2 font-display text-3xl">Welcome, {user.name}</h2>
            <p className="mt-1 text-[13.5px] text-white/70">
              Premium India real estate access for global investors. Manage portfolio, KYC,
              currency, and repatriation — all in one place.
            </p>
            <div className="mt-5 inline-flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <Globe2 className="h-4 w-4 text-gold-300" />
              <div>
                <div className="text-[11px] uppercase tracking-wide text-white/60">Display Currency</div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-transparent text-[13px] font-semibold text-white focus:outline-none"
                >
                  {Object.keys(CURRENCIES).map((c) => <option key={c} value={c} className="text-ink-900">{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-4 p-6 lg:grid-cols-4">
            <Stat icon={<Wallet className="h-5 w-5" />} v={formatINR(portfolioINR)} l="Portfolio Value (INR)" tone="gold" />
            <Stat icon={<Banknote className="h-5 w-5" />} v={`${fx.sym} ${(portfolioINR * fx.rate).toLocaleString("en-US", { maximumFractionDigits: 0 })}`} l={`Equivalent (${currency})`} tone="sage" />
            <Stat icon={<Building2 className="h-5 w-5" />} v={portfolio.length.toString().padStart(2, "0")} l="Owned Properties" tone="violet" />
            <Stat icon={<Landmark className="h-5 w-5" />} v={formatINR(annualRentalINR)} l="Annual Rental" tone="ink" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3" id="portfolio">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold">Portfolio Performance</h3>
              <p className="text-[12px] text-ink-500">Indexed value of your portfolio (last 12 months)</p>
            </div>
            <span className="rounded-md border border-ink-200 px-2 py-1 text-[12px] text-ink-600">Last 12 Months</span>
          </div>
          <Sparkline values={performance} color="#cea735" fill="rgba(206,167,53,0.18)" height={150} />
          <div className="mt-3 grid grid-cols-3 gap-3">
            <Mini k="Capital Gain" v={`+${formatINR(capitalGain)}`} pos />
            <Mini k="Indexed Return" v={`+${performance.length ? (performance[performance.length - 1] - 100).toFixed(1) : "0"}%`} pos />
            <Mini k="Monthly Yield" v={formatINR(monthlyYield)} />
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-[15px] font-semibold">Allocation</h3>
          <p className="text-[12px] text-ink-500">Across asset classes</p>
          <div className="mt-3">
            <Donut
              segments={allocation.length ? allocation : [{ label: "No allocation", value: 1, color: "#94a3b8" }]}
              centerLabel={{ value: "100%", label: "Allocated" }}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold">Currency Converter</h3>
          <p className="text-[12px] text-ink-500">Reference rates · for indication only</p>
          <CurrencyConverter />
        </div>

        <div className="card p-5">
          <h3 className="text-[14px] font-semibold">FX Snapshot ({currency}/INR)</h3>
          <p className="text-[12px] text-ink-500">Rolling reference series — illustrative</p>
          <Sparkline
            values={Array.from({ length: 6 }, (_, i) => Math.round((1 / fx.rate) * (1 + (i - 2) * 0.005) * 100) / 100)}
            color="#306838"
            fill="rgba(48,104,56,0.18)"
            height={120}
          />
          <div className="mt-2 text-[12.5px] text-ink-500">1 {currency} ≈ ₹{(1 / fx.rate).toFixed(2)}</div>
        </div>

        <div className="card p-5" id="compliance">
          <h3 className="text-[14px] font-semibold">Repatriation & Compliance</h3>
          <p className="text-[12px] text-ink-500">FEMA, RBI & DTAA assistance</p>
          <ul className="mt-3 space-y-2 text-[12.5px]">
            <Item ok t="FEMA-compliant accounts" />
            <Item ok t="Form 15CA/CB filing assistance" />
            <Item ok t="Auto TDS computation" />
            <Item t={`Repatriation request — ${portfolio.length} eligible asset${portfolio.length === 1 ? "" : "s"}`} />
          </ul>
          <button
            type="button"
            onClick={() => alert("Compliance Center opens with your relationship manager")}
            className="btn-gold mt-3 w-full"
          >
            Open Compliance Center
          </button>
        </div>
      </section>

      <section id="kyc" className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold">KYC & Documents</h3>
            <p className="text-[12px] text-ink-500">All verified within 24 hrs of upload</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-sage-100 px-2 py-0.5 text-[12px] font-medium text-sage-800">
            <BadgeCheck className="h-3.5 w-3.5" /> KYC Complete
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {documents.map((d) => <Doc key={d.title} title={d.title} status={d.status} />)}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold">Recommended for NRI Investors</h3>
            <p className="text-[12px] text-ink-500">High-yield rental & appreciation potential</p>
          </div>
          <Link to="/properties" className="text-[12.5px] font-medium text-gold-700 hover:underline">Browse Marketplace →</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {properties.slice(0, 4).map((p) => <PropertyCard key={p.id} property={p} compact />)}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold">Rental Income — Last 12 Months</h3>
          <BarChart values={rentalSeries} labels={["J","F","M","A","M","J","J","A","S","O","N","D"]} color="#cea735" />
          <div className="mt-2 text-[12px] text-ink-500">All figures in ₹ Lakhs.</div>
        </div>
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold">Upcoming Tasks</h3>
          <ul className="mt-3 space-y-3 text-[13px]">
            {portfolio.slice(0, 4).map((p, i) => {
              const date = new Date();
              date.setDate(date.getDate() + (i + 1) * 6);
              const dateStr = `${date.getDate()} ${date.toLocaleString("en-US", { month: "short" })}, ${["11:30 AM","6:00 PM","2:00 PM","10:00 AM"][i % 4]}`;
              const tag = ["Action", "Compliance", "Documents", "Advisory"][i % 4];
              return (
                <li key={p.id} className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-100 text-gold-800"><Clock className="h-4 w-4" /></span>
                    <div>
                      <div className="font-medium text-ink-900">Review — {p.title}</div>
                      <div className="text-[11.5px] text-ink-500"><Calendar className="mr-1 inline h-3 w-3" />{dateStr}</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-800">{tag}</span>
                </li>
              );
            })}
            {portfolio.length === 0 && <li className="text-ink-500">No tasks yet.</li>}
          </ul>
        </div>
      </section>
    </DashboardShell>
  );
}

function Item({ ok, t }) {
  return (
    <li className="flex items-center gap-2 text-ink-700">
      {ok ? <CheckCircle2 className="h-4 w-4 text-sage-700" /> : <Clock className="h-4 w-4 text-gold-700" />}
      <span>{t}</span>
    </li>
  );
}

const TONE_BG = {
  gold: "bg-gold-100 text-gold-800",
  sage: "bg-sage-100 text-sage-800",
  violet: "bg-violet-100 text-violet-800",
  ink: "bg-ink-100 text-ink-800"
};

function Stat({ icon, v, l, tone }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[12px] uppercase tracking-wide text-ink-500">{l}</div>
          <div className="mt-1 font-display text-xl text-ink-900">{v}</div>
        </div>
        <span className={`grid h-9 w-9 place-items-center rounded-full ${TONE_BG[tone]}`}>{icon}</span>
      </div>
    </div>
  );
}

function Mini({ k, v, pos }) {
  return (
    <div className="rounded-lg border border-ink-100 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-ink-500">{k}</div>
      <div className={`mt-0.5 font-display text-lg ${pos ? "text-sage-700" : "text-ink-900"}`}>{v}</div>
    </div>
  );
}

function Doc({ title, status }) {
  return (
    <div className="rounded-xl border border-ink-100 p-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">{title}</div>
        {status === "verified" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-sage-100 px-2 py-0.5 text-[11px] font-medium text-sage-800"><BadgeCheck className="h-3 w-3" /> Verified</span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-medium text-gold-800"><Clock className="h-3 w-3" /> Pending</span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 text-[12px] text-ink-500">
        <ScanEye className="h-3.5 w-3.5" /> Last reviewed recently
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button type="button" onClick={() => alert(`${title} download coming soon`)} className="btn-outline !py-1.5 !text-[12px]"><ArrowDownToLine className="h-3.5 w-3.5" /> Download</button>
        <button type="button" onClick={() => alert(`${title} re-upload coming soon`)} className="btn-outline !py-1.5 !text-[12px]"><ArrowUpRight className="h-3.5 w-3.5" /> Re-upload</button>
      </div>
    </div>
  );
}

function CurrencyConverter() {
  const [amount, setAmount] = useState(100000);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");

  const fxFrom = from === "INR" ? 1 : 1 / CURRENCIES[from].rate;
  const fxTo = to === "INR" ? 1 : 1 / CURRENCIES[to].rate;
  const inINR = amount * fxFrom;
  const out = inINR / fxTo;

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-stretch gap-2">
        <select value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-ink-200 bg-white px-2 text-[13px]">
          {["INR", ...Object.keys(CURRENCIES)].map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="field"><input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></div>
      </div>
      <div className="flex items-center justify-center text-ink-500"><TrendingUp className="h-4 w-4" /></div>
      <div className="flex items-stretch gap-2">
        <select value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-ink-200 bg-white px-2 text-[13px]">
          {["INR", ...Object.keys(CURRENCIES)].map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="field"><input type="text" readOnly value={out.toLocaleString("en-US", { maximumFractionDigits: 2 })} /></div>
      </div>
      <p className="text-[11.5px] text-ink-500">Mid-market reference rate · for transfers, please consult your authorized dealer.</p>
    </div>
  );
}
