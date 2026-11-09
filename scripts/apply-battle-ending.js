const fs = require("fs");
const path = require("path");

const appJsPath = "/home/maman/play/public/js/app.js";
let content = fs.readFileSync(appJsPath, "utf8");

// 1. Backup
fs.writeFileSync("/home/maman/play/public/js/app.js.bak-battle-ending", content, "utf8");

// 2. Definisi Screens.showBattleEndingSpectacularModal
const modalFuncCode = `
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

  modal.innerHTML = \`
    <!-- Confetti / Ember Particles Container -->
    <div class="confetti-container" style="position:absolute;inset:0;pointer-events:none;overflow:hidden">
      \${Array.from({ length: particlesCount }).map((_, i) => {
        const left = Math.random() * 100;
        const dur = isWin ? (1.5 + Math.random() * 1.5) : (1.6 + Math.random() * 1.4);
        const delay = Math.random() * 0.7;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = isWin ? (6 + Math.random() * 8) : (5 + Math.random() * 7);
        const anim = isWin ? 'confettiFall' : 'emberFloat';
        return \`<div style="position:absolute;top:\${isWin ? '-20px' : '90%'};left:\${left}%;width:\${size}px;height:\${size}px;background:\${color};border-radius:\${Math.random() > 0.4 ? '50%' : '2px'};box-shadow:0 0 8px \${color};animation:\${anim} \${dur}s ease-out \${delay}s infinite"></div>\`;
      }).join('')}
    </div>

    <!-- Main Card -->
    <div class="card" style="max-width:440px;width:100%;text-align:center;padding:26px 20px;border-radius:24px;background:linear-gradient(135deg, rgba(30,41,59,0.96), rgba(15,23,42,0.98));border:\${themeBorder};box-shadow:0 0 50px \${themeGlow}, 0 24px 48px rgba(0,0,0,0.85);position:relative;overflow:hidden;animation:itemPopIn 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards">
      
      <!-- Rotating radiant rays -->
      <div class="chest-rays" style="position:absolute;top:36%;left:50%;transform:translate(-50%,-50%);width:320px;height:320px;background:radial-gradient(circle, \${isWin ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.25)'} 0%, transparent 70%);border-radius:50%;pointer-events:none;animation:chestRaysSpin \${isWin ? '8s' : '10s'} linear infinite"></div>

      <div style="position:relative;z-index:2">
        <!-- Badge Atas -->
        <div style="display:inline-block;padding:4px 14px;border-radius:99px;background:\${badgeBg};border:1px solid \${badgeBorder};color:\${badgeColor};font-size:0.75rem;font-weight:900;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;box-shadow:0 0 15px \${themeGlow}">
          \${badgeText}
        </div>

        <!-- Center Animated Icon / Trophy / Shield -->
        <div style="margin:6px auto 14px auto;width:120px;height:120px;display:flex;align-items:center;justify-content:center;position:relative">
          \${isWin ? \`
            <div style="font-size:5.5rem;line-height:1;filter:drop-shadow(0 0 25px #f59e0b);animation:victoryBounce 2s ease-in-out infinite">
              🏆
            </div>
            <div style="position:absolute;top:-4px;right:4px;font-size:1.8rem;animation:pulseText 1.2s infinite">✨</div>
            <div style="position:absolute;bottom:0;left:6px;font-size:1.5rem;animation:pulseText 1.4s 0.3s infinite">⭐</div>
          \` : \`
            <div style="font-size:5.2rem;line-height:1;filter:drop-shadow(0 0 22px #f97316);animation:flamePulse 1.8s ease-in-out infinite">
              🛡️
            </div>
            <div style="position:absolute;bottom:4px;right:6px;font-size:2.2rem;animation:pulseText 1.2s infinite">🔥</div>
          \`}
        </div>

        <!-- Headline -->
        <h2 style="font-size:1.45rem;font-weight:900;color:#fff;margin:0 0 8px 0;text-shadow:0 2px 12px rgba(0,0,0,0.85);letter-spacing:0.5px">
          \${esc(headline)}
        </h2>

        <!-- Pujian / Semangat Quote -->
        <p style="font-size:0.88rem;color:\${isWin ? '#fef08a' : '#cbd5e1'};margin:0 auto 16px auto;max-width:360px;line-height:1.45;font-weight:600;text-shadow:0 1px 4px rgba(0,0,0,0.6)">
          "\${esc(quote)}"
        </p>

        <!-- Mini Stats & Feedback Info -->
        <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:10px 14px;margin-bottom:18px;display:flex;justify-content:space-around;align-items:center;font-size:0.8rem">
          <div style="text-align:center">
            <div style="color:var(--c-muted);font-size:0.72rem;margin-bottom:2px">Status Pertarungan</div>
            <strong style="color:\${isWin ? '#10b981' : '#f87171'};font-size:0.85rem">
              \${isWin ? '✅ Menang Mutlak' : '💔 Terkena Serangan'}
            </strong>
          </div>
          <div style="width:1px;height:24px;background:rgba(255,255,255,0.1)"></div>
          <div style="text-align:center">
            <div style="color:var(--c-muted);font-size:0.72rem;margin-bottom:2px">Soal Terjawab</div>
            <strong style="color:#fff;font-size:0.85rem">
              \${correctN} / \${totalN} Benar
            </strong>
          </div>
          <div style="width:1px;height:24px;background:rgba(255,255,255,0.1)"></div>
          <div style="text-align:center">
            <div style="color:var(--c-muted);font-size:0.72rem;margin-bottom:2px">Lawan</div>
            <strong style="color:#facc15;font-size:0.85rem">
              \${esc(enemyName)}
            </strong>
          </div>
        </div>

        <!-- Auto-Transition Countdown Bar -->
        <div style="display:flex;flex-direction:column;gap:6px;width:100%">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;color:#94a3b8;font-weight:700">
            <span style="color:\${isWin ? '#fef08a' : '#fdba74'};display:flex;align-items:center;gap:4px">
              <span>✨</span>
              <span>Membuka Rangkuman Review Hadiah...</span>
            </span>
            <span id="transition-timer-txt">2.5s</span>
          </div>

          <div style="height:6px;background:rgba(255,255,255,0.12);border-radius:99px;overflow:hidden">
            <div id="transition-fill-bar" style="width:100%;height:100%;background:\${isWin ? 'linear-gradient(90deg, #10b981, #f59e0b)' : 'linear-gradient(90deg, #ef4444, #f97316)'};border-radius:99px;transition:width 0.05s linear"></div>
          </div>

          <div style="font-size:0.72rem;color:#64748b;margin-top:2px">
            Sentuh layar di mana saja untuk langsung lanjut ➔
          </div>
        </div>
      </div>
    </div>
  \`;

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

    if (fillEl) fillEl.style.width = \`\${remainingPct}%\`;
    if (timerTxt) timerTxt.textContent = \`\${remainingSec}s\`;

    if (elapsed >= duration) {
      clearInterval(countdownTimer);
    }
  }, 50);

  autoFinishTimeout = setTimeout(triggerComplete, duration);
};
`;

// 3. Sisipkan modalFuncCode sebelum Screens.showChapterChestModal
const chestAnchor = "Screens.showChapterChestModal = function";
if (!content.includes("Screens.showBattleEndingSpectacularModal")) {
  if (content.includes(chestAnchor)) {
    content = content.replace(chestAnchor, modalFuncCode + "\n\n" + chestAnchor);
    console.log("Injected Screens.showBattleEndingSpectacularModal");
  } else {
    throw new Error("Could not find Screens.showChapterChestModal anchor");
  }
}

// 4. Tambahkan method showEndingModal di Screens.battle
const enragedAnchor = "showEnragedBanner(bossName) {";
const showEndingMethod = `
  showEndingModal(isWin, s, res, onComplete) {
    if (typeof Screens.showBattleEndingSpectacularModal === 'function') {
      Screens.showBattleEndingSpectacularModal({ isWin, session: s, res, onComplete });
    } else {
      onComplete();
    }
  },
`;
if (!content.includes("showEndingModal(isWin, s, res, onComplete)")) {
  if (content.includes(enragedAnchor)) {
    content = content.replace(enragedAnchor, showEndingMethod + "\n  " + enragedAnchor);
    console.log("Injected Screens.battle.showEndingModal");
  } else {
    throw new Error("Could not find enragedAnchor");
  }
}

// 5. Tambahkan trigger otomatis di Screens.battle.renderCurrentQuestion
// Cari trigger auto next
const autoNextTarget = "if (canAutoNext) {";
const autoNextReplacement = `
    if (isOver) {
      setTimeout(() => {
        this.showEndingModal(isWin, s, res, () => goNext());
      }, 480);
    }

    if (canAutoNext) {`;

if (!content.includes("this.showEndingModal(isWin, s, res, () => goNext())")) {
  if (content.includes(autoNextTarget)) {
    content = content.replace(autoNextTarget, autoNextReplacement);
    console.log("Injected auto-transition trigger in renderCurrentQuestion");
  } else {
    throw new Error("Could not find autoNextTarget");
  }
}

fs.writeFileSync(appJsPath, content, "utf8");
console.log("Successfully updated /home/maman/play/public/js/app.js");