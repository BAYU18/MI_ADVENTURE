// public/js/friends.js — layar pertemanan & tantangan duel
(function () {
  'use strict';

  let pollTimer = null;
  let presenceTimer = null;
  let searchDebounceTimer = null;
  let searchSeq = 0;
  let currentTab = 'friends';

  function stopTimers() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    if (presenceTimer) { clearInterval(presenceTimer); presenceTimer = null; }
    if (searchDebounceTimer) { clearTimeout(searchDebounceTimer); searchDebounceTimer = null; }
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function renderAvatarBadge(avatar, size = 42) {
    let av = avatar;
    if (typeof av === 'string') {
      try { av = JSON.parse(av); } catch (e) { av = {}; }
    }
    const svg = (window.Avatar && typeof window.Avatar.renderAvatar === 'function')
      ? window.Avatar.renderAvatar(av || {})
      : '<span style="font-size:1.4rem">👤</span>';
    return `
      <div class="friend-avatar-badge" style="width:${size}px;height:${size}px;">
        ${svg}
      </div>
    `;
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

  function renderFriendRows(friends) {
    if (!friends || !friends.length) {
      return '<div class="empty-state">Belum memiliki teman. Cari teman di atas!</div>';
    }
    return friends.map(f => `
      <div class="friend-card" data-id="${f.id}">
        <div class="friend-left" style="display:flex;align-items:center;gap:12px;min-width:0;">
          ${renderAvatarBadge(f.avatar, 42)}
          <div class="friend-info">
            <span class="friend-nick">${esc(f.nick)}</span>
            ${statusBadge(f)}
          </div>
        </div>
        <div class="friend-actions">
          <button class="btn primary small btn-challenge-duel" data-id="${f.id}" data-nick="${esc(f.nick)}">⚔️ Duel</button>
          <button class="btn ghost small btn-del-friend" data-id="${f.id}" title="Hapus Teman">✕</button>
        </div>
      </div>
    `).join('');
  }

  function renderSearchResults(list, q) {
    if (!list.length) {
      return `<div style="font-size:0.85rem;color:var(--c-muted);padding:10px;text-align:center">Pemain "${esc(q)}" tidak ditemukan</div>`;
    }
    return `
      <div style="font-size:0.75rem;font-weight:700;color:var(--c-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px">
        Hasil Pencarian (${list.length}):
      </div>
      ${list.map(u => {
        let actionBtn = '';
        if (u.isFriend) {
          actionBtn = '<span style="font-size:0.75rem;color:#34d399;font-weight:700;padding:4px 8px;background:rgba(16,185,129,0.12);border-radius:6px">Teman ✓</span>';
        } else if (u.isPending) {
          actionBtn = '<span style="font-size:0.75rem;color:#f59e0b;font-weight:700;padding:4px 8px;background:rgba(245,158,11,0.12);border-radius:6px">Menunggu ⏳</span>';
        } else {
          actionBtn = `<button class="btn primary small btn-add-player" data-nick="${esc(u.nick)}">+ Tambah</button>`;
        }
        return `
          <div class="search-item-card">
            <div class="search-item-left">
              ${renderAvatarBadge(u.avatar, 40)}
              <div class="search-item-meta">
                <span class="search-item-nick">${esc(u.nick)}</span>
                ${u.className ? `<span class="search-item-sub">${esc(u.className)}</span>` : ''}
              </div>
            </div>
            <div class="search-item-actions">
              ${actionBtn}
            </div>
          </div>
        `;
      }).join('')}
    `;
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
      const existingInput = document.getElementById('input-friend-search');
      const listContainer = document.querySelector('#friends-body .friends-list');

      if (existingInput && listContainer) {
        listContainer.innerHTML = renderFriendRows(data.friends || []);
        attachFriendsListActions();
      } else {
        body.innerHTML = `
          <div class="search-box-row">
            <input type="text" id="input-friend-search" class="input-text" placeholder="Ketik nick teman (min 2 huruf)..." autocomplete="off" />
            <button class="btn primary small" id="btn-do-search">Cari</button>
          </div>
          <div id="search-results-area" style="display:none;margin-bottom:12px;"></div>
          <div class="friends-list">
            ${renderFriendRows(data.friends || [])}
          </div>
        `;
        attachFriendsTabEvents(data);
      }
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
          <div style="display:flex;align-items:center;gap:12px;min-width:0;">
            ${renderAvatarBadge(i.avatar, 42)}
            <div class="invite-info">
              <span style="font-size:0.75rem;color:var(--c-muted)">👤 Permintaan Pertemanan</span>
              <div style="font-weight:700;color:#fff">${esc(i.nick)}</div>
            </div>
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

    async function executeSearch(queryStr, { isExplicit = false } = {}) {
      const q = (queryStr ?? (inputSearch?.value || '')).trim();
      if (q.length < 2) {
        if (isExplicit && window.toast) {
          window.toast('Masukkan minimal 2 huruf');
        }
        if (resArea) {
          resArea.style.display = 'none';
          resArea.innerHTML = '';
        }
        return;
      }

      const seq = ++searchSeq;
      if (resArea) {
        resArea.style.display = 'block';
        resArea.innerHTML = '<div style="font-size:0.85rem;color:var(--c-muted);padding:10px;text-align:center">Mencari pemain...</div>';
      }

      try {
        const r = await window.API.req(`/api/friends/search?q=${encodeURIComponent(q)}`);
        if (seq !== searchSeq) return; // Stale query dropped
        const list = r.results || [];
        if (!resArea) return;
        resArea.innerHTML = renderSearchResults(list, q);

        resArea.querySelectorAll('.btn-add-player').forEach(b => {
          b.onclick = async () => {
            const nick = b.getAttribute('data-nick');
            b.disabled = true;
            b.textContent = 'Mengirim...';
            try {
              const res = await window.API.req('/api/friends/request', { method: 'POST', body: JSON.stringify({ nick }) });
              if (res.code === 'OK') {
                if (window.toast) window.toast(`Permintaan terkirim ke ${nick}`);
                b.textContent = 'Terkirim ✓';
                b.classList.remove('primary');
                b.classList.add('ghost');
                loadData();
              }
            } catch (e) {
              b.disabled = false;
              b.textContent = '+ Tambah';
              if (window.toast) window.toast(e.message || 'Gagal mengirim permintaan');
            }
          };
        });
      } catch (e) {
        if (seq !== searchSeq) return;
        if (resArea) {
          resArea.innerHTML = '<div style="font-size:0.85rem;color:#f87171;padding:10px;text-align:center">Gagal mencari pemain</div>';
        }
      }
    }

    if (inputSearch) {
      inputSearch.oninput = (e) => {
        const val = (e.target.value || '').trim();
        if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
        if (val.length < 2) {
          if (resArea) {
            resArea.style.display = 'none';
            resArea.innerHTML = '';
          }
          return;
        }
        searchDebounceTimer = setTimeout(() => {
          executeSearch(val, { isExplicit: false });
        }, 250);
      };

      inputSearch.onkeydown = (e) => {
        if (e.key === 'Enter') {
          if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
          executeSearch(inputSearch.value, { isExplicit: true });
        }
      };
    }

    if (btnSearch) {
      btnSearch.onclick = () => {
        if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
        executeSearch(inputSearch?.value, { isExplicit: true });
      };
    }

    attachFriendsListActions();
  }

  function attachFriendsListActions() {
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
