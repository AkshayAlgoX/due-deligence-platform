// frontend/src/app/security/page.jsx

import BackButton from "@/components/BackButton";
import {
  Shield,
  Lock,
  Key,
  Users,
  Fingerprint,
  Cookie,
  Server,
  Mail,
  Clock,
  Gauge,
  ShieldCheck,
  Trash2,
  MapPin,
  Database,
  Globe,
  AlertTriangle,
} from "lucide-react";

export const metadata = {
  title: "Security — Real Estate Due Diligence Platform",
  description:
    "How we protect your data. Honest disclosure of what is built today and what is on the roadmap.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f8fffb] to-[#edf7f3]">

      {/* ── Back link ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-6 pt-8">
        <BackButton fallback="/login" />
      </div>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <header className="mx-auto max-w-4xl px-6 pt-12 pb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22C55E]/10">
          <Shield className="h-6 w-6 text-[#22C55E]" strokeWidth={2.2} />
        </div>

        <h1 className="mt-6 text-[42px] font-black tracking-tight text-gray-900 leading-[1.1]">
          Security
        </h1>

        <p className="mt-3 max-w-2xl text-base text-gray-600 leading-relaxed">
          We take your data seriously. This page documents exactly what
          protections are in place today, and what we are building next.
          No marketing spin — just the facts.
        </p>

        <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
          <Clock className="h-3.5 w-3.5" />
          <span>
            Last updated:{" "}
            {new Date().toLocaleDateString("en-IN", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-24 space-y-16">

        {/* ── Section 1: In production ─────────────────────────────── */}
        <section>
          <SectionLabel color="green" text="In production" />
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900">
            What is built and running today
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Every item below is implemented, tested, and running in the
            current build. Nothing aspirational.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ACTIVE_CONTROLS.map((item) => (
              <Feature key={item.title} {...item} />
            ))}
          </div>
        </section>

        {/* ── Section 2: Third-party integrations ──────────────────── */}
        <section>
          <SectionLabel color="green" text="External data" />
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900">
            Third-party data sources
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            The platform fetches data from external APIs on your behalf.
            Here is exactly what we call, when, and why.
          </p>

          <div className="mt-6 space-y-3">
            {THIRD_PARTY_SOURCES.map((item) => (
              <ThirdPartyRow key={item.name} {...item} />
            ))}
          </div>
        </section>

        {/* ── Section 3: Data handling ─────────────────────────────── */}
        <section>
          <SectionLabel color="green" text="Data handling" />
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900">
            How we handle your data
          </h2>

          <div className="mt-6 space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {DATA_PRACTICES.map((item, i) => (
              <div
                key={item.title}
                className={i > 0 ? "border-t border-gray-100 pt-4" : ""}
              >
                <p className="text-sm font-bold text-gray-900">{item.title}</p>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 4: On the roadmap ────────────────────────────── */}
        <section>
          <SectionLabel color="gray" text="Planned" />
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900">
            On the roadmap
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Not built yet. We would rather disclose these gaps openly than
            pretend they are already solved.
          </p>

          <div className="mt-6 space-y-2">
            {ROADMAP.map((item) => (
              <RoadmapRow key={item.title} {...item} />
            ))}
          </div>
        </section>

        {/* ── Section 5: Report a vulnerability ───────────────────── */}
        <section>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#22C55E]/10">
                <Mail className="h-5 w-5 text-[#22C55E]" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold tracking-tight text-gray-900">
                  Found a vulnerability?
                </h3>
                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                  If you discover a security issue, please email us before
                  disclosing publicly. We aim to respond within 48 hours.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5">
                  <code className="text-sm font-mono text-gray-900">
                    duedeligence8@gmail.com
                  </code>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer note ─────────────────────────────────────────── */}
        <div className="border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400 leading-relaxed">
            This page is intentionally short and honest. We do not claim
            certifications we do not have — no SOC 2, no ISO 27001, no
            PCI DSS. When we earn them, they will be listed here with
            dates and certificate numbers.
          </p>
        </div>

      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Sub-components                                                          */
/* ─────────────────────────────────────────────────────────────────────── */

function SectionLabel({ color, text }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-1 w-8 rounded-full ${
          color === "green" ? "bg-[#22C55E]" : "bg-gray-300"
        }`}
      />
      <p
        className={`text-[11px] font-bold uppercase tracking-widest ${
          color === "green" ? "text-[#22C55E]" : "text-gray-500"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

function Feature({ icon: Icon, title, description }) {
  return (
    <div className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-[#22C55E]/40 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#22C55E]/10 text-[#22C55E]">
          <Icon className="h-4 w-4" strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900">{title}</p>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function ThirdPartyRow({ name, purpose, dataShared, status }) {
  const statusColors = {
    live:  "bg-green-100 text-green-700",
    mock:  "bg-amber-100 text-amber-700",
    none:  "bg-gray-100 text-gray-500",
  };
  const statusLabels = {
    live:  "Live",
    mock:  "Sample data",
    none:  "No call made",
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-900">{name}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                statusColors[status]
              }`}
            >
              {statusLabels[status]}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-700">Purpose:</span>{" "}
            {purpose}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-700">Data shared:</span>{" "}
            {dataShared}
          </p>
        </div>
      </div>
    </div>
  );
}

function RoadmapRow({ title, description, milestone }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white/60 p-4 transition hover:bg-white">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <p className="text-sm font-bold text-gray-900">{title}</p>
        </div>
        <p className="mt-1 text-xs text-gray-500 leading-relaxed pl-5">
          {description}
        </p>
      </div>
      <span className="flex-shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600">
        {milestone}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Content — all accurate as of current build                             */
/* ─────────────────────────────────────────────────────────────────────── */

const ACTIVE_CONTROLS = [
  {
    icon: Lock,
    title: "BCrypt password hashing",
    description:
      "Passwords are hashed with BCrypt (cost factor 10) before storage. We never store plain text and cannot recover passwords.",
  },
  {
    icon: Key,
    title: "JWT authentication",
    description:
      "Signed HS256 tokens with 1-hour expiry. Expired tokens return 401 and trigger a clean logout. Secrets live in server-side environment variables only.",
  },
  {
    icon: Users,
    title: "Role-based access control",
    description:
      "Five roles: Buyer, Agent, Legal Reviewer, Financial Institution, Admin. Every API endpoint is protected with @PreAuthorize — roles enforced at the server, not just the UI.",
  },
  {
    icon: Fingerprint,
    title: "Google OAuth 2.0",
    description:
      "Google ID tokens are verified server-side using Google's public keys before we trust the identity. A mandatory 2-step profile completion flow runs on first sign-in.",
  },
  {
    icon: Gauge,
    title: "Rate limiting",
    description:
      "Bucket4j enforces per-endpoint limits: login 5/min, forgot password 3/hr, register 10/hr, OTP verification 10/10min. Breaches return HTTP 429.",
  },
  {
    icon: ShieldCheck,
    title: "OTP-based password reset",
    description:
      "Password resets require a 6-digit OTP delivered to your registered email via Gmail SMTP. OTPs expire and are single-use.",
  },
  {
    icon: Server,
    title: "Input validation",
    description:
      "Every request is validated at the DTO level — email format, field lengths, required fields. Invalid input is rejected before it reaches the database.",
  },
  {
    icon: Cookie,
    title: "Consent-gated analytics",
    description:
      "Google Analytics only initialises after explicit user consent via our cookie banner. Decline and no tracking scripts run at all.",
  },
  {
    icon: Trash2,
    title: "Account deletion",
    description:
      "Users can permanently delete their account from the profile page. All associated properties and snapshots are cascade-deleted from the database immediately.",
  },
  {
    icon: Database,
    title: "Caffeine response cache",
    description:
      "Aggregated property data is cached server-side for 1 hour (max 500 entries). Third-party APIs are not called more than necessary, reducing your data exposure to external services.",
  },
];

const THIRD_PARTY_SOURCES = [
  {
    name: "WAQI — World Air Quality Index API",
    purpose:
      "Fetches real-time AQI readings for properties in Indian cities that have CPCB monitoring stations.",
    dataShared:
      "City name or nearest station identifier. No personal data, no property address.",
    status: "live",
  },
  {
    name: "Nominatim — OpenStreetMap geocoding",
    purpose:
      "Converts property addresses to latitude/longitude coordinates for the portfolio map.",
    dataShared:
      "Property address string (city, state, India). No user identity is included in geocoding requests.",
    status: "live",
  },
  {
    name: "Google OAuth 2.0",
    purpose:
      "Verifies your Google identity during sign-in. We receive your name, email, and profile picture URL from Google.",
    dataShared:
      "Google ID token is sent to Google's token verification endpoint. No passwords involved.",
    status: "live",
  },
  {
    name: "Cloudinary",
    purpose:
      "Stores property images uploaded by users. The image URL is saved in our database; the file lives on Cloudinary's CDN.",
    dataShared:
      "The image file you upload. No personal metadata is attached to uploads.",
    status: "live",
  },
  {
    name: "Land registry, tax, zoning, flood, permits",
    purpose:
      "Property due diligence data across 6 domains. Real public APIs are not yet available for India at scale.",
    dataShared:
      "Nothing sent externally — these sections currently return sample data generated server-side. Labelled clearly as 'Sample data' in the UI.",
    status: "mock",
  },
  {
    name: "Google Analytics 4",
    purpose:
      "Page view and interaction analytics. Only active after explicit cookie consent.",
    dataShared:
      "Anonymised page paths and events. No property data, no personal identifiers sent to Google Analytics.",
    status: "live",
  },
];

const DATA_PRACTICES = [
  {
    title: "What we store",
    description:
      "Name, email, phone number, role, and optionally a Google profile picture URL. Property records include address, city, state, ZIP, coordinates (latitude/longitude), market value, and details you provide. Daily portfolio snapshots (total value, property count, city count) are stored for trend charts — these contain no personally identifiable information beyond a user ID.",
  },
  {
    title: "What we never store",
    description:
      "Payment information, government IDs, Aadhaar numbers, PAN numbers, or sensitive financial documents. Passwords are stored only as one-way BCrypt hashes — we cannot recover or view them.",
  },
  {
    title: "Where it lives",
    description:
      "PostgreSQL 18 database with restricted network access. Property images are stored on Cloudinary via their upload API — only the public URL is saved in our database. All environment secrets (JWT key, DB credentials, API keys) are stored in server-side .env files and are never exposed to the browser.",
  },
  {
    title: "Risk scores",
    description:
      "Risk scores are computed on-demand from your property data using a rule-based engine. They are cached server-side for 1 hour and are never sold or shared with third parties. The scoring rules are documented in the codebase — no black-box algorithms.",
  },
  {
    title: "Who can see your data",
    description:
      "Only you and users with an appropriate role. Admins have broader read access for platform moderation, enforced by RBAC at every API endpoint. No employee has routine access to property records.",
  },
  {
    title: "Deleting your data",
    description:
      "Deleting your account from the profile page permanently removes your user record, all properties you created, and all associated portfolio snapshots. This is immediate and irreversible — we do not retain soft-deleted records.",
  },
];

const ROADMAP = [
  {
    title: "Refresh tokens",
    description:
      "Longer-lived refresh tokens so sessions survive beyond the current 1-hour JWT window without requiring re-login.",
    milestone: "M4",
  },
  {
    title: "Two-factor authentication",
    description:
      "Optional TOTP (Google Authenticator compatible) for accounts that want stronger login protection.",
    milestone: "M4",
  },
  {
    title: "Audit logs",
    description:
      "Immutable log of security-sensitive actions — logins, role changes, property edits, account deletions — queryable by admins.",
    milestone: "M4",
  },
  {
    title: "Token revocation / logout across devices",
    description:
      "Currently a JWT cannot be invalidated before expiry. A server-side token denylist would allow forced logout on all devices.",
    milestone: "M4",
  },
  {
    title: "Automated dependency scanning",
    description:
      "CI pipeline checks for known CVEs in npm and Maven dependencies on every push using Dependabot or Snyk.",
    milestone: "CI/CD",
  },
  {
    title: "Third-party penetration testing",
    description:
      "External security audit before any public production release.",
    milestone: "Pre-launch",
  },
];