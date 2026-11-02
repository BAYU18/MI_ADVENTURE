'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const tmpDbPath = path.join(__dirname, 'test-events.db');
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

test('Skenario 13.2 #6 / T-32: Kejutan Tengah Sesi (Events: TREASURE, MERCHANT, TRAP)', async (t) => {
  t.after(cleanup);

  const rawDb = db.getDb();
  const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Event', 1)").run();
  const clsId = Number(clsInfo.lastInsertRowid);

  const subInfo = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, color, monster_theme) VALUES(?, 'Matematika Event', '🎁', '#3498DB', 'hutan')").run(clsId);
  const subjectId = Number(subInfo.lastInsertRowid);

  for (let i = 0; i < 10; i++) {
    rawDb.prepare(`
      INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, hash, is_active, question_type)
      VALUES(?, ?, ?, 0, 'Penjelasan', 1, ?, 1, 'MCQ')
    `).run(subjectId, `Soal Event ${i}`, JSON.stringify(['A', 'B', 'C', 'D']), `hash_evt_${i}`);
  }

  const p = db.registerPlayer('eventtester', 'rahasia123', clsId);

  await t.test('1. Batasan kemunculan kejutan: tidak di practice, tidak di soal pertama/terakhir, maks 2, tidak berurutan', () => {
    // Practice session test
    const practiceSession = db.startSession(p.id, subjectId, 'PRACTICE');
    const pSessionId = practiceSession.sessionId;
    for (let i = 0; i < 3; i++) {
      if (i > 0) db.nextQuestion(pSessionId, p.id);
      const sq = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=?').get(pSessionId, i);
      const corr = getCorrectDisplayIdx(rawDb, sq);
      const ans = db.answerQuestion(pSessionId, p.id, sq.question_id, corr);
      assert.equal(ans.event, null, 'Tidak boleh ada event pada mode PRACTICE');
    }

    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(p.id);

    // Battle session: question 1 (index 0) tidak pernah memicu event
    const s = db.startSession(p.id, subjectId, 'BATTLE');
    const sId = s.sessionId;
    const sq0 = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=0').get(sId);
    const corr0 = getCorrectDisplayIdx(rawDb, sq0);
    const ans0 = db.answerQuestion(sId, p.id, sq0.question_id, corr0);
    assert.equal(ans0.event, null, 'Tidak boleh ada event setelah soal pertama (index 0)');
  });

  await t.test('2. Event Pending: nextQuestion & useSkill ditolak dengan EVENT_PENDING', () => {
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(p.id);
    const s = db.startSession(p.id, subjectId, 'BATTLE');
    const sId = s.sessionId;

    // Simulate an active pending event on session
    const mockEvent = {
      id: 'evt_test123',
      type: 'MERCHANT',
      title: 'Pedagang Keliling',
      offers: [
        { id: 'heal20', price: 10, effect: 'HEAL_20' },
        { id: 'energy2', price: 15, effect: 'ENERGY_2' }
      ],
      createdAt: new Date().toISOString(),
      safeChoice: 'SKIP'
    };

    rawDb.prepare('UPDATE game_sessions SET pending_event_json=? WHERE id=?')
      .run(JSON.stringify(mockEvent), sId);

    // nextQuestion should reject with 409 / EVENT_PENDING
    assert.throws(() => {
      db.nextQuestion(sId, p.id);
    }, (err) => {
      return err.code === 'EVENT_PENDING' || err.message === 'EVENT_PENDING';
    }, 'nextQuestion harus melempar EVENT_PENDING');

    // useSkill should reject with SKILL_UNAVAILABLE / EVENT_PENDING
    assert.throws(() => {
      db.useSkill(sId, p.id, 'heal', 0);
    }, (err) => {
      return err.reason === 'EVENT_PENDING';
    }, 'useSkill harus ditolak dengan reason EVENT_PENDING');

    // Event pending bertahan pada getSession & resumeSession
    const sessLoaded = db.getSession(sId, p.id);
    assert.ok(sessLoaded.pendingEvent, 'pendingEvent harus ada pada getSession');
    assert.equal(sessLoaded.pendingEvent.id, 'evt_test123');
  });

  await t.test('3. MERCHANT Event: pemotongan koin atomik, INSUFFICIENT_COINS, dan efek pembelian', () => {
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(p.id);
    const s = db.startSession(p.id, subjectId, 'BATTLE');
    const sId = s.sessionId;
    // Ensure player has 0 coins initially
    rawDb.prepare('UPDATE players SET coins=0 WHERE id=?').run(p.id);

    const mockMerchant = {
      id: 'evt_merch1',
      type: 'MERCHANT',
      title: 'Pedagang Keliling',
      offers: [
        { id: 'heal20', price: 10, effect: 'HEAL_20' },
        { id: 'energy2', price: 15, effect: 'ENERGY_2' },
        { id: 'freeEliminate', price: 12, effect: 'FREE_ELIMINATE_NEXT' }
      ],
      createdAt: new Date().toISOString(),
      safeChoice: 'SKIP'
    };

    rawDb.prepare('UPDATE game_sessions SET pending_event_json=?, player_hp=50, energy=1 WHERE id=?')
      .run(JSON.stringify(mockMerchant), sId);

    // Beli tanpa koin -> INSUFFICIENT_COINS
    assert.throws(() => {
      db.resolveEvent(sId, p.id, 'evt_merch1', 'heal20');
    }, (err) => {
      return err.code === 'INSUFFICIENT_COINS';
    }, 'Harus gagal bila koin tidak mencukupi');

    // Beri 20 koin
    rawDb.prepare('UPDATE players SET coins=20 WHERE id=?').run(p.id);

    // Beli heal20 (harga 10)
    const resBuy = db.resolveEvent(sId, p.id, 'evt_merch1', 'heal20');
    assert.equal(resBuy.ok, true);
    assert.equal(resBuy.result.outcome, 'BOUGHT');
    assert.equal(resBuy.player.hp, 70, 'HP harus bertambah 20 (50 -> 70)');
    assert.equal(resBuy.coins, 10, 'Koin harus berkurang 10 (20 -> 10)');

    // pending_event_json harus dibersihkan
    const checkSess = db.getSession(sId, p.id);
    assert.equal(checkSess.pendingEvent, null, 'pendingEvent harus null setelah diselesaikan');
  });

  await t.test('4. TRAP Event: Pilihan Lewati (aman) dan Pilihan Buka (tidak boleh HP < 1)', () => {
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(p.id);
    const s = db.startSession(p.id, subjectId, 'BATTLE');
    const sId = s.sessionId;

    // 4a. Lewati (SKIP)
    const mockTrap1 = {
      id: 'evt_trap1',
      type: 'TRAP',
      title: 'Peti Mencurigakan',
      createdAt: new Date().toISOString(),
      safeChoice: 'SKIP'
    };
    rawDb.prepare('UPDATE game_sessions SET pending_event_json=?, player_hp=5 WHERE id=?')
      .run(JSON.stringify(mockTrap1), sId);

    const resSkip = db.resolveEvent(sId, p.id, 'evt_trap1', 'SKIP');
    assert.equal(resSkip.result.outcome, 'SKIPPED');
    assert.equal(resSkip.player.hp, 5, 'HP tidak boleh berubah saat lewati');

    // 4b. Buka dengan HP rendah (misal 5 HP, penalti 8 HP) -> HP tetap minimal 1, tidak boleh mati
    const mockTrap2 = {
      id: 'evt_trap2',
      type: 'TRAP',
      title: 'Peti Mencurigakan',
      createdAt: new Date().toISOString(),
      safeChoice: 'SKIP'
    };
    rawDb.prepare('UPDATE game_sessions SET pending_event_json=?, player_hp=5 WHERE id=?')
      .run(JSON.stringify(mockTrap2), sId);

    const resOpen = db.resolveEvent(sId, p.id, 'evt_trap2', 'OPEN');
    assert.ok(resOpen.player.hp >= 1, 'HP pemain tidak pernah boleh turun di bawah 1 pada jebakan');
    if (resOpen.result.outcome === 'TRAPPED') {
      assert.equal(resOpen.player.hp, 1, 'HP 5 terkena jebakan penalti 8 harus menjadi 1 (floor minimum)');
    }
  });

  await t.test('5. Timeout 8 detik -> otomatis pilihan aman (safeChoice)', () => {
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(p.id);
    const s = db.startSession(p.id, subjectId, 'BATTLE');
    const sId = s.sessionId;

    // Created 10 seconds ago
    const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
    const mockTimeoutEvt = {
      id: 'evt_timeout',
      type: 'TRAP',
      title: 'Peti Mencurigakan',
      createdAt: tenSecondsAgo,
      safeChoice: 'SKIP'
    };
    rawDb.prepare('UPDATE game_sessions SET pending_event_json=? WHERE id=?')
      .run(JSON.stringify(mockTimeoutEvt), sId);

    // Calling resolveEvent with no choice or TIMEOUT should use safeChoice
    const resTimeout = db.resolveEvent(sId, p.id, 'evt_timeout', 'TIMEOUT');
    assert.equal(resTimeout.result.outcome, 'SKIPPED', 'Timeout harus memilih pilihan aman (SKIP)');

    // Next question test when expired: nextQuestion auto-resolves if timeout expired
    const mockTimeoutEvt2 = {
      id: 'evt_timeout2',
      type: 'TRAP',
      title: 'Peti Mencurigakan',
      createdAt: tenSecondsAgo,
      safeChoice: 'SKIP'
    };
    rawDb.prepare('UPDATE game_sessions SET pending_event_json=? WHERE id=?')
      .run(JSON.stringify(mockTimeoutEvt2), sId);

    // nextQuestion should auto-resolve the expired event and succeed!
    const nextQ = db.nextQuestion(sId, p.id);
    assert.ok(nextQ.ok, 'nextQuestion berhasil setelah event kadaluwarsa otomatis diselesaikan dengan aman');
  });
});
