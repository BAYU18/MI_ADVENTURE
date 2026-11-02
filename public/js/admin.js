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

  /* ── API Client ── */
  async function api(path, options = {}) {
    const opts = {
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        ...(options.headers || {}),
      },
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
        state.admin = null;
        render();
        throw new Error('Sesi admin berakhir. Silakan login kembali.');
      }
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
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
        state.admin = null;
      }
    } catch (e) {
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
    state.admin = null;
    state.modal = null;
    toast('Berhasil keluar dari admin');
    render();
  }

  async function loadOverview() {
    try {
      const res = await api('/api/admin/overview');
      if (res.ok) {
        state.overview = res.overview;
      }
    } catch (err) {
      console.error('[overview error]', err);
    }
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
      const res = await api('/api/admin/question', {
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

  async function exportQuestions() {
    if (!state.selectedSubjectId) {
      toast('Pilih mata pelajaran terlebih dahulu', 'error');
      return;
    }
    try {
      const res = await api(`/api/admin/export?subjectId=${state.selectedSubjectId}`);
      if (res.ok) {
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
        toast(`Berhasil mengekspor ${res.totalQuestions || 0} soal`, 'success');
      }
    } catch (err) {
      toast('Gagal ekspor: ' + err.message, 'error');
    }
  }

  async function importQuestions(subjectId, questionsList) {
    try {
      const res = await api('/api/admin/import', {
        method: 'POST',
        body: {
          subjectId,
          questions: questionsList,
        },
      });
      if (res.ok) {
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
              <input type="password" id="adm-pass" required autocomplete="current-password" placeholder="Masukkan password admin" value="admin12345">
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

      <!-- Navigation Tabs -->
      <div class="adm-tabs" style="margin-top:4px">
        <button type="button" class="${curTab === 'overview' ? 'active' : ''}" data-tab="overview">📊 Ringkasan</button>
        <button type="button" class="${curTab === 'questions' ? 'active' : ''}" data-tab="questions">📚 Bank Soal</button>
        <button type="button" class="${curTab === 'players' ? 'active' : ''}" data-tab="players">👥 Siswa & Kata Sandi</button>
      </div>

      <!-- Tab Content Area -->
      <div id="tab-content" style="display:flex;flex-direction:column;gap:16px">
        ${curTab === 'overview' ? renderOverviewContent() : ''}
        ${curTab === 'questions' ? renderQuestionsContent() : ''}
        ${curTab === 'players' ? renderPlayersContent() : ''}
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
      <!-- Stats Cards -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="lbl">Total Siswa Terdaftar</div>
          <div class="val">👥 ${ov.totalPlayers || 0}</div>
        </div>
        <div class="stat-card">
          <div class="lbl">Total Bank Soal Aktif</div>
          <div class="val">📚 ${ov.totalQuestions || 0}</div>
        </div>
        <div class="stat-card">
          <div class="lbl">Total Sesi Battle</div>
          <div class="val">⚔️ ${ov.totalSessions || 0}</div>
        </div>
        <div class="stat-card">
          <div class="lbl">Rata-rata Akurasi Jawaban</div>
          <div class="val">🎯 ${ov.accuracyPct || 0}%</div>
        </div>
      </div>

      <!-- Quick Action Guide -->
      <div style="background:var(--c-surface);border:1px solid var(--c-surface-strong);border-radius:var(--radius);padding:20px;display:flex;flex-direction:column;gap:12px">
        <h3 style="margin:0;font-size:1.1rem;color:var(--c-primary)">📖 Panduan Penggunaan Portal Guru</h3>
        <p style="margin:0;color:var(--c-muted);font-size:.9rem;line-height:1.5">
          Selamat datang di panel kontrol edukasi. Anda dapat mengelola materi pembelajaran, menyusun dan mengimpor bank soal, serta membantu siswa yang mengalami kendala login.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:12px;margin-top:6px">
          <div style="background:rgba(0,0,0,.25);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,.05)">
            <strong style="color:#fbbf24;display:block;margin-bottom:4px">1. Kelola Bank Soal</strong>
            <span style="font-size:.84rem;color:var(--c-muted)">Buka tab <strong>Bank Soal</strong> untuk menambah atau mengedit pertanyaan kuis berdasarkan mata pelajaran dan kelas siswa.</span>
          </div>
          <div style="background:rgba(0,0,0,.25);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,.05)">
            <strong style="color:#38bdf8;display:block;margin-bottom:4px">2. Import & Export JSON</strong>
            <span style="font-size:.84rem;color:var(--c-muted)">Gunakan fitur import JSON untuk memasukkan puluhan soal sekaligus dari format standar kuis kurikulum merdeka.</span>
          </div>
          <div style="background:rgba(0,0,0,.25);padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,.05)">
            <strong style="color:#4ade80;display:block;margin-bottom:4px">3. Reset Sandi Siswa</strong>
            <span style="font-size:.84rem;color:var(--c-muted)">Jika siswa lupa kata sandi akunnya, buka tab <strong>Siswa & Kata Sandi</strong> lalu klik tombol kunci untuk mengatur sandi baru instan.</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderQuestionsContent() {
    const curSubjects = getFilteredSubjects();
    const curSubject = state.subjects.find(s => s.id === state.selectedSubjectId);

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

      <!-- Question List Table -->
      <div class="table-wrap">
        <table class="adm-table">
          <thead>
            <tr>
              <th style="width:48px;text-align:center">#</th>
              <th>Pertanyaan</th>
              <th style="width:280px">Pilihan Jawaban (A/B/C/D)</th>
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
              const opts = Array.isArray(q.options) ? q.options : [];
              const ansIdx = q.answer_index !== undefined ? q.answer_index : 0;
              const diffLabels = { 1: 'Mudah', 2: 'Sedang', 3: 'Sulit', 4: 'Tinggi', 5: 'Master' };
              const diffColors = { 1: 'green', 2: 'blue', 3: 'yellow', 4: 'red', 5: 'red' };
              const diff = q.difficulty || 1;

              return `
                <tr>
                  <td style="text-align:center;color:var(--c-muted);font-weight:700">${idx + 1}</td>
                  <td>
                    <div style="font-weight:700;color:var(--c-text);margin-bottom:4px">${escapeHtml(q.text)}</div>
                    ${q.explanation ? `<div style="font-size:.78rem;color:var(--c-muted)"><em>💡 ${escapeHtml(q.explanation)}</em></div>` : ''}
                  </td>
                  <td>
                    <div style="display:flex;flex-direction:column;gap:2px;font-size:.8rem">
                      ${opts.map((opt, oIdx) => `
                        <div style="display:flex;align-items:center;gap:6px;${oIdx === ansIdx ? 'color:#4ade80;font-weight:700' : 'color:var(--c-muted)'}">
                          <span>${['A', 'B', 'C', 'D'][oIdx] || oIdx + 1}.</span>
                          <span>${escapeHtml(opt)}</span>
                          ${oIdx === ansIdx ? '<span style="font-size:.7rem">✓ (Kunci)</span>' : ''}
                        </div>
                      `).join('')}
                    </div>
                  </td>
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

  function attachTabListeners() {
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
    state.modal = 'question';
    state.modalData = question ? {
      id: question.id,
      subjectId: question.subject_id || state.selectedSubjectId,
      text: question.text || '',
      options: Array.isArray(question.options) ? [...question.options] : ['', '', '', ''],
      answerIndex: question.answer_index !== undefined ? question.answer_index : 0,
      explanation: question.explanation || '',
      difficulty: question.difficulty || 1,
    } : {
      id: null,
      subjectId: state.selectedSubjectId,
      text: '',
      options: ['', '', '', ''],
      answerIndex: 0,
      explanation: '',
      difficulty: 1,
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

    if (state.modal === 'question') {
      const q = state.modalData;
      const isEdit = Boolean(q.id);
      backdrop.innerHTML = `
        <div class="modal" style="width:min(580px, 100%)">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px">
            <h3 style="margin:0;font-size:1.15rem;color:var(--c-primary)">${isEdit ? '✏️ Edit Soal' : '➕ Tambah Soal Baru'}</h3>
            <button id="modal-close-btn" style="background:transparent;border:0;color:var(--c-muted);font-size:1.4rem;cursor:pointer">&times;</button>
          </div>

          <form id="form-question" style="display:flex;flex-direction:column;gap:12px;margin-top:6px">
            <div class="field">
              <label for="q-text">Teks Pertanyaan <span style="color:var(--c-bad)">*</span></label>
              <textarea id="q-text" rows="3" required placeholder="Contoh: Hasil dari 24 + 16 x 2 adalah...">${escapeHtml(q.text)}</textarea>
            </div>

            <div class="field">
              <label>Pilihan Jawaban & Tentukan Kunci Jawaban <span style="color:var(--c-bad)">*</span></label>
              <div style="display:flex;flex-direction:column;gap:8px">
                ${['A', 'B', 'C', 'D'].map((label, idx) => `
                  <div style="display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.25);padding:6px 10px;border-radius:10px">
                    <label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-weight:700;color:${q.answerIndex === idx ? '#4ade80' : 'var(--c-muted)'}">
                      <input type="radio" name="ans-key" value="${idx}" ${q.answerIndex === idx ? 'checked' : ''} style="cursor:pointer">
                      <span>${label}</span>
                    </label>
                    <input type="text" id="q-opt-${idx}" required value="${escapeHtml(q.options[idx] || '')}" placeholder="Pilihan ${label}" style="flex:1;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:6px 10px;color:var(--c-text);font:inherit">
                  </div>
                `).join('')}
              </div>
              <span style="font-size:.76rem;color:var(--c-muted);margin-top:2px">Pilih radio button pada pilihan yang merupakan jawaban benar.</span>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
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

              <div class="field">
                <label for="q-subject">Mata Pelajaran</label>
                <select id="q-subject" style="background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px;color:var(--c-text);font:inherit">
                  ${getFilteredSubjects().map(s => `
                    <option value="${s.id}" ${s.id === q.subjectId ? 'selected' : ''}>${escapeHtml(s.name)}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="field">
              <label for="q-explanation">Penjelasan / Pembahasan (Opsional)</label>
              <textarea id="q-explanation" rows="2" placeholder="Muncul saat siswa selesai menjawab untuk sesi evaluasi...">${escapeHtml(q.explanation)}</textarea>
            </div>

            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px">
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

      document.getElementById('form-question').addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('q-text').value.trim();
        const opt0 = document.getElementById('q-opt-0').value.trim();
        const opt1 = document.getElementById('q-opt-1').value.trim();
        const opt2 = document.getElementById('q-opt-2').value.trim();
        const opt3 = document.getElementById('q-opt-3').value.trim();
        const checkedRadio = document.querySelector('input[name="ans-key"]:checked');
        const ansIdx = checkedRadio ? parseInt(checkedRadio.value, 10) : 0;
        const diff = parseInt(document.getElementById('q-diff').value, 10);
        const subjId = parseInt(document.getElementById('q-subject').value, 10);
        const expl = document.getElementById('q-explanation').value.trim();

        if (!text) return toast('Teks pertanyaan wajib diisi', 'error');
        if (!opt0 || !opt1 || !opt2 || !opt3) {
          return toast('Semua pilihan jawaban (A, B, C, D) wajib diisi', 'error');
        }

        saveQuestion({
          id: q.id,
          subjectId: subjId,
          text,
          options: [opt0, opt1, opt2, opt3],
          answerIndex: ansIdx,
          difficulty: diff,
          explanation: expl,
        });
      });
    }

    if (state.modal === 'import') {
      const curSubj = state.subjects.find(s => s.id === state.modalData.subjectId);
      backdrop.innerHTML = `
        <div class="modal" style="width:min(580px, 100%)">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px">
            <h3 style="margin:0;font-size:1.15rem;color:var(--c-primary)">📥 Import Bank Soal JSON</h3>
            <button id="modal-close-btn" style="background:transparent;border:0;color:var(--c-muted);font-size:1.4rem;cursor:pointer">&times;</button>
          </div>

          <div style="font-size:.85rem;color:var(--c-muted);margin:8px 0">
            Target Mapel: <strong style="color:var(--c-text)">${curSubj ? escapeHtml(curSubj.name) : '-'}</strong>
          </div>

          <div style="display:flex;flex-direction:column;gap:12px">
            <div class="field">
              <label>1. Pilih File .json dari Komputer</label>
              <input type="file" id="inp-import-file" accept=".json,application/json" style="background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px;color:var(--c-text)">
            </div>

            <div class="field">
              <label for="txt-import-json">2. Atau Tempel (Paste) Konten JSON di Sini</label>
              <textarea id="txt-import-json" rows="6" placeholder='{\n  "questions": [\n    {\n      "text": "Pertanyaan kuis...",\n      "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],\n      "answerIndex": 0,\n      "difficulty": 1,\n      "explanation": "Pembahasan..."\n    }\n  ]\n}' style="font-family:monospace;font-size:.8rem"></textarea>
            </div>

            <div id="import-preview-box" style="display:none;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);border-radius:10px;padding:10px;font-size:.84rem;color:#86efac">
            </div>

            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:6px">
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

      function parseRaw(rawStr) {
        try {
          const parsed = JSON.parse(rawStr);
          let qList = [];
          if (Array.isArray(parsed)) qList = parsed;
          else if (parsed && Array.isArray(parsed.questions)) qList = parsed.questions;
          else if (parsed && Array.isArray(parsed.data)) qList = parsed.data;

          const valid = qList.filter(q => q && q.text && Array.isArray(q.options) && q.options.length >= 2);
          prevBox.style.display = 'block';
          prevBox.textContent = `✓ Ditemukan ${valid.length} soal valid siap di-import.`;
          return valid;
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

  // Initialize
  checkAuth();
})();
