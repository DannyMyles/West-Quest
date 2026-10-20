import { ShieldCheck, Wallet, Headset, Clock } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "Genuine devices", sub: "Official stock only" },
  { icon: Wallet, label: "No hidden fees", sub: "Deposit + daily, that's it" },
  { icon: Headset, label: "WhatsApp support", sub: "A real person, every step" },
  { icon: Clock, label: "Fast review", sub: "Decisions within the day" },
];

export function TrustBand() {
  return (
    <section className="section pt-4">
      <ul className="no-scrollbar -mx-4 flex snap-x gap-7 overflow-x-auto px-4 py-5 sm:mx-0 sm:px-0 sm:py-6 lg:grid lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-dashed lg:divide-border-strong">
        {items.map((t) => (
          <li key={t.label} className="flex shrink-0 snap-start items-center gap-3 lg:justify-center lg:px-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-050 text-accent">
              <t.icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">{t.label}</span>
              <span className="block text-xs text-muted">{t.sub}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
