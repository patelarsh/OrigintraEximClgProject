import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowUpRight, Lock, Loader2, Sparkles, Layers } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { QuoteFormData } from '../types';
import { AdminStorage } from '../services/adminStorage';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledProduct?: string;
  prefilledForm?: 'Whole Form' | 'Powder Form (Ground)' | 'Crushed / Flakes' | 'Custom / Both';
  prefilledData?: {
    productName?: string;
    quantity?: string;
    packaging?: string;
    port?: string;
  } | null;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  prefilledProduct,
  prefilledForm,
  prefilledData
}) => {
  const [formData, setFormData] = useState<QuoteFormData>({
    fullName: '',
    companyName: '',
    businessEmail: '',
    country: '',
    phoneWhatsApp: '',
    product: prefilledProduct || prefilledData?.productName || 'Red Chilli (Whole & Powder)',
    productForm: prefilledForm || 'Powder Form (Ground)',
    quantityRequired: prefilledData?.quantity || '1 x 20ft FCL',
    packagingRequirement: prefilledData?.packaging || 'Standard Export Woven / Kraft Bags',
    destinationPort: prefilledData?.port || '',
    message: '',
    honeypot: '' // anti-spam
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync prefill when modal opens
  useEffect(() => {
    if (prefilledProduct) {
      setFormData(prev => ({ 
        ...prev, 
        product: prefilledProduct,
        productForm: prefilledForm || prev.productForm 
      }));
    } else if (prefilledData?.productName) {
      setFormData(prev => ({
        ...prev,
        product: prefilledData.productName || 'Red Chilli (Whole & Powder)',
        quantityRequired: prefilledData.quantity || prev.quantityRequired,
        packagingRequirement: prefilledData.packaging || prev.packagingRequirement,
        destinationPort: prefilledData.port || prev.destinationPort
      }));
    }
  }, [prefilledProduct, prefilledForm, prefilledData, isOpen]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setErrorMsg(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    if (!formData.fullName.trim()) return 'Please enter your full name.';
    if (!formData.companyName.trim()) return 'Please enter your company name.';
    if (!formData.businessEmail.trim() || !formData.businessEmail.includes('@') || !formData.businessEmail.includes('.')) {
      return 'Please enter a valid business email address.';
    }
    if (!formData.country.trim()) return 'Please enter your country.';
    if (!formData.phoneWhatsApp.trim()) return 'Please enter your phone or WhatsApp number.';
    if (!formData.quantityRequired.trim()) return 'Please indicate the quantity or container volume required.';
    if (!formData.destinationPort.trim()) return 'Please enter your target destination discharge port.';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot spam check: if filled, quietly reject
    if (formData.honeypot && formData.honeypot.trim() !== '') {
      setIsSuccess(true);
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    // Save inquiry to AdminStorage for admin lead tracking
    try {
      AdminStorage.addInquiry({
        fullName: formData.fullName,
        companyName: formData.companyName,
        businessEmail: formData.businessEmail,
        country: formData.country,
        phoneWhatsApp: formData.phoneWhatsApp,
        product: formData.product,
        productForm: formData.productForm,
        quantityRequired: formData.quantityRequired,
        packagingRequirement: formData.packagingRequirement,
        destinationPort: formData.destinationPort,
        message: formData.message,
        source: 'quote_modal'
      });
    } catch (err) {
      console.warn('Could not save inquiry locally:', err);
    }

    // Simulate reliable async submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rfq-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-[#0A1C3E] px-4 sm:px-8 py-4 sm:py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[11px] font-sans text-[#38BDF8] uppercase tracking-wider font-semibold">
              Commercial Sourcing Desk
            </span>
            <h2 id="rfq-title" className="text-lg sm:text-2xl font-display font-semibold mt-0.5 text-white">
              Request a Commercial Quote
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-8 max-h-[82vh] overflow-y-auto">
          {isSuccess ? (
            <div className="py-8 text-center space-y-5 animate-in fade-in">
              <div className="w-16 h-16 bg-blue-50 text-[#0070E0] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-[#0F172A]">
                  Enquiry Successfully Received
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  Thank you for contacting Origintra Exim. Our team will review your enquiry and get back to you shortly.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 max-w-md mx-auto text-left space-y-1.5">
                <p><strong className="text-slate-800">Product:</strong> {formData.product}</p>
                <p><strong className="text-slate-800">Form Required:</strong> {formData.productForm}</p>
                <p><strong className="text-slate-800">Company:</strong> {formData.companyName}</p>
                <p><strong className="text-slate-800">Destination Port:</strong> {formData.destinationPort}</p>
                <p className="pt-1 text-[#0070E0] font-medium">
                  A trade specialist has been assigned to prepare your indicative proforma.
                </p>
              </div>

              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-full bg-[#0A1C3E] text-white text-xs font-semibold hover:bg-[#0070E0] transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Anti-spam honeypot (hidden from real users) */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="user_verification_token"
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

              {/* Product and Form Selection (Prominently highlighting Powder vs Whole) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Commodity *
                  </label>
                  <select
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0]"
                  >
                    {PRODUCTS.map((prod) => (
                      <option key={prod.id} value={prod.name}>
                        {prod.name}
                      </option>
                    ))}
                    <option value="Multiple Commodities / Consolidation">
                      Multiple Commodities / Mixed Container
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Required Product Form *
                  </label>
                  <select
                    value={formData.productForm}
                    onChange={(e) => setFormData({ ...formData, productForm: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0] font-semibold text-[#0070E0]"
                  >
                    <option value="Powder Form (Ground)">Powder Form (Ground Spices / Fine Mesh)</option>
                    <option value="Whole Form">Whole Form (Seeds / Pods / Fingers)</option>
                    <option value="Crushed / Flakes">Crushed / Flakes (Coarse Cut)</option>
                    <option value="Custom / Both">Both / Combined Consignment</option>
                  </select>
                </div>
              </div>

              {/* 2-Column Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Vance"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Global Foods Ltd"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. procurement@company.com"
                    value={formData.businessEmail}
                    onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. United Arab Emirates, Germany, USA"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +971 50 123 4567"
                    value={formData.phoneWhatsApp}
                    onChange={(e) => setFormData({ ...formData, phoneWhatsApp: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantity Required *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 x 20ft FCL (14 MT) or 5 MT"
                    value={formData.quantityRequired}
                    onChange={(e) => setFormData({ ...formData, quantityRequired: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0]"
                  />
                </div>
              </div>

              {/* Order Specifics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Packaging Requirement
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 25kg Multi-Wall Paper Bags, PP Bags, Drums"
                    value={formData.packagingRequirement}
                    onChange={(e) => setFormData({ ...formData, packagingRequirement: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination Port *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jebel Ali, Rotterdam, Hamburg, Singapore, New York"
                    value={formData.destinationPort}
                    onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message / Mesh Size / Specific Specifications
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention required mesh size (e.g. 60 mesh, 80 mesh, 100 mesh), color value (ASTA), heat level (SHU), curcumin percentage, or custom packing..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0]"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center text-[11px] text-slate-400 space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Direct confidential commercial communication. No spam.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#0A1C3E] hover:bg-[#0070E0] text-white text-xs font-semibold transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Enquiry</span>
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
