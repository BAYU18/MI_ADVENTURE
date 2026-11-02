const fs = require('node:fs');
const path = require('node:path');
const { validateQuestions } = require('../../scripts/validate-konten.js');

function createQuestion({ question, options, answer, explanation, difficulty, timeLimit }) {
  if (!question || !options || answer === undefined || !explanation || !difficulty) {
    throw new Error(`Data soal tidak lengkap: ${JSON.stringify({ question, options, answer, explanation, difficulty })}`);
  }
  return {
    question: question.trim(),
    options: options.map(o => String(o).trim()),
    answer,
    explanation: explanation.trim(),
    difficulty,
    timeLimit: timeLimit || 20
  };
}

// Helper to shuffle options and set the correct answer index automatically
function qAuto({ q, correct, distractors, expl, diff = 1, timeLimit = 20, forcedKey = null }) {
  if (distractors.length !== 3) {
    throw new Error(`Distractors harus tepat 3 opsi: ${distractors}`);
  }
  let options = [];
  let answer = 0;

  if (forcedKey !== null && forcedKey >= 0 && forcedKey <= 3) {
    options = [...distractors];
    options.splice(forcedKey, 0, correct);
    answer = forcedKey;
  } else {
    // Pick key based on question text hash or sequence
    const all = [
      { text: correct, isKey: true },
      { text: distractors[0], isKey: false },
      { text: distractors[1], isKey: false },
      { text: distractors[2], isKey: false }
    ];
    // Deterministic pseudo-shuffle based on length & chars
    all.sort((a, b) => (a.text.length % 3) - (b.text.length % 3));
    options = all.map(x => x.text);
    answer = all.findIndex(x => x.isKey);
  }

  return createQuestion({
    question: q,
    options,
    answer,
    explanation: expl,
    difficulty: diff,
    timeLimit
  });
}

function saveBatch(subjectSlug, batchName, questions) {
  const dir = path.join('/home/maman/play/konten/kelas4-sem1', subjectSlug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${batchName}.json`);
  const data = {
    class: 'Kelas 4 SD',
    subjectSlug,
    batch: batchName,
    count: questions.length,
    questions
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

  // Validate
  const val = validateQuestions(questions, subjectSlug);
  if (!val.valid) {
    console.error(`❌ Batch ${subjectSlug}/${batchName} tidak valid:`, val.errors);
    throw new Error(`Validasi gagal untuk ${subjectSlug}/${batchName}`);
  }

  console.log(`✅ Saved ${questions.length} questions for ${subjectSlug}/${batchName} (d1:${val.diffCounts[1]}, d2:${val.diffCounts[2]}, d3:${val.diffCounts[3]}, Keys: A:${val.keyCounts[0]} B:${val.keyCounts[1]} C:${val.keyCounts[2]} D:${val.keyCounts[3]})`);
  return { filePath, count: questions.length, val };
}

module.exports = { createQuestion, qAuto, saveBatch };
