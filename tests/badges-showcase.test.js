const test = require('node:test');
const assert = require('node:assert/strict');
const Badges = require('../shared/badges');
const db = require('../lib/db');

test('T-59: Sistem 20 Kategori Lencana x 4 Tier & Showcase Profil Teman', async (t) => {
  const rawDb = db.getDb();

  await t.test('1. Verifikasi 20 Kategori x 4 Tier = 80 Lencana di shared/badges.js', () => {
    assert.equal(Badges.BADGE_FAMILIES.length, 20, 'Harus ada 20 kategori lencana');
    for (const f of Badges.BADGE_FAMILIES) {
      assert.equal(f.tiers.length, 4, `Kategori ${f.id} harus memiliki 4 tier`);
      assert.deepEqual(f.tiers.map(t => t.tier), ['COMMON', 'RARE', 'EPIC', 'LEGEND']);
      assert.ok(f.name, `Kategori ${f.id} harus memiliki nama`);
      assert.ok(f.statKey, `Kategori ${f.id} harus memiliki statKey`);
      // Target harus menaik secara strictly increasing
      for (let i = 1; i < f.tiers.length; i++) {
        assert.ok(f.tiers[i].target > f.tiers[i - 1].target, `Target tier ${f.tiers[i].tier} harus lebih besar dari ${f.tiers[i-1].tier}`);
      }
    }
  });

  await t.test('2. Evaluasi Statistik Dinamis Membuka Lencana Secara Bertingkat', () => {
    const stats0 = { bossDefeated: 0, stars: 0, bestStreak: 0 };
    const eval0 = Badges.evaluateBadges(stats0);
    assert.equal(eval0.totalUnlocked, 0, 'Stats nol tidak membuka lencana');
    assert.equal(eval0.totalBadges, 80);

    const statsMid = {
      bossDefeated: 30, // Unlocks Common (5) & Rare (25) of boss_slayer
      stars: 160,       // Unlocks Common (30) & Rare (150) of star_collector
      bestStreak: 20,   // Unlocks Common (7), Rare (14), Epic (20) of combo_virtuoso
      level: 10         // Unlocks Common (5) & Rare (10) of ascendant_level
    };
    const evalMid = Badges.evaluateBadges(statsMid);
    assert.ok(evalMid.totalUnlocked >= 9, 'Harus membuka minimal 9 lencana');

    const bossFamily = evalMid.families.find(f => f.id === 'boss_slayer');
    assert.equal(bossFamily.unlockedCount, 2);
    assert.equal(bossFamily.highestTier, 'RARE');
    assert.equal(bossFamily.tiers[0].unlocked, true); // Common
    assert.equal(bossFamily.tiers[1].unlocked, true); // Rare
    assert.equal(bossFamily.tiers[2].unlocked, false); // Epic

    const comboFamily = evalMid.families.find(f => f.id === 'combo_virtuoso');
    assert.equal(comboFamily.unlockedCount, 3);
    assert.equal(comboFamily.highestTier, 'EPIC');
  });

  await t.test('3. Showcase 3 Slot: Simpan, Perbarui, dan Validasi Batas', () => {
    const nick = 'ShowcaseP_' + Math.random().toString(36).slice(2, 7);
    const p = db.registerPlayer(nick, 'pw123', 1);

    // Initial showcase should be 3 nulls or empty
    const prof0 = db.getPlayerProfile(p.id);
    assert.equal(prof0.showcase.length, 3);
    assert.deepEqual(prof0.showcase, [null, null, null]);

    // Update showcase with 2 items
    const sampleItems = [
      { id: 'boss_slayer_rare', name: 'Pemburu Rimba', icon: '🗡️', tier: 'RARE', type: 'badge' },
      { id: 'combo_virtuoso_epic', name: 'Kilat Presisi', icon: '💥', tier: 'EPIC', type: 'badge' }
    ];
    const upgRes = db.updatePlayerShowcase(p.id, sampleItems);
    assert.equal(upgRes.ok, true);
    assert.equal(upgRes.showcase.length, 3);
    assert.equal(upgRes.showcase[0].name, 'Pemburu Rimba');
    assert.equal(upgRes.showcase[1].name, 'Kilat Presisi');
    assert.equal(upgRes.showcase[2], null);

    // Check re-fetch profile
    const prof1 = db.getPlayerProfile(p.id);
    assert.equal(prof1.showcase[0].id, 'boss_slayer_rare');
    assert.equal(prof1.showcase[1].id, 'combo_virtuoso_epic');
    assert.equal(prof1.showcase[2], null);
  });

  await t.test('4. Public Profile Teman Mengembalikan Seluruh Data Lengkap', () => {
    const nick = 'FriendP_' + Math.random().toString(36).slice(2, 7);
    const p = db.registerPlayer(nick, 'pw123', 1);

    rawDb.prepare('UPDATE players SET xp = 2000 WHERE id = ?').run(p.id);
    rawDb.prepare('INSERT OR IGNORE INTO player_items(player_id, item_id, is_equipped) VALUES(?, ?, 0)').run(p.id, 'hat_crown');

    db.updatePlayerShowcase(p.id, [
      { id: 'star_collector_common', name: 'Bintang Fajar', icon: '⭐', tier: 'COMMON', type: 'badge' },
      null,
      null
    ]);

    const publicProf = db.getPlayerPublicProfile(p.id);
    assert.equal(publicProf.ok, true);
    assert.equal(publicProf.player.nick, nick);
    assert.ok(publicProf.player.level >= 5);
    assert.ok(publicProf.stats !== undefined);
    assert.equal(typeof publicProf.totalBadges, 'number');
    assert.ok(publicProf.totalSkins >= 1);
    assert.equal(publicProf.showcase.length, 3);
    assert.equal(publicProf.showcase[0].name, 'Bintang Fajar');
    assert.equal(publicProf.showcase[1], null);
    assert.equal(publicProf.showcase[2], null);
  });
});
