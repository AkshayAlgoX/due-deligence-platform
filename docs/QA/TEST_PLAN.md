# Master Test Plan — Real Estate Due Diligence Platform

**Author**: Frontend QA & Testing Specialist (Member 6)  
**Date**: August 14, 2026  
**Target Milestone**: Milestone 4 — Final QA & Release Sign-Off  

---

## 1. Overview & Objectives

This Master Test Plan details the comprehensive quality assurance strategy for the Real Estate Due Diligence platform frontend. The goal is to ensure end-to-end reliability, full WCAG 2.1 AA accessibility compliance, responsive layout stability across mobile/desktop viewports, and cross-browser readiness prior to production demonstration.

---

## 2. Testing Scope

### In Scope
1. **Frontend Component & Page Unit/Integration Testing**: Vitest + React Testing Library suite covering 10 required page/component modules (66 total tests passing).
2. **End-to-End (E2E) Flow Verification**: Playwright test suites covering Auth Flow, Property CRUD, and Report Generation.
3. **Accessibility (a11y) Auditing**: WCAG 2.1 Level AA inspection of keyboard focus management, ARIA roles, text contrast, and interactive controls.
4. **Cross-Browser & Responsiveness Validation**: Layout inspection across Desktop Chrome, Firefox, Edge, and mobile viewports (Pixel 5, iPhone 12).
5. **Bug Tracking & Remediation**: Empirical bug logging, resolution, and verification.

### Out of Scope (Assigned to Teammates)
- Member 1: Docker containerization & cloud infrastructure deployment (AWS ECS/Azure).
- Member 2: External API integration health checks (WAQI, Nominatim) & backend workflow integration.
- Member 3: Database query tuning, JPA `@EntityGraph` optimization, Redis/Caffeine caching.
- Member 4: Backend Spring Security headers, OWASP input sanitization filters, rate limiting.
- Member 5: OpenAPI/Swagger documentation & slide deck presentation assets.

---

## 3. Testing Stack & Tools

- **Unit & Component Testing**: Vitest (`v2.1.9`), React Testing Library (`@testing-library/react`), jsdom (`v25.0.1`).
- **End-to-End Testing**: Playwright (`@playwright/test` `v1.48.0` / `1.62.1`).
- **Accessibility Inspection**: DOM ARIA tree inspection, keyboard tab focus audit, WCAG contrast verification.
- **Environment**: Next.js 16.2.10, Node.js v20.x, Windows 11.

---

## 4. Test Strategy & Execution Phases

### Phase 1: Unit & Component Testing (Vitest)
- Test key observable behaviors, state transitions, props rendering, loading indicators, and error boundaries.
- Utilize isolated module mocks (`vi.mock`) for Next.js router, translation hooks (`react-i18next`), and API service layer.
- **Target Metrics**: 25+ component/page tests. (Achieved: **66 passing unit/component tests across 18 test files**).

### Phase 2: End-to-End Testing (Playwright)
- Execute scenario tests against real app routes (`/login`, `/dashboard/property-search`, `/reports`).
- Validate complete user journeys: authentication, property searching/modal triggers, report creation and filtering.

### Phase 3: Accessibility Audit
- Audit focus indicators (`focus-visible:ring-2`), ARIA labels, semantic markup (`<table>`, `<button>`), and keyboard shortcuts (`Enter`/`Space`).

### Phase 4: Cross-Browser & Mobile QA
- Verify CSS grid/flexbox responsiveness at desktop (`1400px+`), tablet (`768px`), and mobile (`375px`) viewports.

---

## 5. Defect Management Process

Defects identified during testing are recorded in `docs/QA/BUG_TRACKER.md` with:
- Unique Bug ID
- Feature / Component
- Description & Severity (Critical, High, Medium, Low)
- Reproduction Steps
- Root Cause & Fix Details
- Verification Status (Verified / Closed)
