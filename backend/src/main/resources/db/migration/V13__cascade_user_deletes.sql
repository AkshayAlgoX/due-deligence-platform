-- V13: Add ON DELETE CASCADE to every FK that references users.
--
-- User deletion was failing with FK violations because several tables
-- had FKs to users with NO ACTION (default). This script repairs EXISTING
-- databases by dropping each FK referencing users and re-adding it with
-- ON DELETE CASCADE.
--
-- Local DB constraint names found (Aug 2026) are noted per table; the DO
-- blocks below resolve names dynamically via pg_constraint, so this script
-- works on any deployment regardless of generated names.
--
-- Blockers converted: audit_logs, notification_preferences,
-- portfolio_snapshots, properties, report_history.
-- Already-CASCADE FKs (due_diligence_reports, notifications,
-- saved_comparisons) are dropped and re-added defensively with a
-- deterministic name. property_labels previously used SET NULL and is
-- converted to CASCADE for consistency with the rest.

-- ── audit_logs ──────────────────────────────────────────────────
-- (local name: fkjs4iimve3y0xssbtve5ysyef0)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'audit_logs'::regclass
    AND contype = 'f'
    AND confrelid = 'users'::regclass
  LOOP
    EXECUTE 'ALTER TABLE audit_logs DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ── due_diligence_reports ───────────────────────────────────────
-- (local name: fkqw71aqv99d7iichu3ivflw6n2)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'due_diligence_reports'::regclass
    AND contype = 'f'
    AND confrelid = 'users'::regclass
  LOOP
    EXECUTE 'ALTER TABLE due_diligence_reports DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE due_diligence_reports ADD CONSTRAINT due_diligence_reports_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE;

-- ── notification_preferences ────────────────────────────────────
-- (local name: fkt9qjvmcl36i14utm5uptyqg84)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'notification_preferences'::regclass
    AND contype = 'f'
    AND confrelid = 'users'::regclass
  LOOP
    EXECUTE 'ALTER TABLE notification_preferences DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE notification_preferences ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ── notifications ───────────────────────────────────────────────
-- (local name: fk9y21adhxn0ayjhfocscqox7bh)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'notifications'::regclass
    AND contype = 'f'
    AND confrelid = 'users'::regclass
  LOOP
    EXECUTE 'ALTER TABLE notifications DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ── portfolio_snapshots ─────────────────────────────────────────
-- (local name: fkefr0fsa266mpxeuftv7asf0fa)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'portfolio_snapshots'::regclass
    AND contype = 'f'
    AND confrelid = 'users'::regclass
  LOOP
    EXECUTE 'ALTER TABLE portfolio_snapshots DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE portfolio_snapshots ADD CONSTRAINT portfolio_snapshots_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ── properties ──────────────────────────────────────────────────
-- (local names: fkci2fet5mvd39l06hnwdni7j73 [NO ACTION] and
--  fk_created_by [CASCADE] — a duplicate pair on the same column.
--  Both are dropped and a single deterministic CASCADE FK re-added.)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'properties'::regclass
    AND contype = 'f'
    AND confrelid = 'users'::regclass
  LOOP
    EXECUTE 'ALTER TABLE properties DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE properties ADD CONSTRAINT properties_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

-- ── property_labels ─────────────────────────────────────────────
-- (local name: fk_property_labels_user — kept as SET NULL so deleting
--  a user nulls the creator on their labels rather than deleting them.)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'property_labels'::regclass
    AND contype = 'f'
    AND confrelid = 'users'::regclass
  LOOP
    EXECUTE 'ALTER TABLE property_labels DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE property_labels ADD CONSTRAINT property_labels_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- ── report_history ──────────────────────────────────────────────
-- (local name: fkbygy385322crtlkn6m9qrgbhy)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'report_history'::regclass
    AND contype = 'f'
    AND confrelid = 'users'::regclass
  LOOP
    EXECUTE 'ALTER TABLE report_history DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE report_history ADD CONSTRAINT report_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ── saved_comparisons ───────────────────────────────────────────
-- (local name: fkgy90px67pbfb6tama459hiw2y)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'saved_comparisons'::regclass
    AND contype = 'f'
    AND confrelid = 'users'::regclass
  LOOP
    EXECUTE 'ALTER TABLE saved_comparisons DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE saved_comparisons ADD CONSTRAINT saved_comparisons_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
