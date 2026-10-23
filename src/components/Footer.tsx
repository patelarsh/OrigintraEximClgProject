import React from 'react';
import { 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  FileText,
  CreditCard
} from 'lucide-react';
import { useCompanyConfig } from '../hooks/useCompanyConfig';
import { getHref } from '../utils/routes';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenQuote: () => void;
  onOpenLegal?: (type: 'privacy' | 'terms' | 'shipping' | 'cookies') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenQuote: _onOpenQuote,
  onOpenLegal
}) => {
  const COMPANY_CONFIG = useCompanyConfig();

  const handleNav = (page: string) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLegal = (type: 'privacy' | 'terms' | 'shipping' | 'cookies') => {
    if (onOpenLegal) {
      onOpenLegal(type);
    } else {
      onNavigate(getHref(`legal-${type}`));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative w-full overflow-hidden bg-white text-slate-700">
      {/* 1. Top Vibrant Maritime Blue Accent Strip */}
      <div className="w-full h-[3px] bg-gradient-to-r from-[#0055B3] via-[#00A3FF] to-[#0052B4] shadow-[0_2px_8px_rgba(0,112,224,0.25)] relative z-20" />

      {/* 2. Main Light Body Section */}
      <div className="relative bg-white pt-10 sm:pt-14 pb-10 sm:pb-12">
        {/* Background Visual 1: Subtle Dotted World Map Network (top right) */}
        <div className="absolute right-0 top-0 w-full max-w-[650px] h-[85%] pointer-events-none select-none hidden md:block opacity-[0.09] overflow-hidden z-0">
          <img
            src="/assets/dotted-world-map.svg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-contain object-top-right"
          />
        </div>

        {/* Background Visual 2: Maritime Cargo Ship & Authentic Indian Spices Artwork (bottom right) */}
        <div className="absolute right-0 bottom-0 pointer-events-none select-none hidden lg:block z-0 overflow-hidden">
          <picture>
            <source srcSet="/assets/footer/footer-artwork@2x.webp 2x, /assets/footer/footer-artwork.webp 1x" type="image/webp" />
            <img
              src="/assets/footer/footer-artwork.png"
              alt=""
              aria-hidden="true"
              className="h-[240px] xl:h-[280px] w-auto object-contain object-bottom-right"
              loading="lazy"
            />
          </picture>
        </div>

        {/* 3. Main Footer Content 4-Column Grid */}
        <div className="container-x mx-auto max-w-[1440px] relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10">
            
            {/* Column 1: Brand Logo, Description, Social Media & Statutory Accreditations (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-4">
              <a
                href={getHref('home')}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                    e.preventDefault();
                    handleNav('home');
                  }
                }}
                className="inline-block group"
              >
                <img
                  src="/assets/logo/origintra-official-logo.webp?v=2"
                  alt="Origintra Exim — Connecting Markets. Moving Possibilities."
                  width="180"
                  height="56"
                  loading="lazy"
                  decoding="async"
                  className="h-11 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/logo/origintra-official-logo.png?v=2';
                  }}
                />
              </a>

              <p className="text-sm text-slate-600 leading-relaxed font-normal max-w-sm">
                Origintra Exim is committed to connecting global markets through high-quality Indian spices and reliable import-export services.
              </p>

              {/* 5 Social Channels in Circular Light-Blue Pills */}
              <div className="flex items-center space-x-2.5 pt-1">
                {/* LinkedIn */}
                <a
                  href={COMPANY_CONFIG.linkedinUrl || "https://www.linkedin.com/company/origintra-exim"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EBF3FC] hover:bg-[#0070E0] text-[#0070E0] hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href={COMPANY_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EBF3FC] hover:bg-[#0070E0] text-[#0070E0] hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="Instagram"
                  title="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={COMPANY_CONFIG.facebookUrl || "https://www.facebook.com/origintra.exim"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EBF3FC] hover:bg-[#0070E0] text-[#0070E0] hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@origintra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EBF3FC] hover:bg-[#0070E0] text-[#0070E0] hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="YouTube"
                  title="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* X (Twitter) */}
                <a
                  href="https://twitter.com/origintra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EBF3FC] hover:bg-[#0070E0] text-[#0070E0] hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="X (Twitter)"
                  title="X (Twitter)"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>

              {/* Statutory Licenses & Certifications Badges Row with Vertical Dividers */}
              <div 
                onClick={() => handleNav('quality')}
                className="pt-2 flex items-center justify-start gap-3 sm:gap-4 cursor-pointer group select-none max-w-sm"
                title="Origintra Exim — Statutory Accreditations (FSSAI, IEC, GST, APEDA)"
              >
                {/* 1. FSSAI */}
                <div className="flex flex-col items-center text-center transition-transform group-hover:scale-105 duration-200">
                  <img
                    src="/assets/certificates/fssai.webp"
                    alt="FSSAI"
                    className="h-6 sm:h-7 w-auto object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/certificates/fssai.png';
                    }}
                  />
                  <span className="text-[11px] font-bold text-slate-800 leading-none mt-1.5">FSSAI</span>
                  <span className="text-[9px] text-slate-500 leading-none mt-0.5">Registered</span>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-slate-200 shrink-0" />

                {/* 2. IEC */}
                <div className="flex flex-col items-center text-center transition-transform group-hover:scale-105 duration-200">
                  <img
                    src="/assets/certificates/iec_emblem.webp"
                    alt="IEC"
                    className="h-6 sm:h-7 w-auto object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/certificates/iec_emblem.png';
                    }}
                  />
                  <span className="text-[11px] font-bold text-slate-800 leading-none mt-1.5">IEC</span>
                  <span className="text-[9px] text-slate-500 leading-none mt-0.5">Holder</span>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-slate-200 shrink-0" />

                {/* 3. GST */}
                <div className="flex flex-col items-center text-center transition-transform group-hover:scale-105 duration-200">
                  <img
                    src="/assets/certificates/gst-transparent.webp"
                    alt="GST"
                    className="h-6 sm:h-7 w-auto object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/certificates/gst-transparent.png';
                    }}
                  />
                  <span className="text-[11px] font-bold text-slate-800 leading-none mt-1.5">GST</span>
                  <span className="text-[9px] text-slate-500 leading-none mt-0.5">Registered</span>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-slate-200 shrink-0" />

                {/* 4. APEDA */}
                <div className="flex flex-col items-center text-center transition-transform group-hover:scale-105 duration-200">
                  <img
                    src="/assets/certificates/apeda.webp"
                    alt="APEDA"
                    className="h-6 sm:h-7 w-auto object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/certificates/apeda.png';
                    }}
                  />
                  <span className="text-[11px] font-bold text-slate-800 leading-none mt-1.5">APEDA</span>
                  <span className="text-[9px] text-slate-500 leading-none mt-0.5">Member</span>
                </div>
              </div>

            </div>

            {/* Column 2: Quick Links (lg:col-span-2.5) */}
            <div className="lg:col-span-2 space-y-3 lg:pl-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0A1C3E] font-display tracking-tight">Quick Links</h3>
                <div className="w-9 h-[2.5px] bg-[#0070E0] rounded-full mt-1.5 mb-3.5" />
              </div>

              <ul className="space-y-2.5 text-sm">
                <li>
                  <a
                    href={getHref('home')}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleNav('home');
                      }
                    }}
                    className="group inline-flex items-center space-x-1.5 text-slate-600 hover:text-[#0070E0] transition-colors cursor-pointer py-0.5 font-medium"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#0070E0] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    <span>Home</span>
                  </a>
                </li>
                <li>
                  <a
                    href={getHref('about')}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleNav('about');
                      }
                    }}
                    className="group inline-flex items-center space-x-1.5 text-slate-600 hover:text-[#0070E0] transition-colors cursor-pointer py-0.5 font-medium"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#0070E0] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    <span>About Us</span>
                  </a>
                </li>
                <li>
                  <a
                    href={getHref('products')}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleNav('products');
                      }
                    }}
                    className="group inline-flex items-center space-x-1.5 text-slate-600 hover:text-[#0070E0] transition-colors cursor-pointer py-0.5 font-medium"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#0070E0] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    <span>Products</span>
                  </a>
                </li>
                <li>
                  <a
                    href={getHref('blog')}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleNav('blog');
                      }
                    }}
                    className="group inline-flex items-center space-x-1.5 text-slate-600 hover:text-[#0070E0] transition-colors cursor-pointer py-0.5 font-medium"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#0070E0] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    <span>Blogs</span>
                  </a>
                </li>
                <li>
                  <a
                    href={getHref('contact')}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleNav('contact');
                      }
                    }}
                    className="group inline-flex items-center space-x-1.5 text-slate-600 hover:text-[#0070E0] transition-colors cursor-pointer py-0.5 font-medium"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#0070E0] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    <span>Contact</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Our Products (lg:col-span-2.5) */}
            <div className="lg:col-span-2.5 space-y-3 lg:pl-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0A1C3E] font-display tracking-tight">Our Products</h3>
                <div className="w-9 h-[2.5px] bg-[#0070E0] rounded-full mt-1.5 mb-3.5" />
              </div>

              <ul className="space-y-2.5 text-sm">
                <li>
                  <a
                    href={getHref('products')}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleNav('products');
                      }
                    }}
                    className="group inline-flex items-center space-x-1.5 text-slate-600 hover:text-[#0070E0] transition-colors cursor-pointer py-0.5 font-medium"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#0070E0] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    <span>Indian Spices</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/products/whole-red-chili"
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleNav('product-whole-red-chili');
                      }
                    }}
                    className="group inline-flex items-center space-x-1.5 text-slate-600 hover:text-[#0070E0] transition-colors cursor-pointer py-0.5 font-medium"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#0070E0] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    <span>Red Chilli</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/products/turmeric"
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleNav('product-turmeric');
                      }
                    }}
                    className="group inline-flex items-center space-x-1.5 text-slate-600 hover:text-[#0070E0] transition-colors cursor-pointer py-0.5 font-medium"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#0070E0] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    <span>Turmeric</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/products/green-cardamom"
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleNav('product-green-cardamom');
                      }
                    }}
                    className="group inline-flex items-center space-x-1.5 text-slate-600 hover:text-[#0070E0] transition-colors cursor-pointer py-0.5 font-medium"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#0070E0] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    <span>Green Cardamom</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/products/black-pepper"
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleNav('product-black-pepper');
                      }
                    }}
                    className="group inline-flex items-center space-x-1.5 text-slate-600 hover:text-[#0070E0] transition-colors cursor-pointer py-0.5 font-medium"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#0070E0] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    <span>Black Pepper</span>
                  </a>
                </li>
                <li>
                  <a
                    href={getHref('products')}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleNav('products');
                      }
                    }}
                    className="group inline-flex items-center space-x-1.5 text-slate-500 hover:text-[#0070E0] transition-colors cursor-pointer py-0.5 font-normal text-xs"
                  >
                    <ChevronRight className="w-3 h-3 text-[#0070E0] shrink-0 transition-transform group-hover:translate-x-0.5" />
                    <span>and more...</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Get in Touch (lg:col-span-3.5) */}
            <div className="lg:col-span-3 space-y-3.5 relative z-10">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0A1C3E] font-display tracking-tight">Get in Touch</h3>
                <div className="w-9 h-[2.5px] bg-[#0070E0] rounded-full mt-1.5 mb-3.5" />
              </div>

              <div className="space-y-3.5 text-sm">
                {/* Email Us */}
                <a
                  href={`mailto:${COMPANY_CONFIG.primaryEmail}`}
                  className="group flex items-center space-x-3 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E0EFFF] group-hover:bg-[#0070E0] text-[#0070E0] group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200 shadow-2xs">
                    <Mail className="w-4 h-4 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#0070E0] transition-colors block">
                      Email Us
                    </span>
                    <span className="text-xs sm:text-sm text-slate-600 group-hover:text-[#0070E0] transition-colors block truncate font-medium">
                      {COMPANY_CONFIG.primaryEmail}
                    </span>
                  </div>
                </a>

                {/* Call Us */}
                <a
                  href={`tel:${COMPANY_CONFIG.phone}`}
                  className="group flex items-center space-x-3 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E0EFFF] group-hover:bg-[#0070E0] text-[#0070E0] group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-200 shadow-2xs">
                    <Phone className="w-4 h-4 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#0070E0] transition-colors block">
                      Call Us
                    </span>
                    <span className="text-xs sm:text-sm text-slate-600 group-hover:text-[#0070E0] transition-colors block truncate font-medium">
                      {COMPANY_CONFIG.phoneDisplay}
                    </span>
                  </div>
                </a>

                {/* Trade Desk Hours */}
                <div className="group flex items-start space-x-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E0EFFF] text-[#0070E0] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-xs sm:text-sm font-bold text-[#0F172A] block">
                      Trade Desk Hours
                    </span>
                    <span className="text-xs text-slate-600 block leading-tight font-medium">
                      {COMPANY_CONFIG.businessHours.days}
                    </span>
                    <span className="text-xs text-slate-500 block font-mono">
                      {COMPANY_CONFIG.businessHours.hours} (UTC +05:30)
                    </span>
                  </div>
                </div>

                {/* Our Location */}
                <div className="group flex items-start space-x-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E0EFFF] text-[#0070E0] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-[#0F172A] block">
                      Our Location
                    </span>
                    <span className="text-xs text-slate-600 block leading-tight font-medium mt-0.5">
                      {COMPANY_CONFIG.headOffice.city},
                    </span>
                    <span className="text-xs text-slate-600 block leading-tight font-medium">
                      {COMPANY_CONFIG.headOffice.state}, India
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 4. Bottom Dark Navy Sub-Footer Bar */}
      <div className="relative bg-[#021836] text-white py-3.5 sm:py-4 px-4 sm:px-8 border-t border-sky-900/40 z-20 overflow-hidden">
        {/* Dynamic Curved Glow Accents from Design */}
        <img
          src="/assets/footer/bottom-left-corner.png"
          alt=""
          aria-hidden="true"
          className="absolute left-0 bottom-0 h-full w-auto object-contain pointer-events-none opacity-85 select-none"
        />
        <img
          src="/assets/footer/bottom-right-corner.png"
          alt=""
          aria-hidden="true"
          className="absolute right-0 bottom-0 h-full w-auto object-contain pointer-events-none opacity-85 select-none"
        />

        <div className="container-x mx-auto max-w-[1440px] relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs">
          
          {/* Left: Copyright */}
          <p className="text-slate-300 font-normal order-1">
            © {new Date().getFullYear()} {COMPANY_CONFIG.name}. All rights reserved.
          </p>

          {/* Center: Statutory Badges (GST No. & IEC Code) */}
          <div className="flex items-center gap-3 sm:gap-5 order-3 lg:order-2">
            {/* GST No. Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0070E0] text-white flex items-center justify-center shrink-0 shadow-sm">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-slate-300 font-semibold leading-tight">
                  GST No.
                </span>
                <span className="block text-xs font-mono font-bold text-white tracking-wider leading-tight">
                  {COMPANY_CONFIG.gstNumber || '24ABCDE1234F1Z5'}
                </span>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="w-px h-6 bg-white/20" />

            {/* IEC Code Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0070E0] text-white flex items-center justify-center shrink-0 shadow-sm">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-slate-300 font-semibold leading-tight">
                  IEC Code
                </span>
                <span className="block text-xs font-mono font-bold text-white tracking-wider leading-tight">
                  {COMPANY_CONFIG.iecCode || 'ABCDE1234F'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Legal & Sitemap Links separated by vertical pipes */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-slate-300 order-2 lg:order-3">
            <a
              href={getHref('legal-privacy')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  handleLegal('privacy');
                }
              }}
              className="hover:text-white transition-colors cursor-pointer py-0.5"
            >
              Privacy Policy
            </a>
            <span className="text-slate-500 select-none">|</span>
            <a
              href={getHref('legal-terms')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  handleLegal('terms');
                }
              }}
              className="hover:text-white transition-colors cursor-pointer py-0.5"
            >
              Terms &amp; Conditions
            </a>
            <span className="text-slate-500 select-none">|</span>
            <a
              href={getHref('legal-shipping')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  handleLegal('shipping');
                }
              }}
              className="hover:text-white transition-colors cursor-pointer py-0.5"
            >
              Shipping Policy
            </a>
            <span className="text-slate-500 select-none">|</span>
            <a
              href={getHref('legal-cookies')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  handleLegal('cookies');
                }
              }}
              className="hover:text-white transition-colors cursor-pointer py-0.5"
            >
              Cookie Policy
            </a>
            <span className="text-slate-500 select-none">|</span>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors cursor-pointer py-0.5"
            >
              Sitemap
            </a>
          </div>

        </div>
      </div>

    </footer>
  );
};
