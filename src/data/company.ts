export interface CompanyConfig {
  name: string;
  legalName: string;
  tagline: string;
  domain: string;
  websiteUrl: string;
  primaryEmail: string;
  supportEmail: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  whatsappDisplay: string;
  whatsappUrl: string;
  calendlyUrl: string;
  googleMapsUrl?: string;
  headOffice: {
    title: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    note: string;
  };
  operationalPorts: Array<{
    name: string;
    code: string;
    type: string;
    location: string;
    transitFocus: string;
  }>;
  businessHours: {
    days: string;
    hours: string;
    timezone: string;
    deskNote: string;
  };
  instagramUrl: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  complianceStatement: string;
  sourcingStatement: string;
}

export const COMPANY_CONFIG: CompanyConfig = {
  name: 'Origintra Exim',
  legalName: 'Origintra Exim',
  tagline: 'Connecting Markets. Moving Possibilities.',
  domain: 'www.origintra.com',
  websiteUrl: 'https://www.origintra.com',
  primaryEmail: 'export@origintra.com',
  supportEmail: 'contact@origintra.com',
  phone: '+917069182990',
  phoneDisplay: '+91 70691 82990',
  whatsapp: '+917069182990',
  whatsappDisplay: '+91 70691 82990',
  whatsappUrl: 'https://wa.me/917069182990?text=Hello%20Origintra%20Exim,%20I%20am%20interested%20in%20sourcing%20quality%20spices.',
  calendlyUrl: 'https://calendly.com/origintraexim/30min',
  googleMapsUrl: 'https://maps.app.goo.gl/Yay1MwEGyTEiQhMu6',
  instagramUrl: 'https://www.instagram.com/origintra.exim/',
  facebookUrl: 'https://www.facebook.com/origintra.exim',
  linkedinUrl: 'https://www.linkedin.com/company/origintra-exim',
  headOffice: {
    title: 'Origintra Exim Export Desk',
    street: 'Export Trade Corridor',
    city: 'Sabarkantha / Ahmedabad Hubs',
    state: 'Gujarat',
    country: 'India',
    postalCode: 'India Export Hub',
    note: 'Visits and estate inspections arranged by prior trade appointment.'
  },
  operationalPorts: [
    {
      name: 'Mundra Port',
      code: 'INMUN1',
      type: 'Deep-water Container Terminal',
      location: 'Gujarat, West Coast India',
      transitFocus: 'Direct liner sailings to Middle East, Europe & North America'
    },
    {
      name: 'JNPT (Nhava Sheva)',
      code: 'INNSA1',
      type: 'Major Container Gateway',
      location: 'Maharashtra, West Coast India',
      transitFocus: 'Key sailings for Mediterranean, GCC and Asia-Pacific routes'
    },
    {
      name: 'Cochin Port',
      code: 'INCOK1',
      type: 'Traditional Spice Trade Port',
      location: 'Kerala, South-West Coast India',
      transitFocus: 'Direct gateway for Southern Indian spice belts (Cardamom & Pepper)'
    }
  ],
  businessHours: {
    days: 'Monday – Saturday',
    hours: '09:00 – 18:30 IST',
    timezone: 'UTC +05:30 (Indian Standard Time)',
    deskNote: 'Commercial enquiry responses dispatched within 24 to 48 business hours.'
  },
  complianceStatement: 'Documentation and certifications available according to product and destination requirements.',
  sourcingStatement: 'Direct sourcing relationships across key Indian agricultural zones with emphasis on batch consistency, moisture control, and export-grade packing.'
};

export interface ExportCertificate {
  id: string;
  name: string;
  fullName: string;
  authority: string;
  badge: string;
  description: string;
  logo: string;
  frameImage: string;
  frameImage2x?: string;
}

export const EXPORT_CERTIFICATIONS: ExportCertificate[] = [
  {
    id: 'iec',
    name: 'IEC',
    fullName: 'Import Export Code',
    authority: 'Directorate General of Foreign Trade (DGFT), Ministry of Commerce & Industry',
    badge: 'Statutory Export License',
    description: 'Mandatory primary business identification number issued by the Government of India enabling legal international export consignments.',
    logo: '/assets/certificates/iec.png',
    frameImage: '/assets/certificates/framed/iec.webp',
    frameImage2x: '/assets/certificates/framed/iec@2x.webp'
  },
  {
    id: 'apeda',
    name: 'APEDA',
    fullName: 'Agricultural and Processed Food Products Export Development Authority',
    authority: 'Ministry of Commerce & Industry, Govt. of India',
    badge: 'Export Promotion Council',
    description: 'Registered with APEDA for quality standards promotion, scheduled agricultural commodity monitoring, and verified international trade linkage.',
    logo: '/assets/certificates/apeda.png',
    frameImage: '/assets/certificates/framed/apeda.webp',
    frameImage2x: '/assets/certificates/framed/apeda@2x.webp'
  },
  {
    id: 'spices-board',
    name: 'Spices Board India',
    fullName: 'Certificate of Registration as Exporter of Spices (CRES)',
    authority: 'Spices Board, Ministry of Commerce & Industry',
    badge: 'Statutory Commodity Board',
    description: 'Authorized export accreditation ensuring pre-shipment sampling, mandatory laboratory clearance, moisture testing, and purity thresholds.',
    logo: '/assets/certificates/spices-board.png',
    frameImage: '/assets/certificates/framed/spices-board.webp',
    frameImage2x: '/assets/certificates/framed/spices-board@2x.webp'
  },
  {
    id: 'fssai',
    name: 'FSSAI',
    fullName: 'Food Safety and Standards Authority of India',
    authority: 'Ministry of Health and Family Welfare, Govt. of India',
    badge: 'Food Safety License',
    description: 'Guarantees that raw, whole, and ground spices are processed, graded, packed, and stored under strict hygienic and sanitary food safety conditions.',
    logo: '/assets/certificates/fssai.png',
    frameImage: '/assets/certificates/framed/fssai.webp',
    frameImage2x: '/assets/certificates/framed/fssai@2x.webp'
  },
  {
    id: 'gst',
    name: 'GST',
    fullName: 'Goods and Services Tax Registration',
    authority: 'Department of Revenue, Ministry of Finance, Govt. of India',
    badge: 'Tax Registered Exporter',
    description: 'Compliant formal commercial taxation registration ensuring validated legal invoicing, international banking compliance, and formal trade remittances.',
    logo: '/assets/certificates/gst-transparent.png',
    frameImage: '/assets/certificates/framed/gst.webp',
    frameImage2x: '/assets/certificates/framed/gst@2x.webp'
  },
  {
    id: 'msme',
    name: 'MSME',
    fullName: 'Ministry of Micro, Small and Medium Enterprises',
    authority: 'Govt. of India Enterprise Registration',
    badge: 'Recognized Enterprise',
    description: 'Formally registered commercial enterprise under the Ministry of Micro, Small and Medium Enterprises, Government of India.',
    logo: '/assets/certificates/msme.svg',
    frameImage: '/assets/certificates/framed/msme.webp',
    frameImage2x: '/assets/certificates/framed/msme@2x.webp'
  }
];

