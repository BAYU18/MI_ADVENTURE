(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CampaignConfig = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CAMPAIGN = Object.freeze({
    chapters: 5,
    nodesPerChapter: 4,
    questions: Object.freeze([8, 8, 10, 12]),
    nodeFirstClearCoins: (chapter) => 20 + 10 * chapter,
    chapterItemRarity: Object.freeze({ RARE: 55, EPIC: 35, LEGENDARY: 10 }),
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

  function parseNodeKey(nodeKey) {
    const m = String(nodeKey || '').match(/^s(\w+)-c(\d+)-n(\d+)$/);
    if (!m) return null;
    return {
      subjectId: isNaN(Number(m[1])) ? m[1] : Number(m[1]),
      chapter: Number(m[2]),
      node: Number(m[3])
    };
  }

  function buildCampaign(subjectId, monsterTheme, progressMap = {}) {
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
        const qCount = CAMPAIGN.questions[n - 1] || 10;
        const tier = isBoss ? Math.min(5, c + 1) : Math.min(5, c);

        const prog = progressMap[key] || null;
        const stars = prog ? (prog.stars || 0) : 0;
        const bestAccuracy = prog ? (prog.best_accuracy || prog.bestAccuracy || 0) : 0;
        const cleared = stars >= 1;

        // Unlocked logic:
        // Node 1 in Chapter 1 is always unlocked.
        // Node n > 1 in Chapter c is unlocked if node n-1 is cleared.
        // Node 1 in Chapter c > 1 is unlocked if Chapter c-1 node 4 (Boss) was cleared.
        const unlocked = (c === 1 && n === 1) ? true : Boolean(previousNodeCleared);

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
          cleared
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
      chapters
    };
  }

  return {
    CAMPAIGN,
    getSubjectThemes,
    parseNodeKey,
    buildCampaign
  };
}));
