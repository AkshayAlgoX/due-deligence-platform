# Security Policy

> **Real Estate Due Diligence Platform**  
> Last updated: June 2025 — reflects Milestones 1, 2 and 3 (current build)

---

## Reporting a vulnerability

If you discover a security issue, **do not open a public GitHub issue**.

Email us directly: **duedeligence8@gmail.com**

We aim to respond within 48 hours. Please include:
- A clear description of the issue
- Steps to reproduce
- What data or functionality is affected
- Whether you believe it is exploitable in the current build

We do not have a bug bounty programme at this time.

---

## What is built and running today

### Authentication

#### JWT (JSON Web Tokens)
- **Algorithm:** HS256 (HMAC-SHA256)
- **Expiry:** 1 hour (short-lived per OWASP recommendations)
- **Storage:** Client-side (localStorage or sessionStorage based on "Remember Me")
- **Header format:** `Authorization: Bearer <token>`
- **Signing secret:** Loaded from environment variable `JWT_SECRET` — never committed to source control
- **Expired tokens:** Return HTTP 401 and trigger clean client-side logout

#### Password hashing
- **Algorithm:** BCrypt, strength factor 10 (Spring Security default)
- **Never stored:** Plain text, MD5, SHA1, or any reversible form
- **Google-only accounts:** `password` column is `NULL` — these users authenticate exclusively via Google OAuth

#### Google OAuth 2.0
- Frontend uses `@react-oauth/google` to obtain a Google ID token
- Backend verifies the token server-side using `GoogleTokenVerifier` against Google's public keys — the frontend token is never trusted blindly
- **First sign-in flow:** New Google users are redirected to a mandatory 2-step profile completion page (role selection + phone number) before receiving a JWT
- Auth provider tracked per user: `LOCAL`, `GOOGLE`, or `LOCAL_AND_GOOGLE`

#### OTP-based password reset
- Forgot password requests trigger a 6-digit OTP delivered to the registered email via Gmail SMTP
- OTPs are single-use and time-limited
- Rate limited independently (see rate limiting section below)

---

### Authorisation (RBAC)

#### Roles
| Role | Enum | Access level |
|---|---|---|
| Buyer | `BUYER` | `/api/buyer/**` + authenticated endpoints |
| Real estate agent | `REAL_ESTATE_AGENT` | `/api/agent/**` + authenticated endpoints |
| Legal reviewer | `LEGAL_REVIEWER` | `/api/legal/**` + authenticated endpoints |
| Financial institution | `FINANCIAL_INSTITUTION` | `/api/financial/**` + authenticated endpoints |
| Admin | `ADMIN` | All endpoints including `/api/admin/**` |

#### Defence in depth
Every role-restricted endpoint is protected at two independent layers:

**Layer 1 — URL pattern matching** in `SecurityConfig.securityFilterChain()`:
```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")