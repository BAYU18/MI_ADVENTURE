import json
import os
import unicodedata

def clean_text(s):
    if not s:
        return ""
    s = unicodedata.normalize('NFC', s.strip())
    while '  ' in s:
        s = s.replace('  ', ' ')
    return s

def build_q(q_text, correct_ans, distractors, expl, diff, idx):
    q_clean = clean_text(q_text)
    c_clean = clean_text(correct_ans)
    d_clean = [clean_text(d) for d in distractors]
    e_clean = clean_text(expl)
    
    target_idx = idx % 4
    opts = list(d_clean)
    opts.insert(target_idx, c_clean)
    
    for opt in opts:
        if len(opt) > 55:
            raise ValueError(f"Option too long ({len(opt)} chars): {opt}")
            
    return {
        "question": q_clean,
        "options": opts,
        "answer": target_idx,
        "explanation": e_clean,
        "difficulty": diff,
        "timeLimit": 20
    }

def save_batch(folder, filename, questions):
    os.makedirs(folder, exist_ok=True)
    filepath = os.path.join(folder, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(questions)} questions to {filepath}")

# BAB 1: Surah An-Nasr (24 soal: 10 d1, 10 d2, 4 d3)
b1_data = [
    # d1 (10)
    ("Arti dari nama surah An-Nasr adalah ...", "Pertolongan", ["Kemenangan", "Waktu Subuh", "Hari Kiamat"], "An-Nasr secara bahasa bermakna Pertolongan dari Allah.", 1),
    ("Surah An-Nasr terdiri dari berapa ayat?", "3 ayat", ["4 ayat", "5 ayat", "6 ayat"], "Surah An-Nasr adalah surah pendek yang terdiri dari 3 ayat.", 1),
    ("Dalam mushaf Al-Qur'an, surah An-Nasr menempati urutan surah ke- ...", "110", ["108", "109", "111"], "Surah An-Nasr adalah surah ke-110 dalam susunan mushaf Al-Qur'an.", 1),
    ("Berdasarkan tempat dan masa turunnya, surah An-Nasr tergolong surah ...", "Madaniyyah", ["Makkiyyah", "Kufiyyah", "Mishriyyah"], "Surah An-Nasr diturunkan di Mina setelah peristiwa Fathu Makkah.", 1),
    ("Lafaz ayat pertama surah An-Nasr berbunyi ...", "Idza ja'a nasrullahi wal fath", ["Tabbat yada abi lahabiw watabb", "Inna a'thainakal kautsar", "Qul huwallahu ahad"], "Ayat pertama surah An-Nasr dimulai dengan 'Idza ja'a nasrullahi wal fath'.", 1),
    ("Peristiwa besar yang menjadi kabar gembira dalam surah An-Nasr adalah ...", "Fathu Makkah (Pembebasan Makkah)", ["Perang Badar kubra", "Isra' Mi'raj Nabi", "Hijrah ke Habasyah"], "Surah An-Nasr mengabarkan kemenangan Fathu Makkah bagi kaum muslimin.", 1),
    ("Arti potongan ayat 'waro'aitan nasa yadkhuluna fi dinillahi afwaja' adalah manusia masuk agama Allah secara ...", "berbondong-bondong", ["sendiri-sendiri", "terpaksa dan takut", "sembunyi-sembunyi"], "'Afwaja' bermakna berbondong-bondong atau berkelompok besar.", 1),
    ("Dua amalan utama yang diperintahkan Allah pada ayat ke-3 surah An-Nasr adalah ...", "bertasbih dan beristighfar", ["berzakat dan berpuasa", "berqurban dan bersedekah", "berhaji dan berjihad"], "Ayat ke-3 berbunyi 'fasabbih bihamdi rabbika wastaghfirh'.", 1),
    ("Lafaz istighfar yang biasa kita baca sehari-hari adalah ...", "Astaghfirullahaladzim", ["Subhanallahi wabihamdihi", "Alhamdulillahirabbilalamin", "Allahu Akbar walillahilhamd"], "Istighfar memohon ampunan Allah dengan lafaz Astaghfirullah.", 1),
    ("Surah An-Nasr mengajarkan bahwa kemenangan hakiki semata-mata datang dari ...", "Allah Subhanahu wa Ta'ala", ["banyaknya jumlah pasukan", "kehebatan senjata perang", "kekayaan para bangsawan"], "Kemenangan dan pertolongan murni anugerah dari Allah Ta'ala.", 1),

    # d2 (10)
    ("Latar belakang turunnya surah An-Nasr berkaitan erat dengan ...", "isyarat telah dekatnya ajal Nabi saw", ["kemenangan dagang kaum Quraisy", "perintah membangun Ka'bah baru", "pemberian mukjizat air zamzam"], "Sahabat memahami surah ini sebagai isyarat dekatnya wafat Rasulullah saw.", 2),
    ("Sikap seorang mukmin saat memperoleh keberhasilan besar menurut surah An-Nasr adalah ...", "bersyukur dan memohon ampunan", ["berpesta pora hingga larut", "merasa paling hebat di dunia", "meremehkan orang yang kalah"], "Kemenangan disambut dengan tasbih, tahmid, dan istighfar, bukan kesombongan.", 2),
    ("Mengapa kita tetap diperintahkan beristighfar meskipun telah meraih kemenangan?", "agar terhindar dari rasa sombong dan ujub", ["karena istighfar hanya untuk orang kalah", "agar musuh merasa ketakutan", "karena kemenangan itu adalah dosa"], "Istighfar menjaga hati agar tetap tawadhu dan tidak terbuai rasa bangga diri.", 2),
    ("Kata 'al-fath' dalam surah An-Nasr merujuk pada peristiwa ...", "terbukanya kota Makkah tanpa perang", ["kemenangan pasukan Romawi", "dibukanya jalur dagang Yaman", "terbelahnya bulan purnama"], "'Al-Fath' merujuk pada pembebasan kota Makkah (Fathu Makkah) secara damai.", 2),
    ("Surah An-Nasr dibaca saat salat fardhu atau sunnah setelah membaca surah ...", "Al-Fatihah", ["Al-Ikhlas", "An-Nas", "Al-Baqarah"], "Setelah membaca Al-Fatihah disunnahkan membaca surah pendek seperti An-Nasr.", 2),
    ("Tanda keberhasilan dakwah Rasulullah saw yang disebutkan dalam surah An-Nasr adalah ...", "banyak kaum berbondong masuk Islam", ["berdirinya istana megah di Madinah", "terkumpulnya emas perak berlimpah", "musuh-musuh Islam musnah seketika"], "Masyarakat berbondong-bondong memeluk Islam dengan sukarela dan tulus.", 2),
    ("Lafaz 'fasabbih bihamdi rabbika' mengandung perintah untuk ...", "menyucikan dan memuji nama Allah", ["meminta perlindungan dari jin", "membayar zakat tepat waktu", "menyembelih hewan qurban"], "Fasabbih berarti bertasbihlah dengan memuji Rabbmu.", 2),
    ("Sifat Allah yang disebutkan di akhir surah An-Nasr adalah ...", "At-Tawwab (Maha Penerima Taubat)", ["Al-Ghafur (Maha Pengampun)", "Ar-Rahim (Maha Penyayang)", "Al-Quddus (Maha Suci)"], "Penutup ayat ke-3 adalah 'Innahu kaana tawwaba'.", 2),
    ("Sikap bijaksana yang dicontohkan Rasulullah saw saat Fathu Makkah adalah ...", "memaafkan penduduk yang memusuhinya", ["menghukum semua tawanan dengan kejam", "merampas seluruh rumah penduduk Makkah", "mengusir warga keluar dari kota"], "Nabi saw memberikan amnesti umum dan memaafkan penduduk Makkah.", 2),
    ("Pesan moral surah An-Nasr bagi seorang pelajar yang berprestasi adalah ...", "tetap rendah hati dan tidak sombong", ["memamerkan piala kepada semua teman", "berhenti belajar karena merasa pintar", "mengejek teman yang nilainya rendah"], "Prestasi adalah amanah nikmat yang wajib disyukuri dengan rendah hati.", 2),

    # d3 (4)
    ("Ibnu Abbas r.a. menafsirkan surah An-Nasr sebagai isyarat wafatnya Nabi saw karena ...", "tugas dakwah dan risalah Nabi telah tuntas", ["kaum muslimin telah memiliki banyak harta", "kota Makkah telah menjadi kota terkaya", "para malaikat telah berhenti bertasbih"], "Kemenangan mutlak menandakan tugas risalah Rasulullah saw telah tuntas sempurna.", 3),
    ("Perpaduan antara tasbih dan istighfar pada penutup surah An-Nasr mengajarkan bahwa ...", "kebajikan manusia tetap punya kekurangan", ["manusia tak perlu beramal jika menang", "istighfar menghapus pahala kemenangan", "amal manusia pasti sudah sempurna"], "Istighfar menyempurnakan amal karena manusia tak pernah luput dari kekurangan.", 3),
    ("Nilai Kurikulum Berbasis Cinta (KBC) yang tercermin dalam peristiwa Fathu Makkah adalah ...", "menebarkan kasih sayang dan pengampunan", ["membalas kejahatan dengan kekuatan senjata", "menuntut ganti rugi materi pada yang salah", "memenjarakan orang yang berbeda pandangan"], "Rasulullah saw meneladankan cinta dan ampunan agung tanpa rasa dendam.", 3),
    ("Analisis perilaku: Mengapa kesombongan sering muncul setelah kemenangan dan bagaimana surah An-Nasr mencegahnya?", "mengarahkan syukur lewat tasbih istighfar", ["membiarkan pesta kemenangan berlebihan", "memerintahkan bersembunyi dari warga", "melarang manusia meraih kemenangan hidup"], "Zikir tasbih dan istighfar membentengi hati dari rasa takabur dan bangga diri.", 3),
]

# BAB 2: Surah Al-Kautsar (24 soal: 10 d1, 10 d2, 4 d3)
b2_data = [
    # d1 (10)
    ("Arti dari nama surah Al-Kautsar adalah ...", "Nikmat yang banyak", ["Sungai di dunia", "Harta melimpah", "Unta merah"], "Al-Kautsar bermakna anugerah dan nikmat yang sangat banyak.", 1),
    ("Surah Al-Kautsar adalah surah terpendek dalam Al-Qur'an yang terdiri dari ...", "3 ayat", ["2 ayat", "4 ayat", "5 ayat"], "Surah Al-Kautsar terdiri dari 3 ayat pendek.", 1),
    ("Dalam mushaf Al-Qur'an, surah Al-Kautsar menempati urutan surah ke- ...", "108", ["107", "109", "110"], "Surah Al-Kautsar adalah surah ke-108.", 1),
    ("Berdasarkan tempat turunnya, surah Al-Kautsar tergolong surah ...", "Makkiyyah", ["Madaniyyah", "Baghdadiyyah", "Yamaniyyah"], "Surah Al-Kautsar diturunkan di kota Makkah sebelum Nabi hijrah.", 1),
    ("Lafaz ayat pertama surah Al-Kautsar berbunyi ...", "Inna a'thainakal kautsar", ["Fashalli lirabbika wanhar", "Inna syani'aka huwal abtar", "Li ila fi quraisy"], "Ayat pertama diawali dengan 'Inna a'thainakal kautsar'.", 1),
    ("Dua perintah utama Allah dalam ayat ke-2 surah Al-Kautsar adalah ...", "salat dan berkurban", ["puasa dan berzakat", "haji dan sedekah", "membaca Al-Qur'an"], "'Fashalli lirabbika wanhar' memerintahkan salat dan menyembelih kurban.", 1),
    ("Arti dari kata 'wanhar' pada ayat kedua surah Al-Kautsar adalah ...", "dan berkurbanlah", ["dan berpuasalah", "dan bersedekahlah", "dan berwudhulah"], "Nahar berarti menyembelih hewan kurban karena Allah.", 1),
    ("Lafaz ayat ke-3 surah Al-Kautsar berbunyi ...", "Inna syani'aka huwal abtar", ["Inna a'thainakal kautsar", "Fashalli lirabbika wanhar", "Walam yakun lahu kufuwan"], "Ayat ke-3 berbunyi 'Inna syani'aka huwal abtar'.", 1),
    ("Arti kata 'al-abtar' dalam surah Al-Kautsar adalah ...", "terputus dari rahmat", ["orang yang cerdas", "pemimpin kabilah", "saudagar ternak"], "'Al-abtar' artinya terputus garis keturunan atau terputus dari rahmat Allah.", 1),
    ("Nama telaga yang dianugerahkan Allah kepada Rasulullah saw di surga adalah ...", "Telaga Al-Kautsar", ["Telaga Zamzam", "Telaga Nil", "Telaga Firdaus"], "Al-Kautsar juga nama telaga agung milik Nabi saw di surga.", 1),

    # d2 (10)
    ("Sebab turunnya (asbabun nuzul) surah Al-Kautsar berkaitan dengan ...", "ejekan kaum kafir atas wafatnya putra Nabi", ["peristiwa perang Khandaq di Madinah", "pembangunan Ka'bah oleh suku Quraisy", "kedatangan kafilah dagang dari Syam"], "Kaum kafir mengejek Nabi terputus keturunannya setelah putranya wafat.", 2),
    ("Surah Al-Kautsar diturunkan oleh Allah untuk menghibur dan membela ...", "Nabi Muhammad saw", ["Nabi Ibrahim a.s.", "Abu Bakar ash-Shiddiq", "Umar bin Khattab"], "Allah menghibur Rasulullah saw atas celaan dan cemoohan kaum kafir.", 2),
    ("Perintah salat dan kurban dalam surah Al-Kautsar harus didasari niat ...", "ikhlas semata-mata karena Allah", ["mencari pujian dari para tetangga", "pamer hewan kurban paling besar", "mengikuti kebiasaan nenek moyang"], "Ibadah salat dan kurban wajib murni ditujukan hanya untuk Rabb semesta alam.", 2),
    ("Tokoh kafir Quraisy yang mengejek Nabi saw dengan sebutan 'abtar' adalah ...", "Al-'Ash bin Wa'il", ["Abu Bakar ash-Shiddiq", "Hamzah bin Abdul Muthalib", "Utsman bin Mazh'un"], "Al-'Ash bin Wa'il mengejek Nabi saat putra beliau Qasim/Ibrahim wafat.", 2),
    ("Ancaman Allah kepada orang-orang yang membenci Rasulullah saw adalah ...", "mereka yang sebenarnya terputus dari rahmat", ["mereka akan menjadi penguasa di dunia", "mereka akan mendapatkan umur yang panjang", "mereka akan dihormati oleh seluruh kabilah"], "Pembenci Nabi hakikatnya terputus dari kebaikan dan rahmat Allah.", 2),
    ("Waktu pelaksanaan penyembelihan hewan kurban menurut syariat Islam adalah pada hari ...", "Idul Adha dan hari Tasyrik", ["Idul Fitri dan malam takbiran", "Maulid Nabi dan Isra' Mi'raj", "Tahun Baru Hijriyah 1 Muharram"], "Kurban disembelih pada 10 Dzulhijjah dan hari Tasyrik (11, 12, 13 Dzulhijjah).", 2),
    ("Cara mensyukuri nikmat yang banyak menurut surah Al-Kautsar adalah ...", "mendekatkan diri pada Allah dan berbagi", ["menyimpan harta tanpa mau bersedekah", "membelanjakan uang untuk hal sia-sia", "merasa nikmat adalah hasil usaha sendiri"], "Syukur diwujudkan dengan salat (ibadah vertikal) dan kurban (sosial).", 2),
    ("Ciri air di Telaga Al-Kautsar menurut sabda Rasulullah saw adalah ...", "lebih putih dari susu dan lebih manis", ["berwarna merah pekat seperti anggur", "sangat pahit rasanya untuk diminum", "berbusa dan sangat panas suhunya"], "Air Telaga Al-Kautsar sangat sejuk, manis, dan wangi melebihi kasturi.", 2),
    ("Hikmah ibadah kurban bagi masyarakat kurang mampu adalah ...", "merasakan nikmat menyantap daging kurban", ["menambah beban hidup keluarga miskin", "mewajibkan orang miskin membeli kambing", "mengurangi stok pangan di pasar ternak"], "Kurban menghadirkan kebahagiaan dan perbaikan gizi kaum dhuafa.", 2),
    ("Perilaku seorang pelajar yang mengamalkan surah Al-Kautsar adalah ...", "gemar berbagi bekal makanan kepada teman", ["menghabiskan bekal sendiri diam-diam", "mengejek teman yang tidak bawa uang jajan", "menolak berbagi alat tulis di kelas"], "Berbagi makanan kepada sesama adalah cermin pengamalan surah Al-Kautsar.", 2),

    # d3 (4)
    ("Hubungan filosofis antara ibadah salat dan ibadah kurban pada ayat ke-2 adalah ...", "seimbang ibadah vertikal dan aksi sosial", ["keduanya upacara adat masyarakat Arab", "salat untuk miskin, kurban untuk kaya", "kurban menghapus kewajiban salat fardhu"], "Salat menegakkan tauhid (hablun minallah), kurban menebar kasih (hablun minannas).", 3),
    ("Bagaimana surah Al-Kautsar membantah ukuran kemuliaan menurut kaum kafir Quraisy?", "kemuliaan pada risalah dan amal kebajikan", ["kemuliaan diukur dari jumlah anak laki-laki", "keturunan menjamin keselamatan di akhirat", "kemuliaan dari menang perlombaan dagang"], "Kemuliaan hakiki adalah iman dan amal saleh, bukan banyaknya keturunan.", 3),
    ("Nilai cinta dan keikhlasan (KBC) dalam surah Al-Kautsar terwujud saat ...", "berkurban dengan hewan terbaik tanpa pamrih", ["memilih hewan kurban yang sakit-sakitan", "menulis nama sendiri pada kulit hewan kurban", "menjual daging kurban untuk keuntungan diri"], "Kurban yang diterima lahir dari cinta dan ketulusan niat karena Allah Ta'ala.", 3),
    ("Sikap seorang mukmin ketika menghadapi celaan atau ejekan dari orang lain adalah ...", "bersabar, salat, dan menebar kebaikan", ["membalas mencela dengan kata-kata kasar", "putus asa dan berhenti berbuat baik", "mengancam orang yang mengejek dengan fisik"], "Meneladani Nabi saw: membalas celaan dengan tawakal, salat, dan amal kebajikan.", 3),
]

# BAB 3: Surah Al-'Adiyat (24 soal: 10 d1, 10 d2, 4 d3)
b3_data = [
    # d1 (10)
    ("Arti dari nama surah Al-'Adiyat adalah ...", "Kuda perang yang berlari kencang", ["Burung yang terbang tinggi", "Unta pembawa beban berat", "Singa padang pasir buas"], "Al-'Adiyat bermakna kuda-kuda perang yang berlari kencang.", 1),
    ("Surah Al-'Adiyat terdiri dari berapa ayat?", "11 ayat", ["10 ayat", "12 ayat", "13 ayat"], "Surah Al-'Adiyat terdiri dari 11 ayat.", 1),
    ("Dalam mushaf Al-Qur'an, surah Al-'Adiyat menempati urutan surah ke- ...", "100", ["99", "101", "102"], "Surah Al-'Adiyat adalah surah ke-100 dalam susunan mushaf.", 1),
    ("Berdasarkan masa turunnya, surah Al-'Adiyat tergolong surah ...", "Makkiyyah", ["Madaniyyah", "Baghdadiyyah", "Syamiyyah"], "Mayoritas ulama menggolongkan surah Al-'Adiyat ke dalam surah Makkiyyah.", 1),
    ("Lafaz ayat pertama surah Al-'Adiyat berbunyi ...", "Wal 'adiyati dhabha", ["Fal muriyati qadha", "Fal mughirati subha", "Fa atsarna bihi naq'a"], "Ayat pertama diawali dengan sumpah 'Wal 'adiyati dhabha'.", 1),
    ("Kuda perang dalam surah Al-'Adiyat memercikkan bunga api karena ...", "gesekan kuku kakinya dengan batu karang", ["panasnya kobaran api unggun", "letusan gunung berapi", "senjata panah yang berapi"], "Gesekan ladam kuku kuda dengan batu karang memercikkan bunga api (fal muriyati qadha).", 1),
    ("Waktu penyerbuan musuh yang dilakukan kuda perang pada ayat ke-3 adalah waktu ...", "pagi hari (subuh)", ["malam hari gelap", "tengah hari terik", "petang hari menjelang malam"], "'Fal mughirati subha' artinya kuda yang menyerbu musuh pada waktu pagi.", 1),
    ("Arti potongan ayat 'Innal insana lirabbihi lakanud' adalah sesungguhnya manusia itu ...", "sangat ingkar kepada Tuhannya", ["sangat taat beribadah", "sangat pintar berpikir", "sangat rajin bersedekah"], "'Kanud' bermakna sangat ingkar dan tidak berterima kasih atas nikmat Allah.", 1),
    ("Arti potongan ayat 'Wa innahu lihubbil khairi lasyadid' adalah manusia sangat ...", "mencintai harta berlebihan", ["mencintai ilmu pengetahuan", "membenci perbuatan maksiat", "menyayangi anak yatim"], "'Khair' dalam ayat ini bermakna harta kekayaan duniawi.", 1),
    ("Peristiwa dibangkitkannya manusia dari dalam kubur ditegaskan pada ayat ke- ...", "9", ["7", "8", "10"], "Ayat ke-9: 'Afala ya'lamu idza bu'tsira ma fil qubur'.", 1),

    # d2 (10)
    ("Tujuan Allah bersumpah dengan kuda perang pada awal surah Al-'Adiyat adalah ...", "menunjukkan ketaatan hewan pada tuannya", ["mendorong manusia berburu kuda di hutan", "melarang manusia menunggangi kuda perang", "memerintahkan manusia menyembah kuda"], "Kuda taat pada majikannya yang memberi makan, manusia justru ingkar pada Allah.", 2),
    ("Sikap buruk manusia yang dicela dalam surah Al-'Adiyat adalah sifat ...", "ingkar nikmat dan kikir pada harta", ["suka tolong menolong sesama", "rajin mendirikan salat malam", "rendah hati dalam pergaulan"], "Manusia dicela karena mengingkari nikmat Pencipta dan serakah pada harta.", 2),
    ("Kata 'dhabha' pada ayat pertama surah Al-'Adiyat menggambarkan suara ...", "deru nafas kuda saat berlari kencang", ["ringkikan kuda memanggil anak", "derap langkah kaki unta", "teriakan para prajurit perang"], "'Dhabha' adalah suara terengah-engah dari nafas kuda yang dipacu cepat.", 2),
    ("Peristiwa yang diungkapkan pada ayat 'wa hussila ma fish shudur' adalah ...", "dibukanya rahasia di dalam dada", ["dikumpulkannya harta di dalam peti", "dibagikannya makanan kepada warga", "disembuhkannya penyakit fisik manusia"], "Segala niat dan rahasia yang tersimpan di hati manusia akan ditampakkan nyata.", 2),
    ("Sifat Allah yang ditegaskan pada penutup surah Al-'Adiyat adalah Maha ...", "Teliti (Maha Mengetahui rahasia)", ["Pemberi Rezeki tanpa batas", "Menyucikan alam semesta", "Membuat alam semesta raya"], "Ayat ke-11: 'Inna rabbahum bihim yauma'idzin lakhabir' (Maha Teliti/Waspada).", 2),
    ("Pelajaran moral dari ketaatan kuda perang kepada penunggangnya adalah ...", "manusia wajib lebih taat kepada Allah", ["hewan punya derajat lebih tinggi dari manusia", "manusia boleh bersikap kejam pada hewan", "kuda tidak perlu makanan dan perawatan"], "Jika hewan setia pada manusia, manusia wajib jauh lebih taat pada Sang Pencipta.", 2),
    ("Keserakahan manusia terhadap harta dapat menyebabkan ia lupa terhadap ...", "kehidupan akhirat dan hisab kubur", ["rasa kenyang setelah menyantap makanan", "nama anggota keluarga terdekatnya", "keindahan alam sekitar rumahnya"], "Cinta harta berlebihan membuat manusia buta akan tanggung jawab di akhirat.", 2),
    ("Peringatan bagi orang yang kikir dalam surah Al-'Adiyat adalah ...", "seluruh isi hatinya dibongkar di kiamat", ["ia mendapatkan harta lebih banyak di surga", "ia tak dimintai pertanggungjawaban amal", "namanya dikenang mulia sepanjang masa"], "Pada hari kiamat, semua niat kikir dan ketamakan akan dibuka tanpa rahasia.", 2),
    ("Cara mengatasi sifat 'kanud' (ingkar nikmat) dalam diri kita adalah ...", "selalu bersyukur dan mengingat Allah", ["mengumpulkan harta sebanyak-banyaknya", "membandingkan diri dengan orang kaya", "enggan bergaul dengan orang yang miskin"], "Bersyukur atas rezeki dan qana'ah melenyapkan sikap ingkar nikmat.", 2),
    ("Pesan utama yang harus ditanamkan siswa dari surah Al-'Adiyat adalah ...", "tidak menjadi hamba kikir dan serakah", ["menghabiskan waktu menunggangi kuda", "berlatih perang menggunakan senjata tajam", "mengabaikan pelajaran demi mencari uang"], "Siswa dididik menjadi pribadi dermawan dan selalu bersiap menghadapi akhirat.", 2),

    # d3 (4)
    ("Kontras tajam yang digambarkan surah Al-'Adiyat antara kuda dan manusia adalah ...", "kuda rela berkorban, manusia ingkar Pencipta", ["kuda berakal cerdas, manusia tanpa logika", "manusia di gurun pasir, kuda di pegunungan", "kuda tidak lelah, manusia selalu malas"], "Perbandingan ini menyindir manusia yang tidak tahu terima kasih kepada Allah.", 3),
    ("Makna eskatologis dari dibongkarnya isi kubur dan rahasia dada pada hari akhir adalah ...", "amal lahir dan batin diadili secara adil", ["hidup lagi di dunia mencari harta hilang", "rahasia kejahatan ditutupi dengan harta", "hanya dosa besar saja yang akan dihisab"], "Pengadilan akhirat menyingkap hakikat keikhlasan amal tanpa kepalsuan.", 3),
    ("Bagaimana seorang pelajar mengamalkan nilai zuhud dan tanggung jawab dari surah Al-'Adiyat?", "gunakan rezeki dan giat menuntut ilmu", ["menolak uang saku dan buku pelajaran", "habiskan tabungan beli barang-barang mewah", "merasa iri hati melihat prestasi sahabat"], "Mengendalikan cinta dunia dan memanfaatkan fasilitas belajar di jalan kebaikan.", 3),
    ("Penerapan nilai kepekaan nurani (KBC) dari surah Al-'Adiyat dalam pergaulan adalah ...", "menjauhi kikir dan suka menolong teman", ["simpan makanan bekal tanpa peduli teman", "menuntut imbalan tiap kali memberi bantuan", "hanya berteman dengan anak serba mewah"], "Hati yang tulus berbagi menepis sifat serakah dan cinta harta berlebihan.", 3),
]

# BAB 4: Hukum Bacaan Idgham Bighunnah dan Bilaghunnah (24 soal: 10 d1, 10 d2, 4 d3)
b4_data = [
    # d1 (10)
    ("Secara bahasa, arti dari kata 'idgham' adalah ...", "memasukkan atau meleburkan", ["menjelaskan lafaz", "mengganti huruf", "memantulkan bunyi"], "Idgham secara bahasa artinya memasukkan atau meleburkan satu huruf ke huruf lain.", 1),
    ("Idgham bighunnah artinya membaca dengan meleburkan huruf disertai ...", "dengung (ghunnah)", ["pantulan suara keras", "bacaan yang sangat jelas", "suara yang terputus"], "Bighunnah artinya dengan dengung sepanjang 2 harakat.", 1),
    ("Idgham bilaghunnah artinya membaca dengan meleburkan huruf secara ...", "tanpa dengung", ["sangat panjang 6 harakat", "memantul keras di akhir", "berhenti sejenak di tengah"], "Bilaghunnah artinya tanpa dengung (suara langsung masuk tanpa tertahan).", 1),
    ("Jumlah huruf hijaiyah yang termasuk idgham bighunnah berjumlah ...", "4 huruf", ["2 huruf", "6 huruf", "8 huruf"], "Huruf idgham bighunnah ada 4 yang disingkat yanmu (ya, nun, mim, waw).", 1),
    ("Huruf-huruf idgham bighunnah terkumpul dalam singkatan ...", "yanmu (ya, nun, mim, waw)", ["ra dan lam saja", "baju di toko", "ahruf halqiyah"], "Empat huruf idgham bighunnah adalah: ya (ي), nun (ن), mim (م), dan waw (و).", 1),
    ("Jumlah huruf hijaiyah yang termasuk idgham bilaghunnah berjumlah ...", "2 huruf", ["4 huruf", "5 huruf", "3 huruf"], "Huruf idgham bilaghunnah ada 2 huruf, yaitu lam (ل) dan ra (ر).", 1),
    ("Huruf-huruf yang termasuk idgham bilaghunnah adalah ...", "lam (ل) dan ra (ر)", ["nun (ن) dan mim (م)", "ya (ي) dan waw (و)", "ba (ب) dan jim (ج)"], "Hanya ada dua huruf idgham bilaghunnah: lam (ل) dan ra (ر).", 1),
    ("Lama menahan dengung pada bacaan idgham bighunnah adalah ...", "2 harakat (1 alif)", ["4 harakat (2 alif)", "6 harakat (3 alif)", "1/2 harakat cepat"], "Dengung ditahan kira-kira 2 harakat atau satu alif.", 1),
    ("Contoh bacaan idgham bighunnah yang benar di bawah ini adalah ...", "may yaqulu (nun mati bertemu ya)", ["min ladunka (nun mati bertemu lam)", "mir rabbika (nun mati bertemu ra)", "man amana (nun mati bertemu alif)"], "'May yaqulu' adalah contoh nun mati bertemu huruf ya.", 1),
    ("Contoh bacaan idgham bilaghunnah yang benar di bawah ini adalah ...", "mir rabbihim (nun mati bertemu ra)", ["may ya'mal (nun mati bertemu ya)", "min ma'in (nun mati bertemu mim)", "min walin (nun mati bertemu waw)"], "'Mir rabbihim' adalah nun mati bertemu ra dibaca lebur tanpa dengung.", 1),

    # d2 (10)
    ("Hukum idgham terjadi apabila nun sukun atau tanwin bertemu huruf idgham dalam ...", "dua kata yang terpisah", ["satu kata yang bersambung", "tengah-tengah surah Al-Qur'an", "awal pembukaan surah saja"], "Idgham hanya berlaku jika nun sukun/tanwin bertemu hurufnya pada dua kata terpisah.", 2),
    ("Jika nun sukun bertemu huruf waw atau ya dalam satu kata, hukumnya berubah menjadi ...", "izhar muthlaq (wajib dibaca jelas)", ["idgham bighunnah bertambah panjang", "iqlab diganti mim sukun", "ikhfa haqiqi samar-samar"], "Pertemuan dalam satu kata disebut izhar muthlaq dan harus dibaca jelas.", 2),
    ("Contoh kalimat dalam Al-Qur'an yang termasuk bacaan izhar muthlaq adalah ...", "dunya dan bunyanun", ["may yaqulu dan min waro'ihim", "mir rabbika dan min ladunka", "khairun yarah dan amadaw ba'ida"], "Kata 'ad-dunya' dan 'bunyanun' wajib dibaca jelas tanpa dileburkan.", 2),
    ("Cara membaca lafaz 'hudal lil muttaqin' (tanwin bertemu lam) adalah ...", "hudallil muttaqin (tanpa dengung)", ["hudaannlil muttaqin (didengungkan)", "huda-lil muttaqin (dipantulkan)", "huda lil muttaqin (dijeda hening)"], "Tanwin langsung dimasukkan ke huruf lam tanpa ditahan dengungnya.", 2),
    ("Cara membaca lafaz 'wa may ya'mal' (nun sukun bertemu ya) adalah ...", "wamayyya'mal dengan dengung 2 harakat", ["man ya'mal secara tegas jelas", "wamirya'mal diubah ke huruf ra", "wamanya'mal dipantulkan di lidah"], "Nun dilebur ke ya dan ditahan dengung di pangkal hidung 2 harakat.", 2),
    ("Perbedaan utama cara melafalkan idgham bighunnah dan idgham bilaghunnah adalah ...", "bighunnah pakai dengung, bilaghunnah tidak", ["bighunnah memantul, bilaghunnah jelas", "bighunnah pendek, bilaghunnah panjang", "keduanya dibaca persis sama tanpa beda"], "Bighunnah bersuara dengung di hidung, bilaghunnah suara bersih tanpa dengung.", 2),
    ("Fungsi mempelajari ilmu tajwid saat membaca Al-Qur'an adalah ...", "menjaga lisan dari salah membaca ayat", ["mempercepat waktu membaca agar lekas khatam", "mencari pujian atas kemerduan suara kita", "mengubah arti ayat Al-Qur'an sesuka hati"], "Tajwid memelihara kemurnian bacaan Al-Qur'an sesuai sunnah Rasulullah saw.", 2),
    ("Lafaz 'hablum mim masad' mengandung hukum bacaan ...", "idgham bighunnah", ["idgham bilaghunnah", "izhar halqi", "iqlab murni"], "Tanwin pada 'hablun' bertemu mim menghasilkan idgham bighunnah.", 2),
    ("Lafaz 'ghafurur rahim' (tanwin dhommah bertemu ra) dibaca ...", "ghafurur-rahim tanpa dengung", ["ghafurun-rahim dengan dengung", "ghafur-m-rahim diganti mim", "ghafur rahim dipantulkan"], "Tanwin lebur seutuhnya ke dalam huruf ra tanpa dengungan.", 2),
    ("Tanda tasydid pada huruf idgham dalam mushaf Al-Qur'an berfungsi untuk ...", "menunjukkan huruf dibaca lebur rangkap", ["menandakan ayat tersebut harus diulang", "menunjukkan tempat waqaf berhenti", "menandakan bacaan dipanjangkan 6 harakat"], "Tasydid pada huruf idgham menandakan peleburan sempurna huruf sebelumnya.", 2),

    # d3 (4)
    ("Mengapa kata 'qinwanun' dan 'sinwanun' tidak dibaca idgham bighunnah?", "karena nun sukun dan waw dalam satu kata", ["karena waw bukan huruf idgham bighunnah", "karena kedua kata dari bahasa Ibrani", "karena tidak ada tanda dhommah di atasnya"], "Kaidah tajwid: jika nun sukun dan waw/ya dalam satu kata, dibaca izhar muthlaq.", 3),
    ("Analisis kesalahan: Seseorang membaca 'mir rabbihim' dengan mendengungkannya sepanjang 3 harakat. Kesalahannya adalah ...", "huruf ra dibaca lebur tanpa dengung", ["huruf ra harus dipantulkan seperti qalqalah", "bacaan tersebut seharusnya dibaca samar", "nun sukun harus dibaca jelas tanpa lebur"], "Hukum bilaghunnah mengharuskan suara lebur langsung tanpa dengungan sama sekali.", 3),
    ("Pentingnya konsistensi panjang harakat saat melafalkan idgham bighunnah adalah ...", "menjaga keindahan tartil dan hak huruf", ["agar pendengar kagum dengan durasi nafas", "untuk menyamarkan kata yang sulit dibaca", "karena harakat bebas ditentukan pembaca"], "Tartil Al-Qur'an menuntut kepatuhan presisi pada kaidah makharij dan sifat huruf.", 3),
    ("Sikap seorang santri ketika mendengar temannya salah melafalkan hukum tajwid adalah ...", "menegur dan mencontohkan secara santun", ["menertawakan kesalahan di depan ustadz", "membiarkannya terus salah membaca ayat", "melarangnya membaca Al-Qur'an kembali"], "Membimbing sesama dengan kelembutan adalah cermin cinta Al-Qur'an.", 3),
]

# BAB 5: Hadis tentang Niat (24 soal: 10 d1, 10 d2, 4 d3)
b5_data = [
    # d1 (10)
    ("Hadis tentang niat diriwayatkan oleh sahabat Nabi yang bernama ...", "Umar bin Khattab r.a.", ["Abu Hurairah r.a.", "Ali bin Abi Thalib r.a.", "Anas bin Malik r.a."], "Hadis niat yang masyhur diriwayatkan dari Amirul Mukminin Umar bin Khattab r.a.", 1),
    ("Lafaz hadis tentang niat diawali dengan sabda Nabi ...", "Innamal a'malu bin niyyat", ["Thalabul 'ilmi faridhatun", "La taghdhab walakal jannah", "Al-muslimu man salimal muslimun"], "Hadis dimulai dengan lafaz: 'Innamal a'malu bin niyyat' (amal bergantung pada niat).", 1),
    ("Arti dari potongan hadis 'Innamal a'malu bin niyyat' adalah ...", "Setiap amal perbuatan tergantung pada niat", ["Menuntut ilmu itu wajib bagi setiap muslim", "Janganlah kamu marah maka bagimu surga", "Orang beriman itu bersaudara satu sama lain"], "Segala nilai kebaikan dan pahala amal ditentukan oleh keikhlasan niatnya.", 1),
    ("Tempat meletakkan niat yang hakiki dalam tubuh manusia berada di ...", "dalam hati sanubari", ["ucapan lisan saja", "gerakan anggota tubuh", "pikiran di kepala"], "Niat berpusat di dalam hati, meskipun lisan boleh melafalkannya untuk membantu.", 1),
    ("Niat yang benar dalam mengerjakan ibadah harus ditujukan semata-mata untuk ...", "mencari ridha Allah Ta'ala", ["mendapat pujian orang tua", "memperoleh hadiah uang", "disegani oleh teman-teman"], "Ibadah hanya diterima jika dilandasi niat ikhlas mencari ridha Allah semata.", 1),
    ("Perbuatan baik yang dilakukan tanpa didasari niat karena Allah akan ...", "sia-sia dan tidak berpahala", ["tetap mendapat pahala besar", "menjadikan pelakunya suci", "langsung membawanya ke surga"], "Amal kebaikan tanpa niat ikhlas tidak bernilai pahala di sisi Allah.", 1),
    ("Waktu berniat saat hendak mendirikan salat dilakukan ketika ...", "takbiratul ihram", ["rukuk pertama kali", "sujud yang terakhir", "salam ke arah kanan"], "Niat salat dihadirkan di dalam hati bersamaan dengan takbiratul ihram.", 1),
    ("Perilaku beramal agar dilihat dan dipuji oleh orang lain disebut sifat ...", "riya'", ["sum'ah", "ujub", "hasad"], "Riya' adalah penyakit hati ingin dipuji manusia dalam beribadah.", 1),
    ("Jika seseorang berniat berbuat baik tetapi belum sempat melaksanakannya, Allah mencatat baginya ...", "satu pahala kebaikan utuh", ["satu dosa kelalaian", "tidak dicatat apa-apa", "setengah siksaan kubur"], "Kemurahan Allah: niat baik yang belum terlaksana sudah diganjar satu pahala.", 1),
    ("Hikmah utama menetapkan niat baik sebelum belajar di madrasah adalah ...", "aktivitas belajar bernilai ibadah", ["terhindar dari tugas guru", "pasti selalu jadi juara", "waktu belajar jadi singkat"], "Niat menuntut ilmu lillahi ta'ala mengubah belajar menjadi ladang ibadah.", 1),

    # d2 (10)
    ("Latar belakang sabda Nabi tentang hijrah dalam hadis niat berkaitan dengan ...", "seseorang hijrah demi menikahi wanita", ["sahabat mencari kekayaan di Habasyah", "kaum muslimin yang takut perang", "kafilah dagang yang ingin berniaga"], "Hadis menyebut orang yang hijrah demi wanita (Ummu Qais) hanya mendapat apa yang diniatkan.", 2),
    ("Arti potongan hadis 'wa innama likullimri'in ma nawa' adalah ...", "tiap orang dapat balasan sesuai niatnya", ["setiap muslim wajib hijrah ke Madinah", "amal manusia dihitung dari banyak amalnya", "semua manusia dikumpulkan di mahsyar"], "Balasan yang diterima seseorang di akhirat sangat bergantung pada motif niatnya.", 2),
    ("Perbedaan mendasar antara ibadah dan kebiasaan sehari-hari terletak pada ...", "niat yang mendasari perbuatan tersebut", ["banyaknya tenaga fisik yang dikeluarkan", "waktu pelaksanaan kegiatan tersebut", "tempat di mana kegiatan itu dikerjakan"], "Makan, minum, dan tidur bisa bernilai ibadah jika diniatkan untuk memperkuat tubuh beribadah.", 2),
    ("Contoh perbuatan mubah (kebiasaan) yang berubah menjadi bernilai ibadah karena niat adalah ...", "tidur awal agar bisa bangun salat subuh", ["bermain bola untuk bertaruh uang", "makan kenyang agar bisa tidur seharian", "membeli baju mahal untuk dipamerkan"], "Niat tidur untuk ketaatan ibadah mengubah tidur menjadi amal berpahala.", 2),
    ("Dua syarat diterimanya amal ibadah di sisi Allah Subhanahu wa Ta'ala adalah ...", "ikhlas karena Allah dan sesuai sunnah", ["banyaknya jumlah saksi dan pakaian putih", "dilakukan di masjid dan disiarkan umum", "menggunakan biaya mahal dan tenaga berat"], "Amal diterima bila memenuhi syarat ikhlas (batin) dan ittiba' sunnah (lahir).", 2),
    ("Seseorang yang bersedekah secara terang-terangan diperbolehkan dalam Islam asalkan ...", "hatinya ikhlas dan memotivasi sesama", ["berniat agar tetangga tahu ia dermawan", "ingin namanya diumumkan pengeras suara", "berharap dapat sanjungan kepala desa"], "Sedekah terang-terangan sah jika bebas riya' dan memberi teladan positif.", 2),
    ("Bahaya penyakit riya' dalam beramal bagi pelakunya adalah ...", "menghapus pahala dan termasuk syirik kecil", ["membuat tubuhnya terserang penyakit", "mengurangi kecerdasan akal pikiran", "membuat hartanya berkurang drastis"], "Riya' adalah syirik asghar yang membatalkan dan merusak pahala amal saleh.", 2),
    ("Sikap seorang pelajar saat dipuji oleh bapak atau ibu guru atas nilainya yang bagus adalah ...", "bersyukur pada Allah dan rendah hati", ["merasa dirinya paling pintar di sekolah", "meremehkan teman yang mendapat nilai rendah", "berhenti belajar karena sudah pintar"], "Pujian disikapi dengan memuji Allah dan menjaga niat dari kesombongan.", 2),
    ("Mengapa para ulama menempatkan hadis tentang niat pada bab pertama dalam kitab-kitab mereka?", "pengingat luruskan niat menuntut ilmu", ["karena hadis tersebut paling pendek", "agar pembaca tidak merasa bosan membaca", "karena hanya berlaku bagi penulis buku"], "Meluruskan niat adalah fondasi awal keberkahan ilmu dan setiap amal perbuatan.", 2),
    ("Niat yang tulus seorang anak saat membantu membersihkan rumah orang tuanya adalah ...", "berbakti dan mengharap ridha orang tua", ["agar diberi uang jajan tambahan oleh ibu", "supaya diizinkan bermain game ponsel", "agar dipuji anak paling rajin sedunia"], "Membantu orang tua bernilai birrul walidain bila diniatkan mencari ridha Allah.", 2),

    # d3 (4)
    ("Analisis hadis: Seseorang berniat salat tahajud lalu memasang alarm, tetapi ia tertidur lelap hingga subuh. Balasannya adalah ...", "tetap dapat pahala niat karena tekadnya", ["ia berdosa besar menyia-nyiakan waktu", "ia wajib membayar denda kafarat tidur", "ia harus mengulang salat fardhu lima waktu"], "Tekad kuat yang terhalang uzur tetap diganjar pahala utuh oleh kemurahan Allah.", 3),
    ("Bagaimana cara seorang hamba memurnikan niatnya dari godaan riya' dan sum'ah?", "menyembunyikan amal sunnah dan muhasabah", ["berhenti berbuat baik di depan orang banyak", "meminta orang mengawasi ibadah tiap hari", "mengumumkan niat ibadahnya di media sosial"], "Ibadah sunnah yang tersembunyi melatih keikhlasan hati dan mengikis riya'.", 3),
    ("Kaitan antara niat yang ikhlas dengan ketahanan mental seorang pendakwah adalah ...", "tak putus asa dicela, tak mabuk pujian", ["pasti langsung diterima semua masyarakat", "terbebas dari segala kesulitan materi", "memiliki kedudukan politik sangat tinggi"], "Ikhlas membuat pejuang tegar: pujian tak menerbangkan, celaan tak menjatuhkan.", 3),
    ("Penerapan nilai cinta sejati (KBC) dalam hadis niat tercermin saat seseorang ...", "menolong sesama tanpa pamrih ucapan", ["hanya membantu orang yang pernah membantunya", "menolong agar suatu saat dipinjam barang", "memilih orang ditolong berdasar status"], "Cinta sejati berkorban semata karena mengharap kasih dan ridha Allah Ta'ala.", 3),
]

def main():
    target_dir = "/home/maman/play/konten/kelas4-sem1/al-quran-hadis"
    batches = [
        ("b1-surah-an-nasr.json", b1_data),
        ("b2-surah-al-kautsar.json", b2_data),
        ("b3-surah-al-adiyat.json", b3_data),
        ("b4-idgham-bighunnah-bilaghunnah.json", b4_data),
        ("b5-hadis-tentang-niat.json", b5_data)
    ]
    
    total = 0
    for filename, raw_items in batches:
        qs = []
        for i, item in enumerate(raw_items):
            q_text, c_ans, dists, expl, diff = item
            q_obj = build_q(q_text, c_ans, dists, expl, diff, i)
            qs.append(q_obj)
        save_batch(target_dir, filename, qs)
        total += len(qs)
        
    print(f"Total Al-Qur'an Hadis generated: {total} questions across {len(batches)} batches.")

if __name__ == "__main__":
    main()
