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
  const TIER_META = {
    common: { name: 'Common', icon: '⚪', color: '#94a3b8', skills: 1 },
    rare:   { name: 'Rare',   icon: '🔵', color: '#3b82f6', skills: 2 },
    epic:   { name: 'Epic',   icon: '🟣', color: '#a855f7', skills: 3 },
    legend: { name: 'Legend', icon: '🟡', color: '#f59e0b', skills: 4 }
  };

  function getMonsterTier(m) {
    if (m && m.tier) return m.tier;
    const idx = m && typeof m.id === 'number' ? ((m.id - 1) % 10) : 0;
    if (idx < 4) return 'common';
    if (idx < 7) return 'rare';
    if (idx < 9) return 'epic';
    return 'legend';
  }

  function resolveBossSkills() {
    if (typeof BossSkills !== 'undefined') return BossSkills;
    if (typeof globalThis !== 'undefined' && globalThis.BossSkills) return globalThis.BossSkills;
    if (typeof window !== 'undefined' && window.BossSkills) return window.BossSkills;
    if (typeof require === 'function') {
      try { return require('../../shared/bossskills.js'); } catch (_) {}
      try { return require('../shared/bossskills.js'); } catch (_) {}
    }
    return null;
  }

  function resolveMonsters() {
    if (typeof Monsters !== 'undefined') return Monsters;
    if (typeof globalThis !== 'undefined' && globalThis.Monsters) return globalThis.Monsters;
    if (typeof window !== 'undefined' && window.Monsters) return window.Monsters;
    if (typeof require === 'function') {
      try { return require('./monsters.js'); } catch (_) {}
      try { return require('../../shared/monsters.js'); } catch (_) {}
      try { return require('../shared/monsters.js'); } catch (_) {}
    }
    return null;
  }

  // list: array entry; progress: { 'fire:legend': {defeated,brutalDefeated} }; filter: { element, tier, owner, theme, search }
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
    const B = resolveBossSkills();
    const rows = list.filter((m) => {
      const mTier = getMonsterTier(m);
      if (f.tier && mTier !== f.tier) return false;
      if (f.element) {
        const elKey = (B && B.elementForTheme(m.theme)) || '';
        if (elKey !== f.element) return false;
      }
      if (f.theme && f.theme !== 'ALL' && m.theme !== f.theme) return false;
      const isKnown = Boolean(m.encountered || m.defeated || (m.encounters > 0) || (m.defeats > 0));
      const isDefeated = Boolean(m.defeated || (m.defeats > 0));
      if (f.owner === 'defeated' && !isDefeated) return false;
      if (f.owner === 'encountered' && !isKnown) return false;
      if (f.owner === 'unencountered' && isKnown) return false;
      if (f.search) {
        const q = f.search.toLowerCase().trim();
        const matchName = m.name && m.name.toLowerCase().includes(q);
        const matchId = String(m.id) === q || ('#' + m.id) === q;
        const matchTheme = m.theme && m.theme.toLowerCase().includes(q);
        const matchTier = mTier.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchTheme && !matchTier) return false;
      }
      return true;
    });

    if (!rows.length) return '<p class="dex-empty" data-testid="dex-empty" style="text-align:center;padding:30px;color:var(--c-muted)">Tidak ada monster untuk filter ini.</p>';
    return `<div class="dex-list" data-testid="dex-list">${rows.map((m) => renderMonsterCard(m, opts)).join('')}</div>`;
  }

  // m: monster dari Monsters.MONSTERS (1..100) + progress; opts: { brutal, tier, art }
  function renderMonsterCard(m, opts) {
    const o = opts || {};
    const brutal = Boolean(o.brutal);
    const mTier = getMonsterTier(m);
    const meta = TIER_META[mTier] || TIER_META.common;
    const isKnown = Boolean(m.encountered || m.defeated || (m.encounters > 0) || (m.defeats > 0));

    const B = resolveBossSkills();
    const elKey = (B && B.elementForTheme(m.theme)) || 'nature';
    const elInfo = (B && B.ELEMENTS[elKey]) || { name: 'Alam', icon: '🌿', color: '#22C55E', title: 'Roh Rimba' };

    // 4 Common (1 skill), 3 Rare (2 skill), 2 Epic (3 skill), 1 Legend (4 skill) dengan variasi unik per monster
    const monsterSkills = (B && B.skillsFor(elKey, mTier, m.id)) || [];
    const skillsToShow = monsterSkills.map(s => {
      const desc = B ? B.describeSkill(s, mTier, brutal) : s;
      return {
        id: s.id,
        name: s.name,
        icon: s.icon,
        text: desc.text || s.text || '',
        textBrutal: (B && B.describeSkill(s, mTier, true).text) || s.textBrutal || desc.text
      };
    });

    const MRenderer = resolveMonsters();
    const rawSvg = o.art
      ? o.art(m, mTier)
      : (MRenderer ? MRenderer.renderMonster(m, { size: 68, tier: mTier }) : `<div style="font-size:2.2rem;line-height:72px">${esc(elInfo.icon)}</div>`);

    let artHtml = '';
    if (isKnown) {
      artHtml = rawSvg;
    } else {
      // Siluet hitam karakter boss yang belum kebuka (Point 3)
      const silhouetteSvg = o.art
        ? o.art(m, 'common')
        : (MRenderer ? MRenderer.renderMonster(m, { size: 68, tier: 'common' }) : '🐲');
      artHtml = `<div class="monster-silhouette" title="Belum Ditemui" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;filter:brightness(0) drop-shadow(0 0 1px rgba(255,255,255,0.25));opacity:0.42;transform:scale(0.92);pointer-events:none">${silhouetteSvg}</div>`;
    }

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
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                  <span style="font-weight:800;font-size:0.95rem;color:${isKnown ? '#fff' : 'var(--c-muted)'};line-height:1.25">
                    ${isKnown ? esc(m.name) : `??? #${m.id}`}
                  </span>
                  <span class="chip" style="font-size:0.65rem;font-weight:800;color:${meta.color};padding:1px 6px;border-radius:999px;background:${meta.color}18;border:1px solid ${meta.color}55">
                    ${meta.icon} ${meta.name}
                  </span>
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
  return { renderCard, renderList, renderMonsterCard, renderMonsterList, getMonsterTier, TIER_META, CSS, esc };
});
