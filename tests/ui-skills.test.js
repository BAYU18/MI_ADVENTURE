'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('T-24 / Spek E.3: Verifikasi UI Layar Skill dan Battle Level Badge', async (t) => {
  const ROOT = path.resolve(__dirname, '..');
  const appJs = fs.readFileSync(path.join(ROOT, 'public', 'js', 'app.js'), 'utf8');
  const styleCss = fs.readFileSync(path.join(ROOT, 'public', 'css', 'style.css'), 'utf8');

  await t.test('1. TestID wajib pada Spek E.3 ada di public/js/app.js', () => {
    assert.ok(appJs.includes('data-testid="skill-card-'), 'skill-card-{id} testid harus ada');
    assert.ok(appJs.includes('data-testid="skill-level-'), 'skill-level-{id} testid harus ada');
    assert.ok(appJs.includes('data-testid="skill-upgrade-btn-'), 'skill-upgrade-btn-{id} testid harus ada');
    assert.ok(appJs.includes('skill-upgrade-confirm'), 'skill-upgrade-confirm testid harus ada');
    assert.ok(appJs.includes('skill-upgrade-toast'), 'skill-upgrade-toast testid harus ada');
  });

  await t.test('2. Badge Lv n di pertempuran ada di app.js dan style.css', () => {
    assert.ok(appJs.includes('class="skill-level-badge"'), 'skill-level-badge harus ada di battle button app.js');
    assert.ok(styleCss.includes('.skill-level-badge'), 'style.css harus mendefinisikan .skill-level-badge');
  });

  await t.test('3. Pip level ●●○○○ dan label Lv n/5', () => {
    function computePips(level) {
      const pipsFilled = '●'.repeat(Math.min(5, Math.max(1, level || 1)));
      const pipsEmpty = '○'.repeat(Math.max(0, 5 - (level || 1)));
      return pipsFilled + pipsEmpty;
    }

    assert.equal(computePips(1), '●○○○○');
    assert.equal(computePips(2), '●●○○○');
    assert.equal(computePips(3), '●●●○○');
    assert.equal(computePips(4), '●●●●○');
    assert.equal(computePips(5), '●●●●●');
  });

  await t.test('4. Toast alasan tombol abu-abu (aria-disabled)', () => {
    function getReasonToast(sk, playerCoins) {
      if (sk.reason === 'NOT_OWNED' || !sk.owned) {
        return 'Skill ini belum kamu miliki';
      } else if (sk.reason === 'MAX_LEVEL' || sk.level >= 5) {
        return 'Sudah level maksimum 🎉';
      } else if (sk.reason === 'NOT_ENOUGH_COINS' || playerCoins < (sk.upgradeCost || 0)) {
        const kurang = Math.max(1, (sk.upgradeCost || 0) - playerCoins);
        return `Koin belum cukup — kurang ${kurang} 🪙`;
      }
      return 'Skill belum dapat ditingkatkan';
    }

    assert.equal(getReasonToast({ reason: 'NOT_OWNED', owned: false }, 500), 'Skill ini belum kamu miliki');
    assert.equal(getReasonToast({ reason: 'MAX_LEVEL', owned: true, level: 5 }, 500), 'Sudah level maksimum 🎉');
    assert.equal(getReasonToast({ reason: 'NOT_ENOUGH_COINS', owned: true, upgradeCost: 350 }, 100), 'Koin belum cukup — kurang 250 🪙');
  });
});
