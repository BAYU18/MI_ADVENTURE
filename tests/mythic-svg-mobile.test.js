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

  it('4. Verifikasi Screens.skin dan Screens.shop di app.js memiliki immediate rendering & hydrator fail-safe', () => {
    const appJs = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');

    // Screens.skin
    assert.ok(appJs.includes('const isImmediateItem = (idx) => filtered.length <= 48 || (this.skinRarityFilter && this.skinRarityFilter !== \'ALL\')'), 'Screens.skin harus merender langsung saat filter aktif atau item <= 48');
    assert.ok(appJs.includes('hydrateSkinThumbs'), 'Screens.skin harus memiliki fungsi hydrateSkinThumbs');
    assert.ok(appJs.includes('setTimeout(hydrateSkinThumbs, 40)'), 'Screens.skin harus memiliki fail-safe hydration timer');

    // Screens.shop
    assert.ok(appJs.includes('const isImmediateItem = (idx) => filtered.length <= 48 || (this.shopRarityFilter && this.shopRarityFilter !== \'ALL\')'), 'Screens.shop harus merender langsung saat filter aktif atau item <= 48');
    assert.ok(appJs.includes('hydrateShopThumbs'), 'Screens.shop harus memiliki fungsi hydrateShopThumbs');
    assert.ok(appJs.includes('setTimeout(hydrateShopThumbs, 40)'), 'Screens.shop harus memiliki fail-safe hydration timer');
  });
});
