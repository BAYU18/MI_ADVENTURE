/* ============================================================
   Petualangan Pelajar — app.js (v2 Server-Authoritative)
   Vanilla JS SPA, Node.js + SQLite backend, WebAudio SFX & TTS
   ============================================================ */
'use strict';

/* ---------- Helpers & DOM ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(msg, testId = null) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  if (testId) t.setAttribute('data-testid', testId);
  else t.removeAttribute('data-testid');
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    t.classList.remove('show');
    if (testId) t.removeAttribute('data-testid');
  }, 2200);
}

/* ---------- Local Settings & Auth Cache ---------- */
const Settings = {
  _data: null,
  get() {
    if (!this._data) {
      try {
        this._data = Object.assign({
          sfx: true,
          sound: true,
          vibrate: true,
          reducedMotion: false,
          pace: 'AUTO',
          tts: false,
          autoNext: true,
          skillBarHidden: false,
          battleLayout: 'classic'
        }, JSON.parse(localStorage.getItem('pp_settings') || '{}'));
      } catch (e) {
        this._data = { sfx: true, sound: true, vibrate: true, reducedMotion: false, pace: 'AUTO', tts: false, autoNext: true, skillBarHidden: false, battleLayout: 'classic' };
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
    if (window.Feedback && window.Feedback.getSettings) {
      const fbSet = window.Feedback.getSettings();
      if (k === 'sfx' || k === 'sound') fbSet.sound = Boolean(v);
      if (k === 'vibrate') fbSet.vibrate = Boolean(v);
      if (k === 'reducedMotion') fbSet.reducedMotion = Boolean(v);
    }
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

  async req(endpoint, opts = {}, retryCount = 0) {
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
      if (retryCount < 1 && err.name === 'TypeError' && (err.message || '').toLowerCase().includes('fetch')) {
        await new Promise(r => setTimeout(r, 200));
        return this.req(endpoint, opts, retryCount + 1);
      }
      console.warn(`[API] ${endpoint} failed:`, err.message);
      if (err.name === 'TypeError' && (err.message || '').toLowerCase().includes('fetch')) {
        const netErr = new Error('Gagal terhubung ke server. Periksa koneksi jaringan Anda.');
        netErr.code = 'NETWORK_ERROR';
        netErr.original = err;
        throw netErr;
      }
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

  async startSession(subjectId, options = {}) {
    const payload = Object.assign({ subjectId }, typeof options === 'object' ? options : {});
    const res = await this.req('/api/game/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.session;
  },

  async getCampaign(subjectId) {
    return this.req(`/api/campaign?subjectId=${encodeURIComponent(subjectId)}`);
  },

  async getSubjectAbilities() {
    return this.req('/api/report/abilities');
  },

  async getWeeklyReport(offset = 0, weekKey = '', week = '') {
    let url = `/api/report/week?offset=${encodeURIComponent(offset)}`;
    if (weekKey) url += `&weekKey=${encodeURIComponent(weekKey)}`;
    return this.req(url);
  },

  async getShareReport(token) {
    return this.req(`/r/${encodeURIComponent(token)}?json=1`);
  },

  async createReportShare() {
    return this.req('/api/report/share', { method: 'POST' });
  },

  async revokeReportShare() {
    return this.req('/api/report/share', { method: 'DELETE' });
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

  async resolveEvent(sessionId, eventId, choice) {
    return this.req(`/api/game/${sessionId}/event`, {
      method: 'POST',
      body: JSON.stringify({ eventId, choice }),
    });
  },

  async abandonSession(sessionId) {
    return this.req(`/api/game/${sessionId}/abandon`, { method: 'POST' });
  },

  async getWrongQuestions(sessionId) {
    const res = await this.req(`/api/game/${sessionId}/wrong`);
    return res.wrongQuestions || [];
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

  async getBattleHistory(limit = 50) {
    return this.req(`/api/game/history?limit=${limit}`);
  },

  async getSkills() {
    return this.req('/api/skills');
  },

  async updateLoadout(slots, opts = {}) {
    const payload = { slots };
    if (opts.type) payload.type = opts.type;
    return this.req('/api/loadout', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async getDuelBossLoadout() {
    return this.req('/api/duel-boss-loadout');
  },

  async updateDuelBossLoadout(slots) {
    return this.req('/api/duel-boss-loadout', {
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
const Screens = window.Screens || {};
window.Screens = Screens;
window.API = API;
window.Player = Player;
function go(name, params = {}) {
  window.go = go;
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

            <div class="muted tc" style="font-size:.8rem;color:var(--c-muted);display:${this.activeTab === 'register' ? 'block' : 'none'};text-align:center;padding:4px">
              Kelas belajar ditentukan otomatis oleh guru/admin kelas kamu.
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
          const classSelect = $('#auth-class');
          const classId = classSelect ? parseInt(classSelect.value, 10) : undefined;
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
   SCREEN: Laporan Mingguan Siswa & Portal Berbagi (J.1, J.2 / T-38)
   ============================================================ */
/* ============================================================
   SCREEN: Laporan Belajar Siswa & Kemampuan Mapel (v6 Fitur A, B)
   ============================================================ */
Screens.report = {
  currentOffset: 0,
  reportData: null,

  async render(app, params = {}) {
    this.currentOffset = typeof params.offset === 'number' ? params.offset : 0;
    app.innerHTML = `
      <section class="screen active stack screen-scrollable" data-testid="screen-report" style="gap:12px;padding-bottom:calc(110px + env(safe-area-inset-bottom, 24px));max-width:540px;margin:0 auto;overflow-y:auto !important;overflow-x:hidden !important;-webkit-overflow-scrolling:touch !important;touch-action:pan-y !important;height:100%">
        <!-- HUD Header -->
        <div class="hud" style="margin-bottom:0">
          <button class="icon-btn" id="rep-back" data-testid="rep-back">←</button>
          <h2 class="hud-title">📊 Laporan Belajar</h2>
          <button class="icon-btn" id="rep-help-btn" data-testid="btn-ability-help" title="Penjelasan Skor" style="font-size:1.1rem">❓</button>
        </div>

        <!-- Week Navigator -->
        <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:8px 12px">
          <button class="btn small ghost" id="report-week-prev" data-testid="report-week-prev" style="min-width:44px;font-weight:800;font-size:1.1rem;padding:6px 12px">◀</button>
          <div style="text-align:center;flex:1;padding:0 8px">
            <div id="report-week-label" style="font-weight:700;font-size:0.92rem;color:#fff;display:flex;align-items:center;justify-content:center;gap:6px">
              Memuat...
            </div>
            <div id="report-date-range" style="font-size:0.75rem;color:var(--c-muted);margin-top:2px">
              ...
            </div>
          </div>
          <button class="btn small ghost" id="report-week-next" data-testid="report-week-next" style="min-width:44px;font-weight:800;font-size:1.1rem;padding:6px 12px">▶</button>
        </div>

        <!-- Dynamic Content Body -->
        <div id="report-content" class="stack" style="gap:12px">
          <div style="text-align:center;padding:40px 10px;color:var(--c-muted)">
            <span class="spinner"></span>
            <div style="margin-top:8px;font-size:0.85rem">Mengumpulkan data petualangan...</div>
          </div>
        </div>
      </section>
    `;

    $('#rep-back').onclick = () => {
      if (window.Sfx) Sfx.play('tap');
      go('home');
    };

    $('#rep-help-btn').onclick = () => {
      if (window.Sfx) Sfx.play('tap');
      this.showHelpModal();
    };

    $('#report-week-prev').onclick = () => {
      if (window.Sfx) Sfx.play('tap');
      this.currentOffset--;
      this.loadWeek(this.currentOffset);
    };

    $('#report-week-next').onclick = () => {
      if (this.currentOffset >= 0) return;
      if (window.Sfx) Sfx.play('tap');
      this.currentOffset++;
      this.loadWeek(this.currentOffset);
    };

    await this.loadWeek(this.currentOffset);
  },

  async loadWeek(offset) {
    const nextBtn = $('#report-week-next');
    if (nextBtn) {
      nextBtn.disabled = (offset >= 0);
      nextBtn.style.opacity = (offset >= 0) ? '0.3' : '1';
      nextBtn.style.pointerEvents = (offset >= 0) ? 'none' : 'auto';
    }

    const contentEl = $('#report-content');
    if (!contentEl) return;

    try {
      const res = await API.getWeeklyReport(offset);
      if (!res.ok || !res.report) {
        contentEl.innerHTML = `
          <div class="card" style="text-align:center;padding:30px 16px">
            <p style="color:var(--c-danger);font-weight:700">Gagal memuat laporan.</p>
            <button class="btn small" onclick="Screens.report.loadWeek(${offset})">Coba Lagi</button>
          </div>
        `;
        return;
      }

      this.reportData = res.report;
      this.renderReportBody(res.report, offset);
    } catch (e) {
      contentEl.innerHTML = `
        <div class="card" style="text-align:center;padding:30px 16px">
          <p style="color:var(--c-danger);font-weight:700">Terjadi kesalahan: ${e.message}</p>
          <button class="btn small" onclick="Screens.report.loadWeek(${offset})">Coba Lagi</button>
        </div>
      `;
    }
  },

  formatPeriodIndo(fromStr, toStr) {
    if (!fromStr || !toStr) return '';
    try {
      const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
      const days = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
      const d1 = new Date(fromStr + 'T00:00:00+07:00');
      const d2 = new Date(toStr + 'T23:59:59+07:00');
      const day1 = days[d1.getDay()];
      const day2 = days[d2.getDay()];
      const date1 = d1.getDate();
      const date2 = d2.getDate();
      const m1 = months[d1.getMonth()];
      const m2 = months[d2.getMonth()];
      const y2 = d2.getFullYear();

      if (m1 === m2) {
        return `${day1} ${date1} – ${day2} ${date2} ${m2} ${y2}`;
      }
      return `${day1} ${date1} ${m1} – ${day2} ${date2} ${m2} ${y2}`;
    } catch (e) {
      return `${fromStr} s/d ${toStr}`;
    }
  },

  renderReportBody(rep, offset) {
    const isCurrentWeek = (offset === 0) || Boolean(rep.partial);
    const weekLabelEl = $('#report-week-label');
    const dateRangeEl = $('#report-date-range');
    const contentEl = $('#report-content');

    const periodText = this.formatPeriodIndo(rep.from, rep.to);

    if (weekLabelEl) {
      weekLabelEl.innerHTML = `
        <span>Pekan ${rep.week || ''}</span>
        ${isCurrentWeek ? '<span class="badge small" data-testid="report-partial-badge" style="background:#0284c7;color:#fff;font-size:0.68rem;padding:2px 6px;border-radius:6px;font-weight:700">Sementara</span>' : ''}
      `;
    }
    if (dateRangeEl) {
      dateRangeEl.textContent = periodText;
    }

    const s = rep.summary || {
      answered: 0, correct: 0, accuracy: 0, minutes: 0, sessions: 0, activeDays: 0,
      bossDefeated: 0, bossByTier: { common: 0, rare: 0, epic: 0, legend: 0 }, coins: 0, xp: 0
    };

    const prev = rep.prev || null;
    let accDeltaHtml = '';
    let ansDeltaHtml = '';
    if (prev) {
      const dAcc = s.accuracy - prev.accuracy;
      const dAns = s.answered - prev.answered;
      if (dAcc !== 0) {
        const sign = dAcc > 0 ? '▲' : '▼';
        accDeltaHtml = `<span style="font-size:0.75rem;color:var(--c-muted);margin-left:4px">${sign}${Math.abs(dAcc)}%</span>`;
      }
      if (dAns !== 0) {
        const sign = dAns > 0 ? '▲' : '▼';
        ansDeltaHtml = `<span style="font-size:0.75rem;color:var(--c-muted);margin-left:4px">${sign}${Math.abs(dAns)}</span>`;
      }
    }

    const bossTiers = s.bossByTier || { common: 0, rare: 0, epic: 0, legend: 0 };
    const tierChips = [];
    if (bossTiers.common > 0) tierChips.push(`<span style="font-size:0.7rem;background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:6px">⚪ ${bossTiers.common}</span>`);
    if (bossTiers.rare > 0) tierChips.push(`<span style="font-size:0.7rem;background:rgba(59,130,246,0.18);color:#60a5fa;padding:2px 6px;border-radius:6px">🔵 ${bossTiers.rare}</span>`);
    if (bossTiers.epic > 0) tierChips.push(`<span style="font-size:0.7rem;background:rgba(168,85,247,0.18);color:#c084fc;padding:2px 6px;border-radius:6px">🟣 ${bossTiers.epic}</span>`);
    if (bossTiers.legend > 0) tierChips.push(`<span style="font-size:0.7rem;background:rgba(234,179,8,0.18);color:#fde047;padding:2px 6px;border-radius:6px">🟡 ${bossTiers.legend}</span>`);

    const abilities = rep.abilities || [];
    const weak = rep.weakTopics || [];
    const mastered = rep.masteredTopics || [];
    const praise = rep.praise || [];
    const advice = rep.advice || [];

    // Empty state check
    const isEmpty = (s.answered === 0);

    let html = '';

    if (isEmpty) {
      html += `
        <div class="card" data-testid="report-empty" style="text-align:center;padding:36px 16px;background:var(--c-surface);border-radius:18px;border:1px dashed var(--c-surface-strong)">
          <div style="font-size:3rem;margin-bottom:8px">🎒✨</div>
          <h3 style="font-size:1.15rem;font-weight:800;color:#fff;margin:0 0 6px 0">Belum Ada Petualangan Minggu Ini</h3>
          <p style="font-size:0.85rem;color:var(--c-muted);max-width:320px;margin:0 auto 18px auto;line-height:1.4">
            Ayo mulai petualangan belajar sekarang untuk mengumpulkan koin, menaikkan level kemampuan, dan mengalahkan boss!
          </p>
          <button class="btn primary" id="rep-empty-start" style="padding:10px 24px;font-weight:700">
            🚀 Mulai Petualangan
          </button>
        </div>
      `;
    } else {
      // 1. Summary 6 Cards
      html += `
        <div class="card" data-testid="report-summary" style="background:var(--c-surface);border:1px solid var(--c-surface-strong);border-radius:18px;padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h3 style="font-size:0.95rem;font-weight:800;color:#fff;margin:0">Ringkasan Aktivitas</h3>
            <span style="font-size:0.75rem;color:var(--c-muted)">${s.coins || 0} 🪙 · ${s.xp || 0} XP</span>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px">
            <!-- 1. Soal Dijawab -->
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:10px 8px;text-align:center">
              <div style="font-size:1.25rem;font-weight:800;color:#fff">${s.answered}${ansDeltaHtml}</div>
              <div style="font-size:0.72rem;color:var(--c-muted);margin-top:2px">Soal Dijawab</div>
            </div>

            <!-- 2. Akurasi -->
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:10px 8px;text-align:center">
              <div style="font-size:1.25rem;font-weight:800;color:#10b981">${s.accuracy}%${accDeltaHtml}</div>
              <div style="font-size:0.72rem;color:var(--c-muted);margin-top:2px">Akurasi</div>
            </div>

            <!-- 3. Waktu Belajar -->
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:10px 8px;text-align:center">
              <div style="font-size:1.25rem;font-weight:800;color:#f59e0b">${s.minutes} <span style="font-size:0.75rem;font-weight:400">mnt</span></div>
              <div style="font-size:0.72rem;color:var(--c-muted);margin-top:2px">Waktu Belajar</div>
            </div>

            <!-- 4. Sesi Main -->
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:10px 8px;text-align:center">
              <div style="font-size:1.25rem;font-weight:800;color:#8b5cf6">${s.sessions}</div>
              <div style="font-size:0.72rem;color:var(--c-muted);margin-top:2px">Sesi Main</div>
            </div>

            <!-- 5. Hari Aktif -->
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:10px 8px;text-align:center">
              <div style="font-size:1.25rem;font-weight:800;color:#38bdf8">${s.activeDays}<span style="font-size:0.75rem;font-weight:400">/7</span></div>
              <div style="font-size:0.72rem;color:var(--c-muted);margin-top:2px">Hari Aktif</div>
            </div>

            <!-- 6. Boss Dikalahkan -->
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:10px 8px;text-align:center">
              <div style="font-size:1.25rem;font-weight:800;color:#ef4444">${s.bossDefeated}</div>
              <div style="font-size:0.72rem;color:var(--c-muted);margin-top:2px">Boss Kalah</div>
            </div>
          </div>

          ${tierChips.length > 0 ? `
            <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);flex-wrap:wrap">
              <span style="font-size:0.72rem;color:var(--c-muted)">Rincian Boss:</span>
              ${tierChips.join('')}
            </div>
          ` : ''}
        </div>
      `;

      // 2. Grafik 7 Hari (SVG inline)
      html += this.render7DayChart(rep.daily || []);
    }

    // 3. Level Kemampuan per Mapel (Urut Naik)
    html += this.renderAbilitiesSection(abilities, rep.lowestSubjectId);

    // 4. Topik Perlu Dibimbing & Dikuasai
    if (weak.length > 0 || mastered.length > 0) {
      html += `
        <div class="card" style="background:var(--c-surface);border:1px solid var(--c-surface-strong);border-radius:18px;padding:16px">
          <div style="display:flex;flex-direction:column;gap:14px">
            ${weak.length > 0 ? `
              <div data-testid="report-weak-topics">
                <div style="font-size:0.88rem;font-weight:800;color:#f87171;margin-bottom:8px;display:flex;align-items:center;gap:6px">
                  <span>⚠️</span>
                  <span>Topik Perlu Dibimbing (Maks 5)</span>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                  ${weak.map(w => `
                    <div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);padding:8px 12px;border-radius:10px;font-size:0.82rem;display:flex;justify-content:space-between;align-items:center">
                      <div>
                        <strong style="color:#fff">${esc(w.subject)}</strong> · ${esc(w.topic)}
                      </div>
                      <div style="color:#fca5a5;font-weight:700;font-size:0.78rem">
                        ${w.accuracy}% (${w.attempts} soal)
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${mastered.length > 0 ? `
              <div data-testid="report-mastered-topics">
                <div style="font-size:0.88rem;font-weight:800;color:#10b981;margin-bottom:8px;display:flex;align-items:center;gap:6px">
                  <span>✨</span>
                  <span>Topik yang Sudah Dikuasai (Maks 5)</span>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                  ${mastered.map(m => `
                    <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);padding:8px 12px;border-radius:10px;font-size:0.82rem;display:flex;justify-content:space-between;align-items:center">
                      <div>
                        <strong style="color:#fff">${esc(m.subject)}</strong> · ${esc(m.topic)}
                      </div>
                      <div style="color:#6ee7b7;font-weight:700;font-size:0.78rem">
                        Dikuasai (${m.count} soal)
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // 5. Pujian & Saran
    html += `
      <div class="card" data-testid="report-praise" style="background:var(--c-surface);border:1px solid var(--c-surface-strong);border-radius:18px;padding:16px">
        <h3 style="font-size:0.95rem;font-weight:800;color:#fff;margin:0 0 10px 0">Pujian & Saran Belajar</h3>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${praise.map(p => `
            <div style="display:flex;align-items:flex-start;gap:8px;background:rgba(56,189,248,0.06);padding:8px 10px;border-radius:10px;border-left:3px solid #38bdf8">
              <span style="font-size:1.1rem">🌟</span>
              <span style="font-size:0.85rem;color:#e2e8f0;line-height:1.4">${esc(p)}</span>
            </div>
          `).join('')}
          <div data-testid="report-advice" style="display:flex;flex-direction:column;gap:8px">
            ${advice.map(a => `
              <div style="display:flex;align-items:flex-start;gap:8px;background:rgba(251,191,36,0.06);padding:8px 10px;border-radius:10px;border-left:3px solid #fbbf24">
                <span style="font-size:1.1rem">💡</span>
                <span style="font-size:0.85rem;color:#fef08a;line-height:1.4">${esc(a)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // 6. Bagikan ke Orang Tua
    html += `
      <div class="card" style="background:var(--c-surface);border:1px solid var(--c-surface-strong);border-radius:18px;padding:16px;text-align:center">
        <h3 style="font-size:0.95rem;font-weight:800;color:#fff;margin:0 0 4px 0">Bagikan Laporan ke Orang Tua</h3>
        <p style="font-size:0.78rem;color:var(--c-muted);margin:0 0 12px 0">Orang tua dapat melihat rangkuman ini tanpa login via tautan rahasia (aktif 7 hari).</p>
        <div id="share-action-box">
          <button class="btn primary" id="btn-share-report" data-testid="report-share-btn" style="width:100%;min-height:44px;font-weight:700">
            🔗 Buat Tautan Berbagi
          </button>
        </div>
      </div>
    `;

    contentEl.innerHTML = html;

    // Attach event listeners
    const startBtn = $('#rep-empty-start');
    if (startBtn) {
      startBtn.onclick = () => {
        if (window.Sfx) Sfx.play('tap');
        go('subjects');
      };
    }

    const shareBtn = $('#btn-share-report');
    if (shareBtn) {
      shareBtn.onclick = () => this.handleShareReport();
    }

    this.bindAbilityActions(abilities, rep.lowestSubjectId);
  },

  render7DayChart(daily) {
    if (!Array.isArray(daily) || daily.length === 0) return '';

    const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const maxAns = Math.max(1, ...daily.map(d => d.answered || 0));

    const bars = daily.map((d, i) => {
      const ans = d.answered || 0;
      const h = Math.round((ans / maxAns) * 65);
      const y = 80 - h;
      const x = 20 + i * 40;
      const acc = d.answered > 0 ? Math.round((d.correct / d.answered) * 100) : 0;
      const dotColor = acc >= 75 ? '#10b981' : (acc >= 50 ? '#38bdf8' : (acc > 0 ? '#f59e0b' : '#64748b'));

      return `
        <g>
          <title>${dayLabels[i]}: ${ans} soal (${acc}% benar)</title>
          <rect x="${x}" y="${y}" width="22" height="${h}" rx="4" fill="url(#repBarGrad)" opacity="0.9" />
          ${ans > 0 ? `<circle cx="${x + 11}" cy="${Math.max(12, y - 6)}" r="3.5" fill="${dotColor}" />` : ''}
          <text x="${x + 11}" y="95" text-anchor="middle" font-size="9" fill="var(--c-muted)">${dayLabels[i]}</text>
        </g>
      `;
    }).join('');

    return `
      <div class="card" data-testid="report-chart" style="background:var(--c-surface);border:1px solid var(--c-surface-strong);border-radius:18px;padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <h3 style="font-size:0.95rem;font-weight:800;color:#fff;margin:0">Grafik 7 Hari</h3>
          <div style="display:flex;align-items:center;gap:8px;font-size:0.72rem;color:var(--c-muted)">
            <span style="display:flex;align-items:center;gap:3px"><span style="width:7px;height:7px;background:#38bdf8;border-radius:2px;display:inline-block"></span> Soal</span>
            <span style="display:flex;align-items:center;gap:3px"><span style="width:7px;height:7px;background:#10b981;border-radius:50%;display:inline-block"></span> Akurasi</span>
          </div>
        </div>

        <div style="background:rgba(0,0,0,0.2);border-radius:12px;padding:6px 0;overflow-x:auto">
          <svg viewBox="0 0 300 105" width="100%" height="105" aria-label="Grafik soal dijawab dan akurasi 7 hari">
            <defs>
              <linearGradient id="repBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#38bdf8"/>
                <stop offset="100%" stop-color="#0284c7"/>
              </linearGradient>
            </defs>
            <line x1="15" y1="80" x2="285" y2="80" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
            ${bars}
          </svg>
        </div>
      </div>
    `;
  },

  renderAbilitiesSection(abilities, lowestSubjectId) {
    if (!Array.isArray(abilities) || abilities.length === 0) {
      return `
        <div class="card" data-testid="ability-list" style="background:var(--c-surface);border:1px solid var(--c-surface-strong);border-radius:18px;padding:16px;text-align:center">
          <h3 style="font-size:0.95rem;font-weight:800;color:#fff;margin:0 0 6px 0">🎯 Level Kemampuan per Mapel</h3>
          <p style="font-size:0.82rem;color:var(--c-muted);margin:0">Main dulu yuk, nanti kemampuanmu muncul di sini.</p>
        </div>
      `;
    }

    const itemsHtml = abilities.map(item => {
      const isNone = item.status === 'NONE';
      const isInsufficient = item.status === 'INSUFFICIENT';
      const isMeasured = item.status === 'MEASURED';
      const isLowest = isMeasured && (item.subjectId === lowestSubjectId);

      let levelColor = '#64748b';
      if (item.level === 5) levelColor = '#eab308';
      else if (item.level === 4) levelColor = '#a855f7';
      else if (item.level === 3) levelColor = '#3b82f6';
      else if (item.level === 2) levelColor = '#10b981';

      let statusSubtext = '';
      if (isNone) {
        statusSubtext = '<span style="color:var(--c-muted)">Belum dicoba — ayo mulai!</span>';
      } else if (isInsufficient) {
        statusSubtext = `<span style="color:#f59e0b">Baru ${item.attempts}/8 jawaban — lanjut main untuk melihat levelmu</span>`;
      } else {
        statusSubtext = `<span>Akurasi ${item.accuracy}% · Dikuasai ${item.mastery}% (${item.attempts} jawaban)</span>`;
      }

      const scoreDisplay = isMeasured ? `${item.score}` : '-';
      const barWidth = isMeasured ? `${Math.max(4, item.score)}%` : '0%';

      return `
        <div class="ability-row" data-testid="ability-row-${item.subjectId}" data-subject-id="${item.subjectId}" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:12px;margin-bottom:8px;cursor:pointer;transition:all 0.2s ease">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:1.5rem">${item.icon || '📚'}</span>
              <div>
                <div style="display:flex;align-items:center;gap:6px">
                  <span style="font-weight:800;font-size:0.95rem;color:#fff">${esc(item.name)}</span>
                  ${isLowest ? '<span class="badge small" style="background:#f43f5e;color:#fff;font-size:0.65rem;padding:2px 6px;border-radius:6px;font-weight:700">🎯 Fokus Latihan</span>' : ''}
                </div>
                <div style="font-size:0.75rem;color:var(--c-muted);margin-top:2px">
                  ${statusSubtext}
                </div>
              </div>
            </div>

            <div style="text-align:right">
              <div style="font-size:1.15rem;font-weight:900;color:${isMeasured ? levelColor : 'var(--c-muted)'}">
                ${scoreDisplay}<span style="font-size:0.75rem;font-weight:400;color:var(--c-muted)">/100</span>
              </div>
              <div style="font-size:0.72rem;font-weight:700;color:${levelColor};margin-top:2px">
                ${item.levelIcon || '🌱'} ${item.levelName || 'Pemula'}
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;margin-bottom:6px">
            <div style="width:${barWidth};height:100%;background:${levelColor};border-radius:3px;transition:width 0.4s ease"></div>
          </div>

          <!-- Action Row for Lowest or None -->
          ${(isLowest || isNone) ? `
            <div style="display:flex;justify-content:flex-end;margin-top:8px">
              <button class="btn small primary btn-practice-subject" data-subject-id="${item.subjectId}" style="padding:4px 12px;font-size:0.78rem;font-weight:700">
                ${isLowest ? `🎯 Latihan ${esc(item.name)}` : '🚀 Mulai Mapel'}
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="card" data-testid="ability-list" style="background:var(--c-surface);border:1px solid var(--c-surface-strong);border-radius:18px;padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <h3 style="font-size:0.95rem;font-weight:800;color:#fff;margin:0">🎯 Level Kemampuan per Mapel</h3>
          <button class="btn small ghost" id="btn-why-ability" style="font-size:0.75rem;padding:2px 8px;color:#38bdf8">❓ Info Skor</button>
        </div>
        <p style="font-size:0.75rem;color:var(--c-muted);margin:0 0 12px 0">
          Urut dari nilai terkecil (paling butuh latihan). Ketuk mapel untuk rincian.
        </p>
        <div style="display:flex;flex-direction:column">
          ${itemsHtml}
        </div>
      </div>
    `;
  },

  bindAbilityActions(abilities, lowestSubjectId) {
    const whyBtn = $('#btn-why-ability');
    if (whyBtn) {
      whyBtn.onclick = () => {
        if (window.Sfx) Sfx.play('tap');
        this.showHelpModal();
      };
    }

    // Row clicks -> detail modal
    document.querySelectorAll('.ability-row').forEach(row => {
      row.onclick = (e) => {
        if (e.target.closest('.btn-practice-subject')) return;
        const sId = parseInt(row.getAttribute('data-subject-id'), 10);
        const item = abilities.find(a => a.subjectId === sId);
        if (item) {
          if (window.Sfx) Sfx.play('tap');
          this.showAbilityDetailModal(item);
        }
      };
    });

    // Practice buttons
    document.querySelectorAll('.btn-practice-subject').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const sId = parseInt(btn.getAttribute('data-subject-id'), 10);
        if (window.Sfx) Sfx.play('tap');
        if (Screens.battle && Screens.battle.start) {
          await Screens.battle.start(sId);
        } else {
          go('campaign', { subjectId: sId });
        }
      };
    });
  },

  async handleShareReport() {
    const box = $('#share-action-box');
    if (!box) return;
    box.innerHTML = '<span class="spinner"></span> Membuat tautan...';

    try {
      const res = await API.createReportShare();
      if (!res.ok || !res.token) {
        box.innerHTML = '<p style="color:var(--c-danger);font-size:0.8rem">Gagal membuat tautan berbagi.</p>';
        return;
      }

      const fullUrl = `${window.location.origin}/r/${res.token}`;
      const expDate = res.expiresAt ? new Date(res.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '7 hari';

      box.innerHTML = `
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;text-align:left">
          <div style="font-size:0.75rem;color:var(--c-muted);margin-bottom:6px">Tautan Rahasia (Kedaluwarsa: ${expDate}):</div>
          <div style="display:flex;gap:6px;margin-bottom:10px">
            <input type="text" id="share-link-input" data-testid="report-share-url" value="${fullUrl}" readonly style="flex:1;background:#0f172a;border:1px solid #334155;border-radius:8px;padding:6px 10px;font-size:0.75rem;color:#38bdf8;font-family:monospace" />
            <button class="btn small secondary" id="btn-copy-share" style="padding:6px 12px;font-size:0.75rem">📋 Salin</button>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:0.72rem;color:var(--c-muted)">Hanya yang punya tautan bisa melihat</span>
            <button class="btn small danger ghost" id="btn-revoke-share" data-testid="report-share-revoke" style="font-size:0.72rem;padding:4px 8px">🚫 Cabut Tautan</button>
          </div>
        </div>
      `;

      $('#btn-copy-share').onclick = () => {
        const input = $('#share-link-input');
        input.select();
        navigator.clipboard.writeText(fullUrl).then(() => {
          if (window.toast) toast('Tautan disalin ke clipboard! 📋');
        }).catch(() => {
          if (window.toast) toast('Silakan salin tautan secara manual');
        });
      };

      $('#btn-revoke-share').onclick = async () => {
        if (!confirm('Yakin ingin mencabut tautan berbagi ini? Tautan sebelumnya tidak akan bisa dibuka lagi.')) return;
        try {
          await API.revokeReportShare();
          if (window.toast) toast('Tautan berbagi telah dicabut.');
          this.renderReportBody(this.reportData, this.currentOffset);
        } catch (e) {
          if (window.toast) toast('Gagal mencabut: ' + e.message);
        }
      };
    } catch (e) {
      box.innerHTML = `<p style="color:var(--c-danger);font-size:0.8rem">Gagal: ${e.message}</p>`;
    }
  },

  showAbilityDetailModal(item) {
    const modal = document.createElement('div');
    modal.className = 'modal-mask active';
    modal.innerHTML = `
      <div class="modal" style="max-width:380px;padding:20px;text-align:left">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:1.8rem">${item.icon || '📚'}</span>
            <div>
              <h3 style="font-size:1.1rem;font-weight:800;color:#fff;margin:0">${esc(item.name)}</h3>
              <div style="font-size:0.8rem;color:var(--c-muted)">Level Kemampuan</div>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:1.4rem;font-weight:900;color:#38bdf8">${item.score !== null ? item.score : '-'}<span style="font-size:0.8rem;font-weight:400;color:var(--c-muted)">/100</span></div>
            <div style="font-size:0.75rem;font-weight:700;color:#38bdf8">${item.levelIcon || '🌱'} ${item.levelName || 'Pemula'}</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;background:rgba(255,255,255,0.03);padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;font-size:0.82rem">
            <span style="color:var(--c-muted)">Penguasaan Leitner (60%):</span>
            <strong style="color:#fff">${item.mastery !== undefined ? item.mastery + '%' : '-'}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem">
            <span style="color:var(--c-muted)">Akurasi Terkini (30%):</span>
            <strong style="color:#10b981">${item.accuracy !== undefined ? item.accuracy + '%' : '-'}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem">
            <span style="color:var(--c-muted)">Soal Pernah Dijawab:</span>
            <strong style="color:#fff">${item.answeredDistinct || 0} / ${item.totalQuestions || 0}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.82rem">
            <span style="color:var(--c-muted)">Total Jawaban (Attempts):</span>
            <strong style="color:#fff">${item.attempts || 0}</strong>
          </div>
        </div>

        <div style="margin-top:12px;font-size:0.8rem;color:var(--c-muted);line-height:1.4">
          💡 <em>Semakin sering menjawab benar di kotak Leitner tinggi, semakin cepat levelmu naik.</em>
        </div>

        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn secondary" id="modal-close" style="flex:1">Tutup</button>
          <button class="btn primary" id="modal-practice" style="flex:1">🎯 Latihan</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#modal-close').onclick = () => modal.remove();
    modal.querySelector('#modal-practice').onclick = async () => {
      modal.remove();
      if (window.Sfx) Sfx.play('tap');
      if (Screens.battle && Screens.battle.start) {
        await Screens.battle.start(item.subjectId);
      } else {
        go('campaign', { subjectId: item.subjectId });
      }
    };
  },

  showHelpModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-mask active';
    modal.innerHTML = `
      <div class="modal" style="max-width:380px;padding:20px;text-align:left">
        <h3 style="font-size:1.1rem;font-weight:800;color:#fff;margin:0 0 10px 0">❓ Cara Level Dihitung</h3>
        <p style="font-size:0.84rem;color:var(--c-muted);line-height:1.5;margin:0 0 12px 0">
          Skor kemampuan (0–100) mengukur seberapa mendalam kamu menguasai suatu mata pelajaran:
        </p>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:0.82rem;background:rgba(255,255,255,0.04);padding:10px 12px;border-radius:12px;margin-bottom:12px">
          <div><strong style="color:#38bdf8">1. Penguasaan Materi (60%):</strong> Seberapa sering kamu mengingat soal dengan benar di kotak memori (SRS).</div>
          <div><strong style="color:#10b981">2. Akurasi Terkini (30%):</strong> Ketepatan jawaban pada 40 soal terbaru.</div>
          <div><strong style="color:#f59e0b">3. Cakupan Bank Soal (10%):</strong> Berapa banyak variasi soal yang sudah kamu coba.</div>
        </div>
        <div style="font-size:0.8rem;color:var(--c-muted);margin-bottom:16px">
          🌱 Pemula (0-19) · 🧭 Penjelajah (20-39) · ⚔️ Petualang (40-59) · 🛡️ Ahli (60-79) · 👑 Master (80-100).
        </div>
        <button class="btn primary block" id="modal-help-close" style="width:100%">Mengerti 👍</button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#modal-help-close').onclick = () => modal.remove();
  }
};

Screens.laporan = Screens.report;

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

        <!-- Ubin Navigasi Responsif -->
        <div class="home-tiles-grid">
          <button class="menu-tile highlight" id="m-play" data-testid="menu-play">
            <span class="tile-icon">⚔️</span>
            <span class="tile-title">Petualangan</span>
            <span class="tile-desc">Lawan Bos</span>
          </button>
          <button class="menu-tile highlight-friends" id="m-friends" data-testid="menu-friends">
            <span class="tile-icon">👥</span>
            <span class="tile-title">Pertemanan</span>
            <span class="tile-desc">Duel & Teman</span>
            <span id="friends-home-badge" class="badge-count" style="display:none">0</span>
          </button>
          <button class="menu-tile" id="m-practice" data-testid="menu-practice">
            <span class="tile-icon">📚</span>
            <span class="tile-title">Latihan</span>
            <span class="tile-desc">Bebas Waktu</span>
          </button>
          <button class="menu-tile" id="m-report" data-testid="menu-report">
            <span class="tile-icon">📊</span>
            <span class="tile-title">Laporan</span>
            <span class="tile-desc">Mingguanku</span>
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
    const mFriends = $('#m-friends');
    if (mFriends) mFriends.onclick = () => { if (window.Sfx) Sfx.play('tap'); go('friends'); };
    $('#m-report').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('report'); };
    $('#m-practice').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('subjects', { mode: 'PRACTICE' }); };
    $('#m-profile').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('profil', { tab: 'ringkasan' }); };
    $('#m-skin').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('profil', { tab: 'skin' }); };
    $('#m-skills').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('profil', { tab: 'skill' }); };
    $('#m-shop').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('profil', { tab: 'toko' }); };
    $('#m-dex').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('dex'); };
    $('#m-settings').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('settings'); };
    $('#btn-switch-user').onclick = () => Screens.home.openAuthModal();

    API.req('/api/duels/invites').then(res => {
      const count = res.invites?.length || 0;
      const bEl = $('#friends-home-badge');
      if (bEl && count > 0) {
        bEl.textContent = count;
        bEl.style.display = 'inline-block';
      }
    }).catch(() => {});
  },

  async openAuthModal() {
    let classes = [];
    try { classes = await API.getClasses(); } catch (e) {}
    if (!classes || classes.length === 0) {
      classes = [{ id: 1, name: 'Kelas 4 SD' }, { id: 2, name: 'Kelas 5 SD' }];
    }
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
            ${classes.map(c => `<option value="${c.id}" ${Player.classId() === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
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
  classes: [],
  viewMode: 'bebas', // 'bebas' | 'cerita' (E.1 / T-35)
  selectedSubjectId: null,

  async render(app) {
    let classes = [];
    try {
      classes = await API.getClasses();
    } catch (e) {
      classes = [];
    }
    if (!classes || classes.length === 0) {
      classes = [{ id: Player.classId() || 1, name: 'Kelas 4 SD' }];
    }
    this.classes = classes;

    // Prefer current class if it exists in list, else player class, else first class
    if (!this.classes.some(c => c.id === this.currentClassId)) {
      const pCid = Player.classId();
      this.currentClassId = this.classes.some(c => c.id === pCid) ? pCid : this.classes[0].id;
    }

    Screens.battle.brutalEnabled = false;
    const pLevel = typeof Player.level === 'function' ? Player.level() : (Player.data?.level || 1);

    app.innerHTML = `
      <section class="screen active stack" style="gap:10px">
        <div class="hud" style="margin-bottom:0">
          <button class="icon-btn" id="sub-back">←</button>
          <h2 class="hud-title">Peta Petualangan</h2>
          <span class="chip accent">🪙 <span id="hdr-coins">${Player.coins()}</span></span>
        </div>

        <!-- Sakelar Mode: Bebas | Cerita | Fun -->
        <div style="display:flex;background:rgba(255,255,255,0.08);padding:4px;border-radius:12px;gap:4px">
          <button class="btn small ${this.viewMode === 'bebas' ? 'primary' : 'ghost'}" id="mode-toggle-bebas" data-testid="mode-toggle-bebas" style="flex:1;font-weight:700">
            ⚔️ Mode Bebas
          </button>
          <button class="btn small ${this.viewMode === 'cerita' ? 'primary' : 'ghost'}" id="mode-toggle-cerita" data-testid="mode-toggle-cerita" style="flex:1;font-weight:700">
            🗺️ Mode Cerita
          </button>
          <button class="btn small ${this.viewMode === 'fun' ? 'primary' : 'ghost'}" id="mode-toggle-fun" data-testid="mode-toggle-fun" style="flex:1;font-weight:700">
            🎉 Mode Fun
          </button>
        </div>

        <!-- SAKELAR MODE BRUTAL (T-21) -->
        <div class="brutal-toggle-wrap" data-testid="brutal-toggle-wrap">
          <label style="display:flex;align-items:center;gap:10px;cursor:${pLevel >= 5 ? 'pointer' : 'not-allowed'};width:100%">
            <input type="checkbox" id="brutal-toggle" data-testid="brutal-toggle" ${Screens.battle.brutalEnabled ? 'checked' : ''} ${pLevel < 5 ? 'disabled' : ''} style="width:18px;height:18px;accent-color:#dc2626">
            <div style="flex:1">
              <span style="font-size:0.85rem;font-weight:800;color:${pLevel >= 5 ? '#ef4444' : 'var(--c-muted)'}">💀 Mode Brutal</span>
              <span style="display:block;font-size:0.75rem;color:var(--c-muted)">Skill boss 2× • Hadiah 3× ${pLevel < 5 ? '🔒 (Terbuka di Lv 5)' : ''}</span>
            </div>
          </label>
        </div>

        <!-- Pilihan Kelas Dinamis -->
        <div id="class-tabs-container" style="display:flex;gap:8px;overflow-x:auto;padding-bottom:2px">
          ${this.classes.map(c => `
            <button class="btn small ${this.currentClassId === c.id ? '' : 'ghost'} tab-class-btn" ${c.id === 1 ? 'id="tab-k4"' : (c.id === 2 ? 'id="tab-k5"' : '')} data-cid="${c.id}" style="font-weight:700;white-space:nowrap">
              🏫 ${esc(c.name)}
            </button>
          `).join('')}
        </div>

        <div class="grow" id="subjects-container" style="overflow-y:auto;padding-bottom:16px;max-height:calc(100vh - 180px)">
          <div style="text-align:center;padding:30px;color:var(--c-muted)">Memuat petualangan...</div>
        </div>
      </section>
    `;

    $('#sub-back').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('home'); };

    const bToggle = $('#brutal-toggle');
    if (bToggle) {
      bToggle.onchange = () => {
        if (bToggle.checked) {
          if (pLevel < 5) {
            bToggle.checked = false;
            Screens.battle.brutalEnabled = false;
            toast('Mode Brutal baru terbuka di Level 5! 🔒');
            return;
          }
          let pSettings = {};
          try {
            pSettings = typeof Player.data?.settings_json === 'string' ? JSON.parse(Player.data.settings_json) : (Player.data?.settings_json || {});
          } catch (e) {}
          if (!pSettings.brutalAck) {
            bToggle.checked = false;
            Screens.battle.showBrutalConfirmModal((accepted) => {
              if (accepted) {
                bToggle.checked = true;
                Screens.battle.brutalEnabled = true;
                pSettings.brutalAck = true;
                if (Player.data) Player.data.settings_json = pSettings;
                API.saveSettings({ brutalAck: true }).catch(() => {});
              }
            });
            return;
          }
          Screens.battle.brutalEnabled = true;
        } else {
          Screens.battle.brutalEnabled = false;
        }
      };
    }

    const classContainer = $('#class-tabs-container');
    if (classContainer) {
      classContainer.querySelectorAll('.tab-class-btn').forEach(btn => {
        btn.onclick = () => {
          if (window.Sfx) Sfx.play('tap');
          this.currentClassId = parseInt(btn.getAttribute('data-cid'), 10);
          this.renderContent();
        };
      });
    }

    const updateModeToggles = () => {
      $('#mode-toggle-bebas').className = `btn small ${this.viewMode === 'bebas' ? 'primary' : 'ghost'}`;
      $('#mode-toggle-cerita').className = `btn small ${this.viewMode === 'cerita' ? 'primary' : 'ghost'}`;
      $('#mode-toggle-fun').className = `btn small ${this.viewMode === 'fun' ? 'primary' : 'ghost'}`;
    };

    $('#mode-toggle-bebas').onclick = () => {
      this.viewMode = 'bebas';
      updateModeToggles();
      this.renderContent();
    };

    $('#mode-toggle-cerita').onclick = () => {
      this.viewMode = 'cerita';
      updateModeToggles();
      this.renderContent();
    };

    $('#mode-toggle-fun').onclick = () => {
      this.viewMode = 'fun';
      updateModeToggles();
      this.renderContent();
    };

    await this.renderContent();
  },

  async renderContent() {
    const classContainer = $('#class-tabs-container');
    if (classContainer) {
      classContainer.querySelectorAll('.tab-class-btn').forEach(btn => {
        const cid = parseInt(btn.getAttribute('data-cid'), 10);
        btn.className = `btn small ${this.currentClassId === cid ? '' : 'ghost'} tab-class-btn`;
      });
    }
    if (this.viewMode === 'cerita') {
      await this.loadCampaignMap();
    } else {
      await this.loadSubjects();
    }
  },

  async loadSubjects() {
    const box = $('#subjects-container');
    try {
      const subjects = await API.getSubjects(this.currentClassId);
      if (subjects.length === 0) {
        box.innerHTML = `<div style="text-align:center;padding:40px;color:var(--c-muted)">Belum ada mata pelajaran untuk kelas ini.</div>`;
        return;
      }

      const isFun = this.viewMode === 'fun';
      box.innerHTML = `
        ${isFun ? `
          <div style="background:linear-gradient(135deg,rgba(168,85,247,0.2) 0%,rgba(236,72,153,0.15) 100%);border:1px solid rgba(168,85,247,0.3);border-radius:12px;padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;gap:10px">
            <span style="font-size:1.8rem">🎉</span>
            <div>
              <div style="font-weight:800;color:#fff;font-size:0.95rem">Mode Fun (4 Variasi Tipe Soal)</div>
              <div style="font-size:0.8rem;color:var(--c-muted)">Menghadirkan Benar/Salah, Mengurutkan, Menjodohkan, &amp; Isian Singkat (Tanpa Pilihan Ganda/MCQ). Tanpa Skill, Koin 0.5×!</div>
            </div>
          </div>
        ` : ''}
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
                <button class="btn ${isFun ? 'primary' : 'secondary'}" data-testid="start-battle" style="pointer-events:none">${isFun ? 'Mainkan 🎉' : 'Lawan ⚔️'}</button>
              </div>
            `;
          }).join('')}
        </div>
      `;

      $$('.subject-card', box).forEach(card => {
        card.onclick = async () => {
          const sid = parseInt(card.dataset.id, 10);
          if (window.Sfx) Sfx.play('select');
          if (this.viewMode === 'fun') {
            await Screens.battle.start(sid, { mode: 'FUN' });
          } else {
            await Screens.battle.start(sid, { mode: 'BATTLE', brutal: Screens.battle.brutalEnabled });
          }
        };
      });
    } catch (e) {
      box.innerHTML = `<div style="text-align:center;padding:30px;color:var(--c-bad)">Gagal memuat mata pelajaran: ${esc(e.message)}</div>`;
    }
  },

  async loadCampaignMap() {
    const box = $('#subjects-container');
    try {
      const subjects = await API.getSubjects(this.currentClassId);
      if (subjects.length === 0) {
        box.innerHTML = `<div style="text-align:center;padding:40px;color:var(--c-muted)">Belum ada mata pelajaran untuk kelas ini.</div>`;
        return;
      }

      if (!this.selectedSubjectId || !subjects.some(s => s.id === this.selectedSubjectId)) {
        this.selectedSubjectId = subjects[0].id;
      }

      const campData = await API.getCampaign(this.selectedSubjectId);
      const curSubject = subjects.find(s => s.id === this.selectedSubjectId);

      // Render Subject selector chips + Vertical winding path
      box.innerHTML = `
        <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:12px">
          ${subjects.map(s => `
            <button class="btn small ${s.id === this.selectedSubjectId ? 'primary' : 'secondary'} sub-chip" data-id="${s.id}" style="white-space:nowrap;padding:6px 12px;font-size:0.85rem">
              ${s.icon || '📚'} ${esc(s.name)}
            </button>
          `).join('')}
        </div>

        
        <!-- Banner Info Reset Mode Cerita Setiap Senin 07:00 WIB -->
        <div class="card" style="background:linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98));border:1px solid rgba(245,158,11,0.35);border-radius:16px;padding:12px 14px;margin-bottom:14px;display:flex;align-items:center;gap:12px;box-shadow:0 4px 16px rgba(0,0,0,0.35)">
          <span style="font-size:1.8rem;line-height:1">🗓️</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:0.85rem;font-weight:800;color:#fef08a;margin-bottom:2px">
              Mode Cerita Mingguan: Hanya 1× Tiap Wilayah
            </div>
            <div style="font-size:0.75rem;color:#cbd5e1;line-height:1.35">
              Setiap wilayah hanya dapat dimainkan <strong>1 kali</strong> per minggu. Seluruh wilayah otomatis di-reset setiap <strong>Senin pukul 07:00 WIB</strong>!
            </div>
          </div>
        </div>

        <div class="campaign-path-root" style="display:flex;flex-direction:column;gap:20px;padding:8px 0">
          ${campData.chapters.map(ch => {
            return `
              <div class="chapter-card card" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:14px;overflow:hidden">
                <!-- Banner Gambar Peta Tema Wilayah -->
                <div class="chapter-map-banner" style="position:relative;height:120px;border-radius:14px;overflow:hidden;margin-bottom:14px;border:1px solid rgba(255,255,255,0.12);box-shadow:0 4px 12px rgba(0,0,0,0.3)">
                  <img src="/img/maps/map_${esc(ch.theme)}.jpg" alt="${esc(ch.title)}" style="width:100%;height:100%;object-fit:cover;display:block;filter:brightness(0.85)" onerror="this.src='/img/maps/map_hutan.jpg'">
                  <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.35) 60%, transparent 100%);display:flex;flex-direction:column;justify-content:flex-end;padding:10px 14px">
                    <div style="display:flex;justify-content:space-between;align-items:flex-end">
                      <div>
                        <span style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:var(--c-primary,#10b981);font-weight:800">Bab ${ch.n} · Peta Wilayah</span>
                        <h3 style="font-size:1.15rem;font-weight:800;color:#fff;margin:2px 0;text-shadow:0 2px 4px rgba(0,0,0,0.8)">${esc(ch.title)}</h3>
                      </div>
                      ${ch.completed ? `
                        <button class="btn small secondary btn-view-comic" data-theme="${ch.theme}" data-testid="btn-view-comic" style="font-size:0.8rem;padding:4px 10px;background:rgba(15,23,42,0.8);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.2)">
                          📖 Lihat Cerita
                        </button>
                      ` : `
                        <span class="chip" style="font-size:0.75rem;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.2)">${ch.nodes.filter(n => n.cleared).length}/${ch.nodes.length} Selesai</span>
                      `}
                    </div>
                  </div>
                </div>

                <!-- Jalur Berkelok (Vertical Winding Path: Wilayah 1, Wilayah 2, Boss Wilayah 3) -->
                <div class="winding-path" style="display:flex;flex-direction:column;align-items:center;gap:14px;position:relative;padding:10px 0">
                  ${ch.nodes.map(node => {
                    const starsStr = node.stars > 0 ? '⭐'.repeat(node.stars) : '';
                    const alignStyle = node.order === 1 ? 'align-self:flex-start;margin-left:18%'
                      : node.order === 2 ? 'align-self:flex-end;margin-right:18%'
                      : 'align-self:center;transform:scale(1.18);margin-top:6px';

                    return `
                      <div class="campaign-node-wrap ${node.unlocked ? 'unlocked' : 'locked'}" style="${alignStyle};display:flex;flex-direction:column;align-items:center;gap:4px">
                        <button class="campaign-node-btn ${node.isBoss ? 'boss-node' : ''} ${node.unlocked ? 'unlocked' : 'locked'} ${node.clearedThisWeek ? 'cleared-week' : ''}"
                          data-key="${node.key}"
                          data-unlocked="${node.unlocked ? '1' : '0'}"
                          data-cleared-week="${node.clearedThisWeek ? '1' : '0'}"
                          data-testid="campaign-node"
                          style="width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;cursor:${node.unlocked ? 'pointer' : 'not-allowed'};background:${node.clearedThisWeek ? 'linear-gradient(135deg, #059669, #047857)' : (node.unlocked ? (node.isBoss ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #10b981, #059669)') : '#334155')};border:${node.clearedThisWeek ? '3px solid #34d399' : (node.isBoss ? '3px solid #fef08a' : '2px solid rgba(255,255,255,0.2)')};box-shadow:${node.unlocked ? '0 4px 12px rgba(0,0,0,0.4)' : 'none'};opacity:${node.unlocked ? '1' : '0.55'}">
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
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      $$('.sub-chip', box).forEach(chip => {
        chip.onclick = () => {
          this.selectedSubjectId = parseInt(chip.dataset.id, 10);
          this.loadCampaignMap();
        };
      });

      $$('.campaign-node-btn', box).forEach(btn => {
        btn.onclick = async () => {
          const unlocked = btn.dataset.unlocked === '1';
          const clearedThisWeek = btn.dataset.clearedWeek === '1';
          const nodeKey = btn.dataset.key;
          if (!unlocked) {
            toast('Selesaikan wilayah sebelumnya terlebih dahulu untuk membuka kunci! 🔒');
            if (window.Feedback) Feedback.sfx('wrong');
            return;
          }
          if (clearedThisWeek) {
            toast('Wilayah ini sudah selesai minggu ini! Reset berikutnya hari Senin pukul 07:00 WIB. 🗓️');
            if (window.Feedback) Feedback.sfx('wrong');
            return;
          }
          if (window.Sfx) Sfx.play('select');
          await Screens.battle.start(this.selectedSubjectId, { campaignNode: nodeKey, brutal: Screens.battle.brutalEnabled });
        };
      });

      $$('.btn-view-comic', box).forEach(btn => {
        btn.onclick = () => {
          const theme = btn.dataset.theme || 'hutan';
          const comicPanels = window.StoryData?.STORY?.[theme]?.comic || [
            { panel: 1, title: 'Kisah Penakluk', text: 'Perjalanan panjang menuju puncak kejayaan...' }
          ];
          Screens.showComicModal(comicPanels, theme);
        };
      });

    } catch (e) {
      box.innerHTML = `<div style="text-align:center;padding:30px;color:var(--c-bad)">Gagal memuat peta cerita: ${esc(e.message)}</div>`;
    }
  }
};

Screens.peta = Screens.subjects;

/* ============================================================
   SCREEN: Battle (Server-Authoritative Arena)
   ============================================================ */
Screens.battle = {
  renderEnergyPips(cur, max) {
    const val = Number(cur) || 0;
    const capacity = Number(max) || 5;
    const pipW = capacity > 8 ? 4 : 6;
    const pipH = 8;
    let html = '';
    for (let i = 0; i < capacity; i++) {
      const filled = i < val;
      const col = filled ? '#38bdf8' : 'rgba(255,255,255,0.18)';
      html += '<span class="energy-pip" style="width:' + pipW + 'px;height:' + pipH + 'px;background:' + col + ';border-radius:2px;display:inline-block"></span>';
    }
    return html;
  },

  updateEnergyGauge(energy) {
    const val = (typeof energy === 'object' && energy !== null) ? energy.value : (energy ?? 2);
    const max = (typeof energy === 'object' && energy !== null) ? energy.max : 5;
    const valEl = document.getElementById('energy-value');
    if (valEl) valEl.textContent = val + '/' + max;
    const oldValEl = document.getElementById('energy-val');
    if (oldValEl) oldValEl.textContent = val;
    const pipsEl = document.getElementById('energy-pips');
    if (pipsEl) pipsEl.innerHTML = this.renderEnergyPips(val, max);
    const fabEl = document.getElementById('skill-fab-energy');
    if (fabEl) fabEl.textContent = val;
    const pillEl = document.getElementById('skill-btn-energy-pill');
    if (pillEl) pillEl.textContent = val + ' ⚡';
  },
  session: null,
  skills: [],
  isUsingSkill: false,
  timerInterval: null,
  heartbeatInterval: null,
  timeRemainingSec: 0,
  timeTotalSec: 20,
  isAnswering: false,

  async start(subjectId, options = {}) {
    try {
      toast('Membangkitkan monster bos...');
      const res = await API.startSession(subjectId, options);
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

  _introShown: {},
  _introTimer: null,

  dismissIntro() {
    if (this._introTimer) {
      clearTimeout(this._introTimer);
      this._introTimer = null;
    }
    const introEl = document.getElementById('boss-intro');
    if (introEl) {
      introEl.classList.add('dismissing');
      setTimeout(() => {
        if (introEl && introEl.parentNode) introEl.remove();
      }, 200);
    }
  },

  destroy() {
    this.dismissIntro();
    this.stopTimer();
    this.stopHeartbeat();
    const sheetDrawer = $('#answer-sheet-drawer');
    const sheetBackdrop = $('#answer-sheet-backdrop');
    if (sheetDrawer) sheetDrawer.classList.remove('open');
    if (sheetBackdrop) sheetBackdrop.classList.remove('open');
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

  renderPassiveBuffChips(passives) {
    if (!passives) return '';
    const chips = [];

    if (passives.startShield) {
      chips.push(`<span class="battle-buff-chip chip info" id="buff-startShield" data-buff="startShield" title="Perisai Awal +${passives.startShield}">🛡️ Perisai +${passives.startShield}</span>`);
    }
    if (passives.critChance) {
      chips.push(`<span class="battle-buff-chip chip accent" id="buff-crit" data-buff="crit" title="Peluang Kritis +${Math.round(passives.critChance * 100)}% (Damage 1.5×)">⚡ Crit +${Math.round(passives.critChance * 100)}%</span>`);
    }
    if (passives.dodgeRate) {
      chips.push(`<span class="battle-buff-chip" id="buff-dodge" data-buff="dodge" style="background:rgba(56,189,248,0.18);color:#38bdf8;border:1px solid rgba(56,189,248,0.4)" title="Peluang Hindaran +${Math.round(passives.dodgeRate * 100)}% (0 Damage)">💨 Hindaran ${Math.round(passives.dodgeRate * 100)}%</span>`);
    }
    if (passives.damageReduction) {
      chips.push(`<span class="battle-buff-chip" id="buff-damageReduction" data-buff="damageReduction" style="background:rgba(148,163,184,0.18);color:#cbd5e1;border:1px solid rgba(148,163,184,0.4)" title="Reduksi Serangan -${passives.damageReduction} DMG">🛡️ Zirah -${passives.damageReduction} DMG</span>`);
    }
    if (passives.bonusTime) {
      chips.push(`<span class="battle-buff-chip" id="buff-bonusTime" data-buff="bonusTime" style="background:rgba(251,191,36,0.18);color:#fbbf24;border:1px solid rgba(251,191,36,0.4)" title="Bonus Waktu +${passives.bonusTime}s">⏳ Waktu +${passives.bonusTime}s</span>`);
    }
    if (passives.dragonBreathChance) {
      chips.push(`<span class="battle-buff-chip chip danger" id="buff-dragon" data-buff="dragon" title="Semburan Naga: Peluang ${Math.round(passives.dragonBreathChance * 100)}% (+${passives.dragonBreathDamage || 20} DMG Api)">🔥 Semburan Naga</span>`);
    }
    if (passives.healOnCorrect) {
      chips.push(`<span class="battle-buff-chip" id="buff-healCorrect" data-buff="healCorrect" style="background:rgba(34,197,94,0.18);color:#22c55e;border:1px solid rgba(34,197,94,0.4)" title="Pemulihan Suci: +${passives.healOnCorrect} HP tiap jawaban benar">💖 Heal +${passives.healOnCorrect}</span>`);
    }
    if (passives.comboRegen) {
      chips.push(`<span class="battle-buff-chip" id="buff-comboRegen" data-buff="comboRegen" style="background:rgba(34,197,94,0.18);color:#22c55e;border:1px solid rgba(34,197,94,0.4)" title="Regen HP: +${passives.comboRegen.hp} HP tiap ${passives.comboRegen.combo} combo">💖 Regen Combo</span>`);
    }
    if (passives.comboEnergyChance) {
      chips.push(`<span class="battle-buff-chip" id="buff-comboEnergy" data-buff="comboEnergy" style="background:rgba(168,85,247,0.18);color:#c084fc;border:1px solid rgba(168,85,247,0.4)" title="Curi Energi: Peluang ${Math.round(passives.comboEnergyChance.chance * 100)}% (+1 ⚡) tiap ${passives.comboEnergyChance.combo} combo">🦊 Curi Energi</span>`);
    }
    if (passives.streakProtectChance) {
      chips.push(`<span class="battle-buff-chip" id="buff-streakProtect" data-buff="streakProtect" style="background:rgba(168,85,247,0.18);color:#c084fc;border:1px solid rgba(168,85,247,0.4)" title="Proteksi Combo: Peluang ${Math.round(passives.streakProtectChance * 100)}% combo aman saat salah">🦉 Proteksi Combo</span>`);
    }
    if (passives.lastStand) {
      chips.push(`<span class="battle-buff-chip" id="buff-lastStand" data-buff="lastStand" style="background:rgba(239,68,68,0.18);color:#f87171;border:1px solid rgba(239,68,68,0.4)" title="Darah Terakhir: Bertahan dengan 1 HP saat HP habis">🩸 Darah Terakhir</span>`);
    }
    if (passives.coinBonus) {
      chips.push(`<span class="battle-buff-chip chip warning" id="buff-coinBonus" data-buff="coinBonus" title="Bonus Koin +${Math.round(passives.coinBonus * 100)}%">🪙 Koin +${Math.round(passives.coinBonus * 100)}%</span>`);
    }
    if (passives.comboDamagePercent) {
      chips.push(`<span class="battle-buff-chip" id="buff-comboDamagePercent" data-buff="comboDamagePercent" style="background:rgba(245,158,11,0.18);color:#f59e0b;border:1px solid rgba(245,158,11,0.4)" title="Raja Combo: +${Math.round(passives.comboDamagePercent * 100)}% Damage per Tingkat Combo">👑 Combo +${Math.round(passives.comboDamagePercent * 100)}%/Streak</span>`);
    }
    if (passives.comboDamageBonus) {
      chips.push(`<span class="battle-buff-chip" id="buff-comboDamageBonus" data-buff="comboDamageBonus" style="background:rgba(245,158,11,0.18);color:#f59e0b;border:1px solid rgba(245,158,11,0.4)" title="Serangan Combo: +${passives.comboDamageBonus.bonus} DMG saat Combo ≥${passives.comboDamageBonus.minCombo || 3}">💥 Combo +${passives.comboDamageBonus.bonus} DMG</span>`);
    }
    if (passives.correctDamageBonus) {
      chips.push(`<span class="battle-buff-chip" id="buff-correctDamageBonus" data-buff="correctDamageBonus" style="background:rgba(239,68,68,0.18);color:#f87171;border:1px solid rgba(239,68,68,0.4)" title="Bonus Serangan: +${passives.correctDamageBonus} DMG">⚔️ Serangan +${passives.correctDamageBonus} DMG</span>`);
    }
    if (passives.bossDamageBonusPercent) {
      chips.push(`<span class="battle-buff-chip" id="buff-bossDamageBonusPercent" data-buff="bossDamageBonusPercent" style="background:rgba(239,68,68,0.18);color:#f87171;border:1px solid rgba(239,68,68,0.4)" title="Bonus Damage Bos: +${Math.round(passives.bossDamageBonusPercent * 100)}%">👹 Bos DMG +${Math.round(passives.bossDamageBonusPercent * 100)}%</span>`);
    }
    if (passives.thornsDamage) {
      chips.push(`<span class="battle-buff-chip" id="buff-thornsDamage" data-buff="thornsDamage" style="background:rgba(168,85,247,0.18);color:#c084fc;border:1px solid rgba(168,85,247,0.4)" title="Duri Pembalas: ${passives.thornsDamage} DMG saat terkena hit">🦔 Duri ${passives.thornsDamage} DMG</span>`);
    }
    if (passives.xpBonus) {
      chips.push(`<span class="battle-buff-chip chip info" id="buff-xpBonus" data-buff="xpBonus" title="Bonus XP +${Math.round(passives.xpBonus * 100)}%">⭐ XP +${Math.round(passives.xpBonus * 100)}%</span>`);
    }
    if (passives.cheatDeath) {
      chips.push(`<span class="battle-buff-chip chip accent" id="buff-kirinMiracle" data-buff="cheatDeath" title="Mukjizat Kirin: Kebal Kematian 1x +25 Shield +2⚡">🦄 Mukjizat Kirin</span>`);
    }
    if (passives.pounceAutoCrit) {
      chips.push(`<span class="battle-buff-chip chip danger" id="buff-tigerPounce" data-buff="pounce" title="Terkaman Harimau: Tiap 5 Benar Auto-Crit x2.2">🐅 Terkaman Harimau</span>`);
    }
    if (passives.gryphonThunder) {
      chips.push(`<span class="battle-buff-chip chip warning" id="buff-thunderGryphon" data-buff="gryphon" title="Gryphon Petir: Tiap 5 Combo Sambaran 35 True DMG">⚡ Sambaran Petir</span>`);
    }
    if (passives.krakenSurge) {
      chips.push(`<span class="battle-buff-chip chip info" id="buff-krakenTsunami" data-buff="kraken" title="Kraken Samudra: Reduksi 15% Dmg & Tsunami 30 DMG saat terima 40 Dmg">🦑 Gelombang Pasang</span>`);
    }
    if (passives.fenrirBlizzard) {
      chips.push(`<span class="battle-buff-chip" id="buff-fenrirShieldAbsorb" data-buff="fenrir" style="background:rgba(56,189,248,0.18);color:#38bdf8;border:1px solid rgba(56,189,248,0.4)" title="Fenrir Es: Reduksi 10% Dmg & Tameng Kebal 1x Salah tiap 3 Benar">❄️ Badai Fenrir</span>`);
    }
    if (passives.vampiricBite) {
      chips.push(`<span class="battle-buff-chip" id="buff-vampiricDrain" data-buff="vampiric" style="background:rgba(34,197,94,0.18);color:#22c55e;border:1px solid rgba(34,197,94,0.4)" title="Buaya Purba: Lifesteal 12% DMG jadi HP">🐊 Lifesteal 12%</span>`);
    }
    if (passives.staticShockStunChance) {
      chips.push(`<span class="battle-buff-chip" id="buff-abyssalStun" data-buff="stun" style="background:rgba(168,85,247,0.18);color:#c084fc;border:1px solid rgba(168,85,247,0.4)" title="Ubur-Ubur Abisal: ${Math.round(passives.staticShockStunChance * 100)}% Peluang Stun Bos">🪼 Stun ${Math.round(passives.staticShockStunChance * 100)}%</span>`);
    }
    if (passives.venomBloom) {
      chips.push(`<span class="battle-buff-chip" id="buff-venomBloom" data-buff="venom" style="background:rgba(34,197,94,0.18);color:#22c55e;border:1px solid rgba(34,197,94,0.4)" title="Kobra Giok: Racun 4 DMG/turn (max 3x)">🐍 Racun Kobra</span>`);
    }
    if (passives.kingsRoar) {
      chips.push(`<span class="battle-buff-chip chip warning" id="buff-kingsRoar" data-buff="lion" title="Singa Emas: Reduksi Enrage 25% & +15 Shield saat Transisi">🦁 Raungan Singa</span>`);
    }
    if (passives.hawkeye) {
      chips.push(`<span class="battle-buff-chip chip danger" id="buff-hawkeye" data-buff="eagle" title="Mata Rajawali: Beku +2.5s & Tembus 15% Armor">🦅 Mata Rajawali</span>`);
    }
    if (passives.coinBonusChance) {
      chips.push(`<span class="battle-buff-chip chip warning" id="buff-hamsterCoin" data-buff="hamster" title="Hamster: 25% Peluang +5 Koin tiap benar">🐹 Pipi Emas</span>`);
    }
    if (passives.sonarEliminateChance) {
      chips.push(`<span class="battle-buff-chip chip info" id="buff-sonarEliminate" data-buff="bat" title="Kelelawar Gema: 20% Peluang Hapus 1 Pilihan Salah">🦇 Ekolokasi</span>`);
    }
    if (Array.isArray(passives.activeSets)) {
      passives.activeSets.forEach(set => {
        chips.push(`<span class="battle-buff-chip chip accent" id="buff-set-${esc(set.id)}" data-buff="set" title="${esc(set.desc || set.name)}">${esc(set.icon || '✨')} ${esc(set.name)}</span>`);
      });
    }

    if (chips.length === 0) return '';
    return chips.join('');
  },

  showPassiveTrigger(triggeredList, startDelay = 500) {
    if (!Array.isArray(triggeredList) || triggeredList.length === 0) return;

    // 1. Audit & De-duplikasi ketat: pastikan setiap kategori pasif HANYA muncul 1 kali
    const seenCategories = new Set();
    const uniqueList = [];
    for (const tp of triggeredList) {
      if (!tp || !tp.id) continue;
      // Satukan kategori serumpun (misal healCorrect & comboRegen keduanya kategori regen)
      const cat = (tp.id === 'healCorrect' || tp.id === 'comboRegen') ? 'regen' : tp.id;
      if (seenCategories.has(cat)) continue;
      seenCategories.add(cat);
      uniqueList.push(tp);
    }

    uniqueList.forEach((tp, i) => {
      const delay = startDelay + (i * 380);
      setTimeout(() => {
        // Efek visual: pulse chip di status buff bar pemain
        const chip = $(`#buff-${tp.id}`) || $(`[data-buff="${tp.id}"]`);
        if (chip) {
          chip.classList.remove('buff-pulse');
          void chip.offsetWidth; // trigger reflow
          chip.classList.add('buff-pulse');
        }

        // Hindaran (dodge) & Kritikal (crit) sudah ditampilkan tegas oleh floater hasil jawaban utama.
        // Jangan tampilkan floater kedua di sini agar tidak muncul notifikasi ganda / bertumpuk!
        if (tp.id === 'dodge' || tp.id === 'crit') {
          return;
        }

        // Floater effect unik di tengah layar (Hanya 1 notifikasi per pasif unik)
        if (tp.id === 'comboDamagePercent') {
          this.showDamageFloater('👑 Raja Combo!', 'crit');
          this.animateBossShake();
        } else if (tp.id === 'comboDamageBonus') {
          this.showDamageFloater('💥 Combo Strike!', 'crit');
          this.animateBossShake();
        } else if (tp.id === 'dragon') {
          this.showDamageFloater('🔥 Semburan Naga!', 'crit');
          this.animateBossShake();
        } else if (tp.id === 'healCorrect' || tp.id === 'comboRegen') {
          this.showDamageFloater('💖 REGEN!', 'heal');
        } else if (tp.id === 'comboEnergy') {
          this.showDamageFloater('⚡ +1 ENERGI!', 'energy');
        } else if (tp.id === 'streakProtect') {
          this.showDamageFloater('🦉 Proteksi Combo!', 'crit');
        } else if (tp.id === 'lastStand') {
          this.showDamageFloater('🩸 Darah Terakhir!', 'crit');
        } else if (tp.id === 'damageReduction') {
          this.showDamageFloater('🛡️ Zirah Baja!', 'heal');
        } else if (tp.id === 'kirinMiracle') {
          this.showDamageFloater('🦄✨ MUKJIZAT KIRIN!', 'heal');
        } else if (tp.id === 'thunderGryphon') {
          this.showDamageFloater('⚡ SAMBARAN PETIR!', 'crit');
          this.animateBossShake();
        } else if (tp.id === 'krakenTsunami') {
          this.showDamageFloater('🌊 TSUNAMI KRAKEN!', 'crit');
        } else if (tp.id === 'fenrirShieldAbsorb') {
          this.showDamageFloater('❄️ TAMENG ES FENRIR!', 'heal');
        } else if (tp.id === 'tigerPounce') {
          this.showDamageFloater('🐅 TERKAMAN HARIMAU!', 'crit');
          this.animateBossShake();
        } else if (tp.id === 'vampiricDrain') {
          this.showDamageFloater('🐊 LIFESTEAL!', 'heal');
        } else if (tp.id === 'abyssalStun') {
          this.showDamageFloater('🪼 BOS STUN!', 'crit');
        } else if (tp.id === 'thorns') {
          this.showDamageFloater('🦔 DURI PEMBALAS!', 'crit');
        } else if (tp.id === 'venomBloom') {
          this.showDamageFloater('🐍 RACUN KOBRA!', 'crit');
        } else if (tp.id === 'hamsterCoin') {
          this.showDamageFloater('🐹 +5 KOIN!', 'energy');
        } else if (tp.id === 'racoonSteal') {
          this.showDamageFloater('🦝 COPET KOIN!', 'energy');
        } else {
          const cleanName = (tp.name || '').replace(/!+$/, '');
          if (cleanName) {
            this.showDamageFloater(`${tp.icon || '✨'} ${cleanName}!`, 'crit');
          }
        }
      }, delay);
    });
  },

  render(app) {
    const s = this.session;
    if (!s) return go('subjects');

    this.startHeartbeat();

    const bossHp = s.bossHp ?? s.boss?.hp ?? 0;
    const bossMaxHp = s.bossMaxHp ?? s.boss?.maxHp ?? 100;
    const tier = (s.bossTier || s.boss?.tier || s.boss_tier || 'common').toLowerCase();
    const tierInfo = (window.Progression?.BOSS_TIERS?.[tier]) || { id: tier, label: tier.toUpperCase(), icon: '⚪', color: '#9aa5b1' };
    const hitsNeeded = s.hitsNeeded ?? s.boss?.hitsNeeded ?? Math.ceil(bossMaxHp / 20);
    const hitsLeft = s.hitsLeft ?? s.boss?.hitsLeft ?? Math.ceil(bossHp / 20);
    const monsterDef = (s.monster && s.monster.color) ? s.monster : (Monsters.MONSTERS.find(x => x.id === (s.monster?.id || s.boss?.id || s.monster_id) || (s.boss?.name && x.name === s.boss.name)) || Monsters.MONSTERS[0]);
    const monsterObj = { ...monsterDef, ...(s.boss || {}), ...(s.monster || {}) };
    const elemKey = s.bossElement || s.boss_element || (s.boss && s.boss.element) || (window.BossSkills && BossSkills.elementForTheme(monsterObj.theme || s.subject?.monster_theme));
    const elementInfo = (window.BossSkills && BossSkills.ELEMENTS[elemKey]) || null;
    const isBrutal = Boolean(s.brutal);
    const bossSkills = s.boss?.skills || (window.BossSkills && elemKey && BossSkills.skillsFor(elemKey, tier, monsterObj.id).map(sk => ({ ...BossSkills.describeSkill(sk, tier, isBrutal), textBrutal: BossSkills.describeSkill(sk, tier, true).text }))) || [];

    const layout = Settings.get().battleLayout || 'classic';

    app.innerHTML = `
      <section class="screen active stack battle-layout-${layout} ${isBrutal ? 'battle-brutal' : ''}" data-testid="battle-root" style="gap:8px">
        <!-- TOP HUD -->
        <div class="hud battle-hud" id="battle-hud" style="margin-bottom:0">
          <div class="hud-left" style="display:flex;align-items:center;gap:5px;flex-shrink:0">
            <button class="icon-btn" id="btn-abandon" title="Menyerah" style="width:32px;height:32px;min-width:32px">✕</button>
            <div class="chip accent energy-bar" id="energy-gauge" data-testid="energy-bar" style="font-weight:800;display:inline-flex;align-items:center;gap:4px">
              ⚡ <span id="energy-value" data-testid="energy-value">${typeof s.energy === 'object' ? s.energy.value : (s.energy ?? 2)}/${typeof s.energy === 'object' ? s.energy.max : (s.energyMax || 5)}</span>
              <span id="energy-val" style="display:none">${typeof s.energy === 'object' ? s.energy.value : (s.energy ?? 2)}</span>
              <div class="energy-pips" id="energy-pips" style="display:inline-flex;gap:2px;align-items:center">
                ${Screens.battle.renderEnergyPips(typeof s.energy === 'object' ? s.energy.value : (s.energy ?? 2), typeof s.energy === 'object' ? s.energy.max : (s.energyMax || 5))}
              </div>
            </div>
            <span id="combo-meter" data-testid="combo-meter" style="display:none"><span id="combo-n">${s.streak}</span></span>
            <span class="chip accent streak-badge" id="streak-chip" data-testid="streak-chip" style="${s.streak >= 2 ? '' : 'display:none'};font-weight:800">🔥 <span id="streak-n">${s.streak}</span></span>
            <span id="q-counter" style="display:none">Soal ${s.currentIndex + 1}/${s.totalQuestions}</span>
          </div>
          <div class="hud-right" style="display:flex;align-items:center;gap:5px;flex-shrink:0">
            <span class="chip info" id="active-shield-chip" style="${((s.flags && s.flags.shield > 0) || (s.shield > 0)) ? '' : 'display:none'}">🛡️ <span id="shield-val">${(s.flags && s.flags.shield) || s.shield || 0}</span></span>
            <span class="chip info" id="player-hp-label">❤️ <span id="player-hp-val">${s.playerHp}</span>/${s.playerMaxHp}</span>
          </div>
        </div>

        <!-- BOSS CARD -->
        <div class="boss-card" style="position:relative">
          <div class="boss-svg-box ${(s.bossPhase === 2 || s.boss?.phase === 2) ? 'boss-enraged' : ''}" id="boss-svg-slot">${s.boss?.svg || Monsters.renderMonster(monsterObj, { size: 76, tier })}</div>
          <div class="boss-info">
            <div class="boss-header" style="align-items:center;gap:6px">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                <span class="boss-name" id="boss-name-label">${esc(monsterObj.name)} ${(s.bossPhase === 2 || s.boss?.phase === 2) ? '🔥' : ''}</span>
                <span class="chip tier-badge boss-tier-badge tier-${tier}" id="boss-tier-badge" data-testid="boss-tier-badge" style="background:${tierInfo.color};color:#fff;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:12px">${tierInfo.icon} ${tierInfo.label}</span>
                ${elementInfo ? `<span class="chip boss-element-badge" id="boss-element-badge" data-testid="boss-element-badge" style="background:${elementInfo.color}22;color:${elementInfo.color};border:1px solid ${elementInfo.color};">${elementInfo.icon} ${elementInfo.name}</span>` : ''}
                ${isBrutal ? `<span class="chip brutal-badge" id="brutal-badge" data-testid="brutal-badge">💀 BRUTAL</span>` : ''}
              </div>
              <span class="boss-theme-tag">${esc(monsterObj.theme || 'Arena')}</span>
            </div>
            <div class="boss-weak-tag" id="boss-weak-intro" style="font-size:0.75rem;color:var(--c-warning,#f59e0b);margin-top:2px">Titik lemah: <strong>${esc(s.weakTopic || s.boss?.weakTopic || 'Soal Sulit')}</strong> 🎯</div>
            ${bossSkills.length > 0 ? `
              <div class="boss-skill-chips" id="boss-skill-chips" data-testid="boss-skill-chips">
                ${bossSkills.map(sk => `
                  <button type="button" class="boss-skill-chip" id="boss-skill-chip-${esc(sk.id)}" data-testid="boss-skill-chip-${esc(sk.id)}" aria-label="${esc(sk.name)}" onclick="Screens.battle.showBossSkillDetail('${esc(sk.id)}')">
                    <span>${esc(sk.icon)}</span>
                    <span>${esc(sk.name)}</span>
                  </button>
                `).join('')}
              </div>
            ` : ''}
            <div class="hp-track" style="margin-top:4px;border:2px solid ${tierInfo.color};border-radius:999px;padding:1px">
              <div class="hp-fill" id="boss-hp-bar" style="width:${(bossHp / bossMaxHp) * 100}%"></div>
            </div>
            <div class="hp-label" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px">
              <span>HP Bos</span>
              <span class="boss-hits-left" id="boss-hits-left" data-testid="boss-hits-left" style="font-size:0.75rem;font-weight:700;color:${tierInfo.color}">Sisa maks. <span id="boss-hits-left-val">${hitsLeft}</span> jawaban benar</span>
              <span id="boss-hp-text">${bossHp} / ${bossMaxHp}</span>
            </div>
            <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">
              <span class="chip danger fatigue-banner" id="boss-fatigue-banner" data-testid="boss-fatigue-banner" style="${(s.fatigue_applied || s.fatigueApplied) ? 'display:inline-flex' : 'display:none'};font-size:0.75rem;font-weight:700">Boss mulai kelelahan! 😮‍💨</span>
              <span class="chip warning pity-badge" id="pity-badge" data-testid="pity-badge" style="${(s.pity || s.wrong_streak >= 3 || s.wrongStreak >= 3) ? 'display:inline-flex' : 'display:none'};font-size:0.75rem;font-weight:700">💪 Serangan Balik</span>
              <span class="chip accent boss-active-skill-chip" id="boss-active-skill-chip" style="display:none;font-size:0.75rem;font-weight:800;background:linear-gradient(135deg,#991b1b,#d97706);color:#fff;border:1px solid #fbbf24;box-shadow:0 0 10px rgba(245,158,11,0.5)">⚔️ Tebasan Super Aktif!</span>
            </div>
          </div>
          <div class="boss-slash-effect" id="boss-slash-effect"></div>
          <div id="damage-floater-slot"></div>
          <div class="dialog-bubble boss" id="boss-dialog" style="display:none"></div>
          <div class="dialog-bubble pet" id="pet-dialog" style="display:none"></div>
        </div>

        <!-- PLAYER HP TRACK -->
        <div class="player-hp-track" style="margin-top:-2px">
          <div class="player-hp-fill" id="player-hp-bar" style="width:${(s.playerHp / s.playerMaxHp) * 100}%"></div>
        </div>

        <!-- PASSIVE BUFFS ROW (SKIN PASSIVES) -->
        <div class="player-passives-bar" id="player-passives-bar" data-testid="player-passives-bar">
          ${this.renderPassiveBuffChips(s.passives || Player.data?.passives)}
        </div>

        <!-- COUNTDOWN TIMER BAR -->
        <div class="countdown-bar">
          <div class="countdown-fill" id="timer-fill" style="width:100%"></div>
        </div>

        <!-- QUESTION CARD -->
        <div class="qwrap grow" style="display:flex;flex-direction:column;min-height:0">
          <div class="boss-telegraph" id="boss-telegraph" data-testid="boss-telegraph" aria-live="assertive" style="display:none">
            <span class="boss-telegraph-icon">⚠️</span>
            <span class="boss-telegraph-text" id="boss-telegraph-text"></span>
          </div>
          <div class="qcard q-scroll-box" style="padding:14px;flex:1 1 auto;overflow-y:auto;max-height:100%">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:6px">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0;flex:1">
                <span style="font-size:.75rem;color:var(--c-muted);white-space:nowrap">${esc(s.subject.name)}</span>
                <span class="chip info" id="q-type-badge" data-testid="q-type-badge" style="font-size:0.7rem;font-weight:700;padding:2px 8px">PILIHAN GANDA</span>
                ${s.mode === 'FUN' ? '<span class="chip" id="mode-fun-badge" style="background:#a855f7;color:#fff;font-size:0.7rem;font-weight:700;padding:2px 8px">🎉 MODE FUN</span>' : ''}
                <span class="chip warning" id="review-badge" data-testid="review-badge" style="display:none;font-size:0.7rem;font-weight:700;padding:2px 8px">🔄 ULANGAN BERJARAK</span>
                <span class="chip danger" id="weak-badge" data-testid="weak-badge" style="display:none;font-size:0.7rem;font-weight:700;padding:2px 8px;background:var(--c-danger,#ef4444);color:#fff">🎯 TITIK LEMAH</span>
                <span class="chip warning" id="bonus-badge" data-testid="bonus-badge" style="display:none;font-size:0.7rem;font-weight:700;padding:2px 8px;background:#f59e0b;color:#fff">⭐ BONUS</span>
                <span class="chip" id="mystery-badge" data-testid="mystery-badge" style="display:none;font-size:0.7rem;font-weight:700;padding:2px 8px;background:#8b5cf6;color:#fff;box-shadow:0 0 8px rgba(139,92,246,0.5)">❓ MISTERI</span>
                <span class="chip skill-active-badge" id="skill-active-badge" style="display:none;font-size:0.7rem;font-weight:800;padding:2px 8px;background:linear-gradient(135deg,#dc2626,#ea580c);color:#fff;border:1px solid #fef08a;box-shadow:0 0 8px rgba(234,88,12,0.6)">⚔️ TEBASAN SUPER ×2.0</span>
              </div>
              <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
                <button class="icon-btn small" id="btn-tts" title="Baca Soal" style="width:28px;height:28px;font-size:.8rem">🔊</button>
                <!-- TOMBOL SKILL DI HEADER SOAL (OPSI 3 - TIDAK MENUTUPI JAWABAN) -->
                <button class="skill-fab" id="skill-fab" data-testid="skill-fab" type="button" onclick="Screens.battle.openSkillBubblePopup()" title="Pilih & Gunakan Skill Petarung" style="${s.mode === 'FUN' ? 'display:none !important;' : ''}">
                  <span style="font-size:0.85rem">⚡</span>
                  <span>Skill</span>
                  <span id="skill-fab-energy" class="skill-fab-badge">${(typeof s.energy === 'object' && s.energy !== null) ? (s.energy.value ?? 2) : (s.energy ?? 2)}</span>
                  <span class="skill-fab-dot" id="skill-fab-dot" style="display:none"></span>
                </button>
              </div>
            </div>
            <p class="qtext" id="q-text" style="font-size:1.05rem;line-height:1.35;margin:0">${esc(s.currentQuestion ? s.currentQuestion.text : '...')}</p>
            <div id="q-image-slot"></div>
          </div>

          ${layout === 'bottom_sheet' ? `
          <!-- TOMBOL BUKA LEMBAR JAWABAN (BOTTOM SHEET) -->
          <button type="button" class="btn primary btn-open-answersheet" id="btn-open-answersheet" data-testid="btn-open-answersheet" style="width:100%;padding:13px;font-size:1.02rem;font-weight:800;border-radius:14px;margin-top:6px;display:flex;align-items:center;justify-content:center;gap:8px">
            <span style="font-size:1.15rem">✍️</span>
            <span>JAWAB PERTANYAAN</span>
            <span class="chip" id="sheet-opt-count-chip" style="background:rgba(255,255,255,0.2);color:#fff;font-size:0.75rem;padding:2px 8px;border-radius:99px">Buka Opsi</span>
          </button>
          ` : `
          <!-- OPTIONS -->
          <div class="options" id="options-slot" style="margin-top:6px;margin-bottom:6px;flex:0 0 auto"></div>

          <!-- FEEDBACK & NEXT -->
          <div id="fb-slot" style="flex:0 0 auto"></div>
          `}
        </div>

        ${layout === 'bottom_sheet' ? `
        <!-- BOTTOM SHEET DRAWER & BACKDROP -->
        <div class="answer-sheet-backdrop" id="answer-sheet-backdrop"></div>
        <div class="answer-sheet-drawer" id="answer-sheet-drawer" data-testid="answer-sheet-drawer">
          <div class="drawer-handle" id="drawer-handle"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-weight:800;font-size:0.95rem;color:#fff">📝 Lembar Jawaban</span>
              <span class="chip info small" id="sheet-q-type-badge" style="font-size:0.7rem;padding:2px 6px">PILIHAN GANDA</span>
            </div>
            <button type="button" class="btn ghost small" id="btn-close-answersheet" data-testid="btn-close-answersheet" style="padding:4px 8px;font-size:0.8rem;color:var(--c-muted)">✕ Tutup / Baca Soal</button>
          </div>
          <p id="drawer-q-excerpt" style="font-size:0.85rem;color:var(--c-muted);margin:0 0 10px 0;line-height:1.3;max-height:44px;overflow:hidden;text-overflow:ellipsis"></p>
          <div class="options" id="options-slot" style="margin-top:6px;margin-bottom:6px"></div>
          <div id="fb-slot"></div>
        </div>
        ` : ''}

        ${!Screens.battle._introShown?.[s.id] ? `
        <div class="boss-intro-overlay" id="boss-intro" data-testid="boss-intro" onclick="Screens.battle.dismissIntro()">
          <div class="boss-intro-card" onclick="event.stopPropagation()">
            <div style="margin:0 auto 10px auto;width:96px;height:96px">${Monsters.renderMonster(monsterObj, { size: 96, tier })}</div>
            <div style="display:flex;justify-content:center;margin-bottom:6px">
              <span class="chip tier-badge tier-${tier}" style="background:${tierInfo.color};color:#fff;font-size:0.8rem;font-weight:800;padding:3px 10px;border-radius:12px">
                ${tierInfo.icon} ${tierInfo.label}
              </span>
            </div>
            <h2 style="color:#fff;margin:0 0 6px 0;font-size:1.3rem;font-weight:800">${esc(monsterObj.name)}</h2>
            <p style="color:var(--c-muted);margin:0 0 14px 0;font-size:0.88rem">
              Kalahkan dengan maks. <strong style="color:${tierInfo.color}">${hitsNeeded}</strong> jawaban benar!
            </p>
            <button class="btn primary small" id="btn-intro-dismiss" onclick="Screens.battle.dismissIntro()" style="width:100%;font-weight:700">
              Mulai Bertarung ⚔️
            </button>
          </div>
        </div>
        ` : ''}
      </section>
    `;

    if (!Screens.battle._introShown?.[s.id]) {
      Screens.battle._introShown = Screens.battle._introShown || {};
      Screens.battle._introShown[s.id] = true;
      if (this._introTimer) clearTimeout(this._introTimer);
      this._introTimer = setTimeout(() => {
        this.dismissIntro();
      }, 2200);
    }

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
    if (toggleBtn) toggleBtn.onclick = () => this.openSkillBubblePopup();
    const fabBtn = $('#skill-fab');
    if (fabBtn) fabBtn.onclick = () => this.openSkillBubblePopup();

    const btnOpenSheet = $('#btn-open-answersheet');
    const sheetDrawer = $('#answer-sheet-drawer');
    const sheetBackdrop = $('#answer-sheet-backdrop');
    const btnCloseSheet = $('#btn-close-answersheet');

    if (btnOpenSheet && sheetDrawer && sheetBackdrop) {
      btnOpenSheet.onclick = () => {
        sheetDrawer.classList.add('open');
        sheetBackdrop.classList.add('open');
      };
    }
    if (btnCloseSheet && sheetDrawer && sheetBackdrop) {
      btnCloseSheet.onclick = () => {
        sheetDrawer.classList.remove('open');
        sheetBackdrop.classList.remove('open');
      };
    }
    if (sheetBackdrop && sheetDrawer) {
      sheetBackdrop.onclick = () => {
        sheetDrawer.classList.remove('open');
        sheetBackdrop.classList.remove('open');
      };
    }

    $$('.battle-buff-chip', app).forEach(chip => {
      chip.onclick = () => {
        if (window.toast) toast(`✨ [Pasif Skin] ${chip.getAttribute('title') || chip.textContent}`);
      };
    });

    if (s.pendingEvent) {
      this.showEventModal(s.pendingEvent);
    } else {
      this.renderCurrentQuestion();
    }
  },

  async renderCurrentQuestion() {
    const s = this.session;
    const q = s.currentQuestion;
    if (!q) return;

    const battleRoot = document.querySelector('[data-testid="battle-root"]') || document.querySelector('.screen.active');
    if (battleRoot) {
      battleRoot.classList.remove('answer-blink-correct', 'answer-blink-wrong', 'short-active', 'mobile-keyboard-active');
    }

    if (this._vvCleanup) {
      try { this._vvCleanup(); } catch (e) {}
      this._vvCleanup = null;
    }

    this.isAnswering = false;
    this.closeSkillBubblePopup();

    const layout = Settings.get().battleLayout || 'classic';
    const sheetDrawer = $('#answer-sheet-drawer');
    const sheetBackdrop = $('#answer-sheet-backdrop');
    if (sheetDrawer && sheetBackdrop) {
      sheetDrawer.classList.remove('open');
      sheetBackdrop.classList.remove('open');
      const drawerExcerpt = $('#drawer-q-excerpt');
      if (drawerExcerpt && q) drawerExcerpt.textContent = q.text || '';
    }

    $('#q-counter').textContent = `Soal ${s.currentIndex + 1}/${s.totalQuestions}`;
    $('#q-text').textContent = q.text;
    $('#fb-slot').innerHTML = '';

    // Boss telegraph banner & time modifier
    const tg = (q && q.bossFx && q.bossFx.telegraph) || (s && s.bossFx && s.bossFx.telegraph);
    const tgEl = $('#boss-telegraph');
    if (tgEl) {
      if (tg && window.BossSkills) {
        const desc = BossSkills.describeEvent(tg);
        const tgTxt = $('#boss-telegraph-text');
        if (tgTxt) tgTxt.textContent = desc.text;
        tgEl.style.display = 'flex';
      } else {
        tgEl.style.display = 'none';
      }
    }
    if (q && q.bossFx && q.bossFx.timeMult && q.bossFx.timeMult < 1) {
      const pct = Math.round((1 - q.bossFx.timeMult) * 100);
      toast(`⏳ Waktu soal ini berkurang −${pct}%!`);
    }

    const qType = q.type || q.questionType || 'MCQ';
    const typeBadge = $('#q-type-badge');
    const typeLabels = {
      'MCQ': 'PILIHAN GANDA',
      'TRUE_FALSE': 'BENAR / SALAH',
      'ORDERING': 'URUTKAN KARTU',
      'MATCHING': 'PASANGKAN KATA',
      'SHORT': 'ISIAN SINGKAT'
    };
    if (typeBadge) {
      typeBadge.textContent = typeLabels[qType] || qType;
    }

    const sheetType = $('#sheet-q-type-badge');
    if (sheetType) {
      sheetType.textContent = typeLabels[qType] || qType;
    }
    const sheetCountChip = $('#sheet-opt-count-chip');
    if (sheetCountChip) {
      if (qType === 'MCQ') sheetCountChip.textContent = '4 Pilihan';
      else if (qType === 'TRUE_FALSE') sheetCountChip.textContent = '2 Pilihan';
      else if (qType === 'ORDERING') sheetCountChip.textContent = 'Urutkan';
      else if (qType === 'MATCHING') sheetCountChip.textContent = 'Pasangkan';
      else if (qType === 'SHORT') sheetCountChip.textContent = 'Isian Singkat';
    }

    const reviewBadge = $('#review-badge');
    if (reviewBadge) {
      reviewBadge.style.display = q.isReview ? 'inline-flex' : 'none';
    }
    const weakBadge = $('#weak-badge');
    if (weakBadge) {
      weakBadge.style.display = q.isWeak ? 'inline-flex' : 'none';
    }
    const bonusBadge = $('#bonus-badge');
    if (bonusBadge) {
      bonusBadge.style.display = q.isBonus ? 'inline-flex' : 'none';
    }
    const mysteryBadge = $('#mystery-badge');
    if (mysteryBadge) {
      mysteryBadge.style.display = q.isMystery ? 'inline-flex' : 'none';
    }
    this.updateActiveSkillBadges();

    // Image slot
    $('#q-image-slot').innerHTML = q.imageUrl
      ? `<img class="qimage" src="${esc(q.imageUrl)}" alt="${esc(q.imageAlt || 'Soal')}" style="max-height:140px;margin-top:8px;border-radius:10px" loading="lazy">`
      : '';

    // Render multi-type options
    const optBox = $('#options-slot');
    optBox.innerHTML = '';
    optBox.classList.remove('options-grid-2x2');

    if (qType === 'MCQ') {
      const letters = ['A', 'B', 'C', 'D'];
      const opts = Array.isArray(q.options) ? q.options : [];

      // Smart Grid 2x2 pada mode compact jika opsi ringkas
      if (layout === 'compact' && opts.length === 4 && opts.every(t => typeof t === 'string' && t.trim().length <= 26)) {
        optBox.classList.add('options-grid-2x2');
      } else {
        optBox.classList.remove('options-grid-2x2');
      }

      optBox.innerHTML = opts.map((optText, idx) => `
        <button class="btn opt choice-btn" data-idx="${idx}" data-testid="answer-${idx}">
          <span class="key">${letters[idx] || (idx + 1)}</span>
          <span>${esc(optText)}</span>
        </button>
      `).join('');

      $$('.opt', optBox).forEach(btn => {
        btn.onclick = () => this.handleOptionClick(parseInt(btn.dataset.idx, 10), btn);
      });

      // Check eliminated options
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
    } else if (qType === 'TRUE_FALSE') {
      optBox.innerHTML = `
        <div style="display:flex;gap:12px;width:100%">
          <button class="btn opt choice-btn tf-btn" id="tf-true" data-idx="0" data-testid="tf-true" style="flex:1;padding:16px;font-size:1.15rem;font-weight:700;background:rgba(34,197,94,0.15);border:2px solid rgba(34,197,94,0.4);border-radius:14px;color:#22c55e">
            <span>✅ BENAR</span>
          </button>
          <button class="btn opt choice-btn tf-btn" id="tf-false" data-idx="1" data-testid="tf-false" style="flex:1;padding:16px;font-size:1.15rem;font-weight:700;background:rgba(239,68,68,0.15);border:2px solid rgba(239,68,68,0.4);border-radius:14px;color:#ef4444">
            <span>❌ SALAH</span>
          </button>
        </div>
      `;
      $$('.tf-btn', optBox).forEach(btn => {
        btn.onclick = () => this.handleOptionClick(parseInt(btn.dataset.idx, 10), btn);
      });
    } else if (qType === 'ORDERING') {
      const items = (q.typeData && Array.isArray(q.typeData.items)) ? q.typeData.items : (Array.isArray(q.options) ? q.options : []);
      let selectedOrder = [];

      optBox.innerHTML = `
        <div class="ordering-container" style="display:flex;flex-direction:column;gap:8px;width:100%">
          <div class="ordering-cards" style="display:flex;flex-direction:column;gap:6px">
            ${items.map((itemText, idx) => `
              <button type="button" class="order-card" id="order-card-${idx}" data-idx="${idx}" data-testid="order-card-${idx}">
                <span class="order-badge" id="order-badge-${idx}"></span>
                <span class="order-text" style="flex:1;font-size:0.95rem;text-align:left">${esc(itemText)}</span>
              </button>
            `).join('')}
          </div>
          <div style="display:flex;gap:8px;margin-top:4px;width:100%">
            <button type="button" class="btn secondary" id="order-reset" data-testid="order-reset" style="flex:1;padding:10px;border-radius:12px">
              🔄 Reset
            </button>
            <button type="button" class="btn primary" id="order-submit" data-testid="order-submit" disabled style="flex:2;padding:10px;border-radius:12px;font-weight:700">
              Kirim Urutan
            </button>
          </div>
        </div>
      `;

      const updateBadges = () => {
        items.forEach((_, idx) => {
          const card = $(`#order-card-${idx}`);
          const badge = $(`#order-badge-${idx}`);
          const pos = selectedOrder.indexOf(idx);
          if (pos !== -1) {
            badge.textContent = pos + 1;
            card.classList.add('selected');
          } else {
            badge.textContent = '';
            card.classList.remove('selected');
          }
        });
        const submitBtn = $('#order-submit');
        if (submitBtn) submitBtn.disabled = (selectedOrder.length < items.length);
      };

      $$('.order-card', optBox).forEach(card => {
        card.onclick = () => {
          if (this.isAnswering) return;
          const idx = parseInt(card.dataset.idx, 10);
          const pos = selectedOrder.indexOf(idx);
          if (pos === -1) {
            selectedOrder.push(idx);
          } else if (pos === selectedOrder.length - 1) {
            selectedOrder.pop();
          }
          updateBadges();
        };
      });

      const resetBtn = $('#order-reset');
      if (resetBtn) {
        resetBtn.onclick = () => {
          if (this.isAnswering) return;
          selectedOrder = [];
          updateBadges();
        };
      }

      const submitBtn = $('#order-submit');
      if (submitBtn) {
        submitBtn.onclick = () => {
          if (selectedOrder.length === items.length && !this.isAnswering) {
            this.handleOptionClick(selectedOrder, submitBtn);
          }
        };
      }
    } else if (qType === 'MATCHING') {
      const leftItems = (q.typeData && Array.isArray(q.typeData.leftItems)) ? q.typeData.leftItems : [];
      const rightItems = (q.typeData && Array.isArray(q.typeData.rightItems)) ? q.typeData.rightItems : [];
      let pairs = {};
      let activeLeft = null;
      const colors = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];

      optBox.innerHTML = `
        <div class="matching-container" style="display:flex;flex-direction:column;gap:8px;width:100%">
          <div class="match-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <div style="display:flex;flex-direction:column;gap:6px">
              ${leftItems.map((txt, idx) => `
                <button type="button" class="match-card match-left" id="match-left-${idx}" data-idx="${idx}" data-testid="match-left-${idx}">
                  ${esc(txt)}
                </button>
              `).join('')}
            </div>
            <div style="display:flex;flex-direction:column;gap:6px">
              ${rightItems.map((txt, idx) => `
                <button type="button" class="match-card match-right" id="match-right-${idx}" data-idx="${idx}" data-testid="match-right-${idx}">
                  ${esc(txt)}
                </button>
              `).join('')}
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:4px;width:100%">
            <button type="button" class="btn secondary" id="match-reset" data-testid="match-reset" style="flex:1;padding:10px;border-radius:12px">
              🔄 Reset
            </button>
            <button type="button" class="btn primary" id="match-submit" data-testid="match-submit" disabled style="flex:2;padding:10px;border-radius:12px;font-weight:700">
              Kirim Pasangan
            </button>
          </div>
        </div>
      `;

      const updateMatchUI = () => {
        leftItems.forEach((_, idx) => {
          const el = $(`#match-left-${idx}`);
          el.className = 'match-card match-left';
          el.style.borderColor = '';
          el.style.background = '';
          if (idx === activeLeft) {
            el.classList.add('active-left');
          } else if (pairs[idx] !== undefined) {
            el.classList.add('paired');
            const color = colors[idx % colors.length];
            el.style.borderColor = color;
            el.style.background = color + '22';
          }
        });
        rightItems.forEach((_, rIdx) => {
          const el = $(`#match-right-${rIdx}`);
          el.className = 'match-card match-right';
          el.style.borderColor = '';
          el.style.background = '';
          const pairedLeft = Object.keys(pairs).find(l => pairs[l] === rIdx);
          if (pairedLeft !== undefined) {
            el.classList.add('paired');
            const color = colors[parseInt(pairedLeft, 10) % colors.length];
            el.style.borderColor = color;
            el.style.background = color + '22';
          }
        });
        const submitBtn = $('#match-submit');
        if (submitBtn) {
          submitBtn.disabled = (Object.keys(pairs).length < leftItems.length);
        }
      };

      $$('.match-left', optBox).forEach(el => {
        el.onclick = () => {
          if (this.isAnswering) return;
          const idx = parseInt(el.dataset.idx, 10);
          activeLeft = (activeLeft === idx) ? null : idx;
          updateMatchUI();
        };
      });

      $$('.match-right', optBox).forEach(el => {
        el.onclick = () => {
          if (this.isAnswering) return;
          const rIdx = parseInt(el.dataset.idx, 10);
          if (activeLeft !== null) {
            for (const l in pairs) {
              if (pairs[l] === rIdx) delete pairs[l];
            }
            pairs[activeLeft] = rIdx;
            activeLeft = null;
            updateMatchUI();
          }
        };
      });

      const resetBtn = $('#match-reset');
      if (resetBtn) {
        resetBtn.onclick = () => {
          if (this.isAnswering) return;
          pairs = {};
          activeLeft = null;
          updateMatchUI();
        };
      }

      const submitBtn = $('#match-submit');
      if (submitBtn) {
        submitBtn.onclick = () => {
          if (Object.keys(pairs).length === leftItems.length && !this.isAnswering) {
            const payload = leftItems.map((_, i) => pairs[i]);
            this.handleOptionClick(payload, submitBtn);
          }
        };
      }
    } else if (qType === 'SHORT') {
      const isNum = Boolean(q.typeData && (q.typeData.isNumeric || q.typeData.numeric));
      const placeholder = (q.typeData && q.typeData.placeholder) || (isNum ? 'Ketik angka jawaban...' : 'Ketik jawabanmu...');
      const inputMode = (q.typeData && q.typeData.inputMode) || (isNum ? 'numeric' : 'text');

      optBox.innerHTML = `
        <div class="short-container" style="display:flex;flex-direction:column;gap:8px;width:100%">
          <div style="display:flex;gap:8px;width:100%">
            <input type="${isNum ? 'tel' : 'text'}"
                   inputmode="${inputMode}"
                   id="short-input"
                   data-testid="short-input"
                   class="input short-input"
                   placeholder="${esc(placeholder)}"
                   autocomplete="off"
                   style="flex:1;padding:12px 14px;font-size:1.05rem;border-radius:12px;border:2px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.3);color:#fff" />
            <button type="button" class="btn primary" id="short-submit" data-testid="short-submit" disabled style="padding:12px 20px;font-weight:700;border-radius:12px">
              Kirim
            </button>
          </div>
          <div id="short-reveal-slot"></div>
        </div>
      `;

      const input = $('#short-input');
      const submitBtn = $('#short-submit');

      input.oninput = () => {
        submitBtn.disabled = !input.value.trim();
      };
      input.onkeydown = (e) => {
        if (e.key === 'Enter' && !submitBtn.disabled && !this.isAnswering) {
          submitBtn.click();
        }
      };
      submitBtn.onclick = () => {
        if (!submitBtn.disabled && !this.isAnswering) {
          this.handleOptionClick(input.value.trim(), submitBtn);
        }
      };

      // Dukungan tampilan mobile/keyboard Android agar soal tetap terlihat saat mengetik
      const battleRoot = document.querySelector('[data-testid="battle-root"]') || document.querySelector('.screen.active');

      const handleFocus = () => {
        if (battleRoot) battleRoot.classList.add('short-active');
        setTimeout(() => {
          const qCard = document.querySelector('.qcard');
          if (qCard) {
            qCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 80);
      };

      const handleBlur = () => {
        setTimeout(() => {
          if (document.activeElement !== input && battleRoot) {
            battleRoot.classList.remove('short-active', 'mobile-keyboard-active');
          }
        }, 150);
      };

      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);

      // Support visualViewport to keep question & input visible on mobile virtual keyboard
      if (window.visualViewport) {
        const handleVvResize = () => {
          if (document.activeElement === input && battleRoot) {
            const isKb = window.visualViewport.height < (window.innerHeight * 0.85);
            if (isKb) {
              battleRoot.classList.add('mobile-keyboard-active');
            } else {
              battleRoot.classList.remove('mobile-keyboard-active');
            }
            setTimeout(() => {
              const qCard = document.querySelector('.qcard');
              if (qCard) {
                qCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 80);
          }
        };
        window.visualViewport.addEventListener('resize', handleVvResize);
        this._vvCleanup = () => {
          try {
            window.visualViewport.removeEventListener('resize', handleVvResize);
            input.removeEventListener('focus', handleFocus);
            input.removeEventListener('blur', handleBlur);
            if (battleRoot) battleRoot.classList.remove('short-active', 'mobile-keyboard-active');
          } catch (e) {}
        };
      } else {
        this._vvCleanup = () => {
          try {
            input.removeEventListener('focus', handleFocus);
            input.removeEventListener('blur', handleBlur);
            if (battleRoot) battleRoot.classList.remove('short-active', 'mobile-keyboard-active');
          } catch (e) {}
        };
      }
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
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    this.isAnswering = true;
    this.stopTimer();
    if (window.Sfx) Sfx.play('tap');

    // Disable all options / submit buttons / inputs
    $$('#options-slot button, #options-slot input').forEach(b => b.disabled = true);

    try {
      const result = await API.answerQuestion(this.session.id, this.session.currentIndex, chosenIndex);
      this.applyAnswerResult(result, chosenIndex, btnEl);
    } catch (e) {
      if (e.message && (e.message.includes('ALREADY_ANSWERED') || e.code === 'ALREADY_ANSWERED')) {
        toast('Soal telah terjawab sebelumnya. Memperbarui status...');
        try {
          const syncRes = await API.req('/api/game/' + this.session.id);
          if (syncRes && syncRes.session) {
            this.session = syncRes.session;
            if (this.session.status === 'IN_PROGRESS') {
              this.renderCurrentQuestion();
              return;
            } else {
              go('home');
              return;
            }
          }
        } catch (syncErr) {
          console.warn('Sync session error:', syncErr);
        }
      }
      toast('Gagal mengirim jawaban: ' + e.message);
      this.isAnswering = false;
      $$('#options-slot button, #options-slot input').forEach(b => {
        if (!b.classList.contains('eliminated')) b.disabled = false;
      });
    }
  },

  async handleTimeout() {
    if (this.isAnswering) return;
    this.isAnswering = true;
    $$('#options-slot button, #options-slot input').forEach(b => b.disabled = true);

    try {
      const result = await API.answerQuestion(this.session.id, this.session.currentIndex, null);
      this.applyAnswerResult(result, null, null);
    } catch (e) {
      console.warn('Timeout submit error:', e);
    }
  },

  applyAnswerResult(res, chosenIndex, chosenBtn) {
    this.closeSkillBubblePopup();
    const tgEl = $('#boss-telegraph');
    if (tgEl) tgEl.style.display = 'none';
    if (res.bossFx && Array.isArray(res.bossFx.events) && res.bossFx.events.length > 0) {
      this.showBossFxEvents(res.bossFx.events);
    }
    const s = res.session;
    this.session = s;
    if (res.player) Player.data = res.player;

    // Efek visual border berkedip hijau/merah dinonaktifkan sesuai permintaan pengguna
    const battleRoot = document.querySelector('[data-testid="battle-root"]') || document.querySelector('.screen.active');
    if (battleRoot) {
      battleRoot.classList.remove('answer-blink-correct', 'answer-blink-wrong', 'short-active', 'mobile-keyboard-active');
    }

    if (res.alreadyAnswered) {
      toast('Soal telah terjawab sebelumnya. Melanjutkan...');
      const isOver = s.status === 'WON' || s.status === 'LOST';
      if (!isOver) {
        setTimeout(() => {
          this.renderCurrentQuestion();
        }, 600);
        return;
      }
    }

    const outcome = res.outcome; // CRITICAL, NORMAL, SLOW, WRONG, TIMEOUT
    const correctIdx = (res.reveal && res.reveal.correctDisplayIndex !== undefined)
      ? res.reveal.correctDisplayIndex
      : res.correctDisplayIndex;

    const qType = (res.qType || (s.currentQuestion && (s.currentQuestion.type || s.currentQuestion.questionType))) || 'MCQ';

    if (qType === 'MCQ') {
      $$('#options-slot .opt').forEach((b, idx) => {
        if (idx === correctIdx) b.classList.add('correct');
        else if (idx === chosenIndex) b.classList.add('wrong');
      });
    } else if (qType === 'TRUE_FALSE') {
      const tfTrue = $('#tf-true');
      const tfFalse = $('#tf-false');
      if (tfTrue && tfFalse) {
        if (correctIdx === 0) tfTrue.classList.add('correct');
        else tfFalse.classList.add('correct');
        if (chosenIndex !== null && chosenIndex !== correctIdx) {
          if (chosenIndex === 0) tfTrue.classList.add('wrong');
          else if (chosenIndex === 1) tfFalse.classList.add('wrong');
        }
      }
    } else if (qType === 'ORDERING') {
      if (res.reveal && Array.isArray(res.reveal.correctOrder)) {
        res.reveal.correctOrder.forEach((cardIdx, pos) => {
          const card = $(`#order-card-${cardIdx}`);
          const badge = $(`#order-badge-${cardIdx}`);
          if (card && badge) {
            badge.textContent = `✓ ${pos + 1}`;
            badge.className = 'order-badge correct';
            if (res.isCorrect) card.classList.add('correct');
            else card.classList.add('revealed');
          }
        });
      }
    } else if (qType === 'MATCHING') {
      if (res.reveal && Array.isArray(res.reveal.correctPairs)) {
        res.reveal.correctPairs.forEach((rIdx, lIdx) => {
          const leftEl = $(`#match-left-${lIdx}`);
          const rightEl = $(`#match-right-${rIdx}`);
          if (leftEl) leftEl.classList.add(res.isCorrect ? 'correct' : 'revealed');
          if (rightEl) rightEl.classList.add(res.isCorrect ? 'correct' : 'revealed');
        });
      }
    } else if (qType === 'SHORT') {
      const inp = $('#short-input');
      if (inp) {
        if (res.isCorrect) {
          inp.style.borderColor = 'var(--c-good, #22c55e)';
          inp.style.background = 'rgba(34,197,94,0.15)';
        } else {
          inp.style.borderColor = 'var(--c-bad, #ef4444)';
          inp.style.background = 'rgba(239,68,68,0.15)';
        }
      }
      if (res.reveal && res.reveal.correctText && !res.isCorrect) {
        const revSlot = $('#short-reveal-slot');
        if (revSlot) {
          revSlot.innerHTML = `<div style="font-size:0.9rem;font-weight:600;color:var(--c-good,#22c55e);margin-top:4px">Kunci: ${esc(res.reveal.correctText)}</div>`;
        }
      }
    }

    // Floater & SFX (T-23, T-24, T-25)
    const dmg = res.damageToBoss ?? res.bossDamage ?? 0;
    const isCriticalHit = outcome === 'CRITICAL' || Boolean(res.isCrit);
    const skillEff = res.skillEffects || {};
    const isPowerStrike = Boolean(skillEff.powerStrike?.active || (this.activeBossSkill && this.activeBossSkill.id === 'power_strike'));
    const isRedPotion = Boolean(skillEff.redPotion?.active || (this.activeBossSkill && this.activeBossSkill.id === 'red_potion'));

    // 1. Efek Serangan Utama ke Boss (Immediate, Priority #1)
    if (res.isCorrect) {
      if (isPowerStrike) {
        this.animateSwordSlash();
        this.animateBossShake(true);
        this.showDamageFloater(`⚔️ TEBASAN SUPER! -${dmg}`, 'power_strike');
        if (window.Feedback) Feedback.sfx('critical');
        else if (window.Sfx) Sfx.play('correct');
      } else if (isRedPotion) {
        this.animateSwordSlash();
        this.animateBossShake(true);
        this.showDamageFloater(`🍷 RAMUAN MERAH! -${dmg}`, 'red_potion');
        if (window.Feedback) Feedback.sfx('critical');
        else if (window.Sfx) Sfx.play('correct');
      } else if (res.weakHit) {
        this.animateBossShake();
        this.showDamageFloater(`🎯 TITIK LEMAH! -${dmg}`, 'crit');
        if (window.Feedback) Feedback.sfx('critical');
        else if (window.Sfx) Sfx.play('correct');
      } else if (isCriticalHit) {
        this.animateBossShake();
        this.showDamageFloater(`⚡ KRITIKAL! -${dmg}`, 'crit');
        if (window.Feedback) Feedback.sfx('critical');
        else if (window.Sfx) Sfx.play('correct');
      } else if (outcome === 'NORMAL') {
        this.animateBossShake();
        this.showDamageFloater(`🎯 TEPAT! -${dmg}`, 'dmg');
        if (window.Feedback) Feedback.sfx('correct');
        else if (window.Sfx) Sfx.play('correct');
      } else if (outcome === 'SLOW') {
        this.animateBossShake();
        this.showDamageFloater(`🐢 LAMBAT! -${dmg}`, 'dmg');
        if (window.Feedback) Feedback.sfx('correct');
        else if (window.Sfx) Sfx.play('correct');
      }
    } else if (outcome === 'WRONG') {
      if (res.dodged) {
        this.showDamageFloater('💨 HINDARAN! 0 DMG', 'heal');
        toast('Refleks hebat! Kamu berhasil menghindari serangan! 💨');
      } else {
        const failTxt = isPowerStrike ? `❌ TEBASAN GAGAL! -${res.damageToPlayer ?? res.playerDamage}` : `❌ SALAH! -${res.damageToPlayer ?? res.playerDamage}`;
        this.showDamageFloater(failTxt, 'miss');
        if (window.Feedback) Feedback.sfx('wrong');
        else if (window.Sfx) Sfx.play('wrong');
      }
    } else if (outcome === 'TIMEOUT') {
      if (res.dodged) {
        this.showDamageFloater('💨 HINDARAN! 0 DMG', 'heal');
        toast('HINDARAN! 💨 Serangan monster luput!');
      } else {
        this.showDamageFloater(`⏰ HABIS! -${res.damageToPlayer ?? res.playerDamage}`, 'miss');
        if (window.Feedback) Feedback.sfx('wrong');
        else if (window.Sfx) Sfx.play('wrong');
      }
    } else if (outcome === 'TIMEOUT_AWAY') {
      this.showDamageFloater(`⏳ PERGI LAMA!`, 'miss');
      if (window.Feedback) Feedback.sfx('wrong');
      else if (window.Sfx) Sfx.play('wrong');
    }

    // Reset status skill serang aktif bila tidak ada sisa lanjutan
    if (!res.flags?.redPotionRemaining) {
      this.activeBossSkill = null;
    }
    this.updateActiveSkillBadges();

    // 2. Notifikasi Aliran Pertempuran Berurutan (Smooth Choreographed Stream)
    let nextNotifDelay = 420;

    const coinDrop = res.drops && typeof res.drops.coins === 'number' ? res.drops.coins : 0;
    if (coinDrop > 0) {
      this.showDamageFloater(`+${coinDrop} 🪙`, 'crit', nextNotifDelay);
      nextNotifDelay += 380;
    } else if (res.isMystery && res.mysteryReward === 'COINS_8') {
      this.showDamageFloater(`+8 🪙`, 'crit', nextNotifDelay);
      nextNotifDelay += 380;
    }

    if (res.isMystery && res.mysteryReward && res.mysteryReward !== 'COINS_8') {
      if (res.mysteryReward === 'HEAL_15') {
        this.showDamageFloater(`+15 HP 💖`, 'heal', nextNotifDelay);
      } else if (res.mysteryReward === 'ENERGY_1') {
        this.showDamageFloater(`+1 Energi ⚡`, 'heal', nextNotifDelay);
      } else if (res.mysteryReward === 'DAMAGE_1_5') {
        this.showDamageFloater(`1.5× Damage 💥`, 'crit', nextNotifDelay);
      } else {
        this.showDamageFloater(`🎁 ${res.mysteryReward}`, 'crit', nextNotifDelay);
      }
      nextNotifDelay += 380;
    }

    // Update in-battle shield chip from answer response
    if (res.shield !== undefined) {
      const sc = $('#active-shield-chip');
      if (sc) {
        sc.style.display = res.shield > 0 ? 'inline-flex' : 'none';
        const sv = $('#shield-val');
        if (sv) sv.textContent = res.shield;
      }
    }

    // Trigger Passive Skill Animations & Buff Pulse from Equipped Skin
    const trig = Array.isArray(res.triggeredPassives) ? [...res.triggeredPassives] : [];
    if (trig.length === 0) {
      if (res.isCrit) trig.push({ id: 'crit', name: 'Critical Hit!', icon: '⚡', desc: 'Serangan Kritis x1.5 Kena!' });
      if (res.dodged) trig.push({ id: 'dodge', name: 'Hindaran Refleks!', icon: '💨', desc: 'Serangan Boss Luput (0 DMG)!' });
      if (res.notice && res.notice.includes('Semburan Naga')) trig.push({ id: 'dragon', name: 'Semburan Naga!', icon: '🔥', desc: 'Semburan Api Naga!' });
      if (res.notice && res.notice.includes('Curi Energi')) trig.push({ id: 'comboEnergy', name: 'Curi Energi!', icon: '🦊', desc: '+1 Energi!' });
      if (res.notice && res.notice.includes('Proteksi Combo')) trig.push({ id: 'streakProtect', name: 'Proteksi Combo!', icon: '🦉', desc: 'Combo Terselamatkan!' });
      if (res.notice && res.notice.includes('Darah Terakhir')) trig.push({ id: 'lastStand', name: 'Darah Terakhir!', icon: '🩸', desc: 'Bertahan Hidup dengan 1 HP!' });
    }
    if (trig.length > 0) {
      this.showPassiveTrigger(trig, nextNotifDelay);
    }

    // Boss Enrage Banner & Phase 2 Transition (C.1 / T-23)
    if (res.phaseChanged) {
      const monsterName = (s.monster?.name || s.boss?.name || monsterObj.name) || 'Bos';
      this.showEnragedBanner(monsterName);
    } else if (res.boss?.phase === 2 || s.boss_phase === 2 || s.bossPhase === 2) {
      $('#boss-svg-slot')?.classList.add('boss-enraged');
    }

    // Story Dialog & Pet Reactions dinonaktifkan agar tidak menghalangi arena soal

    // Combo Milestone SFX
    const comboEl = $('#combo-meter');
    const comboN = $('#combo-n');
    if (comboEl && comboN) {
      comboN.textContent = res.streak;
      if ((res.streak === 3 || res.streak === 5 || res.streak === 10) && window.Feedback) {
        Feedback.sfx('combo');
      }
    }

    // Update HP bars with coalescing to prevent undefined/NaN
    const curBossHp = res.bossHp ?? res.boss?.hp ?? s.bossHp ?? s.boss?.hp ?? 0;
    const curBossMax = s.bossMaxHp ?? s.boss?.maxHp ?? 100;
    $('#boss-hp-bar').style.width = `${(curBossHp / curBossMax) * 100}%`;
    $('#boss-hp-text').textContent = `${curBossHp} / ${curBossMax}`;

    const curHitsLeft = res.boss?.hitsLeft ?? Math.ceil(curBossHp / 20);
    const hitsLeftValEl = $('#boss-hits-left-val');
    if (hitsLeftValEl) hitsLeftValEl.textContent = curHitsLeft;

    if (res.fatigue?.applied || res.fatigueApplied || s.fatigue_applied) {
      const fb = $('#boss-fatigue-banner');
      if (fb) fb.style.display = 'inline-flex';
    }

    const isPity = !!(res.pity || res.session?.pity || (res.session?.wrongStreak >= 3) || (res.session?.wrong_streak >= 3));
    const pb = $('#pity-badge');
    if (pb) pb.style.display = isPity ? 'inline-flex' : 'none';

    if (res.refill?.added > 0) {
      $('#q-counter').textContent = `Soal ${s.currentIndex + 1}/${s.totalQuestions}`;
      if (window.toast) toast(`🔥 Soal ditambah +${res.refill.added} untuk menuntaskan bos!`);
    }

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
    this.updateEnergyGauge(res.energy || s.energy);
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
      const fab = $('#skill-fab');
      if (fab) fab.style.display = 'none';
      this.stopHeartbeat();
    }

    const fbTitle = isCriticalHit ? 'Luar biasa! Serangan Kritikal!'
      : outcome === 'NORMAL' ? 'Bagus sekali! Tepat sasaran!'
      : outcome === 'SLOW' ? 'Benar, tapi agak lambat! Terkena balasan!'
      : outcome === 'TIMEOUT' ? (res.dodged ? 'Waktu habis! Berhasil menghindar! 💨' : 'Waktu habis! Bos menyerangmu!')
      : outcome === 'TIMEOUT_AWAY' ? (res.notice || 'Kamu pergi cukup lama, soal dilewati.')
      : (res.dodged ? 'Kurang tepat! Tapi berhasil menghindar! 💨' : 'Kurang tepat! Bos menyerangmu!');

    const canAutoNext = !isOver;
    let nextTimeout = null;
    let nextInterval = null;

    const goNext = () => {
      if (nextTimeout) clearTimeout(nextTimeout);
      if (nextInterval) clearInterval(nextInterval);
      const battleRoot = document.querySelector('[data-testid="battle-root"]') || document.querySelector('.screen.active');
      if (battleRoot) {
        battleRoot.classList.remove('answer-blink-correct', 'answer-blink-wrong', 'short-active', 'mobile-keyboard-active');
      }
      if (isOver) {
        Screens.result.show(res);
      } else if (res.event) {
        this.showEventModal(res.event);
      } else {
        this.renderCurrentQuestion();
      }
    };

    $('#fb-slot').innerHTML = `
      <div class="feedback ${outcome === 'WRONG' || outcome === 'TIMEOUT' ? 'no' : 'ok'}" style="margin-top:10px;padding:12px;border-radius:14px;background:rgba(255,255,255,.08);display:flex;flex-direction:column;gap:8px;cursor:${!isOver ? 'pointer' : 'default'}" title="${!isOver ? 'Ketuk untuk langsung lanjut' : ''}">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:1.6rem">${outcome === 'WRONG' || outcome === 'TIMEOUT' ? '💔' : (outcome === 'TIMEOUT_AWAY' ? '⏳' : '⭐')}</span>
          <div class="grow" style="min-width:0;word-break:break-word;overflow-wrap:break-word">
            <strong style="color:#fff">${res.notice ? esc(res.notice) : fbTitle}</strong>
            ${res.explanation ? `<div style="font-size:.8rem;color:var(--c-muted);margin-top:2px;word-break:break-word">${esc(res.explanation)}</div>` : ''}
          </div>
          ${isOver ? `
            <button class="btn small primary" id="btn-next" data-testid="btn-next">
              Lihat Hasil 🏆
            </button>
          ` : ''}
        </div>
        ${canAutoNext ? `
          <div class="auto-next-bar" style="height:4px;background:rgba(255,255,255,0.15);border-radius:2px;overflow:hidden;cursor:pointer" title="Ketuk untuk lanjut segera">
            <div id="auto-next-fill" style="width:100%;height:100%;background:var(--c-primary,#10b981);transition:width 0.1s linear"></div>
          </div>
        ` : ''}
      </div>
    `;

    const nextBtn = $('#btn-next');
    if (nextBtn) nextBtn.onclick = goNext;
    const fbBox = $('#fb-slot .feedback');
    if (fbBox && !isOver) fbBox.onclick = goNext;
    const barEl = $('.auto-next-bar');
    if (barEl) barEl.onclick = goNext;

    
    if (isOver) {
      setTimeout(() => {
        this.showEndingModal(isWin, s, res, () => goNext());
      }, 480);
    }

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
  
  pickLine(arr, seed) {
    if (!arr || arr.length === 0) return '';
    let hash = 0;
    const str = String(seed ?? 0);
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    const idx = Math.abs(hash) % arr.length;
    return arr[idx];
  },

  showEventModal(evt) {
    if (!evt) return;
    this.stopTimer();

    const old = $('#event-modal');
    if (old) old.remove();

    if (window.Feedback) {
      Feedback.sfx('event');
    }

    const modal = document.createElement('div');
    modal.id = 'event-modal';
    modal.setAttribute('data-testid', 'event-modal');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease-out;';

    const playerCoins = (Player.data && Player.data.coins) || 0;
    let icon = '🎁';
    let title = evt.title || 'Kejutan!';
    let desc = evt.description || 'Sesuatu yang menarik terjadi di tengah perjalanan!';
    let actionsHtml = '';

    if (evt.type === 'TREASURE') {
      icon = '🎁';
      title = 'Peti Harta Karun!';
      desc = 'Kamu menemukan sebuah peti harta karun misterius yang berkilau emas!';
      actionsHtml = `
        <button class="btn primary" id="btn-event-open" data-testid="btn-event-open" style="width:100%;font-size:1.1rem;padding:12px;font-weight:700">
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
            style="width:100%;display:flex;align-items:center;justify-content:space-between;padding:10px 14px;font-size:0.95rem">
            <span>${esc(deal.title)} <span style="font-size:0.8rem;opacity:0.8;display:block">${esc(deal.desc || '')}</span></span>
            <span style="font-weight:700">${deal.price} 🪙 ${canAfford ? '' : '(Koin kurang)'}</span>
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
          <button class="btn primary" id="btn-event-open" data-testid="btn-event-open" style="width:100%;padding:12px;font-weight:700">
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

    const timerInterval = setInterval(() => {
      const elapsed = Date.now() - startMs;
      const remainingMs = Math.max(0, totalDuration - elapsed);
      const remainingPct = (remainingMs / totalDuration) * 100;
      const bar = $('#event-timer-bar');
      const txt = $('#event-timer-text');
      if (bar) bar.style.width = remainingPct + '%';
      if (txt) txt.textContent = Math.ceil(remainingMs / 1000) + 's';

      if (remainingMs <= 0 && !isResolved) {
        clearInterval(timerInterval);
        resolveChoice(evt.safeChoice || 'SKIP', true);
      }
    }, 100);

    const resolveChoice = async (choice, isTimeout = false) => {
      if (isResolved) return;
      isResolved = true;
      clearInterval(timerInterval);

      $$('#event-modal button').forEach(b => b.disabled = true);

      try {
        const res = await API.resolveEvent(this.session.id, evt.id, isTimeout ? 'TIMEOUT' : choice);
        if (res.player) {
          Player.data = Object.assign(Player.data || {}, res.player);
          const curPlayerHp = res.player.hp ?? 0;
          const curPlayerMax = res.player.maxHp ?? 100;
          if ($('#player-hp-bar')) $('#player-hp-bar').style.width = `${(curPlayerHp / curPlayerMax) * 100}%`;
          if ($('#player-hp-val')) $('#player-hp-val').textContent = curPlayerHp;
        }
        if (res.energy && $('#energy-val')) {
          $('#energy-val').textContent = res.energy.value;
        }

        const msg = (res.result && res.result.message) || (isTimeout ? 'Waktu habis! Pilihan aman diambil otomatis.' : 'Kejutan selesai!');
        toast(msg);

        if (modal) modal.remove();
        this.renderCurrentQuestion();
      } catch (err) {
        toast('Gagal menyelesaikan kejutan: ' + err.message);
        if (modal) modal.remove();
        this.renderCurrentQuestion();
      }
    };

    const btnOpen = $('#btn-event-open');
    if (btnOpen) {
      btnOpen.onclick = () => resolveChoice('OPEN');
    }

    const btnSkip = $('#btn-event-skip');
    if (btnSkip) {
      btnSkip.onclick = () => resolveChoice('SKIP');
    }

    $$('.btn-merchant-deal', modal).forEach(b => {
      b.onclick = () => {
        const dealId = b.dataset.dealId;
        if (dealId) resolveChoice(dealId);
      };
    });
  },

  
  showEndingModal(isWin, s, res, onComplete) {
    if (typeof Screens.showBattleEndingSpectacularModal === 'function') {
      Screens.showBattleEndingSpectacularModal({ isWin, session: s, res, onComplete });
    } else {
      onComplete();
    }
  },

  showEnragedBanner(bossName) {
    const old = $('#enraged-banner-wrap');
    if (old) old.remove();

    const wrap = document.createElement('div');
    wrap.id = 'enraged-banner-wrap';
    wrap.className = 'enraged-banner-wrap';
    wrap.innerHTML = `
      <div class="enraged-banner">
        🔥 ${esc(bossName)} MARAH! 🔥
        <div style="font-size:0.8rem;font-weight:600;margin-top:4px">Waktu ×0.9 & Jurus Muncul Tiap 3 Soal! (+1 ⚡ Semangat!)</div>
      </div>
    `;
    document.body.appendChild(wrap);

    const svgSlot = $('#boss-svg-slot');
    if (svgSlot) svgSlot.classList.add('boss-enraged');
    const nameLabel = $('#boss-name-label');
    if (nameLabel && !nameLabel.textContent.includes('🔥')) {
      nameLabel.textContent += ' 🔥';
    }

    if (window.Feedback) Feedback.sfx('enraged');

    setTimeout(() => { wrap.remove(); }, 1600);
  },

  showBossDialog(type) {
    // Dinonaktifkan: dialog bubble bos dihapus agar tidak menghalangi arena soal
    return;
  },

  showPetReaction(type) {
    // Dinonaktifkan: dialog bubble pet dihapus agar tidak menghalangi arena soal
    return;
  },

  animateBossShake(isHeavy = false) {
    const box = $('#boss-svg-slot');
    if (box) {
      box.classList.remove('anim-shake', 'anim-shake-heavy');
      void box.offsetWidth;
      box.classList.add(isHeavy ? 'anim-shake-heavy' : 'anim-shake');
    }
  },

  animateSwordSlash() {
    const bossCard = $('.boss-card') || $('#boss-svg-slot');
    if (!bossCard) return;
    let slash = $('#boss-slash-effect');
    if (!slash) {
      slash = document.createElement('div');
      slash.id = 'boss-slash-effect';
      slash.className = 'boss-slash-effect';
      bossCard.appendChild(slash);
    }
    slash.classList.remove('anim-slash');
    void slash.offsetWidth;
    slash.classList.add('anim-slash');

    const svgSlot = $('#boss-svg-slot');
    if (svgSlot) {
      svgSlot.classList.remove('anim-slash-impact');
      void svgSlot.offsetWidth;
      svgSlot.classList.add('anim-slash-impact');
    }
  },

  updateActiveSkillBadges() {
    const s = this.session;
    const q = s?.currentQuestion;
    const skill = this.activeBossSkill || ((q && (q.powerMult > 1.0 || q.skillApplied)) ? {
      id: q.skillApplied || 'power_strike',
      name: q.skillApplied === 'red_potion' ? 'Ramuan Merah' : 'Tebasan Super',
      mult: q.powerMult || 2.0
    } : null);

    const bossChip = $('#boss-active-skill-chip');
    const qBadge = $('#skill-active-badge');
    const svgSlot = $('#boss-svg-slot');

    if (skill) {
      const isRed = skill.id === 'red_potion';
      const icon = isRed ? '🍷' : '⚔️';
      const label = `${icon} ${skill.name} (×${skill.mult})!`;
      if (bossChip) {
        bossChip.textContent = label;
        bossChip.style.display = 'inline-flex';
        bossChip.classList.add('chip-active');
      }
      if (qBadge) {
        qBadge.textContent = `${icon} ${skill.name.toUpperCase()} ×${skill.mult}`;
        qBadge.style.display = 'inline-flex';
        qBadge.classList.add('badge-active');
      }
      if (svgSlot) svgSlot.classList.add('boss-target-primed');
    } else {
      if (bossChip) {
        bossChip.classList.remove('chip-active');
        bossChip.style.display = 'none';
      }
      if (qBadge) {
        qBadge.classList.remove('badge-active');
        qBadge.style.display = 'none';
      }
      if (svgSlot) svgSlot.classList.remove('boss-target-primed');
    }
  },

  showDamageFloater(text, type = 'dmg', delay = 0) {
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

      // Mulai fase exit yang halus (fade-out + collapse height)
      setTimeout(() => {
        if (floater) floater.classList.add('fade-out');
      }, 1050);

      // Bersihkan DOM setelah animasi keluar selesai sempurna
      setTimeout(() => {
        if (floater && floater.parentNode) floater.remove();
        if (container && container.children.length === 0 && container.parentNode) {
          container.remove();
        }
      }, 1400);
    };

    if (delay > 0) {
      setTimeout(trigger, delay);
    } else {
      trigger();
    }
  },

  applySkillBarVisibility() {
    const fab = $('#skill-fab');
    if (this.session && this.session.mode === 'FUN') {
      if (fab) fab.style.display = 'none';
      return;
    }
    if (fab) {
      fab.style.display = 'inline-flex';
      const energyVal = (typeof this.session?.energy === 'object' && this.session?.energy !== null)
        ? (this.session.energy.value ?? 2)
        : (this.session?.energy ?? 2);
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

  openSkillBubblePopup() {
    if (this.session && this.session.mode === 'FUN') {
      toast('Skill tidak dapat digunakan di Mode Fun! 🎉');
      return;
    }
    if (this.isAnswering) {
      toast('Tunggu jawaban saat ini selesai!');
      return;
    }
    this.closeSkillBubblePopup();

    const s = this.session;
    if (!s) return;

    const curEnergy = (typeof s.energy === 'object' && s.energy !== null) ? (s.energy.value ?? 2) : (s.energy ?? 2);
    const maxEnergy = (typeof s.energy === 'object' && s.energy !== null) ? (s.energy.max ?? 5) : (s.energyMax || 5);

    const DESCS = {
      eliminate_one: 'Mencoret 1 pilihan jawaban yang salah sehingga pilihan lebih sedikit.',
      eagle_eye: 'Mata elang tajam mencoret 2 pilihan jawaban yang salah sekaligus.',
      heal: 'Memulihkan HP pemain agar dapat bertahan lebih lama menghadapi bos.',
      shield: 'Membentuk perisai pelindung untuk menyerap serangan berikutnya dari bos.',
      power_strike: 'Meningkatkan daya serang ke bos berlipat ganda jika jawaban benar.',
      time_freeze: 'Membekukan waktu dan memberikan tambahan detik pada soal aktif.'
    };

    const skills = this.skills || [];
    const modal = document.createElement('div');
    modal.className = 'skill-modal-backdrop';
    modal.id = 'skill-modal-backdrop';
    modal.setAttribute('data-testid', 'skill-bubble-modal');

    let skillCardsHtml = '';
    if (skills.length === 0) {
      skillCardsHtml = '<div style="text-align:center;padding:24px 10px;color:var(--c-muted)">Belum ada skill yang terpasang pada petualangan ini.</div>';
    } else {
      skillCardsHtml = skills.map(sk => {
        const id = sk.id;
        const name = sk.name || id;
        const icon = sk.icon || '✨';
        const cost = sk.cost ?? 1;
        const usesLeft = sk.usesLeft ?? 3;
        const usable = !!sk.usable && !this.isAnswering && !this.isUsingSkill;
        const reason = sk.reason || null;
        const desc = sk.description || sk.effectDesc || DESCS[id] || 'Gunakan skill ini untuk membantumu memenangkan pertempuran.';
        const reasonMsg = (window.GameplayConfig && GameplayConfig.SKILL_REASON_TEXT && GameplayConfig.SKILL_REASON_TEXT[reason])
          || (reason === 'NO_ENERGY' ? `⚡ Butuh ${cost} Energi (tersedia ${curEnergy})`
            : reason === 'NOT_APPLICABLE' ? 'Skill ini tidak dapat digunakan pada tipe soal ini.'
            : reason === 'ALREADY_USED' ? 'Batas pemakaian skill ini sudah habis!'
            : reason === 'WRONG_STATE' ? 'Tunggu giliran soal berikutnya ya!'
            : reason === 'EVENT_PENDING' ? 'Selesaikan kejutan terlebih dahulu!'
            : reason === 'NOTHING_TO_ELIMINATE' ? 'Pilihan salah sudah habis dicoret!'
            : 'Belum bisa digunakan saat ini.');

        const lv = sk.level || 1;
        const skillBubbleArt = (window.SkillArt && SkillArt.hasSkill(id))
          ? SkillArt.renderSkill(id, lv, { size: 42 })
          : icon;

        return `
          <div class="skill-card-item ${usable ? 'usable' : 'dimmed'}" data-skill-id="${id}">
            <div class="skill-card-top">
              <div class="skill-card-title-wrap">
                <div class="skill-card-icon" style="background:transparent;border:none;width:42px;height:42px;display:flex;align-items:center;justify-content:center">${skillBubbleArt}</div>
                <div>
                  <div class="skill-card-name">${esc(name)}</div>
                  <div style="font-size:0.75rem;color:var(--c-muted)">Level ${lv}</div>
                </div>
              </div>
              <div class="skill-card-badges">
                <span class="skill-badge-cost">⚡ ${cost} Energi</span>
                <span class="skill-badge-uses">Sisa ${usesLeft}×</span>
              </div>
            </div>
            <div class="skill-desc-text">
              ${esc(desc)}
            </div>
            <div style="display:flex;justify-content:flex-end;align-items:center;margin-top:2px;gap:8px">
              ${usable ? `
                <button type="button" class="btn primary small btn-activate-skill" data-skill-id="${id}" style="padding:6px 14px;font-weight:700;font-size:0.85rem">
                  ⚡ Gunakan Skill
                </button>
              ` : `
                <span style="font-size:0.75rem;color:#f87171;font-weight:600">${esc(reasonMsg)}</span>
              `}
            </div>
          </div>
        `;
      }).join('');
    }

    modal.innerHTML = `
      <div class="skill-bubble-card" onclick="event.stopPropagation()">
        <div class="skill-bubble-header">
          <h3 class="skill-bubble-title">
            <span>⚡</span>
            <span>Skill Petarung</span>
          </h3>
          <button type="button" class="icon-btn small" id="btn-close-skill-modal" title="Tutup" style="width:30px;height:30px;font-size:0.9rem">✕</button>
        </div>

        <div class="skill-energy-banner">
          <span>⚡ Energi Tersedia</span>
          <span style="font-size:0.95rem;font-weight:800">${curEnergy} / ${maxEnergy}</span>
        </div>

        <div class="stack" style="gap:10px;overflow-y:auto;max-height:55vh;padding-right:2px">
          ${skillCardsHtml}
        </div>

        <div style="display:flex;justify-content:center;margin-top:4px">
          <button type="button" class="btn ghost small" id="btn-close-skill-modal-footer" style="padding:6px 20px;font-size:0.85rem">
            Tutup
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.onclick = (e) => {
      if (e.target === modal) this.closeSkillBubblePopup();
    };

    const closeBtn = $('#btn-close-skill-modal');
    if (closeBtn) closeBtn.onclick = () => this.closeSkillBubblePopup();
    const closeFooterBtn = $('#btn-close-skill-modal-footer');
    if (closeFooterBtn) closeFooterBtn.onclick = () => this.closeSkillBubblePopup();

    $$('.btn-activate-skill', modal).forEach(btn => {
      btn.onclick = async () => {
        const skillId = btn.dataset.skillId;
        this.closeSkillBubblePopup();
        await this.useBattleSkill(skillId, btn);
      };
    });
  },

  closeSkillBubblePopup() {
    const m = $('#skill-modal-backdrop');
    if (m) m.remove();
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
      const lv = sk.level || 1;
      const hasSvg = Boolean(window.SkillArt && SkillArt.hasSkill(id));
      const skillIconContent = hasSvg
        ? SkillArt.renderSkill(id, lv, { size: 48 })
        : `<span class="skill-icon">${icon}</span>`;

      return `
        <button class="skill-btn ${!usable ? 'dimmed' : ''} ${hasSvg ? 'has-svg' : ''}"
          id="skill-btn-${id}"
          data-testid="skill-btn-${id}"
          data-skill-id="${id}"
          aria-disabled="${!usable}"
          data-reason="${esc(reason || '')}"
          title="${esc(name)} (Biaya: ${cost} ⚡, Sisa: ${usesLeft}×)"
          type="button">
          <span class="skill-cost-badge">⚡${cost}</span>
          ${hasSvg ? skillIconContent : `<span class="skill-icon">${icon}</span>`}
          <span class="skill-level-badge">Lv.${lv}</span>
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
        this.closeSkillBubblePopup();
        s.energy = (res.energy && typeof res.energy === 'object') ? res.energy.value : (res.energy || s.energy);
        this.updateEnergyGauge(res.energy || s.energy);
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
          const mult = (res.effects?.powerStrike?.powerMult) || 2.0;
          this.activeBossSkill = { id: 'power_strike', name: 'Tebasan Super', mult };
          this.updateActiveSkillBadges();
          toast(`⚔️ Tebasan Super Aktif! Damage serangan berikutnya berlipat ganda: ×${mult}! 💥`);
        }

        if (skillId === 'red_potion') {
          const mult = (res.effects?.redPotion?.powerMult) || 3.0;
          this.activeBossSkill = { id: 'red_potion', name: 'Ramuan Merah', mult };
          if (res.session) {
            this.session = res.session;
            this.renderCurrentQuestion();
          }
          this.updateActiveSkillBadges();
          this.showDamageFloater('🍷 RAMUAN MERAH!', 'crit');
          toast(`🍷 Ramuan Merah Aktif! Soal termudah & Damage Super ×${mult}! 💥`);
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
  },

  brutalEnabled: false,

  showBossSkillDetail(skillId) {
    const s = this.session;
    if (!s) return;
    const tier = (s.bossTier || s.boss?.tier || s.boss_tier || 'common').toLowerCase();
    const isBrutal = Boolean(s.brutal);
    const elemKey = s.bossElement || s.boss_element || (s.boss && s.boss.element) || (window.BossSkills && BossSkills.elementForTheme(s.subject?.monster_theme || s.monster?.theme));
    const monsterId = s.monster?.id || s.boss?.id || s.monster_id;
    const skills = s.boss?.skills || (window.BossSkills && elemKey && BossSkills.skillsFor(elemKey, tier, monsterId).map(sk => ({ ...BossSkills.describeSkill(sk, tier, isBrutal), textBrutal: BossSkills.describeSkill(sk, tier, true).text }))) || [];
    const sk = skills.find(x => x.id === skillId) || (window.BossSkills && BossSkills.SKILL_INDEX[skillId]);
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
            <h3 style="margin:2px 0 0;font-size:1.15rem;font-weight:800;display:flex;align-items:center;gap:6px">
              <span>${esc(sk.icon)}</span> <span>${esc(sk.name)}</span>
            </h3>
          </div>
          <button type="button" class="icon-btn small" id="btn-close-skill-sheet" style="font-size:1rem;width:32px;height:32px">✕</button>
        </div>
        <p style="font-size:0.95rem;line-height:1.5;margin:10px 0 16px;color:var(--text,#f8fafc)">
          ${esc(isBrutal ? (sk.textBrutal || sk.text) : sk.text)}
        </p>
        <button type="button" class="btn primary small" id="btn-close-skill-sheet-ok" style="width:100%;padding:10px;font-weight:700">Tutup</button>
      </div>
    `;
    document.body.appendChild(sheet);
    const close = () => sheet.remove();
    sheet.onclick = close;
    sheet.querySelector('#btn-close-skill-sheet').onclick = close;
    sheet.querySelector('#btn-close-skill-sheet-ok').onclick = close;
  },

  showBossFxEvents(events) {
    if (!events || !events.length || !window.BossSkills) return;
    let container = $('#boss-fx-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'boss-fx-toast-container';
      container.className = 'boss-fx-toast-container';
      document.body.appendChild(container);
    }
    events.slice(0, 3).forEach((ev, i) => {
      const desc = BossSkills.describeEvent(ev);
      if (!desc || !desc.text) return;
      const toastEl = document.createElement('div');
      toastEl.className = `boss-fx-toast toast-${desc.kind || 'info'}`;
      toastEl.setAttribute('data-testid', 'boss-fx-toast');
      toastEl.innerHTML = `<span aria-hidden="true">${desc.icon || '⚠️'}</span> <span>${esc(desc.text)}</span>`;
      container.appendChild(toastEl);
      setTimeout(() => {
        toastEl.style.opacity = '0';
        toastEl.style.transform = 'translateY(-8px)';
        setTimeout(() => toastEl.remove(), 250);
      }, 2500 + i * 200);
    });
  },

  showBrutalConfirmModal(cb) {
    const old = $('#brutal-confirm-modal');
    if (old) old.remove();
    const modal = document.createElement('div');
    modal.id = 'brutal-confirm-modal';
    modal.className = 'modal-mask active';
    modal.innerHTML = `
      <div class="modal" style="text-align:center;max-width:360px">
        <div style="font-size:2.8rem;margin-bottom:6px">💀</div>
        <h3 class="modal-title" style="color:#ef4444;font-size:1.25rem">Tantangan Mode Brutal!</h3>
        <p style="font-size:0.9rem;line-height:1.45;color:var(--text);margin:8px 0 16px">
          Mode Brutal melipatgandakan efek <strong>skill boss 2×</strong> lebih dahsyat, tetapi memberikan <strong>hadiah koin & XP 3×</strong> lipat jika kamu menang!<br><br>
          Apakah kamu siap menghadapi tantangan ini?
        </p>
        <div style="display:flex;gap:10px">
          <button type="button" class="btn secondary" id="btn-brutal-cancel" style="flex:1">Batal</button>
          <button type="button" class="btn danger" id="btn-brutal-accept" style="flex:1;background:#dc2626;color:#fff;font-weight:700">Siap Laga! ⚔️</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    $('#btn-brutal-cancel', modal).onclick = () => { modal.remove(); cb(false); };
    $('#btn-brutal-accept', modal).onclick = () => { modal.remove(); cb(true); };
  }
};

Screens.showComicModal = function (panels, theme, monsterObj) {
  if (!panels || panels.length === 0) return;

  const old = $('#comic-modal');
  if (old) old.remove();

  if (window.Feedback) Feedback.sfx('levelup');

  const modal = document.createElement('div');
  modal.id = 'comic-modal';
  modal.setAttribute('data-testid', 'comic-modal');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.96);z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.25s ease;';

  let currentPanel = 0;
  const totalPanels = panels.length;
  let autoTimer = null;

  const renderPanel = (idx) => {
    currentPanel = idx;
    const p = panels[idx] || panels[0];

    modal.innerHTML = `
      <div class="card" style="max-width:420px;width:100%;text-align:center;padding:24px 20px;border-radius:24px;background:linear-gradient(135deg, #1e293b, #0f172a);border:2px solid rgba(255,255,255,0.15);box-shadow:0 24px 48px rgba(0,0,0,0.8);position:relative">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="display:flex;gap:4px">
            ${panels.map((_, i) => `
              <span style="width:24px;height:4px;border-radius:2px;background:${i === currentPanel ? 'var(--c-primary,#10b981)' : 'rgba(255,255,255,0.2)'}"></span>
            `).join('')}
          </div>
          <button class="btn small ghost" id="btn-comic-skip" data-testid="btn-comic-skip" style="font-size:0.8rem;padding:4px 8px">
            Lewati ✕
          </button>
        </div>

        <div style="font-size:0.8rem;text-transform:uppercase;color:var(--c-primary,#10b981);font-weight:800;letter-spacing:1px">
          Panel ${currentPanel + 1} dari ${totalPanels}
        </div>
        <h2 style="font-size:1.35rem;font-weight:800;color:#fff;margin:4px 0 10px 0">${esc(p.title || 'Epilog Bab')}</h2>

        <!-- MAP ILLUSTRATION HEADER -->
        <div style="width:100%;height:130px;border-radius:14px;overflow:hidden;margin-bottom:12px;position:relative;border:1px solid rgba(255,255,255,0.15);box-shadow:0 4px 12px rgba(0,0,0,0.4)">
          <img src="/img/maps/map_${esc(theme || 'hutan')}.jpg" alt="Peta Cerita" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.src='/img/maps/map_hutan.jpg'">
          <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)"></div>
          <div style="position:absolute;bottom:6px;left:10px;font-size:0.75rem;font-weight:700;color:var(--c-primary,#10b981);text-shadow:0 2px 4px rgba(0,0,0,0.8)">
            Wilayah: ${esc(window.CampaignConfig?.CAMPAIGN?.themeTitles?.[theme] || theme || 'Petualangan')}
          </div>
        </div>

        <div style="background:rgba(255,255,255,0.05);border-radius:18px;padding:14px;margin-bottom:16px;min-height:90px;display:flex;flex-direction:column;justify-content:center;align-items:center">
          <p style="font-size:0.95rem;line-height:1.5;color:#e2e8f0;margin:0">${esc(p.text || '')}</p>
        </div>

        <div style="display:flex;gap:10px">
          ${currentPanel > 0 ? `
            <button class="btn secondary" id="btn-comic-prev" style="flex:1">← Kembali</button>
          ` : ''}
          <button class="btn primary" id="btn-comic-next" style="flex:2">
            ${currentPanel < totalPanels - 1 ? 'Lanjut ➔' : 'Selesai ✓'}
          </button>
        </div>
      </div>
    `;

    $('#btn-comic-skip').onclick = () => closeModal();
    const btnPrev = $('#btn-comic-prev');
    if (btnPrev) btnPrev.onclick = () => {
      clearTimeout(autoTimer);
      renderPanel(currentPanel - 1);
    };
    $('#btn-comic-next').onclick = () => {
      clearTimeout(autoTimer);
      if (currentPanel < totalPanels - 1) {
        renderPanel(currentPanel + 1);
      } else {
        closeModal();
      }
    };

    // Auto-advance 2.5s per panel
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => {
      if (currentPanel < totalPanels - 1) {
        renderPanel(currentPanel + 1);
      } else {
        closeModal();
      }
    }, 2500);
  };

  const closeModal = () => {
    clearTimeout(autoTimer);
    if (modal) modal.remove();
  };

  document.body.appendChild(modal);
  renderPanel(0);
};

/* ============================================================
   PETI HARTA KARUN GACHA SKIN WILAYAH 3 (Mode Cerita)
   ============================================================ */

/* ============================================================
   BATTLE ENDING SPECTACULAR MODAL (Mode Bebas Win/Loss Effect)
   ============================================================ */
Screens.showBattleEndingSpectacularModal = function ({ isWin, session, res, onComplete }) {
  const old = $('#battle-ending-modal');
  if (old) old.remove();

  const s = session || res?.session || {};
  let isDone = false;

  // SFX audio feedback
  try {
    if (isWin) {
      if (window.Feedback) Feedback.sfx('levelup');
      if (window.Sfx) Sfx.play('win');
    } else {
      if (window.Feedback) Feedback.sfx('wrong');
      if (window.Sfx) Sfx.play('lose');
    }
  } catch (_) {}

  const winTitles = [
    'Luar Biasa, Jawara Sejati!',
    'Kejeniusanmu Tak Tertandingi!',
    'Kemenangan Mutlak & Gemilang!',
    'Sang Monster Berhasil Kamu Tundukkan!'
  ];
  const winQuotes = [
    'Strategi dan ketepatan analisismu sungguh memukau! Sang Monster tak kuasa membendung ilmu pengetahuanmu!',
    'Hebat sekali! Fokus tinggi dan kecepatan berpikirmu membawamu meraih kejayaan di pertarungan ini!',
    'Pertarungan spektakuler! Setiap pertanyaan kamu tuntaskan dengan cemerlang bagai kesatria ilmu sejati!',
    'Kemenangan yang sungguh membanggakan! Terus pertahankan prestasimu dan raih puncak kejayaan!'
  ];

  const lossTitles = [
    'Kobarkan Kembali Semangatmu!',
    'Kekalahan Adalah Awal Kebangkitan!',
    'Pantang Menyerah, Pejuang Tangguh!',
    'Terus Berjuang, Kemenangan Menantimu!'
  ];
  const lossQuotes = [
    'Jangan berkecil hati! Pejuang terhebat tidak dinilai saat ia menang, melainkan saat ia bangkit kembali setelah terjatuh!',
    'Pertarungan yang sangat gagah dan membanggakan! Pelajari polanya, asah analisismu, dan buktikan kehebatanmu!',
    'Kekalahan hanyalah guru terbaik menuju kesuksesan sejati! Kumpulkan energimu dan taklukkan bos di babak berikutnya!',
    'Tetap percaya diri dan tegakkan kepalamu! Kegigihanmu patut diacungi jempol. Coba lagi dan rebut kemenangan mutlak!'
  ];

  const seed = Math.abs(((s.id || 1) * 31) + (s.totalQuestions || 0) + (s.correctCount || 0));
  const headline = isWin ? winTitles[seed % winTitles.length] : lossTitles[seed % lossTitles.length];
  const quote = isWin ? winQuotes[seed % winQuotes.length] : lossQuotes[seed % lossQuotes.length];

  const themeGlow = isWin ? 'rgba(245,158,11,0.45)' : 'rgba(249,115,22,0.4)';
  const themeBorder = isWin ? '2px solid #f59e0b' : '2px solid #f97316';
  const badgeBg = isWin ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)';
  const badgeBorder = isWin ? '#f59e0b' : '#ef4444';
  const badgeColor = isWin ? '#fef08a' : '#fca5a5';
  const badgeText = isWin ? '🏆 VICTORY! KEMENANGAN GEMILANG! 🏆' : '🔥 PANTANG MENYERAH! TETAP SEMANGAT! 🔥';

  const particlesCount = isWin ? 38 : 28;
  const colors = isWin
    ? ['#fbbf24', '#f59e0b', '#10b981', '#38bdf8', '#c084fc', '#f43f5e', '#ffffff']
    : ['#f97316', '#ef4444', '#facc15', '#fb923c', '#a855f7', '#f43f5e'];

  const modal = document.createElement('div');
  modal.id = 'battle-ending-modal';
  modal.setAttribute('data-testid', 'battle-ending-modal');
  modal.style.cssText = 'position:fixed;inset:0;background:radial-gradient(circle at center, rgba(30,27,75,0.96) 0%, rgba(15,23,42,0.98) 100%);z-index:10002;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;overflow-y:auto;cursor:pointer;-webkit-tap-highlight-color:transparent;animation:fadeIn 0.22s ease;';

  const correctN = s.correctCount ?? (s.stats?.correct ?? 0);
  const totalN = s.totalQuestions ?? (s.stats?.total ?? 0);
  const enemyName = s.boss?.name || s.monster?.name || 'Monster Penjaga';

  modal.innerHTML = `
    <!-- Confetti / Ember Particles Container -->
    <div class="confetti-container" style="position:absolute;inset:0;pointer-events:none;overflow:hidden">
      ${Array.from({ length: particlesCount }).map((_, i) => {
        const left = Math.random() * 100;
        const dur = isWin ? (1.5 + Math.random() * 1.5) : (1.6 + Math.random() * 1.4);
        const delay = Math.random() * 0.7;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = isWin ? (6 + Math.random() * 8) : (5 + Math.random() * 7);
        const anim = isWin ? 'confettiFall' : 'emberFloat';
        return `<div style="position:absolute;top:${isWin ? '-20px' : '90%'};left:${left}%;width:${size}px;height:${size}px;background:${color};border-radius:${Math.random() > 0.4 ? '50%' : '2px'};box-shadow:0 0 8px ${color};animation:${anim} ${dur}s ease-out ${delay}s infinite"></div>`;
      }).join('')}
    </div>

    <!-- Main Card -->
    <div class="card" style="max-width:440px;width:100%;text-align:center;padding:26px 20px;border-radius:24px;background:linear-gradient(135deg, rgba(30,41,59,0.96), rgba(15,23,42,0.98));border:${themeBorder};box-shadow:0 0 50px ${themeGlow}, 0 24px 48px rgba(0,0,0,0.85);position:relative;overflow:hidden;animation:itemPopIn 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards">
      
      <!-- Rotating radiant rays -->
      <div class="chest-rays" style="position:absolute;top:36%;left:50%;transform:translate(-50%,-50%);width:320px;height:320px;background:radial-gradient(circle, ${isWin ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.25)'} 0%, transparent 70%);border-radius:50%;pointer-events:none;animation:chestRaysSpin ${isWin ? '8s' : '10s'} linear infinite"></div>

      <div style="position:relative;z-index:2">
        <!-- Badge Atas -->
        <div style="display:inline-block;padding:4px 14px;border-radius:99px;background:${badgeBg};border:1px solid ${badgeBorder};color:${badgeColor};font-size:0.75rem;font-weight:900;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;box-shadow:0 0 15px ${themeGlow}">
          ${badgeText}
        </div>

        <!-- Center Animated Icon / Trophy / Shield -->
        <div style="margin:6px auto 14px auto;width:120px;height:120px;display:flex;align-items:center;justify-content:center;position:relative">
          ${isWin ? `
            <div style="font-size:5.5rem;line-height:1;filter:drop-shadow(0 0 25px #f59e0b);animation:victoryBounce 2s ease-in-out infinite">
              🏆
            </div>
            <div style="position:absolute;top:-4px;right:4px;font-size:1.8rem;animation:pulseText 1.2s infinite">✨</div>
            <div style="position:absolute;bottom:0;left:6px;font-size:1.5rem;animation:pulseText 1.4s 0.3s infinite">⭐</div>
          ` : `
            <div style="font-size:5.2rem;line-height:1;filter:drop-shadow(0 0 22px #f97316);animation:flamePulse 1.8s ease-in-out infinite">
              🛡️
            </div>
            <div style="position:absolute;bottom:4px;right:6px;font-size:2.2rem;animation:pulseText 1.2s infinite">🔥</div>
          `}
        </div>

        <!-- Headline -->
        <h2 style="font-size:1.45rem;font-weight:900;color:#fff;margin:0 0 8px 0;text-shadow:0 2px 12px rgba(0,0,0,0.85);letter-spacing:0.5px">
          ${esc(headline)}
        </h2>

        <!-- Pujian / Semangat Quote -->
        <p style="font-size:0.88rem;color:${isWin ? '#fef08a' : '#cbd5e1'};margin:0 auto 16px auto;max-width:360px;line-height:1.45;font-weight:600;text-shadow:0 1px 4px rgba(0,0,0,0.6)">
          "${esc(quote)}"
        </p>

        <!-- Mini Stats & Feedback Info -->
        <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:10px 14px;margin-bottom:18px;display:flex;justify-content:space-around;align-items:center;font-size:0.8rem">
          <div style="text-align:center">
            <div style="color:var(--c-muted);font-size:0.72rem;margin-bottom:2px">Status Pertarungan</div>
            <strong style="color:${isWin ? '#10b981' : '#f87171'};font-size:0.85rem">
              ${isWin ? '✅ Menang Mutlak' : '💔 Terkena Serangan'}
            </strong>
          </div>
          <div style="width:1px;height:24px;background:rgba(255,255,255,0.1)"></div>
          <div style="text-align:center">
            <div style="color:var(--c-muted);font-size:0.72rem;margin-bottom:2px">Soal Terjawab</div>
            <strong style="color:#fff;font-size:0.85rem">
              ${correctN} / ${totalN} Benar
            </strong>
          </div>
          <div style="width:1px;height:24px;background:rgba(255,255,255,0.1)"></div>
          <div style="text-align:center">
            <div style="color:var(--c-muted);font-size:0.72rem;margin-bottom:2px">Lawan</div>
            <strong style="color:#facc15;font-size:0.85rem">
              ${esc(enemyName)}
            </strong>
          </div>
        </div>

        <!-- Auto-Transition Countdown Bar -->
        <div style="display:flex;flex-direction:column;gap:6px;width:100%">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;color:#94a3b8;font-weight:700">
            <span style="color:${isWin ? '#fef08a' : '#fdba74'};display:flex;align-items:center;gap:4px">
              <span>✨</span>
              <span>Membuka Rangkuman Review Hadiah...</span>
            </span>
            <span id="transition-timer-txt">2.5s</span>
          </div>

          <div style="height:6px;background:rgba(255,255,255,0.12);border-radius:99px;overflow:hidden">
            <div id="transition-fill-bar" style="width:100%;height:100%;background:${isWin ? 'linear-gradient(90deg, #10b981, #f59e0b)' : 'linear-gradient(90deg, #ef4444, #f97316)'};border-radius:99px;transition:width 0.05s linear"></div>
          </div>

          <div style="font-size:0.72rem;color:#64748b;margin-top:2px">
            Sentuh layar di mana saja untuk langsung lanjut ➔
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  let countdownTimer = null;
  let autoFinishTimeout = null;

  const triggerComplete = () => {
    if (isDone) return;
    isDone = true;
    if (countdownTimer) clearInterval(countdownTimer);
    if (autoFinishTimeout) clearTimeout(autoFinishTimeout);

    if (modal) {
      modal.style.transition = 'opacity 0.2s ease-out';
      modal.style.opacity = '0';
      setTimeout(() => {
        if (modal && modal.parentNode) modal.remove();
        if (typeof onComplete === 'function') onComplete();
      }, 200);
    } else {
      if (typeof onComplete === 'function') onComplete();
    }
  };

  // Instant skip on click/tap
  modal.onclick = triggerComplete;

  // Countdown timer 2.6 seconds
  const duration = 2600;
  const startTime = Date.now();
  const fillEl = modal.querySelector('#transition-fill-bar');
  const timerTxt = modal.querySelector('#transition-timer-txt');

  countdownTimer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
    const remainingSec = Math.max(0, ((duration - elapsed) / 1000)).toFixed(1);

    if (fillEl) fillEl.style.width = `${remainingPct}%`;
    if (timerTxt) timerTxt.textContent = `${remainingSec}s`;

    if (elapsed >= duration) {
      clearInterval(countdownTimer);
    }
  }, 50);

  autoFinishTimeout = setTimeout(triggerComplete, duration);
};


Screens.showChapterChestModal = function (item, chapterComic, theme) {
  if (!item) return;

  const old = $('#chapter-chest-modal');
  if (old) old.remove();

  if (window.Feedback) Feedback.sfx('levelup');
  else if (window.Sfx) Sfx.play('win');

  const isCoinReward = Boolean(item.isCoinReward || item.slot === 'coin');
  const rarity = String(item.rarity || 'COMMON').toUpperCase();
  const isLegend = !isCoinReward && (rarity === 'LEGENDARY');
  const isEpic = !isCoinReward && (rarity === 'EPIC');
  const isCommon = !isCoinReward && (rarity === 'COMMON');

  const slotLabels = {
    hat: 'Topi',
    outfit: 'Pakaian / Zirah',
    weapon: 'Senjata / Alat',
    pet: 'Peliharaan',
    bg: 'Latar Belakang',
    frame: 'Bingkai Avatar',
    title: 'Gelar Kehormatan',
    permanent: 'Fitur Permanen'
  };
  const slotName = slotLabels[item.slot] || item.slot || 'Item Skin';

  const modal = document.createElement('div');
  modal.id = 'chapter-chest-modal';
  modal.setAttribute('data-testid', 'chapter-chest-modal');
  modal.className = `chest-modal-overlay rarity-${rarity.toLowerCase()}`;
  modal.style.cssText = 'position:fixed;inset:0;background:radial-gradient(circle at center, rgba(30,27,75,0.96) 0%, rgba(15,23,42,0.98) 100%);z-index:10001;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;overflow-y:auto;animation:fadeIn 0.25s ease;';

  let isOpened = false;

  const renderSealed = () => {
    modal.innerHTML = `
      <div class="chest-card card" style="max-width:440px;width:100%;text-align:center;padding:26px 20px;border-radius:24px;background:linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98));border:2px solid rgba(245,158,11,0.4);box-shadow:0 0 40px rgba(245,158,11,0.25), 0 24px 48px rgba(0,0,0,0.8);position:relative;overflow:hidden">
        
        <!-- Rotating radiant rays -->
        <div class="chest-rays" style="position:absolute;top:38%;left:50%;transform:translate(-50%,-50%);width:320px;height:320px;background:radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%);border-radius:50%;pointer-events:none;animation:chestRaysSpin 12s linear infinite"></div>

        <div style="position:relative;z-index:2">
          <div style="display:inline-block;padding:3px 12px;border-radius:99px;background:rgba(245,158,11,0.2);border:1px solid #f59e0b;color:#fef08a;font-size:0.75rem;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">
            🏆 WILAYAH 3 SELESAI!
          </div>
          <h2 style="font-size:1.4rem;font-weight:900;color:#fff;margin:0 0 6px 0;text-shadow:0 2px 10px rgba(0,0,0,0.8)">
            🎁 Peti Harta Karun Wilayah
          </h2>
          <p style="font-size:0.85rem;color:#cbd5e1;margin:0 auto 16px auto;max-width:320px;line-height:1.4">
            Selamat! Kamu telah menaklukkan Boss Wilayah 3. Sentuh peti emas di bawah ini untuk membuka gacha hadiah skin eksklusifmu!
          </p>

          <!-- Interactive Chest Element -->
          <div id="interactive-chest" style="width:160px;height:140px;margin:10px auto 20px auto;cursor:pointer;position:relative;transition:transform 0.15s ease" title="Sentuh untuk membuka peti!">
            <div class="chest-sprite" style="font-size:5.5rem;line-height:1;filter:drop-shadow(0 10px 20px rgba(245,158,11,0.5));animation:floatChest 2.2s ease-in-out infinite">
              🎁
            </div>
            <div style="font-size:0.75rem;font-weight:800;color:#fbbf24;margin-top:6px;animation:pulseText 1.5s ease-in-out infinite">
              ✨ Sentuh Peti ✨
            </div>
          </div>

          <button class="btn block primary large" id="btn-trigger-open" style="font-weight:800;font-size:1rem;padding:12px;box-shadow:0 8px 24px rgba(245,158,11,0.4);border:1px solid #fef08a;background:linear-gradient(135deg, #f59e0b, #d97706)">
            ✨ BUKA PETI HARTA KARUN! ✨
          </button>
        </div>
      </div>
    `;

    const triggerOpen = () => {
      if (isOpened) return;
      isOpened = true;
      openSequence();
    };

    const chestEl = modal.querySelector('#interactive-chest');
    if (chestEl) chestEl.onclick = triggerOpen;
    const btnOpen = modal.querySelector('#btn-trigger-open');
    if (btnOpen) btnOpen.onclick = triggerOpen;
  };

  const openSequence = () => {
    const card = modal.querySelector('.chest-card');
    if (!card) return;

    if (window.Sfx) Sfx.play('tap');

    card.innerHTML = `
      <div style="padding:40px 10px;text-align:center;position:relative">
        <div class="chest-opening-wrap" style="display:inline-block;animation:chestShake 0.75s ease-in-out">
          <div style="font-size:6.5rem;line-height:1;filter:drop-shadow(0 0 35px #f59e0b)">
            ✨📦✨
          </div>
        </div>
        <div style="font-size:1.15rem;font-weight:800;color:#fef08a;margin-top:16px;letter-spacing:1px;animation:pulseText 0.5s ease-in-out infinite">
          Membuka Peti Harta Karun...
        </div>
      </div>
    `;

    setTimeout(() => {
      renderRevealed();
    }, 850);
  };

  const renderRevealed = () => {
    if (isLegend) {
      if (window.Feedback) Feedback.sfx('levelup');
      if (window.Sfx) { Sfx.play('win'); setTimeout(() => Sfx.play('win'), 300); }
    } else if (isEpic) {
      if (window.Feedback) Feedback.sfx('levelup');
      else if (window.Sfx) Sfx.play('win');
    } else {
      if (window.Sfx) Sfx.play('win');
    }

    const tierColor = isCoinReward ? '#fbbf24' : (isLegend ? '#fbbf24' : (isEpic ? '#c084fc' : (isCommon ? '#38bdf8' : '#60a5fa')));
    const tierBg = isCoinReward
      ? 'linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(251,191,36,0.15) 100%)'
      : (isLegend
        ? 'linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(236,72,153,0.2) 50%, rgba(59,130,246,0.25) 100%)'
        : (isEpic ? 'linear-gradient(135deg, rgba(192,132,252,0.25) 0%, rgba(251,191,36,0.15) 100%)' : 'rgba(56,189,248,0.18)'));
    const tierBorder = isCoinReward ? '2px solid #f59e0b' : (isLegend ? '2px solid #f59e0b' : (isEpic ? '2px solid #c084fc' : '2px solid #38bdf8'));

    const tierTitle = isCoinReward
      ? '🪙 DROP KOIN PETUALANG WILAYAH 3! 🪙'
      : (isLegend
        ? '👑 DROP LEGENDARY SPEKTAKULER! 👑'
        : (isEpic ? '⚡ DROP EPIC LUAR BIASA! ⚡' : (isCommon ? '✨ DROP COMMON TERBUKA! ✨' : '✨ DROP RARE TERBUKA! ✨')));

    const itemIcon = item.icon || (item.slot === 'hat' ? '👑' : (item.slot === 'pet' ? '🐾' : (item.slot === 'weapon' ? '⚔️' : (item.slot === 'outfit' ? '🛡️' : (item.slot === 'bg' ? '🌌' : (item.slot === 'frame' ? '🖼️' : '📜'))))));

    modal.innerHTML = `
      <div class="confetti-container" style="position:absolute;inset:0;pointer-events:none;overflow:hidden">
        ${Array.from({ length: isLegend ? 40 : (isEpic ? 25 : 15) }).map((_, i) => {
          const left = Math.random() * 100;
          const dur = 1.5 + Math.random() * 1.5;
          const delay = Math.random() * 0.8;
          const colors = isLegend ? ['#fbbf24', '#f43f5e', '#a855f7', '#38bdf8', '#10b981'] : (isEpic ? ['#c084fc', '#fbbf24', '#e879f9'] : ['#38bdf8', '#bae6fd', '#ffffff']);
          const color = colors[Math.floor(Math.random() * colors.length)];
          const size = 6 + Math.random() * 8;
          return `<div style="position:absolute;top:-20px;left:${left}%;width:${size}px;height:${size}px;background:${color};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};animation:confettiFall ${dur}s ease-out ${delay}s infinite"></div>`;
        }).join('')}
      </div>

      <div class="chest-card card ${isLegend ? 'card-legendary' : ''}" style="max-width:440px;width:100%;text-align:center;padding:26px 20px;border-radius:24px;background:linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98));border:${tierBorder};box-shadow:0 0 50px ${tierColor}40, 0 24px 48px rgba(0,0,0,0.85);position:relative;overflow:hidden;animation:itemPopIn 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards">
        
        <div style="position:absolute;top:35%;left:50%;transform:translate(-50%,-50%);width:300px;height:300px;background:radial-gradient(circle, ${tierColor}35 0%, transparent 70%);border-radius:50%;pointer-events:none;animation:chestRaysSpin 8s linear infinite"></div>

        <div style="position:relative;z-index:2">
          <div style="font-size:0.85rem;font-weight:900;letter-spacing:1px;color:${tierColor};margin-bottom:8px;text-shadow:0 0 12px ${tierColor};text-transform:uppercase">
            ${tierTitle}
          </div>

          <div style="background:${tierBg};border:${tierBorder};border-radius:20px;padding:18px 14px;margin:12px 0 16px 0;display:flex;flex-direction:column;align-items:center;gap:8px">
            <div style="font-size:4.2rem;line-height:1;filter:drop-shadow(0 6px 16px ${tierColor}80)">
              ${itemIcon}
            </div>
            <h3 style="font-size:1.3rem;font-weight:900;color:#fff;margin:4px 0 2px 0;text-shadow:0 2px 8px rgba(0,0,0,0.8)">
              ${esc(item.name)}
            </h3>
            <div style="display:flex;gap:6px;align-items:center">
              <span class="chip" style="font-size:0.72rem;background:${tierColor};color:#000;font-weight:900;padding:2px 8px;border-radius:99px;text-transform:uppercase">
                ${rarity}
              </span>
              <span class="chip" style="font-size:0.72rem;background:rgba(255,255,255,0.1);color:#e2e8f0;font-weight:700;padding:2px 8px;border-radius:99px">
                ${slotName}
              </span>
            </div>

            <div style="margin-top:6px;padding:8px 12px;background:rgba(0,0,0,0.4);border-radius:10px;border:1px solid rgba(255,255,255,0.1);width:100%;text-align:left">
              <div style="font-size:0.72rem;text-transform:uppercase;color:${tierColor};font-weight:800;margin-bottom:2px">
                ⚔️ Efek Pasif RPG:
              </div>
              <div style="font-size:0.82rem;font-weight:700;color:#fff">
                ${esc(item.passive?.desc || 'Koleksi Kosmetik Avatar')}
              </div>
            </div>

            <div style="font-size:0.75rem;color:#94a3b8;font-style:italic;line-height:1.3;margin-top:2px">
              "${esc(item.lore || 'Item berharga yang diperoleh dari puncak petualangan wilayah.')}"
            </div>

            ${item.isDuplicate ? `
              <div style="margin-top:6px;font-size:0.75rem;color:#fbbf24;font-weight:700">
                🪙 Sudah dimiliki: +${item.refundCoins || 15} Koin Refund otomatis ditambahkan!
              </div>
            ` : `
              <div style="margin-top:6px;font-size:0.75rem;color:#10b981;font-weight:700">
                ✅ Berhasil disimpan ke koleksi avatar profilmu!
              </div>
            `}
          </div>

          <div style="display:flex;flex-direction:column;gap:8px;margin-top:14px">
            <button class="btn block primary" id="btn-collect-chest" style="font-weight:800;font-size:0.95rem;padding:10px">
              🎒 Simpan ke Koleksi
            </button>
            ${chapterComic ? `
              <button class="btn block secondary" id="btn-read-comic-from-chest" style="font-weight:700;font-size:0.85rem;padding:8px">
                📖 Baca Komik Epilog Bab
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    const closeAll = () => {
      if (modal) modal.remove();
    };

    const btnCollect = modal.querySelector('#btn-collect-chest');
    if (btnCollect) btnCollect.onclick = () => {
      if (isCoinReward) {
        if (window.Feedback) Feedback.sfx('coin');
        else if (window.Sfx) Sfx.play('tap');
        closeAll();
        toast(`${item.name} berhasil ditambahkan ke kantong koinmu! 🪙`);
      } else {
        if (window.Sfx) Sfx.play('tap');
        closeAll();
        toast(`Item ${item.name} telah masuk ke lemari avatar! ✨`);
      }
    };

    const btnComic = modal.querySelector('#btn-read-comic-from-chest');
    if (btnComic && chapterComic) {
      btnComic.onclick = () => {
        closeAll();
        Screens.showComicModal(chapterComic, theme);
      };
    }
  };

  document.body.appendChild(modal);
  renderSealed();
};

/* ============================================================
   SCREEN: Result (Hasil Pertarungan)
   ============================================================ */
Screens.result = {
  showWrongQuestionsModal(wrongQuestions) {
    const old = $('#wrong-questions-modal');
    if (old) old.remove();

    const modal = document.createElement('div');
    modal.id = 'wrong-questions-modal';
    modal.className = 'modal-mask active';
    modal.setAttribute('data-testid', 'wrong-questions-modal');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(5,8,20,0.85);backdrop-filter:blur(8px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:14px;animation:fadeIn 0.2s ease;';

    const itemsHtml = wrongQuestions.map((q) => {
      const isTimeout = q.outcome && q.outcome.startsWith('TIMEOUT');
      return `
        <div class="card" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
            <span class="chip accent" style="font-size:0.75rem;font-weight:800;padding:2px 8px;border-radius:8px">
              Soal #${q.questionNumber}
            </span>
            <span class="chip danger" style="font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:8px;background:${isTimeout ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'};color:${isTimeout ? '#fbbf24' : '#f87171'}">
              ${isTimeout ? '⏰ Waktu Habis' : '❌ Kurang Tepat'}
            </span>
          </div>

          <div style="font-size:0.95rem;font-weight:700;color:#f1f5f9;line-height:1.4">
            ${esc(q.text)}
          </div>

          ${q.imageUrl ? `
            <div style="text-align:center;margin:2px 0">
              <img src="${esc(q.imageUrl)}" alt="Gambar Soal" style="max-height:130px;max-width:100%;border-radius:10px;object-fit:contain" loading="lazy">
            </div>
          ` : ''}

          <div style="display:flex;flex-direction:column;gap:6px;margin-top:2px">
            <div style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:8px 10px;font-size:0.85rem;color:#fca5a5;display:flex;align-items:center;gap:6px">
              <span>❌</span>
              <div>
                <span style="font-size:0.75rem;color:#f87171;font-weight:700;display:block">Jawaban Kamu:</span>
                <span style="font-weight:700">${esc(q.playerAnswer)}</span>
              </div>
            </div>

            <div style="background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);border-radius:10px;padding:8px 10px;font-size:0.85rem;color:#86efac;display:flex;align-items:center;gap:6px">
              <span>✅</span>
              <div>
                <span style="font-size:0.75rem;color:#4ade80;font-weight:700;display:block">Kunci Jawaban yang Benar:</span>
                <span style="font-weight:700">${esc(q.correctAnswer)}</span>
              </div>
            </div>
          </div>

          ${q.explanation ? `
            <div style="background:rgba(56,189,248,0.08);border-left:3px solid #38bdf8;border-radius:8px;padding:8px 10px;font-size:0.82rem;color:#bae6fd;line-height:1.4;margin-top:2px">
              <div style="font-weight:800;font-size:0.75rem;color:#38bdf8;margin-bottom:2px">💡 Penjelasan / Pembahasan:</div>
              ${esc(q.explanation)}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    modal.innerHTML = `
      <div class="card" onclick="event.stopPropagation()" style="max-width:440px;width:100%;max-height:86vh;background:linear-gradient(165deg, #1e1b4b, #0f172a);border:2px solid rgba(239,68,68,0.45);box-shadow:0 16px 40px rgba(0,0,0,0.8);border-radius:22px;padding:18px 14px;display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px">
          <div>
            <h3 style="margin:0;font-size:1.15rem;font-weight:800;color:#f87171;display:flex;align-items:center;gap:6px">
              <span>📖</span>
              <span>Pembahasan Soal Salah</span>
            </h3>
            <div style="font-size:0.75rem;color:var(--c-muted);margin-top:2px">
              Ada ${wrongQuestions.length} soal yang perlu kamu pelajari lagi
            </div>
          </div>
          <button type="button" class="icon-btn small" id="btn-close-wrong-modal-x" title="Tutup" style="width:30px;height:30px;font-size:0.9rem">✕</button>
        </div>

        <div class="stack" style="gap:12px;overflow-y:auto;flex:1 1 auto;padding-right:2px;-webkit-overflow-scrolling:touch">
          ${itemsHtml}
        </div>

        <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:10px">
          <button type="button" class="btn primary small" id="btn-close-wrong-modal-ok" style="width:100%;font-weight:700;padding:10px;font-size:0.9rem">
            Saya Mengerti & Tutup 📚
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
    const closeX = $('#btn-close-wrong-modal-x');
    if (closeX) closeX.onclick = () => modal.remove();
    const closeOk = $('#btn-close-wrong-modal-ok');
    if (closeOk) closeOk.onclick = () => modal.remove();
  },

  data: null,
  show(res) {
    this.data = res;
    if (res?.player && window.Player) {
      const oldLevel = Player.data?.level || 1;
      const newLevel = res.player.level || oldLevel;
      if (newLevel > oldLevel && window.Progression) {
        const oldMax = Progression.energyMaxForLevel(oldLevel);
        const newMax = Progression.energyMaxForLevel(newLevel);
        if (newMax > oldMax) {
          setTimeout(() => {
            if (window.toast) toast('⚡ Kapasitas energi naik jadi ' + newMax + ' ⚡!');
          }, 800);
        }
      }
      Player.data = { ...Player.data, ...res.player };
    }
    go('result');
  },

  render(app) {
    const r = this.data;
    if (!r) return go('subjects');
    const s = r.session || {};
    const isWon = s.status === 'WON';

    if (isWon) {
      if (window.Feedback) Feedback.sfx('levelup');
      else if (window.Sfx) Sfx.play('win');
    } else {
      if (window.Feedback) Feedback.sfx('wrong');
      else if (window.Sfx) Sfx.play('lose');
    }

    const stars = s.stars !== undefined ? s.stars : (r.rewards?.stars || 0);
    const starsStr = stars > 0 ? '⭐'.repeat(stars) : '☆☆☆';
    const tier = (s.bossTier || s.boss?.tier || s.boss_tier || 'common').toLowerCase();
    const tierInfo = (window.Progression?.BOSS_TIERS?.[tier]) || { id: tier, label: tier.toUpperCase(), icon: '⚪', color: '#9aa5b1' };
    const monsterDef = (s.monster && s.monster.color) ? s.monster : (Monsters.MONSTERS.find(x => x.id === (s.monster?.id || s.boss?.id || s.monster_id)) || Monsters.MONSTERS[0]);
    const monsterSvg = s.boss?.svg || Monsters.renderMonster(monsterDef, { size: 140, tier });

    const xpEarned = s.xpEarned !== undefined ? s.xpEarned : (s.xp_earned !== undefined ? s.xp_earned : (r.rewards?.xp ?? 0));
    const coinsEarned = s.coinsEarned !== undefined ? s.coinsEarned : (s.coins_earned !== undefined ? s.coins_earned : (r.rewards?.coins ?? 0));
    const maxStreak = s.maxStreak !== undefined ? s.maxStreak : (s.max_streak || 0);
    const bossSkillsFaced = s.boss?.skills || (s.boss_skills ? (typeof s.boss_skills === 'string' ? JSON.parse(s.boss_skills) : s.boss_skills) : null) || [];

    // Child-Friendly Defeat / Victory Messages & Study Tips (K / T-26)
    const accuracy = (s.totalQuestions > 0) ? ((s.correctCount || 0) / s.totalQuestions) : 0;
    let resultTitle = isWon ? 'Kemenangan Gemilang!' : 'Pantang Menyerah!';
    let defeatQuote = '';
    let studyTip = '';

    if (!isWon) {
      const msgList = accuracy >= 0.5
        ? (window.StoryData?.DEFEAT_MESSAGES?.close || ['Sedikit lagi kamu menang! Pertahankan semangatmu dan coba lagi ya! 🌟'])
        : (window.StoryData?.DEFEAT_MESSAGES?.far || ['Pertarungan yang bagus! Jangan menyerah, setiap kesalahan membuat kita semakin pintar. 🌱']);
      defeatQuote = Screens.battle.pickLine(msgList, s.id || 1);
      if (s.endReason === 'OUT_OF_QUESTIONS') {
        defeatQuote = 'Boss kabur… sedikit lagi! ' + defeatQuote;
      }
      studyTip = '💡 Tip Belajar: Baca kembali rangkuman dan teliti setiap kata kunci pertanyaan sebelum memilih!';
    } else {
      const theme = s.monster?.theme || 'hutan';
      const defeatLines = window.StoryData?.STORY?.[theme]?.defeat || [];
      defeatQuote = defeatLines.length > 0 ? Screens.battle.pickLine(defeatLines, 0) : `Luar biasa! Kamu berhasil menaklukkan ${esc(s.monster?.name || 'Monster')}!`;
    }

    app.innerHTML = `
      <section class="screen active center-col stack">
        <div style="font-size:2.8rem;margin-bottom:-10px">${isWon ? '👑' : '🛡️'}</div>
        <h1 class="brand" style="color:${isWon ? 'var(--c-primary)' : '#94a3b8'}">
          ${esc(resultTitle)}
        </h1>
        <p class="tagline" style="font-size:0.95rem;line-height:1.4;margin:6px 0 10px 0;max-width:340px;color:${isWon ? '#86efac' : '#fde047'}">
          ${esc(defeatQuote)}
        </p>

        <div class="card" style="padding:16px;width:min(340px,100%);text-align:center;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong);display:flex;flex-direction:column;align-items:center">
          <!-- Bintang Kemenangan / Status (Di Atas Boss) -->
          <div style="display:flex;justify-content:center;align-items:center;font-size:2.2rem;line-height:1;margin:4px auto 10px auto;letter-spacing:4px">
            ${starsStr}
          </div>

          <!-- Boss Monster (Pas di Tengah) -->
          <div style="display:flex;align-items:center;justify-content:center;margin:0 auto 10px auto;width:100%;height:140px">
            <div style="width:140px;height:140px;display:flex;align-items:center;justify-content:center;margin:0 auto">
              ${monsterSvg}
            </div>
          </div>

          <!-- Rarity Tier Badge (Di Bawah Boss) -->
          <div style="display:flex;justify-content:center;margin-bottom:12px">
            <span class="chip tier-badge boss-tier-badge tier-${tier}" id="result-boss-tier" data-testid="boss-tier-badge" style="background:${tierInfo.color};color:#fff;font-size:0.75rem;font-weight:700;padding:2px 12px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.25)">
              ${tierInfo.icon} ${tierInfo.label}
            </span>
          </div>

          <div style="display:flex;justify-content:space-around;width:100%;font-size:.9rem;padding:10px 0;border-top:1px solid rgba(255,255,255,.1)">
            <div>
              <div style="color:var(--c-muted);font-size:.75rem">XP Didapat</div>
              <strong style="color:var(--c-good)">+${xpEarned} XP</strong>
            </div>
            <div>
              <div style="color:var(--c-muted);font-size:.75rem">Koin</div>
              <strong style="color:var(--c-primary)">+${coinsEarned} 🪙</strong>
            </div>
            <div>
              <div style="color:var(--c-muted);font-size:.75rem">Max Combo</div>
              <strong style="color:var(--c-info)">🔥 ${maxStreak}×</strong>
            </div>
          </div>
          ${s.brutal ? `
            <div style="margin-top:10px;display:flex;justify-content:center">
              <span class="chip brutal-badge" id="result-brutal-reward" data-testid="result-brutal-reward" style="font-size:0.8rem;padding:3px 12px">
                💀 Hadiah ×3 (Brutal)
              </span>
            </div>
          ` : ''}
          ${bossSkillsFaced && bossSkillsFaced.length > 0 ? `
            <div style="margin-top:10px;font-size:0.75rem;color:var(--c-muted);text-align:center;line-height:1.4">
              Jurus yang kamu hadapi: ${bossSkillsFaced.map(sk => `${esc(sk.icon)} ${esc(sk.name)}`).join(' · ')}
            </div>
          ` : ''}
          ${studyTip ? `
            <div style="margin-top:10px;padding:8px 10px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);border-radius:10px;text-align:left;font-size:0.8rem;color:#fde047">
              ${esc(studyTip)}
            </div>
          ` : ''}
        </div>

        ${(r.rewards && r.rewards.chapterCompleted && r.rewards.items && r.rewards.items.length > 0) ? `
          <div style="width:min(340px,100%);margin-top:10px;padding:12px;background:rgba(245,158,11,0.12);border:1.5px solid rgba(245,158,11,0.35);border-radius:14px;text-align:center">
            <div style="font-weight:900;color:#fbbf24;font-size:0.9rem">🎁 PETI HARTA KARUN WILAYAH 3</div>
            <div style="font-size:0.8rem;color:#fff;margin:3px 0 8px 0">
              Skin: <strong>${esc(r.rewards.items[0].name)}</strong> (${esc(r.rewards.items[0].rarity)})
            </div>
            <button class="btn block secondary small" id="btn-reopen-chest" style="font-size:0.78rem;font-weight:700;padding:6px">
              🎁 Buka Ulang Animasi Peti
            </button>
          </div>
        ` : ''}
        ${(r.rewards && r.rewards.chapterCompleted && r.rewards.chapterComic) ? `
          <div style="width:min(340px,100%);margin-top:10px">
            <button class="btn block primary" id="btn-show-comic" data-testid="btn-show-comic" style="font-weight:700">
              📖 Buka Komik Epilog Bab!
            </button>
          </div>
        ` : ''}
        <div class="stack" style="width:min(340px,100%);gap:10px;margin-top:10px">
          <button class="btn block primary" id="btn-replay" data-testid="btn-retry">▶ Coba Lagi</button>
          <button class="btn block secondary" id="btn-review-wrong" data-testid="btn-review-wrong">📖 Lihat Soal yang Salah</button>
          <button class="btn block ghost" id="btn-menu">🏠 Kembali ke Menu</button>
        </div>
      </section>
    `;

    const comicBtn = $('#btn-show-comic');
    if (comicBtn && r.rewards?.chapterComic) {
      comicBtn.onclick = () => {
        Screens.showComicModal(r.rewards.chapterComic, s.monster?.theme);
      };
    }

    if (r.rewards?.chapterCompleted && r.rewards?.items && r.rewards.items.length > 0) {
      Screens.showChapterChestModal(r.rewards.items[0], r.rewards?.chapterComic, s.monster?.theme);
      const btnReopen = $('#btn-reopen-chest');
      if (btnReopen) {
        btnReopen.onclick = () => {
          Screens.showChapterChestModal(r.rewards.items[0], r.rewards?.chapterComic, s.monster?.theme);
        };
      }
    } else if (comicBtn && r.rewards?.chapterComic) {
      Screens.showComicModal(r.rewards.chapterComic, s.monster?.theme);
    }

    $('#btn-replay').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('subjects'); };
    const btnWrong = $('#btn-review-wrong');
    if (btnWrong) {
      btnWrong.onclick = async () => {
        if (window.Sfx) Sfx.play('tap');
        const origText = btnWrong.textContent;
        btnWrong.disabled = true;
        btnWrong.textContent = '⏳ Memuat Soal Salah...';
        try {
          const list = await API.getWrongQuestions(s.id);
          if (!list || list.length === 0) {
            toast('Luar biasa! Tidak ada soal yang salah pada petualangan ini! 🌟');
            return;
          }
          this.showWrongQuestionsModal(list);
        } catch (e) {
          toast('Gagal memuat pembahasan: ' + e.message);
        } finally {
          btnWrong.disabled = false;
          btnWrong.textContent = origText;
        }
      };
    }
    $('#btn-menu').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('home'); };
  }
};

/* ============================================================
   SCREEN: Profil (Ringkasan, Skin, Skill, Toko, Riwayat)
   ============================================================ */
Screens.profil = {
  activeTab: 'ringkasan',
  riwayatSubTab: 'battle',
  battleFilter: 'ALL',
  skinCatFilter: 'ALL',
  skinOwnerFilter: 'all',
  skinRarityFilter: 'ALL',
  shopCatFilter: 'ALL',
  shopRarityFilter: 'ALL',
  profileData: null,
  inventoryData: null,
  shopData: null,
  skillsData: null,
  historyData: null,
  battleData: null,
  avatarDraft: null,

  switchToBattleHistory() {
    this.activeTab = 'riwayat';
    this.riwayatSubTab = 'battle';
    const app = $('#app');
    $$('.tab-btn', app).forEach(b => {
      if (b.dataset.tab === 'riwayat') {
        b.classList.remove('ghost');
        b.classList.add('active');
      } else {
        b.classList.add('ghost');
        b.classList.remove('active');
      }
    });
    this.renderActiveTab();
  },

  showConfirmModal(title, message, confirmText, onConfirm, previewHtml = '', testId = 'confirm-modal') {
    const existing = $('.modal-mask');
    if (existing) existing.remove();

    const isHtml = typeof message === 'string' && /<[a-z][\s\S]*>/i.test(message);

    const modal = document.createElement('div');
    modal.className = 'modal-mask active';
    modal.setAttribute('data-testid', testId);
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(5,8,20,0.8);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease;';
    modal.innerHTML = `
      <div class="modal card" data-testid="confirm-modal" style="max-width:340px;text-align:center;padding:22px 20px;border:1px solid var(--c-surface-strong);box-shadow:0 20px 40px rgba(0,0,0,0.8);border-radius:20px;background:linear-gradient(165deg, #27235a, #1a1b3d)">
        ${previewHtml ? `<div style="width:76px;height:76px;margin:0 auto 12px auto;border-radius:18px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid rgba(255,255,255,0.12);box-shadow:inset 0 2px 6px rgba(0,0,0,0.3)">${previewHtml}</div>` : ''}
        <h3 style="font-size:1.15rem;margin:0 0 8px 0;color:#fff">${esc(title)}</h3>
        <div style="font-size:0.9rem;color:var(--c-muted);margin:0 0 16px 0;line-height:1.4">${isHtml ? message : esc(message)}</div>
        <div style="display:flex;gap:10px;justify-content:center">
          <button class="btn ghost small grow" id="modal-cancel">Batal</button>
          <button class="btn primary small grow" id="modal-confirm" data-testid="${testId}">${esc(confirmText || 'Lanjutkan')}</button>
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

  async openSelectBossForSlotModal(slotIdx, bossLoadout, pLevel) {
    const existing = $('.modal-mask');
    if (existing) existing.remove();

    let dexList = [];
    try {
      dexList = await API.getDex();
    } catch (_) {}

    const defeatedMonsters = dexList.filter(m => m.defeated || (m.defeats > 0));
    const currentMonsterId = bossLoadout.rawSlots ? bossLoadout.rawSlots[slotIdx] : null;
    const slotLabel = `Slot ${slotIdx + 1} Bos (PvP)`;
    const maxRarity = bossLoadout.maxAllowedRarity || (pLevel <= 10 ? 'common' : (pLevel <= 15 ? 'rare' : (pLevel < 20 ? 'epic' : 'legend')));

    const RARITY_LABEL = { common: 'Common', rare: 'Rare', epic: 'Epic', legend: 'Legend' };
    const TIER_ICON = { common: '⚪', rare: '🔵', epic: '🟣', legend: '🟡' };
    const TIER_MIN_LVL = { common: 5, rare: 11, epic: 16, legend: 20 };
    const TIER_ORDER = { common: 1, rare: 2, epic: 3, legend: 4 };

    const modal = document.createElement('div');
    modal.className = 'modal-mask active';
    modal.setAttribute('data-testid', 'modal-select-boss-for-slot');
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(5,8,20,0.85);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease;';

    let activeFilter = 'ALL';

    const renderBossModalContent = () => {
      const filtered = activeFilter === 'ALL'
        ? defeatedMonsters
        : defeatedMonsters.filter(m => {
            const mod10 = (m.id - 1) % 10;
            const tier = m.tier || (mod10 < 4 ? 'common' : (mod10 < 7 ? 'rare' : (mod10 < 9 ? 'epic' : 'legend')));
            return tier === activeFilter;
          });

      modal.innerHTML = `
        <div class="modal card" style="max-width:440px;width:100%;max-height:88vh;padding:18px;border:1px solid var(--c-surface-strong);box-shadow:0 20px 40px rgba(0,0,0,0.85);border-radius:20px;background:linear-gradient(165deg, #1e1b4b, #0f172a);display:flex;flex-direction:column;gap:10px;overflow:hidden">
          <!-- HEADER -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px">
            <div>
              <h3 style="font-size:1.05rem;margin:0;color:#fff;display:flex;align-items:center;gap:6px">
                👹 Pasang Bos di ${slotLabel}
              </h3>
              <div style="font-size:0.75rem;color:var(--c-muted);margin-top:3px">
                Batas Rarity Kamu: <span class="chip small" style="text-transform:uppercase;font-weight:700;background:rgba(255,255,255,0.1)">${maxRarity || 'Belum Terbuka'}</span> (Lv. ${pLevel})
              </div>
            </div>
            <button class="icon-btn" id="modal-boss-close-btn" style="width:32px;height:32px;font-size:1.1rem;color:var(--c-muted);border:none;background:transparent;cursor:pointer">✕</button>
          </div>

          <!-- RARITY RULE CALLOUT -->
          <div style="padding:6px 10px;background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.25);border-radius:8px;font-size:0.7rem;color:#93c5fd;line-height:1.35">
            💡 <b>Syarat Rarity:</b> Lv 5-10: ⚪ Common · Lv 11-15: 🔵 Rare · Lv 16-20: 🟣 Epic · Lv 20+: 🟡 Legend
          </div>

          <!-- FILTER BAR -->
          <div style="display:flex;gap:4px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch">
            <button class="btn small ${activeFilter === 'ALL' ? 'primary' : 'ghost'} btn-boss-filter" data-tier="ALL" style="padding:4px 8px;font-size:0.75rem">Semua (${defeatedMonsters.length})</button>
            <button class="btn small ${activeFilter === 'common' ? 'primary' : 'ghost'} btn-boss-filter" data-tier="common" style="padding:4px 8px;font-size:0.75rem">⚪ Common</button>
            <button class="btn small ${activeFilter === 'rare' ? 'primary' : 'ghost'} btn-boss-filter" data-tier="rare" style="padding:4px 8px;font-size:0.75rem">🔵 Rare</button>
            <button class="btn small ${activeFilter === 'epic' ? 'primary' : 'ghost'} btn-boss-filter" data-tier="epic" style="padding:4px 8px;font-size:0.75rem">🟣 Epic</button>
            <button class="btn small ${activeFilter === 'legend' ? 'primary' : 'ghost'} btn-boss-filter" data-tier="legend" style="padding:4px 8px;font-size:0.75rem">🟡 Legend</button>
          </div>

          <!-- LIST DEFEATED BOSSES -->
          <div style="overflow-y:auto;max-height:50vh;display:flex;flex-direction:column;gap:8px;padding-right:2px">
            ${defeatedMonsters.length === 0 ? `
              <div style="text-align:center;padding:32px 14px;color:var(--c-muted);font-size:0.85rem">
                <div style="font-size:2rem;margin-bottom:6px">🔒</div>
                Kamu belum mengalahkan bos monster apapun.<br>
                Kalahkan bos di menu <b>Petualangan</b> untuk mendapatkan jurusnya!
              </div>
            ` : filtered.length === 0 ? `
              <div style="text-align:center;padding:24px 14px;color:var(--c-muted);font-size:0.8rem">
                Tidak ada bos yang terkalahkan untuk filter ini.
              </div>
            ` : filtered.map(m => {
              const mod10 = (m.id - 1) % 10;
              const tier = m.tier || (mod10 < 4 ? 'common' : (mod10 < 7 ? 'rare' : (mod10 < 9 ? 'epic' : 'legend')));
              const B = typeof BossSkills !== 'undefined' ? BossSkills : null;
              const elKey = B ? B.elementForTheme(m.theme) : 'nature';
              const elInfo = (B && B.ELEMENTS[elKey]) || { name: 'Alam', icon: '🌿', color: '#22c55e' };
              const skills = B ? B.skillsFor(elKey, tier, m.id) : [];

              const isThisSlot = m.id === currentMonsterId;
              const equippedSlotIdx = bossLoadout.rawSlots ? bossLoadout.rawSlots.indexOf(m.id) : -1;
              const isEquippedElsewhere = equippedSlotIdx !== -1 && equippedSlotIdx !== slotIdx;

              const maxRank = TIER_ORDER[maxRarity] || 1;
              const bossRank = TIER_ORDER[tier] || 1;
              const canEquip = bossRank <= maxRank;

              const minLvlReq = TIER_MIN_LVL[tier] || 5;

              let actionHtml = '';
              if (isThisSlot) {
                actionHtml = `<span class="chip good" style="font-size:0.72rem;padding:4px 8px">Terpasang</span>`;
              } else if (!canEquip) {
                actionHtml = `<span style="font-size:0.7rem;color:#f87171;font-weight:700">🔒 Butuh Lv.${minLvlReq}</span>`;
              } else if (isEquippedElsewhere) {
                actionHtml = `
                  <button class="btn small ghost btn-equip-boss" data-id="${m.id}" data-action="swap" style="font-size:0.72rem;color:#f59e0b;border-color:#f59e0b;padding:4px 8px;white-space:nowrap">
                    Tukar (Slot ${equippedSlotIdx + 1})
                  </button>
                `;
              } else {
                actionHtml = `
                  <button class="btn small primary btn-equip-boss" data-id="${m.id}" data-action="equip" style="font-size:0.72rem;padding:4px 10px;white-space:nowrap">
                    Gunakan ⚔️
                  </button>
                `;
              }

              const MRenderer = typeof Monsters !== 'undefined' ? Monsters : null;
              const rawSvg = MRenderer ? MRenderer.renderMonster(m, { size: 48, tier }) : `<span style="font-size:1.8rem">${elInfo.icon}</span>`;

              return `
                <div class="card boss-pick-item" data-id="${m.id}" data-tier="${tier}" data-can-equip="${canEquip}" style="padding:8px 10px;background:rgba(255,255,255,0.04);border:1px solid ${isThisSlot ? 'var(--c-primary)' : 'rgba(255,255,255,0.08)'};border-radius:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;opacity:${canEquip ? '1' : '0.65'}">
                  <div style="display:flex;align-items:center;gap:10px;overflow:hidden">
                    <div style="width:48px;height:48px;border-radius:10px;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;flex:0 0 auto;border:1px solid rgba(255,255,255,0.1)">
                      ${rawSvg}
                    </div>
                    <div style="overflow:hidden">
                      <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
                        <strong style="color:#fff;font-size:0.85rem">${esc(m.name)}</strong>
                        <span style="font-size:0.68rem;color:var(--c-muted)">#${m.id}</span>
                        <span class="chip small" style="font-size:0.65rem;padding:2px 5px;background:${elInfo.color}22;color:${elInfo.color}">${elInfo.icon} ${elInfo.name}</span>
                        <span class="chip small" style="font-size:0.65rem;padding:2px 5px">${TIER_ICON[tier]} ${RARITY_LABEL[tier]}</span>
                      </div>
                      <div style="font-size:0.7rem;color:#cbd5e1;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:210px">
                        ✨ Skill (${skills.length}): ${skills.map(s => s.name).join(', ')}
                      </div>
                    </div>
                  </div>
                  <div style="flex:0 0 auto">
                    ${actionHtml}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- FOOTER / UNEQUIP BUTTON -->
          <div style="display:flex;gap:8px;align-items:center;border-top:1px solid rgba(255,255,255,0.08);padding-top:10px;margin-top:2px">
            ${currentMonsterId ? `
              <button class="btn small ghost" id="btn-unequip-boss-slot" style="color:#ef4444;border-color:rgba(239,68,68,0.3);font-size:0.78rem">
                🗑️ Lepas Bos
              </button>
            ` : ''}
            <div style="flex:1"></div>
            <button class="btn small ghost" id="modal-boss-cancel-btn" style="font-size:0.8rem">Tutup</button>
          </div>
        </div>
      `;

      // Wire close
      const closeBtn = $('#modal-boss-close-btn', modal);
      if (closeBtn) closeBtn.onclick = () => modal.remove();
      const cancelBtn = $('#modal-boss-cancel-btn', modal);
      if (cancelBtn) cancelBtn.onclick = () => modal.remove();

      // Wire filter
      $$('.btn-boss-filter', modal).forEach(btn => {
        btn.onclick = () => {
          activeFilter = btn.dataset.tier;
          renderBossModalContent();
        };
      });

      // Wire unequip
      const unequipBtn = $('#btn-unequip-boss-slot', modal);
      if (unequipBtn) {
        unequipBtn.onclick = async () => {
          unequipBtn.disabled = true;
          unequipBtn.textContent = 'Melepas...';
          const newSlots = Array.from({ length: 5 }, (_, i) => (bossLoadout.rawSlots ? bossLoadout.rawSlots[i] : null));
          newSlots[slotIdx] = null;
          try {
            await API.updateDuelBossLoadout(newSlots);
            toast(`Bos berhasil dilepas dari ${slotLabel}! ✨`);
            modal.remove();
            await this.renderActiveTab();
          } catch (err) {
            toast('Gagal melepas bos: ' + (err.message || err.code));
            unequipBtn.disabled = false;
            unequipBtn.textContent = '🗑️ Lepas Bos';
          }
        };
      }

      // Wire equip buttons
      $$('.btn-equip-boss', modal).forEach(btn => {
        btn.onclick = async (e) => {
          e.stopPropagation();
          const monsterId = parseInt(btn.dataset.id, 10);
          btn.disabled = true;
          btn.textContent = '...';

          const newSlots = Array.from({ length: 5 }, (_, i) => (bossLoadout.rawSlots ? bossLoadout.rawSlots[i] : null));
          const otherIdx = newSlots.indexOf(monsterId);
          if (otherIdx !== -1) {
            newSlots[otherIdx] = currentMonsterId;
          }
          newSlots[slotIdx] = monsterId;

          try {
            await API.updateDuelBossLoadout(newSlots);
            const mObj = dexList.find(x => x.id === monsterId);
            toast(`Bos ${mObj ? mObj.name : '#' + monsterId} berhasil dipasang di ${slotLabel}! ⚔️✨`);
            modal.remove();
            await this.renderActiveTab();
          } catch (err) {
            toast('Gagal memasang bos: ' + (err.message || err.code));
            btn.disabled = false;
            btn.textContent = 'Gunakan ⚔️';
          }
        };
      });
    };

    renderBossModalContent();
    document.body.appendChild(modal);
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  },

  openSelectSkillForSlotModal(slotIdx, loadout, skillsList, mode = 'adventure', maxSlots = 3) {
    const existing = $('.modal-mask');
    if (existing) existing.remove();

    const currentSkillId = loadout[slotIdx] || null;
    const currentSkill = currentSkillId ? skillsList.find(s => s.id === currentSkillId) : null;
    const ownedSkills = skillsList.filter(s => s.owned);
    const modeLabel = mode === 'duel' ? 'Battle vs Player' : 'Petualangan';
    const slotLabel = `Slot ${slotIdx + 1} (${modeLabel})`;

    const modal = document.createElement('div');
    modal.className = 'modal-mask active';
    modal.setAttribute('data-testid', 'modal-select-skill-for-slot');
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(5,8,20,0.8);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease;';

    modal.innerHTML = `
      <div class="modal card" style="max-width:390px;width:100%;max-height:85vh;padding:20px;border:1px solid var(--c-surface-strong);box-shadow:0 20px 40px rgba(0,0,0,0.8);border-radius:20px;background:linear-gradient(165deg, #27235a, #1a1b3d);display:flex;flex-direction:column;gap:12px;overflow:hidden">
        <!-- HEADER -->
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px">
          <div>
            <h3 style="font-size:1.1rem;margin:0;color:#fff;display:flex;align-items:center;gap:6px">
              🎯 Ganti Skill ${slotLabel}
            </h3>
            <div style="font-size:0.75rem;color:var(--c-muted);margin-top:2px">
              ${currentSkill ? `Saat ini: <b>${currentSkill.icon || '⚡'} ${esc(currentSkill.name)}</b> (Lv. ${currentSkill.level} · Maks: ${currentSkill.usesPerBattle || 2}×)` : 'Saat ini slot masih kosong'}
            </div>
          </div>
          <button class="icon-btn" id="modal-close-btn" style="width:32px;height:32px;font-size:1.1rem;color:var(--c-muted);border:none;background:transparent;cursor:pointer">✕</button>
        </div>

        <!-- SKILL LIST (SCROLLABLE) -->
        <div style="overflow-y:auto;max-height:55vh;display:flex;flex-direction:column;gap:8px;padding-right:4px">
          ${ownedSkills.length === 0 ? `
            <div style="text-align:center;padding:24px 12px;color:var(--c-muted);font-size:0.85rem">
              Belum ada skill yang kamu miliki.
            </div>
          ` : ownedSkills.map(sk => {
            const isThisSlot = sk.id === currentSkillId;
            const equippedSlotIdx = loadout.indexOf(sk.id);
            const isEquippedElsewhere = equippedSlotIdx !== -1 && equippedSlotIdx !== slotIdx;

            let actionHtml = '';
            if (isThisSlot) {
              actionHtml = `<span class="chip good" style="font-size:0.72rem;padding:4px 8px;white-space:nowrap">Terpasang</span>`;
            } else if (isEquippedElsewhere) {
              actionHtml = `
                <button class="btn small ghost btn-pick-skill" data-id="${sk.id}" data-action="swap" style="font-size:0.75rem;white-space:nowrap;border-color:#f59e0b;color:#f59e0b;padding:4px 10px">
                  Tukar (Slot ${equippedSlotIdx + 1})
                </button>
              `;
            } else {
              actionHtml = `
                <button class="btn small primary btn-pick-skill" data-id="${sk.id}" data-action="equip" style="font-size:0.75rem;white-space:nowrap;padding:4px 12px">
                  Gunakan
                </button>
              `;
            }

            const skLv = sk.level || 1;
            const pickArt = (window.SkillArt && SkillArt.hasSkill(sk.id))
              ? SkillArt.renderSkill(sk.id, skLv, { size: 40 })
              : (sk.icon || '⚡');

            return `
              <div class="card skill-pick-item" data-id="${sk.id}" style="padding:10px 12px;background:rgba(255,255,255,0.04);border:1px solid ${isThisSlot ? 'var(--c-primary)' : 'rgba(255,255,255,0.08)'};border-radius:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer">
                <div style="display:flex;align-items:center;gap:10px;overflow:hidden">
                  <div style="width:40px;height:40px;border-radius:10px;background:transparent;display:flex;align-items:center;justify-content:center;flex:0 0 auto">
                    ${pickArt}
                  </div>
                  <div style="overflow:hidden">
                    <div style="display:flex;align-items:center;gap:6px">
                      <strong style="color:#fff;font-size:0.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(sk.name)}</strong>
                      <span style="font-size:0.72rem;color:var(--c-primary);font-weight:700">Lv.${sk.level}</span>
                      <span style="font-size:0.68rem;color:#38bdf8">(${sk.usesPerBattle || 2}×)</span>
                    </div>
                    <div style="font-size:0.72rem;color:var(--c-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px">
                      ${esc(sk.effectNow || sk.descNow || sk.desc || '')}
                    </div>
                  </div>
                </div>
                <div style="flex:0 0 auto">
                  ${actionHtml}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- FOOTER / UNEQUIP BUTTON -->
        <div style="display:flex;gap:8px;align-items:center;border-top:1px solid rgba(255,255,255,0.08);padding-top:10px;margin-top:2px">
          ${currentSkill ? `
            <button class="btn small ghost" id="btn-unequip-slot" style="color:#ef4444;border-color:rgba(239,68,68,0.3);font-size:0.78rem">
              🗑️ Lepas Skill
            </button>
          ` : ''}
          <div style="flex:1"></div>
          <button class="btn small ghost" id="modal-cancel-btn" style="font-size:0.8rem">Tutup</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    const closeBtn = $('#modal-close-btn', modal);
    if (closeBtn) closeBtn.onclick = closeModal;
    const cancelBtn = $('#modal-cancel-btn', modal);
    if (cancelBtn) cancelBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    // Unequip handler
    const unequipBtn = $('#btn-unequip-slot', modal);
    if (unequipBtn) {
      unequipBtn.onclick = async () => {
        unequipBtn.disabled = true;
        unequipBtn.textContent = 'Melepas...';
        const newLoadout = Array.from({ length: maxSlots }, (_, i) => loadout[i] || null);
        newLoadout[slotIdx] = null;
        try {
          await API.updateLoadout(newLoadout.filter(Boolean), { type: mode });
          toast(`Skill berhasil dilepas dari ${slotLabel}! ✨`);
          closeModal();
          await this.renderActiveTab();
        } catch (err) {
          toast('Gagal melepas skill: ' + (err.message || err.code));
          unequipBtn.disabled = false;
          unequipBtn.textContent = '🗑️ Lepas Skill';
        }
      };
    }

    // Pick skill handlers (both button click and card click)
    $$('.skill-pick-item', modal).forEach(card => {
      card.onclick = async (e) => {
        const skillId = card.dataset.id;
        if (skillId === currentSkillId) {
          return;
        }

        const pickedSkill = skillsList.find(s => s.id === skillId);
        if (!pickedSkill) return;

        const btn = card.querySelector('.btn-pick-skill');
        if (btn) {
          btn.disabled = true;
          btn.textContent = '...';
        }

        const newLoadout = Array.from({ length: maxSlots }, (_, i) => loadout[i] || null);
        const otherIdx = newLoadout.indexOf(skillId);
        if (otherIdx !== -1) {
          newLoadout[otherIdx] = currentSkillId;
        }
        newLoadout[slotIdx] = skillId;

        try {
          await API.updateLoadout(newLoadout.filter(Boolean), { type: mode });
          toast(`Skill ${pickedSkill.name} berhasil dipasang di ${slotLabel}! 🎯`);
          closeModal();
          await this.renderActiveTab();
        } catch (err) {
          toast('Gagal mengganti skill: ' + (err.message || err.code));
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'Gunakan';
          }
        }
      };
    });
  },

  openSelectSlotToReplaceModal(skillToEquip, loadout, skillsList, mode = 'adventure', maxSlots = 3) {
    const existing = $('.modal-mask');
    if (existing) existing.remove();

    const modeLabel = mode === 'duel' ? 'Battle vs Player' : 'Petualangan';
    const modal = document.createElement('div');
    modal.className = 'modal-mask active';
    modal.setAttribute('data-testid', 'modal-select-slot-to-replace');
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(5,8,20,0.8);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease;';

    const slotIndices = Array.from({ length: maxSlots }, (_, i) => i);

    modal.innerHTML = `
      <div class="modal card" style="max-width:380px;width:100%;max-height:85vh;padding:20px;border:1px solid var(--c-surface-strong);box-shadow:0 20px 40px rgba(0,0,0,0.8);border-radius:20px;background:linear-gradient(165deg, #27235a, #1a1b3d);display:flex;flex-direction:column;gap:12px;overflow:hidden">
        <!-- HEADER -->
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px">
          <div>
            <h3 style="font-size:1.1rem;margin:0;color:#fff;display:flex;align-items:center;gap:6px">
              🎯 Pasang ${esc(skillToEquip.name)}
            </h3>
            <div style="font-size:0.75rem;color:var(--c-muted);margin-top:2px">
              Pilih slot loadout ${esc(modeLabel)} aktif yang ingin kamu isi:
            </div>
          </div>
          <button class="icon-btn" id="modal-close-btn" style="width:32px;height:32px;font-size:1.1rem;color:var(--c-muted);border:none;background:transparent;cursor:pointer">✕</button>
        </div>

        <!-- NEW SKILL PREVIEW -->
        <div style="padding:10px 12px;background:rgba(124, 58, 237, 0.12);border:1px solid rgba(124, 58, 237, 0.3);border-radius:12px;display:flex;align-items:center;gap:10px">
          <div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            ${(window.SkillArt && SkillArt.hasSkill(skillToEquip.id))
              ? SkillArt.renderSkill(skillToEquip.id, skillToEquip.level || 1, { size: 48 })
              : `<span style="font-size:1.8rem">${skillToEquip.icon || '⚡'}</span>`}
          </div>
          <div>
            <div style="font-weight:700;color:#fff;font-size:0.9rem">${esc(skillToEquip.name)} <span style="color:var(--c-primary);font-size:0.75rem">Lv.${skillToEquip.level || 1}</span> <span style="color:#38bdf8;font-size:0.72rem">(Maks: ${skillToEquip.usesPerBattle || 2}×)</span></div>
            <div style="font-size:0.73rem;color:#cbd5e1;line-height:1.3">${esc(skillToEquip.effectNow || skillToEquip.descNow || skillToEquip.desc || '')}</div>
          </div>
        </div>

        <!-- SLOTS LIST -->
        <div style="display:flex;flex-direction:column;gap:8px">
          ${slotIndices.map(idx => {
            const currentSkillId = loadout[idx] || null;
            const currentSkill = currentSkillId ? skillsList.find(s => s.id === currentSkillId) : null;
            const isEmpty = !currentSkill;
            const curLv = currentSkill ? (currentSkill.level || 1) : 1;
            const slotSkillArt = currentSkill
              ? ((window.SkillArt && SkillArt.hasSkill(currentSkill.id))
                  ? SkillArt.renderSkill(currentSkill.id, curLv, { size: 42 })
                  : currentSkill.icon)
              : '➕';

            return `
              <div class="card slot-pick-item" data-slot="${idx}" style="padding:12px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;transition:all 0.15s ease">
                <div style="display:flex;align-items:center;gap:12px">
                  <div style="width:42px;height:42px;border-radius:10px;background:transparent;border:1px dashed ${isEmpty ? 'rgba(255,255,255,0.2)' : 'var(--c-primary)'};display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex:0 0 auto">
                    ${slotSkillArt}
                  </div>
                  <div>
                    <div style="font-size:0.75rem;color:var(--c-primary);font-weight:700">Slot ${idx + 1}</div>
                    <div style="font-size:0.88rem;font-weight:700;color:#fff">
                      ${currentSkill ? esc(currentSkill.name) : '<span style="color:var(--c-muted)">(Kosong)</span>'}
                    </div>
                    <div style="font-size:0.7rem;color:var(--c-muted)">
                      ${currentSkill ? `Lv. ${currentSkill.level} · Maks: ${currentSkill.usesPerBattle || 2}×` : 'Siap diisi'}
                    </div>
                  </div>
                </div>
                <div>
                  <button class="btn small ${isEmpty ? 'good' : 'primary'} btn-replace-slot" data-slot="${idx}" style="font-size:0.78rem;padding:6px 12px;white-space:nowrap">
                    ${isEmpty ? 'Isi Slot' : `Ganti Slot ${idx + 1}`}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- FOOTER -->
        <div style="display:flex;justify-content:flex-end;border-top:1px solid rgba(255,255,255,0.08);padding-top:10px;margin-top:2px">
          <button class="btn small ghost" id="modal-cancel-btn" style="font-size:0.8rem">Batal</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    const closeBtn = $('#modal-close-btn', modal);
    if (closeBtn) closeBtn.onclick = closeModal;
    const cancelBtn = $('#modal-cancel-btn', modal);
    if (cancelBtn) cancelBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    $$('.slot-pick-item', modal).forEach(card => {
      card.onclick = async () => {
        const targetIdx = parseInt(card.dataset.slot, 10);
        const btn = card.querySelector('.btn-replace-slot');
        if (btn) {
          btn.disabled = true;
          btn.textContent = 'Memproses...';
        }

        const newLoadout = Array.from({ length: maxSlots }, (_, i) => loadout[i] || null);
        const existingIdx = newLoadout.indexOf(skillToEquip.id);
        if (existingIdx !== -1) {
          newLoadout[existingIdx] = null;
        }
        newLoadout[targetIdx] = skillToEquip.id;

        try {
          await API.updateLoadout(newLoadout.filter(Boolean), { type: mode });
          toast(`🎯 ${skillToEquip.name} berhasil dipasang di Slot ${targetIdx + 1} (${modeLabel})!`);
          closeModal();
          await this.renderActiveTab();
        } catch (err) {
          toast('Gagal memasang skill: ' + (err.message || err.code));
          if (btn) {
            btn.disabled = false;
            btn.textContent = `Ganti Slot ${targetIdx + 1}`;
          }
        }
      };
    });
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
        <div class="q-scroll-box grow stack" id="profile-tab-content" style="overflow-y:auto;overflow-x:hidden;flex:1 1 auto;padding:6px 4px 24px 4px;gap:12px;-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain">
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
    const badgeSummary = this.profileData?.badgeSummary || { totalUnlocked: badges.length, totalBadges: 80 };
    const badgeFamilies = this.profileData?.badgeFamilies || [];
    const showcase = this.profileData?.showcase || [null, null, null];
    const titles = this.profileData?.titles || [null, null, null];
    while (titles.length < 3) titles.push(null);
    const heroAvatarSvg = window.Avatar
      ? Avatar.renderAvatar(this.profileData?.avatar || {}, { size: 196 })
      : '<div style="font-size:4rem;display:flex;align-items:center;justify-content:center;height:100%">🎒</div>';

    slot.innerHTML = `
      <!-- HERO SHOWCASE CARD (1 Kotak Penuh di Atas + Info di Bawah) -->
      <div class="card hero-profile-card" style="padding:16px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong);display:flex;flex-direction:column;align-items:center;box-shadow:0 8px 24px rgba(0,0,0,0.35)">
        <!-- 1 KOTAK FOTO PROFIL UTUH BESERTA PET, SENJATA & BINGKAI KOTAK -->
        <div class="hero-avatar-box" style="width:196px;height:196px;max-width:100%;border-radius:28px;background:rgba(255,255,255,0.03);border:2px solid rgba(255,255,255,0.12);box-shadow:inset 0 0 24px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;flex-shrink:0">
          ${heroAvatarSvg}
        </div>

        <!-- INFORMASI DI BAWAH FOTO PROFILE -->
        <div style="width:100%;text-align:center;margin-top:14px">
          <!-- NICKNAME BESAR -->
          <div style="font-weight:900;font-size:1.35rem;color:#fff;letter-spacing:0.5px;text-shadow:0 2px 8px rgba(0,0,0,0.6)">
            ${esc(p.nick || 'Petualang')}
          </div>
          
          <!-- LEVEL & KELAS -->
          <div style="font-size:0.85rem;color:var(--c-muted);margin:4px 0 8px 0;display:flex;align-items:center;justify-content:center;gap:6px">
            <span style="color:var(--c-primary);font-weight:800;background:rgba(245,158,11,0.15);padding:2px 10px;border-radius:8px;border:1px solid rgba(245,158,11,0.3)">
              Lv. ${p.level || 1}
            </span>
            <span>·</span>
            <span style="color:#cbd5e1;font-weight:600">${esc(p.className || 'Kelas 4 SD')}</span>
          </div>

          <!-- 3 SLOTS GELAR / TITLES -->
          <div class="profile-titles-container" style="display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin:8px 0 12px 0">
            ${[0, 1, 2].map(slotIdx => {
              const t = titles[slotIdx];
              if (!t) {
                return `
                  <button type="button" class="title-pill empty" onclick="Screens.profil.showTitlePicker(${slotIdx})" title="Pasang Gelar #${slotIdx + 1}">
                    <span style="opacity:0.6">➕</span>
                    <span>Gelar #${slotIdx + 1}</span>
                  </button>
                `;
              }
              const tier = (t.tier || 'COMMON').toLowerCase();
              return `
                <button type="button" class="title-pill equipped tier-${tier}" onclick="Screens.profil.showTitlePicker(${slotIdx})" title="Ganti Gelar #${slotIdx + 1}: ${esc(t.name)}">
                  <span class="title-icon">${t.icon || '🏅'}</span>
                  <span class="title-name">${esc(t.name)}</span>
                  <span class="title-edit-hint">✎</span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- XP BAR & XP NUMBER -->
          <div style="max-width:340px;margin:0 auto">
            <div class="xp-track" style="height:8px;background:rgba(255,255,255,0.1);border-radius:99px;overflow:hidden;box-shadow:inset 0 1px 3px rgba(0,0,0,0.4)">
              <div class="xp-fill" style="width:${Math.min(100, Math.round(((p.xp || 0) / (p.xpForNext || 100)) * 100))}%;height:100%;border-radius:99px;transition:width 0.4s ease"></div>
            </div>
            <div style="font-size:0.75rem;color:var(--c-muted);margin-top:4px;display:flex;justify-content:space-between;padding:0 2px">
              <span>XP Level ${p.level || 1}</span>
              <span style="font-weight:700;color:#fcd34d">${p.xp || 0} / ${p.xpForNext || 100} XP (${Math.min(100, Math.round(((p.xp || 0) / (p.xpForNext || 100)) * 100))}%)</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- ENERGY CAPACITY CARD (v6 Fitur F.3) -->
      ${(() => {
        const energyMax = p.energyMax || (window.Progression ? Progression.energyMaxForLevel(p.level || 1) : 5);
        const nextEnergy = p.nextEnergyLevel !== undefined ? p.nextEnergyLevel : (window.Progression ? Progression.nextEnergyLevel(p.level || 1) : null);
        let energyInfoText = 'Kapasitas energi: ' + energyMax + ' ⚡ per battle';
        if (nextEnergy) {
          energyInfoText += ' — naik jadi ' + nextEnergy.energyMax + ' ⚡ di Level ' + nextEnergy.level;
        } else {
          energyInfoText += ' — Kapasitas maksimum ⚡';
        }
        return `
          <div class="card" data-testid="profile-energy-info" style="padding:12px 14px;background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.2);border-radius:14px;display:flex;align-items:center;gap:10px;margin-top:10px">
            <span style="font-size:1.4rem">⚡</span>
            <div style="font-size:0.82rem;color:#e2e8f0;line-height:1.4">
              <strong style="color:#38bdf8">${energyInfoText}</strong>
            </div>
          </div>
        `;
      })()}

      <!-- SHOWCASE 3 LENCANA / GELAR -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin:14px 4px 6px 4px">
        <h3 style="font-size:0.95rem;margin:0;color:var(--c-muted)">✨ Panggung Kehormatan (Showcase 3 Slot)</h3>
        <span style="font-size:0.75rem;color:var(--c-primary);font-weight:700">Sentuh untuk ganti</span>
      </div>
      <div class="showcase-grid">
        ${[0, 1, 2].map(slotIdx => {
          const item = showcase[slotIdx];
          if (!item) {
            return `
              <div class="showcase-slot empty" data-slot="${slotIdx}" onclick="Screens.profil.showShowcasePicker(${slotIdx})">
                <div style="font-size:1.5rem;opacity:0.4">➕</div>
                <div style="font-size:0.72rem;font-weight:700;margin-top:4px">Slot #${slotIdx + 1}</div>
                <div style="font-size:0.62rem;opacity:0.6">Pasang Lencana</div>
              </div>
            `;
          }
          const tierClass = item.tier ? `tier-${item.tier.toLowerCase()}` : 'tier-common';
          const tierColor = item.tier === 'LEGEND' ? '#c084fc' : (item.tier === 'EPIC' ? '#fbbf24' : (item.tier === 'RARE' ? '#38bdf8' : '#f59e0b'));
          const badgeArtSvg = (window.BadgeArt && typeof window.BadgeArt.renderBadge === 'function')
            ? BadgeArt.renderBadge(item.id || item.familyId, item.tier || 'COMMON', { size: 54, title: item.name })
            : `<div style="font-size:1.8rem;line-height:1.2">${item.icon || '🏅'}</div>`;
          return `
            <div class="showcase-slot ${tierClass}" data-slot="${slotIdx}" onclick="Screens.profil.showShowcasePicker(${slotIdx})">
              <div style="display:flex;align-items:center;justify-content:center;height:56px">${badgeArtSvg}</div>
              <div style="font-size:0.78rem;font-weight:800;color:#fff;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:95%">${esc(item.name)}</div>
              <div style="font-size:0.62rem;font-weight:700;color:${tierColor};text-transform:uppercase">${esc(item.tier || 'BADGE')}</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- STATS GRID LENGKAP (BINTANG DAN KOMBO DIPISAH) -->
      <h3 style="font-size:0.95rem;margin:16px 0 6px 4px;color:var(--c-muted)">📊 Statistik Petualangan Lengkap</h3>
      <div class="profile-stat-grid">
        <div class="profile-stat-box">
          <span class="stat-icon">⚔️</span>
          <span class="stat-val">${stats.bossDefeated || 0}</span>
          <span class="stat-label">Bos Dikalahkan</span>
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
        <div class="profile-stat-box" title="${stats.correctCount || 0} Benar dari ${stats.totalQuestions || 0} Soal Dijawab">
          <span class="stat-icon">🎯</span>
          <span class="stat-val">${stats.accuracy || 0}%</span>
          <span class="stat-label">Akurasi Jawaban</span>
        </div>
        <div class="profile-stat-box" title="${stats.bossDefeated || 0} Menang dari ${stats.totalSessions || 0} Sesi Dimainkan">
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
        <div class="profile-stat-box" title="${stats.dexDefeated || 0} Bos Dikalahkan · ${stats.dexEncountered || 0} Ditemui dari ${stats.totalMonsters || 100} Monster">
          <span class="stat-icon">📖</span>
          <span class="stat-val">${stats.dexDefeated || 0} / ${stats.totalMonsters || 100}</span>
          <span class="stat-label">Monster Dex</span>
        </div>
        <div class="profile-stat-box" title="${stats.activeDays || p.dayStreak || 1} Hari Belajar · Streak ${p.dayStreak || stats.dayStreak || 1} Hari Beruntun">
          <span class="stat-icon">📅</span>
          <span class="stat-val">${stats.activeDays || p.dayStreak || 1} Hari</span>
          <span class="stat-label">Hari Belajar</span>
        </div>
      </div>

      <!-- SHORTCUT MENU KE RIWAYAT PERTEMPURAN -->
      <div style="margin:12px 0 6px 0">
        <button type="button" class="btn small primary" style="width:100%;padding:10px 14px;border-radius:12px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg, rgba(245,158,11,0.2), rgba(234,179,8,0.1));border:1px solid rgba(245,158,11,0.4);box-shadow:0 4px 12px rgba(0,0,0,0.25);cursor:pointer" onclick="Screens.profil.switchToBattleHistory()">
          <span style="display:flex;align-items:center;gap:8px">
            <span style="font-size:1.2rem">⚔️</span>
            <span style="text-align:left">
              <strong style="display:block;color:#fef08a;font-size:0.86rem">Riwayat Pertempuran & Tracing Skor</strong>
              <small style="color:#94a3b8;font-size:0.72rem">Lihat ID Battle, akurasi soal, dan bintang per game</small>
            </span>
          </span>
          <span style="font-size:0.88rem;color:#f59e0b;font-weight:800">Buka ➔</span>
        </button>
      </div>

      <!-- LENCANA PRESTASI 20 KATEGORI x 4 TIER -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin:18px 4px 6px 4px;flex-wrap:wrap;gap:6px">
        <div>
          <h3 style="font-size:0.95rem;margin:0;color:var(--c-muted)">🏅 Lencana Prestasi (${badgeSummary.totalUnlocked || 0} / ${badgeSummary.totalBadges || 80} Terbuka)</h3>
          ${(badgeSummary.unclaimedCount > 0) ? `<div style="font-size:0.75rem;color:#fde047;font-weight:700;margin-top:2px">🎁 Ada ${badgeSummary.unclaimedCount} hadiah lencana siap diklaim!</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          ${(badgeSummary.unclaimedCount > 0) ? `
            <button class="btn small primary" onclick="event.stopPropagation(); Screens.profil.claimAllBadges()" style="background:linear-gradient(135deg, #f59e0b, #eab308);color:#000;font-weight:800;font-size:0.75rem;padding:4px 10px;border-radius:8px;box-shadow:0 0 10px rgba(245,158,11,0.5);border:none;cursor:pointer">
              🎁 Klaim Semua (${badgeSummary.unclaimedCount})
            </button>
          ` : ''}
          <span style="font-size:0.75rem;color:var(--c-muted)">Sentuh kartu untuk rincian</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr;gap:8px">
        ${(badgeFamilies || []).map(f => {
          const highest = f.highestTierInfo;
          const nextTier = f.tiers.find(t => !t.unlocked) || f.tiers[f.tiers.length - 1];
          const isMax = f.unlockedCount === 4;
          return `
            <div class="badge-family-card" onclick="Screens.profil.showBadgeFamilyDetailModal('${f.id}')">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
                <div style="display:flex;align-items:center;gap:10px;min-width:0">
                  <div class="badge-icon-btn" onclick="event.stopPropagation(); Screens.profil.showBadgeDetailModal('${f.id}', '${highest ? f.highestTier : 'COMMON'}')" title="Klik untuk melihat detail lencana" style="width:46px;height:46px;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;position:relative">
                    ${(window.BadgeArt && typeof window.BadgeArt.renderBadge === 'function')
                      ? (highest
                          ? BadgeArt.renderBadge(f.id, f.highestTier, { size: 46, title: f.name })
                          : BadgeArt.renderBadge(f.id, 'common', { size: 46, locked: true, title: f.name }))
                      : `<div style="font-size:1.8rem;width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.06);border-radius:10px">${highest ? highest.icon : '🔒'}</div>`
                    }
                    <span style="position:absolute;bottom:-2px;right:-2px;background:rgba(0,0,0,0.85);border-radius:99px;font-size:0.6rem;padding:1px 4px;border:1px solid rgba(255,255,255,0.25);line-height:1">🔍</span>
                  </div>
                  <div style="min-width:0">
                    <div style="display:flex;align-items:center;gap:6px">
                      <span style="font-weight:800;font-size:0.88rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(f.name)}</span>
                      ${(f.unclaimedCount > 0) ? `<span class="badge" style="background:#f59e0b;color:#000;font-size:0.62rem;font-weight:800;padding:1px 6px;border-radius:99px">🎁 ${f.unclaimedCount} Hadiah</span>` : ''}
                    </div>
                    <div style="font-size:0.72rem;color:var(--c-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                      ${highest ? `<strong style="color:${highest.color}">${highest.label}: ${esc(f.tiers.find(t => t.tier === f.highestTier)?.name || '')}</strong>` : 'Terkunci'}
                    </div>
                  </div>
                </div>
                <div style="text-align:right;flex-shrink:0">
                  <span class="badge" style="background:${highest ? highest.color : '#475569'};color:#fff;font-size:0.68rem;padding:2px 8px;border-radius:6px;font-weight:800">
                    ${f.unlockedCount} / 4 Tier
                  </span>
                  <div style="font-size:0.68rem;color:var(--c-muted);margin-top:2px">
                    ${isMax ? '⭐ MAX' : `${f.current} / ${nextTier.target} ${f.unit || ''}`}
                  </div>
                  ${(f.unclaimedCount > 0) ? `
                    <div style="margin-top:4px">
                      <button type="button" class="btn small primary" onclick="event.stopPropagation(); Screens.profil.claimFamilyFirstUnclaimed('${f.id}')" style="background:linear-gradient(135deg, #f59e0b, #d97706);color:#000;font-weight:800;font-size:0.65rem;padding:2px 8px;border-radius:6px;border:none;box-shadow:0 0 8px rgba(245,158,11,0.45);cursor:pointer">
                        🎁 Klaim
                      </button>
                    </div>
                  ` : ''}
                </div>
              </div>
              <div class="xp-track" style="height:4px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;margin-top:4px">
                <div class="xp-fill" style="width:${isMax ? 100 : (nextTier ? nextTier.pct : 0)}%;background:${highest ? highest.color : 'var(--c-primary)'}"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  showShowcasePicker(slotIdx) {
    if (window.Sfx) Sfx.play('tap');
    const pData = (this && this.profileData) || Screens.profil.profileData || {};
    let unlockedBadges = (pData.unlockedList || pData.badges || []).slice();

    // Fallback layer 1: if empty, extract from badgeFamilies
    if (unlockedBadges.length === 0 && pData.badgeFamilies) {
      for (const fam of pData.badgeFamilies) {
        for (const tr of (fam.tiers || [])) {
          if (tr.unlocked) {
            unlockedBadges.push({
              id: `${fam.id}_${tr.tier.toLowerCase()}`,
              familyId: fam.id,
              familyName: fam.name,
              tier: tr.tier,
              name: tr.name,
              icon: tr.icon,
              desc: tr.desc || '',
              lore: tr.lore || '',
              reward: tr.reward || '',
              category: fam.category,
              tierInfo: tr.tierInfo || (window.Badges?.TIERS ? window.Badges.TIERS[tr.tier] : null)
            });
          }
        }
      }
    }

    // Fallback layer 2: if still empty, evaluate from stats using window.Badges
    if (unlockedBadges.length === 0 && window.Badges && typeof window.Badges.evaluateBadges === 'function') {
      const stats = pData.stats || {};
      const evalRes = window.Badges.evaluateBadges(stats);
      if (evalRes && evalRes.unlockedList && evalRes.unlockedList.length > 0) {
        unlockedBadges = evalRes.unlockedList.slice();
      }
    }

    const currentShowcase = [...(pData.showcase || [null, null, null])];
    while (currentShowcase.length < 3) currentShowcase.push(null);
    const currentItem = currentShowcase[slotIdx];

    const modalId = 'modal-showcase-picker';
    const oldModal = document.getElementById(modalId);
    if (oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.className = 'confirm-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease;';

    let badgesHtml = '';
    if (unlockedBadges.length === 0) {
      badgesHtml = '<div style="text-align:center;color:var(--c-muted);padding:24px 10px;font-size:0.85rem">Belum ada lencana yang terbuka. Terus bertualang untuk membuka lencana prestasimu!</div>';
    } else {
      badgesHtml = `
        <div style="display:grid;grid-template-columns:1fr;gap:8px;max-height:48dvh;overflow-y:auto;padding-right:4px;">
          ${unlockedBadges.map(b => {
            const isEquippedInSlot = currentItem && currentItem.id === b.id;
            const isEquippedOther = !isEquippedInSlot && currentShowcase.some(it => it && it.id === b.id);
            return `
              <div class="showcase-pick-row" data-badge-id="${esc(b.id)}" style="padding:10px 12px;background:var(--c-surface);border:1.5px solid ${isEquippedInSlot ? 'var(--c-primary)' : 'rgba(255,255,255,0.12)'};border-radius:12px;display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;transition:transform 0.12s ease, border-color 0.12s ease, background 0.12s ease">
                <div style="display:flex;align-items:center;gap:10px;min-width:0;pointer-events:none">
                  <div style="width:46px;height:46px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                    ${(window.BadgeArt && typeof window.BadgeArt.renderBadge === 'function')
                      ? BadgeArt.renderBadge(b.id || b.familyId, b.tier || 'COMMON', { size: 46, title: b.name })
                      : `<span style="font-size:1.8rem;line-height:1">${b.icon || '🏅'}</span>`
                    }
                  </div>
                  <div style="min-width:0">
                    <div style="font-weight:800;font-size:0.88rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(b.name)}</div>
                    <div style="font-size:0.7rem;color:${b.tierInfo ? b.tierInfo.color : '#f59e0b'};font-weight:700">${b.tier || 'COMMON'} · ${esc(b.familyName || '')}</div>
                  </div>
                </div>
                <div>
                  ${isEquippedInSlot
                    ? '<span class="badge small" style="background:#10b981;color:#fff;font-size:0.7rem;padding:4px 10px;border-radius:6px;font-weight:700">Terpasang ✓</span>'
                    : `<button type="button" class="btn primary small btn-pick-badge" data-badge-id="${esc(b.id)}" style="padding:4px 12px;font-size:0.75rem">${isEquippedOther ? 'Pindah' : 'Pilih'}</button>`
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    overlay.innerHTML = `
      <div class="confirm-card stack" style="width:min(440px,96vw);max-height:85dvh;background:#0f172a;border:1px solid rgba(255,255,255,0.15);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:12px;box-shadow:0 12px 36px rgba(0,0,0,0.7)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <h3 style="margin:0;font-size:1.05rem;color:#fff;font-weight:800">✨ Pasang di Showcase Slot #${slotIdx + 1}</h3>
            <div style="font-size:0.72rem;color:var(--c-muted);margin-top:2px">Pilih lencana prestasi untuk dipajang di profilmu</div>
          </div>
          <button type="button" class="btn ghost small" id="btn-close-showcase" style="font-size:1.2rem;padding:2px 8px">✕</button>
        </div>

        ${badgesHtml}

        <div style="display:flex;gap:8px;margin-top:4px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08)">
          ${currentItem ? `<button type="button" class="btn danger small grow" id="btn-clear-slot" style="font-size:0.8rem">Kosongkan Slot</button>` : ''}
          <button type="button" class="btn ghost small grow" id="btn-cancel-showcase" style="font-size:0.8rem">Tutup</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };
    overlay.querySelector('#btn-close-showcase').onclick = close;
    overlay.querySelector('#btn-cancel-showcase').onclick = close;

    const clearBtn = overlay.querySelector('#btn-clear-slot');
    if (clearBtn) {
      clearBtn.onclick = async () => {
        close();
        await Screens.profil.saveShowcaseItem(slotIdx, null);
      };
    }

    const selectBadgeById = async (badgeId) => {
      const badgeItem = unlockedBadges.find(x => x.id === badgeId);
      if (badgeItem) {
        if (window.Sfx) Sfx.play('tap');
        close();
        await Screens.profil.saveShowcaseItem(slotIdx, badgeItem);
      }
    };

    overlay.querySelectorAll('.showcase-pick-row').forEach(row => {
      row.onclick = async () => {
        await selectBadgeById(row.dataset.badgeId);
      };
    });

    overlay.querySelectorAll('.btn-pick-badge').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        await selectBadgeById(btn.dataset.badgeId);
      };
    });
  },

  async saveShowcaseItem(slotIdx, item) {
    const pData = (this && this.profileData) || Screens.profil.profileData || (Screens.profil.profileData = {});
    const current = [...(pData.showcase || [null, null, null])];
    while (current.length < 3) current.push(null);

    // If item was in another slot, remove it from other slot
    if (item && item.id) {
      for (let i = 0; i < current.length; i++) {
        if (i !== slotIdx && current[i] && current[i].id === item.id) {
          current[i] = null;
        }
      }
    }

    current[slotIdx] = item ? {
      id: item.id,
      familyId: item.familyId || item.id.replace(/_(common|rare|epic|legend)$/i, ''),
      name: item.name,
      icon: item.icon || '🏅',
      tier: item.tier || 'COMMON',
      type: 'badge',
      desc: item.desc || ''
    } : null;

    try {
      const res = await API.req('/api/profile/showcase', {
        method: 'POST',
        body: JSON.stringify({ showcase: current })
      });
      if (res && res.ok) {
        const updatedShowcase = res.showcase || current;
        pData.showcase = updatedShowcase;
        if (Screens.profil.profileData) {
          Screens.profil.profileData.showcase = updatedShowcase;
        }
        if (this && this.profileData) {
          this.profileData.showcase = updatedShowcase;
        }
        const contentSlot = document.getElementById('profile-tab-content');
        if (contentSlot && Screens.profil.activeTab === 'ringkasan') {
          Screens.profil.renderTabRingkasan(contentSlot);
        }
        if (window.Sfx) Sfx.play('win');
        toast('Showcase berhasil diperbarui! ✨');
      }
    } catch (e) {
      console.error('Failed to save showcase:', e);
      toast('Gagal memperbarui showcase: ' + (e.message || 'Kesalahan jaringan'), 'error');
    }
  },

  async removeShowcaseItem(slotIdx) {
    return this.saveShowcaseItem(slotIdx, null);
  },

  showTitlePicker(slotIdx) {
    if (window.Sfx) Sfx.play('tap');
    const pData = (this && this.profileData) || Screens.profil.profileData || {};

    let availableTitles = [];
    if (Array.isArray(pData.ownedTitles) && pData.ownedTitles.length > 0) {
      availableTitles = pData.ownedTitles.slice();
    } else {
      availableTitles.push({
        id: 'title_rookie',
        name: 'Pelajar Pemula',
        icon: '🥉',
        tier: 'COMMON',
        source: 'skin',
        desc: 'Langkah awal yang penuh rasa ingin tahu.'
      });
      const unlockedBadges = (pData.unlockedList || pData.badges || []).slice();
      for (const b of unlockedBadges) {
        availableTitles.push({
          id: b.id,
          name: b.name,
          icon: b.icon || '🏅',
          tier: b.tier || 'COMMON',
          source: 'badge',
          desc: `${b.familyName || ''} · ${b.tier || 'COMMON'}`
        });
      }
    }

    if (!availableTitles.some(t => t.id === 'title_rookie')) {
      availableTitles.unshift({
        id: 'title_rookie',
        name: 'Pelajar Pemula',
        icon: '🥉',
        tier: 'COMMON',
        source: 'skin',
        desc: 'Langkah awal yang penuh rasa ingin tahu.'
      });
    }

    const currentTitles = [...(pData.titles || [null, null, null])];
    while (currentTitles.length < 3) currentTitles.push(null);
    const currentItem = currentTitles[slotIdx];

    const modalId = 'modal-title-picker';
    const oldModal = document.getElementById(modalId);
    if (oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.className = 'confirm-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease;';

    const renderList = (filter, search) => {
      let list = availableTitles;
      if (filter === 'badge') list = list.filter(t => t.source === 'badge');
      else if (filter === 'skin') list = list.filter(t => t.source === 'skin');

      if (search) {
        const q = search.toLowerCase();
        list = list.filter(t => t.name.toLowerCase().includes(q) || (t.desc && t.desc.toLowerCase().includes(q)));
      }

      if (list.length === 0) {
        return '<div style="text-align:center;color:var(--c-muted);padding:24px 10px;font-size:0.85rem">Tidak ada gelar yang cocok dengan pencarian / kategori ini.</div>';
      }

      return list.map(t => {
        const isEquippedInSlot = currentItem && currentItem.id === t.id;
        const isEquippedOther = !isEquippedInSlot && currentTitles.some(it => it && it.id === t.id);
        const tier = (t.tier || 'COMMON').toUpperCase();
        const tierColor = tier === 'LEGEND' ? '#c084fc' : (tier === 'EPIC' ? '#fbbf24' : (tier === 'RARE' ? '#38bdf8' : '#f59e0b'));
        const sourceLabel = t.source === 'skin' ? '🎒 Skin Gelar' : '🏅 Lencana Prestasi';

        return `
          <div class="title-pick-row" data-title-id="${esc(t.id)}" style="padding:10px 12px;background:var(--c-surface);border:1.5px solid ${isEquippedInSlot ? 'var(--c-primary)' : 'rgba(255,255,255,0.12)'};border-radius:12px;display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;transition:transform 0.12s ease, border-color 0.12s ease, background 0.12s ease">
            <div style="display:flex;align-items:center;gap:10px;min-width:0;pointer-events:none">
              <div style="width:42px;height:42px;border-radius:10px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0">
                ${t.icon || '🏅'}
              </div>
              <div style="min-width:0">
                <div style="font-weight:800;font-size:0.88rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.name)}</div>
                <div style="font-size:0.7rem;color:${tierColor};font-weight:700">
                  ${sourceLabel} · ${tier}
                </div>
              </div>
            </div>
            <div>
              ${isEquippedInSlot
                ? '<span class="badge small" style="background:#10b981;color:#fff;font-size:0.7rem;padding:4px 10px;border-radius:6px;font-weight:700">Terpasang ✓</span>'
                : `<button type="button" class="btn primary small btn-pick-title" data-title-id="${esc(t.id)}" style="padding:4px 12px;font-size:0.75rem">${isEquippedOther ? 'Pindah' : 'Pilih'}</button>`
              }
            </div>
          </div>
        `;
      }).join('');
    };

    let activeFilter = 'all';
    let searchQuery = '';

    const badgeCount = availableTitles.filter(t => t.source === 'badge').length;
    const skinCount = availableTitles.filter(t => t.source === 'skin').length;

    overlay.innerHTML = `
      <div class="confirm-card stack" style="width:min(440px,96vw);max-height:86dvh;background:#0f172a;border:1px solid rgba(255,255,255,0.15);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:12px;box-shadow:0 12px 36px rgba(0,0,0,0.7)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <h3 style="margin:0;font-size:1.05rem;color:#fff;font-weight:800">✨ Pasang Gelar #${slotIdx + 1}</h3>
            <div style="font-size:0.72rem;color:var(--c-muted);margin-top:2px">Sematkan gelar lencana atau skin di samping avatarmu</div>
          </div>
          <button type="button" class="btn ghost small" id="btn-close-title-picker" style="font-size:1.2rem;padding:2px 8px">✕</button>
        </div>

        <!-- SEARCH BAR & FILTER TABS -->
        <div style="display:flex;flex-direction:column;gap:8px">
          <input type="text" id="title-search-input" placeholder="🔍 Cari nama gelar..." style="width:100%;padding:8px 12px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#fff;font-size:0.82rem;outline:none">
          <div style="display:flex;gap:6px">
            <button type="button" class="btn small title-filter-btn" data-filter="all" style="flex:1;padding:5px 8px;font-size:0.72rem;background:var(--c-primary);color:#fff">Semua (${availableTitles.length})</button>
            <button type="button" class="btn ghost small title-filter-btn" data-filter="badge" style="flex:1;padding:5px 8px;font-size:0.72rem">🏅 Lencana (${badgeCount})</button>
            <button type="button" class="btn ghost small title-filter-btn" data-filter="skin" style="flex:1;padding:5px 8px;font-size:0.72rem">🎒 Skin (${skinCount})</button>
          </div>
        </div>

        <!-- TITLE LIST -->
        <div id="title-picker-list" style="display:grid;grid-template-columns:1fr;gap:8px;max-height:45dvh;overflow-y:auto;padding-right:4px;">
          ${renderList('all', '')}
        </div>

        <!-- FOOTER ACTIONS -->
        <div style="display:flex;gap:8px;margin-top:4px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08)">
          ${currentItem ? `<button type="button" class="btn danger small grow" id="btn-clear-title-slot" style="font-size:0.8rem">Kosongkan Slot #${slotIdx + 1}</button>` : ''}
          <button type="button" class="btn ghost small grow" id="btn-cancel-title-picker" style="font-size:0.8rem">Tutup</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };
    overlay.querySelector('#btn-close-title-picker').onclick = close;
    overlay.querySelector('#btn-cancel-title-picker').onclick = close;

    const clearBtn = overlay.querySelector('#btn-clear-title-slot');
    if (clearBtn) {
      clearBtn.onclick = async () => {
        close();
        await Screens.profil.saveTitleItem(slotIdx, null);
      };
    }

    const listContainer = overlay.querySelector('#title-picker-list');

    const selectTitleById = async (titleId) => {
      const selected = availableTitles.find(x => x.id === titleId);
      if (selected) {
        if (window.Sfx) Sfx.play('tap');
        close();
        await Screens.profil.saveTitleItem(slotIdx, selected);
      }
    };

    const attachListEvents = () => {
      listContainer.querySelectorAll('.title-pick-row').forEach(row => {
        row.onclick = async () => {
          await selectTitleById(row.dataset.titleId);
        };
      });
      listContainer.querySelectorAll('.btn-pick-title').forEach(btn => {
        btn.onclick = async (e) => {
          e.stopPropagation();
          await selectTitleById(btn.dataset.titleId);
        };
      });
    };

    attachListEvents();

    overlay.querySelectorAll('.title-filter-btn').forEach(btn => {
      btn.onclick = () => {
        overlay.querySelectorAll('.title-filter-btn').forEach(b => {
          b.className = 'btn ghost small title-filter-btn';
          b.style.background = '';
          b.style.color = '';
        });
        btn.className = 'btn small title-filter-btn';
        btn.style.background = 'var(--c-primary)';
        btn.style.color = '#fff';
        activeFilter = btn.dataset.filter;
        listContainer.innerHTML = renderList(activeFilter, searchQuery);
        attachListEvents();
      };
    });

    const searchInput = overlay.querySelector('#title-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = (e.target.value || '').trim();
        listContainer.innerHTML = renderList(activeFilter, searchQuery);
        attachListEvents();
      };
    }
  },

  async saveTitleItem(slotIdx, item) {
    const pData = (this && this.profileData) || Screens.profil.profileData || (Screens.profil.profileData = {});
    const current = [...(pData.titles || [null, null, null])];
    while (current.length < 3) current.push(null);

    // If item was equipped in another slot, clear it from that slot (move)
    if (item && item.id) {
      for (let i = 0; i < current.length; i++) {
        if (i !== slotIdx && current[i] && current[i].id === item.id) {
          current[i] = null;
        }
      }
    }

    current[slotIdx] = item ? {
      id: item.id,
      name: item.name,
      icon: item.icon || '🏅',
      tier: item.tier || 'COMMON',
      source: item.source || 'badge',
      desc: item.desc || ''
    } : null;

    try {
      const res = await API.req('/api/profile/titles', {
        method: 'POST',
        body: JSON.stringify({ titles: current })
      });
      if (res && res.ok) {
        const updatedTitles = res.titles || current;
        pData.titles = updatedTitles;
        if (res.title) {
          if (pData.player) pData.player.title = res.title;
          if (window.Player && Player.data) Player.data.title = res.title;
        }
        if (Screens.profil.profileData) {
          Screens.profil.profileData.titles = updatedTitles;
          if (res.title && Screens.profil.profileData.player) {
            Screens.profil.profileData.player.title = res.title;
          }
        }
        if (this && this.profileData) {
          this.profileData.titles = updatedTitles;
          if (res.title && this.profileData.player) {
            this.profileData.player.title = res.title;
          }
        }
        const contentSlot = document.getElementById('profile-tab-content');
        if (contentSlot && Screens.profil.activeTab === 'ringkasan') {
          Screens.profil.renderTabRingkasan(contentSlot);
        }
        if (window.Sfx) Sfx.play('win');
        toast('Gelar berhasil dipasang! ✨');
      }
    } catch (e) {
      console.error('Failed to save titles:', e);
      toast('Gagal memperbarui gelar: ' + (e.message || 'Kesalahan jaringan'), 'error');
    }
  },

  async removeTitleItem(slotIdx) {
    return this.saveTitleItem(slotIdx, null);
  },

  applyClaimRewardUpdates(res) {
    if (!res) return;
    const newCoins = res.newCoins;
    const newXp = res.newXp;
    const newLevel = res.newLevel;

    // 1. Update Player global store
    if (window.Player) {
      if (!Player.data) Player.data = {};
      if (newCoins !== undefined) Player.data.coins = newCoins;
      if (newXp !== undefined) Player.data.xp = newXp;
      if (newLevel !== undefined) Player.data.level = newLevel;
    }

    // 2. Update Screens.profil profileData store
    if (this.profileData && this.profileData.player) {
      if (newCoins !== undefined) this.profileData.player.coins = newCoins;
      if (newXp !== undefined) this.profileData.player.xp = newXp;
      if (newLevel !== undefined) {
        this.profileData.player.level = newLevel;
        this.profileData.player.xpForNext = newLevel * newLevel * 50;
      }
    }

    // 3. Mark badge as claimed locally in profileData.claimedBadgeIds
    if (res.badgeId) {
      if (!this.profileData) this.profileData = {};
      if (!this.profileData.claimedBadgeIds) this.profileData.claimedBadgeIds = [];
      if (!this.profileData.claimedBadgeIds.includes(res.badgeId)) {
        this.profileData.claimedBadgeIds.push(res.badgeId);
      }
    } else if (res.claimedIds && Array.isArray(res.claimedIds)) {
      if (!this.profileData) this.profileData = {};
      if (!this.profileData.claimedBadgeIds) this.profileData.claimedBadgeIds = [];
      res.claimedIds.forEach(id => {
        if (!this.profileData.claimedBadgeIds.includes(id)) {
          this.profileData.claimedBadgeIds.push(id);
        }
      });
    }

    // 4. Update DOM Elements live
    if (newCoins !== undefined) {
      const profCoinEl = document.getElementById('prof-coins-val');
      if (profCoinEl) profCoinEl.textContent = newCoins;
      const hdrCoinEl = document.getElementById('hdr-coins');
      if (hdrCoinEl) hdrCoinEl.textContent = newCoins;
      document.querySelectorAll('.coins-val').forEach(el => {
        el.textContent = newCoins;
      });
      // Flash / scale effect on coin chip
      const coinChip = document.getElementById('prof-coin-chip');
      if (coinChip) {
        coinChip.style.transition = 'transform 0.25s ease, box-shadow 0.25s ease';
        coinChip.style.transform = 'scale(1.15)';
        coinChip.style.boxShadow = '0 0 16px #f59e0b';
        setTimeout(() => {
          coinChip.style.transform = 'scale(1)';
          coinChip.style.boxShadow = '';
        }, 400);
      }
    }

    // 5. Update Hero Card XP bar and text if present
    if (this.profileData?.player) {
      const p = this.profileData.player;
      const xpFill = document.querySelector('#profile-view .xp-track .xp-fill');
      if (xpFill && p.xpForNext) {
        xpFill.style.width = `${Math.min(100, Math.round(((p.xp || 0) / p.xpForNext) * 100))}%`;
      }
    }
  },

  showClaimCelebrationModal(opts) {
    const {
      isBulk = false,
      count = 1,
      badgeName = '',
      badgeId = '',
      tier = 'COMMON',
      familyId = '',
      coinsAwarded = 0,
      xpAwarded = 0,
      itemAwarded = null,
      itemsAwarded = [],
      titleAwarded = null,
      titlesAwarded = [],
      newCoins = 0,
      newXp = 0,
      newLevel = 1,
      isLevelUp = false,
      onClose = null
    } = opts;

    if (window.Sfx) {
      Sfx.play('coin');
      setTimeout(() => Sfx.play('win'), 160);
    }

    const modalId = 'modal-claim-celebration';
    const oldModal = document.getElementById(modalId);
    if (oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.className = 'confirm-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(3,7,18,0.88);backdrop-filter:blur(10px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.25s ease;';

    const cleanTier = (tier || 'COMMON').toUpperCase();
    const tierColor = cleanTier === 'LEGEND' ? '#fbbf24' : (cleanTier === 'EPIC' ? '#c084fc' : (cleanTier === 'RARE' ? '#38bdf8' : '#10b981'));

    // SVG icon / badge art
    let badgeSvg = '';
    if (isBulk) {
      badgeSvg = `
        <div style="font-size:4.6rem;line-height:1;filter:drop-shadow(0 8px 26px rgba(245,158,11,0.8));animation:victoryBounce 1.5s ease-in-out infinite">
          🏆✨
        </div>
      `;
    } else if (window.BadgeArt && typeof window.BadgeArt.renderBadge === 'function' && familyId) {
      badgeSvg = `
        <div style="filter:drop-shadow(0 10px 28px ${tierColor}95);animation:victoryBounce 1.5s ease-in-out infinite">
          ${BadgeArt.renderBadge(familyId, cleanTier, { size: 106, title: badgeName })}
        </div>
      `;
    } else {
      badgeSvg = `
        <div style="font-size:4.6rem;line-height:1;filter:drop-shadow(0 8px 24px rgba(245,158,11,0.8));animation:victoryBounce 1.5s ease-in-out infinite">
          🏅
        </div>
      `;
    }

    const ITEM_NAMES = {
      pet_dragon: 'Pet Eksklusif: Naga Penjelajah 🐉',
      pet_phoenix: 'Pet Eksklusif: Burung Phoenix Api 🦅🔥',
      frame_supernova: 'Bingkai Avatar: Supernova Legend 🌌'
    };

    // Format all items awarded
    const allItems = [];
    if (itemAwarded) allItems.push(ITEM_NAMES[itemAwarded] || itemAwarded);
    if (Array.isArray(itemsAwarded)) {
      itemsAwarded.forEach(it => {
        const str = ITEM_NAMES[it] || it;
        if (!allItems.includes(str)) allItems.push(str);
      });
    }

    // Format all titles awarded
    const allTitles = [];
    if (titleAwarded) allTitles.push(titleAwarded);
    if (Array.isArray(titlesAwarded)) {
      titlesAwarded.forEach(tt => { if (!allTitles.includes(tt)) allTitles.push(tt); });
    }

    overlay.innerHTML = `
      <!-- Confetti Particles Container -->
      <div class="confetti-container" style="position:absolute;inset:0;pointer-events:none;overflow:hidden">
        ${Array.from({ length: 34 }).map((_, i) => {
          const left = Math.random() * 100;
          const dur = 1.5 + Math.random() * 1.5;
          const delay = Math.random() * 0.7;
          const colors = ['#f59e0b', '#fbbf24', '#38bdf8', '#c084fc', '#10b981', '#f43f5e', '#ffffff'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          const size = 6 + Math.random() * 8;
          return `<div style="position:absolute;top:-20px;left:${left}%;width:${size}px;height:${size}px;background:${color};border-radius:${Math.random() > 0.4 ? '50%' : '2px'};box-shadow:0 0 8px ${color};animation:confettiFall ${dur}s ease-out ${delay}s infinite"></div>`;
        }).join('')}
      </div>

      <!-- Main Celebration Card -->
      <div class="card" style="max-width:440px;width:100%;text-align:center;padding:26px 20px;border-radius:24px;background:linear-gradient(135deg, rgba(30,41,59,0.98), rgba(15,23,42,0.99));border:2px solid #f59e0b;box-shadow:0 0 50px rgba(245,158,11,0.45), 0 24px 48px rgba(0,0,0,0.85);position:relative;overflow:hidden;animation:itemPopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards">
        
        <!-- Rotating radiant sunburst background -->
        <div class="chest-rays" style="position:absolute;top:28%;left:50%;transform:translate(-50%,-50%);width:340px;height:340px;background:radial-gradient(circle, rgba(245,158,11,0.3) 0%, rgba(245,158,11,0.08) 50%, transparent 70%);border-radius:50%;pointer-events:none;animation:chestRaysSpin 8s linear infinite"></div>

        <div style="position:relative;z-index:2">
          <!-- Eyebrow Banner -->
          <div style="font-size:0.75rem;font-weight:900;letter-spacing:1.5px;color:#f59e0b;text-transform:uppercase;text-shadow:0 0 14px rgba(245,158,11,0.8);margin-bottom:6px">
            ${isBulk ? '👑 KLAIM SEMUA PRESTASI BERHASIL! 👑' : '🎉 HADIAH PRESTASI BERHASIL DIKLAIM! 🎉'}
          </div>

          <!-- Title / Badge Name -->
          <h2 style="font-size:1.35rem;font-weight:900;color:#fff;margin:0 0 8px 0;text-shadow:0 2px 10px rgba(0,0,0,0.8)">
            ${isBulk ? `${count} Hadiah Lencana Dibuka!` : esc(badgeName || 'Lencana Prestise')}
          </h2>

          <!-- Badge Icon Spotlight -->
          <div style="display:flex;align-items:center;justify-content:center;padding:6px 0 12px 0">
            ${badgeSvg}
          </div>

          ${!isBulk && cleanTier ? `
            <div style="margin-top:-6px;margin-bottom:12px">
              <span class="badge" style="background:${tierColor};color:#000;font-size:0.75rem;font-weight:900;padding:3px 12px;border-radius:99px;text-transform:uppercase;box-shadow:0 0 12px ${tierColor}80">
                TIER ${cleanTier}
              </span>
            </div>
          ` : ''}

          ${isLevelUp ? `
            <div style="background:linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.3));border:1.5px solid #10b981;border-radius:14px;padding:9px 12px;margin-bottom:10px;text-align:center;box-shadow:0 0 20px rgba(16,185,129,0.4)">
              <div style="font-size:0.72rem;font-weight:900;color:#34d399;text-transform:uppercase;letter-spacing:1px">
                🆙 LEVEL UP!
              </div>
              <div style="font-size:0.95rem;font-weight:800;color:#fff;margin-top:2px">
                Selamat! Kamu naik ke Level <span style="color:#6ee7b7">${newLevel}</span>!
              </div>
            </div>
          ` : ''}

          <!-- REWARDS DISPLAY TILES (COINS & XP) -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0 12px 0">
            <!-- COIN REWARD CARD -->
            <div style="background:linear-gradient(135deg, rgba(245,158,11,0.18), rgba(217,119,6,0.28));border:1.5px solid #f59e0b;border-radius:16px;padding:12px 10px;display:flex;flex-direction:column;align-items:center;box-shadow:0 4px 16px rgba(245,158,11,0.25)">
              <div style="font-size:1.6rem;line-height:1;margin-bottom:4px">🪙</div>
              <div id="claim-anim-coins" style="font-size:1.25rem;font-weight:900;color:#fde047;text-shadow:0 2px 8px rgba(0,0,0,0.7)">
                +${Number(coinsAwarded || 0).toLocaleString()}
              </div>
              <div style="font-size:0.68rem;font-weight:800;color:#fef08a;text-transform:uppercase;letter-spacing:0.5px;margin-top:2px">
                Koin Petualang
              </div>
            </div>

            <!-- XP REWARD CARD -->
            <div style="background:linear-gradient(135deg, rgba(56,189,248,0.18), rgba(59,130,246,0.28));border:1.5px solid #38bdf8;border-radius:16px;padding:12px 10px;display:flex;flex-direction:column;align-items:center;box-shadow:0 4px 16px rgba(56,189,248,0.25)">
              <div style="font-size:1.6rem;line-height:1;margin-bottom:4px">⚡</div>
              <div id="claim-anim-xp" style="font-size:1.25rem;font-weight:900;color:#38bdf8;text-shadow:0 2px 8px rgba(0,0,0,0.7)">
                +${Number(xpAwarded || 0).toLocaleString()}
              </div>
              <div style="font-size:0.68rem;font-weight:800;color:#bae6fd;text-transform:uppercase;letter-spacing:0.5px;margin-top:2px">
                Exp Points (XP)
              </div>
            </div>
          </div>

          <!-- SPECIAL ITEMS UNLOCKED (IF ANY) -->
          ${allItems.length > 0 ? `
            <div style="background:linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2));border:1.5px solid #c084fc;border-radius:14px;padding:10px 12px;margin-bottom:10px;text-align:center;box-shadow:0 0 20px rgba(168,85,247,0.3)">
              <div style="font-size:0.7rem;font-weight:900;color:#f472b6;text-transform:uppercase;letter-spacing:1px">
                🐾 ITEM / PET EKSKLUSIF TERBUKA!
              </div>
              <div style="font-size:0.92rem;font-weight:800;color:#fff;margin-top:3px">
                ${allItems.map(it => `✨ ${esc(it)}`).join(' · ')}
              </div>
            </div>
          ` : ''}

          <!-- SPECIAL TITLES UNLOCKED (IF ANY) -->
          ${allTitles.length > 0 ? `
            <div style="background:linear-gradient(135deg, rgba(234,179,8,0.2), rgba(249,115,22,0.2));border:1.5px solid #facc15;border-radius:14px;padding:10px 12px;margin-bottom:10px;text-align:center;box-shadow:0 0 20px rgba(234,179,8,0.3)">
              <div style="font-size:0.7rem;font-weight:900;color:#fde047;text-transform:uppercase;letter-spacing:1px">
                🏅 GELAR PRESTISE BARU TERBUKA!
              </div>
              <div style="font-size:0.92rem;font-weight:800;color:#fff;margin-top:3px">
                ${allTitles.map(t => `"${esc(t)}"`).join(' · ')}
              </div>
            </div>
          ` : ''}

          <!-- UPDATED BALANCE FOOTER -->
          <div style="display:flex;justify-content:space-around;align-items:center;background:rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:9px 12px;margin-bottom:16px;font-size:0.82rem">
            <div>
              <span style="color:var(--c-muted)">Total Saldo:</span> 
              <strong style="color:#fde047;font-weight:800">🪙 ${Number(newCoins || 0).toLocaleString()}</strong>
            </div>
            <div style="width:1px;height:14px;background:rgba(255,255,255,0.15)"></div>
            <div>
              <span style="color:var(--c-muted)">Level & XP:</span> 
              <strong style="color:#38bdf8;font-weight:800">Lv. ${newLevel || 1} (${Number(newXp || 0).toLocaleString()} XP)</strong>
            </div>
          </div>

          <!-- ACTION BUTTON -->
          <button type="button" class="btn primary full-width" id="btn-claim-modal-ok" style="background:linear-gradient(135deg, #f59e0b, #eab308);color:#000;font-weight:900;font-size:0.95rem;padding:12px;border-radius:12px;border:none;box-shadow:0 4px 20px rgba(245,158,11,0.5);cursor:pointer;text-transform:uppercase;letter-spacing:0.5px">
            🎉 Keren Banget! Ambil Hadiah
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Dynamic count-up animation for coins & XP
    const animateCount = (el, target, prefix = '', suffix = '') => {
      if (!el) return;
      if (!target || target <= 0) {
        el.textContent = `${prefix}0${suffix}`;
        return;
      }
      const dur = 750;
      const startTime = performance.now();
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / dur, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const cur = Math.round(target * ease);
        el.textContent = `${prefix}${cur.toLocaleString()}${suffix}`;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
        }
      };
      requestAnimationFrame(step);
    };

    setTimeout(() => {
      animateCount(overlay.querySelector('#claim-anim-coins'), Number(coinsAwarded || 0), '+');
      animateCount(overlay.querySelector('#claim-anim-xp'), Number(xpAwarded || 0), '+');
    }, 150);

    const closeModal = () => {
      overlay.style.transition = 'opacity 0.2s ease';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        if (typeof onClose === 'function') onClose();
      }, 200);
    };

    overlay.querySelector('#btn-claim-modal-ok').onclick = () => {
      if (window.Sfx) Sfx.play('tap');
      closeModal();
    };

    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };
  },

  async claimSingleBadge(badgeId, onSuccess) {
    if (window.Sfx) Sfx.play('tap');
    const oldLevel = (Player.data && Player.data.level) || (this.profileData?.player?.level) || 1;
    try {
      const res = await API.req('/api/badges/claim', {
        method: 'POST',
        body: JSON.stringify({ badgeId })
      });
      if (res && res.ok) {
        // 1. Immediately update global Player state and UI DOM numbers
        this.applyClaimRewardUpdates(res);

        // Parse family and tier from badgeId (e.g. boss_slayer_common)
        const parts = (badgeId || '').split('_');
        const tier = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'COMMON';
        const famId = parts.slice(0, parts.length - 1).join('_');

        // 2. Show Spectacular Celebration Modal
        this.showClaimCelebrationModal({
          isBulk: false,
          badgeName: res.badgeName || 'Lencana',
          badgeId,
          tier,
          familyId: famId,
          coinsAwarded: res.coinsAwarded,
          xpAwarded: res.xpAwarded,
          itemAwarded: res.itemAwarded,
          titleAwarded: res.titleAwarded,
          newCoins: res.newCoins,
          newXp: res.newXp,
          newLevel: res.newLevel,
          isLevelUp: Boolean(res.newLevel && res.newLevel > oldLevel),
          onClose: async () => {
            // Full refresh of profile data in background
            await this.loadData();
            const contentSlot = document.getElementById('profile-tab-content');
            if (contentSlot && Screens.profil.activeTab === 'ringkasan') {
              const curScroll = contentSlot.scrollTop;
              Screens.profil.renderTabRingkasan(contentSlot);
              contentSlot.scrollTop = curScroll;
            }
            if (typeof onSuccess === 'function') onSuccess(true);
          }
        });
      } else {
        toast((res && res.message) || 'Gagal mengklaim hadiah lencana.', 'error');
        if (typeof onSuccess === 'function') onSuccess(false);
      }
    } catch (err) {
      console.error('Failed to claim badge:', err);
      toast('Gagal klaim: ' + (err.message || 'Terjadi kesalahan'), 'error');
      if (typeof onSuccess === 'function') onSuccess(false);
    }
  },

  async claimAllBadges() {
    if (window.Sfx) Sfx.play('tap');
    const oldLevel = (Player.data && Player.data.level) || (this.profileData?.player?.level) || 1;
    try {
      const res = await API.req('/api/badges/claim-all', {
        method: 'POST',
        body: JSON.stringify({})
      });
      if (res && res.ok && res.claimedCount > 0) {
        // 1. Immediately update global Player state and UI DOM numbers
        this.applyClaimRewardUpdates(res);

        // 2. Show Spectacular Celebration Modal
        this.showClaimCelebrationModal({
          isBulk: true,
          count: res.claimedCount,
          totalCoins: res.totalCoins,
          totalXp: res.totalXp,
          coinsAwarded: res.totalCoins,
          xpAwarded: res.totalXp,
          itemsAwarded: res.itemsAwarded,
          titlesAwarded: res.titlesAwarded,
          newCoins: res.newCoins,
          newXp: res.newXp,
          newLevel: res.newLevel,
          isLevelUp: Boolean(res.newLevel && res.newLevel > oldLevel),
          onClose: async () => {
            // Full refresh of profile data
            await this.loadData();
            const contentSlot = document.getElementById('profile-tab-content');
            if (contentSlot && Screens.profil.activeTab === 'ringkasan') {
              const curScroll = contentSlot.scrollTop;
              Screens.profil.renderTabRingkasan(contentSlot);
              contentSlot.scrollTop = curScroll;
            }
          }
        });
      } else {
        toast((res && res.message) || 'Tidak ada hadiah lencana baru yang dapat diklaim saat ini.');
      }
    } catch (err) {
      console.error('Failed to claim all badges:', err);
      toast('Gagal klaim: ' + (err.message || 'Terjadi kesalahan'), 'error');
    }
  },

  async claimFamilyFirstUnclaimed(familyId) {
    const f = (this.profileData?.badgeFamilies || []).find(x => x.id === familyId);
    if (!f) return;
    const unclaimedTier = f.tiers.find(t => t.unlocked && !t.claimed);
    if (!unclaimedTier) return;
    const badgeId = `${f.id}_${unclaimedTier.tier.toLowerCase()}`;
    await this.claimSingleBadge(badgeId);
  },

  showBadgeDetailModal(familyOrBadgeId, tierCode) {
    if (window.Sfx) Sfx.play('tap');
    let familyId = familyOrBadgeId;
    let selectedTier = (tierCode || 'COMMON').toUpperCase();

    // Support full badge ID, e.g. boss_slayer_legend
    const tierMatch = /^(.*)_(common|rare|epic|legend)$/i.exec(familyOrBadgeId || '');
    if (tierMatch) {
      familyId = tierMatch[1];
      if (!tierCode) selectedTier = tierMatch[2].toUpperCase();
    }

    const pData = (this && this.profileData) || Screens.profil.profileData || {};
    let f = (pData.badgeFamilies || []).find(x => x.id === familyId);
    if (!f && window.Badges && window.Badges.BADGE_FAMILIES) {
      const baseFam = window.Badges.BADGE_FAMILIES.find(x => x.id === familyId);
      if (baseFam) {
        const stats = pData.stats || {};
        const curVal = Number(stats[baseFam.statKey] || 0);
        f = {
          ...baseFam,
          current: curVal,
          unlockedCount: baseFam.tiers.filter(t => curVal >= t.target).length,
          highestTier: baseFam.tiers.slice().reverse().find(t => curVal >= t.target)?.tier || null,
          tiers: baseFam.tiers.map(t => ({
            ...t,
            unlocked: curVal >= t.target,
            current: curVal,
            pct: Math.min(100, Math.round((curVal / t.target) * 100)),
            tierInfo: window.Badges.TIERS ? window.Badges.TIERS[t.tier] : { color: '#f59e0b', label: t.tier, icon: '🥉' }
          }))
        };
      }
    }
    if (!f) return;

    const modalId = 'modal-badge-detail';
    const oldModal = document.getElementById(modalId);
    if (oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.className = 'confirm-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease;';

    const render = (activeTier) => {
      selectedTier = (activeTier || 'COMMON').toUpperCase();
      const t = f.tiers.find(x => x.tier === selectedTier) || f.tiers[0];
      const isUnlocked = Boolean(t.unlocked);
      const isClaimed = Boolean(t.claimed || (pData.claimedBadgeIds && pData.claimedBadgeIds.includes(`${f.id}_${selectedTier.toLowerCase()}`)));
      const tInfo = t.tierInfo || (window.Badges?.TIERS ? window.Badges.TIERS[selectedTier] : { color: '#f59e0b', label: selectedTier, icon: '🥉' });
      const currentVal = f.current || 0;
      const targetVal = t.target || 1;
      const pct = Math.min(100, Math.round((currentVal / targetVal) * 100));
      const remaining = Math.max(0, targetVal - currentVal);
      const isEquipped = (pData.showcase || Screens.profil.profileData?.showcase || []).some(it => it && it.id === `${f.id}_${selectedTier.toLowerCase()}`);

      const categoryLabel = (window.Badges && window.Badges.CATEGORIES && window.Badges.CATEGORIES[f.category])
        ? window.Badges.CATEGORIES[f.category].label
        : f.category || 'Prestasi';

      const svgBig = (window.BadgeArt && typeof window.BadgeArt.renderBadge === 'function')
        ? BadgeArt.renderBadge(f.id, selectedTier, { size: 110, locked: !isUnlocked, title: t.name })
        : `<div style="font-size:3.5rem">${t.icon || '🏅'}</div>`;

      overlay.innerHTML = `
        <div class="confirm-card stack" style="width:min(440px,96vw);max-height:90dvh;background:#0b1120;border:1.5px solid ${isUnlocked ? tInfo.color : 'rgba(255,255,255,0.15)'};border-radius:20px;padding:20px;display:flex;flex-direction:column;gap:13px;box-shadow:0 16px 40px rgba(0,0,0,0.8);overflow-y:auto">
          
          <!-- HEADER & CLOSE -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div style="font-size:0.72rem;font-weight:700;color:var(--c-muted);text-transform:uppercase;letter-spacing:0.5px">
                🏅 ${esc(categoryLabel)} · ${esc(f.name)}
              </div>
              <h2 style="margin:2px 0 0 0;font-size:1.25rem;font-weight:800;color:#fff">${esc(t.name)}</h2>
            </div>
            <button type="button" class="btn ghost small" id="btn-close-badge-detail" style="font-size:1.2rem;padding:2px 8px">✕</button>
          </div>

          <!-- TIER SELECTOR TABS -->
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:6px;background:rgba(255,255,255,0.04);padding:4px;border-radius:12px;border:1px solid rgba(255,255,255,0.08)">
            ${f.tiers.map(tr => {
              const isActive = tr.tier === selectedTier;
              const trColor = tr.tierInfo ? tr.tierInfo.color : '#f59e0b';
              return `
                <button type="button" class="btn small btn-tier-tab" data-tier="${tr.tier}" style="padding:6px 2px;font-size:0.7rem;font-weight:800;border-radius:8px;background:${isActive ? trColor : 'transparent'};color:${isActive ? '#000' : (tr.unlocked ? '#e2e8f0' : '#64748b')};border:none;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer">
                  <span>${tr.tierInfo ? tr.tierInfo.icon : '🏅'} ${tr.tier}</span>
                  <span style="font-size:0.6rem;opacity:${isActive ? 0.9 : 0.6}">${tr.unlocked ? '✓' : '🔒'}</span>
                </button>
              `;
            }).join('')}
          </div>

          <!-- MEDAL SPOTLIGHT SHOWCASE -->
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 0 2px 0;position:relative">
            <div style="filter:drop-shadow(0 0 22px ${isUnlocked ? tInfo.color : 'transparent'})">
              ${svgBig}
            </div>
            <div style="margin-top:10px;display:flex;align-items:center;gap:8px">
              <span class="badge" style="background:${tInfo.color};color:#000;font-size:0.72rem;font-weight:800;padding:2px 10px;border-radius:99px">
                TIER ${selectedTier}
              </span>
              ${isUnlocked
                ? (isClaimed
                    ? `<span class="badge" style="background:#059669;color:#fff;font-size:0.72rem;font-weight:800;padding:2px 10px;border-radius:99px">HADIAH TERKLAIM ✓</span>`
                    : `<span class="badge" style="background:#f59e0b;color:#000;font-size:0.72rem;font-weight:800;padding:2px 10px;border-radius:99px;box-shadow:0 0 10px #f59e0b">BISA KLAIM 🎁</span>`
                  )
                : `<span class="badge" style="background:#475569;color:#cbd5e1;font-size:0.72rem;font-weight:700;padding:2px 10px;border-radius:99px">TERKUNCI 🔒</span>`
              }
            </div>
          </div>

          <!-- PROGRESS BAR & SYARAT CAPAIAN -->
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;margin-bottom:6px">
              <span style="color:var(--c-muted)">🎯 Syarat Capaian:</span>
              <strong style="color:#fff;text-align:right">${esc(t.desc)}</strong>
            </div>
            <div class="xp-track" style="height:7px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden">
              <div class="xp-fill" style="width:${pct}%;background:${isUnlocked ? tInfo.color : 'var(--c-primary)'}"></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.72rem;color:var(--c-muted);margin-top:5px">
              <span>Progress: <strong style="color:${isUnlocked ? '#10b981' : '#38bdf8'}">${currentVal} / ${targetVal} ${f.unit || ''}</strong></span>
              <span>${isUnlocked ? 'Capaian Terpenuhi! ⭐' : `Kurang ${remaining} ${f.unit || ''}`}</span>
            </div>
          </div>

          <!-- LORE INSPIRATIF PROPOSAL -->
          <div style="background:rgba(30, 41, 59, 0.4);border-left:3px solid ${tInfo.color};border-radius:4px 12px 12px 4px;padding:10px 12px">
            <div style="font-size:0.68rem;font-weight:800;color:${tInfo.color};text-transform:uppercase;margin-bottom:3px">
              📜 Kisah Prestasi & Lore
            </div>
            <div style="font-size:0.78rem;color:#cbd5e1;line-height:1.45;font-style:italic">
              "${esc(t.lore || 'Dedikasi tinggi dalam petualangan membawamu menorehkan nama di lembaran legenda MI Adventure.')}"
            </div>
          </div>

          <!-- HADIAH CAPAIAN -->
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:10px 12px;display:flex;align-items:center;gap:10px">
            <span style="font-size:1.5rem">🎁</span>
            <div style="min-width:0;flex:1">
              <div style="font-size:0.68rem;font-weight:800;color:var(--c-muted);text-transform:uppercase">Hadiah Prestise</div>
              <div style="font-size:0.82rem;font-weight:800;color:#fde047">
                ${esc(t.reward || '+ Hadiah Koin & XP')}
              </div>
            </div>
          </div>

          <!-- ACTION BUTTONS -->
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:2px">
            ${isUnlocked ? (
              isClaimed ? `
                <div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:9px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);border-radius:12px;color:#10b981;font-size:0.82rem;font-weight:800">
                  <span>✓ Hadiah Telah Berhasil Diklaim</span>
                </div>
              ` : `
                <button type="button" class="btn primary full-width" id="btn-claim-detail-reward" style="background:linear-gradient(135deg, #f59e0b, #eab308);color:#000;font-weight:800;font-size:0.9rem;padding:11px;border-radius:12px;border:none;box-shadow:0 4px 16px rgba(245,158,11,0.45);cursor:pointer">
                  🎁 Klaim Hadiah (${esc(t.reward || '+ Koin & XP')})
                </button>
              `
            ) : ''}
            <div style="display:flex;gap:8px">
              ${isUnlocked ? `
                <button type="button" class="btn secondary grow" id="btn-equip-detail-showcase" style="font-size:0.82rem;padding:9px">
                  ${isEquipped ? '✓ Terpasang di Showcase' : '⭐ Pasang di Showcase'}
                </button>
              ` : ''}
              <button type="button" class="btn secondary grow" id="btn-view-all-tiers" style="font-size:0.82rem;padding:9px">
                📋 Lihat Semua Tier
              </button>
              <button type="button" class="btn ghost small" id="btn-dismiss-detail" style="font-size:0.82rem">Tutup</button>
            </div>
          </div>
        </div>
      `;

      wireEvents(selectedTier);
    };

    const wireEvents = (curTier) => {
      const close = () => overlay.remove();
      const closeBtn = overlay.querySelector('#btn-close-badge-detail');
      if (closeBtn) closeBtn.onclick = close;
      const dismissBtn = overlay.querySelector('#btn-dismiss-detail');
      if (dismissBtn) dismissBtn.onclick = close;

      const claimBtn = overlay.querySelector('#btn-claim-detail-reward');
      if (claimBtn) {
        claimBtn.onclick = async () => {
          claimBtn.disabled = true;
          claimBtn.innerHTML = 'Memproses klaim...';
          const badgeId = `${f.id}_${curTier.toLowerCase()}`;
          await Screens.profil.claimSingleBadge(badgeId, () => {
            close();
            Screens.profil.showBadgeDetailModal(f.id, curTier);
          });
        };
      }

      const viewAllBtn = overlay.querySelector('#btn-view-all-tiers');
      if (viewAllBtn) {
        viewAllBtn.onclick = () => {
          close();
          Screens.profil.showBadgeFamilyDetailModal(f.id);
        };
      }

      const equipBtn = overlay.querySelector('#btn-equip-detail-showcase');
      if (equipBtn) {
        equipBtn.onclick = async () => {
          const tObj = f.tiers.find(x => x.tier === curTier) || f.tiers[0];
          const item = {
            id: `${f.id}_${curTier.toLowerCase()}`,
            name: tObj.name,
            icon: tObj.icon,
            tier: curTier,
            type: 'badge'
          };
          close();
          const current = [...(pData.showcase || Screens.profil.profileData?.showcase || [null, null, null])];
          while (current.length < 3) current.push(null);
          let targetSlot = current.findIndex(x => x === null);
          if (targetSlot === -1) targetSlot = 0;
          await Screens.profil.saveShowcaseItem(targetSlot, item);
        };
      }

      overlay.querySelectorAll('.btn-tier-tab').forEach(tabBtn => {
        tabBtn.onclick = () => {
          if (window.Sfx) Sfx.play('tap');
          render(tabBtn.dataset.tier);
        };
      });
    };

    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };

    document.body.appendChild(overlay);
    render(selectedTier);
  },

  showBadgeFamilyDetailModal(familyId) {
    if (window.Sfx) Sfx.play('tap');
    const pData = (this && this.profileData) || Screens.profil.profileData || {};
    let f = (pData.badgeFamilies || []).find(x => x.id === familyId);
    if (!f && window.Badges && window.Badges.BADGE_FAMILIES) {
      const baseFam = window.Badges.BADGE_FAMILIES.find(x => x.id === familyId);
      if (baseFam) {
        const stats = pData.stats || {};
        const curVal = Number(stats[baseFam.statKey] || 0);
        f = {
          ...baseFam,
          current: curVal,
          unlockedCount: baseFam.tiers.filter(t => curVal >= t.target).length,
          highestTier: baseFam.tiers.slice().reverse().find(t => curVal >= t.target)?.tier || null,
          tiers: baseFam.tiers.map(t => ({
            ...t,
            unlocked: curVal >= t.target,
            current: curVal,
            pct: Math.min(100, Math.round((curVal / t.target) * 100)),
            tierInfo: window.Badges.TIERS ? window.Badges.TIERS[t.tier] : { color: '#f59e0b', label: t.tier, icon: '🥉' }
          }))
        };
      }
    }
    if (!f) return;

    const modalId = 'modal-badge-family';
    const oldModal = document.getElementById(modalId);
    if (oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.className = 'confirm-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease;';

    overlay.innerHTML = `
      <div class="confirm-card stack" style="width:min(440px,96vw);max-height:85dvh;background:#0f172a;border:1px solid rgba(255,255,255,0.15);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:12px;box-shadow:0 12px 36px rgba(0,0,0,0.7)">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <h3 style="margin:0;font-size:1.1rem;color:#fff;font-weight:800">${esc(f.name)}</h3>
            <div style="font-size:0.75rem;color:var(--c-muted)">Capaian saat ini: <strong style="color:var(--c-primary)">${f.current} ${f.unit || ''}</strong></div>
          </div>
          <button class="btn ghost small" id="btn-close-badge-family" style="font-size:1.2rem;padding:2px 8px">✕</button>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;overflow-y:auto;max-height:55dvh;padding-right:4px">
          ${f.tiers.map(t => {
            const isUnlocked = t.unlocked;
            const isClaimed = Boolean(t.claimed || (pData.claimedBadgeIds && pData.claimedBadgeIds.includes(`${f.id}_${t.tier.toLowerCase()}`)));
            const tColor = t.tierInfo ? t.tierInfo.color : '#f59e0b';
            return `
              <div class="badge-tier-card" style="padding:12px;background:${isUnlocked ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.3)'};border:1.5px solid ${isUnlocked ? tColor : 'rgba(255,255,255,0.1)'};border-radius:12px;opacity:${isUnlocked ? '1' : '0.65'}">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <div style="display:flex;align-items:center;gap:12px;min-width:0">
                    <div class="badge-icon-btn btn-inspect-badge-tier" data-family="${f.id}" data-tier="${t.tier}" style="width:52px;height:52px;display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer" title="Klik untuk lihat detail 3D">
                      ${(window.BadgeArt && typeof window.BadgeArt.renderBadge === 'function')
                        ? BadgeArt.renderBadge(f.id, t.tier, { size: 52, locked: !isUnlocked, title: t.name })
                        : `<span style="font-size:1.8rem">${t.icon || '🏅'}</span>`
                      }
                    </div>
                    <div style="min-width:0">
                      <div style="font-weight:800;font-size:0.92rem;color:${isUnlocked ? '#fff' : '#94a3b8'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.name)}</div>
                      <div style="font-size:0.7rem;font-weight:700;color:${tColor};text-transform:uppercase">${t.tier} · Syarat: ${t.target} ${f.unit || ''}</div>
                    </div>
                  </div>
                  <div>
                    ${isUnlocked
                      ? (isClaimed
                          ? `<span class="badge small" style="background:#059669;color:#fff;font-size:0.68rem;padding:3px 8px;border-radius:6px;font-weight:800">TERKLAIM ✓</span>`
                          : `<span class="badge small" style="background:#f59e0b;color:#000;font-size:0.68rem;padding:3px 8px;border-radius:6px;font-weight:800;box-shadow:0 0 8px #f59e0b">BISA KLAIM 🎁</span>`
                        )
                      : `<span class="badge small" style="background:#475569;color:#cbd5e1;font-size:0.68rem;padding:3px 8px;border-radius:6px">${t.pct}%</span>`
                    }
                  </div>
                </div>
                <div style="font-size:0.75rem;color:var(--c-muted);margin-top:6px;line-height:1.4">${esc(t.desc)}</div>
                ${t.lore ? `<div style="font-size:0.72rem;color:#cbd5e1;font-style:italic;margin-top:4px;border-left:2px solid ${tColor};padding-left:8px">"${esc(t.lore)}"</div>` : ''}
                ${t.reward ? `<div style="font-size:0.72rem;font-weight:700;color:#fde047;margin-top:4px">🎁 Hadiah: ${esc(t.reward)}</div>` : ''}
                <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap">
                  <button type="button" class="btn ghost small btn-inspect-badge-tier" data-family="${f.id}" data-tier="${t.tier}" style="font-size:0.72rem;padding:3px 10px">
                    🔍 Detail Medali
                  </button>
                  <div style="display:flex;gap:6px">
                    ${isUnlocked ? (
                      isClaimed
                        ? `<button type="button" class="btn small" disabled style="font-size:0.72rem;padding:3px 10px;background:rgba(16,185,129,0.12);color:#10b981;border:1px solid rgba(16,185,129,0.25);cursor:default">✓ Hadiah Diklaim</button>`
                        : `<button type="button" class="btn primary small btn-claim-tier-badge" data-badge-id="${f.id}_${t.tier.toLowerCase()}" style="font-size:0.72rem;padding:3px 12px;background:linear-gradient(135deg, #f59e0b, #d97706);color:#000;font-weight:800;border:none;box-shadow:0 0 10px rgba(245,158,11,0.4);cursor:pointer">🎁 Klaim Hadiah</button>`
                    ) : ''}
                    ${isUnlocked ? `
                      <button type="button" class="btn secondary small btn-equip-to-showcase" data-tier="${t.tier}" data-name="${esc(t.name)}" data-icon="${t.icon || '🏅'}" style="font-size:0.72rem;padding:3px 10px">
                        ⭐ Pasang
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="margin-top:4px">
          <button class="btn ghost small full-width" id="btn-ok-badge-family">Tutup</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };
    overlay.querySelector('#btn-close-badge-family').onclick = close;
    overlay.querySelector('#btn-ok-badge-family').onclick = close;

    overlay.querySelectorAll('.btn-inspect-badge-tier').forEach(btn => {
      btn.onclick = () => {
        close();
        Screens.profil.showBadgeDetailModal(btn.dataset.family, btn.dataset.tier);
      };
    });

    overlay.querySelectorAll('.btn-claim-tier-badge').forEach(btn => {
      btn.onclick = async () => {
        const bId = btn.dataset.badgeId;
        btn.disabled = true;
        btn.innerHTML = 'Mengklaim...';
        await Screens.profil.claimSingleBadge(bId, () => {
          overlay.remove();
          Screens.profil.showBadgeFamilyDetailModal(f.id);
        });
      };
    });

    overlay.querySelectorAll('.btn-equip-to-showcase').forEach(btn => {
      btn.onclick = async () => {
        const item = {
          id: `${f.id}_${btn.dataset.tier.toLowerCase()}`,
          name: btn.dataset.name,
          icon: btn.dataset.icon,
          tier: btn.dataset.tier,
          type: 'badge'
        };
        close();
        // find first empty slot or slot 0
        const current = [...(pData.showcase || Screens.profil.profileData?.showcase || [null, null, null])];
        while (current.length < 3) current.push(null);
        let targetSlot = current.findIndex(x => x === null);
        if (targetSlot === -1) targetSlot = 0;
        await Screens.profil.saveShowcaseItem(targetSlot, item);
      };
    });
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

    // Pastikan avatarDraft sinkron dengan inventory / profile
    if (!this.avatarDraft || Object.keys(this.avatarDraft).length === 0) {
      if (inv.avatar && Object.keys(inv.avatar).length > 0) {
        this.avatarDraft = JSON.parse(JSON.stringify(inv.avatar));
      } else if (this.profileData?.avatar && Object.keys(this.profileData.avatar).length > 0) {
        this.avatarDraft = JSON.parse(JSON.stringify(this.profileData.avatar));
      } else {
        const derived = {};
        for (const it of (inv.items || [])) {
          if (it.equipped && it.slot) derived[it.slot] = it.id;
        }
        this.avatarDraft = derived;
      }
    }

    const items = inv.items || [];
    if (!this.skinCatFilter) this.skinCatFilter = 'ALL';
    if (!this.skinOwnerFilter) this.skinOwnerFilter = 'all';
    if (!this.skinRarityFilter) this.skinRarityFilter = 'ALL';

    const countAll = items.length;
    const countOwned = items.filter(it => it.owned).length;
    const countUnowned = items.filter(it => !it.owned).length;

    const calcCurrentPassives = (av) => {
      const eqIds = ['hat', 'outfit', 'weapon', 'pet', 'bg', 'frame', 'title']
        .map(sl => av[sl])
        .filter(Boolean);
      return (window.Passives && Passives.calculatePassives)
        ? Passives.calculatePassives(eqIds, items)
        : (this.inventoryData?.passives || { dodgeRate: 0, startShield: 0, critChance: 0, bonusTime: 0, activeSets: [], badges: [] });
    };

    let curP = calcCurrentPassives(this.avatarDraft || {});
    const buildSetHtml = (p) => (p.activeSets && p.activeSets.length > 0)
      ? p.activeSets.map(s => `<span class="chip" style="background:rgba(245,158,11,0.2);color:#fbbf24;border:1px solid rgba(245,158,11,0.4);font-size:0.68rem;font-weight:700;padding:2px 8px">${esc(s.icon)} ${esc(s.name)}</span>`).join(' ')
      : '';
    const buildStatsGridHtml = (p) => {
      const cards = [];
      if (p.dodgeRate > 0) {
        cards.push('<div class="hero-stat-card" style="background:rgba(255,255,255,0.05);padding:5px 6px;border-radius:8px;border:1px solid rgba(52,211,153,0.35);text-align:center"><div style="font-size:0.65rem;color:#94a3b8">Hindaran</div><div id="stat-dodge-val" style="font-size:0.82rem;font-weight:800;color:#34d399">💨 ' + Math.round(p.dodgeRate * 100) + '%</div></div>');
      }
      if (p.startShield > 0) {
        cards.push('<div class="hero-stat-card" style="background:rgba(255,255,255,0.05);padding:5px 6px;border-radius:8px;border:1px solid rgba(56,189,248,0.35);text-align:center"><div style="font-size:0.65rem;color:#94a3b8">Perisai Awal</div><div id="stat-shield-val" style="font-size:0.82rem;font-weight:800;color:#38bdf8">🛡️ +' + p.startShield + ' HP</div></div>');
      }
      if (p.critChance > 0) {
        cards.push('<div class="hero-stat-card" style="background:rgba(255,255,255,0.05);padding:5px 6px;border-radius:8px;border:1px solid rgba(250,204,21,0.35);text-align:center"><div style="font-size:0.65rem;color:#94a3b8">Kritis</div><div id="stat-crit-val" style="font-size:0.82rem;font-weight:800;color:#facc15">⚡ ' + Math.round(p.critChance * 100) + '%</div></div>');
      }
      if (p.bonusTime > 0) {
        cards.push('<div class="hero-stat-card" style="background:rgba(255,255,255,0.05);padding:5px 6px;border-radius:8px;border:1px solid rgba(167,139,250,0.35);text-align:center"><div style="font-size:0.65rem;color:#94a3b8">Waktu Soal</div><div id="stat-time-val" style="font-size:0.82rem;font-weight:800;color:#a78bfa">⏳ +' + p.bonusTime + 's</div></div>');
      }
      if (p.damageReduction > 0) {
        cards.push('<div class="hero-stat-card" style="background:rgba(255,255,255,0.05);padding:5px 6px;border-radius:8px;border:1px solid rgba(96,165,250,0.35);text-align:center"><div style="font-size:0.65rem;color:#94a3b8">Reduksi Dmg</div><div id="stat-reduct-val" style="font-size:0.82rem;font-weight:800;color:#60a5fa">🔰 -' + Math.round(p.damageReduction * 100) + '%</div></div>');
      }
      if (p.coinBonus > 0) {
        cards.push('<div class="hero-stat-card" style="background:rgba(255,255,255,0.05);padding:5px 6px;border-radius:8px;border:1px solid rgba(251,191,36,0.35);text-align:center"><div style="font-size:0.65rem;color:#94a3b8">Bonus Koin</div><div id="stat-coin-val" style="font-size:0.82rem;font-weight:800;color:#fbbf24">🪙 +' + Math.round(p.coinBonus * 100) + '%</div></div>');
      }
      if (p.xpBonus > 0) {
        cards.push('<div class="hero-stat-card" style="background:rgba(255,255,255,0.05);padding:5px 6px;border-radius:8px;border:1px solid rgba(244,114,182,0.35);text-align:center"><div style="font-size:0.65rem;color:#94a3b8">Bonus XP</div><div id="stat-xp-val" style="font-size:0.82rem;font-weight:800;color:#f472b6">⭐ +' + Math.round(p.xpBonus * 100) + '%</div></div>');
      }
      if (p.correctDamageBonus > 0) {
        cards.push('<div class="hero-stat-card" style="background:rgba(255,255,255,0.05);padding:5px 6px;border-radius:8px;border:1px solid rgba(248,113,113,0.35);text-align:center"><div style="font-size:0.65rem;color:#94a3b8">Serangan+</div><div id="stat-dmg-val" style="font-size:0.82rem;font-weight:800;color:#f87171">⚔️ +' + p.correctDamageBonus + '</div></div>');
      }
      if (p.dragonBreathChance > 0) {
        cards.push('<div class="hero-stat-card" style="background:rgba(255,255,255,0.05);padding:5px 6px;border-radius:8px;border:1px solid rgba(251,146,60,0.35);text-align:center"><div style="font-size:0.65rem;color:#94a3b8">Naga Api</div><div id="stat-dragon-val" style="font-size:0.82rem;font-weight:800;color:#fb923c">🔥 ' + Math.round(p.dragonBreathChance * 100) + '%</div></div>');
      }
      if (p.thornsDamage > 0) {
        cards.push('<div class="hero-stat-card" style="background:rgba(255,255,255,0.05);padding:5px 6px;border-radius:8px;border:1px solid rgba(74,222,128,0.35);text-align:center"><div style="font-size:0.65rem;color:#94a3b8">Duri Balas</div><div id="stat-thorns-val" style="font-size:0.82rem;font-weight:800;color:#4ade80">🌵 +' + p.thornsDamage + '</div></div>');
      }
      if (p.streakProtectChance > 0) {
        cards.push('<div class="hero-stat-card" style="background:rgba(255,255,255,0.05);padding:5px 6px;border-radius:8px;border:1px solid rgba(129,140,248,0.35);text-align:center"><div style="font-size:0.65rem;color:#94a3b8">Lindung Combo</div><div id="stat-protect-val" style="font-size:0.82rem;font-weight:800;color:#818cf8">🛡️ ' + Math.round(p.streakProtectChance * 100) + '%</div></div>');
      }
      if (cards.length === 0) {
        return '<div style="grid-column:1/-1;padding:8px 12px;background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.12);border-radius:8px;text-align:center;color:var(--c-muted);font-size:0.72rem">✨ Belum ada atribut pasif aktif. Pasang skin untuk mengaktifkan efek!</div>';
      }
      return cards.join('');
    };

    slot.innerHTML = `
      <!-- AVATAR LIVE PREVIEW & RPG PASSIVES OVERVIEW (COMPACT) -->
      <div class="card" id="skin-hero-dashboard" style="padding:12px 14px;background:linear-gradient(135deg, rgba(30,41,59,0.85), rgba(15,23,42,0.92));border:1px solid rgba(255,255,255,0.12);border-radius:var(--radius);display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <div style="display:flex;flex-direction:column;align-items:center;flex:0 0 auto">
          <div id="avatar-live-box" style="width:96px;height:96px;border-radius:20px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid rgba(255,255,255,0.14);box-shadow:0 4px 14px rgba(0,0,0,0.35)">
            ${Avatar.renderAvatar(this.avatarDraft || {})}
          </div>
          <span style="font-size:0.7rem;color:var(--c-muted);margin-top:4px">Avatar Aktif</span>
        </div>

        <div class="grow" style="min-width:190px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:6px">
            <span style="font-size:0.82rem;font-weight:800;color:#fff;display:flex;align-items:center;gap:4px">
              🛡️ Atribut Pasif Skin RPG
            </span>
            <div id="skin-active-sets">${buildSetHtml(curP)}</div>
          </div>
          
          <div id="skin-stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(75px, 1fr));gap:6px">
            ${buildStatsGridHtml(curP)}
          </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FILTER KEPEMILIKAN (OWNED / UNOWNED) -->
      <div style="background:rgba(255,255,255,0.04);border:1px solid var(--c-surface-strong);border-radius:var(--radius);padding:10px 12px;margin:4px 0 6px 0;display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:0.8rem;font-weight:800;color:#fff;display:flex;align-items:center;gap:6px">
            🏷️ Status Kepemilikan:
          </span>
        </div>
        <div class="skin-owner-filter-bar" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch">
          <button class="btn small skin-owner-btn ${this.skinOwnerFilter === 'all' ? 'active' : 'ghost'}" data-owner="all" data-testid="filter-owner-all" style="flex:0 0 auto;white-space:nowrap;padding:6px 14px">Semua (${countAll})</button>
          <button class="btn small skin-owner-btn ${this.skinOwnerFilter === 'owned' ? 'active' : 'ghost'}" data-owner="owned" data-testid="filter-owner-owned" style="flex:0 0 auto;white-space:nowrap;padding:6px 14px">✅ Dimiliki (${countOwned})</button>
          <button class="btn small skin-owner-btn ${this.skinOwnerFilter === 'unowned' ? 'active' : 'ghost'}" data-owner="unowned" data-testid="filter-owner-unowned" style="flex:0 0 auto;white-space:nowrap;padding:6px 14px">🔒 Belum Dimiliki (${countUnowned})</button>
        </div>
      </div>

      <!-- FILTER KATEGORI -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin:6px 0 2px 2px;flex:0 0 auto;flex-shrink:0">
        <div style="font-size:0.75rem;font-weight:700;color:var(--c-muted);text-transform:uppercase;letter-spacing:0.5px">📁 Kategori Item</div>
      </div>
      <div class="skin-filter-bar" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;flex:0 0 auto;flex-shrink:0;min-height:44px">
        <button class="btn small skin-cat-btn ${this.skinCatFilter === 'ALL' ? 'active' : 'ghost'}" data-cat="ALL" style="flex:0 0 auto;white-space:nowrap;padding:6px 12px">Semua</button>
        <button class="btn small skin-cat-btn ${this.skinCatFilter === 'hat' ? 'active' : 'ghost'}" data-cat="hat" style="flex:0 0 auto;white-space:nowrap;padding:6px 12px">Topi</button>
        <button class="btn small skin-cat-btn ${this.skinCatFilter === 'outfit' ? 'active' : 'ghost'}" data-cat="outfit" style="flex:0 0 auto;white-space:nowrap;padding:6px 12px">Pakaian</button>
        <button class="btn small skin-cat-btn ${this.skinCatFilter === 'weapon' ? 'active' : 'ghost'}" data-cat="weapon" style="flex:0 0 auto;white-space:nowrap;padding:6px 12px">Senjata</button>
        <button class="btn small skin-cat-btn ${this.skinCatFilter === 'pet' ? 'active' : 'ghost'}" data-cat="pet" style="flex:0 0 auto;white-space:nowrap;padding:6px 12px">Hewan</button>
        <button class="btn small skin-cat-btn ${this.skinCatFilter === 'bg' ? 'active' : 'ghost'}" data-cat="bg" style="flex:0 0 auto;white-space:nowrap;padding:6px 12px">Latar</button>
        <button class="btn small skin-cat-btn ${this.skinCatFilter === 'frame' ? 'active' : 'ghost'}" data-cat="frame" style="flex:0 0 auto;white-space:nowrap;padding:6px 12px">Bingkai</button>
        <button class="btn small skin-cat-btn ${this.skinCatFilter === 'title' ? 'active' : 'ghost'}" data-cat="title" style="flex:0 0 auto;white-space:nowrap;padding:6px 12px">Gelar</button>
        <button class="btn small skin-cat-btn ${this.skinCatFilter === 'permanent' ? 'active' : 'ghost'}" data-cat="permanent" style="flex:0 0 auto;white-space:nowrap;padding:6px 12px">Upgrade</button>
      </div>

      <!-- GRID ITEM MILIK -->
      <!-- FILTER RARITY SKIN (DI SETIAP KATEGORI) -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin:6px 0 2px 2px;flex:0 0 auto;flex-shrink:0">
        <div style="font-size:0.75rem;font-weight:700;color:var(--c-muted);text-transform:uppercase;letter-spacing:0.5px">💎 Filter Rarity</div>
        <span id="skin-filter-count" style="font-size:0.72rem;color:var(--c-primary);font-weight:700"></span>
      </div>
      <div class="skin-rarity-bar" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;flex:0 0 auto;flex-shrink:0;min-height:40px">
        <button class="btn small rarity-pill-btn skin-rarity-btn ${this.skinRarityFilter === 'ALL' ? 'active' : 'ghost'}" id="skin-rarity-all" data-rarity="ALL" data-testid="skin-filter-rarity-all" style="flex:0 0 auto;white-space:nowrap;padding:5px 12px;font-size:0.75rem">Semua</button>
        <button class="btn small rarity-pill-btn skin-rarity-btn ${this.skinRarityFilter === 'COMMON' ? 'active' : 'ghost'}" id="skin-rarity-common" data-rarity="COMMON" data-testid="skin-filter-rarity-common" style="flex:0 0 auto;white-space:nowrap;padding:5px 12px;font-size:0.75rem;border-color:rgba(148,163,184,0.4)">⚪ Common</button>
        <button class="btn small rarity-pill-btn skin-rarity-btn ${this.skinRarityFilter === 'RARE' ? 'active' : 'ghost'}" id="skin-rarity-rare" data-rarity="RARE" data-testid="skin-filter-rarity-rare" style="flex:0 0 auto;white-space:nowrap;padding:5px 12px;font-size:0.75rem;border-color:rgba(56,189,248,0.4)">🔵 Rare</button>
        <button class="btn small rarity-pill-btn skin-rarity-btn ${this.skinRarityFilter === 'EPIC' ? 'active' : 'ghost'}" id="skin-rarity-epic" data-rarity="EPIC" data-testid="skin-filter-rarity-epic" style="flex:0 0 auto;white-space:nowrap;padding:5px 12px;font-size:0.75rem;border-color:rgba(168,85,247,0.4)">🟣 Epic</button>
        <button class="btn small rarity-pill-btn skin-rarity-btn ${this.skinRarityFilter === 'LEGENDARY' ? 'active' : 'ghost'}" id="skin-rarity-legendary" data-rarity="LEGENDARY" data-testid="skin-filter-rarity-legendary" style="flex:0 0 auto;white-space:nowrap;padding:5px 12px;font-size:0.75rem;border-color:rgba(245,158,11,0.4)">🟡 Legend</button>
        <button class="btn small rarity-pill-btn skin-rarity-btn ${this.skinRarityFilter === 'MYTHIC' ? 'active' : 'ghost'}" id="skin-rarity-mythic" data-rarity="MYTHIC" data-testid="skin-filter-rarity-mythic" style="flex:0 0 auto;white-space:nowrap;padding:5px 12px;font-size:0.75rem;border-color:rgba(255,0,85,0.4)">🔴 Mythic</button>
      </div>

      <!-- GRID ITEM MILIK -->
      <div class="skin-grid" id="skin-items-grid"></div>
    `;

    const updateSkinRarityBar = () => {
      let baseItems = items;
      if (this.skinOwnerFilter === 'owned') {
        baseItems = baseItems.filter(it => it.owned);
      } else if (this.skinOwnerFilter === 'unowned') {
        baseItems = baseItems.filter(it => !it.owned);
      }
      if (this.skinCatFilter !== 'ALL') {
        baseItems = baseItems.filter(it => it.slot === this.skinCatFilter);
      }

      const countAll = baseItems.length;
      const countCommon = baseItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'COMMON').length;
      const countRare = baseItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'RARE').length;
      const countEpic = baseItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'EPIC').length;
      const countLeg = baseItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'LEGENDARY').length;
      const countMyt = baseItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'MYTHIC').length;

      const btnAll = $('#skin-rarity-all');
      if (btnAll) btnAll.innerHTML = `Semua (${countAll})`;
      const btnCom = $('#skin-rarity-common');
      if (btnCom) btnCom.innerHTML = `⚪ Common (${countCommon})`;
      const btnRare = $('#skin-rarity-rare');
      if (btnRare) btnRare.innerHTML = `🔵 Rare (${countRare})`;
      const btnEpic = $('#skin-rarity-epic');
      if (btnEpic) btnEpic.innerHTML = `🟣 Epic (${countEpic})`;
      const btnLeg = $('#skin-rarity-legendary');
      if (btnLeg) btnLeg.innerHTML = `🟡 Legend (${countLeg})`;
      const btnSkinMyt = $('#skin-rarity-mythic');
      if (btnSkinMyt) btnSkinMyt.innerHTML = `🔴 Mythic (${countMyt})`;
    };

    const renderItems = () => {
      const grid = $('#skin-items-grid');
      if (!grid) return;

      let filtered = items;
      if (this.skinCatFilter !== 'ALL') {
        filtered = filtered.filter(it => it.slot === this.skinCatFilter);
      }
      if (this.skinOwnerFilter === 'owned') {
        filtered = filtered.filter(it => it.owned);
      } else if (this.skinOwnerFilter === 'unowned') {
        filtered = filtered.filter(it => !it.owned);
      }
      if (this.skinRarityFilter && this.skinRarityFilter !== 'ALL') {
        filtered = filtered.filter(it => (it.rarity || 'COMMON').toUpperCase() === this.skinRarityFilter);
      }

      const countEl = $('#skin-filter-count');
      if (countEl) countEl.textContent = `${filtered.length} skin`;

      if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--c-muted)">Tidak ada skin untuk filter kategori & rarity ini.</div>`;
        return;
      }

      grid.innerHTML = filtered.map(it => {
        const isEquipped = Boolean(this.avatarDraft && this.avatarDraft[it.slot] === it.id);
        const rarityColor = it.rarity === 'MYTHIC' ? '#ff0055' : it.rarity === 'LEGENDARY' ? '#f59e0b' : it.rarity === 'EPIC' ? '#a855f7' : it.rarity === 'RARE' ? '#3b82f6' : '#94a3b8';

        let actionHtml = '';
        if (isEquipped) {
          actionHtml = `
            <div style="display:flex;gap:6px;justify-content:flex-end;align-items:center">
              <span class="chip good" style="font-size:0.75rem;padding:3px 8px">Terpasang</span>
              <button class="btn small ghost item-unequip-btn" data-testid="item-unequip-${it.id}" data-slot="${it.slot}" title="Lepas skin ini" style="padding:4px 10px;font-size:0.75rem">Lepas</button>
            </div>
          `;
        } else if (it.owned) {
          actionHtml = `<button class="btn small primary block item-equip-btn" data-testid="item-equip-${it.id}" data-id="${it.id}" data-slot="${it.slot}">Pakai</button>`;
        } else {
          // Belum dimiliki: tombol shortcut untuk beli di Toko
          actionHtml = `<button class="btn small secondary block btn-goto-shop" data-id="${it.id}" data-slot="${it.slot}" title="Beli skin ini di Toko" style="font-size:0.75rem;padding:4px 10px">🛒 Beli di Toko</button>`;
        }

        return `
          <div class="card item-card ${isEquipped ? 'is-equipped' : ''}" data-testid="item-card-${it.id}" style="padding:12px;background:var(--c-surface);border-radius:var(--radius);border:1px solid ${isEquipped ? 'var(--c-primary)' : 'var(--c-surface-strong)'};display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;gap:12px;align-items:flex-start">
              <!-- THUMBNAIL + RARITY -->
              <div style="flex:0 0 68px;display:flex;flex-direction:column;align-items:center;gap:4px">
                <div class="skin-thumbnail-box" style="width:68px;height:68px;border-radius:14px;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid rgba(255,255,255,0.08);box-shadow:inset 0 2px 6px rgba(0,0,0,0.3)">
                  ${window.Avatar ? Avatar.renderThumbnail(it.id, it.slot) : '🎒'}
                </div>
                <span style="font-size:0.65rem;font-weight:800;color:${rarityColor};letter-spacing:0.5px">${it.rarity}</span>
              </div>

              <!-- MAIN INFO: TITLE, STATUS, PASSIVE, LORE -->
              <div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
                  <div style="font-weight:800;font-size:0.95rem;color:#fff;line-height:1.25">${esc(it.name)}</div>
                  ${it.owned ? `<span class="chip good" style="font-size:0.65rem;padding:1px 6px;flex:0 0 auto">✓ Milik</span>` : `<span class="chip" style="font-size:0.65rem;padding:1px 6px;color:var(--c-muted);flex:0 0 auto">🔒 Belum</span>`}
                </div>

                <!-- RPG PASSIVE BADGE -->
                ${it.passive ? `<div style="font-size:0.75rem;font-weight:700;color:#38bdf8;background:rgba(56,189,248,0.12);padding:4px 8px;border-radius:6px;border:1px solid rgba(56,189,248,0.3);line-height:1.35;word-break:break-word">✨ ${esc(it.passive.desc)}</div>` : ''}

                <!-- LORE FLAVOR TEXT -->
                ${it.lore ? `<div style="font-size:0.72rem;color:var(--c-muted);line-height:1.35;font-style:italic">${esc(it.lore)}</div>` : ''}
              </div>
            </div>

            <!-- ACTION FOOTER -->
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);margin-top:2px">
              <div style="flex:0 0 auto;min-width:130px">
                ${actionHtml}
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Tombol Beli di Toko dari Tab Belum Dimiliki
      $$('#skin-items-grid .btn-goto-shop').forEach(btn => {
        btn.onclick = () => {
          const slot = btn.dataset.slot || 'ALL';
          this.activeTab = 'toko';
          this.shopCatFilter = slot;
          this.shopRarityFilter = 'ALL';
          $$('.tab-btn').forEach(b => {
            if (b.dataset.tab === 'toko') { b.classList.remove('ghost'); b.classList.add('active'); }
            else { b.classList.add('ghost'); b.classList.remove('active'); }
          });
          this.renderActiveTab();
        };
      });

      // Tombol Equip
      $$('#skin-items-grid .item-equip-btn').forEach(btn => {
        btn.onclick = async () => {
          const itemId = btn.dataset.id;
          const slot = btn.dataset.slot;

          // Clone state tanpa memutasi draft sebelum request berhasil
          const nextAvatar = { ...(this.avatarDraft || {}) };
          nextAvatar[slot] = itemId;

          btn.disabled = true;
          btn.textContent = 'Memasang...';

          try {
            const res = await API.updateAvatar(nextAvatar);
            const savedAvatar = res?.avatar || nextAvatar;
            this.avatarDraft = savedAvatar;
            if (this.profileData) this.profileData.avatar = savedAvatar;
            if (Player.data) Player.data.avatar = savedAvatar;

            if (this.inventoryData?.items) {
              this.inventoryData.items.forEach(i => {
                if (i.slot === slot) {
                  i.equipped = (i.id === itemId);
                }
              });
            }

            const updateHeroShowcase = (savedAv, srvPassives) => {
              const previewEl = $('#avatar-live-box');
              if (previewEl && window.Avatar) previewEl.innerHTML = Avatar.renderAvatar(savedAv);
              const upStats = srvPassives || calcCurrentPassives(savedAv);
              if (this.inventoryData) this.inventoryData.passives = upStats;
              const sGrid = $('#skin-stats-grid');
              if (sGrid) sGrid.innerHTML = buildStatsGridHtml(upStats);
              const sSets = $('#skin-active-sets');
              if (sSets) sSets.innerHTML = buildSetHtml(upStats);
            };

            toast('Skin berhasil dipakai! ✨');
            updateHeroShowcase(savedAvatar, res?.passives);
            renderItems();
          } catch (e) {
            toast('Gagal memasang skin: ' + (e.message || e.code || 'Item belum dimiliki'));
            btn.disabled = false;
            btn.textContent = 'Pakai';
          }
        };
      });

      // Tombol Lepas (Unequip)
      $$('#skin-items-grid .item-unequip-btn').forEach(btn => {
        btn.onclick = async () => {
          const slot = btn.dataset.slot;

          const nextAvatar = { ...(this.avatarDraft || {}) };
          delete nextAvatar[slot];

          btn.disabled = true;
          btn.textContent = '...';

          try {
            const res = await API.updateAvatar(nextAvatar);
            const savedAvatar = res?.avatar || nextAvatar;
            this.avatarDraft = savedAvatar;
            if (this.profileData) this.profileData.avatar = savedAvatar;
            if (Player.data) Player.data.avatar = savedAvatar;

            if (this.inventoryData?.items) {
              this.inventoryData.items.forEach(i => {
                if (i.slot === slot) i.equipped = false;
              });
            }

            const updateHeroShowcase = (savedAv, srvPassives) => {
              const previewEl = $('#avatar-live-box');
              if (previewEl && window.Avatar) previewEl.innerHTML = Avatar.renderAvatar(savedAv);
              const upStats = srvPassives || calcCurrentPassives(savedAv);
              if (this.inventoryData) this.inventoryData.passives = upStats;
              const sGrid = $('#skin-stats-grid');
              if (sGrid) sGrid.innerHTML = buildStatsGridHtml(upStats);
              const sSets = $('#skin-active-sets');
              if (sSets) sSets.innerHTML = buildSetHtml(upStats);
            };

            toast('Skin berhasil dilepas.');
            updateHeroShowcase(savedAvatar, res?.passives);
            renderItems();
          } catch (e) {
            toast('Gagal melepas skin: ' + (e.message || e.code));
            btn.disabled = false;
            btn.textContent = 'Lepas';
          }
        };
      });
    };

    $$('.skin-owner-btn').forEach(btn => {
      btn.onclick = () => {
        this.skinOwnerFilter = btn.dataset.owner;
        $$('.skin-owner-btn').forEach(b => {
          if (b === btn) { b.classList.remove('ghost'); b.classList.add('active'); }
          else { b.classList.add('ghost'); b.classList.remove('active'); }
        });
        updateSkinRarityBar();
        renderItems();
      };
    });

    $$('.skin-cat-btn').forEach(btn => {
      btn.onclick = () => {
        this.skinCatFilter = btn.dataset.cat;
        $$('.skin-cat-btn').forEach(b => {
          if (b === btn) { b.classList.remove('ghost'); b.classList.add('active'); }
          else { b.classList.add('ghost'); b.classList.remove('active'); }
        });
        updateSkinRarityBar();
        renderItems();
      };
    });

    $$('.skin-rarity-btn').forEach(btn => {
      btn.onclick = () => {
        this.skinRarityFilter = btn.dataset.rarity;
        $$('.skin-rarity-btn').forEach(b => {
          if (b === btn) { b.classList.remove('ghost'); b.classList.add('active'); }
          else { b.classList.add('ghost'); b.classList.remove('active'); }
        });
        renderItems();
      };
    });

    updateSkinRarityBar();
    renderItems();
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
    const maxSlots = skillsRes.slots || (skillsRes.hasSlot4 ? 4 : 3);
    const slotIndices = Array.from({ length: maxSlots }, (_, i) => i);
    this.activeLoadoutMode = this.activeLoadoutMode || 'adventure';
    const activeMode = this.activeLoadoutMode;
    const adventureLoadout = skillsRes.rawLoadout || skillsRes.loadout || [];
    const duelLoadout = skillsRes.rawDuelLoadout || skillsRes.duelLoadout || adventureLoadout;
    const activeLoadout = activeMode === 'duel' ? duelLoadout : adventureLoadout;
    const skillsList = skillsRes.skills || [];

    const bossLoadout = skillsRes.duelBossLoadout || {
      slots: [],
      rawSlots: [null, null, null, null, null],
      unlockedCount: 0,
      maxAllowedRarity: null,
      playerLevel: 1,
      activeBossSkills: []
    };
    const pLevel = bossLoadout.playerLevel || (this.profileData?.player?.level ?? (Player.data?.level ?? 1));
    const TIER_ICON = { common: '⚪', rare: '🔵', epic: '🟣', legend: '🟡' };
    const RARITY_LABEL = { common: 'Common', rare: 'Rare', epic: 'Epic', legend: 'Legend' };

    let bossLoadoutHtml = '';
    if (activeMode === 'duel') {
      const bossSlots = (bossLoadout.slots && bossLoadout.slots.length === 5)
        ? bossLoadout.slots
        : Array.from({ length: 5 }, (_, idx) => ({
            slotIndex: idx,
            unlocked: idx < (bossLoadout.unlockedCount || 0),
            unlockLevel: 5 * (idx + 1),
            monster: null,
            skills: []
          }));

      bossLoadoutHtml = `
        <!-- LOADOUT BOS BATTLE VS PLAYER (5 SLOT) -->
        <div class="card" style="padding:14px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong);margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
            <div>
              <h3 style="font-size:0.95rem;margin:0;color:#fff;display:flex;align-items:center;gap:6px">
                👹 Loadout Bos Duel PvP (5 Slot)
              </h3>
              <div style="font-size:0.75rem;color:var(--c-muted);margin-top:2px">
                Terbuka: <b style="color:var(--c-primary)">${bossLoadout.unlockedCount}/5 Slot</b> · Rarity Maks: <span class="chip small" style="text-transform:uppercase;font-weight:700">${RARITY_LABEL[bossLoadout.maxAllowedRarity] || 'Belum'}</span> (Lv. ${pLevel})
              </div>
            </div>
            <span style="font-size:0.72rem;color:var(--c-muted);text-align:right">Pasang bos kalah</span>
          </div>

          <!-- RULE BANNER -->
          <div style="padding:6px 10px;background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.25);border-radius:8px;font-size:0.7rem;color:#c7d2fe;line-height:1.35;margin-bottom:10px">
            💡 <b>Info:</b> Terbuka 1 slot tiap kelipatan Lv.5. Batas Rarity: Lv 5-10 Common, Lv 11-15 Rare, Lv 16-20 Epic, Lv 20+ Legend. Jurus bos aktif otomatis saat battle vs player!
          </div>

          <!-- 5 SLOTS GRID -->
          <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:6px">
            ${bossSlots.map(s => {
              const idx = s.slotIndex;
              const isLocked = !s.unlocked;
              const m = s.monster;
              const MRenderer = typeof Monsters !== 'undefined' ? Monsters : null;
              const monsterSvg = (m && MRenderer)
                ? MRenderer.renderMonster(m, { size: 36, tier: m.tier })
                : (m ? `<span style="font-size:1.4rem">${m.elementIcon || '👹'}</span>` : '');

              if (isLocked) {
                return `
                  <div class="loadout-boss-slot card locked"
                    data-slot-idx="${idx}"
                    data-locked="true"
                    data-unlock-level="${s.unlockLevel}"
                    role="button"
                    tabindex="0"
                    style="padding:8px 3px;border-radius:10px;text-align:center;cursor:pointer;position:relative;background:rgba(0,0,0,0.25);border:1px dashed rgba(255,255,255,0.12);opacity:0.6"
                    title="Slot ${idx + 1} terkunci (Buka di Lv. ${s.unlockLevel})">
                    <div style="font-size:1.3rem;margin-bottom:2px">🔒</div>
                    <div style="font-size:0.7rem;font-weight:700;color:var(--c-muted)">Slot ${idx + 1}</div>
                    <div style="font-size:0.62rem;color:#ef4444;font-weight:600">Lv. ${s.unlockLevel}</div>
                  </div>
                `;
              }

              if (!m) {
                return `
                  <div class="loadout-boss-slot card empty"
                    data-slot-idx="${idx}"
                    data-locked="false"
                    role="button"
                    tabindex="0"
                    style="padding:8px 3px;border-radius:10px;text-align:center;cursor:pointer;position:relative;background:rgba(255,255,255,0.03);border:1px dashed var(--c-primary);transition:all 0.15s ease"
                    title="Ketuk untuk memasang bos di Slot ${idx + 1}">
                    <div style="font-size:1.3rem;margin-bottom:2px">➕</div>
                    <div style="font-size:0.7rem;font-weight:700;color:#fff">Slot ${idx + 1}</div>
                    <div style="font-size:0.62rem;color:var(--c-primary);font-weight:600">Pasang</div>
                  </div>
                `;
              }

              return `
                <div class="loadout-boss-slot card filled"
                  data-slot-idx="${idx}"
                  data-locked="false"
                  role="button"
                  tabindex="0"
                  style="padding:6px 2px;border-radius:10px;text-align:center;cursor:pointer;position:relative;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.2);transition:all 0.15s ease"
                  title="Ketuk untuk mengganti/melepas bos di Slot ${idx + 1}">
                  <div style="width:36px;height:36px;margin:0 auto 2px auto;display:flex;align-items:center;justify-content:center;overflow:hidden">
                    ${monsterSvg}
                  </div>
                  <div style="font-size:0.68rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 2px">
                    ${esc(m.name)}
                  </div>
                  <div style="font-size:0.6rem;color:${m.elementColor || 'var(--c-muted)'};font-weight:600">
                    ${TIER_ICON[m.tier] || ''} ${s.skills ? s.skills.length : 1} Jurus
                  </div>
                  <div style="font-size:0.58rem;color:var(--c-primary);margin-top:1px;font-weight:600">🔄 Ganti</div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- JURUS BOS AKTIF -->
          ${(bossLoadout.activeBossSkills && bossLoadout.activeBossSkills.length > 0) ? `
            <div style="margin-top:12px;border-top:1px solid rgba(255,255,255,0.08);padding-top:10px">
              <div style="font-size:0.8rem;font-weight:700;color:#fcd34d;margin-bottom:6px;display:flex;align-items:center;gap:6px">
                ✨ Jurus & Kekuatan Bos Aktif (${bossLoadout.activeBossSkills.length})
              </div>
              <div style="display:flex;flex-direction:column;gap:6px">
                ${bossLoadout.activeBossSkills.map(sk => `
                  <div style="padding:6px 8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;font-size:0.72rem;display:flex;align-items:flex-start;gap:6px">
                    <span style="font-size:1.1rem;line-height:1">${sk.icon || '✨'}</span>
                    <div style="flex:1">
                      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                        <strong style="color:#fff">${esc(sk.name)}</strong>
                        <span class="chip small" style="font-size:0.62rem;padding:1px 4px;background:rgba(255,255,255,0.08)">Bos: ${esc(sk.bossName || '')}</span>
                        <span class="chip small" style="font-size:0.62rem;padding:1px 4px;background:rgba(245,158,11,0.15);color:#fbbf24">${esc(sk.type || 'Pasif')}</span>
                      </div>
                      <div style="color:#cbd5e1;font-size:0.68rem;margin-top:2px;line-height:1.3">
                        ${esc(sk.text || '')}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : `
            <div style="margin-top:10px;text-align:center;padding:8px;background:rgba(255,255,255,0.02);border-radius:8px;font-size:0.72rem;color:var(--c-muted)">
              Belum ada bos yang dipasang. Pasang bos untuk mengaktifkan jurus saktinya!
            </div>
          `}
        </div>
      `;
    }

    slot.innerHTML = `
      <!-- SWITCHER LOADOUT (PETUALANGAN VS BATTLE VS PLAYER) -->
      <div style="display:flex;gap:8px;background:rgba(255,255,255,0.06);padding:4px;border-radius:12px;margin-bottom:12px">
        <button class="btn small ${activeMode === 'adventure' ? 'primary' : 'ghost'} btn-loadout-mode" data-mode="adventure" style="flex:1;font-weight:700;font-size:0.8rem">
          🗺️ Petualangan
        </button>
        <button class="btn small ${activeMode === 'duel' ? 'primary' : 'ghost'} btn-loadout-mode" data-mode="duel" style="flex:1;font-weight:700;font-size:0.8rem">
          ⚔️ Battle vs Player
        </button>
      </div>

      ${bossLoadoutHtml}

      <!-- LOADOUT SLOTS -->
      <div class="card" style="padding:14px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <h3 style="font-size:0.95rem;margin:0;color:#fff">
            ${activeMode === 'duel' ? '🎯 Taktik Player Duel' : '🎯 Loadout Petualangan'} (${maxSlots} Slot)
          </h3>
          <span style="font-size:0.75rem;color:var(--c-muted)">Ketuk slot untuk ganti</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${slotIndices.map(idx => {
            const skillId = activeLoadout[idx];
            const sk = skillId ? skillsList.find(x => x.id === skillId) : null;
            const curLv = sk ? (sk.level || 1) : 1;
            const slotSkillSvg = sk
              ? ((window.SkillArt && SkillArt.hasSkill(sk.id))
                  ? SkillArt.renderSkill(sk.id, curLv, { size: 42, animated: 'lite' })
                  : sk.icon)
              : '➕';
            return `
              <div class="loadout-slot card ${sk ? 'loadout-slot-row filled' : 'loadout-slot-row'}"
                data-idx="${idx}"
                data-testid="loadout-slot-${idx}"
                role="button"
                tabindex="0"
                style="padding:10px 12px;border-radius:12px;display:flex;flex-direction:row;align-items:center;justify-content:space-between;cursor:pointer;position:relative;background:${sk ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.04)'};border:1px ${sk ? 'solid rgba(56,189,248,0.4)' : 'dashed rgba(255,255,255,0.2)'};transition:all 0.15s ease"
                title="Ketuk untuk ganti skill Slot ${idx + 1}">
                <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1">
                  <div style="width:42px;height:42px;border-radius:10px;background:transparent;display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0;overflow:hidden">
                    ${slotSkillSvg}
                  </div>
                  <div style="min-width:0;flex:1">
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                      <span class="chip small" style="font-size:0.65rem;padding:1px 6px;background:rgba(255,255,255,0.08);color:var(--c-muted);font-weight:700">Slot ${idx + 1}</span>
                      <strong style="font-size:0.9rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                        ${sk ? esc(sk.name) : '<span style="color:var(--c-muted)">Slot Kosong</span>'}
                      </strong>
                      ${sk ? `<span class="chip small" style="font-size:0.65rem;padding:1px 6px;background:rgba(56,189,248,0.15);color:#38bdf8;font-weight:700">Lv. ${sk.level || 1}</span>` : ''}
                    </div>
                    <div style="font-size:0.72rem;color:var(--c-muted);margin-top:3px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                      ${sk ? `
                        <span>⚡ Biaya: <strong style="color:#fcd34d">${sk.costEnergy || sk.cost || 1} energi</strong></span>
                        <span>·</span>
                        <span>🔄 Maks: <strong style="color:#38bdf8">${sk.usesPerBattle || 2}×</strong> per laga</span>
                      ` : `
                        <span style="color:var(--c-muted)">Ketuk untuk memilih taktik skill</span>
                      `}
                    </div>
                  </div>
                </div>
                <div class="btn small ghost" style="padding:4px 10px;font-size:0.72rem;color:var(--c-primary);font-weight:700;border:1px solid rgba(245,158,11,0.3);background:rgba(245,158,11,0.08);border-radius:8px;display:flex;align-items:center;gap:4px;flex-shrink:0;margin-left:8px">
                  🔄 Ganti
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- DAFTAR SKILL -->
      <h3 style="font-size:0.95rem;margin:12px 0 6px 4px;color:var(--c-muted)">⚡ ${skillsList.length} Taktik Skill Petualang</h3>
      <div class="stack" style="gap:10px" id="skills-cards-list"></div>
    `;

    const cardsContainer = $('#skills-cards-list');
    cardsContainer.innerHTML = skillsList.map(s => {
      const isMax = s.level >= (s.maxLevel || 5);
      const cost = s.upgradeCost || 0;
      const isEquipped = activeLoadout.includes(s.id);

      const pipsFilled = '●'.repeat(Math.min(5, Math.max(1, s.level || 1)));
      const pipsEmpty = '○'.repeat(Math.max(0, 5 - (s.level || 1)));
      const pipsStr = pipsFilled + pipsEmpty;

      let effectDesc = '';
      if (isMax) {
        effectDesc = `<b>Efek:</b> ${esc(s.effectNow || s.descNow || s.desc || '')} <span style="color:#10b981;font-weight:700">(Maksimum 🎉)</span>`;
      } else {
        const nextEff = s.effectNext || s.descNext || '';
        effectDesc = `<b>Efek:</b> ${esc(s.effectNow || s.descNow || s.desc || '')}${nextEff ? ` <span style="color:var(--c-primary);font-weight:700">→</span> <span style="color:#e2e8f0">${esc(nextEff)}</span>` : ''}`;
      }

      const costEnergy = s.costEnergy || s.cost || 1;
      const canUpgrade = Boolean(s.canUpgrade);
      const btnLabel = isMax ? 'Sudah Maksimum 🎉' : (!s.owned ? 'Belum Terbuka' : `Upgrade — ${cost} 🪙`);

      const cardLv = s.level || 1;
      const cardSkillSvg = (window.SkillArt && SkillArt.hasSkill(s.id))
        ? SkillArt.renderSkill(s.id, cardLv, { size: 44, animated: 'lite' })
        : (s.icon || '⚡');

      return `
        <div class="card skill-card" data-testid="skill-card-${s.id}" style="padding:14px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong);display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="skill-avatar-btn"
                data-skill-id="${s.id}"
                data-testid="skill-avatar-${s.id}"
                role="button"
                tabindex="0"
                style="cursor:pointer;width:44px;height:44px;display:flex;align-items:center;justify-content:center;flex-shrink:0"
                title="Ketuk avatar untuk melihat detail efek tiap kenaikan level">
                ${cardSkillSvg}
              </div>
              <div class="skill-title-btn" data-skill-id="${s.id}" role="button" tabindex="0" style="cursor:pointer" title="Ketuk untuk melihat detail efek tiap kenaikan level">
                <strong style="color:#fff;font-size:0.95rem;display:flex;align-items:center;gap:4px">
                  ${esc(s.name)} <span style="font-size:0.75rem;color:var(--c-primary)">ℹ️</span>
                </strong>
                <div style="font-size:0.75rem;color:var(--c-muted);margin-top:2px">
                  <span data-testid="skill-level-${s.id}" style="color:var(--c-primary);font-weight:700">${pipsStr} Lv ${s.level || 1}/5</span>
                  ${!s.owned ? ` · <span style="color:#ef4444">Buka di Lv. ${s.unlockLevel}</span>` : ''}
                </div>
              </div>
            </div>
            ${isEquipped ? `<span class="chip good" style="font-size:0.75rem">Dipasang (${activeMode === 'duel' ? 'PvP' : 'Petualangan'})</span>` : ''}
          </div>

          <div style="font-size:0.82rem;color:#cbd5e1;line-height:1.35">
            ${effectDesc}
          </div>

          <div style="font-size:0.75rem;color:var(--c-muted)">
            ⚡ Biaya pemakaian: <strong>${costEnergy} energi</strong> · 🔄 Pemakaian: <strong>${s.usesPerBattle || 2}×</strong> per laga
          </div>

          <div style="display:flex;gap:8px;align-items:center;margin-top:4px">
            <button class="btn small grow skill-upgrade-btn ${canUpgrade ? 'primary' : 'secondary dimmed'}"
              data-testid="skill-upgrade-btn-${s.id}"
              data-id="${s.id}"
              aria-disabled="${!canUpgrade}">
              ${esc(btnLabel)}
            </button>
            ${s.owned && !isEquipped ? `
              <button class="btn small ghost btn-equip-skill" data-id="${s.id}">Pasang</button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Wire Mode Switcher Buttons
    $$('.btn-loadout-mode', slot).forEach(btn => {
      btn.onclick = () => {
        this.activeLoadoutMode = btn.dataset.mode;
        this.renderTabSkill(slot);
      };
    });

    // Wire Upgrade Buttons
    $$('#skills-cards-list button[data-testid^="skill-upgrade-btn-"]').forEach(btn => {
      btn.onclick = () => {
        const skillId = btn.dataset.id;
        const sk = skillsList.find(x => x.id === skillId);
        if (!sk) return;

        const isAriaDisabled = btn.getAttribute('aria-disabled') === 'true';
        if (isAriaDisabled || !sk.canUpgrade) {
          let reasonMsg = 'Skill belum dapat ditingkatkan';
          if (sk.reason === 'NOT_OWNED' || !sk.owned) {
            reasonMsg = 'Skill ini belum kamu miliki';
          } else if (sk.reason === 'MAX_LEVEL' || sk.level >= 5) {
            reasonMsg = 'Sudah level maksimum 🎉';
          } else if (sk.reason === 'NOT_ENOUGH_COINS' || playerCoins < (sk.upgradeCost || 0)) {
            const kurang = Math.max(1, (sk.upgradeCost || 0) - playerCoins);
            reasonMsg = `Koin belum cukup — kurang ${kurang} 🪙`;
          }
          toast(reasonMsg, 'skill-upgrade-toast');
          return;
        }

        // Active upgrade button -> confirm dialog
        const cost = sk.upgradeCost || 0;
        this.showConfirmModal(
          `Upgrade ${sk.name}?`,
          `Upgrade ${sk.name} ke Lv ${sk.level + 1}? −${cost} 🪙`,
          `Upgrade (${cost} 🪙)`,
          async () => {
            btn.disabled = true;
            btn.textContent = 'Memproses...';
            const idemKey = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : (`upg-${sk.id}-${sk.level + 1}-${Date.now()}`);
            try {
              const upgRes = await API.upgradeSkill(sk.id, idemKey);
              if (upgRes.ok) {
                toast(`Skill ${sk.name} berhasil naik ke Level ${upgRes.skill ? upgRes.skill.level : upgRes.newLevel}! ✨`);
                if (Player.data) Player.data.coins = upgRes.coins;
                if (this.profileData?.player) this.profileData.player.coins = upgRes.coins;
                const coinEl = $('#prof-coins-val');
                if (coinEl) coinEl.textContent = upgRes.coins;
                $$('.coins-val').forEach(el => el.textContent = upgRes.coins);
                await this.renderActiveTab();
              } else {
                toast(upgRes.error?.message || 'Gagal upgrade skill', 'skill-upgrade-toast');
                btn.disabled = false;
                btn.textContent = `Upgrade — ${cost} 🪙`;
              }
            } catch (err) {
              toast('Gagal, coba lagi', 'skill-upgrade-toast');
              btn.disabled = false;
              btn.textContent = `Upgrade — ${cost} 🪙`;
            }
          },
          sk.icon || '⚡',
          'skill-upgrade-confirm'
        );
      };
    });

    // Wire Click on Boss Loadout Slots
    $$('.loadout-boss-slot', slot).forEach(slotEl => {
      slotEl.onclick = () => {
        const isLocked = slotEl.dataset.locked === 'true';
        const unlockLevel = slotEl.dataset.unlockLevel;
        const idx = parseInt(slotEl.dataset.slotIdx, 10);
        if (isLocked) {
          toast(`Slot ${idx + 1} terkunci! Capai Level ${unlockLevel} untuk membukanya. ✨`, 'boss-slot-toast');
          return;
        }
        this.openSelectBossForSlotModal(idx, bossLoadout, pLevel);
      };
    });

    // Wire Click on Loadout Slot (Tap slot opens modal to pick skill)
    $$('.loadout-slot', slot).forEach(slotEl => {
      slotEl.onclick = () => {
        const idx = parseInt(slotEl.dataset.idx, 10);
        this.openSelectSkillForSlotModal(idx, activeLoadout, skillsList, activeMode, maxSlots);
      };
    });

    // Wire Equip to loadout (Click Pasang button opens modal to pick slot)
    $$('.btn-equip-skill').forEach(btn => {
      btn.onclick = () => {
        const skillId = btn.dataset.id;
        const sk = skillsList.find(x => x.id === skillId);
        if (!sk) return;
        this.openSelectSlotToReplaceModal(sk, activeLoadout, skillsList, activeMode, maxSlots);
      };
    });

    // Wire Click on Skill Avatar & Title to open Level Details Modal (T-58)
    $$('.skill-avatar-btn, .skill-title-btn', slot).forEach(btn => {
      btn.onclick = () => {
        const skId = btn.dataset.skillId;
        if (skId) this.showSkillDetailModal(skId);
      };
    });

    // Optimasi scroll 60fps: jeda sementara animasi saat container sedang digulirkan cepat
    let scrollTid = null;
    const onScrollActive = () => {
      if (!slot.classList.contains('is-scrolling')) {
        slot.classList.add('is-scrolling');
      }
      clearTimeout(scrollTid);
      scrollTid = setTimeout(() => {
        slot.classList.remove('is-scrolling');
      }, 100);
    };
    if (slot._skillScrollHandler) {
      window.removeEventListener('scroll', slot._skillScrollHandler);
    }
    slot._skillScrollHandler = onScrollActive;
    window.addEventListener('scroll', onScrollActive, { passive: true });
  },

  getSkillPerLevelInfo(skillId) {
    const table = {
      red_potion: {
        name: 'Ramuan Merah',
        icon: '🍷',
        desc: 'Ramuan ajaib yang melewati soal sulit saat ini dan menggantinya dengan soal paling mudah, serta melipatgandakan damage ke bos secara masif!',
        levels: [
          { level: 1, energy: 3, uses: 1, effect: 'Lewati soal saat ini ➔ diganti 1 soal paling mudah dengan Damage Super ×3.0!' },
          { level: 2, energy: 3, uses: 1, effect: 'Lewati soal saat ini ➔ diganti 1 soal paling mudah dengan Damage Super ×3.5!' },
          { level: 3, energy: 3, uses: 1, effect: 'Lewati soal saat ini ➔ diganti 2 soal paling mudah berturut-turut 🔥 dengan Damage Super ×3.5!' },
          { level: 4, energy: 2, uses: 2, effect: 'Biaya energi turun jadi 2! 2 soal termudah berturut-turut 🔥 dengan Damage Super ×4.0, bisa dipakai 2× per laga!' },
          { level: 5, energy: 2, uses: 2, effect: 'Kekuatan Puncak! 3 soal termudah berturut-turut 💥 dengan Damage Super Dahsyat ×5.0!' },
        ]
      },
      eliminate_one: {
        name: 'Coret Satu',
        icon: '✏️',
        desc: 'Mencoret pilihan jawaban yang salah secara acak untuk mempermudah menemukan jawaban benar.',
        levels: [
          { level: 1, energy: 1, uses: 3, effect: 'Coret 1 pilihan jawaban salah (Biaya: 1 energi, 3× per laga).' },
          { level: 2, energy: 1, uses: 3, effect: 'Coret 1 pilihan jawaban salah (Biaya: 1 energi, 3× per laga).' },
          { level: 3, energy: 1, uses: 4, effect: 'Pemakaian naik jadi 4× per laga, dengan 1× pemakaian gratis tanpa potong energi!' },
          { level: 4, energy: 1, uses: 4, effect: 'Pemakaian 4× per laga dengan 1× pemakaian gratis tanpa potong energi.' },
          { level: 5, energy: 1, uses: 5, effect: 'Kekuatan Puncak! Pemakaian 5× per laga dengan 2× pemakaian gratis tanpa potong energi!' },
        ]
      },
      eagle_eye: {
        name: 'Mata Elang',
        icon: '🦅',
        desc: 'Penglihatan tajam elang yang langsung melenyapkan 2 pilihan jawaban salah sekaligus.',
        levels: [
          { level: 1, energy: 2, uses: 2, effect: 'Coret 2 pilihan jawaban salah sekaligus (Biaya: 2 energi, 2× per laga).' },
          { level: 2, energy: 2, uses: 2, effect: 'Coret 2 pilihan jawaban salah sekaligus (Biaya: 2 energi, 2× per laga).' },
          { level: 3, energy: 2, uses: 3, effect: 'Kapasitas bertambah! Bisa digunakan 3× per laga.' },
          { level: 4, energy: 1, uses: 3, effect: 'Efisiensi tinggi! Biaya energi turun menjadi hanya 1 energi (3× per laga).' },
          { level: 5, energy: 1, uses: 4, effect: 'Kekuatan Puncak! Biaya 1 energi dan kapasitas bertambah menjadi 4× per laga!' },
        ]
      },
      heal: {
        name: 'Ramuan Hijau',
        icon: '🧪',
        desc: 'Cairan herbal ajaib yang memulihkan HP pemain seketika saat pertempuran sengit.',
        levels: [
          { level: 1, energy: 1, uses: 2, effect: 'Pulihkan +25 HP seketika (Biaya: 1 energi, 2× per laga).' },
          { level: 2, energy: 1, uses: 2, effect: 'Pemulihan meningkat menjadi +35 HP seketika.' },
          { level: 3, energy: 1, uses: 2, effect: 'Pemulihan meningkat menjadi +45 HP seketika.' },
          { level: 4, energy: 1, uses: 3, effect: 'Pemulihan meningkat menjadi +55 HP dan kapasitas bertambah jadi 3× per laga!' },
          { level: 5, energy: 1, uses: 3, effect: 'Kekuatan Puncak! Memulihkan +65 HP seketika (3× per laga).' },
        ]
      },
      shield: {
        name: 'Perisai Kayu',
        icon: '🛡️',
        desc: 'Membentuk dinding pertahanan kokoh yang menyerap serangan telak berikutnya dari monster bos.',
        levels: [
          { level: 1, energy: 2, uses: 2, effect: 'Menyerap 20 damage berikutnya dari serangan bos.' },
          { level: 2, energy: 2, uses: 2, effect: 'Daya serap meningkat menjadi 30 damage.' },
          { level: 3, energy: 2, uses: 3, effect: 'Daya serap meningkat menjadi 40 damage dan kapasitas bertambah jadi 3× per laga!' },
          { level: 4, energy: 2, uses: 3, effect: 'Daya serap meningkat menjadi 50 damage (3× per laga).' },
          { level: 5, energy: 2, uses: 4, effect: 'Kekuatan Puncak! Menyerap 60 damage dan kapasitas pemakaian bertambah jadi 4× per laga!' },
        ]
      },
      power_strike: {
        name: 'Tebasan Super',
        icon: '⚔️',
        desc: 'Memusatkan seluruh tenaga pada satu tebasan pedang mematikan yang menggandakan damage ke bos.',
        levels: [
          { level: 1, energy: 3, uses: 2, effect: 'Damage ke bos berlipat ganda ×2.0 bila jawaban benar!' },
          { level: 2, energy: 3, uses: 2, effect: 'Damage ke bos meningkat menjadi ×2.25 bila jawaban benar!' },
          { level: 3, energy: 3, uses: 2, effect: 'Damage ke bos meningkat menjadi ×2.5 bila jawaban benar!' },
          { level: 4, energy: 3, uses: 3, effect: 'Damage meningkat menjadi ×2.75 dan kapasitas bertambah jadi 3× per laga!' },
          { level: 5, energy: 2, uses: 3, effect: 'Kekuatan Puncak! Biaya turun jadi 2 energi dan damage berlipat ×3.0!' },
        ]
      },
      time_freeze: {
        name: 'Waktu Beku',
        icon: '❄️',
        desc: 'Membekukan waktu sejenak untuk memberikan waktu berpikir ekstra pada soal yang rumit.',
        levels: [
          { level: 1, energy: 3, uses: 2, effect: 'Menambah +8 detik waktu berpikir pada soal ini.' },
          { level: 2, energy: 3, uses: 2, effect: 'Waktu bertambah meningkat menjadi +10 detik.' },
          { level: 3, energy: 3, uses: 3, effect: 'Waktu bertambah menjadi +12 detik dan kapasitas bertambah jadi 3× per laga!' },
          { level: 4, energy: 2, uses: 3, effect: 'Biaya energi turun jadi 2 energi dan waktu bertambah +14 detik!' },
          { level: 5, energy: 2, uses: 4, effect: 'Kekuatan Puncak! Waktu bertambah +16 detik dan kapasitas 4× per laga!' },
        ]
      },
      combo_keeper: {
        name: 'Penjaga Combo',
        icon: '🔥',
        desc: 'Melindungi rantai kombo agar tidak putus/reset saat terjadi 1 kesalahan jawaban atau timeout.',
        levels: [
          { level: 1, energy: 2, uses: 1, effect: 'Streak kombo terlindungi 1x dari kesalahan/timeout berikutnya.' },
          { level: 2, energy: 2, uses: 1, effect: 'Streak kombo terlindungi 1x dari kesalahan/timeout berikutnya.' },
          { level: 3, energy: 2, uses: 2, effect: 'Kapasitas pemakaian bertambah menjadi 2× per laga!' },
          { level: 4, energy: 2, uses: 2, effect: 'Streak kombo terlindungi 1x dan pemakaian 2× per laga.' },
          { level: 5, energy: 1, uses: 3, effect: 'Kekuatan Puncak! Biaya turun jadi 1 energi dan kapasitas 3× per laga!' },
        ]
      },
      lucky_pouch: {
        name: 'Kantong Hoki',
        icon: '💰',
        desc: 'Mantra keberuntungan yang menggandakan drop koin emas dari setiap soal yang dijawab benar.',
        levels: [
          { level: 1, energy: 2, uses: 1, effect: 'Sisa laga: peluang koin drop ×2, jumlah koin yang didapat ×1.5!' },
          { level: 2, energy: 2, uses: 1, effect: 'Sisa laga: peluang koin drop ×2, jumlah koin yang didapat ×1.75!' },
          { level: 3, energy: 2, uses: 2, effect: 'Jumlah koin meningkat jadi ×2.0 dan pemakaian bertambah jadi 2× per laga!' },
          { level: 4, energy: 2, uses: 2, effect: 'Jumlah koin meningkat jadi ×2.25 (pemakaian 2× per laga).' },
          { level: 5, energy: 2, uses: 2, effect: 'Kekuatan Puncak! Peluang koin drop ×2 dan jumlah koin melimpah ×2.5!' },
        ]
      },
      second_chance: {
        name: 'Jimat Keberuntungan',
        icon: '🍀',
        desc: 'Memberikan kesempatan kedua saat jawaban salah untuk menjawab sekali lagi tanpa terkena damage.',
        levels: [
          { level: 1, energy: 4, uses: 1, effect: 'Jika jawaban salah: boleh coba lagi 1x (damage bos ×0.5).' },
          { level: 2, energy: 4, uses: 1, effect: 'Coba lagi jika salah dengan damage bos meningkat menjadi ×0.6.' },
          { level: 3, energy: 3, uses: 1, effect: 'Biaya energi turun jadi 3 energi dan damage bos coba lagi ×0.7.' },
          { level: 4, energy: 3, uses: 2, effect: 'Kapasitas pemakaian naik jadi 2× per laga dan damage coba lagi ×0.85.' },
          { level: 5, energy: 3, uses: 2, effect: 'Kekuatan Puncak! Coba lagi tanpa penalti damage (damage bos penuh ×1.0, 2× per laga)!' },
        ]
      }
    };
    return table[skillId] || null;
  },

  showSkillDetailModal(skillId) {
    const skillsList = this.skillsData?.skills || [];
    const s = skillsList.find(x => x.id === skillId);
    const info = this.getSkillPerLevelInfo(skillId);
    if (!s && !info) return;

    const currentLevel = s ? (s.level || 1) : 1;
    const isOwned = Boolean(s && s.owned);
    const unlockLevel = s ? (s.unlockLevel || 1) : 1;
    const name = s ? s.name : (info ? info.name : skillId);
    const icon = s ? s.icon : (info ? info.icon : '⚡');
    const desc = info?.desc || s?.effectDesc || '';
    const UPGRADE_BASE_COST = (window.Economy && window.Economy.SKILL_BASE_UPGRADE) || { 1: 175, 2: 438, 3: 875, 4: 1575 };
    const mult = (window.Economy && window.Economy.SKILL_MULTIPLIERS && window.Economy.SKILL_MULTIPLIERS[skillId]) || 1.0;

    const old = $('#modal-skill-detail');
    if (old) old.remove();

    const modal = document.createElement('div');
    modal.id = 'modal-skill-detail';
    modal.className = 'modal-mask active';
    modal.setAttribute('data-testid', 'modal-skill-detail');
    modal.style.cssText = 'z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,0.8);backdrop-filter:blur(6px);position:fixed;inset:0';

    modal.innerHTML = `
      <div class="card modal" style="max-width:440px;width:100%;max-height:90vh;display:flex;flex-direction:column;border-radius:18px;background:var(--c-surface);border:1px solid var(--c-surface-strong);box-shadow:0 20px 40px rgba(0,0,0,0.7);overflow:hidden">
        <div style="padding:16px 18px 12px 18px;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:flex-start">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;flex-shrink:0">
              ${(window.SkillArt && SkillArt.hasSkill(skillId)) ? SkillArt.renderSkill(skillId, currentLevel, { size: 56, animated: true }) : icon}
            </div>
            <div>
              <h3 style="margin:0;font-size:1.15rem;color:#fff;font-weight:800">${esc(name)}</h3>
              <div style="display:flex;gap:6px;align-items:center;margin-top:4px;flex-wrap:wrap">
                <span class="chip ${isOwned ? 'good' : 'bad'}" style="font-size:0.7rem;font-weight:700">
                  ${isOwned ? `Milikmu (Lv. ${currentLevel}/5)` : `Terkunci (Buka di Lv. ${unlockLevel})`}
                </span>
              </div>
            </div>
          </div>
          <button class="btn icon ghost" id="btn-close-skill-detail" style="font-size:1.2rem;padding:4px 8px;color:var(--c-muted);border-radius:8px">✕</button>
        </div>

        <div style="padding:16px 18px;overflow-y:auto;display:flex;flex-direction:column;gap:14px;flex:1">
          <div style="padding:10px 12px;background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:12px;font-size:0.8rem;color:#e2e8f0;line-height:1.4">
            💡 <b>Mekanika:</b> ${esc(desc)}
          </div>

          <div>
            <div style="font-size:0.82rem;font-weight:700;color:#94a3b8;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px">
              📈 Efek Per Kenaikan Level (Lv 1 - 5)
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${(info?.levels || []).map(lvl => {
                const isCur = isOwned && (lvl.level === currentLevel);
                const isPast = isOwned && (lvl.level < currentLevel);
                const isFuture = !isOwned || (lvl.level > currentLevel);
                const upCost = lvl.level === 1 ? null : Math.round((UPGRADE_BASE_COST[lvl.level - 1] || 100) * mult);
                const lvlSkillSvg = (window.SkillArt && SkillArt.hasSkill(skillId))
                  ? SkillArt.renderSkill(skillId, lvl.level, { size: 36, animated: isCur })
                  : '';

                return `
                  <div style="padding:10px 12px;border-radius:12px;background:${isCur ? 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(0,0,0,0.5))' : 'rgba(255,255,255,0.03)'};border:${isCur ? '1.5px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)'};display:flex;flex-direction:column;gap:4px;position:relative">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <div style="display:flex;align-items:center;gap:8px">
                        ${lvlSkillSvg ? `<div style="width:36px;height:36px;flex-shrink:0">${lvlSkillSvg}</div>` : ''}
                        <div>
                          <div style="display:flex;align-items:center;gap:6px">
                            <span style="font-size:0.8rem;font-weight:800;color:${isCur ? '#fbbf24' : '#fff'}">
                              Level ${lvl.level}
                            </span>
                            ${isCur ? `<span class="chip small" style="background:#f59e0b;color:#000;font-weight:800;font-size:0.65rem;padding:1px 6px">LEVEL AKTIF ⭐</span>` : ''}
                            ${isPast ? `<span class="chip small good" style="font-size:0.62rem;padding:1px 4px">Telah Tercapai ✓</span>` : ''}
                          </div>
                        </div>
                      </div>
                      <div style="font-size:0.72rem;color:var(--c-muted)">
                        ⚡ ${lvl.energy} Energi · 🔄 ${lvl.uses}×/laga
                      </div>
                    </div>
                    <div style="font-size:0.8rem;color:${isCur ? '#fff' : '#cbd5e1'};line-height:1.35;margin-top:2px">
                      ${esc(lvl.effect)}
                    </div>
                    ${(isFuture && upCost) ? `
                      <div style="font-size:0.7rem;color:var(--c-primary);margin-top:2px;font-weight:600">
                        🪙 Biaya Upgrade ke Lv ${lvl.level}: ${upCost} Koin
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div style="padding:12px 18px;background:rgba(255,255,255,0.03);border-top:1px solid rgba(255,255,255,0.08);display:flex;gap:8px;justify-content:flex-end">
          <button class="btn secondary small" id="btn-modal-skill-close" style="padding:8px 16px;border-radius:10px">Tutup</button>
          ${(s && s.canUpgrade) ? `
            <button class="btn primary small" id="btn-modal-skill-upgrade" style="padding:8px 16px;border-radius:10px;font-weight:700">
              Upgrade Sekarang (${s.upgradeCost || 0} 🪙)
            </button>
          ` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    $('#btn-close-skill-detail', modal).onclick = closeModal;
    $('#btn-modal-skill-close', modal).onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    const upBtn = $('#btn-modal-skill-upgrade', modal);
    if (upBtn && s) {
      upBtn.onclick = () => {
        closeModal();
        const mainUpBtn = $(`#skills-cards-list button[data-testid="skill-upgrade-btn-${s.id}"]`);
        if (mainUpBtn) mainUpBtn.click();
      };
    }
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

    const playerCoins = (shopRes && typeof shopRes.coins === 'number') ? shopRes.coins : (Player.data?.coins ?? 0);
    if (Player.data) Player.data.coins = playerCoins;
    const boxPrice = shopRes.mysteryBoxPrice || 60;
    const canAffordBox = playerCoins >= boxPrice;
    const items = shopRes.items || [];

    if (!this.shopCatFilter) this.shopCatFilter = 'ALL';
    if (!this.shopRarityFilter) this.shopRarityFilter = 'ALL';

    slot.innerHTML = `
      <!-- FILTER KATEGORI TOKO (DI PALING ATAS DENGAN WADAH STABIL BEBAS CRUSH) -->
      <div class="shop-filter-section" style="flex:0 0 auto;flex-shrink:0;display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin:2px 0 2px 2px">
          <div style="font-size:0.75rem;font-weight:700;color:var(--c-muted);text-transform:uppercase;letter-spacing:0.5px">📁 Kategori Toko</div>
        </div>
        <div class="shop-filter-bar" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;-webkit-overflow-scrolling:touch;flex:0 0 auto;flex-shrink:0;min-height:48px">
          <button class="btn small shop-cat-btn ${this.shopCatFilter === 'ALL' ? 'active' : 'ghost'}" data-cat="ALL" style="flex:0 0 auto;white-space:nowrap;padding:6px 14px">Semua (${items.length})</button>
          <button class="btn small shop-cat-btn ${this.shopCatFilter === 'hat' ? 'active' : 'ghost'}" data-cat="hat" style="flex:0 0 auto;white-space:nowrap;padding:6px 14px">Topi</button>
          <button class="btn small shop-cat-btn ${this.shopCatFilter === 'outfit' ? 'active' : 'ghost'}" data-cat="outfit" style="flex:0 0 auto;white-space:nowrap;padding:6px 14px">Pakaian</button>
          <button class="btn small shop-cat-btn ${this.shopCatFilter === 'weapon' ? 'active' : 'ghost'}" data-cat="weapon" style="flex:0 0 auto;white-space:nowrap;padding:6px 14px">Senjata</button>
          <button class="btn small shop-cat-btn ${this.shopCatFilter === 'pet' ? 'active' : 'ghost'}" data-cat="pet" style="flex:0 0 auto;white-space:nowrap;padding:6px 14px">Hewan</button>
          <button class="btn small shop-cat-btn ${this.shopCatFilter === 'bg' ? 'active' : 'ghost'}" data-cat="bg" style="flex:0 0 auto;white-space:nowrap;padding:6px 14px">Latar</button>
          <button class="btn small shop-cat-btn ${this.shopCatFilter === 'frame' ? 'active' : 'ghost'}" data-cat="frame" style="flex:0 0 auto;white-space:nowrap;padding:6px 14px">Bingkai</button>
          <button class="btn small shop-cat-btn ${this.shopCatFilter === 'title' ? 'active' : 'ghost'}" data-cat="title" style="flex:0 0 auto;white-space:nowrap;padding:6px 14px">Gelar</button>
          <button class="btn small shop-cat-btn ${this.shopCatFilter === 'permanent' ? 'active' : 'ghost'}" data-cat="permanent" style="flex:0 0 auto;white-space:nowrap;padding:6px 14px">Upgrade</button>
        </div>

        <!-- FILTER RARITY TOKO (DI SETIAP KATEGORI) -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin:4px 0 2px 2px">
          <div style="font-size:0.75rem;font-weight:700;color:var(--c-muted);text-transform:uppercase;letter-spacing:0.5px">💎 Filter Rarity</div>
          <span id="shop-filter-count" style="font-size:0.72rem;color:var(--c-primary);font-weight:700"></span>
        </div>
        <div class="shop-rarity-bar" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;flex:0 0 auto;flex-shrink:0;min-height:40px">
          <button class="btn small rarity-pill-btn shop-rarity-btn ${this.shopRarityFilter === 'ALL' ? 'active' : 'ghost'}" id="shop-rarity-all" data-rarity="ALL" data-testid="shop-filter-rarity-all" style="flex:0 0 auto;white-space:nowrap;padding:5px 12px;font-size:0.75rem">Semua</button>
          <button class="btn small rarity-pill-btn shop-rarity-btn ${this.shopRarityFilter === 'COMMON' ? 'active' : 'ghost'}" id="shop-rarity-common" data-rarity="COMMON" data-testid="shop-filter-rarity-common" style="flex:0 0 auto;white-space:nowrap;padding:5px 12px;font-size:0.75rem;border-color:rgba(148,163,184,0.4)">⚪ Common</button>
          <button class="btn small rarity-pill-btn shop-rarity-btn ${this.shopRarityFilter === 'RARE' ? 'active' : 'ghost'}" id="shop-rarity-rare" data-rarity="RARE" data-testid="shop-filter-rarity-rare" style="flex:0 0 auto;white-space:nowrap;padding:5px 12px;font-size:0.75rem;border-color:rgba(56,189,248,0.4)">🔵 Rare</button>
          <button class="btn small rarity-pill-btn shop-rarity-btn ${this.shopRarityFilter === 'EPIC' ? 'active' : 'ghost'}" id="shop-rarity-epic" data-rarity="EPIC" data-testid="shop-filter-rarity-epic" style="flex:0 0 auto;white-space:nowrap;padding:5px 12px;font-size:0.75rem;border-color:rgba(168,85,247,0.4)">🟣 Epic</button>
          <button class="btn small rarity-pill-btn shop-rarity-btn ${this.shopRarityFilter === 'LEGENDARY' ? 'active' : 'ghost'}" id="shop-rarity-legendary" data-rarity="LEGENDARY" data-testid="shop-filter-rarity-legendary" style="flex:0 0 auto;white-space:nowrap;padding:5px 12px;font-size:0.75rem;border-color:rgba(245,158,11,0.4)">🟡 Legend</button>
          <button class="btn small rarity-pill-btn shop-rarity-btn ${this.shopRarityFilter === 'MYTHIC' ? 'active' : 'ghost'}" id="shop-rarity-mythic" data-rarity="MYTHIC" data-testid="shop-filter-rarity-mythic" style="flex:0 0 auto;white-space:nowrap;padding:5px 12px;font-size:0.75rem;border-color:rgba(255,0,85,0.4)">🔴 Mythic</button>
        </div>
      </div>

      <!-- MYSTERY BOX CARD (Tampil saat kategori 'Semua' dan rarity 'Semua' aktif) -->
      <div id="shop-box-container" style="display:${(this.shopCatFilter === 'ALL' && this.shopRarityFilter === 'ALL') ? 'block' : 'none'};flex:0 0 auto;flex-shrink:0;margin-top:8px">
        <div class="card" style="padding:14px;background:linear-gradient(135deg, rgba(245,158,11,0.12), rgba(168,85,247,0.12));border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius);text-align:center">
          <div style="font-size:2.2rem;margin-bottom:2px">🎁</div>
          <h3 style="font-size:1.05rem;margin:0 0 4px 0;color:#fff">Kotak Misteri Ajaib</h3>
          <p style="font-size:0.8rem;color:var(--c-muted);margin:0 0 10px 0;line-height:1.4">
            Dapatkan 1 skin acak untuk memperkeren avatarmu! Jika item sudah dimiliki, 20 koin dikembalikan otomatis.
          </p>
          <button class="btn ${canAffordBox ? 'primary' : 'secondary'} block" id="btn-buy-box" data-testid="buy-mystery-box" ${!canAffordBox ? 'disabled' : ''}>
            ${canAffordBox ? `Buka Kotak (${boxPrice} 🪙)` : `Kurang ${boxPrice - playerCoins} 🪙`}
          </button>
        </div>
      </div>

      <!-- KATALOG ITEM TOKO GRID -->
      <div class="shop-grid" id="shop-items-grid"></div>
    `;

    const updateShopRarityBar = () => {
      const catItems = this.shopCatFilter === 'ALL'
        ? items
        : items.filter(it => it.slot === this.shopCatFilter);

      const countAll = catItems.length;
      const countCommon = catItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'COMMON').length;
      const countRare = catItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'RARE').length;
      const countEpic = catItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'EPIC').length;
      const countLeg = catItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'LEGENDARY').length;
      const countMyt = catItems.filter(it => (it.rarity || 'COMMON').toUpperCase() === 'MYTHIC').length;

      const btnAll = $('#shop-rarity-all');
      if (btnAll) btnAll.innerHTML = `Semua (${countAll})`;
      const btnCom = $('#shop-rarity-common');
      if (btnCom) btnCom.innerHTML = `⚪ Common (${countCommon})`;
      const btnRare = $('#shop-rarity-rare');
      if (btnRare) btnRare.innerHTML = `🔵 Rare (${countRare})`;
      const btnEpic = $('#shop-rarity-epic');
      if (btnEpic) btnEpic.innerHTML = `🟣 Epic (${countEpic})`;
      const btnLeg = $('#shop-rarity-legendary');
      if (btnLeg) btnLeg.innerHTML = `🟡 Legend (${countLeg})`;
      const btnShopMyt = $('#shop-rarity-mythic');
      if (btnShopMyt) btnShopMyt.innerHTML = `🔴 Mythic (${countMyt})`;
    };

    const renderShopItems = () => {
      const grid = $('#shop-items-grid');
      if (!grid) return;

      let filtered = items;
      if (this.shopCatFilter !== 'ALL') {
        filtered = filtered.filter(it => it.slot === this.shopCatFilter);
      }
      if (this.shopRarityFilter && this.shopRarityFilter !== 'ALL') {
        filtered = filtered.filter(it => (it.rarity || 'COMMON').toUpperCase() === this.shopRarityFilter);
      }

      const countEl = $('#shop-filter-count');
      if (countEl) countEl.textContent = `${filtered.length} item`;

      if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--c-muted)">Tidak ada item untuk filter kategori & rarity ini.</div>`;
        return;
      }

      grid.innerHTML = filtered.map(it => {
        const canAfford = playerCoins >= it.price;
        const rarityColor = it.rarity === 'MYTHIC' ? '#ff0055' : it.rarity === 'LEGENDARY' ? '#f59e0b' : it.rarity === 'EPIC' ? '#a855f7' : it.rarity === 'RARE' ? '#3b82f6' : '#94a3b8';
        return `
          <div class="card item-card" data-testid="item-card-${it.id}" style="padding:12px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong);display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;gap:12px;align-items:flex-start">
              <!-- THUMBNAIL + RARITY -->
              <div style="flex:0 0 68px;display:flex;flex-direction:column;align-items:center;gap:4px">
                <div class="skin-thumbnail-box" style="width:68px;height:68px;border-radius:14px;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid rgba(255,255,255,0.08);box-shadow:inset 0 2px 6px rgba(0,0,0,0.3)">
                  ${window.Avatar ? Avatar.renderThumbnail(it.id, it.slot) : '🎒'}
                </div>
                <span style="font-size:0.65rem;font-weight:800;color:${rarityColor};letter-spacing:0.5px">${it.rarity}</span>
              </div>

              <!-- MAIN INFO: TITLE, PASSIVE, LORE -->
              <div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
                  <div style="font-weight:800;font-size:0.95rem;color:#fff;line-height:1.25">${esc(it.name)}</div>
                </div>

                <!-- RPG PASSIVE BADGE -->
                ${it.passive ? `<div style="font-size:0.75rem;font-weight:700;color:#fbbf24;background:rgba(251,191,36,0.12);padding:4px 8px;border-radius:6px;border:1px solid rgba(251,191,36,0.3);line-height:1.35;word-break:break-word">✨ ${esc(it.passive.desc)}</div>` : ''}

                <!-- LORE FLAVOR TEXT -->
                ${it.lore ? `<div style="font-size:0.72rem;color:var(--c-muted);line-height:1.35;font-style:italic">${esc(it.lore)}</div>` : ''}
              </div>
            </div>

            <!-- ACTION FOOTER: HARGA & TOMBOL BELI -->
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);margin-top:2px">
              <div style="font-size:0.95rem;font-weight:800;color:#fbbf24;display:flex;align-items:center;gap:4px">🪙 ${it.price}</div>
              <div style="flex:0 0 auto;min-width:130px">
                <button class="btn small ${canAfford ? 'primary' : 'secondary'} block item-shop-buy-btn"
                  data-testid="item-buy-${it.id}"
                  data-id="${it.id}"
                  ${!canAfford ? 'disabled' : ''}>
                  ${canAfford ? 'Beli' : `Kurang ${it.price - playerCoins} 🪙`}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Wire item-shop-buy-btn
      $$('.item-shop-buy-btn', grid).forEach(btn => {
        btn.onclick = () => {
          const itemId = btn.dataset.id;
          const it = items.find(x => x.id === itemId);
          if (!it) return;

          const thumbPreview = window.Avatar ? Avatar.renderThumbnail(it.id, it.slot) : '🎒';
          const rarityColor = it.rarity === 'MYTHIC' ? '#ff0055' : it.rarity === 'LEGENDARY' ? '#f59e0b' : it.rarity === 'EPIC' ? '#a855f7' : it.rarity === 'RARE' ? '#3b82f6' : '#94a3b8';
          const pDesc = it.passive ? `<div style="margin:8px 0;padding:8px 10px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.3);border-radius:10px;color:#fbbf24;font-size:0.82rem;font-weight:700;line-height:1.35;text-align:left">✨ Efek Pasif: ${esc(it.passive.desc)}</div>` : '';
          const lDesc = it.lore ? `<div style="font-size:0.8rem;color:var(--c-muted);font-style:italic;margin:6px 0 10px 0;line-height:1.35;text-align:center">"${esc(it.lore)}"</div>` : '';
          const buyPrompt = `<div style="margin-top:8px;font-size:0.92rem;color:#f1f5f9;line-height:1.4">Beli <strong style="color:#fff">${esc(it.name)}</strong> (<span style="color:${rarityColor};font-weight:800;font-size:0.8rem;letter-spacing:0.5px">${esc(it.rarity)}</span>) seharga <strong style="color:#fbbf24">${it.price} 🪙</strong>?</div>`;
          this.showConfirmModal(
            `Beli ${it.name}?`,
            `${pDesc}${lDesc}${buyPrompt}`,
            `Beli (${it.price} 🪙)`,
            async () => {
              const idemKey = `buy-${it.id}-${Date.now()}`;
              const res = await API.buyShopItem(it.id, idemKey);
              if (res.ok) {
                toast(`Berhasil membeli ${it.name}! Cek di tab Skin. 🎒`);
                if (Player.data) Player.data.coins = res.coins;
                if (this.profileData?.player) this.profileData.player.coins = res.coins;
                const coinEl = $('#prof-coins-val');
                if (coinEl) coinEl.textContent = res.coins;
                await this.loadData();
                await this.renderActiveTab();
              }
            },
            thumbPreview
          );
        };
      });
    };

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
              if (this.profileData?.player) this.profileData.player.coins = res.coins;
              const coinEl = $('#prof-coins-val');
              if (coinEl) coinEl.textContent = res.coins;

              const it = res.item || {};
              const isDupe = res.isDuplicate;
              const msg = isDupe
                ? `Kamu mendapatkan ${it.name} (Duplikat). +${res.refund} koin dikembalikan!`
                : `Selamat! Kamu mendapatkan ${it.name} (${it.rarity})! 🎉`;
              toast(msg);
              await this.loadData();
              await this.renderActiveTab();
            }
          },
          '<div style="font-size:2.8rem">🎁</div>'
        );
      };
    }

    // Wire Category Filter Buttons in Toko
    $$('.shop-cat-btn').forEach(btn => {
      btn.onclick = () => {
        this.shopCatFilter = btn.dataset.cat;
        $$('.shop-cat-btn').forEach(b => {
          if (b === btn) { b.classList.remove('ghost'); b.classList.add('active'); }
          else { b.classList.add('ghost'); b.classList.remove('active'); }
        });
        const boxCont = $('#shop-box-container');
        if (boxCont) boxCont.style.display = (this.shopCatFilter === 'ALL' && this.shopRarityFilter === 'ALL') ? 'block' : 'none';
        updateShopRarityBar();
        renderShopItems();
      };
    });

    // Wire Rarity Filter Buttons in Toko
    $$('.shop-rarity-btn').forEach(btn => {
      btn.onclick = () => {
        this.shopRarityFilter = btn.dataset.rarity;
        $$('.shop-rarity-btn').forEach(b => {
          if (b === btn) { b.classList.remove('ghost'); b.classList.add('active'); }
          else { b.classList.add('ghost'); b.classList.remove('active'); }
        });
        const boxCont = $('#shop-box-container');
        if (boxCont) boxCont.style.display = (this.shopCatFilter === 'ALL' && this.shopRarityFilter === 'ALL') ? 'block' : 'none';
        renderShopItems();
      };
    });

    updateShopRarityBar();
    renderShopItems();
  },

  async renderTabRiwayat(slot) {
    if (!this.riwayatSubTab) this.riwayatSubTab = 'battle';
    if (!this.battleFilter) this.battleFilter = 'ALL';

    slot.innerHTML = `
      <!-- Sub-Tab Switcher (Pertempuran vs Koin) -->
      <div class="riwayat-subnav" style="display:flex;gap:6px;background:rgba(255,255,255,0.04);padding:4px;border-radius:12px;border:1px solid var(--c-surface-strong)">
        <button type="button" class="btn small ${this.riwayatSubTab === 'battle' ? 'active' : 'ghost'}" id="btn-subtab-battle" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:700">
          <span>⚔️</span> <span>Pertempuran</span>
        </button>
        <button type="button" class="btn small ${this.riwayatSubTab === 'coins' ? 'active' : 'ghost'}" id="btn-subtab-coins" style="flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font-weight:700">
          <span>🪙</span> <span>Mutasi Koin</span>
        </button>
      </div>

      <!-- Container Subcontent -->
      <div id="riwayat-subcontent" style="margin-top:10px"></div>
    `;

    const subSlot = $('#riwayat-subcontent');
    const btnBattle = $('#btn-subtab-battle');
    const btnCoins = $('#btn-subtab-coins');

    btnBattle.onclick = () => {
      if (this.riwayatSubTab !== 'battle') {
        if (window.Sfx) Sfx.play('tap');
        this.riwayatSubTab = 'battle';
        btnBattle.classList.remove('ghost'); btnBattle.classList.add('active');
        btnCoins.classList.remove('active'); btnCoins.classList.add('ghost');
        this.renderBattleHistory(subSlot);
      }
    };

    btnCoins.onclick = () => {
      if (this.riwayatSubTab !== 'coins') {
        if (window.Sfx) Sfx.play('tap');
        this.riwayatSubTab = 'coins';
        btnCoins.classList.remove('ghost'); btnCoins.classList.add('active');
        btnBattle.classList.remove('active'); btnBattle.classList.add('ghost');
        this.renderCoinHistory(subSlot);
      }
    };

    if (this.riwayatSubTab === 'battle') {
      await this.renderBattleHistory(subSlot);
    } else {
      await this.renderCoinHistory(subSlot);
    }
  },

  async renderBattleHistory(slot) {
    slot.innerHTML = `<div style="text-align:center;padding:30px;color:var(--c-muted)">Memuat riwayat pertempuran...</div>`;
    let res = null;
    try {
      res = await API.getBattleHistory(50);
      this.battleData = res;
    } catch (e) {
      slot.innerHTML = `<div style="color:var(--c-bad)">Gagal memuat riwayat pertempuran: ${esc(e.message)}</div>`;
      return;
    }

    const items = res.items || res.history || [];
    if (items.length === 0) {
      slot.innerHTML = `
        <div class="card" style="padding:24px;background:var(--c-surface);border-radius:var(--radius);text-align:center;color:var(--c-muted)">
          Belum ada riwayat pertempuran yang tercatat.
        </div>
      `;
      return;
    }

    const totalCount = items.length;
    const wonCount = items.filter(b => b.status === 'WON').length;
    const lostCount = items.filter(b => b.status !== 'WON').length;

    const currentFilter = this.battleFilter || 'ALL';
    const filteredItems = items.filter(b => {
      if (currentFilter === 'WON') return b.status === 'WON';
      if (currentFilter === 'LOST') return b.status !== 'WON';
      return true;
    });

    slot.innerHTML = `
      <!-- Filter Chips -->
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px">
        <div class="filter-chips" style="display:flex;gap:4px">
          <button type="button" class="btn mini ${currentFilter === 'ALL' ? 'active' : 'ghost'}" data-bfilter="ALL">Semua (${totalCount})</button>
          <button type="button" class="btn mini ${currentFilter === 'WON' ? 'active' : 'ghost'}" data-bfilter="WON">🏆 Menang (${wonCount})</button>
          <button type="button" class="btn mini ${currentFilter === 'LOST' ? 'active' : 'ghost'}" data-bfilter="LOST">🛡️ Kalah (${lostCount})</button>
        </div>
        <span style="font-size:0.72rem;color:var(--c-muted)">${filteredItems.length} pertempuran</span>
      </div>

      <!-- Battles List -->
      <div class="battle-history-list stack" style="gap:10px">
        ${filteredItems.map(b => {
          const isWon = b.status === 'WON';
          const isLost = b.status === 'LOST';
          const dateStr = b.createdAt ? new Date(b.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';
          const statusBadge = isWon
            ? `<span style="background:rgba(16,185,129,0.18);color:#34d399;border:1px solid rgba(16,185,129,0.35);padding:2px 8px;border-radius:8px;font-size:0.75rem;font-weight:800">🏆 MENANG</span>`
            : (isLost
              ? `<span style="background:rgba(239,68,68,0.18);color:#f87171;border:1px solid rgba(239,68,68,0.35);padding:2px 8px;border-radius:8px;font-size:0.75rem;font-weight:800">🛡️ KALAH</span>`
              : `<span style="background:rgba(156,163,175,0.18);color:#9ca3af;border:1px solid rgba(156,163,175,0.35);padding:2px 8px;border-radius:8px;font-size:0.75rem;font-weight:800">🏃 KELUAR</span>`
            );
          
          const starIcons = [1, 2, 3].map(i => i <= (b.stars || 0)
            ? `<span style="color:#f59e0b;font-size:0.95rem;text-shadow:0 0 6px rgba(245,158,11,0.5)">⭐</span>`
            : `<span style="color:rgba(255,255,255,0.18);font-size:0.95rem">☆</span>`
          ).join('');

          const tierColor = b.bossTier === 'legend' ? '#c084fc' : (b.bossTier === 'epic' ? '#fbbf24' : (b.bossTier === 'elite' ? '#38bdf8' : '#94a3b8'));
          const tierBadge = `<span style="font-size:0.68rem;font-weight:800;color:${tierColor};background:rgba(255,255,255,0.06);padding:1px 6px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);text-transform:uppercase">${esc(b.bossTier)}</span>`;
          const brutalBadge = b.brutal ? `<span style="font-size:0.68rem;font-weight:800;color:#ef4444;background:rgba(239,68,68,0.15);padding:1px 6px;border-radius:6px;border:1px solid rgba(239,68,68,0.3)">🔥 BRUTAL</span>` : '';

          return `
            <div class="card battle-history-card" data-testid="battle-card-${b.id}" style="padding:14px;background:var(--c-surface);border-radius:var(--radius);border:1px solid ${isWon ? 'rgba(16,185,129,0.25)' : 'var(--c-surface-strong)'};box-shadow:0 4px 14px rgba(0,0,0,0.2)">
              <!-- Row 1: Status, Brutal, Stars, Date -->
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px">
                <div style="display:flex;align-items:center;gap:6px">
                  ${statusBadge}
                  ${brutalBadge}
                  <div style="display:flex;align-items:center;gap:1px;margin-left:4px">${starIcons}</div>
                </div>
                <div style="font-size:0.72rem;color:var(--c-muted)">${dateStr}</div>
              </div>

              <!-- Row 2: Boss & Subject -->
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px">
                <div style="display:flex;align-items:center;gap:8px">
                  <div style="width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;font-size:1.4rem;border:1px solid rgba(255,255,255,0.08)">
                    ${b.subjectIcon || '⚔️'}
                  </div>
                  <div>
                    <div style="display:flex;align-items:center;gap:6px">
                      <strong style="color:#fff;font-size:0.92rem">${esc(b.monsterName)}</strong>
                      ${tierBadge}
                    </div>
                    <div style="font-size:0.75rem;color:var(--c-muted);margin-top:2px">
                      ${esc(b.subjectName)}${b.campaignNode ? ` · <span style="color:#cbd5e1">Node ${esc(b.campaignNode)}</span>` : ''}
                    </div>
                  </div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:0.92rem;font-weight:800;color:${isWon ? '#34d399' : '#f87171'}">
                    ${b.correctCount} / ${b.answeredCount} Soal
                  </div>
                  <div style="font-size:0.75rem;font-weight:700;color:${b.accuracy >= 63 ? '#fcd34d' : (b.accuracy >= 49 ? '#60a5fa' : '#94a3b8')}">
                    Akurasi: ${b.accuracy}%
                  </div>
                </div>
              </div>

              <!-- Row 3: Stats Details (Combo, Crit, XP, Coins) -->
              <div style="display:flex;flex-wrap:wrap;gap:6px;background:rgba(0,0,0,0.25);padding:6px 10px;border-radius:8px;font-size:0.75rem;color:#cbd5e1;margin-bottom:10px">
                <span>🔥 Kombo: <strong>${b.maxStreak}×</strong></span>
                <span style="opacity:0.4">·</span>
                <span>⚡ Kritis: <strong>${b.criticalCount}×</strong></span>
                <span style="opacity:0.4">·</span>
                <span style="color:#fcd34d">✨ +${b.xpEarned} XP</span>
                <span style="opacity:0.4">·</span>
                <span style="color:#38bdf8">🪙 +${b.coinsEarned}</span>
              </div>

              <!-- Row 4: Tracing & Battle ID with Copy Button -->
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:rgba(255,255,255,0.02);padding:6px 8px;border-radius:8px;border:1px dashed rgba(255,255,255,0.1)">
                <div style="display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden">
                  <span style="font-size:0.70rem;color:var(--c-muted);text-transform:uppercase;font-weight:700;flex-shrink:0">ID Battle:</span>
                  <code style="font-family:monospace;font-size:0.72rem;color:#93c5fd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(b.id)}">${esc(b.id)}</code>
                </div>
                <button type="button" class="btn mini ghost" style="flex-shrink:0;padding:2px 8px;font-size:0.72rem;border-radius:6px" onclick="App.copyBattleId('${esc(b.id)}')">
                  📋 Salin ID
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    $$('.filter-chips button', slot).forEach(btn => {
      btn.onclick = () => {
        if (window.Sfx) Sfx.play('tap');
        this.battleFilter = btn.dataset.bfilter;
        this.renderBattleHistory(slot);
      };
    });
  },

  async renderCoinHistory(slot) {
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

/* Bridge / Namespace App untuk kompatibilitas global & inline callback */
window.App = window.App || {};
window.App.showBadgeDetailModal = function(id, tier) { return Screens.profil.showBadgeDetailModal(id, tier); };
window.App.showBadgeFamilyDetailModal = function(id) { return Screens.profil.showBadgeFamilyDetailModal(id); };
window.App.showShowcasePicker = function(slot) { return Screens.profil.showShowcasePicker(slot); };
window.App.saveShowcaseItem = function(slot, item) { return Screens.profil.saveShowcaseItem(slot, item); };
window.App.removeShowcaseItem = function(slot) { return Screens.profil.removeShowcaseItem(slot); };
window.App.showTitlePicker = function(slot) { return Screens.profil.showTitlePicker(slot); };
window.App.saveTitleItem = function(slot, item) { return Screens.profil.saveTitleItem(slot, item); };
window.App.removeTitleItem = function(slot) { return Screens.profil.removeTitleItem(slot); };
window.App.copyBattleId = function(id) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(id).then(() => {
      if (typeof toast === 'function') toast('✅ ID Battle disalin ke clipboard!');
      else alert('ID Battle disalin: ' + id);
    }).catch(() => {
      prompt('Salin ID Battle:', id);
    });
  } else {
    prompt('Salin ID Battle:', id);
  }
};

/* ============================================================
   SCREEN: Monsterdex (Katalog 100 Monster Boss Elemen v7 - Skin-Adapted)
   ============================================================ */
Screens.dex = {
  filterOwner: 'all',
  filterTheme: 'ALL',
  filterElement: '',
  filterTier: '',
  searchQuery: '',
  brutalPreview: false,
  progress: {},
  entries: [],
  monsters: [],

  async render(app) {
    this.entries = window.BossSkills ? BossSkills.dexEntries() : [];
    this.filterOwner = 'all';
    this.filterTheme = 'ALL';
    this.filterElement = '';
    this.filterTier = '';
    this.searchQuery = '';
    this.brutalPreview = false;

    // Muat data dari /api/dex
    try {
      const res = await API.req('/api/dex');
      this.progress = res.progress || {};
      const rawMonsters = res.monsters || (window.Monsters ? Monsters.MONSTERS : []);
      const TIER_SEQ = ['common', 'common', 'common', 'common', 'rare', 'rare', 'rare', 'epic', 'epic', 'legend'];
      if (window.Monsters && Monsters.MONSTERS) {
        this.monsters = rawMonsters.map((m, idx) => {
          const full = Monsters.MONSTERS.find(x => x.id === m.id) || {};
          const tier = m.tier || full.tier || TIER_SEQ[((m.id || (idx + 1)) - 1) % 10];
          return { ...full, ...m, tier };
        });
      } else {
        this.monsters = rawMonsters.map((m, idx) => ({
          ...m,
          tier: m.tier || TIER_SEQ[((m.id || (idx + 1)) - 1) % 10]
        }));
      }
    } catch (e) {
      console.error('Failed to load dex progress:', e);
      this.progress = {};
      this.monsters = window.Monsters ? Monsters.MONSTERS : [];
    }

    const totalCount = this.monsters.length || 100;
    const knownMonsters = this.monsters.filter(m => Boolean(m.encountered || m.defeated || (m.encounters > 0) || (m.defeats > 0)));
    const totalKnown = knownMonsters.length;
    const totalDefeated = this.monsters.filter(m => Boolean(m.defeated || (m.defeats > 0))).length;
    const totalStars = this.monsters.reduce((acc, m) => acc + (m.bestStars || 0), 0);
    const totalUnknown = Math.max(0, totalCount - totalKnown);
    const pct = Math.round((totalKnown / totalCount) * 100);

    const featuredMonster = knownMonsters[0] || this.monsters[0] || { id: 1, name: 'Lumutra', theme: 'hutan' };
    const featuredArt = window.Monsters
      ? Monsters.renderMonster(featuredMonster, { size: 68, tier: 'legend' })
      : '🐲';

    app.innerHTML = `
      <section class="screen active stack" style="gap:10px">
        <!-- TOP HUD -->
        <div class="hud" style="margin-bottom:0">
          <button class="icon-btn" id="dex-back">←</button>
          <h2 class="hud-title">Monster Dex (<span id="dex-count">${totalKnown}</span>/${totalCount})</h2>
          <span class="chip accent">📖 Katalog Boss</span>
        </div>

        <!-- HERO / SUMMARY BANNER (Skin UI Adapted) -->
        <div class="card" style="padding:14px;background:var(--c-surface);border-radius:var(--radius);border:1px solid var(--c-surface-strong);display:flex;gap:14px;align-items:center">
          <div class="skin-thumbnail-box" style="width:72px;height:72px;border-radius:18px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;overflow:hidden;flex:0 0 auto;font-size:2.2rem;box-shadow:inset 0 2px 6px rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08)">
            ${featuredArt}
          </div>
          <div class="grow" style="min-width:0">
            <div style="font-weight:800;font-size:1.05rem;color:#fff;display:flex;align-items:center;justify-content:space-between">
              <span>Koleksi Boss Elemen</span>
              <span style="font-size:0.75rem;color:var(--c-primary);font-weight:700" id="dex-pct">${pct}% Lengkap</span>
            </div>
            <div style="font-size:0.78rem;color:var(--c-muted);margin:2px 0 6px 0">
              10 Elemen Alam · 100 Karakter Bos (40 Common · 30 Rare · 20 Epic · 10 Legend)
            </div>
            <div class="xp-track" style="height:6px;background:rgba(255,255,255,0.1);border-radius:99px;overflow:hidden">
              <div class="xp-fill" id="dex-progress-bar" style="width:${pct}%"></div>
            </div>
            <div style="display:flex;gap:8px;margin-top:6px;font-size:0.72rem;color:var(--c-muted);flex-wrap:wrap">
              <span>👁️ Ditemui: <b style="color:#fff" id="dex-stat-encountered">${totalKnown}</b>/100</span>
              <span>⚔️ Dikalahkan: <b style="color:#34d399" id="dex-stat-defeated">${totalDefeated}</b></span>
              <span>⭐ Bintang: <b style="color:#fbbf24" id="dex-stat-stars">${totalStars}</b></span>
            </div>
          </div>
        </div>

        <!-- FILTER STATUS KEPEMILIKAN / DITEMUI (Skin owner filter style) -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid var(--c-surface-strong);border-radius:var(--radius);padding:8px 10px;display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:0.75rem;font-weight:800;color:#fff;display:flex;align-items:center;gap:6px">
              🏷️ Status Koleksi:
            </span>
          </div>
          <div class="skin-owner-filter-bar dex-owner-bar" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch">
            <button class="btn small skin-owner-btn dex-owner-btn ${this.filterOwner === 'all' ? 'active' : 'ghost'}" data-owner="all" style="flex:0 0 auto;white-space:nowrap;padding:4px 12px">Semua (${totalCount})</button>
            <button class="btn small skin-owner-btn dex-owner-btn ${this.filterOwner === 'defeated' ? 'active' : 'ghost'}" data-owner="defeated" style="flex:0 0 auto;white-space:nowrap;padding:4px 12px">⚔️ Dikalahkan (${totalDefeated})</button>
            <button class="btn small skin-owner-btn dex-owner-btn ${this.filterOwner === 'encountered' ? 'active' : 'ghost'}" data-owner="encountered" style="flex:0 0 auto;white-space:nowrap;padding:4px 12px">✓ Ditemui (${totalKnown})</button>
            <button class="btn small skin-owner-btn dex-owner-btn ${this.filterOwner === 'unencountered' ? 'active' : 'ghost'}" data-owner="unencountered" style="flex:0 0 auto;white-space:nowrap;padding:4px 12px">🔒 Belum (${totalUnknown})</button>
          </div>
        </div>

        <!-- FILTER TEMA / WILAYAH ELEMEN (Skin category filter style) -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin:4px 0 2px 2px">
          <div style="font-size:0.72rem;font-weight:700;color:var(--c-muted);text-transform:uppercase;letter-spacing:0.5px">📁 Elemen & Wilayah Bos</div>
        </div>
        <div class="skin-filter-bar dex-theme-bar" style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;min-height:38px">
          <button class="btn small skin-cat-btn dex-theme-btn active" data-theme="ALL" data-el="" style="flex:0 0 auto;white-space:nowrap;padding:4px 10px">Semua (100)</button>
          <button class="btn small skin-cat-btn dex-theme-btn ghost" data-theme="hutan" data-el="nature" style="flex:0 0 auto;white-space:nowrap;padding:4px 10px">🌿 Hutan (10)</button>
          <button class="btn small skin-cat-btn dex-theme-btn ghost" data-theme="rawa" data-el="toxic" style="flex:0 0 auto;white-space:nowrap;padding:4px 10px">☠️ Rawa (10)</button>
          <button class="btn small skin-cat-btn dex-theme-btn ghost" data-theme="gua" data-el="earth" style="flex:0 0 auto;white-space:nowrap;padding:4px 10px">🪨 Gua (10)</button>
          <button class="btn small skin-cat-btn dex-theme-btn ghost" data-theme="api" data-el="fire" style="flex:0 0 auto;white-space:nowrap;padding:4px 10px">🔥 Api (10)</button>
          <button class="btn small skin-cat-btn dex-theme-btn ghost" data-theme="es" data-el="ice" style="flex:0 0 auto;white-space:nowrap;padding:4px 10px">❄️ Es (10)</button>
          <button class="btn small skin-cat-btn dex-theme-btn ghost" data-theme="laut" data-el="water" style="flex:0 0 auto;white-space:nowrap;padding:4px 10px">💧 Air (10)</button>
          <button class="btn small skin-cat-btn dex-theme-btn ghost" data-theme="langit" data-el="wind" style="flex:0 0 auto;white-space:nowrap;padding:4px 10px">🌪️ Angin (10)</button>
          <button class="btn small skin-cat-btn dex-theme-btn ghost" data-theme="hantu" data-el="shadow" style="flex:0 0 auto;white-space:nowrap;padding:4px 10px">🌑 Hantu (10)</button>
          <button class="btn small skin-cat-btn dex-theme-btn ghost" data-theme="mesin" data-el="thunder" style="flex:0 0 auto;white-space:nowrap;padding:4px 10px">⚡ Mesin (10)</button>
          <button class="btn small skin-cat-btn dex-theme-btn ghost" data-theme="manis" data-el="light" style="flex:0 0 auto;white-space:nowrap;padding:4px 10px">✨ Manis (10)</button>
        </div>

        <!-- CONTROLS ROW (Search, Elemen, Tier & Brutal Toggle Sejajar - Point 1) -->
        <div class="dex-controls" style="display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;align-items:center;padding:4px 0;width:100%">
          <!-- SEARCH BOX -->
          <div style="flex:1 1 200px;min-width:180px">
            <input type="text" id="dex-search-input" data-testid="dex-search-input" placeholder="🔍 Cari nama atau #ID bos..." class="input" style="width:100%;box-sizing:border-box;padding:7px 12px;border-radius:10px;background:var(--c-surface);color:#fff;border:1px solid var(--c-surface-strong);font-size:0.82rem;outline:none" value="${esc(this.searchQuery || '')}">
          </div>

          <!-- DROPDOWN ELEMEN -->
          <div style="flex:0 0 auto;min-width:140px">
            <select id="dex-filter-element" data-testid="dex-filter-element" class="btn small ghost" style="width:100%;padding:6px 10px;border-radius:10px;background:var(--c-surface);color:var(--text);border:1px solid var(--c-surface-strong);font-size:0.8rem">
              <option value="">Semua Elemen (10)</option>
              ${window.BossSkills ? BossSkills.ELEMENT_ORDER.map(el => `<option value="${el}">${BossSkills.ELEMENTS[el].icon} ${BossSkills.ELEMENTS[el].name}</option>`).join('') : ''}
            </select>
          </div>

          <!-- DROPDOWN TIER -->
          <div style="flex:0 0 auto;min-width:125px">
            <select id="dex-filter-tier" data-testid="dex-filter-tier" class="btn small ghost" style="width:100%;padding:6px 10px;border-radius:10px;background:var(--c-surface);color:var(--text);border:1px solid var(--c-surface-strong);font-size:0.8rem">
              <option value="">Semua Tier</option>
              <option value="common">⚪ Common (40)</option>
              <option value="rare">🔵 Rare (30)</option>
              <option value="epic">🟣 Epic (20)</option>
              <option value="legend">🟡 Legend (10)</option>
            </select>
          </div>

          <!-- BRUTAL TOGGLE (Sejajar) -->
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.8rem;font-weight:700;padding:6px 12px;background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.3);border-radius:10px;color:#ef4444;user-select:none;white-space:nowrap;flex:0 0 auto">
            <input type="checkbox" id="dex-brutal-toggle" data-testid="dex-brutal-toggle" style="width:16px;height:16px;accent-color:#dc2626">
            <span>💀 Pratinjau Brutal</span>
          </label>
        </div>

        <!-- DEX LIST SLOT (1 baris 1 kartu - Skin adapted) -->
        <div id="dex-list-slot" class="grow" style="overflow-y:auto;padding-bottom:24px">
          <div style="text-align:center;padding:40px;color:var(--c-muted)">Membuka buku monster...</div>
        </div>
      </section>
    `;

    $('#dex-back').onclick = () => { if (window.Sfx) Sfx.play('tap'); go('home'); };

    const elFilter = $('#dex-filter-element');
    const tierFilter = $('#dex-filter-tier');
    const brutalToggle = $('#dex-brutal-toggle');
    const searchInput = $('#dex-search-input');

    // Filter Search
    if (searchInput) {
      searchInput.oninput = () => {
        this.searchQuery = searchInput.value;
        this.renderList();
      };
    }

    // Filter Owner (Semua / Ditemui / Belum)
    $$('.dex-owner-btn', app).forEach(btn => {
      btn.onclick = () => {
        if (window.Sfx) Sfx.play('tap');
        this.filterOwner = btn.dataset.owner;
        $$('.dex-owner-btn', app).forEach(b => {
          if (b.dataset.owner === this.filterOwner) {
            b.classList.add('active');
            b.classList.remove('ghost');
          } else {
            b.classList.remove('active');
            b.classList.add('ghost');
          }
        });
        this.renderList();
      };
    });

    // Filter Tema (Hutan, Rawa, Api, dsb)
    $$('.dex-theme-btn', app).forEach(btn => {
      btn.onclick = () => {
        if (window.Sfx) Sfx.play('tap');
        this.filterTheme = btn.dataset.theme;
        const targetEl = btn.dataset.el || '';
        this.filterElement = targetEl;
        if (elFilter) elFilter.value = targetEl;

        $$('.dex-theme-btn', app).forEach(b => {
          if (b.dataset.theme === this.filterTheme) {
            b.classList.add('active');
            b.classList.remove('ghost');
          } else {
            b.classList.remove('active');
            b.classList.add('ghost');
          }
        });
        this.renderList();
      };
    });

    // Dropdown Elemen (sinkronisasi dengan tombol tema)
    if (elFilter) {
      elFilter.onchange = () => {
        this.filterElement = elFilter.value;
        const B = window.BossSkills;
        const correspondingTheme = elFilter.value && B ? (B.themeForElement(elFilter.value) || 'ALL') : 'ALL';
        this.filterTheme = correspondingTheme;

        $$('.dex-theme-btn', app).forEach(b => {
          if (b.dataset.theme === this.filterTheme) {
            b.classList.add('active');
            b.classList.remove('ghost');
          } else {
            b.classList.remove('active');
            b.classList.add('ghost');
          }
        });
        this.renderList();
      };
    }

    if (tierFilter) {
      tierFilter.onchange = () => {
        this.filterTier = tierFilter.value;
        this.renderList();
      };
    }

    if (brutalToggle) {
      brutalToggle.onchange = () => {
        this.brutalPreview = brutalToggle.checked;
        this.renderList();
      };
    }

    this.renderList();
  },

  renderList() {
    const slot = $('#dex-list-slot');
    if (!slot) return;
    if (!window.DexCards || !window.BossSkills) {
      slot.innerHTML = `<div style="text-align:center;color:var(--c-bad)">Komponen DexCards belum siap.</div>`;
      return;
    }

    const artCb = (m, tier) => {
      if (m && m.theme && window.Monsters) {
        return Monsters.renderMonster(m, { size: 68, tier: tier || m.tier || 'common' });
      }
      if (m && m.element) {
        const theme = BossSkills.themeForElement(m.element) || 'hutan';
        const dummyMonster = { id: m.id, name: m.title, body: 'blob', color: theme, eyes: 'cute', mouth: 'happy', extra: 'horns' };
        return window.Monsters ? Monsters.renderMonster(dummyMonster, { size: 68, tier: m.tier }) : (m.icon || '🐲');
      }
      return '🐲';
    };

    const listToRender = (this.monsters && this.monsters.length) ? this.monsters : this.entries;

    const html = DexCards.renderList(listToRender, this.progress, {
      brutal: this.brutalPreview,
      filter: {
        element: this.filterElement || undefined,
        tier: this.filterTier || undefined,
        owner: this.filterOwner !== 'all' ? this.filterOwner : undefined,
        theme: this.filterTheme !== 'ALL' ? this.filterTheme : undefined,
        search: this.searchQuery || undefined
      },
      art: artCb
    });

    slot.innerHTML = html;

    // Pasang click listener pada kartu monster & tombol detail
    $$('.dex-monster-card', slot).forEach(card => {
      card.style.cursor = 'pointer';
      card.onclick = () => {
        const id = parseInt(card.dataset.id, 10);
        const m = (this.monsters || []).find(x => x.id === id);
        if (m) this.openMonsterDetailModal(m);
      };
    });
  },

  openMonsterDetailModal(m) {
    if (window.Sfx) Sfx.play('tap');
    const isKnown = Boolean(m.encountered || m.defeated || (m.encounters > 0) || (m.defeats > 0));
    const B = window.BossSkills;
    const elKey = (B && B.elementForTheme(m.theme)) || 'nature';
    const elInfo = (B && B.ELEMENTS[elKey]) || { name: 'Alam', icon: '🌿', color: '#22C55E', title: 'Roh Rimba' };
    const brutal = this.brutalPreview;

    const mTier = (window.DexCards && DexCards.getMonsterTier) ? DexCards.getMonsterTier(m) : (m.tier || 'common');
    const meta = (window.DexCards && DexCards.TIER_META) ? (DexCards.TIER_META[mTier] || DexCards.TIER_META.common) : { name: 'Common', icon: '⚪', color: '#94a3b8', skills: 1 };

    // Sesuai rarity: Common = 1 skill, Rare = 2 skill, Epic = 3 skill, Legend = 4 skill (variasi unik per monster)
    const monsterSkills = (B && B.skillsFor(elKey, mTier, m.id)) || [];

    // Siluet hitam untuk boss yang belum terbuka
    const monsterSvg = isKnown
      ? (window.Monsters ? Monsters.renderMonster(m, { size: 120, tier: mTier }) : elInfo.icon)
      : `<div class="monster-silhouette" title="Belum Ditemui" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;filter:brightness(0) drop-shadow(0 0 2px rgba(255,255,255,0.3));opacity:0.42;transform:scale(0.92);pointer-events:none">
          ${window.Monsters ? Monsters.renderMonster(m, { size: 120, tier: 'common' }) : '🐲'}
        </div>`;

    const modal = document.createElement('div');
    modal.className = 'modal-mask active';
    modal.style.zIndex = '9999';
    modal.innerHTML = `
      <div class="modal card" style="max-width:440px;width:92%;padding:18px;max-height:85vh;overflow-y:auto;text-align:left;border:1px solid ${esc(elInfo.color)};box-shadow:0 10px 30px rgba(0,0,0,0.6)">
        <!-- HEADER -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:8px">
          <div>
            <div style="font-size:0.75rem;color:var(--c-muted)">Detail Bos Elemen #${m.id}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:2px">
              <span style="font-weight:800;font-size:1.15rem;color:#fff">${isKnown ? esc(m.name) : `??? #${m.id}`}</span>
              <span class="chip" style="font-size:0.68rem;font-weight:800;color:${meta.color};padding:2px 8px;border-radius:999px;background:${meta.color}1a;border:1px solid ${meta.color}55">
                ${meta.icon} ${meta.name}
              </span>
            </div>
          </div>
          <button class="btn ghost small" id="btn-modal-close" style="padding:4px 10px;font-size:1rem">✕</button>
        </div>

        <!-- HERO VIEW -->
        <div style="display:flex;gap:14px;align-items:center;background:rgba(255,255,255,0.03);padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px">
          <div style="width:120px;height:120px;border-radius:18px;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;overflow:hidden;flex:0 0 120px;border:2px solid ${esc(elInfo.color)};box-shadow:0 0 16px ${esc(elInfo.color)}33">
            ${monsterSvg}
          </div>
          <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px">
            <span style="font-size:0.75rem;font-weight:800;color:${esc(elInfo.color)};display:inline-flex;align-items:center;gap:4px">
              ${esc(elInfo.icon)} ${esc(elInfo.name)} · ${esc(elInfo.title)}
            </span>
            <div style="font-size:0.78rem;color:var(--c-muted)">
              Wilayah: <b>${esc(m.theme ? m.theme.toUpperCase() : '-')}</b>
            </div>
            <div style="font-size:0.78rem;color:var(--c-muted)">
              Ditemui: <b style="color:#fff">${m.encounters || 0}×</b> · Kalah: <b style="color:#34d399">${m.defeats || 0}×</b>
            </div>
            ${m.bestStars ? `<div style="font-size:0.78rem;color:#fbbf24">Bintang Tertinggi: ${'⭐'.repeat(m.bestStars)}</div>` : ''}
            ${m.bestStreak ? `<div style="font-size:0.75rem;color:var(--c-muted)">Combo Terpanjang: 🔥 ${m.bestStreak}</div>` : ''}
          </div>
        </div>

        <!-- SKILLS SECTION (Hanya jurus sesuai rarity bos) -->
        <div style="margin-bottom:8px">
          <div style="font-size:0.82rem;font-weight:800;color:#fff;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between">
            <span>⚡ Jurus Bos ${esc(meta.name)} (${monsterSkills.length} Skill)</span>
            ${brutal ? `<span style="font-size:0.7rem;color:#ef4444;font-weight:700">💀 Pratinjau Brutal</span>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${monsterSkills.map((sk, idx) => {
              const tierName = idx === 0 ? 'Common' : (idx === 1 ? 'Rare' : (idx === 2 ? 'Epic' : 'Legend'));
              const tierBadgeColor = idx === 0 ? '#94a3b8' : (idx === 1 ? '#3b82f6' : (idx === 2 ? '#a855f7' : '#f59e0b'));
              const descNormal = B ? B.describeSkill(sk, tierName.toLowerCase(), false) : sk;
              const descBrutal = B ? B.describeSkill(sk, tierName.toLowerCase(), true) : sk;
              return `
                <div style="padding:10px;border-radius:10px;background:rgba(255,255,255,0.05);border:1px solid ${tierBadgeColor}55">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                    <span style="font-size:0.85rem;font-weight:800;color:#fff;display:flex;align-items:center;gap:6px">
                      ${esc(sk.icon)} ${esc(sk.name)}
                    </span>
                    <span style="font-size:0.68rem;font-weight:800;padding:2px 8px;border-radius:999px;background:${tierBadgeColor}22;color:${tierBadgeColor};border:1px solid ${tierBadgeColor}">
                      ${tierName}
                    </span>
                  </div>
                  <div style="font-size:0.78rem;color:var(--text);line-height:1.4">
                    ${esc(brutal ? descBrutal.text : descNormal.text)}
                  </div>
                  ${!brutal ? `
                    <div style="font-size:0.7rem;color:#ef4444;margin-top:4px;padding-top:4px;border-top:1px dashed rgba(255,255,255,0.06)">
                      💀 <i>Mode Brutal:</i> ${esc(descBrutal.text)}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <button class="btn primary block" id="btn-modal-done" style="width:100%;margin-top:12px;padding:8px">Tutup</button>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('#btn-modal-close').onclick = () => modal.remove();
    modal.querySelector('#btn-modal-done').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
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
            <h3 style="margin:0 0 12px 0;font-size:1rem;color:var(--c-primary)">Suara & Getar (Umpan Balik)</h3>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <div>
                <strong style="display:block">Efek Suara (SFX)</strong>
                <span style="font-size:.75rem;color:var(--c-muted)">Suara serangan, koin, dan tombol</span>
              </div>
              <button class="toggle" id="tog-sfx" data-testid="setting-sound" aria-checked="${s.sfx !== false}"></button>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <div>
                <strong style="display:block">Getar Layar (Haptic)</strong>
                <span style="font-size:.75rem;color:var(--c-muted)">Getar saat serangan atau kritikal</span>
              </div>
              <button class="toggle" id="tog-vibrate" data-testid="setting-vibrate" aria-checked="${s.vibrate !== false}"></button>
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
                <strong style="display:block">Animasi Hemat (Reduced Motion)</strong>
                <span style="font-size:.75rem;color:var(--c-muted)">Matikan getar layar dan partikel animasi</span>
              </div>
              <button class="toggle" id="tog-reduced-motion" data-testid="setting-reduced" aria-checked="${!!s.reducedMotion}"></button>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <div>
                <strong style="display:block">Tampilan Battle</strong>
                <span style="font-size:.75rem;color:var(--c-muted)">Tata letak soal & lembar jawaban</span>
              </div>
              <select id="sel-battle-layout" data-testid="setting-battle-layout" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:4px 8px;font-size:0.8rem">
                <option value="classic" ${(!s.battleLayout || s.battleLayout === 'classic') ? 'selected' : ''}>Klasik (Default)</option>
                <option value="bottom_sheet" ${s.battleLayout === 'bottom_sheet' ? 'selected' : ''}>Baca Penuh + Sheet</option>
                <option value="compact" ${s.battleLayout === 'compact' ? 'selected' : ''}>Kompak Adaptif</option>
              </select>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <div>
                <strong style="display:block">Mode Tampilan Layar (UI)</strong>
                <span style="font-size:.75rem;color:var(--c-muted)">Desktop Cockpit atau Mobile App</span>
              </div>
              <select id="sel-ui-mode" data-testid="setting-ui-mode" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:4px 8px;font-size:0.8rem">
                <option value="auto" ${(typeof localStorage !== 'undefined' && localStorage.getItem('ui_mode') === 'auto') || (typeof localStorage !== 'undefined' && !localStorage.getItem('ui_mode')) ? 'selected' : ''}>Otomatis</option>
                <option value="desktop" ${typeof localStorage !== 'undefined' && localStorage.getItem('ui_mode') === 'desktop' ? 'selected' : ''}>Paksa Desktop</option>
                <option value="mobile" ${typeof localStorage !== 'undefined' && localStorage.getItem('ui_mode') === 'mobile' ? 'selected' : ''}>Paksa Mobile</option>
              </select>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <div>
                <strong style="display:block">Waktu Soal (Pace)</strong>
                <span style="font-size:.75rem;color:var(--c-muted)">Pengaturan kecepatan waktu kuis</span>
              </div>
              <select id="sel-pace" data-testid="setting-pace" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:4px 8px;font-size:0.8rem">
                <option value="AUTO" ${s.pace === 'AUTO' ? 'selected' : ''}>Otomatis</option>
                <option value="NORMAL" ${s.pace === 'NORMAL' ? 'selected' : ''}>Standar</option>
                <option value="RELAXED" ${s.pace === 'RELAXED' ? 'selected' : ''}>Santai (+30%)</option>
              </select>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <strong style="display:block">Sembunyikan Panel Skill</strong>
                <span style="font-size:.75rem;color:var(--c-muted)">Gunakan tombol mengambang ringkas di battle</span>
              </div>
              <button class="toggle" id="tog-skillbar" aria-checked="${!!s.skillBarHidden}"></button>
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
      Settings.set('sound', now);
      $('#tog-sfx').setAttribute('aria-checked', String(now));
      toast(now ? 'Suara Aktif' : 'Suara Dimatikan');
    };

    const togVib = $('#tog-vibrate');
    if (togVib) {
      togVib.onclick = () => {
        const now = !Settings.get().vibrate;
        Settings.set('vibrate', now);
        togVib.setAttribute('aria-checked', String(now));
        toast(now ? 'Getar Aktif' : 'Getar Dimatikan');
      };
    }

    const selPace = $('#sel-pace');
    if (selPace) {
      selPace.onchange = (e) => {
        const val = e.target.value;
        Settings.set('pace', val);
        toast('Waktu soal: ' + (val === 'RELAXED' ? 'Santai (+30%)' : (val === 'NORMAL' ? 'Standar' : 'Otomatis')));
      };
    }

    const selLayout = $('#sel-battle-layout');
    if (selLayout) {
      selLayout.onchange = (e) => {
        const val = e.target.value;
        Settings.set('battleLayout', val);
        API.saveSettings({ battleLayout: val }).catch(() => {});
        const label = val === 'bottom_sheet' ? 'Baca Penuh + Lembar Jawaban' : (val === 'compact' ? 'Kompak Adaptif' : 'Klasik (Default)');
        toast('Tampilan Battle: ' + label);
      };
    }

    const selUIMode = $('#sel-ui-mode');
    if (selUIMode) {
      selUIMode.onchange = (e) => {
        const val = e.target.value;
        if (window.UIMode) window.UIMode.setPref(val);
        toast('Mode Tampilan UI: ' + val);
      };
    }

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
  if (window.location.pathname.startsWith('/r/')) {
    go('report');
  } else if (window.location.pathname === '/profil' || window.location.pathname.startsWith('/profil')) {
    go('profil', { tab: 'ringkasan' });
  } else {
    go('home');
  }
});
