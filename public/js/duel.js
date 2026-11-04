// public/js/duel.js — layar duel realtime 1v1
(function () {
  'use strict';

  let pollTimer = null;
  let countdownTimer = null;
  let heartbeatTimer = null;
  let serverOffset = 0;
  let currentDuelId = null;
  let currentState = null;
  let currentLoadedQ = null;
  let eliminatedOpts = [];
  let isSubmitting = false;

  function stopAllTimers() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function updateCountdown() {
    const timerEl = document.getElementById('duel-timer-val');
    if (!timerEl || !currentState || currentState.status !== 'ACTIVE') {
      if (timerEl && currentState?.status !== 'ACTIVE') timerEl.textContent = '--:--';
      return;
    }

    const now = Date.now() + serverOffset;
    let targetTime = null;
    const isDeathmatch = (currentState.phase === 'DEATHMATCH');

    if (isDeathmatch) {
      if (currentState.questionDeadlineAt) {
        targetTime = new Date(currentState.questionDeadlineAt).getTime();
      }
    } else {
      if (currentState.normalEndsAt) {
        targetTime = new Date(currentState.normalEndsAt).getTime();
      }
    }

    if (!targetTime || !Number.isFinite(targetTime)) {
      timerEl.textContent = '--:--';
      return;
    }

    const remainingMs = Math.max(0, targetTime - now);
    const totalSec = Math.floor(remainingMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const timeStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

    timerEl.textContent = timeStr;

    if (isDeathmatch || totalSec <= 30) {
      timerEl.style.color = '#ef4444';
      timerEl.style.textShadow = '0 0 8px rgba(239, 68, 68, 0.6)';
    } else if (totalSec <= 60) {
      timerEl.style.color = '#f59e0b';
      timerEl.style.textShadow = '0 0 6px rgba(245, 158, 11, 0.4)';
    } else {
      timerEl.style.color = '#fff';
      timerEl.style.textShadow = 'none';
    }

    if (remainingMs <= 0 && !isSubmitting) {
      pollState();
    }
  }

  function startCountdown() {
    if (countdownTimer) return;
    updateCountdown();
    countdownTimer = setInterval(updateCountdown, 1000);
  }

  async function pollState() {
    if (!currentDuelId) return;
    try {
      const res = await window.API.req(`/api/duels/${currentDuelId}/state`);
      if (res.code === 'OK' || res.status) {
        if (res.serverTime) {
          serverOffset = new Date(res.serverTime).getTime() - Date.now();
        }
        currentState = res;
        renderDuelState(res);
      }
    } catch (e) {
      console.warn('[Duel Poll Error]', e.message);
    }
  }

  function renderDuelState(s) {
    const appEl = document.getElementById('duel-app-view');
    if (!appEl) return;

    if (s.status === 'PENDING') {
      appEl.innerHTML = `
        <div class="duel-waiting-card">
          <div class="duel-loading-spinner">⚔️</div>
          <h3>Menunggu Lawan...</h3>
          <p style="font-size:0.85rem;color:var(--c-muted)">Tantangan duel telah dikirim. Menunggu lawan menerima...</p>
          <button class="btn ghost small" id="btn-cancel-pending-duel" style="margin-top:16px">Batalkan</button>
        </div>
      `;
      const btnCancel = document.getElementById('btn-cancel-pending-duel');
      if (btnCancel) {
        btnCancel.onclick = () => {
          stopAllTimers();
          window.go('friends');
        };
      }
      return;
    }

    if (s.status === 'PAUSED') {
      const overlay = document.getElementById('duel-paused-overlay');
      if (!overlay) {
        const ov = document.createElement('div');
        ov.id = 'duel-paused-overlay';
        ov.className = 'duel-overlay-notice';
        ov.innerHTML = `
          <div class="duel-notice-box">
            <h3>⚠️ Lawan Terputus</h3>
            <p>Menunggu koneksi lawan kembali (grace window aktif)...</p>
          </div>
        `;
        document.body.appendChild(ov);
      }
    } else {
      const overlay = document.getElementById('duel-paused-overlay');
      if (overlay) overlay.remove();
    }

    if (s.status === 'FINISHED') {
      stopAllTimers();
      renderFinishedModal(s);
      return;
    }

    if (s.status === 'ACTIVE') {
      renderActiveArena(s);
    }
  }

  function renderActiveArena(s) {
    const appEl = document.getElementById('duel-app-view');
    if (!appEl) return;

    const meSide = s.you; // 'challenger' or 'challenged'
    const myData = (meSide === 'challenger') ? s.challenger : s.challenged;
    const oppData = (meSide === 'challenger') ? s.challenged : s.challenger;

    const hpMyPct = Math.max(0, Math.min(100, myData.hp));
    const hpOppPct = Math.max(0, Math.min(100, oppData.hp));

    // Update HP & Energy bars
    const hpMeFill = document.getElementById('duel-hp-me-fill');
    const hpMeText = document.getElementById('duel-hp-me-text');
    const hpOppFill = document.getElementById('duel-hp-opp-fill');
    const hpOppText = document.getElementById('duel-hp-opp-text');
    const energyBadge = document.getElementById('duel-energy-badge');
    const phaseLabel = document.getElementById('duel-phase-label');

    if (hpMeFill) {
      hpMeFill.style.width = hpMyPct + '%';
      hpMeText.textContent = `${myData.hp} / 100 ${myData.shield > 0 ? `(+${myData.shield} 🛡️)` : ''}`;
      hpOppFill.style.width = hpOppPct + '%';
      hpOppText.textContent = `${oppData.hp} / 100 ${oppData.shield > 0 ? `(+${oppData.shield} 🛡️)` : ''}`;
      if (energyBadge) energyBadge.textContent = `⚡ ${myData.energy} / ${myData.energyMax}`;
      if (phaseLabel) {
        phaseLabel.className = `duel-phase-tag ${s.phase === 'DEATHMATCH' ? 'deathmatch' : 'normal'}`;
        phaseLabel.textContent = s.phase === 'DEATHMATCH' ? '🔥 DEATHMATCH' : '⏳ NORMAL';
      }
      updateCountdown();
    } else {
      // First full layout render
      appEl.innerHTML = `
        <div class="duel-arena-card">
          <!-- Top VS Bar -->
          <div class="duel-vs-bar">
            <!-- Kamu -->
            <div class="duel-combatant me">
              <div class="combatant-name">Kamu</div>
              <div class="duel-hp-track">
                <div id="duel-hp-me-fill" class="duel-hp-fill me" style="width:${hpMyPct}%"></div>
              </div>
              <div id="duel-hp-me-text" class="duel-hp-text">${myData.hp} / 100</div>
            </div>

            <div class="duel-center-info">
              <div id="duel-phase-label" class="duel-phase-tag ${s.phase === 'DEATHMATCH' ? 'deathmatch' : 'normal'}">
                ${s.phase === 'DEATHMATCH' ? '🔥 DEATHMATCH' : '⏳ NORMAL'}
              </div>
              <div id="duel-timer-val" class="duel-timer-digits">--:--</div>
              <div id="duel-energy-badge" class="duel-energy-pill">⚡ ${myData.energy} / ${myData.energyMax}</div>
            </div>

            <!-- Lawan -->
            <div class="duel-combatant opp">
              <div class="combatant-name">Lawan</div>
              <div class="duel-hp-track">
                <div id="duel-hp-opp-fill" class="duel-hp-fill opp" style="width:${hpOppPct}%"></div>
              </div>
              <div id="duel-hp-opp-text" class="duel-hp-text">${oppData.hp} / 100</div>
            </div>
          </div>

          <!-- Question Box -->
          <div id="duel-question-container" class="duel-question-box">
            <div style="font-size:0.85rem;color:var(--c-muted)">Memuat soal...</div>
          </div>

          <!-- Skill Bar -->
          <div class="duel-skills-row" id="duel-skills-row">
            <button class="duel-skill-btn" data-skill="heal" title="Heal +25 HP (Biaya: 2 ⚡)">
              <span class="sk-icon">🩹</span><span class="sk-name">Sembuh</span><span class="sk-cost">2⚡</span>
            </button>
            <button class="duel-skill-btn" data-skill="shield" title="Perisai +20 (Biaya: 2 ⚡)">
              <span class="sk-icon">🛡️</span><span class="sk-name">Perisai</span><span class="sk-cost">2⚡</span>
            </button>
            <button class="duel-skill-btn" data-skill="power_strike" title="Power Strike 2x Damage (Biaya: 2 ⚡)">
              <span class="sk-icon">⚡</span><span class="sk-name">Kritis</span><span class="sk-cost">2⚡</span>
            </button>
            <button class="duel-skill-btn" data-skill="eliminate_one" title="Coret 1 Pilihan Salah (Biaya: 1 ⚡)">
              <span class="sk-icon">🎯</span><span class="sk-name">Coret</span><span class="sk-cost">1⚡</span>
            </button>
            <button class="duel-skill-btn" data-skill="lucky_pouch" title="Kantung Koin +5 (Biaya: 1 ⚡)">
              <span class="sk-icon">💰</span><span class="sk-name">Koin</span><span class="sk-cost">1⚡</span>
            </button>
          </div>

          <!-- Bottom controls -->
          <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center">
            <button class="btn ghost small" id="btn-duel-forfeit" style="color:#f87171">🏳️ Menyerah</button>
            <div style="font-size:0.75rem;color:var(--c-muted)">Realtime Polling · No Lag</div>
          </div>
        </div>
      `;

      attachSkillEvents();
      updateCountdown();

      const btnFf = document.getElementById('btn-duel-forfeit');
      if (btnFf) {
        btnFf.onclick = async () => {
          if (!confirm('Yakin ingin menyerah dari duel ini?')) return;
          try {
            await window.API.req(`/api/duels/${currentDuelId}/forfeit`, { method: 'POST' });
            pollState();
          } catch (e) {
            if (window.toast) window.toast('Gagal menyerah');
          }
        };
      }
    }

    startCountdown();

    // Load question if index changed
    const targetQIdx = s.question?.orderIndex ?? 0;
    if (currentLoadedQ !== targetQIdx) {
      loadQuestion(targetQIdx);
    }
  }

  async function loadQuestion(idx) {
    currentLoadedQ = idx;
    eliminatedOpts = [];
    isSubmitting = false;

    const qBox = document.getElementById('duel-question-container');
    if (!qBox) return;

    qBox.innerHTML = '<div style="font-size:0.85rem;color:var(--c-muted)">Memuat soal #' + (idx + 1) + '...</div>';

    try {
      const qData = await window.API.req(`/api/duels/${currentDuelId}/question/${idx}`);
      if (!qData || !qData.options) {
        qBox.innerHTML = '<div style="font-size:0.85rem;color:var(--c-muted)">Menunggu soal berikutnya...</div>';
        return;
      }

      const optsHtml = qData.options.map((optText, i) => `
        <button class="duel-opt-btn" data-idx="${i}">
          <span class="opt-key">${['A', 'B', 'C', 'D'][i] || i + 1}</span>
          <span class="opt-label">${esc(optText)}</span>
        </button>
      `).join('');

      qBox.innerHTML = `
        <div class="duel-q-header">
          <span class="q-order-badge">Soal #${idx + 1}</span>
        </div>
        <div class="duel-q-text">${esc(qData.text)}</div>
        <div class="duel-options-grid">${optsHtml}</div>
      `;

      qBox.querySelectorAll('.duel-opt-btn').forEach(btn => {
        btn.onclick = async () => {
          if (isSubmitting) return;
          const chosenIndex = Number(btn.getAttribute('data-idx'));
          isSubmitting = true;

          btn.classList.add('selected');

          try {
            const startT = performance.now();
            const ansRes = await window.API.req(`/api/duels/${currentDuelId}/answer`, {
              method: 'POST',
              body: JSON.stringify({
                orderIndex: idx,
                chosenIndex,
                elapsedMs: Math.round(performance.now() - startT)
              })
            });

            if (ansRes.isCorrect) {
              btn.classList.add('correct');
              if (window.Sfx) Sfx.play('correct');
            } else {
              btn.classList.add('wrong');
              if (window.Sfx) Sfx.play('wrong');
            }

            setTimeout(() => {
              pollState();
            }, 500);
          } catch (e) {
            isSubmitting = false;
            if (window.toast) window.toast(e.message || 'Gagal mengirim jawaban');
          }
        };
      });
    } catch (e) {
      qBox.innerHTML = '<div style="font-size:0.85rem;color:#f87171">Gagal memuat soal</div>';
    }
  }

  function attachSkillEvents() {
    document.querySelectorAll('.duel-skill-btn').forEach(b => {
      b.onclick = async () => {
        const skillId = b.getAttribute('data-skill');
        if (skillId === 'eliminate_one') {
          // Eliminate one option locally
          const optBtns = Array.from(document.querySelectorAll('.duel-opt-btn:not(.eliminated):not(.selected)'));
          if (optBtns.length > 2) {
            const toEliminate = optBtns[Math.floor(Math.random() * optBtns.length)];
            toEliminate.classList.add('eliminated');
            toEliminate.disabled = true;
          }
        }

        try {
          const res = await window.API.req(`/api/duels/${currentDuelId}/skill`, {
            method: 'POST',
            body: JSON.stringify({ skillId, skillLv: 1, orderIndex: currentLoadedQ || 0 })
          });
          if (res.code === 'OK') {
            if (window.toast) window.toast(`Skill ${skillId} berhasil digunakan!`);
            pollState();
          }
        } catch (e) {
          if (window.toast) window.toast(e.message || 'Gagal menggunakan skill');
        }
      };
    });
  }

  function renderFinishedModal(s) {
    const existing = document.getElementById('duel-result-modal');
    if (existing) return;

    const myId = window.Player?.data?.id;
    const isWinner = (s.winnerId === myId);
    const isDraw = (s.winnerId === null);

    let title = '🏆 KAMU MENANG!';
    let titleClass = 'win';
    let rewardCoins = 15;
    let rewardXp = 10;

    if (isDraw) {
      title = '🤝 HASIL SERI!';
      titleClass = 'draw';
      rewardCoins = 8;
      rewardXp = 6;
    } else if (!isWinner) {
      title = '💀 KAMU KALAH!';
      titleClass = 'lose';
      rewardCoins = 5;
      rewardXp = 4;
    }

    const modal = document.createElement('div');
    modal.id = 'duel-result-modal';
    modal.className = 'duel-modal-overlay';
    modal.innerHTML = `
      <div class="duel-result-card ${titleClass}">
        <h2 style="margin:0 0 8px 0;font-size:1.6rem">${title}</h2>
        <div style="font-size:0.85rem;color:var(--c-muted);margin-bottom:14px">Alasan: <strong>${esc(s.endReason || 'KO')}</strong></div>

        <div class="duel-reward-box">
          <div class="reward-title">Hadiah Duel:</div>
          <div class="reward-pills">
            <span class="pill coin">🪙 +${rewardCoins} Koin</span>
            <span class="pill xp">⭐ +${rewardXp} XP</span>
          </div>
        </div>

        <button class="btn primary" id="btn-duel-finish-home" style="margin-top:16px;width:100%">Kembali ke Beranda</button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('btn-duel-finish-home').onclick = () => {
      modal.remove();
      window.go('home');
    };
  }

  // Register Screen
  window.Screens = window.Screens || {};
  window.Screens.duel = {
    render(app, params) {
      stopAllTimers();
      serverOffset = 0;
      currentDuelId = params?.duelId;
      currentState = null;
      currentLoadedQ = null;
      eliminatedOpts = [];
      isSubmitting = false;

      app.innerHTML = `
        <section class="screen active stack duel-screen-root">
          <div id="duel-app-view" style="width:100%;display:flex;justify-content:center;align-items:center;min-height:75vh">
            <div style="font-size:0.9rem;color:var(--c-muted)">Memuat status duel...</div>
          </div>
        </section>
      `;

      // Initial state fetch
      pollState();

      // Poll interval: 2 seconds
      pollTimer = setInterval(pollState, 2000);

      // Reconnect heartbeat every 15 seconds
      heartbeatTimer = setInterval(() => {
        if (currentDuelId) {
          window.API.req(`/api/duels/${currentDuelId}/reconnect`, { method: 'POST' }).catch(() => {});
        }
      }, 15000);
    },

    destroy() {
      stopAllTimers();
      const ov = document.getElementById('duel-paused-overlay');
      if (ov) ov.remove();
      const md = document.getElementById('duel-result-modal');
      if (md) md.remove();
    }
  };
})();
