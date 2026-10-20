import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing device financing applications with West Quest Limited.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="section max-w-2xl py-10 sm:py-14">
      <div className="tag-corner-sm mb-8 border border-warning/30 bg-warning-050 p-4 text-sm text-ink">
        <strong>Draft content — requires legal review before go-live.</strong> Lease-to-own financing involves
        default, late-payment and repossession terms that must be drafted (or verified) by a lawyer qualified in
        Kenyan consumer-credit law before this page is published as binding.
      </div>

      <h1 className="font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[40px]">Terms of Service</h1>
      <p className="mt-2 text-xs text-muted">Last updated: {new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}</p>

      <div className="prose-sm mt-6 space-y-5 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-ink">Applications</h2>
          <p className="mt-1">
            Submitting an application through this website is a request to be considered for a device financing
            plan. It is not a guarantee of approval. We may ask for additional verification before approving an
            application.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-ink">Pricing</h2>
          <p className="mt-1">
            Deposit and daily payment figures shown on the site are current at the time of viewing and may change.
            The figures confirmed at the time your application is approved are the ones that apply.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-ink">Payments</h2>
          <p className="mt-1">
            This website does not process payments. Deposits and daily payments are collected directly by our team
            and confirmed separately — see our Contact page for details.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-ink">Ownership</h2>
          <p className="mt-1">[Placeholder — to be finalised with legal counsel: terms on when ownership transfers, default, and device repossession.]</p>
        </section>
      </div>
    </div>
  );
}
