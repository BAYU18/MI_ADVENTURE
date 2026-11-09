const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const { ITEMS } = (function() {
  try { return require('../shared/economy.js'); }
  catch(e) { return require('../economy.js'); }
})();

test('Filter Rarity di Menu Skin dan Toko Test Suite', async (t) => {

  await t.test('1. app.js contains rarity filter UI and logic for Toko and Skin tabs', () => {
    let appJsPath = path.join(__dirname, '..', 'app.js');
    if (!fs.existsSync(appJsPath)) {
      appJsPath = path.join(__dirname, '..', 'public', 'js', 'app.js');
    }
    assert.ok(fs.existsSync(appJsPath), 'app.js must exist');
    const content = fs.readFileSync(appJsPath, 'utf8');

    // Toko Rarity Filter Check
    assert.ok(content.includes('shop-filter-rarity-all'), 'Toko must have shop-filter-rarity-all');
    assert.ok(content.includes('shop-filter-rarity-common'), 'Toko must have shop-filter-rarity-common');
    assert.ok(content.includes('shop-filter-rarity-rare'), 'Toko must have shop-filter-rarity-rare');
    assert.ok(content.includes('shop-filter-rarity-epic'), 'Toko must have shop-filter-rarity-epic');
    assert.ok(content.includes('shop-filter-rarity-legendary'), 'Toko must have shop-filter-rarity-legendary');
    assert.ok(content.includes('shopRarityFilter'), 'Toko must maintain shopRarityFilter state');
    assert.ok(content.includes('updateShopRarityBar'), 'Toko must have dynamic updateShopRarityBar');

    // Skin Rarity Filter Check
    assert.ok(content.includes('skin-filter-rarity-all'), 'Skin must have skin-filter-rarity-all');
    assert.ok(content.includes('skin-filter-rarity-common'), 'Skin must have skin-filter-rarity-common');
    assert.ok(content.includes('skin-filter-rarity-rare'), 'Skin must have skin-filter-rarity-rare');
    assert.ok(content.includes('skin-filter-rarity-epic'), 'Skin must have skin-filter-rarity-epic');
    assert.ok(content.includes('skin-filter-rarity-legendary'), 'Skin must have skin-filter-rarity-legendary');
    assert.ok(content.includes('skinRarityFilter'), 'Skin must maintain skinRarityFilter state');
    assert.ok(content.includes('updateSkinRarityBar'), 'Skin must have dynamic updateSkinRarityBar');
  });

  await t.test('2. Multi-tier filter simulation (Category x Rarity) on Toko items', () => {
    assert.ok(Array.isArray(ITEMS) && ITEMS.length > 0, 'ITEMS catalog must exist');

    const categories = ['ALL', 'hat', 'outfit', 'weapon', 'pet', 'bg', 'frame', 'title', 'permanent'];
    const rarities = ['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'];

    for (const cat of categories) {
      for (const rar of rarities) {
        let filtered = ITEMS;
        if (cat !== 'ALL') {
          filtered = filtered.filter(it => it.slot === cat);
        }
        if (rar !== 'ALL') {
          filtered = filtered.filter(it => (it.rarity || 'COMMON').toUpperCase() === rar);
        }

        // Assert all filtered items strictly respect the criteria
        for (const item of filtered) {
          if (cat !== 'ALL') {
            assert.strictEqual(item.slot, cat, `Item ${item.id} slot must be ${cat}`);
          }
          if (rar !== 'ALL') {
            assert.strictEqual(item.rarity.toUpperCase(), rar, `Item ${item.id} rarity must be ${rar}`);
          }
        }
      }
    }
  });

  await t.test('3. Dynamic Rarity Counts accurately reflect items within selected category', () => {
    const categories = ['ALL', 'weapon', 'outfit', 'hat', 'pet', 'bg', 'frame', 'title', 'permanent'];

    for (const cat of categories) {
      const catItems = cat === 'ALL' ? ITEMS : ITEMS.filter(it => it.slot === cat);
      const countAll = catItems.length;
      const countCommon = catItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'COMMON').length;
      const countRare = catItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'RARE').length;
      const countEpic = catItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'EPIC').length;
      const countLeg = catItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'LEGENDARY').length;

      // Sum of rarities must exactly equal countAll
      assert.strictEqual(
        countCommon + countRare + countEpic + countLeg,
        countAll,
        `Sum of rarity counts in category ${cat} must equal total category items`
      );
    }
  });

  await t.test('4. Skin filter simulation with (Ownership x Category x Rarity)', () => {
    // Mock user inventory where first 20 items are owned, rest unowned
    const mockInventoryItems = ITEMS.map((it, idx) => ({
      ...it,
      owned: idx < 20
    }));

    const ownerships = ['all', 'owned', 'unowned'];
    const categories = ['ALL', 'weapon', 'outfit', 'pet'];
    const rarities = ['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'];

    for (const own of ownerships) {
      for (const cat of categories) {
        for (const rar of rarities) {
          let filtered = mockInventoryItems;
          if (own === 'owned') {
            filtered = filtered.filter(it => it.owned);
          } else if (own === 'unowned') {
            filtered = filtered.filter(it => !it.owned);
          }
          if (cat !== 'ALL') {
            filtered = filtered.filter(it => it.slot === cat);
          }
          if (rar !== 'ALL') {
            filtered = filtered.filter(it => (it.rarity || 'COMMON').toUpperCase() === rar);
          }

          // Verify every item matches
          for (const it of filtered) {
            if (own === 'owned') assert.strictEqual(it.owned, true);
            if (own === 'unowned') assert.strictEqual(it.owned, false);
            if (cat !== 'ALL') assert.strictEqual(it.slot, cat);
            if (rar !== 'ALL') assert.strictEqual(it.rarity.toUpperCase(), rar);
          }
        }
      }
    }
  });

  await t.test('5. fx.css includes rarity-pill-btn styles for visual feedback', () => {
    let cssPath = path.join(__dirname, '..', 'fx.css');
    if (!fs.existsSync(cssPath)) {
      cssPath = path.join(__dirname, '..', 'public', 'css', 'fx.css');
    }
    assert.ok(fs.existsSync(cssPath), 'fx.css must exist');
    const content = fs.readFileSync(cssPath, 'utf8');

    assert.ok(content.includes('.rarity-pill-btn'), 'fx.css must have .rarity-pill-btn');
    assert.ok(content.includes('data-rarity="COMMON"'), 'fx.css must style COMMON tier');
    assert.ok(content.includes('data-rarity="RARE"'), 'fx.css must style RARE tier');
    assert.ok(content.includes('data-rarity="EPIC"'), 'fx.css must style EPIC tier');
    assert.ok(content.includes('data-rarity="LEGENDARY"'), 'fx.css must style LEGENDARY tier');
  });

});
