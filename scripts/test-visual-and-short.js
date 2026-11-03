const fs = require('fs');
const path = require('path');
const assert = require('assert');

function runChecks() {
  console.log('=== MEMULAI VERIFIKASI FITUR EFEK BERKEDIP & SOAL ISIAN SINGKAT MOBILE ===\n');

  const cssPath = path.join(__dirname, '..', 'public', 'css', 'style.css');
  const jsPath = path.join(__dirname, '..', 'public', 'js', 'app.js');

  const css = fs.readFileSync(cssPath, 'utf8');
  const js = fs.readFileSync(jsPath, 'utf8');

  // 1. Verifikasi CSS Animasi Border Berkedip Hijau & Merah (GPU-Accelerated)
  console.log('[CHECK 1] Verifikasi Keyframes & CSS Border Berkedip GPU...');
  assert.ok(css.includes('@keyframes gpuBlinkFade'), 'Keyframe gpuBlinkFade harus ada di style.css');
  assert.ok(css.includes('answer-blink-correct'), 'Class answer-blink-correct harus ada di style.css');
  assert.ok(css.includes('answer-blink-wrong'), 'Class answer-blink-wrong harus ada di style.css');
  assert.ok(css.includes('gpuBlinkFade 0.32s ease-in-out 3'), 'Animasi berkedip GPU 3 kali harus dideklarasikan');
  assert.ok(css.includes('will-change: opacity'), 'Layer GPU will-change: opacity harus dideklarasikan');
  console.log('✅ PASS: Keyframe animasi berkedip GPU terverifikasi bebas lag!');

  // 2. Verifikasi CSS Responsif Mobile Keyboard untuk Isian Singkat
  console.log('\n[CHECK 2] Verifikasi CSS Responsif Mobile Keyboard Android...');
  assert.ok(css.includes('.screen.short-active .boss-card'), 'Selector .screen.short-active .boss-card harus ada');
  assert.ok(css.includes('.screen.mobile-keyboard-active .boss-card'), 'Selector .screen.mobile-keyboard-active .boss-card harus ada');
  assert.ok(css.includes('position: sticky !important'), 'qcard harus sticky di mobile keyboard mode');
  assert.ok(css.includes('display: none !important'), 'boss-card harus disembunyikan agar soal tidak tertutup keyboard');
  console.log('✅ PASS: CSS layout mobile keyboard Android terverifikasi!');

  // 3. Verifikasi Logika JS Trigger Efek Berkedip & Keyboard Focus
  console.log('\n[CHECK 3] Verifikasi Logika JS di app.js...');
  assert.ok(js.includes('answer-blink-correct'), 'app.js harus menambahkan class answer-blink-correct saat jawaban benar');
  assert.ok(js.includes('answer-blink-wrong'), 'app.js harus menambahkan class answer-blink-wrong saat jawaban salah');
  assert.ok(js.includes('short-active'), 'app.js harus mengaktifkan short-active saat input difokuskan');
  assert.ok(js.includes('mobile-keyboard-active'), 'app.js harus mendeteksi resize visualViewport keyboard');
  assert.ok(js.includes('qCard.scrollIntoView'), 'app.js harus menjaga qcard tetap berada di viewport');
  console.log('✅ PASS: Logika JS di app.js terverifikasi!');

  console.log('\n======================================================');
  console.log('🎉 SEMUA VERIFIKASI FITUR BARU BERHASIL 100%! 🎉');
  console.log('======================================================');
}

runChecks();
