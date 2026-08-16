-- V12: Add ON DELETE CASCADE to every FK that references properties.
--
-- Property deletion was failing with FK violations because several tables
-- had FKs to properties with NO ACTION (default). The JPA entities now carry
-- @OnDelete(action = OnDeleteAction.CASCADE) (fixes fresh schemas), and this
-- script repairs EXISTING databases by dropping each FK and re-adding it with
-- ON DELETE CASCADE.
--
-- Local DB constraint names found (Aug 2026) are noted per table; the DO
-- blocks below resolve names dynamically via pg_constraint, so this script
-- works on any deployment regardless of generated names.

-- ── property_due_diligence_snapshots ─────────────────────────────
-- (local name: fko6q927dm53j9x2hsmrpbkvp1v)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'property_due_diligence_snapshots'::regclass
    AND contype = 'f'
    AND confrelid = 'properties'::regclass
  LOOP
    EXECUTE 'ALTER TABLE property_due_diligence_snapshots DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE property_due_diligence_snapshots ADD CONSTRAINT property_due_diligence_snapshots_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- ── property_labels ──────────────────────────────────────────────
-- (local name: fk_property_labels_property — already CASCADE locally;
--  re-added defensively for deployments created without it)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'property_labels'::regclass
    AND contype = 'f'
    AND confrelid = 'properties'::regclass
  LOOP
    EXECUTE 'ALTER TABLE property_labels DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE property_labels ADD CONSTRAINT property_labels_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- ── comparable_analyses ──────────────────────────────────────────
-- (local name: fkqetqtdtmqydj9s7vxa8nhne9)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'comparable_analyses'::regclass
    AND contype = 'f'
    AND confrelid = 'properties'::regclass
  LOOP
    EXECUTE 'ALTER TABLE comparable_analyses DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE comparable_analyses ADD CONSTRAINT comparable_analyses_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- ── comparable_properties → properties ───────────────────────────
-- (local name: fksyry9apf9y5t2awctitmyy1x8)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'comparable_properties'::regclass
    AND contype = 'f'
    AND confrelid = 'properties'::regclass
  LOOP
    EXECUTE 'ALTER TABLE comparable_properties DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE comparable_properties ADD CONSTRAINT comparable_properties_property_id_fkey FOREIGN KEY (comp_property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- ── comparable_properties → comparable_analyses ──────────────────
-- (local name: fk2gvr57m04n4sum9gol8u9bkd4)
-- Required so cascade-deleting an analysis (via property) removes its rows.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'comparable_properties'::regclass
    AND contype = 'f'
    AND confrelid = 'comparable_analyses'::regclass
  LOOP
    EXECUTE 'ALTER TABLE comparable_properties DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE comparable_properties ADD CONSTRAINT comparable_properties_analysis_id_fkey FOREIGN KEY (analysis_id) REFERENCES comparable_analyses(id) ON DELETE CASCADE;

-- ── property_valuations ──────────────────────────────────────────
-- (local name: fknu3s7m63tc8pffcr6xl64rxrp)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'property_valuations'::regclass
    AND contype = 'f'
    AND confrelid = 'properties'::regclass
  LOOP
    EXECUTE 'ALTER TABLE property_valuations DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE property_valuations ADD CONSTRAINT property_valuations_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- ── report_history ───────────────────────────────────────────────
-- (local name: fkgwjmn8no4gal6y07o6ake6gac)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'report_history'::regclass
    AND contype = 'f'
    AND confrelid = 'properties'::regclass
  LOOP
    EXECUTE 'ALTER TABLE report_history DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE report_history ADD CONSTRAINT report_history_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;
