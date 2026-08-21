-- GENERATED FILE - do not edit by hand.
-- Produced by scripts/import-heifa.ts from db/source/data.csv.
-- Regenerate with: npm run heifa:import
INSERT INTO users (uid, username, sex, phone_number) VALUES
  ('4', 'User 4', 'male', '61436567330')
ON DUPLICATE KEY UPDATE
  username = 'User 4',
  sex = 'male',
  phone_number = '61436567330';

INSERT INTO users (uid, username, sex, phone_number) VALUES
  ('1', 'User 1', 'female', '61436567331')
ON DUPLICATE KEY UPDATE
  username = 'User 1',
  sex = 'female',
  phone_number = '61436567331';

INSERT INTO users (uid, username, sex, phone_number) VALUES
  ('2', 'User 2', 'female', '61436567332')
ON DUPLICATE KEY UPDATE
  username = 'User 2',
  sex = 'female',
  phone_number = '61436567332';

INSERT INTO users (uid, username, sex, phone_number) VALUES
  ('5', 'User 5', 'male', '61436567333')
ON DUPLICATE KEY UPDATE
  username = 'User 5',
  sex = 'male',
  phone_number = '61436567333';

INSERT INTO users (uid, username, sex, phone_number) VALUES
  ('6', 'User 6', 'female', '61436567334')
ON DUPLICATE KEY UPDATE
  username = 'User 6',
  sex = 'female',
  phone_number = '61436567334';

INSERT INTO users (uid, username, sex, phone_number) VALUES
  ('17', 'User 17', 'male', '61436567335')
ON DUPLICATE KEY UPDATE
  username = 'User 17',
  sex = 'male',
  phone_number = '61436567335';

INSERT INTO users (uid, username, sex, phone_number) VALUES
  ('24', 'User 24', 'female', '61436567336')
ON DUPLICATE KEY UPDATE
  username = 'User 24',
  sex = 'female',
  phone_number = '61436567336';

INSERT INTO users (uid, username, sex, phone_number) VALUES
  ('26', 'User 26', 'male', '61436567337')
ON DUPLICATE KEY UPDATE
  username = 'User 26',
  sex = 'male',
  phone_number = '61436567337';

INSERT INTO users (uid, username, sex, phone_number) VALUES
  ('28', 'User 28', 'female', '61433327331')
ON DUPLICATE KEY UPDATE
  username = 'User 28',
  sex = 'female',
  phone_number = '61433327331';
