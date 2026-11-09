'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

let SkinArt;
try {
  SkinArt = require('../shared/skin-art.js');
} catch (e) {
  SkinArt = require('../skin-art.js');
}

let Avatar;
try {
  Avatar = require('../shared/avatar.js');
} catch (e) {
  Avatar = require('../avatar.js');
}

test('Square Frames, Hero Profile Showcase & Lightweight Skill Animation Suite', async (t) => {

  await t.test('1. All 7 previously-circular frames are now fully square squircle rect frames', () => {
    const squareFrameIds = [
      'frame_seashell',
      'frame_gear',
      'frame_frost',
      'frame_lightning',
      'frame_dragon_scale',
      'frame_runic',
      'frame_supernova'
    ];

    for (const id of squareFrameIds) {
      assert.ok(SkinArt.has(id), `SkinArt must have frame ${id}`);
      const rawSvg = SkinArt.getRawSvg(id);
      
      // Must not contain circular frame rings: cx="100" cy="100" r > 60
      const largeRingCircles = (rawSvg.match(/<circle[^>]*cx="100"[^>]*cy="100"[^>]*r="[6-9]\d"/g) || []);
      assert.equal(largeRingCircles.length, 0, `Frame ${id} must not have large circular frame rings (got: ${largeRingCircles.join(', ')})`);

      // Must contain square squircle rects
      const squareRects = (rawSvg.match(/<rect[^>]*width="1[7-9]\d"[^>]*height="1[7-9]\d"[^>]*rx="2[0-8]"/g) || []);
      assert.ok(squareRects.length >= 1, `Frame ${id} must contain square squircle rect (got ${squareRects.length})`);

      // Test Avatar rendering with this frame
      const avatarSvg = Avatar.renderAvatar({ frame: id, pet: 'pet_cat', weapon: 'weapon_excalibur' }, { size: 196 });
      assert.ok(avatarSvg.includes('width="196" height="196"'), 'Avatar should respect size 196');
      assert.ok(avatarSvg.includes('</svg>'), 'Avatar SVG must be closed');
    }
  });

  await t.test('2. app.js renderTabRingkasan implements 1 full hero box on top and info below', () => {
    let appJsPath = path.join(__dirname, '..', 'app.js');
    if (!fs.existsSync(appJsPath)) {
      appJsPath = path.join(__dirname, '..', 'public', 'js', 'app.js');
    }
    assert.ok(fs.existsSync(appJsPath), 'app.js must exist');
    const content = fs.readFileSync(appJsPath, 'utf8');

    // Hero box container
    assert.ok(content.includes('class="card hero-profile-card"'), 'Must have hero-profile-card container');
    assert.ok(content.includes('class="hero-avatar-box"'), 'Must have hero-avatar-box viewport');
    assert.ok(content.includes('Avatar.renderAvatar(this.profileData?.avatar || {}, { size: 196 })'), 'Must render large 196px avatar showcase');

    // Info positioned below the photo profile
    assert.ok(content.includes('esc(p.nick || \'Petualang\')'), 'Must display nickname below photo profile');
    assert.ok(content.includes('Lv. ${p.level || 1}'), 'Must display level below photo profile');
    assert.ok(content.includes('class="profile-titles-container"'), 'Must display titles container below photo profile');
    assert.ok(content.includes('class="xp-track"'), 'Must display XP track below photo profile');
  });

  await t.test('3. SkillArt animated: lite mode preserves continuous animations while remaining lightweight', () => {
    let SkillArtMod;
    try {
      SkillArtMod = require('../shared/skill-art');
    } catch (e) {
      SkillArtMod = require('../skill-art');
    }

    const ids = SkillArtMod.getAllSkillIds();
    for (const id of ids) {
      const liteSvg = SkillArtMod.renderSkill(id, 5, { size: 44, animated: 'lite' });
      const fullSvg = SkillArtMod.renderSkill(id, 5, { size: 44, animated: true });
      const staticSvg = SkillArtMod.renderSkill(id, 5, { size: 44, animated: false });

      const liteAnims = (liteSvg.match(/<animate/gi) || []).length;
      const fullAnims = (fullSvg.match(/<animate/gi) || []).length;
      const staticAnims = (staticSvg.match(/<animate/gi) || []).length;

      assert.equal(staticAnims, 0, `Skill ${id} static must have 0 animate tags`);
      assert.ok(liteAnims >= 1 && liteAnims <= 2, `Skill ${id} lite must keep 1-2 animations (got ${liteAnims})`);
      assert.ok(fullAnims >= liteAnims, `Skill ${id} full (${fullAnims}) must have >= lite (${liteAnims}) animations`);
      assert.ok(liteSvg.includes('fx-skill-glow'), `Skill ${id} lite must have fx-skill-glow CSS class`);
    }
  });

  await t.test('4. fx.css contains hero showcase box styles and lightweight skill glow animations', () => {
    let cssPath = path.join(__dirname, '..', 'fx.css');
    if (!fs.existsSync(cssPath)) {
      cssPath = path.join(__dirname, '..', 'public', 'css', 'fx.css');
    }
    assert.ok(fs.existsSync(cssPath), 'fx.css must exist');
    const content = fs.readFileSync(cssPath, 'utf8');

    assert.ok(content.includes('.hero-avatar-box'), 'Must style .hero-avatar-box');
    assert.ok(content.includes('.hero-profile-card'), 'Must style .hero-profile-card');
    assert.ok(content.includes('.skill-art-lite.fx-skill-glow'), 'Must style .skill-art-lite.fx-skill-glow');
    assert.ok(content.includes('skillGlowBreath'), 'Must define skillGlowBreath animation');
    assert.ok(content.includes('.is-scrolling .skill-art-lite'), 'Must pause animations during fast scrolling');
  });

});
