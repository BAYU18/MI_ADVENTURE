(function(root) {
  'use strict';

let SkinArt;
try {
  SkinArt = require('./skin-art.js');
} catch (e) {
  if (typeof root !== 'undefined' && root.SkinArt) SkinArt = root.SkinArt;
  else if (typeof window !== 'undefined' && window.SkinArt) SkinArt = window.SkinArt;
}

let PetArt;
try {
  PetArt = require('./pet-art.js');
} catch (e) {
  if (typeof root !== 'undefined' && root.PetArt) PetArt = root.PetArt;
  else if (typeof window !== 'undefined' && window.PetArt) PetArt = window.PetArt;
}

const SKINS = ['#FFDDB8', '#F2B98C', '#D9955F', '#A66A3F', '#7A4A2A'];
const HAIRS = ['#2B1B3D', '#6B3F1D', '#E8B84A', '#C8453A', '#3A7BD5', '#7C4DFF'];
const K = '#2B1B3D'; // warna kontur
const st = `stroke="${K}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
const TWEMOJI = 'https://cdn.jsdelivr.net/npm/@twemoji/svg@latest';

const mix = (hexA, hexB, t) => {
  const parse = (h) => {
    if (typeof h === 'number') h = SKINS[h] || HAIRS[h] || '#ffffff';
    let c = String(h || '#ffffff').replace('#', '');
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

const resolveColor = (val, palette, defaultIdx = 0) => {
  if (typeof val === 'number') return palette[val] || palette[defaultIdx];
  if (typeof val === 'string' && val.startsWith('#')) return val;
  if (typeof val === 'string' && !isNaN(parseInt(val, 10)) && palette[parseInt(val, 10)]) return palette[parseInt(val, 10)];
  return palette[defaultIdx];
};

function makeItem(fn) {
  fn.toString = function() { return fn('def'); };
  return fn;
}

const BG = {
  bg_meadow: ['#B9EBFF', '#7BD65B'],
  bg_sky: ['#9BE0FF', '#E6F8FF'],
  bg_sunset: ['#FFD27A', '#FF7A8A'],
  bg_candy: ['#FFC3E1', '#FFA0C8'],
  bg_cave: ['#6B5B95', '#2D2250'],
  bg_night: ['#4A3A8F', '#1B1340'],
  bg_aurora: ['#0B1B4A', '#16296B']
};

const PET = {
  pet_cat: '1f431',
  pet_dog: '1f436',
  pet_penguin: '1f427',
  pet_fox: '1f98a',
  pet_owl: '1f989',
  pet_dragon: '1f432'
};

// ---- lapisan "belakang badan" (jubah) ----
const OUTFIT_BACK = {
  outfit_cape: makeItem((uid = 'def') => `
    <path d="M64 124Q40 170 56 188H144Q160 170 136 124Z" fill="url(#ob-${uid})" ${st}/>
    <path d="M80 130Q70 164 78 186M120 130Q130 164 122 186" stroke="#7a1218" stroke-width="2.5" opacity=".45" fill="none" stroke-linecap="round"/>
  `),
};

// ---- pakaian (di atas torso) ----
const OUTFIT = {
  outfit_vest: makeItem((uid = 'def') => `
    <path d="M70 126h60v50H70z" fill="url(#ov-${uid})" ${st}/>
    <path d="M70 126h60v50H70z" fill="url(#ovs-${uid})"/>
    <path d="M100 126v50" ${st}/>
    <path d="M74 130h22M104 130h22" stroke="#fff" stroke-width="3" opacity=".4" stroke-linecap="round"/>
    <circle cx="92" cy="146" r="3.2" fill="${K}"/><circle cx="92" cy="162" r="3.2" fill="${K}"/>
    <circle cx="91" cy="145" r="1" fill="#fff" opacity=".8"/><circle cx="91" cy="161" r="1" fill="#fff" opacity=".8"/>
  `),
  outfit_stripes: makeItem((uid = 'def') => `
    <rect x="70" y="126" width="60" height="50" rx="14" fill="#ffffff" ${st}/>
    <g stroke="url(#os-${uid})" stroke-width="7">
      <path d="M72 140h56M72 156h56M74 170h52"/>
    </g>
    <path d="M70 126h60v50H70z" fill="url(#ovs-${uid})"/>
    <rect x="70" y="126" width="60" height="50" rx="14" fill="none" ${st}/>
    <path d="M74 130h52" stroke="#fff" stroke-width="3" opacity=".4" stroke-linecap="round"/>
  `),
  outfit_labcoat: makeItem((uid = 'def') => `
    <path d="M68 126h64v54H68z" fill="url(#lc-${uid})" ${st}/>
    <path d="M68 126h64v54H68z" fill="url(#ovs-${uid})"/>
    <path d="M100 126v54M88 126l12 14 12-14" fill="none" ${st}/>
    <path d="M72 130h20M108 130h20" stroke="#fff" stroke-width="3" opacity=".4" stroke-linecap="round"/>
    <rect x="108" y="150" width="14" height="12" rx="2" fill="#CFE9FF" stroke="${K}" stroke-width="3"/>
    <path d="M112 147v6" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
  `),
  outfit_cape: makeItem((uid = 'def') => `
    <rect x="70" y="126" width="60" height="50" rx="14" fill="url(#oc-${uid})" ${st}/>
    <path d="M72 128Q100 146 128 128" fill="url(#oe-${uid})" ${st}/>
    <circle cx="100" cy="140" r="5.5" fill="url(#og-${uid})" stroke="${K}" stroke-width="3"/>
    <circle cx="98.5" cy="138.5" r="1.6" fill="#fff"/>
    <path d="M76 134Q84 130 92 132" stroke="#fff" stroke-width="3" opacity=".5" fill="none" stroke-linecap="round"/>
  `),
  outfit_armor: makeItem((uid = 'def') => `
    <path d="M68 126h64v52H68z" fill="url(#am-${uid})" ${st}/>
    <path d="M76 138h48M76 152h48M76 166h48" stroke="${K}" stroke-width="3" fill="none"/>
    <path d="M76 136h48" stroke="#fff" stroke-width="2" opacity=".6" fill="none" stroke-linecap="round"/>
    <circle cx="64" cy="130" r="12" fill="url(#ams-${uid})" ${st}/>
    <circle cx="136" cy="130" r="12" fill="url(#ams-${uid})" ${st}/>
    <circle cx="62" cy="128" r="3" fill="#fff" opacity=".7"/>
    <circle cx="134" cy="128" r="3" fill="#fff" opacity=".7"/>
    <g clip-path="url(#amc-${uid})">
      <g class="fx-sweep" style="animation-duration:5s"><g transform="rotate(20 100 150)"><rect x="-20" y="110" width="16" height="100" fill="url(#ksw-${uid})"/></g></g>
    </g>
  `),
  outfit_robe: makeItem((uid = 'def') => `
    <path d="M66 126h68l8 56H58z" fill="url(#or-${uid})" ${st}/>
    <path d="M66 126h68l8 56H58z" fill="url(#orsh-${uid})"/>
    <path d="M100 126v56" ${st}/>
    <path d="M60 176H140" stroke="url(#org-${uid})" stroke-width="4" stroke-linecap="round"/>
    <g fill="url(#org-${uid})">
      <path d="M82 146l3 6 6 1-5 4 2 6-6-4-6 4 2-6-5-4 6-1z"/>
      <path d="M122 164l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z"/>
    </g>
    <g clip-path="url(#orc-${uid})">
      <g class="fx-sweep" style="animation-duration:5.5s"><g transform="rotate(20 100 150)"><rect x="-20" y="90" width="16" height="120" fill="url(#orsw-${uid})"/></g></g>
    </g>
  `),
};

// ---- topi / hiasan kepala ----
const HAT = {
  hat_explorer: makeItem((uid = 'def') => `
    <ellipse cx="100" cy="66" rx="48" ry="11" fill="url(#hb-${uid})" ${st}/>
    <path d="M68 66Q70 34 100 34Q130 34 132 66Z" fill="url(#hd-${uid})" ${st}/>
    <rect x="70" y="54" width="60" height="9" fill="url(#hbd-${uid})"/>
    <path d="M68 66Q70 34 100 34Q130 34 132 66" fill="none" ${st}/>
    <path d="M78 52Q84 40 96 38" stroke="#fff" stroke-width="3.5" opacity=".55" fill="none" stroke-linecap="round"/>
    <ellipse cx="82" cy="62" rx="16" ry="2.2" fill="#fff" opacity=".25"/>
  `),
  hat_headphones: makeItem((uid = 'def') => `
    <path d="M64 84Q64 40 100 40Q136 40 136 84" fill="none" stroke="${K}" stroke-width="9" stroke-linecap="round"/>
    <path d="M70 70Q74 46 100 46Q126 46 130 70" fill="none" stroke="#64748b" stroke-width="3" opacity=".6" stroke-linecap="round"/>
    <rect x="54" y="78" width="16" height="28" rx="8" fill="url(#hp-${uid})" ${st}/>
    <rect x="130" y="78" width="16" height="28" rx="8" fill="url(#hp-${uid})" ${st}/>
    <ellipse cx="62" cy="90" rx="3" ry="8" fill="#fff" opacity=".4"/>
    <ellipse cx="138" cy="90" rx="3" ry="8" fill="#fff" opacity=".4"/>
  `),
  hat_chef: makeItem((uid = 'def') => `
    <rect x="72" y="52" width="56" height="16" fill="url(#chb-${uid})" ${st}/>
    <g fill="url(#chb-${uid})" ${st}>
      <circle cx="82" cy="46" r="14"/><circle cx="100" cy="38" r="16"/><circle cx="118" cy="46" r="14"/>
    </g>
    <rect x="72" y="52" width="56" height="16" fill="url(#chb-${uid})" ${st}/>
    <path d="M76 56h48" stroke="#fff" stroke-width="2" opacity=".6" stroke-linecap="round"/>
    <ellipse cx="100" cy="34" rx="8" ry="4" fill="#fff" opacity=".5"/>
  `),
  hat_pirate: makeItem((uid = 'def') => `
    <path d="M56 68Q100 20 144 68Q100 58 56 68Z" fill="url(#pt-${uid})" ${st}/>
    <path d="M62 66Q100 28 138 66" stroke="url(#org-${uid})" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="100" cy="50" r="6" fill="#ffffff" stroke="${K}" stroke-width="1.5"/>
    <circle cx="98" cy="49" r="1.2" fill="${K}"/><circle cx="102" cy="49" r="1.2" fill="${K}"/>
    <path d="M96 56l8 0M100 52v8" stroke="${K}" stroke-width="2"/>
    <path d="M70 56Q84 40 96 38" stroke="#fff" stroke-width="2.5" opacity=".4" fill="none" stroke-linecap="round"/>
  `),
  hat_knight: makeItem((uid = 'def') => `
    <path d="M100 34V14" stroke="${K}" stroke-width="12" stroke-linecap="round"/>
    <path d="M100 34V14" stroke="url(#kp-${uid})" stroke-width="8" stroke-linecap="round"/>
    <path d="M98 30V18" stroke="#fff" stroke-width="2" opacity=".6" stroke-linecap="round"/>
    <path d="M64 84V62Q64 34 100 34Q136 34 136 62V84H120V70H80V84Z" fill="url(#km-${uid})" ${st}/>
    <path d="M80 70h40" ${st}/>
    <path d="M72 58Q76 42 92 38" stroke="#fff" stroke-width="3" opacity=".65" fill="none" stroke-linecap="round"/>
    <g clip-path="url(#kc-${uid})">
      <g class="fx-sweep" style="animation-duration:5s"><g transform="rotate(20 100 60)"><rect x="-10" y="20" width="14" height="90" fill="url(#ksw-${uid})"/></g></g>
    </g>
  `),
  hat_bunny: makeItem((uid = 'def') => `
    <g fill="url(#bny-${uid})" ${st}>
      <ellipse cx="82" cy="30" rx="10" ry="28"/>
      <ellipse cx="118" cy="30" rx="10" ry="28"/>
    </g>
    <g fill="url(#bnyp-${uid})">
      <ellipse cx="82" cy="32" rx="4.5" ry="19"/>
      <ellipse cx="118" cy="32" rx="4.5" ry="19"/>
    </g>
    <ellipse cx="80" cy="22" rx="2" ry="7" fill="#fff" opacity=".6"/>
    <ellipse cx="116" cy="22" rx="2" ry="7" fill="#fff" opacity=".6"/>
  `),
  hat_wizard: makeItem((uid = 'def') => `
    <circle class="fx-pulse" cx="100" cy="30" r="26" fill="url(#wl-${uid})"/>
    <path d="M62 68L100 6L138 68Z" fill="url(#wz-${uid})" ${st}/>
    <ellipse cx="100" cy="68" rx="46" ry="9" fill="url(#wb-${uid})" ${st}/>
    <path d="M68 61Q100 53 132 61" stroke="url(#wg-${uid})" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M86 52L98 16" stroke="#fff" stroke-width="3" opacity=".4" fill="none" stroke-linecap="round"/>
    <path d="M98 30l3 6 6 1-5 4 2 6-6-4-6 4 2-6-5-4 6-1z" fill="url(#wg-${uid})"/>
    <g transform="translate(80 38) scale(0.8)"><path class="fx-twinkle" style="animation-delay:0.2s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
    <g transform="translate(120 52) scale(0.7)"><path class="fx-twinkle" style="animation-delay:1s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
    <g transform="translate(104 8) scale(1)"><path class="fx-twinkle" style="animation-delay:0.6s" fill="#fff6c9" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
  `),
  hat_crown: makeItem((uid = 'def') => `
    <ellipse class="fx-pulse" cx="100" cy="48" rx="56" ry="34" fill="url(#ch-${uid})"/>
    <path d="M68 66L70 34L86 52L100 28L114 52L130 34L132 66Z" fill="url(#cg-${uid})" ${st}/>
    <path d="M68.5 57H131.5L132 66H68Z" fill="#B7700B" opacity=".55"/>
    <path d="M69 57H131" stroke="#fff3b0" stroke-width="2" opacity=".8"/>
    <path d="M74 52L75 40M92 46L100 34" stroke="#fff" stroke-width="2.6" opacity=".6" stroke-linecap="round"/>
    <g clip-path="url(#cc-${uid})">
      <g class="fx-sweep" style="animation-duration:3.6s"><g transform="rotate(20 100 50)"><rect x="-10" y="20" width="16" height="60" fill="url(#csw-${uid})"/></g></g>
    </g>
    <g stroke="#78350f" stroke-width="1.5">
      <circle cx="70" cy="34" r="4.2" fill="url(#cp-${uid})"/>
      <circle cx="100" cy="28" r="4.8" fill="url(#cp-${uid})"/>
      <circle cx="130" cy="34" r="4.2" fill="url(#cp-${uid})"/>
    </g>
    <ellipse cx="100" cy="53" rx="6" ry="5.4" fill="url(#cr-${uid})" stroke="#7f1d1d" stroke-width="1.5"/>
    <circle cx="98.4" cy="51" r="1.6" fill="#fff"/>
    <circle cx="82" cy="62" r="3" fill="url(#cb-${uid})" stroke="#1e3a8a" stroke-width="1"/>
    <circle cx="118" cy="62" r="3" fill="url(#cb-${uid})" stroke="#1e3a8a" stroke-width="1"/>
    <g transform="translate(70 33) scale(1)"><path class="fx-glint" style="animation-delay:0s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
    <g transform="translate(100 26) scale(1.3)"><path class="fx-glint" style="animation-delay:0.8s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
    <g transform="translate(130 33) scale(1)"><path class="fx-glint" style="animation-delay:1.6s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
  `),
};

// ---- senjata / alat (tangan kanan, sisi layar kanan) ----
const WEAPON = {
  weapon_sword: makeItem((uid = 'def') => `
    <polygon points="145.7,148.6 154.3,151.4 171.7,91.7 170.5,82 167.7,90.3" fill="url(#sb-${uid})" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M150 149L169.6 90" stroke="#fff" stroke-width="1.6" opacity=".8" stroke-linecap="round"/>
    <path d="M141 146l20 9" stroke="${K}" stroke-width="11" stroke-linecap="round"/>
    <path d="M141 146l20 9" stroke="url(#sg-${uid})" stroke-width="7" stroke-linecap="round"/>
    <circle cx="151" cy="150.5" r="3" fill="url(#sgm-${uid})" stroke="#1e3a8a" stroke-width="1"/>
    <circle cx="150" cy="149.5" r=".9" fill="#fff"/>
    <g transform="translate(170 84) scale(1.1)"><path class="fx-glint" style="animation-delay:0s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
  `),
  weapon_wand: makeItem((uid = 'def') => `
    <circle class="fx-pulse" cx="172" cy="102" r="20" fill="url(#wgl-${uid})"/>
    <path d="M148 160L172 104" stroke="${K}" stroke-width="10" stroke-linecap="round" opacity=".3"/>
    <path d="M148 160L172 104" stroke="url(#ws-${uid})" stroke-width="7" stroke-linecap="round"/>
    <path d="M147 157L170 104" stroke="#fff" stroke-width="1.8" opacity=".45" stroke-linecap="round"/>
    <path d="M172 90l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="url(#wg2-${uid})" stroke="${K}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M172 94l1.8 4.4" stroke="#fff" stroke-width="2" opacity=".8" stroke-linecap="round"/>
    <g transform="translate(188 84) scale(0.9)"><path class="fx-twinkle" style="animation-delay:0.2s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
    <g transform="translate(156 92) scale(0.7)"><path class="fx-twinkle" style="animation-delay:1s" fill="#fff6c9" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
  `),
  weapon_shield: makeItem((uid = 'def') => `
    <path d="M138 128h40v30Q158 182 138 158Z" fill="url(#shd-${uid})" ${st}/>
    <path d="M142 132h32v24Q158 174 142 154Z" fill="none" stroke="#fff" stroke-width="2" opacity=".4"/>
    <path d="M158 132v40" stroke="url(#sg-${uid})" stroke-width="5" stroke-linecap="round"/>
    <circle cx="158" cy="148" r="5" fill="url(#sg-${uid})" stroke="${K}" stroke-width="2"/>
    <circle cx="156.5" cy="146.5" r="1.5" fill="#fff"/>
  `),
  weapon_book: makeItem((uid = 'def') => `
    <rect x="140" y="132" width="36" height="28" rx="4" fill="url(#bk-${uid})" ${st}/>
    <path d="M158 132v28" ${st}/>
    <path d="M146 142h8M162 142h8" stroke="url(#org-${uid})" stroke-width="3" stroke-linecap="round"/>
    <path d="M144 135h12M162 135h12" stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round"/>
    <polygon points="158,160 155,168 158,166 161,168" fill="#FBBF24"/>
  `),
  weapon_telescope: makeItem((uid = 'def') => `
    <path d="M140 156L176 120" stroke="${K}" stroke-width="16" stroke-linecap="round" opacity=".35"/>
    <path d="M140 156L176 120" stroke="url(#tb-${uid})" stroke-width="12" stroke-linecap="round"/>
    <path d="M139 153L173 119" stroke="#fff" stroke-width="2.6" opacity=".45" stroke-linecap="round"/>
    <path d="M168 128L180 116" stroke="url(#tg-${uid})" stroke-width="14" stroke-linecap="round"/>
    <path d="M166 126L178 114" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/>
    <circle cx="181" cy="115" r="5" fill="url(#tl-${uid})" stroke="${K}" stroke-width="2"/>
    <circle cx="179.5" cy="113.5" r="1.4" fill="#fff"/>
  `),
};

// ---- bingkai avatar (frame) ----
const FRAME = {
  frame_wood: makeItem((uid = 'def') => `
    <rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="url(#fw-${uid})" stroke-width="8"/>
    <rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#E7BE82" stroke-width="3"/>
    <path d="M12 40V30Q12 12 30 12H42" stroke="#fff" stroke-width="2" opacity=".5" fill="none" stroke-linecap="round"/>
    <circle cx="14" cy="14" r="5" fill="url(#fb-${uid})"/><circle cx="12.6" cy="12.6" r="1.3" fill="#fff" opacity=".7"/>
    <circle cx="186" cy="14" r="5" fill="url(#fb-${uid})"/><circle cx="184.6" cy="12.6" r="1.3" fill="#fff" opacity=".7"/>
    <circle cx="14" cy="186" r="5" fill="url(#fb-${uid})"/><circle cx="12.6" cy="184.6" r="1.3" fill="#fff" opacity=".7"/>
    <circle cx="186" cy="186" r="5" fill="url(#fb-${uid})"/><circle cx="184.6" cy="184.6" r="1.3" fill="#fff" opacity=".7"/>
  `),
  frame_leaf: makeItem((uid = 'def') => `
    <rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="url(#fl-${uid})" stroke-width="8"/>
    <rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#A3E635" stroke-width="2"/>
    <path d="M10 20Q20 10 30 20Q20 30 10 20Z" fill="#48C774" stroke="${K}" stroke-width="1.5"/>
    <path d="M170 20Q180 10 190 20Q180 30 170 20Z" fill="#48C774" stroke="${K}" stroke-width="1.5"/>
    <path d="M10 180Q20 170 30 180Q20 190 10 180Z" fill="#48C774" stroke="${K}" stroke-width="1.5"/>
    <path d="M170 180Q180 170 190 180Q180 190 170 180Z" fill="#48C774" stroke="${K}" stroke-width="1.5"/>
    <path d="M14 28Q22 18 26 24" stroke="#fff" stroke-width="1.5" opacity=".6" fill="none"/>
  `),
  frame_silver: makeItem((uid = 'def') => `
    <rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="url(#fs-${uid})" stroke-width="8"/>
    <rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#F1F5F9" stroke-width="2.4"/>
    <g fill="url(#fsc-${uid})" stroke="#64748B" stroke-width="1">
      <polygon points="4,24 24,4 4,4"/><polygon points="196,24 176,4 196,4"/>
      <polygon points="4,176 24,196 4,196"/><polygon points="196,176 176,196 196,196"/>
    </g>
    <rect class="fx-run" x="4" y="4" width="192" height="192" rx="26" pathLength="1000" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="60 940" stroke-linecap="round" opacity=".9"/>
  `),
  frame_flame: makeItem((uid = 'def') => `
    <rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="url(#ff-${uid})" stroke-width="8"/>
    <rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#F59E0B" stroke-width="3"/>
    <path d="M10 30Q16 14 26 22Q30 6 38 18" stroke="#FBBF24" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M190 30Q184 14 174 22Q170 6 162 18" stroke="#FBBF24" stroke-width="4" fill="none" stroke-linecap="round"/>
    <rect class="fx-run" x="4" y="4" width="192" height="192" rx="26" pathLength="1000" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="50 450" stroke-linecap="round" opacity=".8"/>
  `),
  frame_gold: makeItem((uid = 'def') => `
    <rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="url(#fg-${uid})" stroke-width="8"/>
    <rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#FFF3B0" stroke-width="2.4"/>
    <rect x="1.5" y="1.5" width="197" height="197" rx="28" fill="none" stroke="#7a4a05" stroke-width="1.2" opacity=".6"/>
    <circle class="fx-gem" cx="100" cy="10" r="6.5" fill="url(#gr-${uid})" stroke="#78350F" stroke-width="2"/><circle cx="98.2" cy="8" r="1.7" fill="#fff"/>
    <circle class="fx-gem" cx="10" cy="100" r="6.5" fill="url(#gb-${uid})" stroke="#1E3A8A" stroke-width="2"/><circle cx="8.2" cy="98" r="1.7" fill="#fff"/>
    <circle class="fx-gem" cx="190" cy="100" r="6.5" fill="url(#gb-${uid})" stroke="#1E3A8A" stroke-width="2"/><circle cx="188.2" cy="98" r="1.7" fill="#fff"/>
    <circle class="fx-gem" cx="100" cy="190" r="6.5" fill="url(#gn-${uid})" stroke="#064E3B" stroke-width="2"/><circle cx="98.2" cy="188" r="1.7" fill="#fff"/>
    <rect class="fx-run" x="4" y="4" width="192" height="192" rx="26" pathLength="1000" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="70 430" stroke-linecap="round" opacity=".85"/>
    <g transform="translate(18 18) scale(0.9)"><path class="fx-twinkle" style="animation-delay:0s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
    <g transform="translate(182 182) scale(0.9)"><path class="fx-twinkle" style="animation-delay:1.2s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
  `),
  frame_rainbow: makeItem((uid = 'def') => `
    <rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="url(#fr-${uid})" stroke-width="10"/>
    <rect x="10.5" y="10.5" width="179" height="179" rx="20" fill="none" stroke="url(#frg-${uid})" stroke-width="2.4"/>
    <rect x="2" y="2" width="196" height="196" rx="28" fill="none" stroke="#fff" stroke-width="1.4" opacity=".7"/>
    <rect class="fx-run" x="4" y="4" width="192" height="192" rx="26" pathLength="1000" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="80 420" stroke-linecap="round" opacity=".9"/>
    <circle class="fx-gem" cx="100" cy="5" r="5.5" fill="url(#frm-${uid})" stroke="#78350f" stroke-width="1.6"/>
    <circle class="fx-gem" cx="5" cy="100" r="5.5" fill="url(#frm-${uid})" stroke="#78350f" stroke-width="1.6"/>
    <circle class="fx-gem" cx="195" cy="100" r="5.5" fill="url(#frm-${uid})" stroke="#78350f" stroke-width="1.6"/>
    <circle class="fx-gem" cx="100" cy="195" r="5.5" fill="url(#frm-${uid})" stroke="#78350f" stroke-width="1.6"/>
    <g transform="translate(20 20) scale(1.2)"><path class="fx-glint" style="animation-delay:0s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
    <g transform="translate(180 20) scale(1.2)"><path class="fx-glint" style="animation-delay:0.8s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
    <g transform="translate(20 180) scale(1.2)"><path class="fx-glint" style="animation-delay:1.6s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
    <g transform="translate(180 180) scale(1.2)"><path class="fx-glint" style="animation-delay:2.4s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
  `),
};

function renderBgElements(bgId, uid) {
  switch (bgId) {
    case 'bg_sky':
      return `<rect width="200" height="200" fill="url(#bm-${uid})"/>
        <circle cx="160" cy="40" r="48" fill="url(#bsun-${uid})"/>
        <circle cx="160" cy="40" r="14" fill="#FFF3A6"/>
        <g fill="#fff" opacity=".85">
          <ellipse cx="36" cy="48" rx="24" ry="8"/><ellipse cx="52" cy="42" rx="16" ry="9"/>
          <ellipse cx="140" cy="78" rx="20" ry="7"/><ellipse cx="154" cy="72" rx="14" ry="7"/>
        </g>`;
    case 'bg_sunset':
      return `<rect width="200" height="200" fill="url(#bs-${uid})"/>
        <circle cx="100" cy="150" r="70" fill="url(#bsg-${uid})"/>
        <circle cx="100" cy="146" r="26" fill="url(#bss-${uid})"/>
        <g fill="#fff" opacity=".35">
          <ellipse cx="46" cy="60" rx="38" ry="5"/><ellipse cx="150" cy="82" rx="34" ry="4.5"/>
          <ellipse cx="120" cy="44" rx="26" ry="3.5"/>
        </g>
        <path d="M0 168Q50 156 100 166T200 160V200H0Z" fill="#ff5f87" opacity=".55"/>
        <path d="M0 182Q60 172 110 181T200 176V200H0Z" fill="#c93a73" opacity=".6"/>`;
    case 'bg_candy':
      return `<rect width="200" height="200" fill="url(#bcandy-${uid})"/>
        <circle cx="150" cy="45" r="40" fill="url(#bsun-${uid})"/>
        <circle cx="150" cy="45" r="12" fill="#fff"/>
        <g fill="#fff" opacity=".5">
          <ellipse cx="45" cy="50" rx="22" ry="7"/><ellipse cx="60" cy="45" rx="16" ry="8"/>
        </g>
        <ellipse cx="30" cy="206" rx="100" ry="52" fill="#f472b6" opacity=".4"/>
        <ellipse cx="176" cy="212" rx="104" ry="56" fill="#c084fc" opacity=".4"/>`;
    case 'bg_cave':
      return `<rect width="200" height="200" fill="url(#bcave-${uid})"/>
        <g fill="#a855f7" opacity=".3">
          <polygon points="20,0 28,50 36,0"/><polygon points="70,0 76,40 82,0"/>
          <polygon points="120,0 128,45 136,0"/><polygon points="170,0 175,35 180,0"/>
        </g>
        <g fill="#c084fc" opacity=".4">
          <polygon points="10,200 16,160 22,200"/><polygon points="180,200 186,155 192,200"/>
        </g>`;
    case 'bg_night':
      return `<rect width="200" height="200" fill="url(#bny-${uid})"/>
        <circle cx="140" cy="50" r="64" fill="url(#bnb-${uid})"/>
        <circle cx="156" cy="40" r="15" fill="url(#bnm-${uid})"/>
        <circle cx="162" cy="36" r="13" fill="#2f2478" opacity=".55"/>
        <g transform="translate(24 30) scale(0.8)"><path class="fx-twinkle" style="animation-delay:0s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
        <g transform="translate(60 18) scale(0.6)"><path class="fx-twinkle" style="animation-delay:0.8s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
        <g transform="translate(92 46) scale(0.7)"><path class="fx-twinkle" style="animation-delay:1.6s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
        <g transform="translate(170 80) scale(0.7)"><path class="fx-twinkle" style="animation-delay:0.4s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>`;
    case 'bg_aurora':
      return `<rect width="200" height="200" fill="url(#ba-${uid})"/>
        <g class="fx-drift"><path d="M-20 60C30 20 70 100 120 50S190 40 220 70V130C170 100 130 150 90 112S20 130-20 120Z" fill="url(#ar1-${uid})"/></g>
        <g class="fx-drift2"><path d="M-20 100C40 60 80 130 130 84S200 80 220 100V150C170 130 120 170 80 140S20 150-20 140Z" fill="url(#ar2-${uid})"/></g>
        <g transform="translate(22 22) scale(0.8)"><path class="fx-twinkle" style="animation-delay:0s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
        <g transform="translate(70 12) scale(0.6)"><path class="fx-twinkle" style="animation-delay:0.6s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
        <g transform="translate(176 28) scale(0.8)"><path class="fx-twinkle" style="animation-delay:1.3s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>`;
    case 'bg_meadow':
    default:
      return `<rect width="200" height="200" fill="url(#bm-${uid})"/>
        <circle cx="160" cy="38" r="52" fill="url(#bsun-${uid})"/>
        <circle cx="160" cy="38" r="12" fill="#FFF3A6"/>
        <g fill="#fff" opacity=".9">
          <ellipse cx="40" cy="42" rx="20" ry="7"/><ellipse cx="54" cy="36" rx="14" ry="8"/>
          <ellipse cx="100" cy="24" rx="14" ry="5"/>
        </g>
        <ellipse cx="30" cy="206" rx="100" ry="52" fill="url(#bh1-${uid})"/>
        <ellipse cx="176" cy="212" rx="104" ry="56" fill="url(#bh2-${uid})"/>`;
  }
}

function renderPetElement(petId, uid) {
  if (!petId) return '';

  // 1. Cek Vektor Orisinal 3D Shiny PetArt (28 Pet Baru & 7 Pet Legasi)
  const petArtModule = PetArt || (typeof root !== 'undefined' && root.PetArt) || (typeof window !== 'undefined' && window.PetArt);
  if (petArtModule && typeof petArtModule.embedPetArt === 'function') {
    const art = petArtModule.embedPetArt(petId, uid, { x: 4, y: 132, size: 56 });
    if (art) return art;
  }

  // 1.5 Cek SkinArt jika pet terdaftar di katalog mythic
  const sa = (typeof window !== 'undefined' && window.SkinArt) || (typeof root !== 'undefined' && root.SkinArt) || SkinArt;
  if (sa && typeof sa.has === 'function' && sa.has(petId) && typeof sa.renderPet === 'function') {
    const art = sa.renderPet(petId, uid);
    if (art) return art;
  }

  // 2. Fallback Twemoji Legacy
  if (!PET[petId]) return '';
  const code = PET[petId];
  const isEpic = petId === 'pet_owl';
  const isLegend = petId === 'pet_dragon' || petId === 'pet_phoenix';
  const isRare = petId === 'pet_penguin' || petId === 'pet_fox';

  let petAura = `<ellipse cx="32" cy="182" rx="28" ry="6.5" fill="url(#pp-${uid})"/>`;
  let petExtra = '';

  if (isRare) {
    petAura += `<circle class="fx-pulse" cx="32" cy="160" r="28" fill="url(#ppr-${uid})"/>`;
  } else if (isEpic) {
    petAura += `<circle class="fx-pulse" cx="32" cy="160" r="30" fill="url(#ppe-${uid})"/>`;
    petExtra += `<circle class="fx-rise" style="animation-delay:0.0s" cx="34" cy="160" r="2" fill="#e9d5ff"/>
                 <circle class="fx-rise" style="animation-delay:1.5s" cx="24" cy="165" r="1.8" fill="#e9d5ff"/>`;
  } else if (isLegend) {
    petAura += `<circle class="fx-pulse" cx="32" cy="160" r="34" fill="url(#pg-${uid})"/>`;
    petExtra += `<g transform="translate(10 140) scale(0.8)"><path class="fx-twinkle" style="animation-delay:0.3s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
                 <g transform="translate(56 150) scale(0.7)"><path class="fx-twinkle" style="animation-delay:1.1s" fill="#fff6c9" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>`;
  }

  const imgClass = (isEpic || isLegend) ? 'fx-float-sm' : '';
  return `${petAura}${petExtra}<image class="${imgClass}" href="${TWEMOJI}/${code}.svg" x="8" y="136" width="48" height="48"/>`;
}

function getAllItemDefs(uid, skinBase = '#F2B98C', hairBase = '#6B3F1D') {
  const skinLight = mix(skinBase, '#ffffff', 0.35);
  const skinDark  = mix(skinBase, '#7a3b10', 0.25);
  const hairLight = mix(hairBase, '#ffffff', 0.3);
  const hairDark  = mix(hairBase, '#000000', 0.4);

  return `
  <radialGradient id="sk-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="${skinLight}"/>
    <stop offset="0.45" stop-color="${skinBase}"/>
    <stop offset="1" stop-color="${skinDark}"/>
  </radialGradient>
  <radialGradient id="hr-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="${hairLight}"/>
    <stop offset="0.45" stop-color="${hairBase}"/>
    <stop offset="1" stop-color="${hairDark}"/>
  </radialGradient>
  <radialGradient id="tr-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="#FFB777"/>
    <stop offset="0.45" stop-color="#FF8A3D"/>
    <stop offset="1" stop-color="#D96A1F"/>
  </radialGradient>
  <linearGradient id="hs-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.55" stop-color="#7a3b10" stop-opacity="0"/>
    <stop offset="1" stop-color="#7a3b10" stop-opacity="0.25"/>
  </linearGradient>
  <radialGradient id="ck-${uid}" cx=".5" cy=".5" r="0.5">
    <stop offset="0" stop-color="#ffc2cf"/><stop offset="0.45" stop-color="#FF8FA3"/><stop offset="1" stop-color="#f0627f"/>
  </radialGradient>
  <radialGradient id="pp-${uid}" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#94a3b8" stop-opacity="0.55"/><stop offset="1" stop-color="#94a3b8" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="ppr-${uid}" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#3b82f6" stop-opacity="0.55"/><stop offset="1" stop-color="#3b82f6" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="ppe-${uid}" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#a855f7" stop-opacity="0.55"/><stop offset="1" stop-color="#a855f7" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="pg-${uid}" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#f59e0b" stop-opacity="0.65"/><stop offset="1" stop-color="#f59e0b" stop-opacity="0"/>
  </radialGradient>

  <!-- Gradients Topi (Hats) -->
  <linearGradient id="hb-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#F2C98A"/><stop offset="1" stop-color="#C58F45"/>
  </linearGradient>
  <linearGradient id="hd-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#F8D79C"/><stop offset="0.5" stop-color="#E8B86A"/><stop offset="1" stop-color="#C28A3F"/>
  </linearGradient>
  <linearGradient id="hbd-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#B07840"/><stop offset="1" stop-color="#6B4220"/>
  </linearGradient>
  <radialGradient id="hp-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="#FFB37A"/><stop offset="0.5" stop-color="#FF8A3D"/><stop offset="1" stop-color="#C75A18"/>
  </radialGradient>
  <linearGradient id="chb-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFFFFF"/><stop offset="0.6" stop-color="#F8FAFC"/><stop offset="1" stop-color="#CBD5E1"/>
  </linearGradient>
  <linearGradient id="pt-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3D2954"/><stop offset="1" stop-color="#1B1028"/>
  </linearGradient>
  <linearGradient id="km-${uid}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#5E6A7C"/><stop offset="0.3" stop-color="#F1F5FA"/><stop offset="0.55" stop-color="#AEB8C6"/><stop offset="1" stop-color="#6A7587"/>
  </linearGradient>
  <radialGradient id="kp-${uid}" cx=".5" cy=".5" r="0.8" fx="0.35" fy="0.3">
    <stop offset="0" stop-color="#ff9a9f"/><stop offset="0.45" stop-color="#E5484D"/><stop offset="1" stop-color="#8f1d22"/>
  </radialGradient>
  <linearGradient id="ksw-${uid}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <clipPath id="kc-${uid}">
    <path d="M64 84V62Q64 34 100 34Q136 34 136 62V84H120V70H80V84Z"/>
  </clipPath>
  <linearGradient id="bny-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E2E8F0"/>
  </linearGradient>
  <radialGradient id="bnyp-${uid}" cx=".5" cy=".5" r="0.6">
    <stop offset="0" stop-color="#FFD6E0"/><stop offset="1" stop-color="#FF8FA3"/>
  </radialGradient>
  <linearGradient id="wz-${uid}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#5B34C7"/><stop offset="0.45" stop-color="#9D7BFF"/><stop offset="1" stop-color="#4A27A8"/>
  </linearGradient>
  <linearGradient id="wb-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#6B3FE0"/><stop offset="1" stop-color="#4222A0"/>
  </linearGradient>
  <linearGradient id="wg-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFF3B0"/><stop offset="0.35" stop-color="#FBBF24"/><stop offset="0.7" stop-color="#D98A0B"/><stop offset="1" stop-color="#8A4B08"/>
  </linearGradient>
  <radialGradient id="wl-${uid}" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#c4b5fd" stop-opacity="0.6"/><stop offset="1" stop-color="#c4b5fd" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="cg-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFF6C0"/><stop offset="0.3" stop-color="#FBBF24"/><stop offset="0.65" stop-color="#D98A0B"/><stop offset="1" stop-color="#8A4B08"/>
  </linearGradient>
  <radialGradient id="cr-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="#ffc7c7"/><stop offset="0.45" stop-color="#ef4444"/><stop offset="1" stop-color="#7f1d1d"/>
  </radialGradient>
  <radialGradient id="cb-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="#bfe3ff"/><stop offset="0.45" stop-color="#3b82f6"/><stop offset="1" stop-color="#1e3a8a"/>
  </radialGradient>
  <radialGradient id="cp-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#fff3c4"/><stop offset="1" stop-color="#e6c46a"/>
  </radialGradient>
  <radialGradient id="ch-${uid}" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#fde68a" stop-opacity="0.85"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="csw-${uid}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <clipPath id="cc-${uid}">
    <path d="M68 66L70 34L86 52L100 28L114 52L130 34L132 66Z"/>
  </clipPath>

  <!-- Gradients Pakaian (Outfits) -->
  <linearGradient id="ov-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#86E586"/><stop offset="1" stop-color="#37A037"/>
  </linearGradient>
  <linearGradient id="ovs-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.5" stop-color="#0b3a0b" stop-opacity="0"/><stop offset="1" stop-color="#0b3a0b" stop-opacity="0.3"/>
  </linearGradient>
  <linearGradient id="os-${uid}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#2563EB"/><stop offset="0.5" stop-color="#60A5FA"/><stop offset="1" stop-color="#1D4ED8"/>
  </linearGradient>
  <linearGradient id="lc-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFFFFF"/><stop offset="0.6" stop-color="#F1F5F9"/><stop offset="1" stop-color="#E2E8F0"/>
  </linearGradient>
  <linearGradient id="ob-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#F26A70"/><stop offset="1" stop-color="#9B1F27"/>
  </linearGradient>
  <linearGradient id="oc-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFE07A"/><stop offset="0.5" stop-color="#FFC83D"/><stop offset="1" stop-color="#D9981A"/>
  </linearGradient>
  <linearGradient id="oe-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FF7A7F"/><stop offset="1" stop-color="#B72A31"/>
  </linearGradient>
  <radialGradient id="og-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="#fff"/><stop offset="0.45" stop-color="#e8edf5"/><stop offset="1" stop-color="#aab4c4"/>
  </radialGradient>
  <linearGradient id="am-${uid}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#5E6A7C"/><stop offset="0.3" stop-color="#F1F5FA"/><stop offset="0.55" stop-color="#AEB8C6"/><stop offset="1" stop-color="#6A7587"/>
  </linearGradient>
  <radialGradient id="ams-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="#FFFFFF"/><stop offset="0.45" stop-color="#CBD5E1"/><stop offset="1" stop-color="#64748B"/>
  </radialGradient>
  <clipPath id="amc-${uid}"><path d="M68 126h64v52H68z"/></clipPath>
  <linearGradient id="or-${uid}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#5B34C7"/><stop offset="0.5" stop-color="#8F6BFF"/><stop offset="1" stop-color="#4A27A8"/>
  </linearGradient>
  <linearGradient id="org-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFF3B0"/><stop offset="0.35" stop-color="#FBBF24"/><stop offset="0.7" stop-color="#D98A0B"/><stop offset="1" stop-color="#8A4B08"/>
  </linearGradient>
  <linearGradient id="orsh-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.5" stop-color="#1a0a4a" stop-opacity="0"/><stop offset="1" stop-color="#1a0a4a" stop-opacity="0.35"/>
  </linearGradient>
  <linearGradient id="orsw-${uid}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <clipPath id="orc-${uid}"><path d="M66 126h68l8 56H58z"/></clipPath>

  <!-- Gradients Senjata (Weapons) -->
  <linearGradient id="sb-${uid}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#8F9BAD"/><stop offset="0.5" stop-color="#F6F9FD"/><stop offset="1" stop-color="#9AA6B8"/>
  </linearGradient>
  <linearGradient id="sg-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFF3B0"/><stop offset="0.35" stop-color="#FBBF24"/><stop offset="0.7" stop-color="#D98A0B"/><stop offset="1" stop-color="#8A4B08"/>
  </linearGradient>
  <radialGradient id="sgm-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="#bfe3ff"/><stop offset="0.45" stop-color="#3b82f6"/><stop offset="1" stop-color="#1e3a8a"/>
  </radialGradient>
  <linearGradient id="ws-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#B8814A"/><stop offset="1" stop-color="#6B4220"/>
  </linearGradient>
  <linearGradient id="wg2-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFF3B0"/><stop offset="0.35" stop-color="#FBBF24"/><stop offset="0.7" stop-color="#D98A0B"/><stop offset="1" stop-color="#8A4B08"/>
  </linearGradient>
  <radialGradient id="wgl-${uid}" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#fde68a" stop-opacity="0.9"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="shd-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#60A5FA"/><stop offset="0.45" stop-color="#2563EB"/><stop offset="1" stop-color="#1E3A8A"/>
  </linearGradient>
  <linearGradient id="bk-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#F87171"/><stop offset="0.5" stop-color="#DC2626"/><stop offset="1" stop-color="#991B1B"/>
  </linearGradient>
  <linearGradient id="tb-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#B8814A"/><stop offset="1" stop-color="#6B4220"/>
  </linearGradient>
  <linearGradient id="tg-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFE98A"/><stop offset="1" stop-color="#D9981A"/>
  </linearGradient>
  <radialGradient id="tl-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="#e8f7ff"/><stop offset="0.45" stop-color="#7fd0ff"/><stop offset="1" stop-color="#2a7fb8"/>
  </radialGradient>

  <!-- Gradients Bingkai (Frames) -->
  <linearGradient id="fw-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#C98A4A"/><stop offset="0.5" stop-color="#8B5A2B"/><stop offset="1" stop-color="#5C381E"/>
  </linearGradient>
  <radialGradient id="fb-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="#a9714a"/><stop offset="0.45" stop-color="#5C381E"/><stop offset="1" stop-color="#2f1b0d"/>
  </radialGradient>
  <linearGradient id="fl-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#4ADE80"/><stop offset="0.5" stop-color="#16A34A"/><stop offset="1" stop-color="#14532D"/>
  </linearGradient>
  <linearGradient id="fs-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#64748B"/><stop offset="0.28" stop-color="#F8FAFC"/><stop offset="0.55" stop-color="#94A3B8"/><stop offset="0.8" stop-color="#E2E8F0"/><stop offset="1" stop-color="#475569"/>
  </linearGradient>
  <linearGradient id="fsc-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#94A3B8"/>
  </linearGradient>
  <linearGradient id="ff-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#F87171"/><stop offset="0.5" stop-color="#EF4444"/><stop offset="1" stop-color="#991B1B"/>
  </linearGradient>
  <linearGradient id="fg-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFF1A8"/><stop offset="0.3" stop-color="#FBBF24"/><stop offset="0.6" stop-color="#C27A07"/><stop offset="0.85" stop-color="#F5C84B"/><stop offset="1" stop-color="#8A4B08"/>
  </linearGradient>
  <radialGradient id="gr-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="#ffc7c7"/><stop offset="0.45" stop-color="#EF4444"/><stop offset="1" stop-color="#7f1d1d"/>
  </radialGradient>
  <radialGradient id="gb-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="#bfe3ff"/><stop offset="0.45" stop-color="#3B82F6"/><stop offset="1" stop-color="#1e3a8a"/>
  </radialGradient>
  <radialGradient id="gn-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="#c8ffe6"/><stop offset="0.45" stop-color="#10B981"/><stop offset="1" stop-color="#064E3B"/>
  </radialGradient>
  <linearGradient id="fr-${uid}" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(0 .5 .5)">
    <stop offset="0" stop-color="#FF4B72"/><stop offset="0.25" stop-color="#FFB347"/><stop offset="0.5" stop-color="#70E000"/><stop offset="0.75" stop-color="#00C4FF"/><stop offset="1" stop-color="#9D4EDD"/>
    <animateTransform attributeName="gradientTransform" type="rotate" from="0 .5 .5" to="360 .5 .5" dur="7s" repeatCount="indefinite"/>
  </linearGradient>
  <linearGradient id="frg-${uid}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFF3B0"/><stop offset="0.35" stop-color="#FBBF24"/><stop offset="0.7" stop-color="#D98A0B"/><stop offset="1" stop-color="#8A4B08"/>
  </linearGradient>
  <radialGradient id="frm-${uid}" cx=".5" cy=".5" r="0.75" fx="0.34" fy="0.28">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#ffe27a"/><stop offset="1" stop-color="#d98a0b"/>
  </radialGradient>`;
}

function getBgDefs(bgKey, uid) {
  return `
  <!-- Latar Belakang (BG) -->
  <linearGradient id="bm-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#9ADFFF"/><stop offset="0.42" stop-color="#D3F4FF"/><stop offset="0.6" stop-color="#8FDB6B"/><stop offset="1" stop-color="#4FB53A"/>
  </linearGradient>
  <radialGradient id="bsun-${uid}" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#fff6b0" stop-opacity="0.95"/><stop offset="1" stop-color="#fff6b0" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="bh1-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7BD65B"/><stop offset="1" stop-color="#4BAE36"/>
  </linearGradient>
  <linearGradient id="bh2-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#62C84B"/><stop offset="1" stop-color="#3C9A2E"/>
  </linearGradient>
  <linearGradient id="bs-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFE58A"/><stop offset="0.45" stop-color="#FFA07A"/><stop offset="1" stop-color="#FF6F91"/>
  </linearGradient>
  <radialGradient id="bsg-${uid}" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#fff1b0" stop-opacity="0.95"/><stop offset="1" stop-color="#fff1b0" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="bss-${uid}" cx=".5" cy=".5" r="0.6" fx="0.4" fy="0.35">
    <stop offset="0" stop-color="#FFFBE0"/><stop offset="0.45" stop-color="#FFE27A"/><stop offset="1" stop-color="#FFB347"/>
  </radialGradient>
  <linearGradient id="bcandy-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFD6E8"/><stop offset="0.5" stop-color="#FFB0D6"/><stop offset="1" stop-color="#FFA0CB"/>
  </linearGradient>
  <linearGradient id="bcave-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#58457D"/><stop offset="0.6" stop-color="#2D1F4F"/><stop offset="1" stop-color="#1A1230"/>
  </linearGradient>
  <linearGradient id="bn-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#5B49B0"/><stop offset="0.55" stop-color="#2A1F66"/><stop offset="1" stop-color="#120C34"/>
  </linearGradient>
  <radialGradient id="bnb-${uid}" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#e879f9" stop-opacity="0.5"/><stop offset="1" stop-color="#e879f9" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="bnm-${uid}" cx=".5" cy=".5" r="0.7" fx="0.35" fy="0.3">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#fff3c4"/><stop offset="1" stop-color="#e6c46a"/>
  </radialGradient>
  <linearGradient id="ba-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0B1B4A"/><stop offset="0.55" stop-color="#16296B"/><stop offset="1" stop-color="#1B1340"/>
  </linearGradient>
  <linearGradient id="ar1-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#34ffb0" stop-opacity="0"/><stop offset="0.5" stop-color="#34ffb0" stop-opacity="0.65"/><stop offset="1" stop-color="#38bdf8" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="ar2-${uid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#c084fc" stop-opacity="0"/><stop offset="0.5" stop-color="#c084fc" stop-opacity="0.55"/><stop offset="1" stop-color="#f472b6" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="ray-${uid}" gradientUnits="userSpaceOnUse" cx="100" cy="110" r="110">
    <stop offset="0" stop-color="#fff1a8" stop-opacity="0.75"/><stop offset="1" stop-color="#fff1a8" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="av-${uid}" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#f59e0b" stop-opacity="0.7"/><stop offset="1" stop-color="#f59e0b" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="ave-${uid}" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#a855f7" stop-opacity="0.55"/><stop offset="1" stop-color="#a855f7" stop-opacity="0"/>
  </radialGradient>`;
}

function renderAvatar(a = {}, opts = {}) {
  const uid = (opts && opts.uid) ? opts.uid : ('a' + Math.random().toString(36).slice(2, 8));
  const fxMode = (opts && opts.fx) ? opts.fx : 'full';
  const isStatic = fxMode === 'lite' || fxMode === 'static';
  const sizeAttr = (opts && opts.size) ? (' width="' + opts.size + '" height="' + opts.size + '"') : '';

  const skinBase = resolveColor(a.skin, SKINS, 0);
  const hairBase = resolveColor(a.hair, HAIRS, 1);
  const skinLight = mix(skinBase, '#ffffff', 0.35);
  const skinDark  = mix(skinBase, '#7a3b10', 0.25);
  const hairLight = mix(hairBase, '#ffffff', 0.3);
  const hairDark  = mix(hairBase, '#000000', 0.4);

  const bgKey = a.bg || 'bg_meadow';
  const isLegendFrame = a.frame === 'frame_rainbow' || a.hat === 'hat_crown' || a.frame === 'frame_supernova' || a.weapon === 'weapon_excalibur' || a.outfit === 'outfit_astral_king' || a.bg === 'bg_nebula';
  const isEpicFrame = a.frame === 'frame_gold' || a.hat === 'hat_wizard' || a.outfit === 'outfit_robe' || a.frame === 'frame_dragon_scale' || a.frame === 'frame_runic' || a.weapon === 'weapon_scythe' || a.weapon === 'weapon_crossbow' || a.outfit === 'outfit_cyberpunk' || a.outfit === 'outfit_paladin' || a.bg === 'bg_cyber_city' || a.bg === 'bg_temple';

  const sa = (typeof window !== 'undefined' && window.SkinArt) || (typeof root !== 'undefined' && root.SkinArt) || SkinArt;

  const backSvg = (sa && sa.has(a.outfit) && typeof sa.renderOutfitBack === 'function' && sa.renderOutfitBack(a.outfit, uid))
    ? sa.renderOutfitBack(a.outfit, uid)
    : ((typeof OUTFIT_BACK[a.outfit] === 'function')
      ? OUTFIT_BACK[a.outfit](uid)
      : (OUTFIT_BACK[a.outfit] || ''));

  const outfitSvg = (sa && sa.has(a.outfit) && typeof sa.renderOutfit === 'function')
    ? sa.renderOutfit(a.outfit, uid)
    : ((typeof OUTFIT[a.outfit] === 'function')
      ? OUTFIT[a.outfit](uid)
      : (OUTFIT[a.outfit] || ''));

  const hatSvg = (sa && sa.has(a.hat) && typeof sa.renderHat === 'function')
    ? sa.renderHat(a.hat, uid)
    : ((typeof HAT[a.hat] === 'function')
      ? HAT[a.hat](uid)
      : (HAT[a.hat] || ''));

  const weaponSvg = (sa && sa.has(a.weapon) && typeof sa.renderWeapon === 'function')
    ? sa.renderWeapon(a.weapon, uid)
    : ((typeof WEAPON[a.weapon] === 'function')
      ? WEAPON[a.weapon](uid)
      : (WEAPON[a.weapon] || ''));

  const frameSvg = (sa && sa.has(a.frame) && typeof sa.renderFrame === 'function')
    ? sa.renderFrame(a.frame, uid)
    : ((typeof FRAME[a.frame] === 'function')
      ? FRAME[a.frame](uid)
      : (FRAME[a.frame] || (typeof FRAME.frame_wood === 'function' ? FRAME.frame_wood(uid) : FRAME.frame_wood)));

  const petSvg = renderPetElement(a.pet, uid);

  // Legendary Rays if wearing Legend set/hat/frame
  let legendRays = '';
  if (isLegendFrame && !isStatic) {
    legendRays = `
      <g class="fx-rays" fill="url(#ray-${uid})" opacity=".5">
        <polygon transform="rotate(0 100 110)" points="100,110 91,-30 109,-30"/>
        <polygon transform="rotate(30 100 110)" points="100,110 91,-30 109,-30"/>
        <polygon transform="rotate(60 100 110)" points="100,110 91,-30 109,-30"/>
        <polygon transform="rotate(90 100 110)" points="100,110 91,-30 109,-30"/>
        <polygon transform="rotate(120 100 110)" points="100,110 91,-30 109,-30"/>
        <polygon transform="rotate(150 100 110)" points="100,110 91,-30 109,-30"/>
        <polygon transform="rotate(180 100 110)" points="100,110 91,-30 109,-30"/>
        <polygon transform="rotate(210 100 110)" points="100,110 91,-30 109,-30"/>
        <polygon transform="rotate(240 100 110)" points="100,110 91,-30 109,-30"/>
        <polygon transform="rotate(270 100 110)" points="100,110 91,-30 109,-30"/>
        <polygon transform="rotate(300 100 110)" points="100,110 91,-30 109,-30"/>
        <polygon transform="rotate(330 100 110)" points="100,110 91,-30 109,-30"/>
      </g>
      <circle class="fx-pulse" cx="100" cy="112" r="84" fill="url(#av-${uid})"/>
    `;
  } else if (isEpicFrame && !isStatic) {
    legendRays = `<circle class="fx-pulse" cx="100" cy="112" r="84" fill="url(#ave-${uid})"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"${sizeAttr} class="fx ${isStatic ? 'fx-static' : ''}" role="img" aria-label="Avatar">
<defs>
  <clipPath id="bc-${uid}"><rect width="200" height="200" rx="28"/></clipPath>
  ${getAllItemDefs(uid, skinBase, hairBase)}
  ${getBgDefs(bgKey, uid)}
</defs>

<g clip-path="url(#bc-${uid})">
  ${(sa && sa.has(bgKey) && typeof sa.renderBg === 'function') ? sa.renderBg(bgKey, uid) : renderBgElements(bgKey, uid)}
  ${legendRays}
  ${backSvg}
  <ellipse cx="100" cy="190" rx="46" ry="7" fill="#000" opacity=".18"/>
  <rect x="70" y="126" width="60" height="50" rx="14" fill="url(#tr-${uid})" ${st}/>
  ${outfitSvg}
  <ellipse cx="62" cy="144" rx="9" ry="16" fill="url(#sk-${uid})" ${st}/>
  <ellipse cx="138" cy="144" rx="9" ry="16" fill="url(#sk-${uid})" ${st}/>
  <ellipse cx="59" cy="138" rx="2.6" ry="6" fill="#fff" opacity=".4"/>
  <ellipse cx="135" cy="138" rx="2.6" ry="6" fill="#fff" opacity=".4"/>
  <circle cx="100" cy="90" r="36" fill="url(#sk-${uid})" ${st}/>
  <circle cx="100" cy="90" r="36" fill="url(#hs-${uid})"/>
  <path d="M64 84Q66 52 100 52Q134 52 136 84Q120 66 100 70Q80 66 64 84Z" fill="url(#hr-${uid})" ${st}/>
  <path d="M74 66Q84 56 98 55" stroke="#fff" stroke-width="4" opacity=".45" fill="none" stroke-linecap="round"/>
  <ellipse cx="80" cy="82" rx="7" ry="3.2" transform="rotate(-18 80 82)" fill="#fff" opacity=".35"/>
  <g fill="${K}"><circle cx="86" cy="94" r="4.8"/><circle cx="114" cy="94" r="4.8"/></g>
  <g fill="#fff">
    <circle cx="87.6" cy="92.3" r="1.7"/><circle cx="115.6" cy="92.3" r="1.7"/>
    <circle cx="84.8" cy="96" r=".8" opacity=".7"/><circle cx="112.8" cy="96" r=".8" opacity=".7"/>
  </g>
  <path d="M90 106Q100 116 110 106" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <g fill="url(#ck-${uid})" opacity=".7"><circle cx="76" cy="104" r="6"/><circle cx="124" cy="104" r="6"/></g>
  ${hatSvg}
  ${weaponSvg}
  ${petSvg}
</g>
${frameSvg}
</svg>`;
}

function renderThumbnail(itemId, slot) {
  if (!itemId) return `<div style="font-size:1.8rem;display:flex;align-items:center;justify-content:center;height:100%">🎒</div>`;
  const uid = 'th-' + itemId;
  const sa = (typeof window !== 'undefined' && window.SkinArt) || (typeof root !== 'undefined' && root.SkinArt) || SkinArt;
  if (sa && sa.has(itemId)) {
    return sa.renderThumbnail(itemId, slot, uid);
  }
  const defs = '<defs>' + getAllItemDefs(uid) + '</defs>';

  // 1. HAT
  if (slot === 'hat' || HAT[itemId]) {
    const hatSvg = typeof HAT[itemId] === 'function' ? HAT[itemId](uid) : (HAT[itemId] || '');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 0 120 125" width="100%" height="100%" class="fx">
      ${defs}
      <rect x="40" y="0" width="120" height="125" rx="18" fill="rgba(255,255,255,0.04)"/>
      <circle cx="100" cy="88" r="34" fill="url(#sk-${uid})" stroke="${K}" stroke-width="3" opacity="0.95"/>
      <circle cx="89" cy="90" r="3.5" fill="${K}"/><circle cx="111" cy="90" r="3.5" fill="${K}"/>
      <path d="M94 100Q100 106 106 100" stroke="${K}" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${hatSvg}
    </svg>`;
  }

  // 2. OUTFIT
  if (slot === 'outfit' || OUTFIT[itemId]) {
    const back = typeof OUTFIT_BACK[itemId] === 'function' ? OUTFIT_BACK[itemId](uid) : (OUTFIT_BACK[itemId] || '');
    const front = typeof OUTFIT[itemId] === 'function' ? OUTFIT[itemId](uid) : (OUTFIT[itemId] || '');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 85 120 115" width="100%" height="100%" class="fx">
      ${defs}
      <rect x="40" y="85" width="120" height="115" rx="18" fill="rgba(255,255,255,0.04)"/>
      ${back}
      <circle cx="100" cy="96" r="22" fill="url(#sk-${uid})" stroke="${K}" stroke-width="3" opacity="0.85"/>
      <ellipse cx="62" cy="144" rx="9" ry="16" fill="url(#sk-${uid})" ${st}/>
      <ellipse cx="138" cy="144" rx="9" ry="16" fill="url(#sk-${uid})" ${st}/>
      <rect x="70" y="126" width="60" height="50" rx="14" fill="url(#tr-${uid})" ${st}/>
      ${front}
    </svg>`;
  }

  // 3. WEAPON
  if (slot === 'weapon' || WEAPON[itemId]) {
    const wSvg = typeof WEAPON[itemId] === 'function' ? WEAPON[itemId](uid) : (WEAPON[itemId] || '');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="125 75 75 105" width="100%" height="100%" class="fx">
      ${defs}
      <rect x="125" y="75" width="75" height="105" rx="16" fill="rgba(255,255,255,0.04)"/>
      <circle cx="152" cy="150" r="10" fill="url(#sk-${uid})" stroke="${K}" stroke-width="3" opacity="0.85"/>
      ${wSvg}
    </svg>`;
  }

  // 4. PET
  if (slot === 'pet' || PET[itemId] || (typeof itemId === 'string' && itemId.startsWith('pet_'))) {
    const petArtModule = PetArt || (typeof root !== 'undefined' && root.PetArt) || (typeof window !== 'undefined' && window.PetArt);
    if (petArtModule && typeof petArtModule.embedPetArt === 'function') {
      const art = petArtModule.embedPetArt(itemId, 'th-' + itemId, { x: 0, y: 0, size: 54 });
      if (art) {
        return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative">
          ${art}
        </div>`;
      }
    }
    const code = PET[itemId] || '1f43e';
    const emojiMap = {
      pet_cat: '🐱', pet_dog: '🐶', pet_penguin: '🐧',
      pet_fox: '🦊', pet_owl: '🦉', pet_dragon: '🐲', pet_phoenix: '🦅'
    };
    const emoji = emojiMap[itemId] || '🐾';
    return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative">
      <div style="position:absolute;inset:4px;border-radius:14px;background:radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)"></div>
      <img src="${TWEMOJI}/${code}.svg" alt="${emoji}" style="width:48px;height:48px;position:relative;z-index:1;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.4))" onerror="this.outerHTML='<span style=\\'font-size:2.4rem\\'>${emoji}</span>'">
    </div>`;
  }

  // 5. BG
  if (slot === 'bg' || BG[itemId]) {
    const [g1, g2] = BG[itemId] || BG.bg_meadow;
    const bgIcons = {
      bg_meadow: '🌿', bg_sky: '☀️', bg_sunset: '🌅',
      bg_candy: '🍭', bg_cave: '💎', bg_night: '✨', bg_aurora: '🌌'
    };
    const icon = bgIcons[itemId] || '🎨';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="thumb_bg_${itemId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${g1}"/>
          <stop offset="100%" stop-color="${g2}"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="16" fill="url(#thumb_bg_${itemId})"/>
      <circle cx="50" cy="50" r="28" fill="rgba(255,255,255,0.18)"/>
      <text x="50" y="58" font-size="28" text-anchor="middle" dominant-baseline="middle">${icon}</text>
    </svg>`;
  }

  // 6. FRAME
  if (slot === 'frame' || FRAME[itemId]) {
    const fSvg = typeof FRAME[itemId] === 'function' ? FRAME[itemId](uid) : (FRAME[itemId] || FRAME.frame_wood);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%" class="fx">
      ${defs}
      <rect width="200" height="200" rx="26" fill="rgba(255,255,255,0.03)"/>
      <circle cx="100" cy="100" r="42" fill="url(#sk-${uid})" stroke="${K}" stroke-width="3" opacity="0.85"/>
      <circle cx="88" cy="98" r="4" fill="${K}" opacity="0.8"/>
      <circle cx="112" cy="98" r="4" fill="${K}" opacity="0.8"/>
      <path d="M92 110Q100 118 108 110" stroke="${K}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.8"/>
      ${fSvg}
    </svg>`;
  }

  // 7. TITLE
  if (slot === 'title' || (itemId && itemId.startsWith('title_'))) {
    const titles = {
      title_rookie: { icon: '🥉', label: 'Pemula', col: '#d97706' },
      title_hunter: { icon: '🏹', label: 'Hunter', col: '#3b82f6' },
      title_sage:   { icon: '📜', label: 'Sage', col: '#8b5cf6' },
      title_combo:  { icon: '🔥', label: 'Combo', col: '#ef4444' },
      title_king:   { icon: '👑', label: 'King', col: '#f59e0b' },
    };
    const t = titles[itemId] || { icon: '🏅', label: 'Gelar', col: '#10b981' };
    return `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 80%);border-radius:14px">
      <div style="font-size:2rem;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">${t.icon}</div>
      <div style="font-size:0.65rem;font-weight:800;color:${t.col};margin-top:4px;letter-spacing:0.5px">${t.label}</div>
    </div>`;
  }

  // 8. PERMANENT
  if (slot === 'permanent' || itemId === 'slot_skill_4') {
    return `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg, rgba(168,85,247,0.2), rgba(245,158,11,0.2));border-radius:14px">
      <div style="font-size:2rem;line-height:1">⚡</div>
      <div style="font-size:0.65rem;font-weight:800;color:#f59e0b;margin-top:4px">+1 SLOT</div>
    </div>`;
  }

  return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.8rem;color:var(--c-muted)">🎒</div>`;
}

  const Avatar = {
    SKINS,
    HAIRS,
    BG,
    PET,
    get PET_ART() { const pa = (typeof window !== 'undefined' && window.PetArt) || (typeof root !== 'undefined' && root.PetArt) || PetArt; return pa ? pa.PET_ART : {}; },
    get SKIN_ART() { return (typeof window !== 'undefined' && window.SkinArt) || (typeof root !== 'undefined' && root.SkinArt) || SkinArt || {}; },
    HAT,
    OUTFIT,
    OUTFIT_BACK,
    WEAPON,
    FRAME,
    renderAvatar,
    renderThumbnail,
    renderPetElement
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Avatar;
  }
  root.Avatar = Avatar;
})(typeof window !== 'undefined' ? window : this);
