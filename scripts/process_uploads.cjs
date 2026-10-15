const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

async function processUploads() {
  const files = fs.readdirSync(uploadsDir);
  const imageFiles = files.filter(f => (f.endsWith('.jpg') || f.endsWith('.png')) && !f.includes('-thumb') && !f.includes('-450'));
  console.log(`Found ${imageFiles.length} source images in ${uploadsDir}`);

  for (const file of imageFiles) {
    const ext = path.extname(file);
    const base = path.basename(file, ext);
    const inputPath = path.join(uploadsDir, file);

    try {
      const meta = await sharp(inputPath).metadata();
      const w = meta.width || 800;
      const h = meta.height || 800;
      const masterW = Math.min(800, w);
      const masterH = Math.round((masterW / w) * h);
      const smallW = Math.min(450, w);
      const smallH = Math.round((smallW / w) * h);
      const retinaThumbW = Math.min(600, w);
      const retinaThumbH = Math.round((retinaThumbW / w) * h);

      // 1. Master WebP (800w max, 2x Retina)
      const masterWebp = path.join(uploadsDir, `${base}.webp`);
      await sharp(inputPath)
        .resize(masterW, masterH, { kernel: sharp.kernel.lanczos3, fit: 'inside' })
        .webp({ quality: 80, effort: 6 })
        .toFile(masterWebp);

      // 2. Responsive -450.webp
      const smallWebp = path.join(uploadsDir, `${base}-450.webp`);
      await sharp(inputPath)
        .resize(smallW, smallH, { kernel: sharp.kernel.lanczos3, fit: 'inside' })
        .webp({ quality: 78, effort: 6 })
        .toFile(smallWebp);

      // 3. Retina Thumb -thumb.webp
      const thumbWebp = path.join(uploadsDir, `${base}-thumb.webp`);
      await sharp(inputPath)
        .resize(retinaThumbW, retinaThumbH, { kernel: sharp.kernel.lanczos3, fit: 'inside' })
        .webp({ quality: 80, effort: 6 })
        .toFile(thumbWebp);

      console.log(`[OK] ${base}: Master=${(fs.statSync(masterWebp).size/1024).toFixed(1)}KB, 450w=${(fs.statSync(smallWebp).size/1024).toFixed(1)}KB, Thumb=${(fs.statSync(thumbWebp).size/1024).toFixed(1)}KB`);
    } catch (err) {
      console.warn(`[WARN] Skipping ${file}: ${err.message}`);
    }
  }

  console.log('Finished processing uploads directory!');
}

processUploads().catch(console.error);
