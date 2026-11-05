// shared/badges.js - Sistem 20 Kategori Lencana Prestasi x 4 Tier (80 Lencana)
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Badges = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TIERS = {
    COMMON: { id: 'COMMON', label: 'Common', icon: '🥉', color: '#f59e0b', bg: '#451a03', border: '#b45309' },
    RARE:   { id: 'RARE',   label: 'Rare',   icon: '🥈', color: '#38bdf8', bg: '#0f172a', border: '#0284c7' },
    EPIC:   { id: 'EPIC',   label: 'Epic',   icon: '🥇', color: '#fbbf24', bg: '#3b0764', border: '#f59e0b' },
    LEGEND: { id: 'LEGEND', label: 'Legend', icon: '💎', color: '#c084fc', bg: '#09090b', border: '#a855f7' }
  };

  const TIER_ORDER = ['COMMON', 'RARE', 'EPIC', 'LEGEND'];

  const CATEGORIES = {
    BATTLE:      { id: 'BATTLE',      label: 'Pertempuran & Bos', icon: '⚔️' },
    MASTERY:     { id: 'MASTERY',     label: 'Kemahiran & Fokus', icon: '🎯' },
    EXPLORATION: { id: 'EXPLORATION', label: 'Eksplorasi & Koleksi', icon: '🗺️' },
    STRATEGY:    { id: 'STRATEGY',    label: 'Taktik & Skill', icon: '⚡' },
    COMPETITION: { id: 'COMPETITION', label: 'Kompetisi & Dedikasi', icon: '🏆' }
  };

  const BADGE_FAMILIES = [
    // === PILAR 1: PERTEMPURAN & BOS ===
    {
      id: 'boss_slayer',
      name: 'Penakluk Monster Bos',
      category: 'BATTLE',
      statKey: 'bossDefeated',
      unit: 'bos',
      tiers: [
        { tier: 'COMMON', name: 'Pembasmi Pemula', icon: '⚔️', target: 5, desc: 'Kalahkan 5 monster bos petualangan' },
        { tier: 'RARE',   name: 'Pemburu Rimba',   icon: '🗡️', target: 25, desc: 'Kalahkan 25 monster bos petualangan' },
        { tier: 'EPIC',   name: 'Pahlawan Penakluk', icon: '🛡️', target: 100, desc: 'Kalahkan 100 monster bos petualangan' },
        { tier: 'LEGEND', name: 'Dewa Penguasa Alam', icon: '👑', target: 250, desc: 'Kalahkan 250 monster bos petualangan' }
      ]
    },
    {
      id: 'brutal_conqueror',
      name: 'Penakluk Mode Brutal',
      category: 'BATTLE',
      statKey: 'brutalWins',
      unit: 'menang brutal',
      tiers: [
        { tier: 'COMMON', name: 'Penantang Bahaya', icon: '💀', target: 3, desc: 'Menangkan 3 pertempuran dalam mode Brutal' },
        { tier: 'RARE',   name: 'Prajurit Baja',   icon: '🩸', target: 15, desc: 'Menangkan 15 pertempuran dalam mode Brutal' },
        { tier: 'EPIC',   name: 'Penyintas Neraka', icon: '🔥', target: 40, desc: 'Menangkan 40 pertempuran dalam mode Brutal' },
        { tier: 'LEGEND', name: 'Panglima Brutal',  icon: '👹', target: 80, desc: 'Menangkan 80 pertempuran dalam mode Brutal' }
      ]
    },
    {
      id: 'mythic_hunter',
      name: 'Pembasmi Bos Legend',
      category: 'BATTLE',
      statKey: 'legendWins',
      unit: 'bos legend',
      tiers: [
        { tier: 'COMMON', name: 'Saksi Sang Mitos', icon: '🐉', target: 1, desc: 'Kalahkan 1 monster bos bertier Legend' },
        { tier: 'RARE',   name: 'Penjinak Purba',  icon: '🐲', target: 5, desc: 'Kalahkan 5 monster bos bertier Legend' },
        { tier: 'EPIC',   name: 'Penghancur Legenda', icon: '✨', target: 15, desc: 'Kalahkan 15 monster bos bertier Legend' },
        { tier: 'LEGEND', name: 'Pembasmi Dewa',   icon: '🌌', target: 35, desc: 'Kalahkan 35 monster bos bertier Legend' }
      ]
    },
    {
      id: 'elemental_master',
      name: 'Penguasa 10 Elemen',
      category: 'BATTLE',
      statKey: 'elementsDefeated',
      unit: 'elemen',
      tiers: [
        { tier: 'COMMON', name: 'Murid Alam',       icon: '🌱', target: 3, desc: 'Kalahkan bos dari minimal 3 elemen berbeda' },
        { tier: 'RARE',   name: 'Pawang Elemen',    icon: '🌊', target: 6, desc: 'Kalahkan bos dari minimal 6 elemen berbeda' },
        { tier: 'EPIC',   name: 'Penguasa Primordial', icon: '⚡', target: 9, desc: 'Kalahkan bos dari minimal 9 elemen berbeda' },
        { tier: 'LEGEND', name: 'Avatar Kosmik',    icon: '🪐', target: 10, desc: 'Kalahkan bos dari seluruh 10 elemen alam' }
      ]
    },
    {
      id: 'survivor_last_stand',
      name: 'Penyintas Hati Phoenix',
      category: 'BATTLE',
      statKey: 'lowHpWins',
      unit: 'menang kritis',
      tiers: [
        { tier: 'COMMON', name: 'Goresan Berani',   icon: '❤️‍🩹', target: 3, desc: 'Menangkan 3 laga dengan sisa darah <= 20% HP' },
        { tier: 'RARE',   name: 'Tahan Banting',    icon: '❤️‍🔥', target: 10, desc: 'Menangkan 10 laga dengan sisa darah <= 20% HP' },
        { tier: 'EPIC',   name: 'Kebangkitan Ajaib', icon: '🕊️', target: 25, desc: 'Menangkan 25 laga dengan sisa darah <= 15% HP' },
        { tier: 'LEGEND', name: 'Sayap Phoenix',    icon: '🦅', target: 50, desc: 'Menangkan 50 laga mengalahkan ambang kematian' }
      ]
    },

    // === PILAR 2: KEMAHIRAN & FOKUS ===
    {
      id: 'combo_virtuoso',
      name: 'Maestro Kombo Membara',
      category: 'MASTERY',
      statKey: 'bestStreak',
      unit: 'combo',
      tiers: [
        { tier: 'COMMON', name: 'Percikan Fokus',   icon: '🔥', target: 7, desc: 'Capai rekor 7x kombo jawaban benar beruntun' },
        { tier: 'RARE',   name: 'Irama Badai',      icon: '⚡', target: 14, desc: 'Capai rekor 14x kombo jawaban benar beruntun' },
        { tier: 'EPIC',   name: 'Kilat Presisi',    icon: '💥', target: 20, desc: 'Capai rekor 20x kombo jawaban benar beruntun' },
        { tier: 'LEGEND', name: 'Zen Tak Terpatahkan', icon: '🧘', target: 30, desc: 'Capai rekor 30x kombo jawaban benar beruntun' }
      ]
    },
    {
      id: 'flawless_victory',
      name: 'Kemenangan Sempurna',
      category: 'MASTERY',
      statKey: 'flawlessWins',
      unit: 'laga 100%',
      tiers: [
        { tier: 'COMMON', name: 'Pukulan Murni',    icon: '🎯', target: 3, desc: 'Menangkan 3 laga dengan akurasi mutlak 100%' },
        { tier: 'RARE',   name: 'Eksekusi Bersih',  icon: '🏹', target: 15, desc: 'Menangkan 15 laga dengan akurasi mutlak 100%' },
        { tier: 'EPIC',   name: 'Harmoni Absolut',  icon: '💎', target: 50, desc: 'Menangkan 50 laga dengan akurasi mutlak 100%' },
        { tier: 'LEGEND', name: 'Mahakarya Sempurna', icon: '🌟', target: 100, desc: 'Menangkan 100 laga dengan akurasi mutlak 100%' }
      ]
    },
    {
      id: 'star_collector',
      name: 'Pengoleksi Bintang',
      category: 'MASTERY',
      statKey: 'stars',
      unit: 'bintang',
      tiers: [
        { tier: 'COMMON', name: 'Bintang Fajar',    icon: '⭐', target: 30, desc: 'Kumpulkan akumulasi 30 Bintang kemenangan' },
        { tier: 'RARE',   name: 'Konstelasi Terang', icon: '🌠', target: 150, desc: 'Kumpulkan akumulasi 150 Bintang kemenangan' },
        { tier: 'EPIC',   name: 'Galaksi Gemilang', icon: '🌌', target: 450, desc: 'Kumpulkan akumulasi 450 Bintang kemenangan' },
        { tier: 'LEGEND', name: 'Supernova Abadi',  icon: '✨', target: 750, desc: 'Kumpulkan akumulasi 750 Bintang kemenangan' }
      ]
    },
    {
      id: 'critical_reflexes',
      name: 'Refleks Cepat Kritis',
      category: 'MASTERY',
      statKey: 'criticalCount',
      unit: 'kritis',
      tiers: [
        { tier: 'COMMON', name: 'Refleks Kilat',    icon: '⚡', target: 30, desc: 'Cetak 30 jawaban kilat berstatus Kritis' },
        { tier: 'RARE',   name: 'Serangan Halilintar', icon: '🌩️', target: 120, desc: 'Cetak 120 jawaban kilat berstatus Kritis' },
        { tier: 'EPIC',   name: 'Dentuman Cahaya',  icon: '☄️', target: 350, desc: 'Cetak 350 jawaban kilat berstatus Kritis' },
        { tier: 'LEGEND', name: 'Kecepatan Suara',  icon: '🚀', target: 800, desc: 'Cetak 800 jawaban kilat berstatus Kritis' }
      ]
    },
    {
      id: 'spaced_repetition',
      name: 'Penakluk Titik Lemah',
      category: 'MASTERY',
      statKey: 'reviewsMastered',
      unit: 'soal review',
      tiers: [
        { tier: 'COMMON', name: 'Koreksi Cermat',   icon: '📝', target: 15, desc: 'Jawab benar 15 soal ulangan / titik lemah' },
        { tier: 'RARE',   name: 'Pembalik Kelemahan', icon: '💡', target: 50, desc: 'Jawab benar 50 soal ulangan / titik lemah' },
        { tier: 'EPIC',   name: 'Memori Baja',      icon: '🧠', target: 150, desc: 'Jawab benar 150 soal ulangan / titik lemah' },
        { tier: 'LEGEND', name: 'Pikiran Tanpa Celah', icon: '🔮', target: 350, desc: 'Jawab benar 350 soal ulangan / titik lemah' }
      ]
    },

    // === PILAR 3: EKSPLORASI & KOLEKSI ===
    {
      id: 'dex_completer',
      name: 'Peneliti Monster Dex',
      category: 'EXPLORATION',
      statKey: 'dexDefeated',
      unit: 'monster',
      tiers: [
        { tier: 'COMMON', name: 'Pencatat Alam',    icon: '📖', target: 10, desc: 'Daftarkan 10 jenis monster di Monster Dex' },
        { tier: 'RARE',   name: 'Peneliti Ekosistem', icon: '🔬', target: 20, desc: 'Daftarkan 20 jenis monster di Monster Dex' },
        { tier: 'EPIC',   name: 'Ensiklopedia Hidup', icon: '📜', target: 30, desc: 'Daftarkan 30 jenis monster di Monster Dex' },
        { tier: 'LEGEND', name: 'Arsiparis Sempurna', icon: '📚', target: 40, desc: 'Lengkapi seluruh 40 monster di Monster Dex' }
      ]
    },
    {
      id: 'campaign_pathfinder',
      name: 'Penjelajah Kampanye',
      category: 'EXPLORATION',
      statKey: 'campaignChapters',
      unit: 'node',
      tiers: [
        { tier: 'COMMON', name: 'Langkah Perdana',  icon: '🧭', target: 3, desc: 'Selesaikan 3 stage node kampanye petualangan' },
        { tier: 'RARE',   name: 'Penjelajah Rimba', icon: '🗺️', target: 10, desc: 'Selesaikan 10 stage node kampanye petualangan' },
        { tier: 'EPIC',   name: 'Penakluk Perbatasan', icon: '🏰', target: 25, desc: 'Selesaikan 25 stage node kampanye petualangan' },
        { tier: 'LEGEND', name: 'Pahlawan Dunia',   icon: '🌍', target: 50, desc: 'Selesaikan 50 stage node kampanye petualangan' }
      ]
    },
    {
      id: 'fashion_trendsetter',
      name: 'Ikon Mode & Kostum',
      category: 'EXPLORATION',
      statKey: 'totalSkins',
      unit: 'skin/item',
      tiers: [
        { tier: 'COMMON', name: 'Tampilan Rapi',    icon: '🎩', target: 5, desc: 'Miliki koleksi 5 item busana/kostum avatar' },
        { tier: 'RARE',   name: 'Kolektor Busana',  icon: '👘', target: 15, desc: 'Miliki koleksi 15 item busana/kostum avatar' },
        { tier: 'EPIC',   name: 'Ikon Kemewahan',   icon: '👑', target: 30, desc: 'Miliki koleksi 30 item busana/kostum avatar' },
        { tier: 'LEGEND', name: 'Maharaja Gaya',    icon: '✨', target: 50, desc: 'Miliki koleksi 50 item busana/kostum avatar' }
      ]
    },
    {
      id: 'coin_tycoon',
      name: 'Saudagar Koin Emas',
      category: 'EXPLORATION',
      statKey: 'totalCoinsEarned',
      unit: 'koin',
      tiers: [
        { tier: 'COMMON', name: 'Pundi Pertama',    icon: '🪙', target: 1000, desc: 'Kumpulkan akumulasi total 1.000 Koin' },
        { tier: 'RARE',   name: 'Kantung Tebal',    icon: '💰', target: 7500, desc: 'Kumpulkan akumulasi total 7.500 Koin' },
        { tier: 'EPIC',   name: 'Gudang Harta',     icon: '💎', target: 25000, desc: 'Kumpulkan akumulasi total 25.000 Koin' },
        { tier: 'LEGEND', name: 'Konglomerat Kerajaan', icon: '🏛️', target: 60000, desc: 'Kumpulkan akumulasi total 60.000 Koin' }
      ]
    },

    // === PILAR 4: TAKTIK & SKILL ===
    {
      id: 'skill_strategist',
      name: 'Taktisi Skill Petualang',
      category: 'STRATEGY',
      statKey: 'skillUses',
      unit: 'kali skill',
      tiers: [
        { tier: 'COMMON', name: 'Penyihir Pemula',  icon: '🧪', target: 20, desc: 'Gunakan skill petualang sebanyak 20 kali' },
        { tier: 'RARE',   name: 'Peramu Siasat',    icon: '🧙', target: 100, desc: 'Gunakan skill petualang sebanyak 100 kali' },
        { tier: 'EPIC',   name: 'Jenderal Taktik',  icon: '🔮', target: 300, desc: 'Gunakan skill petualang sebanyak 300 kali' },
        { tier: 'LEGEND', name: 'Archmage Agung',   icon: '🪄', target: 750, desc: 'Gunakan skill petualang sebanyak 750 kali' }
      ]
    },
    {
      id: 'skill_forge_master',
      name: 'Tempaan Skill Maksimal',
      category: 'STRATEGY',
      statKey: 'maxSkillsCount',
      unit: 'skill max',
      tiers: [
        { tier: 'COMMON', name: 'Taktik Teruji',    icon: '⚡', target: 1, desc: 'Tingkatkan 1 skill petualang hingga Level 5' },
        { tier: 'RARE',   name: 'Trio Mematikan',   icon: '🗡️', target: 3, desc: 'Tingkatkan 3 skill petualang hingga Level 5' },
        { tier: 'EPIC',   name: 'Arsenal Sempurna', icon: '⚔️', target: 6, desc: 'Tingkatkan 6 skill petualang hingga Level 5' },
        { tier: 'LEGEND', name: 'Sempurna Paripurna', icon: '🔱', target: 10, desc: 'Tingkatkan seluruh 10 skill petualang hingga Level 5' }
      ]
    },

    // === PILAR 5: KOMPETISI & DEDIKASI ===
    {
      id: 'pvp_gladiator',
      name: 'Jawara Arena Duel',
      category: 'COMPETITION',
      statKey: 'duelWins',
      unit: 'menang duel',
      tiers: [
        { tier: 'COMMON', name: 'Pendekar Arena',   icon: '🤺', target: 5, desc: 'Menangkan 5 duel melawan pemain lain' },
        { tier: 'RARE',   name: 'Ksatria Tanding',  icon: '🛡️', target: 25, desc: 'Menangkan 25 duel melawan pemain lain' },
        { tier: 'EPIC',   name: 'Juara Bertahan',   icon: '🏆', target: 75, desc: 'Menangkan 75 duel melawan pemain lain' },
        { tier: 'LEGEND', name: 'Dewa Gladiator',   icon: '🥇', target: 150, desc: 'Menangkan 150 duel melawan pemain lain' }
      ]
    },
    {
      id: 'unstoppable_duelist',
      name: 'Dominasi Duel Tak Terkalahkan',
      category: 'COMPETITION',
      statKey: 'duelBestStreak',
      unit: 'streak duel',
      tiers: [
        { tier: 'COMMON', name: 'Tiga Langkah',     icon: '⚡', target: 3, desc: 'Capai rekor 3 kemenangan beruntun di arena duel' },
        { tier: 'RARE',   name: 'Pilar Kemenangan', icon: '🔥', target: 6, desc: 'Capai rekor 6 kemenangan beruntun di arena duel' },
        { tier: 'EPIC',   name: 'Sang Dominator',   icon: '💥', target: 10, desc: 'Capai rekor 10 kemenangan beruntun di arena duel' },
        { tier: 'LEGEND', name: 'Maharaja Arena',   icon: '👑', target: 15, desc: 'Capai rekor 15 kemenangan beruntun di arena duel' }
      ]
    },
    {
      id: 'daily_dedication',
      name: 'Disiplin Belajar Harian',
      category: 'COMPETITION',
      statKey: 'dayStreak',
      unit: 'hari',
      tiers: [
        { tier: 'COMMON', name: 'Langkah Istiqomah', icon: '📅', target: 3, desc: 'Pertahankan 3 hari berturut-turut bermain & belajar' },
        { tier: 'RARE',   name: 'Ksatria Tekun',    icon: '🗓️', target: 7, desc: 'Pertahankan 7 hari berturut-turut bermain & belajar' },
        { tier: 'EPIC',   name: 'Disiplin Baja',    icon: '⏳', target: 30, desc: 'Pertahankan 30 hari berturut-turut bermain & belajar' },
        { tier: 'LEGEND', name: 'Kebijaksanaan Abadi', icon: '⌛', target: 100, desc: 'Pertahankan 100 hari berturut-turut bermain & belajar' }
      ]
    },
    {
      id: 'ascendant_level',
      name: 'Puncak Kejayaan Level',
      category: 'COMPETITION',
      statKey: 'level',
      unit: 'level',
      tiers: [
        { tier: 'COMMON', name: 'Ksatria Muda',     icon: '🎖️', target: 5, desc: 'Tingkatkan karakter petualang hingga Level 5' },
        { tier: 'RARE',   name: 'Petualang Ulung',  icon: '🏅', target: 10, desc: 'Tingkatkan karakter petualang hingga Level 10' },
        { tier: 'EPIC',   name: 'Komandan Medan',   icon: '🥇', target: 15, desc: 'Tingkatkan karakter petualang hingga Level 15' },
        { tier: 'LEGEND', name: 'Puncak Keagungan', icon: '👑', target: 20, desc: 'Capai Level 20 (Level Maksimum Cap)' }
      ]
    }
  ];

  /**
   * Evaluasi seluruh 20 kategori lencana berdasarkan statistik pemain
   * @param {Object} stats - Kamus statistik pemain
   * @returns {Object} Hasil evaluasi berisi totalUnlocked, families, unlockedList
   */
  function evaluateBadges(stats) {
    const s = stats || {};
    let totalUnlocked = 0;
    const totalBadges = BADGE_FAMILIES.length * 4; // 80 lencana
    const unlockedList = [];

    const evaluatedFamilies = BADGE_FAMILIES.map(family => {
      const currentVal = Number(s[family.statKey] || 0);
      let familyUnlockedCount = 0;
      let highestTier = null;

      const tiersEvaluated = family.tiers.map((tInfo, idx) => {
        const isUnlocked = currentVal >= tInfo.target;
        if (isUnlocked) {
          familyUnlockedCount++;
          highestTier = tInfo.tier;
          totalUnlocked++;
          unlockedList.push({
            id: `${family.id}_${tInfo.tier.toLowerCase()}`,
            familyId: family.id,
            familyName: family.name,
            tier: tInfo.tier,
            name: tInfo.name,
            icon: tInfo.icon,
            desc: tInfo.desc,
            target: tInfo.target,
            current: currentVal,
            category: family.category,
            tierInfo: TIERS[tInfo.tier]
          });
        }
        const pct = Math.min(100, Math.round((currentVal / tInfo.target) * 100));
        return {
          ...tInfo,
          unlocked: isUnlocked,
          current: currentVal,
          pct,
          tierInfo: TIERS[tInfo.tier]
        };
      });

      return {
        id: family.id,
        name: family.name,
        category: family.category,
        statKey: family.statKey,
        unit: family.unit,
        current: currentVal,
        unlockedCount: familyUnlockedCount,
        highestTier,
        highestTierInfo: highestTier ? TIERS[highestTier] : null,
        tiers: tiersEvaluated
      };
    });

    return {
      totalUnlocked,
      totalBadges,
      families: evaluatedFamilies,
      unlockedList
    };
  }

  return {
    TIERS,
    TIER_ORDER,
    CATEGORIES,
    BADGE_FAMILIES,
    evaluateBadges
  };
}));
