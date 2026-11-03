const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const Monsters = require('../shared/monsters.js');

test('UI Boss Tier & Auroras (T-34)', async (t) => {
  await t.test('1. monsters.js renders distinct SVG elements per tier', () => {
    const dummyMonster = { id: 1, name: 'Ignis', body: 'blob', color: 'fire', eyes: 'cute', mouth: 'happy', extra: 'horns' };

    // Common
    const commonSvg = Monsters.renderMonster(dummyMonster, { size: 76, tier: 'common' });
    assert.match(commonSvg, /data-tier="common"/);
    assert.doesNotMatch(commonSvg, /class="aura-rare"/);
    assert.doesNotMatch(commonSvg, /class="aura-epic"/);
    assert.doesNotMatch(commonSvg, /class="aura-legend"/);
    assert.doesNotMatch(commonSvg, /class="tier-crown"/);

    // Rare
    const rareSvg = Monsters.renderMonster(dummyMonster, { size: 76, tier: 'rare' });
    assert.match(rareSvg, /data-tier="rare"/);
    assert.match(rareSvg, /class="aura-rare"/);
    assert.match(rareSvg, /#3b82f6/);
    assert.doesNotMatch(rareSvg, /class="tier-crown"/);

    // Epic
    const epicSvg = Monsters.renderMonster(dummyMonster, { size: 76, tier: 'epic' });
    assert.match(epicSvg, /data-tier="epic"/);
    assert.match(epicSvg, /class="aura-epic"/);
    assert.match(epicSvg, /#a855f7/);
    assert.match(epicSvg, /class="tier-sparks"/);
    assert.doesNotMatch(epicSvg, /class="tier-crown"/);

    // Legend
    const legendSvg = Monsters.renderMonster(dummyMonster, { size: 76, tier: 'legend' });
    assert.match(legendSvg, /data-tier="legend"/);
    assert.match(legendSvg, /class="aura-legend"/);
    assert.match(legendSvg, /#f59e0b/);
    assert.match(legendSvg, /class="tier-crown"/);
    assert.match(legendSvg, /legend-sparks/);
  });

  await t.test('2. public/css/style.css defines tier badges, auroras, and reduced motion', () => {
    const cssPath = path.join(__dirname, '..', 'public', 'css', 'style.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    assert.ok(css.includes('.tier-badge'), 'defines .tier-badge');
    assert.ok(css.includes('.tier-common'), 'defines .tier-common');
    assert.ok(css.includes('.tier-rare'), 'defines .tier-rare');
    assert.ok(css.includes('.tier-epic'), 'defines .tier-epic');
    assert.ok(css.includes('.tier-legend'), 'defines .tier-legend');

    assert.ok(css.includes('.boss-hits-left'), 'defines .boss-hits-left');
    assert.ok(css.includes('.fatigue-banner'), 'defines .fatigue-banner');
    assert.ok(css.includes('.pity-badge'), 'defines .pity-badge');
    assert.ok(css.includes('.boss-intro-overlay'), 'defines .boss-intro-overlay');

    assert.ok(css.includes('@keyframes auraPulse'), 'defines @keyframes auraPulse');
    assert.ok(css.includes('@keyframes sparkFloat'), 'defines @keyframes sparkFloat');

    // Reduced motion checks
    assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'supports prefers-reduced-motion');
    assert.ok(css.includes('body.reduced-motion'), 'supports body.reduced-motion');
  });

  await t.test('3. public/js/app.js contains all required testids and UI components', () => {
    const appPath = path.join(__dirname, '..', 'public', 'js', 'app.js');
    const appJs = fs.readFileSync(appPath, 'utf8');

    assert.ok(appJs.includes('data-testid="boss-tier-badge"'), 'has boss-tier-badge testid');
    assert.ok(appJs.includes('data-testid="boss-hits-left"'), 'has boss-hits-left testid');
    assert.ok(appJs.includes('data-testid="boss-intro"'), 'has boss-intro testid');
    assert.ok(appJs.includes('data-testid="boss-fatigue-banner"'), 'has boss-fatigue-banner testid');
    assert.ok(appJs.includes('data-testid="pity-badge"'), 'has pity-badge testid');
    assert.ok(appJs.includes('id="result-boss-tier"'), 'has result screen boss tier badge');

    // Helper functions in Screens.battle
    assert.ok(appJs.includes('dismissIntro()'), 'has dismissIntro method');
    assert.ok(appJs.includes('boss-hits-left-val'), 'updates boss hits left counter');
  });
});
