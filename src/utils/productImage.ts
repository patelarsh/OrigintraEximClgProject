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

export function getProductImageSources(imagePath?: string | null): ProductImageSources {
  if (!imagePath || typeof imagePath !== 'string' || !imagePath.trim()) {
    return {
      src: DEFAULT_FALLBACK_IMAGE,
      webpSrc: '/assets/products/cumin-seeds.webp',
      w450Src: '/assets/products/cumin-seeds-450.webp'
    };
  }

  const cleanPath = imagePath.trim();

  // If external URL, data URL, or dynamic server upload (/uploads/), use directly without regex modification
  if (
    cleanPath.startsWith('http://') ||
    cleanPath.startsWith('https://') ||
    cleanPath.startsWith('data:') ||
    cleanPath.startsWith('/uploads/')
  ) {
    return {
      src: cleanPath,
      webpSrc: null,
      w450Src: null
    };
  }

  // If local static asset in /assets/products/
  if (cleanPath.startsWith('/assets/products/')) {
    const isJpgOrPng = /\.(jpe?g|png)$/i.test(cleanPath);
    if (isJpgOrPng) {
      return {
        src: cleanPath,
        webpSrc: cleanPath.replace(/\.(jpe?g|png)$/i, '.webp'),
        w450Src: cleanPath.replace(/\.(jpe?g|png)$/i, '-450.webp')
      };
    }
  }

  return {
    src: cleanPath,
    webpSrc: null,
    w450Src: null
  };
}

export function handleImageFallback(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  productName = 'Export Spice',
  category = 'Indian Spices'
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

  if (retryCount === 0) {
    // First fallback: Try base JPEG fallback
    img.setAttribute('data-error-count', '1');
    const baseJpg = img.getAttribute('data-base-jpg') || DEFAULT_FALLBACK_IMAGE;
    img.src = baseJpg;
  } else {
    // Second fallback: Instant SVG data URI that never fails over network
    img.onerror = null;
    img.setAttribute('data-error-count', '2');
    img.src = createProductSvgFallback(productName, category);
  }
}
