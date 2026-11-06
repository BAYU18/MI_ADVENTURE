'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');
const db = require('./lib/db');
const auth = require('./lib/auth');
const GameplayConfig = require('./shared/gameplay');
const dbFriends = require('./lib/db-friends');
const dbDuel = require('./lib/db-duel');

const PORT = parseInt(process.env.PORT || '3002', 10);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');

/* ── MIME types ── */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml; charset=utf-8',
  '.ico':  'image/x-icon',
  '.mp3':  'audio/mpeg',
  '.wav':  'audio/wav',
  '.pdf':  'application/pdf',
  '.zip':  'application/zip',
  '.md':   'text/markdown; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
};

/* ── HTTP Response Helpers ── */
function json(res, data, status = 200, headers = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

function err(res, message, status = 400, code = null, details = null) {
  const errorCode = code || (typeof message === 'string' && /^[A-Z0-9_]+$/.test(message) ? message : 'ERROR');
  json(res, {
    ok: false,
    error: {
      code: errorCode,
      message: message,
      ...(details ? { details } : {})
    }
  }, status);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 5 * 1024 * 1024) {
        req.destroy();
        reject(new Error('PAYLOAD_TOO_LARGE'));
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

function setCookieHeader(name, value, maxAgeSec = 2592000, secure = false) {
  let cookie = `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}`;
  if (secure) cookie += '; Secure';
  return cookie;
}

function clearCookieHeader(name) {
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function getPlayerFromReq(req) {
  const token = auth.extractPlayerToken(req);
  if (!token) return null;
  const payload = auth.verifyToken(token);
  if (!payload || payload.type !== 'player') return null;
  return payload;
}

function getAdminFromReq(req) {
  const token = auth.extractAdminToken(req);
  if (!token) return null;
  const payload = auth.verifyToken(token);
  if (!payload || payload.type !== 'admin') return null;
  return payload;
}

/* ── HTTP Server Request Handler ── */

function renderPublicReportHtml(rep) {
  const p = rep.player || {};
  const t = rep.totals || {};
  const subjectsHtml = (rep.subjects || []).map(s => {
    const accPct = Math.round((s.accuracy || 0) * 100);
    const trendBadge = s.trend === 'up' ? '<span style="color:#10b981;font-weight:700">📈 Naik</span>'
      : (s.trend === 'down' ? '<span style="color:#f59e0b;font-weight:700">📉 Perlu Latihan</span>' : '<span style="color:#94a3b8">➖ Stabil</span>');
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:10px;margin-bottom:8px">
        <div>
          <strong style="font-size:0.95rem;color:#fff">${s.name}</strong>
          <div style="font-size:0.8rem;color:#94a3b8">${s.answered} Soal Dijawab</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:1.05rem;font-weight:800;color:#38bdf8">${accPct}%</div>
          <div style="font-size:0.75rem">${trendBadge}</div>
        </div>
      </div>
    `;
  }).join('');

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Laporan Belajar Mingguan — ${p.nick || 'Siswa'}</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --muted: #94a3b8;
      --primary: #38bdf8;
      --success: #10b981;
    }
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 16px;
      line-height: 1.5;
    }
    .container {
      max-width: 640px;
      margin: 0 auto;
    }
    .card {
      background: var(--card-bg);
      border-radius: 18px;
      padding: 20px;
      border: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 16px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    }
    .header-box {
      text-align: center;
      padding: 24px 16px 16px 16px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 700;
      background: rgba(56,189,248,0.15);
      color: var(--primary);
      margin-bottom: 8px;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .stat-box {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      padding: 12px;
      text-align: center;
    }
    .stat-val {
      font-size: 1.4rem;
      font-weight: 800;
      color: #fff;
    }
    .stat-lbl {
      font-size: 0.75rem;
      color: var(--muted);
      margin-top: 2px;
    }
    .btn-print {
      display: block;
      width: 100%;
      background: #0284c7;
      color: #fff;
      border: none;
      border-radius: 12px;
      padding: 12px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
      text-decoration: none;
      margin-top: 10px;
    }
    .btn-print:hover { background: #0369a1; }
    @media print {
      body { background: #fff !important; color: #000 !important; padding: 0 !important; }
      .card { border: 1px solid #ccc !important; box-shadow: none !important; background: #fff !important; color: #000 !important; }
      .stat-box { border: 1px solid #ddd !important; background: #fafafa !important; }
      .stat-val, strong { color: #000 !important; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card header-box">
      <div class="badge">LAPORAN BELAJAR RESMI</div>
      <h1 style="font-size:1.5rem;font-weight:800;margin:4px 0 6px 0;color:#fff">${p.nick || 'Siswa'}</h1>
      <div style="font-size:0.9rem;color:var(--muted)">${p.className || 'Siswa'} · Pekan Mulai: ${rep.weekStart}</div>
      <button onclick="window.print()" class="btn-print no-print" style="margin-top:16px">🖨️ Cetak / Simpan PDF</button>
    </div>

    <div class="card">
      <h3 style="font-size:1.05rem;font-weight:800;margin:0 0 12px 0;color:#fff">Ringkasan Aktivitas Belajar</h3>
      <div class="stat-grid">
        <div class="stat-box">
          <div class="stat-val">${t.minutes || 0} Menit</div>
          <div class="stat-lbl">Waktu Aktif Belajar</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">${Math.round((t.accuracy || 0) * 100)}%</div>
          <div class="stat-lbl">Akurasi Jawaban</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">${t.sessions || 0} Sesi</div>
          <div class="stat-lbl">${t.battles || 0} Petualangan · ${t.practice || 0} Latihan</div>
        </div>
        <div class="stat-box">
          <div class="stat-val">${t.bossDefeated || 0} 👑</div>
          <div class="stat-lbl">Boss Ditaklukkan</div>
        </div>
      </div>
      <div style="font-size:0.85rem;color:var(--muted);text-align:center">
        Total Bintang: ⭐ ${t.stars || 0} · Kombo Terbaik: 🔥 ${t.bestStreak || 0}
      </div>
    </div>

    ${(rep.subjects && rep.subjects.length > 0) ? `
      <div class="card">
        <h3 style="font-size:1.05rem;font-weight:800;margin:0 0 12px 0;color:#fff">Performa Mata Pelajaran</h3>
        ${subjectsHtml}
      </div>
    ` : ''}

    <div class="card">
      <h3 style="font-size:1.05rem;font-weight:800;margin:0 0 12px 0;color:#fff">Catatan Perkembangan Materi</h3>
      <div style="display:flex;flex-direction:column;gap:10px;font-size:0.9rem">
        <div>
          <span style="color:#10b981;font-weight:700">✓ Materi Dikuasai:</span>
          <span style="color:#e2e8f0;margin-left:6px">${(rep.strengths && rep.strengths.length > 0) ? rep.strengths.join(', ') : 'Belum ada data topik'}</span>
        </div>
        <div>
          <span style="color:#f59e0b;font-weight:700">⚠ Perlu Latihan Tambahan:</span>
          <span style="color:#e2e8f0;margin-left:6px">${(rep.needsWork && rep.needsWork.length > 0) ? rep.needsWork.join(', ') : 'Tidak ada (Pemahaman sangat baik!)'}</span>
        </div>
        <div style="background:rgba(56,189,248,0.08);border-left:3px solid var(--primary);padding:10px 12px;border-radius:0 8px 8px 0;margin-top:6px">
          <strong style="color:var(--primary);font-size:0.8rem;text-transform:uppercase">Tip Belajar:</strong>
          <div style="color:#e2e8f0;margin-top:2px">${rep.tip || 'Tetap semangat berlatih setiap hari!'}</div>
        </div>
      </div>
    </div>

    <div style="text-align:center;font-size:0.75rem;color:#64748b;margin:16px 0 24px 0" class="no-print">
      Laporan dihasilkan secara otomatis oleh Petualangan Pelajar. Hanya menampilkan nama panggilan siswa tanpa data pribadi.
    </div>
  </div>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const method = req.method.toUpperCase();
  const query = parsed.query;
  const isSecure = (req.headers['x-forwarded-proto'] === 'https') || (req.socket && req.socket.encrypted);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Player-Token');
  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  /* ─────────────────────────────────────────────────────────────
     API ROUTES
  ───────────────────────────────────────────────────────────── */

  // Health check
  if ((pathname === '/api/health' || pathname === '/healthz') && method === 'GET') {
    try {
      const dbInstance = db.getDb();
      dbInstance.prepare('SELECT 1').get();
      const gsCols = dbInstance.prepare("PRAGMA table_info('game_sessions')").all().map(c => c.name);
      const isMatch = gsCols.includes('created_at');
      if (!isMatch) {
        return json(res, {
          ok: false,
          db: true,
          schema: 'MISMATCH',
          missing: ['game_sessions.created_at'],
          service: 'petualangan-pelajar',
          version: 'v4',
          timestamp: new Date().toISOString()
        }, 500);
      }
      return json(res, {
        ok: true,
        db: true,
        schema: 'MATCH',
        service: 'petualangan-pelajar',
        version: 'v4',
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      return json(res, { ok: false, db: false, schema: 'ERROR', error: e.message }, 500);
    }
  }

  // Auth: Register (Player)
  if ((pathname === '/api/auth/register' || pathname === '/api/player/register' || pathname === '/api/register') && method === 'POST') {
    try {
      const body = await parseBody(req);
      const player = db.registerPlayer(body.nick, body.password, body.classId);
      const token = auth.signToken({ type: 'player', id: player.id, nick: player.nick });
      const cookie = setCookieHeader('pp_player', token, 30 * 86400, isSecure);
      return json(res, { ok: true, code: 'OK', player, token }, 200, { 'Set-Cookie': cookie });
    } catch (e) {
      if (e.code === 'NICK_TAKEN') return err(res, 'Nick sudah digunakan', 409, 'NICK_TAKEN');
      if (e.code === 'NICK_NOT_ALLOWED') return err(res, 'Nick tidak diizinkan', 422, 'NICK_NOT_ALLOWED');
      if (e.code === 'VALIDATION_ERROR') return err(res, e.message, 400, 'VALIDATION_ERROR');
      return err(res, e.message || 'REGISTRATION_FAILED', 400);
    }
  }

  // Auth: Login (Player)
  if ((pathname === '/api/auth/login' || pathname === '/api/player/login' || pathname === '/api/login') && method === 'POST') {
    try {
      const body = await parseBody(req);
      const player = db.loginPlayer(body.nick, body.password);
      const token = auth.signToken({ type: 'player', id: player.id, nick: player.nick });
      const cookie = setCookieHeader('pp_player', token, 30 * 86400, isSecure);
      return json(res, { ok: true, code: 'OK', player, token }, 200, { 'Set-Cookie': cookie });
    } catch (e) {
      return err(res, 'Nick atau password salah', 401, 'INVALID_CREDENTIALS');
    }
  }

  // Auth: Logout (Player)
  if ((pathname === '/api/auth/logout' || pathname === '/api/player/logout') && method === 'POST') {
    const token = auth.extractPlayerToken(req);
    if (token) auth.revokeToken(token);
    const cookie = clearCookieHeader('pp_player');
    return json(res, { ok: true }, 200, { 'Set-Cookie': cookie });
  }

  // Player: Me (GET)
  if ((pathname === '/api/me' || pathname === '/api/player/me') && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    const player = db.getPlayerById(playerAuth.id);
    if (!player) return err(res, 'Player tidak ditemukan', 404, 'PLAYER_NOT_FOUND');
    return json(res, { ok: true, ...player, player });
  }

  // Player: Update Class (PATCH /api/me or POST /api/player/class)
  if (((pathname === '/api/me' && (method === 'PATCH' || method === 'POST')) ||
       (pathname === '/api/player/class' && method === 'POST'))) {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const body = await parseBody(req);
      const cid = parseInt(body.classId, 10);
      const updated = db.updatePlayerClass(playerAuth.id, cid);
      return json(res, { ok: true, classId: cid, player: updated });
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  // Profile (GET /api/profile)
  if (pathname === '/api/profile' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    const profile = db.getPlayerProfile(playerAuth.id);
    if (!profile) return err(res, 'Pemain tidak ditemukan', 404, 'PLAYER_NOT_FOUND');
    return json(res, profile);
  }

  // Profile Showcase (PUT /api/profile/showcase or POST /api/profile/showcase)
  if (pathname === '/api/profile/showcase' && (method === 'PUT' || method === 'POST')) {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const body = await parseBody(req);
      const updated = db.updatePlayerShowcase(playerAuth.id, body.showcase || []);
      return json(res, updated);
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  // Profile Titles (PUT /api/profile/titles or POST /api/profile/titles)
  if (pathname === '/api/profile/titles' && (method === 'PUT' || method === 'POST')) {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const body = await parseBody(req);
      const updated = db.updatePlayerTitles(playerAuth.id, body.titles || []);
      return json(res, updated);
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  // Player: Avatar (PUT /api/avatar or POST /api/player/avatar)
  if (((pathname === '/api/avatar' && (method === 'PUT' || method === 'POST')) ||
       (pathname === '/api/player/avatar' && method === 'POST'))) {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const body = await parseBody(req);
      const avatar = db.updatePlayerAvatar(playerAuth.id, body.avatar || body);
      const passives = db.getPlayerPassives(playerAuth.id);
      return json(res, { ok: true, avatar, passives });
    } catch (e) {
      if (e.code === 'ITEM_NOT_OWNED') return err(res, e.message, 422, 'ITEM_NOT_OWNED');
      return err(res, e.message, 400);
    }
  }

  // Player Settings (GET /api/settings)
  if (pathname === '/api/settings' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const settings = db.getPlayerSettings(playerAuth.id);
      return json(res, { ok: true, settings });
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  // Player Settings Update (PUT/POST /api/settings)
  if (pathname === '/api/settings' && (method === 'PUT' || method === 'POST')) {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const body = await parseBody(req);
      const updated = db.updatePlayerSettings(playerAuth.id, body.settings || body);
      return json(res, { ok: true, settings: updated });
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  // Classes & Subjects
  if (pathname === '/api/classes' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (query.all !== '1' && playerAuth && playerAuth.id) {
      const assigned = db.getPlayerClasses(playerAuth.id);
      if (assigned && assigned.length > 0) {
        return json(res, { ok: true, classes: assigned });
      }
    }
    return json(res, { ok: true, classes: db.getClasses() });
  }

  if (pathname === '/api/player/classes' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    return json(res, { ok: true, classes: db.getPlayerClasses(playerAuth.id) });
  }

  if (pathname === '/api/subjects' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    let cid = parseInt(query.classId || '0', 10);
    if (!cid && playerAuth) {
      const p = db.getPlayerById(playerAuth.id);
      if (p && p.classId) cid = p.classId;
    }
    if (!cid) cid = 1;
    const subjects = db.getSubjectsByClass(cid, playerAuth ? playerAuth.id : null);
    return json(res, { ok: true, subjects });
  }

  // Inventory & Economy
  if (pathname === '/api/inventory' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const inv = db.getInventory(playerAuth.id);
      return json(res, inv);
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  if (pathname === '/api/shop' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const s = db.getShop(playerAuth.id);
      return json(res, s);
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  if (pathname === '/api/shop/buy' && method === 'POST') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    const idemKey = req.headers['idempotency-key'];
    if (idemKey) {
      const cached = db.getIdempotency(playerAuth.id, idemKey);
      if (cached) return json(res, cached.response, cached.statusCode);
    }
    try {
      const body = await parseBody(req);
      const resBuy = db.buyShopItem(playerAuth.id, body.itemId);
      if (idemKey) db.saveIdempotency(playerAuth.id, idemKey, pathname, 200, resBuy);
      return json(res, resBuy);
    } catch (e) {
      if (e.code === 'INSUFFICIENT_COINS') return err(res, 'Koin tidak cukup', 422, 'INSUFFICIENT_COINS');
      if (e.code === 'ITEM_ALREADY_OWNED') return err(res, 'Item sudah dimiliki', 422, 'ITEM_ALREADY_OWNED');
      return err(res, e.message, 400);
    }
  }

  if (pathname === '/api/shop/box' && method === 'POST') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    const idemKey = req.headers['idempotency-key'];
    if (idemKey) {
      const cached = db.getIdempotency(playerAuth.id, idemKey);
      if (cached) return json(res, cached.response, cached.statusCode);
    }
    try {
      const resBox = db.buyMysteryBox(playerAuth.id);
      if (idemKey) db.saveIdempotency(playerAuth.id, idemKey, pathname, 200, resBox);
      return json(res, resBox);
    } catch (e) {
      if (e.code === 'INSUFFICIENT_COINS') return err(res, 'Koin tidak cukup', 422, 'INSUFFICIENT_COINS');
      return err(res, e.message, 400);
    }
  }

  if ((pathname === '/api/coins/history' || pathname === '/api/profile/transactions') && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    const limit = parseInt(query.limit || '20', 10);
    const history = db.getCoinHistory(playerAuth.id, limit);
    return json(res, { ok: true, items: history, history });
  }

  // Skills & Loadout
  if (pathname === '/api/skills' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const skills = db.getSkills(playerAuth.id);
      return json(res, skills);
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  if (((pathname === '/api/loadout' || pathname === '/api/duel-loadout' || pathname === '/api/loadout/duel') && (method === 'PUT' || method === 'POST'))) {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const body = await parseBody(req);
      const isDuel = body.type === 'duel' || pathname.includes('duel');
      const loadout = isDuel
        ? db.updateDuelLoadout(playerAuth.id, body.slots)
        : db.updateLoadout(playerAuth.id, body.slots);
      return json(res, { ok: true, loadout, type: isDuel ? 'duel' : 'adventure' });
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  // Duel Boss Loadout (Pasang boss yang sudah dikalahkan untuk battle vs player)
  if (pathname === '/api/duel-boss-loadout' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const details = db.getDuelBossLoadoutDetails(playerAuth.id);
      return json(res, { ok: true, ...details });
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  if ((pathname === '/api/duel-boss-loadout' || pathname === '/api/loadout/duel-boss') && (method === 'PUT' || method === 'POST')) {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const body = await parseBody(req);
      const slots = Array.isArray(body.slots) ? body.slots : [];
      const updated = db.updatePlayerDuelBossLoadout(playerAuth.id, slots);
      const details = db.getDuelBossLoadoutDetails(playerAuth.id);
      return json(res, { ok: true, loadout: updated, ...details });
    } catch (e) {
      const code = e.code || 'BAD_REQUEST';
      const status = (code === 'SLOT_LOCKED' || code === 'RARITY_LOCKED' || code === 'BOSS_NOT_DEFEATED') ? 403 : 400;
      return err(res, e.message, status, code);
    }
  }

  if (pathname.startsWith('/api/skills/') && pathname.endsWith('/upgrade') && method === 'POST') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');

    const idemKey = req.headers['idempotency-key'];
    if (!idemKey) {
      return err(res, 'Header Idempotency-Key wajib disertakan', 400, 'IDEMPOTENCY_KEY_REQUIRED');
    }

    const cached = db.getIdempotency(playerAuth.id, idemKey);
    if (cached) return json(res, cached.response, cached.statusCode);

    const parts = pathname.split('/');
    const skillId = parts[3];

    try {
      const resUp = db.upgradeSkill(playerAuth.id, skillId);
      db.saveIdempotency(playerAuth.id, idemKey, pathname, 200, resUp);
      console.log(`[SKILL_UPGRADE] player=${playerAuth.id} skill=${skillId} level=${resUp.skill ? resUp.skill.level : resUp.level} coins=${resUp.coins}`);
      return json(res, resUp);
    } catch (e) {
      if (e.code === 'SKILL_NOT_OWNED') return err(res, 'Skill ini belum kamu miliki', 404, 'SKILL_NOT_OWNED');
      if (e.code === 'MAX_LEVEL' || e.code === 'MAX_LEVEL_REACHED') return err(res, 'Skill sudah mencapai level maksimum', 409, 'MAX_LEVEL');
      if (e.code === 'INSUFFICIENT_COINS' || e.code === 'NOT_ENOUGH_COINS') return err(res, 'Koin tidak cukup', 422, 'NOT_ENOUGH_COINS');
      return err(res, e.message, 400, e.code || 'BAD_REQUEST');
    }
  }

  // Game Session: Active Session Check
  if ((pathname === '/api/game/active' || pathname === '/api/session/active') && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const activeData = db.getActiveSession(playerAuth.id);
      return json(res, {
        ...activeData,
        session: activeData.active?.session || null,
        ok: true
      });
    } catch (e) {
      return err(res, e.message, 400);
    }
  }



  // GET /api/report/abilities
  if (pathname === '/api/report/abilities' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const resData = db.computeSubjectAbilities(playerAuth.id);
      return json(res, resData);
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  // GET /api/report/week
  if (pathname === '/api/report/week' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    const offset = query.offset !== undefined ? parseInt(query.offset, 10) : undefined;
    const weekParam = query.week || query.weekKey;
    try {
      const rep = db.getWeeklyReport(playerAuth.id, { offset, week: weekParam, weekKey: weekParam });
      return json(res, { ok: true, report: rep });
    } catch (e) {
      return err(res, e.message, 400);
    }
  }


  // GET /r/:token (Public Report Share Portal)
  if (pathname.startsWith('/r/') && method === 'GET') {
    const token = pathname.replace('/r/', '').trim();
    const shareRes = db.getReportByShareToken(token);
    const wantsJson = (req.headers.accept && req.headers.accept.includes('application/json')) || query.json === '1';

    if (!shareRes) {
      if (wantsJson) return err(res, 'Tautan tidak ditemukan atau telah dicabut', 404, 'NOT_FOUND');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Tautan Tidak Ditemukan</title><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;box-sizing:border-box;text-align:center}.card{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px 24px;max-width:400px;width:100%}h1{font-size:1.3rem;margin:0 0 12px;color:#f87171}p{font-size:0.9rem;color:#94a3b8;line-height:1.5}</style></head><body><div class="card"><h1>🔒 Tautan Tidak Ditemukan</h1><p>Tautan laporan ini tidak valid atau telah dicabut oleh siswa.</p></div></body></html>');
    }

    if (shareRes.expired) {
      if (wantsJson) return err(res, 'Tautan laporan ini sudah kedaluwarsa', 410, 'EXPIRED');
      res.writeHead(410, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Tautan Kedaluwarsa</title><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;box-sizing:border-box;text-align:center}.card{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px 24px;max-width:400px;width:100%}h1{font-size:1.3rem;margin:0 0 12px;color:#fbbf24}p{font-size:0.9rem;color:#94a3b8;line-height:1.5}</style></head><body><div class="card"><h1>⏰ Tautan Kedaluwarsa</h1><p>Masa berlaku tautan laporan ini telah berakhir.</p></div></body></html>');
    }

    if (wantsJson) {
      return json(res, shareRes);
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(renderShareReportHtml(shareRes.report));
  }

  // POST /api/report/share
  if (pathname === '/api/report/share' && method === 'POST') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const share = db.createReportShare(playerAuth.id);
      return json(res, { ok: true, ...share });
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  // DELETE /api/report/share
  if (pathname === '/api/report/share' && method === 'DELETE') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      db.revokeReportShare(playerAuth.id);
      return json(res, { ok: true });
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  // GET /api/campaign?subjectId=
  if (pathname === '/api/campaign' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    const subjectId = query.subjectId || query.subject_id;
    if (!subjectId) return err(res, 'subjectId wajib diisi', 400);
    try {
      const camp = db.getCampaign(playerAuth.id, subjectId);
      return json(res, camp);
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  // Game Session Routes
  if ((pathname === '/api/game/start' || pathname === '/api/session/start') && method === 'POST') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');

    const idemKey = req.headers['idempotency-key'];
    if (idemKey) {
      const cached = db.getIdempotency(playerAuth.id, idemKey);
      if (cached) return json(res, cached.response, cached.statusCode);
    }

    try {
      const body = await parseBody(req);
      let subjectId = parseInt(body.subjectId, 10);
      if (!Number.isFinite(subjectId) || subjectId <= 0) {
        if (typeof body.subjectId === 'string' && body.subjectId.trim()) {
          const rawSlug = body.subjectId.trim().toLowerCase();
          const p = db.getPlayerById(playerAuth.id);
          const pClassId = p ? p.classId : 1;
          const matchSub = db.getDb().prepare(`
            SELECT id FROM subjects 
            WHERE LOWER(name) = ? AND (class_id = ? OR class_id IS NULL) AND is_active = 1
            LIMIT 1
          `).get(rawSlug, pClassId) || db.getDb().prepare(`
            SELECT id FROM subjects 
            WHERE LOWER(name) = ? AND is_active = 1
            LIMIT 1
          `).get(rawSlug);
          if (matchSub) {
            subjectId = matchSub.id;
          }
        }
      }
      if (!Number.isFinite(subjectId) || subjectId <= 0) {
        return err(res, 'Mata pelajaran tidak valid', 400, 'INVALID_SUBJECT');
      }
      const session = db.startSession(playerAuth.id, subjectId, body);
      if (idemKey) db.saveIdempotency(playerAuth.id, idemKey, pathname, 201, session);
      return json(res, session, 201);
    } catch (e) {
      if (e.code === 'ACTIVE_SESSION') {
        const activeSess = db.getSession(e.sessionId, playerAuth.id);
        const resp = {
          ok: false,
          error: { code: 'ACTIVE_SESSION', message: 'Anda masih memiliki sesi yang belum selesai' },
          session: activeSess
        };
        return json(res, resp, 409);
      }
      if (e.code === 'BRUTAL_LOCKED') {
        return err(res, e.message || 'Mode Brutal hanya dapat diakses pemain level 5 ke atas', 403, 'BRUTAL_LOCKED');
      }
      if (e.message === 'SUBJECT_NOT_FOUND') {
        return err(res, 'Mata pelajaran tidak ditemukan atau belum aktif', 404, 'SUBJECT_NOT_FOUND');
      }
      if (e.message === 'NO_QUESTIONS') {
        return err(res, 'Belum ada soal untuk mata pelajaran ini', 400, 'NO_QUESTIONS');
      }
      const requestId = Math.random().toString(36).substring(2, 10);
      console.error(`[startSession error] [requestId:${requestId}]`, e);
      return json(res, {
        ok: false,
        error: {
          code: 'START_FAILED',
          message: 'Gagal memulai petualangan. Coba lagi ya.',
          requestId
        }
      }, 500);
    }
  }

  const parts = pathname.split('/');
  const isGameRoute = (parts[1] === 'api' && (parts[2] === 'game' || parts[2] === 'session') && parts[3] && parts[3] !== 'start' && parts[3] !== 'active');

  if (isGameRoute) {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    const sessionId = parts[3];
    const action = parts[4];

    // GET /api/game/:id
    if (!action && method === 'GET') {
      const s = db.getSession(sessionId, playerAuth.id);
      if (!s) return err(res, 'Session tidak ditemukan', 404);
      return json(res, { ok: true, session: s });
    }

    // POST /api/game/:id/heartbeat
    if (action === 'heartbeat' && method === 'POST') {
      try {
        const body = await parseBody(req);
        const qIdx = body.questionIndex ?? body.orderIndex ?? body.questionId;
        const hb = db.heartbeatSession(sessionId, playerAuth.id, qIdx, body.clientInstanceId);
        return json(res, hb);
      } catch (e) {
        return err(res, e.message, 400);
      }
    }

    // POST /api/game/:id/resume
    if (action === 'resume' && method === 'POST') {
      try {
        const body = await parseBody(req);
        const resumed = db.resumeSession(sessionId, playerAuth.id, body.clientInstanceId);
        return json(res, resumed);
      } catch (e) {
        return err(res, e.message, 400);
      }
    }

    // POST /api/game/:id/next
    if (action === 'next' && method === 'POST') {
      try {
        const nextQ = db.nextQuestion(sessionId, playerAuth.id);
        return json(res, nextQ);
      } catch (e) {
        if (e.code === 'EVENT_PENDING' || e.message === 'EVENT_PENDING') {
          return err(res, 'Selesaikan kejutan terlebih dahulu', 409, 'EVENT_PENDING', { event: e.event });
        }
        return err(res, e.message, 400);
      }
    }

    // POST /api/game/:id/ready
    if (action === 'ready' && method === 'POST') {
      const idemKey = req.headers['idempotency-key'];
      if (idemKey) {
        const cached = db.getIdempotency(playerAuth.id, idemKey);
        if (cached) return json(res, cached.response, cached.statusCode);
      }
      try {
        const body = await parseBody(req);
        const resReady = db.readyQuestion(sessionId, playerAuth.id, body.questionId ?? body.questionIndex);
        if (idemKey) db.saveIdempotency(playerAuth.id, idemKey, pathname, 200, resReady);
        return json(res, resReady);
      } catch (e) {
        return err(res, e.message, 400);
      }
    }

    // GET /api/game/:id/skills
    if (action === 'skills' && method === 'GET') {
      try {
        const skills = db.getSkillAvailability(sessionId, playerAuth.id);
        return json(res, { ok: true, skills });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }

    // POST /api/game/:id/skill
    if ((action === 'skill' || action === 'skills') && method === 'POST') {
      const idemKey = req.headers['idempotency-key'];
      if (idemKey) {
        const cached = db.getIdempotency(playerAuth.id, idemKey);
        if (cached) return json(res, cached.response, cached.statusCode);
      }
      try {
        const body = await parseBody(req);
        const resSkill = db.useSkill(sessionId, playerAuth.id, body.skillId, body.questionId ?? body.questionIndex);
        if (idemKey) db.saveIdempotency(playerAuth.id, idemKey, pathname, 200, resSkill);
        return json(res, resSkill);
      } catch (e) {
        if (e.message === 'SKILL_UNAVAILABLE' || e.code === 'SKILL_UNAVAILABLE') {
          const reasonKey = e.reason || 'NO_ENERGY';
          const reasonText = (GameplayConfig && GameplayConfig.SKILL_REASON_TEXT && GameplayConfig.SKILL_REASON_TEXT[reasonKey]) || 'Skill tidak dapat digunakan saat ini';
          return err(res, reasonText, 409, 'SKILL_UNAVAILABLE', { reason: reasonKey });
        }
        return err(res, e.message, 400);
      }
    }

    // POST /api/game/:id/answer
    if (action === 'answer' && method === 'POST') {
      const idemKey = req.headers['idempotency-key'];
      if (idemKey) {
        const cached = db.getIdempotency(playerAuth.id, idemKey);
        if (cached) return json(res, cached.response, cached.statusCode);
      }
      try {
        const body = await parseBody(req);
        const qIdent = body.questionId ?? body.questionIndex ?? null;
        const chosen = body.choice ?? body.chosenIndex ?? body.selectedIndex ?? body.selected ?? body.answer;
        const resAns = db.answerQuestion(sessionId, playerAuth.id, qIdent, chosen);
        if (idemKey) db.saveIdempotency(playerAuth.id, idemKey, pathname, 200, resAns);
        return json(res, resAns);
      } catch (e) {
        if (e.message === 'OPTION_ELIMINATED' || e.code === 'OPTION_ELIMINATED') {
          return err(res, 'Opsi ini sudah dicoret oleh skill!', 409, 'OPTION_ELIMINATED');
        }
        return err(res, e.message, 400);
      }
    }

    // POST /api/game/:id/event
    if (action === 'event' && method === 'POST') {
      const idemKey = req.headers['idempotency-key'];
      if (idemKey) {
        const cached = db.getIdempotency(playerAuth.id, idemKey);
        if (cached) return json(res, cached.response, cached.statusCode);
      }
      try {
        const body = await parseBody(req);
        const resEvt = db.resolveEvent(sessionId, playerAuth.id, body.eventId, body.choice);
        if (idemKey) db.saveIdempotency(playerAuth.id, idemKey, pathname, 200, resEvt);
        return json(res, resEvt);
      } catch (e) {
        if (e.message === 'INSUFFICIENT_COINS') {
          return err(res, 'Koin kamu tidak cukup untuk tawaran ini!', 400, 'INSUFFICIENT_COINS');
        }
        return err(res, e.message, 400);
      }
    }

        // GET /api/game/:id/wrong or /api/game/:id/review
    if ((action === 'wrong' || action === 'review') && method === 'GET') {
      try {
        const wrongQuestions = db.getSessionWrongQuestions(sessionId, playerAuth.id);
        return json(res, { ok: true, wrongQuestions });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }

    // POST /api/game/:id/abandon
    if (action === 'abandon' && method === 'POST') {
      try {
        const resAb = db.abandonSession(sessionId, playerAuth.id);
        return json(res, { ok: true, session: resAb });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }
  }

  // Dex
  if (pathname === '/api/dex' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    const monsters = db.getDex(playerAuth.id);
    const dexData = db.getPlayerDex(playerAuth.id);
    return json(res, { ok: true, brutal: dexData.brutal, progress: dexData.progress, monsters });
  }

  // ===== FITUR v7: Pertemanan & Presence =====
  // GET /api/friends
  if (pathname === '/api/friends' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    const list = dbFriends.list(db.getDb(), playerAuth.id);
    const incoming = dbFriends.incoming(db.getDb(), playerAuth.id).map(r => ({ id: r.id, fromId: r.fromId, nick: r.nick, createdAt: r.created_at }));
    return json(res, { ok: true, code: 'OK', friends: list, incoming });
  }

  // GET /api/friends/search?q=
  if (pathname === '/api/friends/search' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    const q = query.q || '';
    const results = dbFriends.searchPlayers(db.getDb(), q, playerAuth.id);
    return json(res, { ok: true, code: 'OK', results });
  }

  // POST /api/friends/request { nick }
  if (pathname === '/api/friends/request' && method === 'POST') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const body = await parseBody(req);
      const r = dbFriends.sendRequest(db.getDb(), playerAuth.id, body?.nick);
      if (r.code !== 'OK') return err(res, r.code, 400, r.code);
      return json(res, { ok: true, code: 'OK', toId: r.toId });
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  // POST /api/friends/respond { requestId, action }
  if (pathname === '/api/friends/respond' && method === 'POST') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const body = await parseBody(req);
      const r = dbFriends.respond(db.getDb(), Number(body?.requestId), playerAuth.id, body?.action);
      if (r.code !== 'OK') return err(res, r.code, 400, r.code);
      return json(res, { ok: true, code: 'OK' });
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  // GET /api/friends/:id or /api/friends/:id/profile
  if (pathname.startsWith('/api/friends/') && pathname !== '/api/friends/search' && pathname !== '/api/friends/request' && pathname !== '/api/friends/respond' && pathname !== '/api/friends/history' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    let rawId = pathname.slice('/api/friends/'.length);
    if (rawId.endsWith('/profile')) rawId = rawId.slice(0, -'/profile'.length);
    const friendId = Number(rawId);
    if (!Number.isInteger(friendId)) return err(res, 'BAD_REQUEST', 400, 'BAD_REQUEST');
    const friendProfile = db.getPlayerPublicProfile(friendId);
    if (!friendProfile) return err(res, 'Pemain tidak ditemukan', 404, 'PLAYER_NOT_FOUND');
    return json(res, friendProfile);
  }

  // DELETE /api/friends/:id
  if (pathname.startsWith('/api/friends/') && pathname !== '/api/friends/search' && pathname !== '/api/friends/request' && pathname !== '/api/friends/respond' && pathname !== '/api/friends/history' && method === 'DELETE') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    const friendId = Number(pathname.slice('/api/friends/'.length));
    if (!Number.isInteger(friendId)) return err(res, 'BAD_REQUEST', 400, 'BAD_REQUEST');
    dbFriends.remove(db.getDb(), playerAuth.id, friendId);
    return json(res, { ok: true, code: 'OK' });
  }

  // POST /api/presence/ping { activity? }
  if (pathname === '/api/presence/ping' && method === 'POST') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const body = await parseBody(req);
      dbFriends.pingPresence(db.getDb(), playerAuth.id, body?.activity);
      return json(res, { ok: true, code: 'OK' });
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  // ===== FITUR v7: Duel =====
  // POST /api/duels/challenge { friendId, subjectId, classId, questionTypes }
  if (pathname === '/api/duels/challenge' && method === 'POST') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const b = await parseBody(req);
      const r = dbDuel.createChallenge(db.getDb(), {
        challengerId: playerAuth.id,
        friendId: Number(b?.friendId),
        subjectId: Number(b?.subjectId),
        classId: b?.classId ? Number(b.classId) : undefined,
        questionTypes: b?.questionTypes
      });
      if (r.code !== 'OK') return err(res, r.code, 400, r.code, r);
      return json(res, { ok: true, code: 'OK', duelId: r.duelId });
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  // GET /api/duels/invites
  if (pathname === '/api/duels/invites' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    dbDuel.expireStaleInvites(db.getDb());
    const rows = db.getDb().prepare(`SELECT d.id, d.subject_id, d.class_id, d.question_types_json, d.created_at,
                                            s.name AS subject_name, c.name AS class_name,
                                            p.nick AS from_nick FROM duels d
                                     JOIN players p ON p.id = d.challenger_id
                                     LEFT JOIN subjects s ON s.id = d.subject_id
                                     LEFT JOIN classes c ON c.id = COALESCE(d.class_id, s.class_id)
                                     WHERE d.status='PENDING' AND d.challenged_id=? ORDER BY d.created_at DESC`)
      .all(playerAuth.id);
    return json(res, { ok: true, code: 'OK', invites: rows });
  }

  // GET /api/duels/active
  if (pathname === '/api/duels/active' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    const row = db.getDb().prepare(`SELECT id, status, phase FROM duels
                                    WHERE status IN ('ACTIVE', 'PAUSED') AND (challenger_id=? OR challenged_id=?) LIMIT 1`)
      .get(playerAuth.id, playerAuth.id);
    return json(res, { ok: true, code: 'OK', active: row || null });
  }

  // POST /api/duels/:id/respond { action }
  {
    const m = pathname.match(/^\/api\/duels\/([^/]+)\/respond$/);
    if (m && method === 'POST') {
      const playerAuth = getPlayerFromReq(req);
      if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
      try {
        const b = await parseBody(req);
        const r = dbDuel.respondInvite(db.getDb(), m[1], playerAuth.id, b?.action);
        if (r.code !== 'OK') return err(res, r.code, 400, r.code);
        return json(res, { ok: true, code: 'OK', duelId: m[1] });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }
  }

  // GET /api/duels/:id/state
  {
    const m = pathname.match(/^\/api\/duels\/([^/]+)\/state$/);
    if (m && method === 'GET') {
      const playerAuth = getPlayerFromReq(req);
      if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
      const r = dbDuel.getDuelState(db.getDb(), m[1], playerAuth.id);
      if (r.code) return err(res, r.code, 400, r.code);
      return json(res, { ok: true, code: 'OK', ...r });
    }
  }

  // GET /api/duels/:id/question/:idx
  {
    const m = pathname.match(/^\/api\/duels\/([^/]+)\/question\/(\d+)$/);
    if (m && method === 'GET') {
      const playerAuth = getPlayerFromReq(req);
      if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
      const duelId = m[1];
      const idx = Number(m[2]);
      const who = db.getDb().prepare('SELECT challenger_id, challenged_id FROM duels WHERE id=?').get(duelId);
      if (!who) return err(res, 'DUEL_NOT_FOUND', 404, 'DUEL_NOT_FOUND');
      const meSide = (who.challenger_id === playerAuth.id ? 'challenger' : (who.challenged_id === playerAuth.id ? 'challenged' : null));
      if (!meSide) return err(res, 'NOT_PARTICIPANT', 403, 'NOT_PARTICIPANT');

      const dq = db.getDb().prepare('SELECT * FROM duel_questions WHERE duel_id=? AND order_index=?').get(duelId, idx);
      if (!dq) return err(res, 'QUESTION_NOT_FOUND', 404, 'QUESTION_NOT_FOUND');
      const q = db.getDb().prepare(`SELECT text, options_json, COALESCE(question_type, 'MCQ') as question_type, type_data_json FROM questions WHERE id=?`).get(dq.question_id);
      if (!q) return err(res, 'QUESTION_NOT_FOUND', 404, 'QUESTION_NOT_FOUND');

      let rawOpts = [];
      try { rawOpts = JSON.parse(q.options_json); } catch {}
      const order = JSON.parse(meSide === 'challenger' ? dq.option_order_challenger_json : dq.option_order_challenged_json);
      const mappedOptions = order.map(i => rawOpts[i]);
      let typeData = null;
      try { if (q.type_data_json) typeData = JSON.parse(q.type_data_json); } catch {}
      const elimCol = (meSide === 'challenger' ? dq.eliminated_challenger_json : dq.eliminated_challenged_json);
      let eliminated = [];
      try { eliminated = JSON.parse(elimCol || '[]'); } catch {}
      return json(res, {
        ok: true,
        code: 'OK',
        orderIndex: idx,
        text: q.text,
        options: mappedOptions,
        eliminated,
        questionType: q.question_type,
        typeData
      });
    }
  }

  // POST /api/duels/:id/answer { orderIndex, chosenIndex, elapsedMs }
  {
    const m = pathname.match(/^\/api\/duels\/([^/]+)\/answer$/);
    if (m && method === 'POST') {
      const playerAuth = getPlayerFromReq(req);
      if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
      try {
        const b = await parseBody(req);
        const r = dbDuel.submitAnswer(db.getDb(), m[1], playerAuth.id, Number(b?.orderIndex), Number(b?.chosenIndex), Number(b?.elapsedMs) || 0);
        if (r.code !== 'OK') return err(res, r.code, 400, r.code, { reason: r.reason });
        return json(res, { ok: true, code: 'OK', isCorrect: r.isCorrect, damage: r.damage, phase: r.phase });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }
  }

  // POST /api/duels/:id/skill { skillId, skillLv, orderIndex }
  {
    const m = pathname.match(/^\/api\/duels\/([^/]+)\/skill$/);
    if (m && method === 'POST') {
      const playerAuth = getPlayerFromReq(req);
      if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
      try {
        const b = await parseBody(req);
        const r = dbDuel.useDuelSkill(db.getDb(), m[1], playerAuth.id, b?.skillId, Number(b?.skillLv) || 1, Number(b?.orderIndex));
        if (r.code !== 'OK') return err(res, r.code, 400, r.code, { reason: r.reason });
        return json(res, { ok: true, code: 'OK', ...r });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }
  }

  // POST /api/duels/:id/reconnect
  {
    const m = pathname.match(/^\/api\/duels\/([^/]+)\/reconnect$/);
    if (m && method === 'POST') {
      const playerAuth = getPlayerFromReq(req);
      if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
      const r = dbDuel.reconnect(db.getDb(), m[1], playerAuth.id);
      if (r.code !== 'OK') return err(res, r.code, 400, r.code);
      return json(res, { ok: true, code: 'OK' });
    }
  }

  // POST /api/duels/:id/forfeit
  {
    const m = pathname.match(/^\/api\/duels\/([^/]+)\/forfeit$/);
    if (m && method === 'POST') {
      const playerAuth = getPlayerFromReq(req);
      if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
      const r = dbDuel.forfeit(db.getDb(), m[1], playerAuth.id);
      if (r.code !== 'OK') return err(res, r.code, 400, r.code);
      return json(res, { ok: true, code: 'OK' });
    }
  }

  // GET /api/friends/history?limit=
  if (pathname === '/api/friends/history' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const hist = dbDuel.history(db.getDb(), playerAuth.id, limit);
    return json(res, { ok: true, code: 'OK', history: hist });
  }

  // Admin Routes
  if (pathname === '/api/admin/login' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const admin = db.loginAdmin(body.username, body.password);
      if (!admin) return err(res, 'Username atau password admin salah', 401, 'INVALID_CREDENTIALS');
      const token = auth.signToken({ type: 'admin', id: admin.id, username: admin.username });
      const cookie = setCookieHeader('pp_admin', token, 30 * 86400, isSecure);
      return json(res, { ok: true, admin, token }, 200, { 'Set-Cookie': cookie });
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  if (pathname === '/api/admin/logout' && method === 'POST') {
    const cookie = clearCookieHeader('pp_admin');
    return json(res, { ok: true }, 200, { 'Set-Cookie': cookie });
  }

  if ((pathname === '/api/admin/overview' || pathname === '/api/admin/stats') && method === 'GET') {
    const ov = db.getAdminOverview();
    return json(res, { ok: true, overview: ov, ...ov });
  }

  if (pathname.startsWith('/api/admin/')) {
    const adminAuth = getAdminFromReq(req);
    if (!adminAuth) return err(res, 'Silakan login sebagai admin', 401, 'UNAUTHORIZED');

    if (pathname === '/api/admin/me' && method === 'GET') {
      return json(res, { ok: true, admin: adminAuth });
    }
    if (pathname === '/api/admin/classes' && method === 'GET') {
      return json(res, { ok: true, classes: db.adminGetClasses() });
    }
    if (pathname === '/api/admin/classes' && method === 'POST') {
      try {
        const body = await parseBody(req);
        const saved = db.adminSaveClass(body);
        return json(res, { ok: true, class: saved });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }
    if ((pathname === '/api/admin/classes' || pathname.startsWith('/api/admin/classes/')) && method === 'DELETE') {
      let cid = parseInt(query.id || query.classId, 10);
      if (!cid && pathname.startsWith('/api/admin/classes/')) {
        cid = parseInt(pathname.split('/').pop(), 10);
      }
      if (!cid) return err(res, 'ID kelas diperlukan', 400);
      try {
        const result = db.adminDeleteClass(cid);
        return json(res, { ok: true, ...result });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }
    if (pathname === '/api/admin/subjects' && method === 'GET') {
      const cid = query.classId ? parseInt(query.classId, 10) : null;
      return json(res, { ok: true, subjects: db.adminGetSubjects(cid) });
    }
    if ((pathname === '/api/admin/subjects' || pathname === '/api/admin/subject') && method === 'POST') {
      try {
        const body = await parseBody(req);
        const saved = db.adminSaveSubject(body);
        return json(res, { ok: true, subject: saved });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }
    if ((pathname === '/api/admin/subjects' || pathname === '/api/admin/subject' || pathname.startsWith('/api/admin/subjects/') || pathname.startsWith('/api/admin/subject/')) && method === 'DELETE') {
      let sid = parseInt(query.id || query.subjectId, 10);
      if (!sid && (pathname.startsWith('/api/admin/subjects/') || pathname.startsWith('/api/admin/subject/'))) {
        sid = parseInt(pathname.split('/').pop(), 10);
      }
      if (!sid) return err(res, 'ID mata pelajaran diperlukan', 400);
      try {
        const result = db.adminDeleteSubject(sid);
        return json(res, { ok: true, ...result });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }
    if (pathname === '/api/admin/questions' && method === 'GET') {
      const sid = parseInt(query.subjectId, 10);
      if (!sid) return err(res, 'subjectId diperlukan', 400);
      return json(res, { ok: true, questions: db.adminGetQuestions(sid) });
    }
    if ((pathname === '/api/admin/questions' || pathname === '/api/admin/question') && method === 'POST') {
      try {
        const body = await parseBody(req);
        const saved = db.adminSaveQuestion(body);
        return json(res, { ok: true, question: saved });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }
    if ((pathname === '/api/admin/questions' || pathname === '/api/admin/question' || pathname.startsWith('/api/admin/questions/') || pathname.startsWith('/api/admin/question/')) && method === 'DELETE') {
      let qid = parseInt(query.id, 10);
      if (!qid && (pathname.startsWith('/api/admin/questions/') || pathname.startsWith('/api/admin/question/'))) {
        qid = parseInt(pathname.split('/').pop(), 10);
      }
      if (!qid) return err(res, 'id diperlukan', 400);
      return json(res, db.adminDeleteQuestion(qid));
    }
    if ((pathname === '/api/admin/questions/export' || pathname === '/api/admin/export') && method === 'GET') {
      const sid = parseInt(query.subjectId || query.subject_id, 10);
      if (!sid) return err(res, 'subjectId diperlukan', 400);
      try {
        const exported = db.adminExportQuestions(sid);
        return json(res, { ok: true, ...exported });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }
    if ((pathname === '/api/admin/questions/import' || pathname === '/api/admin/import') && method === 'POST') {
      try {
        const body = await parseBody(req);
        const sid = parseInt(query.subjectId || query.subject_id || (body && (body.subjectId || body.subject_id)), 10);
        if (!sid) return err(res, 'subjectId diperlukan', 400);
        const questions = Array.isArray(body) ? body : (body && (body.questions || body.data) ? (body.questions || body.data) : []);
        const result = db.adminImportQuestions(sid, questions);
        return json(res, { ok: true, ...result });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }

    if (pathname === '/api/admin/reports' && method === 'GET') {
      const classId = parseInt(query.classId || query.class_id || 1, 10);
      const weekKey = query.weekKey || query.week;
      try {
        const reportsList = db.getClassWeeklyReports(classId, weekKey);
        return json(res, { ok: true, reports: reportsList });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }

    if (pathname === '/api/admin/reports/csv' && method === 'GET') {
      const classId = parseInt(query.classId || query.class_id || 1, 10);
      const weekKey = query.weekKey || query.week;
      try {
        const csvData = db.exportClassReportsCsv(classId, weekKey);
        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="laporan-kelas-${classId}-${weekKey || 'terkini'}.csv"`
        });
        return res.end(csvData);
      } catch (e) {
        return err(res, e.message, 400);
      }
    }

    if (pathname === '/api/admin/reports/generate-weekly' && method === 'POST') {
      try {
        const result = db.generateAllWeeklyReports();
        return json(res, { ok: true, result });
      } catch (e) {
        return err(res, e.message, 500);
      }
    }

    if (pathname === '/api/admin/players' && method === 'GET') {
      return json(res, { ok: true, players: db.adminGetPlayers() });
    }
    if (pathname === '/api/admin/players/reset-password' && method === 'POST') {
      try {
        const body = await parseBody(req);
        return json(res, db.adminResetPlayerPassword(body.id, body.newPassword));
      } catch (e) {
        return err(res, e.message, 400);
      }
    }
    if ((pathname === '/api/admin/players/add-class' || pathname === '/api/admin/players/class/add') && method === 'POST') {
      try {
        const body = await parseBody(req);
        const pid = parseInt(body.playerId || body.player_id, 10);
        const cid = parseInt(body.classId || body.class_id, 10);
        if (!pid || !cid) return err(res, 'playerId dan classId diperlukan', 400);
        const updated = db.adminAddPlayerClass(pid, cid);
        return json(res, { ok: true, classes: updated });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }
    if ((pathname === '/api/admin/players/remove-class' || pathname === '/api/admin/players/class/remove') && method === 'POST') {
      try {
        const body = await parseBody(req);
        const pid = parseInt(body.playerId || body.player_id, 10);
        const cid = parseInt(body.classId || body.class_id, 10);
        if (!pid || !cid) return err(res, 'playerId dan classId diperlukan', 400);
        const updated = db.adminRemovePlayerClass(pid, cid);
        return json(res, { ok: true, classes: updated });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }
    if ((pathname === '/api/admin/players/set-classes' || pathname === '/api/admin/players/classes') && method === 'POST') {
      try {
        const body = await parseBody(req);
        const pid = parseInt(body.playerId || body.player_id, 10);
        if (!pid) return err(res, 'playerId diperlukan', 400);
        const classIds = body.classIds || body.classes || [];
        const updated = db.adminSetPlayerClasses(pid, classIds);
        return json(res, { ok: true, classes: updated });
      } catch (e) {
        return err(res, e.message, 400);
      }
    }
  }

  /* ─────────────────────────────────────────────────────────────
     STATIC FILE SERVING
  ───────────────────────────────────────────────────────────── */
  let filePath;
  if (pathname.startsWith('/shared/')) {
    filePath = path.join(__dirname, 'shared', pathname.replace('/shared/', ''));
  } else if (pathname === '/admin' || pathname === '/admin/laporan') {
    filePath = path.join(PUBLIC_DIR, 'admin.html');
  } else {
    filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  }

  fs.stat(filePath, (errStat, stats) => {
    if (errStat || !stats.isFile()) {
      // SPA Fallback for non-API routes
      if (!pathname.startsWith('/api/')) {
        const fallback = path.join(PUBLIC_DIR, 'index.html');
        return fs.readFile(fallback, (errFb, content) => {
          if (errFb) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('Not Found');
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        });
      }
      return err(res, 'Not Found', 404, 'NOT_FOUND');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    const isNoCache = ext === '.html' || pathname === '/sw.js' || ext === '.js' || ext === '.css' || ext === '.json' || ext === '.webmanifest';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': isNoCache ? 'no-cache, no-store, must-revalidate, max-age=0' : 'public, max-age=86400',
      'Pragma': isNoCache ? 'no-cache' : 'public',
    });
    fs.createReadStream(filePath).pipe(res);
  });
});


if (require.main === module) {
  // Cron: Tiap Senin 06:00 WIB buat WeeklyReport untuk pemain yang aktif minggu lalu (J.3)
  setInterval(() => {
    const now = new Date();
    const wib = new Date(now.getTime() + 7 * 3600 * 1000);
    if (wib.getUTCDay() === 1 && wib.getUTCHours() === 6 && wib.getUTCMinutes() === 0) {
      try {
        db.generateAllWeeklyReports();
        console.log('[CRON] Weekly reports auto-generated at Monday 06:00 WIB');
      } catch (e) {
        console.error('[CRON] Failed to auto-generate weekly reports:', e.message);
      }
    }
  }, 60000).unref();

  server.listen(PORT, HOST, () => {
    console.log(`[petualangan-pelajar] Server running on http://${HOST}:${PORT}`);
  });
}

module.exports = server;


function renderShareReportHtml(report) {
  const nick = (report.player && report.player.nick) ? report.player.nick : 'Siswa';
  const week = report.week || '';
  const from = report.from || '';
  const to = report.to || '';
  const s = report.summary || {};
  const bossTiers = s.bossByTier || { common: 0, rare: 0, epic: 0, legend: 0 };
  const abilities = report.abilities || [];
  const daily = report.daily || [];
  const weak = report.weakTopics || [];
  const mastered = report.masteredTopics || [];
  const praise = report.praise || [];
  const advice = report.advice || [];

  const maxDay = Math.max(1, ...daily.map(d => d.answered || 0));
  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const chartBars = daily.map((d, i) => {
    const ans = d.answered || 0;
    const barH = Math.round((ans / maxDay) * 75);
    const y = 85 - barH;
    const x = 20 + i * 40;
    const acc = d.answered > 0 ? Math.round((d.correct / d.answered) * 100) : 0;
    const accColor = acc >= 75 ? '#10b981' : (acc >= 50 ? '#38bdf8' : (acc > 0 ? '#f59e0b' : '#64748b'));
    return '<g>' +
      '<rect x="' + x + '" y="' + y + '" width="24" height="' + barH + '" rx="4" fill="url(#barGrad)" opacity="0.85">' +
      '<title>' + dayNames[i] + ': ' + ans + ' soal (' + acc + '% akurasi)</title></rect>' +
      (ans > 0 ? '<circle cx="' + (x + 12) + '" cy="' + Math.max(10, y - 8) + '" r="4" fill="' + accColor + '" />' : '') +
      '<text x="' + (x + 12) + '" y="102" text-anchor="middle" font-size="10" fill="#94a3b8">' + dayNames[i] + '</text>' +
      '</g>';
  }).join('');

  const abilityRows = abilities.map(item => {
    const isNone = item.status === 'NONE';
    const isIns = item.status === 'INSUFFICIENT';
    const scoreText = (item.score !== null && item.score !== undefined) ? item.score : '-';
    const color = item.level === 5 ? '#eab308' : (item.level === 4 ? '#a855f7' : (item.level === 3 ? '#3b82f6' : (item.level === 2 ? '#10b981' : '#64748b')));
    const desc = isNone ? 'Belum pernah dicoba' : (isIns ? 'Baru ' + item.attempts + '/8 jawaban' : 'Akurasi ' + item.accuracy + '% · Dikuasai ' + item.mastery + '%');
    return '<div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:12px;margin-bottom:8px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
      '<span style="font-size:1.3rem">' + (item.icon || '📚') + '</span>' +
      '<div>' +
      '<div style="font-weight:700;font-size:0.95rem;color:#f8fafc">' + item.name + '</div>' +
      '<div style="font-size:0.75rem;color:#94a3b8">' + desc + '</div>' +
      '</div></div>' +
      '<div style="text-align:right">' +
      '<div style="font-size:1rem;font-weight:800;color:' + color + '">' + scoreText + '<span style="font-size:0.75rem;font-weight:400;color:#94a3b8">/100</span></div>' +
      '<div style="font-size:0.75rem;font-weight:600;color:' + color + '">' + (item.levelIcon || '🌱') + ' ' + (item.levelName || 'Pemula') + '</div>' +
      '</div></div>' +
      '<div style="height:6px;background:#0f172a;border-radius:3px;overflow:hidden">' +
      '<div style="width:' + (item.score || 0) + '%;height:100%;background:' + color + ';border-radius:3px"></div>' +
      '</div></div>';
  }).join('');

  return '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Laporan Belajar - ' + nick + '</title>' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<style>' +
    'body{font-family:system-ui,-apple-system,sans-serif;background:#0b1120;color:#f8fafc;margin:0;padding:16px;display:flex;justify-content:center}' +
    '.container{max-width:500px;width:100%;display:flex;flex-direction:column;gap:14px}' +
    '.card{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:16px}' +
    '.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}' +
    '.stat-card{background:#0f172a;border:1px solid #334155;border-radius:12px;padding:10px;text-align:center}' +
    '.stat-val{font-size:1.25rem;font-weight:800;color:#38bdf8}' +
    '.stat-lbl{font-size:0.72rem;color:#94a3b8;margin-top:2px}' +
    '.tier-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:6px;font-size:0.72rem;background:rgba(255,255,255,0.06)}' +
    'h2,h3{margin:0;font-weight:800}' +
    '</style></head><body>' +
    '<div class="container">' +
    '<div style="text-align:center;padding:10px 0">' +
    '<div style="font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;color:#38bdf8;font-weight:700">Petualangan Pelajar · Laporan Siswa</div>' +
    '<h2 style="font-size:1.35rem;margin:4px 0 2px">' + nick + '</h2>' +
    '<div style="font-size:0.82rem;color:#94a3b8">Periode: ' + from + ' – ' + to + ' (' + week + ')</div>' +
    '</div>' +
    '<div class="card">' +
    '<h3 style="font-size:0.95rem;margin-bottom:12px">📊 Ringkasan Pekan Ini</h3>' +
    '<div class="grid-3" style="margin-bottom:8px">' +
    '<div class="stat-card"><div class="stat-val">' + (s.answered || 0) + '</div><div class="stat-lbl">Soal Dijawab</div></div>' +
    '<div class="stat-card"><div class="stat-val" style="color:#10b981">' + (s.accuracy || 0) + '%</div><div class="stat-lbl">Akurasi</div></div>' +
    '<div class="stat-card"><div class="stat-val" style="color:#fbbf24">' + (s.minutes || 0) + 'm</div><div class="stat-lbl">Waktu Belajar</div></div>' +
    '</div>' +
    '<div class="grid-3">' +
    '<div class="stat-card"><div class="stat-val" style="color:#a855f7">' + (s.sessions || 0) + '</div><div class="stat-lbl">Sesi Main</div></div>' +
    '<div class="stat-card"><div class="stat-val" style="color:#38bdf8">' + (s.activeDays || 0) + '/7</div><div class="stat-lbl">Hari Aktif</div></div>' +
    '<div class="stat-card"><div class="stat-val" style="color:#f43f5e">' + (s.bossDefeated || 0) + '</div><div class="stat-lbl">Boss Kalah</div></div>' +
    '</div>' +
    ((s.bossDefeated || 0) > 0 ? ('<div style="display:flex;justify-content:center;gap:6px;margin-top:10px;flex-wrap:wrap">' +
      '<span class="tier-chip">⚪ Common: ' + (bossTiers.common || 0) + '</span>' +
      '<span class="tier-chip">🔵 Rare: ' + (bossTiers.rare || 0) + '</span>' +
      '<span class="tier-chip">🟣 Epic: ' + (bossTiers.epic || 0) + '</span>' +
      '<span class="tier-chip">🟡 Legend: ' + (bossTiers.legend || 0) + '</span>' +
      '</div>') : '') +
    '</div>' +
    '<div class="card">' +
    '<h3 style="font-size:0.95rem;margin-bottom:8px">📈 Aktivitas 7 Hari</h3>' +
    '<div style="background:#0f172a;border-radius:12px;padding:8px 4px">' +
    '<svg viewBox="0 0 300 115" width="100%" height="110" aria-label="Grafik aktivitas 7 hari">' +
    '<defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient></defs>' +
    '<line x1="15" y1="85" x2="285" y2="85" stroke="#334155" stroke-dasharray="3,3" />' +
    chartBars +
    '</svg></div></div>' +
    '<div class="card">' +
    '<h3 style="font-size:0.95rem;margin-bottom:4px">🎯 Level Kemampuan per Mapel</h3>' +
    '<p style="font-size:0.75rem;color:#94a3b8;margin:0 0 12px 0">Diurutkan dari mata pelajaran yang paling membutuhkan latihan.</p>' +
    (abilityRows || '<div style="color:#94a3b8;font-size:0.85rem">Belum ada data kemampuan.</div>') +
    '</div>' +
    ((weak.length > 0 || mastered.length > 0) ? ('<div class="card">' +
      (weak.length > 0 ? ('<h3 style="font-size:0.95rem;color:#f87171;margin-bottom:8px">⚠️ Topik Perlu Dibimbing</h3><div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">' +
        weak.map(w => '<div style="background:#0f172a;border-left:3px solid #f87171;padding:6px 10px;border-radius:6px;font-size:0.8rem"><strong>' + w.subject + '</strong> · ' + w.topic + ' — akurasi ' + w.accuracy + '% (' + w.attempts + ' jawaban)</div>').join('') + '</div>') : '') +
      (mastered.length > 0 ? ('<h3 style="font-size:0.95rem;color:#10b981;margin-bottom:8px">✨ Topik Sudah Dikuasai</h3><div style="display:flex;flex-direction:column;gap:6px">' +
        mastered.map(m => '<div style="background:#0f172a;border-left:3px solid #10b981;padding:6px 10px;border-radius:6px;font-size:0.8rem"><strong>' + m.subject + '</strong> · ' + m.topic + ' — dikuasai (' + m.count + ' soal)</div>').join('') + '</div>') : '') +
      '</div>') : '') +
    ((praise.length > 0 || advice.length > 0) ? ('<div class="card">' +
      '<h3 style="font-size:0.95rem;margin-bottom:10px">💬 Catatan Belajar</h3>' +
      '<div style="display:flex;flex-direction:column;gap:8px">' +
      praise.map(p => '<div style="background:#0f172a;border-left:3px solid #38bdf8;padding:8px 10px;border-radius:8px;font-size:0.82rem">🌟 ' + p + '</div>').join('') +
      advice.map(a => '<div style="background:#0f172a;border-left:3px solid #fbbf24;padding:8px 10px;border-radius:8px;font-size:0.82rem;color:#fef08a">💡 ' + a + '</div>').join('') +
      '</div></div>') : '') +
    '<div style="text-align:center;padding:16px 0;font-size:0.75rem;color:#64748b">Portal Laporan Orang Tua & Guru · Petualangan Pelajar</div>' +
    '</div></body></html>';
}
