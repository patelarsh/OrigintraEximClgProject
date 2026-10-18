import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { ChevronUp } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PRODUCTS } from './data/products';
import { BLOG_POSTS } from './data/blog';
import { Product, BlogPost } from './types';
import { AdminStorage } from './services/adminStorage';
import { useCompanyConfig } from './hooks/useCompanyConfig';
import { ROUTES, getHref, parseCurrentRoute, ParsedRoute } from './utils/routes';
import { 
  updatePageSeo, 
  getProductSeo, 
  getBlogPostSeo, 
  getHomeSeo, 
  getAboutSeo, 
  getProductsCatalogSeo, 
  getQualitySeo, 
  getGlobalReachSeo, 
  getBlogIndexSeo, 
  getContactSeo,
  getScheduleMeetingSeo 
} from './utils/seo';

// Route-based Code Splitting: Lazy-load secondary pages & heavy modals
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const GlobalReachPage = lazy(() => import('./pages/GlobalReachPage').then(m => ({ default: m.GlobalReachPage })));
const QualityPage = lazy(() => import('./pages/QualityPage').then(m => ({ default: m.QualityPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(m => ({ default: m.BlogPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const MeetingPage = lazy(() => import('./pages/MeetingPage').then(m => ({ default: m.MeetingPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const QuoteModal = lazy(() => import('./components/QuoteModal').then(m => ({ default: m.QuoteModal })));
const LegalModal = lazy(() => import('./components/LegalModal').then(m => ({ default: m.LegalModal })));

// Sleek, minimal loading fallback for secondary route transitions
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-white" aria-live="polite">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-[#0070E0] border-t-transparent rounded-full animate-spin"></div>
      <span className="text-[11px] font-semibold tracking-widest uppercase text-slate-400">Loading Origintra Exim...</span>
    </div>
  </div>
);

export const App: React.FC = () => {
  const companyConfig = useCompanyConfig();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [blogArticleSlug, setBlogArticleSlug] = useState<string | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState<boolean>(false);
  const [prefilledProduct, setPrefilledProduct] = useState<string>('Red Chilli');
  const [legalModalOpen, setLegalModalOpen] = useState<boolean>(false);
  const [activeLegalType, setActiveLegalType] = useState<'privacy' | 'terms' | 'shipping' | 'cookies'>('privacy');
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Sync server-backed site settings & products on mount so all devices have current global state
  useEffect(() => {
    try {
      if (localStorage.getItem('origintra_admin_products_v1')) {
        localStorage.removeItem('origintra_admin_products_v1');
      }
    } catch {}

    AdminStorage.syncSettingsFromServer();
    AdminStorage.syncProductsFromServer().catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Interaction-Aware Prefetching: silently loads About, Products, Contact, and Blog chunks on first real user interaction
  useEffect(() => {
    let prefetched = false;
    const prefetchRoutes = () => {
      if (prefetched) return;
      prefetched = true;
      ['pointerdown', 'touchstart', 'scroll'].forEach((ev) => {
        window.removeEventListener(ev, prefetchRoutes);
      });
      // Idle prefetch after user interaction has settled
      setTimeout(() => {
        import('./pages/AboutPage');
        import('./pages/ProductsPage');
        import('./pages/ContactPage');
        import('./pages/BlogPage');
        import('./components/QuoteModal');
      }, 500);
    };

    ['pointerdown', 'touchstart', 'scroll'].forEach((ev) => {
      window.addEventListener(ev, prefetchRoutes, { passive: true, once: true });
    });

    return () => {
      ['pointerdown', 'touchstart', 'scroll'].forEach((ev) => {
        window.removeEventListener(ev, prefetchRoutes);
      });
    };
  }, []);

  const applyRouteSeo = useCallback((route: ParsedRoute, product?: Product | null, post?: BlogPost | null) => {
    switch (route.page) {
      case 'home':
        updatePageSeo(getHomeSeo());
        break;
      case 'about':
        updatePageSeo(getAboutSeo());
        break;
      case 'products':
        updatePageSeo(getProductsCatalogSeo());
        break;
      case 'product-detail':
        if (product) {
          updatePageSeo(getProductSeo(product));
        }
        break;
      case 'global-reach':
        updatePageSeo(getGlobalReachSeo());
        break;
      case 'quality':
        updatePageSeo(getQualitySeo());
        break;
      case 'blog':
        if (post) {
          updatePageSeo(getBlogPostSeo(post));
        } else {
          updatePageSeo(getBlogIndexSeo());
        }
        break;
      case 'contact':
        updatePageSeo(getContactSeo());
        break;
      case 'meeting':
        updatePageSeo(getScheduleMeetingSeo());
        break;
      case 'admin':
        updatePageSeo({
          title: 'Origintra Exim — Admin CMS Portal',
          description: 'Corporate content and catalog administration portal.',
          canonicalPath: '/admin',
          noIndex: true
        });
        break;
      case 'legal':
        updatePageSeo({
          title: `${route.legalType ? route.legalType.charAt(0).toUpperCase() + route.legalType.slice(1) : 'Legal'} Policy | Origintra Exim`,
          description: 'Legal notices, commercial compliance, and trade terms for Origintra Exim.',
          canonicalPath: route.path,
          noIndex: true,
          breadcrumbs: [
            { name: 'Home', item: '/' },
            { name: 'Legal Policy', item: route.path }
          ]
        });
        break;
      case 'not-found':
        updatePageSeo({
          title: '404 - Page Not Found | Origintra Exim',
          description: 'The requested page could not be found. Explore our export commodities or return to the Origintra Exim homepage.',
          canonicalPath: '/404',
          noIndex: true
        });
        break;
    }
  }, []);

  const syncRouteState = useCallback(() => {
    const route = parseCurrentRoute();

    if (route.page === 'home') {
      setCurrentPage('home');
      setSelectedProduct(null);
      setBlogArticleSlug(null);
      applyRouteSeo(route);
    } else if (route.page === 'about') {
      setCurrentPage('about');
      setSelectedProduct(null);
      setBlogArticleSlug(null);
      applyRouteSeo(route);
    } else if (route.page === 'products') {
      setCurrentPage('products');
      setSelectedProduct(null);
      setBlogArticleSlug(null);
      applyRouteSeo(route);
    } else if (route.page === 'product-detail' && route.productSlug) {
      const slug = route.productSlug;
      const allProducts = AdminStorage.getProducts();
      const found = allProducts.find((p) => p.slug === slug || (slug === 'turmeric-powder' && (p.slug === 'turmeric' || p.id === 'turmeric'))) || 
                    PRODUCTS.find((p) => p.slug === slug || (slug === 'turmeric-powder' && (p.slug === 'turmeric' || p.id === 'turmeric')));
      if (found) {
        setSelectedProduct(found);
        setCurrentPage('product-detail');
        applyRouteSeo(route, found);
      } else {
        setCurrentPage('not-found');
        setSelectedProduct(null);
        applyRouteSeo({ page: 'not-found', path: route.path });
      }
    } else if (route.page === 'global-reach') {
      setCurrentPage('global-reach');
      setSelectedProduct(null);
      setBlogArticleSlug(null);
      applyRouteSeo(route);
    } else if (route.page === 'quality') {
      setCurrentPage('quality');
      setSelectedProduct(null);
      setBlogArticleSlug(null);
      applyRouteSeo(route);
    } else if (route.page === 'blog') {
      setSelectedProduct(null);
      if (route.blogSlug) {
        const allPosts = AdminStorage.getBlogPosts();
        const found = allPosts.find((p) => p.slug === route.blogSlug || p.id === route.blogSlug) || BLOG_POSTS.find((p) => p.slug === route.blogSlug);
        if (found) {
          setCurrentPage('blog');
          setBlogArticleSlug(route.blogSlug);
          applyRouteSeo(route, null, found);
        } else {
          setCurrentPage('not-found');
          setBlogArticleSlug(null);
          applyRouteSeo({ page: 'not-found', path: route.path });
        }
      } else {
        setCurrentPage('blog');
        setBlogArticleSlug(null);
        applyRouteSeo(route);
      }
    } else if (route.page === 'contact') {
      setCurrentPage('contact');
      setSelectedProduct(null);
      setBlogArticleSlug(null);
      applyRouteSeo(route);
    } else if (route.page === 'meeting') {
      setCurrentPage('meeting');
      setSelectedProduct(null);
      setBlogArticleSlug(null);
      applyRouteSeo(route);
    } else if (route.page === 'admin') {
      setCurrentPage('admin');
      applyRouteSeo(route);
    } else if (route.page === 'legal') {
      if (route.legalType) {
        setActiveLegalType(route.legalType);
      }
      setLegalModalOpen(true);
      applyRouteSeo(route);
    } else if (route.page === 'not-found') {
      setCurrentPage('not-found');
      setSelectedProduct(null);
      setBlogArticleSlug(null);
      applyRouteSeo(route);
    }
  }, [applyRouteSeo]);

  // Synchronize on mount and handle HTML5 popstate, hash changes, and live DB updates
  useEffect(() => {
    syncRouteState();
    AdminStorage.syncProductsFromServer().catch(() => {});

    const handlePopState = () => {
      syncRouteState();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    window.addEventListener('origintra_products_updated', handlePopState);
    window.addEventListener('origintra_blog_updated', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('origintra_products_updated', handlePopState);
      window.removeEventListener('origintra_blog_updated', handlePopState);
    };
  }, [syncRouteState]);

  const handleNavigate = useCallback((target: string) => {
    const cleanPath = getHref(target);
    if (window.location.pathname !== cleanPath || window.location.hash) {
      window.history.pushState(null, '', cleanPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    syncRouteState();
  }, [syncRouteState]);

  const handleOpenProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
    const cleanPath = ROUTES.productDetail(product.slug);
    if (window.location.pathname !== cleanPath || window.location.hash) {
      window.history.pushState(null, '', cleanPath);
    }
    updatePageSeo(getProductSeo(product));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuoteWithProduct = (productName: string) => {
    setPrefilledProduct(productName);
    setQuoteModalOpen(true);
  };

  const handleOpenGeneralQuote = () => {
    setPrefilledProduct('Red Chilli');
    setQuoteModalOpen(true);
  };

  const handleOpenLegal = (type: 'privacy' | 'terms' | 'shipping' | 'cookies') => {
    setActiveLegalType(type);
    setLegalModalOpen(true);
    const cleanPath = getHref(`legal-${type}`);
    if (window.location.pathname !== cleanPath || window.location.hash) {
      window.history.pushState(null, '', cleanPath);
    }
  };

  const handleCloseLegal = () => {
    setLegalModalOpen(false);
    const parsed = parseCurrentRoute();
    if (parsed.page === 'legal') {
      const returnPath = currentPage === 'home' ? '/' : `/${currentPage}`;
      window.history.replaceState(null, '', returnPath);
      syncRouteState();
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-[#0070E0] selection:text-white antialiased">
      
      {/* Navbar Fix: keep the sticky corporate navbar visible while hiding it on the admin page. */}
      {currentPage !== 'admin' && (
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onOpenQuote={handleOpenGeneralQuote}
        />
      )}

      {/* Main Routed Page Content */}
      <main className="flex-1">
        {currentPage === 'home' ? (
          <HomePage
            onNavigate={handleNavigate}
            onOpenProductDetail={handleOpenProductDetail}
            onOpenQuoteWithProduct={handleOpenQuoteWithProduct}
            onOpenGeneralQuote={handleOpenGeneralQuote}
          />
        ) : (
          <Suspense fallback={<PageLoadingFallback />}>
            {currentPage === 'about' && (
              <AboutPage
                onNavigate={handleNavigate}
                onOpenQuote={handleOpenGeneralQuote}
              />
            )}

            {currentPage === 'products' && (
              <ProductsPage
                onOpenProductDetail={handleOpenProductDetail}
                onOpenQuoteWithProduct={handleOpenQuoteWithProduct}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'product-detail' && selectedProduct && (
              <ProductDetailPage
                product={selectedProduct}
                onBack={() => handleNavigate('products')}
                onOpenQuoteWithProduct={handleOpenQuoteWithProduct}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'global-reach' && (
              <GlobalReachPage
                onNavigate={handleNavigate}
                onOpenQuote={handleOpenGeneralQuote}
              />
            )}

            {currentPage === 'quality' && (
              <QualityPage
                onNavigate={handleNavigate}
                onOpenQuote={handleOpenGeneralQuote}
              />
            )}

            {currentPage === 'blog' && (
              <BlogPage
                initialSlug={blogArticleSlug}
                onNavigate={handleNavigate}
                onOpenQuote={handleOpenGeneralQuote}
              />
            )}

            {currentPage === 'contact' && (
              <ContactPage
                onNavigate={handleNavigate}
                onOpenQuote={handleOpenGeneralQuote}
              />
            )}

            {currentPage === 'meeting' && (
              <MeetingPage
                onNavigate={handleNavigate}
                onOpenQuote={handleOpenGeneralQuote}
              />
            )}

            {currentPage === 'admin' && (
              <AdminPage
                onNavigate={handleNavigate}
                onOpenProductDetail={handleOpenProductDetail}
              />
            )}

            {currentPage === 'not-found' && (
              <NotFoundPage
                onNavigate={handleNavigate}
                onOpenQuote={handleOpenGeneralQuote}
              />
            )}
          </Suspense>
        )}
      </main>

      {/* Multi-column Corporate Footer (hidden on admin page) */}
      {currentPage !== 'admin' && (
        <Footer
          onNavigate={handleNavigate}
          onOpenQuote={handleOpenGeneralQuote}
          onOpenLegal={handleOpenLegal}
        />
      )}

      {/* Commercial Quotation (RFQ) Modal */}
      {quoteModalOpen && (
        <Suspense fallback={null}>
          <QuoteModal
            isOpen={quoteModalOpen}
            onClose={() => setQuoteModalOpen(false)}
            prefilledProduct={prefilledProduct}
          />
        </Suspense>
      )}

      {/* Legal Policies Modal */}
      {legalModalOpen && (
        <Suspense fallback={null}>
          <LegalModal
            isOpen={legalModalOpen}
            onClose={handleCloseLegal}
            policyType={activeLegalType}
          />
        </Suspense>
      )}

      {/* Professional Floating WhatsApp Action Button (Left Side - hidden on admin page) */}
      {currentPage !== 'admin' && (
        <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-40">
          <a
            href={companyConfig.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 aspect-square shrink-0 rounded-full bg-gradient-to-tr from-[#20ba59] to-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Direct WhatsApp Trade Desk"
          >
            {/* Authentic WhatsApp Icon */}
            <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-white" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.031 2C6.496 2 2 6.496 2 12.031c0 1.767.46 3.49 1.332 5.006L2 22l5.105-1.339a9.98 9.98 0 004.926 1.282h.005c5.535 0 10.03-4.496 10.03-10.031A10.024 10.024 0 0012.031 2zm0 18.369c-1.503 0-2.977-.404-4.264-1.168l-.306-.182-3.17.832.846-3.09-.199-.317A8.344 8.344 0 013.662 12.03c0-4.614 3.755-8.369 8.369-8.369 2.235 0 4.337.871 5.918 2.452a8.324 8.324 0 012.451 5.918c0 4.615-3.755 8.37-8.369 8.37zm4.588-6.265c-.252-.126-1.488-.734-1.719-.818-.231-.084-.399-.126-.567.126-.168.252-.651.818-.798.986-.147.168-.294.189-.546.063-.252-.126-1.063-.392-2.025-1.25-.749-.668-1.255-1.493-1.402-1.745-.147-.252-.016-.388.11-.514.113-.113.252-.294.378-.441.126-.147.168-.252.252-.42.084-.168.042-.315-.021-.441-.063-.126-.567-1.365-.777-1.869-.205-.491-.413-.424-.567-.432l-.483-.008c-.168 0-.441.063-.672.315-.231.252-.882.861-.882 2.1 0 1.239.903 2.436 1.029 2.604.126.168 1.777 2.713 4.305 3.805.602.26 1.072.415 1.439.532.605.192 1.155.165 1.59.1.485-.072 1.488-.609 1.698-1.197.21-.588.21-1.092.147-1.197-.063-.105-.231-.168-.483-.294z" />
            </svg>

            {/* Online notification badge dot */}
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white"></span>
            </span>

            {/* Professional Floating Tooltip (Opens to the right, desktop only) */}
            <div className="hidden sm:flex absolute left-16 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-[#0A1C3E] text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none -translate-x-2 group-hover:translate-x-0 border border-slate-700/60 items-center gap-2">
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#0A1C3E] rotate-45 border-l border-b border-slate-700/60"></div>
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
              <span>WhatsApp Trade Desk</span>
            </div>
          </a>
        </div>
      )}

      {/* Floating Scroll to Top Action Button (Right Side - hidden on admin page) */}
      {currentPage !== 'admin' && (
        <div className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 aspect-square shrink-0 rounded-full bg-[#0A1C3E] hover:bg-[#0070E0] text-white shadow-[0_4px_20px_rgba(10,28,62,0.35)] hover:shadow-[0_8px_30px_rgba(0,112,224,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border border-blue-900/60"
            aria-label="Scroll to top of page"
            title="Back to Top"
          >
            <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-y-0.5 transition-transform" />
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-slate-200 group-hover:text-white leading-none mt-0.5">Top</span>

            {/* Tooltip on hover (desktop only) */}
            <div className="hidden sm:flex absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0A1C3E] text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-2 group-hover:translate-x-0 border border-slate-700/60 items-center gap-1.5">
              <span>Back to Top</span>
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-[#0A1C3E] rotate-45 border-r border-t border-slate-700/60"></div>
            </div>
          </button>
        </div>
      )}

    </div>
  );
};

export default App;
