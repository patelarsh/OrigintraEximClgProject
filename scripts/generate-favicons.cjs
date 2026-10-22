const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  const src = 'C:/Users/Arsh/.gemini/antigravity/brain/33609ea4-7430-4827-aea8-d84fb0e3cca0/.user_uploaded/media_1792517022131_322f28a4.png';
  const pubDir = path.join(__dirname, '../public');

  // 1. Extract the ship circle emblem cleanly
  // In media_1792517022131_322f28a4.png, mark is on the left: X: 30 to 365, Y: 18 to 280
  const extractedBuf = await sharp(src)
    .extract({ left: 30, top: 15, width: 335, height: 265 })
    .toBuffer();

  const mark = await sharp(extractedBuf).trim().toBuffer();
  const markMeta = await sharp(mark).metadata();
  console.log('Trimmed emblem dimensions:', markMeta.width, 'x', markMeta.height);

  // 2. Create 512x512 square master with 90% coverage for bold high visibility
  const targetMarkSize = 460;
  const resizedMark = await sharp(mark)
    .resize(targetMarkSize, targetMarkSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const master512 = await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  }).composite([{ input: resizedMark, gravity: 'center' }]).png({ quality: 100, compressionLevel: 9 }).toBuffer();

  fs.writeFileSync(path.join(pubDir, 'favicon.png'), master512);

  // 3. Generate all PNG resolutions as 32-bit RGBA (no palette reduction)
  const sizes = [
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'favicon-144x144.png', size: 144 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-precomposed.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 }
  ];

  for (const s of sizes) {
    await sharp(master512)
      .resize(s.size, s.size)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(path.join(pubDir, s.name));
  }

  // 4. Multi-resolution ICO: 48x48, 32x32, 16x16
  const p48 = await sharp(master512).resize(48, 48).png().toBuffer();
  const p32 = await sharp(master512).resize(32, 32).png().toBuffer();
  const p16 = await sharp(master512).resize(16, 16).png().toBuffer();

  const icoImages = [
    { width: 48, height: 48, buf: p48 },
    { width: 32, height: 32, buf: p32 },
    { width: 16, height: 16, buf: p16 }
  ];

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(icoImages.length, 4);

  let currentOffset = 6 + icoImages.length * 16;
  const dirEntries = [];

  for (const img of icoImages) {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(img.width === 256 ? 0 : img.width, 0);
    dir.writeUInt8(img.height === 256 ? 0 : img.height, 1);
    dir.writeUInt8(0, 2);
    dir.writeUInt8(0, 3);
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(img.buf.length, 8);
    dir.writeUInt32LE(currentOffset, 12);
    dirEntries.push(dir);
    currentOffset += img.buf.length;
  }

  const icoBuf = Buffer.concat([header, ...dirEntries, ...icoImages.map(i => i.buf)]);
  fs.writeFileSync(path.join(pubDir, 'favicon.ico'), icoBuf);

  console.log('All high-contrast favicons and favicon.ico generated successfully!');
}

generateFavicons().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
