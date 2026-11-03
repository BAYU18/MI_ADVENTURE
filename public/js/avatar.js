(function(root) {
  'use strict';

const SKINS = ['#FFDDB8', '#F2B98C', '#D9955F', '#A66A3F', '#7A4A2A'];
const HAIRS = ['#2B1B3D', '#6B3F1D', '#E8B84A', '#C8453A', '#3A7BD5', '#7C4DFF'];
const K = '#2B1B3D'; // warna kontur
const st = `stroke="${K}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
const TWEMOJI = 'https://cdn.jsdelivr.net/npm/@twemoji/svg@latest';

const BG = {
  bg_meadow: ['#B9EBFF', '#7BD65B'], bg_sky: ['#9BE0FF', '#E6F8FF'], bg_sunset: ['#FFD27A', '#FF7A8A'],
  bg_candy: ['#FFC3E1', '#FFA0C8'], bg_cave: ['#6B5B95', '#2D2250'], bg_night: ['#4A3A8F', '#1B1340'],
};
const PET = { pet_cat: '1f431', pet_dog: '1f436', pet_penguin: '1f427', pet_fox: '1f98a', pet_owl: '1f989', pet_dragon: '1f432' };

// ---- lapisan "belakang badan" (jubah) ----
const OUTFIT_BACK = {
  outfit_cape: `<path d="M64 124Q40 170 56 188H144Q160 170 136 124Z" fill="#E5484D" ${st}/>`,
};

// ---- pakaian (di atas torso) ----
const OUTFIT = {
  outfit_vest: `<path d="M70 126h60v50H70z" fill="#5BCB5B" ${st}/><path d="M100 126v50" ${st}/><circle cx="92" cy="146" r="3" fill="${K}"/><circle cx="92" cy="162" r="3" fill="${K}"/>`,
  outfit_stripes: `<rect x="70" y="126" width="60" height="50" rx="14" fill="#fff" ${st}/><g stroke="#3A7BD5" stroke-width="7"><path d="M72 140h56M72 156h56M74 170h52"/></g><rect x="70" y="126" width="60" height="50" rx="14" fill="none" ${st}/>`,
  outfit_labcoat: `<path d="M68 126h64v54H68z" fill="#fff" ${st}/><path d="M100 126v54M88 126l12 14 12-14" fill="none" ${st}/><rect x="108" y="150" width="14" height="12" fill="#CFE9FF" stroke="${K}" stroke-width="3"/>`,
  outfit_cape: `<rect x="70" y="126" width="60" height="50" rx="14" fill="#FFC83D" ${st}/><path d="M72 128Q100 146 128 128" fill="#E5484D" ${st}/><circle cx="100" cy="140" r="5" fill="#fff" stroke="${K}" stroke-width="3"/>`,
  outfit_armor: `<path d="M68 126h64v52H68z" fill="#AEB8C6" ${st}/><path d="M76 138h48M76 152h48M76 166h48" stroke="${K}" stroke-width="3" fill="none"/><circle cx="64" cy="130" r="12" fill="#C9D2DE" ${st}/><circle cx="136" cy="130" r="12" fill="#C9D2DE" ${st}/>`,
  outfit_robe: `<path d="M66 126h68l8 56H58z" fill="#7C4DFF" ${st}/><path d="M100 126v56" ${st}/><g fill="#FFD34D"><path d="M82 146l3 6 6 1-5 4 2 6-6-4-6 4 2-6-5-4 6-1z"/><path d="M122 164l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z"/></g>`,
};

// ---- topi / hiasan kepala ----
const HAT = {
  hat_explorer: `<ellipse cx="100" cy="66" rx="48" ry="11" fill="#D9A55B" ${st}/><path d="M68 66Q70 34 100 34Q130 34 132 66Z" fill="#E8B86A" ${st}/><rect x="70" y="54" width="60" height="9" fill="#8B5A2B"/><path d="M68 66Q70 34 100 34Q130 34 132 66" fill="none" ${st}/>`,
  hat_headphones: `<path d="M64 84Q64 40 100 40Q136 40 136 84" fill="none" stroke="${K}" stroke-width="9" stroke-linecap="round"/><rect x="54" y="78" width="16" height="28" rx="8" fill="#FF8A3D" ${st}/><rect x="130" y="78" width="16" height="28" rx="8" fill="#FF8A3D" ${st}/>`,
  hat_chef: `<rect x="72" y="52" width="56" height="16" fill="#fff" ${st}/><g fill="#fff" ${st}><circle cx="82" cy="46" r="14"/><circle cx="100" cy="38" r="16"/><circle cx="118" cy="46" r="14"/></g><rect x="72" y="52" width="56" height="16" fill="#fff" ${st}/>`,
  hat_pirate: `<path d="M56 68Q100 20 144 68Q100 58 56 68Z" fill="#2B1B3D" ${st}/><circle cx="100" cy="50" r="6" fill="#fff"/><path d="M96 56l8 0M100 52v8" stroke="${K}" stroke-width="2"/>`,
  hat_knight: `<path d="M64 84V62Q64 34 100 34Q136 34 136 62V84H120V70H80V84Z" fill="#AEB8C6" ${st}/><path d="M100 34V14" stroke="#E5484D" stroke-width="8" stroke-linecap="round"/><path d="M80 70h40" ${st}/>`,
  hat_bunny: `<g fill="#fff" ${st}><ellipse cx="82" cy="30" rx="10" ry="28"/><ellipse cx="118" cy="30" rx="10" ry="28"/></g><g fill="#FFB3C6"><ellipse cx="82" cy="32" rx="4.5" ry="19"/><ellipse cx="118" cy="32" rx="4.5" ry="19"/></g>`,
  hat_wizard: `<path d="M62 68L100 6L138 68Z" fill="#7C4DFF" ${st}/><ellipse cx="100" cy="68" rx="46" ry="9" fill="#5B34C7" ${st}/><path d="M98 30l3 6 6 1-5 4 2 6-6-4-6 4 2-6-5-4 6-1z" fill="#FFD34D"/>`,
  hat_crown: `<path d="M68 66L70 34L86 52L100 28L114 52L130 34L132 66Z" fill="#FFD34D" ${st}/><circle cx="100" cy="52" r="4" fill="#E5484D"/>`,
};

// ---- senjata / alat (tangan kanan, sisi layar kanan) ----
const WEAPON = {
  weapon_sword: `<path d="M150 150L170 90" stroke="#C9D2DE" stroke-width="9" stroke-linecap="round"/><path d="M150 150L170 90" stroke="${K}" stroke-width="3" stroke-linecap="round" opacity=".5"/><path d="M142 146l18 8" stroke="#8B5A2B" stroke-width="8" stroke-linecap="round"/>`,
  weapon_wand: `<path d="M148 160L172 104" stroke="#8B5A2B" stroke-width="7" stroke-linecap="round"/><path d="M172 90l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#FFD34D" ${st}/>`,
  weapon_shield: `<path d="M138 128h40v30Q158 182 138 158Z" fill="#3A7BD5" ${st}/><path d="M158 132v40" stroke="#fff" stroke-width="5"/>`,
  weapon_book: `<rect x="140" y="132" width="36" height="28" rx="4" fill="#E5484D" ${st}/><path d="M158 132v28" ${st}/><path d="M146 142h8M162 142h8" stroke="#fff" stroke-width="3"/>`,
  weapon_telescope: `<path d="M140 156L176 120" stroke="#8B5A2B" stroke-width="12" stroke-linecap="round"/><path d="M168 128L180 116" stroke="#FFC83D" stroke-width="14" stroke-linecap="round"/>`,
};

// ---- bingkai avatar (frame) ----
const FRAME = {
  frame_wood: `<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#8B5A2B" stroke-width="8"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#D9A55B" stroke-width="3"/><circle cx="14" cy="14" r="5" fill="#5C381E"/><circle cx="186" cy="14" r="5" fill="#5C381E"/><circle cx="14" cy="186" r="5" fill="#5C381E"/><circle cx="186" cy="186" r="5" fill="#5C381E"/>`,
  frame_leaf: `<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#2D8A4E" stroke-width="8"/><path d="M10 20Q20 10 30 20Q20 30 10 20Z" fill="#48C774"/><path d="M170 20Q180 10 190 20Q180 30 170 20Z" fill="#48C774"/><path d="M10 180Q20 170 30 180Q20 190 10 180Z" fill="#48C774"/><path d="M170 180Q180 170 190 180Q180 190 170 180Z" fill="#48C774"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#A3E635" stroke-width="2"/>`,
  frame_silver: `<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#94A3B8" stroke-width="8"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#F1F5F9" stroke-width="3"/><polygon points="4,24 24,4 4,4" fill="#CBD5E1"/><polygon points="196,24 176,4 196,4" fill="#CBD5E1"/><polygon points="4,176 24,196 4,196" fill="#CBD5E1"/><polygon points="196,176 176,196 196,196" fill="#CBD5E1"/>`,
  frame_flame: `<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#EF4444" stroke-width="8"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#F59E0B" stroke-width="3"/><path d="M10 30Q16 14 26 22Q30 6 38 18" stroke="#FBBF24" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M190 30Q184 14 174 22Q170 6 162 18" stroke="#FBBF24" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  frame_gold: `<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#D97706" stroke-width="8"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#FDE047" stroke-width="3"/><circle cx="100" cy="10" r="6" fill="#EF4444" stroke="#78350F" stroke-width="2"/><circle cx="10" cy="100" r="6" fill="#3B82F6" stroke="#1E3A8A" stroke-width="2"/><circle cx="190" cy="100" r="6" fill="#3B82F6" stroke="#1E3A8A" stroke-width="2"/><circle cx="100" cy="190" r="6" fill="#10B981" stroke="#064E3B" stroke-width="2"/>`,
  frame_rainbow: `<defs><linearGradient id="rbw" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF4B72"/><stop offset="25%" stop-color="#FFB347"/><stop offset="50%" stop-color="#70E000"/><stop offset="75%" stop-color="#00C4FF"/><stop offset="100%" stop-color="#9D4EDD"/></linearGradient></defs><rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="url(#rbw)" stroke-width="10"/><rect x="10" y="10" width="180" height="180" rx="20" fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".8"/>`,
};

function renderAvatar(a = {}) {
  const skin = a.skin || SKINS[0];
  const hair = a.hair || HAIRS[1];
  const [g1, g2] = BG[a.bg || 'bg_meadow'] || BG.bg_meadow;
  const pet = (a.pet && PET[a.pet]) ? `<image href="${TWEMOJI}/${PET[a.pet]}.svg" x="8" y="136" width="48" height="48"/>` : '';
  const frameSvg = (a.frame && FRAME[a.frame]) ? FRAME[a.frame] : (FRAME.frame_wood || '');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Avatar">
<defs><linearGradient id="bgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${g1}"/><stop offset="1" stop-color="${g2}"/></linearGradient>
<clipPath id="bgc"><rect width="200" height="200" rx="28"/></clipPath></defs>
<g clip-path="url(#bgc)"><rect width="200" height="200" fill="url(#bgg)"/>
${OUTFIT_BACK[a.outfit] || ''}
<ellipse cx="100" cy="190" rx="46" ry="7" fill="#000" opacity=".15"/>
<rect x="70" y="126" width="60" height="50" rx="14" fill="#FF8A3D" ${st}/>
${OUTFIT[a.outfit] || ''}
<ellipse cx="62" cy="144" rx="9" ry="16" fill="${skin}" ${st}/><ellipse cx="138" cy="144" rx="9" ry="16" fill="${skin}" ${st}/>
<circle cx="100" cy="90" r="36" fill="${skin}" ${st}/>
<path d="M64 84Q66 52 100 52Q134 52 136 84Q120 66 100 70Q80 66 64 84Z" fill="${hair}" ${st}/>
<g fill="${K}"><circle cx="86" cy="94" r="4.5"/><circle cx="114" cy="94" r="4.5"/></g>
<g fill="#fff"><circle cx="87.5" cy="92.5" r="1.5"/><circle cx="115.5" cy="92.5" r="1.5"/></g>
<path d="M90 106Q100 116 110 106" stroke="${K}" stroke-width="4" fill="none" stroke-linecap="round"/>
<g fill="#FF8FA3" opacity=".6"><circle cx="76" cy="104" r="6"/><circle cx="124" cy="104" r="6"/></g>
${HAT[a.hat] || ''}${WEAPON[a.weapon] || ''}${pet}</g>
${frameSvg}</svg>`;
}

function renderThumbnail(itemId, slot) {
  if (!itemId) return `<div style="font-size:1.8rem;display:flex;align-items:center;justify-content:center;height:100%">🎒</div>`;

  // 1. HAT
  if (slot === 'hat' || HAT[itemId]) {
    const hatSvg = HAT[itemId] || '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 0 120 125" width="100%" height="100%">
      <rect x="40" y="0" width="120" height="125" rx="18" fill="rgba(255,255,255,0.04)"/>
      <circle cx="100" cy="88" r="34" fill="#F2B98C" stroke="${K}" stroke-width="3" opacity="0.9"/>
      <circle cx="89" cy="90" r="3.5" fill="${K}"/><circle cx="111" cy="90" r="3.5" fill="${K}"/>
      <path d="M94 100Q100 106 106 100" stroke="${K}" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${hatSvg}
    </svg>`;
  }

  // 2. OUTFIT
  if (slot === 'outfit' || OUTFIT[itemId]) {
    const back = OUTFIT_BACK[itemId] || '';
    const front = OUTFIT[itemId] || '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 85 120 115" width="100%" height="100%">
      <rect x="40" y="85" width="120" height="115" rx="18" fill="rgba(255,255,255,0.04)"/>
      ${back}
      <circle cx="100" cy="96" r="22" fill="#F2B98C" stroke="${K}" stroke-width="3" opacity="0.6"/>
      <ellipse cx="62" cy="144" rx="9" ry="16" fill="#F2B98C" ${st}/>
      <ellipse cx="138" cy="144" rx="9" ry="16" fill="#F2B98C" ${st}/>
      <rect x="70" y="126" width="60" height="50" rx="14" fill="#FF8A3D" ${st}/>
      ${front}
    </svg>`;
  }

  // 3. WEAPON
  if (slot === 'weapon' || WEAPON[itemId]) {
    const wSvg = WEAPON[itemId] || '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="125 75 75 105" width="100%" height="100%">
      <rect x="125" y="75" width="75" height="105" rx="16" fill="rgba(255,255,255,0.04)"/>
      <circle cx="152" cy="150" r="10" fill="#F2B98C" stroke="${K}" stroke-width="3" opacity="0.7"/>
      ${wSvg}
    </svg>`;
  }

  // 4. PET
  if (slot === 'pet' || PET[itemId]) {
    const code = PET[itemId] || '1f43e';
    const emojiMap = {
      pet_cat: '🐱', pet_dog: '🐶', pet_penguin: '🐧',
      pet_fox: '🦊', pet_owl: '🦉', pet_dragon: '🐲'
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
      bg_candy: '🍭', bg_cave: '💎', bg_night: '✨'
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
    const fSvg = FRAME[itemId] || FRAME.frame_wood;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
      <rect width="200" height="200" rx="26" fill="rgba(255,255,255,0.03)"/>
      <circle cx="100" cy="100" r="42" fill="#F2B98C" stroke="${K}" stroke-width="3" opacity="0.65"/>
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
    HAT,
    OUTFIT,
    WEAPON,
    FRAME,
    renderAvatar,
    renderThumbnail
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Avatar;
  }
  root.Avatar = Avatar;
})(typeof window !== 'undefined' ? window : this);
