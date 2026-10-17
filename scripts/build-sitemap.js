import fs from 'fs';
import path from 'path';

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Read products.ts
const productsContent = fs.readFileSync('src/data/products.ts', 'utf8');
const productMatches = [...productsContent.matchAll(/"id":\s*"([^"]+)",\s*"slug":\s*"([^"]+)",\s*"name":\s*"([^"]+)"[\s\S]*?"image":\s*"([^"]+)"/g)];

console.log(`Found ${productMatches.length} products`);

// Read blog.ts
const blogContent = fs.readFileSync('src/data/blog.ts', 'utf8');
const blogMatches = [...blogContent.matchAll(/id:\s*'([^']+)',\s*slug:\s*'([^']+)',\s*title:\s*'([^']+)'[\s\S]*?image:\s*'([^']+)'/g)];

console.log(`Found ${blogMatches.length} blog posts`);

const BASE_URL = 'https://www.origintra.com';
const TODAY = new Date().toISOString().split('T')[0];

const FLAGSHIP_SLUGS = new Set([
  'whole-red-chili',
  'turmeric',
  'green-cardamom',
  'black-pepper',
  'cumin-seeds',
  'coriander-seeds'
]);

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- ============================================================= -->
  <!-- 1. HOME PAGE - HIGHEST SEO PRIORITY (1.0) & PRIMARY DOMAIN GATEWAY -->
  <!-- ============================================================= -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${BASE_URL}/assets/hero/spices-hero-banner.webp</image:loc>
      <image:title>Origintra Exim - Premier Indian Spices Exporter</image:title>
      <image:caption>Connecting India&apos;s finest farmgate spices, seeds, and powders to global markets</image:caption>
    </image:image>
    <image:image>
      <image:loc>${BASE_URL}/assets/hero/banner-red-chilli.webp</image:loc>
      <image:title>Guntur S17 Dried Red Chilli Export</image:title>
      <image:caption>Premium stemless and stem-on red chillies with calibrated ASTA color and SHU heat</image:caption>
    </image:image>
    <image:image>
      <image:loc>${BASE_URL}/assets/hero/banner-cumin.webp</image:loc>
      <image:title>Sortex Cleaned Indian Cumin Seeds (Jeera)</image:title>
      <image:caption>99.5% Singapore/Europe machine cleaned cumin seeds with rich essential aroma</image:caption>
    </image:image>
    <image:image>
      <image:loc>${BASE_URL}/assets/hero/banner-turmeric.webp</image:loc>
      <image:title>Salem &amp; Nizamabad Pure Turmeric Fingers and Powder</image:title>
      <image:caption>High-curcumin polished turmeric fingers with certified low heavy metals and pesticide compliance</image:caption>
    </image:image>
    <image:image>
      <image:loc>${BASE_URL}/assets/hero/banner-coriander.webp</image:loc>
      <image:title>Indian Green Coriander Seeds (Dhania)</image:title>
      <image:caption>Whole export green coriander seeds sorted and packed in seaworthy PP bags</image:caption>
    </image:image>
    <image:image>
      <image:loc>${BASE_URL}/assets/hero/facility-hero.webp</image:loc>
      <image:title>Modern Spice Processing &amp; Sortex Facility</image:title>
      <image:caption>Sortex cleaning, grading, and container stuffing facility in Gujarat, India</image:caption>
    </image:image>
    <image:image>
      <image:loc>${BASE_URL}/assets/logo/logo-full-color.png</image:loc>
      <image:title>Origintra Exim Official Brand Logo</image:title>
      <image:caption>Origintra Exim - Indian Spices &amp; Agricultural Commodities Exporter</image:caption>
    </image:image>
  </url>

  <!-- ============================================================= -->
  <!-- 2. COMMERCIAL PRODUCTS CATALOG INDEX -->
  <!-- ============================================================= -->
  <url>
    <loc>${BASE_URL}/products</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.90</priority>
  </url>

  <!-- ============================================================= -->
  <!-- 3. CORE COMPANY & CREDENTIALS PORTALS -->
  <!-- ============================================================= -->
  <url>
    <loc>${BASE_URL}/about</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
    <image:image>
      <image:loc>${BASE_URL}/assets/hero/facility-hero.webp</image:loc>
      <image:title>Farmgate Spice Sourcing &amp; Processing Across India</image:title>
    </image:image>
  </url>
  <url>
    <loc>${BASE_URL}/quality</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>
  <url>
    <loc>${BASE_URL}/global-reach</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contact</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>
  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.80</priority>
  </url>
  <url>
    <loc>${BASE_URL}/schedule-meeting</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>

  <!-- ============================================================= -->
  <!-- 4. COMMODITY & SPICE PRODUCT SPECIFICATIONS (27 PRODUCTS) -->
  <!-- ============================================================= -->
`;

for (const match of productMatches) {
  const [, id, slug, name, image] = match;
  const rawImgUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  const imgUrl = escapeXml(rawImgUrl);
  const escapedName = escapeXml(name);
  const isFlagship = FLAGSHIP_SLUGS.has(slug);
  const priority = isFlagship ? '0.85' : '0.80';

  xml += `  <url>
    <loc>${BASE_URL}/products/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${imgUrl}</image:loc>
      <image:title>${escapedName} Exporter India - Origintra Exim</image:title>
      <image:caption>Export grade ${escapedName} from India with verified laboratory specifications</image:caption>
    </image:image>
  </url>\n`;
}

xml += `\n  <!-- ============================================================= -->
  <!-- 5. EXPORT INTELLIGENCE & TRADE INSIGHT ARTICLES -->
  <!-- ============================================================= -->\n`;

for (const match of blogMatches) {
  const [, id, slug, title, image] = match;
  const rawImgUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  const imgUrl = escapeXml(rawImgUrl);
  const escapedTitle = escapeXml(title);
  xml += `  <url>
    <loc>${BASE_URL}/blog/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.70</priority>
    <image:image>
      <image:loc>${imgUrl}</image:loc>
      <image:title>${escapedTitle}</image:title>
    </image:image>
  </url>\n`;
}

xml += `</urlset>
`;

fs.writeFileSync('public/sitemap.xml', xml, 'utf8');
console.log('Successfully generated public/sitemap.xml with home page highest priority (1.0) and rich display!');
