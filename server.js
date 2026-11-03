'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');
const db = require('./lib/db');
const auth = require('./lib/auth');
const GameplayConfig = require('./shared/gameplay');

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
  if ((pathname === '/api/auth/register' || pathname === '/api/player/register') && method === 'POST') {
    try {
      const body = await parseBody(req);
      const player = db.registerPlayer(body.nick, body.password, body.classId);
      const token = auth.signToken({ type: 'player', id: player.id, nick: player.nick });
      const cookie = setCookieHeader('pp_player', token, 30 * 86400, isSecure);
      return json(res, { ok: true, player, token }, 201, { 'Set-Cookie': cookie });
    } catch (e) {
      if (e.code === 'NICK_TAKEN') return err(res, 'Nick sudah digunakan', 409, 'NICK_TAKEN');
      if (e.code === 'NICK_NOT_ALLOWED') return err(res, 'Nick tidak diizinkan', 422, 'NICK_NOT_ALLOWED');
      if (e.code === 'VALIDATION_ERROR') return err(res, e.message, 400, 'VALIDATION_ERROR');
      return err(res, e.message || 'REGISTRATION_FAILED', 400);
    }
  }

  // Auth: Login (Player)
  if ((pathname === '/api/auth/login' || pathname === '/api/player/login') && method === 'POST') {
    try {
      const body = await parseBody(req);
      const player = db.loginPlayer(body.nick, body.password);
      const token = auth.signToken({ type: 'player', id: player.id, nick: player.nick });
      const cookie = setCookieHeader('pp_player', token, 30 * 86400, isSecure);
      return json(res, { ok: true, player, token }, 200, { 'Set-Cookie': cookie });
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

  // Player: Avatar (PUT /api/avatar or POST /api/player/avatar)
  if (((pathname === '/api/avatar' && (method === 'PUT' || method === 'POST')) ||
       (pathname === '/api/player/avatar' && method === 'POST'))) {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const body = await parseBody(req);
      const avatar = db.updatePlayerAvatar(playerAuth.id, body.avatar || body);
      return json(res, { ok: true, avatar });
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
    return json(res, { ok: true, classes: db.getClasses() });
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

  if ((pathname === '/api/loadout' && (method === 'PUT' || method === 'POST'))) {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    try {
      const body = await parseBody(req);
      const loadout = db.updateLoadout(playerAuth.id, body.slots);
      return json(res, { ok: true, loadout });
    } catch (e) {
      return err(res, e.message, 400);
    }
  }

  if (pathname.startsWith('/api/skills/') && pathname.endsWith('/upgrade') && method === 'POST') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    const idemKey = req.headers['idempotency-key'];
    if (idemKey) {
      const cached = db.getIdempotency(playerAuth.id, idemKey);
      if (cached) return json(res, cached.response, cached.statusCode);
    }
    const parts = pathname.split('/');
    const skillId = parts[3];
    try {
      const resUp = db.upgradeSkill(playerAuth.id, skillId);
      if (idemKey) db.saveIdempotency(playerAuth.id, idemKey, pathname, 200, resUp);
      return json(res, resUp);
    } catch (e) {
      if (e.code === 'INSUFFICIENT_COINS') return err(res, 'Koin tidak cukup', 422, 'INSUFFICIENT_COINS');
      return err(res, e.message, 400);
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


  // GET /api/report/week
  if (pathname === '/api/report/week' && method === 'GET') {
    const playerAuth = getPlayerFromReq(req);
    if (!playerAuth) return err(res, 'Silakan login terlebih dahulu', 401, 'UNAUTHENTICATED');
    const offset = parseInt(query.offset || 0, 10);
    const weekKey = query.weekKey || query.week;
    try {
      const rep = db.getWeeklyReport(playerAuth.id, { offset, weekKey });
      return json(res, { ok: true, report: rep });
    } catch (e) {
      return err(res, e.message, 400);
    }
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
    return json(res, { ok: true, monsters });
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
    return json(res, { ok: true, ...db.getAdminOverview() });
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
    if (pathname === '/api/admin/subjects' && method === 'GET') {
      const cid = query.classId ? parseInt(query.classId, 10) : null;
      return json(res, { ok: true, subjects: db.adminGetSubjects(cid) });
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
    if (pathname === '/api/admin/questions' && method === 'DELETE') {
      const qid = parseInt(query.id, 10);
      if (!qid) return err(res, 'id diperlukan', 400);
      return json(res, db.adminDeleteQuestion(qid));
    }
    if (pathname === '/api/admin/questions/export' && method === 'GET') {
      const sid = parseInt(query.subjectId, 10);
      if (!sid) return err(res, 'subjectId diperlukan', 400);
      try {
        return json(res, db.adminExportQuestions(sid));
      } catch (e) {
        return err(res, e.message, 400);
      }
    }
    if (pathname === '/api/admin/questions/import' && method === 'POST') {
      const sid = parseInt(query.subjectId, 10);
      if (!sid) return err(res, 'subjectId diperlukan', 400);
      try {
        const body = await parseBody(req);
        const questions = Array.isArray(body) ? body : body.questions;
        return json(res, db.adminImportQuestions(sid, questions));
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
}, 60000);

server.listen(PORT, HOST, () => {
  console.log(`[petualangan-pelajar] Server running on http://${HOST}:${PORT}`);
});
