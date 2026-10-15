import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  ArrowUpRight, 
  Share2, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  User, 
  BookOpen,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { BLOG_POSTS as FALLBACK_BLOG_POSTS } from '../data/blog';
import { BlogPost } from '../types';
import { AdminStorage } from '../services/adminStorage';

interface BlogPageProps {
  initialSlug?: string | null;
  onNavigate: (page: string) => void;
  onOpenQuote: () => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({
  initialSlug,
  onNavigate,
  onOpenQuote
}) => {
  const [posts, setPosts] = useState<BlogPost[]>(() => AdminStorage.getBlogPosts());
  const [activeSlug, setActiveSlug] = useState<string | null>(initialSlug || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setPosts(AdminStorage.getBlogPosts());
    };
    window.addEventListener('origintra_blog_updated', handleUpdate);
    return () => window.removeEventListener('origintra_blog_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (initialSlug) {
      setActiveSlug(initialSlug);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [initialSlug]);

  const categories = [
    'All',
    'Global Trade',
    'Indian Spices',
    'Export Insights',
    'Market Trends',
    'Sourcing',
    'Logistics',
    'Business Updates'
  ];

  const activePost = activeSlug 
    ? (posts.find((p) => p.slug === activeSlug) || 
       posts.find((p) => p.id === activeSlug) ||
       posts.find((p) => p.id === `post-${activeSlug.replace(/^new-article-/, '')}`))
    : null;

  const filteredPosts = posts.filter((post) => {
    const matchesCat = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleShareCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // If viewing an individual article:
  if (activePost) {
    const relatedPosts = posts.filter((p) => (activePost.relatedSlugs || []).includes(p.slug));

    return (
      <article className="bg-white text-[#0F172A] min-h-[70vh] py-12 sm:py-16">
        <div className="container-x mx-auto max-w-[1000px]">
          
          {/* Breadcrumbs & Back link */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
            <a
              href="/blog"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  setActiveSlug(null);
                  onNavigate('/blog');
                }
              }}
              className="text-xs font-semibold text-slate-600 hover:text-[#0070E0] flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Articles</span>
            </a>

            <span className="text-xs font-semibold text-[#0070E0] bg-blue-50 px-3 py-1 rounded-full">
              {activePost.category}
            </span>
          </div>

          {/* Article Header */}
          <div className="space-y-4 mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-[#0F172A] tracking-tight leading-tight">
              {activePost.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              {activePost.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <strong className="text-slate-700">{activePost.author}</strong> ({activePost.authorRole})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {activePost.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {activePost.readTime}
              </span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="rounded-2xl overflow-hidden shadow-md aspect-16/9 bg-slate-100 mb-10 border border-slate-200">
            <img
              src={activePost.image}
              alt={activePost.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Table of Contents */}
          {activePost.tableOfContents && activePost.tableOfContents.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 mb-10 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <BookOpen className="w-4 h-4 text-[#0070E0]" />
                <span>Table of Contents</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                {activePost.tableOfContents.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-[#0070E0] font-semibold">{idx + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Article Main Body */}
          <div className="space-y-8 text-base leading-relaxed text-slate-700 font-normal">
            {activePost.content.map((section, sIdx) => (
              <section key={sIdx} className="space-y-3">
                {section.heading && (
                  <h2 className="text-2xl font-display font-semibold text-[#0F172A] pt-4">
                    {section.heading}
                  </h2>
                )}
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="leading-relaxed">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>

          {/* Social Sharing & Actions */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Share2 className="w-4 h-4 text-slate-400" />
              <span>Share this market report:</span>
              <button
                onClick={handleShareCopy}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center space-x-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
              </button>
            </div>

            <button
              onClick={onOpenQuote}
              className="btn-pill btn-pill-dark bg-[#0A1C3E] hover:bg-[#0070E0] text-white px-5 py-2.5 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Discuss Requirements</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-slate-200 space-y-6">
              <h3 className="text-xl font-display font-semibold text-[#0F172A]">
                Related Export Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((rel) => (
                  <a
                    key={rel.id}
                    href={`/blog/${rel.slug}`}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        setActiveSlug(rel.slug);
                        onNavigate(`/blog/${rel.slug}`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="p-6 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-xs transition cursor-pointer space-y-3 block text-inherit no-underline"
                  >
                    <span className="text-[11px] font-semibold text-[#0070E0] uppercase tracking-wider">
                      {rel.category}
                    </span>
                    <h4 className="text-base font-display font-semibold text-[#0F172A]">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {rel.excerpt}
                    </p>
                    <div className="text-xs font-semibold text-[#0070E0] flex items-center space-x-1 pt-1">
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </article>
    );
  }

  // Blog Directory View
  return (
    <div className="bg-white text-[#0F172A] min-h-[70vh]">
      
      {/* Blog Page Hero */}
      <section className="relative overflow-hidden bg-[#0A1C3E] text-white py-12 sm:py-20 md:py-28">
        <div className="container-x mx-auto max-w-[1440px] relative">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
              Trade Intelligence & Knowledge
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-white">
              Origintra Trade Insights<span className="text-[#0070E0]">.</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed pt-1 sm:pt-2">
              Practical market analysis, crop harvest perspectives, and regulatory export documentation guides for global spice importers.
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="border-b border-slate-200 bg-slate-50/80 sticky top-[108px] sm:top-[114px] lg:top-20 z-20 backdrop-blur-md py-3 sm:py-4">
        <div className="container-x mx-auto max-w-[1440px] flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#0A1C3E] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search insights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-full bg-white border border-slate-200 focus:outline-none focus:border-[#0070E0] focus:ring-1 focus:ring-[#0070E0]"
            />
          </div>

        </div>
      </section>

      {/* Blog Cards Grid */}
      <section className="py-16 sm:py-20">
        <div className="container-x mx-auto max-w-[1440px]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {filteredPosts.map((post) => (
              <a
                key={post.id}
                href={`/blog/${post.slug}`}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                    e.preventDefault();
                    setActiveSlug(post.slug);
                    onNavigate(`/blog/${post.slug}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group text-inherit no-underline"
              >
                <div>
                  <div className="aspect-16/10 overflow-hidden bg-slate-100">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-5 sm:p-8 space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-[#0070E0] uppercase tracking-wider">{post.category}</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-display font-semibold text-[#0F172A] group-hover:text-[#0070E0] transition-colors leading-snug">
                      {post.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-8 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="text-slate-500 font-normal flex items-center gap-1.5 truncate max-w-[65%] sm:max-w-[70%]">
                    <span className="text-slate-400 shrink-0">{post.date}</span>
                    <span className="text-slate-300 shrink-0">•</span>
                    <span className="text-slate-700 font-medium truncate">By {post.author}</span>
                  </span>
                  <span className="text-[#0070E0] flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
};
