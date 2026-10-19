export const ROUTES = {
  home: '/',
  about: '/about',
  products: '/products',
  productDetail: (slug: string) => `/products/${slug}`,
  globalReach: '/global-reach',
  quality: '/quality',
  blog: '/blog',
  blogDetail: (slug: string) => `/blog/${slug}`,
  contact: '/contact',
  meeting: '/schedule-meeting',
  admin: '/admin',
  privacy: '/privacy-policy',
  terms: '/terms-of-service',
  shipping: '/shipping-policy',
  cookies: '/cookie-policy',
  sitemap: '/sitemap',
  notFound: '/404'
} as const;

export type RouteTarget = 
  | 'home'
  | 'about'
  | 'products'
  | 'global-reach'
  | 'quality'
  | 'blog'
  | 'contact'
  | 'meeting'
  | 'admin'
  | 'sitemap'
  | 'not-found'
  | '404'
  | string;

export interface ParsedRoute {
  page: 'home' | 'about' | 'products' | 'product-detail' | 'global-reach' | 'quality' | 'blog' | 'contact' | 'meeting' | 'admin' | 'legal' | 'sitemap' | 'not-found';
  productSlug?: string;
  blogSlug?: string;
  legalType?: 'privacy' | 'terms' | 'shipping' | 'cookies';
  path: string;
}

/**
 * Returns a clean SEO-friendly path for any internal target identifier
 */
export function getHref(target: string): string {
  if (!target || target === 'home' || target === '#home' || target === '/') return ROUTES.home;
  if (target.startsWith('/')) return target;

  // Clean hash prefix if present
  const clean = target.replace(/^#/, '').trim();

  if (clean === 'about') return ROUTES.about;
  if (clean === 'products') return ROUTES.products;
  if (clean === 'global-reach' || clean === 'global') return ROUTES.globalReach;
  if (clean === 'quality' || clean === 'quality-compliance') return ROUTES.quality;
  if (clean === 'blog') return ROUTES.blog;
  if (clean === 'contact') return ROUTES.contact;
  if (clean === 'meeting' || clean === 'schedule-meeting' || clean === 'schedule-metting' || clean === 'schedule') return ROUTES.meeting;
  if (clean === 'admin') return ROUTES.admin;

  if (clean.startsWith('product-')) {
    const slug = clean.replace('product-', '');
    return ROUTES.productDetail(slug);
  }
  if (clean.startsWith('blog-') || clean.startsWith('blog/')) {
    const slug = clean.startsWith('blog/') ? clean.replace('blog/', '') : clean.replace('blog-', '');
    return ROUTES.blogDetail(slug);
  }

  if (clean === 'legal-privacy' || clean === 'privacy') return ROUTES.privacy;
  if (clean === 'legal-terms' || clean === 'terms') return ROUTES.terms;
  if (clean === 'legal-shipping' || clean === 'shipping') return ROUTES.shipping;
  if (clean === 'legal-cookies' || clean === 'cookies') return ROUTES.cookies;
  if (clean === 'sitemap' || clean === 'site-map') return ROUTES.sitemap;
  if (clean === '404' || clean === 'not-found') return ROUTES.notFound;

  return `/${clean}`;
}

/**
 * Parses current browser window location (pathname and legacy hash)
 */
export function parseCurrentRoute(): ParsedRoute {
  if (typeof window === 'undefined') {
    return { page: 'home', path: '/' };
  }

  let pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const hash = window.location.hash.replace(/^#/, '').trim();

  // 1. Handle backward compatibility: redirect legacy hash to SEO clean URL
  if (hash) {
    let cleanUrl = getHref(hash);
    if (cleanUrl && cleanUrl !== pathname) {
      window.history.replaceState(null, '', cleanUrl);
      pathname = cleanUrl;
    }
  }

  // 2. Map clean URL path to Page state
  if (pathname === '/' || pathname === '') {
    return { page: 'home', path: '/' };
  }

  if (pathname === '/about') {
    return { page: 'about', path: '/about' };
  }

  if (pathname === '/products') {
    return { page: 'products', path: '/products' };
  }

  if (pathname.startsWith('/products/') || pathname.startsWith('/product/')) {
    const slug = pathname.startsWith('/products/') 
      ? pathname.replace('/products/', '') 
      : pathname.replace('/product/', '');
    if (slug) {
      return { page: 'product-detail', productSlug: slug, path: pathname };
    }
    return { page: 'products', path: '/products' };
  }

  if (pathname === '/global-reach' || pathname === '/global') {
    return { page: 'global-reach', path: '/global-reach' };
  }

  if (pathname === '/quality' || pathname === '/quality-compliance') {
    return { page: 'quality', path: '/quality' };
  }

  if (pathname === '/blog') {
    return { page: 'blog', path: '/blog' };
  }

  if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace('/blog/', '');
    if (slug) {
      return { page: 'blog', blogSlug: slug, path: pathname };
    }
    return { page: 'blog', path: '/blog' };
  }

  if (pathname === '/contact') {
    return { page: 'contact', path: '/contact' };
  }

  if (pathname === '/schedule-meeting' || pathname === '/schedule-metting' || pathname === '/meeting' || pathname === '/schedule') {
    return { page: 'meeting', path: '/schedule-meeting' };
  }

  if (pathname === '/admin') {
    return { page: 'admin', path: '/admin' };
  }

  if (pathname === '/privacy-policy' || pathname === '/legal/privacy') {
    return { page: 'legal', legalType: 'privacy', path: '/privacy-policy' };
  }

  if (pathname === '/terms-of-service' || pathname === '/terms' || pathname === '/terms-and-conditions' || pathname === '/terms-conditions' || pathname === '/legal/terms') {
    return { page: 'legal', legalType: 'terms', path: '/terms-of-service' };
  }

  if (pathname === '/shipping-policy' || pathname === '/shipping' || pathname === '/legal/shipping') {
    return { page: 'legal', legalType: 'shipping', path: '/shipping-policy' };
  }

  if (pathname === '/cookie-policy' || pathname === '/cookies' || pathname === '/legal/cookies') {
    return { page: 'legal', legalType: 'cookies', path: '/cookie-policy' };
  }

  if (pathname === '/sitemap' || pathname === '/site-map') {
    return { page: 'sitemap', path: '/sitemap' };
  }

  if (pathname === '/404' || pathname === '/not-found') {
    return { page: 'not-found', path: '/404' };
  }

  // Fallback for legacy `#blog-...` directly in path
  if (pathname.startsWith('/#') || pathname.startsWith('/blog-')) {
    const slug = pathname.replace(/^\/(#|blog-)/, '');
    return { page: 'blog', blogSlug: slug, path: `/blog/${slug}` };
  }

  // Any unmatched route returns 404
  return { page: 'not-found', path: pathname };
}
