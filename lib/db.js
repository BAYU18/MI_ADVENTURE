'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const { MONSTERS, THEMES, renderMonster, renderMonsterSvg } = require('../shared/monsters');
const {
  ECONOMY,
  ITEMS,
  SKILLS,
  SKILL_MAX_LEVEL,
  SKILL_BASE_UPGRADE,
  SKILL_MULTIPLIERS,
  getSkillUpgradeCost,
  BOSS_MOVES,
  SET_BONUSES,
  calculatePassives
} = require('../shared/economy');

const {
  parseNumberId,
  normalizeText,
  gradeShort,
  gradeOrdering,
  gradeMatching,
  afterAnswer,
  updatePace,
  bossDamage,
  bossPhase,
  validateQuestionData
} = require('../shared/grading');

const {
  TYPE_MIX,
  TYPE_TIME_SEC,
  BONUS,
  MYSTERY,
  BOSS_PHASES,
  WEAK,
  EVENTS,
  SPACED,
  PACE,
  CAMPAIGN,
  SKILLBAR,
  SKILL_REASON_TEXT
} = require('../shared/gameplay');
const { STORY } = require('../shared/story');
const { CAMPAIGN: CAMPAIGN_CFG, parseNodeKey, buildCampaign } = require('../shared/campaign');
const reports = require('./reports');
const Progression = require('../shared/progression');
const BossFx = require('./bossfx');
const BossSkills = require('../shared/bossskills');
const { v7Migrate, V7_DDL } = require('./v7-migrate');

const SKILL_UPGRADE_COSTS = SKILL_BASE_UPGRADE || { 1: 100, 2: 250, 3: 500, 4: 900 };

const DB_PATH = process.env.PLAY_DB_PATH || path.join(__dirname, '..', 'data', 'play.db');
const SEED_DIR = path.join(__dirname, '..', 'seed');

/* ── game constants ── */
const GAME = {
  playerMaxHp: 100,
  graceMs: 1500,
  bossHpFactor: 0.9,
  baseBossDamage: 10,
  speed: {
    critical: { maxRatio: 0.30, bossDamage: 13, playerDamage: 0 },
    normal:   { maxRatio: 0.70, bossDamage: 10, playerDamage: 0 },
    slow:     { maxRatio: 1.00, bossDamage: 7,  playerDamage: 5 },
  },
  wrongPlayerDamage: 20,
  timeoutPlayerDamage: 15,
  combo: [
    { minStreak: 5, bonus: 4 },
    { minStreak: 3, bonus: 2 },
  ],
  healEveryStreak: 5,
  healAmount: 10,
  stars: { three: 0.70, two: 0.40 },
  xp: { correct: 10, critical: 5, winPerStar: 20 },
  levelFormula(xp) { return Math.floor(Math.sqrt((xp || 0) / 50)) + 1; },
  xpForNext(level) { return (level || 1) * (level || 1) * 50; },
};

/* ── helpers ── */
function questionHash(text) {
  return crypto.createHash('sha1')
    .update(String(text || '').toLowerCase().trim().replace(/\s+/g, ' '))
    .digest('hex');
}

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(pw, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const check = crypto.scryptSync(pw, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
}

function uuid() { return crypto.randomUUID(); }

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── schema ── */
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS classes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id        INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    icon            TEXT NOT NULL DEFAULT '📚',
    color           TEXT NOT NULL DEFAULT '#888',
    monster_theme   TEXT,
    question_count  INTEGER NOT NULL DEFAULT 10,
    time_limit_sec  INTEGER NOT NULL DEFAULT 20,
    is_active       INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN(0,1)),
    UNIQUE(class_id, name)
  );

  CREATE TABLE IF NOT EXISTS questions (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id         INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    text               TEXT NOT NULL,
    options_json       TEXT NOT NULL,
    answer_index       INTEGER NOT NULL CHECK(answer_index >= 0),
    explanation        TEXT NOT NULL DEFAULT '',
    difficulty         INTEGER NOT NULL DEFAULT 1 CHECK(difficulty >= 1),
    eff_difficulty     INTEGER NOT NULL DEFAULT 1,
    time_limit_sec     INTEGER,
    image_url          TEXT,
    image_alt          TEXT,
    audio_url          TEXT,
    option_images_json TEXT,
    tts                INTEGER NOT NULL DEFAULT 0 CHECK(tts IN(0,1)),
    attempts           INTEGER NOT NULL DEFAULT 0,
    corrects           INTEGER NOT NULL DEFAULT 0,
    hash               TEXT NOT NULL,
    is_active          INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN(0,1)),
    created_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    UNIQUE(subject_id, hash)
  );

  CREATE TABLE IF NOT EXISTS monsters (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    theme       TEXT NOT NULL,
    visual_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS players (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    nick               TEXT NOT NULL,
    nick_lower         TEXT NOT NULL UNIQUE,
    password_hash      TEXT NOT NULL,
    xp                 INTEGER NOT NULL DEFAULT 0 CHECK(xp >= 0),
    class_id           INTEGER REFERENCES classes(id),
    coins              INTEGER NOT NULL DEFAULT 0,
    pity_counter       INTEGER NOT NULL DEFAULT 0,
    avatar_json        TEXT NOT NULL DEFAULT '{}',
    title              TEXT NOT NULL DEFAULT 'Pelajar Pemula',
    day_streak         INTEGER NOT NULL DEFAULT 1,
    last_active_date   TEXT,
    practice_xp_today  INTEGER NOT NULL DEFAULT 0,
    coins_earned_today INTEGER NOT NULL DEFAULT 0,
    created_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    last_login_at      TEXT
  );

  CREATE TABLE IF NOT EXISTS player_classes (
    player_id   INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    class_id    INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    assigned_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    PRIMARY KEY (player_id, class_id)
  );

  CREATE TABLE IF NOT EXISTS admins (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS game_sessions (
    id                TEXT PRIMARY KEY,
    player_id         INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    subject_id        INTEGER NOT NULL REFERENCES subjects(id),
    monster_id        INTEGER,
    mode              TEXT NOT NULL DEFAULT 'BATTLE' CHECK(mode IN('BATTLE','PRACTICE','FUN')),
    focus             TEXT DEFAULT 'RANDOM',
    timer_mode        TEXT DEFAULT 'NORMAL',
    status            TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK(status IN('IN_PROGRESS','WON','LOST','ABANDONED')),
    end_reason        TEXT,
    total_questions   INTEGER NOT NULL,
    current_index     INTEGER NOT NULL DEFAULT 0,
    boss_max_hp       INTEGER NOT NULL,
    boss_hp           INTEGER NOT NULL,
    player_max_hp     INTEGER NOT NULL DEFAULT 100,
    player_hp         INTEGER NOT NULL DEFAULT 100,
    streak            INTEGER NOT NULL DEFAULT 0,
    max_streak        INTEGER NOT NULL DEFAULT 0,
    correct_count     INTEGER NOT NULL DEFAULT 0,
    critical_count    INTEGER NOT NULL DEFAULT 0,
    stars             INTEGER NOT NULL DEFAULT 0,
    xp_earned         INTEGER NOT NULL DEFAULT 0,
    coins_earned      INTEGER NOT NULL DEFAULT 0,
    items_earned_json TEXT NOT NULL DEFAULT '[]',
    energy            INTEGER NOT NULL DEFAULT 1,
    loadout_json      TEXT NOT NULL DEFAULT '[]',
    uses_json         TEXT NOT NULL DEFAULT '{}',
    flags_json        TEXT NOT NULL DEFAULT '{}',
    started_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    finished_at       TEXT
  );

  CREATE TABLE IF NOT EXISTS session_questions (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id         TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    question_id        INTEGER NOT NULL REFERENCES questions(id),
    order_index        INTEGER NOT NULL,
    option_order       TEXT NOT NULL,
    timer_state        TEXT NOT NULL DEFAULT 'PENDING',
    ready_at           TEXT,
    served_at          TEXT,
    answered_at        TEXT,
    chosen_display     INTEGER,
    outcome            TEXT,
    elapsed_ms         INTEGER,
    extra_time_ms      INTEGER NOT NULL DEFAULT 0,
    power_mult         REAL NOT NULL DEFAULT 1.0,
    eliminated_json    TEXT NOT NULL DEFAULT '[]',
    second_chance      INTEGER NOT NULL DEFAULT 0,
    retry_used         INTEGER NOT NULL DEFAULT 0,
    hinted             INTEGER NOT NULL DEFAULT 0,
    UNIQUE(session_id, question_id),
    UNIQUE(session_id, order_index)
  );

  CREATE TABLE IF NOT EXISTS player_question_stats (
    player_id    INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    question_id  INTEGER NOT NULL REFERENCES questions(id),
    seen         INTEGER NOT NULL DEFAULT 0,
    correct      INTEGER NOT NULL DEFAULT 0,
    last_seen_at TEXT,
    PRIMARY KEY(player_id, question_id)
  );

  CREATE TABLE IF NOT EXISTS player_subject_progress (
    player_id       INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    subject_id      INTEGER NOT NULL REFERENCES subjects(id),
    sessions_played INTEGER NOT NULL DEFAULT 0,
    wins            INTEGER NOT NULL DEFAULT 0,
    best_stars      INTEGER NOT NULL DEFAULT 0,
    total_answered  INTEGER NOT NULL DEFAULT 0,
    total_correct   INTEGER NOT NULL DEFAULT 0,
    best_streak     INTEGER NOT NULL DEFAULT 0,
    last_played_at  TEXT,
    PRIMARY KEY(player_id, subject_id)
  );

  CREATE TABLE IF NOT EXISTS player_monsters (
    player_id   INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    monster_id  INTEGER NOT NULL REFERENCES monsters(id),
    encounters  INTEGER NOT NULL DEFAULT 0,
    defeats     INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0,
    best_stars  INTEGER NOT NULL DEFAULT 0,
    last_at     TEXT,
    PRIMARY KEY(player_id, monster_id)
  );

  CREATE TABLE IF NOT EXISTS coin_transactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id   INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    amount      INTEGER NOT NULL,
    delta       INTEGER,
    reason      TEXT NOT NULL,
    balance_aft INTEGER NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS player_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id  INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    item_id    TEXT NOT NULL,
    acquired_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    is_equipped INTEGER NOT NULL DEFAULT 0,
    UNIQUE(player_id, item_id)
  );

  CREATE TABLE IF NOT EXISTS player_skills (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id   INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    skill_id    TEXT NOT NULL,
    level       INTEGER NOT NULL DEFAULT 1,
    unlocked_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    UNIQUE(player_id, skill_id)
  );

  CREATE TABLE IF NOT EXISTS player_loadout (
    player_id INTEGER PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    slot_0    TEXT,
    slot_1    TEXT,
    slot_2    TEXT
  );

  CREATE TABLE IF NOT EXISTS player_duel_loadout (
    player_id INTEGER PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    slot_0    TEXT,
    slot_1    TEXT,
    slot_2    TEXT,
    slot_3    TEXT
  );

  CREATE TABLE IF NOT EXISTS player_duel_boss_loadout (
    player_id INTEGER PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    slot_0    INTEGER,
    slot_1    INTEGER,
    slot_2    INTEGER,
    slot_3    INTEGER,
    slot_4    INTEGER
  );

  CREATE TABLE IF NOT EXISTS drop_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id  INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    session_id TEXT REFERENCES game_sessions(id) ON DELETE SET NULL,
    item_id    TEXT NOT NULL,
    is_pity    INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS player_missions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id  INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    date_key   TEXT NOT NULL,
    mission_id TEXT NOT NULL,
    progress   INTEGER NOT NULL DEFAULT 0,
    target     INTEGER NOT NULL DEFAULT 1,
    is_claimed INTEGER NOT NULL DEFAULT 0,
    UNIQUE(player_id, date_key, mission_id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_q_subject ON questions(subject_id, is_active);
  CREATE INDEX IF NOT EXISTS idx_gs_player ON game_sessions(player_id, status);
  CREATE INDEX IF NOT EXISTS idx_sq_session ON session_questions(session_id, order_index);
  CREATE INDEX IF NOT EXISTS idx_pm_player ON player_monsters(player_id);
`;

/* ── schema migrations ── */
function runMigrations(db) {
  function ensureColumn(table, col, def) {
    const cols = db.prepare('PRAGMA table_info(' + table + ')').all().map(c => c.name);
    if (!cols.includes(col)) {
      try { db.exec('ALTER TABLE ' + table + ' ADD COLUMN ' + col + ' ' + def); } catch (e) {}
    }
  }
  ensureColumn('questions', 'eff_difficulty', 'INTEGER NOT NULL DEFAULT 1');
  ensureColumn('questions', 'attempts', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('questions', 'corrects', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('players', 'coins', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('players', 'pity_counter', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('players', 'avatar_json', "TEXT NOT NULL DEFAULT '{}'");
  ensureColumn('players', 'title', "TEXT NOT NULL DEFAULT 'Pelajar Pemula'");
  ensureColumn('players', 'day_streak', 'INTEGER NOT NULL DEFAULT 1');
  ensureColumn('players', 'last_active_date', 'TEXT');
  ensureColumn('players', 'practice_xp_today', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('players', 'coins_earned_today', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('game_sessions', 'mode', "TEXT NOT NULL DEFAULT 'BATTLE'");
  ensureColumn('game_sessions', 'focus', "TEXT DEFAULT 'RANDOM'");
  ensureColumn('game_sessions', 'timer_mode', "TEXT DEFAULT 'NORMAL'");
  ensureColumn('game_sessions', 'end_reason', "TEXT");
  ensureColumn('game_sessions', 'critical_count', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('game_sessions', 'coins_earned', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('game_sessions', 'items_earned_json', "TEXT NOT NULL DEFAULT '[]'");
  ensureColumn('game_sessions', 'energy', 'INTEGER NOT NULL DEFAULT 1');
  ensureColumn('game_sessions', 'loadout_json', "TEXT NOT NULL DEFAULT '[]'");
  ensureColumn('game_sessions', 'uses_json', "TEXT NOT NULL DEFAULT '{}'");
  ensureColumn('game_sessions', 'flags_json', "TEXT NOT NULL DEFAULT '{}'");
  ensureColumn('game_sessions', 'last_ping_at', "TEXT");
  ensureColumn('game_sessions', 'last_activity_at', "TEXT");
  ensureColumn('game_sessions', 'away_started_at', "TEXT");
  ensureColumn('game_sessions', 'is_away', "INTEGER NOT NULL DEFAULT 0");
  ensureColumn('game_sessions', 'reconnect_count', "INTEGER NOT NULL DEFAULT 0");
  ensureColumn('game_sessions', 'away_since', "TEXT");
  ensureColumn('game_sessions', 'away_penalized', "INTEGER NOT NULL DEFAULT 0");
  ensureColumn('game_sessions', 'reconnect_credits', "INTEGER NOT NULL DEFAULT 2");
  ensureColumn('game_sessions', 'client_instance_id', "TEXT");
  ensureColumn('game_sessions', 'auto_next', "INTEGER NOT NULL DEFAULT 1");
  ensureColumn('game_sessions', 'created_at', "TEXT");
  try {
    db.exec("UPDATE game_sessions SET created_at = started_at WHERE created_at IS NULL AND started_at IS NOT NULL");
  } catch (e) {}
  ensureColumn('session_questions', 'ready_at', 'TEXT');
  ensureColumn('session_questions', 'timer_state', "TEXT NOT NULL DEFAULT 'PENDING'");
  ensureColumn('session_questions', 'extra_time_ms', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('session_questions', 'power_mult', 'REAL NOT NULL DEFAULT 1.0');
  ensureColumn('session_questions', 'eliminated_json', "TEXT NOT NULL DEFAULT '[]'");
  ensureColumn('session_questions', 'second_chance', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('session_questions', 'retry_used', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('session_questions', 'hinted', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('session_questions', 'read_bonus_sec', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('session_questions', 'time_limit_sec', 'INTEGER');

  // v5.2 columns
  ensureColumn('questions', 'question_type', "TEXT NOT NULL DEFAULT 'MCQ'");
  ensureColumn('questions', 'type_data_json', "TEXT DEFAULT NULL");
  ensureColumn('questions', 'topic_tag', "TEXT DEFAULT NULL");

  ensureColumn('session_questions', 'is_review', "INTEGER NOT NULL DEFAULT 0");
  ensureColumn('session_questions', 'is_weak', "INTEGER NOT NULL DEFAULT 0");
  ensureColumn('session_questions', 'is_bonus', "INTEGER NOT NULL DEFAULT 0");
  ensureColumn('session_questions', 'is_mystery', "INTEGER NOT NULL DEFAULT 0");
  ensureColumn('session_questions', 'display_json', "TEXT DEFAULT NULL");
  ensureColumn('session_questions', 'reveal_json', "TEXT DEFAULT NULL");
  ensureColumn('session_questions', 'bonus_roll', "TEXT DEFAULT NULL");

  ensureColumn('game_sessions', 'boss_phase', "INTEGER NOT NULL DEFAULT 1");
  ensureColumn('game_sessions', 'weak_topic', "TEXT DEFAULT NULL");
  ensureColumn('game_sessions', 'pending_event_json', "TEXT DEFAULT NULL");
  ensureColumn('game_sessions', 'campaign_node', "TEXT DEFAULT NULL");
  ensureColumn('game_sessions', 'pace_used', "REAL NOT NULL DEFAULT 1.0");

  ensureColumn('player_question_stats', 'box', "INTEGER NOT NULL DEFAULT 0");
  ensureColumn('player_question_stats', 'lapses', "INTEGER NOT NULL DEFAULT 0");
  ensureColumn('player_question_stats', 'due_at', "TEXT DEFAULT NULL");
  ensureColumn('player_question_stats', 'mastered', "INTEGER NOT NULL DEFAULT 0");

  ensureColumn('player_subject_progress', 'pace_factor', "REAL NOT NULL DEFAULT 1.0");

  ensureColumn('players', 'settings_json', "TEXT DEFAULT NULL");

  ensureColumn('subjects', 'grade', "INTEGER NOT NULL DEFAULT 4");

  // Ensure tables for skills, loadout, and idempotency
  db.exec(`
    CREATE TABLE IF NOT EXISTS player_classes (
      player_id   INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      class_id    INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      assigned_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      PRIMARY KEY (player_id, class_id)
    );

    CREATE TABLE IF NOT EXISTS player_skills (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id   INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      skill_id    TEXT NOT NULL,
      level       INTEGER NOT NULL DEFAULT 1,
      unlocked_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      UNIQUE(player_id, skill_id)
    );
    CREATE TABLE IF NOT EXISTS player_loadout (
      player_id INTEGER PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
      slot_0    TEXT,
      slot_1    TEXT,
      slot_2    TEXT,
      slot_3    TEXT
    );
    CREATE TABLE IF NOT EXISTS player_duel_loadout (
      player_id INTEGER PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
      slot_0    TEXT,
      slot_1    TEXT,
      slot_2    TEXT,
      slot_3    TEXT
    );
    CREATE TABLE IF NOT EXISTS player_duel_boss_loadout (
      player_id INTEGER PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
      slot_0    INTEGER,
      slot_1    INTEGER,
      slot_2    INTEGER,
      slot_3    INTEGER,
      slot_4    INTEGER
    );
    CREATE TABLE IF NOT EXISTS idempotency_keys (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id       INTEGER NOT NULL,
      idempotency_key TEXT NOT NULL,
      endpoint        TEXT NOT NULL,
      status_code     INTEGER NOT NULL,
      response_json   TEXT NOT NULL,
      created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      UNIQUE(player_id, idempotency_key)
    );

    CREATE TABLE IF NOT EXISTS player_campaign_nodes (
      player_id     INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      node_key      TEXT NOT NULL,
      stars         INTEGER NOT NULL DEFAULT 0,
      best_accuracy REAL NOT NULL DEFAULT 0,
      cleared_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      PRIMARY KEY (player_id, node_key)
    );

    CREATE TABLE IF NOT EXISTS weekly_reports (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id   INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      week_key    TEXT NOT NULL,
      report_json TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      UNIQUE(player_id, week_key)
    );

    CREATE TABLE IF NOT EXISTS report_shares (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id   INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      token_hash  TEXT NOT NULL UNIQUE,
      expires_at  TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    CREATE TABLE IF NOT EXISTS class_raids (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id    INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      boss_name   TEXT NOT NULL,
      max_hp      INTEGER NOT NULL,
      current_hp  INTEGER NOT NULL,
      starts_at   TEXT NOT NULL,
      ends_at     TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'ACTIVE'
    );

    CREATE TABLE IF NOT EXISTS class_raid_damages (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      raid_id     INTEGER NOT NULL REFERENCES class_raids(id) ON DELETE CASCADE,
      player_id   INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      damage      INTEGER NOT NULL,
      session_id  TEXT,
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    CREATE INDEX IF NOT EXISTS idx_session_questions_session ON session_questions(session_id);
    CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);
    CREATE INDEX IF NOT EXISTS idx_player_question_stats_due ON player_question_stats(player_id, due_at);
  `);
  ensureColumn('player_loadout', 'slot_3', "TEXT");
  ensureColumn('player_duel_loadout', 'slot_3', "TEXT");
  ensureColumn('duel_skill_uses', 'active', "INTEGER NOT NULL DEFAULT 0");

  try {
    db.exec(`
      INSERT OR IGNORE INTO player_classes (player_id, class_id)
      SELECT id, class_id FROM players WHERE class_id IS NOT NULL;
    `);
  } catch (e) {}

  // Seed starter items & skills for all existing players
  const players = db.prepare('SELECT id FROM players').all();
  for (const p of players) {
    for (const item of ['hat_explorer', 'outfit_vest', 'bg_meadow']) {
      db.prepare(`
        INSERT INTO player_items(player_id, item_id, is_equipped)
        VALUES(?, ?, 1)
        ON CONFLICT DO NOTHING
      `).run(p.id, item);
    }
    for (const sk of ['eliminate_one', 'eagle_eye', 'heal']) {
      db.prepare(`
        INSERT INTO player_skills(player_id, skill_id, level)
        VALUES(?, ?, 1)
        ON CONFLICT(player_id, skill_id) DO NOTHING
      `).run(p.id, sk);
    }
    db.prepare(`
      INSERT INTO player_loadout(player_id, slot_0, slot_1, slot_2)
      VALUES(?, 'eliminate_one', 'eagle_eye', 'heal')
      ON CONFLICT(player_id) DO UPDATE SET
        slot_0 = CASE WHEN slot_0 IS NULL OR slot_0 = 'eagle_eye' THEN 'eliminate_one' ELSE slot_0 END,
        slot_1 = CASE WHEN slot_1 IS NULL OR slot_1 = 'heal' THEN 'eagle_eye' ELSE slot_1 END,
        slot_2 = CASE WHEN slot_2 IS NULL THEN 'heal' ELSE slot_2 END
    `).run(p.id);
  }

  // v6 migrations
  ensureColumn('game_sessions', 'boss_tier', 'TEXT');
  ensureColumn('game_sessions', 'boss_hits_needed', 'INTEGER');
  ensureColumn('game_sessions', 'boss_hit_unit', 'INTEGER');
  ensureColumn('game_sessions', 'monster_damage', 'INTEGER');
  ensureColumn('game_sessions', 'max_questions', 'INTEGER');
  ensureColumn('game_sessions', 'correct_count', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('game_sessions', 'wrong_streak', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('game_sessions', 'fatigue_applied', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('game_sessions', 'energy_max', 'INTEGER');
  ensureColumn('player_skills', 'level', 'INTEGER NOT NULL DEFAULT 1');

  // v7: Skill Boss per Elemen, Mode Brutal
  ensureColumn('game_sessions', 'boss_element', 'TEXT');
  ensureColumn('game_sessions', 'brutal', 'INTEGER NOT NULL DEFAULT 0');
  ensureColumn('game_sessions', 'boss_fx_json', 'TEXT');

  // Fitur v7: Pertemanan & Duel
  v7Migrate(db);
}

/* ── seed database ── */
function seedDatabase(db) {
  db = db || getDb();
  // Seed classes
  const classes = [
    { name: 'Kelas 1', sort_order: 1 },
    { name: 'Kelas 2', sort_order: 2 },
    { name: 'Kelas 3', sort_order: 3 },
    { name: 'Kelas 4', sort_order: 4 },
    { name: 'Kelas 5', sort_order: 5 },
    { name: 'Kelas 6', sort_order: 6 },
  ];
  for (const c of classes) {
    db.prepare('INSERT INTO classes(name, sort_order) VALUES(?, ?) ON CONFLICT(name) DO UPDATE SET sort_order=excluded.sort_order').run(c.name, c.sort_order);
  }

  // Seed default admin (admin:jabar2020)
  const existingAdmin = db.prepare('SELECT id FROM admins WHERE username=?').get('admin');
  if (!existingAdmin) {
    const pwHash = hashPassword('jabar2020');
    db.prepare('INSERT INTO admins(username, password_hash) VALUES(?, ?)').run('admin', pwHash);
  } else {
    // Pastikan password admin terupdate ke jabar2020
    try {
      db.prepare('UPDATE admins SET password_hash=? WHERE username=?').run(hashPassword('jabar2020'), 'admin');
    } catch (e) {}
  }

  // Seed monsters
  for (const m of MONSTERS) {
    db.prepare('INSERT INTO monsters(id, name, theme, visual_json) VALUES(?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, theme=excluded.theme, visual_json=excluded.visual_json')
      .run(m.id, m.name, m.theme, JSON.stringify(m));
  }

  // Load question seeds from seed/ directory if questions table is empty
  const qCount = db.prepare('SELECT count(*) as count FROM questions').get().count;
  if (qCount === 0 && fs.existsSync(SEED_DIR)) {
    const files = fs.readdirSync(SEED_DIR).filter(f => f.endsWith('.json'));
    for (const f of files) {
      try {
        const full = path.join(SEED_DIR, f);
        const data = JSON.parse(fs.readFileSync(full, 'utf8'));
        if (data.class && data.subject && Array.isArray(data.questions)) {
          const cls = db.prepare('SELECT id FROM classes WHERE name=?').get(data.class);
          if (!cls) continue;
          db.prepare('INSERT INTO subjects(class_id, name, icon, color, monster_theme) VALUES(?,?,?,?,?) ON CONFLICT(class_id, name) DO NOTHING')
            .run(cls.id, data.subject, data.icon || '📚', data.color || '#3A7BD5', data.monsterTheme || 'hutan');
          const sub = db.prepare('SELECT id FROM subjects WHERE class_id=? AND name=?').get(cls.id, data.subject);
          if (!sub) continue;

          for (const q of data.questions) {
            const h = questionHash(q.text);
            db.prepare(`
              INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, eff_difficulty, hash, is_active)
              VALUES(?, ?, ?, ?, ?, ?, ?, ?, 1)
              ON CONFLICT(subject_id, hash) DO NOTHING
            `).run(sub.id, q.text, JSON.stringify(q.options), q.answerIndex, q.explanation || '', q.difficulty || 1, q.difficulty || 1, h);
          }
        }
      } catch (err) {}
    }
  }
}

/* ── database instance singleton ── */
let _db = null;
function createDatabase(dbPath) {
  const p = dbPath || DB_PATH;
  if (p !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(p)), { recursive: true });
  const db = new DatabaseSync(p);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
  db.exec(SCHEMA);
  runMigrations(db);
  seedDatabase(db);
  return db;
}

function getDb() {
  if (!_db) _db = createDatabase();
  return _db;
}

/* ── Coin Transaction Ledger Helper ── */
function applyCoins(dbOrPlayerId, playerIdOrDelta, deltaOrReason, reasonOrRefId = null, maybeRefId = null) {
  let db;
  let playerId;
  let delta;
  let reason;
  let refId;

  if (dbOrPlayerId && typeof dbOrPlayerId.prepare === 'function') {
    db = dbOrPlayerId;
    playerId = playerIdOrDelta;
    delta = deltaOrReason;
    reason = reasonOrRefId;
    refId = maybeRefId;
  } else {
    db = getDb();
    playerId = dbOrPlayerId;
    delta = playerIdOrDelta;
    reason = deltaOrReason;
    refId = reasonOrRefId;
  }

  if (delta === 0) {
    const row = db.prepare('SELECT coins FROM players WHERE id=?').get(playerId);
    return row ? row.coins : 0;
  }
  const info = db.prepare('UPDATE players SET coins = coins + ? WHERE id=? AND coins + ? >= 0').run(delta, playerId, delta);
  if (info.changes === 0) {
    const err = new Error('INSUFFICIENT_COINS');
    err.code = 'INSUFFICIENT_COINS';
    throw err;
  }
  const row = db.prepare('SELECT coins FROM players WHERE id=?').get(playerId);
  const balanceAft = row ? row.coins : 0;
  db.prepare('INSERT INTO coin_transactions(player_id, amount, delta, reason, balance_aft) VALUES(?,?,?,?,?)')
    .run(playerId, delta, delta, reason, balanceAft);
  return balanceAft;
}

/* ── Auth Player ── */
function registerPlayer(nick, password, classId) {
  const db = getDb();
  const trimmed = String(nick || '').trim();
  if (trimmed.length < 3 || trimmed.length > 32) {
    const err = new Error('Nick harus 3-32 karakter');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    const err = new Error('Nick hanya boleh huruf, angka, dan garis bawah');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  if (!password || password.length < 4) {
    const err = new Error('Password minimal 4 karakter');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const reserved = ['admin', 'root', 'system', 'moderator', 'guru', 'petualang'];
  const lower = trimmed.toLowerCase();
  if (reserved.includes(lower)) {
    const err = new Error('Nick tidak diizinkan');
    err.code = 'NICK_NOT_ALLOWED';
    throw err;
  }

  const existing = db.prepare('SELECT id FROM players WHERE nick_lower=?').get(lower);
  if (existing) {
    const err = new Error('Nick sudah digunakan');
    err.code = 'NICK_TAKEN';
    throw err;
  }

  const pwHash = hashPassword(password);
  let player = null;
  db.exec('BEGIN IMMEDIATE');
  try {
    let resolvedClassId = parseInt(classId, 10);
    if (Number.isInteger(resolvedClassId) && resolvedClassId > 0) {
      const check = db.prepare('SELECT id FROM classes WHERE id=?').get(resolvedClassId);
      if (!check) resolvedClassId = null;
    } else {
      resolvedClassId = null;
    }
    if (!resolvedClassId && typeof classId === 'string' && classId.trim()) {
      const checkName = db.prepare('SELECT id FROM classes WHERE LOWER(name)=LOWER(?)').get(classId.trim());
      if (checkName) resolvedClassId = checkName.id;
    }
    if (!resolvedClassId) {
      const defClass = db.prepare('SELECT id FROM classes ORDER BY sort_order, id LIMIT 1').get();
      resolvedClassId = defClass ? defClass.id : 1;
    }

    const ins = db.prepare('INSERT INTO players(nick, nick_lower, password_hash, class_id, coins) VALUES(?,?,?,?,0)');
    const res = ins.run(trimmed, lower, pwHash, resolvedClassId);
    const newId = Number(res.lastInsertRowid);

    try {
      db.prepare('INSERT OR IGNORE INTO player_classes(player_id, class_id) VALUES(?, ?)').run(newId, resolvedClassId);
    } catch (e) {}

    // Starter items
    for (const item of ['hat_explorer', 'outfit_vest', 'bg_meadow', 'frame_wood', 'title_rookie']) {
      db.prepare('INSERT INTO player_items(player_id, item_id, is_equipped) VALUES(?,?,1)').run(newId, item);
    }
    const starterAvatar = { hat: 'hat_explorer', outfit: 'outfit_vest', bg: 'bg_meadow', frame: 'frame_wood' };
    db.prepare('UPDATE players SET avatar_json=? WHERE id=?').run(JSON.stringify(starterAvatar), newId);
    // Starter skills
    for (const sk of ['eliminate_one', 'eagle_eye', 'heal']) {
      db.prepare('INSERT INTO player_skills(player_id, skill_id, level) VALUES(?,?,1)').run(newId, sk);
    }
    // Starter loadout
    db.prepare("INSERT INTO player_loadout(player_id, slot_0, slot_1, slot_2) VALUES(?, 'eliminate_one', 'eagle_eye', 'heal')").run(newId);

    // Starter coins
    applyCoins(db, newId, 100, 'REGISTER_BONUS');

    db.exec('COMMIT');
    player = getPlayerById(newId);
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return player;
}

function loginPlayer(nick, password) {
  const db = getDb();
  const lower = String(nick || '').trim().toLowerCase();
  const row = db.prepare('SELECT * FROM players WHERE nick_lower=?').get(lower);
  if (!row) {
    const err = new Error('Nick atau password salah');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }
  if (!verifyPassword(password, row.password_hash)) {
    const err = new Error('Nick atau password salah');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  db.prepare("UPDATE players SET last_login_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").run(row.id);
  return getPlayerById(row.id);
}

function getPlayerClasses(playerId) {
  const db = getDb();
  const id = parseInt(playerId, 10);
  if (!id) return [];
  const rows = db.prepare(`
    SELECT c.id, c.name, c.sort_order
    FROM player_classes pc
    JOIN classes c ON c.id = pc.class_id
    WHERE pc.player_id = ?
    ORDER BY c.sort_order ASC, c.id ASC
  `).all(id);

  if (rows.length === 0) {
    const p = db.prepare('SELECT class_id FROM players WHERE id=?').get(id);
    if (p && p.class_id) {
      const cls = db.prepare('SELECT id, name, sort_order FROM classes WHERE id=?').get(p.class_id);
      if (cls) {
        try {
          db.prepare('INSERT OR IGNORE INTO player_classes(player_id, class_id) VALUES(?, ?)').run(id, cls.id);
        } catch (e) {}
        return [cls];
      }
    }
  }
  return rows;
}

function getPlayerById(id) {
  const db = getDb();
  const row = db.prepare('SELECT id, nick, xp, class_id, coins, pity_counter, avatar_json, title, day_streak, created_at, last_login_at, settings_json FROM players WHERE id=?').get(id);
  if (!row) return null;
  const level = GAME.levelFormula(row.xp);
  const nextXp = GAME.xpForNext(level);
  const energyMax = Progression.energyMaxForLevel(level);
  const nextEnergy = Progression.nextEnergyLevel(level);
  let avatar = {};
  try { avatar = JSON.parse(row.avatar_json || '{}'); } catch (e) {}
  if (!avatar || Object.keys(avatar).length === 0) {
    try {
      const eqRows = db.prepare('SELECT item_id FROM player_items WHERE player_id=? AND is_equipped=1').all(id);
      if (eqRows && eqRows.length > 0) {
        avatar = {};
        const itemMap = new Map(ITEMS.map(i => [i.id, i.slot]));
        for (const eq of eqRows) {
          const slot = itemMap.get(eq.item_id);
          if (slot) avatar[slot] = eq.item_id;
        }
      }
    } catch (_) {}
  }
  let settings = { sound: true, vibrate: true, reducedMotion: false, pace: 'AUTO', skillBarHidden: false };
  if (row.settings_json) {
    try { Object.assign(settings, JSON.parse(row.settings_json)); } catch (_) {}
  }
  const assignedClasses = getPlayerClasses(row.id);
  const primaryClass = (assignedClasses.length > 0) ? assignedClasses[0] : null;
  const cls = row.class_id ? db.prepare('SELECT name FROM classes WHERE id=?').get(row.class_id) : null;
  return {
    id: row.id,
    nick: row.nick,
    xp: row.xp,
    level,
    xpForNext: nextXp,
    nextLevelXp: nextXp,
    energyMax,
    nextEnergyLevel: nextEnergy,
    classId: primaryClass ? primaryClass.id : (row.class_id || 1),
    className: primaryClass ? primaryClass.name : (cls ? cls.name : 'Kelas 1'),
    classes: assignedClasses,
    coins: row.coins,
    pityCounter: row.pity_counter,
    avatar,
    settings,
    title: row.title,
    dayStreak: row.day_streak,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    brutal: BossSkills.BRUTAL,
  };
}

function updatePlayerClass(id, classId) {
  const db = getDb();
  let resolvedClassId = parseInt(classId, 10);
  if (Number.isInteger(resolvedClassId) && resolvedClassId > 0) {
    const check = db.prepare('SELECT id FROM classes WHERE id=?').get(resolvedClassId);
    if (!check) resolvedClassId = null;
  } else {
    resolvedClassId = null;
  }
  if (!resolvedClassId && typeof classId === 'string' && classId.trim()) {
    const checkName = db.prepare('SELECT id FROM classes WHERE LOWER(name)=LOWER(?)').get(classId.trim());
    if (checkName) resolvedClassId = checkName.id;
  }
  if (!resolvedClassId) {
    const defClass = db.prepare('SELECT id FROM classes ORDER BY sort_order, id LIMIT 1').get();
    resolvedClassId = defClass ? defClass.id : 1;
  }
  db.prepare('UPDATE players SET class_id=? WHERE id=?').run(resolvedClassId, id);
  return getPlayerById(id);
}

function updatePlayerAvatar(id, avatar) {
  const db = getDb();
  const player = getPlayerById(id);
  if (!player) throw new Error('PLAYER_NOT_FOUND');

  // Verify ownership of items
  const ownedRows = db.prepare('SELECT item_id FROM player_items WHERE player_id=?').all(id);
  const ownedSet = new Set(ownedRows.map(r => r.item_id));

  const av = avatar || {};
  for (const slot of ['hat', 'outfit', 'weapon', 'pet', 'bg', 'frame', 'title']) {
    const val = av[slot];
    if (val && !ownedSet.has(val)) {
      const err = new Error(`Item ${val} belum dimiliki`);
      err.code = 'ITEM_NOT_OWNED';
      throw err;
    }
  }

  try {
    db.prepare('UPDATE player_items SET is_equipped = 0 WHERE player_id = ?').run(id);
    const equippedIds = ['hat', 'outfit', 'weapon', 'pet', 'bg', 'frame', 'title']
      .map(slot => av[slot])
      .filter(Boolean);
    if (equippedIds.length > 0) {
      const placeholders = equippedIds.map(() => '?').join(',');
      db.prepare(`UPDATE player_items SET is_equipped = 1 WHERE player_id = ? AND item_id IN (${placeholders})`).run(id, ...equippedIds);
    }
  } catch (err) {
    console.warn('Update player_items is_equipped failed:', err.message);
  }

  if (av.title) {
    db.prepare('UPDATE players SET title=? WHERE id=?').run(av.title, id);
  }

  db.prepare('UPDATE players SET avatar_json=? WHERE id=?').run(JSON.stringify(av), id);
  return av;
}

function getPlayerSettings(playerId) {
  const p = getPlayerById(playerId);
  if (!p) throw new Error('PLAYER_NOT_FOUND');
  return p.settings || { sound: true, vibrate: true, reducedMotion: false, pace: 'AUTO', skillBarHidden: false };
}

function updatePlayerSettings(playerId, newSettings) {
  const db = getDb();
  const current = getPlayerSettings(playerId);
  const allowed = ['sound', 'vibrate', 'reducedMotion', 'pace', 'skillBarHidden', 'tts', 'autoNext'];
  if (newSettings && typeof newSettings === 'object') {
    for (const k of allowed) {
      if (newSettings[k] !== undefined) {
        current[k] = newSettings[k];
      }
    }
  }
  db.prepare('UPDATE players SET settings_json=? WHERE id=?').run(JSON.stringify(current), playerId);
  return current;
}

function ensureStarterItems(playerId) {
  const db = getDb();
  for (const item of ['hat_explorer', 'outfit_vest', 'bg_meadow']) {
    db.prepare(`
      INSERT INTO player_items(player_id, item_id, is_equipped)
      VALUES(?, ?, 1)
      ON CONFLICT(player_id, item_id) DO NOTHING
    `).run(playerId, item);
  }
}

function getPlayerProfile(playerId) {
  const db = getDb();
  const player = getPlayerById(playerId);
  if (!player) return null;

  ensureStarterItems(playerId);
  ensurePlayerSkills(playerId, player.level);

  // stats
  const bossRow = db.prepare('SELECT COALESCE(SUM(defeats), 0) as defeats, COUNT(DISTINCT CASE WHEN defeats > 0 THEN monster_id END) as dexDefeated FROM player_monsters WHERE player_id=?').get(playerId) || { defeats: 0, dexDefeated: 0 };
  const sessRow = db.prepare(`
    SELECT 
      COUNT(*) as totalSessions,
      COALESCE(SUM(CASE WHEN end_reason=\'BOSS_DEFEATED\' THEN 1 ELSE 0 END), 0) as totalWins,
      COALESCE(SUM(correct_count), 0) as correctCount,
      COALESCE(SUM(total_questions), 0) as totalQuestions,
      COALESCE(MAX(max_streak), 0) as bestStreak,
      COALESCE(SUM(stars), 0) as stars
    FROM game_sessions
    WHERE player_id=?
  `).get(playerId) || { totalSessions: 0, totalWins: 0, correctCount: 0, totalQuestions: 0, bestStreak: 0, stars: 0 };

  const winRate = sessRow.totalSessions > 0 ? Math.round((sessRow.totalWins / sessRow.totalSessions) * 100) : 0;
  const accuracy = sessRow.totalQuestions > 0 ? Math.round((sessRow.correctCount / sessRow.totalQuestions) * 100) : 0;

  const stats = {
    bossDefeated: Number(bossRow.defeats || sessRow.totalWins || 0),
    winRate,
    accuracy,
    bestStreak: Number(sessRow.bestStreak || 0),
    stars: Number(sessRow.stars || 0),
    dexDefeated: Number(bossRow.dexDefeated || 0)
  };

  const skillsData = getSkills(playerId);
  const hasSlot4 = db.prepare("SELECT 1 FROM player_items WHERE player_id=? AND item_id='slot_skill_4'").get(playerId);

  const badges = [];
  if (stats.bossDefeated >= 1) badges.push({ id: 'first_blood', name: 'Penakluk Pertama', icon: '⚔️' });
  if (stats.bossDefeated >= 10) badges.push({ id: 'boss_hunter', name: 'Pemburu Monster', icon: '👑' });
  if (stats.stars >= 15) badges.push({ id: 'star_collector', name: 'Bintang Terang', icon: '⭐' });
  if (stats.bestStreak >= 5) badges.push({ id: 'combo_master', name: 'Master Combo', icon: '🔥' });

  return {
    ok: true,
    player: {
      id: player.id,
      nick: player.nick,
      level: player.level,
      xp: player.xp,
      xpForNext: player.xpForNext,
      coins: player.coins,
      title: player.title || 'Petualang Pemula',
      classId: player.classId,
      className: player.className
    },
    avatar: player.avatar || {},
    stats,
    badges,
    skills: {
      loadout: skillsData.loadout,
      slots: hasSlot4 ? 4 : 3,
      list: skillsData.skills.map(s => ({
        id: s.id,
        name: s.name,
        icon: s.icon,
        level: s.level,
        unlocked: s.unlocked,
        desc: s.desc
      }))
    }
  };
}


function getPlayerPassives(playerId) {
  const db = getDb();
  const p = db.prepare('SELECT avatar_json FROM players WHERE id=?').get(playerId);
  let avatar = {};
  try { avatar = JSON.parse((p && p.avatar_json) || '{}'); } catch(e) {}
  const equippedIds = ['hat', 'outfit', 'weapon', 'pet', 'bg', 'frame', 'title']
    .map(slot => avatar[slot])
    .filter(Boolean);
  return calculatePassives(equippedIds, ITEMS);
}

/* ── Economy, Inventory & Shop ── */
function getInventory(playerId) {
  const db = getDb();
  const player = getPlayerById(playerId);
  if (!player) throw new Error('PLAYER_NOT_FOUND');

  const ownedRows = db.prepare('SELECT item_id, is_equipped FROM player_items WHERE player_id=?').all(playerId);
  const ownedMap = new Map();
  for (const row of ownedRows) {
    ownedMap.set(row.item_id, row.is_equipped === 1);
  }

  const items = ITEMS.map(it => ({
    id: it.id,
    slot: it.slot,
    rarity: it.rarity,
    name: it.name,
    passive: it.passive || null,
    lore: it.lore || '',
    owned: ownedMap.has(it.id),
    isNew: false,
    equipped: ownedMap.get(it.id) === true
  }));

  return {
    ok: true,
    coins: player.coins,
    avatar: player.avatar,
    passives: getPlayerPassives(playerId),
    items
  };
}

function getShop(playerId) {
  const db = getDb();
  const player = getPlayerById(playerId);
  if (!player) throw new Error('PLAYER_NOT_FOUND');

  const ownedRows = db.prepare('SELECT item_id FROM player_items WHERE player_id=?').all(playerId);
  const ownedSet = new Set(ownedRows.map(r => r.item_id));

  const items = ITEMS.filter(it => !ownedSet.has(it.id)).map(it => ({
    id: it.id,
    slot: it.slot,
    rarity: it.rarity,
    name: it.name,
    passive: it.passive || null,
    lore: it.lore || '',
    price: ECONOMY.price[it.rarity] || 50
  }));

  return {
    ok: true,
    coins: player.coins,
    mysteryBoxPrice: ECONOMY.mysteryBoxPrice,
    items
  };
}

function buyShopItem(playerId, itemId) {
  const db = getDb();
  const player = getPlayerById(playerId);
  if (!player) throw new Error('PLAYER_NOT_FOUND');

  const it = ITEMS.find(x => x.id === itemId);
  if (!it) {
    const err = new Error('Item tidak ditemukan');
    err.code = 'ITEM_NOT_FOUND';
    throw err;
  }

  const owned = db.prepare('SELECT id FROM player_items WHERE player_id=? AND item_id=?').get(playerId, itemId);
  if (owned) {
    const err = new Error('Item sudah dimiliki');
    err.code = 'ITEM_ALREADY_OWNED';
    throw err;
  }

  const price = ECONOMY.price[it.rarity] || 50;
  if (player.coins < price) {
    const err = new Error('Koin tidak cukup');
    err.code = 'INSUFFICIENT_COINS';
    throw err;
  }

  let newBalance = 0;
  db.exec('BEGIN IMMEDIATE');
  try {
    newBalance = applyCoins(db, playerId, -price, 'SHOP_BUY');
    db.prepare('INSERT INTO player_items(player_id, item_id, is_equipped) VALUES(?, ?, 0)').run(playerId, itemId);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }

  return { ok: true, itemId, coins: newBalance };
}

function buyMysteryBox(playerId) {
  const db = getDb();
  const player = getPlayerById(playerId);
  if (!player) throw new Error('PLAYER_NOT_FOUND');

  const price = ECONOMY.mysteryBoxPrice;
  if (player.coins < price) {
    const err = new Error('Koin tidak cukup');
    err.code = 'INSUFFICIENT_COINS';
    throw err;
  }

  const rand = Math.random() * 100;
  let rolledRarity = 'COMMON';
  if (rand < 5) rolledRarity = 'EPIC';
  else if (rand < 25) rolledRarity = 'RARE';
  else rolledRarity = 'COMMON';

  const candidates = ITEMS.filter(x => x.rarity === rolledRarity);
  const picked = candidates[Math.floor(Math.random() * candidates.length)];

  const owned = db.prepare('SELECT id FROM player_items WHERE player_id=? AND item_id=?').get(playerId, picked.id);
  const isDuplicate = !!owned;

  let newBalance = 0;
  let refund = 0;

  db.exec('BEGIN IMMEDIATE');
  try {
    applyCoins(db, playerId, -price, 'MYSTERY_BOX');
    if (isDuplicate) {
      refund = ECONOMY.duplicateRefund[picked.rarity] || 5;
      newBalance = applyCoins(db, playerId, refund, 'BOX_REFUND');
    } else {
      db.prepare('INSERT INTO player_items(player_id, item_id, is_equipped) VALUES(?, ?, 0)').run(playerId, picked.id);
      const cur = db.prepare('SELECT coins FROM players WHERE id=?').get(playerId);
      newBalance = cur.coins;
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }

  return {
    ok: true,
    item: picked,
    isDuplicate,
    refund,
    coins: newBalance
  };
}

const REASON_LABELS = {
  BATTLE_WIN: 'Menang Pertempuran',
  BATTLE_DROP: 'Hadiah Soal',
  SHOP_BUY: 'Beli Perlengkapan',
  SHOP_BOX: 'Buka Kotak Misteri',
  SKILL_UPGRADE: 'Upgrade Skill',
  REGISTER_BONUS: 'Bonus Petualang Baru',
  STARTER_KIT: 'Perlengkapan Awal',
  REFUND: 'Pengembalian Koin',
};

function getCoinHistory(playerId, limit = 20) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, amount as delta, amount, reason, balance_aft as balanceAft, created_at as createdAt
    FROM coin_transactions
    WHERE player_id=?
    ORDER BY id DESC
    LIMIT ?
  `).all(playerId, limit);
  return rows.map(r => ({
    id: r.id,
    delta: r.delta !== undefined ? r.delta : r.amount,
    amount: r.amount,
    reason: r.reason,
    label: REASON_LABELS[r.reason] || r.reason,
    balance: r.balanceAft,
    balanceAft: r.balanceAft,
    createdAt: r.createdAt,
    created_at: r.createdAt
  }));
}

/* ── Skills & Loadout ── */
function getPlayerLoadout(playerId) {
  const db = getDb();
  const hasSlot4 = db.prepare("SELECT 1 FROM player_items WHERE player_id=? AND item_id='slot_skill_4'").get(playerId);
  const row = db.prepare('SELECT slot_0, slot_1, slot_2, slot_3 FROM player_loadout WHERE player_id=?').get(playerId);
  if (row) {
    const list = [row.slot_0, row.slot_1, row.slot_2];
    if (hasSlot4) list.push(row.slot_3 || null);
    return list;
  }
  const defaultList = ['eliminate_one', 'eagle_eye', 'heal'];
  if (hasSlot4) defaultList.push(null);
  return defaultList;
}

function getPlayerDuelLoadout(playerId) {
  const db = getDb();
  const hasSlot4 = db.prepare("SELECT 1 FROM player_items WHERE player_id=? AND item_id='slot_skill_4'").get(playerId);
  const row = db.prepare('SELECT slot_0, slot_1, slot_2, slot_3 FROM player_duel_loadout WHERE player_id=?').get(playerId);
  if (row) {
    const list = [row.slot_0, row.slot_1, row.slot_2];
    if (hasSlot4) list.push(row.slot_3 || null);
    return list;
  }
  const advRow = db.prepare('SELECT slot_0, slot_1, slot_2, slot_3 FROM player_loadout WHERE player_id=?').get(playerId);
  if (advRow) {
    const list = [advRow.slot_0, advRow.slot_1, advRow.slot_2];
    if (hasSlot4) list.push(advRow.slot_3 || null);
    return list;
  }
  const defaultList = ['eliminate_one', 'eagle_eye', 'heal'];
  if (hasSlot4) defaultList.push(null);
  return defaultList;
}

function ensurePlayerSkills(playerId, playerLevel = null) {
  const db = getDb();
  if (playerLevel === null) {
    const p = db.prepare('SELECT xp FROM players WHERE id=?').get(playerId);
    playerLevel = p ? GAME.levelFormula(p.xp) : 1;
  }
  for (const sk of SKILLS) {
    if (sk.unlockLevel <= playerLevel) {
      db.prepare(`
        INSERT INTO player_skills(player_id, skill_id, level)
        VALUES(?, ?, 1)
        ON CONFLICT(player_id, skill_id) DO NOTHING
      `).run(playerId, sk.id);
    }
  }
  const row = db.prepare('SELECT player_id FROM player_loadout WHERE player_id=?').get(playerId);
  if (!row) {
    db.prepare(`
      INSERT INTO player_loadout(player_id, slot_0, slot_1, slot_2)
      VALUES(?, 'eliminate_one', 'eagle_eye', 'heal')
    `).run(playerId);
  }
}

function getPlayerSkillLevels(playerId) {
  const db = getDb();
  ensurePlayerSkills(playerId);
  const rows = db.prepare('SELECT skill_id, level FROM player_skills WHERE player_id=?').all(playerId);
  const map = {};
  for (const r of rows) map[r.skill_id] = r.level;
  return map;
}

function getSkills(playerId) {
  const db = getDb();
  ensurePlayerSkills(playerId);
  const player = getPlayerById(playerId);
  const playerCoins = player ? player.coins : 0;
  const pLevel = player ? player.level : 1;

  const pRows = db.prepare('SELECT skill_id, level FROM player_skills WHERE player_id=?').all(playerId);
  const skillMap = {};
  for (const r of pRows) skillMap[r.skill_id] = r.level;

  const hasSlot4 = Boolean(db.prepare("SELECT 1 FROM player_items WHERE player_id=? AND item_id='slot_skill_4'").get(playerId));
  const maxSlots = hasSlot4 ? 4 : 3;

  const rawLoadout = getPlayerLoadout(playerId);
  const loadout = rawLoadout.filter(Boolean);
  const rawDuelLoadout = getPlayerDuelLoadout(playerId);
  const duelLoadout = rawDuelLoadout.filter(Boolean);

  const skills = SKILLS.map(sk => {
    const isOwned = (skillMap[sk.id] !== undefined);
    const currLevel = skillMap[sk.id] || 1;
    const cost = sk.costEnergy[currLevel - 1] ?? sk.costEnergy[0];
    const uses = sk.maxUses ? (sk.maxUses[currLevel - 1] ?? sk.maxUses[0]) : (sk.uses ? (sk.uses[currLevel - 1] ?? sk.uses[0]) : 2);
    const val = sk.value ? (sk.value[currLevel - 1] ?? sk.value[0]) : null;
    const descNow = sk.desc ? sk.desc(val) : (sk.effectDesc || '');
    const isMax = currLevel >= (SKILL_MAX_LEVEL || 5);
    const nextVal = (!isMax && sk.value) ? (sk.value[currLevel] ?? sk.value[currLevel - 1]) : null;
    const descNext = (!isMax && sk.desc) ? sk.desc(nextVal) : null;
    const nextCost = isMax ? null : getSkillUpgradeCost(sk.id, currLevel);

    let reason = null;
    if (!isOwned) {
      reason = 'NOT_OWNED';
    } else if (isMax) {
      reason = 'MAX_LEVEL';
    } else if (playerCoins < nextCost) {
      reason = 'NOT_ENOUGH_COINS';
    }
    const canUpgrade = (reason === null);

    return {
      id: sk.id,
      name: sk.name,
      icon: sk.icon,
      owned: isOwned,
      unlocked: isOwned,
      unlockLevel: sk.unlockLevel,
      level: currLevel,
      maxLevel: SKILL_MAX_LEVEL || 5,
      costEnergy: cost,
      cost,
      usesPerBattle: uses,
      value: val,
      desc: descNow,
      descNow: descNow,
      effectNow: descNow,
      descNext: descNext,
      effectNext: descNext,
      upgradeCost: nextCost,
      nextUpgradeCost: nextCost,
      canUpgrade,
      reason
    };
  });

  const duelBossLoadout = getDuelBossLoadoutDetails(playerId);

  return {
    ok: true,
    skills,
    loadout,
    rawLoadout,
    duelLoadout,
    rawDuelLoadout,
    duelBossLoadout,
    slots: maxSlots,
    maxSlots,
    hasSlot4
  };
}

function updateLoadout(playerId, slots) {
  const db = getDb();
  const hasSlot4 = db.prepare("SELECT 1 FROM player_items WHERE player_id=? AND item_id='slot_skill_4'").get(playerId);
  const maxSlots = hasSlot4 ? 4 : 3;
  if (!Array.isArray(slots) || slots.length > maxSlots) {
    const err = new Error(`Slots harus array maksimal ${maxSlots} item`);
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  const s0 = slots[0] || null;
  const s1 = slots[1] || null;
  const s2 = slots[2] || null;
  const s3 = hasSlot4 ? (slots[3] || null) : null;

  db.prepare(`
    INSERT INTO player_loadout(player_id, slot_0, slot_1, slot_2, slot_3)
    VALUES(?, ?, ?, ?, ?)
    ON CONFLICT(player_id) DO UPDATE SET
      slot_0 = excluded.slot_0,
      slot_1 = excluded.slot_1,
      slot_2 = excluded.slot_2,
      slot_3 = excluded.slot_3
  `).run(playerId, s0, s1, s2, s3);

  const res = [s0, s1, s2];
  if (hasSlot4) res.push(s3);
  return res;
}

function updateDuelLoadout(playerId, slots) {
  const db = getDb();
  const hasSlot4 = db.prepare("SELECT 1 FROM player_items WHERE player_id=? AND item_id='slot_skill_4'").get(playerId);
  const maxSlots = hasSlot4 ? 4 : 3;
  if (!Array.isArray(slots) || slots.length > maxSlots) {
    const err = new Error(`Slots harus array maksimal ${maxSlots} item`);
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  const s0 = slots[0] || null;
  const s1 = slots[1] || null;
  const s2 = slots[2] || null;
  const s3 = hasSlot4 ? (slots[3] || null) : null;

  db.prepare(`
    INSERT INTO player_duel_loadout(player_id, slot_0, slot_1, slot_2, slot_3)
    VALUES(?, ?, ?, ?, ?)
    ON CONFLICT(player_id) DO UPDATE SET
      slot_0 = excluded.slot_0,
      slot_1 = excluded.slot_1,
      slot_2 = excluded.slot_2,
      slot_3 = excluded.slot_3
  `).run(playerId, s0, s1, s2, s3);

  const res = [s0, s1, s2];
  if (hasSlot4) res.push(s3);
  return res;
}

// --- BOSS LOADOUT FOR BATTLE VS PLAYER (PvP) ---

function getUnlockedBossSlots(playerLevel) {
  const lvl = Number(playerLevel) || 1;
  if (lvl < 5) return 0;
  // Lv 5-9: 1, Lv 10-14: 2, Lv 15-19: 3, Lv 20-24: 4, Lv 25+: 5
  return Math.min(5, Math.floor(lvl / 5));
}

function getMaxAllowedBossRarity(playerLevel) {
  const lvl = Number(playerLevel) || 1;
  if (lvl < 5) return null;
  if (lvl <= 10) return 'common';
  if (lvl <= 15) return 'rare';
  if (lvl < 20) return 'epic';
  return 'legend'; // Lv 20+
}

const RARITY_RANKS = { common: 1, rare: 2, epic: 3, legend: 4 };

function canEquipBossRarity(playerLevel, bossTier) {
  const maxRarity = getMaxAllowedBossRarity(playerLevel);
  if (!maxRarity) return false;
  const maxRank = RARITY_RANKS[maxRarity] || 0;
  const bossRank = RARITY_RANKS[bossTier] || 1;
  return bossRank <= maxRank;
}

function getMonsterTierById(monsterId) {
  const m = MONSTERS.find(x => x.id === monsterId);
  if (!m) return 'common';
  if (m.tier) return m.tier;
  const mod10 = (m.id - 1) % 10;
  return mod10 < 4 ? 'common' : (mod10 < 7 ? 'rare' : (mod10 < 9 ? 'epic' : 'legend'));
}

function getPlayerDuelBossLoadout(playerId) {
  const db = getDb();
  const row = db.prepare('SELECT slot_0, slot_1, slot_2, slot_3, slot_4 FROM player_duel_boss_loadout WHERE player_id=?').get(playerId);
  if (row) {
    return [row.slot_0, row.slot_1, row.slot_2, row.slot_3, row.slot_4];
  }
  return [null, null, null, null, null];
}

function updatePlayerDuelBossLoadout(playerId, slots) {
  const db = getDb();
  const player = getPlayerById(playerId);
  if (!player) {
    const err = new Error('Pemain tidak ditemukan');
    err.code = 'PLAYER_NOT_FOUND';
    throw err;
  }

  if (!Array.isArray(slots) || slots.length > 5) {
    const err = new Error('Slots harus array maksimal 5 item');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const pLevel = player.level || 1;
  const unlockedSlots = getUnlockedBossSlots(pLevel);

  // Normalize array to length 5
  const normSlots = Array.from({ length: 5 }, (_, i) => (slots[i] !== undefined ? slots[i] : null));

  // Check slot limits
  for (let i = 0; i < 5; i++) {
    if (i >= unlockedSlots && normSlots[i] != null) {
      const unlockReq = 5 * (i + 1);
      const err = new Error(`Slot ${i + 1} masih terkunci! Butuh Level ${unlockReq}`);
      err.code = 'SLOT_LOCKED';
      throw err;
    }
  }

  // Validate non-null monster IDs
  const seen = new Set();
  for (let i = 0; i < unlockedSlots; i++) {
    const mId = normSlots[i];
    if (mId == null) continue;
    const monsterId = Number(mId);
    if (!Number.isInteger(monsterId) || monsterId < 1 || monsterId > 100) {
      const err = new Error(`Monster ID ${mId} tidak valid`);
      err.code = 'INVALID_MONSTER_ID';
      throw err;
    }

    if (seen.has(monsterId)) {
      const err = new Error(`Bos tidak boleh dipasang ganda di lebih dari satu slot`);
      err.code = 'DUPLICATE_BOSS';
      throw err;
    }
    seen.add(monsterId);

    // Defeated check
    const caught = db.prepare('SELECT defeats FROM player_monsters WHERE player_id=? AND monster_id=?').get(playerId, monsterId);
    if (!caught || caught.defeats <= 0) {
      const mObj = MONSTERS.find(x => x.id === monsterId);
      const err = new Error(`Bos ${mObj ? mObj.name : '#' + monsterId} belum pernah kamu kalahkan!`);
      err.code = 'BOSS_NOT_DEFEATED';
      throw err;
    }

    // Rarity check
    const mTier = getMonsterTierById(monsterId);
    if (!canEquipBossRarity(pLevel, mTier)) {
      const err = new Error(`Level ${pLevel} belum bisa memasang bos dengan rarity ${mTier.toUpperCase()}!`);
      err.code = 'RARITY_LOCKED';
      throw err;
    }
  }

  db.prepare(`
    INSERT INTO player_duel_boss_loadout(player_id, slot_0, slot_1, slot_2, slot_3, slot_4)
    VALUES(?, ?, ?, ?, ?, ?)
    ON CONFLICT(player_id) DO UPDATE SET
      slot_0 = excluded.slot_0,
      slot_1 = excluded.slot_1,
      slot_2 = excluded.slot_2,
      slot_3 = excluded.slot_3,
      slot_4 = excluded.slot_4
  `).run(playerId, normSlots[0], normSlots[1], normSlots[2], normSlots[3], normSlots[4]);

  return normSlots;
}

function getDuelBossLoadoutDetails(playerId) {
  const player = getPlayerById(playerId);
  const pLevel = player ? player.level : 1;
  const unlockedSlots = getUnlockedBossSlots(pLevel);
  const maxRarity = getMaxAllowedBossRarity(pLevel);
  const rawSlots = getPlayerDuelBossLoadout(playerId);

  const slots = Array.from({ length: 5 }, (_, idx) => {
    const isUnlocked = idx < unlockedSlots;
    const unlockLevel = 5 * (idx + 1);
    const mId = rawSlots[idx];
    let monster = null;
    let skills = [];

    if (isUnlocked && mId) {
      const mObj = MONSTERS.find(x => x.id === mId);
      if (mObj) {
        const tier = getMonsterTierById(mId);
        const elKey = BossSkills.elementForTheme(mObj.theme) || 'nature';
        const elInfo = BossSkills.ELEMENTS[elKey] || { name: 'Alam', icon: '🌿', color: '#22C55E' };
        const rawSkills = BossSkills.skillsFor(elKey, tier, mId);
        skills = rawSkills.map(s => {
          const desc = BossSkills.describeSkill(s, tier, false);
          return {
            id: s.id,
            name: s.name,
            icon: s.icon,
            type: s.type,
            base: s.base,
            every: s.every,
            turns: s.turns,
            verb: s.verb,
            text: desc.text || '',
            bossId: mObj.id,
            bossName: mObj.name,
            element: elKey
          };
        });

        monster = {
          id: mObj.id,
          name: mObj.name,
          theme: mObj.theme,
          tier,
          element: elKey,
          elementName: elInfo.name,
          elementIcon: elInfo.icon,
          elementColor: elInfo.color
        };
      }
    }

    return {
      slotIndex: idx,
      unlocked: isUnlocked,
      unlockLevel,
      monster,
      skills
    };
  });

  const activeBossSkills = [];
  for (const s of slots) {
    if (s.skills && s.skills.length > 0) {
      for (const sk of s.skills) {
        activeBossSkills.push(sk);
      }
    }
  }

  return {
    slots,
    rawSlots,
    unlockedCount: unlockedSlots,
    maxAllowedRarity: maxRarity,
    playerLevel: pLevel,
    activeBossSkills
  };
}

function getPlayerEquippedBossSkills(db, playerId) {
  db = db || getDb();
  const player = getPlayerById(playerId);
  if (!player) return [];
  const pLevel = player.level || 1;
  const unlockedSlots = getUnlockedBossSlots(pLevel);
  const row = db.prepare('SELECT slot_0, slot_1, slot_2, slot_3, slot_4 FROM player_duel_boss_loadout WHERE player_id=?').get(playerId);
  if (!row) return [];

  const rawSlots = [row.slot_0, row.slot_1, row.slot_2, row.slot_3, row.slot_4].slice(0, unlockedSlots);
  const activeSkills = [];

  for (const mId of rawSlots) {
    if (!mId) continue;
    const mObj = MONSTERS.find(x => x.id === mId);
    if (!mObj) continue;
    const tier = getMonsterTierById(mId);
    if (!canEquipBossRarity(pLevel, tier)) continue;
    const elKey = BossSkills.elementForTheme(mObj.theme) || 'nature';
    const elInfo = BossSkills.ELEMENTS[elKey] || { name: 'Alam', icon: '🌿', color: '#22C55E' };
    const rawSkills = BossSkills.skillsFor(elKey, tier, mId);
    for (const s of rawSkills) {
      const desc = BossSkills.describeSkill(s, tier, false);
      activeSkills.push({
        id: s.id,
        name: s.name,
        icon: s.icon,
        type: s.type,
        base: s.base,
        every: s.every,
        turns: s.turns,
        verb: s.verb,
        text: desc.text || '',
        bossId: mObj.id,
        bossName: mObj.name,
        element: elKey,
        tier
      });
    }
  }

  return activeSkills;
}

function upgradeSkill(playerId, skillId) {
  const db = getDb();
  const player = getPlayerById(playerId);
  if (!player) throw new Error('PLAYER_NOT_FOUND');

  const skDef = SKILLS.find(x => x.id === skillId);
  if (!skDef) throw new Error('SKILL_NOT_FOUND');

  const row = db.prepare('SELECT level FROM player_skills WHERE player_id=? AND skill_id=?').get(playerId, skillId);
  if (!row) {
    const err = new Error('Skill ini belum kamu miliki');
    err.code = 'SKILL_NOT_OWNED';
    throw err;
  }
  const currLevel = row.level;
  const maxLvl = SKILL_MAX_LEVEL || 5;
  if (currLevel >= maxLvl) {
    const err = new Error('Skill sudah mencapai level maksimum');
    err.code = 'MAX_LEVEL';
    throw err;
  }

  const cost = getSkillUpgradeCost(skillId, currLevel);
  if (!cost) throw new Error('CANNOT_UPGRADE');

  if (player.coins < cost) {
    const err = new Error('Koin tidak cukup');
    err.code = 'NOT_ENOUGH_COINS';
    throw err;
  }

  db.exec('BEGIN IMMEDIATE');
  let newBalance = 0;
  try {
    const pCheck = db.prepare('SELECT coins FROM players WHERE id=?').get(playerId);
    if (!pCheck || pCheck.coins < cost) {
      const err = new Error('Koin tidak cukup');
      err.code = 'NOT_ENOUGH_COINS';
      throw err;
    }
    newBalance = applyCoins(db, playerId, -cost, `SKILL_UPGRADE:${skillId}:${currLevel + 1}`);
    db.prepare(`
      UPDATE player_skills SET level = ? WHERE player_id = ? AND skill_id = ?
    `).run(currLevel + 1, playerId, skillId);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }

  const newLevel = currLevel + 1;
  const nextCost = newLevel < maxLvl ? getSkillUpgradeCost(skillId, newLevel) : null;
  const valNow = skDef.value ? (skDef.value[newLevel - 1] ?? skDef.value[0]) : null;
  const effectNow = skDef.desc ? skDef.desc(valNow) : (skDef.effectDesc || '');
  const valNext = (newLevel < maxLvl && skDef.value) ? (skDef.value[newLevel] ?? skDef.value[newLevel - 1]) : null;
  const effectNext = (newLevel < maxLvl && skDef.desc) ? skDef.desc(valNext) : null;

  return {
    ok: true,
    skill: {
      id: skillId,
      level: newLevel,
      nextCost,
      effectNow,
      effectNext
    },
    newLevel,
    level: newLevel,
    coins: newBalance
  };
}

/* ── Auth Admin ── */
function loginAdmin(username, password) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM admins WHERE username=?').get(String(username || '').trim());
  if (!row) return null;
  const pw = String(password || '');
  if (!verifyPassword(pw, row.password_hash)) {
    return null;
  }
  return { id: row.id, username: row.username };
}

/* ── Classes & Subjects ── */
function getClasses() {
  const db = getDb();
  return db.prepare('SELECT id, name, sort_order FROM classes ORDER BY sort_order ASC, id ASC').all();
}

function getSubjectsByClass(classId, playerId) {
  const db = getDb();
  const subs = db.prepare('SELECT * FROM subjects WHERE class_id=? AND is_active=1 ORDER BY id ASC').all(classId);
  const progressRows = playerId
    ? db.prepare('SELECT * FROM player_subject_progress WHERE player_id=?').all(playerId)
    : [];
  const progMap = new Map();
  for (const p of progressRows) progMap.set(p.subject_id, p);

  return subs.map(s => {
    const p = progMap.get(s.id);
    return {
      id: s.id,
      name: s.name,
      icon: s.icon,
      color: s.color,
      monsterTheme: s.monster_theme,
      questionCount: s.question_count,
      timeLimitSec: s.time_limit_sec,
      playable: true,
      bestStars: p ? p.best_stars : 0,
      sessionsPlayed: p ? p.sessions_played : 0,
      wins: p ? p.wins : 0,
      bestStreak: p ? p.best_streak : 0,
    };
  });
}

/* ── Battle Game Sessions ── */
function getQuestionType(q) {
  if (!q) return 'MCQ';
  const t = (q.question_type || q.questionType || 'MCQ').toUpperCase();
  if (['MCQ', 'TRUE_FALSE', 'ORDERING', 'MATCHING', 'SHORT'].includes(t)) {
    return t;
  }
  return 'MCQ';
}

function arrangeSessionQuestions(items) {
  if (!Array.isArray(items) || items.length <= 2) return shuffle(items || []);
  const mcqs = shuffle(items.filter(it => getQuestionType(it.q) === 'MCQ'));
  const nonMcqs = shuffle(items.filter(it => getQuestionType(it.q) !== 'MCQ'));

  if (mcqs.length === 0) {
    // Mode Fun / non-MCQ: selang-selingkan tipe soal agar terdistribusi merata dan dinamis
    const byType = {};
    for (const it of nonMcqs) {
      const t = getQuestionType(it.q);
      if (!byType[t]) byType[t] = [];
      byType[t].push(it);
    }
    const typeKeys = shuffle(Object.keys(byType));
    const result = [];
    let added = true;
    while (added) {
      added = false;
      for (const t of typeKeys) {
        if (byType[t] && byType[t].length > 0) {
          result.push(byType[t].pop());
          added = true;
        }
      }
    }
    return result;
  }

  const binCount = mcqs.length + 1;
  const bins = Array.from({ length: binCount }, () => []);

  // Pick random bin indices that have space (< 2)
  const binIndices = shuffle(Array.from({ length: binCount }, (_, i) => i));
  let binIdx = 0;
  for (const item of nonMcqs) {
    let placed = false;
    for (let tries = 0; tries < binCount; tries++) {
      const idx = binIndices[(binIdx + tries) % binCount];
      if (bins[idx].length < 2) {
        bins[idx].push(item);
        binIdx = (binIdx + tries + 1) % binCount;
        placed = true;
        break;
      }
    }
    if (!placed) {
      let minIdx = 0;
      for (let i = 1; i < binCount; i++) {
        if (bins[i].length < bins[minIdx].length) minIdx = i;
      }
      bins[minIdx].push(item);
    }
  }

  const result = [];
  for (let i = 0; i < mcqs.length; i++) {
    result.push(...bins[i]);
    result.push(mcqs[i]);
  }
  result.push(...bins[mcqs.length]);
  return result;
}

function buildSafeDisplayQuestion(sq, s) {
  const qType = getQuestionType(sq);
  let displayData = {};
  if (sq.display_json) {
    try { displayData = JSON.parse(sq.display_json); } catch(e) {}
  }
  let typeData = {};
  if (sq.type_data_json) {
    try { typeData = JSON.parse(sq.type_data_json); } catch(e) {}
  }

  let displayOpts = [];
  let safeTypeData = {};

  if (qType === 'MCQ') {
    let opts = [];
    try { opts = JSON.parse(sq.options_json); } catch (e) {}
    if (opts.length === 0 && Array.isArray(typeData.options)) opts = typeData.options;
    let order = displayData.optionOrder || [];
    if (order.length === 0 && sq.option_order) {
      try { order = JSON.parse(sq.option_order); } catch (e) {}
    }
    if (order.length === 0) order = opts.map((_, i) => i);
    displayOpts = order.map(origIdx => opts[origIdx]);
    safeTypeData = { options: displayOpts };
  } else if (qType === 'TRUE_FALSE') {
    displayOpts = ['Benar', 'Salah'];
    safeTypeData = { options: displayOpts };
  } else if (qType === 'ORDERING') {
    const items = Array.isArray(typeData.items) ? typeData.items : [];
    let displayOrder = displayData.displayOrder || [];
    if (displayOrder.length === 0 && sq.option_order) {
      try { displayOrder = JSON.parse(sq.option_order); } catch (e) {}
    }
    if (displayOrder.length === 0) displayOrder = items.map((_, i) => i);
    const shuffledItems = displayOrder.map(i => items[i]);
    displayOpts = shuffledItems;
    safeTypeData = { items: shuffledItems, displayOrder };
  } else if (qType === 'MATCHING') {
    const pairs = Array.isArray(typeData.pairs) ? typeData.pairs : [];
    let rightOrder = displayData.rightOrder || [];
    if (rightOrder.length === 0 && sq.option_order) {
      try { rightOrder = JSON.parse(sq.option_order); } catch (e) {}
    }
    if (rightOrder.length === 0) rightOrder = pairs.map((_, i) => i);
    const leftItems = pairs.map(p => p.left);
    const rightItems = rightOrder.map(i => pairs[i].right);
    displayOpts = leftItems;
    safeTypeData = { lefts: leftItems, rights: rightItems, leftItems, rightItems, rightOrder };
  } else if (qType === 'SHORT') {
    displayOpts = [];
    safeTypeData = {
      isNumeric: Boolean(typeData.isNumeric || typeData.numeric),
      inputMode: (typeData.isNumeric || typeData.numeric) ? 'numeric' : 'text',
      placeholder: typeData.placeholder || ((typeData.isNumeric || typeData.numeric) ? 'Ketik angka...' : 'Ketik jawabanmu...')
    };
  }

  let totalChars = (sq.text || '').length;
  if (qType === 'MCQ' || qType === 'TRUE_FALSE') {
    totalChars += displayOpts.reduce((acc, opt) => acc + (opt || '').length, 0);
  } else if (qType === 'ORDERING') {
    totalChars += (safeTypeData.items || []).reduce((acc, it) => acc + (it || '').length, 0);
  } else if (qType === 'MATCHING') {
    totalChars += (safeTypeData.leftItems || []).reduce((acc, it) => acc + (it || '').length, 0);
    totalChars += (safeTypeData.rightItems || []).reduce((acc, it) => acc + (it || '').length, 0);
  }

  const readBonusSec = Math.min(20, Math.ceil(Math.max(0, totalChars - 160) / 25));
  const baseLimit = sq.q_time_limit || (s && s.time_limit_sec) || TYPE_TIME_SEC[qType] || 20;
  const pace = (s && s.pace_used !== null && s.pace_used !== undefined) ? s.pace_used : 1.0;
  const phaseFactor = (s && s.boss_phase === 2) ? 0.9 : 1.0;
  let flags = {};
  try { flags = JSON.parse((s && s.flags_json) || '{}'); } catch(e) {}
  const passiveTime = (flags && flags.passives && flags.passives.bonusTime) ? flags.passives.bonusTime : 0;
  const timeLimitSec = Math.max(5, Math.round((baseLimit + readBonusSec + passiveTime) * pace * phaseFactor));

  return {
    qType,
    displayOpts,
    safeTypeData,
    readBonusSec,
    timeLimitSec
  };
}

function startSession(playerId, subjectId, options = {}) {
  const db = getDb();
  const opts = typeof options === 'string' ? { mode: options } : (options || {});
  const sessionMode = opts.mode || 'BATTLE';
  const subj = db.prepare('SELECT * FROM subjects WHERE id=? AND is_active=1').get(subjectId);
  if (!subj) throw new Error('SUBJECT_NOT_FOUND');

  // Check for existing active session (invarian: max 1 sesi aktif)
  const existing = db.prepare("SELECT id, started_at, last_ping_at FROM game_sessions WHERE player_id=? AND status='IN_PROGRESS' ORDER BY started_at DESC LIMIT 1").get(playerId);
  if (existing) {
    const refDate = existing.last_ping_at || existing.started_at;
    const ageMs = Date.now() - new Date(refDate).getTime();
    if (ageMs > 48 * 3600 * 1000) {
      db.prepare("UPDATE game_sessions SET status='ABANDONED', end_reason='EXPIRED_48H' WHERE id=?").run(existing.id);
    } else {
      const err = new Error('Anda masih memiliki sesi yang belum selesai');
      err.code = 'ACTIVE_SESSION';
      err.sessionId = existing.id;
      throw err;
    }
  }

  // Select questions with review slots (T-11 / H.2)
  // Mode Fun: 4 variasi tipe non-MCQ; Mode Battle eksplisit: hanya MCQ; Default/Legacy: campuran TYPE_MIX
  const isFunMode = (sessionMode === 'FUN');
  const isBattleExplicit = (opts.mode === 'BATTLE');
  let allQ;
  if (isFunMode) {
    allQ = db.prepare("SELECT * FROM questions WHERE subject_id=? AND is_active=1 AND question_type IN ('TRUE_FALSE', 'ORDERING', 'MATCHING', 'SHORT')").all(subjectId);
  } else if (isBattleExplicit) {
    allQ = db.prepare("SELECT * FROM questions WHERE subject_id=? AND is_active=1 AND (question_type IS NULL OR question_type = 'MCQ')").all(subjectId);
  } else {
    allQ = db.prepare("SELECT * FROM questions WHERE subject_id=? AND is_active=1").all(subjectId);
  }
  if (allQ.length === 0) throw new Error('NO_QUESTIONS');

  let campaignNode = opts.campaignNode || null;
  let campaignNodeObj = null;
  if (campaignNode) {
    const nodeInfo = parseNodeKey(campaignNode);
    if (!nodeInfo) throw new Error('INVALID_CAMPAIGN_NODE');
    const camp = getCampaign(playerId, subjectId);
    const chapterObj = camp.chapters.find(c => c.n === nodeInfo.chapter);
    campaignNodeObj = chapterObj && chapterObj.nodes.find(n => n.order === nodeInfo.node);
    if (!campaignNodeObj) throw new Error('NODE_NOT_FOUND');
    if (!campaignNodeObj.unlocked) throw new Error('NODE_LOCKED');
  }

  const pRow = db.prepare('SELECT xp FROM players WHERE id=?').get(playerId);
  const playerLevel = GAME.levelFormula(pRow ? pRow.xp : 0);

  let bossTier = options.bossTier || options.boss_tier || null;
  if (!bossTier) {
    if (campaignNodeObj) {
      const nodeInfo = parseNodeKey(campaignNode);
      bossTier = Progression.campaignTier(nodeInfo.chapter, nodeInfo.node);
    } else {
      bossTier = Progression.pickTier(Math.random, playerLevel);
    }
  }

  let abilityScore = null;
  try {
    const abRes = computeSubjectAbilities(playerId);
    if (abRes && abRes.abilities) {
      const found = abRes.abilities.find(a => a.id === subjectId);
      if (found && typeof found.abilityScore === 'number') {
        abilityScore = found.abilityScore;
      }
    }
  } catch (e) {}

  const poolSize = allQ.length;
  const bStats = Progression.bossStats(bossTier, abilityScore, 100, poolSize);
  if (poolSize < bStats.hitsNeeded) {
    console.warn(`[WARN] Bank soal mapel ${subjectId} kurang (${poolSize} < ${bStats.hitsNeeded})`);
  }

  const count = campaignNodeObj 
    ? Math.min(campaignNodeObj.questionCount, poolSize) 
    : Math.min(options.count || options.totalQuestions || options.planned || (options.dynamic ? bStats.planned : (subj.question_count || 10)), poolSize);

  // Query soal jatuh tempo untuk ulangan berjarak (Spaced Repetition)
  const dueReviews = isFunMode
    ? db.prepare(`
      SELECT q.*
      FROM player_question_stats pqs
      JOIN questions q ON q.id = pqs.question_id
      WHERE pqs.player_id = ?
        AND q.subject_id = ?
        AND q.is_active = 1
        AND q.question_type IN ('TRUE_FALSE', 'ORDERING', 'MATCHING', 'SHORT')
        AND pqs.mastered = 0
        AND pqs.due_at IS NOT NULL
        AND pqs.due_at <= datetime('now')
      ORDER BY pqs.due_at ASC
    `).all(playerId, subjectId)
    : (isBattleExplicit
      ? db.prepare(`
        SELECT q.*
        FROM player_question_stats pqs
        JOIN questions q ON q.id = pqs.question_id
        WHERE pqs.player_id = ?
          AND q.subject_id = ?
          AND q.is_active = 1
          AND (q.question_type IS NULL OR q.question_type = 'MCQ')
          AND pqs.mastered = 0
          AND pqs.due_at IS NOT NULL
          AND pqs.due_at <= datetime('now')
        ORDER BY pqs.due_at ASC
      `).all(playerId, subjectId)
      : db.prepare(`
        SELECT q.*
        FROM player_question_stats pqs
        JOIN questions q ON q.id = pqs.question_id
        WHERE pqs.player_id = ?
          AND q.subject_id = ?
          AND q.is_active = 1
          AND pqs.mastered = 0
          AND pqs.due_at IS NOT NULL
          AND pqs.due_at <= datetime('now')
        ORDER BY pqs.due_at ASC
      `).all(playerId, subjectId));

  const maxReviews = Math.min(dueReviews.length, Math.max(1, Math.floor(count * (SPACED.maxReviewQuotaPct || 0.30))));
  const reviewPicked = dueReviews.slice(0, maxReviews);
  const reviewQIds = new Set(reviewPicked.map(q => q.id));

  // Ambil sisa soal non-review (dedup)
  const nonReviewPool = allQ.filter(q => !reviewQIds.has(q.id));

  // Komposisi tipe soal TYPE_MIX (T-16 / A.3)
  let typeMix = TYPE_MIX;
  if (subj.type_mix_json) {
    try {
      const parsed = JSON.parse(subj.type_mix_json);
      if (parsed && typeof parsed === 'object') typeMix = Object.assign({}, TYPE_MIX, parsed);
    } catch (e) {}
  }

  // Hitung target kuota tiap tipe untuk sesi total 'count'
  // Mode FUN: 0% MCQ, 4 tipe non-MCQ dibagi rata merata (~25% masing-masing)
  const nonMcqTypes = ['TRUE_FALSE', 'ORDERING', 'MATCHING', 'SHORT'];
  let targetPerType;
  if (isFunMode) {
    const base = Math.floor(count / 4);
    const rem = count % 4;
    const shuffledTypes = shuffle([...nonMcqTypes]);
    targetPerType = {
      TRUE_FALSE: base,
      ORDERING: base,
      MATCHING: base,
      SHORT: base,
      MCQ: 0
    };
    for (let i = 0; i < rem; i++) {
      targetPerType[shuffledTypes[i]] += 1;
    }
  } else if (isBattleExplicit) {
    targetPerType = {
      TRUE_FALSE: 0,
      ORDERING: 0,
      MATCHING: 0,
      SHORT: 0,
      MCQ: count
    };
  } else {
    targetPerType = {
      TRUE_FALSE: Math.max(0, Math.round(count * (typeMix.TRUE_FALSE !== undefined ? typeMix.TRUE_FALSE : 0.15))),
      ORDERING: Math.max(0, Math.round(count * (typeMix.ORDERING !== undefined ? typeMix.ORDERING : 0.10))),
      MATCHING: Math.max(0, Math.round(count * (typeMix.MATCHING !== undefined ? typeMix.MATCHING : 0.10))),
      SHORT: Math.max(0, Math.round(count * (typeMix.SHORT !== undefined ? typeMix.SHORT : 0.05)))
    };
    const nonMcqTargetSum = Object.values(targetPerType).reduce((a, b) => a + b, 0);
    targetPerType.MCQ = Math.max(0, count - nonMcqTargetSum);
  }

  // Hitung alokasi tipe yang sudah terpenuhi oleh reviewPicked
  const allocatedByType = { MCQ: 0, TRUE_FALSE: 0, ORDERING: 0, MATCHING: 0, SHORT: 0 };
  for (const q of reviewPicked) {
    const t = getQuestionType(q);
    allocatedByType[t] = (allocatedByType[t] || 0) + 1;
  }

  // Pisahkan nonReviewPool berdasarkan tipe
  const poolByType = { MCQ: [], TRUE_FALSE: [], ORDERING: [], MATCHING: [], SHORT: [] };
  for (const q of nonReviewPool) {
    const t = getQuestionType(q);
    if (!poolByType[t]) poolByType[t] = [];
    poolByType[t].push(q);
  }
  for (const t of Object.keys(poolByType)) {
    poolByType[t] = shuffle(poolByType[t]);
  }

  // Ambil dari non-MCQ pools sesuai target
  const pickedNonReview = [];
  for (const t of nonMcqTypes) {
    const needed = Math.max(0, (targetPerType[t] || 0) - (allocatedByType[t] || 0));
    const takeCount = Math.min(needed, poolByType[t].length);
    const taken = poolByType[t].splice(0, takeCount);
    pickedNonReview.push(...taken);
    allocatedByType[t] = (allocatedByType[t] || 0) + taken.length;
  }

  // Sisa kuota untuk mencapai 'count'
  const remainingSlots = Math.max(0, count - (reviewPicked.length + pickedNonReview.length));
  if (!isFunMode) {
    const mcqTaken = poolByType.MCQ.splice(0, remainingSlots);
    pickedNonReview.push(...mcqTaken);
  } else if (remainingSlots > 0) {
    // Di Mode Fun, sisa slot HANYA diambil dari tipe non-MCQ lain yang masih bersisa (tidak pernah ambil MCQ)
    const leftoverNonMcq = [];
    for (const t of nonMcqTypes) {
      if (poolByType[t]) leftoverNonMcq.push(...poolByType[t]);
    }
    const extraNonMcq = shuffle(leftoverNonMcq).slice(0, remainingSlots);
    pickedNonReview.push(...extraNonMcq);
    const extraIds = new Set(extraNonMcq.map(q => q.id));
    for (const t of nonMcqTypes) {
      if (poolByType[t]) poolByType[t] = poolByType[t].filter(q => !extraIds.has(q.id));
    }
  }

  // Jika pool masih kurang dari count (misal bank soal sangat sedikit)
  if (reviewPicked.length + pickedNonReview.length < count) {
    const stillNeeded = count - (reviewPicked.length + pickedNonReview.length);
    const leftover = [];
    const poolKeys = isFunMode ? nonMcqTypes : Object.keys(poolByType);
    for (const t of poolKeys) {
      if (poolByType[t]) leftover.push(...poolByType[t]);
    }
    const extraTaken = shuffle(leftover).slice(0, stillNeeded);
    pickedNonReview.push(...extraTaken);
  }

  // Gabungkan dan susun urutan soal (maks 2 non-MCQ beruntun)
  const unarranged = [
    ...reviewPicked.map(q => ({ q, isReview: 1 })),
    ...pickedNonReview.map(q => ({ q, isReview: 0 }))
  ];
  const combined = arrangeSessionQuestions(unarranged);

  // Weak topic detection (T-14 / C.2 / T-21)
  const topicCounts = {};
  for (const item of combined) {
    const t = item.q.topic_tag;
    if (t) topicCounts[t] = (topicCounts[t] || 0) + 1;
  }
  let bestTopic = null;
  let maxCount = 0;
  for (const [top, cnt] of Object.entries(topicCounts)) {
    if (cnt >= 2 && cnt > maxCount) {
      bestTopic = top;
      maxCount = cnt;
    }
  }

  if (!bestTopic) {
    const playerWeakRow = db.prepare(`
      SELECT q.topic_tag, COUNT(*) as fail_count
      FROM player_question_stats pqs
      JOIN questions q ON q.id = pqs.question_id
      WHERE pqs.player_id = ? AND q.subject_id = ? AND pqs.lapses > 0 AND q.topic_tag IS NOT NULL
      GROUP BY q.topic_tag
      ORDER BY fail_count DESC
      LIMIT 1
    `).get(playerId, subjectId);
    if (playerWeakRow && playerWeakRow.topic_tag) {
      bestTopic = playerWeakRow.topic_tag;
    }
  }

  const weakTopic = bestTopic || 'Soal Sulit 🎯';
  const minWeakCount = Math.max(2, Math.floor(count * 0.20));
  let weakAllocated = 0;

  for (const item of combined) {
    const q = item.q;
    if (bestTopic && q.topic_tag === bestTopic) {
      item.isWeak = 1;
      weakAllocated++;
    } else {
      item.isWeak = 0;
    }
  }

  if (weakAllocated < minWeakCount) {
    const candidates = combined.filter(it => !it.isWeak);
    candidates.sort((a, b) => ((b.q.eff_difficulty || b.q.difficulty || 1) - (a.q.eff_difficulty || a.q.difficulty || 1)));
    for (let i = 0; i < candidates.length && weakAllocated < minWeakCount; i++) {
      candidates[i].isWeak = 1;
      weakAllocated++;
    }
  }

  // Monster selection
  let monster = null;
  if (campaignNodeObj) {
    const cMonsters = MONSTERS.filter(m => m.theme === campaignNodeObj.theme);
    const cPool = cMonsters.length > 0 ? cMonsters : MONSTERS;
    if (campaignNodeObj.isBoss) {
      monster = cPool[cPool.length - 1];
    } else {
      const regPool = cPool.slice(0, Math.max(1, cPool.length - 1));
      monster = regPool[(campaignNodeObj.order - 1) % regPool.length];
    }
  } else {
    const themeMonsters = MONSTERS.filter(m => m.theme === subj.monster_theme);
    const pool = themeMonsters.length > 0 ? themeMonsters : MONSTERS;
    monster = pool[Math.floor(Math.random() * pool.length)];
  }

  const bossHp = bStats.bossMaxHp;
  const sessionId = uuid();

  // Load player loadout & snapshot skills
  ensurePlayerSkills(playerId);
  const rawLoadout = getPlayerLoadout(playerId);
  const pSkillRows = db.prepare('SELECT skill_id, level FROM player_skills WHERE player_id=?').all(playerId);
  const skillLevelMap = {};
  for (const r of pSkillRows) skillLevelMap[r.skill_id] = r.level;

  const loadoutData = rawLoadout.filter(Boolean).map(id => {
    const sk = SKILLS.find(x => x.id === id);
    const lvl = skillLevelMap[id] || 1;
    return {
      id,
      name: sk ? sk.name : id,
      icon: sk ? sk.icon : '✨',
      level: lvl,
      costEnergy: sk ? (sk.costEnergy[lvl - 1] ?? sk.costEnergy[0]) : 1,
      maxUses: sk ? (sk.maxUses[lvl - 1] ?? sk.maxUses[0]) : 3
    };
  });
  const clientInstanceId = options.clientInstanceId || uuid();
  const nowIso = new Date().toISOString();

  const energyMax = Progression.energyMaxForLevel(playerLevel);
  const initialEnergy = Math.min(2, energyMax);
  const startPassives = getPlayerPassives(playerId);
  const initialFlags = {
    shield: startPassives.startShield || 0,
    passives: startPassives
  };

  const psp = db.prepare('SELECT pace_factor FROM player_subject_progress WHERE player_id=? AND subject_id=?').get(playerId, subjectId);
  const paceFactor = (psp && typeof psp.pace_factor === 'number') ? psp.pace_factor : 1.0;

  const isBrutal = Boolean(opts.brutal || opts.isBrutal);
  const bfFields = BossFx.startFields({ themeKey: subj.monster_theme, brutal: isBrutal, level: playerLevel });
  if (isBrutal && !bfFields.brutal) {
    const err = new Error('Mode Brutal hanya dapat diakses pemain level 5 ke atas!');
    err.code = 'BRUTAL_LOCKED';
    err.status = 403;
    throw err;
  }

  db.exec('BEGIN IMMEDIATE');
  try {
    const insS = db.prepare(`
      INSERT INTO game_sessions(
        id, player_id, subject_id, monster_id, mode, status,
        total_questions, current_index, boss_max_hp, boss_hp,
        player_max_hp, player_hp, streak, max_streak, correct_count,
        energy, energy_max, loadout_json, uses_json, flags_json, last_ping_at, client_instance_id,
        started_at, created_at, pace_used, weak_topic, campaign_node,
        boss_tier, boss_hits_needed, boss_hit_unit, monster_damage, max_questions, wrong_streak, fatigue_applied,
        boss_element, brutal, boss_fx_json
      ) VALUES(?, ?, ?, ?, ?, 'IN_PROGRESS', ?, 0, ?, ?, 100, 100, 0, 0, 0, ?, ?, ?, '{}', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)
    `);
    insS.run(
      sessionId, playerId, subjectId, monster.id, sessionMode, count, bossHp, bossHp,
      initialEnergy, energyMax, JSON.stringify(loadoutData), JSON.stringify(initialFlags),
      nowIso, clientInstanceId, nowIso, nowIso, paceFactor, weakTopic, campaignNode,
      bossTier, bStats.hitsNeeded, bStats.hitUnit, bStats.monsterDamage,
      (options.maxQuestions || options.max_questions || bStats.maxQuestions),
      bfFields.boss_element, bfFields.brutal, bfFields.boss_fx_json
    );

    const insSQ = db.prepare(`
      INSERT INTO session_questions(
        session_id, question_id, order_index, option_order, timer_state,
        is_review, is_weak, is_bonus, is_mystery, bonus_roll, display_json
      )
      VALUES(?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?, ?)
    `);

    let bonusAssigned = 0;
    let mysteryAssigned = 0;
    const mysteryOptions = ['HEAL_15', 'ENERGY_1', 'COINS_8', 'DAMAGE_1_5'];

    combined.forEach((item, idx) => {
      const q = item.q;
      const qType = getQuestionType(q);
      let typeData = {};
      if (q.type_data_json) {
        try { typeData = JSON.parse(q.type_data_json); } catch (e) {}
      }

      let displayObj = {};
      let optionOrderStr = '[]';

      if (qType === 'MCQ') {
        let opts = [];
        try { opts = JSON.parse(q.options_json); } catch (e) { opts = []; }
        if (opts.length === 0 && Array.isArray(typeData.options)) opts = typeData.options;
        const indices = opts.map((_, i) => i);
        const shuffled = shuffle(indices);
        displayObj = { optionOrder: shuffled };
        optionOrderStr = JSON.stringify(shuffled);
      } else if (qType === 'TRUE_FALSE') {
        displayObj = { type: 'TRUE_FALSE', options: ['Benar', 'Salah'] };
        optionOrderStr = JSON.stringify([0, 1]);
      } else if (qType === 'ORDERING') {
        const items = Array.isArray(typeData.items) ? typeData.items : [];
        const indices = items.map((_, i) => i);
        const shuffled = shuffle(indices);
        displayObj = { displayOrder: shuffled };
        optionOrderStr = JSON.stringify(shuffled);
      } else if (qType === 'MATCHING') {
        const pairs = Array.isArray(typeData.pairs) ? typeData.pairs : [];
        const indices = pairs.map((_, i) => i);
        const shuffled = shuffle(indices);
        displayObj = { rightOrder: shuffled };
        optionOrderStr = JSON.stringify(shuffled);
      } else if (qType === 'SHORT') {
        const isNum = Boolean(typeData.isNumeric || typeData.numeric);
        displayObj = { type: 'SHORT', isNumeric: isNum };
        optionOrderStr = '[]';
      }

      let isBonus = 0;
      let isMystery = 0;
      let bonusRoll = null;

      // Bonus (15%, max 2) & Mystery (10%, max 1), from question index 1 to count-2
      if (idx >= 1 && idx < combined.length - 1) {
        if (bonusAssigned < 2 && Math.random() < 0.15) {
          isBonus = 1;
          bonusAssigned++;
        } else if (mysteryAssigned < 1 && Math.random() < 0.10) {
          isMystery = 1;
          mysteryAssigned++;
          bonusRoll = mysteryOptions[Math.floor(Math.random() * mysteryOptions.length)];
        }
      }

      insSQ.run(
        sessionId,
        q.id,
        idx,
        optionOrderStr,
        item.isReview ? 1 : 0,
        item.isWeak ? 1 : 0,
        isBonus,
        isMystery,
        bonusRoll,
        JSON.stringify(displayObj)
      );
    });

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  const sessionObj = getSession(sessionId, playerId);
  return {
    ok: true,
    sessionId: sessionObj.id,
    mode: sessionObj.mode,
    total: sessionObj.totalQuestions,
    totalQuestions: sessionObj.totalQuestions,
    bossMaxHp: bossHp,
    bossHp: bossHp,
    weakTopic,
    boss: sessionObj.boss,
    energy: { value: initialEnergy, max: energyMax },
    loadout: loadoutData,
    skills: sessionObj.skills,
    session: sessionObj
  };
}

function getSession(sessionId, playerId) {
  const db = getDb();
  const s = db.prepare(`
    SELECT gs.*, sub.name as subject_name, sub.icon as subject_icon, sub.time_limit_sec, sub.monster_theme
    FROM game_sessions gs
    JOIN subjects sub ON sub.id = gs.subject_id
    WHERE gs.id=? AND gs.player_id=?
  `).get(sessionId, playerId);

  if (!s) return null;

  const monster = MONSTERS.find(m => m.id === s.monster_id) || MONSTERS[0];

  let currentQuestion = null;
  let currentSq = null;
  if (s.status === 'IN_PROGRESS') {
    const sq = db.prepare(`
      SELECT sq.*, q.text, q.options_json, q.answer_index, q.image_url, q.image_alt, q.tts, q.time_limit_sec as q_time_limit,
             COALESCE(q.question_type, 'MCQ') as question_type, q.type_data_json
      FROM session_questions sq
      JOIN questions q ON q.id = sq.question_id
      WHERE sq.session_id=? AND sq.order_index=?
    `).get(sessionId, s.current_index);

    if (sq) {
      currentSq = sq;
      const {
        qType,
        displayOpts,
        safeTypeData,
        readBonusSec,
        timeLimitSec
      } = buildSafeDisplayQuestion(sq, s);

      let eliminated = [];
      try { eliminated = JSON.parse(sq.eliminated_json || '[]'); } catch (e) {}

      const idx1 = sq.order_index + 1;
      const f = BossFx.onServeQuestion(s, idx1, timeLimitSec);
      if (f.update) {
        db.prepare('UPDATE game_sessions SET boss_fx_json=?, player_hp=? WHERE id=?').run(f.update.boss_fx_json, f.update.player_hp, s.id);
        s.boss_fx_json = f.update.boss_fx_json;
        s.player_hp = f.update.player_hp;
      }
      const finalTimeLimitSec = f.timeLimitSec;
      const bossFxData = { telegraph: f.telegraph, events: f.events, dotDamage: f.dotDamage, timeMult: f.timeMult };

      currentQuestion = {
        index: sq.order_index,
        total: s.total_questions,
        text: sq.text,
        questionType: qType,
        type: qType,
        options: displayOpts,
        typeData: safeTypeData,
        imageUrl: sq.image_url,
        imageAlt: sq.image_alt,
        tts: Boolean(sq.tts),
        timeLimitSec: finalTimeLimitSec,
        readBonusSec,
        readyAt: sq.ready_at,
        timerState: sq.timer_state,
        eliminated,
        isReview: Boolean(sq.is_review),
        isWeak: Boolean(sq.is_weak),
        isBonus: Boolean(sq.is_bonus),
        isMystery: Boolean(sq.is_mystery),
        bossFx: bossFxData
      };
    }
  }

  let rawLoadout = [];
  try { rawLoadout = JSON.parse(s.loadout_json || '[]'); } catch (e) {}
  let uses = {};
  try { uses = JSON.parse(s.uses_json || '{}'); } catch (e) {}
  let flags = {};
  try { flags = JSON.parse(s.flags_json || '{}'); } catch (e) {}

  return {
    id: s.id,
    mode: s.mode,
    status: s.status,
    endReason: s.end_reason,
    stars: s.stars !== undefined ? s.stars : 0,
    xpEarned: s.xp_earned || 0,
    coinsEarned: s.coins_earned || 0,
    xp_earned: s.xp_earned || 0,
    coins_earned: s.coins_earned || 0,
    subjectId: s.subject_id,
    subject: {
      id: s.subject_id,
      name: s.subject_name,
      icon: s.subject_icon,
      timeLimitSec: s.time_limit_sec,
      monsterTheme: s.monster_theme
    },
    currentIndex: s.current_index,
    totalQuestions: s.total_questions,
    bossMaxHp: s.boss_max_hp,
    bossHp: s.boss_hp,
    playerMaxHp: s.player_max_hp,
    playerHp: s.player_hp,
    streak: s.streak,
    maxStreak: s.max_streak,
    correctCount: s.correct_count,
    criticalCount: s.critical_count || 0,
    energy: { value: s.energy !== undefined ? s.energy : 2, max: (s && s.energy_max) ? s.energy_max : 5 },
    weakTopic: s.weak_topic,
    paceUsed: s.pace_used,
    bossPhase: s.boss_phase || 1,
    pendingEvent: s.pending_event_json ? (() => { try { return JSON.parse(s.pending_event_json); } catch(e) { return null; } })() : null,
    bossTier: s.boss_tier || null,
    bossHitsNeeded: s.boss_hits_needed || null,
    bossHitUnit: s.boss_hit_unit || null,
    monsterDamage: s.monster_damage || null,
    maxQuestions: s.max_questions || null,
    planned: s.total_questions,
    hitsLeft: (s.boss_hp !== undefined && s.boss_hit_unit) ? Math.max(0, Math.ceil(s.boss_hp / s.boss_hit_unit)) : null,
    pity: Boolean((s.wrong_streak || 0) >= 3),
    bossElement: s.boss_element || null,
    brutal: Boolean(s.brutal),
    passives: (flags && flags.passives) ? flags.passives : getPlayerPassives(playerId),
    flags: flags,
    boss: {
      id: monster.id,
      name: monster.name,
      theme: monster.theme,
      maxHp: s.boss_max_hp,
      hp: s.boss_hp,
      phase: s.boss_phase || 1,
      weakTopic: s.weak_topic,
      svg: renderMonsterSvg(monster, { size: 200, tier: s.boss_tier || 'common' }),
      tier: s.boss_tier || null,
      tierLabel: s.boss_tier ? (Progression.BOSS_TIERS[s.boss_tier]?.label || s.boss_tier) : null,
      hitsNeeded: s.boss_hits_needed || null,
      hitsLeft: (s.boss_hp !== undefined && s.boss_hit_unit) ? Math.max(0, Math.ceil(s.boss_hp / s.boss_hit_unit)) : null,
      ...BossFx.publicView(s)
    },
    monster: monster,
    loadout: rawLoadout,
    currentQuestion,
    bossFx: currentQuestion ? currentQuestion.bossFx : null,
    skills: currentSq ? skillAvailability(s, currentSq, playerId) : []
  };
}

function nextQuestion(sessionId, playerId) {
  const db = getDb();
  let s = db.prepare('SELECT * FROM game_sessions WHERE id=? AND player_id=?').get(sessionId, playerId);
  if (!s) throw new Error('SESSION_NOT_FOUND');
  if (s.status !== 'IN_PROGRESS') throw new Error('SESSION_ALREADY_FINISHED');

  const monster = MONSTERS.find(m => m.id === s.monster_id) || MONSTERS[0];

  const currIdx = s.current_index;
  if (currIdx >= s.total_questions) throw new Error('OUT_OF_QUESTIONS');

  const sq = db.prepare(`
    SELECT sq.*, q.text, q.options_json, q.answer_index, q.image_url, q.image_alt, q.tts, q.time_limit_sec as q_time_limit,
           COALESCE(q.question_type, 'MCQ') as question_type, q.type_data_json
    FROM session_questions sq
    JOIN questions q ON q.id = sq.question_id
    WHERE sq.session_id=? AND sq.order_index=?
  `).get(sessionId, currIdx);
  if (!sq) throw new Error('QUESTION_NOT_FOUND');

  if (s.pending_event_json) {
    let pendingEvt = null;
    try { pendingEvt = JSON.parse(s.pending_event_json); } catch (e) {}
    const nowMs = Date.now();
    const createdMs = (pendingEvt && pendingEvt.createdAt) ? new Date(pendingEvt.createdAt).getTime() : nowMs;
    if (pendingEvt && (nowMs - createdMs > EVENTS.decisionTimeoutMs)) {
      try {
        resolveEvent(sessionId, playerId, pendingEvt.id, pendingEvt.safeChoice || 'SKIP');
        s = db.prepare('SELECT * FROM game_sessions WHERE id=? AND player_id=?').get(sessionId, playerId);
      } catch (e) {}
    }
    if (s.pending_event_json) {
      const err = new Error('EVENT_PENDING');
      err.code = 'EVENT_PENDING';
      err.status = 409;
      err.event = pendingEvt;
      throw err;
    }
  }

  // Handle free eliminate from merchant (T-32)
  let nextFlags = {};
  try { nextFlags = JSON.parse(s.flags_json || '{}'); } catch (e) {}
  if (nextFlags.freeEliminateNext && (sq.question_type || 'MCQ') === 'MCQ') {
    let elim = [];
    try { elim = JSON.parse(sq.eliminated_json || '[]'); } catch (e) {}
    if (elim.length === 0) {
      const correctIdx = sq.answer_index;
      let wrongIndices = [];
      const opts = JSON.parse(sq.options_json || '[]');
      for (let i = 0; i < opts.length; i++) {
        if (i !== correctIdx) wrongIndices.push(i);
      }
      if (wrongIndices.length > 0) {
        const toElim = wrongIndices[crypto.randomInt(0, wrongIndices.length)];
        elim.push(toElim);
        db.prepare('UPDATE session_questions SET eliminated_json=? WHERE id=?').run(JSON.stringify(elim), sq.id);
        sq.eliminated_json = JSON.stringify(elim);
      }
    }
    nextFlags.freeEliminateNext = false;
    db.prepare('UPDATE game_sessions SET flags_json=? WHERE id=?').run(JSON.stringify(nextFlags), sessionId);
  }

  const {
    qType,
    displayOpts,
    safeTypeData,
    readBonusSec,
    timeLimitSec
  } = buildSafeDisplayQuestion(sq, s);

  const idx1 = currIdx + 1;
  const f = BossFx.onServeQuestion(s, idx1, timeLimitSec);
  if (f.update) {
    db.prepare('UPDATE game_sessions SET boss_fx_json=?, player_hp=? WHERE id=?').run(f.update.boss_fx_json, f.update.player_hp, sessionId);
    s.boss_fx_json = f.update.boss_fx_json;
    s.player_hp = f.update.player_hp;
  }
  const finalTimeLimitSec = f.timeLimitSec;
  const bossFxData = { telegraph: f.telegraph, events: f.events, dotDamage: f.dotDamage, timeMult: f.timeMult };

  // Boss move logic:
  // Phase 1: move every 4 questions ((currIdx + 1) % 4 === 3)
  // Phase 2: move every 3 questions ((currIdx + 1) % 3 === 0)
  const isBossMove = (s.total_questions >= 5) && (
    s.boss_phase === 2 ? ((currIdx + 1) % 3 === 0) : ((currIdx + 1) % 4 === 3)
  );
  const nowIso = new Date().toISOString();

  let timerState = 'RUNNING';
  let bossMove = null;

  if (isBossMove) {
    timerState = 'WAITING_READY';
    const subj = db.prepare('SELECT monster_theme FROM subjects WHERE id=?').get(s.subject_id);
    const theme = subj ? subj.monster_theme : 'hutan';
    bossMove = BOSS_MOVES[theme] || BOSS_MOVES.hutan;
    db.prepare("UPDATE session_questions SET timer_state='WAITING_READY', read_bonus_sec=?, time_limit_sec=? WHERE id=?")
      .run(readBonusSec, finalTimeLimitSec, sq.id);
  } else {
    timerState = 'RUNNING';
    db.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=COALESCE(ready_at, ?), served_at=COALESCE(served_at, ?), read_bonus_sec=?, time_limit_sec=? WHERE id=?")
      .run(nowIso, nowIso, readBonusSec, finalTimeLimitSec, sq.id);
  }

  return {
    ok: true,
    index: currIdx,
    questionId: sq.question_id,
    questionType: qType,
    type: qType,
    timerState,
    options: displayOpts,
    typeData: safeTypeData,
    bossMove,
    timeLimitSec: finalTimeLimitSec,
    readBonusSec,
    bossHp: s.boss_hp,
    bossMaxHp: s.boss_max_hp,
    playerHp: s.player_hp,
    playerMaxHp: s.player_max_hp,
    bossFx: bossFxData,
    boss: {
      id: monster.id,
      name: monster.name,
      theme: monster.theme,
      maxHp: s.boss_max_hp,
      hp: s.boss_hp,
      phase: s.boss_phase || 1,
      weakTopic: s.weak_topic,
      svg: renderMonsterSvg(monster, { size: 200, tier: s.boss_tier || 'common' }),
      tier: s.boss_tier || null,
      tierLabel: s.boss_tier ? (Progression.BOSS_TIERS[s.boss_tier]?.label || s.boss_tier) : null,
      hitsNeeded: s.boss_hits_needed || null,
      hitsLeft: (s.boss_hp !== undefined && s.boss_hit_unit) ? Math.max(0, Math.ceil(s.boss_hp / s.boss_hit_unit)) : null,
      ...BossFx.publicView(s)
    },
    energy: { value: s.energy !== undefined ? s.energy : 2, max: (s && s.energy_max) ? s.energy_max : 5 },
    skills: skillAvailability(s, sq, playerId),
    question: {
      text: sq.text,
      questionType: qType,
      type: qType,
      options: displayOpts,
      typeData: safeTypeData,
      imageUrl: sq.image_url,
      imageAlt: sq.image_alt,
      tts: Boolean(sq.tts),
      timeLimitSec: finalTimeLimitSec,
      readBonusSec,
      isReview: Boolean(sq.is_review),
      isWeak: Boolean(sq.is_weak),
      isBonus: Boolean(sq.is_bonus),
      isMystery: Boolean(sq.is_mystery),
      bossFx: bossFxData
    }
  };
}

function readyQuestion(sessionId, playerId, questionIdentifier) {
  const db = getDb();
  const s = db.prepare('SELECT * FROM game_sessions WHERE id=? AND player_id=?').get(sessionId, playerId);
  if (!s) throw new Error('SESSION_NOT_FOUND');
  if (s.status !== 'IN_PROGRESS') throw new Error('SESSION_ALREADY_FINISHED');

  const monster = MONSTERS.find(m => m.id === s.monster_id) || MONSTERS[0];

  let sq = null;
  if (questionIdentifier !== undefined && questionIdentifier !== null) {
    sq = db.prepare('SELECT * FROM session_questions WHERE session_id=? AND (question_id=? OR order_index=?)').get(sessionId, questionIdentifier, questionIdentifier);
  } else {
    sq = db.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=?').get(sessionId, s.current_index);
  }
  if (!sq) throw new Error('QUESTION_NOT_FOUND');

  const nowIso = new Date().toISOString();
  const finalReadyAt = sq.ready_at || nowIso;
  db.prepare(`
    UPDATE session_questions
    SET ready_at=COALESCE(ready_at, ?), timer_state='RUNNING', served_at=COALESCE(served_at, ?)
    WHERE id=?
  `).run(nowIso, nowIso, sq.id);

  return {
    ok: true,
    questionId: sq.question_id,
    readyAt: finalReadyAt
  };
}

function skillAvailability(session, sq, playerId) {
  // Mode Fun tidak mengizinkan penggunaan skill
  if (session && session.mode === 'FUN') {
    return [];
  }

  const db = getDb();
  let loadoutSnap = [];
  try { loadoutSnap = JSON.parse(session.loadout_json || '[]'); } catch (e) {}
  if (!loadoutSnap || loadoutSnap.length === 0) {
    loadoutSnap = ['eliminate_one', 'eagle_eye', 'heal'].map(id => ({ id, level: 1 }));
  }

  let uses = {};
  try { uses = JSON.parse(session.uses_json || '{}'); } catch (e) {}

  const mods = session ? BossFx.skillMods(session) : { healMult: 1, comboBonusMult: 1, extraCost: 0 };
  const extraCost = mods.extraCost || 0;

  const result = [];
  for (const item of loadoutSnap) {
    const skillId = typeof item === 'string' ? item : (item && item.id);
    if (!skillId) continue;
    const skillDef = SKILLS.find(x => x.id === skillId);
    if (!skillDef) continue;

    let sLevel = 1;
    if (typeof item === 'object' && item && item.level) {
      sLevel = item.level;
    } else {
      const psRow = db.prepare('SELECT level FROM player_skills WHERE player_id=? AND skill_id=?').get(playerId, skillId);
      if (psRow) sLevel = psRow.level;
    }

    const baseCost = (typeof item === 'object' && item && item.costEnergy !== undefined)
      ? item.costEnergy
      : (skillDef.costEnergy[sLevel - 1] ?? skillDef.costEnergy[0]);
    const cost = baseCost + extraCost;

    const maxUses = (typeof item === 'object' && item && item.maxUses !== undefined)
      ? item.maxUses
      : (skillDef.maxUses[sLevel - 1] ?? skillDef.maxUses[0]);

    const currentUses = uses[skillId] || 0;
    const usesLeft = Math.max(0, maxUses - currentUses);

    let usable = true;
    let reason = null;

    const qType = (sq && sq.question_type) || 'MCQ';

    if (session.status !== 'IN_PROGRESS') {
      usable = false;
      reason = 'WRONG_STATE';
    } else if (session.pending_event || session.pending_event_json || session.pendingEvent || (session.flags_json && (() => { try { return JSON.parse(session.flags_json).pendingEvent; } catch(e) { return false; } })())) {
      usable = false;
      reason = 'EVENT_PENDING';
    } else if (sq && sq.answered_at) {
      usable = false;
      reason = 'WRONG_STATE';
    } else if (sq && sq.timer_state === 'WAITING_READY') {
      usable = false;
      reason = 'WRONG_STATE';
    } else if ((skillId === 'eliminate_one' || skillId === 'eagle_eye') && qType !== 'MCQ') {
      usable = false;
      reason = 'NOT_APPLICABLE';
    } else if (skillId === 'eliminate_one' || skillId === 'eagle_eye') {
      let order = [];
      let displayObj = {};
      try { displayObj = JSON.parse((sq && sq.display_json) || '{}'); } catch(e) {}
      if (displayObj && Array.isArray(displayObj.optionOrder) && displayObj.optionOrder.length > 0) {
        order = displayObj.optionOrder;
      } else if (sq && sq.option_order) {
        try { order = JSON.parse(sq.option_order); } catch (e) {}
      }
      let opts = [];
      try { opts = JSON.parse((sq && sq.options_json) || '[]'); } catch(e) {}
      if (order.length === 0 && opts.length > 0) {
        order = opts.map((_, i) => i);
      }
      const ansIdx = sq ? Number(sq.answer_index) : -1;
      const correctDisplay = (ansIdx >= 0 && order.length > 0) ? order.indexOf(ansIdx) : -1;
      let prevEliminated = [];
      try { prevEliminated = JSON.parse((sq && sq.eliminated_json) || '[]'); } catch (e) {}
      const maxOpts = (order.length > 0) ? order.length : 4;
      const remainingWrongs = Array.from({ length: maxOpts }, (_, idx) => idx).filter(idx => idx !== correctDisplay && !prevEliminated.includes(idx));
      const removable = remainingWrongs.length - 1;
      if (removable <= 0 || correctDisplay === -1) {
        usable = false;
        reason = 'NOTHING_TO_ELIMINATE';
      } else if (usesLeft <= 0) {
        usable = false;
        reason = 'ALREADY_USED';
      } else {
        const curEnergy = (session.energy && typeof session.energy === 'object') ? session.energy.value : (session.energy !== undefined ? session.energy : 0);
        if (curEnergy < cost) {
          usable = false;
          reason = 'NO_ENERGY';
        }
      }
    } else if (skillId === 'power_strike' && sq && sq.power_mult > 1.0) {
      usable = false;
      reason = 'ALREADY_ACTIVE';
    } else if (skillId === 'second_chance' && session && session.flags_json && (() => { try { return JSON.parse(session.flags_json).secondChance; } catch(e) { return false; } })()) {
      usable = false;
      reason = 'ALREADY_ACTIVE';
    } else if (usesLeft <= 0) {
      usable = false;
      reason = 'ALREADY_USED';
    } else {
      const curEnergy = (session.energy && typeof session.energy === 'object') ? session.energy.value : (session.energy !== undefined ? session.energy : 0);
      if (curEnergy < cost) {
        usable = false;
        reason = 'NO_ENERGY';
      }
    }

    result.push({
      id: skillDef.id,
      name: skillDef.name,
      icon: skillDef.icon,
      level: sLevel,
      cost,
      usable,
      reason,
      usesLeft,
      description: typeof skillDef.desc === 'function' ? skillDef.desc(skillDef.value?.[sLevel - 1] ?? skillDef.value?.[0]) : (skillDef.effectDesc || ''),
      effectDesc: skillDef.effectDesc || ''
    });
  }
  return result;
}

function getSkillAvailability(sessionId, playerId) {
  const db = getDb();
  const s = db.prepare('SELECT * FROM game_sessions WHERE id=? AND player_id=?').get(sessionId, playerId);
  if (!s) throw new Error('SESSION_NOT_FOUND');
  const sq = db.prepare(`
    SELECT sq.*, q.text, q.options_json, q.answer_index, COALESCE(q.question_type, 'MCQ') as question_type
    FROM session_questions sq
    JOIN questions q ON q.id = sq.question_id
    WHERE sq.session_id=? AND sq.order_index=?
  `).get(sessionId, s.current_index);
  return skillAvailability(s, sq, playerId);
}

function useSkill(sessionId, playerId, skillId, questionIdentifier) {
  const db = getDb();
  const s = db.prepare('SELECT * FROM game_sessions WHERE id=? AND player_id=?').get(sessionId, playerId);
  if (!s) throw new Error('SESSION_NOT_FOUND');
  if (s.mode === 'FUN') {
    const err = new Error('Skill tidak dapat digunakan di Mode Fun');
    err.code = 'SKILL_UNAVAILABLE';
    err.reason = 'MODE_DISABLED';
    throw err;
  }
  if (s.status !== 'IN_PROGRESS') {
    const err = new Error('SKILL_UNAVAILABLE');
    err.code = 'SKILL_UNAVAILABLE';
    err.reason = 'WRONG_STATE';
    throw err;
  }

  let sq = null;
  if (questionIdentifier !== undefined && questionIdentifier !== null) {
    sq = db.prepare("SELECT sq.*, q.answer_index, q.options_json, COALESCE(q.question_type, 'MCQ') as question_type FROM session_questions sq JOIN questions q ON q.id=sq.question_id WHERE sq.session_id=? AND (sq.question_id=? OR sq.order_index=?)").get(sessionId, questionIdentifier, questionIdentifier);
  } else {
    sq = db.prepare("SELECT sq.*, q.answer_index, q.options_json, COALESCE(q.question_type, 'MCQ') as question_type FROM session_questions sq JOIN questions q ON q.id=sq.question_id WHERE sq.session_id=? AND sq.order_index=?").get(sessionId, s.current_index);
  }
  if (!sq) throw new Error('QUESTION_NOT_FOUND');

  const availList = skillAvailability(s, sq, playerId);
  const avail = availList.find(x => x.id === skillId);
  if (!avail) {
    const err = new Error('SKILL_UNAVAILABLE');
    err.code = 'SKILL_UNAVAILABLE';
    err.reason = 'NOT_IN_LOADOUT';
    throw err;
  }
  if (!avail.usable) {
    const err = new Error('SKILL_UNAVAILABLE');
    err.code = 'SKILL_UNAVAILABLE';
    err.reason = avail.reason;
    throw err;
  }

  const skillDef = SKILLS.find(x => x.id === skillId);
  if (!skillDef) throw new Error('SKILL_NOT_FOUND');

  let loadoutSnap = [];
  try { loadoutSnap = JSON.parse(s.loadout_json || '[]'); } catch (e) {}
  const snapObj = loadoutSnap.find(item => typeof item === 'object' && item && item.id === skillId);
  const psRow = db.prepare('SELECT level FROM player_skills WHERE player_id=? AND skill_id=?').get(playerId, skillId);
  const sLevel = snapObj ? snapObj.level : (psRow ? psRow.level : 1);
  const maxUses = snapObj ? snapObj.maxUses : (skillDef.maxUses[sLevel - 1] ?? skillDef.maxUses[0]);

  let flags = {};
  try { flags = JSON.parse(s.flags_json || '{}'); } catch (e) {}
  if (s.pending_event_json || (flags && flags.pendingEvent)) {
    const err = new Error('SKILL_UNAVAILABLE');
    err.code = 'SKILL_UNAVAILABLE';
    err.reason = 'EVENT_PENDING';
    throw err;
  }

  let uses = {};
  try { uses = JSON.parse(s.uses_json || '{}'); } catch (e) {}
  const currentUses = uses[skillId] || 0;

  let cost = avail.cost;
  const freeUses = (sLevel >= 5 ? 2 : (sLevel >= 3 ? 1 : 0));
  if (skillId === 'eliminate_one' && (currentUses < freeUses || flags.freeEliminateNext)) {
    cost = 0;
    if (flags.freeEliminateNext) flags.freeEliminateNext = false;
  }

  let eliminated = [];
  try { eliminated = JSON.parse(sq.eliminated_json || '[]'); } catch (e) {}

  let healed = 0;
  let shield = 0;
  let extraTimeMs = 0;
  let newEnergy = 0;

  db.exec('BEGIN IMMEDIATE');
  try {
    if (skillId === 'eliminate_one' || skillId === 'eagle_eye') {
      let order = [];
      let displayObj = {};
      try { displayObj = JSON.parse(sq.display_json || '{}'); } catch(e) {}
      if (displayObj && Array.isArray(displayObj.optionOrder) && displayObj.optionOrder.length > 0) {
        order = displayObj.optionOrder;
      } else if (sq.option_order) {
        try { order = JSON.parse(sq.option_order); } catch (e) {}
      }
      let opts = [];
      try { opts = JSON.parse(sq.options_json || '[]'); } catch(e) {}
      if (order.length === 0 && opts.length > 0) {
        order = opts.map((_, i) => i);
      }
      const ansIdx = Number(sq.answer_index);
      const correctDisplay = (ansIdx >= 0 && order.length > 0) ? order.indexOf(ansIdx) : -1;
      if (correctDisplay === -1) {
        const err = new Error('SKILL_UNAVAILABLE');
        err.code = 'SKILL_UNAVAILABLE';
        err.reason = 'CANNOT_DETERMINE_CORRECT_OPTION';
        throw err;
      }
      let prevEliminated = [];
      try { prevEliminated = JSON.parse(sq.eliminated_json || '[]'); } catch (e) {}
      const maxOpts = (order.length > 0) ? order.length : 4;
      const remainingWrongs = Array.from({ length: maxOpts }, (_, idx) => idx).filter(idx => idx !== correctDisplay && !prevEliminated.includes(idx));
      const removable = remainingWrongs.length - 1;
      if (removable <= 0) {
        const err = new Error('SKILL_UNAVAILABLE');
        err.code = 'SKILL_UNAVAILABLE';
        err.reason = 'NOTHING_TO_ELIMINATE';
        throw err;
      }
      const count = (skillId === 'eliminate_one') ? 1 : 2;
      const picked = shuffle(remainingWrongs).slice(0, Math.min(count, removable));
      eliminated = [...new Set([...prevEliminated, ...picked])];
      db.prepare('UPDATE session_questions SET eliminated_json=? WHERE id=?').run(JSON.stringify(eliminated), sq.id);
    } else if (skillId === 'heal') {
      const healAmounts = [25, 35, 45, 55, 65];
      const rawHeal = healAmounts[sLevel - 1] || (25 + (sLevel - 1) * 10);
      const mods = BossFx.skillMods(s);
      healed = Math.floor(rawHeal * (mods.healMult !== undefined ? mods.healMult : 1));
      const newHp = Math.min(s.player_max_hp, s.player_hp + healed);
      db.prepare('UPDATE game_sessions SET player_hp=? WHERE id=?').run(newHp, s.id);
      s.player_hp = newHp;
    } else if (skillId === 'shield') {
      const shieldAmounts = [20, 40, 60, 80, 100];
      shield = shieldAmounts[sLevel - 1] || 20;
      flags.shield = Math.max(flags.shield || 0, shield);
    } else if (skillId === 'power_strike') {
      const mults = [2.0, 2.5, 3.0, 3.5, 4.0];
      const powerMult = mults[sLevel - 1] || 2.0;
      db.prepare('UPDATE session_questions SET power_mult=? WHERE id=?').run(powerMult, sq.id);
    } else if (skillId === 'time_freeze') {
      const freezeSecs = [8, 11, 14, 17, 20];
      extraTimeMs = (freezeSecs[sLevel - 1] || 5) * 1000;
      db.prepare('UPDATE session_questions SET extra_time_ms = extra_time_ms + ? WHERE id=?').run(extraTimeMs, sq.id);
    } else if (skillId === 'second_chance') {
      flags.secondChance = true;
    }

    uses[skillId] = currentUses + 1;
    newEnergy = Math.max(0, s.energy - cost);
    db.prepare('UPDATE game_sessions SET energy=?, uses_json=?, flags_json=? WHERE id=?')
      .run(newEnergy, JSON.stringify(uses), JSON.stringify(flags), s.id);

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  const updatedSession = { ...s, energy: newEnergy, uses_json: JSON.stringify(uses), flags_json: JSON.stringify(flags) };
  const updatedSq = { ...sq, eliminated_json: JSON.stringify(eliminated) };
  const updatedSkills = skillAvailability(updatedSession, updatedSq, playerId);

  return {
    ok: true,
    skillId,
    energy: { value: newEnergy, max: (s && s.energy_max) ? s.energy_max : 5 },
    energyLeft: newEnergy,
    usesLeft: maxUses - (currentUses + 1),
    effects: {
      eliminated,
      extraTimeMs,
      healed,
      shield
    },
    eliminated,
    healed,
    shield,
    flags,
    player: { hp: s.player_hp, maxHp: s.player_max_hp },
    remainingMs: 15000,
    skills: updatedSkills,
    session: getSession(sessionId, playerId)
  };
}

function refillSessionQuestions(db, s, neededCount) {
  if (neededCount <= 0) return 0;

  const existingRows = db.prepare('SELECT question_id, order_index FROM session_questions WHERE session_id=? ORDER BY order_index ASC').all(s.id);
  const existingIds = new Set(existingRows.map(r => r.question_id));
  const lastQId = existingRows[existingRows.length - 1]?.question_id;

  const isFunMode = (s && s.mode === 'FUN');
  const allQ = isFunMode
    ? db.prepare("SELECT * FROM questions WHERE subject_id=? AND is_active=1 AND question_type IN ('TRUE_FALSE', 'ORDERING', 'MATCHING', 'SHORT')").all(s.subject_id)
    : db.prepare("SELECT * FROM questions WHERE subject_id=? AND is_active=1 AND (question_type IS NULL OR question_type = 'MCQ')").all(s.subject_id);
  let unusedPool = allQ.filter(q => !existingIds.has(q.id));

  const countToTake = Math.min(neededCount, unusedPool.length);
  if (countToTake <= 0) return 0;

  // Spaced repetition (SRS <= 30%)
  const dueReviews = isFunMode
    ? db.prepare(`
      SELECT q.*
      FROM player_question_stats pqs
      JOIN questions q ON q.id = pqs.question_id
      WHERE pqs.player_id = ?
        AND q.subject_id = ?
        AND q.is_active = 1
        AND q.question_type IN ('TRUE_FALSE', 'ORDERING', 'MATCHING', 'SHORT')
        AND pqs.mastered = 0
        AND pqs.due_at IS NOT NULL
        AND pqs.due_at <= datetime('now')
      ORDER BY pqs.due_at ASC
    `).all(s.player_id, s.subject_id)
    : db.prepare(`
      SELECT q.*
      FROM player_question_stats pqs
      JOIN questions q ON q.id = pqs.question_id
      WHERE pqs.player_id = ?
        AND q.subject_id = ?
        AND q.is_active = 1
        AND (q.question_type IS NULL OR q.question_type = 'MCQ')
        AND pqs.mastered = 0
        AND pqs.due_at IS NOT NULL
        AND pqs.due_at <= datetime('now')
      ORDER BY pqs.due_at ASC
    `).all(s.player_id, s.subject_id);

  const maxReviews = Math.min(dueReviews.length, Math.max(0, Math.floor(countToTake * (SPACED.maxReviewQuotaPct || 0.30))));
  const reviewCandidates = dueReviews.filter(q => unusedPool.some(u => u.id === q.id));
  const reviewPicked = reviewCandidates.slice(0, maxReviews);
  const reviewQIds = new Set(reviewPicked.map(q => q.id));

  const nonReviewPool = unusedPool.filter(q => !reviewQIds.has(q.id));

  // Komposisi tipe soal TYPE_MIX
  let typeMix = TYPE_MIX;
  const subj = db.prepare('SELECT * FROM subjects WHERE id=?').get(s.subject_id);
  if (subj && subj.type_mix_json) {
    try {
      const parsed = JSON.parse(subj.type_mix_json);
      if (parsed && typeof parsed === 'object') typeMix = Object.assign({}, TYPE_MIX, parsed);
    } catch (e) {}
  }

  // Hitung target kuota tiap tipe untuk refill
  // Mode FUN: 0% MCQ, 4 tipe non-MCQ dibagi rata merata
  const nonMcqTypes = ['TRUE_FALSE', 'ORDERING', 'MATCHING', 'SHORT'];
  let targetPerType;
  if (isFunMode) {
    const base = Math.floor(countToTake / 4);
    const rem = countToTake % 4;
    const shuffledTypes = shuffle([...nonMcqTypes]);
    targetPerType = {
      TRUE_FALSE: base,
      ORDERING: base,
      MATCHING: base,
      SHORT: base,
      MCQ: 0
    };
    for (let i = 0; i < rem; i++) {
      targetPerType[shuffledTypes[i]] += 1;
    }
  } else {
    targetPerType = {
      TRUE_FALSE: 0,
      ORDERING: 0,
      MATCHING: 0,
      SHORT: 0,
      MCQ: countToTake
    };
  }

  const allocatedByType = { MCQ: 0, TRUE_FALSE: 0, ORDERING: 0, MATCHING: 0, SHORT: 0 };
  for (const q of reviewPicked) {
    const t = getQuestionType(q);
    allocatedByType[t] = (allocatedByType[t] || 0) + 1;
  }

  const poolByType = { MCQ: [], TRUE_FALSE: [], ORDERING: [], MATCHING: [], SHORT: [] };
  for (const q of nonReviewPool) {
    const t = getQuestionType(q);
    if (!poolByType[t]) poolByType[t] = [];
    poolByType[t].push(q);
  }
  for (const t of Object.keys(poolByType)) {
    poolByType[t] = shuffle(poolByType[t]);
  }

  const pickedNonReview = [];
  for (const t of nonMcqTypes) {
    const needed = Math.max(0, (targetPerType[t] || 0) - (allocatedByType[t] || 0));
    const takeCount = Math.min(needed, poolByType[t].length);
    const taken = poolByType[t].splice(0, takeCount);
    pickedNonReview.push(...taken);
    allocatedByType[t] = (allocatedByType[t] || 0) + taken.length;
  }

  const remainingSlots = Math.max(0, countToTake - (reviewPicked.length + pickedNonReview.length));
  if (!isFunMode) {
    const mcqTaken = poolByType.MCQ.splice(0, remainingSlots);
    pickedNonReview.push(...mcqTaken);
  } else if (remainingSlots > 0) {
    const leftoverNonMcq = [];
    for (const t of nonMcqTypes) {
      if (poolByType[t]) leftoverNonMcq.push(...poolByType[t]);
    }
    const extraNonMcq = shuffle(leftoverNonMcq).slice(0, remainingSlots);
    pickedNonReview.push(...extraNonMcq);
    const extraIds = new Set(extraNonMcq.map(q => q.id));
    for (const t of nonMcqTypes) {
      if (poolByType[t]) poolByType[t] = poolByType[t].filter(q => !extraIds.has(q.id));
    }
  }

  if (reviewPicked.length + pickedNonReview.length < countToTake) {
    const stillNeeded = countToTake - (reviewPicked.length + pickedNonReview.length);
    const leftover = [];
    const poolKeys = isFunMode ? nonMcqTypes : Object.keys(poolByType);
    for (const t of poolKeys) {
      if (poolByType[t]) leftover.push(...poolByType[t]);
    }
    const extraTaken = shuffle(leftover).slice(0, stillNeeded);
    pickedNonReview.push(...extraTaken);
  }

  const unarranged = [
    ...reviewPicked.map(q => ({ q, isReview: 1 })),
    ...pickedNonReview.map(q => ({ q, isReview: 0 }))
  ];
  let combined = arrangeSessionQuestions(unarranged);

  // Pastikan soal pertama refill tidak sama dengan soal sebelumnya
  if (combined.length > 1 && lastQId && combined[0].q.id === lastQId) {
    const temp = combined[0];
    combined[0] = combined[1];
    combined[1] = temp;
  }

  // Titik lemah (weak topic >= 20%)
  const minWeakCount = Math.max(1, Math.floor(countToTake * 0.20));
  let weakAllocated = 0;
  for (const item of combined) {
    const q = item.q;
    if (s.weak_topic && q.topic_tag === s.weak_topic) {
      item.isWeak = 1;
      weakAllocated++;
    } else {
      item.isWeak = 0;
    }
  }

  if (weakAllocated < minWeakCount) {
    const candidates = combined.filter(it => !it.isWeak);
    candidates.sort((a, b) => ((b.q.eff_difficulty || b.q.difficulty || 1) - (a.q.eff_difficulty || a.q.difficulty || 1)));
    for (let i = 0; i < candidates.length && weakAllocated < minWeakCount; i++) {
      candidates[i].isWeak = 1;
      weakAllocated++;
    }
  }

  const insSQ = db.prepare(`
    INSERT INTO session_questions(
      session_id, question_id, order_index, option_order, timer_state,
      is_review, is_weak, is_bonus, is_mystery, bonus_roll, display_json
    )
    VALUES(?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?, ?)
  `);

  const startIndex = s.total_questions;
  combined.forEach((item, idx) => {
    const q = item.q;
    const qType = getQuestionType(q);
    let typeData = {};
    if (q.type_data_json) {
      try { typeData = JSON.parse(q.type_data_json); } catch (e) {}
    }

    let displayObj = {};
    let optionOrderStr = '[]';

    if (qType === 'MCQ') {
      let opts = [];
      try { opts = JSON.parse(q.options_json); } catch (e) { opts = []; }
      if (opts.length === 0 && Array.isArray(typeData.options)) opts = typeData.options;
      const indices = opts.map((_, i) => i);
      const shuffled = shuffle(indices);
      displayObj = { optionOrder: shuffled };
      optionOrderStr = JSON.stringify(shuffled);
    } else if (qType === 'TRUE_FALSE') {
      displayObj = { type: 'TRUE_FALSE', options: ['Benar', 'Salah'] };
      optionOrderStr = JSON.stringify([0, 1]);
    } else if (qType === 'ORDERING') {
      const items = Array.isArray(typeData.items) ? typeData.items : [];
      const indices = items.map((_, i) => i);
      const shuffled = shuffle(indices);
      displayObj = { displayOrder: shuffled };
      optionOrderStr = JSON.stringify(shuffled);
    } else if (qType === 'MATCHING') {
      const pairs = Array.isArray(typeData.pairs) ? typeData.pairs : [];
      const indices = pairs.map((_, i) => i);
      const shuffled = shuffle(indices);
      displayObj = { rightOrder: shuffled };
      optionOrderStr = JSON.stringify(shuffled);
    } else if (qType === 'SHORT') {
      const isNum = Boolean(typeData.isNumeric || typeData.numeric);
      displayObj = { type: 'SHORT', isNumeric: isNum };
      optionOrderStr = '[]';
    }

    insSQ.run(
      s.id,
      q.id,
      startIndex + idx,
      optionOrderStr,
      item.isReview ? 1 : 0,
      item.isWeak ? 1 : 0,
      0,
      0,
      null,
      JSON.stringify(displayObj)
    );
  });

  return combined.length;
}

function answerQuestion(sessionId, playerId, questionIdentifier, chosenDisplayIndex) {
  const db = getDb();
  let eventObj = null;
  let isFirstClear = false;
  let firstClearCoins = 0;
  let chapterCompleted = false;
  let chapterItem = null;
  let chapterComic = null;
  const s = db.prepare(`
    SELECT gs.*, sub.time_limit_sec, sub.monster_theme
    FROM game_sessions gs
    JOIN subjects sub ON sub.id = gs.subject_id
    WHERE gs.id=? AND gs.player_id=?
  `).get(sessionId, playerId);

  if (!s) throw new Error('SESSION_NOT_FOUND');
  if (s.status !== 'IN_PROGRESS') throw new Error('SESSION_ALREADY_FINISHED');

  const monster = MONSTERS.find(m => m.id === s.monster_id) || MONSTERS[0];

  let sq = null;
  if (questionIdentifier !== undefined && questionIdentifier !== null) {
    // 1. Jika questionIdentifier sama dengan current_index, prioritaskan order_index
    if (questionIdentifier === s.current_index) {
      sq = db.prepare(`
        SELECT sq.*, q.answer_index, q.explanation, q.time_limit_sec as q_time_limit, q.eff_difficulty,
               COALESCE(q.question_type, 'MCQ') as question_type, q.type_data_json, sq.display_json
        FROM session_questions sq
        JOIN questions q ON q.id = sq.question_id
        WHERE sq.session_id=? AND sq.order_index=?
      `).get(sessionId, questionIdentifier);
    }

    // 2. Jika bukan current_index atau tidak ketemu, cari by question_id
    if (!sq) {
      sq = db.prepare(`
        SELECT sq.*, q.answer_index, q.explanation, q.time_limit_sec as q_time_limit, q.eff_difficulty,
               COALESCE(q.question_type, 'MCQ') as question_type, q.type_data_json, sq.display_json
        FROM session_questions sq
        JOIN questions q ON q.id = sq.question_id
        WHERE sq.session_id=? AND sq.question_id=?
      `).get(sessionId, questionIdentifier);
    }

    // 3. Fallback: cari by order_index
    if (!sq) {
      sq = db.prepare(`
        SELECT sq.*, q.answer_index, q.explanation, q.time_limit_sec as q_time_limit, q.eff_difficulty,
               COALESCE(q.question_type, 'MCQ') as question_type, q.type_data_json, sq.display_json
        FROM session_questions sq
        JOIN questions q ON q.id = sq.question_id
        WHERE sq.session_id=? AND sq.order_index=?
      `).get(sessionId, questionIdentifier);
    }
  } else {
    sq = db.prepare(`
      SELECT sq.*, q.answer_index, q.explanation, q.time_limit_sec as q_time_limit, q.eff_difficulty,
             COALESCE(q.question_type, 'MCQ') as question_type, q.type_data_json, sq.display_json
      FROM session_questions sq
      JOIN questions q ON q.id = sq.question_id
      WHERE sq.session_id=? AND sq.order_index=?
    `).get(sessionId, s.current_index);
  }

  if (!sq) throw new Error('QUESTION_NOT_FOUND');
  if (sq.answered_at) {
    // Pemulihan idempoten: jika soal sudah tercatat terjawab (misal akibat double tap atau network retry),
    // jangan throw 400 ALREADY_ANSWERED yang membuat pemain terkunci di halaman!
    const latestSession = getSession(sessionId, playerId);
    const latestPlayer = getPlayerById(playerId);
    return {
      ok: true,
      alreadyAnswered: true,
      outcome: sq.outcome || 'NORMAL',
      isCorrect: sq.outcome !== 'WRONG' && sq.outcome !== 'TIMEOUT',
      notice: 'Soal telah dijawab sebelumnya',
      damageToBoss: 0,
      damageToPlayer: 0,
      session: latestSession,
      player: latestPlayer,
      explanation: sq.explanation || ''
    };
  }

  const qType = (sq.question_type || 'MCQ').toUpperCase();
  let eliminated = [];
  try { eliminated = JSON.parse(sq.eliminated_json || '[]'); } catch (e) {}
  if (qType === 'MCQ' && eliminated.includes(chosenDisplayIndex)) {
    throw new Error('OPTION_ELIMINATED');
  }

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  // Timer calculation
  const readyMs = sq.ready_at ? new Date(sq.ready_at).getTime() : nowMs;
  const elapsedMs = Math.max(0, nowMs - readyMs);
  const timeLimitSec = sq.time_limit_sec || sq.q_time_limit || s.time_limit_sec || 20;
  const allowedMs = (timeLimitSec * 1000) + (sq.extra_time_ms || 0) + GAME.graceMs;

  let displayJson = {};
  try { displayJson = JSON.parse(sq.display_json || '{}'); } catch (e) {}
  let typeData = {};
  try { typeData = JSON.parse(sq.type_data_json || '{}'); } catch (e) {}

  let userChoice = chosenDisplayIndex;
  if (userChoice && typeof userChoice === 'object' && !Array.isArray(userChoice)) {
    if (userChoice.timedOut) {
      userChoice = null;
    } else if (userChoice.choice !== undefined) {
      userChoice = userChoice.choice;
    } else if (userChoice.order !== undefined) {
      userChoice = userChoice.order;
    } else if (userChoice.pairs !== undefined) {
      userChoice = userChoice.pairs;
    } else if (userChoice.text !== undefined) {
      userChoice = userChoice.text;
    }
  }

  let outcome = 'WRONG';
  let isCorrect = false;
  let notice = null;
  let reveal = {};
  let correctDisplayIndex = -1;

  // Check last ping / heartbeat gap
  const lastSeenMs = Math.max(
    s.last_ping_at ? new Date(s.last_ping_at).getTime() : 0,
    s.last_activity_at ? new Date(s.last_activity_at).getTime() : 0,
    readyMs
  );
  const gapAwayMs = Math.max(0, nowMs - lastSeenMs);

  if (elapsedMs > allowedMs || userChoice === null || userChoice === undefined) {
    if (gapAwayMs >= 120000) {
      outcome = 'TIMEOUT_AWAY';
      notice = 'Kamu pergi cukup lama, jadi soal tadi dilewati.';
    } else {
      outcome = 'TIMEOUT';
    }
    if (qType === 'MCQ') {
      let order = [];
      try { order = JSON.parse(sq.option_order || '[]'); } catch (e) {}
      correctDisplayIndex = order.indexOf(sq.answer_index);
      reveal = { correctDisplayIndex };
    } else if (qType === 'TRUE_FALSE') {
      const targetBool = typeData.correctAnswer !== undefined ? Boolean(typeData.correctAnswer) : (sq.answer_index === 0);
      correctDisplayIndex = targetBool ? 0 : 1;
      reveal = { correctDisplayIndex, correctAnswer: targetBool };
    } else if (qType === 'ORDERING') {
      const displayOrder = displayJson.displayOrder || [];
      const correctOrder = Array.from({ length: displayOrder.length }, (_, i) => displayOrder.indexOf(i));
      reveal = { correctOrder };
    } else if (qType === 'MATCHING') {
      const rightOrder = displayJson.rightOrder || [];
      const correctPairs = Array.from({ length: rightOrder.length }, (_, i) => rightOrder.indexOf(i));
      reveal = { correctPairs };
    } else if (qType === 'SHORT') {
      const spec = {
        accept: typeData.accepted || typeData.answers || (typeData.accept ? (Array.isArray(typeData.accept) ? typeData.accept : [typeData.accept]) : []),
        numeric: typeData.numeric || (typeData.isNumeric ? { value: parseNumberId(typeData.accepted ? typeData.accepted[0] : 0), tolerance: typeData.tolerance || 0.001 } : null)
      };
      const correctText = (spec.numeric && spec.numeric.value !== undefined)
        ? String(spec.numeric.value)
        : (spec.accept && spec.accept[0] ? String(spec.accept[0]) : '');
      reveal = { correctText };
    }
  } else {
    if (qType === 'MCQ') {
      let order = [];
      try { order = JSON.parse(sq.option_order || '[]'); } catch (e) {}
      correctDisplayIndex = order.indexOf(sq.answer_index);
      isCorrect = (Number(userChoice) === correctDisplayIndex);
      reveal = { correctDisplayIndex };
    } else if (qType === 'TRUE_FALSE') {
      const targetBool = typeData.correctAnswer !== undefined ? Boolean(typeData.correctAnswer) : (sq.answer_index === 0);
      correctDisplayIndex = targetBool ? 0 : 1;
      let userBool = false;
      if (userChoice === true || userChoice === 'true' || userChoice === 0 || userChoice === '0' || userChoice === 'Benar' || userChoice === 'benar') {
        userBool = true;
      }
      isCorrect = (userBool === targetBool);
      reveal = { correctDisplayIndex, correctAnswer: targetBool };
    } else if (qType === 'ORDERING') {
      const displayOrder = displayJson.displayOrder || [];
      const userOrder = Array.isArray(userChoice) ? userChoice.map(Number) : [];
      const gradeRes = gradeOrdering(displayOrder, userOrder);
      isCorrect = Boolean(gradeRes && (gradeRes.correct ?? gradeRes));
      const correctOrder = Array.from({ length: displayOrder.length }, (_, i) => displayOrder.indexOf(i));
      reveal = { correctOrder };
    } else if (qType === 'MATCHING') {
      const rightOrder = displayJson.rightOrder || [];
      const userPairs = Array.isArray(userChoice) ? userChoice.map(Number) : userChoice;
      const gradeRes = gradeMatching(rightOrder, userPairs);
      isCorrect = Boolean(gradeRes && (gradeRes.correct ?? gradeRes));
      const correctPairs = Array.from({ length: rightOrder.length }, (_, i) => rightOrder.indexOf(i));
      reveal = { correctPairs };
    } else if (qType === 'SHORT') {
      const accList = typeData.accepted || typeData.answers || (typeData.accept ? (Array.isArray(typeData.accept) ? typeData.accept : [typeData.accept]) : []);
      const spec = {
        accepted: accList,
        accept: accList,
        isNumeric: Boolean(typeData.isNumeric || typeData.numeric),
        numeric: typeData.numeric || (typeData.isNumeric ? { value: parseNumberId(accList[0] || 0), tolerance: typeData.tolerance || 0.001 } : null)
      };
      const gradeRes = gradeShort(String(userChoice), spec);
      isCorrect = Boolean(gradeRes && (gradeRes.correct ?? gradeRes));
      const correctText = (spec.numeric && spec.numeric.value !== undefined)
        ? String(spec.numeric.value)
        : (accList && accList[0] ? String(accList[0]) : '');
      reveal = { correctText };
    }

    if (isCorrect) {
      const effectiveLimitMs = (timeLimitSec * 1000) + (sq.extra_time_ms || 0);
      const ratio = elapsedMs / effectiveLimitMs;
      if (ratio <= GAME.speed.critical.maxRatio) outcome = 'CRITICAL';
      else if (ratio <= GAME.speed.normal.maxRatio) outcome = 'NORMAL';
      else outcome = 'SLOW';
    } else {
      outcome = 'WRONG';
    }
  }

  // Damage formula
  let baseBossDamage = 0;
  let rawPlayerDamage = 0;
  if (outcome === 'CRITICAL') baseBossDamage = GAME.speed.critical.bossDamage;
  else if (outcome === 'NORMAL') baseBossDamage = GAME.speed.normal.bossDamage;
  else if (outcome === 'SLOW') { baseBossDamage = GAME.speed.slow.bossDamage; rawPlayerDamage = GAME.speed.slow.playerDamage; }
  else if (outcome === 'WRONG') rawPlayerDamage = GAME.wrongPlayerDamage;
  else if (outcome === 'TIMEOUT') rawPlayerDamage = GAME.timeoutPlayerDamage;
  else if (outcome === 'TIMEOUT_AWAY') rawPlayerDamage = 0;

  // Streak & combo
  let streak = s.streak;
  let comboBonus = 0;
  let healAmount = 0;
  if (isCorrect) {
    streak++;
    if (streak >= 5) comboBonus = 4;
    else if (streak >= 3) comboBonus = 2;
    if (streak % GAME.healEveryStreak === 0) healAmount = GAME.healAmount;
  } else {
    if (outcome === 'TIMEOUT_AWAY') {
      streak = 0;
    } else {
      let flags = {};
      try { flags = JSON.parse(s.flags_json || '{}'); } catch (e) {}
      if (flags.comboKeeper) {
        flags.comboKeeper = false;
        db.prepare('UPDATE game_sessions SET flags_json=? WHERE id=?').run(JSON.stringify(flags), s.id);
      } else {
        streak = 0;
      }
    }
  }

  // Modifiers & Multipliers: Weak, Bonus (x1.5), Mystery (B / T-31)
  const isWeak = Boolean(sq.is_weak);
  const isBonus = Boolean(sq.is_bonus);
  const isMystery = Boolean(sq.is_mystery);
  const weakMult = isWeak ? 2.0 : 1.0;
  let bonusMult = isBonus ? 1.5 : 1.0;
  let mysteryReward = null;
  let mysteryEnergy = 0;

  if (isCorrect && isMystery && sq.bonus_roll) {
    mysteryReward = sq.bonus_roll;
    if (mysteryReward === 'HEAL_15') {
      healAmount += 15;
    } else if (mysteryReward === 'ENERGY_1') {
      mysteryEnergy = 1;
    } else if (mysteryReward === 'DAMAGE_1_5') {
      bonusMult *= 1.5;
    }
  }

  const powerMult = sq.power_mult || 1.0;
  const newStreak = streak;
  const newMaxStreak = Math.max(s.max_streak, newStreak);
  const newCorrectCount = (s.correct_count || 0) + (isCorrect ? 1 : 0);
  const newCriticalCount = (s.critical_count || 0) + (outcome === 'CRITICAL' ? 1 : 0);

  let newWrongStreak = s.wrong_streak || 0;
  if (isCorrect) {
    newWrongStreak = 0;
  } else if (outcome !== 'TIMEOUT_AWAY') {
    newWrongStreak = (s.wrong_streak || 0) + 1;
  }

  let bossDamage = 0;
  let isPityActive = false;
  let newBossHp = s.boss_hp;
  let bossEvents = [];
  let shieldMult = 1.0;
  let energySiphoned = 0;

  if (s.boss_tier) {
    if (isCorrect) {
      rawPlayerDamage = 0;
      const effectivePowerMult = powerMult * (isBonus ? 1.5 : 1.0) * (mysteryReward === 'DAMAGE_1_5' ? 1.5 : 1.0);
      const mods = BossFx.skillMods(s);
      const hitRes = Progression.hitDamage({
        comboStreak: newStreak,
        powerMult: effectivePowerMult,
        wrongStreak: s.wrong_streak || 0,
        comboBonusMult: mods.comboBonusMult
      });
      const cap35Pct = Math.ceil(s.boss_max_hp * 0.35);
      bossDamage = Math.min(hitRes.damage, cap35Pct);
      isPityActive = Boolean(hitRes.pity);
      if (s.total_questions && s.total_questions < Progression.MIN_TOTAL_HITS) {
        newBossHp = Math.max(0, s.boss_hp - bossDamage);
      } else {
        newBossHp = Progression.applyBossDamage(s.boss_hp, bossDamage, newCorrectCount);
      }
    } else {
      bossDamage = 0;
      isPityActive = false;
      if (outcome === 'TIMEOUT_AWAY') {
        rawPlayerDamage = 0;
      } else if (BossFx.active(s)) {
        const idx1 = (sq.order_index || 0) + 1;
        const w = BossFx.onWrongAnswer(s, idx1, s.energy);
        rawPlayerDamage = w.damage;
        shieldMult = w.shieldMult || 1.0;
        energySiphoned = w.energyLoss || 0;
        bossEvents = w.events || [];
        if (w.update && w.update.boss_fx_json) {
          s.boss_fx_json = w.update.boss_fx_json;
        }
      } else {
        rawPlayerDamage = s.monster_damage || Math.ceil(s.player_max_hp / 6);
      }
      let bossHeal = 0;
      if (s.monster_theme === 'laut') bossHeal = 8;
      if (s.brutal && s.boss_element) {
        const regenPct = s.boss_tier === 'legend' ? 0.05 : 0.03;
        bossHeal = Math.max(bossHeal, Math.round(s.boss_max_hp * regenPct));
      }
      newBossHp = Math.min(s.boss_max_hp, s.boss_hp + bossHeal);
    }
  } else {
    // Old session logic
    const rawBossDamage = isCorrect ? Math.max(1, Math.round((baseBossDamage + comboBonus) * powerMult * weakMult * bonusMult)) : 0;
    const cap35Pct = Math.ceil(s.boss_max_hp * 0.35);
    bossDamage = Math.min(rawBossDamage, cap35Pct);
    let bossHeal = 0;
    if (!isCorrect && s.monster_theme === 'laut') bossHeal = 8;
    newBossHp = Math.max(0, Math.min(s.boss_max_hp, s.boss_hp - bossDamage + bossHeal));
  }

  // Passives Resolution & Shield absorbing player damage
  let flags = {};
  try { flags = JSON.parse(s.flags_json || '{}'); } catch (e) {}
  const passives = flags.passives || getPlayerPassives(playerId);

  let isDodged = false;
  let isPassiveCrit = false;
  const triggeredPassives = [];

  if (isCorrect) {
    if (passives.critChance && Math.random() < passives.critChance) {
      isPassiveCrit = true;
      bossDamage = Math.round(bossDamage * (passives.critMultiplier || 1.5));
      notice = notice ? (notice + ' · CRITICAL HIT! ⚡') : 'CRITICAL HIT! ⚡';
      triggeredPassives.push({ id: 'crit', name: 'Critical Hit!', icon: '⚡', desc: `Serangan Kritis x${passives.critMultiplier || 1.5}` });
    }
    if (passives.correctDamageBonus) {
      bossDamage += passives.correctDamageBonus;
    }
    if (passives.bossDamageBonusPercent) {
      bossDamage = Math.round(bossDamage * (1 + passives.bossDamageBonusPercent));
    }
    if (passives.comboDamageBonus && newStreak >= (passives.comboDamageBonus.minCombo || 3)) {
      bossDamage += passives.comboDamageBonus.bonus;
      notice = notice ? (notice + ` · Combo Strike! 💥 (+${passives.comboDamageBonus.bonus} DMG)`) : `Combo Strike! 💥 (+${passives.comboDamageBonus.bonus} DMG)`;
      triggeredPassives.push({ id: 'comboDamageBonus', name: 'Combo Strike!', icon: '💥', desc: `Serangan Combo +${passives.comboDamageBonus.bonus} DMG` });
    }
    if (passives.comboDamagePercent && newStreak > 0) {
      bossDamage = Math.round(bossDamage * (1 + newStreak * passives.comboDamagePercent));
      const extraPct = Math.round(newStreak * passives.comboDamagePercent * 100);
      notice = notice ? (notice + ` · Raja Combo! 👑 (+${extraPct}% DMG)`) : `Raja Combo! 👑 (+${extraPct}% DMG)`;
      triggeredPassives.push({ id: 'comboDamagePercent', name: 'Raja Combo!', icon: '👑', desc: `Bonus Combo +${extraPct}% DMG (${newStreak}× Streak)` });
    }
    if (passives.dragonBreathChance && Math.random() < passives.dragonBreathChance) {
      const dDmg = passives.dragonBreathDamage || 20;
      bossDamage += dDmg;
      notice = notice ? (notice + ' · Semburan Naga! 🔥 (+' + dDmg + ' DMG)') : 'Semburan Naga! 🔥 (+' + dDmg + ' DMG)';
      triggeredPassives.push({ id: 'dragon', name: 'Semburan Naga!', icon: '🔥', desc: `Semburan Api Naga +${dDmg} DMG` });
    }
    if (passives.healOnCorrect) {
      healAmount += passives.healOnCorrect;
      triggeredPassives.push({ id: 'healCorrect', name: 'Pemulihan Suci', icon: '💖', desc: `Regen HP +${passives.healOnCorrect}` });
    }
    if (passives.comboRegen && newStreak > 0 && newStreak % passives.comboRegen.combo === 0) {
      healAmount += passives.comboRegen.hp;
      notice = notice ? (notice + ' · Regen HP! 💖') : 'Regen HP! 💖';
      triggeredPassives.push({ id: 'comboRegen', name: 'Regenerasi Combo', icon: '💖', desc: `Regen HP +${passives.comboRegen.hp}` });
    }
    if (passives.comboEnergyChance && newStreak > 0 && newStreak % passives.comboEnergyChance.combo === 0) {
      if (Math.random() < passives.comboEnergyChance.chance) {
        mysteryEnergy += 1;
        notice = notice ? (notice + ' · Curi Energi! 🦊 (+1 ⚡)') : 'Curi Energi! 🦊 (+1 ⚡)';
        triggeredPassives.push({ id: 'comboEnergy', name: 'Curi Energi', icon: '🦊', desc: '+1 Energi ⚡' });
      }
    }
    if (s.total_questions && s.total_questions < Progression.MIN_TOTAL_HITS) {
      newBossHp = Math.max(0, s.boss_hp - bossDamage);
    } else {
      newBossHp = Progression.applyBossDamage(s.boss_hp, bossDamage, newCorrectCount);
    }
  } else {
    // WRONG / TIMEOUT
    if (passives.dodgeRate && Math.random() < passives.dodgeRate) {
      isDodged = true;
      rawPlayerDamage = 0;
      notice = notice ? (notice + ' · HINDARAN! 💨') : 'HINDARAN! 💨';
      triggeredPassives.push({ id: 'dodge', name: 'Refleks Hindaran!', icon: '💨', desc: 'Serangan boss luput (0 DMG)' });
    } else {
      if (passives.damageReduction && rawPlayerDamage > 0) {
        rawPlayerDamage = Math.max(1, rawPlayerDamage - passives.damageReduction);
        triggeredPassives.push({ id: 'damageReduction', name: 'Zirah Baja', icon: '🛡️', desc: `Damage terserap -${passives.damageReduction}` });
      }
      if (passives.streakProtectChance && Math.random() < passives.streakProtectChance) {
        newStreak = s.streak; // retain streak!
        notice = notice ? (notice + ' · Proteksi Combo! 🦉') : 'Proteksi Combo! 🦉';
        triggeredPassives.push({ id: 'streakProtect', name: 'Proteksi Combo!', icon: '🦉', desc: 'Combo terselamatkan' });
      }
    }
  }

  let shieldLeft = flags.shield || 0;
  let finalPlayerDamage = rawPlayerDamage;
  if (rawPlayerDamage > 0 && shieldLeft > 0) {
    const effShield = Math.floor(shieldLeft * shieldMult);
    const absorbed = Math.min(effShield, rawPlayerDamage);
    finalPlayerDamage = rawPlayerDamage - absorbed;
    shieldLeft = Math.max(0, shieldLeft - absorbed);
    flags.shield = shieldLeft;
  }

  let newPlayerHp = Math.min(s.player_max_hp, Math.max(0, s.player_hp - finalPlayerDamage + healAmount));
  if (newPlayerHp <= 0 && flags.secondChance) {
    flags.secondChance = false;
    newPlayerHp = Math.round(s.player_max_hp * 0.25);
    notice = notice ? (notice + ' · Kesempatan Kedua!') : 'Kesempatan Kedua!';
  } else if (newPlayerHp <= 0 && passives.lastStand && !flags.lastStandUsed) {
    flags.lastStandUsed = true;
    newPlayerHp = 1;
    notice = notice ? (notice + ' · Darah Terakhir! 🩸 (1 HP)') : 'Darah Terakhir! 🩸 (Bertahan dengan 1 HP)';
    triggeredPassives.push({ id: 'lastStand', name: 'Darah Terakhir!', icon: '🩸', desc: 'Bertahan hidup dengan 1 HP' });
  }

  // Energy update
  const energyMax = (s && s.energy_max) ? s.energy_max : 5;
  let energyDelta = 0;
  if (outcome === 'CRITICAL') energyDelta = 2;
  else if (outcome === 'NORMAL' || outcome === 'SLOW') energyDelta = 1;
  const correctGain = isCorrect ? Progression.energyFromCorrect(newCorrectCount) : 0;
  let curEnergy = s.energy;
  if (energySiphoned > 0) {
    curEnergy = Math.max(0, curEnergy - energySiphoned);
  }
  let newEnergy = Progression.gainEnergy(curEnergy, energyDelta + mysteryEnergy + correctGain, energyMax);

  // Boss Phase 2 Transition Check (C.1 / T-20)
  const currentBossPhase = s.boss_phase || 1;
  const calculatedPhase = bossPhase(newBossHp, s.boss_max_hp);
  let phaseChanged = false;
  let newBossPhase = currentBossPhase;

  if (currentBossPhase === 1 && calculatedPhase === 2) {
    newBossPhase = 2;
    phaseChanged = true;
    newEnergy = Progression.gainEnergy(newEnergy, 1, energyMax); // +1 ⚡ Semangat!
  }

  // Fatigue adjustment (D.3 / T-31): dipanggil sekali saat Fase Marah dimulai
  let fatigueApplied = Boolean(s.fatigue_applied);
  let fatigueTriggeredNow = false;
  if (s.boss_tier && !fatigueApplied && calculatedPhase === 2) {
    const totalAnswered = (s.current_index || 0) + 1;
    const fRes = Progression.fatigueAdjust({
      bossHp: newBossHp,
      correctCount: newCorrectCount,
      answeredCount: totalAnswered
    });
    if (fRes.applied) {
      newBossHp = fRes.bossHp;
      fatigueTriggeredNow = true;
      fatigueApplied = true;
    } else if (currentBossPhase === 1) {
      fatigueApplied = true;
    }
  }

  if (fatigueTriggeredNow) {
    notice = notice ? (notice + ' · Boss mulai kelelahan! 😮‍💨') : 'Boss mulai kelelahan! 😮‍💨';
  }
  if (isPityActive) {
    notice = notice ? (notice + ' · 💪 Serangan Balik!') : '💪 Serangan Balik!';
  }

  // Dynamic session refill check (D.4 / T-32)
  let refillAdded = 0;
  const currentAnswered = sq.order_index + 1;
  const remainingBeforeRefill = s.total_questions - currentAnswered;
  const maxQ = s.max_questions || 50;

  const canRefillNow = (
    Boolean(s.boss_tier) &&
    newBossHp > 0 &&
    newPlayerHp > 0 &&
    remainingBeforeRefill <= Progression.REFILL.whenRemainingAtMost &&
    s.total_questions < maxQ
  );
  const toRefill = canRefillNow ? Math.min(Progression.REFILL.batch || 5, maxQ - s.total_questions) : 0;

  // Check end conditions
  let newStatus = 'IN_PROGRESS';
  let endReason = null;
  const isLastQuestion = (toRefill === 0) && (currentAnswered >= s.total_questions);

  if (newBossHp <= 0) {
    newStatus = 'WON';
    endReason = 'BOSS_DEFEATED';
  } else if (newPlayerHp <= 0) {
    newStatus = 'LOST';
    endReason = 'PLAYER_DEAD';
  } else if (isLastQuestion) {
    if (newBossHp <= 0) {
      newStatus = 'WON';
      endReason = 'BOSS_DEFEATED';
    } else {
      newStatus = 'LOST';
      endReason = 'OUT_OF_QUESTIONS';
    }
  }

  // Drops calculation
  let droppedCoins = 0;
  let droppedItem = null;
  let capReached = false;
  const pRow = db.prepare('SELECT coins, coins_earned_today, last_active_date FROM players WHERE id=?').get(playerId);
  const today = new Date().toISOString().slice(0, 10);
  let earnedToday = (pRow && pRow.last_active_date === today) ? (pRow.coins_earned_today || 0) : 0;

  if (isCorrect) {
    const diff = sq.eff_difficulty || 1;
    const dropCfg = ECONOMY.answerDrop;
    let coinChance = dropCfg.coinChance[diff] || 0.25;
    const range = dropCfg.coinRange[diff] || [1, 2];

    if (isBonus) {
      coinChance = Math.min(1.0, coinChance * 2);
    }
    if (mysteryReward === 'COINS_8') {
      droppedCoins += 8;
    }
    if (Math.random() < coinChance) {
      let minCoins = isBonus ? range[0] * 2 : range[0];
      let maxCoins = isBonus ? range[1] * 2 : range[1];
      let coins = minCoins + Math.floor(Math.random() * (maxCoins - minCoins + 1));
      if (outcome === 'CRITICAL') coins = Math.round(coins * dropCfg.criticalMult);

      // Sistem koin Mode Fun tetap dapat namun lebih sedikit (50%)
      if (s.mode === 'FUN') {
        coins = Math.max(1, Math.floor(coins * 0.5));
      }
      droppedCoins = coins;
    }

    if (droppedCoins > 0) {
      if (s.boss_tier || s.brutal) {
        const m = BossFx.rewardMult(s, Progression.rewardMult(s.boss_tier || 'common'));
        droppedCoins = Math.max(1, Math.round(droppedCoins * m.coin));
      }
      if (earnedToday + droppedCoins > ECONOMY.dailyCoinCap) {
        droppedCoins = Math.max(0, ECONOMY.dailyCoinCap - earnedToday);
        capReached = true;
      }
    }
  }

  let finalCoinBalance = pRow ? pRow.coins : 0;

  db.exec('BEGIN IMMEDIATE');
  try {
    // 0. Dynamic refill if needed
    if (toRefill > 0) {
      refillAdded = refillSessionQuestions(db, s, toRefill);
      s.total_questions += refillAdded;
    }

    // 1. Update session_question
    db.prepare(`
      UPDATE session_questions
      SET answered_at=?, chosen_display=?, outcome=?, elapsed_ms=?, reveal_json=?
      WHERE id=?
    `).run(nowIso, typeof userChoice === 'number' ? userChoice : -1, outcome, elapsedMs, JSON.stringify(reveal), sq.id);

    // 2. Apply drop coins if any
    if (droppedCoins > 0) {
      const dropReason = 'ANSWER_DROP' + (s.brutal ? ':BRUTAL' : '');
      finalCoinBalance = applyCoins(db, playerId, droppedCoins, dropReason);
      earnedToday += droppedCoins;
      db.prepare('UPDATE players SET coins_earned_today=?, last_active_date=? WHERE id=?')
        .run(earnedToday, today, playerId);
    }

    // 3. Post-game awards if finished
    let stars = 0;
    let xpEarned = 0;
    let bossCoinsEarned = 0;

    if (newStatus !== 'IN_PROGRESS') {
      const accuracy = newCorrectCount / s.total_questions;
      if (newStatus === 'WON') {
        if (accuracy >= 0.9) stars = 3;
        else if (accuracy >= 0.7) stars = 2;
        else stars = 1;

        const baseRewardCoins = (monster.rewardCoins || 10);
        if (newBossPhase === 2 || s.boss_phase === 2) {
          bossCoinsEarned = Math.round(baseRewardCoins * 1.15); // +15% bonus coins
        } else {
          bossCoinsEarned = baseRewardCoins;
        }
        // Sistem koin Mode Fun tetap dapat namun lebih sedikit (50%)
        if (s.mode === 'FUN') {
          bossCoinsEarned = Math.max(1, Math.round(bossCoinsEarned * 0.5));
        }
        xpEarned = stars * 25 + newStreak * 2;
      } else {
        if (endReason === 'OUT_OF_QUESTIONS') {
          const damageRatio = s.boss_max_hp > 0 ? (1 - (newBossHp / s.boss_max_hp)) : 0;
          if (damageRatio >= 0.8) stars = 2;
          else if (damageRatio >= 0.5) stars = 1;
          else stars = 0;
        } else {
          stars = 0;
        }
        xpEarned = newCorrectCount * 5;
      }

      // Bonus XP untuk soal review yang benar (T-12)
      const reviewCorrectCount = db.prepare(`
        SELECT COUNT(*) as c
        FROM session_questions
        WHERE session_id=? AND is_review=1 AND outcome IN ('CRITICAL', 'NORMAL', 'SLOW')
      `).get(sessionId).c;
      xpEarned += reviewCorrectCount * (SPACED.bonusXp || 5);

      // Apply tier & brutal reward multipliers (C.3 / T-33 / T-14)
      if (newStatus === 'WON' && s.boss_tier && Progression.BOSS_TIERS[s.boss_tier]) {
        const rMult = BossFx.rewardMult(s, Progression.rewardMult(s.boss_tier));
        bossCoinsEarned = Math.round(bossCoinsEarned * rMult.coin);
        xpEarned = Math.round(xpEarned * rMult.xp);
      } else if (s.brutal) {
        const rMult = BossFx.rewardMult(s, Progression.rewardMult(s.boss_tier || 'common'));
        bossCoinsEarned = Math.round(bossCoinsEarned * rMult.coin);
        xpEarned = Math.round(xpEarned * rMult.xp);
      }

      if (passives && passives.coinBonus > 0 && bossCoinsEarned > 0) {
        bossCoinsEarned = Math.round(bossCoinsEarned * (1 + passives.coinBonus));
      }
      if (passives && passives.xpBonus > 0 && xpEarned > 0) {
        xpEarned = Math.round(xpEarned * (1 + passives.xpBonus));
      }
      if (bossCoinsEarned > 0) {
        const defeatReason = 'BOSS_DEFEAT' + (s.brutal ? ':BRUTAL' : '');
        finalCoinBalance = applyCoins(db, playerId, bossCoinsEarned, defeatReason);
      }

      if (s.campaign_node) {
        const nodeInfo = parseNodeKey(s.campaign_node);
        if (nodeInfo) {
          const accPct = Math.round(accuracy * 100);
          const existingPcn = db.prepare('SELECT * FROM player_campaign_nodes WHERE player_id=? AND node_key=?').get(playerId, s.campaign_node);
          if (!existingPcn) {
            isFirstClear = true;
            firstClearCoins = CAMPAIGN_CFG.nodeFirstClearCoins(nodeInfo.chapter);
            if (s.brutal) {
              const bMult = BossSkills.brutalRewardMult(s.brutal);
              firstClearCoins = Math.round(firstClearCoins * bMult);
            }
            const clearReason = 'CAMPAIGN_NODE_FIRST_CLEAR' + (s.brutal ? ':BRUTAL' : '');
            applyCoins(db, playerId, firstClearCoins, clearReason);
            xpEarned += firstClearCoins;
            db.prepare(`
              INSERT INTO player_campaign_nodes(player_id, node_key, stars, best_accuracy, cleared_at)
              VALUES(?, ?, ?, ?, ?)
            `).run(playerId, s.campaign_node, stars, accPct, nowIso);

            if (nodeInfo.node === 4) {
              chapterCompleted = true;
              const roll = crypto.randomInt(0, 100);
              let rarity = 'RARE';
              if (roll >= 90) rarity = 'LEGENDARY';
              else if (roll >= 55) rarity = 'EPIC';
              const rarityItems = ITEMS.filter(x => x.rarity === rarity && !x.isStarter);
              if (rarityItems.length > 0) {
                chapterItem = rarityItems[crypto.randomInt(0, rarityItems.length)];
                db.prepare('INSERT INTO player_items(player_id, item_id, is_equipped) VALUES(?,?,0)').run(playerId, chapterItem.id);
              }
              const chTheme = monster.theme || s.monster_theme || 'hutan';
              if (STORY && STORY[chTheme] && STORY[chTheme].comic) {
                chapterComic = STORY[chTheme].comic;
              }
            }
          } else {
            db.prepare(`
              UPDATE player_campaign_nodes
              SET stars = MAX(stars, ?), best_accuracy = MAX(best_accuracy, ?)
              WHERE player_id=? AND node_key=?
            `).run(stars, accPct, playerId, s.campaign_node);
          }
        }
      }

      // Dynamic Time Pacing update (T-13 / I.2)
      const sqHistory = db.prepare(`
        SELECT elapsed_ms, time_limit_sec, outcome
        FROM session_questions
        WHERE session_id=? AND answered_at IS NOT NULL
      `).all(sessionId);

      let timeouts = 0;
      const ratios = [];
      let totalAnswered = sqHistory.length;

      sqHistory.forEach(sqRow => {
        if (sqRow.outcome === 'TIMEOUT' || sqRow.outcome === 'TIMEOUT_AWAY') {
          timeouts++;
        }
        const totalAllowedMs = (sqRow.time_limit_sec || 20) * 1000;
        if (sqRow.elapsed_ms != null && totalAllowedMs > 0) {
          ratios.push(sqRow.elapsed_ms / totalAllowedMs);
        }
      });

      ratios.sort((a, b) => a - b);
      const medianRatio = ratios.length > 0 ? ratios[Math.floor(ratios.length / 2)] : 0.5;
      const sessionAccuracy = totalAnswered > 0 ? (newCorrectCount / totalAnswered) : 0;

      const currentPsp = db.prepare('SELECT pace_factor FROM player_subject_progress WHERE player_id=? AND subject_id=?').get(playerId, s.subject_id);
      const currentPace = currentPsp ? (currentPsp.pace_factor || 1.0) : 1.0;
      const nextPace = updatePace(currentPace, { timeouts, medianRatio, accuracy: sessionAccuracy, totalAnswered });

      db.prepare(`
        INSERT INTO player_subject_progress(player_id, subject_id, sessions_played, wins, best_stars, total_answered, total_correct, best_streak, last_played_at, pace_factor)
        VALUES(?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(player_id, subject_id) DO UPDATE SET
          sessions_played = sessions_played + 1,
          wins = wins + excluded.wins,
          best_stars = MAX(best_stars, excluded.best_stars),
          total_answered = total_answered + excluded.total_answered,
          total_correct = total_correct + excluded.total_correct,
          best_streak = MAX(best_streak, excluded.best_streak),
          last_played_at = excluded.last_played_at,
          pace_factor = excluded.pace_factor
      `).run(playerId, s.subject_id, newStatus === 'WON' ? 1 : 0, stars, s.total_questions, newCorrectCount, newMaxStreak, nowIso, nextPace);

      db.prepare(`
        INSERT INTO player_monsters(player_id, monster_id, encounters, defeats, best_streak, best_stars, last_at)
        VALUES(?, ?, 1, ?, ?, ?, ?)
        ON CONFLICT(player_id, monster_id) DO UPDATE SET
          encounters = encounters + 1,
          defeats = defeats + excluded.defeats,
          best_streak = MAX(best_streak, excluded.best_streak),
          best_stars = MAX(best_stars, excluded.best_stars),
          last_at = excluded.last_at
      `).run(playerId, s.monster_id, newStatus === 'WON' ? 1 : 0, newMaxStreak, stars, nowIso);

      db.prepare('UPDATE players SET xp = xp + ? WHERE id=?').run(xpEarned, playerId);
    }

    // 10. Jika sesi belum selesai -> lempar kejutan (D)
    eventObj = null;
    const canRollEvent = (
      newStatus === 'IN_PROGRESS' &&
      s.mode !== 'PRACTICE' &&
      sq.order_index > 0 &&
      sq.order_index < (s.total_questions - 1) &&
      (flags.eventsCount || 0) < EVENTS.maxPerSession &&
      flags.lastEventOrderIndex !== (sq.order_index - 1)
    );

    if (canRollEvent) {
      const roll100 = crypto.randomInt(0, 100);
      if (roll100 < Math.round(EVENTS.chance * 100)) {
        const typeRoll = crypto.randomInt(0, 100);
        let eventType = 'TREASURE';
        if (typeRoll < 40) {
          eventType = 'TREASURE';
        } else if (typeRoll < 75) {
          eventType = 'MERCHANT';
        } else {
          eventType = 'TRAP';
        }

        const eventId = 'evt_' + crypto.randomUUID().slice(0, 8);
        const createdAt = nowIso;

        if (eventType === 'TREASURE') {
          eventObj = {
            id: eventId,
            type: 'TREASURE',
            title: '🎁 Peti Harta!',
            description: 'Kamu menemukan peti harta karun misterius di tengah perjalanan!',
            createdAt,
            safeChoice: 'OPEN'
          };
        } else if (eventType === 'MERCHANT') {
          const allDeals = [...EVENTS.merchant.deals];
          for (let i = allDeals.length - 1; i > 0; i--) {
            const j = crypto.randomInt(0, i + 1);
            [allDeals[i], allDeals[j]] = [allDeals[j], allDeals[i]];
          }
          const offers = allDeals.slice(0, 2);
          eventObj = {
            id: eventId,
            type: 'MERCHANT',
            title: '🧙 Pedagang Keliling',
            description: 'Seorang pedagang keliling menawarkan barang berharga!',
            offers,
            createdAt,
            safeChoice: 'SKIP'
          };
        } else if (eventType === 'TRAP') {
          eventObj = {
            id: eventId,
            type: 'TRAP',
            title: '🪤 Peti Mencurigakan',
            description: 'Sebuah peti mencurigakan tergeletak. Buka atau lewati dengan aman?',
            createdAt,
            safeChoice: 'SKIP'
          };
        }

        flags.pendingEvent = true;
      }
    }

    // 4. Update session
    const nextIdx = (newStatus === 'IN_PROGRESS' ? sq.order_index + 1 : sq.order_index);
    const pendingJsonToSave = eventObj ? JSON.stringify(eventObj) : (newStatus !== 'IN_PROGRESS' ? null : (s.pending_event_json || null));
    db.prepare(`
      UPDATE game_sessions
      SET boss_hp=?, player_hp=?, streak=?, max_streak=?,
          correct_count=?, critical_count=?, current_index=?,
          energy=?, flags_json=?, status=?, end_reason=?,
          stars=?, xp_earned=?, coins_earned = coins_earned + ?,
          boss_phase=?, pending_event_json=?,
          wrong_streak=?, fatigue_applied=?,
          total_questions=?, boss_fx_json=?,
          finished_at = CASE WHEN ? IN ('WON','LOST') THEN ? ELSE finished_at END
      WHERE id=?
    `).run(
      newBossHp, newPlayerHp, newStreak, newMaxStreak,
      newCorrectCount, newCriticalCount, nextIdx,
      newEnergy, JSON.stringify(flags), newStatus, endReason,
      stars, xpEarned, droppedCoins + bossCoinsEarned,
      newBossPhase, pendingJsonToSave,
      newWrongStreak, fatigueApplied ? 1 : 0,
      s.total_questions, s.boss_fx_json || null,
      newStatus, nowIso, sessionId
    );

    // 5. Update question stats with Spaced Repetition (T-10)
    const existingPqs = db.prepare(`
      SELECT box, lapses FROM player_question_stats WHERE player_id=? AND question_id=?
    `).get(playerId, sq.question_id);
    const spaced = afterAnswer(existingPqs || { box: 0, lapses: 0 }, isCorrect, new Date(nowIso));

    db.prepare(`
      INSERT INTO player_question_stats(player_id, question_id, seen, correct, last_seen_at, box, lapses, due_at, mastered)
      VALUES(?, ?, 1, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(player_id, question_id) DO UPDATE SET
        seen = seen + 1,
        correct = correct + excluded.correct,
        last_seen_at = excluded.last_seen_at,
        box = excluded.box,
        lapses = excluded.lapses,
        due_at = excluded.due_at,
        mastered = excluded.mastered
    `).run(playerId, sq.question_id, isCorrect ? 1 : 0, nowIso, spaced.box, spaced.lapses, spaced.due_at, spaced.mastered);

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  const updatedSession = getSession(sessionId, playerId);
  const updatedPlayer = getPlayerById(playerId);

  return {
    ok: true,
    outcome,
    isCorrect,
    notice,
    triggeredPassives,
    dodged: isDodged,
    isCrit: isPassiveCrit,
    shield: flags.shield || 0,
    isWeak,
    isBonus,
    isMystery,
    mysteryReward,
    weakHit: Boolean(isCorrect && isWeak),
    weakMultiplier: isWeak ? 2.0 : 1.0,
    damageToBoss: bossDamage,
    damageToPlayer: finalPlayerDamage,
    comboBonus,
    healAmount,
    energy: { value: newEnergy, max: energyMax },
    pity: Boolean(isPityActive),
    fatigue: { applied: Boolean(fatigueTriggeredNow) },
    refill: { added: refillAdded },
    drops: {
      coins: droppedCoins,
      item: droppedItem,
      capReached,
      coinBalance: finalCoinBalance
    },
    phaseChanged,
    boss: {
      hp: newBossHp,
      maxHp: s.boss_max_hp,
      phase: newBossPhase,
      tier: s.boss_tier || null,
      tierLabel: s.boss_tier ? (Progression.BOSS_TIERS[s.boss_tier]?.label || s.boss_tier) : null,
      hitsNeeded: s.boss_hits_needed || null,
      hitsLeft: (newBossHp !== undefined && s.boss_hit_unit) ? Math.max(0, Math.ceil(newBossHp / s.boss_hit_unit)) : null
    },
    bossFx: {
      events: bossEvents
    },
    player: { hp: newPlayerHp, maxHp: s.player_max_hp },
    streak: newStreak,
    qType,
    reveal,
    correctDisplayIndex: correctDisplayIndex >= 0 ? correctDisplayIndex : (reveal.correctDisplayIndex !== undefined ? reveal.correctDisplayIndex : -1),
    explanation: sq.explanation || '',
    event: eventObj,
    session: updatedSession,
    player: updatedPlayer,
    rewards: updatedSession.status !== 'IN_PROGRESS' ? {
      coins: (updatedSession.coins_earned || 0) + firstClearCoins,
      xp: updatedSession.xp_earned || 0,
      stars: updatedSession.stars || 0,
      items: chapterItem ? [chapterItem] : [],
      firstClear: Boolean(isFirstClear),
      firstClearCoins,
      chapterCompleted: Boolean(chapterCompleted),
      chapterComic: chapterComic || null,
      badges: chapterCompleted ? [`chapter_${s.subject_id}_${parseNodeKey(s.campaign_node)?.chapter || 1}`] : [],
      firstDefeat: false,
      newMonster: false
    } : null
  };
}

function resolveEvent(sessionId, playerId, eventId, choice) {
  const db = getDb();
  let s = db.prepare('SELECT * FROM game_sessions WHERE id=? AND player_id=?').get(sessionId, playerId);
  if (!s) throw new Error('SESSION_NOT_FOUND');
  if (s.status !== 'IN_PROGRESS') throw new Error('SESSION_ALREADY_FINISHED');
  if (!s.pending_event_json) throw new Error('NO_PENDING_EVENT');

  let evt = null;
  try { evt = JSON.parse(s.pending_event_json); } catch (e) { throw new Error('MALFORMED_EVENT'); }
  if (eventId && evt.id !== eventId) throw new Error('INVALID_EVENT_ID');

  const pRow = db.prepare('SELECT * FROM players WHERE id=?').get(playerId);
  if (!pRow) throw new Error('PLAYER_NOT_FOUND');

  const nowMs = Date.now();
  const createdMs = evt.createdAt ? new Date(evt.createdAt).getTime() : nowMs;
  let finalChoice = choice;
  if (!finalChoice || finalChoice === 'TIMEOUT' || (nowMs - createdMs > EVENTS.decisionTimeoutMs)) {
    finalChoice = evt.safeChoice || 'SKIP';
  }

  let flags = {};
  try { flags = JSON.parse(s.flags_json || '{}'); } catch (e) {}

  let result = null;
  let newPlayerHp = s.player_hp;
  let newEnergy = s.energy !== undefined ? s.energy : 2;

  db.exec('BEGIN IMMEDIATE');
  try {
    if (evt.type === 'TREASURE') {
      const roll = crypto.randomInt(0, 100);
      if (roll < 50) {
        const baseCoins = crypto.randomInt(EVENTS.treasure.coins[0], EVENTS.treasure.coins[1] + 1);
        let coins = baseCoins;
        if (s.boss_tier || s.brutal) {
          const rMult = BossFx.rewardMult(s, Progression.rewardMult(s.boss_tier || 'common'));
          coins = Math.max(1, Math.round(coins * rMult.coin));
        }
        const today = new Date().toISOString().slice(0, 10);
        const earnedToday = (pRow.last_active_date === today) ? (pRow.coins_earned_today || 0) : 0;
        if (earnedToday + coins > ECONOMY.dailyCoinCap) {
          coins = Math.max(0, ECONOMY.dailyCoinCap - earnedToday);
        }
        if (coins > 0) {
          db.prepare('UPDATE players SET coins_earned_today = coins_earned_today + ? WHERE id=?').run(coins, playerId);
          applyCoins(db, playerId, coins, 'EVENT_TREASURE' + (s.brutal ? ':BRUTAL' : ''));
        }
        result = {
          type: 'TREASURE',
          outcome: 'COINS',
          coins,
          message: `Kamu menemukan ${coins} Koin di dalam peti! 🪙`
        };
      } else if (roll < 75) {
        newEnergy = Math.min(5, newEnergy + 1);
        result = {
          type: 'TREASURE',
          outcome: 'ENERGY',
          energy: 1,
          message: 'Kamu mendapatkan +1 ⚡ Semangat dari peti!'
        };
      } else {
        newPlayerHp = Math.min(s.player_max_hp, newPlayerHp + 10);
        result = {
          type: 'TREASURE',
          outcome: 'HEAL',
          heal: 10,
          message: 'Kamu meminum ramuan di dalam peti: +10 HP! 💖'
        };
      }
    } else if (evt.type === 'MERCHANT') {
      if (finalChoice === 'SKIP' || finalChoice === 'NONE') {
        result = {
          type: 'MERCHANT',
          outcome: 'SKIPPED',
          message: 'Kamu pamit dan melewati pedagang keliling.'
        };
      } else {
        const deal = (evt.offers || EVENTS.merchant.deals).find(d => d.id === finalChoice);
        if (!deal) throw new Error('INVALID_DEAL_CHOICE');

        applyCoins(db, playerId, -deal.price, 'EVENT_MERCHANT');

        if (deal.effect === 'HEAL_20') {
          newPlayerHp = Math.min(s.player_max_hp, newPlayerHp + 20);
          result = {
            type: 'MERCHANT',
            outcome: 'BOUGHT',
            dealId: deal.id,
            message: 'Berhasil membeli ramuan pulih +20 HP! 💖'
          };
        } else if (deal.effect === 'ENERGY_2') {
          newEnergy = Math.min(5, newEnergy + 2);
          result = {
            type: 'MERCHANT',
            outcome: 'BOUGHT',
            dealId: deal.id,
            message: 'Berhasil membeli kristal +2 ⚡ Semangat!'
          };
        } else if (deal.effect === 'FREE_ELIMINATE_NEXT') {
          flags.freeEliminateNext = true;
          result = {
            type: 'MERCHANT',
            outcome: 'BOUGHT',
            dealId: deal.id,
            message: 'Berhasil membeli 1× Coret Satu gratis untuk soal berikutnya!'
          };
        }
      }
    } else if (evt.type === 'TRAP') {
      if (finalChoice === 'SKIP') {
        result = {
          type: 'TRAP',
          outcome: 'SKIPPED',
          message: 'Kamu memilih aman dan melewati peti mencurigakan.'
        };
      } else {
        const roll = crypto.randomInt(0, 100);
        if (roll < Math.round(EVENTS.trap.openWinChance * 100)) {
          let coins = EVENTS.trap.winCoins;
          if (s.boss_tier || s.brutal) {
            const rMult = BossFx.rewardMult(s, Progression.rewardMult(s.boss_tier || 'common'));
            coins = Math.max(1, Math.round(coins * rMult.coin));
          }
          const today = new Date().toISOString().slice(0, 10);
          const earnedToday = (pRow.last_active_date === today) ? (pRow.coins_earned_today || 0) : 0;
          if (earnedToday + coins > ECONOMY.dailyCoinCap) {
            coins = Math.max(0, ECONOMY.dailyCoinCap - earnedToday);
          }
          if (coins > 0) {
            db.prepare('UPDATE players SET coins_earned_today = coins_earned_today + ? WHERE id=?').run(coins, playerId);
            applyCoins(db, playerId, coins, 'EVENT_TRAP' + (s.brutal ? ':BRUTAL' : ''));
          }
          result = {
            type: 'TRAP',
            outcome: 'WIN',
            coins,
            message: `Beruntung! Peti berisi ${coins} Koin emas! 🪙`
          };
        } else {
          const damage = EVENTS.trap.loseHp;
          newPlayerHp = Math.max(EVENTS.trap.minHpAfter, newPlayerHp - damage);
          result = {
            type: 'TRAP',
            outcome: 'TRAPPED',
            damage,
            message: `Jebakan pegas aktif! Kamu terkena duri (−${damage} HP)! 🪤`
          };
        }
      }
    }

    flags.eventsCount = (flags.eventsCount || 0) + 1;
    flags.lastEventOrderIndex = s.current_index;
    flags.pendingEvent = false;

    db.prepare(`
      UPDATE game_sessions
      SET player_hp=?, energy=?, flags_json=?, pending_event_json=NULL
      WHERE id=?
    `).run(newPlayerHp, newEnergy, JSON.stringify(flags), sessionId);

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  const updatedPlayer = getPlayerById(playerId);
  return {
    ok: true,
    result,
    player: {
      hp: newPlayerHp,
      maxHp: s.player_max_hp,
      coins: updatedPlayer ? updatedPlayer.coins : 0
    },
    energy: {
      value: newEnergy,
      max: 5
    },
    coins: updatedPlayer ? updatedPlayer.coins : 0
  };
}

function abandonSession(sessionId, playerId) {
  const db = getDb();
  db.prepare(`
    UPDATE game_sessions
    SET status='ABANDONED', end_reason='MANUAL_ABANDON', finished_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id=? AND player_id=? AND status='IN_PROGRESS'
  `).run(sessionId, playerId);
  return getSession(sessionId, playerId);
}

/* ── Session Reconciliation & Resume ── */
function reconcileSession(sessionId, playerId) {
  const db = getDb();
  const s = db.prepare("SELECT * FROM game_sessions WHERE id=? AND player_id=?").get(sessionId, playerId);
  if (!s) return null;
  if (s.status !== 'IN_PROGRESS') return getSession(sessionId, playerId);

  const nowMs = Date.now();
  const lastActive = s.last_ping_at ? new Date(s.last_ping_at).getTime() : new Date(s.started_at).getTime();
  if (nowMs - lastActive > 48 * 3600 * 1000) {
    db.prepare("UPDATE game_sessions SET status='ABANDONED', end_reason='IDLE_48H', finished_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").run(sessionId);
    return getSession(sessionId, playerId);
  }

  const sq = db.prepare("SELECT sq.*, q.time_limit_sec as q_time_limit FROM session_questions sq JOIN questions q ON q.id=sq.question_id WHERE sq.session_id=? AND sq.order_index=?").get(sessionId, s.current_index);
  if (!sq || sq.answered_at) return getSession(sessionId, playerId);

  if (sq.timer_state === 'WAITING_READY') {
    const servedMs = sq.served_at ? new Date(sq.served_at).getTime() : nowMs;
    if (nowMs - servedMs > 120000) {
      answerQuestion(sessionId, playerId, sq.order_index, null);
    }
  } else if (sq.timer_state === 'RUNNING') {
    const readyMs = sq.ready_at ? new Date(sq.ready_at).getTime() : nowMs;
    const timeLimitSec = sq.q_time_limit || 20;
    const allowedMs = (timeLimitSec * 1000) + (sq.extra_time_ms || 0) + GAME.graceMs;
    if (nowMs > readyMs + allowedMs) {
      answerQuestion(sessionId, playerId, sq.order_index, null);
    }
  }

  return getSession(sessionId, playerId);
}

function getActiveSession(playerId) {
  const db = getDb();
  const row = db.prepare("SELECT id, started_at, last_ping_at FROM game_sessions WHERE player_id=? AND status='IN_PROGRESS' ORDER BY started_at DESC LIMIT 1").get(playerId);
  if (!row) return { active: null, pendingResults: [] };

  const refDate = row.last_ping_at || row.started_at;
  const ageMs = Date.now() - new Date(refDate).getTime();
  if (ageMs > 48 * 3600 * 1000) {
    db.prepare("UPDATE game_sessions SET status='ABANDONED', end_reason='EXPIRED_48H', finished_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?").run(row.id);
    return { active: null, pendingResults: [] };
  }

  const s = reconcileSession(row.id, playerId);
  if (!s || s.status !== 'IN_PROGRESS') {
    return { active: null, pendingResults: [] };
  }

  let remainingMs = null;
  let questionState = 'BETWEEN';
  if (s.currentQuestion) {
    if (s.currentQuestion.timerState === 'RUNNING' && s.currentQuestion.readyAt) {
      questionState = 'RUNNING';
      const readyMs = new Date(s.currentQuestion.readyAt).getTime();
      const limitMs = (s.currentQuestion.timeLimitSec * 1000);
      remainingMs = Math.max(0, (readyMs + limitMs + GAME.graceMs) - Date.now());
    } else if (s.currentQuestion.timerState === 'WAITING_READY') {
      questionState = 'WAITING_READY';
    }
  }

  return {
    active: {
      sessionId: s.id,
      mode: 'BATTLE',
      subject: s.subject,
      index: s.currentIndex,
      total: s.totalQuestions,
      boss: s.boss,
      player: { hp: s.playerHp, maxHp: s.playerMaxHp },
      energy: s.energy,
      questionState,
      remainingMs,
      lastActivityAt: row.last_ping_at || row.started_at,
      session: s,
    },
    pendingResults: []
  };
}

function heartbeatSession(sessionId, playerId, questionIndex, clientInstanceId) {
  const db = getDb();
  const s = db.prepare("SELECT * FROM game_sessions WHERE id=? AND player_id=?").get(sessionId, playerId);
  if (!s) throw new Error('SESSION_NOT_FOUND');
  if (s.status !== 'IN_PROGRESS') {
    return { ok: true, remainingMs: 0, serverNow: Date.now(), status: s.status };
  }

  const nowIso = new Date().toISOString();
  db.prepare("UPDATE game_sessions SET last_ping_at=?, last_activity_at=? WHERE id=?").run(nowIso, nowIso, sessionId);

  const sq = db.prepare("SELECT sq.*, q.time_limit_sec as q_time_limit FROM session_questions sq JOIN questions q ON q.id=sq.question_id WHERE sq.session_id=? AND sq.order_index=?").get(sessionId, s.current_index);
  let remainingMs = null;
  if (sq && sq.timer_state === 'RUNNING' && sq.ready_at && !sq.answered_at) {
    const readyMs = new Date(sq.ready_at).getTime();
    const limitMs = ((sq.q_time_limit || 20) * 1000) + (sq.extra_time_ms || 0) + GAME.graceMs;
    remainingMs = Math.max(0, (readyMs + limitMs) - Date.now());
  }

  return {
    ok: true,
    remainingMs,
    serverNow: Date.now()
  };
}

function resumeSession(sessionId, playerId, clientInstanceId) {
  const db = getDb();
  const s = db.prepare("SELECT * FROM game_sessions WHERE id=? AND player_id=?").get(sessionId, playerId);
  if (!s) throw new Error('SESSION_NOT_FOUND');

  const nowIso = new Date().toISOString();
  db.prepare("UPDATE game_sessions SET last_ping_at=?, last_activity_at=?, client_instance_id=? WHERE id=?").run(nowIso, nowIso, clientInstanceId || s.client_instance_id, sessionId);

  if (s.pending_event_json) {
    let evt = null;
    try { evt = JSON.parse(s.pending_event_json); } catch (e) {}
    if (evt) {
      const nowMs = Date.now();
      const createdMs = evt.createdAt ? new Date(evt.createdAt).getTime() : nowMs;
      if (nowMs - createdMs > EVENTS.decisionTimeoutMs) {
        try {
          resolveEvent(sessionId, playerId, evt.id, evt.safeChoice || 'SKIP');
        } catch (e) {}
      }
    }
  }

  const reconciled = reconcileSession(sessionId, playerId);
  let remainingMs = null;
  if (reconciled && reconciled.currentQuestion && reconciled.currentQuestion.timerState === 'RUNNING' && reconciled.currentQuestion.readyAt) {
    const readyMs = new Date(reconciled.currentQuestion.readyAt).getTime();
    const limitMs = (reconciled.currentQuestion.timeLimitSec * 1000) + GAME.graceMs;
    remainingMs = Math.max(0, (readyMs + limitMs) - Date.now());
  }

  const sq = reconciled ? db.prepare("SELECT sq.*, q.text, q.options_json, q.answer_index, q.question_type, q.type_data_json, q.topic_tag FROM session_questions sq JOIN questions q ON q.id=sq.question_id WHERE sq.session_id=? AND sq.order_index=?").get(sessionId, reconciled.currentIndex) : null;
  const skills = (reconciled && sq) ? skillAvailability(reconciled, sq, playerId) : [];

  return {
    ok: true,
    state: reconciled ? reconciled.status : 'UNKNOWN',
    session: reconciled,
    current: reconciled ? reconciled.currentQuestion : null,
    skills,
    remainingMs,
    serverNow: Date.now()
  };
}

/* ── Idempotency Store ── */
function getIdempotency(playerId, key) {
  if (!key || !playerId) return null;
  const db = getDb();
  const row = db.prepare("SELECT status_code, response_json FROM idempotency_keys WHERE player_id=? AND idempotency_key=?").get(playerId, key);
  if (!row) return null;
  try {
    return {
      statusCode: row.status_code,
      response: JSON.parse(row.response_json)
    };
  } catch (e) {
    return null;
  }
}

function saveIdempotency(playerId, key, endpoint, statusCode, responseData) {
  if (!key || !playerId) return;
  const db = getDb();
  try {
    const jsonStr = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);
    db.prepare(`
      INSERT INTO idempotency_keys(player_id, idempotency_key, endpoint, status_code, response_json)
      VALUES(?, ?, ?, ?, ?)
      ON CONFLICT(player_id, idempotency_key) DO UPDATE SET
        status_code=excluded.status_code,
        response_json=excluded.response_json
    `).run(playerId, key, endpoint, statusCode, jsonStr);
  } catch (e) {
    console.error('Failed to save idempotency:', e);
  }
}

/* ── Mode Cerita / Kampanye (E.1) ── */
function getCampaign(playerId, subjectId) {
  const db = getDb();
  const subj = db.prepare('SELECT id, name, monster_theme FROM subjects WHERE id=?').get(subjectId);
  if (!subj) throw new Error('SUBJECT_NOT_FOUND');

  const rows = db.prepare('SELECT node_key, stars, best_accuracy, cleared_at FROM player_campaign_nodes WHERE player_id=?').all(playerId);
  const progressMap = {};
  for (const r of rows) {
    progressMap[r.node_key] = r;
  }

  const camp = buildCampaign(subjectId, subj.monster_theme, progressMap);
  return {
    ok: true,
    subject: {
      id: subj.id,
      name: subj.name,
      monsterTheme: subj.monster_theme
    },
    chapters: camp.chapters
  };
}

/* ── Dex ── */
function getDex(playerId) {
  const db = getDb();
  const caughtRows = playerId
    ? db.prepare('SELECT * FROM player_monsters WHERE player_id=?').all(playerId)
    : [];
  const map = new Map();
  for (const r of caughtRows) map.set(r.monster_id, r);

  return MONSTERS.map(m => {
    const stat = map.get(m.id);
    const mod10 = (m.id - 1) % 10;
    const tier = m.tier || (mod10 < 4 ? 'common' : (mod10 < 7 ? 'rare' : (mod10 < 9 ? 'epic' : 'legend')));
    return {
      id: m.id,
      name: m.name,
      theme: m.theme,
      tier,
      encountered: Boolean(stat && stat.encounters > 0),
      defeated: Boolean(stat && stat.defeats > 0),
      encounters: stat ? stat.encounters : 0,
      defeats: stat ? stat.defeats : 0,
      bestStars: stat ? stat.best_stars : 0,
      bestStreak: stat ? stat.best_streak : 0,
    };
  });
}

function getPlayerDex(playerId) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT s.monster_theme AS theme, COALESCE(g.boss_tier, 'common') AS tier, g.brutal AS brutal, COUNT(*) AS n
    FROM game_sessions g
    JOIN subjects s ON s.id = g.subject_id
    WHERE g.player_id = ? AND (g.status = 'WON' OR g.boss_hp <= 0)
    GROUP BY s.monster_theme, COALESCE(g.boss_tier, 'common'), g.brutal
  `).all(playerId);

  const progress = {};
  for (const r of rows) {
    const element = BossSkills.elementForTheme(r.theme);
    if (!element) continue;
    const key = `${element}:${r.tier}`;
    if (!progress[key]) {
      progress[key] = { defeated: 0, brutalDefeated: 0 };
    }
    progress[key].defeated += r.n;
    if (r.brutal) {
      progress[key].brutalDefeated += r.n;
    }
  }

  return {
    ok: true,
    brutal: BossSkills.BRUTAL,
    progress
  };
}

/* ── Admin APIs ── */
function getAdminOverview() {
  const db = getDb();
  const totalPlayers = db.prepare('SELECT count(*) as c FROM players').get().c;
  const totalQuestions = db.prepare('SELECT count(*) as c FROM questions WHERE is_active=1').get().c;
  const totalSessions = db.prepare('SELECT count(*) as c FROM game_sessions').get().c;
  const wonSessions = db.prepare("SELECT count(*) as c FROM game_sessions WHERE status='WON'").get().c;
  const ansRow = db.prepare("SELECT count(*) as total, sum(CASE WHEN outcome IN ('NORMAL', 'CRITICAL', 'SLOW') THEN 1 ELSE 0 END) as correct FROM session_questions WHERE answered_at IS NOT NULL").get();
  const accuracyPct = ansRow && ansRow.total > 0 ? Math.round((ansRow.correct / ansRow.total) * 100) : 0;

  return {
    totalPlayers,
    totalQuestions,
    totalSessions,
    winRate: totalSessions > 0 ? Math.round((wonSessions / totalSessions) * 100) : 0,
    accuracyPct,
  };
}

function adminGetClasses() {
  return getClasses();
}

function adminSaveClass(data = {}) {
  const db = getDb();
  const name = String(data.name || '').trim();
  if (!name) {
    throw new Error('Nama kelas tidak boleh kosong');
  }

  let sortOrder = parseInt(data.sortOrder !== undefined ? data.sortOrder : data.sort_order, 10);
  if (isNaN(sortOrder)) {
    const maxRow = db.prepare('SELECT MAX(sort_order) as m FROM classes').get();
    sortOrder = (maxRow && maxRow.m != null) ? Number(maxRow.m) + 1 : 1;
  }

  const res = db.prepare('INSERT INTO classes(name, sort_order) VALUES(?, ?)').run(name, sortOrder);
  const newClassId = Number(res.lastInsertRowid);

  const copyFromClassId = data.copyFromClassId ? parseInt(data.copyFromClassId, 10) : null;
  if (copyFromClassId) {
    const sourceSubjects = db.prepare('SELECT name, icon, color, monster_theme, question_count, time_limit_sec, is_active, grade FROM subjects WHERE class_id=? AND is_active=1').all(copyFromClassId);
    const insertSubj = db.prepare(`
      INSERT INTO subjects (class_id, name, icon, color, monster_theme, question_count, time_limit_sec, is_active, grade)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of sourceSubjects) {
      try {
        insertSubj.run(newClassId, s.name, s.icon, s.color, s.monster_theme, s.question_count || 10, s.time_limit_sec || 20, 1, s.grade || null);
      } catch (e) {}
    }
  }

  return { id: newClassId, name, sort_order: sortOrder };
}

function adminDeleteClass(classId) {
  const db = getDb();
  const id = parseInt(classId, 10);
  if (!id) throw new Error('ID kelas tidak valid');
  const cls = db.prepare('SELECT id, name FROM classes WHERE id=?').get(id);
  if (!cls) throw new Error('Kelas tidak ditemukan');

  db.exec('BEGIN IMMEDIATE');
  try {
    const subjects = db.prepare('SELECT id FROM subjects WHERE class_id=?').all(id);
    for (const s of subjects) {
      try {
        db.prepare(`
          DELETE FROM session_questions WHERE question_id IN (SELECT id FROM questions WHERE subject_id=?)
          OR session_id IN (SELECT id FROM game_sessions WHERE subject_id=?)
        `).run(s.id, s.id);
      } catch (e) {}
      try {
        db.prepare('DELETE FROM game_sessions WHERE subject_id=?').run(s.id);
      } catch (e) {}
      try {
        db.prepare('DELETE FROM player_question_stats WHERE question_id IN (SELECT id FROM questions WHERE subject_id=?)').run(s.id);
      } catch (e) {}
      db.prepare('DELETE FROM questions WHERE subject_id=?').run(s.id);
      try {
        db.prepare('DELETE FROM player_subject_progress WHERE subject_id=?').run(s.id);
      } catch (e) {}
      db.prepare('DELETE FROM subjects WHERE id=?').run(s.id);
    }
    try {
      db.prepare('DELETE FROM player_classes WHERE class_id=?').run(id);
    } catch (e) {}
    try {
      db.prepare('UPDATE players SET class_id=NULL WHERE class_id=?').run(id);
    } catch (e) {}
    db.prepare('DELETE FROM classes WHERE id=?').run(id);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return { ok: true, id, name: cls.name };
}

function adminSaveSubject(data = {}) {
  const db = getDb();
  const classId = parseInt(data.classId !== undefined ? data.classId : data.class_id, 10);
  if (!classId) {
    throw new Error('ID kelas harus dipilih');
  }

  const cls = db.prepare('SELECT id, name FROM classes WHERE id=?').get(classId);
  if (!cls) {
    throw new Error('Kelas tidak ditemukan');
  }

  const name = String(data.name || '').trim();
  if (!name) {
    throw new Error('Nama mata pelajaran tidak boleh kosong');
  }

  const icon = String(data.icon || '📚').trim() || '📚';
  const color = String(data.color || '#3b82f6').trim() || '#3b82f6';
  const monsterTheme = String(data.monsterTheme !== undefined ? data.monsterTheme : (data.monster_theme || 'hutan')).trim() || 'hutan';
  const questionCount = parseInt(data.questionCount !== undefined ? data.questionCount : data.question_count, 10) || 10;
  const timeLimitSec = parseInt(data.timeLimitSec !== undefined ? data.timeLimitSec : data.time_limit_sec, 10) || 20;
  const grade = parseInt(data.grade, 10) || 4;

  const existing = db.prepare('SELECT id FROM subjects WHERE class_id=? AND LOWER(name)=LOWER(?)').get(classId, name);
  if (existing) {
    throw new Error(`Mata pelajaran "${name}" sudah ada di kelas ${cls.name}`);
  }

  const stmt = db.prepare(`
    INSERT INTO subjects (class_id, name, icon, color, monster_theme, question_count, time_limit_sec, is_active, grade)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);
  const res = stmt.run(classId, name, icon, color, monsterTheme, questionCount, timeLimitSec, grade);
  const newSubjectId = Number(res.lastInsertRowid);

  return {
    id: newSubjectId,
    class_id: classId,
    class_name: cls.name,
    name,
    icon,
    color,
    monster_theme: monsterTheme,
    question_count: questionCount,
    time_limit_sec: timeLimitSec,
    grade,
    is_active: 1
  };
}

function adminDeleteSubject(subjectId) {
  const db = getDb();
  const id = parseInt(subjectId, 10);
  if (!id) throw new Error('ID mata pelajaran tidak valid');
  const subj = db.prepare('SELECT s.id, s.name, s.class_id, c.name as class_name FROM subjects s JOIN classes c ON c.id=s.class_id WHERE s.id=?').get(id);
  if (!subj) throw new Error('Mata pelajaran tidak ditemukan');

  db.exec('BEGIN IMMEDIATE');
  try {
    try {
      db.prepare(`
        DELETE FROM session_questions WHERE question_id IN (SELECT id FROM questions WHERE subject_id=?)
        OR session_id IN (SELECT id FROM game_sessions WHERE subject_id=?)
      `).run(id, id);
    } catch (e) {}
    try {
      db.prepare('DELETE FROM game_sessions WHERE subject_id=?').run(id);
    } catch (e) {}
    try {
      db.prepare('DELETE FROM player_question_stats WHERE question_id IN (SELECT id FROM questions WHERE subject_id=?)').run(id);
    } catch (e) {}
    db.prepare('DELETE FROM questions WHERE subject_id=?').run(id);
    try {
      db.prepare('DELETE FROM player_subject_progress WHERE subject_id=?').run(id);
    } catch (e) {}
    db.prepare('DELETE FROM subjects WHERE id=?').run(id);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return { ok: true, id, name: subj.name, class_id: subj.class_id, class_name: subj.class_name };
}

function adminGetSubjects(classId) {
  const db = getDb();
  const q = classId
    ? db.prepare('SELECT s.*, c.name as class_name, (SELECT count(*) FROM questions q WHERE q.subject_id=s.id) as question_count_actual FROM subjects s JOIN classes c ON c.id=s.class_id WHERE s.class_id=? ORDER BY s.id ASC').all(classId)
    : db.prepare('SELECT s.*, c.name as class_name, (SELECT count(*) FROM questions q WHERE q.subject_id=s.id) as question_count_actual FROM subjects s JOIN classes c ON c.id=s.class_id ORDER BY s.id ASC').all();
  return q;
}

function adminGetQuestions(subjectId) {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM questions WHERE subject_id=? ORDER BY id ASC').all(subjectId);
  return rows.map(r => {
    let options = [];
    try { options = JSON.parse(r.options_json); } catch (e) {}
    return { ...r, options };
  });
}

function adminExportQuestions(subjectId) {
  const db = getDb();
  const subj = db.prepare('SELECT s.*, c.name as class_name FROM subjects s JOIN classes c ON c.id=s.class_id WHERE s.id=?').get(subjectId);
  if (!subj) throw new Error('SUBJECT_NOT_FOUND');
  const questions = adminGetQuestions(subjectId).map(q => ({
    text: q.text,
    options: q.options,
    answerIndex: q.answer_index,
    explanation: q.explanation || '',
    difficulty: q.difficulty || 1,
  }));
  return {
    subjectId: subj.id,
    subjectName: subj.name,
    className: subj.class_name,
    exportedAt: new Date().toISOString(),
    totalQuestions: questions.length,
    questions,
  };
}

function adminImportQuestions(subjectId, questions) {
  if (!Array.isArray(questions)) throw new Error('INVALID_QUESTIONS_ARRAY');
  const db = getDb();
  let imported = 0;
  let updated = 0;
  const errors = [];
  let line = 0;

  db.exec('BEGIN TRANSACTION');
  try {
    for (const q of questions) {
      line++;
      if (!q || !q.text || !q.text.trim()) {
        errors.push({ line, error: 'Teks pertanyaan wajib diisi' });
        continue;
      }
      const qType = (q.type || q.question_type || q.questionType || 'MCQ').toUpperCase();
      let typeData = q.type_data || q.typeData || null;
      if (!typeData && q.type_data_json) {
        try { typeData = JSON.parse(q.type_data_json); } catch(e) {}
      }
      if (!typeData && qType === 'MCQ') {
        typeData = { options: q.options || [] };
      }
      if (qType === 'ORDERING' && typeData && Array.isArray(typeData.items) && !typeData.correctOrder) {
        typeData.correctOrder = typeData.items.map((_, i) => i);
      }
      if (qType === 'TRUE_FALSE' && typeData && typeData.correctAnswer === undefined) {
        typeData.correctAnswer = (q.answerIndex === 0 || q.answer_index === 0);
      }

      const val = validateQuestionData(qType, typeData || {});
      if (!val.valid) {
        errors.push({ line, error: val.error || 'Format data tipe soal tidak valid' });
        continue;
      }

      const ansIdx = q.answerIndex !== undefined ? q.answerIndex : (q.answer_index !== undefined ? q.answer_index : 0);
      const diff = q.difficulty || 1;
      const expl = q.explanation || '';
      const topicTag = q.topic_tag || q.topicTag || null;
      const optionsJson = q.options ? JSON.stringify(q.options) : JSON.stringify((typeData && typeData.options) || []);
      const typeDataJson = typeData ? JSON.stringify(typeData) : null;
      const h = questionHash(q.text);
      const existing = db.prepare('SELECT id FROM questions WHERE subject_id=? AND hash=?').get(subjectId, h);
      if (existing) {
        db.prepare(`
          UPDATE questions
          SET options_json=?, answer_index=?, explanation=?, difficulty=?, eff_difficulty=?, is_active=1,
              question_type=?, type_data_json=?, topic_tag=?
          WHERE id=?
        `).run(optionsJson, ansIdx, expl, diff, diff, qType, typeDataJson, topicTag, existing.id);
        updated++;
      } else {
        db.prepare(`
          INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, eff_difficulty, hash, is_active, question_type, type_data_json, topic_tag)
          VALUES(?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
        `).run(subjectId, q.text, optionsJson, ansIdx, expl, diff, diff, h, qType, typeDataJson, topicTag);
        imported++;
      }
    }
    db.exec('COMMIT');
    return { ok: true, imported, updated, total: imported + updated, errors };
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function adminSaveQuestion(q) {
  const db = getDb();
  const qType = (q.question_type || q.questionType || 'MCQ').toUpperCase();
  let typeData = q.type_data || q.typeData || null;
  if (!typeData && q.type_data_json) {
    try { typeData = JSON.parse(q.type_data_json); } catch(e) {}
  }
  if (!typeData && qType === 'MCQ') {
    typeData = { options: q.options || [] };
  }
  if (qType === 'ORDERING' && typeData && Array.isArray(typeData.items) && !typeData.correctOrder) {
    typeData.correctOrder = typeData.items.map((_, i) => i);
  }
  if (qType === 'TRUE_FALSE' && typeData && typeData.correctAnswer === undefined) {
    typeData.correctAnswer = (q.answerIndex === 0 || q.answer_index === 0);
  }
  if (qType === 'SHORT' && typeData && typeData.numeric && !typeData.accepted) {
    typeData.accepted = [String(typeData.numeric.value)];
  }

  const val = validateQuestionData(qType, typeData || {});
  if (!val.valid) {
    const err = new Error(val.error || 'INVALID_QUESTION_DATA');
    err.code = 'INVALID_QUESTION_DATA';
    throw err;
  }

  const h = questionHash(q.text);
  const optionsJson = q.options ? JSON.stringify(q.options) : JSON.stringify((typeData && typeData.options) || []);
  const typeDataJson = typeData ? JSON.stringify(typeData) : null;
  const topicTag = q.topic_tag || q.topicTag || null;
  const ansIdx = q.answerIndex !== undefined ? q.answerIndex : 0;
  const expl = q.explanation || '';
  const diff = q.difficulty || 1;

  if (q.id) {
    db.prepare(`
      UPDATE questions
      SET text=?, options_json=?, answer_index=?, explanation=?, difficulty=?, eff_difficulty=?, is_active=?,
          question_type=?, type_data_json=?, topic_tag=?
      WHERE id=?
    `).run(q.text, optionsJson, ansIdx, expl, diff, diff, q.isActive !== false ? 1 : 0, qType, typeDataJson, topicTag, q.id);
    return db.prepare('SELECT * FROM questions WHERE id=?').get(q.id);
  } else {
    const ins = db.prepare(`
      INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, eff_difficulty, hash, is_active, question_type, type_data_json, topic_tag)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      ON CONFLICT(subject_id, hash) DO UPDATE SET
        options_json=excluded.options_json,
        answer_index=excluded.answer_index,
        explanation=excluded.explanation,
        question_type=excluded.question_type,
        type_data_json=excluded.type_data_json,
        topic_tag=excluded.topic_tag
    `);
    const res = ins.run(q.subjectId, q.text, optionsJson, ansIdx, expl, diff, diff, h, qType, typeDataJson, topicTag);
    return db.prepare('SELECT * FROM questions WHERE id=?').get(Number(res.lastInsertRowid));
  }
}

function adminDeleteQuestion(id) {
  const db = getDb();
  db.prepare('DELETE FROM questions WHERE id=?').run(id);
  return { ok: true };
}

function adminAddPlayerClass(playerId, classId) {
  const db = getDb();
  const pid = parseInt(playerId, 10);
  const cid = parseInt(classId, 10);
  if (!pid || !cid) throw new Error('ID siswa dan ID kelas harus valid');

  const p = db.prepare('SELECT id, class_id FROM players WHERE id=?').get(pid);
  if (!p) throw new Error('Siswa tidak ditemukan');
  const cls = db.prepare('SELECT id, name FROM classes WHERE id=?').get(cid);
  if (!cls) throw new Error('Kelas tidak ditemukan');

  db.prepare('INSERT OR IGNORE INTO player_classes (player_id, class_id) VALUES (?, ?)').run(pid, cid);
  if (!p.class_id) {
    db.prepare('UPDATE players SET class_id=? WHERE id=?').run(cid, pid);
  }

  return getPlayerClasses(pid);
}

function adminRemovePlayerClass(playerId, classId) {
  const db = getDb();
  const pid = parseInt(playerId, 10);
  const cid = parseInt(classId, 10);
  if (!pid || !cid) throw new Error('ID siswa dan ID kelas harus valid');

  db.prepare('DELETE FROM player_classes WHERE player_id=? AND class_id=?').run(pid, cid);

  const remaining = getPlayerClasses(pid);
  const p = db.prepare('SELECT class_id FROM players WHERE id=?').get(pid);
  if (p && p.class_id === cid) {
    const nextCid = (remaining.length > 0) ? remaining[0].id : null;
    db.prepare('UPDATE players SET class_id=? WHERE id=?').run(nextCid, pid);
  }

  return remaining;
}

function adminSetPlayerClasses(playerId, classIds = []) {
  const db = getDb();
  const pid = parseInt(playerId, 10);
  if (!pid) throw new Error('ID siswa harus valid');

  const p = db.prepare('SELECT id, class_id FROM players WHERE id=?').get(pid);
  if (!p) throw new Error('Siswa tidak ditemukan');

  const rawIds = Array.isArray(classIds) ? classIds : [classIds];
  const validIds = [];
  for (const item of rawIds) {
    const val = parseInt(item, 10);
    if (Number.isInteger(val) && val > 0) {
      const cls = db.prepare('SELECT id FROM classes WHERE id=?').get(val);
      if (cls && !validIds.includes(val)) validIds.push(val);
    }
  }

  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('DELETE FROM player_classes WHERE player_id=?').run(pid);
    const insertStmt = db.prepare('INSERT OR IGNORE INTO player_classes (player_id, class_id) VALUES (?, ?)');
    for (const cid of validIds) {
      insertStmt.run(pid, cid);
    }
    const newPrimary = validIds.length > 0 ? validIds[0] : null;
    db.prepare('UPDATE players SET class_id=? WHERE id=?').run(newPrimary, pid);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return getPlayerClasses(pid);
}

function adminGetPlayers() {
  const db = getDb();
  const rows = db.prepare('SELECT id, nick, xp, class_id, coins, created_at, last_login_at FROM players ORDER BY xp DESC LIMIT 100').all();
  return rows.map(r => ({
    ...r,
    level: GAME.levelFormula(r.xp),
    classes: getPlayerClasses(r.id),
  }));
}



function computeSubjectAbilities(playerId) {
  const db = getDb();
  return reports.computeSubjectAbilities(db, playerId);
}

function compileWeeklyReport(playerId, options = {}) {
  const db = getDb();
  return reports.compileWeeklyReport(db, playerId, options);
}

function getWeeklyReport(playerId, options = {}) {
  const db = getDb();
  return reports.getWeeklyReport(db, playerId, options);
}

function saveWeeklyReport(playerId, weekKey, reportData) {
  const db = getDb();
  return reports.saveWeeklyReport(db, playerId, weekKey, reportData);
}

function createReportShare(playerId) {
  const db = getDb();
  return reports.createReportShare(db, playerId);
}

function revokeReportShare(playerId) {
  const db = getDb();
  return reports.revokeReportShare(db, playerId);
}

function getReportByShareToken(token) {
  const db = getDb();
  return reports.getReportByShareToken(db, token);
}

function generateAllWeeklyReports(refDate) {
  const db = getDb();
  return reports.generateAllWeeklyReports(db, refDate);
}

function getClassWeeklyReports(classId, weekKey) {
  const db = getDb();
  return reports.getClassWeeklyReports(db, classId, weekKey);
}

function exportClassReportsCsv(classId, weekKey) {
  const db = getDb();
  return reports.exportClassReportsCsv(db, classId, weekKey);
}

function adminResetPlayerPassword(id, newPassword) {
  const db = getDb();
  const pwHash = hashPassword(newPassword);
  db.prepare('UPDATE players SET password_hash=? WHERE id=?').run(pwHash, id);
  return { ok: true };
}


function getSessionWrongQuestions(sessionId, playerId) {
  const db = getDb();
  const s = db.prepare('SELECT id, status FROM game_sessions WHERE id=? AND player_id=?').get(sessionId, playerId);
  if (!s) throw new Error('SESSION_NOT_FOUND');

  const rows = db.prepare(`
    SELECT sq.order_index, sq.chosen_display, sq.outcome, sq.reveal_json, sq.option_order, sq.display_json,
           q.id as question_id, q.text, q.options_json, q.answer_index, q.explanation, q.image_url,
           COALESCE(q.question_type, 'MCQ') as question_type, q.type_data_json
    FROM session_questions sq
    JOIN questions q ON q.id = sq.question_id
    WHERE sq.session_id=? AND sq.outcome IN ('WRONG', 'TIMEOUT', 'TIMEOUT_AWAY')
    ORDER BY sq.order_index ASC
  `).all(sessionId);

  const letters = ['A', 'B', 'C', 'D', 'E'];

  return rows.map(r => {
    const qType = (r.question_type || 'MCQ').toUpperCase();
    let originalOpts = [];
    try { originalOpts = JSON.parse(r.options_json || '[]'); } catch (e) {}

    let optionOrder = [];
    try { optionOrder = JSON.parse(r.option_order || '[]'); } catch (e) {}

    let displayOpts = [];
    if (optionOrder.length > 0 && originalOpts.length > 0) {
      displayOpts = optionOrder.map(idx => originalOpts[idx]);
    } else {
      displayOpts = originalOpts;
    }

    let typeData = {};
    try { typeData = JSON.parse(r.type_data_json || '{}'); } catch (e) {}

    let reveal = {};
    try { reveal = JSON.parse(r.reveal_json || '{}'); } catch (e) {}

    let playerAnswerText = '';
    let correctAnswerText = '';

    if (qType === 'MCQ') {
      const correctDispIdx = optionOrder.indexOf(r.answer_index);
      if (correctDispIdx >= 0 && correctDispIdx < displayOpts.length) {
        correctAnswerText = `${letters[correctDispIdx] || (correctDispIdx + 1)}. ${displayOpts[correctDispIdx]}`;
      } else if (r.answer_index < originalOpts.length) {
        correctAnswerText = `${letters[r.answer_index] || ''}. ${originalOpts[r.answer_index]}`;
      } else {
        correctAnswerText = 'Jawaban benar';
      }

      if (r.outcome === 'TIMEOUT' || r.outcome === 'TIMEOUT_AWAY' || r.chosen_display === null || r.chosen_display === -1) {
        playerAnswerText = 'Waktu Habis / Tidak Terjawab ⏰';
      } else if (r.chosen_display >= 0 && r.chosen_display < displayOpts.length) {
        playerAnswerText = `${letters[r.chosen_display] || (r.chosen_display + 1)}. ${displayOpts[r.chosen_display]}`;
      } else {
        playerAnswerText = 'Pilihan Salah';
      }
    } else if (qType === 'TRUE_FALSE') {
      const targetBool = typeData.correctAnswer !== undefined ? Boolean(typeData.correctAnswer) : (r.answer_index === 0);
      correctAnswerText = targetBool ? 'Benar ✅' : 'Salah ❌';

      if (r.outcome === 'TIMEOUT' || r.outcome === 'TIMEOUT_AWAY' || r.chosen_display === null || r.chosen_display === -1) {
        playerAnswerText = 'Waktu Habis / Tidak Terjawab ⏰';
      } else {
        playerAnswerText = r.chosen_display === 0 ? 'Benar ✅' : 'Salah ❌';
      }
    } else if (qType === 'SHORT') {
      const accepted = typeData.accepted || typeData.answers || (typeData.accept ? (Array.isArray(typeData.accept) ? typeData.accept : [typeData.accept]) : []);
      correctAnswerText = reveal.correctText || (accepted[0] ? String(accepted[0]) : '');
      playerAnswerText = r.outcome.startsWith('TIMEOUT') ? 'Waktu Habis / Kosong ⏰' : (r.chosen_display !== -1 ? String(r.chosen_display) : '-');
    } else {
      correctAnswerText = reveal.correctText || 'Lihat penjelasan kunci';
      playerAnswerText = r.outcome.startsWith('TIMEOUT') ? 'Waktu Habis ⏰' : 'Jawaban kurang tepat';
    }

    return {
      orderIndex: r.order_index,
      questionNumber: r.order_index + 1,
      text: r.text,
      imageUrl: r.image_url,
      type: qType,
      outcome: r.outcome,
      playerAnswer: playerAnswerText,
      correctAnswer: correctAnswerText,
      explanation: r.explanation || ''
    };
  });
}

module.exports = {
  GAME, THEMES, MONSTERS, SCHEMA,
  createDatabase, getDb, seedDatabase,
  questionHash, hashPassword, verifyPassword, uuid,
  applyCoins,
  // Player
  registerPlayer, loginPlayer, getPlayerById, getPlayerProfile, updatePlayerClass, updatePlayerAvatar,
  getPlayerSettings, updatePlayerSettings,
  // Inventory, Shop, Skills
  getInventory, getShop, getPlayerPassives, buyShopItem, buyMysteryBox, getCoinHistory,
  getSkills, getPlayerLoadout, getPlayerDuelLoadout, getPlayerSkillLevels, updateLoadout, updateDuelLoadout, upgradeSkill, ensurePlayerSkills,
  getUnlockedBossSlots, getMaxAllowedBossRarity, canEquipBossRarity, getMonsterTierById, getPlayerDuelBossLoadout, updatePlayerDuelBossLoadout, getDuelBossLoadoutDetails, getPlayerEquippedBossSkills,
  // Admin
  loginAdmin, getAdminOverview, adminGetClasses, adminSaveClass, adminDeleteClass,
  adminGetSubjects, adminSaveSubject, adminDeleteSubject, adminGetQuestions,
  adminSaveQuestion, adminDeleteQuestion, adminGetPlayers, adminResetPlayerPassword,
  adminAddPlayerClass, adminRemovePlayerClass, adminSetPlayerClasses,
  adminExportQuestions, adminImportQuestions,
  // Classes / Subjects
  getClasses, getPlayerClasses, getSubjectsByClass,
  // Battle Sessions
  startSession, getSession, getSessionWrongQuestions, nextQuestion, readyQuestion, useSkill, answerQuestion, refillSessionQuestions, abandonSession, resolveEvent,
  getCampaign, buildCampaign, parseNodeKey,
  skillAvailability, getSkillAvailability,
  reconcileSession, getActiveSession, heartbeatSession, resumeSession,
  getIdempotency, saveIdempotency,
  // Dex
  getDex, getPlayerDex,
  // Reports
  computeSubjectAbilities, compileWeeklyReport, getWeeklyReport, saveWeeklyReport, createReportShare, revokeReportShare,
  getReportByShareToken, generateAllWeeklyReports, getClassWeeklyReports, exportClassReportsCsv,
  v7Migrate, V7_DDL,
  DB_PATH, SEED_DIR,
};
