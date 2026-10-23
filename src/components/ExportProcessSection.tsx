import React from 'react';
import { Leaf, Search, Package, FileCheck, Ship, Globe } from 'lucide-react';

interface ProcessStep {
  step: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const EXPORT_PROCESS_STEPS: ProcessStep[] = [
  {
    step: '01',
    title: 'Sourcing',
    desc: 'We source premium spices from trusted Indian farmers.',
    icon: Leaf
  },
  {
    step: '02',
    title: 'Quality Check',
    desc: 'Rigorous quality testing to meet international standards.',
    icon: Search
  },
  {
    step: '03',
    title: 'Packaging',
    desc: 'Hygienic and export-grade packaging as per buyer requirements.',
    icon: Package
  },
  {
    step: '04',
    title: 'Documentation',
    desc: 'Complete export documentation including IEC, GST, FSSAI, APEDA.',
    icon: FileCheck
  },
  {
    step: '05',
    title: 'Shipping',
    desc: 'Safe and timely shipping through trusted logistics partners.',
    icon: Ship
  },
  {
    step: '06',
    title: 'Global Delivery',
    desc: 'Your spices reach international markets with assured quality and on-time delivery.',
    icon: Globe
  }
];

export const ExportProcessSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 bg-[#051838] text-white">
      {/* Dotted Global Network Map Background Watermark */}
      <div 
        className="absolute inset-0 pointer-events-none select-none flex items-center justify-end opacity-[0.14] overflow-hidden"
        aria-hidden="true"
      >
        <img 
          src="/assets/dotted-world-map.svg" 
          alt="" 
          className="w-full max-w-[950px] h-full object-contain object-right"
          loading="lazy"
          decoding="async"
        />
      </div>
      
      {/* Ambient Radial Blue Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#0070E0]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="container-x mx-auto max-w-[1440px] relative z-10 px-4 sm:px-8">
        
        {/* Executive Header */}
        <div className="max-w-3xl mb-14 sm:mb-20">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#00A3FF]">
            Simple • Transparent • Reliable
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-display tracking-tight mt-2.5">
            Our Spice <span className="text-[#00A3FF]">Export Process</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3.5 leading-relaxed font-normal">
            From sourcing the finest Indian spices to delivering them across global markets, we follow a simple and transparent process to ensure consistent quality and on-time delivery.
          </p>
        </div>

        {/* Desktop 6-Step Horizontal Flow with Connecting Arrows */}
        <div className="hidden lg:flex items-start justify-between gap-1 xl:gap-2">
          {EXPORT_PROCESS_STEPS.map((item, index, arr) => {
            const IconComp = item.icon;
            const isLast = index === arr.length - 1;

            return (
              <React.Fragment key={item.step}>
                {/* Step Item */}
                <div className="flex-1 flex flex-col items-center text-center group">
                  {/* Glowing Round Icon Badge */}
                  <div className="relative">
                    <div className="w-20 h-20 xl:w-22 xl:h-22 rounded-full bg-[#072450] border-2 border-[#0070E0] shadow-[0_0_22px_rgba(0,112,224,0.35)] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_28px_rgba(0,163,255,0.5)]">
                      <IconComp className="w-8 h-8 xl:w-9 xl:h-9 text-white stroke-[1.8]" />
                    </div>

                    {/* Number Pill at Bottom of Circle */}
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#00A3FF] border-2 border-[#051838] flex items-center justify-center text-white text-[11px] font-bold font-mono shadow-md">
                      {item.step}
                    </div>
                  </div>

                  {/* Step Title */}
                  <h3 className="text-base xl:text-lg font-bold text-white mt-6 mb-2 tracking-tight">
                    {item.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-xs xl:text-[13px] text-slate-300 leading-relaxed max-w-[170px] xl:max-w-[190px]">
                    {item.desc}
                  </p>
                </div>

                {/* Horizontal Arrow between Steps */}
                {!isLast && (
                  <div className="pt-8 xl:pt-9 shrink-0 flex items-center justify-center px-1">
                    <svg 
                      className="w-8 xl:w-12 h-4 text-[#0070E0]" 
                      viewBox="0 0 48 16" 
                      fill="none"
                      aria-hidden="true"
                    >
                      <path 
                        d="M0 8H42M42 8L34 2M42 8L34 14" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile & Tablet Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-6 lg:hidden">
          {EXPORT_PROCESS_STEPS.map((item) => {
            const IconComp = item.icon;
            return (
              <div 
                key={item.step}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#0070E0]/50 transition-all duration-300"
              >
                <div className="relative mb-5">
                  <div className="w-18 h-18 rounded-full bg-[#072450] border-2 border-[#0070E0] shadow-[0_0_20px_rgba(0,112,224,0.35)] flex items-center justify-center">
                    <IconComp className="w-8 h-8 text-white stroke-[1.8]" />
                  </div>
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#00A3FF] border-2 border-[#051838] flex items-center justify-center text-white text-[10px] font-bold font-mono shadow-md">
                    {item.step}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2 tracking-tight">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed max-w-[220px]">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
