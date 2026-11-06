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
      bossDefeated: 20, // Unlocks Common (3) & Rare (12) of boss_slayer, Epic is 50
      stars: 80,        // Unlocks Common (15) & Rare (75) of star_collector, Epic is 225
      bestStreak: 14,   // Unlocks Common (4), Rare (8), Epic (12) of combo_virtuoso, Legend is 16
      level: 8          // Unlocks Common (3) & Rare (6) of ascendant_level, Epic is 10
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

  await t.test('5. Showcase Deduplikasi & Fallback Ekstraksi Lencana Terbuka', () => {
    // Simulasi logika showcase dedup & slot mapping di app.js
    let showcase = [null, null, null];
    const item1 = { id: 'boss_slayer_common', name: 'Pembasmi Pemula', tier: 'COMMON', icon: '⚔️' };
    const item2 = { id: 'elemental_master_common', name: 'Murid Alam', tier: 'COMMON', icon: '🌱' };

    // Pasang item1 di slot 0
    showcase[0] = item1;
    assert.equal(showcase[0].id, 'boss_slayer_common');

    // Pasang item2 di slot 1
    showcase[1] = item2;
    assert.equal(showcase[1].id, 'elemental_master_common');

    // Jika item1 dipasang di slot 2, slot 0 harus dikosongkan (deduplikasi slot)
    for (let i = 0; i < showcase.length; i++) {
      if (i !== 2 && showcase[i] && showcase[i].id === item1.id) {
        showcase[i] = null;
      }
    }
    showcase[2] = item1;

    assert.equal(showcase[0], null, 'Slot 0 harus kosong karena item pindah ke slot 2');
    assert.equal(showcase[1].id, 'elemental_master_common');
    assert.equal(showcase[2].id, 'boss_slayer_common');

    // Verifikasi fallback extraction jika unlockedList kosong tapi badgeFamilies ada
    const mockFamilies = [
      {
        id: 'boss_slayer',
        name: 'Penakluk Monster Bos',
        category: 'BATTLE',
        tiers: [
          { tier: 'COMMON', name: 'Pembasmi Pemula', icon: '⚔️', unlocked: true },
          { tier: 'RARE', name: 'Pemburu Rimba', icon: '🗡️', unlocked: false }
        ]
      }
    ];

    let extracted = [];
    for (const fam of mockFamilies) {
      for (const tr of fam.tiers) {
        if (tr.unlocked) {
          extracted.push({
            id: `${fam.id}_${tr.tier.toLowerCase()}`,
            familyId: fam.id,
            familyName: fam.name,
            tier: tr.tier,
            name: tr.name,
            icon: tr.icon
          });
        }
      }
    }

    assert.equal(extracted.length, 1);
    assert.equal(extracted[0].id, 'boss_slayer_common');
    assert.equal(extracted[0].tier, 'COMMON');
  });

  await t.test('6. Sistem Pasang 3 Gelar/Titles (Lencana & Skin Gelar) dan Sinkronisasi Primary Title', () => {
    const nick = 'TitleP_' + Math.random().toString(36).slice(2, 7);
    const p = db.registerPlayer(nick, 'pw123', 1);

    // Initial titles for player
    const prof0 = db.getPlayerProfile(p.id);
    assert.equal(prof0.titles.length, 3, 'Harus ada 3 slot gelar');
    assert.equal(prof0.titles[0].name, 'Pelajar Pemula', 'Slot 0 harus memiliki gelar default Pelajar Pemula');
    assert.equal(prof0.titles[1], null);
    assert.equal(prof0.titles[2], null);
    assert.ok(Array.isArray(prof0.ownedTitles), 'Harus mengembalikan daftar gelar yang dimiliki');
    assert.ok(prof0.ownedTitles.some(t => t.id === 'title_rookie'), 'Pelajar Pemula harus ada di ownedTitles');

    // Update with 3 titles
    const titleBatch = [
      { id: 'boss_slayer_legend', name: 'Dewa Penguasa Alam', icon: '👑', tier: 'LEGEND', source: 'badge' },
      { id: 'combo_virtuoso_epic', name: 'Kilat Presisi', icon: '💥', tier: 'EPIC', source: 'badge' },
      { id: 'title_rookie', name: 'Pelajar Pemula', icon: '🥉', tier: 'COMMON', source: 'skin' }
    ];

    const upgRes = db.updatePlayerTitles(p.id, titleBatch);
    assert.equal(upgRes.ok, true);
    assert.equal(upgRes.titles.length, 3);
    assert.equal(upgRes.titles[0].name, 'Dewa Penguasa Alam');
    assert.equal(upgRes.titles[1].name, 'Kilat Presisi');
    assert.equal(upgRes.titles[2].name, 'Pelajar Pemula');
    assert.equal(upgRes.title, 'Dewa Penguasa Alam', 'Primary title pemain harus otomatis tersinkronisasi');

    // Verifikasi profil setelah update
    const prof1 = db.getPlayerProfile(p.id);
    assert.equal(prof1.player.title, 'Dewa Penguasa Alam');
    assert.equal(prof1.titles[0].id, 'boss_slayer_legend');
    assert.equal(prof1.titles[1].id, 'combo_virtuoso_epic');
    assert.equal(prof1.titles[2].id, 'title_rookie');

    // Verifikasi public profile untuk teman
    const pub = db.getPlayerPublicProfile(p.id);
    assert.equal(pub.titles.length, 3);
    assert.equal(pub.titles[0].name, 'Dewa Penguasa Alam');
    assert.equal(pub.titles[1].name, 'Kilat Presisi');
    assert.equal(pub.titles[2].name, 'Pelajar Pemula');

    // Kosongkan slot 1 dan ubah slot 0
    const clearedRes = db.updatePlayerTitles(p.id, [
      null,
      { id: 'combo_virtuoso_epic', name: 'Kilat Presisi', icon: '💥', tier: 'EPIC', source: 'badge' },
      null
    ]);
    assert.equal(clearedRes.titles[0], null);
    assert.equal(clearedRes.titles[1].name, 'Kilat Presisi');
    assert.equal(clearedRes.title, 'Kilat Presisi', 'Primary title mengambil gelar non-null pertama');
  });
});
