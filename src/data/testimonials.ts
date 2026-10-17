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

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    author: 'Tariq Al-Mansoor',
    role: 'Procurement Director',
    company: 'Al-Ameen Foodstuff Trading LLC',
    country: 'United Arab Emirates',
    destinationPort: 'Port of Jebel Ali, UAE',
    commodity: 'Guntur S17 Dried Red Chilli',
    volumeOrType: '2 x 20ft FCL (28 MT)',
    rating: 5,
    testimonial: 'We have been ordering Guntur stemless chillies from Origintra for our wholesale distribution in Dubai. Clean lot, moisture was well within our limits, and the container stuffing photos were shared on WhatsApp before dispatch from Mundra. The original documents reached our customs broker before the ship docked at Jebel Ali. Very honest and responsive team to work with.'
  },
  {
    id: 't-2',
    author: 'Lars van der Meer',
    role: 'Supply Chain Manager',
    company: 'Nordic Spice & Seasoning Blends B.V.',
    country: 'Netherlands',
    destinationPort: 'Port of Rotterdam, Netherlands',
    commodity: 'Salem Turmeric Fingers & Powder',
    volumeOrType: '1 x 20ft FCL (18 MT)',
    rating: 5,
    testimonial: 'Importing turmeric into the EU can be tricky with pesticide residue regulations. Origintra provided certified lab test reports from an accredited lab prior to shipment, and our independent testing at Rotterdam port matched the specs completely. Goods were well palletized with zero bag damage. Smooth coordination from start to finish.'
  },
  {
    id: 't-3',
    author: 'Mei-Ling Chen',
    role: 'Senior Sourcing Lead',
    company: 'Nusantara Food Ingredients Pte Ltd',
    country: 'Singapore',
    destinationPort: 'Port of Singapore (PSA)',
    commodity: 'Machine-Cleaned Cumin & Coriander Seeds',
    volumeOrType: 'Quarterly Contract (24 MT)',
    rating: 5,
    testimonial: 'We use Indian cumin and coriander seeds for our seasoning manufacturing line in Jurong. Sourcing from Origintra has been very dependable—high seed purity, strong aroma, and no dust or foreign seeds. Their weekly vessel tracking updates made planning our production schedule simple.'
  },
  {
    id: 't-4',
    author: 'Dr. Klaus Weber',
    role: 'Head of Raw Materials Purchasing',
    company: 'Bavarian Seasonings & Botanicals GmbH',
    country: 'Germany',
    destinationPort: 'Port of Hamburg, Germany',
    commodity: 'Alleppey Green Cardamom (8mm Bold)',
    volumeOrType: 'LCL Consignment (2.5 MT)',
    rating: 5,
    testimonial: 'We placed an initial commercial order of 8mm Alleppey green cardamom in aroma-sealed foil packaging. The uniform green color, bold size, and essential oil content were consistent across the whole shipment. Everything passed German customs and health inspection without any queries.'
  },
  {
    id: 't-5',
    author: 'Marcus Sterling',
    role: 'Import Operations Director',
    company: 'Commonwealth Seasoning Mills Ltd',
    country: 'United Kingdom',
    destinationPort: 'Port of Felixstowe, UK',
    commodity: 'Tellicherry Black Pepper (570 g/L)',
    volumeOrType: '1 x 20ft FCL (16 MT)',
    rating: 5,
    testimonial: 'First time working with Origintra for bulk black pepper. The density and pungency were exactly what we agreed upon during sample approval. The container was well stuffed with silica traps so there was zero condensation during ocean transit. We have already placed our repeat order for next quarter.'
  },
  {
    id: 't-6',
    author: 'David Rosenfeld',
    role: 'VP Sourcing & Procurement',
    company: 'Atlantic Spice & Specialty Importers Inc.',
    country: 'United States',
    destinationPort: 'Port of New York / NJ, USA',
    commodity: 'Sortex Fennel & Cumin Seeds',
    volumeOrType: 'Mixed 40ft Container (22 MT)',
    rating: 5,
    testimonial: 'Consolidating different seed spices into a single 40ft container saved us substantial ocean freight. Origintra handled the FDA prior notice documentation, phytosanitary certificate, and palletizing professionally. No delays at US customs entry. Straightforward communication and reliable quality.'
  }
];
