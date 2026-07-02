// Gera ícones placeholder do PWA a partir de um SVG com a identidade
// visual do Clube Aphrodite. Rode com `node scripts/generate-icons.mjs`.
// Substitua os arquivos gerados por artes finais quando houver.
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const outDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public/icons",
);
mkdirSync(outDir, { recursive: true });

function svg(size, { padding = 0 } = {}) {
  const inner = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;
  const r = inner * 0.34;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#5C1F33"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#C9A961" stroke-width="${size * 0.018}"/>
  <text x="${cx}" y="${cy}" font-family="Georgia, 'Times New Roman', serif" font-size="${inner * 0.42}" fill="#E6D2A2" text-anchor="middle" dominant-baseline="central">A</text>
</svg>`;
}

const targets = [
  { file: "icon-192.png", size: 192, padding: 0 },
  { file: "icon-512.png", size: 512, padding: 0 },
  { file: "icon-maskable-512.png", size: 512, padding: 64 },
  { file: "apple-touch-icon.png", size: 180, padding: 0 },
];

for (const t of targets) {
  await sharp(Buffer.from(svg(t.size, { padding: t.padding })))
    .png()
    .toFile(path.join(outDir, t.file));
  console.log("gerado:", t.file);
}
