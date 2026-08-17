# Local Development Setup Guide

This guide covers everything needed to run the Real Estate Due Diligence platform
on your local machine — backend, frontend, database, and environment variables.

---

## Prerequisites

| Tool | Minimum version | Notes |
|------|----------------|-------|
| Java JDK | 17 | OpenJDK or Temurin recommended |
| Maven | 3.9+ | Or use the included `./mvnw` wrapper |
| Node.js | 20 LTS or 22 LTS | Check with `node -v` |
| npm | 10+ | Bundled with Node; check with `npm -v` |
| PostgreSQL | 14+ | Local install or Docker |
| Git | any recent | For cloning and branching |

Optional but recommended:
- **Docker Desktop** — for running Postgres without a local install
- **IntelliJ IDEA** or **VS Code** with the Java extension pack

---

## 1. Clone the repository

```bash
git clone https://github.com/<org>/team-03.git
cd team-03
git checkout develop        # or your feature branch
```

---

## 2. Database setup

### Option A — Local PostgreSQL

```sql
psql -U postgres
CREATE DATABASE real_estate_due_diligence;
\q
```

### Option B — Docker (no install needed)

```bash
docker run -d \
  --name dd-postgres \
  -e POSTGRES_DB=real_estate_due_diligence \
  -e POSTGRES_PASSWORD=yourpassword \
  -p 5432:5432 \
  postgres:16
```

Hibernate `ddl-auto=update` will create all tables on first boot.

---

## 3. Backend setup

### 3.1 Copy and fill the environment file

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in all values:

```dotenv
# PostgreSQL
DB_PASSWORD=yourpassword           # the password you used in step 2

# Gmail SMTP (create an App Password in Google Account → Security → 2FA → App passwords)
MAIL_USERNAME=you@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx  # 16-char App Password — NOT your Gmail password

# Google OAuth (create credentials at console.cloud.google.com)
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com

# Cashfree (sandbox credentials from merchant.cashfree.com/pg/developers)
CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
CASHFREE_ENV=sandbox
CASHFREE_WEBHOOK_SECRET=

# JWT — generate a random 64-char hex string
# PowerShell: -join ((0..63) | % { '{0:x}' -f (Get-Random -Max 16) })
# Linux/Mac:  openssl rand -hex 32
JWT_SECRET=replace_with_64_char_hex_string

# Admin seeded user (created automatically on first startup)
ADMIN_PASSWORD=Admin@12345
```

> **Never commit `backend/.env`** — it is `.gitignore`d.

### 3.2 Run the backend

```bash
# From the backend/ directory
./mvnw spring-boot:run
```

On first run, Hibernate creates all tables and the `DataInitializer` seeds:
- All 5 roles (`BUYER`, `REAL_ESTATE_AGENT`, `LEGAL_REVIEWER`, `FINANCIAL_INSTITUTION`, `ADMIN`)
- The seeded admin user: `admin@duediligence.local` / `Admin@12345`

The backend starts on **http://localhost:8080**.

Swagger UI: http://localhost:8080/swagger-ui.html  
OpenAPI JSON: http://localhost:8080/v3/api-docs

### 3.3 Verify the backend is up

```bash
curl http://localhost:8080/actuator/health
# → {"status":"UP", ...}
```

---

## 4. Frontend setup

### 4.1 Install dependencies

```bash
cd frontend
npm install
```

### 4.2 Environment (optional for local)

The frontend proxies all `/api/*` calls to `http://localhost:8080` via
`next.config.mjs` rewrites — no environment file is needed for local dev.

If you need to override the proxy target (e.g. pointing at a remote backend):

```bash
# frontend/.env.local  (NOT committed)
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### 4.3 Start the dev server

```bash
npm run dev          # starts at http://localhost:3000 with Turbopack HMR
```

### 4.4 Production build (verify before pushing)

```bash
npm run build        # runs next build — must succeed with no errors
```

---

## 5. Running tests

### Backend tests

```bash
cd backend
./mvnw test          # runs all JUnit/Spring tests using H2 in-memory DB
./mvnw test -pl .    # same, verbose
```

Tests use the `test` Spring profile (H2 dialect), so no Postgres needed.

### Frontend tests

```bash
cd frontend
npm run test:run     # Vitest — single run, no watch mode
npm run test         # Vitest watch mode
npm run test:coverage # coverage report at coverage/
```

---

## 6. Useful commands reference

| Command | Location | What it does |
|---------|----------|--------------|
| `./mvnw spring-boot:run` | `backend/` | Start backend dev server |
| `./mvnw clean compile` | `backend/` | Compile only |
| `./mvnw test` | `backend/` | Run all backend tests |
| `npm run dev` | `frontend/` | Start Next.js dev server |
| `npm run build` | `frontend/` | Production build |
| `npm run test:run` | `frontend/` | Run frontend tests once |

---

## 7. Common issues

| Problem | Fix |
|---------|-----|
| `DB_PASSWORD` not set | Make sure `backend/.env` exists and is filled; `application.properties` imports it via `spring.config.import=optional:file:./.env[.properties]` |
| Port 8080 in use | `npx kill-port 8080` or change `server.port` in `application.properties` |
| `MAIL_PASSWORD` rejected | Use a Gmail **App Password**, not your account password |
| `JWT_SECRET` blank → 500 errors | Generate a secret and add to `.env` |
| `Cannot find symbol getRole()` on `User` | Pre-existing compile issue in non-controller code — run `./mvnw clean compile` from `backend/`; controllers compile correctly |
| Frontend `npm install` fails | Check Node version: `node -v` must be ≥ 20 |
