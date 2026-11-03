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
  BOSS_MOVES
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
    mode              TEXT NOT NULL DEFAULT 'BATTLE' CHECK(mode IN('BATTLE','PRACTICE')),
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

  // Seed default admin (admin:admin123)
  const existingAdmin = db.prepare('SELECT id FROM admins WHERE username=?').get('admin');
  if (!existingAdmin) {
    const pwHash = hashPassword('admin123');
    db.prepare('INSERT INTO admins(username, password_hash) VALUES(?, ?)').run('admin', pwHash);
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

    // Starter items
    for (const item of ['hat_explorer', 'outfit_vest', 'bg_meadow']) {
      db.prepare('INSERT INTO player_items(player_id, item_id, is_equipped) VALUES(?,?,1)').run(newId, item);
    }
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

function getPlayerById(id) {
  const db = getDb();
  const row = db.prepare('SELECT id, nick, xp, class_id, coins, pity_counter, avatar_json, title, day_streak, created_at, last_login_at, settings_json FROM players WHERE id=?').get(id);
  if (!row) return null;
  const level = GAME.levelFormula(row.xp);
  const nextXp = GAME.xpForNext(level);
  let avatar = {};
  try { avatar = JSON.parse(row.avatar_json || '{}'); } catch (e) {}
  let settings = { sound: true, vibrate: true, reducedMotion: false, pace: 'AUTO', skillBarHidden: false };
  if (row.settings_json) {
    try { Object.assign(settings, JSON.parse(row.settings_json)); } catch (_) {}
  }
  const cls = row.class_id ? db.prepare('SELECT name FROM classes WHERE id=?').get(row.class_id) : null;
  return {
    id: row.id,
    nick: row.nick,
    xp: row.xp,
    level,
    xpForNext: nextXp,
    nextLevelXp: nextXp,
    classId: row.class_id,
    className: cls ? cls.name : 'Kelas 1',
    coins: row.coins,
    pityCounter: row.pity_counter,
    avatar,
    settings,
    title: row.title,
    dayStreak: row.day_streak,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
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

  db.prepare(`
    UPDATE player_items
    SET is_new = 0
    WHERE player_id = ? AND item_id IN (?, ?, ?, ?, ?, ?, ?)
  `).run(id, av.hat || '', av.outfit || '', av.weapon || '', av.pet || '', av.bg || '', av.frame || '', av.title || '');

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
    owned: ownedMap.has(it.id),
    isNew: false,
    equipped: ownedMap.get(it.id) === true
  }));

  return {
    ok: true,
    coins: player.coins,
    avatar: player.avatar,
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
  const player = getPlayerById(playerId);
  if (!player) throw new Error('PLAYER_NOT_FOUND');

  const pLevel = player.level || 1;
  const skillMap = getPlayerSkillLevels(playerId);
  const loadout = getPlayerLoadout(playerId);

  const skills = SKILLS.map(sk => {
    const isUnlocked = pLevel >= sk.unlockLevel || skillMap[sk.id] !== undefined;
    const currLevel = skillMap[sk.id] || 1;
    const cost = sk.costEnergy[currLevel - 1] ?? sk.costEnergy[0];
    const uses = sk.maxUses ? (sk.maxUses[currLevel - 1] ?? sk.maxUses[0]) : (sk.uses ? (sk.uses[currLevel - 1] ?? sk.uses[0]) : 2);
    const val = sk.value ? (sk.value[currLevel - 1] ?? sk.value[0]) : null;
    const descNow = sk.desc ? sk.desc(val) : (sk.effectDesc || '');
    const nextVal = (currLevel < (SKILL_MAX_LEVEL || 5) && sk.value) ? (sk.value[currLevel] ?? sk.value[currLevel - 1]) : null;
    const descNext = (currLevel < (SKILL_MAX_LEVEL || 5) && sk.desc) ? sk.desc(nextVal) : null;
    const nextCost = getSkillUpgradeCost(sk.id, currLevel);

    return {
      id: sk.id,
      name: sk.name,
      icon: sk.icon,
      unlocked: isUnlocked,
      unlockLevel: sk.unlockLevel,
      level: currLevel,
      maxLevel: SKILL_MAX_LEVEL || 5,
      costEnergy: cost,
      usesPerBattle: uses,
      value: val,
      desc: descNow,
      descNow: descNow,
      descNext: descNext,
      nextUpgradeCost: nextCost
    };
  });

  return {
    ok: true,
    skills,
    loadout,
    slots: loadout ? loadout.length : 3
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

function upgradeSkill(playerId, skillId) {
  const db = getDb();
  const player = getPlayerById(playerId);
  if (!player) throw new Error('PLAYER_NOT_FOUND');

  const skDef = SKILLS.find(x => x.id === skillId);
  if (!skDef) throw new Error('SKILL_NOT_FOUND');

  const row = db.prepare('SELECT level FROM player_skills WHERE player_id=? AND skill_id=?').get(playerId, skillId);
  const currLevel = row ? row.level : 1;
  const maxLvl = SKILL_MAX_LEVEL || 5;
  if (currLevel >= maxLvl) {
    const err = new Error('Skill sudah mencapai level maksimum');
    err.code = 'MAX_LEVEL_REACHED';
    throw err;
  }

  const cost = getSkillUpgradeCost(skillId, currLevel);
  if (!cost) throw new Error('CANNOT_UPGRADE');

  if (player.coins < cost) {
    const err = new Error('Koin tidak cukup');
    err.code = 'INSUFFICIENT_COINS';
    throw err;
  }

  db.exec('BEGIN IMMEDIATE');
  let newBalance = 0;
  try {
    newBalance = applyCoins(db, playerId, -cost, 'SKILL_UPGRADE');
    db.prepare(`
      INSERT INTO player_skills(player_id, skill_id, level)
      VALUES(?, ?, ?)
      ON CONFLICT(player_id, skill_id) DO UPDATE SET level = excluded.level
    `).run(playerId, skillId, currLevel + 1);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }

  return { ok: true, level: currLevel + 1, coins: newBalance };
}

/* ── Auth Admin ── */
function loginAdmin(username, password) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM admins WHERE username=?').get(String(username || '').trim());
  if (!row) return null;
  if (!verifyPassword(password, row.password_hash)) return null;
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

  if (mcqs.length === 0) return nonMcqs;

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
  const timeLimitSec = Math.max(5, Math.round((baseLimit + readBonusSec) * pace * phaseFactor));

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
  const allQ = db.prepare('SELECT * FROM questions WHERE subject_id=? AND is_active=1').all(subjectId);
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

  const count = campaignNodeObj ? Math.min(campaignNodeObj.questionCount, allQ.length) : Math.min(options.count || subj.question_count || 10, allQ.length);

  // Query soal jatuh tempo untuk ulangan berjarak (Spaced Repetition)
  const dueReviews = db.prepare(`
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
  `).all(playerId, subjectId);

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
  const targetPerType = {
    TRUE_FALSE: Math.max(0, Math.round(count * (typeMix.TRUE_FALSE !== undefined ? typeMix.TRUE_FALSE : 0.15))),
    ORDERING: Math.max(0, Math.round(count * (typeMix.ORDERING !== undefined ? typeMix.ORDERING : 0.10))),
    MATCHING: Math.max(0, Math.round(count * (typeMix.MATCHING !== undefined ? typeMix.MATCHING : 0.10))),
    SHORT: Math.max(0, Math.round(count * (typeMix.SHORT !== undefined ? typeMix.SHORT : 0.05)))
  };
  const nonMcqTargetSum = Object.values(targetPerType).reduce((a, b) => a + b, 0);
  targetPerType.MCQ = Math.max(0, count - nonMcqTargetSum);

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

  // Ambil dari non-MCQ pools sesuai target (fallback otomatis ke MCQ jika bucket kosong)
  const pickedNonReview = [];
  const nonMcqTypes = ['TRUE_FALSE', 'ORDERING', 'MATCHING', 'SHORT'];
  for (const t of nonMcqTypes) {
    const needed = Math.max(0, (targetPerType[t] || 0) - (allocatedByType[t] || 0));
    const takeCount = Math.min(needed, poolByType[t].length);
    const taken = poolByType[t].splice(0, takeCount);
    pickedNonReview.push(...taken);
    allocatedByType[t] = (allocatedByType[t] || 0) + taken.length;
  }

  // Sisa kuota untuk mencapai 'count' diambil dari pool MCQ (atau pool apapun yang tersisa)
  const remainingSlots = Math.max(0, count - (reviewPicked.length + pickedNonReview.length));
  const mcqTaken = poolByType.MCQ.splice(0, remainingSlots);
  pickedNonReview.push(...mcqTaken);

  // Jika pool MCQ masih kurang dari remainingSlots, ambil dari sisa pool lainnya
  if (reviewPicked.length + pickedNonReview.length < count) {
    const stillNeeded = count - (reviewPicked.length + pickedNonReview.length);
    const leftover = [];
    for (const t of Object.keys(poolByType)) {
      leftover.push(...poolByType[t]);
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

  // Boss HP = count * 10 * 0.8
  const bossHp = Math.max(10, Math.floor(count * 10 * GAME.bossHpFactor));
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

  const psp = db.prepare('SELECT pace_factor FROM player_subject_progress WHERE player_id=? AND subject_id=?').get(playerId, subjectId);
  const paceFactor = (psp && typeof psp.pace_factor === 'number') ? psp.pace_factor : 1.0;

  db.exec('BEGIN IMMEDIATE');
  try {
    const insS = db.prepare(`
      INSERT INTO game_sessions(
        id, player_id, subject_id, monster_id, mode, status,
        total_questions, current_index, boss_max_hp, boss_hp,
        player_max_hp, player_hp, streak, max_streak, correct_count,
        energy, loadout_json, uses_json, flags_json, last_ping_at, client_instance_id,
        started_at, created_at, pace_used, weak_topic, campaign_node
      ) VALUES(?, ?, ?, ?, ?, 'IN_PROGRESS', ?, 0, ?, ?, 100, 100, 0, 0, 0, 2, ?, '{}', '{}', ?, ?, ?, ?, ?, ?, ?)
    `);
    insS.run(sessionId, playerId, subjectId, monster.id, sessionMode, count, bossHp, bossHp, JSON.stringify(loadoutData), nowIso, clientInstanceId, nowIso, nowIso, paceFactor, weakTopic, campaignNode);

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
    total: sessionObj.totalQuestions,
    totalQuestions: sessionObj.totalQuestions,
    bossMaxHp: bossHp,
    bossHp: bossHp,
    weakTopic,
    boss: {
      id: monster.id,
      name: monster.name,
      theme: monster.theme,
      maxHp: bossHp,
      hp: bossHp,
      phase: 1,
      weakTopic: weakTopic,
      svg: renderMonsterSvg(monster, { size: 200 })
    },
    energy: { value: 2, max: 5 },
    loadout: loadoutData,
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
      SELECT sq.*, q.text, q.options_json, q.image_url, q.image_alt, q.tts, q.time_limit_sec as q_time_limit,
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
        timeLimitSec,
        readBonusSec,
        readyAt: sq.ready_at,
        timerState: sq.timer_state,
        eliminated,
        isReview: Boolean(sq.is_review),
        isWeak: Boolean(sq.is_weak),
        isBonus: Boolean(sq.is_bonus),
        isMystery: Boolean(sq.is_mystery)
      };
    }
  }

  let rawLoadout = [];
  try { rawLoadout = JSON.parse(s.loadout_json || '[]'); } catch (e) {}
  let uses = {};
  try { uses = JSON.parse(s.uses_json || '{}'); } catch (e) {}

  return {
    id: s.id,
    mode: s.mode,
    status: s.status,
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
    energy: s.energy !== undefined ? s.energy : 2,
    weakTopic: s.weak_topic,
    paceUsed: s.pace_used,
    bossPhase: s.boss_phase || 1,
    pendingEvent: s.pending_event_json ? (() => { try { return JSON.parse(s.pending_event_json); } catch(e) { return null; } })() : null,
    boss: {
      id: monster.id,
      name: monster.name,
      theme: monster.theme,
      maxHp: s.boss_max_hp,
      hp: s.boss_hp,
      phase: s.boss_phase || 1,
      weakTopic: s.weak_topic,
      svg: renderMonsterSvg(monster, { size: 200 })
    },
    monster: monster,
    loadout: rawLoadout,
    currentQuestion,
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
    SELECT sq.*, q.text, q.options_json, q.image_url, q.image_alt, q.tts, q.time_limit_sec as q_time_limit,
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
      .run(readBonusSec, timeLimitSec, sq.id);
  } else {
    timerState = 'RUNNING';
    db.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=COALESCE(ready_at, ?), served_at=COALESCE(served_at, ?), read_bonus_sec=?, time_limit_sec=? WHERE id=?")
      .run(nowIso, nowIso, readBonusSec, timeLimitSec, sq.id);
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
    timeLimitSec,
    readBonusSec,
    bossHp: s.boss_hp,
    bossMaxHp: s.boss_max_hp,
    boss: {
      id: monster.id,
      name: monster.name,
      theme: monster.theme,
      maxHp: s.boss_max_hp,
      hp: s.boss_hp,
      phase: s.boss_phase || 1,
      weakTopic: s.weak_topic,
      svg: renderMonsterSvg(monster, { size: 200 })
    },
    energy: { value: s.energy !== undefined ? s.energy : 2, max: 5 },
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
      timeLimitSec,
      readBonusSec,
      isReview: Boolean(sq.is_review),
      isWeak: Boolean(sq.is_weak),
      isBonus: Boolean(sq.is_bonus),
      isMystery: Boolean(sq.is_mystery)
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
  const db = getDb();
  let loadoutSnap = [];
  try { loadoutSnap = JSON.parse(session.loadout_json || '[]'); } catch (e) {}
  if (!loadoutSnap || loadoutSnap.length === 0) {
    loadoutSnap = ['eliminate_one', 'eagle_eye', 'heal'].map(id => ({ id, level: 1 }));
  }

  let uses = {};
  try { uses = JSON.parse(session.uses_json || '{}'); } catch (e) {}

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

    const cost = (typeof item === 'object' && item && item.costEnergy !== undefined)
      ? item.costEnergy
      : (skillDef.costEnergy[sLevel - 1] ?? skillDef.costEnergy[0]);

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
      try { order = JSON.parse(sq ? sq.option_order : '[]'); } catch (e) {}
      const correctDisplay = sq ? order.indexOf(sq.answer_index) : -1;
      let prevEliminated = [];
      try { prevEliminated = JSON.parse((sq && sq.eliminated_json) || '[]'); } catch (e) {}
      const remainingWrongs = [0, 1, 2, 3].filter(idx => idx !== correctDisplay && !prevEliminated.includes(idx));
      const removable = remainingWrongs.length - 1;
      if (removable <= 0) {
        usable = false;
        reason = 'NOTHING_TO_ELIMINATE';
      } else if (usesLeft <= 0) {
        usable = false;
        reason = 'ALREADY_USED';
      } else if (session.energy < cost) {
        usable = false;
        reason = 'NO_ENERGY';
      }
    } else if (usesLeft <= 0) {
      usable = false;
      reason = 'ALREADY_USED';
    } else if (session.energy < cost) {
      usable = false;
      reason = 'NO_ENERGY';
    }

    result.push({
      id: skillDef.id,
      name: skillDef.name,
      icon: skillDef.icon,
      cost,
      usable,
      reason,
      usesLeft
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
  const cost = avail.cost;
  const maxUses = snapObj ? snapObj.maxUses : (skillDef.maxUses[sLevel - 1] ?? skillDef.maxUses[0]);

  let flags = {};
  try { flags = JSON.parse(s.flags_json || '{}'); } catch (e) {}
  if (s.pending_event_json || (flags && flags.pendingEvent)) {
    const err = new Error('SKILL_UNAVAILABLE');
    err.code = 'SKILL_UNAVAILABLE';
    err.reason = 'EVENT_PENDING';
    throw err;
  }

  if (skillId === 'eliminate_one' && flags.freeEliminateNext) {
    cost = 0;
    flags.freeEliminateNext = false;
  }

  let uses = {};
  try { uses = JSON.parse(s.uses_json || '{}'); } catch (e) {}
  const currentUses = uses[skillId] || 0;

  let eliminated = [];
  try { eliminated = JSON.parse(sq.eliminated_json || '[]'); } catch (e) {}

  let healed = 0;
  let shield = 0;
  let extraTimeMs = 0;
  let newEnergy = 0;

  db.exec('BEGIN IMMEDIATE');
  try {
    if (skillId === 'eliminate_one') {
      let order = [];
      try { order = JSON.parse(sq.option_order); } catch (e) {}
      const correctDisplay = order.indexOf(sq.answer_index);
      let prevEliminated = [];
      try { prevEliminated = JSON.parse(sq.eliminated_json || '[]'); } catch (e) {}
      const remainingWrongs = [0, 1, 2, 3].filter(idx => idx !== correctDisplay && !prevEliminated.includes(idx));
      const removable = remainingWrongs.length - 1;
      if (removable <= 0) {
        const err = new Error('SKILL_UNAVAILABLE');
        err.code = 'SKILL_UNAVAILABLE';
        err.reason = 'NOTHING_TO_ELIMINATE';
        throw err;
      }
      const picked = shuffle(remainingWrongs).slice(0, Math.min(1, removable));
      eliminated = [...prevEliminated, ...picked];
      db.prepare('UPDATE session_questions SET eliminated_json=? WHERE id=?').run(JSON.stringify(eliminated), sq.id);
    } else if (skillId === 'eagle_eye') {
      let order = [];
      try { order = JSON.parse(sq.option_order); } catch (e) {}
      const correctDisplay = order.indexOf(sq.answer_index);
      let prevEliminated = [];
      try { prevEliminated = JSON.parse(sq.eliminated_json || '[]'); } catch (e) {}
      const remainingWrongs = [0, 1, 2, 3].filter(idx => idx !== correctDisplay && !prevEliminated.includes(idx));
      const removable = remainingWrongs.length - 1;
      if (removable <= 0) {
        const err = new Error('SKILL_UNAVAILABLE');
        err.code = 'SKILL_UNAVAILABLE';
        err.reason = 'NOTHING_TO_ELIMINATE';
        throw err;
      }
      const toEliminate = shuffle(remainingWrongs).slice(0, Math.min(2, removable));
      eliminated = [...new Set([...prevEliminated, ...toEliminate])];
      db.prepare('UPDATE session_questions SET eliminated_json=? WHERE id=?').run(JSON.stringify(eliminated), sq.id);
    } else if (skillId === 'heal') {
      const healAmounts = [25, 35, 45, 55, 65];
      healed = healAmounts[sLevel - 1] || (25 + (sLevel - 1) * 10);
      const newHp = Math.min(s.player_max_hp, s.player_hp + healed);
      db.prepare('UPDATE game_sessions SET player_hp=? WHERE id=?').run(newHp, s.id);
      s.player_hp = newHp;
    } else if (skillId === 'shield') {
      const shieldAmounts = [20, 30, 50, 70, 100];
      shield = shieldAmounts[sLevel - 1] || 20;
      flags.shield = Math.max(flags.shield || 0, shield);
    } else if (skillId === 'power_strike') {
      const mults = [2.0, 2.5, 3.0, 3.5, 4.0];
      const powerMult = mults[sLevel - 1] || 2.0;
      db.prepare('UPDATE session_questions SET power_mult=? WHERE id=?').run(powerMult, sq.id);
    } else if (skillId === 'time_freeze') {
      const freezeSecs = [5, 7, 9, 12, 15];
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
    energy: { value: newEnergy, max: 5 },
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
    sq = db.prepare(`
      SELECT sq.*, q.answer_index, q.explanation, q.time_limit_sec as q_time_limit, q.eff_difficulty,
             COALESCE(q.question_type, 'MCQ') as question_type, q.type_data_json, sq.display_json
      FROM session_questions sq
      JOIN questions q ON q.id = sq.question_id
      WHERE sq.session_id=? AND (sq.question_id=? OR sq.order_index=?)
    `).get(sessionId, questionIdentifier, questionIdentifier);
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
  if (sq.answered_at) throw new Error('ALREADY_ANSWERED');

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
      const spec = {
        accept: typeData.accepted || typeData.answers || (typeData.accept ? (Array.isArray(typeData.accept) ? typeData.accept : [typeData.accept]) : []),
        numeric: typeData.numeric || (typeData.isNumeric ? { value: parseNumberId(typeData.accepted ? typeData.accepted[0] : 0), tolerance: typeData.tolerance || 0.001 } : null)
      };
      const gradeRes = gradeShort(String(userChoice), spec);
      isCorrect = Boolean(gradeRes && (gradeRes.correct ?? gradeRes));
      const correctText = (spec.numeric && spec.numeric.value !== undefined)
        ? String(spec.numeric.value)
        : (spec.accept && spec.accept[0] ? String(spec.accept[0]) : '');
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
  const rawBossDamage = isCorrect ? Math.max(1, Math.round((baseBossDamage + comboBonus) * powerMult * weakMult * bonusMult)) : 0;
  const cap35Pct = Math.ceil(s.boss_max_hp * 0.35);
  const bossDamage = Math.min(rawBossDamage, cap35Pct);

  // Shield absorbing player damage
  let flags = {};
  try { flags = JSON.parse(s.flags_json || '{}'); } catch (e) {}
  let shieldLeft = flags.shield || 0;
  let finalPlayerDamage = rawPlayerDamage;
  if (rawPlayerDamage > 0 && shieldLeft > 0) {
    if (shieldLeft >= rawPlayerDamage) {
      shieldLeft -= rawPlayerDamage;
      finalPlayerDamage = 0;
    } else {
      finalPlayerDamage -= shieldLeft;
      shieldLeft = 0;
    }
    flags.shield = shieldLeft;
  }

  // Boss heal (e.g. laut jurus)
  let bossHeal = 0;
  if (!isCorrect && s.monster_theme === 'laut') bossHeal = 8;

  const newBossHp = Math.max(0, Math.min(s.boss_max_hp, s.boss_hp - bossDamage + bossHeal));
  const newPlayerHp = Math.min(s.player_max_hp, Math.max(0, s.player_hp - finalPlayerDamage + healAmount));
  const newStreak = streak;
  const newMaxStreak = Math.max(s.max_streak, newStreak);
  const newCorrectCount = s.correct_count + (isCorrect ? 1 : 0);
  const newCriticalCount = s.critical_count + (outcome === 'CRITICAL' ? 1 : 0);

  // Energy update
  let energyDelta = 0;
  if (outcome === 'CRITICAL') energyDelta = 2;
  else if (outcome === 'NORMAL' || outcome === 'SLOW') energyDelta = 1;
  let newEnergy = Math.min(5, s.energy + energyDelta + mysteryEnergy);

  // Boss Phase 2 Transition Check (C.1 / T-20)
  const currentBossPhase = s.boss_phase || 1;
  const calculatedPhase = bossPhase(newBossHp, s.boss_max_hp);
  let phaseChanged = false;
  let newBossPhase = currentBossPhase;

  if (currentBossPhase === 1 && calculatedPhase === 2) {
    newBossPhase = 2;
    phaseChanged = true;
    newEnergy = Math.min(5, newEnergy + 1); // +1 ⚡ Semangat!
  }

  // Check end conditions
  let newStatus = 'IN_PROGRESS';
  let endReason = null;
  const isLastQuestion = (sq.order_index + 1 >= s.total_questions);

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

      if (earnedToday + coins > ECONOMY.dailyCoinCap) {
        coins = Math.max(0, ECONOMY.dailyCoinCap - earnedToday);
        capReached = true;
      }
      droppedCoins = coins;
    }
  }

  let finalCoinBalance = pRow ? pRow.coins : 0;

  db.exec('BEGIN IMMEDIATE');
  try {
    // 1. Update session_question
    db.prepare(`
      UPDATE session_questions
      SET answered_at=?, chosen_display=?, outcome=?, elapsed_ms=?, reveal_json=?
      WHERE id=?
    `).run(nowIso, typeof userChoice === 'number' ? userChoice : -1, outcome, elapsedMs, JSON.stringify(reveal), sq.id);

    // 2. Apply drop coins if any
    if (droppedCoins > 0) {
      finalCoinBalance = applyCoins(db, playerId, droppedCoins, 'ANSWER_DROP');
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
        xpEarned = stars * 25 + newStreak * 2;
      } else {
        stars = 0;
        xpEarned = newCorrectCount * 5;
      }

      // Bonus XP untuk soal review yang benar (T-12)
      const reviewCorrectCount = db.prepare(`
        SELECT COUNT(*) as c
        FROM session_questions
        WHERE session_id=? AND is_review=1 AND outcome IN ('CRITICAL', 'NORMAL', 'SLOW')
      `).get(sessionId).c;
      xpEarned += reviewCorrectCount * (SPACED.bonusXp || 5);

      if (bossCoinsEarned > 0) {
        finalCoinBalance = applyCoins(db, playerId, bossCoinsEarned, 'BOSS_DEFEAT');
      }

      if (s.campaign_node) {
        const nodeInfo = parseNodeKey(s.campaign_node);
        if (nodeInfo) {
          const accPct = Math.round(accuracy * 100);
          const existingPcn = db.prepare('SELECT * FROM player_campaign_nodes WHERE player_id=? AND node_key=?').get(playerId, s.campaign_node);
          if (!existingPcn) {
            isFirstClear = true;
            firstClearCoins = CAMPAIGN_CFG.nodeFirstClearCoins(nodeInfo.chapter);
            applyCoins(db, playerId, firstClearCoins, 'CAMPAIGN_NODE_FIRST_CLEAR');
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
          finished_at = CASE WHEN ? IN ('WON','LOST') THEN ? ELSE finished_at END
      WHERE id=?
    `).run(
      newBossHp, newPlayerHp, newStreak, newMaxStreak,
      newCorrectCount, newCriticalCount, nextIdx,
      newEnergy, JSON.stringify(flags), newStatus, endReason,
      stars, xpEarned, droppedCoins + bossCoinsEarned,
      newBossPhase, pendingJsonToSave,
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
    energy: { value: newEnergy, max: 5 },
    drops: {
      coins: droppedCoins,
      item: droppedItem,
      capReached,
      coinBalance: finalCoinBalance
    },
    phaseChanged,
    boss: { hp: newBossHp, maxHp: s.boss_max_hp, phase: newBossPhase },
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
      coins: updatedSession.coins_earned + firstClearCoins,
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
        const today = new Date().toISOString().slice(0, 10);
        const earnedToday = (pRow.last_active_date === today) ? (pRow.coins_earned_today || 0) : 0;
        if (earnedToday + coins > ECONOMY.dailyCoinCap) {
          coins = Math.max(0, ECONOMY.dailyCoinCap - earnedToday);
        }
        if (coins > 0) {
          db.prepare('UPDATE players SET coins_earned_today = coins_earned_today + ? WHERE id=?').run(coins, playerId);
          applyCoins(db, playerId, coins, 'EVENT_TREASURE');
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
          const today = new Date().toISOString().slice(0, 10);
          const earnedToday = (pRow.last_active_date === today) ? (pRow.coins_earned_today || 0) : 0;
          if (earnedToday + coins > ECONOMY.dailyCoinCap) {
            coins = Math.max(0, ECONOMY.dailyCoinCap - earnedToday);
          }
          if (coins > 0) {
            db.prepare('UPDATE players SET coins_earned_today = coins_earned_today + ? WHERE id=?').run(coins, playerId);
            applyCoins(db, playerId, coins, 'EVENT_TRAP');
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
    return {
      id: m.id,
      name: m.name,
      theme: m.theme,
      encountered: Boolean(stat && stat.encounters > 0),
      defeated: Boolean(stat && stat.defeats > 0),
      encounters: stat ? stat.encounters : 0,
      defeats: stat ? stat.defeats : 0,
      bestStars: stat ? stat.best_stars : 0,
      bestStreak: stat ? stat.best_streak : 0,
    };
  });
}

/* ── Admin APIs ── */
function getAdminOverview() {
  const db = getDb();
  const totalPlayers = db.prepare('SELECT count(*) as c FROM players').get().c;
  const totalQuestions = db.prepare('SELECT count(*) as c FROM questions WHERE is_active=1').get().c;
  const totalSessions = db.prepare('SELECT count(*) as c FROM game_sessions').get().c;
  const wonSessions = db.prepare("SELECT count(*) as c FROM game_sessions WHERE status='WON'").get().c;

  return {
    totalPlayers,
    totalQuestions,
    totalSessions,
    winRate: totalSessions > 0 ? Math.round((wonSessions / totalSessions) * 100) : 0,
  };
}

function adminGetClasses() {
  return getClasses();
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

function adminGetPlayers() {
  const db = getDb();
  const rows = db.prepare('SELECT id, nick, xp, class_id, coins, created_at, last_login_at FROM players ORDER BY xp DESC LIMIT 100').all();
  return rows.map(r => ({
    ...r,
    level: GAME.levelFormula(r.xp),
  }));
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

module.exports = {
  GAME, THEMES, MONSTERS, SCHEMA,
  createDatabase, getDb, seedDatabase,
  questionHash, hashPassword, verifyPassword, uuid,
  applyCoins,
  // Player
  registerPlayer, loginPlayer, getPlayerById, getPlayerProfile, updatePlayerClass, updatePlayerAvatar,
  getPlayerSettings, updatePlayerSettings,
  // Inventory, Shop, Skills
  getInventory, getShop, buyShopItem, buyMysteryBox, getCoinHistory,
  getSkills, getPlayerLoadout, getPlayerSkillLevels, updateLoadout, upgradeSkill, ensurePlayerSkills,
  // Admin
  loginAdmin, getAdminOverview, adminGetClasses, adminGetSubjects, adminGetQuestions,
  adminSaveQuestion, adminDeleteQuestion, adminGetPlayers, adminResetPlayerPassword,
  adminExportQuestions, adminImportQuestions,
  // Classes / Subjects
  getClasses, getSubjectsByClass,
  // Battle Sessions
  startSession, getSession, nextQuestion, readyQuestion, useSkill, answerQuestion, abandonSession, resolveEvent,
  getCampaign, buildCampaign, parseNodeKey,
  skillAvailability, getSkillAvailability,
  reconcileSession, getActiveSession, heartbeatSession, resumeSession,
  getIdempotency, saveIdempotency,
  // Dex
  getDex,
  // Reports
  getWeeklyReport, saveWeeklyReport, createReportShare, revokeReportShare,
  getReportByShareToken, generateAllWeeklyReports, getClassWeeklyReports, exportClassReportsCsv,
  DB_PATH, SEED_DIR,
};
