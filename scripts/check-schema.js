'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

// Trigger migrations via lib/db getDb()
const dbModule = require('../lib/db.js');
const db = dbModule.getDb();

let errorsFound = 0;

console.log('=== PEMERIKSAAN SKEMA DATABASE SQLITE (v5.2) ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();

const schemaMap = {};
for (const t of tables) {
  const cols = db.prepare(`PRAGMA table_info("${t.name}")`).all();
  schemaMap[t.name] = cols.map(c => c.name);
  console.log(`[TABLE] ${t.name} (${cols.length} kolom): ${schemaMap[t.name].join(', ')}`);
}

// Pemeriksaan tabel wajib v5.2
console.log('\n=== AUDIT TABEL WAJIB v5.2 ===');
const requiredTables = [
  'players',
  'game_sessions',
  'session_questions',
  'coin_transactions',
  'player_skills',
  'player_loadout',
  'player_items',
  'player_campaign_nodes',
  'weekly_reports',
  'report_shares',
  'class_raids',
  'class_raid_damages',
  // Fitur v7
  'player_presence',
  'friend_requests',
  'friendships',
  'duels',
  'duel_questions',
  'duel_answers',
  'duel_skill_uses',
  'duel_events'
];

for (const reqT of requiredTables) {
  if (!schemaMap[reqT]) {
    console.log(`❌ ERROR: Tabel inti '${reqT}' TIDAK ditemukan!`);
    errorsFound++;
  } else {
    console.log(`✅ Tabel '${reqT}' aktif.`);
  }
}

// Pemeriksaan kolom v5.2
console.log('\n=== AUDIT KOLOM BARU v5.2 ===');
const columnChecks = [
  { table: 'questions', col: 'question_type' },
  { table: 'questions', col: 'type_data_json' },
  { table: 'questions', col: 'topic_tag' },
  { table: 'session_questions', col: 'is_review' },
  { table: 'session_questions', col: 'is_weak' },
  { table: 'session_questions', col: 'is_bonus' },
  { table: 'session_questions', col: 'is_mystery' },
  { table: 'session_questions', col: 'display_json' },
  { table: 'session_questions', col: 'reveal_json' },
  { table: 'session_questions', col: 'bonus_roll' },
  { table: 'game_sessions', col: 'boss_phase' },
  { table: 'game_sessions', col: 'weak_topic' },
  { table: 'game_sessions', col: 'pending_event_json' },
  { table: 'game_sessions', col: 'campaign_node' },
  { table: 'game_sessions', col: 'pace_used' },
  { table: 'player_question_stats', col: 'box' },
  { table: 'player_question_stats', col: 'lapses' },
  { table: 'player_question_stats', col: 'due_at' },
  { table: 'player_question_stats', col: 'mastered' },
  { table: 'player_subject_progress', col: 'pace_factor' },
  { table: 'players', col: 'settings_json' },
  { table: 'subjects', col: 'grade' },
  // v6
  { table: 'game_sessions', col: 'boss_tier' },
  { table: 'game_sessions', col: 'boss_hits_needed' },
  { table: 'game_sessions', col: 'boss_hit_unit' },
  { table: 'game_sessions', col: 'monster_damage' },
  { table: 'game_sessions', col: 'max_questions' },
  { table: 'game_sessions', col: 'correct_count' },
  { table: 'game_sessions', col: 'wrong_streak' },
  { table: 'game_sessions', col: 'fatigue_applied' },
  { table: 'game_sessions', col: 'energy_max' },
  { table: 'player_skills', col: 'level' },
  // v7: Skill Boss per Elemen, Mode Brutal
  { table: 'game_sessions', col: 'boss_element' },
  { table: 'game_sessions', col: 'brutal' },
  { table: 'game_sessions', col: 'boss_fx_json' }
];

for (const item of columnChecks) {
  if (!schemaMap[item.table] || !schemaMap[item.table].includes(item.col)) {
    console.log(`❌ ERROR: Kolom '${item.col}' pada tabel '${item.table}' TIDAK ditemukan!`);
    errorsFound++;
  } else {
    console.log(`✅ [${item.table}] memiliki kolom '${item.col}'`);
  }
}

// Analisis kode lib/db.js untuk query SQL yang berpotensi salah kolom
console.log('\n=== AUDIT SQL QUERIES PADA lib/db.js ===');
const dbJsContent = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');

const sqlRegex = /(?:prepare|exec)\s*\(\s*[`'"]([\s\S]*?)[`'"]\s*\)/g;
let match;
let queryCount = 0;

while ((match = sqlRegex.exec(dbJsContent)) !== null) {
  const rawSql = match[1].trim();
  if (!rawSql || rawSql.length < 10) continue;
  queryCount++;

  // Cek sederhana tabel game_sessions
  if (/FROM\s+game_sessions/i.test(rawSql) || /UPDATE\s+game_sessions/i.test(rawSql) || /INSERT\s+INTO\s+game_sessions/i.test(rawSql)) {
    if (/\bcreated_at\b/i.test(rawSql) && !schemaMap.game_sessions.includes('created_at')) {
      console.log(`❌ ERROR QUERY [game_sessions]: Menyebut 'created_at' padahal tidak ada di skema!`);
      errorsFound++;
    }
  }
}

console.log(`\nAudit selesai. Memeriksa ${queryCount} query.`);
if (errorsFound > 0) {
  console.log(`❌ Ditemukan ${errorsFound} potensi kesalahan skema vs kode.`);
  process.exitCode = 1;
} else {
  console.log(`✅ Skema v5.2 100% valid tanpa kesalahan.`);
}
