import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Wallet, Headset } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "West Quest Limited makes genuine smartphones and tablets accessible through deposit-and-daily-payment financing.",
  alternates: { canonical: "/about" },
};

const values = [
  { icon: ShieldCheck, title: "Genuine devices", body: "Every phone and tablet we finance is genuine stock, never grey-market or refurbished without disclosure." },
  { icon: Wallet, title: "Transparent terms", body: "Deposit and daily payment are shown up front for every device and every term — no surprises later." },
  { icon: Headset, title: "People, not a call centre", body: "A real person reviews every application and stays in touch with you over WhatsApp from start to finish." },
];

export default function AboutPage() {
  return (
    <div className="section max-w-3xl py-10 sm:py-14">
      <h1 className="font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[40px]">About West Quest Limited</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        West Quest Limited exists to make owning a good smartphone or tablet possible without paying the full price up
        front. We work with trusted brands — Infinix, Itel, Oppo, Tecno, Villaon and more — and offer every device on
        a small deposit with a daily payment that fits a real budget, spread over 6, 9 or 12 months.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        We keep the process simple: browse a device, see the exact deposit and daily rate, apply in minutes, and
        we&apos;ll confirm everything over WhatsApp — no bank visit, no long paperwork trail.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {values.map((v) => (
          <div key={v.title} className="rounded-2xl bg-surface shadow-md p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-050 text-brand">
              <v.icon className="h-5 w-5" strokeWidth={1.7} />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">{v.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{v.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/catalogue" className="btn-primary justify-center">
          Browse devices
        </Link>
        <Link href="/faqs" className="btn-secondary justify-center">
          How it works
        </Link>
      </div>
    </div>
  );
}
