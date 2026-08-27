<div align="center">

# Real Estate Due Diligence Platform

**Property risk, uncovered in seconds.**

[![CI](https://github.com/springboardmentor198/team-03/actions/workflows/ci.yml/badge.svg)](https://github.com/springboardmentor198/team-03/actions/workflows/ci.yml)
[![Backend tests](https://img.shields.io/badge/backend%20tests-58%20passing-brightgreen)](https://github.com/springboardmentor198/team-03/tree/develop/backend)
[![Frontend tests](https://img.shields.io/badge/frontend%20tests-33%20total-yellow)](https://github.com/springboardmentor198/team-03/tree/develop/frontend)
[![Coverage](https://img.shields.io/badge/coverage-33.8%25%20lines-orange)](https://github.com/springboardmentor198/team-03/tree/develop/backend)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-6DB33F?logo=springboot)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-007396?logo=openjdk)](https://adoptium.net/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-✓-2496ED?logo=docker)](https://www.docker.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-orange)](https://groq.com/)
[![Cashfree](https://img.shields.io/badge/payments-Cashfree-8A2BE2)](https://www.cashfree.com/)

</div>

---

## Screenshots

<table>
  <tr>
    <td align="center">
      <strong>Landing Page</strong><br><br>
      <img src="docs/screenshots/DD LANDING PAGE.png" alt="Landing page" width="700">
    </td>
    <td align="center">
      <strong>AI Due Diligence Assistant</strong><br><br>
      <img src="docs/screenshots/DD AI ASSISTANT.png" alt="AI Due Diligence Assistant" width="400">
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <strong>Risk Report</strong><br><br>
      <img src="docs/screenshots/DD RISK REPORT 1.png" alt="Risk report" width="850">
    </td>
  </tr>
</table>

## What is this?

Buying property in India means wading through flood maps, zoning laws, tax
records, and registry fraud — usually across a dozen government portals.
This platform compresses that into one flow: add an address, and an AI agent
pulls data from multiple sources, scores six risk categories with weighted,
traceable evidence, and produces a due diligence report with a plain-English
verdict: **BUY, NEGOTIATE, or AVOID**.

Built as a Spring Boot backend with a Next.js frontend, it includes a
streaming AI chat that answers property questions with cited sources, fraud
badges that flag high-risk assets, PDF/Excel exports, Cashfree UPI payments,
and an English/Hindi i18n layer. The frontend is deployed on Vercel, the
backend runs on AWS EC2, and PostgreSQL is hosted on Neon.

## Live Demo

- **Frontend:** https://due-deligence-platform.vercel.app/
- **Backend API:** AWS EC2 — Spring Boot
- **Health Check:** https://54.66.38.92/actuator/health
- **Swagger UI:** https://54.66.38.92/swagger-ui/index.html
- **Database:** Neon PostgreSQL

## Features

- 🛡️ **6-category risk scoring** — Flood, Legal, Tax, Zoning, Environment,
  Market, each with a weighted score and traceable sources
- 🤖 **AI chat** — streaming answers from Groq Llama 3.3 70B with cited sources
- 📄 **AI executive summary** — 3-sentence summary + BUY/NEGOTIATE/AVOID verdict
- 🚨 **Fraud detection** — rule-based flags with a pulsing red badge on
  high-risk properties
- 📊 **PDF + Excel export** — charts in the PDF, 3 sheets (summary, risk
  factors, chronology) in the XLSX
- ⚡ **Command palette** — Ctrl+K to jump anywhere in the app
- 💳 **Cashfree payments** — UPI, cards, and netbanking for premium reports
- 🌐 **i18n ready** — English + Hindi via react-i18next

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, Tailwind 4, shadcn-style UI, Leaflet maps, Recharts |
| Backend | Spring Boot 4.1, Java 17, Spring Security (JWT + OAuth2), Bucket4j rate limiting |
| Database | PostgreSQL (Neon), JSONB report sections; H2 for tests |
| AI | Groq API — `llama-3.3-70b-versatile` (streaming, ~500 tok/s) |
| Payments | Cashfree (sandbox) |
| Infra | Docker Compose (local), GitHub Actions CI, Vercel, AWS EC2, Neon PostgreSQL |

## Getting Started (Local)

### Prerequisites

- JDK 17+ ([Temurin](https://adoptium.net/))
- Node.js 20+
- PostgreSQL 16 running on `localhost:5432`
- (or skip all three and use Docker — see below)

### 1. Backend

```cmd
cd backend
copy .env.example .env
```

Fill in `backend/.env` (DB password, Gmail SMTP, Groq/Cashfree/Google keys).
Create the database the app expects:

```sql
CREATE DATABASE real_estate_due_diligence;
```

Then run:

```cmd
mvnw.cmd spring-boot:run
```

Backend starts on http://localhost:8080 — Swagger at
http://localhost:8080/swagger-ui/index.html.

### 2. Frontend

```cmd
cd frontend
copy .env.example .env.local
npm ci
npm run dev
```

Frontend starts on http://localhost:3000 and proxies `/api/*` to
`localhost:8080` via `next.config.mjs`.

## Getting Started (Docker)

One command for the full stack (Postgres + backend + frontend):

```cmd
copy .env.docker.example .env
docker-compose up --build
```

Fill in the root `.env` first. Details, ports, and troubleshooting:
[docs/DOCKER.md](docs/DOCKER.md).

## Testing

- **Backend:** `cd backend && mvnw.cmd test -Dspring.profiles.active=test`
  → **58 tests, 0 failures** (H2 in-memory DB, no external calls).
  JaCoCo: 33.8% line / 15.7% branch coverage.
- **Frontend:** `cd frontend && npm run test:run`
  → **33 tests** (32 passing; one RiskSpectrum snapshot needs a one-time
  refresh with `npx vitest run -u` — see
  [docs/SUBMISSION_CHECKLIST.md](docs/SUBMISSION_CHECKLIST.md)).
- **CI:** GitHub Actions runs both suites + Docker builds on every push/PR
  ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Deployment

The production stack is deployed as follows:

- **Frontend:** Vercel
- **Backend:** AWS EC2 running Spring Boot
- **Database:** Neon PostgreSQL

Deployment documentation:
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Project Structure
```
.
├── backend/                Spring Boot 4.1 API (Java 17)
│   ├── src/main/java/com/realestate/duediligence/
│   │   ├── actuator/       
│   │   ├── aggregation/    
│   │   ├── config/         
│   │   ├── controller/
│   │   ├── dto/            
│   │   ├── DueDiligenceAgentApplication.java  
│   │   ├── entity/         
│   │   ├── enums/          
│   │   ├── exception/      
│   │   ├── export/
│   │   ├── integration/
│   │   ├── pdf/
│   │   ├── repository/     
│   │   ├── scheduled/
│   │   ├── security/
│   │   ├── service/
│   │   ├── templates/      
│   │   └── util/           
│   └── src/test/           (java + resources)
├── frontend/               Next.js 16 (App Router)
│   └── src/
│       ├── app/
│       ├── components/
│       ├── constants/      
│       ├── hooks/          
│       ├── i18n/           
│       ├── lib/            
│       ├── locales/        
│       ├── services/       
│       ├── test/           
│       ├── utils/          
│       └── __tests__/
├── docs/                   api.md, DOCKER.md, DEPLOYMENT.md, SECURITY.md, ... (many more)
├── postman/                (globals)
├── .postman/                (resources.yaml)
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## API Documentation

- **Swagger UI (Production):**
  https://54.66.38.92/swagger-ui/index.html
- **Health Check:**
  https://54.66.38.92/actuator/health
- **Swagger UI (Local):**
  http://localhost:8080/swagger-ui/index.html
- **Markdown reference:** [docs/api.md](docs/api.md)
- **Postman collection:** [`postman/`](postman/)

## E2E Demo

A 15-step, ~5-minute demo script for judges — every step with expected UI
state, API endpoint, and screenshot target:
[docs/E2E_DEMO_SCRIPT.md](docs/E2E_DEMO_SCRIPT.md).

## Architecture

System architecture, technology decisions, security model, and deployment
design:
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Contributing

Team 03 — contributors (from commit history):

- **Akshaya R** (lead) — backend, auth/security, deployment
- **MelvinBritto**, **Bhavana-Bhat-528**, **tanishaalone-lab**, **subashs0411**,
  **DempRepo**, **2311cs010477** — features across backend and frontend
- Mentored by **springboardmentor198** (Springboard)

Workflow: branch off `develop`, open a PR, CI runs tests + Docker builds,
and Vercel handles frontend deployments. The production backend runs on AWS
EC2.

## License

[MIT](./LICENSE) © 2026 springboardmentor198

## Credits

- Springboard mentor and reviewers
- Security contact: duedeligence8@gmail.com (see [docs/SECURITY.md](docs/SECURITY.md))
