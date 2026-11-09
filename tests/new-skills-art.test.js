'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Require SkillArt module with fallback for both flat and structured repos
let SkillArt;
try {
  SkillArt = require('../shared/skill-art');
} catch (e) {
  SkillArt = require('../skill-art');
}

test('10 Taktik Skill Petualangan RPG - V2 Upgrade Suite', async (t) => {
  await t.test('1. SkillArt metadata contains all 10 skills with valid info', () => {
    const expectedSkills = [
      'eliminate_one',
      'eagle_eye',
      'heal',
      'shield',
      'power_strike',
      'time_freeze',
      'combo_keeper',
      'lucky_pouch',
      'second_chance',
      'red_potion'
    ];

    const ids = SkillArt.getAllSkillIds();
    assert.equal(ids.length, 10, 'Must have exactly 10 skills');

    for (const expectedId of expectedSkills) {
      assert.ok(SkillArt.hasSkill(expectedId), `Must have skill ${expectedId}`);
      const meta = SkillArt.getSkillMetadata(expectedId);
      assert.ok(meta, `Metadata must exist for ${expectedId}`);
      assert.ok(meta.name && meta.name.length > 0, `${expectedId} must have name`);
      assert.ok(meta.icon && meta.icon.length > 0, `${expectedId} must have icon`);
      assert.ok(meta.desc && meta.desc.length > 0, `${expectedId} must have description`);
      assert.ok(meta.theme && meta.theme.startsWith('#'), `${expectedId} must have hex theme color`);
    }
  });

  await t.test('2. SkillArt contains all 50 SVGs (10 skills × 5 levels)', () => {
    const ids = SkillArt.getAllSkillIds();
    for (const id of ids) {
      for (let lv = 1; lv <= 5; lv++) {
        const svg = SkillArt.renderSkill(id, lv, { size: 64 });
        assert.ok(svg, `SVG must exist for ${id} Lv ${lv}`);
        assert.ok(svg.startsWith('<svg'), `${id} Lv ${lv} must start with <svg`);
        assert.ok(svg.endsWith('</svg>'), `${id} Lv ${lv} must end with </svg>`);
        assert.ok(svg.includes('viewBox="0 0 200 200"'), `${id} Lv ${lv} must have 200x200 viewBox`);
        assert.ok(svg.includes('width="64" height="64"'), `${id} Lv ${lv} must be resized to 64px`);
        assert.ok(svg.includes(`aria-label="${id} Lv${lv}"`), `${id} Lv ${lv} must have aria-label`);
      }
    }
  });

  await t.test('3. Custom sizing, options and bounds handling', () => {
    // Custom size via number
    const svg32 = SkillArt.renderSkill('eliminate_one', 1, 32);
    assert.ok(svg32.includes('width="32" height="32"'), 'Must resize with numeric argument');

    // Custom size via options object
    const svg120 = SkillArt.renderSkill('eagle_eye', 3, { size: 120, extraClass: 'skill-glow' });
    assert.ok(svg120.includes('width="120" height="120"'), 'Must resize with size option');
    assert.ok(svg120.includes('class="skill-glow"'), 'Must inject extraClass');

    // Level clamping
    const svgMin = SkillArt.renderSkill('shield', 0); // clamped to 1
    assert.ok(svgMin.includes('aria-label="shield Lv1"'), 'Must clamp level < 1 to Lv 1');

    const svgMax = SkillArt.renderSkill('shield', 99); // clamped to 5
    assert.ok(svgMax.includes('aria-label="shield Lv5"'), 'Must clamp level > 5 to Lv 5');

    // UID Scoping
    const svgScoped = SkillArt.renderSkill('heal', 4, { uid: 'test99' });
    assert.ok(svgScoped.includes('sk-heal-l4-test99-'), 'Must scope gradient/filter IDs with uid');
  });

  await t.test('4. Level-up visual traits progression check', () => {
    // Level 1: Bronze frame
    const lv1 = SkillArt.renderSkill('power_strike', 1);
    assert.ok(lv1.includes('fr'), 'Lv1 must include frame gradient');

    // Level 4: Lightning / Turbulence filter
    const lv4 = SkillArt.renderSkill('power_strike', 4);
    assert.ok(lv4.includes('feTurbulence'), 'Lv4 must include electric feTurbulence filter');

    // Level 5: Prismatic / Multiple lightning bolts & stars
    const lv5 = SkillArt.renderSkill('power_strike', 5);
    assert.ok(lv5.includes('feTurbulence'), 'Lv5 must include electric feTurbulence filter');
    assert.ok(lv5.includes('scale(-1 1)') || lv5.includes('scale(-1 -1)'), 'Lv5 must include corner lightning transforms');
  });

  await t.test('5. Fallback behavior for invalid skill', () => {
    const unknown = SkillArt.renderSkill('unknown_skill', 1, { size: 40 });
    assert.ok(unknown.includes('skill-art-fallback'), 'Must return fallback span');
    assert.ok(unknown.includes('⚡'), 'Must include fallback emoji');

    const unknownNoFallback = SkillArt.renderSkill('unknown_skill', 1, { fallbackWithEmoji: false });
    assert.equal(unknownNoFallback, '', 'Must return empty string when fallbackWithEmoji is false');
  });
});
