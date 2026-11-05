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
        <div class="friend-left btn-view-friend-detail" data-id="${f.id}" title="Klik untuk lihat profil & statistik teman" style="display:flex;align-items:center;gap:12px;min-width:0;cursor:pointer;">
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

  function formatTypes(typesJson) {
    if (!typesJson) return 'Semua Tipe';
    try {
      const arr = typeof typesJson === 'string' ? JSON.parse(typesJson) : typesJson;
      if (!Array.isArray(arr) || !arr.length) return 'Semua Tipe';
      const names = {
        'MCQ': 'Pilihan Ganda',
        'TRUE_FALSE': 'Benar/Salah',
        'ORDERING': 'Urutkan Kartu',
        'MATCHING': 'Pasangkan Kata',
        'SHORT': 'Isian Singkat'
      };
      return arr.map(t => names[t] || t).join(', ');
    } catch {
      return 'Semua Tipe';
    }
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
            <div style="font-size:0.75rem;color:var(--c-muted)">
              🏫 <strong>${esc(d.class_name || 'Kelas Belajar')}</strong> · 📖 <strong>${esc(d.subject_name || 'Umum')}</strong>
            </div>
            <div style="font-size:0.72rem;color:#38bdf8;margin-top:2px">
              🎯 Tipe Soal: <strong>${esc(formatTypes(d.question_types_json))}</strong>
            </div>
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
    // View Friend Detail
    document.querySelectorAll('.btn-view-friend-detail').forEach(el => {
      el.onclick = () => {
        const friendId = Number(el.getAttribute('data-id'));
        if (friendId) showFriendDetailModal(friendId);
      };
    });

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

  async function showFriendDetailModal(friendId) {
    if (window.Sfx) window.Sfx.play('tap');
    const modalId = 'modal-friend-detail';
    const oldModal = document.getElementById(modalId);
    if (oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.className = 'confirm-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;animation:fadeIn 0.2s ease;';
    overlay.innerHTML = `
      <div class="confirm-card stack" style="width:min(440px,96vw);background:#0f172a;border:1px solid rgba(255,255,255,0.15);border-radius:18px;padding:24px;text-align:center;box-shadow:0 12px 36px rgba(0,0,0,0.7)">
        <div style="color:var(--c-muted);font-size:0.9rem">Memuat profil teman...</div>
      </div>
    `;
    document.body.appendChild(overlay);

    try {
      const res = await window.API.req(`/api/friends/${friendId}/profile`);
      if (!res || !res.ok) throw new Error('Profil tidak ditemukan');

      const p = res.player || {};
      const stats = res.stats || {};
      const showcase = res.showcase || [null, null, null];
      const avatarSvg = (window.Avatar && typeof window.Avatar.renderAvatar === 'function')
        ? window.Avatar.renderAvatar(p.avatar || {})
        : '<span style="font-size:2rem">👤</span>';

      overlay.innerHTML = `
        <div class="confirm-card stack" style="width:min(460px,96vw);max-height:88dvh;background:#0f172a;border:1px solid rgba(255,255,255,0.15);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:12px;box-shadow:0 12px 36px rgba(0,0,0,0.7)">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <h3 style="margin:0;font-size:1.05rem;color:#fff;font-weight:800">👤 Detail Profil Teman</h3>
            <button class="btn ghost small" id="btn-close-friend-modal" style="font-size:1.2rem;padding:2px 8px">✕</button>
          </div>

          <div style="overflow-y:auto;max-height:75dvh;padding-right:4px;display:flex;flex-direction:column;gap:12px">
            <!-- HERO HEADER -->
            <div style="padding:14px;background:var(--c-surface);border-radius:14px;border:1px solid rgba(255,255,255,0.1);display:flex;gap:12px;align-items:center">
              <div style="width:64px;height:64px;border-radius:16px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">
                ${avatarSvg}
              </div>
              <div style="min-width:0;flex-grow:1">
                <div style="font-weight:800;font-size:1.1rem;color:#fff">${esc(p.nick || 'Teman')}</div>
                <div style="font-size:0.78rem;color:var(--c-muted);margin-top:2px">
                  <span style="color:var(--c-primary);font-weight:700">Lv. ${p.level || 1}</span> · ${esc(p.title || 'Pelajar Pemula')} · ${esc(p.className || '')}
                </div>
                <div style="font-size:0.72rem;color:#38bdf8;margin-top:4px;font-weight:700">
                  🏅 ${res.totalBadges || 0} / 80 Lencana Terbuka · 🎨 ${res.totalSkins || 0} Skin
                </div>
              </div>
            </div>

            <!-- SHOWCASE 3 SLOT TEMAN -->
            <div>
              <div style="font-size:0.8rem;font-weight:800;color:var(--c-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">
                ✨ Panggung Kehormatan Teman
              </div>
              <div class="showcase-grid">
                ${[0, 1, 2].map(slotIdx => {
                  const item = showcase[slotIdx];
                  if (!item) {
                    return `
                      <div class="showcase-slot empty" style="cursor:default">
                        <div style="font-size:1.3rem;opacity:0.3">🔒</div>
                        <div style="font-size:0.68rem;color:var(--c-muted);margin-top:4px">Kosong</div>
                      </div>
                    `;
                  }
                  const tierClass = item.tier ? `tier-${item.tier.toLowerCase()}` : 'tier-common';
                  const tierColor = item.tier === 'LEGEND' ? '#c084fc' : (item.tier === 'EPIC' ? '#fbbf24' : (item.tier === 'RARE' ? '#38bdf8' : '#f59e0b'));
                  const friendBadgeArtSvg = (window.BadgeArt && typeof window.BadgeArt.renderBadge === 'function')
                    ? BadgeArt.renderBadge(item.id || item.familyId, item.tier || 'COMMON', { size: 54, title: item.name })
                    : `<div style="font-size:1.8rem;line-height:1.2">${item.icon || '🏅'}</div>`;
                  return `
                    <div class="showcase-slot ${tierClass}" onclick="if (window.App && typeof App.showBadgeDetailModal === 'function') App.showBadgeDetailModal('${item.id || item.familyId}', '${item.tier || 'COMMON'}')" title="Klik untuk lihat medali 3D & lore lencana" style="cursor:pointer">
                      <div style="display:flex;align-items:center;justify-content:center;height:56px">${friendBadgeArtSvg}</div>
                      <div style="font-size:0.75rem;font-weight:800;color:#fff;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:95%">${esc(item.name)}</div>
                      <div style="font-size:0.62rem;font-weight:700;color:${tierColor};text-transform:uppercase">${esc(item.tier || 'BADGE')}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- STATISTIK PERMAINAN LENGKAP -->
            <div>
              <div style="font-size:0.8rem;font-weight:800;color:var(--c-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">
                📊 Statistik Permainan Lengkap
              </div>
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
                <div class="profile-stat-box">
                  <span class="stat-icon">🎯</span>
                  <span class="stat-val">${stats.accuracy || 0}%</span>
                  <span class="stat-label">Akurasi Jawaban</span>
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
                  <span class="stat-val">${stats.dexDefeated || 0} / 40</span>
                  <span class="stat-label">Monster Dex</span>
                </div>
                <div class="profile-stat-box">
                  <span class="stat-icon">📅</span>
                  <span class="stat-val">${p.dayStreak || 1} Hari</span>
                  <span class="stat-label">Hari Belajar</span>
                </div>
              </div>
            </div>

            <!-- ACTION BUTTONS -->
            <div style="display:flex;gap:8px;margin-top:6px">
              <button class="btn primary small grow" id="btn-duel-from-modal" style="padding:10px;font-size:0.85rem">⚔️ Tantang Duel</button>
              <button class="btn ghost small grow" id="btn-close-modal-bottom" style="padding:10px;font-size:0.85rem">Tutup</button>
            </div>
          </div>
        </div>
      `;

      const close = () => overlay.remove();
      overlay.querySelector('#btn-close-friend-modal').onclick = close;
      overlay.querySelector('#btn-close-modal-bottom').onclick = close;

      const duelBtn = overlay.querySelector('#btn-duel-from-modal');
      if (duelBtn) {
        duelBtn.onclick = () => {
          close();
          showSubjectPickerModal(friendId, p.nick);
        };
      }
    } catch (err) {
      overlay.innerHTML = `
        <div class="confirm-card stack" style="width:min(440px,96vw);background:#0f172a;border:1px solid rgba(255,255,255,0.15);border-radius:18px;padding:24px;text-align:center">
          <div style="color:var(--c-danger);font-size:0.9rem;margin-bottom:12px">Gagal memuat profil: ${esc(err.message)}</div>
          <button class="btn ghost small" onclick="this.closest('.confirm-overlay').remove()">Tutup</button>
        </div>
      `;
    }
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
      <div class="duel-modal-card" style="width:min(440px, 94vw);max-height:90vh;display:flex;flex-direction:column;text-align:left;padding:18px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <h3 style="margin:0;font-size:1.15rem;display:flex;align-items:center;gap:6px">⚔️ Atur Tantangan Duel</h3>
          <button type="button" id="btn-close-duel-modal-x" style="background:transparent;border:0;color:var(--c-muted);font-size:1.2rem;cursor:pointer">&times;</button>
        </div>
        <div style="font-size:0.82rem;color:var(--c-muted);margin-bottom:12px">
          Tantang <strong>${esc(friendNick)}</strong> dalam pertarungan kuis realtime 1v1.
        </div>

        <div style="overflow-y:auto;flex:1;padding-right:4px;display:flex;flex-direction:column;gap:14px">
          <!-- 1. Pilih Kelas -->
          <div>
            <label style="font-size:0.8rem;font-weight:700;color:#cbd5e1;display:block;margin-bottom:5px">
              🏫 1. Pilih Tingkat Kelas:
            </label>
            <select id="duel-pick-class" style="width:100%;background:rgba(0,0,0,0.35);color:#fff;border:1px solid rgba(255,255,255,0.2);padding:8px 10px;border-radius:10px;font-size:0.88rem">
              <option value="">Memuat kelas...</option>
            </select>
          </div>

          <!-- 2. Pilih Mata Pelajaran -->
          <div>
            <label style="font-size:0.8rem;font-weight:700;color:#cbd5e1;display:block;margin-bottom:5px">
              📖 2. Pilih Mata Pelajaran:
            </label>
            <div id="modal-subjects-list" style="display:flex;flex-direction:column;gap:6px;max-height:160px;overflow-y:auto;padding-right:2px">
              <div style="font-size:0.8rem;color:var(--c-muted)">Memuat mata pelajaran...</div>
            </div>
          </div>

          <!-- 3. Tentukan Tipe Soal -->
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <label style="font-size:0.8rem;font-weight:700;color:#cbd5e1">
                🎯 3. Tipe Soal yang Diadukan:
              </label>
              <div style="display:flex;gap:6px">
                <button type="button" class="btn ghost small" id="btn-types-all" style="font-size:0.7rem;padding:2px 6px">Semua</button>
                <button type="button" class="btn ghost small" id="btn-types-mcq" style="font-size:0.7rem;padding:2px 6px">MCQ Saja</button>
              </div>
            </div>

            <div id="duel-type-options" style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
              <label class="duel-type-chip active">
                <input type="checkbox" value="MCQ" checked style="accent-color:#38bdf8" />
                <span>📝 Pilihan Ganda</span>
              </label>
              <label class="duel-type-chip active">
                <input type="checkbox" value="TRUE_FALSE" checked style="accent-color:#38bdf8" />
                <span>⚖️ Benar / Salah</span>
              </label>
              <label class="duel-type-chip active">
                <input type="checkbox" value="ORDERING" checked style="accent-color:#38bdf8" />
                <span>🔢 Urutkan Kartu</span>
              </label>
              <label class="duel-type-chip active">
                <input type="checkbox" value="MATCHING" checked style="accent-color:#38bdf8" />
                <span>🔗 Pasangkan Kata</span>
              </label>
              <label class="duel-type-chip active" style="grid-column: span 2">
                <input type="checkbox" value="SHORT" checked style="accent-color:#38bdf8" />
                <span>✍️ Isian Singkat</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Tombol Aksi -->
        <div style="margin-top:14px;display:flex;gap:8px">
          <button class="btn ghost small" id="btn-close-duel-modal" style="flex:1">Batal</button>
          <button class="btn primary small" id="btn-send-duel-challenge" style="flex:2;padding:10px 14px;font-weight:800;font-size:0.92rem">
            ⚔️ Kirim Tantangan
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    document.getElementById('btn-close-duel-modal').onclick = closeModal;
    document.getElementById('btn-close-duel-modal-x').onclick = closeModal;

    let selectedSubjectId = null;
    const classSel = document.getElementById('duel-pick-class');

    async function loadSubjectsForClass(cid) {
      const listEl = document.getElementById('modal-subjects-list');
      if (!listEl) return;
      listEl.innerHTML = '<div style="font-size:0.8rem;color:var(--c-muted)">Memuat mata pelajaran...</div>';
      selectedSubjectId = null;

      try {
        const subjects = await window.API.getSubjects(cid);
        if (!subjects || !subjects.length) {
          listEl.innerHTML = '<div style="font-size:0.8rem;color:var(--c-muted)">Belum ada mata pelajaran untuk kelas ini.</div>';
          return;
        }
        listEl.innerHTML = subjects.map((s, idx) => `
          <div class="duel-subj-item ${idx === 0 ? 'selected' : ''}" data-sid="${s.id}">
            <span style="font-size:1.1rem">${esc(s.icon || '📖')}</span>
            <div style="flex:1">
              <div style="font-weight:700;font-size:0.88rem">${esc(s.name)}</div>
              ${s.question_count ? `<div style="font-size:0.72rem;color:var(--c-muted)">${s.question_count} soal tersedia</div>` : ''}
            </div>
            <span class="subj-check" style="color:#10b981;font-weight:bold">${idx === 0 ? '✓' : ''}</span>
          </div>
        `).join('');

        selectedSubjectId = subjects[0].id;

        listEl.querySelectorAll('.duel-subj-item').forEach(item => {
          item.onclick = () => {
            listEl.querySelectorAll('.duel-subj-item').forEach(el => {
              el.classList.remove('selected');
              const chk = el.querySelector('.subj-check');
              if (chk) chk.textContent = '';
            });
            item.classList.add('selected');
            const myChk = item.querySelector('.subj-check');
            if (myChk) myChk.textContent = '✓';
            selectedSubjectId = Number(item.getAttribute('data-sid'));
          };
        });
      } catch (e) {
        listEl.innerHTML = '<div style="font-size:0.8rem;color:#f87171">Gagal memuat mata pelajaran</div>';
      }
    }

    try {
      const p = window.Player?.data;
      let classes = [];
      try {
        const clsRes = await window.API.req('/api/classes');
        classes = clsRes.classes || [];
      } catch {}
      if (!classes.length && p?.classes) classes = p.classes;
      if (!classes.length) classes = [{ id: p?.class_id || 1, name: 'Kelas ' + (p?.class_id || 1) }];

      const initialClassId = p?.class_id && classes.some(c => c.id === p.class_id)
        ? p.class_id
        : classes[0].id;

      classSel.innerHTML = classes.map(c => `
        <option value="${c.id}" ${c.id === initialClassId ? 'selected' : ''}>${esc(c.name)}</option>
      `).join('');

      classSel.onchange = () => {
        loadSubjectsForClass(Number(classSel.value));
      };

      await loadSubjectsForClass(Number(classSel.value));

      // Question type checkboxes
      const typeContainer = document.getElementById('duel-type-options');
      const typeChips = typeContainer.querySelectorAll('.duel-type-chip');
      typeChips.forEach(chip => {
        const cb = chip.querySelector('input[type="checkbox"]');
        cb.onchange = () => {
          chip.classList.toggle('active', cb.checked);
        };
      });

      const btnTypesAll = document.getElementById('btn-types-all');
      if (btnTypesAll) {
        btnTypesAll.onclick = () => {
          typeChips.forEach(chip => {
            const cb = chip.querySelector('input[type="checkbox"]');
            cb.checked = true;
            chip.classList.add('active');
          });
        };
      }

      const btnTypesMcq = document.getElementById('btn-types-mcq');
      if (btnTypesMcq) {
        btnTypesMcq.onclick = () => {
          typeChips.forEach(chip => {
            const cb = chip.querySelector('input[type="checkbox"]');
            cb.checked = (cb.value === 'MCQ');
            chip.classList.toggle('active', cb.checked);
          });
        };
      }

      // Send challenge button
      const btnSubmit = document.getElementById('btn-send-duel-challenge');
      btnSubmit.onclick = async () => {
        if (!selectedSubjectId) {
          if (window.toast) window.toast('Pilih mata pelajaran terlebih dahulu', 'error');
          return;
        }

        const selectedTypes = [];
        typeContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
          selectedTypes.push(cb.value);
        });

        if (selectedTypes.length === 0) {
          if (window.toast) window.toast('Pilih minimal 1 tipe soal untuk duel', 'error');
          return;
        }

        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Mengirim...';

        try {
          const ch = await window.API.req('/api/duels/challenge', {
            method: 'POST',
            body: JSON.stringify({
              friendId,
              classId: Number(classSel.value),
              subjectId: selectedSubjectId,
              questionTypes: selectedTypes
            })
          });

          modal.remove();
          if (ch.code === 'OK') {
            if (window.toast) window.toast(`Tantangan dikirim ke ${friendNick}! Menunggu respon...`);
            stopTimers();
            window.go('duel', { duelId: ch.duelId, waiting: true });
          }
        } catch (err) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = '⚔️ Kirim Tantangan';
          if (window.toast) window.toast(err.message || 'Gagal mengirim tantangan');
        }
      };
    } catch (e) {
      modal.remove();
      if (window.toast) window.toast('Gagal memuat opsi tantangan duel');
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
