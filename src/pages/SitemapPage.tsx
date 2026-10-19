import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpRight, 
  FileText, 
  Globe, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  Compass, 
  ExternalLink, 
  Layers, 
  Sparkles, 
  CheckCircle2,
  FolderTree,
  ChevronRight
} from 'lucide-react';
import { PRODUCTS, PRODUCT_CATEGORIES } from '../data/products';
import { BLOG_POSTS } from '../data/blog';
import { getHref } from '../utils/routes';

interface SitemapPageProps {
  onNavigate: (page: string) => void;
  onOpenQuote: () => void;
}

export const SitemapPage: React.FC<SitemapPageProps> = ({ onNavigate, onOpenQuote }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return PRODUCTS;
    const term = searchTerm.toLowerCase();
    return PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      (p.botanicalName && p.botanicalName.toLowerCase().includes(term)) ||
      (p.tagline && p.tagline.toLowerCase().includes(term))
    );
  }, [searchTerm]);

  // Group filtered products by categoryKey
  const categorizedProducts = useMemo(() => {
    const map: Record<string, typeof PRODUCTS> = {
      'whole-spices': [],
      'ground-spices': [],
      'seeds': [],
      'blends': []
    };

    filteredProducts.forEach(p => {
      const key = p.categoryKey || 'whole-spices';
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });

    return map;
  }, [filteredProducts]);

  // Filter blog posts
  const filteredBlogs = useMemo(() => {
    if (!searchTerm.trim()) return BLOG_POSTS;
    const term = searchTerm.toLowerCase();
    return BLOG_POSTS.filter(b => 
      b.title.toLowerCase().includes(term) ||
      b.excerpt.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const corporateLinks = [
    { name: 'Home — Primary Commercial Gateway', path: '/', target: 'home', desc: 'Main corporate landing, commodity showcase, and company overview' },
    { name: 'About Origintra Exim', path: '/about', target: 'about', desc: 'Company history, agricultural infrastructure, leadership, and ethical sourcing' },
    { name: 'Export Products Catalog', path: '/products', target: 'products', desc: 'Complete 26-product export catalog with Sortex grading and specifications' },
    { name: 'Quality Assurance & Lab COA', path: '/quality', target: 'quality', desc: 'FSSAI, Spices Board, APEDA compliance, pesticide testing, and moisture control' },
    { name: 'Global Reach & Logistics Ports', path: '/global-reach', target: 'global-reach', desc: 'Shipping from Mundra, Nhava Sheva & Cochin to 24+ global destinations' },
    { name: 'Market Intelligence & Blog', path: '/blog', target: 'blog', desc: 'Industry insights, crop harvest updates, and spice import guides' },
    { name: 'Commercial Trade Desk & Contact', path: '/contact', target: 'contact', desc: 'Direct corporate email, WhatsApp trade hotline, and registered office in Gujarat' },
    { name: 'Schedule Video Consultation', path: '/schedule-meeting', target: 'meeting', desc: 'Book a direct video conference with our international trade desk' }
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy-policy', target: 'legal-privacy', desc: 'Buyer data protection, inquiries processing, and GDPR compliance' },
    { name: 'Terms of Service', path: '/terms-of-service', target: 'legal-terms', desc: 'Commercial Incoterms (FOB/CIF), contract governance, and dispute resolution' },
    { name: 'Shipping & Container Policy', path: '/shipping-policy', target: 'legal-shipping', desc: 'FCL/LCL ocean freight, seaworthy packaging, and phytosanitary clearance' },
    { name: 'Cookie Policy', path: '/cookie-policy', target: 'legal-cookies', desc: 'Website functional preferences and anonymous analytics usage' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* 1. Header & Hero Section */}
      <section className="bg-[#0A1C3E] text-white pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="container-x mx-auto max-w-[1440px] relative z-10 px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-xs text-slate-300 mb-6" aria-label="Breadcrumb">
            <button 
              onClick={() => onNavigate('home')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#38BDF8] font-semibold">Sitemap</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-[#38BDF8] text-xs font-semibold tracking-wider uppercase mb-4">
              <FolderTree className="w-3.5 h-3.5" />
              Website Directory &amp; Navigation Index
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-white tracking-tight mb-4 leading-tight">
              Origintra Exim Sitemap
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              Explore the complete structure of the Origintra Exim platform. Direct navigation links to our 26 export spice varieties, laboratory testing protocols, logistics capabilities, market intelligence, and legal policies.
            </p>

            {/* Quick Instant Filter Input */}
            <div className="relative max-w-xl">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products, categories, articles, or policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:border-transparent transition-all shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 px-2 py-1 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Search Engine XML Sitemap Card */}
      <div className="container-x mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Machine-Readable XML
              </span>
              <span className="text-xs text-slate-400">Googlebot &amp; Bingbot Ready</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
              Raw Search Engine XML Sitemap File
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Standardized XML index structured to Sitemaps.org 0.9 schema with Google Image extensions, priority scores (1.00 max for Home), change frequency tags, and verified image metadata.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0070E0] hover:bg-[#005bb5] text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
            >
              <span>View Raw XML Sitemap</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onOpenQuote}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors"
            >
              <span>Request Quote</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Sitemap Directory Sections */}
      <div className="container-x mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 mt-12 space-y-12">

        {/* Section A: Product Catalog (26 Spices) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0070E0]" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                  Export Spices Catalog
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                26 premium Indian export commodities sorted by category with direct links to specifications
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              {filteredProducts.length} Products
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCT_CATEGORIES.filter(c => c.key !== 'all').map(cat => {
              const items = categorizedProducts[cat.key] || [];
              if (items.length === 0 && searchTerm) return null;

              return (
                <div key={cat.key} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
                  <div className="border-b border-slate-100 pb-3 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0070E0]">
                      Category
                    </span>
                    <h3 className="text-base font-bold text-slate-900 font-serif">
                      {cat.label}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <ul className="space-y-2 flex-1">
                    {items.map(product => (
                      <li key={product.id}>
                        <a
                          href={getHref(`product-${product.slug}`)}
                          onClick={(e) => {
                            if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                              e.preventDefault();
                              onNavigate(`product-${product.slug}`);
                            }
                          }}
                          className="group flex items-start justify-between p-2 rounded-lg hover:bg-blue-50/70 transition-colors cursor-pointer text-left"
                        >
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-[#0070E0] transition-colors block">
                              {product.name}
                            </span>
                            {product.botanicalName && (
                              <span className="text-[11px] text-slate-400 italic block">
                                {product.botanicalName}
                              </span>
                            )}
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#0070E0] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
                        </a>
                      </li>
                    ))}
                    {items.length === 0 && (
                      <li className="text-xs text-slate-400 italic py-2">
                        No products match current filter
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section B: Corporate & International Logistics */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#0070E0]" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                Corporate &amp; Global Trade Portals
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Primary operational gateways, company credentials, certifications, and trade inquiry portals
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {corporateLinks.map(link => (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                    e.preventDefault();
                    onNavigate(link.target);
                  }
                }}
                className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400">{link.path}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#0070E0] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0070E0] transition-colors">
                    {link.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {link.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Section C: Market Intelligence & Technical Reports (Blog) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0070E0]" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                  Market Intelligence &amp; Technical Articles
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                In-depth export guides, Indian agricultural market trends, and import compliance documentation
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              {filteredBlogs.length} Articles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredBlogs.map(blog => (
              <a
                key={blog.id}
                href={getHref(`blog-${blog.slug}`)}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                    e.preventDefault();
                    onNavigate(`blog-${blog.slug}`);
                  }
                }}
                className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400">/blog/{blog.slug}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#0070E0] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0070E0] transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{blog.readTime || '5 min read'}</span>
                  <span className="text-[#0070E0] font-semibold group-hover:underline">Read Article</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Section D: Legal Compliance & Trade Governance */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0070E0]" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                Legal Policies &amp; Commercial Compliance
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              International trade regulations, Incoterms governance, data privacy, and container logistics policies
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {legalLinks.map(link => (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                    e.preventDefault();
                    onNavigate(link.target);
                  }
                }}
                className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400">{link.path}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#0070E0] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0070E0] transition-colors">
                    {link.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {link.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
