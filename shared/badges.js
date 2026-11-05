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
        { tier: 'COMMON', name: 'Pembasmi Pemula', icon: '⚔️', target: 5, desc: 'Kalahkan 5 monster bos petualangan', lore: "Pengalaman tempur pertama membersihkan ancaman di sekitar desa.", reward: "+50 Koin, +50 XP." },
        { tier: 'RARE',   name: 'Pemburu Rimba',   icon: '🗡️', target: 25, desc: 'Kalahkan 25 monster bos petualangan', lore: "Langkah mantap menembus belantara dan menumbangkan puluhan monster tangguh.", reward: "+150 Koin, +150 XP." },
        { tier: 'EPIC',   name: 'Pahlawan Penakluk', icon: '🛡️', target: 100, desc: 'Kalahkan 100 monster bos petualangan', lore: "Nama Anda tersohor di seantero negeri sebagai penumpas monster sejati.", reward: "+500 Koin, +400 XP." },
        { tier: 'LEGEND', name: 'Dewa Penguasa Alam', icon: '👑', target: 250, desc: 'Kalahkan 250 monster bos petualangan', lore: "Tak ada monster yang tak gentar mendengar langkah kaki sang legenda penakluk.", reward: "+1.500 Koin, +1.000 XP, Gelar Spesial: *Sang Penakluk Alam*." }
      ]
    },
    {
      id: 'brutal_conqueror',
      name: 'Penakluk Mode Brutal',
      category: 'BATTLE',
      statKey: 'brutalWins',
      unit: 'menang brutal',
      tiers: [
        { tier: 'COMMON', name: 'Penantang Bahaya', icon: '💀', target: 3, desc: 'Menangkan 3 pertempuran dalam mode Brutal', lore: "Berani melangkah ke wilayah terlarang dengan risiko damage ganda.", reward: "+100 Koin, +100 XP." },
        { tier: 'RARE',   name: 'Prajurit Baja',   icon: '🩸', target: 15, desc: 'Menangkan 15 pertempuran dalam mode Brutal', lore: "Terbiasa bertarung di bawah tekanan ekstrem dan serangan mematikan.", reward: "+350 Koin, +300 XP." },
        { tier: 'EPIC',   name: 'Penyintas Neraka', icon: '🔥', target: 40, desc: 'Menangkan 40 pertempuran dalam mode Brutal', lore: "Menakluk tantangan tersulit dengan ketabahan dan refleks baja.", reward: "+900 Koin, +800 XP." },
        { tier: 'LEGEND', name: 'Panglima Brutal',  icon: '👹', target: 80, desc: 'Menangkan 80 pertempuran dalam mode Brutal', lore: "Mengukir legenda di medan laga tersadis tanpa pernah mundur selangkah pun.", reward: "+3.000 Koin, +2.000 XP, Gelar Merah Menyala: *Sang Jagal Brutal*." }
      ]
    },
    {
      id: 'mythic_hunter',
      name: 'Pembasmi Bos Legend',
      category: 'BATTLE',
      statKey: 'legendWins',
      unit: 'bos legend',
      tiers: [
        { tier: 'COMMON', name: 'Saksi Sang Mitos', icon: '🐉', target: 1, desc: 'Kalahkan 1 monster bos bertier Legend', lore: "Menatap mata naga legendaris dan keluar sebagai pemenang.", reward: "+150 Koin, +150 XP." },
        { tier: 'RARE',   name: 'Penjinak Purba',  icon: '🐲', target: 5, desc: 'Kalahkan 5 monster bos bertier Legend', lore: "Binatang mitologi kuno bertekuk lutut di hadapan kecerdasan Anda.", reward: "+450 Koin, +400 XP." },
        { tier: 'EPIC',   name: 'Penghancur Legenda', icon: '✨', target: 15, desc: 'Kalahkan 15 monster bos bertier Legend', lore: "Pemburu elit yang ditugaskan khusus membasmi ancaman tingkat kiamat.", reward: "+1.200 Koin, +1.000 XP." },
        { tier: 'LEGEND', name: 'Pembasmi Dewa',   icon: '🌌', target: 35, desc: 'Kalahkan 35 monster bos bertier Legend', lore: "Mahkluk terkuat di alam semesta tunduk di bawah telapak kaki Anda.", reward: "+3.500 Koin, +2.500 XP, Senjata Kosmetik: *Pedang Bintang Penumpas Dewa*." }
      ]
    },
    {
      id: 'elemental_master',
      name: 'Penguasa 10 Elemen',
      category: 'BATTLE',
      statKey: 'elementsDefeated',
      unit: 'elemen',
      tiers: [
        { tier: 'COMMON', name: 'Murid Alam',       icon: '🌱', target: 3, desc: 'Kalahkan bos dari minimal 3 elemen berbeda', lore: "Memahami siklus kelemahan dan kekuatan dasar seluruh elemen alam.", reward: "+100 Koin, +100 XP." },
        { tier: 'RARE',   name: 'Pawang Elemen',    icon: '🌊', target: 6, desc: 'Kalahkan bos dari minimal 6 elemen berbeda', lore: "Mampu beradaptasi secara mulus di segala medan iklim dan cuaca magis.", reward: "+350 Koin, +300 XP." },
        { tier: 'EPIC',   name: 'Penguasa Primordial', icon: '⚡', target: 9, desc: 'Kalahkan bos dari minimal 9 elemen berbeda', lore: "Memanipulasi aliran energi alam untuk menghancurkan pertahanan lawan.", reward: "+1.000 Koin, +800 XP." },
        { tier: 'LEGEND', name: 'Avatar Kosmik',    icon: '🪐', target: 10, desc: 'Kalahkan bos dari seluruh 10 elemen alam', lore: "Keselarasan total dengan semesta; pengendali sejati seluruh elemen kehidupan.", reward: "+3.000 Koin, +2.000 XP, Background Profil: *Alam Semesta Primordial*." }
      ]
    },
    {
      id: 'survivor_last_stand',
      name: 'Penyintas Hati Phoenix',
      category: 'BATTLE',
      statKey: 'lowHpWins',
      unit: 'menang kritis',
      tiers: [
        { tier: 'COMMON', name: 'Goresan Berani',   icon: '❤️‍🩹', target: 3, desc: 'Menangkan 3 laga dengan sisa darah <= 20% HP', lore: "Bertahan hidup di ujung tanduk dan mencetak serangan pembalikan.", reward: "+70 Koin, +70 XP." },
        { tier: 'RARE',   name: 'Tahan Banting',    icon: '❤️‍🔥', target: 10, desc: 'Menangkan 10 laga dengan sisa darah <= 20% HP', lore: "Pantang menyerah walau darah menetes deras; mental juara sejati.", reward: "+220 Koin, +220 XP." },
        { tier: 'EPIC',   name: 'Kebangkitan Ajaib', icon: '🕊️', target: 25, desc: 'Menangkan 25 laga dengan sisa darah <= 15% HP', lore: "Mukjizat kemenangan di saat semua orang mengira Anda akan kalah.", reward: "+650 Koin, +550 XP." },
        { tier: 'LEGEND', name: 'Sayap Phoenix',    icon: '🦅', target: 50, desc: 'Menangkan 50 laga mengalahkan ambang kematian', lore: "Bangkit dari abu kekalahan bagai burung Phoenix abadi yang tak bisa mati.", reward: "+2.200 Koin, +1.500 XP, Pet Eksklusif: *Bayi Burung Phoenix*." }
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
        { tier: 'COMMON', name: 'Percikan Fokus',   icon: '🔥', target: 7, desc: 'Capai rekor 7x kombo jawaban benar beruntun', lore: "Fokus pikiran yang mulai menyala tanpa keraguan.", reward: "+50 Koin, +50 XP." },
        { tier: 'RARE',   name: 'Irama Badai',      icon: '⚡', target: 14, desc: 'Capai rekor 14x kombo jawaban benar beruntun', lore: "Rentetan jawaban cepat mengalir bagai badai yang menerpa tanpa henti.", reward: "+150 Koin, +150 XP." },
        { tier: 'EPIC',   name: 'Kilat Presisi',    icon: '💥', target: 20, desc: 'Capai rekor 20x kombo jawaban benar beruntun', lore: "Ketepatan berpikir setajam kilat petir, mengeliminasi segala keraguan.", reward: "+450 Koin, +400 XP." },
        { tier: 'LEGEND', name: 'Zen Tak Terpatahkan', icon: '🧘', target: 30, desc: 'Capai rekor 30x kombo jawaban benar beruntun', lore: "Keheningan batin tingkat dewa di mana setiap teka-teki terjawab seketika tanpa cela.", reward: "+1.200 Koin, +1.000 XP, Gelar: *Pikiran Tak Terpatahkan*." }
      ]
    },
    {
      id: 'flawless_victory',
      name: 'Kemenangan Sempurna',
      category: 'MASTERY',
      statKey: 'flawlessWins',
      unit: 'laga 100%',
      tiers: [
        { tier: 'COMMON', name: 'Pukulan Murni',    icon: '🎯', target: 3, desc: 'Menangkan 3 laga dengan akurasi mutlak 100%', lore: "Laga tuntas tanpa satu pun goresan jawaban keliru.", reward: "+75 Koin, +75 XP." },
        { tier: 'RARE',   name: 'Eksekusi Bersih',  icon: '🏹', target: 15, desc: 'Menangkan 15 laga dengan akurasi mutlak 100%', lore: "Ketelitian teruji berkali-kali menghadapi berbagai variasi ujian.", reward: "+250 Koin, +250 XP." },
        { tier: 'EPIC',   name: 'Harmoni Absolut',  icon: '💎', target: 50, desc: 'Menangkan 50 laga dengan akurasi mutlak 100%', lore: "Simfoni kecerdasan di mana setiap strategi dijalankan secara tanpa cacat.", reward: "+750 Koin, +600 XP." },
        { tier: 'LEGEND', name: 'Mahakarya Sempurna', icon: '🌟', target: 100, desc: 'Menangkan 100 laga dengan akurasi mutlak 100%', lore: "Bukti supremasi intelektual yang tak pernah goyah di hadapan monster manapun.", reward: "+2.500 Koin, +1.500 XP, Aksesori Sayap: *Wing of Flawless Light*." }
      ]
    },
    {
      id: 'star_collector',
      name: 'Pengoleksi Bintang',
      category: 'MASTERY',
      statKey: 'stars',
      unit: 'bintang',
      tiers: [
        { tier: 'COMMON', name: 'Bintang Fajar',    icon: '⭐', target: 30, desc: 'Kumpulkan akumulasi 30 Bintang kemenangan', lore: "Kilau fajar pertama dari performa tempur yang rapi.", reward: "+50 Koin, +50 XP." },
        { tier: 'RARE',   name: 'Konstelasi Terang', icon: '🌠', target: 150, desc: 'Kumpulkan akumulasi 150 Bintang kemenangan', lore: "Ratusan bintang membentuk rasi gemerlap di langit malam prestasi Anda.", reward: "+200 Koin, +200 XP." },
        { tier: 'EPIC',   name: 'Galaksi Gemilang', icon: '🌌', target: 450, desc: 'Kumpulkan akumulasi 450 Bintang kemenangan', lore: "Gugusan ratusan bintang emas membuktikan konsistensi performa luar biasa.", reward: "+600 Koin, +500 XP." },
        { tier: 'LEGEND', name: 'Supernova Abadi',  icon: '✨', target: 750, desc: 'Kumpulkan akumulasi 750 Bintang kemenangan', lore: "Puncak kesempurnaan bintang yang bersinar abadi menerangi dunia.", reward: "+2.000 Koin, +1.200 XP, Bingkai Avatar Eksklusif: *Frame Bintang Supernova*." }
      ]
    },
    {
      id: 'critical_reflexes',
      name: 'Refleks Cepat Kritis',
      category: 'MASTERY',
      statKey: 'criticalCount',
      unit: 'kritis',
      tiers: [
        { tier: 'COMMON', name: 'Refleks Kilat',    icon: '⚡', target: 30, desc: 'Cetak 30 jawaban kilat berstatus Kritis', lore: "Menjawab cepat dan tepat dalam hitungan detik pertama.", reward: "+60 Koin, +60 XP." },
        { tier: 'RARE',   name: 'Serangan Halilintar', icon: '🌩️', target: 120, desc: 'Cetak 120 jawaban kilat berstatus Kritis', lore: "Waktu reaksi yang membuat lawan tak sempat menyiapkan pertahanan.", reward: "+200 Koin, +200 XP." },
        { tier: 'EPIC',   name: 'Dentuman Cahaya',  icon: '☄️', target: 350, desc: 'Cetak 350 jawaban kilat berstatus Kritis', lore: "Pikiran gesit melesat melampaui kedipan mata.", reward: "+600 Koin, +500 XP." },
        { tier: 'LEGEND', name: 'Kecepatan Suara',  icon: '🚀', target: 800, desc: 'Cetak 800 jawaban kilat berstatus Kritis', lore: "Penguasaan total atas waktu; berpikir lebih cepat daripada kilat menyambar.", reward: "+2.000 Koin, +1.500 XP, Gelar: *Sang Kilat Petir*." }
      ]
    },
    {
      id: 'spaced_repetition',
      name: 'Penakluk Titik Lemah',
      category: 'MASTERY',
      statKey: 'reviewsMastered',
      unit: 'soal review',
      tiers: [
        { tier: 'COMMON', name: 'Koreksi Cermat',   icon: '📝', target: 15, desc: 'Jawab benar 15 soal ulangan / titik lemah', lore: "Mengubah kesalahan masa lalu menjadi batu loncatan pemahaman.", reward: "+60 Koin, +60 XP." },
        { tier: 'RARE',   name: 'Pembalik Kelemahan', icon: '💡', target: 50, desc: 'Jawab benar 50 soal ulangan / titik lemah', lore: "Soal-soal yang dulu sulit kini dijawab dengan senyuman santai.", reward: "+200 Koin, +200 XP." },
        { tier: 'EPIC',   name: 'Memori Baja',      icon: '🧠', target: 150, desc: 'Jawab benar 150 soal ulangan / titik lemah', lore: "Ingatan jangka panjang yang tertata rapi berkat ulangan berkala.", reward: "+600 Koin, +500 XP." },
        { tier: 'LEGEND', name: 'Pikiran Tanpa Celah', icon: '🔮', target: 350, desc: 'Jawab benar 350 soal ulangan / titik lemah', lore: "Tidak ada celah kelemahan yang tersisa di seluruh bidang mata pelajaran.", reward: "+1.800 Koin, +1.200 XP, Gelar: *Sang Cendekia Paripurna*." }
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
        { tier: 'COMMON', name: 'Pencatat Alam',    icon: '📖', target: 10, desc: 'Daftarkan 10 jenis monster di Monster Dex', lore: "Membuka lembaran awal ensiklopedia satwa magis.", reward: "+60 Koin, +60 XP." },
        { tier: 'RARE',   name: 'Peneliti Ekosistem', icon: '🔬', target: 20, desc: 'Daftarkan 20 jenis monster di Monster Dex', lore: "Mengenali anatomi, kelemahan, dan habitat separuh monster di dunia.", reward: "+200 Koin, +200 XP." },
        { tier: 'EPIC',   name: 'Ensiklopedia Hidup', icon: '📜', target: 30, desc: 'Daftarkan 30 jenis monster di Monster Dex', lore: "Menjadi rujukan utama para petualang dalam meneliti monster buas.", reward: "+600 Koin, +500 XP." },
        { tier: 'LEGEND', name: 'Arsiparis Sempurna', icon: '📚', target: 40, desc: 'Lengkapi seluruh 40 monster di Monster Dex', lore: "Menguasai seluruh taksonomi monster dari 10 elemen dan 4 tier tanpa terkecuali.", reward: "+2.000 Koin, +1.500 XP, Gelar Legendaris: *Grandmaster Dex*." }
      ]
    },
    {
      id: 'campaign_pathfinder',
      name: 'Penjelajah Kampanye',
      category: 'EXPLORATION',
      statKey: 'campaignChapters',
      unit: 'node',
      tiers: [
        { tier: 'COMMON', name: 'Langkah Perdana',  icon: '🧭', target: 3, desc: 'Selesaikan 3 stage node kampanye petualangan', lore: "Memulai perjalanan dengan menembus gerbang hutan misterius.", reward: "+80 Koin, +80 XP." },
        { tier: 'RARE',   name: 'Penjelajah Rimba', icon: '🗺️', target: 10, desc: 'Selesaikan 10 stage node kampanye petualangan', lore: "Menaklukkan rimba, gurun pasir, dan badai salju abadi.", reward: "+250 Koin, +250 XP." },
        { tier: 'EPIC',   name: 'Penakluk Perbatasan', icon: '🏰', target: 25, desc: 'Selesaikan 25 stage node kampanye petualangan', lore: "Menembus wilayah paling gelap dan mengungkap rahasia peradaban kuno.", reward: "+700 Koin, +600 XP." },
        { tier: 'LEGEND', name: 'Pahlawan Dunia',   icon: '🌍', target: 50, desc: 'Selesaikan 50 stage node kampanye petualangan', lore: "Menyelesaikan seluruh narasi epik dan mengembalikan kedamaian negeri.", reward: "+2.200 Koin, +1.500 XP, Pet Eksklusif: *Anak Naga Langit*." }
      ]
    },
    {
      id: 'fashion_trendsetter',
      name: 'Ikon Mode & Kostum',
      category: 'EXPLORATION',
      statKey: 'totalSkins',
      unit: 'skin/item',
      tiers: [
        { tier: 'COMMON', name: 'Tampilan Rapi',    icon: '🎩', target: 5, desc: 'Miliki koleksi 5 item busana/kostum avatar', lore: "Menyesuaikan gaya pakaian petualang agar tampil beda.", reward: "+50 Koin, +50 XP." },
        { tier: 'RARE',   name: 'Kolektor Busana',  icon: '👘', target: 15, desc: 'Miliki koleksi 15 item busana/kostum avatar', lore: "Lemari pakaian penuh dengan jubah, mahkota, dan senjata pilihan.", reward: "+200 Koin, +200 XP." },
        { tier: 'EPIC',   name: 'Ikon Kemewahan',   icon: '👑', target: 30, desc: 'Miliki koleksi 30 item busana/kostum avatar', lore: "Penampilan glamor yang selalu mencuri perhatian di lobi petualangan.", reward: "+650 Koin, +550 XP." },
        { tier: 'LEGEND', name: 'Maharaja Gaya',    icon: '✨', target: 50, desc: 'Miliki koleksi 50 item busana/kostum avatar', lore: "Pesona legenda sejati dengan busana kerajaan bertaraf dewa.", reward: "+2.000 Koin, +1.500 XP, Kostum Jubah: *Jubah Galaksi Spektrum*." }
      ]
    },
    {
      id: 'coin_tycoon',
      name: 'Saudagar Koin Emas',
      category: 'EXPLORATION',
      statKey: 'totalCoinsEarned',
      unit: 'koin',
      tiers: [
        { tier: 'COMMON', name: 'Pundi Pertama',    icon: '🪙', target: 1000, desc: 'Kumpulkan akumulasi total 1.000 Koin', lore: "Hasil keringat pertama dari pertempuran dan penyelesaian misi.", reward: "+100 XP." },
        { tier: 'RARE',   name: 'Kantung Tebal',    icon: '💰', target: 7500, desc: 'Kumpulkan akumulasi total 7.500 Koin', lore: "Mampu memborong perlengkapan dan ramuan terbaik di toko desa.", reward: "+300 XP." },
        { tier: 'EPIC',   name: 'Gudang Harta',     icon: '💎', target: 25000, desc: 'Kumpulkan akumulasi total 25.000 Koin', lore: "Peti besi penuh berkilau dengan kepingan emas murni hasil kemenangan.", reward: "+800 XP." },
        { tier: 'LEGEND', name: 'Konglomerat Kerajaan', icon: '🏛️', target: 60000, desc: 'Kumpulkan akumulasi total 60.000 Koin', lore: "Kekayaan melimpah ruah yang mampu mendanai ekspedisi seluruh kerajaan.", reward: "+2.000 XP, Gelar Bertabur Emas: *Saudagar Legendaris*." }
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
        { tier: 'COMMON', name: 'Penyihir Pemula',  icon: '🧪', target: 20, desc: 'Gunakan skill petualang sebanyak 20 kali', lore: "Memadukan mantra penyembuh dan serangan kekuatan di saat genting.", reward: "+50 Koin, +50 XP." },
        { tier: 'RARE',   name: 'Peramu Siasat',    icon: '🧙', target: 100, desc: 'Gunakan skill petualang sebanyak 100 kali', lore: "Memanfaatkan energi secara efisien untuk membalikkan alur pertarungan.", reward: "+180 Koin, +180 XP." },
        { tier: 'EPIC',   name: 'Jenderal Taktik',  icon: '🔮', target: 300, desc: 'Gunakan skill petualang sebanyak 300 kali', lore: "Setiap aktivasi skill adalah langkah skakmat yang mematikan bagi bos.", reward: "+500 Koin, +450 XP." },
        { tier: 'LEGEND', name: 'Archmage Agung',   icon: '🪄', target: 750, desc: 'Gunakan skill petualang sebanyak 750 kali', lore: "Gudang sihir tak bertepi yang mengorkestrasi medan tempur bagai panggung seni.", reward: "+1.800 Koin, +1.200 XP, Mahkota Kosmetik: *Tiara Kristal Archmage*." }
      ]
    },
    {
      id: 'skill_forge_master',
      name: 'Tempaan Skill Maksimal',
      category: 'STRATEGY',
      statKey: 'maxSkillsCount',
      unit: 'skill max',
      tiers: [
        { tier: 'COMMON', name: 'Taktik Teruji',    icon: '⚡', target: 1, desc: 'Tingkatkan 1 skill petualang hingga Level 5', lore: "Satu jurus andalan yang diasah hingga mencapai potensi puncak.", reward: "+100 Koin, +100 XP." },
        { tier: 'RARE',   name: 'Trio Mematikan',   icon: '🗡️', target: 3, desc: 'Tingkatkan 3 skill petualang hingga Level 5', lore: "Kombinasi tiga pilar kemampuan yang siap menghadapi skenario apapun.", reward: "+300 Koin, +300 XP." },
        { tier: 'EPIC',   name: 'Arsenal Sempurna', icon: '⚔️', target: 6, desc: 'Tingkatkan 6 skill petualang hingga Level 5', lore: "Fleksibilitas tanpa batas dalam merancang loadout skill tempur.", reward: "+800 Koin, +700 XP." },
        { tier: 'LEGEND', name: 'Sempurna Paripurna', icon: '🔱', target: 10, desc: 'Tingkatkan seluruh 10 skill petualang hingga Level 5', lore: "Penguasaan absolut atas seluruh taktik yang pernah diciptakan di dunia game.", reward: "+2.500 Koin, +2.000 XP, Petualang Skin: *Jubah Grandmaster Taktik*." }
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
        { tier: 'COMMON', name: 'Pendekar Arena',   icon: '🤺', target: 5, desc: 'Menangkan 5 duel melawan pemain lain', lore: "Menorehkan nama di arena pertarungan antar-petualang.", reward: "+80 Koin, +80 XP." },
        { tier: 'RARE',   name: 'Ksatria Tanding',  icon: '🛡️', target: 25, desc: 'Menangkan 25 duel melawan pemain lain', lore: "Lawan tangguh yang dihormati di setiap gelanggang pertarungan.", reward: "+250 Koin, +250 XP." },
        { tier: 'EPIC',   name: 'Juara Bertahan',   icon: '🏆', target: 75, desc: 'Menangkan 75 duel melawan pemain lain', lore: "Merajai ring duel dengan strategi dan kecepatan yang memukau penonton.", reward: "+750 Koin, +600 XP." },
        { tier: 'LEGEND', name: 'Dewa Gladiator',   icon: '🥇', target: 150, desc: 'Menangkan 150 duel melawan pemain lain', lore: "Sang legenda hidup yang tak terkalahkan di panggung pertarungan akbar.", reward: "+2.500 Koin, +1.800 XP, Gelar Emas: *Gladiator Tak Tertandingi*." }
      ]
    },
    {
      id: 'unstoppable_duelist',
      name: 'Dominasi Duel Tak Terkalahkan',
      category: 'COMPETITION',
      statKey: 'duelBestStreak',
      unit: 'streak duel',
      tiers: [
        { tier: 'COMMON', name: 'Tiga Langkah',     icon: '⚡', target: 3, desc: 'Capai rekor 3 kemenangan beruntun di arena duel', lore: "Permulaan manis tanpa kekalahan di gelanggang arena.", reward: "+80 Koin, +80 XP." },
        { tier: 'RARE',   name: 'Pilar Kemenangan', icon: '🔥', target: 6, desc: 'Capai rekor 6 kemenangan beruntun di arena duel', lore: "Enam penantang datang, enam penantang pulang tertunduk.", reward: "+250 Koin, +250 XP." },
        { tier: 'EPIC',   name: 'Sang Dominator',   icon: '💥', target: 10, desc: 'Capai rekor 10 kemenangan beruntun di arena duel', lore: "Dominasi mutlak di mana tak ada pemain yang mampu mematahkan laju Anda.", reward: "+700 Koin, +600 XP." },
        { tier: 'LEGEND', name: 'Maharaja Arena',   icon: '👑', target: 15, desc: 'Capai rekor 15 kemenangan beruntun di arena duel', lore: "Rekor legendaris yang akan terukir di tugu kehormatan arena selamanya.", reward: "+2.200 Koin, +1.500 XP, Efek Aura Karakter: *Aura Kemenangan Emas*." }
      ]
    },
    {
      id: 'daily_dedication',
      name: 'Disiplin Belajar Harian',
      category: 'COMPETITION',
      statKey: 'dayStreak',
      unit: 'hari',
      tiers: [
        { tier: 'COMMON', name: 'Langkah Istiqomah', icon: '📅', target: 3, desc: 'Pertahankan 3 hari berturut-turut bermain & belajar', lore: "Membangun kebiasaan positif yang konsisten setiap hari.", reward: "+50 Koin, +50 XP." },
        { tier: 'RARE',   name: 'Ksatria Tekun',    icon: '🗓️', target: 7, desc: 'Pertahankan 7 hari berturut-turut bermain & belajar', lore: "Satu pekan penuh dedikasi tanpa pernah melewatkan latihan.", reward: "+150 Koin, +150 XP." },
        { tier: 'EPIC',   name: 'Disiplin Baja',    icon: '⏳', target: 30, desc: 'Pertahankan 30 hari berturut-turut bermain & belajar', lore: "Satu bulan komitmen tanpa cela; belajar telah menjadi denyut nadi Anda.", reward: "+600 Koin, +500 XP." },
        { tier: 'LEGEND', name: 'Kebijaksanaan Abadi', icon: '⌛', target: 100, desc: 'Pertahankan 100 hari berturut-turut bermain & belajar', lore: "Monumen ketekunan dan kesabaran yang menginspirasi seluruh petualang.", reward: "+2.500 Koin, +2.000 XP, Frame Avatar: *Cincin Waktu Abadi*." }
      ]
    },
    {
      id: 'ascendant_level',
      name: 'Puncak Kejayaan Level',
      category: 'COMPETITION',
      statKey: 'level',
      unit: 'level',
      tiers: [
        { tier: 'COMMON', name: 'Ksatria Muda',     icon: '🎖️', target: 5, desc: 'Tingkatkan karakter petualang hingga Level 5', lore: "Lulus dari masa pemula dan membuka akses skill Ramuan Merah.", reward: "+100 Koin, +100 XP." },
        { tier: 'RARE',   name: 'Petualang Ulung',  icon: '🏅', target: 10, desc: 'Tingkatkan karakter petualang hingga Level 10', lore: "Kekuatan dan kapasitas energi berkembang pesat (Kapasitas Energi 7⚡).", reward: "+300 Koin, +300 XP." },
        { tier: 'EPIC',   name: 'Komandan Medan',   icon: '🥇', target: 15, desc: 'Tingkatkan karakter petualang hingga Level 15', lore: "Menjadi panutan bagi seluruh murid dan petualang muda di sekolah.", reward: "+800 Koin, +700 XP." },
        { tier: 'LEGEND', name: 'Puncak Keagungan', icon: '👑', target: 20, desc: 'Capai Level 20 (Level Maksimum Cap)', lore: "Mencapai batas tertinggi kemampuan manusia; legenda abadi MI Adventure.", reward: "+3.000 Koin, +2.500 XP, Gelar Plafon Tertinggi: *Sang Juara Agung*." }
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

  return {
    TIERS,
    TIER_ORDER,
    CATEGORIES,
    BADGE_FAMILIES,
    evaluateBadges
  };
}));
