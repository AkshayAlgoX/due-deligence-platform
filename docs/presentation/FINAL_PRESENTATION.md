# Final Presentation — Slide-by-Slide Outline

15–20 slides for a 10–15 minute presentation.
Build the deck in PowerPoint, Google Slides, or Canva using this outline.

---

## Slide 1 — Title

**Title:** Real Estate Due Diligence Platform  
**Subtitle:** Automated property risk scoring and report generation  
**Team:** Team 03 | [University Name] | 2025–2026  
**Visual:** Full-bleed property photo; team logo top-left

---

## Slide 2 — The Problem

**Headline:** Due diligence takes 7–14 days and costs ₹15,000–₹50,000

**Bullet points:**
- Property buyers must verify flood risk, legal standing, taxes, zoning, environment, and market value
- Information is scattered across 6+ disconnected government portals
- Small buyers can't afford the manual process
- Lenders are exposed to undiscovered risks

**Visual:** Diagram of manual process vs automated process side by side

---

## Slide 3 — Our Solution

**Headline:** Automated, explainable due diligence in 30 seconds

**Three columns:**
- 📊 **Aggregate** — 6 data providers, 1 platform
- ⚡ **Score** — rule-based risk engine, 0–100 score
- 📄 **Report** — multi-section PDF, AI summary

**Visual:** Platform logo / dashboard screenshot

---

## Slide 4 — Key Features (Overview)

**Grid of 6 feature icons:**
1. Risk Scoring (6 categories)
2. PDF Report Generation (async)
3. Comparable Analysis + Valuation
4. AI Chat (Groq LLM)
5. Export (PDF, Excel, CSV — 11 languages)
6. Admin Dashboard + Analytics

---

## Slide 5 — System Architecture

**Headline:** Monorepo, REST + SSE, JWT Security

**Architecture diagram** (use the one from ARCHITECTURE.md):
```
Browser (Next.js) → Vercel Rewrite → Spring Boot → PostgreSQL
                                          ↓
                              Groq | Cashfree | 6 Providers | Gmail
```

**Callouts:** JWT auth, async report generation, SSE streaming

---

## Slide 6 — Risk Scoring Engine

**Headline:** Transparent, explainable — not a black box

**Left:** Donut chart showing 6 category weights  
**Right:**
- Flood 25% | Legal 20% | Tax 15%
- Zoning 15% | Environmental 15% | Market 10%

**Bottom:** Score ranges → LOW (0–25) / MEDIUM (26–50) / HIGH (51–75) / CRITICAL (76–100)

**Screenshot:** Risk gauge + radar chart from UI

---

## Slide 7 — Report Generation (Live Demo)

**Headline:** 8-section PDF generated in < 30 seconds

**Flow diagram:**
Generate → PENDING → GENERATING → COMPLETED → Download PDF

**Screenshot:** Report viewer showing sections list

**Callout:** Async generation, AI executive summary, version history

---

## Slide 8 — AI Integration

**Headline:** Groq Llama 3.3 70B — fastest open model at ~500 tok/s

**Two features:**
1. **AI Executive Summary** — verdict + key findings + next steps
2. **AI Chat** — streaming Q&A about a specific property (SSE, Base64-encoded tokens)

**Screenshot:** Chat interface or AI summary card

---

## Slide 9 — Comparable Analysis & Valuation

**Headline:** Are you paying the right price?

**Left:** Map with comparable pins (Leaflet/OSM)  
**Right:**
- Nearest-neighbour similarity scoring
- Price-per-sqft delta vs market
- 3-method automated valuation
- Better Deal indicator

---

## Slide 10 — Export & Internationalisation

**Headline:** Export in any format, any language

**Grid:**
- PDF (iText 7 + OpenPDF + embedded Noto fonts)
- Excel (Apache POI)
- CSV
- 11 languages: EN, HI, BN, GU, KN, ML, MR, PA, TA, TE, UR

**Visual:** Flag icons or language picker screenshot

---

## Slide 11 — Admin Dashboard

**Headline:** Full platform visibility for administrators

**Screenshot grid:**
- KPI cards (total users, properties, reports, avg risk score)
- Risk distribution pie chart
- Reports trend line chart
- User management table (ban/unban/role change)

---

## Slide 12 — Tech Stack

**Two columns:**

| Backend | Frontend |
|---------|---------|
| Spring Boot 4.1 | Next.js 16 |
| Java 17 | React 19 |
| PostgreSQL 16 | Tailwind CSS 4 |
| JWT + Spring Security | Base UI / Recharts |
| Groq API | Leaflet / i18next |
| iText7 + Apache POI | Vitest |

---

## Slide 13 — API Documentation

**Headline:** 23 controllers, 59+ endpoints, full Swagger UI

**Screenshot:** Swagger UI (`/swagger-ui.html`) showing tag groups

**Callout:** springdoc-openapi 2.8.0, @Operation on every endpoint, `@Tag` groups

---

## Slide 14 — Testing & Quality

**Headline:** Automated tests on every push

**Two columns:**
- **Backend:** JUnit 5, Spring Boot Test, H2 in-memory, Spring Security Test
- **Frontend:** Vitest 2, React Testing Library 16, component + hook coverage

**CI:** GitHub Actions — runs both test suites on every PR

---

## Slide 15 — Team Contributions

**Table:**

| Member | Core Area | Key Deliverables |
|--------|-----------|-----------------|
| Akshay | Risk + Reports | Risk engine, 8-section reports, AI summary |
| Member 2 | Comparables + Valuation | Map analysis, 3-method valuation |
| Member 3 | Admin + Analytics | Dashboard, multilingual exports |
| Member 4 | Export | PDF/Excel export pipeline |
| Member 5 | Notifications + Docs | SSE notifications, API docs, all project docs |
| Member 6 | Audit + History | Audit trail, report versioning |

---

## Slide 16 — Live Demo Highlights

*(This slide is your transition to the live demo)*

**What to show in demo (3–5 minutes):**
1. Register / login as a buyer
2. Add a property → show geocoding
3. View risk analysis → explain categories and explainability panel
4. Generate a report → show async generation + AI summary
5. Download PDF
6. Switch to Admin view → show analytics dashboard

---

## Slide 17 — Key Achievements

- ✅ 23 REST controllers, 59+ endpoints, 22 JPA entities
- ✅ 11-language support for UI + exports (PDF, Excel, CSV)
- ✅ Real-time AI chat (Groq streaming SSE)
- ✅ Automated property valuation (3 methods)
- ✅ Production-grade JWT auth with Google SSO
- ✅ Cashfree UPI payment integration
- ✅ Full Swagger API documentation

---

## Slide 18 — Challenges & Solutions

| Challenge | Solution |
|-----------|---------|
| Mojibake in multilingual PDFs | Embedded Noto Sans fonts (17 TTF files) per script |
| Async report failures on restart | Stale GENERATING reports reset to FAILED on startup |
| Admin role regression after merge | DataInitializer repaired to verify + fix admin role on startup |
| SSE buffering breaking AI chat | `X-Accel-Buffering: no` header + Base64-encoded tokens |
| Windows-1252 corruption in i18n files | Node.js UTF-8 no-BOM repair script |

---

## Slide 19 — Future Work

- Full mobile app (React Native)
- Real external data provider integrations (replace mock providers)
- ML-based risk prediction model
- Multi-property portfolio comparison reports
- WhatsApp notification channel

---

## Slide 20 — Thank You

**"Empowering every property buyer with the due diligence that was only available to the privileged few."**

Team 03 | [University Name]  
GitHub: https://github.com/<org>/team-03  
Swagger: http://localhost:8080/swagger-ui.html
