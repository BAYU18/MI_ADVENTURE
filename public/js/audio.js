// js/audio.js — SFX WebAudio + TTS Web Speech API (offline, tanpa file audio)
(function () {
  let ctx = null;
  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, { type = 'sine', gain = .18, when = 0, slideTo = null } = {}) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + when;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + .02);
  }

  const SFX = {
    tap:    () => tone(660, .07, { type: 'triangle', gain: .12 }),
    select: () => tone(440, .09, { type: 'triangle' }),
    correct() { tone(523, .12, { type: 'triangle' }); tone(659, .12, { type: 'triangle', when: .1 }); tone(784, .2, { type: 'triangle', when: .2 }); },
    wrong()  { tone(220, .25, { type: 'sawtooth', gain: .12, slideTo: 110 }); },
    catchM() { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, .12, { type: 'square', gain: .08, when: i * .08 })); },
    levelup() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .15, { type: 'triangle', when: i * .09 })); },
    win()  { [523, 523, 523, 659, 784, 1047].forEach((f, i) => tone(f, .18, { type: 'triangle', when: i * .13 })); },
    lose() { tone(300, .5, { type: 'sawtooth', gain: .1, slideTo: 80 }); },
  };

  // ---- TTS ----
  function canTTS() { return 'speechSynthesis' in window; }
  function speak(text, { lang = 'id-ID' } = {}) {
    if (!canTTS() || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).slice(0, 500));
      u.lang = lang; u.rate = .95; u.pitch = 1.1;
      window.speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }
  function stopSpeak() { if (canTTS()) try { window.speechSynthesis.cancel(); } catch (e) {} }

  window.Sfx = {
    play: (name) => { try { if (State.get().settings.sfx) SFX[name] && SFX[name](); } catch (e) {} },
    speak: (text, o) => { try { if (State.get().settings.tts) speak(text, o); } catch (e) {} },
    stopSpeak,
    _unlock: ac,
  };
})();
