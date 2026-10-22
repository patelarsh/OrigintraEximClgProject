import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Eye,
  Save,
  Upload,
  X,
  Link2,
  Calendar,
  Clock,
  User as UserIcon,
  Plus,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image as ImageIcon,
  Quote,
  Code,
  Maximize2,
  Minimize2,
  ChevronDown,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  Share2
} from 'lucide-react';
import { BlogPost, User } from '../../types';
import { AdminStorage } from '../../services/adminStorage';
import { slugify } from '../../utils/slugify';

interface BlogEditorViewProps {
  initialPost: BlogPost | null;
  mode: 'create' | 'edit';
  currentUser: User | null;
  users: User[];
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
  onOpenMediaGallery: () => void;
  selectedGalleryImage?: string | null;
}

export const BlogEditorView: React.FC<BlogEditorViewProps> = ({
  initialPost,
  mode,
  currentUser,
  users,
  onSave,
  onCancel,
  onOpenMediaGallery,
  selectedGalleryImage
}) => {
  // === FORM STATES ===
  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [isSlugLocked, setIsSlugLocked] = useState(Boolean(initialPost?.slug && mode === 'edit'));
  const [shortDescription, setShortDescription] = useState(initialPost?.excerpt || '');
  const [image, setImage] = useState(
    initialPost?.image || '/assets/og/origintra-preview.jpg'
  );
  const [status, setStatus] = useState<'Published' | 'Draft' | 'Scheduled'>(
    initialPost?.status || 'Published'
  );

  // Date & Time
  const initialDateStr = initialPost?.publishDate || initialPost?.rawDate || (initialPost?.date
    ? new Date(initialPost.date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]);
  const [publishDate, setPublishDate] = useState(initialDateStr);
  const [publishTime, setPublishTime] = useState(initialPost?.publishTime || '10:30 AM');

  // Dynamic Author Resolution
  // If currentUser is admin Patel Arsh, role is Admin -> "Patel Arsh (Admin)"
  const defaultAuthorUser = currentUser || users.find(u => u.name === 'Patel Arsh') || users[0];
  const defaultAuthorRole = defaultAuthorUser?.role === 'admin'
    ? 'Admin'
    : (defaultAuthorUser?.department || (defaultAuthorUser?.role ? defaultAuthorUser.role.charAt(0).toUpperCase() + defaultAuthorUser.role.slice(1) : 'Admin'));
  const defaultAuthorName = defaultAuthorUser ? `${defaultAuthorUser.name} (${defaultAuthorRole})` : 'Patel Arsh (Admin)';

  const [authorSelection, setAuthorSelection] = useState<string>(() => {
    if (initialPost?.author) {
      const matchingUser = users.find(u => u.name.toLowerCase() === initialPost.author.toLowerCase());
      if (matchingUser) {
        const r = matchingUser.role === 'admin' ? 'Admin' : (matchingUser.department || matchingUser.role);
        return `${matchingUser.name} (${r})`;
      }
      return `${initialPost.author} (${initialPost.authorRole || 'Admin'})`;
    }
    return defaultAuthorName;
  });

  // Dynamic Categories (loaded from AdminStorage)
  const [availableCategories, setAvailableCategories] = useState<string[]>(() =>
    AdminStorage.getBlogCategories()
  );
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
  const [metaTitle, setMetaTitle] = useState(
    initialPost?.metaTitle || initialPost?.seoTitle || (initialPost?.title ? `${initialPost.title} | Origintra` : '')
  );
  const [metaDescription, setMetaDescription] = useState(
    initialPost?.metaDescription || initialPost?.excerpt || ''
  );
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
      return initialPost.content
        .map(sec => {
          const h = sec.heading ? `${sec.heading}\n\n` : '';
          const p = sec.paragraphs.join('\n\n');
          return `${h}${p}`;
        })
        .join('\n\n');
    }
    return `1. Understanding Harvest Calendars & Price Cycles
Indian spices follow seasonal harvest cycles that directly impact quality, availability, and pricing. Understanding these cycles helps international buyers plan purchases at the right time and secure consistent supply.

2. Quality Specifications & International Standards
Global buyers require strict adherence to quality standards, including moisture levels, foreign matter limits, and microbiological safety. Certifications like FSSAI, APEDA, ISO, and HACCP ensure compliance with international regulations.

3. Supplier Selection & Verification
Choosing verified exporters with direct mandi sourcing and processing infrastructure guarantees traceable, export-grade quality. Commercial documentation including Certificate of Origin, Phytosanitary Certificate, and lab COA protect buyer interests.`;
  });

  const [headingLevel, setHeadingLevel] = useState<'p' | 'h1' | 'h2' | 'h3'>('p');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync image if selected from Media Gallery modal
  useEffect(() => {
    if (selectedGalleryImage) {
      setImage(selectedGalleryImage);
    }
  }, [selectedGalleryImage]);

  // Listen for dynamic category updates from AdminStorage
  useEffect(() => {
    const handleCatsUpdated = () => {
      setAvailableCategories(AdminStorage.getBlogCategories());
    };
    window.addEventListener('origintra_blog_categories_updated', handleCatsUpdated);
    return () => {
      window.removeEventListener('origintra_blog_categories_updated', handleCatsUpdated);
    };
  }, []);

  // Auto-generate slug when title changes unless locked
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isSlugLocked) {
      setSlug(slugify(newTitle));
    }
    if (!metaTitle || metaTitle.endsWith('| Origintra') || metaTitle === `${title} | Origintra`) {
      setMetaTitle(newTitle ? `${newTitle} | Origintra` : '');
    }
  };

  // Auto-fill meta description from short description if meta is empty
  const handleShortDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, 200);
    setShortDescription(val);
    if (!metaDescription || metaDescription === shortDescription) {
      setMetaDescription(val);
    }
  };

  // Local image upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Textarea formatting helper
  const applyToolbarFormat = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = contentRaw.substring(start, end);

    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;
    const newContent = contentRaw.substring(0, start) + replacement + contentRaw.substring(end);
    setContentRaw(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 10);
  };

  const handleHeadingSelect = (type: 'p' | 'h1' | 'h2' | 'h3') => {
    setHeadingLevel(type);
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

  // Add custom dynamic category
  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (trimmed) {
      const updated = AdminStorage.saveBlogCategory(trimmed);
      setAvailableCategories(updated);
      if (!categories.includes(trimmed)) {
        setCategories([...categories, trimmed]);
      }
      setNewCategoryInput('');
      setShowAddCategory(false);
    }
  };

  // Add Tag
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

  // Parse raw text into structured sections & table of contents
  const parseStructuredContent = (raw: string) => {
    const blocks = raw.split(/\n{2,}/);
    const sections: { heading?: string; paragraphs: string[] }[] = [];
    const toc: string[] = [];

    let currentHeading = '';
    let currentParagraphs: string[] = [];

    blocks.forEach((block) => {
      const trimmed = block.trim();
      if (!trimmed) return;

      // Check for Heading syntax: "1. Heading", "## Heading", or single line ending without period
      const isHeadingMatch =
        trimmed.match(/^(\d+[\.\)]\s+[^.\n]+)$/m) ||
        trimmed.match(/^#{1,3}\s+([^.\n]+)$/m);

      if (isHeadingMatch) {
        if (currentHeading || currentParagraphs.length > 0) {
          sections.push({
            heading: currentHeading || undefined,
            paragraphs: currentParagraphs.length > 0 ? currentParagraphs : ['']
          });
        }
        const cleanHeading = trimmed.replace(/^#{1,3}\s+/, '').trim();
        currentHeading = cleanHeading;
        toc.push(cleanHeading.replace(/^\d+[\.\)]\s*/, ''));
        currentParagraphs = [];
      } else {
        currentParagraphs.push(trimmed);
      }
    });

    if (currentHeading || currentParagraphs.length > 0) {
      sections.push({
        heading: currentHeading || undefined,
        paragraphs: currentParagraphs.length > 0 ? currentParagraphs : ['']
      });
    }

    if (sections.length === 0) {
      sections.push({
        heading: title || 'Overview',
        paragraphs: [raw || shortDescription]
      });
    }

    return { sections, toc };
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter an article title.');
      return;
    }

    const finalSlug = slugify(slug || title);
    const { sections, toc } = parseStructuredContent(contentRaw);

    // Format display date
    let displayDate = initialPost?.date || 'Today';
    try {
      if (publishDate) {
        const d = new Date(publishDate);
        if (!isNaN(d.getTime())) {
          displayDate = d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        }
      }
    } catch {}

    // Resolve Author & Role dynamically
    let resolvedAuthor = 'Patel Arsh';
    let resolvedRole = 'Admin';
    let resolvedAuthorId = currentUser?.id;

    // Parse selection: "Name (Role)"
    const match = authorSelection.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      resolvedAuthor = match[1].trim();
      resolvedRole = match[2].trim();
    } else {
      resolvedAuthor = authorSelection.trim();
    }

    const matchedUser = users.find(u => u.name.toLowerCase() === resolvedAuthor.toLowerCase());
    if (matchedUser) {
      resolvedAuthorId = matchedUser.id;
      if (matchedUser.role === 'admin') resolvedRole = 'Admin';
      else if (matchedUser.department) resolvedRole = matchedUser.department;
    }

    const updatedPost: BlogPost = {
      id: initialPost?.id || `post-${Date.now()}`,
      slug: finalSlug,
      title: title.trim(),
      category: categories[0] || 'Export Guide',
      categories: categories,
      status: status,
      date: displayDate,
      rawDate: publishDate,
      publishDate: publishDate,
      publishTime: publishTime,
      readTime: initialPost?.readTime || `${Math.max(3, Math.ceil(contentRaw.split(/\s+/).length / 180))} min read`,
      author: resolvedAuthor,
      authorRole: resolvedRole,
      authorId: resolvedAuthorId,
      excerpt: shortDescription.trim(),
      image: image.trim(),
      seoTitle: metaTitle.trim() || `${title} | Origintra Exim`,
      metaTitle: metaTitle.trim(),
      metaDescription: metaDescription.trim() || shortDescription.trim(),
      tags: tags,
      tableOfContents: toc,
      content: sections,
      contentHtml: contentRaw,
      relatedSlugs: initialPost?.relatedSlugs || []
    };

    onSave(updatedPost);
  };

  // Preview data
  const { sections: previewSections, toc: previewToc } = parseStructuredContent(contentRaw);

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#F8FAFC] p-6 overflow-y-auto' : ''}`}>
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* ======================================================== */}
      {/* TOP BAR / BREADCRUMBS & ACTION BUTTONS */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <button
              type="button"
              onClick={onCancel}
              className="hover:text-[#0070E0] transition flex items-center space-x-1 font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Blogs</span>
            </button>
            <span>/</span>
            <span className="font-semibold text-slate-800">
              {mode === 'edit' ? 'Edit Blog' : 'Create Blog'}
            </span>
          </div>

          <h1 className="text-2xl font-display font-bold text-[#0F172A]">
            {mode === 'edit' ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === 'edit'
              ? 'Update the blog details, content, images and settings.'
              : 'Write a new export insight article with rich content, images, categories and SEO settings.'}
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center space-x-2 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-[#0A1C3E] hover:bg-[#0070E0] text-white text-xs font-semibold transition cursor-pointer flex items-center space-x-2 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{mode === 'edit' ? 'Update Blog' : 'Publish Blog'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN TWO-COLUMN WORKSPACE (8 cols left, 4 cols right) */}
      {/* ======================================================== */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ======================================= */}
        {/* LEFT COLUMN: MAIN CONTENT (8 COLS) */}
        {/* ======================================= */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Card: Title & Slug */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="e.g. How International Buyers Source Indian Spices"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0070E0] placeholder:text-slate-400"
                />
              </div>

              {/* Slug */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSlugLocked(false);
                      setSlug(slugify(title));
                    }}
                    className="text-[11px] text-[#0070E0] hover:underline font-medium"
                  >
                    Auto-sync
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setIsSlugLocked(true);
                      setSlug(slugify(e.target.value));
                    }}
                    placeholder="how-international-buyers-source-indian-spices"
                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0070E0] placeholder:text-slate-400"
                  />
                  <Link2 className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-mono truncate">
                  https://www.origintra.com/blog/{slug || 'slug-preview'}
                </p>
              </div>
            </div>

            {/* Short Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {shortDescription.length}/200
                </span>
              </div>
              <textarea
                required
                rows={3}
                value={shortDescription}
                onChange={handleShortDescriptionChange}
                placeholder="A comprehensive operational look at best practices for overseas procurement managers sourcing bulk spices and botanicals from India."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0070E0] placeholder:text-slate-400 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Card: Featured Image */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-2xs">
            <label className="block text-xs font-semibold text-slate-700">
              Featured Image <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Image Preview Box */}
              <div className="sm:col-span-7 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-16/9 group shadow-2xs">
                {image ? (
                  <>
                    <img
                      src={image}
                      alt={title || 'Featured Image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      type="button"
                      onClick={() => setImage('/assets/og/origintra-preview.jpg')}
                      className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center transition shadow-xs"
                      title="Reset image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-1">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                    <span className="text-[11px]">No image selected</span>
                  </div>
                )}
              </div>

              {/* Upload Dropzone / Media Gallery Trigger */}
              <div className="sm:col-span-5 flex flex-col justify-center space-y-2.5">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#0070E0] bg-slate-50/60 hover:bg-blue-50/30 p-4 flex flex-col items-center justify-center text-center cursor-pointer transition group"
                >
                  <div className="w-9 h-9 rounded-full bg-white group-hover:bg-blue-100 text-[#0070E0] flex items-center justify-center mb-2 shadow-2xs transition">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-[#0070E0] group-hover:underline">
                    Change Image
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    JPG, PNG, WebP
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Recommended: 1200 × 630
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onOpenMediaGallery}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-2xs"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Pick from Media Gallery</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card: Rich Content Editor Workspace */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
            
            {/* Editor Label */}
            <div className="px-5 pt-4 pb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Content <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Rich Toolbar */}
            <div className="px-4 py-2 border-y border-slate-200 bg-slate-50/80 flex flex-wrap items-center gap-1.5 text-slate-600">
              
              {/* Paragraph / Heading Dropdown */}
              <div className="relative inline-block text-left mr-1">
                <select
                  value={headingLevel}
                  onChange={(e) => handleHeadingSelect(e.target.value as any)}
                  className="px-2.5 py-1 text-xs font-semibold bg-white rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0070E0] cursor-pointer"
                >
                  <option value="p">Paragraph</option>
                  <option value="h1">Heading 1</option>
                  <option value="h2">Heading 2</option>
                  <option value="h3">Heading 3</option>
                </select>
              </div>

              <div className="h-4 w-px bg-slate-300 mx-0.5" />

              {/* Bold */}
              <button
                type="button"
                onClick={() => applyToolbarFormat('**', '**')}
                className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              {/* Italic */}
              <button
                type="button"
                onClick={() => applyToolbarFormat('*', '*')}
                className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              {/* Underline */}
              <button
                type="button"
                onClick={() => applyToolbarFormat('<u>', '</u>')}
                className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
                title="Underline (Ctrl+U)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-px bg-slate-300 mx-0.5" />

              {/* Bullet List */}
              <button
                type="button"
                onClick={() => applyToolbarFormat('\n- ', '')}
                className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>

              {/* Numbered List */}
              <button
                type="button"
                onClick={() => applyToolbarFormat('\n1. ', '')}
                className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
                title="Numbered List"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-px bg-slate-300 mx-0.5" />

              {/* Link */}
              <button
                type="button"
                onClick={() => {
                  const url = prompt('Enter link URL (e.g. https://...):');
                  if (url) applyToolbarFormat('[', `](${url})`);
                }}
                className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
                title="Insert Link"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>

              {/* Image Insert */}
              <button
                type="button"
                onClick={() => {
                  const url = prompt('Enter Image URL to embed:');
                  if (url) applyToolbarFormat(`\n![Image](${url})\n`);
                }}
                className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
                title="Insert Inline Image"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>

              {/* Quote */}
              <button
                type="button"
                onClick={() => applyToolbarFormat('\n> ', '')}
                className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
                title="Blockquote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>

              {/* Code */}
              <button
                type="button"
                onClick={() => applyToolbarFormat('`', '`')}
                className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition"
                title="Code"
              >
                <Code className="w-3.5 h-3.5" />
              </button>

              {/* Fullscreen */}
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded hover:bg-white hover:text-slate-900 transition ml-auto"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Textarea Area */}
            <div className="p-4 flex-1">
              <textarea
                ref={textareaRef}
                required
                rows={isFullscreen ? 28 : 16}
                value={contentRaw}
                onChange={(e) => setContentRaw(e.target.value)}
                placeholder="Write your article sections here...&#10;&#10;1. First Section Heading&#10;Write paragraph content...&#10;&#10;2. Second Section Heading&#10;Write paragraph content..."
                className="w-full h-full p-2 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans focus:outline-none placeholder:text-slate-400 resize-y"
              />
            </div>

            {/* Bottom Status / Word count */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{contentRaw.trim().split(/\s+/).filter(Boolean).length} words</span>
              <span>{Math.max(1, Math.ceil(contentRaw.trim().split(/\s+/).filter(Boolean).length / 180))} min read</span>
            </div>
          </div>
        </div>

        {/* ======================================= */}
        {/* RIGHT COLUMN: SIDEBAR METADATA (4 COLS) */}
        {/* ======================================= */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Card 1: Status & Visibility */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-[#0F172A] tracking-tight border-b border-slate-100 pb-2.5">
              Status & Visibility
            </h3>

            {/* Status Dropdown */}
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
                  <option value="Published">● Published</option>
                  <option value="Draft">● Draft</option>
                  <option value="Scheduled">● Scheduled</option>
                </select>
                <div
                  className={`w-2.5 h-2.5 rounded-full absolute left-3 top-1/2 -translate-y-1/2 ${
                    status === 'Published'
                      ? 'bg-emerald-500'
                      : status === 'Draft'
                      ? 'bg-amber-500'
                      : 'bg-[#0070E0]'
                  }`}
                />
              </div>
            </div>

            {/* Publish Date & Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Publish Date
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={publishTime}
                    onChange={(e) => setPublishTime(e.target.value)}
                    placeholder="10:30 AM"
                    className="w-full pl-8 pr-2 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
                  />
                  <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Author (Dynamic Dropdown populated from registered users) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Author
              </label>
              <div className="relative">
                <select
                  value={authorSelection}
                  onChange={(e) => setAuthorSelection(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0070E0] cursor-pointer"
                >
                  {/* Dynamic User Options */}
                  {users.map(u => {
                    const roleLabel = u.role === 'admin'
                      ? 'Admin'
                      : (u.department || (u.role.charAt(0).toUpperCase() + u.role.slice(1)));
                    const label = `${u.name} (${roleLabel})`;
                    return (
                      <option key={u.id} value={label}>
                        {label}
                      </option>
                    );
                  })}
                  <option value="Origintra Commercial Research Desk (Senior Desk)">
                    Origintra Commercial Research Desk (Senior Desk)
                  </option>
                </select>
                <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Card 2: Categories (Dynamic Multi-Select Checkboxes) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
                Categories
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="text-[11px] font-semibold text-[#0070E0] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {/* Custom Category Input Form */}
            {showAddCategory && (
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="New category..."
                  className="flex-1 px-2.5 py-1 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0070E0]"
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
                  className="px-2.5 py-1 rounded-lg bg-[#0070E0] hover:bg-blue-600 text-white text-xs font-semibold"
                >
                  Save
                </button>
              </div>
            )}

            {/* Checkbox List */}
            <div className="space-y-2.5 pt-1">
              {Array.from(new Set([...availableCategories, ...categories])).map((cat) => {
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Meta Title
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {metaTitle.length}/60
                </span>
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="How International Buyers Source Indian Spices | Origintra"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Meta Description
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {metaDescription.length}/160
                </span>
              </div>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Complete guide for international buyers on sourcing Indian spices, including quality standards, supplier selection, and procurement process."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0070E0] resize-none leading-relaxed"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tags
              </label>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50/60 min-h-[42px] items-center">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-2xs"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-red-500 p-0.5 rounded transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Add Tag Input */}
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Add tag..."
                  className="flex-1 min-w-[80px] bg-transparent text-xs text-slate-700 focus:outline-none px-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  onBlur={handleAddTag}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Press Enter or comma to add a tag
              </p>
            </div>
          </div>

        </div>

      </form>

      {/* ======================================================== */}
      {/* LIVE PREVIEW MODAL */}
      {/* ======================================================== */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#0A1C3E] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                  Live Article Preview
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Exact Replica of Frontend Article */}
            <div className="p-6 md:p-10 overflow-y-auto space-y-6">
              
              {/* Category Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {categories.map(c => (
                  <span key={c} className="bg-sky-50 text-[#0070E0] text-xs font-bold px-3 py-1 rounded-full">
                    {c}
                  </span>
                ))}
              </div>

              {/* Title & Excerpt */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#0F172A] leading-tight">
                  {title || 'Article Title Preview'}
                </h1>
                <p className="text-base text-slate-600 leading-relaxed">
                  {shortDescription || 'Short excerpt will appear here.'}
                </p>
              </div>

              {/* Author & Meta Row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 py-3 border-y border-slate-100">
                <span className="flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <strong className="text-slate-800">{authorSelection}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {publishDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {publishTime}
                </span>
              </div>

              {/* Hero Image */}
              <div className="rounded-2xl overflow-hidden aspect-16/9 bg-slate-100 border border-slate-200 shadow-md">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Table of Contents */}
              {previewToc.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <BookOpen className="w-4 h-4 text-[#0070E0]" />
                    <span>Table of Contents</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {previewToc.map((t, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <span className="text-[#0070E0] font-semibold">{idx + 1}.</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Content Body */}
              <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
                {previewSections.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    {sec.heading && (
                      <h2 className="text-xl font-bold font-display text-[#0F172A] pt-2">
                        {sec.heading}
                      </h2>
                    )}
                    {sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="leading-relaxed whitespace-pre-line">
                        {p}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-2">
                  {tags.map(t => (
                    <span key={t} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
