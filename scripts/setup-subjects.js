#!/usr/bin/env node
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = '/home/maman/play/data/play.db';
const db = new DatabaseSync(DB_PATH);

const SUBJECTS_TO_REGISTER = [
  { name: 'Matematika', icon: '➗', color: '#FF8A3D', monster_theme: 'mesin', question_count: 10, time_limit_sec: 20 },
  { name: 'Bahasa Indonesia', icon: '📖', color: '#3A86FF', monster_theme: 'hutan', question_count: 10, time_limit_sec: 20 },
  { name: 'IPAS', icon: '🌿', color: '#33C16B', monster_theme: 'hutan', question_count: 10, time_limit_sec: 20 },
  { name: 'Pendidikan Pancasila', icon: '🦅', color: '#E63946', monster_theme: 'langit', question_count: 10, time_limit_sec: 20 },
  { name: 'Akidah Akhlak', icon: '🕌', color: '#06D6A0', monster_theme: 'langit', question_count: 10, time_limit_sec: 20 },
  { name: "Al-Qur'an Hadis", icon: '📖', color: '#118AB2', monster_theme: 'gua', question_count: 10, time_limit_sec: 25 },
  { name: 'Fikih', icon: '⚖️', color: '#073B4C', monster_theme: 'gua', question_count: 10, time_limit_sec: 20 },
  { name: 'SKI', icon: '📜', color: '#D4A373', monster_theme: 'api', question_count: 10, time_limit_sec: 20 },
  { name: 'Bahasa Arab', icon: '🌙', color: '#2A9D8F', monster_theme: 'manis', question_count: 10, time_limit_sec: 25 },
  { name: 'PJOK', icon: '⚽', color: '#F77F00', monster_theme: 'api', question_count: 10, time_limit_sec: 20 },
  { name: 'Seni Budaya', icon: '🎨', color: '#9B5DE5', monster_theme: 'rawa', question_count: 10, time_limit_sec: 20 },
  { name: 'Bahasa Inggris', icon: '🗣️', color: '#4361EE', monster_theme: 'es', question_count: 10, time_limit_sec: 20 }
];

console.log('🔄 Memperbarui status mapel di database play.db...');

db.exec('BEGIN IMMEDIATE');
try {
  // 1. Deactivate old IPA (id: 2) as requested by Juragan
  db.prepare("UPDATE subjects SET is_active=0 WHERE id=2 OR (class_id=1 AND name='IPA')").run();
  console.log('✅ Mapel IPA lama (id: 2) berhasil dinonaktifkan (is_active = 0).');

  // 2. Register / Update the 12 subjects for class_id = 1
  const checkSubj = db.prepare('SELECT id FROM subjects WHERE class_id=1 AND name=?');
  const insertSubj = db.prepare(`
    INSERT INTO subjects (class_id, name, icon, color, monster_theme, question_count, time_limit_sec, is_active)
    VALUES (1, ?, ?, ?, ?, ?, ?, 1)
  `);
  const updateSubj = db.prepare(`
    UPDATE subjects SET
      icon=?, color=?, monster_theme=?, question_count=?, time_limit_sec=?, is_active=1
    WHERE id=?
  `);

  for (const s of SUBJECTS_TO_REGISTER) {
    const existing = checkSubj.get(s.name);
    if (existing) {
      updateSubj.run(s.icon, s.color, s.monster_theme, s.question_count, s.time_limit_sec, existing.id);
      console.log(`  [UPDATE] Subject '${s.name}' (id: ${existing.id}) aktif & terkonfigurasi.`);
    } else {
      const res = insertSubj.run(s.name, s.icon, s.color, s.monster_theme, s.question_count, s.time_limit_sec);
      console.log(`  [INSERT] Subject '${s.name}' (id: ${Number(res.lastInsertRowid)}) berhasil didaftarkan.`);
    }
  }

  db.exec('COMMIT');
  console.log('🎉 Seluruh 12 mata pelajaran untuk Kelas 4 SD berhasil disinkronkan!');
} catch (e) {
  db.exec('ROLLBACK');
  console.error('❌ Gagal setup subjects:', e.message);
  process.exit(1);
}

const activeSubjects = db.prepare('SELECT id, name, icon, color, monster_theme, is_active FROM subjects WHERE class_id=1').all();
console.log('\n--- Daftar Subjek Kelas 4 SD di Database ---');
console.table(activeSubjects);
