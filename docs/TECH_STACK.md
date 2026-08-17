# Tech Stack

All versions are sourced directly from `backend/pom.xml` and `frontend/package.json`.

---

## Backend

| Library / Framework | Version | Rationale |
|---------------------|---------|-----------|
| **Spring Boot** | 4.1.0 | Full-stack Java framework — auto-configuration, embedded Tomcat, actuator, security |
| **Spring Security** | (managed by Boot) | JWT + RBAC with minimal config; `@PreAuthorize` per endpoint |
| **Spring Data JPA** | (managed by Boot) | ORM layer — entities, repositories, JPQL queries; zero boilerplate |
| **Hibernate** | (managed by Boot) | JPA provider with `ddl-auto=update` for schema migration in dev |
| **PostgreSQL driver** | (managed by Boot) | Production DB — ACID, JSONB for report sections, relational integrity |
| **H2 (test scope)** | (managed by Boot) | In-memory DB for unit/integration tests — no Postgres needed in CI |
| **JJWT** | 0.12.7 | Standard JWT creation and verification (HS512); replaces legacy `jjwt` 0.x |
| **Lombok** | (managed by Boot) | Reduces boilerplate: `@Getter`, `@Setter`, `@Builder`, `@RequiredArgsConstructor` |
| **Spring Validation** | (managed by Boot) | Bean Validation 3.0 (`@Valid`, `@NotBlank`, etc.) on DTOs |
| **Spring Mail** | (managed by Boot) | SMTP email — OTP delivery, alerts, notifications via Gmail |
| **Spring WebFlux** | (managed by Boot) | Reactive `WebClient` for non-blocking HTTP calls to Groq LLM API |
| **springdoc-openapi** | 2.8.0 | Swagger UI + OpenAPI 3 docs auto-generated from `@Operation` annotations |
| **Bucket4j** | 8.10.1 | Token-bucket rate limiting per endpoint type — guards public auth endpoints |
| **Caffeine** | (managed by Boot) | In-memory cache with TTL (risk scoring, property aggregation) |
| **Spring Cache** | (managed by Boot) | Abstraction layer over Caffeine — `@Cacheable`, `@CacheEvict` |
| **Spring Retry** | 2.0.11 | Automatic retry with back-off for external API calls (flood, zoning, tax) |
| **Google API Client** | 2.7.0 | Verify Google ID tokens for Google Sign-In flow |
| **iText 7** | 7.2.5 | PDF generation for full due-diligence reports (iText kernel + layout) |
| **OpenPDF** | 1.3.39 | Admin analytics PDF export — lighter than iText, OpenPDF API |
| **Apache POI** | 5.2.5 | Excel (.xlsx) generation for report and analytics exports |
| **JFreeChart** | 1.5.4 | Chart rendering as images embedded in PDF reports |
| **Spring Actuator** | (managed by Boot) | `/actuator/health` and `/actuator/info` endpoints for monitoring |

---

## Frontend

| Library / Framework | Version | Rationale |
|---------------------|---------|-----------|
| **Next.js** | 16.2.10 | App Router, SSR, Turbopack HMR, built-in proxy rewrites for `/api/*` |
| **React** | 19.2.4 | Latest stable — concurrent features, use-hook, server actions |
| **Tailwind CSS** | 4.x | Utility-first CSS — rapid UI, dark mode, responsive grid |
| **Base UI (`@base-ui/react`)** | 1.6.0 | Headless, accessible component primitives (Select, Menu, Dialog) from MUI |
| **Recharts** | 3.10.0 | Composable chart library — AreaChart, BarChart, PieChart for dashboards |
| **Leaflet + react-leaflet** | 1.9.4 / 5.0.0 | Interactive property maps — lighter than Google Maps, OSM tiles |
| **i18next + react-i18next** | 24.2.3 / 15.5.1 | 11-language internationalisation — all UI strings externalised to JSON |
| **Lucide React** | 1.24.0 | Consistent icon set — tree-shakeable SVG icons |
| **Sonner** | 2.0.7 | Accessible toast notifications — minimal API, dark-mode-aware |
| **Framer Motion** | 12.42.2 | Declarative animation — page transitions, loading states |
| **Axios** | 1.18.1 | HTTP client with interceptors for JWT attachment and 401 handling |
| **@react-oauth/google** | 0.13.5 | Google Sign-In button — wraps the Google Identity Services SDK |
| **@react-pdf/renderer** | 4.5.1 | Client-side PDF rendering for shareable report previews |
| **react-markdown** | 10.1.0 | Renders AI-generated markdown in the report summary and chat views |
| **canvas-confetti** | 1.9.4 | Subscription success celebration animation |
| **nextjs-toploader** | 3.9.17 | Progress bar on page navigation |
| **Vitest** | 2.1.8 | Unit/component test runner — fast, ESM-native, Jest-compatible API |
| **@testing-library/react** | 16.1.0 | Component testing with accessibility-first queries |
| **ESLint + eslint-config-next** | 9 / 16.2.10 | Linting with Next.js recommended rules |
