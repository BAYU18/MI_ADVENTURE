#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const QUESTION_FORBIDDEN_REGEX = [
  /semua(\s+jawaban)?\s+benar/i,
  /salah\s+semua/i,
  /\b[abcd]\s*(dan|&|\/)\s*[abcd]\b/i,
  /gambar\s+di\s+(atas|bawah)/i,
  /soal\s+(sebelumnya|nomor|no\b)/i,
  /jawaban\s+(sebelumnya|nomor|no\b)/i
];

const OPTION_FORBIDDEN_REGEX = [
  /semua(\s+jawaban)?\s+benar/i,
  /salah\s+semua/i,
  /\b[abcd]\s*(dan|&|\/)\s*[abcd]\b/i,
  /(jawaban|pilihan|pernyataan)\s+di\s+(atas|bawah)/i,
  /\bdi\s+atas\s+benar\b/i,
  /\bdi\s+atas\s+salah\b/i,
  /gambar\s+di\s+(atas|bawah)/i,
  /soal\s+(sebelumnya|nomor|no\b)/i
];

const ARABIC_ALLOWED_MAPELS = [
  'al-quran-hadis',
  'akidah-akhlak',
  'fikih',
  'ski',
  'bahasa-arab'
];

const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
const BIDI_CONTROL_REGEX = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/;

function questionHash(text) {
  return crypto.createHash('sha1')
    .update(String(text || '').toLowerCase().trim().replace(/\s+/g, ' '))
    .digest('hex');
}

function tokenize(text) {
  return new Set(
    String(text || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .split(/\s+/)
      .filter(Boolean)
  );
}

function jaccard(setA, setB) {
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function validateQuestions(questions, mapelSlug, options = {}) {
  const errors = [];
  const warnings = [];
  const seenHashes = new Map();
  const tokenSets = [];
  const keyCounts = [0, 0, 0, 0];
  const diffCounts = { 1: 0, 2: 0, 3: 0 };
  let longestKeyCount = 0;
  const isArabicAllowed = ARABIC_ALLOWED_MAPELS.includes(mapelSlug);

  questions.forEach((q, idx) => {
    const qNum = idx + 1;
    const prefix = `[Soal #${qNum}]`;

    // 1. Basic fields
    if (!q.question || typeof q.question !== 'string') {
      errors.push(`${prefix} Bidang 'question' wajib berupa string.`);
      return;
    }

    const qText = q.question;
    if (qText.length < 1 || qText.length > 200) {
      errors.push(`${prefix} Panjang soal harus 1–200 karakter (aktual: ${qText.length}).`);
    } else if (qText.length > 140) {
      warnings.push(`${prefix} Panjang soal (${qText.length}) melebihi target nyaman 140 karakter.`);
    }

    // Markdown / HTML / Newlines
    if (/[\n\r]/.test(qText)) errors.push(`${prefix} Soal tidak boleh mengandung baris baru (newline).`);
    if (/<[^>]+>/.test(qText)) errors.push(`${prefix} Soal tidak boleh mengandung tag HTML.`);
    if (/\*\*|`/.test(qText)) errors.push(`${prefix} Soal tidak boleh mengandung format Markdown (** atau backtick).`);
    if (/ {2,}/.test(qText) || /^\s|\s$/.test(qText)) {
      warnings.push(`${prefix} Soal memiliki spasi ganda atau spasi di tepi.`);
    }

    // Forbidden phrases in question
    for (const reg of QUESTION_FORBIDDEN_REGEX) {
      if (reg.test(qText)) {
        errors.push(`${prefix} Mengandung frasa terlarang '${reg}': "${qText}"`);
      }
    }

    // 2. Options
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push(`${prefix} Bidang 'options' harus berupa array dengan tepat 4 pilihan.`);
      return;
    }

    const optLower = new Set();
    let maxOptLen = -1;
    let maxOptIdx = -1;

    q.options.forEach((opt, oIdx) => {
      const oLetter = ['A', 'B', 'C', 'D'][oIdx];
      if (typeof opt !== 'string' || opt.length < 1 || opt.length > 60) {
        errors.push(`${prefix} Opsi ${oLetter} harus string 1–60 karakter (aktual: "${opt}").`);
      } else if (opt.length > 40) {
        warnings.push(`${prefix} Opsi ${oLetter} (${opt.length} kar) melebihi target nyaman 40 karakter.`);
      }

      const lower = String(opt).toLowerCase().trim().replace(/\s+/g, ' ');
      if (optLower.has(lower)) {
        errors.push(`${prefix} Pilihan opsi duplikat: "${opt}".`);
      }
      optLower.add(lower);

      if (opt.length > maxOptLen) {
        maxOptLen = opt.length;
        maxOptIdx = oIdx;
      }

      for (const reg of OPTION_FORBIDDEN_REGEX) {
        if (reg.test(opt)) {
          errors.push(`${prefix} Opsi ${oLetter} mengandung frasa terlarang '${reg}': "${opt}"`);
        }
      }
    });

    // 3. Answer
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) {
      errors.push(`${prefix} Bidang 'answer' harus angka 0, 1, 2, atau 3 (aktual: ${q.answer}).`);
    } else {
      keyCounts[q.answer]++;
      if (q.answer === maxOptIdx) longestKeyCount++;
    }

    // 4. Difficulty
    if (typeof q.difficulty !== 'number' || ![1, 2, 3].includes(q.difficulty)) {
      errors.push(`${prefix} Bidang 'difficulty' harus 1, 2, atau 3 (aktual: ${q.difficulty}).`);
    } else {
      diffCounts[q.difficulty] = (diffCounts[q.difficulty] || 0) + 1;
    }

    // 5. Explanation
    if (!q.explanation || typeof q.explanation !== 'string') {
      errors.push(`${prefix} Bidang 'explanation' wajib diisi penjelasan ramah.`);
    } else if (q.explanation.length > 200) {
      errors.push(`${prefix} Panjang explanation harus <= 200 karakter (aktual: ${q.explanation.length}).`);
    }

    // 6. TimeLimit (optional, 5-120)
    if (q.timeLimit !== undefined) {
      if (typeof q.timeLimit !== 'number' || q.timeLimit < 5 || q.timeLimit > 120) {
        errors.push(`${prefix} 'timeLimit' harus antara 5 dan 120 detik (aktual: ${q.timeLimit}).`);
      }
    }

    // 7. Hash uniqueness
    const h = questionHash(qText);
    if (seenHashes.has(h)) {
      errors.push(`${prefix} Soal duplikat persis dengan Soal #${seenHashes.get(h)}: "${qText}"`);
    } else {
      seenHashes.set(h, qNum);
    }

    // 8. Near duplicate check (Jaccard)
    const tokens = tokenize(qText);
    for (let prevIdx = 0; prevIdx < tokenSets.length; prevIdx++) {
      const sim = jaccard(tokens, tokenSets[prevIdx]);
      if (sim >= 0.85) {
        warnings.push(`${prefix} Kemiripan tinggi (${(sim * 100).toFixed(1)}%) dengan Soal #${prevIdx + 1}.`);
      }
    }
    tokenSets.push(tokens);

    // 9. Arabic check
    const allText = [qText, ...(q.options || []), q.explanation || ''].join(' ');
    const hasArabic = ARABIC_REGEX.test(allText);

    if (hasArabic && !isArabicAllowed) {
      errors.push(`${prefix} Mengandung karakter Arab pada mapel '${mapelSlug}' yang tidak diizinkan.`);
    }

    if (hasArabic) {
      if (BIDI_CONTROL_REGEX.test(allText)) {
        warnings.push(`${prefix} Mengandung karakter kontrol arah bidi Unicode.`);
      }
      if (allText !== allText.normalize('NFC')) {
        errors.push(`${prefix} Teks Arab belum dalam bentuk normalisasi Unicode NFC.`);
      }
      if (q.tts === true) {
        errors.push(`${prefix} 'tts: true' dilarang pada soal yang mengandung teks Arab.`);
      }
    }

    if (mapelSlug === 'bahasa-inggris' && q.tts === true) {
      errors.push(`${prefix} 'tts: true' dilarang pada mata pelajaran Bahasa Inggris.`);
    }
  });

  const total = questions.length;
  // Key distribution check
  if (total >= 20) {
    keyCounts.forEach((cnt, k) => {
      const pct = (cnt / total) * 100;
      if (pct < 15 || pct > 35) {
        errors.push(`Distribusi kunci [${['A','B','C','D'][k]}] ekstrem: ${pct.toFixed(1)}% (${cnt}/${total}). Batas error 15-35%.`);
      } else if (pct < 18 || pct > 32) {
        warnings.push(`Distribusi kunci [${['A','B','C','D'][k]}] perlu diseimbangkan: ${pct.toFixed(1)}% (${cnt}/${total}). Target 22-28%.`);
      }
    });

    const longestPct = (longestKeyCount / total) * 100;
    if (longestPct > 50) {
      errors.push(`Bias panjang kunci jawaban: kunci menjadi opsi terpanjang pada ${longestPct.toFixed(1)}% soal (batas error 50%).`);
    } else if (longestPct > 40) {
      warnings.push(`Peringatan bias panjang: kunci menjadi opsi terpanjang pada ${longestPct.toFixed(1)}% soal (target <= 40%).`);
    }
  }

  return {
    total,
    errors,
    warnings,
    keyCounts,
    diffCounts,
    valid: errors.length === 0
  };
}

// CLI usage
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node scripts/validate-konten.js <file-or-dir> [mapel-slug]');
    process.exit(1);
  }

  let mapelSlug = process.argv[3];
  if (!mapelSlug) {
    const parent = path.basename(path.dirname(filePath));
    mapelSlug = parent !== 'kelas4-sem1' && parent !== 'konten' ? parent : path.basename(filePath, '.json');
  }

  const stat = fs.statSync(filePath);
  let files = [];
  if (stat.isDirectory()) {
    files = fs.readdirSync(filePath)
      .filter(f => f.endsWith('.json') && !f.startsWith('_'))
      .map(f => path.join(filePath, f));
  } else {
    files = [filePath];
  }

  let totalQuestions = 0;
  let allQuestions = [];

  for (const f of files) {
    try {
      const raw = fs.readFileSync(f, 'utf8');
      const data = JSON.parse(raw);
      const list = Array.isArray(data) ? data : (data.questions || []);
      allQuestions = allQuestions.concat(list);
    } catch (e) {
      console.error(`Gagal membaca ${f}:`, e.message);
      process.exit(1);
    }
  }

  console.log(`🔍 Memvalidasi ${allQuestions.length} soal untuk mapel: ${mapelSlug}...`);
  const res = validateQuestions(allQuestions, mapelSlug);

  console.log(`\n--- Ringkasan Validasi ---`);
  console.log(`Total Soal   : ${res.total}`);
  console.log(`Tingkat d1/d2/d3: ${res.diffCounts[1] || 0} / ${res.diffCounts[2] || 0} / ${res.diffCounts[3] || 0}`);
  console.log(`Sebaran Kunci: A=${res.keyCounts[0]}, B=${res.keyCounts[1]}, C=${res.keyCounts[2]}, D=${res.keyCounts[3]}`);
  console.log(`Status       : ${res.valid ? '✅ VALID (0 Error)' : '❌ GAGAL'}`);
  console.log(`Jumlah Error : ${res.errors.length}`);
  console.log(`Peringatan   : ${res.warnings.length}`);

  if (res.warnings.length > 0) {
    console.log(`\n⚠️  Daftar Peringatan (${res.warnings.length}):`);
    res.warnings.slice(0, 15).forEach(w => console.log('  - ' + w));
    if (res.warnings.length > 15) console.log(`  ...dan ${res.warnings.length - 15} peringatan lainnya.`);
  }

  if (res.errors.length > 0) {
    console.log(`\n❌ Daftar Error (${res.errors.length}):`);
    res.errors.forEach(e => console.log('  - ' + e));
    process.exit(1);
  }

  process.exit(0);
}

module.exports = { validateQuestions, questionHash };
