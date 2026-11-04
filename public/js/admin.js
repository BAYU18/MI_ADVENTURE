/**
 * public/js/admin.js
 * Portal Kontrol Admin Guru — Petualangan Pelajar
 * Fitur:
 *  - Autentikasi Admin (Login/Logout via HttpOnly Cookie pp_admin)
 *  - Ringkasan Sistem (Statistik Siswa, Soal, Sesi, Akurasi)
 *  - CRUD Bank Soal (Filter Kelas/Pelajaran, Tambah, Edit, Hapus)
 *  - Modal Form Soal dengan validasi opsi A/B/C/D & kunci jawaban
 *  - Fitur Import & Export Bank Soal JSON
 *  - Manajemen Siswa & Fitur Reset Kata Sandi Siswa
 */

'use strict';

(function () {
  const root = document.getElementById('admin-app');
  const toastEl = document.getElementById('toast');

  // Application State
  const state = {
    admin: null,
    loading: true,
    activeTab: 'overview', // 'overview' | 'questions' | 'players'
    overview: null,
    classes: [],
    subjects: [],
    selectedClassId: null,
    selectedSubjectId: null,
    questions: [],
    loadingQuestions: false,
    players: [],
    loadingPlayers: false,
    playerSearch: '',
    reportsList: [],
    selectedReportClassId: null,
    loadingReports: false,
    modal: null, // null | 'question' | 'import' | 'reset-pw'
    modalData: null,
  };

  /* ── UI Helpers ── */
  function toast(message, type = 'info') {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.className = 'show';
    if (type === 'error') {
      toastEl.style.borderColor = 'var(--c-bad)';
      toastEl.style.color = '#fca5a5';
    } else if (type === 'success') {
      toastEl.style.borderColor = 'var(--c-good)';
      toastEl.style.color = '#86efac';
    } else {
      toastEl.style.borderColor = 'rgba(255,255,255,.2)';
      toastEl.style.color = 'var(--c-text)';
    }
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
      toastEl.className = '';
    }, 3200);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ── Token Storage (Dual Cookie + Bearer Token) ── */
  const TOKEN_KEY = 'pp_admin_token';

  function getStoredToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
    } catch (e) {
      return null;
    }
  }

  function setStoredToken(token) {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {}
  }

  /* ── API Client ── */
  async function api(path, options = {}) {
    const token = getStoredToken();
    const customHeaders = options.headers || {};
    const headers = {
      'Accept': 'application/json',
      ...customHeaders,
    };
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const opts = {
      credentials: 'include',
      headers,
      ...options,
    };
    if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(opts.body);
    }

    try {
      const res = await fetch(path, opts);
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        if (path === '/api/admin/login') {
          // Kesalahan kredensial saat login
          const msg = (data.error && data.error.message) || (typeof data.error === 'string' ? data.error : 'Username atau kata sandi admin salah');
          throw new Error(msg);
        }
        setStoredToken(null);
        state.admin = null;
        render();
        throw new Error('Sesi admin berakhir. Silakan login kembali.');
      }
      if (!res.ok) {
        const msg = (data.error && data.error.message) || (typeof data.error === 'string' ? data.error : `HTTP ${res.status}`);
        throw new Error(msg);
      }
      return data;
    } catch (err) {
      throw err;
    }
  }

  /* ── Data Actions ── */
  async function checkAuth() {
    state.loading = true;
    render();
    try {
      const res = await api('/api/admin/me');
      if (res.ok && res.admin) {
        state.admin = res.admin;
        await Promise.all([loadOverview(), loadClassesAndSubjects()]);
      } else {
        setStoredToken(null);
        state.admin = null;
      }
    } catch (e) {
      setStoredToken(null);
      state.admin = null;
    } finally {
      state.loading = false;
      render();
    }
  }

  async function login(username, password) {
    try {
      const res = await api('/api/admin/login', {
        method: 'POST',
        body: { username, password },
      });
      if (res.ok && res.admin) {
        if (res.token) {
          setStoredToken(res.token);
        }
        state.admin = res.admin;
        toast('Selamat datang, ' + res.admin.username, 'success');
        await Promise.all([loadOverview(), loadClassesAndSubjects()]);
        render();
      }
    } catch (err) {
      toast(err.message || 'Login gagal', 'error');
    }
  }

  async function logout() {
    try {
      await api('/api/admin/logout', { method: 'POST' });
    } catch (e) {}
    setStoredToken(null);
    state.admin = null;
    state.modal = null;
    toast('Berhasil keluar dari admin');
    render();
  }

  async function loadOverview() {
    try {
      const res = await api('/api/admin/overview');
      if (res) {
        state.overview = res.overview || res;
        render();
      }
    } catch (err) {
      console.error('[overview error]', err);
    }
  }

  async function loadReports(classId) {
    const cid = classId || state.selectedReportClassId || (state.classes.length > 0 ? state.classes[0].id : 1);
    state.selectedReportClassId = cid;
    state.loadingReports = true;
    render();
    try {
      const res = await api(`/api/admin/reports?classId=${cid}`);
      if (res && res.ok) {
        state.reportsList = res.reports || [];
      } else {
        state.reportsList = [];
      }
    } catch (err) {
      console.error('[reports error]', err);
      toast('Gagal memuat laporan: ' + err.message, 'error');
      state.reportsList = [];
    } finally {
      state.loadingReports = false;
      render();
    }
  }

  async function generateWeeklyReports() {
    state.loadingReports = true;
    render();
    try {
      const res = await api('/api/admin/reports/generate-weekly', { method: 'POST' });
      if (res && res.ok) {
        toast('Laporan mingguan seluruh siswa berhasil dikompilasi!', 'success');
        await loadReports(state.selectedReportClassId);
      }
    } catch (err) {
      toast('Gagal mengompilasi laporan: ' + err.message, 'error');
      state.loadingReports = false;
      render();
    }
  }

  function exportReportsCsv() {
    const cid = state.selectedReportClassId || (state.classes.length > 0 ? state.classes[0].id : 1);
    const cls = state.classes.find(c => c.id === cid);
    const clsName = cls ? cls.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : `kelas-${cid}`;
    const url = `/api/admin/reports/csv?classId=${cid}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-mingguan-${clsName}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast('Mengunduh berkas laporan CSV...', 'info');
  }

  async function loadClassesAndSubjects() {
    try {
      const [resC, resS] = await Promise.all([
        api('/api/admin/classes'),
        api('/api/admin/subjects'),
      ]);
      state.classes = resC.classes || [];
      state.subjects = resS.subjects || [];

      if (!state.selectedClassId && state.classes.length > 0) {
        state.selectedClassId = state.classes[0].id;
      }

      const availableSubjects = getFilteredSubjects();
      if (availableSubjects.length > 0 && (!state.selectedSubjectId || !availableSubjects.some(s => s.id === state.selectedSubjectId))) {
        state.selectedSubjectId = availableSubjects[0].id;
      }

      if (state.selectedSubjectId) {
        await loadQuestions(state.selectedSubjectId);
      }
    } catch (err) {
      console.error('[classes error]', err);
    }
  }

  function getFilteredSubjects() {
    if (!state.selectedClassId) return state.subjects;
    return state.subjects.filter(s => s.class_id === state.selectedClassId);
  }

  async function loadQuestions(subjectId) {
    if (!subjectId) {
      state.questions = [];
      render();
      return;
    }
    state.loadingQuestions = true;
    render();
    try {
      const res = await api(`/api/admin/questions?subjectId=${subjectId}`);
      if (res.ok) {
        state.questions = res.questions || [];
      }
    } catch (err) {
      toast('Gagal memuat soal: ' + err.message, 'error');
    } finally {
      state.loadingQuestions = false;
      render();
    }
  }

  async function loadPlayers() {
    state.loadingPlayers = true;
    render();
    try {
      const res = await api('/api/admin/players');
      if (res.ok) {
        state.players = res.players || [];
      }
    } catch (err) {
      toast('Gagal memuat data siswa: ' + err.message, 'error');
    } finally {
      state.loadingPlayers = false;
      render();
    }
  }

  async function saveQuestion(payload) {
    try {
      const res = await api('/api/admin/questions', {
        method: 'POST',
        body: payload,
      });
      if (res.ok) {
        toast('Soal berhasil disimpan', 'success');
        state.modal = null;
        state.modalData = null;
        await loadQuestions(state.selectedSubjectId);
        loadOverview();
      }
    } catch (err) {
      toast('Gagal menyimpan soal: ' + err.message, 'error');
    }
  }

  async function deleteQuestion(questionId) {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini dari bank soal?')) {
      return;
    }
    try {
      const res = await api(`/api/admin/question/${questionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast('Soal telah dihapus', 'success');
        await loadQuestions(state.selectedSubjectId);
        loadOverview();
      }
    } catch (err) {
      toast('Gagal menghapus soal: ' + err.message, 'error');
    }
  }

  async function deleteSelectedClass() {
    const curClass = state.classes.find(c => c.id === state.selectedClassId);
    if (!curClass) {
      return toast('Pilih kelas yang ingin dihapus terlebih dahulu', 'error');
    }

    const curSubs = getFilteredSubjects();
    const subCount = curSubs.length;
    const msg = `Apakah Anda yakin ingin menghapus kelas "${curClass.name}"?\n\n⚠️ PERINGATAN: ${subCount > 0 ? `${subCount} mata pelajaran dan semua bank soal di dalamnya` : 'Semua data di dalam kelas ini'} akan ikut terhapus secara permanen!`;
    if (!confirm(msg)) return;

    try {
      const res = await api(`/api/admin/classes?id=${curClass.id}`, {
        method: 'DELETE'
      });
      if (res && res.ok) {
        toast(`Kelas "${curClass.name}" berhasil dihapus`, 'success');
        await loadClassesAndSubjects();
        if (state.classes.length > 0) {
          state.selectedClassId = state.classes[0].id;
          const avail = getFilteredSubjects();
          if (avail.length > 0) {
            state.selectedSubjectId = avail[0].id;
            await loadQuestions(state.selectedSubjectId);
          } else {
            state.selectedSubjectId = null;
            state.questions = [];
          }
        } else {
          state.selectedClassId = null;
          state.selectedSubjectId = null;
          state.questions = [];
        }
        render();
      }
    } catch (err) {
      toast('Gagal menghapus kelas: ' + err.message, 'error');
    }
  }

  async function deleteSelectedSubject() {
    const curSubj = state.subjects.find(s => s.id === state.selectedSubjectId);
    if (!curSubj) {
      return toast('Pilih mata pelajaran yang ingin dihapus terlebih dahulu', 'error');
    }

    const qCount = curSubj.question_count_actual || state.questions.length || 0;
    const msg = `Apakah Anda yakin ingin menghapus mata pelajaran "${curSubj.name}"?\n\n⚠️ PERINGATAN: ${qCount > 0 ? `${qCount} soal di dalamnya` : 'Mata pelajaran ini'} akan ikut terhapus secara permanen!`;
    if (!confirm(msg)) return;

    try {
      const res = await api(`/api/admin/subjects?id=${curSubj.id}`, {
        method: 'DELETE'
      });
      if (res && res.ok) {
        toast(`Mata pelajaran "${curSubj.name}" berhasil dihapus`, 'success');
        await loadClassesAndSubjects();
        const avail = getFilteredSubjects();
        if (avail.length > 0) {
          state.selectedSubjectId = avail[0].id;
          await loadQuestions(state.selectedSubjectId);
        } else {
          state.selectedSubjectId = null;
          state.questions = [];
        }
        render();
      }
    } catch (err) {
      toast('Gagal menghapus pelajaran: ' + err.message, 'error');
    }
  }

  async function exportQuestions() {
    if (!state.selectedSubjectId) {
      toast('Pilih mata pelajaran terlebih dahulu', 'error');
      return;
    }
    try {
      const res = await api(`/api/admin/questions/export?subjectId=${state.selectedSubjectId}`);
      if (res && (res.ok || res.questions)) {
        const jsonStr = JSON.stringify(res, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const mapelName = (res.subjectName || 'soal').toLowerCase().replace(/[^a-z0-9]/g, '-');
        a.href = url;
        a.download = `bank-soal-${mapelName}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        const count = res.totalQuestions !== undefined ? res.totalQuestions : (Array.isArray(res.questions) ? res.questions.length : 0);
        toast(`Berhasil mengekspor ${count} soal`, 'success');
      }
    } catch (err) {
      toast('Gagal ekspor: ' + err.message, 'error');
    }
  }

  async function importQuestions(subjectId, questionsList) {
    try {
      const res = await api(`/api/admin/questions/import?subjectId=${subjectId}`, {
        method: 'POST',
        body: {
          subjectId,
          questions: questionsList,
        },
      });
      if (res && res.ok) {
        toast(`Import selesai: ${res.imported || 0} baru, ${res.updated || 0} diperbarui`, 'success');
        state.modal = null;
        state.modalData = null;
        await loadQuestions(subjectId);
        loadOverview();
      }
    } catch (err) {
      toast('Gagal import: ' + err.message, 'error');
    }
  }

  async function resetPlayerPassword(playerId, newPassword) {
    try {
      const res = await api(`/api/admin/player/${playerId}/reset-password`, {
        method: 'POST',
        body: { password: newPassword },
      });
      if (res.ok) {
        toast('Kata sandi siswa berhasil diubah', 'success');
        state.modal = null;
        state.modalData = null;
      }
    } catch (err) {
      toast('Gagal reset password: ' + err.message, 'error');
    }
  }

  /* ── Render Views ── */
  function render() {
    if (!root) return;

    if (state.loading) {
      root.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:var(--c-muted)">
          <div style="font-size:2rem;margin-bottom:12px">⚔️</div>
          <p>Memuat Portal Admin...</p>
        </div>
      `;
      return;
    }

    if (!state.admin) {
      renderLogin();
      return;
    }

    renderDashboard();
    renderModal();
  }

  function renderLogin() {
    root.innerHTML = `
      <div style="max-width:420px;margin:50px auto;width:100%">
        <div style="text-align:center;margin-bottom:24px">
          <div style="font-size:3rem;margin-bottom:8px">🗡️</div>
          <h1 style="font-size:1.8rem;margin:0 0 6px;color:var(--c-primary)">Portal Guru & Admin</h1>
          <p style="color:var(--c-muted);margin:0;font-size:.9rem">Game Edukasi "Petualangan Pelajar"</p>
        </div>

        <div style="background:var(--c-surface);border:1px solid var(--c-surface-strong);border-radius:var(--radius);padding:24px">
          <form id="admin-login-form" style="display:flex;flex-direction:column;gap:14px">
            <div class="field">
              <label for="adm-user">Nama Pengguna (Username)</label>
              <input type="text" id="adm-user" required autocomplete="username" placeholder="Masukkan username admin" value="admin">
            </div>
            <div class="field">
              <label for="adm-pass">Kata Sandi (Password)</label>
              <input type="password" id="adm-pass" required autocomplete="current-password" placeholder="Masukkan password admin" value="admin123">
            </div>
            <button type="submit" class="btn" style="background:var(--c-primary);color:#1c1206;font-weight:800;padding:12px;border:0;border-radius:12px;cursor:pointer;margin-top:8px">
              Masuk ke Portal Admin
            </button>
            <div style="text-align:center;margin-top:8px">
              <a href="/" style="color:var(--c-muted);font-size:.85rem;text-decoration:none">← Kembali ke Halaman Game</a>
            </div>
          </form>
        </div>
      </div>
    `;

    const form = document.getElementById('admin-login-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('adm-user').value.trim();
        const p = document.getElementById('adm-pass').value;
        if (!u || !p) return toast('Harap isi username dan password', 'error');
        login(u, p);
      });
    }
  }

  function renderDashboard() {
    const curTab = state.activeTab;

    root.innerHTML = `
      <!-- Top Bar -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;border-bottom:1px solid rgba(255,255,255,.08);padding-bottom:14px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:1.8rem">🗡️</span>
          <div>
            <h1 style="font-size:1.3rem;margin:0;color:var(--c-primary)">Portal Admin Guru</h1>
            <div style="font-size:.78rem;color:var(--c-muted)">Petualangan Pelajar SD & MI • play.printshare.my.id</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="badge blue">👤 ${escapeHtml(state.admin.username)}</span>
          <a href="/" class="btn small" style="background:var(--c-surface);color:var(--c-text);text-decoration:none;border-radius:10px">🎮 Buka Game</a>
          <button id="btn-logout" class="btn small" style="background:rgba(239,68,68,.2);color:#fca5a5;border:0;border-radius:10px;cursor:pointer">Keluar</button>
        </div>
      </div>

      <!-- Navigation Tabs (Presisi & Sama Besar) -->
      <div class="adm-tabs">
        <button type="button" class="${curTab === 'overview' ? 'active' : ''}" data-tab="overview">
          <span class="tab-icon">📊</span>
          <span class="tab-label">Ringkasan</span>
        </button>
        <button type="button" class="${curTab === 'questions' ? 'active' : ''}" data-tab="questions">
          <span class="tab-icon">📚</span>
          <span class="tab-label">Bank Soal</span>
        </button>
        <button type="button" class="${curTab === 'players' ? 'active' : ''}" data-tab="players">
          <span class="tab-icon">👥</span>
          <span class="tab-label">Siswa & Sandi</span>
        </button>
        <button type="button" class="${curTab === 'reports' ? 'active' : ''}" data-tab="reports">
          <span class="tab-icon">📈</span>
          <span class="tab-label">Laporan Mingguan</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="tab-content" style="display:flex;flex-direction:column;gap:16px">
        ${curTab === 'overview' ? renderOverviewContent() : ''}
        ${curTab === 'questions' ? renderQuestionsContent() : ''}
        ${curTab === 'players' ? renderPlayersContent() : ''}
        ${curTab === 'reports' ? renderReportsContent() : ''}
      </div>
    `;

    // Tab buttons event listeners
    root.querySelectorAll('.adm-tabs button').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.getAttribute('data-tab');
        if (t !== state.activeTab) {
          state.activeTab = t;
          if (t === 'players' && state.players.length === 0) {
            loadPlayers();
          } else if (t === 'reports' && state.reportsList.length === 0) {
            loadReports();
          }
          render();
        }
      });
    });

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', logout);
    }

    // Attach listeners for specific tabs
    attachTabListeners();
  }

  function renderOverviewContent() {
    const ov = state.overview || {
      totalPlayers: 0,
      totalQuestions: 0,
      totalSessions: 0,
      accuracyPct: 0,
    };

    return `
      <!-- Stats Cards (Klik untuk membuka menu terkait) -->
      <div class="stat-grid">
        <div class="stat-card clickable" data-nav="players" title="Klik untuk membuka Siswa & Kata Sandi">
          <div class="lbl">Total Siswa Terdaftar</div>
          <div class="val">👥 ${ov.totalPlayers || 0}</div>
          <div class="link-hint">Buka Data Siswa →</div>
        </div>
        <div class="stat-card clickable" data-nav="questions" title="Klik untuk membuka Bank Soal">
          <div class="lbl">Total Bank Soal Aktif</div>
          <div class="val">📚 ${ov.totalQuestions || 0}</div>
          <div class="link-hint">Kelola Bank Soal →</div>
        </div>
        <div class="stat-card clickable" data-nav="reports" title="Klik untuk membuka Laporan Mingguan">
          <div class="lbl">Total Sesi Battle</div>
          <div class="val">⚔️ ${ov.totalSessions || 0}</div>
          <div class="link-hint">Buka Laporan Aktivitas →</div>
        </div>
        <div class="stat-card clickable" data-nav="reports" title="Klik untuk membuka Laporan Mingguan">
          <div class="lbl">Rata-rata Akurasi Jawaban</div>
          <div class="val">🎯 ${ov.accuracyPct || 0}%</div>
          <div class="link-hint">Lihat Evaluasi Nilai →</div>
        </div>
      </div>

      <!-- Quick Action Guide (Interaktif & Terhubung) -->
      <div style="background:var(--c-surface);border:1px solid var(--c-surface-strong);border-radius:var(--radius);padding:20px;display:flex;flex-direction:column;gap:12px">
        <h3 style="margin:0;font-size:1.1rem;color:var(--c-primary)">📖 Panduan Penggunaan Portal Guru</h3>
        <p style="margin:0;color:var(--c-muted);font-size:.9rem;line-height:1.5">
          Selamat datang di panel kontrol edukasi. Anda dapat mengelola materi pembelajaran, menyusun dan mengimpor bank soal, serta memantau perkembangan nilai belajar siswa secara langsung.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:12px;margin-top:6px">
          <div class="stat-card clickable" data-nav="questions" style="background:rgba(0,0,0,.25);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,.05)">
            <strong style="color:#fbbf24;display:block;margin-bottom:4px">1. Kelola Bank Soal →</strong>
            <span style="font-size:.84rem;color:var(--c-muted)">Buka tab <strong>Bank Soal</strong> untuk menambah atau mengedit pertanyaan kuis berdasarkan mata pelajaran dan kelas siswa.</span>
          </div>
          <div class="stat-card clickable" data-nav="questions-import" style="background:rgba(0,0,0,.25);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,.05)">
            <strong style="color:#38bdf8;display:block;margin-bottom:4px">2. Import & Export JSON →</strong>
            <span style="font-size:.84rem;color:var(--c-muted)">Gunakan fitur import JSON untuk memasukkan puluhan soal sekaligus dari format standar kuis kurikulum merdeka.</span>
          </div>
          <div class="stat-card clickable" data-nav="players" style="background:rgba(0,0,0,.25);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,.05)">
            <strong style="color:#4ade80;display:block;margin-bottom:4px">3. Reset Sandi Siswa →</strong>
            <span style="font-size:.84rem;color:var(--c-muted)">Jika siswa lupa kata sandi akunnya, buka tab <strong>Siswa & Kata Sandi</strong> lalu klik tombol kunci untuk mengatur sandi baru instan.</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderQuestionsContent() {
    const curSubjects = getFilteredSubjects();
    const curSubject = state.subjects.find(s => s.id === state.selectedSubjectId);

    // Calculate question type distribution statistics (T-19 / A.4)
    const typeCounts = {
      MCQ: 0,
      TRUE_FALSE: 0,
      ORDERING: 0,
      MATCHING: 0,
      SHORT: 0
    };
    state.questions.forEach(q => {
      const t = (q.question_type || 'MCQ').toUpperCase();
      if (typeCounts[t] !== undefined) typeCounts[t]++;
      else typeCounts.MCQ++;
    });

    return `
      <!-- Toolbar Filters & Actions -->
      <div style="background:var(--c-surface);border:1px solid var(--c-surface-strong);border-radius:var(--radius);padding:14px 18px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between">
        <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">
          <div style="display:flex;align-items:center;gap:6px">
            <label style="font-size:.82rem;font-weight:700;color:var(--c-muted)">Kelas:</label>
            <select id="sel-class" style="background:rgba(0,0,0,.35);color:var(--c-text);border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:6px 10px;font-size:.85rem">
              ${state.classes.map(c => `
                <option value="${c.id}" ${c.id === state.selectedClassId ? 'selected' : ''}>${escapeHtml(c.name)}</option>
              `).join('')}
            </select>
          </div>

          <div style="display:flex;align-items:center;gap:6px">
            <label style="font-size:.82rem;font-weight:700;color:var(--c-muted)">Pelajaran:</label>
            <select id="sel-subject" style="background:rgba(0,0,0,.35);color:var(--c-text);border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:6px 10px;font-size:.85rem">
              ${curSubjects.map(s => `
                <option value="${s.id}" ${s.id === state.selectedSubjectId ? 'selected' : ''}>${escapeHtml(s.name)} (${s.question_count_actual || 0} soal)</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="btn-add-class" class="btn small" style="background:rgba(168,85,247,.2);color:#c084fc;border:0;border-radius:10px;cursor:pointer;font-weight:700">
            🏫 Tambah Kelas
          </button>
          <button id="btn-delete-class" class="btn small" style="background:rgba(239,68,68,.15);color:#f87171;border:0;border-radius:10px;cursor:pointer;font-weight:700" ${!state.selectedClassId ? 'disabled' : ''} title="Hapus kelas yang sedang dipilih">
            🗑️ Hapus Kelas
          </button>
          <button id="btn-add-subject" class="btn small" style="background:rgba(59,130,246,.2);color:#60a5fa;border:0;border-radius:10px;cursor:pointer;font-weight:700">
            📚 Tambah Pelajaran
          </button>
          <button id="btn-delete-subject" class="btn small" style="background:rgba(239,68,68,.15);color:#f87171;border:0;border-radius:10px;cursor:pointer;font-weight:700" ${!state.selectedSubjectId ? 'disabled' : ''} title="Hapus mata pelajaran yang sedang dipilih">
            🗑️ Hapus Pelajaran
          </button>
          <button id="btn-add-q" class="btn small" style="background:var(--c-good);color:#052e16;font-weight:800;border:0;border-radius:10px;cursor:pointer">
            ➕ Tambah Soal
          </button>
          <button id="btn-import-q" class="btn small" style="background:rgba(56,189,248,.2);color:#38bdf8;border:0;border-radius:10px;cursor:pointer">
            📥 Import JSON
          </button>
          <button id="btn-export-q" class="btn small" style="background:rgba(245,158,11,.2);color:#fbbf24;border:0;border-radius:10px;cursor:pointer">
            📤 Export JSON
          </button>
        </div>
      </div>

      <!-- Type Distribution Statistics Bar (T-19) -->
      <div class="q-type-stats" style="margin-top:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 14px;display:flex;flex-wrap:wrap;align-items:center;gap:10px;font-size:.82rem">
        <span style="font-weight:700;color:var(--c-muted)">Distribusi Tipe Soal:</span>
        <span class="chip" style="background:rgba(56,189,248,.18);color:#38bdf8;padding:2px 8px;border-radius:6px;font-weight:700">MCQ: ${typeCounts.MCQ}</span>
        <span class="chip" style="background:rgba(245,158,11,.18);color:#fbbf24;padding:2px 8px;border-radius:6px;font-weight:700">TRUE/FALSE: ${typeCounts.TRUE_FALSE}</span>
        <span class="chip" style="background:rgba(168,85,247,.18);color:#c084fc;padding:2px 8px;border-radius:6px;font-weight:700">ORDERING: ${typeCounts.ORDERING}</span>
        <span class="chip" style="background:rgba(236,72,153,.18);color:#f472b6;padding:2px 8px;border-radius:6px;font-weight:700">MATCHING: ${typeCounts.MATCHING}</span>
        <span class="chip" style="background:rgba(34,197,94,.18);color:#4ade80;padding:2px 8px;border-radius:6px;font-weight:700">SHORT: ${typeCounts.SHORT}</span>
        <span style="margin-left:auto;color:var(--c-muted)">Total: <strong style="color:var(--c-text)">${state.questions.length}</strong></span>
      </div>

      <!-- Question List Table -->
      <div class="table-wrap">
        <table class="adm-table">
          <thead>
            <tr>
              <th style="width:48px;text-align:center">#</th>
              <th>Pertanyaan</th>
              <th style="width:280px">Pilihan / Kunci Jawaban</th>
              <th style="width:110px">Tingkat</th>
              <th style="width:120px;text-align:center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${state.loadingQuestions ? `
              <tr>
                <td colspan="5" style="text-align:center;padding:40px;color:var(--c-muted)">
                  Memuat data bank soal...
                </td>
              </tr>
            ` : state.questions.length === 0 ? `
              <tr>
                <td colspan="5" style="text-align:center;padding:40px;color:var(--c-muted)">
                  Belum ada soal pada mata pelajaran ini.<br>
                  <button id="btn-empty-add" class="btn small" style="background:var(--c-good);color:#052e16;font-weight:800;margin-top:12px;border:0;border-radius:8px;cursor:pointer">
                    Tambah Soal Pertama
                  </button>
                </td>
              </tr>
            ` : state.questions.map((q, idx) => {
              const qType = (q.question_type || 'MCQ').toUpperCase();
              let typeData = {};
              if (q.type_data_json) {
                try { typeData = JSON.parse(q.type_data_json); } catch(e) {}
              }
              const opts = Array.isArray(q.options) ? q.options : [];
              const ansIdx = q.answer_index !== undefined ? q.answer_index : 0;
              const diffLabels = { 1: 'Mudah', 2: 'Sedang', 3: 'Sulit', 4: 'Tinggi', 5: 'Master' };
              const diffColors = { 1: 'green', 2: 'blue', 3: 'yellow', 4: 'red', 5: 'red' };
              const diff = q.difficulty || 1;

              const typeBadge = `<span class="chip" style="font-size:0.68rem;padding:1px 6px;margin-bottom:4px;display:inline-block;background:rgba(255,255,255,0.1);color:#cbd5e1">${qType}</span>`;

              let answerDisplay = '';
              if (qType === 'MCQ') {
                answerDisplay = `
                  <div style="display:flex;flex-direction:column;gap:2px;font-size:.8rem">
                    ${opts.map((opt, oIdx) => `
                      <div style="display:flex;align-items:center;gap:6px;${oIdx === ansIdx ? 'color:#4ade80;font-weight:700' : 'color:var(--c-muted)'}">
                        <span>${['A', 'B', 'C', 'D'][oIdx] || oIdx + 1}.</span>
                        <span>${escapeHtml(opt)}</span>
                        ${oIdx === ansIdx ? '<span style="font-size:.7rem">✓ (Kunci)</span>' : ''}
                      </div>
                    `).join('')}
                  </div>
                `;
              } else if (qType === 'TRUE_FALSE') {
                const isTrue = Boolean(typeData.correctAnswer ?? (ansIdx === 0));
                answerDisplay = `
                  <div style="font-size:.84rem;color:${isTrue ? '#4ade80' : '#f87171'};font-weight:700">
                    Kunci: ${isTrue ? '✅ Benar' : '❌ Salah'}
                  </div>
                `;
              } else if (qType === 'ORDERING') {
                const items = Array.isArray(typeData.items) ? typeData.items : opts;
                answerDisplay = `
                  <div style="display:flex;flex-direction:column;gap:2px;font-size:.8rem;color:#c084fc">
                    <span style="font-weight:700;color:var(--c-muted)">Urutan Benar:</span>
                    ${items.map((it, i) => `<div>${i + 1}. ${escapeHtml(it)}</div>`).join('')}
                  </div>
                `;
              } else if (qType === 'MATCHING') {
                const pairs = Array.isArray(typeData.pairs) ? typeData.pairs : [];
                answerDisplay = `
                  <div style="display:flex;flex-direction:column;gap:2px;font-size:.8rem;color:#f472b6">
                    <span style="font-weight:700;color:var(--c-muted)">Pasangan:</span>
                    ${pairs.map(p => `<div>${escapeHtml(p.left)} ➔ ${escapeHtml(p.right)}</div>`).join('')}
                  </div>
                `;
              } else if (qType === 'SHORT') {
                const isNum = Boolean(typeData.isNumeric || typeData.numeric);
                const accepted = typeData.accepted ? typeData.accepted.join(', ') : (typeData.numeric ? `${typeData.numeric.value} (±${typeData.numeric.tolerance || 0})` : '-');
                answerDisplay = `
                  <div style="font-size:.84rem;color:#4ade80">
                    <span style="color:var(--c-muted);font-weight:700">Kunci (${isNum ? 'Angka' : 'Teks'}):</span>
                    <strong>${escapeHtml(accepted)}</strong>
                  </div>
                `;
              }

              return `
                <tr>
                  <td style="text-align:center;color:var(--c-muted);font-weight:700">${idx + 1}</td>
                  <td>
                    ${typeBadge}
                    <div style="font-weight:700;color:var(--c-text);margin-bottom:4px">${escapeHtml(q.text)}</div>
                    ${q.explanation ? `<div style="font-size:.78rem;color:var(--c-muted)"><em>💡 ${escapeHtml(q.explanation)}</em></div>` : ''}
                  </td>
                  <td>${answerDisplay}</td>
                  <td>
                    <span class="badge ${diffColors[diff] || 'blue'}">
                      Tier ${diff} (${diffLabels[diff] || 'Normal'})
                    </span>
                  </td>
                  <td style="text-align:center">
                    <div style="display:inline-flex;gap:6px">
                      <button class="btn small btn-edit-q" data-qid="${q.id}" style="background:rgba(56,189,248,.18);color:#38bdf8;border:0;border-radius:8px;cursor:pointer;padding:4px 8px" title="Edit Soal">
                        ✏️ Edit
                      </button>
                      <button class="btn small btn-del-q" data-qid="${q.id}" style="background:rgba(239,68,68,.18);color:#f87171;border:0;border-radius:8px;cursor:pointer;padding:4px 8px" title="Hapus Soal">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderPlayersContent() {
    const qSearch = state.playerSearch.toLowerCase();
    const filtered = state.players.filter(p => !qSearch || p.nick.toLowerCase().includes(qSearch));

    return `
      <!-- Toolbar Players -->
      <div style="background:var(--c-surface);border:1px solid var(--c-surface-strong);border-radius:var(--radius);padding:14px 18px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:10px">
          <input type="text" id="inp-search-player" placeholder="Cari nama / nick siswa..." value="${escapeHtml(state.playerSearch)}" style="background:rgba(0,0,0,.35);color:var(--c-text);border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:8px 12px;font-size:.85rem;min-width:240px">
          <span style="font-size:.85rem;color:var(--c-muted)">Total: ${filtered.length} siswa</span>
        </div>
        <button id="btn-refresh-players" class="btn small" style="background:var(--c-surface);color:var(--c-text);border:0;border-radius:10px;cursor:pointer">
          🔄 Muat Ulang Data
        </button>
      </div>

      <!-- Player List Table -->
      <div class="table-wrap">
        <table class="adm-table">
          <thead>
            <tr>
              <th style="width:48px;text-align:center">ID</th>
              <th>Nama / Nick Siswa</th>
              <th style="width:120px">Tingkat Kelas</th>
              <th style="width:100px">Level RPG</th>
              <th style="width:110px">Total XP</th>
              <th style="width:110px">Koin 🪙</th>
              <th style="width:170px">Terakhir Aktif</th>
              <th style="width:140px;text-align:center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${state.loadingPlayers ? `
              <tr>
                <td colspan="8" style="text-align:center;padding:40px;color:var(--c-muted)">
                  Memuat data siswa...
                </td>
              </tr>
            ` : filtered.length === 0 ? `
              <tr>
                <td colspan="8" style="text-align:center;padding:40px;color:var(--c-muted)">
                  Tidak ada data siswa yang cocok.
                </td>
              </tr>
            ` : filtered.map(p => {
              const cls = state.classes.find(c => c.id === p.class_id);
              const clsName = cls ? cls.name : `Kelas ${p.class_id}`;
              const lastActive = p.last_login_at ? new Date(p.last_login_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-';

              return `
                <tr>
                  <td style="text-align:center;color:var(--c-muted)">${p.id}</td>
                  <td>
                    <div style="font-weight:700;color:var(--c-text)">${escapeHtml(p.nick)}</div>
                  </td>
                  <td><span class="badge blue">${escapeHtml(clsName)}</span></td>
                  <td><span class="badge yellow">Lv. ${p.level || 1}</span></td>
                  <td style="font-weight:700;color:#38bdf8">${p.xp.toLocaleString()} XP</td>
                  <td style="font-weight:700;color:#fbbf24">🪙 ${p.coins || 0}</td>
                  <td style="font-size:.8rem;color:var(--c-muted)">${lastActive}</td>
                  <td style="text-align:center">
                    <button class="btn small btn-reset-pw" data-pid="${p.id}" data-pnick="${escapeHtml(p.nick)}" style="background:rgba(245,158,11,.2);color:#fbbf24;border:0;border-radius:8px;cursor:pointer;padding:4px 8px" title="Atur kata sandi baru untuk siswa ini">
                      🔑 Reset Sandi
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderReportsContent() {
    const classId = state.selectedReportClassId || (state.classes.length > 0 ? state.classes[0].id : 1);
    const reports = state.reportsList || [];

    return `
      <!-- Toolbar Reports -->
      <div style="background:var(--c-surface);border:1px solid var(--c-surface-strong);border-radius:var(--radius);padding:14px 18px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <label style="font-size:.85rem;font-weight:700;color:var(--c-muted)">Pilih Tingkat Kelas:</label>
          <select id="sel-report-class" style="background:rgba(0,0,0,.35);color:var(--c-text);border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:6px 12px;font-size:.85rem">
            ${state.classes.map(c => `
              <option value="${c.id}" ${c.id === classId ? 'selected' : ''}>${escapeHtml(c.name)}</option>
            `).join('')}
          </select>
          <span style="font-size:.85rem;color:var(--c-muted)">• ${reports.length} Siswa Terdata</span>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="btn-export-reports-csv" class="btn small" style="background:rgba(34,197,94,.2);color:#4ade80;border:0;border-radius:10px;cursor:pointer">
            📥 Unduh CSV
          </button>
          <button id="btn-generate-reports" class="btn small" style="background:rgba(245,158,11,.2);color:#fbbf24;border:0;border-radius:10px;cursor:pointer">
            ⚡ Kompilasi Ulang
          </button>
          <button id="btn-refresh-reports" class="btn small" style="background:var(--c-surface);color:var(--c-text);border:0;border-radius:10px;cursor:pointer">
            🔄 Muat Ulang
          </button>
        </div>
      </div>

      <!-- Reports Table -->
      <div class="table-wrap">
        <table class="adm-table">
          <thead>
            <tr>
              <th style="width:48px;text-align:center">#</th>
              <th>Nama / Nick Siswa</th>
              <th style="width:110px;text-align:center">Sesi Battle</th>
              <th style="width:120px;text-align:center">Menit Belajar</th>
              <th style="width:130px;text-align:center">Rata-rata Akurasi</th>
              <th style="width:130px;text-align:center">Tren</th>
              <th style="width:200px">Mapel Terlemah</th>
            </tr>
          </thead>
          <tbody>
            ${state.loadingReports ? `
              <tr>
                <td colspan="7" style="text-align:center;padding:40px;color:var(--c-muted)">
                  Memuat data laporan mingguan...
                </td>
              </tr>
            ` : reports.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align:center;padding:40px;color:var(--c-muted)">
                  Belum ada aktivitas mingguan tercatat untuk kelas ini. Klik tombol <strong>Kompilasi Ulang</strong> untuk memperbarui data.
                </td>
              </tr>
            ` : reports.map((r, idx) => {
              const accPct = Math.round((r.accuracy || 0) * 100);
              let trendBadge = '<span class="badge yellow">🟡 Stabil</span>';
              if (r.trend === 'up') trendBadge = '<span class="badge green">🟢 Meningkat</span>';
              else if (r.trend === 'down') trendBadge = '<span class="badge red">🔴 Menurun</span>';

              const accColor = accPct >= 80 ? '#4ade80' : (accPct >= 60 ? '#fbbf24' : '#f87171');

              return `
                <tr>
                  <td style="text-align:center;color:var(--c-muted)">${idx + 1}</td>
                  <td>
                    <div style="font-weight:700;color:var(--c-text)">${escapeHtml(r.nick)}</div>
                  </td>
                  <td style="text-align:center;font-weight:700">${r.sessions || 0}</td>
                  <td style="text-align:center;color:var(--c-muted)">${r.minutes || 0} mnt</td>
                  <td style="text-align:center">
                    <span style="font-weight:800;color:${accColor}">${accPct}%</span>
                  </td>
                  <td style="text-align:center">${trendBadge}</td>
                  <td>
                    ${r.weakestSubject && r.weakestSubject !== '-' ? `
                      <span class="badge red" style="font-size:.78rem">⚠️ ${escapeHtml(r.weakestSubject)}</span>
                    ` : `
                      <span style="color:var(--c-muted);font-size:.8rem">-</span>
                    `}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function attachTabListeners() {
    // Quick Action & Card Navigation (Data Ringkasan Link)
    root.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', () => {
        const target = el.getAttribute('data-nav');
        if (target === 'questions-import') {
          state.activeTab = 'questions';
          render();
          openImportModal();
        } else if (target) {
          state.activeTab = target;
          if (target === 'players' && state.players.length === 0) loadPlayers();
          else if (target === 'reports') loadReports();
          render();
        }
      });
    });

    // Reports Listeners
    const selRepClass = document.getElementById('sel-report-class');
    if (selRepClass) {
      selRepClass.addEventListener('change', (e) => {
        const cid = parseInt(e.target.value, 10);
        state.selectedReportClassId = cid;
        loadReports(cid);
      });
    }

    const btnExportReportsCsv = document.getElementById('btn-export-reports-csv');
    if (btnExportReportsCsv) {
      btnExportReportsCsv.addEventListener('click', exportReportsCsv);
    }

    const btnGenerateReports = document.getElementById('btn-generate-reports');
    if (btnGenerateReports) {
      btnGenerateReports.addEventListener('click', generateWeeklyReports);
    }

    const btnRefreshReports = document.getElementById('btn-refresh-reports');
    if (btnRefreshReports) {
      btnRefreshReports.addEventListener('click', () => loadReports(state.selectedReportClassId));
    }

    // Class dropdown change
    const selClass = document.getElementById('sel-class');
    if (selClass) {
      selClass.addEventListener('change', async (e) => {
        state.selectedClassId = parseInt(e.target.value, 10);
        const avail = getFilteredSubjects();
        if (avail.length > 0) {
          state.selectedSubjectId = avail[0].id;
          await loadQuestions(state.selectedSubjectId);
        } else {
          state.selectedSubjectId = null;
          state.questions = [];
          render();
        }
      });
    }

    // Subject dropdown change
    const selSubject = document.getElementById('sel-subject');
    if (selSubject) {
      selSubject.addEventListener('change', async (e) => {
        state.selectedSubjectId = parseInt(e.target.value, 10);
        await loadQuestions(state.selectedSubjectId);
      });
    }

    // Question action buttons
    const btnAddClass = document.getElementById('btn-add-class');
    if (btnAddClass) {
      btnAddClass.addEventListener('click', () => openClassModal());
    }

    const btnDeleteClass = document.getElementById('btn-delete-class');
    if (btnDeleteClass) {
      btnDeleteClass.addEventListener('click', () => deleteSelectedClass());
    }

    const btnAddSubject = document.getElementById('btn-add-subject');
    if (btnAddSubject) {
      btnAddSubject.addEventListener('click', () => openSubjectModal());
    }

    const btnDeleteSubject = document.getElementById('btn-delete-subject');
    if (btnDeleteSubject) {
      btnDeleteSubject.addEventListener('click', () => deleteSelectedSubject());
    }

    const btnAddQ = document.getElementById('btn-add-q');
    if (btnAddQ) {
      btnAddQ.addEventListener('click', () => openQuestionModal());
    }
    const btnEmptyAdd = document.getElementById('btn-empty-add');
    if (btnEmptyAdd) {
      btnEmptyAdd.addEventListener('click', () => openQuestionModal());
    }

    const btnImportQ = document.getElementById('btn-import-q');
    if (btnImportQ) {
      btnImportQ.addEventListener('click', () => openImportModal());
    }

    const btnExportQ = document.getElementById('btn-export-q');
    if (btnExportQ) {
      btnExportQ.addEventListener('click', exportQuestions);
    }

    // Edit question buttons
    root.querySelectorAll('.btn-edit-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const qid = parseInt(btn.getAttribute('data-qid'), 10);
        const q = state.questions.find(item => item.id === qid);
        if (q) openQuestionModal(q);
      });
    });

    // Delete question buttons
    root.querySelectorAll('.btn-del-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const qid = parseInt(btn.getAttribute('data-qid'), 10);
        deleteQuestion(qid);
      });
    });

    // Player search input
    const inpSearch = document.getElementById('inp-search-player');
    if (inpSearch) {
      inpSearch.addEventListener('input', (e) => {
        state.playerSearch = e.target.value;
        const tbody = root.querySelector('tbody');
        if (tbody) render();
      });
    }

    // Refresh players
    const btnRefPlayers = document.getElementById('btn-refresh-players');
    if (btnRefPlayers) {
      btnRefPlayers.addEventListener('click', loadPlayers);
    }

    // Reset password buttons
    root.querySelectorAll('.btn-reset-pw').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = parseInt(btn.getAttribute('data-pid'), 10);
        const pnick = btn.getAttribute('data-pnick');
        openResetPasswordModal(pid, pnick);
      });
    });
  }

  /* ── Modal Handling ── */
  function openQuestionModal(question = null) {
    let typeData = {};
    if (question && question.type_data_json) {
      try { typeData = JSON.parse(question.type_data_json); } catch (e) {}
    } else if (question && question.type_data) {
      typeData = question.type_data;
    }

    state.modal = 'question';
    state.modalData = question ? {
      id: question.id,
      subjectId: question.subject_id || state.selectedSubjectId,
      text: question.text || '',
      questionType: (question.question_type || 'MCQ').toUpperCase(),
      options: Array.isArray(question.options) ? [...question.options] : ['', '', '', ''],
      answerIndex: question.answer_index !== undefined ? question.answer_index : 0,
      explanation: question.explanation || '',
      difficulty: question.difficulty || 1,
      typeData: typeData || {}
    } : {
      id: null,
      subjectId: state.selectedSubjectId,
      text: '',
      questionType: 'MCQ',
      options: ['', '', '', ''],
      answerIndex: 0,
      explanation: '',
      difficulty: 1,
      typeData: {}
    };
    renderModal();
  }

  function openImportModal() {
    state.modal = 'import';
    state.modalData = {
      subjectId: state.selectedSubjectId,
      parsedQuestions: [],
      errorText: '',
    };
    renderModal();
  }

  function openClassModal() {
    state.modal = 'add-class';
    state.modalData = {};
    renderModal();
  }

  function openSubjectModal() {
    state.modal = 'add-subject';
    state.modalData = {
      classId: state.selectedClassId || (state.classes.length > 0 ? state.classes[0].id : null)
    };
    renderModal();
  }

  function openResetPasswordModal(playerId, nick) {
    state.modal = 'reset-pw';
    state.modalData = {
      playerId,
      nick,
    };
    renderModal();
  }

  function closeModal() {
    state.modal = null;
    state.modalData = null;
    const oldBackdrop = document.getElementById('admin-modal-backdrop');
    if (oldBackdrop) oldBackdrop.remove();
  }

  function renderModal() {
    let backdrop = document.getElementById('admin-modal-backdrop');
    if (!state.modal) {
      if (backdrop) backdrop.remove();
      return;
    }

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'admin-modal-backdrop';
      backdrop.className = 'modal-backdrop';
      document.body.appendChild(backdrop);
    }

    if (state.modal === 'add-class') {
      const nextSort = (state.classes.length > 0)
        ? Math.max(...state.classes.map(c => Number(c.sort_order || 0))) + 1
        : 1;

      backdrop.innerHTML = `
        <div class="modal" style="width:min(440px, 100%)">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px">
            <h3 style="margin:0;font-size:1.15rem;color:var(--c-primary)">🏫 Tambah Kelas Baru</h3>
            <button id="modal-close-btn" style="background:transparent;border:0;color:var(--c-muted);font-size:1.4rem;cursor:pointer">&times;</button>
          </div>

          <form id="form-add-class" style="display:flex;flex-direction:column;gap:14px;margin-top:14px">
            <div class="field">
              <label for="inp-class-name">Nama Kelas <span style="color:#ef4444">*</span></label>
              <input type="text" id="inp-class-name" required placeholder="Contoh: Kelas 3 SD atau Kelas 1 MI" autocomplete="off">
            </div>

            <div class="field">
              <label for="inp-class-sort">Urutan Tampilan (Sort Order)</label>
              <input type="number" id="inp-class-sort" value="${nextSort}" min="1" step="1">
              <span style="font-size:.76rem;color:var(--c-muted)">Urutan posisi kelas di daftar dan filter menu.</span>
            </div>

            ${state.classes.length > 0 ? `
              <div class="field" style="background:rgba(255,255,255,.03);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,.08)">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:.85rem;font-weight:700">
                  <input type="checkbox" id="chk-copy-subjects" checked>
                  <span>Salin mata pelajaran standar dari kelas lain</span>
                </label>
                <div id="copy-subject-box" style="margin-top:8px">
                  <select id="sel-copy-class" style="width:100%;background:rgba(0,0,0,.35);color:var(--c-text);border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:6px 10px;font-size:.82rem">
                    ${state.classes.map(c => `
                      <option value="${c.id}" ${c.id === (state.selectedClassId || state.classes[0].id) ? 'selected' : ''}>Salin dari ${escapeHtml(c.name)}</option>
                    `).join('')}
                  </select>
                  <span style="font-size:.72rem;color:var(--c-muted);display:block;margin-top:4px">
                    Mata pelajaran aktif (ikon, tema monster, dsb.) akan otomatis disalin ke kelas baru.
                  </span>
                </div>
              </div>
            ` : ''}

            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:6px">
              <button type="button" id="modal-cancel-btn" class="btn small" style="background:var(--c-surface);color:var(--c-muted);border:0;border-radius:10px;cursor:pointer">Batal</button>
              <button type="submit" id="btn-submit-class" class="btn small" style="background:var(--c-primary);color:#1c1206;font-weight:800;border:0;border-radius:10px;cursor:pointer">
                Simpan Kelas
              </button>
            </div>
          </form>
        </div>
      `;

      document.getElementById('modal-close-btn').addEventListener('click', closeModal);
      document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

      const chkCopy = document.getElementById('chk-copy-subjects');
      const copyBox = document.getElementById('copy-subject-box');
      if (chkCopy && copyBox) {
        chkCopy.addEventListener('change', () => {
          copyBox.style.display = chkCopy.checked ? 'block' : 'none';
        });
      }

      document.getElementById('form-add-class').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('inp-class-name').value.trim();
        const sortVal = parseInt(document.getElementById('inp-class-sort').value, 10);
        if (!name) return toast('Nama kelas tidak boleh kosong', 'error');

        const copyFromClassId = (chkCopy && chkCopy.checked)
          ? parseInt(document.getElementById('sel-copy-class').value, 10)
          : null;

        const submitBtn = document.getElementById('btn-submit-class');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Menyimpan...';
        }

        try {
          const res = await api('/api/admin/classes', {
            method: 'POST',
            body: {
              name,
              sortOrder: isNaN(sortVal) ? nextSort : sortVal,
              copyFromClassId
            }
          });
          if (res && res.ok && res.class) {
            toast(`Kelas "${res.class.name}" berhasil dibuat!`, 'success');
            closeModal();
            await loadClassesAndSubjects();
            state.selectedClassId = res.class.id;
            const avail = getFilteredSubjects();
            if (avail.length > 0) {
              state.selectedSubjectId = avail[0].id;
              await loadQuestions(state.selectedSubjectId);
            } else {
              state.selectedSubjectId = null;
              state.questions = [];
            }
            render();
          }
        } catch (err) {
          toast(err.message || 'Gagal menambahkan kelas', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Simpan Kelas';
          }
        }
      });
      return;
    }

    if (state.modal === 'add-subject') {
      const targetClassId = state.modalData.classId || state.selectedClassId;
      const monsterThemes = [
        { id: 'hutan', label: '🌲 Hutan' },
        { id: 'gua', label: '🪨 Gua' },
        { id: 'api', label: '🔥 Api' },
        { id: 'es', label: '❄️ Es' },
        { id: 'mesin', label: '⚙️ Mesin' },
        { id: 'langit', label: '☁️ Langit' },
        { id: 'rawa', label: '🌿 Rawa' },
        { id: 'hantu', label: '👻 Hantu' },
        { id: 'manis', label: '🍭 Manis' },
      ];
      const quickIcons = ['📚', '📖', '🔬', '➗', '🌿', '🕌', '📜', '🎨', '⚽', '🗣️', '🌙', '⚖️', '🌍', '📐', '🧪'];

      backdrop.innerHTML = `
        <div class="modal" style="width:min(480px, 100%);max-height:90vh;overflow-y:auto">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px">
            <h3 style="margin:0;font-size:1.15rem;color:var(--c-primary)">📚 Tambah Mata Pelajaran Baru</h3>
            <button id="modal-close-btn" style="background:transparent;border:0;color:var(--c-muted);font-size:1.4rem;cursor:pointer">&times;</button>
          </div>

          <form id="form-add-subject" style="display:flex;flex-direction:column;gap:13px;margin-top:14px">
            <div class="field">
              <label for="inp-subj-class">Kelas Tujuan <span style="color:#ef4444">*</span></label>
              <select id="inp-subj-class" style="width:100%;background:rgba(0,0,0,.35);color:var(--c-text);border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:7px 10px;font-size:.85rem">
                ${state.classes.map(c => `
                  <option value="${c.id}" ${c.id === targetClassId ? 'selected' : ''}>${escapeHtml(c.name)}</option>
                `).join('')}
              </select>
            </div>

            <div class="field">
              <label for="inp-subj-name">Nama Mata Pelajaran <span style="color:#ef4444">*</span></label>
              <input type="text" id="inp-subj-name" required placeholder="Contoh: Ilmu Pengetahuan Alam, PJOK, dsb." autocomplete="off">
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div class="field">
                <label for="inp-subj-icon">Icon / Emoji</label>
                <input type="text" id="inp-subj-icon" value="📚" style="text-align:center;font-size:1.2rem">
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">
                  ${quickIcons.map(ic => `
                    <button type="button" class="quick-icon-btn" data-icon="${ic}" style="background:rgba(255,255,255,.08);border:0;border-radius:4px;padding:2px 5px;cursor:pointer;font-size:1rem">${ic}</button>
                  `).join('')}
                </div>
              </div>

              <div class="field">
                <label for="inp-subj-color">Warna Tema</label>
                <div style="display:flex;align-items:center;gap:8px">
                  <input type="color" id="inp-subj-color" value="#3b82f6" style="width:42px;height:38px;padding:0;border:0;border-radius:6px;cursor:pointer;background:transparent">
                  <input type="text" id="inp-subj-color-hex" value="#3b82f6" style="flex:1;font-size:.85rem">
                </div>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div class="field">
                <label for="inp-subj-theme">Tema Monster</label>
                <select id="inp-subj-theme" style="width:100%;background:rgba(0,0,0,.35);color:var(--c-text);border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:7px 10px;font-size:.85rem">
                  ${monsterThemes.map(mt => `
                    <option value="${mt.id}">${mt.label}</option>
                  `).join('')}
                </select>
              </div>

              <div class="field">
                <label for="inp-subj-grade">Tingkat / Grade</label>
                <input type="number" id="inp-subj-grade" value="4" min="1" max="12" step="1">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div class="field">
                <label for="inp-subj-qcount">Soal / Sesi Pertarungan</label>
                <input type="number" id="inp-subj-qcount" value="10" min="5" max="50" step="1">
              </div>

              <div class="field">
                <label for="inp-subj-timelimit">Batas Waktu (Detik)</label>
                <input type="number" id="inp-subj-timelimit" value="20" min="5" max="120" step="1">
              </div>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px">
              <button type="button" id="modal-cancel-btn" class="btn small" style="background:var(--c-surface);color:var(--c-muted);border:0;border-radius:10px;cursor:pointer">Batal</button>
              <button type="submit" id="btn-submit-subject" class="btn small" style="background:var(--c-primary);color:#1c1206;font-weight:800;border:0;border-radius:10px;cursor:pointer">
                Simpan Pelajaran
              </button>
            </div>
          </form>
        </div>
      `;

      document.getElementById('modal-close-btn').addEventListener('click', closeModal);
      document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

      // Quick icons click
      backdrop.querySelectorAll('.quick-icon-btn').forEach(b => {
        b.addEventListener('click', () => {
          document.getElementById('inp-subj-icon').value = b.getAttribute('data-icon');
        });
      });

      // Color sync
      const inpColor = document.getElementById('inp-subj-color');
      const inpColorHex = document.getElementById('inp-subj-color-hex');
      if (inpColor && inpColorHex) {
        inpColor.addEventListener('input', () => { inpColorHex.value = inpColor.value; });
        inpColorHex.addEventListener('input', () => { inpColor.value = inpColorHex.value; });
      }

      // Form submit
      document.getElementById('form-add-subject').addEventListener('submit', async (e) => {
        e.preventDefault();
        const classId = parseInt(document.getElementById('inp-subj-class').value, 10);
        const name = document.getElementById('inp-subj-name').value.trim();
        const icon = document.getElementById('inp-subj-icon').value.trim() || '📚';
        const color = document.getElementById('inp-subj-color-hex').value.trim() || '#3b82f6';
        const monsterTheme = document.getElementById('inp-subj-theme').value || 'hutan';
        const grade = parseInt(document.getElementById('inp-subj-grade').value, 10) || 4;
        const questionCount = parseInt(document.getElementById('inp-subj-qcount').value, 10) || 10;
        const timeLimitSec = parseInt(document.getElementById('inp-subj-timelimit').value, 10) || 20;

        if (!classId) return toast('Pilih kelas tujuan', 'error');
        if (!name) return toast('Nama mata pelajaran tidak boleh kosong', 'error');

        const submitBtn = document.getElementById('btn-submit-subject');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Menyimpan...';
        }

        try {
          const res = await api('/api/admin/subjects', {
            method: 'POST',
            body: {
              classId,
              name,
              icon,
              color,
              monsterTheme,
              grade,
              questionCount,
              timeLimitSec
            }
          });
          if (res && res.ok && res.subject) {
            toast(`Mata pelajaran "${res.subject.name}" berhasil dibuat!`, 'success');
            closeModal();
            await loadClassesAndSubjects();
            state.selectedClassId = res.subject.class_id;
            state.selectedSubjectId = res.subject.id;
            await loadQuestions(state.selectedSubjectId);
            render();
          }
        } catch (err) {
          toast(err.message || 'Gagal menambahkan mata pelajaran', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Simpan Pelajaran';
          }
        }
      });
      return;
    }

    if (state.modal === 'question') {
      const q = state.modalData;
      const isEdit = Boolean(q.id);
      let curType = q.questionType || 'MCQ';

      backdrop.innerHTML = `
        <div class="modal" style="width:min(640px, 100%);max-height:90vh;overflow-y:auto">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px">
            <h3 style="margin:0;font-size:1.15rem;color:var(--c-primary)">${isEdit ? '✏️ Edit Soal' : '➕ Tambah Soal Baru'}</h3>
            <button id="modal-close-btn" style="background:transparent;border:0;color:var(--c-muted);font-size:1.4rem;cursor:pointer">&times;</button>
          </div>

          <form id="form-question" style="display:flex;flex-direction:column;gap:12px;margin-top:8px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div class="field">
                <label for="q-type-select">Tipe Soal <span style="color:var(--c-bad)">*</span></label>
                <select id="q-type-select" style="background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px;color:var(--c-text);font:inherit">
                  <option value="MCQ" ${curType === 'MCQ' ? 'selected' : ''}>Pilihan Ganda (MCQ)</option>
                  <option value="TRUE_FALSE" ${curType === 'TRUE_FALSE' ? 'selected' : ''}>Benar / Salah (TRUE_FALSE)</option>
                  <option value="ORDERING" ${curType === 'ORDERING' ? 'selected' : ''}>Urutkan Kartu (ORDERING)</option>
                  <option value="MATCHING" ${curType === 'MATCHING' ? 'selected' : ''}>Pasangkan Kata (MATCHING)</option>
                  <option value="SHORT" ${curType === 'SHORT' ? 'selected' : ''}>Isian Singkat (SHORT)</option>
                </select>
              </div>

              <div class="field">
                <label for="q-diff">Tingkat Kesulitan</label>
                <select id="q-diff" style="background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px;color:var(--c-text);font:inherit">
                  <option value="1" ${q.difficulty === 1 ? 'selected' : ''}>Tier 1 (Mudah)</option>
                  <option value="2" ${q.difficulty === 2 ? 'selected' : ''}>Tier 2 (Sedang)</option>
                  <option value="3" ${q.difficulty === 3 ? 'selected' : ''}>Tier 3 (Sulit)</option>
                  <option value="4" ${q.difficulty === 4 ? 'selected' : ''}>Tier 4 (Tinggi)</option>
                  <option value="5" ${q.difficulty === 5 ? 'selected' : ''}>Tier 5 (Master)</option>
                </select>
              </div>
            </div>

            <div class="field">
              <label for="q-text">Teks Pertanyaan <span style="color:var(--c-bad)">*</span></label>
              <textarea id="q-text" rows="2" required placeholder="Contoh: Hasil dari 24 + 16 x 2 adalah...">${escapeHtml(q.text)}</textarea>
            </div>

            <!-- Dynamic Slot per Question Type -->
            <div id="type-fields-slot"></div>

            <div class="field">
              <label for="q-subject">Mata Pelajaran</label>
              <select id="q-subject" style="background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px;color:var(--c-text);font:inherit">
                ${getFilteredSubjects().map(s => `
                  <option value="${s.id}" ${s.id === q.subjectId ? 'selected' : ''}>${escapeHtml(s.name)}</option>
                `).join('')}
              </select>
            </div>

            <div class="field">
              <label for="q-explanation">Penjelasan / Pembahasan (Opsional)</label>
              <textarea id="q-explanation" rows="2" placeholder="Muncul saat siswa selesai menjawab untuk evaluasi...">${escapeHtml(q.explanation)}</textarea>
            </div>

            <!-- Live Preview Card -->
            <div style="background:rgba(0,0,0,.25);border:1px dashed rgba(255,255,255,.2);border-radius:10px;padding:10px;margin-top:2px">
              <div style="font-size:.76rem;color:var(--c-muted);font-weight:700;margin-bottom:6px">👁️ Pratinjau Soal Siswa:</div>
              <div id="q-preview-content"></div>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:6px">
              <button type="button" id="modal-cancel-btn" class="btn small" style="background:var(--c-surface);color:var(--c-muted);border:0;border-radius:10px;cursor:pointer">Batal</button>
              <button type="submit" class="btn small" style="background:var(--c-primary);color:#1c1206;font-weight:800;border:0;border-radius:10px;cursor:pointer">
                Simpan Soal
              </button>
            </div>
          </form>
        </div>
      `;

      document.getElementById('modal-close-btn').addEventListener('click', closeModal);
      document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

      const typeSelect = document.getElementById('q-type-select');
      const typeSlot = document.getElementById('type-fields-slot');
      const previewBox = document.getElementById('q-preview-content');

      function renderTypeInputs(t) {
        if (t === 'MCQ') {
          typeSlot.innerHTML = `
            <div class="field">
              <label>Pilihan Jawaban & Kunci Jawaban <span style="color:var(--c-bad)">*</span></label>
              <div style="display:flex;flex-direction:column;gap:8px">
                ${['A', 'B', 'C', 'D'].map((lbl, idx) => `
                  <div style="display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.25);padding:6px 10px;border-radius:10px">
                    <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-weight:700">
                      <input type="radio" name="ans-key" value="${idx}" ${q.answerIndex === idx ? 'checked' : ''} style="cursor:pointer">
                      <span>${lbl}</span>
                    </label>
                    <input type="text" id="q-opt-${idx}" required value="${escapeHtml(q.options[idx] || '')}" placeholder="Pilihan ${lbl}" style="flex:1;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:6px 10px;color:var(--c-text);font:inherit">
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        } else if (t === 'TRUE_FALSE') {
          const isTrue = q.typeData ? (q.typeData.correctAnswer !== false) : (q.answerIndex === 0);
          typeSlot.innerHTML = `
            <div class="field">
              <label>Kunci Jawaban Benar / Salah <span style="color:var(--c-bad)">*</span></label>
              <div style="display:flex;gap:12px">
                <label style="flex:1;display:flex;align-items:center;gap:8px;background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.3);padding:10px;border-radius:10px;cursor:pointer">
                  <input type="radio" name="tf-ans" value="true" ${isTrue ? 'checked' : ''}>
                  <strong style="color:#4ade80">✅ Benar (TRUE)</strong>
                </label>
                <label style="flex:1;display:flex;align-items:center;gap:8px;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);padding:10px;border-radius:10px;cursor:pointer">
                  <input type="radio" name="tf-ans" value="false" ${!isTrue ? 'checked' : ''}>
                  <strong style="color:#f87171">❌ Salah (FALSE)</strong>
                </label>
              </div>
            </div>
          `;
        } else if (t === 'ORDERING') {
          const items = (q.typeData && Array.isArray(q.typeData.items)) ? q.typeData.items : (Array.isArray(q.options) && q.options.length ? q.options : ['Langkah 1', 'Langkah 2', 'Langkah 3', 'Langkah 4']);
          typeSlot.innerHTML = `
            <div class="field">
              <label for="order-items-input">Item Urutan yang Benar (1 per baris, min 2) <span style="color:var(--c-bad)">*</span></label>
              <textarea id="order-items-input" rows="4" placeholder="Tuliskan urutan dari awal hingga akhir..." style="font-family:inherit">${escapeHtml(items.join('\n'))}</textarea>
              <span style="font-size:.76rem;color:var(--c-muted)">Tulis dalam urutan yang BENAR. Saat game dimulai, urutan akan diacak oleh server.</span>
            </div>
          `;
        } else if (t === 'MATCHING') {
          const pairs = (q.typeData && Array.isArray(q.typeData.pairs)) ? q.typeData.pairs : [{ left: 'Kucing', right: 'Mengeong' }, { left: 'Sapi', right: 'Melenguh' }, { left: 'Kambing', right: 'Mengembik' }];
          typeSlot.innerHTML = `
            <div class="field">
              <label for="matching-pairs-input">Pasangan Kiri & Kanan (Format: Kiri = Kanan) <span style="color:var(--c-bad)">*</span></label>
              <textarea id="matching-pairs-input" rows="4" placeholder="Kiri = Kanan" style="font-family:inherit">${escapeHtml(pairs.map(p => p.left + ' = ' + p.right).join('\n'))}</textarea>
              <span style="font-size:.76rem;color:var(--c-muted)">Tulis 1 pasangan per baris dipisahkan tanda sama dengan (=). Sisi kanan akan diacak otomatis.</span>
            </div>
          `;
        } else if (t === 'SHORT') {
          const isNum = Boolean(q.typeData && (q.typeData.isNumeric || q.typeData.numeric));
          const numVal = (q.typeData && q.typeData.numeric && q.typeData.numeric.value) !== undefined ? q.typeData.numeric.value : '';
          const numTol = (q.typeData && q.typeData.numeric && q.typeData.numeric.tolerance) !== undefined ? q.typeData.numeric.tolerance : '0.001';
          const txtAnswers = (q.typeData && Array.isArray(q.typeData.accepted)) ? q.typeData.accepted.join(', ') : '';

          typeSlot.innerHTML = `
            <div class="field">
              <label>Jenis Isian Singkat</label>
              <div style="display:flex;gap:12px;margin-bottom:8px">
                <label style="cursor:pointer;display:flex;align-items:center;gap:4px">
                  <input type="radio" name="short-type" value="numeric" ${isNum ? 'checked' : ''}> Angka (Numerik)
                </label>
                <label style="cursor:pointer;display:flex;align-items:center;gap:4px">
                  <input type="radio" name="short-type" value="text" ${!isNum ? 'checked' : ''}> Teks / Kata
                </label>
              </div>
            </div>

            <div id="short-numeric-fields" style="display:${isNum ? 'grid' : 'none'};grid-template-columns:2fr 1fr;gap:10px">
              <div class="field">
                <label for="short-num-val">Nilai Angka Benar <span style="color:var(--c-bad)">*</span></label>
                <input type="number" step="any" id="short-num-val" value="${escapeHtml(numVal)}" placeholder="Contoh: 1250">
              </div>
              <div class="field">
                <label for="short-num-tol">Toleransi</label>
                <input type="number" step="any" id="short-num-tol" value="${escapeHtml(numTol)}" placeholder="0.001">
              </div>
            </div>

            <div id="short-text-fields" style="display:${!isNum ? 'block' : 'none'}">
              <div class="field">
                <label for="short-txt-ans">Jawaban Diterima (Pisah tanda koma) <span style="color:var(--c-bad)">*</span></label>
                <input type="text" id="short-txt-ans" value="${escapeHtml(txtAnswers)}" placeholder="Contoh: Jakarta, DKI Jakarta">
                <span style="font-size:.76rem;color:var(--c-muted)">Sistem tidak membedakan huruf besar/kecil (case-insensitive) dan spasi ganda.</span>
              </div>
            </div>
          `;

          const radios = typeSlot.querySelectorAll('input[name="short-type"]');
          radios.forEach(r => {
            r.addEventListener('change', (e) => {
              const isN = e.target.value === 'numeric';
              document.getElementById('short-numeric-fields').style.display = isN ? 'grid' : 'none';
              document.getElementById('short-text-fields').style.display = !isN ? 'block' : 'none';
              updatePreview();
            });
          });
        }
        updatePreview();
      }

      function updatePreview() {
        const textVal = document.getElementById('q-text').value.trim() || 'Pertanyaan soal...';
        const t = typeSelect.value;
        let previewHtml = `
          <div style="font-weight:700;color:#fff;margin-bottom:8px">
            <span class="chip info" style="font-size:.7rem;padding:2px 6px;margin-right:6px">${t}</span>
            ${escapeHtml(textVal)}
          </div>
        `;

        if (t === 'MCQ') {
          const opt0 = document.getElementById('q-opt-0')?.value.trim() || 'Opsi A';
          const opt1 = document.getElementById('q-opt-1')?.value.trim() || 'Opsi B';
          const opt2 = document.getElementById('q-opt-2')?.value.trim() || 'Opsi C';
          const opt3 = document.getElementById('q-opt-3')?.value.trim() || 'Opsi D';
          previewHtml += `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
              ${[opt0, opt1, opt2, opt3].map((o, i) => `
                <div style="background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:6px;padding:6px 10px;font-size:.8rem;color:#cbd5e1">
                  <strong>${['A', 'B', 'C', 'D'][i]}.</strong> ${escapeHtml(o)}
                </div>
              `).join('')}
            </div>
          `;
        } else if (t === 'TRUE_FALSE') {
          previewHtml += `
            <div style="display:flex;gap:8px">
              <button type="button" class="btn small" style="flex:1;background:rgba(34,197,94,.2);color:#4ade80;border:1px solid rgba(34,197,94,.4);border-radius:8px">✅ BENAR</button>
              <button type="button" class="btn small" style="flex:1;background:rgba(239,68,68,.2);color:#f87171;border:1px solid rgba(239,68,68,.4);border-radius:8px">❌ SALAH</button>
            </div>
          `;
        } else if (t === 'ORDERING') {
          const raw = document.getElementById('order-items-input')?.value || '';
          const items = raw.split('\n').map(s => s.trim()).filter(Boolean);
          previewHtml += `
            <div style="display:flex;flex-direction:column;gap:4px">
              ${items.map((it, i) => `
                <div style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:6px;padding:4px 8px;font-size:.8rem;color:#cbd5e1">
                  <span style="font-weight:800;color:var(--c-primary)">#</span> ${escapeHtml(it)}
                </div>
              `).join('')}
            </div>
          `;
        } else if (t === 'MATCHING') {
          const raw = document.getElementById('matching-pairs-input')?.value || '';
          const lines = raw.split('\n').map(s => s.trim()).filter(Boolean);
          previewHtml += `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:.8rem">
              ${lines.map(l => {
                const parts = l.split('=');
                return `
                  <div style="background:rgba(255,255,255,.08);padding:4px 8px;border-radius:6px">${escapeHtml(parts[0] || '').trim()}</div>
                  <div style="background:rgba(255,255,255,.08);padding:4px 8px;border-radius:6px">${escapeHtml(parts[1] || '').trim()}</div>
                `;
              }).join('')}
            </div>
          `;
        } else if (t === 'SHORT') {
          const isNum = document.querySelector('input[name="short-type"]:checked')?.value === 'numeric';
          previewHtml += `
            <div style="display:flex;gap:6px">
              <input type="text" disabled placeholder="${isNum ? 'Ketik angka jawaban...' : 'Ketik kata jawaban...'}" style="flex:1;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:6px 10px;font-size:.8rem">
              <button type="button" class="btn small primary" disabled style="border-radius:8px;font-weight:700">Kirim</button>
            </div>
          `;
        }

        previewBox.innerHTML = previewHtml;
      }

      typeSelect.addEventListener('change', () => {
        renderTypeInputs(typeSelect.value);
      });

      document.getElementById('q-text').addEventListener('input', updatePreview);
      typeSlot.addEventListener('input', updatePreview);

      // Initial render
      renderTypeInputs(curType);

      // Handle submit
      document.getElementById('form-question').addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('q-text').value.trim();
        const diff = parseInt(document.getElementById('q-diff').value, 10);
        const subjId = parseInt(document.getElementById('q-subject').value, 10);
        const expl = document.getElementById('q-explanation').value.trim();
        const qType = typeSelect.value;

        if (!text) return toast('Teks pertanyaan wajib diisi', 'error');

        let payload = {
          id: q.id,
          subjectId: subjId,
          text,
          difficulty: diff,
          explanation: expl,
          question_type: qType,
        };

        if (qType === 'MCQ') {
          const opt0 = document.getElementById('q-opt-0').value.trim();
          const opt1 = document.getElementById('q-opt-1').value.trim();
          const opt2 = document.getElementById('q-opt-2').value.trim();
          const opt3 = document.getElementById('q-opt-3').value.trim();
          const checkedRadio = document.querySelector('input[name="ans-key"]:checked');
          const ansIdx = checkedRadio ? parseInt(checkedRadio.value, 10) : 0;
          if (!opt0 || !opt1 || !opt2 || !opt3) {
            return toast('Semua 4 pilihan jawaban wajib diisi', 'error');
          }
          payload.options = [opt0, opt1, opt2, opt3];
          payload.answerIndex = ansIdx;
          payload.typeData = { options: [opt0, opt1, opt2, opt3] };
        } else if (qType === 'TRUE_FALSE') {
          const checkedTf = document.querySelector('input[name="tf-ans"]:checked');
          const isTrue = checkedTf ? (checkedTf.value === 'true') : true;
          payload.options = ['Benar', 'Salah'];
          payload.answerIndex = isTrue ? 0 : 1;
          payload.typeData = { correctAnswer: isTrue, options: ['Benar', 'Salah'] };
        } else if (qType === 'ORDERING') {
          const raw = document.getElementById('order-items-input').value;
          const items = raw.split('\n').map(s => s.trim()).filter(Boolean);
          if (items.length < 2) {
            return toast('Minimal harus mengisi 2 item untuk soal urutan', 'error');
          }
          payload.options = items;
          payload.answerIndex = 0;
          payload.typeData = { items };
        } else if (qType === 'MATCHING') {
          const raw = document.getElementById('matching-pairs-input').value;
          const lines = raw.split('\n').map(s => s.trim()).filter(Boolean);
          const pairs = [];
          for (const l of lines) {
            const parts = l.split('=');
            if (parts.length >= 2 && parts[0].trim() && parts[1].trim()) {
              pairs.push({ left: parts[0].trim(), right: parts[1].trim() });
            }
          }
          if (pairs.length < 2) {
            return toast('Minimal harus mengisi 2 pasang kata dengan format Kiri = Kanan', 'error');
          }
          payload.options = pairs.map(p => p.left);
          payload.answerIndex = 0;
          payload.typeData = { pairs };
        } else if (qType === 'SHORT') {
          const isNum = document.querySelector('input[name="short-type"]:checked')?.value === 'numeric';
          if (isNum) {
            const valStr = document.getElementById('short-num-val').value.trim();
            const tolStr = document.getElementById('short-num-tol').value.trim();
            if (!valStr || isNaN(parseFloat(valStr))) {
              return toast('Harap masukkan angka jawaban yang valid', 'error');
            }
            const numericVal = parseFloat(valStr);
            const tolerance = tolStr ? parseFloat(tolStr) : 0.001;
            payload.options = [];
            payload.answerIndex = 0;
            payload.typeData = {
              isNumeric: true,
              numeric: { value: numericVal, tolerance }
            };
          } else {
            const txtStr = document.getElementById('short-txt-ans').value.trim();
            const answers = txtStr.split(',').map(s => s.trim()).filter(Boolean);
            if (answers.length === 0) {
              return toast('Harap masukkan minimal 1 kata jawaban yang diterima', 'error');
            }
            payload.options = [];
            payload.answerIndex = 0;
            payload.typeData = {
              isNumeric: false,
              accepted: answers
            };
          }
        }

        saveQuestion(payload);
      });
    }

    if (state.modal === 'import') {
      const curSubj = state.subjects.find(s => s.id === state.modalData.subjectId);
      backdrop.innerHTML = `
        <div class="modal" style="width:min(720px, 100%);max-height:92vh;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding:20px">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:1.4rem">📥</span>
              <div>
                <h3 style="margin:0;font-size:1.15rem;color:var(--c-primary)">Import Bank Soal JSON</h3>
                <div style="font-size:.78rem;color:var(--c-muted)">Target Mapel: <strong style="color:var(--c-text)">${curSubj ? escapeHtml(curSubj.name) : '-'}</strong></div>
              </div>
            </div>
            <button id="modal-close-btn" style="background:transparent;border:0;color:var(--c-muted);font-size:1.4rem;cursor:pointer">&times;</button>
          </div>

          <!-- Petunjuk & Tombol Template Cepat -->
          <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px 14px">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px">
              <strong style="color:var(--c-primary);font-size:.85rem">💡 Panduan Format & Contoh Soal:</strong>
              <div style="display:flex;gap:6px">
                <button type="button" id="btn-use-sample-json" class="btn small" style="background:rgba(56,189,248,.18);color:#38bdf8;border:0;border-radius:8px;padding:4px 10px;cursor:pointer;font-weight:700">
                  📋 Isi Contoh ke Kotak
                </button>
                <button type="button" id="btn-dl-template-json" class="btn small" style="background:rgba(245,158,11,.18);color:#fbbf24;border:0;border-radius:8px;padding:4px 10px;cursor:pointer;font-weight:700">
                  📥 Unduh File .json
                </button>
              </div>
            </div>
            <div style="font-size:.8rem;color:var(--c-muted);line-height:1.4">
              Pilih tab di bawah untuk melihat struktur JSON tiap tipe soal (MCQ, Benar/Salah, Mengurutkan, Menjodohkan, Isian Singkat):
            </div>

            <!-- Mini Tabs Contoh Tipe Soal -->
            <div style="display:flex;gap:4px;margin-top:8px;overflow-x:auto;padding-bottom:4px" id="sample-tabs">
              <button type="button" class="btn-sample-tab active" data-type="MCQ" style="background:var(--c-surface-strong);color:var(--c-primary);border:1px solid var(--c-primary);border-radius:6px;padding:4px 8px;font-size:.76rem;cursor:pointer;font-weight:700">Pilihan Ganda (MCQ)</button>
              <button type="button" class="btn-sample-tab" data-type="TRUE_FALSE" style="background:var(--c-surface);color:var(--c-muted);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:4px 8px;font-size:.76rem;cursor:pointer">Benar / Salah</button>
              <button type="button" class="btn-sample-tab" data-type="ORDERING" style="background:var(--c-surface);color:var(--c-muted);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:4px 8px;font-size:.76rem;cursor:pointer">Mengurutkan</button>
              <button type="button" class="btn-sample-tab" data-type="MATCHING" style="background:var(--c-surface);color:var(--c-muted);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:4px 8px;font-size:.76rem;cursor:pointer">Menjodohkan</button>
              <button type="button" class="btn-sample-tab" data-type="SHORT" style="background:var(--c-surface);color:var(--c-muted);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:4px 8px;font-size:.76rem;cursor:pointer">Isian Singkat</button>
            </div>

            <!-- Box Preview Code Contoh -->
            <div style="position:relative;margin-top:6px">
              <pre id="sample-code-box" style="background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:10px 12px;font-family:monospace;font-size:.76rem;color:#e2e8f0;margin:0;max-height:130px;overflow-y:auto;white-space:pre-wrap"></pre>
            </div>
          </div>

          <!-- Input File & Textarea -->
          <div style="display:flex;flex-direction:column;gap:12px">
            <div class="field">
              <label>1. Pilih File .json dari Komputer</label>
              <input type="file" id="inp-import-file" accept=".json,application/json" style="background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px;color:var(--c-text)">
            </div>

            <div class="field">
              <label for="txt-import-json">2. Atau Tempel (Paste) Konten JSON di Sini</label>
              <textarea id="txt-import-json" rows="6" placeholder='Tempel kode JSON di sini atau klik tombol "Isi Contoh ke Kotak" di atas...' style="font-family:monospace;font-size:.8rem;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:10px;color:var(--c-text)"></textarea>
            </div>

            <div id="import-preview-box" style="display:none;padding:10px;border-radius:10px;font-size:.84rem"></div>

            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:4px">
              <button type="button" id="modal-cancel-btn" class="btn small" style="background:var(--c-surface);color:var(--c-muted);border:0;border-radius:10px;cursor:pointer">Batal</button>
              <button type="button" id="btn-submit-import" class="btn small" style="background:var(--c-good);color:#052e16;font-weight:800;border:0;border-radius:10px;cursor:pointer">
                Mulai Import Soal
              </button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('modal-close-btn').addEventListener('click', closeModal);
      document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

      const fileInp = document.getElementById('inp-import-file');
      const txtInp = document.getElementById('txt-import-json');
      const prevBox = document.getElementById('import-preview-box');
      const sampleCodeBox = document.getElementById('sample-code-box');

      const SAMPLE_SNIPPETS = {
        MCQ: `[
  {
    "text": "Berapakah hasil dari 25 + 15?",
    "type": "MCQ",
    "options": ["30", "35", "40", "45"],
    "answerIndex": 2,
    "explanation": "25 + 15 = 40. Pilihan C benar.",
    "difficulty": 1
  }
]`,
        TRUE_FALSE: `[
  {
    "text": "Matahari terbit dari arah timur.",
    "type": "TRUE_FALSE",
    "typeData": { "correctAnswer": true },
    "explanation": "Matahari selalu terbit dari arah timur.",
    "difficulty": 1
  }
]`,
        ORDERING: `[
  {
    "text": "Urutkan tahapan metamorfosis kupu-kupu dari awal:",
    "type": "ORDERING",
    "typeData": {
      "items": ["Telur", "Ulat (Larva)", "Kepompong (Pupa)", "Kupu-kupu Dewasa"]
    },
    "explanation": "Metamorfosis: Telur -> Ulat -> Kepompong -> Kupu-kupu.",
    "difficulty": 2
  }
]`,
        MATCHING: `[
  {
    "text": "Jodohkan nama hewan dengan jenis makanannya:",
    "type": "MATCHING",
    "typeData": {
      "pairs": [
        { "left": "Sapi", "right": "Rumput" },
        { "left": "Harimau", "right": "Daging" },
        { "left": "Ayam", "right": "Biji-bijian" }
      ]
    },
    "explanation": "Sapi herbivora, harimau karnivora, ayam omnivora.",
    "difficulty": 2
  }
]`,
        SHORT: `[
  {
    "text": "Ibu kota negara Indonesia saat ini adalah ...",
    "type": "SHORT",
    "typeData": {
      "isNumeric": false,
      "accepted": ["Jakarta", "DKI Jakarta"]
    },
    "explanation": "Ibu kota Indonesia adalah Jakarta.",
    "difficulty": 1
  },
  {
    "text": "Berapakah nilai dari 12 x 8?",
    "type": "SHORT",
    "typeData": {
      "isNumeric": true,
      "numeric": { "value": 96, "tolerance": 0.01 }
    },
    "explanation": "12 x 8 = 96.",
    "difficulty": 1
  }
]`
      };

      const FULL_SAMPLE_JSON = JSON.stringify([
        {
          "text": "Berapakah hasil dari 25 + 15?",
          "type": "MCQ",
          "options": ["30", "35", "40", "45"],
          "answerIndex": 2,
          "explanation": "25 + 15 = 40. Pilihan C benar.",
          "difficulty": 1
        },
        {
          "text": "Matahari terbit dari arah timur.",
          "type": "TRUE_FALSE",
          "typeData": { "correctAnswer": true },
          "explanation": "Matahari selalu terbit dari arah timur.",
          "difficulty": 1
        },
        {
          "text": "Urutkan tahapan metamorfosis kupu-kupu dari awal:",
          "type": "ORDERING",
          "typeData": {
            "items": ["Telur", "Ulat (Larva)", "Kepompong (Pupa)", "Kupu-kupu Dewasa"]
          },
          "explanation": "Metamorfosis: Telur -> Ulat -> Kepompong -> Kupu-kupu.",
          "difficulty": 2
        },
        {
          "text": "Jodohkan nama hewan dengan jenis makanannya:",
          "type": "MATCHING",
          "typeData": {
            "pairs": [
              { "left": "Sapi", "right": "Rumput" },
              { "left": "Harimau", "right": "Daging" },
              { "left": "Ayam", "right": "Biji-bijian" }
            ]
          },
          "explanation": "Sapi herbivora, harimau karnivora, ayam omnivora.",
          "difficulty": 2
        },
        {
          "text": "Ibu kota negara Indonesia saat ini adalah ...",
          "type": "SHORT",
          "typeData": {
            "isNumeric": false,
            "accepted": ["Jakarta", "DKI Jakarta"]
          },
          "explanation": "Ibu kota Indonesia adalah Jakarta.",
          "difficulty": 1
        }
      ], null, 2);

      // Display default sample
      sampleCodeBox.textContent = SAMPLE_SNIPPETS.MCQ;

      // Handle sample tabs
      document.querySelectorAll('.btn-sample-tab').forEach(tabBtn => {
        tabBtn.addEventListener('click', () => {
          document.querySelectorAll('.btn-sample-tab').forEach(b => {
            b.classList.remove('active');
            b.style.background = 'var(--c-surface)';
            b.style.color = 'var(--c-muted)';
            b.style.borderColor = 'rgba(255,255,255,.1)';
            b.style.fontWeight = 'normal';
          });
          tabBtn.classList.add('active');
          tabBtn.style.background = 'var(--c-surface-strong)';
          tabBtn.style.color = 'var(--c-primary)';
          tabBtn.style.borderColor = 'var(--c-primary)';
          tabBtn.style.fontWeight = '700';

          const qType = tabBtn.getAttribute('data-type');
          sampleCodeBox.textContent = SAMPLE_SNIPPETS[qType] || '';
        });
      });

      // Quick Fill Sample
      document.getElementById('btn-use-sample-json').addEventListener('click', () => {
        txtInp.value = FULL_SAMPLE_JSON;
        parseRaw(FULL_SAMPLE_JSON);
        toast('Contoh format 5 tipe soal berhasil dimasukkan!', 'success');
      });

      // Download Template
      document.getElementById('btn-dl-template-json').addEventListener('click', () => {
        const blob = new Blob([FULL_SAMPLE_JSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template-bank-soal-5-tipe.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast('File template template-bank-soal-5-tipe.json berhasil diunduh', 'success');
      });

      function validateQuestionItem(qItem, rowNum) {
        if (!qItem || typeof qItem !== 'object') {
          return { valid: false, error: `Baris ${rowNum}: Format objek soal tidak valid` };
        }
        if (!qItem.text || typeof qItem.text !== 'string' || !qItem.text.trim()) {
          return { valid: false, error: `Baris ${rowNum}: Teks pertanyaan wajib diisi` };
        }
        const qType = (qItem.type || qItem.question_type || qItem.questionType || 'MCQ').toUpperCase();
        if (!['MCQ', 'TRUE_FALSE', 'ORDERING', 'MATCHING', 'SHORT'].includes(qType)) {
          return { valid: false, error: `Baris ${rowNum}: Tipe '${qType}' tidak dikenal` };
        }
        if (qType === 'MCQ') {
          const opts = qItem.options || (qItem.typeData && qItem.typeData.options);
          if (!Array.isArray(opts) || opts.length < 2) {
            return { valid: false, error: `Baris ${rowNum} [MCQ]: Membutuhkan minimal 2 pilihan opsi` };
          }
        } else if (qType === 'TRUE_FALSE') {
          const ca = qItem.correctAnswer ?? (qItem.typeData && qItem.typeData.correctAnswer);
          if (ca === undefined && qItem.answer_index === undefined && qItem.answerIndex === undefined) {
            return { valid: false, error: `Baris ${rowNum} [TRUE_FALSE]: Kunci jawaban (correctAnswer) tidak ditentukan` };
          }
        } else if (qType === 'ORDERING') {
          const items = qItem.items || (qItem.typeData && qItem.typeData.items);
          if (!Array.isArray(items) || items.length < 2) {
            return { valid: false, error: `Baris ${rowNum} [ORDERING]: Membutuhkan minimal 2 item urutan` };
          }
        } else if (qType === 'MATCHING') {
          const pairs = qItem.pairs || (qItem.typeData && qItem.typeData.pairs);
          if (!Array.isArray(pairs) || pairs.length < 2) {
            return { valid: false, error: `Baris ${rowNum} [MATCHING]: Membutuhkan minimal 2 pasangan (left & right)` };
          }
        } else if (qType === 'SHORT') {
          const hasNum = qItem.numeric || (qItem.typeData && qItem.typeData.numeric);
          const hasAns = qItem.answers || qItem.accepted || (qItem.typeData && (qItem.typeData.answers || qItem.typeData.accepted));
          if (!hasNum && !hasAns) {
            return { valid: false, error: `Baris ${rowNum} [SHORT]: Membutuhkan jawaban numerik atau daftar kata yang diterima` };
          }
        }
        return { valid: true };
      }

      function parseRaw(rawStr) {
        try {
          const parsed = JSON.parse(rawStr);
          let rawList = [];
          if (Array.isArray(parsed)) rawList = parsed;
          else if (parsed && Array.isArray(parsed.questions)) rawList = parsed.questions;
          else if (parsed && Array.isArray(parsed.data)) rawList = parsed.data;

          const validQuestions = [];
          const errorReports = [];

          rawList.forEach((item, idx) => {
            const check = validateQuestionItem(item, idx + 1);
            if (check.valid) {
              validQuestions.push(item);
            } else {
              errorReports.push(check.error);
            }
          });

          prevBox.style.display = 'block';
          if (errorReports.length === 0) {
            prevBox.style.color = '#86efac';
            prevBox.style.borderColor = 'rgba(34,197,94,.3)';
            prevBox.style.background = 'rgba(34,197,94,.1)';
            prevBox.innerHTML = `✓ Ditemukan <strong>${validQuestions.length}</strong> soal valid siap di-import.`;
          } else {
            prevBox.style.color = '#fca5a5';
            prevBox.style.borderColor = 'rgba(239,68,68,.3)';
            prevBox.style.background = 'rgba(239,68,68,.1)';
            prevBox.innerHTML = `
              <div>⚠️ Ditemukan <strong>${validQuestions.length}</strong> soal valid, dan <strong>${errorReports.length}</strong> baris bermasalah:</div>
              <div style="max-height:90px;overflow-y:auto;margin-top:6px;font-size:.78rem;line-height:1.4">
                ${errorReports.map(err => `<div>• ${escapeHtml(err)}</div>`).join('')}
              </div>
            `;
          }
          return validQuestions;
        } catch (e) {
          prevBox.style.display = 'block';
          prevBox.style.color = '#fca5a5';
          prevBox.style.borderColor = 'rgba(239,68,68,.3)';
          prevBox.style.background = 'rgba(239,68,68,.1)';
          prevBox.textContent = `Format JSON tidak valid: ${e.message}`;
          return [];
        }
      }

      fileInp.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          txtInp.value = evt.target.result;
          parseRaw(evt.target.result);
        };
        reader.readAsText(file);
      });

      txtInp.addEventListener('input', () => {
        if (txtInp.value.trim()) parseRaw(txtInp.value);
        else prevBox.style.display = 'none';
      });

      document.getElementById('btn-submit-import').addEventListener('click', () => {
        const raw = txtInp.value.trim();
        if (!raw) return toast('Harap pilih file atau tempel JSON', 'error');
        const qList = parseRaw(raw);
        if (qList.length === 0) return toast('Tidak ada soal valid dalam JSON', 'error');
        importQuestions(state.modalData.subjectId, qList);
      });
    }

    if (state.modal === 'reset-pw') {
      const p = state.modalData;
      backdrop.innerHTML = `
        <div class="modal" style="width:min(420px, 100%)">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px">
            <h3 style="margin:0;font-size:1.15rem;color:var(--c-primary)">🔑 Reset Kata Sandi Siswa</h3>
            <button id="modal-close-btn" style="background:transparent;border:0;color:var(--c-muted);font-size:1.4rem;cursor:pointer">&times;</button>
          </div>

          <div style="font-size:.9rem;color:var(--c-muted);margin:8px 0">
            Siswa: <strong style="color:var(--c-text)">${escapeHtml(p.nick)}</strong> (ID #${p.playerId})
          </div>

          <form id="form-reset-pw" style="display:flex;flex-direction:column;gap:12px">
            <div class="field">
              <label for="inp-new-pw">Kata Sandi Baru (Minimal 4 Karakter)</label>
              <input type="text" id="inp-new-pw" required minlength="4" value="siswa123" placeholder="Masukkan password baru">
              <span style="font-size:.76rem;color:var(--c-muted)">Berikan kata sandi ini kepada siswa agar dapat login kembali.</span>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:6px">
              <button type="button" id="modal-cancel-btn" class="btn small" style="background:var(--c-surface);color:var(--c-muted);border:0;border-radius:10px;cursor:pointer">Batal</button>
              <button type="submit" class="btn small" style="background:var(--c-primary);color:#1c1206;font-weight:800;border:0;border-radius:10px;cursor:pointer">
                Simpan Kata Sandi
              </button>
            </div>
          </form>
        </div>
      `;

      document.getElementById('modal-close-btn').addEventListener('click', closeModal);
      document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

      document.getElementById('form-reset-pw').addEventListener('submit', (e) => {
        e.preventDefault();
        const newPw = document.getElementById('inp-new-pw').value.trim();
        if (newPw.length < 4) return toast('Kata sandi minimal 4 karakter', 'error');
        resetPlayerPassword(p.playerId, newPw);
      });
    }
  }

  if (window.location.pathname === '/admin/laporan') {
    state.activeTab = 'reports';
  }
  // Initialize
  checkAuth();
})();
