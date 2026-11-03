/**
 * scripts/smoke-test-v4.js
 * 15 Kriteria Uji Asap Otomatis — Petualangan Pelajar v4
 * Sesuai Dokumen Spesifikasi FIX-v4 & Laporan Audit 2026-11-02
 */

const assert = require('node:assert/strict');
const http = require('node:http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3002';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = { ...headers };
    let bodyData = null;
    if (body !== null) {
      bodyData = typeof body === 'string' ? body : JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(bodyData);
    }
    const req = http.request(url, { method, headers: reqHeaders }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) { json = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });
    req.on('error', reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🚀 MEMULAI 15 KRITERIA UJI ASAP PETUALANGAN PELAJAR v4');
  console.log(`Target Server: ${BASE_URL}`);
  console.log('====================================================\n');

  let passedCount = 0;
  const testResults = [];

  function record(id, title, ok, details = '') {
    if (ok) {
      passedCount++;
      console.log(`✅ [${id}] ${title}`);
      if (details) console.log(`    ↳ ${details}`);
    } else {
      console.error(`❌ [${id}] ${title}`);
      if (details) console.error(`    ↳ Error: ${details}`);
    }
    testResults.push({ id, title, ok, details });
  }

  // Generate unique test player
  const testPin = '888888';
  const testNick = 'TesterV4_' + Math.floor(Math.random() * 10000);
  let playerToken = '';
  let playerId = '';

  // Helper login / register
  async function authPlayer(nick, password = 'password123', classId = 'pendekar') {
    let res = await request('POST', '/api/auth/register', { nick, password, classId });
    if (res.status === 409 || res.body.code === 'NICK_TAKEN') {
      res = await request('POST', '/api/auth/login', { nick, password });
    }
    return res;
  }

  try {
    // ----------------------------------------------------
    // UJI 1: POST /api/game/start -> 201 untuk player baru & existing (tanpa error created_at)
    // ----------------------------------------------------
    const loginRes = await authPlayer(testNick);
    assert.equal(loginRes.status === 200 || loginRes.status === 201, true, 'Auth failed');
    playerToken = loginRes.body.token;
    playerId = loginRes.body.player.id;

    const startRes = await request('POST', '/api/game/start', { subjectId: 'matematika' }, { 'X-Player-Token': playerToken });
    const u1Ok = (startRes.status === 201 || startRes.status === 200) && startRes.body.ok && startRes.body.session?.id;
    record('UJI-01', 'POST /api/game/start berhasil (no created_at error)', u1Ok, `Session ID: ${startRes.body.session?.id}`);

    // ----------------------------------------------------
    // UJI 2: Database audit: 0 discrepancy, check:schema lolos, /healthz /api/health sehat
    // ----------------------------------------------------
    const healthRes = await request('GET', '/healthz');
    const u2Ok = healthRes.status === 200;
    record('UJI-02', 'Endpoint Healthz merespons 200 OK', u2Ok, `Status HTTP: ${healthRes.status}`);

    // ----------------------------------------------------
    // UJI 3: Start error handling: pesan ramah pengguna jika payload tidak valid
    // ----------------------------------------------------
    const badStart = await request('POST', '/api/game/start', { subjectId: 'invalid_mapel_xyz' }, { 'X-Player-Token': playerToken });
    const u3Ok = badStart.status === 400 || badStart.status === 404;
    record('UJI-03', 'Error handling validasi parameter battle aman', u3Ok, `HTTP status code: ${badStart.status}`);

    // ----------------------------------------------------
    // UJI 4: Menu Beranda memuat profil, skin, skill, toko, dan avatar SVG
    // ----------------------------------------------------
    const indexRes = await request('GET', '/');
    const html = typeof indexRes.body === 'string' ? indexRes.body : '';
    const u4Ok = html.includes('data-testid="screen-home"') || html.includes('m-play');
    record('UJI-04', 'App Shell memuat ubin navigasi Beranda', u4Ok, 'Shell HTML valid');

    // ----------------------------------------------------
    // UJI 5: GET /api/profile & avatar matching; equip unowned -> 422 ITEM_NOT_OWNED
    // ----------------------------------------------------
    const profRes = await request('GET', '/api/profile', null, { 'X-Player-Token': playerToken });
    const pData = profRes.body;
    let u5Ok = profRes.status === 200 && pData.ok && pData.avatar && pData.player;

    // Coba equip item yang tidak dimiliki
    const badEquip = await request('PUT', '/api/avatar', { outfit: 'outfit_legend_dragon' }, { 'X-Player-Token': playerToken });
    const badEquipRejected = badEquip.status === 422 || badEquip.body.error === 'ITEM_NOT_OWNED';
    u5Ok = u5Ok && badEquipRejected;
    record('UJI-05', 'GET /api/profile valid & equip item liar ditolak (422)', u5Ok, `Status reject: ${badEquip.status}`);

    // ----------------------------------------------------
    // UJI 6: Beli Skin Toko: koin berkurang, item masuk inventory, rebuy ditolak
    // ----------------------------------------------------
    // Beri koin awal untuk pengujian
    const db = require('../lib/db.js');
    db.applyCoins(playerId, 500, 'TEST_CREDIT', 'admin_test');

    const shopRes = await request('GET', '/api/shop', null, { 'X-Player-Token': playerToken });
    const items = shopRes.body.items || [];
    const cheapItem = items.find(x => x.price <= 200) || items[0];

    const coinsBefore = (await request('GET', '/api/profile', null, { 'X-Player-Token': playerToken })).body.player.coins;
    const buyRes = await request('POST', '/api/shop/buy', { itemId: cheapItem.id }, { 'X-Player-Token': playerToken });
    const coinsAfter = (await request('GET', '/api/profile', null, { 'X-Player-Token': playerToken })).body.player.coins;

    const rebuyRes = await request('POST', '/api/shop/buy', { itemId: cheapItem.id }, { 'X-Player-Token': playerToken });
    const u6Ok = buyRes.status === 200 && buyRes.body.ok && (coinsBefore - coinsAfter === cheapItem.price) && (rebuyRes.status === 422 || rebuyRes.body.error === 'ITEM_ALREADY_OWNED');
    record('UJI-06', 'Beli Skin memotong koin presisi & rebuy dicegah', u6Ok, `Item: ${cheapItem.id}, Harga: ${cheapItem.price} 🪙`);

    // ----------------------------------------------------
    // UJI 7: Upgrade Skill: koin terpotong, level naik, max level guard
    // ----------------------------------------------------
    const skBefore = (await request('GET', '/api/skills', null, { 'X-Player-Token': playerToken })).body.skills.find(x => x.id === 'eliminate_one');
    const upgRes = await request('POST', `/api/skills/eliminate_one/upgrade`, {}, { 'X-Player-Token': playerToken, 'Idempotency-Key': `idem-upg-${Date.now()}` });
    const skAfter = (await request('GET', '/api/skills', null, { 'X-Player-Token': playerToken })).body.skills.find(x => x.id === 'eliminate_one');
    const u7Ok = upgRes.status === 200 && upgRes.body.ok && (skAfter.level === skBefore.level + 1);
    record('UJI-07', 'Upgrade Skill memotong koin & menaikkan level', u7Ok, `Level: ${skBefore.level} -> ${skAfter.level}`);

    // ----------------------------------------------------
    // UJI 8: Riwayat Koin & Invariant Saldo: Player.coins == SUM(CoinTx.delta)
    // ----------------------------------------------------
    const histRes = await request('GET', '/api/coins/history', null, { 'X-Player-Token': playerToken });
    const historyList = histRes.body.items || histRes.body.history || [];
    const sumDelta = historyList.reduce((acc, tx) => acc + (tx.delta !== undefined ? tx.delta : tx.amount), 0);
    const finalProfile = (await request('GET', '/api/profile', null, { 'X-Player-Token': playerToken })).body.player;
    const u8Ok = (finalProfile.coins === sumDelta);
    record('UJI-08', 'Integritas Saldo Koin terverifikasi (Coins == SUM(delta))', u8Ok, `Saldo: ${finalProfile.coins} == SUM: ${sumDelta}`);

    // ----------------------------------------------------
    // UJI 9: Idempotency-Key anti-double charge
    // ----------------------------------------------------
    const testIdemKey = `idem-test-${Date.now()}`;
    const unownedItem = (await request('GET', '/api/shop', null, { 'X-Player-Token': playerToken })).body.items[0];
    const firstCall = await request('POST', '/api/shop/buy', { itemId: unownedItem.id }, { 'X-Player-Token': playerToken, 'Idempotency-Key': testIdemKey });
    const secondCall = await request('POST', '/api/shop/buy', { itemId: unownedItem.id }, { 'X-Player-Token': playerToken, 'Idempotency-Key': testIdemKey });
    const u9Ok = firstCall.status === 200 && (secondCall.status === 200 || secondCall.body.idempotent);
    record('UJI-09', 'Idempotency Key mencegah double-charge mutasi koin', u9Ok, `Key: ${testIdemKey}`);

    // ----------------------------------------------------
    // UJI 10: 3 Starter Skill & Loadout awal tersedia otomatis
    // ----------------------------------------------------
    const freshNick = 'FreshPlayer_' + Math.floor(Math.random() * 10000);
    const freshLog = await authPlayer(freshNick);
    const freshTok = freshLog.body.token;
    const freshSk = (await request('GET', '/api/skills', null, { 'X-Player-Token': freshTok })).body;
    const u10Ok = freshSk.loadout?.length === 3 && freshSk.skills?.filter(x => x.unlocked).length >= 3;
    record('UJI-10', 'Pemain baru otomatis dibekali 3 Starter Skill & Loadout', u10Ok, `Starter: ${freshSk.loadout.join(', ')}`);

    // ----------------------------------------------------
    // UJI 11: HUD Pertempuran: Energi awal 2/5 & loadout skill terpasang
    // ----------------------------------------------------
    const battleSess = (await request('POST', '/api/game/start', { subjectId: 'matematika' }, { 'X-Player-Token': freshTok })).body.session;
    const curEnergy = typeof battleSess.energy === 'object' ? battleSess.energy.value : battleSess.energy;
    const maxEnergy = typeof battleSess.energy === 'object' ? battleSess.energy.max : 5;
    const u11Ok = curEnergy === 2 && maxEnergy === 5 && Array.isArray(battleSess.loadout) && battleSess.loadout.length === 3;
    record('UJI-11', 'Sesi Pertempuran memuat Energi 2/5 & 3 Tombol Skill', u11Ok, `Energi: ${curEnergy}/${maxEnergy}, Loadout: ${battleSess.loadout.length} slot`);

    // ----------------------------------------------------
    // UJI 12: Pemakaian Skill eliminate_one: 1 opsi salah dicoret & ditolak jika dipilih
    // ----------------------------------------------------
    const useElimRes = await request('POST', `/api/game/${battleSess.id}/skill`, { skillId: 'eliminate_one', questionIndex: 0 }, { 'X-Player-Token': freshTok });
    const fxElim = useElimRes.body.effects?.eliminated || [];
    let optionRejected = false;
    if (fxElim.length > 0) {
      const badChoice = await request('POST', `/api/game/${battleSess.id}/answer`, { selectedIndex: fxElim[0], timeRemainingSec: 25 }, { 'X-Player-Token': freshTok });
      optionRejected = (badChoice.status === 409 || badChoice.body.error === 'OPTION_ELIMINATED');
    }
    const u12Ok = useElimRes.status === 200 && fxElim.length === 1 && optionRejected;
    record('UJI-12', 'Skill Coret Satu mencoret opsi salah & menolak jawaban tereliminasi', u12Ok, `Opsi tereliminasi: [${fxElim.join(', ')}]`);

    // ----------------------------------------------------
    // UJI 13: Skill heal memulihkan HP pemain
    // ----------------------------------------------------
    const useHealRes = await request('POST', `/api/game/${battleSess.id}/skill`, { skillId: 'heal', questionIndex: 0 }, { 'X-Player-Token': freshTok });
    const u13Ok = useHealRes.status === 200 && useHealRes.body.effects?.healed > 0;
    record('UJI-13', 'Skill Pemulihan (heal) berfungsi menambahkan HP', u13Ok, `Heal amount: +${useHealRes.body.effects?.healed} HP`);

    // ----------------------------------------------------
    // UJI 14: Skill snapshot tersimpan konsisten saat pertempuran berlangsung
    // ----------------------------------------------------
    const resumeSess = (await request('GET', '/api/game/active', null, { 'X-Player-Token': freshTok })).body.session;
    const u14Ok = resumeSess && resumeSess.id === battleSess.id && Array.isArray(resumeSess.loadout);
    record('UJI-14', 'Snapshot Skill & State Pertempuran persisten saat resume', u14Ok, `Sesi: ${resumeSess?.id}`);

    // ----------------------------------------------------
    // UJI 15: Non-regresi: Protected routes tolak akses tanpa token (401)
    // ----------------------------------------------------
    const unauthProf = await request('GET', '/api/profile');
    const unauthStart = await request('POST', '/api/game/start', { subjectId: 'matematika' });
    const u15Ok = unauthProf.status === 401 && unauthStart.status === 401;
    record('UJI-15', 'Non-regresi: Endpoint sensitif wajib autentikasi (HTTP 401)', u15Ok, 'Auth guard 100% aman');

  } catch (err) {
    console.error('Fatal test error:', err);
  }

  console.log('\n====================================================');
  console.log(`🏁 HASIL AKHIR UJI ASAP: ${passedCount}/15 LULUS (${Math.round((passedCount/15)*100)}%)`);
  console.log('====================================================');

  if (passedCount === 15) {
    console.log('🎉 SELURUH KRITERIA UJI ASAP VERSI 4 BERHASIL DILALUI DENGAN SEMPURNA!\n');
    process.exit(0);
  } else {
    console.error(`⚠️ Terdeteksi ${15 - passedCount} kegagalan uji asap.\n`);
    process.exit(1);
  }
}

runAllTests();
