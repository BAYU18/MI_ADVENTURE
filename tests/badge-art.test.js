const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const BadgeArt = require('../public/js/badge-art');
const Badges = require('../shared/badges');

test('T-60: Generator Lencana Prestasi SVG (badge-art.js) & Integrasi Visual UI', async (t) => {

  await t.test('1. Validasi 20 Kategori x 4 Tier Sesuai Shared Badges', () => {
    assert.equal(BadgeArt.CATEGORIES.length, 20, 'Harus ada 20 kategori emblem');
    assert.deepEqual(BadgeArt.TIERS, ['common', 'rare', 'epic', 'legend'], 'Harus ada 4 tier');
    
    // Setiap kategori di shared/badges.js harus memiliki emblem di BadgeArt
    for (const f of Badges.BADGE_FAMILIES) {
      assert.ok(BadgeArt.CATEGORIES.includes(f.id), `Kategori ${f.id} harus ada di BadgeArt`);
      assert.ok(BadgeArt.EMBLEMS[f.id], `Emblem untuk ${f.id} harus ada`);
      assert.equal(typeof BadgeArt.EMBLEMS[f.id].draw, 'function', `Draw function untuk ${f.id} harus berupa function`);
    }
  });

  await t.test('2. Generate SVG untuk Seluruh 80 Lencana (Unlocked & Locked)', () => {
    let generatedCount = 0;
    for (const cat of BadgeArt.CATEGORIES) {
      for (const tier of BadgeArt.TIERS) {
        const badgeId = `${cat}_${tier}`;
        
        // Test Unlocked SVG
        const svgUnlocked = BadgeArt.badgeSVG(badgeId, { size: 64, locked: false, title: `${cat} ${tier}` });
        assert.ok(svgUnlocked.startsWith('<svg'), `SVG harus diawali <svg pada ${badgeId}`);
        assert.ok(svgUnlocked.endsWith('</svg>'), `SVG harus diakhiri </svg> pada ${badgeId}`);
        assert.ok(svgUnlocked.includes('xmlns="http://www.w3.org/2000/svg"'), `SVG harus memiliki namespace XML`);
        assert.ok(svgUnlocked.includes(`ba-${tier}`), `SVG harus memiliki kelas ba-${tier}`);
        assert.ok(!svgUnlocked.includes('ba-locked'), `SVG unlocked tidak boleh memiliki kelas ba-locked`);

        // Test Locked SVG
        const svgLocked = BadgeArt.badgeSVG(badgeId, { size: 48, locked: true });
        assert.ok(svgLocked.startsWith('<svg'), `Locked SVG harus diawali <svg pada ${badgeId}`);
        assert.ok(svgLocked.includes('ba-locked'), `Locked SVG harus memiliki kelas ba-locked`);

        generatedCount++;
      }
    }
    assert.equal(generatedCount, 80, 'Harus berhasil mengenerate seluruh 80 kombinasi lencana');
  });

  await t.test('3. Fungsi parseBadgeId: Dukungan Case-Insensitive & Fallback Kategori', () => {
    const p1 = BadgeArt.parseBadgeId('boss_slayer_common');
    assert.equal(p1.cat, 'boss_slayer');
    assert.equal(p1.tier, 'common');
    assert.equal(p1.t, 0);

    const p2 = BadgeArt.parseBadgeId('BOSS_SLAYER_LEGEND');
    assert.equal(p2.cat, 'boss_slayer');
    assert.equal(p2.tier, 'legend');
    assert.equal(p2.t, 3);

    const p3 = BadgeArt.parseBadgeId('star_collector', 'EPIC');
    assert.equal(p3.cat, 'star_collector');
    assert.equal(p3.tier, 'epic');
    assert.equal(p3.t, 2);

    assert.throws(() => BadgeArt.parseBadgeId('invalid_xyz_common'), /Kategori lencana tidak dikenal/);
    assert.throws(() => BadgeArt.parseBadgeId(''), /ID lencana tidak valid/);
  });

  await t.test('4. Fungsi renderBadge Helper: Fleksibilitas Parameter & Safe Fallback', () => {
    // Parameter tunggal ID
    const svg1 = BadgeArt.renderBadge('combo_virtuoso_rare', { size: 54 });
    assert.ok(svg1.includes('width="54"'));
    assert.ok(svg1.includes('ba-rare'));

    // Parameter (family, tier, options)
    const svg2 = BadgeArt.renderBadge('flawless_victory', 'EPIC', { size: 60 });
    assert.ok(svg2.includes('width="60"'));
    assert.ok(svg2.includes('ba-epic'));

    // Safe fallback jika ID tidak dikenal
    const fallback = BadgeArt.renderBadge('unknown_category_xxx', { size: 40, icon: '🛡️' });
    assert.ok(fallback.includes('ba-fallback'));
    assert.ok(fallback.includes('🛡️'));
  });

  await t.test('5. Verifikasi CSS Animasi & Aset HTML Terpasang', () => {
    const cssPath = path.join(__dirname, '../public/css/style.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    assert.ok(css.includes('.ba-badge'), 'style.css harus memiliki .ba-badge');
    assert.ok(css.includes('.ba-locked'), 'style.css harus memiliki .ba-locked');
    assert.ok(css.includes('@keyframes ba-pulse'), 'style.css harus memiliki animasi ba-pulse');
    assert.ok(css.includes('@keyframes ba-spin'), 'style.css harus memiliki animasi ba-spin');
    assert.ok(css.includes('@keyframes ba-tw'), 'style.css harus memiliki animasi ba-tw');
    assert.ok(css.includes('@keyframes ba-sheen'), 'style.css harus memiliki animasi ba-sheen');

    const htmlPath = path.join(__dirname, '../public/index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    assert.ok(html.includes('/js/badge-art.js'), 'index.html harus memuat /js/badge-art.js');

    const swPath = path.join(__dirname, '../public/sw.js');
    const sw = fs.readFileSync(swPath, 'utf8');
    assert.ok(sw.includes('/js/badge-art.js'), 'sw.js harus mencakup /js/badge-art.js di precache');
  });
});
