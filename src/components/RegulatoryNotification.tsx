import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  AlertCircle, 
  FileText, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Ship 
} from 'lucide-react';
import { useCompanyConfig } from '../hooks/useCompanyConfig';

interface RegulatoryNotificationProps {
  onNavigate?: (page: string) => void;
}

export const RegulatoryNotification: React.FC<RegulatoryNotificationProps> = ({ onNavigate }) => {
  const companyConfig = useCompanyConfig();
  if (companyConfig.licensingNoticeEnabled === false) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setIsMinimized(false);
      setIsOpen(true);
    };
    window.addEventListener('open_regulatory_notice', handleOpen);
    return () => window.removeEventListener('open_regulatory_notice', handleOpen);
  }, []);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('origintra_licensing_notice_dismissed');
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setIsMinimized(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('origintra_licensing_notice_dismissed', 'true');
    setIsOpen(false);
    setIsMinimized(true);
  };

  const handleOpenNotice = () => {
    setIsMinimized(false);
    setIsOpen(true);
  };

  return (
    <>
      {/* 1. Centered Popup Modal Matching User Mockup */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="licensing-modal-title"
        >
          {/* Backdrop dismiss */}
          <div 
            className="absolute inset-0 cursor-pointer"
            onClick={handleDismiss}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,33,74,0.3)] border border-slate-100 p-6 sm:p-8 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            
            {/* Subtle Maritime World Map & Cargo Transit Arc Graphic */}
            <div className="absolute top-2 right-4 w-72 sm:w-80 h-36 pointer-events-none opacity-25 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 320 140" fill="none" aria-hidden="true">
                {/* Dot matrix map pattern */}
                <g fill="#94A3B8" opacity="0.6">
                  <circle cx="180" cy="30" r="1.5" /><circle cx="195" cy="32" r="1.5" /><circle cx="210" cy="35" r="1.5" /><circle cx="225" cy="40" r="1.5" />
                  <circle cx="170" cy="45" r="1.5" /><circle cx="185" cy="48" r="1.5" /><circle cx="200" cy="50" r="1.5" /><circle cx="215" cy="52" r="1.5" /><circle cx="230" cy="55" r="1.5" /><circle cx="245" cy="58" r="1.5" />
                  <circle cx="160" cy="60" r="1.5" /><circle cx="175" cy="62" r="1.5" /><circle cx="190" cy="65" r="1.5" /><circle cx="205" cy="68" r="1.5" /><circle cx="220" cy="70" r="1.5" /><circle cx="235" cy="72" r="1.5" /><circle cx="250" cy="75" r="1.5" /><circle cx="265" cy="78" r="1.5" />
                  <circle cx="180" cy="80" r="1.5" /><circle cx="195" cy="82" r="1.5" /><circle cx="210" cy="85" r="1.5" /><circle cx="225" cy="88" r="1.5" /><circle cx="240" cy="90" r="1.5" /><circle cx="255" cy="92" r="1.5" /><circle cx="270" cy="95" r="1.5" />
                  <circle cx="190" cy="100" r="1.5" /><circle cx="205" cy="102" r="1.5" /><circle cx="220" cy="105" r="1.5" /><circle cx="235" cy="108" r="1.5" /><circle cx="250" cy="110" r="1.5" />
                </g>
                {/* Curved nautical route */}
                <path d="M120 100 Q 200 40 280 45" stroke="#0070E0" strokeWidth="1.5" strokeDasharray="3 3" />
                {/* Destination pin */}
                <circle cx="280" cy="45" r="4" fill="#0070E0" />
                <circle cx="280" cy="45" r="8" stroke="#0070E0" strokeWidth="1" strokeDasharray="2 2" />
              </svg>
              {/* Miniature cargo vessel icon */}
              <div className="absolute top-[62px] left-[185px] transform -rotate-12 text-[#0070E0]">
                <Ship className="w-5 h-5 text-[#0070E0]" />
              </div>
            </div>

            {/* Top Row: Official Logo + Close Button */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <img 
                src="/assets/logo/origintra-official-logo.webp" 
                alt="Origintra Exim Logo" 
                className="h-8 sm:h-9 w-auto object-contain" 
              />
              <button
                type="button"
                onClick={handleDismiss}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close notification"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hero Header: Shield Icon Badge + Title */}
            <div className="flex items-start gap-4 sm:gap-5 mb-5 relative z-10">
              {/* Shield Icon Round Container */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#EBF4FE] flex items-center justify-center shrink-0 shadow-xs">
                <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 text-[#0070E0]" strokeWidth={1.75} />
              </div>

              {/* Title & Eyebrow Badge */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-[11px] sm:text-xs font-bold tracking-wide uppercase mb-2">
                  <AlertCircle className="w-3.5 h-3.5 fill-[#D97706] text-white" />
                  <span>IMPORTANT NOTICE</span>
                </div>
                <h2 id="licensing-modal-title" className="text-2xl sm:text-3xl font-display font-extrabold text-[#0F172A] leading-tight">
                  Regulatory &amp; Statutory<br />
                  <span className="text-[#0070E0]">Licensing Status</span>
                </h2>
              </div>
            </div>

            {/* Primary Content Container Box */}
            <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200/80 p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4 mb-5 relative z-10">
              {/* Document Icon with Badge */}
              <div className="relative w-11 h-11 rounded-full bg-[#EBF4FE] flex items-center justify-center shrink-0 mt-0.5 text-[#0070E0]">
                <FileText className="w-5 h-5 text-[#0070E0]" />
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center border-2 border-white">
                  !
                </span>
              </div>

              {/* Text Information (No Gujarati Text) */}
              <div className="flex-1">
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A] mb-1.5 leading-snug">
                  Currently Not Available Any Export Licenses (Under Process)
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  Please note that Origintra Exim is currently operating under valid Government of India <strong className="text-slate-900 font-semibold">GST Registration</strong>. Mandatory statutory export &amp; food safety licenses (<strong className="text-slate-900 font-semibold">IEC, Spices Board, FSSAI, APEDA</strong>) are currently under active application and regulatory processing, and will be completed as soon as possible.
                </p>
              </div>
            </div>

            {/* Expandable Statutory Breakdown List */}
            {isDetailsExpanded && (
              <div className="mb-5 space-y-2 border-t border-slate-100 pt-3.5 animate-in fade-in duration-200 relative z-10">
                <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-200 rounded-xl px-3.5 py-2">
                  <span className="text-xs font-semibold text-slate-800">GST Registration (Goods &amp; Services Tax)</span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ACTIVE
                  </span>
                </div>
                <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200 rounded-xl px-3.5 py-2">
                  <span className="text-xs font-semibold text-slate-800">DGFT Import Export Code (IEC)</span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> IN PROCESS
                  </span>
                </div>
                <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200 rounded-xl px-3.5 py-2">
                  <span className="text-xs font-semibold text-slate-800">Spices Board of India (CRES Registration)</span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> IN PROCESS
                  </span>
                </div>
                <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200 rounded-xl px-3.5 py-2">
                  <span className="text-xs font-semibold text-slate-800">FSSAI Food Safety License</span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> IN PROCESS
                  </span>
                </div>
                <div className="flex items-center justify-between bg-amber-50/70 border border-amber-200 rounded-xl px-3.5 py-2">
                  <span className="text-xs font-semibold text-slate-800">APEDA Export Registration</span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> IN PROCESS
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Row Action Controls */}
            <div className="flex items-center justify-between pt-2 relative z-10">
              <button
                type="button"
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0070E0] hover:text-[#005bb5] transition-colors cursor-pointer group"
              >
                <BarChart3 className="w-4 h-4 text-[#0070E0] shrink-0" />
                <span>{isDetailsExpanded ? 'Hide Status Breakdown' : 'View Status Breakdown'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-6 py-2.5 rounded-xl bg-[#0070E0] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <span>Understood</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. Minimized Floating Badge / Pill (When dismissed, allows re-opening anytime) */}
      {isMinimized && !isOpen && (
        <aside
          role="region"
          aria-label="Licensing Status Pill"
          className="fixed bottom-4 left-4 z-40 animate-in fade-in duration-200"
        >
          <button
            onClick={handleOpenNotice}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-amber-300 text-slate-800 shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-xs font-semibold group cursor-pointer"
            title="Click to view Statutory Licensing & GST Status"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-[11px] font-medium text-slate-700">
              Notice: <strong className="text-amber-600 font-bold">Licenses In Process</strong> (GST Active)
            </span>
          </button>
        </aside>
      )}
    </>
  );
};
