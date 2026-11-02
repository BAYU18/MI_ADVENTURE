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

# BAB 1: What Are You Doing? (Present Continuous & Activities) - 35 soal: 14 d1, 14 d2, 7 d3
b1_data = [
    # d1 (14)
    ("What are you doing? I am ... a story book.", "reading", ["eating", "sleeping", "running"], "Membaca buku cerita menggunakan kata kerja 'reading'.", 1),
    ("Look! Budi is ... fried rice in the dining room.", "eating", ["drinking", "washing", "jumping"], "Makan nasi goreng dinyatakan dengan kata 'eating'.", 1),
    ("Siti and Nina are in the kitchen. They are ... orange juice.", "drinking", ["cooking", "reading", "sleeping"], "Meminum jus jeruk dinyatakan dengan kata kerja 'drinking'.", 1),
    ("Complete the sentence: 'I ... studying English right now.'", "am", ["is", "are", "be"], "Subjek 'I' selalu berpasangan dengan to be 'am'.", 1),
    ("Complete the sentence: 'He ... playing football in the yard.'", "is", ["am", "are", "were"], "Subjek tunggal laki-laki 'He' berpasangan dengan to be 'is'.", 1),
    ("Complete the sentence: 'They ... swimming in the pool.'", "are", ["is", "am", "was"], "Subjek jamak 'They' berpasangan dengan to be 'are'.", 1),
    ("What is the meaning of 'writing a letter'?", "menulis sepucuk surat", ["membaca buku cerita", "menggambar pemandangan", "mendengarkan musik"], "'Writing a letter' berarti menulis surat.", 1),
    ("What is the meaning of 'sleeping on the bed'?", "tidur di atas kasur", ["duduk di atas kursi", "makan di meja makan", "berdiri di dekat pintu"], "'Sleeping' berarti tidur, 'bed' adalah tempat tidur/kasur.", 1),
    ("Choose the correct verb: 'Mother is ... delicious soup for dinner.'", "cooking", ["washing", "flying", "riding"], "Memasak sup lezat menggunakan kata kerja 'cooking'.", 1),
    ("Choose the correct verb: 'The boys are ... bicycle in the park.'", "riding", ["driving", "flying", "reading"], "Mengendarai sepeda menggunakan kata kerja 'riding'.", 1),
    ("Ahmad: 'What is your sister doing?' - Fatimah: 'She ... drawing a cat.'", "is", ["am", "are", "do"], "Subjek 'She' berpasangan dengan to be 'is'.", 1),
    ("Complete the sentence: 'We ... singing a national song together.'", "are", ["is", "am", "be"], "Subjek jamak 'We' berpasangan dengan to be 'are'.", 1),
    ("What are the students doing in the library? They are ... quietly.", "reading books", ["playing soccer", "eating snacks", "shouting loud"], "Di perpustakaan, murid membaca buku dengan tenang.", 1),
    ("What is the negative form of 'She is sleeping'?", "She is not sleeping", ["She are not sleeping", "She am not sleeping", "She not is sleeping"], "Bentuk negatif: tambahkan 'not' setelah to be 'is'.", 1),

    # d2 (14)
    ("Change into interrogative (question): 'You are studying math.'", "Are you studying math?", ["Is you studying math?", "Am you studying math?", "Do you studying math?"], "Kalimat tanya continuous: letakkan to be 'Are' di awal kalimat.", 2),
    ("Look at the picture: Doni is holding a pencil and paper. What is he doing?", "He is drawing a picture.", ["He is washing his shoes.", "He is cooking noodles.", "He is driving a big car."], "Memegang pensil dan kertas menandakan aktivitas menggambar.", 2),
    ("Rina: 'Is your father watching television?' - Edo: 'Yes, ...'", "he is", ["she is", "they are", "we are"], "Ayah adalah 'he', jawaban singkat positif: 'Yes, he is.'", 2),
    ("Lani: 'Are you listening to the radio?' - Dayu: 'No, ...'", "I am not", ["I is not", "he is not", "they are not"], "Pertanyaan 'Are you' dijawab oleh orang pertama: 'No, I am not.'", 2),
    ("Complete the verb: 'swim' becomes ... in present continuous tense.", "swimming", ["swiming", "swimmed", "to swim"], "Aturan ejaan: konsonan rangkap pada kata berakhiran vokal-konsonan pendek.", 2),
    ("Complete the verb: 'run' becomes ... in present continuous tense.", "running", ["runing", "runed", "to run"], "Kata 'run' menjadi 'running' dengan menggandakan huruf 'n'.", 2),
    ("Choose the correct sentence in present continuous tense:", "The children are playing hide and seek.", ["The children is playing hide and seek.", "The children am playing hide and seek.", "The children playing hide and seek are."], "'Children' adalah bentuk jamak dari 'child', memakai to be 'are'.", 2),
    ("What is Mr. Rahman doing? He is a teacher. He is ... the students.", "teaching", ["learning", "cooking", "buying"], "Sebagai seorang guru, aktivitasnya adalah mengajar ('teaching').", 2),
    ("Translate into English: 'Kami sedang membersihkan ruang kelas.'", "We are cleaning the classroom.", ["We is cleaning the classroom.", "We am cleaning the classroom.", "We are clean the classroom."], "'Kami sedang membersihkan' diterjemahkan 'We are cleaning'.", 2),
    ("Translate into English: 'Dia (perempuan) sedang menyiram bunga.'", "She is watering the flowers.", ["She are watering the flowers.", "She is water the flowers.", "She am watering the flowers."], "'She is watering the flowers' adalah kalimat continuous yang tepat.", 2),
    ("Choose the correct question: '... they playing basketball now?'", "Are", ["Is", "Am", "Do"], "Subjek 'they' membutuhkan to be 'Are' untuk kalimat tanya continuous.", 2),
    ("Which sentence shows an activity happening right now?", "My brother is washing his bike at the moment.", ["My brother washed his bike yesterday afternoon.", "My brother will wash his bike tomorrow morning.", "My brother washes his bike every single Sunday."], "Present continuous ('is washing ... at the moment') menyatakan kejadian sekarang.", 2),
    ("Arrange into a good sentence: 'drinking - milk - is - cat - the'", "The cat is drinking milk.", ["The cat drinking milk is.", "Milk is drinking the cat.", "Drinking is the cat milk."], "Susunan kalimat SPO: Subject (The cat) + is + drinking + milk.", 2),
    ("Arrange into a good sentence: 'guitar - playing - are - they - the'", "They are playing the guitar.", ["They playing are the guitar.", "Playing they are the guitar.", "The guitar are they playing."], "Susunan kalimat yang tepat: They are playing the guitar.", 2),

    # d3 (7)
    ("Error identification: Find the incorrect word in 'The cats is sleeping on the mat.'", "is", ["cats", "sleeping", "mat"], "Kata 'cats' adalah jamak, to be yang benar seharusnya 'are', bukan 'is'.", 3),
    ("Sentence correction: 'Listen! Somebody are knocking on the door.'", "Change 'are' into 'is'", ["Change 'are' into 'am'", "Change 'knocking' into 'knock'", "Change 'door' into 'doors'"], "'Somebody' adalah kata ganti tunggal (singular), sehingga memakai 'is'.", 3),
    ("Context analysis: When the teacher says 'Be quiet! I am explaining the lesson,' students should ...", "listen attentively to the teacher", ["talk loudly with their friends", "run outside the classroom", "sleep on their study desks"], "Makna konteks kalimat mengajak siswa menyimak penjelasan guru dengan hening.", 3),
    ("Dialogue completion: Sarah: '...?' - Hana: 'I am helping my mother in the kitchen.'", "What are you doing, Hana?", ["Where are you going, Hana?", "Who is your mother, Hana?", "How old are you, Hana?"], "Jawaban aktivitas continuous diawali pertanyaan 'What are you doing?'.", 3),
    ("Value integration: Helping a friend who is cleaning the board shows ...", "kindness and cooperation", ["selfishness and arrogance", "laziness and boredom", "greed and anger"], "Membantu kawan yang sedang piket mencerminkan kasih sayang dan kerjasama.", 3),
    ("Grammar analysis: Why does 'write' become 'writing' without the letter 'e'?", "verbs ending in silent 'e' drop the 'e' before -ing", ["because the letter 'e' is too difficult to read", "because all English verbs must have seven letters", "so that the word sounds like an Arabic word"], "Aturan fonetik: kata kerja berakhiran huruf 'e' luluh saat ditambah akhiran -ing.", 3),
    ("Complex sentence: 'While Budi is studying in his room, his sister ... a doll.'", "is playing with", ["are playing with", "am playing with", "playing is with"], "Subjek 'his sister' tunggal, sehingga menggunakan 'is playing with'.", 3),
]

# BAB 2: There Are 67 English Books (Numbers 50-100 & Quantifiers) - 33 soal: 13 d1, 13 d2, 7 d3
b2_data = [
    # d1 (13)
    ("What is the English word for number 50?", "fifty", ["fifteen", "five", "fifth"], "Angka 50 dalam bahasa Inggris adalah 'fifty' (15 adalah fifteen).", 1),
    ("What is the English word for number 60?", "sixty", ["sixteen", "six", "sixth"], "Angka 60 adalah 'sixty'.", 1),
    ("What is the English word for number 70?", "seventy", ["seventeen", "seven", "seventh"], "Angka 70 adalah 'seventy'.", 1),
    ("What is the English word for number 80?", "eighty", ["eighteen", "eight", "eighth"], "Angka 80 adalah 'eighty'.", 1),
    ("What is the English word for number 90?", "ninety", ["nineteen", "nine", "ninth"], "Angka 90 adalah 'ninety'.", 1),
    ("What is the English word for number 100?", "one hundred", ["ten hundred", "one thousand", "one million"], "Angka 100 adalah 'one hundred'.", 1),
    ("How do you spell number 55 in English words?", "fifty-five", ["fifteen-five", "fifty-fifth", "five-fifty"], "Kombinasi puluhan dan satuan: fifty-five.", 1),
    ("How do you spell number 67 in English words?", "sixty-seven", ["sixteen-seven", "sixty-seventh", "seven-sixty"], "Angka 67 ditulis 'sixty-seven'.", 1),
    ("How do you spell number 84 in English words?", "eighty-four", ["eighteen-four", "eighty-fourth", "four-eighty"], "Angka 84 ditulis 'eighty-four'.", 1),
    ("Complete the sentence: '... is an apple on the table.'", "There is", ["There are", "They is", "These is"], "Satu buah apel ('an apple') tunggal menggunakan 'There is'.", 1),
    ("Complete the sentence: '... are five pencils in my pencil case.'", "There", ["It", "This", "That"], "Ungkapan keberadaan benda jamak menggunakan 'There are'.", 1),
    ("How many days are there in a week? There are ... days.", "seven", ["five", "twelve", "thirty"], "Ada tujuh hari dalam satu minggu ('seven days').", 1),
    ("What is 'twenty plus thirty'?", "fifty", ["forty", "sixty", "seventy"], "20 + 30 = 50 ('fifty').", 1),

    # d2 (13)
    ("Complete the sentence: 'There ... seventy students in the school hall.'", "are", ["is", "am", "be"], "Tujuh puluh murid ('seventy students') adalah jamak, menggunakan 'are'.", 2),
    ("Complete the sentence: 'There ... one whiteboard in our classroom.'", "is", ["are", "am", "were"], "Satu papan tulis ('one whiteboard') adalah tunggal, menggunakan 'is'.", 2),
    ("What is the result of 'seventy-five minus fifteen'?", "sixty", ["fifty", "seventy", "eighty"], "75 - 15 = 60 ('sixty').", 2),
    ("What is the result of 'forty plus forty-eight'?", "eighty-eight", ["seventy-eight", "ninety-eight", "eighty-six"], "40 + 48 = 88 ('eighty-eight').", 2),
    ("Question to ask quantity: '... books are there on the bookshelf?'", "How many", ["How much", "How old", "How long"], "Benda yang dapat dihitung (countable) ditanyakan dengan 'How many'.", 2),
    ("Rudi has 52 marbles. His father gives him 10 more marbles. How many marbles does Rudi have now?", "sixty-two", ["fifty-two", "seventy-two", "eighty-two"], "52 + 10 = 62 ('sixty-two').", 2),
    ("Choose the correct plural noun form: 'There are two ... in the room.'", "watches", ["watchs", "watchies", "watch"], "Benda berakhiran 'ch' mendapat akhiran '-es' saat jamak: watches.", 2),
    ("Choose the correct plural noun form: 'There are three ... under the tree.'", "boxes", ["boxs", "boxies", "boxen"], "Benda berakhiran 'x' mendapat akhiran '-es' saat jamak: boxes.", 2),
    ("Translate into English: 'Ada sembilan puluh kursi di ruangan itu.'", "There are ninety chairs in the room.", ["There is ninety chairs in the room.", "There are nineteen chairs in the room.", "There is nineteen chairs in the room."], "'Ada 90 kursi' diterjemahkan 'There are ninety chairs'.", 2),
    ("Translate into English: 'Berapa banyak penghapus yang ada di sana?'", "How many erasers are there?", ["How much erasers is there?", "How many eraser is there?", "How old erasers are there?"], "Penghapus dapat dihitung jamak: 'How many erasers are there?'.", 2),
    ("Look at the number sequence: 50, 60, 70, ..., 90. What is the missing number?", "eighty", ["fifteen", "seventy-five", "one hundred"], "Pola bertambah 10: 70 + 10 = 80 ('eighty').", 2),
    ("Look at the number sequence: 65, 70, 75, ..., 85. What is the missing number?", "eighty", ["eighty-five", "ninety", "seventy-six"], "Pola bertambah 5: 75 + 5 = 80 ('eighty').", 2),
    ("Which sentence uses 'There is' correctly?", "There is a ruler in my bag.", ["There is ten rulers in my bag.", "There is many rulers in my bag.", "There is two rulers in my bag."], "'There is' hanya dipakai untuk benda tunggal ('a ruler').", 2),

    # d3 (7)
    ("Mathematical problem: 'A library has 95 story books. 25 books are borrowed by students. How many books are left?'", "seventy books", ["sixty books", "eighty books", "fifty books"], "95 - 25 = 70 ('seventy books').", 3),
    ("Sentence correction: 'There is many pictures hanging on the wall.'", "Change 'is' into 'are'", ["Change 'many' into 'much'", "Change 'pictures' into 'picture'", "Change 'on' into 'under'"], "'Many pictures' adalah bentuk jamak, harus menggunakan 'are'.", 3),
    ("Error identification: Find the mistake in 'There are fifty-four student in the laboratory.'", "student should be students", ["are should be is", "fifty-four should be fifty", "in should be on"], "Setelah bilangan lebih dari satu, kata benda harus berbentuk jamak ('students').", 3),
    ("Comparison analysis: 'Class A has 38 students. Class B has 42 students. How many students are there in total?'", "eighty students", ["seventy students", "ninety students", "sixty students"], "38 + 42 = 80 ('eighty students').", 3),
    ("Critical spelling: Which word is spelled correctly for number 40?", "forty", ["fourty", "fourty-one", "fourthty"], "Angka 40 dieja 'forty' tanpa huruf 'u'.", 3),
    ("Value integration: Sharing 10 pencils with classmates who forgot their pens reflects ...", "generosity and love for friends", ["wastefulness and carelessness", "showing off wealth", "disobedience to teachers"], "Berbagi alat tulis mencerminkan kedermawanan dan kasih sayang kepada sahabat.", 3),
    ("Contextual logic: If a box can hold 50 apples, how many apples can 2 similar boxes hold?", "one hundred apples", ["fifty apples", "seventy-five apples", "twenty-five apples"], "50 x 2 = 100 ('one hundred apples').", 3),
]

# BAB 3: My Living Room is Beside the Kitchen (Prepositions & House) - 32 soal: 13 d1, 13 d2, 6 d3
b3_data = [
    # d1 (13)
    ("Where do you sleep at night? In the ...", "bedroom", ["kitchen", "bathroom", "garage"], "Kamar tidur dalam bahasa Inggris adalah 'bedroom'.", 1),
    ("Where does mother cook delicious meals? In the ...", "kitchen", ["living room", "bedroom", "garden"], "Dapur tempat memasak makanan disebut 'kitchen'.", 1),
    ("Where do you take a bath and brush your teeth? In the ...", "bathroom", ["dining room", "bedroom", "garage"], "Kamar mandi tempat membersihkan diri disebut 'bathroom'.", 1),
    ("Where does the family gather to watch television? In the ...", "living room", ["bathroom", "garage", "kitchen"], "Ruang keluarga tempat berkumpul dan menonton TV adalah 'living room'.", 1),
    ("Where does father park his car or motorcycle? In the ...", "garage", ["bedroom", "bathroom", "dining room"], "Garasi tempat memarkir kendaraan disebut 'garage'.", 1),
    ("The cat is sleeping ... the table. (di bawah)", "under", ["on", "in", "above"], "Preposisi 'di bawah' adalah 'under'.", 1),
    ("The vase of flowers is ... the table. (di atas)", "on", ["in", "under", "behind"], "Preposisi 'di atas' menempel permukaan adalah 'on'.", 1),
    ("The fish is swimming ... the aquarium. (di dalam)", "in", ["on", "under", "between"], "Preposisi 'di dalam' ruang atau wadah adalah 'in'.", 1),
    ("The broom is ... the door. (di belakang)", "behind", ["in front of", "under", "on"], "Preposisi 'di belakang' adalah 'behind'.", 1),
    ("The teacher is standing ... the classroom. (di depan)", "in front of", ["behind", "under", "between"], "Preposisi 'di depan' adalah 'in front of'.", 1),
    ("The bedside table is ... the bed. (di samping)", "beside", ["under", "inside", "behind"], "Preposisi 'di samping' atau di sebelah adalah 'beside' / 'next to'.", 1),
    ("What is the meaning of 'dining room'?", "ruang makan", ["ruang tamu", "kamar tidur", "dapur memasak"], "'Dining room' adalah ruangan tempat menyantap makanan bersama.", 1),
    ("What furniture do you sit on in the living room?", "sofa", ["wardrobe", "refrigerator", "stove"], "'Sofa' adalah kursi busa empuk tempat duduk di ruang tamu.", 1),

    # d2 (13)
    ("The ball is ... the two boxes. (di antara dua benda)", "between", ["behind", "in front of", "under"], "Preposisi 'di antara dua objek' adalah 'between'.", 2),
    ("Where do you keep fresh vegetables and cold milk in the kitchen?", "in the refrigerator", ["in the wardrobe", "under the pillow", "on the roof"], "Kulkas/lemari es ('refrigerator') menjaga makanan tetap segar.", 2),
    ("Where do you hang your clean clothes and school uniform?", "in the wardrobe", ["in the stove", "in the bathtub", "under the mat"], "Lemari pakaian tempat menggantung baju adalah 'wardrobe'.", 2),
    ("Complete the sentence: 'The kitchen is ... the dining room.'", "next to", ["under", "inside", "above"], "'Next to' bermakna berdampingan di sebelah ruangan lain.", 2),
    ("Ahmad: 'Where is my school bag?' - Mother: 'It is ... the chair.'", "on", ["between", "inside of", "through"], "Tas sekolah diletakkan di atas kursi memakai preposisi 'on'.", 2),
    ("Translate into English: 'Ada sebuah lampu gantung di atas meja makan.'", "There is a lamp above the dining table.", ["There are a lamp under the dining table.", "There is a lamp inside the dining table.", "There are lamps behind the dining table."], "Posisi melayang di atas tanpa menempel menggunakan 'above'.", 2),
    ("Translate into English: 'Kucing itu sedang bersembunyi di belakang lemari.'", "The cat is hiding behind the wardrobe.", ["The cat is hiding under the wardrobe.", "The cat is hiding in front of the wardrobe.", "The cat is hiding on the wardrobe."], "'Di belakang lemari' diterjemahkan 'behind the wardrobe'.", 2),
    ("Describe the room: 'There is a stove, a pan, and a refrigerator.' This room is a ...", "kitchen", ["bedroom", "garage", "bathroom"], "Kompor, wajan, dan kulkas berada di dapur ('kitchen').", 2),
    ("Describe the room: 'There is a bed, a pillow, and a study desk.' This room is a ...", "bedroom", ["living room", "kitchen", "dining room"], "Tempat tidur, bantal, dan meja belajar berada di kamar tidur ('bedroom').", 2),
    ("Which preposition means the opposite of 'in front of'?", "behind", ["beside", "under", "between"], "Lawan kata dari 'di depan' (in front of) adalah 'di belakang' (behind).", 2),
    ("Which preposition means the opposite of 'under'?", "on / above", ["in", "behind", "beside"], "Lawan kata dari 'di bawah' (under) adalah 'di atas' (on/above).", 2),
    ("Arrange into a good sentence: 'garden - the - is - house - behind - the'", "The garden is behind the house.", ["The garden behind is the house.", "Behind the house the garden is.", "The house is the garden behind."], "Susunan yang benar: The garden is behind the house.", 2),
    ("Arrange into a good sentence: 'shoes - are - the - bed - under - the'", "The shoes are under the bed.", ["The shoes under are the bed.", "Under the bed are shoes the.", "The bed are the shoes under."], "Susunan yang benar: The shoes are under the bed.", 2),

    # d3 (6)
    ("Reading comprehension: 'Fajar puts his shoes under the bench, his bag on the desk, and his jacket behind the door. Where is his bag?'", "on the desk", ["under the bench", "behind the door", "in the drawer"], "Berdasarkan teks, tas ('his bag') diletakkan di atas meja ('on the desk').", 3),
    ("Spatial reasoning: 'The bank is between the post office and the library. Where is the bank?'", "in the middle of the post office and the library", ["behind the post office", "inside the library building", "across from the bus station"], "'Between' menunjukkan posisi di tengah-tengah antara dua tempat.", 3),
    ("House layout analysis: 'If the garage is beside the house, father can park his car ...'", "safely next to the house", ["inside the bedroom", "on the kitchen roof", "under the living room table"], "Garasi di sebelah rumah memberikan akses parkir yang aman di samping bangunan.", 3),
    ("Sentence correction: 'The dog is sleeping in the chair floor under.'", "The dog is sleeping under the chair.", ["The dog sleeping under is the chair.", "Under the chair sleeping is the dog.", "The chair is sleeping under the dog."], "Urutan yang benar: Subjek + to be + verb-ing + preposisi tempat.", 3),
    ("Value integration: Keeping our bedroom tidy, clean, and organized shows ...", "responsibility and self-discipline", ["laziness and carelessness", "fear of darkness", "waste of free time"], "Merapikan kamar tidur sendiri melatih tanggung jawab dan kemandirian hidup.", 3),
    ("Environmental care: Planting flowers and trees in the garden in front of the house helps ...", "make the air fresh, cool, and beautiful", ["make the house hot and crowded", "destroy the fence of the house", "attract harmful snakes and pests"], "Menghijaukan taman pekarangan rumah menyegarkan udara dan menyejukkan pandangan.", 3),
]

def main():
    target_dir = "/home/maman/play/konten/kelas4-sem1/bahasa-inggris"
    batches = [
        ("b1-present-continuous.json", b1_data),
        ("b2-numbers-quantifiers.json", b2_data),
        ("b3-prepositions-house.json", b3_data)
    ]
    
    total = 0
    longest_count = 0
    
    for filename, raw_items in batches:
        qs = []
        for i, item in enumerate(raw_items):
            q_text, c_ans, dists, expl, diff = item
            q_obj = build_q(q_text, c_ans, dists, expl, diff, i)
            qs.append(q_obj)
            
            lens = [len(o) for o in q_obj["options"]]
            max_len = max(lens)
            max_idx = lens.index(max_len)
            if max_idx == q_obj["answer"]:
                longest_count += 1
                
        save_batch(target_dir, filename, qs)
        total += len(qs)
        
    print(f"Total Bahasa Inggris generated: {total} questions across {len(batches)} batches.")
    print(f"Longest key bias check: {longest_count}/{total} = {longest_count/total*100:.1f}%")

if __name__ == "__main__":
    main()
