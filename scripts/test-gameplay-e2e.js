const http = require('http');

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

  // 3. Test battle session on each subject
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

  console.log(`\n🏁 Hasil Akhir Uji E2E: ${allPass ? 'SEMUA 12 MATA PELAJARAN 100% SUKSES DAN BEBAS DIMAINKAN!' : 'ADA KEGAGALAN'}`);
  process.exit(allPass ? 0 : 1);
}

main().catch(err => {
  console.error('Crash:', err);
  process.exit(1);
});
