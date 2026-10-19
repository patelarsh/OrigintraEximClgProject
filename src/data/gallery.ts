export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: 'team' | 'products' | 'facility' | 'banners' | 'certificates' | 'uploads';
  description?: string;
  tag?: string;
  isUploaded?: boolean;
  createdAt?: string;
}

export const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  // === LEADERSHIP & TEAM PORTRAITS ===
  {
    id: 'team-director',
    url: '/assets/team/director.jpg',
    title: 'Rajesh V. Patel',
    category: 'team',
    description: 'Founder & Managing Director - Global Trade Finance & Supply Chain Strategy',
    tag: 'Executive'
  },
  {
    id: 'team-sales-vp',
    url: '/assets/team/sales-vp.jpg',
    title: 'Priya Sharma',
    category: 'team',
    description: 'VP International Sales & European / GCC Key Accounts',
    tag: 'Executive'
  },
  {
    id: 'team-operations-director',
    url: '/assets/team/operations-director.jpg',
    title: 'Amitabh Sen',
    category: 'team',
    description: 'Director of Operations, Warehousing & Processing Automation',
    tag: 'Executive'
  },
  {
    id: 'team-procurement',
    url: '/assets/team/procurement.jpg',
    title: 'Vikramaditya Sharma',
    category: 'team',
    description: 'Head of Agricultural Procurement - Mandi Clusters & Farmgate Networks',
    tag: 'Procurement'
  },
  {
    id: 'team-quality',
    url: '/assets/team/quality.jpg',
    title: 'Dr. Ananya Deshmukh',
    category: 'team',
    description: 'Director of Quality & Food Safety - ISO 22000, HACCP & NABL Audits',
    tag: 'Quality'
  },
  {
    id: 'team-logistics',
    url: '/assets/team/logistics.jpg',
    title: 'Karan Malhotra',
    category: 'team',
    description: 'Head of International Logistics - Maritime Freight & Container Staging',
    tag: 'Logistics'
  },
  {
    id: 'team-tariq',
    url: '/assets/team/tariq.jpg',
    title: 'Tariq Al-Mansoor',
    category: 'team',
    description: 'Middle East Regional Trade Director - Dubai Hub & GCC Distribution',
    tag: 'Regional'
  },
  {
    id: 'team-lars',
    url: '/assets/team/lars.jpg',
    title: 'Lars Lindqvist',
    category: 'team',
    description: 'European Institutional Sourcing Director - Rotterdam Corridor',
    tag: 'Regional'
  },
  {
    id: 'team-meiling',
    url: '/assets/team/meiling.jpg',
    title: 'Mei-Ling Chen',
    category: 'team',
    description: 'East Asia Commercial Trade Liaison - Singapore & ASEAN Logistics',
    tag: 'Regional'
  },

  // === FACILITY & SOURCING ===
  {
    id: 'facility-processing-plant',
    url: '/assets/about/spice-processing-plant.jpg',
    title: 'Spice Processing & Sortex Plant',
    category: 'facility',
    description: 'Automated Buhler color sortex, aspiration, and destoning facility in Gujarat',
    tag: 'Facility'
  },
  {
    id: 'facility-harvest-sourcing',
    url: '/assets/about/spice-harvest-sourcing.jpg',
    title: 'Farmgate Harvest & Direct Sourcing',
    category: 'facility',
    description: 'Direct agricultural mandi sourcing partnerships across Andhra Pradesh & Gujarat',
    tag: 'Sourcing'
  },
  {
    id: 'facility-container-port',
    url: '/assets/about/container-ship-port.jpg',
    title: 'Mundra Port Maritime Staging',
    category: 'facility',
    description: 'Pre-cooled 20ft & 40ft FCL container staging and ocean freight handling',
    tag: 'Logistics'
  },
  {
    id: 'facility-turmeric-curcumin',
    url: '/assets/about/turmeric-curcumin.jpg',
    title: 'Curcumin Testing & Laboratory QA',
    category: 'facility',
    description: 'Spectrophotometric curcumin quantification and pesticide residue screening',
    tag: 'Testing'
  },
  {
    id: 'facility-cleanroom',
    url: '/assets/hero/facility-hero.jpg',
    title: 'Cleanroom Packaging Infrastructure',
    category: 'facility',
    description: 'Dust-free, climate-controlled bulk bagging and vacuum-seal staging',
    tag: 'Facility'
  },
  {
    id: 'facility-hero-banner',
    url: '/assets/hero/spices-hero-banner.jpg',
    title: 'Origintra Whole Spices Spread',
    category: 'facility',
    description: 'Panoramic display of flagship Indian export spices and natural crops',
    tag: 'Showcase'
  },

  // === HERO BANNERS ===
  {
    id: 'banner-red-chilli',
    url: '/assets/hero/banner-red-chilli.jpg',
    title: 'Guntur Red Chilli Crop Banner',
    category: 'banners',
    description: 'High-SHU Teja & Sannam export chilli sun-drying crop banner',
    tag: 'Hero Banner'
  },
  {
    id: 'banner-turmeric',
    url: '/assets/hero/banner-turmeric.jpg',
    title: 'Salem Golden Turmeric Finger Banner',
    category: 'banners',
    description: 'High curcumin double-polished Salem turmeric finger banner',
    tag: 'Hero Banner'
  },
  {
    id: 'banner-cumin',
    url: '/assets/hero/banner-cumin.jpg',
    title: 'Unjha Premium Cumin Seeds Banner',
    category: 'banners',
    description: 'Sortex-cleaned 99.5% pure Gujarat cumin seeds banner',
    tag: 'Hero Banner'
  },
  {
    id: 'banner-coriander',
    url: '/assets/hero/banner-coriander.jpg',
    title: 'Rajasthan Eagle Coriander Banner',
    category: 'banners',
    description: 'Aromatic green-gold Ramganj Mandi coriander banner',
    tag: 'Hero Banner'
  },

  // === PRODUCTS ===
  {
    id: 'prod-turmeric',
    url: '/assets/products/turmeric.jpg',
    title: 'Pure Turmeric Powder (Salem / Nizamabad)',
    category: 'products',
    description: 'Cryogenic micro-milled golden yellow turmeric powder with 2.5%-5.5% curcumin',
    tag: 'Ground Spices'
  },
  {
    id: 'prod-red-chilli',
    url: '/assets/products/red-chilli.jpg',
    title: 'S17 Teja Red Chilli (Stemless)',
    category: 'products',
    description: 'High heat dried red chillies (75,000 - 90,000 SHU) from Guntur',
    tag: 'Whole Spices'
  },
  {
    id: 'prod-whole-red-chili',
    url: '/assets/products/whole-red-chili.jpg',
    title: 'Premium Whole Red Chilli',
    category: 'products',
    description: 'Sun-dried vibrant whole red chilli pods for industrial processing',
    tag: 'Whole Spices'
  },
  {
    id: 'prod-red-chili-powder',
    url: '/assets/products/red-chili-powder.jpg',
    title: 'Pure Red Chilli Powder',
    category: 'products',
    description: 'Micro-pulverized bright red chilli powder with cold grinding technology',
    tag: 'Ground Spices'
  },
  {
    id: 'prod-cumin',
    url: '/assets/products/cumin-seeds.jpg',
    title: 'Cumin Seeds (Whole)',
    category: 'products',
    description: 'Machine cleaned Unjha cumin seeds with 99.5% purity',
    tag: 'Whole Spices'
  },
  {
    id: 'prod-cumin-seeds',
    url: '/assets/products/cumin-seeds.jpg',
    title: 'Cumin Seeds (Sortex Cleaned)',
    category: 'products',
    description: 'Double sortex Gujarat cumin seeds for international spice packers',
    tag: 'Whole Spices'
  },
  {
    id: 'prod-cumin-powder',
    url: '/assets/products/cumin-powder.jpg',
    title: 'Pure Cumin Powder',
    category: 'products',
    description: 'Aromatic ground cumin powder rich in essential volatile oils',
    tag: 'Ground Spices'
  },
  {
    id: 'prod-coriander',
    url: '/assets/products/coriander-seeds.jpg',
    title: 'Coriander Seeds (Whole)',
    category: 'products',
    description: 'Eagle & Scooter quality whole coriander seeds from Rajasthan',
    tag: 'Whole Spices'
  },
  {
    id: 'prod-coriander-seeds',
    url: '/assets/products/coriander-seeds.jpg',
    title: 'Coriander Seeds (Machine Cleaned)',
    category: 'products',
    description: 'Sorted greenish gold whole coriander seeds with citrus floral aroma',
    tag: 'Whole Spices'
  },
  {
    id: 'prod-coriander-powder',
    url: '/assets/products/coriander-powder.jpg',
    title: 'Pure Coriander Powder',
    category: 'products',
    description: 'Fine ground pure coriander powder sealed in multi-barrier packaging',
    tag: 'Ground Spices'
  },
  {
    id: 'prod-black-pepper',
    url: '/assets/products/black-pepper.jpg',
    title: 'Malabar Black Pepper (550 GL)',
    category: 'products',
    description: 'Hand-harvested Kerala black pepper bold berries with intense piperine',
    tag: 'Whole Spices'
  },
  {
    id: 'prod-black-pepper-powder',
    url: '/assets/products/black-pepper-powder.jpg',
    title: 'Black Pepper Powder (Coarse / Fine)',
    category: 'products',
    description: 'Pure cryogenic ground black pepper with preserved essential aroma',
    tag: 'Ground Spices'
  },
  {
    id: 'prod-green-cardamom',
    url: '/assets/products/green-cardamom.jpg',
    title: 'Alleppey Green Cardamom (8mm Bold)',
    category: 'products',
    description: 'Supreme jumbo green cardamom pods with high essential oil content',
    tag: 'Whole Spices'
  },
  {
    id: 'prod-clove',
    url: '/assets/products/clove.jpg',
    title: 'Hand-picked Whole Cloves (Lal Pari)',
    category: 'products',
    description: 'Head-intact whole dried cloves with rich eugenol oil content',
    tag: 'Whole Spices'
  },
  {
    id: 'prod-cinnamon',
    url: '/assets/products/cinnamon.jpg',
    title: 'Ceylon Cinnamon Quills',
    category: 'products',
    description: 'True thin-bark rolled cinnamon sticks with delicate sweet aroma',
    tag: 'Whole Spices'
  },
  {
    id: 'prod-star-anise',
    url: '/assets/products/star-anise.jpg',
    title: 'Whole Star Anise (Chakri Phool)',
    category: 'products',
    description: 'Eight-pointed whole dried star anise pods with high anethole aroma',
    tag: 'Whole Spices'
  },
  {
    id: 'prod-whole-turmeric',
    url: '/assets/products/whole-turmeric.jpg',
    title: 'Whole Turmeric Fingers (Salem / Nizamabad)',
    category: 'products',
    description: 'Polished golden whole turmeric fingers with high 3%-5% curcumin',
    tag: 'Whole Spices'
  },
  {
    id: 'prod-fennel',
    url: '/assets/products/fennel.jpg',
    title: 'Fennel Seeds (Extra Bold Green)',
    category: 'products',
    description: 'Sweet Lucknowi and Gujarat extra bold green fennel seeds',
    tag: 'Whole Spices'
  },
  {
    id: 'prod-fenugreek-seeds',
    url: '/assets/products/fenugreek-seeds.jpg',
    title: 'Fenugreek Seeds (Methi Small)',
    category: 'products',
    description: 'Machine cleaned golden brown fenugreek seeds with minimal moisture',
    tag: 'Whole Spices'
  },
  {
    id: 'prod-garam-masala',
    url: '/assets/products/garam-masala.jpg',
    title: 'Artisan Garam Masala Blend',
    category: 'products',
    description: 'Master roasted spice formulation for commercial food processors',
    tag: 'Spice Blends'
  },
  {
    id: 'prod-biryani-masala',
    url: '/assets/products/biryani-masala.jpg',
    title: 'Royal Biryani Masala Blend',
    category: 'products',
    description: 'Fragrant mughlai whole and coarse spice seasoning blend',
    tag: 'Spice Blends'
  },
  {
    id: 'prod-curry-powder',
    url: '/assets/products/curry-powder.jpg',
    title: 'Madras Curry Powder (Mild & Hot)',
    category: 'products',
    description: 'Export-grade standard Madras curry blend matching EU/UK compliance',
    tag: 'Spice Blends'
  },
  {
    id: 'prod-sambar-masala',
    url: '/assets/products/sambar-masala.jpg',
    title: 'Traditional Sambar Masala',
    category: 'products',
    description: 'Authentic South Indian aromatic roasted lentil and spice blend',
    tag: 'Spice Blends'
  },
  {
    id: 'prod-chaat-masala',
    url: '/assets/products/chaat-masala.jpg',
    title: 'Tangy Chaat Masala Seasoning',
    category: 'products',
    description: 'Piquant black salt and dry mango seasoned snack blend',
    tag: 'Spice Blends'
  },
  {
    id: 'prod-rasam-powder',
    url: '/assets/products/rasam-powder.jpg',
    title: 'Southern Rasam Powder Blend',
    category: 'products',
    description: 'Peppery cumin and coriander seasoning for broths and soups',
    tag: 'Spice Blends'
  },
  {
    id: 'prod-tandoori-masala',
    url: '/assets/products/tandoori-masala.jpg',
    title: 'Tandoori Barbecue Spice Blend',
    category: 'products',
    description: 'Smoky Kashmiri chili and cumin blend for marinade formulations',
    tag: 'Spice Blends'
  },
  {
    id: 'prod-moringa',
    url: '/assets/products/moringa.jpg',
    title: 'Organic Moringa Oleifera Leaf Powder',
    category: 'products',
    description: 'Shade dried organic green superfood leaf powder',
    tag: 'Herbs & Botanicals'
  },
  {
    id: 'prod-asafoetida',
    url: '/assets/products/asafoetida.jpg',
    title: 'Compounded Hing (Asafoetida)',
    category: 'products',
    description: 'Aromatic compounded asafoetida resin powder for culinary blends',
    tag: 'Specialty'
  },
  {
    id: 'prod-bay-leaf',
    url: '/assets/products/bay-leaf.jpg',
    title: 'Indian Bay Leaves (Tejpatta)',
    category: 'products',
    description: 'Sun-dried three-veined cinnamon leaf quills for aromatic infusions',
    tag: 'Whole Spices'
  },
  {
    id: 'prod-dry-ginger',
    url: '/assets/products/dry-ginger.jpg',
    title: 'Sun-Dried Whole Ginger (Sonth)',
    category: 'products',
    description: 'Bleached & unbleached Cochin dry ginger rhizomes with spicy zing',
    tag: 'Whole Spices'
  },
  {
    id: 'prod-custom-sourcing',
    url: '/assets/products/custom-sourcing.jpg',
    title: 'Contract Farming & Custom Sourcing',
    category: 'products',
    description: 'Dedicated crop contract sourcing with customized mesh and moisture specs',
    tag: 'Custom'
  },

  // === CERTIFICATES ===
  {
    id: 'cert-fssai',
    url: '/assets/certificates/fssai.png',
    title: 'FSSAI Central Food Safety License',
    category: 'certificates',
    description: 'Food Safety and Standards Authority of India export manufacturing compliance',
    tag: 'Regulatory'
  },
  {
    id: 'cert-apeda',
    url: '/assets/certificates/apeda.png',
    title: 'APEDA Registration Certificate',
    category: 'certificates',
    description: 'Agricultural and Processed Food Products Export Development Authority (India)',
    tag: 'Regulatory'
  },
  {
    id: 'cert-spices-board',
    url: '/assets/certificates/spices-board.png',
    title: 'Spices Board of India CRES',
    category: 'certificates',
    description: 'Certificate of Registration as Exporter of Spices by Ministry of Commerce',
    tag: 'Regulatory'
  },
  {
    id: 'cert-gst',
    url: '/assets/certificates/gst.png',
    title: 'GST Tax Identification Certificate',
    category: 'certificates',
    description: 'Goods and Services Tax registered exporter status',
    tag: 'Commercial'
  },
  {
    id: 'cert-iec',
    url: '/assets/certificates/iec.png',
    title: 'IEC Directorate General of Foreign Trade',
    category: 'certificates',
    description: 'Valid Importer Exporter Code issued by DGFT, Government of India',
    tag: 'Trade Code'
  }
];
