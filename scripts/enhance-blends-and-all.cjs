const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');

const PRODUCTS_DIR = path.join(process.cwd(), 'public', 'assets', 'products');

// Mapping of canonical product IDs to pristine Google Drive uncompressed files
const DRIVE_MASTER_MAP = {
  // Blends & Seasonings (Direct Google Drive Master Photography 1122x1402)
  'garam-masala': 'downloaded_spices/Blends & Seasonings/Garam Masala.png',
  'biryani-masala': 'downloaded_spices/Blends & Seasonings/Biryani Masala.png',
  'chaat-masala': 'downloaded_spices/Blends & Seasonings/Chaat Masala.png',
  'curry-powder': 'downloaded_spices/Blends & Seasonings/Curry Powder.png',
  'tandoori-masala': 'downloaded_spices/Blends & Seasonings/Tandoori Masala.png',

  // Ground Spices
  'asafoetida': 'downloaded_spices/Ground Spices/Asafoetida (Hing).png',
  'black-pepper-powder': 'downloaded_spices/Ground Spices/Black Pepper Powder',
  'coriander-powder': 'downloaded_spices/Ground Spices/Coriander Powder.png',
  'cumin-powder': 'downloaded_spices/Ground Spices/Cumin Powder.png',
  'red-chili-powder': 'downloaded_spices/Ground Spices/Red Chilli Powder.png',
  'red-chilli-powder': 'downloaded_spices/Ground Spices/Red Chilli Powder.png',
  'red_chilli_powder': 'downloaded_spices/Ground Spices/Red Chilli Powder.png',
  'turmeric': 'downloaded_spices/Ground Spices/Turmeric Powder.png',
  'turmeric-powder': 'downloaded_spices/Ground Spices/Turmeric Powder.png',

  // Seeds
  'coriander-seeds': 'downloaded_spices/Seeds/Coriander Seeds',
  'coriander': 'downloaded_spices/Seeds/Coriander Seeds',
  'coriander_seeds': 'downloaded_spices/Seeds/Coriander Seeds',
  'cumin-seeds': 'downloaded_spices/Seeds/Cumin Seeds.png',
  'cumin': 'downloaded_spices/Seeds/Cumin Seeds.png',
  'cumin_seeds': 'downloaded_spices/Seeds/Cumin Seeds.png',
  'fennel': 'downloaded_spices/Seeds/Fennel Seeds.png',
  'fennel-seeds': 'downloaded_spices/Seeds/Fennel Seeds.png',
  'fennel_seeds': 'downloaded_spices/Seeds/Fennel Seeds.png',
  'fenugreek-seeds': 'downloaded_spices/Seeds/Fenugreek Seeds',
  'fenugreek_seeds': 'downloaded_spices/Seeds/Fenugreek Seeds',

  // Whole Spices
  'bay-leaf': 'downloaded_spices/Whole Spices/Bay Leaf (Tej Patta).png',
  'bay_leaf': 'downloaded_spices/Whole Spices/Bay Leaf (Tej Patta).png',
  'black-pepper': 'downloaded_spices/Whole Spices/Black Pepper.png',
  'black_pepper': 'downloaded_spices/Whole Spices/Black Pepper.png',
  'cinnamon': 'downloaded_spices/Whole Spices/Cinnamon',
  'clove': 'downloaded_spices/Whole Spices/Cloves',
  'cloves': 'downloaded_spices/Whole Spices/Cloves',
  'dry-ginger': 'downloaded_spices/Whole Spices/Dry Ginger.png',
  'dry_ginger': 'downloaded_spices/Whole Spices/Dry Ginger.png',
  'ginger': 'downloaded_spices/Whole Spices/Dry Ginger.png',
  'green-cardamom': 'downloaded_spices/Whole Spices/Green Cardamom.png',
  'green_cardamom': 'downloaded_spices/Whole Spices/Green Cardamom.png',
  'cardamom': 'downloaded_spices/Whole Spices/Green Cardamom.png',
  'star-anise': 'downloaded_spices/Whole Spices/Star Anise',
  'star_anise': 'downloaded_spices/Whole Spices/Star Anise',
  'whole-red-chili': 'downloaded_spices/Whole Spices/Whole Red Chillies.png',
  'whole-red-chillies': 'downloaded_spices/Whole Spices/Whole Red Chillies.png',
  'red-chilli': 'downloaded_spices/Whole Spices/Whole Red Chillies.png',
  'red-chili': 'downloaded_spices/Whole Spices/Whole Red Chillies.png',
  'whole-turmeric': 'downloaded_spices/Whole Spices/Whole Turmeric.png',
  'whole_turmeric': 'downloaded_spices/Whole Spices/Whole Turmeric.png'
};

const EXTRA_BLENDS = ['sambar-masala', 'rasam-powder'];

async function processImageBuffer(inputBuffer, id, targetW = 1122, targetH = 1402) {
  // 1. Master High Definition WebP (full studio resolution 1122x1402)
  const masterWebpPath = path.join(PRODUCTS_DIR, `${id}.webp`);
  await sharp(inputBuffer)
    .resize(targetW, targetH, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
    .sharpen({ sigma: 0.85, m1: 0.5, m2: 1.5 })
    .webp({ quality: 90, effort: 6, smartSubsample: true })
    .toFile(masterWebpPath);

  // 2. Master High Definition JPEG (full studio resolution 1122x1402, mozjpeg progressive)
  const masterJpgPath = path.join(PRODUCTS_DIR, `${id}.jpg`);
  await sharp(inputBuffer)
    .resize(targetW, targetH, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
    .sharpen({ sigma: 0.85, m1: 0.5, m2: 1.5 })
    .jpeg({ quality: 92, mozjpeg: true, progressive: true })
    .toFile(masterJpgPath);

  // 3. Crisp Mobile Responsive WebP (600w - 2x/3x Retina resolution for mobile screens)
  const mobileW = 600;
  const mobileH = Math.round((mobileW / targetW) * targetH);
  const smallWebpPath = path.join(PRODUCTS_DIR, `${id}-450.webp`);
  await sharp(inputBuffer)
    .resize(mobileW, mobileH, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
    .sharpen({ sigma: 0.65, m1: 0.4, m2: 1.2 })
    .webp({ quality: 88, effort: 6, smartSubsample: true })
    .toFile(smallWebpPath);

  // 4. Crisp Retina Thumbnail
  const thumbPath = path.join(PRODUCTS_DIR, `${id}-thumb.webp`);
  await sharp(inputBuffer)
    .resize(mobileW, mobileH, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
    .sharpen({ sigma: 0.65, m1: 0.4, m2: 1.2 })
    .webp({ quality: 88, effort: 6, smartSubsample: true })
    .toFile(thumbPath);

  const jpgKb = (fs.statSync(masterJpgPath).size / 1024).toFixed(1);
  const webpKb = (fs.statSync(masterWebpPath).size / 1024).toFixed(1);
  const mobileKb = (fs.statSync(smallWebpPath).size / 1024).toFixed(1);
  console.log(`[Enhanced] ${id}: Master=${targetW}x${targetH} (WebP: ${webpKb}KB, JPG: ${jpgKb}KB) | Mobile 600w: ${mobileKb}KB`);
}

async function enhanceAll() {
  console.log('=== Enhancing All Products & Blends to Ultra High Definition (1122x1402) ===\n');

  let processedCount = 0;

  // 1. Process Google Drive Masters (including the 5 new Google Drive Blends)
  for (const [id, srcRelative] of Object.entries(DRIVE_MASTER_MAP)) {
    const srcPath = path.join(process.cwd(), srcRelative);
    if (!fs.existsSync(srcPath)) {
      console.warn(`[WARN] Source file missing for ${id}: ${srcPath}`);
      continue;
    }

    const inputBuffer = fs.readFileSync(srcPath);
    await processImageBuffer(inputBuffer, id, 1122, 1402);
    processedCount++;
  }

  // 2. Process Sambar Masala and Rasam Powder from initial commit masters
  for (const id of EXTRA_BLENDS) {
    let inputBuffer;
    try {
      inputBuffer = execSync(`git show b750323a:public/assets/products/${id}.jpg`, { maxBuffer: 15 * 1024 * 1024 });
      console.log(`[Extracted from git master] ${id} (${inputBuffer.length} bytes)`);
    } catch {
      const fallbackPath = path.join(PRODUCTS_DIR, `${id}.jpg`);
      inputBuffer = fs.readFileSync(fallbackPath);
    }

    await processImageBuffer(inputBuffer, id, 1122, 1402);
    processedCount++;
  }

  // 3. Specialty items (moringa, custom-sourcing)
  for (const id of ['moringa', 'custom-sourcing']) {
    const jpgMaster = path.join(PRODUCTS_DIR, `${id}.jpg`);
    if (!fs.existsSync(jpgMaster)) continue;

    const inputBuffer = fs.readFileSync(jpgMaster);
    const meta = await sharp(inputBuffer).metadata();
    const origW = meta.width || 800;
    const origH = meta.height || 600;

    await processImageBuffer(inputBuffer, id, origW, origH);
    processedCount++;
  }

  console.log(`\nSuccessfully enhanced ${processedCount} product image sets to Ultra High Definition!`);
}

enhanceAll().catch(err => {
  console.error('Enhancement error:', err);
  process.exit(1);
});
