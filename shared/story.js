(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.StoryData = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORY = Object.freeze({
    hutan: Object.freeze({
      theme: 'Hutan Ajaib',
      intro: Object.freeze([
        'Ranting berbisik... Siapakah yang berani mengusik ketenangan rimba ini?',
        'Hutan ini penuh rahasia ilmu! Uji pengetahuanmu di hadapanku!'
      ]),
      hit: Object.freeze([
        'Aduh! Jawabanmu merontokkan dedaunanku!',
        'Kekuatan ilmumu membelah semak belukar!'
      ]),
      taunt: Object.freeze([
        'Hanya itu saja? Pohon tua di sini jauh lebih bijak!',
        'Kamu tersesat di dalam belantara ilmu pengetahuan!'
      ]),
      enraged: Object.freeze([
        'Badai daun mengamuk! Rasakan getaran alam semesta!',
        'Akar purba bangkit! Pertarungan sesungguhnya baru saja dimulai!'
      ]),
      defeat: Object.freeze([
        'Luar biasa... Hutan mengakui kecerdasan dan ketulusanmu.',
        'Pohon ilmu bersemi kembali berkat jawaban-jawaban benarmu!'
      ]),
      comic: Object.freeze([
        { panel: 1, title: 'Gerbang Rimba', text: 'Petualang muda menembus rimbunnya Hutan Ajaib dengan penuh keberanian.' },
        { panel: 2, title: 'Ujian Sang Penjaga', text: 'Sang Penguasa Rimba tunduk pada ketajaman pikiran sang pendekar cilik.' },
        { panel: 3, title: 'Permata Rimba', text: 'Cahaya fajar menyinari jalan setapak menuju wilayah petualangan berikutnya!' }
      ])
    }),
    gurun: Object.freeze({
      theme: 'Gurun Pasir',
      intro: Object.freeze([
        'Pasir hisap menunggumu! Tunjukkan kamu tidak mudah goyah di bawah terik mentari!',
        'Gurun ini panas membara, seperti semangat belajar yang tak pernah padam!'
      ]),
      hit: Object.freeze([
        'Pasirku beterbangan! Jawabanmu sangat tajam!',
        'Argh! Debu badai pun tak mampu memudarkan fokusmu!'
      ]),
      taunt: Object.freeze([
        'Kehausan akan ilmu? Atau kamu sudah mulai lelah?',
        'Oasis jawaban benar masih jauh dari jangkauanmu!'
      ]),
      enraged: Object.freeze([
        'Badai pasir raksasa mengamuk! Bersiaplah menghadapi gelombang badai!',
        'Gurun menuntut keteguhan puncak!'
      ]),
      defeat: Object.freeze([
        'Kamu berhasil menaklukkan teriknya padang pasir! Jalanmu kini terbuka lapang.',
        'Kebijaksanaanmu menjadi mata air sejuk bagi seluruh musafir.'
      ]),
      comic: Object.freeze([
        { panel: 1, title: 'Lautan Pasir', text: 'Kaki mungil melangkah melintasi bukit-bukit pasir yang membentang luas.' },
        { panel: 2, title: 'Puncak Badai', text: 'Dengan kepala dingin, setiap teka-teki gurun terjawab tuntas.' },
        { panel: 3, title: 'Oasis Kejayaan', text: 'Mata air ilmu memancar jernih menandakan kemenangan sejati!' }
      ])
    }),
    es: Object.freeze({
      theme: 'Gunung Es',
      intro: Object.freeze([
        'Suhu beku menusuk tulang! Apakah pikiranmu tetap hangat dan jernih?',
        'Gletser ilmu ini hanya dapat dicairkan oleh akal yang cemerlang!'
      ]),
      hit: Object.freeze([
        'Dinding eskuku retak seribu!',
        'Hangatnya pemahamanmu mencairkan kristal pertahananku!'
      ]),
      taunt: Object.freeze([
        'Pikiranmu mulai membeku lambat!',
        'Dinginnya salju akan mengubur semangatmu!'
      ]),
      enraged: Object.freeze([
        'Badai es kutub meledak! Rasakan dinginnya puncak gunung tertinggi!',
        'Kristal salju berputar kencang mengelilingi arena!'
      ]),
      defeat: Object.freeze([
        'Es abadi ini akhirnya luluh oleh hangatnya cahaya kepandaianmu.',
        'Puncak gunung kini bermandikan cahaya mentari yang indah.'
      ]),
      comic: Object.freeze([
        { panel: 1, title: 'Puncak Salju', text: 'Melawan hembusan angin beku, sang petualang mendaki tanpa gentar.' },
        { panel: 2, title: 'Retakan Gletser', text: 'Ketajaman logika memecah kebekuan pertahanan sang monster es.' },
        { panel: 3, title: 'Cahaya Aurora', text: 'Langit kutub dihiasi aurora warna-warni merayakan kemenangan akbar!' }
      ])
    }),
    api: Object.freeze({
      theme: 'Api Membara',
      intro: Object.freeze([
        'Lahar mendidih di sekeliling kita! Ujilah keberanian dan ilmumu di sini!',
        'Jangan bermain api jika takut terbakar rasa penasaran!'
      ]),
      hit: Object.freeze([
        'Aura apiku padam sebagian karena kecerdikanmu!',
        'Pukulan jawabanmu sedahsyat ledakan kawah!'
      ]),
      taunt: Object.freeze([
        'Hanya percikan kecil! Kamu butuh api semangat yang lebih besar!',
        'Asap keraguan mulai menyelimuti langkahmu!'
      ]),
      enraged: Object.freeze([
        'Magma meletus! Kawah purba membuka kekuatannya yang terdalam!',
        'Kobaran api menyala setinggi langit!'
      ]),
      defeat: Object.freeze([
        'Api keangkuhanku padam di hadapan kesejukan akal budimu.',
        'Bara kemenangan menyinari langkah masa depanmu.'
      ]),
      comic: Object.freeze([
        { panel: 1, title: 'Kawah Membara', text: 'Langkah kaki berderap di atas bebatuan vulkanik yang berpijar.' },
        { panel: 2, title: 'Ledakan Logika', text: 'Menghadapi kobaran amarah sang boss dengan ketenangan pikiran.' },
        { panel: 3, title: 'Batu Permata Api', text: 'Dari abu pertarungan, terpancar mahkota keberanian sejati!' }
      ])
    }),
    laut: Object.freeze({
      theme: 'Laut Dalam',
      intro: Object.freeze([
        'Di kedalaman samudra tanpa cahaya, pengetahuanlah lentera terbaikmu!',
        'Arus samudra sangat deras, bisakah kamu bertahan?'
      ]),
      hit: Object.freeze([
        'Gelombang pasang terbelah oleh ketepatan analisamu!',
        'Tekanan ilmumu menembus palung terdalam!'
      ]),
      taunt: Object.freeze([
        'Tenggelam dalam kebingungan, wahai petualang kecil?',
        'Ombak besar akan menyapu habis konsentrasimu!'
      ]),
      enraged: Object.freeze([
        'Pusaran air raksasa berputar! Hati-hati terseret arus dahsyat!',
        'Kekuatan tsunami purba bangkit kembali!'
      ]),
      defeat: Object.freeze([
        'Samudra kembali tenang dan bersahabat. Kamu laksamana ilmu yang tangguh!',
        'Mutiara hikmah di dasar samudra kini menjadi milikmu.'
      ]),
      comic: Object.freeze([
        { panel: 1, title: 'Menyelam Kedalaman', text: 'Menembus pekatnya air biru menuju istana karang bawah laut.' },
        { panel: 2, title: 'Menembus Palung', text: 'Setiap arus gelombang berhasil dijinakkan dengan jawaban tepat.' },
        { panel: 3, title: 'Mutiara Kebijaksanaan', text: 'Cahaya mutiara laut menyambut sang penakluk samudra cilik!' }
      ])
    }),
    angkasa: Object.freeze({
      theme: 'Angkasa Luar',
      intro: Object.freeze([
        'Bintang-bintang mengamati! Buktikan luasnya cakrawala wawasanmu di antara galaksi!',
        'Gravitasi nol, namun beban tantangan ini sangat nyata!'
      ]),
      hit: Object.freeze([
        'Lintasan kometmu tepat mengenai sasaran!',
        'Meteor jawabanmu mengguncang stasiun antariksaku!'
      ]),
      taunt: Object.freeze([
        'Melayang tanpa arah di ruang hampa?',
        'Kosmos ini terlalu luas untuk pemahaman yang sempit!'
      ]),
      enraged: Object.freeze([
        'Supernova meledak! Cahaya kosmik membanjiri seluruh semesta!',
        'Gravitasi lubang hitam mulai menarik segalanya!'
      ]),
      defeat: Object.freeze([
        'Bintang kejora bersinar terang untukmu. Pengetahuanmu setinggi angkasa!',
        'Konstelasi baru terukir di langit malam memakai namamu.'
      ]),
      comic: Object.freeze([
        { panel: 1, title: 'Melintasi Bintang', text: 'Roket petualangan meluncur bebas di antara gugusan galaksi.' },
        { panel: 2, title: 'Badai Meteor', text: 'Dengan ketangkasan pikiran, setiap pertanyaan kosmik terjawab tuntas.' },
        { panel: 3, title: 'Bintang Prestasi', text: 'Sang petualang dinobatkan sebagai Penjelajah Bintang Terhebat!' }
      ])
    }),
    kristal: Object.freeze({
      theme: 'Gua Kristal',
      intro: Object.freeze([
        'Kilau kristal memantulkan kebenaran! Apakah ilmumu murni tanpa cela?',
        'Gua ini bergema dengan teka-teki zaman purba!'
      ]),
      hit: Object.freeze([
        'Prisma kristalku terpecah memancarkan spektrum pelangi!',
        'Resonansi jawabanmu sangat merdu dan presisi!'
      ]),
      taunt: Object.freeze([
        'Pantulan bayanganmu sendiri membuatmu ragu?',
        'Kristal ini terlalu keras untuk ditebak sembarangan!'
      ]),
      enraged: Object.freeze([
        'Pecahan kristal tajam melayang di udara! Waspadalah!',
        'Gempa di dalam gua memicu resonansi kristal sonik!'
      ]),
      defeat: Object.freeze([
        'Kristal paling berkilau di gua ini adalah kejernihan budi pekertimu.',
        'Semua kristal kini bernyanyi memuji kemenanganmu.'
      ]),
      comic: Object.freeze([
        { panel: 1, title: 'Lorong Berkilau', text: 'Menyusuri stalaktit kristal yang berpendar dalam kegelapan gua.' },
        { panel: 2, title: 'Resonansi Suci', text: 'Harmoni jawaban tepat meluluhkan hati penjaga gua batu mulia.' },
        { panel: 3, title: 'Intan Cemerlang', text: 'Cahaya abadi menyinari jalan keluar menuju kemenangan.' }
      ])
    }),
    lab: Object.freeze({
      theme: 'Lab Misteri',
      intro: Object.freeze([
        'Eksperimen dimulai! Mari kita uji formula berpikirmu di laboratorium sains ini!',
        'Reagen siap, reaksi kimia menanti katalisator kepintaranmu!'
      ]),
      hit: Object.freeze([
        'Reaksi eksotermik! Logika analisamu sangat bertenaga!',
        'Formula pertahananku berhasil kamu pecahkan!'
      ]),
      taunt: Object.freeze([
        'Hipotesismu salah total! Cobalah eksperimen lain!',
        'Campuran kimiamu meledak menjadi kebingungan!'
      ]),
      enraged: Object.freeze([
        'Alarm laboratorium berbunyi kencang! Sirkuit kelebihan beban!',
        'Reaktor energi melonjak ke tingkat maksimal!'
      ]),
      defeat: Object.freeze([
        'Hipotesis terbukti sempurna! Kamu adalah ilmuwan cilik yang brilian.',
        'Penemuan besar hari ini adalah lahirnya seorang juara baru!'
      ]),
      comic: Object.freeze([
        { panel: 1, title: 'Pintu Laboratorium', text: 'Tabung reaksi dan panel komputer menyala menyambut rasa ingin tahu.' },
        { panel: 2, title: 'Uji Klinis', text: 'Menganalisis setiap data dan opsi jawaban dengan ketelitian tinggi.' },
        { panel: 3, title: 'Penemuan Akbar', text: 'Trofi sains dan pengetahuan resmi dianugerahkan sang Profesor!' }
      ])
    }),
    awan: Object.freeze({
      theme: 'Kerajaan Awan',
      intro: Object.freeze([
        'Melayang di atas awan putih, hanya mereka yang berhati lapang yang mampu bertahan!',
        'Angin sepoi membawa bisikan soal-soal penuh kebijaksanaan!'
      ]),
      hit: Object.freeze([
        'Gumpalan awanku tersibak oleh kecepatan responmu!',
        'Petir ilmumu menyambar tepat di jantung istana langit!'
      ]),
      taunt: Object.freeze([
        'Kamu goyah tertiup angin sepoi-sepoi?',
        'Jangan sampai jatuh dari pijakan awanmu!'
      ]),
      enraged: Object.freeze([
        'Awan mendung hitam bergulung! Petir menyambar tanpa henti!',
        'Tornado langit turun mengguncang singgasana!'
      ]),
      defeat: Object.freeze([
        'Pelangi indah membentang di kerajaan awan merayakan keberhasilanmu!',
        'Angin langit mengantarkan kisah prestasimu ke seluruh penjuru bumi.'
      ]),
      comic: Object.freeze([
        { panel: 1, title: 'Tangga Langit', text: 'Menaiki anak tangga awan kapas menuju istana megah di angkasa.' },
        { panel: 2, title: 'Menembus Badai', text: 'Petir keraguan berhasil ditundukkan oleh keteguhan jawaban pasti.' },
        { panel: 3, title: 'Jembatan Pelangi', text: 'Seluruh makhluk langit bersorak gembira menyambut pahlawan muda!' }
      ])
    }),
    lembah: Object.freeze({
      theme: 'Lembah Purba',
      intro: Object.freeze([
        'Jejak fosil zaman purba menyambutmu! Sejarah dan sains teruji di lembah ini!',
        'Auman raksasa purba menguji keteguhan nyalimu!'
      ]),
      hit: Object.freeze([
        'Batu karang purba terbelah oleh ketangkasanmu!',
        'Kekuatan purba takluk di hadapan ilmu modernmu!'
      ]),
      taunt: Object.freeze([
        'Pengetahuanmu masih setingkat fosil beku!',
        'Hati-hati terinjak jejak kaki dinosaurus ketidaktahuan!'
      ]),
      enraged: Object.freeze([
        'Gunung purba berguncang keras! Auman fosil purba memecah keheningan!',
        'Hujan batu meteor purba mengguncang seluruh lembah!'
      ]),
      defeat: Object.freeze([
        'Lembah purba kini mencatat namamu dalam lembaran sejarah abadi!',
        'Pahlawan zaman ini telah membuktikan kecerdasan sejati.'
      ]),
      comic: Object.freeze([
        { panel: 1, title: 'Jejak Raksasa', text: 'Memasuki lembah berkabut tempat makhluk purba pernah berkuasa.' },
        { panel: 2, title: 'Guncangan Purba', text: 'Dengan kecerdasan cerdas, setiap rintangan batu karang berhasil dilalui.' },
        { panel: 3, title: 'Prasasti Kemenangan', text: 'Nama sang petualang terukir abadi di tebing lembah penuh kehormatan!' }
      ])
    })
  });

  const PET_REACTIONS = Object.freeze({
    correct: Object.freeze([
      'Hebat sekali! 🌟',
      'Keren banget! 🎯',
      'Luar biasa! ✨',
      'Jawaban tepat! 🚀',
      'Makin pintar! 💡'
    ]),
    wrong: Object.freeze([
      'Jangan berkecil hati! 💪',
      'Yuk pelajari lagi! 📖',
      'Pasti bisa berikutnya! 🌈',
      'Tetap semangat ya! ❤️',
      'Kegagalan awal sukses! 🌱'
    ]),
    combo: Object.freeze([
      'Combo dahsyat membara! 🔥',
      'Rentetan benar tanpa henti! ⚡',
      'Kecepatan luar biasa! 🌪️',
      'Tak terhentikan! 💥'
    ])
  });

  const DEFEAT_MESSAGES = Object.freeze({
    close: Object.freeze([
      'Sedikit lagi kamu menang! Pertahankan semangatmu dan coba lagi ya! 🌟',
      'Hasilmu sudah sangat bagus! Hanya butuh sedikit ketelitian lagi. Kamu pasti bisa! 💪',
      'Perlawanan yang luar biasa! Boss tadi gemetar melihat kemampuanmu. Yuk tuntaskan! 🔥'
    ]),
    far: Object.freeze([
      'Pertarungan yang bagus! Jangan menyerah, setiap kesalahan membuat kita semakin pintar. 🌱',
      'Tarik napas dulu, pelajari pembahasannya, lalu kembali dengan strategi baru! 📖',
      'Bahkan pendekar terhebat pun pernah kalah. Yang penting terus mencoba dan berlatih! ❤️'
    ])
  });

  return {
    STORY,
    PET_REACTIONS,
    DEFEAT_MESSAGES
  };
}));
