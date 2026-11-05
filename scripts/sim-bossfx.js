#!/usr/bin/env node
// scripts/sim-bossfx.js — simulasi keseimbangan skill boss per elemen × tier × (normal|brutal). Tanpa DB. Jalankan: node scripts/sim-bossfx.js
const P = require('../shared/progression.js'); const B = require('../shared/bossskills.js');
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// Model pemain: akurasi dasar `acc`; soal "waktu dikurangi" menurunkan akurasi (setengah dari persentase pengurangan waktu). Pemain TIDAK memakai skill (kasus terburuk).
function battle(element, tier, brutal, acc, rand, ability = 50, playerMaxHp = 100) {
  const st = P.bossStats(tier, ability, playerMaxHp);
  let bossHp = st.bossMaxHp, hp = playerMaxHp, streak = 0, wrongStreak = 0, correct = 0, q = 0, phase = 1, fx = B.newFx(), fatigued = false;
  while (q < st.maxQuestions) {
    q++;
    const qs = B.onQuestionStart({ element, tier, brutal, idx: q, phase, fx, monsterDamage: st.monsterDamage, playerHp: hp });
    fx = qs.fx; hp -= qs.dotDamage;
    const pEff = acc * (1 - 0.5 * (1 - qs.timeMult));
    if (rand() < pEff) {
      correct++; streak++;
      const mods = B.playerMods({ element, tier, brutal, phase });
      const dmg = P.hitDamage({ comboStreak: streak, powerMult: 1, wrongStreak, comboBonusMult: mods.comboBonusMult }).damage;
      bossHp = P.applyBossDamage(bossHp, dmg, correct); wrongStreak = 0;
      if (bossHp <= 0) return { win: true, q, correct, n: st.hitsNeeded, hpLeft: hp };
      if (phase === 1 && bossHp <= st.bossMaxHp / 2) { phase = 2; if (!fatigued) { fatigued = true; bossHp = P.fatigueAdjust({ bossHp, correctCount: correct, answeredCount: q }).bossHp; } }
    } else {
      streak = 0; wrongStreak++;
      const w = B.onWrong({ element, tier, brutal, idx: q, phase, bossHpRatio: bossHp / st.bossMaxHp, baseDamage: st.monsterDamage, playerMaxHp, energy: 5, fx });
      fx = w.fx; hp -= w.damage; if (hp <= 0) return { win: false, q, correct, n: st.hitsNeeded };
    }
  }
  return { win: false, timeout: true, q, correct, n: st.hitsNeeded };
}
function run(element, tier, brutal, acc, runs = 1000) {
  const rand = rng(777 + element.length * 31 + tier.length * 7 + (brutal ? 99 : 0) + Math.round(acc * 100));
  let win = 0, sumQ = 0, bad = 0;
  for (let i = 0; i < runs; i++) { const r = battle(element, tier, brutal, acc, rand); sumQ += r.q; if (r.win) { win++; if (r.correct > r.n || r.correct < 15) bad++; } }
  return { element, tier, brutal, acc, win: win / runs, avgQ: sumQ / runs, bad };
}
if (require.main === module) {
  console.log('Rata-rata menang lintas 10 elemen  [min–maks antar elemen]   (tanpa skill pemain; skor kemampuan 50)');
  console.log('tier    mode     acc50            acc70            acc90');
  for (const tier of P.TIER_ORDER) for (const brutal of [false, true]) {
    const cells = [0.5, 0.7, 0.9].map((acc) => { const rs = B.ELEMENT_ORDER.map((e) => run(e, tier, brutal, acc, 600).win); const avg = rs.reduce((a, b) => a + b, 0) / rs.length; return `${(avg * 100).toFixed(0).padStart(3)}% [${(Math.min(...rs) * 100).toFixed(0)}–${(Math.max(...rs) * 100).toFixed(0)}]`.padEnd(16); });
    console.log(`${tier.padEnd(7)} ${brutal ? 'BRUTAL' : 'normal'}  ${cells.join(' ')}`);
  }
}
module.exports = { battle, run, rng };
