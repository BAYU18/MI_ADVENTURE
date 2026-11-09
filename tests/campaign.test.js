'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const tmpDbPath = path.join(__dirname, 'test-campaign.db');
for (const ext of ['', '-wal', '-shm']) {
  if (fs.existsSync(tmpDbPath + ext)) {
    try { fs.unlinkSync(tmpDbPath + ext); } catch (_) {}
  }
}

process.env.PLAY_DB_PATH = tmpDbPath;
const db = require('../lib/db');
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

test('Skenario 13.2 #10 / T-34: Peta Cerita / Kampanye (E.1, F.3)', async (t) => {
  t.after(cleanup);

  const rawDb = db.getDb();
  const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Cerita', 1)").run();
  const clsId = Number(clsInfo.lastInsertRowid);

  const subInfo = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, color, monster_theme) VALUES(?, 'Matematika Cerita', '🗺️', '#2ECC71', 'hutan')").run(clsId);
  const subjectId = Number(subInfo.lastInsertRowid);

  // Buat soal dengan variasi difficulty 1..5
  for (let tier = 1; tier <= 5; tier++) {
    for (let i = 0; i < 20; i++) {
      rawDb.prepare(`
        INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, hash, is_active, question_type)
        VALUES(?, ?, ?, 0, 'Penjelasan', ?, ?, 1, 'MCQ')
      `).run(subjectId, `Soal Tier ${tier} No ${i}`, JSON.stringify(['A', 'B', 'C', 'D']), tier, `hash_camp_${tier}_${i}`);
    }
  }

  // Tambahkan soal non-MCQ untuk memverifikasi Mode Cerita HANYA mengambil MCQ
  rawDb.prepare(`
    INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, hash, is_active, question_type)
    VALUES(?, 'Soal True False Non-MCQ', ?, 0, 'Penjelasan', 1, 'hash_tf_camp', 1, 'TRUE_FALSE')
  `).run(subjectId, JSON.stringify(['Benar', 'Salah']));

  const p = db.registerPlayer('ceritaplayer', 'pass1234', clsId);

  await t.test('1. Struktur Kampanye: 4 bab x 3 wilayah, wilayah 1 terbuka default, sisanya terkunci', () => {
    const camp = db.getCampaign(p.id, subjectId);
    assert.equal(camp.chapters.length, 4, 'Harus memiliki 4 bab');
    assert.equal(camp.chapters[0].nodes.length, 3, 'Setiap bab harus memiliki 3 wilayah');
    
    // Wilayah 1-1 harus terbuka
    const node11 = camp.chapters[0].nodes[0];
    assert.equal(node11.unlocked, true, 'Wilayah 1-1 harus terbuka');
    assert.equal(node11.isBoss, false);
    assert.equal(node11.questionCount, 15, 'Wilayah 1 harus 15 soal');

    // Wilayah 1-2 dan seterusnya harus terkunci
    const node12 = camp.chapters[0].nodes[1];
    assert.equal(node12.unlocked, false, 'Wilayah 1-2 harus terkunci sebelum wilayah 1-1 selesai');
    assert.equal(node12.questionCount, 20, 'Wilayah 2 harus 20 soal');

    // Wilayah 1-3 harus berupa Boss Bab dengan 25 soal
    const node13 = camp.chapters[0].nodes[2];
    assert.equal(node13.isBoss, true, 'Wilayah 3 harus berupa Boss Bab');
    assert.equal(node13.questionCount, 25, 'Wilayah 3 harus 25 soal');
  });

  await t.test('2. Memulai simpul terkunci -> NODE_LOCKED error', () => {
    assert.throws(() => {
      db.startSession(p.id, subjectId, { campaignNode: `s${subjectId}-c1-n2` });
    }, (err) => {
      return err.message === 'NODE_LOCKED';
    }, 'Memulai simpul yang terkunci harus gagal dengan NODE_LOCKED');
  });

  await t.test('3. Memulai dan Menyelesaikan Wilayah 1-1 (15 Soal, First Clear Reward 20 + 10*1 = 30 koin)', () => {
    const initialCoins = db.getPlayerById(p.id).coins;
    const session = db.startSession(p.id, subjectId, { campaignNode: `s${subjectId}-c1-n1` });
    assert.equal(session.totalQuestions, 15, 'Wilayah 1 harus memiliki 15 soal');

    // Verifikasi semua soal di sesi Mode Cerita adalah MCQ saja
    const sessionQuestions = rawDb.prepare(`
      SELECT q.question_type
      FROM session_questions sq
      JOIN questions q ON q.id = sq.question_id
      WHERE sq.session_id = ?
    `).all(session.sessionId);
    for (const sq of sessionQuestions) {
      assert.ok(!sq.question_type || sq.question_type === 'MCQ', 'Soal Mode Cerita harus tipe MCQ');
    }

    // Jawab sampai selesai
    const sId = session.sessionId;
    // Set HP boss ke 1 agar sekali jawab langsung menang
    rawDb.prepare('UPDATE game_sessions SET boss_hp=1 WHERE id=?').run(sId);

    const sq0 = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=0').get(sId);
    const corr0 = getCorrectDisplayIdx(rawDb, sq0);

    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), sq0.id);

    const ans = db.answerQuestion(sId, p.id, sq0.question_id, corr0);
    assert.equal(ans.session.status, 'WON', 'Sesi harus berstatus WON');
    assert.ok(ans.rewards, 'Rewards harus dikembalikan');
    assert.equal(ans.rewards.firstClear, true, 'Harus first clear');
    assert.equal(ans.rewards.firstClearCoins, 30, 'First clear coins bab 1 harus 20 + 10*1 = 30');

    // Koin pemain harus bertambah
    const aftPlayer = db.getPlayerById(p.id);
    assert.ok(aftPlayer.coins >= initialCoins + 30, 'Koin pemain harus bertambah minimal 30');

    // Wilayah 1-2 sekarang harus terbuka!
    const campAft = db.getCampaign(p.id, subjectId);
    assert.equal(campAft.chapters[0].nodes[0].cleared, true, 'Wilayah 1-1 harus cleared');
    assert.equal(campAft.chapters[0].nodes[1].unlocked, true, 'Wilayah 1-2 sekarang harus terbuka');
  });

  await t.test('4. Aturan 1x per Minggu & Replay Setelah Reset Mingguan', () => {
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(p.id);

    // Di minggu yang sama, replay Wilayah 1-1 HARUS DITOLAK (hanya 1x per minggu)
    assert.throws(() => {
      db.startSession(p.id, subjectId, { campaignNode: `s${subjectId}-c1-n1` });
    }, (err) => {
      return err.code === 'NODE_ALREADY_CLEARED_THIS_WEEK' || err.message.includes('minggu ini');
    }, 'Replay di minggu yang sama harus ditolak');

    // Simulasikan setelah reset mingguan (cleared_at diset ke minggu lalu)
    rawDb.prepare(`
      UPDATE player_campaign_nodes
      SET cleared_at = '2026-10-01T00:00:00.000Z'
      WHERE player_id=? AND node_key=?
    `).run(p.id, `s${subjectId}-c1-n1`);

    const session = db.startSession(p.id, subjectId, { campaignNode: `s${subjectId}-c1-n1` });
    const sId = session.sessionId;

    rawDb.prepare('UPDATE game_sessions SET boss_hp=1 WHERE id=?').run(sId);
    const sq0 = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=0').get(sId);
    const corr0 = getCorrectDisplayIdx(rawDb, sq0);

    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), sq0.id);

    const ans = db.answerQuestion(sId, p.id, sq0.question_id, corr0);
    assert.equal(ans.session.status, 'WON');
    assert.equal(ans.rewards.firstClear, false, 'Replay tidak boleh first clear');
    assert.equal(ans.rewards.firstClearCoins, 0, 'First clear coins replay harus 0');
  });

  await t.test('5. Selesai Boss Bab 1-3: 25 Soal, Chapter Selesai, Bab 2 Terbuka, Dapat Item Skin & Komik', () => {
    // Tandai wilayah 1-2 sebagai sudah selesai
    rawDb.prepare(`
      INSERT INTO player_campaign_nodes(player_id, node_key, stars, best_accuracy, cleared_at)
      VALUES(?, ?, 3, 100, ?)
    `).run(p.id, `s${subjectId}-c1-n2`, new Date().toISOString());

    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(p.id);

    // Sekarang wilayah 1-3 (Boss Bab) harus terbuka
    const campCheck = db.getCampaign(p.id, subjectId);
    assert.equal(campCheck.chapters[0].nodes[2].unlocked, true, 'Wilayah 1-3 harus terbuka');

    // Mulai dan selesaikan wilayah 1-3 (25 soal)
    const session = db.startSession(p.id, subjectId, { campaignNode: `s${subjectId}-c1-n3` });
    assert.equal(session.totalQuestions, 25, 'Boss bab wilayah 3 harus memiliki 25 soal');
    const sId = session.sessionId;

    rawDb.prepare('UPDATE game_sessions SET boss_hp=1 WHERE id=?').run(sId);
    const sq0 = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=0').get(sId);
    const corr0 = getCorrectDisplayIdx(rawDb, sq0);

    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), sq0.id);

    const ans = db.answerQuestion(sId, p.id, sq0.question_id, corr0);
    assert.equal(ans.session.status, 'WON');
    assert.equal(ans.rewards.chapterCompleted, true, 'chapterCompleted harus true');
    assert.ok(ans.rewards.badges.includes(`chapter_${subjectId}_1`), 'Harus mendapatkan badge bab 1');
    assert.ok(Array.isArray(ans.rewards.items), 'Hadiah skin item harus disertakan');
    assert.ok(ans.rewards.items.length >= 1, 'Harus mendapatkan minimal 1 item skin');
    assert.ok(['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].includes(ans.rewards.items[0].rarity) || ans.rewards.items[0].isCoinReward, 'Item harus tier COMMON/RARE/EPIC/LEGENDARY atau koin');
    assert.ok(Array.isArray(ans.rewards.chapterComic), 'Komik 3 panel harus disertakan');
    assert.equal(ans.rewards.chapterComic.length, 3, 'Komik harus 3 panel');

    // Bab 2 wilayah 2-1 sekarang harus terbuka!
    const campFinal = db.getCampaign(p.id, subjectId);
    assert.equal(campFinal.chapters[0].completed, true, 'Bab 1 harus completed');
    assert.equal(campFinal.chapters[1].nodes[0].unlocked, true, 'Bab 2 wilayah 2-1 harus terbuka setelah Boss Bab 1 dikalahkan');
  });
});
