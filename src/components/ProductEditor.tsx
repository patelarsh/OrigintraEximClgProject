import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Loader2,
  Package,
  Image as ImageIcon,
  Upload,
  X,
  FileText,
  Layers,
  ShieldCheck,
  Ship,
  HelpCircle,
  Plus,
  Trash2,
  Sparkles
} from 'lucide-react';
import { Product } from '../types';
import { slugify } from '../utils/slugify';

interface ProductEditorProps {
  product: Product;
  onChange: (updated: Product) => void;
  onSave: (e?: React.FormEvent) => void;
  onCancel: () => void;
  onOpenGallery: () => void;
  isSaving: boolean;
}

export const ProductEditor: React.FC<ProductEditorProps> = ({
  product,
  onChange,
  onSave,
  onCancel,
  onOpenGallery,
  isSaving
}) => {
  const [newFormTag, setNewFormTag] = useState('');
  const [newPackagingTag, setNewPackagingTag] = useState('');
  const [newAppTag, setNewAppTag] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Form tag helpers
  const handleAddForm = (tagToAdd?: string) => {
    const val = (tagToAdd || newFormTag).trim();
    if (!val) return;
    const current = product.availableForms || [];
    if (!current.includes(val)) {
      onChange({ ...product, availableForms: [...current, val] });
    }
    setNewFormTag('');
  };

  const handleRemoveForm = (index: number) => {
    const current = [...(product.availableForms || [])];
    current.splice(index, 1);
    onChange({ ...product, availableForms: current });
  };

  // Packaging tag helpers
  const handleAddPackaging = (pkgToAdd?: string) => {
    const val = (pkgToAdd || newPackagingTag).trim();
    if (!val) return;
    const current = product.packagingOptions || [];
    if (!current.includes(val)) {
      onChange({ ...product, packagingOptions: [...current, val] });
    }
    setNewPackagingTag('');
  };

  const handleRemovePackaging = (index: number) => {
    const current = [...(product.packagingOptions || [])];
    current.splice(index, 1);
    onChange({ ...product, packagingOptions: current });
  };

  // Applications tag helpers
  const handleAddApp = (appToAdd?: string) => {
    const val = (appToAdd || newAppTag).trim();
    if (!val) return;
    const current = product.applications || [];
    if (!current.includes(val)) {
      onChange({ ...product, applications: [...current, val] });
    }
    setNewAppTag('');
  };

  const handleRemoveApp = (index: number) => {
    const current = [...(product.applications || [])];
    current.splice(index, 1);
    onChange({ ...product, applications: current });
  };

  // Gallery helpers
  const handleAddGalleryImage = (urlToAdd?: string) => {
    const val = (urlToAdd || newGalleryUrl).trim();
    if (!val) return;
    const current = product.gallery || [];
    if (!current.includes(val)) {
      onChange({ ...product, gallery: [...current, val] });
    }
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    const current = [...(product.gallery || [])];
    current.splice(index, 1);
    onChange({ ...product, gallery: current });
  };

  // Specifications helpers
  const handleAddSpecRow = (label = 'Specification Parameter', value = 'Export Grade Standard') => {
    const specs = [...(product.specifications || [])];
    specs.push({ label, value });
    onChange({ ...product, specifications: specs });
  };

  const handleRemoveSpecRow = (index: number) => {
    const specs = [...(product.specifications || [])];
    specs.splice(index, 1);
    onChange({ ...product, specifications: specs });
  };

  const handleUpdateSpecRow = (index: number, field: 'label' | 'value', val: string) => {
    const specs = [...(product.specifications || [])];
    if (specs[index]) {
      specs[index] = { ...specs[index], [field]: val };
      onChange({ ...product, specifications: specs });
    }
  };

  // FAQ helpers
  const handleAddFaq = (question = '', answer = '') => {
    const faqs = [...(product.faqs || [])];
    faqs.push({ question, answer });
    onChange({ ...product, faqs });
  };

  const handleRemoveFaq = (index: number) => {
    const faqs = [...(product.faqs || [])];
    faqs.splice(index, 1);
    onChange({ ...product, faqs });
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', val: string) => {
    const faqs = [...(product.faqs || [])];
    if (faqs[index]) {
      faqs[index] = { ...faqs[index], [field]: val };
      onChange({ ...product, faqs });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Card with Breadcrumb & Quick Actions */}
      <div className="bg-[#0A1C3E] rounded-2xl px-6 py-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-[#38BDF8] hover:text-white flex items-center space-x-1.5 font-semibold mb-2 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products Catalog</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-[#38BDF8] tracking-wider block">
              Product CMS • Commodity Dedicated Editor
            </span>
            {product.isFlagship && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[9px] font-extrabold uppercase">
                Flagship
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-0.5">
            {product.name ? `Edit Spice: ${product.name}` : 'Add New Export Spice Commodity'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Configure comprehensive export specifications, commercial packaging standards, container loadability, and laboratory quality parameters.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-semibold transition cursor-pointer"
          >
            Discard & Exit
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="px-5 py-2.5 rounded-xl bg-[#0070E0] hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center space-x-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving Spice...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Save & Publish Spice</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Form Body */}
      <form noValidate onSubmit={onSave} className="space-y-6">

        {/* CARD 1: Core Commodity Identity */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0070E0] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-display text-slate-900 text-base">
                1. Core Commodity Identity & Sourcing Belts
              </h3>
              <p className="text-xs text-slate-500">
                Primary commercial names, botanical taxonomy, and origin Mandi belts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Product Name *</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  const shouldUpdateSlug = !product.slug || product.slug.startsWith('product-') || product.slug === slugify(product.name);
                  onChange({
                    ...product,
                    name: newName,
                    slug: shouldUpdateSlug ? slugify(newName) : product.slug
                  });
                }}
                placeholder="e.g. Green Cardamom Bold"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#0070E0]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 block">URL Slug (Permalink) *</label>
                <button
                  type="button"
                  onClick={() => onChange({ ...product, slug: slugify(product.name) })}
                  className="text-[11px] text-[#0070E0] hover:underline cursor-pointer"
                >
                  Auto-Generate
                </button>
              </div>
              <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-[#0070E0]">
                <span className="bg-slate-100 px-3 py-2 text-slate-500 font-mono text-xs border-r border-slate-200 flex items-center select-none">
                  /products/
                </span>
                <input
                  type="text"
                  value={product.slug}
                  onChange={(e) => onChange({ ...product, slug: slugify(e.target.value) })}
                  placeholder="green-cardamom-bold"
                  className="flex-1 px-3 py-2 font-mono text-xs text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Botanical / Scientific Name</label>
              <input
                type="text"
                value={product.botanicalName || product.scientific || ''}
                onChange={(e) => onChange({ ...product, botanicalName: e.target.value, scientific: e.target.value })}
                placeholder="e.g. Elettaria cardamomum"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs italic font-medium focus:ring-2 focus:ring-[#0070E0]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category *</label>
              <select
                value={product.category}
                onChange={(e) => {
                  const cat = e.target.value;
                  let catKey = 'whole-spices';
                  if (cat.toLowerCase().includes('ground') || cat.toLowerCase().includes('powder')) catKey = 'ground-spices';
                  else if (cat.toLowerCase().includes('seed')) catKey = 'seeds';
                  else if (cat.toLowerCase().includes('blend') || cat.toLowerCase().includes('seasoning')) catKey = 'blends';
                  onChange({ ...product, category: cat, categoryKey: catKey });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-[#0070E0]"
              >
                <option value="Whole Spices">Whole Spices</option>
                <option value="Ground Spices">Ground Spices</option>
                <option value="Seeds">Sortex Seeds</option>
                <option value="Blends & Seasonings">Blends & Seasonings</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Harvest Origin Belts</label>
              <input
                type="text"
                value={product.origin || ''}
                onChange={(e) => onChange({ ...product, origin: e.target.value })}
                placeholder="e.g. Idukki, Kerala, India / Guntur, Andhra Pradesh, India"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Plant Part Used</label>
              <input
                type="text"
                value={product.partUsed || ''}
                onChange={(e) => onChange({ ...product, partUsed: e.target.value })}
                placeholder="e.g. Whole Dried Fruit Pods / Sun-dried Rhizomes / Sortex Seeds"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Tagline (Catchy Trade Headline)</label>
              <input
                type="text"
                value={product.tagline || ''}
                onChange={(e) => onChange({ ...product, tagline: e.target.value })}
                placeholder="e.g. Grade A bold green cardamom with high volatile oil and natural aroma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
              />
            </div>

            <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-3 border-t border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!product.isFlagship}
                  onChange={(e) => onChange({ ...product, isFlagship: e.target.checked })}
                  className="rounded border-slate-300 text-[#0070E0] focus:ring-[#0070E0] w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Feature as Flagship Commodity</span>
                  <span className="text-[11px] text-slate-500">Showcases prominently on Homepage showcase & catalog banners</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!product.isCustomSourcing}
                  onChange={(e) => onChange({ ...product, isCustomSourcing: e.target.checked })}
                  className="rounded border-slate-300 text-[#0070E0] focus:ring-[#0070E0] w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Custom Sourcing Available</span>
                  <span className="text-[11px] text-slate-500">Enables bespoke grade procurement inquiries</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* CARD 2: Media, Photography & Gallery */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0070E0] flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-display text-slate-900 text-base">
                2. Commodity Photography & Media Assets
              </h3>
              <p className="text-xs text-slate-500">
                Main hero image and secondary gallery images for buyer verification.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700 block">Primary Product Image *</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenGallery}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0070E0] hover:bg-blue-100 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Select from Gallery
                  </button>
                  <label className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    Upload New Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (reader.result) {
                              onChange({ ...product, image: reader.result as string });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {product.image && (
                  <div
                    onClick={onOpenGallery}
                    className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-[#0070E0] transition bg-slate-100 shadow-2xs"
                    title="Click to select different photo from gallery"
                  >
                    <img
                      src={product.image?.startsWith('/assets/products/') ? `${product.image.split('?')[0]}?v=20261019_drive` : product.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/assets/products/cumin-seeds.jpg?v=20261019_drive';
                      }}
                    />
                  </div>
                )}
                <input
                  type="text"
                  value={product.image}
                  onChange={(e) => onChange({ ...product, image: e.target.value })}
                  placeholder="/assets/products/your-spice.jpg"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#0070E0]"
                />
              </div>
            </div>

            {/* Secondary Gallery Images */}
            <div className="pt-3 border-t border-slate-100">
              <label className="font-semibold text-slate-700 block mb-1.5">
                Secondary Product Gallery Images
              </label>
              <div className="flex flex-wrap gap-3 mb-2">
                {(product.gallery || []).map((imgUrl, gIdx) => (
                  <div key={gIdx} className="relative group w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                    <img src={imgUrl} alt="Gallery" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(gIdx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddGalleryImage();
                    }
                  }}
                  placeholder="Add secondary gallery photo URL (e.g. /assets/gallery/warehouse-spice.jpg)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#0070E0]"
                />
                <button
                  type="button"
                  onClick={() => handleAddGalleryImage()}
                  disabled={!newGalleryUrl.trim()}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  + Add Image
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Commercial Descriptions */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0070E0] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-display text-slate-900 text-base">
                3. Commercial Trade Descriptions
              </h3>
              <p className="text-xs text-slate-500">
                Summary snippet for catalog cards and comprehensive in-depth trade dossier.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 block">Short Description * (Catalog & Quote Snippet)</label>
                <span className="text-slate-400 text-[11px]">2-3 sentences</span>
              </div>
              <textarea
                rows={2}
                value={product.shortDescription || ''}
                onChange={(e) => onChange({ ...product, shortDescription: e.target.value })}
                placeholder="Summary of product grade, aroma, origin belts, and primary export applications..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0070E0] text-xs font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 block">Full In-Depth Trade Description</label>
                <span className="text-slate-400 text-[11px]">Detailed sourcing narrative</span>
              </div>
              <textarea
                rows={5}
                value={product.fullDescription || ''}
                onChange={(e) => onChange({ ...product, fullDescription: e.target.value })}
                placeholder="Comprehensive export commodity narrative: harvesting season, regional soil & climatic advantages, sun-drying & processing procedures, volatile oil profile, and industrial manufacturing suitability..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0070E0] text-xs font-medium leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* CARD 4: Export Forms, Packaging Options & Applications */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0070E0] flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-display text-slate-900 text-base">
                4. Available Forms, Packaging Options & Industrial Applications
              </h3>
              <p className="text-xs text-slate-500">
                Export delivery forms, bulk seaworthy packaging standards, and target buyer industries.
              </p>
            </div>
          </div>

          <div className="space-y-6 text-xs">
            {/* Available Forms */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">
                Available Export Forms (Pill tags shown on detail page)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(product.availableForms || []).map((form, fIdx) => (
                  <span key={fIdx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold text-xs">
                    {form}
                    <button
                      type="button"
                      onClick={() => handleRemoveForm(fIdx)}
                      className="text-blue-400 hover:text-blue-800 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newFormTag}
                  onChange={(e) => setNewFormTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddForm();
                    }
                  }}
                  placeholder="Type new form (e.g. Whole Pods, Ground Powder 80 Mesh, Split, Flakes)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                />
                <button
                  type="button"
                  onClick={() => handleAddForm()}
                  disabled={!newFormTag.trim()}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  + Add Form
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Presets:</span>
                {['Whole Form', 'Powder Form (Ground)', 'Sortex Cleaned Seeds', 'Crushed Flakes', 'Stemless Pods'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddForm(preset)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Packaging Options */}
            <div className="pt-4 border-t border-slate-100">
              <label className="font-semibold text-slate-700 block mb-1.5">
                Export Packaging Standards
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(product.packagingOptions || []).map((pkg, pIdx) => (
                  <span key={pIdx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold text-xs">
                    {pkg}
                    <button
                      type="button"
                      onClick={() => handleRemovePackaging(pIdx)}
                      className="text-emerald-500 hover:text-emerald-800 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPackagingTag}
                  onChange={(e) => setNewPackagingTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPackaging();
                    }
                  }}
                  placeholder="Type new packaging standard (e.g. 25kg PP Bags with Liner, 50kg Jute Sacks)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                />
                <button
                  type="button"
                  onClick={() => handleAddPackaging()}
                  disabled={!newPackagingTag.trim()}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  + Add Packaging
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Presets:</span>
                {['25kg PP Bags with Liner', '50kg Seaworthy Jute Sacks', 'Kraft Paper Sacks', 'Vacuum Sealed Consumer Pouches', 'Customized Private Label'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddPackaging(preset)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Applications */}
            <div className="pt-4 border-t border-slate-100">
              <label className="font-semibold text-slate-700 block mb-1.5">
                Commercial Applications & End Uses
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(product.applications || []).map((app, aIdx) => (
                  <span key={aIdx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200/60 font-semibold text-xs">
                    {app}
                    <button
                      type="button"
                      onClick={() => handleRemoveApp(aIdx)}
                      className="text-purple-500 hover:text-purple-800 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newAppTag}
                  onChange={(e) => setNewAppTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddApp();
                    }
                  }}
                  placeholder="Type application (e.g. Food Processing, Curry Blends, Oleoresin Extraction)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                />
                <button
                  type="button"
                  onClick={() => handleAddApp()}
                  disabled={!newAppTag.trim()}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  + Add Application
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Presets:</span>
                {['Food Processing & Manufacturing', 'Spice Blends & Seasoning', 'Oleoresin & Essential Oil Extraction', 'HORECA Bulk Supply', 'Retail Supermarket Private Label'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddApp(preset)}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 5: Technical Laboratory Specifications Table */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0070E0] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold font-display text-slate-900 text-base">
                  5. Technical Laboratory Quality Specifications
                </h3>
                <p className="text-xs text-slate-500">
                  Custom parameters, purity thresholds, and chemical limits shown in the specification table.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAddSpecRow('New Parameter', 'Export Standard Value')}
              className="px-3.5 py-1.5 rounded-xl bg-[#0070E0] hover:bg-blue-600 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Row</span>
            </button>
          </div>

          {/* Quick presets bar */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Quick Add:</span>
            {[
              { label: 'Moisture Content', value: '10.0% Max' },
              { label: 'Sortex Purity', value: '99.5% Min Cleaned' },
              { label: 'Volatile Oil', value: '3.5% Min' },
              { label: 'Total Ash', value: '1.5% Max' },
              { label: 'Aflatoxin (B1+B2+G1+G2)', value: 'Compliant with EU/US MRL' },
              { label: 'Salmonella & E.coli', value: 'Absent in 25g (Sterilized)' }
            ].map((presetItem) => (
              <button
                key={presetItem.label}
                type="button"
                onClick={() => handleAddSpecRow(presetItem.label, presetItem.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition cursor-pointer"
              >
                + {presetItem.label}
              </button>
            ))}
          </div>

          {/* Specifications Rows */}
          <div className="space-y-2.5">
            {(product.specifications || []).map((spec, sIdx) => (
              <div key={sIdx} className="flex items-center gap-2 sm:gap-3 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/80">
                <input
                  type="text"
                  value={spec.label}
                  onChange={(e) => handleUpdateSpecRow(sIdx, 'label', e.target.value)}
                  placeholder="Specification Parameter (e.g. Moisture Content)"
                  className="flex-1 px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#0070E0]"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => handleUpdateSpecRow(sIdx, 'value', e.target.value)}
                  placeholder="Value / Threshold (e.g. 10.0% Max)"
                  className="flex-1 px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-mono font-medium text-slate-800 focus:ring-2 focus:ring-[#0070E0]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpecRow(sIdx)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer shrink-0"
                  title="Delete specification row"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {(!product.specifications || product.specifications.length === 0) && (
              <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                No technical specifications yet. Click "+ Add Row" or any Quick Add button above to insert parameters.
              </div>
            )}
          </div>
        </div>

        {/* CARD 6: Shipping Logistics, Container Loadability & Incoterms */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0070E0] flex items-center justify-center shrink-0">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-display text-slate-900 text-base">
                6. Global Export Shipping & Trade Logistics
              </h3>
              <p className="text-xs text-slate-500">
                Container loadability, minimum orders, Incoterms, and dispatch scheduling.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Minimum Order Quantity (MOQ)</label>
              <input
                type="text"
                value={product.exportInfo?.minimumOrderQuantity || ''}
                onChange={(e) => onChange({
                  ...product,
                  exportInfo: { ...(product.exportInfo || {} as any), minimumOrderQuantity: e.target.value }
                })}
                placeholder="e.g. 1 x 20ft FCL (Full Container Load) / 5 MT"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Container Capacity & Loadability</label>
              <input
                type="text"
                value={product.exportInfo?.containerCapacity || ''}
                onChange={(e) => onChange({
                  ...product,
                  exportInfo: { ...(product.exportInfo || {} as any), containerCapacity: e.target.value }
                })}
                placeholder="e.g. 13-14 MT per 20ft FCL; 26 MT per 40ft HC"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Packaging Standard</label>
              <input
                type="text"
                value={product.exportInfo?.packagingStandard || ''}
                onChange={(e) => onChange({
                  ...product,
                  exportInfo: { ...(product.exportInfo || {} as any), packagingStandard: e.target.value }
                })}
                placeholder="e.g. Multi-layer food-grade hermetic seaworthy packaging"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lead Time & Dispatch Timeline</label>
              <input
                type="text"
                value={product.exportInfo?.leadTime || ''}
                onChange={(e) => onChange({
                  ...product,
                  exportInfo: { ...(product.exportInfo || {} as any), leadTime: e.target.value }
                })}
                placeholder="e.g. 7-12 working days from LC confirmation"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Trade Incoterms Offered</label>
              <input
                type="text"
                value={product.exportInfo?.incoterms || ''}
                onChange={(e) => onChange({
                  ...product,
                  exportInfo: { ...(product.exportInfo || {} as any), incoterms: e.target.value }
                })}
                placeholder="e.g. FOB Mundra / Nhava Sheva, CIF, CFR any global port"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Sample Policy</label>
              <input
                type="text"
                value={product.exportInfo?.sampleAvailability || ''}
                onChange={(e) => onChange({
                  ...product,
                  exportInfo: { ...(product.exportInfo || {} as any), sampleAvailability: e.target.value }
                })}
                placeholder="e.g. Complimentary 200g-500g samples via DHL/FedEx"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
              />
            </div>
          </div>
        </div>

        {/* CARD 7: Buyer Frequently Asked Questions (FAQs) */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0070E0] flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold font-display text-slate-900 text-base">
                  7. Commodity FAQs for International Buyers
                </h3>
                <p className="text-xs text-slate-500">
                  Clear answers to frequently asked commercial trade questions on this spice.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAddFaq('', '')}
              className="px-3.5 py-1.5 rounded-xl bg-[#0070E0] hover:bg-blue-600 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ</span>
            </button>
          </div>

          <div className="space-y-4">
            {(product.faqs || []).map((faq, fIdx) => (
              <div key={fIdx} className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-700 text-xs">Question #{fIdx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(fIdx)}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleUpdateFaq(fIdx, 'question', e.target.value)}
                  placeholder="e.g. Can you provide custom moisture levels or sterilized material?"
                  className="w-full px-3.5 py-2 bg-white rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#0070E0]"
                />
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => handleUpdateFaq(fIdx, 'answer', e.target.value)}
                  placeholder="Write the commercial answer for prospective international importers..."
                  className="w-full px-3.5 py-2 bg-white rounded-lg border border-slate-300 text-xs text-slate-700 focus:ring-2 focus:ring-[#0070E0]"
                />
              </div>
            ))}

            {(!product.faqs || product.faqs.length === 0) && (
              <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                No FAQs added yet. Click "+ Add FAQ" above to add helpful buyer Q&A.
              </div>
            )}
          </div>
        </div>

        {/* STICKY BOTTOM ACTION BAR */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
          >
            Discard & Exit
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-xl bg-[#0070E0] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-blue-500/25 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving Spice Commodity...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Save & Publish Spice Commodity</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
