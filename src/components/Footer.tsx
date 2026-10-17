import React from 'react';
import { ArrowUpRight, Mail, Phone, MapPin, MessageSquare, ShieldCheck, Anchor } from 'lucide-react';
import { useCompanyConfig } from '../hooks/useCompanyConfig';
import { getHref } from '../utils/routes';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenQuote: () => void;
  onOpenLegal?: (type: 'privacy' | 'terms' | 'shipping' | 'cookies') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenQuote,
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
      onNavigate(`legal-${type}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#0A1C3E] text-slate-300 border-t border-slate-800">
      {/* Upper Main Footer Grid */}
      <div className="container-x mx-auto max-w-[1440px] py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Column 1: Logo & Short Company Description (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center">
              <a 
                href={getHref('home')} 
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                    e.preventDefault();
                    handleNav('home');
                  }
                }}
              >
                <img
                  src="/assets/logo/logo-full-white.png"
                  alt="Origintra Exim — Connecting Markets. Moving Possibilities."
                  width="144"
                  height="48"
                  loading="lazy"
                  decoding="async"
                  className="h-12 w-auto max-h-12 object-contain"
                />
              </a>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Origintra Exim is an India-based international trading and export company. We connect global buyers with carefully sourced Indian spices and agricultural products, focused on quality consistency, transparent communication, and export-ready documentation.
            </p>

            <div className="pt-3 text-xs text-slate-300 font-sans border-t border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-slate-200 font-medium">Govt. Registered Merchant Exporter</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Direct origin farm sourcing from Gujarat &amp; Kerala with seafreight dispatch to global ports.
              </p>

              {/* Social Channels with accessible 44px touch targets */}
              <div className="flex items-center space-x-3 pt-1">
                <a
                  href={COMPANY_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-800/90 hover:bg-[#38BDF8] text-slate-200 hover:text-[#0A1C3E] flex items-center justify-center transition-all shadow-sm"
                  title="Instagram (@origintra.exim)"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
                <a
                  href={COMPANY_CONFIG.linkedinUrl || "https://www.linkedin.com/company/origintra-exim"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-800/90 hover:bg-[#38BDF8] text-slate-200 hover:text-[#0A1C3E] flex items-center justify-center transition-all shadow-sm"
                  title="LinkedIn"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </a>
                <a
                  href={COMPANY_CONFIG.facebookUrl || "https://www.facebook.com/origintra.exim"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-800/90 hover:bg-[#38BDF8] text-slate-200 hover:text-[#0A1C3E] flex items-center justify-center transition-all shadow-sm"
                  title="Facebook"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Company (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-sans">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={getHref('about')}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                      e.preventDefault();
                      handleNav('about');
                    }
                  }}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left block py-1"
                >
                  About Us
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
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left block py-1"
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href={getHref('global-reach')}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                      e.preventDefault();
                      handleNav('global-reach');
                    }
                  }}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left block py-1"
                >
                  Global Reach
                </a>
              </li>
              <li>
                <a
                  href={getHref('quality')}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                      e.preventDefault();
                      handleNav('quality');
                    }
                  }}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left block py-1"
                >
                  Quality & Compliance
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
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left block py-1"
                >
                  Team
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-sans">Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={getHref('blog')}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                      e.preventDefault();
                      handleNav('blog');
                    }
                  }}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left block py-1"
                >
                  Blog
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
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left block py-1"
                >
                  Export Insights
                </a>
              </li>
              <li>
                <a
                  href={getHref('quality')}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                      e.preventDefault();
                      handleNav('quality');
                    }
                  }}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left block py-1"
                >
                  Documentation & FAQs
                </a>
              </li>
              <li>
                <a
                  href={getHref('meeting')}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                      e.preventDefault();
                      handleNav('meeting');
                    }
                  }}
                  className="text-[#38BDF8] hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1 font-semibold py-1"
                >
                  <span>Schedule Meeting (30 Min)</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenQuote}
                  className="text-slate-200 hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1 font-medium py-1"
                >
                  <span>Request a Commercial Quote</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-sans">Contact</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                <div>
                  <a
                    href={`mailto:${COMPANY_CONFIG.primaryEmail}`}
                    className="hover:text-white transition-colors block text-slate-200"
                  >
                    {COMPANY_CONFIG.primaryEmail}
                  </a>
                  <span className="text-xs text-slate-300">Commercial Inquiries</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                <div>
                  <a
                    href={`tel:${COMPANY_CONFIG.phone}`}
                    className="hover:text-white transition-colors block text-slate-200"
                  >
                    {COMPANY_CONFIG.phoneDisplay}
                  </a>
                  <span className="text-xs text-slate-300">Trade Desk (09:00 - 18:30 IST)</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MessageSquare className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <a
                    href={COMPANY_CONFIG.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors block text-slate-200 font-medium"
                  >
                    WhatsApp Trade Desk
                  </a>
                  <span className="text-xs text-slate-300">{COMPANY_CONFIG.whatsappDisplay}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <p className="text-slate-200 font-medium">{COMPANY_CONFIG.headOffice.title}</p>
                  <p>{COMPANY_CONFIG.headOffice.city}, {COMPANY_CONFIG.headOffice.state}, India</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Compliance Notice & Statutory Exporter Registration Bar */}
      <div className="border-t border-slate-800/80 bg-[#07152E] py-3.5">
        <div className="container-x mx-auto max-w-[1440px] flex flex-col xl:flex-row items-center justify-between gap-3.5 text-xs text-slate-300">
          {/* Statutory Registration Badges */}
          <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#38BDF8]/10 border border-[#38BDF8]/25 text-[#38BDF8] text-[11px] font-semibold uppercase tracking-wider shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Accreditations</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[11px] shrink-0">
              <span className="text-slate-400 font-medium">IEC</span>
              <span className="font-mono text-white font-medium">2424018921</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[11px] shrink-0">
              <span className="text-slate-400 font-medium">APEDA</span>
              <span className="font-mono text-white font-medium">RCMC/AGRO/2024/4912</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[11px] shrink-0">
              <span className="text-slate-400 font-medium">Spices Board</span>
              <span className="font-mono text-white font-medium">SP/CRES/GJ/2024/0918</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[11px] shrink-0">
              <span className="text-slate-400 font-medium">FSSAI Lic</span>
              <span className="font-mono text-white font-medium">10022021001488</span>
            </span>
          </div>

          {/* Container Dispatch Ports */}
          <div className="flex flex-wrap items-center justify-center xl:justify-end gap-2 text-[11px] text-slate-300 shrink-0">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium mr-0.5">
              <Anchor className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span>Dispatch Ports:</span>
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/50 text-slate-200">
              Mundra <span className="ml-1 text-[10px] text-[#38BDF8] font-mono font-medium">INMUN1</span>
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/50 text-slate-200">
              Nhava Sheva <span className="ml-1 text-[10px] text-[#38BDF8] font-mono font-medium">INNSA1</span>
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/50 text-slate-200">
              Cochin <span className="ml-1 text-[10px] text-[#38BDF8] font-mono font-medium">INCOK1</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Legal Links */}
      <div className="border-t border-slate-800/60 py-6">
        <div className="container-x mx-auto max-w-[1440px] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <p>© 2026 Origintra Exim. All rights reserved.</p>
          
          <div className="flex flex-wrap items-center gap-6">
            <a
              href={getHref('legal-privacy')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  handleLegal('privacy');
                }
              }}
              className="text-slate-300 hover:text-white transition-colors cursor-pointer py-1.5"
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
              className="text-slate-300 hover:text-white transition-colors cursor-pointer py-1.5"
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
              className="text-slate-300 hover:text-white transition-colors cursor-pointer py-1.5"
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
              className="text-slate-300 hover:text-white transition-colors cursor-pointer py-1.5"
            >
              Cookie Policy
            </a>
            <a
              href={getHref('admin')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  handleNav('admin');
                }
              }}
              className="text-[#38BDF8] hover:text-white transition-colors cursor-pointer font-medium flex items-center space-x-1"
            >
              <span>Admin Portal</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
