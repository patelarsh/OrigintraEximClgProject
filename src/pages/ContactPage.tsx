import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  ArrowRight,
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Anchor,
  ShieldCheck,
  Building,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { useCompanyConfig } from '../hooks/useCompanyConfig';
import { AdminStorage } from '../services/adminStorage';

interface ContactPageProps {
  onNavigate: (page: string) => void;
  onOpenQuote: () => void;
}

const COMMODITIES = [
  'Select commodity of interest...',
  'Turmeric (Salem / Erode Whole Fingers & Powder)',
  'Red Chilli (S17 Teja Stemless, Sanam, Powder)',
  'Cumin Seeds (Unjha Machine Cleaned & Sortex 99.5%)',
  'Coriander Seeds (Eagle, Scooter & Ground Powder)',
  'Black Pepper (Malabar 550 - 580 GL & Powder)',
  'Green Cardamom (Alleppey Bold 7mm - 8mm)',
  'Cloves (Handpicked Whole Lal Pari)',
  'Cinnamon (Ceylon Pure Quills)',
  'Mustard Seeds & Fenugreek Seeds',
  'Commercial Spice Blends (Garam Masala, Curry Powder)',
  'Organic Moringa Oleifera Leaf Powder',
  'Custom Agro-Commodity Contract Sourcing'
];

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate, onOpenQuote }) => {
  const COMPANY_CONFIG = useCompanyConfig();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    destinationPort: '',
    spiceAndGrade: '',
    volume: '',
    message: '',
    honeypot: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.honeypot && formData.honeypot.trim() !== '') {
      setIsSuccess(true);
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.company.trim() || !formData.phone.trim()) {
      setErrorMsg('Please complete all required fields (*).');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      AdminStorage.addInquiry({
        fullName: formData.name.trim(),
        companyName: formData.company.trim(),
        businessEmail: formData.email.trim(),
        country: 'International Importer',
        phoneWhatsApp: formData.phone.trim(),
        product: formData.spiceAndGrade.trim() || 'Bulk Indian Spices',
        quantityRequired: formData.volume.trim() || 'FCL Requirement',
        destinationPort: formData.destinationPort.trim() || 'To Be Nominated',
        message: formData.message.trim() || 'Enquiry submitted via Contact Page Form.',
        status: 'new',
        source: 'contact_page'
      });
    } catch (err) {
      console.error('Error saving inquiry:', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 700);
  };

  return (
    <div className="bg-[#F8FAFC] text-[#0F172A] min-h-screen">
      
      {/* Header Banner */}
      <section className="bg-[#0A1C3E] text-white border-b border-slate-800">
        <div className="container-x mx-auto max-w-[1320px] py-14 sm:py-20">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#38BDF8]">
              Commercial Merchandising & Trade Desk • Spices Exporter in India
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold tracking-tight text-white">
              Contact Our Export Desk
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed pt-1">
              Direct access to Origintra Exim procurement merchandisers, laboratory food technologists, and international maritime shipping coordinators for FOB and CIF container orders.
            </p>
          </div>
        </div>
      </section>

      {/* Main Two-Column Section */}
      <section className="py-12 sm:py-16">
        <div className="container-x mx-auto max-w-[1320px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Official Contact Channels & Trade Desk */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Primary Office Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
                
                <div>
                  <h2 className="text-lg font-display font-bold text-slate-900">
                    Origintra Exim
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Export Merchandising & Supply Chain Operations
                  </p>
                </div>

                <div className="space-y-5 text-xs sm:text-sm">
                  
                  {/* Corporate Office */}
                  <div className="flex items-start space-x-3.5">
                    <MapPin className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Registered Office & Commercial Desk</p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Ahmedabad, Gujarat – 380054, India
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Liaison desks in Cochin (Kerala) & Guntur (Andhra Pradesh)
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-start space-x-3.5">
                      <Mail className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Commercial Inquiries & RFQs</p>
                        <a 
                          href={`mailto:${COMPANY_CONFIG.primaryEmail}`}
                          className="text-xs sm:text-sm text-[#0070E0] hover:underline font-medium block mt-0.5"
                        >
                          {COMPANY_CONFIG.primaryEmail}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(COMPANY_CONFIG.primaryEmail, 'email')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Copy email address"
                    >
                      {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Phone & WhatsApp */}
                  <div className="flex items-start justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-start space-x-3.5">
                      <Phone className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Telephone & WhatsApp Desk</p>
                        <a 
                          href={`tel:${COMPANY_CONFIG.phone}`}
                          className="text-xs sm:text-sm text-slate-700 hover:text-[#0070E0] font-mono block mt-0.5"
                        >
                          {COMPANY_CONFIG.phoneDisplay}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(COMPANY_CONFIG.phoneDisplay, 'phone')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      title="Copy telephone"
                    >
                      {copiedKey === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Working Hours */}
                  <div className="flex items-start space-x-3.5 border-t border-slate-100 pt-4">
                    <Clock className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Operating Schedule</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Monday to Saturday: 09:00 – 18:30 IST (UTC+05:30)
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Commercial inquiries acknowledged within one business day
                      </p>
                    </div>
                  </div>

                </div>

              </div>

              {/* Google Map Location */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs space-y-0">
                <div className="p-5 sm:p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 text-slate-900">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0070E0] flex items-center justify-center border border-sky-100">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-display font-bold text-slate-900">
                          Office & Facility Location
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Origintra Exim • Gujarat Export Hub
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://maps.app.goo.gl/Yay1MwEGyTEiQhMu6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-[#0070E0] text-[#0070E0] hover:text-white text-xs font-semibold border border-sky-100 transition-all cursor-pointer group"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Interactive Map Embed */}
                <div className="relative w-full h-64 sm:h-72 bg-slate-100 border-y border-slate-200/80">
                  <iframe
                    title="Origintra Exim Google Map Location"
                    src="https://maps.google.com/maps?q=Origintra%20Exim,%20Ahmedabad,%20Gujarat&t=&z=14&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                {/* Map Footer Link */}
                <div className="p-4 sm:p-5 bg-slate-50/70 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-[#0070E0] shrink-0" />
                    <span className="truncate max-w-[200px] text-slate-700 font-medium">Ahmedabad / Gujarat Hubs</span>
                  </div>
                  <a
                    href="https://maps.app.goo.gl/Yay1MwEGyTEiQhMu6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0070E0] hover:underline font-bold flex items-center space-x-1 shrink-0"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>
                </div>
              </div>

              {/* Regulatory Accreditations */}
              <div className="px-6 py-4 bg-slate-100/70 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <span className="font-medium">Registered Exporter: APEDA • Spices Board • FSSAI • IEC</span>
                </div>
              </div>

            </div>

            {/* Right Column: Commercial Enquiry Form matching user mockup */}
            <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
              
              <div className="border-b border-slate-100 pb-5 mb-7 sm:mb-8">
                <span className="text-[#0070E0] text-[11px] sm:text-xs font-bold uppercase tracking-wider block mb-1">
                  Export Trade Desk • Direct Enquiry
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                  Commercial Quotation & Inquiries<span className="text-[#0070E0]">.</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Submit your spice parameters below. Our trade desk coordinates official FOB/CIF quotations, COA laboratory specs, and container schedules within 24 hours.
                </p>
              </div>

              {isSuccess ? (
                <div className="py-12 px-4 text-center space-y-4 animate-in fade-in">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold font-display text-slate-900">
                      Enquiry Received
                    </h3>
                    <p className="text-xs text-slate-500">
                      Thank you for contacting Origintra Exim.
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Our trade merchandiser will review your product parameters and destination discharge requirements and follow up with you directly within one business day.
                  </p>
                  <div className="pt-3">
                    <button
                      onClick={() => {
                        setIsSuccess(false);
                        setFormData({
                          name: '',
                          company: '',
                          email: '',
                          phone: '',
                          destinationPort: '',
                          spiceAndGrade: '',
                          volume: '',
                          message: '',
                          honeypot: ''
                        });
                      }}
                      className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0070E0] hover:bg-[#005bb5] rounded-lg transition cursor-pointer"
                    >
                      Submit Another Enquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
                  
                  {/* Anti-spam honeypot */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="origin_hp_token"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.honeypot}
                      onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Row 1: FULL NAME * & COMPANY * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-[13px] font-bold tracking-wider uppercase text-[#0070E0]">
                        FULL NAME *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-slate-200 focus:border-[#0070E0] focus:ring-0 rounded-none py-2 px-0 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base outline-none transition-colors duration-200 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-[13px] font-bold tracking-wider uppercase text-[#0070E0]">
                        COMPANY *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-slate-200 focus:border-[#0070E0] focus:ring-0 rounded-none py-2 px-0 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base outline-none transition-colors duration-200 font-medium"
                      />
                    </div>
                  </div>

                  {/* Row 2: EMAIL ADDRESS * & PHONE NUMBER * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-[13px] font-bold tracking-wider uppercase text-[#0070E0]">
                        EMAIL ADDRESS *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-slate-200 focus:border-[#0070E0] focus:ring-0 rounded-none py-2 px-0 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base outline-none transition-colors duration-200 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-[13px] font-bold tracking-wider uppercase text-[#0070E0]">
                        PHONE NUMBER *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +1 415 555 2671"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-slate-200 focus:border-[#0070E0] focus:ring-0 rounded-none py-2 px-0 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base outline-none transition-colors duration-200 font-medium"
                      />
                    </div>
                  </div>

                  {/* Row 3: DESTINATION PORT & SPICE AND GRADE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-[13px] font-bold tracking-wider uppercase text-[#0070E0]">
                        DESTINATION PORT
                      </label>
                      <input
                        type="text"
                        value={formData.destinationPort}
                        onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-slate-200 focus:border-[#0070E0] focus:ring-0 rounded-none py-2 px-0 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base outline-none transition-colors duration-200 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-[13px] font-bold tracking-wider uppercase text-[#0070E0]">
                        SPICE AND GRADE
                      </label>
                      <input
                        type="text"
                        list="spice-suggestions"
                        placeholder="e.g. S17 Teja, Whole with Stem"
                        value={formData.spiceAndGrade}
                        onChange={(e) => setFormData({ ...formData, spiceAndGrade: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-slate-200 focus:border-[#0070E0] focus:ring-0 rounded-none py-2 px-0 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base outline-none transition-colors duration-200 font-medium"
                      />
                      <datalist id="spice-suggestions">
                        <option value="S17 Teja Red Chilli, Whole with Stem" />
                        <option value="S17 Teja Red Chilli, Stemless" />
                        <option value="Salem Turmeric Fingers (3.5% Curcumin)" />
                        <option value="Erode Turmeric Fingers" />
                        <option value="Unjha Cumin Seeds (Sortex 99.5% Purity)" />
                        <option value="Eagle Coriander Seeds (Whole)" />
                        <option value="Malabar Black Pepper (550 GL / 580 GL)" />
                        <option value="Alleppey Green Cardamom (7mm - 8mm Bold)" />
                        <option value="Handpicked Lal Pari Cloves" />
                        <option value="Ceylon Pure Cinnamon Quills" />
                        <option value="Organic Moringa Leaf Powder" />
                      </datalist>
                    </div>
                  </div>

                  {/* Row 4: VOLUME */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-1.5">
                      <label className="block text-xs sm:text-[13px] font-bold tracking-wider uppercase text-[#0070E0]">
                        VOLUME
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 15 Metric Tons"
                        value={formData.volume}
                        onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-slate-200 focus:border-[#0070E0] focus:ring-0 rounded-none py-2 px-0 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base outline-none transition-colors duration-200 font-medium"
                      />
                    </div>
                    <div className="hidden sm:block">
                      {/* Preserves 2-column balance matching mockup */}
                    </div>
                  </div>

                  {/* Row 5: ADDITIONAL NOTES */}
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-[13px] font-bold tracking-wider uppercase text-[#0070E0]">
                      ADDITIONAL NOTES
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Mention any specific packaging or certification needs..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-slate-200 focus:border-[#0070E0] focus:ring-0 rounded-none py-2 px-0 text-slate-900 placeholder:text-slate-400 text-sm sm:text-base outline-none transition-colors duration-200 resize-y min-h-[80px] font-medium"
                    />
                  </div>

                  {/* Footer & Submit */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-[11px] text-slate-500 max-w-xs leading-normal">
                      * Required fields. Inquiries handled under strict commercial trade confidentiality.
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0070E0] hover:bg-[#005bb5] text-white text-xs sm:text-sm font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-blue-500/25 cursor-pointer inline-flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0 disabled:opacity-70 active:scale-95 group"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                          <span className="whitespace-nowrap">Submitting RFQ...</span>
                        </>
                      ) : (
                        <>
                          <span className="whitespace-nowrap">Submit Trade RFQ</span>
                          <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Direct Proforma Calculator Link */}
                  <div className="pt-2 text-xs text-stone-500">
                    Need instant proforma container stowage and weight calculation?{' '}
                    <button
                      type="button"
                      onClick={onOpenQuote}
                      className="text-[#0070E0] font-semibold hover:underline inline-block cursor-pointer"
                    >
                      Open 3D Shipping Calculator →
                    </button>
                  </div>

                </form>
              )}            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
