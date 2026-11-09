'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const tmpDbPath = path.join(__dirname, 'test-campaign-weekly.db');
for (const ext of ['', '-wal', '-shm']) {
  if (fs.existsSync(tmpDbPath + ext)) {
    try { fs.unlinkSync(tmpDbPath + ext); } catch (_) {}
  }
}

process.env.PLAY_DB_PATH = tmpDbPath;
const db = require('../lib/db');
const { getWeeklyResetTime, getNextWeeklyResetTime } = require('../shared/campaign');
db.createDatabase();

function cleanup() {
  try { db.getDb().close(); } catch (_) {}
  for (const ext of ['', '-wal', '-shm']) {
    if (fs.existsSync(tmpDbPath + ext)) {
      try { fs.unlinkSync(tmpDbPath + ext); } catch (_) {}
    }
  }
}

function getCorrectDisplayIdx(rawDb, sq) {
  const qRow = rawDb.prepare('SELECT answer_index FROM questions WHERE id=?').get(sq.question_id);
  let order = [0, 1, 2, 3];
  if (sq.display_json) {
    try {
      const dj = JSON.parse(sq.display_json);
      if (Array.isArray(dj.optionOrder)) order = dj.optionOrder;
    } catch (_) {}
  } else if (sq.option_order) {
    try { order = JSON.parse(sq.option_order); } catch (_) {}
  }
  return order.indexOf(qRow.answer_index);
}

test('Mode Cerita: Reset Mingguan Senin 07:00 WIB & Gacha Box Wilayah 3', async (t) => {
  t.after(cleanup);

  const rawDb = db.getDb();
  const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Uji Mingguan', 1)").run();
  const clsId = Number(clsInfo.lastInsertRowid);

  const subInfo = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, color, monster_theme) VALUES(?, 'Petualangan Mingguan', '🗺️', '#2ECC71', 'hutan')").run(clsId);
  const subjectId = Number(subInfo.lastInsertRowid);

  // Buat bank soal MCQ
  for (let tier = 1; tier <= 5; tier++) {
    for (let i = 0; i < 20; i++) {
      rawDb.prepare(`
        INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, hash, is_active, question_type)
        VALUES(?, ?, ?, 0, 'Penjelasan', ?, ?, 1, 'MCQ')
      `).run(subjectId, `Soal Tier ${tier} No ${i}`, JSON.stringify(['A', 'B', 'C', 'D']), tier, `hash_test_w_${tier}_${i}`);
    }
  }

  const p = db.registerPlayer('weeklytester', 'pass1234', clsId);

  await t.test('1. Perhitungan Waktu Reset Mingguan Tepat Hari Senin Jam 07:00 WIB (00:00 UTC)', () => {
    // Uji tanggal acak: Sabtu 7 Nov 2026 jam 18:00 WIB (11:00 UTC)
    const testNow = new Date('2026-11-07T11:00:00.000Z');
    const lastReset = getWeeklyResetTime(testNow);
    const nextReset = getNextWeeklyResetTime(testNow);

    // Senin minggu ini: 2 Nov 2026 jam 00:00 UTC = 07:00 WIB
    assert.equal(lastReset.toISOString(), '2026-11-02T00:00:00.000Z');
    assert.equal(nextReset.toISOString(), '2026-11-09T00:00:00.000Z');

    // Uji tepat hari Senin jam 06:59 WIB (Minggu 23:59 UTC): belum reset
    const beforeReset = new Date('2026-11-08T23:59:00.000Z');
    assert.equal(getWeeklyResetTime(beforeReset).toISOString(), '2026-11-02T00:00:00.000Z');

    // Uji hari Senin jam 07:01 WIB (Senin 00:01 UTC): sudah masuk minggu baru
    const afterReset = new Date('2026-11-09T00:01:00.000Z');
    assert.equal(getWeeklyResetTime(afterReset).toISOString(), '2026-11-09T00:00:00.000Z');
  });

  await t.test('2. Selesaikan Wilayah 1-1, maka Wilayah 1-1 hanya bisa 1x per minggu', () => {
    const session = db.startSession(p.id, subjectId, { campaignNode: `s${subjectId}-c1-n1` });
    const sId = session.sessionId;

    rawDb.prepare('UPDATE game_sessions SET boss_hp=1 WHERE id=?').run(sId);
    const sq0 = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=0').get(sId);
    const corr0 = getCorrectDisplayIdx(rawDb, sq0);

    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), sq0.id);

    const ans = db.answerQuestion(sId, p.id, sq0.question_id, corr0);
    assert.equal(ans.session.status, 'WON');

    // Cek campaign status
    const camp = db.getCampaign(p.id, subjectId);
    const node11 = camp.chapters[0].nodes[0];
    const node12 = camp.chapters[0].nodes[1];

    assert.equal(node11.clearedThisWeek, true, 'Node 1-1 harus cleared this week');
    assert.equal(node11.canPlay, false, 'Node 1-1 tidak boleh dimainkan lagi di minggu yang sama (hanya 1x)');
    assert.equal(node12.unlocked, true, 'Node 1-2 sekarang terbuka');
    assert.equal(node12.canPlay, true, 'Node 1-2 siap dimainkan');

    // Coba mulai sesi lagi di Wilayah 1-1 di minggu yang sama: HARUS DITOLAK
    assert.throws(() => {
      db.startSession(p.id, subjectId, { campaignNode: `s${subjectId}-c1-n1` });
    }, (err) => {
      return err.code === 'NODE_ALREADY_CLEARED_THIS_WEEK' || err.message.includes('minggu ini');
    }, 'Memulai wilayah yang sudah selesai di minggu ini harus gagal');
  });

  await t.test('3. Reset Mingguan: Setelah waktu reset Senin 07:00 WIB, wilayah dapat dimainkan kembali', () => {
    // Simulasikan node selesai di minggu lalu (misal 1 Oktober 2026)
    rawDb.prepare(`
      UPDATE player_campaign_nodes
      SET cleared_at = '2026-10-01T00:00:00.000Z'
      WHERE player_id=? AND node_key=?
    `).run(p.id, `s${subjectId}-c1-n1`);

    // Ambil campaign status di minggu saat ini
    const camp = db.getCampaign(p.id, subjectId);
    const node11 = camp.chapters[0].nodes[0];

    assert.equal(node11.clearedThisWeek, false, 'Node 1-1 harus reset (belum cleared this week)');
    assert.equal(node11.unlocked, true, 'Node 1-1 terbuka kembali');
    assert.equal(node11.canPlay, true, 'Node 1-1 dapat dimainkan kembali setelah reset!');

    // Pemain sekarang bisa memulai kembali sesi di Wilayah 1-1!
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(p.id);
    const sessionAgain = db.startSession(p.id, subjectId, { campaignNode: `s${subjectId}-c1-n1` });
    assert.ok(sessionAgain.sessionId, 'Sesi berhasil dimulai kembali setelah reset mingguan');
    assert.equal(sessionAgain.ok, true);

    // Bersihkan sesi aktif sebelum tes berikutnya
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(p.id);
  });

  await t.test('4. Gacha Box Wilayah 3: Menghasilkan hadiah sesuai rate baru (Common, Rare, Epic, Legend, Koin)', () => {
    // Bersihkan sesi aktif
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(p.id);

    // Buka Wilayah 1-3
    rawDb.prepare(`
      INSERT OR REPLACE INTO player_campaign_nodes(player_id, node_key, stars, best_accuracy, cleared_at)
      VALUES(?, ?, 3, 100, ?)
    `).run(p.id, `s${subjectId}-c1-n1`);
    rawDb.prepare(`
      INSERT OR REPLACE INTO player_campaign_nodes(player_id, node_key, stars, best_accuracy, cleared_at)
      VALUES(?, ?, 3, 100, ?)
    `).run(p.id, `s${subjectId}-c1-n2`, new Date().toISOString());

    // Selesaikan wilayah 1-3 (Boss Bab)
    const session = db.startSession(p.id, subjectId, { campaignNode: `s${subjectId}-c1-n3` });
    const sId = session.sessionId;

    rawDb.prepare('UPDATE game_sessions SET boss_hp=1 WHERE id=?').run(sId);
    const sq0 = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=0').get(sId);
    const corr0 = getCorrectDisplayIdx(rawDb, sq0);

    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), sq0.id);

    const ans = db.answerQuestion(sId, p.id, sq0.question_id, corr0);
    assert.equal(ans.session.status, 'WON');
    assert.equal(ans.rewards.chapterCompleted, true);
    assert.ok(Array.isArray(ans.rewards.items), 'Rewards items harus array');
    assert.equal(ans.rewards.items.length, 1, 'Harus mendapatkan 1 hadiah dari box wilayah 3');

    const item = ans.rewards.items[0];
    assert.ok(item, 'Item harus ada');

    if (item.isCoinReward) {
      assert.equal(item.slot, 'coin');
      assert.ok(item.coinAmount >= 10 && item.coinAmount <= 50, `Koin harus antara 10-50, didapat: ${item.coinAmount}`);
    } else {
      assert.ok(['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].includes(item.rarity), `Rarity harus salah satu dari COMMON, RARE, EPIC, LEGENDARY, didapat: ${item.rarity}`);
    }
  });
});