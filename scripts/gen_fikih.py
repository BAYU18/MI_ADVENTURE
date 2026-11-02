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
        "timeLimit": 20
    }

def save_batch(folder, filename, questions):
    os.makedirs(folder, exist_ok=True)
    filepath = os.path.join(folder, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(questions)} questions to {filepath}")

# BAB 1: Berani Berkhitan (35 soal: 14 d1, 14 d2, 7 d3)
b1_data = [
    # d1 (14)
    ("Secara bahasa kata khitan berasal dari bahasa Arab yang berarti ...", "memotong", ["membasuh", "mengikat", "menyucikan"], "Khitan berasal dari kata khatana yang artinya memotong.", 1),
    ("Bagian kulit yang dipotong saat khitan bagi laki-laki disebut ...", "kulup (qulfah)", ["rambut ketiak", "kuku jari", "kulit tumit"], "Khitan adalah memotong kulup (qulfah) yang menutupi ujung kemaluan.", 1),
    ("Nabi yang pertama kali diperintahkan Allah untuk berkhitan adalah ...", "Nabi Ibrahim a.s.", ["Nabi Adam a.s.", "Nabi Musa a.s.", "Nabi Isa a.s."], "Nabi Ibrahim a.s. adalah nabi pertama yang melaksanakan khitan.", 1),
    ("Hukum khitan bagi anak laki-laki muslim menurut mayoritas ulama adalah ...", "wajib", ["sunnah muakkad", "mubah (boleh)", "makruh"], "Mayoritas ulama mewajibkan khitan bagi anak laki-laki.", 1),
    ("Usia Nabi Ibrahim a.s. ketika pertama kali berkhitan adalah sekitar ...", "80 tahun", ["40 tahun", "60 tahun", "100 tahun"], "Dalam hadis sahih disebutkan Nabi Ibrahim berkhitan pada usia 80 tahun.", 1),
    ("Alat yang digunakan Nabi Ibrahim a.s. saat pertama kali berkhitan adalah ...", "kampak (al-qaddum)", ["pisau bedah baja", "gunting perak", "pedang besi"], "Nabi Ibrahim a.s. berkhitan menggunakan alat pahat atau kampak.", 1),
    ("Manfaat utama khitan dari sudut pandang kesehatan medis adalah ...", "mencegah penumpukan kotoran kencing", ["membuat tubuh cepat tinggi", "meningkatkan nafsu makan", "mencegah sakit gigi"], "Khitan membuang kulup tempat mengendapnya kotoran urin dan kuman.", 1),
    ("Khitan termasuk salah satu ajaran kesucian fitrah yang diajarkan oleh ...", "para nabi dan rasul", ["para dokter modern", "para raja zaman dahulu", "masyarakat adat saja"], "Khitan adalah sunnah fitrah para nabi sejak Nabi Ibrahim a.s.", 1),
    ("Tujuan utama pensyariatan khitan dalam ajaran Islam adalah menjaga ...", "kesucian ibadah dan kesehatan", ["penampilan di hadapan teman", "kekayaan keluarga besar", "kekuatan fisik tubuh"], "Khitan menyucikan tubuh dari najis agar salat sah dan badan sehat.", 1),
    ("Sikap seorang anak laki-laki muslim saat tiba waktunya berkhitan adalah ...", "berani dan ikhlas berkhitan", ["menolak dan menangis ketakutan", "bersembunyi di dalam kamar", "marah kepada orang tua"], "Meneladani keberanian dan ketaatan dalam menjalankan syariat Allah.", 1),
    ("Setelah berkhitan, ujung kemaluan menjadi lebih mudah untuk ...", "dibersihkan saat beristinja'", ["ditutup kain tebal", "diwarnai dengan obat", "dibiarkan tanpa dicuci"], "Tanpa kulup, membersihkan sisa air kencing menjadi sangat mudah.", 1),
    ("Khitan bagi perempuan menurut syariat Islam hukumnya adalah ...", "makramah (kemuliaan)", ["haram mutlak", "wajib fardhu 'ain", "makruh tahrim"], "Sebagian besar ulama memandang khitan perempuan sebagai bentuk kemuliaan.", 1),
    ("Waktu yang paling utama (mustahab) untuk mengkhitan anak adalah ...", "pada hari ke-7 setelah lahir", ["saat usia 17 tahun", "ketika sudah tamat kuliah", "setelah menikah nanti"], "Sunnah mengkhitan bayi pada hari ke-7 kelahirannya.", 1),
    ("Perayaan syukuran yang diadakan saat seorang anak berkhitan disebut ...", "walimatul khitan", ["walimatul 'ursy", "walimatul waqirah", "walimatul ma'dabah"], "Walimatul khitan adalah jamuan makan wujud syukur atas terlaksananya khitan.", 1),

    # d2 (14)
    ("Hubungan antara khitan dengan keabsahan salat seseorang adalah ...", "menghilangkan sisa najis air seni", ["memperbanyak rakaat salat fardhu", "membuat bacaan salat jadi fasih", "menggugurkan rukun wudhu"], "Salat sah bila badan suci; kulup yang tidak dikhitan rawan menyimpan najis.", 2),
    ("Hikmah sosial dari diadakannya walimatul khitan di masyarakat adalah ...", "mempererat silaturahmi tetangga", ["memamerkan kekayaan keluarga", "mencari sumbangan uang sebanyaknya", "mengharuskan tamu memberi kado"], "Walimah bertujuan mengumumkan syiar dan mempererat tali persaudaraan.", 2),
    ("Pernyataan yang tepat mengenai manfaat medis khitan bagi pria adalah ...", "mengurangi risiko kanker dan infeksi", ["mencegah penyakit patah tulang", "menghilangkan alergi makanan laut", "meningkatkan daya ingat otak"], "Secara medis, khitan terbukti menurunkan risiko infeksi saluran kemih.", 2),
    ("Sikap tepat orang tua dalam mendampingi anak yang akan dikhitan adalah ...", "memberi semangat dan pengertian agama", ["menakut-nakuti dengan jarum suntik", "memaksa anak tanpa penjelasan", "mengancam tidak memberi uang jajan"], "Orang tua mendidik anak dengan kasih sayang agar anak siap secara mental.", 2),
    ("Rasulullah saw mengkhitan kedua cucunya Hasan dan Husain pada saat ...", "berusia 7 hari setelah lahir", ["berusia 10 tahun di Madinah", "setelah perang Badar selesai", "menjelang pembebasan Makkah"], "Nabi Muhammad saw mengkhitan Hasan dan Husain pada hari ke-7 kelahiran.", 2),
    ("Batasan waktu wajib khitan bagi seorang anak laki-laki adalah sebelum ...", "memasuki usia baligh", ["masuk sekolah dasar", "memulai ibadah puasa", "belajar membaca Al-Qur'an"], "Kewajiban khitan berlaku saat anak menginjak usia baligh sebagai mukallaf.", 2),
    ("Jika seorang mualaf dewasa masuk Islam, maka anjuran baginya adalah ...", "tetap berkhitan jika kondisi aman", ["wajib mengulang syahadat berkali-kali", "dilarang salat sebelum berkhitan", "khitan diganti dengan membayar fidyah"], "Mualaf dianjurkan berkhitan selama tidak membahayakan keselamatan dirinya.", 2),
    ("Bentuk kasih sayang (KBC) yang ditunjukkan teman kepada anak yang baru berkhitan adalah ...", "mendoakan kesembuhan dan menjenguk", ["mengajak bermain lari-larian cepat", "mengejek sarung yang dipakainya", "menyenggol bagian lukanya"], "Menjenguk dan mendoakan teman adalah wujud empati persaudaraan Islam.", 2),
    ("Tata cara khitan modern saat ini semakin nyaman bagi anak karena ...", "menggunakan bius medis dan laser", ["tidak memerlukan obat pereda nyeri", "dapat sembuh dalam waktu satu jam", "dilakukan sendiri tanpa bantuan dokter"], "Teknologi medis modern membuat proses khitan minim rasa sakit dan steril.", 2),
    ("Kaitan khitan dengan hadis 'kebersihan sebagian dari iman' adalah ...", "khitan menjaga organ reproduksi bersih", ["khitan merupakan syarat pakaian bersih", "kebersihan hanya berlaku untuk anak kecil", "khitan menghapus kewajiban mandi"], "Khitan membersihkan bagian tubuh yang rawan kotoran sehingga fitrah terjaga.", 2),
    ("Mengapa Nabi Ibrahim a.s. tetap berkhitan meski usianya sudah lanjut?", "karena ketaatan mutlak pada perintah Allah", ["karena ingin menjadi panglima perang", "karena anjuran tabib di negerinya", "karena mengikuti tradisi kaum sekitar"], "Ketaatan Nabi Ibrahim a.s. adalah bukti kepasrahan iman tanpa keraguan.", 2),
    ("Doa kebaikan yang lazim diucapkan untuk anak yang baru berkhitan adalah ...", "semoga lekas sembuh dan jadi anak saleh", ["semoga menjadi orang yang paling kaya", "semoga tidak perlu belajar lagi", "semoga ditakuti oleh semua temannya"], "Doa walimah memohon kesembuhan, keberkahan, dan kesalehan bagi si anak.", 2),
    ("Dampak psikologis bagi anak yang berani berkhitan adalah ...", "merasa percaya diri memasuki kedewasaan", ["menjadi anak yang pemarah dan sombong", "merasa takut bertemu orang lain", "kehilangan semangat belajar di sekolah"], "Khitan menumbuhkan keberanian dan kesiapan mental menuju tahap baligh.", 2),
    ("Syariat khitan telah ada sejak masa nabi terdahulu membuktikan bahwa ajaran Islam ...", "melanjutkan ajaran tauhid para rasul", ["hanya meniru adat bangsa Arab", "berubah-ubah sesuai zaman dan tempat", "baru dimulai saat Nabi Muhammad hijrah"], "Islam adalah penyempurna risalah tauhid dari para nabi terdahulu.", 2),

    # d3 (7)
    ("Analisis fikih: Mengapa sahnya salat seseorang erat kaitannya dengan khitan?", "kulup yang belum dipotong menyimpan sisa najis", ["salat orang yang belum khitan batal otomatis", "khitan merupakan salah satu rukun salat", "tanpa khitan wudhu seseorang tidak sah"], "Sisa air seni di balik kulup membatalkan syarat suci badan saat salat.", 3),
    ("Perbandingan antara tradisi khitan kuno dan medis modern menunjukkan bahwa ...", "syariat Islam selalu selaras dengan sains", ["syariat Islam sudah tidak relevan lagi", "metode kuno jauh lebih baik daripada medis", "khitan modern mengubah hukum syariat Islam"], "Perintah khitan terbukti secara ilmiah memberi manfaat kesehatan luar biasa.", 3),
    ("Sikap bijak seorang guru agama saat mendapati muridnya takut dikhitan adalah ...", "menjelaskan hikmahnya dengan ramah dan sabar", ["memarahi murid di depan teman-temannya", "mengancam tidak menaikkan kelas murid", "membiarkan murid tidak berkhitan selamanya"], "Pendidikan berbasis cinta menanamkan pemahaman agama dengan kasih sayang.", 3),
    ("Hikmah dianjurkannya khitan pada usia dini (bayi) menurut tinjauan medis adalah ...", "luka lebih cepat sembuh dan minim trauma", ["biaya operasi menjadi jauh lebih mahal", "bayi tidak perlu lagi diberi air susu ibu", "agar bayi langsung bisa berjalan lancar"], "Jaringan kulit bayi elastis dan daya regenerasi sel sangat cepat.", 3),
    ("Bagaimana cara seorang anak menjaga kebersihan luka khitan selama masa penyembuhan?", "menjaga luka tetap kering dan rutin berobat", ["menutup luka dengan plester kedap air rapat", "mencuci luka dengan air sabun berkali-kali", "bermain lumpur di luar rumah bersama teman"], "Perawatan steril dan kering mempercepat proses pengeringan luka khitan.", 3),
    ("Tinjauan syariat: Mengapa khitan perempuan tidak boleh dilakukan secara melukai berlebihan?", "karena Islam melarang tindakan merusak fisik", ["agar perempuan tidak kehilangan rasa takut", "karena biaya medis operasi sangat tinggi", "agar anak perempuan tidak bisa berlari"], "Syariat Islam menjaga kehormatan dan melarang mutilasi organ tubuh wanita.", 3),
    ("Integrasi nilai tauhid: Berkhitan bukan sekadar operasi medis biasa, melainkan ...", "bukti ketaatan dan penyerahan diri pada Allah", ["tanda bahwa seseorang memiliki kasta tinggi", "syarat utama untuk mendapatkan warisan", "tata cara untuk menjadi warga negara sah"], "Niat lillahi ta'ala mengubah khitan menjadi ibadah agung penyempurna fitrah.", 3),
]

# BAB 2: Tanda-tanda Baligh (35 soal: 14 d1, 14 d2, 7 d3)
b2_data = [
    # d1 (14)
    ("Secara bahasa, kata 'baligh' memiliki arti ...", "sampai atau cukup umur", ["anak kecil yang cerdas", "orang tua yang lemah", "pemuda yang perkasa"], "Baligh secara bahasa artinya sampai (sampainya usia pada batas dewasa).", 1),
    ("Seseorang yang telah baligh dan dikenai beban kewajiban syariat disebut ...", "mukallaf", ["muallaf", "mushallin", "munafik"], "Mukallaf adalah orang yang telah baligh, berakal, dan dibebani syariat.", 1),
    ("Tanda baligh yang khusus dialami oleh anak laki-laki adalah ...", "mimpi basah (ihtilam)", ["mengalami haid bulanan", "suara menjadi lebih halus", "rambut tumbuh sangat panjang"], "Mimpi basah (ihtilam) adalah tanda biologis baligh bagi laki-laki.", 1),
    ("Tanda baligh yang khusus dialami oleh anak perempuan adalah ...", "haid (menstruasi)", ["tumbuh jakun di leher", "mimpi basah pertama", "suara menjadi lebih berat"], "Haid adalah keluarnya darah dari rahim perempuan sehat saat usia baligh.", 1),
    ("Tanda baligh umum bagi laki-laki dan perempuan jika belum ada tanda fisik adalah berusia ...", "15 tahun qamariyah", ["10 tahun qamariyah", "12 tahun qamariyah", "20 tahun qamariyah"], "Batas usia maksimal baligh menurut fikih adalah genap 15 tahun qamariyah.", 1),
    ("Usia paling dini seorang anak perempuan mulai mengalami haid adalah sekitar ...", "9 tahun", ["5 tahun", "7 tahun", "13 tahun"], "Menurut fikih, usia minimal perempuan memungkinkan haid adalah 9 tahun.", 1),
    ("Setelah memasuki masa baligh, segala amal perbuatan manusia akan ...", "dicatat malaikat dan dihisab", ["dimaafkan tanpa perhitungan", "dihapus seluruh dosanya", "diwakilkan kepada orang tua"], "Seorang mukallaf menanggung sendiri pertanggungjawaban dosanya.", 1),
    ("Dua malaikat yang bertugas mencatat amal baik dan buruk manusia adalah ...", "Raqib dan Atid", ["Jibril dan Mikail", "Munkar dan Nakir", "Malik dan Ridwan"], "Malaikat Raqib mencatat amal baik, malaikat Atid mencatat amal buruk.", 1),
    ("Kewajiban utama yang harus dilaksanakan setiap hari setelah baligh adalah ...", "salat fardhu lima waktu", ["berhaji ke Baitullah", "menyembelih hewan kurban", "membayar zakat mal"], "Salat lima waktu menjadi fardhu 'ain yang berdosa besar bila ditinggalkan.", 1),
    ("Menutup aurat bagi seorang muslim yang telah baligh hukumnya adalah ...", "wajib", ["sunnah", "mubah", "makruh"], "Menutup aurat adalah kewajiban mutlak bagi setiap muslim yang telah baligh.", 1),
    ("Batas aurat laki-laki di hadapan sesama adalah antara ...", "pusar hingga lutut", ["dada hingga telapak kaki", "leher hingga mata kaki", "wajah dan telapak tangan"], "Aurat laki-laki menurut mayoritas ulama adalah antara pusar dan lutut.", 1),
    ("Batas aurat perempuan muslimah di hadapan bukan mahram adalah ...", "seluruh tubuh kecuali wajah dan tangan", ["antara pusar hingga lutut", "seluruh tubuh tanpa terkecuali", "rambut kepala hingga pundak"], "Aurat wanita di hadapan ajnabi adalah seluruh badan kecuali muka dan telapak tangan.", 1),
    ("Kondisi tubuh setelah mengalami mimpi basah atau selesai haid berstatus ...", "berhadas besar", ["berhadas kecil", "terkena najis mughalladhah", "suci dari segala kotoran"], "Ihtilam dan haid menyebabkan hadas besar yang wajib disucikan dengan mandi.", 1),
    ("Ibadah yang wajib dilakukan untuk menyucikan diri dari hadas besar adalah ...", "mandi wajib (mandi junub)", ["berwudhu dengan sempurna", "beristinja' dengan batu", "membasuh muka tiga kali"], "Hadas besar hanya bisa diangkat dengan mandi wajib membasahi seluruh tubuh.", 1),

    # d2 (14)
    ("Perbedaan mendasar antara hadas kecil dan hadas besar terletak pada ...", "cara menyucikannya (wudhu vs mandi)", ["warna air yang digunakan bersuci", "tempat terjadinya hadas tersebut", "waktu shalat yang dikerjakan"], "Hadas kecil cukup disucikan dengan wudhu, hadas besar wajib mandi wajib.", 2),
    ("Hal-hal yang dilarang bagi perempuan yang sedang mengalami haid di antaranya ...", "salat, puasa, dan menyentuh mushaf", ["memasak makanan di dapur", "keluar rumah untuk sekolah", "berbicara dengan anggota keluarga"], "Wanita haid dilarang salat, puasa, tawaf, dan menyentuh mushaf Al-Qur'an.", 2),
    ("Kewajiban seorang perempuan terhadap puasa Ramadhan yang ditinggalkan karena haid adalah ...", "wajib menggantinya (mengqadha')", ["tidak perlu mengganti selamanya", "cukup membayar fidyah beras", "puasanya diwakilkan oleh suami"], "Puasa yang tertinggal karena haid wajib diqadha di luar bulan Ramadhan.", 2),
    ("Mengapa salat yang ditinggalkan oleh perempuan saat haid tidak perlu diqadha?", "sebagai bentuk keringanan (rukhsah) Islam", ["karena salat tidak penting lagi bagi wanita", "agar wanita dapat beristirahat seharian", "karena wanita haid bukan orang Islam"], "Islam memberi kemudahan rahmat agar wanita tidak terbebani qadha salat.", 2),
    ("Perubahan fisik yang menyertai masa baligh pada anak laki-laki antara lain ...", "tumbuhnya jakun dan suara memberat", ["suara menjadi sangat melengking tinggi", "panggul membesar dan kulit menipis", "rambut rontok secara permanen"], "Tanda sekunder baligh laki-laki: suara membesar, jakun tumbuh, otot menguat.", 2),
    ("Sikap bijak seorang remaja muslim ketika menyadari dirinya telah baligh adalah ...", "meningkatkan ibadah dan menjaga akhlak", ["merasa bebas bertindak semaunya sendiri", "meninggalkan sekolah dan bekerja keras", "menyombongkan kedewasaan pada teman"], "Baligh adalah pintu tanggung jawab moral di hadapan Allah dan manusia.", 2),
    ("Jika seorang anak telah berusia 15 tahun namun belum mimpi basah atau haid, maka ia ...", "sudah dihukumi baligh secara syariat", ["tetap dihukumi anak-anak selamanya", "belum wajib mengerjakan salat fardhu", "tidak boleh menjadi makmum salat"], "Batas 15 tahun hijriyah adalah ketentuan syariat otomatis menjadi mukallaf.", 2),
    ("Peran orang tua dan guru dalam membimbing anak yang memasuki masa baligh adalah ...", "mengajarkan fikih bersuci dengan ramah", ["membiarkan anak mencari info di medsos", "memarahi anak saat bertanya tentang haid", "melarang anak berteman dengan siapa pun"], "Edukasi fikih baligh harus disampaikan secara benar, ramah, dan penuh empati.", 2),
    ("Larangan bagi orang yang sedang dalam keadaan junub (hadas besar) meliputi ...", "mengerjakan salat dan thawaf", ["makan dan minum makanan halal", "tidur di atas kasur yang bersih", "berpakaian rapi dan harum"], "Orang junub diharamkan salat, thawaf, i'tikaf di masjid, dan menyentuh mushaf.", 2),
    ("Hikmah adanya batasan usia baligh dalam ajaran syariat Islam adalah ...", "menetapkan waktu kesiapan tanggung jawab", ["membedakan status kasta sosial manusia", "membatasi pergaulan antarsesama anak", "mempersulit kehidupan generasi muda"], "Baligh menandai kematangan akal dan fisik untuk memikul amanah ibadah.", 2),
    ("Ketika seorang anak perempuan pertama kali mengalami haid, sikap terbaiknya adalah ...", "memberitahu ibu untuk dibimbing bersuci", ["merasa sangat panik dan menangis ketakutan", "menyembunyikan darah haid dari keluarga", "tetap mengerjakan salat fardhu seperti biasa"], "Keterbukaan kepada ibu memudahkan anak belajar tata cara thaharah yang benar.", 2),
    ("Menjaga pandangan mata dan etika pergaulan setelah baligh bertujuan untuk ...", "menjaga kesucian kehormatan diri", ["membuat diri terlihat angkuh di kelas", "menghindari interaksi sosial masyarakat", "memperlihatkan kehebatan ilmu agama"], "Menjaga pandangan (ghadhul bashar) membentengi hati dari godaan maksiat.", 2),
    ("Konsekuensi hukum bagi orang yang meninggalkan salat lima waktu setelah baligh adalah ...", "berdosa besar dan diancam azab neraka", ["cukup membayar denda uang kepada fakir", "dosanya ditanggung oleh orang tuanya", "amalnya dimaafkan karena masih muda"], "Meninggalkan salat dengan sengaja setelah baligh adalah perbuatan dosa besar.", 2),
    ("Darah istihadhah berbeda dengan darah haid karena istihadhah merupakan ...", "darah penyakit di luar siklus haid", ["darah kotoran yang keluar dari lambung", "darah yang keluar saat melahirkan anak", "tanda utama mulainya masa kedewasaan"], "Istihadhah adalah darah penyakit; wanita istihadhah tetap wajib salat.", 2),

    # d3 (7)
    ("Analisis fikih: Mengapa syariat Islam membedakan hukum qadha salat dan qadha puasa bagi wanita haid?", "salat tiap hari, puasa setahun sekali", ["salat lebih mudah daripada ibadah puasa", "puasa memiliki derajat pahala lebih tinggi", "wanita haid tidak diwajibkan masuk Islam"], "Keringanan syariat: mengqadha salat puluhan rakaat memberatkan, puasa hanya setahun sekali.", 3),
    ("Seorang anak berusia 12 tahun telah mengalami mimpi basah. Status hukum syariat baginya adalah ...", "telah mukallaf dan wajib salat fardhu", ["belum mukallaf karena belum usia 15 tahun", "hanya diwajibkan puasa Ramadhan saja", "ibadahnya masih dianggap sunnah belaka"], "Munculnya tanda biologis (ihtilam) otomatis menjadikannya mukallaf sah.", 3),
    ("Tinjauan psikologis: Mengapa masa baligh sering disebut masa transisi yang krusial?", "ada lonjakan hormon dan tuntutan tanggung jawab", ["anak-anak kehilangan seluruh hak bermainnya", "daya ingat manusia menurun drastis di usia ini", "anak tidak lagi membutuhkan bimbingan orang tua"], "Perubahan emosi, fisik, dan spiritual menuntut kedewasaan bersikap.", 3),
    ("Sikap bijak seorang pelajar saat melihat konten tidak pantas di internet adalah ...", "segera menutup dan memohon ampun pada Allah", ["membagikan tautan tersebut ke grup kelas", "menontonnya bersama teman-teman dekat", "menyimpannya di memori ponsel pribadi"], "Integritas mukallaf diuji saat sendirian dengan menjaga pandangan mata.", 3),
    ("Kaitan antara konsep 'tanda baligh' dengan keadilan hukum syariat Allah adalah ...", "kewajiban dibebankan saat fisik dan akal siap", ["semua manusia dibebani aturan sejak lahir", "syariat dibuat untuk menghukum kelemahan manusia", "hanya anak orang kaya yang diwajibkan ibadah"], "Keadilan Allah: tidak membebani hamba melampaui batas kesiapan kemampuannya.", 3),
    ("Bagaimana cara membedakan antara darah haid dan darah istihadhah menurut fikih?", "haid berbau khas dan teratur, istihadhah encer", ["haid putih bening, istihadhah hitam pekat", "haid keluar sejam, istihadhah bulanan", "keduanya persis sama tanpa ada beda"], "Karakteristik warna, bau, kepekatan, dan jadwal membedakan haid dan istihadhah.", 3),
    ("Nilai cinta dan kelembutan syariat (KBC) dalam thaharah baligh tercermin dalam ...", "tuntunan bersuci menjaga martabat manusia", ["ancaman hukuman fisik yang sangat keras", "kewajiban membeli wewangian yang sangat mahal", "larangan beristirahat saat badan merasa lelah"], "Pensyariatan mandi wajib mengangkat harkat kesucian spiritual dan raga hamba.", 3),
]

# BAB 3: Mandi Wajib setelah Hadas Besar (30 soal: 12 d1, 12 d2, 6 d3)
b3_data = [
    # d1 (12)
    ("Pengertian mandi wajib (mandi junub) menurut istilah syariat adalah ...", "meratakan air suci ke seluruh tubuh", ["menyiram kepala dengan air bunga", "mengusap sebagian badan dengan handuk", "mencuci tangan dan kaki di kamar mandi"], "Mandi wajib adalah membasahi seluruh permukaan kulit dan rambut dengan air suci.", 1),
    ("Sebab-sebab yang mewajibkan seseorang melakukan mandi wajib adalah ...", "mimpi basah, selesai haid, atau nifas", ["buang air kecil dan buang air besar", "tertidur lelap dalam posisi berbaring", "mengeluarkan darah mimisan dari hidung"], "Hadas besar (ihtilam, jima', haid, nifas, wiladah) mewajibkan mandi besar.", 1),
    ("Rukun mandi wajib yang pertama kali harus dilakukan adalah ...", "niat di dalam hati", ["membasuh kedua telapak kaki", "menggosok badan dengan sabun wangi", "membaca doa masuk kamar mandi"], "Rukun mandi wajib ada dua: niat dan meratakan air ke seluruh badan.", 1),
    ("Rukun mandi wajib yang kedua adalah ...", "meratakan air ke seluruh rambut dan kulit", ["berkumur-kumur sebanyak tiga kali", "membasuh telinga kanan dan kiri", "berwudhu sebelum menyiram badan"], "Air wajib mengenai seluruh permukaan rambut hingga ke kulit kepala.", 1),
    ("Jenis air yang sah digunakan untuk mandi wajib adalah ...", "air muthlaq (suci dan menyucikan)", ["air kelapa muda yang segar", "air teh manis yang hangat", "air musta'mal yang keruh"], "Bersuci wajib menggunakan air suci menyucikan (air sumur, hujan, sungai).", 1),
    ("Hukum melafalkan niat mandi wajib secara lisan adalah ...", "sunnah untuk memantapkan hati", ["wajib fardhu bila ditinggalkan batal", "haram dan berdosa besar", "makruh yang dibenci"], "Niat wajib di hati saat air pertama menyentuh badan, melafalkan lisan adalah sunnah.", 1),
    ("Berkumur-kumur dan menghirup air ke hidung saat mandi wajib berstatus ...", "sunnah mandi", ["rukun wajib mandi", "syarat sah wudhu", "makruh mandi"], "Berkumur dan istinsyaq termasuk amalan sunnah penyempurna mandi wajib.", 1),
    ("Mendahulukan anggota tubuh bagian kanan sebelum bagian kiri hukumnya ...", "sunnah", ["wajib", "makruh", "haram"], "Mendahulukan anggota kanan adalah sunnah Rasulullah saw dalam bersuci.", 1),
    ("Sebelum mulai menyiramkan air ke seluruh badan, disunnahkan untuk ...", "berwudhu seperti wudhu salat", ["memotong seluruh kuku jari", "mencukur rambut kepala botak", "berpuasa sunnah seharian"], "Nabi saw senantiasa berwudhu terlebih dahulu sebelum membasuh badan.", 1),
    ("Menghilangkan najis yang menempel di badan sebelum mandi wajib dilakukan agar ...", "air mandi suci menyentuh kulit langsung", ["sabun mandi tidak cepat habis", "waktu mandi menjadi lebih lama", "kulit menjadi wangi semerbak"], "Kotoran atau najis di badan harus dibersihkan dulu agar air merata sempurna.", 1),
    ("Jika terdapat cat kuku atau kutek yang menghalangi air sampai ke kuku, maka ...", "wajib dihilangkan terlebih dahulu", ["mandi tetap sah tanpa dihilangkan", "cukup diusap dengan kain basah", "mandi diganti dengan tayamum"], "Benda yang menghalangi sampainya air ke kulit atau kuku membatalkan mandi.", 1),
    ("Mandi sunnah yang sangat dianjurkan seminggu sekali bagi umat Islam adalah ...", "mandi sunnah hari Jumat", ["mandi tengah malam buta", "mandi air es di pagi hari", "mandi setelah makan kenyang"], "Mandi sebelum menghadiri salat Jumat adalah sunnah muakkadah.", 1),

    # d2 (12)
    ("Urutan tata cara mandi wajib yang paling sempurna sesuai sunnah Nabi adalah ...", "cuci tangan, wudhu, lalu siram badan", ["siram badan, pakai sabun, baru niat", "wudhu, sikat gigi, cuci pakaian", "niat, pakai sampo, siram kaki saja"], "Urutan sunnah: basuh tangan, bersihkan kemaluan, wudhu, lalu guyur seluruh badan.", 2),
    ("Saat menyiram kepala pada mandi wajib, hal yang harus diperhatikan adalah ...", "air meresap hingga pangkal kulit kepala", ["rambut harus diikat sangat kencang", "tidak boleh memakai air dingin", "kepala tidak boleh tersentuh tangan"], "Pangkal rambut dan kulit kepala wajib terbasahi air secara merata.", 2),
    ("Perbedaan mandi wajib dengan mandi biasa sehari-hari terletak pada ...", "niat ibadah dan kewajiban meratakan air", ["harga sabun dan sampo yang dipakai", "banyaknya gayung air yang dihabiskan", "suhu air dingin atau hangat"], "Mandi wajib adalah ibadah terikat rukun niat dan cakupan seluruh badan.", 2),
    ("Jika seseorang lupa niat saat mandi wajib, maka konsekuensi hukumnya adalah ...", "mandinya tidak sah dan hadas belum hilang", ["mandinya tetap sah karena badan basah", "cukup membaca istighfar tiga kali", "menggantinya dengan salat dua rakaat"], "Niat adalah rukun penentu keabsahan ibadah mandi wajib.", 2),
    ("Menghemat penggunaan air saat mandi wajib merupakan cermin akhlak ...", "meneladani sunnah dan anti boros", ["kikir terhadap diri sendiri", "enggan bersuci dengan bersih", "takut kehabisan air sumur"], "Rasulullah saw mandi dengan 1 sha' (sekitar 3 liter air) tanpa berlebih-lebihan.", 2),
    ("Jika seseorang sedang sakit parah dan dilarang dokter terkena air, maka mandi wajib diganti dengan ...", "tayamum menggunakan debu suci", ["berwudhu menggunakan minyak wangi", "membayar denda puasa tiga hari", "mengusap badan dengan daun kering"], "Tayamum adalah solusi syariat saat ada uzur sakit atau ketiadaan air.", 2),
    ("Menyela-nyela jari tangan, jari kaki, dan lipatan tubuh saat mandi wajib hukumnya ...", "sunnah penyempurna basuhan", ["makruh karena membuang waktu", "haram menyentuh lipatan tubuh", "membatalkan wudhu sebelumnya"], "Menyela lipatan memastikan air benar-benar membasahi lekukan kulit.", 2),
    ("Sikap seorang muslim saat berada di dalam kamar mandi menurut adab Islam adalah ...", "tidak berbicara dan tidak berlama-lama", ["bernyanyi dengan suara yang lantang", "membaca ayat Al-Qur'an keras-keras", "menghadap ke arah kiblat saat buang air"], "Adab kamar mandi: menjaga kesopanan, hening, dan menutup aurat.", 2),
    ("Doa sebelum masuk kamar mandi bertujuan untuk memohon perlindungan dari ...", "gangguan setan laki-laki dan perempuan", ["bahaya tersengat aliran listrik", "dinginnya air sumur di pagi hari", "kehilangan sabun dan peralatan mandi"], "Lafaz doa memohon perlindungan dari 'khubutsi wal khabaits' (setan jahat).", 2),
    ("Kewajiban mandi bagi wanita yang selesai masa nifas berlaku setelah ...", "darah persalinan berhenti total", ["bayi berusia satu tahun penuh", "melahirkan tanpa menunggu darah henti", "anak sudah mulai bisa berbicara"], "Nifas adalah darah pasca persalinan; mandi wajib saat darah telah tuntas.", 2),
    ("Apakah sah mandi wajib seseorang jika masih ada bagian tumit yang kering?", "tidak sah karena belum seluruh tubuh terkena air", ["tetap sah asalkan kepala sudah basah", "sah jika lupa memeriksa tumitnya", "sah dengan syarat membaca tahmid"], "Rukun meratakan air mewajibkan tidak ada satu milimeter pun kulit yang kering.", 2),
    ("Hikmah disyariatkannya mandi wajib bagi kesehatan fisik manusia adalah ...", "menyegarkan tubuh dan melancarkan darah", ["membuat tubuh menjadi kebal penyakit", "menambah berat badan secara drastis", "menggugurkan kewajiban berolahraga"], "Guyuran air membersihkan kotoran mikroba serta menyegarkan saraf tubuh.", 2),

    # d3 (6)
    ("Analisis kondisi: Seseorang salat subuh, lalu teringat bahwa ia belum mandi wajib setelah ihtilam. Tindakan yang wajib ia lakukan adalah ...", "segera mandi wajib lalu mengulang salatnya", ["cukup berwudhu lalu melanjutkan aktivitas", "salatnya sah karena ia dalam kondisi lupa", "membayar fidyah sedekah kepada anak yatim"], "Salat tanpa suci dari hadas besar hukumnya batal dan wajib diulang setelah mandi.", 3),
    ("Bagaimana cara seseorang memastikan air telah membasahi bagian tubuh yang berlipat-lipat?", "menggosok lipatan kulit dengan jari secara cermat", ["merendam tubuh di kolam renang berjam-jam", "menyemprotkan air dengan tekanan sangat tinggi", "menggunakan sabun cair berbuih sangat tebal"], "Kecermatan meratakan air di area pusar, ketiak, dan lipatan paha adalah tuntunan.", 3),
    ("Pernyataan kritis: Mengapa Islam sangat menekankan detail kebersihan dalam mandi wajib?", "karena kebersihan lahiriah pintu kesucian spiritual", ["agar umat Islam menghabiskan waktu di kamar mandi", "hanya sebagai formalitas adat masyarakat timur tengah", "untuk menunjukkan perbedaan status orang kaya dan miskin"], "Thaharah adalah jembatan sakral menyucikan raga menyambut kehadiran Ilahi.", 3),
    ("Sikap bijak seorang pelajar saat fasilitas air di rumahnya sedang padam dan ia berhadas besar adalah ...", "mencari sumber air bersih atau bertayamum jika uzur", ["meninggalkan salat fardhu hingga air kembali mengalir", "salat tanpa bersuci karena merasa terpaksa", "memarahi orang tua karena pompa air rusak"], "Syariat memberikan alternatif tayamum bila air benar-benar tidak ditemukan.", 3),
    ("Kaitan antara mandi wajib dengan konsep 'Kurikulum Berbasis Cinta' adalah ...", "mencintai tubuh ciptaan Allah dengan merawatnya suci", ["memaksa diri melakukan ritual yang sangat berat", "mengukur cinta dari banyaknya air yang dialirkan", "menghukum fisik agar terbebas dari kesalahan dosa"], "Menjaga kesucian fisik adalah ekspresi cinta dan rasa syukur kepada Sang Khalik.", 3),
    ("Refleksi fiqhiyyah: Mengapa perempuan yang memiliki rambut tebal dikepang tidak wajib membuka kepangannya saat mandi junub?", "keringanan syariat asalkan air sampai ke pangkal kulit", ["karena wanita tidak diwajibkan membasahi kepalanya", "agar rambut wanita tidak rusak terkena air biasa", "karena kepang rambut sudah dianggap sebagai penutup aurat"], "Hadis Ummu Salamah: cukup menyiram kepala 3 kali hingga pangkal tanpa buka kepangan.", 3),
]

def main():
    target_dir = "/home/maman/play/konten/kelas4-sem1/fikih"
    batches = [
        ("b1-berani-berkhitan.json", b1_data),
        ("b2-tanda-tanda-baligh.json", b2_data),
        ("b3-mandi-wajib.json", b3_data)
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
        
    print(f"Total Fikih generated: {total} questions across {len(batches)} batches.")

if __name__ == "__main__":
    main()
