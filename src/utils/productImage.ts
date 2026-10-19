/**
 * Utility for robust product image source resolution and fallbacks.
 * Prevents blank images on mobile devices, responsive srcset failures, and infinite error loops.
 */

export interface ProductImageSources {
  src: string;
  webpSrc: string | null;
  w450Src: string | null;
}

export const DEFAULT_FALLBACK_IMAGE = '/assets/products/cumin-seeds.jpg';

/**
 * Creates an elegant vector SVG Data URI fallback with commodity name and badge.
 * This GUARANTEES zero blank boxes even during offline states or extreme network drops.
 */
export function createProductSvgFallback(productName = 'Export Spice', category = 'Whole & Ground Spices'): string {
  const cleanName = (productName || 'Export Spice').replace(/["'<>&]/g, '');
  const cleanCat = (category || 'Origintra Exim Quality').replace(/["'<>&]/g, '');
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0A1C3E"/>
        <stop offset="60%" stop-color="#0F2D6B"/>
        <stop offset="100%" stop-color="#0070E0"/>
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#D97706"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g1)"/>
    <circle cx="200" cy="200" r="85" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity="0.15"/>
    <circle cx="200" cy="200" r="70" fill="#ffffff" fill-opacity="0.08"/>
    <!-- Stylized Spice Pod / Leaf Motif -->
    <path d="M200 145 C165 190 155 220 155 238 C155 264 175 282 200 282 C225 282 245 264 245 238 C245 220 235 190 200 145 Z" fill="url(#gold)"/>
    <path d="M200 155 L200 275" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.4"/>
    <text x="200" y="335" text-anchor="middle" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" letter-spacing="-0.5">${cleanName}</text>
    <text x="200" y="365" text-anchor="middle" fill="#93C5FD" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" letter-spacing="1.5" text-transform="uppercase">${cleanCat}</text>
    <rect x="110" y="405" width="180" height="28" rx="14" fill="#ffffff" fill-opacity="0.15"/>
    <text x="200" y="423" text-anchor="middle" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" letter-spacing="1">ORIGINTRA EXIM</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const ASSET_CACHE_VERSION = 'v=20261019_drive';

export function withAssetCache(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed.startsWith('/assets/products/')) return trimmed;
  if (trimmed.includes(ASSET_CACHE_VERSION)) return trimmed;
  const base = trimmed.split('?')[0];
  return `${base}?${ASSET_CACHE_VERSION}`;
}

export function getProductImageSources(imagePath?: string | null): ProductImageSources {
  if (!imagePath || typeof imagePath !== 'string' || !imagePath.trim()) {
    return {
      src: withAssetCache(DEFAULT_FALLBACK_IMAGE),
      webpSrc: withAssetCache('/assets/products/cumin-seeds.webp'),
      w450Src: withAssetCache('/assets/products/cumin-seeds-450.webp')
    };
  }

  const raw = imagePath.trim();
  const cleanPath = raw.split('?')[0];

  // If external URL, data URL, or dynamic server upload (/uploads/), use directly without regex modification
  if (
    cleanPath.startsWith('http://') ||
    cleanPath.startsWith('https://') ||
    cleanPath.startsWith('data:') ||
    cleanPath.startsWith('/uploads/')
  ) {
    return {
      src: raw,
      webpSrc: null,
      w450Src: null
    };
  }

  // If local static asset in /assets/products/
  if (cleanPath.startsWith('/assets/products/')) {
    const isJpgOrPng = /\.(jpe?g|png)$/i.test(cleanPath);
    if (isJpgOrPng) {
      return {
        src: withAssetCache(cleanPath),
        webpSrc: withAssetCache(cleanPath.replace(/\.(jpe?g|png)$/i, '.webp')),
        w450Src: withAssetCache(cleanPath.replace(/\.(jpe?g|png)$/i, '-450.webp'))
      };
    }
    return {
      src: withAssetCache(cleanPath),
      webpSrc: null,
      w450Src: null
    };
  }

  return {
    src: raw,
    webpSrc: null,
    w450Src: null
  };
}

export const DEFAULT_PRODUCT_IMAGE_MAP: Record<string, string> = {
  'cinnamon': '/assets/products/cinnamon.jpg',
  'coriander-seeds': '/assets/products/coriander-seeds.jpg',
  'coriander': '/assets/products/coriander-seeds.jpg',
  'clove': '/assets/products/clove.jpg',
  'cloves': '/assets/products/clove.jpg',
  'cumin-seeds': '/assets/products/cumin-seeds.jpg',
  'cumin': '/assets/products/cumin-seeds.jpg',
  'whole-turmeric': '/assets/products/whole-turmeric.jpg',
  'turmeric': '/assets/products/turmeric.jpg',
  'turmeric-powder': '/assets/products/turmeric.jpg',
  'black-pepper': '/assets/products/black-pepper.jpg',
  'fenugreek-seeds': '/assets/products/fenugreek-seeds.jpg',
  'fennel': '/assets/products/fennel.jpg',
  'fennel-seeds': '/assets/products/fennel.jpg',
  'dry-ginger': '/assets/products/dry-ginger.jpg',
  'ginger': '/assets/products/dry-ginger.jpg',
  'bay-leaf': '/assets/products/bay-leaf.jpg',
  'star-anise': '/assets/products/star-anise.jpg',
  'whole-red-chili': '/assets/products/whole-red-chili.jpg',
  'red-chilli': '/assets/products/whole-red-chili.jpg',
  'green-cardamom': '/assets/products/green-cardamom.jpg',
  'cardamom': '/assets/products/green-cardamom.jpg',
  'asafoetida': '/assets/products/asafoetida.jpg',
  'red-chili-powder': '/assets/products/red-chili-powder.jpg',
  'red-chilli-powder': '/assets/products/red-chili-powder.jpg',
  'coriander-powder': '/assets/products/coriander-powder.jpg',
  'cumin-powder': '/assets/products/cumin-powder.jpg',
  'black-pepper-powder': '/assets/products/black-pepper-powder.jpg',
  'garam-masala': '/assets/products/garam-masala.jpg',
  'sambar-masala': '/assets/products/sambar-masala.jpg',
  'rasam-powder': '/assets/products/rasam-powder.jpg',
  'biryani-masala': '/assets/products/biryani-masala.jpg',
  'tandoori-masala': '/assets/products/tandoori-masala.jpg',
  'curry-powder': '/assets/products/curry-powder.jpg',
  'chaat-masala': '/assets/products/chaat-masala.jpg'
};

export function getProductDefaultImage(productId?: string, productName?: string): string {
  if (productId) {
    const cleanId = productId.toLowerCase().trim().replace(/_/g, '-');
    if (DEFAULT_PRODUCT_IMAGE_MAP[cleanId]) return DEFAULT_PRODUCT_IMAGE_MAP[cleanId];
    const sortedKeys = Object.keys(DEFAULT_PRODUCT_IMAGE_MAP).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (cleanId === key || cleanId.includes(key)) return DEFAULT_PRODUCT_IMAGE_MAP[key];
    }
  }
  if (productName) {
    const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (DEFAULT_PRODUCT_IMAGE_MAP[slug]) return DEFAULT_PRODUCT_IMAGE_MAP[slug];
    const sortedKeys = Object.keys(DEFAULT_PRODUCT_IMAGE_MAP).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (slug.includes(key) || key.includes(slug)) return DEFAULT_PRODUCT_IMAGE_MAP[key];
    }
  }
  return DEFAULT_FALLBACK_IMAGE;
}

export function handleImageFallback(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  productName = 'Export Spice',
  category = 'Indian Spices',
  productId?: string
) {
  const img = event.currentTarget;
  const currentSrc = img.src || '';

  // Prevent multiple calls if already using data URI
  if (currentSrc.startsWith('data:image/svg+xml')) {
    return;
  }

  // Track retry count via data attribute
  const retryCount = parseInt(img.getAttribute('data-error-count') || '0', 10);

  // If parent is a <picture>, remove <source> elements so browser evaluates <img> directly
  if (img.parentElement && img.parentElement.tagName.toLowerCase() === 'picture') {
    const sources = img.parentElement.querySelectorAll('source');
    sources.forEach(s => s.remove());
  }

  img.removeAttribute('srcset');

  const rawDefaultPhoto = getProductDefaultImage(productId, productName);
  const defaultPhoto = withAssetCache(rawDefaultPhoto);

  if (retryCount === 0) {
    // First fallback: If current image failed, try the real catalog photograph!
    img.setAttribute('data-error-count', '1');
    const cleanCurrent = currentSrc.split('?')[0];
    const cleanDefault = rawDefaultPhoto.split('?')[0];
    if (!cleanCurrent.endsWith(cleanDefault)) {
      img.src = defaultPhoto;
      return;
    }
    const cleanFallback = DEFAULT_FALLBACK_IMAGE.split('?')[0];
    if (!cleanCurrent.endsWith(cleanFallback)) {
      img.src = withAssetCache(DEFAULT_FALLBACK_IMAGE);
      return;
    }
  }

  // Second fallback: Only if even the official photography files fail, show the vector SVG
  img.onerror = null;
  img.setAttribute('data-error-count', '2');
  img.src = createProductSvgFallback(productName, category);
}
