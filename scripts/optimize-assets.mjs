import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ASSETS_DIR = path.resolve('public/assets');

async function getAllFiles(dir) {
  let results = [];
  const list = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const dirent of list) {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      results = results.concat(await getAllFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

async function optimize() {
  console.log('--- Starting Comprehensive Image Optimization ---');
  const allFiles = await getAllFiles(ASSETS_DIR);
  let totalSavedBytes = 0;
  let processedCount = 0;

  for (const filePath of allFiles) {
    const ext = path.extname(filePath).toLowerCase();
    const relPath = path.relative(ASSETS_DIR, filePath).replace(/\\/g, '/');
    const filename = path.basename(filePath);

    // Optimize Dotted World Map SVG to high-efficiency WebP & PNG
    if (filename === 'dotted-world-map.svg') {
      try {
        const originalStat = await fs.promises.stat(filePath);
        const webpPath = filePath.replace(/\.svg$/, '.webp');
        const pngPath = filePath.replace(/\.svg$/, '.png');

        await sharp(filePath)
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 80, effort: 6 })
          .toFile(webpPath);

        await sharp(filePath)
          .resize({ width: 1600, withoutEnlargement: true })
          .png({ compressionLevel: 9, quality: 80 })
          .toFile(pngPath);

        const newStat = await fs.promises.stat(webpPath);
        console.log(`[SVG->WebP] ${relPath}: ${(originalStat.size / 1024).toFixed(1)} KB -> ${(newStat.size / 1024).toFixed(1)} KB`);
        totalSavedBytes += (originalStat.size - newStat.size);
      } catch (err) {
        console.error(`Error converting ${relPath}:`, err.message);
      }
      continue;
    }

    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      continue;
    }

    try {
      const originalStat = await fs.promises.stat(filePath);
      const originalSize = originalStat.size;

      // Determine ideal sizing based on asset role
      let maxWidth = 1600;
      let quality = 80;

      if (relPath.includes('hero/hero-mobile-')) {
        maxWidth = 750;
        quality = 78;
      } else if (relPath.includes('hero/')) {
        maxWidth = 1600;
        quality = 80;
      } else if (relPath.includes('logo/')) {
        maxWidth = 512;
        quality = 85;
      } else if (relPath.includes('team/')) {
        maxWidth = 480;
        quality = 78;
      } else if (relPath.includes('about/')) {
        maxWidth = 1200;
        quality = 80;
      } else if (relPath.includes('products/')) {
        maxWidth = 900;
        quality = 80;
      } else {
        maxWidth = 1200;
        quality = 80;
      }

      // Read buffer first so we can overwrite original safely
      const inputBuffer = await fs.promises.readFile(filePath);
      const image = sharp(inputBuffer);
      const metadata = await image.metadata();

      // Create WebP counterpart
      const webpPath = filePath.replace(/\.(jpe?g|png)$/i, '.webp');
      const webpBuffer = await sharp(inputBuffer)
        .resize({ width: maxWidth, withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toBuffer();
      await fs.promises.writeFile(webpPath, webpBuffer);

      // Also optimize original format in-place
      let optimizedOriginalBuffer;
      if (ext === '.png') {
        optimizedOriginalBuffer = await sharp(inputBuffer)
          .resize({ width: maxWidth, withoutEnlargement: true })
          .png({ compressionLevel: 9, quality, palette: true })
          .toBuffer();
      } else {
        optimizedOriginalBuffer = await sharp(inputBuffer)
          .resize({ width: maxWidth, withoutEnlargement: true })
          .jpeg({ quality, mozjpeg: true, progressive: true })
          .toBuffer();
      }

      // If optimized original is smaller, replace it
      if (optimizedOriginalBuffer.length < originalSize) {
        await fs.promises.writeFile(filePath, optimizedOriginalBuffer);
        const saved = originalSize - optimizedOriginalBuffer.length;
        totalSavedBytes += saved;
        console.log(`[Optimized] ${relPath}: ${(originalSize / 1024).toFixed(1)} KB -> ${(optimizedOriginalBuffer.length / 1024).toFixed(1)} KB (WebP: ${(webpBuffer.length / 1024).toFixed(1)} KB)`);
      } else {
        console.log(`[WebP Created] ${relPath}: WebP is ${(webpBuffer.length / 1024).toFixed(1)} KB (orig was ${(originalSize / 1024).toFixed(1)} KB)`);
      }
      processedCount++;
    } catch (err) {
      console.error(`Failed to process ${relPath}:`, err.message);
    }
  }

  console.log('----------------------------------------------------');
  console.log(`Successfully processed ${processedCount} images.`);
  console.log(`Total storage savings: ${(totalSavedBytes / (1024 * 1024)).toFixed(2)} MB!`);
}

optimize();
