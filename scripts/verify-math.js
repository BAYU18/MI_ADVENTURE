#!/usr/bin/env node
const fs = require('node:fs');

function cleanNumber(str) {
  return parseFloat(str.replace(/\./g, '').replace(/,/g, '.').trim());
}

function verifyMathQuestion(q, idx) {
  const text = q.question;
  const expectedAns = q.options[q.answer];
  const issues = [];

  // Match simple arithmetic: e.g. "12 × 5 = ..." or "345 + 278 = ..." or "1.000 − 457 = ..."
  const match = text.match(/^([\d.,]+)\s*([+\-−×*÷/])\s*([\d.,]+)\s*=/);
  if (match) {
    const a = cleanNumber(match[1]);
    const op = match[2];
    const b = cleanNumber(match[3]);
    let result = null;

    if (op === '+') result = a + b;
    else if (op === '-' || op === '−') result = a - b;
    else if (op === '×' || op === '*') result = a * b;
    else if (op === '÷' || op === '/') result = a / b;

    if (result !== null && !isNaN(result)) {
      const parsedAns = cleanNumber(expectedAns);
      if (Math.abs(result - parsedAns) > 0.0001) {
        issues.push(`Soal #${idx + 1}: Perhitungan salah! Soal "${text}" -> Hitungan: ${result}, tetapi kunci pilihan [${q.answer}] = "${expectedAns}" (${parsedAns})`);
      }
    }
  }

  return issues;
}

if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node scripts/verify-math.js <file-or-dir>');
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  const questions = Array.isArray(data) ? data : (data.questions || []);

  let errors = [];
  questions.forEach((q, idx) => {
    errors = errors.concat(verifyMathQuestion(q, idx));
  });

  if (errors.length > 0) {
    console.error(`❌ Ditemukan ${errors.length} kesalahan matematika:`);
    errors.forEach(e => console.error('  - ' + e));
    process.exit(1);
  } else {
    console.log(`✅ Seluruh ${questions.length} soal matematika terverifikasi akurat.`);
    process.exit(0);
  }
}

module.exports = { verifyMathQuestion };
