'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.join(__dirname, '..', 'data', 'play.db');
const db = new DatabaseSync(dbPath);

console.log('=== PEMERIKSAAN SKEMA DATABASE SQLITE ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();

const schemaMap = {};
for (const t of tables) {
  const cols = db.prepare(`PRAGMA table_info("${t.name}")`).all();
  schemaMap[t.name] = cols.map(c => c.name);
  console.log(`[TABLE] ${t.name} (${cols.length} kolom): ${schemaMap[t.name].join(', ')}`);
}

// Pemeriksaan khusus untuk tabel game_sessions
console.log('\n=== AUDIT game_sessions & CORE TABLES ===');
const requiredTables = ['players', 'game_sessions', 'session_questions', 'coin_transactions', 'player_skills', 'player_loadout', 'player_items'];
for (const reqT of requiredTables) {
  if (!schemaMap[reqT]) {
    console.log(`❌ ERROR: Tabel inti '${reqT}' TIDAK ditemukan!`);
    errorsFound++;
  }
}

if (!schemaMap.game_sessions || !schemaMap.game_sessions.includes('created_at')) {
  console.log('❌ ERROR: game_sessions TIDAK memiliki kolom created_at!');
  errorsFound++;
} else {
  console.log('✅ game_sessions memiliki kolom created_at');
}

// Analisis kode lib/db.js untuk query SQL yang berpotensi salah kolom
console.log('\n=== AUDIT SQL QUERIES PADA lib/db.js ===');
const dbJsContent = fs.readFileSync(path.join(__dirname, '..', 'lib', 'db.js'), 'utf8');

// Temukan semua string SQL sederhana
const sqlRegex = /(?:prepare|exec)\s*\(\s*[`'"]([\s\S]*?)[`'"]\s*\)/g;
let match;
let queryCount = 0;
let errorsFound = 0;

while ((match = sqlRegex.exec(dbJsContent)) !== null) {
  const rawSql = match[1].trim();
  if (!rawSql || rawSql.length < 10) continue;
  queryCount++;

  // Cek sederhana tabel game_sessions
  if (/FROM\s+game_sessions/i.test(rawSql) || /UPDATE\s+game_sessions/i.test(rawSql) || /INSERT\s+INTO\s+game_sessions/i.test(rawSql)) {
    if (/\bcreated_at\b/i.test(rawSql) && !schemaMap.game_sessions.includes('created_at')) {
      console.log(`❌ ERROR QUERY [game_sessions]: Menyebut 'created_at' padahal tidak ada di skema!`);
      console.log(`   SQL: ${rawSql.replace(/\s+/g, ' ').slice(0, 120)}...`);
      errorsFound++;
    }
  }
}

console.log(`\nAudit selesai. Memeriksa ${queryCount} query.`);
if (errorsFound > 0) {
  console.log(`❌ Ditemukan ${errorsFound} potensi kesalahan skema vs kode.`);
  process.exitCode = 1;
} else {
  console.log(`✅ Tidak ada kesalahan kolom yang terdeteksi.`);
}
