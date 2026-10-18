/**
 * Utility for robust product image source resolution and fallbacks.
 * Prevents blank images on mobile devices, responsive srcset failures, and infinite error loops.
 */

export interface ProductImageSources {
  src: string;
  webpSrc: string | null;
  w450Src: string | null;
}

const DEFAULT_FALLBACK_IMAGE = '/assets/products/cumin-seeds.jpg';

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
  fallbackSrc = DEFAULT_FALLBACK_IMAGE
) {
  const img = event.currentTarget;
  // Detach error handler immediately to avoid infinite error loops
  img.onerror = null;

  // Clear picture sources if parent is a <picture>
  if (img.parentElement && img.parentElement.tagName.toLowerCase() === 'picture') {
    const sources = img.parentElement.querySelectorAll('source');
    sources.forEach(s => s.removeAttribute('srcset'));
  }

  img.removeAttribute('srcset');
  img.src = fallbackSrc;
}
