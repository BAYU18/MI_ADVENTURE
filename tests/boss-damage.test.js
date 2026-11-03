const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../lib/db');
const rawDb = db.getDb();
const Progression = require('../shared/progression');

function createTestPlayer(nick) {
  const testClass = rawDb.prepare("SELECT id FROM classes LIMIT 1").get() ||
    rawDb.prepare("INSERT INTO classes(name, grade) VALUES('Kelas Test', 4) RETURNING id").get();

  const testNick = nick + '_' + Math.random().toString(36).substring(2, 7);
  const ins = rawDb.prepare(`
    INSERT INTO players (nick, nick_lower, password_hash, class_id, coins, xp)
    VALUES (?, ?, 'hash123', ?, 1000, 0)
    RETURNING id, nick
  `).get(testNick, testNick.toLowerCase(), testClass.id);
  return ins.id;
}

function getCorrectChoice(sessionId, orderIndex) {
  const sq = rawDb.prepare(`
    SELECT sq.*, q.answer_index, q.question_type, q.type_data_json
    FROM session_questions sq
    JOIN questions q ON q.id=sq.question_id
    WHERE sq.session_id=? AND sq.order_index=?
  `).get(sessionId, orderIndex);
  let order = [0, 1, 2, 3];
  if (sq.display_json) {
    try {
      const dj = JSON.parse(sq.display_json);
      if (Array.isArray(dj.optionOrder)) order = dj.optionOrder;
    } catch (_) {}
  } else if (sq.option_order) {
    try { order = JSON.parse(sq.option_order); } catch (_) {}
  }
  return order.indexOf(sq.answer_index);
}

test('T-31 / Skenario H.4, H.5, H.6: Damage, Pity, Monster Damage, Fatigue, Lantai 15', async (t) => {
  const testPlayer = createTestPlayer('TesterDamage');
  const subRow = rawDb.prepare('SELECT id FROM subjects LIMIT 1').get();

  function cleanup() {
    rawDb.prepare("UPDATE game_sessions SET status = 'ABANDONED' WHERE player_id=?").run(testPlayer);
  }

  await t.test('1. Skenario H.5: Jawaban salah memotong monster_damage, HP pemain tidak negatif, wrong_streak naik', async () => {
    cleanup();
    const sessionRes = db.startSession(testPlayer, subRow.id);
    const sId = sessionRes.sessionId;
    const session = db.getSession(sId, testPlayer);

    assert.ok(session.bossTier, 'Tier harus ada');
    assert.ok(session.monsterDamage > 0, 'monsterDamage harus > 0');

    const initialPlayerHp = session.playerHp;
    const monsterDmg = session.monsterDamage;

    // Jawab salah pada soal pertama (pilih display index -99)
    const ans1 = db.answerQuestion(sId, testPlayer, session.currentIndex, -99);
    assert.equal(ans1.isCorrect, false);
    assert.equal(ans1.damageToPlayer, monsterDmg);
    assert.equal(ans1.session.playerHp, initialPlayerHp - monsterDmg);
    assert.equal(ans1.session.pity, false); // Baru 1 salah

    // Jawab salah kedua
    const ans2 = db.answerQuestion(sId, testPlayer, ans1.session.currentIndex, -99);
    assert.equal(ans2.isCorrect, false);
    assert.equal(ans2.session.pity, false); // Baru 2 salah

    // Jawab salah ketiga
    const ans3 = db.answerQuestion(sId, testPlayer, ans2.session.currentIndex, -99);
    assert.equal(ans3.isCorrect, false);
    assert.equal(ans3.session.pity, true); // Sudah 3 salah -> pity aktif untuk jawaban benar berikutnya!

    // Check wrong_streak di DB
    const sRow = rawDb.prepare('SELECT wrong_streak FROM game_sessions WHERE id=?').get(sId);
    assert.equal(sRow.wrong_streak, 3);

    cleanup();
  });

  await t.test('2. Skenario H.5: Pity memberikan 1.5x damage pada jawaban benar setelah 3x salah, lalu reset wrong_streak', async () => {
    cleanup();
    const sessionRes = db.startSession(testPlayer, subRow.id);
    const sId = sessionRes.sessionId;
    let s = db.getSession(sId, testPlayer);

    // Pastikan tidak ada modifier weak/bonus pada soal uji pity
    rawDb.prepare('UPDATE session_questions SET is_weak=0, is_bonus=0, is_mystery=0 WHERE session_id=?').run(sId);

    // Jawab 3x salah
    for (let i = 0; i < 3; i++) {
      const ans = db.answerQuestion(sId, testPlayer, s.currentIndex, -99);
      s = ans.session;
    }

    assert.equal(s.pity, true);

    // Sekarang jawab BENAR
    const correctIdx = getCorrectChoice(sId, s.currentIndex);
    const ansCorrect = db.answerQuestion(sId, testPlayer, s.currentIndex, correctIdx);
    assert.equal(ansCorrect.isCorrect, true);
    assert.equal(ansCorrect.pity, true, 'Pity harus aktif pada serangan benar ini');
    // Basic hit = 20, with pity 1.5x = 30
    assert.equal(ansCorrect.damageToBoss, 30);

    // Setelah benar, wrong_streak reset ke 0
    const sRow = rawDb.prepare('SELECT wrong_streak FROM game_sessions WHERE id=?').get(sId);
    assert.equal(sRow.wrong_streak, 0);
    assert.equal(ansCorrect.session.pity, false);

    cleanup();
  });

  await t.test('3. Skenario H.4: Boss tidak tumbang sebelum 15 jawaban benar (lantai 15), bahkan dengan power_strike Lv5', async () => {
    cleanup();
    // Start session with explicit count 30
    const sessionRes = db.startSession(testPlayer, subRow.id, { count: 30 });
    const sId = sessionRes.sessionId;
    let s = db.getSession(sId, testPlayer);

    // Paksa power_mult = 4.0 pada setiap session_questions untuk mensimulasikan power_strike Lv5
    rawDb.prepare('UPDATE session_questions SET power_mult = 4.0, is_weak = 0, is_bonus = 0, is_mystery = 0 WHERE session_id=?').run(sId);

    // Jawab 14 soal pertama secara benar berturut-turut
    for (let i = 0; i < 14; i++) {
      const correctIdx = getCorrectChoice(sId, s.currentIndex);
      const ans = db.answerQuestion(sId, testPlayer, s.currentIndex, correctIdx);
      assert.equal(ans.isCorrect, true);
      assert.ok(ans.boss.hp >= 1, `Pada jawaban ke-${i + 1}, boss HP (${ans.boss.hp}) tidak boleh <= 0 sebelum jawaban ke-15!`);
      assert.equal(ans.session.status, 'IN_PROGRESS', `Sesi harus tetap IN_PROGRESS pada hit ke-${i + 1}`);
      s = ans.session;
    }

    // Pada hit ke-14, boss HP harus tertahan di 1 HP karena damage 14 x (20 * 4) = 1120 >> boss_max_hp (300)
    assert.equal(s.bossHp, 1, 'Boss HP harus tertahan di tepat 1 HP karena lantai 15!');

    // Sekarang jawaban ke-15
    const correctIdx15 = getCorrectChoice(sId, s.currentIndex);
    const ans15 = db.answerQuestion(sId, testPlayer, s.currentIndex, correctIdx15);
    assert.equal(ans15.isCorrect, true);
    assert.equal(ans15.boss.hp, 0, 'Pada jawaban ke-15, boss HP boleh menjadi 0');
    assert.equal(ans15.session.status, 'WON', 'Boss harus kalah pada jawaban ke-15');
    assert.equal(ans15.session.endReason, 'BOSS_DEFEATED');

    cleanup();
  });

  await t.test('4b. Skenario H.6: Kelelahan boss terpicu tepat saat masuk Fase Marah di soal ke-6', async () => {
    cleanup();
    const sessionRes = db.startSession(testPlayer, subRow.id, { count: 35 });
    const sId = sessionRes.sessionId;

    // Bersihkan flags bonus/weak pada soal uji
    rawDb.prepare('UPDATE session_questions SET is_weak=0, is_bonus=0, is_mystery=0 WHERE session_id=?').run(sId);

    // Set boss max HP = 600, boss_hp = 355 (halfHp = 300)
    rawDb.prepare(`
      UPDATE game_sessions
      SET boss_tier = 'legend', boss_max_hp = 600, boss_hp = 355, boss_hits_needed = 30, boss_hit_unit = 20,
          boss_phase = 1, fatigue_applied = 0
      WHERE id=?
    `).run(sId);

    let s = db.getSession(sId, testPlayer);

    // Soal 1: salah (ans 1, cor 0)
    db.answerQuestion(sId, testPlayer, s.currentIndex, -99);
    // Soal 2: salah (ans 2, cor 0)
    s = db.getSession(sId, testPlayer);
    db.answerQuestion(sId, testPlayer, s.currentIndex, -99);
    // Soal 3: benar (ans 3, cor 1) -> dmg 20 -> hp 335 (Phase 1)
    s = db.getSession(sId, testPlayer);
    const a3 = db.answerQuestion(sId, testPlayer, s.currentIndex, getCorrectChoice(sId, s.currentIndex));
    assert.equal(a3.boss.phase, 1);

    // Soal 4: salah (ans 4, cor 1)
    s = db.getSession(sId, testPlayer);
    db.answerQuestion(sId, testPlayer, s.currentIndex, -99);

    // Soal 5: benar (ans 5, cor 2) -> dmg 20 -> hp 315 > 300 (masih Phase 1)
    s = db.getSession(sId, testPlayer);
    const a5 = db.answerQuestion(sId, testPlayer, s.currentIndex, getCorrectChoice(sId, s.currentIndex));
    assert.equal(a5.boss.phase, 1, 'Soal 5 harus masih Phase 1');
    assert.equal(a5.fatigue.applied, false);

    // Soal 6: benar (ans 6, cor 3) -> dmg 20 -> hp 295 <= 300 (MASUK PHASE 2!)
    // Total answered = 6, correct = 3, akurasi = 3/6 = 50% < 55%
    s = db.getSession(sId, testPlayer);
    const a6 = db.answerQuestion(sId, testPlayer, s.currentIndex, getCorrectChoice(sId, s.currentIndex));
    assert.equal(a6.boss.phase, 2, 'Soal 6 harus masuk Phase 2');
    assert.equal(a6.fatigue.applied, true, 'Fatigue harus terpicu!');
    assert.match(a6.notice, /kelelahan/, 'Notice harus mengandung info kelelahan');

    // Cek di DB bahwa fatigue_applied = 1
    const row = rawDb.prepare('SELECT fatigue_applied FROM game_sessions WHERE id=?').get(sId);
    assert.equal(row.fatigue_applied, 1);

    // Soal 7: tidak boleh memicu fatigue lagi
    s = db.getSession(sId, testPlayer);
    const a7 = db.answerQuestion(sId, testPlayer, s.currentIndex, getCorrectChoice(sId, s.currentIndex));
    assert.equal(a7.fatigue.applied, false, 'Fatigue tidak boleh terpicu dua kali');

    cleanup();
  });

  await t.test('5. Skenario H.6: Kelelahan boss TIDAK terpicu saat Fase Marah jika akurasi >= 55%', async () => {
    cleanup();
    const sessionRes = db.startSession(testPlayer, subRow.id, { count: 35 });
    const sId = sessionRes.sessionId;
    let s = db.getSession(sId, testPlayer);

    const halfHp = Math.floor(s.bossMaxHp / 2);
    rawDb.prepare('UPDATE game_sessions SET boss_hp = ?, boss_phase = 1, fatigue_applied = 0 WHERE id=?')
      .run(halfHp + 10, sId);

    // Jawab 5 benar, 0 salah (akurasi 5/5 = 100%)
    for (let i = 0; i < 5; i++) {
      s = db.getSession(sId, testPlayer);
      db.answerQuestion(sId, testPlayer, s.currentIndex, getCorrectChoice(sId, s.currentIndex));
    }

    // Pertanyaan 6 benar (masuk phase 2, akurasi 6/6 = 100% >= 55%)
    s = db.getSession(sId, testPlayer);
    const ans6 = db.answerQuestion(sId, testPlayer, s.currentIndex, getCorrectChoice(sId, s.currentIndex));

    assert.equal(ans6.fatigue.applied, false, 'Fatigue tidak boleh terpicu jika akurasi tinggi');

    cleanup();
  });
});
