/* =====================================================================
   public/js/desktop/core.js — Deteksi mode, shell (top bar + rail), router, shortcut, UI kit
   Petualangan Pelajar · Desktop Mode (Single-Viewport Cockpit)
   ===================================================================== */

(function (root) {
  'use strict';

  /* ---------- 1. Deteksi & pemilih mode UI ---------- */
  const UIMode = {
    MIN_W: 1280,
    MIN_H: 720,
    _m: null,
    pref() {
      try {
        return localStorage.getItem('ui_mode') || 'auto';
      } catch (_) {
        return 'auto';
      }
    },
    setPref(v) {
      try {
        localStorage.setItem('ui_mode', v);
        if (root.API && typeof API.saveSettings === 'function') {
          API.saveSettings({ ui_mode: v }).catch(() => {});
        }
      } catch (_) {}
      this.apply(true);
    },
    detect() {
      const fine = (typeof matchMedia === 'function')
        ? (matchMedia('(pointer:fine)').matches && matchMedia('(hover:hover)').matches)
        : true;
      const w = root.innerWidth || 1280;
      const h = root.innerHeight || 720;
      return (w >= this.MIN_W && h >= this.MIN_H && (w / h) >= 1.25 && fine) ? 'desktop' : 'mobile';
    },
    current() {
      const p = this.pref();
      return p === 'auto' ? this.detect() : p;
    },
    apply(force) {
      const m = this.current();
      if (m === this._m && !force) return m;
      this._m = m;
      document.documentElement.dataset.ui = m;

      const cssMobile = document.getElementById('css-mobile');
      if (cssMobile) cssMobile.disabled = (m !== 'mobile');

      const cssDesktop = document.getElementById('css-desktop');
      if (cssDesktop) cssDesktop.disabled = (m !== 'desktop');

      // Update d-guard UI if present
      const guard = document.getElementById('d-guard');
      if (guard && m === 'desktop') {
        const tooSmall = (root.innerWidth < this.MIN_W || root.innerHeight < this.MIN_H);
        guard.style.display = tooSmall ? 'grid' : 'none';
      } else if (guard) {
        guard.style.display = 'none';
      }

      if (root.Screens && root.Screens.current && typeof root.go === 'function') {
        root.go(root.Screens.current, root.Screens._params || {});
      }
      return m;
    },
    init() {
      let t;
      root.addEventListener('resize', () => {
        clearTimeout(t);
        t = setTimeout(() => this.apply(), 150);
      });
      this.apply(true);
    }
  };

  /* ---------- 2. Helper kecil & DOM ---------- */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sv = (sym, cls = '') => `<svg class="sv ${cls}" viewBox="0 0 200 200" aria-hidden="true"><use href="#${sym}"/></svg>`;
  const bar = (pct, cls = '', label = '') => `<div class="bar ${cls}"><i style="width:${Math.max(0, Math.min(100, pct))}%"></i>${label ? `<span class="t">${label}</span>` : ''}</div>`;
  const panel = (title, body, cls = '', more = '', go_ = '') =>
    `<section class="panel ${cls} ${go_ ? 'link' : ''}" ${go_ ? `data-go="${go_}"` : ''}>${title ? `<h3><span>${title}</span>${more ? `<span class="more">${more}</span>` : ''}</h3>` : ''}${body}</section>`;

  function toast(msg, ms = 2200) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'show';
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.className = ''; }, ms);
  }

  const Modal = {
    open(title, html) {
      this.close();
      const o = document.createElement('div');
      o.className = 'modal-overlay';
      o.id = 'common-modal';
      o.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true"><h3><span>${title}</span><button class="icon-btn" data-close>✕</button></h3>${html}</div>`;
      o.addEventListener('click', e => {
        if (e.target === o || e.target.closest('[data-close]')) this.close();
      });
      document.body.appendChild(o);
    },
    close() {
      $('#common-modal')?.remove();
    }
  };

  /* ---------- 3. Papan pintas keyboard ---------- */
  const Keys = {
    scope: {},
    global: {},
    set(map) { this.scope = map || {}; },
    init() {
      if (this._inited) return;
      this._inited = true;
      root.addEventListener('keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
        const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (typing && k !== 'Escape' && k !== 'Enter') return;
        const fn = this.scope[k] || (!this.scope.__noGlobal && this.global[k]);
        if (fn) {
          e.preventDefault();
          fn(e);
        }
      });
    }
  };

  /* ---------- 4. Shell desktop ---------- */
  const NAV = [
    ['home', '🏠', 'Beranda', '1'],
    ['peta', '⚔️', 'Petualangan', '2'],
    ['latihan', '📚', 'Latihan', '3'],
    ['profil', '👤', 'Profil', '4'],
    ['wardrobe', '🎒', 'Skin', '5'],
    ['skill', '⚡', 'Skill', '6'],
    ['dex', '📖', 'Monsterdex', '7'],
    ['friends', '👥', 'Pertemanan', '8'],
    ['shop', '🛒', 'Toko', '9'],
    ['report', '📊', 'Laporan', '0'],
    ['settings', '⚙️', 'Pengaturan', '-']
  ];

  const TITLES = {
    home: 'Beranda Petualang',
    peta: 'Petualangan (Lawan Bos)',
    friends: 'Pertemanan (Duel & Teman)',
    latihan: 'Latihan (Bebas Waktu)',
    report: 'Laporan Mingguanku',
    profil: 'Profil (Stat & Gelar)',
    wardrobe: 'Skin (Kustom Avatar)',
    skin: 'Skin (Kustom Avatar)',
    skill: 'Skill RPG (10 Taktik Laga)',
    shop: 'Toko (Kotak & Item)',
    dex: 'Monsterdex (100 Monster)',
    duel: 'Arena Duel 1v1',
    settings: 'Pengaturan (Suara & Akun)'
  };

  const FOCUS = new Set(['auth', 'battle', 'duel', 'result']); // layar tanpa top bar & rail

  const DesktopShell = {
    inviteCount: 0,

    async checkInvites() {
      if (!root.API || typeof root.API.req !== 'function') return;
      try {
        const res = await root.API.req('/api/duels/invites');
        this.inviteCount = res.invites?.length || 0;
        const b = document.getElementById('rail-badge-friends');
        if (b) {
          b.textContent = this.inviteCount;
          b.style.display = this.inviteCount > 0 ? 'inline-block' : 'none';
        }
        const bHome = document.getElementById('friends-home-badge');
        if (bHome) {
          bHome.textContent = this.inviteCount;
          bHome.style.display = this.inviteCount > 0 ? 'inline-block' : 'none';
        }
      } catch (_) {}
    },

    topbar(P = {}) {
      const P_data = root.Player?.data || P || {};
      const pName = P_data.name || P_data.nick || (root.Player && typeof root.Player.nick === 'function' ? root.Player.nick() : 'Petualang');
      const pLv = P_data.level || (root.Player && typeof root.Player.level === 'function' ? root.Player.level() : 1);
      const pCoins = typeof P_data.coins === 'number' ? P_data.coins : (root.Player && typeof root.Player.coins === 'function' ? root.Player.coins() : 0);
      const pEn = P_data.energy ?? P_data.en ?? 3;
      const pEnMax = P_data.maxEnergy ?? P_data.enMax ?? 5;
      const pXp = P_data.xp ?? 78;
      const pCls = P_data.className || (P_data.classId ? `Kelas ${P_data.classId} SD` : 'Kelas 5 SD');

      let avatarMarkup = '';
      if (root.Avatar && typeof root.Avatar.renderAvatar === 'function') {
        avatarMarkup = root.Avatar.renderAvatar(P_data.avatar || {}, { size: 64 });
      } else {
        avatarMarkup = sv('av-main');
      }

      let logoMarkup = '';
      if (root.Monsters && typeof root.Monsters.renderMonster === 'function') {
        logoMarkup = root.Monsters.renderMonster(root.Monsters.MONSTERS[0], { size: 52 });
      } else {
        logoMarkup = sv('boss-hero');
      }

      return `
      <header class="d-top">
        <div class="d-logo link" data-go="home" style="cursor:pointer">
          <div class="lg">${logoMarkup}</div>
          <div><b>Petualangan Pelajar</b><small>Desktop Cockpit</small></div>
        </div>
        <div class="d-crumb" id="crumb"></div>
        <div class="sp"></div>
        <span class="pill" title="Energi">⚡ <span id="top-energy">${pEn}/${pEnMax}</span></span>
        <span class="pill" title="Koin Emas"><span class="coin-ico" aria-label="koin"></span> <span id="top-coins">${pCoins.toLocaleString('id-ID')}</span></span>
        <button class="icon-btn" data-act="sfx" title="Efek suara (SFX)">🔊</button>
        <button class="icon-btn" data-act="keys" title="Papan pintas keyboard (?)">⌨️</button>
        <div class="me-chip link" data-go="profil" style="cursor:pointer" title="Buka Profil Petualang">
          <div class="av">${avatarMarkup}</div>
          <div class="me-meta">
            <b>${pName}</b>
            <small class="muted">Lv ${pLv} · ${pCls}</small>
            <div class="me-bar-wrap" title="XP: ${pXp % 100}%">${bar(pXp % 100, 'xp')}</div>
          </div>
        </div>
      </header>`;
    },

    rail(active) {
      const P = root.Player?.data || {};
      const pName = P.nick || P.name || 'Petualang';
      const pLv = P.level || (root.Player && typeof root.Player.level === 'function' ? root.Player.level() : 1);
      const pCls = P.className || (P.classId ? `Kelas ${P.classId} SD` : 'Kelas 5 SD');
      const avatarSvg = (root.Avatar && typeof root.Avatar.renderAvatar === 'function')
        ? root.Avatar.renderAvatar(P.avatar || {}, { size: 36 })
        : (typeof root.renderPlayerAvatar === 'function' ? root.renderPlayerAvatar(P.avatar, 36) : sv('av-hero'));

      // 3 Kelompok Menu Navigasi Sesuai Proposal (Duel diakses via Pertemanan)
      const GROUPS = [
        {
          title: 'Main Arena',
          items: NAV.filter(([id]) => ['home', 'peta', 'latihan'].includes(id))
        },
        {
          title: 'Hero & Koleksi',
          items: NAV.filter(([id]) => ['profil', 'wardrobe', 'skill', 'dex'].includes(id))
        },
        {
          title: 'Sosial & Fasilitas',
          items: NAV.filter(([id]) => ['friends', 'shop', 'report', 'settings'].includes(id))
        }
      ];

      return `<nav class="d-rail" aria-label="Navigasi utama">
        <div class="sidebar-brand" style="display:flex;align-items:center;gap:.6rem;padding:.4rem .4rem .6rem;border-bottom:1px solid rgba(255,255,255,.08);margin-bottom:.3rem">
          <span style="font-size:1.5rem">⚔️</span>
          <div style="flex:1;min-width:0">
            <b style="font-size:.88rem;color:#fff;display:block;letter-spacing:.02em">PETUALANGAN</b>
            <small style="font-size:.65rem;color:var(--c-primary);font-weight:800;letter-spacing:.04em">PELAJAR RPG · v7.2</small>
          </div>
        </div>

        ${GROUPS.map(g => `
          <div class="rail-group-title">${g.title}</div>
          ${g.items.map(([id, ic, lb, k]) => `
            <button class="rail-btn ${id === active ? 'active' : ''}" data-go="${id}" title="${lb} (${k})">
              <span class="i">${ic}</span>
              <span class="lb">${lb}</span>
              ${id === 'friends' ? `<span class="badge-pill" id="rail-badge-friends" style="${this.inviteCount > 0 ? '' : 'display:none'}">${this.inviteCount || 0}</span>` : ''}
              <span class="k">${k}</span>
            </button>`).join('')}
        `).join('')}

        <div class="rail-sp"></div>

        <div class="rail-footer">
          <div class="rail-mini-profile" data-go="profil" title="Buka Profil Petualang">
            <div class="mini-av">${avatarSvg}</div>
            <div class="mini-meta">
              <div class="mini-name">${esc(pName)}</div>
              <div class="mini-sub">Lv ${pLv} · ${esc(pCls)}</div>
            </div>
          </div>
          <div class="rail-actions">
            <button class="rail-action-btn" data-act="admin" title="Menu Guru / Admin"><span class="i">🛡️</span> Guru</button>
            <button class="rail-action-btn danger" data-act="logout" title="Keluar Akun"><span class="i">🚪</span> Keluar</button>
          </div>
        </div>
      </nav>`;
    },

    updateTopbar(P = null) {
      const P_data = P || root.Player?.data || {};
      const pCoins = typeof P_data.coins === 'number' ? P_data.coins : (root.Player && typeof root.Player.coins === 'function' ? root.Player.coins() : 0);
      const pEn = P_data.energy ?? P_data.en ?? 3;
      const pEnMax = P_data.maxEnergy ?? P_data.enMax ?? 5;
      const elEn = document.getElementById('top-energy');
      if (elEn) elEn.textContent = `${pEn}/${pEnMax}`;
      const elCoins = document.getElementById('top-coins');
      if (elCoins) elCoins.textContent = pCoins.toLocaleString('id-ID');
      const elGems = document.getElementById('top-gems');
      if (elGems) elGems.remove();
      this.checkInvites();
    },

    mount(app, name, params = {}) {
      if (!app) return;
      const isFocus = FOCUS.has(name);
      app.className = 'd-play' + (isFocus ? ' focus' : '');
      app.innerHTML = (isFocus ? '' : (this.topbar(root.Player?.data || {}) + this.rail(name))) +
        `<main class="d-screen ${name}-screen" id="d-screen" data-screen="${name}"></main>`;

      const host = $('#d-screen', app);
      const crumb = $('#crumb', app);
      if (crumb) crumb.textContent = TITLES[name] || '';

      Keys.set({});
      this.checkInvites();

      if (root.DesktopScreens && root.DesktopScreens[name]) {
        root.DesktopScreens[name](host, params);
      } else {
        host.innerHTML = panel('', `<p>Halaman ${name} tidak ditemukan</p><button class="btn primary" data-go="home">Kembali ke Beranda</button>`);
      }
    },

    bind() {
      if (this._bound) return;
      this._bound = true;
      document.addEventListener('click', e => {
        if (!e.target.closest('#app.d-play')) return;
        const g = e.target.closest('[data-go]');
        if (g) {
          root.go(g.dataset.go);
          return;
        }
        const a = e.target.closest('[data-act]');
        if (!a) return;
        if (a.dataset.act === 'keys') DesktopShell.keysHelp();
        if (a.dataset.act === 'sfx') {
          if (root.Sfx && typeof root.Sfx.toggleSound === 'function') {
            root.Sfx.toggleSound();
          } else {
            a.textContent = a.textContent === '🔊' ? '🔇' : '🔊';
          }
        }
        if (a.dataset.act === 'admin') {
          if (typeof root.openAdminModal === 'function') root.openAdminModal();
          else if (root.Screens?.home?.openAuthModal) root.Screens.home.openAuthModal();
          else toast('Menu Guru / Admin dibuka');
        }
        if (a.dataset.act === 'logout') {
          if (root.API && typeof root.API.logout === 'function') {
            root.API.logout().catch(() => {});
          }
          if (root.Player) root.Player.data = null;
          toast('Berhasil keluar');
          root.go('auth');
        }
      });
    },

    keysHelp() {
      const rows = [
        ['1 – 0, -', 'Pindah layar (Beranda … Pengaturan)'],
        ['Esc', 'Kembali / tutup dialog'],
        ['?', 'Tampilkan papan pintas ini'],
        ['A B C D  atau  1 2 3 4', 'Pilih opsi jawaban (di arena)'],
        ['Spasi', 'Bacakan soal (TTS)'],
        ['Q W E', 'Pakai skill aktif 1 / 2 / 3'],
        ['F', 'Mode Fokus Baca (soal diperbesar)'],
        ['Enter', 'Konfirmasi / lanjut']
      ];
      Modal.open('⌨️ Papan Pintas Keyboard', `<div class="keys-table">${rows.map(([k, d]) => `<span class="kbd" style="justify-self:start;padding:0 .6rem">${k}</span><span>${d}</span>`).join('')}</div>`);
    }
  };

  /* ---------- 5. Router SPA terpadu ---------- */
  function go(name, params = {}) {
    root.go = go;
    // Map screen aliases
    if (name === 'subjects') name = 'peta';
    if (name === 'laporan') name = 'report';
    if (name === 'skin') name = 'wardrobe';
    if (name === 'skills') name = 'skill';

    if (name !== 'auth' && (!root.Player || !root.Player.data)) {
      return go('auth');
    }
    const prev = root.Screens?.current;
    if (prev && root.Screens[prev] && root.Screens[prev].destroy) {
      root.Screens[prev].destroy();
    }
    if (root.Sfx && typeof root.Sfx.stopSpeak === 'function') {
      root.Sfx.stopSpeak();
    }
    Modal.close();

    const Screens = root.Screens || {};
    Screens.current = name;
    Screens._params = params;

    const app = $('#app');
    if (!app) return;

    if (UIMode.current() === 'desktop') {
      DesktopShell.mount(app, name, params);
    } else {
      app.className = 'm-play';
      app.innerHTML = '';
      if (Screens[name] && Screens[name].render) {
        Screens[name].render(app, params);
      } else {
        app.innerHTML = `<div class="screen active center-col"><p>Halaman ${name} tidak ditemukan</p><button class="btn" onclick="go('home')">Beranda</button></div>`;
      }
    }

    if (location.hash.slice(1) !== name) {
      history.replaceState(null, '', '#' + name);
    }
  }

  /* Kunci global: angka = pindah layar */
  NAV.forEach(([id, , , k]) => {
    Keys.global[k] = () => go(id);
  });
  Keys.global['?'] = () => DesktopShell.keysHelp();
  Keys.global['Escape'] = () => {
    if ($('#common-modal')) Modal.close();
  };

  const Screens = root.Screens || {};
  /* Screen fallback aliases for mobile mode */
  Screens.wardrobe = Screens.wardrobe || {
    render: (app, params) => go('profil', Object.assign({ tab: 'skin' }, params))
  };
  Screens.shop = Screens.shop || {
    render: (app, params) => go('profil', Object.assign({ tab: 'toko' }, params))
  };
  Screens.skill = Screens.skill || {
    render: (app, params) => go('profil', Object.assign({ tab: 'skill' }, params))
  };
  Screens.latihan = Screens.latihan || {
    render: (app, params) => go('peta', params)
  };

  /* Auto bootstrap desktop mode */
  /* Universal Coin Glyph Guardian (Zero-Tofu Windows PC & Mobile) */
  function initCoinGlyphGuardian() {
    if (typeof document === 'undefined') return;
    const COIN = '\u{1FA99}';
    const replaceNode = (node) => {
      if (!node || node.nodeType !== 3 || !node.nodeValue || !node.nodeValue.includes(COIN)) return;
      const p = node.parentNode;
      if (!p || /^(SCRIPT|STYLE|TEXTAREA|INPUT)$/i.test(p.tagName)) return;
      const frag = document.createDocumentFragment();
      const parts = node.nodeValue.split(COIN);
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) frag.appendChild(document.createTextNode(parts[i]));
        if (i < parts.length - 1) {
          const ico = document.createElement('span');
          ico.className = 'coin-ico';
          ico.setAttribute('aria-label', 'koin');
          frag.appendChild(ico);
        }
      }
      p.replaceChild(frag, node);
    };
    const scan = (el) => {
      if (!el || !el.nodeType) return;
      if (el.nodeType === 3) { replaceNode(el); return; }
      try {
        const w = document.createTreeWalker(el, 4, {
          acceptNode: n => (n.nodeValue && n.nodeValue.includes(COIN)) ? 1 : 2
        });
        const batch = [];
        while (w.nextNode()) batch.push(w.currentNode);
        for (let i = 0; i < batch.length; i++) replaceNode(batch[i]);
      } catch (_) {}
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => scan(document.body));
    } else if (document.body) {
      scan(document.body);
    }
    if (typeof MutationObserver !== 'undefined' && document.body) {
      new MutationObserver(ms => {
        for (let i = 0; i < ms.length; i++) {
          const m = ms[i];
          if (m.type === 'childList') {
            for (let j = 0; j < m.addedNodes.length; j++) scan(m.addedNodes[j]);
          } else if (m.type === 'characterData') {
            replaceNode(m.target);
          }
        }
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    }
  }

  function bootDesktop() {
    initCoinGlyphGuardian();
    Keys.init();
    DesktopShell.bind();
    UIMode.init();
  }

  if (document.readyState === 'loading') {
    root.addEventListener('DOMContentLoaded', bootDesktop);
  } else {
    bootDesktop();
  }

  root.Screens = Screens;
  root.UIMode = UIMode;
  root.Keys = Keys;
  root.DesktopShell = DesktopShell;
  root.Modal = Modal;
  root.toast = toast;
  root.go = go;

})(typeof window !== 'undefined' ? window : globalThis);
