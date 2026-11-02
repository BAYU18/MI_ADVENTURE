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
        if len(opt) > 60:
            raise ValueError(f"Option too long ({len(opt)} chars): {opt}")
            
    return {
        "question": q_clean,
        "options": opts,
        "answer": target_idx,
        "explanation": e_clean,
        "difficulty": diff,
        "timeLimit": 25
    }

def save_batch(folder, filename, questions):
    os.makedirs(folder, exist_ok=True)
    filepath = os.path.join(folder, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(questions)} questions to {filepath}")

# BAB 1: الْعُنْوَانُ (Alamat: 34 soal -> 14 d1, 14 d2, 6 d3)
b1_data = [
    # d1 (14)
    ("Arti dari kata الْعُنْوَانُ (al-'unwaan) dalam bahasa Indonesia adalah ...", "alamat", ["sekolah", "rumah", "jalan"], "Kata al-'unwan bermakna alamat tempat tinggal atau lokasi.", 1),
    ("Bahasa Arab dari kata 'rumah' adalah ...", "بَيْتٌ (baitun)", ["مَسْجِدٌ (masjidun)", "مَدْرَسَةٌ (madrasatun)", "فَصْلٌ (fashlun)"], "Baitun (بَيْتٌ) berarti rumah tempat tinggal keluarga.", 1),
    ("Kata شَارِعٌ (syaari') memiliki arti ...", "jalan raya", ["kantor pos", "lapangan", "pasar tradisional"], "Syaari' (شَارِعٌ) artinya jalan raya atau gang perumahan.", 1),
    ("Bahasa Arab dari kata 'nomor' atau 'angka' adalah ...", "رَقْمٌ (roqmun)", ["اِسْمٌ (ismun)", "بَابٌ (baabun)", "كِتَابٌ (kitaabun)"], "Roqmun (رَقْمٌ) bermakna nomor urut, nomor rumah, atau nomor telepon.", 1),
    ("Angka Arab '٣' dibaca dan bernilai ...", "ثَلَاثَةٌ (tiga)", ["وَاحِدٌ (satu)", "اِثْنَانِ (dua)", "أَرْبَعَةٌ (empat)"], "Lambang angka '٣' adalah angka 3 (tsalaatsah).", 1),
    ("Bahasa Arab untuk bilangan 'lima' (5) adalah ...", "خَمْسَةٌ (khamsah)", ["سِتَّةٌ (sittah)", "سَبْعَةٌ (sab'ah)", "ثَمَانِيَةٌ (tsamaaniyah)"], "Khamsah (خَمْسَةٌ) adalah bilangan 5.", 1),
    ("Angka Arab '٧' menunjukkan bilangan ...", "tujuh (٧)", ["lima (٥)", "enam (٦)", "delapan (٨)"], "Angka 7 dalam aksara Arab ditulis dengan simbol '٧'.", 1),
    ("Kata tanya yang tepat untuk menanyakan tempat tinggal 'Di mana rumahmu?' adalah ...", "أَيْنَ بَيْتُكَ؟", ["مَا اسْمُكَ؟", "كَيْفَ حَالُكَ؟", "مَنْ هَذَا؟"], "Aina (أَيْنَ) adalah kata tanya untuk menanyakan tempat atau lokasi.", 1),
    ("Jawaban yang tepat untuk pertanyaan 'أَيْنَ مَدْرَسَتُكَ؟' adalah ...", "مَدْرَسَتِي فِي الشَّارِعِ", ["اِسْمِي أَحْمَدُ", "أَنَا تِلْمِيذٌ", "عُمْرِي عَشْرُ سِنِينَ"], "Madrasatii fiis syaari' artinya sekolahku berada di jalan...", 1),
    ("Bahasa Arab dari kata 'kota' adalah ...", "مَدِينَةٌ (madiinah)", ["قَرْيَةٌ (qaryah)", "بَحْرٌ (bahrun)", "جَبَلٌ (jabalun)"], "Madiinah (مَدِينَةٌ) bermakna kota.", 1),
    ("Bahasa Arab dari kata 'desa' adalah ...", "قَرْيَةٌ (qaryah)", ["مَدِينَةٌ (madiinah)", "سُوقٌ (suuqun)", "شَارِعٌ (syaari')"], "Qaryah (قَرْيَةٌ) artinya perkampungan atau pedesaan.", 1),
    ("Kata هَاتِفٌ (haatifun) memiliki arti ...", "telepon", ["televisi", "komputer", "radio"], "Haatif (هَاتِفٌ) artinya telepon.", 1),
    ("Lafal bilangan Arab 'عَشَرَةٌ' ('asyarah) melambangkan angka ...", "sepuluh (١٠)", ["delapan (٨)", "sembilan (٩)", "sebelas (١١)"], "'Asyarah (عَشَرَةٌ) bernilai 10.", 1),
    ("Jika rumahmu di Jalan Sudirman nomor 4, maka diucapkan ...", "فِي شَارِعِ سُودِيرْمَان رَقْمُ ٤", ["فِي شَارِعِ سُودِيرْمَان رَقْمُ ١", "فِي شَارِعِ سُودِيرْمَان رَقْمُ ٦", "فِي شَارِعِ سُودِيرْمَان رَقْمُ ٩"], "Roqmu 4 ditulis رَقْمُ ٤ (arba'ah).", 1),

    # d2 (14)
    ("Urutan bilangan Arab dari 1 sampai 4 yang benar adalah ...", "وَاحِدٌ، اِثْنَانِ، ثَلَاثَةٌ، أَرْبَعَةٌ", ["أَرْبَعَةٌ، ثَلَاثَةٌ، اِثْنَانِ، وَاحِدٌ", "خَمْسَةٌ، سِتَّةٌ، سَبْعَةٌ، ثَمَانِيَةٌ", "وَاحِدٌ، ثَلَاثَةٌ، خَمْسَةٌ، سَبْعَةٌ"], "Urutan hitungan dasar: wahid (1), itsnan (2), tsalatsah (3), arba'ah (4).", 2),
    ("Perhatikan kalimat: 'بَيْتِي قَرِيبٌ مِنَ الْمَدْرَسَةِ'. Arti kata قَرِيبٌ adalah ...", "dekat dengan sekolah", ["sangat jauh dari sekolah", "tepat di depan pasar", "berada di tengah sawah"], "Qariibun min (قَرِيبٌ مِنْ) bermakna dekat dari suatu tempat.", 2),
    ("Lawan kata dari قَرِيبٌ (dekat) dalam bahasa Arab adalah ...", "بَعِيدٌ (jauh)", ["كَبِيرٌ (besar)", "صَغِيرٌ (kecil)", "جَمِيلٌ (indah)"], "Ba'iidun (بَعِيدٌ) bermakna jauh.", 2),
    ("Perhatikan kalimat: 'هَذَا رَقْمُ هَاتِفِي: ٠٨١٢٣٤'. Kata رَقْمُ هَاتِفِي artinya ...", "nomor telepon saya", ["nomor rumah paman", "nomor kartu pelajar", "nomor induk siswa"], "Roqmu haatifii (رَقْمُ هَاتِفِي) bermakna nomor telepon saya.", 2),
    ("Manakah penulisan angka 'delapan' dalam aksara Arab yang tepat?", "٨ (tsamaaniyah)", ["٧ (sab'ah)", "٦ (sittah)", "٩ (tis'ah)"], "Angka delapan ditulis dengan lambang terbuka ke bawah '٨'.", 2),
    ("Jika Fatimah ditanya 'أَيْنَ بَيْتُكِ؟', jawaban yang benar dengan dhamir perempuan adalah ...", "بَيْتِي فِي شَارِعِ أَحْمَد يَانِي", ["بَيْتُهُ فِي شَارِعِ أَحْمَد يَانِي", "بَيْتُهَا فِي شَارِعِ أَحْمَد يَانِي", "بَيْتُكَ فِي شَارِعِ أَحْمَد يَانِي"], "Saat menjawab untuk diri sendiri, laki-laki maupun perempuan memakai 'baitii' (بَيْتِي).", 2),
    ("Arti dari ungkapan 'مَا عُنْوَانُ مَدْرَسَتِكَ؟' adalah ...", "Di mana alamat sekolahmu?", ["Kapan kamu berangkat ke sekolah?", "Siapa nama kepala sekolahmu?", "Berapa banyak siswa di sekolahmu?"], "Maa 'unwaanu madrasatika artinya apa/di mana alamat sekolahmu.", 2),
    ("Perhatikan dialog: 'هَلْ بَيْتُكَ بَعِيدٌ؟ - لَا، بَلْ بَيْتِي ...'. Kata yang tepat melengkapi adalah ...", "قَرِيبٌ (dekat)", ["كَبِيرٌ (besar)", "جَدِيدٌ (baru)", "وَاسِعٌ (luas)"], "Lawan dari ba'iid (jauh) adalah qariib (dekat).", 2),
    ("Bilangan genap antara 1 sampai 10 dalam bahasa Arab adalah ...", "اِثْنَانِ، أَرْبَعَةٌ، سِتَّةٌ، ثَمَانِيَةٌ", ["وَاحِدٌ، ثَلَاثَةٌ، خَمْسَةٌ، سَبْعَةٌ", "ثَلَاثَةٌ، سِتَّةٌ، تِسْعَةٌ، عَشَرَةٌ", "أَرْبَعَةٌ، خَمْسَةٌ، سِتَّةٌ، سَبْعَةٌ"], "Bilangan genap: 2 (itsnan), 4 (arba'ah), 6 (sittah), 8 (tsamaniyah).", 2),
    ("Susunan kata yang benar dari kata acak: [فِي - بَيْتِي - شَارِعِ - مَاوَار] adalah ...", "بَيْتِي فِي شَارِعِ مَاوَار", ["شَارِعِ مَاوَار فِي بَيْتِي", "فِي بَيْتِي مَاوَار شَارِعِ", "مَاوَار شَارِعِ فِي بَيْتِي"], "Susunan gramatikal yang tepat: Baitii fii syaari' mawaar (Rumahku di Jl Mawar).", 2),
    ("Lafal Arab untuk angka sembilan (٩) adalah ...", "تِسْعَةٌ (tis'ah)", ["سَبْعَةٌ (sab'ah)", "سِتَّةٌ (sittah)", "ثَمَانِيَةٌ (tsamaaniyah)"], "Angka 9 dibaca tis'ah (تِسْعَةٌ).", 2),
    ("Perhatikan kalimat: 'أَسْكُنُ فِي الْقَرْيَةِ'. Makna kata أَسْكُنُ adalah ...", "saya bertempat tinggal", ["saya pergi bermain", "saya sedang belajar", "saya membeli makanan"], "Askanu (أَسْكُنُ) bermakna saya tinggal atau bermukim.", 2),
    ("Apa arti ungkapan 'أَهْلًا وَسَهْلًا' yang sering digunakan saat menerima tamu di rumah?", "selamat datang", ["sampai jumpa lagi", "terima kasih banyak", "semoga selamat"], "Ahlan wa sahlan adalah sapaan menyambut kedatangan tamu.", 2),
    ("Jawaban santun untuk sapaan 'أَهْلًا وَسَهْلًا' kepada teman laki-laki adalah ...", "أَهْلًا بِكَ", ["مَعَ السَّلَامَةِ", "شُكْرًا جَزِيلًا", "صَبَاحُ الْخَيْرِ"], "Ahlan bika (أَهْلًا بِكَ) diucapkan sebagai balasan selamat datang.", 2),

    # d3 (6)
    ("Analisis struktur: Manakah kalimat penunjukan alamat rumah yang paling lengkap dan kaidahnya tepat?", "بَيْتِي فِي شَارِعِ بَاتُورَقْمُ ٧ مَدِينَةُ مَالَانْج", ["بَيْتِي إِلَى مَدِينَةِ مَالَانْج شَارِعٌ رَقْمٌ", "فِي شَارِعِ رَقْمُ بَيْتِي مَالَانْج مَدِينَةٌ", "مَدِينَةُ مَالَانْج فِي بَيْتِي شَارِعِ رَقْمُ ٧"], "Kalimat runut menyebutkan kepemilikan, nama jalan, nomor, lalu kota.", 3),
    ("Mengapa kata tanya 'مَا' digunakan pada 'مَا عُنْوَانُكَ؟', bukan kata tanya 'أَيْنَ'?", "karena menanyakan frasa nomina alamat secara utuh", ["karena alamat adalah benda hidup berakal", "karena 'aina' hanya boleh untuk nama orang", "karena kata 'unwan' tidak memiliki arti tempat"], "'Maa' menanyakan identitas (apa alamatmu), sedangkan 'Aina' menanyakan letak fisik.", 3),
    ("Jika nomor telepon paman adalah ٠٨٥٧, bagaimana cara membaca digit tersebut dalam bahasa Arab?", "صِفْرٌ، ثَمَانِيَةٌ، خَمْسَةٌ، سَبْعَةٌ", ["وَاحِدٌ، سَبْعَةٌ، سِتَّةٌ، خَمْسَةٌ", "ثَلَاثَةٌ، ثَمَانِيَةٌ، أَرْبَعَةٌ، اثْنَانِ", "تِسْعَةٌ، خَمْسَةٌ، سِتَّةٌ، ثَلَاثَةٌ"], "Digit per digit: Shifr (0), tsamaniyah (8), khamsah (5), sab'ah (7).", 3),
    ("Nilai adab Islami: Saat seorang muslim ditanya alamat rumahnya oleh teman yang ingin bersilaturahmi, sikap terbaik adalah ...", "memberitahukan dengan jelas dan ramah", ["merahasiakan alamat karena curiga", "memberikan nomor rumah palsu", "meminta uang sebelum menjawab"], "Memudahkan silaturahmi adalah anjuran mulia dalam persaudaraan Islam.", 3),
    ("Perhatikan dialog: 'أَيْنَ مَدْرَسَتُكَ؟ - مَدْرَسَتِي أَمَامَ الْمَسْجِدِ'. Makna kata أَمَامَ adalah ...", "di depan masjid", ["di belakang masjid", "di dalam masjid", "di atas loteng masjid"], "Amaama (أَمَامَ) adalah zhorof makan yang bermakna di depan.", 3),
    ("Bagaimana cara menulis angka Arab untuk tahun pelajaran '2024' yang benar?", "٢٠٢٤", ["٤٢٠٢", "١٤٤٥", "٢٠٢٣"], "Aksara angka Arab ditulis dari kiri ke kanan: 2 (٢), 0 (٠), 2 (٢), 4 (٤).", 3),
]

# BAB 2: الْمِهْنَةُ (Profesi: 33 soal -> 13 d1, 13 d2, 7 d3)
b2_data = [
    # d1 (13)
    ("Kata الْمِهْنَةُ (al-mihnah) dalam bahasa Indonesia memiliki arti ...", "profesi atau pekerjaan", ["hobi kegemaran", "tempat rekreasi", "cita-cita masa depan"], "Al-Mihnah bermakna mata pencaharian, tugas profesi, atau pekerjaan.", 1),
    ("Bahasa Arab dari profesi 'guru laki-laki' adalah ...", "مُدَرِّسٌ (mudarrisun)", ["طَبِيبٌ (thabiibun)", "فَلَّاحٌ (fallaaHun)", "شُرْطِيٌّ (syurthiyyun)"], "Mudarrisun atau ustaadzun adalah sebutan untuk pengajar laki-laki.", 1),
    ("Bahasa Arab dari profesi 'guru perempuan' adalah ...", "مُدَرِّسَةٌ (mudarrisatun)", ["طَبِيبَةٌ (thabiibatun)", "تَاجِرَةٌ (taajiratun)", "فَلَّاحَةٌ (fallaaHatun)"], "Bentuk muannats (perempuan) ditandai dengan ta' marbuthah: mudarrisah.", 1),
    ("Kata طَبِيبٌ (thabiibun) memiliki arti profesi sebagai ...", "dokter yang mengobati pasien", ["pilot pesawat terbang", "sopir mobil ambulans", "penjahit busana"], "Thabiib (طَبِيبٌ) artinya dokter.", 1),
    ("Profesi orang yang bertugas menjaga keamanan dan ketertiban lalu lintas adalah ...", "شُرْطِيٌّ (syurthiyyun)", ["جُنْدِيٌّ (jundiyyun)", "مُهَنْدِسٌ (muhandisun)", "تَاجِرٌ (taajirun)"], "Syurthiyyun bermakna polisi.", 1),
    ("Kata فَلَّاحٌ (fallaaHun) memiliki arti profesi sebagai ...", "petani yang bercocok tanam", ["nelayan penangkap ikan", "pedagang di pasar", "koki pembuat kue"], "Fallah (فَلَّاحٌ) adalah petani pembudidaya sawah dan ladang.", 1),
    ("Bahasa Arab dari profesi 'pedagang laki-laki' adalah ...", "تَاجِرٌ (taajirun)", ["طَيَّارٌ (thoyyaarun)", "خَيَّاطٌ (khayyaathun)", "سَائِقٌ (saa-iqun)"], "Taajir (تَاجِرٌ) adalah saudagar atau pedagang perniagaan.", 1),
    ("Kata جُنْدِيٌّ (jundiyyun) memiliki arti profesi sebagai ...", "tentara pembela tanah air", ["polisi pamong praja", "nahkoda kapal laut", "satpam perumahan"], "Jundiyyun artinya prajurit militer atau tentara.", 1),
    ("Kata tunjuk (isim isyarah) untuk benda atau orang laki-laki dekat adalah ...", "هَذَا (hadza)", ["هَذِهِ (hadzihi)", "تِلْكَ (tilka)", "ذَلِكَ (dzalika)"], "Hadza (هَذَا) digunakan untuk menunjuk muzakkar (laki-laki) jarak dekat.", 1),
    ("Kata tunjuk (isim isyarah) untuk benda atau orang perempuan dekat adalah ...", "هَذِهِ (hadzihi)", ["هَذَا (hadza)", "هُوَ (huwa)", "أَنْتَ (anta)"], "Hadzihi (هَذِهِ) digunakan untuk menunjuk muannats (perempuan) jarak dekat.", 1),
    ("Kata ganti (dhamir) orang ketiga tunggal laki-laki 'dia laki-laki' adalah ...", "هُوَ (huwa)", ["هِيَ (hiya)", "أَنَا (ana)", "نَحْنُ (nahnu)"], "Huwa (هُوَ) bermakna dia (seorang laki-laki).", 1),
    ("Kata ganti (dhamir) orang ketiga tunggal perempuan 'dia perempuan' adalah ...", "هِيَ (hiya)", ["هُوَ (huwa)", "أَنْتَ (anta)", "أَنْتِ (anti)"], "Hiya (هِيَ) bermakna dia (seorang perempuan).", 1),
    ("Profesi orang yang menjahit pakaian dalam bahasa Arab disebut ...", "خَيَّاطٌ (khayyaathun)", ["طَبَّاخٌ (thabbaakhun)", "حَلَّاقٌ (hallaAqun)", "نَجَّارٌ (najjaarun)"], "Khayyath (خَيَّاطٌ) bermakna tukang jahit pakaian.", 1),

    # d2 (13)
    ("Lengkapi kalimat: 'هَذَا أَبِي، ... طَبِيبٌ مَاهِرٌ'. Kata ganti yang tepat adalah ...", "هُوَ (dia laki-laki)", ["هِيَ (dia perempuan)", "أَنْتِ (kamu perempuan)", "هَذِهِ (ini perempuan)"], "Ayah (أَبِي) adalah muzakkar, kata ganti yang tepat adalah huwa (هُوَ).", 2),
    ("Lengkapi kalimat: 'هَذِهِ أُمِّي، ... مُدَرِّسَةٌ فِي الْمَدْرَسَةِ'. Kata ganti yang tepat adalah ...", "هِيَ (dia perempuan)", ["هُوَ (dia laki-laki)", "أَنْتَ (kamu laki-laki)", "هَذَا (ini laki-laki)"], "Ibu (أُمِّي) adalah muannats, kata ganti yang tepat adalah hiya (هِيَ).", 2),
    ("Perhatikan kalimat: 'الْفَلَّاحُ يَزْرَعُ الرُّزَّ فِي الْمَزْرَعَةِ'. Di manakah petani bekerja?", "فِي الْمَزْرَعَةِ (di sawah/ladang)", ["فِي الْمُسْتَشْفَى (di rumah sakit)", "فِي السُّوقِ (di pasar raya)", "فِي الْمَدْرَسَةِ (di sekolah)"], "Petani menanam padi di sawah atau ladang (al-mazra'ah).", 2),
    ("Perhatikan kalimat: 'الطَّبِيبُ يُعَالِجُ الْمَرِيضَ فِي الْمُسْتَشْفَى'. Kata الْمُسْتَشْفَى artinya ...", "rumah sakit umum", ["kantor polisi", "pasar tradisional", "stasiun kereta"], "Al-Mustasyfa (الْمُسْتَشْفَى) bermakna rumah sakit tempat pengobatan.", 2),
    ("Pasangan kata isim isyarah dan kata benda muannats yang sesuai kaidah adalah ...", "هَذِهِ شُرْطِيَّةٌ", ["هَذَا شُرْطِيَّةٌ", "هَذِهِ شُرْطِيٌّ", "هَذَا مُدَرِّسَةٌ"], "Muannats bertanda ta' marbuthah berpasangan dengan isim isyarah hadzihi.", 2),
    ("Kata سَائِقٌ (saa-iqun) adalah sebutan untuk orang yang berprofesi sebagai ...", "pengemudi sopir kendaraan", ["peternak sapi perah", "tukang kebun bunga", "petugas kebersihan jalan"], "Saa-iq (سَائِقٌ) artinya sopir atau pengendara.", 2),
    ("Kalimat tanya yang tepat untuk menanyakan pekerjaan ayah teman adalah ...", "مَا مِهْنَةُ أَبِيكَ؟", ["أَيْنَ بَيْتُ أَبِيكَ؟", "كَمْ عُمْرُ أَبِيكَ؟", "مَا اسْمُ أَبِيكَ؟"], "Maa mihnatu abiika digunakan untuk menanyakan apa profesi ayahmu.", 2),
    ("Jika seseorang bekerja mengemudikan pesawat terbang, profesinya adalah ...", "طَيَّارٌ (pilot)", ["بَحَّارٌ (pelaut)", "سَائِقٌ (sopir)", "جُنْدِيٌّ (tentara)"], "Thoyyaar (طَيَّارٌ) artinya penerbang atau pilot pesawat.", 2),
    ("Perhatikan kalimat: 'عَمِّي تَاجِرٌ، يَبِيعُ الْفَوَاكِهَ فِي السُّوقِ'. Kata السُّوقِ artinya ...", "pasar perniagaan", ["sekolah dasar", "rumah sakit", "bandara udara"], "As-Suuq (السُّوقِ) bermakna pasar tempat jual beli barang.", 2),
    ("Bentuk muannats dari kata طَالِبٌ (siswa laki-laki) adalah ...", "طَالِبَةٌ (siswi perempuan)", ["طَبِيبَةٌ (dokter perempuan)", "مُعَلِّمَةٌ (guru perempuan)", "مُهَنْدِسَةٌ (insinyur perempuan)"], "Perubahan muzakkar ke muannats menambahkan akhiran ta' marbuthah: thaalibah.", 2),
    ("Lengkapi dialog: 'مَنْ هَذَا؟ - هَذَا أَخِي، هُوَ ...'. Pilihan profesi yang cocok untuk muzakkar adalah ...", "مُهَنْدِسٌ (insinyur)", ["مُهَنْدِسَةٌ (insinyur wanita)", "طَبِيبَةٌ (dokter wanita)", "مُدَرِّسَةٌ (guru wanita)"], "Subjek akhii (saudara laki-laki) membutuhkan predikat muzakkar muhandis.", 2),
    ("Profesi orang yang merancang bangunan gedung dan jembatan adalah ...", "مُهَنْدِسٌ (arsitek/insinyur)", ["شُرْطِيٌّ (polisi)", "مُدَرِّسٌ (guru)", "فَلَّاحٌ (petani)"], "Muhandis (مُهَنْدِسٌ) bermakna insinyur atau perancang konstruksi.", 2),
    ("Arti dari kalimat: 'أُمِّي رَبَّةُ الْبَيْتِ' adalah ...", "Ibuku seorang ibu rumah tangga", ["Ibuku seorang perawat pasien", "Ibuku berdagang di pasar", "Ibuku bekerja di kantor pos"], "Rabbatul baiti bermakna ibu rumah tangga yang mengelola keluarga.", 2),

    # d3 (7)
    ("Analisis tata bahasa: Manakah kalimat yang seluruh penyesuaian gender kata (muzakkar/muannats) tepat?", "هَذِهِ أُخْتِي، هِيَ مُمَرِّضَةٌ نَشِيطَةٌ", ["هَذَا أُخْتِي، هُوَ مُمَرِّضٌ نَشِيطٌ", "هَذِهِ أُخْتِي، هُوَ مُمَرِّضَةٌ نَشِيطَةٌ", "هَذَا أُخْتِي، هِيَ مُمَرِّضَةٌ نَشِيطٌ"], "Subjek ukhtii muannats selaras dengan hadzihi, hiya, mumarridhatun, dan nasyiithah.", 3),
    ("Perhatikan teks: 'هَذَا خَالِي. هُوَ شُرْطِيٌّ. هُوَ يُنَظِّمُ الْمُرُورَ فِي الشَّارِعِ'. Apa tugas paman dalam teks?", "mengatur kelancaran lalu lintas jalan", ["menangkap ikan di lautan luas", "mengobati orang sakit di klinik", "mengajar matematika di kelas"], "Teks menyebutkan 'yunazzhimul muruur' yang artinya menertibkan lalu lintas.", 3),
    ("Bagaimana cara mengubah kalimat 'أَبِي مُوَظَّفٌ فِي الْمَكْتَبِ' menjadi kalimat untuk ibu?", "أُمِّي مُوَظَّفَةٌ فِي الْمَكْتَبِ", ["أُمِّي مُوَظَّفٌ فِي الْمَكْتَبَةِ", "أُمِّي مُدَرِّسٌ فِي الْمَكْتَبِ", "أُمِّي فَلَّاحَةٌ فِي الْمَكْتَبِ"], "Abii diganti ummii, dan muwazhzhaf disesuaikan menjadi muwazhzhafah.", 3),
    ("Pernyataan hikmah: Mengapa dalam pandangan Islam semua profesi halal yang ditekuni dengan jujur bernilai ibadah?", "karena ikhtiar mencari nafkah halal bernilai pahala", ["karena hanya profesi guru yang diridhai Allah", "karena semua pekerjaan menghasilkan uang sama", "karena di dunia tidak ada pekerjaan yang salah"], "Niat ikhlas bekerja halal memenuhi kebutuhan keluarga dihitung sedekah ibadah.", 3),
    ("Perhatikan kalimat: 'الْمُعَلِّمُ يَشْرَحُ الدَّرْسَ بِجِدٍّ'. Sikap siswa meneladani guru yang mengajar bersungguh-sungguh adalah ...", "menyimak penjelasan guru dengan takzim", ["berbicara sendiri saat guru mengajar", "bermain lempar kertas di dalam kelas", "mengabaikan nasihat yang diberikan"], "Menghormati guru (ta'zhimul ustadz) adalah kunci keberkahan ilmu.", 3),
    ("Jika seorang anak ingin memperkenalkan kakeknya yang seorang pensiunan tentara, kalimat yang tepat adalah ...", "هَذَا جَدِّي، هُوَ جُنْدِيٌّ مُتَقَاعِدٌ", ["هَذِهِ جَدَّتِي، هِيَ جُنْدِيَّةٌ", "هَذَا أَبِي، هِيَ شُرْطِيَّةٌ", "هَذِهِ عَمَّتِي، هُوَ طَبِيبٌ"], "Jaddii muzakkar menggunakan hadza dan huwa jundiyyun.", 3),
    ("Refleksi Kurikulum Berbasis Cinta (KBC): Menghargai profesi petani (fallah) diwujudkan dengan perilaku ...", "menghabiskan makanan tanpa membuangnya", ["mengejek pakaian petani yang kotor", "menolak makan nasi produksi petani", "merusak tanaman di pinggir jalan"], "Menghargai jerih payah petani diwujudkan dengan tidak menyia-nyiakan makanan.", 3),
]

# BAB 3: أَمَلِي (Cita-citaku: 33 soal -> 13 d1, 13 d2, 7 d3)
b3_data = [
    # d1 (13)
    ("Kata أَمَلِي (amalii) dalam bahasa Indonesia memiliki arti ...", "cita-cita atau harapanku", ["nama panggilanku", "alamat tempat tinggalku", "keluarga besarku"], "Amalii (أَمَلِي) bermakna impian, harapan, atau cita-cita masa depan.", 1),
    ("Kata فِي الْمُسْتَقْبَلِ (fiil mustaqbali) memiliki arti ...", "di masa depan kelak", ["di masa lalu dahulu", "di hari kemarin", "pada pagi hari ini"], "Al-Mustaqbal bermakna masa depan yang akan datang.", 1),
    ("Ungkapan bahasa Arab 'أُرِيدُ أَنْ أَكُونَ ...' memiliki arti ...", "Saya ingin menjadi ...", ["Saya telah menjadi ...", "Kamu tidak boleh menjadi ...", "Mereka sedang melihat ...", ], "Uriidu an akuuna adalah kalimat ekspresi menyatakan cita-cita profesi.", 1),
    ("Jika Ahmad ingin bercita-cita menjadi dokter, ia mengucapkan ...", "أُرِيدُ أَنْ أَكُونَ طَبِيبًا", ["أُرِيدُ أَنْ أَكُونَ شُرْطِيًّا", "أُرِيدُ أَنْ أَكُونَ طَيَّارًا", "أُرِيدُ أَنْ أَكُونَ فَلَّاحًا"], "Thabiiban (طَبِيبًا) bermakna dokter.", 1),
    ("Jika Aisyah bercita-cita menjadi guru perempuan, ia mengucapkan ...", "أُرِيدُ أَنْ أَكُونَ مُدَرِّسَةً", ["أُرِيدُ أَنْ أَكُونَ مُدَرِّسًا", "أُرِيدُ أَنْ أَكُونَ شُرْطِيًّا", "أُرِيدُ أَنْ أَكُونَ جُنْدِيًّا"], "Untuk perempuan (muannats) menggunakan akhiran ta' marbuthah: mudarrisatan.", 1),
    ("Pertanyaan yang tepat untuk menanyakan cita-cita kepada teman adalah ...", "مَا أَمَلُكَ فِي الْمُسْتَقْبَلِ؟", ["مَا اسْمُ أُخْتِكَ؟", "أَيْنَ تَدْرُسُ الْآنَ؟", "كَمْ سَاعَةً تَنَامُ؟"], "Maa amaluka fiil mustaqbal artinya apa cita-citamu di masa depan.", 1),
    ("Cita-cita menjadi pilot dalam bahasa Arab dinyatakan dengan ungkapan ...", "أُرِيدُ أَنْ أَكُونَ طَيَّارًا", ["أُرِيدُ أَنْ أَكُونَ بَحَّارًا", "أُرِيدُ أَنْ أَكُونَ خَيَّاطًا", "أُرِيدُ أَنْ أَكُونَ نَجَّارًا"], "Thoyyaaran (طَيَّارًا) artinya pilot penerbang.", 1),
    ("Arti dari ungkapan mahfuzhat 'مَنْ جَدَّ وَجَدَ' adalah ...", "Barang siapa bersungguh-sungguh, dapatlah ia", ["Waktu itu bagaikan sebilah pedang", "Kebersihan adalah sebagian dari iman", "Menuntut ilmu itu hukumnya wajib"], "Man jadda wajada adalah pepatah motivasi ketekunan menggapai cita-cita.", 1),
    ("Kata مُهَنْدِسًا (muhandisan) dalam konteks cita-cita bermakna ...", "insinyur atau arsitek teknik", ["atlet olahraga lari", "seniman pelukis kanvas", "pedagang pakaian jadi"], "Muhandis bermakna insinyur perancang bangunan atau teknologi.", 1),
    ("Jika seorang siswa ingin menjadi polisi untuk menjaga keamanan, ia berkata ...", "أُرِيدُ أَنْ أَكُونَ شُرْطِيًّا", ["أُرِيدُ أَنْ أَكُونَ طَبَّاخًا", "أُرِيدُ أَنْ أَكُونَ سَائِقًا", "أُرِيدُ أَنْ أَكُونَ حَلَّاقًا"], "Syurthiyyan (شُرْطِيًّا) bermakna polisi penegak hukum.", 1),
    ("Cita-cita menjadi seorang dosen atau guru besar disebut ...", "أُسْتَاذًا (ustadz/profesor)", ["جُنْدِيًّا (prajurit)", "فَلَّاحًا (petani)", "تَاجِرًا (pedagang)"], "Ustaadz (أُسْتَاذٌ) adalah gelar pendidik atau profesor terhormat.", 1),
    ("Kalimat 'أَحْمَدُ يُحِبُّ الْقِرَاءَةَ' memiliki arti ...", "Ahmad gemar membaca buku", ["Ahmad suka berenang di kolam", "Ahmad sedang tidur lelap", "Ahmad pergi berbelanja"], "Yuhibbul qiraa'ah bermakna menyukai aktivitas membaca.", 1),
    ("Kata نَاجِحٌ (naajihun) dalam menggapai cita-cita memiliki arti ...", "sukses dan berhasil", ["malas dan putus asa", "ketinggalan zaman", "tergesa-gesa terburu"], "Naajih (نَاجِحٌ) artinya orang yang meraih kesuksesan.", 1),

    # d2 (13)
    ("Lengkapi kalimat: 'فَاطِمَةُ تُحِبُّ الرَّسْمَ، تُرِيدُ أَنْ تَكُونَ ...'. Profesi yang sesuai adalah ...", "رَسَّامَةً (pelukis perempuan)", ["طَبِيبَةً (dokter wanita)", "شُرْطِيَّةً (polisi wanita)", "مُهَنْدِسَةً (arsitek wanita)"], "Ar-Rasmu artinya menggambar, profesinya adalah rassaamah (pelukis).", 2),
    ("Perhatikan dialog: 'لِمَاذَا تُرِيدُ أَنْ تَكُونَ طَبِيبًا؟ - لِأَنِّي أُرِيدُ أَنْ ...'. Jawaban alasan yang mulia adalah ...", "أُعَالِجَ الْمَرْضَى (mengobati pasien sakit)", ["أَبِيعَ الْفَوَاكِهَ (menjual aneka buah)", "أَسُوقَ الطَّائِرَةَ (menerbangkan pesawat)", "أَزْرَعَ الرُّزَّ (menanam padi di sawah)"], "Tujuan luhur seorang dokter adalah merawat dan mengobati orang sakit.", 2),
    ("Makna dari ungkapan: 'أَتَعَلَّمُ بِجِدٍّ لِأَنَالَ أَمَلِي' adalah ...", "Saya belajar tekun demi meraih cita-citaku", ["Saya bermain bola bersama teman sebangku", "Saya membantu orang tua berdagang di pasar", "Saya bangun pagi lalu segera berolahraga"], "Niat belajar sungguh-sungguh (bi jiddin) untuk mencapai harapan.", 2),
    ("Jika seorang siswi ditanya 'مَا أَمَلُكِ فِي الْمُسْتَقْبَلِ؟', bentuk kata kerja yang ia gunakan adalah ...", "أُرِيدُ أَنْ أَكُونَ ...", ["تُرِيدُ أَنْ تَكُونَ ...", "يُرِيدُ أَنْ يَكُونَ ...", "نُرِيدُ أَنْ نَكُونَ ..."], "Dhamir orang pertama tunggal 'ana' (saya) selalu mengawali dengan uriidu an akuuna.", 2),
    ("Pasangan cita-cita dan tempat pengabdian yang paling tepat adalah ...", "طَبِيبٌ - فِي الْمُسْتَشْفَى", ["مُدَرِّسٌ - فِي الْمَطَارِ", "طَيَّارٌ - فِي الْمَدْرَسَةِ", "فَلَّاحٌ - فِي الْمَكْتَبِ"], "Thabiib (dokter) berikhtiar di mustasyfa (rumah sakit).", 2),
    ("Makna kata kerja 'يَبْنِي' dalam kalimat 'الْمُهَنْدِسُ يَبْنِي الْعِمَارَةَ' adalah ...", "membangun gedung megah", ["merobohkan jembatan lama", "mengecat dinding sekolah", "membersihkan halaman rumah"], "Yabnii (يَبْنِي) artinya merancang dan mendirikan konstruksi bangunan.", 2),
    ("Arti dari ungkapan 'أَمَلِي أَنْ أَكُونَ جُنْدِيًّا لِأُدَافِعَ عَنِ الْوَطَنِ' adalah ...", "Cita-citaku tentara pembela tanah air", ["Cita-citaku menjadi nahkoda kapal pesiar", "Cita-citaku menjadi pengusaha yang kaya", "Cita-citaku membuka restoran masakan"], "Li udaafi'a 'anil wathan artinya untuk membela tanah air Indonesia tercinta.", 2),
    ("Lafal pepatah Arab: 'الوقت كالسيف' mengajarkan kepada penuntut ilmu agar ...", "menghargai waktu dengan disiplin belajar", ["selalu membawa senjata tajam", "bermain pedang di tanah lapang", "menghabiskan waktu dengan tidur"], "Pepatah 'waktu laksana pedang' menekankan pentingnya manajemen waktu.", 2),
    ("Susunan kalimat yang benar dari: [أَنْ - أُرِيدُ - أَكُونَ - شُرْطِيًّا - نَاجِحًا] adalah ...", "أُرِيدُ أَنْ أَكُونَ شُرْطِيًّا نَاجِحًا", ["أَكُونَ شُرْطِيًّا أُرِيدُ أَنْ نَاجِحًا", "شُرْطِيًّا نَاجِحًا أُرِيدُ أَكُونَ أَنْ", "أَنْ أُرِيدُ نَاجِحًا أَكُونَ شُرْطِيًّا"], "Struktur pola yang baku: Uriidu an akuuna syurthiyyan naajihan.", 2),
    ("Perhatikan kalimat: 'أُحِبُّ أَنْ أَقْرَأَ الْكُتُبَ كُلَّ يَوْمٍ'. Aktivitas yang dilakukan setiap hari adalah ...", "membaca buku ilmu pengetahuan", ["menulis surat kabar daerah", "mendengarkan siaran radio", "menonton film kartun anak"], "Aqra-ul kutuba bermakna membaca buku-buku faedah.", 2),
    ("Lengkapi kalimat: 'عَلِيٌّ يُحِبُّ الطَّيَرَانَ، أَمَلُهُ أَنْ يَكُونَ ...'. Pilihan tepat adalah ...", "طَيَّارًا (pilot penerbang)", ["فَلَّاحًا (petani sawah)", "خَيَّاطًا (penjahit baju)", "تَاجِرًا (pedagang pasar)"], "Thayaran berkaitan dengan dunia dirgantara, cita-citanya menjadi thoyyar.", 2),
    ("Bentuk muannats dari ungkapan 'أُرِيدُ أَنْ أَكُونَ شُرْطِيًّا' bagi seorang anak perempuan adalah ...", "أُرِيدُ أَنْ أَكُونَ شُرْطِيَّةً", ["أُرِيدُ أَنْ أَكُونَ شُرْطِيًّا", "تُرِيدُ أَنْ تَكُونَ شُرْطِيًّا", "يُرِيدُ أَنْ يَكُونَ شُرْطِيَّةً"], "Muannats menambahkan ta' marbuthah berharakat fathatain: syurthiyyatan.", 2),
    ("Arti kata جِدٌّ (jiddun) dalam proses belajar menggapai impian adalah ...", "kesungguhan dan ketekunan tekad", ["kebimbangan dan keraguan hati", "keterpaksaan menjalankan tugas", "kelalaian mengerjakan PR"], "Jiddun artinya keseriusan dan kerja keras pantang putus asa.", 2),

    # d3 (7)
    ("Analisis sintaksis: Mengapa kata setelah 'أَنْ أَكُونَ' memiliki akhiran harakat fathatain (manshub), seperti pada 'طَبِيبًا'?", "karena berkedudukan sebagai khabar kaana yang manshub", ["karena berkedudukan sebagai fail marfu'", "karena didahului oleh huruf jar kasrah", "karena berupa kata sifat yang majzum"], "Dalam kaidah nahwu, khabar kaana (dan saudaranya) berhukum manshub (fathatain).", 3),
    ("Perhatikan teks: 'حَسَنٌ يَتَعَلَّمُ اللُّغَةَ الْعَرَبِيَّةَ بِجِدٍّ. أَمَلُهُ أَنْ يَكُونَ مُتَرْجِمًا لِيَخْدُمَ دِينَهُ وَوَطَنَهُ'. Apa tujuan Hasan?", "menjadi penerjemah pembela agama dan bangsa", ["mencari gaji yang sangat tinggi di luar negeri", "berwisata keliling dunia tanpa bekerja", "membeli mobil mewah dari hasil terjemahan"], "Teks menyebutkan 'mutarjiman li yakhduma diinahu wa wathanahu'.", 3),
    ("Sikap seorang santri ketika cita-citanya berbeda dengan pilihan teman sekelasnya adalah ...", "saling mendoakan dan saling menghargai pilihan", ["mengejek cita-cita teman yang sederhana", "memaksa teman mengikuti cita-citanya sendiri", "merasa dirinya paling hebat di antara semua"], "Keragaman profesi saling melengkapi kebutuhan kemaslahatan umat.", 3),
    ("Korelasi Kurikulum Berbasis Cinta (KBC) dalam meraih cita-cita adalah ...", "mendasari impian dengan cinta melayani sesama", ["mengejar kekayaan demi merendahkan orang lain", "mencari pujian dan ketenaran di media sosial", "memanfaatkan jabatan untuk menindas sesama"], "Cita-cita yang luhur berakar dari cinta kepada Allah dan kemanfaatan bagi sesama.", 3),
    ("Bagaimana cara seorang siswa mengamalkan nilai 'Man Jadda Wajada' saat menemui materi pelajaran yang sulit?", "pantang menyerah, mengulang bacaan, dan bertanya", ["meninggalkan buku dan bermain ponsel seharian", "menyalahkan kurikulum yang dianggap berat", "meminta orang lain mengerjakan seluruh tugasnya"], "Ketekunan sejati dibuktikan dengan daya tahan menghadapi rintangan intelektual.", 3),
    ("Perhatikan paragraf: 'زَيْنَبُ تُرِيدُ أَنْ تَكُونَ عَالِمَةً فِي الْفَلَكِ لِتَتَفَكَّرَ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ'. Karakter yang tampak pada Zainab adalah ...", "kecintaan pada sains untuk mengagungkan kebesaran Allah", ["keinginan menjadi manusia pertama di planet mars", "rasa sombong karena menguasai ilmu antariksa", "ketakutan melihat fenomena gerhana bintang"], "Tadabbur alam semesta menguatkan tauhid dan kecintaan kepada Sang Pencipta.", 3),
    ("Refleksi etika: Apa yang harus dilakukan seorang muslim jika setelah berusaha keras, takdir menentukan ia bekerja di bidang lain?", "bersyukur, berhusnudzon pada ketetapan Allah, dan amanah", ["marah dan berhenti beribadah kepada Allah", "berputus asa dan menyalahkan semua keadaan", "menghalalkan segala cara agar ambisi tercapai"], "Tawakal sejati: ridha pada takdir Allah setelah ikhtiar optimal dijalankan.", 3),
]

def main():
    target_dir = "/home/maman/play/konten/kelas4-sem1/bahasa-arab"
    batches = [
        ("b1-al-unwan.json", b1_data),
        ("b2-al-mihnah.json", b2_data),
        ("b3-amali.json", b3_data)
    ]
    
    total = 0
    longest_count = 0
    
    for filename, raw_items in batches:
        qs = []
        for i, item in enumerate(raw_items):
            q_text, c_ans, dists, expl, diff = item
            q_obj = build_q(q_text, c_ans, dists, expl, diff, i)
            qs.append(q_obj)
            
            # Check length bias
            lens = [len(o) for o in q_obj["options"]]
            max_len = max(lens)
            max_idx = lens.index(max_len)
            if max_idx == q_obj["answer"]:
                longest_count += 1
                
        save_batch(target_dir, filename, qs)
        total += len(qs)
        
    print(f"Total Bahasa Arab generated: {total} questions across {len(batches)} batches.")
    print(f"Longest key bias check: {longest_count}/{total} = {longest_count/total*100:.1f}%")

if __name__ == "__main__":
    main()
