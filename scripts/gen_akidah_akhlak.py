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
    
    # Target key rotation: A, B, C, D
    target_idx = idx % 4
    
    opts = list(d_clean)
    opts.insert(target_idx, c_clean)
    
    # Check max option length <= 45
    for opt in opts:
        if len(opt) > 48:
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

# BAB 1: Indahnya Kalimat Tayyibah (25 soal: 10 d1, 10 d2, 5 d3)
b1_data = [
    # d1 (10)
    ("Kalimat thayyibah secara bahasa memiliki arti kalimat yang ...", "sangat baik dan mulia", ["sangat panjang dibaca", "sulit untuk dihafal", "berisi perintah perang"], "Kalimat thayyibah berarti perkataan yang baik, indah, dan bernilai pahala.", 1),
    ("Lafaz kalimat tasbih yang benar dalam ajaran Islam adalah ...", "Subhanallah", ["Alhamdulillah", "Astaghfirullah", "Allahu Akbar"], "Lafaz tasbih berbunyi Subhanallah yang artinya Maha Suci Allah.", 1),
    ("Arti dari kalimat tayyibah 'Subhanallah' adalah ...", "Maha Suci Allah", ["Segala puji bagi Allah", "Allah Maha Besar", "Tiada daya dan upaya"], "Subhanallah bermakna menyucikan Allah dari segala kekurangan.", 1),
    ("Lafaz kalimat tayyibah yang bermakna 'Allah Maha Besar' adalah ...", "Allahu Akbar", ["Subhanallah", "Alhamdulillah", "Masyaallah"], "Allahu Akbar disebut kalimat takbir yang mengagungkan kebesaran Allah.", 1),
    ("Kalimat tayyibah 'Masyaallah' memiliki arti ...", "Semua atas kehendak Allah", ["Maha Suci Allah selalu", "Segala puji milik Allah", "Ampunilah dosaku ya Allah"], "Masyaallah bermakna apa yang dikehendaki oleh Allah pasti terjadi.", 1),
    ("Saat melihat pemandangan alam yang sangat menakjubkan, kita mengucap ...", "Subhanallah atau Masyaallah", ["Astaghfirullahaladzim", "Inna lillahi wa inna ilaihi", "La haula wala quwwata"], "Melihat keindahan ciptaan Allah disunnahkan mengucap Subhanallah.", 1),
    ("Kalimat tayyibah 'Allahu Akbar' sering dikumandangkan ketika ...", "seruan azan dan ikamah", ["mendengar kabar kematian", "terkena musibah banjir", "berpamitan kepada guru"], "Takbir selalu dikumandangkan dalam lafaz azan lima waktu.", 1),
    ("Mengucapkan kalimat thayyibah dalam kehidupan sehari-hari bernilai ...", "pahala dan kebaikan", ["dosa dan kesalahan", "kesia-siaan belaka", "hukuman dari malaikat"], "Setiap ucapan kalimat thayyibah mendapat pahala zikir di sisi Allah.", 1),
    ("Saat merasa heran menyaksikan perbuatan ganjil seseorang, kita membaca ...", "Subhanallah", ["Alhamdulillah", "Bismillah", "Allahu Akbar"], "Melihat keheranan atau hal yang tak pantas disunnahkan mengucap Subhanallah.", 1),
    ("Melihat adik bayi yang baru lahir sangat lucu dan menggemaskan, kita membaca ...", "Masyaallah tabarakallah", ["Astaghfirullah rabbal baraya", "Inna lillahi wa inna ilaihi", "La haula wala quwwata"], "Mengagumi kebaikan atau keberkahan disunnahkan mengucap Masyaallah tabarakallah.", 1),

    # d2 (10)
    ("Perbedaan utama pengucapan Subhanallah dan Masyaallah terletak pada ...", "Subhanallah untuk takjub ciptaan-Nya", ["keduanya tidak memiliki arti", "Masyaallah hanya diucap saat tidur", "Subhanallah hanya saat hari raya"], "Subhanallah menyucikan Allah, Masyaallah mengagumi karya atas izin Allah.", 2),
    ("Hikmah membiasakan diri melafalkan kalimat takbir adalah menumbuhkan rasa ...", "rendah hati di hadapan Allah", ["sombong di hadapan teman", "paling pintar di kelas", "paling kaya di sekolah"], "Takbir menyadarkan bahwa hanya Allah Yang Maha Besar, manusia adalah kecil.", 2),
    ("Siti melihat lukisan pemandangan karya temannya yang sangat indah. Siti sebaiknya mengucap ...", "Masyaallah tabarakallah", ["Inna lillahi wa inna ilaihi", "Astaghfirullahaladzim", "Naudzubillahi min dzalik"], "Melihat keindahan karya manusia atas izin Allah dianjurkan mengucap Masyaallah.", 2),
    ("Roni berjalan mendaki bukit terjal bersama ayahnya. Ketika jalan menanjak, Roni disunnahkan membaca ...", "Allahu Akbar", ["Alhamdulillah", "Subhanallah", "Astaghfirullah"], "Sunnah Nabi saat jalan menanjak membaca takbir, dan menurun membaca tasbih.", 2),
    ("Manfaat zikir kalimat thayyibah bagi ketenangan jiwa manusia adalah ...", "menjadikan hati damai dan tenang", ["membuat cepat merasa mengantuk", "menambah beban pikiran dan sedih", "menimbulkan perselisihan antarteman"], "Mengingat Allah dengan kalimat thayyibah membuat hati menjadi tenteram.", 2),
    ("Ucapan 'Allahu Akbar' mengingatkan seorang mukmin agar tidak memiliki sifat ...", "takabur dan tinggi hati", ["dermawan kepada sesama", "jujur dalam perkataan", "sabar saat diuji musibah"], "Takbir menghapus kesombongan karena hanya Allah yang berhak memiliki kebesaran.", 2),
    ("Mengucapkan Subhanallah ketika lupa bilangan rakaat dalam salat berjamaah dilakukan oleh ...", "makmum laki-laki", ["makmum perempuan", "imam yang memimpin", "muazin yang berazan"], "Makmum pria menegur imam dengan bertasbih, makmum wanita dengan menepuk tangan.", 2),
    ("Ucapan zikir yang dianjurkan dibaca sebanyak 33 kali setelah salat fardhu meliputi ...", "Subhanallah, Alhamdulillah, Allahu Akbar", ["Astaghfirullah, Masyaallah, Bismillah", "Innalillah, Masyaallah, Allahu Akbar", "Subhanallah, Astaghfirullah, Syukron"], "Zikir ba'da salat terdiri dari tasbih 33x, tahmid 33x, dan takbir 33x.", 2),
    ("Sikap seorang muslim yang selalu mengagungkan kebesaran Allah tercermin dalam ...", "tidak meremehkan orang lain", ["suka pamer harta kekayaan", "enggan memaafkan sahabat", "merasa dirinya paling hebat"], "Mengakui kebesaran Allah melahirkan sikap santun dan tidak merendahkan sesama.", 2),
    ("Zikir kalimat thayyibah menjadi bukti cinta dan penghambaan seorang hamba kepada ...", "Allah Subhanahu wa Ta'ala", ["harta benda kekayaannya", "pujian dan sanjungan teman", "kedudukan jabatan di sekolah"], "Kalimat thayyibah ditujukan semata-mata untuk mengagungkan Allah Ta'ala.", 2),

    # d3 (5)
    ("Kaitan antara kalimat tayyibah Masyaallah dengan pencegahan penyakit ain adalah ...", "menghindarkan rasa iri dan pandangan takjub", ["menyembuhkan batuk dan demam tinggi", "membuat barang langsung jadi milik kita", "mencegah diri dari rasa kantuk di kelas"], "Mengucap Masyaallah tabarakallah memohon berkah agar terhindar dari penyakit ain.", 3),
    ("Pernyataan yang tepat mengenai penerapan kalimat tasbih dalam kehidupan adalah ...", "menyucikan Allah dari segala sifat lemah", ["mengakui manusia punya kekuatan setara", "memuji kecerdasan diri saat lulus ujian", "mengharapkan pujian dari teman dan guru"], "Hakikat tasbih adalah keyakinan mutlak bahwa Allah suci dari segala kekurangan.", 3),
    ("Ketika seorang muslim meraih juara kelas, respon akidah terbaik yang ia ucapkan adalah ...", "Alhamdulillah dan Masyaallah tabarakallah", ["ini semua murni hasil kehebatanku", "orang lain tak mampu menyaingiku", "aku memang pantas sombong di depan teman"], "Menyadari prestasi adalah anugerah Allah, bukan semata karena kehebatan diri.", 3),
    ("Makna filosofis dari takbir 'Allahu Akbar' saat menghadapi kesulitan besar adalah ...", "yakin pertolongan Allah sangat besar", ["pasrah tanpa berusaha mencari jalan keluar", "mengeluh terus kepada orang lain", "meninggalkan ibadah karena cobaan berat"], "Takbir membangkitkan optimisme bahwa tiada masalah yang lebih besar dari kekuasaan Allah.", 3),
    ("Analisis perilaku: Budi selalu mengucapkan kalimat thayyibah setiap hari. Dampak sosial perilakunya adalah ...", "lisan terjaga dan disayangi teman", ["menjadi pendiam dan enggan bergaul", "selalu dipuji berlebihan sehingga sombong", "teman-teman merasa sangat terganggu"], "Membiasakan kalimat thayyibah menjaga lisan dari ghibah dan perkataan kotor.", 3),
]

# BAB 2: Mengenal Allah melalui Asmaul Husna (25 soal: 10 d1, 10 d2, 5 d3)
b2_data = [
    # d1 (10)
    ("Jumlah nama-nama indah Allah (Asmaul Husna) yang wajib kita imani berjumlah ...", "99 nama", ["25 nama", "100 nama", "10 nama"], "Asmaul Husna yang masyhur berjumlah 99 nama mulia.", 1),
    ("Arti dari Asmaul Husna 'al-Malik' adalah Allah Maha ...", "Merajai seluruh alam", ["Maha Mendengar doa", "Maha Melihat rahasia", "Maha Pengampun dosa"], "Al-Malik berarti Yang Maha Menguasai dan Merajai alam semesta.", 1),
    ("Arti dari Asmaul Husna 'al-Quddus' adalah Allah Maha ...", "Suci dari kekurangan", ["Kaya tanpa batas", "Besar kekuasaan-Nya", "Penyayang pada hamba"], "Al-Quddus bermakna Maha Suci dari segala aib dan cela.", 1),
    ("Arti dari Asmaul Husna 'al-'Aziz' adalah Allah Maha ...", "Perkasa dan Mulia", ["Bijaksana adil", "Mengetahui ghaib", "Pencipta makhluk"], "Al-'Aziz berarti Yang Maha Perkasa, Mulia, dan Tak Terkalahkan.", 1),
    ("Siapakah yang menguasai dan merajai alam semesta beserta seluruh isinya?", "Allah Yang Maha Esa", ["Para raja di dunia", "Malaikat penjaga langit", "Manusia yang paling kaya"], "Hanya Allah Raja yang hakiki bagi seluruh alam semesta.", 1),
    ("Menjaga kebersihan pakaian dan tempat salat merupakan cermin meneladani Asmaul Husna ...", "al-Quddus", ["al-Malik", "al-'Aziz", "al-Ghaffar"], "Al-Quddus mengajarkan kita untuk menjaga kesucian lahir dan batin.", 1),
    ("Tidak bergantung kepada belas kasihan orang lain mencerminkan keteladanan sifat ...", "al-'Aziz", ["al-Quddus", "al-Malik", "al-Wahhab"], "Al-'Aziz mengajarkan kemuliaan diri (izzah) dan pantang mengemis.", 1),
    ("Kekuasaan para raja dan presiden di dunia ini sifatnya adalah ...", "sementara dan terbatas", ["abadi selamanya", "tanpa batas akhir", "kekal sepanjang masa"], "Kekuasaan manusia di dunia fana, sedangkan kerajaan Allah abadi.", 1),
    ("Membersihkan hati dari rasa iri, dengki, dan sombong adalah meneladani sifat ...", "al-Quddus", ["al-Malik", "al-Mutakabbir", "al-'Aziz"], "Al-Quddus menuntun kita menyucikan hati dari penyakit hati.", 1),
    ("Memimpin teman-teman kelompok belajar dengan penuh keadilan mencerminkan sifat ...", "al-Malik", ["al-Quddus", "al-Hakim", "al-Lathif"], "Al-Malik meneladankan kepemimpinan yang adil dan mengayomi.", 1),

    # d2 (10)
    ("Perbedaan mendasar antara kerajaan Allah Ta'ala dengan kerajaan manusia adalah ...", "kerajaan Allah abadi dan mutlak", ["kerajaan manusia tidak pernah runtuh", "kerajaan Allah butuh bantuan tentara", "kerajaan manusia mencakup langit bumi"], "Kerajaan Allah mutlak dan tidak bergantung pada siapa pun.", 2),
    ("Cara meneladani sifat al-Quddus saat berada di lingkungan sekolah adalah ...", "membuang sampah pada tempatnya", ["mencoret-coret meja dan dinding", "mengejek kekurangan fisik teman", "menyimpan dendam kepada sahabat"], "Menjaga kebersihan lingkungan sekolah merupakan bukti meneladani al-Quddus.", 2),
    ("Sikap izzah (kemuliaan diri) seorang pelajar muslim yang meneladani al-'Aziz adalah ...", "teguh membela kebenaran walau diejek", ["mudah putus asa saat ujian sulit", "mengikuti ajakan buruk teman", "rendah diri karena keluarga sederhana"], "Meneladani al-'Aziz membentuk pribadi yang teguh menjaga kehormatan iman.", 2),
    ("Seorang pemimpin yang amanah dan tidak semena-mena kepada rakyatnya meneladani nama ...", "al-Malik", ["al-Jabbar", "al-Qahhar", "al-Mutakabbir"], "Pemimpin yang adil meneladani sifat kepemimpinan Allah al-Malik.", 2),
    ("Allah tidak membutuhkan makan, minum, maupun istirahat. Hal ini membuktikan bahwa Allah ...", "al-Quddus", ["al-Malik", "al-'Aziz", "al-Khaliq"], "Allah Maha Suci dari segala sifat ketergantungan dan kelemahan makhluk.", 2),
    ("Ketika melihat teman kita berbuat salah, cara mengingatkan yang meneladani sifat al-Quddus adalah ...", "menasihati secara santun", ["mencaci maki kesalahannya di umum", "membicarakan aibnya ke semua teman", "membalas perbuatannya lebih jahat"], "Menjaga kesucian lisan dengan menasihati secara baik dan penuh kasih sayang.", 2),
    ("Kemuliaan yang hakiki di sisi Allah Subhanahu wa Ta'ala hanya dapat diraih melalui ...", "ketaqwaan dan amal saleh", ["banyaknya jumlah harta kekayaan", "tingginya kedudukan bangsawan", "wajah rupawan dan pakaian mewah"], "Allah memuliakan hamba-Nya berdasarkan ketakwaan, bukan rupa dan harta.", 2),
    ("Hamba yang meneladani al-Malik akan mampu mengendalikan hawa nafsunya agar tidak ...", "terjerumus ke dalam kemaksiatan", ["mengerjakan salat lima waktu", "berbakti kepada kedua orang tua", "membantu teman yang membutuhkan"], "Merajai diri sendiri berarti mengendalikan hawa nafsu dari perbuatan dosa.", 2),
    ("Menghafal Asmaul Husna hendaknya diiringi dengan usaha nyata untuk ...", "mengamalkan nilai dalam perbuatan", ["dipamerkan kepada semua tetangga", "mencari pujian dan sanjungan guru", "mendapat imbalan uang dari orang tua"], "Menghafal Asmaul Husna harus dibarengi dengan keteladanan akhlak mulia.", 2),
    ("Mengapa Allah memiliki sifat al-'Aziz yang Maha Perkasa?", "karena tiada yang dapat mengalahkan-Nya", ["karena bergantung pada kepatuhan malaikat", "karena butuh persembahan sesajen manusia", "karena kekuasaan Allah dibatasi waktu"], "Keperkasaan Allah mutlak dan tiada yang sanggup menandingi kekuasaan-Nya.", 2),

    # d3 (5)
    ("Ahmad terpilih menjadi ketua kelas. Sikap yang mencerminkan keteladanan Asmaul Husna al-Malik adalah ...", "mengayomi teman dan tidak semena-mena", ["menyuruh teman piket sendirian", "memilih teman kaya untuk diajak bicara", "menghukum teman tanpa mendengarkannya"], "Menjadi pemimpin teladan adalah wujud penerapan al-Malik dalam skala kelas.", 3),
    ("Hubungan antara sifat al-Quddus dengan thaharah (bersuci) dalam ibadah adalah ...", "Allah menyukai kesucian lahir dan batin", ["bersuci hanya formalitas sebelum salat", "ibadah sah walau badan terkena najis", "kebersihan batin tak berhubungan fisik"], "Allah Maha Suci sehingga hanya menerima ibadah yang dilakukan dalam keadaan suci.", 3),
    ("Sikap seorang pelajar saat diajak berbuat curang saat ujian oleh sahabat karibnya adalah ...", "menolak tegas demi kehormatan diri", ["menerima ajakan agar tak dimusuhi", "memberi contekan karena tidak enak hati", "pura-pura tak dengar lalu ikut curang"], "Menolak kecurangan merupakan perwujudan sifat tangguh dan mulia (al-'Aziz).", 3),
    ("Kekuasaan manusia di muka bumi bersifat titipan. Kesadaran ini menumbuhkan sikap ...", "tawadhu dan tidak sombong atas jabatan", ["tamak untuk menguasai harta orang lain", "haus akan pujian masyarakat sekitar", "enggan menyerahkan amanah kepada orang"], "Menyadari bahwa pemilik hakiki adalah al-Malik membuat manusia bersikap rendah hati.", 3),
    ("Mengintegrasikan sifat al-Quddus dan al-'Aziz dalam pergaulan sehari-hari menghasilkan pribadi yang ...", "berhati bersih dan teguh dalam kebaikan", ["suka meremehkan orang berbuat salah", "mudah terpengaruh tren buruk medsos", "selalu merasa paling suci dibanding teman"], "Perpaduan al-Quddus dan al-'Aziz melahirkan integritas moral yang sangat tangguh.", 3),
]

# BAB 3: Beriman kepada Kitab-kitab Allah (25 soal: 10 d1, 10 d2, 5 d3)
b3_data = [
    # d1 (10)
    ("Beriman kepada kitab-kitab Allah merupakan rukun iman yang ke- ...", "tiga (3)", ["satu (1)", "dua (2)", "empat (4)"], "Rukun iman ke-3 adalah beriman kepada kitab-kitab Allah.", 1),
    ("Kitab suci Taurat diturunkan oleh Allah kepada Nabi ...", "Musa 'alaihissalam", ["Dawud 'alaihissalam", "Isa 'alaihissalam", "Ibrahim 'alaihissalam"], "Kitab Taurat diwahyukan kepada Nabi Musa a.s. untuk Bani Israil.", 1),
    ("Kitab suci Zabur diturunkan oleh Allah kepada Nabi ...", "Dawud 'alaihissalam", ["Musa 'alaihissalam", "Isa 'alaihissalam", "Yusuf 'alaihissalam"], "Kitab Zabur diwahyukan kepada Nabi Dawud a.s.", 1),
    ("Kitab suci Injil diturunkan oleh Allah kepada Nabi ...", "Isa 'alaihissalam", ["Dawud 'alaihissalam", "Musa 'alaihissalam", "Nuh 'alaihissalam"], "Kitab Injil diwahyukan kepada Nabi Isa a.s.", 1),
    ("Kitab suci Al-Qur'an diturunkan oleh Allah kepada Nabi ...", "Muhammad shallallahu 'alaihi wasallam", ["Musa 'alaihissalam", "Isa 'alaihissalam", "Ibrahim 'alaihissalam"], "Al-Qur'an diturunkan kepada Nabi Muhammad saw sebagai penutup para nabi.", 1),
    ("Bahasa yang digunakan dalam penyampaian kitab suci Al-Qur'an adalah ...", "bahasa Arab", ["bahasa Ibrani", "bahasa Suryani", "bahasa Yunani"], "Al-Qur'an diturunkan dalam bahasa Arab yang sangat jelas dan fasih.", 1),
    ("Malaikat yang bertugas menyampaikan wahyu kitab suci kepada para nabi adalah ...", "Malaikat Jibril", ["Malaikat Mikail", "Malaikat Israfil", "Malaikat Izrail"], "Malaikat Jibril adalah utusan Allah pembawa wahyu suci.", 1),
    ("Al-Qur'an diturunkan sebagai penyempurna dan membenarkan kitab-kitab ...", "yang diturunkan sebelumnya", ["yang dibuat oleh para ulama", "cerita rakyat zaman dahulu", "hukum adat istiadat kabilah"], "Al-Qur'an menyempurnakan syariat kitab-kitab terdahulu.", 1),
    ("Lembaran-lembaran wahyu Allah yang diturunkan sebelum kitab suci disebut ...", "suhuf", ["hadis", "risalah", "matan"], "Suhuf adalah lembaran-lembaran wahyu Allah (seperti suhuf Ibrahim dan Musa).", 1),
    ("Kitab suci Al-Qur'an terdiri dari ... juz dan 114 surah.", "30 juz", ["20 juz", "40 juz", "50 juz"], "Al-Qur'an terbagi menjadi 30 juz dan 114 surah.", 1),

    # d2 (10)
    ("Fungsi utama kitab suci diturunkan kepada umat manusia adalah sebagai ...", "petunjuk jalan kebenaran hidup", ["buku cerita sejarah masa lampau", "pajangan hiasan di lemari buku", "pelengkap upacara adat keluarga"], "Kitab suci menjadi pedoman hidup (hudan lin-nas) agar selamat dunia akhirat.", 2),
    ("Sikap seorang muslim terhadap kitab-kitab sebelum Al-Qur'an adalah ...", "meyakini keberadaannya dengan baik", ["mengingkari dan menolak ajarannya", "mengamalkan seluruh hukum lamanya", "menganggap kitab tersebut palsu"], "Kita wajib mengimani keberadaannya tetapi syariatnya disempurnakan Al-Qur'an.", 2),
    ("Mukjizat terbesar yang diberikan Allah kepada Nabi Muhammad saw adalah ...", "kitab suci Al-Qur'an al-Karim", ["membelah lautan merah luas", "tongkat yang menjadi ular", "menyembuhkan penyakit lepra"], "Al-Qur'an adalah mukjizat abadi yang terpelihara hingga akhir zaman.", 2),
    ("Wahyu Al-Qur'an pertama kali diturunkan kepada Rasulullah saw di ...", "Gua Hira di Jabal Nur", ["Gua Tsur di Madinah", "Bukit Shafa di Makkah", "Padang Arafah Makkah"], "Surah Al-'Alaq ayat 1-5 turun saat beliau berkhalwat di Gua Hira.", 2),
    ("Cara mencintai kitab suci Al-Qur'an dalam kehidupan sehari-hari adalah ...", "rajin membaca dan mengamalkannya", ["hanya menyimpannya di tempat tinggi", "membaca saat ada perlombaan saja", "menghafal semata untuk dipuji orang"], "Mencintai Al-Qur'an diwujudkan dengan tilawah, tadabbur, dan amal saleh.", 2),
    ("Nama lain Al-Qur'an 'Al-Huda' memiliki arti ...", "petunjuk bagi manusia", ["pembeda benar salah", "penyembuh luka hati", "cahaya yang benderang"], "Al-Huda bermakna petunjuk jalan lurus bagi manusia beriman.", 2),
    ("Nama lain Al-Qur'an 'Al-Furqan' memiliki arti ...", "pembeda hak dan batil", ["penawar bagi penyakit", "peringatan yang abadi", "bacaan yang mulia"], "Al-Furqan berarti pembeda antara perkara yang benar dan perkara yang batil.", 2),
    ("Keaslian dan kesucian kitab suci Al-Qur'an dijamin terpelihara langsung oleh ...", "Allah Subhanahu wa Ta'ala", ["para ilmuwan muslim dunia", "pemerintah negara Islam", "organisasi dakwah internasional"], "Allah berjanji dalam surah Al-Hijr ayat 9 untuk menjaga keaslian Al-Qur'an.", 2),
    ("Kitab Zabur diturunkan kepada Nabi Dawud a.s. berisi tentang ...", "doa, zikir, dan pengagungan Allah", ["hukum perang dan perdagangan", "kisah-kisah para raja dunia", "ramalan peristiwa masa depan"], "Zabur berisi pujian, zikir, dan munajat Nabi Dawud a.s. kepada Allah.", 2),
    ("Nabi yang menerima suhuf menurut Al-Qur'an di antaranya adalah Nabi ...", "Ibrahim a.s. dan Musa a.s.", ["Isa a.s. dan Yahya a.s.", "Yusuf a.s. dan Ya'qub a.s.", "Nuh a.s. dan Luth a.s."], "Al-Qur'an menyebutkan 'Suhuful Ibrahim wa Musa'.", 2),

    # d3 (5)
    ("Alasan syariat dalam kitab-kitab suci sebelum Al-Qur'an tidak berlaku lagi bagi umat Islam adalah ...", "telah disempurnakan oleh Al-Qur'an", ["kitab dahulu bukan dari wahyu Allah", "umat manusia dahulu tak punya aturan", "ajaran para nabi terdahulu sangat beda"], "Al-Qur'an menyempurnakan seluruh syariat sebelumnya dan berlaku universal.", 3),
    ("Sikap tepat seorang pelajar saat melihat mushaf Al-Qur'an tergeletak di lantai adalah ...", "mengambilnya lalu menaruh di tempat tinggi", ["membiarkannya karena bukan milik sendiri", "melangkahinya karena terburu-buru", "menyuruh adik kelas memindahkannya"], "Menghormati mushaf Al-Qur'an adalah bagian dari pengagungan syiar Allah.", 3),
    ("Manfaat membaca Al-Qur'an dengan tartil dan memahami terjemahannya adalah ...", "memperoleh petunjuk dan ketenangan batin", ["mendapat kekayaan instan di dunia", "terbebas dari semua tugas sekolah", "bisa mengalahkan teman saat debat"], "Membaca dengan tadabbur menuntun hati menuju akhlak mulia dan keselamatan.", 3),
    ("Pernyataan yang membuktikan bahwa Al-Qur'an adalah mukjizat abadi adalah ...", "bahasa indah dan relevan sepanjang zaman", ["hanya cocok untuk orang padang pasir", "isinya berubah sesuai zaman", "hanya bisa dibaca oleh para ulama"], "Al-Qur'an mukjizat abadi karena terjaga keasliannya dan relevan sepanjang zaman.", 3),
    ("Dalam surah Al-Baqarah ayat 2 ditegaskan bahwa Al-Qur'an tidak ada keraguan padanya. Maknanya adalah ...", "seluruh ajaran Al-Qur'an mutlak benar", ["manusia boleh memilih ayat yang disukai", "isi Al-Qur'an karya manusia cerdas", "hanya berlaku saat Nabi Muhammad hidup"], "Tiada keraguan membuktikan bahwa Al-Qur'an murni kalamullah yang mutlak benar.", 3),
]

# BAB 4: Indahnya Berperilaku Amanah (25 soal: 10 d1, 10 d2, 5 d3)
b4_data = [
    # d1 (10)
    ("Secara bahasa kata 'amanah' memiliki arti ...", "dapat dipercaya", ["mudah berjanji", "selalu menang", "pandai bicara"], "Amanah berarti jujur, bertanggung jawab, dan dapat dipercaya.", 1),
    ("Lawan atau kebalikan dari sifat amanah adalah ...", "khianat", ["kufur", "dusta", "kikir"], "Lawan kata amanah adalah khianat, yaitu mengingkari kepercayaan.", 1),
    ("Contoh perilaku amanah seorang murid saat berada di sekolah adalah ...", "menjalankan tugas piket kelas", ["mencontek saat ujian akhir", "mencoret-coret meja belajar", "membolos saat jam pelajaran"], "Menjalankan piket kelas dengan penuh tanggung jawab adalah contoh amanah.", 1),
    ("Ketika dititipi pesan oleh orang tua untuk guru, sikap kita sebaiknya ...", "menyampaikan pesan dengan tepat", ["melupakan pesan tersebut", "mengubah isi pesan sesuka hati", "merahasiakan dari guru sekolah"], "Pesan atau titipan wajib disampaikan kepada yang berhak menerima.", 1),
    ("Menjaga rahasia pribadi yang diceritakan oleh sahabat karib merupakan cermin ...", "sikap amanah", ["sikap sombong", "sikap riya'", "sikap kikir"], "Menjaga rahasia orang lain adalah bagian dari memegang amanah.", 1),
    ("Tubuh yang sehat dan akal yang cerdas merupakan amanah dari ...", "Allah Subhanahu wa Ta'ala", ["para guru di sekolah", "teman-teman bermain", "masyarakat sekitar"], "Kesehatan dan akal adalah nikmat amanah Allah yang harus disyukuri.", 1),
    ("Orang yang selalu memegang amanah dengan baik akan ...", "disenangi dan dipercaya orang", ["dijauhi oleh teman-temannya", "mengalami banyak kerugian", "mendapatkan cemoohan warga"], "Sikap amanah mendatangkan kepercayaan dan cinta dari sesama manusia.", 1),
    ("Mengembalikan buku perpustakaan tepat waktu dalam keadaan rapi mencerminkan ...", "tanggung jawab dan amanah", ["kemalasan dalam belajar", "ketakutan kepada penjaga", "keinginan untuk disanjung"], "Menjaga barang pinjaman adalah wujud amanah seorang pelajar.", 1),
    ("Gelar yang diberikan penduduk Makkah kepada Nabi Muhammad saw karena kejujurannya adalah ...", "Al-Amin", ["As-Siddiq", "Al-Faruq", "Dzulnurain"], "Al-Amin artinya orang yang sangat terpercaya dan memegang amanah.", 1),
    ("Jika kita berjanji kepada seorang teman, maka janji tersebut wajib ...", "ditepati dengan baik", ["dilupakan begitu saja", "diabaikan jika repot", "dibatalkan sepihak"], "Janji adalah utang yang wajib ditepati sesuai ajaran Islam.", 1),

    # d2 (10)
    ("Contoh amanah terhadap Allah Subhanahu wa Ta'ala dalam kehidupan sehari-hari adalah ...", "melaksanakan salat lima waktu", ["berbuat curang saat ujian", "membantah perintah orang tua", "menghamburkan uang jajan"], "Menjalankan perintah ibadah adalah wujud amanah hamba kepada Penciptanya.", 2),
    ("Menggunakan waktu belajar di sekolah untuk bermain game di ponsel merupakan bentuk ...", "pengkhianatan terhadap amanah", ["kreativitas seorang pelajar", "hiburan yang wajib dilakukan", "tindakan yang sangat terpuji"], "Menyia-nyiakan waktu belajar adalah bentuk lalai terhadap amanah belajar.", 2),
    ("Hikmah yang dirasakan oleh orang yang selalu amanah dalam kehidupannya adalah ...", "hidup tenteram dan disayangi Allah", ["mendapatkan banyak musuh di mana-mana", "selalu merasa cemas dan ketakutan", "kehilangan seluruh harta bendanya"], "Orang yang amanah hidupnya tenang karena tidak menanggung beban dosa khianat.", 2),
    ("Ketika menemukan dompet berisi uang di halaman sekolah, sikap murid yang amanah adalah ...", "menyerahkannya kepada bapak guru", ["mengambil uangnya untuk jajan kantin", "menyembunyikannya di dalam tas sekolah", "membagikan uang tersebut kepada teman"], "Menemukan barang temuan wajib diserahkan kepada pihak yang berwenang.", 2),
    ("Salah satu tanda orang munafik menurut sabda Rasulullah saw adalah jika dipercaya ia ...", "berkhianat", ["menepati", "berzikir", "bersedekah"], "Rasulullah saw bersabda: tanda munafik ada 3, salah satunya jika dipercaya ia berkhianat.", 2),
    ("Menjaga kelestarian lingkungan dan tidak merusak fasilitas umum merupakan amanah kepada ...", "alam dan masyarakat luas", ["diri sendiri semata", "para penjaga keamanan", "keluarga terdekat saja"], "Fasilitas umum adalah amanah bersama untuk dijaga dan dirawat bersama.", 2),
    ("Seorang bendahara kelas yang amanah akan mencatat uang kas kelas dengan ...", "jujur, rapi, dan transparan", ["mengurangi jumlah catatan kas", "memakai uang kas untuk pribadi", "merahasiakan catatan dari teman"], "Bendahara wajib melaporkan keuangan dengan jujur dan terbuka.", 2),
    ("Amanah terhadap diri sendiri dapat diwujudkan dengan cara ...", "menjaga kesehatan dan rajin belajar", ["tidur larut malam setiap hari", "makan sembarangan sepanjang hari", "bermalas-malasan sepanjang hari"], "Merawat tubuh dan mengasah ilmu adalah amanah bagi diri sendiri.", 2),
    ("Akibat buruk yang menimpa orang yang suka berkhianat dalam pergaulan adalah ...", "hilang kepercayaan orang lain kepadanya", ["semakin banyak teman yang mendekat", "dihormati oleh seluruh masyarakat", "kehidupannya menjadi penuh berkah"], "Sekali berkhianat, orang lain akan sulit percaya lagi di kemudian hari.", 2),
    ("Perilaku amanah sangat erat kaitannya dengan kejujuran, sebab orang yang amanah pasti ...", "berkata benar dan bertindak lurus", ["suka menyembunyikan fakta nyata", "mencari keuntungan dengan menipu", "bermuka dua di depan orang lain"], "Kejujuran adalah pondasi utama lahirnya sifat amanah yang kokoh.", 2),

    # d3 (5)
    ("Roni diminta ibunya membeli obat di apotek dan menerima uang kembalian. Sikap Roni yang amanah adalah ...", "menyerahkan semua uang kembalian ke ibu", ["mengambil sebagian kembalian diam-diam", "menyimpan kembalian di sakunya untuk jajan", "berbohong bahwa obatnya tidak ada kembalian"], "Mengembalikan hak secara utuh merupakan ujian integritas amanah anak.", 3),
    ("Analisis perilaku: Mengapa sifat amanah menjadi kunci kesuksesan para Rasul dalam berdakwah?", "umat percaya ajarannya murni dari Allah", ["para Rasul punya harta sangat melimpah", "para Rasul punya pasukan sangat besar", "para Rasul memaksa manusia dengan kuasa"], "Kepercayaan umat lahir dari rekam jejak amanah para Rasul yang tanpa cela.", 3),
    ("Seorang siswa meminjam buku catatan temannya untuk disalin. Tindakan yang mencerminkan amanah adalah ...", "menjaga buku dan mengembalikan segera", ["meminjamkan ke orang lain tanpa izin", "merobek lembaran buku yang dirasa bagus", "menunda pengembalian hingga berminggu-minggu"], "Menjaga fisik buku pinjaman dan tepat waktu mengembalikannya adalah amanah.", 3),
    ("Kaitan antara perilaku amanah seorang pelajar dengan masa depannya adalah ...", "membentuk karakter jujur berintegritas", ["menjadikan dirinya sombong karena jujur", "menjamin kaya tanpa perlu bekerja keras", "membuatnya dijauhi karena terlalu kaku"], "Integritas moral sejak dini adalah modal utama kepemimpinan masa depan.", 3),
    ("Jika seorang pemimpin menyalahgunakan wewenangnya untuk kepentingan pribadi, maka ia telah ...", "mengkhianati rakyat dan berdosa besar", ["cerdas memanfaatkan peluang yang ada", "menjalankan tugas dengan sangat cerdik", "membuktikan kehebatan keluarganya"], "Korupsi wewenang adalah dosa khianat terbesar terhadap amanah kepemimpinan.", 3),
]

# BAB 5: Ketabahan dan Keteguhan Bilal bin Rabah (25 soal: 10 d1, 10 d2, 5 d3)
b5_data = [
    # d1 (10)
    ("Bilal bin Rabah berasal dari negeri ...", "Habasyah (Ethiopia)", ["Mesir kuno", "Yaman selatan", "Persia timur"], "Bilal bin Rabah r.a. berasal dari negeri Habasyah (sekarang Ethiopia).", 1),
    ("Sebelum memeluk Islam dan dimerdekakan, status sosial Bilal bin Rabah adalah ...", "seorang budak sahaya", ["saudagar kaya raya", "panglima perang Quraisy", "kepala suku kabilah"], "Bilal adalah budak sahaya milik seorang tokoh kafir Quraisy.", 1),
    ("Majikan kafir Quraisy yang menyiksa Bilal bin Rabah bernama ...", "Umayyah bin Khalaf", ["Abu Lahab", "Abu Jahal", "Walid bin Mughirah"], "Umayyah bin Khalaf adalah majikan kejam yang menyiksa Bilal.", 1),
    ("Bentuk siksaan yang dialami Bilal di padang pasir Makkah yang terik adalah ...", "dadanya ditindih batu besar panas", ["dibuang ke dalam sumur tua", "diikat di atas pohon kurma", "ditenggelamkan ke sungai dalam"], "Bilal dibaringkan di padang pasir panas dan dadanya ditindih batu besar.", 1),
    ("Ucapan yang terus keluar dari lisan Bilal saat disiksa mempertahankan iman adalah ...", "Ahad, Ahad!", ["Allahu Akbar!", "La ilaha illallah!", "Subhanallah!"], "Bilal menegaskan keesaan Allah dengan berseru 'Ahad, Ahad' (Allah Maha Esa).", 1),
    ("Arti dari perkataan 'Ahad' yang diucapkan Bilal bin Rabah adalah Allah Maha ...", "Esa (Satu)", ["Besar", "Suci", "Adil"], "'Ahad' bermakna Maha Esa, tiada sekutu bagi Allah Subhanahu wa Ta'ala.", 1),
    ("Sahabat mulia yang memerdekakan Bilal bin Rabah dengan membelinya adalah ...", "Abu Bakar ash-Shiddiq", ["Umar bin Khattab", "Utsman bin Affan", "Ali bin Abi Thalib"], "Abu Bakar r.a. menebus dan memerdekakan Bilal demi membela iman.", 1),
    ("Tugas mulia yang dipercayakan Rasulullah saw kepada Bilal bin Rabah adalah ...", "muazin pertama dalam Islam", ["penulis wahyu Al-Qur'an", "pemimpin pasukan perang", "bendahara baitul mal"], "Bilal diangkat menjadi muazin pertama karena suaranya yang lantang dan merdu.", 1),
    ("Sikap teladan utama dari kisah perjuangan Bilal bin Rabah adalah ...", "teguh mempertahankan akidah", ["gemar mengumpulkan harta", "suka membalas dendam", "mudah putus asa saat sedih"], "Keteguhan tauhid Bilal menjadi teladan kesabaran dan ketabahan sejati.", 1),
    ("Peristiwa azan pertama kali yang dikumandangkan oleh Bilal terjadi di kota ...", "Madinah al-Munawwarah", ["Makkah al-Mukarramah", "Thaif pegunungan", "Habasyah benua Afrika"], "Syariat azan pertama kali disyariatkan dan dikumandangkan di Madinah.", 1),

    # d2 (10)
    ("Mengapa Umayyah bin Khalaf begitu marah saat mengetahui Bilal masuk Islam?", "menganggap budak tak berhak memilih agama", ["karena Bilal mencuri perhiasan majikannya", "karena Bilal menolak membersihkan kandang", "karena Bilal melarikan diri ke luar Makkah"], "Kaum kafir memandang rendah budak dan menuntut ketaatan menyembah berhala.", 2),
    ("Siksaan fisik yang pedih tidak mampu menggoyahkan keimanan Bilal karena ...", "keimanan telah meresap kuat di hati", ["Bilal punya tubuh kebal rasa sakit", "Bilal diiming-imingi harta oleh sahabat", "Bilal tak merasa terik matahari Makkah"], "Cahaya tauhid di hati Bilal lebih kuat dari penderitaan fisik yang dialaminya.", 2),
    ("Sikap Abu Bakar ash-Shiddiq yang mengeluarkan banyak harta untuk memerdekakan Bilal menunjukkan ...", "kasih sayang persaudaraan muslim", ["keinginan dipuji oleh kafir Quraisy", "taktik politik memperbanyak pengikut", "kegemaran membeli budak pekerja"], "Tindakan Abu Bakar bukti solidaritas ukhuwah Islamiyah tanpa memandang ras.", 2),
    ("Pelajaran berharga mengenai persamaan derajat manusia dalam Islam dari kisah Bilal adalah ...", "kemuliaan diukur dari ketaqwaan kepada Allah", ["orang berkulit hitam tak boleh memimpin", "keturunan bangsawan lebih mulia", "harta kekayaan menentukan keimanan"], "Islam menghapus diskriminasi warna kulit; yang paling mulia adalah yang bertakwa.", 2),
    ("Ketika kota Makkah berhasil dibebaskan (Fathu Makkah), Rasulullah saw memerintahkan Bilal untuk ...", "mengumandangkan azan di atas Ka'bah", ["memimpin pertempuran melawan musuh", "membakar rumah kaum kafir Quraisy", "menghukum para majikan yang kejam"], "Azan Bilal di atas Ka'bah melambangkan kemenangan tauhid atas kemusyrikan.", 2),
    ("Nilai cinta dan kelembutan (KBC) yang tercermin dalam kisah penyelamatan Bilal adalah ...", "membela orang tertindas dengan nyata", ["membiarkan derita orang lain", "menertawakan orang yang diuji cobaan", "menghindari orang yang lemah di jalan"], "Membela sesama hamba Allah yang dizalimi adalah inti cinta dalam Islam.", 2),
    ("Keteguhan Bilal membuktikan bahwa kemerdekaan jiwa yang hakiki adalah ...", "hanya tunduk dan beribadah kepada Allah", ["bebas berbuat maksiat tanpa aturan", "punya kekayaan melimpah dan mewah", "mampu mengalahkan semua musuh"], "Jiwa Bilal merdeka karena hanya menyembah Allah, meski raganya diperbudak.", 2),
    ("Setelah Rasulullah saw wafat, Bilal merasa sangat sedih sehingga ia ...", "sulit mengumandangkan azan teringat Nabi", ["kembali menjadi budak di Habasyah", "berhenti mengerjakan salat lima waktu", "menyalahkan sahabat yang masih hidup"], "Kerinduan mendalam membuat suara Bilal tercekat tangis setiap teringat Rasulullah.", 2),
    ("Sikap kita ketika menghadapi ejekan atau cemoohan karena menjalankan perintah agama adalah ...", "bersabar dan tetap istiqamah", ["membalas mengejek dengan kata kotor", "berhenti beribadah karena merasa malu", "marah dan mengajak berkelahi"], "Meneladani Bilal berarti tabah menghadapi rintangan demi mempertahankan iman.", 2),
    ("Kisah ketabahan Bilal bin Rabah tercatat abadi dalam sejarah Islam sebagai simbol ...", "keteguhan tauhid anti diskriminasi", ["kemenangan bangsawan atas jelata", "keberhasilan perdagangan antarbangsa", "kekuatan fisik tak terkalahkan"], "Bilal adalah ikon keteguhan akidah tauhid dan kesetaraan derajat manusia.", 2),

    # d3 (5)
    ("Konsep kesetaraan dalam Islam terbukti saat Bilal diangkat menjadi muazin, yaitu ...", "Islam memuliakan iman dan kualitas azan", ["Nabi ingin menyenangkan orang Habasyah", "Quraisy menolak tugas kumandangkan azan", "Bilal membayar uang kepada pimpinan"], "Pengangkatan Bilal meruntuhkan sekat kasta feodal jahiliyah Makkah.", 3),
    ("Refleksi moral: Apa yang membuat kalimat 'Ahad, Ahad' yang diucapkan Bilal begitu menggetarkan hati?", "lahir dari ketulusan iman yang sangat kokoh", ["mantra khusus dari dukun sakti", "diucap agar majikannya merasa takut", "sandi rahasia meminta bantuan teman"], "Kalimat tauhid yang murni dari lubuk hati memiliki kekuatan spiritual agung.", 3),
    ("Tindakan Abu Bakar r.a. memerdekakan Bilal dengan harga berlipat ganda mengajarkan kita untuk ...", "rela berkorban harta demi saudara beriman", ["buang uang agar dikenal sangat dermawan", "mencari untung saat menolong orang lain", "mementingkan diri di atas nyawa orang"], "Pengorbanan harta demi menyelamatkan akidah saudara adalah investasi akhirat.", 3),
    ("Sikap mental yang harus dimiliki pelajar muslim saat berada di lingkungan yang kurang mendukung ibadah adalah ...", "percaya diri dan tidak terbawa arus buruk", ["ikut kebiasaan buruk lingkungan sekitar", "mengurung diri dan menolak bergaul", "pura-pura tak mengenal ajaran agama"], "Keteguhan Bilal menginspirasi pelajar tetap percaya diri menjaga identitas muslim.", 3),
    ("Analisis karakter: Mengapa ketabahan Bilal bin Rabah relevan dipelajari oleh anak zaman sekarang?", "melatih daya tahan teguh membela kebenaran", ["karena sering ada perbudakan padang pasir", "harus belajar cara menahan batu di dada", "hanya dongeng masa lalu yang menghibur"], "Kisah Bilal mengajarkan ketangguhan mental memegang prinsip moral dan agama.", 3),
]

# BAB 6: Menghindari Sikap Kikir dan Kufur Nikmat (25 soal: 10 d1, 10 d2, 5 d3)
b6_data = [
    # d1 (10)
    ("Sikap enggan berbagi dan menahan harta yang semestinya dikeluarkan disebut ...", "kikir atau bakhil", ["qana'ah berhemat", "dermawan sakhi", "tawadhu rendah hati"], "Kikir atau bakhil adalah sifat pelit dan enggan bersedekah di jalan Allah.", 1),
    ("Mengingkari atau tidak mensyukuri nikmat yang telah diberikan Allah disebut ...", "kufur nikmat", ["syukur nikmat", "taubat nasuha", "tasbih nikmat"], "Kufur nikmat adalah sikap tidak berterima kasih atas anugerah rezeki Allah.", 1),
    ("Tokoh pada zaman Rasulullah saw yang terkenal kufur nikmat karena hartanya adalah ...", "Tsa'labah bin Hathib", ["Bilal bin Rabah", "Salman al-Farisi", "Abu Dzar al-Ghifari"], "Tsa'labah bin Hathib berubah menjadi kikir setelah diberi kekayaan melimpah.", 1),
    ("Sebelum menjadi kaya raya, kondisi kehidupan Tsa'labah adalah ...", "sangat miskin dan fakir", ["saudagar kaya raya", "pejabat istana raja", "panglima perang gagah"], "Awalnya Tsa'labah hidup sangat miskin dan pakaian salatnya bergantian dengan istri.", 1),
    ("Doa yang dimohonkan Tsa'labah kepada Rasulullah saw adalah agar diberi ...", "harta kekayaan melimpah", ["ilmu agama yang tinggi", "kemenangan dalam perang", "umur yang sangat panjang"], "Tsa'labah mendesak Rasulullah saw agar mendoakannya menjadi orang kaya.", 1),
    ("Hewan ternak yang dipelihara Tsa'labah hingga berkembang biak sangat banyak adalah ...", "kambing ternak", ["unta merah", "kuda perang", "sapi perah"], "Kambing ternak Tsa'labah berkembang sangat banyak memenuhi lembah Madinah.", 1),
    ("Setelah kaya raya, perubahan buruk yang terjadi pada ibadah Tsa'labah adalah ...", "mulai meninggalkan salat berjamaah", ["semakin rajin ke masjid", "banyak bersedekah ke fakir", "menghafalkan seluruh Al-Qur'an"], "Karena sibuk mengurus ternak, Tsa'labah lalai salat berjamaah hingga salat Jumat.", 1),
    ("Kewajiban harta yang ditolak oleh Tsa'labah saat utusan Nabi datang adalah ...", "kewajiban membayar zakat", ["kewajiban membayar pajak", "kewajiban memberi pinjaman", "kewajiban berqurban sapi"], "Tsa'labah menolak membayar zakat dan menganggapnya seperti upeti zaman jahiliyah.", 1),
    ("Lawan dari sifat kikir atau bakhil adalah sifat ...", "dermawan (sakhi)", ["takabur sombong", "tamak serakah", "riya' pamer"], "Lawan dari kikir adalah dermawan, yaitu gemar menolong sesama.", 1),
    ("Ucapan syukur yang semestinya diucapkan seorang hamba saat mendapat nikmat adalah ...", "Alhamdulillah", ["Astaghfirullah", "Innalillahi", "Naudzubillah"], "Alhamdulillah adalah ungkapan syukur tahmid atas segala nikmat Allah.", 1),

    # d2 (10)
    ("Peringatan Rasulullah saw kepada Tsa'labah sebelum mendoakannya menjadi kaya adalah ...", "harta sedikit disyukuri lebih baik dari lalai", ["jangan pelihara kambing di Madinah", "orang miskin tak akan masuk surga", "kekayaan membuat manusia jadi sakti"], "Rasulullah saw mengingatkan bahaya fitnah kekayaan yang melalaikan ibadah.", 2),
    ("Sebab utama Tsa'labah menolak membayar zakat kepada utusan Rasulullah saw adalah ...", "rasa kikir dan cinta dunia", ["ia tidak punya uang sama sekali", "seluruh ternaknya mati terkena wabah", "ia tidak mengetahui hukum zakat"], "Penyakit cinta harta berlebihan membuat Tsa'labah enggan mengeluarkan zakat.", 2),
    ("Akibat penolakan zakat oleh Tsa'labah, Allah menurunkan wahyu yang mencela perbuatannya dalam surah ...", "At-Taubah ayat 75-76", ["Al-Baqarah ayat 183", "Ali Imran ayat 102", "An-Nur ayat 31"], "Surah At-Taubah ayat 75-76 menegur kemunafikan orang yang ingkar janji zakat.", 2),
    ("Ketika Tsa'labah menyesal dan membawa zakatnya kepada Rasulullah saw, sikap Nabi adalah ...", "menolak zakatnya atas perintah Allah", ["menerima zakatnya dengan senyuman", "membagi zakatnya kepada sahabat", "memaafkannya dan diangkat jadi pejabat"], "Allah melarang Nabi saw menerima zakat Tsa'labah sebagai hukuman pembangkangannya.", 2),
    ("Harta kekayaan yang kita miliki pada hakikatnya merupakan ...", "titipan Allah sebagai ujian iman", ["hasil murni kepintaran diri kita", "hak mutlak bebas dipakai apa saja", "tanda bahwa kita paling mulia"], "Harta adalah amanah titipan Allah untuk menguji kedermawanan manusia.", 2),
    ("Bahaya sifat kikir bagi kehidupan bermasyarakat adalah ...", "memicu kecemburuan sosial", ["membuat suasana lingkungan damai", "meningkatkan kerukunan tetangga", "menciptakan lapangan kerja warga"], "Sikap kikir menimbulkan kebencian sosial antara orang kaya dan orang miskin.", 2),
    ("Cara mensyukuri nikmat anggota badan yang diberikan Allah adalah ...", "menggunakannya untuk amal saleh", ["memamerkan di medsos demi tenar", "menggunakannya untuk bermalas-malasan", "memakainya untuk menyakiti teman"], "Syukur anggota badan dilakukan dengan beramal kebaikan di jalan Allah.", 2),
    ("Janji Allah kepada orang yang pandai mensyukuri nikmat-Nya adalah ...", "pasti menambah nikmat-Nya", ["mengurangi nikmat yang diberikan", "memberikan azab pedih di dunia", "membiarkannya hidup susah"], "Allah berjanji dalam surah Ibrahim ayat 7 akan menambah nikmat hamba yang bersyukur.", 2),
    ("Kisah Tsa'labah memberikan pelajaran berharga agar kita tidak mudah ...", "mengingkari janji kepada Allah", ["berteman dengan pemelihara ternak", "bekerja keras mencari nafkah", "mendoakan kebaikan bagi sesama"], "Kisah Tsa'labah adalah peringatan keras terhadap bahaya ingkar janji pada Allah.", 2),
    ("Sedekah yang dikeluarkan oleh orang yang dermawan tidak akan mengurangi hartanya, melainkan ...", "membersihkan harta dan berkah", ["membuat jatuh miskin terlantar", "menghilangkan tabungan masa depan", "menimbulkan penyesalan di hati"], "Sedekah membersihkan jiwa dan mengembangkan keberkahan harta di sisi Allah.", 2),

    # d3 (5)
    ("Perbedaan mendasar antara berhemat dengan bersikap kikir adalah ...", "hemat tahan yang sia-sia, kikir tahan hak", ["keduanya perbuatan tercela dalam agama", "hemat untuk kaya, kikir untuk miskin", "keduanya sama-sama wajib dihindari"], "Hemat adalah bijak menggunakan harta, sedangkan kikir adalah menolak hak wajib.", 3),
    ("Mengapa penyesalan Tsa'labah di akhir hayatnya tidak lagi bermanfaat?", "karena pintu tobat zakat telah ditutup", ["semua kambingnya dicuri orang lain", "ia tak mau mengaku salah pada sahabat", "khalifah tidak butuh tambahan harta"], "Penyesalan yang terlambat setelah datangnya ketetapan Allah tidak berguna.", 3),
    ("Analisis perilaku: Seseorang selalu mengeluh atas uang sakunya padahal teman lainnya tidak punya uang jajan. Perilaku ini mencerminkan ...", "kufur nikmat dan kurang rasa qana'ah", ["sikap cerdas menuntut hak ke orang tua", "kejujuran dalam berekspresi", "tanda akan menjadi orang sukses"], "Kurang bersyukur dan selalu melihat ke atas melahirkan kufur nikmat.", 3),
    ("Strategi efektif melatih diri anak usia sekolah agar terhindar dari sifat kikir adalah ...", "menyisihkan uang saku untuk kotak amal", ["simpan seluruh uang saku tanpa berbagi", "minta traktiran ke teman di kantin", "beli semua mainan tanpa berpikir panjang"], "Membiasakan sedekah sejak dini mengikis benih kekikiran dalam jiwa anak.", 3),
    ("Kaitan antara syukur nikmat dengan ketenangan jiwa manusia adalah ...", "membuat hati merasa cukup dan damai", ["membuat orang berhenti mencari nafkah", "membuat orang merasa paling hebat", "menghilangkan niat berbuat baik"], "Rasa syukur melahirkan ketenangan karena selalu merasa cukup atas pemberian Allah.", 3),
]

def main():
    target_dir = "/home/maman/play/konten/kelas4-sem1/akidah-akhlak"
    batches = [
        ("b1-kalimat-tayyibah.json", b1_data),
        ("b2-asmaul-husna.json", b2_data),
        ("b3-kitab-kitab-allah.json", b3_data),
        ("b4-perilaku-amanah.json", b4_data),
        ("b5-ketabahan-bilal-bin-rabah.json", b5_data),
        ("b6-menghindari-kikir-kufur-nikmat.json", b6_data)
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
        
    print(f"Total Akidah Akhlak generated: {total} questions across {len(batches)} batches.")

if __name__ == "__main__":
    main()
