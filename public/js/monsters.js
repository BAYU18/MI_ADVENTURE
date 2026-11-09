// shared/monsters.js — Katalog 100 monster + renderer SVG Glossy Toon 3D (UMD: Node & browser)
// Sesuai Part I §9 dokumen spesifikasi & PROPOSAL_UPGRADE_3D_SKIN_DAN_BOSS.md
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

  const TIER_SEQUENCE = ['common', 'common', 'common', 'common', 'rare', 'rare', 'rare', 'epic', 'epic', 'legend'];
  MONSTERS.forEach((m, idx) => {
    if (!m.tier) m.tier = TIER_SEQUENCE[idx % 10];
  });

  const hsl = (h, s, l) => {
    h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
    return '#' + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, '0')).join('');
  };

  const mix = (hexA, hexB, t) => {
    const parse = (h) => {
      let c = (h || '#ffffff').replace('#', '');
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      const n = parseInt(c, 16) || 0;
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const [r1, g1, b1] = parse(hexA);
    const [r2, g2, b2] = parse(hexB);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  };

  function palette(col) {
    const [h, s, l] = (Array.isArray(col) && col.length >= 3) ? col : [116, 62, 48];
    const main = hsl(h, s, l);
    const dark = hsl(h, Math.min(s + 5, 90), Math.max(l - 24, 12));
    const light = hsl(h, Math.max(s - 5, 10), Math.min(l + 25, 92));
    const accent = hsl(h + 150, 85, 60);
    return {
      main,
      dark,
      light,
      accent,
      accentLight: mix(accent, '#ffffff', 0.45),
      accentDark: mix(accent, '#000000', 0.35),
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

  function backExtras(kind, c, uid) {
    if (kind === 'wings') return `<g fill="url(#hn-${uid})" ${SK(c)}>
    <path d="M52 104Q4 74 10 36Q40 52 58 82Z"/><path d="M148 104Q196 74 190 36Q160 52 142 82Z"/></g>
    <path d="M48 90Q16 66 22 46M152 90Q184 66 178 46" stroke="#fff" stroke-width="2.5" opacity=".45" fill="none" stroke-linecap="round"/>`;
    if (kind === 'tail') return `<path d="M146 150Q198 162 188 112Q176 140 148 136Z" fill="url(#bd-${uid})" ${SK(c)}/>
    <path d="M152 146Q186 152 178 120" stroke="#fff" stroke-width="2.5" opacity=".35" fill="none" stroke-linecap="round"/>`;
    return '';
  }

  function headPiece(kind, c, uid, tier) {
    switch (kind) {
      case 'horns': return `<g fill="url(#hn-${uid})" ${SK(c)}>
        <path d="M68 72Q56 42 46 36Q76 38 90 64Z"/>
        <path d="M132 72Q144 42 154 36Q124 38 110 64Z"/>
      </g>
      <g stroke="#fff" stroke-width="2.5" opacity=".55" fill="none" stroke-linecap="round">
        <path d="M66 66Q58 50 52 42"/><path d="M134 66Q142 50 148 42"/>
      </g>`;
      case 'unicorn': return `<path d="M91 64L100 12L109 64Z" fill="url(#hn-${uid})" ${SK(c)}/>
        <path d="M97 58L100 18" stroke="#fff" stroke-width="2" opacity=".6" stroke-linecap="round"/>`;
      case 'antennae': return `<g ${SK(c)} fill="none"><path d="M82 64Q72 38 62 28"/><path d="M118 64Q128 38 138 28"/></g>
        <circle cx="62" cy="27" r="8" fill="url(#hn-${uid})" ${SK(c)}/>
        <circle cx="138" cy="27" r="8" fill="url(#hn-${uid})" ${SK(c)}/>
        <circle cx="60.5" cy="25.5" r="2" fill="#fff" opacity=".8"/>
        <circle cx="136.5" cy="25.5" r="2" fill="#fff" opacity=".8"/>`;
      case 'spikes': return `<g fill="url(#hn-${uid})" ${SK(c)}>` + [64, 82, 100, 118, 136].map((x, i) =>
        `<path d="M${x - 10} 72L${x} ${i % 2 ? 34 : 28}L${x + 10} 72Z"/>`).join('') + `</g>
        <g stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round">` + [64, 82, 100, 118, 136].map((x, i) =>
        `<path d="M${x - 2} 66L${x} ${i % 2 ? 40 : 34}"/>`).join('') + `</g>`;
      case 'crown': return `<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="url(#gd-${uid})" ${SK(c)}/>
        <circle cx="72" cy="34" r="2.5" fill="#fff" stroke="#78350f" stroke-width="1"/>
        <circle cx="100" cy="28" r="3" fill="#fff" stroke="#78350f" stroke-width="1"/>
        <circle cx="128" cy="34" r="2.5" fill="#fff" stroke="#78350f" stroke-width="1"/>
        <ellipse cx="100" cy="54" rx="4" ry="3.5" fill="url(#gm-${uid})" stroke="#7f1d1d" stroke-width="1"/>
        <circle cx="99" cy="52.8" r="1" fill="#fff"/>`;
      case 'ears': return `<g ${SK(c)}>
        <ellipse cx="50" cy="78" rx="15" ry="22" fill="url(#bd-${uid})"/>
        <ellipse cx="150" cy="78" rx="15" ry="22" fill="url(#bd-${uid})"/>
      </g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="${c.light}" opacity=".85"/>
      <ellipse cx="150" cy="80" rx="7" ry="13" fill="${c.light}" opacity=".85"/>
      <ellipse cx="48" cy="74" rx="2.5" ry="6" fill="#fff" opacity=".4"/>
      <ellipse cx="148" cy="74" rx="2.5" ry="6" fill="#fff" opacity=".4"/>`;
      case 'mohawk': return `<path d="M86 66Q80 34 94 22Q98 42 104 28Q120 42 114 66Z" fill="url(#hn-${uid})" ${SK(c)}/>
        <path d="M92 48Q96 32 100 26" stroke="#fff" stroke-width="2.5" opacity=".55" fill="none" stroke-linecap="round"/>`;
      default: return '';
    }
  }

  function bodyDecor(kind, c, clipId, uid) {
    switch (kind) {
      case 'spots': return `<g fill="${c.dark}" opacity=".35"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>`;
      case 'stripes': return `<g clip-path="url(#${clipId})" stroke="${c.dark}" stroke-width="8" opacity=".35" fill="none" stroke-linecap="round">
      <path d="M30 72Q100 84 170 72"/><path d="M30 152Q100 164 170 152"/><path d="M30 168Q100 180 170 168"/></g>`;
      case 'cheeks': return `<circle cx="60" cy="118" r="10" fill="url(#ch-${uid})" opacity=".8"/><circle cx="140" cy="118" r="10" fill="url(#ch-${uid})" opacity=".8"/>`;
      case 'belly': return `<ellipse cx="100" cy="152" rx="32" ry="18" fill="${c.light}" opacity=".85"/><ellipse cx="100" cy="148" rx="22" ry="10" fill="#fff" opacity=".2"/>`;
      default: return '';
    }
  }

  function frontExtras(kind, c, uid) {
    if (kind === 'arms') return `<g fill="url(#bd-${uid})" ${SK(c)}>
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
    <ellipse cx="37" cy="126" rx="3" ry="8" transform="rotate(25 37 126)" fill="#fff" opacity=".4"/>
    <ellipse cx="157" cy="126" rx="3" ry="8" transform="rotate(-25 157 126)" fill="#fff" opacity=".4"/>`;
    return '';
  }

  const eye = (x, y, r, px = 0, py = 0, uid, tier) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#sc-${uid})" stroke="#2b1b3d" stroke-width="3"/>` +
    `<circle cx="${x + px}" cy="${y + py}" r="${r * 0.5}" fill="url(#pu-${uid})"/>` +
    ((tier === 'epic' || tier === 'legend')
      ? `<circle cx="${x + px}" cy="${y + py}" r="${r * 0.5}" fill="none" stroke="${tier === 'legend' ? '#fef08a' : '#e9d5ff'}" stroke-width="1.4" opacity=".85"/>`
      : '') +
    `<circle cx="${(x + px - r * 0.18).toFixed(1)}" cy="${(y + py - r * 0.2).toFixed(1)}" r="${(r * 0.2).toFixed(1)}" fill="#fff"/>` +
    `<circle cx="${(x + px + r * 0.18).toFixed(1)}" cy="${(y + py + r * 0.2).toFixed(1)}" r="${(r * 0.09).toFixed(1)}" fill="#fff" opacity=".8"/>`;

  function eyes(kind, uid, tier) {
    let g = '';
    switch (kind) {
      case 'two': g = eye(76, 96, 15, 2, 2, uid, tier) + eye(124, 96, 15, -2, 2, uid, tier); break;
      case 'one': g = eye(100, 98, 25, 0, 3, uid, tier); break;
      case 'three': g = eye(72, 102, 12, 1, 1, uid, tier) + eye(128, 102, 12, -1, 1, uid, tier) + eye(100, 78, 11, 0, 1, uid, tier); break;
      case 'four': g = eye(72, 90, 11, 1, 1, uid, tier) + eye(128, 90, 11, -1, 1, uid, tier) + eye(88, 114, 9, 1, 1, uid, tier) + eye(112, 114, 9, -1, 1, uid, tier); break;
      case 'angry': g = eye(76, 98, 13, 3, 2, uid, tier) + eye(124, 98, 13, -3, 2, uid, tier) +
        `<path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/>`; break;
      case 'sleepy': g = `<path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/>`; break;
    }
    return `<g class="eyes fx-blink">${g}</g>`;
  }

  function mouth(kind, uid) {
    const D = '#2b0a20';
    switch (kind) {
      case 'smile': return `<path d="M80 132Q100 154 120 132" stroke="${D}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
      case 'fangs': return `<path d="M76 128Q100 156 124 128Z" fill="url(#mo-${uid})" stroke="${D}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="url(#te-${uid})"/>`;
      case 'tongue': return `<path d="M80 130Q100 150 120 130" stroke="${D}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff7a96" stroke="${D}" stroke-width="3"/>
      <ellipse cx="100" cy="144" rx="5" ry="4" fill="#ffb3c4" opacity=".7"/>`;
      case 'teeth': return `<rect x="78" y="126" width="44" height="24" rx="9" fill="url(#mo-${uid})"/>
      <g clip-path="url(#mc-${uid})">
        <ellipse cx="100" cy="152" rx="15" ry="9" fill="#ff7a96"/>
        <ellipse cx="100" cy="149" rx="9" ry="3" fill="#ffb3c4" opacity=".7"/>
      </g>
      <g fill="url(#te-${uid})">
        <rect x="82" y="127" width="8" height="9" rx="2"/>
        <rect x="92" y="127" width="8" height="9" rx="2"/>
        <rect x="102" y="127" width="8" height="9" rx="2"/>
        <rect x="110" y="127" width="8" height="9" rx="2"/>
      </g>
      <path d="M81 129h37" stroke="#fff" stroke-width="1.6" opacity=".55" stroke-linecap="round"/>`;
      case 'open': return `<ellipse cx="100" cy="138" rx="16" ry="14" fill="url(#mo-${uid})"/>
      <ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff7a96"/>
      <ellipse cx="100" cy="144" rx="5" ry="2" fill="#ffb3c4" opacity=".7"/>`;
      case 'zigzag': return `<path d="M74 136L85 124L96 136L107 124L118 136L126 128" stroke="${D}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    return '';
  }

  function renderMonster(m, opts = {}) {
    if (!m) m = MONSTERS[0];
    if (typeof m === 'number') m = MONSTERS.find(x => x.id === m) || MONSTERS[0];
    if (typeof m === 'string') m = MONSTERS.find(x => x.name && x.name.toLowerCase() === m.toLowerCase()) || MONSTERS[0];
    if (!m.color || !m.body) {
      const full = MONSTERS.find(x => x.id === m.id || (m.name && x.name && x.name.toLowerCase() === m.name.toLowerCase())) ||
                   MONSTERS.find(x => x.theme === m.theme) ||
                   MONSTERS[0];
      m = { ...full, ...m, color: m.color || full.color, body: m.body || full.body, head: m.head || full.head, eyes: m.eyes || full.eyes, mouth: m.mouth || full.mouth, extra: m.extra || full.extra };
    }
    const c = palette(m.color);
    const tier = (opts && opts.tier ? String(opts.tier).toLowerCase() : (m.tier ? String(m.tier).toLowerCase() : 'common'));
    const uid = (opts && opts.uid) ? opts.uid : ('m' + (m.id || 1));
    const fxMode = (opts && opts.fx) ? opts.fx : 'full'; // 'full' | 'lite' | 'static'
    const isStatic = fxMode === 'lite' || fxMode === 'static';

    const clipId = 'clip-' + uid;
    const mouthClipId = 'mc-' + uid;
    const sizeAttr = opts && opts.size ? `width="${opts.size}" height="${opts.size}"` : '';

    // Progressive Tier Elements
    let tierAuraGradient = '';
    let tierAuraElement = '';
    let tierRays = '';
    let tierRimStroke = '';
    let tierHaloOrCrown = '';
    let tierSweepDuration = '6s';
    let tierSparks = '';

    if (tier === 'rare') {
      tierAuraGradient = `<radialGradient id="au-${uid}" cx=".5" cy=".5" r=".5">
  <stop offset="0" stop-color="#3b82f6" stop-opacity="0.6"/>
  <stop offset="1" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>`;
      tierAuraElement = `<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#au-${uid})"/>`;
      tierRimStroke = bodyShape(m.body, `fill="none" stroke="#bfdbfe" stroke-width="3" opacity=".9"`);
      tierSweepDuration = '6s';
      tierSparks = `<g class="tier-sparks">
  <g transform="translate(62 56) scale(0.8)"><path class="${isStatic ? '' : 'fx-twinkle'}" style="animation-delay:0s" fill="#bfdbfe" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
  <g transform="translate(140 64) scale(0.6)"><path class="${isStatic ? '' : 'fx-twinkle'}" style="animation-delay:1.2s" fill="#bfdbfe" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
</g>`;
    } else if (tier === 'epic') {
      tierAuraGradient = `<radialGradient id="au-${uid}" cx=".5" cy=".5" r=".5">
  <stop offset="0" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="1" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
<linearGradient id="ep-${uid}" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#f5e9ff"/><stop offset="0.5" stop-color="#a855f7"/><stop offset="1" stop-color="#5b21b6"/>
</linearGradient>`;
      tierAuraElement = `<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#au-${uid})"/>`;
      tierRimStroke = bodyShape(m.body, `fill="none" stroke="url(#ep-${uid})" stroke-width="4" opacity=".9"`);
      tierSweepDuration = '4.5s';
      tierHaloOrCrown = `<g class="${isStatic ? '' : 'fx-ring'}">
  <ellipse cx="100" cy="30" rx="24" ry="6.5" fill="none" stroke="url(#ep-${uid})" stroke-width="3.5"/>
  <ellipse cx="100" cy="30" rx="24" ry="6.5" fill="none" stroke="#fff" stroke-width="1" opacity=".7" stroke-dasharray="8 40"/>
</g>`;
      tierSparks = `<g class="tier-sparks"><g class="${isStatic ? '' : 'fx-orbit'}">
  <g transform="translate(40 70) scale(0.9)"><path class="${isStatic ? '' : 'fx-twinkle'}" style="animation-delay:0s" fill="#e9d5ff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
  <g transform="translate(160 58) scale(0.8)"><path class="${isStatic ? '' : 'fx-twinkle'}" style="animation-delay:0.8s" fill="#e9d5ff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
  <g transform="translate(166 132) scale(0.7)"><path class="${isStatic ? '' : 'fx-twinkle'}" style="animation-delay:1.6s" fill="#e9d5ff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
  <g transform="translate(34 136) scale(0.7)"><path class="${isStatic ? '' : 'fx-twinkle'}" style="animation-delay:2.2s" fill="#e9d5ff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
</g></g>`;
    } else if (tier === 'legend') {
      tierAuraGradient = `<radialGradient id="au-${uid}" cx=".5" cy=".5" r=".5">
  <stop offset="0" stop-color="#f59e0b" stop-opacity="0.75"/>
  <stop offset="1" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
<radialGradient id="ry-${uid}" gradientUnits="userSpaceOnUse" cx="100" cy="110" r="100">
  <stop offset="0" stop-color="#fde68a" stop-opacity="0.8"/>
  <stop offset="1" stop-color="#fde68a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="ho-${uid}" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#ff5d8f"/><stop offset="0.2" stop-color="#ffb347"/><stop offset="0.4" stop-color="#f4ff6b"/>
  <stop offset="0.6" stop-color="#5dffb0"/><stop offset="0.8" stop-color="#5db7ff"/><stop offset="1" stop-color="#c37dff"/>
</linearGradient>`;
      tierRays = `<g class="${isStatic ? '' : 'fx-rays'}" fill="url(#ry-${uid})" opacity=".55">
  <polygon transform="rotate(0 100 110)" points="100,110 92,-20 108,-20"/>
  <polygon transform="rotate(30 100 110)" points="100,110 92,-20 108,-20"/>
  <polygon transform="rotate(60 100 110)" points="100,110 92,-20 108,-20"/>
  <polygon transform="rotate(90 100 110)" points="100,110 92,-20 108,-20"/>
  <polygon transform="rotate(120 100 110)" points="100,110 92,-20 108,-20"/>
  <polygon transform="rotate(150 100 110)" points="100,110 92,-20 108,-20"/>
  <polygon transform="rotate(180 100 110)" points="100,110 92,-20 108,-20"/>
  <polygon transform="rotate(210 100 110)" points="100,110 92,-20 108,-20"/>
  <polygon transform="rotate(240 100 110)" points="100,110 92,-20 108,-20"/>
  <polygon transform="rotate(270 100 110)" points="100,110 92,-20 108,-20"/>
  <polygon transform="rotate(300 100 110)" points="100,110 92,-20 108,-20"/>
  <polygon transform="rotate(330 100 110)" points="100,110 92,-20 108,-20"/>
</g>
<ellipse cx="100" cy="184" rx="70" ry="11" fill="url(#au-${uid})"/>`;
      tierAuraElement = `<circle class="aura-legend" cx="100" cy="110" r="92" fill="url(#au-${uid})"/>`;
      tierRimStroke = bodyShape(m.body, `fill="none" stroke="url(#gd-${uid})" stroke-width="4" opacity=".9"`);
      tierSweepDuration = '3.6s';
      tierHaloOrCrown = `<g class="tier-crown" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32" fill="url(#gd-${uid})"/>
  <rect x="84" y="28" width="32" height="6" rx="2" fill="url(#gd-${uid})"/>
</g>
<g fill="#fff8d6" stroke="#78350f" stroke-width="1">
  <circle cx="80" cy="16" r="2.6"/><circle cx="100" cy="12" r="3.2"/><circle cx="120" cy="16" r="2.6"/>
</g>
<circle cx="100" cy="24.5" r="3.2" fill="url(#gm-${uid})" stroke="#7f1d1d" stroke-width="1"/>
<circle cx="99" cy="23.4" r="1" fill="#fff"/>
<g transform="translate(80 15) scale(1.1)"><path class="${isStatic ? '' : 'fx-glint'}" style="animation-delay:0s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
<g transform="translate(100 10) scale(1.4)"><path class="${isStatic ? '' : 'fx-glint'}" style="animation-delay:0.7s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
<g transform="translate(120 15) scale(1.1)"><path class="${isStatic ? '' : 'fx-glint'}" style="animation-delay:1.4s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>`;
      tierSparks = `<g class="tier-sparks legend-sparks"><g class="${isStatic ? '' : 'fx-orbit'}">
  <g transform="translate(40 70) scale(0.9)"><path class="${isStatic ? '' : 'fx-twinkle'}" style="animation-delay:0s" fill="#fef08a" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
  <g transform="translate(160 58) scale(0.8)"><path class="${isStatic ? '' : 'fx-twinkle'}" style="animation-delay:0.8s" fill="#fef08a" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
  <g transform="translate(166 132) scale(0.7)"><path class="${isStatic ? '' : 'fx-twinkle'}" style="animation-delay:1.6s" fill="#fef08a" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
  <g transform="translate(34 136) scale(0.7)"><path class="${isStatic ? '' : 'fx-twinkle'}" style="animation-delay:2.2s" fill="#fef08a" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
  <g transform="translate(100 22) scale(0.7)"><path class="${isStatic ? '' : 'fx-twinkle'}" style="animation-delay:0.4s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
  <g transform="translate(100 198) scale(0.7)"><path class="${isStatic ? '' : 'fx-twinkle'}" style="animation-delay:1.2s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
</g>
<g class="${isStatic ? '' : 'fx-orbit-r'}">
  <g transform="translate(52 40) scale(0.8)"><path class="${isStatic ? '' : 'fx-twinkle'}" style="animation-delay:0.3s" fill="#fff8d6" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
  <g transform="translate(150 176) scale(0.8)"><path class="${isStatic ? '' : 'fx-twinkle'}" style="animation-delay:1.3s" fill="#fff8d6" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
</g></g>`;
    }

    // Horn/Head twinkles for Epic & Legend
    let hornTwinkles = '';
    if ((tier === 'epic' || tier === 'legend') && ['horns', 'unicorn', 'antennae', 'spikes'].includes(m.head)) {
      const starCol = tier === 'legend' ? '#fef08a' : '#e9d5ff';
      hornTwinkles = `<g transform="translate(46 36) scale(0.9)"><path class="${isStatic ? '' : 'fx-twinkle'}" style="animation-delay:0s" fill="${starCol}" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
      <g transform="translate(154 36) scale(0.9)"><path class="${isStatic ? '' : 'fx-twinkle'}" style="animation-delay:1.1s" fill="${starCol}" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>`;
    }

    // Sweep glint for Rare, Epic, Legend
    const sweepElement = (tier !== 'common' && !isStatic)
      ? `<g class="fx-sweep" style="animation-duration:${tierSweepDuration}"><g transform="rotate(20 100 110)"><rect x="-40" y="0" width="24" height="220" fill="url(#sw-${uid})"/></g></g>`
      : '';

    // Holo foil for Legend
    let holoElement = '';
    if (tier === 'legend') {
      holoElement = (!isStatic && fxMode === 'full')
        ? `<g opacity=".2" style="mix-blend-mode:soft-light"><rect class="fx-holo" x="-100" y="40" width="400" height="140" fill="url(#ho-${uid})"/></g>`
        : `<rect x="-100" y="40" width="400" height="140" fill="url(#ho-${uid})" opacity=".12"/>`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" ${sizeAttr} class="fx ${isStatic ? 'fx-static' : ''}" role="img" aria-label="${m.name} (${tier})" data-tier="${tier}">
<defs>
  <clipPath id="${clipId}">${bodyShape(m.body, '')}</clipPath>
  <clipPath id="${mouthClipId}"><rect x="78" y="126" width="44" height="24" rx="9"/></clipPath>
  <radialGradient id="bd-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="${c.light}"/>
    <stop offset="0.45" stop-color="${c.main}"/>
    <stop offset="1" stop-color="${c.dark}"/>
  </radialGradient>
  <linearGradient id="sh-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.5" stop-color="#2b0a20" stop-opacity="0"/>
    <stop offset="1" stop-color="#2b0a20" stop-opacity="0.38"/>
  </linearGradient>
  <linearGradient id="gl-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0.9"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="rm-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0.95"/>
    <stop offset="0.55" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="hn-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${c.accentLight || c.accent}"/>
    <stop offset="1" stop-color="${c.accentDark || c.accent}"/>
  </linearGradient>
  <radialGradient id="sc-${uid}" cx=".5" cy=".5" r="0.7" fx="0.38" fy="0.3">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#f1f4fa"/><stop offset="1" stop-color="#c9d0df"/>
  </radialGradient>
  <radialGradient id="pu-${uid}" cx=".5" cy=".5" r="0.7" fx="0.35" fy="0.3">
    <stop offset="0" stop-color="#6a4a8c"/><stop offset="0.45" stop-color="#3a2557"/><stop offset="1" stop-color="#1d1030"/>
  </radialGradient>
  <radialGradient id="ch-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="#ffc2cf"/><stop offset="0.45" stop-color="#ff8fa3"/><stop offset="1" stop-color="#f0627f"/>
  </radialGradient>
  <linearGradient id="mo-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#5a1a30"/><stop offset="1" stop-color="#1d0610"/>
  </linearGradient>
  <linearGradient id="te-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dcd5ea"/>
  </linearGradient>
  <linearGradient id="sw-${uid}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="gd-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFF3B0"/><stop offset="0.35" stop-color="#FBBF24"/><stop offset="0.7" stop-color="#D98A0B"/><stop offset="1" stop-color="#8A4B08"/>
  </linearGradient>
  <radialGradient id="gm-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="#ffc2c2"/><stop offset="0.45" stop-color="#ef4444"/><stop offset="1" stop-color="#7f1d1d"/>
  </radialGradient>
  ${tierAuraGradient}
</defs>
<ellipse class="monster-shadow ${tier === 'common' || isStatic ? '' : 'fx-shadow'}" cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".2"/>
${tierRays}
${tierAuraElement}
<g class="monster-body ${tier === 'common' || isStatic ? '' : 'fx-float'}">
${backExtras(m.extra, c, uid)}
${headPiece(m.head, c, uid, tier)}
${hornTwinkles}
${bodyShape(m.body, `fill="url(#bd-${uid})" stroke="${c.dark}" stroke-width="4" stroke-linejoin="round"`)}
<g clip-path="url(#${clipId})">
  ${bodyShape(m.body, `fill="url(#sh-${uid})"`)}
  <ellipse cx="100" cy="164" rx="40" ry="11" fill="${c.light}" opacity=".3"/>
  ${bodyShape(m.body, `fill="none" stroke="url(#rm-${uid})" stroke-width="7"`)}
  ${tierRimStroke}
  ${holoElement}
  <ellipse cx="76" cy="78" rx="30" ry="15" transform="rotate(-32 76 78)" fill="url(#gl-${uid})"/>
  <circle cx="62" cy="74" r="3.8" fill="#fff" opacity=".95"/>
  ${sweepElement}
</g>
${bodyDecor(m.extra, c, clipId, uid)}
${frontExtras(m.extra, c, uid)}
${eyes(m.eyes, uid, tier)}
${mouth(m.mouth, uid)}
${tierHaloOrCrown}
</g>
${tierSparks}
</svg>`;
  }

  return { THEMES, MONSTERS, renderMonster, renderMonsterSvg: renderMonster, palette, bodyShape };
});
