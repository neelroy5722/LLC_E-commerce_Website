import "server-only";

function toHex(c: number): string {
  return Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0");
}

/** Lighten (amt > 0) or darken (amt < 0) a #rrggbb hex color. amt in −1..1. */
function shade(hex: string, amt: number): string {
  const h = (hex || "#C9A26B").replace("#", "").padStart(6, "0");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const adj = (c: number) => (amt < 0 ? c * (1 + amt) : c + (255 - c) * amt);
  return `#${toHex(adj(r))}${toHex(adj(g))}${toHex(adj(b))}`;
}

/**
 * Generates a clean composed SVG preview for a size × height × wood combination,
 * tinted to the wood's swatch. Used to auto-generate the "Product images" grid
 * entries when an admin adds a new size or finish, matching the shipped previews.
 */
export function productPlaceholderSvg(opts: {
  sizeLabel: string;
  heightLabel: string;
  woodLabel: string;
  swatch: string;
  deckLevel: number; // 0 = low, 1 = medium, 2 = high
}): string {
  const { sizeLabel, heightLabel, woodLabel, swatch } = opts;
  const level = Math.max(0, Math.min(2, opts.deckLevel));
  const dark = shade(swatch, -0.38);
  const mid = shade(swatch, -0.12);
  const light = shade(swatch, 0.22);
  const deckY = [152, 128, 104][level]; // top of the storage bay
  const bayH = 380 - deckY;
  const caption = `Apt.Bed — ${sizeLabel} · ${heightLabel} · ${woodLabel}`;

  const drawers = [0, 1, 2, 3]
    .map((i) => {
      const y = deckY + 6 + i * ((bayH - 12) / 4);
      const dh = (bayH - 12) / 4 - 6;
      return `<rect x="346" y="${y.toFixed(1)}" width="80" height="${dh.toFixed(1)}" rx="4" fill="${light}" stroke="#4A3521" stroke-opacity="0.2"/><circle cx="386" cy="${(y + dh / 2).toFixed(1)}" r="4" fill="${dark}"/>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 460" width="560" height="460" role="img" aria-label="${caption}">
  <rect width="560" height="460" fill="#F7F2EA"/>
  <rect width="560" height="380" fill="#EFE7DA"/>
  <rect y="380" width="560" height="80" fill="#E4D8C6"/>
  <ellipse cx="280" cy="392" rx="198" ry="14" fill="#000000" opacity="0.06"/>
  <rect x="52" y="70" width="60" height="78" rx="4" fill="#FFFFFF" stroke="#1E3A5F" stroke-opacity="0.12"/>
  <path d="M60 130 L78 104 L92 122 L104 96 L104 140 L60 140 Z" fill="#6E9CC4" opacity="0.35"/>
  <rect x="118" y="${deckY - 6}" width="14" height="${380 - (deckY - 6)}" fill="${dark}"/>
  <rect x="428" y="${deckY - 6}" width="14" height="${380 - (deckY - 6)}" fill="${dark}"/>
  <rect x="132" y="${deckY}" width="296" height="${bayH}" fill="${swatch}"/>
  <rect x="132" y="${deckY}" width="96" height="${bayH}" fill="${mid}" stroke="#4A3521" stroke-opacity="0.25"/>
  <rect x="150" y="${deckY + 20}" width="10" height="${(bayH * 0.5).toFixed(1)}" rx="4" fill="${light}"/>
  <rect x="196" y="${deckY + 20}" width="10" height="${(bayH * 0.4).toFixed(1)}" rx="4" fill="${light}"/>
  <rect x="228" y="${deckY}" width="118" height="${bayH}" fill="${swatch}" stroke="#4A3521" stroke-opacity="0.2"/>
  <rect x="236" y="${deckY + Math.round(bayH * 0.42)}" width="102" height="12" fill="${dark}"/>
  <circle cx="287" cy="${deckY + Math.round(bayH * 0.24)}" r="10" fill="#6E9CC4" opacity="0.6"/>
  ${drawers}
  <rect x="110" y="${deckY - 18}" width="340" height="12" fill="${dark}"/>
  <rect x="120" y="${deckY - 52}" width="320" height="34" rx="8" fill="#FFFFFF" stroke="#4A3521" stroke-opacity="0.12"/>
  <rect x="120" y="${deckY - 30}" width="320" height="12" rx="6" fill="#6E9CC4" opacity="0.55"/>
  <rect x="132" y="${deckY - 46}" width="60" height="20" rx="8" fill="#D25A48" opacity="0.9"/>
  <text x="280" y="436" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-weight="600" fill="#1E3A5F">${caption}</text>
</svg>`;
}
