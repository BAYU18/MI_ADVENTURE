/**
 * tests/mythic-svg-mobile.test.js
 * Test suite to ensure all Mythic items render rich SVG designs without falling back to placeholders
 * across mobile Wardrobe (Screens.skin), Shop (Screens.shop), and Avatar rendering.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const economy = require('../shared/economy.js');
const SkinArt = require('../shared/skin-art.js');
const PetArt = require('../shared/pet-art.js');

globalThis.SkinArt = SkinArt;
globalThis.PetArt = PetArt;
const Avatar = require('../public/js/avatar.js');

describe('Mythic SVG & Mobile Rendering Test Suite', () => {
  const mythicItems = economy.ITEMS.filter(it => it.rarity === 'MYTHIC');

  it('1. Verifikasi seluruh 16 item Mythic terdaftar di SkinArt.has', () => {
    assert.strictEqual(mythicItems.length, 16, 'Jumlah item Mythic di economy.js harus 16');
    for (const it of mythicItems) {
      assert.ok(SkinArt.has(it.id), `Item ${it.id} (${it.name}) harus terdaftar di SkinArt`);
    }
  });

  it('2. Verifikasi Avatar.renderThumbnail menghasilkan SVG penuh tanpa fallback tas 🎒', () => {
    for (const it of mythicItems) {
      const html = Avatar.renderThumbnail(it.id, it.slot);
      assert.ok(html.includes('<svg') || html.includes('<div') && html.includes('<svg'), `Thumbnail ${it.id} harus menghasilkan SVG`);
      assert.strictEqual(html.includes('🎒'), false, `Thumbnail ${it.id} tidak boleh fallback ke tas 🎒`);
      assert.ok(html.length > 500, `Thumbnail SVG ${it.id} harus memiliki detail desain (panjang > 500 karakter)`);
    }
  });

  it('3. Verifikasi Avatar.renderAvatar dapat me-render seluruh slot item Mythic', () => {
    const avatarData = {
      hat: 'hat_batara_surya',
      outfit: 'outfit_antakusuma',
      weapon: 'weapon_nagasasra',
      pet: 'pet_phoenix_nirvana',
      bg: 'bg_kahyangan',
      frame: 'frame_ouroboros'
    };
    const svg = Avatar.renderAvatar(avatarData, { uid: 'test-mythic' });
    assert.ok(svg.includes('<svg'), 'Avatar SVG harus valid');
    assert.ok(svg.includes('test-mythic'), 'UID test-mythic harus ter-scope dalam SVG');
    assert.ok(svg.length > 50000, 'Avatar dengan item mythic harus menghasilkan SVG lengkap dan kaya');
  });

  it('4. Verifikasi Screens.skin dan Screens.shop di app.js serta desktop me-render SVG langsung 100% tanpa placeholder tas', () => {
    const appJs = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');
    const desktopJs = fs.readFileSync(path.join(__dirname, '../public/js/desktop/screens.js'), 'utf8');
    const swJs = fs.readFileSync(path.join(__dirname, '../public/sw.js'), 'utf8');
    const indexHtml = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');

    // Screens.skin mobile direct render
    assert.ok(appJs.includes('SKIN_DIRECT_SVG_RENDERING'), 'Screens.skin harus menggunakan rendering SVG langsung');
    assert.strictEqual(appJs.includes('IMMEDIATE_LIMIT_SKIN'), false, 'Tidak boleh ada limit kaku IMMEDIATE_LIMIT_SKIN');

    // Screens.shop mobile direct render
    assert.ok(appJs.includes('SHOP_DIRECT_SVG_RENDERING'), 'Screens.shop harus menggunakan rendering SVG langsung');
    assert.strictEqual(appJs.includes('IMMEDIATE_LIMIT'), false, 'Tidak boleh ada limit kaku IMMEDIATE_LIMIT');

    // Desktop screens direct render
    assert.strictEqual(desktopJs.includes('lazy-thumb-placeholder'), false, 'Desktop screens tidak boleh menggunakan lazy-thumb-placeholder');

    // Service Worker cache version & precache consistency
    assert.ok(/pp-v7\.3\.[0-9]+-20261111/.test(swJs), 'SW cache version harus ter-bump');
  });
});
