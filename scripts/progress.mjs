#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const progressFile = path.join(rootDir, 'docs', 'PROGRESS-v5.md');

function ensureDocs() {
  const docsDir = path.join(rootDir, 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
}

function readProgress() {
  ensureDocs();
  if (!fs.existsSync(progressFile)) {
    return '';
  }
  return fs.readFileSync(progressFile, 'utf8');
}

function writeProgress(content) {
  ensureDocs();
  fs.writeFileSync(progressFile, content, 'utf8');
}

const args = process.argv.slice(2);
const command = args[0] || 'status';

if (command === 'init') {
  if (fs.existsSync(progressFile)) {
    console.log('docs/PROGRESS-v5.md sudah ada.');
    process.exit(0);
  }
  // Will be written by caller or template
  console.log('Initialized progress file.');
  process.exit(0);
}

if (command === 'status') {
  const content = readProgress();
  if (!content) {
    console.log('Belum ada docs/PROGRESS-v5.md');
    process.exit(0);
  }
  const lines = content.split('\n');
  let active = null;
  let next = null;
  let doneCount = 0;
  let totalCount = 0;

  for (const line of lines) {
    const match = line.match(/^-\s*\[([ x~!])\]\s*\*\*([A-Za-z0-9_-]+):?\*\*/);
    if (match) {
      totalCount++;
      const status = match[1];
      const id = match[2];
      if (status === 'x') {
        doneCount++;
      } else if (status === '~') {
        active = id;
      } else if (status === ' ' && !next && !active) {
        next = id;
      }
    }
  }

  console.log(`📊 Progres v5.2: ${doneCount}/${totalCount} selesai (${totalCount ? Math.round((doneCount / totalCount) * 100) : 0}%)`);
  if (active) {
    console.log(`⏳ Sedang Dikerjakan: ${active}`);
  } else if (next) {
    console.log(`▶️ Tugas Berikutnya: ${next}`);
  } else {
    console.log('🎉 Semua tugas selesai atau terkondisi!');
  }
  process.exit(0);
}

if (command === 'start') {
  const taskId = args[1];
  if (!taskId) {
    console.error('Harap sebutkan taskId, misal: npm run progress -- start T-00');
    process.exit(1);
  }
  let content = readProgress();
  // Check if any task is already in progress
  if (content.includes('[~]')) {
    const activeMatch = content.match(/-\s*\[~\]\s*\*\*([A-Za-z0-9_-]+):?\*\*/);
    const activeId = activeMatch ? activeMatch[1] : 'lain';
    if (activeId !== taskId) {
      console.error(`Error: Tugas ${activeId} masih berstatus [~]. Selesaikan dahulu dengan 'done ${activeId}'`);
      process.exit(1);
    }
  }

  const taskRegex = new RegExp(`(-\\s*\\[)[ \\!](]\\s*\\*\\*${taskId}:?\\*\\*)`);
  if (!taskRegex.test(content)) {
    if (new RegExp(`(-\\s*\\[x]\\s*\\*\\*${taskId}:?\\*\\*)`).test(content)) {
      console.error(`Error: Tugas ${taskId} sudah selesai [x] dan tidak boleh diulang.`);
      process.exit(1);
    }
    if (new RegExp(`(-\\s*\\[~\\]\\s*\\*\\*${taskId}:?\\*\\*)`).test(content)) {
      console.log(`Tugas ${taskId} sudah dalam status [~].`);
      process.exit(0);
    }
    console.error(`Error: Tugas ${taskId} tidak ditemukan.`);
    process.exit(1);
  }

  content = content.replace(taskRegex, `$1~$2`);
  writeProgress(content);
  console.log(`✅ Tugas ${taskId} sekarang berstatus [~] (in-progress).`);
  process.exit(0);
}

if (command === 'done') {
  const taskId = args[1];
  const evidence = args[2] || 'Selesai terverifikasi';
  if (!taskId) {
    console.error('Harap sebutkan taskId dan bukti, misal: npm run progress -- done T-00 "file diubah..."');
    process.exit(1);
  }
  let content = readProgress();
  const taskRegex = new RegExp(`(-\\s*\\[)[ ~](]\\s*\\*\\*${taskId}:?\\*\\*)`);
  if (!taskRegex.test(content)) {
    console.error(`Error: Tugas ${taskId} tidak dalam status [ ] atau [~].`);
    process.exit(1);
  }

  content = content.replace(taskRegex, `$1x$2`);
  // Append evidence note if possible
  const lines = content.split('\n');
  const newLines = [];
  for (let i = 0; i < lines.length; i++) {
    newLines.push(lines[i]);
    if (lines[i].includes(`**${taskId}:**`) || lines[i].includes(`**${taskId}**`)) {
      newLines.push(`  - *Bukti:* ${evidence}`);
    }
  }
  writeProgress(newLines.join('\n'));
  console.log(`🎉 Tugas ${taskId} ditandai [x] selesai.`);
  process.exit(0);
}

if (command === 'note') {
  const taskId = args[1];
  const note = args[2] || '';
  if (!taskId) {
    console.error('Harap sebutkan taskId dan catatan.');
    process.exit(1);
  }
  let content = readProgress();
  const lines = content.split('\n');
  const newLines = [];
  for (let i = 0; i < lines.length; i++) {
    newLines.push(lines[i]);
    if (lines[i].includes(`**${taskId}:**`) || lines[i].includes(`**${taskId}**`)) {
      newLines.push(`  - *Catatan:* ${note}`);
    }
  }
  writeProgress(newLines.join('\n'));
  console.log(`📝 Catatan untuk ${taskId} berhasil ditambahkan.`);
  process.exit(0);
}

if (command === 'block') {
  const taskId = args[1];
  const reason = args[2] || 'Ditunda';
  if (!taskId) {
    console.error('Harap sebutkan taskId dan alasan.');
    process.exit(1);
  }
  let content = readProgress();
  const taskRegex = new RegExp(`(-\\s*\\[)[ ~](]\\s*\\*\\*${taskId}:?\\*\\*)`);
  content = content.replace(taskRegex, `$1!$2`);
  writeProgress(content);
  console.log(`⚠️ Tugas ${taskId} ditandai [!] (${reason}).`);
  process.exit(0);
}

console.log(`Perintah tidak dikenal: ${command}`);
process.exit(1);
