# Deployment Runbook — Free Tier (Vercel + Render + Postgres)

Production deployment on free tiers only: **Vercel** (frontend), **Render** (backend),
**Postgres** (Render-managed via the Blueprint, or Neon as an alternative).

| Service | What it hosts | Free tier limits |
|---|---|---|
| Vercel | Next.js frontend | 100 GB bandwidth/month |
| Render | Spring Boot backend (Docker) | 750 instance-hours/month, sleeps after 15 min idle |
| Render Postgres | Database (via Blueprint) | 1 GB, **expires after 30 days** unless upgraded |
| Neon (optional) | Database (alternative) | 500 MB, does not expire |

Total setup time: ~20 minutes, one time. After setup, **every push to `develop` or
`main` auto-deploys** both services.

---

## SECTION A: Neon Postgres (optional, 2 min)

> The Render Blueprint (Section B) already provisions its own free `dd-postgres`
> database. Use Neon **only** if you want a database that doesn't expire after
> 30 days. Otherwise skip this section.

1. Go to https://neon.tech → sign up with GitHub
2. Create project: name `due-diligence` → region: **Singapore**
3. Copy the connection string from the dashboard (format:
   `postgresql://user:pass@host/db?sslmode=require`)
4. Convert it to JDBC form for Spring Boot:
   - Prefix: `postgresql://` → `jdbc:postgresql://`
   - Add port after the host: `jdbc:postgresql://user:pass@host:5432/db?sslmode=require`
5. Save this string — paste it as `SPRING_DATASOURCE_URL` in Section B step 5
   (instead of Render's internal URL).
6. In the Render Blueprint, delete the `dd-postgres` database service — you won't
   need it. (Render dashboard → `dd-postgres` → Delete database.)

## SECTION B: Render Backend (10 min)

1. Go to https://render.com → sign up with GitHub
2. Dashboard → **New → Blueprint** → connect repo `springboardmentor198/team-03`
3. Render auto-detects `render.yaml` at the repo root → review → click **Apply**
   - Creates web service `dd-backend` (Docker build of `Dockerfile.backend`)
   - Creates database `dd-postgres` (skip if using Neon, Section A)
   - Generates `JWT_SECRET` automatically — leave it as generated
4. Set the secret env vars (Render dashboard → `dd-backend` → Environment).
   Paste real values from your local `.env`:
   - `GROQ_API_KEY`
   - `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`
   - `MAIL_USERNAME`, `MAIL_PASSWORD` (Gmail app password — create at
     myaccount.google.com → Security → 2-Step Verification → App passwords)
   - `GOOGLE_OAUTH_CLIENT_SECRET`
5. Set `SPRING_DATASOURCE_URL` (Render dashboard → PostgreSQL → `dd-postgres` →
   **Connections** → copy **Internal Database URL**, then convert it):
   - Internal URL: `postgres://dduser:pass@dpg-xxxx-a/dd-postgres-db`
   - JDBC URL: `jdbc:postgresql://dduser:pass@dpg-xxxx-a:5432/dd-postgres-db`
   - (Or paste the Neon JDBC URL from Section A if you used Neon.)
6. Wait 5–8 min for the first build (Docker image build is slow on the free tier)
7. Copy your backend URL from the dashboard (looks like
   `https://dd-backend.onrender.com`)
8. Test it:
   ```
   curl https://dd-backend.onrender.com/actuator/health
   ```
   Expected: `{"status":"UP", ...}`

**Free tier warning**: the backend sleeps after 15 min of inactivity. The first
request after sleep takes ~30–60 s to cold-start (browser shows a spinner, then
it works). Keep the tab open during judge demos or hit the URL a minute before.

## SECTION C: Vercel Frontend (5 min)

1. Go to https://vercel.com → sign up with GitHub
2. **Add New → Project** → import `springboardmentor198/team-03`
3. Framework preset: Next.js (auto-detected)
4. **Root Directory: `frontend`**
5. Environment variables (Settings → Environment Variables):
   - `NEXT_PUBLIC_API_URL` = `https://dd-backend.onrender.com` (your real URL
     from Section B step 7)
6. Update the rewrite destination in `frontend/vercel.json`: replace
   `YOUR-BACKEND.onrender.com` with your actual Render URL, then commit + push:
   ```cmd
   git add frontend/vercel.json && git commit -m "chore: set prod backend URL in Vercel rewrites" && git push origin develop
   ```
7. Deploy → wait 2–3 min
8. Copy your frontend URL (looks like `https://team-03.vercel.app`)
9. Test: open it in a browser → landing page loads, then run a full check with
   the checklist in Section D.

## SECTION D: Post-deploy checklist

- [ ] Landing page loads
- [ ] Register works (OTP email arrives)
- [ ] Login works
- [ ] Dashboard loads
- [ ] Property search works
- [ ] AI chat streams responses
- [ ] Report generation works
- [ ] PDF export works
- [ ] Confetti fires on report
- [ ] Fraud badge visible on high-risk

## SECTION E: Troubleshooting

| Symptom | Fix |
|---|---|
| CORS error in browser console | The backend CORS config currently allows only `localhost:3000/3001`. Add your Vercel domain to `cors.setAllowedOrigins(...)` in `backend/src/main/java/com/realestate/duediligence/security/SecurityConfig.java`, commit, push — Render rebuilds. |
| 502 Bad Gateway on Render | Backend cold-starting. Wait 30–60 s and retry. |
| Backend log: `URL must start with 'jdbc'` | `SPRING_DATASOURCE_URL` was pasted without conversion. Re-do Section B step 5. |
| Neon DB connection timeout | Neon allows all IPs by default; confirm the URL has `?sslmode=require` and the port `:5432` is present. |
| Vercel build fails on Node version | `frontend/package.json` has no `engines` field, so Vercel defaults to Node 20 — compatible with Next.js 16. If you pin a version, use 20.x. |
| Health endpoint DOWN but app responds | Gmail SMTP health is disabled in the `docker` profile already; check `dd-backend` logs for the real cause. |
| Render free DB expired | Free Render databases expire after 30 days. Migrate to Neon (Section A) or recreate the Blueprint database and repaste the URL. |

## SECTION F: Custom domain (optional, free)

- Vercel: Settings → Domains → Add → follow the DNS instructions (buying a
  domain is optional; DNS changes are free).
- The free `*.vercel.app` subdomain is fine for submission.
