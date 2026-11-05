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

    // 3. Pastikan style.css memuat animasi passives & pulse
    assert.ok(css.includes('.player-passives-bar'), 'style.css memuat .player-passives-bar');
    assert.ok(css.includes('.battle-buff-chip'), 'style.css memuat .battle-buff-chip');
    assert.ok(css.includes('.passive-trigger-banner'), 'style.css memuat .passive-trigger-banner');
    assert.ok(css.includes('buffGlow'), 'style.css memuat keyframes buffGlow');
    assert.ok(css.includes('passivePop'), 'style.css memuat keyframes passivePop');
  });
});
