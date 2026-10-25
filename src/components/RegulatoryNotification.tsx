import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  X, 
  ShieldAlert, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileCheck
} from 'lucide-react';

interface RegulatoryNotificationProps {
  onNavigate?: (page: string) => void;
}

export const RegulatoryNotification: React.FC<RegulatoryNotificationProps> = ({ onNavigate }) => {
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
    // Check if dismissed in current session
    const isDismissed = sessionStorage.getItem('origintra_licensing_notice_dismissed');
    if (!isDismissed) {
      // Trigger smooth push animation after 800ms
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      // If previously dismissed, keep pill available
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
      {/* 1. Floating Push Notification Toast Card (Bottom Right / Mobile Bottom) */}
      {isOpen && (
        <aside
          role="region"
          aria-label="Important Regulatory and Licensing Notice"
          className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md md:max-w-lg z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300 transform-gpu"
        >
          <div className="bg-[#0b1d3a] border-2 border-amber-500/80 rounded-2xl shadow-2xl shadow-black/60 text-white overflow-hidden p-4 sm:p-5 backdrop-blur-md">
            {/* Top Bar with Icon & Close */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-400">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                      IMPORTANT NOTICE
                    </span>
                    <span className="text-[10px] sm:text-xs font-medium text-amber-300 flex items-center gap-1 bg-amber-950/60 border border-amber-700/50 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3 text-amber-400" />
                      Licenses Under Processing
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-1 leading-snug">
                    Regulatory &amp; Statutory Licensing Status
                  </h3>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                aria-label="Close licensing notification"
                title="Dismiss Notice"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Notification Content */}
            <div className="mt-3 text-xs sm:text-[13px] text-slate-200 leading-relaxed bg-[#051126]/70 border border-slate-700/60 rounded-xl p-3">
              <p className="font-semibold text-amber-200 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Currently Not Available Any Export Licenses (Under Process)</span>
              </p>
              <p className="text-slate-300 text-[11px] sm:text-xs">
                Please note that Origintra Exim is currently operating under valid Government of India <strong>GST Registration</strong>. Mandatory statutory export &amp; food safety licenses (<strong>IEC, Spices Board, FSSAI, APEDA</strong>) are currently under active application and regulatory processing, and will be completed as soon as possible.
              </p>
            </div>

            {/* Expandable Breakdown of Statuses */}
            {isDetailsExpanded && (
              <div className="mt-3 space-y-1.5 text-[11px] sm:text-xs text-slate-300 border-t border-slate-700/80 pt-3">
                <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-2.5 py-1.5">
                  <span className="font-medium text-emerald-300">GST Registration (Goods &amp; Services Tax)</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ACTIVE
                  </span>
                </div>

                <div className="flex items-center justify-between bg-amber-950/30 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
                  <span className="font-medium text-slate-200">DGFT Import Export Code (IEC)</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> IN PROCESS
                  </span>
                </div>

                <div className="flex items-center justify-between bg-amber-950/30 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
                  <span className="font-medium text-slate-200">Spices Board of India (CRES)</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> IN PROCESS
                  </span>
                </div>

                <div className="flex items-center justify-between bg-amber-950/30 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
                  <span className="font-medium text-slate-200">FSSAI Food Safety License</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> IN PROCESS
                  </span>
                </div>

                <div className="flex items-center justify-between bg-amber-950/30 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
                  <span className="font-medium text-slate-200">APEDA Export Registration</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" /> IN PROCESS
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 italic pt-1">
                  * In strict compliance with Indian laws, commercial export shipments will be executed upon final license grants.
                </p>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="mt-3.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="text-[11px] text-amber-300 hover:text-amber-200 font-medium underline flex items-center gap-1 transition-colors"
              >
                <span>{isDetailsExpanded ? 'Hide Status Breakdown' : 'View Status Breakdown'}</span>
                {isDetailsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md flex items-center gap-1.5"
              >
                <span>Understood</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Persistent Floating Badge / Pill (When dismissed, allows re-opening anytime) */}
      {isMinimized && !isOpen && (
        <aside
          role="region"
          aria-label="Licensing Status Pill"
          className="fixed bottom-4 left-4 z-40 animate-in fade-in duration-200"
        >
          <button
            onClick={handleOpenNotice}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#0b1d3a]/95 border border-amber-500/80 text-amber-300 shadow-lg hover:bg-[#112a55] transition-all hover:scale-105 group text-xs font-semibold backdrop-blur-md"
            title="Click to view Statutory Licensing & GST Status"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] font-medium text-slate-200">
              Notice: <span className="text-amber-300 font-bold">Licenses In Process</span> (GST Active)
            </span>
          </button>
        </aside>
      )}
    </>
  );
};
