"use client";

import MarketingLayout from "@/components/landing/MarketingLayout";

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of these terms",
    body: (
      <p>
        By creating an account, accessing, or using the Real Estate Due Diligence Platform
        ("the Platform", "we", "us"), operated from Bengaluru, Karnataka, India, you agree to
        be bound by these Terms of Service. If you are using the Platform on behalf of an
        organisation, you represent that you have authority to bind that organisation. If you
        do not agree, do not create an account or use the Platform.
      </p>
    ),
  },
  {
    id: "service",
    title: "2. Service description",
    body: (
      <>
        <p>
          The Platform provides property due diligence tooling: automated risk scoring across
          six categories (flood, legal, tax, zoning, environmental, market), aggregation of
          government and third-party property records, generation of due diligence reports in
          PDF/Excel/CSV formats, property comparison, valuation estimates, and team
          collaboration features on paid plans.
        </p>
        <p>
          We reserve the right to modify, suspend, or discontinue any feature at any time with
          reasonable notice. We will notify you of material changes by email or in-product
          notice at least 7 days in advance where feasible.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "3. User accounts and security",
    body: (
      <ul>
        <li>You must provide accurate registration information and keep it current.</li>
        <li>You are solely responsible for maintaining the confidentiality of your password. We will never ask for your password or OTP by email or phone.</li>
        <li>Notify us immediately at duedeligence8@gmail.com if you believe your account has been compromised. The "Sign out of all devices" control is available in your Profile for exactly this situation.</li>
        <li>One account per natural person. Sharing credentials between team members is prohibited — paid plans include team seats for this purpose.</li>
        <li>We may suspend or terminate accounts that violate these terms, pose a security risk, or are used for unlawful purposes.</li>
      </ul>
    ),
  },
  {
    id: "billing",
    title: "4. Subscription and billing",
    body: (
      <ul>
        <li>Free plan: 3 due diligence reports per calendar month, watermarked PDF exports, no API access.</li>
        <li>Pro plan (₹499/month): unlimited reports, priority generation, all export formats, white-label PDFs.</li>
        <li>Business plan (₹1,999/month): everything in Pro plus 5 team seats, REST API access (10,000 calls/month), custom branding, bulk upload.</li>
        <li>Enterprise: custom pricing and terms via a separate agreement.</li>
        <li>Payments are processed by Cashfree Payments India Ltd in Indian Rupees. We do not store card details.</li>
        <li>Subscriptions auto-renew monthly unless cancelled. You may cancel at any time from Dashboard → Billing; access continues until the end of the paid period. No partial-month refunds.</li>
        <li>Failure to collect a renewal payment (expired card, insufficient funds) places your account on a 7-day grace period, after which it downgrades to Free. Report history is never deleted on downgrade.</li>
      </ul>
    ),
  },
  {
    id: "acceptable-use",
    title: "5. Acceptable use",
    body: (
      <ul>
        <li>You will not use the Platform to scrape, reverse-engineer, or extract its underlying data sources or scoring methodology for competing products.</li>
        <li>You will not upload malicious files, attempt to bypass plan limits, or probe the Platform's security controls.</li>
        <li>You will not submit property data you do not have the legal right to process.</li>
        <li>You will not use generated reports to misrepresent a property's condition to third parties.</li>
        <li>API access (Business plan) is limited to the documented rate limits; abuse results in throttling then revocation.</li>
      </ul>
    ),
  },
  {
    id: "ip",
    title: "6. Intellectual property",
    body: (
      <p>
        The Platform's software, scoring methodology, report templates, and branding are our
        exclusive property. We grant you a limited, non-exclusive, non-transferable licence to
        use the Platform for your internal due diligence purposes during your subscription term.
        Reports you generate belong to you, subject to the disclaimers in Section 7 — you may
        share, store, and use them freely. You grant us a licence to process the data you
        submit solely to provide the service, as detailed in the Privacy Policy.
      </p>
    ),
  },
  {
    id: "disclaimer",
    title: "7. Report accuracy disclaimer — read carefully",
    body: (
      <>
        <p>
          <strong>Due diligence reports are decision-support tools, not legal advice, not financial
          advice, and not a substitute for professional verification.</strong> Risk scores are produced
          by a rule-based engine using data from government sources, third-party APIs, and
          information you provide. Individual data sources may be unavailable, outdated, or
          sample-based; every report labels which sources were live and which were unavailable
          at generation time.
        </p>
        <p>
          You must independently verify title deeds, encumbrance certificates, tax clearances,
          and physical property condition through qualified professionals (registered valuers,
          property lawyers, structural engineers) before any purchase decision. We are not
          liable for decisions made in reliance on generated reports.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "8. Limitation of liability",
    body: (
      <p>
        To the maximum extent permitted by law, our aggregate liability arising out of or
        relating to the Platform shall not exceed the greater of (a) the subscription fees you
        paid in the 12 months preceding the claim, or (b) ₹5,000. In no event shall we be
        liable for indirect, incidental, special, consequential, or punitive damages, including
        lost profits, lost data, or lost investment opportunities, even if advised of the
        possibility of such damages.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "9. Governing law and jurisdiction",
    body: (
      <p>
        These terms are governed by the laws of India. Any dispute arising out of or in
        connection with these terms shall be subject to the exclusive jurisdiction of the
        courts of Karnataka, with venue in Bengaluru. Before initiating litigation, both
        parties agree to attempt good-faith resolution through the other party's contact
        channel for a period of 30 days.
      </p>
    ),
  },
  {
    id: "termination",
    title: "10. Termination",
    body: (
      <ul>
        <li><strong>By you:</strong> You may close your account at any time from Profile → Danger zone. Deletion is immediate and permanent; all properties, reports, and session data are removed via cascade delete.</li>
        <li><strong>By us:</strong> We may terminate or suspend your account for breach of these terms, non-payment after the grace period, or conduct that exposes the Platform to legal or security risk. Where practical, we provide 7 days' notice and the opportunity to remedy.</li>
        <li><strong>Effect of termination:</strong> your licence to use the Platform ends immediately. Clauses 6, 7, 8, and 9 survive termination.</li>
      </ul>
    ),
  },
];

export default function TermsPage() {
  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-16">
        <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-4">Legal</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Terms of Service</h1>
        <p className="mt-4 text-[14px] text-white/50">
          Effective date: <span className="text-white/80">June 1, 2025</span> · Real Estate Due Diligence Platform, Bengaluru, India
        </p>
        <p className="mt-6 text-[15px] leading-relaxed text-white/60">
          These terms govern your use of the Platform. Section 7 (report accuracy disclaimer)
          and Section 9 (governing law) are particularly important — please read them before
          relying on any generated report.
        </p>

        <div className="mt-12 space-y-12">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="space-y-4">
              <h2 className="text-xl font-bold text-white">{s.title}</h2>
              <div className="text-[14px] leading-relaxed text-white/60 [&_p]:mb-4 [&_ul]:space-y-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:text-white/85">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
