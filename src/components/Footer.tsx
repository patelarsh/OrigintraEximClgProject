import React from 'react';
import { 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin, 
  Clock 
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
    <footer className="relative w-full overflow-hidden bg-[#06152F] text-slate-300">
      {/* 1. Flat Top Maritime Cyan/Blue Accent Strip */}
      <div className="w-full h-1 sm:h-1.5 bg-gradient-to-r from-[#0055B3] via-[#00D2FF] to-[#0052B4] shadow-[0_2px_12px_rgba(0,180,255,0.35)] relative z-10" />

      {/* 2. Main Footer Body Container */}
      <div className="relative bg-[#06152F] pt-12 sm:pt-16 pb-4">
        {/* Maritime Background Visuals: Dotted World Map & Container Ship Port Silhouette */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
          {/* Dotted World Map */}
          <img
            src="/assets/dotted-world-map.svg"
            alt=""
            aria-hidden="true"
            className="absolute right-0 top-0 w-full max-w-[700px] h-full object-contain object-right opacity-10 mix-blend-screen"
          />

          {/* Container Ship at Port Silhouette (bottom right) */}
          <div className="absolute right-0 bottom-0 w-full max-w-[620px] h-[80%] opacity-20 mix-blend-luminosity overflow-hidden">
            <img
              src="/assets/about/container-ship-port.webp"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover object-bottom-right"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06152F] via-[#06152F]/70 to-[#06152F]"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#06152F]/60 to-[#06152F]"></div>
          </div>
        </div>

        {/* 3. Main Footer Content Container */}
        <div className="container-x mx-auto max-w-[1440px] relative z-10 pt-2 pb-6">



          {/* 3.2 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-10">
            
            {/* Column 1: Brand Logo, Description & Social Icons (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-5">
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
                  src="/assets/logo/origintra-official-white.webp?v=2"
                  alt="Origintra Exim — Connecting Markets. Moving Possibilities."
                  width="180"
                  height="56"
                  loading="lazy"
                  decoding="async"
                  className="h-12 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/logo/origintra-official-white.png?v=2';
                  }}
                />
              </a>

              <p className="text-sm text-slate-300 leading-relaxed max-w-sm font-normal">
                Origintra Exim is committed to connecting global markets through high-quality Indian spices and reliable import-export services.
              </p>

              {/* 5 Social Channels in Circular Outline Pills */}
              <div className="flex items-center space-x-2.5 pt-1">
                {/* Facebook */}
                <a
                  href={COMPANY_CONFIG.facebookUrl || "https://www.facebook.com/origintra.exim"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-sky-400/40 bg-sky-950/50 hover:bg-[#0070E0] hover:border-[#38BDF8] text-white flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="Facebook"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>

                {/* Instagram */}
                <a
                  href={COMPANY_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-sky-400/40 bg-sky-950/50 hover:bg-[#0070E0] hover:border-[#38BDF8] text-white flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="Instagram"
                  title="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>

                {/* LinkedIn */}
                <a
                  href={COMPANY_CONFIG.linkedinUrl || "https://www.linkedin.com/company/origintra-exim"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-sky-400/40 bg-sky-950/50 hover:bg-[#0070E0] hover:border-[#38BDF8] text-white flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@origintra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-sky-400/40 bg-sky-950/50 hover:bg-[#0070E0] hover:border-[#38BDF8] text-white flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="YouTube"
                  title="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>

                {/* X / Twitter */}
                <a
                  href="https://twitter.com/origintra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-sky-400/40 bg-sky-950/50 hover:bg-[#0070E0] hover:border-[#38BDF8] text-white flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="X (Twitter)"
                  title="X (Twitter)"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>

              {/* Statutory Licenses & Certifications HD Banner (Exactly Below Social Media Icons) */}
              <div className="pt-1">
                <div
                  onClick={() => handleNav('quality')}
                  className="block w-full max-w-[270px] sm:max-w-[290px] hover:scale-[1.03] transition-all duration-200 cursor-pointer group"
                  title="Origintra Exim — Statutory Export Accreditations & Licenses (FSSAI, Spices Board India, APEDA, DGFT IEC, MSME, GST Registered)"
                  aria-label="Statutory Export Accreditations & Licenses"
                >
                  <picture>
                    <source srcSet="/assets/certificates/statutory-licenses-hd.webp" type="image/webp" />
                    <img
                      src="/assets/certificates/statutory-licenses-hd.png"
                      alt="Statutory Export Accreditations and Licenses — FSSAI, Spices Board India, APEDA, DGFT IEC, MSME, GST"
                      width="3993"
                      height="638"
                      className="w-full h-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.22)] transition-all duration-200 group-hover:drop-shadow-[0_4px_14px_rgba(56,189,248,0.35)]"
                      loading="lazy"
                    />
                  </picture>
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links (lg:col-span-2) */}
            <div className="lg:col-span-2 space-y-4 lg:border-l lg:border-white/10 lg:pl-8">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-display tracking-tight">Quick Links</h3>
                <div className="w-9 h-[2.5px] bg-[#00A3FF] rounded-full mt-2 mb-4"></div>
              </div>

              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href={getHref('home')}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleNav('home');
                      }
                    }}
                    className="group inline-flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer py-0.5"
                  >
                    <ChevronRight className="w-4 h-4 text-[#00A3FF] shrink-0 transition-transform group-hover:translate-x-1" />
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
                    className="group inline-flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer py-0.5"
                  >
                    <ChevronRight className="w-4 h-4 text-[#00A3FF] shrink-0 transition-transform group-hover:translate-x-1" />
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
                    className="group inline-flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer py-0.5"
                  >
                    <ChevronRight className="w-4 h-4 text-[#00A3FF] shrink-0 transition-transform group-hover:translate-x-1" />
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
                    className="group inline-flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer py-0.5"
                  >
                    <ChevronRight className="w-4 h-4 text-[#00A3FF] shrink-0 transition-transform group-hover:translate-x-1" />
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
                    className="group inline-flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer py-0.5"
                  >
                    <ChevronRight className="w-4 h-4 text-[#00A3FF] shrink-0 transition-transform group-hover:translate-x-1" />
                    <span>Contact</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Our Products (lg:col-span-3) */}
            <div className="lg:col-span-3 space-y-4 lg:border-l lg:border-white/10 lg:pl-8">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-display tracking-tight">Our Products</h3>
                <div className="w-9 h-[2.5px] bg-[#00A3FF] rounded-full mt-2 mb-4"></div>
              </div>

              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href={getHref('products')}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleNav('products');
                      }
                    }}
                    className="group inline-flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer py-0.5"
                  >
                    <ChevronRight className="w-4 h-4 text-[#00A3FF] shrink-0 transition-transform group-hover:translate-x-1" />
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
                    className="group inline-flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer py-0.5"
                  >
                    <ChevronRight className="w-4 h-4 text-[#00A3FF] shrink-0 transition-transform group-hover:translate-x-1" />
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
                    className="group inline-flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer py-0.5"
                  >
                    <ChevronRight className="w-4 h-4 text-[#00A3FF] shrink-0 transition-transform group-hover:translate-x-1" />
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
                    className="group inline-flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer py-0.5"
                  >
                    <ChevronRight className="w-4 h-4 text-[#00A3FF] shrink-0 transition-transform group-hover:translate-x-1" />
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
                    className="group inline-flex items-center space-x-2 text-slate-300 hover:text-white transition-colors cursor-pointer py-0.5"
                  >
                    <ChevronRight className="w-4 h-4 text-[#00A3FF] shrink-0 transition-transform group-hover:translate-x-1" />
                    <span>Black Pepper</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Get in Touch (lg:col-span-3) */}
            <div className="lg:col-span-3 space-y-4 lg:border-l lg:border-white/10 lg:pl-8">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-display tracking-tight">Get in Touch</h3>
                <div className="w-9 h-[2.5px] bg-[#00A3FF] rounded-full mt-2 mb-4"></div>
              </div>

              <div className="space-y-4 text-sm">
                {/* Email Us */}
                <a
                  href={`mailto:${COMPANY_CONFIG.primaryEmail}`}
                  className="group flex items-center space-x-3 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full border border-sky-400/40 bg-sky-950/50 group-hover:bg-[#0070E0] group-hover:border-[#38BDF8] flex items-center justify-center text-white shrink-0 transition-all shadow-sm">
                    <Mail className="w-4 h-4 text-[#38BDF8] group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-white group-hover:text-[#38BDF8] transition-colors block">
                      Email Us
                    </span>
                    <span className="text-xs text-slate-300 block truncate">
                      {COMPANY_CONFIG.primaryEmail}
                    </span>
                  </div>
                </a>

                {/* Call Us */}
                <a
                  href={`tel:${COMPANY_CONFIG.phone}`}
                  className="group flex items-center space-x-3 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full border border-sky-400/40 bg-sky-950/50 group-hover:bg-[#0070E0] group-hover:border-[#38BDF8] flex items-center justify-center text-white shrink-0 transition-all shadow-sm">
                    <Phone className="w-4 h-4 text-[#38BDF8] group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-white group-hover:text-[#38BDF8] transition-colors block">
                      Call Us
                    </span>
                    <span className="text-xs text-slate-300 block truncate">
                      {COMPANY_CONFIG.phoneDisplay}
                    </span>
                  </div>
                </a>

                {/* Working Hours & Time Zone (International Buyer Operating Window) */}
                <div className="group flex items-start space-x-3 pt-1">
                  <div className="w-10 h-10 rounded-full border border-sky-400/40 bg-sky-950/50 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                    <Clock className="w-4 h-4 text-[#38BDF8]" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <span className="text-sm font-semibold text-white block">
                      Trade Desk Hours
                    </span>
                    <span className="text-xs text-slate-300 block leading-tight font-medium">
                      {COMPANY_CONFIG.businessHours.days}
                    </span>
                    <span className="text-[11px] text-[#38BDF8] block font-mono">
                      {COMPANY_CONFIG.businessHours.hours} (UTC +05:30)
                    </span>
                  </div>
                </div>

                {/* Our Location */}
                <div className="group flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full border border-sky-400/40 bg-sky-950/50 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <MapPin className="w-4 h-4 text-[#38BDF8]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-white block">
                      Our Location
                    </span>
                    <span className="text-xs text-slate-300 block leading-tight">
                      {COMPANY_CONFIG.headOffice.city}, {COMPANY_CONFIG.headOffice.state}, India
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>



        </div>

        {/* 4. Bottom Sub-footer: Copyright & Legal Compliance Bar */}
        <div className="border-t border-white/10 pt-5 pb-6 relative z-10">
          <div className="container-x mx-auto max-w-[1440px] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p className="font-normal text-slate-300">
              © 2026 Origintra Exim. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-5 sm:gap-6 text-slate-400">
              <a
                href={getHref('legal-privacy')}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                    e.preventDefault();
                    handleLegal('privacy');
                  }
                }}
                className="hover:text-white transition-colors cursor-pointer py-1"
              >
                Privacy Policy
              </a>
              <a
                href={getHref('legal-terms')}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                    e.preventDefault();
                    handleLegal('terms');
                  }
                }}
                className="hover:text-white transition-colors cursor-pointer py-1"
              >
                Terms & Conditions
              </a>
              <a
                href={getHref('legal-shipping')}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                    e.preventDefault();
                    handleLegal('shipping');
                  }
                }}
                className="hover:text-white transition-colors cursor-pointer py-1"
              >
                Shipping Policy
              </a>
              <a
                href={getHref('legal-cookies')}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                    e.preventDefault();
                    handleLegal('cookies');
                  }
                }}
                className="hover:text-white transition-colors cursor-pointer py-1"
              >
                Cookie Policy
              </a>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors cursor-pointer py-1"
              >
                Sitemap
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
