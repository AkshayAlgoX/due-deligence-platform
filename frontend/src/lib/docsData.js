// Documentation content for /docs — real articles, real endpoints.

export const DOCS_CATEGORIES = [
  { slug: "getting-started", label: "Getting Started" },
  { slug: "properties", label: "Properties" },
  { slug: "reports", label: "Reports" },
  { slug: "risk-analysis", label: "Risk Analysis" },
  { slug: "api-reference", label: "API Reference" },
  { slug: "integrations", label: "Integrations" },
  { slug: "billing", label: "Billing" },
  { slug: "security", label: "Security" },
];

export const DOCS_ARTICLES = [
  // ── GETTING STARTED ─────────────────────────────────────────
  {
    slug: "quickstart",
    category: "getting-started",
    title: "Quickstart: first property in 5 minutes",
    updated: "2026-08-10",
    body: (
      <>
        <p>Create an account, add a property, and get a full risk assessment — that's the whole loop, and it takes about five minutes.</p>
        <h3>Step 1: Create your account</h3>
        <p>Sign up with your professional email. We send a 6-digit OTP for verification — the code expires in 10 minutes. Choose your role carefully: buyers, agents, legal reviewers, and financial institutions see slightly different dashboards.</p>
        <h3>Step 2: Add a property</h3>
        <p>From the dashboard, click <strong>Add property</strong>. Only two fields are required — address and city. The address field has OpenStreetMap autocomplete for Indian addresses. Everything else (area, value, year built) can be filled later.</p>
        <h3>Step 3: Run verification</h3>
        <p>We run seven data-quality checks automatically: address, city, state, PIN, market value, area, and property type. Pass all seven and the property is marked <strong>Verified</strong> — instantly.</p>
        <h3>Step 4: View the risk score</h3>
        <p>Open the property and scroll to <strong>Risk Assessment</strong>. You'll see a 0–100 score across six weighted categories with explanations for every factor.</p>
        <h3>Step 5: Generate a report</h3>
        <p>Click <strong>Generate Report</strong>. Generation takes 10–30 seconds and produces a full PDF with cover page, executive summary, and per-category analysis.</p>
      </>
    ),
  },
  {
    slug: "roles-and-permissions",
    category: "getting-started",
    title: "Roles and permissions",
    updated: "2026-08-08",
    body: (
      <>
        <p>Every account has exactly one role. The role controls what you see in the sidebar and which API endpoints you can call.</p>
        <h3>BUYER</h3>
        <p>Individual property buyer. Can add properties, run risk assessments, generate reports, and compare up to 3 properties.</p>
        <h3>REAL_ESTATE_AGENT</h3>
        <p>Manages listings on behalf of clients. Same transactional features as buyers, with a portfolio-focused dashboard.</p>
        <h3>LEGAL_REVIEWER</h3>
        <p>Reviews legal risk factors. Has access to the full ownership history, permit records, and encumbrance-related scoring details.</p>
        <h3>FINANCIAL_INSTITUTION</h3>
        <p>Banks and lending partners. Focus on valuation methods, tax compliance, and market risk.</p>
        <h3>ADMIN</h3>
        <p>Platform operator. Sees every property and user across the platform, manages user roles and bans, and can export platform-wide analytics. Admins are redirected to the dedicated admin dashboard at <code>/dashboard/admin</code>.</p>
        <p>Roles are changed by admins only — you cannot self-promote. This prevents privilege escalation through the public registration flow, which explicitly rejects ADMIN as a selectable role.</p>
      </>
    ),
  },
  {
    slug: "dark-mode-and-language",
    category: "getting-started",
    title: "Themes, languages, and accessibility",
    updated: "2026-08-05",
    body: (
      <>
        <h3>Dark mode</h3>
        <p>The entire application is dark-mode-first with a GitHub-style palette (<code>#0d1117</code> background, <code>#161b22</code> cards). Toggle between light, dark, and system preference from the navbar theme switcher. Your choice persists in local storage.</p>
        <h3>Languages</h3>
        <p>The interface ships in 11 languages: English, Hindi, Bengali, Gujarati, Kannada, Malayalam, Marathi, Punjabi, Tamil, Telugu, and Urdu (RTL). Switch from the language selector in Settings — the change applies instantly across every page.</p>
        <h3>Keyboard and screen readers</h3>
        <p>All toggle switches expose <code>role="switch"</code> with aria-checked states. Modal dialogs trap focus. The command palette (<code>Ctrl+K</code>) is keyboard-navigable end to end.</p>
      </>
    ),
  },
  {
    slug: "support",
    category: "getting-started",
    title: "Getting help",
    updated: "2026-08-03",
    body: (
      <>
        <p>Three ways to reach us, in order of speed:</p>
        <ul>
          <li><strong>In-app support page</strong> — <code>/support</code> has a searchable FAQ covering the 20 most common questions.</li>
          <li><strong>Email</strong> — duedeligence8@gmail.com. We reply within 24 hours on business days; enterprise customers have a 4-hour SLA.</li>
          <li><strong>Contact form</strong> — <code>/contact</code> for enterprise sales, partnerships, and billing questions.</li>
        </ul>
        <p>If you're reporting a bug, include the property ID, report ID, and the time the error occurred. Our audit logs let us trace the exact request.</p>
      </>
    ),
  },

  // ── PROPERTIES ──────────────────────────────────────────────
  {
    slug: "adding-properties",
    category: "properties",
    title: "Adding and completing properties",
    updated: "2026-08-10",
    body: (
      <>
        <p>Properties start minimal and become more valuable as you complete them. Every field you add increases the verification score and improves risk accuracy.</p>
        <h3>Required fields</h3>
        <p>Address and city are required at creation. The address field uses OpenStreetMap Nominatim autocomplete restricted to India (<code>countrycodes=in</code>), so suggestions are always Indian addresses.</p>
        <h3>The 7 verification checks</h3>
        <ol>
          <li>Street address</li>
          <li>City</li>
          <li>State</li>
          <li>PIN code (exactly 6 digits)</li>
          <li>Market value (₹)</li>
          <li>Area (sq.ft)</li>
          <li>Property type</li>
        </ol>
        <p>Missing any check keeps the property <strong>Pending</strong>. Verified properties get a green badge, appear first in comparisons, and receive a −5 point market-risk discount in scoring.</p>
        <h3>Coordinates and geocoding</h3>
        <p>Properties are geocoded automatically after save. The service rate-limits itself to 1 request/second to respect Nominatim's usage policy. Admins can batch-backfill missing coordinates from the admin panel.</p>
      </>
    ),
  },
  {
    slug: "property-photos",
    category: "properties",
    title: "Photos and attachments",
    updated: "2026-08-07",
    body: (
      <p>
        Each property supports one primary photo (JPG, PNG, or WebP up to 5 MB). The photo
        appears on the property card, in search results, and on the cover of generated reports.
        Upload from the property's quick-image control or the edit modal. Photos are removed
        when you delete the property — nothing lingers in storage.
      </p>
    ),
  },
  {
    slug: "comparing-properties",
    category: "properties",
    title: "Comparing properties",
    updated: "2026-08-06",
    body: (
      <>
        <p>Compare up to 3 properties side by side — financials, risk scores, verification status, and environmental data in one view.</p>
        <h3>How to compare</h3>
        <ol>
          <li>Go to Property Search.</li>
          <li>Tick the compare checkbox on each property card (max 3).</li>
          <li>Click <strong>Compare</strong> in the bottom bar.</li>
        </ol>
        <h3>Saving comparisons</h3>
        <p>Name and save any comparison — it appears in Saved Comparisons for quick reload. Saved comparisons keep a snapshot of the property IDs; scores update live when you reload.</p>
      </>
    ),
  },
  {
    slug: "property-labels",
    category: "properties",
    title: "Property labels (NEW, HOT, VERIFIED…)",
    updated: "2026-08-04",
    body: (
      <>
        <p>Labels make portfolios scannable. The system assigns automatic labels (NEW, PRICE_DROP, VERIFIED, SOLD, UNDER_OFFER) from property activity, and admins can add manual labels with an expiry date.</p>
        <h3>Automatic labels</h3>
        <ul>
          <li><strong>NEW</strong> — added within the last 30 days.</li>
          <li><strong>PRICE_DROP</strong> — market value decreased since the previous edit.</li>
          <li><strong>VERIFIED</strong> — passed all 7 quality checks.</li>
        </ul>
        <p>Automatic labels recalculate hourly; expired manual labels are purged every 15 minutes.</p>
      </>
    ),
  },

  // ── REPORTS ─────────────────────────────────────────────────
  {
    slug: "generating-reports",
    category: "reports",
    title: "Generating a due diligence report",
    updated: "2026-08-10",
    body: (
      <>
        <p>Reports are generated asynchronously. When you click <strong>Generate Report</strong>, the system creates a <code>PENDING</code> shell, dispatches generation to a background worker, and your dashboard polls for completion.</p>
        <h3>The lifecycle</h3>
        <ol>
          <li><strong>PENDING</strong> — shell created; queued for generation.</li>
          <li><strong>GENERATING</strong> — worker is fetching risk data and building sections.</li>
          <li><strong>COMPLETED</strong> — all 8 sections built; report is viewable.</li>
          <li><strong>FAILED</strong> — a data source error occurred; retry with <code>forceRecalculate</code>.</li>
        </ol>
        <h3>Idempotency</h3>
        <p>Submitting the same property twice within 60 seconds returns the in-flight report instead of creating a duplicate. Regeneration always creates a <em>new version</em> — the original is preserved for audit.</p>
        <h3>What's inside</h3>
        <p>Cover page, executive summary, property overview, 6-category risk analysis, comparable properties, financial analysis (ownership, tax, permits), recommendations, and an appendix with data-source methodology.</p>
      </>
    ),
  },
  {
    slug: "exporting-reports",
    category: "reports",
    title: "PDF, Excel, and CSV exports",
    updated: "2026-08-09",
    body: (
      <>
        <p>Every report can be exported in three formats, each built by a dedicated pipeline.</p>
        <h3>PDF</h3>
        <p>Premium layout with Inter typography, cover page, per-section renderers, risk gauge charts (JFreeChart), and a subtle watermark. Free plan PDFs include the watermark; Pro removes it.</p>
        <h3>Excel</h3>
        <p>A 3-sheet workbook: Executive Dashboard (KPIs, risk chips), Detailed Analysis (per-category breakdowns), and Data Sources (every API call, its status, and timestamp).</p>
        <h3>CSV</h3>
        <p>Flat data export for the audit-log and portfolio views. UTF-8 with BOM so Excel opens Indian-script text correctly. Values are RFC-4180 escaped.</p>
        <h3>Export history</h3>
        <p>Every export is recorded with format, size, and timestamp. Re-download anytime from <code>/reports/export-history</code> — if the underlying report was deleted, you'll get a clear message instead of a silent failure.</p>
      </>
    ),
  },
  {
    slug: "report-versions",
    category: "reports",
    title: "Version history and regeneration",
    updated: "2026-08-08",
    body: (
      <>
        <p>Regenerating a report never overwrites the original. Each regeneration creates version N+1 with fresh risk data (force recalculation is always on for regenerations).</p>
        <p>Version history lives inside the report viewer — flip between versions to see how the risk score moved over time. The PDF header shows the version number, and the share link always points to the latest version unless you pin an older one.</p>
      </>
    ),
  },

  // ── RISK ANALYSIS ──────────────────────────────────────────
  {
    slug: "how-scoring-works",
    category: "risk-analysis",
    title: "How risk scoring works",
    updated: "2026-08-10",
    body: (
      <>
        <p>Risk scoring is <strong>rule-based, not AI</strong>. Six categories are scored 0–100 independently, then combined with fixed weights:</p>
        <table>
          <thead>
            <tr><th>Category</th><th>Weight</th><th>What it checks</th></tr>
          </thead>
          <tbody>
            <tr><td>Flood</td><td>25%</td><td>NDMA flood zone, proximity to water, flood history</td></tr>
            <tr><td>Legal</td><td>20%</td><td>Ownership type, registration age, permit status</td></tr>
            <tr><td>Tax</td><td>15%</td><td>Overdue/pending municipal tax records</td></tr>
            <tr><td>Zoning</td><td>15%</td><td>Zone vs property-type conflicts, FAR, restrictions</td></tr>
            <tr><td>Environmental</td><td>15%</td><td>Live AQI (CPCB), industrial proximity, noise, soil</td></tr>
            <tr><td>Market</td><td>10%</td><td>Building age, condition, price-per-sqft outliers</td></tr>
          </tbody>
        </table>
        <h3>Score bands</h3>
        <p>0–25 LOW · 26–50 MEDIUM · 51–75 HIGH · 76–100 CRITICAL</p>
        <h3>Uncertainty penalty</h3>
        <p>When a data source is unavailable, that category receives a 15-point penalty instead of 0. Missing data is treated as risk — we will not pretend ignorance is safety. Reports label every unavailable source.</p>
      </>
    ),
  },
  {
    slug: "risk-history",
    category: "risk-analysis",
    title: "Risk history and trends",
    updated: "2026-08-06",
    body: (
      <p>
        Every recalculation creates a new <code>RiskAssessment</code> row; the previous one is
        preserved. The risk-history view plots the score over time, lists every assessment with
        its factor breakdown, and shows a delta from baseline. Use it to prove to lenders that
        risk was tracked continuously, not assessed once.
      </p>
    ),
  },
  {
    slug: "data-sources",
    category: "risk-analysis",
    title: "Data sources and honesty labels",
    updated: "2026-08-04",
    body: (
      <>
        <p>Every data section carries a source label — Live, Cached, Sample, or Unavailable.</p>
        <ul>
          <li><strong>Live:</strong> fetched from the provider in real time. Currently: air quality (WAQI/CPCB stations).</li>
          <li><strong>Cached:</strong> served from our database snapshot (portfolio values, prior assessments).</li>
          <li><strong>Sample:</strong> structured example data where a reliable public API doesn't exist in India yet (ownership registry, tax history, permits). Labelled clearly — never presented as live.</li>
          <li><strong>Unavailable:</strong> the provider timed out or returned an error; the section shows why and what to check manually.</li>
        </ul>
        <p>This honesty-first labelling is deliberate: a due diligence tool that pretends sample data is real is worse than useless.</p>
      </>
    ),
  },

  // ── API REFERENCE ──────────────────────────────────────────
  {
    slug: "auth-api",
    category: "api-reference",
    title: "Authentication API",
    updated: "2026-08-10",
    body: (
      <>
        <p>All endpoints live under <code>/api</code>. Public auth endpoints require no token; everything else requires <code>Authorization: Bearer &lt;JWT&gt;</code>.</p>
        <h3>POST /api/auth/register/send-otp</h3>
        <p>Step 1 of registration. Validates, creates a pending row, emails a 6-digit OTP (10-minute expiry).</p>
        <pre><code>{`{
  "fullName": "Jane Doe",
  "email": "jane@firm.in",
  "password": "Min8chars!",
  "phoneNumber": "9876543210",
  "role": "BUYER"
}`}</code></pre>
        <h3>POST /api/auth/register/verify-otp</h3>
        <p>Step 2. On success creates the account and returns a JWT (auto-login).</p>
        <h3>POST /api/auth/login</h3>
        <pre><code>{`{ "email": "jane@firm.in", "password": "Min8chars!" }
// → { "token": "eyJhbGciOiJIUzUxMiJ9..." }`}</code></pre>
        <h3>POST /api/auth/forgot-password → verify-otp → reset-password</h3>
        <p>Three-step reset flow. Responses are deliberately identical whether or not the email exists (anti-enumeration).</p>
      </>
    ),
  },
  {
    slug: "properties-api",
    category: "api-reference",
    title: "Properties API",
    updated: "2026-08-09",
    body: (
      <>
        <h3>GET /api/properties?page=0&amp;size=20</h3>
        <p>Paginated property list. Returns <code>{`{ content: [], totalPages, totalElements }`}</code>.</p>
        <h3>POST /api/properties</h3>
        <pre><code>{`{
  "address": "456 Avenue Road",
  "city": "Bengaluru",
  "state": "Karnataka",
  "zipCode": "560002",
  "propertyType": "RESIDENTIAL",
  "area": 1800,
  "marketValue": 15000000,
  "yearBuilt": 2015
}`}</code></pre>
        <h3>GET /api/properties/{'{id}'}</h3>
        <p>Full property including verification status, risk score summary, and aggregation links.</p>
        <h3>PUT /api/properties/{'{id}'} / DELETE /api/properties/{'{id}'}</h3>
        <p>Update or remove. Deletion cascades to risk assessments, reports, and saved comparisons.</p>
        <h3>GET /api/properties/{'{id}'}/risk</h3>
        <p>Latest risk assessment: overall score, level, per-category scores, factor explanations.</p>
      </>
    ),
  },
  {
    slug: "reports-api",
    category: "api-reference",
    title: "Reports API",
    updated: "2026-08-08",
    body: (
      <>
        <h3>POST /api/reports/generate</h3>
        <pre><code>{`{
  "propertyId": 42,
  "title": "Pre-acquisition check",
  "forceRiskRecalculation": false
}
// → 202 Accepted, { "id": 57, "status": "PENDING", ... }`}</code></pre>
        <h3>GET /api/reports/{'{reportId}'}/status</h3>
        <p>Poll every 2 seconds while <code>PENDING</code> or <code>GENERATING</code>. Terminal states: <code>COMPLETED</code>, <code>FAILED</code>.</p>
        <h3>GET /api/reports/{'{reportId}'}</h3>
        <p>Full report with all 8 sections in display order.</p>
        <h3>POST /api/reports/{'{reportId}'}/regenerate</h3>
        <p>Creates a new version with forced fresh risk recalculation. Original preserved.</p>
        <h3>Export endpoints</h3>
        <p><code>GET /api/export/report/{'{id}'}/pdf</code> · <code>GET /api/export/report/{'{id}'}/excel</code> · <code>POST /api/export/bulk</code> (ZIP) · <code>GET /api/export/history</code> · <code>GET /api/export/{'{exportId}'}/download</code></p>
      </>
    ),
  },
  {
    slug: "rate-limits",
    category: "api-reference",
    title: "Rate limits and errors",
    updated: "2026-08-05",
    body: (
      <>
        <p>Rate limiting is per-IP using token buckets:</p>
        <table>
          <thead><tr><th>Endpoint group</th><th>Limit</th></tr></thead>
          <tbody>
            <tr><td>Login / Google auth</td><td>5 / minute</td></tr>
            <tr><td>Forgot password</td><td>3 / hour</td></tr>
            <tr><td>Registration OTP send</td><td>10 / hour</td></tr>
            <tr><td>OTP verify / reset</td><td>10 / 10 minutes</td></tr>
            <tr><td>Export generation</td><td>30 / minute</td></tr>
          </tbody>
        </table>
        <p>Exceeding a limit returns <code>429</code> with a <code>Retry-After</code> header. Error responses use a consistent shape: <code>{`{ "success": false, "message": "...", "status": 4xx }`}</code>.</p>
      </>
    ),
  },

  // ── INTEGRATIONS ───────────────────────────────────────────
  {
    slug: "air-quality",
    category: "integrations",
    title: "Live air quality (WAQI/CPCB)",
    updated: "2026-08-10",
    body: (
      <>
        <p>
          Environmental risk uses live AQI from the World Air Quality Index project, which
          aggregates CPCB monitoring stations across India. We send only the city name — no
          personal data. The provider has a 4-second timeout with 3 retries (500ms backoff).
          If the station is unreachable, the section falls back to a clearly labelled estimate.
        </p>
        <p>AQI mapping to risk scores: Good 5 · Satisfactory 15 · Moderate 35 · Poor 55 · Very Poor 75 · Severe 95.</p>
      </>
    ),
  },
  {
    slug: "google-sign-in",
    category: "integrations",
    title: "Google Sign-In",
    updated: "2026-08-07",
    body: (
      <>
        <p>Google Sign-In is optional. The flow is two-step for new users:</p>
        <ol>
          <li><strong>/api/auth/google</strong> — verifies the ID token against Google's servers (audience = our client ID). Existing users get a JWT immediately. New users get <code>PROFILE_INCOMPLETE</code>.</li>
          <li><strong>/api/auth/complete-google-signup</strong> — picks a role and phone, creates the account, returns a JWT.</li>
        </ol>
        <p>Google-only accounts have no local password — password change is disabled, and account deletion confirms by email instead of password.</p>
      </>
    ),
  },
  {
    slug: "cashfree-payments",
    category: "integrations",
    title: "Cashfree payment integration",
    updated: "2026-08-10",
    body: (
      <>
        <p>Subscriptions are processed by Cashfree (sandbox mode during beta). The flow:</p>
        <ol>
          <li><strong>POST /api/subscription/create-order</strong> — server creates a Cashfree order for the selected plan and returns a <code>payment_session_id</code>.</li>
          <li>The checkout page loads the Cashfree drop-in SDK and renders the payment sheet (cards, UPI, net banking).</li>
          <li>On completion, Cashfree POSTs a signed webhook to <strong>/api/subscription/webhook</strong>. We verify the HMAC-SHA256 signature before updating the subscription — unsigned or bad-signature payloads are rejected outright.</li>
        </ol>
        <p>We never store card details. We store only the transaction reference, amount, and status.</p>
      </>
    ),
  },

  // ── BILLING ────────────────────────────────────────────────
  {
    slug: "plans",
    category: "billing",
    title: "Plans and limits",
    updated: "2026-08-10",
    body: (
      <>
        <table>
          <thead><tr><th>Plan</th><th>Price</th><th>Reports</th><th>Extras</th></tr></thead>
          <tbody>
            <tr><td>Free</td><td>₹0</td><td>3 / month</td><td>Watermarked PDF, email support</td></tr>
            <tr><td>Pro</td><td>₹499 / month</td><td>Unlimited</td><td>All exports, priority generation, white-label PDF</td></tr>
            <tr><td>Business</td><td>₹1,999 / month</td><td>Unlimited</td><td>5 seats, REST API 10k calls/mo, custom branding, bulk upload</td></tr>
            <tr><td>Enterprise</td><td>Custom</td><td>Unlimited</td><td>Unlimited seats, SLA, dedicated manager</td></tr>
          </tbody>
        </table>
        <p>Hitting the Free plan limit blocks new report generation with a clear upgrade prompt — your existing reports and history remain accessible.</p>
      </>
    ),
  },
  {
    slug: "cancel-subscription",
    category: "billing",
    title: "Cancelling or changing plans",
    updated: "2026-08-06",
    body: (
      <p>
        Cancel anytime from Dashboard → Billing. Access continues until the end of the current
        paid period — we do not pro-rate or claw back. On expiry your account returns to Free;
        all data is preserved. Upgrades take effect immediately and are charged a pro-rated
        difference for the current cycle.
      </p>
    ),
  },

  // ── SECURITY ───────────────────────────────────────────────
  {
    slug: "security-model",
    category: "security",
    title: "Security model",
    updated: "2026-08-10",
    body: (
      <>
        <ul>
          <li><strong>Passwords</strong> — BCrypt (cost 10). We cannot recover your password; only reset via emailed OTP.</li>
          <li><strong>OTPs</strong> — hashed at rest, 10-minute expiry, 5-attempt limit, resend cooldowns.</li>
          <li><strong>Sessions</strong> — stateless JWT (1-hour expiry) with a server-side <code>token_valid_from</code> cutoff. "Sign out everywhere" revokes every issued token instantly.</li>
          <li><strong>Headers</strong> — HSTS, CSP, X-Frame-Options DENY, nosniff, strict referrer policy on every response.</li>
          <li><strong>Rate limiting</strong> — Bucket4j per-IP buckets on all sensitive endpoints.</li>
          <li><strong>Audit</strong> — every login, logout, password change, property mutation, and report generation is recorded with IP and user-agent.</li>
          <li><strong>Login alerts</strong> — every new sign-in triggers an email with time, IP, and device.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "deleting-your-data",
    category: "security",
    title: "Deleting your data",
    updated: "2026-08-04",
    body: (
      <p>
        Account deletion is immediate and permanent: your profile, every property, every
        report, and all session data are removed via database cascade. There is no recovery
        period by design. To delete: Profile → Danger zone → type <code>DELETE</code> and
        confirm with your password (or email for Google-only accounts).
      </p>
    ),
  },
];

export function getArticlesByCategory(categorySlug) {
  return DOCS_ARTICLES.filter((a) => a.category === categorySlug);
}

export function getArticleBySlug(slug) {
  return DOCS_ARTICLES.find((a) => a.slug === slug) || null;
}

export function searchArticles(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return DOCS_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      (a.category && DOCS_CATEGORIES.find((c) => c.slug === a.category)?.label.toLowerCase().includes(q))
  );
}
