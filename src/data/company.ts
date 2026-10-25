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
  googleMapsEmbedUrl?: string;
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
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d42673.10287590732!2d72.84979227910158!3d23.776796900000008!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395dafa047d489ed%3A0x2f6b731c3fb3148b!2sOrigintra%20Exim!5e1!3m2!1sen!2sus!4v1792497478534!5m2!1sen!2sus',
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
    badge: 'Under Application (In Process)',
    description: 'Statutory Import Export Code application submitted to DGFT. Currently under regulatory processing for commercial export clearance.',
    logo: '/assets/certificates/iec.png',
    frameImage: '/assets/certificates/framed/iec.webp',
    frameImage2x: '/assets/certificates/framed/iec@2x.webp'
  },
  {
    id: 'apeda',
    name: 'APEDA',
    fullName: 'Agricultural and Processed Food Products Export Development Authority',
    authority: 'Ministry of Commerce & Industry, Govt. of India',
    badge: 'Under Application (In Process)',
    description: 'Registration application filed with APEDA for scheduled agricultural commodities monitoring and international trade linkage.',
    logo: '/assets/certificates/apeda.png',
    frameImage: '/assets/certificates/framed/apeda.webp',
    frameImage2x: '/assets/certificates/framed/apeda@2x.webp'
  },
  {
    id: 'spices-board',
    name: 'Spices Board India',
    fullName: 'Certificate of Registration as Exporter of Spices (CRES)',
    authority: 'Spices Board, Ministry of Commerce & Industry',
    badge: 'Under Application (In Process)',
    description: 'CRES application filed with the Spices Board of India for statutory sampling, mandatory laboratory testing, and moisture compliance.',
    logo: '/assets/certificates/spices-board.png',
    frameImage: '/assets/certificates/framed/spices-board.webp',
    frameImage2x: '/assets/certificates/framed/spices-board@2x.webp'
  },
  {
    id: 'fssai',
    name: 'FSSAI',
    fullName: 'Food Safety and Standards Authority of India',
    authority: 'Ministry of Health and Family Welfare, Govt. of India',
    badge: 'Under Application (In Process)',
    description: 'Food business operator license application submitted under the Food Safety and Standards Act for hygienic sorting and packaging.',
    logo: '/assets/certificates/fssai.png',
    frameImage: '/assets/certificates/framed/fssai.webp',
    frameImage2x: '/assets/certificates/framed/fssai@2x.webp'
  },
  {
    id: 'gst',
    name: 'GST',
    fullName: 'Goods and Services Tax Registration',
    authority: 'Department of Revenue, Ministry of Finance, Govt. of India',
    badge: 'Active Tax Registration',
    description: 'Valid, active Government of India GST registration ensuring legal business operation, commercial billing, and compliant trade records.',
    logo: '/assets/certificates/gst-transparent.png',
    frameImage: '/assets/certificates/framed/gst.webp',
    frameImage2x: '/assets/certificates/framed/gst@2x.webp'
  },
  {
    id: 'msme',
    name: 'MSME',
    fullName: 'Ministry of Micro, Small and Medium Enterprises',
    authority: 'Govt. of India Enterprise Registration',
    badge: 'Under Application (In Process)',
    description: 'Enterprise registration under MSME, Government of India, currently in documentation processing.',
    logo: '/assets/certificates/msme.svg',
    frameImage: '/assets/certificates/framed/msme.webp',
    frameImage2x: '/assets/certificates/framed/msme@2x.webp'
  }
];

