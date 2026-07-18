# Security Overview

Real Estate Due Diligence Platform — Milestone 1 Security Compliance.

This document explains the security architecture and every deliberate decision made.

---

## Authentication

### JWT-Based Auth
- **Algorithm:** HS256 (HMAC-SHA256)
- **Expiry:** 1 hour (short-lived access tokens per OWASP recommendations)
- **Storage:** Client-side (localStorage or sessionStorage based on "Remember Me" checkbox)
- **Header format:** `Authorization: Bearer <token>`
- **Signing secret:** Loaded from `jwt.secret` in application.properties

### Password Hashing
- **Algorithm:** BCrypt (Spring Security's default, strength 10)
- **Never stored:** Plain text, MD5, or SHA1
- **Google-only users:** `password` column stays `NULL` (they authenticate via Google OAuth)

### OAuth2 (Google Sign-In)
- Frontend uses `@react-oauth/google` to obtain a Google ID token
- Backend verifies the token with `GoogleTokenVerifier` (uses Google's public keys)
- Flow:
  - Existing user → issue our own JWT, redirect to `/dashboard`
  - New user → redirect to `/complete-profile` to select role + phone
- Auth provider tracking in DB: `LOCAL`, `GOOGLE`, or `LOCAL_AND_GOOGLE`

---

## Authorization (RBAC)

### Roles
| Role | Enum Value | Access |
|------|-----------|--------|
| Buyer | `BUYER` | `/api/buyer/**` + authenticated endpoints |
| Real Estate Agent | `REAL_ESTATE_AGENT` | `/api/agent/**` + authenticated endpoints |
| Legal Reviewer | `LEGAL_REVIEWER` | `/api/legal/**` + authenticated endpoints |
| Financial Institution | `FINANCIAL_INSTITUTION` | `/api/financial/**` + authenticated endpoints |
| Admin | `ADMIN` | Everything, including `/api/admin/**` |

### Defence in Depth
Every role-restricted endpoint is protected at TWO layers:

1. **URL level** — `SecurityConfig.securityFilterChain()`:
   ```java
   .requestMatchers("/api/admin/**").hasRole("ADMIN")