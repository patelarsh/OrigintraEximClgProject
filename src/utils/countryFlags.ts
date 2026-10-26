export interface TradeDestination {
  country: string;
  shortName: string;
  code: string;
  defaultPort: string;
  emoji: string;
  region: string;
  aliases?: string[];
}

export const COUNTRY_FLAG_MAP: Record<string, { code: string; name: string }> = {
  'Malaysia': { code: 'my', name: 'Malaysia' },
  'United Arab Emirates': { code: 'ae', name: 'UAE' },
  'UAE': { code: 'ae', name: 'UAE' },
  'Netherlands': { code: 'nl', name: 'Netherlands' },
  'Singapore': { code: 'sg', name: 'Singapore' },
  'Germany': { code: 'de', name: 'Germany' },
  'United Kingdom': { code: 'gb', name: 'United Kingdom' },
  'UK': { code: 'gb', name: 'UK' },
  'United States': { code: 'us', name: 'United States' },
  'USA': { code: 'us', name: 'USA' },
  'Saudi Arabia': { code: 'sa', name: 'Saudi Arabia' },
  'Australia': { code: 'au', name: 'Australia' },
  'Canada': { code: 'ca', name: 'Canada' },
  'Japan': { code: 'jp', name: 'Japan' },
  'Vietnam': { code: 'vn', name: 'Vietnam' },
  'Indonesia': { code: 'id', name: 'Indonesia' },
  'France': { code: 'fr', name: 'France' },
  'Italy': { code: 'it', name: 'Italy' },
  'Spain': { code: 'es', name: 'Spain' },
  'Turkey': { code: 'tr', name: 'Turkey' },
  'Egypt': { code: 'eg', name: 'Egypt' },
  'South Africa': { code: 'za', name: 'South Africa' },
  'Brazil': { code: 'br', name: 'Brazil' },
  'Kuwait': { code: 'kw', name: 'Kuwait' },
  'Qatar': { code: 'qa', name: 'Qatar' },
  'Oman': { code: 'om', name: 'Oman' },
  'Bahrain': { code: 'bh', name: 'Bahrain' },
  'Bangladesh': { code: 'bd', name: 'Bangladesh' },
  'Sri Lanka': { code: 'lk', name: 'Sri Lanka' },
  'Thailand': { code: 'th', name: 'Thailand' },
  'Philippines': { code: 'ph', name: 'Philippines' },
  'South Korea': { code: 'kr', name: 'South Korea' },
  'India': { code: 'in', name: 'India' }
};

export const TRADE_DESTINATIONS: TradeDestination[] = [
  // Middle East & GCC
  {
    country: 'United Arab Emirates',
    shortName: 'UAE',
    code: 'ae',
    defaultPort: 'Port of Jebel Ali, UAE',
    emoji: '🇦🇪',
    region: 'Middle East & GCC',
    aliases: ['uae', 'dubai', 'jebel ali', 'abu dhabi', 'sharjah', 'khalifa port']
  },
  {
    country: 'Saudi Arabia',
    shortName: 'Saudi Arabia',
    code: 'sa',
    defaultPort: 'Jeddah Islamic Port, KSA',
    emoji: '🇸🇦',
    region: 'Middle East & GCC',
    aliases: ['ksa', 'jeddah', 'dammam', 'riyadh', 'king abdulaziz']
  },
  {
    country: 'Kuwait',
    shortName: 'Kuwait',
    code: 'kw',
    defaultPort: 'Shuwaikh Port, Kuwait',
    emoji: '🇰🇼',
    region: 'Middle East & GCC',
    aliases: ['shuwaikh', 'shuaiba']
  },
  {
    country: 'Qatar',
    shortName: 'Qatar',
    code: 'qa',
    defaultPort: 'Hamad Port, Doha, Qatar',
    emoji: '🇶🇦',
    region: 'Middle East & GCC',
    aliases: ['hamad', 'doha']
  },
  {
    country: 'Oman',
    shortName: 'Oman',
    code: 'om',
    defaultPort: 'Sohar Port / Port of Salalah, Oman',
    emoji: '🇴🇲',
    region: 'Middle East & GCC',
    aliases: ['sohar', 'salalah', 'muscat']
  },
  {
    country: 'Bahrain',
    shortName: 'Bahrain',
    code: 'bh',
    defaultPort: 'Khalifa Bin Salman Port, Bahrain',
    emoji: '🇧🇭',
    region: 'Middle East & GCC',
    aliases: ['khalifa bin salman', 'manama']
  },

  // Europe & UK
  {
    country: 'Netherlands',
    shortName: 'Netherlands',
    code: 'nl',
    defaultPort: 'Port of Rotterdam, Netherlands',
    emoji: '🇳🇱',
    region: 'Europe & UK',
    aliases: ['rotterdam', 'amsterdam', 'holland']
  },
  {
    country: 'Germany',
    shortName: 'Germany',
    code: 'de',
    defaultPort: 'Port of Hamburg, Germany',
    emoji: '🇩🇪',
    region: 'Europe & UK',
    aliases: ['hamburg', 'bremen', 'bremerhaven']
  },
  {
    country: 'United Kingdom',
    shortName: 'United Kingdom',
    code: 'gb',
    defaultPort: 'Port of Felixstowe, UK',
    emoji: '🇬🇧',
    region: 'Europe & UK',
    aliases: ['uk', 'felixstowe', 'southampton', 'london gateway', 'liverpool', 'england']
  },
  {
    country: 'France',
    shortName: 'France',
    code: 'fr',
    defaultPort: 'Port of Le Havre, France',
    emoji: '🇫🇷',
    region: 'Europe & UK',
    aliases: ['le havre', 'marseille', 'dunkirk']
  },
  {
    country: 'Italy',
    shortName: 'Italy',
    code: 'it',
    defaultPort: 'Port of Genoa, Italy',
    emoji: '🇮🇹',
    region: 'Europe & UK',
    aliases: ['genoa', 'la spezia', 'trieste', 'naples']
  },
  {
    country: 'Spain',
    shortName: 'Spain',
    code: 'es',
    defaultPort: 'Port of Valencia, Spain',
    emoji: '🇪🇸',
    region: 'Europe & UK',
    aliases: ['valencia', 'barcelona', 'algeciras']
  },
  {
    country: 'Turkey',
    shortName: 'Turkey',
    code: 'tr',
    defaultPort: 'Port of Mersin, Turkey',
    emoji: '🇹🇷',
    region: 'Europe & UK',
    aliases: ['mersin', 'istanbul', 'izmir', 'turkiye']
  },

  // Asia-Pacific & ASEAN
  {
    country: 'Singapore',
    shortName: 'Singapore',
    code: 'sg',
    defaultPort: 'Port of Singapore (PSA)',
    emoji: '🇸🇬',
    region: 'Asia-Pacific',
    aliases: ['psa', 'jurong', 'pasir panjang']
  },
  {
    country: 'Malaysia',
    shortName: 'Malaysia',
    code: 'my',
    defaultPort: 'Port Klang, Malaysia',
    emoji: '🇲🇾',
    region: 'Asia-Pacific',
    aliases: ['klang', 'penang', 'tanjung pelepas', 'johor']
  },
  {
    country: 'Japan',
    shortName: 'Japan',
    code: 'jp',
    defaultPort: 'Port of Yokohama / Tokyo, Japan',
    emoji: '🇯🇵',
    region: 'Asia-Pacific',
    aliases: ['yokohama', 'tokyo', 'kobe', 'osaka', 'nagoya']
  },
  {
    country: 'Vietnam',
    shortName: 'Vietnam',
    code: 'vn',
    defaultPort: 'Cat Lai Port, Ho Chi Minh City, Vietnam',
    emoji: '🇻🇳',
    region: 'Asia-Pacific',
    aliases: ['cat lai', 'hai phong', 'ho chi minh', 'da nang']
  },
  {
    country: 'Indonesia',
    shortName: 'Indonesia',
    code: 'id',
    defaultPort: 'Tanjung Priok, Jakarta, Indonesia',
    emoji: '🇮🇩',
    region: 'Asia-Pacific',
    aliases: ['tanjung priok', 'jakarta', 'surabaya', 'semarang']
  },
  {
    country: 'Thailand',
    shortName: 'Thailand',
    code: 'th',
    defaultPort: 'Laem Chabang Port, Thailand',
    emoji: '🇹🇭',
    region: 'Asia-Pacific',
    aliases: ['laem chabang', 'bangkok']
  },
  {
    country: 'Philippines',
    shortName: 'Philippines',
    code: 'ph',
    defaultPort: 'Port of Manila, Philippines',
    emoji: '🇵🇭',
    region: 'Asia-Pacific',
    aliases: ['manila', 'subic bay', 'batangas']
  },
  {
    country: 'South Korea',
    shortName: 'South Korea',
    code: 'kr',
    defaultPort: 'Busan Port, South Korea',
    emoji: '🇰🇷',
    region: 'Asia-Pacific',
    aliases: ['busan', 'incheon', 'korea']
  },
  {
    country: 'Australia',
    shortName: 'Australia',
    code: 'au',
    defaultPort: 'Port of Melbourne, Australia',
    emoji: '🇦🇺',
    region: 'Asia-Pacific',
    aliases: ['melbourne', 'sydney', 'brisbane', 'fremantle']
  },

  // Americas & Africa
  {
    country: 'United States',
    shortName: 'USA',
    code: 'us',
    defaultPort: 'Port of New York / New Jersey, USA',
    emoji: '🇺🇸',
    region: 'Americas & Africa',
    aliases: ['usa', 'us', 'new york', 'new jersey', 'houston', 'los angeles', 'long beach', 'savannah']
  },
  {
    country: 'Canada',
    shortName: 'Canada',
    code: 'ca',
    defaultPort: 'Port of Vancouver, Canada',
    emoji: '🇨🇦',
    region: 'Americas & Africa',
    aliases: ['vancouver', 'montreal', 'toronto', 'halifax']
  },
  {
    country: 'Brazil',
    shortName: 'Brazil',
    code: 'br',
    defaultPort: 'Port of Santos, Brazil',
    emoji: '🇧🇷',
    region: 'Americas & Africa',
    aliases: ['santos', 'paranagua', 'rio de janeiro']
  },
  {
    country: 'Egypt',
    shortName: 'Egypt',
    code: 'eg',
    defaultPort: 'Port of Alexandria, Egypt',
    emoji: '🇪🇬',
    region: 'Americas & Africa',
    aliases: ['alexandria', 'port said', 'damietta', 'suez']
  },
  {
    country: 'South Africa',
    shortName: 'South Africa',
    code: 'za',
    defaultPort: 'Port of Durban, South Africa',
    emoji: '🇿🇦',
    region: 'Americas & Africa',
    aliases: ['durban', 'cape town', 'port elizabeth']
  },
  {
    country: 'Bangladesh',
    shortName: 'Bangladesh',
    code: 'bd',
    defaultPort: 'Chittagong Port (Chattogram), Bangladesh',
    emoji: '🇧🇩',
    region: 'South Asia',
    aliases: ['chittagong', 'chattogram', 'mongla']
  },
  {
    country: 'Sri Lanka',
    shortName: 'Sri Lanka',
    code: 'lk',
    defaultPort: 'Port of Colombo, Sri Lanka',
    emoji: '🇱🇰',
    region: 'South Asia',
    aliases: ['colombo']
  },
  {
    country: 'India',
    shortName: 'India',
    code: 'in',
    defaultPort: 'Mundra Port / JNPT Nhava Sheva, India',
    emoji: '🇮🇳',
    region: 'Domestic / Origin',
    aliases: ['mundra', 'nhava sheva', 'jnpt', 'chennai', 'cochin']
  }
];

/**
 * Intelligently detects the flag and country name from country string or discharge port string.
 * Handles ports like "Port of Rotterdam", "Jebel Ali, UAE", "Hamburg", "Felixstowe", etc.
 */
export function getCountryFlag(countryOrDestination?: string): { code: string; name: string } {
  if (!countryOrDestination) return { code: 'un', name: 'Global' };
  const raw = countryOrDestination.trim();
  if (!raw) return { code: 'un', name: 'Global' };

  // 1. Direct key match in COUNTRY_FLAG_MAP
  if (COUNTRY_FLAG_MAP[raw]) return COUNTRY_FLAG_MAP[raw];

  const lower = raw.toLowerCase();

  // 2. Exact match in TRADE_DESTINATIONS
  for (const dest of TRADE_DESTINATIONS) {
    if (
      dest.country.toLowerCase() === lower ||
      dest.shortName.toLowerCase() === lower ||
      dest.code.toLowerCase() === lower
    ) {
      return { code: dest.code, name: dest.shortName };
    }
  }

  // 3. Search by city/port alias keywords in input
  for (const dest of TRADE_DESTINATIONS) {
    if (dest.aliases && dest.aliases.some(alias => lower.includes(alias))) {
      return { code: dest.code, name: dest.shortName };
    }
    if (lower.includes(dest.country.toLowerCase()) || lower.includes(dest.shortName.toLowerCase())) {
      return { code: dest.code, name: dest.shortName };
    }
  }

  // 4. Case-insensitive lookup in COUNTRY_FLAG_MAP
  for (const [key, val] of Object.entries(COUNTRY_FLAG_MAP)) {
    if (lower.includes(key.toLowerCase())) return val;
  }

  // Fallback to ISO-like code or 'un'
  const sanitized = lower.replace(/[^a-z]/g, '');
  return {
    code: sanitized.length >= 2 ? sanitized.slice(0, 2) : 'un',
    name: raw
  };
}
