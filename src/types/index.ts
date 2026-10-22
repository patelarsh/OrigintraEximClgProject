export interface Product {
  id: string;
  slug: string;
  name: string;
  botanicalName?: string;
  scientific?: string;
  category: string;
  categoryKey?: string;
  tagline?: string;
  isFlagship?: boolean;
  partUsed?: string;
  loadability?: string;
  shortDescription: string;
  fullDescription: string;
  origin: string;
  availableForms: string[];
  packagingOptions: string[];
  applications: string[];
  image: string;
  gallery?: string[];
  specifications: {
    label: string;
    value: string;
    details?: string;
  }[];
  powderDetails?: {
    meshSize: string;
    grindingMethod: string;
    moistureCeiling: string;
    purityGuarantee: string;
    packagingBarrier: string;
  };
  qualityProcess: string[];
  exportInfo: {
    minimumOrderQuantity: string;
    packagingStandard: string;
    containerCapacity: string;
    sampleAvailability: string;
    leadTime: string;
    incoterms: string;
  };
  faqs: {
    question: string;
    answer: string;
  }[];
  isCustomSourcing?: boolean;

  // Compatibility fields for legacy helper tools
  grade?: string;
  hsCode?: string;
  purity?: string;
  moisture?: string;
  essentialOil?: string;
  colorValue?: string;
  keyFeature?: string;
  harvestSeason?: string;
  fclCapacity20ft?: string;
  badge?: string;
  approxFobPriceUSD?: number;
  editorialQuote?: string;
  description?: string;
  certifications?: string[];
}

export type Spice = Product;

export type UserRole = 'admin' | 'editor' | 'author' | 'sales';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthSession {
  token: string;
  user: Omit<User, 'password'>;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  categories?: string[];
  status?: 'Published' | 'Draft' | 'Scheduled';
  date: string;
  rawDate?: string;
  publishDate?: string;
  publishTime?: string;
  readTime: string;
  author: string;
  authorRole: string;
  authorId?: string;
  excerpt: string;
  image: string;
  seoTitle: string;
  metaTitle?: string;
  metaDescription: string;
  tags?: string[];
  tableOfContents: string[];
  content: {
    heading?: string;
    paragraphs: string[];
  }[];
  contentHtml?: string;
  relatedSlugs: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  position?: string;
  role?: string;
  photo?: string;
  image?: string;
  shortBiography?: string;
  bio?: string;
  credentials?: string;
  specialization?: string;
  linkedIn?: string;
}

export interface QuoteFormData {
  fullName: string;
  companyName: string;
  businessEmail: string;
  country: string;
  phoneWhatsApp: string;
  product: string;
  productForm?: 'Whole Form' | 'Powder Form (Ground)' | 'Crushed / Flakes' | 'Custom / Both';
  quantityRequired: string;
  packagingRequirement: string;
  destinationPort: string;
  message: string;
  honeypot?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  honeypot?: string;
}

export interface ShipmentStatus {
  trackingNumber: string;
  vesselName: string;
  shippingLine: string;
  originPort: string;
  destinationPort: string;
  etd: string;
  eta: string;
  currentStatus: string;
  progressPercentage: number;
  currentLocation: string;
  containerTemp: string;
  containerHumidity: string;
  phytosanitaryCertStatus: string;
  cargoDescription: string;
  weightMT: string;
}

export interface Inquiry {
  id: string;
  fullName: string;
  companyName: string;
  businessEmail: string;
  country: string;
  phoneWhatsApp: string;
  product: string;
  productForm?: string;
  quantityRequired: string;
  packagingRequirement?: string;
  destinationPort: string;
  message?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'negotiation' | 'closed';
  source?: 'quote_modal' | 'contact_page' | 'direct';
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  country: string;
  destinationPort: string;
  commodity: string;
  testimonial: string;
  volumeOrType: string;
  rating?: number;
  avatar?: string;
  createdAt?: string;
}
