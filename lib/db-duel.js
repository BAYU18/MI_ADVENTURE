const { calculatePassives, ITEMS } = require('../shared/economy');
// lib/db-duel.js — duel: undangan, fase, damage adaptif, skill, reconnect, reward.
'use strict';

const crypto = require('node:crypto');
const D = require('../shared/duel.js');
const Progression = require('../shared/progression.js');
const { SKILLS } = require('../shared/economy.js');
const { getDb, applyCoins, getPlayerDuelLoadout, getPlayerSkillLevels } = require('./db.js');

const nowIso = () => new Date().toISOString();
const iso = (ms) => new Date(ms).toISOString();

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function event(db, duelId, type, payload) {
  db = db || getDb();
  db.prepare('INSERT INTO duel_events (duel_id, ts, type, payload_json) VALUES (?, ?, ?, ?)')
    .run(duelId, nowIso(), type, payload ? JSON.stringify(payload) : null);
}

function side(d, playerId) {
  if (d.challenger_id === playerId) return 'challenger';
  if (d.challenged_id === playerId) return 'challenged';
  return null;
}

const other = (s) => (s === 'challenger' ? 'challenged' : 'challenger');
const hpCol = (s) => (s === 'challenger' ? 'hp_challenger' : 'hp_challenged');
const shCol = (s) => (s === 'challenger' ? 'shield_challenger' : 'shield_challenged');
const enCol = (s) => (s === 'challenger' ? 'energy_challenger' : 'energy_challenged');

function resolvePhase(db, d) {
  db = db || getDb();
  if (d.status !== 'ACTIVE') return d.phase;
  const p = D.phaseAt(d.normal_ends_at, Date.now());
  if (p !== d.phase) {
    const deadline = (p === 'DEATHMATCH') ? iso(Date.now() + D.deathmatchDurationMs(0)) : null;
    db.prepare('UPDATE duels SET phase=?, question_deadline_at=? WHERE id=?').run(p, deadline, d.id);
    d.phase = p;
    d.question_deadline_at = deadline;
    event(db, d.id, 'PHASE', { phase: p });
  }
  return d.phase;
}

function expireStaleInvites(db) {
  db = db || getDb();
  const t = iso(Date.now() - D.C.INVITE_TTL_MS);
  const rows = db.prepare("SELECT id FROM duels WHERE status='PENDING' AND created_at < ?").all(t);
  for (const r of rows) {
    db.prepare("UPDATE duels SET status='EXPIRED', finished_at=? WHERE id=?").run(nowIso(), r.id);
    event(db, r.id, 'FINISH', { reason: 'INVITE_EXPIRED' });
  }
  return rows.length;
}

function createChallenge(db, challengeData) {
  db = db || getDb();
  const { challengerId, friendId, subjectId, classId, questionTypes } = challengeData;
  if (!friendId || challengerId === friendId) return { code: 'BAD_REQUEST' };

  const areFriends = db.prepare(
    'SELECT 1 FROM friendships WHERE player_id=? AND friend_id=?').get(challengerId, friendId);
  if (!areFriends) return { code: 'NOT_FRIENDS' };

  const busy = db.prepare(`SELECT id FROM duels WHERE status IN ('PENDING','ACTIVE','PAUSED')
                           AND (challenger_id IN (?,?) OR challenged_id IN (?,?)) LIMIT 1`)
    .get(challengerId, friendId, challengerId, friendId);
  if (busy) return { code: 'DUEL_BUSY', duelId: busy.id };

  let effectiveClassId = classId ? Number(classId) : null;
  if (!effectiveClassId && subjectId) {
    const s = db.prepare('SELECT class_id FROM subjects WHERE id=?').get(subjectId);
    if (s && s.class_id) effectiveClassId = s.class_id;
  }

  let qTypesJson = null;
  if (Array.isArray(questionTypes) && questionTypes.length > 0) {
    qTypesJson = JSON.stringify(questionTypes);
  } else if (typeof questionTypes === 'string') {
    try {
      const parsed = JSON.parse(questionTypes);
      if (Array.isArray(parsed) && parsed.length > 0) qTypesJson = JSON.stringify(parsed);
    } catch {
      qTypesJson = JSON.stringify([questionTypes]);
    }
  }

  const id = 'duel_' + crypto.randomBytes(6).toString('hex');
  db.prepare(`INSERT INTO duels (id, subject_id, class_id, question_types_json, challenger_id, challenged_id, status, phase, created_at)
              VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 'NORMAL', ?)`).run(
    id, subjectId, effectiveClassId, qTypesJson, challengerId, friendId, nowIso()
  );

  event(db, id, 'INVITE', { subjectId, classId: effectiveClassId, questionTypes: qTypesJson, challengerId, challengedId: friendId });
  return { code: 'OK', duelId: id };
}

function respondInvite(db, duelId, playerId, action) {
  db = db || getDb();
  const d = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
  if (!d) return { code: 'DUEL_NOT_FOUND' };
  if (d.challenged_id !== playerId) return { code: 'NOT_PARTICIPANT' };
  if (d.status !== 'PENDING') return { code: 'WRONG_STATE' };

  if (action === 'decline') {
    db.prepare("UPDATE duels SET status='DECLINED', finished_at=? WHERE id=?").run(nowIso(), duelId);
    event(db, duelId, 'FINISH', { reason: 'DECLINED' });
    return { code: 'OK' };
  }
  return startDuel(db, duelId);
}


function getPlayerDuelPassives(db, playerId) {
  const p = db.prepare('SELECT avatar_json FROM players WHERE id=?').get(playerId);
  let avatar = {};
  try { avatar = JSON.parse((p && p.avatar_json) || '{}'); } catch(e) {}
  const equippedIds = ['hat', 'outfit', 'weapon', 'pet', 'bg', 'frame', 'title']
    .map(slot => avatar[slot])
    .filter(Boolean);
  return calculatePassives(equippedIds, ITEMS);
}

function startDuel(db, duelId) {
  db = db || getDb();
  const d = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
  if (!d) return { code: 'DUEL_NOT_FOUND' };

  let allowedTypes = null;
  if (d.question_types_json) {
    try {
      const parsed = JSON.parse(d.question_types_json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        allowedTypes = parsed.map(t => String(t).toUpperCase());
      }
    } catch {}
  }

  let qs = [];
  if (allowedTypes && allowedTypes.length > 0) {
    const placeholders = allowedTypes.map(() => '?').join(',');
    const sql = `SELECT id, text, options_json, answer_index
                 FROM questions
                 WHERE subject_id = ? AND is_active = 1
                   AND UPPER(COALESCE(question_type, 'MCQ')) IN (${placeholders})
                 ORDER BY RANDOM() LIMIT ?`;
    qs = db.prepare(sql).all(d.subject_id, ...allowedTypes, D.C.DUEL_QUESTION_COUNT);

    if (qs.length < 10) {
      const sqlRelaxed = `SELECT id, text, options_json, answer_index
                          FROM questions
                          WHERE subject_id = ?
                            AND UPPER(COALESCE(question_type, 'MCQ')) IN (${placeholders})
                          ORDER BY RANDOM() LIMIT ?`;
      qs = db.prepare(sqlRelaxed).all(d.subject_id, ...allowedTypes, D.C.DUEL_QUESTION_COUNT);
    }
  }

  // Fallback if no filter or not enough questions matched
  if (qs.length < 10) {
    qs = db.prepare(`SELECT id, text, options_json, answer_index
                     FROM questions WHERE subject_id=? AND is_active=1 ORDER BY RANDOM() LIMIT ?`)
      .all(d.subject_id, D.C.DUEL_QUESTION_COUNT);
  }
  if (qs.length < 10) {
    // Fallback if is_active filter yields fewer questions
    qs = db.prepare(`SELECT id, text, options_json, answer_index
                     FROM questions WHERE subject_id=? ORDER BY RANDOM() LIMIT ?`)
      .all(d.subject_id, D.C.DUEL_QUESTION_COUNT);
  }
  if (qs.length < 10) return { code: 'NOT_ENOUGH_QUESTIONS' };

  // Determine initial energy and max energy from player XP/level
  const pA = db.prepare('SELECT xp FROM players WHERE id=?').get(d.challenger_id);
  const pB = db.prepare('SELECT xp FROM players WHERE id=?').get(d.challenged_id);
  const lvlA = Math.floor(Math.sqrt((pA?.xp || 0) / 50)) + 1;
  const lvlB = Math.floor(Math.sqrt((pB?.xp || 0) / 50)) + 1;
  const maxA = Progression.energyMaxForLevel(lvlA);
  const maxB = Progression.energyMaxForLevel(lvlB);
  const eA = Math.min(2, maxA);
  const eB = Math.min(2, maxB);

  db.exec('BEGIN IMMEDIATE');
  try {
    const insQ = db.prepare(`INSERT INTO duel_questions
      (duel_id, order_index, question_id, option_order_challenger_json, option_order_challenged_json)
      VALUES (?, ?, ?, ?, ?)`);

    qs.forEach((q, i) => {
      let optCount = 4;
      try {
        const parsed = JSON.parse(q.options_json);
        if (Array.isArray(parsed) && parsed.length > 0) optCount = parsed.length;
      } catch {}
      const baseIndices = Array.from({ length: optCount }, (_, k) => k);
      const orderA = shuffle(baseIndices);
      const orderB = shuffle(baseIndices);
      insQ.run(duelId, i, q.id, JSON.stringify(orderA), JSON.stringify(orderB));
    });

    const pPassivesA = getPlayerDuelPassives(db, d.challenger_id);
    const pPassivesB = getPlayerDuelPassives(db, d.challenged_id);
    const startShieldA = pPassivesA.startShield || 0;
    const startShieldB = pPassivesB.startShield || 0;

    db.prepare(`UPDATE duels SET status='ACTIVE', phase='NORMAL', started_at=?,
                normal_ends_at=?, hp_challenger=?, hp_challenged=?,
                shield_challenger=?, shield_challenged=?,
                energy_challenger=?, energy_challenged=?, energy_max_challenger=?, energy_max_challenged=?
                WHERE id=?`)
      .run(nowIso(), iso(Date.now() + D.C.NORMAL_PHASE_MS), D.C.MAX_HP, D.C.MAX_HP,
        startShieldA, startShieldB, eA, eB, maxA, maxB, duelId);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  event(db, duelId, 'ACCEPT', { startedAt: nowIso() });
  return { code: 'OK', duelId };
}

function peekStrike(db, duelId, playerId) {
  const r = db.prepare(`SELECT uses, active FROM duel_skill_uses WHERE duel_id=? AND player_id=? AND skill_id='power_strike'`)
    .get(duelId, playerId);
  const isActive = r && (r.active !== undefined ? r.active > 0 : r.uses > 0);
  return isActive ? D.strikeMultiplier(1) : 1;
}

function consumeStrike(db, duelId, playerId) {
  try {
    db.prepare(`UPDATE duel_skill_uses SET active=0 WHERE duel_id=? AND player_id=? AND skill_id='power_strike'`)
      .run(duelId, playerId);
  } catch (e) {
    db.prepare(`UPDATE duel_skill_uses SET uses=0 WHERE duel_id=? AND player_id=? AND skill_id='power_strike'`)
      .run(duelId, playerId);
  }
}

function consumeComboGuard(db, duelId, playerId) {
  const r = db.prepare(`SELECT uses, active FROM duel_skill_uses WHERE duel_id=? AND player_id=? AND skill_id='combo_keeper'`)
    .get(duelId, playerId);
  const isActive = r && (r.active !== undefined ? r.active > 0 : r.uses > 0);
  if (isActive) {
    try {
      db.prepare(`UPDATE duel_skill_uses SET active=0 WHERE duel_id=? AND player_id=? AND skill_id='combo_keeper'`).run(duelId, playerId);
    } catch (e) {
      db.prepare(`UPDATE duel_skill_uses SET uses=0 WHERE duel_id=? AND player_id=? AND skill_id='combo_keeper'`).run(duelId, playerId);
    }
    return true;
  }
  return false;
}

function submitAnswer(db, duelId, playerId, orderIndex, chosenIndex, elapsedMs) {
  db = db || getDb();
  const d = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
  if (!d) return { code: 'DUEL_NOT_FOUND' };
  if (d.status !== 'ACTIVE') return { code: 'WRONG_STATE' };
  const me = side(d, playerId);
  if (!me) return { code: 'NOT_PARTICIPANT' };
  resolvePhase(db, d);

  const q = db.prepare(`SELECT * FROM duel_questions WHERE duel_id=? AND order_index=?`).get(duelId, orderIndex);
  if (!q) return { code: 'ANSWER_REJECTED', reason: 'order_index_tidak_ada' };
  const canon = db.prepare('SELECT answer_index FROM questions WHERE id=?').get(q.question_id);
  if (!canon) return { code: 'ANSWER_REJECTED', reason: 'soal_hilang' };

  // Anti-replay
  const dup = db.prepare('SELECT 1 FROM duel_answers WHERE duel_id=? AND player_id=? AND order_index=?')
    .get(duelId, playerId, orderIndex);
  if (dup) return { code: 'ANSWER_REJECTED', reason: 'sudah_dijawab' };

  const order = JSON.parse(me === 'challenger' ? q.option_order_challenger_json : q.option_order_challenged_json);
  const canonicalIndex = order[chosenIndex] !== undefined ? order[chosenIndex] : chosenIndex;
  const isCorrect = Number(canonicalIndex) === canon.answer_index;
  const boost = peekStrike(db, duelId, playerId);
  let damage = D.damageFor(isCorrect, boost, orderIndex);
  if (boost > 1) consumeStrike(db, duelId, playerId);

  const pAttacker = getPlayerDuelPassives(db, playerId);
  const oppPlayerId = (me === 'challenger' ? d.challenged_id : d.challenger_id);
  const pDefender = getPlayerDuelPassives(db, oppPlayerId);

  let isCrit = false;
  let isDodged = false;
  let dragonTriggered = false;

  if (isCorrect) {
    if (pAttacker.critChance && Math.random() < pAttacker.critChance) {
      isCrit = true;
      damage = Math.round(damage * (pAttacker.critMultiplier || 1.5));
    }
    if (pAttacker.correctDamageBonus) {
      damage += pAttacker.correctDamageBonus;
    }
    if (pAttacker.dragonBreathChance && Math.random() < pAttacker.dragonBreathChance) {
      dragonTriggered = true;
      damage += (pAttacker.dragonBreathDamage || 20);
    }
    if (pDefender.dodgeRate && Math.random() < pDefender.dodgeRate) {
      isDodged = true;
      damage = 0;
    } else if (damage > 0 && pDefender.damageReduction) {
      damage = Math.max(1, damage - pDefender.damageReduction);
    }
  }

  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare(`INSERT INTO duel_answers (duel_id, player_id, order_index, chosen_index, is_correct, damage_dealt, damage_taken, answered_at, elapsed_ms)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(duelId, playerId, orderIndex, chosenIndex, isCorrect ? 1 : 0, damage, 0, nowIso(), elapsedMs || null);

    if (isCorrect) {
      const opp = other(me);
      let dealt = damage;
      const oppShield = d[shCol(opp)] || 0;
      if (oppShield > 0) {
        const absorbed = Math.min(oppShield, dealt);
        const newShield = oppShield - absorbed;
        d[shCol(opp)] = newShield;
        dealt -= absorbed;
        db.prepare(`UPDATE duels SET ${shCol(opp)}=? WHERE id=?`).run(newShield, duelId);
      }
      const newHp = D.clampHp(d[hpCol(opp)] - dealt);
      d[hpCol(opp)] = newHp;
      db.prepare(`UPDATE duels SET ${hpCol(opp)}=?, correct_${me}=correct_${me}+1 WHERE id=?`).run(newHp, duelId);
      event(db, duelId, 'ANSWER', { playerId, orderIndex, correct: true, damage: dealt, dodged: isDodged, isCrit, dragon: dragonTriggered });
      if (pDefender.thornsDamage && dealt > 0) {
        const newAttackerHp = D.clampHp(d[hpCol(me)] - pDefender.thornsDamage);
        d[hpCol(me)] = newAttackerHp;
        db.prepare(`UPDATE duels SET ${hpCol(me)}=? WHERE id=?`).run(newAttackerHp, duelId);
      }

      if (newHp <= 0) {
        db.exec('COMMIT');
        return finish(db, duelId, playerId, 'KO');
      }
    } else {
      let taken = 0;
      if (d.phase === 'DEATHMATCH') {
        taken = D.damageFor(true, 1, orderIndex);
        if (consumeComboGuard(db, duelId, playerId)) taken = 0;
        const newHp = D.clampHp(d[hpCol(me)] - taken);
        d[hpCol(me)] = newHp;
        db.prepare(`UPDATE duels SET ${hpCol(me)}=?, wrong_${me}=wrong_${me}+1 WHERE id=?`).run(newHp, duelId);
        event(db, duelId, 'ANSWER', { playerId, orderIndex, correct: false, phase: d.phase, damageTaken: taken });
        if (newHp <= 0) {
          const oppId = me === 'challenger' ? d.challenged_id : d.challenger_id;
          db.exec('COMMIT');
          return finish(db, duelId, oppId, 'DEATHMATCH_KO');
        }
      } else {
        db.prepare(`UPDATE duels SET wrong_${me}=wrong_${me}+1 WHERE id=?`).run(duelId);
        event(db, duelId, 'ANSWER', { playerId, orderIndex, correct: false, phase: d.phase, damageTaken: 0 });
      }
    }

    // Regen energi (+1 tiap 3 benar)
    const correct = db.prepare(`SELECT correct_${me} AS c FROM duels WHERE id=?`).get(duelId).c;
    if (correct % 3 === 0 && correct > 0) {
      const en = db.prepare(`SELECT ${enCol(me)} AS e, energy_max_${me} AS m FROM duels WHERE id=?`).get(duelId);
      if (en.e < en.m) {
        db.prepare(`UPDATE duels SET ${enCol(me)}=? WHERE id=?`).run(Math.min(en.m, en.e + 1), duelId);
      }
    }

    // Deathmatch deadline per question
    if (d.phase === 'DEATHMATCH') {
      const nextDl = iso(Date.now() + D.deathmatchDurationMs(orderIndex + 1));
      db.prepare('UPDATE duels SET question_deadline_at=? WHERE id=?').run(nextDl, duelId);
    }

    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return { code: 'OK', isCorrect, damage, phase: d.phase, dodged: isDodged, isCrit, dragon: dragonTriggered };
}

function useDuelSkill(db, duelId, playerId, skillId, skillLv, orderIndex) {
  db = db || getDb();
  const d = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
  if (!d || d.status !== 'ACTIVE') return { code: 'DUEL_NOT_FOUND' };
  const me = side(d, playerId);
  if (!me) return { code: 'NOT_PARTICIPANT' };

  const loadout = (typeof getPlayerDuelLoadout === 'function' ? getPlayerDuelLoadout(playerId) : ['eliminate_one', 'eagle_eye', 'heal']).filter(Boolean);
  if (!loadout.includes(skillId)) {
    return { code: 'SKILL_UNAVAILABLE', reason: 'NOT_IN_LOADOUT' };
  }

  const pLvMap = (typeof getPlayerSkillLevels === 'function' ? getPlayerSkillLevels(playerId) : {});
  const effectiveLv = pLvMap[skillId] || skillLv || 1;
  const skDef = SKILLS.find(x => x.id === skillId);
  const maxUses = skDef?.maxUses ? (skDef.maxUses[effectiveLv - 1] ?? skDef.maxUses[0]) : (skDef?.uses ? (skDef.uses[effectiveLv - 1] ?? skDef.uses[0]) : 2);

  const usedRow = db.prepare(`SELECT uses FROM duel_skill_uses WHERE duel_id=? AND player_id=? AND skill_id=?`)
    .get(duelId, playerId, skillId);
  const usedCount = usedRow?.uses || 0;
  if (usedCount >= maxUses) {
    return { code: 'SKILL_UNAVAILABLE', reason: 'ALREADY_USED' };
  }

  const energy = d[enCol(me)];
  const res = D.canUseSkill(d, me === 'challenger', skillId, effectiveLv, energy, d[`energy_max_${me}`], usedCount, maxUses);
  if (!res.ok) return { code: 'SKILL_UNAVAILABLE', reason: res.reason };

  db.exec('BEGIN IMMEDIATE');
  try {
    try {
      db.prepare(`INSERT INTO duel_skill_uses (duel_id, player_id, skill_id, uses, active) VALUES (?, ?, ?, 1, 1)
                  ON CONFLICT(duel_id, player_id, skill_id) DO UPDATE SET uses=duel_skill_uses.uses+1, active=1`)
        .run(duelId, playerId, skillId);
    } catch (e) {
      db.prepare(`INSERT INTO duel_skill_uses (duel_id, player_id, skill_id, uses) VALUES (?, ?, ?, 1)
                  ON CONFLICT(duel_id, player_id, skill_id) DO UPDATE SET uses=duel_skill_uses.uses+1`)
        .run(duelId, playerId, skillId);
    }
    db.prepare(`UPDATE duels SET ${enCol(me)}=? WHERE id=?`).run(energy - D.energyCost(skillId), duelId);

    if (res.heal) {
      const nh = D.clampHp(d[hpCol(me)] + res.heal);
      db.prepare(`UPDATE duels SET ${hpCol(me)}=? WHERE id=?`).run(nh, duelId);
    }
    if (res.shield) {
      db.prepare(`UPDATE duels SET ${shCol(me)}=${shCol(me)}+? WHERE id=?`).run(res.shield, duelId);
    }
    if (res.coins) {
      applyCoins(db, playerId, res.coins, 'duel_lucky_pouch', 'duel:' + duelId);
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  let eliminated = [];
  if (skillId === 'eliminate_one' || skillId === 'eagle_eye') {
    const q = (orderIndex !== undefined && !isNaN(orderIndex))
      ? db.prepare(`SELECT * FROM duel_questions WHERE duel_id=? AND order_index=?`).get(duelId, orderIndex)
      : db.prepare(`SELECT * FROM duel_questions WHERE duel_id=? ORDER BY order_index ASC LIMIT 1`).get(duelId);

    if (q) {
      const canon = db.prepare('SELECT answer_index, options_json FROM questions WHERE id=?').get(q.question_id);
      if (canon) {
        const colOrder = (me === 'challenger') ? 'option_order_challenger_json' : 'option_order_challenged_json';
        const colElim = (me === 'challenger') ? 'eliminated_challenger_json' : 'eliminated_challenged_json';
        let order = [];
        try { order = JSON.parse(q[colOrder] || '[]'); } catch(e) {}
        let prevElim = [];
        try { prevElim = JSON.parse(q[colElim] || '[]'); } catch(e) {}
        const ansIdx = Number(canon.answer_index);
        const correctDisplay = (ansIdx >= 0 && order.length > 0) ? order.indexOf(ansIdx) : -1;
        const maxOpts = (order.length > 0) ? order.length : 4;
        const wrongIndices = Array.from({ length: maxOpts }, (_, i) => i)
          .filter(i => i !== correctDisplay && !prevElim.includes(i));
        const countToElim = (skillId === 'eliminate_one') ? 1 : 2;
        const toElim = shuffle(wrongIndices).slice(0, Math.min(countToElim, Math.max(0, wrongIndices.length - 1)));
        eliminated = [...new Set([...prevElim, ...toElim])];
        db.prepare(`UPDATE duel_questions SET ${colElim}=? WHERE id=?`).run(JSON.stringify(eliminated), q.id);
      }
    }
  }

  event(db, duelId, 'SKILL', { playerId, skillId, orderIndex });
  return { code: 'OK', skill: skillId, eliminated, ...(res.timeFreezeMs ? { timeFreezeMs: res.timeFreezeMs } : {}) };
}

function reconnect(db, duelId, playerId) {
  db = db || getDb();
  const d = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
  if (!d) return { code: 'DUEL_NOT_FOUND' };
  const me = side(d, playerId);
  if (!me) return { code: 'NOT_PARTICIPANT' };
  if (d.status === 'FINISHED') return { code: 'WRONG_STATE' };

  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare(`UPDATE duels SET last_seen_${me}=? WHERE id=?`).run(nowIso(), duelId);
    if (d.status === 'PAUSED') {
      db.prepare("UPDATE duels SET status='ACTIVE' WHERE id=?").run(duelId);
      event(db, duelId, 'RESUME', { playerId });
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return { code: 'OK' };
}

function forfeit(db, duelId, playerId) {
  db = db || getDb();
  const d = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
  if (!d || d.status === 'FINISHED') return { code: 'DUEL_NOT_FOUND' };
  const me = side(d, playerId);
  if (!me) return { code: 'NOT_PARTICIPANT' };
  const winnerId = d.challenger_id === playerId ? d.challenged_id : d.challenger_id;
  return finish(db, duelId, winnerId, 'FORFEIT');
}

function finish(db, duelId, winnerId, reason) {
  db = db || getDb();
  const d = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
  if (!d || d.status === 'FINISHED') return { code: 'OK', winnerId: d?.winner_id, reason: d?.end_reason };

  let win = winnerId;
  let rsn = reason;
  if (reason === 'BOTH_ABSENT') {
    const ha = d.hp_challenger, hb = d.hp_challenged;
    if (ha === hb) win = null;
    else win = ha > hb ? d.challenger_id : d.challenged_id;
    rsn = win === null ? 'DRAW' : 'BOTH_ABSENT';
  }

  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare(`UPDATE duels SET status='FINISHED', phase='ENDED', winner_id=?, end_reason=?, finished_at=? WHERE id=?`)
      .run(win, rsn, nowIso(), duelId);

    // Reward duel kecil (settings.duel_rewards_enabled default ON)
    const enabled = db.prepare(`SELECT value FROM settings WHERE key='duel_rewards_enabled'`).get();
    if (!enabled || enabled.value !== '0') {
      for (const pid of [d.challenger_id, d.challenged_id]) {
        const isW = (win === pid);
        const isDraw = (win === null);
        const coins = isW ? D.C.REWARD_COINS_WIN : (isDraw ? D.C.REWARD_COINS_DRAW : D.C.REWARD_COINS_LOSE);
        const xp = isW ? D.C.REWARD_XP_WIN : (isDraw ? D.C.REWARD_XP_DRAW : D.C.REWARD_XP_LOSE);

        applyCoins(db, pid, coins, 'duel_' + (isW ? 'win' : isDraw ? 'draw' : 'lose'), 'duel:' + duelId);
        db.prepare(`UPDATE players SET xp = xp + ? WHERE id = ?`).run(xp, pid);
      }
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  event(db, duelId, 'FINISH', { winnerId: win, reason: rsn });
  return { code: 'OK', winnerId: win, reason: rsn };
}

function getDuelState(db, duelId, playerId) {
  db = db || getDb();
  const d = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
  if (!d) return { code: 'DUEL_NOT_FOUND' };
  const me = side(d, playerId);
  if (!me) return { code: 'NOT_PARTICIPANT' };
  resolvePhase(db, d);

  // Active question is the earliest order_index this player has not answered yet
  let q = db.prepare(`SELECT dq.order_index FROM duel_questions dq
                      WHERE dq.duel_id=?
                      AND NOT EXISTS (
                        SELECT 1 FROM duel_answers da
                        WHERE da.duel_id=dq.duel_id AND da.player_id=? AND da.order_index=dq.order_index
                      )
                      ORDER BY dq.order_index ASC LIMIT 1`).get(duelId, playerId);

  if (!q && d.status === 'ACTIVE') {
    // Player has answered all served questions
    const maxQ = db.prepare(`SELECT MAX(order_index) as max_idx FROM duel_questions WHERE duel_id=?`).get(duelId);
    q = { orderIndex: maxQ?.max_idx ?? 0 };
  }

  const you = (me === 'challenger');

  const duelLoadout = (typeof getPlayerDuelLoadout === 'function' ? getPlayerDuelLoadout(playerId) : ['eliminate_one', 'eagle_eye', 'heal']).filter(Boolean);
  const pLvMap = (typeof getPlayerSkillLevels === 'function' ? getPlayerSkillLevels(playerId) : {});
  const usedRows = db.prepare(`SELECT skill_id, uses FROM duel_skill_uses WHERE duel_id=? AND player_id=?`).all(duelId, playerId);
  const usedMap = {};
  for (const r of usedRows) usedMap[r.skill_id] = r.uses;

  const energy = d[enCol(me)];
  const skills = duelLoadout.map(skillId => {
    const skDef = SKILLS.find(x => x.id === skillId) || { id: skillId, name: skillId, icon: '⚡' };
    const lv = pLvMap[skillId] || 1;
    const maxUses = skDef.maxUses ? (skDef.maxUses[lv - 1] ?? skDef.maxUses[0]) : (skDef.uses ? (skDef.uses[lv - 1] ?? skDef.uses[0]) : 2);
    const cost = D.energyCost(skillId);
    const usedCount = usedMap[skillId] || 0;
    const usesLeft = Math.max(0, maxUses - usedCount);
    const checkRes = D.canUseSkill(d, me === 'challenger', skillId, lv, energy, d[`energy_max_${me}`], usedCount, maxUses);
    return {
      id: skillId,
      name: skDef.name,
      icon: skDef.icon || '⚡',
      level: lv,
      cost,
      maxUses,
      usedCount,
      usesLeft,
      usable: checkRes.ok && usesLeft > 0,
      reason: checkRes.ok ? (usesLeft > 0 ? null : 'ALREADY_USED') : checkRes.reason
    };
  });

  return {
    duelId,
    status: d.status,
    phase: d.phase,
    subjectId: d.subject_id,
    challenger: {
      id: d.challenger_id,
      hp: d.hp_challenger,
      shield: d.shield_challenger,
      energy: d.energy_challenger,
      energyMax: d.energy_max_challenger,
    },
    challenged: {
      id: d.challenged_id,
      hp: d.hp_challenged,
      shield: d.shield_challenged,
      energy: d.energy_challenged,
      energyMax: d.energy_max_challenged,
    },
    you: you ? 'challenger' : 'challenged',
    normalEndsAt: d.normal_ends_at,
    questionDeadlineAt: d.question_deadline_at,
    serverTime: nowIso(),
    question: q ? { orderIndex: q.order_index } : null,
    skills,
    winnerId: d.winner_id,
    endReason: d.end_reason,
  };
}

function history(db, playerId, limit = 20) {
  db = db || getDb();
  return db.prepare(`
    SELECT d.id, d.subject_id, d.winner_id, d.end_reason, d.started_at, d.finished_at,
           d.hp_challenger, d.hp_challenged,
           pC.nick AS challenger_nick, pD.nick AS challenged_nick
    FROM duels d
    JOIN players pC ON pC.id = d.challenger_id
    JOIN players pD ON pD.id = d.challenged_id
    WHERE d.status='FINISHED' AND (d.challenger_id=? OR d.challenged_id=?)
    ORDER BY d.finished_at DESC LIMIT ?`).all(playerId, playerId, limit);
}

module.exports = {
  C: D.C,
  side,
  other,
  resolvePhase,
  expireStaleInvites,
  createChallenge,
  respondInvite,
  startDuel,
  submitAnswer,
  useDuelSkill,
  reconnect,
  forfeit,
  finish,
  getDuelState,
  history,
  event,
  nowIso,
  iso,
};
