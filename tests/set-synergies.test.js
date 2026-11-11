'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { SET_BONUSES, ITEMS, getEquippedSetsSynergy, renderSetSynergyHtml } = require('../shared/economy');
const passivesModule = require('../shared/passives');

test('Set Synergies & Missing Equipment Indicator Suite', async (t) => {

  await t.test('1. getEquippedSetsSynergy returns accurate active and partial sets', () => {
    assert.equal(typeof getEquippedSetsSynergy, 'function');
    assert.equal(typeof passivesModule.getEquippedSetsSynergy, 'function');

    // Case 1: Empty equipped array -> empty results
    const emptyRes = getEquippedSetsSynergy([], ITEMS);
    assert.deepEqual(emptyRes, []);

    // Case 2: 1 Batara Mythic item equipped (Mahkota Batara Surya)
    const mockCatalog = ITEMS.map(it => ({
      ...it,
      owned: ['hat_batara_surya', 'outfit_antakusuma'].includes(it.id)
    }));

    const res1 = getEquippedSetsSynergy(['hat_batara_surya'], mockCatalog);
    assert.ok(res1.length >= 1, 'Must detect at least 1 set');
    const bataraSet = res1.find(s => s.id === 'set_pantheon_batara');
    assert.ok(bataraSet, 'Batara set must be identified');
    assert.equal(bataraSet.isActive, false);
    assert.equal(bataraSet.isPartial, true);
    assert.equal(bataraSet.totalItems, 4);
    assert.equal(bataraSet.equippedCount, 1);
    assert.equal(bataraSet.missingCount, 3);
    assert.equal(bataraSet.equipped[0].id, 'hat_batara_surya');
    assert.equal(bataraSet.equipped[0].slotLabel, 'Topi');

    // Missing members: outfit_antakusuma should be marked owned=true, others owned=false
    const missingAntakusuma = bataraSet.missing.find(m => m.id === 'outfit_antakusuma');
    assert.ok(missingAntakusuma);
    assert.equal(missingAntakusuma.owned, true, 'Antakusuma must be flagged as owned in inventory');
    assert.equal(missingAntakusuma.slotLabel, 'Baju');

    const missingNagasasra = bataraSet.missing.find(m => m.id === 'weapon_nagasasra');
    assert.ok(missingNagasasra);
    assert.equal(missingNagasasra.owned, false, 'Nagasasra must be flagged as unowned');
    assert.equal(missingNagasasra.slotLabel, 'Senjata');

    // Case 3: Complete Batara set (4/4)
    const fullBataraIds = ['hat_batara_surya', 'outfit_antakusuma', 'weapon_nagasasra', 'bg_kahyangan'];
    const resFull = getEquippedSetsSynergy(fullBataraIds, mockCatalog);
    const fullSet = resFull.find(s => s.id === 'set_pantheon_batara');
    assert.ok(fullSet);
    assert.equal(fullSet.isActive, true);
    assert.equal(fullSet.isPartial, false);
    assert.equal(fullSet.equippedCount, 4);
    assert.equal(fullSet.missingCount, 0);
    assert.equal(fullSet.missing.length, 0);
    assert.ok(fullSet.desc.includes('Kedaulatan Batara'));
  });

  await t.test('2. renderSetSynergyHtml produces structured HTML with effects and missing indicator', () => {
    assert.equal(typeof renderSetSynergyHtml, 'function');

    // Test with partial set
    const mockCatalog = ITEMS.map(it => ({
      ...it,
      owned: ['hat_batara_surya', 'outfit_antakusuma'].includes(it.id)
    }));
    const partialSets = getEquippedSetsSynergy(['hat_batara_surya'], mockCatalog);
    const htmlPartial = renderSetSynergyHtml(partialSets);

    assert.ok(htmlPartial.includes('set-card-partial'), 'Must render set-card-partial');
    assert.ok(htmlPartial.includes('Set Pantheon Batara Nusantara'), 'Must show set name');
    assert.ok(htmlPartial.includes('Kurang 3'), 'Must show missing items count');
    assert.ok(htmlPartial.includes('Efek Jika Lengkap:'), 'Must show effect description if complete');
    assert.ok(htmlPartial.includes('Kedaulatan Batara:'), 'Must include exact bonus effect text');
    assert.ok(htmlPartial.includes('Sudah Dipakai:'), 'Must show equipped items list');
    assert.ok(htmlPartial.includes('Perlu Dipakai (Kurang):'), 'Must show missing items list');
    assert.ok(htmlPartial.includes('[📦 Ada di Lemari - Klik!]'), 'Must flag owned missing item as clickable wardrobe item');
    assert.ok(htmlPartial.includes('[🔒 Belum Ada]'), 'Must flag unowned missing item');

    // Test with active set
    const fullBataraIds = ['hat_batara_surya', 'outfit_antakusuma', 'weapon_nagasasra', 'bg_kahyangan'];
    const activeSets = getEquippedSetsSynergy(fullBataraIds, mockCatalog);
    const htmlActive = renderSetSynergyHtml(activeSets);

    assert.ok(htmlActive.includes('set-card-active'), 'Must render set-card-active');
    assert.ok(htmlActive.includes('AKTIF (4/4)'), 'Must show active badge');
    assert.ok(htmlActive.includes('Efek Set Aktif:'), 'Must show active effect label');
    assert.ok(htmlActive.includes('Lengkap Terpasang:'), 'Must show all equipped pieces');

    // Test with empty array
    const emptyHtml = renderSetSynergyHtml([]);
    assert.ok(emptyHtml.includes('set-synergy-empty'));
    assert.ok(emptyHtml.includes('Belum ada item set terpasang'));
  });

  await t.test('3. Desktop Screens & Mobile App integrate set synergy indicators', () => {
    const screensJs = fs.readFileSync(path.join(__dirname, '../public/js/desktop/screens.js'), 'utf8');
    const appJs = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf8');

    // Desktop
    assert.ok(screensJs.includes('getEquippedSetsSynergy'), 'desktop screens.js must call getEquippedSetsSynergy');
    assert.ok(screensJs.includes('renderSetSynergyHtml') || screensJs.includes('renderSetsHtmlFn'), 'desktop screens.js must render set synergy html');
    assert.ok(screensJs.includes('Sinergi Set Equipment:'), 'desktop screens.js must show Sinergi Set Equipment header');
    assert.ok(screensJs.includes('missing-set-pill.owned-missing'), 'desktop screens.js must bind click handler to jump to category slot');

    // Mobile
    assert.ok(appJs.includes('calcEquippedSets'), 'mobile app.js must calculate equipped sets');
    assert.ok(appJs.includes('skin-sets-detail'), 'mobile app.js must render skin-sets-detail container');
    assert.ok(appJs.includes('buildSetsDetailHtml'), 'mobile app.js must build sets detail html');
    assert.ok(appJs.includes('bindMissingSetPills'), 'mobile app.js must bind missing set pills');
  });

});
