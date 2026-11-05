// tests/ui-v7.test.js — Pengujian UI Boss Elemen, Mode Brutal, dan Monster Dex (H.11, H.12)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const BossSkills = require('../shared/bossskills.js');
const DexCards = require('../public/js/dexcards.js');

test('H.11: Monster Dex UI (Spek F.1, F.3)', async (t) => {
  const entries = BossSkills.dexEntries();

  await t.test('1. Total 40 entri (10 elemen × 4 tier)', () => {
    assert.equal(entries.length, 40);
    const elements = new Set(entries.map(e => e.element));
    assert.equal(elements.size, 10);
    for (const el of BossSkills.ELEMENT_ORDER) {
      assert.ok(elements.has(el), `Elemen ${el} harus ada di Dex`);
    }
  });

  await t.test('2. DexCards.renderList: 1 baris = 1 kartu, lebar penuh, tanpa pemotongan teks', () => {
    const progressMock = {
      'fire:legend': { defeated: 5, brutalDefeated: 2 },
      'water:common': { defeated: 1, brutalDefeated: 0 }
    };
    const html = DexCards.renderList(entries, progressMock, { brutal: false });

    // Cek bahwa 40 kartu dirender
    const cardMatches = html.match(/class="dex-card/g) || [];
    assert.equal(cardMatches.length, 40);

    // Cek stats progress pada fire:legend
    assert.ok(html.includes('Dikalahkan 5× · Mode Brutal 2×'));
    // Cek stats progress default (0x)
    assert.ok(html.includes('Dikalahkan 0× · Mode Brutal 0×'));

    // Cek semua skill id dirender
    for (const e of entries) {
      assert.ok(html.includes(`data-testid="dex-card-${e.id}"`), `data-testid kartu ${e.id} ada`);
      for (const sk of e.skills) {
        assert.ok(html.includes(`data-testid="dex-skill-${sk.id}"`), `data-testid skill ${sk.id} ada`);
      }
    }
  });

  await t.test('3. DexCards filter elemen dan tier', () => {
    const fireOnly = DexCards.renderList(entries, {}, { filter: { element: 'fire' } });
    assert.equal((fireOnly.match(/class="dex-card/g) || []).length, 4);

    const legendOnly = DexCards.renderList(entries, {}, { filter: { tier: 'legend' } });
    assert.equal((legendOnly.match(/class="dex-card/g) || []).length, 10);

    const fireLegend = DexCards.renderList(entries, {}, { filter: { element: 'fire', tier: 'legend' } });
    assert.equal((fireLegend.match(/class="dex-card/g) || []).length, 1);
    assert.ok(fireLegend.includes('data-testid="dex-card-fire:legend"'));

    const empty = DexCards.renderList(entries, {}, { filter: { element: 'nonexistent' } });
    assert.ok(empty.includes('data-testid="dex-empty"'));
  });

  await t.test('4. Sakelar Brutal mengganti angka pratinjau (textBrutal)', () => {
    const normalHtml = DexCards.renderList(entries, {}, { filter: { element: 'fire', tier: 'common' }, brutal: false });
    const brutalHtml = DexCards.renderList(entries, {}, { filter: { element: 'fire', tier: 'common' }, brutal: true });

    assert.ok(normalHtml.includes('hingga ×1,22'));
    assert.ok(brutalHtml.includes('hingga ×1,44'));
    assert.ok(brutalHtml.includes('dex-brutal-badge'));
    assert.ok(brutalHtml.includes('💀 Brutal ×2'));
  });

  await t.test('5. Keamanan dari injeksi HTML (XSS)', () => {
    const maliciousEntry = [{
      id: 'test:xss',
      element: 'fire',
      elementName: '<script>alert("xss")</script>',
      icon: '🔥',
      color: '#fff',
      tier: 'common',
      tierLabel: '<b>Common</b>',
      title: '"><img src=x onerror=alert(1)>',
      description: '<style>body{display:none}</style>',
      skills: [{
        id: 'sk_xss',
        name: '<script>evil()</script>',
        icon: '⚠️',
        text: '<img src=x onerror=alert(2)>',
        textBrutal: '<img src=x onerror=alert(3)>'
      }]
    }];
    const html = DexCards.renderList(maliciousEntry, {}, { brutal: false });
    assert.doesNotMatch(html, /<script\b/i);
    assert.doesNotMatch(html, /<img\b/i);
    assert.doesNotMatch(html, /<style\b/i);
    assert.ok(html.includes('&lt;script&gt;'));
    assert.ok(html.includes('&lt;img'));
  });

  await t.test('6. Filter status koleksi: defeated (sudah dikalahkan), encountered, dan unencountered', () => {
    const mockMonsters = [
      { id: 1, name: 'Monster A', theme: 'hutan', tier: 'common', encounters: 5, defeats: 2 },
      { id: 2, name: 'Monster B', theme: 'hutan', tier: 'common', encounters: 3, defeats: 0 },
      { id: 3, name: 'Monster C', theme: 'hutan', tier: 'common', encounters: 0, defeats: 0 }
    ];

    const defeatedHtml = DexCards.renderList(mockMonsters, {}, { filter: { owner: 'defeated' } });
    assert.ok(defeatedHtml.includes('Monster A'), 'Monster A sudah dikalahkan');
    assert.ok(!defeatedHtml.includes('Monster B'), 'Monster B belum dikalahkan');
    assert.ok(!defeatedHtml.includes('Monster C'), 'Monster C belum dikalahkan');

    const encounteredHtml = DexCards.renderList(mockMonsters, {}, { filter: { owner: 'encountered' } });
    assert.ok(encounteredHtml.includes('Monster A'), 'Monster A ditemui');
    assert.ok(encounteredHtml.includes('Monster B'), 'Monster B ditemui');
    assert.ok(!encounteredHtml.includes('Monster C'), 'Monster C belum ditemui');

    const unencounteredHtml = DexCards.renderList(mockMonsters, {}, { filter: { owner: 'unencountered' } });
    assert.ok(!unencounteredHtml.includes('Monster A'), 'Monster A sudah ditemui');
    assert.ok(!unencounteredHtml.includes('Monster B'), 'Monster B sudah ditemui');
    assert.ok(unencounteredHtml.includes('Monster C'), 'Monster C belum ditemui');

    // Cek bahwa tombol data-owner="defeated" tersedia di app.js
    const appJs = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');
    assert.ok(appJs.includes('data-owner="defeated"'), 'Tombol filter status Dikalahkan ada di UI');
  });
});

test('H.12: UI Pertempuran & Mode Brutal (Spek E.1, E.2)', async (t) => {
  const indexPath = path.join(__dirname, '..', 'public', 'index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');

  const cssPath = path.join(__dirname, '..', 'public', 'css', 'style.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  const appPath = path.join(__dirname, '..', 'public', 'js', 'app.js');
  const appJs = fs.readFileSync(appPath, 'utf8');

  await t.test('1. index.html memuat bossskills.js dan dexcards.js sebelum app.js', () => {
    const posBossSkills = indexHtml.indexOf('/shared/bossskills.js');
    const posDexCards = indexHtml.indexOf('/js/dexcards.js');
    const posApp = indexHtml.indexOf('/js/app.js');

    assert.ok(posBossSkills !== -1, 'bossskills.js dimuat');
    assert.ok(posDexCards !== -1, 'dexcards.js dimuat');
    assert.ok(posApp !== -1, 'app.js dimuat');
    assert.ok(posBossSkills < posApp, 'bossskills.js dimuat sebelum app.js');
    assert.ok(posDexCards < posApp, 'dexcards.js dimuat sebelum app.js');
  });

  await t.test('2. style.css memuat kelas UI baru v7 dengan responsif dan reduced-motion', () => {
    assert.ok(css.includes('.boss-element-badge'), 'memuat .boss-element-badge');
    assert.ok(css.includes('.boss-skill-chips'), 'memuat .boss-skill-chips');
    assert.ok(css.includes('.boss-skill-chip'), 'memuat .boss-skill-chip');
    assert.ok(css.includes('.boss-telegraph'), 'memuat .boss-telegraph');
    assert.ok(css.includes('.boss-fx-toast'), 'memuat .boss-fx-toast');
    assert.ok(css.includes('.brutal-badge'), 'memuat .brutal-badge');
    assert.ok(css.includes('.battle-brutal'), 'memuat .battle-brutal');
    assert.ok(css.includes('.brutal-toggle-wrap'), 'memuat .brutal-toggle-wrap');
    assert.ok(css.includes('.boss-skill-sheet'), 'memuat .boss-skill-sheet');
    assert.ok(css.includes('.dex-list'), 'memuat .dex-list');
    assert.ok(css.includes('.dex-card'), 'memuat .dex-card');

    // Cek reduced motion untuk animasi
    assert.ok(css.includes('prefers-reduced-motion'), 'mendukung prefers-reduced-motion');
    assert.ok(css.includes('body.reduced-motion'), 'mendukung toggle setting reduced-motion');
  });

  await t.test('3. app.js memuat semua data-testid dan elemen UI yang disyaratkan', () => {
    // Battle UI testids
    assert.ok(appJs.includes('data-testid="boss-element-badge"'));
    assert.ok(appJs.includes('data-testid="brutal-badge"'));
    assert.ok(appJs.includes('data-testid="boss-skill-chips"'));
    assert.ok(appJs.includes('data-testid="boss-telegraph"'));
    assert.ok(appJs.includes("'boss-fx-toast'") || appJs.includes('"boss-fx-toast"'));
    assert.ok(appJs.includes('aria-live="assertive"'));

    // Subjects & Brutal toggle testids
    assert.ok(appJs.includes('data-testid="brutal-toggle-wrap"'));
    assert.ok(appJs.includes('data-testid="brutal-toggle"'));
    assert.ok(appJs.includes('data-testid="result-brutal-reward"'));

    // Dex screen testids
    assert.ok(appJs.includes('data-testid="dex-filter-element"'));
    assert.ok(appJs.includes('data-testid="dex-filter-tier"'));
    assert.ok(appJs.includes('data-testid="dex-brutal-toggle"'));
    assert.ok(appJs.includes('id="dex-list-slot"'));
  });

  await t.test('4. showConfirmModal & Shop buy dialog mendukung rich HTML tanpa escaping mentah', () => {
    // Pastikan showConfirmModal mendeteksi tag HTML
    assert.ok(appJs.includes('/<[a-z][\\s\\S]*>/i'), 'showConfirmModal mendeteksi format HTML');
    assert.ok(appJs.includes('isHtml ? message : esc(message)'), 'menghindari escaping ganda saat message berupa HTML');

    // Pastikan wiring tombol beli di toko membungkus detail pasif, lore, dan harga secara terstruktur
    assert.ok(appJs.includes('Efek Pasif:'), 'deskripsi memuat Efek Pasif');
    assert.ok(appJs.includes('it.lore'), 'deskripsi memuat lore item');
  });

  await t.test('5. Audit & Fix Skill Battle (Mata Elang / eagle_eye & eliminate_one) & Status Buff Pasif Skin', () => {
    // 1. Pastikan getSession & nextQuestion memilih answer_index
    const dbJs = fs.readFileSync(path.join(__dirname, '../lib/db.js'), 'utf8');
    assert.ok(dbJs.includes('SELECT sq.*, q.text, q.options_json, q.answer_index,'), 'q.answer_index dipilih pada query soal');

    // 2. Pastikan battle UI memuat passives bar dan buff chips
    assert.ok(appJs.includes('data-testid="player-passives-bar"'), 'battle-root memuat player-passives-bar');
    assert.ok(appJs.includes('renderPassiveBuffChips'), 'Screens.battle memuat renderPassiveBuffChips');
    assert.ok(appJs.includes('showPassiveTrigger'), 'Screens.battle memuat showPassiveTrigger');
    assert.ok(appJs.includes('buff-comboDamagePercent'), 'renderPassiveBuffChips mendukung buff Raja Combo (comboDamagePercent)');
    assert.ok(dbJs.includes("id: 'comboDamagePercent', name: 'Raja Combo!'"), 'answerQuestion memicu triggeredPassives untuk Raja Combo');

    // 3. Pastikan style.css memuat animasi passives & pulse
    assert.ok(css.includes('.player-passives-bar'), 'style.css memuat .player-passives-bar');
    assert.ok(css.includes('.battle-buff-chip'), 'style.css memuat .battle-buff-chip');
    assert.ok(css.includes('.passive-trigger-banner'), 'style.css memuat .passive-trigger-banner');
    assert.ok(css.includes('buffGlow'), 'style.css memuat keyframes buffGlow');
    assert.ok(css.includes('passivePop'), 'style.css memuat keyframes passivePop');
  });

  await t.test('6. Loadout Bos Battle vs Player (5 Slot) & Integrasi Buff di Menu Skill serta Arena Duel', () => {
    // 1. Pastikan app.js mendukung loadout bos 5 slot dan modal
    assert.ok(appJs.includes('loadout-boss-slot'), 'app.js memuat loadout-boss-slot');
    assert.ok(appJs.includes('openSelectBossForSlotModal'), 'Screens.profil memuat openSelectBossForSlotModal');
    assert.ok(appJs.includes('getDuelBossLoadout'), 'API memuat getDuelBossLoadout');
    assert.ok(appJs.includes('updateDuelBossLoadout'), 'API memuat updateDuelBossLoadout');

    // 2. Pastikan duel.js memuat wadah buff dan fungsi renderDuelBuffs
    const duelJs = fs.readFileSync(path.join(__dirname, '../public/js/duel.js'), 'utf8');
    assert.ok(duelJs.includes('duel-buffs-me'), 'duel.js memuat wadah buff player');
    assert.ok(duelJs.includes('duel-buffs-opp'), 'duel.js memuat wadah buff lawan');
    assert.ok(duelJs.includes('renderDuelBuffs'), 'duel.js memuat fungsi renderDuelBuffs');
    assert.ok(duelJs.includes('bossSkillsTriggered'), 'duel.js mendeteksi bossSkillsTriggered');

    // 3. Pastikan style.css memuat styling chip buff duel
    assert.ok(css.includes('.duel-buffs-row'), 'style.css memuat .duel-buffs-row');
    assert.ok(css.includes('.duel-buff-chip'), 'style.css memuat .duel-buff-chip');
    assert.ok(css.includes('.buff-pulse'), 'style.css memuat .buff-pulse');
  });

  await t.test('7. Variasi Skill Unik Monster Common, Rare, dan Epic di DexCards dan Monster Detail', () => {
    const dexcardsPath = path.join(__dirname, '..', 'public', 'js', 'dexcards.js');
    const dexcardsJs = fs.readFileSync(dexcardsPath, 'utf8');
    assert.ok(dexcardsJs.includes('B.skillsFor(elKey, mTier, m.id)'), 'dexcards.js memanggil skillsFor dengan m.id');

    // Uji render kartu monster #1 (Lumutra) vs #2 (Akarok) -> Common beda skill
    const DexCards = require('../public/js/dexcards.js');
    const mockHutanMonsters = [
      { id: 1, name: 'Lumutra', theme: 'hutan', tier: 'common', encountered: 1, defeats: 1 },
      { id: 2, name: 'Akarok', theme: 'hutan', tier: 'common', encountered: 1, defeats: 1 },
      { id: 5, name: 'Daunjir', theme: 'hutan', tier: 'rare', encountered: 1, defeats: 1 },
      { id: 6, name: 'Burunggar', theme: 'hutan', tier: 'rare', encountered: 1, defeats: 1 },
      { id: 8, name: 'Rimbazo', theme: 'hutan', tier: 'epic', encountered: 1, defeats: 1 },
      { id: 9, name: 'Beringkus', theme: 'hutan', tier: 'epic', encountered: 1, defeats: 1 }
    ];

    const card1 = DexCards.renderList([mockHutanMonsters[0]]);
    const card2 = DexCards.renderList([mockHutanMonsters[1]]);
    assert.ok(card1.includes('Racun Duri'), 'Lumutra membawa skill Racun Duri');
    assert.ok(!card1.includes('Akar Membelit'), 'Lumutra TIDAK membawa Akar Membelit');
    assert.ok(card2.includes('Akar Membelit'), 'Akarok membawa skill Akar Membelit');
    assert.ok(!card2.includes('Racun Duri'), 'Akarok TIDAK membawa Racun Duri');

    // Uji Rare #5 vs #6
    const card5 = DexCards.renderList([mockHutanMonsters[2]]);
    const card6 = DexCards.renderList([mockHutanMonsters[3]]);
    assert.ok(card5.includes('Racun Duri') && card5.includes('Akar Membelit'), 'Daunjir membawa Racun Duri + Akar Membelit');
    assert.ok(card6.includes('Akar Membelit') && card6.includes('Serbuk Lelap'), 'Burunggar membawa Akar Membelit + Serbuk Lelap');

    // Uji Epic #8 vs #9
    const card8 = DexCards.renderList([mockHutanMonsters[4]]);
    const card9 = DexCards.renderList([mockHutanMonsters[5]]);
    assert.ok(card8.includes('Racun Duri') && !card8.includes('Lumut Penghisap'), 'Rimbazo membawa Racun Duri');
    assert.ok(!card9.includes('Racun Duri') && card9.includes('Lumut Penghisap'), 'Beringkus membawa Lumut Penghisap');
  });
});
