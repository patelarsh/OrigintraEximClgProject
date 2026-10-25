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
  'India': { code: 'in', name: 'India' }
};

export function getCountryFlag(countryName?: string): { code: string; name: string } {
  if (!countryName) return { code: 'un', name: 'Global' };
  const trimmed = countryName.trim();
  if (COUNTRY_FLAG_MAP[trimmed]) return COUNTRY_FLAG_MAP[trimmed];
  const lower = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(COUNTRY_FLAG_MAP)) {
    if (key.toLowerCase() === lower) return val;
  }
  return {
    code: lower.slice(0, 2) || 'un',
    name: countryName
  };
}
