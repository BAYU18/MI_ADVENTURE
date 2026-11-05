/* shared/bossskills.js — skill spesialis boss per elemen + Mode Brutal (UMD: server & klien; murni, tanpa I/O/dependensi) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BossSkills = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const fmt = (n, d) => Number(n.toFixed(d == null ? 0 : d)).toString().replace('.', ',');
  const pct = (v) => fmt(v * 100, 0) + '%';

  /* ---------- Konfigurasi (satu-satunya tempat menyetel keseimbangan) ---------- */
  const TIERS = ['common', 'rare', 'epic', 'legend'];
  const TIER_POWER = { common: 1.0, rare: 1.3, epic: 1.6, legend: 2.0 };   // makin tinggi rarity → efek skill makin besar
  const SKILL_COUNT = { common: 1, rare: 2, epic: 3, legend: 4 };            // makin tinggi rarity → skill makin banyak
  const BRUTAL = { enabled: true, minLevel: 5, skillMult: 2, rewardMult: 3 };
  const LIMITS = { maxDamageMult: 6, maxHitPct: 0.5, minTimeMult: 0.6, minTimeSec: 8 };   // pengaman agar tidak mustahil/menyebalkan
  const RARITY_LABEL = { common: 'Common', rare: 'Rare', epic: 'Epic', legend: 'Legend' };

  /* ---------- Arketipe efek (semua HANYA menyentuh sisi pemain; tidak pernah menambah HP boss / membuat boss butuh > N jawaban benar) ---------- */
  const ARCH = {
    rage_damage:    { base: 0.25, cap: 3,   text: (v) => `Makin sedikit darah boss, makin besar damage ke kamu — hingga ×${fmt(1 + v, 2)} saat darahnya hampir habis.` },
    charged_strike: { base: 0.35, cap: 4,   text: (v, s) => `Tiap ${s.every} soal boss mengisi jurus (ada peringatan ⚠️). Jawab BENAR untuk menghindar; jawab salah = damage ×${fmt(1 + v, 2)}.` },
    dot:            { base: 0.08, cap: 1,   text: (v, s) => `Setelah kamu salah, kamu ${s.verb || 'terkena efek'} selama ${s.turns || 2} soal: darahmu berkurang ${pct(v)} dari damage serangan boss di awal tiap soal (tidak pernah sampai membuatmu kalah).` },
    time_squeeze:   { base: 0.06, cap: 0.4, text: (v, s) => `Tiap ${s.every} soal, waktu menjawab berkurang ${pct(v)}.` },
    energy_siphon:  { base: 0.10, cap: 0.5, text: (v) => `Saat kamu salah, boss menyedot ${pct(v)} energimu (minimal 1 ⚡).` },
    heal_curse:     { base: 0.15, cap: 0.8, text: (v) => `Efek skill Pulihkan (heal) berkurang ${pct(v)}.` },
    skill_tax:      { base: 0.60, cap: 3,   text: (v) => `Saat boss marah (Fase 2), memakai skill butuh +${Math.ceil(v)} ⚡ ekstra.` },
    shield_pierce:  { base: 0.20, cap: 0.9, text: (v) => `Serangan boss menembus ${pct(v)} perlindungan Perisai.` },
    combo_seal:     { base: 0.20, cap: 0.9, text: (v) => `Bonus combo-mu ke boss berkurang ${pct(v)} (damage dasar tetap).` },
    phase_rage:     { base: 0.15, cap: 2,   text: (v) => `Saat boss marah (Fase 2), damage ke kamu +${pct(v)}.` },
  };

  /* ---------- 10 elemen: profil + paket skill (urutan = urutan dibuka menurut rarity: common 1 skill … legend 4 skill) ---------- */
  const ELEMENTS = {
    fire:    { name: 'Api',      icon: '🔥', color: '#EF4444', title: 'Penguasa Api',      desc: 'Raksasa dari gunung berapi yang makin ganas saat terdesak. Semakin sedikit darahnya, semakin panas serangannya!' },
    water:   { name: 'Air',      icon: '💧', color: '#38BDF8', title: 'Penjaga Samudra',   desc: 'Penghuni laut dalam yang menyedot tenaga lawan lewat arus deras. Hati-hati, energimu bisa terkuras.' },
    ice:     { name: 'Es',       icon: '❄️', color: '#93C5FD', title: 'Raja Salju',        desc: 'Makhluk kutub yang membekukan segalanya. Waktu terasa berjalan lebih cepat saat ia mengamuk.' },
    nature:  { name: 'Hutan',    icon: '🌿', color: '#22C55E', title: 'Roh Rimba',         desc: 'Penjaga hutan lebat berselimut duri beracun. Lukanya terasa lama setelah kamu keliru menjawab.' },
    earth:   { name: 'Tanah',    icon: '🪨', color: '#A16207', title: 'Golem Pegunungan',  desc: 'Sosok batu raksasa yang menghantam dengan keras. Jangan lengah saat ia mulai mengangkat tinjunya!' },
    wind:    { name: 'Angin',    icon: '🌪️', color: '#94A3B8', title: 'Penguasa Topan',    desc: 'Makhluk langit yang berputar secepat badai. Ia suka membuat pemain terburu-buru.' },
    thunder: { name: 'Petir',    icon: '⚡', color: '#FACC15', title: 'Raja Guntur',       desc: 'Monster listrik yang menyambar tanpa ampun. Sengatannya menguras energi dan mengacaukan skill.' },
    shadow:  { name: 'Bayangan', icon: '🌑', color: '#7C3AED', title: 'Hantu Kegelapan',   desc: 'Sosok misterius yang menembus perlindungan. Kutukannya membuat penyembuhan kurang manjur.' },
    light:   { name: 'Cahaya',   icon: '✨', color: '#FDE68A', title: 'Penjaga Kristal',   desc: 'Makhluk bersinar yang menyilaukan mata. Pantulan kristalnya meredam kekuatan combo-mu.' },
    toxic:   { name: 'Racun',    icon: '☠️', color: '#84CC16', title: 'Ratu Rawa Beracun', desc: 'Penguasa rawa berkabut racun. Uap beracunnya melemahkan penyembuhan dan perlindunganmu.' },
  };
  const ELEMENT_ORDER = ['fire', 'water', 'ice', 'nature', 'earth', 'wind', 'thunder', 'shadow', 'light', 'toxic'];
  const KITS = {
    fire:    [ { id: 'fire_rage',     name: 'Amarah Membara',     icon: '🔥', type: 'rage_damage', base: 0.22 },
               { id: 'fire_breath',   name: 'Semburan Api',       icon: '🐉', type: 'charged_strike', every: 5, base: 0.20 },
               { id: 'fire_burn',     name: 'Terbakar',           icon: '♨️', type: 'dot', turns: 2, verb: 'terbakar', base: 0.03 },
               { id: 'fire_inferno',  name: 'Ledakan Inferno',    icon: '🌋', type: 'phase_rage', base: 0.05 } ],
    water:   [ { id: 'water_siphon',  name: 'Arus Penyedot',      icon: '🌀', type: 'energy_siphon' },
               { id: 'water_tide',    name: 'Gelombang Pasang',   icon: '🌊', type: 'charged_strike', every: 6 },
               { id: 'water_drift',   name: 'Hanyut',             icon: '⏳', type: 'time_squeeze', every: 3 },
               { id: 'water_flood',   name: 'Banjir Pelumpuh',    icon: '💦', type: 'heal_curse' } ],
    ice:     [ { id: 'ice_frost',     name: 'Embun Beku',         icon: '🥶', type: 'time_squeeze', every: 3 },
               { id: 'ice_blizzard',  name: 'Badai Salju',        icon: '🌨️', type: 'charged_strike', every: 5 },
               { id: 'ice_crack',     name: 'Retak Es',           icon: '🧊', type: 'combo_seal' },
               { id: 'ice_eternal',   name: 'Beku Abadi',         icon: '❄️', type: 'heal_curse' } ],
    nature:  [ { id: 'nature_thorn',  name: 'Racun Duri',         icon: '🌵', type: 'dot', turns: 2, verb: 'keracunan' },
               { id: 'nature_roots',  name: 'Akar Membelit',      icon: '🌱', type: 'skill_tax' },
               { id: 'nature_spore',  name: 'Serbuk Lelap',       icon: '😴', type: 'time_squeeze', every: 4 },
               { id: 'nature_moss',   name: 'Lumut Penghisap',    icon: '🍄', type: 'heal_curse' } ],
    earth:   [ { id: 'earth_smash',   name: 'Hantaman Batu',      icon: '👊', type: 'charged_strike', every: 4 },
               { id: 'earth_slide',   name: 'Longsor',            icon: '⛰️', type: 'combo_seal' },
               { id: 'earth_quake',   name: 'Gempa Bumi',         icon: '🫨', type: 'energy_siphon' },
               { id: 'earth_collapse',name: 'Runtuhnya Gunung',   icon: '💥', type: 'phase_rage', base: 0.12 } ],
    wind:    [ { id: 'wind_gale',     name: 'Angin Topan',        icon: '💨', type: 'time_squeeze', every: 3 },
               { id: 'wind_slash',    name: 'Tebasan Angin',      icon: '🗡️', type: 'charged_strike', every: 5 },
               { id: 'wind_vortex',   name: 'Pusaran',            icon: '🌀', type: 'combo_seal' },
               { id: 'wind_storm',    name: 'Badai Sempurna',     icon: '🌪️', type: 'energy_siphon' } ],
    thunder: [ { id: 'thunder_shock', name: 'Sengatan',           icon: '⚡', type: 'energy_siphon' },
               { id: 'thunder_bolt',  name: 'Petir Menyambar',    icon: '🌩️', type: 'charged_strike', every: 4 },
               { id: 'thunder_short', name: 'Korsleting',         icon: '🔌', type: 'skill_tax' },
               { id: 'thunder_storm', name: 'Badai Petir',        icon: '⛈️', type: 'phase_rage', base: 0.12 } ],
    shadow:  [ { id: 'shadow_pierce', name: 'Kegelapan Menembus', icon: '🌑', type: 'shield_pierce' },
               { id: 'shadow_claw',   name: 'Cakar Bayangan',     icon: '🦇', type: 'charged_strike', every: 5 },
               { id: 'shadow_curse',  name: 'Kutukan Gelap',      icon: '🔮', type: 'heal_curse' },
               { id: 'shadow_eclipse',name: 'Gerhana',            icon: '🌘', type: 'time_squeeze', every: 3 } ],
    light:   [ { id: 'light_glare',   name: 'Silau',              icon: '😵‍💫', type: 'time_squeeze', every: 4 },
               { id: 'light_beam',    name: 'Sinar Penghancur',   icon: '☀️', type: 'charged_strike', every: 5, base: 0.25 },
               { id: 'light_mirror',  name: 'Pantulan Kristal',   icon: '💎', type: 'combo_seal' },
               { id: 'light_dawn',    name: 'Fajar Murka',        icon: '🌅', type: 'rage_damage', base: 0.15 } ],
    toxic:   [ { id: 'toxic_gas',     name: 'Gas Beracun',        icon: '☠️', type: 'dot', turns: 3, verb: 'keracunan', base: 0.05 },
               { id: 'toxic_fog',     name: 'Kabut Racun',        icon: '🌫️', type: 'heal_curse' },
               { id: 'toxic_acid',    name: 'Semprotan Asam',     icon: '🧪', type: 'shield_pierce' },
               { id: 'toxic_plague',  name: 'Wabah',              icon: '🦠', type: 'skill_tax' } ],
  };

  /* ---------- Pemetaan tema habitat → elemen (WAJIB diaudit/diisi eksplisit di T-00; kata kunci hanya cadangan) ---------- */
  const THEME_ELEMENT = {
    api: 'fire',
    laut: 'water',
    es: 'ice',
    hutan: 'nature',
    gua: 'earth',
    langit: 'wind',
    mesin: 'thunder',
    hantu: 'shadow',
    manis: 'light',
    rawa: 'toxic'
  };
  const KEYWORDS = [          // urutan penting: yang lebih spesifik lebih dulu
    ['fire', ['api', 'lava', 'volkan', 'vulkan', 'magma', 'berapi', 'fire']], ['ice', ['salju', 'kutub', 'beku', 'glasial', 'snow', 'ice', 'es']],
    ['water', ['laut', 'samudra', 'sungai', 'danau', 'pantai', 'air', 'ocean', 'sea']], ['nature', ['hutan', 'rimba', 'taman', 'kebun', 'forest', 'jungle']],
    ['thunder', ['petir', 'guntur', 'badai', 'listrik', 'thunder', 'storm']], ['wind', ['angin', 'langit', 'awan', 'udara', 'sky', 'wind']],
    ['shadow', ['bayang', 'malam', 'gelap', 'kuburan', 'shadow', 'night']], ['light', ['cahaya', 'kristal', 'surya', 'matahari', 'bintang', 'light', 'crystal']],
    ['toxic', ['racun', 'rawa', 'lumpur', 'toxic', 'swamp']], ['earth', ['tanah', 'batu', 'gua', 'gunung', 'tambang', 'gurun', 'bumi', 'earth', 'cave', 'desert']],
  ];
  function elementForTheme(themeKey) {
    const k = String(themeKey || '').toLowerCase();
    if (THEME_ELEMENT[k]) return THEME_ELEMENT[k];
    for (const [el, words] of KEYWORDS) if (words.some((w) => k.includes(w))) return el;
    return null;
  }
  // Kebalikannya: kunci tema pertama yang dipetakan ke elemen (dipakai Dex untuk memilih gambar monster); null bila belum ada.
  const themeForElement = (el) => Object.keys(THEME_ELEMENT).find((k) => THEME_ELEMENT[k] === el) || null;
  function validateThemeMap(themeKeys) {   // dipakai T-00/tes: tiap tema harus punya elemen; idealnya 1 tema = 1 elemen
    const mapping = {}; const missing = []; const seen = {}; const duplicates = [];
    for (const t of themeKeys) { const el = elementForTheme(t); if (!el) { missing.push(t); continue; } mapping[t] = el; if (seen[el]) duplicates.push(el); seen[el] = true; }
    return { ok: !missing.length && !duplicates.length, mapping, missing, duplicates };
  }

  /* ---------- Nilai efek ---------- */
  const scale = (tier, brutal) => (TIER_POWER[tier] || 1) * (brutal ? BRUTAL.skillMult : 1);
  function effectValue(skill, tier, brutal) { const a = ARCH[skill.type]; return Math.min(a.cap, (skill.base == null ? a.base : skill.base) * scale(tier, brutal)); }
  function skillsFor(element, tier, monsterId) {
    const kit = KITS[element] || [];
    if (!kit.length) return [];
    const count = SKILL_COUNT[tier] || 1;
    if (monsterId == null) {
      return kit.slice(0, count);
    }
    const mId = Number(monsterId);
    const offset = (!isNaN(mId) && mId > 0) ? ((mId - 1) % 10) : 0;

    if (tier === 'common') {
      const idx = offset % kit.length;
      return [kit[idx]].filter(Boolean);
    } else if (tier === 'rare') {
      const rareIdx = Math.max(0, offset - 4) % 3;
      if (rareIdx === 0) return [kit[0], kit[1 % kit.length]].filter(Boolean);
      if (rareIdx === 1) return [kit[1 % kit.length], kit[2 % kit.length]].filter(Boolean);
      return [kit[2 % kit.length], kit[3 % kit.length]].filter(Boolean);
    } else if (tier === 'epic') {
      const epicIdx = Math.max(0, offset - 7) % 2;
      if (epicIdx === 0) return [kit[0], kit[1 % kit.length], kit[2 % kit.length]].filter(Boolean);
      return [kit[1 % kit.length], kit[2 % kit.length], kit[3 % kit.length]].filter(Boolean);
    } else {
      return kit.slice(0, count);
    }
  }
  const every = (s) => s.every || 1;
  const hasSkill = (skills, type) => skills.filter((s) => s.type === type);

  /* ---------- Hook server ---------- */
  const newFx = () => ({ dotTurns: 0, dotFrac: 0, dotSkill: null });
  // Peringatan jurus untuk soal ke-idx (1-based). Deterministik → tanpa state tambahan; dihitung ulang saat menjawab.
  function telegraphFor(o) {
    let best = null;
    for (const s of hasSkill(skillsFor(o.element, o.tier, o.monsterId), 'charged_strike')) {
      if (o.idx % every(s) !== 0) continue;
      const v = effectValue(s, o.tier, o.brutal); const m = 1 + v;
      if (!best || m > best.mult) best = { skillId: s.id, name: s.name, icon: s.icon, mult: m, every: s.every };
    }
    return best;
  }
  // Dipanggil saat sebuah soal DISAJIKAN. o: { element,tier,brutal,idx,fx,monsterDamage,playerHp,monsterId }
  function onQuestionStart(o) {
    const skills = skillsFor(o.element, o.tier, o.monsterId); const fx = Object.assign(newFx(), o.fx); const events = []; let dotDamage = 0;
    if (fx.dotTurns > 0) {
      dotDamage = clamp(Math.ceil(o.monsterDamage * fx.dotFrac), 0, Math.max(0, o.playerHp - 1));   // DoT tidak pernah mengalahkan pemain
      fx.dotTurns -= 1; if (dotDamage > 0) events.push({ type: 'dot', skillId: fx.dotSkill, damage: dotDamage });
      if (fx.dotTurns === 0) { fx.dotFrac = 0; fx.dotSkill = null; }
    }
    let timeMult = 1;
    for (const s of hasSkill(skills, 'time_squeeze')) if (o.idx % every(s) === 0) { const v = effectValue(s, o.tier, o.brutal); timeMult *= 1 - v; events.push({ type: 'time', skillId: s.id, pct: Math.round(v * 100) }); }
    timeMult = Math.max(LIMITS.minTimeMult, timeMult);
    const telegraph = telegraphFor(o); if (telegraph) events.push({ type: 'telegraph', skillId: telegraph.skillId, mult: telegraph.mult });
    return { fx, dotDamage, telegraph, timeMult, events };
  }
  // Waktu akhir (dtk) dengan lantai pengaman.
  const applyTime = (baseSec, timeMult) => (timeMult >= 1 ? baseSec : Math.max(Math.min(baseSec, LIMITS.minTimeSec), Math.round(baseSec * timeMult)));
  // Dipanggil saat jawaban SALAH. o: { element,tier,brutal,idx,phase,bossHpRatio,baseDamage,playerMaxHp,energy,fx,monsterId }
  function onWrong(o) {
    const skills = skillsFor(o.element, o.tier, o.monsterId); const fx = Object.assign(newFx(), o.fx); const events = []; let mult = 1; let shieldMult = 1; let energyLoss = 0;
    for (const s of skills) {
      const v = effectValue(s, o.tier, o.brutal);
      if (s.type === 'rage_damage') { const m = 1 + v * (1 - clamp(o.bossHpRatio, 0, 1)); if (m > 1.001) { mult *= m; events.push({ type: 'rage', skillId: s.id, mult: m }); } }
      else if (s.type === 'phase_rage' && o.phase === 2) { mult *= 1 + v; events.push({ type: 'phase_rage', skillId: s.id, mult: 1 + v }); }
      else if (s.type === 'shield_pierce') { shieldMult *= 1 - v; }
      else if (s.type === 'energy_siphon' && o.energy > 0) { energyLoss = Math.max(energyLoss, Math.min(o.energy, Math.max(1, Math.ceil(o.energy * v)))); }
      else if (s.type === 'dot') { fx.dotTurns = s.turns || 2; fx.dotFrac = v; fx.dotSkill = s.id; events.push({ type: 'dot_start', skillId: s.id, turns: fx.dotTurns }); }
    }
    const tg = telegraphFor(o); if (tg) { mult *= tg.mult; events.push({ type: 'charged_hit', skillId: tg.skillId, mult: tg.mult }); }
    mult = Math.min(mult, LIMITS.maxDamageMult);
    const damage = Math.min(Math.ceil(o.baseDamage * mult), Math.ceil(o.playerMaxHp * LIMITS.maxHitPct));
    if (energyLoss > 0) events.push({ type: 'energy', skillId: (hasSkill(skills, 'energy_siphon')[0] || {}).id, amount: energyLoss });
    return { damage: Math.max(1, damage), shieldMult, energyLoss, fx, events };
  }
  // Pengubah sisi-skill pemain. o: { element,tier,brutal,phase,monsterId }
  function playerMods(o) {
    const skills = skillsFor(o.element, o.tier, o.monsterId); let healMult = 1, comboBonusMult = 1, extraCost = 0;
    for (const s of skills) {
      const v = effectValue(s, o.tier, o.brutal);
      if (s.type === 'heal_curse') healMult *= 1 - v;
      else if (s.type === 'combo_seal') comboBonusMult *= 1 - v;
      else if (s.type === 'skill_tax' && o.phase === 2) extraCost = Math.max(extraCost, Math.ceil(v));
    }
    return { healMult: Math.max(0.2, healMult), comboBonusMult: Math.max(0.1, comboBonusMult), extraCost };
  }

  /* ---------- Mode Brutal ---------- */
  const brutalAvailable = (level) => BRUTAL.enabled && (level | 0) >= BRUTAL.minLevel;
  const brutalRewardMult = (brutal) => (brutal ? BRUTAL.rewardMult : 1);   // dikalikan di atas pengali tier v6 (Progression.rewardMult)

  /* ---------- Teks (Monster Dex & banner) ---------- */
  function describeSkill(skill, tier, brutal) {
    const a = ARCH[skill.type]; return { id: skill.id, name: skill.name, icon: skill.icon, type: skill.type, text: a.text(effectValue(skill, tier, brutal), skill) };
  }
  const TIER_LINE = {
    common: () => 'Tier Common — 1 skill, efek dasar.',
    rare:   () => `Tier Rare — 2 skill, efek ×${fmt(TIER_POWER.rare, 2)} lebih kuat.`,
    epic:   () => `Tier Epic — 3 skill, efek ×${fmt(TIER_POWER.epic, 2)} lebih kuat.`,
    legend: () => `Tier Legend — 4 skill, efek ×${fmt(TIER_POWER.legend, 2)} lebih kuat.`,
  };
  function dexEntries() {
    const out = [];
    for (const el of ELEMENT_ORDER) for (const tier of TIERS) {
      const e = ELEMENTS[el];
      out.push({ id: `${el}:${tier}`, element: el, elementName: e.name, icon: e.icon, color: e.color, tier, tierLabel: RARITY_LABEL[tier], title: e.title,
        description: `${e.desc} ${TIER_LINE[tier]()}`,
        skills: skillsFor(el, tier).map((s) => ({ ...describeSkill(s, tier, false), textBrutal: describeSkill(s, tier, true).text })) });
    }
    return out;
  }

  /* ---------- Teks event (banner / toast) — sumber tunggal untuk klien ---------- */
  const SKILL_INDEX = {}; for (const el of ELEMENT_ORDER) for (const sk of KITS[el]) SKILL_INDEX[sk.id] = sk;
  function describeEvent(ev) {
    const sk = SKILL_INDEX[ev.skillId] || { name: 'Skill boss', icon: '✨' };
    switch (ev.type) {
      case 'telegraph':   return { kind: 'warn',   icon: '⚠️', text: `${sk.name}! Jawab BENAR untuk menghindar — jika salah, damage ×${fmt(ev.mult, 2)}.` };
      case 'charged_hit': return { kind: 'hit',    icon: sk.icon, text: `${sk.name} mengenaimu! Damage ×${fmt(ev.mult, 2)}.` };
      case 'rage':        return { kind: 'hit',    icon: sk.icon, text: `${sk.name}: damage ×${fmt(ev.mult, 2)} karena darah boss makin sedikit.` };
      case 'phase_rage':  return { kind: 'hit',    icon: sk.icon, text: `${sk.name}: boss sedang marah, damage ×${fmt(ev.mult, 2)}.` };
      case 'dot_start':   return { kind: 'status', icon: sk.icon, text: `${sk.name}: kamu terkena efek selama ${ev.turns} soal.` };
      case 'dot':         return { kind: 'hit',    icon: sk.icon, text: `${sk.name}: darahmu berkurang ${ev.damage}.` };
      case 'time':        return { kind: 'status', icon: sk.icon, text: `${sk.name}: waktu soal ini berkurang ${ev.pct}%.` };
      case 'energy':      return { kind: 'status', icon: sk.icon, text: `${sk.name}: energimu tersedot ${ev.amount} ⚡.` };
      default:            return { kind: 'info',   icon: '✨', text: '' };
    }
  }

  return { TIERS, TIER_POWER, SKILL_COUNT, BRUTAL, LIMITS, RARITY_LABEL, ARCH, ELEMENTS, ELEMENT_ORDER, KITS, THEME_ELEMENT, KEYWORDS,
    elementForTheme, themeForElement, validateThemeMap, scale, effectValue, skillsFor, newFx, telegraphFor, onQuestionStart, applyTime, onWrong, playerMods,
    brutalAvailable, brutalRewardMult, describeSkill, describeEvent, dexEntries, SKILL_INDEX };
});
