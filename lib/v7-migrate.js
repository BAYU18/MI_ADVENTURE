// lib/v7-migrate.js — DDL migrasi Fitur v7: Pertemanan & Duel (aditif & idempoten)
'use strict';

const V7_DDL = `
CREATE TABLE IF NOT EXISTS player_presence (
  player_id INTEGER PRIMARY KEY,
  last_seen_at TEXT NOT NULL,
  activity TEXT NOT NULL DEFAULT 'idle'
);

CREATE TABLE IF NOT EXISTS friend_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_player_id INTEGER NOT NULL,
  to_player_id   INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL,
  responded_at TEXT,
  UNIQUE(from_player_id, to_player_id)
);

CREATE TABLE IF NOT EXISTS friendships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(player_id, friend_id)
);

CREATE TABLE IF NOT EXISTS duels (
  id TEXT PRIMARY KEY,
  subject_id INTEGER NOT NULL,
  challenger_id INTEGER NOT NULL,
  challenged_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  phase  TEXT NOT NULL DEFAULT 'NORMAL',
  max_hp INTEGER NOT NULL DEFAULT 100,
  hp_challenger INTEGER NOT NULL DEFAULT 100,
  hp_challenged INTEGER NOT NULL DEFAULT 100,
  shield_challenger INTEGER NOT NULL DEFAULT 0,
  shield_challenged INTEGER NOT NULL DEFAULT 0,
  energy_challenger INTEGER NOT NULL DEFAULT 2,
  energy_challenged INTEGER NOT NULL DEFAULT 2,
  energy_max_challenger INTEGER NOT NULL DEFAULT 5,
  energy_max_challenged INTEGER NOT NULL DEFAULT 5,
  correct_challenger INTEGER NOT NULL DEFAULT 0,
  correct_challenged INTEGER NOT NULL DEFAULT 0,
  wrong_challenger INTEGER NOT NULL DEFAULT 0,
  wrong_challenged INTEGER NOT NULL DEFAULT 0,
  last_seen_challenger TEXT,
  last_seen_challenged TEXT,
  normal_ends_at TEXT,
  question_deadline_at TEXT,
  winner_id INTEGER,
  end_reason TEXT,
  created_at TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS duel_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  duel_id TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  option_order_challenger_json TEXT NOT NULL,
  option_order_challenged_json TEXT NOT NULL,
  eliminated_challenger_json TEXT DEFAULT '[]',
  eliminated_challenged_json TEXT DEFAULT '[]',
  UNIQUE(duel_id, order_index)
);

CREATE TABLE IF NOT EXISTS duel_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  duel_id TEXT NOT NULL,
  player_id INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  chosen_index INTEGER,
  is_correct INTEGER NOT NULL,
  damage_dealt INTEGER NOT NULL DEFAULT 0,
  damage_taken INTEGER NOT NULL DEFAULT 0,
  answered_at TEXT NOT NULL,
  elapsed_ms INTEGER,
  UNIQUE(duel_id, player_id, order_index)
);

CREATE TABLE IF NOT EXISTS duel_skill_uses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  duel_id TEXT NOT NULL,
  player_id INTEGER NOT NULL,
  skill_id TEXT NOT NULL,
  uses INTEGER NOT NULL DEFAULT 0,
  UNIQUE(duel_id, player_id, skill_id)
);

CREATE TABLE IF NOT EXISTS duel_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  duel_id TEXT NOT NULL,
  ts TEXT NOT NULL,
  type TEXT NOT NULL,
  payload_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_duel_events_duel ON duel_events(duel_id, ts);
CREATE INDEX IF NOT EXISTS idx_duels_status ON duels(status, phase);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests(to_player_id, status);
`;

function v7Migrate(db) {
  db.exec(V7_DDL);
}

module.exports = { v7Migrate, V7_DDL };
