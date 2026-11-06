/* shared/progression.js — logika murni v6 (UMD: dipakai server & klien; tanpa dependensi, tanpa I/O) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Progression = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* ============ B. Level kemampuan per mapel ============ */
  const ABILITY = {
    minAttempts: 8, recentWindow: 40,
    weights: { mastery: 0.6, accuracy: 0.3, coverage: 0.1 },
    levels: [
      { min: 0,  level: 1, name: 'Pemula',     icon: '🌱' },
      { min: 20, level: 2, name: 'Penjelajah', icon: '🧭' },
      { min: 40, level: 3, name: 'Petualang',  icon: '⚔️' },
      { min: 60, level: 4, name: 'Ahli',       icon: '🛡️' },
      { min: 80, level: 5, name: 'Master',     icon: '👑' },
    ],
  };
  const diffWeight = (d) => 1 + 0.25 * (clamp(Number(d) || 1, 1, 5) - 1);
  function abilityLevel(score) {
    let cur = ABILITY.levels[0];
    for (const l of ABILITY.levels) if (score >= l.min) cur = l;
    return { level: cur.level, name: cur.name, icon: cur.icon };
  }
  // inp: { attempts, stats:[{box,difficulty}], recent:[{correct,difficulty}] (maks recentWindow terbaru), totalActive }
  function abilityScore(inp) {
    const attempts = Math.max(0, inp.attempts | 0);
    if (attempts === 0) return { status: 'NONE', score: null, attempts, need: ABILITY.minAttempts };
    if (attempts < ABILITY.minAttempts) return { status: 'INSUFFICIENT', score: null, attempts, need: ABILITY.minAttempts };
    const stats = inp.stats || [];
    let wSum = 0, mSum = 0;
    for (const s of stats) { const w = diffWeight(s.difficulty); wSum += w; mSum += w * (clamp(s.box | 0, 1, 5) - 1) / 4; }
    const M = wSum ? mSum / wSum : 0;
    const rec = (inp.recent || []).slice(-ABILITY.recentWindow);
    let rw = 0, rc = 0;
    for (const r of rec) { const w = diffWeight(r.difficulty); rw += w; if (r.correct) rc += w; }
    const A = rw ? rc / rw : 0;
    const C = Math.min(1, stats.length / Math.max(10, 0.6 * (inp.totalActive || 0)));
    const W = ABILITY.weights;
    const score = clamp(Math.round(100 * (W.mastery * M + W.accuracy * A + W.coverage * C)), 0, 100);
    const lv = abilityLevel(score);   // kunci level diberi awalan agar tidak menimpa `name` mapel saat digabung
    return { status: 'MEASURED', score, attempts, accuracy: Math.round(A * 100), mastery: Math.round(M * 100), level: lv.level, levelName: lv.name, levelIcon: lv.icon };
  }
  const STATUS_ORDER = { MEASURED: 0, INSUFFICIENT: 1, NONE: 2 };
  // Urut NAIK: nilai terkecil di atas; "belum cukup data" lalu "belum dicoba" di akhir.
  function sortAbilities(list) {
    const out = list.slice().sort((a, b) =>
      (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) ||
      (a.status === 'MEASURED' ? a.score - b.score : (a.attempts || 0) - (b.attempts || 0)) ||
      String(a.name).localeCompare(String(b.name), 'id'));
    out.forEach((x, i) => { x.rank = i + 1; });
    return out;
  }

  /* ============ C & D. Boss bertier + darah adaptif (15–30 jawaban benar) ============ */
  const HIT_UNIT = 20;            // HP boss yang hilang per jawaban benar baku (1 "hit")
  const HIT_CAP_MULT = 4;         // pengali maksimum per jawaban benar (combo × power × pity)
  const MIN_TOTAL_HITS = 15, MAX_TOTAL_HITS = 30, MAX_Q_CAP = 50;
  const BOSS_TIERS = {
    common: { id: 'common', label: 'Common', icon: '⚪', color: '#9AA5B1', minHits: 15, maxHits: 18, wrongRatio: 0.90, coinMult: 1.0, xpMult: 1.0 },
    rare:   { id: 'rare',   label: 'Rare',   icon: '🔵', color: '#3B82F6', minHits: 18, maxHits: 22, wrongRatio: 0.80, coinMult: 1.3, xpMult: 1.2 },
    epic:   { id: 'epic',   label: 'Epic',   icon: '🟣', color: '#A855F7', minHits: 22, maxHits: 26, wrongRatio: 0.70, coinMult: 1.7, xpMult: 1.5 },
    legend: { id: 'legend', label: 'Legend', icon: '🟡', color: '#F59E0B', minHits: 26, maxHits: 30, wrongRatio: 0.62, coinMult: 2.3, xpMult: 2.0 },
  };
  const TIER_ORDER = ['common', 'rare', 'epic', 'legend'];
  const TIER_WEIGHTS = [   // peluang tier pada Mode Bebas menurut level profil
    { maxLevel: 5,        w: { common: 70, rare: 25, epic: 5,  legend: 0 } },
    { maxLevel: 10,       w: { common: 45, rare: 35, epic: 17, legend: 3 } },
    { maxLevel: 20,       w: { common: 30, rare: 35, epic: 25, legend: 10 } },
    { maxLevel: Infinity, w: { common: 20, rare: 30, epic: 30, legend: 20 } },
  ];
  const CAMPAIGN_TIERS = {   // [wilayah1..wilayah3] per bab; wilayah 3 = Boss Bab
    1: ['common', 'common', 'rare'],
    2: ['common', 'rare', 'epic'],
    3: ['rare', 'epic', 'epic'],
    4: ['epic', 'epic', 'legend'],
  };
  const PITY = { afterWrong: 3, mult: 1.5 };            // 3 salah beruntun → jawaban benar berikutnya ×1.5
  const FATIGUE = { minAnswered: 6, accBelow: 0.55, cut: 0.85 };   // sekali, saat Fase Marah
  const REFILL = { whenRemainingAtMost: 2, batch: 5 };

  function tierWeights(level) { return (TIER_WEIGHTS.find((t) => level <= t.maxLevel) || TIER_WEIGHTS[TIER_WEIGHTS.length - 1]).w; }
  function pickTier(rand, level) {
    const w = tierWeights(level); const sum = TIER_ORDER.reduce((s, k) => s + w[k], 0); let r = rand() * sum;
    for (const k of TIER_ORDER) { if (r < w[k]) return k; r -= w[k]; }
    return 'common';
  }
  function campaignTier(chapter, node) { const row = CAMPAIGN_TIERS[clamp(chapter | 0, 1, 4)]; return row[clamp(node | 0, 1, 3) - 1]; }
  // Makin kuat pemain (skor 0–100) → makin ke ujung atas rentang tier. Skor tidak ada (null) → tengah.
  function hitsNeeded(tierId, abilityScoreValue) {
    const t = BOSS_TIERS[tierId]; const f = abilityScoreValue == null ? 0.5 : clamp(abilityScoreValue / 100, 0, 1);
    return clamp(Math.round(t.minHits + (t.maxHits - t.minHits) * f), MIN_TOTAL_HITS, MAX_TOTAL_HITS);
  }
  function wrongBudget(n, tierId) { return Math.max(6, Math.ceil(n * BOSS_TIERS[tierId].wrongRatio)); }
  function maxQuestions(n, tierId) { return Math.min(MAX_Q_CAP, n + wrongBudget(n, tierId) + 6); }
  function plannedQuestions(n, tierId, abilityScoreValue) {
    const acc = clamp(0.5 + 0.4 * (abilityScoreValue == null ? 50 : abilityScoreValue) / 100, 0.55, 0.9);
    return Math.min(maxQuestions(n, tierId), Math.ceil(n / acc) + 3);
  }
  function bossStats(tierId, abilityScoreValue, playerMaxHp, poolSize) {
    let n = hitsNeeded(tierId, abilityScoreValue);
    if (poolSize != null && poolSize < n) n = Math.max(1, poolSize);       // bank soal terlalu kecil → catat peringatan di server
    const wb = wrongBudget(n, tierId);
    return { tier: tierId, hitsNeeded: n, hitUnit: HIT_UNIT, bossMaxHp: n * HIT_UNIT, wrongBudget: wb,
             monsterDamage: Math.ceil(playerMaxHp / wb), maxQuestions: maxQuestions(n, tierId), planned: plannedQuestions(n, tierId, abilityScoreValue) };
  }
  // HP boss setelah menerima damage. Jika damage menghabisi HP boss (next <= 0), boss kalah seketika (0).
  function applyBossDamage(bossHp, damage, correctCountAfter) {
    const next = bossHp - damage;
    return Math.max(0, next);
  }
  const hitsLeft = (bossHp) => Math.max(0, Math.ceil(bossHp / HIT_UNIT));
  const comboMult = (streak) => 1 + Math.min(0.5, 0.1 * Math.floor(Math.max(0, streak) / 3));   // pakai pengali combo yang sudah ada bila ada (maks 1.5)
  function hitDamage(o) {   // o: { comboStreak, powerMult, wrongStreak }
    const pity = (o.wrongStreak | 0) >= PITY.afterWrong ? PITY.mult : 1;
    const bonusKeep = clamp(o.comboBonusMult == null ? 1 : o.comboBonusMult, 0, 1);   // skill boss "combo_seal" mengurangi BONUS combo saja (damage dasar tetap)
    const combo = 1 + (comboMult(o.comboStreak | 0) - 1) * bonusKeep;
    const cap = Math.max(HIT_CAP_MULT, o.powerMult || 1);
    const mult = clamp(combo * pity * Math.max(1, o.powerMult || 1), 1, cap);
    return { damage: Math.round(HIT_UNIT * mult), pity: pity > 1 };
  }
  // Dipanggil SEKALI saat Fase Marah. Total jawaban benar tidak pernah turun di bawah 15.
  function fatigueAdjust(o) {   // o: { bossHp, correctCount, answeredCount }
    const acc = o.answeredCount ? o.correctCount / o.answeredCount : 1;
    if (o.answeredCount < FATIGUE.minAnswered || acc >= FATIGUE.accBelow) return { applied: false, bossHp: o.bossHp };
    const left = hitsLeft(o.bossHp);
    const newLeft = Math.min(left, Math.max(Math.ceil(left * FATIGUE.cut), MIN_TOTAL_HITS - o.correctCount, 1));
    return { applied: newLeft < left, bossHp: Math.min(o.bossHp, newLeft * HIT_UNIT) };
  }
  const rewardMult = (tierId) => ({ coin: BOSS_TIERS[tierId].coinMult, xp: BOSS_TIERS[tierId].xpMult });

  /* ============ F. Energi per level profil ============ */
  const ENERGY = { base: 5, perBand: 1, bandSize: 5, cap: 12, earnEveryCorrect: 3, earnAmount: 1 };
  const energyMaxForLevel = (level) => Math.min(ENERGY.cap, ENERGY.base + Math.floor((Math.max(1, level | 0) - 1) / ENERGY.bandSize) * ENERGY.perBand);
  const gainEnergy = (cur, amount, max) => clamp(cur + amount, 0, max);
  const energyFromCorrect = (correctCount) => (correctCount > 0 && correctCount % ENERGY.earnEveryCorrect === 0 ? ENERGY.earnAmount : 0);
  function nextEnergyLevel(level) {   // level profil berikutnya yang menaikkan kapasitas
    const cur = energyMaxForLevel(level); if (cur >= ENERGY.cap) return null;
    const lv = (Math.floor((Math.max(1, level | 0) - 1) / ENERGY.bandSize) + 1) * ENERGY.bandSize + 1;
    return { level: lv, energyMax: energyMaxForLevel(lv) };
  }

  /* ============ E. Upgrade skill (fallback bila shared/economy.js belum punya) ============ */
  const SKILL_MAX_LEVEL = 5;
  const UPGRADE_COSTS = [60, 120, 220, 380];            // Lv1→2, 2→3, 3→4, 4→5
  const SKILL_TABLE = {
    eliminate_one: { cost: [1, 1, 1, 1, 1], freeUses: [0, 0, 1, 1, 2] },
    eagle_eye:     { cost: [2, 2, 2, 1, 1] },
    heal:          { cost: [1, 1, 1, 1, 1], value: [25, 35, 45, 55, 65] },
    shield:        { cost: [2, 2, 2, 2, 2], value: [20, 40, 60, 80, 100] },
    power_strike:  { cost: [3, 3, 3, 3, 3], value: [2, 2.5, 3, 3.5, 4] },
    time_freeze:   { cost: [3, 3, 3, 3, 3], value: [8, 11, 14, 17, 20] },
    combo_keeper:  { cost: [2, 2, 1, 1, 1], protect: [1, 1, 1, 2, 2] },
    lucky_pouch:   { cost: [2, 2, 2, 2, 1], value: [2, 2.25, 2.5, 2.75, 3] },
    second_chance: { cost: [4, 4, 3, 3, 2] },
    red_potion:    { cost: [3, 3, 3, 2, 2], value: [3, 3.5, 3.5, 4, 5], consecutive: [1, 1, 2, 2, 3] },
  };
  const skillUpgradeCost = (level) => (level >= SKILL_MAX_LEVEL || level < 1 ? null : UPGRADE_COSTS[level - 1]);
  function skillInfo(id, level) {   // efek pada level tertentu: { cost, value?, freeUses?, protect? }
    const t = SKILL_TABLE[id]; if (!t) return null; const i = clamp(level | 0, 1, SKILL_MAX_LEVEL) - 1; const o = { cost: t.cost[i] };
    for (const k of ['value', 'freeUses', 'protect']) if (t[k]) o[k] = t[k][i];
    return o;
  }

  return { clamp, ABILITY, abilityLevel, abilityScore, sortAbilities,
    HIT_UNIT, HIT_CAP_MULT, MIN_TOTAL_HITS, MAX_TOTAL_HITS, MAX_Q_CAP, BOSS_TIERS, TIER_ORDER, TIER_WEIGHTS, CAMPAIGN_TIERS, PITY, FATIGUE, REFILL,
    tierWeights, pickTier, campaignTier, hitsNeeded, wrongBudget, maxQuestions, plannedQuestions, bossStats, hitsLeft, comboMult, hitDamage, fatigueAdjust, rewardMult, applyBossDamage,
    ENERGY, energyMaxForLevel, gainEnergy, energyFromCorrect, nextEnergyLevel,
    SKILL_MAX_LEVEL, UPGRADE_COSTS, SKILL_TABLE, skillUpgradeCost, skillInfo };
});
