import React from 'react';
import { 
  Home, 
  ArrowLeft, 
  Package, 
  ShieldCheck, 
  Globe, 
  BookOpen, 
  Mail, 
  Phone, 
  ArrowRight,
  Compass,
  FileQuestion,
  Search
} from 'lucide-react';
import { COMPANY_CONFIG } from '../data/company';
import { getHref } from '../utils/routes';

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
  onOpenQuote: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigate,
  onOpenQuote
}) => {
  const quickLinks = [
    {
      title: 'Spices Catalog',
      desc: 'Browse 27+ export-grade Indian spices, whole seeds, and grounded powders with laboratory specs.',
      icon: Package,
      page: 'products',
      tag: 'Catalog'
    },
    {
      title: 'Our Story & Ethos',
      desc: 'Learn about our Gujarat processing facilities, sorting infrastructure, and farmgate sourcing.',
      icon: BookOpen,
      page: 'about',
      tag: 'Company'
    },
    {
      title: 'Certificates & Quality',
      desc: 'Statutory compliance details: APEDA, FSSAI, Spices Board registrations and moisture testing.',
      icon: ShieldCheck,
      page: 'quality',
      tag: 'Compliance'
    },
    {
      title: 'Global Export Reach',
      desc: 'Active maritime trade corridors, container freight handling, and 14+ destination countries.',
      icon: Globe,
      page: 'global-reach',
      tag: 'Logistics'
    }
  ];

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-800">
      {/* Top ambient highlight */}
      <div className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/70">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-100/50 via-sky-50/30 to-transparent blur-3xl opacity-70" />
        </div>

        <div className="container-x mx-auto max-w-4xl px-4 text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#0070E0] text-xs font-semibold tracking-wide uppercase mb-6 animate-in fade-in duration-300">
            <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Error 404 • Page Not Found</span>
          </div>

          {/* Big refined 404 Display */}
          <div className="relative mb-4 select-none">
            <span className="text-8xl sm:text-9xl font-extrabold tracking-tight text-slate-200/70 block font-mono">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileQuestion className="w-16 h-16 sm:w-20 sm:h-20 text-[#0070E0]/80 stroke-[1.2]" />
            </div>
          </div>

          {/* Headline & Subtitle */}
          <h1 className="text-2xl sm:text-4xl font-bold text-[#0A1C3E] tracking-tight mb-4">
            Destination Not On The Export Manifest
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
            The cargo route or document URL you attempted to access cannot be located. 
            It may have been relocated, renamed, or temporarily diverted during a scheduled catalog update.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0070E0] hover:bg-[#005bb5] text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              <Home className="w-4 h-4" />
              <span>Return to Homepage</span>
            </button>

            <button
              onClick={() => onNavigate('products')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 hover:border-[#0A1C3E] bg-white text-slate-800 font-semibold text-sm transition-all hover:bg-slate-50 cursor-pointer"
            >
              <Package className="w-4 h-4 text-slate-500" />
              <span>Explore Spices Catalog</span>
            </button>

            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-100/80 text-slate-700 font-semibold text-sm transition-all hover:bg-slate-200/60 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-slate-500" />
              <span>Contact Trade Desk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Destination Directory */}
      <div className="container-x mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-lg sm:text-xl font-bold text-[#0A1C3E] tracking-tight">
            Popular Corporate Destinations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Navigate directly to one of our primary agricultural export sections:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href={getHref(item.page)}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                    e.preventDefault();
                    onNavigate(item.page);
                  }
                }}
                className="group p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#0070E0]/50 transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-[#0070E0] text-[#0070E0] group-hover:text-white transition-colors flex items-center justify-center">
                      <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-[#0070E0] transition-colors text-sm mb-1.5 flex items-center justify-between">
                    <span>{item.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#0070E0]" />
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </a>
            );
          })}
        </div>

        {/* Trade Support Callout Card */}
        <div className="mt-12 bg-gradient-to-r from-[#0A1C3E] to-[#122b5e] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#38BDF8] uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
              <span>International Trade Desk</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">
              Looking for a Specific Commodity or FOB Quotation?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Our export specialists can assist directly with HS code classifications, 
              current mandi pricing, and commercial container bookings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenQuote}
              className="px-5 py-2.5 rounded-xl bg-[#0070E0] hover:bg-[#005bb5] text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              Request Quote
            </button>
            <a
              href={`mailto:${COMPANY_CONFIG.primaryEmail}`}
              className="px-4 py-2.5 rounded-xl border border-slate-600 hover:border-slate-400 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Email Us</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
