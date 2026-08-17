# Real Estate Due Diligence Platform

A full-stack web application that automates property due diligence for buyers,
real estate agents, and legal/financial professionals in India. Built for
**Milestone 3** of the university capstone project by **Team 03**.

---

## What it does

Upload or search for any property. The platform instantly:

1. **Aggregates** data from 6 external providers (flood zone, legal encumbrances,
   tax history, zoning, environmental hazards, market data)
2. **Scores** the property across 6 risk categories and produces an overall
   LOW / MEDIUM / HIGH / CRITICAL risk rating
3. **Generates** a multi-section due-diligence PDF report with risk breakdown,
   comparable market analysis, financial projections, and AI executive summary
4. **Exports** reports as PDF or Excel and tracks download history
5. **Notifies** users in-app and by email when reports are ready or risk alerts fire

---

## Key features

| Feature | Details |
|---------|---------|
| Authentication | Email + OTP registration, email/password login, Google Sign-In |
| Role-based access | 5 roles: Buyer, Real Estate Agent, Legal Reviewer, Financial Institution, Admin |
| Property management | Add, edit, delete, search; geocoded to lat/lng via Nominatim |
| Risk scoring | Rule-based engine across 6 categories, fully explainable |
| Report generation | Async PDF generation with section-by-section progress |
| AI summaries | Groq Llama 3.3 70B powers executive summaries and property chat |
| Comparable analysis | Nearest-neighbour search with similarity scoring and price trends |
| Property valuation | Three-method automated valuation (comparable, cost, income) |
| Export | PDF (iText7 + OpenPDF) and Excel (Apache POI) for reports and admin analytics |
| Notifications | In-app + email; real-time delivery via Server-Sent Events |
| Admin dashboard | Platform analytics, user management, audit logs, system health |
| Subscriptions | Cashfree UPI payment gateway; FREE / PRO / BUSINESS / ENTERPRISE plans |
| Internationalisation | 11 languages: English, Hindi, Bengali, Gujarati, Kannada, Malayalam, Marathi, Punjabi, Tamil, Telugu, Urdu |

---

## Tech stack summary

| Layer | Technology |
|-------|------------|
| Backend | Spring Boot 4.1, Java 17, Spring Security, Spring Data JPA |
| Database | PostgreSQL 16 (Hibernate ORM, ddl-auto=update) |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Authentication | JWT (JJWT 0.12.7), BCrypt, Google OAuth 2.0 |
| AI | Groq API (Llama 3.3 70B) via Spring WebFlux |
| PDF / Excel | iText 7.2.5, OpenPDF 1.3.39, Apache POI 5.2.5 |
| Maps | Leaflet + OpenStreetMap, Nominatim geocoding |
| Payments | Cashfree payment gateway (UPI-native, sandbox mode) |
| API docs | springdoc-openapi 2.8.0 — Swagger UI at `/swagger-ui.html` |

→ Full version list: [docs/TECH_STACK.md](docs/TECH_STACK.md)

---

## Quick start

### Prerequisites
Java 17, Maven 3.9+, Node.js 20+, PostgreSQL 14+

### 1. Clone and set up

```bash
git clone https://github.com/<org>/team-03.git
cd team-03
git checkout develop
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill in DB_PASSWORD, MAIL_*, GOOGLE_CLIENT_ID, JWT_SECRET
./mvnw spring-boot:run
# → http://localhost:8080  |  Swagger: http://localhost:8080/swagger-ui.html
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### 4. Default admin login

```
Email:    admin@duediligence.local
Password: Admin@12345
```

→ Full setup instructions: [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)

---

## Project structure

```
team-03/
├── backend/          Spring Boot backend
│   ├── src/main/java/com/realestate/duediligence/
│   │   ├── controller/    23 REST controllers
│   │   ├── service/       Business logic (interface + Impl pattern)
│   │   ├── entity/        22 JPA entities
│   │   ├── dto/           Request/response DTOs
│   │   ├── repository/    Spring Data JPA repositories
│   │   ├── security/      JWT filter, SecurityConfig, rate limiting
│   │   ├── config/        OpenAPI, async, cache, data-init
│   │   └── integration/   6 mock external data providers
│   └── src/main/resources/
│       ├── application.properties
│       └── fonts/         Noto Sans fonts for multilingual PDF export
├── frontend/         Next.js frontend
│   ├── src/app/      ~40 pages (App Router)
│   ├── src/components/ React components
│   ├── src/services/  API call layer
│   ├── src/hooks/     Custom hooks
│   └── src/locales/   i18n JSON (11 languages)
└── docs/             Documentation (you are here)
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) | Local development setup (backend, frontend, DB, .env) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture, data flow, tech decisions |
| [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | ERD (Mermaid) and table descriptions |
| [docs/TECH_STACK.md](docs/TECH_STACK.md) | All libraries with versions and rationale |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Branching, commit conventions, PR process |
| [docs/api.md](docs/api.md) | REST API reference |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel + Render deployment instructions |
| [docs/SECURITY.md](docs/SECURITY.md) | Security model, rate limiting, threat model |
| [docs/user-manual/](docs/user-manual/) | End-user guide (7 chapters) |
| [docs/presentation/](docs/presentation/) | Project report and presentation materials |

---

## Team 03 — Member responsibilities

| Member | Area |
|--------|------|
| Akshay | Risk Assessment Module + Due Diligence Report Generation |
| Member 2 | Comparable Property Analysis + Property Valuation |
| Member 3 | Admin Dashboard + Analytics |
| Member 4 | PDF + Excel Export |
| Member 5 | Notification System (M3) · API Documentation + Project Docs (M4) |
| Member 6 | Audit Logging + Report History Tracking |

---

## License

Internal use only — university capstone project. Not for public distribution.
