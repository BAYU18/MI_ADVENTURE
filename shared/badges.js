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
        { tier: 'COMMON', name: 'Pembasmi Pemula', icon: '⚔️', target: 3, desc: 'Kalahkan 3 monster bos petualangan', lore: "Pengalaman tempur pertama membersihkan ancaman di sekitar desa.", reward: "+15 Koin, +15 XP." },
        { tier: 'RARE',   name: 'Pemburu Rimba',   icon: '🗡️', target: 12, desc: 'Kalahkan 12 monster bos petualangan', lore: "Langkah mantap menembus belantara dan menumbangkan puluhan monster tangguh.", reward: "+45 Koin, +45 XP." },
        { tier: 'EPIC',   name: 'Pahlawan Penakluk', icon: '🛡️', target: 50, desc: 'Kalahkan 50 monster bos petualangan', lore: "Nama Anda tersohor di seantero negeri sebagai penumpas monster sejati.", reward: "+150 Koin, +120 XP." },
        { tier: 'LEGEND', name: 'Dewa Penguasa Alam', icon: '👑', target: 125, desc: 'Kalahkan 125 monster bos petualangan', lore: "Tak ada monster yang tak gentar mendengar langkah kaki sang legenda penakluk.", reward: "+450 Koin, +300 XP, Gelar Spesial: *Sang Penakluk Alam*." }
      ]
    },
    {
      id: 'brutal_conqueror',
      name: 'Penakluk Mode Brutal',
      category: 'BATTLE',
      statKey: 'brutalWins',
      unit: 'menang brutal',
      tiers: [
        { tier: 'COMMON', name: 'Penantang Bahaya', icon: '💀', target: 2, desc: 'Menangkan 2 pertempuran dalam mode Brutal', lore: "Berani melangkah ke wilayah terlarang dengan risiko damage ganda.", reward: "+30 Koin, +30 XP." },
        { tier: 'RARE',   name: 'Prajurit Baja',   icon: '🩸', target: 8, desc: 'Menangkan 8 pertempuran dalam mode Brutal', lore: "Terbiasa bertarung di bawah tekanan ekstrem dan serangan mematikan.", reward: "+105 Koin, +90 XP." },
        { tier: 'EPIC',   name: 'Penyintas Neraka', icon: '🔥', target: 20, desc: 'Menangkan 20 pertempuran dalam mode Brutal', lore: "Menakluk tantangan tersulit dengan ketabahan dan refleks baja.", reward: "+270 Koin, +240 XP." },
        { tier: 'LEGEND', name: 'Panglima Brutal',  icon: '👹', target: 40, desc: 'Menangkan 40 pertempuran dalam mode Brutal', lore: "Mengukir legenda di medan laga tersadis tanpa pernah mundur selangkah pun.", reward: "+900 Koin, +600 XP, Gelar Merah Menyala: *Sang Jagal Brutal*." }
      ]
    },
    {
      id: 'mythic_hunter',
      name: 'Pembasmi Bos Legend',
      category: 'BATTLE',
      statKey: 'legendWins',
      unit: 'bos legend',
      tiers: [
        { tier: 'COMMON', name: 'Saksi Sang Mitos', icon: '🐉', target: 1, desc: 'Kalahkan 1 monster bos bertier Legend', lore: "Menatap mata naga legendaris dan keluar sebagai pemenang.", reward: "+45 Koin, +45 XP." },
        { tier: 'RARE',   name: 'Penjinak Purba',  icon: '🐲', target: 3, desc: 'Kalahkan 3 monster bos bertier Legend', lore: "Binatang mitologi kuno bertekuk lutut di hadapan kecerdasan Anda.", reward: "+135 Koin, +120 XP." },
        { tier: 'EPIC',   name: 'Penghancur Legenda', icon: '✨', target: 8, desc: 'Kalahkan 8 monster bos bertier Legend', lore: "Pemburu elit yang ditugaskan khusus membasmi ancaman tingkat kiamat.", reward: "+360 Koin, +300 XP." },
        { tier: 'LEGEND', name: 'Pembasmi Dewa',   icon: '🌌', target: 18, desc: 'Kalahkan 18 monster bos bertier Legend', lore: "Mahkluk terkuat di alam semesta tunduk di bawah telapak kaki Anda.", reward: "+1.050 Koin, +750 XP, Senjata Kosmetik: *Pedang Bintang Penumpas Dewa*." }
      ]
    },
    {
      id: 'elemental_master',
      name: 'Penguasa 10 Elemen',
      category: 'BATTLE',
      statKey: 'elementsDefeated',
      unit: 'elemen',
      tiers: [
        { tier: 'COMMON', name: 'Murid Alam',       icon: '🌱', target: 2, desc: 'Kalahkan bos dari minimal 2 elemen berbeda', lore: "Memahami siklus kelemahan dan kekuatan dasar seluruh elemen alam.", reward: "+30 Koin, +30 XP." },
        { tier: 'RARE',   name: 'Pawang Elemen',    icon: '🌊', target: 4, desc: 'Kalahkan bos dari minimal 4 elemen berbeda', lore: "Mampu beradaptasi secara mulus di segala medan iklim dan cuaca magis.", reward: "+105 Koin, +90 XP." },
        { tier: 'EPIC',   name: 'Penguasa Primordial', icon: '⚡', target: 7, desc: 'Kalahkan bos dari minimal 7 elemen berbeda', lore: "Memanipulasi aliran energi alam untuk menghancurkan pertahanan lawan.", reward: "+300 Koin, +240 XP." },
        { tier: 'LEGEND', name: 'Avatar Kosmik',    icon: '🪐', target: 10, desc: 'Kalahkan bos dari seluruh 10 elemen alam', lore: "Keselarasan total dengan semesta; pengendali sejati seluruh elemen kehidupan.", reward: "+900 Koin, +600 XP, Background Profil: *Alam Semesta Primordial*." }
      ]
    },
    {
      id: 'survivor_last_stand',
      name: 'Penyintas Hati Phoenix',
      category: 'BATTLE',
      statKey: 'lowHpWins',
      unit: 'menang kritis',
      tiers: [
        { tier: 'COMMON', name: 'Goresan Berani',   icon: '❤️‍🩹', target: 2, desc: 'Menangkan 2 laga dengan sisa darah <= 20% HP', lore: "Bertahan hidup di ujung tanduk dan mencetak serangan pembalikan.", reward: "+21 Koin, +21 XP." },
        { tier: 'RARE',   name: 'Tahan Banting',    icon: '❤️‍🔥', target: 5, desc: 'Menangkan 5 laga dengan sisa darah <= 20% HP', lore: "Pantang menyerah walau darah menetes deras; mental juara sejati.", reward: "+66 Koin, +66 XP." },
        { tier: 'EPIC',   name: 'Kebangkitan Ajaib', icon: '🕊️', target: 12, desc: 'Menangkan 12 laga dengan sisa darah <= 15% HP', lore: "Mukjizat kemenangan di saat semua orang mengira Anda akan kalah.", reward: "+195 Koin, +165 XP." },
        { tier: 'LEGEND', name: 'Sayap Phoenix',    icon: '🦅', target: 25, desc: 'Menangkan 25 laga mengalahkan ambang kematian', lore: "Bangkit dari abu kekalahan bagai burung Phoenix abadi yang tak bisa mati.", reward: "+660 Koin, +450 XP, Pet Eksklusif: *Bayi Burung Phoenix*." }
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
        { tier: 'COMMON', name: 'Percikan Fokus',   icon: '🔥', target: 4, desc: 'Capai rekor 4x kombo jawaban benar beruntun', lore: "Fokus pikiran yang mulai menyala tanpa keraguan.", reward: "+15 Koin, +15 XP." },
        { tier: 'RARE',   name: 'Irama Badai',      icon: '⚡', target: 8, desc: 'Capai rekor 8x kombo jawaban benar beruntun', lore: "Rentetan jawaban cepat mengalir bagai badai yang menerpa tanpa henti.", reward: "+45 Koin, +45 XP." },
        { tier: 'EPIC',   name: 'Kilat Presisi',    icon: '💥', target: 12, desc: 'Capai rekor 12x kombo jawaban benar beruntun', lore: "Ketepatan berpikir setajam kilat petir, mengeliminasi segala keraguan.", reward: "+135 Koin, +120 XP." },
        { tier: 'LEGEND', name: 'Zen Tak Terpatahkan', icon: '🧘', target: 16, desc: 'Capai rekor 16x kombo jawaban benar beruntun', lore: "Keheningan batin tingkat dewa di mana setiap teka-teki terjawab seketika tanpa cela.", reward: "+360 Koin, +300 XP, Gelar: *Pikiran Tak Terpatahkan*." }
      ]
    },
    {
      id: 'flawless_victory',
      name: 'Kemenangan Sempurna',
      category: 'MASTERY',
      statKey: 'flawlessWins',
      unit: 'laga 100%',
      tiers: [
        { tier: 'COMMON', name: 'Pukulan Murni',    icon: '🎯', target: 2, desc: 'Menangkan 2 laga dengan akurasi mutlak 100%', lore: "Laga tuntas tanpa satu pun goresan jawaban keliru.", reward: "+23 Koin, +23 XP." },
        { tier: 'RARE',   name: 'Eksekusi Bersih',  icon: '🏹', target: 8, desc: 'Menangkan 8 laga dengan akurasi mutlak 100%', lore: "Ketelitian teruji berkali-kali menghadapi berbagai variasi ujian.", reward: "+75 Koin, +75 XP." },
        { tier: 'EPIC',   name: 'Harmoni Absolut',  icon: '💎', target: 25, desc: 'Menangkan 25 laga dengan akurasi mutlak 100%', lore: "Simfoni kecerdasan di mana setiap strategi dijalankan secara tanpa cacat.", reward: "+225 Koin, +180 XP." },
        { tier: 'LEGEND', name: 'Mahakarya Sempurna', icon: '🌟', target: 50, desc: 'Menangkan 50 laga dengan akurasi mutlak 100%', lore: "Bukti supremasi intelektual yang tak pernah goyah di hadapan monster manapun.", reward: "+750 Koin, +450 XP, Aksesori Sayap: *Wing of Flawless Light*." }
      ]
    },
    {
      id: 'star_collector',
      name: 'Pengoleksi Bintang',
      category: 'MASTERY',
      statKey: 'stars',
      unit: 'bintang',
      tiers: [
        { tier: 'COMMON', name: 'Bintang Fajar',    icon: '⭐', target: 15, desc: 'Kumpulkan akumulasi 15 Bintang kemenangan', lore: "Kilau fajar pertama dari performa tempur yang rapi.", reward: "+15 Koin, +15 XP." },
        { tier: 'RARE',   name: 'Konstelasi Terang', icon: '🌠', target: 75, desc: 'Kumpulkan akumulasi 75 Bintang kemenangan', lore: "Ratusan bintang membentuk rasi gemerlap di langit malam prestasi Anda.", reward: "+60 Koin, +60 XP." },
        { tier: 'EPIC',   name: 'Galaksi Gemilang', icon: '🌌', target: 225, desc: 'Kumpulkan akumulasi 225 Bintang kemenangan', lore: "Gugusan ratusan bintang emas membuktikan konsistensi performa luar biasa.", reward: "+180 Koin, +150 XP." },
        { tier: 'LEGEND', name: 'Supernova Abadi',  icon: '✨', target: 375, desc: 'Kumpulkan akumulasi 375 Bintang kemenangan', lore: "Puncak kesempurnaan bintang yang bersinar abadi menerangi dunia.", reward: "+600 Koin, +360 XP, Bingkai Avatar Eksklusif: *Frame Bintang Supernova*." }
      ]
    },
    {
      id: 'critical_reflexes',
      name: 'Refleks Cepat Kritis',
      category: 'MASTERY',
      statKey: 'criticalCount',
      unit: 'kritis',
      tiers: [
        { tier: 'COMMON', name: 'Refleks Kilat',    icon: '⚡', target: 15, desc: 'Cetak 15 jawaban kilat berstatus Kritis', lore: "Menjawab cepat dan tepat dalam hitungan detik pertama.", reward: "+18 Koin, +18 XP." },
        { tier: 'RARE',   name: 'Serangan Halilintar', icon: '🌩️', target: 60, desc: 'Cetak 60 jawaban kilat berstatus Kritis', lore: "Waktu reaksi yang membuat lawan tak sempat menyiapkan pertahanan.", reward: "+60 Koin, +60 XP." },
        { tier: 'EPIC',   name: 'Dentuman Cahaya',  icon: '☄️', target: 175, desc: 'Cetak 175 jawaban kilat berstatus Kritis', lore: "Pikiran gesit melesat melampaui kedipan mata.", reward: "+180 Koin, +150 XP." },
        { tier: 'LEGEND', name: 'Kecepatan Suara',  icon: '🚀', target: 400, desc: 'Cetak 400 jawaban kilat berstatus Kritis', lore: "Penguasaan total atas waktu; berpikir lebih cepat daripada kilat menyambar.", reward: "+600 Koin, +450 XP, Gelar: *Sang Kilat Petir*." }
      ]
    },
    {
      id: 'spaced_repetition',
      name: 'Penakluk Titik Lemah',
      category: 'MASTERY',
      statKey: 'reviewsMastered',
      unit: 'soal review',
      tiers: [
        { tier: 'COMMON', name: 'Koreksi Cermat',   icon: '📝', target: 8, desc: 'Jawab benar 8 soal ulangan / titik lemah', lore: "Mengubah kesalahan masa lalu menjadi batu loncatan pemahaman.", reward: "+18 Koin, +18 XP." },
        { tier: 'RARE',   name: 'Pembalik Kelemahan', icon: '💡', target: 25, desc: 'Jawab benar 25 soal ulangan / titik lemah', lore: "Soal-soal yang dulu sulit kini dijawab dengan senyuman santai.", reward: "+60 Koin, +60 XP." },
        { tier: 'EPIC',   name: 'Memori Baja',      icon: '🧠', target: 75, desc: 'Jawab benar 75 soal ulangan / titik lemah', lore: "Ingatan jangka panjang yang tertata rapi berkat ulangan berkala.", reward: "+180 Koin, +150 XP." },
        { tier: 'LEGEND', name: 'Pikiran Tanpa Celah', icon: '🔮', target: 175, desc: 'Jawab benar 175 soal ulangan / titik lemah', lore: "Tidak ada celah kelemahan yang tersisa di seluruh bidang mata pelajaran.", reward: "+540 Koin, +360 XP, Gelar: *Sang Cendekia Paripurna*." }
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
        { tier: 'COMMON', name: 'Pencatat Alam',    icon: '📖', target: 5, desc: 'Daftarkan 5 jenis monster di Monster Dex', lore: "Membuka lembaran awal ensiklopedia satwa magis.", reward: "+18 Koin, +18 XP." },
        { tier: 'RARE',   name: 'Peneliti Ekosistem', icon: '🔬', target: 10, desc: 'Daftarkan 10 jenis monster di Monster Dex', lore: "Mengenali anatomi, kelemahan, dan habitat separuh monster di dunia.", reward: "+60 Koin, +60 XP." },
        { tier: 'EPIC',   name: 'Ensiklopedia Hidup', icon: '📜', target: 15, desc: 'Daftarkan 15 jenis monster di Monster Dex', lore: "Menjadi rujukan utama para petualang dalam meneliti monster buas.", reward: "+180 Koin, +150 XP." },
        { tier: 'LEGEND', name: 'Arsiparis Sempurna', icon: '📚', target: 20, desc: 'Daftarkan 20 jenis monster di Monster Dex', lore: "Menguasai taksonomi monster dari berbagai elemen dan tier langka.", reward: "+600 Koin, +450 XP, Gelar Legendaris: *Grandmaster Dex*." }
      ]
    },
    {
      id: 'campaign_pathfinder',
      name: 'Penjelajah Kampanye',
      category: 'EXPLORATION',
      statKey: 'campaignChapters',
      unit: 'node',
      tiers: [
        { tier: 'COMMON', name: 'Langkah Perdana',  icon: '🧭', target: 2, desc: 'Selesaikan 2 stage node kampanye petualangan', lore: "Memulai perjalanan dengan menembus gerbang hutan misterius.", reward: "+24 Koin, +24 XP." },
        { tier: 'RARE',   name: 'Penjelajah Rimba', icon: '🗺️', target: 5, desc: 'Selesaikan 5 stage node kampanye petualangan', lore: "Menaklukkan rimba, gurun pasir, dan badai salju abadi.", reward: "+75 Koin, +75 XP." },
        { tier: 'EPIC',   name: 'Penakluk Perbatasan', icon: '🏰', target: 12, desc: 'Selesaikan 12 stage node kampanye petualangan', lore: "Menembus wilayah paling gelap dan mengungkap rahasia peradaban kuno.", reward: "+210 Koin, +180 XP." },
        { tier: 'LEGEND', name: 'Pahlawan Dunia',   icon: '🌍', target: 25, desc: 'Selesaikan 25 stage node kampanye petualangan', lore: "Menyelesaikan seluruh narasi epik dan mengembalikan kedamaian negeri.", reward: "+660 Koin, +450 XP, Pet Eksklusif: *Anak Naga Langit*." }
      ]
    },
    {
      id: 'fashion_trendsetter',
      name: 'Ikon Mode & Kostum',
      category: 'EXPLORATION',
      statKey: 'totalSkins',
      unit: 'skin/item',
      tiers: [
        { tier: 'COMMON', name: 'Tampilan Rapi',    icon: '🎩', target: 3, desc: 'Miliki koleksi 3 item busana/kostum avatar', lore: "Menyesuaikan gaya pakaian petualang agar tampil beda.", reward: "+15 Koin, +15 XP." },
        { tier: 'RARE',   name: 'Kolektor Busana',  icon: '👘', target: 8, desc: 'Miliki koleksi 8 item busana/kostum avatar', lore: "Lemari pakaian penuh dengan jubah, mahkota, dan senjata pilihan.", reward: "+60 Koin, +60 XP." },
        { tier: 'EPIC',   name: 'Ikon Kemewahan',   icon: '👑', target: 15, desc: 'Miliki koleksi 15 item busana/kostum avatar', lore: "Penampilan glamor yang selalu mencuri perhatian di lobi petualangan.", reward: "+195 Koin, +165 XP." },
        { tier: 'LEGEND', name: 'Maharaja Gaya',    icon: '✨', target: 25, desc: 'Miliki koleksi 25 item busana/kostum avatar', lore: "Pesona legenda sejati dengan busana kerajaan bertaraf dewa.", reward: "+600 Koin, +450 XP, Kostum Jubah: *Jubah Galaksi Spektrum*." }
      ]
    },
    {
      id: 'coin_tycoon',
      name: 'Saudagar Koin Emas',
      category: 'EXPLORATION',
      statKey: 'totalCoinsEarned',
      unit: 'koin',
      tiers: [
        { tier: 'COMMON', name: 'Pundi Pertama',    icon: '🪙', target: 500, desc: 'Kumpulkan akumulasi total 500 Koin', lore: "Hasil keringat pertama dari pertempuran dan penyelesaian misi.", reward: "+30 XP." },
        { tier: 'RARE',   name: 'Kantung Tebal',    icon: '💰', target: 3500, desc: 'Kumpulkan akumulasi total 3.500 Koin', lore: "Mampu memborong perlengkapan dan ramuan terbaik di toko desa.", reward: "+90 XP." },
        { tier: 'EPIC',   name: 'Gudang Harta',     icon: '💎', target: 12500, desc: 'Kumpulkan akumulasi total 12.500 Koin', lore: "Peti besi penuh berkilau dengan kepingan emas murni hasil kemenangan.", reward: "+240 XP." },
        { tier: 'LEGEND', name: 'Konglomerat Kerajaan', icon: '🏛️', target: 30000, desc: 'Kumpulkan akumulasi total 30.000 Koin', lore: "Kekayaan melimpah ruah yang mampu mendanai ekspedisi seluruh kerajaan.", reward: "+600 XP, Gelar Bertabur Emas: *Saudagar Legendaris*." }
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
        { tier: 'COMMON', name: 'Penyihir Pemula',  icon: '🧪', target: 10, desc: 'Gunakan skill petualang sebanyak 10 kali', lore: "Memadukan mantra penyembuh dan serangan kekuatan di saat genting.", reward: "+15 Koin, +15 XP." },
        { tier: 'RARE',   name: 'Peramu Siasat',    icon: '🧙', target: 50, desc: 'Gunakan skill petualang sebanyak 50 kali', lore: "Memanfaatkan energi secara efisien untuk membalikkan alur pertarungan.", reward: "+54 Koin, +54 XP." },
        { tier: 'EPIC',   name: 'Jenderal Taktik',  icon: '🔮', target: 150, desc: 'Gunakan skill petualang sebanyak 150 kali', lore: "Setiap aktivasi skill adalah langkah skakmat yang mematikan bagi bos.", reward: "+150 Koin, +135 XP." },
        { tier: 'LEGEND', name: 'Archmage Agung',   icon: '🪄', target: 375, desc: 'Gunakan skill petualang sebanyak 375 kali', lore: "Gudang sihir tak bertepi yang mengorkestrasi medan tempur bagai panggung seni.", reward: "+540 Koin, +360 XP, Mahkota Kosmetik: *Tiara Kristal Archmage*." }
      ]
    },
    {
      id: 'skill_forge_master',
      name: 'Tempaan Skill Maksimal',
      category: 'STRATEGY',
      statKey: 'maxSkillsCount',
      unit: 'skill max',
      tiers: [
        { tier: 'COMMON', name: 'Taktik Teruji',    icon: '⚡', target: 1, desc: 'Tingkatkan 1 skill petualang hingga Level 5', lore: "Satu jurus andalan yang diasah hingga mencapai potensi puncak.", reward: "+30 Koin, +30 XP." },
        { tier: 'RARE',   name: 'Trio Mematikan',   icon: '🗡️', target: 2, desc: 'Tingkatkan 2 skill petualang hingga Level 5', lore: "Kombinasi dua pilar kemampuan yang siap menghadapi skenario apapun.", reward: "+90 Koin, +90 XP." },
        { tier: 'EPIC',   name: 'Arsenal Sempurna', icon: '⚔️', target: 3, desc: 'Tingkatkan 3 skill petualang hingga Level 5', lore: "Fleksibilitas tinggi dalam merancang loadout skill tempur.", reward: "+240 Koin, +210 XP." },
        { tier: 'LEGEND', name: 'Sempurna Paripurna', icon: '🔱', target: 5, desc: 'Tingkatkan 5 skill petualang hingga Level 5', lore: "Penguasaan mendalam atas berbagai taktik yang pernah diciptakan di dunia game.", reward: "+750 Koin, +600 XP, Petualang Skin: *Jubah Grandmaster Taktik*." }
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
        { tier: 'COMMON', name: 'Pendekar Arena',   icon: '🤺', target: 3, desc: 'Menangkan 3 duel melawan pemain lain', lore: "Menorehkan nama di arena pertarungan antar-petualang.", reward: "+24 Koin, +24 XP." },
        { tier: 'RARE',   name: 'Ksatria Tanding',  icon: '🛡️', target: 12, desc: 'Menangkan 12 duel melawan pemain lain', lore: "Lawan tangguh yang dihormati di setiap gelanggang pertarungan.", reward: "+75 Koin, +75 XP." },
        { tier: 'EPIC',   name: 'Juara Bertahan',   icon: '🏆', target: 35, desc: 'Menangkan 35 duel melawan pemain lain', lore: "Merajai ring duel dengan strategi dan kecepatan yang memukau penonton.", reward: "+225 Koin, +180 XP." },
        { tier: 'LEGEND', name: 'Dewa Gladiator',   icon: '🥇', target: 75, desc: 'Menangkan 75 duel melawan pemain lain', lore: "Sang legenda hidup yang tak terkalahkan di panggung pertarungan akbar.", reward: "+750 Koin, +540 XP, Gelar Emas: *Gladiator Tak Tertandingi*." }
      ]
    },
    {
      id: 'unstoppable_duelist',
      name: 'Dominasi Duel Tak Terkalahkan',
      category: 'COMPETITION',
      statKey: 'duelBestStreak',
      unit: 'streak duel',
      tiers: [
        { tier: 'COMMON', name: 'Tiga Langkah',     icon: '⚡', target: 2, desc: 'Capai rekor 2 kemenangan beruntun di arena duel', lore: "Permulaan manis tanpa kekalahan di gelanggang arena.", reward: "+24 Koin, +24 XP." },
        { tier: 'RARE',   name: 'Pilar Kemenangan', icon: '🔥', target: 3, desc: 'Capai rekor 3 kemenangan beruntun di arena duel', lore: "Tiga penantang datang, tiga penantang pulang tertunduk.", reward: "+75 Koin, +75 XP." },
        { tier: 'EPIC',   name: 'Sang Dominator',   icon: '💥', target: 5, desc: 'Capai rekor 5 kemenangan beruntun di arena duel', lore: "Dominasi mutlak di mana tak ada pemain yang mampu mematahkan laju Anda.", reward: "+210 Koin, +180 XP." },
        { tier: 'LEGEND', name: 'Maharaja Arena',   icon: '👑', target: 8, desc: 'Capai rekor 8 kemenangan beruntun di arena duel', lore: "Rekor legendaris yang akan terukir di tugu kehormatan arena selamanya.", reward: "+660 Koin, +450 XP, Efek Aura Karakter: *Aura Kemenangan Emas*." }
      ]
    },
    {
      id: 'daily_dedication',
      name: 'Disiplin Belajar Harian',
      category: 'COMPETITION',
      statKey: 'dayStreak',
      unit: 'hari',
      tiers: [
        { tier: 'COMMON', name: 'Langkah Istiqomah', icon: '📅', target: 2, desc: 'Pertahankan 2 hari berturut-turut bermain & belajar', lore: "Membangun kebiasaan positif yang konsisten setiap hari.", reward: "+15 Koin, +15 XP." },
        { tier: 'RARE',   name: 'Ksatria Tekun',    icon: '🗓️', target: 4, desc: 'Pertahankan 4 hari berturut-turut bermain & belajar', lore: "Empat hari penuh dedikasi tanpa pernah melewatkan latihan.", reward: "+45 Koin, +45 XP." },
        { tier: 'EPIC',   name: 'Disiplin Baja',    icon: '⏳', target: 15, desc: 'Pertahankan 15 hari berturut-turut bermain & belajar', lore: "Dua pekan lebih komitmen tanpa cela; belajar telah menjadi denyut nadi Anda.", reward: "+180 Koin, +150 XP." },
        { tier: 'LEGEND', name: 'Kebijaksanaan Abadi', icon: '⌛', target: 50, desc: 'Pertahankan 50 hari berturut-turut bermain & belajar', lore: "Monumen ketekunan dan kesabaran yang menginspirasi seluruh petualang.", reward: "+750 Koin, +600 XP, Frame Avatar: *Cincin Waktu Abadi*." }
      ]
    },
    {
      id: 'ascendant_level',
      name: 'Puncak Kejayaan Level',
      category: 'COMPETITION',
      statKey: 'level',
      unit: 'level',
      tiers: [
        { tier: 'COMMON', name: 'Ksatria Muda',     icon: '🎖️', target: 3, desc: 'Tingkatkan karakter petualang hingga Level 3', lore: "Lulus dari masa pemula dan membuka akses skill Ramuan Merah.", reward: "+30 Koin, +30 XP." },
        { tier: 'RARE',   name: 'Petualang Ulung',  icon: '🏅', target: 6, desc: 'Tingkatkan karakter petualang hingga Level 6', lore: "Kekuatan dan kapasitas energi berkembang pesat (Kapasitas Energi 7⚡).", reward: "+90 Koin, +90 XP." },
        { tier: 'EPIC',   name: 'Komandan Medan',   icon: '🥇', target: 10, desc: 'Tingkatkan karakter petualang hingga Level 10', lore: "Menjadi panutan bagi seluruh murid dan petualang muda di sekolah.", reward: "+240 Koin, +210 XP." },
        { tier: 'LEGEND', name: 'Puncak Keagungan', icon: '👑', target: 15, desc: 'Tingkatkan karakter petualang hingga Level 15 (Level Master)', lore: "Mencapai pencapaian tinggi kemampuan; legenda tersohor MI Adventure.", reward: "+900 Koin, +750 XP, Gelar Plafon Tertinggi: *Sang Juara Agung*." }
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
            lore: tInfo.lore || "",
            reward: tInfo.reward || "",
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

  /**
   * Ekstraksi objek hadiah terstruktur (koin, xp, item eksklusif, gelar) dari badge ID
   * @param {string} badgeId - format: <familyId>_<common|rare|epic|legend>
   * @returns {Object|null} Objek hadiah terstruktur
   */
  function parseBadgeReward(badgeId) {
    if (!badgeId || typeof badgeId !== 'string') return null;
    const match = /^(.*)_(common|rare|epic|legend)$/i.exec(badgeId);
    if (!match) return null;
    const famId = match[1];
    const tierCode = match[2].toUpperCase();
    const fam = BADGE_FAMILIES.find(f => f.id === famId);
    if (!fam) return null;
    const tierObj = fam.tiers.find(t => t.tier === tierCode);
    if (!tierObj) return null;

    const rewardStr = tierObj.reward || '';
    const reCoin = /\+([\d\.]+)\s*koin/i;
    const reXp = /\+([\d\.]+)\s*xp/i;
    const cMatch = reCoin.exec(rewardStr);
    const xMatch = reXp.exec(rewardStr);
    const coins = cMatch ? parseInt(cMatch[1].replace(/\./g, ''), 10) : 0;
    const xp = xMatch ? parseInt(xMatch[1].replace(/\./g, ''), 10) : 0;

    let itemId = null;
    if (badgeId === 'campaign_pathfinder_legend') itemId = 'pet_dragon';
    else if (badgeId === 'survivor_last_stand_legend') itemId = 'pet_phoenix';
    else if (badgeId === 'star_collector_legend') itemId = 'frame_supernova';

    let title = null;
    const titleMatch = /\*([^*]+)\*/.exec(rewardStr);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    return {
      badgeId,
      familyId: famId,
      tier: tierCode,
      badgeName: tierObj.name,
      icon: tierObj.icon,
      rewardText: rewardStr,
      coins,
      xp,
      itemId,
      title
    };
  }

  return {
    TIERS,
    TIER_ORDER,
    CATEGORIES,
    BADGE_FAMILIES,
    evaluateBadges,
    parseBadgeReward
  };
}));
