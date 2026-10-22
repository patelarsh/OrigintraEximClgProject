import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Eye, Save, Link2, X, UploadCloud, 
  Bold, Italic, Underline, List, ListOrdered, Image as ImageIcon,
  Quote, Code, Maximize2, Minimize2, Calendar, Clock, User as UserIcon,
  Check, Plus, Sparkles, AlertCircle, FileText
} from 'lucide-react';
import { BlogPost, User } from '../../types';
import { slugify } from '../../utils/slugify';

interface BlogEditorViewProps {
  initialPost: BlogPost | null;
  mode: 'create' | 'edit';
  currentUser: User | null;
  users: User[];
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
  onOpenMediaGallery: () => void;
  onUploadImageFile?: (file: File) => Promise<string | null>;
  selectedGalleryImage?: string | null;
  onClearSelectedGalleryImage?: () => void;
}

const DEFAULT_CATEGORIES = [
  'Export Guide',
  'Spice Market',
  'International Trade',
  'Quality & Certification',
  'Logistics & Shipping',
  'Industry Insights'
];

export const BlogEditorView: React.FC<BlogEditorViewProps> = ({
  initialPost,
  mode,
  currentUser,
  users,
  onSave,
  onCancel,
  onOpenMediaGallery,
  onUploadImageFile,
  selectedGalleryImage,
  onClearSelectedGalleryImage
}) => {
  // === FORM STATES ===
  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [isSlugLocked, setIsSlugLocked] = useState(Boolean(initialPost?.slug && mode === 'edit'));
  const [shortDescription, setShortDescription] = useState(initialPost?.excerpt || '');
  const [image, setImage] = useState(initialPost?.image || '/assets/og/origintra-preview.jpg');
  const [status, setStatus] = useState<'Published' | 'Draft' | 'Scheduled'>(
    initialPost?.status || 'Published'
  );
  
  // Date & Time
  const initialDateStr = initialPost?.rawDate || (initialPost?.date ? new Date(initialPost.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [publishDate, setPublishDate] = useState(initialDateStr);
  const [publishTime, setPublishTime] = useState(initialPost?.publishTime || '10:30 AM');
  
  // Author
  const defaultAuthorName = currentUser ? `${currentUser.name} (${currentUser.role === 'admin' ? 'Admin' : currentUser.role})` : 'Patel Arsh (Admin)';
  const [author, setAuthor] = useState(initialPost?.author || defaultAuthorName);
  
  // Categories (Multi-select)
  const [categories, setCategories] = useState<string[]>(() => {
    if (initialPost?.categories && initialPost.categories.length > 0) {
      return initialPost.categories;
    }
    if (initialPost?.category) {
      return [initialPost.category];
    }
    return ['Export Guide', 'International Trade'];
  });
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  // SEO Settings
  const [metaTitle, setMetaTitle] = useState(initialPost?.metaTitle || initialPost?.seoTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialPost?.metaDescription || '');
  const [tags, setTags] = useState<string[]>(() => {
    if (initialPost?.tags && initialPost.tags.length > 0) {
      return initialPost.tags;
    }
    return ['Export Guide', 'Indian Spices', 'Supply Chain', 'International Trade'];
  });
  const [newTagInput, setNewTagInput] = useState('');

  // Rich Content Editor
  const [contentRaw, setContentRaw] = useState(() => {
    if (initialPost?.contentHtml) return initialPost.contentHtml;
    if (initialPost?.content && initialPost.content.length > 0) {
      return initialPost.content.map(sec => {
        const h = sec.heading ? `${sec.heading}\n` : '';
        const p = sec.paragraphs.join('\n\n');
        return `${h}${p}`;
      }).join('\n\n');
    }
    return `1. Understanding Harvest Calendars & Price Cycles\nIndian spices follow seasonal harvest cycles that directly impact quality, availability, and pricing. Understanding these cycles helps international buyers plan purchases at the right time and secure consistent supply.\n\n2. Quality Specifications & International Standards\nGlobal buyers require strict adherence to quality standards, including moisture levels, foreign matter limits, and microbiological safety. Certifications like FSSAI, APEDA, ISO, and HACCP ensure compliance with international regulations.\n\n3. Supplier Selection & Verification\nConduct on-site audits, verify lab test certificates (COA), and review direct farmgate procurement chains before finalizing annual volume supply contracts.`;
  });

  const [headingStyle, setHeadingStyle] = useState<'p' | 'h1' | 'h2' | 'h3'>('p');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync selected gallery image if passed from parent
  useEffect(() => {
    if (selectedGalleryImage) {
      setImage(selectedGalleryImage);
      if (onClearSelectedGalleryImage) {
        onClearSelectedGalleryImage();
      }
    }
  }, [selectedGalleryImage, onClearSelectedGalleryImage]);

  // Auto-generate slug and meta title if title changes and user hasn't locked them
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isSlugLocked) {
      setSlug(slugify(newTitle));
    }
    if (!metaTitle || metaTitle.includes('Origintra')) {
      setMetaTitle(`${newTitle.trim()} | Origintra Exim`.slice(0, 60));
    }
  };

  // Sync meta description with short description if meta is empty
  const handleShortDescChange = (newDesc: string) => {
    setShortDescription(newDesc);
    if (!metaDescription) {
      setMetaDescription(newDesc.slice(0, 160));
    }
  };

  // Format insertion in content editor
  const applyToolbarFormat = (prefix: string, suffix: string = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = contentRaw.substring(start, end) || 'text';
    const replacement = `${prefix}${selected}${suffix}`;
    const updated = contentRaw.substring(0, start) + replacement + contentRaw.substring(end);
    setContentRaw(updated);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const handleHeadingSelect = (type: 'p' | 'h1' | 'h2' | 'h3') => {
    setHeadingStyle(type);
    if (type === 'h1') applyToolbarFormat('# ', '');
    else if (type === 'h2') applyToolbarFormat('## ', '');
    else if (type === 'h3') applyToolbarFormat('### ', '');
  };

  // Toggle Category
  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      if (categories.length > 1) {
        setCategories(categories.filter(c => c !== cat));
      }
    } else {
      setCategories([...categories, cat]);
    }
  };

  // Add custom category
  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setNewCategoryInput('');
      setShowAddCategory(false);
    }
  };

  // Tags management
  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // File upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onUploadImageFile) {
      const uploadedUrl = await onUploadImageFile(file);
      if (uploadedUrl) {
        setImage(uploadedUrl);
        return;
      }
    }
    // Fallback: local reader
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter an article title.');
      return;
    }

    const finalSlug = slug.trim() || slugify(title);

    // Parse raw text into structured sections for backward-compatible frontend rendering
    const rawBlocks = contentRaw.split(/\n\n+/).filter(Boolean);
    const structuredContent: { heading?: string; paragraphs: string[] }[] = [];
    let currentHeading = '';
    let currentParagraphs: string[] = [];

    for (const block of rawBlocks) {
      const lines = block.split('\n').filter(Boolean);
      const firstLine = lines[0].trim();
      const isHeading = /^(\d+\.|\#{1,3})\s+/.test(firstLine) || (firstLine.length < 80 && lines.length === 1 && !firstLine.endsWith('.'));

      if (isHeading) {
        if (currentHeading || currentParagraphs.length > 0) {
          structuredContent.push({
            heading: currentHeading || undefined,
            paragraphs: currentParagraphs.length > 0 ? currentParagraphs : ['Detailed overview follows below.']
          });
          currentParagraphs = [];
        }
        currentHeading = firstLine.replace(/^(\d+\.|\#{1,3})\s+/, '');
        if (lines.length > 1) {
          currentParagraphs.push(lines.slice(1).join(' '));
        }
      } else {
        currentParagraphs.push(block.replace(/\n/g, ' '));
      }
    }

    if (currentHeading || currentParagraphs.length > 0) {
      structuredContent.push({
        heading: currentHeading || undefined,
        paragraphs: currentParagraphs.length > 0 ? currentParagraphs : ['Detailed analysis provided.']
      });
    }

    if (structuredContent.length === 0) {
      structuredContent.push({
        heading: 'Overview',
        paragraphs: [shortDescription || 'Commercial export trade insight report.']
      });
    }

    // Format display date
    let displayDate = initialPost?.date || 'Today';
    try {
      if (publishDate) {
        const [y, m, d] = publishDate.split('-').map(Number);
        const dt = new Date(y, m - 1, d);
        displayDate = dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch {}

    const updatedPost: BlogPost = {
      id: initialPost?.id || `post-${Date.now()}`,
      slug: finalSlug,
      title: title.trim(),
      category: (categories[0] as any) || 'Export Guide',
      categories: categories,
      status: status,
      date: displayDate,
      rawDate: publishDate,
      publishDate: publishDate,
      publishTime: publishTime,
      readTime: initialPost?.readTime || `${Math.max(3, Math.ceil(contentRaw.split(/\s+/).length / 180))} min read`,
      author: author.replace(/\s*\(.*?\)/, '').trim(),
      authorRole: 'Senior Commercial Research Desk',
      excerpt: shortDescription.trim(),
      image: image.trim(),
      seoTitle: metaTitle.trim() || `${title} | Origintra Exim`,
      metaTitle: metaTitle.trim() || `${title} | Origintra Exim`,
      metaDescription: metaDescription.trim() || shortDescription.trim(),
      tags: tags,
      tableOfContents: structuredContent.map(s => s.heading).filter(Boolean) as string[],
      content: structuredContent,
      contentHtml: contentRaw,
      relatedSlugs: initialPost?.relatedSlugs || []
    };

    onSave(updatedPost);
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-50 p-6 overflow-y-auto' : ''}`}>
      
      {/* ======================================================== */}
      {/* 1. TOP BREADCRUMB & ACTION BAR (EXACT AS SCREENSHOT) */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
            title="Go back to articles list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <button
              type="button"
              onClick={onCancel}
              className="hover:text-[#0070E0] transition"
            >
              Blogs
            </button>
            <span>/</span>
            <span className="text-slate-800 font-semibold">
              {mode === 'edit' ? 'Edit Blog' : 'Create Blog'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowLivePreviewModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A1C3E] hover:bg-[#00214a] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Save className="w-4 h-4 text-sky-400" />
            <span>{mode === 'edit' ? 'Update Blog' : 'Publish Blog'}</span>
          </button>
        </div>
      </div>

      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0F172A] tracking-tight">
          {mode === 'edit' ? 'Edit Blog Post' : 'Create Blog Post'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {mode === 'edit' 
            ? 'Update the blog details, content, images and settings.' 
            : 'Fill in the blog details, rich content, images, categories and SEO settings.'}
        </p>
      </div>

      {/* ======================================================== */}
      {/* 2. TWO-COLUMN WORKSPACE (8 COLS LEFT, 4 COLS RIGHT) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT MAIN COLUMN: 8 Columns */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 space-y-6 shadow-2xs">
            
            {/* Title & Slug Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. How International Buyers Source Indian Spices"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0070E0] focus:border-transparent transition"
                />
              </div>

              {/* Slug */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  {!isSlugLocked && (
                    <button
                      type="button"
                      onClick={() => setIsSlugLocked(true)}
                      className="text-[10px] text-slate-400 hover:text-slate-600"
                    >
                      Lock Custom Slug
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setIsSlugLocked(true);
                      setSlug(slugify(e.target.value));
                    }}
                    placeholder="how-international-buyers-source-indian-spices"
                    className="w-full pr-10 pl-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0070E0] focus:border-transparent transition"
                  />
                  <div className="absolute right-3 text-slate-400">
                    <Link2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 font-mono truncate">
                  https://www.origintra.com/blog/{slug || 'post-slug'}
                </p>
              </div>
            </div>

            {/* Short Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-mono ${shortDescription.length > 200 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                  {shortDescription.length}/200
                </span>
              </div>
              <textarea
                rows={3}
                required
                maxLength={240}
                value={shortDescription}
                onChange={(e) => handleShortDescChange(e.target.value)}
                placeholder="A comprehensive operational look at best practices for overseas procurement managers sourcing bulk spices and botanicals from India."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0070E0] focus:border-transparent transition leading-relaxed resize-y"
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Featured Image <span className="text-red-500">*</span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                {/* Image Preview Banner */}
                {image ? (
                  <div className="md:col-span-8 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group min-h-[170px] max-h-[220px]">
                    <img 
                      src={image} 
                      alt="Featured Preview" 
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/assets/og/origintra-preview.jpg';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/80 hover:bg-red-600 text-white shadow-md transition cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/60 text-white text-[10px] backdrop-blur-xs font-mono">
                      Current: {image.split('/').pop()?.slice(0, 30)}
                    </div>
                  </div>
                ) : (
                  <div className="md:col-span-8 rounded-xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center bg-slate-50/50 min-h-[170px]">
                    <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs text-slate-500">No featured image selected</p>
                  </div>
                )}

                {/* Upload & Pick Dropzone */}
                <div 
                  className="md:col-span-4 border-2 border-dashed border-slate-200 hover:border-[#0070E0] hover:bg-blue-50/20 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="w-10 h-10 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-[#0070E0] mb-2 transition">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#0070E0] group-hover:underline">
                    {image ? 'Change Image' : 'Upload Image'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    JPG, PNG, WebP
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1 bg-slate-100 px-2 py-0.5 rounded font-medium">
                    Recommended: 1200 × 630
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMediaGallery();
                    }}
                    className="mt-3 text-[11px] font-semibold text-slate-600 hover:text-[#0070E0] underline"
                  >
                    Or Pick from Gallery
                  </button>
                </div>
              </div>
            </div>

            {/* Rich Content Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-800">
                  Content <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {contentRaw.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              {/* Editor Shell with Toolbar */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-[#0070E0] focus-within:border-transparent transition bg-white">
                
                {/* Toolbar */}
                <div className="bg-slate-50/90 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                  {/* Heading Select */}
                  <select
                    value={headingStyle}
                    onChange={(e) => handleHeadingSelect(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="p">Paragraph</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                  </select>

                  <div className="h-4 w-px bg-slate-200 mx-1" />

                  {/* Formatting Buttons */}
                  <button
                    type="button"
                    onClick={() => applyToolbarFormat('**', '**')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                    title="Bold (**text**)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyToolbarFormat('*', '*')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-700 italic transition cursor-pointer"
                    title="Italic (*text*)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyToolbarFormat('<u>', '</u>')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-700 underline transition cursor-pointer"
                    title="Underline"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-slate-200 mx-1" />

                  {/* Lists */}
                  <button
                    type="button"
                    onClick={() => applyToolbarFormat('\n- ', '')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyToolbarFormat('\n1. ', '')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-slate-200 mx-1" />

                  {/* Links & Media */}
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Enter link URL (e.g. https://...):');
                      if (url) applyToolbarFormat('[', `](${url})`);
                    }}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="Insert Link"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Enter image URL:');
                      if (url) applyToolbarFormat(`\n![Image description](${url})\n`);
                    }}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="Insert Image"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyToolbarFormat('\n> ', '')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="Quote"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyToolbarFormat('`', '`')}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="Inline Code"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>

                  {/* Fullscreen Toggle */}
                  <div className="ml-auto">
                    <button
                      type="button"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                      {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Textarea Workspace */}
                <textarea
                  ref={textareaRef}
                  rows={isFullscreen ? 28 : 14}
                  required
                  value={contentRaw}
                  onChange={(e) => setContentRaw(e.target.value)}
                  placeholder="Write your article headings and paragraphs here..."
                  className="w-full p-4 sm:p-5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none leading-relaxed font-sans resize-y"
                  style={{ minHeight: isFullscreen ? '75vh' : '360px' }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                <span>Tip: Type numbers like <code>1. Heading</code> to create distinct sections automatically.</span>
                <span>Supports Markdown bold (**text**) & bullet lists (- item)</span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDEBAR COLUMN: 4 Columns (EXACT AS SCREENSHOT) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Status & Visibility */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-[#0F172A] tracking-tight border-b border-slate-100 pb-2.5">
              Status & Visibility
            </h3>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0070E0] cursor-pointer"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
                <div className="absolute left-3 top-3">
                  <span className={`w-2.5 h-2.5 rounded-full block ${
                    status === 'Published' ? 'bg-emerald-500 ring-2 ring-emerald-100' :
                    status === 'Draft' ? 'bg-amber-500 ring-2 ring-amber-100' :
                    'bg-blue-500 ring-2 ring-blue-100'
                  }`} />
                </div>
              </div>
            </div>

            {/* Publish Date & Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Publish Date
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                </div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={publishTime}
                    onChange={(e) => setPublishTime(e.target.value)}
                    placeholder="10:30 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
                  />
                </div>
              </div>
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Author
              </label>
              <div className="relative">
                <select
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0070E0] cursor-pointer"
                >
                  <option value={defaultAuthorName}>{defaultAuthorName}</option>
                  {users.map(u => (
                    <option key={u.id} value={`${u.name} (${u.role})`}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                  <option value="Origintra Commercial Research Desk">Origintra Commercial Research Desk</option>
                </select>
                <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Card 2: Categories (Checkboxes) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
                Categories
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="text-[11px] font-semibold text-[#0070E0] hover:underline"
              >
                + Add
              </button>
            </div>

            {/* Custom Category Input */}
            {showAddCategory && (
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="New category..."
                  className="flex-1 px-2 py-1 text-xs bg-white rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0070E0]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-2.5 py-1 rounded bg-[#0070E0] text-white text-xs font-semibold"
                >
                  Save
                </button>
              </div>
            )}

            {/* Checkbox List */}
            <div className="space-y-2.5 pt-1">
              {Array.from(new Set([...DEFAULT_CATEGORIES, ...categories])).map((cat) => {
                const isChecked = categories.includes(cat);
                return (
                  <label
                    key={cat}
                    className="flex items-center space-x-2.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none group"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(cat)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0070E0] focus:ring-[#0070E0] cursor-pointer"
                    />
                    <span className={`group-hover:text-slate-900 transition ${isChecked ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                      {cat}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Card 3: SEO Settings */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-[#0F172A] tracking-tight border-b border-slate-100 pb-2.5">
              SEO Settings
            </h3>

            {/* Meta Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Meta Title
                </label>
                <span className={`text-[10px] font-mono ${metaTitle.length > 60 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                  {metaTitle.length}/60
                </span>
              </div>
              <input
                type="text"
                value={metaTitle}
                maxLength={75}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="How International Buyers Source Indian Spices | Origintra"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Meta Description
                </label>
                <span className={`text-[10px] font-mono ${metaDescription.length > 160 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                  {metaDescription.length}/160
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={180}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Complete guide for international buyers on sourcing Indian spices, including quality standards, supplier selection, and procurement process."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0070E0] resize-y leading-relaxed"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tags
              </label>

              {/* Tag Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="p-0.5 rounded-full hover:bg-slate-300 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Tag Input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. LIVE PREVIEW MODAL */}
      {/* ======================================================== */}
      {showLivePreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#0A1C3E] px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-sky-400" />
                <span className="font-bold text-sm">Article Live Frontend Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLivePreviewModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 md:p-10 overflow-y-auto space-y-6">
              <div className="flex items-center gap-2">
                {categories.map(c => (
                  <span key={c} className="bg-sky-50 text-[#0070E0] text-xs font-bold px-3 py-1 rounded-full">
                    {c}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl md:text-4xl font-display font-extrabold text-[#00214a] leading-tight">
                {title || 'Article Title Preview'}
              </h1>

              <div className="flex items-center space-x-3 text-xs text-slate-500 pb-4 border-b border-slate-100">
                <span>By {author}</span>
                <span>•</span>
                <span>{publishDate}</span>
                <span>•</span>
                <span>{publishTime}</span>
              </div>

              {image && (
                <div className="rounded-2xl overflow-hidden aspect-[21/9] bg-slate-100 shadow-md">
                  <img src={image} alt="Featured" className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-base text-slate-700 italic border-l-4 border-[#0070E0] pl-4 py-1 leading-relaxed">
                {shortDescription || 'Article short summary excerpt...'}
              </p>

              <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed space-y-4 pt-4 whitespace-pre-line">
                {contentRaw}
              </div>

              {tags.length > 0 && (
                <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Tags:</span>
                  {tags.map(t => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
