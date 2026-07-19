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
  ArrowLeft,
  Clock,
  CircleCheck,
} from "lucide-react";

export const metadata = {
  title: "Security — Real Estate Due Diligence Agent",
  description:
    "How we protect your data. Honest disclosure of what we do today and what's on our roadmap.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f8fffb] to-[#edf7f3]">
      {/* ── Back link ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-6 pt-8">
       <BackButton fallback="/login" />
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <header className="mx-auto max-w-4xl px-6 pt-12 pb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22C55E]/10">
          <Shield className="h-6 w-6 text-[#22C55E]" strokeWidth={2.2} />
        </div>

        <h1 className="mt-6 text-[42px] font-black tracking-tight text-gray-900 leading-[1.1]">
          Security
        </h1>

        <p className="mt-3 max-w-2xl text-base text-gray-600 leading-relaxed">
          We take your data seriously. This page documents exactly what
          protections are in place today, and what we're building next.
          No marketing spin — just the facts.
        </p>

        <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
          <Clock className="h-3.5 w-3.5" />
          <span>Last updated: {new Date().toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric"
          })}</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-24">
        {/* ── Section 1: What we do today ─────────────────────────────── */}
        <section className="mt-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-1 w-8 rounded-full bg-[#22C55E]" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#22C55E]">
              In production
            </p>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
            What we do today
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Every item below is implemented and running in production.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ACTIVE_CONTROLS.map((item) => (
              <Feature key={item.title} {...item} />
            ))}
          </div>
        </section>

        {/* ── Section 2: On the roadmap ────────────────────────────────── */}
        <section className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-1 w-8 rounded-full bg-gray-300" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              Planned
            </p>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
            On the roadmap
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Not built yet — but on our list. We'd rather disclose these openly
            than pretend they exist.
          </p>

          <div className="mt-6 space-y-2">
            {ROADMAP.map((item) => (
              <RoadmapRow key={item.title} {...item} />
            ))}
          </div>
        </section>

        {/* ── Section 3: Data handling ─────────────────────────────────── */}
        <section className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-1 w-8 rounded-full bg-[#22C55E]" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#22C55E]">
              Data handling
            </p>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
            How we handle your data
          </h2>

          <div className="mt-6 space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {DATA_PRACTICES.map((item, i) => (
              <div
                key={item.title}
                className={`${i > 0 ? "border-t border-gray-100 pt-4" : ""}`}
              >
                <p className="text-sm font-bold text-gray-900">{item.title}</p>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 4: Report a vulnerability ────────────────────────── */}
        <section className="mt-16">
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

        {/* ── Footer note ──────────────────────────────────────────────── */}
        <div className="mt-16 border-t border-gray-100 pt-8">
          <p className="text-xs text-gray-400 leading-relaxed">
            This page is intentionally short and honest. We don't claim
            certifications we don't have (no SOC 2, no ISO 27001, no PCI DSS).
            When we earn them, they'll be listed here with dates and
            certificate numbers.
          </p>
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Sub-components                                                         */
/* ─────────────────────────────────────────────────────────────────────── */

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

function RoadmapRow({ title, description, milestone }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white/60 p-4 transition hover:bg-white">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
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
/* Content                                                                */
/* ─────────────────────────────────────────────────────────────────────── */

const ACTIVE_CONTROLS = [
  {
    icon: Lock,
    title: "BCrypt password hashing",
    description:
      "Passwords are hashed with BCrypt (cost factor 10) before storage. We can never see or recover them.",
  },
  {
    icon: Key,
    title: "JWT authentication",
    description:
      "Signed HS256 tokens with 1-hour expiry. Expired tokens return 401 and trigger a clean logout.",
  },
  {
    icon: Users,
    title: "Role-based access control",
    description:
      "Five roles (Buyer, Agent, Legal Reviewer, Financial Institution, Admin) enforced at the API layer via @PreAuthorize.",
  },
  {
    icon: Fingerprint,
    title: "Google OAuth 2.0",
    description:
      "Google ID tokens are verified server-side using Google's public keys before we trust the identity.",
  },
  {
    icon: Server,
    title: "Input validation",
    description:
      "Every request is validated at the DTO level (email format, length, patterns). Invalid input never reaches the database.",
  },
  {
    icon: Cookie,
    title: "Consent-gated analytics",
    description:
      "Google Analytics only loads after explicit user consent. Reject and no tracking cookies are set.",
  },
];

const ROADMAP = [
  {
    title: "Rate limiting",
    description:
      "Throttle login and password-reset endpoints to prevent brute-force attempts.",
    milestone: "M2",
  },
  {
    title: "Refresh tokens",
    description:
      "Longer-lived refresh tokens so users aren't logged out every hour.",
    milestone: "M2",
  },
  {
    title: "Two-factor authentication",
    description:
      "Optional TOTP (Google Authenticator) for accounts that want extra protection.",
    milestone: "M3",
  },
  {
    title: "Audit logs",
    description:
      "Immutable log of security-sensitive actions (logins, role changes, property edits).",
    milestone: "M3",
  },
  {
    title: "Automated dependency scanning",
    description:
      "CI checks for known vulnerabilities in npm and Maven dependencies on every push.",
    milestone: "CI/CD",
  },
  {
    title: "Third-party penetration testing",
    description:
      "External security audit before the first public production release.",
    milestone: "Pre-launch",
  },
];

const DATA_PRACTICES = [
  {
    title: "What we store",
    description:
      "Name, email, phone number, role, and (optionally) a Google profile picture URL. Property records include address, city, and details you provide.",
  },
  {
    title: "What we never store",
    description:
      "Payment information, government IDs, or sensitive financial data. Passwords are only stored as one-way BCrypt hashes.",
  },
  {
    title: "Where it lives",
    description:
      "PostgreSQL database with restricted network access. Uploaded images are stored on Cloudinary via signed uploads.",
  },
  {
    title: "Who can see it",
    description:
      "Only you and users with an appropriate role. Admins have broader visibility for platform moderation, enforced by RBAC.",
  },
];