# System Architecture

## Overview

- **Monorepo:** `backend/` (Spring Boot 4.1, Java 17) + `frontend/` (Next.js 16,
  React 19) + `docs/` + Docker configs at the root
- **Deployment:** Vercel (frontend) + Render (backend) + Postgres (Render-managed
  via Blueprint, or Neon) — all free tiers
- **Base package:** `com.realestate.duediligence`
- **API surface:** REST + SSE streaming (AI chat), documented at
  http://localhost:8080/swagger-ui.html and `docs/api.md`

## Data Flow Diagram

```text
User Browser
   ↓
Vercel Edge (Next.js SSR + static)
   ↓ /api/* rewrite (frontend/vercel.json)
Render (Spring Boot backend, Docker)
   ↓
Postgres (Render-managed or Neon)  ←→  External APIs (Groq, Cashfree,
                                        flood/zoning/tax/environmental data,
                                        Gmail SMTP, Google OAuth)
```

- Browser calls only same-origin `/api/*`; Vercel rewrites those to the Render
  service, so no client-side CORS is involved in production.
- The AI chat uses Server-Sent Events (SSE) for token streaming; the backend
  exposes `X-Accel-Buffering`/`Transfer-Encoding` headers so proxies don't buffer.
- In Docker (local), the same rewrite targets `http://backend:8080` on the
  compose network (`next.config.mjs`, `API_PROXY_URL` build arg).

## Tech decisions

- **Why Next.js App Router?** Server components + streaming SSR = faster TTFB
- **Why Spring Boot 4.1?** Enterprise Java, easy REST, mature security
- **Why Postgres?** ACID for financial data, JSONB for flexible report sections
- **Why Groq Llama 3.3 70B?** (`llama-3.3-70b-versatile`) Free tier,
  ~500 tokens/sec streaming (fastest)
- **Why Cashfree?** UPI-native for India, PCI-DSS Level 1
- **Why Vercel + Render?** Zero-cost deploy, GitHub-integrated CI/CD

## Security

- JWT (HS256) auth with 1-hour expiry, per OWASP short-lived-token guidance
- BCrypt password hashing (Spring default strength)
- Google OAuth (Sign in with Google) + email-OTP registration flow
- HTTPS enforced by Vercel and Render
- CORS restricted to explicit origins (`SecurityConfig.java` — add the
  production Vercel domain before go-live, see docs/DEPLOYMENT.md §E)
- Secrets never committed (`.env` excluded via `.gitignore`/`.dockerignore`;
  templates in `.env.docker.example`, `backend/.env.example`,
  `frontend/.env.example`)
- Rate limiting via Bucket4j (see `docs/SECURITY.md`)

## Scalability limits (free tier)

- Render web: 750 instance-hours/month, sleeps after 15 min idle (~30–60 s
  cold start)
- Render Postgres: 1 GB, expires after 30 days unless upgraded (switch to
  Neon — 500 MB, no expiry — via docs/DEPLOYMENT.md §A)
- Vercel: 100 GB bandwidth/month
- Sufficient for demo + judge review

## CI/CD

- GitHub Actions (`.github/workflows/ci.yml`): backend tests (H2, `test`
  profile), frontend tests (Vitest), and Docker image builds on every push/PR
- Render auto-deploys `dd-backend` on push to `develop`/`main`
  (Blueprint `render.yaml`)
- Vercel auto-deploys `frontend/` on push to `develop`/`main`
