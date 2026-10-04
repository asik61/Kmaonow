const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgPath = path.join(__dirname, '../public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  console.log('Generating Ultra-Premium Full-Bleed PWA Icons from SVG...');

  // 1. 192x192 standard icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, '../public/pwa-192x192.png'));
  console.log('✓ Created pwa-192x192.png');

  // 2. 512x512 standard icon (Full Bleed)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '../public/pwa-512x512.png'));
  console.log('✓ Created pwa-512x512.png');

  // 3. Apple Touch Icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
  console.log('✓ Created apple-touch-icon.png');

  // 4. Android Maskable 512x512 (Full Bleed, beautiful adaptive fit)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '../public/pwa-maskable-512x512.png'));
  console.log('✓ Created pwa-maskable-512x512.png');

  console.log('All PWA icons generated with master quality!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
