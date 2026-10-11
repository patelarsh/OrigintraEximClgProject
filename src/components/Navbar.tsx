import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  BookOpen,
  ShieldCheck,
  Globe,
  Building2,
  PackageCheck,
  CheckCircle2,
  Award
} from 'lucide-react';
import { COMPANY_CONFIG } from '../data/company';
import { getHref } from '../utils/routes';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenQuote: () => void;
}

// Navabar Fix: keep the sticky header stable, close dropdowns on outside clicks, and preserve responsive navigation behavior.
export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenQuote
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileAboutExpanded, setMobileAboutExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAboutMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAboutDropdownOpen(true);
  };

  const handleAboutMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setAboutDropdownOpen(false);
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAboutDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
    onNavigate(id);
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all">
      {/* Top Utility Information Bar */}
      <div className="w-full bg-[#0A1C3E] text-slate-300 border-b border-blue-900/50 text-[11px] sm:text-xs">
        <div className="container-x mx-auto max-w-[1440px] py-1.5 sm:py-2 flex items-center justify-between gap-x-4">
          {/* Left: Contact Info & Hub Location */}
          <div className="flex items-center space-x-3 sm:space-x-5 md:space-x-6 overflow-hidden">
            <a
              href={`mailto:${COMPANY_CONFIG.primaryEmail}`}
              className="flex items-center space-x-1.5 text-slate-300 hover:text-white transition-colors group shrink-0"
            >
              <Mail className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-medium truncate">{COMPANY_CONFIG.primaryEmail}</span>
            </a>

            <a
              href={`tel:${COMPANY_CONFIG.phone}`}
              className="hidden sm:flex items-center space-x-1.5 text-slate-300 hover:text-white transition-colors group shrink-0"
            >
              <Phone className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{COMPANY_CONFIG.phoneDisplay}</span>
            </a>

            <div className="hidden md:flex items-center space-x-1.5 text-slate-300 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span>Sabarkantha, Gujarat</span>
            </div>
          </div>

          {/* Right: Operating Hours & Social Channels */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            <div className="hidden lg:flex items-center space-x-1.5 text-slate-300 shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span>Mon – Sat: 10:00 – 18:00 IST</span>
            </div>

            {/* Mobile-only quick phone link */}
            <a
              href={`tel:${COMPANY_CONFIG.phone}`}
              className="sm:hidden flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="font-medium">{COMPANY_CONFIG.phoneDisplay}</span>
            </a>

            <div className="hidden sm:flex items-center space-x-2 text-slate-400 border-l border-blue-900/60 pl-3">
              <a
                href={COMPANY_CONFIG.facebookUrl || "https://www.facebook.com/origintra.exim"}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:text-[#38BDF8] transition-colors"
                title="Facebook"
                aria-label="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={COMPANY_CONFIG.linkedinUrl || "https://www.linkedin.com/company/origintra-exim"}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:text-[#38BDF8] transition-colors"
                title="LinkedIn"
                aria-label="LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href={COMPANY_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:text-[#38BDF8] transition-colors"
                title="Instagram (@origintra.exim)"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={COMPANY_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:text-[#25D366] transition-colors"
                title="WhatsApp Trade Desk"
                aria-label="WhatsApp Trade Desk"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.031 2C6.496 2 2 6.496 2 12.031c0 1.767.46 3.49 1.332 5.006L2 22l5.105-1.339a9.98 9.98 0 004.926 1.282h.005c5.535 0 10.03-4.496 10.03-10.031A10.024 10.024 0 0012.031 2zm0 18.369c-1.503 0-2.977-.404-4.264-1.168l-.306-.182-3.17.832.846-3.09-.199-.317A8.344 8.344 0 013.662 12.03c0-4.614 3.755-8.369 8.369-8.369 2.235 0 4.337.871 5.918 2.452a8.324 8.324 0 012.451 5.918c0 4.615-3.755 8.37-8.369 8.37zm4.588-6.265c-.252-.126-1.488-.734-1.719-.818-.231-.084-.399-.126-.567.126-.168.252-.651.818-.798.986-.147.168-.294.189-.546.063-.252-.126-1.063-.392-2.025-1.25-.749-.668-1.255-1.493-1.402-1.745-.147-.252-.016-.388.11-.514.113-.113.252-.294.378-.441.126-.147.168-.252.252-.42.084-.168.042-.315-.021-.441-.063-.126-.567-1.365-.777-1.869-.205-.491-.413-.424-.567-.432l-.483-.008c-.168 0-.441.063-.672.315-.231.252-.882.861-.882 2.1 0 1.239.903 2.436 1.029 2.604.126.168 1.777 2.713 4.305 3.805.602.26 1.072.415 1.439.532.605.192 1.155.165 1.59.1.485-.072 1.488-.609 1.698-1.197.21-.588.21-1.092.147-1.197-.063-.105-.231-.168-.483-.294z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Corporate Header */}
      <div className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="container-x mx-auto max-w-[1440px]">
          <div className="flex h-20 items-center justify-between">

          {/* Nav bar button fix: keep the header actions and menu controls aligned and clickable in mobile layouts. */}
          {/* Logo with strict proportion preservation and SEO clean URL */}
          <a
            href={getHref('home')}
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                e.preventDefault();
                handleLinkClick('home');
              }
            }}
            className="flex items-center group py-1"
            title="Origintra Exim — Home"
          >
            <img
              src="/assets/logo/logo-full-color.png"
              alt="Origintra Exim — Connecting Markets. Moving Possibilities."
              className="h-11 sm:h-12 w-auto max-h-12 object-contain transition-transform duration-200 group-hover:opacity-90"
              style={{ aspectRatio: 'auto' }}
            />
          </a>

          {/* Desktop Navigation Links (SEO Crawlable Semantic Links) */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">

            {/* 1. Home */}
            <a
              href={getHref('home')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  handleLinkClick('home');
                }
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentPage === 'home'
                  ? 'text-[#0070E0] font-semibold bg-blue-50/60'
                  : 'text-slate-700 hover:text-[#0A1C3E] hover:bg-slate-100/70'
              }`}
            >
              Home
            </a>

            {/* 2. About (DropDown: Our Story, Certificates) */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleAboutMouseEnter}
              onMouseLeave={handleAboutMouseLeave}
            >
              <a
                href={getHref('about')}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                    e.preventDefault();
                    setAboutDropdownOpen(false);
                    handleLinkClick('about');
                  }
                }}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  currentPage === 'about' || currentPage === 'quality' || aboutDropdownOpen
                    ? 'text-[#0070E0] font-semibold bg-blue-50/60'
                    : 'text-slate-700 hover:text-[#0A1C3E] hover:bg-slate-100/70'
                }`}
              >
                <span>About</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${aboutDropdownOpen ? 'rotate-180 text-[#0070E0]' : 'text-slate-400'}`} />
              </a>

              {/* Dropdown Menu (Exact match to reference screenshot: rounded card, boxed icons, inverted dark hover state) */}
              {aboutDropdownOpen && (
                <div
                  className="absolute left-0 top-full pt-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseEnter={handleAboutMouseEnter}
                  onMouseLeave={handleAboutMouseLeave}
                >
                  <div className="w-[330px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(10,28,62,0.16),0_0_0_1px_rgba(10,28,62,0.06)] border border-slate-200/90 p-2 space-y-1">
                    {/* 1. Our Story */}
                    <a
                      href={getHref('about')}
                      onClick={(e) => {
                        if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                          e.preventDefault();
                          setAboutDropdownOpen(false);
                          handleLinkClick('about');
                        }
                      }}
                      className={`group flex items-center gap-3.5 p-2 rounded-xl transition-all duration-150 cursor-pointer ${
                        currentPage === 'about'
                          ? 'bg-slate-100/90'
                          : 'hover:bg-slate-100/80'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 ${
                        currentPage === 'about'
                          ? 'bg-[#0A1C3E] border border-[#0A1C3E] text-white'
                          : 'bg-white border border-slate-200/90 shadow-2xs text-slate-800 group-hover:bg-[#0A1C3E] group-hover:border-[#0A1C3E] group-hover:text-white'
                      }`}>
                        <BookOpen className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-bold text-[#0A1C3E] leading-tight">
                          About Us (Our Story)
                        </div>
                        <p className="text-[11.5px] text-slate-500 font-normal mt-0.5 leading-tight truncate">
                          Origins, leadership ethos & sourcing
                        </p>
                      </div>
                    </a>

                    {/* 2. Certificates */}
                    <a
                      href={getHref('quality')}
                      onClick={(e) => {
                        if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                          e.preventDefault();
                          setAboutDropdownOpen(false);
                          handleLinkClick('quality');
                        }
                      }}
                      className={`group flex items-center gap-3.5 p-2 rounded-xl transition-all duration-150 cursor-pointer ${
                        currentPage === 'quality'
                          ? 'bg-slate-100/90'
                          : 'hover:bg-slate-100/80'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 ${
                        currentPage === 'quality'
                          ? 'bg-[#0A1C3E] border border-[#0A1C3E] text-white'
                          : 'bg-white border border-slate-200/90 shadow-2xs text-slate-800 group-hover:bg-[#0A1C3E] group-hover:border-[#0A1C3E] group-hover:text-white'
                      }`}>
                        <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-bold text-[#0A1C3E] leading-tight">
                          Certificates
                        </div>
                        <p className="text-[11.5px] text-slate-500 font-normal mt-0.5 leading-tight truncate">
                          APEDA, FSSAI & Spices Board licenses
                        </p>
                      </div>
                    </a>

                    {/* 3. Global Reach */}
                    <a
                      href={getHref('global-reach')}
                      onClick={(e) => {
                        if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                          e.preventDefault();
                          setAboutDropdownOpen(false);
                          handleLinkClick('global-reach');
                        }
                      }}
                      className={`group flex items-center gap-3.5 p-2 rounded-xl transition-all duration-150 cursor-pointer ${
                        currentPage === 'global-reach'
                          ? 'bg-slate-100/90'
                          : 'hover:bg-slate-100/80'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 ${
                        currentPage === 'global-reach'
                          ? 'bg-[#0A1C3E] border border-[#0A1C3E] text-white'
                          : 'bg-white border border-slate-200/90 shadow-2xs text-slate-800 group-hover:bg-[#0A1C3E] group-hover:border-[#0A1C3E] group-hover:text-white'
                      }`}>
                        <Globe className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-bold text-[#0A1C3E] leading-tight">
                          Global Reach
                        </div>
                        <p className="text-[11.5px] text-slate-500 font-normal mt-0.5 leading-tight truncate">
                          Export corridors across 14+ countries
                        </p>
                      </div>
                    </a>

                    {/* 4. Why Choose Us */}
                    <a
                      href={getHref('about')}
                      onClick={(e) => {
                        if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                          e.preventDefault();
                          setAboutDropdownOpen(false);
                          handleLinkClick('about');
                        }
                      }}
                      className="group flex items-center gap-3.5 p-2 rounded-xl transition-all duration-150 cursor-pointer hover:bg-slate-100/80"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-800 shrink-0 transition-all duration-150 group-hover:bg-[#0A1C3E] group-hover:border-[#0A1C3E] group-hover:text-white">
                        <CheckCircle2 className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-bold text-[#0A1C3E] leading-tight">
                          Why Choose Us
                        </div>
                        <p className="text-[11.5px] text-slate-500 font-normal mt-0.5 leading-tight truncate">
                          Gujarat sortex processing & port access
                        </p>
                      </div>
                    </a>

                    {/* 5. Quality Standards */}
                    <a
                      href={getHref('quality')}
                      onClick={(e) => {
                        if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                          e.preventDefault();
                          setAboutDropdownOpen(false);
                          handleLinkClick('quality');
                        }
                      }}
                      className="group flex items-center gap-3.5 p-2 rounded-xl transition-all duration-150 cursor-pointer hover:bg-slate-100/80"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-800 shrink-0 transition-all duration-150 group-hover:bg-[#0A1C3E] group-hover:border-[#0A1C3E] group-hover:text-white">
                        <Award className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-bold text-[#0A1C3E] leading-tight">
                          Quality Standards
                        </div>
                        <p className="text-[11.5px] text-slate-500 font-normal mt-0.5 leading-tight truncate">
                          Moisture, MRL & lab compliance
                        </p>
                      </div>
                    </a>

                    {/* 6. Schedule Meeting */}
                    <a
                      href={getHref('meeting')}
                      onClick={(e) => {
                        if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                          e.preventDefault();
                          setAboutDropdownOpen(false);
                          handleLinkClick('meeting');
                        }
                      }}
                      className="group flex items-center gap-3.5 p-2 rounded-xl transition-all duration-150 cursor-pointer hover:bg-slate-100/80"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-800 shrink-0 transition-all duration-150 group-hover:bg-[#0A1C3E] group-hover:border-[#0A1C3E] group-hover:text-white">
                        <Calendar className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-bold text-[#0A1C3E] leading-tight">
                          Schedule Meeting
                        </div>
                        <p className="text-[11.5px] text-slate-500 font-normal mt-0.5 leading-tight truncate">
                          Direct 30-min call with export desk
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Product */}
            <a
              href={getHref('products')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  handleLinkClick('products');
                }
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentPage === 'products' || currentPage === 'product-detail'
                  ? 'text-[#0070E0] font-semibold bg-blue-50/60'
                  : 'text-slate-700 hover:text-[#0A1C3E] hover:bg-slate-100/70'
              }`}
            >
              Product
            </a>

            {/* 4. Blog */}
            <a
              href={getHref('blog')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  handleLinkClick('blog');
                }
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentPage === 'blog'
                  ? 'text-[#0070E0] font-semibold bg-blue-50/60'
                  : 'text-slate-700 hover:text-[#0A1C3E] hover:bg-slate-100/70'
              }`}
            >
              Blog
            </a>

            {/* 5. Contact */}
            <a
              href={getHref('contact')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  handleLinkClick('contact');
                }
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentPage === 'contact'
                  ? 'text-[#0070E0] font-semibold bg-blue-50/60'
                  : 'text-slate-700 hover:text-[#0A1C3E] hover:bg-slate-100/70'
              }`}
            >
              Contact
            </a>

          </nav>

          {/* Prominent CTA: Schedule Meeting & Request a Quote */}
          <div className="hidden lg:flex items-center space-x-2.5 shrink-0">
            <button
              onClick={() => handleLinkClick('meeting')}
              className="rounded-full bg-[#0A1C3E] hover:bg-[#0070E0] text-white text-xs font-semibold py-2.5 px-5 shadow-xs transition-all duration-200 flex items-center space-x-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap shrink-0"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Schedule Meeting</span>
            </button>
            <button
              onClick={onOpenQuote}
              className="rounded-full border border-slate-300 hover:border-[#0A1C3E] bg-white hover:bg-slate-50 text-[#0A1C3E] text-xs font-semibold py-2.5 px-4 transition-all duration-200 flex items-center space-x-1.5 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap shrink-0"
            >
              <span>Quote</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>
          </div>

          {/* Mobile/Tablet Controls & Quick CTAs */}
          <div className="lg:hidden flex items-center space-x-2 sm:space-x-2.5 shrink-0">
            <button
              onClick={() => handleLinkClick('meeting')}
              className="text-xs bg-[#0A1C3E] hover:bg-[#0070E0] text-white px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full font-medium flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Schedule Meeting</span>
              <span className="sm:hidden">Meeting</span>
            </button>
            <button
              onClick={onOpenQuote}
              className="hidden sm:flex text-xs border border-slate-300 hover:border-[#0A1C3E] hover:bg-slate-50 text-[#0A1C3E] px-4 py-2 rounded-full font-medium items-center space-x-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Quote</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:p-2.5 text-slate-700 hover:text-[#0A1C3E] rounded-full border border-slate-200 bg-white cursor-pointer transition-colors shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>
    </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="container-x mx-auto px-4 py-6 space-y-1">

            {/* 1. Home */}
            <a
              href={getHref('home')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  handleLinkClick('home');
                }
              }}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition ${
                currentPage === 'home'
                  ? 'bg-blue-50 text-[#0070E0] font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Home</span>
              <ChevronRight className={`w-4 h-4 ${currentPage === 'home' ? 'text-[#0070E0]' : 'text-slate-400'}`} />
            </a>

            {/* 2. About (Dropdown accordion with Our Story and Certificates) */}
            <div>
              <button
                type="button"
                onClick={() => setMobileAboutExpanded(!mobileAboutExpanded)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition cursor-pointer ${
                  currentPage === 'about' || currentPage === 'quality'
                    ? 'bg-blue-50 text-[#0070E0] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>About</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileAboutExpanded ? 'rotate-180 text-[#0070E0]' : 'text-slate-400'}`} />
              </button>

              {mobileAboutExpanded && (
                <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-[#0070E0]/30 ml-3 mt-1 mb-1">
                  {/* Our Story */}
                  <a
                    href={getHref('about')}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleLinkClick('about');
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      currentPage === 'about'
                        ? 'bg-blue-50 text-[#0070E0] font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>About Us (Our Story)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </a>

                  {/* Certificates */}
                  <a
                    href={getHref('quality')}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleLinkClick('quality');
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      currentPage === 'quality'
                        ? 'bg-blue-50 text-[#0070E0] font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Certificates</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </a>

                  {/* Global Reach */}
                  <a
                    href={getHref('global-reach')}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleLinkClick('global-reach');
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      currentPage === 'global-reach'
                        ? 'bg-blue-50 text-[#0070E0] font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Global Reach</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </a>

                  {/* Infrastructure */}
                  <a
                    href={getHref('about')}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        handleLinkClick('about');
                      }
                    }}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Infrastructure</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </a>
                </div>
              )}
            </div>

            {/* 3. Product */}
            <a
              href={getHref('products')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  handleLinkClick('products');
                }
              }}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition ${
                currentPage === 'products' || currentPage === 'product-detail'
                  ? 'bg-blue-50 text-[#0070E0] font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Product</span>
              <ChevronRight className={`w-4 h-4 ${currentPage === 'products' || currentPage === 'product-detail' ? 'text-[#0070E0]' : 'text-slate-400'}`} />
            </a>

            {/* 4. Blog */}
            <a
              href={getHref('blog')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  handleLinkClick('blog');
                }
              }}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition ${
                currentPage === 'blog'
                  ? 'bg-blue-50 text-[#0070E0] font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Blog</span>
              <ChevronRight className={`w-4 h-4 ${currentPage === 'blog' ? 'text-[#0070E0]' : 'text-slate-400'}`} />
            </a>

            {/* 5. Contact */}
            <a
              href={getHref('contact')}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  handleLinkClick('contact');
                }
              }}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition ${
                currentPage === 'contact'
                  ? 'bg-blue-50 text-[#0070E0] font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Contact</span>
              <ChevronRight className={`w-4 h-4 ${currentPage === 'contact' ? 'text-[#0070E0]' : 'text-slate-400'}`} />
            </a>

            <div className="pt-4 mt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLinkClick('meeting');
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-full bg-[#0A1C3E] text-white text-sm font-semibold hover:bg-[#0070E0] transition shadow-xs cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Meeting (30 Min)</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuote();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-full border border-slate-300 text-[#0A1C3E] text-sm font-semibold hover:border-[#0A1C3E] hover:bg-slate-50 transition cursor-pointer"
              >
                <span>Request a Commercial Quote</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Drawer Quick Contact & Hub Info */}
            <div className="pt-4 mt-2 border-t border-slate-100 text-xs text-slate-500 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-[#0070E0]" />
                  <span>Sabarkantha, Gujarat</span>
                </span>
                <span className="flex items-center space-x-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>10:00 - 18:00 IST</span>
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 text-slate-400">
                <span>Follow Origintra:</span>
                <div className="flex items-center space-x-3 text-slate-600">
                  <a href={COMPANY_CONFIG.facebookUrl || "https://www.facebook.com/origintra.exim"} target="_blank" rel="noopener noreferrer" className="hover:text-[#0070E0] p-1" aria-label="Facebook">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  </a>
                  <a href={COMPANY_CONFIG.linkedinUrl || "https://www.linkedin.com/company/origintra-exim"} target="_blank" rel="noopener noreferrer" className="hover:text-[#0070E0] p-1" aria-label="LinkedIn">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                  </a>
                  <a href={COMPANY_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#0070E0] p-1" aria-label="Instagram">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
