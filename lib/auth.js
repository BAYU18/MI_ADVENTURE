'use strict';
const crypto = require('node:crypto');
const { getDb } = require('./db');

const revokedTokens = new Set();

function getSecret() {
  const db = getDb();
  let row = db.prepare("SELECT value FROM settings WHERE key='auth_secret'").get();
  if (!row) {
    const s = crypto.randomBytes(32).toString('hex');
    db.prepare("INSERT INTO settings(key, value) VALUES('auth_secret', ?)").run(s);
    return s;
  }
  return row.value;
}

function base64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function signToken(payload) {
  const secret = getSecret();
  const header = { alg: 'HS256', typ: 'JWT' };
  const h = base64url(JSON.stringify(header));
  const p = base64url(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 86400),
  }));
  const toSign = `${h}.${p}`;
  const sig = crypto.createHmac('sha256', secret).update(toSign).digest('base64url');
  return `${toSign}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  if (revokedTokens.has(token)) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, sig] = parts;
  const secret = getSecret();
  const expectedSig = crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function revokeToken(token) {
  if (token) revokedTokens.add(token);
}

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  const parts = cookieHeader.split(';');
  for (const p of parts) {
    const [k, ...rest] = p.trim().split('=');
    if (k) out[k] = decodeURIComponent(rest.join('='));
  }
  return out;
}

function extractPlayerToken(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.pp_player || cookies.player_token || req.headers['x-player-token'];
  if (token) return token;
  const authH = req.headers.authorization;
  if (authH && authH.startsWith('Bearer ')) return authH.slice(7);
  return null;
}

function extractAdminToken(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.pp_admin || cookies.admin_token;
  if (token) return token;
  const authH = req.headers.authorization;
  if (authH && authH.startsWith('Bearer ')) return authH.slice(7);
  return null;
}

module.exports = {
  signToken,
  verifyToken,
  revokeToken,
  parseCookies,
  extractPlayerToken,
  extractAdminToken,
};
