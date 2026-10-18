import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Upload,
  Search,
  Check,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Users,
  Package,
  Building,
  Flag,
  Award,
  Layers,
  CheckCheck,
  RefreshCw
} from 'lucide-react';
import { AdminStorage } from '../services/adminStorage';
import { GalleryImage } from '../data/gallery';
import { compressImage } from '../utils/imageCompressor';

interface MediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, imageTitle?: string) => void;
  currentImage?: string;
  defaultCategory?: 'all' | 'team' | 'products' | 'facility' | 'banners' | 'certificates' | 'uploads';
  title?: string;
}

export const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentImage,
  defaultCategory = 'all',
  title = 'Select Photo from Gallery'
}) => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(() => AdminStorage.getGalleryImages());
  const [activeCategory, setActiveCategory] = useState<string>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync when gallery updates or modal opens
  useEffect(() => {
    if (isOpen) {
      setGalleryImages(AdminStorage.getGalleryImages());
      AdminStorage.syncSettingsFromServer().catch(() => {});
      setActiveCategory(defaultCategory);
      setSearchQuery('');
      setCustomUrlInput(currentImage || '');
      setUploadError(null);
    }
  }, [isOpen, defaultCategory, currentImage]);

  useEffect(() => {
    const handleGalleryUpdated = () => {
      setGalleryImages(AdminStorage.getGalleryImages());
    };
    window.addEventListener('origintra_gallery_updated', handleGalleryUpdated);
    return () => {
      window.removeEventListener('origintra_gallery_updated', handleGalleryUpdated);
    };
  }, []);

  // Filter images
  const filteredImages = useMemo(() => {
    return galleryImages.filter((img) => {
      const matchesCategory =
        activeCategory === 'all' ||
        (activeCategory === 'uploads' ? img.isUploaded : img.category === activeCategory);

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        img.title.toLowerCase().includes(q) ||
        (img.description && img.description.toLowerCase().includes(q)) ||
        (img.tag && img.tag.toLowerCase().includes(q)) ||
        img.url.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [galleryImages, activeCategory, searchQuery]);

  // Category counts
  const counts = useMemo(() => {
    return {
      all: galleryImages.length,
      team: galleryImages.filter((i) => i.category === 'team').length,
      products: galleryImages.filter((i) => i.category === 'products').length,
      facility: galleryImages.filter((i) => i.category === 'facility').length,
      banners: galleryImages.filter((i) => i.category === 'banners').length,
      certificates: galleryImages.filter((i) => i.category === 'certificates').length,
      uploads: galleryImages.filter((i) => i.isUploaded).length
    };
  }, [galleryImages]);

  // Handle uploading image from local files / gallery
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // 1. Instant client-side downscaling and compression (takes < 40ms)
      const compressedDataUrl = await compressImage(file, 1400, 0.84);

      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      // 2. Direct upload to server disk & database registration
      const newImg = await AdminStorage.addCustomGalleryImage({
        url: compressedDataUrl,
        title: cleanName,
        category: defaultCategory === 'team' ? 'team' : 'uploads',
        description: `Uploaded on ${new Date().toLocaleDateString()}`,
        tag: 'Custom Upload'
      });

      // 3. Automatically select the freshly uploaded photo
      onSelectImage(newImg.url, newImg.title);
      onClose();
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setUploadError(err.message || 'Failed to upload photo. Please try another image.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = (e: React.MouseEvent, id: string, name?: string) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${name || 'this photo'}" from your media gallery?`)) {
      AdminStorage.deleteGalleryImage(id);
    }
  };

  const handleCopyUrl = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#0A1C3E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg flex items-center gap-2">
                {title}
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/20">
                  {galleryImages.length} Photos Available
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Click any photo to select it instantly, or upload a photo directly from your device.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close Gallery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Filters & Upload Button */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gallery by name, role, spice, or tag..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0] bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Direct Upload Button from Device */}
            <div className="flex items-center gap-2 shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="gallery-file-input"
              />
              <label
                htmlFor="gallery-file-input"
                className={`px-4 py-2 rounded-xl bg-[#0070E0] text-white hover:bg-[#005bb5] font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer ${
                  isUploading ? 'opacity-70 pointer-events-none' : ''
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Device</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {uploadError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
              <span>{uploadError}</span>
              <button onClick={() => setUploadError(null)} className="text-rose-500 hover:text-rose-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Photos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('team')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'team'
                  ? 'bg-sky-600 text-white shadow-2xs font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Leadership Team</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === 'team' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {counts.team}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('products')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'products'
                  ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products & Spices</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === 'products' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {counts.products}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('facility')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'facility'
                  ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Facility & Sourcing</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === 'facility' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {counts.facility}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('banners')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'banners'
                  ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Hero Banners</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === 'banners' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {counts.banners}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('certificates')}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeCategory === 'certificates'
                  ? 'bg-purple-600 text-white shadow-2xs font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Certificates</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === 'certificates' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {counts.certificates}
              </span>
            </button>

            {counts.uploads > 0 && (
              <button
                onClick={() => setActiveCategory('uploads')}
                className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === 'uploads'
                    ? 'bg-teal-600 text-white shadow-2xs font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>My Uploads</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeCategory === 'uploads' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {counts.uploads}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Gallery Visual Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100/60">
          {filteredImages.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <ImageIcon className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-semibold text-slate-600">No photos match your filter</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching with different terms or click "Upload from Device" above to add your own photo.
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="text-xs text-[#0070E0] font-semibold hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredImages.map((img) => {
                const isSelected = currentImage === img.url;

                return (
                  <div
                    key={img.id}
                    onClick={() => {
                      onSelectImage(img.url, img.title);
                      onClose();
                    }}
                    className={`group relative bg-white rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col ${
                      isSelected
                        ? 'border-[#0070E0] ring-4 ring-blue-100 shadow-md scale-[1.02]'
                        : 'border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-108"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/team/director.jpg';
                        }}
                      />

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#0070E0] text-white rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Active</span>
                        </div>
                      )}

                      {/* Category Tag */}
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white rounded-md text-[9px] font-semibold capitalize">
                        {img.tag || img.category}
                      </div>

                      {/* Hover Action Overlay */}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center text-white">
                        <span className="px-3 py-1.5 rounded-xl bg-[#0070E0] hover:bg-[#005bb5] font-semibold text-xs shadow-md transition transform group-hover:scale-105 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          Select Photo
                        </span>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={(e) => handleCopyUrl(e, img.url)}
                            className="p-1 rounded-md bg-white/20 hover:bg-white/40 text-white text-[10px] transition flex items-center gap-1"
                            title="Copy image URL"
                          >
                            {copiedUrl === img.url ? <CheckCheck className="w-3 h-3 text-emerald-300" /> : <Layers className="w-3 h-3" />}
                            <span>{copiedUrl === img.url ? 'Copied' : 'Copy'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteImage(e, img.id, img.title)}
                            className="p-1 rounded-md bg-rose-600/80 hover:bg-rose-700 text-white text-[10px] transition"
                            title="Delete photo from gallery"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="p-2.5 bg-white flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 truncate" title={img.title}>
                          {img.title}
                        </h4>
                        {img.description && (
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5" title={img.description}>
                            {img.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-mono truncate">
                        <span className="truncate">{img.url.replace('/assets/', '')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: Manual Custom URL paste fallback */}
        <div className="p-3 sm:px-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <span className="text-slate-500 font-medium whitespace-nowrap text-[11px]">Or custom URL:</span>
            <input
              type="text"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="https://... or /assets/..."
              className="flex-1 max-w-md px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#0070E0]"
            />
            <button
              type="button"
              onClick={() => {
                if (customUrlInput.trim()) {
                  onSelectImage(customUrlInput.trim(), 'Custom Image');
                  onClose();
                }
              }}
              disabled={!customUrlInput.trim()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-900 disabled:opacity-40 transition cursor-pointer"
            >
              Apply
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
