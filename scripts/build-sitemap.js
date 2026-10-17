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
const TODAY = '2026-10-13';

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Core Company & Commercial Portals -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${BASE_URL}/assets/hero/spices-hero-banner.jpg</image:loc>
      <image:title>Origintra Exim - Premier Indian Spices Exporter</image:title>
      <image:caption>Connecting India&apos;s finest spices to international markets</image:caption>
    </image:image>
  </url>
  <url>
    <loc>${BASE_URL}/about</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <image:image>
      <image:loc>${BASE_URL}/assets/about/spice-harvest-sourcing.jpg</image:loc>
      <image:title>Farmgate Spice Sourcing Across India</image:title>
    </image:image>
  </url>
  <url>
    <loc>${BASE_URL}/products</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>${BASE_URL}/quality</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${BASE_URL}/global-reach</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contact</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
  <url>
    <loc>${BASE_URL}/schedule-meeting</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>

  <!-- Commodity & Spice Product Specifications (27 Products) -->
`;

for (const match of productMatches) {
  const [, id, slug, name, image] = match;
  const rawImgUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  const imgUrl = escapeXml(rawImgUrl);
  const escapedName = escapeXml(name);
  xml += `  <url>
    <loc>${BASE_URL}/products/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
    <image:image>
      <image:loc>${imgUrl}</image:loc>
      <image:title>${escapedName} Exporter India - Origintra Exim</image:title>
      <image:caption>Export grade ${escapedName} from India with verified laboratory specifications</image:caption>
    </image:image>
  </url>\n`;
}

xml += `\n  <!-- Export Intelligence & Trade Insight Articles -->\n`;

for (const match of blogMatches) {
  const [, id, slug, title, image] = match;
  const rawImgUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  const imgUrl = escapeXml(rawImgUrl);
  const escapedTitle = escapeXml(title);
  xml += `  <url>
    <loc>${BASE_URL}/blog/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
    <image:image>
      <image:loc>${imgUrl}</image:loc>
      <image:title>${escapedTitle}</image:title>
    </image:image>
  </url>\n`;
}

xml += `
  <!-- Compliance & Commercial Trade Policies -->
  <url>
    <loc>${BASE_URL}/privacy-policy</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.40</priority>
  </url>
  <url>
    <loc>${BASE_URL}/terms-of-service</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.40</priority>
  </url>
  <url>
    <loc>${BASE_URL}/shipping-policy</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.50</priority>
  </url>
  <url>
    <loc>${BASE_URL}/cookie-policy</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.30</priority>
  </url>
</urlset>
`;

fs.writeFileSync('public/sitemap.xml', xml, 'utf8');
console.log('Successfully wrote public/sitemap.xml with XML-escaped entities!');
