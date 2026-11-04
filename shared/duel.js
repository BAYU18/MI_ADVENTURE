// shared/duel.js — engine duel murni: konstanta + transisi + damage adaptif + kalkulasi seri.
'use strict';

const C = {
  MAX_HP: 100,
  DAMAGE_PER_CORRECT: 10,
  NORMAL_PHASE_MS: 600_000,
  DEATHMATCH_QUESTION_MS: 30_000, // Mulai dari 30s
  DEATHMATCH_MIN_MS: 10_000,      // Minimum waktu deathmatch
  ANSWER_TOLERANCE_MS: 1_500,
  PRESENCE_TTL_MS: 75_000,
  DISCONNECT_GRACE_MS: 45_000,
  RECONNECT_WINDOW_MS: 120_000,
  INVITE_TTL_MS: 60_000,
  DUEL_QUESTION_COUNT: 40,
  REWARD_COINS_WIN: 15,
  REWARD_COINS_DRAW: 8,
  REWARD_COINS_LOSE: 5,
  REWARD_XP_WIN: 10,
  REWARD_XP_DRAW: 6,
  REWARD_XP_LOSE: 4,
  HEAL_VALUES: [25, 35, 45, 55, 65],       // per level 1..5
  SHIELD_VALUES: [20, 30, 40, 50, 60],
  STRIKE_MULT: [2, 2.25, 2.5, 2.75, 3],
  SKILL_ENERGY_COST: {
    eliminate_one: 1,
    eagle_eye: 2,
    heal: 2,
    shield: 2,
    power_strike: 2,
    time_freeze: 2,
    combo_keeper: 2,
    lucky_pouch: 1,
    second_chance: 2,
  },
};

// Transisi fase NORMAL -> DEATHMATCH berdasarkan waktu (normalEndsAt).
function phaseAt(normalEndsAt, now = Date.now()) {
  const t = normalEndsAt ? new Date(normalEndsAt).getTime() : NaN;
  return Number.isFinite(t) && now >= t ? 'DEATHMATCH' : 'NORMAL';
}

// Durasi deathmatch adaptif: mulai 30s, berkurang 2s per soal, batas bawah 10s.
function deathmatchDurationMs(dmIndex = 0) {
  const idx = Math.max(0, Number(dmIndex) || 0);
  return Math.max(C.DEATHMATCH_MIN_MS, C.DEATHMATCH_QUESTION_MS - idx * 2_000);
}

// Base damage adaptif: semakin lama semakin besar (tiap 3 soal naik 2 damage).
function baseDamageForOrder(orderIndex = 0) {
  const idx = Math.max(0, Number(orderIndex) || 0);
  return C.DAMAGE_PER_CORRECT + Math.floor(idx / 3) * 2;
}

// Damage yang DIHASILKAN pemain yang menjawab benar (ke lawan), sudah termasuk power_strike & adaptif.
function damageFor(isCorrect, skillBoost = 1, orderIndex = 0) {
  if (!isCorrect) return 0;
  const base = baseDamageForOrder(orderIndex);
  return Math.round(base * skillBoost);
}

function clampHp(hp) {
  if (!Number.isFinite(hp)) return C.MAX_HP;
  return Math.max(0, Math.min(C.MAX_HP, hp));
}

// Menentukan pemenang/seri bila duel selesai.
function resolveDraw(hpA, hpB) {
  return hpA === hpB ? 'DRAW' : (hpA > hpB ? 'A' : 'B');
}

function skillLevel(level) {
  if (!Number.isFinite(level)) level = 1;
  return Math.max(1, Math.min(5, Math.floor(level)));
}

function healAmount(skillLv) {
  return C.HEAL_VALUES[skillLevel(skillLv) - 1] ?? 25;
}

function shieldAmount(skillLv) {
  return C.SHIELD_VALUES[skillLevel(skillLv) - 1] ?? 20;
}

function strikeMultiplier(skillLv) {
  return C.STRIKE_MULT[skillLevel(skillLv) - 1] ?? 2;
}

function energyCost(skillId) {
  return C.SKILL_ENERGY_COST[skillId] ?? 2;
}

// Pemakaian skill — bersifat murni; database dipakai penegakan atomik (UNIQUE) di lib/db-duel.js.
function canUseSkill(duel, playerIsChallenger, skillId, skillLv, energy, energyMax, used, maxUses) {
  if (maxUses !== undefined && (used || 0) >= maxUses) {
    return { ok: false, reason: 'ALREADY_USED' };
  }
  if (!Number.isFinite(energy) || energy < energyCost(skillId)) {
    return { ok: false, reason: 'NO_ENERGY' };
  }
  const effective = {
    duel,
    playerIsChallenger,
    skillLv: skillLevel(skillLv),
    energy,
    energyMax,
    usedCount: (used || 0),
    maxUses,
  };
  const result = evaluation({ ...effective, skill: skillId });
  return result.ok === false ? { ok: false, reason: result.reason } : { ok: true, ...result };
}

function evaluation(e) {
  const { duel, playerIsChallenger, skillLv, energy, energyMax, usedCount, skill } = e;
  const s = skill;
  switch (s) {
    case 'time_freeze':
      if (duel.phase !== 'DEATHMATCH') return { ok: false, reason: 'WRONG_PHASE' };
      return { ok: true, timeFreezeMs: 10_000 };
    case 'power_strike':
      if (duel.phase === 'ENDED') return { ok: false, reason: 'WRONG_STATE' };
      return { ok: true, boost: strikeMultiplier(skillLv) };
    case 'heal':
      return { ok: true, heal: healAmount(skillLv) };
    case 'shield':
      return { ok: true, shield: shieldAmount(skillLv) };
    case 'combo_keeper':
      return { ok: true, comboGuard: true };          // cegah damage oleh salah berikutnya
    case 'second_chance':
      return { ok: true, secondChance: true };        // batalkan satu damage masuk
    case 'lucky_pouch':
      return { ok: true, coins: 5 };
    default:
      return { ok: true };                              // eliminate_one & eagle_eye valid
  }
}

module.exports = {
  C,
  phaseAt,
  deathmatchDurationMs,
  baseDamageForOrder,
  damageFor,
  clampHp,
  resolveDraw,
  skillLevel,
  healAmount,
  shieldAmount,
  strikeMultiplier,
  energyCost,
  canUseSkill,
};
