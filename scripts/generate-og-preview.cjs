const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateOGPreview() {
  const bgPath = path.join(__dirname, '../public/assets/hero/spices-hero-banner.jpg');
  const logoPath = path.join(__dirname, '../public/assets/logo/origintra-official-white.png');
  const outDir = path.join(__dirname, '../public/assets/og');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Base 1200x630 background
  const bg = await sharp(bgPath)
    .resize(1200, 630, { fit: 'cover', position: 'right' })
    .toBuffer();

  // 2. High-end dark navy gradient + typography overlay (SVG)
  const svgOverlay = Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="darkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#051329" stop-opacity="0.97" />
          <stop offset="42%" stop-color="#071B38" stop-opacity="0.93" />
          <stop offset="68%" stop-color="#0A234A" stop-opacity="0.65" />
          <stop offset="100%" stop-color="#0A234A" stop-opacity="0.25" />
        </linearGradient>
      </defs>

      <!-- Gradient Backdrop -->
      <rect width="1200" height="630" fill="url(#darkGrad)" />

      <!-- Top Category Pill -->
      <g transform="translate(60, 52)">
        <rect width="360" height="30" rx="15" fill="rgba(0, 112, 224, 0.25)" stroke="#0070E0" stroke-width="1.2" />
        <circle cx="16" cy="15" r="4" fill="#38BDF8" />
        <text x="30" y="20" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#38BDF8" letter-spacing="1.5">GLOBAL SPICE EXPORT HOUSE</text>
      </g>

      <!-- Headline & Tagline -->
      <text x="60" y="285" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">Leading Spices Exporter in India</text>
      <text x="60" y="330" font-family="'DM Sans', system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" fill="#94A3B8">Connecting Global Markets • Certified Farmgate Procurement • Reliable FCL Shipping</text>

      <!-- Key Capabilities Badges -->
      <g transform="translate(60, 375)">
        <rect width="210" height="42" rx="12" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.16)" />
        <text x="20" y="26" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" fill="#F8FAFC">Whole &amp; Ground Spices</text>
      </g>

      <g transform="translate(285, 375)">
        <rect width="190" height="42" rx="12" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.16)" />
        <text x="20" y="26" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" fill="#F8FAFC">Sortex 99.5% Seeds</text>
      </g>

      <g transform="translate(490, 375)">
        <rect width="195" height="42" rx="12" fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.16)" />
        <text x="20" y="26" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" fill="#F8FAFC">FCL Container Cargo</text>
      </g>

      <!-- Regulatory Compliance Strip -->
      <g transform="translate(60, 445)">
        <rect width="625" height="52" rx="14" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(56, 189, 248, 0.35)" />
        <text x="22" y="32" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="800" fill="#38BDF8" letter-spacing="1">CERTIFIED &amp; COMPLIANT:</text>
        <text x="200" y="32" font-family="'DM Sans', sans-serif" font-size="14" font-weight="600" fill="#FFFFFF">Spices Board of India • APEDA • FSSAI Registered</text>
      </g>

      <!-- Bottom Verified Domain -->
      <text x="60" y="565" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700" fill="#38BDF8">www.origintra.com</text>
      <text x="270" y="565" font-family="'DM Sans', sans-serif" font-size="15" font-weight="500" fill="#64748B">| Direct Maritime Exports from Mundra &amp; JNPT Ports</text>
    </svg>
  `);

  // 3. Official white logo resized to 380px wide
  const logo = await sharp(logoPath)
    .resize(380)
    .toBuffer();

  const finalJpg = await sharp(bg)
    .composite([
      { input: svgOverlay, top: 0, left: 0 },
      { input: logo, top: 110, left: 60 }
    ])
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();

  const finalWebp = await sharp(bg)
    .composite([
      { input: svgOverlay, top: 0, left: 0 },
      { input: logo, top: 110, left: 60 }
    ])
    .webp({ quality: 90 })
    .toBuffer();

  fs.writeFileSync(path.join(outDir, 'origintra-preview.jpg'), finalJpg);
  fs.writeFileSync(path.join(outDir, 'origintra-preview.webp'), finalWebp);

  console.log('Successfully generated 1200x630 origintra-preview.jpg and .webp!');
}

generateOGPreview().catch(err => {
  console.error('Error generating preview image:', err);
  process.exit(1);
});
