const test = require('node:test');
const assert = require('node:assert/strict');

const db = (function() {
  try { return require('../lib/db'); }
  catch(e) { return require('../db'); }
})();

const Badges = (function() {
  try { return require('../shared/badges'); }
  catch(e) { return require('../badges'); }
})();

test('Sinkronisasi Statistik Profil: Hari Belajar, Monster Dex, Akurasi & Streak', async (t) => {
  const rawDb = db.getDb();

  await t.test('1. calculatePlayerStreakAndDays menghitung streak hari beruntun dan hari aktif', () => {
    assert.equal(typeof db.calculatePlayerStreakAndDays, 'function', 'calculatePlayerStreakAndDays harus diekspor');

    // Buat player dummy untuk pengujian
    const testNick = 'test_streak_' + Date.now();
    const created = db.registerPlayer(testNick, 'Password123!', 1);
    const pId = created.id;

    // Awal: belum ada riwayat sesi
    const initial = db.calculatePlayerStreakAndDays(rawDb, pId);
    assert.equal(initial.activeDays, 1);
    assert.equal(initial.dayStreak, 1);

    // Simulasikan 3 hari berurutan: hari ini, kemarin, lusa lalu
    const now = new Date();
    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const d0 = formatDate(now);
    const d1 = formatDate(new Date(now.getTime() - 86400000));
    const d2 = formatDate(new Date(now.getTime() - 86400000 * 2));

    rawDb.prepare(`
      INSERT INTO game_sessions(id, player_id, subject_id, monster_id, mode, status, end_reason, correct_count, total_questions, boss_max_hp, boss_hp, player_max_hp, player_hp, created_at)
      VALUES 
        ('sess_test_1', ?, 1, 1, 'BATTLE', 'WON', 'BOSS_DEFEATED', 5, 5, 100, 0, 100, 100, ? || 'T10:00:00.000Z'),
        ('sess_test_2', ?, 1, 2, 'BATTLE', 'WON', 'BOSS_DEFEATED', 5, 5, 100, 0, 100, 100, ? || 'T10:00:00.000Z'),
        ('sess_test_3', ?, 1, 3, 'BATTLE', 'WON', 'BOSS_DEFEATED', 5, 5, 100, 0, 100, 100, ? || 'T10:00:00.000Z')
    `).run(pId, d0, pId, d1, pId, d2);

    const after3 = db.calculatePlayerStreakAndDays(rawDb, pId);
    assert.equal(after3.activeDays, 3, 'Harus mencatat 3 hari aktif');
    assert.equal(after3.dayStreak, 3, 'Streak harus 3 hari berturut-turut');

    // Bersihkan sesi uji
    rawDb.prepare("DELETE FROM game_sessions WHERE id IN ('sess_test_1', 'sess_test_2', 'sess_test_3')").run();
  });

  await t.test('2. getPlayerProfile menyinkronkan dayStreak dan totalMonsters di stats', () => {
    // Gunakan player 8 yang ada di database atau buat dummy
    const profile = db.getPlayerProfile(8);
    assert.ok(profile, 'Profil player 8 harus ada');
    assert.ok(profile.stats, 'Profil harus memiliki stats');

    // Hari Belajar & Day Streak
    assert.ok(profile.stats.activeDays >= 1, 'activeDays harus minimal 1');
    assert.ok(profile.stats.dayStreak >= 1, 'dayStreak harus minimal 1');
    assert.equal(profile.player.dayStreak, profile.stats.dayStreak, 'player.dayStreak harus sinkron dengan stats.dayStreak');

    // Monster Dex: Total monsters harus 100 dan dexDefeated harus akurat
    assert.equal(profile.stats.totalMonsters, 100, 'totalMonsters harus 100 sesuai katalog boss v7');
    assert.ok(profile.stats.dexDefeated >= 0, 'dexDefeated harus berupa angka >= 0');
    assert.ok(profile.stats.dexEncountered >= profile.stats.dexDefeated, 'dexEncountered >= dexDefeated');

    // Akurasi tidak boleh 1% jika player menjawab ratusan soal dengan benar
    assert.ok(profile.stats.accuracy > 1, 'Akurasi harus dihitung dari soal yang benar-benar dijawab');
    assert.ok(profile.stats.winRate > 0, 'WinRate harus dihitung dari sesi yang dimainkan');
  });

  await t.test('3. Evaluasi badge harian (daily_dedication) terbuka sesuai streak yang terhitung', () => {
    const profile = db.getPlayerProfile(8);
    // Player 8 aktif 7 hari beruntun -> harus unlock tier COMMON (2 hari) dan RARE (4 hari)
    if (profile.stats.dayStreak >= 4) {
      const dailyFamily = profile.badgeFamilies.find(f => f.id === 'daily_dedication');
      assert.ok(dailyFamily, 'Family daily_dedication harus ada');
      const tierCommon = dailyFamily.tiers.find(t => t.tier === 'COMMON');
      const tierRare = dailyFamily.tiers.find(t => t.tier === 'RARE');
      assert.equal(tierCommon.unlocked, true, 'Langkah Istiqomah (2 hari) harus unlocked');
      assert.equal(tierRare.unlocked, true, 'Ksatria Tekun (4 hari) harus unlocked');
    }
  });
});
