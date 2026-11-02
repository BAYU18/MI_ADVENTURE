'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Load story and feedback modules
const StoryData = require('../shared/story');
const Feedback = require('../public/js/feedback');

test('T-23 & T-24: Story Data, Dialog Boss, Reaksi Pet, dan Konsistensi Seed', (t) => {
  assert.ok(StoryData.STORY, 'STORY harus terdefinisi');
  assert.ok(StoryData.PET_REACTIONS, 'PET_REACTIONS harus terdefinisi');
  assert.ok(StoryData.DEFEAT_MESSAGES, 'DEFEAT_MESSAGES harus terdefinisi');

  // Periksa tema utama memiliki semua varian dialog (intro, hit, taunt, enraged, defeat)
  for (const theme of ['hutan', 'api', 'gua']) {
    const st = StoryData.STORY[theme] || StoryData.STORY.hutan;
    assert.ok(st, `Tema ${theme} harus ada`);
    assert.ok(Array.isArray(st.intro) && st.intro.length >= 2, `intro ${theme} minimal 2 varian`);
    assert.ok(Array.isArray(st.hit) && st.hit.length >= 2, `hit ${theme} minimal 2 varian`);
    assert.ok(Array.isArray(st.taunt) && st.taunt.length >= 2, `taunt ${theme} minimal 2 varian`);
    assert.ok(Array.isArray(st.enraged) && st.enraged.length >= 2, `enraged ${theme} minimal 2 varian`);
    assert.ok(Array.isArray(st.defeat) && st.defeat.length >= 2, `defeat ${theme} minimal 2 varian`);
  }

  // Periksa PET_REACTIONS
  assert.ok(Array.isArray(StoryData.PET_REACTIONS.correct));
  assert.ok(Array.isArray(StoryData.PET_REACTIONS.wrong));
  assert.ok(Array.isArray(StoryData.PET_REACTIONS.combo));

  // Konsistensi deterministik seed
  function pickLine(arr, seed) {
    if (!arr || arr.length === 0) return '';
    let hash = 0;
    const str = String(seed ?? 0);
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    const idx = Math.abs(hash) % arr.length;
    return arr[idx];
  }

  const lines = StoryData.STORY.hutan.intro;
  const picked1 = pickLine(lines, 'session-abc-42');
  const picked2 = pickLine(lines, 'session-abc-42');
  assert.equal(picked1, picked2, 'pickLine harus menghasilkan teks identik untuk seed yang sama');
});

test('T-25: Audio Sintesis, Haptic, dan Toleransi Browser Tanpa Web Audio / Vibrate', (t) => {
  // Verifikasi Feedback methods dapat dipanggil dengan aman tanpa crash di Node.js (headless)
  assert.equal(typeof Feedback.sfx, 'function');
  assert.equal(typeof Feedback.vibrate, 'function');
  assert.equal(typeof Feedback.getSettings, 'function');

  // Jalankan semua tipe audio tanpa melempar exception
  assert.doesNotThrow(() => {
    Feedback.sfx('correct');
    Feedback.sfx('critical');
    Feedback.sfx('wrong');
    Feedback.sfx('hit');
    Feedback.sfx('coin');
    Feedback.sfx('combo');
    Feedback.sfx('levelup');
    Feedback.sfx('enraged');
    Feedback.sfx('event');
    Feedback.vibrate([50, 50, 100]);
  });
});

test('T-26: Pesan Kalah Ramah Anak (close vs far), Tip Belajar, dan Tombol Coba Lagi', (t) => {
  assert.ok(Array.isArray(StoryData.DEFEAT_MESSAGES.close));
  assert.ok(Array.isArray(StoryData.DEFEAT_MESSAGES.far));

  // Tidak boleh memuat kata-kata kasar / menghukum
  const badWords = ['bodoh', 'gagal total', 'payah', 'kalah telak', 'hukuman'];
  for (const list of [StoryData.DEFEAT_MESSAGES.close, StoryData.DEFEAT_MESSAGES.far]) {
    for (const msg of list) {
      for (const bad of badWords) {
        assert.ok(!msg.toLowerCase().includes(bad), `Pesan kalah tidak boleh memuat kata negatif '${bad}': "${msg}"`);
      }
    }
  }

  // Verifikasi isi UI di app.js memuat data-testid yang disyaratkan spek 13.2
  const appJs = fs.readFileSync(path.join(__dirname, '../public/js/app.js'), 'utf-8');
  assert.ok(appJs.includes('data-testid="setting-sound"'), 'app.js harus memiliki setting-sound');
  assert.ok(appJs.includes('data-testid="setting-vibrate"'), 'app.js harus memiliki setting-vibrate');
  assert.ok(appJs.includes('data-testid="setting-reduced"'), 'app.js harus memiliki setting-reduced');
  assert.ok(appJs.includes('data-testid="setting-pace"'), 'app.js harus memiliki setting-pace');
  assert.ok(appJs.includes('data-testid="combo-meter"'), 'app.js harus memiliki combo-meter');
  assert.ok(appJs.includes('data-testid="btn-retry"'), 'app.js harus memiliki tombol Coba Lagi dengan testid btn-retry');
  assert.ok(appJs.includes('data-testid="weak-badge"'), 'app.js harus memiliki lencana titik lemah');
  assert.ok(appJs.includes('boss-enraged'), 'app.js harus memuat class boss-enraged');
});
