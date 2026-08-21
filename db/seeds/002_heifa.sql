-- GENERATED FILE - do not edit by hand.
-- Produced by scripts/import-heifa.ts from db/source/data.csv.
-- Regenerate with: npm run heifa:import
INSERT INTO heifa_assessments (user_id, total_score, discretionary_score, vegetables_score, fruit_score, grains_cereals_score, wholegrains_score, meat_alternatives_score, dairy_alternatives_score, water_score, unsaturated_fat_score, saturated_fat_score, sodium_score, sugar_score, alcohol_score, discretionary_serve_size, vegetables_serve_size, fruit_serve_size, grains_cereals_serve_size, wholegrains_serve_size, meat_alternatives_serve_size, dairy_alternatives_serve_size, sodium_mg, alcohol_standard_drinks, water_total_ml, sugar_grams, saturated_fat_grams)
SELECT id, 41.67, 10, 0.5, 0, 1.67, 0, 2, 0, 0, 2.5, 5, 5, 10, 5, 1.88, 0.04, 0, 2.97, 0, 1.17, 0, 2081.75, 0, 326.8, 4.82, 8.49
FROM users WHERE uid = '4'
ON DUPLICATE KEY UPDATE
  total_score = 41.67,
  discretionary_score = 10,
  vegetables_score = 0.5,
  fruit_score = 0,
  grains_cereals_score = 1.67,
  wholegrains_score = 0,
  meat_alternatives_score = 2,
  dairy_alternatives_score = 0,
  water_score = 0,
  unsaturated_fat_score = 2.5,
  saturated_fat_score = 5,
  sodium_score = 5,
  sugar_score = 10,
  alcohol_score = 5,
  discretionary_serve_size = 1.88,
  vegetables_serve_size = 0.04,
  fruit_serve_size = 0,
  grains_cereals_serve_size = 2.97,
  wholegrains_serve_size = 0,
  meat_alternatives_serve_size = 1.17,
  dairy_alternatives_serve_size = 0,
  sodium_mg = 2081.75,
  alcohol_standard_drinks = 0,
  water_total_ml = 326.8,
  sugar_grams = 4.82,
  saturated_fat_grams = 8.49;

INSERT INTO heifa_assessments (user_id, total_score, discretionary_score, vegetables_score, fruit_score, grains_cereals_score, wholegrains_score, meat_alternatives_score, dairy_alternatives_score, water_score, unsaturated_fat_score, saturated_fat_score, sodium_score, sugar_score, alcohol_score, discretionary_serve_size, vegetables_serve_size, fruit_serve_size, grains_cereals_serve_size, wholegrains_serve_size, meat_alternatives_serve_size, dairy_alternatives_serve_size, sodium_mg, alcohol_standard_drinks, water_total_ml, sugar_grams, saturated_fat_grams)
SELECT id, 43.84, 10, 1, 0, 0.84, 0, 2, 0, 0, 0, 5, 10, 10, 5, 0.45, 1.19, 0, 1.36, 0, 0.85, 0, 67.1, 0, 488.5, 8.24, 9.74
FROM users WHERE uid = '1'
ON DUPLICATE KEY UPDATE
  total_score = 43.84,
  discretionary_score = 10,
  vegetables_score = 1,
  fruit_score = 0,
  grains_cereals_score = 0.84,
  wholegrains_score = 0,
  meat_alternatives_score = 2,
  dairy_alternatives_score = 0,
  water_score = 0,
  unsaturated_fat_score = 0,
  saturated_fat_score = 5,
  sodium_score = 10,
  sugar_score = 10,
  alcohol_score = 5,
  discretionary_serve_size = 0.45,
  vegetables_serve_size = 1.19,
  fruit_serve_size = 0,
  grains_cereals_serve_size = 1.36,
  wholegrains_serve_size = 0,
  meat_alternatives_serve_size = 0.85,
  dairy_alternatives_serve_size = 0,
  sodium_mg = 67.1,
  alcohol_standard_drinks = 0,
  water_total_ml = 488.5,
  sugar_grams = 8.24,
  saturated_fat_grams = 9.74;

INSERT INTO heifa_assessments (user_id, total_score, discretionary_score, vegetables_score, fruit_score, grains_cereals_score, wholegrains_score, meat_alternatives_score, dairy_alternatives_score, water_score, unsaturated_fat_score, saturated_fat_score, sodium_score, sugar_score, alcohol_score, discretionary_serve_size, vegetables_serve_size, fruit_serve_size, grains_cereals_serve_size, wholegrains_serve_size, meat_alternatives_serve_size, dairy_alternatives_serve_size, sodium_mg, alcohol_standard_drinks, water_total_ml, sugar_grams, saturated_fat_grams)
SELECT id, 47.34, 5, 0.5, 7.5, 3.34, 0, 2, 4, 0, 2.5, 2.5, 5, 10, 5, 4.11, 0.29, 1.26, 4.22, 0, 0.9, 1.36, 1965.42, 0, 143.7, 13.86, 10.44
FROM users WHERE uid = '2'
ON DUPLICATE KEY UPDATE
  total_score = 47.34,
  discretionary_score = 5,
  vegetables_score = 0.5,
  fruit_score = 7.5,
  grains_cereals_score = 3.34,
  wholegrains_score = 0,
  meat_alternatives_score = 2,
  dairy_alternatives_score = 4,
  water_score = 0,
  unsaturated_fat_score = 2.5,
  saturated_fat_score = 2.5,
  sodium_score = 5,
  sugar_score = 10,
  alcohol_score = 5,
  discretionary_serve_size = 4.11,
  vegetables_serve_size = 0.29,
  fruit_serve_size = 1.26,
  grains_cereals_serve_size = 4.22,
  wholegrains_serve_size = 0,
  meat_alternatives_serve_size = 0.9,
  dairy_alternatives_serve_size = 1.36,
  sodium_mg = 1965.42,
  alcohol_standard_drinks = 0,
  water_total_ml = 143.7,
  sugar_grams = 13.86,
  saturated_fat_grams = 10.44;

INSERT INTO heifa_assessments (user_id, total_score, discretionary_score, vegetables_score, fruit_score, grains_cereals_score, wholegrains_score, meat_alternatives_score, dairy_alternatives_score, water_score, unsaturated_fat_score, saturated_fat_score, sodium_score, sugar_score, alcohol_score, discretionary_serve_size, vegetables_serve_size, fruit_serve_size, grains_cereals_serve_size, wholegrains_serve_size, meat_alternatives_serve_size, dairy_alternatives_serve_size, sodium_mg, alcohol_standard_drinks, water_total_ml, sugar_grams, saturated_fat_grams)
SELECT id, 42.5, 5, 3, 0, 2.5, 0, 8, 4, 0, 5, 0, 0, 10, 5, 4.42, 3.18, 0.01, 3.81, 0, 2.89, 1.41, 2763.64, 0, 500.28, 1.71, 14.46
FROM users WHERE uid = '5'
ON DUPLICATE KEY UPDATE
  total_score = 42.5,
  discretionary_score = 5,
  vegetables_score = 3,
  fruit_score = 0,
  grains_cereals_score = 2.5,
  wholegrains_score = 0,
  meat_alternatives_score = 8,
  dairy_alternatives_score = 4,
  water_score = 0,
  unsaturated_fat_score = 5,
  saturated_fat_score = 0,
  sodium_score = 0,
  sugar_score = 10,
  alcohol_score = 5,
  discretionary_serve_size = 4.42,
  vegetables_serve_size = 3.18,
  fruit_serve_size = 0.01,
  grains_cereals_serve_size = 3.81,
  wholegrains_serve_size = 0,
  meat_alternatives_serve_size = 2.89,
  dairy_alternatives_serve_size = 1.41,
  sodium_mg = 2763.64,
  alcohol_standard_drinks = 0,
  water_total_ml = 500.28,
  sugar_grams = 1.71,
  saturated_fat_grams = 14.46;

INSERT INTO heifa_assessments (user_id, total_score, discretionary_score, vegetables_score, fruit_score, grains_cereals_score, wholegrains_score, meat_alternatives_score, dairy_alternatives_score, water_score, unsaturated_fat_score, saturated_fat_score, sodium_score, sugar_score, alcohol_score, discretionary_serve_size, vegetables_serve_size, fruit_serve_size, grains_cereals_serve_size, wholegrains_serve_size, meat_alternatives_serve_size, dairy_alternatives_serve_size, sodium_mg, alcohol_standard_drinks, water_total_ml, sugar_grams, saturated_fat_grams)
SELECT id, 47.5, 10, 0.5, 0, 2.5, 0, 6, 1, 0, 2.5, 5, 5, 10, 5, 0.93, 0.27, 0, 3.89, 0, 1.93, 0.14, 1633.5, 0, 553.6, 10.75, 4.94
FROM users WHERE uid = '6'
ON DUPLICATE KEY UPDATE
  total_score = 47.5,
  discretionary_score = 10,
  vegetables_score = 0.5,
  fruit_score = 0,
  grains_cereals_score = 2.5,
  wholegrains_score = 0,
  meat_alternatives_score = 6,
  dairy_alternatives_score = 1,
  water_score = 0,
  unsaturated_fat_score = 2.5,
  saturated_fat_score = 5,
  sodium_score = 5,
  sugar_score = 10,
  alcohol_score = 5,
  discretionary_serve_size = 0.93,
  vegetables_serve_size = 0.27,
  fruit_serve_size = 0,
  grains_cereals_serve_size = 3.89,
  wholegrains_serve_size = 0,
  meat_alternatives_serve_size = 1.93,
  dairy_alternatives_serve_size = 0.14,
  sodium_mg = 1633.5,
  alcohol_standard_drinks = 0,
  water_total_ml = 553.6,
  sugar_grams = 10.75,
  saturated_fat_grams = 4.94;

INSERT INTO heifa_assessments (user_id, total_score, discretionary_score, vegetables_score, fruit_score, grains_cereals_score, wholegrains_score, meat_alternatives_score, dairy_alternatives_score, water_score, unsaturated_fat_score, saturated_fat_score, sodium_score, sugar_score, alcohol_score, discretionary_serve_size, vegetables_serve_size, fruit_serve_size, grains_cereals_serve_size, wholegrains_serve_size, meat_alternatives_serve_size, dairy_alternatives_serve_size, sodium_mg, alcohol_standard_drinks, water_total_ml, sugar_grams, saturated_fat_grams)
SELECT id, 52.17, 10, 0, 1.25, 1.67, 1, 10, 2, 0, 1.25, 5, 10, 5, 5, 1.91, 0, 0.95, 2.65, 1.06, 4.53, 0.96, 441, 0, 107, 16.46, 9.78
FROM users WHERE uid = '17'
ON DUPLICATE KEY UPDATE
  total_score = 52.17,
  discretionary_score = 10,
  vegetables_score = 0,
  fruit_score = 1.25,
  grains_cereals_score = 1.67,
  wholegrains_score = 1,
  meat_alternatives_score = 10,
  dairy_alternatives_score = 2,
  water_score = 0,
  unsaturated_fat_score = 1.25,
  saturated_fat_score = 5,
  sodium_score = 10,
  sugar_score = 5,
  alcohol_score = 5,
  discretionary_serve_size = 1.91,
  vegetables_serve_size = 0,
  fruit_serve_size = 0.95,
  grains_cereals_serve_size = 2.65,
  wholegrains_serve_size = 1.06,
  meat_alternatives_serve_size = 4.53,
  dairy_alternatives_serve_size = 0.96,
  sodium_mg = 441,
  alcohol_standard_drinks = 0,
  water_total_ml = 107,
  sugar_grams = 16.46,
  saturated_fat_grams = 9.78;

INSERT INTO heifa_assessments (user_id, total_score, discretionary_score, vegetables_score, fruit_score, grains_cereals_score, wholegrains_score, meat_alternatives_score, dairy_alternatives_score, water_score, unsaturated_fat_score, saturated_fat_score, sodium_score, sugar_score, alcohol_score, discretionary_serve_size, vegetables_serve_size, fruit_serve_size, grains_cereals_serve_size, wholegrains_serve_size, meat_alternatives_serve_size, dairy_alternatives_serve_size, sodium_mg, alcohol_standard_drinks, water_total_ml, sugar_grams, saturated_fat_grams)
SELECT id, 59.25, 10, 1, 1.25, 2.5, 0, 8, 4, 0, 5, 2.5, 10, 10, 5, 0.69, 1.84, 0.94, 3.75, 0, 2.08, 1.09, 1454.44, 0, 373.98, 0.19, 10.96
FROM users WHERE uid = '24'
ON DUPLICATE KEY UPDATE
  total_score = 59.25,
  discretionary_score = 10,
  vegetables_score = 1,
  fruit_score = 1.25,
  grains_cereals_score = 2.5,
  wholegrains_score = 0,
  meat_alternatives_score = 8,
  dairy_alternatives_score = 4,
  water_score = 0,
  unsaturated_fat_score = 5,
  saturated_fat_score = 2.5,
  sodium_score = 10,
  sugar_score = 10,
  alcohol_score = 5,
  discretionary_serve_size = 0.69,
  vegetables_serve_size = 1.84,
  fruit_serve_size = 0.94,
  grains_cereals_serve_size = 3.75,
  wholegrains_serve_size = 0,
  meat_alternatives_serve_size = 2.08,
  dairy_alternatives_serve_size = 1.09,
  sodium_mg = 1454.44,
  alcohol_standard_drinks = 0,
  water_total_ml = 373.98,
  sugar_grams = 0.19,
  saturated_fat_grams = 10.96;

INSERT INTO heifa_assessments (user_id, total_score, discretionary_score, vegetables_score, fruit_score, grains_cereals_score, wholegrains_score, meat_alternatives_score, dairy_alternatives_score, water_score, unsaturated_fat_score, saturated_fat_score, sodium_score, sugar_score, alcohol_score, discretionary_serve_size, vegetables_serve_size, fruit_serve_size, grains_cereals_serve_size, wholegrains_serve_size, meat_alternatives_serve_size, dairy_alternatives_serve_size, sodium_mg, alcohol_standard_drinks, water_total_ml, sugar_grams, saturated_fat_grams)
SELECT id, 38, 2.5, 1, 0, 0, 0, 6, 6, 0, 2.5, 0, 5, 10, 5, 5.06, 1.26, 0, 0, 0, 2.09, 1.9, 2228.56, 0, 0, 11.91, 18.74
FROM users WHERE uid = '26'
ON DUPLICATE KEY UPDATE
  total_score = 38,
  discretionary_score = 2.5,
  vegetables_score = 1,
  fruit_score = 0,
  grains_cereals_score = 0,
  wholegrains_score = 0,
  meat_alternatives_score = 6,
  dairy_alternatives_score = 6,
  water_score = 0,
  unsaturated_fat_score = 2.5,
  saturated_fat_score = 0,
  sodium_score = 5,
  sugar_score = 10,
  alcohol_score = 5,
  discretionary_serve_size = 5.06,
  vegetables_serve_size = 1.26,
  fruit_serve_size = 0,
  grains_cereals_serve_size = 0,
  wholegrains_serve_size = 0,
  meat_alternatives_serve_size = 2.09,
  dairy_alternatives_serve_size = 1.9,
  sodium_mg = 2228.56,
  alcohol_standard_drinks = 0,
  water_total_ml = 0,
  sugar_grams = 11.91,
  saturated_fat_grams = 18.74;

INSERT INTO heifa_assessments (user_id, total_score, discretionary_score, vegetables_score, fruit_score, grains_cereals_score, wholegrains_score, meat_alternatives_score, dairy_alternatives_score, water_score, unsaturated_fat_score, saturated_fat_score, sodium_score, sugar_score, alcohol_score, discretionary_serve_size, vegetables_serve_size, fruit_serve_size, grains_cereals_serve_size, wholegrains_serve_size, meat_alternatives_serve_size, dairy_alternatives_serve_size, sodium_mg, alcohol_standard_drinks, water_total_ml, sugar_grams, saturated_fat_grams)
SELECT id, 54, 10, 5, 0, 0, 0, 10, 4, 0, 5, 0, 5, 10, 5, 2.25, 3, 0, 0, 0, 3.36, 1.43, 1966.06, 0, 488.5, 0.38, 18.92
FROM users WHERE uid = '28'
ON DUPLICATE KEY UPDATE
  total_score = 54,
  discretionary_score = 10,
  vegetables_score = 5,
  fruit_score = 0,
  grains_cereals_score = 0,
  wholegrains_score = 0,
  meat_alternatives_score = 10,
  dairy_alternatives_score = 4,
  water_score = 0,
  unsaturated_fat_score = 5,
  saturated_fat_score = 0,
  sodium_score = 5,
  sugar_score = 10,
  alcohol_score = 5,
  discretionary_serve_size = 2.25,
  vegetables_serve_size = 3,
  fruit_serve_size = 0,
  grains_cereals_serve_size = 0,
  wholegrains_serve_size = 0,
  meat_alternatives_serve_size = 3.36,
  dairy_alternatives_serve_size = 1.43,
  sodium_mg = 1966.06,
  alcohol_standard_drinks = 0,
  water_total_ml = 488.5,
  sugar_grams = 0.38,
  saturated_fat_grams = 18.92;
