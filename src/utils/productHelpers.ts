import { Product } from '../types';

/**
 * Formats a commodity's origin string for compact responsive card display.
 * Avoids awkward mid-word truncation on mobile viewports while highlighting
 * the primary commercial sourcing belt.
 */
export function formatCardOrigin(origin: string | undefined | null): string {
  if (!origin) return 'India Farmgate';

  const trimmed = origin.trim();

  // Known commercial multi-line descriptors
  if (/blended in india/i.test(trimmed)) return 'Blended in India';
  if (/resin sourced/i.test(trimmed)) return 'Compounded in India';
  if (/sourced & cleaned in india/i.test(trimmed)) return 'Sourced & Cleaned in India';
  if (/cassia from indonesia/i.test(trimmed)) return 'Kerala & Import Blend';

  // If em-dash / en-dash exists (e.g. "Guntur, Khammam — Andhra Pradesh & Telangana")
  if (trimmed.includes('—') || trimmed.includes('–')) {
    const [hubs, states] = trimmed.split(/\s*[—–]\s*/);
    const primaryHub = hubs.split(',')[0].trim();
    const primaryState = states ? states.split('&')[0].trim() : '';
    return primaryState ? `${primaryHub} (${primaryState})` : primaryHub;
  }

  // If multiple locations with state parenthetical e.g. "Salem & Erode (Tamil Nadu), Nizamabad..."
  if (trimmed.includes('(') && trimmed.includes(')')) {
    const match = trimmed.match(/^([^,]+(?:\([^)]+\))?)/);
    if (match) return match[1].trim();
  }

  // If simple comma list e.g. "Unjha, Gujarat & Rajasthan" -> "Unjha, Gujarat"
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',');
    return parts.slice(0, 2).join(',').trim();
  }

  return trimmed;
}

/**
 * Formats export forms for the card trade specs grid.
 * Guarantees zero duplicate strings like "Powder & Powder" or "Whole & Whole",
 * returning clear, industry-standard commercial export formats.
 */
export function getDisplayExportForms(product: Pick<Product, 'categoryKey' | 'category' | 'id' | 'availableForms'>): string {
  if (product.categoryKey === 'blends' || /blend/i.test(product.category || '')) {
    return 'Ground Spice Blend';
  }
  if (product.id === 'turmeric') {
    return 'Fine Powder (60–100 Mesh)';
  }
  if (product.id === 'whole-turmeric') {
    return 'Whole Fingers & Bulbs';
  }
  if (product.categoryKey === 'ground-spices') {
    return 'Pure Ground Powder';
  }
  if (product.categoryKey === 'seeds' || /seed/i.test(product.category || '')) {
    return 'Whole Seeds & Ground';
  }

  const forms = product.availableForms || [];
  const hasPowder = forms.some(f => /powder|ground|milled/i.test(f));
  const hasWhole = forms.some(f => /whole|finger|bulb|pod|berry|bark|leaf|rhizome|star|seed/i.test(f) && !/ground/i.test(f));

  if (hasWhole && hasPowder) return 'Whole & Ground';
  if (hasWhole) return 'Whole Dried Form';
  if (hasPowder) return 'Pure Ground Powder';
  return 'Whole & Ground';
}

/**
 * Cleans up long supply grade strings for compact responsive card display.
 * Removes bulky parentheticals so the primary grade title remains legible
 * without trailing ellipsis cutoff on mobile cards.
 */
export function formatSupplyGrade(grade: string | undefined | null): string {
  if (!grade) return 'Export Standard';
  const first = grade.split(/[·•]/)[0].trim();
  // Strip parentheses with numbers/percentages for compact display
  const cleaned = first.replace(/\s*\([^)]*\)/g, '').trim();
  return cleaned || first;
}
