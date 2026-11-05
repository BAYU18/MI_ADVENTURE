/* lib/bossfx.js — perekat server untuk skill boss & Mode Brutal. Murni terhadap objek `row` (baris game_sessions); TIDAK menyentuh DB.
   Pemanggil (lib/db.js) memuat row, memanggil fungsi di sini, lalu menulis `update` ke DB dalam transaksi yang sama dengan efek lain. */
'use strict';
const B = require('../shared/bossskills.js');
const parse = (s) => { try { return Object.assign(B.newFx(), JSON.parse(s || '{}')); } catch (_) { return B.newFx(); } };
const active = (row) => !!(row && row.boss_element && row.boss_tier);          // sesi lama (kolom NULL) → tanpa skill boss
const ctxOf = (row) => ({ element: row.boss_element, tier: row.boss_tier, brutal: !!row.brutal, phase: row.boss_phase || 1 });

// 1) Saat sesi DIBUAT → kolom baru untuk INSERT. themeKey = subjects.monster_theme; level = level profil.
function startFields({ themeKey, brutal, level }) {
  const element = B.elementForTheme(themeKey);                                   // null = tema belum terpetakan → tanpa skill (jangan gagal)
  const useBrutal = !!brutal && B.brutalAvailable(level) && !!element;
  return { boss_element: element, brutal: useBrutal ? 1 : 0, boss_fx_json: JSON.stringify(B.newFx()) };
}

// 2) Saat soal ke-idx (1-based) DISAJIKAN (start / next / resume). IDEMPOTEN: menyajikan ulang soal yang sama tidak memotong DoT dua kali.
function onServeQuestion(row, idx, baseTimeSec) {
  if (!active(row)) return { update: null, telegraph: null, timeMult: 1, timeLimitSec: baseTimeSec, dotDamage: 0, events: [] };
  const fx = parse(row.boss_fx_json); const again = fx.servedIdx === idx;
  const r = B.onQuestionStart({ ...ctxOf(row), idx, fx: again ? { ...fx, dotTurns: 0 } : fx, monsterDamage: row.monster_damage || 1, playerHp: row.player_hp });
  const dotDamage = again ? 0 : r.dotDamage;
  const nextFx = again ? fx : { ...r.fx, servedIdx: idx };
  const events = again ? r.events.filter((e) => e.type !== 'dot') : r.events;
  return { update: again ? null : { boss_fx_json: JSON.stringify(nextFx), player_hp: Math.max(1, row.player_hp - dotDamage) },
           telegraph: r.telegraph, timeMult: r.timeMult, timeLimitSec: B.applyTime(baseTimeSec, r.timeMult), dotDamage, events };
}

// 3) Saat jawaban SALAH. Mengembalikan damage final ke pemain (SEBELUM perisai), pengali perisai, energi tersedot, dan fx baru.
function onWrongAnswer(row, idx, energy) {
  const base = row.monster_damage || 1;
  if (!active(row)) return { damage: base, shieldMult: 1, energyLoss: 0, update: null, events: [] };
  const r = B.onWrong({ ...ctxOf(row), idx, bossHpRatio: row.boss_max_hp ? row.boss_hp / row.boss_max_hp : 1, baseDamage: base,
                         playerMaxHp: row.player_max_hp || 100, energy, fx: { ...parse(row.boss_fx_json) } });
  return { damage: r.damage, shieldMult: r.shieldMult, energyLoss: r.energyLoss, update: { boss_fx_json: JSON.stringify({ ...parse(row.boss_fx_json), ...r.fx }) }, events: r.events };
}

// 4) Pengubah untuk skill pemain: healMult, comboBonusMult (→ Progression.hitDamage), extraCost (+energi; tampil di skills[].cost & divalidasi server).
function skillMods(row) { return active(row) ? B.playerMods(ctxOf(row)) : { healMult: 1, comboBonusMult: 1, extraCost: 0 }; }

// 5) Hadiah: pengali Mode Brutal di ATAS pengali tier v6 (Progression.rewardMult(tier)). Panggil di SETIAP titik koin/XP sesi.
function rewardMult(row, tierMult) { const b = B.brutalRewardMult(!!(row && row.brutal)); return { coin: tierMult.coin * b, xp: tierMult.xp * b }; }

// 6) Ringkasan untuk respons API (start/answer/resume).
function publicView(row) {
  if (!active(row)) return { element: null, brutal: false, skills: [] };
  const sk = B.skillsFor(row.boss_element, row.boss_tier).map((s) => B.describeSkill(s, row.boss_tier, !!row.brutal));
  const el = B.ELEMENTS[row.boss_element]; return { element: row.boss_element, elementName: el.name, elementIcon: el.icon, title: el.title, brutal: !!row.brutal, skills: sk };
}
module.exports = { startFields, onServeQuestion, onWrongAnswer, skillMods, rewardMult, publicView, active };
