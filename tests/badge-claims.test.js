const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Safe relative requires
const Badges = (function() {
  try { return require('../shared/badges'); }
  catch(e) { return require('../badges'); }
})();

const db = (function() {
  try { return require('../lib/db'); }
  catch(e) { return require('../db'); }
})();

test('Sistem Klaim Hadiah Lencana Prestasi (Badge Claims Suite)', async (t) => {
  const rawDb = db.getDb();

  await t.test('1. Badges.parseBadgeReward mengekstraksi koin, xp, item eksklusif, dan gelar untuk seluruh 80 lencana', () => {
    assert.equal(typeof Badges.parseBadgeReward, 'function', 'parseBadgeReward harus terdefinisi');

    let totalParsed = 0;
    for (const f of Badges.BADGE_FAMILIES) {
      for (const tier of f.tiers) {
        const badgeId = `${f.id}_${tier.tier.toLowerCase()}`;
        const reward = Badges.parseBadgeReward(badgeId);
        assert.ok(reward, `Reward untuk ${badgeId} harus terparse`);
        assert.equal(reward.badgeId, badgeId);
        assert.equal(reward.familyId, f.id);
        assert.equal(reward.tier, tier.tier);
        assert.ok(reward.coins > 0 || reward.xp > 0, `Reward ${badgeId} harus memiliki koin atau xp`);
        totalParsed++;
      }
    }
    assert.equal(totalParsed, 80, 'Harus memparse seluruh 80 lencana');

    // Cek detail reward spesifik (setelah penurunan 70%)
    const dragonReward = Badges.parseBadgeReward('campaign_pathfinder_legend');
    assert.equal(dragonReward.coins, 660);
    assert.equal(dragonReward.xp, 450);
    assert.equal(dragonReward.itemId, 'pet_dragon');
    assert.equal(dragonReward.title, 'Anak Naga Langit');

    const phoenixReward = Badges.parseBadgeReward('survivor_last_stand_legend');
    assert.equal(phoenixReward.coins, 660);
    assert.equal(phoenixReward.xp, 450);
    assert.equal(phoenixReward.itemId, 'pet_phoenix');

    const supernovaReward = Badges.parseBadgeReward('star_collector_legend');
    assert.equal(supernovaReward.coins, 600);
    assert.equal(supernovaReward.xp, 360);
    assert.equal(supernovaReward.itemId, 'frame_supernova');

    const commonReward = Badges.parseBadgeReward('boss_slayer_common');
    assert.equal(commonReward.coins, 15);
    assert.equal(commonReward.xp, 15);
    assert.equal(commonReward.itemId, null);
  });

  await t.test('2. Tabel player_claimed_badges dibuat otomatis dan memiliki skema valid', () => {
    const tableInfo = rawDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='player_claimed_badges'").get();
    assert.ok(tableInfo, 'Tabel player_claimed_badges harus ada di database');
  });

  await t.test('3. claimBadgeReward: validasi status belum tercapai & duplikasi klaim', () => {
    const nick = 'BadgeTester_' + Math.random().toString(36).slice(2, 7);
    const p = db.registerPlayer(nick, 'pass123', 1);

    // Player baru punya 0 stats -> tidak bisa klaim lencana apa pun
    assert.throws(() => {
      db.claimBadgeReward(p.id, 'boss_slayer_common');
    }, (err) => {
      assert.ok(err.message.includes('Target lencana belum tercapai') || err.code === 'BADGE_NOT_UNLOCKED');
      return true;
    });

    // Validasi ID tidak valid
    assert.throws(() => {
      db.claimBadgeReward(p.id, 'badge_khayalan_tingkat_dewa');
    }, (err) => {
      assert.ok(err.code === 'INVALID_BADGE_ID' || err.message.includes('tidak'));
      return true;
    });
  });

  await t.test('4. claimBadgeReward: sukses klaim individual, koin & XP bertambah, item eksklusif masuk inventaris', () => {
    const nick = 'ClaimWinner_' + Math.random().toString(36).slice(2, 7);
    const p = db.registerPlayer(nick, 'pass123', 1);
    const initialCoins = p.coins;
    const initialXp = p.xp;

    // Simulasikan capaian: 3 kemenangan boss (membuka boss_slayer_common)
    rawDb.prepare(`
      INSERT OR REPLACE INTO player_monsters(player_id, monster_id, defeats, best_streak, best_stars, last_at)
      VALUES(?, 1, 3, 5, 3, datetime('now'))
    `).run(p.id);

    // Profil sebelum klaim
    const profBefore = db.getPlayerProfile(p.id);
    assert.ok(profBefore.badgeSummary.unclaimedCount >= 1, 'Harus ada minimal 1 lencana belum diklaim');
    const bossFamBefore = profBefore.badgeFamilies.find(f => f.id === 'boss_slayer');
    assert.equal(bossFamBefore.tiers[0].unlocked, true);
    assert.equal(bossFamBefore.tiers[0].claimed, false);

    // Lakukan klaim boss_slayer_common (+15 Koin, +15 XP)
    const claimRes = db.claimBadgeReward(p.id, 'boss_slayer_common');
    assert.equal(claimRes.ok, true);
    assert.equal(claimRes.coinsAwarded, 15);
    assert.equal(claimRes.xpAwarded, 15);
    assert.equal(claimRes.newCoins, initialCoins + 15);

    // Profil sesudah klaim
    const profAfter = db.getPlayerProfile(p.id);
    const bossFamAfter = profAfter.badgeFamilies.find(f => f.id === 'boss_slayer');
    assert.equal(bossFamAfter.tiers[0].unlocked, true);
    assert.equal(bossFamAfter.tiers[0].claimed, true);
    assert.ok(profAfter.claimedBadgeIds.includes('boss_slayer_common'));

    // Coba klaim lagi -> harus ditolak
    assert.throws(() => {
      db.claimBadgeReward(p.id, 'boss_slayer_common');
    }, (err) => {
      assert.ok(err.code === 'BADGE_ALREADY_CLAIMED' || err.message.includes('sudah pernah diklaim'));
      return true;
    });
  });

  await t.test('5. claimBadgeReward: pemberian Pet Eksklusif Anak Naga Langit (pet_dragon)', () => {
    const nick = 'DragonRider_' + Math.random().toString(36).slice(2, 7);
    const p = db.registerPlayer(nick, 'pass123', 1);

    // Simulasikan capaian: 25 stage node kampanye (membuka campaign_pathfinder_legend)
    for (let node = 1; node <= 25; node++) {
      rawDb.prepare(`
        INSERT INTO player_campaign_nodes(player_id, node_key, stars, best_accuracy, cleared_at)
        VALUES(?, ?, 3, 100, datetime('now'))
      `).run(p.id, '1-' + node);
    }

    const prof = db.getPlayerProfile(p.id);
    const campFam = prof.badgeFamilies.find(f => f.id === 'campaign_pathfinder');
    assert.equal(campFam.tiers[3].unlocked, true, 'Tier Legend harus terbuka (target 25 nodes)');

    // Pastikan belum punya pet_dragon
    const ownedBefore = rawDb.prepare("SELECT 1 FROM player_items WHERE player_id=? AND item_id='pet_dragon'").get(p.id);
    assert.equal(Boolean(ownedBefore), false);

    // Klaim hadiah Legend
    const claimRes = db.claimBadgeReward(p.id, 'campaign_pathfinder_legend');
    assert.equal(claimRes.ok, true);
    assert.equal(claimRes.itemAwarded, 'pet_dragon');

    // Verifikasi pet_dragon kini dimiliki di player_items
    const ownedAfter = rawDb.prepare("SELECT 1 FROM player_items WHERE player_id=? AND item_id='pet_dragon'").get(p.id);
    assert.equal(Boolean(ownedAfter), true, 'pet_dragon harus masuk ke inventaris pemain');
  });

  await t.test('6. claimAllBadgeRewards: klaim massal seluruh lencana yang terbuka sekaligus', () => {
    const nick = 'BulkClaimer_' + Math.random().toString(36).slice(2, 7);
    const p = db.registerPlayer(nick, 'pass123', 1);

    // Tambahkan 15 kemenangan boss (membuka boss_slayer_common dan boss_slayer_rare)
    rawDb.prepare(`
      INSERT OR REPLACE INTO player_monsters(player_id, monster_id, defeats, best_streak, best_stars, last_at)
      VALUES(?, 1, 15, 10, 3, datetime('now'))
    `).run(p.id);

    const profBefore = db.getPlayerProfile(p.id);
    assert.ok(profBefore.badgeSummary.unclaimedCount >= 2);

    const bulkRes = db.claimAllBadgeRewards(p.id);
    assert.equal(bulkRes.ok, true);
    assert.ok(bulkRes.claimedCount >= 2);
    assert.ok(bulkRes.totalCoins >= 60, '15 + 45 = 60 koin');
    assert.ok(bulkRes.totalXp >= 60, '15 + 45 = 60 XP');
    assert.ok(bulkRes.claimedIds.includes('boss_slayer_common'));
    assert.ok(bulkRes.claimedIds.includes('boss_slayer_rare'));

    // Verifikasi profil sesudah klaim massal:
    const profAfter = db.getPlayerProfile(p.id);
    assert.ok(profAfter.claimedBadgeIds.includes('boss_slayer_common'));
    assert.ok(profAfter.claimedBadgeIds.includes('boss_slayer_rare'));

    // Jika XP memicu kenaikan level (membuka lencana ascendant_level_common secara berantai),
    // jalankan claimAll kedua untuk mengklaim tuntas seluruh cascade
    if (profAfter.badgeSummary.unclaimedCount > 0) {
      const cascadeRes = db.claimAllBadgeRewards(p.id);
      assert.equal(cascadeRes.ok, true);
      assert.ok(cascadeRes.claimedCount >= 1);
    }

    const profFinal = db.getPlayerProfile(p.id);
    assert.equal(profFinal.badgeSummary.unclaimedCount, 0, 'Semua lencana terbuka harus sudah berstatus terklaim');

    // Panggilan ulang saat 0 unclaimed mengembalikan pesan aman
    const secondBulk = db.claimAllBadgeRewards(p.id);
    assert.equal(secondBulk.ok, true);
    assert.equal(secondBulk.claimedCount, 0);
  });
});
