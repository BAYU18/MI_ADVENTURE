/**
 * shared/pet-art.js - Koleksi Seni Vektor SVG Orisinal untuk Seluruh Pet (35 Pet)
 * Mengusung gaya 3D Shiny Chibi Artistik per Rarity Tier (Common, Rare, Epic, Legendary).
 * Kompatibel ganda: Node.js (CommonJS) & Browser (UMD).
 */
(function(root) {
  'use strict';

  const PET_ART = {
    pet_hamster: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fde7b0"/>
<stop offset="0.5" stop-color="#f2b24a"/>
<stop offset="1" stop-color="#a8591a"/>
</radialGradient>
<radialGradient id="cap-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#e8913a"/>
<stop offset="0.5" stop-color="#c26a1c"/>
<stop offset="1" stop-color="#7c3a0e"/>
</radialGradient>
<radialGradient id="cr-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#fff1d9"/>
<stop offset="1" stop-color="#f3cf9e"/>
</radialGradient>
<radialGradient id="pk-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fecdd3"/>
<stop offset="0.5" stop-color="#fda4af"/>
<stop offset="1" stop-color="#e11d48"/>
</radialGradient>
<radialGradient id="coin-${uid}" cx="0.35" cy="0.3" r="0.9">
<stop offset="0" stop-color="#fff7b0"/>
<stop offset="0.5" stop-color="#facc15"/>
<stop offset="1" stop-color="#b45309"/>
</radialGradient>
</defs>
<ellipse cx="32" cy="58.5" rx="19" ry="3.6" fill="url(#sh-${uid})"/>
<ellipse cx="24" cy="57" rx="4.8" ry="2.2" fill="url(#pk-${uid})"/>
<ellipse cx="40" cy="57" rx="4.8" ry="2.2" fill="url(#pk-${uid})"/>
<circle cx="17" cy="21" r="6.5" fill="url(#b-${uid})"/>
<circle cx="17" cy="22" r="3.6" fill="url(#pk-${uid})"/>
<circle cx="47" cy="21" r="6.5" fill="url(#b-${uid})"/>
<circle cx="47" cy="22" r="3.6" fill="url(#pk-${uid})"/>
<ellipse cx="32" cy="38" rx="20.5" ry="18.5" fill="url(#b-${uid})"/>
<path d="M14.5 30Q17 13.5 32 13.5Q47 13.5 49.5 30Q41 21.5 32 22.5Q23 21.5 14.5 30Z" fill="url(#cap-${uid})"/>
<ellipse cx="32" cy="42" rx="16" ry="12.5" fill="url(#cr-${uid})"/>
<circle cx="20" cy="42" r="6.6" fill="url(#cr-${uid})"/>
<circle cx="44" cy="42" r="6.6" fill="url(#cr-${uid})"/>
<ellipse cx="19" cy="43.5" rx="3.2" ry="2" fill="#fb7185" opacity="0.45"/>
<ellipse cx="45" cy="43.5" rx="3.2" ry="2" fill="#fb7185" opacity="0.45"/>
<ellipse cx="25" cy="34" rx="2.4" ry="2.9" fill="#1e293b"/>
<circle cx="24.16" cy="32.9" r="1.08" fill="#fff"/>
<circle cx="25.96" cy="35.16" r="0.48" fill="#fff" opacity=".85"/>
<ellipse cx="39" cy="34" rx="2.4" ry="2.9" fill="#1e293b"/>
<circle cx="38.16" cy="32.9" r="1.08" fill="#fff"/>
<circle cx="39.96" cy="35.16" r="0.48" fill="#fff" opacity=".85"/>
<ellipse cx="32" cy="38.4" rx="2.1" ry="1.6" fill="#fb7185"/>
<ellipse cx="31.4" cy="37.8" rx=".8" ry=".5" fill="#fff" opacity=".8"/>
<path d="M32 40V41.6M32 41.6Q29.6 44.2 27.6 42.4M32 41.6Q34.4 44.2 36.4 42.4" fill="none" stroke="#7c2d12" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="30.7" y="41.7" width="2.6" height="2.3" rx=".7" fill="#fff"/>
<circle cx="32" cy="52.5" r="6.4" fill="url(#coin-${uid})" stroke="#92400e" stroke-width=".8"/>
<circle cx="32" cy="52.5" r="4.2" fill="none" stroke="#fde68a" stroke-width=".7"/>
<polygon points="32,49.6 33,51.8 35.3,52 33.6,53.5 34.1,55.7 32,54.5 29.9,55.7 30.4,53.5 28.7,52 31,51.8" fill="#fff7b0" opacity=".95"/>
<ellipse cx="25.3" cy="50.8" rx="3.1" ry="2.5" fill="url(#cr-${uid})"/>
<ellipse cx="38.7" cy="50.8" rx="3.1" ry="2.5" fill="url(#cr-${uid})"/>
<ellipse cx="26" cy="20" rx="7.5" ry="3.4" transform="rotate(-25 26 20)" fill="url(#gl-${uid})" opacity="1"/>
<g transform="translate(51 14) scale(0.7)">
<path class="pfx-twinkle" fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_rabbit: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#e1e8f5"/>
<stop offset="1" stop-color="#8d9bb8"/>
</radialGradient>
<radialGradient id="pk-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffe1ec"/>
<stop offset="0.5" stop-color="#fbb1cb"/>
<stop offset="1" stop-color="#e0527f"/>
</radialGradient>
<linearGradient id="car-${uid}" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#fdba74"/>
<stop offset="0.5" stop-color="#f97316"/>
<stop offset="1" stop-color="#c2410c"/>
</linearGradient>
<radialGradient id="lf-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#bbf7d0"/>
<stop offset="0.5" stop-color="#4ade80"/>
<stop offset="1" stop-color="#15803d"/>
</radialGradient>
</defs>
<ellipse cx="32" cy="58.5" rx="19" ry="3.6" fill="url(#sh-${uid})"/>
<ellipse cx="23" cy="14" rx="5.3" ry="13.2" transform="rotate(-8 23 14)" fill="url(#b-${uid})"/>
<ellipse cx="23" cy="15" rx="2.6" ry="9.6" transform="rotate(-8 23 14)" fill="url(#pk-${uid})"/>
<ellipse cx="41" cy="14" rx="5.3" ry="13.2" transform="rotate(8 41 14)" fill="url(#b-${uid})"/>
<ellipse cx="41" cy="15" rx="2.6" ry="9.6" transform="rotate(8 41 14)" fill="url(#pk-${uid})"/>
<ellipse cx="22" cy="58" rx="6" ry="3" fill="url(#b-${uid})"/>
<ellipse cx="42" cy="58" rx="6" ry="3" fill="url(#b-${uid})"/>
<ellipse cx="32" cy="46" rx="15.5" ry="13" fill="url(#b-${uid})"/>
<ellipse cx="32" cy="50.5" rx="9" ry="8" fill="#fff" opacity=".85"/>
<ellipse cx="32" cy="33" rx="16" ry="13.8" fill="url(#b-${uid})"/>
<ellipse cx="20.5" cy="37.5" rx="3.3" ry="2.1" fill="#fb7185" opacity="0.45"/>
<ellipse cx="43.5" cy="37.5" rx="3.3" ry="2.1" fill="#fb7185" opacity="0.45"/>
<ellipse cx="25.5" cy="32" rx="2.4" ry="3.1" fill="#1e293b"/>
<circle cx="24.66" cy="30.82" r="1.08" fill="#fff"/>
<circle cx="26.46" cy="33.24" r="0.48" fill="#fff" opacity=".85"/>
<ellipse cx="38.5" cy="32" rx="2.4" ry="3.1" fill="#1e293b"/>
<circle cx="37.66" cy="30.82" r="1.08" fill="#fff"/>
<circle cx="39.46" cy="33.24" r="0.48" fill="#fff" opacity=".85"/>
<path d="M30.2 35.4Q32 34.4 33.8 35.4Q33 37.6 32 38.1Q31 37.6 30.2 35.4Z" fill="#fb7185"/>
<path d="M32 38.1V39.6M32 39.6Q30 41.6 28.2 40.1M32 39.6Q34 41.6 35.8 40.1" fill="none" stroke="#9f1239" stroke-width="0.85" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M22 36L12 34M22 38L12 39.5M42 36L52 34M42 38L52 39.5" fill="none" stroke="#94a3b8" stroke-width="0.55" stroke-linecap="round" stroke-linejoin="round"/>
<g transform="translate(47.5 43) rotate(-18)">
<path d="M-4.2 0Q0 -2 4.2 0L1.3 16Q0 17.4 -1.3 16Z" fill="url(#car-${uid})"/>
<path d="M-3 5H1.5M-2 9.5H2.4M-1.2 13.2H1" stroke="#9a3412" stroke-width=".7" stroke-linecap="round" opacity=".6"/>
<ellipse cx="0" cy="-3.5" rx="1.7" ry="4.2" fill="url(#lf-${uid})"/>
<ellipse cx="-2.6" cy="-2.6" rx="1.5" ry="3.8" transform="rotate(-28 -2.6 -2.6)" fill="url(#lf-${uid})"/>
<ellipse cx="2.6" cy="-2.6" rx="1.5" ry="3.8" transform="rotate(28 2.6 -2.6)" fill="url(#lf-${uid})"/>
<circle cx="0" cy="5.5" r="3.1" fill="url(#b-${uid})"/>
</g>
<ellipse cx="26" cy="24" rx="6.5" ry="3" transform="rotate(-22 26 24)" fill="url(#gl-${uid})" opacity="1"/>
<g transform="translate(12 22) scale(0.65)">
<path class="pfx-twinkle" fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_chick: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fffbb0"/>
<stop offset="0.5" stop-color="#fde047"/>
<stop offset="1" stop-color="#c98a08"/>
</radialGradient>
<radialGradient id="w-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fde68a"/>
<stop offset="0.5" stop-color="#f5b81c"/>
<stop offset="1" stop-color="#a8650a"/>
</radialGradient>
<radialGradient id="bk-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fed7aa"/>
<stop offset="0.5" stop-color="#fb923c"/>
<stop offset="1" stop-color="#c2410c"/>
</radialGradient>
<radialGradient id="sh2-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#f6f1e6"/>
<stop offset="1" stop-color="#c4b79c"/>
</radialGradient>
</defs>
<ellipse cx="32" cy="58.5" rx="19" ry="3.6" fill="url(#sh-${uid})"/>
<circle cx="32" cy="37.5" r="20.2" fill="url(#b-${uid})"/>
<ellipse cx="28" cy="16" rx="2.1" ry="5" transform="rotate(-26 28 17)" fill="url(#w-${uid})"/>
<ellipse cx="32" cy="16" rx="2.1" ry="5.8" transform="rotate(0 32 17)" fill="url(#w-${uid})"/>
<ellipse cx="36" cy="16" rx="2.1" ry="5" transform="rotate(26 36 17)" fill="url(#w-${uid})"/>
<ellipse cx="12.5" cy="41" rx="5.2" ry="8.5" transform="rotate(18 12.5 41)" fill="url(#w-${uid})"/>
<ellipse cx="51.5" cy="41" rx="5.2" ry="8.5" transform="rotate(-18 51.5 41)" fill="url(#w-${uid})"/>
<ellipse cx="19.5" cy="39.5" rx="3.4" ry="2.2" fill="#fb7185" opacity="0.45"/>
<ellipse cx="44.5" cy="39.5" rx="3.4" ry="2.2" fill="#fb7185" opacity="0.45"/>
<ellipse cx="25" cy="32.5" rx="2.4" ry="3" fill="#1e293b"/>
<circle cx="24.16" cy="31.36" r="1.08" fill="#fff"/>
<circle cx="25.96" cy="33.7" r="0.48" fill="#fff" opacity=".85"/>
<ellipse cx="39" cy="32.5" rx="2.4" ry="3" fill="#1e293b"/>
<circle cx="38.16" cy="31.36" r="1.08" fill="#fff"/>
<circle cx="39.96" cy="33.7" r="0.48" fill="#fff" opacity=".85"/>
<path d="M28 36.5Q32 33.8 36 36.5Q34.4 41.8 32 42.4Q29.6 41.8 28 36.5Z" fill="url(#bk-${uid})"/>
<path d="M29 38.2Q32 39.6 35 38.2" fill="none" stroke="#9a3412" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="31" cy="36.7" rx="1.3" ry=".7" fill="#fff" opacity=".7"/>
<path d="M9.5 47L15 51.5L20 46L26 52.5L32 46.5L38 52.5L44 46L49 51.5L54.5 47Q57 58.5 32 61.5Q7 58.5 9.5 47Z" fill="url(#sh2-${uid})"/>
<path d="M9.5 47L15 51.5L20 46L26 52.5L32 46.5L38 52.5L44 46L49 51.5L54.5 47" fill="none" stroke="#e8dfca" stroke-width=".8" stroke-linejoin="round"/>
<path d="M16 56Q32 60.5 48 56" fill="none" stroke="#d9cdb2" stroke-width=".6" opacity=".7"/>
<ellipse cx="24" cy="24" rx="7.5" ry="3.6" transform="rotate(-30 24 24)" fill="url(#gl-${uid})" opacity="1"/>
<g transform="translate(51 17) scale(0.7)">
<path class="pfx-twinkle" fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_turtle: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="sk-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#d9f99d"/>
<stop offset="0.5" stop-color="#84cc16"/>
<stop offset="1" stop-color="#3f6212"/>
</radialGradient>
<radialGradient id="sl-${uid}" cx="0.35" cy="0.22" r="0.9">
<stop offset="0" stop-color="#a7f3d0"/>
<stop offset="0.5" stop-color="#22c55e"/>
<stop offset="1" stop-color="#14532d"/>
</radialGradient>
<linearGradient id="rim-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fef3c7"/>
<stop offset="1" stop-color="#c9a24a"/>
</linearGradient>
</defs>
<ellipse cx="32" cy="59" rx="22" ry="3.4" fill="url(#sh-${uid})"/>
<ellipse cx="9.5" cy="51" rx="4" ry="2.6" transform="rotate(-20 9.5 51)" fill="url(#sk-${uid})"/>
<ellipse cx="17" cy="55" rx="5.4" ry="4" fill="url(#sk-${uid})"/>
<ellipse cx="41" cy="55" rx="5.4" ry="4" fill="url(#sk-${uid})"/>
<ellipse cx="31" cy="49.5" rx="23" ry="5.4" fill="url(#rim-${uid})"/>
<path d="M8 49.5Q8 19.5 31 19.5Q54 19.5 54 49.5Q31 54.5 8 49.5Z" fill="url(#sl-${uid})"/>
<polygon points="37.8,34 34.4,39.9 27.6,39.9 24.2,34 27.6,28.1 34.4,28.1" fill="#bbf7d0" fill-opacity=".28" stroke="#d1fae5" stroke-width=".9" stroke-linejoin="round"/>
<path d="M37.8 34L46 31M34.4 39.9L38.5 47M27.6 39.9L23.5 47M24.2 34L16 31M27.6 28.1L25 21M34.4 28.1L37 21" fill="none" stroke="#d1fae5" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16 31Q12 38 12.5 45M46 31Q50 38 49.5 45M23.5 47Q31 50.5 38.5 47" fill="none" stroke="#bbf7d0" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>
<ellipse cx="48.5" cy="45" rx="8.5" ry="6" transform="rotate(-30 48.5 45)" fill="url(#sk-${uid})"/>
<circle cx="54" cy="37" r="8.2" fill="url(#sk-${uid})"/>
<ellipse cx="57" cy="35.4" rx="1.9" ry="2.4" fill="#1e293b"/>
<circle cx="56.34" cy="34.49" r="0.85" fill="#fff"/>
<circle cx="57.76" cy="36.36" r="0.38" fill="#fff" opacity=".85"/>
<ellipse cx="52.5" cy="41" rx="2.4" ry="1.5" fill="#fb7185" opacity="0.45"/>
<path d="M54.5 40.6Q58 42 60 39.6" fill="none" stroke="#365314" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="23.5" cy="26.5" rx="7" ry="3.1" transform="rotate(-38 23.5 26.5)" fill="url(#gl-${uid})" opacity="1"/>
<g transform="translate(55 22) scale(0.65)">
<path class="pfx-twinkle" fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_panda: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="w-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#eef0f3"/>
<stop offset="1" stop-color="#9aa3b2"/>
</radialGradient>
<radialGradient id="k-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#5b6472"/>
<stop offset="0.5" stop-color="#1f2937"/>
<stop offset="1" stop-color="#05070c"/>
</radialGradient>
<linearGradient id="bam-${uid}" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#86efac"/>
<stop offset="0.5" stop-color="#22c55e"/>
<stop offset="1" stop-color="#166534"/>
</linearGradient>
<radialGradient id="lf-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#bbf7d0"/>
<stop offset="0.5" stop-color="#4ade80"/>
<stop offset="1" stop-color="#15803d"/>
</radialGradient>
</defs>
<ellipse cx="32" cy="58.5" rx="19" ry="3.6" fill="url(#sh-${uid})"/>
<rect x="47.2" y="35" width="4.4" height="25" rx="2.2" fill="url(#bam-${uid})"/>
<path d="M47.2 43H51.6M47.2 51H51.6M47.2 58.5H51.6" fill="none" stroke="#166534" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M51 36Q58 31 59 36Q55 39 51 38Z" fill="url(#lf-${uid})"/>
<path d="M47.5 37Q41 33 40 37.5Q44 40 47.5 38.5Z" fill="url(#lf-${uid})"/>
<ellipse cx="32" cy="50.5" rx="15.5" ry="11" fill="url(#w-${uid})"/>
<ellipse cx="20" cy="57" rx="6.4" ry="4.8" fill="url(#k-${uid})"/>
<ellipse cx="44" cy="57" rx="6.4" ry="4.8" fill="url(#k-${uid})"/>
<ellipse cx="17" cy="48.5" rx="4.6" ry="8" transform="rotate(18 17 48.5)" fill="url(#k-${uid})"/>
<ellipse cx="45" cy="46.5" rx="5" ry="3.6" transform="rotate(-35 45 46.5)" fill="url(#k-${uid})"/>
<circle cx="17.5" cy="15.5" r="6.2" fill="url(#k-${uid})"/>
<circle cx="46.5" cy="15.5" r="6.2" fill="url(#k-${uid})"/>
<circle cx="32" cy="29.5" r="16.8" fill="url(#w-${uid})"/>
<ellipse cx="24" cy="30" rx="4.9" ry="6.5" transform="rotate(20 24 30)" fill="url(#k-${uid})"/>
<ellipse cx="40" cy="30" rx="4.9" ry="6.5" transform="rotate(-20 40 30)" fill="url(#k-${uid})"/>
<circle cx="24.3" cy="29.6" r="2.3" fill="#fff"/>
<circle cx="24.3" cy="29.9" r="1.45" fill="#0f172a"/>
<circle cx="23.8" cy="29.3" r=".55" fill="#fff"/>
<circle cx="39.7" cy="29.6" r="2.3" fill="#fff"/>
<circle cx="39.7" cy="29.9" r="1.45" fill="#0f172a"/>
<circle cx="39.2" cy="29.3" r=".55" fill="#fff"/>
<ellipse cx="18.5" cy="38" rx="3" ry="1.9" fill="#fb7185" opacity="0.45"/>
<ellipse cx="45.5" cy="38" rx="3" ry="1.9" fill="#fb7185" opacity="0.45"/>
<ellipse cx="32" cy="34.2" rx="2.7" ry="1.9" fill="url(#k-${uid})"/>
<ellipse cx="31.2" cy="33.6" rx=".9" ry=".5" fill="#fff" opacity=".8"/>
<path d="M32 36V37.6M32 37.6Q29.6 40.2 27.6 38.3M32 37.6Q34.4 40.2 36.4 38.3" fill="none" stroke="#111827" stroke-width="0.85" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="45.5" cy="47" rx="3.3" ry="2.4" transform="rotate(-35 45.5 47)" fill="url(#k-${uid})"/>
<ellipse cx="25" cy="18.5" rx="7.5" ry="3.1" transform="rotate(-25 25 18.5)" fill="url(#gl-${uid})" opacity="1"/>
<g transform="translate(10 30) scale(0.6)">
<path class="pfx-twinkle" fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_bear: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#e6b274"/>
<stop offset="0.5" stop-color="#a8662a"/>
<stop offset="1" stop-color="#4a2511"/>
</radialGradient>
<radialGradient id="t-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#f5d3a1"/>
<stop offset="0.5" stop-color="#d9a766"/>
<stop offset="1" stop-color="#9a6a35"/>
</radialGradient>
<radialGradient id="cr-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fff4dc"/>
<stop offset="0.5" stop-color="#f3d6a6"/>
<stop offset="1" stop-color="#d8a96a"/>
</radialGradient>
<radialGradient id="nz-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#6b5a50"/>
<stop offset="0.5" stop-color="#2b1d17"/>
<stop offset="1" stop-color="#0d0806"/>
</radialGradient>
<radialGradient id="hn-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fde68a"/>
<stop offset="0.5" stop-color="#f59e0b"/>
<stop offset="1" stop-color="#92400e"/>
</radialGradient>
<linearGradient id="jar-${uid}" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#fcd34d"/>
<stop offset="0.55" stop-color="#d97706"/>
<stop offset="1" stop-color="#78350f"/>
</linearGradient>
</defs>
<ellipse cx="32" cy="58.5" rx="19" ry="3.6" fill="url(#sh-${uid})"/>
<circle cx="17" cy="16.5" r="6.3" fill="url(#b-${uid})"/>
<circle cx="17" cy="17" r="3.2" fill="url(#t-${uid})"/>
<circle cx="47" cy="16.5" r="6.3" fill="url(#b-${uid})"/>
<circle cx="47" cy="17" r="3.2" fill="url(#t-${uid})"/>
<ellipse cx="32" cy="50" rx="16.5" ry="11.5" fill="url(#b-${uid})"/>
<ellipse cx="32" cy="52.5" rx="9" ry="7.2" fill="url(#t-${uid})"/>
<ellipse cx="21" cy="57.5" rx="6.2" ry="4" fill="url(#b-${uid})"/>
<ellipse cx="43" cy="57.5" rx="6.2" ry="4" fill="url(#b-${uid})"/>
<ellipse cx="15" cy="49" rx="4.6" ry="7.4" transform="rotate(18 15 49)" fill="url(#b-${uid})"/>
<path d="M41 48.5Q39 58.5 44.5 60.5H52Q57.5 58.5 55.5 48.5Z" fill="url(#jar-${uid})"/>
<ellipse cx="48.3" cy="48.5" rx="7.4" ry="2.3" fill="#92400e"/>
<ellipse cx="48.3" cy="48.3" rx="6.1" ry="1.7" fill="url(#hn-${uid})"/>
<path d="M43.2 48.7Q42.8 53.8 45 53.2Q45.5 50.5 46 48.7Z" fill="url(#hn-${uid})"/>
<ellipse cx="48.8" cy="54.5" rx="3.6" ry="2.6" fill="#fff4dc" opacity=".9"/>
<polygon points="48.8,52.6 50.4,53.5 50.4,55.4 48.8,56.3 47.2,55.4 47.2,53.5" fill="#f59e0b" opacity=".85"/>
<ellipse cx="42" cy="51" rx="3.3" ry="2.7" fill="url(#b-${uid})"/>
<circle cx="32" cy="30" r="17.6" fill="url(#b-${uid})"/>
<ellipse cx="32" cy="36.6" rx="8.6" ry="6.9" fill="url(#cr-${uid})"/>
<ellipse cx="32" cy="33.6" rx="3.1" ry="2.3" fill="url(#nz-${uid})"/>
<ellipse cx="31" cy="32.8" rx="1" ry=".55" fill="#fff" opacity=".7"/>
<path d="M32 35.8V37.6M32 37.6Q29.4 40.4 27.2 38.4M32 37.6Q34.6 40.4 36.8 38.4" fill="none" stroke="#3b2012" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="24.5" cy="28" rx="2.4" ry="3" fill="#1e293b"/>
<circle cx="23.66" cy="26.86" r="1.08" fill="#fff"/>
<circle cx="25.46" cy="29.2" r="0.48" fill="#fff" opacity=".85"/>
<ellipse cx="39.5" cy="28" rx="2.4" ry="3" fill="#1e293b"/>
<circle cx="38.66" cy="26.86" r="1.08" fill="#fff"/>
<circle cx="40.46" cy="29.2" r="0.48" fill="#fff" opacity=".85"/>
<ellipse cx="19.5" cy="34.5" rx="3" ry="1.9" fill="#fb7185" opacity="0.45"/>
<ellipse cx="44.5" cy="34.5" rx="3" ry="1.9" fill="#fb7185" opacity="0.45"/>
<ellipse cx="25" cy="19" rx="8" ry="3.4" transform="rotate(-25 25 19)" fill="url(#gl-${uid})" opacity="1"/>
<g transform="translate(10 33) scale(0.65)">
<path class="pfx-twinkle" fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_frog: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#c9f78f"/>
<stop offset="0.5" stop-color="#43c552"/>
<stop offset="1" stop-color="#14702b"/>
</radialGradient>
<radialGradient id="bl-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fefce8"/>
<stop offset="0.5" stop-color="#e4f4a8"/>
<stop offset="1" stop-color="#a9d36a"/>
</radialGradient>
<radialGradient id="pad-${uid}" cx="0.4" cy="0.3" r="0.9">
<stop offset="0" stop-color="#86efac"/>
<stop offset="0.5" stop-color="#16a34a"/>
<stop offset="1" stop-color="#14532d"/>
</radialGradient>
<radialGradient id="pt-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fff1f2"/>
<stop offset="0.5" stop-color="#fda4af"/>
<stop offset="1" stop-color="#e11d48"/>
</radialGradient>
</defs>
<ellipse cx="32" cy="59" rx="23" ry="3.2" fill="url(#sh-${uid})"/>
<ellipse cx="32" cy="57" rx="23.5" ry="5.6" fill="url(#pad-${uid})"/>
<path d="M32 57L54 55.4" fill="none" stroke="#14532d" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>
<ellipse cx="10.5" cy="52" rx="2.2" ry="4" transform="rotate(-30 10.5 52)" fill="url(#pt-${uid})"/>
<ellipse cx="14" cy="51.4" rx="2.2" ry="4.2" transform="rotate(25 14 51.4)" fill="url(#pt-${uid})"/>
<ellipse cx="12.2" cy="51" rx="2" ry="4.6" fill="#fff1f2"/>
<ellipse cx="32" cy="43.5" rx="21.5" ry="14.5" fill="url(#b-${uid})"/>
<circle cx="20.5" cy="28" r="8.7" fill="url(#b-${uid})"/>
<circle cx="43.5" cy="28" r="8.7" fill="url(#b-${uid})"/>
<circle cx="20.5" cy="28" r="6.1" fill="#fff"/>
<circle cx="43.5" cy="28" r="6.1" fill="#fff"/>
<ellipse cx="21.3" cy="28.6" rx="3" ry="3.6" fill="#1e293b"/>
<circle cx="20.3" cy="27" r="1.3" fill="#fff"/>
<circle cx="22.3" cy="30" r=".6" fill="#fff" opacity=".85"/>
<ellipse cx="42.7" cy="28.6" rx="3" ry="3.6" fill="#1e293b"/>
<circle cx="41.7" cy="27" r="1.3" fill="#fff"/>
<circle cx="43.7" cy="30" r=".6" fill="#fff" opacity=".85"/>
<ellipse cx="32" cy="49.5" rx="12.5" ry="8.5" fill="url(#bl-${uid})"/>
<path d="M17 41.5Q32 54.5 47 41.5" fill="none" stroke="#14532d" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="29" cy="37" r=".7" fill="#14532d"/>
<circle cx="35" cy="37" r=".7" fill="#14532d"/>
<ellipse cx="14" cy="44" rx="3" ry="1.9" fill="#fb7185" opacity="0.45"/>
<ellipse cx="50" cy="44" rx="3" ry="1.9" fill="#fb7185" opacity="0.45"/>
<circle cx="14" cy="38" r="1.6" fill="#14702b" opacity=".6"/>
<circle cx="50" cy="39" r="1.4" fill="#14702b" opacity=".6"/>
<circle cx="46" cy="47" r="1.1" fill="#14702b" opacity=".5"/>
<ellipse cx="22" cy="56" rx="5.4" ry="2.7" fill="url(#b-${uid})"/>
<ellipse cx="42" cy="56" rx="5.4" ry="2.7" fill="url(#b-${uid})"/>
<ellipse cx="27" cy="34" rx="9" ry="2.8" transform="rotate(-6 27 34)" fill="url(#gl-${uid})" opacity="0.7"/>
<g transform="translate(54 20) scale(0.65)">
<path class="pfx-twinkle" fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_duck: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fff8b0"/>
<stop offset="0.5" stop-color="#ffd23a"/>
<stop offset="1" stop-color="#dd9208"/>
</radialGradient>
<radialGradient id="w-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffe36a"/>
<stop offset="0.5" stop-color="#f5b014"/>
<stop offset="1" stop-color="#b36a06"/>
</radialGradient>
<radialGradient id="bk-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fed7aa"/>
<stop offset="0.5" stop-color="#fb923c"/>
<stop offset="1" stop-color="#c2410c"/>
</radialGradient>
<linearGradient id="wt-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#a5e4ff"/>
<stop offset="0.6" stop-color="#38bdf8"/>
<stop offset="1" stop-color="#0369a1"/>
</linearGradient>
</defs>
<ellipse cx="32" cy="59.5" rx="23" ry="3" fill="url(#sh-${uid})"/>
<ellipse cx="32" cy="46" rx="19.5" ry="14.5" fill="url(#b-${uid})"/>
<ellipse cx="14.5" cy="45" rx="6" ry="8.5" transform="rotate(14 14.5 45)" fill="url(#w-${uid})"/>
<ellipse cx="49.5" cy="45" rx="6" ry="8.5" transform="rotate(-14 49.5 45)" fill="url(#w-${uid})"/>
<circle cx="32" cy="24" r="14.2" fill="url(#b-${uid})"/>
<path d="M33 10.5Q28 4.5 33.5 4.2Q31.4 7 35.5 9.6Z" fill="url(#w-${uid})"/>
<ellipse cx="19.5" cy="28" rx="3.2" ry="2" fill="#fb7185" opacity="0.45"/>
<ellipse cx="44.5" cy="28" rx="3.2" ry="2" fill="#fb7185" opacity="0.45"/>
<ellipse cx="25" cy="21.5" rx="2.4" ry="3" fill="#1e293b"/>
<circle cx="24.16" cy="20.36" r="1.08" fill="#fff"/>
<circle cx="25.96" cy="22.7" r="0.48" fill="#fff" opacity=".85"/>
<ellipse cx="39" cy="21.5" rx="2.4" ry="3" fill="#1e293b"/>
<circle cx="38.16" cy="20.36" r="1.08" fill="#fff"/>
<circle cx="39.96" cy="22.7" r="0.48" fill="#fff" opacity=".85"/>
<ellipse cx="32" cy="28.5" rx="7.8" ry="3.9" fill="url(#bk-${uid})"/>
<path d="M25 28.4Q32 31.4 39 28.4" fill="none" stroke="#9a3412" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="29" cy="26.9" rx="2.2" ry=".8" fill="#fff" opacity=".7"/>
<circle cx="29.6" cy="28" r=".5" fill="#9a3412"/>
<circle cx="34.4" cy="28" r=".5" fill="#9a3412"/>
<path d="M8.5 50Q15.5 47.5 22 50T35 50T48.5 50T56 49V58Q32 63 8.5 58Z" fill="url(#wt-${uid})" opacity=".88"/>
<ellipse cx="32" cy="55.5" rx="15" ry="2.8" fill="none" stroke="#fff" stroke-width=".6" opacity=".6"/>
<ellipse cx="32" cy="55.5" rx="21" ry="3.8" fill="none" stroke="#fff" stroke-width=".5" opacity=".4"/>
<path d="M12 52Q16 51 20 52" stroke="#fff" stroke-width=".7" fill="none" opacity=".6" stroke-linecap="round"/>
<ellipse cx="25" cy="15.5" rx="7" ry="3.2" transform="rotate(-25 25 15.5)" fill="url(#gl-${uid})" opacity="1"/>
<g transform="translate(52 14) scale(0.7)">
<path class="pfx-twinkle" fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_mouse: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#f4f7fb"/>
<stop offset="0.5" stop-color="#aab5c7"/>
<stop offset="1" stop-color="#566074"/>
</radialGradient>
<radialGradient id="pk-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffd4e6"/>
<stop offset="0.5" stop-color="#fda4cf"/>
<stop offset="1" stop-color="#db2777"/>
</radialGradient>
<radialGradient id="lt-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#eef1f6"/>
<stop offset="1" stop-color="#c5cdda"/>
</radialGradient>
<radialGradient id="ch-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fff6a8"/>
<stop offset="0.5" stop-color="#fcd34d"/>
<stop offset="1" stop-color="#d8970a"/>
</radialGradient>
</defs>
<ellipse cx="32" cy="58.5" rx="19" ry="3.6" fill="url(#sh-${uid})"/>
<path d="M44 57Q61 58 58.5 45Q57.5 38.5 52 40.5" fill="none" stroke="#f4a9bd" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="15" cy="20.5" r="9.6" fill="url(#b-${uid})"/>
<circle cx="15" cy="21" r="6.2" fill="url(#pk-${uid})"/>
<circle cx="49" cy="20.5" r="9.6" fill="url(#b-${uid})"/>
<circle cx="49" cy="21" r="6.2" fill="url(#pk-${uid})"/>
<ellipse cx="32" cy="48.5" rx="13.5" ry="11" fill="url(#b-${uid})"/>
<ellipse cx="32" cy="50.5" rx="8" ry="7" fill="url(#lt-${uid})"/>
<ellipse cx="24" cy="58.5" rx="5" ry="2.5" fill="url(#pk-${uid})"/>
<ellipse cx="40" cy="58.5" rx="5" ry="2.5" fill="url(#pk-${uid})"/>
<path d="M37 57.5L56.5 57.5L56.5 46.5Z" fill="url(#ch-${uid})" stroke="#b7790a" stroke-width=".6" stroke-linejoin="round"/>
<circle cx="51" cy="53" r="1.9" fill="#d99a0b"/>
<circle cx="54.2" cy="49.6" r="1.1" fill="#d99a0b"/>
<circle cx="46.6" cy="56" r="1.2" fill="#d99a0b"/>
<path d="M38.5 56.5L55.4 48" stroke="#fffbe0" stroke-width=".7" opacity=".8" stroke-linecap="round"/>
<ellipse cx="41" cy="54" rx="3.4" ry="2.7" fill="url(#lt-${uid})"/>
<ellipse cx="32" cy="31.5" rx="15.3" ry="13.6" fill="url(#b-${uid})"/>
<ellipse cx="32" cy="37.4" rx="7.2" ry="5.3" fill="url(#lt-${uid})"/>
<ellipse cx="21" cy="35.5" rx="3" ry="1.9" fill="#fb7185" opacity="0.45"/>
<ellipse cx="43" cy="35.5" rx="3" ry="1.9" fill="#fb7185" opacity="0.45"/>
<ellipse cx="25" cy="29" rx="2.4" ry="3.1" fill="#1e293b"/>
<circle cx="24.16" cy="27.82" r="1.08" fill="#fff"/>
<circle cx="25.96" cy="30.24" r="0.48" fill="#fff" opacity=".85"/>
<ellipse cx="39" cy="29" rx="2.4" ry="3.1" fill="#1e293b"/>
<circle cx="38.16" cy="27.82" r="1.08" fill="#fff"/>
<circle cx="39.96" cy="30.24" r="0.48" fill="#fff" opacity=".85"/>
<ellipse cx="32" cy="34.6" rx="2.5" ry="1.9" fill="url(#pk-${uid})"/>
<ellipse cx="31.3" cy="34" rx=".9" ry=".5" fill="#fff" opacity=".8"/>
<path d="M32 36.4V38M32 38Q30 40 28.2 38.6M32 38Q34 40 35.8 38.6" fill="none" stroke="#6b2140" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="30.8" y="38" width="2.4" height="2.2" rx=".6" fill="#fff" stroke="#cbd5e1" stroke-width=".3"/>
<path d="M23 36.5L10 33.5M23 38.4L10 39M23.5 40.3L11.5 44.5M41 36.5L54 33.5M41 38.4L54 39M40.5 40.3L52.5 44.5" fill="none" stroke="#e8edf5" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="26" cy="23" rx="7" ry="3" transform="rotate(-25 26 23)" fill="url(#gl-${uid})" opacity="1"/>
<g transform="translate(10 40) scale(0.6)">
<path class="pfx-twinkle" fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_koala: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#eceef1"/>
<stop offset="0.5" stop-color="#a2a9b4"/>
<stop offset="1" stop-color="#4f5866"/>
</radialGradient>
<radialGradient id="fl-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#fbe2ee"/>
<stop offset="1" stop-color="#f3a9cb"/>
</radialGradient>
<radialGradient id="nz-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#5a6070"/>
<stop offset="0.5" stop-color="#242833"/>
<stop offset="1" stop-color="#07080c"/>
</radialGradient>
<radialGradient id="lf-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#c6e8cc"/>
<stop offset="0.5" stop-color="#6fba90"/>
<stop offset="1" stop-color="#2d7656"/>
</radialGradient>
<linearGradient id="br-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#a9794a"/>
<stop offset="1" stop-color="#4e2f17"/>
</linearGradient>
</defs>
<ellipse cx="32" cy="58.5" rx="19" ry="3.6" fill="url(#sh-${uid})"/>
<circle cx="14" cy="22" r="9.8" fill="url(#b-${uid})"/>
<circle cx="14" cy="22.5" r="6.3" fill="url(#fl-${uid})"/>
<circle cx="50" cy="22" r="9.8" fill="url(#b-${uid})"/>
<circle cx="50" cy="22.5" r="6.3" fill="url(#fl-${uid})"/>
<ellipse cx="32" cy="48" rx="15.5" ry="12.5" fill="url(#b-${uid})"/>
<ellipse cx="32" cy="50.5" rx="9" ry="8" fill="#f3f4f6"/>
<ellipse cx="32" cy="29.5" rx="17.2" ry="15.4" fill="url(#b-${uid})"/>
<ellipse cx="32" cy="33.5" rx="10" ry="9" fill="#fff" opacity=".28"/>
<ellipse cx="24" cy="26.8" rx="2" ry="2.5" fill="#1e293b"/>
<circle cx="23.3" cy="25.85" r="0.9" fill="#fff"/>
<circle cx="24.8" cy="27.8" r="0.4" fill="#fff" opacity=".85"/>
<ellipse cx="40" cy="26.8" rx="2" ry="2.5" fill="#1e293b"/>
<circle cx="39.3" cy="25.85" r="0.9" fill="#fff"/>
<circle cx="40.8" cy="27.8" r="0.4" fill="#fff" opacity=".85"/>
<ellipse cx="19" cy="33.5" rx="3" ry="1.8" fill="#fb7185" opacity="0.45"/>
<ellipse cx="45" cy="33.5" rx="3" ry="1.8" fill="#fb7185" opacity="0.45"/>
<ellipse cx="32" cy="31.5" rx="5.2" ry="7.3" fill="url(#nz-${uid})"/>
<ellipse cx="30.2" cy="28" rx="1.7" ry="2.5" transform="rotate(-15 30.2 28)" fill="#fff" opacity=".6"/>
<path d="M32 38.4Q30 41.2 28 39.8M32 38.4Q34 41.2 36 39.8" fill="none" stroke="#3a3f4b" stroke-width="0.85" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4 55.5Q30 49.5 60 56.5" fill="none" stroke="url(#br-${uid})" stroke-width="3.2" stroke-linecap="round"/>
<ellipse cx="10" cy="51" rx="2.6" ry="5.2" transform="rotate(-30 10 51)" fill="url(#lf-${uid})"/>
<ellipse cx="19" cy="51.5" rx="2.6" ry="5.2" transform="rotate(15 19 51.5)" fill="url(#lf-${uid})"/>
<ellipse cx="46" cy="51.8" rx="2.6" ry="5.2" transform="rotate(-15 46 51.8)" fill="url(#lf-${uid})"/>
<ellipse cx="55" cy="53.5" rx="2.6" ry="5.2" transform="rotate(30 55 53.5)" fill="url(#lf-${uid})"/>
<ellipse cx="22" cy="54" rx="4.8" ry="3.4" fill="url(#b-${uid})"/>
<ellipse cx="42" cy="54.5" rx="4.8" ry="3.4" fill="url(#b-${uid})"/>
<ellipse cx="24" cy="18.5" rx="8.5" ry="3.4" transform="rotate(-22 24 18.5)" fill="url(#gl-${uid})" opacity="1"/>
<g transform="translate(55 12) scale(0.6)">
<path class="pfx-twinkle" fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_wolf: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#bfd6ff" stop-opacity="0.6"/>
<stop offset="0.6" stop-color="#bfd6ff" stop-opacity="0.24"/>
<stop offset="1" stop-color="#bfd6ff" stop-opacity="0"/>
</radialGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#e3eaf6"/>
<stop offset="0.5" stop-color="#8392aa"/>
<stop offset="1" stop-color="#252f44"/>
</radialGradient>
<radialGradient id="mz-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#e7ecf5"/>
<stop offset="1" stop-color="#aab6c9"/>
</radialGradient>
<linearGradient id="am-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fff3b0"/>
<stop offset="0.5" stop-color="#fbbf24"/>
<stop offset="1" stop-color="#b45309"/>
</linearGradient>
<radialGradient id="ns-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#5b6475"/>
<stop offset="0.5" stop-color="#111827"/>
<stop offset="1" stop-color="#000"/>
</radialGradient>
<linearGradient id="st-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#1e293b" stop-opacity="0.65"/>
<stop offset="1" stop-color="#1e293b" stop-opacity="0"/>
</linearGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="34" r="30" fill="url(#au-${uid})"/>
<ellipse cx="32" cy="59" rx="17" ry="3" fill="url(#sh-${uid})"/>
<g class="pfx-float">
<path d="M32 17Q27 17 24 20L14 6L11 24L5 34L10 35.5L4.5 45L14 43Q20 53 32 58Q44 53 50 43L59.5 45L54 35.5L59 34L53 24L50 6L40 20Q37 17 32 17Z" fill="url(#b-${uid})" stroke="#1b2438" stroke-width=".6" stroke-linejoin="round"/>
<path d="M15.5 11L22 20L14.5 23Z" fill="#c78fa4"/>
<path d="M48.5 11L42 20L49.5 23Z" fill="#c78fa4"/>
<path d="M32 18Q26 24 28 34L32 38L36 34Q38 24 32 18Z" fill="url(#st-${uid})"/>
<path d="M32 36Q22 36 20 46Q24 55 32 56.5Q40 55 44 46Q42 36 32 36Z" fill="url(#mz-${uid})"/>
<path d="M8 37L16 39M7 44L16 45M56 37L48 39M57 44L48 45" fill="none" stroke="#d7e0ee" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 29.5Q25 26 30 30.3Q25 33 20 29.5Z" fill="url(#am-${uid})"/>
<path d="M44 29.5Q39 26 34 30.3Q39 33 44 29.5Z" fill="url(#am-${uid})"/>
<ellipse cx="25.3" cy="29.8" rx="1.1" ry="1.9" fill="#0b1020"/>
<ellipse cx="38.7" cy="29.8" rx="1.1" ry="1.9" fill="#0b1020"/>
<circle cx="24.6" cy="29" r=".6" fill="#fff"/>
<circle cx="38" cy="29" r=".6" fill="#fff"/>
<path d="M18.5 25.5L29.5 29M45.5 25.5L34.5 29" fill="none" stroke="#141b2c" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M28.3 40Q32 37.8 35.7 40Q34 44.2 32 44.8Q30 44.2 28.3 40Z" fill="url(#ns-${uid})"/>
<ellipse cx="30.6" cy="39.7" rx="1.5" ry=".7" fill="#fff" opacity=".65"/>
<path d="M32 44.8V47.2M32 47.2Q28.4 50.4 25 48.2M32 47.2Q35.6 50.4 39 48.2" fill="none" stroke="#1b2438" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 6L11 24L5 34L10 35.5L4.5 45" fill="none" stroke="#f0f6ff" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
<ellipse cx="26.5" cy="22" rx="5.2" ry="2.4" transform="rotate(-50 26.5 22)" fill="url(#gl-${uid})" opacity="1"/>
</g>
<circle class="pfx-pulse" style="animation-delay:0.2s" cx="54" cy="20" r="1.3" fill="#d9f99d" opacity="1"/>
<circle class="pfx-pulse" style="animation-delay:1.1s" cx="9" cy="18" r="1.1" fill="#d9f99d" opacity="1"/>
<g transform="translate(55 9) scale(0.65)">
<path class="pfx-twinkle" style="animation-delay:0.5s" fill="#fff7c2" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(8 50) scale(0.55)">
<path class="pfx-twinkle" style="animation-delay:1.3s" fill="#e0f2fe" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_hedgehog: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#ffcf8a" stop-opacity="0.55"/>
<stop offset="0.6" stop-color="#ffcf8a" stop-opacity="0.22"/>
<stop offset="1" stop-color="#ffcf8a" stop-opacity="0"/>
</radialGradient>
<radialGradient id="sp-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#9a6a45"/>
<stop offset="0.5" stop-color="#51321c"/>
<stop offset="1" stop-color="#1f1109"/>
</radialGradient>
<radialGradient id="sp2-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#d9a877"/>
<stop offset="0.5" stop-color="#8a5a36"/>
<stop offset="1" stop-color="#3d2514"/>
</radialGradient>
<radialGradient id="fc-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fff1da"/>
<stop offset="0.5" stop-color="#ebc99b"/>
<stop offset="1" stop-color="#b88a56"/>
</radialGradient>
<radialGradient id="ap-${uid}" cx="0.35" cy="0.28" r="0.9">
<stop offset="0" stop-color="#fecaca"/>
<stop offset="0.5" stop-color="#ef4444"/>
<stop offset="1" stop-color="#7f1d1d"/>
</radialGradient>
<radialGradient id="lf-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#bbf7d0"/>
<stop offset="0.5" stop-color="#4ade80"/>
<stop offset="1" stop-color="#15803d"/>
</radialGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="34" r="30" fill="url(#au-${uid})"/>
<ellipse cx="32" cy="59" rx="21" ry="3.4" fill="url(#sh-${uid})"/>
<g class="pfx-float">
<ellipse cx="22" cy="57.5" rx="5.2" ry="2.7" fill="url(#fc-${uid})"/>
<ellipse cx="42" cy="57.5" rx="5.2" ry="2.7" fill="url(#fc-${uid})"/>
<polygon points="5.6,50.4 10.4,45.5 5.1,41.3 11.0,38.2 7.0,32.4 13.4,31.4 11.0,24.5 17.4,25.7 16.9,18.3 22.7,21.6 24.1,14.4 28.8,19.5 32.0,13.0 35.2,19.5 39.9,14.4 41.3,21.6 47.1,18.3 46.6,25.7 53.0,24.5 50.6,31.4 57.0,32.4 53.0,38.2 58.9,41.3 53.6,45.5 58.4,50.4 59,50 5,50" fill="url(#sp-${uid})" stroke="#2a170b" stroke-width=".5" stroke-linejoin="round"/>
<polygon points="9.7,49.5 14.0,45.4 10.0,40.9 15.2,38.6 12.8,32.8 18.4,32.6 17.8,26.2 23.2,28.2 24.5,22.0 28.9,25.9 32.0,20.5 35.1,25.9 39.5,22.0 40.8,28.2 46.2,26.2 45.6,32.6 51.2,32.8 48.8,38.6 54.0,40.9 50.0,45.4 54.3,49.5 55,50 9,50" fill="url(#sp2-${uid})" opacity=".85" stroke="#e8c9a0" stroke-width=".35" stroke-linejoin="round"/>
<ellipse cx="32" cy="47" rx="19" ry="13" fill="url(#fc-${uid})"/>
<circle cx="17.5" cy="36" r="4" fill="url(#fc-${uid})"/>
<circle cx="46.5" cy="36" r="4" fill="url(#fc-${uid})"/>
<circle cx="17.5" cy="36.4" r="2" fill="#f2b6a0"/>
<circle cx="46.5" cy="36.4" r="2" fill="#f2b6a0"/>
<ellipse cx="32" cy="51" rx="10" ry="7.2" fill="#fff8ec"/>
<ellipse cx="19.5" cy="49" rx="3.2" ry="2" fill="#fb7185" opacity="0.45"/>
<ellipse cx="44.5" cy="49" rx="3.2" ry="2" fill="#fb7185" opacity="0.45"/>
<ellipse cx="24.5" cy="43" rx="2.4" ry="3.1" fill="#1e293b"/>
<circle cx="23.66" cy="41.82" r="1.08" fill="#fff"/>
<circle cx="25.46" cy="44.24" r="0.48" fill="#fff" opacity=".85"/>
<ellipse cx="39.5" cy="43" rx="2.4" ry="3.1" fill="#1e293b"/>
<circle cx="38.66" cy="41.82" r="1.08" fill="#fff"/>
<circle cx="40.46" cy="44.24" r="0.48" fill="#fff" opacity=".85"/>
<circle cx="32" cy="47.8" r="2.7" fill="#1f1109"/>
<ellipse cx="31.1" cy="47" rx="1" ry=".55" fill="#fff" opacity=".8"/>
<path d="M32 50.4V52M32 52Q29.8 54.4 27.8 52.8M32 52Q34.2 54.4 36.2 52.8" fill="none" stroke="#5b3a22" stroke-width="0.85" stroke-linecap="round" stroke-linejoin="round"/>
<g transform="translate(42 18) rotate(14)">
<path d="M0 -5Q-8 -6 -7.5 1Q-7 8 -2 7Q0 6 2 7Q7 8 7.5 1Q8 -6 0 -5Z" fill="url(#ap-${uid})"/>
<path d="M0 -5Q-.5 -8.5 1.5 -10" stroke="#5b3a22" stroke-width="1" fill="none" stroke-linecap="round"/>
<ellipse cx="4" cy="-8" rx="3.2" ry="1.5" transform="rotate(-25 4 -8)" fill="url(#lf-${uid})"/>
<ellipse cx="-3.2" cy="-1.5" rx="1.6" ry="2.6" transform="rotate(25 -3.2 -1.5)" fill="#fff" opacity=".7"/>
</g>
<path d="M9 40Q10 28 22 20" fill="none" stroke="#f1d3ae" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>
</g>
<g transform="translate(55 28) scale(0.65)">
<path class="pfx-twinkle" style="animation-delay:0.3s" fill="#fff3c4" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<circle class="pfx-pulse" style="animation-delay:0.9s" cx="8" cy="22" r="1.2" fill="#ffe9b0" opacity="1"/>
</svg>`;
    },
    pet_otter: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#6fe3ff" stop-opacity="0.55"/>
<stop offset="0.6" stop-color="#6fe3ff" stop-opacity="0.22"/>
<stop offset="1" stop-color="#6fe3ff" stop-opacity="0"/>
</radialGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#d19b66"/>
<stop offset="0.5" stop-color="#8b5a2b"/>
<stop offset="1" stop-color="#47290f"/>
</radialGradient>
<radialGradient id="cr-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fff3dc"/>
<stop offset="0.5" stop-color="#efcf9e"/>
<stop offset="1" stop-color="#c99a62"/>
</radialGradient>
<radialGradient id="pl-${uid}" cx="0.35" cy="0.3" r="0.9">
<stop offset="0" stop-color="#f0feff"/>
<stop offset="0.5" stop-color="#22d3ee"/>
<stop offset="1" stop-color="#0369a1"/>
</radialGradient>
<linearGradient id="wt-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#a5f3fc" stop-opacity="0.8"/>
<stop offset="1" stop-color="#0891b2" stop-opacity="0.8"/>
</linearGradient>
<radialGradient id="nz-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#5a4a40"/>
<stop offset="0.5" stop-color="#1b120d"/>
<stop offset="1" stop-color="#000"/>
</radialGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="34" r="30" fill="url(#au-${uid})"/>
<ellipse cx="32" cy="59.5" rx="22" ry="3" fill="url(#sh-${uid})"/>
<ellipse cx="32" cy="58" rx="23" ry="4.2" fill="url(#wt-${uid})"/>
<ellipse cx="32" cy="58" rx="16" ry="2.6" fill="none" stroke="#fff" stroke-width=".6" opacity=".6"/>
<g class="pfx-float">
<path d="M44 55Q60 58.5 58.5 45" fill="none" stroke="#7a4a22" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M44 55Q60 58.5 58.5 45" fill="none" stroke="#c18a55" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>
<ellipse cx="32" cy="48" rx="14.5" ry="13" fill="url(#b-${uid})"/>
<ellipse cx="32" cy="50" rx="9" ry="9" fill="url(#cr-${uid})"/>
<circle cx="19" cy="15.5" r="3.7" fill="url(#b-${uid})"/>
<circle cx="45" cy="15.5" r="3.7" fill="url(#b-${uid})"/>
<circle cx="32" cy="26" r="13.8" fill="url(#b-${uid})"/>
<ellipse cx="32" cy="31.5" rx="9.2" ry="7" fill="url(#cr-${uid})"/>
<ellipse cx="20.5" cy="31" rx="3" ry="1.9" fill="#fb7185" opacity="0.45"/>
<ellipse cx="43.5" cy="31" rx="3" ry="1.9" fill="#fb7185" opacity="0.45"/>
<ellipse cx="25" cy="23.5" rx="2.4" ry="3" fill="#1e293b"/>
<circle cx="24.16" cy="22.36" r="1.08" fill="#fff"/>
<circle cx="25.96" cy="24.7" r="0.48" fill="#fff" opacity=".85"/>
<ellipse cx="39" cy="23.5" rx="2.4" ry="3" fill="#1e293b"/>
<circle cx="38.16" cy="22.36" r="1.08" fill="#fff"/>
<circle cx="39.96" cy="24.7" r="0.48" fill="#fff" opacity=".85"/>
<ellipse cx="32" cy="28.6" rx="3.1" ry="2.1" fill="url(#nz-${uid})"/>
<ellipse cx="31" cy="27.9" rx="1" ry=".55" fill="#fff" opacity=".8"/>
<path d="M32 30.5V32.2M32 32.2Q29.6 34.8 27.6 33M32 32.2Q34.4 34.8 36.4 33" fill="none" stroke="#4a2c12" stroke-width="0.85" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M24 30L14 28.5M24 32L14 33M40 30L50 28.5M40 32L50 33" fill="none" stroke="#fff5e0" stroke-width="0.55" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="32" cy="50" r="6.2" fill="url(#pl-${uid})" stroke="#0e7490" stroke-width=".5"/>
<ellipse cx="29.8" cy="47.4" rx="2.2" ry="1.2" transform="rotate(-35 29.8 47.4)" fill="#fff" opacity=".9"/>
<circle cx="34.5" cy="52.6" r=".9" fill="#cffafe" opacity=".8"/>
<ellipse cx="25.4" cy="51.2" rx="3.1" ry="2.5" fill="url(#b-${uid})"/>
<ellipse cx="38.6" cy="51.2" rx="3.1" ry="2.5" fill="url(#b-${uid})"/>
<ellipse cx="26" cy="17" rx="7" ry="3" transform="rotate(-25 26 17)" fill="url(#gl-${uid})" opacity="1"/>
</g>
<circle class="pfx-rise" cx="10" cy="40" r="1.8" fill="#a5f3fc" opacity="0.9"/>
<circle class="pfx-rise" style="animation-delay:1.2s" cx="54" cy="36" r="1.4" fill="#bff4ff" opacity="0.9"/>
<g transform="translate(52 14) scale(0.6)">
<path class="pfx-twinkle" style="animation-delay:0.4s" fill="#e0fbff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_bat: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#a78bfa" stop-opacity="0.55"/>
<stop offset="0.6" stop-color="#a78bfa" stop-opacity="0.22"/>
<stop offset="1" stop-color="#a78bfa" stop-opacity="0"/>
</radialGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#b9a2f2"/>
<stop offset="0.5" stop-color="#6d38d4"/>
<stop offset="1" stop-color="#2a0f5c"/>
</radialGradient>
<linearGradient id="wg-${uid}" x1="1" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#7c4de0"/>
<stop offset="0.55" stop-color="#4c1d95"/>
<stop offset="1" stop-color="#1e0a45"/>
</linearGradient>
<radialGradient id="pk-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fbcfe8"/>
<stop offset="0.5" stop-color="#f472b6"/>
<stop offset="1" stop-color="#9d174d"/>
</radialGradient>
<radialGradient id="ey-${uid}" cx="0.4" cy="0.3" r="0.8">
<stop offset="0" stop-color="#fffbd0"/>
<stop offset="0.5" stop-color="#fde047"/>
<stop offset="1" stop-color="#ca8a04"/>
</radialGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="34" r="30" fill="url(#au-${uid})"/>
<ellipse cx="32" cy="59.5" rx="14" ry="2.6" fill="url(#sh-${uid})"/>
<circle class="pfx-twinkle" cx="0" cy="0" r="0" fill="none" opacity="1"/>
<g class="pfx-float">
<path d="M25 32Q14 15 1.5 20Q6 24.5 5 31Q9.5 27.5 11 34Q14.5 30.5 17 38Q20.5 34.5 25 39Z" fill="url(#wg-${uid})" stroke="#2a0f5c" stroke-width=".6" stroke-linejoin="round"/>
<path d="M25 32L1.5 20M25 33L5 31M25 34L11 34M25 36L17 38" fill="none" stroke="#c4b0ff" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/>
<g transform="translate(64 0) scale(-1 1)">
<path d="M25 32Q14 15 1.5 20Q6 24.5 5 31Q9.5 27.5 11 34Q14.5 30.5 17 38Q20.5 34.5 25 39Z" fill="url(#wg-${uid})" stroke="#2a0f5c" stroke-width=".6" stroke-linejoin="round"/>
<path d="M25 32L1.5 20M25 33L5 31M25 34L11 34M25 36L17 38" fill="none" stroke="#c4b0ff" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/>
</g>
<ellipse cx="32" cy="43" rx="9.5" ry="11.5" fill="url(#b-${uid})"/>
<ellipse cx="32" cy="44.5" rx="5.4" ry="7.2" fill="#d9ccff" opacity=".45"/>
<path d="M28 53L26.5 57.5M36 53L37.5 57.5" fill="none" stroke="#3b1b7a" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M23.5 25L21 8.5L31 20Z" fill="url(#b-${uid})"/>
<path d="M40.5 25L43 8.5L33 20Z" fill="url(#b-${uid})"/>
<path d="M24 22.5L22.6 12.5L28.5 19.5Z" fill="url(#pk-${uid})"/>
<path d="M40 22.5L41.4 12.5L35.5 19.5Z" fill="url(#pk-${uid})"/>
<circle cx="32" cy="29" r="10.2" fill="url(#b-${uid})"/>
<ellipse cx="27.7" cy="28" rx="2.7" ry="3.1" fill="url(#ey-${uid})"/>
<ellipse cx="36.3" cy="28" rx="2.7" ry="3.1" fill="url(#ey-${uid})"/>
<ellipse cx="27.9" cy="28.2" rx=".9" ry="2.2" fill="#1a0b3a"/>
<ellipse cx="36.1" cy="28.2" rx=".9" ry="2.2" fill="#1a0b3a"/>
<circle cx="27" cy="27" r=".7" fill="#fff"/>
<circle cx="35.4" cy="27" r=".7" fill="#fff"/>
<ellipse cx="23.5" cy="33" rx="2.4" ry="1.5" fill="#f472b6" opacity="0.5"/>
<ellipse cx="40.5" cy="33" rx="2.4" ry="1.5" fill="#f472b6" opacity="0.5"/>
<path d="M30.8 31.4Q32 30.6 33.2 31.4Q32.6 32.6 32 32.8Q31.4 32.6 30.8 31.4Z" fill="url(#pk-${uid})"/>
<path d="M32 32.8V34.2" fill="none" stroke="#2a0f5c" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M29.8 34L30.8 36.6L31.8 34Z" fill="#fff"/>
<path d="M32.2 34L33.2 36.6L34.2 34Z" fill="#fff"/>
<path d="M25 19L21 8.5" fill="none" stroke="#e6dcff" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>
<ellipse cx="28" cy="22.5" rx="4.5" ry="2.1" transform="rotate(-40 28 22.5)" fill="url(#gl-${uid})" opacity="1"/>
</g>
<path class="pfx-pulse" style="animation-delay:0s" d="M19 20A17 17 0 0 1 45 20" fill="none" stroke="#67e8f9" stroke-width=".9" stroke-linecap="round"/>
<path class="pfx-pulse" style="animation-delay:0.5s" d="M13 14A26 26 0 0 1 51 14" fill="none" stroke="#67e8f9" stroke-width=".9" stroke-linecap="round"/>
<path class="pfx-pulse" style="animation-delay:1s" d="M9 10A34 34 0 0 1 55 10" fill="none" stroke="#67e8f9" stroke-width=".9" stroke-linecap="round"/>
<g transform="translate(8 46) scale(0.6)">
<path class="pfx-twinkle" style="animation-delay:0.2s" fill="#e9d5ff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(56 48) scale(0.55)">
<path class="pfx-twinkle" style="animation-delay:1s" fill="#e9d5ff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_racoon: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#ffe08a" stop-opacity="0.5"/>
<stop offset="0.6" stop-color="#ffe08a" stop-opacity="0.2"/>
<stop offset="1" stop-color="#ffe08a" stop-opacity="0"/>
</radialGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#eceef2"/>
<stop offset="0.5" stop-color="#9aa2b0"/>
<stop offset="1" stop-color="#3b4352"/>
</radialGradient>
<radialGradient id="k-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#566073"/>
<stop offset="0.5" stop-color="#171c26"/>
<stop offset="1" stop-color="#030406"/>
</radialGradient>
<radialGradient id="wh-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#f4f6fa"/>
<stop offset="1" stop-color="#c4cad6"/>
</radialGradient>
<radialGradient id="gd-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fffbd0"/>
<stop offset="0.5" stop-color="#fcd34d"/>
<stop offset="1" stop-color="#b7770a"/>
</radialGradient>
<radialGradient id="nz-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#5b6475"/>
<stop offset="0.5" stop-color="#0d1118"/>
<stop offset="1" stop-color="#000"/>
</radialGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="34" r="30" fill="url(#au-${uid})"/>
<ellipse cx="32" cy="59" rx="19" ry="3.2" fill="url(#sh-${uid})"/>
<path d="M44 53Q58 55 56.5 41.5Q55.5 37 51 37.5" fill="none" stroke="#2f3745" stroke-width="8.6" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M44 53Q58 55 56.5 41.5Q55.5 37 51 37.5" fill="none" stroke="#a8b0bf" stroke-width="7.4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M44 53Q58 55 56.5 41.5Q55.5 37 51 37.5" fill="none" stroke="#252c39" stroke-width="7.4" stroke-dasharray="3.2 4.6" stroke-dashoffset="1.5"/>
<path d="M44 53Q58 55 56.5 41.5Q55.5 37 51 37.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".35" transform="translate(-1.2 -1.2)"/>
<g class="pfx-float">
<ellipse cx="32" cy="52" rx="13.5" ry="10.5" fill="url(#b-${uid})"/>
<ellipse cx="32" cy="54" rx="8" ry="7" fill="url(#wh-${uid})"/>
<ellipse cx="24" cy="58" rx="5.4" ry="2.8" fill="url(#k-${uid})"/>
<ellipse cx="40" cy="58" rx="5.4" ry="2.8" fill="url(#k-${uid})"/>
<path d="M16 23Q11 12 19.5 10.5Q26 11.5 27 18Z" fill="url(#k-${uid})"/>
<path d="M48 23Q53 12 44.5 10.5Q38 11.5 37 18Z" fill="url(#k-${uid})"/>
<path d="M18.5 19.5Q16.5 14.5 20.5 14.2Q23.6 15 24 18Z" fill="#e8c7cf"/>
<path d="M45.5 19.5Q47.5 14.5 43.5 14.2Q40.4 15 40 18Z" fill="#e8c7cf"/>
<ellipse cx="32" cy="30" rx="17.3" ry="14.5" fill="url(#b-${uid})"/>
<ellipse cx="24" cy="22.5" rx="4.2" ry="2.4" transform="rotate(-18 24 22.5)" fill="#fff" opacity=".9"/>
<ellipse cx="40" cy="22.5" rx="4.2" ry="2.4" transform="rotate(18 40 22.5)" fill="#fff" opacity=".9"/>
<path d="M14 29Q20 23 29 28L32 30.8L35 28Q44 23 50 29Q47 37.5 38 35.4Q34 34.4 32 35Q30 34.4 26 35.4Q17 37.5 14 29Z" fill="url(#k-${uid})"/>
<ellipse cx="32" cy="38" rx="8.2" ry="6.4" fill="url(#wh-${uid})"/>
<circle cx="24.3" cy="29.8" r="2.7" fill="#fff"/>
<circle cx="24.3" cy="30.2" r="1.8" fill="#0b1020"/>
<circle cx="23.7" cy="29.4" r=".7" fill="#fff"/>
<circle cx="39.7" cy="29.8" r="2.7" fill="#fff"/>
<circle cx="39.7" cy="30.2" r="1.8" fill="#0b1020"/>
<circle cx="39.1" cy="29.4" r=".7" fill="#fff"/>
<ellipse cx="32" cy="34.6" rx="2.8" ry="2" fill="url(#nz-${uid})"/>
<ellipse cx="31.1" cy="34" rx="1" ry=".5" fill="#fff" opacity=".75"/>
<path d="M32 36.6V38.4M32 38.4Q29.4 41 27.4 39M32 38.4Q34.6 41 36.6 39" fill="none" stroke="#2f3745" stroke-width="0.85" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="19" cy="37.5" rx="3" ry="1.8" fill="#fb7185" opacity="0.45"/>
<ellipse cx="45" cy="37.5" rx="3" ry="1.8" fill="#fb7185" opacity="0.45"/>
<g transform="translate(47 47) rotate(28)">
<circle cx="0" cy="-6" r="3.6" fill="none" stroke="#e6a512" stroke-width="1.8"/>
<circle cx="0" cy="-6" r="3.6" fill="none" stroke="#fff5b8" stroke-width=".5" opacity=".8"/>
<rect x="-.9" y="-2.6" width="1.8" height="10" rx=".8" fill="url(#gd-${uid})"/>
<path d="M.9 3.2H3.6V4.8H.9ZM.9 6H3V7.4H.9Z" fill="#d99a0b"/>
<ellipse cx="0" cy="3" rx="2.9" ry="2.4" fill="url(#k-${uid})"/>
</g>
<ellipse cx="26" cy="21" rx="7" ry="3" transform="rotate(-22 26 21)" fill="url(#gl-${uid})" opacity="1"/>
</g>
<g transform="translate(10 24) scale(0.65)">
<path class="pfx-twinkle" style="animation-delay:0.2s" fill="#fff3b0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(56 18) scale(0.55)">
<path class="pfx-twinkle" style="animation-delay:1s" fill="#fff3b0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_deer: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#fff1a8" stop-opacity="0.7"/>
<stop offset="0.6" stop-color="#fff1a8" stop-opacity="0.28"/>
<stop offset="1" stop-color="#fff1a8" stop-opacity="0"/>
</radialGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#f4cf9d"/>
<stop offset="0.5" stop-color="#c38a4a"/>
<stop offset="1" stop-color="#7a4a1e"/>
</radialGradient>
<radialGradient id="cr-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fffaf0"/>
<stop offset="0.5" stop-color="#f4e3c7"/>
<stop offset="1" stop-color="#d3b48a"/>
</radialGradient>
<linearGradient id="ant-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fffbd0"/>
<stop offset="0.5" stop-color="#fcd34d"/>
<stop offset="1" stop-color="#d97706"/>
</linearGradient>
<radialGradient id="nz-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#5c4a3f"/>
<stop offset="0.5" stop-color="#1c120d"/>
<stop offset="1" stop-color="#000"/>
</radialGradient>
<radialGradient id="pk-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fde1e1"/>
<stop offset="0.5" stop-color="#f1a9a9"/>
<stop offset="1" stop-color="#c06060"/>
</radialGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="30" r="31" fill="url(#au-${uid})"/>
<ellipse cx="32" cy="60" rx="14" ry="2.6" fill="url(#sh-${uid})"/>
<g class="pfx-float">
<path d="M25 22Q21 15 19 5M21.7 14.3Q16.5 12.5 13 8M20.2 9.6Q24 6.6 25 2" fill="none" stroke="#fff6c2" stroke-width="4.2" stroke-linecap="round" opacity=".35"/>
<path d="M25 22Q21 15 19 5M21.7 14.3Q16.5 12.5 13 8M20.2 9.6Q24 6.6 25 2" fill="none" stroke="url(#ant-${uid})" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M25 22Q21 15 19 5M21.7 14.3Q16.5 12.5 13 8M20.2 9.6Q24 6.6 25 2" fill="none" stroke="#fffde8" stroke-width=".6" stroke-linecap="round" opacity=".8"/>
<g transform="translate(64 0) scale(-1 1)">
<path d="M25 22Q21 15 19 5M21.7 14.3Q16.5 12.5 13 8M20.2 9.6Q24 6.6 25 2" fill="none" stroke="#fff6c2" stroke-width="4.2" stroke-linecap="round" opacity=".35"/>
<path d="M25 22Q21 15 19 5M21.7 14.3Q16.5 12.5 13 8M20.2 9.6Q24 6.6 25 2" fill="none" stroke="url(#ant-${uid})" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M25 22Q21 15 19 5M21.7 14.3Q16.5 12.5 13 8M20.2 9.6Q24 6.6 25 2" fill="none" stroke="#fffde8" stroke-width=".6" stroke-linecap="round" opacity=".8"/>
</g>
<path d="M24 46Q21 60 32 62.5Q43 60 40 46Z" fill="url(#b-${uid})"/>
<path d="M28 55Q32 60 36 55Q35 61 32 62Q29 61 28 55Z" fill="url(#cr-${uid})"/>
<ellipse cx="16" cy="27" rx="6.4" ry="3.5" transform="rotate(-24 16 27)" fill="url(#b-${uid})"/>
<ellipse cx="16.4" cy="27.2" rx="3.9" ry="1.9" transform="rotate(-24 16.4 27.2)" fill="url(#pk-${uid})"/>
<ellipse cx="48" cy="27" rx="6.4" ry="3.5" transform="rotate(24 48 27)" fill="url(#b-${uid})"/>
<ellipse cx="47.6" cy="27.2" rx="3.9" ry="1.9" transform="rotate(24 47.6 27.2)" fill="url(#pk-${uid})"/>
<path d="M32 56.5Q21 52.5 20 38Q20 27 25 22.5Q32 19.5 39 22.5Q44 27 44 38Q43 52.5 32 56.5Z" fill="url(#b-${uid})"/>
<ellipse cx="32" cy="48.5" rx="8.4" ry="6.6" fill="url(#cr-${uid})"/>
<ellipse cx="27.5" cy="28" rx="1.5" ry="2.1" fill="#fff" opacity=".85"/>
<ellipse cx="36.5" cy="28" rx="1.5" ry="2.1" fill="#fff" opacity=".85"/>
<ellipse cx="32" cy="25.5" rx="1.4" ry="1.9" fill="#fff" opacity=".85"/>
<ellipse cx="22.5" cy="43" rx="2.6" ry="1.7" fill="#fb7185" opacity="0.45"/>
<ellipse cx="41.5" cy="43" rx="2.6" ry="1.7" fill="#fb7185" opacity="0.45"/>
<ellipse cx="26.2" cy="36" rx="2.7" ry="3.4" fill="#2a170c"/>
<circle cx="25.25" cy="34.71" r="1.22" fill="#fff"/>
<circle cx="27.28" cy="37.36" r="0.54" fill="#fff" opacity=".85"/>
<ellipse cx="37.8" cy="36" rx="2.7" ry="3.4" fill="#2a170c"/>
<circle cx="36.85" cy="34.71" r="1.22" fill="#fff"/>
<circle cx="38.88" cy="37.36" r="0.54" fill="#fff" opacity=".85"/>
<ellipse cx="32" cy="52.2" rx="3.2" ry="2.2" fill="url(#nz-${uid})"/>
<ellipse cx="31" cy="51.5" rx="1.1" ry=".6" fill="#fff" opacity=".75"/>
<path d="M32 54.2V55.4M32 55.4Q30 57 28.4 55.8M32 55.4Q34 57 35.6 55.8" fill="none" stroke="#5a3a1c" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="27" cy="26.5" rx="4.6" ry="2.1" transform="rotate(-50 27 26.5)" fill="url(#gl-${uid})" opacity="0.8"/>
</g>
<circle class="pfx-twinkle" cx="19" cy="5" r="1.35" fill="#fff7c2" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:0.6s" cx="13" cy="8" r="1.35" fill="#fff7c2" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:1.2s" cx="25" cy="2" r="1.35" fill="#fff7c2" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:0.3s" cx="45" cy="5" r="1.35" fill="#fff7c2" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:0.9s" cx="51" cy="8" r="1.35" fill="#fff7c2" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:1.5s" cx="39" cy="2" r="1.35" fill="#fff7c2" opacity="1"/>
<g transform="translate(8 40) scale(0.6)">
<path class="pfx-twinkle" style="animation-delay:0.5s" fill="#fff7c2" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(56 42) scale(0.6)">
<path class="pfx-twinkle" style="animation-delay:1.1s" fill="#fff7c2" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_parrot: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#ffb4a2" stop-opacity="0.5"/>
<stop offset="0.6" stop-color="#ffb4a2" stop-opacity="0.2"/>
<stop offset="1" stop-color="#ffb4a2" stop-opacity="0"/>
</radialGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fecaca"/>
<stop offset="0.5" stop-color="#ef4444"/>
<stop offset="1" stop-color="#7f1d1d"/>
</radialGradient>
<radialGradient id="ch-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fff3b0"/>
<stop offset="0.5" stop-color="#fbbf24"/>
<stop offset="1" stop-color="#c2410c"/>
</radialGradient>
<linearGradient id="wg-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#93c5fd"/>
<stop offset="0.38" stop-color="#2563eb"/>
<stop offset="0.52" stop-color="#facc15"/>
<stop offset="1" stop-color="#f97316"/>
</linearGradient>
<radialGradient id="bk-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fffbe6"/>
<stop offset="0.5" stop-color="#f6dc92"/>
<stop offset="1" stop-color="#a5771a"/>
</radialGradient>
<radialGradient id="f1-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#93c5fd"/>
<stop offset="0.5" stop-color="#2563eb"/>
<stop offset="1" stop-color="#1e3a8a"/>
</radialGradient>
<radialGradient id="f2-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fdba74"/>
<stop offset="0.5" stop-color="#f97316"/>
<stop offset="1" stop-color="#9a3412"/>
</radialGradient>
<radialGradient id="f3-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#86efac"/>
<stop offset="0.5" stop-color="#16a34a"/>
<stop offset="1" stop-color="#14532d"/>
</radialGradient>
<linearGradient id="br-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#a9794a"/>
<stop offset="1" stop-color="#4e2f17"/>
</linearGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="34" r="30" fill="url(#au-${uid})"/>
<ellipse cx="32" cy="60" rx="20" ry="2.8" fill="url(#sh-${uid})"/>
<path d="M5 56Q30 52.5 59 57" fill="none" stroke="#4e2f17" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5 55Q30 51.5 59 56" fill="none" stroke="#b98552" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>
<g class="pfx-float">
<ellipse cx="17.5" cy="49.5" rx="3" ry="10.5" transform="rotate(38 17.5 49.5)" fill="url(#f3-${uid})"/>
<ellipse cx="22" cy="53" rx="3.3" ry="11" transform="rotate(22 22 53)" fill="url(#f1-${uid})"/>
<ellipse cx="27.5" cy="54" rx="3.3" ry="10.5" transform="rotate(8 27.5 54)" fill="url(#f2-${uid})"/>
<ellipse cx="32.5" cy="39" rx="14" ry="17.5" transform="rotate(8 32.5 39)" fill="url(#b-${uid})"/>
<ellipse cx="37.5" cy="42" rx="7" ry="10.5" transform="rotate(8 37.5 42)" fill="url(#ch-${uid})" opacity=".8"/>
<path d="M21 29Q12.5 42 19.5 54Q28.5 49.5 31.5 36Q28.5 29 21 29Z" fill="url(#wg-${uid})" stroke="#7f1d1d" stroke-width=".5" stroke-linejoin="round"/>
<path d="M17 41Q23 41 28 38M17.5 46Q23.5 46 29 43M19 51Q24 51 29 48" fill="none" stroke="#1e3a8a" stroke-width="0.55" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>
<path d="M33 12Q30.5 4.5 35 5Q33.8 8 37 10.5Z" fill="url(#f2-${uid})"/>
<path d="M36 11Q36.5 5 40 6.5Q38.4 8.5 40 11Z" fill="url(#ch-${uid})"/>
<circle cx="35" cy="21.5" r="11" fill="url(#b-${uid})"/>
<circle cx="37" cy="20.5" r="5" fill="#fff"/>
<circle cx="37.4" cy="20.8" r="2.6" fill="#1e293b"/>
<circle cx="36.5" cy="19.8" r=".95" fill="#fff"/>
<ellipse cx="30" cy="27" rx="2.6" ry="1.7" fill="#fbbf24" opacity="0.6"/>
<path d="M41.5 17.5Q54 15.5 53.5 27Q52.5 31.5 48.5 28.5Q50.5 22.5 42 22.5Z" fill="url(#bk-${uid})" stroke="#a5771a" stroke-width=".4"/>
<path d="M42.5 23.8Q47.5 25 50 28.6" fill="none" stroke="#a5771a" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="47" cy="19.4" rx="3" ry="1" fill="#fff" opacity=".7"/>
<path d="M31 54.5L30.4 58M34.5 54.8L34 58.2" fill="none" stroke="#e9b27a" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="30" cy="14.5" rx="5.5" ry="2.4" transform="rotate(-30 30 14.5)" fill="url(#gl-${uid})" opacity="1"/>
<ellipse cx="28" cy="32" rx="3.2" ry="6" transform="rotate(8 28 32)" fill="url(#gl-${uid})" opacity="0.6"/>
</g>
<circle class="pfx-twinkle" cx="10" cy="22" r="1.5" fill="#60a5fa" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:0.7s" cx="54" cy="40" r="1.4" fill="#facc15" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:1.3s" cx="12" cy="44" r="1.2" fill="#f472b6" opacity="1"/>
<g transform="translate(55 8) scale(0.6)">
<path class="pfx-twinkle" style="animation-delay:0.4s" fill="#fff7c2" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_chameleon: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#7ef2d4" stop-opacity="0.5"/>
<stop offset="0.6" stop-color="#7ef2d4" stop-opacity="0.2"/>
<stop offset="1" stop-color="#7ef2d4" stop-opacity="0"/>
</radialGradient>
<linearGradient id="cm-${uid}" x1="0" y1="0.2" x2="1" y2="0.8">
<stop offset="0" stop-color="#c1f26a"/>
<stop offset="0.35" stop-color="#34d399"/>
<stop offset="0.7" stop-color="#22d3ee"/>
<stop offset="1" stop-color="#8b8cf8"/>
</linearGradient>
<radialGradient id="hd-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#a3f0d0"/>
<stop offset="0.5" stop-color="#2fd0b0"/>
<stop offset="1" stop-color="#0f766e"/>
</radialGradient>
<radialGradient id="eg-${uid}" cx="0.4" cy="0.3" r="0.8">
<stop offset="0" stop-color="#fffbd0"/>
<stop offset="0.5" stop-color="#fcd34d"/>
<stop offset="1" stop-color="#b7770a"/>
</radialGradient>
<linearGradient id="br-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#a9794a"/>
<stop offset="1" stop-color="#4e2f17"/>
</linearGradient>
<linearGradient id="cr-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#f0abfc"/>
<stop offset="1" stop-color="#6d28d9"/>
</linearGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="34" r="30" fill="url(#au-${uid})"/>
<ellipse cx="32" cy="60" rx="24" ry="2.8" fill="url(#sh-${uid})"/>
<path d="M3 53Q32 46.5 61 55" fill="none" stroke="#4e2f17" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3 52Q32 45.5 61 54" fill="none" stroke="#b98552" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>
<g class="pfx-float">
<path d="M14 40Q3 41.5 4.2 50Q6.5 57 13.5 54.5Q18 51.5 14.5 47.4Q11.4 45 9.5 48" fill="none" stroke="#0f7a68" stroke-width="6.4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 40Q3 41.5 4.2 50Q6.5 57 13.5 54.5Q18 51.5 14.5 47.4Q11.4 45 9.5 48" fill="none" stroke="#62e0b8" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 40Q3 41.5 4.2 50Q6.5 57 13.5 54.5Q18 51.5 14.5 47.4Q11.4 45 9.5 48" fill="none" stroke="#d3ffe8" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity=".7" transform="translate(-.8 -.8)"/>
<path d="M36 45Q36.5 51 41 51.5" fill="none" stroke="#25a58a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36 45Q36.5 51 41 51.5" fill="none" stroke="#7ef2d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M23 45Q21 51 16.5 51" fill="none" stroke="#25a58a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M23 45Q21 51 16.5 51" fill="none" stroke="#7ef2d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="29.5" cy="37.5" rx="18.5" ry="12.6" transform="rotate(-6 29.5 37.5)" fill="url(#cm-${uid})"/>
<path d="M19 29Q22 37 19 46" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".28"/>
<path d="M26 27Q29 37 26 48" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".28"/>
<path d="M33 27Q36 37 33 47" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".28"/>
<circle cx="15" cy="35" r="1.2" fill="#fff" opacity=".6"/>
<circle cx="21" cy="31" r="1" fill="#fff" opacity=".6"/>
<circle cx="28" cy="29" r="0.9" fill="#fff" opacity=".6"/>
<circle cx="35" cy="29.5" r="1.1" fill="#fff" opacity=".6"/>
<circle cx="24" cy="41" r="1" fill="#fff" opacity=".6"/>
<circle cx="31" cy="43" r="0.8" fill="#fff" opacity=".6"/>
<path d="M37 27Q46 20 55 28Q54 36 46 41Q38 40 37 27Z" fill="url(#hd-${uid})"/>
<path d="M39 26Q46 17.5 52 27Z" fill="url(#cr-${uid})" opacity=".95"/>
<path d="M39.5 25.4Q46 18.6 51.6 26.4" fill="none" stroke="#fdf4ff" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>
<path d="M50 37Q56 38.5 58 35" fill="none" stroke="#0f5c4d" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="50.5" cy="34.5" rx="2" ry="1.2" fill="#f472b6" opacity="0.5"/>
<circle cx="47" cy="29.5" r="5.4" fill="#2fd0b0" stroke="#0f766e" stroke-width=".8"/>
<circle cx="47" cy="29.5" r="3.5" fill="url(#eg-${uid})"/>
<circle cx="47.6" cy="29.6" r="1.7" fill="#0b1020"/>
<circle cx="46.8" cy="28.6" r=".75" fill="#fff"/>
<ellipse cx="26" cy="29" rx="7" ry="2.6" transform="rotate(-10 26 29)" fill="url(#gl-${uid})" opacity="0.8"/>
<ellipse cx="45" cy="22" rx="3.6" ry="1.5" transform="rotate(-20 45 22)" fill="url(#gl-${uid})" opacity="0.7"/>
</g>
<circle class="pfx-twinkle" cx="10" cy="26" r="1.3" fill="#f9a8d4" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:0.6s" cx="55" cy="46" r="1.3" fill="#67e8f9" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:1.1s" cx="8" cy="60" r="1.3" fill="#bef264" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:1.6s" cx="22" cy="18" r="1.3" fill="#c4b5fd" opacity="1"/>
<g transform="translate(56 12) scale(0.6)">
<path class="pfx-twinkle" style="animation-delay:0.3s" fill="#e0fbff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_tiger: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#ff9a3c" stop-opacity="0.7"/>
<stop offset="0.6" stop-color="#ff9a3c" stop-opacity="0.28"/>
<stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/>
</radialGradient>
<radialGradient id="au2-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#ffe0a0" stop-opacity="0.55"/>
<stop offset="0.6" stop-color="#ffe0a0" stop-opacity="0.22"/>
<stop offset="1" stop-color="#ffe0a0" stop-opacity="0"/>
</radialGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffc468"/>
<stop offset="0.5" stop-color="#f6741a"/>
<stop offset="1" stop-color="#8f2d0c"/>
</radialGradient>
<radialGradient id="cr-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#fff1dc"/>
<stop offset="1" stop-color="#e8c9a0"/>
</radialGradient>
<radialGradient id="k-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#4a3b36"/>
<stop offset="0.5" stop-color="#150d0a"/>
<stop offset="1" stop-color="#000"/>
</radialGradient>
<radialGradient id="ey-${uid}" cx="0.4" cy="0.3" r="0.8">
<stop offset="0" stop-color="#fffbd0"/>
<stop offset="0.5" stop-color="#d9f24a"/>
<stop offset="1" stop-color="#6b8a10"/>
</radialGradient>
<radialGradient id="ns-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffb3a7"/>
<stop offset="0.5" stop-color="#e5605a"/>
<stop offset="1" stop-color="#8a2020"/>
</radialGradient>
<linearGradient id="gd-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fff3b0"/>
<stop offset="0.5" stop-color="#f5b81c"/>
<stop offset="1" stop-color="#9a5a05"/>
</linearGradient>
<radialGradient id="rb-${uid}" cx="0.4" cy="0.3" r="0.85">
<stop offset="0" stop-color="#fecaca"/>
<stop offset="0.5" stop-color="#ef4444"/>
<stop offset="1" stop-color="#7f1d1d"/>
</radialGradient>
<clipPath id="cp-${uid}">
<path transform="translate(3.2 -1.2) scale(.9)" d="M32 16Q22 16 16 22Q9 24 7 31Q9 33 7 38Q9 42 12 43Q15 52 24 56Q32 59 40 56Q49 52 52 43Q55 42 57 38Q55 33 57 31Q55 24 48 22Q42 16 32 16Z"/>
</clipPath>
<linearGradient id="shn-${uid}" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
<stop offset="0.5" stop-color="#ffffff" stop-opacity="0.6"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="32" r="31" fill="url(#au-${uid})"/>
<circle class="pfx-pulse" style="animation-delay:0.6s" cx="32" cy="32" r="24" fill="url(#au2-${uid})"/>
<circle class="pfx-spin" cx="32" cy="32" r="29.5" fill="none" stroke="#ffd9a0" stroke-width="0.9" stroke-dasharray="1.4 4.2" stroke-linecap="round" opacity="0.65"/>
<ellipse cx="32" cy="60.5" rx="16" ry="2.6" fill="url(#sh-${uid})"/>
<g class="pfx-float">
<path d="M14 54Q32 66 50 54L52 58Q32 72 12 58Z" fill="url(#b-${uid})" opacity="0"/>
<ellipse cx="32" cy="58" rx="18" ry="5.4" fill="url(#b-${uid})"/>
<path d="M15 52.5Q32 63.5 49 52.5L50.5 57Q32 69 13.5 57Z" fill="url(#gd-${uid})" stroke="#7a4604" stroke-width=".5"/>
<circle cx="20" cy="57.2" r=".9" fill="#fff3b0"/>
<circle cx="25" cy="59.6" r=".9" fill="#fff3b0"/>
<circle cx="39" cy="59.6" r=".9" fill="#fff3b0"/>
<circle cx="44" cy="57.2" r=".9" fill="#fff3b0"/>
<g transform="translate(3.2 -1.2) scale(.9)">
<circle cx="17" cy="17" r="7" fill="url(#b-${uid})" stroke="#140c08" stroke-width="1"/>
<circle cx="17" cy="17.5" r="3.8" fill="url(#cr-${uid})"/>
<circle cx="47" cy="17" r="7" fill="url(#b-${uid})" stroke="#140c08" stroke-width="1"/>
<circle cx="47" cy="17.5" r="3.8" fill="url(#cr-${uid})"/>
<path d="M32 16Q22 16 16 22Q9 24 7 31Q9 33 7 38Q9 42 12 43Q15 52 24 56Q32 59 40 56Q49 52 52 43Q55 42 57 38Q55 33 57 31Q55 24 48 22Q42 16 32 16Z" fill="url(#b-${uid})"/>
<ellipse cx="17" cy="40" rx="6.4" ry="5.4" fill="url(#cr-${uid})"/>
<ellipse cx="47" cy="40" rx="6.4" ry="5.4" fill="url(#cr-${uid})"/>
<ellipse cx="32" cy="45.5" rx="11.5" ry="9.5" fill="url(#cr-${uid})"/>
<path d="M23.5 18Q27 22 27.5 27Q24.5 24 23.5 18ZM18 22Q23 25 24 30Q20 28 18 22ZM7 31Q13 32 16 35Q11 35.5 7 31ZM7.5 38Q13 38 16 40.5Q11 41.5 7.5 38ZM12.5 43Q17 43 19.5 46Q15.5 47 12.5 43Z" fill="#140c08"/>
<g transform="translate(64 0) scale(-1 1)">
<path d="M23.5 18Q27 22 27.5 27Q24.5 24 23.5 18ZM18 22Q23 25 24 30Q20 28 18 22ZM7 31Q13 32 16 35Q11 35.5 7 31ZM7.5 38Q13 38 16 40.5Q11 41.5 7.5 38ZM12.5 43Q17 43 19.5 46Q15.5 47 12.5 43Z" fill="#140c08"/>
</g>
<path d="M32 16.5L29.8 24L32 27L34.2 24Z" fill="#140c08"/>
<path d="M20.5 31.5Q25 27.8 30.3 31.8Q25 34.5 20.5 31.5Z" fill="url(#ey-${uid})" stroke="#140c08" stroke-width=".6"/>
<path d="M43.5 31.5Q39 27.8 33.7 31.8Q39 34.5 43.5 31.5Z" fill="url(#ey-${uid})" stroke="#140c08" stroke-width=".6"/>
<circle cx="25.4" cy="31.2" r="1.7" fill="#0a0604"/>
<circle cx="38.6" cy="31.2" r="1.7" fill="#0a0604"/>
<circle cx="24.7" cy="30.4" r=".6" fill="#fff"/>
<circle cx="37.9" cy="30.4" r=".6" fill="#fff"/>
<path d="M18.5 27.5L30 30.4M45.5 27.5L34 30.4" fill="none" stroke="#140c08" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M28.3 38.6Q32 36.6 35.7 38.6Q34 42.6 32 43.2Q30 42.6 28.3 38.6Z" fill="url(#ns-${uid})" stroke="#7a2020" stroke-width=".4"/>
<ellipse cx="30.6" cy="38.2" rx="1.6" ry=".7" fill="#fff" opacity=".7"/>
<path d="M32 43.2V46.4M32 46.4Q28 50.6 23.8 47.6M32 46.4Q36 50.6 40.2 47.6" fill="none" stroke="#2a1008" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M27.4 47.6L29 51.8L30.6 48.2Z" fill="#fff" stroke="#d6c7b0" stroke-width=".3"/>
<path d="M36.6 47.6L35 51.8L33.4 48.2Z" fill="#fff" stroke="#d6c7b0" stroke-width=".3"/>
<circle cx="26" cy="43.5" r=".6" fill="#3a2418"/>
<circle cx="24.6" cy="45.8" r=".6" fill="#3a2418"/>
<circle cx="38" cy="43.5" r=".6" fill="#3a2418"/>
<circle cx="39.4" cy="45.8" r=".6" fill="#3a2418"/>
<path d="M9 30L15 24" fill="none" stroke="#fff0d0" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
</g>
<g clip-path="url(#cp-${uid})">
<rect class="pfx-sheen" style="animation-delay:0.4s" x="-16" y="-4" width="12" height="72" fill="url(#shn-${uid})"/>
</g>
<polygon points="32,53.8 36.4,58.3 32,63 27.6,58.3" fill="url(#rb-${uid})" stroke="#fde68a" stroke-width=".8"/>
<polygon points="32,53.8 34.2,58.3 32,63 29.8,58.3" fill="#fff" opacity=".18"/>
<path d="M29.4 57L31.4 55.6" stroke="#fff" stroke-width=".9" stroke-linecap="round" opacity=".9"/>
<ellipse cx="26" cy="21" rx="6.2" ry="2.7" transform="rotate(-35 26 21)" fill="url(#gl-${uid})" opacity="0.85"/>
</g>
<path class="pfx-flash" style="animation-delay:0.0s" d="M45 5L54 18" stroke="#ffd0c0" stroke-width="1.5" stroke-linecap="round" fill="none"/>
<path class="pfx-flash" style="animation-delay:0.2s" d="M48 5L57 18" stroke="#ffd0c0" stroke-width="1.5" stroke-linecap="round" fill="none"/>
<path class="pfx-flash" style="animation-delay:0.4s" d="M51 5L60 18" stroke="#ffd0c0" stroke-width="1.5" stroke-linecap="round" fill="none"/>
<circle class="pfx-rise" cx="10" cy="52" r="1.7" fill="#ffb36b" opacity="0.9"/>
<circle class="pfx-rise" style="animation-delay:0.9s" cx="54" cy="56" r="1.5" fill="#ff9a3c" opacity="0.9"/>
<circle class="pfx-rise" style="animation-delay:1.7s" cx="18" cy="58" r="1.2" fill="#ffd9a0" opacity="0.9"/>
<g transform="translate(8 20) scale(0.7)">
<path class="pfx-twinkle" style="animation-delay:0.1s" fill="#ffe9c4" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(57 40) scale(0.6)">
<path class="pfx-twinkle" style="animation-delay:0.9s" fill="#ffe9c4" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_lion: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#ffc83d" stop-opacity="0.75"/>
<stop offset="0.6" stop-color="#ffc83d" stop-opacity="0.3"/>
<stop offset="1" stop-color="#ffc83d" stop-opacity="0"/>
</radialGradient>
<radialGradient id="au2-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#fff1b0" stop-opacity="0.6"/>
<stop offset="0.6" stop-color="#fff1b0" stop-opacity="0.24"/>
<stop offset="1" stop-color="#fff1b0" stop-opacity="0"/>
</radialGradient>
<radialGradient id="m1-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fde587"/>
<stop offset="0.5" stop-color="#f59e0b"/>
<stop offset="1" stop-color="#8a3f06"/>
</radialGradient>
<radialGradient id="m2-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fff0a8"/>
<stop offset="0.5" stop-color="#fbbf24"/>
<stop offset="1" stop-color="#b45309"/>
</radialGradient>
<radialGradient id="f-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffe7ae"/>
<stop offset="0.5" stop-color="#eab05a"/>
<stop offset="1" stop-color="#a8651a"/>
</radialGradient>
<radialGradient id="cr-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fffaf0"/>
<stop offset="0.5" stop-color="#f8e4be"/>
<stop offset="1" stop-color="#d7b07a"/>
</radialGradient>
<radialGradient id="ns-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#c08074"/>
<stop offset="0.5" stop-color="#6e2c24"/>
<stop offset="1" stop-color="#2a0c08"/>
</radialGradient>
<linearGradient id="gd-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fff7c0"/>
<stop offset="0.5" stop-color="#f8bf20"/>
<stop offset="1" stop-color="#9a5a05"/>
</linearGradient>
<radialGradient id="rb-${uid}" cx="0.4" cy="0.3" r="0.85">
<stop offset="0" stop-color="#fecaca"/>
<stop offset="0.5" stop-color="#ef4444"/>
<stop offset="1" stop-color="#7f1d1d"/>
</radialGradient>
<radialGradient id="sp-${uid}" cx="0.4" cy="0.3" r="0.85">
<stop offset="0" stop-color="#e0f2fe"/>
<stop offset="0.5" stop-color="#38bdf8"/>
<stop offset="1" stop-color="#075985"/>
</radialGradient>
<clipPath id="cp-${uid}">
<circle cx="32" cy="34" r="25"/>
</clipPath>
<linearGradient id="shn-${uid}" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
<stop offset="0.5" stop-color="#ffffff" stop-opacity="0.6"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="33" r="31" fill="url(#au-${uid})"/>
<g class="pfx-spin" style="animation-duration:22s">
<polygon points="32,2 29.6,12 34.4,12" transform="rotate(0 32 32)" fill="#ffe27a" opacity=".55"/>
<polygon points="32,2 29.6,12 34.4,12" transform="rotate(30 32 32)" fill="#ffe27a" opacity=".55"/>
<polygon points="32,2 29.6,12 34.4,12" transform="rotate(60 32 32)" fill="#ffe27a" opacity=".55"/>
<polygon points="32,2 29.6,12 34.4,12" transform="rotate(90 32 32)" fill="#ffe27a" opacity=".55"/>
<polygon points="32,2 29.6,12 34.4,12" transform="rotate(120 32 32)" fill="#ffe27a" opacity=".55"/>
<polygon points="32,2 29.6,12 34.4,12" transform="rotate(150 32 32)" fill="#ffe27a" opacity=".55"/>
<polygon points="32,2 29.6,12 34.4,12" transform="rotate(180 32 32)" fill="#ffe27a" opacity=".55"/>
<polygon points="32,2 29.6,12 34.4,12" transform="rotate(210 32 32)" fill="#ffe27a" opacity=".55"/>
<polygon points="32,2 29.6,12 34.4,12" transform="rotate(240 32 32)" fill="#ffe27a" opacity=".55"/>
<polygon points="32,2 29.6,12 34.4,12" transform="rotate(270 32 32)" fill="#ffe27a" opacity=".55"/>
<polygon points="32,2 29.6,12 34.4,12" transform="rotate(300 32 32)" fill="#ffe27a" opacity=".55"/>
<polygon points="32,2 29.6,12 34.4,12" transform="rotate(330 32 32)" fill="#ffe27a" opacity=".55"/>
</g>
<circle class="pfx-pulse" style="animation-delay:0.5s" cx="32" cy="34" r="22" fill="url(#au2-${uid})"/>
<ellipse cx="32" cy="60.5" rx="17" ry="2.6" fill="url(#sh-${uid})"/>
<g class="pfx-float">
<ellipse cx="32" cy="15.5" rx="6" ry="9" transform="rotate(0 32 34)" fill="url(#m1-${uid})" stroke="#7a3604" stroke-width=".35"/>
<ellipse cx="32" cy="15.5" rx="6" ry="9" transform="rotate(24 32 34)" fill="url(#m1-${uid})" stroke="#7a3604" stroke-width=".35"/>
<ellipse cx="32" cy="15.5" rx="6" ry="9" transform="rotate(48 32 34)" fill="url(#m1-${uid})" stroke="#7a3604" stroke-width=".35"/>
<ellipse cx="32" cy="15.5" rx="6" ry="9" transform="rotate(72 32 34)" fill="url(#m1-${uid})" stroke="#7a3604" stroke-width=".35"/>
<ellipse cx="32" cy="15.5" rx="6" ry="9" transform="rotate(96 32 34)" fill="url(#m1-${uid})" stroke="#7a3604" stroke-width=".35"/>
<ellipse cx="32" cy="15.5" rx="6" ry="9" transform="rotate(120 32 34)" fill="url(#m1-${uid})" stroke="#7a3604" stroke-width=".35"/>
<ellipse cx="32" cy="15.5" rx="6" ry="9" transform="rotate(144 32 34)" fill="url(#m1-${uid})" stroke="#7a3604" stroke-width=".35"/>
<ellipse cx="32" cy="15.5" rx="6" ry="9" transform="rotate(168 32 34)" fill="url(#m1-${uid})" stroke="#7a3604" stroke-width=".35"/>
<ellipse cx="32" cy="15.5" rx="6" ry="9" transform="rotate(192 32 34)" fill="url(#m1-${uid})" stroke="#7a3604" stroke-width=".35"/>
<ellipse cx="32" cy="15.5" rx="6" ry="9" transform="rotate(216 32 34)" fill="url(#m1-${uid})" stroke="#7a3604" stroke-width=".35"/>
<ellipse cx="32" cy="15.5" rx="6" ry="9" transform="rotate(240 32 34)" fill="url(#m1-${uid})" stroke="#7a3604" stroke-width=".35"/>
<ellipse cx="32" cy="15.5" rx="6" ry="9" transform="rotate(264 32 34)" fill="url(#m1-${uid})" stroke="#7a3604" stroke-width=".35"/>
<ellipse cx="32" cy="15.5" rx="6" ry="9" transform="rotate(288 32 34)" fill="url(#m1-${uid})" stroke="#7a3604" stroke-width=".35"/>
<ellipse cx="32" cy="15.5" rx="6" ry="9" transform="rotate(312 32 34)" fill="url(#m1-${uid})" stroke="#7a3604" stroke-width=".35"/>
<ellipse cx="32" cy="15.5" rx="6" ry="9" transform="rotate(336 32 34)" fill="url(#m1-${uid})" stroke="#7a3604" stroke-width=".35"/>
<ellipse cx="32" cy="18.5" rx="4.6" ry="7.4" transform="rotate(12 32 34)" fill="url(#m2-${uid})" stroke="#a8560c" stroke-width=".3"/>
<ellipse cx="32" cy="18.5" rx="4.6" ry="7.4" transform="rotate(36 32 34)" fill="url(#m2-${uid})" stroke="#a8560c" stroke-width=".3"/>
<ellipse cx="32" cy="18.5" rx="4.6" ry="7.4" transform="rotate(60 32 34)" fill="url(#m2-${uid})" stroke="#a8560c" stroke-width=".3"/>
<ellipse cx="32" cy="18.5" rx="4.6" ry="7.4" transform="rotate(84 32 34)" fill="url(#m2-${uid})" stroke="#a8560c" stroke-width=".3"/>
<ellipse cx="32" cy="18.5" rx="4.6" ry="7.4" transform="rotate(108 32 34)" fill="url(#m2-${uid})" stroke="#a8560c" stroke-width=".3"/>
<ellipse cx="32" cy="18.5" rx="4.6" ry="7.4" transform="rotate(132 32 34)" fill="url(#m2-${uid})" stroke="#a8560c" stroke-width=".3"/>
<ellipse cx="32" cy="18.5" rx="4.6" ry="7.4" transform="rotate(156 32 34)" fill="url(#m2-${uid})" stroke="#a8560c" stroke-width=".3"/>
<ellipse cx="32" cy="18.5" rx="4.6" ry="7.4" transform="rotate(180 32 34)" fill="url(#m2-${uid})" stroke="#a8560c" stroke-width=".3"/>
<ellipse cx="32" cy="18.5" rx="4.6" ry="7.4" transform="rotate(204 32 34)" fill="url(#m2-${uid})" stroke="#a8560c" stroke-width=".3"/>
<ellipse cx="32" cy="18.5" rx="4.6" ry="7.4" transform="rotate(228 32 34)" fill="url(#m2-${uid})" stroke="#a8560c" stroke-width=".3"/>
<ellipse cx="32" cy="18.5" rx="4.6" ry="7.4" transform="rotate(252 32 34)" fill="url(#m2-${uid})" stroke="#a8560c" stroke-width=".3"/>
<ellipse cx="32" cy="18.5" rx="4.6" ry="7.4" transform="rotate(276 32 34)" fill="url(#m2-${uid})" stroke="#a8560c" stroke-width=".3"/>
<ellipse cx="32" cy="18.5" rx="4.6" ry="7.4" transform="rotate(300 32 34)" fill="url(#m2-${uid})" stroke="#a8560c" stroke-width=".3"/>
<ellipse cx="32" cy="18.5" rx="4.6" ry="7.4" transform="rotate(324 32 34)" fill="url(#m2-${uid})" stroke="#a8560c" stroke-width=".3"/>
<ellipse cx="32" cy="18.5" rx="4.6" ry="7.4" transform="rotate(348 32 34)" fill="url(#m2-${uid})" stroke="#a8560c" stroke-width=".3"/>
<circle cx="21.5" cy="25" r="3.8" fill="url(#f-${uid})"/>
<circle cx="42.5" cy="25" r="3.8" fill="url(#f-${uid})"/>
<circle cx="21.5" cy="25.4" r="1.9" fill="#d98a5a"/>
<circle cx="42.5" cy="25.4" r="1.9" fill="#d98a5a"/>
<circle cx="32" cy="36" r="13.4" fill="url(#f-${uid})"/>
<ellipse cx="32" cy="42.5" rx="8" ry="6.3" fill="url(#cr-${uid})"/>
<circle cx="27.5" cy="42" r=".6" fill="#8a5a30"/>
<circle cx="26.4" cy="44" r=".6" fill="#8a5a30"/>
<circle cx="36.5" cy="42" r=".6" fill="#8a5a30"/>
<circle cx="37.6" cy="44" r=".6" fill="#8a5a30"/>
<path d="M20.8 33.8Q25.2 30.8 30 34Q25.4 36.6 20.8 33.8Z" fill="#fde68a" stroke="#6e3a0a" stroke-width=".5"/>
<path d="M43.2 33.8Q38.8 30.8 34 34Q38.6 36.6 43.2 33.8Z" fill="#fde68a" stroke="#6e3a0a" stroke-width=".5"/>
<circle cx="25.4" cy="33.8" r="1.6" fill="#2a1306"/>
<circle cx="38.6" cy="33.8" r="1.6" fill="#2a1306"/>
<circle cx="24.8" cy="33.1" r=".55" fill="#fff"/>
<circle cx="38" cy="33.1" r=".55" fill="#fff"/>
<path d="M19.8 30.5L30 33.2M44.2 30.5L34 33.2" fill="none" stroke="#6e3a0a" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M29 38.8Q32 37 35 38.8Q33.8 42.2 32 42.7Q30.2 42.2 29 38.8Z" fill="url(#ns-${uid})"/>
<ellipse cx="30.6" cy="38.5" rx="1.4" ry=".6" fill="#fff" opacity=".7"/>
<path d="M32 42.7V45M32 45Q28.6 48.6 25.2 46.2M32 45Q35.4 48.6 38.8 46.2" fill="none" stroke="#5a2a0e" stroke-width="0.95" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="21.5" cy="41.5" rx="3" ry="1.8" fill="#f0724a" opacity="0.4"/>
<ellipse cx="42.5" cy="41.5" rx="3" ry="1.8" fill="#f0724a" opacity="0.4"/>
<g clip-path="url(#cp-${uid})">
<rect class="pfx-sheen" style="animation-delay:0.2s" x="-16" y="-4" width="12" height="72" fill="url(#shn-${uid})"/>
</g>
<path d="M22.4 14.5L21.2 5.5L26.6 9.6L32 3L37.4 9.6L42.8 5.5L41.6 14.5Q32 17 22.4 14.5Z" fill="url(#gd-${uid})" stroke="#8a4a04" stroke-width=".6" stroke-linejoin="round"/>
<circle cx="21.2" cy="5.3" r="1.6" fill="url(#rb-${uid})"/>
<circle cx="42.8" cy="5.3" r="1.6" fill="url(#rb-${uid})"/>
<circle cx="32" cy="3.2" r="1.9" fill="url(#sp-${uid})" stroke="#fff7c0" stroke-width=".4"/>
<ellipse cx="32" cy="11.4" rx="2.6" ry="1.9" fill="url(#rb-${uid})" stroke="#fff3b0" stroke-width=".4"/>
<path d="M24 13.2Q32 15.4 40 13.2" stroke="#fff7c0" stroke-width=".6" fill="none" opacity=".8"/>
<ellipse cx="26.5" cy="26" rx="6" ry="2.6" transform="rotate(-35 26.5 26)" fill="url(#gl-${uid})" opacity="0.8"/>
</g>
<g transform="translate(7 14) scale(0.8)">
<path class="pfx-twinkle" fill="#fff3b0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(57 20) scale(0.7)">
<path class="pfx-twinkle" style="animation-delay:0.6s" fill="#fff3b0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(8 54) scale(0.65)">
<path class="pfx-twinkle" style="animation-delay:1.2s" fill="#fff3b0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(56 54) scale(0.6)">
<path class="pfx-twinkle" style="animation-delay:1.8s" fill="#fff3b0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_eagle: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#8fd0ff" stop-opacity="0.65"/>
<stop offset="0.6" stop-color="#8fd0ff" stop-opacity="0.26"/>
<stop offset="1" stop-color="#8fd0ff" stop-opacity="0"/>
</radialGradient>
<radialGradient id="au2-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#ffe9a8" stop-opacity="0.5"/>
<stop offset="0.6" stop-color="#ffe9a8" stop-opacity="0.2"/>
<stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/>
</radialGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#b97a45"/>
<stop offset="0.5" stop-color="#5f381b"/>
<stop offset="1" stop-color="#241008"/>
</radialGradient>
<radialGradient id="wh-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#edf1f7"/>
<stop offset="1" stop-color="#aebacb"/>
</radialGradient>
<radialGradient id="bk-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fff4a8"/>
<stop offset="0.5" stop-color="#fbbf24"/>
<stop offset="1" stop-color="#a8520a"/>
</radialGradient>
<radialGradient id="ey-${uid}" cx="0.4" cy="0.3" r="0.85">
<stop offset="0" stop-color="#fffbd0"/>
<stop offset="0.5" stop-color="#fde047"/>
<stop offset="1" stop-color="#b7770a"/>
</radialGradient>
<linearGradient id="gd-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fff7c0"/>
<stop offset="0.5" stop-color="#f8bf20"/>
<stop offset="1" stop-color="#9a5a05"/>
</linearGradient>
<linearGradient id="wf-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fcd573"/>
<stop offset="0.45" stop-color="#a8672f"/>
<stop offset="1" stop-color="#3b2010"/>
</linearGradient>
<linearGradient id="wf2-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fff0b0"/>
<stop offset="0.5" stop-color="#e0a040"/>
<stop offset="1" stop-color="#6e4020"/>
</linearGradient>
<radialGradient id="sf-${uid}" cx="0.4" cy="0.3" r="0.85">
<stop offset="0" stop-color="#e0f2fe"/>
<stop offset="0.5" stop-color="#38bdf8"/>
<stop offset="1" stop-color="#075985"/>
</radialGradient>
<clipPath id="cp-${uid}">
<circle cx="32" cy="28" r="11.5"/>
</clipPath>
<linearGradient id="shn-${uid}" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
<stop offset="0.5" stop-color="#ffffff" stop-opacity="0.6"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="32" r="31" fill="url(#au-${uid})"/>
<circle class="pfx-pulse" style="animation-delay:0.5s" cx="32" cy="30" r="20" fill="url(#au2-${uid})"/>
<circle class="pfx-spin" cx="32" cy="32" r="29.5" fill="none" stroke="#bfe6ff" stroke-width="0.9" stroke-dasharray="1.4 4.4" stroke-linecap="round" opacity="0.65"/>
<ellipse cx="32" cy="60.5" rx="15" ry="2.6" fill="url(#sh-${uid})"/>
<path class="pfx-pulse" style="animation-delay:0.0s" d="M2 14Q9 12 15 15" stroke="#e8f6ff" stroke-width=".8" fill="none" stroke-linecap="round"/>
<path class="pfx-pulse" style="animation-delay:0.2s" d="M62 14Q55 12 49 15" stroke="#e8f6ff" stroke-width=".8" fill="none" stroke-linecap="round"/>
<path class="pfx-pulse" style="animation-delay:0.4s" d="M2 22Q9 20 15 23" stroke="#e8f6ff" stroke-width=".8" fill="none" stroke-linecap="round"/>
<path class="pfx-pulse" style="animation-delay:0.6000000000000001s" d="M62 22Q55 20 49 23" stroke="#e8f6ff" stroke-width=".8" fill="none" stroke-linecap="round"/>
<path class="pfx-pulse" style="animation-delay:0.8s" d="M2 30Q9 28 15 31" stroke="#e8f6ff" stroke-width=".8" fill="none" stroke-linecap="round"/>
<path class="pfx-pulse" style="animation-delay:1.0s" d="M62 30Q55 28 49 31" stroke="#e8f6ff" stroke-width=".8" fill="none" stroke-linecap="round"/>
<g class="pfx-float">
<g transform="translate(23 40) scale(.68) translate(-23 -40)">
<ellipse cx="23" cy="20" rx="4.2" ry="20" transform="rotate(-80 23 40)" fill="url(#wf-${uid})" stroke="#2a150a" stroke-width=".4"/>
<ellipse cx="23" cy="18" rx="4.4" ry="22" transform="rotate(-64 23 40)" fill="url(#wf-${uid})" stroke="#2a150a" stroke-width=".4"/>
<ellipse cx="23" cy="17" rx="4.4" ry="23" transform="rotate(-48 23 40)" fill="url(#wf-${uid})" stroke="#2a150a" stroke-width=".4"/>
<ellipse cx="23" cy="19" rx="4.2" ry="21" transform="rotate(-32 23 40)" fill="url(#wf-${uid})" stroke="#2a150a" stroke-width=".4"/>
<ellipse cx="23" cy="23" rx="4" ry="17" transform="rotate(-16 23 40)" fill="url(#wf-${uid})" stroke="#2a150a" stroke-width=".4"/>
<ellipse cx="23" cy="25" rx="3.2" ry="15" transform="rotate(-72 23 40)" fill="url(#wf2-${uid})" opacity=".95"/>
<ellipse cx="23" cy="23.5" rx="3.4" ry="16.5" transform="rotate(-56 23 40)" fill="url(#wf2-${uid})" opacity=".95"/>
<ellipse cx="23" cy="23.5" rx="3.4" ry="16.5" transform="rotate(-40 23 40)" fill="url(#wf2-${uid})" opacity=".95"/>
<ellipse cx="23" cy="26" rx="3.2" ry="14" transform="rotate(-24 23 40)" fill="url(#wf2-${uid})" opacity=".95"/>
</g>
<g transform="translate(64 0) scale(-1 1)">
<g transform="translate(23 40) scale(.68) translate(-23 -40)">
<ellipse cx="23" cy="20" rx="4.2" ry="20" transform="rotate(-80 23 40)" fill="url(#wf-${uid})" stroke="#2a150a" stroke-width=".4"/>
<ellipse cx="23" cy="18" rx="4.4" ry="22" transform="rotate(-64 23 40)" fill="url(#wf-${uid})" stroke="#2a150a" stroke-width=".4"/>
<ellipse cx="23" cy="17" rx="4.4" ry="23" transform="rotate(-48 23 40)" fill="url(#wf-${uid})" stroke="#2a150a" stroke-width=".4"/>
<ellipse cx="23" cy="19" rx="4.2" ry="21" transform="rotate(-32 23 40)" fill="url(#wf-${uid})" stroke="#2a150a" stroke-width=".4"/>
<ellipse cx="23" cy="23" rx="4" ry="17" transform="rotate(-16 23 40)" fill="url(#wf-${uid})" stroke="#2a150a" stroke-width=".4"/>
<ellipse cx="23" cy="25" rx="3.2" ry="15" transform="rotate(-72 23 40)" fill="url(#wf2-${uid})" opacity=".95"/>
<ellipse cx="23" cy="23.5" rx="3.4" ry="16.5" transform="rotate(-56 23 40)" fill="url(#wf2-${uid})" opacity=".95"/>
<ellipse cx="23" cy="23.5" rx="3.4" ry="16.5" transform="rotate(-40 23 40)" fill="url(#wf2-${uid})" opacity=".95"/>
<ellipse cx="23" cy="26" rx="3.2" ry="14" transform="rotate(-24 23 40)" fill="url(#wf2-${uid})" opacity=".95"/>
</g>
</g>
<ellipse cx="32" cy="48" rx="12.5" ry="14" fill="url(#b-${uid})"/>
<path d="M22.8 44Q26 47 29.2 44" stroke="#d9a76a" stroke-width=".6" fill="none" opacity=".7"/>
<path d="M28.8 44Q32 47 35.2 44" stroke="#d9a76a" stroke-width=".6" fill="none" opacity=".7"/>
<path d="M34.8 44Q38 47 41.2 44" stroke="#d9a76a" stroke-width=".6" fill="none" opacity=".7"/>
<path d="M25.8 49Q29 52 32.2 49" stroke="#d9a76a" stroke-width=".6" fill="none" opacity=".7"/>
<path d="M31.8 49Q35 52 38.2 49" stroke="#d9a76a" stroke-width=".6" fill="none" opacity=".7"/>
<path d="M22.8 54Q26 57 29.2 54" stroke="#d9a76a" stroke-width=".6" fill="none" opacity=".7"/>
<path d="M28.8 54Q32 57 35.2 54" stroke="#d9a76a" stroke-width=".6" fill="none" opacity=".7"/>
<path d="M34.8 54Q38 57 41.2 54" stroke="#d9a76a" stroke-width=".6" fill="none" opacity=".7"/>
<path d="M20.5 38.5Q32 45.5 43.5 38.5" stroke="url(#gd-${uid})" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M32 46.5L36.6 51.5L32 57L27.4 51.5Z" fill="url(#sf-${uid})" stroke="#fde68a" stroke-width=".9"/>
<path d="M32 46.5L34.4 51.5L32 57L29.6 51.5Z" fill="#fff" opacity=".2"/>
<path d="M29.2 50.4L31.2 48.8" stroke="#fff" stroke-width=".9" stroke-linecap="round"/>
<circle cx="32" cy="28" r="11.2" fill="url(#wh-${uid})"/>
<path d="M26.6 28.4Q32 25 37.4 28.4Q38 36 32.6 41Q31.6 36.6 32 33.6Q27.6 34.4 26.6 28.4Z" fill="url(#bk-${uid})" stroke="#a8520a" stroke-width=".5" stroke-linejoin="round"/>
<path d="M32 28.6V33" fill="none" stroke="#b8650c" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="29.6" cy="29.2" rx="1.6" ry=".8" fill="#fff" opacity=".7"/>
<ellipse cx="26.2" cy="26.6" rx="2.7" ry="2.3" fill="url(#ey-${uid})" stroke="#6b3f1c" stroke-width=".5"/>
<ellipse cx="37.8" cy="26.6" rx="2.7" ry="2.3" fill="url(#ey-${uid})" stroke="#6b3f1c" stroke-width=".5"/>
<circle cx="26.8" cy="26.7" r="1.35" fill="#0b0705"/>
<circle cx="37.2" cy="26.7" r="1.35" fill="#0b0705"/>
<circle cx="26.2" cy="26" r=".5" fill="#fff"/>
<circle cx="36.6" cy="26" r=".5" fill="#fff"/>
<path d="M21.8 23.6Q26.6 22.6 30 26.8M42.2 23.6Q37.4 22.6 34 26.8" fill="none" stroke="#5b3418" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
<g clip-path="url(#cp-${uid})">
<rect class="pfx-sheen" style="animation-delay:0.3s" x="-16" y="-4" width="12" height="72" fill="url(#shn-${uid})"/>
</g>
<ellipse cx="27" cy="20" rx="5.2" ry="2.3" transform="rotate(-35 27 20)" fill="url(#gl-${uid})" opacity="0.85"/>
</g>
<g transform="translate(10 12) rotate(30)">
<path class="pfx-fall" d="M0 0Q2.6 4 0 9Q-2.6 4 0 0Z" fill="#fff7e0" stroke="#d9a76a" stroke-width=".4"/>
</g>
<g transform="translate(54 24) rotate(-35)">
<path class="pfx-fall" style="animation-delay:1.2s" d="M0 0Q2.4 3.6 0 8Q-2.4 3.6 0 0Z" fill="#fff7e0" stroke="#d9a76a" stroke-width=".4"/>
</g>
<g transform="translate(6 50) scale(0.65)">
<path class="pfx-twinkle" style="animation-delay:0.2s" fill="#e0f4ff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(58 52) scale(0.6)">
<path class="pfx-twinkle" style="animation-delay:1s" fill="#fff3b0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_crocodile: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#86f39a" stop-opacity="0.6"/>
<stop offset="0.6" stop-color="#86f39a" stop-opacity="0.24"/>
<stop offset="1" stop-color="#86f39a" stop-opacity="0"/>
</radialGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#b0ee72"/>
<stop offset="0.5" stop-color="#3f9a3f"/>
<stop offset="1" stop-color="#12482a"/>
</radialGradient>
<radialGradient id="bl-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fcffb8"/>
<stop offset="0.5" stop-color="#d4e67e"/>
<stop offset="1" stop-color="#9ab648"/>
</radialGradient>
<radialGradient id="mo-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fda4af"/>
<stop offset="0.5" stop-color="#e11d48"/>
<stop offset="1" stop-color="#7f1034"/>
</radialGradient>
<radialGradient id="ey-${uid}" cx="0.4" cy="0.3" r="0.85">
<stop offset="0" stop-color="#fffbd0"/>
<stop offset="0.5" stop-color="#fde047"/>
<stop offset="1" stop-color="#b7770a"/>
</radialGradient>
<linearGradient id="sp-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#d5ff9a"/>
<stop offset="1" stop-color="#2c7a35"/>
</linearGradient>
<clipPath id="cp-${uid}">
<ellipse cx="28" cy="42" rx="18" ry="10"/>
<path d="M38 32Q50 30 61 36Q62 40 58 41L38 44Z"/>
</clipPath>
<linearGradient id="shn-${uid}" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
<stop offset="0.5" stop-color="#ffffff" stop-opacity="0.6"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="36" r="30" fill="url(#au-${uid})"/>
<ellipse cx="32" cy="58.5" rx="24" ry="3" fill="url(#sh-${uid})"/>
<g class="pfx-float">
<path d="M24 40Q12 40 4 50.5Q3 52.5 6 52Q14 47.5 26 51Z" fill="url(#b-${uid})"/>
<path d="M24 41Q13 41.5 6 50" fill="none" stroke="#d5ff9a" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>
<ellipse cx="22" cy="52" rx="5.2" ry="4" fill="url(#b-${uid})"/>
<ellipse cx="37" cy="52.5" rx="5.2" ry="4" fill="url(#b-${uid})"/>
<path d="M11 33.6L14 28.3L17 33Z" fill="url(#sp-${uid})" stroke="#1d5a28" stroke-width=".4" stroke-linejoin="round"/>
<path d="M17 33.6L20 27.58L23 33Z" fill="url(#sp-${uid})" stroke="#1d5a28" stroke-width=".4" stroke-linejoin="round"/>
<path d="M23 33.6L26 26.86L29 33Z" fill="url(#sp-${uid})" stroke="#1d5a28" stroke-width=".4" stroke-linejoin="round"/>
<path d="M29 33.6L32 26.86L35 33Z" fill="url(#sp-${uid})" stroke="#1d5a28" stroke-width=".4" stroke-linejoin="round"/>
<ellipse cx="28" cy="42" rx="18.4" ry="10.4" fill="url(#b-${uid})"/>
<path d="M12 46Q28 53 41 46Q38 51 28 52Q17 52 12 46Z" fill="url(#bl-${uid})" opacity=".9"/>
<path d="M15 40Q17 38 19 40" fill="none" stroke="#1d5a28" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
<path d="M21 38Q23 36 25 38" fill="none" stroke="#1d5a28" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
<path d="M27 37Q29 35 31 37" fill="none" stroke="#1d5a28" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
<path d="M33 38Q35 36 37 38" fill="none" stroke="#1d5a28" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
<path d="M19 44Q21 42 23 44" fill="none" stroke="#1d5a28" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
<path d="M25 43Q27 41 29 43" fill="none" stroke="#1d5a28" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
<path d="M38 43L58.5 41.6Q62 40.6 61.4 37Q50 30.2 38 32Z" fill="url(#b-${uid})" stroke="#1d5a28" stroke-width=".5" stroke-linejoin="round"/>
<path d="M38.5 43.4Q50 47.2 60.4 44.6Q56 50.4 46 50Q40 49.6 38.5 46Z" fill="url(#mo-${uid})" stroke="#1d5a28" stroke-width=".5" stroke-linejoin="round"/>
<path d="M44.5 45.2L45.7 42L46.9 45Z" fill="#fff" stroke="#e4dccb" stroke-width=".25"/>
<path d="M49 45.2L50.2 42L51.4 45Z" fill="#fff" stroke="#e4dccb" stroke-width=".25"/>
<path d="M53.5 45.2L54.7 42L55.9 45Z" fill="#fff" stroke="#e4dccb" stroke-width=".25"/>
<path d="M43 40.6L44.4 44.2L45.8 41.2Z" fill="#fff" stroke="#e4dccb" stroke-width=".25"/>
<path d="M47.5 40.6L48.9 44.2L50.3 41.2Z" fill="#fff" stroke="#e4dccb" stroke-width=".25"/>
<path d="M52 40.6L53.4 44.2L54.8 41.2Z" fill="#fff" stroke="#e4dccb" stroke-width=".25"/>
<path d="M56 40.6L57.4 44.2L58.8 41.2Z" fill="#fff" stroke="#e4dccb" stroke-width=".25"/>
<path d="M38.5 44.4Q50 48.4 60.2 45.8Q57 50.4 46 50.6Q40 50 38.5 46.4Z" fill="url(#b-${uid})" opacity="0"/>
<ellipse cx="55.6" cy="36.6" rx=".9" ry=".6" fill="#14502a"/>
<ellipse cx="58.6" cy="37.6" rx=".8" ry=".55" fill="#14502a"/>
<circle cx="45" cy="32.6" r="4.6" fill="url(#b-${uid})" stroke="#1d5a28" stroke-width=".6"/>
<circle cx="45.3" cy="32.8" r="3" fill="url(#ey-${uid})"/>
<ellipse cx="45.8" cy="32.9" rx=".9" ry="2.2" fill="#0b1a0b"/>
<circle cx="44.6" cy="31.8" r=".7" fill="#fff"/>
<path d="M40.4 30.8Q45 27.8 49.6 31.4" fill="none" stroke="#14502a" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M39 33Q50 30.6 60 36" fill="none" stroke="#e4ffc0" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/>
<g clip-path="url(#cp-${uid})">
<rect class="pfx-sheen" style="animation-delay:0.5s" x="-16" y="-4" width="12" height="72" fill="url(#shn-${uid})"/>
</g>
<ellipse cx="26" cy="36" rx="9" ry="2.4" transform="rotate(-8 26 36)" fill="url(#gl-${uid})" opacity="0.75"/>
</g>
<g transform="translate(50 26) scale(1)">
<path class="pfx-rise" fill="#fb7185" d="M0 2.4C-5 -1.6 -2.6 -6.6 0 -3.6C2.6 -6.6 5 -1.6 0 2.4Z"/>
</g>
<g transform="translate(56 22) scale(0.75)">
<path class="pfx-rise" style="animation-delay:0.8s" fill="#fda4af" d="M0 2.4C-5 -1.6 -2.6 -6.6 0 -3.6C2.6 -6.6 5 -1.6 0 2.4Z"/>
</g>
<g transform="translate(44 24) scale(0.65)">
<path class="pfx-rise" style="animation-delay:1.6s" fill="#f43f5e" d="M0 2.4C-5 -1.6 -2.6 -6.6 0 -3.6C2.6 -6.6 5 -1.6 0 2.4Z"/>
</g>
<circle class="pfx-twinkle" style="animation-delay:0.3s" cx="8" cy="30" r="1.4" fill="#bfffa8" opacity="1"/>
<g transform="translate(10 18) scale(0.6)">
<path class="pfx-twinkle" style="animation-delay:0.9s" fill="#e6ffd0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(56 54) scale(0.55)">
<path class="pfx-twinkle" style="animation-delay:1.5s" fill="#e6ffd0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_jellyfish: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#c084fc" stop-opacity="0.6"/>
<stop offset="0.6" stop-color="#c084fc" stop-opacity="0.24"/>
<stop offset="1" stop-color="#c084fc" stop-opacity="0"/>
</radialGradient>
<radialGradient id="au2-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#67e8f9" stop-opacity="0.55"/>
<stop offset="0.6" stop-color="#67e8f9" stop-opacity="0.22"/>
<stop offset="1" stop-color="#67e8f9" stop-opacity="0"/>
</radialGradient>
<radialGradient id="bl-${uid}" cx="0.38" cy="0.28" r="0.85">
<stop offset="0" stop-color="#f5feff" stop-opacity="0.95"/>
<stop offset="0.4" stop-color="#7cecfb" stop-opacity="0.85"/>
<stop offset="0.78" stop-color="#b08cfb" stop-opacity="0.8"/>
<stop offset="1" stop-color="#6d28d9" stop-opacity="0.75"/>
</radialGradient>
<radialGradient id="in-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.75"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</radialGradient>
<linearGradient id="tn-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#7cecfb" stop-opacity="0.95"/>
<stop offset="0.6" stop-color="#c084fc" stop-opacity="0.7"/>
<stop offset="1" stop-color="#a78bfa" stop-opacity="0"/>
</linearGradient>
<linearGradient id="tn2-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#f0abfc" stop-opacity="0.95"/>
<stop offset="0.6" stop-color="#c084fc" stop-opacity="0.75"/>
<stop offset="1" stop-color="#818cf8" stop-opacity="0"/>
</linearGradient>
<clipPath id="cp-${uid}">
<path d="M10 34Q10 8 32 8Q54 8 54 34Q50 38 46 35Q42 39 38 36Q35 40 32 36Q29 40 26 36Q22 39 18 35Q14 38 10 34Z"/>
</clipPath>
<linearGradient id="shn-${uid}" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
<stop offset="0.5" stop-color="#ffffff" stop-opacity="0.6"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="30" r="31" fill="url(#au-${uid})"/>
<circle class="pfx-pulse" style="animation-delay:0.5s" cx="32" cy="30" r="22" fill="url(#au2-${uid})"/>
<circle class="pfx-spin" cx="32" cy="32" r="29.5" fill="none" stroke="#a5f3fc" stroke-width="0.8" stroke-dasharray="1.2 4.8" stroke-linecap="round" opacity="0.6"/>
<g class="pfx-float">
<path class="pfx-sway" style="animation-delay:0.0s" d="M20 35Q15.5 44 21 50Q26.5 56 20 62" fill="none" stroke="url(#tn-${uid})" stroke-width="2.3" stroke-linecap="round"/>
<path class="pfx-sway" style="animation-delay:0.35s" d="M26 36Q22.5 46 28 52Q32.5 58 27 63" fill="none" stroke="url(#tn-${uid})" stroke-width="2.3" stroke-linecap="round"/>
<path class="pfx-sway" style="animation-delay:0.7s" d="M38 36Q41.5 46 36 52Q31.5 58 38 63" fill="none" stroke="url(#tn-${uid})" stroke-width="2.3" stroke-linecap="round"/>
<path class="pfx-sway" style="animation-delay:1.0499999999999998s" d="M44 35Q48.5 44 43 50Q37.5 56 44 62" fill="none" stroke="url(#tn-${uid})" stroke-width="2.3" stroke-linecap="round"/>
<path class="pfx-sway" style="animation-delay:.2s" d="M32 36Q36 46 31 52Q28 58 33 63" fill="none" stroke="url(#tn2-${uid})" stroke-width="3.6" stroke-linecap="round"/>
<path class="pfx-sway" style="animation-delay:.9s" d="M29 36Q26 45 30 50" fill="none" stroke="url(#tn2-${uid})" stroke-width="2.4" stroke-linecap="round"/>
<path d="M10 34Q10 8 32 8Q54 8 54 34Q50 38 46 35Q42 39 38 36Q35 40 32 36Q29 40 26 36Q22 39 18 35Q14 38 10 34Z" fill="url(#bl-${uid})" stroke="#d4faff" stroke-width=".9" stroke-linejoin="round"/>
<ellipse cx="32" cy="21" rx="15" ry="9.5" fill="url(#in-${uid})"/>
<path d="M32 34C25 28 23 18 32 16M32 34C39 28 41 18 32 16M32 34C28 26 28 20 32 16M32 34C36 26 36 20 32 16" fill="none" stroke="#f9a8d4" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>
<circle class="pfx-twinkle" cx="13" cy="28" r="1.1" fill="#e0fbff" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:0.5s" cx="18" cy="15" r="1.1" fill="#e0fbff" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:1s" cx="46" cy="15" r="1.1" fill="#e0fbff" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:1.5s" cx="51" cy="28" r="1.1" fill="#e0fbff" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:0.8s" cx="26" cy="10.5" r="1.1" fill="#e0fbff" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:0.2s" cx="38" cy="10.5" r="1.1" fill="#e0fbff" opacity="1"/>
<ellipse cx="25.5" cy="25" rx="2.2" ry="2.7" fill="#2a1458"/>
<circle cx="24.73" cy="23.97" r="0.99" fill="#fff"/>
<circle cx="26.38" cy="26.08" r="0.44" fill="#fff" opacity=".85"/>
<ellipse cx="38.5" cy="25" rx="2.2" ry="2.7" fill="#2a1458"/>
<circle cx="37.73" cy="23.97" r="0.99" fill="#fff"/>
<circle cx="39.38" cy="26.08" r="0.44" fill="#fff" opacity=".85"/>
<ellipse cx="21" cy="29" rx="2.8" ry="1.6" fill="#f472b6" opacity="0.55"/>
<ellipse cx="43" cy="29" rx="2.8" ry="1.6" fill="#f472b6" opacity="0.55"/>
<path d="M29.4 29.2Q32 31.8 34.6 29.2" fill="none" stroke="#4c1d95" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
<g clip-path="url(#cp-${uid})">
<rect class="pfx-sheen" style="animation-delay:0.6s" x="-16" y="-4" width="12" height="72" fill="url(#shn-${uid})"/>
</g>
<ellipse cx="22" cy="15.5" rx="7" ry="3" transform="rotate(-35 22 15.5)" fill="url(#gl-${uid})" opacity="0.9"/>
</g>
<path class="pfx-flash" style="animation-delay:0.0s" d="M7 27L11.5 22.5L9 19.5L14 15" stroke="#fff8b0" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path class="pfx-flash" style="animation-delay:0.9s" d="M7 27L11.5 22.5L9 19.5L14 15" transform="translate(0 14)" stroke="#fff8b0" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path class="pfx-flash" style="animation-delay:0.45s" d="M57 27L52.5 22.5L55 19.5L50 15" stroke="#fff8b0" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<path class="pfx-flash" style="animation-delay:1.35s" d="M57 27L52.5 22.5L55 19.5L50 15" transform="translate(0 14)" stroke="#fff8b0" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<circle class="pfx-rise" cx="9" cy="52" r="1.5" fill="#a5f3fc" opacity="0.9"/>
<circle class="pfx-rise" style="animation-delay:1.1s" cx="55" cy="56" r="1.3" fill="#f0abfc" opacity="0.9"/>
<g transform="translate(56 8) scale(0.6)">
<path class="pfx-twinkle" style="animation-delay:0.5s" fill="#e0fbff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_snake: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#5eead4" stop-opacity="0.6"/>
<stop offset="0.6" stop-color="#5eead4" stop-opacity="0.24"/>
<stop offset="1" stop-color="#5eead4" stop-opacity="0"/>
</radialGradient>
<radialGradient id="j-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#a8f5d0"/>
<stop offset="0.5" stop-color="#17b57c"/>
<stop offset="1" stop-color="#064e3b"/>
</radialGradient>
<radialGradient id="j2-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#d6ffe9"/>
<stop offset="0.5" stop-color="#5fe0a8"/>
<stop offset="1" stop-color="#0f8a5a"/>
</radialGradient>
<linearGradient id="gd-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fff7c0"/>
<stop offset="0.5" stop-color="#f8bf20"/>
<stop offset="1" stop-color="#9a5a05"/>
</linearGradient>
<radialGradient id="ey-${uid}" cx="0.4" cy="0.3" r="0.85">
<stop offset="0" stop-color="#fecdd3"/>
<stop offset="0.5" stop-color="#fb7185"/>
<stop offset="1" stop-color="#9f1239"/>
</radialGradient>
<radialGradient id="pt-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#f5d0fe"/>
<stop offset="0.5" stop-color="#c026d3"/>
<stop offset="1" stop-color="#701a75"/>
</radialGradient>
<radialGradient id="rb-${uid}" cx="0.4" cy="0.3" r="0.85">
<stop offset="0" stop-color="#d1fae5"/>
<stop offset="0.5" stop-color="#10b981"/>
<stop offset="1" stop-color="#064e3b"/>
</radialGradient>
<clipPath id="cp-${uid}">
<path d="M32 34Q16 31 14.5 17.5Q23 9.5 32 10.5Q41 9.5 49.5 17.5Q48 31 32 34Z"/>
<ellipse cx="32" cy="55" rx="22" ry="6"/>
<ellipse cx="32" cy="50" rx="17" ry="5.2"/>
</clipPath>
<linearGradient id="shn-${uid}" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
<stop offset="0.5" stop-color="#ffffff" stop-opacity="0.6"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="34" r="31" fill="url(#au-${uid})"/>
<circle class="pfx-spin" cx="32" cy="32" r="29.5" fill="none" stroke="#99f6e4" stroke-width="0.9" stroke-dasharray="1.4 4.4" stroke-linecap="round" opacity="0.65"/>
<ellipse cx="32" cy="59" rx="21" ry="2.6" fill="url(#sh-${uid})"/>
<g class="pfx-float">
<g transform="translate(0 -2.6)">
<ellipse cx="32" cy="56" rx="21" ry="4.8" fill="none" stroke="#0a5a40" stroke-width="8.8"/>
<ellipse cx="32" cy="56" rx="21" ry="4.8" fill="none" stroke="url(#j-${uid})" stroke-width="7.4"/>
<ellipse cx="32" cy="55.1" rx="21" ry="4.8" fill="none" stroke="#d6ffe9" stroke-width="1.2" opacity=".55" stroke-dasharray="18.900000000000002 7.35 10.5 100"/>
<ellipse cx="32" cy="50.5" rx="16.5" ry="4.4" fill="none" stroke="#0a5a40" stroke-width="8.4"/>
<ellipse cx="32" cy="50.5" rx="16.5" ry="4.4" fill="none" stroke="url(#j-${uid})" stroke-width="7"/>
<ellipse cx="32" cy="49.6" rx="16.5" ry="4.4" fill="none" stroke="#d6ffe9" stroke-width="1.2" opacity=".55" stroke-dasharray="14.85 5.7749999999999995 8.25 100"/>
<path d="M28 49Q16 41 27 33Q35 28 32 22" fill="none" stroke="#0a5a40" stroke-width="10.8" stroke-linecap="round"/>
<path d="M28 49Q16 41 27 33Q35 28 32 22" fill="none" stroke="url(#j-${uid})" stroke-width="9.2" stroke-linecap="round"/>
<path d="M28 49Q16 41 27 33Q35 28 32 22" fill="none" stroke="#d6ffe9" stroke-width="1.4" stroke-linecap="round" opacity=".5" transform="translate(-2 -.5)"/>
<polygon points="24,42.5 25.7,44.5 24,46.5 22.3,44.5" fill="url(#gd-${uid})" opacity=".95"/>
<polygon points="21.2,37.5 22.9,39.5 21.2,41.5 19.5,39.5" fill="url(#gd-${uid})" opacity=".95"/>
<polygon points="25,32.8 26.7,34.8 25,36.8 23.3,34.8" fill="url(#gd-${uid})" opacity=".95"/>
<polygon points="30,29 31.7,31 30,33 28.3,31" fill="url(#gd-${uid})" opacity=".95"/>
<path d="M32 34Q16 31 14.5 17.5Q23 9.5 32 10.5Q41 9.5 49.5 17.5Q48 31 32 34Z" fill="url(#j-${uid})" stroke="#0a5a40" stroke-width=".8" stroke-linejoin="round"/>
<path d="M14.5 17.5Q23 9.5 32 10.5Q41 9.5 49.5 17.5" fill="none" stroke="url(#gd-${uid})" stroke-width="1.6" stroke-linecap="round"/>
<circle cx="25.4" cy="23" r="3.9" fill="none" stroke="url(#gd-${uid})" stroke-width="1.3"/>
<circle cx="38.6" cy="23" r="3.9" fill="none" stroke="url(#gd-${uid})" stroke-width="1.3"/>
<path d="M29.3 23Q32 25 34.7 23" fill="none" stroke="url(#gd-${uid})" stroke-width="1.2"/>
<circle cx="25.4" cy="23" r="1.3" fill="url(#rb-${uid})"/>
<circle cx="38.6" cy="23" r="1.3" fill="url(#rb-${uid})"/>
<polygon points="32,27.8 33.4,29.5 32,31.2 30.6,29.5" fill="url(#gd-${uid})" opacity=".85"/>
<polygon points="28,26.3 29.4,28 28,29.7 26.6,28" fill="url(#gd-${uid})" opacity=".85"/>
<polygon points="36,26.3 37.4,28 36,29.7 34.6,28" fill="url(#gd-${uid})" opacity=".85"/>
<polygon points="22,15.8 23.4,17.5 22,19.2 20.6,17.5" fill="url(#gd-${uid})" opacity=".85"/>
<polygon points="42,15.8 43.4,17.5 42,19.2 40.6,17.5" fill="url(#gd-${uid})" opacity=".85"/>
<polygon points="32,13.3 33.4,15 32,16.7 30.6,15" fill="url(#gd-${uid})" opacity=".85"/>
<g clip-path="url(#cp-${uid})">
<rect class="pfx-sheen" style="animation-delay:0.3s" x="-16" y="-4" width="12" height="72" fill="url(#shn-${uid})"/>
</g>
<path d="M32 22.2V25.2L30.2 28M32 25.2L33.8 28" fill="none" stroke="#fb2d56" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="32" cy="15.5" rx="7.4" ry="6.6" fill="url(#j2-${uid})" stroke="#0a5a40" stroke-width=".7"/>
<ellipse cx="28.6" cy="14.2" rx="2" ry="2.3" fill="url(#ey-${uid})"/>
<ellipse cx="35.4" cy="14.2" rx="2" ry="2.3" fill="url(#ey-${uid})"/>
<ellipse cx="28.7" cy="14.3" rx=".6" ry="1.7" fill="#1a0610"/>
<ellipse cx="35.3" cy="14.3" rx=".6" ry="1.7" fill="#1a0610"/>
<circle cx="28" cy="13.4" r=".55" fill="#fff"/>
<circle cx="34.8" cy="13.4" r=".55" fill="#fff"/>
<path d="M26.6 11.6Q28.6 10.6 30.4 12M37.4 11.6Q35.4 10.6 33.6 12" fill="none" stroke="#0a5a40" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M28.8 19.2Q32 20.8 35.2 19.2" fill="none" stroke="#0a5a40" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M29.8 19.6L30.4 21.4L31 19.9ZM33 19.9L33.6 21.4L34.2 19.6Z" fill="#fff"/>
<polygon points="32,6.6 33.6,8.6 32,10.6 30.4,8.6" fill="url(#rb-${uid})" stroke="#fde68a" stroke-width=".5"/>
<ellipse cx="27" cy="12.4" rx="4.2" ry="1.8" transform="rotate(-30 27 12.4)" fill="url(#gl-${uid})" opacity="0.9"/>
</g>
</g>
<g transform="translate(52 40) scale(1)">
<g class="pfx-rise" style="animation-delay:0s">
<ellipse cx="0" cy="-2.6" rx="1.5" ry="2.5" transform="rotate(0)" fill="url(#pt-${uid})"/>
<ellipse cx="0" cy="-2.6" rx="1.5" ry="2.5" transform="rotate(72)" fill="url(#pt-${uid})"/>
<ellipse cx="0" cy="-2.6" rx="1.5" ry="2.5" transform="rotate(144)" fill="url(#pt-${uid})"/>
<ellipse cx="0" cy="-2.6" rx="1.5" ry="2.5" transform="rotate(216)" fill="url(#pt-${uid})"/>
<ellipse cx="0" cy="-2.6" rx="1.5" ry="2.5" transform="rotate(288)" fill="url(#pt-${uid})"/>
<circle r="1.3" fill="#bef264"/>
</g>
</g>
<g transform="translate(11 36) scale(0.85)">
<g class="pfx-rise" style="animation-delay:1.2s">
<ellipse cx="0" cy="-2.6" rx="1.5" ry="2.5" transform="rotate(0)" fill="url(#pt-${uid})"/>
<ellipse cx="0" cy="-2.6" rx="1.5" ry="2.5" transform="rotate(72)" fill="url(#pt-${uid})"/>
<ellipse cx="0" cy="-2.6" rx="1.5" ry="2.5" transform="rotate(144)" fill="url(#pt-${uid})"/>
<ellipse cx="0" cy="-2.6" rx="1.5" ry="2.5" transform="rotate(216)" fill="url(#pt-${uid})"/>
<ellipse cx="0" cy="-2.6" rx="1.5" ry="2.5" transform="rotate(288)" fill="url(#pt-${uid})"/>
<circle r="1.3" fill="#bef264"/>
</g>
</g>
<circle class="pfx-rise" style="animation-delay:0.6s" cx="49" cy="30" r="1.3" fill="#bef264" opacity="0.95"/>
<circle class="pfx-rise" style="animation-delay:1.9s" cx="14" cy="46" r="1.2" fill="#bef264" opacity="0.95"/>
<g transform="translate(56 14) scale(0.65)">
<path class="pfx-twinkle" style="animation-delay:0.2s" fill="#d6fff0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(7 12) scale(0.55)">
<path class="pfx-twinkle" style="animation-delay:1.1s" fill="#d6fff0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_kirin: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#a78bfa" stop-opacity="0.75"/>
<stop offset="0.6" stop-color="#a78bfa" stop-opacity="0.3"/>
<stop offset="1" stop-color="#a78bfa" stop-opacity="0"/>
</radialGradient>
<radialGradient id="au2-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#7cc4ff" stop-opacity="0.6"/>
<stop offset="0.6" stop-color="#7cc4ff" stop-opacity="0.24"/>
<stop offset="1" stop-color="#7cc4ff" stop-opacity="0"/>
</radialGradient>
<radialGradient id="gx-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#6d4cf0" stop-opacity="0.5"/>
<stop offset="0.7" stop-color="#2a1a8a" stop-opacity="0.75"/>
<stop offset="1" stop-color="#0b0a40" stop-opacity="0"/>
</radialGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#dcebff"/>
<stop offset="1" stop-color="#86aef0"/>
</radialGradient>
<linearGradient id="mn-${uid}" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#7cc4ff"/>
<stop offset="0.5" stop-color="#a78bfa"/>
<stop offset="1" stop-color="#f0abfc"/>
</linearGradient>
<linearGradient id="mn2-${uid}" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#e0f2fe"/>
<stop offset="0.5" stop-color="#c4b5fd"/>
<stop offset="1" stop-color="#fbcfe8"/>
</linearGradient>
<linearGradient id="hn-${uid}" x1="0" y1="1" x2="0" y2="0">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#a5f3fc"/>
<stop offset="1" stop-color="#60a5fa"/>
</linearGradient>
<linearGradient id="gd-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fff7c0"/>
<stop offset="0.5" stop-color="#f8bf20"/>
<stop offset="1" stop-color="#9a5a05"/>
</linearGradient>
<radialGradient id="ir-${uid}" cx="0.4" cy="0.3" r="0.85">
<stop offset="0" stop-color="#e9d5ff"/>
<stop offset="0.5" stop-color="#8b5cf6"/>
<stop offset="1" stop-color="#2e1065"/>
</radialGradient>
<radialGradient id="pk-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fde1ef"/>
<stop offset="0.5" stop-color="#f9a8d4"/>
<stop offset="1" stop-color="#be185d"/>
</radialGradient>
<linearGradient id="cl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/>
<stop offset="1" stop-color="#c7dcff" stop-opacity="0.9"/>
</linearGradient>
<radialGradient id="gm-${uid}" cx="0.4" cy="0.3" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#7cc4ff"/>
<stop offset="1" stop-color="#1d4ed8"/>
</radialGradient>
<clipPath id="cp-${uid}">
<path d="M16 62Q15 44 24 31Q28 22 36 19Q46 18 53 25Q58 29 57 34Q56 38 51 38.5Q45 39 43 43Q42 52 45 62Z"/>
</clipPath>
<linearGradient id="shn-${uid}" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
<stop offset="0.5" stop-color="#ffffff" stop-opacity="0.6"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="32" r="32" fill="url(#au-${uid})"/>
<circle class="pfx-pulse" style="animation-delay:0.5s" cx="32" cy="30" r="22" fill="url(#au2-${uid})"/>
<g class="pfx-spin" style="animation-duration:60s">
<circle cx="32" cy="32" r="27.5" fill="url(#gx-${uid})"/>
<circle cx="12" cy="14" r="0.7" fill="#fff" opacity=".85"/>
<circle cx="20" cy="8" r="0.5" fill="#fff" opacity=".85"/>
<circle cx="48" cy="9" r="0.6" fill="#fff" opacity=".85"/>
<circle cx="56" cy="18" r="0.8" fill="#fff" opacity=".85"/>
<circle cx="8" cy="30" r="0.6" fill="#fff" opacity=".85"/>
<circle cx="58" cy="40" r="0.6" fill="#fff" opacity=".85"/>
<circle cx="10" cy="50" r="0.7" fill="#fff" opacity=".85"/>
<circle cx="54" cy="52" r="0.5" fill="#fff" opacity=".85"/>
<circle cx="40" cy="6" r="0.5" fill="#fff" opacity=".85"/>
<circle cx="6" cy="22" r="0.5" fill="#fff" opacity=".85"/>
</g>
<polyline points="8,36 12,22 21,14 18,28 8,36" fill="none" stroke="#bfdbfe" stroke-width=".5" stroke-dasharray="1.2 1.2" opacity=".7"/>
<polyline points="52,10 58,20 55,34" fill="none" stroke="#bfdbfe" stroke-width=".5" stroke-dasharray="1.2 1.2" opacity=".7"/>
<circle cx="8" cy="36" r="1.1" fill="#e0f2fe"/>
<circle cx="12" cy="22" r="1.1" fill="#e0f2fe"/>
<circle cx="21" cy="14" r="1.1" fill="#e0f2fe"/>
<circle cx="18" cy="28" r="1.1" fill="#e0f2fe"/>
<circle cx="52" cy="10" r="1.1" fill="#e0f2fe"/>
<circle cx="58" cy="20" r="1.1" fill="#e0f2fe"/>
<circle cx="55" cy="34" r="1.1" fill="#e0f2fe"/>
<circle class="pfx-spin" cx="32" cy="32" r="30.5" fill="none" stroke="#ddd6fe" stroke-width="0.9" stroke-dasharray="1.6 4.6" stroke-linecap="round" opacity="0.75"/>
<circle class="pfx-spin-r" cx="32" cy="32" r="26.5" fill="none" stroke="#93c5fd" stroke-width="0.7" stroke-dasharray=".8 3.2" stroke-linecap="round" opacity="0.5"/>
<g class="pfx-spin" style="animation-duration:16s">
<g transform="translate(62.5 32.0) scale(0.7)">
<path fill="#fff3b0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(32.0 62.5) scale(0.55)">
<path fill="#e0f2fe" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(1.5 32.0) scale(0.7)">
<path fill="#fbcfe8" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(32.0 1.5) scale(0.55)">
<path fill="#e0f2fe" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</g>
<g class="pfx-float">
<path d="M31 19Q15 21 12 40Q11 51 15.5 59Q17.5 45 24 36Q26.5 27 31 19Z" fill="url(#mn-${uid})" stroke="#4c1d95" stroke-width=".4"/>
<path d="M33 24Q22 29 19.5 44Q19.5 52 22 58Q26 47 30 37Z" fill="url(#mn2-${uid})" opacity=".95"/>
<path d="M29 17Q20 14 14 20Q22 19 26 24Z" fill="url(#mn-${uid})"/>
<path d="M16 62Q15 44 24 31Q28 22 36 19Q46 18 53 25Q58 29 57 34Q56 38 51 38.5Q45 39 43 43Q42 52 45 62Z" fill="url(#b-${uid})" stroke="#7fa6e8" stroke-width=".5" stroke-linejoin="round"/>
<path d="M23 40Q27 46 26 58M29 38Q33 44 32 58M36 40Q39 48 38 60" fill="none" stroke="#bcd4ff" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
<path d="M30 25L28.5 11L37.5 20.5Z" fill="url(#b-${uid})" stroke="#7fa6e8" stroke-width=".4"/>
<path d="M30.6 22.5L29.8 14.5L35.2 20.4Z" fill="url(#pk-${uid})"/>
<path d="M36.8 20.4L45 1.5L42 21.4Z" fill="url(#hn-${uid})" stroke="#7cc4ff" stroke-width=".5" stroke-linejoin="round"/>
<path d="M37.4 18.8L43 14.4M38.2 15.8L43.6 11.6M39.2 12.6L44 8.8M40.4 9.2L44.3 6.2" fill="none" stroke="#ffffff" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>
<ellipse cx="44.6" cy="29.6" rx="2.8" ry="3.2" fill="url(#ir-${uid})" stroke="#2e1065" stroke-width=".6"/>
<circle cx="45.6" cy="28.4" r="1" fill="#fff"/>
<circle cx="43.8" cy="31" r=".5" fill="#fff" opacity=".8"/>
<path d="M40.6 26.2Q44.4 24 48.2 27" fill="none" stroke="#2e1065" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M48.4 27.4L50.4 26.4" fill="none" stroke="#2e1065" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="54.6" cy="31.4" rx="1" ry=".75" fill="#a24a7c"/>
<path d="M56.8 35.4Q53.4 37 50 35.8" fill="none" stroke="#8a4a7c" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="47.5" cy="34.5" rx="3.2" ry="2" fill="#f472b6" opacity="0.5"/>
<g clip-path="url(#cp-${uid})">
<rect class="pfx-sheen" style="animation-delay:0.4s" x="-16" y="-4" width="12" height="72" fill="url(#shn-${uid})"/>
</g>
<path d="M15.5 55.5Q30 51 45 55.5L45 60Q30 55.5 15.5 60Z" fill="url(#gd-${uid})" stroke="#8a4a04" stroke-width=".5"/>
<circle cx="30" cy="56" r="3.4" fill="url(#gm-${uid})" stroke="#fde68a" stroke-width=".7"/>
<path d="M28.4 55L30 53.6L31.4 55" stroke="#fff" stroke-width=".6" fill="none" opacity=".9"/>
<ellipse cx="33" cy="24" rx="6" ry="2.4" transform="rotate(-35 33 24)" fill="url(#gl-${uid})" opacity="0.85"/>
</g>
<ellipse cx="12" cy="61.5" rx="9" ry="5" fill="url(#cl-${uid})"/>
<ellipse cx="26" cy="61.8" rx="9.5" ry="5" fill="url(#cl-${uid})"/>
<ellipse cx="43" cy="62.1" rx="10.5" ry="5" fill="url(#cl-${uid})"/>
<ellipse cx="55" cy="62.4" rx="7.5" ry="5" fill="url(#cl-${uid})"/>
<g transform="translate(45 1.5) scale(.9)">
<path class="pfx-twinkle" fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<circle class="pfx-rise" cx="10" cy="46" r="1.6" fill="#fff3b0" opacity="0.95"/>
<circle class="pfx-rise" style="animation-delay:0.8s" cx="20" cy="54" r="1.3" fill="#e0f2fe" opacity="0.95"/>
<circle class="pfx-rise" style="animation-delay:1.6s" cx="52" cy="46" r="1.4" fill="#fbcfe8" opacity="0.95"/>
<circle class="pfx-rise" style="animation-delay:2.2s" cx="36" cy="50" r="1.1" fill="#fff" opacity="0.95"/>
<g transform="translate(6 8) scale(0.75)">
<path class="pfx-twinkle" style="animation-delay:0.2s" fill="#fff3b0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(58 30) scale(0.7)">
<path class="pfx-twinkle" style="animation-delay:1.1s" fill="#e0f2fe" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_gryphon: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#ffd23a" stop-opacity="0.8"/>
<stop offset="0.6" stop-color="#ffd23a" stop-opacity="0.32"/>
<stop offset="1" stop-color="#ffd23a" stop-opacity="0"/>
</radialGradient>
<radialGradient id="au2-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#7dd3fc" stop-opacity="0.55"/>
<stop offset="0.6" stop-color="#7dd3fc" stop-opacity="0.22"/>
<stop offset="1" stop-color="#7dd3fc" stop-opacity="0"/>
</radialGradient>
<radialGradient id="hd-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fffdf0"/>
<stop offset="0.5" stop-color="#f8e08a"/>
<stop offset="1" stop-color="#b8860b"/>
</radialGradient>
<radialGradient id="bk-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffe08a"/>
<stop offset="0.5" stop-color="#f59e0b"/>
<stop offset="1" stop-color="#9a3412"/>
</radialGradient>
<radialGradient id="mf-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fff0a0"/>
<stop offset="0.5" stop-color="#f7b92a"/>
<stop offset="1" stop-color="#a5600a"/>
</radialGradient>
<linearGradient id="wf-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#fff3a0"/>
<stop offset="0.45" stop-color="#e8a21e"/>
<stop offset="1" stop-color="#7a3f06"/>
</linearGradient>
<linearGradient id="wf2-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#ffe27a"/>
<stop offset="1" stop-color="#e0901c"/>
</linearGradient>
<linearGradient id="bt-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#fff27a"/>
<stop offset="1" stop-color="#f5b81c"/>
</linearGradient>
<radialGradient id="ey-${uid}" cx="0.4" cy="0.3" r="0.8">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#bff0ff"/>
<stop offset="1" stop-color="#0ea5e9"/>
</radialGradient>
<radialGradient id="orb-${uid}" cx="0.4" cy="0.3" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#7dd3fc"/>
<stop offset="1" stop-color="#1d4ed8"/>
</radialGradient>
<radialGradient id="og-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#e0f7ff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#7dd3fc" stop-opacity="0"/>
</radialGradient>
<clipPath id="cp-${uid}">
<circle cx="32" cy="29" r="11.5"/>
<ellipse cx="32" cy="46" rx="12" ry="11"/>
</clipPath>
<linearGradient id="shn-${uid}" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
<stop offset="0.5" stop-color="#ffffff" stop-opacity="0.6"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="32" r="32" fill="url(#au-${uid})"/>
<circle class="pfx-pulse" style="animation-delay:0.5s" cx="32" cy="32" r="22" fill="url(#au2-${uid})"/>
<circle class="pfx-spin" cx="32" cy="32" r="30.5" fill="none" stroke="#fff27a" stroke-width="1.1" stroke-dasharray="2.6 3.4" stroke-linecap="round" opacity="0.9"/>
<circle class="pfx-spin-r" cx="32" cy="32" r="26.5" fill="none" stroke="#7dd3fc" stroke-width="0.8" stroke-dasharray=".8 3" stroke-linecap="round" opacity="0.6"/>
<g class="pfx-spin" style="animation-duration:12s">
<g transform="translate(55.36 51.61) scale(0.7)">
<path fill="#fff8b0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(3.34 42.43) scale(0.6)">
<path fill="#e0f7ff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(37.3 1.96) scale(0.7)">
<path fill="#fff8b0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</g>
<ellipse cx="32" cy="61" rx="16" ry="2.6" fill="url(#sh-${uid})"/>
<g class="pfx-float">
<g transform="translate(24 42) scale(.66) translate(-24 -42)">
<ellipse cx="24" cy="21" rx="4.4" ry="21" transform="rotate(-84 24 42)" fill="url(#wf-${uid})" stroke="#4a2504" stroke-width=".4"/>
<ellipse cx="24" cy="19" rx="4.6" ry="23" transform="rotate(-68 24 42)" fill="url(#wf-${uid})" stroke="#4a2504" stroke-width=".4"/>
<ellipse cx="24" cy="18" rx="4.6" ry="24" transform="rotate(-52 24 42)" fill="url(#wf-${uid})" stroke="#4a2504" stroke-width=".4"/>
<ellipse cx="24" cy="20" rx="4.4" ry="22" transform="rotate(-36 24 42)" fill="url(#wf-${uid})" stroke="#4a2504" stroke-width=".4"/>
<ellipse cx="24" cy="24" rx="4.2" ry="18" transform="rotate(-20 24 42)" fill="url(#wf-${uid})" stroke="#4a2504" stroke-width=".4"/>
<ellipse cx="24" cy="26" rx="3.3" ry="16" transform="rotate(-76 24 42)" fill="url(#wf2-${uid})" opacity=".95"/>
<ellipse cx="24" cy="24.5" rx="3.5" ry="17.5" transform="rotate(-60 24 42)" fill="url(#wf2-${uid})" opacity=".95"/>
<ellipse cx="24" cy="24.5" rx="3.5" ry="17.5" transform="rotate(-44 24 42)" fill="url(#wf2-${uid})" opacity=".95"/>
<ellipse cx="24" cy="27" rx="3.2" ry="15" transform="rotate(-28 24 42)" fill="url(#wf2-${uid})" opacity=".95"/>
<path class="pfx-flash" d="M6 26L11 24L9 29L15 27" stroke="#e0f7ff" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<g transform="translate(64 0) scale(-1 1)">
<g transform="translate(24 42) scale(.66) translate(-24 -42)">
<ellipse cx="24" cy="21" rx="4.4" ry="21" transform="rotate(-84 24 42)" fill="url(#wf-${uid})" stroke="#4a2504" stroke-width=".4"/>
<ellipse cx="24" cy="19" rx="4.6" ry="23" transform="rotate(-68 24 42)" fill="url(#wf-${uid})" stroke="#4a2504" stroke-width=".4"/>
<ellipse cx="24" cy="18" rx="4.6" ry="24" transform="rotate(-52 24 42)" fill="url(#wf-${uid})" stroke="#4a2504" stroke-width=".4"/>
<ellipse cx="24" cy="20" rx="4.4" ry="22" transform="rotate(-36 24 42)" fill="url(#wf-${uid})" stroke="#4a2504" stroke-width=".4"/>
<ellipse cx="24" cy="24" rx="4.2" ry="18" transform="rotate(-20 24 42)" fill="url(#wf-${uid})" stroke="#4a2504" stroke-width=".4"/>
<ellipse cx="24" cy="26" rx="3.3" ry="16" transform="rotate(-76 24 42)" fill="url(#wf2-${uid})" opacity=".95"/>
<ellipse cx="24" cy="24.5" rx="3.5" ry="17.5" transform="rotate(-60 24 42)" fill="url(#wf2-${uid})" opacity=".95"/>
<ellipse cx="24" cy="24.5" rx="3.5" ry="17.5" transform="rotate(-44 24 42)" fill="url(#wf2-${uid})" opacity=".95"/>
<ellipse cx="24" cy="27" rx="3.2" ry="15" transform="rotate(-28 24 42)" fill="url(#wf2-${uid})" opacity=".95"/>
<path class="pfx-flash" d="M6 26L11 24L9 29L15 27" stroke="#e0f7ff" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>
<ellipse cx="43.3" cy="39.4" rx="3.6" ry="5.4" transform="rotate(-80 43.3 39.4)" fill="url(#mf-${uid})" stroke="#7a3f06" stroke-width=".3"/>
<ellipse cx="42.0" cy="42.0" rx="3.6" ry="5.4" transform="rotate(-60 42.0 42.0)" fill="url(#mf-${uid})" stroke="#7a3f06" stroke-width=".3"/>
<ellipse cx="39.4" cy="44.1" rx="3.6" ry="5.4" transform="rotate(-40 39.4 44.1)" fill="url(#mf-${uid})" stroke="#7a3f06" stroke-width=".3"/>
<ellipse cx="35.9" cy="45.5" rx="3.6" ry="5.4" transform="rotate(-20 35.9 45.5)" fill="url(#mf-${uid})" stroke="#7a3f06" stroke-width=".3"/>
<ellipse cx="32.0" cy="46.0" rx="3.6" ry="5.4" transform="rotate(0 32.0 46.0)" fill="url(#mf-${uid})" stroke="#7a3f06" stroke-width=".3"/>
<ellipse cx="28.1" cy="45.5" rx="3.6" ry="5.4" transform="rotate(20 28.1 45.5)" fill="url(#mf-${uid})" stroke="#7a3f06" stroke-width=".3"/>
<ellipse cx="24.6" cy="44.1" rx="3.6" ry="5.4" transform="rotate(40 24.6 44.1)" fill="url(#mf-${uid})" stroke="#7a3f06" stroke-width=".3"/>
<ellipse cx="22.0" cy="42.0" rx="3.6" ry="5.4" transform="rotate(60 22.0 42.0)" fill="url(#mf-${uid})" stroke="#7a3f06" stroke-width=".3"/>
<ellipse cx="20.7" cy="39.4" rx="3.6" ry="5.4" transform="rotate(80 20.7 39.4)" fill="url(#mf-${uid})" stroke="#7a3f06" stroke-width=".3"/>
<ellipse cx="32" cy="47" rx="12.5" ry="11.5" fill="url(#mf-${uid})" stroke="#7a3f06" stroke-width=".4"/>
<path d="M24 43Q25.6 46 27.2 43" fill="none" stroke="#fff3b0" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
<path d="M29 41.5Q30.6 44.5 32.2 41.5" fill="none" stroke="#fff3b0" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
<path d="M34 41.5Q35.6 44.5 37.2 41.5" fill="none" stroke="#fff3b0" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
<path d="M38 43Q39.6 46 41.2 43" fill="none" stroke="#fff3b0" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
<path d="M26 49Q27.6 52 29.2 49" fill="none" stroke="#fff3b0" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
<path d="M31 48Q32.6 51 34.2 48" fill="none" stroke="#fff3b0" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
<path d="M36 49Q37.6 52 39.2 49" fill="none" stroke="#fff3b0" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
<circle cx="32" cy="51" r="7.5" fill="url(#og-${uid})" class="pfx-pulse"/>
<circle cx="32" cy="51" r="4.3" fill="url(#orb-${uid})" stroke="#fff7c0" stroke-width=".8"/>
<path d="M30 49.6L32 47.8L33.6 49.4" stroke="#fff" stroke-width=".7" fill="none"/>
<path d="M37.6 51.0L40.4 51.0" stroke="#fff7c0" stroke-width=".7" stroke-linecap="round"/>
<path d="M36.0 55.0L37.9 56.9" stroke="#fff7c0" stroke-width=".7" stroke-linecap="round"/>
<path d="M32.0 56.6L32.0 59.4" stroke="#fff7c0" stroke-width=".7" stroke-linecap="round"/>
<path d="M28.0 55.0L26.1 56.9" stroke="#fff7c0" stroke-width=".7" stroke-linecap="round"/>
<path d="M26.4 51.0L23.6 51.0" stroke="#fff7c0" stroke-width=".7" stroke-linecap="round"/>
<path d="M28.0 47.0L26.1 45.1" stroke="#fff7c0" stroke-width=".7" stroke-linecap="round"/>
<path d="M32.0 45.4L32.0 42.6" stroke="#fff7c0" stroke-width=".7" stroke-linecap="round"/>
<path d="M36.0 47.0L37.9 45.1" stroke="#fff7c0" stroke-width=".7" stroke-linecap="round"/>
<path d="M23 25L19.5 12L30 22Z" fill="url(#mf-${uid})" stroke="#7a3f06" stroke-width=".4"/>
<path d="M41 25L44.5 12L34 22Z" fill="url(#mf-${uid})" stroke="#7a3f06" stroke-width=".4"/>
<circle cx="32" cy="29" r="11.4" fill="url(#hd-${uid})" stroke="#b8860b" stroke-width=".4"/>
<path d="M26.8 29.4Q32 26 37.2 29.4Q37.8 36.6 32.6 41.4Q31.6 37 32 34.2Q27.8 35 26.8 29.4Z" fill="url(#bk-${uid})" stroke="#7a2e0c" stroke-width=".5" stroke-linejoin="round"/>
<path d="M32 29.6V33.4" fill="none" stroke="#9a3412" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round"/>
<ellipse cx="29.6" cy="30" rx="1.6" ry=".8" fill="#fff" opacity=".7"/>
<ellipse cx="26.4" cy="27.4" rx="3" ry="2.5" fill="url(#ey-${uid})" stroke="#0369a1" stroke-width=".6"/>
<circle cx="26.799999999999997" cy="27.5" r="1.3" fill="#06223a"/>
<circle cx="25.799999999999997" cy="26.7" r=".5" fill="#fff"/>
<ellipse cx="37.6" cy="27.4" rx="3" ry="2.5" fill="url(#ey-${uid})" stroke="#0369a1" stroke-width=".6"/>
<circle cx="37.2" cy="27.5" r="1.3" fill="#06223a"/>
<circle cx="37.0" cy="26.7" r=".5" fill="#fff"/>
<ellipse cx="26.4" cy="27.4" rx="4.2" ry="3.5" fill="#7dd3fc" opacity=".25" class="pfx-pulse"/>
<ellipse cx="37.6" cy="27.4" rx="4.2" ry="3.5" fill="#7dd3fc" opacity=".25" class="pfx-pulse"/>
<path d="M21.8 24.2Q26.6 23 30 27.4M42.2 24.2Q37.4 23 34 27.4" fill="none" stroke="#6b3a06" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
<g clip-path="url(#cp-${uid})">
<rect class="pfx-sheen" style="animation-delay:0.3s" x="-16" y="-4" width="12" height="72" fill="url(#shn-${uid})"/>
</g>
<path d="M33.4 1L27.8 11.6L31.8 11.6L29.2 19.4L36.6 9.4L32.6 9.4L36 1Z" fill="url(#bt-${uid})" stroke="#f59e0b" stroke-width=".6" stroke-linejoin="round"/>
<g transform="translate(23.4 11.5) rotate(-32) scale(.62)">
<path d="M3 -9L-4 1.5L0.2 1.5L-3 10L5 -1.5L0.8 -1.5L4.4 -9Z" fill="url(#bt-${uid})" stroke="#f59e0b" stroke-width=".8" stroke-linejoin="round"/>
</g>
<g transform="translate(40.6 11.5) rotate(32) scale(.62)">
<path d="M3 -9L-4 1.5L0.2 1.5L-3 10L5 -1.5L0.8 -1.5L4.4 -9Z" fill="url(#bt-${uid})" stroke="#f59e0b" stroke-width=".8" stroke-linejoin="round"/>
</g>
<ellipse cx="27" cy="21" rx="5.4" ry="2.3" transform="rotate(-35 27 21)" fill="url(#gl-${uid})" opacity="0.85"/>
</g>
<g transform="translate(8 14) rotate(-20) scale(0.85)">
<path class="pfx-flash" d="M3 -9L-4 1.5L0.2 1.5L-3 10L5 -1.5L0.8 -1.5L4.4 -9Z" fill="#fff8b0" stroke="#f59e0b" stroke-width=".6" stroke-linejoin="round"/>
</g>
<g transform="translate(57 12) rotate(25) scale(0.8)">
<path class="pfx-flash" style="animation-delay:0.5s" d="M3 -9L-4 1.5L0.2 1.5L-3 10L5 -1.5L0.8 -1.5L4.4 -9Z" fill="#fff8b0" stroke="#f59e0b" stroke-width=".6" stroke-linejoin="round"/>
</g>
<g transform="translate(6 46) rotate(15) scale(0.7)">
<path class="pfx-flash" style="animation-delay:1.0s" d="M3 -9L-4 1.5L0.2 1.5L-3 10L5 -1.5L0.8 -1.5L4.4 -9Z" fill="#fff8b0" stroke="#f59e0b" stroke-width=".6" stroke-linejoin="round"/>
</g>
<g transform="translate(58 44) rotate(-15) scale(0.75)">
<path class="pfx-flash" style="animation-delay:1.5s" d="M3 -9L-4 1.5L0.2 1.5L-3 10L5 -1.5L0.8 -1.5L4.4 -9Z" fill="#fff8b0" stroke="#f59e0b" stroke-width=".6" stroke-linejoin="round"/>
</g>
<circle class="pfx-rise" cx="14" cy="56" r="1.4" fill="#fff27a" opacity="0.95"/>
<circle class="pfx-rise" style="animation-delay:0.7s" cx="50" cy="58" r="1.3" fill="#bff0ff" opacity="0.95"/>
<circle class="pfx-twinkle" style="animation-delay:0.4s" cx="22" cy="6" r="1.1" fill="#fff" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:1.2s" cx="44" cy="6" r="1.1" fill="#fff" opacity="1"/>
<g transform="translate(6 30) scale(0.65)">
<path class="pfx-twinkle" style="animation-delay:0.2s" fill="#fffbd0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(58 30) scale(0.65)">
<path class="pfx-twinkle" style="animation-delay:1s" fill="#fffbd0" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_leviathan: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#22d3ee" stop-opacity="0.75"/>
<stop offset="0.6" stop-color="#22d3ee" stop-opacity="0.3"/>
<stop offset="1" stop-color="#22d3ee" stop-opacity="0"/>
</radialGradient>
<radialGradient id="au2-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#38bdf8" stop-opacity="0.55"/>
<stop offset="0.6" stop-color="#38bdf8" stop-opacity="0.22"/>
<stop offset="1" stop-color="#38bdf8" stop-opacity="0"/>
</radialGradient>
<radialGradient id="m-${uid}" cx="0.38" cy="0.25" r="0.9">
<stop offset="0" stop-color="#8df2ea"/>
<stop offset="0.5" stop-color="#0e9aa8"/>
<stop offset="1" stop-color="#08365a"/>
</radialGradient>
<linearGradient id="tn-${uid}" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#7ae8e0"/>
<stop offset="0.5" stop-color="#0e9aa8"/>
<stop offset="1" stop-color="#0a3d62"/>
</linearGradient>
<radialGradient id="fn-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#a5f3fc"/>
<stop offset="0.5" stop-color="#0ea5c8"/>
<stop offset="1" stop-color="#075985"/>
</radialGradient>
<radialGradient id="iy-${uid}" cx="0.4" cy="0.3" r="0.85">
<stop offset="0" stop-color="#ecfeff"/>
<stop offset="0.5" stop-color="#22d3ee"/>
<stop offset="1" stop-color="#0e7490"/>
</radialGradient>
<radialGradient id="pl-${uid}" cx="0.4" cy="0.3" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#e0fbff"/>
<stop offset="1" stop-color="#67e8f9"/>
</radialGradient>
<linearGradient id="wv-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#67e8f9" stop-opacity="0.9"/>
<stop offset="1" stop-color="#0369a1" stop-opacity="0.9"/>
</linearGradient>
<radialGradient id="sk-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fce7f3"/>
<stop offset="0.5" stop-color="#f9a8d4"/>
<stop offset="1" stop-color="#db2777"/>
</radialGradient>
<clipPath id="cp-${uid}">
<path d="M14 36Q12 10 32 5Q52 10 50 36Q41 41 32 41Q23 41 14 36Z"/>
</clipPath>
<linearGradient id="shn-${uid}" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
<stop offset="0.5" stop-color="#ffffff" stop-opacity="0.6"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="30" r="32" fill="url(#au-${uid})"/>
<circle class="pfx-pulse" style="animation-delay:0.5s" cx="32" cy="30" r="22" fill="url(#au2-${uid})"/>
<circle class="pfx-spin" cx="32" cy="32" r="30.5" fill="none" stroke="#a5f3fc" stroke-width="0.9" stroke-dasharray="1.6 4.6" stroke-linecap="round" opacity="0.75"/>
<circle class="pfx-spin-r" cx="32" cy="32" r="26.5" fill="none" stroke="#38bdf8" stroke-width="0.7" stroke-dasharray=".8 3.2" stroke-linecap="round" opacity="0.5"/>
<ellipse class="pfx-ripple" cx="32" cy="58" rx="26" ry="5" fill="none" stroke="#a5f3fc" stroke-width=".9"/>
<ellipse class="pfx-ripple" style="animation-delay:1.1s" cx="32" cy="58" rx="26" ry="5" fill="none" stroke="#a5f3fc" stroke-width=".7"/>
<g class="pfx-float">
<path d="M22 40Q8 39 6 51Q5 58 11.5 58" fill="none" stroke="#06293f" stroke-width="7.8" stroke-linecap="round"/>
<path d="M22 40Q8 39 6 51Q5 58 11.5 58" fill="none" stroke="url(#tn-${uid})" stroke-width="6.2" stroke-linecap="round"/>
<path d="M22 40Q8 39 6 51Q5 58 11.5 58" fill="none" stroke="#c9fbf6" stroke-width="1.1" stroke-linecap="round" opacity=".6" transform="translate(-1.1 -1.1)"/>
<path d="M22 40Q8 39 6 51Q5 58 11.5 58" fill="none" stroke="url(#sk-${uid})" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="0.1 3.2" transform="translate(1.1 1.3)"/>
<path d="M24 44Q11 49 14 60Q15 62 18 61" fill="none" stroke="#06293f" stroke-width="7.8" stroke-linecap="round"/>
<path d="M24 44Q11 49 14 60Q15 62 18 61" fill="none" stroke="url(#tn-${uid})" stroke-width="6.2" stroke-linecap="round"/>
<path d="M24 44Q11 49 14 60Q15 62 18 61" fill="none" stroke="#c9fbf6" stroke-width="1.1" stroke-linecap="round" opacity=".6" transform="translate(-1.1 -1.1)"/>
<path d="M24 44Q11 49 14 60Q15 62 18 61" fill="none" stroke="url(#sk-${uid})" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="0.1 3.2" transform="translate(1.1 1.3)"/>
<path d="M27.5 46Q21 55 26 62" fill="none" stroke="#06293f" stroke-width="7.8" stroke-linecap="round"/>
<path d="M27.5 46Q21 55 26 62" fill="none" stroke="url(#tn-${uid})" stroke-width="6.2" stroke-linecap="round"/>
<path d="M27.5 46Q21 55 26 62" fill="none" stroke="#c9fbf6" stroke-width="1.1" stroke-linecap="round" opacity=".6" transform="translate(-1.1 -1.1)"/>
<path d="M27.5 46Q21 55 26 62" fill="none" stroke="url(#sk-${uid})" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="0.1 3.2" transform="translate(1.1 1.3)"/>
<g transform="translate(64 0) scale(-1 1)">
<path d="M22 40Q8 39 6 51Q5 58 11.5 58" fill="none" stroke="#06293f" stroke-width="7.8" stroke-linecap="round"/>
<path d="M22 40Q8 39 6 51Q5 58 11.5 58" fill="none" stroke="url(#tn-${uid})" stroke-width="6.2" stroke-linecap="round"/>
<path d="M22 40Q8 39 6 51Q5 58 11.5 58" fill="none" stroke="#c9fbf6" stroke-width="1.1" stroke-linecap="round" opacity=".6" transform="translate(-1.1 -1.1)"/>
<path d="M22 40Q8 39 6 51Q5 58 11.5 58" fill="none" stroke="url(#sk-${uid})" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="0.1 3.2" transform="translate(1.1 1.3)"/>
<path d="M24 44Q11 49 14 60Q15 62 18 61" fill="none" stroke="#06293f" stroke-width="7.8" stroke-linecap="round"/>
<path d="M24 44Q11 49 14 60Q15 62 18 61" fill="none" stroke="url(#tn-${uid})" stroke-width="6.2" stroke-linecap="round"/>
<path d="M24 44Q11 49 14 60Q15 62 18 61" fill="none" stroke="#c9fbf6" stroke-width="1.1" stroke-linecap="round" opacity=".6" transform="translate(-1.1 -1.1)"/>
<path d="M24 44Q11 49 14 60Q15 62 18 61" fill="none" stroke="url(#sk-${uid})" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="0.1 3.2" transform="translate(1.1 1.3)"/>
<path d="M27.5 46Q21 55 26 62" fill="none" stroke="#06293f" stroke-width="7.8" stroke-linecap="round"/>
<path d="M27.5 46Q21 55 26 62" fill="none" stroke="url(#tn-${uid})" stroke-width="6.2" stroke-linecap="round"/>
<path d="M27.5 46Q21 55 26 62" fill="none" stroke="#c9fbf6" stroke-width="1.1" stroke-linecap="round" opacity=".6" transform="translate(-1.1 -1.1)"/>
<path d="M27.5 46Q21 55 26 62" fill="none" stroke="url(#sk-${uid})" stroke-width="1.7" stroke-linecap="round" stroke-dasharray="0.1 3.2" transform="translate(1.1 1.3)"/>
</g>
<path d="M17 15Q7 7 4.5 18Q11 20 16 25Z" fill="url(#fn-${uid})" stroke="#06293f" stroke-width=".5" stroke-linejoin="round"/>
<path d="M7 15Q11 17 14 21" fill="none" stroke="#c9fbf6" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
<g transform="translate(64 0) scale(-1 1)">
<path d="M17 15Q7 7 4.5 18Q11 20 16 25Z" fill="url(#fn-${uid})" stroke="#06293f" stroke-width=".5" stroke-linejoin="round"/>
<path d="M7 15Q11 17 14 21" fill="none" stroke="#c9fbf6" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>
</g>
<path d="M14 36Q12 10 32 5Q52 10 50 36Q41 41 32 41Q23 41 14 36Z" fill="url(#m-${uid})" stroke="#06293f" stroke-width=".8" stroke-linejoin="round"/>
<circle class="pfx-twinkle" cx="20" cy="14" r="1" fill="#c9fff8" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:0.5s" cx="44" cy="14" r="1" fill="#c9fff8" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:1s" cx="32" cy="11" r="1.2" fill="#c9fff8" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:1.5s" cx="25" cy="20" r="0.8" fill="#c9fff8" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:0.3s" cx="39" cy="20" r="0.8" fill="#c9fff8" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:0.8s" cx="17" cy="24" r="0.9" fill="#c9fff8" opacity="1"/>
<circle class="pfx-twinkle" style="animation-delay:1.3s" cx="47" cy="24" r="0.9" fill="#c9fff8" opacity="1"/>
<path d="M32 6.5Q31 14 32 20M26 8Q24 15 25 20M38 8Q40 15 39 20" fill="none" stroke="#7af5ee" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
<circle cx="32" cy="24.6" r="3.2" fill="url(#pl-${uid})" stroke="#a5f3fc" stroke-width=".6"/>
<circle cx="31" cy="23.6" r=".9" fill="#fff"/>
<circle cx="23.4" cy="33" r="5.7" fill="#06293f"/>
<circle cx="23.4" cy="33" r="4.9" fill="#f4feff"/>
<circle cx="23.4" cy="33" r="3.6" fill="url(#iy-${uid})"/>
<rect x="20.299999999999997" y="31.8" width="6.2" height="2.4" rx="1.2" fill="#03182b"/>
<circle cx="22.099999999999998" cy="31.4" r="1" fill="#fff"/>
<circle cx="40.6" cy="33" r="5.7" fill="#06293f"/>
<circle cx="40.6" cy="33" r="4.9" fill="#f4feff"/>
<circle cx="40.6" cy="33" r="3.6" fill="url(#iy-${uid})"/>
<rect x="37.5" y="31.8" width="6.2" height="2.4" rx="1.2" fill="#03182b"/>
<circle cx="39.300000000000004" cy="31.4" r="1" fill="#fff"/>
<path d="M17 28.6Q23 26.4 28.6 29.6M47 28.6Q41 26.4 35.4 29.6" fill="none" stroke="#06293f" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M29.4 40Q32 42.6 34.6 40Q33.6 44 32 44.6Q30.4 44 29.4 40Z" fill="#0a2a44" stroke="#06293f" stroke-width=".4"/>
<ellipse cx="17.5" cy="38" rx="2.6" ry="1.5" fill="#f9a8d4" opacity="0.5"/>
<ellipse cx="46.5" cy="38" rx="2.6" ry="1.5" fill="#f9a8d4" opacity="0.5"/>
<g clip-path="url(#cp-${uid})">
<rect class="pfx-sheen" style="animation-delay:0.5s" x="-16" y="-4" width="12" height="72" fill="url(#shn-${uid})"/>
</g>
<ellipse cx="22" cy="14" rx="7" ry="3" transform="rotate(-35 22 14)" fill="url(#gl-${uid})" opacity="0.9"/>
</g>
<path d="M0 60Q8 56.5 16 60T32 60T48 60T64 60V64H0Z" fill="url(#wv-${uid})" opacity=".85"/>
<path d="M0 60Q8 56.5 16 60T32 60T48 60T64 60" fill="none" stroke="#e0fbff" stroke-width=".9" stroke-linecap="round" opacity=".9"/>
<g class="pfx-bubble" style="animation-delay:0s">
<circle cx="10" cy="40" r="2.6" fill="#e0fbff" fill-opacity=".18" stroke="#bff4ff" stroke-width=".7"/>
<circle cx="9.09" cy="39.09" r="0.73" fill="#fff" opacity=".9"/>
</g>
<g class="pfx-bubble" style="animation-delay:0.9s">
<circle cx="55" cy="34" r="2.2" fill="#e0fbff" fill-opacity=".18" stroke="#bff4ff" stroke-width=".7"/>
<circle cx="54.23" cy="33.23" r="0.62" fill="#fff" opacity=".9"/>
</g>
<g class="pfx-bubble" style="animation-delay:1.7s">
<circle cx="50" cy="50" r="1.6" fill="#e0fbff" fill-opacity=".18" stroke="#bff4ff" stroke-width=".7"/>
<circle cx="49.44" cy="49.44" r="0.45" fill="#fff" opacity=".9"/>
</g>
<g class="pfx-bubble" style="animation-delay:2.2s">
<circle cx="14" cy="28" r="1.7" fill="#e0fbff" fill-opacity=".18" stroke="#bff4ff" stroke-width=".7"/>
<circle cx="13.4" cy="27.41" r="0.48" fill="#fff" opacity=".9"/>
</g>
<g class="pfx-bubble" style="animation-delay:0.4s">
<circle cx="32" cy="52" r="1.5" fill="#e0fbff" fill-opacity=".18" stroke="#bff4ff" stroke-width=".7"/>
<circle cx="31.48" cy="51.48" r="0.42" fill="#fff" opacity=".9"/>
</g>
<g transform="translate(7 10) scale(0.7)">
<path class="pfx-twinkle" style="animation-delay:0.2s" fill="#d9fcff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(58 12) scale(0.65)">
<path class="pfx-twinkle" style="animation-delay:1s" fill="#d9fcff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_fenrir: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="au-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#a5e8ff" stop-opacity="0.85"/>
<stop offset="0.6" stop-color="#a5e8ff" stop-opacity="0.34"/>
<stop offset="1" stop-color="#a5e8ff" stop-opacity="0"/>
</radialGradient>
<radialGradient id="au2-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.6"/>
<stop offset="0.6" stop-color="#ffffff" stop-opacity="0.24"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</radialGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#cfe8ff"/>
<stop offset="1" stop-color="#5f9ede"/>
</radialGradient>
<radialGradient id="mz-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#f3f9ff"/>
<stop offset="1" stop-color="#bcd8f2"/>
</radialGradient>
<linearGradient id="cr-${uid}" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/>
<stop offset="0.5" stop-color="#bdeaff" stop-opacity="0.85"/>
<stop offset="1" stop-color="#4fb0e8" stop-opacity="0.8"/>
</linearGradient>
<radialGradient id="ey-${uid}" cx="0.4" cy="0.3" r="0.8">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#b6f3ff"/>
<stop offset="1" stop-color="#0ea5e9"/>
</radialGradient>
<radialGradient id="ns-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#51709a"/>
<stop offset="0.5" stop-color="#14274a"/>
<stop offset="1" stop-color="#050b18"/>
</radialGradient>
<linearGradient id="st-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#38bdf8" stop-opacity="0.6"/>
<stop offset="1" stop-color="#38bdf8" stop-opacity="0"/>
</linearGradient>
<clipPath id="cp-${uid}">
<path transform="translate(4.5 3.2) scale(.86)" d="M32 17Q27 17 24 20L14 6L11 24L5 34L10 35.5L4.5 45L14 43Q20 53 32 58Q44 53 50 43L59.5 45L54 35.5L59 34L53 24L50 6L40 20Q37 17 32 17Z"/>
</clipPath>
<linearGradient id="shn-${uid}" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
<stop offset="0.5" stop-color="#ffffff" stop-opacity="0.6"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="32" r="32" fill="url(#au-${uid})"/>
<circle class="pfx-pulse" style="animation-delay:0.5s" cx="32" cy="30" r="22" fill="url(#au2-${uid})"/>
<polygon class="pfx-spin-r" style="animation-duration:26s" points="32,1.5 58.5,16.7 58.5,47.3 32,62.5 5.5,47.3 5.5,16.7" fill="none" stroke="#bdeaff" stroke-width=".8" stroke-dasharray="3 3.4" opacity=".65"/>
<circle class="pfx-spin" cx="32" cy="32" r="30.5" fill="none" stroke="#ffffff" stroke-width="0.9" stroke-dasharray="1.4 4.8" stroke-linecap="round" opacity="0.8"/>
<ellipse cx="32" cy="60.5" rx="17" ry="2.6" fill="url(#sh-${uid})"/>
<g class="pfx-spin" style="animation-duration:14s">
<g transform="translate(47.0 57.98) scale(0.65)">
<path fill="#e0fbff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(2.0 32.0) scale(0.75)">
<path fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(47.0 6.02) scale(0.65)">
<path fill="#bdeaff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</g>
<g class="pfx-float">
<polygon points="18,22 10,5 14,26" fill="url(#cr-${uid})" stroke="#e8fbff" stroke-width=".6" stroke-linejoin="round"/>
<polygon points="25,18 21,1.5 29,19" fill="url(#cr-${uid})" stroke="#e8fbff" stroke-width=".6" stroke-linejoin="round"/>
<polygon points="11,30 3,17 8,35" fill="url(#cr-${uid})" stroke="#e8fbff" stroke-width=".6" stroke-linejoin="round"/>
<g transform="translate(64 0) scale(-1 1)">
<polygon points="18,22 10,5 14,26" fill="url(#cr-${uid})" stroke="#e8fbff" stroke-width=".6" stroke-linejoin="round"/>
<polygon points="25,18 21,1.5 29,19" fill="url(#cr-${uid})" stroke="#e8fbff" stroke-width=".6" stroke-linejoin="round"/>
<polygon points="11,30 3,17 8,35" fill="url(#cr-${uid})" stroke="#e8fbff" stroke-width=".6" stroke-linejoin="round"/>
</g>
<polygon points="32,0 36.2,13 32,19 27.8,13" fill="url(#cr-${uid})" stroke="#e8fbff" stroke-width=".6" stroke-linejoin="round"/>
<g transform="translate(4.5 3.2) scale(.86)">
<path d="M32 17Q27 17 24 20L14 6L11 24L5 34L10 35.5L4.5 45L14 43Q20 53 32 58Q44 53 50 43L59.5 45L54 35.5L59 34L53 24L50 6L40 20Q37 17 32 17Z" fill="url(#b-${uid})" stroke="#3a74b8" stroke-width=".6" stroke-linejoin="round"/>
<path d="M15.5 11L22 20L14.5 23Z" fill="#9fd4ff"/>
<path d="M48.5 11L42 20L49.5 23Z" fill="#9fd4ff"/>
<path d="M32 18Q26 24 28 34L32 38L36 34Q38 24 32 18Z" fill="url(#st-${uid})"/>
<path d="M32 36Q22 36 20 46Q24 55 32 56.5Q40 55 44 46Q42 36 32 36Z" fill="url(#mz-${uid})"/>
<path d="M8 37L16 39M7 44L16 45M56 37L48 39M57 44L48 45" fill="none" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 29.5Q25 26 30 30.3Q25 33 20 29.5Z" fill="url(#ey-${uid})" stroke="#0369a1" stroke-width=".6"/>
<path d="M44 29.5Q39 26 34 30.3Q39 33 44 29.5Z" fill="url(#ey-${uid})" stroke="#0369a1" stroke-width=".6"/>
<ellipse cx="25.3" cy="29.8" rx="1.1" ry="1.9" fill="#04122a"/>
<ellipse cx="38.7" cy="29.8" rx="1.1" ry="1.9" fill="#04122a"/>
<circle cx="24.6" cy="29" r=".6" fill="#fff"/>
<circle cx="38" cy="29" r=".6" fill="#fff"/>
<ellipse cx="25" cy="29.8" rx="6" ry="4.2" fill="#9be7ff" opacity=".3" class="pfx-pulse"/>
<ellipse cx="39" cy="29.8" rx="6" ry="4.2" fill="#9be7ff" opacity=".3" class="pfx-pulse"/>
<path d="M18.5 25.5L29.5 29M45.5 25.5L34.5 29" fill="none" stroke="#2c5a96" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M28.3 40Q32 37.8 35.7 40Q34 44.2 32 44.8Q30 44.2 28.3 40Z" fill="url(#ns-${uid})"/>
<ellipse cx="30.6" cy="39.7" rx="1.5" ry=".7" fill="#fff" opacity=".7"/>
<path d="M32 44.8V47.2M32 47.2Q28.4 50.4 25 48.2M32 47.2Q35.6 50.4 39 48.2" fill="none" stroke="#2c5a96" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M27 48.6L28.6 52.6L30.2 49.4Z" fill="#fff" stroke="#bcd8f2" stroke-width=".3"/>
<path d="M37 48.6L35.4 52.6L33.8 49.4Z" fill="#fff" stroke="#bcd8f2" stroke-width=".3"/>
<path d="M14 6L11 24L5 34L10 35.5L4.5 45" fill="none" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
</g>
<g clip-path="url(#cp-${uid})">
<rect class="pfx-sheen" style="animation-delay:0.4s" x="-16" y="-4" width="12" height="72" fill="url(#shn-${uid})"/>
</g>
<polygon points="32,17 35,21.6 32,26.4 29,21.6" fill="url(#cr-${uid})" stroke="#e8fbff" stroke-width=".6" stroke-linejoin="round"/>
<path d="M30.4 20.6L32 18.8" stroke="#fff" stroke-width=".8" stroke-linecap="round"/>
<polygon points="14,50.5 17.4,59.5 10.6,59.5" fill="url(#cr-${uid})" stroke="#e8fbff" stroke-width=".6" stroke-linejoin="round"/>
<polygon points="21,54 24.4,63 17.6,63" fill="url(#cr-${uid})" stroke="#e8fbff" stroke-width=".6" stroke-linejoin="round"/>
<polygon points="27,56 30.4,65 23.6,65" fill="url(#cr-${uid})" stroke="#e8fbff" stroke-width=".6" stroke-linejoin="round"/>
<polygon points="37,56 40.4,65 33.6,65" fill="url(#cr-${uid})" stroke="#e8fbff" stroke-width=".6" stroke-linejoin="round"/>
<polygon points="43,54 46.4,63 39.6,63" fill="url(#cr-${uid})" stroke="#e8fbff" stroke-width=".6" stroke-linejoin="round"/>
<polygon points="50,50.5 53.4,59.5 46.6,59.5" fill="url(#cr-${uid})" stroke="#e8fbff" stroke-width=".6" stroke-linejoin="round"/>
<polygon points="32,52 36,57.4 32,63 28,57.4" fill="url(#cr-${uid})" stroke="#ffffff" stroke-width=".8"/>
<polygon points="32,52 34,57.4 32,63 30,57.4" fill="#fff" opacity=".35"/>
<ellipse cx="26.5" cy="22" rx="5.2" ry="2.4" transform="rotate(-50 26.5 22)" fill="url(#gl-${uid})" opacity="0.8"/>
</g>
<g transform="translate(8 14) scale(1)">
<g class="pfx-fall" style="animation-delay:0s" stroke="#ffffff" stroke-width=".9" stroke-linecap="round" fill="none">
<path d="M0 -3.2V3.2M-2.8 -1.6L2.8 1.6M-2.8 1.6L2.8 -1.6"/>
<circle r=".7" fill="#fff" stroke="none"/>
</g>
</g>
<g transform="translate(56 10) scale(0.9)">
<g class="pfx-fall" style="animation-delay:0.8s" stroke="#ffffff" stroke-width=".9" stroke-linecap="round" fill="none">
<path d="M0 -3.2V3.2M-2.8 -1.6L2.8 1.6M-2.8 1.6L2.8 -1.6"/>
<circle r=".7" fill="#fff" stroke="none"/>
</g>
</g>
<g transform="translate(6 40) scale(0.8)">
<g class="pfx-fall" style="animation-delay:1.5s" stroke="#ffffff" stroke-width=".9" stroke-linecap="round" fill="none">
<path d="M0 -3.2V3.2M-2.8 -1.6L2.8 1.6M-2.8 1.6L2.8 -1.6"/>
<circle r=".7" fill="#fff" stroke="none"/>
</g>
</g>
<g transform="translate(58 36) scale(1)">
<g class="pfx-fall" style="animation-delay:2.1s" stroke="#ffffff" stroke-width=".9" stroke-linecap="round" fill="none">
<path d="M0 -3.2V3.2M-2.8 -1.6L2.8 1.6M-2.8 1.6L2.8 -1.6"/>
<circle r=".7" fill="#fff" stroke="none"/>
</g>
</g>
<g transform="translate(20 6) scale(0.7)">
<g class="pfx-fall" style="animation-delay:1.2s" stroke="#ffffff" stroke-width=".9" stroke-linecap="round" fill="none">
<path d="M0 -3.2V3.2M-2.8 -1.6L2.8 1.6M-2.8 1.6L2.8 -1.6"/>
<circle r=".7" fill="#fff" stroke="none"/>
</g>
</g>
<g transform="translate(46 4) scale(0.75)">
<g class="pfx-fall" style="animation-delay:2.6s" stroke="#ffffff" stroke-width=".9" stroke-linecap="round" fill="none">
<path d="M0 -3.2V3.2M-2.8 -1.6L2.8 1.6M-2.8 1.6L2.8 -1.6"/>
<circle r=".7" fill="#fff" stroke="none"/>
</g>
</g>
<circle class="pfx-rise" cx="14" cy="56" r="1.4" fill="#e0fbff" opacity="0.95"/>
<circle class="pfx-rise" style="animation-delay:1s" cx="50" cy="58" r="1.2" fill="#ffffff" opacity="0.95"/>
<g transform="translate(6 26) scale(0.65)">
<path class="pfx-twinkle" style="animation-delay:0.3s" fill="#e0fbff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
<g transform="translate(58 24) scale(0.65)">
<path class="pfx-twinkle" style="animation-delay:1.1s" fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/>
</g>
</svg>`;
    },
    pet_cat: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fef3c7"/>
<stop offset="0.5" stop-color="#f59e0b"/>
<stop offset="1" stop-color="#9a3412"/>
</radialGradient>
<radialGradient id="cr-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#fffbeb"/>
<stop offset="1" stop-color="#fde68a"/>
</radialGradient>
<radialGradient id="pk-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fecdd3"/>
<stop offset="0.5" stop-color="#fb7185"/>
<stop offset="1" stop-color="#e11d48"/>
</radialGradient>
<radialGradient id="coin-${uid}" cx="0.35" cy="0.3" r="0.9">
<stop offset="0" stop-color="#fffbeb"/>
<stop offset="0.5" stop-color="#facc15"/>
<stop offset="1" stop-color="#b45309"/>
</radialGradient>
</defs>
<ellipse cx="32" cy="58.5" rx="19" ry="3.6" fill="url(#sh-${uid})"/>
<!-- Ekor Kucing Melengkung -->
<path d="M46 54Q56 50 54 40Q52 35 48 37" fill="none" stroke="url(#b-${uid})" stroke-width="4.5" stroke-linecap="round"/>
<!-- Kaki Belakang -->
<ellipse cx="20" cy="57" rx="5" ry="2.6" fill="url(#b-${uid})"/>
<ellipse cx="44" cy="57" rx="5" ry="2.6" fill="url(#b-${uid})"/>
<!-- Telinga Kiri & Kanan -->
<polygon points="14,14 26,22 13,28" fill="url(#b-${uid})"/>
<polygon points="16,17 24,23 15,26" fill="url(#pk-${uid})"/>
<polygon points="50,14 38,22 51,28" fill="url(#b-${uid})"/>
<polygon points="48,17 40,23 49,26" fill="url(#pk-${uid})"/>
<!-- Badan & Kepala 3D Bulat -->
<circle cx="32" cy="38" r="19" fill="url(#b-${uid})"/>
<!-- Pipi Putih Mengembang -->
<ellipse cx="32" cy="42" rx="15" ry="11" fill="url(#cr-${uid})"/>
<!-- Belang Tabby Cokelat Kening -->
<path d="M32 21V26M27 23L30 27M37 23L34 27" stroke="#78350f" stroke-width="1.2" stroke-linecap="round"/>
<!-- Mata Hitam Bulat Bersinar -->
<ellipse cx="24.5" cy="34" rx="2.5" ry="3.2" fill="#1e293b"/>
<circle cx="23.6" cy="32.8" r="1.1" fill="#fff"/>
<circle cx="25.6" cy="35.3" r="0.5" fill="#fff" opacity=".85"/>
<ellipse cx="39.5" cy="34" rx="2.5" ry="3.2" fill="#1e293b"/>
<circle cx="38.6" cy="32.8" r="1.1" fill="#fff"/>
<circle cx="40.6" cy="35.3" r="0.5" fill="#fff" opacity=".85"/>
<!-- Hidung & Mulut Kucing -->
<polygon points="32,38.5 30.2,36.5 33.8,36.5" fill="url(#pk-${uid})"/>
<path d="M32 38.5V40M32 40Q29.5 42 27 40.5M32 40Q34.5 42 37 40.5" fill="none" stroke="#78350f" stroke-width="1" stroke-linecap="round"/>
<!-- Kumis Halus -->
<path d="M19 37L10 36M19 39.5L9 40.5M45 37L54 36M45 39.5L55 40.5" stroke="#78350f" stroke-width="0.6" stroke-linecap="round" opacity=".6"/>
<!-- Kalung Merah & Koin Hoki Emas -->
<path d="M22 47Q32 52 42 47" fill="none" stroke="#dc2626" stroke-width="2.2" stroke-linecap="round"/>
<circle cx="32" cy="51" r="5" fill="url(#coin-${uid})" stroke="#92400e" stroke-width=".7"/>
<polygon points="32,48.5 33,50.2 34.8,50.4 33.5,51.6 33.9,53.4 32,52.4 30.1,53.4 30.5,51.6 29.2,50.4 31,50.2" fill="#fff7b0"/>
<!-- Kilap Spekular 3D -->
<ellipse cx="25" cy="22" rx="7.5" ry="3.5" transform="rotate(-25 25 22)" fill="url(#gl-${uid})"/>
<!-- Bintang Berkedip -->
<g transform="translate(52 14) scale(0.7)"><path class="pfx-twinkle" fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
</svg>`;
    },
    pet_dog: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.42"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fffbeb"/>
<stop offset="0.5" stop-color="#f59e0b"/>
<stop offset="1" stop-color="#78350f"/>
</radialGradient>
<radialGradient id="ear-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#d97706"/>
<stop offset="0.5" stop-color="#92400e"/>
<stop offset="1" stop-color="#451a03"/>
</radialGradient>
<radialGradient id="mu-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.5" stop-color="#fef3c7"/>
<stop offset="1" stop-color="#fde68a"/>
</radialGradient>
</defs>
<ellipse cx="32" cy="58.5" rx="19" ry="3.6" fill="url(#sh-${uid})"/>
<!-- Ekor Anjing Mengibas -->
<g class="pfx-sway" transform="translate(48 46)">
  <path d="M0 0Q6 -8 8 -12" fill="none" stroke="url(#ear-${uid})" stroke-width="4.2" stroke-linecap="round"/>
</g>
<!-- Telinga Terkulai Kiri & Kanan -->
<ellipse cx="14" cy="28" rx="5.5" ry="12" transform="rotate(22 14 28)" fill="url(#ear-${uid})"/>
<ellipse cx="50" cy="28" rx="5.5" ry="12" transform="rotate(-22 50 28)" fill="url(#ear-${uid})"/>
<!-- Kaki Depan -->
<ellipse cx="23" cy="57" rx="4.8" ry="2.6" fill="url(#b-${uid})"/>
<ellipse cx="41" cy="57" rx="4.8" ry="2.6" fill="url(#b-${uid})"/>
<!-- Kepala & Badan Bulat -->
<circle cx="32" cy="35" r="18.5" fill="url(#b-${uid})"/>
<!-- Moncong Krem Menggemaskan -->
<ellipse cx="32" cy="40.5" rx="10.5" ry="7.5" fill="url(#mu-${uid})"/>
<!-- Mata Hitam Ceria -->
<ellipse cx="24.5" cy="31.5" rx="2.5" ry="3.2" fill="#1e293b"/>
<circle cx="23.6" cy="30.2" r="1.1" fill="#fff"/>
<circle cx="25.5" cy="32.8" r="0.5" fill="#fff" opacity=".85"/>
<ellipse cx="39.5" cy="31.5" rx="2.5" ry="3.2" fill="#1e293b"/>
<circle cx="38.6" cy="30.2" r="1.1" fill="#fff"/>
<circle cx="40.5" cy="32.8" r="0.5" fill="#fff" opacity=".85"/>
<!-- Hidung Hitam Mengkilap -->
<ellipse cx="32" cy="37" rx="3.2" ry="2.2" fill="#0f172a"/>
<circle cx="31" cy="36.3" r=".8" fill="#fff" opacity=".8"/>
<!-- Mulut & Lidah Menjulur -->
<path d="M32 39V42M32 42Q29 44 26.5 42M32 42Q35 44 37.5 42" fill="none" stroke="#451a03" stroke-width="1.1" stroke-linecap="round"/>
<path d="M30 42Q32 47 34 42Z" fill="#fb7185"/>
<!-- Bandana Biru Petualang -->
<path d="M19 46Q32 52 45 46L32 55Z" fill="#3b82f6"/>
<polygon points="32,49 33,51 35,51 33.5,52.2 34,54 32,53 30,54 30.5,52.2 29,51 31,51" fill="#fef08a"/>
<!-- Kilap Spekular 3D -->
<ellipse cx="26" cy="20" rx="7" ry="3.2" transform="rotate(-20 26 20)" fill="url(#gl-${uid})"/>
<!-- Bintang Berkedip -->
<g transform="translate(12 18) scale(0.65)"><path class="pfx-twinkle" fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
</svg>`;
    },
    pet_penguin: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.45"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.25" r="0.85">
<stop offset="0" stop-color="#475569"/>
<stop offset="0.55" stop-color="#0f172a"/>
<stop offset="1" stop-color="#020617"/>
</radialGradient>
<radialGradient id="tummy-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.6" stop-color="#f8fafc"/>
<stop offset="1" stop-color="#cbd5e1"/>
</radialGradient>
<radialGradient id="aura-${uid}" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="#67e8f9" stop-opacity="0.45"/>
<stop offset="70%" stop-color="#06b6d4" stop-opacity="0.15"/>
<stop offset="100%" stop-color="#0891b2" stop-opacity="0"/>
</radialGradient>
<linearGradient id="sc-${uid}" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#38bdf8"/>
<stop offset="1" stop-color="#0284c7"/>
</linearGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="35" r="28" fill="url(#aura-${uid})"/>
<ellipse cx="32" cy="58.5" rx="19" ry="3.6" fill="url(#sh-${uid})"/>
<!-- Sayap Kiri & Kanan -->
<ellipse cx="12" cy="39" rx="4.5" ry="11" transform="rotate(25 12 39)" fill="url(#b-${uid})"/>
<ellipse cx="52" cy="39" rx="4.5" ry="11" transform="rotate(-25 52 39)" fill="url(#b-${uid})"/>
<!-- Kaki Oranye -->
<ellipse cx="23" cy="57" rx="5.5" ry="2.8" fill="#f97316"/>
<ellipse cx="41" cy="57" rx="5.5" ry="2.8" fill="#f97316"/>
<!-- Tubuh 3D Hitam -->
<ellipse cx="32" cy="36" rx="18.5" ry="21" fill="url(#b-${uid})"/>
<!-- Perut Putih Mengkilap -->
<ellipse cx="32" cy="40" rx="13" ry="16" fill="url(#tummy-${uid})"/>
<!-- Pipi Merona -->
<ellipse cx="20" cy="32" rx="3" ry="1.8" fill="#fb7185" opacity=".5"/>
<ellipse cx="44" cy="32" rx="3" ry="1.8" fill="#fb7185" opacity=".5"/>
<!-- Mata Hitam Ceria -->
<ellipse cx="25" cy="27" rx="2.4" ry="3.2" fill="#0f172a"/>
<circle cx="24.2" cy="25.8" r="1.1" fill="#fff"/>
<circle cx="26" cy="28.2" r="0.5" fill="#fff" opacity=".85"/>
<ellipse cx="39" cy="27" rx="2.4" ry="3.2" fill="#0f172a"/>
<circle cx="38.2" cy="25.8" r="1.1" fill="#fff"/>
<circle cx="40" cy="28.2" r="0.5" fill="#fff" opacity=".85"/>
<!-- Paruh Oranye 3D -->
<polygon points="32,29 27.5,33.5 36.5,33.5" fill="#f97316"/>
<polygon points="32,35.5 28.5,33.5 35.5,33.5" fill="#ea580c"/>
<!-- Syal Rajut Biru Es -->
<path d="M16 33Q32 38 48 33L46 38Q32 43 18 38Z" fill="url(#sc-${uid})"/>
<rect x="36" y="36" width="6" height="13" rx="2" fill="url(#sc-${uid})"/>
<!-- Kilap Spekular 3D -->
<ellipse cx="24" cy="18" rx="7.5" ry="3.2" transform="rotate(-30 24 18)" fill="url(#gl-${uid})"/>
<!-- Partikel Salju Kristal -->
<g class="pfx-fall" transform="translate(10 16)"><polygon points="0,-4 1,-1 4,0 1,1 0,4 -1,1 -4,0 -1,-1" fill="#e0f2fe"/></g>
<g class="pfx-twinkle" transform="translate(50 16) scale(0.7)"><path fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
</svg>`;
    },
    pet_fox: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.45"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.25" r="0.85">
<stop offset="0" stop-color="#ffedd5"/>
<stop offset="0.45" stop-color="#f97316"/>
<stop offset="1" stop-color="#9a3412"/>
</radialGradient>
<radialGradient id="w-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#ffffff"/>
<stop offset="0.6" stop-color="#fff7ed"/>
<stop offset="1" stop-color="#fed7aa"/>
</radialGradient>
<radialGradient id="aura-${uid}" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="#fb923c" stop-opacity="0.45"/>
<stop offset="70%" stop-color="#ea580c" stop-opacity="0.15"/>
<stop offset="100%" stop-color="#c2410c" stop-opacity="0"/>
</radialGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="35" r="28" fill="url(#aura-${uid})"/>
<ellipse cx="32" cy="58.5" rx="19" ry="3.6" fill="url(#sh-${uid})"/>
<!-- Ekor Rubah Raksasa Berputar -->
<g class="pfx-sway" transform="translate(48 40)">
  <path d="M-4 12Q16 10 14 -8Q12 -18 2 -12Q-4 -2 -4 12Z" fill="url(#b-${uid})"/>
  <path d="M14 -8Q12 -18 2 -12Q0 -8 4 -4Z" fill="url(#w-${uid})"/>
</g>
<!-- Telinga Besar Runcing -->
<polygon points="12,12 25,23 9,27" fill="url(#b-${uid})"/>
<polygon points="13,15 22,23 11,25" fill="#1e293b"/>
<polygon points="52,12 39,23 55,27" fill="url(#b-${uid})"/>
<polygon points="51,15 42,23 53,25" fill="#1e293b"/>
<!-- Badan & Pipi Khas Rubah -->
<circle cx="32" cy="36" r="18" fill="url(#b-${uid})"/>
<path d="M16 38Q32 50 48 38Q32 56 16 38Z" fill="url(#w-${uid})"/>
<polygon points="32,44 29.5,41.5 34.5,41.5" fill="#0f172a"/>
<!-- Mata Rubah Cerdik Menyala -->
<ellipse cx="23.5" cy="32" rx="2.5" ry="3.5" transform="rotate(-10 23.5 32)" fill="#1e293b"/>
<circle cx="23" cy="30.5" r="1.1" fill="#fff"/>
<circle cx="24.5" cy="33.2" r="0.5" fill="#facc15"/>
<ellipse cx="40.5" cy="32" rx="2.5" ry="3.5" transform="rotate(10 40.5 32)" fill="#1e293b"/>
<circle cx="40" cy="30.5" r="1.1" fill="#fff"/>
<circle cx="41.5" cy="33.2" r="0.5" fill="#facc15"/>
<!-- Kilap Spekular 3D -->
<ellipse cx="25" cy="20" rx="7" ry="3" transform="rotate(-25 25 20)" fill="url(#gl-${uid})"/>
<!-- Bola Api Rubah Mengorbit -->
<g class="pfx-spin" transform="translate(32 32)">
  <circle cx="24" cy="0" r="3" fill="#fde047" opacity=".9"/>
</g>
</svg>`;
    },
    pet_owl: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.45"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.25" r="0.85">
<stop offset="0" stop-color="#e9d5ff"/>
<stop offset="0.5" stop-color="#9333ea"/>
<stop offset="1" stop-color="#3b0764"/>
</radialGradient>
<radialGradient id="aura-${uid}" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="#c084fc" stop-opacity="0.55"/>
<stop offset="70%" stop-color="#7e22ce" stop-opacity="0.2"/>
<stop offset="100%" stop-color="#3b0764" stop-opacity="0"/>
</radialGradient>
<radialGradient id="eye-${uid}" cx="0.35" cy="0.3" r="0.8">
<stop offset="0" stop-color="#fef08a"/>
<stop offset="0.6" stop-color="#eab308"/>
<stop offset="1" stop-color="#854d0e"/>
</radialGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="35" r="30" fill="url(#aura-${uid})"/>
<ellipse cx="32" cy="58.5" rx="19" ry="3.6" fill="url(#sh-${uid})"/>
<!-- Ranting Kayu Dudukan -->
<rect x="12" y="54" width="40" height="4.5" rx="2.2" fill="#78350f"/>
<!-- Bulu Tanduk Malam Kiri & Kanan -->
<polygon points="16,13 25,23 13,26" fill="url(#b-${uid})"/>
<polygon points="48,13 39,23 51,26" fill="url(#b-${uid})"/>
<!-- Sayap Terkatup -->
<ellipse cx="14" cy="38" rx="4.5" ry="11" transform="rotate(15 14 38)" fill="url(#b-${uid})"/>
<ellipse cx="50" cy="38" rx="4.5" ry="11" transform="rotate(-15 50 38)" fill="url(#b-${uid})"/>
<!-- Badan Bulat 3D -->
<ellipse cx="32" cy="36" rx="18" ry="20" fill="url(#b-${uid})"/>
<!-- Pola Dada Bintang Berbintik -->
<ellipse cx="32" cy="43" rx="11" ry="12" fill="#f5f3ff" opacity=".9"/>
<path d="M28 39L32 41L36 39M26 44L32 46L38 44M28 49L32 51L36 49" stroke="#7e22ce" stroke-width="1.2" stroke-linecap="round"/>
<!-- Mata Burung Hantu Besar Berkilau -->
<circle cx="23" cy="28" r="7.5" fill="#f5f3ff"/>
<circle cx="23" cy="28" r="6" fill="url(#eye-${uid})"/>
<circle cx="23" cy="28" r="3.2" fill="#0f172a"/>
<circle cx="21.5" cy="26.5" r="1.3" fill="#fff"/>
<circle cx="24.5" cy="29.5" r="0.6" fill="#fff" opacity=".85"/>
<circle cx="41" cy="28" r="7.5" fill="#f5f3ff"/>
<circle cx="41" cy="28" r="6" fill="url(#eye-${uid})"/>
<circle cx="41" cy="28" r="3.2" fill="#0f172a"/>
<circle cx="39.5" cy="26.5" r="1.3" fill="#fff"/>
<circle cx="42.5" cy="29.5" r="0.6" fill="#fff" opacity=".85"/>
<!-- Paruh Emas Melengkung -->
<polygon points="32,32 30,37 34,37" fill="#f59e0b"/>
<!-- Topi Penyihir Mungil Berbintang -->
<g transform="translate(32 16) scale(0.65)">
  <ellipse cx="0" cy="4" rx="14" ry="3.5" fill="#3b0764"/>
  <polygon points="0,-16 -9,4 9,4" fill="#6b21a8"/>
  <circle cx="0" cy="-16" r="2.2" fill="#facc15"/>
</g>
<!-- Partikel Cahaya Mistis Melayang -->
<circle class="pfx-rise" cx="20" cy="45" r="2" fill="#e9d5ff"/>
<circle class="pfx-rise" style="animation-delay:1.2s" cx="44" cy="48" r="1.8" fill="#e9d5ff"/>
<!-- Kilap Spekular 3D -->
<ellipse cx="25" cy="18" rx="6" ry="2.8" transform="rotate(-25 25 18)" fill="url(#gl-${uid})"/>
</svg>`;
    },
    pet_dragon: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.5"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.25" r="0.85">
<stop offset="0" stop-color="#bbf7d0"/>
<stop offset="0.5" stop-color="#16a34a"/>
<stop offset="1" stop-color="#064e3b"/>
</radialGradient>
<radialGradient id="belly-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fef08a"/>
<stop offset="0.6" stop-color="#eab308"/>
<stop offset="1" stop-color="#854d0e"/>
</radialGradient>
<radialGradient id="horn-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fef08a"/>
<stop offset="0.5" stop-color="#f59e0b"/>
<stop offset="1" stop-color="#b45309"/>
</radialGradient>
<radialGradient id="aura-${uid}" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="#fef08a" stop-opacity="0.65"/>
<stop offset="60%" stop-color="#f59e0b" stop-opacity="0.25"/>
<stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
</radialGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="34" r="32" fill="url(#aura-${uid})"/>
<ellipse cx="32" cy="58.5" rx="19" ry="3.6" fill="url(#sh-${uid})"/>
<!-- Sayap Naga Hijau-Emas -->
<path d="M12 28Q2 22 6 38Q14 36 18 32Z" fill="url(#belly-${uid})"/>
<path d="M52 28Q62 22 58 38Q50 36 46 32Z" fill="url(#belly-${uid})"/>
<!-- Ekor Naga dengan Api Kecil -->
<path d="M46 50Q56 52 54 42Q50 38 46 44" fill="none" stroke="url(#b-${uid})" stroke-width="4.5" stroke-linecap="round"/>
<circle class="pfx-pulse" cx="54" cy="40" r="3" fill="#f97316"/>
<!-- Tanduk Emas Kembar -->
<polygon points="20,10 26,20 16,18" fill="url(#horn-${uid})"/>
<polygon points="44,10 38,20 48,18" fill="url(#horn-${uid})"/>
<!-- Badan 3D Bulat Mungil -->
<ellipse cx="32" cy="36" rx="18.5" ry="20" fill="url(#b-${uid})"/>
<!-- Perut Sisik Emas -->
<ellipse cx="32" cy="42" rx="11" ry="13" fill="url(#belly-${uid})"/>
<path d="M24 37H40M23 42H41M25 47H39" stroke="#92400e" stroke-width="1.1" stroke-linecap="round"/>
<!-- Mata Naga Kosmik Berkilau Emas -->
<ellipse cx="23.5" cy="30" rx="2.8" ry="3.8" fill="#1e293b"/>
<circle cx="22.5" cy="28.5" r="1.3" fill="#fff"/>
<circle cx="24.8" cy="31.5" r="0.6" fill="#fde047"/>
<ellipse cx="40.5" cy="30" rx="2.8" ry="3.8" fill="#1e293b"/>
<circle cx="39.5" cy="28.5" r="1.3" fill="#fff"/>
<circle cx="41.8" cy="31.5" r="0.6" fill="#fde047"/>
<!-- Moncong Lucu & Hembusan Asap Kecil -->
<ellipse cx="32" cy="36" rx="7" ry="4.5" fill="url(#b-${uid})"/>
<circle cx="29.5" cy="35" r="0.9" fill="#064e3b"/>
<circle cx="34.5" cy="35" r="0.9" fill="#064e3b"/>
<!-- Partikel Bintang Kosmik Berkedip -->
<g class="pfx-twinkle" transform="translate(10 16) scale(0.8)"><path fill="#ffffff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
<g class="pfx-twinkle" style="animation-delay:0.8s" transform="translate(54 18) scale(0.7)"><path fill="#fef08a" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
<!-- Kilap Spekular 3D -->
<ellipse cx="25" cy="19" rx="7.5" ry="3.2" transform="rotate(-25 25 19)" fill="url(#gl-${uid})"/>
</svg>`;
    },
    pet_phoenix: function(uid) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
<radialGradient id="sh-${uid}" cx="0.5" cy="0.5" r="0.5">
<stop offset="0" stop-color="#0f172a" stop-opacity="0.5"/>
<stop offset="1" stop-color="#0f172a" stop-opacity="0"/>
</radialGradient>
<linearGradient id="gl-${uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/>
<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
</linearGradient>
<radialGradient id="b-${uid}" cx="0.35" cy="0.25" r="0.85">
<stop offset="0" stop-color="#fef08a"/>
<stop offset="0.45" stop-color="#ef4444"/>
<stop offset="1" stop-color="#7f1d1d"/>
</radialGradient>
<radialGradient id="w-${uid}" cx="0.35" cy="0.28" r="0.85">
<stop offset="0" stop-color="#fff7ed"/>
<stop offset="0.5" stop-color="#f97316"/>
<stop offset="1" stop-color="#c2410c"/>
</radialGradient>
<radialGradient id="aura-${uid}" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="#f97316" stop-opacity="0.7"/>
<stop offset="65%" stop-color="#ef4444" stop-opacity="0.25"/>
<stop offset="100%" stop-color="#b91c1c" stop-opacity="0"/>
</radialGradient>
</defs>
<circle class="pfx-pulse" cx="32" cy="34" r="32" fill="url(#aura-${uid})"/>
<ellipse cx="32" cy="58.5" rx="19" ry="3.6" fill="url(#sh-${uid})"/>
<!-- Ekor Bulu Phoenix Api Panjang -->
<path d="M32 50Q24 62 20 58Q28 54 30 48" fill="url(#w-${uid})"/>
<path d="M32 50Q40 62 44 58Q36 54 34 48" fill="url(#w-${uid})"/>
<path d="M32 50Q32 64 32 56" fill="none" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>
<!-- Jambul Api di Kepala -->
<path d="M32 18Q28 4 30 2Q34 8 32 18Z" fill="#facc15"/>
<path d="M27 19Q21 7 24 5Q27 10 28 19Z" fill="#f97316"/>
<path d="M37 19Q43 7 40 5Q37 10 36 19Z" fill="#f97316"/>
<!-- Sayap Api Membentang Lembut -->
<path d="M12 28Q2 20 8 40Q16 38 20 34Z" fill="url(#w-${uid})"/>
<path d="M52 28Q62 20 56 40Q48 38 44 34Z" fill="url(#w-${uid})"/>
<!-- Badan 3D Bulat -->
<ellipse cx="32" cy="36" rx="17.5" ry="19" fill="url(#b-${uid})"/>
<!-- Dada Emas Berkilau -->
<ellipse cx="32" cy="40" rx="10" ry="12" fill="#fef08a" opacity=".95"/>
<polygon points="32,32 29,36 35,36" fill="#f59e0b"/>
<!-- Mata Phoenix Merah Ruby Berkilau -->
<ellipse cx="24.5" cy="28.5" rx="2.5" ry="3.4" fill="#450a0a"/>
<circle cx="23.6" cy="27.2" r="1.1" fill="#fff"/>
<circle cx="25.4" cy="29.8" r="0.5" fill="#fde047"/>
<ellipse cx="39.5" cy="28.5" rx="2.5" ry="3.4" fill="#450a0a"/>
<circle cx="38.6" cy="27.2" r="1.1" fill="#fff"/>
<circle cx="40.4" cy="29.8" r="0.5" fill="#fde047"/>
<!-- Partikel Bara Api Melayang Naik -->
<circle class="pfx-rise" cx="24" cy="46" r="2.2" fill="#f97316"/>
<circle class="pfx-rise" style="animation-delay:0.7s" cx="40" cy="48" r="1.8" fill="#facc15"/>
<circle class="pfx-rise" style="animation-delay:1.4s" cx="20" cy="38" r="1.5" fill="#ef4444"/>
<!-- Kilap Spekular 3D -->
<ellipse cx="25" cy="20" rx="7" ry="3.2" transform="rotate(-25 25 20)" fill="url(#gl-${uid})"/>
</svg>`;
    },
  };

  /**
   * Menyisipkan SVG pet ke dalam SVG avatar (posisi slot kiri bawah karakter).
   * @param {string} petId - ID pet (contoh: 'pet_cat', 'pet_hamster', dll)
   * @param {string} uid - Unique instance ID untuk scoping gradient
   * @param {object} opts - { x: 4, y: 132, size: 56 }
   * @returns {string} - Tag <svg> yang siap disematkan
   */
  function embedPetArt(petId, uid, opts = {}) {
    if (!petId) return '';
    const make = PET_ART[petId];
    if (!make) return '';
    const { x = 4, y = 132, size = 56 } = opts;
    const raw = make(uid || 'def');
    return raw
      .replace('<svg ', `<svg x="${x}" y="${y}" overflow="visible" `)
      .replace('width="64" height="64"', `width="${size}" height="${size}"`);
  }

  const PetArt = {
    PET_ART,
    embedPetArt,
    hasPetArt: function(petId) {
      return Boolean(PET_ART[petId]);
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PetArt;
  }
  root.PetArt = PetArt;
})(typeof window !== 'undefined' ? window : this);
