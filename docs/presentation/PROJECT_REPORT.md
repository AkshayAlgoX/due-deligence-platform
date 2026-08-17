# Real Estate Due Diligence Platform — Project Report

**Team 03 | Milestone 3 & 4 | 2025–2026**

---

## 1. Problem Statement

Real estate transactions in India involve significant financial risk. Buyers,
agents, and lenders must navigate a complex web of flood risks, legal encumbrances,
tax arrears, zoning violations, environmental hazards, and market volatility —
information that is currently scattered across disconnected government portals,
local registrar offices, and private data providers.

A typical manual due-diligence process takes **7–14 days** and costs **₹15,000–₹50,000**
in legal and consultant fees. This delays transactions, excludes small buyers who
cannot afford the cost, and leaves lenders exposed to undiscovered risks.

**Our solution**: An automated platform that aggregates data from 6 providers,
scores risk across 6 categories, and generates a comprehensive due-diligence report
in under 30 seconds — for free or at a fraction of the manual cost.

---

## 2. System Architecture

```
[Browser — Next.js 16, React 19, Tailwind CSS 4]
        ↕ /api/* (same-origin, Vercel rewrite)
[Spring Boot 4.1 Backend — Java 17]
        ↕
[PostgreSQL 16]   [Groq LLM API]   [Cashfree Gateway]
[External Providers: Flood / Legal / Tax / Zoning / Environmental / Market]
[Gmail SMTP]   [Google OAuth 2.0]
```

Key architectural decisions:
- **JWT authentication** (1-hour tokens, HS512, revocable via token_valid_from)
- **Role-based access control** (5 roles, Spring Security `@PreAuthorize`)
- **Async report generation** (Spring `@Async`, task executor, SSE status updates)
- **Rule-based risk engine** (transparent, explainable — no black-box ML)
- **Server-Sent Events** (AI chat streaming, real-time notifications)
- **Multi-tenant data isolation** (per-user properties, CASCADE DELETE)

---

## 3. Features

### Core features

| Feature | Description |
|---------|-------------|
| Property Management | Add, edit, delete, search, geocode via Nominatim |
| Risk Scoring | 6-category rule-based engine, 0–100 score, fully explainable |
| Due Diligence Reports | 8-section async PDF with AI executive summary |
| Comparable Analysis | Nearest-neighbour search, similarity scoring, price trends |
| Property Valuation | 3-method automated valuation (comparable, cost, income) |
| Export | PDF (iText7) and Excel (Apache POI) for reports and analytics |

### Platform features

| Feature | Description |
|---------|-------------|
| Authentication | Email+OTP, Google SSO, BCrypt passwords |
| Subscriptions | Cashfree UPI gateway — FREE / PRO / BUSINESS / ENTERPRISE |
| Notifications | In-app + email, real-time SSE delivery |
| Admin Dashboard | Analytics, user management, audit logs, system health |
| Audit Logging | Immutable trail of all user and system actions |
| Internationalisation | 11 languages (UI + PDF + Excel + CSV exports) |
| AI Chat | Groq Llama 3.3 70B — property-specific Q&A, streaming tokens |

---

## 4. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Spring Boot | 4.1.0 |
| Database | PostgreSQL + Hibernate | 16 |
| Frontend | Next.js + React | 16.2.10 + 19 |
| Auth | JWT (JJWT) + Spring Security | 0.12.7 |
| AI | Groq API (Llama 3.3 70B) | — |
| PDF | iText 7 + OpenPDF | 7.2.5 + 1.3.39 |
| Excel | Apache POI | 5.2.5 |
| Maps | Leaflet + OpenStreetMap | 1.9.4 |
| Payments | Cashfree | sandbox |
| API Docs | springdoc-openapi (Swagger) | 2.8.0 |
| Testing | JUnit 5 + Vitest | — |

→ Full list: [TECH_STACK.md](../TECH_STACK.md)

---

## 5. Screenshots

*[Replace placeholders below with actual screenshots before final submission]*

| Screen | Description |
|--------|-------------|
| `[SCREENSHOT: Landing page]` | Public landing page with hero section and pricing |
| `[SCREENSHOT: Dashboard]` | User dashboard with KPI cards and activity feed |
| `[SCREENSHOT: Property detail]` | Property page with risk badge and action buttons |
| `[SCREENSHOT: Risk analysis]` | Risk gauge, radar chart, factor cards |
| `[SCREENSHOT: Report viewer]` | Multi-section report with AI summary |
| `[SCREENSHOT: Admin dashboard]` | Analytics charts and user management table |
| `[SCREENSHOT: AI chat]` | Streaming AI chat with property context |
| `[SCREENSHOT: Mobile view]` | Responsive layout on mobile |

→ See [DEMO_SCREENSHOTS/README.md](DEMO_SCREENSHOTS/README.md) for capture instructions.

---

## 6. Team Credits

| Member | Responsibilities |
|--------|----------------|
| Akshay (Member 1) | Risk Assessment Module · Due Diligence Report Generation |
| Member 2 | Comparable Property Analysis · Property Valuation |
| Member 3 | Admin Dashboard · Analytics · Multilingual Exports |
| Member 4 | PDF + Excel Export Functionality |
| Member 5 | Notification System (M3) · API Documentation · Project Docs (M4) |
| Member 6 | Audit Logging · Report History Tracking |

---

## 7. How to Export This Report as PDF

```bash
# Using Pandoc (see docs/user-manual/USER_MANUAL_COMPILE.md for install instructions)
pandoc docs/presentation/PROJECT_REPORT.md \
  -o docs/presentation/PROJECT_REPORT.pdf \
  --pdf-engine=xelatex \
  -V geometry:margin=2.5cm \
  -V fontsize=12pt \
  --toc
```
