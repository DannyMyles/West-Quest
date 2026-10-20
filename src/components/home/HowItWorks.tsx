import Link from "next/link";
import { ArrowRight } from "lucide-react";

const steps = [
  { title: "Pick a device", body: "Browse phones, tablets and more. Choose Retail or VIP pricing and a 6, 9 or 12-month term." },
  { title: "Apply in minutes", body: "A short application — name, phone and location. No bank visit, no paperwork trail." },
  { title: "Confirm & collect", body: "We verify your details over WhatsApp, you pay the deposit, and the device is yours to use." },
];

export function HowItWorks() {
  return (
    <section className="bg-panel-dark text-white">
      <div className="section grid gap-10 py-16 sm:py-24 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
        <div>
          <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-glow">
            <span>02</span>
            <span aria-hidden className="h-px w-6 bg-glow/40" />
            <span className="text-white/55">How it works</span>
          </p>
          <h2 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-[-0.015em] sm:text-5xl">
            Own it <em className="text-glow">a little</em> every day.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
            Pay a deposit, take the device home, and clear the balance in small daily payments. No surprises — the figures you
            see are the figures you pay.
          </p>
          <Link href="/faqs" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-glow hover:text-white">
            Read the FAQs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ol className="grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="relative bg-panel-dark p-6 sm:p-7">
              <span className="font-display text-6xl font-medium italic leading-none text-brand sm:text-7xl">{i + 1}</span>
              <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{s.body}</p>
              <span className="ledger-tick bottom-5 right-5 text-glow/70" aria-hidden />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
