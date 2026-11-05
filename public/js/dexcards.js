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
  // list: array entry; progress: { 'fire:legend': {defeated,brutalDefeated} }; filter: { element, tier, owner, theme }
  function renderList(list, progress, opts) {
    if (!list || !list.length) {
      return '<p class="dex-empty" data-testid="dex-empty" style="text-align:center;padding:30px;color:var(--c-muted)">Tidak ada monster untuk filter ini.</p>';
    }
    const f = (opts && opts.filter) || {};
    // If entries have 'skills' array, it's 40 dexEntries
    const isDexEntries = Array.isArray(list[0].skills);

    if (isDexEntries) {
      const rows = list.filter((e) => (!f.element || e.element === f.element) && (!f.tier || e.tier === f.tier));
      if (!rows.length) return '<p class="dex-empty" data-testid="dex-empty">Tidak ada monster untuk filter ini.</p>';
      return `<div class="dex-list" data-testid="dex-list">${rows.map((e) => renderCard(e, (progress || {})[e.id], opts)).join('')}</div>`;
    }

    // Otherwise, list is 100 monsters
    const B = typeof BossSkills !== 'undefined' ? BossSkills : (root.BossSkills || (typeof require === 'function' ? require('../shared/bossskills.js') : null));
    const rows = list.filter((m) => {
      if (f.element) {
        const elKey = (B && B.elementForTheme(m.theme)) || '';
        if (elKey !== f.element) return false;
      }
      if (f.theme && f.theme !== 'ALL' && m.theme !== f.theme) return false;
      const isKnown = Boolean(m.encountered || m.defeated || (m.encounters > 0) || (m.defeats > 0));
      if (f.owner === 'encountered' && !isKnown) return false;
      if (f.owner === 'unencountered' && isKnown) return false;
      return true;
    });

    if (!rows.length) return '<p class="dex-empty" data-testid="dex-empty" style="text-align:center;padding:30px;color:var(--c-muted)">Tidak ada monster untuk filter ini.</p>';
    return `<div class="dex-list" data-testid="dex-list">${rows.map((m) => renderMonsterCard(m, { ...opts, tier: f.tier || opts?.tier })).join('')}</div>`;
  }

  // m: monster dari Monsters.MONSTERS (1..100) + progress; opts: { brutal, tier, art }
  function renderMonsterCard(m, opts) {
    const o = opts || {};
    const brutal = Boolean(o.brutal);
    const tier = o.tier || 'all';
    const isKnown = Boolean(m.encountered || m.defeated || (m.encounters > 0) || (m.defeats > 0));

    const B = typeof BossSkills !== 'undefined' ? BossSkills : (root.BossSkills || (typeof require === 'function' ? require('../shared/bossskills.js') : null));
    const elKey = (B && B.elementForTheme(m.theme)) || 'nature';
    const elInfo = (B && B.ELEMENTS[elKey]) || { name: 'Alam', icon: '🌿', color: '#22C55E', title: 'Roh Rimba' };

    const skillCount = tier === 'common' ? 1 : (tier === 'rare' ? 2 : (tier === 'epic' ? 3 : 4));
    const allSkills = (B && B.skillsFor(elKey, 'legend')) || [];
    const skillsToShow = allSkills.slice(0, skillCount).map(s => {
      const desc = B ? B.describeSkill(s, tier === 'all' ? 'legend' : tier, brutal) : s;
      return {
        id: s.id,
        name: s.name,
        icon: s.icon,
        text: desc.text || s.text || '',
        textBrutal: (B && B.describeSkill(s, tier === 'all' ? 'legend' : tier, true).text) || s.textBrutal || desc.text
      };
    });

    const artHtml = isKnown
      ? (o.art ? o.art(m, tier === 'all' ? 'common' : tier) : `<div style="font-size:2.2rem;line-height:72px">${esc(elInfo.icon)}</div>`)
      : `<div style="font-size:2.4rem;line-height:72px;opacity:.25">❓</div>`;

    const statsText = isKnown
      ? `Ditemui: <b>${m.encounters || 0}×</b> · Kalah: <b>${m.defeats || 0}×</b>`
      : 'Temukan boss ini dalam petualangan';

    const starsHtml = isKnown && m.bestStars ? ` · <span style="color:#fbbf24">${'⭐'.repeat(m.bestStars)}</span>` : '';

    return `
      <div class="card item-card dex-card dex-monster-card" data-testid="dex-card-${esc(m.id)}" data-id="${esc(m.id)}" style="padding:12px;background:var(--c-surface);border-radius:var(--radius);border:1px solid ${isKnown ? 'var(--c-surface-strong)' : 'rgba(255,255,255,0.06)'};display:flex;flex-direction:column;gap:8px;margin-bottom:10px;${brutal ? 'border-color:rgba(220,38,38,0.5);background:linear-gradient(180deg,rgba(220,38,38,0.06),var(--c-surface));' : ''}">
        <div style="display:flex;gap:12px;align-items:flex-start">
          <!-- THUMBNAIL BOX (Skin-adapted) -->
          <div style="flex:0 0 72px;display:flex;flex-direction:column;align-items:center;gap:4px">
            <div class="skin-thumbnail-box" style="width:72px;height:72px;border-radius:14px;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;overflow:hidden;border:1px solid rgba(255,255,255,0.08);box-shadow:inset 0 2px 6px rgba(0,0,0,0.3)">
              ${artHtml}
            </div>
            <span style="font-size:0.68rem;font-weight:800;color:${esc(elInfo.color)};padding:2px 6px;border-radius:999px;background:color-mix(in srgb, ${esc(elInfo.color)} 18%, transparent);border:1px solid ${esc(elInfo.color)};margin-top:2px;display:flex;align-items:center;gap:3px">
              ${esc(elInfo.icon)} ${esc(elInfo.name)}
            </span>
          </div>

          <!-- MAIN INFO -->
          <div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
              <div>
                <div style="font-weight:800;font-size:0.95rem;color:${isKnown ? '#fff' : 'var(--c-muted)'};line-height:1.25">
                  ${isKnown ? esc(m.name) : `??? #${m.id}`}
                </div>
                <div style="font-size:0.75rem;color:var(--c-muted);margin-top:2px">
                  #${m.id} · ${esc(elInfo.title)}${starsHtml}
                </div>
              </div>
              ${isKnown ? `<span class="chip good" style="font-size:0.65rem;padding:2px 8px;flex:0 0 auto">✓ Ditemui</span>` : `<span class="chip" style="font-size:0.65rem;padding:2px 8px;color:var(--c-muted);flex:0 0 auto">🔒 Belum</span>`}
            </div>

            <!-- SKILLS BADGES (Skin passive style) -->
            <div style="display:flex;flex-direction:column;gap:4px;margin-top:4px">
              ${skillsToShow.map(sk => `
                <div class="dex-skill-row" data-testid="dex-skill-${esc(sk.id)}" style="font-size:0.75rem;font-weight:700;color:${brutal ? '#ef4444' : esc(elInfo.color)};background:color-mix(in srgb, ${brutal ? '#ef4444' : esc(elInfo.color)} 12%, transparent);padding:4px 8px;border-radius:6px;border:1px solid color-mix(in srgb, ${brutal ? '#ef4444' : esc(elInfo.color)} 28%, transparent);line-height:1.35;word-break:break-word">
                  <span>${esc(sk.icon)} <b>${esc(sk.name)}</b>: ${esc(brutal ? sk.textBrutal : sk.text)}</span>
                </div>
              `).join('')}
            </div>

            <!-- FOOTER STATS & ACTION -->
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);margin-top:2px">
              <div style="font-size:0.75rem;color:var(--c-muted)">
                ${statsText}
              </div>
              <div style="flex:0 0 auto">
                <button type="button" class="btn small ${isKnown ? 'primary' : 'ghost'} btn-view-monster" data-id="${esc(m.id)}" style="font-size:0.75rem;padding:4px 12px">
                  ${isKnown ? 'Detail Boss 👁️' : 'Terkunci 🔒'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderMonsterList(monsters, progress, opts) {
    if (!monsters || !monsters.length) {
      return '<p class="dex-empty" data-testid="dex-empty" style="text-align:center;padding:30px;color:var(--c-muted)">Tidak ada monster untuk filter ini.</p>';
    }
    return `<div class="dex-list" data-testid="dex-list">${monsters.map((m) => renderMonsterCard(m, opts)).join('')}</div>`;
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
  return { renderCard, renderList, renderMonsterCard, renderMonsterList, CSS, esc };
});
