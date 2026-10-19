import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Package, 
  Layers, 
  Truck, 
  HelpCircle, 
  MapPin, 
  Compass,
  FileCheck
} from 'lucide-react';
import { Product } from '../types';
import { useCompanyConfig } from '../hooks/useCompanyConfig';
import { ProductImage } from '../components/ProductImage';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onOpenQuoteWithProduct: (productName: string) => void;
  onNavigate: (page: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onOpenQuoteWithProduct,
  onNavigate
}) => {
  const COMPANY_CONFIG = useCompanyConfig();
  const [specsExpanded, setSpecsExpanded] = useState<boolean>(true);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Pre-filled WhatsApp inquiry link for current commodity
  const whatsappNumber = (COMPANY_CONFIG.whatsapp || '+917069182990').replace(/[^0-9]/g, '');
  const whatsappMessage = encodeURIComponent(
    `Hello Origintra Exim, I am interested in bulk export inquiry for ${product.name}. Please share technical specifications, export pricing, and MOQ.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="bg-white text-[#0F172A] pb-20 sm:pb-24 lg:pb-0">
      
      {/* 1. PRODUCT HERO & NAVIGATION */}
      <section className="bg-slate-50 border-b border-slate-200 pt-8 pb-16">
        <div className="container-x mx-auto max-w-[1440px]">
          
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-slate-500 mb-8 font-medium">
            <a
              href="/"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  onNavigate('home');
                }
              }}
              className="hover:text-[#0070E0] transition"
            >
              Home
            </a>
            <span>/</span>
            <a
              href="/products"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  onBack();
                }
              }}
              className="hover:text-[#0070E0] transition"
            >
              Products
            </a>
            <span>/</span>
            <span className="text-slate-800 font-semibold" aria-current="page">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Hero */}
            <div className="lg:col-span-6">
              <div className="relative aspect-[4/5] max-h-[560px] mx-auto rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  productName={product.name}
                  productId={product.id || product.slug}
                  category={product.category}
                  eager={true}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-[#0A1C3E]/85 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 pointer-events-none">
                  <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>{product.origin}</span>
                </div>
              </div>
            </div>

            {/* Product Hero Info */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
                    {product.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Indian Spice Exporter & Bulk Supply
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-[#0F172A] tracking-tight mt-2">
                  {product.name}
                </h1>
                {product.botanicalName && (
                  <p className="text-sm font-serif italic text-slate-500 mt-1">
                    Botanical Name: {product.botanicalName}
                  </p>
                )}
              </div>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                {product.shortDescription}
              </p>

              <div className="grid grid-cols-2 gap-4 border-y border-slate-200 py-5 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block font-medium">Primary Origin</span>
                  <strong className="text-slate-800 font-semibold">{product.origin}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Export Packing</span>
                  <strong className="text-slate-800 font-semibold">Seaworthy Multi-ply Bags / Cartons</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Sample Status</span>
                  <strong className="text-slate-800 font-semibold">{product.exportInfo.sampleAvailability}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Container Capacity</span>
                  <strong className="text-slate-800 font-semibold">{product.exportInfo.containerCapacity.split(';')[0]}</strong>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <button
                  onClick={() => onOpenQuoteWithProduct(product.name)}
                  className="btn-pill btn-pill-dark bg-[#0A1C3E] hover:bg-[#0070E0] text-white px-5 sm:px-7 py-3 text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center space-x-1.5 sm:space-x-2 cursor-pointer w-full sm:w-auto"
                >
                  <span className="hidden sm:inline">Request a Quote for {product.name}</span>
                  <span className="sm:hidden">Request a Quote</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onBack}
                  className="btn-pill border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-100 text-slate-800 hover:text-[#0A1C3E] px-5 sm:px-6 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-1.5 sm:space-x-2 cursor-pointer w-full sm:w-auto shadow-2xs transition-all"
                >
                  <ArrowLeft className="w-4 h-4 mr-0.5 text-slate-700" />
                  <span className="text-slate-800 font-semibold">Back to Catalog</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 2. PRODUCT OVERVIEW & APPLICATIONS */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="container-x mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Overview */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
                Commercial Overview
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#0F172A]">
                Product Description & Sourcing Context
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                {product.fullDescription}
              </p>

              {/* Available Forms */}
              <div className="pt-4 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Available Forms & Cuts:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.availableForms.map((form, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-center space-x-2.5 text-xs sm:text-sm font-medium ${
                        form.toLowerCase().includes('powder')
                          ? 'border-blue-200 bg-blue-50/70 text-[#0A1C3E]'
                          : 'border-slate-200 bg-slate-50 text-slate-800'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${form.toLowerCase().includes('powder') ? 'text-[#0070E0]' : 'text-slate-500'}`} />
                      <span>{form}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dedicated Powder Form Milling Details */}
              {product.powderDetails && (
                <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-blue-50/60 to-white border border-blue-200 space-y-4">
                  <div className="flex items-center space-x-2 text-[#0070E0]">
                    <Layers className="w-5 h-5" />
                    <h3 className="text-base font-bold text-[#0A1C3E]">
                      Powder Form & Milling Capabilities
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-500 block">Mesh Sizing:</span>
                      <p className="font-medium text-slate-900 mt-0.5">{product.powderDetails.meshSize}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block">Grinding Technique:</span>
                      <p className="font-medium text-slate-900 mt-0.5">{product.powderDetails.grindingMethod}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block">Moisture Ceiling:</span>
                      <p className="font-medium text-slate-900 mt-0.5">{product.powderDetails.moistureCeiling}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block">Purity Assurance:</span>
                      <p className="font-medium text-slate-900 mt-0.5">{product.powderDetails.purityGuarantee}</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => onOpenQuoteWithProduct(`${product.name} (Powder Form)`)}
                      className="btn-pill btn-pill-dark bg-[#0A1C3E] hover:bg-[#0070E0] text-white text-xs font-semibold py-2 px-5 cursor-pointer flex items-center space-x-1.5"
                    >
                      <span>Enquire Specifically for Powder Form</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Applications & Packaging Options */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Applications Box */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center space-x-2 text-[#0070E0]">
                  <Layers className="w-5 h-5" />
                  <h3 className="text-base font-bold text-[#0F172A]">Primary Applications</h3>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  {product.applications.map((app, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-[#0070E0] font-bold">•</span>
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Packaging Options */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center space-x-2 text-[#0070E0]">
                  <Package className="w-5 h-5" />
                  <h3 className="text-base font-bold text-[#0F172A]">Packaging Options</h3>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  {product.packagingOptions.map((pkg, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-[#0070E0] font-bold">•</span>
                      <span>{pkg}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. PRODUCT SPECIFICATIONS (Expandable Factual Information) */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="container-x mx-auto max-w-[1440px]">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
                Technical Parameters
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold text-[#0F172A] mt-1">
                Factual Product Specifications
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Analytical parameters verified prior to export dispatch. Parameter variances confirmed per contract.
              </p>
            </div>

            <button
              onClick={() => setSpecsExpanded(!specsExpanded)}
              className="text-xs font-semibold text-[#0070E0] hover:text-[#0A1C3E] flex items-center space-x-1 py-1.5 px-3 bg-white rounded-lg border border-slate-200 sm:border-0 sm:bg-transparent sm:p-2 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <span>{specsExpanded ? 'Collapse' : 'Expand'} Specifications</span>
              {specsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {specsExpanded && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100 animate-in fade-in duration-200">
              {product.specifications.map((spec, idx) => (
                <div
                  key={idx}
                  className="px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-1 sm:gap-2"
                >
                  <span className="font-semibold text-slate-700 sm:w-1/3">
                    {spec.label}
                  </span>
                  <span className={`sm:w-2/3 break-words ${spec.value.includes('Available on request') ? 'text-slate-500 italic' : 'text-slate-900 font-medium'}`}>
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 text-xs text-slate-500 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#0070E0] shrink-0" />
            <span>
              {COMPANY_CONFIG.complianceStatement} Special laboratory analyses (pesticide residues, aflatoxins, microbial counts) conducted at NABL accredited facilities on request.
            </span>
          </div>

        </div>
      </section>

      {/* 4. QUALITY PROCESS & EXPORT INFORMATION */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="container-x mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Quality Process */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
                Standard Operating Procedure
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#0F172A]">
                Quality Evaluation & Handling
              </h2>
              <div className="space-y-4">
                {product.qualityProcess.map((proc, idx) => (
                  <div key={idx} className="flex items-start space-x-3.5">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-[#0070E0] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      0{idx + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {proc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Information */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
                Commercial Details
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#0F172A]">
                Export Logistics & Terms
              </h2>
              
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row justify-between pb-3 border-b border-slate-200 gap-1">
                  <span className="font-semibold text-slate-700">Minimum Order Quantity (MOQ):</span>
                  <span className="text-slate-900 font-medium">{product.exportInfo.minimumOrderQuantity}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between pb-3 border-b border-slate-200 gap-1">
                  <span className="font-semibold text-slate-700">Container Loading Capacity:</span>
                  <span className="text-slate-900 font-medium">{product.exportInfo.containerCapacity}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between pb-3 border-b border-slate-200 gap-1">
                  <span className="font-semibold text-slate-700">Production & Dispatch Lead Time:</span>
                  <span className="text-slate-900 font-medium">{product.exportInfo.leadTime}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between pb-3 border-b border-slate-200 gap-1">
                  <span className="font-semibold text-slate-700">Sample Availability:</span>
                  <span className="text-slate-900 font-medium">{product.exportInfo.sampleAvailability}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-1">
                  <span className="font-semibold text-slate-700">Supported Incoterms:</span>
                  <span className="text-slate-900 font-medium">{product.exportInfo.incoterms}</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="container-x mx-auto max-w-[1440px]">
          
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
              Buyer Inquiries
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[#0F172A] mt-1">
              Frequently Asked Questions About {product.name}
            </h2>
          </div>

          <div className="max-w-3xl space-y-4">
            {product.faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-semibold text-slate-900 hover:text-[#0070E0] transition"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. BOTTOM RFQ CALLOUT */}
      <section className="py-16 bg-[#0A1C3E] text-white">
        <div className="container-x mx-auto max-w-[1440px] text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-white tracking-tight">
            Order Evaluation or Commercial Quote for {product.name}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Contact our export trade desk with your target specifications, container quantity, and destination discharge port.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenQuoteWithProduct(product.name)}
              className="btn-pill btn-pill-dark bg-[#0070E0] hover:bg-[#005bb5] text-white px-5 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold shadow-md flex items-center space-x-1.5 sm:space-x-2 mx-auto cursor-pointer"
            >
              <span className="hidden sm:inline">Request Quote for {product.name}</span>
              <span className="sm:hidden">Request Quote</span>
              <ArrowUpRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. STICKY ACTION BAR FOR MOBILE & TABLET */}
      <aside 
        aria-label="Product quick action bar"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-8px_25px_rgba(15,23,42,0.12)] px-3.5 py-2.5 sm:px-6 sm:py-3 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="max-w-2xl mx-auto flex items-center gap-2.5 sm:gap-3.5">
          {/* WhatsApp Direct Action Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[46px] py-2.5 px-3 sm:py-3 sm:px-4 rounded-xl bg-gradient-to-r from-[#20ba59] to-[#25D366] hover:from-[#1da850] hover:to-[#22bf5b] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            aria-label={`Inquire about ${product.name} on WhatsApp`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.031 2C6.496 2 2 6.496 2 12.031c0 1.767.46 3.49 1.332 5.006L2 22l5.105-1.339a9.98 9.98 0 004.926 1.282h.005c5.535 0 10.03-4.496 10.03-10.031A10.024 10.024 0 0012.031 2zm0 18.369c-1.503 0-2.977-.404-4.264-1.168l-.306-.182-3.17.832.846-3.09-.199-.317A8.344 8.344 0 013.662 12.03c0-4.614 3.755-8.369 8.369-8.369 2.235 0 4.337.871 5.918 2.452a8.324 8.324 0 012.451 5.918c0 4.615-3.755 8.37-8.369 8.37zm4.588-6.265c-.252-.126-1.488-.734-1.719-.818-.231-.084-.399-.126-.567.126-.168.252-.651.818-.798.986-.147.168-.294.189-.546.063-.252-.126-1.063-.392-2.025-1.25-.749-.668-1.255-1.493-1.402-1.745-.147-.252-.016-.388.11-.514.113-.113.252-.294.378-.441.126-.147.168-.252.252-.42.084-.168.042-.315-.021-.441-.063-.126-.567-1.365-.777-1.869-.205-.491-.413-.424-.567-.432l-.483-.008c-.168 0-.441.063-.672.315-.231.252-.882.861-.882 2.1 0 1.239.903 2.436 1.029 2.604.126.168 1.777 2.713 4.305 3.805.602.26 1.072.415 1.439.532.605.192 1.155.165 1.59.1.485-.072 1.488-.609 1.698-1.197.21-.588.21-1.092.147-1.197-.063-.105-.231-.168-.483-.294z" />
            </svg>
            <span className="truncate">WhatsApp</span>
          </a>

          {/* Request Quote Action Button */}
          <button
            onClick={() => onOpenQuoteWithProduct(product.name)}
            className="flex-1 min-h-[46px] py-2.5 px-3 sm:py-3 sm:px-4 rounded-xl bg-[#0070E0] hover:bg-[#005bb5] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            <span className="truncate">Request Quote</span>
            <ArrowUpRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </aside>

    </div>
  );
};
