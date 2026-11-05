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

  await t.test('8. Proposal UI Battle: 3 Opsi Layout Soal & Jawaban + Menu Settings (Classic, Bottom Sheet, Compact)', () => {
    const dbPath = path.join(__dirname, '..', 'lib', 'db.js');
    const dbJs = fs.readFileSync(dbPath, 'utf8');

    // 1. db.js mendukung penyimpanan setting battleLayout
    assert.ok(dbJs.includes("'battleLayout'"), 'lib/db.js mengizinkan key battleLayout pada updatePlayerSettings');
    assert.ok(dbJs.includes("battleLayout: 'classic'"), 'lib/db.js menetapkan default battleLayout classic');

    // 2. app.js memuat default setting battleLayout dan dropdown pengaturan
    assert.ok(appJs.includes("battleLayout: 'classic'"), 'app.js menetapkan default battleLayout classic');
    assert.ok(appJs.includes('data-testid="setting-battle-layout"'), 'app.js menyediakan dropdown setting battle layout');
    assert.ok(appJs.includes('value="bottom_sheet"'), 'app.js mendukung opsi bottom_sheet');
    assert.ok(appJs.includes('value="compact"'), 'app.js mendukung opsi compact');

    // 3. app.js memuat render layout battle: bottom sheet drawer dan smart grid compact
    assert.ok(appJs.includes('battle-layout-${layout}'), 'app.js menambahkan kelas battle-layout dinamis');
    assert.ok(appJs.includes('data-testid="btn-open-answersheet"'), 'app.js memuat tombol pembuka lembar jawaban bottom sheet');
    assert.ok(appJs.includes('data-testid="answer-sheet-drawer"'), 'app.js memuat drawer lembar jawaban');
    assert.ok(appJs.includes('options-grid-2x2'), 'app.js mendukung smart grid 2x2 pada mode compact');

    // 4. style.css memuat styling lengkap untuk ketiga layout
    assert.ok(css.includes('.battle-layout-bottom_sheet'), 'style.css memuat aturan .battle-layout-bottom_sheet');
    assert.ok(css.includes('.answer-sheet-drawer'), 'style.css memuat aturan .answer-sheet-drawer');
    assert.ok(css.includes('.answer-sheet-backdrop'), 'style.css memuat aturan .answer-sheet-backdrop');
    assert.ok(css.includes('.btn-open-answersheet'), 'style.css memuat aturan .btn-open-answersheet');
    assert.ok(css.includes('.battle-layout-compact'), 'style.css memuat aturan .battle-layout-compact');
    assert.ok(css.includes('.options.options-grid-2x2'), 'style.css memuat aturan .options.options-grid-2x2');

    // 5. Header Battle: q-counter disembunyikan (soal xx/xx tidak usah muncul) dan battle-hud menampung semua info stat
    assert.ok(appJs.includes('class="hud battle-hud"'), 'app.js memuat kelas battle-hud');
    assert.ok(appJs.includes('id="q-counter" style="display:none"'), 'q-counter disembunyikan agar teks Soal xx/xx tidak muncul');
    assert.ok(css.includes('.battle-hud'), 'style.css memuat aturan .battle-hud');
    assert.ok(css.includes('.battle-hud .hud-left'), 'style.css memuat aturan .battle-hud .hud-left');
    assert.ok(css.includes('.battle-hud .hud-right'), 'style.css memuat aturan .battle-hud .hud-right');
  });

  await t.test('9. Sinkronisasi Tier Monster Sesi Pertempuran & Pencatatan Kemenangan di Monster Dex', () => {
    const db = require('../lib/db');
    const rawDb = db.getDb();

    // 1. startSession harus memilih monster yang tier-nya cocok dengan bossTier
    for (const tier of ['common', 'rare', 'epic', 'legend']) {
      // Cleanup running session first
      rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=8 AND status='IN_PROGRESS'").run();
      const sess = db.startSession(8, 1, { bossTier: tier });
      assert.ok(sess && sess.boss, `Sesi berhasil dibuat untuk tier ${tier}`);
      const mTier = db.getMonsterTierById(sess.boss.id);
      assert.equal(mTier, tier, `Tier monster yang dipilih (${mTier}) harus sama persis dengan bossTier (${tier})`);
      rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE id=?").run(sess.sessionId);
    }

    // 2. Verifikasi getDex akun bayu (player 8) menampilkan kemenangan boss Epic
    const bayuDex = db.getDex(8);
    const epicDefeated = bayuDex.filter(m => m.tier === 'epic' && (m.defeats > 0 || m.defeated));
    assert.ok(epicDefeated.length >= 1, 'Akun bayu harus memiliki minimal 1 boss Epic yang tercatat dikalahkan di Monster Dex');
    const turbinor = bayuDex.find(m => m.id === 88);
    assert.ok(turbinor && turbinor.defeats >= 1, 'Monster Epic #88 Turbinor tercatat dikalahkan oleh bayu');
  });

  await t.test('10. Penghapusan Bubble Notif Menghalangi & Floater Damage Ditampilkan di Tengah Layar', () => {
    const cssPath = path.join(__dirname, '..', 'public', 'css', 'style.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    const appPath = path.join(__dirname, '..', 'public', 'js', 'app.js');
    const appJs = fs.readFileSync(appPath, 'utf8');

    // 1. Bubble dialog (boss-dialog / pet-dialog) disembunyikan/dinonaktifkan agar tidak menghalangi arena
    assert.ok(css.includes('.dialog-bubble {\n  display: none !important;'), 'style.css menyembunyikan .dialog-bubble dengan display: none !important');
    assert.ok(!appJs.includes("this.showBossDialog('hit')"), 'app.js tidak memanggil dialog boss saat hit');
    assert.ok(!appJs.includes("this.showBossDialog('taunt')"), 'app.js tidak memanggil dialog boss saat taunt');
    assert.ok(!appJs.includes("this.showPetReaction('wrong')"), 'app.js tidak memanggil dialog pet saat salah');

    // 2. Damage floater (notif salah/benar) berposisi fixed di tengah-tengah layar (top: 50%, left: 50%) & rapi bertingkat via center-floater-container
    assert.ok(css.includes('position: fixed;'), 'style.css menggunakan position: fixed pada .center-floater-container / .damage-floater');
    assert.ok(css.includes('top: 50%;'), 'style.css menempatkan floater pada top: 50%');
    assert.ok(css.includes('left: 50%;'), 'style.css menempatkan floater pada left: 50%');
    assert.ok(css.includes('.center-floater-container'), 'style.css memuat kontainer bertingkat .center-floater-container agar notif tidak bertumpuk');
    assert.ok(appJs.includes('center-floater-container'), 'app.js menempelkan floater ke center-floater-container');

    // 3. Efek panel berkedip merah/hijau dinonaktifkan
    assert.ok(css.includes('.answer-blink-correct::after,\n.answer-blink-correct .boss-card::after'), 'style.css menonaktifkan .answer-blink-correct');
    assert.ok(!appJs.includes("battleRoot.classList.add(res.isCorrect ? 'answer-blink-correct' : 'answer-blink-wrong')"), 'app.js tidak mengaktifkan class blink');

    // 4. Banner pasif Raja Combo di atas (.passive-trigger-banner) dinonaktifkan
    assert.ok(css.includes('.passive-trigger-banner {\n  display: none !important;'), 'style.css menyembunyikan .passive-trigger-banner');
    assert.ok(!appJs.includes("const banner = document.createElement('div');\n        banner.className = 'passive-trigger-banner'"), 'app.js tidak membuat banner pasif di atas boss card');

    // 5. Format notifikasi hadiah koin ringkas (+N 🪙) tanpa teks panjang HADIAH MISTERI
    assert.ok(appJs.includes('+${coinDrop} 🪙'), 'app.js memformat hadiah koin ringkas +N 🪙');
    assert.ok(!appJs.includes('❓ HADIAH MISTERI: ${res.mysteryReward}!'), 'app.js tidak lagi menggunakan teks panjang HADIAH MISTERI: ...');

    // 6. Anti pemotongan teks notifikasi: fluid font (clamp), max-width aman, dan word-break
    assert.ok(css.includes('clamp(0.95rem, 4.2vw, 1.35rem)'), 'damage-floater menggunakan font clamp agar teks tidak meluap di mobile');
    assert.ok(css.includes('max-width: min(92vw, 420px)'), 'damage-floater dibatasi max-width aman agar tidak terpotong');
    assert.ok(css.includes('word-break: break-word;'), 'damage-floater dan enraged-banner mendukung word-break agar terbaca utuh');
    assert.ok(appJs.includes('🎯 TITIK LEMAH! -${dmg}'), 'app.js menggunakan notifikasi titik lemah yang ringkas dan tidak kepanjangan');

    // 7. Keterbacaan & kontras tinggi notifikasi kritikal
    assert.ok(css.includes('color: #fffbeb;'), 'style.css menggunakan warna teks cerah keemasan kontras tinggi untuk kritikal');
    assert.ok(css.includes('-1.5px -1.5px 0 #000'), 'style.css menerapkan outline hitam pekat 4 arah agar teks kritikal terbaca sangat tajam');
    assert.ok(!css.includes('text-shadow: 0 0 8px #ef4444;'), 'style.css tidak lagi memiliki override text-shadow buram tipis pada .damage-floater.crit');

    // 8. Audit skill pasif & eliminasi notifikasi ganda (misal 2 item dodge / passives sejenis)
    assert.ok(appJs.includes('seenCategories'), 'app.js melakukan deduplikasi ketat skill pasif berdasarkan kategori');
    assert.ok(appJs.includes("if (tp.id === 'dodge' || tp.id === 'crit') {\n          return;"), 'showPassiveTrigger tidak memunculkan floater ganda untuk dodge dan crit yang sudah ditampilkan oleh floater utama');
  });
});
