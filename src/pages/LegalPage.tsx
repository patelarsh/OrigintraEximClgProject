import React from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Truck, 
  Cookie, 
  ChevronRight, 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2,
  FileCheck,
  Anchor
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCompanyConfig } from '../hooks/useCompanyConfig';
import { ROUTES } from '../utils/routes';
import { AdminStorage } from '../services/adminStorage';
import { LegalPolicyType, LegalPoliciesMap, DEFAULT_LEGAL_POLICIES } from '../data/legalPolicies';
export type { LegalPolicyType };

interface LegalPageProps {
  policyType: LegalPolicyType;
  onNavigate: (page: string) => void;
  onOpenQuote: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({
  policyType,
  onNavigate,
  onOpenQuote
}) => {
  const companyConfig = useCompanyConfig();

  const [policies, setPolicies] = useState<LegalPoliciesMap>(() => AdminStorage.getLegalPolicies());

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e?.detail) {
        setPolicies(e.detail);
      } else {
        setPolicies(AdminStorage.getLegalPolicies());
      }
    };
    window.addEventListener('origintra_legal_policies_updated', handleUpdate);
    return () => window.removeEventListener('origintra_legal_policies_updated', handleUpdate);
  }, []);

  const POLICY_ICONS: Record<LegalPolicyType, React.ComponentType<{ className?: string }>> = {
    privacy: ShieldCheck,
    terms: FileText,
    shipping: Truck,
    cookies: Cookie
  };

  const activePolicy = policies[policyType] || policies.privacy;
  const ActivePolicyIcon = POLICY_ICONS[policyType] || ShieldCheck;

  const handleTabClick = (type: LegalPolicyType) => {
    onNavigate(policies[type].path);
  };

  return (
    <div className="bg-[#F8FAFC] text-slate-800 min-h-screen">
      
      {/* 1. HERO BANNER (Common Header Design) */}
      <section className="relative overflow-hidden bg-[#0A1C3E] text-white py-12 sm:py-20 md:py-28 shadow-xs">
        <div className="container-x mx-auto max-w-[1440px] relative">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
              {activePolicy.eyebrow}
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-white">
              {activePolicy.title}<span className="text-[#0070E0]">.</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed pt-1 sm:pt-2">
              {activePolicy.lead}
            </p>
          </div>
        </div>
      </section>

      {/* 2. POLICY SWITCHER TABS BAR */}
      <section className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="container-x mx-auto max-w-[1440px]">
          <div className="flex items-center overflow-x-auto no-scrollbar py-2 sm:py-3 gap-2 sm:gap-3">
            {(Object.keys(policies) as LegalPolicyType[]).map((key) => {
              const pol = policies[key];
              const TabIcon = POLICY_ICONS[key] || ShieldCheck;
              const isActive = policyType === key;

              return (
                <button
                  key={key}
                  onClick={() => handleTabClick(key)}
                  className={`inline-flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#0070E0] text-white shadow-md shadow-blue-600/25'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{pol.navLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. MAIN BODY & SIDEBAR */}
      <section className="py-10 sm:py-16">
        <div className="container-x mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left 8 Columns: Detailed Policy Articles */}
            <div className="lg:col-span-8 space-y-8">
              
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-10">
                {/* Policy Metadata Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100 text-xs text-slate-500 font-medium">
                  <span>Effective Date: <strong className="text-slate-800">{activePolicy.effectiveDate}</strong></span>
                  <span>Entity: <strong className="text-slate-800">{companyConfig.legalName}</strong></span>
                  <span>Jurisdiction: <strong className="text-slate-800">Ahmedabad, Gujarat, India</strong></span>
                </div>
                {activePolicy.sections.map((section, idx) => (
                  <article
                    key={section.id}
                    id={section.id}
                    className={`space-y-4 ${
                      idx !== 0 ? 'pt-8 border-t border-slate-100' : ''
                    }`}
                  >
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
                      {section.title}
                    </h2>

                    {section.content.map((p, pIdx) => (
                      <p key={pIdx} className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                        {p}
                      </p>
                    ))}

                    {/* Bullet Points if present */}
                    {section.bullets && section.bullets.length > 0 && (
                      <ul className="space-y-2.5 pt-1 pl-1">
                        {section.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700 leading-normal">
                            <CheckCircle2 className="w-4 h-4 text-[#0070E0] shrink-0 mt-0.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Highlight Callout Box if present */}
                    {section.callout && (
                      <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-sky-50/80 border border-sky-100 text-slate-800 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0070E0]">
                          <FileCheck className="w-4 h-4 text-[#0070E0]" />
                          <span>{section.callout.title}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                          {section.callout.text}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>

            </div>

            {/* Right 4 Columns: Sticky Quick Links & Compliance Desk Card */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Quick Table of Contents Card */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <FileText className="w-4 h-4 text-[#0070E0]" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Table of Contents
                  </h3>
                </div>

                <ul className="space-y-2 text-xs sm:text-sm">
                  {activePolicy.sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="text-slate-600 hover:text-[#0070E0] transition-colors flex items-center gap-2 py-1"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{section.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Corporate Compliance Desk Card */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-[#0070E0]" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Corporate Compliance Desk
                  </h3>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  For formal regulatory audits, buyer compliance questionnaires, or documentation requests, contact our designated trade officer:
                </p>

                <div className="space-y-3 pt-1 text-xs sm:text-sm">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-4 h-4 text-[#0070E0] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Compliance Email</span>
                      <a
                        href={`mailto:${companyConfig.primaryEmail}`}
                        className="text-slate-900 font-bold hover:text-[#0070E0] transition"
                      >
                        {companyConfig.primaryEmail}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-4 h-4 text-[#0070E0] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Direct Trade Line</span>
                      <a
                        href={`tel:${companyConfig.phone}`}
                        className="text-slate-900 font-bold hover:text-[#0070E0] transition font-mono"
                      >
                        {companyConfig.phoneDisplay}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-[#0070E0] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Registered Jurisdiction</span>
                      <span className="text-slate-900 font-bold block">
                        {companyConfig.headOffice.city}, {companyConfig.headOffice.state}, India
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Commercial Inquiries CTA Card */}
              <div className="bg-gradient-to-br from-[#07152D] to-[#0A1C3E] rounded-2xl p-6 text-white space-y-4 shadow-lg border border-slate-800">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                  <Anchor className="w-4 h-4 text-[#38BDF8]" />
                  <span>Trade Feasibility</span>
                </div>

                <h4 className="text-lg font-display font-bold text-white tracking-tight leading-snug">
                  Require Specific Export Terms or Private Labeling?
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  Our commercial trade desk prepares formal proforma invoices with precise Incoterms, container loadability, and laboratory Feasibility within 24 hours.
                </p>

                <div className="pt-2 space-y-2.5">
                  <button
                    onClick={onOpenQuote}
                    className="w-full bg-[#0070E0] hover:bg-[#005bb5] active:scale-[0.98] text-white py-3 px-4 rounded-xl text-xs font-semibold tracking-wide cursor-pointer shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Submit Sourcing Enquiry</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>

                  <button
                    onClick={() => onNavigate('contact')}
                    className="w-full bg-white/10 hover:bg-white/15 border border-white/20 active:scale-[0.98] text-white py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide cursor-pointer transition-all flex items-center justify-center space-x-1.5"
                  >
                    <span>Contact Trade Desk</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
