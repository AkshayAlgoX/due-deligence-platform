# End-to-End Demo Script

**Duration:** ~5 minutes
**Prerequisites:** Live deployment URL (https://team-03.vercel.app) **or** local
`docker-compose up` (frontend at http://localhost:3000). Replace the production
URLs below with `http://localhost:3000` when demoing locally.

Screenshots referenced below live in `docs/screenshots/` — capture each marked
step after the final deploy (Win+Shift+S on Windows) and commit them before
submission.

---

## Step 1: Landing Page
- Action: Open https://team-03.vercel.app
- Expected: Hero with "Property risk, uncovered in seconds" + product mockup
- API: none (static)
- Screenshot: docs/screenshots/01-landing-hero.png

## Step 2: Registration
- Action: Click "Start free" → fill form (email, password, name)
- Expected: OTP sent to email
- API: POST /api/auth/register
- Screenshot: docs/screenshots/02-register.png

## Step 3: Email Verification
- Action: Enter OTP from email
- Expected: Redirect to dashboard
- API: POST /api/auth/verify-otp
- Screenshot: docs/screenshots/03-verify-otp.png

## Step 4: Dashboard
- Action: Land on /dashboard
- Expected: Empty state or existing reports
- API: GET /api/reports?userId=X
- Screenshot: docs/screenshots/04-dashboard.png

## Step 5: Add Property
- Action: Click "Add Property" → enter address
- Expected: Address geocoded, property card appears
- API: POST /api/properties
- Screenshot: docs/screenshots/05-add-property.png

## Step 6: Property Detail
- Action: Click property card
- Expected: Full detail view with tabs
- API: GET /api/properties/{id}
- Screenshot: docs/screenshots/06-property-detail.png

## Step 7: AI Chat
- Action: Click floating chat button → ask "What are the top 3 risks?"
- Expected: Streaming response from Llama 3.3 70B (llama-3.3-70b-versatile on
  Groq), cited sources
- API: POST /api/agent/chat/stream (SSE)
- Screenshot: docs/screenshots/07-ai-chat.png

## Step 8: Generate Report
- Action: Click "Generate Due Diligence Report"
- Expected: Loading state → confetti on success → report page
- API: POST /api/reports/generate → GET /api/reports/{id}
- Screenshot: docs/screenshots/08-report-generating.png

## Step 9: Report View
- Action: Scroll through report sections
- Expected: 6 risk categories with scores + weights + traceable sources
- API: GET /api/reports/{id}/sections
- Screenshot: docs/screenshots/09-report-view.png

## Step 10: AI Executive Summary
- Action: Scroll to top of report
- Expected: AI-generated verdict pill (BUY/NEGOTIATE/AVOID) + 3-sentence summary
- API: POST /api/reports/{id}/ai-summary
- Screenshot: docs/screenshots/10-ai-summary.png

## Step 11: Fraud Alert (if high-risk)
- Action: View any HIGH risk property
- Expected: Red pulsing badge, tooltip with risk factors
- API: (risk data from report response)
- Screenshot: docs/screenshots/11-fraud-alert.png

## Step 12: PDF Export
- Action: Click "Export PDF"
- Expected: PDF downloads with full report + charts
- API: GET /api/reports/{id}/export/pdf
- Screenshot: docs/screenshots/12-pdf-export.png

## Step 13: Excel Export
- Action: Click "Export Excel"
- Expected: XLSX with 3 sheets (summary, risk factors, chronology)
- API: GET /api/reports/{id}/export/excel
- Screenshot: docs/screenshots/13-excel-export.png

## Step 14: Command Palette
- Action: Press Ctrl+K
- Expected: Palette opens, type "reports" → navigate
- API: none (client-side)
- Screenshot: docs/screenshots/14-command-palette.png

## Step 15: Logout
- Action: User menu → Logout
- Expected: Redirect to landing, session cleared
- API: POST /api/auth/logout (client token cleared)
- Screenshot: docs/screenshots/15-logout.png

---

## Test Data (for judges to reproduce)

| Case | Address | Expected |
|---|---|---|
| Sample property | "Villa 42, Whitefield, Bangalore 560066" | Medium/low risk, full report |
| Sample high-risk | "Plot 7, Sector 18, Noida" (fictional — triggers fraud rules) | HIGH verdict, fraud badge |
| Test user credentials | Register fresh with your own email | OTP flow proves real email delivery |

## Demo tips

- Warm the backend first: on production, open https://dd-backend.onrender.com/actuator/health
  a minute before the demo (free tier sleeps after 15 min idle).
- If an AI call is slow on the first request, it's the cold start — retry once.
- For the fraud alert (Step 11), use the high-risk test address — it triggers
  the rules deterministically.
