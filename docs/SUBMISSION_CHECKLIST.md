# Pre-Submission Checklist

Run through this the day before submitting. Each item has a command or a
verifiable action — no judgement calls.

## Code quality

- [ ] Backend tests green:
      `cd backend && mvnw.cmd test -Dspring.profiles.active=test` → 0 failures
- [ ] Frontend tests green:
      `cd frontend && npm run test:run` → 0 failures
      (If the RiskSpectrum snapshot fails on a relative date, refresh it with
      `npx vitest run -u` and commit the updated snapshot — then re-run to
      confirm green.)
- [ ] No merge-conflict markers left in committed files:
      `git grep -n "<<<<<<<\|>>>>>>>"` → empty output
- [ ] Docker builds succeed:
      `docker-compose build` (or `docker build -f Dockerfile.backend -t dd-backend:ci .`
      and `docker build -f Dockerfile.frontend -t dd-frontend:ci .`)
- [ ] No secrets in git history: `git log --all --source -- .env` → empty;
      also check `git grep -n "sk-\|gsk_" -- ':!*.md'` for stray keys

## Deployment

- [ ] Live URL working (Vercel + Render) — open the site and run the
      post-deploy checklist in docs/DEPLOYMENT.md §D
- [ ] `frontend/vercel.json` has the real Render URL in `rewrites` (no
      `YOUR-BACKEND` placeholder)
- [ ] README.md updated with the live Vercel URL
- [ ] All screenshots captured in `docs/screenshots/` (01–15, see
      docs/E2E_DEMO_SCRIPT.md)
- [ ] E2E demo script tested end-to-end against the live URL

## People & process

- [ ] All team members added to the GitHub repo (Settings → Collaborators)
- [ ] Mentor tagged in the final PR
- [ ] Submission form filled with:
  - GitHub repo URL (https://github.com/springboardmentor198/team-03)
  - Live deployment URL
  - Screenshots
  - Team member names
- [ ] Video walkthrough recorded (if required by mentor) — 5-minute run of the
      E2E demo script

## Final review

- [ ] `git status` clean on `develop` before tagging the submission commit
- [ ] README badges/links tested (open README on GitHub, click each link once)
- [ ] One last full pass of docs/E2E_DEMO_SCRIPT.md on the live URL
