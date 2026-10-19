import React from 'react';
import { 
  CheckCircle2, 
  FileText, 
  Package, 
  Compass, 
  Truck, 
  ArrowUpRight, 
  Search, 
  Layers,
  AlertCircle
} from 'lucide-react';
import { EXPORT_CERTIFICATIONS } from '../data/company';

interface QualityPageProps {
  onNavigate: (page: string) => void;
  onOpenQuote: () => void;
}

export const QualityPage: React.FC<QualityPageProps> = ({ onNavigate, onOpenQuote }) => {
  const qualityPillars = [
    {
      step: '01',
      title: 'Product Selection',
      tagline: 'Farm-Gate & Mandi Raw Material Screening',
      desc: 'Agricultural quality begins in the field. Our procurement personnel inspect crop arrivals at regional cultivating mandis, evaluating seed maturity, absence of foreign matter, uniform pod color, and natural aroma before purchasing commitments are made.',
      checklist: [
        'Visual evaluation of pod/seed morphology and color uniformity',
        'Physical field inspection for insect damage, mold, and extraneous stones',
        'Verification of harvest freshness and proper sun-drying history'
      ]
    },
    {
      step: '02',
      title: 'Supplier Evaluation',
      tagline: 'Vetting Processing Facilities & Drying Yards',
      desc: 'We collaborate with licensed processors, cooperative cleaning mills, and curing stations possessing modern Sortex optical sorters, de-stoners, and enclosed hygienic handling environments.',
      checklist: [
        'Audit of mechanical cleaning and destoning machinery',
        'Inspection of sanitary conditions and rodent/pest barriers',
        'Evaluation of worker hygiene standards and food contact surfaces'
      ]
    },
    {
      step: '03',
      title: 'Quality Checks',
      tagline: 'Continuous Moisture & Physical Purity Verification',
      desc: 'Every lot is sampled and tested throughout grading. Moisture levels are checked using calibrated digital meters to guarantee safe thresholds, preventing mold or heat development during ocean shipping.',
      checklist: [
        'Moisture content verification across multiple sample composite draws',
        'Sieve analysis for uniform particle and mesh sizing',
        'Independent NABL laboratory testing coordinated per destination MRL protocols'
      ]
    },
    {
      step: '04',
      title: 'Packaging',
      tagline: 'Seaworthy Multi-Barrier Protection',
      desc: 'Packaging must preserve spice freshness across variable temperature and humidity zones. We utilize new, food-grade woven polypropylene (PP) bags, multi-ply kraft paper sacks, or sealed vacuum foil liners with tamper-evident stitching.',
      checklist: [
        'Food-grade virgin packaging materials free from odor contamination',
        'Moisture-resistant inner poly liners for sensitive powders and seeds',
        'Clear, legible export markings, lot codes, and gross/net weights'
      ]
    },
    {
      step: '05',
      title: 'Documentation',
      tagline: 'Transparent & Accurate Trade Compliance',
      desc: 'Flawless export documentation prevents port delays. We prepare and verify every certificate required by destination customs, including Phytosanitary Certificates, Certificates of Origin, and Certificates of Analysis.',
      checklist: [
        'Government Plant Quarantine inspection and Phytosanitary Certificate',
        'Chamber of Commerce verified Certificate of Origin (COO)',
        'Comprehensive Commercial Invoice, Packing List, and Clean On-Board B/L'
      ]
    },
    {
      step: '06',
      title: 'Shipment Coordination',
      tagline: 'Stuffing Supervision & Container Desiccant Stowage',
      desc: 'Stuffing is supervised at accredited Container Freight Stations (CFS). Containers are inspected for structural integrity, swept, deodorized, and fitted with industrial calcium chloride desiccant poles to absorb condensation sweat during ocean sailing.',
      checklist: [
        'Pre-stuffing container container floor and roof seal check',
        'Hanging container desiccants and corrugated floor liners installed',
        'Application of tamper-proof high-security customs bolt seals'
      ]
    }
  ];

  return (
    <div className="bg-white text-[#0F172A]">
      
      {/* Page Hero */}
      <section className="relative overflow-hidden bg-[#0A1C3E] text-white py-12 sm:py-20 md:py-28">
        <div className="container-x mx-auto max-w-[1440px] relative">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
              Spices Board & APEDA Compliance • Quality Assurance
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-white">
              Quality Is Part of Every Shipment<span className="text-[#0070E0]">.</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed pt-1 sm:pt-2">
              Rigorous quality assurance for Indian spice exports: NABL-accredited laboratory testing for moisture, aflatoxins, volatile oils, and pesticide MRLs meeting US FDA, EU, and GCC statutory import standards.
            </p>
          </div>
        </div>
      </section>


      {/* Statutory Export Accreditations & Registrations (APEDA, FSSAI, GST, IEC, Spices Board) */}
      <section className="py-12 sm:py-20 md:py-24 bg-white border-b border-slate-200">
        <div className="container-x mx-auto max-w-[1440px]">
          <div className="max-w-3xl mb-10 sm:mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
              Statutory Compliance & Legal Trade
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-[#0F172A] tracking-tight mt-2">
              Export Registrations & Certifications<span className="text-[#0070E0]">.</span>
            </h2>
            <p className="text-base text-slate-600 mt-3">
              Origintra Exim operates in full compliance with Indian export governing councils, food safety authorities, and international trade bodies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {EXPORT_CERTIFICATIONS.map((cert) => (
              <div
                key={cert.id}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-24 bg-white rounded-lg border border-slate-200 p-1.5 flex items-center justify-center">
                      <img src={cert.logo} alt={cert.name} className="h-full w-auto object-contain" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0070E0] text-[11px] font-bold border border-blue-100">
                      {cert.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#0F172A]">{cert.name}</h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{cert.fullName}</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {cert.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 truncate max-w-[190px]">{cert.authority}</span>
                  <span className="text-emerald-700 font-bold flex items-center space-x-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                </div>
              </div>
            ))}

            {/* Custom Sourcing Dossier Card */}
            <div className="p-6 rounded-2xl bg-[#0A1C3E] text-white shadow-md flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-[#38BDF8] text-[11px] font-bold border border-blue-400/30 inline-block">
                  Custom Destination Protocols
                </span>
                <h3 className="text-xl font-bold text-white">Destination-Specific Dossiers</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Need country-specific laboratory tests (e.g. EU MRL screens, US FDA compliance, Phytosanitary Fumigation, Certificate of Origin)? Our trade compliance desk coordinates tailored export dossiers for every port of entry.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-700">
                <button
                  onClick={onOpenQuote}
                  className="w-full py-2.5 rounded-lg bg-[#0070E0] hover:bg-[#005bb5] text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                >
                  <span>Request Documentation Dossier</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 6 Quality Pillars */}
      <section className="py-12 sm:py-20 md:py-28 bg-slate-50 border-b border-slate-200">
        <div className="container-x mx-auto max-w-[1440px]">
          
          <div className="max-w-3xl mb-10 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
              Framework
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-[#0F172A] tracking-tight mt-2">
              Our 6-Pillar Quality Protocol<span className="text-[#0070E0]">.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 sm:mt-3">
              From the initial mandi lot selection to container door sealing, every phase is guided by defined criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {qualityPillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs space-y-4 sm:space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#0070E0]">
                      PILLAR {pillar.step}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                      Standard Procedure
                    </span>
                  </div>

                  <h3 className="text-2xl font-display font-semibold text-[#0F172A]">
                    {pillar.title}
                  </h3>

                  <p className="text-xs font-semibold text-[#0070E0]">
                    {pillar.tagline}
                  </p>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/80 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Key Verification Measures:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {pillar.checklist.map((item, cIdx) => (
                      <li key={cIdx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0070E0] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Third Party Inspection Protocol */}
      <section className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
        <div className="container-x mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
                Independent Validation
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-semibold text-[#0F172A] tracking-tight">
                Third-Party Pre-Shipment Inspection
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                To provide international commercial buyers with total confidence, Origintra Exim gladly coordinates with globally recognized third-party surveyor agencies:
              </p>

              <div className="space-y-3 text-sm text-slate-700">
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                  <h4 className="font-bold text-[#0F172A]">Independent Surveyor Sampling</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Surveillance agencies (such as SGS, Bureau Veritas, or Intertek) can be nominated to draw composite samples directly during container stuffing at the CFS.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                  <h4 className="font-bold text-[#0F172A]">NABL Accredited Laboratory Testing</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Chemical testing (HPLC for capsaicin/curcumin, GC-MS for multi-residue pesticide screens, and microbiological assays) performed per destination import regulations.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center space-x-3 text-[#0070E0]">
                <FileText className="w-6 h-6" />
                <h3 className="text-xl font-display font-semibold text-[#0F172A]">
                  Standard Export Documentation Set
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every commercial cargo shipment is accompanied by a full suite of export documentation dispatched promptly via courier:
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0070E0]" />
                  <span>Commercial Invoice & Itemized Packing List</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0070E0]" />
                  <span>Clean On-Board Ocean Bill of Lading</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0070E0]" />
                  <span>Government Authorized Phytosanitary Certificate</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0070E0]" />
                  <span>Certificate of Origin (COO)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0070E0]" />
                  <span>Certificate of Analysis (COA)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0070E0]" />
                  <span>Fumigation Certificate (where mandatory)</span>
                </li>
              </ul>

              <div className="pt-2">
                <button
                  onClick={onOpenQuote}
                  className="w-full py-3 rounded-full bg-[#0A1C3E] hover:bg-[#0070E0] text-white text-xs font-semibold transition"
                >
                  Request Sample & Specification Sheet
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 sm:py-24 bg-white text-[#0F172A] border-t border-slate-200/80 text-center">
        <div className="container-x mx-auto max-w-[1440px] space-y-4 sm:space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
            Quality Specifications
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-[#0F172A] tracking-tight">
            Have Specific Quality Tolerances for Your Market?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Our quality and commercial desk is available to review your technical requirements sheet.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenQuote}
              className="btn-pill bg-[#0070E0] hover:bg-[#005bb5] text-white px-7 sm:px-9 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold cursor-pointer shadow-md inline-flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <span>Submit Quality Requirements</span>
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
