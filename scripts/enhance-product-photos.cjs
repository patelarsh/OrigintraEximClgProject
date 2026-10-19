const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PRODUCTS_DIR = path.join(process.cwd(), 'public', 'assets', 'products');

// Mapping of canonical product IDs to pristine Google Drive uncompressed files
const DRIVE_MASTER_MAP = {
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

const BLEND_PRODUCTS = [
  'garam-masala',
  'sambar-masala',
  'rasam-powder',
  'biryani-masala',
  'tandoori-masala',
  'curry-powder',
  'chaat-masala',
  'moringa',
  'custom-sourcing'
];

async function enhanceAll() {
  console.log('=== Enhancing All 26 Product Photographs to Ultra High Definition ===');

  let processedCount = 0;

  // 1. Process Google Drive Master Photography (19 core export commodities)
  for (const [id, srcRelative] of Object.entries(DRIVE_MASTER_MAP)) {
    const srcPath = path.join(process.cwd(), srcRelative);
    if (!fs.existsSync(srcPath)) {
      console.warn(`[WARN] Source file missing for ${id}: ${srcPath}`);
      continue;
    }

    const inputBuffer = fs.readFileSync(srcPath);
    const meta = await sharp(inputBuffer).metadata();
    const origW = meta.width || 1122;
    const origH = meta.height || 1402;

    // Master High Definition WebP (full studio resolution 1122x1402)
    const masterWebpPath = path.join(PRODUCTS_DIR, `${id}.webp`);
    await sharp(inputBuffer)
      .resize(origW, origH, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
      .sharpen({ sigma: 0.8, m1: 0.5, m2: 1.5 })
      .webp({ quality: 88, effort: 6, smartSubsample: true })
      .toFile(masterWebpPath);

    // Master High Definition JPEG (full studio resolution 1122x1402, mozjpeg progressive)
    const masterJpgPath = path.join(PRODUCTS_DIR, `${id}.jpg`);
    await sharp(inputBuffer)
      .resize(origW, origH, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
      .sharpen({ sigma: 0.8, m1: 0.5, m2: 1.5 })
      .jpeg({ quality: 90, mozjpeg: true, progressive: true })
      .toFile(masterJpgPath);

    // Crisp Mobile Responsive WebP (600w - 2x/3x Retina resolution for mobile screens)
    const mobileW = 600;
    const mobileH = Math.round((mobileW / origW) * origH);
    const smallWebpPath = path.join(PRODUCTS_DIR, `${id}-450.webp`);
    await sharp(inputBuffer)
      .resize(mobileW, mobileH, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
      .sharpen({ sigma: 0.6, m1: 0.4, m2: 1.2 })
      .webp({ quality: 86, effort: 6, smartSubsample: true })
      .toFile(smallWebpPath);

    // Crisp Retina Thumbnail
    const thumbPath = path.join(PRODUCTS_DIR, `${id}-thumb.webp`);
    await sharp(inputBuffer)
      .resize(mobileW, mobileH, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
      .sharpen({ sigma: 0.6, m1: 0.4, m2: 1.2 })
      .webp({ quality: 86, effort: 6, smartSubsample: true })
      .toFile(thumbPath);

    const jpgKb = (fs.statSync(masterJpgPath).size / 1024).toFixed(1);
    const webpKb = (fs.statSync(masterWebpPath).size / 1024).toFixed(1);
    const mobileKb = (fs.statSync(smallWebpPath).size / 1024).toFixed(1);
    console.log(`[HQ Drive] ${id}: Master=${origW}x${origH} (WebP: ${webpKb}KB, JPG: ${jpgKb}KB) | Mobile 600w: ${mobileKb}KB`);
    processedCount++;
  }

  // 2. Process Masala Blends & Specialty Products (from existing high-res masters)
  for (const id of BLEND_PRODUCTS) {
    const jpgMaster = path.join(PRODUCTS_DIR, `${id}.jpg`);
    if (!fs.existsSync(jpgMaster)) continue;

    const inputBuffer = fs.readFileSync(jpgMaster);
    const meta = await sharp(inputBuffer).metadata();
    const origW = meta.width || 900;
    const origH = meta.height || 1125;

    // Enhance Master WebP
    const masterWebpPath = path.join(PRODUCTS_DIR, `${id}.webp`);
    await sharp(inputBuffer)
      .resize(origW, origH, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
      .sharpen({ sigma: 0.8, m1: 0.5, m2: 1.5 })
      .webp({ quality: 88, effort: 6, smartSubsample: true })
      .toFile(masterWebpPath);

    // Enhance Mobile Responsive WebP
    const mobileW = 600;
    const mobileH = Math.round((mobileW / origW) * origH);
    const smallWebpPath = path.join(PRODUCTS_DIR, `${id}-450.webp`);
    await sharp(inputBuffer)
      .resize(mobileW, mobileH, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
      .sharpen({ sigma: 0.6, m1: 0.4, m2: 1.2 })
      .webp({ quality: 86, effort: 6, smartSubsample: true })
      .toFile(smallWebpPath);

    // Retina Thumbnail
    const thumbPath = path.join(PRODUCTS_DIR, `${id}-thumb.webp`);
    await sharp(inputBuffer)
      .resize(mobileW, mobileH, { kernel: sharp.kernel.lanczos3, fit: 'cover' })
      .sharpen({ sigma: 0.6, m1: 0.4, m2: 1.2 })
      .webp({ quality: 86, effort: 6, smartSubsample: true })
      .toFile(thumbPath);

    const webpKb = (fs.statSync(masterWebpPath).size / 1024).toFixed(1);
    const mobileKb = (fs.statSync(smallWebpPath).size / 1024).toFixed(1);
    console.log(`[HQ Blend] ${id}: Master=${origW}x${origH} (WebP: ${webpKb}KB) | Mobile 600w: ${mobileKb}KB`);
    processedCount++;
  }

  console.log(`\nSuccessfully enhanced ${processedCount} product image sets to Ultra High Definition!`);
}

enhanceAll().catch(err => {
  console.error('Enhancement error:', err);
  process.exit(1);
});
