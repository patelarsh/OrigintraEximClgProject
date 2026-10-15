const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(process.cwd(), 'public', 'assets', 'products');

async function processAll() {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));
  console.log(`Processing ${files.length} JPG images in ${dir}...`);

  for (const file of files) {
    const base = path.basename(file, '.jpg');
    const inputPath = path.join(dir, file);
    const meta = await sharp(inputPath).metadata();

    const w = meta.width || 900;
    const h = meta.height || 1125;
    const masterW = Math.min(800, w);
    const masterH = Math.round((masterW / w) * h);
    const smallW = Math.round(masterW / 2);
    const smallH = Math.round(masterH / 2);
    const retinaThumbW = Math.min(600, masterW);
    const retinaThumbH = Math.round((retinaThumbW / masterW) * masterH);

    // 1. High-res Master WebP (800w max, 2x Retina)
    const masterWebpPath = path.join(dir, `${base}.webp`);
    await sharp(inputPath)
      .resize(masterW, masterH, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
      .webp({ quality: 80, effort: 6 })
      .toFile(masterWebpPath);

    // 2. Responsive 400w WebP (e.g. 400x500)
    const smallWebpPath = path.join(dir, `${base}-450.webp`);
    await sharp(inputPath)
      .resize(smallW, smallH, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
      .webp({ quality: 78, effort: 6 })
      .toFile(smallWebpPath);

    // 3. Crisp Retina Thumb WebP (e.g. 600x750) if thumb existed or if flagship
    const thumbPath = path.join(dir, `${base}-thumb.webp`);
    if (fs.existsSync(thumbPath) || ['whole-red-chili', 'turmeric', 'cumin-seeds'].includes(base)) {
      await sharp(inputPath)
        .resize(retinaThumbW, retinaThumbH, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
        .webp({ quality: 80, effort: 6 })
        .toFile(thumbPath);
      console.log(`[OK] ${base}: Master=${(fs.statSync(masterWebpPath).size/1024).toFixed(1)}KB, 450w=${(fs.statSync(smallWebpPath).size/1024).toFixed(1)}KB, Thumb=${(fs.statSync(thumbPath).size/1024).toFixed(1)}KB`);
    } else {
      console.log(`[OK] ${base}: Master=${(fs.statSync(masterWebpPath).size/1024).toFixed(1)}KB, 450w=${(fs.statSync(smallWebpPath).size/1024).toFixed(1)}KB`);
    }
  }

  console.log('All product images processed successfully!');
}

processAll().catch(err => {
  console.error('Error generating product images:', err);
  process.exit(1);
});
