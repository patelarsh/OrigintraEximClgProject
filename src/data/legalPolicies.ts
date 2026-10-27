import { ROUTES } from '../utils/routes';

export type LegalPolicyType = 'privacy' | 'terms' | 'shipping' | 'cookies';

export interface LegalSection {
  id: string;
  title: string;
  content: string[];
  bullets?: string[];
  callout?: {
    title: string;
    text: string;
  };
}

export interface LegalPolicyData {
  title: string;
  navLabel: string;
  path: string;
  eyebrow: string;
  lead: string;
  effectiveDate: string;
  sections: LegalSection[];
}

export type LegalPoliciesMap = Record<LegalPolicyType, LegalPolicyData>;

export const DEFAULT_LEGAL_POLICIES: LegalPoliciesMap = {
  privacy: {
    title: 'Privacy Policy',
    navLabel: 'Privacy Policy',
    path: ROUTES.privacy,
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
