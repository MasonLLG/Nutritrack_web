-- 002_add_saturated_fat.sql
--
-- Adds the saturated fat HEIFA component.
--
-- 001_init.sql mirrored the Android app's Insights screen, which displayed 12
-- scored components. That screen omitted saturated fat, so its scores never
-- summed to the total HEIFA score: across all 9 source rows the shortfall was
-- exactly the SaturatedFatHEIFAscore value (0, 2.5 or 5).
--
-- The column exists in the source CSV and belongs in the schema. With it, the
-- 13 components reconcile to total_score.
--
-- Forward-only: 001_init.sql is already applied and is not edited.

ALTER TABLE heifa_assessments
  ADD COLUMN saturated_fat_score DECIMAL(6, 2) NOT NULL DEFAULT 0
    AFTER unsaturated_fat_score,
  ADD COLUMN saturated_fat_grams DECIMAL(8, 2) NULL
    AFTER sugar_grams;
