const http = require('http');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

function post(urlPath, data, token = null) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: '127.0.0.1',
      port: 3002,
      path: urlPath,
      method: 'POST',
      headers,
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(urlPath, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: '127.0.0.1',
      port: 3002,
      path: urlPath,
      method: 'GET',
      headers,
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('🚀 Memulai Uji Main E2E untuk 12 Mata Pelajaran...');

  // 1. Get subjects list
  const subsRes = await get('/api/subjects?classId=1');
  if (!subsRes.body || !subsRes.body.ok) {
    console.error('❌ Gagal memuat daftar subjek:', subsRes);
    process.exit(1);
  }

  const subjects = subsRes.body.subjects;
  console.log(`📋 Ditemukan ${subjects.length} subjek aktif untuk Kelas 4 SD.`);

  // 2. Register test player
  const username = `tester_${Date.now()}`;
  const regRes = await post('/api/player/register', {
    nick: username,
    password: 'password123',
    classId: 1
  });

  let token = null;
  if (regRes.body && regRes.body.ok) {
    token = regRes.body.token;
    console.log(`👤 Berhasil registrasi player uji coba: ${username}`);
  } else {
    console.error('❌ Gagal registrasi player:', regRes);
    process.exit(1);
  }

  // 3. Test battle session on each subject (smoke sample)
  let allPass = true;
  for (const s of subjects) {
    process.stdout.write(`🎮 [id: ${String(s.id).padStart(2)}] ${s.name.padEnd(21)}: `);

    // Start session
    const startRes = await post('/api/game/start', { subjectId: s.id }, token);
    if (!startRes.body || !startRes.body.ok) {
      console.log(`❌ Gagal start session (${JSON.stringify(startRes.body)})`);
      allPass = false;
      continue;
    }

    const sessionId = startRes.body.sessionId || (startRes.body.session && startRes.body.session.id);
    const bossName = startRes.body.boss ? startRes.body.boss.name : 'Monster';

    // Get session detail to inspect currentQuestion
    const sessRes = await get(`/api/game/${sessionId}`, token);
    if (!sessRes.body || !sessRes.body.ok || !sessRes.body.session) {
      console.log(`❌ Gagal get session detail (${JSON.stringify(sessRes.body)})`);
      allPass = false;
      continue;
    }

    const session = sessRes.body.session;
    const curQ = session.currentQuestion;
    if (!curQ || !curQ.text || !Array.isArray(curQ.options) || curQ.options.length !== 4) {
      console.log(`❌ Struktur pertanyaan tidak valid: ${JSON.stringify(curQ)}`);
      allPass = false;
      continue;
    }

    // Ready question
    const readyRes = await post(`/api/game/${sessionId}/ready`, { questionIndex: 0 }, token);
    if (!readyRes.body || !readyRes.body.ok) {
      console.log(`❌ Gagal ready question (${JSON.stringify(readyRes.body)})`);
      allPass = false;
      continue;
    }

    // Answer question
    const ansRes = await post(`/api/game/${sessionId}/answer`, {
      questionIndex: 0,
      choice: 0
    }, token);

    if (!ansRes.body || !ansRes.body.ok) {
      console.log(`❌ Gagal kirim jawaban (${JSON.stringify(ansRes.body)})`);
      allPass = false;
      continue;
    }

    // Abandon session cleanly
    await post(`/api/game/${sessionId}/abandon`, {}, token);

    const outcome = ansRes.body.outcome || 'ANSWERED';
    const dmg = ansRes.body.damageToBoss || 0;
    const qShort = curQ.text.length > 25 ? curQ.text.substring(0, 25) + '...' : curQ.text;
    console.log(`✅ OK (Boss: ${bossName}, Soal: "${qShort}", 4 Opsi: [${curQ.options.map(o => o.length > 10 ? o.substring(0, 10) + '..' : o).join(', ')}], Outcome: ${outcome}, Dmg: ${dmg})`);
  }

  // 4. Full Tiered Battle Playthrough (v6) - Complete longer session until WON
  console.log('\n⚔️ Menguji Sesi Bertier Panjang Penuh (15-30 Jawaban Benar & Isi Ulang)...');
  const fullStartRes = await post('/api/game/start', { subjectId: subjects[0].id }, token);
  if (!fullStartRes.body || !fullStartRes.body.ok) {
    console.error('❌ Gagal start full battle session:', fullStartRes);
    process.exit(1);
  }

  const fullSession = fullStartRes.body.session || fullStartRes.body;
  const fullSessionId = fullSession.id;
  const tier = fullStartRes.body.boss?.tier || fullSession.boss_tier || 'common';
  const hitsNeeded = fullStartRes.body.boss?.hitsNeeded || fullSession.boss_hits_needed || 15;
  const maxHp = fullStartRes.body.boss?.maxHp || fullSession.boss_max_hp || 300;

  console.log(`👾 Pertarungan dimulai: Boss [${tier.toUpperCase()}], Max HP: ${maxHp}, Hits Needed: ${hitsNeeded}`);

  const db = new DatabaseSync(path.join(__dirname, '..', 'data', 'play.db'));

  function getCorrectChoice(sessId, qIdx) {
    const row = db.prepare(`
      SELECT sq.option_order, q.answer_index
      FROM session_questions sq
      JOIN questions q ON q.id = sq.question_id
      WHERE sq.session_id = ? AND sq.order_index = ?
    `).get(sessId, qIdx);
    if (!row || !row.option_order) return 0;
    try {
      const order = JSON.parse(row.option_order);
      const idx = order.indexOf(row.answer_index);
      return idx >= 0 ? idx : 0;
    } catch (e) {
      return 0;
    }
  }

  let qIndex = 0;
  let correctCount = 0;
  let refillDetected = false;
  let won = false;

  while (qIndex < 50) {
    await post(`/api/game/${fullSessionId}/ready`, { questionIndex: qIndex }, token);
    const choice = getCorrectChoice(fullSessionId, qIndex);
    const ans = await post(`/api/game/${fullSessionId}/answer`, {
      questionIndex: qIndex,
      choice: choice,
    }, token);

    if (!ans.body || !ans.body.ok) {
      console.error(`❌ Gagal menjawab soal ke-${qIndex}:`, ans.body);
      allPass = false;
      break;
    }

    if (ans.body.isCorrect) correctCount++;
    if (ans.body.refill && ans.body.refill.added > 0) {
      refillDetected = true;
      process.stdout.write(` [Refill +${ans.body.refill.added}] `);
    }

    const sessStatus = ans.body.session?.status || (ans.body.isWin ? 'WON' : 'IN_PROGRESS');
    if (sessStatus === 'WON') {
      won = true;
      console.log(`\n🎉 Boss ${tier} Tumbang! Status: WON, Total Benar: ${correctCount} (Target: ≤${hitsNeeded}), Refill: ${refillDetected ? 'Ya' : 'Tidak'}`);
      if (correctCount < 15) {
        console.error(`❌ Pelanggaran: Boss tumbang pada hit ke-${correctCount} (< 15)`);
        allPass = false;
      }
      if (correctCount > hitsNeeded) {
        console.error(`❌ Pelanggaran: Boss tumbang pada hit ke-${correctCount} (> hitsNeeded ${hitsNeeded})`);
        allPass = false;
      }
      break;
    }

    qIndex++;
  }

  if (!won) {
    console.error('❌ Sesi bertier panjang gagal diselesaikan (tidak WON)!');
    allPass = false;
  }

  console.log(`\n🏁 Hasil Akhir Uji E2E: ${allPass ? 'SEMUA 12 MATA PELAJARAN & SESI BERTIER PANJANG 100% SUKSES!' : 'ADA KEGAGALAN'}`);
  process.exit(allPass ? 0 : 1);
}

main().catch(err => {
  console.error('Crash:', err);
  process.exit(1);
});
