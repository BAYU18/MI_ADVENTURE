/* public/js/dexcards.js — kartu Monster Dex: SATU kartu per BARIS (lebar penuh) agar deskripsi & skill terbaca utuh, seperti kartu skin.
   Murni pembangun string HTML (bisa diuji di Node). Seni monster disuntik lewat opsi `art(entry)` → string SVG dari monsters.js. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DexCards = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TIER_ICON = { common: '⚪', rare: '🔵', epic: '🟣', legend: '🟡' };
  // entry: dari BossSkills.dexEntries(); prog: { defeated, brutalDefeated } | undefined; opts: { brutal, art(entry) }
  function renderCard(entry, prog, opts) {
    const o = opts || {}; const p = prog || {}; const brutal = !!o.brutal;
    const skills = entry.skills.map((s) => `
      <li class="dex-skill" data-testid="dex-skill-${esc(s.id)}">
        <span class="dex-skill-ico" aria-hidden="true">${esc(s.icon)}</span>
        <div class="dex-skill-body"><b class="dex-skill-name">${esc(s.name)}</b><p class="dex-skill-text">${esc(brutal ? s.textBrutal : s.text)}</p></div>
      </li>`).join('');
    const stats = `Dikalahkan ${p.defeated | 0}× · Mode Brutal ${p.brutalDefeated | 0}×`;
    return `
    <article class="dex-card dex-tier-${esc(entry.tier)}${brutal ? ' dex-brutal' : ''}" style="--el:${esc(entry.color)}" data-testid="dex-card-${esc(entry.id)}">
      <header class="dex-head">
        <div class="dex-art" aria-hidden="true">${o.art ? o.art(entry) : esc(entry.icon)}</div>
        <div class="dex-title">
          <h3 class="dex-name">${esc(entry.title)}</h3>
          <div class="dex-badges"><span class="dex-badge dex-el">${esc(entry.icon)} ${esc(entry.elementName)}</span><span class="dex-badge dex-tier">${TIER_ICON[entry.tier] || ''} ${esc(entry.tierLabel)}</span>${brutal ? '<span class="dex-badge dex-brutal-badge">💀 Brutal ×2</span>' : ''}</div>
          <div class="dex-stats">${esc(stats)}</div>
        </div>
      </header>
      <p class="dex-desc">${esc(entry.description)}</p>
      <h4 class="dex-sub">Skill boss (${entry.skills.length})</h4>
      <ul class="dex-skills">${skills}
      </ul>
    </article>`;
  }
  // list: array entry; progress: { 'fire:legend': {defeated,brutalDefeated} }; filter: { element, tier }
  function renderList(list, progress, opts) {
    const f = (opts && opts.filter) || {};
    const rows = list.filter((e) => (!f.element || e.element === f.element) && (!f.tier || e.tier === f.tier));
    if (!rows.length) return '<p class="dex-empty" data-testid="dex-empty">Tidak ada monster untuk filter ini.</p>';
    return `<div class="dex-list" data-testid="dex-list">${rows.map((e) => renderCard(e, (progress || {})[e.id], opts)).join('')}</div>`;
  }
  const CSS = `
.dex-list{display:grid;grid-template-columns:1fr;gap:12px}              /* SELALU 1 kolom: 1 baris = 1 kartu, juga di layar lebar */
.dex-card{width:100%;box-sizing:border-box;padding:14px;border-radius:16px;border:2px solid var(--el);background:var(--card-bg,#fff);color:var(--text,#1f2937);overflow:visible}
.dex-head{display:flex;gap:12px;align-items:center}
.dex-art{flex:0 0 76px;width:76px;height:76px}.dex-art svg{width:100%;height:100%}
.dex-title{min-width:0;flex:1}
.dex-name{margin:0;font-size:1.05rem;line-height:1.25;overflow-wrap:anywhere}
.dex-badges{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 2px}
.dex-badge{font-size:.8rem;font-weight:700;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--el) 18%,transparent);border:1px solid var(--el)}
.dex-stats{font-size:.8rem;opacity:.8}
.dex-desc{margin:10px 0 6px;font-size:.95rem;line-height:1.5;overflow-wrap:anywhere}      /* teks tampil UTUH: tidak ada pemotongan baris */
.dex-sub{margin:10px 0 6px;font-size:.9rem}
.dex-skills{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.dex-skill{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border-radius:12px;background:color-mix(in srgb,var(--el) 8%,transparent)}
.dex-skill-ico{flex:0 0 28px;font-size:1.3rem;line-height:1.2;text-align:center}
.dex-skill-body{min-width:0;flex:1}.dex-skill-name{font-size:.95rem}
.dex-skill-text{margin:2px 0 0;font-size:.9rem;line-height:1.45;overflow-wrap:anywhere}
.dex-tier-rare{box-shadow:0 0 0 2px #3B82F633}.dex-tier-epic{box-shadow:0 0 12px #A855F755}.dex-tier-legend{box-shadow:0 0 16px #F59E0B88}
.dex-brutal{border-color:#DC2626;background:linear-gradient(180deg,#fee2e2 0,var(--card-bg,#fff) 40%)}
.dex-brutal-badge{background:#DC2626;color:#fff;border-color:#DC2626}
@media (prefers-reduced-motion:no-preference){.dex-tier-legend{animation:dexGlow 2.4s ease-in-out infinite alternate}}
@keyframes dexGlow{from{box-shadow:0 0 8px #F59E0B55}to{box-shadow:0 0 18px #F59E0Bcc}}`;
  return { renderCard, renderList, CSS, esc };
});
