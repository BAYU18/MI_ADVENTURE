// shared/monsters.js — Katalog 100 monster + renderer SVG (UMD: Node & browser)
// Sesuai Part I §9 dokumen spesifikasi (data final, jangan diacak ulang).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Monsters = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const THEMES = [
    { id: 'hutan', label: 'Hutan Rimba' },
    { id: 'rawa', label: 'Rawa Lendir' },
    { id: 'gua', label: 'Gua Kristal' },
    { id: 'api', label: 'Gunung Api' },
    { id: 'es', label: 'Negeri Es' },
    { id: 'laut', label: 'Laut Dalam' },
    { id: 'langit', label: 'Kerajaan Awan' },
    { id: 'hantu', label: 'Malam Misteri' },
    { id: 'mesin', label: 'Pabrik Robot' },
    { id: 'manis', label: 'Pesta Manis' },
  ];

  const MONSTERS = [
    { id: 1, name: 'Lumutra', theme: 'hutan', body: 'ghost', head: 'ears', eyes: 'sleepy', mouth: 'open', extra: 'none', color: [116, 62, 48] },
    { id: 2, name: 'Akarok', theme: 'hutan', body: 'square', head: 'unicorn', eyes: 'two', mouth: 'fangs', extra: 'wings', color: [123, 62, 56] },
    { id: 3, name: 'Jamurgon', theme: 'hutan', body: 'slime', head: 'none', eyes: 'one', mouth: 'open', extra: 'none', color: [130, 62, 64] },
    { id: 4, name: 'Kayubuk', theme: 'hutan', body: 'blob', head: 'unicorn', eyes: 'sleepy', mouth: 'fangs', extra: 'belly', color: [137, 62, 52] },
    { id: 5, name: 'Daunjir', theme: 'hutan', body: 'egg', head: 'unicorn', eyes: 'sleepy', mouth: 'fangs', extra: 'arms', color: [144, 62, 60] },
    { id: 6, name: 'Burunggar', theme: 'hutan', body: 'octopus', head: 'none', eyes: 'four', mouth: 'zigzag', extra: 'wings', color: [116, 62, 48] },
    { id: 7, name: 'Sulurkan', theme: 'hutan', body: 'round', head: 'crown', eyes: 'two', mouth: 'tongue', extra: 'tail', color: [123, 62, 56] },
    { id: 8, name: 'Rimbazo', theme: 'hutan', body: 'spiky', head: 'horns', eyes: 'one', mouth: 'fangs', extra: 'tail', color: [130, 62, 64] },
    { id: 9, name: 'Beringkus', theme: 'hutan', body: 'round', head: 'unicorn', eyes: 'two', mouth: 'smile', extra: 'spots', color: [137, 62, 52] },
    { id: 10, name: 'Tupaiju', theme: 'hutan', body: 'egg', head: 'antennae', eyes: 'one', mouth: 'zigzag', extra: 'none', color: [144, 62, 60] },
    { id: 11, name: 'Slimbul', theme: 'rawa', body: 'blob', head: 'ears', eyes: 'four', mouth: 'open', extra: 'cheeks', color: [61, 70, 48] },
    { id: 12, name: 'Lendirot', theme: 'rawa', body: 'ghost', head: 'ears', eyes: 'angry', mouth: 'smile', extra: 'belly', color: [68, 70, 56] },
    { id: 13, name: 'Gelatok', theme: 'rawa', body: 'octopus', head: 'mohawk', eyes: 'two', mouth: 'smile', extra: 'stripes', color: [75, 70, 64] },
    { id: 14, name: 'Becekon', theme: 'rawa', body: 'slime', head: 'horns', eyes: 'angry', mouth: 'fangs', extra: 'arms', color: [82, 70, 52] },
    { id: 15, name: 'Lumpurra', theme: 'rawa', body: 'square', head: 'spikes', eyes: 'one', mouth: 'fangs', extra: 'belly', color: [89, 70, 60] },
    { id: 16, name: 'Kodokzilla', theme: 'rawa', body: 'egg', head: 'ears', eyes: 'one', mouth: 'smile', extra: 'spots', color: [61, 70, 48] },
    { id: 17, name: 'Cacingar', theme: 'rawa', body: 'spiky', head: 'antennae', eyes: 'two', mouth: 'smile', extra: 'spots', color: [68, 70, 56] },
    { id: 18, name: 'Gelembus', theme: 'rawa', body: 'round', head: 'none', eyes: 'four', mouth: 'tongue', extra: 'cheeks', color: [75, 70, 64] },
    { id: 19, name: 'Rawagon', theme: 'rawa', body: 'slime', head: 'unicorn', eyes: 'one', mouth: 'zigzag', extra: 'arms', color: [82, 70, 52] },
    { id: 20, name: 'Ingusaur', theme: 'rawa', body: 'ghost', head: 'none', eyes: 'one', mouth: 'fangs', extra: 'none', color: [89, 70, 60] },
    { id: 21, name: 'Kristalor', theme: 'gua', body: 'blob', head: 'none', eyes: 'angry', mouth: 'smile', extra: 'tail', color: [286, 55, 48] },
    { id: 22, name: 'Batuguk', theme: 'gua', body: 'ghost', head: 'unicorn', eyes: 'one', mouth: 'fangs', extra: 'stripes', color: [293, 55, 56] },
    { id: 23, name: 'Stalaktron', theme: 'gua', body: 'spiky', head: 'mohawk', eyes: 'two', mouth: 'open', extra: 'spots', color: [300, 55, 64] },
    { id: 24, name: 'Gemilang', theme: 'gua', body: 'octopus', head: 'spikes', eyes: 'sleepy', mouth: 'teeth', extra: 'arms', color: [307, 55, 52] },
    { id: 25, name: 'Kelelawor', theme: 'gua', body: 'round', head: 'crown', eyes: 'one', mouth: 'smile', extra: 'cheeks', color: [314, 55, 60] },
    { id: 26, name: 'Gelapuk', theme: 'gua', body: 'square', head: 'mohawk', eyes: 'angry', mouth: 'teeth', extra: 'arms', color: [286, 55, 48] },
    { id: 27, name: 'Amethyx', theme: 'gua', body: 'egg', head: 'crown', eyes: 'sleepy', mouth: 'fangs', extra: 'none', color: [293, 55, 56] },
    { id: 28, name: 'Permatok', theme: 'gua', body: 'slime', head: 'antennae', eyes: 'four', mouth: 'open', extra: 'cheeks', color: [300, 55, 64] },
    { id: 29, name: 'Goanggar', theme: 'gua', body: 'round', head: 'crown', eyes: 'one', mouth: 'tongue', extra: 'none', color: [307, 55, 52] },
    { id: 30, name: 'Fosforo', theme: 'gua', body: 'square', head: 'crown', eyes: 'two', mouth: 'fangs', extra: 'cheeks', color: [314, 55, 60] },
    { id: 31, name: 'Apiko', theme: 'api', body: 'square', head: 'crown', eyes: 'two', mouth: 'tongue', extra: 'wings', color: [354, 80, 48] },
    { id: 32, name: 'Lavagor', theme: 'api', body: 'blob', head: 'antennae', eyes: 'one', mouth: 'tongue', extra: 'belly', color: [1, 80, 56] },
    { id: 33, name: 'Barakus', theme: 'api', body: 'spiky', head: 'horns', eyes: 'four', mouth: 'tongue', extra: 'spots', color: [8, 80, 64] },
    { id: 34, name: 'Magmora', theme: 'api', body: 'ghost', head: 'antennae', eyes: 'one', mouth: 'tongue', extra: 'arms', color: [15, 80, 52] },
    { id: 35, name: 'Abunoir', theme: 'api', body: 'egg', head: 'antennae', eyes: 'four', mouth: 'teeth', extra: 'none', color: [22, 80, 60] },
    { id: 36, name: 'Percikor', theme: 'api', body: 'round', head: 'none', eyes: 'one', mouth: 'teeth', extra: 'spots', color: [354, 80, 48] },
    { id: 37, name: 'Salamandor', theme: 'api', body: 'octopus', head: 'none', eyes: 'four', mouth: 'tongue', extra: 'none', color: [1, 80, 56] },
    { id: 38, name: 'Kaldera', theme: 'api', body: 'slime', head: 'unicorn', eyes: 'four', mouth: 'fangs', extra: 'cheeks', color: [8, 80, 64] },
    { id: 39, name: 'Geyserok', theme: 'api', body: 'blob', head: 'spikes', eyes: 'three', mouth: 'tongue', extra: 'arms', color: [15, 80, 52] },
    { id: 40, name: 'Arangon', theme: 'api', body: 'blob', head: 'antennae', eyes: 'angry', mouth: 'open', extra: 'spots', color: [22, 80, 60] },
    { id: 41, name: 'Esbeku', theme: 'es', body: 'round', head: 'crown', eyes: 'two', mouth: 'open', extra: 'belly', color: [164, 65, 48] },
    { id: 42, name: 'Saljuno', theme: 'es', body: 'ghost', head: 'crown', eyes: 'four', mouth: 'open', extra: 'wings', color: [171, 65, 56] },
    { id: 43, name: 'Glaciur', theme: 'es', body: 'blob', head: 'mohawk', eyes: 'four', mouth: 'fangs', extra: 'belly', color: [178, 65, 64] },
    { id: 44, name: 'Kristalsalju', theme: 'es', body: 'egg', head: 'mohawk', eyes: 'three', mouth: 'zigzag', extra: 'tail', color: [185, 65, 52] },
    { id: 45, name: 'Pingwino', theme: 'es', body: 'square', head: 'spikes', eyes: 'four', mouth: 'smile', extra: 'arms', color: [192, 65, 60] },
    { id: 46, name: 'Dinginor', theme: 'es', body: 'slime', head: 'antennae', eyes: 'four', mouth: 'open', extra: 'spots', color: [164, 65, 48] },
    { id: 47, name: 'Mamutik', theme: 'es', body: 'octopus', head: 'unicorn', eyes: 'sleepy', mouth: 'fangs', extra: 'belly', color: [171, 65, 56] },
    { id: 48, name: 'Frostiko', theme: 'es', body: 'spiky', head: 'antennae', eyes: 'angry', mouth: 'fangs', extra: 'tail', color: [178, 65, 64] },
    { id: 49, name: 'Igluk', theme: 'es', body: 'octopus', head: 'ears', eyes: 'three', mouth: 'open', extra: 'belly', color: [185, 65, 52] },
    { id: 50, name: 'Badaino', theme: 'es', body: 'egg', head: 'crown', eyes: 'one', mouth: 'teeth', extra: 'none', color: [192, 65, 60] },
    { id: 51, name: 'Guritron', theme: 'laut', body: 'spiky', head: 'none', eyes: 'angry', mouth: 'fangs', extra: 'none', color: [201, 70, 48] },
    { id: 52, name: 'Kepitingor', theme: 'laut', body: 'slime', head: 'unicorn', eyes: 'one', mouth: 'tongue', extra: 'spots', color: [208, 70, 56] },
    { id: 53, name: 'Uburzap', theme: 'laut', body: 'egg', head: 'ears', eyes: 'one', mouth: 'zigzag', extra: 'stripes', color: [215, 70, 64] },
    { id: 54, name: 'Hiugar', theme: 'laut', body: 'ghost', head: 'none', eyes: 'sleepy', mouth: 'smile', extra: 'belly', color: [222, 70, 52] },
    { id: 55, name: 'Kerangon', theme: 'laut', body: 'octopus', head: 'crown', eyes: 'sleepy', mouth: 'zigzag', extra: 'belly', color: [229, 70, 60] },
    { id: 56, name: 'Pausmok', theme: 'laut', body: 'blob', head: 'ears', eyes: 'one', mouth: 'open', extra: 'none', color: [201, 70, 48] },
    { id: 57, name: 'Karangor', theme: 'laut', body: 'round', head: 'antennae', eyes: 'one', mouth: 'tongue', extra: 'belly', color: [208, 70, 56] },
    { id: 58, name: 'Lobsterok', theme: 'laut', body: 'square', head: 'mohawk', eyes: 'four', mouth: 'teeth', extra: 'arms', color: [215, 70, 64] },
    { id: 59, name: 'Bintanggar', theme: 'laut', body: 'spiky', head: 'horns', eyes: 'two', mouth: 'teeth', extra: 'wings', color: [222, 70, 52] },
    { id: 60, name: 'Piranjo', theme: 'laut', body: 'egg', head: 'antennae', eyes: 'angry', mouth: 'fangs', extra: 'tail', color: [229, 70, 60] },
    { id: 61, name: 'Awanimo', theme: 'langit', body: 'ghost', head: 'ears', eyes: 'four', mouth: 'zigzag', extra: 'arms', color: [34, 85, 48] },
    { id: 62, name: 'Petirgon', theme: 'langit', body: 'blob', head: 'mohawk', eyes: 'sleepy', mouth: 'teeth', extra: 'stripes', color: [41, 85, 56] },
    { id: 63, name: 'Elangor', theme: 'langit', body: 'slime', head: 'horns', eyes: 'sleepy', mouth: 'open', extra: 'wings', color: [48, 85, 64] },
    { id: 64, name: 'Pelangor', theme: 'langit', body: 'round', head: 'unicorn', eyes: 'two', mouth: 'tongue', extra: 'arms', color: [55, 85, 52] },
    { id: 65, name: 'Anginus', theme: 'langit', body: 'egg', head: 'unicorn', eyes: 'one', mouth: 'open', extra: 'tail', color: [62, 85, 60] },
    { id: 66, name: 'Kometor', theme: 'langit', body: 'spiky', head: 'crown', eyes: 'three', mouth: 'zigzag', extra: 'spots', color: [34, 85, 48] },
    { id: 67, name: 'Layanglo', theme: 'langit', body: 'octopus', head: 'horns', eyes: 'one', mouth: 'tongue', extra: 'none', color: [41, 85, 56] },
    { id: 68, name: 'Mataharo', theme: 'langit', body: 'square', head: 'ears', eyes: 'angry', mouth: 'teeth', extra: 'arms', color: [48, 85, 64] },
    { id: 69, name: 'Hujanix', theme: 'langit', body: 'square', head: 'crown', eyes: 'one', mouth: 'smile', extra: 'stripes', color: [55, 85, 52] },
    { id: 70, name: 'Bulanus', theme: 'langit', body: 'ghost', head: 'mohawk', eyes: 'sleepy', mouth: 'teeth', extra: 'arms', color: [62, 85, 60] },
    { id: 71, name: 'Bayangor', theme: 'hantu', body: 'blob', head: 'crown', eyes: 'angry', mouth: 'teeth', extra: 'spots', color: [231, 50, 48] },
    { id: 72, name: 'Hantuk', theme: 'hantu', body: 'octopus', head: 'horns', eyes: 'four', mouth: 'smile', extra: 'arms', color: [238, 50, 56] },
    { id: 73, name: 'Selimutor', theme: 'hantu', body: 'square', head: 'horns', eyes: 'angry', mouth: 'fangs', extra: 'spots', color: [245, 50, 64] },
    { id: 74, name: 'Lenteron', theme: 'hantu', body: 'spiky', head: 'unicorn', eyes: 'four', mouth: 'open', extra: 'tail', color: [252, 50, 52] },
    { id: 75, name: 'Labalabi', theme: 'hantu', body: 'ghost', head: 'crown', eyes: 'two', mouth: 'smile', extra: 'spots', color: [259, 50, 60] },
    { id: 76, name: 'Kerangkok', theme: 'hantu', body: 'egg', head: 'horns', eyes: 'four', mouth: 'zigzag', extra: 'cheeks', color: [231, 50, 48] },
    { id: 77, name: 'Penyihirul', theme: 'hantu', body: 'slime', head: 'horns', eyes: 'sleepy', mouth: 'smile', extra: 'cheeks', color: [238, 50, 56] },
    { id: 78, name: 'Kabutor', theme: 'hantu', body: 'round', head: 'horns', eyes: 'one', mouth: 'teeth', extra: 'belly', color: [245, 50, 64] },
    { id: 79, name: 'Gentayo', theme: 'hantu', body: 'egg', head: 'none', eyes: 'two', mouth: 'open', extra: 'wings', color: [252, 50, 52] },
    { id: 80, name: 'Gelapon', theme: 'hantu', body: 'octopus', head: 'spikes', eyes: 'one', mouth: 'open', extra: 'cheeks', color: [259, 50, 60] },
    { id: 81, name: 'Robotok', theme: 'mesin', body: 'octopus', head: 'unicorn', eyes: 'one', mouth: 'fangs', extra: 'tail', color: [11, 35, 48] },
    { id: 82, name: 'Gearzilla', theme: 'mesin', body: 'square', head: 'unicorn', eyes: 'sleepy', mouth: 'fangs', extra: 'belly', color: [18, 35, 56] },
    { id: 83, name: 'Sekrupor', theme: 'mesin', body: 'ghost', head: 'ears', eyes: 'one', mouth: 'zigzag', extra: 'tail', color: [25, 35, 64] },
    { id: 84, name: 'Baterion', theme: 'mesin', body: 'egg', head: 'spikes', eyes: 'four', mouth: 'open', extra: 'spots', color: [32, 35, 52] },
    { id: 85, name: 'Mekanix', theme: 'mesin', body: 'spiky', head: 'spikes', eyes: 'one', mouth: 'smile', extra: 'none', color: [39, 35, 60] },
    { id: 86, name: 'Pistonk', theme: 'mesin', body: 'round', head: 'horns', eyes: 'three', mouth: 'teeth', extra: 'cheeks', color: [11, 35, 48] },
    { id: 87, name: 'Kabelon', theme: 'mesin', body: 'slime', head: 'mohawk', eyes: 'three', mouth: 'teeth', extra: 'none', color: [18, 35, 56] },
    { id: 88, name: 'Turbinor', theme: 'mesin', body: 'blob', head: 'ears', eyes: 'angry', mouth: 'fangs', extra: 'arms', color: [25, 35, 64] },
    { id: 89, name: 'Magnetor', theme: 'mesin', body: 'ghost', head: 'none', eyes: 'four', mouth: 'smile', extra: 'none', color: [32, 35, 52] },
    { id: 90, name: 'Chipzo', theme: 'mesin', body: 'spiky', head: 'antennae', eyes: 'three', mouth: 'zigzag', extra: 'wings', color: [39, 35, 60] },
    { id: 91, name: 'Permenok', theme: 'manis', body: 'octopus', head: 'unicorn', eyes: 'four', mouth: 'fangs', extra: 'cheeks', color: [331, 75, 48] },
    { id: 92, name: 'Cokelatron', theme: 'manis', body: 'spiky', head: 'ears', eyes: 'one', mouth: 'teeth', extra: 'tail', color: [338, 75, 56] },
    { id: 93, name: 'Donatzilla', theme: 'manis', body: 'square', head: 'mohawk', eyes: 'sleepy', mouth: 'teeth', extra: 'arms', color: [345, 75, 64] },
    { id: 94, name: 'Krimor', theme: 'manis', body: 'blob', head: 'none', eyes: 'two', mouth: 'open', extra: 'cheeks', color: [352, 75, 52] },
    { id: 95, name: 'Kukuriz', theme: 'manis', body: 'slime', head: 'spikes', eyes: 'one', mouth: 'fangs', extra: 'arms', color: [359, 75, 60] },
    { id: 96, name: 'Lolipopo', theme: 'manis', body: 'round', head: 'antennae', eyes: 'sleepy', mouth: 'zigzag', extra: 'wings', color: [331, 75, 48] },
    { id: 97, name: 'Puddingar', theme: 'manis', body: 'egg', head: 'none', eyes: 'one', mouth: 'tongue', extra: 'cheeks', color: [338, 75, 56] },
    { id: 98, name: 'Jellybon', theme: 'manis', body: 'ghost', head: 'horns', eyes: 'sleepy', mouth: 'smile', extra: 'arms', color: [345, 75, 64] },
    { id: 99, name: 'Wafelor', theme: 'manis', body: 'egg', head: 'mohawk', eyes: 'sleepy', mouth: 'open', extra: 'none', color: [352, 75, 52] },
    { id: 100, name: 'Gulalon', theme: 'manis', body: 'round', head: 'horns', eyes: 'angry', mouth: 'teeth', extra: 'cheeks', color: [359, 75, 60] },
  ];

  const hsl = (h, s, l) => {
    h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
    return '#' + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, '0')).join('');
  };
  function palette([h, s, l]) {
    return {
      main: hsl(h, s, l),
      dark: hsl(h, Math.min(s + 5, 90), Math.max(l - 24, 12)),
      light: hsl(h, Math.max(s - 5, 10), Math.min(l + 25, 92)),
      accent: hsl(h + 150, 85, 60),
    };
  }
  function bodyShape(kind, a) {
    switch (kind) {
      case 'round': return `<circle cx="100" cy="112" r="58" ${a}/>`;
      case 'egg': return `<ellipse cx="100" cy="112" rx="50" ry="64" ${a}/>`;
      case 'blob': return `<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" ${a}/>`;
      case 'square': return `<rect x="46" y="56" width="108" height="112" rx="30" ${a}/>`;
      case 'ghost': return `<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" ${a}/>`;
      case 'octopus': return `<g ${a}><ellipse cx="100" cy="98" rx="58" ry="50"/>` +
        [[58, 150, 14], [82, 156, 6], [118, 156, -6], [142, 150, -14]].map(([x, y, r]) =>
          `<ellipse cx="${x}" cy="${y}" rx="12" ry="24" transform="rotate(${r} ${x} ${y})"/>`).join('') + `</g>`;
      case 'slime': return `<path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" ${a}/>`;
      case 'spiky': {
        const pts = [];
        for (let i = 0; i < 24; i++) {
          const ang = (Math.PI * 2 * i) / 24 - Math.PI / 2;
          const r = i % 2 === 0 ? 68 : 54;
          pts.push(`${(100 + r * Math.cos(ang)).toFixed(1)},${(112 + r * Math.sin(ang)).toFixed(1)}`);
        }
        return `<polygon points="${pts.join(' ')}" ${a}/>`;
      }
    }
  }
  const SK = (c) => `stroke="${c.dark}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
  function backExtras(kind, c) {
    if (kind === 'wings') return `<g fill="${c.light}" ${SK(c)}>
    <path d="M52 104Q4 74 10 36Q40 52 58 82Z"/><path d="M148 104Q196 74 190 36Q160 52 142 82Z"/></g>`;
    if (kind === 'tail') return `<path d="M146 150Q198 162 188 112Q176 140 148 136Z" fill="${c.main}" ${SK(c)}/>`;
    return '';
  }
  function headPiece(kind, c) {
    switch (kind) {
      case 'horns': return `<g fill="${c.accent}" ${SK(c)}><path d="M68 72Q56 42 46 36Q76 38 90 64Z"/><path d="M132 72Q144 42 154 36Q124 38 110 64Z"/></g>`;
      case 'unicorn': return `<path d="M91 64L100 12L109 64Z" fill="${c.light}" ${SK(c)}/>`;
      case 'antennae': return `<g ${SK(c)} fill="none"><path d="M82 64Q72 38 62 28"/><path d="M118 64Q128 38 138 28"/></g>
      <circle cx="62" cy="27" r="8" fill="${c.accent}" ${SK(c)}/><circle cx="138" cy="27" r="8" fill="${c.accent}" ${SK(c)}/>`;
      case 'spikes': return `<g fill="${c.accent}" ${SK(c)}>` + [64, 82, 100, 118, 136].map((x, i) =>
        `<path d="M${x - 10} 72L${x} ${i % 2 ? 34 : 28}L${x + 10} 72Z"/>`).join('') + `</g>`;
      case 'crown': return `<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" ${SK(c)}/>`;
      case 'ears': return `<g ${SK(c)}><ellipse cx="50" cy="78" rx="15" ry="22" fill="${c.main}"/><ellipse cx="150" cy="78" rx="15" ry="22" fill="${c.main}"/></g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="${c.light}"/><ellipse cx="150" cy="80" rx="7" ry="13" fill="${c.light}"/>`;
      case 'mohawk': return `<path d="M86 66Q80 34 94 22Q98 42 104 28Q120 42 114 66Z" fill="${c.accent}" ${SK(c)}/>`;
      default: return '';
    }
  }
  function bodyDecor(kind, c, clipId) {
    switch (kind) {
      case 'spots': return `<g fill="${c.dark}" opacity=".3"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>`;
      case 'stripes': return `<g clip-path="url(#${clipId})" stroke="${c.dark}" stroke-width="8" opacity=".3" fill="none" stroke-linecap="round">
      <path d="M30 72Q100 84 170 72"/><path d="M30 152Q100 164 170 152"/><path d="M30 168Q100 180 170 168"/></g>`;
      case 'cheeks': return `<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>`;
      case 'belly': return `<ellipse cx="100" cy="152" rx="32" ry="18" fill="${c.light}" opacity=".85"/>`;
      default: return '';
    }
  }
  function frontExtras(kind, c) {
    if (kind === 'arms') return `<g fill="${c.main}" ${SK(c)}>
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>`;
    return '';
  }
  const eye = (x, y, r, px = 0, py = 0) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#2b1b3d" stroke-width="3"/>` +
    `<circle cx="${x + px}" cy="${y + py}" r="${r * 0.5}" fill="#2b1b3d"/>` +
    `<circle cx="${x + px - r * 0.18}" cy="${y + py - r * 0.2}" r="${r * 0.16}" fill="#fff"/>`;
  function eyes(kind) {
    let g = '';
    switch (kind) {
      case 'two': g = eye(76, 96, 15, 2, 2) + eye(124, 96, 15, -2, 2); break;
      case 'one': g = eye(100, 98, 25, 0, 3); break;
      case 'three': g = eye(72, 102, 12, 1, 1) + eye(128, 102, 12, -1, 1) + eye(100, 78, 11, 0, 1); break;
      case 'four': g = eye(72, 90, 11, 1, 1) + eye(128, 90, 11, -1, 1) + eye(88, 114, 9, 1, 1) + eye(112, 114, 9, -1, 1); break;
      case 'angry': g = eye(76, 98, 13, 3, 2) + eye(124, 98, 13, -3, 2) +
        `<path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/>`; break;
      case 'sleepy': g = `<path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/>`; break;
    }
    return `<g class="eyes">${g}</g>`;
  }
  function mouth(kind) {
    const D = '#3b1020';
    switch (kind) {
      case 'smile': return `<path d="M80 132Q100 154 120 132" stroke="${D}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
      case 'fangs': return `<path d="M76 128Q100 156 124 128Z" fill="${D}" stroke="${D}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>`;
      case 'tongue': return `<path d="M80 130Q100 150 120 130" stroke="${D}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff6b8a" stroke="${D}" stroke-width="3"/>`;
      case 'teeth': return `<rect x="78" y="126" width="44" height="24" rx="9" fill="${D}"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>`;
      case 'open': return `<ellipse cx="100" cy="138" rx="16" ry="14" fill="${D}"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>`;
      case 'zigzag': return `<path d="M74 136L85 124L96 136L107 124L118 136L126 128" stroke="${D}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    return '';
  }
  function renderMonster(m) {
    const c = palette(m.color);
    const clipId = `clip-m${m.id}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="${m.name}">
<defs><clipPath id="${clipId}">${bodyShape(m.body, '')}</clipPath></defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<g class="monster-body">
${backExtras(m.extra, c)}
${headPiece(m.head, c)}
${bodyShape(m.body, `fill="${c.main}" ${SK(c)}`)}
${bodyDecor(m.extra, c, clipId)}
${frontExtras(m.extra, c)}
${eyes(m.eyes)}
${mouth(m.mouth)}
</g></svg>`;
  }
  return { THEMES, MONSTERS, renderMonster, renderMonsterSvg: renderMonster };
});
