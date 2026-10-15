import React, { useEffect, useState } from 'react';
import { useCompanyConfig } from '../hooks/useCompanyConfig';

interface MeetingPageProps {
  onNavigate: (page: string) => void;
  onOpenQuote?: () => void;
}

export const MeetingPage: React.FC<MeetingPageProps> = () => {
  const COMPANY_CONFIG = useCompanyConfig();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const rawCalendlyUrl = COMPANY_CONFIG.calendlyUrl || 'https://calendly.com/origintraexim/30min';
  const baseCalendly = rawCalendlyUrl.replace(/\/+$/, '');
  const embedSrc = `${baseCalendly}?embed_domain=${typeof window !== 'undefined' ? window.location.hostname : 'origintra.com'}&embed_type=Inline`;

  useEffect(() => {
    // Scroll to top upon page load
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Load official Calendly script for enhanced experience if available
    const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F8FAFC] py-5 sm:py-10 md:py-14 px-2 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-[960px] mx-auto flex justify-center">
        {/* Clean Centered Calendly Card */}
        <div className="w-full bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden relative min-h-[620px] sm:min-h-[720px] md:min-h-[760px]">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-white z-10">
              <div className="w-8 h-8 border-3 border-[#0070E0] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Loading schedule...</span>
            </div>
          )}
          
          <iframe
            src={embedSrc}
            width="100%"
            height="100%"
            frameBorder="0"
            title="Schedule a Meeting with Origintra Exim"
            className="w-full border-0 block min-h-[620px] sm:min-h-[720px] md:min-h-[760px]"
            onLoad={() => setIframeLoaded(true)}
            style={{ width: '100%', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};
