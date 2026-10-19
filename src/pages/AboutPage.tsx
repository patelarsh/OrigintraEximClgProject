import React from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Compass,
  Layers,
  Truck,
  Globe,
  Globe2,
  Mail,
  Phone,
  Target,
  MessageSquareText,
  Ship,
  Handshake,
  Building2
} from 'lucide-react';
import { useCompanyConfig } from '../hooks/useCompanyConfig';
import { TEAM_EXPANSION_NOTICE, TEAM_MEMBERS as DEFAULT_TEAM_MEMBERS } from '../data/team';
import { TeamMember } from '../types';
import { AdminStorage } from '../services/adminStorage';

interface AboutPageProps {
  onNavigate: (page: string) => void;
  onOpenQuote: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenQuote }) => {
  const COMPANY_CONFIG = useCompanyConfig();
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>(() => AdminStorage.getTeamMembers());
  const [leadershipVisible, setLeadershipVisible] = React.useState<boolean>(() => AdminStorage.getLeadershipVisibility());

  React.useEffect(() => {
    AdminStorage.syncSettingsFromServer();
    const handleUpdate = () => setTeamMembers(AdminStorage.getTeamMembers());
    const handleVisUpdate = () => setLeadershipVisible(AdminStorage.getLeadershipVisibility());
    window.addEventListener('origintra_team_updated', handleUpdate);
    window.addEventListener('origintra_leadership_visibility_updated', handleVisUpdate);
    return () => {
      window.removeEventListener('origintra_team_updated', handleUpdate);
      window.removeEventListener('origintra_leadership_visibility_updated', handleVisUpdate);
    };
  }, []);
  return (
    <div className="bg-white text-[#0F172A]">
      
      {/* Page Hero */}
      <section className="relative z-20 overflow-hidden bg-[#0A1C3E] text-white py-12 sm:py-20 md:py-28 shadow-xs">
        <div className="container-x mx-auto max-w-[1440px] relative">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
              About Origintra Exim • Premier Indian Spices Exporter
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-white">
              Built for Global Trade. Driven by Trust<span className="text-[#0070E0]">.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed pt-2">
              A premier Indian spices exporter and agricultural merchant trading house, connecting trusted farmgate sourcing across India's prime agricultural belts with international commercial markets in over 24 countries worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Sourcing Ethos & Philosophy */}
      <section className="relative z-10 pt-0 pb-16 sm:pb-24 md:pb-28 bg-white border-b border-slate-200">
        <div className="container-x mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            
            {/* Left Column: Sourcing Narrative */}
            <div className="order-2 lg:order-1 lg:col-span-6 space-y-4 sm:space-y-6 pt-6 sm:pt-8 lg:pt-16 md:pt-20">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
                Our Philosophy
              </span>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-[#0F172A] tracking-tight">
                Global Trade Works Best When Quality, Transparency, and Reliability Move Together<span className="text-[#0070E0]">.</span>
              </h2>

              <p className="text-base text-slate-600 leading-relaxed">
                Origintra Exim was founded on the recognition that overseas spice importers face persistent challenges: inconsistent product lots, fluctuating moisture levels, unpredictable shipping delays, and ambiguous communications.
              </p>

              <p className="text-base text-slate-600 leading-relaxed">
                We approach export as a long-term discipline. By establishing direct sourcing links across key agricultural mandis and farmer clusters—from the red chilli yards of Guntur to the turmeric fields of Salem and the cumin belts of Gujarat—we maintain oversight over harvest quality, mechanical cleaning, and seaworthy packing.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={onOpenQuote}
                  className="btn-pill btn-pill-dark bg-[#0A1C3E] hover:bg-[#0070E0] text-white px-6 py-3 text-xs sm:text-sm font-semibold flex items-center space-x-2 cursor-pointer"
                >
                  <span>Request a Quote</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('products')}
                  className="btn-pill border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-100 text-slate-800 hover:text-[#0A1C3E] px-6 py-3 text-xs sm:text-sm font-semibold flex items-center space-x-2 cursor-pointer shadow-2xs transition-all"
                >
                  <span className="text-slate-800 font-semibold">Explore Products</span>
                  <ArrowRight className="w-4 h-4 ml-0.5 text-slate-700" />
                </button>
              </div>
            </div>

            {/* Right Column: Full HD Blue Container Hanging DIRECTLY from the Blue Hero Section above */}
            <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-center relative pt-0">
              
              {/* Full HD Blue Hanging Container - Real steel cables extend seamlessly to touch the blue hero block */}
              <div className="w-full flex items-center justify-center relative -mt-10 sm:-mt-14 md:-mt-18 lg:-mt-20">
                <img
                  src="/assets/about/blue-hanging-container.png"
                  alt="Full HD Blue Export Shipping Container hanging from above hero block - Origintra Exim"
                  className="w-full max-w-[560px] sm:max-w-[620px] lg:max-w-[680px] xl:max-w-[720px] h-auto object-contain transition-transform duration-500 hover:scale-[1.01] filter drop-shadow-2xl"
                  loading="lazy"
                />
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Leadership & Executive Team Section (Controlled via Admin Panel) */}
      {leadershipVisible && (
        <section className="py-12 sm:py-20 md:py-28 bg-white border-b border-slate-200">
        <div className="container-x mx-auto max-w-[1440px]">
          
          <div className="max-w-3xl mb-10 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
              Leadership & Key People
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-[#0F172A] tracking-tight mt-2">
              The Leadership Behind Origintra Exim<span className="text-[#0070E0]">.</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-2 sm:mt-3 leading-relaxed">
              Seasoned agro-commodity export leaders combining decades of hands-on farmgate mandi procurement, NABL laboratory food compliance, and disciplined maritime logistics.
            </p>
          </div>

          {/* Leaders 4-Column Grid with Photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Photo container */}
                <div className="relative aspect-4/5 overflow-hidden bg-slate-100">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-85" />
                  
                  {/* Position Pill Overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="inline-block bg-[#0070E0]/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
                      {member.position}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-display font-bold text-[#0F172A]">
                        {member.name}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-[#0070E0] shrink-0" />
                    </div>

                    <p className="text-xs font-semibold text-[#0070E0]">
                      {member.role}
                    </p>

                    <div className="pt-1">
                      <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                        {member.credentials}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pt-2">
                      {member.bio}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                    <span className="text-slate-400 font-normal">Focus: </span>
                    {member.specialization}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>
      )}

      {/* =========================================================================
          SECTION: Purpose & Direction (Our Mission & Our Vision)
      ========================================================================= */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="container-x mx-auto max-w-[1440px]">
          
          <div className="max-w-3xl mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
              Guiding Directives
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-semibold text-[#0F172A] tracking-tight mt-2">
              Purpose & Direction<span className="text-[#0070E0]">.</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed pt-1">
              Our institutional foundation built for long-term consistency in international commerce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* OUR MISSION */}
            <div className="relative p-5 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl bg-[#0A1C3E] text-white border border-white/10 shadow-sm flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 rounded-full bg-[#0070E0]/15 blur-2xl pointer-events-none" />
              
              <div className="space-y-4 sm:space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-sky-300">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[11px] sm:text-xs uppercase font-mono tracking-wider text-sky-300/80">
                    DIRECTIVE // 01
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold text-white">
                    Our Mission
                  </h3>
                  <p className="text-base sm:text-lg md:text-xl text-slate-100 font-normal leading-relaxed pt-1">
                    “To connect Indian products with global markets through quality-focused sourcing, transparent communication, and dependable trade coordination.”
                  </p>
                </div>
              </div>

              <div className="pt-6 sm:pt-8 mt-4 sm:mt-6 border-t border-white/10 text-xs sm:text-sm text-slate-300 relative z-10">
                Grounded in farmgate sourcing discipline, certified laboratory testing, and responsible trade execution.
              </div>
            </div>

            {/* OUR VISION */}
            <div className="relative p-5 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl bg-slate-50 text-[#0F172A] border border-slate-200/90 shadow-2xs flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 rounded-full bg-blue-100/50 blur-2xl pointer-events-none" />
              
              <div className="space-y-4 sm:space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#0070E0]">
                    <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[11px] sm:text-xs uppercase font-mono tracking-wider text-slate-400">
                    DIRECTIVE // 02
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-semibold text-[#0F172A]">
                    Our Vision
                  </h3>
                  <p className="text-base sm:text-lg md:text-xl text-slate-800 font-normal leading-relaxed pt-1">
                    “To build Origintra Exim into a trusted international trading partner known for professionalism, consistency, and long-term business relationships.”
                  </p>
                </div>
              </div>

              <div className="pt-6 sm:pt-8 mt-4 sm:mt-6 border-t border-slate-200 text-xs sm:text-sm text-slate-600 relative z-10">
                Earning buyer trust through repeatable batch consistency, honest communication, and enduring relationships.
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION: Why Choose Origintra Exim? (5 Pillars + Corporate Trade Desk)
      ========================================================================= */}
      <section className="py-16 sm:py-24 bg-slate-50/70 border-b border-slate-200/80">
        <div className="container-x mx-auto max-w-[1440px]">
          
          <div className="max-w-3xl mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
              Value Proposition
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-semibold text-[#0F172A] tracking-tight mt-2">
              Why Choose Origintra Exim?<span className="text-[#0070E0]">.</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed pt-1">
              Five institutional pillars that ensure your Indian agricultural procurement is secure, compliant, and dependable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Pillar 01 */}
            <div className="bg-white rounded-2xl p-7 sm:p-8 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0070E0] flex items-center justify-center">
                  <Globe2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">01</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-display font-bold text-[#0F172A]">India-Based Sourcing</h3>
                <p className="text-xs sm:text-sm font-semibold text-[#0070E0]">Access to Indian spices and agricultural products.</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Direct relationships with trusted farming belts and established mandis across India, ensuring authentic single-origin integrity and supply stability.
              </p>
            </div>

            {/* Pillar 02 */}
            <div className="bg-white rounded-2xl p-7 sm:p-8 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0070E0] flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">02</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-display font-bold text-[#0F172A]">Buyer-Focused Approach</h3>
                <p className="text-xs sm:text-sm font-semibold text-[#0070E0]">Enquiries handled according to product and order requirements.</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every consignment is structured around your specific grade, moisture threshold, mesh size, microbiological parameters, and commercial timelines.
              </p>
            </div>

            {/* Pillar 03 */}
            <div className="bg-white rounded-2xl p-7 sm:p-8 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0070E0] flex items-center justify-center">
                  <MessageSquareText className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">03</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-display font-bold text-[#0F172A]">Clear Communication</h3>
                <p className="text-xs sm:text-sm font-semibold text-[#0070E0]">Transparent discussions about specifications, pricing, packaging, and shipping.</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                No ambiguous clauses. We maintain open, clear dialogue on market availability, lot testing reports, pricing breakdowns, and container milestones.
              </p>
            </div>

            {/* Pillar 04 */}
            <div className="bg-white rounded-2xl p-7 sm:p-8 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0070E0] flex items-center justify-center">
                  <Ship className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">04</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-display font-bold text-[#0F172A]">Professional Coordination</h3>
                <p className="text-xs sm:text-sm font-semibold text-[#0070E0]">Support with trade-related requirements and export arrangements.</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Full coordination for phytosanitary clearance, surveyor inspection (SGS/Bureau Veritas), certificate of origin, and port container stuffing.
              </p>
            </div>

            {/* Pillar 05 */}
            <div className="bg-white rounded-2xl p-7 sm:p-8 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0070E0] flex items-center justify-center">
                  <Handshake className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">05</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-display font-bold text-[#0F172A]">Long-Term Partnerships</h3>
                <p className="text-xs sm:text-sm font-semibold text-[#0070E0]">A commitment to building mutually beneficial business relationships.</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We believe sustainable export success is measured in recurring consignments, year-over-year trust, and shared commercial growth.
              </p>
            </div>

            {/* Pillar 06: Corporate Trade Desk */}
            <div className="bg-[#0A1C3E] text-white rounded-2xl p-7 sm:p-8 border border-white/10 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 text-sky-300 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                  Corporate Trade Desk
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Have an active purchase order or tender requirements? Our commercial desk evaluates product specifications and provides transparent FOB / CIF pricing.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={onOpenQuote}
                  className="w-full btn-pill bg-[#0070E0] hover:bg-[#005bb5] text-white py-3 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <span>Request Commercial Quotation</span>
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION: Statutory Export Certificates & Accreditations (FSSAI, APEDA, Spice Board, IEC, GST, MSME)
      ========================================================================= */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-[#0A1C3E] text-white">
        {/* Dotted Global Network Map Background (Faint Watermark with Routes & Nodes) */}
        <div 
          className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-[0.06]"
          aria-hidden="true"
        >
          <img 
            src="/assets/dotted-world-map.webp" 
            alt="" 
            width="1600"
            height="1000"
            className="w-full h-full object-cover object-center scale-105"
            loading="lazy"
            decoding="async"
          />
        </div>
        {/* Soft edge fade overlay for seamless background integration */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1C3E]/60 via-transparent to-[#0A1C3E]/60 pointer-events-none" />

        <div className="container-x mx-auto max-w-[1440px] relative z-10">
          
          {/* Executive Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-blue-900/60">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                Statutory Export Accreditations & Licensing
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-white tracking-tight mt-2">
                Government Verified & Certified for Global Trade<span className="text-[#38BDF8]">.</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Origintra Exim is a licensed Indian merchant exporter. Commercial spice consignments are governed by statutory food safety standards, lab clearances, and official trade certifications.
              </p>
            </div>

            <button
              onClick={() => onNavigate('quality')}
              className="px-5 py-2.5 rounded-lg bg-[#0070E0] hover:bg-[#005bb5] text-white text-xs sm:text-sm font-semibold shrink-0 cursor-pointer flex items-center space-x-2 transition-colors shadow-sm"
            >
              <span>View Full Quality & Compliance</span>
              <ArrowUpRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

          {/* 6 Accreditations - Official Government Certificate Logos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            
            {/* 1. FSSAI */}
            <div 
              onClick={() => onNavigate('quality')}
              className="bg-white rounded-2xl p-6 sm:p-7 flex items-center justify-center hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group shadow-md h-32 sm:h-38 md:h-44 border border-white/90"
              title="FSSAI - Food Safety and Standards Authority of India"
            >
              <img 
                src="/assets/certificates/fssai.png" 
                alt="FSSAI - Food Safety and Standards Authority of India" 
                className="h-16 sm:h-20 md:h-24 w-auto max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-110" 
                loading="lazy"
              />
            </div>

            {/* 2. APEDA */}
            <div 
              onClick={() => onNavigate('quality')}
              className="bg-white rounded-2xl p-6 sm:p-7 flex items-center justify-center hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group shadow-md h-32 sm:h-38 md:h-44 border border-white/90"
              title="APEDA - Agricultural and Processed Food Products Export Development Authority"
            >
              <img 
                src="/assets/certificates/apeda.png" 
                alt="APEDA - Agricultural and Processed Food Products Export Development Authority" 
                className="h-16 sm:h-20 md:h-24 w-auto max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-110" 
                loading="lazy"
              />
            </div>

            {/* 3. Spice Board */}
            <div 
              onClick={() => onNavigate('quality')}
              className="bg-white rounded-2xl p-6 sm:p-7 flex items-center justify-center hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group shadow-md h-32 sm:h-38 md:h-44 border border-white/90"
              title="Spices Board India - Ministry of Commerce and Industry"
            >
              <img 
                src="/assets/certificates/spices-board.png" 
                alt="Spices Board India" 
                className="h-16 sm:h-20 md:h-24 w-auto max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-110" 
                loading="lazy"
              />
            </div>

            {/* 4. IEC */}
            <div 
              onClick={() => onNavigate('quality')}
              className="bg-white rounded-2xl p-6 sm:p-7 flex items-center justify-center hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group shadow-md h-32 sm:h-38 md:h-44 border border-white/90"
              title="IEC - Import Export Code (DGFT, Ministry of Commerce)"
            >
              <img 
                src="/assets/certificates/iec.png" 
                alt="IEC DGFT License" 
                className="h-16 sm:h-20 md:h-24 w-auto max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-110" 
                loading="lazy"
              />
            </div>

            {/* 5. GST */}
            <div 
              onClick={() => onNavigate('quality')}
              className="bg-white rounded-2xl p-6 sm:p-7 flex items-center justify-center hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group shadow-md h-32 sm:h-38 md:h-44 border border-white/90"
              title="GST - Goods and Services Tax"
            >
              <img 
                src="/assets/certificates/gst.png" 
                alt="GST" 
                className="h-16 sm:h-20 md:h-24 w-auto max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-110" 
                loading="lazy"
              />
            </div>

            {/* 6. MSME */}
            <div 
              onClick={() => onNavigate('quality')}
              className="bg-white rounded-2xl p-6 sm:p-7 flex items-center justify-center hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group shadow-md h-32 sm:h-38 md:h-44 border border-white/90"
              title="MSME - Ministry of Micro, Small and Medium Enterprises"
            >
              <img 
                src="/assets/certificates/msme.svg" 
                alt="MSME" 
                className="h-16 sm:h-20 md:h-24 w-auto max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-110" 
                loading="lazy"
              />
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION: Let's Build a Global Business Relationship
      ========================================================================= */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container-x mx-auto max-w-[1440px]">
          
          <div className="bg-[#0A1C3E] rounded-2xl sm:rounded-3xl text-white p-5 sm:p-10 lg:p-16 border border-slate-800 shadow-xl">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              
              {/* Left Column: Narrative & Action CTAs */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                
                <div className="space-y-2 sm:space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    Global Trade Inquiries
                  </span>
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-semibold text-white tracking-tight leading-tight">
                    Let's Build a Global Business Relationship<span className="text-[#0070E0]">.</span>
                  </h2>
                </div>

                <div className="space-y-3 sm:space-y-4 text-sm sm:text-base md:text-lg text-slate-200 font-normal leading-relaxed">
                  <p>
                    Looking for an Indian spice supplier or export partner? Share your product requirements, destination country, required quantity, and packaging preferences. Our team will review your enquiry and discuss the next steps.
                  </p>
                  <p className="text-white font-semibold text-base sm:text-lg md:text-xl">
                    Contact Origintra Exim today to discuss your sourcing requirements.
                  </p>
                </div>

                {/* Primary CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <button
                    onClick={onOpenQuote}
                    className="btn-pill bg-[#0070E0] hover:bg-[#005bb5] text-white px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 shadow-md shadow-[#0070E0]/20 cursor-pointer w-full sm:w-auto"
                  >
                    <span>Submit Sourcing Enquiry</span>
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </button>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="btn-pill border border-white/30 hover:border-white text-white hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer w-full sm:w-auto"
                  >
                    <span>Contact Trade Desk</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

              </div>

              {/* Right Column: Commercial Desk Checklist */}
              <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-700/80 space-y-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase font-semibold text-sky-400 tracking-wider">
                    Commercial Desk Checklist
                  </span>
                  <h3 className="text-lg font-display font-bold text-white">
                    What to Include in Your Enquiry
                  </h3>
                </div>

                <div className="space-y-4 pt-1">
                  
                  <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-800">
                    <span className="w-6 h-6 rounded-md bg-[#0070E0]/20 text-sky-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-white">Product Requirements</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Spice type, whole or ground form, purity %, moisture limits, and target grade.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-800">
                    <span className="w-6 h-6 rounded-md bg-[#0070E0]/20 text-sky-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-white">Destination Country</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Port of discharge and preferred shipping terms (FOB, CFR, or CIF).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5 pb-3 border-b border-slate-800">
                    <span className="w-6 h-6 rounded-md bg-[#0070E0]/20 text-sky-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-white">Required Quantity</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Sample order, partial container, or full 20ft / 40ft FCL volume.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3.5">
                    <span className="w-6 h-6 rounded-md bg-[#0070E0]/20 text-sky-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-white">Packaging Preferences</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Bulk PP bags, vacuum bags, jute sacks, or custom brand packaging.
                      </p>
                    </div>
                  </div>

                </div>

                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                  Reviewed by commercial trade desk with specification feasibility and formal proforma quote within 24 hours.
                </div>
              </div>

            </div>

            {/* Direct Communication Badges */}
            <div className="mt-10 sm:mt-12 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#0070E0]" />
                <span>Email:</span>
                <a href={`mailto:${COMPANY_CONFIG.primaryEmail}`} className="text-white hover:underline font-medium">
                  {COMPANY_CONFIG.primaryEmail}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#0070E0]" />
                <span>Trade Desk:</span>
                <a href={`tel:${COMPANY_CONFIG.phone}`} className="text-white hover:underline font-medium">
                  {COMPANY_CONFIG.phoneDisplay}
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Globe2 className="w-4 h-4 text-[#0070E0]" />
                <span>Head Office:</span>
                <span className="text-white font-medium">
                  Sabarkantha / Ahmedabad Hubs, Gujarat, India
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
