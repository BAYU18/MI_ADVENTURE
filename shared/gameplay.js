(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GameplayConfig = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TYPE_MIX = Object.freeze({
    MCQ: 0.60,
    TRUE_FALSE: 0.15,
    ORDERING: 0.10,
    MATCHING: 0.10,
    SHORT: 0.05
  });

  const TYPE_TIME_SEC = Object.freeze({
    MCQ: 15,
    TRUE_FALSE: 10,
    ORDERING: 25,
    MATCHING: 30,
    SHORT: 20
  });

  const BONUS = Object.freeze({
    chance: 0.15,
    maxPerSession: 2,
    coinMult: 2.0,
    dmgMult: 1.5
  });

  const MYSTERY = Object.freeze({
    chance: 0.10,
    maxPerSession: 1,
    drops: Object.freeze(['HEAL_15', 'ENERGY_1', 'COINS_8', 'DAMAGE_1_5'])
  });

  const BOSS_PHASES = Object.freeze({
    phase2HpPct: 0.50,
    moveEveryQ: 3,
    timeLimitMult: 0.9,
    bonusEnergy: 1,
    coinBonusPct: 15
  });

  const WEAK = Object.freeze({
    dmgMult: 2.0,
    maxHpPctCap: 0.35,
    minQuotaPct: 0.20,
    minQuotaCount: 2
  });

  const EVENTS = Object.freeze({
    chanceBetweenQ: 0.20,
    chance: 0.20,
    maxPerSession: 2,
    timeoutSec: 8,
    decisionTimeoutMs: 8000,
    types: Object.freeze(['TREASURE', 'MERCHANT', 'TRAP']),
    weights: Object.freeze({ TREASURE: 40, MERCHANT: 35, TRAP: 25 }),
    treasure: Object.freeze({
      coins: Object.freeze([5, 12]),
      outcomes: Object.freeze({ COINS: 50, ENERGY_1: 25, HEAL_10: 25 })
    }),
    merchant: Object.freeze({
      deals: Object.freeze([
        Object.freeze({ id: 'heal20', price: 10, effect: 'HEAL_20', title: '+20 HP', desc: 'Pulihkan 20 HP' }),
        Object.freeze({ id: 'energy2', price: 15, effect: 'ENERGY_2', title: '+2 ⚡ Semangat', desc: 'Tambah 2 Energi' }),
        Object.freeze({ id: 'freeEliminate', price: 12, effect: 'FREE_ELIMINATE_NEXT', title: '1× Coret Gratis', desc: 'Coret Satu gratis di soal berikutnya' })
      ]),
      offers: 2
    }),
    trap: Object.freeze({
      openWinChance: 0.5,
      winCoins: 12,
      loseHp: 8,
      minHpAfter: 1
    })
  });

  const SPACED = Object.freeze({
    boxes: Object.freeze([1, 3, 7, 14]),
    maxReviewQuotaPct: 0.30,
    bonusXp: 5
  });

  const PACE = Object.freeze({
    min: 0.8,
    max: 1.5,
    default: 1.0,
    increaseStep: 0.1,
    decreaseStep: 0.05
  });

  const CAMPAIGN = Object.freeze({
    chapters: 5,
    nodesPerChapter: 4,
    bossNode: 4
  });

  const REPORT = Object.freeze({
    weekStartsOn: 'MONDAY',
    tz: 'Asia/Jakarta',
    generateAt: '06:00',
    shareTtlDays: 7,
    maxActiveMinutesPerSession: 30
  });

  const SKILLBAR = Object.freeze({
    defaultHidden: false,
    toggleAnimMs: 150
  });

  const SKILL_REASON_TEXT = Object.freeze({
    NO_ENERGY: 'Energi ⚡ belum cukup!',
    NOT_APPLICABLE: 'Skill ini tidak dapat digunakan pada tipe soal ini.',
    NOT_OWNED: 'Skill belum terbuka atau belum dimiliki.',
    ALREADY_USED: 'Batas pemakaian skill ini sudah habis untuk soal/sesi ini.',
    WRONG_STATE: 'Tunggu giliran soal berikutnya ya!',
    EVENT_PENDING: 'Selesaikan kejutan dulu sebelum memakai skill!',
    NOT_IN_LOADOUT: 'Skill tidak dipasang pada slot aktifmu.',
    NOTHING_TO_ELIMINATE: 'Pilihan salah sudah habis dieliminasi!'
  });

  return {
    TYPE_MIX,
    TYPE_TIME_SEC,
    BONUS,
    MYSTERY,
    BOSS_PHASES,
    WEAK,
    EVENTS,
    SPACED,
    PACE,
    CAMPAIGN,
    REPORT,
    SKILLBAR,
    SKILL_REASON_TEXT
  };
}));
