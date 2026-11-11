// tests/desktop-mode.test.js — Pengujian Lengkap Desktop Mode Cockpit UI (Single-Viewport)
// Sesuai DESIGN_UI_GAME_DESKTOP_MODE_CODE_DAN_STRUKTUR.md & mockup_desktop_mode.html
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Desktop Mode Cockpit UI Test Suite', async (t) => {
  const rootDir = path.join(__dirname, '..');
  const cssDesktopPath = path.join(rootDir, 'public', 'css', 'desktop.css');
  const coreJsPath = path.join(rootDir, 'public', 'js', 'desktop', 'core.js');
  const screensJsPath = path.join(rootDir, 'public', 'js', 'desktop', 'screens.js');
  const indexHtmlPath = path.join(rootDir, 'public', 'index.html');
  const appJsPath = path.join(rootDir, 'public', 'js', 'app.js');

  await t.test('1. Verifikasi Keberadaan Berkas dan Dokumentasi Desktop Mode', () => {
    assert.ok(fs.existsSync(cssDesktopPath), 'public/css/desktop.css harus ada');
    assert.ok(fs.existsSync(coreJsPath), 'public/js/desktop/core.js harus ada');
    assert.ok(fs.existsSync(screensJsPath), 'public/js/desktop/screens.js harus ada');
    assert.ok(
      fs.existsSync(path.join(rootDir, 'docs', 'DESIGN_UI_GAME_DESKTOP_MODE_CODE_DAN_STRUKTUR.md')),
      'Dokumen desain desktop mode harus tersimpan di folder docs/'
    );
    assert.ok(
      fs.existsSync(path.join(rootDir, 'docs', 'mockup_desktop_mode.html')),
      'Mockup interaktif desktop mode harus tersimpan di folder docs/'
    );
  });

  await t.test('2. Verifikasi CSS Desktop: Skala Fluid, No-Scroll Cockpit & Guard', () => {
    const css = fs.readFileSync(cssDesktopPath, 'utf8');

    // 1. Skala fluid 100rem x 56.25rem (16:9)
    assert.ok(
      css.includes('clamp(10px, min(1vw, 1.7778vh), 22px)'),
      'desktop.css harus menghitung rem fluid dari lebar & tinggi jendela'
    );

    // 2. Shell #app.d-play Single-Viewport 100vw x 100dvh tanpa scroll
    assert.ok(css.includes('#app.d-play'), 'desktop.css mendefinisikan layout grid #app.d-play');
    assert.ok(css.includes('100vw'), 'Lebar kanvas 100vw');
    assert.ok(css.includes('100dvh'), 'Tinggi kanvas 100dvh');
    assert.ok(css.includes('overflow: hidden'), 'Tidak ada scroll halaman (overflow: hidden)');

    // 3. Mode Fokus (battle, duel, result, auth) menyembunyikan rail & topbar
    assert.ok(css.includes('#app.d-play.focus'), 'Mode focus untuk battle, duel, result, auth');
    assert.ok(css.includes('.focus .d-top'), 'Top bar disembunyikan saat mode fokus');
    assert.ok(css.includes('.focus .d-rail'), 'Rail navigasi disembunyikan saat mode fokus');

    // 4. Guard resolusi minimal 1280x720
    assert.ok(css.includes('#d-guard'), 'Terdapat pelindung resolusi #d-guard');
    assert.ok(
      css.includes('@media (max-width: 1279px), (max-height: 719px)'),
      'Guard muncul saat resolusi di bawah 1280x720'
    );
  });

  await t.test('3. Verifikasi Integrasi public/index.html (CSS Switcher & Script Tags)', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf8');

    // 1. Link stylesheet dengan ID untuk mode dinamis switcher
    assert.ok(html.includes('id="css-mobile"'), 'index.html memberi id="css-mobile" pada style.css');
    assert.ok(html.includes('id="css-desktop"'), 'index.html memuat css/desktop.css dengan id="css-desktop"');

    // 2. Guard container di DOM
    assert.ok(html.includes('id="d-guard"'), 'index.html memuat elemen #d-guard');
    assert.ok(html.includes('Desktop Mode Butuh Layar Min. 1280×720'), 'Pesan peringatan resolusi ada di guard');

    // 3. Pemuatan skrip desktop
    assert.ok(html.includes('js/desktop/core.js'), 'index.html memuat js/desktop/core.js');
    assert.ok(html.includes('js/desktop/screens.js'), 'index.html memuat js/desktop/screens.js');
  });

  await t.test('4. Verifikasi Logika public/js/desktop/core.js', () => {
    const coreJs = fs.readFileSync(coreJsPath, 'utf8');

    // 1. Modul UIMode
    assert.ok(coreJs.includes('const UIMode = {'), 'core.js memiliki objek UIMode');
    assert.ok(coreJs.includes('MIN_W: 1280'), 'Batas lebar minimal 1280');
    assert.ok(coreJs.includes('MIN_H: 720'), 'Batas tinggi minimal 720');
    assert.ok(coreJs.includes('pref()'), 'Mendukung preferensi mode (auto | desktop | mobile)');
    assert.ok(coreJs.includes('setPref(v)'), 'Mendukung penyimpanan preferensi mode');
    assert.ok(coreJs.includes('detect()'), 'Mendukung deteksi otomatis rasio & pointer:fine');

    // 2. Modul Keys (Papan Pintas)
    assert.ok(coreJs.includes('const Keys = {'), 'core.js memiliki objek Keys');
    assert.ok(coreJs.includes('addEventListener(\'keydown\''), 'Keys mendengarkan event keydown');

    // 3. Shell Desktop & Navigasi
    assert.ok(coreJs.includes('const DesktopShell = {'), 'core.js memiliki objek DesktopShell');
    assert.ok(coreJs.includes('topbar(P'), 'DesktopShell memiliki fungsi topbar');
    assert.ok(coreJs.includes('rail(active)'), 'DesktopShell memiliki fungsi rail');
    assert.ok(coreJs.includes('mount(app, name, params)'), 'DesktopShell memiliki fungsi mount');
    assert.ok(coreJs.includes('keysHelp()'), 'DesktopShell menyediakan dialog bantuan shortcut');

    // 4. Daftar 11 Navigasi Rail (Duel diakses via menu Pertemanan seperti mobile)
    const navItems = ['home', 'peta', 'latihan', 'friends', 'skill', 'wardrobe', 'shop', 'dex', 'profil', 'report', 'settings'];
    navItems.forEach(item => {
      assert.ok(coreJs.includes(`'${item}'`), `NAV mencakup layar ${item}`);
    });
    assert.ok(!coreJs.includes("['duel',"), 'NAV tidak mencakup menu duel terpisah');

    // 5. Layar Fokus (tanpa topbar/rail)
    const focusItems = ['auth', 'battle', 'duel', 'result'];
    focusItems.forEach(item => {
      assert.ok(coreJs.includes(`'${item}'`), `FOCUS mencakup layar ${item}`);
    });
  });

  await t.test('5. Verifikasi Ke-14 Layar pada public/js/desktop/screens.js', () => {
    const screensJs = fs.readFileSync(screensJsPath, 'utf8');

    const expectedScreens = [
      'auth',
      'home',
      'peta',
      'latihan',
      'battle',
      'result',
      'wardrobe',
      'shop',
      'duel',
      'skill',
      'dex',
      'profil',
      'report',
      'settings',
      'friends'
    ];

    expectedScreens.forEach(sc => {
      assert.ok(
        screensJs.includes(`DesktopScreens.${sc} =`),
        `screens.js harus mengimplementasikan DesktopScreens.${sc}`
      );
    });

    // Fitur khas tiap layar:
    assert.ok(screensJs.includes('auth-hero') && screensJs.includes('auth-form'), 'Layar auth memiliki layout split');
    assert.ok(screensJs.includes('hero-card') && screensJs.includes('stage'), 'Layar home memiliki cockpit 3 kolom');
    assert.ok(screensJs.includes('map-canvas') && screensJs.includes('Mode Brutal'), 'Layar peta memiliki canvas simpul & brutal toggle');
    assert.ok(screensJs.includes('b-focus') && screensJs.includes('Fokus Baca'), 'Layar battle memiliki tombol mode Fokus Baca');
    assert.ok(screensJs.includes('KEMENANGAN TELAK!') && screensJs.includes('stars'), 'Layar result memiliki selebrasi bintang');
    assert.ok(screensJs.includes('cat-tabs') && screensJs.includes('preview-stage'), 'Layar wardrobe memiliki tab kategori & pratinjau live');
    assert.ok(screensJs.includes('chest-banner') && screensJs.includes('shop-grid'), 'Layar shop memiliki peti gacha & penawaran');
    assert.ok(screensJs.includes('round-dots') && screensJs.includes('vs'), 'Layar duel memiliki ronde & indikator VS');
    assert.ok(screensJs.includes('big-slot') && screensJs.includes('SKILLS'), 'Layar skill memiliki 3 slot aktif & 10 skill RPG');
    assert.ok(screensJs.includes('dex-grid') && screensJs.includes('100 monster'), 'Layar dex menampilkan 100 monster dalam kisi 10x10');
    assert.ok(screensJs.includes('showcase') && screensJs.includes('badge-grid'), 'Layar profil memiliki showcase lencana & rekor');
    assert.ok(screensJs.includes('chart') && screensJs.includes('weak'), 'Layar report memiliki grafik mingguan & titik lemah');
    assert.ok(screensJs.includes('Mode UI: Otomatis') && screensJs.includes('Paksa Desktop'), 'Layar settings memiliki pemilih mode UI');
  });

  await t.test('6. Verifikasi Integrasi Setting Mode UI pada app.js (Mobile Coexistence)', () => {
    const appJs = fs.readFileSync(appJsPath, 'utf8');

    assert.ok(appJs.includes('setting-ui-mode'), 'app.js memiliki opsi pengaturan mode UI (setting-ui-mode)');
    assert.ok(appJs.includes('sel-ui-mode'), 'app.js menangani event perubahan sel-ui-mode');
    assert.ok(appJs.includes('window.UIMode.setPref'), 'app.js memanggil window.UIMode.setPref saat opsi diubah');
  });

  await t.test('7. Verifikasi Sinkronisasi Data Live & Layar Pertemanan (Desktop Cockpit)', () => {
    const screensJs = fs.readFileSync(screensJsPath, 'utf8');
    const coreJs = fs.readFileSync(coreJsPath, 'utf8');

    // 1. Verifikasi Layar Pertemanan (DesktopScreens.friends)
    assert.ok(screensJs.includes('DesktopScreens.friends ='), 'screens.js memiliki DesktopScreens.friends');
    assert.ok(screensJs.includes('friends-list'), 'Layar friends memiliki daftar teman');
    assert.ok(screensJs.includes('btn-duel-challenge'), 'Layar friends memiliki tombol tantang duel');
    assert.ok(screensJs.includes('/api/duels/invites'), 'Layar friends membaca undangan duel live');
    assert.ok(screensJs.includes('/api/friends/search'), 'Layar friends mendukung pencarian teman live');

    // 2. Verifikasi Sinkronisasi Data Live Backend
    assert.ok(screensJs.includes('API.getProfile'), 'Sinkronisasi profil & statistik kemenangan');
    assert.ok(screensJs.includes('API.getWeeklyReport'), 'Sinkronisasi laporan belajar mingguan live');
    assert.ok(screensJs.includes('API.getShop'), 'Sinkronisasi katalog & transaksi toko');
    assert.ok(screensJs.includes('API.getInventory') && screensJs.includes('API.updateAvatar'), 'Sinkronisasi lemari & avatar live');
    assert.ok(screensJs.includes('API.getSkills') && screensJs.includes('API.upgradeSkill'), 'Sinkronisasi skill RPG live');
    assert.ok(screensJs.includes('/api/badges/claim'), 'Mendukung klaim hadiah lencana');

    // 3. Verifikasi Rail Mounted di DesktopShell
    assert.ok(coreJs.includes('this.rail(name)'), 'DesktopShell.mount menyertakan this.rail(name)');
    assert.ok(coreJs.includes('updateTopbar'), 'DesktopShell menyediakan fungsi updateTopbar');
  });

  await t.test('8. Verifikasi Pembersihan Mockup Budi, Asset Asli Mobile & Penyelarasan Menu', () => {
    const screensJs = fs.readFileSync(screensJsPath, 'utf8');
    const coreJs = fs.readFileSync(coreJsPath, 'utf8');

    // 1. Verifikasi Penghapusan Mockup Budi saat Login
    assert.ok(!screensJs.includes('value="Budi"'), 'Tidak boleh ada default value="Budi" pada form login');
    assert.ok(!screensJs.includes('value="1234"'), 'Tidak boleh ada default value="1234" pada form login');
    assert.ok(!screensJs.includes('name: \'Bayu Pratama\''), 'Tidak boleh ada fallback akun dummy Bayu Pratama');

    // 2. Verifikasi Penggunaan Aset Asli dari Mode Mobile
    assert.ok(screensJs.includes('renderMonsterArt'), 'Menggunakan generator asset monster asli');
    assert.ok(screensJs.includes('renderItemArt'), 'Menggunakan generator asset item/skin asli');
    assert.ok(screensJs.includes('renderSkillArt'), 'Menggunakan generator asset 3D skill asli');
    assert.ok(screensJs.includes('renderBadgeArt'), 'Menggunakan generator asset lencana asli');
    assert.ok(screensJs.includes('renderPlayerAvatar'), 'Menggunakan generator asset avatar pemain asli');

    // 3. Verifikasi Penyelarasan Menu dengan Mode Mobile
    const mobileMenus = ['Petualangan', 'Pertemanan', 'Latihan', 'Laporan', 'Profil', 'Skin', 'Skill', 'Toko', 'Monsterdex', 'Pengaturan'];
    mobileMenus.forEach(m => {
      assert.ok(coreJs.includes(m), `Navigasi desktop mencakup nama menu mobile: ${m}`);
    });
  });

  await t.test('9. Verifikasi Penyelarasan Mode Cerita, Toko Rapi, Skill Deck & Desain SVG 100%', () => {
    const screensJs = fs.readFileSync(screensJsPath, 'utf8');
    const cssDesktop = fs.readFileSync(cssDesktopPath, 'utf8');

    // 1. Verifikasi Mode Cerita Peta Petualangan
    assert.ok(screensJs.includes('mode-toggle-bebas'), 'Layar peta harus memiliki tombol Mode Bebas');
    assert.ok(screensJs.includes('mode-toggle-cerita'), 'Layar peta harus memiliki tombol Mode Cerita');
    assert.ok(screensJs.includes('mode-toggle-fun'), 'Layar peta harus memiliki tombol Mode Fun');
    assert.ok(screensJs.includes('brutal-toggle-wrap'), 'Layar peta memiliki pembungkus sakelar brutal');
    assert.ok(screensJs.includes('data-testid="brutal-toggle"'), 'Layar peta memiliki input brutal-toggle');
    assert.ok(!screensJs.includes('class-tabs-container'), 'Layar peta tidak memiliki pemilih kelas manual (kelas ditentukan admin/guru)');
    assert.ok(screensJs.includes('chapter-map-banner'), 'Layar peta merender banner peta wilayah');
    assert.ok(screensJs.includes('btn-view-comic'), 'Layar peta memiliki tombol Lihat Cerita bab selesai');
    assert.ok(screensJs.includes('winding-path'), 'Layar peta memiliki jalur berkelok simpul 1-3');
    assert.ok(screensJs.includes('data-testid="campaign-node"'), 'Layar peta memiliki simpul kampanye teruji');

    // 2. Verifikasi Toko Rapi & Filter Ganda
    assert.ok(screensJs.includes('shop-cat-btn'), 'Toko memiliki tombol filter kategori');
    assert.ok(screensJs.includes('data-testid="shop-filter-rarity-all"'), 'Toko memiliki filter rarity Semua');
    assert.ok(screensJs.includes('data-testid="shop-filter-rarity-common"'), 'Toko memiliki filter rarity Common');
    assert.ok(screensJs.includes('data-testid="shop-filter-rarity-rare"'), 'Toko memiliki filter rarity Rare');
    assert.ok(screensJs.includes('data-testid="shop-filter-rarity-epic"'), 'Toko memiliki filter rarity Epic');
    assert.ok(screensJs.includes('data-testid="shop-filter-rarity-legendary"'), 'Toko memiliki filter rarity Legend');
    assert.ok(screensJs.includes('skin-thumbnail-box'), 'Toko menggunakan skin-thumbnail-box 68x68');
    assert.ok(screensJs.includes('data-testid="buy-mystery-box"'), 'Toko memiliki tombol Kotak Misteri Ajaib');
    assert.ok(screensJs.includes('item-shop-buy-btn'), 'Toko memiliki tombol beli item terkonfirmasi');
    assert.ok(!/(?<!\$)\$\('\.lazy-art'/.test(screensJs), 'screens.js tidak boleh menggunakan single $ untuk querySelectorAll .lazy-art');
    assert.ok(!/(?<!\$)\$\('\.item-card'/.test(screensJs), 'screens.js tidak boleh menggunakan single $ untuk querySelectorAll .item-card');
    assert.ok(!/(?<!\$)\$\('\.skin-owner-btn'/.test(screensJs), 'screens.js tidak boleh menggunakan single $ untuk querySelectorAll .skin-owner-btn');
    assert.ok(screensJs.includes("$$('.lazy-art', el).forEach"), 'screens.js harus menggunakan $$ untuk .lazy-art');

    // 3. Verifikasi Skill Deck & Loadout Mode Switcher
    assert.ok(screensJs.includes('btn-loadout-mode'), 'Layar skill memiliki sakelar mode petualangan vs duel');
    assert.ok(screensJs.includes('data-testid="loadout-slot-'), 'Layar skill memiliki 3-4 slot aktif loadout');
    assert.ok(screensJs.includes('data-testid="skill-card-'), 'Layar skill memiliki kartu skill terdaftar');
    assert.ok(screensJs.includes('data-testid="skill-avatar-'), 'Layar skill memiliki avatar interaktif tiap skill');
    assert.ok(screensJs.includes('data-testid="skill-level-'), 'Layar skill memiliki indikator pips level ◆◆◆◇◇');
    assert.ok(screensJs.includes('data-testid="skill-upgrade-btn-'), 'Layar skill memiliki tombol upgrade teruji');
    assert.ok(screensJs.includes('skill-upgrade-confirm'), 'Layar skill menyediakan dialog konfirmasi upgrade');
    assert.ok(screensJs.includes('modal-skill-detail'), 'Layar skill menyediakan modal detail progresi 5 level');

    // 4. Verifikasi Desain SVG 100% dan Kelas Animasi
    assert.ok(cssDesktop.includes('.skin-thumbnail-box'), 'desktop.css mendefinisikan wadah SVG skin-thumbnail-box');
    assert.ok(cssDesktop.includes('.fx-skill-glow'), 'desktop.css mendefinisikan animasi .fx-skill-glow');
    assert.ok(cssDesktop.includes('.winding-path'), 'desktop.css mendefinisikan layout .winding-path');
    assert.ok(screensJs.includes("animated: 'lite'"), 'screens.js menggunakan mode animasi lite untuk SVG skill');
  });

  await t.test('10. Verifikasi Perbaikan Login Desktop, CORS Server & Penghapusan Pilihan Kelas', () => {
    const screensJs = fs.readFileSync(screensJsPath, 'utf8');
    const serverJs = fs.readFileSync(path.join(rootDir, 'server.js'), 'utf8');
    const appJs = fs.readFileSync(path.join(rootDir, 'public/js/app.js'), 'utf8');

    // 1. Auth Desktop tidak menggunakan <form> yang memicu abort/failed-to-fetch
    assert.ok(!screensJs.includes('id="form-auth"'), 'Auth desktop tidak menggunakan form id="form-auth"');
    assert.ok(screensJs.includes('id="card-auth"'), 'Auth desktop menggunakan div id="card-auth"');
    assert.ok(screensJs.includes('id="auth-error"'), 'Auth desktop memiliki wadah error terintegrasi');
    assert.ok(screensJs.includes('btn-submit-auth'), 'Auth desktop memiliki tombol submit terdedikasi');

    // 2. Penghapusan pilihan kelas manual (ditentukan guru/admin)
    assert.ok(!screensJs.includes('id="auth-cls"'), 'Auth desktop tidak memiliki pemilih kelas (#auth-cls)');
    assert.ok(!screensJs.includes('id="class-tabs-container"'), 'Peta desktop tidak memiliki tab pemilih kelas (#class-tabs-container)');
    assert.ok(screensJs.includes('Kelas belajar ditentukan otomatis oleh guru/admin'), 'Auth desktop memuat info penentuan kelas oleh guru/admin');

    // 3. CORS Server mendukung kredensial & origin dinamis
    assert.ok(serverJs.includes('Access-Control-Allow-Credentials'), 'server.js mendukung Access-Control-Allow-Credentials');
    assert.ok(serverJs.includes('Access-Control-Allow-Origin') && serverJs.includes('reqOrigin'), 'server.js merefleksikan origin dinamis');

    // 4. API.req memiliki retry logic & user friendly network error
    assert.ok(appJs.includes('NETWORK_ERROR') || appJs.includes('Gagal terhubung ke server'), 'API.req menangani network error dengan ramah');
  });

  await t.test('11. Verifikasi Kerapian Menu Skin, Profile, Toko & Penghapusan Penawaran Dashboard', () => {
    const screensJs = fs.readFileSync(screensJsPath, 'utf8');
    const cssDesktop = fs.readFileSync(cssDesktopPath, 'utf8');

    // 1. Dashboard Desktop bersih tanpa Penawaran Harian Toko
    assert.ok(!screensJs.includes('Penawaran harian Toko'), 'Dashboard tidak menampilkan penawaran harian toko');
    assert.ok(!screensJs.includes('id="home-offers-box"'), 'Wadah home-offers-box telah dihapus dari dashboard');

    // 2. Layar Skin / Wardrobe rapi & lengkap
    assert.ok(screensJs.includes('skin-equipped-slots'), 'Layar skin menampilkan 6 slot perlengkapan terpasang');
    assert.ok(screensJs.includes('skin-owner-btn'), 'Layar skin memiliki filter status kepemilikan (Semua/Dimiliki/Belum)');
    assert.ok(screensJs.includes('calcPassives'), 'Layar skin menghitung atribut pasif & set bonus secara dinamis');
    assert.ok(screensJs.includes('skin-item-card'), 'Layar skin menggunakan kartu item rapi dengan thumbnail 56px/68px');

    // 3. Layar Profile petualang rapi & lengkap
    assert.ok(screensJs.includes('profile-stat-grid'), 'Layar profil memiliki 10 kotak statistik lengkap');
    assert.ok(screensJs.includes('showcase-grid'), 'Layar profil memiliki panggung kehormatan 3 slot showcase');
    assert.ok(screensJs.includes('title-pill'), 'Layar profil memiliki slot gelar juara');
    assert.ok(screensJs.includes('copyBattleId'), 'Layar profil mendukung penyalinan ID Battle');

    // 4. Layar Toko rapi, proporsional & memiliki tombol beli langsung di pratinjau
    assert.ok(screensJs.includes('btn-buy-preview'), 'Layar toko memiliki tombol Beli Sekarang pada panel pratinjau');
    assert.ok(screensJs.includes('triggerBuyItem'), 'Layar toko memiliki fungsi pembelian terpusat dengan modal konfirmasi');
    assert.ok(screensJs.includes('shop-card-desktop'), 'Layar toko menggunakan kartu etalase desktop yang lega');

    // 5. CSS Desktop memuat styling komponen profil, skin, dan toko
    assert.ok(cssDesktop.includes('.profile-stat-grid'), 'desktop.css memuat styling .profile-stat-grid');
    assert.ok(cssDesktop.includes('.showcase-grid'), 'desktop.css memuat styling .showcase-grid');
    assert.ok(cssDesktop.includes('.title-pill'), 'desktop.css memuat styling .title-pill');
    assert.ok(cssDesktop.includes('.skin-equipped-slots'), 'desktop.css memuat styling .skin-equipped-slots');
    assert.ok(cssDesktop.includes('.skin-item-card'), 'desktop.css memuat styling .skin-item-card');
  });

  await t.test('12. Verifikasi Penyelarasan Total Proposal: Sidebar 14rem, Beranda Presisi & Monster Dex 100% Mobile', () => {
    const screensJs = fs.readFileSync(screensJsPath, 'utf8');
    const coreJs = fs.readFileSync(coreJsPath, 'utf8');
    const cssDesktop = fs.readFileSync(cssDesktopPath, 'utf8');

    // 1. Sidebar Navigasi Desktop 14rem, Berkelompok & Footer Mini Profile
    assert.ok(cssDesktop.includes('--rail-w: 14rem'), 'Sidebar menggunakan lebar ergonomis 14rem');
    assert.ok(coreJs.includes('sidebar-brand'), 'Sidebar memiliki brand header PETUALANGAN PELAJAR RPG');
    assert.ok(coreJs.includes('rail-group-title'), 'Sidebar mengelompokkan menu (Main Arena, Hero & Koleksi, Sosial)');
    assert.ok(coreJs.includes('rail-mini-profile'), 'Sidebar memiliki kartu profil mini di footer');
    assert.ok(coreJs.includes('rail-actions'), 'Sidebar memiliki tombol akses cepat Guru & Keluar');

    // 2. Beranda Cockpit Presisi Tanpa Duplikasi Menu
    assert.ok(!screensJs.includes('home-menu-tiles-desktop'), 'Ubin menu mobile duplikat telah dihapus dari beranda');
    assert.ok(screensJs.includes('hero-quick-stats-card'), 'Beranda memiliki kartu ringkasan cepat (streak, koin, kemenangan)');
    assert.ok(screensJs.includes('titles-pills-row'), 'Beranda menampilkan slot gelar aktif petualang');
    assert.ok(screensJs.includes('mascotLines'), 'Maskot beranda interaktif dengan dialog dan respon klik');

    // 3. Monster Dex 3-Pane Cockpit 100% Identik Mobile
    assert.ok(screensJs.includes('/api/dex'), 'Monster Dex memuat data dari endpoint /api/dex');
    assert.ok(screensJs.includes('dex-status-pill-btn'), 'Monster Dex memiliki filter 4 status kepemilikan');
    assert.ok(screensJs.includes('dex-theme-item'), 'Monster Dex memiliki filter 10 habitat elemen');
    assert.ok(screensJs.includes('dex-search-in'), 'Monster Dex memiliki kotak pencarian nama/#ID bos');
    assert.ok(screensJs.includes('dex-panel-stats') && screensJs.includes('dex-panel-theme'), 'Sidebar kiri memiliki card statistik koleksi dan elemen habitat');
    assert.ok(screensJs.includes('dex-tier-pill-btn'), 'Filter tingkat rarity terintegrasi di dalam card elemen habitat');
    assert.ok(!screensJs.includes('id="dex-tier-sel"'), 'Filter rarity dropdown di katalog tengah telah dibersihkan');
    assert.ok(!screensJs.includes('id="dex-element-sel"'), 'Filter elemen dropdown di katalog tengah telah dibersihkan');
    assert.ok(screensJs.includes('dex-card-full') && screensJs.includes('dex-card-skills-row'), 'Monster Dex menampilkan kartu bos dengan deskripsi dan skill');
    assert.ok(screensJs.includes('dex-desktop-brutal'), 'Monster Dex memiliki sakelar Pratinjau Mode Brutal');
    assert.ok(screensJs.includes('skillsFor'), 'Monster Dex memuat jurus bos resmi dari BossSkills');
    assert.ok(screensJs.includes('boss-skill-card-desktop'), 'Monster Dex menampilkan kartu jurus bos dengan deskripsi taktis');
    assert.ok(screensJs.includes('btn-challenge-dex-boss'), 'Monster Dex memiliki tombol tantang bos di arena');

    // 4. Laporan Belajar Mendukung Berbagi Tautan Rapor Portal
    assert.ok(screensJs.includes('btn-desktop-share-report'), 'Layar laporan memiliki tombol bagikan tautan rapor');
    assert.ok(screensJs.includes('/api/report/share'), 'Layar laporan memanggil API pembuatan tautan share');
  });

  await t.test('13. Verifikasi Perbaikan 6 Poin Mode Desktop (Dex Rapi, Scroll Pelajaran, Skill Cepat & Filter, Topbar Besar, Battle Skill Interaktif, Skin/Shop Filter & Card Informatif)', () => {
    const screensJs = fs.readFileSync(screensJsPath, 'utf8');
    const cssDesktop = fs.readFileSync(cssDesktopPath, 'utf8');
    const coreJs = fs.readFileSync(coreJsPath, 'utf8');

    // 1. Monster Dex Rapi & Terpadu
    assert.ok(cssDesktop.includes('minmax(7.2rem, 1fr)'), 'Kisi kartu monster dex lebih rapat dan proporsional');
    assert.ok(screensJs.includes('Filter Status Koleksi'), 'Panel kiri menyatukan progress dan status koleksi');
    assert.ok(screensJs.includes('btn-challenge-dex-boss'), 'Tombol tantang bos arena sticky dan terpadu');

    // 2. Scroll Pelajaran Peta & Latihan
    assert.ok(cssDesktop.includes('.sub-list') && cssDesktop.includes('overflow-y: auto'), 'Daftar pelajaran peta memiliki scroll vertikal lancar');

    // 3. Menu Skill Cepat (Tanpa SMIL Berat) & Filter Status
    assert.ok(screensJs.includes('btn-skill-status-filter'), 'Menu skill memiliki filter status (Semua / Dipasang / Siaga)');
    assert.ok(screensJs.includes('skill-search-in'), 'Menu skill memiliki kotak pencarian skill');
    assert.ok(cssDesktop.includes('content-visibility: auto'), 'Kartu skill dioptimalkan rendering-nya dengan content-visibility');

    // 4. Nav Bar Topbar Kanan Nyaman & Lebih Besar
    assert.ok(cssDesktop.includes('--top-h: 4.2rem') || cssDesktop.includes('--top-h: 4.'), 'Tinggi topbar desktop dinaikkan untuk kenyamanan monitor');
    assert.ok(coreJs.includes('size: 64') || coreJs.includes('size: 52'), 'Ukuran avatar dan logo topbar desktop diperbesar');

    // 5. UI Battle Presisi & Tombol Skill Interaktif
    assert.ok(screensJs.includes('triggerSkill'), 'UI battle memiliki fungsi eksekusi skill deck interaktif');
    assert.ok(screensJs.includes('eliminatedOptions'), 'Skill Coret mendisable dan mencoret opsi jawaban salah');
    assert.ok(screensJs.includes('shieldActive'), 'Skill Perisai memicu feedback visual pelindung');
    assert.ok(screensJs.includes('cost-badge'), 'Tombol skill menampilkan indikator biaya energi');
    assert.ok(screensJs.includes('q: () => triggerSkill(0)'), 'Hotkey Q/W/E terdaftar di keyboard shortcut battle');

    // 6. Skin & Toko: Filter Lengkap & Card Informatif
    assert.ok(screensJs.includes('skin-search-in'), 'Menu skin/wardrobe memiliki input pencarian');
    assert.ok(screensJs.includes('shop-search-in'), 'Menu toko memiliki input pencarian');
    assert.ok(screensJs.includes('shop-owner-filter-btn'), 'Menu toko memiliki filter kepemilikan (Semua / Tersedia / Dimiliki)');
  });

  await t.test('14. Verifikasi Paritas Penuh Boss Engine & Tipe-Tipe Kejutan (Surprise Events & Mystery Rewards)', () => {
    const screensJs = fs.readFileSync(screensJsPath, 'utf8');
    // 1. Boss Engine Parity
    assert.ok(screensJs.includes('boss-skill-chips'), 'Tersedia chips skill bos interaktif');
    assert.ok(screensJs.includes('showBossSkillDetail'), 'Tersedia modal inspeksi detail jurus bos');
    assert.ok(screensJs.includes('showEnragedBanner'), 'Tersedia banner animasi Fase 2 Marah untuk Bos');
    assert.ok(screensJs.includes('boss-enraged'), 'Efek visual aura api Fase 2 terpasang pada bos');
    assert.ok(screensJs.includes('animateBossShake'), 'Tersedia efek guncangan saat bos terkena serangan');
    assert.ok(screensJs.includes('animateSwordSlash'), 'Tersedia efek tebasan pedang saat player menyerang bos');
    assert.ok(screensJs.includes('boss-hits-left'), 'Indikator sisa pukulan/jawaban benar untuk mengalahkan bos');

    // 2. Surprise Events (Tipe Kejutan)
    assert.ok(screensJs.includes('showEventModal'), 'Tersedia modal penanganan event kejutan di arena');
    assert.ok(screensJs.includes('event-timer-bar'), 'Tersedia countdown timer visual 8 detik untuk event');
    assert.ok(screensJs.includes('TREASURE'), 'Mendukung event kejutan tipe TREASURE (Peti Harta)');
    assert.ok(screensJs.includes('MERCHANT'), 'Mendukung event kejutan tipe MERCHANT (Pedagang Keliling)');
    assert.ok(screensJs.includes('TRAP'), 'Mendukung event kejutan tipe TRAP (Peti Jebakan)');
    assert.ok(screensJs.includes('API.resolveEvent'), 'Mengintegrasikan API.resolveEvent untuk konfirmasi pilihan event');

    // 3. Mystery Question Rewards
    assert.ok(screensJs.includes('mysteryReward') || screensJs.includes('isMystery'), 'Mendukung deteksi soal misteri & hadiah acak');
    assert.ok(screensJs.includes('COINS_8'), 'Mendukung hadiah misteri koin');
    assert.ok(screensJs.includes('DAMAGE_1_5'), 'Mendukung hadiah misteri buff damage');
  });

  await t.test('15. Verifikasi Slideshow Bos Ditaklukkan pada Beranda Desktop Mode (Nama, Rarity & Transisi Smooth)', () => {
    const screensJs = fs.readFileSync(screensJsPath, 'utf8');
    const cssDesktop = fs.readFileSync(cssDesktopPath, 'utf8');

    // 1. Struktur DOM Slideshow Beranda
    assert.ok(screensJs.includes('boss-slideshow-box'), 'Beranda memiliki kontainer slideshow bos ditaklukkan');
    assert.ok(screensJs.includes('boss-slide-viewport'), 'Tersedia viewport slideshow bos');
    assert.ok(screensJs.includes('id="btn-boss-prev"'), 'Tersedia tombol navigasi bos sebelumnya');
    assert.ok(screensJs.includes('id="btn-boss-next"'), 'Tersedia tombol navigasi bos berikutnya');
    assert.ok(screensJs.includes('id="boss-slide-svg"'), 'Tersedia kontainer SVG bos 3D');
    assert.ok(screensJs.includes('id="boss-slide-name"'), 'Tersedia elemen penampil nama bos');
    assert.ok(screensJs.includes('id="boss-slide-rarity"'), 'Tersedia elemen penampil rarity/tier bos');
    assert.ok(screensJs.includes('id="boss-slide-dots"'), 'Tersedia kontainer titik indikator slide');

    // 2. Transisi Smooth & Ringan (GPU-Accelerated)
    assert.ok(screensJs.includes('renderSlide'), 'Tersedia fungsi renderSlide dengan transisi animasi');
    assert.ok(screensJs.includes('isTransitioning'), 'Tersedia guard proteksi transisi ganda');
    assert.ok(screensJs.includes('translateX') && screensJs.includes('scale'), 'Animasi menggunakan transform GPU translateX dan scale');
    assert.ok(cssDesktop.includes('.boss-slideshow-box') && cssDesktop.includes('.boss-slide-nav'), 'CSS desktop menyediakan styling lengkap untuk slideshow dan tombol nav');

    // 3. Dukungan Rarity Tiers Lengkap
    assert.ok(screensJs.includes('RARITY_META'), 'Mendefinisikan metadata rarity');
    assert.ok(screensJs.includes('⚪ COMMON') && screensJs.includes('🔵 RARE'), 'Mendukung badge COMMON dan RARE');
    assert.ok(screensJs.includes('🟣 EPIC') && screensJs.includes('🟡 LEGEND'), 'Mendukung badge EPIC dan LEGEND');

    // 4. Sinkronisasi Data Dex & Timer Cleanup
    assert.ok(screensJs.includes('loadDexBosses'), 'Beranda menyinkronkan daftar bos ditaklukkan dari /api/dex');
    assert.ok(screensJs.includes('DesktopScreens.home._timer'), 'Timer auto-slide memiliki pembersihan aman (cleanup on unmount)');
    assert.ok(screensJs.includes('slideBox.onmouseenter') && screensJs.includes('slideBox.onmouseleave'), 'Slideshow pause saat hover dan resume saat mouse leave');
  });
});
