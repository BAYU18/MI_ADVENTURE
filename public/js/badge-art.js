// public/js/badge-art.js — Generator Gambar Lencana SVG (Universal UMD: Browser & Node.js)
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.BadgeArt = factory();
  }
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

// public/js/badge-art.js — generator gambar lencana (ES module, tanpa dependensi, tanpa filter SVG)
const TIERS = ['common', 'rare', 'epic', 'legend'];

/* ───────── Palet per tier ───────── */
const PAL = {
  common: { rim: ['#fde7b8', '#f59e0b', '#8a4b0f'], face: ['#8a5524', '#3a2210'], g: '#fde68a', g2: '#fbbf24', a: '#f59e0b', d: '#3b2008', gem: '#fcd34d' },
  rare:   { rim: ['#f0f9ff', '#38bdf8', '#0b4a75'], face: ['#2a6fa8', '#0a2342'], g: '#e0f2fe', g2: '#7dd3fc', a: '#38bdf8', d: '#071f38', gem: '#bae6fd' },
  epic:   { rim: ['#fff7d6', '#fbbf24', '#8a4b0f'], face: ['#b3123f', '#3d0518'], g: '#fef3c7', g2: '#fbbf24', a: '#fb7185', d: '#3d0518', gem: '#fb7185' },
  legend: { rim: ['#fde68a', '#f0abfc', '#67e8f9', '#c084fc', '#fde68a'], face: ['#4a2189', '#0b0720'], g: '#faf5ff', g2: '#e9d5ff', a: '#c084fc', d: '#12062b', gem: '#67e8f9' },
  locked: { rim: ['#e2e8f0', '#94a3b8', '#475569'], face: ['#52617a', '#1e293b'], g: '#94a3b8', g2: '#64748b', a: '#64748b', d: '#0f172a', gem: '#94a3b8' },
};
const ELEM = ['#4ade80', '#38bdf8', '#f87171', '#fde047', '#a16207', '#67e8f9', '#c084fc', '#f1f5f9', '#f472b6', '#fb923c'];

/* ───────── Helper gambar ───────── */
const f2 = v => Math.round(v * 100) / 100;
const O = (p, fill, w = 1.6) => `fill="${fill}" stroke="${p.d}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const K = (c, w = 2) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const pts = a => a.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' ');
const polar = (r, deg) => [r * Math.cos(deg * Math.PI / 180), r * Math.sin(deg * Math.PI / 180)];
const starPts = (R, r, k = 5, a0 = -90) => pts(Array.from({ length: k * 2 }, (_, i) => polar(i % 2 ? r : R, a0 + i * 180 / k)));
const spark = (x, y, s, c) => `<path d="M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z" fill="${c}"/>`;
const gemShape = (p, x, y, r, c) => `<g transform="translate(${x} ${y})"><polygon points="0,${-r} ${f2(r * .85)},0 0,${r} ${f2(-r * .85)},0" ${O(p, c, 1.1)}/><polygon points="0,${-r} ${f2(r * .85)},0 0,0" fill="#fff" opacity=".45"/></g>`;
const flame = (p, x, y, s, c1, c2, flip = 1) => `<g transform="translate(${x} ${y}) scale(${s} ${s * flip})"><path d="M0 14C-11 14-13 3-6-6C-5-2-3-2-2-4C-3-11 1-16 2-20C9-13 14-4 12 3C11 10 6 14 0 14Z" ${O(p, c1)}/><path d="M0 14C-5 14-6 8-2 3C-1 6 1 6 2 4C6 8 6 14 0 14Z" fill="${c2}"/></g>`;
const crown = (p, cx, y, w, h, n, gemC) => {
  const x0 = cx - w / 2, x1 = cx + w / 2, yb = y + h, step = w / (n - 1);
  let d = `M${x0} ${yb}L${x0} ${y}`;
  for (let i = 1; i < n; i++) d += `L${f2(x0 + step * (i - .5))} ${f2(y + h * .5)}L${f2(x0 + step * i)} ${y}`;
  d += `L${x1} ${yb}Z`;
  let tips = '';
  for (let i = 0; i < n; i++) tips += `<circle cx="${f2(x0 + step * i)}" cy="${y}" r="${f2(w * .055)}" ${O(p, p.g, 1)}/>`;
  return `<path d="${d}" ${O(p, p.g2, 1.8)}/><rect x="${x0}" y="${f2(yb - h * .24)}" width="${w}" height="${f2(h * .24)}" rx="1.5" ${O(p, p.a, 1.4)}/>${tips}${gemShape(p, cx, f2(y + h * .52), f2(h * .26), gemC)}`;
};
const feather = (L, w) => `M0 0Q${f2(-L * .5)} ${-w} ${-L} 0Q${f2(-L * .5)} ${w} 0 0Z`;
const wingFeathers = (n, L, w, a0, a1, fills, stroke) => Array.from({ length: n }, (_, i) => {
  const t = n > 1 ? i / (n - 1) : 0, len = L * (1 - .42 * t), ang = a0 + (a1 - a0) * t;
  return `<path d="${feather(f2(len), w)}" transform="rotate(${f2(ang)})" fill="${fills[i % fills.length]}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/>`;
}).join('');
const wingPair = (x, y, mirrorX, n, L, w, a0, a1, fills, stroke) =>
  `<g transform="translate(${x} ${y})">${wingFeathers(n, L, w, a0, a1, fills, stroke)}</g>` +
  `<g transform="translate(${mirrorX} 0) scale(-1 1)"><g transform="translate(${x} ${y})">${wingFeathers(n, L, w, a0, a1, fills, stroke)}</g></g>`;
const cloud = (p, fill) => {
  const sh = `<circle cx="-10" cy="-6" r="8"/><circle cx="2" cy="-10" r="10"/><circle cx="13" cy="-5" r="8"/><rect x="-18" y="-6" width="39" height="11" rx="5.5"/>`;
  return `<g stroke="${p.d}" stroke-width="3.4" stroke-linejoin="round" fill="${p.d}">${sh}</g><g fill="${fill}">${sh}</g>`;
};
const gear = (p, r, teeth, fill) => {
  const a = [];
  for (let i = 0; i < teeth * 2; i++) { const R = i % 2 ? r : r * 1.28; [0, 1].forEach(k => a.push(polar(R, (i + k) * 180 / teeth - 90 + (k ? 0 : 0)))); }
  const pp = Array.from({ length: teeth * 4 }, (_, i) => polar(Math.floor(i / 2) % 2 ? r * 1.32 : r, (i * 90) / teeth - 90 + (i % 2 ? 0 : 0)));
  return `<polygon points="${pts(pp)}" ${O(p, fill, 1.2)}/><circle r="${f2(r * .42)}" fill="${p.d}"/>`;
};
const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

/* ───────── 20 emblem (t = 0..3 → common..legend) ─────────
   Koordinat emblem: pusat (0,0), kira-kira ±28. */
const sword = p => `<path d="M0-27L4-20V8H-4V-20Z" ${O(p, p.g)}/><path d="M0-24V6" stroke="${p.g2}" stroke-width="1.3"/><rect x="-9" y="8" width="18" height="4" rx="2" ${O(p, p.g2)}/><rect x="-2.6" y="12" width="5.2" height="10" rx="2" ${O(p, p.a)}/><circle cy="24" r="3.2" ${O(p, p.g2)}/>`;
const shield = (p, fill) => `<path d="M0-17L15-12V2C15 12 8 18 0 22C-8 18-15 12-15 2V-12Z" ${O(p, fill)}/>`;
const skull = (p, eye) => `<path d="M-13 2C-17-14-8-22 0-22C8-22 17-14 13 2C13 6 10 8 9 9V14H-9V9C-10 8-13 6-13 2Z" ${O(p, p.g)}/><ellipse cx="-6" cy="-3" rx="4" ry="4.6" fill="${p.d}"/><ellipse cx="6" cy="-3" rx="4" ry="4.6" fill="${p.d}"/>${eye ? `<circle cx="-6" cy="-3" r="2" fill="${eye}"/><circle cx="6" cy="-3" r="2" fill="${eye}"/>` : ''}<path d="M0 3L-2.4 8H2.4Z" fill="${p.d}"/><path d="M-5 14V10M0 14V10M5 14V10" stroke="${p.d}" stroke-width="1.4"/>`;
const bone = (p, a) => `<g transform="rotate(${a})"><rect x="-25" y="-2.4" width="50" height="4.8" rx="2.4" ${O(p, p.g2, 1.3)}/><circle cx="-25" cy="-3" r="3.4" ${O(p, p.g2, 1.3)}/><circle cx="-25" cy="3" r="3.4" ${O(p, p.g2, 1.3)}/><circle cx="25" cy="-3" r="3.4" ${O(p, p.g2, 1.3)}/><circle cx="25" cy="3" r="3.4" ${O(p, p.g2, 1.3)}/></g>`;
const heart = (c, p) => `<path d="M0 20C-26 2-20-16-9-16C-4-16 0-12 0-9C0-12 4-16 9-16C20-16 26 2 0 20Z" ${O(p, c)}/><path d="M-12-10C-16-6-15 0-13 3" ${K('#fff', 2)} opacity=".55"/>`;
const brain = (p, fill) => {
  const half = `<path d="M-1.5-19C-9-23-19-17-17-9C-24-7-24 6-17 8C-18 16-8 20-1.5 16Z" ${O(p, fill)}/><path d="M-1.5-12C-8-12-11-8-10-4M-1.5 0C-8 0-12 3-10 8M-12-14C-14-10-11-7-8-7" ${K(p.d, 1.2)}/>`;
  return half + `<g transform="scale(-1 1)">${half}</g>`;
};
const hexGem = (p, x, y, r, fill) => `<g transform="translate(${f2(x)} ${f2(y)})"><polygon points="${pts(Array.from({ length: 6 }, (_, i) => polar(r, -90 + i * 60)))}" ${O(p, fill, 1.2)}/><polygon points="${pts([polar(r * .6, -90), polar(r * .6, -30), [0, 0]])}" fill="#fff" opacity=".5"/></g>`;
const helmet = (p, plume) => `<path d="M-12-16C-8-30 8-30 12-16C6-21-6-21-12-16Z" ${O(p, plume)}/><path d="M-16 10V-4C-16-16-8-21 0-21C8-21 16-16 16-4V10L11 17H-11Z" ${O(p, p.g)}/><path d="M-9-3H9V2H3.5V14H-3.5V2H-9Z" fill="${p.d}"/><path d="M-16 4H-10M10 4H16" stroke="${p.g2}" stroke-width="1.4"/>`;
const mountain = (p, h) => `<path d="M-30 20L-16 ${f2(-h * .45)}L-2 20Z" ${O(p, p.g2)}/><path d="M-26 20L-3 ${-h}L26 20Z" ${O(p, p.a)}/><path d="M-3 ${-h}L26 20H8Z" fill="${p.d}" opacity=".35"/><path d="M-3 ${-h}L-10 ${f2(-h + 11)}L-6 ${f2(-h + 9)}L-3 ${f2(-h + 14)}L1 ${f2(-h + 9)}L4 ${f2(-h + 12)}Z" ${O(p, '#fff', 1)}/>`;
const flag = (p, x, y, c) => `<path d="M${x} ${y}V${y - 15}" ${K(p.d, 2)}/><path d="M${x} ${y - 15}L${x + 11} ${y - 11}L${x} ${y - 7}Z" ${O(p, c, 1.2)}/>`;

const EMBLEMS = {
  boss_slayer: {
    notes: ['Satu pedang tegak', 'Dua pedang menyilang', 'Pedang menyilang + perisai bintang', 'Pedang menyilang + perisai emas bermata permata + kilau'],
    draw: (t, p) => [
      `<g transform="scale(1.02)">${sword(p)}</g>`,
      `<g transform="rotate(-40) scale(.95)">${sword(p)}</g><g transform="rotate(40) scale(.95)">${sword(p)}</g>`,
      `<g transform="rotate(-42) scale(.92)">${sword(p)}</g><g transform="rotate(42) scale(.92)">${sword(p)}</g>${shield(p, p.a)}<polygon points="${starPts(7, 3.2)}" ${O(p, p.g, 1)} transform="translate(0 2)"/>`,
      `<g transform="rotate(-42) scale(.95)">${sword(p)}</g><g transform="rotate(42) scale(.95)">${sword(p)}</g>${shield(p, p.g2)}${gemShape(p, 0, 2, 7, p.gem)}${spark(-22, -20, 5, p.g)}${spark(22, -18, 4, p.g)}`,
    ][t],
  },
  brutal_conqueror: {
    notes: ['Tengkorak sederhana', 'Tengkorak + tulang menyilang', 'Tengkorak dikelilingi api', 'Tengkorak bertanduk, mata menyala, api membara'],
    draw: (t, p) => [
      `<g transform="scale(1.15)">${skull(p)}</g>`,
      `<g transform="scale(.9)">${bone(p, 35)}${bone(p, -35)}${skull(p)}</g>`,
      `${flame(p, -19, 4, 1, p.a, p.g)}${flame(p, 19, 4, 1, p.a, p.g)}${flame(p, 0, -6, 1.1, p.a, p.g)}<g transform="scale(.82) translate(0 4)">${skull(p)}</g>`,
      `${flame(p, -20, 6, 1.05, p.a, p.g)}${flame(p, 20, 6, 1.05, p.a, p.g)}<path d="M-11-14C-19-15-22-24-18-29C-15-22-10-21-7-19Z" ${O(p, p.a)}/><path d="M11-14C19-15 22-24 18-29C15-22 10-21 7-19Z" ${O(p, p.a)}/><g transform="scale(.86) translate(0 4)">${skull(p, p.gem)}</g>`,
    ][t],
  },
  mythic_hunter: {
    notes: ['Telur naga retak', 'Mata naga bercelah', 'Mata naga + tanduk melengkung', 'Mata naga kosmik dalam cincin bintang + tanduk ganda'],
    draw: (t, p) => {
      const eye = c => `<path d="M-24 0C-14-16 14-16 24 0C14 16-14 16-24 0Z" ${O(p, p.g)}/><circle r="9.5" ${O(p, c, 1.4)}/><ellipse rx="2.4" ry="8" fill="${p.d}"/><circle cx="-3" cy="-4" r="2" fill="#fff"/>`;
      const horn = s => `<path d="M${6 * s}-12C${10 * s}-20 ${18 * s}-22 ${22 * s}-28C${12 * s}-26 ${6 * s}-20 ${3 * s}-14Z" ${O(p, p.g2)}/>`;
      return [
        `<path d="M0-23C12-23 16-6 16 3C16 14 9 23 0 23C-9 23-16 14-16 3C-16-6-12-23 0-23Z" ${O(p, p.g)}/><path d="M-15 0L-8-5L-3 2L3-5L8 0L15-4" ${K(p.d, 1.8)}/><circle cx="-6" cy="12" r="2.6" fill="${p.a}"/><circle cx="6" cy="9" r="2" fill="${p.a}"/>`,
        `<g transform="translate(0 4)">${eye(p.a)}</g>`,
        `${horn(1)}${horn(-1)}<g transform="translate(0 6)">${eye(p.a)}</g>`,
        `<circle r="26" ${K(p.g2, 1.6)} stroke-dasharray="3 4"/>${horn(1)}${horn(-1)}<g transform="translate(0 4)">${eye(p.gem)}</g>${spark(-22, 18, 4, p.g)}${spark(22, 18, 4, p.g)}${spark(0, 24, 3, p.gem)}`,
      ][t];
    },
  },
  elemental_master: {
    notes: ['Daun + 3 orb elemen', 'Tetesan air + 6 orb elemen', 'Petir + 9 orb elemen', 'Planet kosmik dikelilingi 10 orb elemen lengkap'],
    draw: (t, p) => {
      const n = [3, 6, 9, 10][t];
      const orbs = Array.from({ length: n }, (_, i) => { const [x, y] = polar(21, -90 + i * 360 / n); return `<circle cx="${f2(x)}" cy="${f2(y)}" r="${n > 8 ? 4.6 : 5.4}" ${O(p, ELEM[i % 10], 1.3)}/>`; }).join('');
      const mid = [
        `<path d="M0-10C10-8 12 4 0 12C-12 4-10-8 0-10Z" ${O(p, '#4ade80')}/><path d="M0-6V10" ${K(p.d, 1.2)}/>`,
        `<path d="M0-12C8-2 10 4 10 7A10 10 0 0 1-10 7C-10 4-8-2 0-12Z" ${O(p, '#38bdf8')}/>`,
        `<path d="M3-13L-7 3H-1L-3 13L7-3H1Z" ${O(p, '#fde047')}/>`,
        `<circle r="8.5" ${O(p, p.a)}/><ellipse rx="13" ry="3.6" transform="rotate(-20)" ${K(p.g, 1.6)}/>`,
      ][t];
      return `<circle r="21" ${K(p.g2, 1)} opacity=".6"/>${orbs}${mid}`;
    },
  },
  survivor_last_stand: {
    notes: ['Hati dengan plester', 'Hati menyala api', 'Hati bersayap malaikat + halo', 'Phoenix: hati bersayap api membara'],
    draw: (t, p) => {
      const red = '#f43f5e';
      return [
        `${heart(red, p)}<g transform="rotate(-35)"><rect x="-11" y="-4" width="22" height="8" rx="3" ${O(p, '#fde7c7', 1.2)}/><circle cx="-3" cy="0" r=".9" fill="${p.d}"/><circle cx="3" cy="0" r=".9" fill="${p.d}"/></g>`,
        `${heart(red, p)}${flame(p, 0, -14, .8, '#fb923c', '#fde047')}`,
        `<g transform="translate(0 2)">${wingPair(-13, -2, 0, 4, 20, 4.4, -10, 70, ['#fff', p.g2], p.d)}</g>${heart(red, p)}<ellipse cy="-22" rx="9" ry="2.8" ${K(p.g2, 2)}/>`,
        `${flame(p, 0, 17, 1.3, '#fb923c', '#fde047', -1)}<g transform="translate(0 2)">${wingPair(-10, -2, 0, 5, 26, 5, -8, 80, ['#fb923c', '#fde047'], p.d)}</g>${heart(red, p)}${flame(p, 0, -15, .7, '#fde047', '#fff')}`,
      ][t];
    },
  },
  combo_virtuoso: {
    notes: ['Percikan api kecil', 'Petir di depan api', 'Ledakan bintang + petir', 'Zen: bunga teratai + api dalam cincin enso'],
    draw: (t, p) => [
      flame(p, 0, 2, 1.25, p.a, p.g),
      `${flame(p, -2, 4, 1.3, p.a, p.g)}<path d="M6-24L-12 3H-2L-6 24L14-5H3Z" ${O(p, p.g2)}/>`,
      `<polygon points="${starPts(27, 16, 12)}" ${O(p, p.a)}/><path d="M5-17L-9 2H-1L-4 17L10-3H2Z" ${O(p, p.g)}/>`,
      `<path d="M0-26A26 26 0 1 1-18 19" ${K(p.g, 2.6)}/><g transform="translate(0 8)"><path d="M0 12C-8 6-8-4 0-10C8-4 8 6 0 12Z" ${O(p, p.a)} transform="rotate(-48)"/><path d="M0 12C-8 6-8-4 0-10C8-4 8 6 0 12Z" ${O(p, p.a)} transform="rotate(48)"/><path d="M0 12C-8 6-8-4 0-10C8-4 8 6 0 12Z" ${O(p, p.g)}/></g>${flame(p, 0, -10, .55, p.g2, '#fff')}`,
    ][t],
  },
  flawless_victory: {
    notes: ['Papan target + satu anak panah', 'Target + panah + kilau di cincin', 'Berlian bersisi dalam cincin putus-putus', 'Bintang 8 sudut bercahaya + permata pusat'],
    draw: (t, p) => {
      const tg = `<circle r="22" ${O(p, p.g)}/><circle r="15" ${O(p, p.a)}/><circle r="8" ${O(p, p.g)}/><circle r="3.4" fill="${p.d}"/>`;
      const arrow = `<path d="M3-3L22-22" ${K(p.d, 3.4)}/><path d="M3-3L22-22" ${K(p.g2, 1.8)}/><path d="M17-22L22-22L22-17M13-18L18-18L18-13" ${K(p.a, 2)}/>`;
      return [
        tg + arrow,
        tg + arrow + spark(-22, -18, 4, p.g) + spark(-24, 10, 3, p.g) + spark(20, 18, 3.5, p.g),
        `<circle r="26" ${K(p.g2, 1.6)} stroke-dasharray="4 4"/><path d="M-17-8L-9-19H9L17-8L0 21Z" ${O(p, p.gem)}/><path d="M-17-8H17M-9-19L-4-8L0 21L4-8L9-19" ${K(p.d, 1.1)}/>${spark(-22, -20, 4, p.g)}`,
        `<circle r="27" ${K(p.g2, 1.6)}/><polygon points="${starPts(26, 12, 8)}" ${O(p, p.g2)}/><circle r="10" ${O(p, p.a)}/>${gemShape(p, 0, 0, 7, p.gem)}`,
      ][t];
    },
  },
  star_collector: {
    notes: ['Satu bintang fajar', 'Rasi bintang 3 titik terhubung', 'Galaksi spiral', 'Supernova: bintang besar, sinar & cincin ledakan'],
    draw: (t, p) => {
      const star = (R, x = 0, y = 0, c = p.g2) => `<polygon points="${starPts(R, R * .45)}" ${O(p, c)} transform="translate(${x} ${y})"/>`;
      const arm = off => 'M' + Array.from({ length: 56 }, (_, k) => { const a = k * .3 + off, r = 1.5 + k * .42, [x, y] = [r * Math.cos(a), r * Math.sin(a)]; return `${f2(x)} ${f2(y)}`; }).join('L');
      return [
        star(21) + spark(-22, 16, 4, p.g) + spark(21, -20, 3, p.g),
        `<path d="M-18 14L-2-8L18 6" ${K(p.g2, 1.4)} stroke-dasharray="3 3"/>${star(9, -18, 14)}${star(12, -2, -8)}${star(8, 18, 6)}${spark(8, -22, 3, p.g)}`,
        `<path d="${arm(0)}" ${K(p.a, 3.4)}/><path d="${arm(Math.PI)}" ${K(p.g2, 3.4)}/><circle r="4" fill="${p.g}"/>${spark(-22, -18, 3.5, p.g)}${spark(22, 16, 3.5, p.g)}`,
        `<circle r="25" ${K(p.a, 2)} stroke-dasharray="2 3.4"/>${Array.from({ length: 12 }, (_, i) => { const [x1, y1] = polar(14, i * 30), [x2, y2] = polar(i % 2 ? 22 : 27, i * 30); return `<path d="M${f2(x1)} ${f2(y1)}L${f2(x2)} ${f2(y2)}" ${K(p.g, 2)}/>`; }).join('')}${star(15, 0, 0, p.g)}${gemShape(p, 0, 0, 5, p.gem)}`,
      ][t];
    },
  },
  critical_reflexes: {
    notes: ['Satu petir', 'Awan badai + petir', 'Komet berekor', 'Roket melaju dengan gelombang suara'],
    draw: (t, p) => [
      `<path d="M5-26L-13 3H-2L-6 26L14-5H3Z" ${O(p, p.g2)}/>`,
      `${cloud(p, p.g)}<path d="M5 4L-6 17H0L-4 27L9 13H3Z" ${O(p, p.g2, 1.3)}/>`,
      `<path d="M8-8L-26 6L-22 12Z" ${O(p, p.a, 1.2)}/><path d="M8-8L-22-14L-16-6Z" ${O(p, p.g2, 1.2)}/><path d="M8-8L-10 22L-2 20Z" ${O(p, p.a, 1.2)}/><circle cx="10" cy="-8" r="10" ${O(p, p.g)}/><circle cx="7" cy="-11" r="3" fill="#fff" opacity=".8"/>`,
      `<g transform="rotate(32)"><path d="M0-27C9-17 9 1 7 12H-7C-9 1-9-17 0-27Z" ${O(p, p.g)}/><circle cy="-8" r="4" ${O(p, p.gem, 1.3)}/><path d="M-7 4L-15 17L-7 13Z" ${O(p, p.a)}/><path d="M7 4L15 17L7 13Z" ${O(p, p.a)}/>${flame(p, 0, 12, .55, '#fb923c', '#fde047', -1)}</g><path d="M-24-14A22 22 0 0 0-24 8" ${K(p.g2, 2)}/><path d="M-19-9A14 14 0 0 0-19 3" ${K(p.g, 2)}/>`,
    ][t],
  },
  spaced_repetition: {
    notes: ['Buku catatan + centang + pensil', 'Bola lampu ide menyala', 'Otak + roda gigi baja', 'Otak bercahaya tanpa celah dalam cincin sinar'],
    draw: (t, p) => [
      `<rect x="-14" y="-20" width="28" height="40" rx="3.5" ${O(p, p.g)}/><path d="M-6-9H8M-6-2H8M-6 5H4" ${K(p.d, 1.4)}/><path d="M-5 12L-1 16L7 8" ${K('#16a34a', 2.4)}/>${[-14, -6, 2, 10].map(y => `<circle cx="-14" cy="${y}" r="2.2" ${O(p, p.a, 1)}/>`).join('')}<path d="M10 20L22-4" ${K(p.d, 5)}/><path d="M10 20L22-4" ${K(p.g2, 2.6)}/>`,
      `<circle cy="-6" r="14" ${O(p, '#fde047')}/><path d="M-6 6H6V13H-6Z" ${O(p, p.g2, 1.3)}/><path d="M-5 17H5" ${K(p.d, 2.4)}/><path d="M-5-9C-3-13 3-13 5-9" ${K('#fff', 2)} opacity=".7"/>${[-150, -90, -30].map(a => { const [x1, y1] = polar(18, a), [x2, y2] = polar(25, a); return `<path d="M${f2(x1)} ${f2(y1 - 6)}L${f2(x2)} ${f2(y2 - 6)}" ${K(p.g, 2)}/>`; }).join('')}`,
      `${brain(p, '#f9a8d4')}<g transform="translate(15 15)">${gear(p, 5.2, 8, p.g2)}</g>`,
      `${Array.from({ length: 14 }, (_, i) => { const [x1, y1] = polar(21, i * 360 / 14), [x2, y2] = polar(i % 2 ? 25 : 28, i * 360 / 14); return `<path d="M${f2(x1)} ${f2(y1)}L${f2(x2)} ${f2(y2)}" ${K(p.g, 1.8)}/>`; }).join('')}<g transform="scale(.86)">${brain(p, p.gem)}</g>${spark(0, -2, 5, '#fff')}`,
    ][t],
  },
  dex_completer: {
    notes: ['Buku terbuka', 'Buku + kaca pembesar', 'Gulungan kuno bersegel lilin', 'Tumpukan 3 buku + bintang bersinar'],
    draw: (t, p) => {
      const book = `<path d="M0-14C-8-18-18-18-24-15V14C-18 11-8 11 0 15Z" ${O(p, p.g)}/><path d="M0-14C8-18 18-18 24-15V14C18 11 8 11 0 15Z" ${O(p, p.g2)}/><path d="M-20-9C-14-10-8-9-4-7M-20-3C-14-4-8-3-4-1M20-9C14-10 8-9 4-7M20-3C14-4 8-3 4-1" ${K(p.d, 1.1)}/>`;
      return [
        `<g transform="scale(1.05)">${book}</g>`,
        `<g transform="translate(-3 -3) scale(.88)">${book}</g><circle cx="10" cy="9" r="9" ${O(p, 'rgba(186,230,253,.55)', 1.6)} stroke-width="3.4"/><path d="M17 16L26 25" ${K(p.d, 5.4)}/><path d="M17 16L26 25" ${K(p.a, 2.6)}/>`,
        `<rect x="-15" y="-19" width="30" height="38" rx="3" ${O(p, p.g)}/><rect x="-18" y="-23" width="36" height="7" rx="3.5" ${O(p, p.g2)}/><rect x="-18" y="16" width="36" height="7" rx="3.5" ${O(p, p.g2)}/><path d="M-9-9H9M-9-3H9M-9 3H3" ${K(p.d, 1.3)}/><circle cx="8" cy="10" r="5.5" ${O(p, '#e11d48', 1.2)}/><polygon points="${starPts(3, 1.3)}" fill="#fff" transform="translate(8 10)"/>`,
        `<rect x="-22" y="8" width="44" height="9" rx="2" ${O(p, p.a)}/><rect x="-18" y="-1" width="36" height="9" rx="2" ${O(p, p.g2)}/><rect x="-14" y="-10" width="28" height="9" rx="2" ${O(p, p.g)}/><path d="M-16 12.5H16M-12 3.5H12M-8-5.5H8" ${K(p.d, 1.1)}/><polygon points="${starPts(10, 4.5)}" ${O(p, p.gem)} transform="translate(0 -20)"/>${spark(-20, -20, 4, p.g)}${spark(20, -18, 3.5, p.g)}`,
      ][t];
    },
  },
  campaign_pathfinder: {
    notes: ['Kompas sederhana', 'Peta lipat + jalur putus-putus + tanda X', 'Benteng dengan menara & bendera', 'Dunia bercincin dengan bendera di kutub'],
    draw: (t, p) => [
      `<circle r="22" ${O(p, p.g2)}/><circle r="16.5" ${O(p, p.g, 1.2)}/><path d="M0-14L5 0L0 14L-5 0Z" fill="${p.d}" transform="rotate(35)"/><path d="M0-14L5 0H-5Z" fill="#e11d48" transform="rotate(35)"/><circle r="2" fill="${p.g2}"/>`,
      `<path d="M-24-14L-8-19L8-14L24-19V16L8 21L-8 16L-24 21Z" ${O(p, p.g)}/><path d="M-8-19V16M8-14V21" ${K(p.d, 1)} opacity=".5"/><path d="M-17 10C-8 14-4-2 4 4S12-6 16-8" ${K(p.a, 2)} stroke-dasharray="3 3"/><path d="M12-12L20-4M20-12L12-4" ${K('#e11d48', 2.6)}/>`,
      `<rect x="-20" y="-4" width="40" height="24" ${O(p, p.g)}/><rect x="-24" y="-16" width="13" height="36" ${O(p, p.g2)}/><rect x="11" y="-16" width="13" height="36" ${O(p, p.g2)}/><rect x="-7" y="-24" width="14" height="44" ${O(p, p.g)}/>${[-24, -18, -12, 11, 17].map(x => `<rect x="${x}" y="-20" width="4" height="5" fill="${p.d}"/>`).join('')}${[-7, -1, 4].map(x => `<rect x="${x}" y="-28" width="3.4" height="5" fill="${p.d}"/>`).join('')}<path d="M-5 20V9C-5 3 5 3 5 9V20Z" fill="${p.d}"/>${flag(p, 0, -28, '#e11d48')}`,
      `<circle r="20" ${O(p, p.gem)}/><ellipse rx="8" ry="20" ${K(p.d, 1.1)}/><path d="M-20 0H20M-17-9H17M-17 9H17" ${K(p.d, 1.1)}/><path d="M-12-8C-6-14-2-8-6-2C-10 0-14-2-12-8ZM6 2C12 0 16 6 10 13C6 10 2 6 6 2Z" fill="${p.g}" opacity=".9"/><ellipse rx="27" ry="7" transform="rotate(-24)" ${K(p.g2, 2.4)}/>${flag(p, 0, -17, '#e11d48')}`,
    ][t],
  },
  fashion_trendsetter: {
    notes: ['Topi tinggi rapi', 'Kimono berobi', 'Jubah dengan bros permata', 'Turban maharaja berbulu & permata'],
    draw: (t, p) => [
      `<ellipse cy="14" rx="23" ry="5.5" ${O(p, p.g2)}/><path d="M-13 14V-14C-13-18 13-18 13-14V14Z" ${O(p, p.g)}/><path d="M-13 3H13V9H-13Z" ${O(p, p.a, 1.3)}/><ellipse cy="-14" rx="13" ry="3" ${O(p, p.g2, 1.2)}/>`,
      `<path d="M-12-20H12L14-8L24-4V12H14V22H-14V12H-24V-4L-14-8Z" ${O(p, p.g)}/><path d="M-6-20L0-6L6-20" ${K(p.a, 3)}/><rect x="-14" y="3" width="28" height="8" ${O(p, p.a, 1.3)}/><circle cy="7" r="4" ${O(p, p.g2, 1.2)}/>`,
      `<path d="M-18-18C-8-23 8-23 18-18L25 21C10 25-10 25-25 21Z" ${O(p, p.a)}/><path d="M-18-18C-8-12 8-12 18-18" ${K(p.g, 3.4)}/><path d="M-12-10L-14 21M12-10L14 21M0-4V23" ${K(p.d, 1)} opacity=".35"/><path d="M-9-13Q0-6 9-13" ${K(p.g2, 1.4)}/>${gemShape(p, 0, -9, 6, p.gem)}`,
      `<path d="M-18 9C-21-12-8-21 0-21C8-21 21-12 18 9Z" ${O(p, p.g)}/><path d="M-17 2C-6-6 6-6 17 2M-19-5C-6-14 6-14 19-5" ${K(p.g2, 2)}/><rect x="-18" y="8" width="36" height="7" rx="2" ${O(p, p.a)}/><path d="M3-8C8-24 18-26 23-23C19-17 11-11 7-5Z" ${O(p, p.gem)}/>${gemShape(p, 0, -3, 6, p.g2)}${spark(-20, -20, 4, p.g)}`,
    ][t],
  },
  coin_tycoon: {
    notes: ['Satu koin bercap bintang', 'Kantung uang', 'Peti harta dengan koin menyembur', 'Balai istana bertiang dengan koin di atap'],
    draw: (t, p) => {
      const coin = (x, y, r) => `<g transform="translate(${x} ${y})"><circle r="${r}" ${O(p, p.g2)}/><circle r="${f2(r * .72)}" ${K(p.d, 1.1)}/><polygon points="${starPts(r * .5, r * .22)}" fill="${p.a}"/></g>`;
      return [
        coin(0, 0, 21) + spark(-22, -18, 4, p.g),
        `<path d="M-8-20L-12-14H12L8-20Z" ${O(p, p.g2)}/><path d="M-12-14C-26-2-22 20 0 20C22 20 26-2 12-14Z" ${O(p, p.g)}/><path d="M-11-14H11" ${K(p.a, 3)}/>${coin(0, 4, 8.5)}`,
        `<path d="M-22-2C-22-18 22-18 22-2Z" ${O(p, p.a)}/><rect x="-22" y="-2" width="44" height="21" rx="2" ${O(p, p.g)}/><path d="M-12-14V19M12-14V19" ${K(p.d, 2.4)}/>${gemShape(p, 0, 2, 5.5, p.gem)}${coin(-9, -22, 4.6)}${coin(2, -25, 4.6)}${coin(11, -21, 4.6)}`,
        `<path d="M-25-8L0-25L25-8Z" ${O(p, p.g2)}/><circle cy="-13" r="4.6" ${O(p, p.gem, 1.2)}/><rect x="-25" y="-8" width="50" height="5" ${O(p, p.g)}/>${[-17.5, -6, 6, 17.5].map(x => `<rect x="${x - 3}" y="-3" width="6" height="20" ${O(p, p.g, 1.2)}/>`).join('')}<rect x="-26" y="17" width="52" height="4" ${O(p, p.g2)}/><rect x="-29" y="21" width="58" height="4" ${O(p, p.a)}/>`,
      ][t];
    },
  },
  skill_strategist: {
    notes: ['Botol ramuan bergelembung', 'Topi penyihir berbintang', 'Bola kristal di penyangga', 'Tongkat sihir bintang + cincin rune'],
    draw: (t, p) => [
      `<rect x="-4.6" y="-26" width="9.2" height="5" rx="1.5" ${O(p, p.a, 1.3)}/><path d="M-5-21H5V-10L16 12C18 20 12 22 8 22H-8C-12 22-18 20-16 12L-5-10Z" ${O(p, 'rgba(255,255,255,.35)')}/><path d="M-12 6L12 6L16 12C18 20 12 22 8 22H-8C-12 22-18 20-16 12Z" fill="${p.a}"/><circle cx="-3" cy="12" r="2.4" fill="#fff" opacity=".7"/><circle cx="5" cy="15" r="1.8" fill="#fff" opacity=".7"/>`,
      `<path d="M0-26C3-14 10-5 18 9H-18C-10-5-3-14 0-26Z" ${O(p, p.a)}/><ellipse cy="10" rx="25" ry="6" ${O(p, p.g2)}/><path d="M-13 3C-5 6 5 6 13 3" ${K(p.g, 3)}/><polygon points="${starPts(5, 2.2)}" ${O(p, p.g, 1)} transform="translate(0 -6)"/>`,
      `<path d="M-13 23L-8 12H8L13 23Z" ${O(p, p.g2)}/><circle cy="-4" r="17" ${O(p, p.gem)}/><path d="M-9-11C-6-15 0-16 3-14" ${K('#fff', 2.4)} opacity=".7"/>${spark(2, -2, 6, '#fff')}${spark(-6, 4, 3, p.g)}`,
      `<circle r="26" ${K(p.g2, 1.6)} stroke-dasharray="3 4"/><g transform="rotate(45)"><rect x="-2.6" y="-8" width="5.2" height="34" rx="2" ${O(p, p.a)}/><rect x="-2.6" y="-8" width="5.2" height="6" ${O(p, p.g, 1)}/></g><polygon points="${starPts(11, 4.8)}" ${O(p, p.g)} transform="translate(-9 -9)"/>${spark(12, -17, 4, p.g)}${spark(18, 6, 3, p.gem)}${spark(-18, 14, 3, p.gem)}`,
    ][t],
  },
  skill_forge_master: {
    notes: ['1 permata rune besar', 'Piramida 3 permata', 'Piramida 6 permata', 'Piramida 10 permata berwarna + bintang puncak'],
    draw: (t, p) => {
      const rows = t + 1, r = [10.5, 8.4, 6.9, 5.8][t], dx = r * 1.95, dy = r * 1.72, total = (rows - 1) * dy, y0 = -total / 2 + (t === 3 ? 5 : 0);
      let s = '', k = 0;
      for (let i = 0; i < rows; i++) for (let j = 0; j <= i; j++) {
        const x = (j - i / 2) * dx, y = y0 + i * dy;
        s += hexGem(p, x, y, r, t === 3 ? ELEM[k % 10] : (k % 2 ? p.g2 : p.gem)); k++;
      }
      return (t === 3 ? `<polygon points="${starPts(7, 3)}" ${O(p, p.g)} transform="translate(0 -23)"/>` : '') + s;
    },
  },
  pvp_gladiator: {
    notes: ['Helm gladiator berjambul', 'Perisai bundar berbintang', 'Piala juara', 'Helm bersayap berjambul api'],
    draw: (t, p) => [
      helmet(p, p.a),
      `<circle r="21" ${O(p, p.g2)}/><circle r="16" ${O(p, p.a, 1.3)}/><path d="M0-16V16M-16 0H16" ${K(p.d, 1.4)} opacity=".5"/><polygon points="${starPts(9, 4)}" ${O(p, p.g)}/><circle r="3" fill="${p.d}"/>`,
      `<path d="M-14-18H14V-6C14 4 8 10 0 10C-8 10-14 4-14-6Z" ${O(p, p.g2)}/><path d="M-14-14C-24-14-24-2-13 0M14-14C24-14 24-2 13 0" ${K(p.g2, 3.4)}/><path d="M-14-14C-24-14-24-2-13 0M14-14C24-14 24-2 13 0" ${K(p.d, .9)}/><rect x="-3" y="10" width="6" height="8" ${O(p, p.g)}/><rect x="-10" y="18" width="20" height="6" rx="1.5" ${O(p, p.a)}/><polygon points="${starPts(7, 3)}" ${O(p, p.g)} transform="translate(0 -6)"/>`,
      `${wingPair(-13, 0, 0, 4, 20, 4.6, -12, 62, [p.g2, p.g], p.d)}<g transform="scale(.9)">${helmet(p, '#fb923c')}</g>${flame(p, 0, -24, .5, '#fde047', '#fff')}`,
    ][t],
  },
  unstoppable_duelist: {
    notes: ['3 chevron kemenangan', 'Chevron diapit dua api', 'Chevron + bintang + sinar ledakan', 'Chevron + mahkota + sayap'],
    draw: (t, p) => {
      const chev = y => `<path d="M-19 ${y + 6}L0 ${y - 7}L19 ${y + 6}V${y + 12}L0 ${y - 1}L-19 ${y + 12}Z" ${O(p, y > 5 ? p.g2 : y > -5 ? p.g : p.a, 1.4)}/>`;
      const ch = chev(10) + chev(0) + chev(-10);
      return [
        `<g transform="translate(0 4)">${ch}</g>`,
        `${flame(p, -21, 4, .85, p.a, p.g)}${flame(p, 21, 4, .85, p.a, p.g)}<g transform="translate(0 4)">${ch}</g>`,
        `${Array.from({ length: 12 }, (_, i) => { const [x1, y1] = polar(14, i * 30), [x2, y2] = polar(27, i * 30); return `<path d="M${f2(x1)} ${f2(y1 + 2)}L${f2(x2)} ${f2(y2 + 2)}" ${K(p.g2, 1.6)} opacity=".7"/>`; }).join('')}<g transform="translate(0 8)">${ch}</g><polygon points="${starPts(8, 3.6)}" ${O(p, p.g)} transform="translate(0 -17)"/>`,
        `${wingPair(-14, 4, 0, 4, 16, 3.8, -5, 65, [p.g2, p.g], p.d)}<g transform="translate(0 9)">${ch}</g>${crown(p, 0, -24, 22, 12, 3, p.gem)}`,
      ][t];
    },
  },
  daily_dedication: {
    notes: ['Kalender: 3 hari tercentang', 'Kalender: 7 hari + pita bintang', 'Jam pasir berpasir', 'Jam pasir permata dalam cincin kekal'],
    draw: (t, p) => {
      const cal = n => {
        let s = `<rect x="-19" y="-15" width="38" height="36" rx="4" ${O(p, p.g)}/><path d="M-19-15H19V-7H-19Z" ${O(p, p.a, 1.4)}/><rect x="-11" y="-20" width="3.6" height="9" rx="1.8" ${O(p, p.g2, 1.2)}/><rect x="7.4" y="-20" width="3.6" height="9" rx="1.8" ${O(p, p.g2, 1.2)}/>`;
        for (let i = 0; i < 8; i++) { const x = -12.5 + (i % 4) * 8.4, y = i < 4 ? 2 : 13; s += `<circle cx="${f2(x)}" cy="${y}" r="3" ${i < n ? O(p, '#22c55e', 1) : K(p.d, 1)}/>`; }
        return s;
      };
      const hg = sand => `<path d="M-11-17H11C11-6 3-2 3 0C3 2 11 6 11 17H-11C-11 6-3 2-3 0C-3-2-11-6-11-17Z" ${O(p, 'rgba(255,255,255,.3)')}/><path d="M-8-14H8C8-8 3-4 0-1C-3-4-8-8-8-14Z" fill="${sand}"/><path d="M-8 15C-6 8-2 6 0 6C2 6 6 8 8 15Z" fill="${sand}"/><rect x="-15" y="-22" width="30" height="5" rx="2" ${O(p, p.a)}/><rect x="-15" y="17" width="30" height="5" rx="2" ${O(p, p.a)}/>`;
      return [
        cal(3),
        cal(7) + `<polygon points="${starPts(7, 3)}" ${O(p, p.g2)} transform="translate(17 -17)"/>`,
        hg(p.g2),
        `<circle r="27" ${K(p.g2, 1.6)} stroke-dasharray="3 4"/>${hg(p.gem)}${spark(-22, -14, 4, p.g)}${spark(22, 14, 4, p.g)}`,
      ][t];
    },
  },
  ascendant_level: {
    notes: ['Bukit kecil + bendera', 'Gunung tinggi + bendera', 'Dua puncak + bendera + bintang', 'Puncak tertinggi: bendera, mahkota, sinar fajar'],
    draw: (t, p) => {
      const h = [8, 16, 20, 22][t];
      return [
        mountain(p, h) + flag(p, -3, -h, '#e11d48'),
        mountain(p, h) + flag(p, -3, -h, '#e11d48'),
        mountain(p, h) + flag(p, -3, -h, '#e11d48') + `<polygon points="${starPts(6, 2.6)}" ${O(p, p.g)} transform="translate(-3 ${-h - 22})"/>`,
        Array.from({ length: 9 }, (_, i) => { const [x2, y2] = polar(30, -160 + i * 17.5); return `<path d="M-3 ${-h}L${f2(x2 - 3)} ${f2(y2 - h + 6)}" ${K(p.g2, 1.4)} opacity=".6"/>`; }).join('') + mountain(p, h) + flag(p, -3, -h, '#e11d48') + crown(p, -3, -h - 28, 14, 8, 3, p.gem),
      ][t];
    },
  },
};

const CATEGORIES = Object.keys(EMBLEMS);

const lockIcon = p => `<path d="M-9-2V-9C-9-18 9-18 9-9V-2" ${K(p.g, 4)}/><rect x="-13" y="-3" width="26" height="22" rx="4" ${O(p, p.g2, 1.6)}/><circle cy="7" r="3" fill="${p.d}"/><rect x="-1.3" y="8" width="2.6" height="6" fill="${p.d}"/>`;

/* ───────── Frame per tier ───────── */
let _uid = 0;
const hexPts = (cx, cy, R, rot = -90) => pts(Array.from({ length: 6 }, (_, i) => polar(R, rot + i * 60)).map(([x, y]) => [x + cx, y + cy]));
const SHIELD = 'M64 15C74 20 88 22 101 22V60C101 86 84 102 64 111C44 102 27 86 27 60V22C40 22 54 20 64 15Z';
const sc = (cx, cy, s) => `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`;

function parseBadgeId(id, fallbackTier = "common") {
  if (!id || typeof id !== "string") throw new Error("ID lencana tidak valid: " + id);
  const cleanId = id.trim();
  const m = /^(.*)_(common|rare|epic|legend)$/i.exec(cleanId);
  if (m) {
    const cat = m[1].toLowerCase();
    const tier = m[2].toLowerCase();
    if (!EMBLEMS[cat]) throw new Error("Kategori lencana tidak dikenal: " + cat);
    return { cat, tier, t: TIERS.indexOf(tier) };
  }
  // Fallback jika hanya diberi nama kategori / family
  const cat = cleanId.toLowerCase();
  const tier = (fallbackTier || "common").toLowerCase();
  if (EMBLEMS[cat] && TIERS.includes(tier)) {
    return { cat, tier, t: TIERS.indexOf(tier) };
  }
  throw new Error("ID lencana tidak dikenal: " + id);
}

function badgeSVG(id, { size = 96, locked = false, animate = true, title = '' } = {}) {
  const { cat, tier, t } = parseBadgeId(id);
  const p = locked ? PAL.locked : PAL[tier];
  const u = 'ba' + (++_uid).toString(36);
  const an = (cls, extra = '') => (animate && !locked ? ` class="${cls}"${extra}` : '');
  const cy = t === 3 ? 64 : 62, cx = 64;
  const rimStops = p.rim.map((c, i) => `<stop offset="${f2(i / (p.rim.length - 1))}" stop-color="${c}"/>`).join('');
  const defs = `<linearGradient id="${u}r" x1="0" y1="0" x2="1" y2="1">${rimStops}</linearGradient>` +
    `<radialGradient id="${u}f" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="${p.face[0]}"/><stop offset="1" stop-color="${p.face[1]}"/></radialGradient>` +
    `<linearGradient id="${u}g" x1="0" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="${u}w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${p.a}"/><stop offset="1" stop-color="${p.g2}"/></linearGradient>` +
    `<radialGradient id="${u}a"><stop offset=".45" stop-color="${p.a}" stop-opacity=".55"/><stop offset="1" stop-color="${p.a}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${u}n" cx=".3" cy=".7" r=".8"><stop offset="0" stop-color="#22d3ee" stop-opacity=".5"/><stop offset=".6" stop-color="#a855f7" stop-opacity=".35"/><stop offset="1" stop-color="#a855f7" stop-opacity="0"/></radialGradient>`;

  const faceEl = (attrs, r = 33) => [
    `<circle cx="${cx}" cy="${cy}" r="${r}" ${attrs}/>`,
    `<polygon points="${hexPts(cx, cy, r + 1)}" ${attrs}/>`,
    `<path d="${SHIELD}" transform="${sc(cx, cy, .84)}" ${attrs}/>`,
    `<circle cx="${cx}" cy="${cy}" r="${r + 1}" ${attrs}/>`,
  ][t];

  const r = (t === 3) ? rng(7 + CATEGORIES.indexOf(cat) * 13) : null;
  let back = '', mid = '', front = '';
  const shadow = `<ellipse cx="64" cy="122" rx="${t === 3 ? 34 : 28}" ry="3.4" fill="#000" opacity=".22"/>`;

  if (t === 0) {
    mid = `<circle cx="${cx}" cy="${cy}" r="41" fill="url(#${u}r)" stroke="${p.d}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="35.5" fill="none" stroke="${p.d}" stroke-opacity=".45" stroke-width="1.6"/>`;
  } else if (t === 1) {
    back = `<path d="M46 94L62 100L56 124L51 117L44 119Z" fill="${p.a}" stroke="${p.d}" stroke-width="1.6" stroke-linejoin="round"/><path d="M82 94L66 100L72 124L77 117L84 119Z" fill="${p.a}" stroke="${p.d}" stroke-width="1.6" stroke-linejoin="round"/>`;
    mid = `<polygon points="${hexPts(cx, cy, 43)}" fill="url(#${u}r)" stroke="${p.d}" stroke-width="2" stroke-linejoin="round"/><polygon points="${hexPts(cx, cy, 37.5)}" fill="none" stroke="${p.d}" stroke-opacity=".45" stroke-width="1.6" stroke-linejoin="round"/>`;
    front = Array.from({ length: 6 }, (_, i) => { const [x, y] = polar(43, -90 + i * 60); return i === 0 ? gemShape(p, cx, f2(cy - 43), 6.2, p.gem) : `<circle cx="${f2(cx + x)}" cy="${f2(cy + y)}" r="3" ${O(p, p.g2, 1.1)}/>`; }).join('');
  } else if (t === 2) {
    back = `<path d="M17 88H111L104 100L111 112H17L24 100Z" fill="${p.a}" stroke="${p.d}" stroke-width="1.8" stroke-linejoin="round"/><path d="M17 88H111" stroke="${p.g2}" stroke-width="1.6" fill="none"/>` +
      [1, -1].map(s => { const tr = s === 1 ? '' : 'translate(128 0) scale(-1 1)'; let l = ''; for (let i = 0; i < 7; i++) { const a = 118 + i * 17, [x, y] = polar(47, a), tan = a + 90; const nx = Math.cos(a * Math.PI / 180), ny = Math.sin(a * Math.PI / 180); l += `<ellipse cx="${f2(cx + x + nx * 4)}" cy="${f2(cy + y + ny * 4)}" rx="7" ry="3" transform="rotate(${f2(tan + 28)} ${f2(cx + x + nx * 4)} ${f2(cy + y + ny * 4)})" ${O(p, p.g2, 1)}/><ellipse cx="${f2(cx + x - nx * 4)}" cy="${f2(cy + y - ny * 4)}" rx="7" ry="3" transform="rotate(${f2(tan - 28)} ${f2(cx + x - nx * 4)} ${f2(cy + y - ny * 4)})" ${O(p, p.g, 1)}/>`; } return `<g transform="${tr}">${l}</g>`; }).join('');
    mid = `<path d="${SHIELD}" fill="url(#${u}r)" stroke="${p.d}" stroke-width="2" stroke-linejoin="round"/><path d="${SHIELD}" transform="${sc(cx, cy, .91)}" fill="none" stroke="${p.d}" stroke-opacity=".45" stroke-width="1.6"/>`;
    front = crown(p, 64, 3, 32, 17, 3, p.gem) + gemShape(p, 64, 100, 6.4, p.gem);
  } else {
    back = `<circle cx="64" cy="64" r="62" fill="url(#${u}a)"${an('ba-pulse')}/>` +
      `<g${an('ba-spin')} opacity=".55">${Array.from({ length: 16 }, (_, i) => { const [x1, y1] = polar(60, i * 22.5 - 4), [x2, y2] = polar(60, i * 22.5 + 4); return `<polygon points="64,64 ${f2(64 + x1)},${f2(64 + y1)} ${f2(64 + x2)},${f2(64 + y2)}" fill="${i % 2 ? p.g2 : p.a}" opacity=".5"/>`; }).join('')}</g>` +
      wingPair(40, 58, 128, 6, 38, 7.4, -14, 76, [`url(#${u}w)`, p.g2], p.d) +
      `<path d="M16 96H112L105 107L112 118H16L23 107Z" fill="${p.face[1]}" stroke="${p.g2}" stroke-width="1.8" stroke-linejoin="round"/>`;
    mid = `<circle cx="${cx}" cy="${cy}" r="42" fill="url(#${u}r)" stroke="${p.d}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="37.2" fill="none" stroke="${p.g2}" stroke-width="1.6"/>`;
    front = Array.from({ length: 12 }, (_, i) => { const [x, y] = polar(39.8, i * 30 - 90); return gemShape(p, f2(cx + x), f2(cy + y), 2.9, i % 2 ? '#67e8f9' : '#fde68a'); }).join('') +
      crown(p, 64, 2, 38, 21, 5, p.gem) +
      [[14, 28, 6], [114, 26, 5], [18, 108, 4], [112, 104, 5]].map(([x, y, s], i) => `<g${an('ba-tw', ` style="animation-delay:${i * .6}s"`)}>${spark(x, y, s, '#fff')}</g>`).join('');
  }

  // isi wajah medali
  let face = faceEl(`fill="url(#${u}f)"`);
  if (t === 3 && !locked) {
    face += `<g clip-path="url(#${u}c)"><circle cx="${cx}" cy="${cy}" r="40" fill="url(#${u}n)"/>` +
      Array.from({ length: 22 }, () => { const a = r() * 6.283, d = Math.sqrt(r()) * 32; return `<circle cx="${f2(cx + d * Math.cos(a))}" cy="${f2(cy + d * Math.sin(a))}" r="${f2(.5 + r() * 1.1)}" fill="#fff" opacity="${f2(.5 + r() * .5)}"/>`; }).join('') + `</g>`;
  }
  const es = [.88, .88, .8, .9][t];
  const emblem = locked ? lockIcon(p) : EMBLEMS[cat].draw(t, p);
  const emblemG = `<g transform="translate(${cx} ${cy + (t === 2 ? -2 : 0)}) scale(${locked ? .9 : es})">${emblem}</g>`;
  const gloss = faceEl(`fill="url(#${u}g)"`);
  const sheen = (t >= 2 && !locked) ? `<g clip-path="url(#${u}c)"><g${an('ba-sheen', ' opacity="0"')}><rect x="-30" y="0" width="14" height="128" fill="#fff" opacity=".45" transform="rotate(20 64 64)"/></g></g>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="ba-badge ba-${tier}${locked ? ' ba-locked' : ''}" viewBox="0 0 128 128" width="${size}" height="${size}" role="img" aria-label="${title || id}"><defs>${defs}<clipPath id="${u}c">${faceEl('')}</clipPath></defs>${title ? `<title>${title}</title>` : ''}${shadow}${back}${mid}${face}${emblemG}${gloss}${sheen}${front}</svg>`;
  return svg;
}


  
function renderBadge(familyOrBadgeId, tierOrOptions = {}, maybeOptions = {}) {
  let badgeId = familyOrBadgeId;
  let options = {};
  if (typeof tierOrOptions === "string") {
    const tStr = tierOrOptions.toLowerCase();
    const hasTierSuffix = /_(common|rare|epic|legend)$/i.test(familyOrBadgeId || "");
    badgeId = hasTierSuffix ? familyOrBadgeId : `${familyOrBadgeId}_${tStr}`;
    options = Object.assign({}, maybeOptions);
  } else if (typeof tierOrOptions === "object" && tierOrOptions !== null) {
    options = Object.assign({}, tierOrOptions);
  }
  try {
    return badgeSVG(badgeId, options);
  } catch (err) {
    console.warn("BadgeArt render fallback for:", familyOrBadgeId, err.message);
    const size = options.size || 48;
    const icon = options.icon || "🏅";
    return `<span class="ba-fallback" style="font-size:${Math.round(size * 0.58)}px;display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;line-height:1">${icon}</span>`;
  }
}


  return {
    TIERS,
    PAL,
    EMBLEMS,
    CATEGORIES,
    parseBadgeId,
    badgeSVG,
    renderBadge
  };
}));
