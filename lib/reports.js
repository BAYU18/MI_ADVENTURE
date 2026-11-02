'use strict';

const crypto = require('crypto');
const { REPORT } = require('../shared/gameplay');

function getWibDate(date = new Date()) {
  const utcMs = date.getTime();
  return new Date(utcMs + 7 * 3600 * 1000);
}

function getWeekBoundariesWib(refDate = new Date(), offsetWeeks = 0) {
  const wib = getWibDate(refDate);
  if (offsetWeeks !== 0) {
    wib.setUTCDate(wib.getUTCDate() + (offsetWeeks * 7));
  }
  const day = wib.getUTCDay();
  // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const diffToMonday = (day === 0 ? -6 : 1) - day;

  const y = wib.getUTCFullYear();
  const m = wib.getUTCMonth();
  const d = wib.getUTCDate() + diffToMonday;

  // Monday 00:00:00.000 WIB (-7h UTC)
  const mondayWib = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
  const weekStartUtc = new Date(mondayWib.getTime() - 7 * 3600 * 1000);

  // Sunday 23:59:59.999 WIB
  const sundayWib = new Date(Date.UTC(y, m, d + 6, 23, 59, 59, 999));
  const weekEndUtc = new Date(sundayWib.getTime() - 7 * 3600 * 1000);

  const yyyy = mondayWib.getUTCFullYear();
  const mm = String(mondayWib.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(mondayWib.getUTCDate()).padStart(2, '0');
  const weekStartStr = `${yyyy}-${mm}-${dd}`;

  return {
    weekStart: weekStartStr,
    startIso: weekStartUtc.toISOString(),
    endIso: weekEndUtc.toISOString()
  };
}

function generateWeeklyReport(db, playerId, options = {}) {
  const offset = typeof options.offset === 'number' ? options.offset : 0;
  const refDate = options.refDate ? new Date(options.refDate) : new Date();

  const curWeek = getWeekBoundariesWib(refDate, offset);
  const prevWeek = getWeekBoundariesWib(refDate, offset - 1);

  // 1. Player Info
  const player = db.prepare(`
    SELECT p.nick, c.name AS class_name
    FROM players p
    LEFT JOIN classes c ON c.id = p.class_id
    WHERE p.id = ?
  `).get(playerId);

  if (!player) throw new Error('PLAYER_NOT_FOUND');

  // 2. Query Sessions in Current Week
  const curSessions = db.prepare(`
    SELECT s.*, subj.name AS subject_name
    FROM game_sessions s
    LEFT JOIN subjects subj ON subj.id = s.subject_id
    WHERE s.player_id = ?
      AND s.started_at >= ?
      AND s.started_at <= ?
      AND s.status IN ('WON', 'LOST', 'ABANDONED', 'COMPLETED')
  `).all(playerId, curWeek.startIso, curWeek.endIso);

  const totalSessions = curSessions.length;
  const battles = curSessions.filter(s => (s.mode || 'BATTLE') !== 'PRACTICE').length;
  const practice = curSessions.filter(s => s.mode === 'PRACTICE').length;
  const bossDefeated = curSessions.filter(s => s.status === 'WON' && (s.mode || 'BATTLE') !== 'PRACTICE').length;
  const totalStars = curSessions.reduce((acc, s) => acc + (s.stars || 0), 0);
  const bestStreak = curSessions.reduce((max, s) => Math.max(max, s.max_streak || 0), 0);

  const maxMinCap = (REPORT && REPORT.maxActiveMinutesPerSession) || 30;
  let totalMinutes = 0;
  const activeDaysSet = new Set();

  for (const s of curSessions) {
    const startMs = new Date(s.started_at).getTime();
    const endMs = s.finished_at ? new Date(s.finished_at).getTime()
      : (s.last_activity_at ? new Date(s.last_activity_at).getTime() : startMs);
    const durMin = Math.max(0, Math.round((endMs - startMs) / 60000));
    totalMinutes += Math.min(maxMinCap, durMin);

    const wDate = getWibDate(new Date(s.started_at));
    activeDaysSet.add(wDate.toISOString().slice(0, 10));
  }
  const activeDays = activeDaysSet.size;

  // 3. Questions in Current Week
  const curQuestions = db.prepare(`
    SELECT sq.outcome, q.id AS question_id, q.text, q.explanation, q.topic_tag, q.subject_id, subj.name AS subject_name
    FROM session_questions sq
    JOIN game_sessions s ON s.id = sq.session_id
    JOIN questions q ON q.id = sq.question_id
    LEFT JOIN subjects subj ON subj.id = q.subject_id
    WHERE s.player_id = ?
      AND s.started_at >= ?
      AND s.started_at <= ?
      AND sq.answered_at IS NOT NULL
      AND sq.outcome NOT IN ('TIMEOUT_AWAY', 'VOID')
  `).all(playerId, curWeek.startIso, curWeek.endIso);

  const answered = curQuestions.length;
  const correct = curQuestions.filter(q => q.outcome === 'CORRECT').length;
  const accuracy = answered > 0 ? Number((correct / answered).toFixed(2)) : 0;

  // 4. Questions in Previous Week (for accuracyPrev & trend)
  const prevQuestions = db.prepare(`
    SELECT sq.outcome, q.subject_id
    FROM session_questions sq
    JOIN game_sessions s ON s.id = sq.session_id
    JOIN questions q ON q.id = sq.question_id
    WHERE s.player_id = ?
      AND s.started_at >= ?
      AND s.started_at <= ?
      AND sq.answered_at IS NOT NULL
      AND sq.outcome NOT IN ('TIMEOUT_AWAY', 'VOID')
  `).all(playerId, prevWeek.startIso, prevWeek.endIso);

  const prevAnswered = prevQuestions.length;
  const prevCorrect = prevQuestions.filter(q => q.outcome === 'CORRECT').length;
  const accuracyPrev = prevAnswered > 0 ? Number((prevCorrect / prevAnswered).toFixed(2)) : null;

  // 5. Per-Subject Breakdown
  const subjMap = new Map();
  for (const q of curQuestions) {
    const sId = q.subject_id;
    if (!subjMap.has(sId)) {
      subjMap.set(sId, { name: q.subject_name || 'Umum', answered: 0, correct: 0 });
    }
    const item = subjMap.get(sId);
    item.answered++;
    if (q.outcome === 'CORRECT') item.correct++;
  }

  const prevSubjMap = new Map();
  for (const q of prevQuestions) {
    const sId = q.subject_id;
    if (!prevSubjMap.has(sId)) {
      prevSubjMap.set(sId, { answered: 0, correct: 0 });
    }
    const item = prevSubjMap.get(sId);
    item.answered++;
    if (q.outcome === 'CORRECT') item.correct++;
  }

  const subjects = [];
  for (const [sId, item] of subjMap.entries()) {
    const acc = item.answered > 0 ? Number((item.correct / item.answered).toFixed(2)) : 0;
    const pSub = prevSubjMap.get(sId);
    let trend = 'stable';
    if (pSub && pSub.answered > 0) {
      const pAcc = Number((pSub.correct / pSub.answered).toFixed(2));
      const diff = acc - pAcc;
      if (diff >= 0.03) trend = 'up';
      else if (diff <= -0.03) trend = 'down';
    }
    subjects.push({
      name: item.name,
      answered: item.answered,
      accuracy: acc,
      trend
    });
  }
  subjects.sort((a, b) => b.answered - a.answered);

  let strongest = null;
  let weakest = null;
  if (subjects.length > 0) {
    const byAcc = [...subjects].sort((a, b) => b.accuracy - a.accuracy);
    strongest = byAcc[0].name;
    weakest = byAcc[byAcc.length - 1].name;
  }

  // 6. Topics Breakdown
  const topicMap = new Map();
  for (const q of curQuestions) {
    if (!q.topic_tag || !q.topic_tag.trim()) continue;
    const tName = q.topic_tag.trim().toLowerCase();
    if (!topicMap.has(tName)) {
      topicMap.set(tName, { answered: 0, correct: 0 });
    }
    const item = topicMap.get(tName);
    item.answered++;
    if (q.outcome === 'CORRECT') item.correct++;
  }

  const topics = [];
  const strengths = [];
  const needsWork = [];

  for (const [tName, item] of topicMap.entries()) {
    const acc = item.answered > 0 ? Number((item.correct / item.answered).toFixed(2)) : 0;
    const status = acc >= 0.75 ? 'mastered' : (acc < 0.60 ? 'needs_work' : 'practicing');
    topics.push({
      topic: tName,
      accuracy: acc,
      status
    });
    if (acc >= 0.75) strengths.push(tName);
    if (acc < 0.60) needsWork.push(tName);
  }

  // 7. Often Wrong Questions (up to 3)
  const wrongMap = new Map();
  for (const q of curQuestions) {
    if (q.outcome !== 'CORRECT') {
      const qId = q.question_id;
      if (!wrongMap.has(qId)) {
        wrongMap.set(qId, {
          question: q.text,
          correct: q.explanation || 'Pelajari materi lebih lanjut',
          explanation: q.explanation || '',
          wrongCount: 0
        });
      }
      wrongMap.get(qId).wrongCount++;
    }
  }

  const oftenWrong = Array.from(wrongMap.values())
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, 3);

  // 8. Spaced Repetition counts
  let reviewDue = 0;
  let masteredCount = 0;
  try {
    const dueRow = db.prepare(`
      SELECT COUNT(*) AS c
      FROM player_question_stats
      WHERE player_id = ? AND due_at <= datetime('now') AND mastered = 0
    `).get(playerId);
    reviewDue = dueRow ? dueRow.c : 0;

    const masRow = db.prepare(`
      SELECT COUNT(*) AS c
      FROM player_question_stats
      WHERE player_id = ? AND mastered = 1
    `).get(playerId);
    masteredCount = masRow ? masRow.c : 0;
  } catch (e) {
    // If table doesn't have rows
  }

  // 9. Contextual Tip
  let tip = 'Pertahankan prestasimu dan terus tantang dirimu di petualangan berikutnya!';
  if (needsWork.length > 0) {
    tip = `Latih ${needsWork[0]} 5 menit sehari.`;
  } else if (weakest) {
    tip = `Coba luangkan waktu untuk melatih ${weakest} secara berkala.`;
  }

  // 10. Achievements
  const achievements = ['Pemburu Monster'];

  return {
    weekStart: curWeek.weekStart,
    player: {
      nick: player.nick,
      className: player.class_name || 'Siswa'
    },
    totals: {
      sessions: totalSessions,
      battles,
      practice,
      minutes: totalMinutes,
      answered,
      correct,
      accuracy,
      accuracyPrev,
      bossDefeated,
      stars: totalStars,
      bestStreak,
      activeDays
    },
    subjects,
    strongest,
    weakest,
    topics,
    strengths,
    needsWork,
    oftenWrong,
    reviewDue,
    mastered: masteredCount,
    achievements,
    tip
  };
}

function saveWeeklyReport(db, playerId, weekKey, reportData) {
  const jsonStr = JSON.stringify(reportData);
  db.prepare(`
    INSERT INTO weekly_reports (player_id, week_key, report_json, created_at)
    VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    ON CONFLICT(player_id, week_key) DO UPDATE SET
      report_json = excluded.report_json,
      created_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
  `).run(playerId, weekKey, jsonStr);
}

function getWeeklyReport(db, playerId, options = {}) {
  const offset = typeof options.offset === 'number' ? options.offset : 0;
  const refDate = options.refDate ? new Date(options.refDate) : new Date();
  const weekInfo = getWeekBoundariesWib(refDate, offset);
  const weekKey = options.weekKey || weekInfo.weekStart;

  // Check if archived in weekly_reports
  const row = db.prepare(`
    SELECT report_json FROM weekly_reports
    WHERE player_id = ? AND week_key = ?
  `).get(playerId, weekKey);

  if (row && row.report_json) {
    try {
      return JSON.parse(row.report_json);
    } catch (e) {
      // Fall through to re-generate if invalid JSON
    }
  }

  // Not archived: generate on-the-fly
  const report = generateWeeklyReport(db, playerId, { offset, refDate });
  if (options.save) {
    saveWeeklyReport(db, playerId, weekKey, report);
  }
  return report;
}

function createReportShare(db, playerId) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const days = (REPORT && REPORT.shareTtlDays) || 7;
  const expiresAt = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();

  db.prepare('DELETE FROM report_shares WHERE player_id = ?').run(playerId);
  db.prepare(`
    INSERT INTO report_shares (player_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  `).run(playerId, tokenHash, expiresAt);

  return {
    token,
    url: `/r/${token}`,
    expiresAt
  };
}

function revokeReportShare(db, playerId) {
  db.prepare('DELETE FROM report_shares WHERE player_id = ?').run(playerId);
  return { ok: true };
}

function getReportByShareToken(db, token) {
  if (!token || typeof token !== 'string') return null;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const row = db.prepare('SELECT * FROM report_shares WHERE token_hash = ?').get(tokenHash);
  if (!row) return null;

  const expMs = new Date(row.expires_at).getTime();
  if (Date.now() > expMs) {
    return { expired: true };
  }

  const report = getWeeklyReport(db, row.player_id, { offset: 0 });
  return {
    ok: true,
    playerId: row.player_id,
    report,
    expiresAt: row.expires_at
  };
}

function generateAllWeeklyReports(db, refDate = new Date()) {
  // Generate reports for the previous week (completed week)
  const prevWeek = getWeekBoundariesWib(refDate, -1);
  const players = db.prepare(`
    SELECT DISTINCT player_id
    FROM game_sessions
    WHERE started_at >= ? AND started_at <= ?
      AND status IN ('WON', 'LOST', 'ABANDONED', 'COMPLETED')
  `).all(prevWeek.startIso, prevWeek.endIso);

  let count = 0;
  for (const p of players) {
    try {
      const rep = generateWeeklyReport(db, p.player_id, { offset: -1, refDate });
      saveWeeklyReport(db, p.player_id, prevWeek.weekStart, rep);
      count++;
    } catch (e) {
      console.error(`Gagal membuat laporan untuk player ${p.player_id}:`, e.message);
    }
  }
  return { count, weekStart: prevWeek.weekStart };
}

function getClassWeeklyReports(db, classId, weekKey) {
  const weekInfo = getWeekBoundariesWib();
  const targetWeek = weekKey || weekInfo.weekStart;

  const players = db.prepare(`
    SELECT p.id, p.nick
    FROM players p
    WHERE p.class_id = ?
    ORDER BY p.nick ASC
  `).all(classId);

  return players.map(p => {
    const rep = getWeeklyReport(db, p.id, { weekKey: targetWeek });
    return {
      playerId: p.id,
      nick: p.nick,
      sessions: rep.totals.sessions,
      minutes: rep.totals.minutes,
      accuracy: rep.totals.accuracy,
      trend: rep.subjects[0]?.trend || 'stable',
      weakestSubject: rep.weakest || '-'
    };
  });
}

function exportClassReportsCsv(db, classId, weekKey) {
  const reports = getClassWeeklyReports(db, classId, weekKey);
  const headers = ['"ID"', '"Nick"', '"Sesi"', '"Menit Aktif"', '"Akurasi"', '"Tren"', '"Mata Pelajaran Terlemah"'];
  const rows = reports.map(r => [
    r.playerId,
    `"${(r.nick || '').replace(/"/g, '""')}"`,
    r.sessions,
    r.minutes,
    `"${Math.round(r.accuracy * 100)}%"`,
    `"${r.trend}"`,
    `"${(r.weakestSubject || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

module.exports = {
  getWibDate,
  getWeekBoundariesWib,
  generateWeeklyReport,
  saveWeeklyReport,
  getWeeklyReport,
  createReportShare,
  revokeReportShare,
  getReportByShareToken,
  generateAllWeeklyReports,
  getClassWeeklyReports,
  exportClassReportsCsv
};
