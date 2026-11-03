#!/usr/bin/env node
// scripts/sim-boss.js — simulasi keseimbangan boss (tanpa DB). Jalankan: node scripts/sim-boss.js [--check]
const P = require('../shared/progression.js');
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function battle(tier, ability, acc, rand, playerMaxHp = 100) {
  const st = P.bossStats(tier, ability, playerMaxHp);
  let bossHp = st.bossMaxHp, hp = playerMaxHp, streak = 0, wrongStreak = 0, correct = 0, q = 0, phase2 = false;
  while (q < st.maxQuestions) {
    q++;
    if (rand() < acc) {
      correct++; streak++;
      bossHp = P.applyBossDamage(bossHp, P.hitDamage({ comboStreak: streak, powerMult: 1, wrongStreak }).damage, correct); wrongStreak = 0;
      if (bossHp <= 0) return { win: true, q, correct, n: st.hitsNeeded };
      if (!phase2 && bossHp <= st.bossMaxHp / 2) { phase2 = true; bossHp = P.fatigueAdjust({ bossHp, correctCount: correct, answeredCount: q }).bossHp; }
    } else { streak = 0; wrongStreak++; hp -= st.monsterDamage; if (hp <= 0) return { win: false, q, correct, n: st.hitsNeeded }; }
  }
  return { win: false, timeout: true, q, correct, n: st.hitsNeeded };
}
function run(tier, ability, acc, runs = 2000) {
  const rand = rng(12345 + tier.length * 7 + ability * 3 + Math.round(acc * 100)); let win = 0, sumQ = 0, maxCorrectWin = 0, minCorrectWin = 99, bad = 0;
  for (let i = 0; i < runs; i++) { const r = battle(tier, ability, acc, rand); sumQ += r.q; if (r.win) { win++; maxCorrectWin = Math.max(maxCorrectWin, r.correct); minCorrectWin = Math.min(minCorrectWin, r.correct); if (r.correct > r.n) bad++; } }
  return { tier, ability, acc, win: win / runs, avgQ: sumQ / runs, minCorrectWin, maxCorrectWin, overN: bad };
}
if (require.main === module) {
  const rows = [];
  for (const tier of P.TIER_ORDER) for (const ability of [30, 50, 80]) for (const acc of [0.5, 0.7, 0.9]) rows.push(run(tier, ability, acc));
  console.log('tier    ability acc   menang  rataQ  benar(min-max saat menang)  melebihiN');
  for (const r of rows) console.log(`${r.tier.padEnd(7)} ${String(r.ability).padStart(5)}  ${r.acc.toFixed(1)}  ${(r.win * 100).toFixed(0).padStart(5)}%  ${r.avgQ.toFixed(1).padStart(5)}  ${String(r.minCorrectWin).padStart(3)}-${String(r.maxCorrectWin).padEnd(3)}                  ${r.overN}`);
}
module.exports = { battle, run, rng };
