(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GradingEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function parseNumberId(raw) {
    if (typeof raw === 'number') {
      return Number.isFinite(raw) ? raw : null;
    }
    if (typeof raw !== 'string') return null;
    let s = raw.trim().replace(/\s+/g, '');
    if (!s) return null;

    // Both dots and commas present
    if (s.includes('.') && s.includes(',')) {
      // E.g. 1.250,50 -> remove dot, comma to dot
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
        s = s.replace(/\./g, '').replace(',', '.');
      } else {
        // E.g. 1,250.50 -> remove comma
        s = s.replace(/,/g, '');
      }
    } else if (s.includes(',')) {
      // Only comma -> decimal separator
      s = s.replace(',', '.');
    } else if (s.includes('.')) {
      // E.g. 1.000 or 1.000.000 (thousands separators)
      if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
        s = s.replace(/\./g, '');
      }
    }

    const val = parseFloat(s);
    return Number.isFinite(val) ? val : null;
  }

  function normalizeText(raw) {
    if (raw == null) return '';
    return String(raw)
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function gradeShort(userAns, typeData = {}) {
    if (typeData && typeData.numeric) {
      const val = typeData.numeric.value;
      const tol = typeof typeData.numeric.tolerance === 'number' ? typeData.numeric.tolerance : 0.0001;
      const userNum = parseNumberId(userAns);
      const ok = userNum !== null && (
        Math.abs(userNum - val) <= tol ||
        (parseNumberId(val) !== null && Math.abs(userNum - parseNumberId(val)) <= tol)
      );
      if (ok) {
        return {
          correct: true,
          score: 1.0,
          userValue: userNum,
          reveal: String(val)
        };
      }
    }

    const accepted = Array.isArray(typeData.accepted)
      ? typeData.accepted
      : (typeData.accept ? (Array.isArray(typeData.accept) ? typeData.accept : [typeData.accept]) : (typeData.accepted != null ? [typeData.accepted] : []));

    const isNumeric = Boolean(typeData.isNumeric);
    const tolerance = typeof typeData.tolerance === 'number' ? typeData.tolerance : 0.0001;

    if (isNumeric) {
      const userNum = parseNumberId(userAns);
      if (userNum === null) {
        return {
          correct: false,
          score: 0,
          userValue: userAns,
          reveal: accepted[0] != null ? String(accepted[0]) : ''
        };
      }
      for (const target of accepted) {
        const targetNum = parseNumberId(target);
        if (targetNum !== null && Math.abs(userNum - targetNum) <= tolerance) {
          return {
            correct: true,
            score: 1.0,
            userValue: userNum,
            reveal: String(target)
          };
        }
      }
      return {
        correct: false,
        score: 0,
        userValue: userNum,
        reveal: accepted[0] != null ? String(accepted[0]) : ''
      };
    }

    const userNorm = normalizeText(userAns);
    for (const target of accepted) {
      if (normalizeText(target) === userNorm) {
        return {
          correct: true,
          score: 1.0,
          userValue: userNorm,
          reveal: String(target)
        };
      }
    }

    return {
      correct: false,
      score: 0,
      userValue: userNorm,
      reveal: accepted[0] != null ? String(accepted[0]) : ''
    };
  }

  function gradeOrdering(arg1, arg2 = {}) {
    if (Array.isArray(arg1) && Array.isArray(arg2)) {
      const displayOrder = arg1;
      const order = arg2;
      if (order.length !== displayOrder.length || new Set(order).size !== order.length) {
        return { correct: false, matches: 0, total: displayOrder.length, reveal: Array.from({length: displayOrder.length}, (_, i) => displayOrder.indexOf(i)) };
      }
      const ok = order.every((d, i) => displayOrder[d] === i);
      return {
        correct: ok,
        matches: ok ? displayOrder.length : 0,
        total: displayOrder.length,
        reveal: Array.from({length: displayOrder.length}, (_, i) => displayOrder.indexOf(i))
      };
    }

    const userOrder = Array.isArray(arg1) ? arg1 : [];
    const typeData = arg2 || {};
    const correctOrder = Array.isArray(typeData.correctOrder) ? typeData.correctOrder : [];
    if (!Array.isArray(userOrder) || userOrder.length !== correctOrder.length) {
      return {
        correct: false,
        matches: 0,
        total: correctOrder.length,
        reveal: correctOrder
      };
    }

    let matches = 0;
    for (let i = 0; i < correctOrder.length; i++) {
      if (String(userOrder[i]) === String(correctOrder[i])) {
        matches++;
      }
    }

    const isCorrect = matches === correctOrder.length;
    return {
      correct: isCorrect,
      matches,
      total: correctOrder.length,
      reveal: correctOrder
    };
  }

  function gradeMatching(arg1, arg2 = {}) {
    if (Array.isArray(arg1) && Array.isArray(arg2)) {
      const rightOrder = arg1;
      const pairs = arg2;
      const total = rightOrder.length;
      if (pairs.length !== total || new Set(pairs).size !== total) {
        return { correct: false, matchedCount: 0, total, reveal: Array.from({length: total}, (_, i) => rightOrder.indexOf(i)) };
      }
      const ok = pairs.every((d, i) => rightOrder[d] === i);
      return {
        correct: ok,
        matchedCount: ok ? total : 0,
        total,
        reveal: Array.from({length: total}, (_, i) => rightOrder.indexOf(i))
      };
    }

    const userPairs = arg1;
    const typeData = arg2 || {};
    let expectedMap = {};
    if (Array.isArray(typeData.pairs)) {
      for (const item of typeData.pairs) {
        expectedMap[String(item.left)] = String(item.right);
      }
    } else if (typeData.pairs && typeof typeData.pairs === 'object') {
      for (const [k, v] of Object.entries(typeData.pairs)) {
        expectedMap[String(k)] = String(v);
      }
    }

    const total = Object.keys(expectedMap).length;
    let matchedCount = 0;

    let userMap = {};
    if (Array.isArray(userPairs)) {
      for (const p of userPairs) {
        if (p && p.left !== undefined) {
          userMap[String(p.left)] = String(p.right);
        } else if (Array.isArray(p) && p.length >= 2) {
          userMap[String(p[0])] = String(p[1]);
        }
      }
    } else if (userPairs && typeof userPairs === 'object') {
      for (const [k, v] of Object.entries(userPairs)) {
        userMap[String(k)] = String(v);
      }
    }

    for (const [leftKey, expectedRight] of Object.entries(expectedMap)) {
      if (userMap[leftKey] !== undefined && String(userMap[leftKey]) === expectedRight) {
        matchedCount++;
      }
    }

    const isCorrect = total > 0 && matchedCount === total;
    return {
      correct: isCorrect,
      matchedCount,
      total,
      reveal: expectedMap
    };
  }

  function afterAnswer(stat = {}, isCorrect, now = new Date()) {
    const boxes = [1, 3, 7, 14];
    const curBox = typeof stat.box === 'number' ? stat.box : 0;
    const lapses = typeof stat.lapses === 'number' ? stat.lapses : 0;
    const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();

    if (isCorrect) {
      const nextBox = curBox + 1;
      const isMastered = nextBox > boxes.length;
      const intervalDays = boxes[Math.min(Math.max(0, nextBox - 1), boxes.length - 1)];
      const dueAt = new Date(nowMs + intervalDays * 86400000).toISOString();

      return {
        box: nextBox,
        lapses,
        due_at: dueAt,
        mastered: isMastered ? 1 : 0
      };
    } else {
      const dueAt = new Date(nowMs + 1 * 86400000).toISOString(); // 1 day reset
      return {
        box: 0,
        lapses: lapses + 1,
        due_at: dueAt,
        mastered: 0
      };
    }
  }

  function updatePace(currentPace, sessionStats = {}) {
    let pace = typeof currentPace === 'number' ? currentPace : 1.0;
    const { timeouts = 0, medianRatio = 0.5, accuracy = 0.75, totalAnswered = 0 } = sessionStats;

    if (totalAnswered < 5) {
      return Number(pace.toFixed(2));
    }

    if (timeouts >= 2 || (medianRatio > 0.8 && accuracy >= 0.70)) {
      pace += 0.10;
    } else if (medianRatio < 0.35 && accuracy >= 0.85) {
      pace -= 0.05;
    }

    // Clamp between 0.8 and 1.5
    pace = Math.max(0.8, Math.min(1.5, pace));
    return Number(pace.toFixed(2));
  }

  function bossDamage({
    tier = 1,
    combo = 0,
    power = 1.0,
    armor = 0,
    risk = 0,
    weak = false,
    maxHp = 100
  }) {
    const comboMult = 1.0 + Math.min(0.5, Math.max(0, combo) * 0.1);
    const weakMult = weak ? 2.0 : 1.0;
    const armorFactor = Math.max(0.5, 1.0 - Math.max(0, armor) * 0.05);

    const baseVal = 20 * Math.max(1, tier);
    const rawDamage = Math.round(baseVal * comboMult * Math.max(0.5, power) * weakMult * armorFactor);

    const cap35Pct = Math.floor(maxHp * 0.35);
    const cappedDamage = Math.min(rawDamage, cap35Pct);
    const finalDamage = Math.max(1, cappedDamage);

    return {
      damage: finalDamage,
      isCapHit: rawDamage > cap35Pct,
      isWeak: Boolean(weak)
    };
  }

  function validateQuestionData(type, typeData) {
    if (!type || typeof type !== 'string') {
      return { valid: false, error: 'Tipe soal wajib diisi.' };
    }
    const t = type.toUpperCase();

    if (t === 'MCQ') {
      // standard options array
      if (!typeData || !Array.isArray(typeData.options) || typeData.options.length < 2) {
        return { valid: false, error: 'MCQ memerlukan minimal 2 pilihan opsi.' };
      }
      return { valid: true };
    }

    if (t === 'TRUE_FALSE') {
      if (!typeData || typeof typeData.correctAnswer !== 'boolean') {
        return { valid: false, error: 'TRUE_FALSE memerlukan correctAnswer bertipe boolean.' };
      }
      return { valid: true };
    }

    if (t === 'ORDERING') {
      if (!typeData || !Array.isArray(typeData.items) || typeData.items.length < 2) {
        return { valid: false, error: 'ORDERING memerlukan minimal 2 item untuk diurutkan.' };
      }
      if (!Array.isArray(typeData.correctOrder) || typeData.correctOrder.length !== typeData.items.length) {
        return { valid: false, error: 'ORDERING memerlukan correctOrder dengan jumlah sama dengan items.' };
      }
      return { valid: true };
    }

    if (t === 'MATCHING') {
      if (!typeData || !Array.isArray(typeData.pairs) || typeData.pairs.length < 2) {
        return { valid: false, error: 'MATCHING memerlukan minimal 2 pasang data (pairs).' };
      }
      for (const p of typeData.pairs) {
        if (!p || p.left === undefined || p.right === undefined) {
          return { valid: false, error: 'Setiap pasangan MATCHING wajib memiliki properti left dan right.' };
        }
      }
      return { valid: true };
    }

    if (t === 'SHORT') {
      if (!typeData || (!Array.isArray(typeData.accepted) && typeData.accepted == null)) {
        return { valid: false, error: 'SHORT memerlukan properti accepted jawaban.' };
      }
      return { valid: true };
    }

    return { valid: false, error: `Tipe soal '${type}' tidak dikenal.` };
  }

  return {
    parseNumberId,
    parseNumber: parseNumberId,
    readBonusSec: (totalChars) => Math.min(20, Math.ceil(Math.max(0, (totalChars || 0) - 160) / 25)),
    timeLimitSec: (base, readBonus, pace) => Math.round((base + (readBonus || 0)) * (pace || 1.0)),
    bossPhase: (hp, max) => (hp / max <= 0.5 ? 2 : 1),
    normalizeText,
    gradeShort,
    gradeOrdering,
    gradeMatching,
    afterAnswer,
    updatePace,
    bossDamage,
    validateQuestionData
  };
}));
