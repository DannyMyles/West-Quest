import type { Metadata } from "next";
import { MapPin, Phone, Clock, Mail, MessageCircle } from "lucide-react";
import { ContactForm } from "./ContactForm";
import {
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_EMAIL,
  STORE_ADDRESS,
  STORE_MAPS_URL,
  STORE_HOURS,
  STORE_HOURS_NOTE,
  whatsappLink,
} from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with West Quest Limited about a device, a financing plan, or an existing application.",
  alternates: { canonical: "/contact" },
};

const cards = [
  { icon: MessageCircle, title: "WhatsApp", body: "Fastest way to reach us — ask about a device or an application.", action: { label: "Chat on WhatsApp", href: whatsappLink("Hi West Quest, I have a question.") } },
  { icon: Phone, title: "Call us", body: SUPPORT_PHONE_DISPLAY, action: { label: "Call now", href: `tel:${SUPPORT_PHONE_DISPLAY.replace(/\s/g, "")}` } },
  { icon: Mail, title: "Email", body: SUPPORT_EMAIL, action: { label: "Send an email", href: `mailto:${SUPPORT_EMAIL}` } },
];

export default function ContactPage() {
  return (
    <div className="section py-10 sm:py-14">
      <h1 className="font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[40px]">Contact Us</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Questions about a device, a plan, or an application you&apos;ve already submitted — we&apos;re here to help.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_22rem]">
        <ContactForm />

        <div className="flex flex-col gap-4">
          {cards.map((c) => (
            <div key={c.title} className="rounded-xl bg-surface shadow-md p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-050 text-brand">
                <c.icon className="h-4.5 w-4.5" strokeWidth={1.7} />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">{c.title}</p>
              <p className="mt-0.5 text-xs text-muted">{c.body}</p>
              <a href={c.action.href} target={c.action.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-brand hover:underline">
                {c.action.label} →
              </a>
            </div>
          ))}

          <div className="rounded-xl bg-surface shadow-md p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-050 text-brand">
              <MapPin className="h-4.5 w-4.5" strokeWidth={1.7} />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">Visit us</p>
            <a href={STORE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="mt-0.5 block text-xs text-muted hover:text-ink">
              {STORE_ADDRESS}
            </a>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
              <Clock className="h-3.5 w-3.5" /> {STORE_HOURS}
            </p>
            <p className="text-xs text-muted">{STORE_HOURS_NOTE}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
