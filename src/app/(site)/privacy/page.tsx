import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How West Quest Limited collects, uses and protects your information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="section max-w-2xl py-10 sm:py-14">
      <div className="tag-corner-sm mb-8 border border-warning/30 bg-warning-050 p-4 text-sm text-ink">
        <strong>Draft content.</strong> This page is a placeholder and has not been reviewed by a lawyer. Review and
        replace before go-live — financing applications collect ID numbers and phone numbers, which carries specific
        data-protection obligations in Kenya (the Data Protection Act, 2019).
      </div>

      <h1 className="font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[40px]">Privacy Policy</h1>
      <p className="mt-2 text-xs text-muted">Last updated: {new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="prose-sm mt-6 space-y-5 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-ink">What we collect</h2>
          <p className="mt-1">
            When you submit a financing application we collect your name, phone number, and optionally your location
            and national ID number. We use this to review your application and to contact you about it.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-ink">How we use it</h2>
          <p className="mt-1">
            Your details are used only to process your application, verify your identity, and communicate with you —
            typically over WhatsApp or phone. We do not sell your information to third parties.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-ink">How long we keep it</h2>
          <p className="mt-1">Application records are retained for as long as needed to service your account and meet our legal obligations.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-ink">Your rights</h2>
          <p className="mt-1">
            You can ask us what information we hold about you, or ask us to correct or delete it, by contacting us —
            see the Contact page.
          </p>
        </section>
      </div>
    </div>
  );
}
