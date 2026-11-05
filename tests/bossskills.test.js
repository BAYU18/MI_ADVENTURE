// tests/bossskills.test.js — uji unit skill boss per elemen + Mode Brutal + kartu Dex (node --test)
const test = require('node:test'); const assert = require('node:assert/strict');
const B = require('../shared/bossskills.js'); const P = require('../shared/progression.js'); const D = require('../public/js/dexcards.js'); const { run } = require('../scripts/sim-bossfx.js');
const allSkills = () => B.ELEMENT_ORDER.flatMap((e) => B.KITS[e].map((s) => ({ element: e, skill: s })));

test('struktur: 10 elemen × 4 skill, id unik, tipe dikenal', () => {
  assert.equal(B.ELEMENT_ORDER.length, 10);
  for (const e of B.ELEMENT_ORDER) { assert.equal(B.KITS[e].length, 4); assert.ok(B.ELEMENTS[e].desc.length > 20); }
  const ids = allSkills().map((x) => x.skill.id); assert.equal(new Set(ids).size, 40);
  for (const { skill } of allSkills()) assert.ok(B.ARCH[skill.type], skill.id);
});
test('rarity → jumlah skill: common 1, rare 2, epic 3, legend 4', () => {
  for (const e of B.ELEMENT_ORDER) assert.deepEqual(B.TIERS.map((t) => B.skillsFor(e, t).length), [1, 2, 3, 4]);
  assert.deepEqual(B.skillsFor('fire', 'common').map((s) => s.id), ['fire_rage']);                      // skill khas selalu yang pertama
  assert.ok(B.skillsFor('fire', 'legend').every((s, i) => s.id === B.KITS.fire[i].id));                 // tier tinggi ⊇ tier rendah
});
test('rarity → efek makin besar (tidak pernah mengecil)', () => {
  for (const { skill } of allSkills()) { const v = B.TIERS.map((t) => B.effectValue(skill, t, false)); for (let i = 1; i < 4; i++) assert.ok(v[i] > v[i - 1] - 1e-9, skill.id); assert.ok(v[3] > v[0], skill.id); }
});
test('Mode Brutal: efek skill tepat 2× (atau mentok batas pengaman), hadiah 3×', () => {
  for (const { skill } of allSkills()) for (const t of B.TIERS) {
    const n = B.effectValue(skill, t, false), b = B.effectValue(skill, t, true), cap = B.ARCH[skill.type].cap;
    assert.ok(Math.abs(b - 2 * n) < 1e-9 || Math.abs(b - cap) < 1e-9, `${skill.id}/${t}: ${n} → ${b}`);
  }
  assert.equal(B.brutalRewardMult(true), 3); assert.equal(B.brutalRewardMult(false), 1);
  assert.equal(B.brutalAvailable(5), true);
  assert.equal(B.brutalAvailable(4), false);
});
test('Api: makin sedikit darah boss, damage ke pemain makin besar (contoh permintaan)', () => {
  const dmg = (r, tier, brutal) => B.onWrong({ element: 'fire', tier, brutal: !!brutal, idx: 1, phase: 1, bossHpRatio: r, baseDamage: 6, playerMaxHp: 100, energy: 5, fx: B.newFx() }).damage;
  for (const t of B.TIERS) { const d = [1, 0.75, 0.5, 0.25, 0.05].map((r) => dmg(r, t)); for (let i = 1; i < d.length; i++) assert.ok(d[i] >= d[i - 1]); }
  assert.equal(dmg(1, 'common'), 6); assert.ok(dmg(0.05, 'common') > 6);
  assert.ok(dmg(0.05, 'legend') > dmg(0.05, 'common'));      // rarity tinggi → lonjakan lebih besar
  assert.ok(dmg(0.05, 'legend', true) > dmg(0.05, 'legend'));   // brutal → lebih besar lagi
});
test('jurus: peringatan tepat tiap-N soal; salah saat jurus = damage lebih besar; benar = tidak ada hukuman', () => {
  const o = (idx) => ({ element: 'fire', tier: 'rare', brutal: false, idx });
  assert.equal(B.telegraphFor(o(5)).skillId, 'fire_breath'); assert.equal(B.telegraphFor(o(4)), null); assert.equal(B.telegraphFor(o(10)).skillId, 'fire_breath');
  const base = { element: 'fire', tier: 'rare', brutal: false, phase: 1, bossHpRatio: 1, baseDamage: 6, playerMaxHp: 100, energy: 5, fx: B.newFx() };
  assert.ok(B.onWrong({ ...base, idx: 5 }).damage > B.onWrong({ ...base, idx: 4 }).damage);
  assert.equal(B.onQuestionStart({ ...o(5), fx: B.newFx(), monsterDamage: 6, playerHp: 100 }).telegraph.skillId, 'fire_breath');
});
test('pengaman: DoT tak membunuh, damage dibatasi, waktu punya lantai', () => {
  let fx = B.onWrong({ element: 'fire', tier: 'epic', brutal: true, idx: 1, phase: 1, bossHpRatio: 1, baseDamage: 9, playerMaxHp: 100, energy: 5, fx: B.newFx() }).fx;
  assert.ok(fx.dotTurns > 0);
  const q = B.onQuestionStart({ element: 'fire', tier: 'epic', brutal: true, idx: 2, fx, monsterDamage: 40, playerHp: 3 }); assert.ok(q.dotDamage <= 2);
  const w = B.onWrong({ element: 'fire', tier: 'legend', brutal: true, idx: 5, phase: 2, bossHpRatio: 0.01, baseDamage: 50, playerMaxHp: 100, energy: 5, fx: B.newFx() }); assert.ok(w.damage <= 50);
  for (const e of B.ELEMENT_ORDER) for (let i = 1; i <= 12; i++) { const r = B.onQuestionStart({ element: e, tier: 'legend', brutal: true, idx: i, fx: B.newFx(), monsterDamage: 6, playerHp: 100 }); assert.ok(r.timeMult >= B.LIMITS.minTimeMult); }
  assert.equal(B.applyTime(20, 0.5), 10); assert.equal(B.applyTime(8, 0.6), 8); assert.equal(B.applyTime(20, 1), 20);
});
test('pengubah sisi pemain: heal_curse, combo_seal, skill_tax hanya Fase 2', () => {
  const m1 = B.playerMods({ element: 'water', tier: 'legend', brutal: false, phase: 1 }); assert.ok(m1.healMult < 1); assert.equal(m1.extraCost, 0);
  assert.ok(B.playerMods({ element: 'ice', tier: 'legend', brutal: false, phase: 1 }).comboBonusMult < 1);
  assert.ok(B.playerMods({ element: 'thunder', tier: 'legend', brutal: false, phase: 2 }).extraCost >= 1); assert.equal(B.playerMods({ element: 'thunder', tier: 'legend', brutal: false, phase: 1 }).extraCost, 0);
  assert.equal(B.playerMods({ element: 'fire', tier: 'common', brutal: false, phase: 2 }).healMult, 1);
  const e = B.onWrong({ element: 'water', tier: 'legend', brutal: false, idx: 1, phase: 1, bossHpRatio: 1, baseDamage: 6, playerMaxHp: 100, energy: 8, fx: B.newFx() }); assert.ok(e.energyLoss >= 1 && e.energyLoss <= 8);
  assert.equal(B.onWrong({ element: 'water', tier: 'legend', brutal: false, idx: 1, phase: 1, bossHpRatio: 1, baseDamage: 6, playerMaxHp: 100, energy: 0, fx: B.newFx() }).energyLoss, 0);
});
test('jaminan v6 utuh: hook skill tidak pernah menyentuh HP boss; comboBonusMult tak membuat damage < 1 hit', () => {
  const w = B.onWrong({ element: 'fire', tier: 'legend', brutal: true, idx: 5, phase: 2, bossHpRatio: 0.2, baseDamage: 6, playerMaxHp: 100, energy: 5, fx: B.newFx() });
  const q = B.onQuestionStart({ element: 'fire', tier: 'legend', brutal: true, idx: 5, fx: B.newFx(), monsterDamage: 6, playerHp: 100 });
  for (const r of [w, q]) assert.ok(!('bossHp' in r) && !('bossDamage' in r));
  assert.equal(P.hitDamage({ comboStreak: 99, wrongStreak: 0, comboBonusMult: 0.1 }).damage >= P.HIT_UNIT, true);
});
test('tema → elemen: pemetaan eksplisit menang, kata kunci cadangan, tema tak dikenal = null', () => {
  assert.equal(B.elementForTheme('Gunung_Api'), 'fire'); assert.equal(B.elementForTheme('kutub_es'), 'ice'); assert.equal(B.elementForTheme('xyz'), null);
  B.THEME_ELEMENT.tema_aneh = 'light'; assert.equal(B.elementForTheme('tema_aneh'), 'light'); delete B.THEME_ELEMENT.tema_aneh;
  const ok = B.validateThemeMap(['gunung_api', 'laut', 'kutub_es', 'hutan', 'gua_batu', 'langit', 'kota_badai', 'malam', 'kristal', 'rawa']); assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.equal(B.validateThemeMap(['xyz']).ok, false);
  const saved = { ...B.THEME_ELEMENT };
  for (const k of Object.keys(B.THEME_ELEMENT)) delete B.THEME_ELEMENT[k];
  B.THEME_ELEMENT.gunung_api = 'fire'; assert.equal(B.themeForElement('fire'), 'gunung_api'); assert.equal(B.themeForElement('water'), null); delete B.THEME_ELEMENT.gunung_api;
  Object.assign(B.THEME_ELEMENT, saved);
});
test('Dex: 40 entri; tiap kartu memuat deskripsi + SEMUA skill; teks lengkap; 1 kartu per baris', () => {
  const list = B.dexEntries(); assert.equal(list.length, 40);
  for (const e of list) { assert.equal(e.skills.length, B.SKILL_COUNT[e.tier]); assert.ok(e.description.length > 30); for (const s of e.skills) { assert.ok(s.text.length > 10 && s.textBrutal.length > 10); assert.ok(!/undefined|NaN/.test(s.text + s.textBrutal)); } }
  const html = D.renderList(list, {}, { brutal: false });
  assert.equal((html.match(/<article class="dex-card/g) || []).length, 40);
  for (const e of list) { assert.ok(html.includes(D.esc(e.description))); for (const s of e.skills) assert.ok(html.includes(D.esc(s.text))); }
  assert.ok(!/line-clamp|text-overflow:\s*ellipsis|-webkit-box/.test(D.CSS));                          // teks tidak dipotong
  assert.ok(/grid-template-columns:1fr;/.test(D.CSS));                                               // 1 kolom
  assert.ok(D.renderCard(list[3], {}, { brutal: true }).includes(D.esc(list[3].skills[0].textBrutal)));   // pratinjau Brutal
  assert.ok(D.renderList(list, {}, { filter: { element: 'fire', tier: 'epic' } }).includes('dex-card-fire:epic'));
  assert.ok(D.renderCard({ ...list[0], title: '<img onerror=x>' }, {}, {}).includes('&lt;img'));       // XSS aman
});
test('event → teks Indonesia', () => {
  for (const ev of [{ type: 'telegraph', skillId: 'fire_breath', mult: 1.5 }, { type: 'charged_hit', skillId: 'fire_breath', mult: 1.5 }, { type: 'rage', skillId: 'fire_rage', mult: 1.3 }, { type: 'phase_rage', skillId: 'fire_inferno', mult: 1.1 },
    { type: 'dot_start', skillId: 'fire_burn', turns: 2 }, { type: 'dot', skillId: 'fire_burn', damage: 3 }, { type: 'time', skillId: 'ice_frost', pct: 8 }, { type: 'energy', skillId: 'water_siphon', amount: 2 }]) { const d = B.describeEvent(ev); assert.ok(d.text.length > 8 && !/undefined|NaN/.test(d.text)); }
});
test('simulasi keseimbangan (kasus terburuk: pemain tanpa skill) — pita penerimaan', () => {
  const avg = (tier, brutal, acc) => { const r = B.ELEMENT_ORDER.map((e) => run(e, tier, brutal, acc, 400)); r.forEach((x) => assert.equal(x.bad, 0, `${x.element}/${tier}: menang di luar 15–N`)); const w = r.map((x) => x.win); return { avg: w.reduce((a, b) => a + b, 0) / w.length, min: Math.min(...w) }; };
  const c = avg('common', false, 0.7), r = avg('rare', false, 0.7), e = avg('epic', false, 0.7), l = avg('legend', false, 0.7), lb = avg('legend', true, 0.7);
  assert.ok(c.avg >= 0.92 && c.min >= 0.80); assert.ok(r.avg >= 0.84 && r.min >= 0.72); assert.ok(e.avg >= 0.77 && e.min >= 0.50); assert.ok(l.avg >= 0.54 && l.min >= 0.28); assert.ok(lb.avg >= 0.31 && lb.min >= 0.10);
  assert.ok(l.avg > lb.avg);                                                                       // Brutal memang lebih sulit
  for (const t of B.TIERS) for (const br of [false, true]) { const x = avg(t, br, 0.9); assert.ok(x.avg >= 0.97 && x.min >= 0.88, `${t}/${br} @90%`); }
});
