/**
 * Generates composed product images for every Apt.Bed variant from a single
 * parametric base model (per the brief: "Create images from one base model").
 *
 * Each SVG is a front elevation of the loft unit: a sleep platform raised to the
 * selected deck height, with the closet / desk / chest storage composed in the
 * open bay underneath. Width scales with mattress size; platform height scales
 * with the Low / Medium / High option. The WOOD finish recolors only the bed's
 * frame and panels — the room background stays constant — so choosing a finish
 * changes the bed, not the scene. Admin can later replace these files with real
 * photography at the same paths.
 *
 * Output: 3 sizes × 3 heights × 3 woods = 27 images.
 * Run: node scripts/generate-product-images.mjs
 */
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "products");
rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const SIZES = {
  twin: { label: "Twin / Twin Long", unitW: 150, mattress: '38" × 80"' },
  queen: { label: "Queen", unitW: 205, mattress: '60" × 80"' },
  king: { label: "King", unitW: 250, mattress: '76" × 80"' },
};

const HEIGHTS = {
  low: { label: "Low", deck: 150 },
  medium: { label: "Medium", deck: 205 },
  high: { label: "High", deck: 255 },
};

// Per-wood palettes — applied ONLY to the bed's frame and panels.
const WOODS = {
  oak: {
    label: "Oak",
    frameDark: "#7A5A3A",
    frameMid: "#9A7A50",
    frameLight: "#C29A62",
    panel: "#E2C68F",
    panelDark: "#B98F5E",
    line: "#4A3521",
  },
  maple: {
    label: "Maple",
    frameDark: "#A9814F",
    frameMid: "#C6A06C",
    frameLight: "#E0C48F",
    panel: "#F0DEB6",
    panelDark: "#D3B583",
    line: "#6B4E2E",
  },
  walnut: {
    label: "Walnut",
    frameDark: "#33241A",
    frameMid: "#4E3626",
    frameLight: "#6E4E38",
    panel: "#7C5B40",
    panelDark: "#5B4130",
    line: "#22160E",
  },
};

// Constant scene colors (never change with wood).
const SCENE = {
  bg: "#F7F2EA",
  wall: "#EFE7DA",
  floor: "#E4D8C6",
  mattress: "#FFFFFF",
  sheet: "#6E9CC4",
  pillow: "#D25A48",
  ink: "#1E3A5F",
  plant: "#8FA98C",
  plantPot: "#C98B6B",
};

function svg(sizeId, heightId, woodId) {
  const s = SIZES[sizeId];
  const h = HEIGHTS[heightId];
  const W = WOODS[woodId];
  const w = W; // wood palette alias
  const width = 560;
  const height = 460;
  const floorY = 380;
  const cx = width / 2;
  const unitW = s.unitW * 1.6;
  const left = cx - unitW / 2;
  const right = cx + unitW / 2;
  const deckTopY = floorY - h.deck;
  const platformH = 46;
  const platTopY = deckTopY - platformH;

  const bayLeft = left + 10;
  const bayRight = right - 10;
  const bayW = bayRight - bayLeft;
  const closetW = bayW * 0.32;
  const deskW = bayW * 0.4;
  const closetX = bayLeft;
  const deskX = closetX + closetW;
  const drawersX = deskX + deskW;
  const drawersW = bayW - closetW - deskW;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Apt.Bed ${s.label} ${h.label} in ${W.label}">
  <!-- constant scene -->
  <rect width="${width}" height="${height}" fill="${SCENE.bg}"/>
  <rect x="0" y="0" width="${width}" height="${floorY}" fill="${SCENE.wall}"/>
  <rect x="0" y="${floorY}" width="${width}" height="${height - floorY}" fill="${SCENE.floor}"/>
  <ellipse cx="${cx}" cy="${floorY + 12}" rx="${unitW / 2 + 34}" ry="14" fill="#000000" opacity="0.06"/>
  <!-- wall art -->
  <rect x="52" y="70" width="60" height="78" rx="4" fill="#FFFFFF" stroke="${SCENE.ink}" stroke-opacity="0.12"/>
  <path d="M60 130 L78 104 L92 122 L104 96 L104 140 L60 140 Z" fill="${SCENE.sheet}" opacity="0.35"/>
  <!-- potted plant -->
  <g transform="translate(${width - 70}, ${floorY - 78})">
    <path d="M20 78 C6 60 6 40 16 24" fill="none" stroke="${SCENE.plant}" stroke-width="4" stroke-linecap="round"/>
    <path d="M20 78 C34 58 36 40 30 22" fill="none" stroke="${SCENE.plant}" stroke-width="4" stroke-linecap="round"/>
    <path d="M20 78 C20 56 22 40 23 26" fill="none" stroke="${SCENE.plant}" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="16" cy="24" rx="7" ry="12" fill="${SCENE.plant}"/>
    <ellipse cx="30" cy="22" rx="7" ry="12" fill="${SCENE.plant}"/>
    <ellipse cx="23" cy="16" rx="6" ry="11" fill="${SCENE.plant}"/>
    <path d="M8 78 L32 78 L29 98 L11 98 Z" fill="${SCENE.plantPot}"/>
  </g>

  <!-- vertical posts (wood) -->
  <rect x="${left}" y="${platTopY}" width="14" height="${floorY - platTopY}" fill="${w.frameDark}"/>
  <rect x="${right - 14}" y="${platTopY}" width="14" height="${floorY - platTopY}" fill="${w.frameDark}"/>

  <!-- storage bay backer (wood) -->
  <rect x="${bayLeft}" y="${deckTopY}" width="${bayW}" height="${floorY - deckTopY}" fill="${w.panel}"/>

  <!-- closet (wood) -->
  <rect x="${closetX}" y="${deckTopY}" width="${closetW}" height="${floorY - deckTopY}" fill="${w.frameLight}" stroke="${w.line}" stroke-opacity="0.25"/>
  <line x1="${closetX + closetW / 2}" y1="${deckTopY + 8}" x2="${closetX + closetW / 2}" y2="${floorY - 8}" stroke="${w.line}" stroke-opacity="0.2"/>
  <line x1="${closetX + 12}" y1="${deckTopY + 20}" x2="${closetX + closetW - 12}" y2="${deckTopY + 20}" stroke="${w.frameDark}" stroke-width="3"/>
  <rect x="${closetX + 20}" y="${deckTopY + 22}" width="10" height="${(floorY - deckTopY) * 0.5}" rx="4" fill="${w.frameMid}"/>
  <rect x="${closetX + closetW - 30}" y="${deckTopY + 22}" width="10" height="${(floorY - deckTopY) * 0.4}" rx="4" fill="${w.panelDark}"/>

  <!-- desk (wood) -->
  <rect x="${deskX}" y="${deckTopY}" width="${deskW}" height="${floorY - deckTopY}" fill="${w.panel}" stroke="${w.line}" stroke-opacity="0.2"/>
  <rect x="${deskX + 8}" y="${deckTopY + (floorY - deckTopY) * 0.42}" width="${deskW - 16}" height="12" fill="${w.frameMid}"/>
  <rect x="${deskX + deskW / 2 - 22}" y="${deckTopY + (floorY - deckTopY) * 0.42 + 12}" width="8" height="${(floorY - deckTopY) * 0.4}" fill="${w.frameDark}"/>
  <rect x="${deskX + deskW / 2 + 14}" y="${deckTopY + (floorY - deckTopY) * 0.42 + 12}" width="8" height="${(floorY - deckTopY) * 0.4}" fill="${w.frameDark}"/>
  <circle cx="${deskX + deskW / 2}" cy="${deckTopY + (floorY - deckTopY) * 0.24}" r="10" fill="${SCENE.sheet}" opacity="0.65"/>

  <!-- chest of drawers (wood) -->
  <rect x="${drawersX}" y="${deckTopY}" width="${drawersW}" height="${floorY - deckTopY}" fill="${w.frameLight}" stroke="${w.line}" stroke-opacity="0.25"/>
  ${[0, 1, 2, 3]
    .map((i) => {
      const dh = (floorY - deckTopY) / 4;
      const y = deckTopY + i * dh + 4;
      return `<rect x="${drawersX + 6}" y="${y}" width="${drawersW - 12}" height="${dh - 8}" rx="4" fill="${w.panel}" stroke="${w.line}" stroke-opacity="0.2"/><circle cx="${drawersX + drawersW / 2}" cy="${y + (dh - 8) / 2}" r="4" fill="${w.frameDark}"/>`;
    })
    .join("\n  ")}

  <!-- bed platform base (wood) -->
  <rect x="${left - 6}" y="${deckTopY - 12}" width="${unitW + 12}" height="12" fill="${w.frameDark}"/>
  <!-- mattress (constant) -->
  <rect x="${left + 4}" y="${platTopY}" width="${unitW - 8}" height="34" rx="8" fill="${SCENE.mattress}" stroke="${w.line}" stroke-opacity="0.12"/>
  <rect x="${left + 4}" y="${platTopY + 22}" width="${unitW - 8}" height="12" rx="6" fill="${SCENE.sheet}" opacity="0.55"/>
  <!-- pillow (constant accent) -->
  <rect x="${left + 16}" y="${platTopY + 6}" width="60" height="20" rx="8" fill="${SCENE.pillow}" opacity="0.9"/>
  <!-- guard rail (wood) -->
  <line x1="${right - 20}" y1="${platTopY - 20}" x2="${right - 20}" y2="${platTopY}" stroke="${w.frameDark}" stroke-width="5" stroke-linecap="round"/>
  <line x1="${right - 70}" y1="${platTopY - 20}" x2="${right - 70}" y2="${platTopY}" stroke="${w.frameDark}" stroke-width="5" stroke-linecap="round"/>
  <line x1="${right - 70}" y1="${platTopY - 20}" x2="${right - 20}" y2="${platTopY - 20}" stroke="${w.frameDark}" stroke-width="5" stroke-linecap="round"/>

  <!-- ladder (wood) -->
  <line x1="${left + 14}" y1="${platTopY}" x2="${left + 14}" y2="${floorY}" stroke="${w.frameMid}" stroke-width="6"/>
  <line x1="${left + 40}" y1="${platTopY}" x2="${left + 40}" y2="${floorY}" stroke="${w.frameMid}" stroke-width="6"/>
  ${[0.2, 0.42, 0.64, 0.86]
    .map((t) => {
      const y = platTopY + (floorY - platTopY) * t;
      return `<line x1="${left + 14}" y1="${y}" x2="${left + 40}" y2="${y}" stroke="${w.frameDark}" stroke-width="5" stroke-linecap="round"/>`;
    })
    .join("\n  ")}
</svg>
`;
}

let count = 0;
for (const sizeId of Object.keys(SIZES)) {
  for (const heightId of Object.keys(HEIGHTS)) {
    for (const woodId of Object.keys(WOODS)) {
      const file = join(OUT_DIR, `apt-bed-${sizeId}-${heightId}-${woodId}.svg`);
      writeFileSync(file, svg(sizeId, heightId, woodId), "utf8");
      count++;
    }
  }
}
console.log(`Generated ${count} product images into ${OUT_DIR}`);
