# Database Schema

All tables are managed by Hibernate (`ddl-auto=update`). Entities live in
`backend/src/main/java/com/realestate/duediligence/entity/`.

---

## ERD (Mermaid)

```mermaid
erDiagram
    users {
        BIGINT id PK
        VARCHAR full_name
        VARCHAR email UK
        VARCHAR password
        VARCHAR phone_number
        BIGINT role_id FK
        VARCHAR google_id UK
        VARCHAR auth_provider
        VARCHAR profile_picture
        TIMESTAMP token_valid_from
        BOOLEAN is_active
        BOOLEAN is_banned
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    roles {
        BIGINT id PK
        VARCHAR role_name UK
    }

    properties {
        BIGINT id PK
        VARCHAR address
        VARCHAR city
        VARCHAR state
        VARCHAR zip_code
        VARCHAR property_type
        DOUBLE area
        DOUBLE market_value
        INT year_built
        DOUBLE lot_size
        VARCHAR zoning
        VARCHAR image_url
        BOOLEAN verified
        INT bedrooms
        INT bathrooms
        INT stories
        VARCHAR structure_type
        VARCHAR condition
        BIGINT created_by FK
        DOUBLE latitude
        DOUBLE longitude
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    risk_assessments {
        BIGINT id PK
        BIGINT property_id FK
        DOUBLE overall_score
        VARCHAR overall_level
        DOUBLE flood_score
        DOUBLE legal_score
        DOUBLE tax_score
        DOUBLE zoning_score
        DOUBLE environmental_score
        DOUBLE market_score
        TEXT summary
        BOOLEAN is_latest
        TIMESTAMP calculated_at
        TIMESTAMP updated_at
    }

    risk_factors {
        BIGINT id PK
        BIGINT assessment_id FK
        VARCHAR category
        DOUBLE score
        VARCHAR level
        DOUBLE weight
        VARCHAR explanation
        VARCHAR recommendation
        VARCHAR data_source
        TIMESTAMP created_at
    }

    due_diligence_reports {
        BIGINT id PK
        BIGINT property_id FK
        BIGINT generated_by FK
        BIGINT risk_assessment_id FK
        VARCHAR title
        VARCHAR status
        INT version
        VARCHAR share_token UK
        TIMESTAMP share_expires_at
        DOUBLE risk_score_snapshot
        TEXT executive_summary
        TEXT ai_summary
        TIMESTAMP ai_summary_generated_at
        TEXT error_message
        TIMESTAMP completed_at
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    report_sections {
        BIGINT id PK
        BIGINT report_id FK
        VARCHAR section_type
        VARCHAR title
        INT order_index
        TEXT content
        TEXT data_json
        TIMESTAMP created_at
    }

    notifications {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR notification_type
        VARCHAR title
        TEXT message
        VARCHAR redirect_url
        BOOLEAN is_read
        TIMESTAMP created_at
    }

    notification_preferences {
        BIGINT id PK
        BIGINT user_id FK UK
        BOOLEAN report_ready_email
        BOOLEAN report_ready_in_app
        BOOLEAN risk_alert_email
        BOOLEAN risk_alert_in_app
        BOOLEAN price_change_email
        BOOLEAN price_change_in_app
        BOOLEAN system_email
        BOOLEAN system_in_app
    }

    saved_comparisons {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR name
        VARCHAR notes
        VARCHAR property_ids
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    audit_logs {
        BIGINT id PK
        BIGINT user_id FK
        VARCHAR action
        VARCHAR resource_type
        BIGINT resource_id
        TEXT details_json
        VARCHAR ip_address
        VARCHAR user_agent
        TIMESTAMP created_at
    }

    export_history {
        BIGINT id PK
        VARCHAR report_id
        BIGINT user_id
        VARCHAR format
        VARCHAR file_path
        BIGINT file_size_bytes
        INT download_count
        TIMESTAMP created_at
    }

    comparable_analyses {
        BIGINT id PK
        BIGINT property_id FK
        DOUBLE radius_km
        TIMESTAMP created_at
    }

    comparable_properties {
        BIGINT id PK
        BIGINT analysis_id FK
        BIGINT comp_property_id FK
        DOUBLE similarity_score
        DOUBLE distance_km
        VARCHAR similarity_level
    }

    property_valuations {
        BIGINT id PK
        BIGINT property_id FK
        DOUBLE estimated_value
        DOUBLE confidence_low
        DOUBLE confidence_high
        VARCHAR method
        TIMESTAMP calculated_at
    }

    subscriptions {
        BIGINT id PK
        BIGINT user_id
        VARCHAR plan
        VARCHAR status
        VARCHAR cashfree_order_id
        VARCHAR cashfree_payment_id
        BIGINT amount
        VARCHAR currency
        TIMESTAMP created_at
        TIMESTAMP expires_at
        TIMESTAMP cancelled_at
    }

    report_history {
        BIGINT id PK
        VARCHAR report_id
        BIGINT property_id FK
        BIGINT user_id FK
        INT version
        VARCHAR risk_level
        VARCHAR file_path
        BOOLEAN is_archived
        TIMESTAMP created_at
    }

    users ||--o{ properties : "created_by"
    users ||--o{ due_diligence_reports : "generated_by"
    users ||--o{ notifications : "user_id"
    users ||--|| notification_preferences : "user_id"
    users ||--o{ saved_comparisons : "user_id"
    users ||--o{ audit_logs : "user_id"
    users ||--o{ report_history : "user_id"
    roles ||--o{ users : "role_id"
    properties ||--o{ risk_assessments : "property_id"
    properties ||--o{ due_diligence_reports : "property_id"
    properties ||--o{ comparable_analyses : "property_id"
    properties ||--o{ property_valuations : "property_id"
    properties ||--o{ report_history : "property_id"
    risk_assessments ||--o{ risk_factors : "assessment_id"
    due_diligence_reports ||--o{ report_sections : "report_id"
    comparable_analyses ||--o{ comparable_properties : "analysis_id"
```

---

## Table Descriptions

### `users`
Central user table. Supports local (email+password) and Google OAuth authentication.
- `role_id` → `roles.id` (EAGER loaded)
- `token_valid_from` — used to invalidate all JWTs issued before this timestamp (logout-all-devices)
- `is_banned` — admin-set flag preventing login
- `auth_provider` — `"LOCAL"` or `"GOOGLE"`

### `roles`
Lookup table for the 5 platform roles:
`BUYER`, `REAL_ESTATE_AGENT`, `LEGAL_REVIEWER`, `FINANCIAL_INSTITUTION`, `ADMIN`.
Seeded by `DataInitializer` on startup.

### `properties`
Core property listing. Owned by a `user` via `created_by` (CASCADE DELETE on user delete).
- `latitude` / `longitude` — populated asynchronously via Nominatim geocoding
- `verified` — flagged by the auto-label job or admin reverify

### `risk_assessments`
One active assessment per property (`is_latest = true`). History is preserved.
Scores range 0–100; `overall_level` is LOW / MEDIUM / HIGH / CRITICAL.

### `risk_factors`
Per-category breakdown of a `risk_assessment`. Provides explainability text and
actionable recommendations for 6 categories: FLOOD, LEGAL, TAX, ZONING, ENVIRONMENTAL, MARKET.

### `due_diligence_reports`
Generated PDF-backed reports. Status lifecycle: `PENDING → GENERATING → COMPLETED | FAILED`.
- `share_token` — UUID for shareable read-only public links
- `ai_summary` — JSON blob (verdict + bullets + rationale) from Groq LLM

### `report_sections`
Ordered sections within a report (COVER, EXECUTIVE_SUMMARY, PROPERTY_OVERVIEW, RISK_ANALYSIS,
COMPARABLE, FINANCIAL, RECOMMENDATIONS, APPENDIX). `content` is HTML/Markdown/JSON.

### `notifications`
In-app notification records. Types: `REPORT_READY`, `RISK_ALERT`, `PRICE_CHANGE`, `SYSTEM`.
Indexed on `(user_id, is_read)` and `(user_id, created_at)` for fast unread-count queries.

### `notification_preferences`
One row per user (one-to-one). Stores per-type × per-channel (email / in-app) boolean flags.

### `saved_comparisons`
User-named property comparison sets. `property_ids` stores a comma-separated list of property IDs.

### `audit_logs`
Immutable audit trail. `action` uses the `AuditAction` enum (LOGIN, REPORT_GENERATED, etc.).
`details_json` holds before/after snapshots for data-change events.

### `export_history`
Tracks every PDF/Excel export request. `download_count` incremented on re-download.

### `comparable_analyses`
One analysis run per (property, radius) pair. Contains the set of comparable results.

### `comparable_properties`
Individual comparable result within an analysis. `comp_property_id` references `properties`.

### `property_valuations`
Automated valuations computed from comparables, cost, or income approach.
`method` is the `ValuationMethod` enum: `COMPARABLE`, `COST`, `INCOME`.

### `subscriptions`
Payment and plan records. Status: `PENDING`, `ACTIVE`, `CANCELLED`, `EXPIRED`, `FAILED`, `SUPERSEDED`.
`cashfree_order_id` links to the Cashfree payment gateway.

### `report_history`
Versioned history of reports keyed by `report_id` string (e.g. `RPT-2025-000123`).
`is_archived` soft-deletes entries from default list views.
