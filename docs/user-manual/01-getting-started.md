# Chapter 1 — Getting Started

## What is Real Estate Due Diligence?

Real Estate Due Diligence is a platform that helps property buyers, agents, and
legal/financial professionals make faster, more informed decisions. For any property
you add, it automatically pulls data from multiple sources, calculates a risk score,
and generates a comprehensive PDF report — in minutes, not days.

---

## Creating an account

1. Open **http://localhost:3000** (or the deployed URL your team provides).
2. Click **Get Started** or **Sign Up** on the landing page.
3. Fill in your **full name**, **email**, **phone number**, **password**, and **role**:
   - **Buyer** — purchasing properties for personal use or investment
   - **Real Estate Agent** — managing listings on behalf of clients
   - **Legal Reviewer** — reviewing encumbrances and legal standing
   - **Financial Institution** — assessing mortgage/loan risk
4. Click **Create Account**. A 6-digit OTP is sent to your email.
5. Enter the OTP in the verification screen. Your account is created and you are logged in.

> **Tip:** If you don't receive the OTP within 2 minutes, click **Resend OTP**.
> There is a 60-second cooldown between resends.

---

## Signing in with Google

1. On the login page, click **Continue with Google**.
2. Complete the Google account selector.
3. If this is your first Google sign-in, you are asked to choose a role and
   provide a phone number — fill these in and click **Complete Sign Up**.
4. You are logged in and redirected to the dashboard.

---

## Logging in with email and password

1. Navigate to `/login`.
2. Enter your registered **email** and **password**.
3. Click **Sign In**.
4. You will receive a login-alert email as a security notification (this is normal).

---

## The Dashboard

After login you see the **User Dashboard** at `/dashboard`. It shows:

| Card | What it shows |
|------|--------------|
| Total Properties | Number of properties you have added |
| Active Reports | Reports currently in progress or completed |
| Average Risk Score | Mean risk score across your portfolio |
| System Health | Platform operational status |

Below the cards:
- **Portfolio Value History** — line chart of your portfolio value over the last 30 days
- **Recent Activity** — your last 10 actions (properties added, reports generated, etc.)
- **Recommendations** — actionable suggestions based on your portfolio

---

## Navigating the platform

Use the **sidebar** on the left to navigate:

| Menu item | Page |
|-----------|------|
| Dashboard | Portfolio overview |
| Properties | Add and manage properties |
| Risk Assessment | View risk scores and breakdowns |
| Reports | View and download due-diligence reports |
| Comparable Properties | Compare similar properties nearby |
| Saved Comparisons | Your saved property comparison sets |
| Notifications | In-app alerts |
| Settings | Profile, password, notification preferences |
| Admin *(ADMIN only)* | Platform analytics and user management |

---

## Changing the display language

1. Click the **language selector** (globe icon) in the navigation bar.
2. Select one of the 11 available languages:
   English, Hindi, Bengali, Gujarati, Kannada, Malayalam, Marathi, Punjabi, Tamil, Telugu, Urdu.
3. The UI updates immediately. Your language preference is remembered in the browser.
