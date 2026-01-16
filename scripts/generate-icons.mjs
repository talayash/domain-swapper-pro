import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>

  <!-- Background rounded square -->
  <rect x="4" y="4" width="120" height="120" rx="24" fill="url(#bg)"/>

  <!-- Swap arrows -->
  <g fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <!-- Top arrow (right pointing) -->
    <path d="M 32 44 L 80 44"/>
    <path d="M 68 32 L 80 44 L 68 56"/>

    <!-- Bottom arrow (left pointing) -->
    <path d="M 96 84 L 48 84"/>
    <path d="M 60 72 L 48 84 L 60 96"/>
  </g>

  <!-- Domain dots -->
  <circle cx="28" cy="84" r="6" fill="#ffffff" opacity="0.9"/>
  <circle cx="100" cy="44" r="6" fill="#ffffff" opacity="0.9"/>
</svg>`;

const sizes = [16, 48, 128];

async function generateIcons() {
  const publicIconsDir = join(rootDir, 'public', 'icons');

  // Create directory
  await mkdir(publicIconsDir, { recursive: true });

  // Generate each size
  for (const size of sizes) {
    const outputPath = join(publicIconsDir, `icon-${size}.png`);

    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✓ Created icon-${size}.png`);
  }

  console.log('\n✨ All icons generated successfully!');
  console.log('   Location: public/icons/');
}

generateIcons().catch(console.error);
