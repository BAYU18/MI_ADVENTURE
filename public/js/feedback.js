// Feedback Audio Synth & Haptic API - Petualangan Pelajar v5.2
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Feedback = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let audioCtx = null;

  function getAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function getSettings() {
    if (typeof window === 'undefined') {
      return { sound: true, vibrate: true, reducedMotion: false };
    }
    if (window.GameSettings) return window.GameSettings;
    try {
      const saved = localStorage.getItem('game_settings');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return { sound: true, vibrate: true, reducedMotion: false };
  }

  function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.15) {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  }

  function playMelody(notes, noteDuration = 0.1, gainVal = 0.15) {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      let t = ctx.currentTime;
      for (const [freq, type] of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(gainVal, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + noteDuration);
        t += noteDuration;
      }
    } catch (_) {}
  }

  function vibrate(pattern) {
    const s = getSettings();
    if (!s.vibrate) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch (_) {}
    }
  }

  function sfx(name) {
    const s = getSettings();
    if (!s.sound) return;

    switch (name) {
      case 'correct':
        playMelody([[523.25, 'triangle'], [659.25, 'triangle'], [783.99, 'sine']], 0.12, 0.2);
        vibrate(40);
        break;

      case 'critical':
        playMelody([[523.25, 'square'], [659.25, 'square'], [1046.50, 'triangle']], 0.15, 0.25);
        vibrate([50, 40, 80]);
        break;

      case 'wrong':
        playMelody([[329.63, 'sawtooth'], [261.63, 'sawtooth']], 0.18, 0.2);
        vibrate([100, 50, 100]);
        break;

      case 'hit':
        playTone(180, 'square', 0.2, 0.25);
        vibrate(60);
        break;

      case 'coin':
        playMelody([[987.77, 'sine'], [1318.51, 'sine']], 0.08, 0.15);
        vibrate(30);
        break;

      case 'combo':
        playMelody([[440, 'triangle'], [554.37, 'triangle'], [659.25, 'sine'], [880, 'sine']], 0.1, 0.2);
        vibrate([40, 30, 40]);
        break;

      case 'levelup':
        playMelody([
          [523.25, 'triangle'],
          [659.25, 'triangle'],
          [783.99, 'triangle'],
          [1046.50, 'sine']
        ], 0.14, 0.25);
        vibrate([60, 40, 60, 40, 120]);
        break;

      case 'enraged':
        playMelody([[220, 'sawtooth'], [196, 'sawtooth'], [164.81, 'sawtooth']], 0.25, 0.3);
        vibrate([120, 80, 200]);
        break;

      case 'event':
        playMelody([[659.25, 'sine'], [880, 'sine'], [1108.73, 'triangle']], 0.15, 0.2);
        vibrate(80);
        break;

      default:
        playTone(440, 'sine', 0.1, 0.1);
        break;
    }
  }

  return {
    getAudioContext,
    sfx,
    vibrate,
    getSettings
  };
}));
