(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CampaignConfig = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Menghitung batas waktu reset mingguan terakhir: Setiap hari Senin jam 07:00:00 WIB (00:00:00 UTC).
   * @param {Date} [now]
   * @returns {Date}
   */
  function getWeeklyResetTime(now = new Date()) {
    const d = new Date(now);
    const day = d.getUTCDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
    const diffDays = (day === 0 ? 6 : day - 1);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diffDays, 0, 0, 0, 0));
  }

  /**
   * Menghitung waktu reset mingguan berikutnya: Hari Senin jam 07:00:00 WIB (00:00:00 UTC) berikutnya.
   * @param {Date} [now]
   * @returns {Date}
   */
  function getNextWeeklyResetTime(now = new Date()) {
    const lastReset = getWeeklyResetTime(now);
    return new Date(lastReset.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  const CAMPAIGN = Object.freeze({
    chapters: 4,
    nodesPerChapter: 3,
    questions: Object.freeze([15, 20, 25]),
    nodeFirstClearCoins: (chapter) => 20 + 10 * chapter,
    chapterItemRarity: Object.freeze({ COMMON: 25, RARE: 15, EPIC: 10, LEGENDARY: 5, COINS: 45 }),
    defaultThemes: Object.freeze([
      'hutan', 'rawa', 'gua', 'es', 'api', 'laut', 'langit', 'hantu', 'mesin', 'manis'
    ]),
    themeTitles: Object.freeze({
      hutan: 'Hutan Mistis',
      rawa: 'Rawa Berbayang',
      gua: 'Gua Kristal',
      es: 'Puncak Es Abadi',
      api: 'Kawah Api Membara',
      laut: 'Samudra Dalam',
      langit: 'Kuil Cakrawala',
      hantu: 'Lembah Roh Gelap',
      mesin: 'Benteng Roda Besi',
      manis: 'Negeri Gulali Ajaib',
      gurun: 'Gurun Pasir Purba',
      lab: 'Laboratorium Ajaib',
      purba: 'Lembah Dinosaurus',
      angkasa: 'Cakrawala Kosmik'
    })
  });

  function getSubjectThemes(monsterTheme) {
    const list = [monsterTheme || 'hutan'];
    for (const t of CAMPAIGN.defaultThemes) {
      if (!list.includes(t)) list.push(t);
    }
    return list.slice(0, CAMPAIGN.chapters);
  }

  function parseNodeKey(nodeKey, fallbackSubjectId = null) {
    if (!nodeKey) return null;
    const str = String(nodeKey).trim();
    const m = str.match(/^s(\w+)-c(\d+)-n(\d+)$/i);
    if (m) {
      return {
        subjectId: isNaN(Number(m[1])) ? m[1] : Number(m[1]),
        chapter: Number(m[2]),
        node: Number(m[3])
      };
    }
    const alt = str.match(/^(?:s?(\w+)[-_])?c?(\d+)[-_]n?(\d+)$/i);
    if (alt) {
      const sId = alt[1] || fallbackSubjectId;
      return {
        subjectId: isNaN(Number(sId)) ? sId : Number(sId),
        chapter: Number(alt[2]),
        node: Number(alt[3])
      };
    }
    return null;
  }

  function buildCampaign(subjectId, monsterTheme, progressMap = {}, options = {}) {
    const weeklyResetDate = options.weeklyResetDate || getWeeklyResetTime();
    const weeklyResetIso = weeklyResetDate.toISOString();
    const nextResetDate = options.nextResetDate || getNextWeeklyResetTime(weeklyResetDate);
    const themes = getSubjectThemes(monsterTheme);
    const chapters = [];

    let previousChapterCleared = true;

    for (let c = 1; c <= CAMPAIGN.chapters; c++) {
      const theme = themes[c - 1] || 'hutan';
      const title = CAMPAIGN.themeTitles[theme] || ('Bab ' + c);
      const nodes = [];

      let previousNodeCleared = previousChapterCleared;

      for (let n = 1; n <= CAMPAIGN.nodesPerChapter; n++) {
        const key = `s${subjectId}-c${c}-n${n}`;
        const isBoss = (n === CAMPAIGN.nodesPerChapter);
        const qCount = CAMPAIGN.questions[n - 1] || 15;
        const tier = isBoss ? Math.min(4, c + 1) : Math.min(4, c);

        const prog = progressMap[key] || null;
        const clearedAtIso = prog ? (prog.cleared_at || prog.clearedAt || null) : null;
        // Hanya dianggap cleared jika diselesaikan pada minggu berjalan (setelah reset Senin 07:00 WIB)
        const clearedThisWeek = Boolean(clearedAtIso && clearedAtIso >= weeklyResetIso && (prog.stars >= 1));
        const stars = clearedThisWeek ? (prog.stars || 0) : 0;
        const bestAccuracy = clearedThisWeek ? (prog.best_accuracy || prog.bestAccuracy || 0) : 0;
        const cleared = clearedThisWeek;

        // Unlocked logic:
        // Node 1 in Chapter 1 is always unlocked.
        // Node n > 1 in Chapter c is unlocked if node n-1 is cleared this week.
        // Node 1 in Chapter c > 1 is unlocked if Chapter c-1 final node was cleared this week.
        const unlocked = (c === 1 && n === 1) ? true : Boolean(previousNodeCleared);

        // Hanya bisa dimainkan 1x per minggu: jika sudah clearedThisWeek, tidak bisa dimainkan lagi sampai reset Senin
        const canPlay = Boolean(unlocked && !clearedThisWeek);

        nodes.push({
          key,
          order: n,
          chapter: c,
          theme,
          title: isBoss ? `Boss ${title}` : `Wilayah ${n}`,
          isBoss,
          questionCount: qCount,
          tier,
          unlocked,
          stars,
          bestAccuracy,
          cleared,
          clearedThisWeek,
          canPlay
        });

        previousNodeCleared = cleared;
      }

      const chapterBossNode = nodes[nodes.length - 1];
      const completed = Boolean(chapterBossNode && chapterBossNode.cleared);
      previousChapterCleared = completed;

      chapters.push({
        n: c,
        theme,
        title,
        completed,
        nodes
      });
    }

    return {
      subjectId,
      chapters,
      weeklyReset: {
        lastReset: weeklyResetIso,
        nextReset: nextResetDate.toISOString(),
        info: 'Setiap wilayah mode cerita hanya bisa dimainkan 1× per minggu. Reset setiap hari Senin pukul 07:00 WIB.'
      }
    };
  }

  return {
    CAMPAIGN,
    getSubjectThemes,
    parseNodeKey,
    buildCampaign,
    getWeeklyResetTime,
    getNextWeeklyResetTime
  };
}));
