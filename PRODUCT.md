# Product

## Platform

web

## Users

International B2B commercial spice buyers, procurement directors, food processors, industrial grinders, private label packers, and agricultural commodity importers across Europe, the Middle East (GCC), North America, and Asia-Pacific.

## Product Purpose

The official digital export portal and commercial trade desk for **Origintra Exim**, an Indian agricultural export merchant. The platform exists to establish corporate credibility, provide transparent technical specifications for Indian spices, streamline B2B inquiries (FOB/CIF quotations), and facilitate direct trade consultations with export directors.

## Positioning

Direct farmgate and accredited regional mandi sourcing from India's key agricultural belts, combining strict physical grading, laboratory-tested purity (zero artificial dyes / Sudan-negative), moisture equilibrium control, and complete export documentation compliance under statutory Indian authorities.

## Operating Context

Commercial trade workflows:
- Sourcing research: Reviewing crop specs, harvest windows, moisture levels, ASTA color values, and whole vs. powder mesh sizing.
- Procurement evaluation: Verifying Indian export compliance (IEC, APEDA, Spices Board CRES, FSSAI, GST, Phytosanitary certification).
- Formal inquiries: Submitting detailed Requests for Quotation (target grades, FCL/LCL volumes, custom packaging, discharge port).
- Direct consultations: Booking 30-minute video conferences with commercial trade directors via integrated Calendly desk.

## Capabilities and Constraints

- **Product Catalog**: Whole & ground Indian spices (Red Chilli, Turmeric, Coriander, Cumin, Moringa, Black Pepper, Cardamom, Fennel, Fenugreek, Ginger) with verified botanical details, harvest calendars, and export loading capacities.
- **RFQ Quote Builder**: Interactive modal capturing target commodity, product form (Whole / Powder / Crushed), container volume, packaging, and port of destination.
- **Trade Scheduling**: Dedicated Calendly booking desk (`/schedule-meeting`) for direct commercial consultations.
- **Quality & Certifications**: Dedicated compliance showcase displaying statutory certificates with zero visual artifacts.
- **Technical Architecture**: Single-page application built on React 18, Vite, TypeScript, and Tailwind CSS; mock API and local storage persistence.

## Brand Commitments

- **Name**: Origintra Exim
- **Tagline**: Connecting Markets. Moving Possibilities.
- **Color Palette**: Executive Maritime Navy (`#0A1C3E`), Trust Blue (`#0070E0`), Sky Blue Accent (`#38BDF8`), Crisp White (`#FFFFFF`), Neutral Slate (`#F8FAFC`, `#F1F5F9`, `#64748B`, `#0F172A`).
- **Tone of Voice**: Executive, authoritative, transparent, and strictly business-to-business. Avoid exaggerated marketing fluff or fake stats.
- **Certifications**: FSSAI, Spices Board India (CRES), APEDA, DGFT (IEC), GST, MSME.

## Evidence on Hand

- Authenticated product catalog in `src/data/products.ts`
- Clean high-resolution regulatory logos in `public/assets/certificates/`
- Verified company logistics and operational ports (Mundra, JNPT, Cochin) in `src/data/company.ts`
- Active Calendly trade desk endpoint: `https://calendly.com/origintraexim/30min`

## Product Principles

1. **Commercial Clarity over Marketing Fluff**: Present authentic technical specifications, moisture limits, and export HS codes upfront.
2. **Authentic Trust over Artificial Signals**: Display genuine statutory licenses and compliance documentation without fake counters or generic stock aesthetics.
3. **Frictionless B2B Actions**: Enable instant RFQ submission, direct WhatsApp trade desk contact, and seamless calendar scheduling.
4. **Visual Rigor**: Clean layout hierarchy, precise typography, zero visual jitter, and responsive rendering across all buyer devices.

## Accessibility & Inclusion

Targeting WCAG 2.1 AA compliance: semantic HTML headings, high-contrast text on navy and white backgrounds, accessible interactive controls with clear focus rings, and readable font sizing for international buyers.
