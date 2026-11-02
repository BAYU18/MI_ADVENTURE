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
};

/* ---------- Current Player Store ---------- */
const Player = {
  data: null,
  async init() {
    try {
      this.data = await API.getMe();
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
    const heroSvg = Monsters.renderMonster(heroM, { size: 160 });

    app.innerHTML = `
      <section class="screen active center-col stack">
        <div class="player-banner">
          <div class="avatar-badge">🎒</div>
          <div class="details">
            <div class="nick">${esc(p ? p.nick : 'Petualang Cilik')} · <span style="color:var(--c-primary)">Lv. ${p ? p.level : 1}</span></div>
            <div class="sub">🪙 ${p ? p.coins : 0} Koin · Kelas ${p ? p.classId : 1} SD</div>
          </div>
          <button class="btn ghost small" id="btn-switch-user" style="padding:4px 8px;font-size:.75rem">Ganti</button>
        </div>

        <div class="hero-monster" style="cursor:pointer" title="${esc(heroM.name)}">${heroSvg}</div>
        <h1 class="brand" style="margin-top:-6px">Petualangan<br>Pelajar</h1>
        <p class="tagline">Kalahkan monster bos dengan kecerdasanmu!</p>

        <div class="stack grow" style="justify-content:center;width:min(340px,100%);gap:10px">
          <button class="btn block" id="btn-play">⚔️ Mulai Pertarungan</button>
          <button class="btn block secondary" id="btn-dex">📖 Monsterdex (100 Monster)</button>
          <button class="btn block ghost" id="btn-settings">⚙️ Pengaturan Suara & Akun</button>
          <a href="/admin.html" class="btn block ghost" style="opacity:.65;font-size:.85rem;text-decoration:none;text-align:center">🛡️ Admin Guru / Soal</a>
        </div>
        <p class="tagline" style="font-size:.75rem;margin-bottom:8px">Server-Authoritative · Cloudflare Protected</p>
      </section>
    `;

    $('#btn-play').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('subjects'); };
    $('#btn-dex').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('dex'); };
    $('#btn-settings').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('settings'); };
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
                <button class="btn secondary" style="pointer-events:none">Lawan ⚔️</button>
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
  timerInterval: null,
  heartbeatInterval: null,
  timeRemainingSec: 0,
  timeTotalSec: 20,
  isAnswering: false,

  async start(subjectId) {
    try {
      toast('Membangkitkan monster bos...');
      const session = await API.startSession(subjectId);
      this.session = session;
      go('battle');
    } catch (e) {
      if (e.code === 'ACTIVE_SESSION' && e.data?.session) {
        toast('Melanjutkan sesi pertempuran aktif...');
        this.session = e.data.session;
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
      <section class="screen active stack" style="gap:8px">
        <!-- TOP HUD -->
        <div class="hud" style="margin-bottom:0">
          <button class="icon-btn" id="btn-abandon" title="Menyerah">✕</button>
          <div style="display:flex;align-items:center;gap:6px">
            <span class="chip accent" id="streak-chip" style="${s.streak >= 2 ? '' : 'display:none'}">🔥 <span id="streak-n">${s.streak}</span></span>
            <span class="hud-title" id="q-counter">Soal ${s.currentIndex + 1}/${s.totalQuestions}</span>
          </div>
          <span class="chip info" id="player-hp-label">❤️ <span id="player-hp-val">${s.playerHp}</span>/${s.playerMaxHp}</span>
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

          <!-- OPTIONS -->
          <div class="options" id="options-slot" style="margin-top:10px;margin-bottom:6px;flex:0 0 auto"></div>

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
      <button class="opt" data-idx="${idx}">
        <span class="key">${letters[idx] || (idx + 1)}</span>
        <span>${esc(optText)}</span>
      </button>
    `).join('');

    $$('.opt', optBox).forEach(btn => {
      btn.onclick = () => this.handleOptionClick(parseInt(btn.dataset.idx, 10), btn);
    });

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

  // Render initial screen
  go('home');
});
