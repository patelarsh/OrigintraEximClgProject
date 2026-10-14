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
  Check
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
    title: '',
    company: '',
    country: '',
    email: '',
    phone: '',
    commodity: '',
    volume: '',
    destinationPort: '',
    inquiryNature: 'FCL Commercial Container',
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

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please provide your name, business email, and requirements.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      AdminStorage.addInquiry({
        fullName: formData.title ? `${formData.name.trim()} (${formData.title.trim()})` : formData.name.trim(),
        companyName: formData.company.trim() || 'Direct Importer',
        businessEmail: formData.email.trim(),
        country: formData.country.trim() || 'International',
        phoneWhatsApp: formData.phone.trim() || 'Not Provided',
        product: formData.commodity && formData.commodity !== 'Select commodity of interest...' ? formData.commodity : 'Bulk Indian Spices',
        quantityRequired: formData.volume.trim() || 'FCL Requirement',
        destinationPort: formData.destinationPort.trim() || 'To Be Nominated',
        message: `[Nature: ${formData.inquiryNature}]\n[Destination: ${formData.destinationPort || 'Not Specified'}]\n\n${formData.message.trim()}`,
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

              {/* Maritime Ports & Sourcing Hubs */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
                
                <div className="flex items-center space-x-2 text-slate-900">
                  <Anchor className="w-4 h-4 text-[#0070E0]" />
                  <h3 className="text-sm font-display font-bold">
                    Export Ports & Mandi Procurement
                  </h3>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  
                  <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-800 block">Mundra Port</span>
                      <span className="text-[11px] text-slate-500">Dry & Reefer FCL • Spices & Seeds</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      INMUN1
                    </span>
                  </div>

                  <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-800 block">JNPT Nhava Sheva</span>
                      <span className="text-[11px] text-slate-500">Ocean Liners • Direct European & US Freight</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      INNSA1
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 block">Cochin Port</span>
                      <span className="text-[11px] text-slate-500">Malabar Black Pepper & Alleppey Cardamom</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      INCOK1
                    </span>
                  </div>

                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                  Direct Mandi Sourcing: Unjha (Gujarat), Guntur (Andhra Pradesh), Ramganj Mandi (Rajasthan), and Idukki (Kerala).
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

            {/* Right Column: Commercial Enquiry Form */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-10 shadow-xs">
              
              <div className="border-b border-slate-100 pb-5 mb-6">
                <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
                  Commercial Trade Enquiry
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Please submit your specifications. Our export merchandiser will review and share CIF/FOB quotations, current mandi price indications, and technical parameters.
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
                          title: '',
                          company: '',
                          country: '',
                          email: '',
                          phone: '',
                          commodity: '',
                          volume: '',
                          destinationPort: '',
                          inquiryNature: 'FCL Commercial Container',
                          message: '',
                          honeypot: ''
                        });
                      }}
                      className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                    >
                      Submit Another Enquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  
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
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Nature of Enquiry */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nature of Enquiry
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        'FCL Container',
                        'LCL / Pallets',
                        'Product Samples',
                        'Contract Sourcing'
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setFormData({ ...formData, inquiryNature: item })}
                          className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition cursor-pointer ${
                            formData.inquiryNature === item
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Miller"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Designation / Job Title
                      </label>
                      <input
                        type="text"
                        placeholder="Procurement Director / Buyer"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0] transition"
                      />
                    </div>
                  </div>

                  {/* Company & Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        placeholder="Company or Trading House"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Country of Registration
                      </label>
                      <input
                        type="text"
                        placeholder="United Arab Emirates, UK, USA, Germany..."
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0] transition"
                      />
                    </div>
                  </div>

                  {/* Business Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Corporate Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="procurement@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone / WhatsApp (with Country Code)
                      </label>
                      <input
                        type="tel"
                        placeholder="+44 20 7946 0912 / +971 50..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0] transition"
                      />
                    </div>
                  </div>

                  {/* Commodity & Volume */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Commodity of Interest
                      </label>
                      <select
                        value={formData.commodity}
                        onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0] transition"
                      >
                        {COMMODITIES.map((c, i) => (
                          <option key={i} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Approximate Volume / Target Quantity
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1 x 20ft FCL (18 MT), 5 MT, Sample"
                        value={formData.volume}
                        onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0] transition"
                      />
                    </div>
                  </div>

                  {/* Destination Port */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Discharge Port
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jebel Ali (Dubai), Rotterdam (Netherlands), Felixstowe (UK), Newark (USA)"
                      value={formData.destinationPort}
                      onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0] transition"
                    />
                  </div>

                  {/* Message / Specifications */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Quality Specifications & Sourcing Details *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Specify required grade (e.g. ASTA color, moisture ceiling, curcumin %, aflatoxin limit), packaging preference (PP bags, vacuum foil, cartons), and delivery schedule..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0] transition"
                    />
                  </div>

                  {/* Footer & Submit */}
                  <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100">
                    <p className="text-[11px] text-slate-400">
                      Inquiries handled under strict commercial trade confidentiality.
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-7 py-3 rounded-lg bg-[#0A1C3E] hover:bg-[#0070E0] text-white text-xs font-semibold tracking-wide transition cursor-pointer flex items-center justify-center space-x-2 shadow-xs disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Transmitting Enquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Trade Enquiry</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Direct Proforma Calculator Link */}
                  <div className="pt-2 text-xs text-slate-500">
                    Require instant proforma container stowage and weight calculation?{' '}
                    <button
                      type="button"
                      onClick={onOpenQuote}
                      className="text-[#0070E0] font-semibold hover:underline inline-block cursor-pointer"
                    >
                      Open 3D Shipping Calculator →
                    </button>
                  </div>

                </form>
              )}

            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
