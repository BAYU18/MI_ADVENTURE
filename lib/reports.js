'use strict';

const crypto = require('crypto');
const { REPORT } = require('../shared/gameplay');
const Progression = require('../shared/progression');

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


function getIsoWeek(date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNum = 1 + Math.ceil((firstThursday - target) / 604800000);
  const year = new Date(firstThursday).getFullYear();
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

function parseIsoWeek(weekStr) {
  const m = /^(\d{4})-W(\d{2})$/.exec(weekStr);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const week = parseInt(m[2], 10);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = (jan4.getUTCDay() + 6) % 7;
  const monWeek1 = new Date(jan4.getTime() - day * 86400000);
  const targetMon = new Date(monWeek1.getTime() + (week - 1) * 7 * 86400000);
  return targetMon;
}

function compileWeeklyReport(db, playerId, options = {}) {
  let refDate = options.refDate ? new Date(options.refDate) : new Date();
  let offset = typeof options.offset === 'number' ? options.offset : 0;

  const weekParam = options.week || options.weekKey;
  if (weekParam) {
    if (/^\d{4}-W\d{2}$/.test(weekParam)) {
      const mon = parseIsoWeek(weekParam);
      if (mon) {
        refDate = new Date(mon.getTime() + 7 * 3600 * 1000);
        offset = 0;
      }
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(weekParam)) {
      refDate = new Date(weekParam + 'T12:00:00+07:00');
      offset = 0;
    }
  }

  const curWeek = getWeekBoundariesWib(refDate, offset);
  const prevWeek = getWeekBoundariesWib(refDate, offset - 1);

  const mondayWibStr = curWeek.weekStart;
  const mondayDate = new Date(mondayWibStr + 'T12:00:00Z');
  const sundayWibStr = new Date(new Date(mondayWibStr + 'T00:00:00Z').getTime() + 6 * 86400000).toISOString().slice(0, 10);
  const isoWeekStr = getIsoWeek(mondayDate);

  const isPartial = new Date(curWeek.endIso).getTime() > Date.now();

  // 1. Player Info
  const player = db.prepare(`
    SELECT p.id, p.nick, c.name AS class_name
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
  const totalStars = curSessions.reduce((acc, s) => acc + (s.stars || 0), 0);
  const bestStreak = curSessions.reduce((max, s) => Math.max(max, s.max_streak || 0), 0);
  const totalCoins = curSessions.reduce((sum, s) => sum + (s.coins_earned || 0), 0);
  const totalXp = curSessions.reduce((sum, s) => sum + (s.xp_earned || 0), 0);

  const bossByTier = { common: 0, rare: 0, epic: 0, legend: 0 };
  let brutalDefeated = 0;
  for (const s of curSessions) {
    if (s.status === 'WON' && (s.mode || 'BATTLE') !== 'PRACTICE') {
      const tier = (s.boss_tier || 'common').toLowerCase();
      if (bossByTier[tier] !== undefined) bossByTier[tier]++;
      else bossByTier.common++;
      if (s.brutal) brutalDefeated++;
    }
  }
  const bossDefeated = bossByTier.common + bossByTier.rare + bossByTier.epic + bossByTier.legend;

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
    SELECT sq.outcome, sq.answered_at, q.id AS question_id, q.text, q.explanation, q.topic_tag, q.subject_id, subj.name AS subject_name
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
  const correct = curQuestions.filter(q => q.outcome === 'CORRECT' || q.outcome === 'CRITICAL').length;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  // 4. Questions in Previous Week
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
  const prevCorrect = prevQuestions.filter(q => q.outcome === 'CORRECT' || q.outcome === 'CRITICAL').length;
  const prev = prevAnswered > 0 ? {
    answered: prevAnswered,
    accuracy: Math.round((prevCorrect / prevAnswered) * 100)
  } : null;

  // 5. Daily breakdown (7 items, Mon-Sun)
  const daily = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(new Date(mondayWibStr + 'T00:00:00Z').getTime() + i * 86400000);
    const dayStr = dayDate.toISOString().slice(0, 10);
    const dayQuestions = curQuestions.filter(q => {
      const wib = getWibDate(new Date(q.answered_at));
      return wib.toISOString().slice(0, 10) === dayStr;
    });
    const dAnswered = dayQuestions.length;
    const dCorrect = dayQuestions.filter(q => q.outcome === 'CORRECT' || q.outcome === 'CRITICAL').length;
    daily.push({ date: dayStr, answered: dAnswered, correct: dCorrect });
  }

  // 6. Abilities
  const abilitiesRes = computeSubjectAbilities(db, playerId);
  const abilities = (abilitiesRes && abilitiesRes.abilities) ? abilitiesRes.abilities : [];

  // 7. Weak & Mastered Topics (only >= 3 attempts)
  const topicMap = new Map();
  for (const q of curQuestions) {
    if (!q.topic_tag || !q.topic_tag.trim()) continue;
    const key = `${q.subject_id}::${q.topic_tag.trim()}`;
    if (!topicMap.has(key)) {
      topicMap.set(key, {
        subjectId: q.subject_id,
        subject: q.subject_name || 'Umum',
        topic: q.topic_tag.trim(),
        attempts: 0,
        correct: 0
      });
    }
    const item = topicMap.get(key);
    item.attempts++;
    if (q.outcome === 'CORRECT' || q.outcome === 'CRITICAL') item.correct++;
  }

  const weakTopics = [];
  const masteredTopics = [];
  for (const item of topicMap.values()) {
    if (item.attempts < 3) continue;
    const acc = Math.round((item.correct / item.attempts) * 100);
    if (acc < 60) {
      weakTopics.push({
        subjectId: item.subjectId,
        subject: item.subject,
        topic: item.topic,
        accuracy: acc,
        attempts: item.attempts
      });
    }
    if (acc >= 75) {
      masteredTopics.push({
        subjectId: item.subjectId,
        subject: item.subject,
        topic: item.topic,
        count: item.attempts
      });
    }
  }
  weakTopics.sort((a, b) => a.accuracy - b.accuracy);
  masteredTopics.sort((a, b) => b.count - a.count);
  const finalWeakTopics = weakTopics.slice(0, 5);
  const finalMasteredTopics = masteredTopics.slice(0, 5);

  // 8. Praise (max 3)
  const praise = [];
  if (activeDays >= 5) {
    praise.push(`Hebat! Kamu belajar ${activeDays} dari 7 hari.`);
  }
  if (accuracy >= 80 && answered >= 5) {
    praise.push(`Akurasi ${accuracy}% — luar biasa!`);
  }
  if (prev && (accuracy - prev.accuracy) >= 5) {
    praise.push(`Naik ${accuracy - prev.accuracy} poin dari pekan lalu!`);
  }
  if (bossDefeated >= 1) {
    let highestTier = null;
    if (bossByTier.legend > 0) highestTier = 'Legend';
    else if (bossByTier.epic > 0) highestTier = 'Epic';
    else if (bossByTier.rare > 0) highestTier = 'Rare';
    if (highestTier) {
      praise.push(`Kamu mengalahkan ${bossDefeated} boss, termasuk ${highestTier}!`);
    } else {
      praise.push(`Kamu mengalahkan ${bossDefeated} boss!`);
    }
  }
  if (praise.length === 0) {
    praise.push('Setiap soal yang kamu coba membuatmu makin pintar.');
  }
  const finalPraise = praise.slice(0, 3);

  // 9. Advice (max 3)
  const advice = [];
  const lowestMeasured = abilities.find(a => a.status === 'MEASURED');
  if (lowestMeasured) {
    advice.push(`Coba latihan ${lowestMeasured.name} hari ini — 1 sesi saja sudah membantu.`);
  }
  if (finalWeakTopics.length > 0) {
    advice.push(`Topik ${finalWeakTopics[0].topic} masih sering keliru; ulangi pelan-pelan ya.`);
  }
  if (activeDays <= 2 && answered > 0) {
    advice.push('Coba belajar 15 menit setiap hari.');
  }
  if (answered === 0) {
    advice.push('Ayo mulai petualangan belajarmu minggu ini!');
  }
  const finalAdvice = advice.slice(0, 3);

  // Legacy per-subject breakdown & oftenWrong for backward compat with v1 tests
  const legacySubjMap = new Map();
  for (const q of curQuestions) {
    const sId = q.subject_id;
    if (!legacySubjMap.has(sId)) {
      legacySubjMap.set(sId, { name: q.subject_name || 'Umum', answered: 0, correct: 0 });
    }
    const it = legacySubjMap.get(sId);
    it.answered++;
    if (q.outcome === 'CORRECT' || q.outcome === 'CRITICAL') it.correct++;
  }
  const legacySubjects = [];
  for (const [sId, item] of legacySubjMap.entries()) {
    legacySubjects.push({
      name: item.name,
      answered: item.answered,
      accuracy: item.answered > 0 ? Number((item.correct / item.answered).toFixed(2)) : 0,
      trend: 'stable'
    });
  }
  legacySubjects.sort((a, b) => b.answered - a.answered);

  const legacyTopics = [];
  const strengths = [];
  const needsWork = [];
  for (const item of topicMap.values()) {
    const acc = item.attempts > 0 ? Number((item.correct / item.attempts).toFixed(2)) : 0;
    const st = acc >= 0.75 ? 'mastered' : (acc < 0.60 ? 'needs_work' : 'practicing');
    legacyTopics.push({ topic: item.topic, accuracy: acc, status: st });
    if (acc >= 0.75) strengths.push(item.topic);
    if (acc < 0.60) needsWork.push(item.topic);
  }

  const wrongMap = new Map();
  for (const q of curQuestions) {
    if (q.outcome !== 'CORRECT' && q.outcome !== 'CRITICAL') {
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
  const oftenWrong = Array.from(wrongMap.values()).sort((a, b) => b.wrongCount - a.wrongCount).slice(0, 3);

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
  } catch (e) {}

  return {
    v: 2,
    week: isoWeekStr,
    from: mondayWibStr,
    to: sundayWibStr,
    partial: isPartial,
    summary: {
      answered,
      correct,
      accuracy,
      minutes: totalMinutes,
      sessions: totalSessions,
      activeDays,
      bossDefeated,
      brutalDefeated,
      bossByTier,
      coins: totalCoins,
      xp: totalXp
    },
    prev,
    daily,
    abilities,
    weakTopics: finalWeakTopics,
    masteredTopics: finalMasteredTopics,
    praise: finalPraise,
    advice: finalAdvice,

    // Legacy fields for backward compat
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
      accuracy: answered > 0 ? Number((correct / answered).toFixed(2)) : 0,
      accuracyPrev: prev ? Number((prev.accuracy / 100).toFixed(2)) : null,
      bossDefeated,
      brutalDefeated,
      stars: totalStars,
      bestStreak,
      activeDays
    },
    subjects: legacySubjects,
    strongest: legacySubjects[0]?.name || null,
    weakest: legacySubjects[legacySubjects.length - 1]?.name || null,
    topics: legacyTopics,
    strengths,
    needsWork,
    oftenWrong,
    reviewDue,
    mastered: masteredCount,
    achievements: ['Pemburu Monster'],
    tip: finalAdvice[0] || 'Pertahankan prestasimu dan terus tantang dirimu di petualangan berikutnya!'
  };
}

function generateWeeklyReport(db, playerId, options = {}) {
  return compileWeeklyReport(db, playerId, options);
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
  const weekKey = options.week || options.weekKey || weekInfo.weekStart;

  // Cek apakah ada di weekly_reports
  const row = db.prepare(`
    SELECT report_json FROM weekly_reports
    WHERE player_id = ? AND (week_key = ? OR week_key = ?)
  `).get(playerId, weekKey, weekInfo.weekStart);

  if (row && row.report_json) {
    try {
      const parsed = JSON.parse(row.report_json);
      if (parsed && parsed.v >= 2) {
        return parsed;
      }
      // Bila v1 atau belum v2: re-compile lalu upsert
    } catch (e) {}
  }

  // Not archived or old v1 format: compile
  const report = compileWeeklyReport(db, playerId, options);
  if (!report.partial || options.save) {
    saveWeeklyReport(db, playerId, report.week, report);
    if (report.week !== curWeekStart(refDate, offset)) {
      saveWeeklyReport(db, playerId, curWeekStart(refDate, offset), report);
    }
  }
  return report;
}

function curWeekStart(refDate, offset) {
  return getWeekBoundariesWib(refDate, offset).weekStart;
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


function computeSubjectAbilities(db, playerId) {
  const player = db.prepare('SELECT id, class_id FROM players WHERE id = ?').get(playerId);
  if (!player) return { ok: false, error: 'PLAYER_NOT_FOUND', abilities: [], lowestSubjectId: null };

  const classId = player.class_id;
  let subjects = [];
  if (classId) {
    subjects = db.prepare('SELECT id, name, icon, color FROM subjects WHERE class_id = ? AND is_active = 1 ORDER BY id').all(classId);
  }
  if (!subjects || subjects.length === 0) {
    subjects = db.prepare('SELECT id, name, icon, color FROM subjects WHERE is_active = 1 ORDER BY id').all();
  }

  const results = [];

  for (const s of subjects) {
    // 1. Total active questions in subject
    const qCountRow = db.prepare('SELECT count(*) as count FROM questions WHERE subject_id = ? AND is_active = 1').get(s.id);
    const totalActive = qCountRow ? qCountRow.count : 0;

    // 2. Stats (Leitner box & difficulty)
    const stats = db.prepare(`
      SELECT pqs.box, q.difficulty 
      FROM player_question_stats pqs 
      JOIN questions q ON q.id = pqs.question_id 
      WHERE pqs.player_id = ? AND q.subject_id = ?
    `).all(playerId, s.id);

    // 3. Recent up to 40 answers from session_questions
    const recentRows = db.prepare(`
      SELECT sq.outcome, q.difficulty 
      FROM session_questions sq 
      JOIN questions q ON q.id = sq.question_id 
      JOIN game_sessions gs ON gs.id = sq.session_id 
      WHERE gs.player_id = ? AND q.subject_id = ? AND sq.answered_at IS NOT NULL 
      ORDER BY sq.answered_at DESC 
      LIMIT 40
    `).all(playerId, s.id);

    const recent = recentRows.reverse().map(r => ({
      correct: (r.outcome === 'CORRECT' || r.outcome === 'CRITICAL'),
      difficulty: r.difficulty || 1
    }));

    // 4. Attempts
    const attemptsRow = db.prepare(`
      SELECT count(*) as count 
      FROM session_questions sq 
      JOIN questions q ON q.id = sq.question_id 
      JOIN game_sessions gs ON gs.id = sq.session_id 
      WHERE gs.player_id = ? AND q.subject_id = ? AND sq.answered_at IS NOT NULL
    `).get(playerId, s.id);

    let attempts = attemptsRow ? attemptsRow.count : 0;
    if (attempts === 0 && stats.length > 0) {
      const seenRow = db.prepare(`
        SELECT sum(pqs.seen) as total_seen 
        FROM player_question_stats pqs 
        JOIN questions q ON q.id = pqs.question_id 
        WHERE pqs.player_id = ? AND q.subject_id = ?
      `).get(playerId, s.id);
      if (seenRow && seenRow.total_seen) attempts = seenRow.total_seen;
    }

    const scoreObj = Progression.abilityScore({
      attempts,
      stats,
      recent,
      totalActive
    });

    results.push({
      subjectId: s.id,
      name: s.name,
      icon: s.icon,
      totalQuestions: totalActive,
      answeredDistinct: stats.length,
      ...scoreObj
    });
  }

  const sorted = Progression.sortAbilities(results);
  const lowestMeasured = sorted.find(a => a.status === 'MEASURED');
  const lowestSubjectId = lowestMeasured ? lowestMeasured.subjectId : null;

  return {
    ok: true,
    lowestSubjectId,
    abilities: sorted
  };
}

module.exports = {
  getWibDate,
  getWeekBoundariesWib,
  generateWeeklyReport,
  compileWeeklyReport,
  getIsoWeek,
  parseIsoWeek,
  saveWeeklyReport,
  getWeeklyReport,
  createReportShare,
  revokeReportShare,
  getReportByShareToken,
  generateAllWeeklyReports,
  getClassWeeklyReports,
  exportClassReportsCsv,
  computeSubjectAbilities
};
