import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowUpRight, ArrowRight, MapPin, Sparkles, Layers, ShieldCheck, Check } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../data/products';
import { Product } from '../types';
import { AdminStorage } from '../services/adminStorage';
import { ProductImage } from '../components/ProductImage';
import { formatCardOrigin, getDisplayExportForms, formatSupplyGrade } from '../utils/productHelpers';

interface ProductsPageProps {
  onOpenProductDetail: (product: Product) => void;
  onOpenQuoteWithProduct: (productName: string) => void;
  onNavigate: (page: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  onOpenProductDetail,
  onOpenQuoteWithProduct,
  onNavigate
}) => {
  const [products, setProducts] = useState<Product[]>(() => AdminStorage.getProducts());
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // Keep local state in sync with server catalog
    AdminStorage.syncProductsFromServer().then((prods) => {
      if (Array.isArray(prods) && prods.length > 0) {
        setProducts(prods);
      }
    }).catch(() => {});

    const handleUpdate = () => {
      setProducts(AdminStorage.getProducts());
    };
    window.addEventListener('origintra_products_updated', handleUpdate);
    return () => window.removeEventListener('origintra_products_updated', handleUpdate);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      counts[p.categoryKey] = (counts[p.categoryKey] || 0) + 1;
    });
    return counts;
  }, [products]);

  const currentCategory = useMemo(() => {
    return PRODUCT_CATEGORIES.find(c => c.key === selectedCategoryKey) || PRODUCT_CATEGORIES[0];
  }, [selectedCategoryKey]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      const matchesCategory = selectedCategoryKey === 'all' || product.categoryKey === selectedCategoryKey;

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        product.name.toLowerCase().includes(q) ||
        (product.botanicalName && product.botanicalName.toLowerCase().includes(q)) ||
        (product.tagline && product.tagline.toLowerCase().includes(q)) ||
        product.shortDescription.toLowerCase().includes(q) ||
        product.origin.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        (product.grade && product.grade.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryKey, searchQuery]);

  return (
    <div className="bg-white text-[#0F172A] min-h-[70vh]">
      
      {/* 1. Page Hero */}
      <section className="relative overflow-hidden bg-[#0A1C3E] text-white py-12 sm:py-20 md:py-28">
        <div className="container-x mx-auto max-w-[1440px] relative">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
              Complete Export Portfolio • {products.length} Indian Spice Varieties
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-white">
              Export Spices, Seeds & Masala Blends<span className="text-[#0070E0]">.</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed pt-1 sm:pt-2">
              Directly sourced from contracted regional farms across India. Available in whole harvest grades, sortex-cleaned seeds, and mill-controlled powders for international food manufacturers, spice grinders, and distributors.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Filter and Search Bar (Sticky) */}
      <section className="border-b border-slate-200 bg-white/95 sticky top-16 z-20 backdrop-blur-md py-3 sm:py-4 shadow-2xs">
        <div className="container-x mx-auto max-w-[1440px] space-y-3.5">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Category Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none">
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategoryKey(cat.key)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                    selectedCategoryKey === cat.key
                      ? 'bg-[#0070E0] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    selectedCategoryKey === cat.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {categoryCounts[cat.key] ?? 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by spice name, origin, grade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ×
                </button>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* 3. Category Description Intro Banner (When specific category selected) */}
      {selectedCategoryKey !== 'all' && (
        <section className="bg-slate-50 border-b border-slate-200 py-6">
          <div className="container-x mx-auto max-w-[1440px]">
            <div className="max-w-4xl space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
                Category Profile
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-semibold text-[#0F172A]">
                {currentCategory.label}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {currentCategory.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 4. Products Grid */}
      <section className="py-12 sm:py-16">
        <div className="container-x mx-auto max-w-[1440px]">
          
          <div className="flex items-center justify-between mb-6 text-xs text-slate-500">
            <span>
              Showing <span className="font-bold text-slate-800">{filteredProducts.length}</span> of {products.length} export products
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#0070E0] hover:underline font-semibold cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-slate-500 space-y-3">
              <p className="text-lg font-medium">No export products match your selected criteria.</p>
              <button
                onClick={() => { setSelectedCategoryKey('all'); setSearchQuery(''); }}
                className="text-xs font-semibold text-[#0070E0] hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((product, index) => {
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Product Image Link to Specification Page */}
                      <a
                        href={`/products/${product.slug}`}
                        onClick={(e) => {
                          if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                            e.preventDefault();
                            onOpenProductDetail(product);
                          }
                        }}
                        className="block relative aspect-[4/5] overflow-hidden bg-slate-100 cursor-pointer group/image"
                        title={`View ${product.name} specifications`}
                        aria-label={`View ${product.name} specifications`}
                      >
                        <ProductImage
                          src={product.image}
                          alt={product.name}
                          productName={product.name}
                          productId={product.id || product.slug}
                          category={product.category}
                          eager={index < 6}
                        />
                        
                        {/* Category Tag on top right */}
                        <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-[#0A1C3E] text-[11px] font-bold uppercase tracking-wider shadow-xs border border-white/80 pointer-events-none">
                          {product.category}
                        </div>

                        {/* Flagship Badge on top left if applicable */}
                        {product.isFlagship && (
                          <div className="absolute top-3.5 left-3.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider pointer-events-none">
                            Flagship
                          </div>
                        )}
                      </a>

                    {/* Product Info */}
                    <div className="p-4 sm:p-6 space-y-3.5">
                      {/* Origin Belt Eyebrow & Quality Status */}
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <div 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100/90 border border-slate-200/80 text-[11px] font-semibold text-slate-700 min-w-0 flex-1 overflow-hidden"
                          title={product.origin}
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#0070E0] shrink-0" />
                          <span className="truncate">{formatCardOrigin(product.origin)}</span>
                        </div>
                        <span className="inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-50 text-[#0070E0] border border-blue-200/60 shrink-0 font-mono whitespace-nowrap">
                          Export Grade
                        </span>
                      </div>

                      {/* Commodity Title & Botanical Name */}
                      <div>
                        <a
                          href={`/products/${product.slug}`}
                          onClick={(e) => {
                            if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                              e.preventDefault();
                              onOpenProductDetail(product);
                            }
                          }}
                          className="group/title block"
                        >
                          <h3 className="text-xl font-display font-bold text-[#0A1C3E] group-hover/title:text-[#0070E0] transition-colors leading-snug tracking-tight">
                            {product.name}
                          </h3>
                        </a>
                        {product.botanicalName && (
                          <p className="text-[11px] text-slate-500 mt-0.5 font-sans font-medium italic tracking-wide">
                            Botanical: <span>{product.botanicalName}</span>
                          </p>
                        )}
                      </div>

                      {/* Commercial Trade Summary */}
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {product.shortDescription || product.tagline}
                      </p>

                      {/* Trade Specifications Panel */}
                      <div className="rounded-xl bg-slate-50/90 border border-slate-200/80 p-3 grid grid-cols-2 gap-3 text-xs">
                        <div className="min-w-0">
                          <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wider font-sans">
                            Export Forms
                          </span>
                          <span className="text-slate-900 font-bold mt-0.5 block truncate text-xs" title={product.availableForms?.join(', ')}>
                            {getDisplayExportForms(product)}
                          </span>
                        </div>
                        <div className="min-w-0 border-l border-slate-200/80 pl-3">
                          <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wider font-sans">
                            Supply Grade
                          </span>
                          <span className="text-slate-900 font-bold mt-0.5 block truncate text-xs" title={product.grade}>
                            {formatSupplyGrade(product.grade)}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Symmetrical Executive Action Pair */}
                  <div className="p-4 sm:p-6 pt-0 border-t border-slate-100 mt-2 flex items-center gap-2.5">
                    <button
                      onClick={() => onOpenProductDetail(product)}
                      className="flex-1 py-2.5 px-3 min-h-[44px] rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>Specifications</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      onClick={() => onOpenQuoteWithProduct(product.name)}
                      className="flex-1 py-2.5 px-3 min-h-[44px] rounded-xl bg-[#0070E0] hover:bg-[#005bb5] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm hover:shadow"
                    >
                      <span>Request Quote</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
            </div>
          )}

        </div>
      </section>

      {/* 5. Custom Blending & Sourcing Banner */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="container-x mx-auto max-w-[1440px] text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
            Bespoke Export Supply
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#0F172A]">
            Require a custom granulation, mixed container load, or private label packing?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            We support international food brands, seasonings manufacturers, and distributors with customized mesh grinding, steam sterilization, and mixed 20ft/40ft container consignments.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenQuoteWithProduct('Custom Spice Sourcing & Blending')}
              className="btn-pill btn-pill-dark bg-[#0070E0] hover:bg-[#005bb5] text-white px-7 py-3 text-xs sm:text-sm font-semibold cursor-pointer inline-flex items-center space-x-2"
            >
              <span>Consult Our Commercial Export Desk</span>
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
