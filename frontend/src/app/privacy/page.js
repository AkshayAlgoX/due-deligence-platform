"use client";

import MarketingLayout from "@/components/landing/MarketingLayout";

const SECTIONS = [
  {
    id: "data-we-collect",
    title: "1. Data we collect",
    body: (
      <>
        <p>
          We collect only what is needed to operate the due diligence platform. All collection
          is tied to a stated purpose; we do not collect data speculatively.
        </p>
        <ul>
          <li><strong>Account data</strong> — full name, professional email address, phone number (optional), and the role you select (buyer, agent, legal reviewer, financial institution, or administrator).</li>
          <li><strong>Property data you submit</strong> — property address, city, state, PIN code, property type, area, market value, year built, photographs, and any verification details you enter. You are responsible for having the right to submit third-party property information.</li>
          <li><strong>Verification and risk data</strong> — results fetched from government and third-party sources during risk assessment: flood zone classification (NDMA/CWC), ownership registry records, municipal tax records, zoning classification, building permits, and air quality readings (CPCB via WAQI).</li>
          <li><strong>Usage data</strong> — pages visited, features used, report generation events, and export downloads. We use this to operate the platform and measure reliability, not to profile individuals.</li>
          <li><strong>Payment data</strong> — handled entirely by Cashfree. We never see or store your full card number, UPI VPA credentials, or net-banking passwords. We store only the transaction reference, amount, currency, and status that Cashfree returns to us.</li>
          <li><strong>Technical data</strong> — IP address, browser user-agent, and timestamps, retained in audit logs for security and fraud prevention as required under the Information Technology Act, 2000.</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "2. How we use your data",
    body: (
      <ul>
        <li><strong>Operating the service</strong> — creating your account, generating due diligence reports, calculating risk scores, and delivering PDF/Excel exports.</li>
        <li><strong>Verification</strong> — confirming your email via OTP and your identity via Google OAuth when you choose that sign-in method.</li>
        <li><strong>Security and abuse prevention</strong> — rate limiting, login alerts, audit logging, and fraud detection on payment events.</li>
        <li><strong>Billing and plan enforcement</strong> — tracking report usage against your subscription plan limits.</li>
        <li><strong>Support</strong> — responding to contact-form submissions and support emails you send us.</li>
        <li><strong>Product improvement</strong> — aggregated, anonymised statistics (for example, average risk distribution across cities). We never sell personal data or use your property data to train third-party models.</li>
      </ul>
    ),
  },
  {
    id: "sharing",
    title: "3. Data sharing",
    body: (
      <>
        <p>We share data only with processors who are contractually bound to use it solely for the stated purpose:</p>
        <ul>
          <li><strong>Cashfree Payments India Ltd</strong> — payment processing. Receives your name, email, and order amount; returns transaction status.</li>
          <li><strong>Google LLC</strong> — only if you choose Google Sign-In. Receives a sign-in request; returns your verified email and name.</li>
          <li><strong>WAQI / CPCB stations</strong> — we send a city name to fetch air quality data. No personal data is transmitted.</li>
          <li><strong>OpenStreetMap Nominatim</strong> — we send property address strings for geocoding. No personal data is transmitted.</li>
          <li><strong>Email delivery (Gmail SMTP)</strong> — transactional emails (OTP, alerts) are sent through Google's mail infrastructure.</li>
        </ul>
        <p>
          We do not sell, rent, or trade personal data. We do not share property data with
          advertisers, data brokers, or unrelated third parties.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "4. Cookies and analytics",
    body: (
      <ul>
        <li><strong>Essential cookies</strong> — your session token (auth_token) and user profile (auth_user), stored in your browser to keep you signed in. These are Strictly Necessary and cannot be disabled.</li>
        <li><strong>Consent-based analytics</strong> — Google Analytics 4 loads only after you opt in via the cookie banner. Before consent, zero analytics scripts execute. You can withdraw consent at any time from the cookie preferences panel.</li>
        <li><strong>Local storage</strong> — interface preferences (theme, language, collapsed sidebar sections) that stay on your device and are never transmitted to our servers.</li>
      </ul>
    ),
  },
  {
    id: "security",
    title: "5. How we protect your data",
    body: (
      <ul>
        <li>Passwords hashed with BCrypt (strength factor 10) — never stored or transmitted in plain text.</li>
        <li>One-time passwords (OTPs) are hashed at rest for registration and expire after 10 minutes with a 5-attempt limit.</li>
        <li>Transport-layer encryption (HTTPS/HSTS) enforced for all browser traffic.</li>
        <li>JWT sessions are stateless and revocable — the "sign out everywhere" feature invalidates every active session instantly.</li>
        <li>Per-IP rate limiting on login, OTP, and export endpoints using Bucket4j.</li>
        <li>Immutable audit log of every authentication event, property change, and report generation with IP address and user-agent capture.</li>
        <li>Content Security Policy headers, X-Frame-Options DENY, and strict CORS allowlists on every response.</li>
        <li>Database access restricted to the application server via PostgreSQL role-based credentials; production data never leaves India per our data residency commitment.</li>
      </ul>
    ),
  },
  {
    id: "rights",
    title: "6. Your rights",
    body: (
      <>
        <p>Under the GDPR (if you are in the EU/EEA) and the Information Technology Act, 2000 read with the DPDP Act, 2023 (if you are in India), you have the right to:</p>
        <ul>
          <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
          <li><strong>Correction</strong> — fix inaccurate data (you can update your name and phone in Profile; email changes require support verification).</li>
          <li><strong>Deletion</strong> — delete your account at any time from Profile → Danger zone. This permanently removes your profile, properties, reports, and session data from our database (cascade delete).</li>
          <li><strong>Portability</strong> — export your property and report data in machine-readable formats (CSV/Excel/PDF exports are built into the product).</li>
          <li><strong>Withdraw consent</strong> — disable analytics tracking at any time via the cookie preferences panel.</li>
          <li><strong>Grievance redressal</strong> — contact our Data Protection Officer (below) for any privacy complaint.</li>
        </ul>
      </>
    ),
  },
  {
    id: "retention",
    title: "7. Data retention",
    body: (
      <ul>
        <li><strong>Account and property data</strong> — retained while your account is active, deleted immediately (cascade) when you delete your account.</li>
        <li><strong>Audit logs</strong> — retained for 24 months for security and compliance under IT Act 2000 reasonable-security requirements.</li>
        <li><strong>Pending registrations</strong> (accounts never verified) — automatically deleted after 24 hours.</li>
        <li><strong>Payment records</strong> — retained for 8 years as required by Indian income-tax law (Section 44AA).</li>
        <li><strong>OTPs</strong> — deleted upon use or expiry (10 minutes).</li>
        <li><strong>Analytics events</strong> — retained in aggregate for 26 months (GA4 default).</li>
      </ul>
    ),
  },
  {
    id: "dpo",
    title: "8. Data Protection Officer & contact",
    body: (
      <>
        <p>
          For any privacy-related request, complaint, or question about this policy, contact:
        </p>
        <ul>
          <li><strong>Data Protection Officer</strong> — dpo@redd.in</li>
          <li><strong>Postal address</strong> — Real Estate Due Diligence Platform, HSR Layout Sector 3, Bengaluru, Karnataka 560102, India</li>
          <li><strong>Response time</strong> — we acknowledge all privacy requests within 72 hours and resolve them within 30 days.</li>
        </ul>
        <p>
          If you are in India and are dissatisfied with our response, you may approach the
          Data Protection Board of India once constituted under the DPDP Act, 2023.
          EU/EEA residents may lodge a complaint with their local supervisory authority.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-16">
        <p className="text-[12px] font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-4">Legal</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Privacy Policy</h1>
        <p className="mt-4 text-[14px] text-white/50">
          Effective date: <span className="text-white/80">June 1, 2025</span> · Real Estate Due Diligence Platform, Bengaluru, India
        </p>
        <p className="mt-6 text-[15px] leading-relaxed text-white/60">
          This policy explains what data we collect when you use our property due diligence
          platform, why we collect it, who we share it with, and the rights you hold over it.
          We process property records, government registry data, and risk assessments —
          which means we take accuracy and confidentiality seriously.
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
