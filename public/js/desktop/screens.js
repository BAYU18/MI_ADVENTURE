/* =====================================================================
   public/js/desktop/screens.js — Renderer tiap layar untuk Desktop Mode
   Petualangan Pelajar · Single-Viewport Cockpit Desktop Engine
   Menggunakan Asset Asli Mode Mobile: Monsters SVG, SkinArt, SkillArt,
   BadgeArt, PetArt, dan Avatar SVG Generator
   ===================================================================== */

(function (root) {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sv = (sym, cls = '') => `<svg class="sv ${cls}" viewBox="0 0 200 200" aria-hidden="true"><use href="#${sym}"/></svg>`;
  const bar = (pct, cls = '', label = '') => `<div class="bar ${cls}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i>${label ? `<span class="t">${label}</span>` : ''}</div>`;
  const panel = (title, body, cls = '', more = '', go_ = '') =>
    `<section class="panel ${cls} ${go_ ? 'link' : ''}" ${go_ ? `data-go="${go_}"` : ''}>${title ? `<h3><span>${title}</span>${more ? `<span class="more">${more}</span>` : ''}</h3>` : ''}${body}</section>`;

  const toast = root.toast || function (msg) { console.log('[Toast]', msg); };
  const Modal = root.Modal || { open: alert, close: () => {} };
  const Keys = root.Keys;
  const UIMode = root.UIMode;

  /* ---------- Katalog & Aset Asli dari Game Mobile ---------- */
  const HABITATS = [
    ['Hutan Rimba', '🌿', 118, 'hutan'],
    ['Rawa Lendir', '🐸', 72, 'rawa'],
    ['Gua Kristal', '💎', 262, 'gua'],
    ['Gunung Api', '🔥', 12, 'api'],
    ['Negeri Es', '❄️', 190, 'es'],
    ['Laut Dalam', '💧', 200, 'laut'],
    ['Kerajaan Awan', '☁️', 215, 'langit'],
    ['Malam Misteri', '🦇', 280, 'hantu'],
    ['Pabrik Robot', '⚙️', 34, 'mesin'],
    ['Pesta Manis', '🍬', 345, 'manis']
  ];

  const RARLBL = { common: 'Common', rare: 'Rare', epic: 'Epic', legend: 'Legend', legendary: 'Legend' };

  // Helper render monster SVG asli dari mobile (Monsters.renderMonster)
  function renderMonsterArt(m, size = 180, opts = {}) {
    if (root.Monsters && typeof root.Monsters.renderMonster === 'function') {
      const realObj = (root.Monsters.MONSTERS && root.Monsters.MONSTERS[m.id ? m.id - 1 : 0]) || m;
      return root.Monsters.renderMonster(realObj, Object.assign({ size }, opts));
    }
    return sv('boss-hero');
  }

  // Helper render skin / item thumbnail SVG asli dari mobile (Avatar.renderThumbnail / SkinArt)
  function renderItemArt(itemId, slot = 'hat', size = 64) {
    if (root.Avatar && typeof root.Avatar.renderThumbnail === 'function') {
      return root.Avatar.renderThumbnail(itemId, slot);
    }
    if (root.SkinArt && typeof root.SkinArt.renderThumbnail === 'function') {
      return root.SkinArt.renderThumbnail(itemId, slot);
    }
    return `<div style="font-size:${size * 0.5}px;display:flex;align-items:center;justify-content:center;height:100%">🎒</div>`;
  }

  // Helper render skill SVG 3D animasi asli dari mobile (SkillArt.renderSkill)
  function renderSkillArt(skillId, level = 1, size = 64, opts = {}) {
    if (root.SkillArt && typeof root.SkillArt.renderSkill === 'function') {
      return root.SkillArt.renderSkill(skillId, level, Object.assign({ size, animated: 'lite' }, opts));
    }
    return `<span style="font-size:${size * 0.5}px">⚡</span>`;
  }

  // Helper render lencana SVG asli dari mobile (BadgeArt.renderBadge)
  function renderBadgeArt(familyId, tier = 'common', size = 64, opts = {}) {
    if (root.BadgeArt && typeof root.BadgeArt.renderBadge === 'function') {
      return root.BadgeArt.renderBadge(familyId, tier, Object.assign({ size }, opts));
    }
    return `<span style="font-size:${size * 0.5}px">🏆</span>`;
  }

  // Helper render avatar pemain SVG asli dari mobile (Avatar.renderAvatar)
  function renderPlayerAvatar(avatarObj, size = 160) {
    if (root.Avatar && typeof root.Avatar.renderAvatar === 'function') {
      return root.Avatar.renderAvatar(avatarObj || {}, { size });
    }
    return sv('av-main');
  }

  // 10 RPG Skill Resmi Game
  const SKILLS_LIST = [
    { id: 'eliminate_one', name: 'Coret Satu', cost: 1, unlockLevel: 1, desc: 'Mencoret 1 pilihan jawaban yang salah' },
    { id: 'eagle_eye', name: 'Mata Elang', cost: 2, unlockLevel: 1, desc: 'Mencoret 2 pilihan jawaban yang salah' },
    { id: 'heal', name: 'Ramuan Hijau', cost: 1, unlockLevel: 1, desc: 'Memulihkan 25 HP petualang seketika' },
    { id: 'shield', name: 'Perisai Kayu', cost: 2, unlockLevel: 2, desc: 'Menyerap damage serangan boss berikutnya' },
    { id: 'power_strike', name: 'Tebasan Super', cost: 3, unlockLevel: 3, desc: 'Damage ke boss berlipat ganda bila benar' },
    { id: 'time_freeze', name: 'Waktu Beku', cost: 3, unlockLevel: 4, desc: 'Membekukan penghitung waktu soal' },
    { id: 'combo_keeper', name: 'Penjaga Combo', cost: 2, unlockLevel: 5, desc: 'Streak tidak reset saat salah/timeout berikutnya' },
    { id: 'lucky_pouch', name: 'Kantong Hoki', cost: 2, unlockLevel: 6, desc: 'Sisa battle: peluang koin ×2, jumlah koin berlipat' },
    { id: 'second_chance', name: 'Jimat Keberuntungan', cost: 4, unlockLevel: 8, desc: 'Jika salah: coba lagi 1x tanpa terkena damage' },
    { id: 'red_potion', name: 'Ramuan Merah', cost: 3, unlockLevel: 5, desc: 'Ganti ke soal termudah & damage berlipat ganda' }
  ];

  // 20 Keluarga Lencana Resmi Game (shared/badges.js)
  const BADGE_FAMILIES = [
    { id: 'boss_slayer', name: 'Penakluk Monster Bos', desc: 'Kalahkan monster bos dalam petualangan' },
    { id: 'brutal_conqueror', name: 'Penakluk Mode Brutal', desc: 'Menangkan pertempuran dalam mode brutal' },
    { id: 'mythic_hunter', name: 'Pembasmi Bos Legend', desc: 'Kalahkan bos ber-tier legend' },
    { id: 'elemental_master', name: 'Penguasa 10 Elemen', desc: 'Kalahkan bos dari beragam elemen habitat' },
    { id: 'survivor_last_stand', name: 'Penyintas Hati Phoenix', desc: 'Menangkan laga dengan HP kritis' },
    { id: 'combo_virtuoso', name: 'Maestro Kombo Membara', desc: 'Raih rentetan jawaban benar beruntun' },
    { id: 'flawless_victory', name: 'Kemenangan Sempurna', desc: 'Selesaikan laga dengan akurasi 100%' },
    { id: 'star_collector', name: 'Pengoleksi Bintang', desc: 'Kumpulkan bintang emas di setiap stage' },
    { id: 'critical_reflexes', name: 'Refleks Cepat Kritis', desc: 'Jawab benar super cepat untuk damage kritis' },
    { id: 'spaced_repetition', name: 'Penakluk Titik Lemah', desc: 'Taklukkan soal-soal ulangan berjarak' },
    { id: 'dex_completer', name: 'Peneliti Monster Dex', desc: 'Buka dan kalahkan entri Monster Dex' },
    { id: 'campaign_pathfinder', name: 'Penjelajah Kampanye', desc: 'Buka simpul petualangan kurikulum' },
    { id: 'fashion_trendsetter', name: 'Ikon Mode & Kostum', desc: 'Koleksi busana dan aksesoris unik' },
    { id: 'coin_tycoon', name: 'Saudagar Koin Emas', desc: 'Kumpulkan koin emas dari hasil belajar' },
    { id: 'skill_strategist', name: 'Taktisi Skill Petualang', desc: 'Gunakan jurus skill taktis dalam laga' },
    { id: 'skill_forge_master', name: 'Tempaan Skill Maksimal', desc: 'Tingkatkan skill hingga level maksimal' },
    { id: 'pvp_gladiator', name: 'Jawara Arena Duel', desc: 'Menangkan duel realtime melawan teman' },
    { id: 'unstoppable_duelist', name: 'Dominasi Duel Tak Terkalahkan', desc: 'Raih rekor kemenangan duel berturut-turut' },
    { id: 'daily_dedication', name: 'Disiplin Belajar Harian', desc: 'Pertahankan streak login dan belajar harian' },
    { id: 'ascendant_level', name: 'Puncak Kejayaan Level', desc: 'Capai level petualang tertinggi' }
  ];

  const QBANK = [
    { t: 'Apa fungsi klorofil pada daun tumbuhan?', o: ['Menyerap cahaya matahari', 'Mengusir serangga hama', 'Membantu penguapan air', 'Menyerap zat hara dari tanah'], a: 0 },
    { t: 'Berapakah hasil dari operasi 15 × 8 = …?', o: ['110', '120', '125', '130'], a: 1 },
    { t: 'Hewan pemakan rumput atau tumbuhan disebut …', short: 'herbivora' },
    { t: 'Planet terdekat dari matahari dalam tata surya kita adalah …', o: ['Venus', 'Merkurius', 'Mars', 'Bumi'], a: 1 },
    { t: 'Bagian tumbuhan yang bertugas menyerap air dan garam mineral adalah …', o: ['Akar', 'Batang', 'Daun', 'Bunga'], a: 0 }
  ];

  /* ---------- Helper Data & Format Beranda / Profile ---------- */
  const TITLE_MAP = {
    title_rookie: 'Pelajar Pemula',
    title_sage: 'Cendekiawan Cilik',
    title_hunter: 'Pemburu Monster',
    title_combo: 'Raja Combo',
    title_king: 'Penakluk Monsterdex'
  };

  function resolveTitleName(titleVal) {
    if (!titleVal) return 'Petualang Cerdas';
    if (typeof titleVal === 'object' && titleVal) {
      return titleVal.name || titleVal.title || resolveTitleName(titleVal.id) || 'Petualang Cerdas';
    }
    const str = String(titleVal).trim();
    if (TITLE_MAP[str]) return TITLE_MAP[str];
    if (root.Economy?.SKINS) {
      const found = root.Economy.SKINS.find(s => s.id === str);
      if (found && found.name) return found.name;
    }
    if (root.Economy?.ITEMS) {
      const found = root.Economy.ITEMS.find(s => s.id === str);
      if (found && found.name) return found.name;
    }
    if (root.ITEMS) {
      const found = root.ITEMS.find(s => s.id === str);
      if (found && found.name) return found.name;
    }
    return str;
  }

  function renderTitlePills(titlesList) {
    let arr = titlesList;
    if (typeof arr === 'string') {
      try { arr = JSON.parse(arr); } catch (_) { arr = [arr]; }
    }
    if (!Array.isArray(arr)) arr = arr ? [arr] : [];
    arr = arr.filter(Boolean);
    if (!arr.length) return '';
    return arr.slice(0, 3).map(t => {
      let name = '';
      let icon = '🎖️';
      let tier = 'common';
      if (typeof t === 'object' && t) {
        name = t.name || t.title || resolveTitleName(t.id);
        icon = t.icon || '🎖️';
        tier = (t.tier || 'COMMON').toLowerCase();
      } else if (typeof t === 'string') {
        name = resolveTitleName(t);
        icon = '🎖️';
      }
      return `<span class="title-pill-tag tier-${tier}">${icon} ${esc(name)}</span>`;
    }).join('');
  }

  function renderHomeBadgeRow(showcaseList) {
    let sc = showcaseList;
    if (typeof sc === 'string') {
      try { sc = JSON.parse(sc); } catch (_) { sc = []; }
    }
    if (!Array.isArray(sc)) sc = [];
    while (sc.length < 3) sc.push(null);
    return `<div class="badge-row badge-row-precision" id="home-badge-row" style="display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem">
      ${sc.slice(0, 3).map((item, idx) => {
        if (!item) {
          return `
            <div class="badge-card badge-card-precision empty" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px 4px;border-radius:var(--rad-m);background:rgba(0,0,0,.2);border:1.5px dashed rgba(255,255,255,.15);text-align:center;min-height:106px;cursor:pointer;opacity:.6" data-go="profil">
              <div style="font-size:1.2rem;opacity:.5">➕</div>
              <b style="font-size:.72rem;color:var(--c-muted);margin-top:2px">Slot #${idx + 1}</b>
              <small class="muted" style="font-size:.62rem">Belum dipasang</small>
            </div>`;
        }
        const tier = (item.tier || 'common').toLowerCase();
        const tierBorderColor = {
          common: 'rgba(245, 158, 11, .45)',
          rare: 'rgba(56, 189, 248, .55)',
          epic: 'rgba(168, 85, 247, .65)',
          legend: 'rgba(245, 158, 11, .8)',
          legendary: 'rgba(245, 158, 11, .8)'
        }[tier] || 'rgba(255, 255, 255, .15)';
        const tierShadow = {
          rare: '0 0 10px rgba(56, 189, 248, .18)',
          epic: '0 0 12px rgba(168, 85, 247, .25)',
          legend: '0 0 16px rgba(245, 158, 11, .35)',
          legendary: '0 0 16px rgba(245, 158, 11, .35)'
        }[tier] || 'none';
        const isTitle = item.type === 'title' || (item.id && String(item.id).startsWith('title_'));
        let iconHtml;
        if (isTitle) {
          iconHtml = `<div class="badge-title-icon" style="font-size:24px;line-height:1;display:flex;align-items:center;justify-content:center">${item.icon || '🎖️'}</div>`;
        } else {
          iconHtml = renderBadgeArt(item.id || item.familyId, tier, 42, { icon: item.icon || '🏅' });
        }
        return `
          <div class="badge-card badge-card-precision tier-${tier}" style="display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:8px 4px 6px;border-radius:var(--rad-m);background:rgba(0,0,0,.32);border:1.5px solid ${tierBorderColor};box-shadow:${tierShadow};text-align:center;min-height:106px;cursor:pointer;overflow:hidden;box-sizing:border-box" data-go="profil" title="${esc(item.name || 'Lencana')} (${tier.toUpperCase()})">
            <div class="badge-icon-wrap" style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">
              ${iconHtml}
            </div>
            <div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:2px;margin-top:2px">
              <b style="font-size:.72rem;font-weight:800;color:#fff;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:96%;display:block">${esc(item.name || 'Lencana')}</b>
              <span class="tag rar-${tier}" style="font-size:.58rem;font-weight:800;text-transform:uppercase;padding:1px 6px;border-radius:4px;letter-spacing:.5px">${esc(item.tier || 'BADGE')}</span>
            </div>
          </div>`;
      }).join('')}
    </div>`;
  }

  function renderHomeSkillsRow(skillsData) {
    let loadout = ['eliminate_one', 'shield', 'time_freeze'];
    let skillLevels = {};
    let slotsCount = 3;

    if (skillsData) {
      if (Array.isArray(skillsData)) {
        loadout = skillsData;
      } else {
        if (Array.isArray(skillsData.loadout)) loadout = skillsData.loadout;
        if (skillsData.slots) slotsCount = skillsData.slots;
        if (Array.isArray(skillsData.list)) {
          skillsData.list.forEach(s => { if (s && s.id) skillLevels[s.id] = s.level || 1; });
        }
      }
    } else if (root.Player?.data?.skills) {
      const ps = root.Player.data.skills;
      if (Array.isArray(ps.loadout)) loadout = ps.loadout;
      else if (Array.isArray(ps)) loadout = ps;
      if (ps.slots) slotsCount = ps.slots;
    }

    const totalSlots = Math.max(slotsCount, loadout.length, 3);
    const KEYS = ['Q', 'W', 'E', 'R'];
    const displayList = Array.from({ length: totalSlots }, (_, i) => loadout[i] || null);

    return `<div class="skill-row skill-row-vertical" id="home-skills-row" style="display:flex;flex-direction:column;gap:.45rem">
      ${displayList.map((skId, idx) => {
        if (!skId) {
          return `
            <div class="skill-item-row empty" style="display:flex;align-items:center;gap:.65rem;padding:.45rem .65rem;border-radius:var(--rad-m);background:rgba(0,0,0,.2);border:1.5px dashed rgba(255,255,255,.15);cursor:pointer;opacity:.6" data-go="skill">
              <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(0,0,0,.3);font-size:1.1rem">➕</div>
              <div style="flex:1;min-width:0">
                <b style="font-size:.8rem;color:var(--c-muted)">Slot #${idx + 1} Kosong</b>
                <div class="muted" style="font-size:.65rem">Klik untuk memasang skill dek laga</div>
              </div>
              <kbd style="font-size:.65rem;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,.08);color:#94a3b8">${KEYS[idx] || (idx + 1)}</kbd>
            </div>`;
        }
        const skDef = SKILLS_LIST.find(s => s.id === skId) || { id: skId, name: skId, cost: 1 };
        const sLvl = skillLevels[skId] || 1;
        const keyLabel = KEYS[idx] || (idx + 1);
        return `
          <div class="skill-item-row" style="display:flex;align-items:center;gap:.65rem;padding:.45rem .65rem;border-radius:var(--rad-m);background:rgba(0,0,0,.32);border:1.5px solid rgba(56,189,248,.25);cursor:pointer;transition:all .15s ease" data-go="skill" title="${esc(skDef.desc || skDef.name)}">
            <div class="skill-item-icon-box" style="width:40px;height:40px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);border-radius:8px;border:1px solid rgba(255,255,255,.08);overflow:hidden">
              ${renderSkillArt(skDef.id, sLvl, 38)}
            </div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:6px">
                <b style="font-size:.82rem;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(skDef.name)}</b>
                <span style="font-size:.6rem;font-weight:800;padding:1px 5px;border-radius:4px;background:rgba(56,189,248,.15);color:#38bdf8;border:1px solid rgba(56,189,248,.3)">Lv.${sLvl}</span>
              </div>
              <div class="muted" style="font-size:.68rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px">${esc(skDef.desc || '')}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex-shrink:0">
              <span style="font-size:.75rem;font-weight:900;color:#facc15;display:inline-flex;align-items:center;gap:2px">⚡ ${skDef.cost || 1}</span>
              <kbd style="font-size:.62rem;font-weight:800;padding:1px 5px;border-radius:4px;background:rgba(255,255,255,.1);color:#cbd5e1;border:1px solid rgba(255,255,255,.15);font-family:monospace">${keyLabel}</kbd>
            </div>
          </div>`;
      }).join('')}
    </div>`;
  }

  /* ===================================================================
     DesktopScreens Objects
     =================================================================== */
  const DesktopScreens = {};

  /* ---------- 1. AUTH (Masuk / Daftar Akun Bersih - Tanpa Pilihan Kelas) ---------- */
  DesktopScreens.auth = el => {
    el.classList.add('auth');
    const heroM = (root.Monsters && root.Monsters.MONSTERS && root.Monsters.MONSTERS[0]) || { id: 1, name: 'Monster' };
    const mascotSvg = renderMonsterArt(heroM, 260);

    let tab = 'login';
    const draw = () => {
      el.innerHTML = `
        <div class="auth-hero">
          <div class="mon">${mascotSvg}</div>
          <h1>PETUALANGAN<br>PELAJAR</h1>
          <div class="muted" style="font-weight:700">Game Kuis RPG Pelajar Cerdas · Desktop Cockpit</div>
        </div>
        <div class="auth-form">
          <div class="auth-card" id="card-auth">
            <div class="tabs">
              <button type="button" class="${tab === 'login' ? 'active' : ''}" id="tab-log">Masuk</button>
              <button type="button" class="${tab === 'register' ? 'active' : ''}" id="tab-reg">Daftar Baru</button>
            </div>
            <label class="field">${tab === 'login' ? 'Nama Panggilan / Nickname' : 'Nama Karakter Baru'}
              <input type="text" id="auth-nick" data-testid="input-nick" placeholder="Masukkan nama panggilan kamu" value="" autocomplete="username" autofocus>
            </label>
            <label class="field">Kata Sandi / PIN Ceria
              <input type="password" id="auth-pass" data-testid="input-password" placeholder="Masukkan kata sandi / PIN kamu" value="" maxlength="32" autocomplete="current-password">
            </label>
            <div id="auth-error" class="auth-error-msg" style="display:none;color:#ef4444;font-size:0.82rem;font-weight:700;text-align:center;padding:4px"></div>
            <button type="button" class="btn primary lg block" id="btn-submit-auth" data-testid="${tab === 'login' ? 'btn-login' : 'btn-register'}">
              🚀 ${tab === 'login' ? 'Mulai Bermain!' : 'Daftar & Petualang!'} <span class="kbd">Enter</span>
            </button>
            <div class="muted tc" style="font-size:.78rem;font-weight:700">
              Kelas belajar ditentukan otomatis oleh guru/admin kelas kamu.
            </div>
          </div>
        </div>`;

      $('#tab-log').onclick = () => { tab = 'login'; draw(); };
      $('#tab-reg').onclick = () => { tab = 'register'; draw(); };

      const submitAuth = async () => {
        const nickInput = $('#auth-nick');
        const passInput = $('#auth-pass');
        const errBox = $('#auth-error');
        const btn = $('#btn-submit-auth');
        if (!nickInput || !passInput) return;

        const nick = nickInput.value.trim();
        const pass = passInput.value.trim();
        if (errBox) errBox.style.display = 'none';

        if (!nick || !pass) {
          const msg = 'Harap isi nama panggilan dan kata sandi.';
          if (errBox) { errBox.textContent = msg; errBox.style.display = 'block'; }
          toast(msg);
          return;
        }

        const api = root.API || window.API;
        if (!api || typeof api.login !== 'function') {
          toast('Layanan API belum siap. Silakan muat ulang halaman.');
          return;
        }

        btn.disabled = true;
        btn.textContent = 'Memproses...';

        try {
          let playerObj;
          if (tab === 'login') {
            playerObj = await api.login(nick, pass);
          } else {
            playerObj = await api.register(nick, pass);
          }
          if (root.Player) root.Player.data = playerObj;
          if (window.Player) window.Player.data = playerObj;

          toast(`Selamat datang, ${playerObj.nick || playerObj.name || nick}! ✨`);

          if (root.checkActiveSession) {
            try { await root.checkActiveSession(); } catch (_) {}
          }
          root.go('home');
        } catch (err) {
          btn.disabled = false;
          btn.innerHTML = `🚀 ${tab === 'login' ? 'Mulai Bermain!' : 'Daftar & Petualang!'} <span class="kbd">Enter</span>`;
          const errMsg = err.message || 'Nama atau PIN salah';
          if (errBox) {
            errBox.textContent = errMsg;
            errBox.style.display = 'block';
          }
          toast('Gagal masuk: ' + errMsg);
        }
      };

      $('#btn-submit-auth').onclick = submitAuth;

      $('#auth-nick').onkeydown = e => { if (e.key === 'Enter') $('#auth-pass').focus(); };
      $('#auth-pass').onkeydown = e => { if (e.key === 'Enter') submitAuth(); };
    };

    draw();
    Keys.set({
      Enter: () => $('#btn-submit-auth')?.click(),
      '?': () => root.DesktopShell.keysHelp(),
      __noGlobal: true
    });
  };

  /* ---------- 2. BERANDA = Ruang Kendali Cockpit Presisi ---------- */
  DesktopScreens.home = el => {
    const P = root.Player?.data || {};
    const pName = P.nick || P.name || 'Petualang';
    const pLv = P.level || (root.Player && typeof root.Player.level === 'function' ? root.Player.level() : 1);
    const pTitle = resolveTitleName(P.title);
    const pCls = P.className || (P.classId ? `Kelas ${P.classId} SD` : 'Kelas 4 SD');
    const pXp = P.xp ?? 0;
    const pCoins = P.coins ?? 0;
    const pStreak = P.dayStreak || P.streak || 1;
    const pWins = P.stats?.bossDefeated ?? (P.stats?.duelWins ?? (P.wins || 0));

    let activeTitles = P.titles || [];
    try {
      if (typeof activeTitles === 'string') activeTitles = JSON.parse(activeTitles);
    } catch (_) {}
    if (!activeTitles.length && pTitle) activeTitles = [{ id: P.title, name: pTitle, icon: '🎖️', tier: 'COMMON' }];

    const avatarSvg = renderPlayerAvatar(P.avatar, 140);
    const heroM = (root.Monsters && root.Monsters.MONSTERS && root.Monsters.MONSTERS[2]) || { id: 3, name: 'Jamurgon' };
    const mascotSvg = renderMonsterArt(heroM, 240);

    el.classList.add('g3');
    const days = [40, 65, 30, 80, 55, 90, 70];

    el.innerHTML = `
      <div class="col">
        ${panel('', `<div class="hero-card">
            <div class="av" id="home-avatar-box">${avatarSvg}</div>
            <div>
              <h2 id="home-pname">${esc(pName)}</h2>
              <div class="ttl" id="home-ptitle">${esc(pTitle)}</div>
              <div class="titles-pills-row" id="home-titles-row">
                ${renderTitlePills(activeTitles)}
              </div>
              <div class="muted" id="home-pmeta" style="font-size:.78rem;font-weight:700;margin:.15rem 0 .35rem">${esc(pCls)} · Level ${pLv}</div>
              <div id="home-xp-box">${bar(pXp % 100, 'xp lg', 'XP ' + (pXp % 100) + '%')}</div>
            </div>
          </div>`, '', '', 'profil')}

        ${panel('Skill aktif (Dek Laga)', renderHomeSkillsRow(P.skills), '', 'Atur ▸', 'skill')}

        ${panel('Lencana showcase', renderHomeBadgeRow(P.showcase), '', 'Semua ▸', 'profil')}

        ${panel('Teman online', `
            <div id="home-friends-box">
              <div class="friend"><span class="a">👤</span>Kawan Belajar<span class="dot"></span><span class="sp"></span><button class="btn sm primary" data-go="friends">Duel</button></div>
            </div>`, 'fill', 'Pertemanan ▸', 'friends')}
      </div>

      <div class="stage" style="display:flex;flex-direction:column;align-items:center;justify-content:space-between">
        <div class="bubble" id="home-bubble">Halo ${esc(pName)}, siap menaklukkan bos hari ini? 👋</div>
        <div class="mascot" id="mascot" style="cursor:pointer" title="${esc(heroM.name)}">${mascotSvg}</div>

        <!-- Quick Stats Hero Cockpit (Menggantikan 10 ubin menu duplikat) -->
        <div class="hero-quick-stats-card" id="home-quick-stats" style="display:flex;justify-content:space-around;gap:.8rem;width:100%;padding:.65rem .8rem;border-radius:var(--rad-m);background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.07);margin:.4rem 0">
          <div class="tc" style="flex:1"><span style="font-size:1.3rem">🔥</span><div style="font-size:.85rem;font-weight:900;color:#fb923c" id="home-stat-streak">${pStreak} Hari</div><small class="muted" style="font-size:.68rem;font-weight:800">Streak Belajar</small></div>
          <div style="width:1px;background:rgba(255,255,255,.1)"></div>
          <div class="tc" style="flex:1"><span style="font-size:1.3rem">🪙</span><div style="font-size:.85rem;font-weight:900;color:#facc15" id="home-stat-coins">${pCoins.toLocaleString('id-ID')}</div><small class="muted" style="font-size:.68rem;font-weight:800">Koin Diperoleh</small></div>
          <div style="width:1px;background:rgba(255,255,255,.1)"></div>
          <div class="tc" style="flex:1"><span style="font-size:1.3rem">🏆</span><div style="font-size:.85rem;font-weight:900;color:#38bdf8" id="home-stat-wins">${pWins} Laga</div><small class="muted" style="font-size:.68rem;font-weight:800">Kemenangan Arena</small></div>
        </div>

        <div class="nowline" id="home-nowline" style="width:100%">
          <div class="t"><span id="home-camp-title">📖 Petualangan Kampanye Kurikulum</span><span id="home-camp-stars">⭐ Siap Tempur</span></div>
          ${bar(75, 'good')}
          <div class="muted" id="home-camp-next" style="font-size:.75rem;font-weight:700">Tantang Monster Bos Wilayah untuk Bintang Sempurna!</div>
        </div>
        <div class="cta-row" style="margin-top:.5rem;width:100%;display:flex;gap:.8rem">
          <button class="btn primary lg" id="btn-home-continue" style="flex:1">⚔️ Lanjutkan Petualangan <span class="kbd">Enter</span></button>
          <button class="btn lg" data-go="latihan" style="flex:1">📚 Latihan Bebas</button>
        </div>
      </div>

      <div class="col">
        ${panel('Laporan minggu ini', `<div class="row">
            <div class="ring" id="home-rep-ring" style="--p:85;--rc2:#22c55e"><b id="home-rep-acc">85%</b></div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:800" id="home-rep-stats">Ringkasan Mingguan</div>
              <div class="muted" style="font-size:.75rem;font-weight:700">Akurasi rata-rata</div>
              <div class="week-bars" id="home-rep-bars" style="height:2.6rem;margin-top:.3rem">${days.map((d, i) => `<i class="${i === 6 ? 'today' : ''}" style="height:${d}%"></i>`).join('')}</div>
            </div>
          </div>
          <div class="weak" id="home-weak-box" style="padding:.4rem .7rem;font-size:.8rem;font-weight:700;margin-top:.4rem">
            🔴 Rekomendasi: Perbanyak latihan untuk menjaga streak!
          </div>`, 'fill', 'Detail ▸', 'report')}

        ${panel('Monster Dex', `<div class="row">
            <div class="ring" id="home-dex-ring" style="--p:10;--rc2:#a855f7"><b id="home-dex-count">0</b></div>
            <div>
              <div style="font-weight:800" id="home-dex-label">0 / 100 dikalahkan</div>
              <div class="muted" id="home-dex-recent" style="font-size:.75rem;font-weight:700">10 Habitat · 40 Spesies Unik</div>
            </div>
          </div>`, 'fill', 'Buka ▸', 'dex')}
      </div>`;

    const mascotLines = [
      `Halo ${pName}, siap menaklukkan bos hari ini? 👋`,
      `Petualang cerdas tak pernah gentar menghadapi tantangan! ⚔️`,
      `Pelajari titik lemah lawan untuk menang dengan sempurna! 🎯`,
      `Kumpulkan 100 Bos Elemen di Monster Dex! 📖`,
      `Semangat belajar, raih bintang tertinggi hari ini! ⭐`
    ];
    let lineIdx = 0;
    $('#mascot').onclick = () => {
      if (root.Sfx && typeof root.Sfx.play === 'function') root.Sfx.play('tap');
      lineIdx = (lineIdx + 1) % mascotLines.length;
      const bEl = $('#home-bubble');
      if (bEl) bEl.textContent = mascotLines[lineIdx];
      toast(`🐲 ${esc(heroM.name)}: "${mascotLines[lineIdx]}"`);
    };

    const handleContinue = async () => {
      if (root.Screens?.battle?.session) {
        return root.go('battle');
      }
      if (root.API && typeof root.API.getActiveSession === 'function') {
        try {
          const res = await root.API.getActiveSession();
          if (res?.session) {
            if (root.Screens && root.Screens.battle) root.Screens.battle.session = res.session;
            return root.go('battle');
          }
        } catch (_) {}
      }
      if (root.API && typeof root.API.getSubjects === 'function') {
        try {
          const subjects = await root.API.getSubjects(root.Player?.data?.classId || 1);
          if (subjects && subjects.length > 0) {
            if (root.Screens?.battle?.start) {
              return root.Screens.battle.start(subjects[0].id);
            }
          }
        } catch (_) {}
      }
      root.go('peta');
    };

    $('#btn-home-continue').onclick = handleContinue;
    Keys.set({ Enter: handleContinue });

    // Live Data Synchronization
    if (root.API) {
      if (typeof root.API.getProfile === 'function') {
        root.API.getProfile().then(res => {
          if (!res) return;
          const p = res.player || res;
          if (root.Player && root.Player.data) {
            Object.assign(root.Player.data, p, {
              avatar: res.avatar || p.avatar || root.Player.data.avatar,
              showcase: res.showcase || root.Player.data.showcase,
              titles: res.titles || root.Player.data.titles,
              stats: res.stats || root.Player.data.stats,
              skills: res.skills || root.Player.data.skills
            });
          }
          const pName = p.nick || p.name || 'Petualang';
          const pTitleName = resolveTitleName(p.title);
          const pCls = p.className || (p.classId ? `Kelas ${p.classId} SD` : 'Kelas 4 SD');
          const pLv = p.level || 1;
          const pXp = p.xp ?? 0;
          const pCoins = p.coins ?? 0;
          const pStreak = p.dayStreak || res.stats?.dayStreak || 1;
          const pWins = res.stats?.bossDefeated ?? (res.stats?.duelWins ?? 0);

          const nameEl = $('#home-pname');
          if (nameEl) nameEl.textContent = pName;

          const ttlEl = $('#home-ptitle');
          if (ttlEl) ttlEl.textContent = pTitleName;

          const metaEl = $('#home-pmeta');
          if (metaEl) metaEl.textContent = `${pCls} · Level ${pLv}`;

          const titlesBox = $('#home-titles-row');
          if (titlesBox && (res.titles || p.titles)) {
            titlesBox.innerHTML = renderTitlePills(res.titles || p.titles);
          }

          const showcaseBox = $('#home-badge-row');
          if (showcaseBox && res.showcase) {
            showcaseBox.outerHTML = renderHomeBadgeRow(res.showcase);
          }

          const skillsBox = $('#home-skills-row');
          if (skillsBox && res.skills) {
            skillsBox.outerHTML = renderHomeSkillsRow(res.skills);
          }

          const streakEl = $('#home-stat-streak');
          if (streakEl) streakEl.textContent = `${pStreak} Hari`;

          const coinsEl = $('#home-stat-coins');
          if (coinsEl) coinsEl.textContent = pCoins.toLocaleString('id-ID');

          const winsEl = $('#home-stat-wins');
          if (winsEl) winsEl.textContent = `${pWins} Laga`;

          const avBox = $('#home-avatar-box');
          if (avBox && (res.avatar || p.avatar)) {
            avBox.innerHTML = renderPlayerAvatar(res.avatar || p.avatar, 140);
          }

          const xpBox = $('#home-xp-box');
          if (xpBox) {
            xpBox.innerHTML = bar(pXp % 100, 'xp lg', 'XP ' + (pXp % 100) + '%');
          }

          const defCount = res.stats?.dexDefeated || res.monstersDefeated || (res.monsters && res.monsters.filter(m => m.defeated).length) || 0;
          const countEl = $('#home-dex-count');
          const ringEl = $('#home-dex-ring');
          const labelEl = $('#home-dex-label');
          if (countEl) countEl.textContent = defCount;
          if (ringEl) ringEl.style.setProperty('--p', defCount);
          if (labelEl) labelEl.textContent = `${defCount} / 100 dikalahkan`;
          if (root.DesktopShell?.updateTopbar) root.DesktopShell.updateTopbar(p);
        }).catch(() => {});
      }

      if (typeof root.API.getWeeklyReport === 'function') {
        root.API.getWeeklyReport().then(res => {
          if (!res || !res.report) return;
          const rep = res.report;
          const acc = rep.summary?.accuracy ?? 85;
          const ans = rep.summary?.answered ?? 0;
          const cor = rep.summary?.correct ?? 0;
          const ringEl = $('#home-rep-ring');
          const accEl = $('#home-rep-acc');
          const statsEl = $('#home-rep-stats');
          if (ringEl) ringEl.style.setProperty('--p', acc);
          if (accEl) accEl.textContent = `${acc}%`;
          if (statsEl && ans > 0) statsEl.textContent = `${cor} / ${ans} benar`;

          if (rep.weakPoints && rep.weakPoints.length > 0) {
            const w = rep.weakPoints[0];
            const weakBox = $('#home-weak-box');
            if (weakBox) weakBox.innerHTML = `🔴 Titik lemah: <b>${esc(w.topic || w.name)}</b> (${w.accuracy || 45}%)`;
          }
        }).catch(() => {});
      }

      if (typeof root.API.req === 'function') {
        root.API.req('/api/friends').then(res => {
          const flist = res.friends || [];
          const box = $('#home-friends-box');
          if (box && flist.length > 0) {
            box.innerHTML = flist.slice(0, 3).map(f => `
              <div class="friend" style="display:flex;align-items:center;gap:.5rem;padding:.3rem 0">
                <span class="a">👤</span>
                <span style="font-weight:700;flex:1;overflow:hidden;text-overflow:ellipsis">${esc(f.name || f.nick)}</span>
                <span class="dot ${f.online ? '' : 'off'}"></span>
                ${f.online ? `<button class="btn sm primary" data-go="friends" style="padding:2px 8px;font-size:.7rem">Duel</button>` : `<span class="muted" style="font-size:.7rem">offline</span>`}
              </div>`).join('');
          }
        }).catch(() => {});
      }

      if (typeof root.API.getCampaign === 'function') {
        root.API.getCampaign(P.classId || 1).then(camp => {
          if (!camp) return;
          const activeChap = camp.activeChapter || camp.chapters?.[0] || camp;
          if (activeChap) {
            const tEl = $('#home-camp-title');
            const sEl = $('#home-camp-stars');
            const nEl = $('#home-camp-next');
            if (tEl) tEl.textContent = `📖 Bab ${activeChap.id || 1}: ${esc(activeChap.title || activeChap.name || 'Petualangan Kurikulum')}`;
            if (sEl) sEl.textContent = `⭐ ${activeChap.stars || 0} Bintang Terkumpul`;
            if (nEl) nEl.textContent = `Stage ${activeChap.currentStage || 1}/10 · Tantang Bos Wilayah untuk Bintang Sempurna!`;
          }
        }).catch(() => {});
      }
    }
  };

  /* ---------- 3. PETUALANGAN (Peta Kampanye, Mode Cerita, Mode Bebas & Mode Fun) ---------- */
  DesktopScreens.peta = async el => {
    el.classList.add('g3n');
    let viewMode = 'cerita'; // 'cerita' | 'bebas' | 'fun'
    const P = root.Player?.data || {};
    const currentClassId = P.classId || (typeof root.Player?.classId === 'function' ? root.Player.classId() : 1);
    let subjects = [];
    let selSubjectId = null;
    let campData = null;
    let curChapterIdx = 0;
    let selNodeKey = null;
    let brutalMode = Boolean(root.Screens?.battle?.brutalEnabled);
    const pLevel = typeof root.Player?.level === 'function' ? root.Player.level() : (P.level || 1);

    async function loadData() {
      try {
        if (root.API && typeof root.API.getSubjects === 'function') {
          subjects = await root.API.getSubjects(currentClassId);
        }
      } catch (_) {}
      if (!subjects || !subjects.length) {
        subjects = [
          { id: 1, name: 'Ilmu Pengetahuan Alam', icon: '🌿', monsterTheme: 'hutan', questionCount: 10, timeLimitSec: 30, bestStars: 3, wins: 5 },
          { id: 2, name: 'Matematika', icon: '📐', monsterTheme: 'gua', questionCount: 10, timeLimitSec: 30, bestStars: 2, wins: 3 },
          { id: 3, name: 'Bahasa Indonesia', icon: '📖', monsterTheme: 'api', questionCount: 10, timeLimitSec: 30, bestStars: 1, wins: 1 }
        ];
      }
      if (!selSubjectId || !subjects.some(s => s.id === selSubjectId)) {
        selSubjectId = subjects[0].id;
      }
      if (viewMode === 'cerita') {
        try {
          if (root.API && typeof root.API.getCampaign === 'function') {
            campData = await root.API.getCampaign(selSubjectId);
          }
        } catch (_) {}
      }
    }

    await loadData();

    const draw = () => {
      const curSub = subjects.find(s => s.id === selSubjectId) || subjects[0];
      const isFun = viewMode === 'fun';
      const isCerita = viewMode === 'cerita';

      const chapters = (campData?.chapters && campData.chapters.length > 0) ? campData.chapters : [
        {
          n: 1,
          theme: curSub.monsterTheme || 'hutan',
          title: `Petualangan Rimba ${curSub.name}`,
          completed: false,
          nodes: [
            { key: `s${curSub.id}-c1-n1`, title: 'Simpul 1: Penjelajah Awal', stars: 3, unlocked: true, cleared: true, clearedThisWeek: false, isBoss: false, questionCount: 10, order: 1 },
            { key: `s${curSub.id}-c1-n2`, title: 'Simpul 2: Jurang Pengetahuan', stars: 2, unlocked: true, cleared: true, clearedThisWeek: false, isBoss: false, questionCount: 10, order: 2 },
            { key: `s${curSub.id}-c1-n3`, title: 'Simpul 3: Bos Penjaga Wilayah', stars: 0, unlocked: true, cleared: false, clearedThisWeek: false, isBoss: true, questionCount: 10, order: 3 }
          ]
        }
      ];

      if (curChapterIdx >= chapters.length) curChapterIdx = 0;
      const curCh = chapters[curChapterIdx];
      const allNodes = curCh.nodes || [];

      // Pastikan selNodeKey selalu tersinkronisasi dengan simpul yang valid di bab ini
      if (!allNodes.some(n => n.key === selNodeKey)) {
        const preferredNode = allNodes.find(n => n.unlocked && !n.clearedThisWeek) || allNodes.find(n => n.unlocked) || allNodes[0];
        selNodeKey = preferredNode ? preferredNode.key : (allNodes[0] ? allNodes[0].key : `s${curSub.id}-c${curCh.n}-n1`);
      }

      const curNode = allNodes.find(n => n.key === selNodeKey) || allNodes[0] || { key: `s${curSub.id}-c${curCh.n}-n1`, title: 'Simpul 1', isBoss: false, unlocked: true };
      const bossMonster = (root.Monsters && root.Monsters.MONSTERS && (root.Monsters.MONSTERS.find(m => m.theme === curCh.theme || m.element === curCh.theme) || root.Monsters.MONSTERS[2])) || { id: 3, name: 'Raja Jamurgon', tier: 'rare' };
      const bossSvg = renderMonsterArt(bossMonster, 210, { animated: true });

      const isNodeLocked = !curNode.unlocked;
      const isNodeClearedWeek = Boolean(curNode.clearedThisWeek);

      el.innerHTML = `
      <div class="col">
        <!-- Sakelar Mode: Bebas | Cerita | Fun -->
        <div style="display:flex;background:rgba(255,255,255,0.08);padding:4px;border-radius:12px;gap:4px;margin-bottom:8px">
          <button class="btn small ${viewMode === 'bebas' ? 'primary' : 'ghost'}" id="mode-toggle-bebas" data-testid="mode-toggle-bebas" style="flex:1;font-weight:700">
            ⚔️ Mode Bebas
          </button>
          <button class="btn small ${viewMode === 'cerita' ? 'primary' : 'ghost'}" id="mode-toggle-cerita" data-testid="mode-toggle-cerita" style="flex:1;font-weight:700">
            🗺️ Mode Cerita
          </button>
          <button class="btn small ${viewMode === 'fun' ? 'primary' : 'ghost'}" id="mode-toggle-fun" data-testid="mode-toggle-fun" style="flex:1;font-weight:700">
            🎉 Mode Fun
          </button>
        </div>

        <!-- SAKELAR MODE BRUTAL (T-21) -->
        <div class="brutal-toggle-wrap ${brutalMode ? 'active' : ''}" data-testid="brutal-toggle-wrap" style="margin-bottom:8px">
          <label style="display:flex;align-items:center;gap:10px;cursor:${pLevel >= 5 ? 'pointer' : 'not-allowed'};width:100%">
            <input type="checkbox" id="brutal-toggle" data-testid="brutal-toggle" ${brutalMode ? 'checked' : ''} ${pLevel < 5 ? 'disabled' : ''} style="width:18px;height:18px;accent-color:#dc2626">
            <div style="flex:1">
              <span style="font-size:0.85rem;font-weight:800;color:${pLevel >= 5 ? '#ef4444' : 'var(--c-muted)'}">💀 Mode Brutal</span>
              <span style="display:block;font-size:0.72rem;color:var(--c-muted)">Skill boss 2× • Hadiah 3× ${pLevel < 5 ? '🔒 (Terbuka di Lv 5)' : ''}</span>
            </div>
          </label>
        </div>

        <!-- Info Kelas Siswa (Ditentukan oleh Guru/Admin) -->
        <div style="font-size:0.8rem;color:var(--c-muted);font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px">
          <span>🏫</span>
          <span>${esc(P.className || (P.classId ? ('Kelas ' + P.classId + ' SD') : 'Kelas Petualang'))}</span>
        </div>

        ${panel('Daftar Mata Pelajaran', `<div class="sub-list" style="display:flex;flex-direction:column;gap:.5rem;overflow-y:auto;flex:1;min-height:0;padding-right:4px;-webkit-overflow-scrolling:touch">
          ${subjects.map(s => `
            <button class="btn ${s.id === selSubjectId ? 'primary' : 'ghost'} sub-select-btn sub-chip" data-id="${s.id}" data-sub="${s.id}" style="justify-content:flex-start;text-align:left;padding:.6rem .8rem">
              <span style="font-size:1.4rem;margin-right:.5rem">${s.icon || '📚'}</span>
              <div style="flex:1">
                <div style="font-weight:800">${esc(s.name)}</div>
                <div class="muted" style="font-size:.7rem">${s.questionCount} Soal · ${s.bestStars > 0 ? '⭐'.repeat(s.bestStars) : '☆☆☆'}</div>
              </div>
            </button>`).join('')}
        </div>`, 'fill')}
      </div>

      ${isCerita ? panel('Peta Mode Cerita · ' + esc(curSub.name), `
        <div class="map-canvas" style="position:relative;height:100%;min-height:24rem;background:radial-gradient(ellipse at center, rgba(30,27,75,.7), rgba(15,23,42,.95));border-radius:var(--rad-m);display:flex;flex-direction:column;gap:1rem;padding:1rem;overflow-y:auto">
          <!-- Banner Reset Mode Cerita Setiap Senin 07:00 WIB -->
          <div class="card" style="background:linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98));border:1px solid rgba(245,158,11,0.35);border-radius:14px;padding:10px 14px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 16px rgba(0,0,0,0.35);flex-shrink:0">
            <span style="font-size:1.6rem">🗓️</span>
            <div style="flex:1;min-width:0">
              <div style="font-size:0.82rem;font-weight:800;color:#fef08a;margin-bottom:2px">
                Mode Cerita Mingguan: Hanya 1× Tiap Wilayah
              </div>
              <div style="font-size:0.72rem;color:#cbd5e1;line-height:1.35">
                Setiap wilayah hanya dapat dimainkan <strong>1 kali</strong> per minggu. Seluruh wilayah otomatis di-reset setiap <strong>Senin pukul 07:00 WIB</strong>!
              </div>
            </div>
          </div>

          <!-- Pilihan Bab (Chapter Switcher) -->
          ${chapters.length > 1 ? `
            <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;flex-shrink:0">
              ${chapters.map((ch, idx) => `
                <button class="btn small ${curChapterIdx === idx ? 'primary' : 'ghost'} ch-tab-btn" data-ch="${idx}" style="white-space:nowrap;font-weight:700;font-size:0.8rem">
                  Bab ${ch.n}: ${esc(ch.title)} ${ch.completed ? '✅' : ''}
                </button>
              `).join('')}
            </div>
          ` : ''}

          <!-- Banner Gambar Peta Tema Wilayah Asli Mobile -->
          <div class="chapter-card card" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:14px;flex-shrink:0">
            <div class="chapter-map-banner" style="position:relative;height:120px;border-radius:14px;overflow:hidden;margin-bottom:14px;border:1px solid rgba(255,255,255,0.12);box-shadow:0 4px 12px rgba(0,0,0,0.3)">
              <img src="/img/maps/map_${esc(curCh.theme || 'hutan')}.jpg" alt="${esc(curCh.title)}" style="width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.85)" onerror="this.src='/img/maps/map_hutan.jpg'">
              <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.35) 60%, transparent 100%);display:flex;flex-direction:column;justify-content:flex-end;padding:10px 14px">
                <div style="display:flex;justify-content:space-between;align-items:flex-end">
                  <div>
                    <span style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:var(--c-primary,#10b981);font-weight:800">Bab ${curCh.n} · Peta Wilayah</span>
                    <h3 style="font-size:1.15rem;font-weight:800;color:#fff;margin:2px 0;text-shadow:0 2px 4px rgba(0,0,0,0.8)">${esc(curCh.title)}</h3>
                  </div>
                  ${curCh.completed ? `
                    <button class="btn small secondary btn-view-comic" data-theme="${curCh.theme || 'hutan'}" data-testid="btn-view-comic" style="font-size:0.8rem;padding:4px 10px;background:rgba(15,23,42,0.8);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.2)">
                      📖 Lihat Cerita
                    </button>
                  ` : `
                    <span class="chip" style="font-size:0.75rem;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.2)">${allNodes.filter(n => n.cleared).length}/${allNodes.length} Selesai</span>
                  `}
                </div>
              </div>
            </div>

            <!-- Jalur Berkelok (Winding Path Simpul Wilayah 1-3) -->
            <div class="winding-path" style="display:flex;align-items:center;justify-content:space-around;padding:10px 0;position:relative">
              ${allNodes.map((node, i) => {
                const starsStr = node.stars > 0 ? '⭐'.repeat(node.stars) : '';
                return `
                  <div class="campaign-node-wrap ${node.unlocked ? 'unlocked' : 'locked'}" style="display:flex;flex-direction:column;align-items:center;gap:4px">
                    <button class="campaign-node-btn ${node.isBoss ? 'boss-node' : ''} ${node.unlocked ? 'unlocked' : 'locked'} ${node.clearedThisWeek ? 'cleared-week' : ''} ${selNodeKey === node.key ? 'on' : ''}"
                      data-key="${node.key}"
                      data-unlocked="${node.unlocked ? '1' : '0'}"
                      data-cleared-week="${node.clearedThisWeek ? '1' : '0'}"
                      data-testid="campaign-node"
                      style="width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;cursor:${node.unlocked ? 'pointer' : 'not-allowed'};background:${node.clearedThisWeek ? 'linear-gradient(135deg, #059669, #047857)' : (node.unlocked ? (node.isBoss ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #10b981, #059669)') : '#334155')};border:${node.clearedThisWeek ? '3px solid #34d399' : (node.isBoss ? '3px solid #fef08a' : (selNodeKey === node.key ? '3px solid var(--c-primary)' : '2px solid rgba(255,255,255,0.2)'))};box-shadow:${selNodeKey === node.key ? '0 0 14px rgba(56,189,248,0.6)' : (node.unlocked ? '0 4px 12px rgba(0,0,0,0.4)' : 'none')};opacity:${node.unlocked ? '1' : '0.55'}">
                      ${node.unlocked ? (node.clearedThisWeek ? '✅' : (node.isBoss ? '👑' : (node.cleared ? '⚔️' : '📍'))) : '🔒'}
                    </button>
                    <div style="font-size:0.75rem;font-weight:700;color:${node.clearedThisWeek ? '#34d399' : (node.unlocked ? '#fff' : '#64748b')};text-align:center">
                      ${esc(node.title)} ${node.isBoss ? '🎁' : ''} ${node.clearedThisWeek ? '(Selesai)' : ''}
                    </div>
                    <div style="font-size:0.68rem;color:var(--c-muted)">
                      ${node.questionCount} Soal ${node.isBoss ? '· Boss & Peti 🎁' : ''}
                    </div>
                    ${starsStr ? `<div style="font-size:0.7rem;line-height:1">${starsStr}</div>` : ''}
                  </div>
                  ${i < allNodes.length - 1 ? `<div style="font-size:1.6rem;color:var(--c-primary);font-weight:900">➔</div>` : ''}
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `, 'fill') : panel(isFun ? 'Mode Fun · 4 Variasi Tipe Soal' : 'Mode Bebas · Pertempuran Mandiri', `
        <div style="display:flex;flex-direction:column;gap:12px;padding:.5rem;overflow-y:auto;height:100%">
          ${isFun ? `
            <div style="background:linear-gradient(135deg,rgba(168,85,247,0.2) 0%,rgba(236,72,153,0.15) 100%);border:1px solid rgba(168,85,247,0.3);border-radius:12px;padding:10px 14px;display:flex;align-items:center;gap:10px">
              <span style="font-size:1.8rem">🎉</span>
              <div>
                <div style="font-weight:800;color:#fff;font-size:0.95rem">Mode Fun (4 Variasi Tipe Soal)</div>
                <div style="font-size:0.78rem;color:var(--c-muted)">Menghadirkan Benar/Salah, Mengurutkan, Menjodohkan, &amp; Isian Singkat (Tanpa MCQ). Koin 0.5×!</div>
              </div>
            </div>
          ` : ''}
          <div class="stack" style="gap:10px">
            ${subjects.map(s => {
              const starsStr = s.bestStars > 0 ? '⭐'.repeat(s.bestStars) + '☆'.repeat(3 - s.bestStars) : '☆☆☆';
              return `
                <div class="card subject-card" data-id="${s.id}" style="cursor:pointer;display:flex;align-items:center;gap:14px;padding:14px;background:var(--c-surface);border:1px solid var(--c-surface-strong);border-radius:var(--rad-m)">
                  <div style="font-size:2.2rem;width:56px;height:56px;border-radius:14px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center">${s.icon || '📚'}</div>
                  <div class="grow" style="flex:1">
                    <div style="display:flex;align-items:center;gap:8px">
                      <strong style="font-size:1.1rem;color:#fff">${esc(s.name)}</strong>
                      <span style="font-size:.7rem;padding:2px 8px;border-radius:99px;background:rgba(255,255,255,.1);color:var(--c-muted)">${esc(s.monsterTheme || 'Hutan')}</span>
                    </div>
                    <div style="font-size:.78rem;color:var(--c-muted);margin-top:2px">
                      ${s.questionCount} Soal · ${s.timeLimitSec || 30}s / soal
                    </div>
                    <div style="font-size:.82rem;color:var(--c-primary);margin-top:3px">
                      ${starsStr} · Menang: ${s.wins || 0}×
                    </div>
                  </div>
                  <button class="btn ${isFun ? 'primary' : 'secondary'}" data-testid="start-battle" style="pointer-events:none">${isFun ? 'Mainkan 🎉' : 'Lawan ⚔️'}</button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `, 'fill')}

      <div class="col">
        ${panel('Informasi Pertempuran', `
          <div class="preview-stage tc" style="padding:.6rem 0">${bossSvg}</div>
          <div class="tc">
            <h2 style="font-size:1.15rem;margin:.2rem 0">${esc(isCerita ? (curNode.title || bossMonster.name) : (curSub.name))}</h2>
            <span class="tag rar-epic">Bos Penjaga · Elemen ${HABITATS[bossMonster.id ? (bossMonster.id - 1) % 10 : 0][0]}</span>
          </div>
          <div class="kv"><span>Mata Pelajaran</span><b>${esc(curSub.name)}</b></div>
          <div class="kv"><span>Tipe Arena</span><b>${isCerita ? ('Bab ' + curCh.n + ' Simpul ' + (curNode.order || 1)) : (isFun ? 'Mode Fun 4-Variasi' : 'Pertempuran Bebas')}</b></div>
          <div class="kv"><span>Syarat Lolos</span><b>Akurasi ≥ 70%</b></div>
          <div class="kv" style="border:0">
            <span>Status Mode Brutal</span>
            <b style="color:${brutalMode ? '#ef4444' : 'var(--c-muted)'}">${brutalMode ? 'Aktif 🔥' : 'Nonaktif'}</b>
          </div>
        `, 'fill')}
        <button class="btn primary lg block" id="btn-start-node" style="font-weight:800" ${isCerita && (isNodeLocked || isNodeClearedWeek) ? 'disabled style="opacity:0.6;cursor:not-allowed"' : ''}>
          ${isCerita ? (isNodeClearedWeek ? '✅ SUDAH SELESAI MINGGU INI' : (isNodeLocked ? '🔒 WILAYAH TERKUNCI' : '⚔️ TANTANG WILAYAH INI <span class="kbd">Enter</span>')) : (isFun ? '🎉 MAINKAN MODE FUN <span class="kbd">Enter</span>' : '⚔️ TANTANG ARENA INI <span class="kbd">Enter</span>')}
        </button>
      </div>`;

      // Mode switchers
      $('#mode-toggle-bebas', el).onclick = () => { viewMode = 'bebas'; draw(); };
      $('#mode-toggle-cerita', el).onclick = async () => {
        viewMode = 'cerita';
        if (!campData && root.API?.getCampaign) {
          try { campData = await root.API.getCampaign(selSubjectId); } catch (_) {}
        }
        draw();
      };
      $('#mode-toggle-fun', el).onclick = () => { viewMode = 'fun'; draw(); };

      // Brutal toggle
      const bToggle = $('#brutal-toggle', el);
      if (bToggle) {
        bToggle.onchange = () => {
          if (bToggle.checked) {
            if (pLevel < 5) {
              bToggle.checked = false;
              brutalMode = false;
              if (root.Screens?.battle) root.Screens.battle.brutalEnabled = false;
              toast('Mode Brutal baru terbuka di Level 5! 🔒');
              return;
            }
            let pSettings = {};
            try {
              pSettings = typeof root.Player?.data?.settings_json === 'string' ? JSON.parse(root.Player.data.settings_json) : (root.Player?.data?.settings_json || {});
            } catch (e) {}

            const applyBrutalActive = () => {
              bToggle.checked = true;
              brutalMode = true;
              if (root.Screens?.battle) root.Screens.battle.brutalEnabled = true;
              pSettings.brutalAck = true;
              if (root.Player?.data) root.Player.data.settings_json = pSettings;
              if (root.API?.saveSettings) root.API.saveSettings({ brutalAck: true }).catch(() => {});
              toast('💀 Mode Brutal diaktifkan! Hadiah 3× lipat menanti.');
              draw();
            };

            if (!pSettings.brutalAck) {
              bToggle.checked = false;
              // Gunakan Desktop Modal yang 100% responsif & reliable
              Modal.open('💀 Tantangan Mode Brutal!', `
                <div class="tc" style="text-align:center;padding:0.5rem">
                  <div style="font-size:3.2rem;margin-bottom:8px">💀</div>
                  <h3 style="color:#ef4444;font-size:1.3rem;margin:0 0 10px 0;font-weight:800">Tantangan Mode Brutal!</h3>
                  <p style="font-size:0.92rem;line-height:1.5;color:var(--c-text);margin:0 0 20px 0">
                    Mode Brutal melipatgandakan efek <strong style="color:#ef4444">skill boss 2×</strong> lebih dahsyat, tetapi memberikan <strong style="color:#f59e0b">hadiah koin & XP 3×</strong> lipat jika kamu menang!<br><br>
                    Apakah kamu siap menghadapi tantangan mematikan ini?
                  </p>
                  <div style="display:flex;gap:12px;justify-content:center">
                    <button type="button" class="btn secondary lg" id="btn-desktop-brutal-cancel" style="flex:1;min-width:120px;font-weight:700">Batal</button>
                    <button type="button" class="btn danger lg" id="btn-desktop-brutal-accept" style="flex:1;min-width:140px;background:#dc2626;color:#fff;font-weight:800">Siap Laga! ⚔️</button>
                  </div>
                </div>
              `);
              setTimeout(() => {
                const bc = $('#btn-desktop-brutal-cancel');
                const ba = $('#btn-desktop-brutal-accept');
                if (bc) bc.onclick = () => { Modal.close(); };
                if (ba) ba.onclick = () => {
                  Modal.close();
                  applyBrutalActive();
                };
              }, 30);
              return;
            }
            applyBrutalActive();
          } else {
            brutalMode = false;
            if (root.Screens?.battle) root.Screens.battle.brutalEnabled = false;
            toast('Mode Brutal dinonaktifkan.');
            draw();
          }
        };
      }

      // Chapter tabs
      $$('.ch-tab-btn', el).forEach(btn => {
        btn.onclick = () => {
          curChapterIdx = parseInt(btn.dataset.ch, 10) || 0;
          const targetCh = chapters[curChapterIdx];
          if (targetCh && targetCh.nodes && targetCh.nodes.length) {
            selNodeKey = targetCh.nodes[0].key;
          }
          draw();
        };
      });

      // Subject select buttons (left panel)
      $$('.sub-select-btn', el).forEach(btn => {
        btn.onclick = async () => {
          selSubjectId = +btn.dataset.sub;
          selNodeKey = null;
          if (root.API?.getCampaign) {
            try { campData = await root.API.getCampaign(selSubjectId); } catch (_) {}
          }
          draw();
        };
      });

      // Subject card in bebas / fun mode
      $$('.subject-card', el).forEach(card => {
        card.onclick = async () => {
          const sid = parseInt(card.dataset.id, 10);
          if (root.Sfx) root.Sfx.play('select');
          if (root.Screens?.battle?.start) {
            if (viewMode === 'fun') {
              await root.Screens.battle.start(sid, { mode: 'FUN' });
            } else {
              await root.Screens.battle.start(sid, { mode: 'BATTLE', brutal: brutalMode });
            }
          } else {
            root.go('battle');
          }
        };
      });

      // Campaign nodes click
      $$('.campaign-node-btn', el).forEach(n => {
        n.onclick = async () => {
          const unlocked = n.dataset.unlocked === '1';
          const clearedThisWeek = n.dataset.clearedWeek === '1';
          const key = n.dataset.key;
          if (!unlocked) {
            toast('Selesaikan wilayah sebelumnya terlebih dahulu untuk membuka kunci! 🔒');
            if (root.Feedback) root.Feedback.sfx('wrong');
            return;
          }
          if (clearedThisWeek) {
            toast('Wilayah ini sudah selesai minggu ini! Reset berikutnya hari Senin pukul 07:00 WIB. 🗓️');
            if (root.Feedback) root.Feedback.sfx('wrong');
            return;
          }
          if (selNodeKey === key) {
            if (root.Sfx) root.Sfx.play('select');
            if (root.Screens?.battle?.start) {
              await root.Screens.battle.start(selSubjectId, { campaignNode: key, brutal: brutalMode });
            }
            return;
          }
          selNodeKey = key;
          draw();
        };
      });

      // Comic viewer button
      $$('.btn-view-comic', el).forEach(btn => {
        btn.onclick = () => {
          const theme = btn.dataset.theme || 'hutan';
          const comicPanels = root.StoryData?.STORY?.[theme]?.comic || [
            { panel: 1, title: 'Kisah Penakluk', text: 'Perjalanan panjang menuju puncak kejayaan...' }
          ];
          if (root.Screens?.showComicModal) {
            root.Screens.showComicModal(comicPanels, theme);
          } else {
            Modal.open('📖 Kisah Bab ' + esc(curCh.title), `
              <div class="tc" style="padding:1rem">
                <img src="/img/maps/map_${esc(theme)}.jpg" style="width:100%;max-height:200px;object-fit:cover;border-radius:12px;margin-bottom:12px">
                <h3 style="margin-bottom:8px">${esc(comicPanels[0].title || 'Kisah Wilayah')}</h3>
                <p class="muted" style="line-height:1.5">${esc(comicPanels[0].text || 'Selesaikan simpul petualangan untuk menaklukkan monster legendaris.')}</p>
                <button class="btn primary lg" data-close style="margin-top:12px">Tutup</button>
              </div>`);
          }
        };
      });

      // Start button
      const btnStart = $('#btn-start-node', el);
      if (btnStart) {
        btnStart.onclick = async () => {
          if (isCerita) {
            if (isNodeLocked) {
              toast('Selesaikan wilayah sebelumnya terlebih dahulu untuk membuka kunci! 🔒');
              return;
            }
            if (isNodeClearedWeek) {
              toast('Wilayah ini sudah selesai minggu ini! Reset berikutnya hari Senin pukul 07:00 WIB. 🗓️');
              return;
            }
          }
          if (root.Sfx) root.Sfx.play('select');
          if (root.Screens?.battle?.start) {
            if (isFun) {
              await root.Screens.battle.start(selSubjectId, { mode: 'FUN' });
            } else if (isCerita) {
              await root.Screens.battle.start(selSubjectId, { campaignNode: curNode.key || selNodeKey, brutal: brutalMode });
            } else {
              await root.Screens.battle.start(selSubjectId, { mode: 'BATTLE', brutal: brutalMode });
            }
          } else {
            root.go('battle');
          }
        };
      }

      Keys.set({
        Enter: () => $('#btn-start-node', el)?.click(),
        Escape: () => root.go('home'),
        __noGlobal: true
      });
    };

    draw();
  };

  DesktopScreens.latihan = async el => {
    el.classList.add('g3n');
    let subjects = [];
    let selSubjectId = 1;
    let qCount = 10;

    try {
      if (root.API && typeof root.API.getSubjects === 'function') {
        subjects = await root.API.getSubjects(root.Player?.data?.classId || 1);
        if (subjects.length) selSubjectId = subjects[0].id;
      }
    } catch (_) {}

    if (!subjects.length) {
      subjects = [
        { id: 1, name: 'IPA Terpadu', icon: '🌿' },
        { id: 2, name: 'Matematika', icon: '📐' },
        { id: 3, name: 'Bahasa Indonesia', icon: '📖' }
      ];
    }

    const draw = () => {
      const curSub = subjects.find(s => s.id === selSubjectId) || subjects[0];
      el.innerHTML = `
      <div class="col">
        ${panel('1. Pilih Mata Pelajaran', `<div class="sub-list" style="display:flex;flex-direction:column;gap:.5rem;overflow-y:auto;flex:1;min-height:0;padding-right:4px;-webkit-overflow-scrolling:touch">
          ${subjects.map(s => `
            <button class="btn ${s.id === selSubjectId ? 'primary' : 'ghost'} sub-btn" data-sub="${s.id}" style="justify-content:flex-start;padding:.6rem .8rem">
              <span style="font-size:1.4rem;margin-right:.5rem">${s.icon || '📚'}</span>
              <b>${esc(s.name)}</b>
            </button>`).join('')}
        </div>`, 'fill')}
      </div>

      ${panel('2. Pengaturan Latihan Bebas', `
        <div style="padding:1rem;display:flex;flex-direction:column;gap:1.2rem">
          <div>
            <h4 style="margin:0 0 .5rem">Pilih Jumlah Soal</h4>
            <div style="display:flex;gap:.7rem">
              <button class="btn ${qCount === 5 ? 'primary' : 'ghost'} lg cnt-btn" data-cnt="5" style="flex:1">⚡ 5 Soal (Kilat)</button>
              <button class="btn ${qCount === 10 ? 'primary' : 'ghost'} lg cnt-btn" data-cnt="10" style="flex:1">🎯 10 Soal (Standar)</button>
              <button class="btn ${qCount === 15 ? 'primary' : 'ghost'} lg cnt-btn" data-cnt="15" style="flex:1">🏆 15 Soal (Maraton)</button>
            </div>
          </div>
          <div>
            <h4 style="margin:0 0 .5rem">Fokus Pemahaman</h4>
            <div style="display:flex;flex-wrap:wrap;gap:.4rem">
              <span class="chip" style="background:rgba(56,189,248,.18);color:var(--c-primary);font-weight:800;padding:.4rem .8rem;border-radius:99px">Bebas Stres & Waktu</span>
              <span class="chip" style="background:rgba(255,255,255,.07);font-weight:700;padding:.4rem .8rem;border-radius:99px">Tanpa Pengurangan Energi</span>
            </div>
          </div>
        </div>
      `, 'fill')}

      <div class="col">
        ${panel('Ringkasan Latihan', `
          <div class="tc" style="padding:1rem 0">
            <span style="font-size:3.5rem">📚</span>
            <h2 style="font-size:1.2rem;margin:.4rem 0">${esc(curSub.name)}</h2>
            <div class="muted" style="font-weight:700;font-size:.85rem">${qCount} Soal Latihan Bebas</div>
          </div>
          <div class="kv"><span>Pengurangan Energi</span><b>Gratis (0 ⚡)</b></div>
          <div class="kv"><span>Tujuan</span><b>Pemantapan materi</b></div>
          <div class="kv" style="border:0"><span>Skor SRS</span><b>Dicatat ke Laporan</b></div>
        `, 'fill')}
        <button class="btn primary lg block" id="btn-start-practice">🚀 MULAI LATIHAN SEKARANG <span class="kbd">Enter</span></button>
      </div>`;

      $$('.sub-btn', el).forEach(b => {
        b.onclick = () => { selSubjectId = +b.dataset.sub; draw(); };
      });
      $$('.cnt-btn', el).forEach(b => {
        b.onclick = () => { qCount = +b.dataset.cnt; draw(); };
      });
      $('#btn-start-practice', el).onclick = () => {
        if (root.Screens?.battle?.start) {
          root.Screens.battle.start(selSubjectId, { mode: 'PRACTICE', count: qCount });
        } else {
          root.go('battle');
        }
      };
      Keys.set({
        Enter: () => $('#btn-start-practice', el)?.click(),
        Escape: () => root.go('home'),
        __noGlobal: true
      });
    };

    draw();
  };

  /* ---------- 5. PERTEMANAN & TANTANGAN DUEL ---------- */
  DesktopScreens.friends = async el => {
    el.classList.add('g3n');
    let friends = [];
    let invites = [];
    let searchDebounce = null;

    const loadData = async () => {
      if (!root.API || typeof root.API.req !== 'function') return;
      try {
        const [fRes, iRes] = await Promise.all([
          root.API.req('/api/friends').catch(() => ({ friends: [] })),
          root.API.req('/api/duels/invites').catch(() => ({ invites: [] }))
        ]);
        friends = fRes.friends || [];
        invites = iRes.invites || [];
        render();
      } catch (_) {}
    };

    const render = () => {
      el.innerHTML = `
      <div class="col">
        ${panel('Teman Saya (' + friends.length + ')', `
          <div class="friends-list" style="display:flex;flex-direction:column;gap:.5rem;overflow-y:auto;max-height:36rem">
            ${friends.length === 0 ? `<div class="muted tc" style="padding:2rem 0;font-weight:700">Belum ada teman. Cari kawan belajar di panel kanan!</div>` : ''}
            ${friends.map(f => {
              const avSvg = renderPlayerAvatar(f.avatar, 40);
              return `
              <div class="friend-card" style="display:flex;align-items:center;gap:.7rem;padding:.5rem .7rem;border-radius:var(--rad-m);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)">
                <div style="width:2.4rem;height:2.4rem;border-radius:999px;overflow:hidden;flex-shrink:0">${avSvg}</div>
                <div style="flex:1;min-width:0">
                  <div style="font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(f.name || f.nick)}</div>
                  <div class="muted" style="font-size:.7rem;font-weight:700">
                    <span class="dot ${f.online ? '' : 'off'}" style="display:inline-block;margin-right:3px"></span>
                    ${f.online ? (f.activity || 'Online') : 'Offline'} · Lv ${f.level || 1}
                  </div>
                </div>
                ${f.online ? `<button class="btn sm primary btn-duel-challenge" data-fid="${f.id}" title="Tantang Duel">⚔️</button>` : ''}
                <button class="btn sm ghost btn-friend-remove" data-fid="${f.id}" title="Hapus Teman">✕</button>
              </div>`;
            }).join('')}
          </div>
        `, 'fill')}
      </div>

      ${panel('Tantangan Duel & Undangan Masuk', `
        <div style="display:flex;flex-direction:column;gap:.7rem;padding:.5rem">
          <div style="font-weight:800;font-size:.9rem;color:var(--c-accent)">Undangan Masuk (${invites.length})</div>
          ${invites.length === 0 ? `<div class="muted" style="padding:1rem 0;font-weight:700">Tidak ada undangan duel yang menunggu respon.</div>` : ''}
          ${invites.map(inv => `
            <div class="invite-card" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.8rem 1rem;background:rgba(56,189,248,.1);border:1.5px solid var(--c-primary);border-radius:var(--rad-m)">
              <div>
                <b style="font-size:.95rem">${esc(inv.challengerNick || inv.challengerName || 'Teman')}</b>
                <div class="muted" style="font-size:.75rem;font-weight:700">Mata Pelajaran: ${esc(inv.subjectName || 'Umum')}</div>
              </div>
              <div style="display:flex;gap:.4rem">
                <button class="btn sm primary btn-accept-duel" data-did="${inv.id}">Terima ⚔️</button>
                <button class="btn sm ghost btn-decline-duel" data-did="${inv.id}">Tolak</button>
              </div>
            </div>`).join('')}

          <div style="border-top:1px solid rgba(255,255,255,.1);margin-top:1rem;padding-top:.8rem">
            <h4 style="margin:0 0 .5rem">Tantang Teman Belajar</h4>
            <div class="muted" style="font-size:.78rem;font-weight:700;line-height:1.4">
              Pilih teman online dari daftar sebelah kiri dan tekan ikon pedang ⚔️ untuk memulai duel 1v1 waktu nyata!
            </div>
          </div>
        </div>
      `, 'fill')}

      <div class="col">
        ${panel('Cari Teman Baru', `
          <div style="display:flex;gap:.4rem;margin-bottom:.8rem">
            <input type="text" id="friend-search-input" placeholder="Ketik nama panggilan teman..." style="flex:1;padding:.5rem;border-radius:var(--rad-s);background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.15);color:#fff">
          </div>
          <div id="friend-search-results" style="display:flex;flex-direction:column;gap:.4rem;min-height:8rem">
            <div class="muted tc" style="font-size:.8rem;font-weight:700;padding:1.5rem 0">Ketik nama untuk mencari kawan belajar.</div>
          </div>
        `, 'fill')}
      </div>`;

      const sIn = $('#friend-search-input', el);
      if (sIn) {
        sIn.oninput = () => {
          clearTimeout(searchDebounce);
          const q = sIn.value.trim();
          if (q.length < 2) {
            $('#friend-search-results', el).innerHTML = `<div class="muted tc" style="font-size:.8rem;font-weight:700;padding:1.5rem 0">Ketik minimal 2 huruf.</div>`;
            return;
          }
          searchDebounce = setTimeout(async () => {
            try {
              const res = await root.API.req(`/api/friends/search?q=${encodeURIComponent(q)}`);
              const results = res.players || res.results || [];
              const box = $('#friend-search-results', el);
              if (!box) return;
              if (results.length === 0) {
                box.innerHTML = `<div class="muted tc" style="font-size:.8rem;font-weight:700;padding:1.5rem 0">Tidak ada pemain dengan nama tersebut.</div>`;
                return;
              }
              box.innerHTML = results.map(p => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:.4rem .6rem;background:rgba(255,255,255,.05);border-radius:var(--rad-s)">
                  <div><b>${esc(p.name || p.nick)}</b><div class="muted" style="font-size:.68rem">Lv ${p.level || 1}</div></div>
                  <button class="btn sm primary btn-send-freq" data-nick="${esc(p.nick || p.name)}">➕ Tambah</button>
                </div>`).join('');

              $$('.btn-send-freq', box).forEach(b => {
                b.onclick = async () => {
                  try {
                    await root.API.req('/api/friends/request', { method: 'POST', body: JSON.stringify({ nick: b.dataset.nick }) });
                    toast(`Permintaan teman terkirim ke ${b.dataset.nick}!`);
                    b.disabled = true;
                    b.textContent = 'Terkirim';
                  } catch (e) { toast('Gagal kirim: ' + e.message); }
                };
              });
            } catch (_) {}
          }, 350);
        };
      }

      $$('.btn-duel-challenge', el).forEach(b => {
        b.onclick = async () => {
          try {
            await root.API.req('/api/duels/challenge', { method: 'POST', body: JSON.stringify({ friendId: +b.dataset.fid }) });
            toast('Tantangan duel terkirim!');
            loadData();
          } catch (e) { toast('Gagal menantang: ' + e.message); }
        };
      });

      $$('.btn-friend-remove', el).forEach(b => {
        b.onclick = async () => {
          if (!confirm('Hapus teman ini dari daftar pertemanan?')) return;
          try {
            await root.API.req(`/api/friends/${b.dataset.fid}`, { method: 'DELETE' });
            toast('Teman dihapus');
            loadData();
          } catch (e) { toast('Gagal hapus: ' + e.message); }
        };
      });

      $$('.btn-accept-duel', el).forEach(b => {
        b.onclick = async () => {
          try {
            await root.API.req(`/api/duels/${b.dataset.did}/respond`, { method: 'POST', body: JSON.stringify({ accept: true }) });
            root.go('duel', { duelId: b.dataset.did });
          } catch (e) { toast('Gagal terima duel: ' + e.message); }
        };
      });

      $$('.btn-decline-duel', el).forEach(b => {
        b.onclick = async () => {
          try {
            await root.API.req(`/api/duels/${b.dataset.did}/respond`, { method: 'POST', body: JSON.stringify({ accept: false }) });
            toast('Undangan ditolak');
            loadData();
          } catch (_) {}
        };
      });

      Keys.set({ Escape: () => root.go('home'), __noGlobal: true });
    };

    render();
    loadData();
  };

  /* ---------- 6. ARENA BATTLE (fokus, 1 layar penuh) ---------- */
  DesktopScreens.battle = async (el, p = {}) => {
    let s = root.Screens?.battle?.session || p.session || null;
    if (!s && root.API && typeof root.API.getActiveSession === 'function') {
      try {
        const act = await root.API.getActiveSession();
        if (act && act.session) {
          s = act.session;
          if (root.Screens && root.Screens.battle) root.Screens.battle.session = s;
        }
      } catch (_) {}
    }

    if (!s || s.status === 'WON' || s.status === 'LOST') {
      toast('Tidak ada sesi pertempuran aktif.');
      return root.go('peta');
    }

    const P = root.Player?.data || {};
    const pName = P.nick || P.name || 'Petualang';

    if (root.Screens?.battle?.startHeartbeat) {
      root.Screens.battle.startHeartbeat();
    }

    let isReadMode = false;
    let currentShield = (s.flags && typeof s.flags.shield === 'number') ? s.flags.shield : (s.shield || 0);
    let shieldActive = currentShield > 0;
    const eliminatedOptions = new Set();
    let isAnswering = false;
    let timerInterval = null;
    let nextTimeout = null;
    let currentTimer = 20;

    let orderingSelected = [];

    // Helper: Tampilkan Damage Floater di tengah layar (Maksimal di Desktop)
    const showDamageFloater = (text, type = 'dmg', delay = 0) => {
      const trigger = () => {
        let container = document.getElementById('center-floater-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'center-floater-container';
          container.className = 'center-floater-container';
          document.body.appendChild(container);
        }
        const floater = document.createElement('div');
        floater.className = `damage-floater ${type}`;
        floater.textContent = text;
        container.appendChild(floater);
        setTimeout(() => { if (floater) floater.classList.add('fade-out'); }, 1050);
        setTimeout(() => {
          if (floater && floater.parentNode) floater.remove();
          if (container && container.children.length === 0 && container.parentNode) container.remove();
        }, 1400);
      };
      if (delay > 0) setTimeout(trigger, delay);
      else trigger();
    };

    // Helper Boss Engine: Animasi Guncangan Bos
    const animateBossShake = (isHeavy = false) => {
      const box = $('#boss-svg-slot', el);
      if (box) {
        box.classList.remove('anim-shake', 'anim-shake-heavy');
        void box.offsetWidth;
        box.classList.add(isHeavy ? 'anim-shake-heavy' : 'anim-shake');
      }
    };

    // Helper Boss Engine: Animasi Tebasan Pedang
    const animateSwordSlash = () => {
      const bossSide = $('#boss-side', el);
      if (!bossSide) return;
      let slash = $('#boss-slash-effect', bossSide);
      if (!slash) {
        slash = document.createElement('div');
        slash.id = 'boss-slash-effect';
        slash.className = 'boss-slash-effect';
        bossSide.appendChild(slash);
      }
      slash.classList.remove('anim-slash');
      void slash.offsetWidth;
      slash.classList.add('anim-slash');
      slash.style.opacity = '1';
      setTimeout(() => {
        if (slash) {
          slash.style.opacity = '0';
          slash.classList.remove('anim-slash');
        }
      }, 600);
    };

    // Helper Boss Engine: Banner Fase 2 / Enraged Bos
    const showEnragedBanner = (bossName) => {
      const old = $('#enraged-banner-wrap');
      if (old) old.remove();

      const wrap = document.createElement('div');
      wrap.id = 'enraged-banner-wrap';
      wrap.className = 'enraged-banner-wrap';
      wrap.innerHTML = `
        <div class="enraged-banner">
          🔥 ${esc(bossName)} MARAH! 🔥
          <div style="font-size:0.85rem;font-weight:700;margin-top:4px">Waktu ×0.9 & Jurus Muncul Tiap 3 Soal! (+1 ⚡ Semangat!)</div>
        </div>
      `;
      document.body.appendChild(wrap);

      const svgSlot = $('#boss-svg-slot', el);
      if (svgSlot) svgSlot.classList.add('boss-enraged');
      const nameLabel = $('#boss-name-label', el);
      if (nameLabel && !nameLabel.textContent.includes('🔥')) {
        nameLabel.textContent += ' 🔥';
      }

      if (root.Feedback) root.Feedback.sfx('enraged');
      else if (root.Sfx) root.Sfx.play('hit');

      setTimeout(() => { if (wrap && wrap.parentNode) wrap.remove(); }, 1800);
    };

    // Helper Boss Engine: Modal Detail Jurus Bos
    const showBossSkillDetail = (skillId) => {
      const tier = (s.bossTier || s.boss?.tier || s.boss_tier || 'common').toLowerCase();
      const isBrutal = Boolean(s.brutal);
      const elemKey = s.bossElement || s.boss_element || (s.boss && s.boss.element) || (root.BossSkills && root.BossSkills.elementForTheme(s.subject?.monster_theme || s.monster?.theme));
      const monsterId = s.monster?.id || s.boss?.id || s.monster_id;
      const skills = s.boss?.skills || (root.BossSkills && elemKey && root.BossSkills.skillsFor(elemKey, tier, monsterId).map(sk => ({ ...root.BossSkills.describeSkill(sk, tier, isBrutal), textBrutal: root.BossSkills.describeSkill(sk, tier, true).text }))) || [];
      const sk = skills.find(x => x.id === skillId) || (root.BossSkills && root.BossSkills.SKILL_INDEX && root.BossSkills.SKILL_INDEX[skillId]);
      if (!sk) return;

      const old = $('#boss-skill-sheet-modal');
      if (old) old.remove();

      const sheet = document.createElement('div');
      sheet.id = 'boss-skill-sheet-modal';
      sheet.className = 'boss-skill-sheet-backdrop';
      sheet.setAttribute('data-testid', 'boss-skill-sheet');
      sheet.innerHTML = `
        <div class="boss-skill-sheet" onclick="event.stopPropagation()">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
            <div>
              <div style="font-size:0.75rem;font-weight:700;color:var(--c-primary,#10b981);text-transform:uppercase">Skill Boss</div>
              <h3 style="margin:2px 0 0;font-size:1.2rem;font-weight:800;display:flex;align-items:center;gap:6px">
                <span>${esc(sk.icon || '⚠️')}</span> <span>${esc(sk.name)}</span>
              </h3>
            </div>
            <button type="button" class="icon-btn small" id="btn-close-skill-sheet" style="font-size:1.1rem;width:34px;height:34px;border-radius:99px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:#fff;cursor:pointer">✕</button>
          </div>
          <p style="font-size:0.95rem;line-height:1.55;margin:12px 0 18px;color:#cbd5e1">
            ${esc(isBrutal ? (sk.textBrutal || sk.text) : sk.text)}
          </p>
          <button type="button" class="btn primary small" id="btn-close-skill-sheet-ok" style="width:100%;padding:10px;font-weight:800">Tutup</button>
        </div>
      `;
      document.body.appendChild(sheet);
      const close = () => { if (sheet && sheet.parentNode) sheet.remove(); };
      sheet.onclick = close;
      sheet.querySelector('#btn-close-skill-sheet').onclick = close;
      sheet.querySelector('#btn-close-skill-sheet-ok').onclick = close;
    };

    // Helper Boss Engine: Tampilkan Boss Fx Toasts
    const showBossFxEvents = (events) => {
      if (!events || !events.length || !root.BossSkills) return;
      let container = document.getElementById('boss-fx-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'boss-fx-toast-container';
        container.className = 'boss-fx-toast-container';
        document.body.appendChild(container);
      }
      events.slice(0, 3).forEach((ev, i) => {
        const desc = root.BossSkills.describeEvent(ev);
        if (!desc || !desc.text) return;
        const toastEl = document.createElement('div');
        toastEl.className = `boss-fx-toast toast-${desc.kind || 'info'}`;
        toastEl.setAttribute('data-testid', 'boss-fx-toast');
        toastEl.innerHTML = `<span aria-hidden="true">${desc.icon || '⚠️'}</span> <span>${esc(desc.text)}</span>`;
        container.appendChild(toastEl);
        setTimeout(() => {
          toastEl.style.opacity = '0';
          toastEl.style.transform = 'translateY(-8px)';
          setTimeout(() => { if (toastEl && toastEl.parentNode) toastEl.remove(); }, 250);
        }, 3000 + (i * 300));
      });
    };

    // Helper Tipe-Tipe Kejutan: Modal Kejutan (TREASURE, MERCHANT, TRAP)
    const showEventModal = (evt) => {
      if (!evt) return;
      stopTimer();

      // PASTIKAN pendingEvent PADA SEMUA TEMPAT STATE LANGSUNG DI-NULL-KAN
      // AGAR TIDAK TERPICU GANDA OLEH renderQuestion() ATAU TIMEOUT
      s.pendingEvent = null;
      if (s.flags) s.flags.pendingEvent = false;
      if (root.Screens?.battle?.session) {
        root.Screens.battle.session.pendingEvent = null;
        if (root.Screens.battle.session.flags) root.Screens.battle.session.flags.pendingEvent = false;
      }

      const old = $('#event-modal');
      if (old) {
        if (old._evtTimer) clearInterval(old._evtTimer);
        old.remove();
      }

      if (root.Feedback) root.Feedback.sfx('event');
      else if (root.Sfx) root.Sfx.play('coin');

      const modal = document.createElement('div');
      modal.id = 'event-modal';
      modal.setAttribute('data-testid', 'event-modal');
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease-out;';

      const playerCoins = (root.Player?.data?.coins) || 0;
      let icon = '🎁';
      let title = evt.title || 'Kejutan!';
      let desc = evt.description || 'Sesuatu yang menarik terjadi di tengah perjalanan!';
      let actionsHtml = '';

      if (evt.type === 'TREASURE') {
        icon = '🎁';
        title = 'Peti Harta Karun!';
        desc = 'Kamu menemukan sebuah peti harta karun misterius yang berkilau emas!';
        actionsHtml = `
          <button class="btn primary" id="btn-event-open" data-testid="btn-event-open" style="width:100%;font-size:1.1rem;padding:12px;font-weight:800">
            Buka Peti 🎁
          </button>
        `;
      } else if (evt.type === 'MERCHANT') {
        icon = '🧙';
        title = 'Pedagang Keliling';
        desc = `Seorang pedagang keliling menawarkan barang berharga! Koinmu: <strong>${playerCoins}</strong> 🪙`;
        const offers = evt.offers || [
          { id: 'heal20', price: 10, title: '+20 HP', desc: 'Pulihkan 20 HP' },
          { id: 'energy2', price: 15, title: '+2 ⚡ Semangat', desc: 'Tambah 2 Energi' }
        ];
        const offersHtml = offers.map(deal => {
          const canAfford = playerCoins >= deal.price;
          return `
            <button class="btn ${canAfford ? 'primary' : 'secondary'} btn-merchant-deal"
              data-deal-id="${deal.id}" data-testid="btn-deal-${deal.id}"
              ${canAfford ? '' : 'disabled style="opacity:0.6;cursor:not-allowed;"'}
              style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:10px 14px;font-size:0.95rem;font-weight:700">
              <span>${esc(deal.title)} <span style="font-size:0.8rem;opacity:0.8;display:block">${esc(deal.desc || '')}</span></span>
              <span style="font-weight:800">${deal.price} 🪙 ${canAfford ? '' : '(Koin kurang)'}</span>
            </button>
          `;
        }).join('');

        actionsHtml = `
          <div style="display:flex;flex-direction:column;gap:8px;width:100%">
            ${offersHtml}
            <button class="btn secondary" id="btn-event-skip" data-testid="btn-event-skip" style="width:100%;margin-top:4px">
              Tidak, terima kasih (Lewati) ➔
            </button>
          </div>
        `;
      } else if (evt.type === 'TRAP') {
        icon = '🪤';
        title = 'Peti Mencurigakan';
        desc = 'Sebuah peti kuno tergeletak di jalan. Berani membuka untuk hadiah, atau lewati demi keselamatan?';
        actionsHtml = `
          <div style="display:flex;flex-direction:column;gap:8px;width:100%">
            <button class="btn primary" id="btn-event-open" data-testid="btn-event-open" style="width:100%;padding:12px;font-weight:800">
              Buka Peti (Risiko Jebakan) 🪤
            </button>
            <button class="btn secondary" id="btn-event-skip" data-testid="btn-event-skip" style="width:100%">
              Lewati (Pilihan Aman) 🛡️
            </button>
          </div>
        `;
      }

      modal.innerHTML = `
        <div class="card" style="max-width:380px;width:100%;text-align:center;padding:24px 20px;border-radius:20px;background:#1e293b;border:2px solid rgba(255,255,255,0.15);box-shadow:0 20px 40px rgba(0,0,0,0.6)">
          <div style="font-size:3.5rem;line-height:1;margin-bottom:12px">${icon}</div>
          <h3 style="font-size:1.4rem;font-weight:800;color:#fff;margin-bottom:8px">${esc(title)}</h3>
          <p style="font-size:0.95rem;color:var(--c-muted,#94a3b8);line-height:1.4;margin-bottom:16px">${desc}</p>
          
          <div style="margin-bottom:16px;text-align:left">
            <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--c-muted,#94a3b8);margin-bottom:4px">
              <span>Waktu Keputusan</span>
              <span id="event-timer-text">8s</span>
            </div>
            <div style="height:6px;background:rgba(255,255,255,0.15);border-radius:3px;overflow:hidden">
              <div id="event-timer-bar" data-testid="event-timer-bar" style="width:100%;height:100%;background:var(--c-warning,#f59e0b);transition:width 0.1s linear"></div>
            </div>
          </div>

          <div id="event-actions-slot">
            ${actionsHtml}
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      const totalDuration = 8000;
      const startMs = Date.now();
      let isResolved = false;

      const evtTimerInterval = setInterval(() => {
        const elapsed = Date.now() - startMs;
        const remainingMs = Math.max(0, totalDuration - elapsed);
        const remainingPct = (remainingMs / totalDuration) * 100;
        const bar = $('#event-timer-bar');
        const txt = $('#event-timer-text');
        if (bar) bar.style.width = remainingPct + '%';
        if (txt) txt.textContent = Math.ceil(remainingMs / 1000) + 's';

        if (remainingMs <= 0 && !isResolved) {
          clearInterval(evtTimerInterval);
          resolveChoice(evt.safeChoice || 'SKIP', true);
        }
      }, 100);
      modal._evtTimer = evtTimerInterval;

      const handleModalKeys = (e) => {
        if (isResolved) return;
        if (e.key === 'Enter' || e.key === ' ') {
          const btn = $('#btn-event-open', modal) || $('.btn-merchant-deal:not([disabled])', modal);
          if (btn) {
            e.preventDefault();
            btn.click();
          }
        } else if (e.key === 'Escape') {
          const skipBtn = $('#btn-event-skip', modal);
          if (skipBtn) {
            e.preventDefault();
            skipBtn.click();
          }
        }
      };
      window.addEventListener('keydown', handleModalKeys);

      const resolveChoice = async (choice, isTimeout = false) => {
        if (isResolved) return;
        isResolved = true;
        clearInterval(evtTimerInterval);
        window.removeEventListener('keydown', handleModalKeys);

        $$('#event-modal button').forEach(b => b.disabled = true);

        try {
          let res = { ok: true };
          if (root.API && typeof root.API.resolveEvent === 'function') {
            res = await root.API.resolveEvent(s.id, evt.id, isTimeout ? 'TIMEOUT' : choice);
          }
          if (res.player) {
            if (root.Player) root.Player.data = Object.assign(root.Player.data || {}, res.player);
            const curPlayerHp = res.player.hp ?? 0;
            const curPlayerMax = res.player.maxHp ?? 100;
            s.playerHp = curPlayerHp;
            s.playerMaxHp = curPlayerMax;
            if ($('#player-hp-bar', el)) $('#player-hp-bar', el).style.width = `${(curPlayerHp / curPlayerMax) * 100}%`;
            if ($('#player-hp-val', el)) $('#player-hp-val', el).textContent = curPlayerHp;
          }
          if (res.coins !== undefined && root.Player?.data) {
            root.Player.data.coins = res.coins;
          }
          if (res.energy) {
            s.energy = res.energy.value;
          }

          const msg = (res.result && res.result.message) || (isTimeout ? 'Waktu habis! Pilihan aman diambil otomatis.' : 'Kejutan selesai!');
          toast(msg);
        } catch (err) {
          toast('Gagal menyelesaikan kejutan: ' + err.message);
        } finally {
          if (evtTimerInterval) clearInterval(evtTimerInterval);
          window.removeEventListener('keydown', handleModalKeys);
          const m = $('#event-modal');
          if (m) m.remove();
          // PASTIKAN isAnswering DAN pendingEvent SELALU DIBERSIHKAN AGAR TIDAK STUCK ATAU MUNCUL GANDA
          s.pendingEvent = null;
          if (s.flags) s.flags.pendingEvent = false;
          if (root.Screens?.battle?.session) {
            root.Screens.battle.session.pendingEvent = null;
            if (root.Screens.battle.session.flags) root.Screens.battle.session.flags.pendingEvent = false;
          }
          isAnswering = false;
          eliminatedOptions.clear();
          renderQuestion();
        }
      };

      const btnOpen = $('#btn-event-open', modal);
      if (btnOpen) btnOpen.onclick = () => resolveChoice('OPEN');

      const btnSkip = $('#btn-event-skip', modal);
      if (btnSkip) btnSkip.onclick = () => resolveChoice('SKIP');

      $$('.btn-merchant-deal', modal).forEach(b => {
        b.onclick = () => {
          const dealId = b.dataset.dealId;
          if (dealId) resolveChoice(dealId);
        };
      });
    };

    // Helper: Render Passive Buff Chips (Dinamis dengan sisa perisai real-time)
    const renderPassiveBuffChips = (passives, currentShieldVal = 0) => {
      if (!passives) return '';
      const chips = [];
      if (passives.startShield) {
        const shVal = (typeof currentShieldVal === 'number') ? currentShieldVal : (passives.startShield || 0);
        const isDepleted = shVal <= 0;
        chips.push(`<span class="battle-buff-chip chip info" id="active-shield-passive-chip" data-desc="Perisai Awal +${passives.startShield} (Tersisa: ${shVal})" style="cursor:pointer;font-size:0.75rem;padding:2px 8px;border-radius:99px;opacity:${isDepleted ? '0.45' : '1'};background:rgba(56,189,248,0.2);color:#38bdf8;border:1px solid rgba(56,189,248,0.5)">🛡️ Perisai: <b id="passive-shield-val">${shVal}</b></span>`);
      }
      if (passives.critChance) {
        chips.push(`<span class="battle-buff-chip chip accent" data-desc="Peluang Kritis +${Math.round(passives.critChance * 100)}% (Damage 1.5×)" style="cursor:pointer;font-size:0.75rem;padding:2px 8px;border-radius:99px">⚡ Crit +${Math.round(passives.critChance * 100)}%</span>`);
      }
      if (passives.dodgeRate) {
        chips.push(`<span class="battle-buff-chip" data-desc="Peluang Hindaran +${Math.round(passives.dodgeRate * 100)}% (0 Damage)" style="cursor:pointer;font-size:0.75rem;padding:2px 8px;border-radius:99px;background:rgba(56,189,248,0.18);color:#38bdf8;border:1px solid rgba(56,189,248,0.4)">💨 Hindaran ${Math.round(passives.dodgeRate * 100)}%</span>`);
      }
      if (passives.damageReduction) {
        chips.push(`<span class="battle-buff-chip" data-desc="Reduksi Serangan Bos +${Math.round(passives.damageReduction * 100)}%" style="cursor:pointer;font-size:0.75rem;padding:2px 8px;border-radius:99px;background:rgba(148,163,184,0.18);color:#cbd5e1;border:1px solid rgba(148,163,184,0.4)">🛡️ Reduksi ${Math.round(passives.damageReduction * 100)}%</span>`);
      }
      if (passives.coinBonus) {
        chips.push(`<span class="battle-buff-chip" data-desc="Bonus Koin Emas +${Math.round(passives.coinBonus * 100)}%" style="cursor:pointer;font-size:0.75rem;padding:2px 8px;border-radius:99px;background:rgba(245,158,11,0.18);color:#fbbf24;border:1px solid rgba(245,158,11,0.4)">🪙 Koin +${Math.round(passives.coinBonus * 100)}%</span>`);
      }
      return chips.join('');
    };

    // Resolusi Skill Aktif (Loadout Dek Pertarungan Pemain)
    const getActiveSkillIds = () => {
      let ids = [];
      if (s && Array.isArray(s.skills) && s.skills.length > 0) {
        ids = s.skills.map(x => (typeof x === 'object' && x ? x.id : x));
      } else if (root.Screens?.battle?.skills && Array.isArray(root.Screens.battle.skills) && root.Screens.battle.skills.length > 0) {
        ids = root.Screens.battle.skills.map(x => (typeof x === 'object' && x ? x.id : x));
      } else if (s && Array.isArray(s.loadout) && s.loadout.length > 0) {
        ids = s.loadout.map(x => (typeof x === 'object' && x ? x.id : x));
      } else if (P && P.skills) {
        if (Array.isArray(P.skills.loadout) && P.skills.loadout.length > 0) {
          ids = P.skills.loadout;
        } else if (Array.isArray(P.skills) && P.skills.length > 0) {
          ids = P.skills.map(x => (typeof x === 'object' && x ? x.id : x));
        }
      }
      ids = (ids || []).filter(Boolean);
      if (!ids.length) {
        ids = ['eliminate_one', 'shield', 'power_strike', 'red_potion'];
      }
      return ids;
    };
    let activeSkillIds = getActiveSkillIds();

    const stopTimer = () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    };

    const startTimer = (limitSec) => {
      stopTimer();
      currentTimer = limitSec || 20;
      const bar = $('#desktop-timer-bar', el);
      const txt = $('#desktop-timer-txt', el);
      if (bar) bar.style.width = '100%';
      if (txt) txt.textContent = `${currentTimer}s`;

      const startMs = Date.now();
      const totalMs = currentTimer * 1000;

      timerInterval = setInterval(() => {
        const elapsed = Date.now() - startMs;
        const remainMs = Math.max(0, totalMs - elapsed);
        const remainSec = Math.ceil(remainMs / 1000);
        const pct = Math.max(0, (remainMs / totalMs) * 100);

        if (bar) {
          bar.style.width = `${pct}%`;
          if (pct < 25) bar.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
          else if (pct < 50) bar.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
          else bar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
        }
        if (txt) txt.textContent = `${remainSec}s`;

        if (remainMs <= 0) {
          stopTimer();
          handleAnswer(-1); // Timeout
        }
      }, 100);
    };

    const triggerSkill = async (skIdx) => {
      if (isAnswering || document.getElementById('event-modal')) return;
      activeSkillIds = getActiveSkillIds();
      const skillId = activeSkillIds[skIdx];
      if (!skillId) return;

      const skDef = SKILLS_LIST.find(x => x.id === skillId) || { id: skillId, name: skillId, cost: 1 };
      const curEn = typeof s.energy === 'object' ? s.energy.value : (s.energy ?? 0);
      if (curEn < (skDef.cost || 1)) {
        toast('Energi tidak cukup untuk menggunakan skill ini!');
        return;
      }

      if (skillId === 'shield' && shieldActive) {
        toast('Perisai masih aktif!');
        return;
      }

      try {
        let res = null;
        if (root.API && typeof root.API.useSkill === 'function') {
          res = await root.API.useSkill(s.id, skillId);
        } else {
          res = { ok: true, skillId };
        }

        if (res.session) {
          s = res.session;
          if (root.Screens?.battle) root.Screens.battle.session = s;
        }

        if (skillId === 'eliminate_one') {
          const qOpts = s.currentQuestion?.options || [];
          const correctIdx = s.currentQuestion?.answerIndex ?? 0;
          const candidates = [];
          qOpts.forEach((_, i) => {
            if (i !== correctIdx && !eliminatedOptions.has(i)) candidates.push(i);
          });
          if (candidates.length > 0) {
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            eliminatedOptions.add(pick);
            toast('🎯 1 Pilihan salah berhasil dicoret!');
            showDamageFloater('🎯 CORET SALAH!', 'crit');
          }
        } else if (skillId === 'eagle_eye') {
          toast('🦅 Mata Elang aktif! Opsi berkedip.');
          showDamageFloater('🦅 MATA ELANG!', 'crit');
        } else if (skillId === 'shield') {
          shieldActive = true;
          currentShield = (res.session?.flags?.shield) || (currentShield + 20);
          toast('🛡️ Perisai aktif melindungi dari serangan!');
          showDamageFloater('🛡️ PERISAI AKTIF!', 'heal');
          renderQuestion();
          return;
        } else if (skillId === 'heal') {
          s.playerHp = Math.min(s.playerMaxHp || 100, (s.playerHp || 80) + 25);
          toast('💖 Memulihkan 25 HP!');
          showDamageFloater('+25 HP 💖', 'heal');
        } else if (skillId === 'power_strike') {
          toast('⚔️ Tebasan Super siap melipatgandakan damage!');
          showDamageFloater('⚔️ TEBASAN SUPER!', 'power_strike');
        } else if (skillId === 'red_potion') {
          toast('🍷 Ramuan Merah aktif! Soal diganti ke termudah & Damage Super!');
          showDamageFloater('🍷 RAMUAN MERAH!', 'red_potion');
          if (res.session) {
            s = res.session;
            renderQuestion();
          }
        }
      } catch (e) {
        toast('Gagal menggunakan skill: ' + e.message);
      }
      toast(`✨ ${skDef.name} Digunakan!`);
      renderQuestion();
    };

    const handleAnswer = async (chosenAnswer) => {
      if (isAnswering || document.getElementById('event-modal')) return;
      isAnswering = true;
      stopTimer();

      $$('.opt, .short-in, #short-ok, .order-item-btn, .btn-confirm-order', el).forEach(b => b.disabled = true);

      try {
        let res = null;
        if (root.API && typeof root.API.answerQuestion === 'function') {
          res = await root.API.answerQuestion(s.id, s.currentIndex, chosenAnswer);
        } else {
          res = { ok: true, isCorrect: true, finished: true, session: s };
        }

        const isCorrect = res.isCorrect;
        const outcome = res.outcome || (isCorrect ? 'NORMAL' : 'WRONG');
        const correctIdx = res.reveal?.correctDisplayIndex ?? res.correctDisplayIndex;

        // Visual feedback highlight pada opsi
        if (correctIdx !== undefined) {
          $$('.opt', el).forEach(btn => {
            const bIdx = parseInt(btn.dataset.i, 10);
            if (bIdx === correctIdx) btn.classList.add('correct');
            else if (bIdx === chosenAnswer) btn.classList.add('wrong');
          });
        }

        // 1. DAMAGE FLOATERS & SOUND EFFECTS (Sama 1:1 dengan Mobile)
        const dmg = res.damageToBoss || 25;
        if (isCorrect) {
          animateBossShake(Boolean(res.isCrit || res.skillEffects?.powerStrike?.active || res.skillEffects?.redPotion?.active));
          if (res.skillEffects?.powerStrike?.active || res.skillEffects?.redPotion?.active) {
            animateSwordSlash();
          }

          if (res.isCrit || res.crit) {
            showDamageFloater(`⚡ KRITIKAL! -${dmg}`, 'crit');
            if (root.Feedback) root.Feedback.sfx('critical');
            else if (root.Sfx) root.Sfx.play('level-up');
          } else if (res.weakHit || res.isWeak) {
            showDamageFloater(`🎯 TITIK LEMAH! -${dmg}`, 'crit');
            if (root.Feedback) root.Feedback.sfx('critical');
            else if (root.Sfx) root.Sfx.play('hit');
          } else if (res.skillEffects?.powerStrike?.active) {
            showDamageFloater(`⚔️ TEBASAN SUPER! -${dmg}`, 'power_strike');
            if (root.Feedback) root.Feedback.sfx('critical');
            else if (root.Sfx) root.Sfx.play('level-up');
          } else if (res.skillEffects?.redPotion?.active) {
            showDamageFloater(`🍷 RAMUAN MERAH! -${dmg}`, 'red_potion');
            if (root.Feedback) root.Feedback.sfx('critical');
            else if (root.Sfx) root.Sfx.play('level-up');
          } else if (outcome === 'SLOW') {
            showDamageFloater(`🐢 LAMBAT! -${dmg}`, 'dmg');
            if (root.Feedback) root.Feedback.sfx('correct');
            else if (root.Sfx) root.Sfx.play('hit');
          } else {
            showDamageFloater(`🎯 TEPAT! -${dmg}`, 'dmg');
            if (root.Feedback) root.Feedback.sfx('correct');
            else if (root.Sfx) root.Sfx.play('hit');
          }
        } else {
          if (res.dodged) {
            showDamageFloater('💨 HINDARAN! 0 DMG', 'heal');
            toast('Refleks hebat! Kamu berhasil menghindari serangan! 💨');
            if (root.Feedback) root.Feedback.sfx('correct');
          } else {
            // Evaluasi penyerapan perisai dan pengurangan darah
            const oldShield = currentShield;
            const newShield = (res.shield !== undefined) ? res.shield : (res.session?.flags?.shield ?? 0);
            const shieldAbsorbed = Math.max(0, oldShield - newShield);
            currentShield = newShield;
            shieldActive = currentShield > 0;

            const dmgToPlayer = (res.damageToPlayer !== undefined) ? res.damageToPlayer : ((res.playerDamage !== undefined) ? res.playerDamage : 0);

            if (res.dodged) {
              showDamageFloater('💨 HINDARAN! 0 DMG', 'heal');
              toast('Refleks hebat! Kamu berhasil menghindari serangan! 💨');
              if (root.Feedback) root.Feedback.sfx('correct');
            } else {
              let delayFloater = 0;
              if (shieldAbsorbed > 0) {
                showDamageFloater(`🛡️ PERISAI MENYERAP! -${shieldAbsorbed}`, 'heal');
                delayFloater = 380;
                if (newShield <= 0 && oldShield > 0) {
                  showDamageFloater('🛡️ PERISAI PECAH! 💥', 'miss', delayFloater);
                  delayFloater += 380;
                }
              }

              if (dmgToPlayer > 0) {
                const failTxt = (outcome === 'TIMEOUT') ? `⏰ WAKTU HABIS! -${dmgToPlayer} HP` : `❌ SALAH! -${dmgToPlayer} HP`;
                showDamageFloater(failTxt, 'miss', delayFloater);
                if (root.Feedback) root.Feedback.sfx('wrong');
                else if (root.Sfx) root.Sfx.play('error');
              } else if (shieldAbsorbed === 0) {
                const failTxt = (outcome === 'TIMEOUT') ? '⏰ WAKTU HABIS!' : '❌ SALAH!';
                showDamageFloater(failTxt, 'miss');
                if (root.Feedback) root.Feedback.sfx('wrong');
                else if (root.Sfx) root.Sfx.play('error');
              }
            }
          }
        }

        // Floater Hadiah Koin, Mystery & Tipe Kejutan Soal
        let nextNotifDelay = 350;
        if (res.drops?.coins > 0) {
          showDamageFloater(`+${res.drops.coins} 🪙`, 'crit', nextNotifDelay);
          nextNotifDelay += 350;
        }
        if (res.isMystery && res.mysteryReward) {
          if (res.mysteryReward === 'COINS_8') {
            showDamageFloater('+8 🪙', 'crit', nextNotifDelay);
          } else if (res.mysteryReward === 'HEAL_15') {
            showDamageFloater('+15 HP 💖', 'heal', nextNotifDelay);
          } else if (res.mysteryReward === 'ENERGY_1') {
            showDamageFloater('+1 Energi ⚡', 'heal', nextNotifDelay);
          } else if (res.mysteryReward === 'DAMAGE_1_5') {
            showDamageFloater('1.5× Damage 💥', 'crit', nextNotifDelay);
          } else {
            showDamageFloater(`🎁 ${res.mysteryReward}`, 'crit', nextNotifDelay);
          }
          nextNotifDelay += 350;
        } else if (res.mysteryReward) {
          showDamageFloater(`🎁 ${res.mysteryReward}`, 'crit', nextNotifDelay);
          nextNotifDelay += 350;
        }

        // Floater Skin Passives yang Terpicu
        const trig = Array.isArray(res.triggeredPassives) ? [...res.triggeredPassives] : [];
        if (trig.length === 0) {
          if (res.notice && res.notice.includes('Semburan Naga')) trig.push({ id: 'dragon', name: 'Semburan Naga!', icon: '🔥' });
          if (res.notice && res.notice.includes('Curi Energi')) trig.push({ id: 'comboEnergy', name: 'Curi Energi!', icon: '🦊' });
          if (res.notice && res.notice.includes('Proteksi Combo')) trig.push({ id: 'streakProtect', name: 'Proteksi Combo!', icon: '🦉' });
          if (res.notice && res.notice.includes('Darah Terakhir')) trig.push({ id: 'lastStand', name: 'Darah Terakhir!', icon: '🩸' });
        }
        if (trig.length > 0) {
          trig.forEach(tp => {
            if (tp.id === 'comboCount' || tp.id === 'comboDamage') {
              showDamageFloater('👑 Raja Combo!', 'crit', nextNotifDelay);
            } else if (tp.id === 'comboDamageBonus') {
              showDamageFloater('💥 Combo Strike!', 'crit', nextNotifDelay);
            } else if (tp.id === 'dragon') {
              showDamageFloater('🔥 Semburan Naga!', 'crit', nextNotifDelay);
            } else if (tp.id === 'healCorrect' || tp.id === 'comboRegen') {
              showDamageFloater('💖 REGEN!', 'heal', nextNotifDelay);
            } else if (tp.id === 'comboEnergy') {
              showDamageFloater('⚡ +1 ENERGI!', 'energy', nextNotifDelay);
            } else if (tp.id === 'streakProtect') {
              showDamageFloater('🦉 Proteksi Combo!', 'crit', nextNotifDelay);
            } else if (tp.id === 'lastStand') {
              showDamageFloater('🩸 Darah Terakhir!', 'crit', nextNotifDelay);
            } else if (tp.id === 'damageReduction') {
              showDamageFloater('🛡️ Zirah Baja!', 'heal', nextNotifDelay);
            } else if (tp.id === 'kirinMiracle') {
              showDamageFloater('🦄✨ MUKJIZAT KIRIN!', 'heal', nextNotifDelay);
            } else if (tp.id === 'thunderGryphon') {
              showDamageFloater('⚡ SAMBARAN PETIR!', 'crit', nextNotifDelay);
            } else if (tp.id === 'seaLeviathan') {
              showDamageFloater('🌊 TSUNAMI KRAKEN!', 'crit', nextNotifDelay);
            } else if (tp.id === 'frostWolf') {
              showDamageFloater('❄️ TAMENG ES FENRIR!', 'heal', nextNotifDelay);
            } else if (tp.id === 'shadowTiger') {
              showDamageFloater('🐅 TERKAMAN HARIMAU!', 'crit', nextNotifDelay);
            } else if (tp.id === 'lifesteal') {
              showDamageFloater('🐊 LIFESTEAL!', 'heal', nextNotifDelay);
            } else if (tp.id === 'stun') {
              showDamageFloater('🪼 BOS STUN!', 'crit', nextNotifDelay);
            } else if (tp.id === 'reflect') {
              showDamageFloater('🦔 DURI PEMBALAS!', 'crit', nextNotifDelay);
            } else if (tp.id === 'poison') {
              showDamageFloater('🐍 RACUN KOBRA!', 'crit', nextNotifDelay);
            } else if (tp.id === 'goldBonus') {
              showDamageFloater('🐹 +5 KOIN!', 'energy', nextNotifDelay);
            } else if (tp.id === 'stealGold') {
              showDamageFloater('🦝 COPET KOIN!', 'energy', nextNotifDelay);
            } else {
              showDamageFloater(`${tp.icon || '✨'} ${tp.name || 'Pasif Aktif'}!`, 'crit', nextNotifDelay);
            }
            nextNotifDelay += 350;
          });
        }

        // Combo sound effect
        if ((res.session?.streak === 3 || res.session?.streak === 5 || res.session?.streak === 10) && root.Feedback) {
          root.Feedback.sfx('combo');
        }

        // Boss Engine: Cek Fase 2 / Enraged Bos
        const bossName = s.monster?.name || s.boss?.name || 'Bos';
        if (res.phaseChanged && (res.boss?.phase === 2 || res.session?.bossPhase === 2)) {
          showEnragedBanner(bossName);
        }

        // Boss Fx Events
        if (res.bossFx && Array.isArray(res.bossFx.events) && res.bossFx.events.length > 0) {
          showBossFxEvents(res.bossFx.events);
        }

        // Update session state
        if (res.session) {
          s = res.session;
          if (root.Screens?.battle) root.Screens.battle.session = s;
        }

        // Update Bar Darah Bos & Player Real-time
        const curBossHp = res.bossHp ?? res.boss?.hp ?? s.bossHp ?? s.boss?.hp ?? 0;
        const curBossMax = s.bossMaxHp ?? s.boss?.maxHp ?? 100;
        const bossBarEl = $('#boss-side .bar-fill, #boss-side .bar i', el);
        if (bossBarEl) bossBarEl.style.width = `${Math.max(0, Math.min(100, (curBossHp / curBossMax) * 100))}%`;
        const bossBarTxt = $('#boss-side .bar .t', el);
        if (bossBarTxt) bossBarTxt.textContent = `${curBossHp} / ${curBossMax}`;

        // Update status perisai real-time dari respon jawaban
        if (res.shield !== undefined) {
          currentShield = res.shield;
        } else if (s.flags?.shield !== undefined) {
          currentShield = s.flags.shield;
        }
        shieldActive = currentShield > 0;

        const curPlayerHp = (res.playerHp !== undefined) ? res.playerHp : (res.session?.playerHp ?? s.playerHp ?? 0);
        const curPlayerMax = s.playerMaxHp ?? 100;
        const playerBarEl = $('#me-side .bar-fill, #me-side .bar i', el);
        if (playerBarEl) playerBarEl.style.width = `${Math.max(0, Math.min(100, (curPlayerHp / curPlayerMax) * 100))}%`;
        const playerBarTxt = $('#me-side .bar .t', el);
        if (playerBarTxt) playerBarTxt.textContent = `${curPlayerHp} / ${curPlayerMax}`;

        // Update indikator perisai di HUD & avatar real-time
        const shieldValEl = $('#desktop-shield-val', el);
        if (shieldValEl) shieldValEl.textContent = currentShield;
        const shieldChipEl = $('#desktop-shield-chip', el);
        if (shieldChipEl) shieldChipEl.style.display = shieldActive ? 'inline-flex' : 'none';

        const avatarShieldVal = $('#avatar-shield-val', el);
        if (avatarShieldVal) avatarShieldVal.textContent = currentShield;
        const avatarAura = $('#user-shield-aura', el);
        if (avatarAura) avatarAura.style.display = shieldActive ? 'block' : 'none';

        const shieldBarRow = $('#player-shield-bar-row', el);
        if (shieldBarRow) {
          shieldBarRow.style.display = shieldActive ? 'block' : 'none';
          const shieldBarFill = $('#player-shield-bar-fill', el);
          const shieldBarTxt = $('#player-shield-bar-txt', el);
          const maxShieldBase = Math.max(currentShield, s.passives?.startShield || 60, 20);
          if (shieldBarFill) shieldBarFill.style.width = `${Math.min(100, (currentShield / maxShieldBase) * 100)}%`;
          if (shieldBarTxt) shieldBarTxt.textContent = `🛡️ Perisai ${currentShield}`;
        }

        const passiveShieldVal = $('#passive-shield-val', el);
        if (passiveShieldVal) passiveShieldVal.textContent = currentShield;
        const passiveShieldChip = $('#active-shield-passive-chip', el);
        if (passiveShieldChip) {
          if (currentShield <= 0) {
            passiveShieldChip.style.opacity = '0.45';
            passiveShieldChip.innerHTML = '🛡️ Perisai: 0 (Habis)';
          } else {
            passiveShieldChip.style.opacity = '1';
            passiveShieldChip.innerHTML = `🛡️ Perisai: <b id="passive-shield-val">${currentShield}</b>`;
          }
        }

        // 2. FEEDBACK BOX / PEMBAHASAN SOAL (#fb-slot)
        const isWin = s.status === 'WON';
        const isLost = s.status === 'LOST';
        const isOver = isWin || isLost || res.finished;

        const fbTitle = isCorrect
          ? (res.isCrit ? 'Luar biasa! Serangan Kritikal!' : (outcome === 'SLOW' ? 'Benar, tapi agak lambat! Terkena balasan!' : 'Bagus sekali! Tepat sasaran!'))
          : (outcome === 'TIMEOUT' ? (res.dodged ? 'Waktu habis! Berhasil menghindar! 💨' : 'Waktu habis! Bos menyerangmu!') : (res.dodged ? 'Kurang tepat! Tapi berhasil menghindar! 💨' : 'Kurang tepat! Bos menyerangmu!'));

        const fbSlot = $('#fb-slot', el);
        if (fbSlot) {
          fbSlot.innerHTML = `
            <div class="feedback-card ${isCorrect ? 'ok' : 'no'}" style="margin-top:12px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.08);border:1.5px solid ${isCorrect ? '#22c55e' : '#ef4444'};display:flex;align-items:center;gap:12px;cursor:pointer;animation:fadeIn .2s ease" title="Klik untuk lanjut ke soal berikutnya">
              <span style="font-size:1.6rem">${isCorrect ? '⭐' : '💔'}</span>
              <div style="flex:1;min-width:0;word-break:break-word">
                <strong style="color:#fff;font-size:0.95rem">${esc(res.notice || fbTitle)}</strong>
                ${res.explanation ? `<div style="font-size:.82rem;color:var(--c-muted);margin-top:3px;line-height:1.4">${esc(res.explanation)}</div>` : ''}
              </div>
              <span class="chip" style="font-size:0.75rem;padding:4px 8px;background:rgba(255,255,255,0.12);font-weight:700">Lanjut ➔</span>
            </div>
          `;
          fbSlot.onclick = () => {
            if (nextTimeout) clearTimeout(nextTimeout);
            advance();
          };
        }

        const advance = () => {
          if (nextTimeout) clearTimeout(nextTimeout);
          if (isOver) {
            stopTimer();
            if (root.Screens?.battle?.stopHeartbeat) root.Screens.battle.stopHeartbeat();
            root.go('result', { session: s, result: res });
          } else if (res.event) {
            // PENTING: RESET isAnswering & pendingEvent SEBELUM MEMUNCULKAN EVENT AGAR TIDAK STUCK / MUNCUL GANDA
            isAnswering = false;
            eliminatedOptions.clear();
            s.pendingEvent = null;
            if (s.flags) s.flags.pendingEvent = false;
            if (root.Screens?.battle?.session) {
              root.Screens.battle.session.pendingEvent = null;
              if (root.Screens.battle.session.flags) root.Screens.battle.session.flags.pendingEvent = false;
            }
            showEventModal(res.event);
          } else {
            isAnswering = false;
            eliminatedOptions.clear();
            renderQuestion();
          }
        };

        nextTimeout = setTimeout(advance, isOver ? 1400 : 1800);

      } catch (e) {
        toast('Gagal memproses jawaban: ' + e.message);
        isAnswering = false;
        $$('.opt, .short-in, #short-ok', el).forEach(b => {
          b.disabled = false;
          b.style.pointerEvents = 'auto';
        });
      }
    };

    const renderQuestion = () => {
      stopTimer();
      if (nextTimeout) clearTimeout(nextTimeout);
      // SELALU RESET isAnswering SETIAP KALI ME-RENDER SOAL
      isAnswering = false;
      activeSkillIds = getActiveSkillIds();
      currentShield = (s.flags && typeof s.flags.shield === 'number') ? s.flags.shield : (s.shield || 0);
      shieldActive = currentShield > 0;

      // Cek apakah ada kejutan yang tertunda (Pending Event)
      if (s.pendingEvent) {
        const pe = s.pendingEvent;
        s.pendingEvent = null;
        if (s.flags) s.flags.pendingEvent = false;
        if (root.Screens?.battle?.session) {
          root.Screens.battle.session.pendingEvent = null;
          if (root.Screens.battle.session.flags) root.Screens.battle.session.flags.pendingEvent = false;
        }
        showEventModal(pe);
        return;
      }

      const qIdx = s.currentIndex ?? 0;
      const totalQ = s.totalQuestions || 10;
      const Q = s.currentQuestion || QBANK[0] || {};
      const qText = Q.text || Q.question || 'Pertanyaan';
      const qType = (Q.type || Q.questionType || 'MCQ').toUpperCase();
      const qOpts = Q.options || ['A', 'B', 'C', 'D'];
      const isShort = (qType === 'SHORT');

      const bossObj = s.monster || (root.Monsters && root.Monsters.MONSTERS && (root.Monsters.MONSTERS.find(m => m.id === s.monster_id) || root.Monsters.MONSTERS[2])) || { id: 3, name: 'Jamurgon', tier: 'rare' };
      const bossName = bossObj.name || s.boss?.name || 'Monster Penjaga';
      const bossHp = s.bossHp ?? s.boss?.hp ?? 280;
      const bossMaxHp = s.bossMaxHp ?? s.boss?.maxHp ?? 350;
      const playerHp = s.playerHp ?? 85;
      const playerMaxHp = s.playerMaxHp ?? 100;
      let curEn = typeof s.energy === 'object' ? s.energy.value : (s.energy ?? 3);
      const playerCombo = s.streak ?? s.combo ?? 0;

      // Boss Tier & Hits Left
      const tier = (s.bossTier || s.boss?.tier || s.boss_tier || bossObj.tier || 'common').toLowerCase();
      const tierInfo = (root.Progression?.BOSS_TIERS?.[tier]) || { id: tier, label: tier.toUpperCase(), icon: '⚪', color: '#9aa5b1' };
      const hitsLeft = s.hitsLeft ?? s.boss?.hitsLeft ?? Math.ceil(bossHp / 20);
      const isBrutal = Boolean(s.brutal);
      const isPhase2 = (s.boss_phase === 2 || s.bossPhase === 2 || (res => res?.phase === 2));

      // Boss Element & Skills (Engine Boss)
      const elemKey = s.bossElement || s.boss_element || (s.boss && s.boss.element) || (root.BossSkills && root.BossSkills.elementForTheme(s.subject?.monster_theme || bossObj.theme));
      const elementInfo = elemKey && root.BossSkills?.ELEMENTS?.[elemKey];
      const monsterId = bossObj.id || s.monster_id;
      const bossSkills = s.boss?.skills || (root.BossSkills && elemKey && root.BossSkills.skillsFor(elemKey, tier, monsterId).map(sk => root.BossSkills.describeSkill(sk, tier, isBrutal))) || [];

      const bossSvg = renderMonsterArt(bossObj, 220, { animated: true });
      const avatarSvg = renderPlayerAvatar(P.avatar, 180);

      currentTimer = Q.timeLimitSec || s.time_limit_sec || 20;

      // 3. BOSS TELEGRAPH ALERT
      const tg = (Q && Q.bossFx && Q.bossFx.telegraph) || (s && s.bossFx && s.bossFx.telegraph);
      let tgText = '';
      if (tg && root.BossSkills) {
        const desc = root.BossSkills.describeEvent(tg);
        tgText = desc?.text || 'Bos sedang menyiapkan jurus berbahaya!';
      }
      if (Q && Q.bossFx && Q.bossFx.timeMult && Q.bossFx.timeMult < 1) {
        const pct = Math.round((1 - Q.bossFx.timeMult) * 100);
        toast(`⏳ Waktu soal ini berkurang −${pct}%!`);
      }

      // 4. BOSS INTRO OVERLAY (Muncul hanya sekali di awal sesi pertempuran)
      let introHtml = '';
      if (!root.Screens?.battle?._introShown?.[s.id]) {
        if (!root.Screens) root.Screens = {};
        if (!root.Screens.battle) root.Screens.battle = {};
        if (!root.Screens.battle._introShown) root.Screens.battle._introShown = {};
        root.Screens.battle._introShown[s.id] = true;
        // Gunakan ukuran 140px presisi agar tidak meluber atau menutupi nama bos
        const introBossSvg = renderMonsterArt(bossObj, 140, { animated: true });
        introHtml = `
          <div class="boss-intro-overlay" id="boss-intro" data-testid="boss-intro">
            <div class="boss-intro-card" style="border-color:${tierInfo.color || '#38bdf8'}">
              <div class="chip" style="background:${tierInfo.color || '#38bdf8'};color:#fff;font-weight:800;font-size:0.75rem;margin-bottom:12px">${tierInfo.icon || '⚪'} ${tierInfo.label || tier.toUpperCase()}</div>
              <div class="boss-intro-stage">
                ${introBossSvg}
              </div>
              <h2>${esc(bossName)}</h2>
              <div class="muted" style="font-size:0.85rem;font-weight:700;margin-bottom:8px">${esc(bossObj.theme || 'Arena')} · Lv ${bossObj.tier === 'legend' ? 10 : (bossObj.tier === 'epic' ? 8 : 5)}</div>
              <div class="chip warning" style="font-size:0.8rem;font-weight:800;padding:6px 14px;border-radius:99px;margin-bottom:16px">🎯 Kelemahan: ${esc(String(s.weakTopic || s.boss?.weakTopic || 'Soal Penantang').replace(/🎯/g, '').trim())}</div>
              <button class="btn primary lg block" id="btn-intro-dismiss" style="font-weight:800;width:100%">⚔️ MULAI BERTARUNG</button>
            </div>
          </div>
        `;
      }

      el.className = 'd-screen battle-screen battle' + (isReadMode ? ' read' : '');
      el.innerHTML = `
        ${introHtml}
        <div class="panel hud">
          <button class="btn sm" id="btn-abandon-desktop" title="Menyerah">✕ <span class="kbd">Esc</span></button>
          <span class="pill">⚡ ${curEn}/5</span>
          <b>Soal ${qIdx + 1}/${totalQ}</b>
          <div class="timer">
            <span>⏱️</span>
            <div class="timer-bar"><i id="desktop-timer-bar" style="width:100%"></i></div>
            <b id="desktop-timer-txt">${currentTimer}s</b>
          </div>
          <span class="combo">🔥 Kombo ${playerCombo}×</span>
          <span class="chip shield-chip" id="desktop-shield-chip" style="font-size:0.75rem;padding:2px 8px;font-weight:800;background:rgba(56,189,248,0.2);color:#38bdf8;border:1px solid #38bdf8;display:${shieldActive ? 'inline-flex' : 'none'};align-items:center;gap:4px">🛡️ PERISAI <span id="desktop-shield-val">${currentShield}</span></span>
          <div class="sp"></div>
          <button class="btn sm ghost" id="b-focus" title="Mode Fokus Baca">📖 <span class="kbd">F</span></button>
        </div>

        <div class="panel fighter" id="boss-side" style="position:relative">
          <div class="fig ${isPhase2 ? 'boss-enraged' : ''}" id="boss-svg-slot">${bossSvg}</div>
          <h2 id="boss-name-label">${esc(bossName)} ${isPhase2 ? '🔥' : ''}</h2>
          
          <!-- Element & Tier Badges (Engine Boss) -->
          <div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;margin:4px 0">
            <span class="chip tier-badge boss-tier-badge tier-${tier}" id="boss-tier-badge" style="background:${tierInfo.color};color:#fff;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:12px">${tierInfo.icon} ${tierInfo.label}</span>
            ${elementInfo ? `<span class="chip boss-element-badge" id="boss-element-badge" style="background:${elementInfo.color}22;color:${elementInfo.color};border:1px solid ${elementInfo.color};font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:12px">${elementInfo.icon} ${elementInfo.name}</span>` : ''}
            ${isBrutal ? `<span class="chip brutal-badge" id="brutal-badge" style="font-size:0.7rem;font-weight:800;background:#dc2626;color:#fff;padding:2px 8px;border-radius:12px">💀 BRUTAL</span>` : ''}
          </div>

          ${bar((bossHp / bossMaxHp) * 100, 'boss tall', `${bossHp} / ${bossMaxHp}`)}
          
          <div class="boss-hits-left" id="boss-hits-left" style="font-size:0.75rem;font-weight:700;color:${tierInfo.color};margin-top:2px;text-align:center">
            Sisa maks. <span id="boss-hits-left-val">${hitsLeft}</span> jawaban benar
          </div>

          <!-- Boss Skills Chips (Engine Boss) -->
          ${bossSkills.length > 0 ? `
            <div class="boss-skill-chips" id="boss-skill-chips" data-testid="boss-skill-chips" style="display:flex;gap:6px;justify-content:center;margin:6px 0;flex-wrap:wrap">
              ${bossSkills.map(sk => `
                <button type="button" class="boss-skill-chip-btn btn sm secondary" data-skid="${esc(sk.id)}" style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;font-size:0.75rem;border-radius:99px" title="${esc(sk.name)}">
                  <span>${esc(sk.icon || '⚠️')}</span> <span>${esc(sk.name)}</span>
                </button>
              `).join('')}
            </div>
          ` : ''}

          <!-- Notifikasi Status Bos (Fatigue / Pity / Active Skill) -->
          <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;justify-content:center">
            <span class="chip danger fatigue-banner" id="boss-fatigue-banner" data-testid="boss-fatigue-banner" style="display:${(s.fatigue_applied || s.fatigueApplied) ? 'inline-flex' : 'none'};font-size:0.72rem;font-weight:700">Boss mulai kelelahan! 😮‍💨</span>
            <span class="chip warning pity-badge" id="pity-badge" data-testid="pity-badge" style="display:${(s.pity || s.wrongStreak >= 3) ? 'inline-flex' : 'none'};font-size:0.72rem;font-weight:700">💪 Serangan Balik</span>
            <span class="chip accent boss-active-skill-chip" id="boss-active-skill-chip" style="display:none;font-size:0.72rem;font-weight:800">⚔️ Tebasan Super Aktif!</span>
          </div>

          
        </div>

        <div class="qwrap">
          <!-- Boss Telegraph Alert Banner -->
          <div class="boss-telegraph" id="boss-telegraph" data-testid="boss-telegraph" aria-live="assertive" style="display:${tgText ? 'flex' : 'none'};background:rgba(239,68,68,0.18);border:1.5px solid #ef4444;border-radius:12px;padding:8px 12px;align-items:center;gap:8px;margin-bottom:8px">
            <span class="boss-telegraph-icon" style="font-size:1.2rem">⚠️</span>
            <span class="boss-telegraph-text" id="boss-telegraph-text" style="font-size:0.85rem;font-weight:700;color:#fca5a5">${esc(tgText)}</span>
          </div>

          <div class="panel qcard">
            <div class="qtag" style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:8px">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                <span style="font-size:0.78rem;color:var(--c-muted);font-weight:700">${esc(s.subject?.name || 'Pertarungan')}</span>
                <span class="chip info" style="font-size:0.7rem;font-weight:700;padding:2px 8px">${isShort ? 'JAWABAN SINGKAT' : (qType === 'TRUE_FALSE' ? 'BENAR / SALAH' : (qType === 'ORDERING' ? 'URUTKAN' : 'PILIHAN GANDA'))}</span>
                ${(Q.isWeak || Q.is_weak) ? '<span class="chip danger" style="font-size:0.7rem;font-weight:800;background:#ef4444;color:#fff;padding:2px 8px;border-radius:99px">🎯 TITIK LEMAH</span>' : ''}
                ${(Q.isBonus || Q.is_bonus) ? '<span class="chip warning" style="font-size:0.7rem;font-weight:800;background:#f59e0b;color:#fff;padding:2px 8px;border-radius:99px">⭐ BONUS</span>' : ''}
                ${(Q.isMystery || Q.is_mystery) ? '<span class="chip" style="font-size:0.7rem;font-weight:800;background:#8b5cf6;color:#fff;padding:2px 8px;border-radius:99px">❓ MISTERI</span>' : ''}
              </div>
              <button class="btn sm" id="b-tts">🔊 Baca <span class="kbd">Spasi</span></button>
            </div>
            <div class="qtext">${esc(qText)}</div>
          </div>

          <div class="q-interactive-slot">
            ${qType === 'MCQ' ? `
              <div class="options">
                ${qOpts.map((o, i) => `
                  <button class="opt ${eliminatedOptions.has(i) ? 'struck' : ''}" data-i="${i}" ${eliminatedOptions.has(i) ? 'disabled style="text-decoration:line-through;opacity:0.35"' : ''}>
                    <span class="key">${'ABCD'[i] || (i+1)}</span>
                    ${esc(typeof o === 'object' ? o.text : o)}
                  </button>
                `).join('')}
              </div>
            ` : (qType === 'TRUE_FALSE' ? `
              <div class="options" style="grid-template-columns:1fr 1fr;gap:1rem">
                <button class="opt btn-tf" data-i="0" style="padding:1.4rem;font-size:1.1rem;font-weight:800;background:rgba(34,197,94,0.15);border:2px solid #22c55e">
                  <span class="key">A</span> ✅ BENAR
                </button>
                <button class="opt btn-tf" data-i="1" style="padding:1.4rem;font-size:1.1rem;font-weight:800;background:rgba(239,68,68,0.15);border:2px solid #ef4444">
                  <span class="key">B</span> ❌ SALAH
                </button>
              </div>
            ` : (qType === 'SHORT' ? `
              <div class="col" style="gap:.6rem">
                <input class="short-in" id="short" placeholder="Ketik jawabanmu lalu Enter…" autocomplete="off" style="padding:.9rem 1rem;font-size:1.1rem;background:rgba(0,0,0,0.5);border:2px solid var(--c-primary);border-radius:var(--rad-s);color:#fff">
                <button class="btn primary lg" id="short-ok">Kirim Jawaban <span class="kbd">Enter</span></button>
              </div>
            ` : (qType === 'ORDERING' ? `
              <div class="ordering-container" style="display:flex;flex-direction:column;gap:8px">
                <div class="muted" style="font-size:0.85rem">Klik opsi untuk menyusun urutan yang tepat:</div>
                <div id="order-sequence-box" style="min-height:42px;padding:6px 10px;background:rgba(0,0,0,0.3);border:1px dashed rgba(255,255,255,0.2);border-radius:8px;display:flex;gap:6px;flex-wrap:wrap;align-items:center"></div>
                <div class="options" style="grid-template-columns:1fr 1fr;gap:8px;margin-top:6px">
                  ${qOpts.map((o, idx) => `
                    <button class="btn secondary order-item-btn" data-idx="${idx}" style="justify-content:flex-start;text-align:left;padding:8px 12px">
                      ${esc(typeof o === 'object' ? o.text : o)}
                    </button>
                  `).join('')}
                </div>
                <button class="btn primary btn-confirm-order" style="margin-top:8px;font-weight:700">Konfirmasi Urutan</button>
              </div>
            ` : `
              <div class="options">
                ${qOpts.map((o, i) => `<button class="opt" data-i="${i}"><span class="key">${'ABCD'[i] || (i+1)}</span>${esc(typeof o === 'object' ? o.text : o)}</button>`).join('')}
              </div>
            `)))}
          </div>

          <!-- Answer Feedback Slot / Pembahasan Soal (#fb-slot) -->
          <div id="fb-slot"></div>
        </div>

        <div class="panel fighter" id="me-side">
          <div class="fig" style="position:relative">
            ${avatarSvg}
            <div class="user-shield-aura" id="user-shield-aura" style="display:${shieldActive ? 'block' : 'none'}">
              <div class="user-shield-badge">🛡️ <span id="avatar-shield-val">${currentShield}</span></div>
            </div>
          </div>
          <h2>${esc(pName)}</h2>
          <div class="meta">Level ${P.level || 1} · ${esc(P.title || 'Murid')}</div>
          ${bar((playerHp / playerMaxHp) * 100, 'player tall', `${playerHp} / ${playerMaxHp}`)}

          <!-- Active Shield Bar (Indikator Perisai Tampil Dinamis) -->
          <div id="player-shield-bar-row" style="width:100%;display:${shieldActive ? 'block' : 'none'};margin-top:4px">
            <div class="bar shield tall" style="background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.4)">
              <i id="player-shield-bar-fill" style="width:${Math.min(100, (currentShield / Math.max(currentShield, s.passives?.startShield || 60, 20)) * 100)}%;background:linear-gradient(90deg, #0284c7, #38bdf8);box-shadow:0 0 8px rgba(56,189,248,0.6)"></i>
              <span class="t" id="player-shield-bar-txt">🛡️ Perisai ${currentShield}</span>
            </div>
          </div>

          <!-- Passive Buff Chips Pemain -->
          <div class="player-passives-bar" id="player-passives-bar" style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin:4px 0">
            ${renderPassiveBuffChips(s.passives || P.passives, currentShield)}
          </div>

          <div class="energy-row" style="margin:.4rem 0">
            ${Array.from({ length: 5 }, (_, i) => `<i class="${i < curEn ? 'on' : ''}"></i>`).join('')}
          </div>
          <!-- DEK SKILL PETUALANG (VERTIKAL BERBARIS KE BAWAH DENGAN DETAIL EFFECT JELAS) -->
          <div class="skills-deck user-skills-vertical" style="display:flex;flex-direction:column;gap:7px;width:100%;margin-top:8px">
            ${activeSkillIds.map((skId, idx) => {
              const skDef = SKILLS_LIST.find(s => s.id === skId) || { id: skId, name: skId, cost: 1, desc: '' };
              const key = ['Q', 'W', 'E', 'R'][idx] || (idx + 1);
              const cost = skDef.cost || 1;
              const isDis = curEn < cost || (skId === 'shield' && shieldActive);
              const isShieldOn = (skId === 'shield' && shieldActive);
              return `
                <button class="skill-btn skill-card-horizontal" data-sk="${idx}" title="${esc(skDef.name)} (${key}) - Biaya ${cost}⚡" ${isDis ? 'disabled' : ''}>
                  <div class="skill-btn-icon-wrap">
                    <span class="kbd">${key}</span>
                    <div style="width:36px;height:36px;display:flex;align-items:center;justify-content:center">${renderSkillArt(skDef.id, 1, 36, { animated: false })}</div>
                  </div>
                  <div class="skill-btn-body" style="text-align:left">
                    <div class="skill-btn-header" style="display:flex;justify-content:space-between;align-items:center">
                      <span class="skill-btn-title" style="font-size:0.88rem;font-weight:800;color:#fff">${esc(skDef.name)}</span>
                      <span class="cost-badge" style="font-size:0.72rem;font-weight:800;padding:1px 7px;border-radius:99px;background:rgba(250,204,21,0.2);color:#fde047;border:1px solid rgba(250,204,21,0.4)">⚡ ${cost}</span>
                    </div>
                    <div class="skill-btn-desc" style="font-size:0.75rem;color:#cbd5e1;line-height:1.35;margin-top:2px">
                      ${isShieldOn ? '<span style="color:#38bdf8;font-weight:800">🛡️ Perisai Aktif Melindungi</span>' : esc(skDef.desc || 'Taktik Petualang')}
                    </div>
                  </div>
                </button>`;
            }).join('')}
          </div>
        </div>`;

      // PASTIKAN SEMUA TOMBOL JAWABAN AKTIF DAN BISA DI-KLIK
      $$('.opt, .short-in, #short-ok, .order-item-btn, .btn-confirm-order', el).forEach(b => {
        b.disabled = false;
        b.style.pointerEvents = 'auto';
      });

      // Event listener: Intro overlay dismiss
      const introEl = $('#boss-intro', el);
      if (introEl) {
        const dismissIntro = () => {
          introEl.style.opacity = '0';
          setTimeout(() => { if (introEl && introEl.parentNode) introEl.remove(); }, 200);
        };
        introEl.onclick = dismissIntro;
        $('#btn-intro-dismiss', introEl)?.addEventListener('click', (e) => {
          e.stopPropagation();
          dismissIntro();
        });
        setTimeout(dismissIntro, 3200);
      }

      // Event listener: Boss skill chips click to view details
      $$('.boss-skill-chip-btn', el).forEach(btn => {
        btn.onclick = () => {
          const skid = btn.dataset.skid;
          if (skid) showBossSkillDetail(skid);
        };
      });

      // Event listener: Passive buff chip click tooltip
      $$('.battle-buff-chip', el).forEach(chip => {
        chip.onclick = () => {
          toast(`✨ [Pasif Skin] ${chip.dataset.desc || chip.textContent}`);
        };
      });

      startTimer(currentTimer);

      $('#b-focus', el).onclick = () => {
        isReadMode = !isReadMode;
        renderQuestion();
      };

      $('#b-tts', el).onclick = () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(qText);
          u.lang = 'id-ID';
          window.speechSynthesis.speak(u);
        } else {
          toast('TTS tidak didukung pada browser ini.');
        }
      };

      $('#btn-abandon-desktop', el).onclick = () => {
        Modal.open(`
          <div style="padding:16px 20px;text-align:center">
            <h3 style="font-size:1.25rem;font-weight:800;color:#ef4444;margin-bottom:8px">Menyerah dari Pertempuran?</h3>
            <p style="margin-bottom:1.2rem;line-height:1.5">Apakah kamu yakin ingin meninggalkan pertempuran ini? Kemajuan soal saat ini akan disimpan.</p>
            <div style="display:flex;gap:10px;justify-content:center">
              <button class="btn danger" id="btn-confirm-abandon">Ya, Menyerah</button>
              <button class="btn secondary" data-close>Batal</button>
            </div>
          </div>
        `);
        $('#btn-confirm-abandon')?.addEventListener('click', async () => {
          Modal.close();
          if (root.API && typeof root.API.abandonSession === 'function') {
            try { await root.API.abandonSession(s.id); } catch (_) {}
          }
          if (root.Screens?.battle?.stopHeartbeat) root.Screens.battle.stopHeartbeat();
          root.go('peta');
        });
      };

      $$('.skill-btn', el).forEach(btn => {
        btn.onclick = () => {
          const skIdx = parseInt(btn.dataset.sk, 10);
          triggerSkill(skIdx);
        };
      });

      $$('.opt', el).forEach(b => {
        b.onclick = () => {
          if (!eliminatedOptions.has(+b.dataset.i)) {
            handleAnswer(+b.dataset.i);
          }
        };
      });

      const shortOk = $('#short-ok', el);
      if (shortOk) {
        shortOk.onclick = () => handleAnswer($('#short', el)?.value.trim());
      }
      const shortInput = $('#short', el);
      if (shortInput) {
        shortInput.focus();
        shortInput.onkeydown = e => {
          if (e.key === 'Enter') handleAnswer(shortInput.value.trim());
        };
      }

      orderingSelected = [];
      const orderBox = $('#order-sequence-box', el);
      $$('.order-item-btn', el).forEach(obtn => {
        obtn.onclick = () => {
          const oIdx = parseInt(obtn.dataset.idx, 10);
          if (!orderingSelected.includes(oIdx)) {
            orderingSelected.push(oIdx);
            obtn.disabled = true;
            obtn.style.opacity = '0.4';
            const chip = document.createElement('span');
            chip.className = 'chip primary';
            chip.textContent = `${orderingSelected.length}. ${obtn.textContent.trim()}`;
            orderBox?.appendChild(chip);
          }
        };
      });
      const confirmOrderBtn = $('.btn-confirm-order', el);
      if (confirmOrderBtn) {
        confirmOrderBtn.onclick = () => {
          if (orderingSelected.length === 0) {
            toast('Pilih urutan jawaban terlebih dahulu!');
            return;
          }
          handleAnswer(orderingSelected);
        };
      }

      const L = i => () => $$('.opt', el)[i]?.click();
      Keys.set({
        Escape: () => $('#btn-abandon-desktop', el)?.click(),
        a: L(0), b: L(1), c: L(2), d: L(3),
        1: L(0), 2: L(1), 3: L(2), 4: L(3),
        q: () => triggerSkill(0),
        Q: () => triggerSkill(0),
        w: () => triggerSkill(1),
        W: () => triggerSkill(1),
        e: () => triggerSkill(2),
        E: () => triggerSkill(2),
        r: () => triggerSkill(3),
        R: () => triggerSkill(3),
        f: () => $('#b-focus', el)?.click(),
        ' ': () => $('#b-tts', el)?.click(),
        __noGlobal: true
      });
    };

    renderQuestion();
  };

  DesktopScreens.result = (el, p = {}) => {
    el.classList.add('result');
    const res = p.result || {};
    const sess = p.session || {};
    const ok = p.ok ?? res.correctAnswers ?? sess.correctCount ?? 0;
    const tot = p.total ?? res.totalQuestions ?? sess.totalQuestions ?? 10;
    const acc = tot > 0 ? Math.round((ok / tot) * 100) : 0;
    const isWon = (sess.status === 'WON') || (res.won !== undefined ? Boolean(res.won) : (acc >= 60));

    const stars = sess.stars !== undefined ? sess.stars : (res.starsEarned ?? (isWon ? (acc >= 90 ? 3 : (acc >= 70 ? 2 : 1)) : 0));
    const starsStr = stars > 0 ? '⭐'.repeat(stars) : '☆☆☆';
    const xpWon = res.xpEarned ?? sess.xpEarned ?? p.xp ?? (isWon ? 120 : 30);
    const coinWon = res.coinsEarned ?? sess.coinsEarned ?? p.coins ?? (isWon ? 35 : 10);
    const maxCombo = res.maxStreak ?? sess.maxStreak ?? (p.combo || (isWon ? 5 : 2));

    const bossObj = sess.monster || p.session?.monster || (root.Monsters && root.Monsters.MONSTERS && root.Monsters.MONSTERS[2]) || { id: 3, name: 'Jamurgon' };
    const bossSvg = renderMonsterArt(bossObj, 220);

    el.innerHTML = `
    <div class="result-card">
      <div class="col" style="align-items:center;justify-content:center;text-align:center">
        <div style="font-size:1rem;font-weight:900;letter-spacing:.2em;color:${isWon ? '#fde68a' : '#f87171'}">
          ${isWon ? 'KEMENANGAN TELAK!' : 'PANTANG MENYERAH!'}
        </div>
        <div style="height:15rem;aspect-ratio:1;opacity:.85;filter:saturate(${isWon ? '.7' : '.3'});display:flex;align-items:center;justify-content:center">${bossSvg}</div>
        <div style="font-size:1.7rem;font-weight:900">
          ${isWon ? `"${esc(bossObj.name)} Tumbang!"` : 'Tetap Semangat & Coba Lagi!'}
        </div>
        <div class="stars">${starsStr}</div>
        <div class="muted" style="font-weight:800">${stars > 0 ? `${stars} BINTANG DIRAIH · ` : ''}Akurasi ${acc}%</div>
      </div>
      <div class="col">
        ${panel('Ringkasan pertarungan', `<div class="kv"><span>Jawaban benar</span><b>${ok} dari ${tot} soal</b></div>
            <div class="kv"><span>Akurasi</span><b>${acc}%</b></div>
            <div class="kv"><span>Kombo terbesar</span><b>${maxCombo}× beruntun 🔥</b></div>`)}
        ${panel('Hadiah diperoleh', `<div class="kv"><span>XP</span><b>+${xpWon} 🌟</b></div>
            ${bar(Math.min(100, acc), 'xp lg', isWon ? 'Kemenangan Sempurna' : 'Pengalaman Bertambah')}
            <div class="kv"><span>Koin emas</span><b>+${coinWon} 🪙</b></div>
            <div class="kv"><span>Status Pertempuran</span><b>${isWon ? '🏆 Selesai' : '🛡️ Butuh Latihan'}</b></div>`, 'fill')}
        <button class="btn primary lg block" data-go="peta">▶️ LANJUTKAN PERJALANAN <span class="kbd">Enter</span></button>
        <button class="btn lg ghost block" data-go="home">🏠 KEMBALI KE BERANDA <span class="kbd">Esc</span></button>
      </div>
    </div>`;

    if (root.DesktopShell?.updateTopbar) root.DesktopShell.updateTopbar();
    Keys.set({ Enter: () => root.go('peta'), Escape: () => root.go('home'), __noGlobal: true });
  };

  /* ---------- 8. LEMARI KOSTUM & AVATAR (Cockpit 3-Pane Sesuai Pola Monsterdex) ---------- */
  DesktopScreens.wardrobe = async el => {
    el.className = 'd-screen wardrobe-screen wardrobe-cockpit';
    const P = root.Player?.data || {};
    let cat = 'ALL';
    let ownerFilter = 'all'; // 'all' | 'equipped' | 'owned' | 'unowned'
    let rarityFilter = 'ALL';
    let searchQuery = '';
    let selId = null;
    let inv = null;
    let itemsList = [];
    let draftAvatar = JSON.parse(JSON.stringify(P.avatar || {}));

    try {
      if (root.API && typeof root.API.getInventory === 'function') {
        inv = await root.API.getInventory();
        if (inv) {
          itemsList = inv.items || [];
          if (inv.avatar && Object.keys(inv.avatar).length > 0) {
            draftAvatar = Object.assign({}, inv.avatar, draftAvatar);
          }
        }
      }
    } catch (_) {}

    if (!itemsList.length && root.ITEMS) {
      itemsList = root.ITEMS;
    }

    const CATS_MOBILE = [
      ['ALL', '🎒', 'Semua'],
      ['hat', '🧢', 'Topi'],
      ['outfit', '👕', 'Pakaian'],
      ['weapon', '⚔️', 'Senjata'],
      ['pet', '🐾', 'Hewan'],
      ['bg', '🌄', 'Latar'],
      ['frame', '🖼️', 'Bingkai'],
      ['title', '🎖️', 'Gelar'],
      ['permanent', '💎', 'Upgrade']
    ];

    const calcPassives = (av) => {
      const eqIds = ['hat', 'outfit', 'weapon', 'pet', 'bg', 'frame', 'title']
        .map(sl => av[sl])
        .filter(Boolean);
      if (root.Passives?.calculatePassives) return root.Passives.calculatePassives(eqIds, itemsList);
      if (window.Passives?.calculatePassives) return window.Passives.calculatePassives(eqIds, itemsList);
      return { dodgeRate: 0, startShield: 0, critChance: 0, bonusTime: 0, activeSets: [] };
    };

    const draw = () => {
      const avatarSvg = renderPlayerAvatar(draftAvatar, 120);
      const curP = calcPassives(draftAvatar);

      // Filtering items
      let filtered = itemsList;
      if (cat !== 'ALL') {
        filtered = filtered.filter(it => it.slot === cat);
      }
      if (ownerFilter === 'owned') {
        filtered = filtered.filter(it => it.owned);
      } else if (ownerFilter === 'unowned') {
        filtered = filtered.filter(it => !it.owned);
      } else if (ownerFilter === 'equipped') {
        filtered = filtered.filter(it => draftAvatar[it.slot] === it.id);
      }
      if (rarityFilter !== 'ALL') {
        filtered = filtered.filter(it => (it.rarity || 'COMMON').toUpperCase() === rarityFilter);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(it => (it.name || '').toLowerCase().includes(q) || (it.passive?.desc || '').toLowerCase().includes(q) || (it.lore || '').toLowerCase().includes(q));
      }

      // Base category counts
      const catCounts = {};
      CATS_MOBILE.forEach(c => {
        catCounts[c[0]] = c[0] === 'ALL' ? itemsList.length : itemsList.filter(x => x.slot === c[0]).length;
      });

      // Base items in category for rarity counting
      let baseCat = itemsList;
      if (cat !== 'ALL') baseCat = baseCat.filter(it => it.slot === cat);
      if (ownerFilter === 'owned') baseCat = baseCat.filter(it => it.owned);
      else if (ownerFilter === 'unowned') baseCat = baseCat.filter(it => !it.owned);
      else if (ownerFilter === 'equipped') baseCat = baseCat.filter(it => draftAvatar[it.slot] === it.id);

      const countAll = baseCat.length;
      const countCommon = baseCat.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'COMMON').length;
      const countRare = baseCat.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'RARE').length;
      const countEpic = baseCat.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'EPIC').length;
      const countLeg = baseCat.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'LEGENDARY').length;
      const countMyt = baseCat.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'MYTHIC').length;

      const totalOwned = itemsList.filter(it => it.owned).length;
      const totalUnowned = itemsList.filter(it => !it.owned).length;
      const totalEquipped = Object.values(draftAvatar).filter(Boolean).length;

      const it = filtered.find(x => x.id === selId) || filtered[0] || itemsList[0] || { id: 'hat_explorer', name: 'Topi Penjelajah', rarity: 'COMMON', slot: 'hat' };
      selId = it.id;
      const isEquipped = Boolean(draftAvatar[it.slot] === it.id);
      const isOwned = Boolean(it.owned);
      const curCatObj = CATS_MOBILE.find(c => c[0] === it.slot) || ['item', '🎒', it.slot || 'Perlengkapan'];
      const curRarKey = (it.rarity || 'common').toLowerCase();
      const curRarColor = curRarKey === 'legendary' ? '#f59e0b' : (curRarKey === 'epic' ? '#a855f7' : (curRarKey === 'rare' ? '#3b82f6' : '#94a3b8'));

      const eqSlots = [
        { sl: 'hat', icon: '🧢', name: 'Topi', id: draftAvatar.hat },
        { sl: 'outfit', icon: '👕', name: 'Baju', id: draftAvatar.outfit },
        { sl: 'weapon', icon: '⚔️', name: 'Senjata', id: draftAvatar.weapon },
        { sl: 'pet', icon: '🐾', name: 'Pet', id: draftAvatar.pet },
        { sl: 'bg', icon: '🌄', name: 'Latar', id: draftAvatar.bg },
        { sl: 'frame', icon: '🖼️', name: 'Bingkai', id: draftAvatar.frame }
      ];

      // Build stats badges for left column
      const statChips = [];
      if (curP.dodgeRate > 0) statChips.push(`<div class="hero-stat-card"><div style="font-size:.65rem;color:#94a3b8">Hindaran</div><b style="color:#34d399">💨 ${Math.round(curP.dodgeRate * 100)}%</b></div>`);
      if (curP.startShield > 0) statChips.push(`<div class="hero-stat-card"><div style="font-size:.65rem;color:#94a3b8">Perisai Awal</div><b style="color:#38bdf8">🛡️ +${curP.startShield}</b></div>`);
      if (curP.critChance > 0) statChips.push(`<div class="hero-stat-card"><div style="font-size:.65rem;color:#94a3b8">Kritis</div><b style="color:#facc15">⚡ ${Math.round(curP.critChance * 100)}%</b></div>`);
      if (curP.bonusTime > 0) statChips.push(`<div class="hero-stat-card"><div style="font-size:.65rem;color:#94a3b8">Waktu Soal</div><b style="color:#a78bfa">⏳ +${curP.bonusTime}s</b></div>`);
      if (curP.correctDamageBonus > 0) statChips.push(`<div class="hero-stat-card"><div style="font-size:.65rem;color:#94a3b8">Serangan+</div><b style="color:#f87171">⚔️ +${curP.correctDamageBonus}</b></div>`);
      if (curP.coinBonus > 0) statChips.push(`<div class="hero-stat-card"><div style="font-size:.65rem;color:#94a3b8">Bonus Koin</div><b style="color:#fbbf24">🪙 +${Math.round(curP.coinBonus * 100)}%</b></div>`);

      el.innerHTML = `
      <!-- PANE 1: STATISTIK AVATAR & FILTER KOLEKSI (KIRI) -->
      <div class="col" style="grid-column:1;overflow-y:auto;max-height:100%;display:flex;flex-direction:column;gap:.6rem">
        ${panel('Pratinjau Live Avatar', `
          <div class="preview-stage tc" style="padding:.5rem 0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at center, rgba(168,85,247,.22) 0%, rgba(15,23,42,.6) 75%);border-radius:var(--rad-m);border:1.5px solid rgba(168,85,247,.35)">
            <div class="hero-avatar-box" style="width:120px;height:120px;margin:0 auto;display:flex;align-items:center;justify-content:center;overflow:hidden">
              ${avatarSvg}
            </div>
            <div style="font-weight:900;font-size:1.05rem;color:#fff;margin-top:4px">${esc(P.nick || P.name || 'Petualang')}</div>
            <div class="muted" style="font-size:.72rem;font-weight:700">${esc(P.title || 'Petualang Cerdas')} · Lv ${P.level || 1}</div>
          </div>

          <!-- 6 SLOT TERPASANG (3x2 GRID PRESISI) -->
          <div style="margin-top:.2rem">
            <div style="font-size:.72rem;font-weight:800;color:var(--c-muted);text-transform:uppercase;margin-bottom:4px">Perlengkapan Terpasang:</div>
            <div class="skin-equipped-slots" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:5px;margin:0">
              ${eqSlots.map(s => {
                const itemObj = itemsList.find(x => x.id === s.id);
                const isSlotActive = (cat === s.sl);
                return `
                  <div class="skin-equipped-slot ${isSlotActive ? 'active' : ''}" data-jumpcat="${s.sl}" title="${esc(s.name)}: ${esc(itemObj?.name || 'Kosong')}" style="padding:4px;border-radius:8px;background:${isSlotActive ? 'rgba(56,189,248,.18)' : 'rgba(255,255,255,.05)'};border:1px solid ${isSlotActive ? 'var(--c-primary)' : 'rgba(255,255,255,.1)'};display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer">
                    <div class="slot-icon" style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:1.05rem">
                      ${itemObj ? renderItemArt(itemObj.id, s.sl, 26) : s.icon}
                    </div>
                    <span class="slot-label" style="font-size:.62rem;font-weight:800;color:${itemObj ? '#fff' : 'var(--c-muted)'};margin-top:2px">${s.name}</span>
                  </div>`;
              }).join('')}
            </div>
          </div>

          <!-- ATRIBUT PASIF & SINERGI -->
          <div style="margin-top:.3rem;border-top:1px dashed rgba(255,255,255,0.1);padding-top:6px">
            <div style="font-size:.72rem;font-weight:800;color:var(--c-muted);text-transform:uppercase;margin-bottom:4px">Atribut Pasif & Sinergi:</div>
            ${(curP.activeSets && curP.activeSets.length > 0) ? `
              <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
                ${curP.activeSets.map(s => `<span class="chip" style="background:rgba(245,158,11,0.2);color:#fbbf24;border:1px solid rgba(245,158,11,0.4);font-size:0.68rem;font-weight:800;padding:2px 8px">✨ ${esc(s.name)}</span>`).join('')}
              </div>
            ` : ''}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
              ${statChips.length > 0 ? statChips.join('') : '<div class="muted tc" style="grid-column:1/-1;font-size:.72rem;padding:6px">Pasang skin untuk mengaktifkan pasif pertempuran.</div>'}
            </div>
          </div>
        `, 'wardrobe-panel-avatar')}

        ${panel('Kategori & Filter Lemari', `
          <!-- FILTER STATUS KOLEKSI 2x2 GRID -->
          <div style="font-size:0.72rem;font-weight:800;color:var(--c-muted);text-transform:uppercase;margin:0 0 4px">Status Koleksi:</div>
          <div class="dex-filter-pill-group" style="display:grid;grid-template-columns:1fr 1fr;gap:.35rem">
            <button class="dex-status-pill-btn skin-owner-btn ${ownerFilter === 'all' ? 'active' : ''}" data-owner="all">
              <span>Semua</span><b>${itemsList.length}</b>
            </button>
            <button class="dex-status-pill-btn skin-owner-btn ${ownerFilter === 'equipped' ? 'active' : ''}" data-owner="equipped">
              <span>✔ Dipakai</span><b style="color:#34d399">${totalEquipped}</b>
            </button>
            <button class="dex-status-pill-btn skin-owner-btn ${ownerFilter === 'owned' ? 'active' : ''}" data-owner="owned">
              <span>📦 Dimiliki</span><b style="color:#38bdf8">${totalOwned}</b>
            </button>
            <button class="dex-status-pill-btn skin-owner-btn ${ownerFilter === 'unowned' ? 'active' : ''}" data-owner="unowned">
              <span>🔒 Belum Ada</span><b style="color:#94a3b8">${totalUnowned}</b>
            </button>
          </div>

          <!-- KATEGORI SLOT (2-KOLOM IDENTIK ELEMEN HABITAT) -->
          <div style="font-size:0.72rem;font-weight:800;color:var(--c-muted);text-transform:uppercase;margin:8px 0 4px;border-top:1px dashed rgba(255,255,255,0.08);padding-top:8px">Kategori Slot:</div>
          <div class="dex-theme-list cat-tabs" style="display:grid;grid-template-columns:1fr 1fr;gap:.35rem">
            ${CATS_MOBILE.map(c => `
              <button class="dex-theme-item skin-cat-tab-btn ${c[0] === cat ? 'active' : ''}" data-cat="${c[0]}" style="${c[0] === 'ALL' ? 'grid-column:1/-1' : ''}">
                <span style="display:flex;align-items:center;gap:.35rem"><span>${c[1]}</span><span>${c[2]}</span></span>
                <b>${catCounts[c[0]] || 0}</b>
              </button>
            `).join('')}
          </div>

          <!-- FILTER TINGKAT RARITY -->
          <div style="font-size:0.72rem;font-weight:800;color:var(--c-muted);text-transform:uppercase;margin:8px 0 4px;border-top:1px dashed rgba(255,255,255,0.08);padding-top:8px">Tingkat Rarity:</div>
          <div class="dex-tier-btn-group skin-rarity-bar" style="display:grid;grid-template-columns:1fr 1fr;gap:.35rem">
            <button class="dex-tier-pill-btn rarity-pill-btn ${rarityFilter === 'ALL' ? 'active' : ''}" data-rar="ALL" style="grid-column:1/-1">
              <span>Semua Rarity</span><b>${countAll}</b>
            </button>
            <button class="dex-tier-pill-btn rarity-pill-btn ${rarityFilter === 'COMMON' ? 'active' : ''}" data-rar="COMMON">
              <span style="color:#94a3b8">⚪ Common</span><b>${countCommon}</b>
            </button>
            <button class="dex-tier-pill-btn rarity-pill-btn ${rarityFilter === 'RARE' ? 'active' : ''}" data-rar="RARE">
              <span style="color:#38bdf8">🔵 Rare</span><b>${countRare}</b>
            </button>
            <button class="dex-tier-pill-btn rarity-pill-btn ${rarityFilter === 'EPIC' ? 'active' : ''}" data-rar="EPIC">
              <span style="color:#c084fc">🟣 Epic</span><b>${countEpic}</b>
            </button>
            <button class="dex-tier-pill-btn rarity-pill-btn ${rarityFilter === 'LEGENDARY' ? 'active' : ''}" data-rar="LEGENDARY">
              <span style="color:#facc15">🟡 Legend</span><b>${countLeg}</b>
            </button>
            <button class="dex-tier-pill-btn rarity-pill-btn ${rarityFilter === 'MYTHIC' ? 'active' : ''}" data-rar="MYTHIC" style="grid-column:1/-1">
              <span style="color:#ff0055">🔴 Mythic</span><b>${countMyt}</b>
            </button>
          </div>
        `, 'wardrobe-panel-filter')}
      </div>

      <!-- PANE 2: GRID KARTU KOLEKSI SKIN & KONTROL (TENGAH) -->
      ${panel('Lemari Kostum & Koleksi (' + filtered.length + ')', `
        <div style="display:flex;flex-direction:column;height:100%;gap:.5rem;overflow:hidden">
          <!-- Control Row: Search Box Only (Pola Monsterdex) -->
          <div style="display:flex;gap:.5rem;align-items:center;flex-shrink:0">
            <input type="text" id="skin-search-in" placeholder="🔍 Cari nama skin, efek pasif, atau slot..." value="${esc(searchQuery)}" class="input" style="width:100%;padding:.45rem .85rem;border-radius:var(--rad-m);background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:.82rem;outline:none">
          </div>

          <!-- Cards List / Grid (3 Kartu Per Baris & Preview Lebih Besar) -->
          <div class="wardrobe-cards-list-layout" style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:.65rem;overflow-y:auto;flex:1;min-height:0;padding-right:4px;align-content:start">
            ${filtered.length === 0 ? `
              <div class="muted tc" style="grid-column:1/-1;padding:3rem 0;font-weight:700">Tidak ada perlengkapan yang cocok dengan filter aktif.</div>
            ` : filtered.map(x => {
              const equippedNow = Boolean(draftAvatar[x.slot] === x.id);
              const rarKey = (x.rarity || 'common').toLowerCase();
              const rarColor = rarKey === 'legendary' ? '#f59e0b' : (rarKey === 'epic' ? '#a855f7' : (rarKey === 'rare' ? '#3b82f6' : '#94a3b8'));
              const catObj = CATS_MOBILE.find(c => c[0] === x.slot) || ['item', '🎒', x.slot || 'Item'];
              const isSel = (x.id === selId);

              return `
              <div class="skin-item-card ${isSel ? 'selected' : ''} ${equippedNow ? 'equipped' : (!x.owned ? 'locked' : '')}" data-item="${x.id}" title="${esc(x.name)}">
                <!-- Baris Atas: Kategori Slot & Status Kepemilikan -->
                <div style="display:flex;align-items:center;justify-content:space-between;width:100%;margin-bottom:2px">
                  <span style="font-size:.65rem;font-weight:800;color:var(--c-muted);display:flex;align-items:center;gap:3px">
                    <span>${catObj[1]}</span><span>${catObj[2]}</span>
                  </span>
                  <div>
                    ${equippedNow ? `<span class="chip" style="font-size:.58rem;font-weight:800;padding:1px 6px;border-radius:99px;background:#10b98122;color:#34d399;border:1px solid #10b98155">✔ DIPAKAI</span>` : (x.owned ? `<span class="chip" style="font-size:.58rem;font-weight:800;padding:1px 6px;border-radius:99px;background:#38bdf822;color:#38bdf8;border:1px solid #38bdf855">📦 MILIK</span>` : `<span class="chip" style="font-size:.58rem;font-weight:800;padding:1px 6px;border-radius:99px;background:#64748b22;color:#94a3b8;border:1px solid #64748b55">🔒 BELUM</span>`)}
                  </div>
                </div>

                <!-- Preview Box Besar (88x88 px dengan efek glow rarity) -->
                <div class="skin-thumbnail-box" style="width:88px;height:88px;border-radius:14px;background:radial-gradient(circle at center, ${rarColor}25 0%, rgba(0,0,0,.45) 80%);border:1.5px solid ${rarColor}66;display:flex;align-items:center;justify-content:center;margin:3px auto 6px;flex-shrink:0;box-shadow:inset 0 2px 8px rgba(0,0,0,.4)">
                  ${renderItemArt(x.id, x.slot, 80)}
                </div>

                <!-- Info Nama, Rarity Badge & Efek Pasif -->
                <div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:3px">
                  <div style="font-size:.82rem;font-weight:900;color:#fff;line-height:1.2;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(x.name)}">${esc(x.name)}</div>
                  <div style="display:flex;align-items:center;justify-content:center;gap:4px">
                    <span class="tag rar-${rarKey}" style="font-size:.6rem;font-weight:800;padding:1px 6px;border-radius:999px;background:${rarColor}20;color:${rarColor};border:1px solid ${rarColor}55">${(x.rarity || 'COMMON').toUpperCase()}</span>
                  </div>
                  ${x.passive ? `
                    <div style="font-size:.67rem;color:#fcd34d;font-weight:700;display:flex;align-items:center;justify-content:center;gap:3px;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px" title="${esc(x.passive.desc)}">
                      <span>✨</span><span style="overflow:hidden;text-overflow:ellipsis">${esc(x.passive.desc)}</span>
                    </div>
                  ` : `
                    <div style="font-size:.65rem;color:var(--c-muted);font-style:italic;margin-top:1px">Kosmetik Avatar</div>
                  `}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      `, 'fill')}

      <!-- PANE 3: DETAIL PERLENGKAPAN / INSPEKSI TERPADU (KANAN) -->
      <div class="col" style="grid-column:3;display:flex;flex-direction:column;max-height:100%;overflow:hidden">
        ${panel('Detail Perlengkapan', `
          <div style="display:flex;flex-direction:column;height:100%;overflow:hidden">
            <!-- Scrollable Content -->
            <div style="flex:1;overflow-y:auto;padding-right:2px;display:flex;flex-direction:column;gap:.6rem">
              <!-- Stage Model 1:1 Presisi -->
              <div class="preview-stage tc" style="padding:.6rem 0;background:radial-gradient(circle at center, ${curRarColor}20 0%, rgba(15,23,42,.6) 75%);border-radius:var(--rad-m);border:1.5px solid ${curRarColor}44;position:relative;overflow:hidden">
                <div style="width:140px;height:140px;margin:0 auto;display:flex;align-items:center;justify-content:center">
                  ${renderItemArt(it.id, it.slot, 90)}
                </div>
              </div>

              <!-- Header Nama & Badge Slot -->
              <div class="tc" style="margin:.2rem 0 .1rem">
                <h2 style="font-size:1.15rem;font-weight:900;margin:0 0 .3rem;color:#fff">${esc(it.name)}</h2>
                <div style="display:inline-flex;align-items:center;gap:.4rem;padding:3px 10px;border-radius:999px;background:${curRarColor}20;color:${curRarColor};border:1px solid ${curRarColor}55;font-weight:800;font-size:0.75rem">
                  ${(it.rarity || 'COMMON').toUpperCase()} · ${curCatObj[1]} ${curCatObj[2]}
                </div>
              </div>

              <!-- HUD Matrix Grid 2-Kolom Presisi -->
              <div class="dex-inspector-stats-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem">
                <div class="dex-stat-tile"><small>Slot Kategori</small><b>${curCatObj[2]}</b></div>
                <div class="dex-stat-tile"><small>Tingkat Rarity</small><b style="color:${curRarColor}">${(it.rarity || 'COMMON').toUpperCase()}</b></div>
                <div class="dex-stat-tile"><small>Status</small><b style="color:${isEquipped ? '#34d399' : (isOwned ? '#38bdf8' : '#94a3b8')}">${isEquipped ? 'Sedang Dipakai ✔' : (isOwned ? 'Sudah Dimiliki' : 'Belum Dimiliki 🔒')}</b></div>
                <div class="dex-stat-tile"><small>Set Bonus</small><b style="color:#fbbf24">${esc(it.setName || (it.passive?.set ? it.passive.set : 'Solo Item'))}</b></div>
                <div class="dex-stat-tile" style="grid-column:1/-1"><small>Efek RPG Pasif</small><b style="color:#fcd34d">${it.passive ? '✨ ' + esc(it.passive.desc) : 'Kosmetik Penampilan'}</b></div>
              </div>

              <!-- Lore Deskripsi Cerita Kotak Kutipan -->
              <div style="background:rgba(255,255,255,0.03);padding:.55rem .75rem;border-radius:var(--rad-m);border-left:3px solid var(--c-primary);font-size:.74rem;color:#cbd5e1;line-height:1.4">
                ${esc(it.lore || 'Perlengkapan legendaris pembawa keberanian bagi petualang pelajar.')}
              </div>
            </div>

            <!-- Fixed Bottom Action Footer -->
            <div style="flex-shrink:0;padding-top:.6rem;border-top:1px solid rgba(255,255,255,.08);margin-top:.4rem">
              <button class="btn ${isOwned ? (isEquipped ? 'good' : 'primary') : 'gold'} lg block" id="equip" style="width:100%;font-weight:800;box-shadow:0 0 16px ${isOwned ? (isEquipped ? 'rgba(16,185,129,.3)' : 'rgba(56,189,248,.3)') : 'rgba(245,158,11,.3)'}">
                ${isEquipped ? '✔ SEDANG DIPAKAI' : (isOwned ? '👕 PAKAI PERLENGKAPAN INI' : '🛒 DAPATKAN DI TOKO')}
              </button>
              <button class="btn ghost block" id="save" style="width:100%;margin-top:6px;font-weight:700">✨ Simpan Penampilan Baru (Gratis)</button>
            </div>
          </div>
        `, 'fill')}
      </div>`;

      // Event Listeners
      const skinIn = $('#skin-search-in', el);
      if (skinIn) {
        skinIn.oninput = () => {
          searchQuery = skinIn.value;
          draw();
          const newIn = $('#skin-search-in', el);
          if (newIn) {
            newIn.focus();
            newIn.selectionStart = newIn.selectionEnd = newIn.value.length;
          }
        };
      }

      $$('.skin-owner-btn', el).forEach(b => { b.onclick = () => { if (root.Sfx) root.Sfx.play('tap'); ownerFilter = b.dataset.owner; selId = null; draw(); }; });
      $$('.skin-cat-tab-btn', el).forEach(b => { b.onclick = () => { if (root.Sfx) root.Sfx.play('tap'); cat = b.dataset.cat; selId = null; draw(); }; });
      $$('.rarity-pill-btn', el).forEach(b => { b.onclick = () => { if (root.Sfx) root.Sfx.play('tap'); rarityFilter = b.dataset.rar; selId = null; draw(); }; });
      $$('[data-jumpcat]', el).forEach(b => { b.onclick = () => { if (root.Sfx) root.Sfx.play('tap'); cat = b.dataset.jumpcat; selId = null; draw(); }; });
      $$('[data-item]', el).forEach(b => { b.onclick = () => { if (root.Sfx) root.Sfx.play('tap'); selId = b.dataset.item; draw(); }; });

      const btnEquip = $('#equip', el);
      if (btnEquip) {
        btnEquip.onclick = () => {
          if (!isOwned) {
            root.go('shop');
          } else {
            if (root.Sfx) root.Sfx.play('equip');
            draftAvatar[it.slot] = it.id;
            toast('Item dipasang: ' + it.name);
            draw();
          }
        };
      }

      const btnSave = $('#save', el);
      if (btnSave) {
        btnSave.onclick = async () => {
          if (root.API && typeof root.API.updateAvatar === 'function') {
            try {
              if (root.Sfx) root.Sfx.play('levelUp');
              const res = await root.API.updateAvatar(draftAvatar);
              if (root.Player && root.Player.data) root.Player.data.avatar = res?.avatar || draftAvatar;
              if (root.DesktopShell?.updateTopbar) root.DesktopShell.updateTopbar();
              toast('✨ Penampilan tersimpan permanen!');
            } catch (e) { toast('Gagal simpan: ' + e.message); }
          } else {
            toast('✨ Penampilan tersimpan');
          }
        };
      }
    };

    draw();
  };

  /* ---------- 9. TOKO & PETI HARTA (Asset Asli Mobile & Rapi 100%) ---------- */
  DesktopScreens.shop = async el => {
    el.classList.add('g3n');
    let shopData = null;
    let shopItems = [];
    let shopCatFilter = 'ALL';
    let shopRarityFilter = 'ALL';
    let shopOwnerFilter = 'ALL'; // 'ALL' | 'UNOWNED' | 'OWNED'
    let shopSearchQuery = '';
    let selPreviewItem = null;

    try {
      if (root.API && typeof root.API.getShop === 'function') {
        shopData = await root.API.getShop();
        if (shopData?.items) shopItems = shopData.items;
      }
    } catch (_) {}

    if (!shopItems.length && root.ITEMS) {
      shopItems = root.ITEMS;
    }

    const draw = () => {
      const P = root.Player?.data || {};
      const playerCoins = (shopData && typeof shopData.coins === 'number') ? shopData.coins : (P.coins ?? 0);
      if (root.Player?.data) root.Player.data.coins = playerCoins;
      const boxPrice = shopData?.mysteryBoxPrice || 60;
      const canAffordBox = playerCoins >= boxPrice;
      const gems = P.gems ?? 12;

      // Filtered Items
      let filtered = shopItems;
      if (shopCatFilter !== 'ALL') {
        filtered = filtered.filter(it => it.slot === shopCatFilter);
      }
      if (shopRarityFilter !== 'ALL') {
        filtered = filtered.filter(it => (it.rarity || 'COMMON').toUpperCase() === shopRarityFilter);
      }
      if (shopOwnerFilter === 'UNOWNED') {
        filtered = filtered.filter(it => !it.owned);
      } else if (shopOwnerFilter === 'OWNED') {
        filtered = filtered.filter(it => it.owned);
      }
      if (shopSearchQuery) {
        const q = shopSearchQuery.toLowerCase().trim();
        filtered = filtered.filter(it => (it.name || '').toLowerCase().includes(q) || (it.passive?.desc || '').toLowerCase().includes(q));
      }

      if (!selPreviewItem || !filtered.some(it => it.id === selPreviewItem.id)) {
        selPreviewItem = filtered[0] || shopItems[0] || null;
      }

      // Rarity counts for current category
      const catItems = shopCatFilter === 'ALL' ? shopItems : shopItems.filter(it => it.slot === shopCatFilter);
      const countAll = catItems.length;
      const countCommon = catItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'COMMON').length;
      const countRare = catItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'RARE').length;
      const countEpic = catItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'EPIC').length;
      const countLeg = catItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'LEGENDARY').length;
      const countMyt = catItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'MYTHIC').length;

      const totalShopOwned = shopItems.filter(it => it.owned).length;
      const totalShopUnowned = shopItems.filter(it => !it.owned).length;

      const isPreviewOwned = Boolean(selPreviewItem?.owned);
      const canAffordPreview = playerCoins >= (selPreviewItem?.price || 0);

      el.innerHTML = `
      <div class="col">
        <!-- DOMPET PETUALANG -->
        ${panel('Dompet Petualang', `
          <div class="kv"><span>Saldo Koin Emas</span><b style="color:#fde047;font-size:1.15rem">🪙 ${playerCoins.toLocaleString('id-ID')}</b></div>
          <div class="kv"><span>Permata Mistis</span><b style="color:#38bdf8;font-size:1.15rem">💎 ${gems}</b></div>
          <div class="kv" style="border:0"><span>Garansi Transaksi</span><b style="color:#34d399">Anti-Duplikat 100%</b></div>
        `)}

        <!-- KOTAK MISTERI AJAIB (GACHA PETI) -->
        ${panel('Peti Gacha Kosmik', `
          <div class="card chest-banner" style="padding:12px;background:linear-gradient(135deg, rgba(245,158,11,0.15), rgba(168,85,247,0.15));border:1.5px solid rgba(245,158,11,0.4);border-radius:var(--rad-m);text-align:center">
            <div style="font-size:2.8rem;line-height:1;margin-bottom:4px">🎁</div>
            <h3 style="font-size:1.05rem;margin:0 0 4px 0;color:#fff;font-weight:900">Kotak Misteri Ajaib</h3>
            <p style="font-size:0.75rem;color:var(--c-muted);margin:0 0 10px 0;line-height:1.35">
              1 skin acak anti-duplikat (+20 koin jika dobel).
            </p>
            <button class="btn ${canAffordBox ? 'primary' : 'secondary'} lg block" id="btn-buy-box" data-testid="buy-mystery-box" ${!canAffordBox ? 'disabled' : ''} style="font-weight:800;width:100%">
              ${canAffordBox ? `Buka Kotak (${boxPrice} 🪙)` : `Kurang ${boxPrice - playerCoins} 🪙`}
            </button>
          </div>
        `)}

        <!-- FILTER KATEGORI TOKO -->
        ${panel('Kategori Toko', `
          <div class="shop-filter-section" style="margin-bottom:0">
            <div class="shop-filter-bar" style="display:flex;flex-direction:column;gap:5px">
              <button class="btn small shop-cat-btn ${shopCatFilter === 'ALL' ? 'active' : 'ghost'}" data-cat="ALL" style="justify-content:flex-start;text-align:left;font-weight:700">
                🎒 Semua (${shopItems.length})
              </button>
              <button class="btn small shop-cat-btn ${shopCatFilter === 'hat' ? 'active' : 'ghost'}" data-cat="hat" style="justify-content:flex-start;text-align:left;font-weight:700">
                👑 Topi
              </button>
              <button class="btn small shop-cat-btn ${shopCatFilter === 'outfit' ? 'active' : 'ghost'}" data-cat="outfit" style="justify-content:flex-start;text-align:left;font-weight:700">
                🥋 Pakaian
              </button>
              <button class="btn small shop-cat-btn ${shopCatFilter === 'weapon' ? 'active' : 'ghost'}" data-cat="weapon" style="justify-content:flex-start;text-align:left;font-weight:700">
                ⚔️ Senjata
              </button>
              <button class="btn small shop-cat-btn ${shopCatFilter === 'pet' ? 'active' : 'ghost'}" data-cat="pet" style="justify-content:flex-start;text-align:left;font-weight:700">
                🐾 Hewan Peliharaan
              </button>
              <button class="btn small shop-cat-btn ${shopCatFilter === 'bg' ? 'active' : 'ghost'}" data-cat="bg" style="justify-content:flex-start;text-align:left;font-weight:700">
                🖼️ Latar Belakang
              </button>
              <button class="btn small shop-cat-btn ${shopCatFilter === 'frame' ? 'active' : 'ghost'}" data-cat="frame" style="justify-content:flex-start;text-align:left;font-weight:700">
                💠 Bingkai Avatar
              </button>
              <button class="btn small shop-cat-btn ${shopCatFilter === 'title' ? 'active' : 'ghost'}" data-cat="title" style="justify-content:flex-start;text-align:left;font-weight:700">
                🏅 Gelar Juara
              </button>
              <button class="btn small shop-cat-btn ${shopCatFilter === 'permanent' ? 'active' : 'ghost'}" data-cat="permanent" style="justify-content:flex-start;text-align:left;font-weight:700">
                ⚡ Upgrade Permanen
              </button>
            </div>
          </div>
        `, 'fill')}
      </div>

      ${panel('Katalog Perlengkapan & Skin', `
        <div style="display:flex;flex-direction:column;gap:.6rem;height:100%;overflow-y:auto;padding:.2rem">
          <!-- SEARCH & FILTER KEPEMILIKAN TOKO -->
          <div style="display:flex;gap:.5rem;align-items:center;flex-shrink:0">
            <input type="text" id="shop-search-in" placeholder="🔍 Cari item toko atau efek pasif..." value="${esc(shopSearchQuery)}" class="input" style="flex:1;padding:.45rem .8rem;border-radius:var(--rad-m);background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:.82rem;outline:none">
            <div style="display:flex;gap:4px">
              <button class="btn small shop-owner-filter-btn ${shopOwnerFilter === 'ALL' ? 'primary' : 'ghost'}" data-owner="ALL" style="font-size:0.72rem;padding:4px 8px;font-weight:700">Semua (${shopItems.length})</button>
              <button class="btn small shop-owner-filter-btn ${shopOwnerFilter === 'UNOWNED' ? 'primary' : 'ghost'}" data-owner="UNOWNED" style="font-size:0.72rem;padding:4px 8px;font-weight:700">Tersedia (${totalShopUnowned})</button>
              <button class="btn small shop-owner-filter-btn ${shopOwnerFilter === 'OWNED' ? 'primary' : 'ghost'}" data-owner="OWNED" style="font-size:0.72rem;padding:4px 8px;font-weight:700">Dimiliki (${totalShopOwned})</button>
            </div>
          </div>

          <!-- FILTER RARITY TOKO (HORIZONTAL PILLS DENGAN JUMLAH ITEM) -->
          <div class="shop-filter-section" style="margin-bottom:0">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <div style="font-size:0.75rem;font-weight:800;color:var(--c-muted);text-transform:uppercase;letter-spacing:0.5px">💎 Filter Rarity</div>
              <span id="shop-filter-count" style="font-size:0.75rem;color:var(--c-primary);font-weight:800">${filtered.length} item</span>
            </div>
            <div class="shop-rarity-bar" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:2px">
              <button class="btn small rarity-pill-btn shop-rarity-btn ${shopRarityFilter === 'ALL' ? 'active' : 'ghost'}" id="shop-rarity-all" data-rarity="ALL" data-testid="shop-filter-rarity-all">

                Semua (${countAll})
              </button>
              <button class="btn small rarity-pill-btn shop-rarity-btn ${shopRarityFilter === 'COMMON' ? 'active' : 'ghost'}" id="shop-rarity-common" data-rarity="COMMON" data-testid="shop-filter-rarity-common" style="border-color:rgba(148,163,184,0.4)">
                ⚪ Common (${countCommon})
              </button>
              <button class="btn small rarity-pill-btn shop-rarity-btn ${shopRarityFilter === 'RARE' ? 'active' : 'ghost'}" id="shop-rarity-rare" data-rarity="RARE" data-testid="shop-filter-rarity-rare" style="border-color:rgba(56,189,248,0.4)">
                🔵 Rare (${countRare})
              </button>
              <button class="btn small rarity-pill-btn shop-rarity-btn ${shopRarityFilter === 'EPIC' ? 'active' : 'ghost'}" id="shop-rarity-epic" data-rarity="EPIC" data-testid="shop-filter-rarity-epic" style="border-color:rgba(168,85,247,0.4)">
                🟣 Epic (${countEpic})
              </button>
              <button class="btn small rarity-pill-btn shop-rarity-btn ${shopRarityFilter === 'LEGENDARY' ? 'active' : 'ghost'}" id="shop-rarity-legendary" data-rarity="LEGENDARY" data-testid="shop-filter-rarity-legendary" style="border-color:rgba(245,158,11,0.4)">
                🟡 Legend (${countLeg})
              </button>
              <button class="btn small rarity-pill-btn shop-rarity-btn ${shopRarityFilter === 'MYTHIC' ? 'active' : 'ghost'}" id="shop-rarity-mythic" data-rarity="MYTHIC" data-testid="shop-filter-rarity-mythic" style="border-color:rgba(255,0,85,0.4)">
                🔴 Mythic (${countMyt})
              </button>
            </div>
          </div>

          <!-- KATALOG ITEM GRID (Dua Kolom Responsif dengan Kotak Thumbnail 68x68 SVG) -->
          <div class="shop-grid" id="shop-items-grid" style="display:grid;grid-template-columns:repeat(2, 1fr);gap:10px;padding:4px 0">
            ${filtered.length === 0 ? `
              <div style="grid-column:1/-1;text-align:center;padding:36px;color:var(--c-muted);font-weight:700">
                Tidak ada item untuk filter kategori &amp; rarity ini.
              </div>
            ` : filtered.map(it => {
              const isOwned = Boolean(it.owned);
              const canAfford = playerCoins >= (it.price || 0);
              const rarKey = (it.rarity || 'common').toLowerCase();
              const rarColor = rarKey === 'legendary' || rarKey === 'legend' ? '#f59e0b' : (rarKey === 'epic' ? '#a855f7' : (rarKey === 'rare' ? '#38bdf8' : '#94a3b8'));
              const thumbSvg = renderItemArt(it.id, it.slot, 68);

              return `
                <div class="card item-card shop-card-desktop ${selPreviewItem?.id === it.id ? 'selected' : ''}" data-testid="item-card-${it.id}" data-id="${it.id}">
                  <div style="display:flex;gap:12px;align-items:flex-start">
                    <!-- THUMBNAIL BOX 68x68 SVG ASLI MOBILE -->
                    <div style="flex:0 0 68px;display:flex;flex-direction:column;align-items:center;gap:4px">
                      <div class="skin-thumbnail-box" style="width:68px;height:68px">
                        ${thumbSvg}
                      </div>
                      <span style="font-size:0.65rem;font-weight:800;color:${rarColor};letter-spacing:0.5px">${(it.rarity || 'COMMON').toUpperCase()}</span>
                    </div>

                    <!-- INFO PRODUK -->
                    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px">
                      <div style="font-weight:800;font-size:0.95rem;color:#fff;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                        ${esc(it.name)}
                      </div>
                      ${it.passive ? `
                        <div style="font-size:0.72rem;font-weight:700;color:#fbbf24;background:rgba(251,191,36,0.12);padding:3px 6px;border-radius:6px;border:1px solid rgba(251,191,36,0.3);line-height:1.3">
                          ✨ ${esc(it.passive.desc)}
                        </div>
                      ` : ''}
                      ${it.lore ? `
                        <div style="font-size:0.7rem;color:var(--c-muted);line-height:1.3;font-style:italic;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">
                          ${esc(it.lore)}
                        </div>
                      ` : ''}
                    </div>
                  </div>

                  <!-- FOOTER: HARGA & TOMBOL BELI TERKONFIRMASI -->
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);margin-top:auto">
                    <div style="font-size:0.95rem;font-weight:800;color:#fbbf24;display:flex;align-items:center;gap:4px">
                      🪙 ${it.price || 0}
                    </div>
                    <div>
                      ${isOwned ? `
                        <span class="chip good" style="font-size:0.75rem;padding:4px 10px;font-weight:700">✓ Dimiliki</span>
                      ` : `
                        <button class="btn small ${canAfford ? 'primary' : 'secondary'} item-shop-buy-btn"
                          data-testid="item-buy-${it.id}"
                          data-id="${it.id}"
                          data-name="${esc(it.name)}"
                          data-price="${it.price || 0}"
                          ${!canAfford ? 'disabled' : ''}>
                          ${canAfford ? 'Beli' : `Kurang ${(it.price || 0) - playerCoins} 🪙`}
                        </button>
                      `}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `, 'fill')}

      <div class="col">
        ${selPreviewItem ? panel('Pratinjau & Pembelian', `
          <div class="tc" style="padding:.6rem 0">
            <div class="skin-thumbnail-box" style="width:88px;height:88px;margin:0 auto 8px">
              ${renderItemArt(selPreviewItem.id, selPreviewItem.slot, 88)}
            </div>
            <h3 style="margin:0 0 2px;font-size:1.15rem;color:#fff;font-weight:900">${esc(selPreviewItem.name)}</h3>
            <span class="tag rar-${(selPreviewItem.rarity || 'common').toLowerCase()}">${(selPreviewItem.rarity || 'COMMON').toUpperCase()} · ${esc(selPreviewItem.slot || 'Item')}</span>
          </div>
          ${selPreviewItem.passive ? `<div class="kv"><span>Efek RPG</span><b style="color:#fbbf24">✨ ${esc(selPreviewItem.passive.desc)}</b></div>` : ''}
          ${selPreviewItem.lore ? `<div class="kv"><span>Kisah Item</span><i class="muted" style="font-size:.75rem">${esc(selPreviewItem.lore)}</i></div>` : ''}
          <div class="kv"><span>Harga Resmi</span><b style="color:#fbbf24;font-size:1.1rem">🪙 ${selPreviewItem.price || 0} koin</b></div>
          <div class="kv" style="border:0"><span>Status</span><b style="color:${isPreviewOwned ? '#34d399' : '#38bdf8'}">${isPreviewOwned ? 'Sudah Dimiliki ✔' : 'Tersedia di Toko'}</b></div>
          <div style="margin-top:12px">
            ${isPreviewOwned ? `
              <button class="btn secondary lg block" disabled style="width:100%;font-weight:800">✓ Sudah Dimiliki</button>
            ` : `
              <button class="btn ${canAffordPreview ? 'primary' : 'secondary'} lg block" id="btn-buy-preview" style="width:100%;font-weight:800" ${!canAffordPreview ? 'disabled' : ''}>
                ${canAffordPreview ? `🛒 Beli Sekarang (${selPreviewItem.price || 0} 🪙)` : `Kurang ${(selPreviewItem.price || 0) - playerCoins} 🪙`}
              </button>
            `}
          </div>
        `, 'fill') : ''}
      </div>`;

      // Search input
      const shopIn = $('#shop-search-in', el);
      if (shopIn) {
        shopIn.oninput = () => {
          shopSearchQuery = shopIn.value;
          draw();
          const newIn = $('#shop-search-in', el);
          if (newIn) {
            newIn.focus();
            newIn.selectionStart = newIn.selectionEnd = newIn.value.length;
          }
        };
      }

      // Ownership filter buttons
      $$('.shop-owner-filter-btn', el).forEach(btn => {
        btn.onclick = () => {
          shopOwnerFilter = btn.dataset.owner;
          draw();
        };
      });

      // Category click
      $$('.shop-cat-btn', el).forEach(btn => {
        btn.onclick = () => {
          shopCatFilter = btn.dataset.cat;
          draw();
        };
      });

      // Rarity click
      $$('.shop-rarity-btn', el).forEach(btn => {
        btn.onclick = () => {
          shopRarityFilter = btn.dataset.rarity;
          draw();
        };
      });

      // Item selection preview
      $$('.item-card', el).forEach(card => {
        card.onclick = (e) => {
          if (e.target.closest('.item-shop-buy-btn')) return;
          const id = card.dataset.id;
          const found = shopItems.find(it => it.id === id);
          if (found) {
            selPreviewItem = found;
            draw();
          }
        };
      });

      // Shared Buy Item function
      const triggerBuyItem = (itemToBuy) => {
        const buyId = itemToBuy.id;
        const buyName = itemToBuy.name;
        const buyPrice = parseInt(itemToBuy.price, 10) || 0;
        if (playerCoins < buyPrice) {
          toast(`Koin belum cukup — kurang ${buyPrice - playerCoins} 🪙`);
          return;
        }

        // Modal Confirmation
        Modal.open(`Konfirmasi Pembelian`, `
          <div class="tc" style="padding:1rem">
            <div class="skin-thumbnail-box" style="width:72px;height:72px;margin:0 auto 10px">
              ${renderItemArt(buyId, itemToBuy.slot || 'outfit', 72)}
            </div>
            <h3 style="margin:0 0 6px 0;color:#fff">Beli ${esc(buyName)}?</h3>
            <p class="muted" style="font-size:0.85rem;margin:0 0 14px 0">
              Saldo koin kamu akan dipotong sebesar <b style="color:#fbbf24">🪙 ${buyPrice}</b>.
            </p>
            <div style="display:flex;gap:10px;justify-content:center">
              <button class="btn secondary" data-close>Batal</button>
              <button class="btn primary" id="btn-confirm-buy-item">Konfirmasi Beli</button>
            </div>
          </div>`);

        const confirmBtn = $('#btn-confirm-buy-item');
        if (confirmBtn) {
          confirmBtn.onclick = async () => {
            Modal.close();
            if (root.API && typeof root.API.buyShopItem === 'function') {
              try {
                const idemKey = `buy-${buyId}-${Date.now()}`;
                const res = await root.API.buyShopItem(buyId, idemKey);
                const newCoins = res?.coins ?? (playerCoins - buyPrice);
                if (root.Player?.data) root.Player.data.coins = newCoins;
                if (shopData) shopData.coins = newCoins;
                if (root.DesktopShell?.updateTopbar) root.DesktopShell.updateTopbar();
                const itObj = shopItems.find(x => x.id === buyId);
                if (itObj) itObj.owned = true;
                toast(`Berhasil membeli: ${buyName}! 🎉`);
                draw();
              } catch (err) {
                toast('Gagal membeli item: ' + err.message);
              }
            }
          };
        }
      };

      // Mystery Box Buy
      const btnBox = $('#btn-buy-box', el);
      if (btnBox) {
        btnBox.onclick = async () => {
          if (playerCoins < boxPrice) {
            toast(`Koin belum cukup — kurang ${boxPrice - playerCoins} 🪙`);
            return;
          }
          if (root.API && typeof root.API.buyMysteryBox === 'function') {
            try {
              btnBox.disabled = true;
              btnBox.textContent = 'Membuka Peti...';
              const idemKey = `box-${Date.now()}`;
              const res = await root.API.buyMysteryBox(idemKey);
              if (res && res.ok) {
                const newCoins = res.coins ?? (playerCoins - boxPrice);
                if (root.Player?.data) root.Player.data.coins = newCoins;
                if (shopData) shopData.coins = newCoins;
                if (root.DesktopShell?.updateTopbar) root.DesktopShell.updateTopbar();
                const item = res.item || { id: 'outfit_scout', name: 'Seragam Pramuka', rarity: 'RARE', slot: 'outfit' };
                Modal.open('🎉 Peti Terbuka!', `
                  <div class="tc" style="padding:1rem">
                    <div class="skin-thumbnail-box" style="width:84px;height:84px;margin:0 auto 10px">
                      ${renderItemArt(item.id, item.slot, 84)}
                    </div>
                    <h2 style="margin:.4rem 0 .2rem;color:#fff">${esc(item.name)}</h2>
                    <span class="tag rar-${(item.rarity || 'epic').toLowerCase()}">${esc(item.rarity || 'Epic')} · ${esc(item.slot || 'Item')}</span>
                    ${res.duplicate ? `
                      <p style="color:#38bdf8;font-weight:700;margin-top:8px">Item sudah kamu miliki! +20 koin dikembalikan otomatis.</p>
                    ` : `
                      <p class="muted" style="font-weight:700;margin-top:8px">Item berhasil masuk ke Lemari Kostum kamu.</p>
                    `}
                    <button class="btn primary lg" data-close style="margin-top:10px">Mantap!</button>
                  </div>`);
                draw();
                return;
              }
            } catch (e) {
              toast('Gagal buka peti: ' + e.message);
            }
          }
        };
      }

      // Buy button in catalog cards
      $$('.item-shop-buy-btn', el).forEach(b => {
        b.onclick = (e) => {
          e.stopPropagation();
          const buyId = b.dataset.id;
          const found = shopItems.find(it => it.id === buyId);
          if (found) triggerBuyItem(found);
        };
      });

      // Buy button in preview panel
      const btnBuyPreview = $('#btn-buy-preview', el);
      if (btnBuyPreview && selPreviewItem) {
        btnBuyPreview.onclick = () => triggerBuyItem(selPreviewItem);
      }
    };

    draw();
  };

  /* ---------- 10. ARENA DUEL 1v1 (Realtime) ---------- */
  DesktopScreens.duel = (el, params = {}) => {
    el.classList.add('duel');
    const P = root.Player?.data || {};
    const pName = P.nick || P.name || 'Kamu';
    const myAvatar = renderPlayerAvatar(P.avatar, 180);

    const side = (figMarkup, name, meta, hp, mine) => `
      <div class="panel fighter">
        <div class="fig">${figMarkup}</div>
        <h2>${esc(name)}</h2>
        <div class="meta">${esc(meta)}</div>
        ${bar(hp, mine ? 'hp tall' : 'boss tall', `HP ${hp}/100`)}
        ${mine
          ? `<div class="energy-row"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i></div><div class="skills-deck" style="grid-template-columns:1fr"><button class="skill-btn"><span class="kbd">Q</span><div style="width:20px;height:20px;display:inline-block">${renderSkillArt('eliminate_one', 1, 20)}</div><b>Skill Coret</b></button></div>`
          : '<div class="telegraph" style="background:rgba(56,189,248,.15);border-color:var(--c-primary)">Lawan sedang berpikir…</div>'}
      </div>`;

    el.innerHTML = `
      <div class="panel hud" style="grid-column:1/-1">
        <button class="btn sm" data-go="home">✕ Keluar <span class="kbd">Esc</span></button>
        <b style="font-size:1.1rem">⚔️ ARENA DUEL 1v1 REALTIME</b>
        <span class="sp"></span>
        <div class="round-dots"><i class="w"></i><i class="l"></i><i class="w"></i><i class="now"></i><i></i></div>
        <span class="sp"></span>
        <div class="timer" style="max-width:20rem">
          <span>⏱️</span>
          <div class="timer-bar"><i style="width:45%"></i></div>
          <b>12s</b>
        </div>
      </div>
      ${side(myAvatar, pName, `Lv ${P.level || 1} · Kamu`, 90, true)}
      <div class="qwrap">
        <div class="panel qcard tc">
          <div class="vs">VS</div>
          <div class="qtag" style="justify-content:center">SOAL BERSAMA · RONDE 4</div>
          <div class="qtext">Berapakah hasil dari 15 × 8 = …?</div>
        </div>
        <div class="options">
          ${['110', '120', '125', '130'].map((o, i) => `<button class="opt" data-i="${i}"><span class="key">${'ABCD'[i]}</span>${o}</button>`).join('')}
        </div>
      </div>
      ${side(sv('av-rival'), 'Kawan Belajar', 'Lv 5 · SD Bintang', 75, false)}`;

    $$('.opt', el).forEach(b => {
      b.onclick = () => {
        $$('.opt', el).forEach(x => x.classList.add('dim'));
        b.classList.remove('dim');
        b.classList.add(+b.dataset.i === 1 ? 'right' : 'wrong');
        toast('Jawaban terkirim! Menunggu respon lawan…');
      };
    });

    const L = i => () => $$('.opt', el)[i]?.click();
    Keys.set({
      Escape: () => root.go('home'),
      a: L(0), b: L(1), c: L(2), d: L(3),
      1: L(0), 2: L(1), 3: L(2), 4: L(3),
      __noGlobal: true
    });
  };

  /* ---------- 11. SKILL RPG (Asset Asli SkillArt V2 Lv 1-5 & Dek Lengkap 100%) ---------- */
  DesktopScreens.skill = async el => {
    el.classList.add('g3n');
    let skillsRes = null;
    let activeLoadoutMode = 'adventure'; // 'adventure' | 'duel'
    let selSkillId = 'eliminate_one';
    let skillStatusFilter = 'all'; // 'all' | 'equipped' | 'standby'
    let skillSearchQuery = '';

    try {
      if (root.API && typeof root.API.getSkills === 'function') {
        skillsRes = await root.API.getSkills();
      }
    } catch (_) {}

    const playerCoins = () => root.Player?.data?.coins ?? 0;
    const maxSlots = skillsRes?.slots || (skillsRes?.hasSlot4 ? 4 : 3);
    const slotIndices = Array.from({ length: maxSlots }, (_, i) => i);

    // Initial loadout
    let adventureLoadout = skillsRes?.rawLoadout || skillsRes?.loadout || ['eliminate_one', 'eagle_eye', 'heal'];
    let duelLoadout = skillsRes?.rawDuelLoadout || skillsRes?.duelLoadout || adventureLoadout;

    // Helper: Level info for modal
    const getSkillInfo = (id) => {
      if (root.Screens?.profil?.getSkillPerLevelInfo) {
        const inf = root.Screens.profil.getSkillPerLevelInfo(id);
        if (inf) return inf;
      }
      if (typeof Screens !== 'undefined' && Screens?.profil?.getSkillPerLevelInfo) {
        const inf = Screens.profil.getSkillPerLevelInfo(id);
        if (inf) return inf;
      }
      const item = SKILLS_LIST.find(x => x.id === id);
      return {
        name: item?.name || id,
        icon: item?.icon || '⚡',
        desc: item?.desc || 'Skill taktik petualang',
        levels: [
          { level: 1, energy: item?.cost || 1, uses: 2, effect: item?.desc || 'Efek level 1' },
          { level: 2, energy: item?.cost || 1, uses: 2, effect: (item?.desc || '') + ' (Kekuatan +20%)' },
          { level: 3, energy: item?.cost || 1, uses: 3, effect: (item?.desc || '') + ' (Kekuatan +40%, +1x pemakaian)' },
          { level: 4, energy: Math.max(1, (item?.cost || 2) - 1), uses: 3, effect: (item?.desc || '') + ' (Hemat energi)' },
          { level: 5, energy: Math.max(1, (item?.cost || 2) - 1), uses: 4, effect: 'Kekuatan Puncak Sempurna!' }
        ]
      };
    };

    // Modal detail skill
    const showSkillDetail = (id) => {
      const liveList = skillsRes?.skills || [];
      const sk = liveList.find(x => x.id === id) || SKILLS_LIST.find(x => x.id === id) || {};
      const info = getSkillInfo(id);
      const curLv = sk.level || 1;
      const isOwned = sk.owned !== false;

      const old = $('#modal-skill-detail');
      if (old) old.remove();

      const modal = document.createElement('div');
      modal.id = 'modal-skill-detail';
      modal.className = 'modal-overlay active';
      modal.setAttribute('data-testid', 'modal-skill-detail');
      modal.style.cssText = 'z-index:9999;display:grid;place-items:center;position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(6px);padding:1rem';

      modal.innerHTML = `
        <div class="modal-card" style="max-width:32rem;width:100%;max-height:90vh;display:flex;flex-direction:column;border-radius:18px;background:var(--c-surface);border:1.5px solid var(--c-surface-strong);box-shadow:0 20px 40px rgba(0,0,0,0.8);overflow:hidden">
          <div style="padding:14px 18px;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:54px;height:54px;display:flex;align-items:center;justify-content:center">
                ${renderSkillArt(id, curLv, 54, { animated: 'lite' })}
              </div>
              <div>
                <h3 style="margin:0;font-size:1.15rem;color:#fff;font-weight:800">${esc(info.name || sk.name)}</h3>
                <span class="chip ${isOwned ? 'good' : 'bad'}" style="font-size:0.7rem;font-weight:700">
                  ${isOwned ? `Dimiliki (Lv. ${curLv}/5)` : `Terkunci (Buka di Lv. ${sk.unlockLevel || 1})`}
                </span>
              </div>
            </div>
            <button class="btn ghost sm" id="btn-close-skill-modal" style="font-size:1.1rem;padding:4px 8px">✕</button>
          </div>

          <div style="padding:14px 18px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;flex:1">
            <div style="padding:8px 12px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);border-radius:10px;font-size:0.8rem;color:#e2e8f0;line-height:1.4">
              💡 <b>Mekanika:</b> ${esc(info.desc || sk.desc)}
            </div>

            <div style="font-size:0.82rem;font-weight:800;color:var(--c-primary);margin-top:4px">
              📈 Progresi Kekuatan (Level 1 — 5)
            </div>

            <div style="display:flex;flex-direction:column;gap:6px">
              ${(info.levels || []).map(lvl => {
                const isCurrent = lvl.level === curLv;
                return `
                  <div style="padding:8px 10px;background:${isCurrent ? 'rgba(56,189,248,0.14)' : 'rgba(255,255,255,0.03)'};border:1px solid ${isCurrent ? 'var(--c-primary)' : 'rgba(255,255,255,0.06)'};border-radius:10px;display:flex;gap:10px;align-items:flex-start">
                    <span class="chip ${isCurrent ? 'accent' : 'secondary'}" style="font-size:0.72rem;font-weight:800;white-space:nowrap">
                      Lv. ${lvl.level} ${isCurrent ? '★' : ''}
                    </span>
                    <div style="flex:1;font-size:0.75rem;line-height:1.35;color:${isCurrent ? '#fff' : 'var(--c-muted)'}">
                      ${esc(lvl.effect)}
                      <div style="font-size:0.68rem;color:#fcd34d;margin-top:2px">
                        ⚡ Biaya: ${lvl.energy} energi · 🔄 ${lvl.uses}× per laga
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      $('#btn-close-skill-modal', modal).onclick = () => modal.remove();
      modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    };

    const draw = () => {
      const coins = playerCoins();
      const activeLoadout = activeLoadoutMode === 'duel' ? duelLoadout : adventureLoadout;
      const liveSkills = skillsRes?.skills || [];

      // Sinkronisasi penuh dengan backend & mode mobile (Single Source of Truth)
      const sourceList = (liveSkills && liveSkills.length > 0) ? liveSkills : SKILLS_LIST;
      const skillsData = sourceList.map((s) => {
        const skMeta = SKILLS_LIST.find(x => x.id === s.id) || {};
        const level = s.level || 1;
        const maxLevel = s.maxLevel || 5;
        const isMax = level >= maxLevel;
        const owned = Boolean(s.owned !== undefined ? s.owned : ((s.unlockLevel || skMeta.unlockLevel || 1) <= (root.Player?.data?.level || 1)));
        const upgradeCost = s.upgradeCost !== undefined ? s.upgradeCost : ((level * 100) + 100);
        const canUpgrade = Boolean(s.canUpgrade !== undefined ? s.canUpgrade : (owned && !isMax && coins >= upgradeCost));
        const effectNow = s.effectNow || s.descNow || s.desc || skMeta.desc || '';
        const effectNext = s.effectNext || s.descNext || '';
        const costEnergy = s.costEnergy || s.cost || skMeta.cost || 1;
        const usesPerBattle = s.usesPerBattle || (s.maxUses ? s.maxUses[0] : 2);
        const unlockLevel = s.unlockLevel || skMeta.unlockLevel || 1;
        const name = s.name || skMeta.name || s.id;

        return Object.assign({}, skMeta, s, {
          id: s.id,
          name,
          level,
          maxLevel,
          isMax,
          owned,
          upgradeCost,
          canUpgrade,
          effectNow,
          effectNext,
          costEnergy,
          usesPerBattle,
          unlockLevel
        });
      });

      const selSkill = skillsData.find(x => x.id === selSkillId) || skillsData[0];
      const bossLoadout = skillsRes?.duelBossLoadout || {
        slots: Array.from({ length: 5 }, (_, idx) => ({
          slotIndex: idx,
          unlocked: idx === 0,
          unlockLevel: 5 * (idx + 1),
          monster: null,
          skills: []
        })),
        unlockedCount: 1,
        playerLevel: root.Player?.data?.level || 1,
        activeBossSkills: []
      };

      el.innerHTML = `
      <div class="col">
        <!-- SWITCHER LOADOUT (PETUALANGAN VS BATTLE VS PLAYER) -->
        <div style="display:flex;gap:6px;background:rgba(255,255,255,0.06);padding:4px;border-radius:12px;margin-bottom:10px">
          <button class="btn small ${activeLoadoutMode === 'adventure' ? 'primary' : 'ghost'} btn-loadout-mode" data-mode="adventure" style="flex:1;font-weight:800;font-size:0.8rem">
            🗺️ Petualangan
          </button>
          <button class="btn small ${activeLoadoutMode === 'duel' ? 'primary' : 'ghost'} btn-loadout-mode" data-mode="duel" style="flex:1;font-weight:800;font-size:0.8rem">
            ⚔️ Battle vs Player
          </button>
        </div>

        ${activeLoadoutMode === 'duel' ? panel('Loadout Bos Duel PvP (5 Slot)', `
          <div style="font-size:0.75rem;color:var(--c-muted);margin-bottom:8px">
            Terbuka: <b style="color:var(--c-primary)">${bossLoadout.unlockedCount}/5 Slot</b> · Terbuka 1 slot tiap kelipatan Lv.5. Jurus bos otomatis aktif saat duel!
          </div>
          <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:4px">
            ${(bossLoadout.slots || []).map((s, idx) => `
              <div class="card tc ${s.unlocked ? (s.monster ? 'filled' : 'empty') : 'locked'}" style="padding:6px 2px;border-radius:10px;background:rgba(0,0,0,0.25);border:1px ${s.unlocked ? 'solid rgba(255,255,255,0.15)' : 'dashed rgba(255,255,255,0.08)'}">
                <div style="font-size:1.2rem;margin-bottom:2px">${s.unlocked ? (s.monster ? '👹' : '➕') : '🔒'}</div>
                <div style="font-size:0.65rem;font-weight:700">Slot ${idx + 1}</div>
                <div style="font-size:0.58rem;color:${s.unlocked ? 'var(--c-primary)' : '#ef4444'}">${s.unlocked ? (s.monster ? esc(s.monster.name || 'Bos') : 'Siap') : `Lv. ${s.unlockLevel}`}</div>
              </div>
            `).join('')}
          </div>
        `) : ''}

        <!-- 3 SLOT AKTIF LOADOUT -->
        ${panel(`🎯 Loadout Aktif (${maxSlots} Slot)`, `
          <div style="display:flex;flex-direction:column;gap:8px">
            ${slotIndices.map(idx => {
              const skillId = activeLoadout[idx];
              const sk = skillId ? skillsData.find(x => x.id === skillId) : null;
              const curLv = sk ? (sk.level || 1) : 1;
              const slotSvg = sk ? renderSkillArt(sk.id, curLv, 42, { animated: false }) : '<span style="font-size:1.6rem">➕</span>';

              return `
                <div class="loadout-slot big-slot card ${sk ? 'loadout-slot-row filled' : 'loadout-slot-row'}"
                  data-idx="${idx}"
                  data-testid="loadout-slot-${idx}"
                  role="button"
                  tabindex="0"
                  title="Ketuk untuk ganti taktik skill di Slot #${idx + 1}">
                  <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1">
                    <div style="width:42px;height:42px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                      ${slotSvg}
                    </div>
                    <div style="min-width:0;flex:1">
                      <div style="display:flex;align-items:center;gap:6px">
                        <span class="chip small" style="font-size:0.65rem;padding:1px 6px">Slot ${idx + 1}</span>
                        <strong style="font-size:0.88rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                          ${sk ? esc(sk.name) : '<span style="color:var(--c-muted)">Kosong</span>'}
                        </strong>
                        ${sk ? `<span class="chip small" style="font-size:0.65rem;padding:1px 6px;color:#38bdf8">Lv. ${sk.level}</span>` : ''}
                      </div>
                      <div style="font-size:0.7rem;color:var(--c-muted);margin-top:2px">
                        ${sk ? `⚡ ${sk.costEnergy} energi · 🔄 ${sk.usesPerBattle}× laga` : 'Ketuk untuk memasang skill'}
                      </div>
                    </div>
                  </div>
                  <button class="btn small ghost btn-change-slot" data-idx="${idx}" style="font-size:0.72rem;padding:4px 8px">🔄 Ganti</button>
                </div>
              `;
            }).join('')}
          </div>
        `, 'fill')}
      </div>

      <!-- KOLEKSI 10 SKILL RESMI PETUALANG (SKILLS) -->
      ${(() => {
        const filteredSkills = skillsData.filter(s => {
          const isEquipped = activeLoadout.includes(s.id);
          if (skillStatusFilter === 'equipped' && !isEquipped) return false;
          if (skillStatusFilter === 'standby' && isEquipped) return false;
          if (skillSearchQuery) {
            const q = skillSearchQuery.toLowerCase().trim();
            const matchName = (s.name || '').toLowerCase().includes(q);
            const matchDesc = (s.desc || '').toLowerCase().includes(q) || (s.effectNow || '').toLowerCase().includes(q);
            if (!matchName && !matchDesc) return false;
          }
          return true;
        });

        return panel(`⚡ Koleksi 10 Skill RPG Petualangan (SKILLS)`, `
        <div style="display:flex;flex-direction:column;gap:.5rem;height:100%;overflow:hidden">
          <!-- Control Row: Filter Status & Search -->
          <div style="display:flex;gap:.5rem;align-items:center;flex-shrink:0;padding:0 .2rem">
            <input type="text" id="skill-search-in" placeholder="🔍 Cari nama skill atau efek..." value="${esc(skillSearchQuery)}" class="input" style="flex:1;padding:.4rem .75rem;border-radius:var(--rad-m);background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:.8rem;outline:none">
            <div style="display:flex;gap:4px">
              <button class="btn small btn-skill-status-filter ${skillStatusFilter === 'all' ? 'primary' : 'ghost'}" data-status="all" style="font-size:0.72rem;padding:4px 8px;font-weight:700">Semua (${skillsData.length})</button>
              <button class="btn small btn-skill-status-filter ${skillStatusFilter === 'equipped' ? 'primary' : 'ghost'}" data-status="equipped" style="font-size:0.72rem;padding:4px 8px;font-weight:700">Dipasang (${activeLoadout.filter(Boolean).length})</button>
              <button class="btn small btn-skill-status-filter ${skillStatusFilter === 'standby' ? 'primary' : 'ghost'}" data-status="standby" style="font-size:0.72rem;padding:4px 8px;font-weight:700">Siaga (${skillsData.length - activeLoadout.filter(Boolean).length})</button>
            </div>
          </div>

          <div class="skills-grid" id="skills-cards-list" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:10px;overflow-y:auto;flex:1;min-height:0;padding:.4rem;align-content:start">
            ${filteredSkills.length === 0 ? `<div class="muted tc" style="padding:2.5rem 0;font-weight:700">Tidak ada skill yang cocok dengan pencarian / filter.</div>` : ''}
            ${filteredSkills.map(s => {
              const isEquipped = activeLoadout.includes(s.id);
              const cardLv = s.level || 1;
              const pipsFilled = '●'.repeat(Math.min(5, Math.max(1, cardLv)));
              const pipsEmpty = '○'.repeat(Math.max(0, 5 - cardLv));
              const pipsStr = pipsFilled + pipsEmpty;

              let effectDesc = '';
              if (s.isMax) {
                effectDesc = `<b>Efek:</b> ${esc(s.effectNow)} <span style="color:#10b981;font-weight:700">(Maksimum 🎉)</span>`;
              } else {
                effectDesc = `<b>Efek:</b> ${esc(s.effectNow)}${s.effectNext ? ` <span style="color:var(--c-primary);font-weight:700">→</span> <span style="color:#e2e8f0">${esc(s.effectNext)}</span>` : ''}`;
              }

              const btnLabel = s.isMax ? 'Sudah Maksimum 🎉' : (!s.owned ? 'Belum Terbuka' : `Upgrade — ${s.upgradeCost} 🪙`);
              const skillSvg = renderSkillArt(s.id, cardLv, 44, { animated: false });

              return `
                <div class="card skill-card ${selSkillId === s.id ? 'selected' : ''}" data-testid="skill-card-${s.id}" data-id="${s.id}" style="cursor:pointer;border-color:${selSkillId === s.id ? 'var(--c-primary)' : 'var(--c-surface-strong)'}">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%">
                    <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1">
                      <div class="skill-avatar-btn"
                        data-skill-id="${s.id}"
                        data-testid="skill-avatar-${s.id}"
                        role="button"
                        tabindex="0"
                        style="cursor:pointer;width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:rgba(0,0,0,0.3);border-radius:10px;border:1px solid rgba(255,255,255,0.1)"
                        title="Ketuk avatar untuk melihat detail efek tiap kenaikan level">
                        ${skillSvg}
                      </div>
                      <div class="skill-title-btn" data-skill-id="${s.id}" role="button" tabindex="0" style="cursor:pointer;min-width:0;flex:1" title="Ketuk untuk melihat detail efek tiap kenaikan level">
                        <strong style="color:#fff;font-size:0.92rem;display:flex;align-items:center;gap:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                          ${esc(s.name)} <span style="font-size:0.75rem;color:var(--c-primary);flex-shrink:0">ℹ️</span>
                        </strong>
                        <div style="font-size:0.72rem;color:var(--c-muted);margin-top:2px;display:flex;align-items:center;gap:4px;flex-wrap:wrap">
                          <span data-testid="skill-level-${s.id}" style="color:var(--c-primary);font-weight:700">${pipsStr} Lv ${s.level}/5</span>
                          ${!s.owned ? ` · <span style="color:#ef4444;font-weight:700">Buka di Lv. ${s.unlockLevel || 1}</span>` : ''}
                        </div>
                      </div>
                    </div>
                    <div style="flex-shrink:0">
                      ${isEquipped ? `<span class="chip good" style="font-size:0.68rem;padding:3px 7px;font-weight:700">Dipasang (${activeLoadoutMode === 'duel' ? 'PvP' : 'Petualangan'})</span>` : `<span class="chip secondary" style="font-size:0.68rem;padding:3px 7px;color:var(--c-muted);background:rgba(255,255,255,0.04)">Siaga</span>`}
                    </div>
                  </div>

                  <div style="font-size:0.78rem;color:#cbd5e1;line-height:1.35;background:rgba(0,0,0,0.25);border-radius:8px;padding:6px 9px;border:1px solid rgba(255,255,255,0.05);width:100%;box-sizing:border-box">
                    ${effectDesc}
                  </div>

                  <div style="font-size:0.72rem;color:var(--c-muted);display:flex;justify-content:space-between;align-items:center;width:100%;padding:0 2px">
                    <span>⚡ Biaya: <strong style="color:#fbbf24">${s.costEnergy} energi</strong></span>
                    <span>🔄 Pemakaian: <strong style="color:#38bdf8">${s.usesPerBattle}×</strong>/laga</span>
                  </div>

                  <div style="display:flex;gap:8px;align-items:center;width:100%;margin-top:2px">
                    <button class="btn small grow skill-upgrade-btn ${s.canUpgrade ? 'primary' : 'secondary dimmed'}"
                      data-testid="skill-upgrade-btn-${s.id}"
                      data-id="${s.id}"
                      aria-disabled="${!s.canUpgrade}"
                      style="font-weight:800;font-size:0.76rem;padding:6px 10px;flex:1">
                      ${esc(btnLabel)}
                    </button>
                    ${s.owned && !isEquipped ? `
                      <button class="btn small ghost btn-equip-skill" data-id="${s.id}" style="font-weight:700;font-size:0.76rem;padding:6px 12px;white-space:nowrap">Pasang</button>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `, 'fill');
      })()}

      <div class="col">
        ${panel('Pratinjau Taktik Terpilih', `
          <div class="tc" style="padding:.6rem 0">
            <div style="width:72px;height:72px;margin:0 auto 8px">
              ${renderSkillArt(selSkill.id, selSkill.level, 72, { animated: false })}
            </div>
            <h2 style="margin:0 0 2px;font-size:1.15rem;color:#fff">${esc(selSkill.name)}</h2>
            <div class="muted" style="font-weight:700;font-size:0.78rem">Level ${selSkill.level}/5 · Biaya ${selSkill.costEnergy} ⚡</div>
          </div>
          <div class="kv"><span>Efek Sekarang</span><b>${esc(selSkill.effectNow)}</b></div>
          ${selSkill.effectNext ? `<div class="kv"><span>Efek Lv Berikutnya</span><b style="color:var(--c-primary)">${esc(selSkill.effectNext)}</b></div>` : ''}
          <div class="kv"><span>Biaya Upgrade</span><b style="color:#fbbf24">${selSkill.isMax ? 'Maksimum' : `🪙 ${selSkill.upgradeCost} koin`}</b></div>
          <div class="kv" style="border:0"><span>Status Loadout</span><b>${activeLoadout.includes(selSkill.id) ? 'Aktif Dipasang ✅' : 'Siaga'}</b></div>
          <button class="btn primary block" id="btn-inspect-skill" style="margin-top:10px;font-weight:800">
            📖 Lihat Detail 5 Level
          </button>
        `, 'fill')}

        ${panel('Informasi Energi & Skill', `
          <div class="muted" style="font-size:.78rem;font-weight:700;line-height:1.4">
            Skill aktif memerlukan Energi ⚡ yang dapat dipulihkan saat bertarung. Tingkatkan level skill di layar ini untuk menurunkan biaya energi dan memperkuat efeknya!
          </div>
        `)}
      </div>`;

      // Switch loadout mode
      $$('.btn-loadout-mode', el).forEach(btn => {
        btn.onclick = () => {
          activeLoadoutMode = btn.dataset.mode;
          draw();
        };
      });

      // Skill search input
      const skillIn = $('#skill-search-in', el);
      if (skillIn) {
        skillIn.oninput = () => {
          skillSearchQuery = skillIn.value;
          draw();
          const newIn = $('#skill-search-in', el);
          if (newIn) {
            newIn.focus();
            newIn.selectionStart = newIn.selectionEnd = newIn.value.length;
          }
        };
      }

      // Skill status filter buttons
      $$('.btn-skill-status-filter', el).forEach(btn => {
        btn.onclick = () => {
          skillStatusFilter = btn.dataset.status;
          draw();
        };
      });

      // Change slot button
      $$('.btn-change-slot, .loadout-slot', el).forEach(sl => {
        sl.onclick = () => {
          const slotIdx = parseInt(sl.dataset.idx, 10);
          const currentLoadout = activeLoadoutMode === 'duel' ? duelLoadout : adventureLoadout;
          // Equip currently selected skill or show list
          if (selSkillId && !currentLoadout.includes(selSkillId)) {
            currentLoadout[slotIdx] = selSkillId;
            toast(`Skill ${selSkill.name} dipasang di Slot #${slotIdx + 1}! ✨`);
            draw();
          } else {
            toast('Pilih salah satu skill dari daftar di samping untuk dipasang.');
          }
        };
      });

      // Equip skill button
      $$('.btn-equip-skill', el).forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          const currentLoadout = activeLoadoutMode === 'duel' ? duelLoadout : adventureLoadout;
          // Find first empty or replace last slot
          let emptyIdx = currentLoadout.findIndex(x => !x);
          if (emptyIdx === -1) emptyIdx = 0;
          currentLoadout[emptyIdx] = id;
          const skObj = skillsData.find(x => x.id === id);
          toast(`Skill ${skObj ? skObj.name : id} dipasang di Slot #${emptyIdx + 1}! ✨`);
          draw();
        };
      });

      // Skill card click selects preview
      $$('.skill-card', el).forEach(card => {
        card.onclick = (e) => {
          if (e.target.closest('.skill-upgrade-btn') || e.target.closest('.btn-equip-skill') || e.target.closest('.skill-avatar-btn') || e.target.closest('.skill-title-btn')) return;
          selSkillId = card.dataset.id;
          draw();
        };
      });

      // Skill avatar & title click -> detail modal
      $$('.skill-avatar-btn, .skill-title-btn', el).forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          showSkillDetail(btn.dataset.skillId);
        };
      });

      $('#btn-inspect-skill', el).onclick = () => {
        showSkillDetail(selSkillId);
      };

      // Skill upgrade buttons
      $$('.skill-upgrade-btn', el).forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const skillId = btn.dataset.id;
          const sk = skillsData.find(x => x.id === skillId);
          if (!sk) return;

          const isAriaDisabled = btn.getAttribute('aria-disabled') === 'true';
          if (isAriaDisabled || !sk.canUpgrade) {
            let reasonMsg = 'Skill belum dapat ditingkatkan';
            if (sk.reason === 'NOT_OWNED' || !sk.owned) {
              reasonMsg = 'Skill ini belum kamu miliki';
            } else if (sk.reason === 'MAX_LEVEL' || sk.isMax || sk.level >= 5) {
              reasonMsg = 'Sudah level maksimum 🎉';
            } else if (sk.reason === 'NOT_ENOUGH_COINS' || coins < (sk.upgradeCost || 0)) {
              const kurang = Math.max(1, (sk.upgradeCost || 0) - coins);
              reasonMsg = `Koin belum cukup — kurang ${kurang} 🪙`;
            }
            toast(reasonMsg, 'skill-upgrade-toast');
            return;
          }

          // Active upgrade -> confirm dialog
          const cost = sk.upgradeCost || 0;
          Modal.open(`Tingkatkan Skill`, `
            <div class="tc" style="padding:1rem" data-testid="skill-upgrade-confirm">
              <div style="width:64px;height:64px;margin:0 auto 10px">
                ${renderSkillArt(sk.id, sk.level + 1, 64, { animated: false })}
              </div>
              <h3 style="margin:0 0 6px 0;color:#fff">Upgrade ${esc(sk.name)} ke Lv ${sk.level + 1}?</h3>
              <p class="muted" style="font-size:0.85rem;margin:0 0 14px 0">
                Saldo koin kamu akan dipotong sebesar <b style="color:#fbbf24">🪙 ${cost}</b>.
              </p>
              <div style="display:flex;gap:10px;justify-content:center">
                <button class="btn secondary" data-close>Batal</button>
                <button class="btn primary" id="btn-confirm-upg-skill">Tingkatkan (🪙 ${cost})</button>
              </div>
            </div>`);

          const confirmBtn = $('#btn-confirm-upg-skill');
          if (confirmBtn) {
            confirmBtn.onclick = async () => {
              Modal.close();
              btn.disabled = true;
              btn.textContent = 'Memproses...';
              const idemKey = `upg-${sk.id}-${sk.level + 1}-${Date.now()}`;
              try {
                let upgRes = null;
                if (root.API && typeof root.API.upgradeSkill === 'function') {
                  upgRes = await root.API.upgradeSkill(sk.id, idemKey);
                }
                const newCoins = upgRes?.coins ?? (coins - cost);
                if (root.Player?.data) root.Player.data.coins = newCoins;
                if (root.DesktopShell?.updateTopbar) root.DesktopShell.updateTopbar();
                sk.level = upgRes?.skill?.level || upgRes?.newLevel || (sk.level + 1);
                toast(`Skill ${sk.name} berhasil naik ke Level ${sk.level}! ✨`, 'skill-upgrade-toast');
                draw();
              } catch (err) {
                toast(err.message || 'Gagal upgrade skill', 'skill-upgrade-toast');
                btn.disabled = false;
                btn.textContent = `Upgrade — ${cost} 🪙`;
              }
            };
          }
        };
      });
    };

    draw();
  };

  /* ---------- 12. MONSTER DEX (Paritas 100% Mobile · 3-Pane Cockpit) ---------- */
  DesktopScreens.dex = async el => {
    el.className = 'd-screen dex-screen dex-cockpit';

    let filterOwner = 'all'; // 'all' | 'defeated' | 'encountered' | 'unencountered'
    let filterTheme = 'ALL';
    let filterElement = '';
    let filterTier = '';
    let searchQuery = '';
    let brutalPreview = false;
    let selId = 1;

    let progress = {};
    let monsters = [];

    const B = root.BossSkills;

    // Muat data resmi dari /api/dex
    try {
      if (root.API && typeof root.API.req === 'function') {
        const res = await root.API.req('/api/dex');
        progress = res.progress || {};
        const rawMonsters = res.monsters || (root.Monsters ? root.Monsters.MONSTERS : []);
        const TIER_SEQ = ['common', 'common', 'common', 'common', 'rare', 'rare', 'rare', 'epic', 'epic', 'legend'];
        if (root.Monsters && root.Monsters.MONSTERS) {
          monsters = rawMonsters.map((m, idx) => {
            const full = root.Monsters.MONSTERS.find(x => x.id === m.id) || {};
            const tier = m.tier || full.tier || TIER_SEQ[((m.id || (idx + 1)) - 1) % 10];
            return { ...full, ...m, tier };
          });
        } else {
          monsters = rawMonsters.map((m, idx) => ({
            ...m,
            tier: m.tier || TIER_SEQ[((m.id || (idx + 1)) - 1) % 10]
          }));
        }
      }
    } catch (e) {
      console.error('Failed to load dex:', e);
      progress = {};
      monsters = (root.Monsters && root.Monsters.MONSTERS) ? root.Monsters.MONSTERS : [];
    }

    if (!monsters.length) {
      monsters = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Monster ${i + 1}`,
        theme: HABITATS[i % 10][3] || 'hutan',
        tier: ['common', 'common', 'common', 'common', 'rare', 'rare', 'rare', 'epic', 'epic', 'legend'][i % 10]
      }));
    }

    const totalCount = monsters.length || 100;
    const knownMonsters = monsters.filter(m => Boolean(m.encountered || m.defeated || (m.encounters > 0) || (m.defeats > 0)));
    const totalKnown = knownMonsters.length;
    const totalDefeated = monsters.filter(m => Boolean(m.defeated || (m.defeats > 0))).length;
    const totalStars = monsters.reduce((acc, m) => acc + (m.bestStars || 0), 0);
    const totalUnknown = Math.max(0, totalCount - totalKnown);
    const pct = Math.round((totalKnown / totalCount) * 100);
    const tierCounts = {
      common: monsters.filter(m => (m.tier || 'common').toLowerCase() === 'common').length,
      rare: monsters.filter(m => (m.tier || '').toLowerCase() === 'rare').length,
      epic: monsters.filter(m => (m.tier || '').toLowerCase() === 'epic').length,
      legend: monsters.filter(m => (m.tier || '').toLowerCase() === 'legend').length
    };

    if (knownMonsters.length > 0) {
      selId = knownMonsters[0].id;
    }

    const draw = () => {
      // Filter list monster
      let filtered = monsters.filter(m => {
        const isKnown = Boolean(m.encountered || m.defeated || (m.encounters > 0) || (m.defeats > 0));
        const isDef = Boolean(m.defeated || (m.defeats > 0));

        // Filter Owner
        if (filterOwner === 'defeated' && !isDef) return false;
        if (filterOwner === 'encountered' && !isKnown) return false;
        if (filterOwner === 'unencountered' && isKnown) return false;

        // Filter Theme / Element
        if (filterTheme !== 'ALL' && m.theme !== filterTheme) return false;
        if (filterElement && B && B.elementForTheme(m.theme) !== filterElement) return false;

        // Filter Tier
        if (filterTier && (m.tier || 'common').toLowerCase() !== filterTier.toLowerCase()) return false;

        // Search Query
        if (searchQuery) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = isKnown && m.name.toLowerCase().includes(q);
          const matchId = String(m.id).includes(q) || `#${m.id}`.includes(q);
          if (!matchName && !matchId) return false;
        }

        return true;
      });

      // Monster terpilih untuk inspektor kanan
      const curM = monsters.find(x => x.id === selId) || filtered[0] || monsters[0];
      const isCurKnown = Boolean(curM.encountered || curM.defeated || (curM.encounters > 0) || (curM.defeats > 0));

      const elKey = (B && B.elementForTheme(curM.theme)) || 'nature';
      const elInfo = (B && B.ELEMENTS[elKey]) || { name: 'Alam', icon: '🌿', color: '#22C55E', title: 'Roh Rimba' };
      const mTier = (curM.tier || 'common').toLowerCase();
      const meta = (window.DexCards && DexCards.TIER_META)
        ? (DexCards.TIER_META[mTier] || DexCards.TIER_META.common)
        : { name: RARLBL[mTier] || 'Common', icon: '⚪', color: '#94a3b8' };

      const monsterSkills = (B && B.skillsFor) ? B.skillsFor(elKey, mTier, curM.id) : [];

      // Art render (siluet hitam pekat untuk yang belum ditemukan)
      const curSvg = isCurKnown
        ? renderMonsterArt(curM, 200, { tier: mTier })
        : `<div class="monster-silhouette" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;filter:brightness(0) drop-shadow(0 0 6px rgba(255,255,255,0.25));opacity:0.42;pointer-events:none">
            ${renderMonsterArt(curM, 200, { tier: 'common' })}
           </div>`;

      el.innerHTML = `
      <!-- PANE 1: STATISTIK & FILTER (KIRI) -->
      <div class="col" style="grid-column:1;overflow-y:auto;max-height:100%;display:flex;flex-direction:column;gap:.6rem">
        ${panel('Koleksi 100 monster Elemen', `
          <div class="tc" style="padding:.15rem 0 .35rem">
            <div class="ring" style="--p:${pct};--rc2:#a855f7;width:4.2rem;height:4.2rem;margin:0 auto;font-size:1.05rem"><b>${pct}%</b></div>
            <div style="font-weight:800;font-size:.8rem;margin-top:.2rem">100 monster dalam katalog</div>
            <div class="muted" style="font-size:.65rem;font-weight:700">40 Common · 30 Rare · 20 Epic · 10 Legend</div>
          </div>
          <div class="kv"><span>👁️ Ditemui</span><b style="color:#fff">${totalKnown} / 100</b></div>
          <div class="kv"><span>⚔️ Dikalahkan</span><b style="color:#34d399">${totalDefeated} Bos</b></div>
          <div class="kv"><span>🔒 Belum Terbuka</span><b style="color:#94a3b8">${totalUnknown} Bos</b></div>
          <div class="kv" style="border-bottom:1px dashed rgba(255,255,255,0.1);padding-bottom:5px;margin-bottom:5px"><span>⭐ Total Bintang</span><b style="color:#fbbf24">${totalStars}</b></div>

          <div style="font-size:0.72rem;font-weight:800;color:var(--c-muted);text-transform:uppercase;margin:4px 0 4px">Filter Status Koleksi:</div>
          <div class="dex-filter-pill-group" style="display:grid;grid-template-columns:1fr 1fr;gap:.35rem">
            <button class="dex-status-pill-btn ${filterOwner === 'all' ? 'active' : ''}" data-owner="all">
              <span>Semua</span><b>${totalCount}</b>
            </button>
            <button class="dex-status-pill-btn ${filterOwner === 'defeated' ? 'active' : ''}" data-owner="defeated">
              <span>⚔️ Menang</span><b style="color:#34d399">${totalDefeated}</b>
            </button>
            <button class="dex-status-pill-btn ${filterOwner === 'encountered' ? 'active' : ''}" data-owner="encountered">
              <span>✓ Ditemui</span><b style="color:#38bdf8">${totalKnown}</b>
            </button>
            <button class="dex-status-pill-btn ${filterOwner === 'unencountered' ? 'active' : ''}" data-owner="unencountered">
              <span>🔒 Terkunci</span><b style="color:#94a3b8">${totalUnknown}</b>
            </button>
          </div>
        `, 'dex-panel-stats')}

        ${panel('10 Elemen Habitat', `
          <div class="dex-theme-list">
            <button class="dex-theme-item ${filterTheme === 'ALL' ? 'active' : ''}" data-theme="ALL" data-el="">🌍 Semua</button>
            <button class="dex-theme-item ${filterTheme === 'hutan' ? 'active' : ''}" data-theme="hutan" data-el="nature">🌿 Hutan</button>
            <button class="dex-theme-item ${filterTheme === 'rawa' ? 'active' : ''}" data-theme="rawa" data-el="toxic">☠️ Rawa</button>
            <button class="dex-theme-item ${filterTheme === 'gua' ? 'active' : ''}" data-theme="gua" data-el="earth">🪨 Gua</button>
            <button class="dex-theme-item ${filterTheme === 'api' ? 'active' : ''}" data-theme="api" data-el="fire">🔥 Api</button>
            <button class="dex-theme-item ${filterTheme === 'es' ? 'active' : ''}" data-theme="es" data-el="ice">❄️ Es</button>
            <button class="dex-theme-item ${filterTheme === 'laut' ? 'active' : ''}" data-theme="laut" data-el="water">💧 Air</button>
            <button class="dex-theme-item ${filterTheme === 'langit' ? 'active' : ''}" data-theme="langit" data-el="wind">🌪️ Angin</button>
            <button class="dex-theme-item ${filterTheme === 'hantu' ? 'active' : ''}" data-theme="hantu" data-el="shadow">🌑 Hantu</button>
            <button class="dex-theme-item ${filterTheme === 'mesin' ? 'active' : ''}" data-theme="mesin" data-el="thunder">⚡ Mesin</button>
            <button class="dex-theme-item ${filterTheme === 'manis' ? 'active' : ''}" data-theme="manis" data-el="light">✨ Manis</button>
          </div>

          <div style="font-size:0.72rem;font-weight:800;color:var(--c-muted);text-transform:uppercase;margin:8px 0 4px;border-top:1px dashed rgba(255,255,255,0.08);padding-top:8px">Filter Tingkat Rarity:</div>
          <div class="dex-tier-btn-group" style="display:grid;grid-template-columns:1fr 1fr;gap:.35rem">
            <button class="dex-tier-pill-btn ${filterTier === '' ? 'active' : ''}" data-tier="" style="grid-column:1/-1">
              <span>Semua Rarity</span><b>${totalCount}</b>
            </button>
            <button class="dex-tier-pill-btn ${filterTier === 'common' ? 'active' : ''}" data-tier="common">
              <span style="color:#94a3b8">⚪ Common</span><b>${tierCounts.common || 40}</b>
            </button>
            <button class="dex-tier-pill-btn ${filterTier === 'rare' ? 'active' : ''}" data-tier="rare">
              <span style="color:#38bdf8">🔵 Rare</span><b>${tierCounts.rare || 30}</b>
            </button>
            <button class="dex-tier-pill-btn ${filterTier === 'epic' ? 'active' : ''}" data-tier="epic">
              <span style="color:#c084fc">🟣 Epic</span><b>${tierCounts.epic || 20}</b>
            </button>
            <button class="dex-tier-pill-btn ${filterTier === 'legend' ? 'active' : ''}" data-tier="legend">
              <span style="color:#facc15">🟡 Legend</span><b>${tierCounts.legend || 10}</b>
            </button>
          </div>

          <label style="display:flex;align-items:center;justify-content:space-between;padding:.45rem .7rem;border-radius:var(--rad-m);background:rgba(220,38,38,.12);border:1.5px solid rgba(220,38,38,.35);cursor:pointer;margin-top:.5rem">
            <span style="font-size:.75rem;font-weight:800;color:#ef4444;display:flex;align-items:center;gap:.35rem">💀 Pratinjau Brutal</span>
            <input type="checkbox" id="dex-desktop-brutal" ${brutalPreview ? 'checked' : ''} style="accent-color:#ef4444;width:1rem;height:1rem;cursor:pointer">
          </label>
        `, 'dex-panel-theme')}
      </div>

      <!-- PANE 2: GRID KARTU 100 BOS & KONTROL (TENGAH) -->
      ${panel('Katalog Bos Elemen (' + filtered.length + ')', `
        <div style="display:flex;flex-direction:column;height:100%;gap:.5rem;overflow:hidden">
          <!-- Control Row: Search Box Only (Filter Elemen & Rarity dipindah rapi ke panel samping) -->
          <div style="display:flex;gap:.5rem;align-items:center;flex-shrink:0">
            <input type="text" id="dex-search-in" placeholder="🔍 Cari nama bos atau #ID..." value="${esc(searchQuery)}" class="input" style="width:100%;padding:.45rem .85rem;border-radius:var(--rad-m);background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:.82rem;outline:none">
          </div>

          <!-- Cards List / Grid -->
          <div class="dex-cards-grid-wrap dex-grid dex-cards-list-layout" style="flex:1;min-height:0">
            ${filtered.length === 0 ? `<div class="muted tc" style="grid-column:1/-1;padding:3rem 0;font-weight:700">Tidak ada bos yang cocok dengan filter yang dipilih.</div>` : ''}
            ${filtered.map(m => {
              const isK = Boolean(m.encountered || m.defeated || (m.encounters > 0) || (m.defeats > 0));
              const isD = Boolean(m.defeated || (m.defeats > 0));
              const rKey = (m.tier || 'common').toLowerCase();
              const rColor = rKey === 'legend' ? '#f59e0b' : (rKey === 'epic' ? '#a855f7' : (rKey === 'rare' ? '#3b82f6' : '#94a3b8'));
              const elK = (B && B.elementForTheme(m.theme)) || 'nature';
              const elI = (B && B.ELEMENTS[elK]) || { name: 'Alam', icon: '🌿', color: '#22C55E', title: 'Roh Rimba' };

              const mSkills = (B && B.skillsFor) ? B.skillsFor(elK, rKey, m.id) : [];
              const cardSkills = mSkills.map(sk => {
                const descNormal = B ? B.describeSkill(sk, rKey, false) : { text: sk.name };
                const descBrutal = B ? B.describeSkill(sk, rKey, true) : { text: sk.name };
                return {
                  id: sk.id,
                  name: sk.name,
                  icon: sk.icon || '⚡',
                  desc: brutalPreview ? descBrutal.text : descNormal.text
                };
              });

              let bossDescText = '';
              if (isK) {
                const dexEntry = (B && B.dexEntries) ? B.dexEntries().find(e => e.element === elK && e.tier === rKey) : null;
                bossDescText = (dexEntry && dexEntry.description)
                  ? dexEntry.description
                  : `Penguasa wilayah ${m.theme || 'alam'} bertipe ${elI.name} (${elI.title}). Tangguh di arena laga.`;
              } else {
                bossDescText = 'Karakter bos belum ditemui. Taklukkan simpul petualangan untuk membuka data taktik dan ensiklopedianya.';
              }

              const artSvg = isK
                ? renderMonsterArt(m, 58, { tier: rKey })
                : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;filter:brightness(0) drop-shadow(0 0 2px rgba(255,255,255,0.2));opacity:0.38">${renderMonsterArt(m, 58, { tier: 'common' })}</div>`;

              return `
              <div class="dex-monster-card-desktop dex-card-full ${m.id === selId ? 'selected' : ''} ${isK ? '' : 'locked'}" data-mid="${m.id}" data-testid="dex-card-${m.id}" title="${isK ? esc(m.name) : 'Belum Ditemui'} (#${m.id})">
                <div class="dex-card-top-row">
                  <div class="dex-card-thumb-wrap" style="background:${elI.color}15;border-color:${rColor}66">
                    ${artSvg}
                  </div>
                  <div class="dex-card-main-col">
                    <div class="dex-card-header-line">
                      <div class="dex-card-title-group">
                        <span class="card-num">#${String(m.id).padStart(3, '0')}</span>
                        <b class="card-name">${isK ? esc(m.name) : `??? #${m.id}`}</b>
                        <span class="chip chip-tier" style="font-size:.62rem;font-weight:800;padding:1px 7px;border-radius:99px;background:${rColor}22;color:${rColor};border:1px solid ${rColor}55">${RARLBL[rKey] || 'Common'}</span>
                        <span class="chip chip-el" style="font-size:.62rem;font-weight:800;padding:1px 7px;border-radius:99px;background:${elI.color}22;color:${elI.color};border:1px solid ${elI.color}55">${elI.icon} ${elI.name}</span>
                      </div>
                      <div class="dex-card-status-badge">
                        ${isD ? `<span class="chip" style="font-size:.62rem;font-weight:800;padding:1px 7px;border-radius:99px;background:#10b98122;color:#34d399;border:1px solid #10b98155">⚔️ Menang ${m.defeats || 1}×</span>` : (isK ? `<span class="chip" style="font-size:.62rem;font-weight:800;padding:1px 7px;border-radius:99px;background:#38bdf822;color:#38bdf8;border:1px solid #38bdf855">✓ Ditemui</span>` : `<span class="chip" style="font-size:.62rem;font-weight:800;padding:1px 7px;border-radius:99px;background:#64748b22;color:#94a3b8;border:1px solid #64748b55">🔒 Terkunci</span>`)}
                        ${m.bestStars ? ` <span style="color:#fbbf24;font-size:.7rem">${'⭐'.repeat(m.bestStars)}</span>` : ''}
                      </div>
                    </div>
                    
                    <div class="dex-card-desc">
                      ${esc(bossDescText)}
                    </div>

                    <div class="dex-card-skills-row">
                      <span class="dex-skills-title">⚡ Jurus Bos (${isK ? cardSkills.length : '0'} Skill):</span>
                      <div class="dex-card-skills-list">
                        ${isK ? cardSkills.map(sk => `
                          <div class="dex-mini-skill-chip ${brutalPreview ? 'brutal' : ''}">
                            <span class="sk-ico">${esc(sk.icon)}</span>
                            <b class="sk-name">${esc(sk.name)}:</b>
                            <span class="sk-text">${esc(sk.desc)}</span>
                          </div>
                        `).join('') : `
                          <div class="dex-mini-skill-chip locked">
                            <span class="sk-ico">🔒</span>
                            <b class="sk-name">Jurus Dirahasiakan:</b>
                            <span class="sk-text">Kalahkan bos #${m.id} dalam petualangan untuk membuka taktik jurusnya.</span>
                          </div>
                        `}
                      </div>
                    </div>
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      `, 'fill')}

      <!-- PANE 3: INSPEKTOR TERPADU MENDALAM (KANAN) -->
      <div class="col" style="grid-column:3;display:flex;flex-direction:column;max-height:100%;overflow:hidden">
        ${panel('Inspeksi Detail Bos', `
          <div style="display:flex;flex-direction:column;height:100%;overflow:hidden">
            <!-- Scrollable Content -->
            <div style="flex:1;overflow-y:auto;padding-right:2px;display:flex;flex-direction:column;gap:.6rem">
              <!-- Stage Model 3D Presisi -->
              <div class="preview-stage dex-boss-stage tc" style="width:160px;height:160px;aspect-ratio:1/1;margin:0 auto;flex:none;background:radial-gradient(circle at center, ${esc(elInfo.color)}24 0%, rgba(15,23,42,.85) 75%);border-radius:20px;border:2px solid ${esc(elInfo.color)}44;box-shadow:inset 0 0 20px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden">
                <div style="width:130px;height:130px;margin:0 auto;display:flex;align-items:center;justify-content:center">
                  ${isCurKnown
                    ? renderMonsterArt(curM, 130, { tier: mTier })
                    : `<div class="monster-silhouette" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;filter:brightness(0) drop-shadow(0 0 6px rgba(255,255,255,0.25));opacity:0.42;pointer-events:none">
                        ${renderMonsterArt(curM, 130, { tier: 'common' })}
                       </div>`}
                </div>
              </div>

              <!-- Header Nama & Badge Elemen -->
              <div class="tc" style="margin:.2rem 0 .1rem">
                <h2 style="font-size:1.15rem;font-weight:900;margin:0 0 .3rem;color:#fff">${isCurKnown ? esc(curM.name) : `??? #${curM.id}`}</h2>
                <div style="display:inline-flex;align-items:center;gap:.4rem;padding:3px 10px;border-radius:999px;background:${esc(elInfo.color)}20;color:${esc(elInfo.color)};border:1px solid ${esc(elInfo.color)}55;font-weight:800;font-size:0.75rem">
                  ${esc(elInfo.icon)} Elemen ${esc(elInfo.name)} · ${esc(elInfo.title)}
                </div>
              </div>

              <!-- HUD Stats Matrix Grid (2 Kolom Presisi) -->
              <div class="dex-inspector-stats-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem">
                <div class="dex-stat-tile"><small>Nomor Dex</small><b>#${String(curM.id).padStart(3, '0')}</b></div>
                <div class="dex-stat-tile"><small>Tingkat Rarity</small><b style="color:${meta.color}">${meta.name}</b></div>
                <div class="dex-stat-tile"><small>Habitat</small><b style="text-transform:capitalize">${esc(curM.theme || '-')}</b></div>
                <div class="dex-stat-tile"><small>Rekor Menang</small><b style="color:#34d399">${curM.defeats || (curM.defeated ? 1 : 0)}× Laga</b></div>
                <div class="dex-stat-tile"><small>Ditemui</small><b>${curM.encounters || (isCurKnown ? 1 : 0)}× Pertemuan</b></div>
                <div class="dex-stat-tile"><small>Bintang Rekor</small><b style="color:#fbbf24">${curM.bestStars ? '⭐'.repeat(curM.bestStars) : (isCurKnown ? 'Belum Ada' : 'Terkunci')}</b></div>
              </div>

              <!-- JURUS BOS RESMI (BOSSSKILLS) -->
              <div class="boss-skills-container-desktop">
                <div style="font-size:.82rem;font-weight:800;color:#fff;display:flex;justify-content:space-between;align-items:center;margin-bottom:.2rem">
                  <span>⚡ Jurus Bos ${esc(meta.name)} (${monsterSkills.length} Skill)</span>
                  ${brutalPreview ? `<span style="font-size:.7rem;color:#ef4444;font-weight:800">💀 Mode Brutal</span>` : ''}
                </div>

                ${monsterSkills.length === 0 ? `<div class="muted" style="font-size:.75rem;padding:.4rem 0">Jurus bos belum terdata.</div>` : ''}

                ${monsterSkills.map((sk, idx) => {
                  const tierName = idx === 0 ? 'Common' : (idx === 1 ? 'Rare' : (idx === 2 ? 'Epic' : 'Legend'));
                  const tierBadgeColor = idx === 0 ? '#94a3b8' : (idx === 1 ? '#3b82f6' : (idx === 2 ? '#a855f7' : '#f59e0b'));
                  const descNormal = B ? B.describeSkill(sk, tierName.toLowerCase(), false) : { text: sk.name };
                  const descBrutal = B ? B.describeSkill(sk, tierName.toLowerCase(), true) : { text: sk.name };

                  return `
                  <div class="boss-skill-card-desktop" style="border-left:3px solid ${tierBadgeColor}">
                    <div class="sk-head">
                      <span class="sk-name">${esc(sk.icon)} ${esc(sk.name)}</span>
                      <span class="sk-tier" style="color:${tierBadgeColor};border-color:${tierBadgeColor}55;background:${tierBadgeColor}15">${tierName}</span>
                    </div>
                    <div class="sk-desc">${esc(brutalPreview ? descBrutal.text : descNormal.text)}</div>
                  </div>`;
                }).join('')}
              </div>
            </div>

            <!-- Fixed Bottom Action Button -->
            <div style="flex-shrink:0;padding-top:.6rem;border-top:1px solid rgba(255,255,255,.08);margin-top:.4rem">
              <button class="btn primary lg block" id="btn-challenge-dex-boss" style="width:100%;font-weight:800;box-shadow:0 0 16px rgba(56,189,248,.3)">
                ⚔️ TANTANG ARENA BOS INI <span class="kbd">Enter</span>
              </button>
            </div>
          </div>
        `, 'fill')}
      </div>`;

      // Event Listeners: Search
      const searchIn = $('#dex-search-in', el);
      if (searchIn) {
        searchIn.oninput = () => {
          searchQuery = searchIn.value;
          draw();
          const newIn = $('#dex-search-in', el);
          if (newIn) {
            newIn.focus();
            newIn.selectionStart = newIn.selectionEnd = newIn.value.length;
          }
        };
      }

      // Event Listeners: Status Filter Buttons
      $$('.dex-status-pill-btn', el).forEach(btn => {
        btn.onclick = () => {
          if (root.Sfx) root.Sfx.play('tap');
          filterOwner = btn.dataset.owner;
          draw();
        };
      });

      // Event Listeners: Theme Filter Buttons
      $$('.dex-theme-item', el).forEach(btn => {
        btn.onclick = () => {
          if (root.Sfx) root.Sfx.play('tap');
          filterTheme = btn.dataset.theme;
          filterElement = btn.dataset.el || '';
          draw();
        };
      });

      // Event Listeners: Tier Pill Buttons
      $$('.dex-tier-pill-btn', el).forEach(btn => {
        btn.onclick = () => {
          if (root.Sfx) root.Sfx.play('tap');
          filterTier = btn.dataset.tier || '';
          draw();
        };
      });


      // Event Listeners: Brutal Toggle
      const bToggle = $('#dex-desktop-brutal', el);
      if (bToggle) {
        bToggle.onchange = () => {
          if (root.Sfx) root.Sfx.play('tap');
          brutalPreview = bToggle.checked;
          draw();
        };
      }

      // Event Listeners: Monster Card Selection
      $$('.dex-monster-card-desktop', el).forEach(card => {
        card.onclick = () => {
          if (root.Sfx) root.Sfx.play('tap');
          selId = +card.dataset.mid;
          draw();
        };
      });

      // Event Listeners: Challenge Boss Button
      const btnChallenge = $('#btn-challenge-dex-boss', el);
      if (btnChallenge) {
        btnChallenge.onclick = () => {
          if (root.Screens?.battle?.start) {
            root.Screens.battle.start(root.Player?.data?.classId || 1, {
              campaignNode: `1-${Math.min(10, curM.id)}`,
              brutal: brutalPreview
            });
          } else {
            root.go('peta');
          }
        };
      }

      Keys.set({
        Enter: () => $('#btn-challenge-dex-boss', el)?.click(),
        Escape: () => root.go('home'),
        __noGlobal: true
      });
    };

    draw();
  };

  /* ---------- 13. PROFIL PETUALANG & LENCANA (Asset Asli BadgeArt) ---------- */
  DesktopScreens.showBadgeProgressModal = function(familyId, initialTier, profData) {
    if (root.Sfx) root.Sfx.play('tap');
    const baseFam = (root.Badges?.BADGE_FAMILIES || []).find(x => x.id === familyId);
    const famData = (profData?.badgeFamilies || []).find(x => x.id === familyId) || baseFam;
    if (!baseFam && !famData) return;

    const stats = profData?.stats || root.Player?.data?.stats || {};
    const currentVal = Number(famData?.current ?? stats[baseFam?.statKey || familyId] ?? 0);
    const unit = famData?.unit || baseFam?.unit || '';
    const rawTiers = baseFam?.tiers || famData?.tiers || [];

    const tiers = rawTiers.map(t => {
      const isUnlocked = currentVal >= t.target;
      const isClaimed = Boolean(t.claimed || (profData?.claimedBadgeIds && profData.claimedBadgeIds.includes(`${familyId}_${t.tier.toLowerCase()}`)));
      return {
        ...t,
        unlocked: isUnlocked,
        claimed: isClaimed,
        pct: Math.min(100, Math.round((currentVal / t.target) * 100)),
        remaining: Math.max(0, t.target - currentVal)
      };
    });

    let selectedTier = (initialTier || (tiers.slice().reverse().find(t => t.unlocked)?.tier) || 'COMMON').toUpperCase();

    const modalId = 'desktop-modal-badge-progress';
    const oldModal = document.getElementById(modalId);
    if (oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.className = 'confirm-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;animation:screenIn 0.2s ease;';

    const TIER_COLORS = {
      COMMON: '#f59e0b',
      RARE: '#38bdf8',
      EPIC: '#fb7185',
      LEGEND: '#c084fc'
    };

    const TIER_ICONS = {
      COMMON: '⚪',
      RARE: '🔵',
      EPIC: '🟣',
      LEGEND: '🟡'
    };

    function render(tierCode) {
      selectedTier = (tierCode || 'COMMON').toUpperCase();
      const tObj = tiers.find(x => x.tier === selectedTier) || tiers[0];
      const isUnlocked = tObj.unlocked;
      const isClaimed = tObj.claimed;
      const tColor = TIER_COLORS[selectedTier] || '#f59e0b';
      const isEquipped = (profData?.showcase || []).some(it => it && it.id === `${familyId}_${selectedTier.toLowerCase()}`);

      const badgeSvgBig = renderBadgeArt(familyId, selectedTier.toLowerCase(), 116, { locked: !isUnlocked, animate: true, title: tObj.name });

      overlay.innerHTML = `
        <div class="confirm-card stack" style="width:min(520px,96vw);max-height:90dvh;background:#0b1120;border:1.5px solid ${isUnlocked ? tColor : 'rgba(255,255,255,0.15)'};border-radius:24px;padding:24px;display:flex;flex-direction:column;gap:14px;box-shadow:0 20px 50px rgba(0,0,0,0.85), 0 0 30px ${isUnlocked ? tColor + '33' : 'transparent'};overflow-y:auto;position:relative">
          
          <!-- HEADER -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div style="font-size:0.75rem;font-weight:800;color:var(--c-muted);text-transform:uppercase;letter-spacing:0.5px">
                🏅 ${esc(baseFam?.name || famData?.name || 'Lencana')}
              </div>
              <h2 style="margin:2px 0 0;font-size:1.35rem;font-weight:900;color:#fff">${esc(tObj.name)}</h2>
            </div>
            <button type="button" class="btn ghost small" id="btn-close-progress-modal" style="font-size:1.3rem;padding:2px 10px;border-radius:8px">✕</button>
          </div>

          <!-- 4 TIER SELECTOR TABS -->
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:6px;background:rgba(255,255,255,0.04);padding:5px;border-radius:14px;border:1px solid rgba(255,255,255,0.08)">
            ${tiers.map(tr => {
              const isActive = tr.tier === selectedTier;
              const cColor = TIER_COLORS[tr.tier] || '#f59e0b';
              return `
                <button type="button" class="btn small btn-tier-tab" data-tier="${tr.tier}" style="padding:8px 4px;font-size:0.75rem;font-weight:800;border-radius:10px;background:${isActive ? cColor : 'transparent'};color:${isActive ? '#000' : (tr.unlocked ? '#e2e8f0' : '#64748b')};border:none;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;transition:all .15s ease">
                  <span>${TIER_ICONS[tr.tier]} ${tr.tier}</span>
                  <span style="font-size:0.62rem;font-weight:900;opacity:${isActive ? 0.95 : 0.7}">${tr.unlocked ? '✓ Terbuka' : '🔒 Terkunci'}</span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- SPOTLIGHT SHOWCASE -->
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 0 4px;position:relative">
            <div style="width:130px;height:130px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle, ${isUnlocked ? tColor + '28' : 'rgba(255,255,255,0.03)'} 0%, transparent 70%);border-radius:50%;filter:drop-shadow(0 0 25px ${isUnlocked ? tColor + '55' : 'transparent'})">
              ${badgeSvgBig}
            </div>
            <div style="margin-top:10px;display:flex;align-items:center;gap:8px">
              <span class="tag" style="background:${tColor};color:#000;font-size:0.75rem;font-weight:900;padding:3px 12px;border-radius:99px">
                TIER ${selectedTier}
              </span>
              ${isUnlocked
                ? (isClaimed
                    ? `<span class="tag" style="background:#059669;color:#fff;font-size:0.75rem;font-weight:800;padding:3px 12px;border-radius:99px">HADIAH TERKLAIM ✓</span>`
                    : `<span class="tag" style="background:#f59e0b;color:#000;font-size:0.75rem;font-weight:900;padding:3px 12px;border-radius:99px;box-shadow:0 0 14px #f59e0b">BISA KLAIM 🎁</span>`
                  )
                : `<span class="tag" style="background:#334155;color:#94a3b8;font-size:0.75rem;font-weight:800;padding:3px 12px;border-radius:99px">TERKUNCI 🔒</span>`
              }
            </div>
          </div>

          <!-- PROGRESS & SYARAT -->
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;margin-bottom:8px">
              <span style="color:var(--c-muted);font-weight:700">🎯 Syarat Capaian:</span>
              <strong style="color:#fff;text-align:right">${esc(tObj.desc)}</strong>
            </div>
            <div class="xp-track" style="height:9px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden">
              <div class="xp-fill" style="width:${tObj.pct}%;background:${isUnlocked ? tColor : 'var(--c-primary)'};transition:width .4s ease"></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.78rem;color:var(--c-muted);margin-top:7px">
              <span>Progress: <strong style="color:${isUnlocked ? '#10b981' : '#38bdf8'}">${currentVal} / ${tObj.target} ${unit} (${tObj.pct}%)</strong></span>
              <span style="font-weight:700;color:${isUnlocked ? '#34d399' : '#f59e0b'}">${isUnlocked ? 'Capaian Terpenuhi! ⭐' : `Kurang ${tObj.remaining} ${unit}`}</span>
            </div>
          </div>

          <!-- LORE KISAH PRESTASI -->
          <div style="background:rgba(30, 41, 59, 0.45);border-left:4px solid ${tColor};border-radius:4px 14px 14px 4px;padding:12px 14px">
            <div style="font-size:0.72rem;font-weight:800;color:${tColor};text-transform:uppercase;margin-bottom:4px;letter-spacing:0.5px">
              📜 Kisah Prestasi & Lore
            </div>
            <div style="font-size:0.82rem;color:#cbd5e1;line-height:1.5;font-style:italic">
              "${esc(tObj.lore || 'Dedikasi tinggi dalam petualangan membawamu menorehkan nama di lembaran legenda MI Adventure.')}"
            </div>
          </div>

          <!-- HADIAH CAPAIAN -->
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:12px">
            <span style="font-size:1.6rem">🎁</span>
            <div style="min-width:0;flex:1">
              <div style="font-size:0.7rem;font-weight:800;color:var(--c-muted);text-transform:uppercase">Hadiah Prestise</div>
              <div style="font-size:0.88rem;font-weight:800;color:#fde047">
                ${esc(tObj.reward || '+ Hadiah Koin & XP')}
              </div>
            </div>
          </div>

          <!-- ACTION BUTTONS -->
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:4px">
            ${isUnlocked ? (
              isClaimed ? `
                <div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:10px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);border-radius:12px;color:#10b981;font-size:0.85rem;font-weight:800">
                  <span>✓ Hadiah Telah Berhasil Diklaim</span>
                </div>
              ` : `
                <button type="button" class="btn primary full-width" id="btn-claim-modal-reward" style="background:linear-gradient(135deg, #f59e0b, #eab308);color:#000;font-weight:800;font-size:0.92rem;padding:12px;border-radius:12px;border:none;box-shadow:0 4px 18px rgba(245,158,11,0.45);cursor:pointer">
                  🎁 Klaim Hadiah (${esc(tObj.reward || '+ Koin & XP')})
                </button>
              `
            ) : ''}
            <div style="display:flex;gap:8px">
              ${isUnlocked ? `
                <button type="button" class="btn secondary grow" id="btn-equip-modal-showcase" style="font-size:0.85rem;padding:10px;font-weight:700">
                  ${isEquipped ? '✓ Terpasang di Showcase' : '⭐ Pasang di Showcase'}
                </button>
              ` : ''}
              <button type="button" class="btn ghost small" id="btn-dismiss-progress-modal" style="font-size:0.85rem;padding:10px 18px">Tutup</button>
            </div>
          </div>
        </div>
      `;

      // Wire events
      const close = () => {
        overlay.remove();
        document.removeEventListener('keydown', escHandler);
      };
      const escHandler = e => { if (e.key === 'Escape') close(); };
      document.addEventListener('keydown', escHandler);

      overlay.querySelector('#btn-close-progress-modal').onclick = close;
      overlay.querySelector('#btn-dismiss-progress-modal').onclick = close;

      const claimBtn = overlay.querySelector('#btn-claim-modal-reward');
      if (claimBtn) {
        claimBtn.onclick = async () => {
          claimBtn.disabled = true;
          claimBtn.innerHTML = 'Memproses klaim...';
          try {
            const badgeId = `${familyId}_${selectedTier.toLowerCase()}`;
            const res = await root.API.req('/api/badges/claim', { method: 'POST', body: JSON.stringify({ badgeId }) });
            if (res && res.ok) {
              toast(`🎉 Selamat! Hadiah lencana berhasil diklaim: +${res.coinsAwarded || 0} 🪙, +${res.xpAwarded || 0} XP!`);
              if (root.DesktopShell?.updateTopbar) root.DesktopShell.updateTopbar();
              if (profData?.claimedBadgeIds) profData.claimedBadgeIds.push(badgeId);
              tObj.claimed = true;
              render(selectedTier);
              const host = document.getElementById('d-screen');
              if (host) DesktopScreens.profil(host);
            } else {
              toast('Gagal klaim: ' + (res?.message || 'Terjadi kesalahan'));
              claimBtn.disabled = false;
              claimBtn.innerHTML = `🎁 Klaim Hadiah (${esc(tObj.reward)})`;
            }
          } catch (e) {
            toast('Gagal klaim: ' + e.message);
            claimBtn.disabled = false;
            claimBtn.innerHTML = `🎁 Klaim Hadiah (${esc(tObj.reward)})`;
          }
        };
      }

      const equipBtn = overlay.querySelector('#btn-equip-modal-showcase');
      if (equipBtn) {
        equipBtn.onclick = async () => {
          try {
            const badgeItem = {
              id: `${familyId}_${selectedTier.toLowerCase()}`,
              name: tObj.name,
              icon: tObj.icon,
              tier: selectedTier,
              type: 'badge'
            };
            const current = [...(profData?.showcase || [null, null, null])];
            while (current.length < 3) current.push(null);
            let targetSlot = current.findIndex(x => x === null);
            if (targetSlot === -1) targetSlot = 0;
            current[targetSlot] = badgeItem;
            const res = await root.API.req('/api/profile/showcase', { method: 'POST', body: JSON.stringify({ showcase: current }) });
            if (res && res.ok) {
              profData.showcase = current;
              toast('⭐ Lencana berhasil dipasang di Showcase Panggung Kehormatan!');
              render(selectedTier);
              const host = document.getElementById('d-screen');
              if (host) DesktopScreens.profil(host);
            } else {
              toast('Gagal memasang showcase: ' + (res?.message || 'Terjadi kesalahan'));
            }
          } catch (e) {
            toast('Gagal memasang showcase: ' + e.message);
          }
        };
      }

      overlay.querySelectorAll('.btn-tier-tab').forEach(tabBtn => {
        tabBtn.onclick = () => {
          if (root.Sfx) root.Sfx.play('tap');
          render(tabBtn.dataset.tier);
        };
      });
    }

    overlay.onclick = e => {
      if (e.target === overlay) {
        overlay.remove();
      }
    };

    document.body.appendChild(overlay);
    render(selectedTier);
  };

  DesktopScreens.profil = async el => {
    el.classList.add('g3n', 'profil-cockpit');
    const P = root.Player?.data || {};
    let profData = null;
    let historyData = [];

    try {
      if (root.API) {
        if (typeof root.API.getProfile === 'function') profData = await root.API.getProfile();
        if (typeof root.API.getBattleHistory === 'function') {
          const hRes = await root.API.getBattleHistory(20);
          historyData = hRes.history || hRes.items || hRes || [];
        }
      }
    } catch (_) {}

    // Synchronize to mobile Screens.profil & App namespace
    if (root.Screens?.profil) root.Screens.profil.profileData = profData;
    root.App = root.App || {};
    root.App.showBadgeDetailModal = (id, tier) => DesktopScreens.showBadgeProgressModal(id, tier, profData);

    const p = profData?.player || P;
    const pName = p.nick || p.name || 'Petualang';
    const pLv = p.level || 1;
    const pXp = p.xp || 0;
    const pXpForNext = p.xpForNext || (pLv * 50);
    const pCoins = p.coins ?? (P.coins ?? 0);
    const pGems = p.gems ?? (P.gems ?? 12);
    const pCls = p.className || (p.classId ? `Kelas ${p.classId} SD` : 'Kelas 4 SD');
    const avatarSvg = renderPlayerAvatar(p.avatar || P.avatar, 160);

    const stats = profData?.stats || {};
    const showcase = profData?.showcase || P.showcase || [null, null, null];
    const titles = profData?.titles || P.titles || [null, null, null];
    const badgeSummary = profData?.badgeSummary || { totalUnlocked: 0, totalBadges: 80, unclaimedCount: 0 };
    const badgeFamilies = profData?.badgeFamilies || [];
    const energyMax = p.energyMax || (root.Progression ? root.Progression.energyMaxForLevel(pLv) : (5 + Math.floor(pLv / 5)));

    el.innerHTML = `
    <div class="col">
      ${panel('Identitas Petualang', `
        <div class="tc" style="padding:.6rem 0">
          <div class="hero-avatar-box">
            ${avatarSvg}
          </div>
          <h2 style="margin:.4rem 0 .1rem;font-size:1.3rem;color:#fff">${esc(pName)}</h2>
          <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin:4px 0 8px">
            <span style="color:var(--c-primary);font-weight:800;background:rgba(245,158,11,0.15);padding:2px 8px;border-radius:6px;border:1px solid rgba(245,158,11,0.3);font-size:.78rem">
              Lv. ${pLv}
            </span>
            <span class="muted">·</span>
            <span style="color:#cbd5e1;font-weight:700;font-size:.82rem">${esc(pCls)}</span>
          </div>

          <!-- 3 SLOTS GELAR JUARA -->
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px;margin:6px 0 10px">
            ${[0, 1, 2].map(idx => {
              const t = titles[idx];
              if (!t) return `<span class="title-pill empty">Gelar #${idx + 1}</span>`;
              const tier = (t.tier || 'COMMON').toLowerCase();
              return `<span class="title-pill tier-${tier}">${t.icon || '🏅'} ${esc(t.name)}</span>`;
            }).join('')}
          </div>

          ${bar(Math.min(100, Math.round(((pXp % 100) / 100) * 100)), 'xp lg', `XP ${pXp} (${pXp % 100}%)`)}
        </div>

        <div class="kv">
          <span>Kapasitas Energi</span>
          <b style="color:#38bdf8">⚡ ${energyMax} per battle</b>
        </div>
        <div class="kv">
          <span>Saldo Koin Emas</span>
          <b style="color:#fde047;font-size:1.05rem">🪙 ${pCoins.toLocaleString('id-ID')}</b>
        </div>
        <div class="kv">
          <span>Permata Mistis</span>
          <b style="color:#38bdf8;font-size:1.05rem">💎 ${pGems}</b>
        </div>
        <div class="kv" style="border:0">
          <span>Gelar Kehormatan</span>
          <b>${esc(p.title || 'Petualang Cerdas')}</b>
        </div>
        <button class="btn block ghost" data-go="wardrobe" style="margin-top:8px;font-weight:700">
          🎒 Buka Lemari Kostum
        </button>
      `, 'fill')}
    </div>

    ${panel('Prestasi & Statistik Petualangan', `
      <div style="display:flex;flex-direction:column;gap:12px;height:100%;overflow-y:auto;padding:.2rem .4rem">
        <!-- PANGGUNG KEHORMATAN (SHOWCASE 3 SLOT LENCANA) -->
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-size:0.8rem;font-weight:800;color:var(--c-muted);text-transform:uppercase;letter-spacing:0.5px">
              ✨ Panggung Kehormatan (Showcase)
            </span>
            <span style="font-size:0.75rem;color:var(--c-primary);font-weight:700">3 Lencana Terbaik</span>
          </div>
          <div class="showcase-grid">
            ${[0, 1, 2].map(slotIdx => {
              const item = showcase[slotIdx];
              if (!item) {
                return `
                  <div class="showcase-slot" data-slot="${slotIdx}">
                    <div style="font-size:1.4rem;opacity:0.4">➕</div>
                    <b style="font-size:0.75rem;margin-top:4px">Slot #${slotIdx + 1}</b>
                    <small class="muted" style="font-size:0.65rem">Belum dipasang</small>
                  </div>`;
              }
              const tierClass = item.tier ? `tier-${item.tier.toLowerCase()}` : 'tier-rare';
              const badgeSvg = renderBadgeArt(item.id || item.familyId, item.tier || 'rare', 48, { animate: true, title: item.name });
              return `
                <div class="showcase-slot ${tierClass}" data-slot="${slotIdx}" data-badge-id="${item.id || item.familyId || ''}" title="${esc(item.name)} (Klik untuk inspeksi detail)">
                  <div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center">${badgeSvg}</div>
                  <b style="font-size:0.78rem;font-weight:800;color:#fff;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:95%">${esc(item.name)}</b>
                  <span class="tag ${tierClass}" style="font-size:0.6rem;text-transform:uppercase">${esc(item.tier || 'BADGE')}</span>
                </div>`;
            }).join('')}
          </div>
        </div>

        <!-- 10 STATISTIK LENGKAP -->
        <div>
          <div style="font-size:0.8rem;font-weight:800;color:var(--c-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">
            📊 Statistik Petualangan Lengkap
          </div>
          <div class="profile-stat-grid">
            <div class="profile-stat-box">
              <span class="stat-icon">⚔️</span>
              <span class="stat-val">${stats.bossDefeated || 0}</span>
              <span class="stat-label">Bos Tumbang</span>
            </div>
            <div class="profile-stat-box">
              <span class="stat-icon">⭐</span>
              <span class="stat-val">${stats.stars || 0}</span>
              <span class="stat-label">Total Bintang</span>
            </div>
            <div class="profile-stat-box">
              <span class="stat-icon">🔥</span>
              <span class="stat-val">${stats.bestStreak || 0}×</span>
              <span class="stat-label">Rekor Kombo</span>
            </div>
            <div class="profile-stat-box">
              <span class="stat-icon">🎯</span>
              <span class="stat-val">${stats.accuracy || 0}%</span>
              <span class="stat-label">Akurasi Soal</span>
            </div>
            <div class="profile-stat-box">
              <span class="stat-icon">🏆</span>
              <span class="stat-val">${stats.winRate || 0}%</span>
              <span class="stat-label">Rasio Menang</span>
            </div>
            <div class="profile-stat-box">
              <span class="stat-icon">💀</span>
              <span class="stat-val">${stats.brutalWins || 0}</span>
              <span class="stat-label">Menang Brutal</span>
            </div>
            <div class="profile-stat-box">
              <span class="stat-icon">🤺</span>
              <span class="stat-val">${stats.duelWins || 0}</span>
              <span class="stat-label">Menang Duel</span>
            </div>
            <div class="profile-stat-box">
              <span class="stat-icon">⚡</span>
              <span class="stat-val">${stats.criticalCount || 0}</span>
              <span class="stat-label">Jawaban Kritis</span>
            </div>
            <div class="profile-stat-box">
              <span class="stat-icon">📖</span>
              <span class="stat-val">${stats.dexDefeated || 0} / 100</span>
              <span class="stat-label">Monster Dex</span>
            </div>
            <div class="profile-stat-box">
              <span class="stat-icon">📅</span>
              <span class="stat-val">${stats.activeDays || P.dayStreak || 1} Hari</span>
              <span class="stat-label">Hari Belajar</span>
            </div>
          </div>
        </div>

        <!-- 20 KELUARGA LENCANA PRESTASI -->
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-size:0.8rem;font-weight:800;color:var(--c-muted);text-transform:uppercase;letter-spacing:0.5px">
              🏅 Koleksi 20 Lencana (${badgeSummary.totalUnlocked || 0} / 80 Terbuka)
            </span>
            <button class="btn sm primary" id="btn-claim-all-badges" style="font-weight:800;font-size:0.75rem">
              🎁 Klaim Semua Hadiah
            </button>
          </div>
          <div class="badge-grid showcase profile-badge-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:.2rem 0">
            ${BADGE_FAMILIES.map(b => {
              const baseFam = (root.Badges?.BADGE_FAMILIES || []).find(x => x.id === b.id) || b;
              const famData = badgeFamilies.find(x => x.id === b.id) || baseFam;
              const statsVal = Number(famData.current ?? stats[baseFam.statKey || b.id] ?? 0);
              const curTier = famData?.highestTier || famData?.highestUnlockedTier || (famData?.unlockedTiers && famData.unlockedTiers[0]) || 'common';
              const isLocked = !famData || (!famData.unlockedCount && (!famData.unlockedTiers || famData.unlockedTiers.length === 0));
              const badgeSvg = renderBadgeArt(b.id, isLocked ? 'common' : curTier.toLowerCase(), 68, { locked: isLocked, animate: true, title: b.name });
              const unclaimedCount = famData?.unclaimedCount || 0;

              // Hitung target & progres visual mini bar
              const tiersList = baseFam.tiers || famData.tiers || [];
              let targetVal = 1;
              const nextTierObj = tiersList.find(t => statsVal < t.target);
              if (nextTierObj) {
                targetVal = nextTierObj.target;
              } else if (tiersList.length > 0) {
                targetVal = tiersList[tiersList.length - 1].target;
              }
              const progressPct = Math.min(100, Math.round((statsVal / targetVal) * 100));
              const unit = baseFam.unit || famData.unit || '';
              const progressStr = `${statsVal} / ${targetVal} ${unit}`.trim();

              const tierColors = {
                common: '#f59e0b',
                rare: '#38bdf8',
                epic: '#fb7185',
                legend: '#c084fc'
              };
              const activeColor = isLocked ? '#94a3b8' : (tierColors[curTier.toLowerCase()] || '#f59e0b');

              return `
                <div class="slot rar-${curTier.toLowerCase()} badge-item profile-badge-card ${isLocked ? 'is-locked' : ''}" data-family-id="${b.id}" data-cur-tier="${curTier}" title="${esc(b.name)} - ${esc(b.desc)} (Klik untuk lihat progres)">
                  ${unclaimedCount > 0 ? `<span class="profile-badge-gift-chip">🎁 ${unclaimedCount}</span>` : ''}
                  <div class="profile-badge-icon-box" style="background:radial-gradient(circle, ${activeColor}22 0%, transparent 72%)">
                    ${badgeSvg}
                  </div>
                  <b class="profile-badge-title">${esc(b.name)}</b>
                  <span class="tag rar-${curTier.toLowerCase()}" style="font-size:.6rem;padding:2px 8px;border-radius:99px;font-weight:900">
                    ${isLocked ? 'Terkunci 🔒' : ('Tier ' + curTier.toUpperCase())}
                  </span>
                  <div class="profile-badge-progress-wrap">
                    <div class="profile-badge-stat-text">
                      <span>Progres</span>
                      <span style="color:${activeColor}">${progressPct}%</span>
                    </div>
                    <div class="profile-badge-track">
                      <div class="profile-badge-fill" style="width:${progressPct}%;background:${activeColor}"></div>
                    </div>
                    <div class="profile-badge-stat-text" style="font-size:0.6rem;opacity:0.85">
                      <span>${esc(progressStr)}</span>
                      <span>${isLocked ? '🔒' : (progressPct >= 100 && !nextTierObj ? '⭐ MAX' : '▸')}</span>
                    </div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `, 'fill')}

    <div class="col">
      ${panel('Riwayat Pertempuran Terkini', `
        <div class="history-list" style="display:flex;flex-direction:column;gap:.5rem;overflow-y:auto;max-height:34rem;padding:.2rem">
          ${historyData.length === 0 ? `
            <div class="kv"><span>Sesi Latihan Terkini</span><b style="color:#22c55e">Selesai ⭐⭐⭐</b></div>
            <div class="kv"><span>Tantangan Harian</span><b style="color:#22c55e">Menang +40 XP</b></div>
            <div class="muted tc" style="font-size:.75rem;padding:8px">Belum ada riwayat pertempuran terekam.</div>
          ` : historyData.map(h => {
            const isWin = Boolean(h.won);
            const starsStr = h.stars > 0 ? '⭐'.repeat(h.stars) : '';
            const bId = h.id || h.sessionId || '';
            return `
              <div class="history-row" style="display:flex;flex-direction:column;gap:3px;padding:8px 10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <b style="color:#fff;font-size:0.82rem">${esc(h.bossName || h.subjectName || h.mode || 'Pertempuran')}</b>
                  <span style="font-size:0.75rem;font-weight:800;color:${isWin ? '#34d399' : '#f87171'}">
                    ${isWin ? 'MENANG ' + starsStr : 'KALAH'}
                  </span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.7rem;color:var(--c-muted)">
                  <span>Akurasi: ${h.accuracy || Math.round(((h.correct || 0) / (h.total || 10)) * 100)}% (${h.correct || 0}/${h.total || 10})</span>
                  ${bId ? `
                    <button class="btn ghost sm" onclick="window.App?.copyBattleId ? window.App.copyBattleId('${bId}') : prompt('ID Battle:', '${bId}')" style="padding:1px 6px;font-size:0.65rem">
                      📋 #${String(bId).slice(-6)}
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `, 'fill')}
    </div>`;

    // Event Listeners: Klik Lencana untuk Buka Modal Progres Interaktif
    el.querySelectorAll('.badge-item').forEach(itemEl => {
      itemEl.onclick = () => {
        const famId = itemEl.dataset.familyId;
        const curTier = itemEl.dataset.curTier;
        DesktopScreens.showBadgeProgressModal(famId, curTier, profData);
      };
    });

    // Event Listeners: Klik Showcase Slot
    el.querySelectorAll('.showcase-slot').forEach(slotEl => {
      slotEl.onclick = () => {
        const slotIdx = Number(slotEl.dataset.slot);
        const item = showcase[slotIdx];
        if (item && (item.id || item.familyId)) {
          const parts = (item.id || item.familyId).split('_');
          const tier = item.tier || (parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'COMMON');
          const famId = parts.length > 1 && /^(common|rare|epic|legend)$/i.test(parts[parts.length - 1])
            ? parts.slice(0, parts.length - 1).join('_')
            : (item.familyId || item.id);
          DesktopScreens.showBadgeProgressModal(famId, tier, profData);
        } else {
          toast('Pilih salah satu lencana di bawah untuk dipasang di showcase!');
        }
      };
    });

    // Event Listener: Klaim Semua Hadiah Lencana
    $('#btn-claim-all-badges', el).onclick = async () => {
      if (root.API && typeof root.API.req === 'function') {
        try {
          const res = await root.API.req('/api/badges/claim-all', { method: 'POST' });
          if (res?.claimedCount > 0) {
            toast(`🎉 Berhasil klaim ${res.claimedCount} hadiah lencana!`);
            if (root.DesktopShell?.updateTopbar) root.DesktopShell.updateTopbar();
            DesktopScreens.profil(el);
          } else {
            toast('Semua hadiah lencana sudah diklaim.');
          }
        } catch (e) { toast('Klaim gagal: ' + e.message); }
      } else {
        toast('🎉 Hadiah lencana berhasil diklaim!');
      }
    };
  };

  /* ---------- 14. LAPORAN BELAJAR MINGGUAN ---------- */
  DesktopScreens.report = async el => {
    el.classList.add('g3n');
    let rep = null;

    try {
      if (root.API && typeof root.API.getWeeklyReport === 'function') {
        const res = await root.API.getWeeklyReport();
        if (res && res.report) rep = res.report;
      }
    } catch (_) {}

    const s = rep?.summary || {};
    const acc = s.accuracy ?? 0;
    const answered = s.answered ?? 0;
    const correct = s.correct ?? 0;
    const minutes = s.minutes ?? 0;
    const sessions = s.sessions ?? 0;
    const activeDays = s.activeDays ?? 0;
    const bossDefeated = s.bossDefeated ?? 0;

    // Daily breakdown for 7 days
    const dailyData = Array.isArray(rep?.daily) ? rep.daily : [];
    const days = [0, 1, 2, 3, 4, 5, 6].map(i => {
      const d = dailyData[i];
      if (!d) return 0;
      return d.accuracy ?? (d.answered > 0 ? Math.round((d.correct / d.answered) * 100) : 0);
    });

    // Topic mastery: use abilities or masteredTopics or weakTopics
    const abilities = rep?.abilities || [];
    const weakList = rep?.weakTopics || [];
    const masteredList = rep?.masteredTopics || [];

    let topicsHtml = '';
    if (abilities.length > 0) {
      topicsHtml = abilities.slice(0, 4).map(ab => {
        const aVal = ab.accuracy ?? (ab.level ? Math.min(100, ab.level * 20) : 50);
        return `<div><div style="display:flex;justify-content:space-between;font-size:.8rem;font-weight:800"><span>${esc(ab.subjectName || ab.name || 'Mata Pelajaran')}</span><span>${aVal}%</span></div>${bar(aVal, aVal >= 70 ? 'good' : 'bad')}</div>`;
      }).join('');
    } else if (masteredList.length > 0 || weakList.length > 0) {
      const allT = [...masteredList, ...weakList].slice(0, 4);
      topicsHtml = allT.map(t => {
        const aVal = t.accuracy ?? 50;
        return `<div><div style="display:flex;justify-content:space-between;font-size:.8rem;font-weight:800"><span>${esc(t.subject ? `${t.subject} · ${t.topic}` : t.topic)}</span><span>${aVal}%</span></div>${bar(aVal, aVal >= 70 ? 'good' : 'bad')}</div>`;
      }).join('');
    } else {
      topicsHtml = `<div class="muted tc" style="font-size:.8rem;padding:1rem 0">Belum ada aktivitas belajar yang terekam minggu ini. Ayo mulai bertualang!</div>`;
    }

    const topWeak = weakList[0];
    const weakBoxHtml = topWeak
      ? `🔴 Titik Lemah Terdeteksi:<br><b>${esc(topWeak.subject ? `${topWeak.subject} · ${topWeak.topic}` : topWeak.topic)} (${topWeak.accuracy}% dari ${topWeak.attempts || 1} soal)</b>
         <div class="muted" style="font-size:.75rem;margin-top:.4rem">Disarankan latihan 5 soal kilat untuk memantapkan pemahaman konsep ini.</div>`
      : (answered > 0
        ? `✨ Pemahaman Luar Biasa:<br><b>Tidak ada titik lemah kritis!</b>
           <div class="muted" style="font-size:.75rem;margin-top:.4rem">Pertahankan akurasi belajarmu di atas rata-rata!</div>`
        : `🎒 Belum Ada Data Mingguan:<br><b>Mulai petualangan belajar sekarang</b>
           <div class="muted" style="font-size:.75rem;margin-top:.4rem">Selesaikan kuis latihan atau hadapi bos wilayah untuk mencatat progres.</div>`);

    el.innerHTML = `
    <div class="col">
      ${panel('Ringkasan Mingguan', `
        <div class="tc" style="padding:1rem 0">
          <div class="ring" style="--p:${acc};--rc2:${acc >= 70 ? '#22c55e' : '#f59e0b'};width:8rem;height:8rem;margin:0 auto;font-size:1.8rem"><b id="rep-acc-val">${acc}%</b></div>
          <div class="muted" style="font-weight:700;margin-top:.6rem">Rata-rata Akurasi</div>
        </div>
        <div class="kv"><span>Total Terjawab</span><b>${answered} Soal</b></div>
        <div class="kv"><span>Jawaban Benar</span><b>${correct} Soal</b></div>
        <div class="kv"><span>Waktu Belajar</span><b>${minutes} Menit</b></div>
        <div class="kv"><span>Hari Aktif</span><b>${activeDays} / 7 Hari</b></div>
        <div class="kv" style="border:0"><span>Bos Ditumbangkan</span><b>${bossDefeated} Bos</b></div>
      `, 'fill')}
    </div>

    ${panel('Grafik & Penguasaan Topik', `
      <div style="padding:.6rem">
        <h4 style="margin:0 0 .5rem">Aktivitas 7 Hari Terakhir</h4>
        <div class="chart week-bars" style="height:6rem;margin-bottom:1.5rem">
          ${days.map((d, i) => `<i class="${i === 6 ? 'today' : ''}" style="height:${Math.max(8, d)}%" title="Hari ${i + 1}: ${d}%"></i>`).join('')}
        </div>

        <h4 style="margin:0 0 .5rem">Penguasaan Topik Pelajaran</h4>
        <div style="display:flex;flex-direction:column;gap:.6rem">
          ${topicsHtml}
        </div>
      </div>
    `, 'fill')}

    <div class="col">
      ${panel('Titik Lemah & Rekomendasi', `
        <div class="weak" style="padding:.8rem;font-size:.85rem;font-weight:700;margin-bottom:1rem;border-radius:var(--rad-s);background:${topWeak ? 'rgba(239,68,68,.12)' : 'rgba(56,189,248,.1)'};border:1px solid ${topWeak ? 'rgba(239,68,68,.3)' : 'rgba(56,189,248,.3)'}">
          ${weakBoxHtml}
        </div>
        <button class="btn primary lg block" data-go="latihan" style="margin-bottom:.6rem">🎯 Latih Topik Ini Sekarang</button>
        <button class="btn ghost lg block" id="btn-desktop-share-report">🔗 Bagikan Tautan Rapor (/r/)</button>
      `, 'fill')}
    </div>`;

    const shareBtn = $('#btn-desktop-share-report', el);
    if (shareBtn) {
      shareBtn.onclick = async () => {
        if (root.API && typeof root.API.req === 'function') {
          try {
            const res = await root.API.req('/api/report/share', { method: 'POST' });
            const url = res?.url || (window.location.origin + '/r/' + (res?.token || 'preview'));
            if (navigator.clipboard) {
              await navigator.clipboard.writeText(url);
              toast('🔗 Tautan Rapor berhasil disalin ke clipboard!');
            } else {
              prompt('Salin tautan rapor publik:', url);
            }
          } catch (e) {
            toast('Gagal membagikan rapor: ' + e.message);
          }
        } else {
          toast('🔗 Tautan rapor publik: ' + window.location.origin + '/r/demo');
        }
      };
    }
  };

  /* ---------- 15. PENGATURAN ---------- */
  DesktopScreens.settings = el => {
    el.classList.add('g3n');
    const curPref = (root.UIMode && typeof root.UIMode.pref === 'function') ? root.UIMode.pref() : 'auto';

    el.innerHTML = `
    <div class="col">
      ${panel('Tampilan & Mode UI', `
        <div style="display:flex;flex-direction:column;gap:.6rem;padding:.4rem 0">
          <label style="font-weight:800;font-size:.85rem">Pilih Mode UI:</label>
          <button class="btn ${curPref === 'auto' ? 'primary' : 'ghost'} block opt-ui-mode" data-m="auto">Mode UI: Otomatis (Rekomendasi)</button>
          <button class="btn ${curPref === 'desktop' ? 'primary' : 'ghost'} block opt-ui-mode" data-m="desktop">Paksa Desktop 16:9 Cockpit</button>
          <button class="btn ${curPref === 'mobile' ? 'primary' : 'ghost'} block opt-ui-mode" data-m="mobile">Paksa Mobile Mode</button>
        </div>
        <div class="muted" style="font-size:.75rem;font-weight:700;margin-top:.8rem;line-height:1.4">
          Mode Desktop didesain khusus untuk monitor PC/Laptop dengan tata letak satu pandangan tanpa scrolling.
        </div>
      `, 'fill')}
    </div>

    ${panel('Audio & Aksesibilitas', `
      <div style="display:flex;flex-direction:column;gap:.8rem;padding:.6rem 0">
        <div class="kv"><span>Efek Suara (SFX)</span><button class="btn sm" id="btn-toggle-sfx">🔊 Nyala</button></div>
        <div class="kv"><span>Musik Latar (BGM)</span><button class="btn sm" id="btn-toggle-bgm">🎵 Nyala</button></div>
        <div class="kv"><span>Narator Soal (TTS)</span><b>Pencet Spasi di Battle</b></div>
        <div class="kv" style="border:0"><span>Resolusi Layar</span><b>16:9 Fluid Auto-Scale</b></div>
      </div>
    `, 'fill')}

    <div class="col">
      ${panel('Akun & Pintasan', `
        <div class="kv"><span>Pemain Aktif</span><b>${esc(root.Player?.data?.nick || root.Player?.data?.name || 'Petualang')}</b></div>
        <div class="kv"><span>Papan Pintas Keyboard</span><button class="btn sm" onclick="DesktopShell.keysHelp()">Buka (?)</button></div>
        <div class="kv"><span>Menu Guru / Admin</span><button class="btn sm primary" data-act="admin">🛡️ Buka</button></div>
        <div class="kv" style="border:0"><span>Keluar Akun</span><button class="btn sm ghost" data-act="logout">🚪 Keluar</button></div>
      `, 'fill')}
    </div>`;

    $$('.opt-ui-mode', el).forEach(b => {
      b.onclick = () => {
        const m = b.dataset.m;
        if (root.UIMode && typeof root.UIMode.setPref === 'function') {
          root.UIMode.setPref(m);
        }
      };
    });

    $('#btn-toggle-sfx', el).onclick = () => {
      if (root.Sfx && typeof root.Sfx.toggleSound === 'function') root.Sfx.toggleSound();
      toast('Pengaturan suara diperbarui');
    };
  };

  root.DesktopScreens = DesktopScreens;
})(window);
