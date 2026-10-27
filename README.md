# ORIGINTRA EXIM - Global Spice Export & International Trade Web Platform

> **"CONNECTING MARKETS. MOVING POSSIBILITIES."**  
> Official B2B Web Portal for **ORIGINTRA EXIM** — Premier Exporter of Authentic Indian Spices to 45+ International Seaports.

---

## 🌊 Brand & Color Palette (Tailored to Logo)

The entire design system is built to strictly reflect the maritime and trade essence of the **ORIGINTRA EXIM** identity:

- **Midnight Maritime Navy (`#030C1C`, `#07162C`, `#0A2346`)**: Represents oceanic stability, international trust, and deep-sea freight reliability.
- **Electric Cerulean & Sky Blue Wave (`#0088FF`, `#00A3FF`, `#38BDF8`)**: Direct match to the forward wave emblem breaking through the ship mark.
- **Spice Warmth Accents (`#F59E0B`, `#E5A93C`, `#10B981`)**: Subtle highlights for premium spice grades (Golden Turmeric, Cardamom Emerald, Amber Saffron).
- **Typography**: Clean, executive typography using **Outfit** (display headings) and **Plus Jakarta Sans** (international trade data & specifications).

---

## 🚢 Core Modules & Functionality

1. **Brand Identity Header & Navigation**
   - Official ORIGINTRA EXIM logo with ship and wave emblem.
   - Live multi-currency selector (`USD $`, `EUR €`, `GBP £`, `AED د.إ`, `INR ₹`) with dynamic commodity price re-calculation.
   - Sticky blurred glass navbar with quick links and consolidated inquiry cart counter.

2. **Maritime Hero Section**
   - Dynamic headline: *"Premier Global Exporter of Authentic Indian Spices"*.
   - Live stats ticker: 45+ Countries, 100% Lab Verified, 99.8% Punctual Sailing, 25,000+ MT Annual Capacity.
   - Dual Call-to-Actions for instant FOB/CIF quotations and container load calculations.

3. **Interactive Spice Catalog & Specification Sheets**
   - 12+ standard export spice commodities:
     - **Alleppey Green Cardamom** (Bold 8mm+ / Extra Bold 7.5mm - AGEB)
     - **Tellicherry Extra Bold Black Pepper** (TGSEB, Bulk Density 580-620 g/L, Piperine > 5.5%)
     - **Salem & Nizamabad Finger Turmeric** (Curcumin 4.5% - 5.5%)
     - **Guntur Teja S17 & S4 Sanam Dry Red Chilli** (ASTA 65-110, SHU 35k-75k)
     - **Gujarat Cumin Seeds (Jeera)** (99.5% Sortex Machine Cleaned, EU MRL compliant)
     - **Madagascar Whole Cloves** (18%+ Volatile Oil)
     - **True Ceylon Cinnamon Quills** (Alba & C5 Special, ultra-low coumarin <0.004%)
     - **Star Anise, Coriander Seeds, Dry Ginger, Whole Turmeric Fingers, Cryogenic Milled Organic Powders**.
   - Live category filtering, instant text search, and modal inspection with ASTA parameters and packing options.

4. **Interactive FCL / LCL Container Cargo Calculator**
   - Select 20' FCL, 40' FCL, 40' High Cube, or LCL.
   - Choose spice commodity and export packaging type (25kg Jute, 25kg PP Woven, 50kg Industrial, 20kg Vacuum Master Cartons).
   - Real-time calculations: Total Units, Net Cargo Tonnage (MT), Gross Weight (MT), CBM Volume, Payload & Volume Capacity Utilization % bars, Transit Time in days, and Free Detention Days.
   - One-click transfer to pre-populate the RFQ form.

5. **Live Vessel & Container Environmental Telemetry Tracker**
   - Real-time simulated Bill of Lading (BL) lookup (e.g. `OTX-992-ROTTERDAM`, `OTX-741-JEBELALI`, `OTX-318-NEWYORK`).
   - Displays live vessel name, shipping line (MSC, Maersk, CMA CGM), progress percentage, origin and destination ports.
   - **Internal Container Telemetry**: Live Temperature (°C) and Humidity (% RH) sensors to guarantee moisture-free voyage integrity.
   - Verified Phytosanitary Certificate status and downloadable electronic docs preview.

6. **Certified Quality Assurance & Interactive COA Inspector Hub**
   - Accreditation credentials: Spices Board of India, US FDA Registered, APEDA, ISO 22000:2018, HACCP, Halal, Kosher, FSSAI Export.
   - Interactive Certificate of Analysis (COA) inspector with actual laboratory parameters (Karl Fischer moisture titration, volatile oils, pesticide screening, aflatoxins, Salmonella detection).

7. **Global Maritime Trade Routes & Incoterms 2020 Visualizer**
   - Outbound shipping lanes from Mundra Port (Gujarat), JNPT Nhava Sheva (Mumbai), Cochin Port (Kerala), and Chennai Port.
   - Transit corridors to Middle East/GCC (3-7 days), Europe (20-25 days), North America (24-32 days), and Asia Pacific (6-18 days).
   - Practical Incoterms guide comparing FOB, CIF, CFR, and EXW responsibilities.

8. **B2B Export Quotation Engine (RFQ Modal)**
   - Pre-filled or customized inquiry submissions with quantity (MT), Incoterms, payment terms (LC at Sight, TT 30/70, CAD).
   - Celebratory confetti feedback, generated reference tracking ID (`OTX-RFQ-2026-XXXX`).
   - Instant WhatsApp Hotline button that opens a pre-composed message with the exact quote reference.

9. **Consolidated Multi-Spice Inquiry Cart Drawer**
   - Slide-out panel allowing buyers to bundle multiple spice commodities into a single container consignment quote.

---

## 🎓 Academic Criteria Fulfillment & Architecture

| # | Evaluation Criteria | Implementation Details |
|---|---------------------|------------------------|
| **2** | **Languages & Starter Kit / Environment** | Built using **Node.js 20+**, **TypeScript**, **React 19**, **Vite**, and **Express.js** backend with Tailwind CSS. |
| **3** | **Database Connectivity & Dynamic Content (CRUD)** | Integrated with **Supabase PostgreSQL** cloud database and REST API backend (`/api/products`, `/api/upload`, `/api/settings`, `/api/send-mail`). Supports full Create, Read, Update, Delete for products, inquiries, and site configuration with live UI synchronization. |
| **4** | **GIT Repos & Version Control** | Complete repository and version progression maintained across **115+ Git commits** tracking milestones, refactors, and feature additions. |
| **5** | **Docker Containerization** | Multi-stage production `Dockerfile` and `docker-compose.yml` configured to build and serve the application as an isolated container on port `5000`. |

---

## 🐳 Docker Deployment (Criteria 5)

### Option 1: Using Docker Compose (Recommended)
```bash
# Build image and start container in foreground
docker compose up --build

# Or start in detached mode (background)
docker compose up -d --build
```
Access the application live at: **http://localhost:5000**

To stop the container:
```bash
docker compose down
```

### Option 2: Using Pure Docker CLI
```bash
# 1. Build the Docker Image
docker build -t origintra-exim-app .

# 2. Run the Container
docker run -d -p 5000:5000 --name origintra_exim_container origintra-exim-app

# 3. Check logs
docker logs -f origintra_exim_container
### Docker Hub Image
- **Docker Hub Repository**: [hub.docker.com/r/patelarsh/origintra-exim](https://hub.docker.com/r/patelarsh/origintra-exim)
- **Pull & Run Directly from Docker Hub**:
```bash
docker pull patelarsh/origintra-exim:latest
docker run -d -p 5000:5000 --name origintra_exim_container patelarsh/origintra-exim:latest
```

---

## 🚀 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local frontend dev server (Vite)
npm run dev
# Live at: http://localhost:5173/

# 3. Run backend Express server
npm run server
# Live API at: http://localhost:5000/
```
