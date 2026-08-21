-- 001_init.sql
--
-- Initial NutriTrack Web schema.
--
-- Two tables carry nutrition data because they are genuinely different shapes:
--   heifa_assessments  - ported from the Android app. Static, one row per user,
--                        read-only after import, no time dimension at all.
--   nutrition_records  - new to the web app. Append-only time series, which is
--                        what the seven-day analytics runs on.
-- Merging them would leave half the columns permanently NULL.
--
-- Targets MySQL 8 / MariaDB 10.4+ (this project runs on MariaDB 11.8).

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  -- The Android app's `uid` / patient identifier from the source CSV.
  uid           VARCHAR(32)   NOT NULL,
  username      VARCHAR(100)  NOT NULL,
  sex           ENUM('male', 'female') NOT NULL,
  phone_number  VARCHAR(32)   NOT NULL,

  -- Questionnaire fields, all optional, ported from the Android User entity.
  persona           VARCHAR(64)   NULL,
  meal_time         VARCHAR(16)   NULL,
  sleep_time        VARCHAR(16)   NULL,
  wake_time         VARCHAR(16)   NULL,
  food_preferences  VARCHAR(500)  NULL,

  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,

  -- No authentication columns: auth is out of MVP scope and arrives in a later
  -- migration. Multi-user extensibility comes from this table plus the user_id
  -- foreign keys below.

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_uid (uid)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS heifa_assessments (
  -- One assessment per user, so the FK doubles as the primary key.
  user_id  INT UNSIGNED  NOT NULL,

  -- Thirteen scores, sex already resolved at import time. The source CSV stored
  -- each of these twice (…Male / …Female) and chose a column at read time; see
  -- lib/domain/heifa.ts for the collapse.
  total_score                   DECIMAL(6, 2) NOT NULL,
  discretionary_score           DECIMAL(6, 2) NOT NULL,
  vegetables_score              DECIMAL(6, 2) NOT NULL,
  fruit_score                   DECIMAL(6, 2) NOT NULL,
  grains_cereals_score          DECIMAL(6, 2) NOT NULL,
  wholegrains_score             DECIMAL(6, 2) NOT NULL,
  meat_alternatives_score       DECIMAL(6, 2) NOT NULL,
  dairy_alternatives_score      DECIMAL(6, 2) NOT NULL,
  water_score                   DECIMAL(6, 2) NOT NULL,
  unsaturated_fat_score         DECIMAL(6, 2) NOT NULL,
  sodium_score                  DECIMAL(6, 2) NOT NULL,
  sugar_score                   DECIMAL(6, 2) NOT NULL,
  alcohol_score                 DECIMAL(6, 2) NOT NULL,

  -- Serve sizes kept for dashboard context. Not sex-dependent in the source.
  discretionary_serve_size      DECIMAL(8, 2) NULL,
  vegetables_serve_size         DECIMAL(8, 2) NULL,
  fruit_serve_size              DECIMAL(8, 2) NULL,
  grains_cereals_serve_size     DECIMAL(8, 2) NULL,
  wholegrains_serve_size        DECIMAL(8, 2) NULL,
  meat_alternatives_serve_size  DECIMAL(8, 2) NULL,
  dairy_alternatives_serve_size DECIMAL(8, 2) NULL,
  sodium_mg                     DECIMAL(10, 2) NULL,
  alcohol_standard_drinks       DECIMAL(8, 2) NULL,
  water_total_ml                DECIMAL(10, 2) NULL,
  sugar_grams                   DECIMAL(8, 2) NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id),
  CONSTRAINT fk_heifa_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS nutrition_records (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id        INT UNSIGNED    NOT NULL,

  food_name      VARCHAR(200)    NOT NULL,
  -- Optional tag linking a logged food back to a HEIFA category, so intake can
  -- be compared against the ported baseline. NULL when uncategorised.
  heifa_category ENUM(
    'discretionary', 'vegetables', 'fruit', 'grainsAndCereals', 'wholegrains',
    'meatAndAlternatives', 'dairyAndAlternatives', 'water', 'unsaturatedFat',
    'sodium', 'sugar', 'alcohol'
  ) NULL,

  serving_qty    DECIMAL(8, 2)   NOT NULL,
  serving_unit   VARCHAR(32)     NOT NULL,

  -- Macros per the whole logged serving, not per 100g.
  calories       DECIMAL(8, 2)   NOT NULL DEFAULT 0,
  protein_g      DECIMAL(8, 2)   NOT NULL DEFAULT 0,
  carbs_g        DECIMAL(8, 2)   NOT NULL DEFAULT 0,
  fat_g          DECIMAL(8, 2)   NOT NULL DEFAULT 0,
  sugar_g        DECIMAL(8, 2)   NOT NULL DEFAULT 0,

  source         ENUM('manual', 'fruityvice') NOT NULL DEFAULT 'manual',
  -- FruityVice's own id, when the entry came from a lookup. Not a foreign key:
  -- it references an external system we do not control.
  fruityvice_id  INT UNSIGNED    NULL,

  consumed_at    DATETIME        NOT NULL,
  -- Written explicitly by the application, NOT generated from consumed_at.
  -- A generated column would bucket by the database server's timezone and
  -- silently misfile entries near midnight, corrupting the seven-day chart.
  consumed_on    DATE            NOT NULL,

  created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  -- Access path for the seven-day window query.
  KEY idx_records_user_day (user_id, consumed_on),
  CONSTRAINT fk_records_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
