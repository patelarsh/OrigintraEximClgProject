import React from 'react';
import { X, ShieldCheck, FileText, Truck, Cookie } from 'lucide-react';
import { COMPANY_CONFIG } from '../data/company';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyType: 'privacy' | 'terms' | 'shipping' | 'cookies';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  policyType
}) => {
  if (!isOpen) return null;

  const contentMap = {
    privacy: {
      title: 'Privacy Policy',
      icon: ShieldCheck,
      updated: 'March 2026',
      sections: [
        {
          heading: '1. Commitment to Commercial Confidentiality',
          text: 'Origintra Exim operates strictly as a business-to-business (B2B) international trading and export firm. We respect corporate data confidentiality and collect only information necessary to conduct legitimate commercial trade, verify trade credentials, and execute export contracts.'
        },
        {
          heading: '2. Information We Collect',
          text: 'When submitting inquiries or Requests for Quotation (RFQs), we collect corporate contact details including company name, business email, telephone/WhatsApp contact, country of registration, target commodity specifications, and destination discharge ports.'
        },
        {
          heading: '3. Use of Commercial Data',
          text: 'Your commercial information is strictly utilized to prepare proforma invoices, coordinate pre-shipment inspections, arrange container ocean bookings, and generate regulatory export documentation. We do not sell, rent, or lease corporate data to third parties.'
        },
        {
          heading: '4. Data Security & Storage',
          text: 'Commercial communications and contractual trade records are stored in secure enterprise databases compliant with modern digital security protocols. Inquiries may be retained for auditing and regulatory export compliance.'
        }
      ]
    },
    terms: {
      title: 'Terms & Conditions',
      icon: FileText,
      updated: 'March 2026',
      sections: [
        {
          heading: '1. Commercial Contract Framework',
          text: 'All trade agreements, proforma invoices, and export sales confirmations executed by Origintra Exim are governed by the specific terms stipulated in formal commercial contracts and sales confirmations mutually signed by authorized corporate signatories.'
        },
        {
          heading: '2. Trade Incoterms (Incoterms® 2020)',
          text: 'Unless explicitly amended in written contracts, commercial transactions adhere to ICC Incoterms® 2020 rules (FOB, CFR, or CIF). Risk and title transfer points are defined strictly in accordance with the agreed Incoterm.'
        },
        {
          heading: '3. Quality Specifications & Tolerances',
          text: 'Commodity grade specifications, moisture ceilings, optical Sortex purity, and microbiological parameters are agreed prior to order confirmation and documented on the Certificate of Analysis (COA). Inspection clauses must be established prior to cargo stuffing.'
        },
        {
          heading: '4. Force Majeure & Maritime Risks',
          text: 'Neither party shall be held liable for failure or delay in performance resulting from events beyond reasonable control, including natural disasters, maritime canal blockages, sovereign trade sanctions, or port embargoes.'
        }
      ]
    },
    shipping: {
      title: 'Shipping & Maritime Policy',
      icon: Truck,
      updated: 'March 2026',
      sections: [
        {
          heading: '1. Gateway Port Operations',
          text: 'Origintra Exim executes container stuffing and customs export clearances primarily through Mundra Port (INMUN1), Jawaharlal Nehru Port - Nhava Sheva (INNSA1), and Cochin Port (INCOK1), utilizing accredited Container Freight Stations (CFS).'
        },
        {
          heading: '2. Seaworthy Cargo Protection',
          text: 'All export containers undergo rigorous physical inspection prior to loading. To safeguard spice quality across ocean voyages, containers are equipped with industrial moisture-absorbing calcium chloride desiccant poles and corrugated floor liners.'
        },
        {
          heading: '3. Bill of Lading & Documentation Dispatch',
          text: 'Clean On-Board Ocean Bills of Lading, Phytosanitary Certificates, Certificates of Origin, and packing lists are verified immediately upon vessel departure. Non-negotiable digital copies are transmitted via secure email, followed by courier dispatch of original documents.'
        },
        {
          heading: '4. Demurrage & Destination Handling',
          text: 'Unless special free-time detention clauses are contracted under CIF terms, destination terminal handling charges, customs clearance, and container demurrage at the discharge port remain the responsibility of the consignee.'
        }
      ]
    },
    cookies: {
      title: 'Cookie Policy',
      icon: Cookie,
      updated: 'March 2026',
      sections: [
        {
          heading: '1. Essential Operational Cookies',
          text: 'Origintra Exim uses essential, non-intrusive cookies strictly required for website technical functionality, language preferences, and form state preservation during your active session.'
        },
        {
          heading: '2. Analytics & Performance',
          text: 'We may employ aggregated, anonymized analytical tools to understand website traffic patterns, popular commodity pages, and technical load times to continuously enhance international buyer user experience.'
        },
        {
          heading: '3. Managing Your Preferences',
          text: 'You may adjust your browser settings at any time to decline cookies or receive notifications when cookies are deployed. Disabling essential cookies may affect interactive features such as RFQ quote prefilling.'
        }
      ]
    }
  };

  const activeContent = contentMap[policyType];
  const IconComp = activeContent.icon;

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
                {activeContent.title}
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
            <span>Effective: {activeContent.updated}</span>
          </div>

          {activeContent.sections.map((sec, idx) => (
            <div key={idx} className="space-y-1.5">
              <h3 className="font-bold text-[#0F172A] text-base">
                {sec.heading}
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                {sec.text}
              </p>
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
