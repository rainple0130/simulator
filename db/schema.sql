CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('student','teacher')),
  display_name  TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS scenarios (
  id              TEXT PRIMARY KEY,
  category        TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  difficulty      TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  is_active       INTEGER NOT NULL DEFAULT 1,
  available_modes TEXT NOT NULL DEFAULT 'guided,practice,exam',
  pass_score      INTEGER NOT NULL DEFAULT 70,
  excellent_score INTEGER NOT NULL DEFAULT 90,
  max_errors      INTEGER,
  time_limit_s    INTEGER,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_scenarios_category ON scenarios(category);

CREATE TABLE IF NOT EXISTS attempts (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id  TEXT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','abandoned')),
  mode         TEXT NOT NULL DEFAULT 'practice' CHECK (mode IN ('guided','practice','exam')),
  score        INTEGER,
  metrics_json TEXT,
  started_at   TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_scenario ON attempts(scenario_id);

CREATE TABLE IF NOT EXISTS attempt_events (
  id           TEXT PRIMARY KEY,
  attempt_id   TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  seq          INTEGER NOT NULL,
  t_offset_s   INTEGER NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('step','error','hint')),
  label        TEXT NOT NULL,
  points       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_attempt_events_attempt ON attempt_events(attempt_id);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id          TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  sound_enabled    INTEGER NOT NULL DEFAULT 1,
  hints_enabled    INTEGER NOT NULL DEFAULT 1,
  vr_dominant_hand TEXT NOT NULL DEFAULT 'right' CHECK (vr_dominant_hand IN ('left','right')),
  vr_haptics       TEXT NOT NULL DEFAULT 'medium' CHECK (vr_haptics IN ('off','low','medium','high')),
  vr_turn_mode     TEXT NOT NULL DEFAULT 'snap' CHECK (vr_turn_mode IN ('snap','smooth')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
