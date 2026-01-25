import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'icons');

// Ensure icons directory exists
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// SVG icon design - a globe with swap arrows
const createSvg = (size) => {
  const strokeWidth = size < 32 ? 2 : size < 64 ? 3 : 4;
  const padding = size * 0.1;
  const center = size / 2;
  const radius = (size - padding * 2) / 2 - strokeWidth;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background circle -->
  <circle cx="${center}" cy="${center}" r="${radius + strokeWidth/2}" fill="url(#grad1)"/>

  <!-- Globe outline -->
  <circle cx="${center}" cy="${center}" r="${radius * 0.7}" fill="none" stroke="white" stroke-width="${strokeWidth * 0.8}"/>

  <!-- Globe horizontal line -->
  <ellipse cx="${center}" cy="${center}" rx="${radius * 0.7}" ry="${radius * 0.3}" fill="none" stroke="white" stroke-width="${strokeWidth * 0.6}"/>

  <!-- Globe vertical line -->
  <ellipse cx="${center}" cy="${center}" rx="${radius * 0.3}" ry="${radius * 0.7}" fill="none" stroke="white" stroke-width="${strokeWidth * 0.6}"/>

  <!-- Swap arrows - right arrow -->
  <path d="M ${center + radius * 0.3} ${center - radius * 0.5} L ${center + radius * 0.6} ${center - radius * 0.5} L ${center + radius * 0.45} ${center - radius * 0.7} M ${center + radius * 0.6} ${center - radius * 0.5} L ${center + radius * 0.45} ${center - radius * 0.3}"
        fill="none" stroke="white" stroke-width="${strokeWidth * 0.7}" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Swap arrows - left arrow -->
  <path d="M ${center - radius * 0.3} ${center + radius * 0.5} L ${center - radius * 0.6} ${center + radius * 0.5} L ${center - radius * 0.45} ${center + radius * 0.3} M ${center - radius * 0.6} ${center + radius * 0.5} L ${center - radius * 0.45} ${center + radius * 0.7}"
        fill="none" stroke="white" stroke-width="${strokeWidth * 0.7}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
};

const sizes = [16, 48, 128];

async function generateIcons() {
  console.log('Generating icons...');

  for (const size of sizes) {
    const svg = createSvg(size);
    const outputPath = join(iconsDir, `icon-${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`Generated: icon-${size}.png`);
  }

  // Also generate a larger version for README
  const readmeSvg = createSvg(256);
  await sharp(Buffer.from(readmeSvg))
    .png()
    .toFile(join(iconsDir, 'icon-256.png'));
  console.log('Generated: icon-256.png (for README)');

  console.log('Done!');
}

generateIcons().catch(console.error);
