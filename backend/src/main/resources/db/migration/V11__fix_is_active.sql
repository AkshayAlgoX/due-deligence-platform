-- V11: Unify users.is_active handling (null-safe)
-- Legacy rows created before the is_active column existed have NULL in the DB.
-- Backfill them, then make the column NOT NULL with a default so it can never happen again.

UPDATE users SET is_active = true WHERE is_active IS NULL;

ALTER TABLE users ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE users ALTER COLUMN is_active SET NOT NULL;
