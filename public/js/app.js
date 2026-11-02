/* ============================================================
   Petualangan Pelajar — app.js (v2 Server-Authoritative)
   Vanilla JS SPA, Node.js + SQLite backend, WebAudio SFX & TTS
   ============================================================ */
'use strict';

/* ---------- Helpers & DOM ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------- Local Settings & Auth Cache ---------- */
const Settings = {
  _data: null,
  get() {
    if (!this._data) {
      try {
        this._data = Object.assign({ sfx: true, tts: false }, JSON.parse(localStorage.getItem('pp_settings') || '{}'));
      } catch (e) {
        this._data = { sfx: true, tts: false };
      }
    }
    return this._data;
  },
  save() {
    try { localStorage.setItem('pp_settings', JSON.stringify(this._data)); } catch (e) {}
  },
  set(k, v) {
    this.get()[k] = v;
    this.save();
  }
};
window.State = {
  settings: Settings.get(),
  clientInstanceId: localStorage.getItem('pp_client_id') || ('c_' + Math.random().toString(36).slice(2) + Date.now().toString(36))
};
localStorage.setItem('pp_client_id', State.clientInstanceId);

/* ---------- API Client ---------- */
const API = {
  token: localStorage.getItem('pp_token') || null,

  setToken(t) {
    this.token = t;
    if (t) localStorage.setItem('pp_token', t);
    else localStorage.removeItem('pp_token');
  },

  async req(endpoint, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    try {
      const res = await fetch(endpoint, { credentials: 'same-origin', ...opts, headers });
      const data = await res.json();
      if (!res.ok && !data.ok) {
        const errObj = new Error(data.error?.message || (typeof data.error === 'string' ? data.error : `HTTP_${res.status}`));
        errObj.code = data.error?.code || (res.status === 409 ? 'ACTIVE_SESSION' : (res.status === 401 ? 'UNAUTHENTICATED' : `HTTP_${res.status}`));
        errObj.status = res.status;
        errObj.data = data;
        throw errObj;
      }
      return data;
    } catch (err) {
      console.warn(`[API] ${endpoint} failed:`, err.message);
      throw err;
    }
  },

  async getMe() {
    const res = await this.req('/api/player/me');
    return res.player;
  },

  async login(nick, password) {
    const res = await this.req('/api/player/login', {
      method: 'POST',
      body: JSON.stringify({ nick, password }),
    });
    if (res.token) this.setToken(res.token);
    return res.player;
  },

  async register(nick, password, classId) {
    const res = await this.req('/api/player/register', {
      method: 'POST',
      body: JSON.stringify({ nick, password, classId }),
    });
    if (res.token) this.setToken(res.token);
    return res.player;
  },

  async logout() {
    try { await this.req('/api/player/logout', { method: 'POST' }); } catch (e) {}
    this.setToken(null);
  },

  async getClasses() {
    const res = await this.req('/api/classes');
    return res.classes || [];
  },

  async getSubjects(classId) {
    const res = await this.req(`/api/subjects?classId=${classId}`);
    return res.subjects || [];
  },

  async getActiveSession() {
    return this.req('/api/game/active');
  },

  async heartbeat(sessionId, questionIndex) {
    return this.req(`/api/game/${sessionId}/heartbeat`, {
      method: 'POST',
      body: JSON.stringify({ questionIndex, clientInstanceId: State.clientInstanceId })
    });
  },

  async resume(sessionId) {
    return this.req(`/api/game/${sessionId}/resume`, {
      method: 'POST',
      body: JSON.stringify({ clientInstanceId: State.clientInstanceId })
    });
  },

  async startSession(subjectId) {
    const res = await this.req('/api/game/start', {
      method: 'POST',
      body: JSON.stringify({ subjectId }),
    });
    return res.session;
  },

  async readyQuestion(sessionId, questionIndex) {
    return this.req(`/api/game/${sessionId}/ready`, {
      method: 'POST',
      body: JSON.stringify({ questionIndex }),
    });
  },

  async answerQuestion(sessionId, questionIndex, chosenIndex) {
    return this.req(`/api/game/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionIndex, chosenIndex }),
    });
  },

  async abandonSession(sessionId) {
    return this.req(`/api/game/${sessionId}/abandon`, { method: 'POST' });
  },

  async getDex() {
    const res = await this.req('/api/dex');
    return res.monsters || [];
  },

  async getProfile() {
    return this.req('/api/profile');
  },

  async updateAvatar(avatar) {
    return this.req('/api/avatar', {
      method: 'PUT',
      body: JSON.stringify({ avatar }),
    });
  },

  async getGameSkills(sessionId) {
    const res = await this.req(`/api/game/${sessionId}/skills`);
    return res.skills || [];
  },

  async getSettings() {
    return this.req('/api/settings');
  },

  async saveSettings(settings) {
    return this.req('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  async getInventory() {
    return this.req('/api/inventory');
  },

  async getShop() {
    return this.req('/api/shop');
  },

  async buyShopItem(itemId, idemKey) {
    const headers = {};
    if (idemKey) headers['Idempotency-Key'] = idemKey;
    return this.req('/api/shop/buy', {
      method: 'POST',
      headers,
      body: JSON.stringify({ itemId }),
    });
  },

  async buyMysteryBox(idemKey) {
    const headers = {};
    if (idemKey) headers['Idempotency-Key'] = idemKey;
    return this.req('/api/shop/box', {
      method: 'POST',
      headers,
    });
  },

  async getCoinHistory(limit = 50) {
    return this.req(`/api/coins/history?limit=${limit}`);
  },

  async getSkills() {
    return this.req('/api/skills');
  },

  async updateLoadout(slots) {
    return this.req('/api/loadout', {
      method: 'PUT',
      body: JSON.stringify({ slots }),
    });
  },

  async upgradeSkill(skillId, idemKey) {
    const headers = {};
    if (idemKey) headers['Idempotency-Key'] = idemKey;
    return this.req(`/api/skills/${skillId}/upgrade`, {
      method: 'POST',
      headers,
    });
  },

  async useSkill(sessionId, skillId, questionIndex, idemKey) {
    const headers = {};
    if (idemKey) headers['Idempotency-Key'] = idemKey;
    return this.req(`/api/game/${sessionId}/skill`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ skillId, questionIndex }),
    });
  },

  async getGameSkills(sessionId) {
    const res = await this.req(`/api/game/${sessionId}/skills`);
    return res && res.skills ? res.skills : [];
  },
};

/* ---------- Current Player Store ---------- */
const Player = {
  data: null,
  async init() {
    try {
      this.data = await API.getMe();
      if (this.data && this.data.settings) {
        Object.assign(Settings.get(), this.data.settings);
        Settings.save();
      }
    } catch (e) {
      this.data = null;
    }
    return this.data;
  },
  level() { return this.data ? this.data.level : 1; },
  coins() { return this.data ? this.data.coins : 0; },
  nick() { return this.data ? this.data.nick : 'Petualang'; },
  classId() { return this.data ? this.data.classId : 1; },
};

/* ---------- Active Session Check & Resume Modal ---------- */
function showResumeModal(active) {
  const existing = $('#modal-resume');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'modal-resume';
  modal.className = 'modal-mask active';
  modal.setAttribute('data-testid', 'modal-resume');

  const subjName = active.subject ? active.subject.name : 'Pelajaran';
  const bossName = active.boss ? active.boss.name : 'Monster Bos';
  const currIdx = (active.index ?? 0) + 1;
  const totalQ = active.total ?? 10;

  modal.innerHTML = `
    <div class="modal card" style="max-width:360px;text-align:center;padding:24px;border:1px solid var(--c-surface-strong)">
      <div style="font-size:3rem;margin-bottom:8px">⚔️</div>
      <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:6px;color:#fff">Pertarungan Belum Selesai!</h2>
      <p style="font-size:0.9rem;color:var(--c-muted);margin-bottom:16px;line-height:1.4">
        Kamu memiliki pertarungan melawan <b>${esc(bossName)}</b> di mapel <b>${esc(subjName)}</b> yang belum diselesaikan (Soal ${currIdx}/${totalQ}).
      </p>
      <div class="stack" style="gap:10px">
        <button class="btn block primary" id="btn-resume-act" data-testid="btn-resume-session">
          ▶️ Lanjutkan Pertarungan
        </button>
        <button class="btn block ghost" id="btn-abandon-act" data-testid="btn-abandon-session" style="color:var(--c-bad,#ef4444)">
          🏳️ Menyerah & Buat Baru
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  $('#btn-resume-act', modal).onclick = async () => {
    modal.remove();
    try {
      const resumed = await API.resume(active.sessionId);
      if (resumed && resumed.session) {
        Screens.battle.session = resumed.session;
        go('battle');
      } else {
        go('home');
      }
    } catch (e) {
      toast('Gagal melanjutkan sesi: ' + e.message);
      go('home');
    }
  };

  $('#btn-abandon-act', modal).onclick = async () => {
    modal.remove();
    try {
      await API.abandonSession(active.sessionId);
      toast('Sesi pertarungan telah dihentikan.');
    } catch (e) {
      console.warn('Abandon error:', e);
    }
  };
}

async function checkActiveSession() {
  if (!Player.data) return;
  try {
    const res = await API.getActiveSession();
    if (res && res.active && res.active.sessionId) {
      showResumeModal(res.active);
    }
  } catch (e) {
    console.warn('Check active session failed:', e);
  }
}

/* ---------- Screen Router ---------- */
const Screens = {};
function go(name, params = {}) {
  if (name !== 'auth' && !Player.data) {
    return go('auth');
  }
  const prev = Screens.current;
  if (prev && Screens[prev] && Screens[prev].destroy) Screens[prev].destroy();
  if (window.Sfx) Sfx.stopSpeak();
  Screens.current = name;
  const app = $('#app');
  app.innerHTML = '';
  if (Screens[name] && Screens[name].render) {
    Screens[name].render(app, params);
  } else {
    app.innerHTML = `<div class="screen active center-col"><p>Halaman ${name} tidak ditemukan</p><button class="btn" onclick="go('home')">Beranda</button></div>`;
  }
}

/* ============================================================
   SCREEN: Auth (Login & Register)
   ============================================================ */
Screens.auth = {
  activeTab: 'login', // 'login' or 'register'
  render(app) {
    app.innerHTML = `
      <section class="screen active center-col stack" data-testid="screen-auth" style="justify-content:center;align-items:center;padding:16px">
        <div class="auth-card">
          <div class="brand-auth">
            <div class="brand-icon">🎒</div>
            <h1 class="brand-title">Petualangan Pelajar</h1>
            <p class="brand-sub">Masuk untuk memulai petualangan belajar!</p>
          </div>

          <div class="auth-tabs">
            <button class="btn ${this.activeTab === 'login' ? 'primary' : 'ghost'}" id="tab-login">Masuk</button>
            <button class="btn ${this.activeTab === 'register' ? 'primary' : 'ghost'}" id="tab-register">Daftar Baru</button>
          </div>

          <div class="auth-form stack" style="gap:12px">
            <div class="field">
              <label for="auth-nick">Nama Panggilan / Nickname</label>
              <input type="text" id="auth-nick" data-testid="input-nick" placeholder="Contoh: Budi" autocomplete="username">
            </div>

            <div class="field">
              <label for="auth-pass">Kata Sandi (Password)</label>
              <input type="password" id="auth-pass" data-testid="input-password" placeholder="Minimal 4 karakter" autocomplete="current-password">
            </div>

            <div class="field" id="field-class" style="display:${this.activeTab === 'register' ? 'block' : 'none'}">
              <label for="auth-class">Tingkat Kelas</label>
              <select id="auth-class" data-testid="select-class">
                <option value="1">Kelas 4 SD / MI (Semester 1)</option>
                <option value="2">Kelas 5 SD / MI (Semester 1)</option>
              </select>
            </div>

            <div id="auth-error" class="auth-error-msg" style="color:var(--c-bad,#ef4444);font-size:0.85rem;display:none;text-align:center;padding:4px"></div>

            <div style="margin-top:8px">
              <button class="btn block primary" id="btn-submit-auth" data-testid="${this.activeTab === 'login' ? 'btn-login' : 'btn-register'}">
                ${this.activeTab === 'login' ? '🔑 Masuk Sekarang' : '✨ Buat Akun Baru'}
              </button>
            </div>
          </div>
        </div>
      </section>
    `;

    const tabLogin = $('#tab-login');
    const tabRegister = $('#tab-register');
    const submitBtn = $('#btn-submit-auth');
    const errBox = $('#auth-error');

    tabLogin.onclick = () => {
      this.activeTab = 'login';
      this.render(app);
    };
    tabRegister.onclick = () => {
      this.activeTab = 'register';
      this.render(app);
    };

    submitBtn.onclick = async () => {
      const nick = $('#auth-nick').value.trim();
      const pass = $('#auth-pass').value;
      errBox.style.display = 'none';
      if (!nick || !pass) {
        errBox.textContent = 'Harap isi nama panggilan dan kata sandi';
        errBox.style.display = 'block';
        return;
      }
      try {
        if (this.activeTab === 'login') {
          Player.data = await API.login(nick, pass);
          toast(`Selamat datang, ${Player.data.nick}!`);
        } else {
          const classId = parseInt($('#auth-class').value, 10);
          Player.data = await API.register(nick, pass, classId);
          toast(`Akun ${Player.data.nick} berhasil dibuat!`);
        }
        await checkActiveSession();
        go('home');
      } catch (err) {
        errBox.textContent = err.message || 'Terjadi kesalahan saat otentikasi';
        errBox.style.display = 'block';
      }
    };
  }
};

/* ============================================================
   SCREEN: Home
   ============================================================ */
Screens.home = {
  async render(app) {
    const p = Player.data;
    const heroM = Monsters.MONSTERS.find(m => m.id === 3) || Monsters.MONSTERS[0];
    const heroSvg = Monsters.renderMonster(heroM, { size: 130 });
    const avatarSvg = window.Avatar ? Avatar.renderAvatar(p?.avatar || {}) : '🎒';

    app.innerHTML = `
      <section class="screen active center-col stack">
        <div class="player-banner" id="home-banner-profile" style="cursor:pointer;width:min(420px,100%)">
          <div class="avatar-badge" style="width:48px;height:48px;padding:0;overflow:hidden;border-radius:12px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center">
            ${avatarSvg}
          </div>
          <div class="details grow">
            <div class="nick" style="font-weight:800;color:#fff">${esc(p ? p.nick : 'Petualang Cilik')} · <span style="color:var(--c-primary)">Lv. ${p ? p.level : 1}</span></div>
            <div class="sub" style="font-size:0.75rem;color:var(--c-muted)">
              <span style="color:#fbbf24;font-weight:700">🪙 ${p ? p.coins : 0} Koin</span> · ${esc(p?.title || 'Petualang Pemula')}
            </div>
            <div class="xp-track" style="margin-top:4px;height:5px;background:rgba(255,255,255,0.1);border-radius:99px;overflow:hidden">
              <div class="xp-fill" style="width:${p ? Math.min(100, Math.round(((p.xp || 0) / (p.xpForNext || 100)) * 100)) : 0}%"></div>
            </div>
          </div>
          <button class="btn ghost small" id="btn-switch-user" style="padding:4px 8px;font-size:.75rem">Ganti</button>
        </div>

        <div class="hero-monster" style="cursor:pointer;margin:4px 0" title="${esc(heroM.name)}">${heroSvg}</div>
        <h1 class="brand" style="margin-top:-6px;font-size:1.6rem">Petualangan<br>Pelajar</h1>
        <p class="tagline" style="margin-bottom:6px">Kalahkan monster bos dengan kecerdasanmu!</p>

        <!-- 8 Ubin Navigasi Responsif -->
        <div class="home-tiles-grid">
          <button class="menu-tile highlight" id="m-play" data-testid="menu-play">
            <span class="tile-icon">⚔️</span>
            <span class="tile-title">Petualangan</span>
            <span class="tile-desc">Lawan Bos</span>
          </button>
          <button class="menu-tile" id="m-practice" data-testid="menu-practice">
            <span class="tile-icon">📚</span>
            <span class="tile-title">Latihan</span>
            <span class="tile-desc">Bebas Waktu</span>
          </button>
          <button class="menu-tile" id="m-profile" data-testid="menu-profile">
            <span class="tile-icon">👤</span>
            <span class="tile-title">Profil</span>
            <span class="tile-desc">Stat & Gelar</span>
          </button>
          <button class="menu-tile" id="m-skin" data-testid="menu-skin">
            <span class="tile-icon">🎒</span>
            <span class="tile-title">Skin</span>
            <span class="tile-desc">Kustom Avatar</span>
          </button>
          <button class="menu-tile" id="m-skills" data-testid="menu-skills">
            <span class="tile-icon">⚡</span>
            <span class="tile-title">Skill</span>
            <span class="tile-desc">9 Taktik Laga</span>
          </button>
          <button class="menu-tile" id="m-shop" data-testid="menu-shop">
            <span class="tile-icon">🛒</span>
            <span class="tile-title">Toko</span>
            <span class="tile-desc">Kotak & Item</span>
          </button>
          <button class="menu-tile" id="m-dex" data-testid="menu-dex">
            <span class="tile-icon">📖</span>
            <span class="tile-title">Monsterdex</span>
            <span class="tile-desc">100 Monster</span>
          </button>
          <button class="menu-tile" id="m-settings" data-testid="menu-settings">
            <span class="tile-icon">⚙️</span>
            <span class="tile-title">Pengaturan</span>
            <span class="tile-desc">Suara & Akun</span>
          </button>
        </div>

        <div style="margin-top:8px;text-align:center">
          <a href="/admin.html" class="btn ghost small" style="opacity:.65;font-size:.78rem;text-decoration:none">🛡️ Admin Guru / Soal</a>
        </div>
        <p class="tagline" style="font-size:.72rem;margin-top:4px;margin-bottom:8px">Server-Authoritative · Cloudflare Protected</p>
      </section>
    `;

    $('#home-banner-profile').onclick = (e) => {
      if (e.target && e.target.id === 'btn-switch-user') return;
      if (window.Sfx) Sfx.play('tap');
      go('profil', { tab: 'ringkasan' });
    };

    $('#m-play').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('subjects'); };
    $('#m-practice').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('subjects', { mode: 'PRACTICE' }); };
    $('#m-profile').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('profil', { tab: 'ringkasan' }); };
    $('#m-skin').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('profil', { tab: 'skin' }); };
    $('#m-skills').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('profil', { tab: 'skill' }); };
    $('#m-shop').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('profil', { tab: 'toko' }); };
    $('#m-dex').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('dex'); };
    $('#m-settings').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('settings'); };
    $('#btn-switch-user').onclick = () => Screens.home.openAuthModal();
  },

  openAuthModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-mask active';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-title">Ganti / Buat Akun</div>
        <div class="field" style="margin-bottom:10px">
          <label>Nama Panggilan / Nickname</label>
          <input type="text" id="m-nick" placeholder="Contoh: Budi" value="${esc(Player.nick())}">
        </div>
        <div class="field" style="margin-bottom:10px">
          <label>Kata Sandi (Password)</label>
          <input type="password" id="m-pass" placeholder="Minimal 4 karakter">
        </div>
        <div class="field" style="margin-bottom:14px">
          <label>Tingkat Kelas</label>
          <select id="m-class">
            <option value="1" ${Player.classId() === 1 ? 'selected' : ''}>Kelas 4 SD</option>
            <option value="2" ${Player.classId() === 2 ? 'selected' : ''}>Kelas 5 SD</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn ghost" id="m-close">Batal</button>
          <button class="btn secondary" id="m-login">Masuk</button>
          <button class="btn" id="m-reg">Daftar Baru</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    $('#m-close', modal).onclick = close;

    $('#m-login', modal).onclick = async () => {
      const nick = $('#m-nick', modal).value.trim();
      const pass = $('#m-pass', modal).value;
      if (!nick || !pass) return toast('Isi nama dan password');
      try {
        Player.data = await API.login(nick, pass);
        toast(`Selamat datang, ${Player.data.nick}!`);
        close();
        go('home');
      } catch (e) {
        toast('Gagal masuk: ' + (e.message || 'Akun tidak ditemukan'));
      }
    };

    $('#m-reg', modal).onclick = async () => {
      const nick = $('#m-nick', modal).value.trim();
      const pass = $('#m-pass', modal).value;
      const classId = parseInt($('#m-class', modal).value, 10);
      if (!nick || !pass) return toast('Isi nama dan password');
      try {
        Player.data = await API.register(nick, pass, classId);
        toast(`Akun ${Player.data.nick} berhasil dibuat!`);
        close();
        go('home');
      } catch (e) {
        toast('Gagal daftar: ' + e.message);
      }
    };
  }
};

/* ============================================================
   SCREEN: Subject Picker (Peta Mata Pelajaran)
   ============================================================ */
Screens.subjects = {
  currentClassId: 1,

  async render(app) {
    this.currentClassId = Player.classId() || 1;
    app.innerHTML = `
      <section class="screen active stack">
        <div class="hud">
          <button class="icon-btn" id="sub-back">←</button>
          <h2 class="hud-title">Pilih Arena Kuis</h2>
          <span class="chip accent">🪙 <span id="hdr-coins">${Player.coins()}</span></span>
        </div>

        <div style="display:flex;gap:8px;margin-bottom:8px">
          <button class="btn small ${this.currentClassId === 1 ? '' : 'ghost'}" id="tab-k4">Kelas 4 SD</button>
          <button class="btn small ${this.currentClassId === 2 ? '' : 'ghost'}" id="tab-k5">Kelas 5 SD</button>
        </div>

        <div class="grow" id="subjects-container" style="overflow-y:auto;padding-bottom:16px">
          <div style="text-align:center;padding:30px;color:var(--c-muted)">Memuat arena...</div>
        </div>
      </section>
    `;

    $('#sub-back').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('home'); };
    $('#tab-k4').onclick = () => { this.currentClassId = 1; this.loadSubjects(); };
    $('#tab-k5').onclick = () => { this.currentClassId = 2; this.loadSubjects(); };

    await this.loadSubjects();
  },

  async loadSubjects() {
    $('#tab-k4').className = `btn small ${this.currentClassId === 1 ? '' : 'ghost'}`;
    $('#tab-k5').className = `btn small ${this.currentClassId === 2 ? '' : 'ghost'}`;
    const box = $('#subjects-container');
    try {
      const subjects = await API.getSubjects(this.currentClassId);
      if (subjects.length === 0) {
        box.innerHTML = `<div style="text-align:center;padding:40px;color:var(--c-muted)">Belum ada mata pelajaran untuk kelas ini.</div>`;
        return;
      }

      box.innerHTML = `
        <div class="stack" style="gap:12px">
          ${subjects.map(s => {
            const starsStr = s.bestStars > 0 ? '⭐'.repeat(s.bestStars) + '☆'.repeat(3 - s.bestStars) : '☆☆☆';
            return `
              <div class="card subject-card" data-id="${s.id}" style="cursor:pointer;display:flex;align-items:center;gap:14px;padding:16px;background:var(--c-surface);border:1px solid var(--c-surface-strong);border-radius:var(--radius)">
                <div style="font-size:2.2rem;width:56px;height:56px;border-radius:14px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center">${s.icon || '📚'}</div>
                <div class="grow">
                  <div style="display:flex;align-items:center;gap:8px">
                    <strong style="font-size:1.15rem;color:#fff">${esc(s.name)}</strong>
                    <span style="font-size:.7rem;padding:2px 8px;border-radius:99px;background:rgba(255,255,255,.1);color:var(--c-muted)">${esc(s.monsterTheme || 'Hutan')}</span>
                  </div>
                  <div style="font-size:.8rem;color:var(--c-muted);margin-top:2px">
                    ${s.questionCount} Soal · ${s.timeLimitSec}s / soal
                  </div>
                  <div style="font-size:.85rem;color:var(--c-primary);margin-top:4px">
                    ${starsStr} · Menang: ${s.wins || 0}×
                  </div>
                </div>
                <button class="btn secondary" data-testid="start-battle" style="pointer-events:none">Lawan ⚔️</button>
              </div>
            `;
          }).join('')}
        </div>
      `;

      $$('.subject-card', box).forEach(card => {
        card.onclick = async () => {
          const sid = parseInt(card.dataset.id, 10);
          if (window.Sfx) Sfx.play('select');
          await Screens.battle.start(sid);
        };
      });
    } catch (e) {
      box.innerHTML = `<div style="text-align:center;padding:30px;color:var(--c-bad)">Gagal memuat mata pelajaran: ${esc(e.message)}</div>`;
    }
  }
};

/* ============================================================
   SCREEN: Battle (Server-Authoritative Arena)
   ============================================================ */
Screens.battle = {
  session: null,
  skills: [],
  isUsingSkill: false,
  timerInterval: null,
  heartbeatInterval: null,
  timeRemainingSec: 0,
  timeTotalSec: 20,
  isAnswering: false,

  async start(subjectId) {
    try {
      toast('Membangkitkan monster bos...');
      const res = await API.startSession(subjectId);
      this.session = res.session || res;
      this.skills = res.skills || (this.session && this.session.skills) || [];
      go('battle');
    } catch (e) {
      if (e.code === 'ACTIVE_SESSION' && e.data?.session) {
        toast('Melanjutkan sesi pertempuran aktif...');
        this.session = e.data.session;
        this.skills = e.data.skills || (this.session && this.session.skills) || [];
        go('battle');
      } else {
        toast('Gagal memulai pertempuran: ' + e.message);
      }
    }
  },

  destroy() {
    this.stopTimer();
    this.stopHeartbeat();
  },

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(async () => {
      if (this.session && this.session.id) {
        try {
          await API.heartbeat(this.session.id, this.session.currentIndex);
        } catch (e) {
          console.warn('Heartbeat error:', e);
        }
      }
    }, 15000); // 15 detik
  },

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  },

  render(app) {
    const s = this.session;
    if (!s) return go('subjects');

    this.startHeartbeat();

    const bossHp = s.bossHp ?? s.boss?.hp ?? 0;
    const bossMaxHp = s.bossMaxHp ?? s.boss?.maxHp ?? 100;
    const monsterObj = s.monster || s.boss || Monsters.MONSTERS[0];

    app.innerHTML = `
      <section class="screen active stack" data-testid="battle-root" style="gap:8px">
        <!-- TOP HUD -->
        <div class="hud" style="margin-bottom:0">
          <button class="icon-btn" id="btn-abandon" title="Menyerah">✕</button>
          <div style="display:flex;align-items:center;gap:6px">
            <div class="chip accent" id="energy-gauge" data-testid="energy-gauge" style="font-weight:800">⚡ <span id="energy-val">${s.energy ?? 2}</span>/5</div>
            <span class="chip accent" id="streak-chip" style="${s.streak >= 2 ? '' : 'display:none'}">🔥 <span id="streak-n">${s.streak}</span></span>
            <span class="hud-title" id="q-counter">Soal ${s.currentIndex + 1}/${s.totalQuestions}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <span class="chip info" id="active-shield-chip" style="display:none">🛡️ <span id="shield-val">0</span></span>
            <span class="chip info" id="player-hp-label">❤️ <span id="player-hp-val">${s.playerHp}</span>/${s.playerMaxHp}</span>
          </div>
        </div>

        <!-- BOSS CARD -->
        <div class="boss-card">
          <div class="boss-svg-box" id="boss-svg-slot">${Monsters.renderMonster(monsterObj, { size: 76 })}</div>
          <div class="boss-info">
            <div class="boss-header">
              <span class="boss-name">${esc(monsterObj.name)}</span>
              <span class="boss-theme-tag">${esc(monsterObj.theme || 'Arena')}</span>
            </div>
            <div class="hp-track">
              <div class="hp-fill" id="boss-hp-bar" style="width:${(bossHp / bossMaxHp) * 100}%"></div>
            </div>
            <div class="hp-label">
              <span>HP Bos</span>
              <span id="boss-hp-text">${bossHp} / ${bossMaxHp}</span>
            </div>
          </div>
          <div id="damage-floater-slot"></div>
        </div>

        <!-- PLAYER HP TRACK -->
        <div class="player-hp-track" style="margin-top:-2px">
          <div class="player-hp-fill" id="player-hp-bar" style="width:${(s.playerHp / s.playerMaxHp) * 100}%"></div>
        </div>

        <!-- COUNTDOWN TIMER BAR -->
        <div class="countdown-bar">
          <div class="countdown-fill" id="timer-fill" style="width:100%"></div>
        </div>

        <!-- QUESTION CARD -->
        <div class="qwrap grow" style="display:flex;flex-direction:column;min-height:0">
          <div class="qcard q-scroll-box" style="padding:14px;flex:1 1 auto;overflow-y:auto;max-height:100%">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <span style="font-size:.75rem;color:var(--c-muted)">${esc(s.subject.name)}</span>
              <button class="icon-btn small" id="btn-tts" title="Baca Soal" style="width:28px;height:28px;font-size:.8rem">🔊</button>
            </div>
            <p class="qtext" id="q-text" style="font-size:1.05rem;line-height:1.35;margin:0">${esc(s.currentQuestion ? s.currentQuestion.text : '...')}</p>
            <div id="q-image-slot"></div>
          </div>

          <!-- SKILLS PANEL CONTAINER -->
          <div class="skill-panel-container" id="skill-panel-container">
            <button class="skill-toggle-btn" id="skill-toggle-btn" data-testid="skill-toggle" type="button">
              <span>⚡</span> <span id="skill-toggle-label">Skill ▾</span>
            </button>
            <div class="skill-deck-wrapper" id="skill-deck-wrapper">
              <div class="battle-skills-deck" id="battle-skills-slot" style="margin-top:4px;margin-bottom:2px"></div>
            </div>
          </div>
          <!-- FLOATING CHIP WHEN HIDDEN -->
          <button class="skill-fab" id="skill-fab" data-testid="skill-fab" type="button" style="display:none">
            <span>⚡</span><span id="skill-fab-energy">${s.energy ?? 2}</span>
            <span class="skill-fab-dot" id="skill-fab-dot" style="display:none"></span>
          </button>

          <!-- OPTIONS -->
          <div class="options" id="options-slot" style="margin-top:6px;margin-bottom:6px;flex:0 0 auto"></div>

          <!-- FEEDBACK & NEXT -->
          <div id="fb-slot" style="flex:0 0 auto"></div>
        </div>
      </section>
    `;

    $('#btn-abandon').onclick = () => {
      if (confirm('Yakin ingin menyerah? Pertarungan ini akan dibatalkan.')) {
        API.abandonSession(s.id);
        go('subjects');
      }
    };

    $('#btn-tts').onclick = () => {
      if (s.currentQuestion && window.Sfx) Sfx.speak(s.currentQuestion.text);
    };

    const toggleBtn = $('#skill-toggle-btn');
    if (toggleBtn) toggleBtn.onclick = () => this.toggleSkillBar();
    const fabBtn = $('#skill-fab');
    if (fabBtn) fabBtn.onclick = () => this.toggleSkillBar();

    this.renderCurrentQuestion();
  },

  async renderCurrentQuestion() {
    const s = this.session;
    const q = s.currentQuestion;
    if (!q) return;

    this.isAnswering = false;
    $('#q-counter').textContent = `Soal ${s.currentIndex + 1}/${s.totalQuestions}`;
    $('#q-text').textContent = q.text;
    $('#fb-slot').innerHTML = '';

    // Image slot
    $('#q-image-slot').innerHTML = q.imageUrl
      ? `<img class="qimage" src="${esc(q.imageUrl)}" alt="${esc(q.imageAlt || 'Soal')}" style="max-height:140px;margin-top:8px;border-radius:10px" loading="lazy">`
      : '';

    // Render option buttons
    const letters = ['A', 'B', 'C', 'D'];
    const optBox = $('#options-slot');
    optBox.innerHTML = q.options.map((optText, idx) => `
      <button class="btn opt choice-btn" data-idx="${idx}" data-testid="answer-${idx}">
        <span class="key">${letters[idx] || (idx + 1)}</span>
        <span>${esc(optText)}</span>
      </button>
    `).join('');

    $$('.opt', optBox).forEach(btn => {
      btn.onclick = () => this.handleOptionClick(parseInt(btn.dataset.idx, 10), btn);
    });

    // Check eliminated options from question / session
    if (Array.isArray(q.eliminated) && q.eliminated.length > 0) {
      q.eliminated.forEach(idx => {
        const btn = $(`#options-slot .opt[data-idx="${idx}"]`);
        if (btn) {
          btn.classList.add('eliminated');
          btn.setAttribute('aria-disabled', 'true');
          btn.disabled = true;
          btn.style.pointerEvents = 'none';
          btn.style.textDecoration = 'line-through';
          btn.style.opacity = '0.35';
        }
      });
    }

    // Render 3 Battle Skills
    this.renderSkillsDeck();

    // Auto-TTS if enabled
    if (Settings.get().tts && window.Sfx) {
      setTimeout(() => Sfx.speak(q.text), 200);
    }

    // Call readyQuestion on server & start timer
    try {
      await API.readyQuestion(s.id, s.currentIndex);
      this.startTimer(q.timeLimitSec || 20);
    } catch (e) {
      console.warn('Ready error:', e);
      this.startTimer(q.timeLimitSec || 20);
    }
  },

  startTimer(sec) {
    this.stopTimer();
    this.timeTotalSec = sec;
    this.timeRemainingSec = sec;
    const fill = $('#timer-fill');

    const updateBar = () => {
      const pct = Math.max(0, (this.timeRemainingSec / this.timeTotalSec) * 100);
      if (fill) {
        fill.style.width = `${pct}%`;
        if (this.timeRemainingSec <= 5) fill.classList.add('danger');
        else fill.classList.remove('danger');
      }
    };

    updateBar();

    this.timerInterval = setInterval(() => {
      this.timeRemainingSec -= 0.1;
      if (this.timeRemainingSec <= 0) {
        this.timeRemainingSec = 0;
        updateBar();
        this.stopTimer();
        if (!this.isAnswering) {
          this.handleTimeout();
        }
      } else {
        updateBar();
      }
    }, 100);
  },

  async handleOptionClick(chosenIndex, btnEl) {
    if (this.isAnswering) return;
    if (btnEl && (btnEl.classList.contains('eliminated') || btnEl.disabled)) return;
    this.isAnswering = true;
    this.stopTimer();
    if (window.Sfx) Sfx.play('tap');

    // Disable all options
    $$('#options-slot .opt').forEach(b => b.disabled = true);

    try {
      const result = await API.answerQuestion(this.session.id, this.session.currentIndex, chosenIndex);
      this.applyAnswerResult(result, chosenIndex, btnEl);
    } catch (e) {
      toast('Gagal mengirim jawaban: ' + e.message);
      this.isAnswering = false;
    }
  },

  async handleTimeout() {
    if (this.isAnswering) return;
    this.isAnswering = true;
    $$('#options-slot .opt').forEach(b => b.disabled = true);

    try {
      const result = await API.answerQuestion(this.session.id, this.session.currentIndex, null);
      this.applyAnswerResult(result, null, null);
    } catch (e) {
      console.warn('Timeout submit error:', e);
    }
  },

  applyAnswerResult(res, chosenIndex, chosenBtn) {
    const s = res.session;
    this.session = s;
    if (res.player) Player.data = res.player;

    const outcome = res.outcome; // CRITICAL, NORMAL, SLOW, WRONG, TIMEOUT
    const correctIdx = res.correctDisplayIndex;

    // Highlight options
    $$('#options-slot .opt').forEach((b, idx) => {
      if (idx === correctIdx) b.classList.add('correct');
      else if (idx === chosenIndex) b.classList.add('wrong');
    });

    // Floater & SFX
    if (outcome === 'CRITICAL') {
      this.showDamageFloater(`⚡ KRITIKAL! -${res.bossDamage}`, 'crit');
      this.animateBossShake();
      if (window.Sfx) Sfx.play('correct');
    } else if (outcome === 'NORMAL') {
      this.showDamageFloater(`🎯 TEPAT! -${res.bossDamage}`, 'dmg');
      this.animateBossShake();
      if (window.Sfx) Sfx.play('correct');
    } else if (outcome === 'SLOW') {
      this.showDamageFloater(`🐢 LAMBAT! -${res.bossDamage}`, 'dmg');
      this.animateBossShake();
      if (window.Sfx) Sfx.play('correct');
    } else if (outcome === 'WRONG') {
      this.showDamageFloater(`❌ SALAH! -${res.playerDamage}`, 'miss');
      if (window.Sfx) Sfx.play('wrong');
    } else if (outcome === 'TIMEOUT') {
      this.showDamageFloater(`⏰ HABIS! -${res.playerDamage}`, 'miss');
      if (window.Sfx) Sfx.play('wrong');
    } else if (outcome === 'TIMEOUT_AWAY') {
      this.showDamageFloater(`⏳ PERGI LAMA!`, 'miss');
      if (window.Sfx) Sfx.play('wrong');
    }

    // Update HP bars with coalescing to prevent undefined/NaN
    const curBossHp = res.bossHp ?? res.boss?.hp ?? s.bossHp ?? s.boss?.hp ?? 0;
    const curBossMax = s.bossMaxHp ?? s.boss?.maxHp ?? 100;
    $('#boss-hp-bar').style.width = `${(curBossHp / curBossMax) * 100}%`;
    $('#boss-hp-text').textContent = `${curBossHp} / ${curBossMax}`;

    const curPlayerHp = res.playerHp ?? s.playerHp ?? 0;
    const curPlayerMax = s.playerMaxHp ?? 100;
    $('#player-hp-bar').style.width = `${(curPlayerHp / curPlayerMax) * 100}%`;
    $('#player-hp-val').textContent = curPlayerHp;

    // Streak flame
    if (res.streak >= 2) {
      $('#streak-chip').style.display = 'inline-flex';
      $('#streak-n').textContent = res.streak;
    } else {
      $('#streak-chip').style.display = 'none';
    }

    // Update Energy Gauge & Skills Deck
    const eg = $('#energy-val');
    if (eg) eg.textContent = s.energy ?? 2;
    if (res.skills) {
      this.skills = res.skills;
    } else if (res.session && res.session.skills) {
      this.skills = res.session.skills;
    }
    this.renderSkillsDeck();

    // Feedback box & Auto-next timer
    const isWin = s.status === 'WON';
    const isLost = s.status === 'LOST';
    const isOver = isWin || isLost;

    if (isOver) {
      this.stopHeartbeat();
    }

    const fbTitle = outcome === 'CRITICAL' ? 'Luar biasa! Serangan Kritikal!'
      : outcome === 'NORMAL' ? 'Bagus sekali! Tepat sasaran!'
      : outcome === 'SLOW' ? 'Benar, tapi agak lambat! Terkena balasan!'
      : outcome === 'TIMEOUT' ? 'Waktu habis! Bos menyerangmu!'
      : outcome === 'TIMEOUT_AWAY' ? (res.notice || 'Kamu pergi cukup lama, soal dilewati.')
      : 'Kurang tepat! Bos menyerangmu!';

    const canAutoNext = !isOver && (Settings.get().autoNext !== false);
    let nextTimeout = null;
    let nextInterval = null;

    const goNext = () => {
      if (nextTimeout) clearTimeout(nextTimeout);
      if (nextInterval) clearInterval(nextInterval);
      if (isOver) {
        Screens.result.show(res);
      } else {
        this.renderCurrentQuestion();
      }
    };

    $('#fb-slot').innerHTML = `
      <div class="feedback ${outcome === 'WRONG' || outcome === 'TIMEOUT' ? 'no' : 'ok'}" style="margin-top:10px;padding:12px;border-radius:14px;background:rgba(255,255,255,.08);display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:1.6rem">${outcome === 'WRONG' || outcome === 'TIMEOUT' ? '💔' : (outcome === 'TIMEOUT_AWAY' ? '⏳' : '⭐')}</span>
          <div class="grow">
            <strong style="color:#fff">${res.notice ? esc(res.notice) : fbTitle}</strong>
            ${res.explanation ? `<div style="font-size:.8rem;color:var(--c-muted);margin-top:2px">${esc(res.explanation)}</div>` : ''}
          </div>
          <button class="btn small ${isOver ? 'primary' : 'secondary'}" id="btn-next">
            ${isOver ? 'Lihat Hasil 🏆' : 'Lanjut ➔'}
          </button>
        </div>
        ${canAutoNext ? `
          <div class="auto-next-bar" style="height:4px;background:rgba(255,255,255,0.15);border-radius:2px;overflow:hidden;cursor:pointer" title="Klik untuk lanjut segera">
            <div id="auto-next-fill" style="width:100%;height:100%;background:var(--c-primary,#10b981);transition:width 0.1s linear"></div>
          </div>
        ` : ''}
      </div>
    `;

    $('#btn-next').onclick = goNext;
    const barEl = $('.auto-next-bar');
    if (barEl) barEl.onclick = goNext;

    if (canAutoNext) {
      const duration = 2000;
      const start = Date.now();
      const fillEl = $('#auto-next-fill');
      nextInterval = setInterval(() => {
        const elapsed = Date.now() - start;
        const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
        if (fillEl) fillEl.style.width = `${remainingPct}%`;
        if (elapsed >= duration) {
          clearInterval(nextInterval);
        }
      }, 50);

      nextTimeout = setTimeout(goNext, duration);
    }
  },

  animateBossShake() {
    const box = $('#boss-svg-slot');
    if (box) {
      box.classList.remove('anim-shake');
      void box.offsetWidth;
      box.classList.add('anim-shake');
    }
  },

  showDamageFloater(text, type = 'dmg') {
    const slot = $('#damage-floater-slot');
    if (!slot) return;
    const floater = document.createElement('div');
    floater.className = `damage-floater ${type}`;
    floater.textContent = text;
    slot.appendChild(floater);
    setTimeout(() => floater.remove(), 850);
  },

  applySkillBarVisibility() {
    const hidden = !!Settings.get().skillBarHidden;
    const wrapper = $('#skill-deck-wrapper');
    const fab = $('#skill-fab');
    const toggleLabel = $('#skill-toggle-label');
    const reduced = !!Settings.get().reducedMotion;

    if (wrapper) {
      if (reduced) {
        wrapper.style.transition = 'none';
      } else {
        wrapper.style.transition = 'opacity 150ms ease, transform 150ms ease, max-height 150ms ease';
      }
      if (hidden) {
        wrapper.classList.add('hidden');
        wrapper.setAttribute('aria-hidden', 'true');
        wrapper.setAttribute('inert', '');
      } else {
        wrapper.classList.remove('hidden');
        wrapper.removeAttribute('aria-hidden');
        wrapper.removeAttribute('inert');
      }
    }

    if (toggleLabel) {
      toggleLabel.textContent = hidden ? 'Skill ▸' : 'Skill ▾';
    }

    if (fab) {
      fab.style.display = hidden ? 'flex' : 'none';
      const energyVal = this.session?.energy ?? 2;
      const fabEnergy = $('#skill-fab-energy');
      if (fabEnergy) fabEnergy.textContent = energyVal;

      const hasUsable = (this.skills || []).some(sk => sk.usable);
      const dot = $('#skill-fab-dot');
      if (dot) dot.style.display = hasUsable ? 'block' : 'none';
    }
  },

  toggleSkillBar() {
    const current = !!Settings.get().skillBarHidden;
    const next = !current;
    Settings.set('skillBarHidden', next);
    this.applySkillBarVisibility();
    API.saveSettings({ skillBarHidden: next }).catch(() => {});
  },

  async renderSkillsDeck() {
    const slot = $('#battle-skills-slot');
    if (!slot) return;
    const s = this.session;
    if (!s) { slot.innerHTML = ''; return; }

    if (!this.skills || this.skills.length === 0) {
      if (s.skills && Array.isArray(s.skills)) {
        this.skills = s.skills;
      } else {
        try {
          this.skills = await API.getGameSkills(s.id);
        } catch (e) {
          this.skills = [];
        }
      }
    }

    const skills = this.skills || [];
    if (skills.length === 0) {
      slot.innerHTML = '<span style="font-size:0.75rem;color:var(--c-muted)">Tidak ada skill terpasang</span>';
      this.applySkillBarVisibility();
      return;
    }

    slot.innerHTML = skills.map(sk => {
      const id = sk.id;
      const name = sk.name || id;
      const icon = sk.icon || '✨';
      const cost = sk.cost ?? 1;
      const usesLeft = sk.usesLeft ?? 3;
      const usable = !!sk.usable && !this.isAnswering && !this.isUsingSkill;
      const reason = sk.reason || null;

      return `
        <button class="skill-btn ${!usable ? 'dimmed' : ''}"
          id="skill-btn-${id}"
          data-testid="skill-btn-${id}"
          data-skill-id="${id}"
          aria-disabled="${!usable}"
          data-reason="${esc(reason || '')}"
          title="${esc(name)} (Biaya: ${cost} ⚡, Sisa: ${usesLeft}×)"
          type="button">
          <span class="skill-cost-badge">⚡${cost}</span>
          <span class="skill-icon">${icon}</span>
          <span class="skill-uses-badge">x${usesLeft}</span>
        </button>
      `;
    }).join('');

    $$('.skill-btn', slot).forEach(btn => {
      btn.onclick = async () => {
        const skillId = btn.dataset.skillId;
        const isAriaDisabled = btn.getAttribute('aria-disabled') === 'true';
        if (isAriaDisabled) {
          const skObj = this.skills.find(x => x.id === skillId);
          const reason = skObj?.reason || btn.dataset.reason;
          const msg = (window.GameplayConfig && GameplayConfig.SKILL_REASON_TEXT && GameplayConfig.SKILL_REASON_TEXT[reason])
            || (reason === 'NO_ENERGY' ? 'Energi ⚡ belum cukup!'
              : reason === 'NOT_APPLICABLE' ? 'Skill ini tidak dapat digunakan pada tipe soal ini.'
              : reason === 'ALREADY_USED' ? 'Batas pemakaian skill ini sudah habis!'
              : reason === 'WRONG_STATE' ? 'Tunggu giliran soal berikutnya ya!'
              : reason === 'EVENT_PENDING' ? 'Selesaikan kejutan terlebih dahulu!'
              : reason === 'NOTHING_TO_ELIMINATE' ? 'Pilihan salah sudah habis dieliminasi!'
              : 'Skill belum bisa digunakan saat ini.');
          toast(msg);
          return;
        }
        await this.useBattleSkill(skillId, btn);
      };
    });

    this.applySkillBarVisibility();
  },

  async useBattleSkill(skillId, btnEl) {
    if (this.isAnswering || this.isUsingSkill) return;
    const s = this.session;
    if (!s) return;

    this.isUsingSkill = true;
    btnEl.classList.add('loading');
    try {
      const idemKey = `skill-${s.id}-${s.currentIndex}-${skillId}-${Date.now()}`;
      const res = await API.useSkill(s.id, skillId, s.currentIndex, idemKey);

      if (res && res.ok) {
        if (window.Sfx) Sfx.play('select');
        s.energy = res.energy ? res.energy.value : s.energy;
        this.skills = res.skills || (res.session && res.session.skills) || this.skills;

        const eg = $('#energy-val');
        if (eg) eg.textContent = s.energy;

        const fx = res.effects || {};
        if (Array.isArray(fx.eliminated) && fx.eliminated.length > 0) {
          fx.eliminated.forEach(idx => {
            const optBtn = $(`#options-slot .opt[data-idx="${idx}"]`);
            if (optBtn) {
              optBtn.classList.add('eliminated');
              optBtn.setAttribute('aria-disabled', 'true');
              optBtn.disabled = true;
              optBtn.style.pointerEvents = 'none';
              optBtn.style.textDecoration = 'line-through';
              optBtn.style.opacity = '0.35';
            }
          });
          toast(`Skill ${fx.name || skillId}: ${fx.eliminated.length} opsi salah dicoret! 🎯`);
        }

        if (fx.healed) {
          s.playerHp = res.player?.hp ?? Math.min(s.playerMaxHp, s.playerHp + fx.healed);
          const hpVal = $('#player-hp-val');
          if (hpVal) hpVal.textContent = s.playerHp;
          const hpBar = $('#player-hp-bar');
          if (hpBar) hpBar.style.width = `${(s.playerHp / s.playerMaxHp) * 100}%`;
          this.showDamageFloater(`+${fx.healed} HP`, 'heal');
          toast(`Memulihkan ${fx.healed} HP! ❤️`);
        }

        if (fx.shield) {
          const sc = $('#active-shield-chip');
          if (sc) {
            sc.style.display = 'inline-flex';
            const sv = $('#shield-val');
            if (sv) sv.textContent = fx.shield;
          }
          toast(`Perisai ${fx.shield} aktif! 🛡️`);
        }

        if (fx.extraTimeMs) {
          const addSec = Math.round(fx.extraTimeMs / 1000);
          this.timeRemainingSec += addSec;
          toast(`Waktu bertambah +${addSec} detik! ⏱️`);
        }

        if (skillId === 'power_strike') {
          toast('Kekuatan serangan berikutnya berlipat ganda! 💥');
        }
      }
    } catch (e) {
      const reason = e.data?.reason || e.code;
      const msg = (window.GameplayConfig && GameplayConfig.SKILL_REASON_TEXT && GameplayConfig.SKILL_REASON_TEXT[reason]) || (e.message || 'Gagal menggunakan skill');
      toast(msg);
    } finally {
      this.isUsingSkill = false;
      btnEl.classList.remove('loading');
      this.renderSkillsDeck();
    }
  }
};

/* ============================================================
   SCREEN: Result (Hasil Pertarungan)
   ============================================================ */
Screens.result = {
  data: null,
  show(res) {
    this.data = res;
    go('result');
  },

  render(app) {
    const r = this.data;
    if (!r) return go('subjects');
    const s = r.session;
    const isWon = s.status === 'WON';

    if (isWon && window.Sfx) Sfx.play('win');
    else if (!isWon && window.Sfx) Sfx.play('lose');

    const starsStr = s.stars > 0 ? '⭐'.repeat(s.stars) : '☆☆☆';
    const monsterSvg = Monsters.renderMonster(s.monster, { size: 140 });

    app.innerHTML = `
      <section class="screen active center-col stack">
        <div style="font-size:2.8rem;margin-bottom:-10px">${isWon ? '👑' : '🛡️'}</div>
        <h1 class="brand" style="color:${isWon ? 'var(--c-primary)' : '#94a3b8'}">
          ${isWon ? 'Kemenangan Telak!' : 'Pertarungan Sengit!'}
        </h1>
        <p class="tagline">${isWon ? `Kamu berhasil mengalahkan ${esc(s.monster.name)}!` : 'Bos masih terlalu tangguh. Jangan patah arang!'}</p>

        <div class="card" style="padding:16px;width:min(340px,100%);text-align:center;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong)">
          <div style="margin:0 auto 10px auto;width:140px;height:140px">${monsterSvg}</div>
          <div style="font-size:1.8rem;margin-bottom:8px">${starsStr}</div>
          <div style="display:flex;justify-content:space-around;font-size:.9rem;padding:10px 0;border-top:1px solid rgba(255,255,255,.1)">
            <div>
              <div style="color:var(--c-muted);font-size:.75rem">XP Didapat</div>
              <strong style="color:var(--c-good)">+${s.xpEarned} XP</strong>
            </div>
            <div>
              <div style="color:var(--c-muted);font-size:.75rem">Koin</div>
              <strong style="color:var(--c-primary)">+${s.coinsEarned} 🪙</strong>
            </div>
            <div>
              <div style="color:var(--c-muted);font-size:.75rem">Max Combo</div>
              <strong style="color:var(--c-info)">🔥 ${s.maxStreak}×</strong>
            </div>
          </div>
        </div>

        <div class="stack" style="width:min(340px,100%);gap:10px;margin-top:10px">
          <button class="btn block" id="btn-replay">⚔️ Main Lagi</button>
          <button class="btn block secondary" id="btn-menu">🏠 Kembali ke Menu</button>
        </div>
      </section>
    `;

    $('#btn-replay').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('subjects'); };
    $('#btn-menu').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('home'); };
  }
};

/* ============================================================
   SCREEN: Profil (Ringkasan, Skin, Skill, Toko, Riwayat)
   ============================================================ */
Screens.profil = {
  activeTab: 'ringkasan',
  profileData: null,
  inventoryData: null,
  shopData: null,
  skillsData: null,
  historyData: null,
  avatarDraft: null,

  showConfirmModal(title, message, confirmText, onConfirm) {
    const existing = $('.modal-mask');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal-mask active';
    modal.setAttribute('data-testid', 'confirm-modal');
    modal.innerHTML = `
      <div class="modal card" data-testid="confirm-modal" style="max-width:340px;text-align:center;padding:20px;border:1px solid var(--c-surface-strong)">
        <h3 style="font-size:1.15rem;margin:0 0 8px 0;color:#fff">${esc(title)}</h3>
        <p style="font-size:0.9rem;color:var(--c-muted);margin:0 0 16px 0;line-height:1.4">${esc(message)}</p>
        <div style="display:flex;gap:10px;justify-content:center">
          <button class="btn ghost small grow" id="modal-cancel">Batal</button>
          <button class="btn primary small grow" id="modal-confirm">${esc(confirmText || 'Lanjutkan')}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    $('#modal-cancel', modal).onclick = () => modal.remove();
    $('#modal-confirm', modal).onclick = async () => {
      const confirmBtn = $('#modal-confirm', modal);
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Memproses...';
      try {
        await onConfirm();
        modal.remove();
      } catch (e) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = esc(confirmText || 'Lanjutkan');
        toast('Gagal: ' + (e.message || e.code));
      }
    };
  },

  async render(app, params = {}) {
    if (params.tab) this.activeTab = params.tab;

    app.innerHTML = `
      <section class="screen active stack" id="profile-view" data-testid="screen-profil" style="height:100dvh;max-height:100dvh;overflow:hidden;display:flex;flex-direction:column">
        <!-- Top HUD -->
        <div class="hud" style="margin-bottom:4px;flex:0 0 auto">
          <button class="icon-btn" id="prof-back" title="Kembali ke Beranda">←</button>
          <h2 class="hud-title">Profil Petualang</h2>
          <div class="chip accent" id="prof-coin-chip" data-testid="coin-balance" style="font-weight:700">
            🪙 <span id="prof-coins-val">${Player.data?.coins ?? 0}</span>
          </div>
        </div>

        <!-- Tab Buttons (5 Tab) -->
        <div class="tab-bar" style="display:flex;gap:4px;overflow-x:auto;padding:2px 4px 6px 4px;flex:0 0 auto">
          <button class="btn small tab-btn ${this.activeTab === 'ringkasan' ? 'active' : 'ghost'}" data-testid="tab-ringkasan" data-tab="ringkasan">👤 Ringkasan</button>
          <button class="btn small tab-btn ${this.activeTab === 'skin' ? 'active' : 'ghost'}" data-testid="tab-skin" data-tab="skin">🎒 Skin</button>
          <button class="btn small tab-btn ${this.activeTab === 'skill' ? 'active' : 'ghost'}" data-testid="tab-skill" data-tab="skill">⚡ Skill</button>
          <button class="btn small tab-btn ${this.activeTab === 'toko' ? 'active' : 'ghost'}" data-testid="tab-toko" data-tab="toko">🛒 Toko</button>
          <button class="btn small tab-btn ${this.activeTab === 'riwayat' ? 'active' : 'ghost'}" data-testid="tab-riwayat" data-tab="riwayat">📜 Riwayat</button>
        </div>

        <!-- Internal Scrollable Content Box (100dvh) -->
        <div class="q-scroll-box grow stack" id="profile-tab-content" style="overflow-y:auto;overflow-x:hidden;flex:1 1 auto;padding:6px 4px 24px 4px;gap:12px">
          <div style="text-align:center;padding:30px;color:var(--c-muted)">Memuat data profil...</div>
        </div>
      </section>
    `;

    $('#prof-back').onclick = () => {
      if (window.Sfx) Sfx.play('tap');
      go('home');
    };

    $$('.tab-btn', app).forEach(btn => {
      btn.onclick = () => {
        if (window.Sfx) Sfx.play('tap');
        this.activeTab = btn.dataset.tab;
        $$('.tab-btn', app).forEach(b => {
          if (b.dataset.tab === this.activeTab) {
            b.classList.remove('ghost');
            b.classList.add('active');
          } else {
            b.classList.add('ghost');
            b.classList.remove('active');
          }
        });
        this.renderActiveTab();
      };
    });

    await this.loadData();
    this.renderActiveTab();
  },

  async loadData() {
    try {
      this.profileData = await API.getProfile();
      if (this.profileData?.player) {
        Player.data = { ...Player.data, ...this.profileData.player, avatar: this.profileData.avatar };
      }
      this.avatarDraft = JSON.parse(JSON.stringify(this.profileData?.avatar || {}));
      const coinEl = $('#prof-coins-val');
      if (coinEl && this.profileData?.player) coinEl.textContent = this.profileData.player.coins;
    } catch (e) {
      console.warn('Load profile failed:', e);
    }
  },

  async renderActiveTab() {
    const slot = $('#profile-tab-content');
    if (!slot) return;

    if (this.activeTab === 'ringkasan') {
      this.renderTabRingkasan(slot);
    } else if (this.activeTab === 'skin') {
      await this.renderTabSkin(slot);
    } else if (this.activeTab === 'skill') {
      await this.renderTabSkill(slot);
    } else if (this.activeTab === 'toko') {
      await this.renderTabToko(slot);
    } else if (this.activeTab === 'riwayat') {
      await this.renderTabRiwayat(slot);
    }
  },

  renderTabRingkasan(slot) {
    const p = this.profileData?.player || Player.data || {};
    const stats = this.profileData?.stats || {};
    const badges = this.profileData?.badges || [];
    const skills = this.profileData?.skills || {};
    const avatarSvg = window.Avatar ? Avatar.renderAvatar(this.profileData?.avatar || {}) : '🎒';

    slot.innerHTML = `
      <!-- HERO BANNER -->
      <div class="card" style="padding:16px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong);display:flex;gap:14px;align-items:center">
        <div style="width:72px;height:72px;border-radius:18px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;overflow:hidden;flex:0 0 auto">
          ${avatarSvg}
        </div>
        <div class="grow" style="min-width:0">
          <div style="font-weight:800;font-size:1.1rem;color:#fff">${esc(p.nick || 'Petualang')}</div>
          <div style="font-size:0.8rem;color:var(--c-muted);margin:2px 0 6px 0">
            <span style="color:var(--c-primary);font-weight:700">Lv. ${p.level || 1}</span> · ${esc(p.title || 'Petualang Pemula')} · ${esc(p.className || 'Kelas 4 SD')}
          </div>
          <div class="xp-track" style="height:6px;background:rgba(255,255,255,0.1);border-radius:99px;overflow:hidden">
            <div class="xp-fill" style="width:${Math.min(100, Math.round(((p.xp || 0) / (p.xpForNext || 100)) * 100))}%"></div>
          </div>
          <div style="font-size:0.72rem;color:var(--c-muted);margin-top:3px;text-align:right">
            ${p.xp || 0} / ${p.xpForNext || 100} XP
          </div>
        </div>
      </div>

      <!-- STATS GRID 2x2 -->
      <h3 style="font-size:0.95rem;margin:10px 0 6px 4px;color:var(--c-muted)">📊 Statistik Petualangan</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div class="card" style="padding:12px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong);text-align:center">
          <div style="font-size:1.3rem">⚔️</div>
          <div style="font-size:1.15rem;font-weight:800;color:#fff;margin:2px 0">${stats.bossDefeated || 0}</div>
          <div style="font-size:0.75rem;color:var(--c-muted)">Bos Dikalahkan</div>
        </div>
        <div class="card" style="padding:12px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong);text-align:center">
          <div style="font-size:1.3rem">🎯</div>
          <div style="font-size:1.15rem;font-weight:800;color:#fff;margin:2px 0">${stats.accuracy || 0}%</div>
          <div style="font-size:0.75rem;color:var(--c-muted)">Akurasi Jawaban</div>
        </div>
        <div class="card" style="padding:12px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong);text-align:center">
          <div style="font-size:1.3rem">🏆</div>
          <div style="font-size:1.15rem;font-weight:800;color:#fff;margin:2px 0">${stats.winRate || 0}%</div>
          <div style="font-size:0.75rem;color:var(--c-muted)">Rasio Menang</div>
        </div>
        <div class="card" style="padding:12px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong);text-align:center">
          <div style="font-size:1.3rem">⭐</div>
          <div style="font-size:1.15rem;font-weight:800;color:#fff;margin:2px 0">${stats.stars || 0} / 🔥 ${stats.bestStreak || 0}</div>
          <div style="font-size:0.75rem;color:var(--c-muted)">Bintang & Best Combo</div>
        </div>
      </div>

      <!-- LENCANA PRESTASI -->
      <h3 style="font-size:0.95rem;margin:12px 0 6px 4px;color:var(--c-muted)">🏅 Lencana Prestasi (${badges.length})</h3>
      <div class="card" style="padding:12px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong)">
        ${badges.length === 0
          ? `<p style="font-size:0.85rem;color:var(--c-muted);margin:0;text-align:center">Belum ada lencana. Terus kalahkan monster bos!</p>`
          : `<div style="display:flex;flex-wrap:wrap;gap:8px">
              ${badges.map(b => `
                <div class="chip good" style="font-size:0.8rem;padding:6px 10px;border-radius:8px">
                  <span>${b.icon || '🏅'}</span>
                  <span>${esc(b.name)}</span>
                </div>
              `).join('')}
            </div>`
        }
      </div>

      <!-- LOADOUT SKILL RINGKAS -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin:12px 4px 6px 4px">
        <h3 style="font-size:0.95rem;margin:0;color:var(--c-muted)">⚡ Loadout Skill Aktif</h3>
        <button class="btn ghost small" id="btn-quick-manage-skills" style="padding:2px 8px;font-size:0.75rem">Atur Skill ➔</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px">
        ${(skills.loadout || []).slice(0, 3).map((item, idx) => {
          const s = typeof item === 'object' ? item : { id: item, name: item, icon: '⚡', level: 1 };
          return `
            <div class="card" style="padding:10px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong);text-align:center">
              <div style="font-size:1.4rem">${s.icon || '⚡'}</div>
              <div style="font-size:0.8rem;font-weight:700;color:#fff;margin:2px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.name || s.id)}</div>
              <div style="font-size:0.7rem;color:var(--c-primary)">Lv. ${s.level || 1}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    const qms = $('#btn-quick-manage-skills');
    if (qms) {
      qms.onclick = () => {
        this.activeTab = 'skill';
        $$('.tab-btn').forEach(b => {
          if (b.dataset.tab === 'skill') b.className = 'btn small tab-btn active';
          else b.className = 'btn small tab-btn ghost';
        });
        this.renderActiveTab();
      };
    }
  },

  async renderTabSkin(slot) {
    slot.innerHTML = `<div style="text-align:center;padding:30px;color:var(--c-muted)">Memuat koleksi skin...</div>`;
    let inv = null;
    try {
      inv = await API.getInventory();
      this.inventoryData = inv;
    } catch (e) {
      slot.innerHTML = `<div style="color:var(--c-bad)">Gagal memuat skin: ${esc(e.message)}</div>`;
      return;
    }

    const currentAvatar = this.avatarDraft || {};
    const items = inv.items || [];

    slot.innerHTML = `
      <!-- AVATAR LIVE PREVIEW -->
      <div class="card" style="padding:16px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong);text-align:center">
        <div id="avatar-live-box" style="width:130px;height:130px;margin:0 auto;border-radius:24px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;overflow:hidden">
          ${Avatar.renderAvatar(currentAvatar)}
        </div>
        <div style="margin-top:8px;font-size:0.85rem;color:var(--c-muted)">Pratinjau Avatar Langsung</div>
      </div>

      <!-- FILTER KATEGORI -->
      <div class="skin-filter-bar" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px">
        <button class="btn small skin-cat-btn active" data-cat="ALL">Semua</button>
        <button class="btn small skin-cat-btn ghost" data-cat="hat">Topi</button>
        <button class="btn small skin-cat-btn ghost" data-cat="outfit">Pakaian</button>
        <button class="btn small skin-cat-btn ghost" data-cat="weapon">Senjata</button>
        <button class="btn small skin-cat-btn ghost" data-cat="pet">Hewan</button>
        <button class="btn small skin-cat-btn ghost" data-cat="bg">Latar</button>
        <button class="btn small skin-cat-btn ghost" data-cat="frame">Bingkai</button>
      </div>

      <!-- GRID ITEM MILIK -->
      <div class="skin-grid" id="skin-items-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(130px, 1fr));gap:8px"></div>
    `;

    const renderItems = (catFilter = 'ALL') => {
      const grid = $('#skin-items-grid');
      if (!grid) return;
      const filtered = catFilter === 'ALL' ? items : items.filter(it => it.slot === catFilter);

      if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--c-muted)">Tidak ada item untuk kategori ini.</div>`;
        return;
      }

      grid.innerHTML = filtered.map(it => {
        const isEquipped = currentAvatar[it.slot] === it.id;
        const rarityColor = it.rarity === 'LEGENDARY' ? '#f59e0b' : it.rarity === 'EPIC' ? '#a855f7' : it.rarity === 'RARE' ? '#3b82f6' : '#94a3b8';

        return `
          <div class="card item-card" data-testid="item-card-${it.id}" style="padding:10px;background:var(--c-surface);border-radius:var(--radius);border:1px solid ${isEquipped ? 'var(--c-primary)' : 'var(--c-surface-strong)'};text-align:center;display:flex;flex-direction:column;gap:6px">
            <div style="font-size:0.7rem;font-weight:700;color:${rarityColor}">${it.rarity}</div>
            <div style="font-weight:700;font-size:0.85rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(it.name)}</div>
            <div style="font-size:0.75rem;color:var(--c-muted)">${esc(it.slot)}</div>
            <div style="margin-top:auto;padding-top:4px">
              ${isEquipped
                ? `<span class="chip good" style="font-size:0.75rem;padding:3px 8px">Terpasang</span>`
                : `<button class="btn small primary block" data-testid="item-equip-${it.id}" data-id="${it.id}" data-slot="${it.slot}">Pakai</button>`
              }
            </div>
          </div>
        `;
      }).join('');

      $$('#skin-items-grid button[data-testid^="item-equip-"]').forEach(btn => {
        btn.onclick = async () => {
          const itemId = btn.dataset.id;
          const slot = btn.dataset.slot;
          currentAvatar[slot] = itemId;
          this.avatarDraft = currentAvatar;

          btn.disabled = true;
          btn.textContent = 'Memasang...';

          try {
            await API.updateAvatar(currentAvatar);
            toast('Skin berhasil dipakai! ✨');
            if (this.profileData) this.profileData.avatar = currentAvatar;
            $('#avatar-live-box').innerHTML = Avatar.renderAvatar(currentAvatar);
            renderItems(catFilter);
          } catch (e) {
            toast('Gagal memasang skin: ' + (e.message || e.code));
            btn.disabled = false;
            btn.textContent = 'Pakai';
          }
        };
      });
    };

    $$('.skin-cat-btn').forEach(btn => {
      btn.onclick = () => {
        $$('.skin-cat-btn').forEach(b => {
          if (b === btn) { b.classList.remove('ghost'); b.classList.add('active'); }
          else { b.classList.add('ghost'); b.classList.remove('active'); }
        });
        renderItems(btn.dataset.cat);
      };
    });

    renderItems('ALL');
  },

  async renderTabSkill(slot) {
    slot.innerHTML = `<div style="text-align:center;padding:30px;color:var(--c-muted)">Memuat skill petualangan...</div>`;
    let skillsRes = null;
    try {
      skillsRes = await API.getSkills();
      this.skillsData = skillsRes;
    } catch (e) {
      slot.innerHTML = `<div style="color:var(--c-bad)">Gagal memuat skill: ${esc(e.message)}</div>`;
      return;
    }

    const playerCoins = Player.data?.coins ?? 0;
    const loadout = skillsRes.loadout || [];
    const skillsList = skillsRes.skills || [];

    slot.innerHTML = `
      <!-- LOADOUT 3 SLOT -->
      <div class="card" style="padding:14px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong)">
        <h3 style="font-size:0.95rem;margin:0 0 10px 0;color:#fff">🎯 Loadout Skill Laga (3 Slot)</h3>
        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px">
          ${[0, 1, 2].map(idx => {
            const skillId = loadout[idx];
            const sk = skillId ? skillsList.find(x => x.id === skillId) : null;
            return `
              <div class="loadout-slot card" data-testid="loadout-slot-${idx}" style="padding:10px 4px;background:rgba(255,255,255,0.04);border:1px dashed ${sk ? 'var(--c-primary)' : 'rgba(255,255,255,0.2)'};border-radius:12px;text-align:center">
                <div style="font-size:1.5rem">${sk ? sk.icon : '➕'}</div>
                <div style="font-size:0.75rem;font-weight:700;color:#fff;margin:2px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  ${sk ? esc(sk.name) : `Slot ${idx + 1}`}
                </div>
                <div style="font-size:0.7rem;color:var(--c-muted)">${sk ? `Lv. ${sk.level}` : 'Kosong'}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- DAFTAR 9 SKILL -->
      <h3 style="font-size:0.95rem;margin:12px 0 6px 4px;color:var(--c-muted)">⚡ 9 Taktik Skill Petualang</h3>
      <div class="stack" style="gap:10px" id="skills-cards-list"></div>
    `;

    const cardsContainer = $('#skills-cards-list');
    cardsContainer.innerHTML = skillsList.map(s => {
      const isMax = s.level >= 5;
      const cost = s.upgradeCost || 0;
      const canAfford = playerCoins >= cost;
      const isEquipped = loadout.includes(s.id);

      return `
        <div class="card skill-card" data-testid="skill-card-${s.id}" style="padding:14px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong);display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:1.6rem">${s.icon || '⚡'}</span>
              <div>
                <strong style="color:#fff;font-size:0.95rem">${esc(s.name)}</strong>
                <div style="font-size:0.75rem;color:var(--c-muted)">
                  ${s.unlocked ? `<span style="color:var(--c-primary);font-weight:700">Lv. ${s.level}/5</span>` : `<span style="color:#ef4444">Terkunci (Buka di Lv. ${s.unlockLevel})</span>`}
                </div>
              </div>
            </div>
            ${isEquipped ? `<span class="chip good" style="font-size:0.75rem">Dipasang</span>` : ''}
          </div>

          <div style="font-size:0.82rem;color:#cbd5e1;line-height:1.35">
            <b>Efek:</b> ${esc(s.descCurrent || s.description || 'Efek taktis')}
          </div>

          ${!isMax && s.descNext ? `
            <div style="font-size:0.78rem;color:var(--c-muted)">
              <b>Berikutnya (Lv.${s.level + 1}):</b> ${esc(s.descNext)}
            </div>
          ` : ''}

          <div style="display:flex;gap:8px;align-items:center;margin-top:4px">
            <button class="btn small grow ${isMax ? 'ghost' : (!canAfford ? 'secondary' : 'primary')}"
              data-testid="skill-upgrade-${s.id}"
              data-id="${s.id}"
              ${isMax || !canAfford || !s.unlocked ? 'disabled' : ''}>
              ${isMax ? 'MAX' : (!canAfford ? `Kurang ${cost - playerCoins} 🪙` : `Upgrade (${cost} 🪙)`)}
            </button>
            ${s.unlocked && !isEquipped ? `
              <button class="btn small ghost btn-equip-skill" data-id="${s.id}">Pasang</button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Wire Upgrade Buttons
    $$('#skills-cards-list button[data-testid^="skill-upgrade-"]').forEach(btn => {
      btn.onclick = () => {
        const skillId = btn.dataset.id;
        const sk = skillsList.find(x => x.id === skillId);
        if (!sk) return;

        this.showConfirmModal(
          `Upgrade ${sk.name}?`,
          `Tingkatkan skill ${sk.name} ke Level ${sk.level + 1} dengan biaya ${sk.upgradeCost} 🪙?`,
          `Upgrade (${sk.upgradeCost} 🪙)`,
          async () => {
            const idemKey = `upg-${sk.id}-${sk.level}-${Date.now()}`;
            const upgRes = await API.upgradeSkill(sk.id, idemKey);
            if (upgRes.ok) {
              toast(`Skill ${sk.name} berhasil naik ke Level ${upgRes.newLevel}! ✨`);
              if (Player.data) Player.data.coins = upgRes.coins;
              const coinEl = $('#prof-coins-val');
              if (coinEl) coinEl.textContent = upgRes.coins;
              await this.renderActiveTab();
            }
          }
        );
      };
    });

    // Wire Equip to loadout
    $$('.btn-equip-skill').forEach(btn => {
      btn.onclick = async () => {
        const skillId = btn.dataset.id;
        const newLoadout = [...loadout];
        if (newLoadout.length < 3) {
          newLoadout.push(skillId);
        } else {
          newLoadout[2] = skillId;
        }
        btn.disabled = true;
        try {
          await API.updateLoadout(newLoadout);
          toast('Loadout skill berhasil diperbarui! 🎯');
          await this.renderActiveTab();
        } catch (e) {
          toast('Gagal memperbarui loadout: ' + (e.message || e.code));
          btn.disabled = false;
        }
      };
    });
  },

  async renderTabToko(slot) {
    slot.innerHTML = `<div style="text-align:center;padding:30px;color:var(--c-muted)">Membuka etalase toko...</div>`;
    let shopRes = null;
    try {
      shopRes = await API.getShop();
      this.shopData = shopRes;
    } catch (e) {
      slot.innerHTML = `<div style="color:var(--c-bad)">Gagal memuat toko: ${esc(e.message)}</div>`;
      return;
    }

    const playerCoins = Player.data?.coins ?? 0;
    const boxPrice = shopRes.mysteryBoxPrice || 60;
    const canAffordBox = playerCoins >= boxPrice;
    const items = shopRes.items || [];

    slot.innerHTML = `
      <!-- MYSTERY BOX CARD -->
      <div class="card" style="padding:16px;background:linear-gradient(135deg, rgba(245,158,11,0.12), rgba(168,85,247,0.12));border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius);text-align:center">
        <div style="font-size:2.4rem;margin-bottom:4px">🎁</div>
        <h3 style="font-size:1.1rem;margin:0 0 4px 0;color:#fff">Kotak Misteri Ajaib</h3>
        <p style="font-size:0.82rem;color:var(--c-muted);margin:0 0 12px 0;line-height:1.4">
          Dapatkan 1 skin acak untuk memperkeren avatarmu! Jika item sudah dimiliki, 20 koin dikembalikan otomatis.
        </p>
        <button class="btn ${canAffordBox ? 'primary' : 'secondary'} block" id="btn-buy-box" data-testid="buy-mystery-box" ${!canAffordBox ? 'disabled' : ''}>
          ${canAffordBox ? `Buka Kotak (${boxPrice} 🪙)` : `Kurang ${boxPrice - playerCoins} 🪙`}
        </button>
      </div>

      <!-- KATALOG ITEM SKIN -->
      <h3 style="font-size:0.95rem;margin:12px 0 6px 4px;color:var(--c-muted)">🎒 Katalog Skin & Item</h3>
      <div class="shop-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(135px, 1fr));gap:8px">
        ${items.length === 0
          ? `<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--c-muted)">Semua item toko telah dimiliki! Hebat! 🎉</div>`
          : items.map(it => {
            const canAfford = playerCoins >= it.price;
            const rarityColor = it.rarity === 'LEGENDARY' ? '#f59e0b' : it.rarity === 'EPIC' ? '#a855f7' : it.rarity === 'RARE' ? '#3b82f6' : '#94a3b8';
            return `
              <div class="card item-card" data-testid="item-card-${it.id}" style="padding:10px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong);text-align:center;display:flex;flex-direction:column;gap:6px">
                <div style="font-size:0.7rem;font-weight:700;color:${rarityColor}">${it.rarity}</div>
                <div style="font-weight:700;font-size:0.85rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(it.name)}</div>
                <div style="font-size:0.75rem;color:var(--c-muted)">${esc(it.slot)}</div>
                <div style="font-size:0.85rem;font-weight:700;color:#fbbf24;margin-top:auto">🪙 ${it.price}</div>
                <button class="btn small ${canAfford ? 'primary' : 'secondary'} block"
                  data-testid="item-buy-${it.id}"
                  data-id="${it.id}"
                  ${!canAfford ? 'disabled' : ''}>
                  ${canAfford ? `Beli` : `Kurang ${it.price - playerCoins} 🪙`}
                </button>
              </div>
            `;
          }).join('')
        }
      </div>
    `;

    // Wire Buy Mystery Box
    const buyBoxBtn = $('#btn-buy-box');
    if (buyBoxBtn) {
      buyBoxBtn.onclick = () => {
        this.showConfirmModal(
          'Buka Kotak Misteri?',
          `Buka Kotak Misteri seharga ${boxPrice} koin?`,
          `Beli (${boxPrice} 🪙)`,
          async () => {
            const idemKey = `box-${Date.now()}`;
            const res = await API.buyMysteryBox(idemKey);
            if (res.ok) {
              if (Player.data) Player.data.coins = res.coins;
              const coinEl = $('#prof-coins-val');
              if (coinEl) coinEl.textContent = res.coins;

              const it = res.item || {};
              const isDupe = res.isDuplicate;
              const msg = isDupe
                ? `Kamu mendapatkan ${it.name} (Duplikat). +${res.refund} koin dikembalikan!`
                : `Selamat! Kamu mendapatkan ${it.name} (${it.rarity})! 🎉`;
              toast(msg);
              await this.renderActiveTab();
            }
          }
        );
      };
    }

    // Wire Buy Item Buttons
    $$('.shop-grid button[data-testid^="item-buy-"]').forEach(btn => {
      btn.onclick = () => {
        const itemId = btn.dataset.id;
        const it = items.find(x => x.id === itemId);
        if (!it) return;

        this.showConfirmModal(
          `Beli ${it.name}?`,
          `Beli ${it.name} (${it.rarity}) seharga ${it.price} koin?`,
          `Beli (${it.price} 🪙)`,
          async () => {
            const idemKey = `buy-${it.id}-${Date.now()}`;
            const res = await API.buyShopItem(it.id, idemKey);
            if (res.ok) {
              toast(`Berhasil membeli ${it.name}! Cek di tab Skin. 🎒`);
              if (Player.data) Player.data.coins = res.coins;
              const coinEl = $('#prof-coins-val');
              if (coinEl) coinEl.textContent = res.coins;
              await this.renderActiveTab();
            }
          }
        );
      };
    });
  },

  async renderTabRiwayat(slot) {
    slot.innerHTML = `<div style="text-align:center;padding:30px;color:var(--c-muted)">Memuat catatan transaksi koin...</div>`;
    let histRes = null;
    try {
      histRes = await API.getCoinHistory(50);
      this.historyData = histRes;
    } catch (e) {
      slot.innerHTML = `<div style="color:var(--c-bad)">Gagal memuat riwayat: ${esc(e.message)}</div>`;
      return;
    }

    const items = histRes.items || histRes.history || [];

    if (items.length === 0) {
      slot.innerHTML = `
        <div class="card" style="padding:24px;background:var(--c-surface);border-radius:var(--radius);text-align:center;color:var(--c-muted)">
          Belum ada catatan mutasi koin.
        </div>
      `;
      return;
    }

    slot.innerHTML = `
      <div class="history-list stack" style="gap:8px">
        ${items.map(tx => {
          const delta = tx.delta !== undefined ? tx.delta : tx.amount;
          const isPos = delta > 0;
          const dateStr = tx.createdAt ? new Date(tx.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

          return `
            <div class="card history-row" data-testid="history-row" style="padding:12px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong);display:flex;justify-content:space-between;align-items:center">
              <div>
                <strong style="color:#fff;font-size:0.88rem">${esc(tx.label || tx.reason)}</strong>
                <div style="font-size:0.72rem;color:var(--c-muted);margin-top:2px">${dateStr}</div>
              </div>
              <div style="text-align:right">
                <div style="font-weight:800;font-size:0.95rem;color:${isPos ? 'var(--c-good,#10b981)' : '#ef4444'}">
                  ${isPos ? '+' : ''}${delta} 🪙
                </div>
                <div style="font-size:0.72rem;color:var(--c-muted);margin-top:2px">Saldo: ${tx.balanceAft ?? tx.balance ?? 0} 🪙</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};

/* ============================================================
   SCREEN: Monsterdex (Katalog 100 Monster)
   ============================================================ */
Screens.dex = {
  currentTheme: 'ALL',
  allMonsters: [],

  async render(app) {
    app.innerHTML = `
      <section class="screen active stack" style="gap:10px">
        <div class="hud" style="margin-bottom:0">
          <button class="icon-btn" id="dex-back">←</button>
          <h2 class="hud-title">Monsterdex (<span id="dex-count">0</span>/100)</h2>
          <span class="chip accent">📖 Katalog</span>
        </div>

        <!-- THEME TABS -->
        <div class="dextabs" id="dex-tabs" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px">
          <button class="btn small ${this.currentTheme === 'ALL' ? '' : 'ghost'}" data-theme="ALL">Semua</button>
          ${Monsters.THEMES.map(t => `<button class="btn small ${this.currentTheme === t.id ? '' : 'ghost'}" data-theme="${t.id}">${t.label}</button>`).join('')}
        </div>

        <!-- MONSTER GRID -->
        <div class="dex-grid grow" id="dex-grid" style="overflow-y:auto;padding-bottom:20px">
          <div style="text-align:center;padding:40px;color:var(--c-muted)">Membuka buku monster...</div>
        </div>
      </section>
    `;

    $('#dex-back').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('home'); };

    $$('#dex-tabs button').forEach(btn => {
      btn.onclick = () => {
        this.currentTheme = btn.dataset.theme;
        $$('#dex-tabs button').forEach(b => b.className = `btn small ${b.dataset.theme === this.currentTheme ? '' : 'ghost'}`);
        this.renderGrid();
      };
    });

    try {
      this.allMonsters = await API.getDex();
      const discoveredCount = this.allMonsters.filter(m => m.encountered || m.defeated).length;
      $('#dex-count').textContent = discoveredCount;
      this.renderGrid();
    } catch (e) {
      $('#dex-grid').innerHTML = `<div style="text-align:center;color:var(--c-bad)">Gagal memuat monsterdex: ${esc(e.message)}</div>`;
    }
  },

  renderGrid() {
    const grid = $('#dex-grid');
    const filtered = this.currentTheme === 'ALL'
      ? this.allMonsters
      : this.allMonsters.filter(m => m.theme === this.currentTheme);

    grid.innerHTML = filtered.map(m => {
      const isKnown = m.encountered || m.defeated;
      const fullM = Monsters.MONSTERS.find(x => x.id === m.id) || m;
      const svg = isKnown ? Monsters.renderMonster(fullM, { size: 68 }) : `<div style="font-size:2.2rem;line-height:68px;opacity:.2">❓</div>`;

      return `
        <div class="dex-cell ${isKnown ? '' : 'unknown'}" data-id="${m.id}" style="cursor:pointer;background:var(--c-surface);border:1px solid var(--c-surface-strong);border-radius:12px;padding:8px 4px;display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="width:68px;height:68px;display:flex;align-items:center;justify-content:center">${svg}</div>
          <div style="font-size:.72rem;font-weight:800;color:${isKnown ? '#fff' : 'var(--c-muted)'};text-align:center">
            ${isKnown ? esc(m.name) : `??? #${m.id}`}
          </div>
          ${isKnown && m.bestStars ? `<div style="font-size:.65rem;color:var(--c-primary)">${'⭐'.repeat(m.bestStars)}</div>` : ''}
        </div>
      `;
    }).join('');

    $$('.dex-cell', grid).forEach(cell => {
      cell.onclick = () => {
        const mid = parseInt(cell.dataset.id, 10);
        const m = this.allMonsters.find(x => x.id === mid);
        if (m) this.openMonsterModal(m);
      };
    });
  },

  openMonsterModal(m) {
    const isKnown = m.encountered || m.defeated;
    const fullM = Monsters.MONSTERS.find(x => x.id === m.id) || m;
    const modal = document.createElement('div');
    modal.className = 'modal-mask active';
    modal.innerHTML = `
      <div class="modal" style="text-align:center">
        <div style="width:120px;height:120px;margin:0 auto 10px auto">
          ${isKnown ? Monsters.renderMonster(fullM, { size: 120 }) : `<div style="font-size:4rem;line-height:120px;opacity:.3">❓</div>`}
        </div>
        <div class="modal-title" style="margin-bottom:2px">${isKnown ? esc(m.name) : `Monster #${m.id}`}</div>
        <div style="font-size:.8rem;color:var(--c-primary);margin-bottom:12px">Tema: ${esc(m.theme || 'Misterius')}</div>
        <div style="display:flex;justify-content:space-around;font-size:.85rem;padding:10px 0;background:rgba(255,255,255,.05);border-radius:10px;margin-bottom:14px">
          <div><div style="color:var(--c-muted);font-size:.7rem">Ditemui</div><strong>${m.encounters || 0}×</strong></div>
          <div><div style="color:var(--c-muted);font-size:.7rem">Dikalahkan</div><strong>${m.defeats || 0}×</strong></div>
          <div><div style="color:var(--c-muted);font-size:.7rem">Bintang Terbaik</div><strong>${m.bestStars ? '⭐'.repeat(m.bestStars) : '-'}</strong></div>
        </div>
        <button class="btn block secondary" id="m-dex-close">Tutup</button>
      </div>
    `;
    document.body.appendChild(modal);
    $('#m-dex-close', modal).onclick = () => modal.remove();
  }
};

/* ============================================================
   SCREEN: Settings (Pengaturan Suara & Akun)
   ============================================================ */
Screens.settings = {
  render(app) {
    const s = Settings.get();
    app.innerHTML = `
      <section class="screen active stack">
        <div class="hud">
          <button class="icon-btn" id="set-back">←</button>
          <h2 class="hud-title">Pengaturan</h2>
          <span></span>
        </div>

        <div class="stack" style="gap:14px;max-width:400px;margin:0 auto;width:100%">
          <div class="card" style="padding:16px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong)">
            <h3 style="margin:0 0 12px 0;font-size:1rem;color:var(--c-primary)">Suara & Audio</h3>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <div>
                <strong style="display:block">Efek Suara (SFX)</strong>
                <span style="font-size:.75rem;color:var(--c-muted)">Suara serangan, koin, dan tombol</span>
              </div>
              <button class="toggle" id="tog-sfx" aria-checked="${s.sfx}"></button>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <strong style="display:block">Suara Baca Soal (TTS)</strong>
                <span style="font-size:.75rem;color:var(--c-muted)">Otomatis bacakan teks pertanyaan</span>
              </div>
              <button class="toggle" id="tog-tts" aria-checked="${s.tts}"></button>
            </div>
          </div>

          <div class="card" style="padding:16px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong)">
            <h3 style="margin:0 0 12px 0;font-size:1rem;color:var(--c-accent)">Tampilan & Gameplay</h3>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <div>
                <strong style="display:block">Sembunyikan Panel Skill</strong>
                <span style="font-size:.75rem;color:var(--c-muted)">Gunakan tombol mengambang ringkas di battle</span>
              </div>
              <button class="toggle" id="tog-skillbar" aria-checked="${!!s.skillBarHidden}"></button>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <strong style="display:block">Animasi Hemat (Reduced Motion)</strong>
                <span style="font-size:.75rem;color:var(--c-muted)">Matikan getar layar dan animasi cepat</span>
              </div>
              <button class="toggle" id="tog-reduced-motion" aria-checked="${!!s.reducedMotion}"></button>
            </div>
          </div>

          <div class="card" style="padding:16px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong)">
            <h3 style="margin:0 0 12px 0;font-size:1rem;color:var(--c-info)">Akun Pemain</h3>
            <div style="margin-bottom:12px;font-size:.85rem">
              Masuk sebagai: <strong>${esc(Player.nick())}</strong> (Lv. ${Player.level()})
            </div>
            <div style="display:flex;gap:10px">
              <button class="btn secondary small grow" id="btn-switch-act">Ganti Akun</button>
              <button class="btn ghost small" id="btn-logout-act">Keluar</button>
            </div>
          </div>
        </div>
      </section>
    `;

    $('#set-back').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('home'); };

    $('#tog-sfx').onclick = () => {
      const now = !Settings.get().sfx;
      Settings.set('sfx', now);
      $('#tog-sfx').setAttribute('aria-checked', String(now));
      toast(now ? 'SFX Aktif' : 'SFX Dimatikan');
    };

    $('#tog-tts').onclick = () => {
      const now = !Settings.get().tts;
      Settings.set('tts', now);
      $('#tog-tts').setAttribute('aria-checked', String(now));
      toast(now ? 'TTS Aktif' : 'TTS Dimatikan');
    };

    $('#tog-skillbar').onclick = () => {
      const now = !Settings.get().skillBarHidden;
      Settings.set('skillBarHidden', now);
      $('#tog-skillbar').setAttribute('aria-checked', String(now));
      API.saveSettings({ skillBarHidden: now }).catch(() => {});
      toast(now ? 'Panel Skill Disembunyikan' : 'Panel Skill Ditampilkan');
    };

    $('#tog-reduced-motion').onclick = () => {
      const now = !Settings.get().reducedMotion;
      Settings.set('reducedMotion', now);
      $('#tog-reduced-motion').setAttribute('aria-checked', String(now));
      API.saveSettings({ reducedMotion: now }).catch(() => {});
      toast(now ? 'Mode Hemat Animasi Aktif' : 'Mode Hemat Animasi Mati');
    };

    $('#btn-switch-act').onclick = () => Screens.home.openAuthModal();
    $('#btn-logout-act').onclick = async () => {
      await API.logout();
      Player.data = null;
      toast('Berhasil keluar');
      go('home');
    };
  }
};

/* ---------- Bootstrapping ---------- */
window.addEventListener('DOMContentLoaded', async () => {
  // Unlock audio on first touch
  const unlock = () => {
    if (window.Sfx && window.Sfx._unlock) window.Sfx._unlock();
    window.removeEventListener('pointerdown', unlock);
  };
  window.addEventListener('pointerdown', unlock);

  // Initialize player session
  await Player.init();

  // Render initial screen based on URL path
  if (window.location.pathname === '/profil' || window.location.pathname.startsWith('/profil')) {
    go('profil', { tab: 'ringkasan' });
  } else {
    go('home');
  }
});
