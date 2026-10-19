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
import { useCompanyConfig } from '../hooks/useCompanyConfig';
import { ROUTES } from '../utils/routes';

export type LegalPolicyType = 'privacy' | 'terms' | 'shipping' | 'cookies';

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

  const POLICIES: Record<LegalPolicyType, {
    title: string;
    navLabel: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    eyebrow: string;
    lead: string;
    effectiveDate: string;
    sections: {
      id: string;
      title: string;
      content: string[];
      callout?: {
        title: string;
        text: string;
      };
      bullets?: string[];
    }[];
  }> = {
    privacy: {
      title: 'Privacy Policy',
      navLabel: 'Privacy Policy',
      path: ROUTES.privacy,
      icon: ShieldCheck,
      eyebrow: 'Commercial Data Governance & Confidentiality',
      lead: 'Origintra Exim operates strictly as a business-to-business (B2B) international agricultural export enterprise. This Commercial Privacy Policy outlines our standards for gathering, safeguarding, and utilizing corporate trade inquiries, specifications, and shipment records.',
      effectiveDate: 'March 2026',
      sections: [
        {
          id: 'scope',
          title: '1. Commercial Scope & B2B Principles',
          content: [
            'Origintra Exim ("the Company", "we", "us", or "our") respects the proprietary nature of commercial trade information. We do not engage in retail consumer profiling or consumer retail marketing.',
            'All data collected through our digital portals, email correspondence, WhatsApp trade desk, or formal Requests for Quotation (RFQs) is handled strictly for verifying international trade viability, generating proforma invoices, and executing export freight operations.'
          ],
          callout: {
            title: 'Zero Third-Party Data Monetization',
            text: 'We never sell, rent, monetize, or lease corporate customer data, commercial trade specifications, or partner contact information to advertising brokers or external marketing agencies.'
          }
        },
        {
          id: 'data-collected',
          title: '2. Information We Collect',
          content: [
            'To provide accurate export freight quotations and verify regulatory trade eligibility, we may collect the following corporate information:'
          ],
          bullets: [
            'Corporate Identification: Company legal name, trade registration number, business address, and registered country.',
            'Trade Representative Details: Authorized buyer/trader name, corporate email address, business telephone, and direct WhatsApp contact.',
            'Trade & Commodity Specifications: Inquired spice commodities (whole, crushed, or ground forms), target volume, target grade, ASTA color, SHU heat, purity levels, and packaging preferences.',
            'Logistical Parameters: Intended destination discharge port (e.g., Jebel Ali, Rotterdam, Singapore, Felixstowe, New York), preferred Incoterms (FOB, CFR, CIF), and tentative shipping schedule.'
          ]
        },
        {
          id: 'use-of-data',
          title: '3. Utilization of Commercial Information',
          content: [
            'Collected corporate data is processed strictly for legitimate export business operations:',
            '• Preparing formal proforma quotations, container loadability studies, and export cost estimates.',
            '• Processing pre-shipment quality certifications with accredited testing laboratories (SGS, Eurofins, or Spices Board of India labs).',
            '• Securing ocean freight container space bookings with maritime container shipping lines (Maersk, MSC, CMA CGM, Hapag-Lloyd, etc.).',
            '• Generating statutory export documentation including Phytosanitary Certificates, Certificates of Origin, Bills of Lading, and Customs Shipping Bills.'
          ]
        },
        {
          id: 'regulatory-disclosure',
          title: '4. Statutory & Regulatory Disclosures',
          content: [
            'As an accredited Indian exporter, Origintra Exim complies with mandatory legal disclosure requirements imposed by governmental and maritime authorities:',
            'Commercial shipping data is transmitted exclusively to authorized customs clearance brokers, the Directorate General of Foreign Trade (DGFT), Indian Customs (ICEGATE), Port Health Authorities, and maritime carriers strictly necessary to release and transport cargo.'
          ],
          callout: {
            title: 'Statutory Export Audit Compliance',
            text: 'Under Indian Customs regulations and foreign trade legislation, commercial export declarations, shipping bills, and proforma contracts are archived for statutory verification for a minimum required period of seven (7) years.'
          }
        },
        {
          id: 'data-security',
          title: '5. Technical & Data Security Safeguards',
          content: [
            'All web communications across origintra.com are secured using 256-bit TLS/SSL encryption protocols. Administrative portal access is guarded by cryptographic authentication and role-based access restrictions.',
            'Physical trade files and digital bills of lading are stored within secure enterprise database facilities adhering to global data protection benchmarks (including EU GDPR B2B provisions and the Digital Personal Data Protection Act of India).'
          ]
        },
        {
          id: 'contact-dpo',
          title: '6. Trade Inquirer Rights & Compliance Inquiries',
          content: [
            'Authorized commercial representatives may at any time request an update, verification, or deletion of their corporate contact details from our active quotation directory, subject to statutory customs record-keeping obligations.',
            'For compliance or confidentiality questions, please direct formal inquiries to our Legal & Compliance Desk at export@origintra.com.'
          ]
        }
      ]
    },
    terms: {
      title: 'Terms & Conditions',
      navLabel: 'Terms & Conditions',
      path: ROUTES.terms,
      icon: FileText,
      eyebrow: 'Commercial Governance & International Trade Contract Framework',
      lead: 'These Terms & Conditions govern all export inquiries, formal proforma invoices, sales contracts, and physical commodity dispatches executed by Origintra Exim. By requesting a commercial quotation or contracting with us, buyers acknowledge and accept these trading provisions.',
      effectiveDate: 'March 2026',
      sections: [
        {
          id: 'contract-framework',
          title: '1. Commercial Contract Framework',
          content: [
            'All international trade transactions conducted by Origintra Exim are governed by mutually confirmed Proforma Invoices (PI) and formal Commercial Sales Contracts executed by authorized representatives of both buyer and seller.',
            'In the event of any specific divergence between digital website summaries and a fully signed bilateral Sales Contract, the clauses of the signed bilateral Commercial Contract shall take precedence.'
          ]
        },
        {
          id: 'incoterms',
          title: '2. International Trade Incoterms® 2020',
          content: [
            'All price quotations and delivery obligations are structured under the International Chamber of Commerce (ICC) Incoterms® 2020 rules:',
            '• Free on Board (FOB): Origintra Exim is responsible for delivery across vessel rail at Indian departure ports (Mundra, Nhava Sheva, or Cochin) including domestic transport and customs export clearance. Ocean freight and destination risks transfer to the buyer upon loading.',
            '• Cost & Freight (CFR): Origintra Exim arranges and prepays ocean freight to the named discharge port. Cargo risk transfers upon vessel loading at Indian departure gateway.',
            '• Cost, Insurance & Freight (CIF): In addition to CFR obligations, Origintra Exim provides Institute Cargo Clauses (A) or agreed marine transit insurance covering cargo until discharge port arrival.'
          ],
          callout: {
            title: 'Incoterms Transfer Point',
            text: 'Cargo risk, title, and maritime liability transfer strictly according to the mutually contracted Incoterms® 2020 clause specified on the formal Proforma Invoice.'
          }
        },
        {
          id: 'quality-specifications',
          title: '3. Quality Standards, Grade Tolerances & COA',
          content: [
            'Export commodities (whole spices, seeds, pulverized powders, and agricultural derivatives) are supplied against agreed physical, chemical, and microbiological specifications detailed in the contract annexure.',
            'Tolerances for moisture ceilings, Sortex optical purity, volatile oil retention, and foreign matter percentages are documented on the official Certificate of Analysis (COA) issued by accredited laboratories prior to vessel stuffing.'
          ]
        },
        {
          id: 'inspection-verification',
          title: '4. Pre-Shipment Inspection & Testing',
          content: [
            'Buyers reserve the right to mandate third-party quality and weight verification at the Indian port of loading prior to container sealing. Authorized inspection agencies include SGS, Eurofins, Bureau Veritas, or Geo-Chem.',
            'The inspection agency’s sealed composite sample analysis report and loading tally sheet shall serve as prima facie evidence of conformity at the time of loading.'
          ]
        },
        {
          id: 'payment-terms',
          title: '5. Commercial Payment Terms',
          content: [
            'Standard commercial terms accepted by Origintra Exim include:',
            '• Irrevocable, Confirmed Documentary Letter of Credit (L/C) payable at sight against clean export shipping documents issued by a first-class international bank.',
            '• Telegraphic Transfer (T/T): Advance deposit against proforma confirmation, with remaining balance payable against digital presentation of verified On-Board Ocean Bill of Lading copy.',
            'Custom commercial credit structures and milestone payments may be approved for long-term contracted buyers subject to credit vetting.'
          ]
        },
        {
          id: 'force-majeure',
          title: '6. Force Majeure & Maritime Perils',
          content: [
            'Neither party shall be held liable for failure or delay in performance resulting from causes beyond reasonable control, including natural catastrophes, floods, sovereign trade embargoes, canal transit blockages (e.g. Suez Canal), maritime piracy, strikes, or port closures.',
            'Notice of Force Majeure with supporting documentation from competent commercial chambers must be provided within seven (7) business days of occurrence.'
          ]
        },
        {
          id: 'jurisdiction',
          title: '7. Governing Law & Commercial Arbitration',
          content: [
            'All commercial transactions, contractual interpretations, and trade disputes arising out of contracts with Origintra Exim shall be governed by and construed in accordance with the substantive laws of the Republic of India.',
            'Any unresolved commercial dispute shall be submitted to binding commercial arbitration in Ahmedabad, Gujarat, India, in accordance with the Arbitration and Conciliation Act, 1996, conducted in the English language.'
          ]
        }
      ]
    },
    shipping: {
      title: 'Shipping Policy',
      navLabel: 'Shipping Policy',
      path: ROUTES.shipping,
      icon: Truck,
      eyebrow: 'Export Logistics, Port Gateways & Seaworthy Container Protection',
      lead: 'Origintra Exim coordinates global containerized freight operations connecting prime Indian agricultural mandi belts to major commercial container hubs across Europe, the Middle East, Southeast Asia, the Americas, and Africa.',
      effectiveDate: 'March 2026',
      sections: [
        {
          id: 'port-gateways',
          title: '1. Primary Gateway Ports of Loading',
          content: [
            'Origintra Exim operates freight stuffing and customs export clearance through premier Indian maritime container ports depending on commodity origin and maritime route efficiency:'
          ],
          bullets: [
            'Mundra Port (INMUN1), Gujarat: Prime gateway for cumin, fennel, coriander, sesame, and Northwest agricultural mandi lots.',
            'Jawaharlal Nehru Port - Nhava Sheva (INNSA1), Maharashtra: Ideal for multi-commodity consolidated containers, spices, and central belt dispatches.',
            'Cochin Port (INCOK1) & Tuticorin (INTUT1): Primary gateways for South Indian black pepper, cardamom, turmeric, and ginger.'
          ]
        },
        {
          id: 'container-stuffing',
          title: '2. Seaworthy Cargo Protection Standards',
          content: [
            'Spice cargoes are naturally sensitive to maritime humidity, condensation, and temperature shifts across equatorial shipping voyages. Origintra Exim applies stringent container preparation protocols:'
          ],
          bullets: [
            'Container Inspection: Every 20ft / 40ft container undergoes a 7-point structural inspection for floor integrity, odorlessness, and water-tightness before release.',
            'Moisture-Control Desiccant Poles: High-absorption industrial calcium chloride desiccant hanging poles (min 200% absorption capacity) installed to prevent container rain.',
            'Corrugated Paper & Kraft Liners: Heavy-duty corrugated cardboard floor and wall lining preventing condensation contact and bag scuffing.',
            'Food-Grade Multi-Ply Sacks: Multi-wall paper sacks with inner polyethylene liners or heavy-duty woven polypropylene (PP) export bags preventing micro-moisture ingress.'
          ],
          callout: {
            title: 'Cargo Fumigation & Pest Control',
            text: 'All export containers undergo statutory aluminium phosphide or methyl bromide fumigation by accredited agencies in compliance with destination country quarantine regulations, followed by official Phytosanitary certification.'
          }
        },
        {
          id: 'document-dispatch',
          title: '3. Ocean Documentation & Courier Dispatch',
          content: [
            'Prompt document transmission is critical to prevent demurrage at the destination port. Immediately upon vessel sailing, clean export documents are generated, verified, and transmitted:',
            '1. Full set (3/3) Clean On-Board Ocean Bills of Lading (or Express Telex Release upon request).',
            '2. Commercial Invoice indicating HS Codes, Incoterms, and currency breakdown.',
            '3. Detailed Packing List showing gross/net weights, bag tallies, and container seal numbers.',
            '4. Official Phytosanitary Certificate issued by the Ministry of Agriculture, Govt. of India.',
            '5. Certificate of Origin issued by authorized Chamber of Commerce or Spices Board of India.',
            '6. Certified Certificate of Analysis (COA) / Quality Inspection Report.'
          ]
        },
        {
          id: 'demurrage-free-time',
          title: '4. Destination Port Demurrage & Free Time',
          content: [
            'Unless specifically negotiated under CIF delivery terms with extended carrier free time, container detention, terminal handling charges (THC), import customs clearance, and destination port demurrage remain the operational responsibility of the consignee.',
            'Buyers are urged to coordinate closely with their designated customs clearing broker upon receipt of vessel sailing advisories and digital non-negotiable document copies.'
          ]
        },
        {
          id: 'marine-insurance',
          title: '5. Marine Transit Insurance',
          content: [
            'For CIF and CIP contracts, Origintra Exim procures comprehensive Marine Cargo Insurance under Institute Cargo Clauses (A) (All Risks) covering 110% of commercial invoice value from Indian warehouse dispatch to the consignee’s final designated destination warehouse.',
            'For FOB and CFR contracts, buyers must ensure adequate marine cargo transit insurance is bound prior to container vessel departure.'
          ]
        }
      ]
    },
    cookies: {
      title: 'Cookie Policy',
      navLabel: 'Cookie Policy',
      path: ROUTES.cookies,
      icon: Cookie,
      eyebrow: 'Web Technical Standards & Transparent Session Governance',
      lead: 'This Cookie Policy explains how Origintra Exim utilizes cookies and associated web storage mechanisms on origintra.com to ensure smooth technical navigation, responsive device rendering, and RFQ form preservation.',
      effectiveDate: 'March 2026',
      sections: [
        {
          id: 'what-are-cookies',
          title: '1. What Are Web Cookies?',
          content: [
            'Cookies are small alphanumeric text files stored on your computer, tablet, or smartphone when you visit web applications. They allow websites to remember user preferences, maintain session state, and enhance responsiveness across browsing visits.'
          ]
        },
        {
          id: 'cookie-types',
          title: '2. Types of Cookies Deployed on origintra.com',
          content: [
            'Origintra Exim deploys only minimal, privacy-centric cookies categorized as follows:'
          ],
          bullets: [
            'Strictly Essential Cookies: Technical session cookies necessary for page navigation, responsive breakpoint detection, and secure RFQ form submission.',
            'Preference & State Cookies: Retains your selected commercial commodity filter, recent search parameters, and quote modal state so inquiries are not lost upon page transition.',
            'Anonymous Performance Analytics: Aggregated, anonymized page performance metrics to detect slow loading routes, optimize mobile photography delivery, and improve website uptime.'
          ],
          callout: {
            title: 'Zero Third-Party Advertising Trackers',
            text: 'We do not employ cross-site behavioral tracking cookies, ad retargeting pixels, or social media data scraping scripts. Your commercial browsing on Origintra Exim remains confidential.'
          }
        },
        {
          id: 'managing-cookies',
          title: '3. Controlling & Disabling Browser Cookies',
          content: [
            'Most modern web browsers allow you to manage or block cookies through their privacy settings. You may configure your browser to decline all cookies or notify you whenever a cookie is stored:',
            '• Google Chrome: Settings > Privacy and Security > Third-Party Cookies',
            '• Mozilla Firefox: Settings > Privacy & Security > Cookies and Site Data',
            '• Apple Safari: Preferences > Privacy > Block All Cookies',
            '• Microsoft Edge: Settings > Cookies and Site Permissions',
            'Please note that disabling strictly essential cookies may impact interactive website features, such as prefilled commodity quotation inquiries.'
          ]
        },
        {
          id: 'policy-updates',
          title: '4. Updates to this Cookie Policy',
          content: [
            'Origintra Exim may update this Cookie Policy periodically to align with evolving digital standards and international compliance regulations. Any revisions will be published directly on this page with an updated effective date.'
          ]
        }
      ]
    }
  };

  const activePolicy = POLICIES[policyType] || POLICIES.privacy;

  const handleTabClick = (type: LegalPolicyType) => {
    onNavigate(POLICIES[type].path);
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
            {(Object.keys(POLICIES) as LegalPolicyType[]).map((key) => {
              const pol = POLICIES[key];
              const TabIcon = pol.icon;
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
