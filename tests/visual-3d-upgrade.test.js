const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const Monsters = require('../shared/monsters.js');
const Avatar = require('../shared/avatar.js');

test('Visual 3D Upgrade: Monsters Suite', async (t) => {
  await t.test('1. Database monster memiliki 100 entitas lengkap', () => {
    assert.equal(Array.isArray(Monsters.MONSTERS), true);
    assert.equal(Monsters.MONSTERS.length, 100);
  });

  await t.test('2. Render monster menghasilkan 6 layer volume 3D', () => {
    const m = Monsters.MONSTERS[0]; // Slime Hijau
    const svg = Monsters.renderMonster(m, { uid: 'test01', tier: 'rare' });

    assert.ok(svg.startsWith('<svg'));
    assert.ok(svg.includes('class="monster-shadow fx-shadow"'), 'Harus ada contact shadow');
    assert.ok(svg.includes('id="bd-test01"'), 'Harus ada radial body gradient');
    assert.ok(svg.includes('id="sh-test01"'), 'Harus ada inner shadow');
    assert.ok(svg.includes('id="rm-test01"'), 'Harus ada rim light');
    assert.ok(svg.includes('id="gl-test01"'), 'Harus ada specular glint');
    assert.ok(svg.includes('fx="0.34"'), 'Gradien harus memiliki offset 3D fx=0.34');
  });

  await t.test('3. Tier Ladder: Common, Rare, Epic, Legend terisolasi & terverifikasi', () => {
    const mCommon = { ...Monsters.MONSTERS[0], tier: 'common' };
    const mRare = { ...Monsters.MONSTERS[0], tier: 'rare' };
    const mEpic = { ...Monsters.MONSTERS[0], tier: 'epic' };
    const mLegend = { ...Monsters.MONSTERS[0], tier: 'legend' };

    const svgC = Monsters.renderMonster(mCommon, { uid: 'c' });
    const svgR = Monsters.renderMonster(mRare, { uid: 'r' });
    const svgE = Monsters.renderMonster(mEpic, { uid: 'e' });
    const svgL = Monsters.renderMonster(mLegend, { uid: 'l' });

    // Common
    assert.ok(!svgC.includes('class="aura-rare"'));
    assert.ok(!svgC.includes('class="aura-epic"'));
    assert.ok(!svgC.includes('class="aura-legend"'));
    assert.ok(!svgC.includes('tier-crown'));

    // Rare
    assert.ok(svgR.includes('class="aura-rare"'));
    assert.ok(svgR.includes('class="tier-sparks"'));
    assert.ok(!svgR.includes('class="aura-epic"'));

    // Epic
    assert.ok(svgE.includes('class="aura-epic"'));
    assert.ok(svgE.includes('class="tier-sparks"'));
    assert.ok(svgE.includes('class="fx-ring"')); // halo ring
    assert.ok(svgE.includes('ellipse cx="100" cy="30" rx="24" ry="6.5"'));

    // Legend
    assert.ok(svgL.includes('class="aura-legend"'));
    assert.ok(svgL.includes('class="tier-crown"'));
    assert.ok(svgL.includes('class="fx-rays"'));
    assert.ok(svgL.includes('legend-sparks'));
  });

  await t.test('4. Opsi fx static / lite menonaktifkan animasi & blend mode', () => {
    const mLegend = { ...Monsters.MONSTERS[0], tier: 'legend' };
    const svgStatic = Monsters.renderMonster(mLegend, { uid: 's', fx: 'static' });
    assert.ok(svgStatic.includes('class="fx fx-static"'));
  });
});

test('Visual 3D Upgrade: Avatar & Skin Suite', async (t) => {
  await t.test('1. Semua slot terdaftar dan jumlah item valid', () => {
    assert.equal(Avatar.SKINS.length, 5, '5 warna kulit');
    assert.equal(Avatar.HAIRS.length, 6, '6 gaya rambut');
    assert.equal(Object.keys(Avatar.HAT).length, 8, '8 topi');
    assert.equal(Object.keys(Avatar.OUTFIT).length, 6, '6 outfit');
    assert.equal(Object.keys(Avatar.WEAPON).length, 5, '5 senjata');
    assert.equal(Object.keys(Avatar.FRAME).length, 6, '6 frame');
    assert.equal(Object.keys(Avatar.BG).length, 7, '7 background');
    assert.equal(Object.keys(Avatar.PET).length, 6, '6 pet');

    // Total slot item = 8 + 6 + 5 + 6 + 7 + 6 = 38 + 5 skin + 6 hair = 49 items
    assert.ok(Avatar.BG.bg_aurora, 'bg_aurora harus terdaftar');
  });

  await t.test('2. Render Avatar lengkap dengan opsi ukuran & uid', () => {
    const fullAvatar = {
      skin: Avatar.SKINS[0],
      hair: Avatar.HAIRS[0],
      hat: 'hat_crown',
      outfit: 'outfit_royal',
      weapon: 'weapon_crystal_wand',
      frame: 'frame_rainbow',
      bg: 'bg_aurora',
      pet: 'pet_dragon'
    };
    const svg = Avatar.renderAvatar(fullAvatar, { uid: 'avtest01', size: 160 });
    assert.ok(svg.startsWith('<svg'));
    assert.ok(svg.includes('id="sk-avtest01"'), 'Gradient kulit harus scoped dengan uid');
    assert.ok(svg.includes('id="cg-avtest01"'), 'Gradient mahkota harus scoped dengan uid');
    assert.ok(svg.includes('width="160"'));
    assert.ok(svg.includes('height="160"'));
  });

  await t.test('3. Render Thumbnail untuk seluruh item visual sukses tanpa error', () => {
    const visualSlots = [
      { slot: 'hat', dict: Avatar.HAT },
      { slot: 'outfit', dict: Avatar.OUTFIT },
      { slot: 'weapon', dict: Avatar.WEAPON },
      { slot: 'frame', dict: Avatar.FRAME },
      { slot: 'bg', dict: Avatar.BG }
    ];

    visualSlots.forEach(({ slot, dict }) => {
      Object.keys(dict).forEach(id => {
        const thumb = Avatar.renderThumbnail(id, slot);
        assert.ok(thumb.startsWith('<svg'), `Thumbnail ${slot}:${id} harus menghasilkan SVG`);
        assert.ok(thumb.includes('</svg>'), `Thumbnail ${slot}:${id} harus tertutup rapi`);
      });
    });

    // Pet thumbnail rendering
    Object.keys(Avatar.PET).forEach(petId => {
      const petThumb = Avatar.renderThumbnail(petId, 'pet');
      assert.ok(petThumb.includes('<img') || petThumb.includes('<div'), `Pet thumb ${petId} harus valid`);
    });
  });

  await t.test('4. Kompatibilitas ganda method dan string interpolation', () => {
    assert.equal(typeof Avatar.HAT.hat_crown, 'function');
    assert.ok(String(Avatar.HAT.hat_crown).length > 20);
    assert.ok(Avatar.HAT.hat_crown('sub1').includes('sub1'));
  });
});

test('Visual 3D Upgrade: CSS & Integrasi HTML Suite', async (t) => {
  await t.test('1. fx.css mendefinisikan 15 keyframes dan kelas utilitas', () => {
    const cssPath = path.join(__dirname, '../public/css/fx.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    const requiredKeyframes = [
      'fx-bob', 'fx-bob-sm', 'fx-shadow', 'fx-blink', 'fx-pulse',
      'fx-sweep', 'fx-spin', 'fx-twinkle', 'fx-glint', 'fx-gem',
      'fx-ring', 'fx-holo', 'fx-drift', 'fx-rise', 'fx-run'
    ];
    requiredKeyframes.forEach(kf => {
      assert.ok(css.includes(`@keyframes ${kf}`), `Keyframe ${kf} harus ada`);
    });
    assert.ok(css.includes('.aura-rare'));
    assert.ok(css.includes('.aura-epic'));
    assert.ok(css.includes('.aura-legend'));
    assert.ok(css.includes('.fx-static'));
    assert.ok(css.includes('prefers-reduced-motion'));
  });

  await t.test('2. index.html memuat fx.css dan script ber-versioning', () => {
    const htmlPath = path.join(__dirname, '../public/index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    assert.ok(html.includes('href="css/fx.css?v=20261107v1"'));
    assert.ok(html.includes('src="js/monsters.js?v=20261107v1"'));
    assert.ok(/src="js\/avatar\.js\?v=20261107v[1-9]"/.test(html));
    assert.ok(html.includes('IntersectionObserver'));
  });
});
