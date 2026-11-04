// public/js/friends.js — layar pertemanan & tantangan duel
(function () {
  'use strict';

  let pollTimer = null;
  let presenceTimer = null;
  let currentTab = 'friends';

  function stopTimers() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    if (presenceTimer) { clearInterval(presenceTimer); presenceTimer = null; }
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function statusBadge(f) {
    if (!f.online) return '<span class="status-pill off">⚫ Offline</span>';
    const labels = {
      duel: '🟢 Duel',
      battle: '⚔️ Battle',
      petualangan: '🗺️ Petualangan',
      idle: '💤 Idle'
    };
    return `<span class="status-pill on">${labels[f.activity] || '💤 Online'}</span>`;
  }

  async function fetchFriendsData() {
    try {
      const [friendsRes, duelInvRes] = await Promise.all([
        window.API.req('/api/friends'),
        window.API.req('/api/duels/invites').catch(() => ({ invites: [] }))
      ]);
      return {
        friends: friendsRes.friends || [],
        incoming: friendsRes.incoming || [],
        duelInvites: duelInvRes.invites || []
      };
    } catch (e) {
      return { friends: [], incoming: [], duelInvites: [] };
    }
  }

  async function loadData() {
    const data = await fetchFriendsData();
    renderContent(data);
  }

  function renderContent(data) {
    const body = document.getElementById('friends-body');
    if (!body) return;

    // Badges update
    const totalInv = (data.incoming?.length || 0) + (data.duelInvites?.length || 0);
    const badge = document.getElementById('badge-invites');
    if (badge) {
      badge.textContent = totalInv;
      badge.style.display = totalInv > 0 ? 'inline-block' : 'none';
    }

    if (currentTab === 'friends') {
      const rows = (data.friends || []).map(f => `
        <div class="friend-card" data-id="${f.id}">
          <div class="friend-info">
            <span class="friend-nick">👤 ${esc(f.nick)}</span>
            ${statusBadge(f)}
          </div>
          <div class="friend-actions">
            <button class="btn primary small btn-challenge-duel" data-id="${f.id}" data-nick="${esc(f.nick)}">⚔️ Duel</button>
            <button class="btn ghost small btn-del-friend" data-id="${f.id}" title="Hapus Teman">✕</button>
          </div>
        </div>
      `).join('');

      body.innerHTML = `
        <div class="search-box-row">
          <input type="text" id="input-friend-search" class="input-text" placeholder="Ketik nick teman (min 2 huruf)..." />
          <button class="btn primary small" id="btn-do-search">Cari</button>
        </div>
        <div id="search-results-area" style="display:none;margin-bottom:12px;"></div>
        <div class="friends-list">
          ${rows || '<div class="empty-state">Belum memiliki teman. Cari teman di atas!</div>'}
        </div>
      `;

      attachFriendsTabEvents(data);
    } else if (currentTab === 'invites') {
      const duelRows = (data.duelInvites || []).map(d => `
        <div class="invite-card duel-highlight" data-id="${d.id}">
          <div class="invite-info">
            <strong>⚔️ Tantangan Duel!</strong>
            <div>Dari: <strong style="color:var(--c-primary)">${esc(d.from_nick)}</strong></div>
            <div style="font-size:0.75rem;color:var(--c-muted)">Mata Pelajaran: ${esc(d.subject_name || 'Umum')}</div>
          </div>
          <div class="invite-actions">
            <button class="btn primary small btn-accept-duel" data-id="${d.id}">Terima ⚔️</button>
            <button class="btn ghost small btn-decline-duel" data-id="${d.id}">Tolak</button>
          </div>
        </div>
      `).join('');

      const reqRows = (data.incoming || []).map(i => `
        <div class="invite-card" data-id="${i.id}">
          <div class="invite-info">
            <span>👤 Permintaan Pertemanan</span>
            <div><strong>${esc(i.nick)}</strong> ingin berteman</div>
          </div>
          <div class="invite-actions">
            <button class="btn primary small btn-accept-friend" data-id="${i.id}">✓ Terima</button>
            <button class="btn ghost small btn-decline-friend" data-id="${i.id}">✕ Tolak</button>
          </div>
        </div>
      `).join('');

      body.innerHTML = `
        <div class="invites-list">
          ${duelRows || ''}
          ${reqRows || ''}
          ${(!duelRows && !reqRows) ? '<div class="empty-state">Tidak ada undangan atau permintaan saat ini.</div>' : ''}
        </div>
      `;

      attachInvitesTabEvents();
    } else if (currentTab === 'history') {
      body.innerHTML = '<div class="empty-state">Memuat riwayat duel...</div>';
      window.API.req('/api/friends/history?limit=15').then(res => {
        const hist = res.history || [];
        if (!hist.length) {
          body.innerHTML = '<div class="empty-state">Belum ada riwayat duel.</div>';
          return;
        }
        const myId = window.Player?.data?.id;
        const rows = hist.map(h => {
          const isWinner = (h.winner_id === myId);
          const isDraw = (h.winner_id === null);
          const oppNick = (h.winner_id === h.challenger_id ? h.challenged_nick : h.challenger_nick);
          const resultBadge = isWinner ? '<span class="hist-badge win">🏆 Menang</span>' :
            (isDraw ? '<span class="hist-badge draw">🤝 Seri</span>' : '<span class="hist-badge lose">💀 Kalah</span>');
          const dateStr = h.finished_at ? new Date(h.finished_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';

          return `
            <div class="history-card">
              <div class="hist-head">
                ${resultBadge}
                <span class="hist-date">${dateStr}</span>
              </div>
              <div class="hist-body">
                <div>vs <strong>${esc(oppNick)}</strong></div>
                <div style="font-size:0.75rem;color:var(--c-muted)">Alasan: ${esc(h.end_reason)} · Skor HP: ${h.hp_challenger} vs ${h.hp_challenged}</div>
              </div>
            </div>
          `;
        }).join('');
        body.innerHTML = `<div class="history-list">${rows}</div>`;
      }).catch(() => {
        body.innerHTML = '<div class="empty-state">Gagal memuat riwayat duel.</div>';
      });
    }
  }

  function attachFriendsTabEvents(data) {
    const btnSearch = document.getElementById('btn-do-search');
    const inputSearch = document.getElementById('input-friend-search');
    const resArea = document.getElementById('search-results-area');

    async function doSearch() {
      const q = (inputSearch?.value || '').trim();
      if (q.length < 2) {
        if (window.toast) window.toast('Masukkan minimal 2 huruf');
        return;
      }
      resArea.style.display = 'block';
      resArea.innerHTML = '<div style="font-size:0.8rem;color:var(--c-muted)">Mencari...</div>';
      try {
        const r = await window.API.req(`/api/friends/search?q=${encodeURIComponent(q)}`);
        const list = r.results || [];
        if (!list.length) {
          resArea.innerHTML = '<div style="font-size:0.8rem;color:var(--c-muted)">Pemain tidak ditemukan</div>';
          return;
        }
        resArea.innerHTML = list.map(u => `
          <div class="search-item-row">
            <span>👤 ${esc(u.nick)}</span>
            <button class="btn primary small btn-add-player" data-nick="${esc(u.nick)}">+ Tambah</button>
          </div>
        `).join('');

        resArea.querySelectorAll('.btn-add-player').forEach(b => {
          b.onclick = async () => {
            const nick = b.getAttribute('data-nick');
            try {
              const res = await window.API.req('/api/friends/request', { method: 'POST', body: JSON.stringify({ nick }) });
              if (res.code === 'OK') {
                if (window.toast) window.toast(`Permintaan terkirim ke ${nick}`);
                resArea.style.display = 'none';
                inputSearch.value = '';
                loadData();
              }
            } catch (e) {
              if (window.toast) window.toast(e.message || 'Gagal mengirim permintaan');
            }
          };
        });
      } catch (e) {
        resArea.innerHTML = '<div style="font-size:0.8rem;color:#f87171">Gagal mencari pemain</div>';
      }
    }

    if (btnSearch) btnSearch.onclick = doSearch;
    if (inputSearch) {
      inputSearch.onkeydown = (e) => { if (e.key === 'Enter') doSearch(); };
    }

    // Challenge Duel
    document.querySelectorAll('.btn-challenge-duel').forEach(b => {
      b.onclick = async () => {
        const friendId = Number(b.getAttribute('data-id'));
        const friendNick = b.getAttribute('data-nick');
        showSubjectPickerModal(friendId, friendNick);
      };
    });

    // Delete friend
    document.querySelectorAll('.btn-del-friend').forEach(b => {
      b.onclick = async () => {
        const friendId = Number(b.getAttribute('data-id'));
        if (!confirm('Hapus pertemanan dengan pemain ini?')) return;
        try {
          await window.API.req(`/api/friends/${friendId}`, { method: 'DELETE' });
          if (window.toast) window.toast('Pertemanan dihapus');
          loadData();
        } catch (e) {
          if (window.toast) window.toast('Gagal menghapus');
        }
      };
    });
  }

  function attachInvitesTabEvents() {
    // Accept duel
    document.querySelectorAll('.btn-accept-duel').forEach(b => {
      b.onclick = async () => {
        const duelId = b.getAttribute('data-id');
        b.disabled = true;
        try {
          const res = await window.API.req(`/api/duels/${duelId}/respond`, {
            method: 'POST',
            body: JSON.stringify({ action: 'accept' })
          });
          if (res.code === 'OK') {
            stopTimers();
            window.go('duel', { duelId });
          }
        } catch (e) {
          b.disabled = false;
          if (window.toast) window.toast(e.message || 'Gagal menerima duel');
        }
      };
    });

    // Decline duel
    document.querySelectorAll('.btn-decline-duel').forEach(b => {
      b.onclick = async () => {
        const duelId = b.getAttribute('data-id');
        try {
          await window.API.req(`/api/duels/${duelId}/respond`, {
            method: 'POST',
            body: JSON.stringify({ action: 'decline' })
          });
          if (window.toast) window.toast('Tantangan ditolak');
          loadData();
        } catch (e) {
          if (window.toast) window.toast('Gagal menolak duel');
        }
      };
    });

    // Accept friend
    document.querySelectorAll('.btn-accept-friend').forEach(b => {
      b.onclick = async () => {
        const requestId = Number(b.getAttribute('data-id'));
        try {
          await window.API.req('/api/friends/respond', {
            method: 'POST',
            body: JSON.stringify({ requestId, action: 'accept' })
          });
          if (window.toast) window.toast('Pertemanan diterima!');
          loadData();
        } catch (e) {
          if (window.toast) window.toast(e.message || 'Gagal menerima');
        }
      };
    });

    // Decline friend
    document.querySelectorAll('.btn-decline-friend').forEach(b => {
      b.onclick = async () => {
        const requestId = Number(b.getAttribute('data-id'));
        try {
          await window.API.req('/api/friends/respond', {
            method: 'POST',
            body: JSON.stringify({ requestId, action: 'decline' })
          });
          loadData();
        } catch (e) {}
      };
    });
  }

  async function showSubjectPickerModal(friendId, friendNick) {
    const modal = document.createElement('div');
    modal.className = 'duel-modal-overlay';
    modal.innerHTML = `
      <div class="duel-modal-card">
        <h3>⚔️ Tantang Duel</h3>
        <p style="font-size:0.85rem;color:var(--c-muted);margin:4px 0 12px">Pilih mata pelajaran untuk duel dengan <strong>${esc(friendNick)}</strong>:</p>
        <div id="modal-subjects-list" style="display:flex;flex-direction:column;gap:8px;max-height:240px;overflow-y:auto">
          <div style="font-size:0.8rem;color:var(--c-muted)">Memuat mata pelajaran...</div>
        </div>
        <button class="btn ghost small" id="btn-close-duel-modal" style="margin-top:12px;width:100%">Batal</button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('btn-close-duel-modal').onclick = () => modal.remove();

    try {
      const p = window.Player?.data;
      const subjects = await window.API.getSubjects(p?.class_id || 1);
      const listEl = document.getElementById('modal-subjects-list');
      if (!listEl) return;
      if (!subjects.length) {
        listEl.innerHTML = '<div style="font-size:0.8rem;color:var(--c-muted)">Belum ada mata pelajaran tersedia.</div>';
        return;
      }
      listEl.innerHTML = subjects.map(s => `
        <button class="btn secondary btn-pick-subject" data-sid="${s.id}" style="text-align:left;padding:8px 12px;display:flex;align-items:center;gap:8px">
          <span>${esc(s.icon || '📖')}</span>
          <span style="font-weight:700">${esc(s.name)}</span>
        </button>
      `).join('');

      listEl.querySelectorAll('.btn-pick-subject').forEach(sb => {
        sb.onclick = async () => {
          const subjectId = Number(sb.getAttribute('data-sid'));
          sb.disabled = true;
          try {
            const ch = await window.API.req('/api/duels/challenge', {
              method: 'POST',
              body: JSON.stringify({ friendId, subjectId })
            });
            modal.remove();
            if (ch.code === 'OK') {
              if (window.toast) window.toast(`Tantangan dikirim ke ${friendNick}! Menunggu respon...`);
              stopTimers();
              window.go('duel', { duelId: ch.duelId, waiting: true });
            }
          } catch (err) {
            sb.disabled = false;
            if (window.toast) window.toast(err.message || 'Gagal mengirim tantangan');
          }
        };
      });
    } catch (e) {
      modal.remove();
      if (window.toast) window.toast('Gagal memuat mata pelajaran');
    }
  }

  // Register Screen
  window.Screens = window.Screens || {};
  window.Screens.friends = {
    render(app, params) {
      stopTimers();
      currentTab = params?.tab || 'friends';

      app.innerHTML = `
        <section class="screen active stack friends-screen">
          <div class="screen-header">
            <button class="btn ghost small" id="btn-friends-back">← Beranda</button>
            <h2 style="font-size:1.15rem;margin:0;font-weight:800">👥 Pertemanan & Duel</h2>
            <div style="width:50px"></div>
          </div>

          <div class="friends-tab-bar">
            <button class="tab-btn ${currentTab === 'friends' ? 'active' : ''}" data-tab="friends">👥 Teman</button>
            <button class="tab-btn ${currentTab === 'invites' ? 'active' : ''}" data-tab="invites">
              ✉️ Undangan <span id="badge-invites" class="tab-badge" style="display:none">0</span>
            </button>
            <button class="tab-btn ${currentTab === 'history' ? 'active' : ''}" data-tab="history">📜 Riwayat</button>
          </div>

          <div id="friends-body" class="friends-content-area"></div>
        </section>
      `;

      document.getElementById('btn-friends-back').onclick = () => {
        stopTimers();
        window.go('home');
      };

      document.querySelectorAll('.friends-tab-bar .tab-btn').forEach(btn => {
        btn.onclick = () => {
          document.querySelectorAll('.friends-tab-bar .tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentTab = btn.getAttribute('data-tab');
          loadData();
        };
      });

      loadData();

      // Polling setiap 5 detik untuk cek undangan/status teman baru
      pollTimer = setInterval(loadData, 5000);

      // Heartbeat presence setiap 20 detik
      presenceTimer = setInterval(() => {
        window.API.req('/api/presence/ping', { method: 'POST', body: JSON.stringify({ activity: 'idle' }) }).catch(() => {});
      }, 20000);
    },

    destroy() {
      stopTimers();
    }
  };
})();
