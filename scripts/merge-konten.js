#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const MAPEL_NAMES = {
  'matematika': 'Matematika',
  'bahasa-indonesia': 'Bahasa Indonesia',
  'ipas': 'IPAS',
  'pendidikan-pancasila': 'Pendidikan Pancasila',
  'akidah-akhlak': 'Akidah Akhlak',
  'al-quran-hadis': "Al-Qur'an Hadis",
  'fikih': 'Fikih',
  'ski': 'SKI',
  'bahasa-arab': 'Bahasa Arab',
  'pjok': 'PJOK',
  'seni-budaya': 'Seni Budaya',
  'bahasa-inggris': 'Bahasa Inggris'
};

function mergeMapel(mapelSlug) {
  const dir = path.join('/home/maman/play/konten/kelas4-sem1', mapelSlug);
  if (!fs.existsSync(dir)) {
    throw new Error(`Direktori ${dir} tidak ditemukan.`);
  }

  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json') && !f.startsWith('_'))
    .sort();

  let allQuestions = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const raw = fs.readFileSync(full, 'utf8');
    const data = JSON.parse(raw);
    const list = Array.isArray(data) ? data : (data.questions || []);
    allQuestions = allQuestions.concat(list);
  }

  const outObj = {
    version: 1,
    class: 'Kelas 4 SD',
    subject: MAPEL_NAMES[mapelSlug] || mapelSlug,
    totalQuestions: allQuestions.length,
    questions: allQuestions
  };

  const outFile = path.join('/home/maman/play/seed', `kelas4-sem1-${mapelSlug}.json`);
  fs.writeFileSync(outFile, JSON.stringify(outObj, null, 2), 'utf8');
  console.log(`✅ Berhasil menggabungkan ${allQuestions.length} soal ke ${outFile}`);
  return { outFile, count: allQuestions.length };
}

if (require.main === module) {
  const mapelSlug = process.argv[2];
  if (!mapelSlug) {
    console.error('Usage: node scripts/merge-konten.js <mapel-slug|all>');
    process.exit(1);
  }

  if (mapelSlug === 'all') {
    Object.keys(MAPEL_NAMES).forEach(slug => {
      const dir = path.join('/home/maman/play/konten/kelas4-sem1', slug);
      if (fs.existsSync(dir)) {
        mergeMapel(slug);
      }
    });
  } else {
    mergeMapel(mapelSlug);
  }
}

module.exports = { mergeMapel, MAPEL_NAMES };
