import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve('dist');
const BASE_URL = 'https://www.origintra.com';

if (!fs.existsSync(DIST_DIR)) {
  console.error('dist directory not found. Please run build first.');
  process.exit(1);
}

const template = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');

// Helper to escape HTML attributes
function esc(str) {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 1. Static Pages Definitions
const staticPages = [
  {
    path: 'about',
    title: 'About Origintra Exim | Leading Spices Exporter in India',
    description: 'Learn about Origintra Exim, India’s premier spices and agricultural commodities merchant exporter. Discover our direct farmgate sourcing, Spices Board registration, and export network across 24+ countries.',
    h1: 'About Origintra Exim',
    eyebrow: 'Corporate Profile • Global Agricultural Supply',
    body: `
      <section class="max-w-4xl mx-auto px-4 py-12">
        <h1 class="text-3xl sm:text-5xl font-extrabold text-[#00214a] mb-4">About Origintra Exim</h1>
        <p class="text-lg text-slate-700 leading-relaxed mb-6">
          Origintra Exim is a premier merchant exporter of Indian spices and agricultural commodities based in Gujarat, India. Registered with the Spices Board of India (CRES), APEDA, and FSSAI, we connect international food processors, wholesale importers, and private-label spice brands directly to authentic farmgate belts.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div class="border border-slate-200 rounded-xl p-6 bg-slate-50">
            <h3 class="font-bold text-lg text-[#00214a] mb-2">Farmgate Direct Sourcing</h3>
            <p class="text-sm text-slate-600">Direct procurement from contracted regional growers across Guntur, Salem, Nizamabad, Alleppey, and Gujarat mandi belts.</p>
          </div>
          <div class="border border-slate-200 rounded-xl p-6 bg-slate-50">
            <h3 class="font-bold text-lg text-[#00214a] mb-2">Quality & Lab Compliance</h3>
            <p class="text-sm text-slate-600">NABL accredited COA testing for pesticide residues (EU MRL), aflatoxins, heavy metals, and guaranteed zero artificial Sudan dyes.</p>
          </div>
          <div class="border border-slate-200 rounded-xl p-6 bg-slate-50">
            <h3 class="font-bold text-lg text-[#00214a] mb-2">Maritime Export Logistics</h3>
            <p class="text-sm text-slate-600">Containerized FCL & LCL maritime consignments routed efficiently through Mundra, Pipavav, and JNPT Nhava Sheva ports.</p>
          </div>
        </div>
      </section>
    `
  },
  {
    path: 'products',
    title: 'Indian Spices Export Catalog (27+ Products) | Origintra Exim',
    description: 'Explore Origintra Exim export catalog of 27+ premium Indian whole spices, sortex seeds, ground powders & curry blends. Direct farmgate supply with certified quality.',
    h1: 'Export Products Catalog',
    eyebrow: '27 Certified Indian Agricultural Commodities',
    body: `
      <section class="max-w-4xl mx-auto px-4 py-12">
        <h1 class="text-3xl sm:text-5xl font-extrabold text-[#00214a] mb-4">Indian Spices Export Catalog</h1>
        <p class="text-lg text-slate-700 leading-relaxed mb-6">
          Browse our complete commercial export portfolio of 27+ premium whole spices, sortex seeds, finely milled powders, and authentic curry blends available in FCL container quantities worldwide.
        </p>
      </section>
    `
  },
  {
    path: 'quality',
    title: 'Quality Assurance & Global Certifications | Origintra Exim',
    description: 'Enterprise quality control, NABL accredited pre-shipment COA inspection, EU MRL & US FDA compliance, Spices Board of India CRES, and APEDA licensing.',
    h1: 'Quality & Certifications',
    eyebrow: 'Laboratory Verified • Global Standards',
    body: `
      <section class="max-w-4xl mx-auto px-4 py-12">
        <h1 class="text-3xl sm:text-5xl font-extrabold text-[#00214a] mb-4">Quality & Certifications</h1>
        <p class="text-lg text-slate-700 leading-relaxed mb-6">
          Origintra Exim enforces strict quality assurance across every batch. Certified by Spices Board of India, APEDA, FSSAI, and DGFT IEC with pre-shipment SGS/Bureau Veritas inspection.
        </p>
      </section>
    `
  },
  {
    path: 'global-reach',
    title: 'Global Sea Ports & Freight Logistics | Origintra Exim',
    description: 'Maritime export routes, gateway ports (Mundra, JNPT Nhava Sheva, Cochin), and containerized freight operations serving importers in GCC, USA, Europe, and Asia.',
    h1: 'Global Reach & Freight Logistics',
    eyebrow: 'Worldwide Maritime Corridors',
    body: `
      <section class="max-w-4xl mx-auto px-4 py-12">
        <h1 class="text-3xl sm:text-5xl font-extrabold text-[#00214a] mb-4">Global Reach & Sea Ports</h1>
        <p class="text-lg text-slate-700 leading-relaxed mb-6">
          Direct containerized ocean freight from Mundra, JNPT, and Pipavav ports to 24+ countries worldwide with transparent FOB, CIF, and CFR trade terms.
        </p>
      </section>
    `
  },
  {
    path: 'contact',
    title: 'Contact Export Desk | Origintra Exim - B2B Inquiries',
    description: 'Connect directly with our senior international export desk for FOB / CIF container pricing, product specifications, and commercial sample shipments.',
    h1: 'Contact Export Desk',
    eyebrow: 'Fast 24-Hour B2B Quotations',
    body: `
      <section class="max-w-4xl mx-auto px-4 py-12">
        <h1 class="text-3xl sm:text-5xl font-extrabold text-[#00214a] mb-4">Contact Export Desk</h1>
        <p class="text-lg text-slate-700 leading-relaxed mb-6">
          Request official export price quotes, COA specifications, and container stuffing schedules.
        </p>
        <p class="text-base text-slate-800">Email: export@origintra.com | WhatsApp: +91 70691 82990</p>
      </section>
    `
  },
  {
    path: 'schedule-meeting',
    title: 'Schedule 30-Min Export Consultation | Origintra Exim',
    description: 'Book a direct 30-minute B2B consultation with Origintra Exim senior export desk to discuss FOB/CIF container pricing, crop availability, and statutory compliance.',
    h1: 'Schedule a Meeting',
    eyebrow: 'Direct Video Consultation',
    body: `
      <section class="max-w-4xl mx-auto px-4 py-12">
        <h1 class="text-3xl sm:text-5xl font-extrabold text-[#00214a] mb-4">Schedule 30-Min Consultation</h1>
        <p class="text-lg text-slate-700 leading-relaxed mb-6">
          Meet directly with our procurement and export leadership to discuss your annual spice contract.
        </p>
      </section>
    `
  },
  {
    path: 'blog',
    title: 'Indian Spice Export Insights & Trade Intelligence | Origintra Exim Blog',
    description: 'Commercial guides, market price analysis, crop harvest reports, and regulatory compliance updates for international spice importers and procurement managers.',
    h1: 'Export Insights Blog',
    eyebrow: 'Market Analysis & Industry Reports',
    body: `
      <section class="max-w-4xl mx-auto px-4 py-12">
        <h1 class="text-3xl sm:text-5xl font-extrabold text-[#00214a] mb-4">Indian Spice Export Insights</h1>
        <p class="text-lg text-slate-700 leading-relaxed mb-6">
          Authoritative intelligence, crop forecasts, and regulatory import guidance for international spice buyers.
        </p>
      </section>
    `
  },
  {
    path: 'privacy-policy',
    title: 'Privacy Policy | Origintra Exim',
    description: 'Commercial privacy policy and international export trade data protection standards for Origintra Exim.',
    h1: 'Privacy Policy',
    eyebrow: 'Data Governance',
    body: `<section class="max-w-4xl mx-auto px-4 py-12"><h1 class="text-3xl font-bold mb-4">Privacy Policy</h1><p>Origintra Exim data confidentiality and trade privacy standards.</p></section>`
  },
  {
    path: 'terms-of-service',
    title: 'Terms & Conditions | Origintra Exim',
    description: 'Commercial sales contract framework, Incoterms 2020 rules (FOB/CFR/CIF), and export terms of service for Origintra Exim.',
    h1: 'Terms & Conditions',
    eyebrow: 'Commercial Trade Terms',
    body: `<section class="max-w-4xl mx-auto px-4 py-12"><h1 class="text-3xl font-bold mb-4">Terms & Conditions</h1><p>International sales and contract terms under Incoterms 2020.</p></section>`
  },
  {
    path: 'shipping-policy',
    title: 'Shipping Policy | Origintra Exim',
    description: 'Commercial export shipping policy, Indian gateway ports (Mundra, Nhava Sheva, Cochin), container stuffing, and maritime documentation.',
    h1: 'Shipping Policy',
    eyebrow: 'Port Operations',
    body: `<section class="max-w-4xl mx-auto px-4 py-12"><h1 class="text-3xl font-bold mb-4">Shipping Policy</h1><p>Maritime export logistics and container stuffing standards.</p></section>`
  },
  {
    path: 'cookie-policy',
    title: 'Cookie Policy | Origintra Exim',
    description: 'Digital cookie policy, technical session preservation, and zero third-party tracking standards on the Origintra Exim export portal.',
    h1: 'Cookie Policy',
    eyebrow: 'Digital Compliance',
    body: `<section class="max-w-4xl mx-auto px-4 py-12"><h1 class="text-3xl font-bold mb-4">Cookie Policy</h1><p>Zero third-party marketing tracking; essential technical cookies only.</p></section>`
  }
];

// 2. Parse Products from products.ts
const productsContent = fs.readFileSync('src/data/products.ts', 'utf8');
const productBlocks = productsContent.split(/{\s*"id":\s*"/).slice(1);

const products = [];
for (const block of productBlocks) {
  const idMatch = block.match(/^([^"]+)"/);
  const slugMatch = block.match(/"slug":\s*"([^"]+)"/);
  const nameMatch = block.match(/"name":\s*"([^"]+)"/);
  const taglineMatch = block.match(/"tagline":\s*"([^"]+)"/);
  const shortDescMatch = block.match(/"shortDescription":\s*"([^"]+)"/);
  const imageMatch = block.match(/"image":\s*"([^"]+)"/);
  const originMatch = block.match(/"origin":\s*"([^"]+)"/);

  if (slugMatch && nameMatch) {
    products.push({
      id: idMatch ? idMatch[1] : slugMatch[1],
      slug: slugMatch[1],
      name: nameMatch[1],
      tagline: taglineMatch ? taglineMatch[1] : `${nameMatch[1]} Exporter in India`,
      shortDescription: shortDescMatch ? shortDescMatch[1] : `Export quality ${nameMatch[1]} from India with certified laboratory testing.`,
      image: imageMatch ? imageMatch[1] : '/assets/og/origintra-preview.jpg',
      origin: originMatch ? originMatch[1] : 'Gujarat, India'
    });
  }
}

console.log(`Loaded ${products.length} products for pre-rendering.`);

// 3. Parse Blog posts from blog.ts
const blogContent = fs.readFileSync('src/data/blog.ts', 'utf8');
const blogBlocks = blogContent.split(/{\s*id:\s*'/).slice(1);

const blogPosts = [];
for (const block of blogBlocks) {
  const slugMatch = block.match(/slug:\s*'([^']+)'/);
  const titleMatch = block.match(/title:\s*'([^']+)'/);
  const excerptMatch = block.match(/excerpt:\s*'([^']+)'/);
  const imageMatch = block.match(/image:\s*'([^']+)'/);
  const dateMatch = block.match(/date:\s*'([^']+)'/);

  if (slugMatch && titleMatch) {
    blogPosts.push({
      slug: slugMatch[1],
      title: titleMatch[1],
      excerpt: excerptMatch ? excerptMatch[1] : titleMatch[1],
      image: imageMatch ? imageMatch[1] : '/assets/og/origintra-preview.jpg',
      date: dateMatch ? dateMatch[1] : '2026-10-15'
    });
  }
}

console.log(`Loaded ${blogPosts.length} blog posts for pre-rendering.`);

// Helper to write an HTML page
function renderPage(routePath, pageData) {
  const fullUrl = `${BASE_URL}/${routePath}`;
  const outDir = path.join(DIST_DIR, routePath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  let html = template;

  // Replace Title
  html = html.replace(/<title>.*?<\/title>/, `<title>${esc(pageData.title)}</title>`);
  html = html.replace(/<meta name="title" content=".*?" \/>/, `<meta name="title" content="${esc(pageData.title)}" />`);

  // Replace Description
  html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${esc(pageData.description)}" />`);

  // Replace Canonical Link
  html = html.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${fullUrl}" />`);

  // Replace OG tags
  html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${esc(pageData.title)}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${esc(pageData.description)}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${fullUrl}" />`);
  if (pageData.image) {
    const fullImg = pageData.image.startsWith('http') ? pageData.image : `${BASE_URL}${pageData.image}`;
    html = html.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${fullImg}" />`);
  }

  // Replace Twitter tags
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${esc(pageData.title)}" />`);
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${esc(pageData.description)}" />`);
  html = html.replace(/<meta name="twitter:url" content=".*?" \/>/, `<meta name="twitter:url" content="${fullUrl}" />`);

  // Replace Dynamic Schema.org JSON-LD
  const schemaObj = pageData.schema || {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": fullUrl,
    "name": pageData.title,
    "description": pageData.description
  };
  const schemaScript = `\n    <script type="application/ld+json">\n    ${JSON.stringify(schemaObj, null, 2)}\n    </script>`;
  html = html.replace(/<\/head>/, `${schemaScript}\n  </head>`);

  // Inject semantic content into root
  if (pageData.bodyHtml) {
    // Replace the default pre-rendered homepage content inside #root
    const rootStart = html.indexOf('<div id="root">');
    const rootEnd = html.indexOf('</div>\n    <script type="module"');
    if (rootStart !== -1 && rootEnd !== -1) {
      const headerNav = `
        <header class="bg-[#00214a] text-white py-4 px-6 border-b border-white/10">
          <div class="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" class="font-bold text-xl text-white">Origintra Exim</a>
            <nav class="hidden md:flex space-x-6 text-sm font-medium">
              <a href="/products" class="hover:text-blue-300">Products</a>
              <a href="/about" class="hover:text-blue-300">About</a>
              <a href="/quality" class="hover:text-blue-300">Quality</a>
              <a href="/global-reach" class="hover:text-blue-300">Global Reach</a>
              <a href="/blog" class="hover:text-blue-300">Blog</a>
              <a href="/contact" class="hover:text-blue-300">Contact</a>
            </nav>
          </div>
        </header>
      `;

      const footer = `
        <footer class="bg-slate-900 text-slate-400 py-12 px-6 mt-16 border-t border-slate-800">
          <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
            <div>
              <p class="font-bold text-white mb-2">Origintra Exim</p>
              <p>Leading Spices Exporter in India. Containerized export orders worldwide.</p>
            </div>
            <div>
              <p class="font-bold text-white mb-2">Quick Links</p>
              <ul class="space-y-1">
                <li><a href="/products" class="hover:text-white">Products Catalog</a></li>
                <li><a href="/about" class="hover:text-white">About Us</a></li>
                <li><a href="/quality" class="hover:text-white">Certifications</a></li>
                <li><a href="/contact" class="hover:text-white">Contact Desk</a></li>
              </ul>
            </div>
            <div>
              <p class="font-bold text-white mb-2">Direct Contact</p>
              <p>Email: export@origintra.com</p>
              <p>WhatsApp: +91 70691 82990</p>
            </div>
            <div>
              <p class="font-bold text-white mb-2">Legal</p>
              <ul class="space-y-1">
                <li><a href="/privacy-policy" class="hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms-of-service" class="hover:text-white">Terms of Service</a></li>
                <li><a href="/sitemap.xml" class="hover:text-white">XML Sitemap</a></li>
              </ul>
            </div>
          </div>
        </footer>
      `;

      const newRootContent = `<div id="root">${headerNav}<main>${pageData.bodyHtml}</main>${footer}</div>`;
      html = html.substring(0, rootStart) + newRootContent + html.substring(rootEnd + 6);
    }
  }

  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
}

// Pre-render Static Pages
for (const page of staticPages) {
  renderPage(page.path, {
    title: page.title,
    description: page.description,
    bodyHtml: page.body,
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "url": `${BASE_URL}/${page.path}`,
      "name": page.title,
      "description": page.description,
      "isPartOf": { "@id": `${BASE_URL}/#website` }
    }
  });
}
console.log(`Pre-rendered ${staticPages.length} core static pages.`);

// Pre-render Products
for (const p of products) {
  const productTitle = `${p.name} Exporter in India | Origintra Exim`;
  const productDesc = `${p.tagline}. High purity machine-cleaned ${p.name} exported from India in FCL containers. Spices Board & APEDA certified. Get price quote.`;
  const productUrl = `${BASE_URL}/products/${p.slug}`;
  const fullImg = p.image.startsWith('http') ? p.image : `${BASE_URL}${p.image}`;

  const productHtml = `
    <article class="max-w-4xl mx-auto px-4 py-12">
      <nav class="text-xs text-slate-500 mb-4 flex items-center space-x-2">
        <a href="/" class="hover:underline">Home</a>
        <span>/</span>
        <a href="/products" class="hover:underline">Products</a>
        <span>/</span>
        <span class="text-slate-800 font-semibold">${p.name}</span>
      </nav>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <img src="${p.image}" alt="${p.name} Exporter in India" class="rounded-2xl shadow-lg w-full max-h-[380px] object-cover" />
        </div>
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-[#0070E0]">Direct Farmgate Export</span>
          <h1 class="text-3xl sm:text-4xl font-extrabold text-[#00214a] mt-2 mb-3">${p.name} Exporter in India</h1>
          <p class="text-slate-600 leading-relaxed mb-4">${p.shortDescription}</p>
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm text-slate-700">
            <div><strong class="text-[#00214a]">Origin:</strong> ${p.origin}</div>
            <div><strong class="text-[#00214a]">Quality:</strong> 100% Sortex Cleaned, European / Machine Grade</div>
            <div><strong class="text-[#00214a]">Certifications:</strong> Spices Board of India, APEDA, FSSAI</div>
            <div><strong class="text-[#00214a]">Container Shipping:</strong> 20ft & 40ft FCL Worldwide from Mundra / JNPT</div>
          </div>
          <div class="mt-6 flex gap-4">
            <a href="/contact" class="bg-[#0070E0] text-white px-6 py-3 rounded-full text-sm font-bold inline-block">Request Quote for ${p.name}</a>
          </div>
        </div>
      </div>
    </article>
  `;

  renderPage(`products/${p.slug}`, {
    title: productTitle,
    description: productDesc,
    image: p.image,
    bodyHtml: productHtml,
    schema: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": `${p.name} - Export Grade`,
      "image": fullImg,
      "description": productDesc,
      "brand": {
        "@type": "Brand",
        "name": "Origintra Exim"
      },
      "countryOfOrigin": "India",
      "offers": {
        "@type": "Offer",
        "url": productUrl,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "priceType": "https://schema.org/InvoicePrice",
          "unitText": "Metric Ton / Container"
        }
      }
    }
  });
}
console.log(`Pre-rendered ${products.length} product pages.`);

// Pre-render Blog Posts
for (const b of blogPosts) {
  const blogTitle = `${b.title} | Origintra Exim Blog`;
  const blogDesc = b.excerpt;
  const blogUrl = `${BASE_URL}/blog/${b.slug}`;
  const fullImg = b.image.startsWith('http') ? b.image : `${BASE_URL}${b.image}`;

  const blogHtml = `
    <article class="max-w-3xl mx-auto px-4 py-12">
      <nav class="text-xs text-slate-500 mb-4 flex items-center space-x-2">
        <a href="/" class="hover:underline">Home</a>
        <span>/</span>
        <a href="/blog" class="hover:underline">Blog</a>
        <span>/</span>
        <span class="text-slate-800 font-semibold">${b.title}</span>
      </nav>
      <h1 class="text-3xl sm:text-5xl font-extrabold text-[#00214a] mb-4">${b.title}</h1>
      <p class="text-sm text-slate-500 mb-6">Published by Origintra Research Desk on ${b.date}</p>
      <img src="${b.image}" alt="${b.title}" class="rounded-2xl shadow-lg w-full max-h-[400px] object-cover mb-8" />
      <div class="prose max-w-none text-slate-700 leading-relaxed">
        <p class="text-lg font-medium text-slate-800 mb-4">${b.excerpt}</p>
        <p>For international buyers sourcing bulk Indian agricultural commodities, Origintra Exim delivers laboratory-certified consignments adhering to international food safety parameters.</p>
      </div>
      <div class="mt-8 border-t border-slate-200 pt-6">
        <a href="/contact" class="bg-[#0070E0] text-white px-6 py-3 rounded-full text-sm font-bold inline-block">Consult Export Desk</a>
      </div>
    </article>
  `;

  renderPage(`blog/${b.slug}`, {
    title: blogTitle,
    description: blogDesc,
    image: b.image,
    bodyHtml: blogHtml,
    schema: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": b.title,
      "image": fullImg,
      "datePublished": b.date,
      "description": blogDesc,
      "publisher": {
        "@type": "Organization",
        "name": "Origintra Exim",
        "logo": {
          "@type": "ImageObject",
          "url": `${BASE_URL}/assets/logo/logo-full-color.png`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": blogUrl
      }
    }
  });
}
console.log(`Pre-rendered ${blogPosts.length} blog post pages.`);

console.log('✅ Successfully pre-rendered all site pages with unique titles, canonical tags, and semantic HTML!');
