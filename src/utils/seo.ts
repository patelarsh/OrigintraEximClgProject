import { Product, BlogPost } from '../types';

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  noIndex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  faq?: FaqItem[];
  jsonLd?: Record<string, any>;
}

export const BASE_URL = 'https://www.origintra.com';
export const DEFAULT_IMAGE = `${BASE_URL}/assets/og/origintra-preview.jpg`;

export const DEFAULT_KEYWORDS = [
  'spice exporter in india',
  'spices exporter in india',
  'indian spice exporter',
  'bulk spice supplier from india',
  'bulk spices exporter india',
  'spice export company in india',
  'indian spices supplier',
  'wholesale spice suppliers india',
  'leading spices exporter in india',
  'reliable global b2b spice supply',
  'whole spices exporter in india',
  'powdered spices exporter in india',
  'ground spices manufacturer india',
  'coriander seeds exporter in india',
  'cumin seeds exporter india',
  'sortex cumin seeds jeera export',
  'sortex cumin seeds 99.5',
  'fennel seeds exporter in india',
  'fenugreek seeds exporter india',
  'sesame seeds exporter india',
  'psyllium husk exporter india',
  'dried red chilli exporter india',
  'guntur s17 teja chilli exporter',
  'turmeric exporter india',
  'salem turmeric powder export',
  'green cardamom exporter india',
  'alleppey green cardamom 8mm',
  'black pepper exporter india',
  'malabar black pepper garbled',
  'apeda registered spice exporter',
  'spices board of india certified exporter',
  'fssai licensed spice manufacturer india',
  'brc aligned spice processing facility india',
  'pre-shipment laboratory coa certified spices',
  'containerized spice exporter mundra nhava sheva',
  'fob cif cfr spice export india',
  'hs codes for indian spices and seeds export',
  'agricultural commodities export india'
].join(', ');

export const HOME_FAQS: FaqItem[] = [
  {
    question: 'Who is the leading spices exporter in India for international bulk buyers?',
    answer: 'Origintra Exim is a trusted merchant spices exporter in India, registered with the Spices Board of India, APEDA, and FSSAI. We supply containerized consignments (FCL/LCL) of premium whole spices, sortex seeds, and finely milled powders—such as Guntur S17 dried red chillies, Salem turmeric fingers (5%+ curcumin), Sortex cumin seeds (99.5% purity), and Alleppey green cardamom—to commercial importers, food manufacturers, and private-label distributors in over 24 countries worldwide.'
  },
  {
    question: 'What spices does Origintra Exim export from India?',
    answer: 'We export an extensive portfolio of 27+ Indian agricultural commodities across four main categories: Whole Spices (Dried Red Chilli, Green Cardamom, Malabar Black Pepper, Cinnamon, Clove, Whole Turmeric, Star Anise, Dry Ginger, Bay Leaf), Ground Spices (Red Chilli Powder, Turmeric Powder, Coriander Powder, Cumin Powder, Black Pepper Powder, Compounded Asafoetida), Seeds (Sortex Cumin Seeds, Coriander Seeds, Mustard Seeds, Fenugreek Seeds, Fennel Seeds), and Authentic Masala Blends (Garam Masala, Biryani Masala, Sambar, Rasam, Tandoori, Curry Powder, Chaat Masala).'
  },
  {
    question: 'Are your spice exports certified by the Spices Board of India, APEDA, and FSSAI?',
    answer: 'Yes. Origintra Exim operates in full compliance with the Spices Board of India (CRES Registration), the Agricultural and Processed Food Products Export Development Authority (APEDA), the Food Safety and Standards Authority of India (FSSAI), and Directorate General of Foreign Trade (DGFT IEC). Every export consignment is dispatched with a Certificate of Analysis (COA) from accredited NABL laboratories verifying moisture, volatile oil, and zero synthetic adulteration (Sudan I–IV, Lead Chromate).'
  },
  {
    question: 'What is the Minimum Order Quantity (MOQ) for bulk spice exports?',
    answer: 'Our standard commercial Minimum Order Quantity is 1 x 20ft Full Container Load (FCL) (typically 12 to 19 Metric Tons depending on commodity bulk density). For new buyers or multi-product culinary retailers, we offer consolidated multi-commodity mixed containers (combining 2 to 4 spice varieties within one 20ft or 40ft container) as well as commercial evaluation sample courier dispatches (100g – 500g air-freighted for sensory and lab evaluation).'
  },
  {
    question: 'Which Indian sea ports do you dispatch spice export containers from?',
    answer: 'We ship primarily from India\'s premier western and southern deep-water container gateway ports: Mundra Port (Gujarat) and JNPT / Nhava Sheva (Maharashtra) for north/western seed spices and chillies, and Cochin Port (Kerala) and Chennai / Tuticorin Ports (Tamil Nadu) for southern hill spices like cardamom, black pepper, and clove. We offer flexible commercial shipping terms including FOB (Indian port), CFR, and CIF (destination discharge port).'
  },
  {
    question: 'How do international buyers request quotation and commercial pricing?',
    answer: 'International procurement desks can request prompt FOB / CIF quotations by contacting our commercial export desk via our online Request a Quote portal, emailing export@origintra.com, or calling our WhatsApp trade hotline at +91 70691 82990. Quotes are dispatched within 24 to 48 business hours with complete specifications, current crop harvest prices, and scheduled vessel sailing dates.'
  }
];

export const ORGANIZATION_SCHEMA = {
  '@type': 'Corporation',
  '@id': `${BASE_URL}/#organization`,
  'name': 'Origintra Exim',
  'legalName': 'Origintra Exim',
  'alternateName': [
    'Spices Exporter in India',
    'Origintra Indian Spices Exporter',
    'Origintra Agro Exim',
    'Origintra Spices Exporter India'
  ],
  'url': BASE_URL,
  'logo': {
    '@type': 'ImageObject',
    'url': `${BASE_URL}/assets/logo/logo-full-color.png`,
    'width': 512,
    'height': 512
  },
  'image': `${BASE_URL}/assets/og/origintra-preview.jpg`,
  'description': 'Premier Indian spices exporter and agricultural merchant trading house. Sourcing and exporting premium whole dry red chillies, turmeric fingers, sortex cumin seeds, green cardamom, and custom spice blends in 20ft/40ft containers to B2B food manufacturers and wholesale importers worldwide.',
  'email': 'export@origintra.com',
  'telephone': '+91-70691-82990',
  'taxID': '2424018921',
  'vatID': '24AABCO9876C1Z5',
  'address': {
    '@type': 'PostalAddress',
    'streetAddress': 'Commercial Export Zone, Logistics Corridor',
    'addressLocality': 'Ahmedabad',
    'addressRegion': 'Gujarat',
    'postalCode': '384170',
    'addressCountry': 'IN'
  },
  'geo': {
    '@type': 'GeoCoordinates',
    'latitude': 23.8037,
    'longitude': 72.3942
  },
  'areaServed': [
    { '@type': 'Country', 'name': 'United States' },
    { '@type': 'Country', 'name': 'United Kingdom' },
    { '@type': 'Country', 'name': 'United Arab Emirates' },
    { '@type': 'Country', 'name': 'Saudi Arabia' },
    { '@type': 'Country', 'name': 'Germany' },
    { '@type': 'Country', 'name': 'Canada' },
    { '@type': 'Country', 'name': 'Australia' },
    { '@type': 'Country', 'name': 'Singapore' },
    { '@type': 'Country', 'name': 'Malaysia' },
    { '@type': 'Country', 'name': 'Netherlands' }
  ],
  'knowsAbout': [
    'Spice Exporter in India',
    'Indian Spice Exporter',
    'Bulk Spice Supplier from India',
    'Leading Spices Exporter in India',
    'Reliable Global B2B Spice Supply',
    'Indian Whole Spices',
    'Powdered Spices and Ground Masala',
    'Coriander Seeds Exporter in India',
    'Sortex Cumin Seeds Jeera',
    'Fennel and Fenugreek Seeds Export',
    'Sesame Seeds and Psyllium Husk',
    'Dry Red Chilli S17 Teja',
    'Salem Turmeric Powder & Fingers',
    'Alleppey Green Cardamom',
    'Malabar Black Pepper',
    'APEDA Registered Exporter',
    'Spices Board of India CRES',
    'FSSAI Certified Food Exporter',
    'BRC Aligned Spice Processing Standards',
    'Pre-shipment Laboratory COA Certification',
    'Ocean Freight Logistics Mundra and JNPT Nhava Sheva'
  ],
  'contactPoint': [
    {
      '@type': 'ContactPoint',
      'telephone': '+91-70691-82990',
      'contactType': 'international sales',
      'email': 'export@origintra.com',
      'areaServed': 'Worldwide',
      'availableLanguage': ['English', 'Hindi', 'Gujarati']
    }
  ],
  'sameAs': [
    BASE_URL,
    'https://wa.me/917069182990'
  ]
};

export const WEBSITE_SCHEMA = {
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  'url': BASE_URL,
  'name': 'Origintra Exim',
  'alternateName': 'Origintra Exim - Spices Exporter in India',
  'description': 'B2B export portal for Indian spices, whole commodities, sortex seeds, and agricultural trading.',
  'publisher': {
    '@id': `${BASE_URL}/#organization`
  },
  'potentialAction': {
    '@type': 'SearchAction',
    'target': `${BASE_URL}/products?search={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
};

export const SITE_NAVIGATION_SCHEMA = {
  '@type': 'ItemList',
  '@id': `${BASE_URL}/#site-navigation`,
  'name': 'Origintra Exim Site Navigation',
  'itemListElement': [
    {
      '@type': 'SiteNavigationElement',
      'position': 1,
      'name': 'Products Catalog',
      'description': 'Export catalog of 27+ premium Indian whole spices, sortex seeds, ground powders, and masala blends.',
      'url': `${BASE_URL}/products`
    },
    {
      '@type': 'SiteNavigationElement',
      'position': 2,
      'name': 'About Us',
      'description': 'Leading merchant spices exporter in India with direct farmgate sourcing networks across Gujarat and southern states.',
      'url': `${BASE_URL}/about`
    },
    {
      '@type': 'SiteNavigationElement',
      'position': 3,
      'name': 'Quality & Certifications',
      'description': 'Spices Board of India CRES, APEDA, FSSAI accredited compliance, and pre-shipment laboratory COA testing.',
      'url': `${BASE_URL}/quality`
    },
    {
      '@type': 'SiteNavigationElement',
      'position': 4,
      'name': 'Global Reach & Logistics',
      'description': 'Direct ocean container shipping from Mundra and JNPT ports to commercial buyers in over 24 countries.',
      'url': `${BASE_URL}/global-reach`
    },
    {
      '@type': 'SiteNavigationElement',
      'position': 5,
      'name': 'Contact & Request Quote',
      'description': 'Request FOB/CIF price quotation and commercial inquiries from our international export desk.',
      'url': `${BASE_URL}/contact`
    },
    {
      '@type': 'SiteNavigationElement',
      'position': 6,
      'name': 'Schedule Meeting',
      'description': 'Book a direct 30-minute B2B consultation with our trade desk to discuss orders, shipping terms, and pricing.',
      'url': `${BASE_URL}/schedule-meeting`
    }
  ]
};

function buildBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${BASE_URL}/#breadcrumb`,
    'itemListElement': breadcrumbs.map((bc, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'name': bc.name,
      'item': `${BASE_URL}${bc.item.startsWith('/') ? bc.item : `/${bc.item}`}`
    }))
  };
}

function buildFaqSchema(faq: FaqItem[]) {
  return {
    '@type': 'FAQPage',
    'mainEntity': faq.map((item) => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer
      }
    }))
  };
}

export function updatePageSeo(config: SeoConfig) {
  if (typeof document === 'undefined') return;

  // 1. Title
  document.title = config.title;

  // 2. Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', config.description);

  // 3. Meta Title tag
  let metaTitle = document.querySelector('meta[name="title"]');
  if (!metaTitle) {
    metaTitle = document.createElement('meta');
    metaTitle.setAttribute('name', 'title');
    document.head.appendChild(metaTitle);
  }
  metaTitle.setAttribute('content', config.title);

  // 4. Meta Keywords (Enterprise Extreme SEO)
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywords);
  }
  metaKeywords.setAttribute('content', config.keywords || DEFAULT_KEYWORDS);

  // 5. Author & Publisher
  const authorTags: Record<string, string> = {
    'author': 'Origintra Exim',
    'publisher': 'Origintra Exim',
    'rating': 'general',
    'geo.region': 'IN-GJ',
    'geo.placename': 'India',
    'geo.position': '23.8037;72.3942',
    'ICBM': '23.8037, 72.3942'
  };
  for (const [name, val] of Object.entries(authorTags)) {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', val);
  }

  // 6. Robots with max previews
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement('meta');
    metaRobots.setAttribute('name', 'robots');
    document.head.appendChild(metaRobots);
  }
  metaRobots.setAttribute(
    'content',
    config.noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  );

  // 7. Canonical Link
  const fullCanonicalUrl = `${BASE_URL}${config.canonicalPath.startsWith('/') ? config.canonicalPath : `/${config.canonicalPath}`}`;
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', fullCanonicalUrl);

  // 8. Open Graph & Twitter Cards
  const ogTags: Record<string, string> = {
    'og:title': config.title,
    'og:description': config.description,
    'og:url': fullCanonicalUrl,
    'og:type': config.ogType || 'website',
    'og:site_name': 'Origintra Exim',
    'og:locale': 'en_US',
    'og:image': config.ogImage ? (config.ogImage.startsWith('http') ? config.ogImage : `${BASE_URL}${config.ogImage}`) : DEFAULT_IMAGE,
    'twitter:title': config.title,
    'twitter:description': config.description,
    'twitter:url': fullCanonicalUrl,
    'twitter:image': config.ogImage ? (config.ogImage.startsWith('http') ? config.ogImage : `${BASE_URL}${config.ogImage}`) : DEFAULT_IMAGE,
    'twitter:card': 'summary_large_image',
  };

  for (const [property, content] of Object.entries(ogTags)) {
    const selector = property.startsWith('og:') ? `meta[property="${property}"]` : `meta[name="${property}"]`;
    let el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      if (property.startsWith('og:')) {
        el.setAttribute('property', property);
      } else {
        el.setAttribute('name', property);
      }
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  // 9. Schema.org JSON-LD Graph Assembly
  let scriptLd = document.getElementById('dynamic-seo-ld') as HTMLScriptElement | null;
  if (!scriptLd) {
    scriptLd = document.createElement('script');
    scriptLd.id = 'dynamic-seo-ld';
    scriptLd.type = 'application/ld+json';
    document.head.appendChild(scriptLd);
  }

  const graphItems: any[] = [ORGANIZATION_SCHEMA, WEBSITE_SCHEMA, SITE_NAVIGATION_SCHEMA];

  if (config.breadcrumbs && config.breadcrumbs.length > 0) {
    graphItems.push(buildBreadcrumbSchema(config.breadcrumbs));
  }

  if (config.faq && config.faq.length > 0) {
    graphItems.push(buildFaqSchema(config.faq));
  }

  if (config.jsonLd) {
    graphItems.push(config.jsonLd);
  }

  scriptLd.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graphItems
  });
}

// -------------------------------------------------------------
// PAGE-SPECIFIC SEO BUILDERS (OPTIMIZED FOR B2B SEARCH DOMINANCE)
// -------------------------------------------------------------

export function getHomeSeo(): SeoConfig {
  return {
    title: 'Spices Exporter in India | Origintra Exim',
    description: 'Leading spices exporter in India offering bulk whole spices, sortex seeds, ground powders & agricultural staples with certified quality and reliable global B2B supply. Spices Board & APEDA registered exporter shipping containerized FCL orders worldwide. Get a quote today.',
    keywords: [
      'origintra exim',
      'origintra',
      'origintra spices exporter',
      'spice exporter in india',
      'spices exporter in india',
      'indian spice exporter',
      'bulk spice supplier from india',
      'bulk spices exporter india',
      'spice export company in india',
      'indian spices supplier',
      'wholesale spice suppliers india',
      'leading spices exporter in india',
      'reliable global b2b spice supply',
      'whole spices exporter in india',
      'powdered spices exporter in india',
      'ground spices manufacturer india',
      'coriander seeds exporter in india',
      'cumin seeds exporter india',
      'sortex cumin seeds jeera export',
      'sortex cumin seeds 99.5',
      'fennel seeds exporter in india',
      'fenugreek seeds exporter india',
      'sesame seeds exporter india',
      'psyllium husk exporter india',
      'dried red chilli exporter india',
      'guntur s17 teja chilli exporter',
      'turmeric exporter india',
      'salem turmeric powder export',
      'green cardamom exporter india',
      'alleppey green cardamom 8mm',
      'black pepper exporter india',
      'apeda registered spice exporter',
      'spices board of india certified exporter',
      'fssai licensed spice manufacturer india',
      'brc aligned spice processing facility india',
      'containerized spice exporter mundra nhava sheva',
      'fob cif cfr spice export india',
      'hs codes for indian spices and seeds export'
    ].join(', '),
    canonicalPath: '/',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: '/' }
    ],
    faq: HOME_FAQS
  };
}

export function getAboutSeo(): SeoConfig {
  const isLeadershipVisible = typeof window !== 'undefined'
    ? (localStorage.getItem('origintra_admin_leadership_visibility_v1') === 'true')
    : false;

  const config: SeoConfig = {
    title: 'About Us | Origintra Exim - Indian Spices Exporter',
    description: "Discover Origintra Exim, India's trusted merchant spices exporter. Direct farmgate sourcing networks across Gujarat, Andhra Pradesh, Rajasthan and Kerala supplying export-grade agricultural commodities worldwide.",
    keywords: [
      'about origintra exim',
      'about us origintra',
      'indian spices export company',
      'spices exporter in india profile',
      'agricultural trading company india',
      'direct farmgate spice sourcing india',
      'apeda registered spices merchant',
      'spices board of india member company'
    ].join(', '),
    canonicalPath: '/about',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'About Us', item: '/about' }
    ]
  };

  if (isLeadershipVisible) {
    config.jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      'mainEntity': {
        '@type': 'Corporation',
        'name': 'Origintra Exim',
        'founder': {
          '@type': 'Person',
          'name': 'Patel Arsh',
          'jobTitle': 'Founder & Managing Director',
          'knowsAbout': 'Agri-Commodity Exports & Global Commercial Partnerships'
        }
      }
    };
  }

  return config;
}

export function getProductsCatalogSeo(category?: string): SeoConfig {
  const catSuffix = category ? ` - ${category}` : '';
  return {
    title: `Products Catalog${catSuffix} | Bulk Spices Supplier - Origintra Exim`,
    description: 'Browse our full export portfolio of 27+ premium Indian spices: whole chillies, turmeric fingers, green cardamom, black pepper, sortex seeds, and authentic curry blends with certified laboratory testing.',
    keywords: [
      'indian spices catalog',
      'spices exporter in india catalog',
      'buy spices wholesale india',
      'bulk spices export price',
      'whole spices exporter in india',
      'powdered spices exporter in india',
      'ground spices manufacturer india',
      'coriander seeds exporter in india',
      'cumin seeds exporter in india',
      'fennel seeds exporter in india',
      'sortex spice seeds india',
      'bulk spices superfoods staples supplier india',
      'spices manufacturer in gujarat india',
      'indian curry blends exporter',
      'fcl container spice orders'
    ].join(', '),
    canonicalPath: '/products',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Products Catalog', item: '/products' }
    ]
  };
}

export function getProductSeo(product: Product): SeoConfig {
  const title = `${product.name} Exporter in India - Bulk Supply & Export Specifications | Origintra Exim`;
  const description = `${product.tagline || product.shortDescription || `Export grade ${product.name} from India`}. High purity, certified moisture specifications, seaworthy export packaging, and lab test reports for international importers.`;
  const canonicalPath = `/products/${product.slug}`;

  const productKeywords = [
    `${product.name.toLowerCase()} exporter in india`,
    `indian ${product.name.toLowerCase()} exporter`,
    `bulk ${product.name.toLowerCase()} supplier india`,
    `${product.name.toLowerCase()} wholesale price india`,
    `${product.name.toLowerCase()} container load export`,
    product.botanicalName ? `${product.botanicalName.toLowerCase()} export` : '',
    product.category ? `${product.category.toLowerCase()} exporter india` : '',
    'spices exporter in india',
    'apeda spices board certified'
  ].filter(Boolean).join(', ');

  return {
    title,
    description,
    keywords: productKeywords,
    canonicalPath,
    ogType: 'product',
    ogImage: product.image,
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Products Catalog', item: '/products' },
      { name: product.name, item: canonicalPath }
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': `${product.name} - Export Grade`,
      'image': product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`,
      'description': product.shortDescription || product.tagline,
      'category': product.category,
      'sku': `ORIGIN-${product.id.toUpperCase()}`,
      'mpn': `EXIM-${product.id.toUpperCase()}`,
      'brand': {
        '@type': 'Brand',
        'name': 'Origintra Exim'
      },
      'countryOfOrigin': {
        '@type': 'Country',
        'name': 'India'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'reviewCount': '36',
        'bestRating': '5',
        'worstRating': '1'
      },
      'offers': {
        '@type': 'Offer',
        'priceCurrency': 'USD',
        'price': 'Contact for FOB/CIF Quotation',
        'availability': 'https://schema.org/InStock',
        'itemCondition': 'https://schema.org/NewCondition',
        'url': `${BASE_URL}${canonicalPath}`,
        'seller': {
          '@type': 'Organization',
          'name': 'Origintra Exim'
        }
      }
    }
  };
}

export function getQualitySeo(): SeoConfig {
  return {
    title: 'Quality & Certifications | Origintra Exim - Certified Exporter',
    description: 'Export-grade compliance with Spices Board of India, FSSAI, APEDA, and ISO. Certified laboratory testing for moisture, aflatoxins, volatile oils, and pesticide MRLs.',
    keywords: [
      'spice export quality standards india',
      'spices board of india cres certification',
      'apeda registered exporter india',
      'aflatoxin free chilli export',
      'pesticide mrl compliant spices india',
      'fssai certified spice exporter',
      'nabl accredited spice testing'
    ].join(', '),
    canonicalPath: '/quality',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Quality & Compliance', item: '/quality' }
    ]
  };
}

export function getGlobalReachSeo(): SeoConfig {
  return {
    title: 'Global Reach & Ports | Origintra Exim Logistics',
    description: 'Containerized Indian agricultural spice exports to 24+ destination countries across GCC, North America, Europe, and Asia. Direct ocean freight from Mundra, Nhava Sheva and Cochin.',
    keywords: [
      'spice export shipping routes india',
      'containerized spice exports',
      'bulk spice shipping mundra port',
      'jnpt nhava sheva spice exporter',
      'ocean freight indian spices',
      'cif spice export gcc usa europe',
      'spices exporter in india ports'
    ].join(', '),
    canonicalPath: '/global-reach',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Global Logistics', item: '/global-reach' }
    ]
  };
}

export function getBlogIndexSeo(): SeoConfig {
  return {
    title: 'Indian Spice Export Insights & International Trade Intelligence | Origintra Exim Blog',
    description: 'Commercial guides, market price analysis, crop harvest reports, and regulatory compliance updates for international spice importers and procurement managers.',
    keywords: [
      'indian spice trade insights',
      'spice market price india',
      'crop arrival calendar india',
      'spice export guide india',
      'how to import spices from india',
      'spices exporter in india news'
    ].join(', '),
    canonicalPath: '/blog',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Trade Insights', item: '/blog' }
    ]
  };
}

export function getBlogPostSeo(post: BlogPost): SeoConfig {
  const title = `${post.title} | Origintra Exim Blog`;
  const description = post.excerpt || post.metaDescription || `Read export intelligence and trade insights on ${post.title} from Origintra Exim.`;
  const canonicalPath = `/blog/${post.slug}`;

  return {
    title,
    description,
    keywords: [
      post.title.toLowerCase(),
      'indian spice export insights',
      'spices exporter in india',
      'international spice trade',
      post.category ? post.category.toLowerCase() : ''
    ].filter(Boolean).join(', '),
    canonicalPath,
    ogType: 'article',
    ogImage: post.image,
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Trade Insights', item: '/blog' },
      { name: post.title, item: canonicalPath }
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': post.title,
      'image': post.image.startsWith('http') ? post.image : `${BASE_URL}${post.image}`,
      'description': description,
      'datePublished': post.rawDate || post.date,
      'author': {
        '@type': 'Person',
        'name': post.author || 'Origintra Commercial Research Desk'
      },
      'publisher': {
        '@type': 'Organization',
        'name': 'Origintra Exim',
        'logo': {
          '@type': 'ImageObject',
          'url': `${BASE_URL}/assets/logo/logo-full-color.png`
        }
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `${BASE_URL}${canonicalPath}`
      }
    }
  };
}

export function getContactSeo(): SeoConfig {
  return {
    title: 'Contact Us | Origintra Exim Commercial Trade Desk',
    description: 'Connect directly with our international export desk for FOB / CIF container pricing, product specifications, and commercial sample shipments.',
    keywords: [
      'contact spices exporter in india',
      'bulk spice quotation india',
      'spice export inquiry form',
      'buy indian spices wholesale contact',
      'origintra exim trade desk'
    ].join(', '),
    canonicalPath: '/contact',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Contact Trade Desk', item: '/contact' }
    ]
  };
}

export function getScheduleMeetingSeo(): SeoConfig {
  return {
    title: 'Schedule Meeting | Origintra Exim 30-Min Consultation',
    description: 'Book a direct 30-minute B2B consultation with Origintra Exim senior export desk to discuss FOB/CIF container pricing, crop availability, and statutory compliance.',
    keywords: [
      'schedule spice meeting',
      'commercial spice consultation',
      'b2b spice import meeting india',
      'spices exporter in india consultation'
    ].join(', '),
    canonicalPath: '/schedule-meeting',
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Schedule Meeting', item: '/schedule-meeting' }
    ]
  };
}

export function getLegalSeo(legalType: 'privacy' | 'terms' | 'shipping' | 'cookies'): SeoConfig {
  const configs: Record<string, { title: string; description: string; canonicalPath: string; name: string }> = {
    privacy: {
      title: 'Privacy Policy | Origintra Exim — Commercial Data Governance',
      description: 'Commercial privacy policy, B2B data confidentiality, and international export trade data protection standards for Origintra Exim.',
      canonicalPath: '/privacy-policy',
      name: 'Privacy Policy'
    },
    terms: {
      title: 'Terms & Conditions | Origintra Exim — International Trade Terms',
      description: 'Commercial sales contract framework, Incoterms® 2020 rules (FOB/CFR/CIF), and export terms of service for Origintra Exim.',
      canonicalPath: '/terms-of-service',
      name: 'Terms & Conditions'
    },
    shipping: {
      title: 'Shipping Policy | Origintra Exim — Container Port Operations',
      description: 'Commercial export shipping policy, Indian gateway ports (Mundra, Nhava Sheva, Cochin), container stuffing, and maritime documentation.',
      canonicalPath: '/shipping-policy',
      name: 'Shipping Policy'
    },
    cookies: {
      title: 'Cookie Policy | Origintra Exim — Digital Compliance',
      description: 'Digital cookie policy, technical session preservation, and zero third-party tracking standards on the Origintra Exim export portal.',
      canonicalPath: '/cookie-policy',
      name: 'Cookie Policy'
    }
  };

  const active = configs[legalType] || configs.privacy;
  return {
    title: active.title,
    description: active.description,
    canonicalPath: active.canonicalPath,
    ogType: 'website',
    breadcrumbs: [
      { name: 'Home', item: '/' },
      { name: 'Legal Governance', item: '/privacy-policy' },
      { name: active.name, item: active.canonicalPath }
    ]
  };
}

