// shared/friendship.js — state-less helper untuk pertemanan & presence.
'use strict';

const PRESENCE_TTL_MS = 75_000; // online bila last_seen_at <= 75 dtk
const ACTIVITY_RANK = ['duel', 'battle', 'petualangan', 'idle'];

function isOnline(lastSeenAt, now = Date.now()) {
  if (!lastSeenAt) return false;
  const t = new Date(lastSeenAt).getTime();
  return Number.isFinite(t) && (now - t) <= PRESENCE_TTL_MS;
}

// Aktivitas dari sesi game aktif + duel aktif.
// gameSession = { mode, campaign_node, status } (null bila tidak ada) — dari tabel game_sessions.
// duelActive = boolean (baris duels status='ACTIVE'), prioritas tertinggi.
function computeActivity(gameSession, duelActive = false) {
  if (duelActive) return 'duel';
  if (!gameSession || gameSession.status !== 'IN_PROGRESS') return 'idle';
  if ((gameSession.mode || '').toUpperCase() === 'FUN' || gameSession.campaign_node) return 'petualangan';
  const m = (gameSession.mode || '').toUpperCase();
  return ['BATTLE', 'PRACTICE', 'FREE'].includes(m) ? 'battle' : 'idle';
}

function activityLabel(a) {
  return { duel: '🟢 Duel', battle: '⚔️ Battle', petualangan: '🗺️ Petualangan', idle: '💤 Idle' }[a] || '⚫ Offline';
}

function statusLabel(online, activity) {
  return online ? activityLabel(activity || 'idle') : '⚫ Offline';
}

function normalizeNick(nick) {
  return String(nick || '').trim().toLowerCase().slice(0, 24);
}

function validateSearchQuery(q) {
  const s = String(q || '').trim();
  if (s.length < 2) return null;
  return s.slice(0, 24);
}

module.exports = {
  PRESENCE_TTL_MS,
  ACTIVITY_RANK,
  isOnline,
  computeActivity,
  activityLabel,
  statusLabel,
  normalizeNick,
  validateSearchQuery,
};
