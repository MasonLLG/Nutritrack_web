-- Sample food-log records for the MVP's implicit user (uid '1').
--
-- Dates are relative to CURDATE() rather than hard-coded, so the seven-day
-- dashboard always has data no matter when the seed is run.
--
-- Deliberately leaves day -3 empty to exercise empty-day filling in the
-- analytics service, and includes entries at 00:10 and 23:45 to exercise the
-- day-boundary handling that `consumed_on` exists to get right.
--
-- Idempotency: this file first removes the seeded user's existing records, so
-- re-running produces the same state. `npm run db:seed` is a development
-- operation and will discard records added by hand for that user.

DELETE FROM nutrition_records
WHERE user_id = (SELECT id FROM users WHERE uid = '1');

INSERT INTO nutrition_records
  (user_id, food_name, heifa_category, serving_qty, serving_unit,
   calories, protein_g, carbs_g, fat_g, sugar_g,
   source, fruityvice_id, consumed_at, consumed_on)
SELECT u.id, d.food_name, d.heifa_category, d.serving_qty, d.serving_unit,
       d.calories, d.protein_g, d.carbs_g, d.fat_g, d.sugar_g,
       d.source, d.fruityvice_id,
       TIMESTAMP(CURDATE() - INTERVAL d.days_ago DAY, d.time_of_day),
       CURDATE() - INTERVAL d.days_ago DAY
FROM users u
JOIN (
  -- days_ago, food_name, category, qty, unit, kcal, protein, carbs, fat, sugar, source, fv_id, time
  SELECT 6 AS days_ago, 'Porridge with milk' AS food_name, 'grainsAndCereals' AS heifa_category, 1 AS serving_qty, 'bowl' AS serving_unit, 220 AS calories, 8.0 AS protein_g, 34.0 AS carbs_g, 5.0 AS fat_g, 9.0 AS sugar_g, 'manual' AS source, NULL AS fruityvice_id, '08:15:00' AS time_of_day
  UNION ALL SELECT 6, 'Banana',            'fruit',                1, 'medium', 89,  1.1, 22.8, 0.3, 17.2, 'fruityvice', 1,  '10:30:00'
  UNION ALL SELECT 6, 'Chicken salad',     'meatAndAlternatives',  1, 'plate',  380, 32.0, 12.0, 22.0, 4.0, 'manual', NULL, '13:00:00'
  UNION ALL SELECT 6, 'Water',             'water',                3, 'glass',  0,   0.0,  0.0,  0.0, 0.0, 'manual', NULL, '18:00:00'

  UNION ALL SELECT 5, 'Greek yoghurt',     'dairyAndAlternatives', 1, 'cup',    150, 15.0, 11.0, 5.0, 10.0, 'manual', NULL, '08:00:00'
  UNION ALL SELECT 5, 'Apple',             'fruit',                2, 'medium', 104, 0.6, 27.6, 0.3, 20.8, 'fruityvice', 6,  '11:00:00'
  UNION ALL SELECT 5, 'Wholegrain sandwich','wholegrains',         1, 'serve',  340, 18.0, 42.0, 11.0, 6.0, 'manual', NULL, '12:45:00'

  UNION ALL SELECT 4, 'Scrambled eggs',    'meatAndAlternatives',  2, 'egg',    182, 12.6, 1.4, 13.6, 1.0, 'manual', NULL, '07:50:00'
  UNION ALL SELECT 4, 'Orange',            'fruit',                1, 'medium', 47,  0.9, 11.8, 0.1, 9.4, 'fruityvice', 2,  '15:20:00'
  UNION ALL SELECT 4, 'Steamed broccoli',  'vegetables',           1, 'cup',    55,  3.7, 11.2, 0.6, 2.2, 'manual', NULL, '19:10:00'
  UNION ALL SELECT 4, 'Herbal tea',        'water',                1, 'cup',    2,   0.0, 0.4, 0.0, 0.0, 'manual', NULL, '23:45:00'

  -- day -3 intentionally omitted: the chart must still render it as a zero day.

  UNION ALL SELECT 2, 'Overnight oats',    'grainsAndCereals',     1, 'jar',    290, 10.0, 45.0, 8.0, 12.0, 'manual', NULL, '00:10:00'
  UNION ALL SELECT 2, 'Strawberries',      'fruit',                1, 'cup',    49,  1.0, 11.7, 0.5, 7.4, 'fruityvice', 3,  '14:00:00'
  UNION ALL SELECT 2, 'Grilled salmon',    'meatAndAlternatives',  1, 'fillet', 367, 39.0, 0.0, 22.0, 0.0, 'manual', NULL, '19:30:00'

  UNION ALL SELECT 1, 'Muesli',            'grainsAndCereals',     1, 'bowl',   310, 9.0, 52.0, 7.0, 14.0, 'manual', NULL, '08:30:00'
  UNION ALL SELECT 1, 'Mixed nuts',        'unsaturatedFat',       30, 'g',     180, 5.0, 6.0, 16.0, 1.5, 'manual', NULL, '10:45:00'
  UNION ALL SELECT 1, 'Pumpkin soup',      'vegetables',           1, 'bowl',   180, 4.0, 24.0, 7.0, 9.0, 'manual', NULL, '12:30:00'
  UNION ALL SELECT 1, 'Dark chocolate',    'discretionary',        20, 'g',     120, 1.5, 12.0, 8.0, 9.0, 'manual', NULL, '21:00:00'

  UNION ALL SELECT 0, 'Wholemeal toast',   'wholegrains',          2, 'slice',  160, 6.0, 28.0, 2.4, 3.0, 'manual', NULL, '07:40:00'
  UNION ALL SELECT 0, 'Mango',             'fruit',                1, 'cup',    99,  1.4, 24.7, 0.6, 22.5, 'fruityvice', 27, '10:00:00'
  UNION ALL SELECT 0, 'Lentil curry',      'meatAndAlternatives',  1, 'bowl',   330, 18.0, 48.0, 7.0, 5.0, 'manual', NULL, '13:15:00'
) AS d
WHERE u.uid = '1';
