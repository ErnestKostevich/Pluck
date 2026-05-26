/**
 * Generate Pluck's icon set + Chrome Web Store promotional tiles.
 *
 * Renders SVG → PNG via sharp. Outputs:
 *   apps/extension/public/icon/{16,32,48,96,128}.png   (manifest icons)
 *   docs/cws-assets/promo-small-440x280.png            (CWS small tile)
 *   docs/cws-assets/promo-marquee-1400x560.png         (CWS marquee tile)
 *   docs/cws-assets/icon-source.svg                    (the master SVG, for reference)
 *
 * The icon is the cherry that matches the 🍒 brand emoji used elsewhere:
 * two pink-red cherries on a dark indigo gradient backdrop with rounded
 * corners. Reads at 16px as "two pink dots on dark" — recognizable enough.
 *
 * Run: pnpm gen-icons
 */

import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');
const ICON_DIR = resolve(REPO_ROOT, 'apps/extension/src/public/icon');
const CWS_DIR = resolve(REPO_ROOT, 'docs/cws-assets');

const ICON_SIZES = [16, 32, 48, 96, 128];

// ── Master icon SVG ────────────────────────────────────────────────────────
// 128x128 viewbox. Rounded square frame. Two cherries with a leaf and stem.

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#0a0a0c"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="rgba(99,102,241,0.4)"/>
      <stop offset="100%" stop-color="rgba(99,102,241,0)"/>
    </radialGradient>
    <radialGradient id="cherry" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fb7185"/>
      <stop offset="60%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </radialGradient>
    <linearGradient id="leaf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
  </defs>

  <!-- Frame -->
  <rect width="128" height="128" rx="28" fill="url(#bg)"/>
  <rect width="128" height="128" rx="28" fill="url(#glow)"/>

  <!-- Stems -->
  <path d="M 50 78 Q 56 50 64 30" stroke="#84cc16" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M 80 80 Q 72 56 64 30" stroke="#84cc16" stroke-width="3" fill="none" stroke-linecap="round"/>

  <!-- Leaf -->
  <path d="M 64 30 Q 84 18 92 32 Q 84 40 64 30 Z" fill="url(#leaf)"/>

  <!-- Cherries (left + right) -->
  <circle cx="46" cy="86" r="20" fill="url(#cherry)"/>
  <circle cx="84" cy="92" r="20" fill="url(#cherry)"/>

  <!-- Cherry highlights -->
  <ellipse cx="40" cy="79" rx="6" ry="4" fill="rgba(255,255,255,0.55)" transform="rotate(-25 40 79)"/>
  <ellipse cx="78" cy="85" rx="6" ry="4" fill="rgba(255,255,255,0.55)" transform="rotate(-25 78 85)"/>
</svg>`;

// ── Small promo tile (440x280) ─────────────────────────────────────────────

const promoSmallSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 280" width="440" height="280">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0c"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <radialGradient id="glow1" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="rgba(99,102,241,0.45)"/>
      <stop offset="100%" stop-color="rgba(99,102,241,0)"/>
    </radialGradient>
    <radialGradient id="glow2" cx="20%" cy="100%" r="55%">
      <stop offset="0%" stop-color="rgba(236,72,153,0.35)"/>
      <stop offset="100%" stop-color="rgba(236,72,153,0)"/>
    </radialGradient>
    <radialGradient id="cherry" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fb7185"/>
      <stop offset="60%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </radialGradient>
    <linearGradient id="leaf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <linearGradient id="textgrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#c7d2fe"/>
    </linearGradient>
  </defs>

  <rect width="440" height="280" fill="url(#bg)"/>
  <rect width="440" height="280" fill="url(#glow1)"/>
  <rect width="440" height="280" fill="url(#glow2)"/>

  <!-- Cherry mark, scaled and positioned left -->
  <g transform="translate(28, 60) scale(1.15)">
    <path d="M 50 78 Q 56 50 64 30" stroke="#84cc16" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M 80 80 Q 72 56 64 30" stroke="#84cc16" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M 64 30 Q 84 18 92 32 Q 84 40 64 30 Z" fill="url(#leaf)"/>
    <circle cx="46" cy="86" r="20" fill="url(#cherry)"/>
    <circle cx="84" cy="92" r="20" fill="url(#cherry)"/>
    <ellipse cx="40" cy="79" rx="6" ry="4" fill="rgba(255,255,255,0.55)" transform="rotate(-25 40 79)"/>
    <ellipse cx="78" cy="85" rx="6" ry="4" fill="rgba(255,255,255,0.55)" transform="rotate(-25 78 85)"/>
  </g>

  <!-- Text -->
  <text x="200" y="106" font-family="Inter, system-ui, sans-serif" font-size="44" font-weight="700" fill="url(#textgrad)" letter-spacing="-1.5">Pluck</text>
  <text x="200" y="142" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="500" fill="#a5b4fc">AI visual web scraper</text>
  <text x="200" y="186" font-family="Inter, system-ui, sans-serif" font-size="14" fill="#cbd5e1">Click anything. Get a</text>
  <text x="200" y="206" font-family="Inter, system-ui, sans-serif" font-size="14" fill="#cbd5e1">clean table. No code.</text>
  <text x="200" y="240" font-family="ui-monospace, monospace" font-size="11" fill="#737373">$29 lifetime · free path</text>
</svg>`;

// ── Marquee tile (1400x560) ────────────────────────────────────────────────

const marqueeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 560" width="1400" height="560">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0c"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <radialGradient id="glow1" cx="75%" cy="20%" r="50%">
      <stop offset="0%" stop-color="rgba(99,102,241,0.45)"/>
      <stop offset="100%" stop-color="rgba(99,102,241,0)"/>
    </radialGradient>
    <radialGradient id="glow2" cx="15%" cy="80%" r="50%">
      <stop offset="0%" stop-color="rgba(236,72,153,0.35)"/>
      <stop offset="100%" stop-color="rgba(236,72,153,0)"/>
    </radialGradient>
    <radialGradient id="cherry" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fb7185"/>
      <stop offset="60%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </radialGradient>
    <linearGradient id="leaf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <linearGradient id="textgrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#c7d2fe"/>
      <stop offset="100%" stop-color="#fbcfe8"/>
    </linearGradient>
  </defs>

  <rect width="1400" height="560" fill="url(#bg)"/>
  <rect width="1400" height="560" fill="url(#glow1)"/>
  <rect width="1400" height="560" fill="url(#glow2)"/>

  <!-- Cherry mark -->
  <g transform="translate(80, 180) scale(2.2)">
    <path d="M 50 78 Q 56 50 64 30" stroke="#84cc16" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M 80 80 Q 72 56 64 30" stroke="#84cc16" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M 64 30 Q 84 18 92 32 Q 84 40 64 30 Z" fill="url(#leaf)"/>
    <circle cx="46" cy="86" r="20" fill="url(#cherry)"/>
    <circle cx="84" cy="92" r="20" fill="url(#cherry)"/>
    <ellipse cx="40" cy="79" rx="6" ry="4" fill="rgba(255,255,255,0.55)" transform="rotate(-25 40 79)"/>
    <ellipse cx="78" cy="85" rx="6" ry="4" fill="rgba(255,255,255,0.55)" transform="rotate(-25 78 85)"/>
  </g>

  <!-- Headline -->
  <text x="420" y="240" font-family="Inter, system-ui, sans-serif" font-size="96" font-weight="700" fill="url(#textgrad)" letter-spacing="-4">Click anything.</text>
  <text x="420" y="340" font-family="Inter, system-ui, sans-serif" font-size="96" font-weight="700" fill="url(#textgrad)" letter-spacing="-4">Get a clean table.</text>
  <text x="420" y="400" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="500" fill="#a5b4fc">AI-powered visual web scraper for Chrome · $29 lifetime · free path with on-device AI</text>

  <!-- Decorative chip -->
  <rect x="420" y="440" width="220" height="40" rx="20" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)"/>
  <circle cx="438" cy="460" r="4" fill="#10b981"/>
  <text x="452" y="466" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="500" fill="#cbd5e1">v0.0.1 · pre-alpha</text>
</svg>`;

async function main() {
  await mkdir(ICON_DIR, { recursive: true });
  await mkdir(CWS_DIR, { recursive: true });

  // Save the master SVG for reference.
  await writeFile(resolve(CWS_DIR, 'icon-source.svg'), iconSvg, 'utf-8');

  // Render icons.
  for (const size of ICON_SIZES) {
    const out = resolve(ICON_DIR, `${size}.png`);
    await sharp(Buffer.from(iconSvg))
      .resize(size, size, { fit: 'contain' })
      .png()
      .toFile(out);
    console.log(`✓ ${out}`);
  }

  // Render promo tiles.
  await sharp(Buffer.from(promoSmallSvg))
    .png()
    .toFile(resolve(CWS_DIR, 'promo-small-440x280.png'));
  console.log(`✓ ${resolve(CWS_DIR, 'promo-small-440x280.png')}`);

  await sharp(Buffer.from(marqueeSvg))
    .png()
    .toFile(resolve(CWS_DIR, 'promo-marquee-1400x560.png'));
  console.log(`✓ ${resolve(CWS_DIR, 'promo-marquee-1400x560.png')}`);

  console.log('\nDone. Icons are in apps/extension/public/icon/');
  console.log('Promo tiles are in docs/cws-assets/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
