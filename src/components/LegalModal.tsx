import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, Truck, Cookie } from 'lucide-react';
import { COMPANY_CONFIG } from '../data/company';
import { AdminStorage } from '../services/adminStorage';
import { LegalPolicyType, LegalPoliciesMap } from '../data/legalPolicies';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyType: LegalPolicyType;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  policyType
}) => {
  const [policies, setPolicies] = useState<LegalPoliciesMap>(() => AdminStorage.getLegalPolicies());

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e?.detail) setPolicies(e.detail);
      else setPolicies(AdminStorage.getLegalPolicies());
    };
    window.addEventListener('origintra_legal_policies_updated', handleUpdate);
    return () => window.removeEventListener('origintra_legal_policies_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const icons: Record<LegalPolicyType, React.ComponentType<{ className?: string }>> = {
    privacy: ShieldCheck,
    terms: FileText,
    shipping: Truck,
    cookies: Cookie
  };

  const activePolicy = policies[policyType] || policies.privacy;
  const IconComp = icons[policyType] || ShieldCheck;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="bg-[#0A1C3E] px-4 sm:px-8 py-4 sm:py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-[#38BDF8] flex items-center justify-center shrink-0">
              <IconComp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-sans text-slate-400 uppercase tracking-wider block">
                Origintra Exim Legal
              </span>
              <h2 className="text-lg sm:text-2xl font-display font-semibold text-white">
                {activePolicy.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-8 max-h-[80vh] overflow-y-auto space-y-5 sm:space-y-6 text-sm text-slate-700">
          <div className="text-xs text-slate-400 pb-2 border-b border-slate-100 flex justify-between">
            <span>Corporate Entity: {COMPANY_CONFIG.legalName}</span>
            <span>Effective: {activePolicy.effectiveDate}</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
            {activePolicy.lead}
          </p>

          {activePolicy.sections.map((sec, idx) => (
            <div key={sec.id || idx} className="space-y-1.5">
              <h3 className="font-bold text-[#0F172A] text-base">
                {sec.title}
              </h3>
              {sec.content.map((p, pIdx) => (
                <p key={pIdx} className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                  {p}
                </p>
              ))}
              {sec.bullets && sec.bullets.length > 0 && (
                <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1 pt-1">
                  {sec.bullets.map((b, bIdx) => (
                    <li key={bIdx}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <span>Direct questions to: {COMPANY_CONFIG.primaryEmail}</span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-[#0A1C3E] hover:bg-[#0070E0] text-white font-semibold transition cursor-pointer self-start sm:self-auto"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
