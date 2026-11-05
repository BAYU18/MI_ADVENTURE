'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../lib/db');
const { SKILLS, getSkillUpgradeCost } = require('../shared/economy');
const Progression = require('../shared/progression');

function getCorrectDisplayIdx(rawDb, sq) {
  const q = rawDb.prepare('SELECT answer_index FROM questions WHERE id=?').get(sq.question_id);
  const display = JSON.parse(sq.display_json || '{}');
  const order = display.optionOrder || JSON.parse(sq.option_order || '[]');
  const idx = order.indexOf(q.answer_index);
  return idx >= 0 ? idx : q.answer_index;
}

test('T-58: Skill Baru Ramuan Merah (Unlock Lv 5) & Detail Level Breakdown', async (t) => {
  const rawDb = db.getDb();

  await t.test('1. Verifikasi Definisi Skill Ramuan Merah di SKILLS', () => {
    const rp = SKILLS.find(x => x.id === 'red_potion');
    assert.ok(rp, 'Ramuan Merah (red_potion) harus terdaftar di SKILLS');
    assert.equal(rp.name, 'Ramuan Merah');
    assert.equal(rp.unlockLevel, 5, 'Ramuan Merah harus unlock di Level 5');
    assert.deepEqual(rp.value, [3.0, 3.5, 3.5, 4.0, 5.0], 'Pengali damage harus 3.0x s.d 5.0x');
    assert.deepEqual(rp.consecutive, [1, 1, 2, 2, 3], 'Jumlah soal termudah berturut-turut harus 1, 1, 2, 2, 3');
    assert.deepEqual(rp.costEnergy, [3, 3, 3, 2, 2], 'Biaya energi harus 3 (Lv 1-3) dan 2 (Lv 4-5)');
    assert.deepEqual(rp.maxUses, [1, 1, 1, 2, 2], 'Maksimal pemakaian harus 1x (Lv 1-3) dan 2x (Lv 4-5)');
  });

  await t.test('2. Unlock Otomatis di Level 5', () => {
    const nick = 'TestLow_' + Math.random().toString(36).slice(2, 7);
    const pLow = db.registerPlayer(nick, 'pw123', 1);
    db.ensurePlayerSkills(pLow.id, 1);
    const skillsLow = db.getSkills(pLow.id).skills;
    const rpLow = skillsLow.find(x => x.id === 'red_potion');
    assert.equal(rpLow.owned, false, 'Pemain Lv 1 belum memiliki Ramuan Merah');
    assert.equal(rpLow.unlockLevel, 5);

    // Naikkan XP pemain ke 850 (Level 5)
    rawDb.prepare('UPDATE players SET xp = 850 WHERE id = ?').run(pLow.id);
    db.ensurePlayerSkills(pLow.id, 5);
    const skillsLv5 = db.getSkills(pLow.id).skills;
    const rpLv5 = skillsLv5.find(x => x.id === 'red_potion');
    assert.equal(rpLv5.owned, true, 'Pemain Lv 5 harus memiliki Ramuan Merah');
    assert.equal(rpLv5.level, 1);
  });

  await t.test('3. Efek Battle Ramuan Merah: Skip Soal ➔ Diganti Soal Paling Mudah & Damage Super', () => {
    const nick = 'BattleRP_' + Math.random().toString(36).slice(2, 7);
    const p = db.registerPlayer(nick, 'pw123', 1);
    rawDb.prepare('UPDATE players SET xp = 1000 WHERE id = ?').run(p.id); // Lv 5
    db.ensurePlayerSkills(p.id, 5);

    // Pasang red_potion di loadout slot 0
    rawDb.prepare("UPDATE player_loadout SET slot_0 = 'red_potion' WHERE player_id = ?").run(p.id);

    // Buat sesi
    const subject = rawDb.prepare('SELECT id FROM subjects WHERE is_active=1 LIMIT 1').get();
    const sess = db.startSession(p.id, subject.id);
    const sId = sess.sessionId;

    // Pastikan energi cukup
    rawDb.prepare('UPDATE game_sessions SET energy = 5 WHERE id = ?').run(sId);

    // Ambil soal awal
    const sqBefore = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=0').get(sId);

    // Gunakan Ramuan Merah
    const skillRes = db.useSkill(sId, p.id, 'red_potion', sqBefore.order_index);
    assert.equal(skillRes.ok, true);
    assert.ok(skillRes.effects.redPotion);
    assert.equal(skillRes.effects.redPotion.powerMult, 3.0);

    // Verifikasi bahwa soal telah diganti dengan difficulty 1 dan power_mult = 3.0
    const sqAfter = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=0').get(sId);
    assert.equal(sqAfter.power_mult, 3.0, 'Soal harus memiliki power_mult 3.0');
    const qRow = rawDb.prepare('SELECT answer_index, difficulty FROM questions WHERE id=?').get(sqAfter.question_id);
    assert.equal(qRow.difficulty, 1, 'Soal harus memiliki difficulty 1 (paling mudah)');

    // Jawab soal ini dengan benar
    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), sqAfter.id);
    const correctDisplay = getCorrectDisplayIdx(rawDb, sqAfter);
    const ans = db.answerQuestion(sId, p.id, sqAfter.question_id, correctDisplay);

    // Verifikasi damage besar: Normal hit unit 20 * 3.0 = 60 damage!
    assert.ok(ans.damageToBoss >= 60, `Damage ke bos harus minimal 60 (didapat: ${ans.damageToBoss})`);
  });

  await t.test('4. Efek Berturut-turut pada Level 3 (2 Soal Termudah Berturut-turut)', () => {
    const nick = 'BattleRP3_' + Math.random().toString(36).slice(2, 7);
    const p = db.registerPlayer(nick, 'pw123', 1);
    rawDb.prepare('UPDATE players SET xp = 2000 WHERE id = ?').run(p.id);
    db.ensurePlayerSkills(p.id, 7);
    rawDb.prepare("UPDATE player_skills SET level = 3 WHERE player_id = ? AND skill_id = 'red_potion'").run(p.id);
    rawDb.prepare("UPDATE player_loadout SET slot_0 = 'red_potion' WHERE player_id = ?").run(p.id);

    const subject = rawDb.prepare('SELECT id FROM subjects WHERE is_active=1 LIMIT 1').get();
    const sess = db.startSession(p.id, subject.id);
    const sId = sess.sessionId;
    rawDb.prepare('UPDATE game_sessions SET energy = 5 WHERE id = ?').run(sId);

    const sq0 = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=0').get(sId);
    const skillRes = db.useSkill(sId, p.id, 'red_potion', sq0.order_index);
    assert.equal(skillRes.effects.redPotion.powerMult, 3.5);
    assert.equal(skillRes.effects.redPotion.consecutiveCount, 2);

    // Cek flags pada sesi: sisa 1 soal berturut-turut
    const sRow = rawDb.prepare('SELECT flags_json FROM game_sessions WHERE id=?').get(sId);
    const flags = JSON.parse(sRow.flags_json || '{}');
    assert.equal(flags.redPotionRemaining, 1, 'Harus tersisa 1 soal berturut-turut');
    assert.equal(flags.redPotionMult, 3.5);

    // Jawab soal 0
    const sq0After = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=0').get(sId);
    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), sq0After.id);
    const correctDisplay0 = getCorrectDisplayIdx(rawDb, sq0After);
    db.answerQuestion(sId, p.id, sq0After.question_id, correctDisplay0);

    // Ambil soal 1 via nextQuestion
    db.nextQuestion(sId, p.id);
    const sq1 = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=1').get(sId);
    const qRow1 = rawDb.prepare('SELECT difficulty FROM questions WHERE id=?').get(sq1.question_id);
    assert.equal(qRow1.difficulty, 1, 'Soal ke-2 harus otomatis menjadi difficulty 1');
    assert.equal(sq1.power_mult, 3.5, 'Soal ke-2 harus mewarisi power_mult 3.5');
  });

  await t.test('5. HitDamage Progression Mendukung Multiplier s.d 5x', () => {
    const dmg1 = Progression.hitDamage({ comboStreak: 0, wrongStreak: 0, powerMult: 3.0 }).damage;
    assert.equal(dmg1, 60); // 20 * 3.0
    const dmg5 = Progression.hitDamage({ comboStreak: 0, wrongStreak: 0, powerMult: 5.0 }).damage;
    assert.equal(dmg5, 100); // 20 * 5.0
  });
});
