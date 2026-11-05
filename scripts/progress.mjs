#!/usr/bin/env node
// scripts/progress.mjs — pengelola ceklis docs/PROGRESS-v7.md (tanpa dependensi). Jalankan: npm run progress -- <perintah>
import fs from 'node:fs';
import path from 'node:path';

const FILE = process.env.PROGRESS_FILE || 'docs/PROGRESS-v7.md';
const MAX_TRIES = 2;                                   // percobaan maks per tugas sebelum wajib diblokir
const LINE = /^- \[([ ~x!])\] \*\*((?:T|G)-\d+)\*\*/;
const die = (m) => { console.error('✖ ' + m); process.exit(1); };
const read = () => { if (!fs.existsSync(FILE)) die(`${FILE} belum ada. Jalankan: npm run progress -- init <file-dokumen-v7.md>`); return fs.readFileSync(FILE, 'utf8').split('\n'); };
const write = (l) => fs.writeFileSync(FILE, l.join('\n'));
const stamp = () => new Date().toISOString().slice(0, 16).replace('T', ' ');
const tasks = (lines) => lines.map((t, i) => { const m = LINE.exec(t); return m ? { i, st: m[1], id: m[2] } : null; }).filter(Boolean);
const triesOf = (t) => Number(/<!--tries:(\d+)-->/.exec(t)?.[1] ?? 0);
const withState = (t, st) => t.replace(/^- \[[ ~x!]\]/, `- [${st}]`);
const withTries = (t, n) => t.replace(/\s*<!--tries:\d+-->/, '') + ` <!--tries:${n}-->`;
const find = (ts, id) => ts.find((t) => t.id === id) ?? die(`ID tidak ditemukan: ${id}`);
const nextOf = (ts) => ts.find((t) => t.st === '~') ?? ts.find((t) => t.st === ' ');   // tugas [~] (belum tuntas) selalu didahulukan
const addNote = (lines, i, note) => { let j = i + 1; while (lines[j]?.startsWith('  - ')) j++; lines.splice(j, 0, `  - ${note}`); };
const templateBody = (docPath) => {
  const doc = fs.readFileSync(docPath, 'utf8'); const a = doc.lastIndexOf('@@TEMPLATE-START@@'); const b = doc.lastIndexOf('@@TEMPLATE-END@@');
  if (a < 0 || b < 0) die('Penanda template tidak ditemukan di dokumen.');
  const body = doc.slice(doc.indexOf('\n', a) + 1, b).replace(/\n[^\n]*$/, '\n');
  if (!/\*\*T-00\*\*/.test(body)) die('Template kosong/salah — periksa Lampiran F.'); return body;
};
const [cmd, a1, ...rest] = process.argv.slice(2);
const force = rest.includes('--force'); const text = rest.filter((x) => x !== '--force').join(' ').trim();

function status(lines) {
  const ts = tasks(lines); const c = { ' ': 0, '~': 0, x: 0, '!': 0 }; ts.forEach((t) => c[t.st]++);
  const nx = nextOf(ts); const pct = Math.round((c.x / ts.length) * 100);
  console.log(`Progres: ${c.x}/${ts.length} selesai (${pct}%) · sedang: ${c['~']} · diblokir: ${c['!']} · belum: ${c[' ']}`);
  console.log(nx ? `BERIKUTNYA → ${lines[nx.i].replace(/\s*<!--.*?-->/, '')}` : '🎉 Semua tugas selesai/diblokir. Kirim Laporan Akhir (Bagian 14).');
}

switch (cmd) {
  case 'init': {
    if (!a1) die('Pakai: init <file-dokumen-v7.md>');
    if (fs.existsSync(FILE)) die(`${FILE} sudah ada — JANGAN ditimpa. Pakai: status / next (atau sync <doc> bila dokumen diperbarui)`);
    const body = templateBody(a1);
    fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, body); console.log(`✔ ${FILE} dibuat.`); status(read()); break;
  }
  case 'sync': {   // tambahkan tugas BARU dari dokumen yang diperbarui; tugas lama (apa pun statusnya) tidak disentuh
    if (!a1) die('Pakai: sync <file-dokumen-v7.md>');
    const l = read(); const tl = templateBody(a1).split('\n'); const have = new Set(tasks(l).map((t) => t.id)); const added = [];
    let prev = null; let hdr = null;
    for (const line of tl) {
      if (line.startsWith('## ')) { hdr = line; continue; }
      const m = LINE.exec(line); if (!m) continue; const id = m[2];
      if (!have.has(id)) {
        const cur = tasks(l); let idx;
        if (prev) { const pt = cur.find((t) => t.id === prev); idx = pt.i + 1; while (l[idx]?.startsWith('  - ')) idx++; } else idx = cur[0].i;
        const ins = !hdr || l.includes(hdr) ? [line] : ['', hdr, line];
        l.splice(idx, 0, ...ins); have.add(id); added.push(id);
      }
      prev = id;
    }
    write(l); console.log(added.length ? `✔ ditambahkan: ${added.join(', ')}` : 'Tidak ada tugas baru — ceklis sudah mutakhir.'); status(read()); break;
  }
  case 'status': status(read()); break;
  case 'next': { const l = read(); const n = nextOf(tasks(l)); console.log(n ? l[n.i] : 'Tidak ada tugas tersisa.'); break; }
  case 'start': {
    const l = read(); const ts = tasks(l); const t = find(ts, a1);
    if (t.st === 'x') die(`${a1} SUDAH SELESAI. Jangan dikerjakan ulang. Jalankan: status`);
    if (t.st === '!') die(`${a1} berstatus DIBLOKIR. Lanjut ke tugas berikutnya (status).`);
    const other = ts.find((x) => x.st === '~' && x.id !== a1); if (other) die(`${other.id} masih berjalan. Selesaikan (done) atau blokir (block) dulu.`);
    const nx = nextOf(ts); if (!force && t.st !== '~' && nx.id !== a1) die(`Urutan: tugas berikutnya adalah ${nx.id}, bukan ${a1}.`);
    const n = triesOf(l[t.i]) + (t.st === '~' ? 0 : 1);
    if (n > MAX_TRIES) die(`${a1} sudah dicoba ${MAX_TRIES}×. Jalankan: block ${a1} "alasan" lalu lanjut tugas lain.`);
    l[t.i] = withTries(withState(l[t.i], '~'), n); write(l); console.log(`▶ ${a1} dimulai (percobaan ${n}/${MAX_TRIES}).`); break;
  }
  case 'note': { const l = read(); const t = find(tasks(l), a1); if (!text) die('Catatan kosong.'); addNote(l, t.i, `📝 ${stamp()} — ${text}`); write(l); console.log('✔ catatan ditambah.'); break; }
  case 'done': {
    const l = read(); const ts = tasks(l); const t = find(ts, a1);
    if (t.st === 'x') { console.log(`${a1} sudah selesai sebelumnya — tidak ada yang diubah.`); break; }
    if (!text) die('Bukti wajib: done <ID> "file yang diubah · perintah tes · hasil"');
    if (t.st !== '~' && nextOf(ts)?.id !== a1 && !force) die(`${a1} belum dimulai (start) dan bukan tugas berikutnya.`);
    l[t.i] = withState(l[t.i], 'x'); addNote(l, t.i, `✅ ${stamp()} — ${text}`); write(l); console.log(`✔ ${a1} SELESAI.`); status(read()); break;
  }
  case 'block': {
    const l = read(); const t = find(tasks(l), a1); if (!text) die('Alasan wajib: block <ID> "alasan"');
    l[t.i] = withState(l[t.i], '!'); addNote(l, t.i, `⛔ ${stamp()} — ${text}`); write(l); console.log(`⛔ ${a1} diblokir.`); status(read()); break;
  }
  case 'handoff': {
    const l = read(); const k = l.findIndex((x) => x.trim() === '<!--HANDOFF-->'); if (k < 0) die('Penanda HANDOFF hilang.');
    const ho = [a1, ...rest].filter(Boolean).join(' ').trim(); if (!ho) die('Isi handoff kosong.'); l[k + 1] = `> ${stamp()} — ${ho}`; write(l); console.log('✔ handoff diperbarui.'); break;
  }
  case 'check': {
    const l = read(); const ts = tasks(l); const bad = [];
    const block = (i) => { const o = []; for (let j = i + 1; l[j]?.startsWith('  - '); j++) o.push(l[j]); return o; };
    if (ts.filter((t) => t.st === '~').length > 1) bad.push('Lebih dari satu tugas berstatus [~].');
    for (const t of ts) {
      if (t.st === 'x' && !block(t.i).some((x) => x.startsWith('  - ✅'))) bad.push(`${t.id} [x] tanpa bukti.`);
      if (t.st === '!' && !block(t.i).some((x) => x.startsWith('  - ⛔'))) bad.push(`${t.id} [!] tanpa alasan.`);
    }
    if (bad.length) die(bad.join('\n')); console.log('✔ ceklis valid.'); break;
  }
  default: console.log('Perintah: init <doc> | sync <doc> | status | next | start <ID> | note <ID> "teks" | done <ID> "bukti" | block <ID> "alasan" | handoff "teks" | check');
}
