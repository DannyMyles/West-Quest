import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works & FAQs",
  description: "Everything you need to know about buying a device from West Quest Limited on deposit and daily payments.",
  alternates: { canonical: "/faqs" },
};

const faqs = [
  {
    q: "How does the deposit and daily payment work?",
    a: "Every device has a fixed deposit (typically 20% of the RRP for Retail, lower for VIP) and a daily payment that depends on your chosen term — 6, 9 or 12 months. The shorter the term, the higher the daily payment but the lower the total cost.",
  },
  {
    q: "What's the difference between Retail and VIP pricing?",
    a: "VIP offers a lower deposit (10–15% instead of 20%) for qualifying customers. Not every device has a VIP plan yet — where it's available, you can apply to find out if you qualify; there's no extra step or login required to see VIP pricing.",
  },
  {
    q: "How do I apply?",
    a: "Pick a device, choose Retail or VIP and a term, then tap Apply. Fill in your name and phone number (ID number is optional but speeds things up), and submit. We'll open WhatsApp with your reference so our team can verify your details.",
  },
  {
    q: "What happens after I apply?",
    a: "Our team reviews your application and contacts you on WhatsApp to confirm your details. Once approved, you pay the deposit and collect your device — the daily payments then begin as agreed.",
  },
  {
    q: "Can I track my application?",
    a: "Yes — use the Track Application page with your reference and phone number to see the current status: pending, contacted, approved or rejected.",
  },
  {
    q: "Is there a payment gateway on the site?",
    a: "No. We don't process payments on the website. Deposits and daily payments are collected by our team directly, confirmed and arranged over WhatsApp or in person.",
  },
];

export default function FaqsPage() {
  return (
    <div className="section max-w-2xl py-10 sm:py-14">
      <h1 className="font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[40px]">How It Works &amp; FAQs</h1>
      <p className="mt-2 text-sm text-muted">Everything you need to know before applying for a device.</p>

      <div className="mt-8 flex flex-col gap-3">
        {faqs.map((f) => (
          <details key={f.q} className="rounded-xl group bg-surface shadow-md p-4 open:bg-surface-muted/40">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink">
              {f.q}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
