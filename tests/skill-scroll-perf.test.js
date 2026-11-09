'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

let SkillArt;
try {
  SkillArt = require('../shared/skill-art');
} catch (e) {
  SkillArt = require('../skill-art');
}

test('Skill Menu Scroll Performance Optimization Suite', async (t) => {

  await t.test('1. SkillArt.renderSkill with animated: false strips all continuous SMIL animate loops', () => {
    const ids = SkillArt.getAllSkillIds();
    assert.equal(ids.length, 10, 'Must have 10 skills');

    for (const id of ids) {
      for (let lv = 1; lv <= 5; lv++) {
        const animatedSvg = SkillArt.renderSkill(id, lv, { size: 64, animated: true });
        const staticSvg = SkillArt.renderSkill(id, lv, { size: 44, animated: false });

        assert.ok(staticSvg.startsWith('<svg'), 'Static SVG must start with <svg');
        assert.ok(staticSvg.endsWith('</svg>'), 'Static SVG must end with </svg>');
        assert.equal((staticSvg.match(/<animate/gi) || []).length, 0, `Skill ${id} Lv ${lv} must have 0 animate tags when animated: false`);
        assert.equal((staticSvg.match(/<animateTransform/gi) || []).length, 0, `Skill ${id} Lv ${lv} must have 0 animateTransform tags when animated: false`);
        assert.ok(staticSvg.length < animatedSvg.length, `Static SVG (${staticSvg.length} bytes) must be lighter than animated SVG (${animatedSvg.length} bytes)`);
      }
    }
  });

  await t.test('2. SkillArt.renderStaticSkill provides convenient static renderer', () => {
    assert.equal(typeof SkillArt.renderStaticSkill, 'function', 'renderStaticSkill method must exist');
    const staticOut = SkillArt.renderStaticSkill('power_strike', 5, { size: 44 });
    assert.equal((staticOut.match(/<animate/gi) || []).length, 0, 'Must have 0 animate tags');
    assert.ok(staticOut.includes('width="44" height="44"'), 'Must respect custom size');
  });

  await t.test('3. Small icon sizes (<= 48px) default to static unless animated: true or lite is explicit', () => {
    const defaultSmall = SkillArt.renderSkill('eliminate_one', 5, { size: 44 });
    assert.equal((defaultSmall.match(/<animate/gi) || []).length, 0, 'Size 44 must default to static');

    const explicitAnimated = SkillArt.renderSkill('eliminate_one', 5, { size: 44, animated: true });
    assert.ok((explicitAnimated.match(/<animate/gi) || []).length > 0, 'Explicit animated: true must preserve animation');

    // Test lite mode (animasi tetap jalan tapi ringan)
    const liteAnimated = SkillArt.renderSkill('eliminate_one', 5, { size: 44, animated: 'lite' });
    const liteAnims = (liteAnimated.match(/<animate/gi) || []).length;
    assert.ok(liteAnims >= 1 && liteAnims <= 2, `Lite mode must keep 1-2 essential animations (got ${liteAnims})`);
    assert.ok(liteAnimated.includes('fx-skill-glow'), 'Lite mode must include GPU fx-skill-glow class');
  });

  await t.test('4. Modal preview size (56px) preserves animations for living detail presentation', () => {
    const modalSvg = SkillArt.renderSkill('eagle_eye', 3, { size: 56, animated: true });
    assert.ok((modalSvg.match(/<animate/gi) || []).length > 0, 'Modal size with animated: true must contain animations');
    assert.ok(modalSvg.includes('width="56" height="56"'), 'Must have 56x56 dimensions');
  });

  await t.test('5. app.js applies lightweight living skill rendering on list cards and loadout slots', () => {
    let appJsPath = path.join(__dirname, '..', 'app.js');
    if (!fs.existsSync(appJsPath)) {
      appJsPath = path.join(__dirname, '..', 'public', 'js', 'app.js');
    }
    assert.ok(fs.existsSync(appJsPath), 'app.js must exist');
    const content = fs.readFileSync(appJsPath, 'utf8');

    // Slot and Card calls in renderTabSkill use lightweight living animation (animated: 'lite')
    assert.ok(content.includes("SkillArt.renderSkill(sk.id, curLv, { size: 42, animated: 'lite' })"), "Loadout slots must use animated: 'lite'");
    assert.ok(content.includes("SkillArt.renderSkill(s.id, cardLv, { size: 44, animated: 'lite' })"), "Skill cards list must use animated: 'lite'");

    // Modal calls preserve full animation
    assert.ok(content.includes('SkillArt.renderSkill(skillId, currentLevel, { size: 56, animated: true })'), 'Modal header must use animated: true');
  });

  await t.test('6. fx.css contains GPU layer promotion and content-visibility for 60fps scrolling', () => {
    let cssPath = path.join(__dirname, '..', 'fx.css');
    if (!fs.existsSync(cssPath)) {
      cssPath = path.join(__dirname, '..', 'public', 'css', 'fx.css');
    }
    assert.ok(fs.existsSync(cssPath), 'fx.css must exist');
    const content = fs.readFileSync(cssPath, 'utf8');

    assert.ok(content.includes('content-visibility: auto'), 'fx.css must use content-visibility: auto for skill cards');
    assert.ok(content.includes('contain-intrinsic-size: 140px'), 'fx.css must define contain-intrinsic-size');
    assert.ok(content.includes('contain: layout paint'), 'fx.css must isolate card layout and paint containment');
    assert.ok(content.includes('-webkit-overflow-scrolling: touch'), 'fx.css must enable touch momentum scrolling');
  });

});
