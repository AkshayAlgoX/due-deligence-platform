-- ============================================================
-- V20: Performance indexes
-- Real Estate Due Diligence Agent
-- ============================================================
--
-- Purpose:
--   Reduce database scan cost for frequently executed:
--   - dashboard queries
--   - property activity queries
--   - risk assessment queries
--   - risk breakdown queries
--   - report history queries
--   - export history queries
--
-- Total indexes in this migration: 15
-- ============================================================


-- ============================================================
-- PROPERTY INDEXES
-- ============================================================

-- 1. User + creation time
-- Used by:
--   findTop5ByCreatedByIdOrderByCreatedAtDesc()
--   countByCreatedByIdAndCreatedAtBetween()
CREATE INDEX IF NOT EXISTS idx_property_created_by_created_at
    ON properties (created_by, created_at DESC);


-- 2. User + update time
-- Used by:
--   findTop30ByCreatedByIdOrderByUpdatedAtDesc()
--   countVerifiedByUserBetween()
CREATE INDEX IF NOT EXISTS idx_property_created_by_updated_at
    ON properties (created_by, updated_at DESC);


-- 3. User + verified
-- Used by:
--   countVerifiedByUserLong()
--   countPendingByUserLong()
CREATE INDEX IF NOT EXISTS idx_property_created_by_verified
    ON properties (created_by, verified);


-- 4. Verified + update time
-- Used by:
--   countByVerifiedTrueAndUpdatedAtBetween()
CREATE INDEX IF NOT EXISTS idx_property_verified_updated_at
    ON properties (verified, updated_at DESC);


-- 5. User + market value
-- Used by:
--   findTopByMarketValueForUser()
CREATE INDEX IF NOT EXISTS idx_property_user_market_value
    ON properties (created_by, market_value DESC)
    WHERE market_value IS NOT NULL;


-- 6. Global market value
-- Used by:
--   findTopByMarketValue()
CREATE INDEX IF NOT EXISTS idx_property_market_value
    ON properties (market_value DESC)
    WHERE market_value IS NOT NULL;


-- 7. Global activity feed
-- Used by:
--   findTop30ByOrderByUpdatedAtDesc()
CREATE INDEX IF NOT EXISTS idx_property_updated_at
    ON properties (updated_at DESC);


-- 8. Coordinates
-- Used by:
--   findAllWithCoordinates()
CREATE INDEX IF NOT EXISTS idx_property_coordinates
    ON properties (latitude, longitude)
    WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL;


-- 9. User + coordinates
-- Used by:
--   findAllWithCoordinatesByUser()
CREATE INDEX IF NOT EXISTS idx_property_user_coordinates
    ON properties (created_by, latitude, longitude)
    WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL;


-- ============================================================
-- RISK ASSESSMENT INDEXES
-- ============================================================

-- 10. Property + latest + calculated time
-- Used heavily by:
--   findByPropertyIdAndIsLatestTrue()
--   findByPropertyIdOrderByCalculatedAtDesc()
--
-- This is especially important for the risk breakdown endpoint.
CREATE INDEX IF NOT EXISTS idx_risk_property_latest_calculated_at
    ON risk_assessments (
        property_id,
        is_latest,
        calculated_at DESC
    );


-- 11. Latest + risk level
-- Used by:
--   findAllByLatestLevel()
--   countByLevelGrouped()
CREATE INDEX IF NOT EXISTS idx_risk_latest_level
    ON risk_assessments (
        is_latest,
        overall_level
    );


-- ============================================================
-- RISK FACTOR INDEX
-- ============================================================

-- 12. Assessment + factor lookup
-- Used by:
--   findByRiskAssessmentId()
--
-- Critical for:
--   RiskAssessmentServiceImpl.getBreakdown()
CREATE INDEX IF NOT EXISTS idx_risk_factor_assessment
    ON risk_factors (assessment_id);


-- ============================================================
-- DUE DILIGENCE REPORT INDEXES
-- ============================================================

-- 13. Generated user + creation time
-- Used by:
--   findByGeneratedByIdOrderByCreatedAtDesc()
--   countByGeneratedByIdAndCreatedAtAfter()
CREATE INDEX IF NOT EXISTS idx_report_generated_by_created_at
    ON due_diligence_reports (
        generated_by,
        created_at DESC
    );


-- 14. Property + version
-- Used by:
--   findByPropertyIdOrderByVersionDesc()
--   findFirstByPropertyIdOrderByVersionDesc()
--   findMaxVersionByPropertyId()
CREATE INDEX IF NOT EXISTS idx_report_property_version
    ON due_diligence_reports (
        property_id,
        version DESC
    );


-- ============================================================
-- EXPORT HISTORY INDEX
-- ============================================================

-- 15. User + creation time
-- Used by:
--   findByUserIdOrderByCreatedAtDesc()
CREATE INDEX IF NOT EXISTS idx_export_user_created_at
    ON export_history (
        user_id,
        created_at DESC
    );
