import React from 'react';
import { 
  ArrowUpRight, 
  ArrowRight, 
  ShieldCheck, 
  Globe, 
  FileText, 
  Package, 
  Truck, 
  Compass, 
  Layers, 
  Search, 
  Send, 
  ExternalLink, 
  Quote, 
  MapPin, 
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Star,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data/products';
import { BLOG_POSTS as DEFAULT_BLOG_POSTS } from '../data/blog';
import { useCompanyConfig } from '../hooks/useCompanyConfig';
import { Product, BlogPost, Testimonial } from '../types';
import { AdminStorage } from '../services/adminStorage';
import { HOME_FAQS } from '../utils/seo';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onOpenProductDetail: (product: Product) => void;
  onOpenQuoteWithProduct: (productName: string) => void;
  onOpenGeneralQuote: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenProductDetail,
  onOpenQuoteWithProduct,
  onOpenGeneralQuote
}) => {
  const COMPANY_CONFIG = useCompanyConfig();
  const heroSlides = [
    {
      id: 'spices-assortment',
      image: '/assets/hero/spices-hero-banner.jpg',
      mobileImage: '/assets/hero/hero-mobile-spices.jpg',
      alt: 'Origintra Exim premium whole spices and export agricultural assortment',
      badge: 'All Indian Spices',
      eyebrow: 'Direct Farmgate Sourcing • Multi-Commodity FCL',
      headline: 'Connecting India’s Finest Spices to the World',
      subline: 'Whole Seed Spices, Pure Ground Powders & Custom Sourcing',
      description: 'From prime whole pods and Sortex-cleaned seeds to ultra-fine pulverized powders, Origintra Exim connects international importers, food processors, and re-packers directly to certified Indian agricultural belts.',
      mobileHeadline: 'India’s Finest Export Spices',
      mobileDescription: 'Direct farmgate sourcing of export-grade whole spices and pure ground powders.',
      ctaText: 'Request a Quote',
      mobileCtaText: 'Get Quote',
      mobileSecondaryText: 'Explore'
    },
    {
      id: 'red-chilli',
      image: '/assets/hero/banner-red-chilli.jpg',
      mobileImage: '/assets/hero/hero-mobile-red-chilli.jpg',
      alt: 'Export grade Indian whole dried red chilli and ground powder',
      badge: 'Red Chilli Specialist',
      eyebrow: 'Guntur & Byadgi Belts • Stemless Pods & Powders',
      headline: 'Premium Indian Dried Red Chilli & Pure Powder',
      subline: 'S17 Teja, Sanam S4, Byadgi & 334 Varieties with Standardized SHU Heat',
      description: 'Machine-stemmed whole red chillies and vibratory-sifted powders milled under low temperature controls. Guaranteed negative for synthetic Sudan dyes and fully tested for Aflatoxin and pesticide MRL compliance.',
      mobileHeadline: 'Premium Dried Red Chilli & Powder',
      mobileDescription: 'Machine-stemmed chillies & pure powders with certified SHU heat and zero Sudan dye.',
      ctaText: 'Enquire for Red Chilli',
      mobileCtaText: 'Enquire Now',
      mobileSecondaryText: 'View Specs'
    },
    {
      id: 'turmeric',
      image: '/assets/hero/banner-turmeric.jpg',
      mobileImage: '/assets/hero/hero-mobile-turmeric.jpg',
      alt: 'High curcumin Indian turmeric fingers and ground turmeric powder',
      badge: 'Golden Turmeric',
      eyebrow: 'Salem, Nizamabad & Alleppey • Curcumin up to 5.5%+',
      headline: 'Curcumin-Rich Indian Turmeric Fingers & Powders',
      subline: 'Double-Polished Whole Fingers & Pure Golden Milled Powders',
      description: 'Harvested from premier turmeric cultivation hubs in Southern and Central India. High natural curcumin concentration, zero lead chromate, and packed in multi-wall moisture-barrier export sacks.',
      mobileHeadline: 'Curcumin-Rich Golden Turmeric',
      mobileDescription: 'High-curcumin double-polished fingers and pure golden milled turmeric powders.',
      ctaText: 'Enquire for Turmeric',
      mobileCtaText: 'Enquire Now',
      mobileSecondaryText: 'View Specs'
    },
    {
      id: 'cumin',
      image: '/assets/hero/banner-cumin.jpg',
      mobileImage: '/assets/hero/hero-mobile-cumin.jpg',
      alt: 'Machine cleaned Sortex Indian cumin seeds jeera',
      badge: 'Cumin (Jeera) Seeds',
      eyebrow: 'Unjha Mandi Hub • Gujarat & Rajasthan Belts',
      headline: 'Sortex-Cleaned Machine Purity Indian Cumin Seeds',
      subline: '99% to 99.5% Purity Singapore & European Machine Cleaned Grades',
      description: 'Direct procurement from primary farm yards in Unjha and Western India. Free from foreign seeds and dirt with moisture below 8-9% and high volatile essential oil retention for extractors and blenders.',
      mobileHeadline: 'Sortex Machine-Cleaned Cumin',
      mobileDescription: '99% to 99.5% Sortex machine-cleaned cumin seeds direct from Unjha Mandi.',
      ctaText: 'Enquire for Cumin',
      mobileCtaText: 'Enquire Now',
      mobileSecondaryText: 'View Specs'
    },
    {
      id: 'coriander',
      image: '/assets/hero/banner-coriander.jpg',
      mobileImage: '/assets/hero/hero-mobile-coriander.jpg',
      alt: 'Eagle and Scooter quality Indian coriander seeds and powder',
      badge: 'Coriander (Dhaniya)',
      eyebrow: 'Kota & Ramganj Mandi • Fresh Harvest Crop',
      headline: 'Eagle & Scooter Quality Green Coriander Seeds',
      subline: 'Aromatic Whole Round, Split (Dal), & Fragrant Ground Powders',
      description: 'Sun-cured golden-green coriander seeds with sweet citrusy aroma. Available in whole round, split, and ultra-fine ground powder tailored for commercial spice seasoning mixes and curry powders.',
      mobileHeadline: 'Eagle & Scooter Green Coriander',
      mobileDescription: 'Eagle & Scooter grade aromatic whole seeds, split dal, and pure ground powders.',
      ctaText: 'Enquire for Coriander',
      mobileCtaText: 'Enquire Now',
      mobileSecondaryText: 'View Specs'
    }
  ];

  const [products, setProducts] = React.useState<Product[]>(() => AdminStorage.getProducts());
  const [blogPosts, setBlogPosts] = React.useState<BlogPost[]>(() => AdminStorage.getBlogPosts());
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>(() => AdminStorage.getTestimonials());

  React.useEffect(() => {
    const updateProds = () => setProducts(AdminStorage.getProducts());
    const updateBlogs = () => setBlogPosts(AdminStorage.getBlogPosts());
    const updateTestimonials = () => setTestimonials(AdminStorage.getTestimonials());
    window.addEventListener('origintra_products_updated', updateProds);
    window.addEventListener('origintra_blog_updated', updateBlogs);
    window.addEventListener('origintra_testimonials_updated', updateTestimonials);
    return () => {
      window.removeEventListener('origintra_products_updated', updateProds);
      window.removeEventListener('origintra_blog_updated', updateBlogs);
      window.removeEventListener('origintra_testimonials_updated', updateTestimonials);
    };
  }, []);

  const [currentHeroSlide, setCurrentHeroSlide] = React.useState(0);
  const [fadeState, setFadeState] = React.useState<'in' | 'out'>('in');
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const goToSlide = React.useCallback((newIdx: number) => {
    setFadeState('out');
    setTimeout(() => {
      setCurrentHeroSlide(newIdx);
      setFadeState('in');
    }, 250);
  }, []);

  const touchStartXRef = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        goToSlide((currentHeroSlide + 1) % heroSlides.length);
      } else {
        goToSlide((currentHeroSlide - 1 + heroSlides.length) % heroSlides.length);
      }
    }
    touchStartXRef.current = null;
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      goToSlide((currentHeroSlide + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentHeroSlide, goToSlide, heroSlides.length]);

  const currentSlideData = heroSlides[currentHeroSlide];

  const handleHeroCta = (slide: typeof heroSlides[0]) => {
    if (slide.id === 'red-chilli') {
      onOpenQuoteWithProduct('Red Chilli');
    } else if (slide.id === 'turmeric') {
      onOpenQuoteWithProduct('Turmeric');
    } else if (slide.id === 'cumin') {
      onOpenQuoteWithProduct('Cumin Seeds');
    } else if (slide.id === 'coriander') {
      onOpenQuoteWithProduct('Coriander Seeds');
    } else {
      onOpenGeneralQuote();
    }
  };

  const handleSecondaryCta = (slide: typeof heroSlides[0]) => {
    if (slide.id === 'red-chilli') {
      const prod = products.find(p => p.id === 'whole-red-chili' || p.id === 'red-chilli');
      if (prod) { onOpenProductDetail(prod); return; }
    } else if (slide.id === 'turmeric') {
      const prod = products.find(p => p.id === 'turmeric');
      if (prod) { onOpenProductDetail(prod); return; }
    } else if (slide.id === 'cumin') {
      const prod = products.find(p => p.id === 'cumin-seeds' || p.id === 'cumin');
      if (prod) { onOpenProductDetail(prod); return; }
    } else if (slide.id === 'coriander') {
      const prod = products.find(p => p.id === 'coriander-seeds' || p.id === 'coriander');
      if (prod) { onOpenProductDetail(prod); return; }
    }
    onNavigate('products');
  };

  const whyChooseBlocks = [
    {
      title: 'Reliable Sourcing',
      desc: 'Strong sourcing relationships across key agricultural belts in India, securing consistent harvest lots directly from accredited mandis and grower clusters.',
      icon: Compass
    },
    {
      title: 'Consistent Quality',
      desc: 'Focused on product quality, optical sorting, controlled moisture equilibrium, and physical purity tailored to destination market thresholds.',
      icon: ShieldCheck
    },
    {
      title: 'Export Documentation',
      desc: 'Professional handling of required export paperwork: Commercial Invoice, Packing List, Bill of Lading, Certificate of Origin, and Phytosanitary Certificate.',
      icon: FileText
    },
    {
      title: 'Flexible Supply',
      desc: 'Commercial solutions designed around buyer volume requirements, from full container loads (FCL) to multi-commodity mixed containers.',
      icon: Layers
    },
    {
      title: 'Transparent Communication',
      desc: 'Clear, direct communication from initial technical inquiry and sample verification to production updates and maritime vessel tracking.',
      icon: Send
    },
    {
      title: 'Global Delivery',
      desc: 'Supporting international trade logistics with direct vessel departures from major Indian container gateways including Mundra, Nhava Sheva, and Cochin.',
      icon: Truck
    }
  ];


  const marqueeCountries = [
    { name: 'China', code: 'cn' },
    { name: 'USA', code: 'us' },
    { name: 'UAE', code: 'ae' },
    { name: 'UK', code: 'gb' },
    { name: 'Germany', code: 'de' },
    { name: 'Thailand', code: 'th' },
    { name: 'Malaysia', code: 'my' },
    { name: 'Indonesia', code: 'id' },
    { name: 'Vietnam', code: 'vn' },
    { name: 'Singapore', code: 'sg' },
    { name: 'Saudi Arabia', code: 'sa' },
    { name: 'Bangladesh', code: 'bd' },
    { name: 'Sri Lanka', code: 'lk' },
    { name: 'Kuwait', code: 'kw' },
    { name: 'Qatar', code: 'qa' },
    { name: 'Canada', code: 'ca' },
    { name: 'Australia', code: 'au' },
    { name: 'Netherlands', code: 'nl' },
    { name: 'Japan', code: 'jp' },
    { name: 'South Korea', code: 'kr' },
    { name: 'Egypt', code: 'eg' },
    { name: 'Turkey', code: 'tr' },
    { name: 'South Africa', code: 'za' },
    { name: 'France', code: 'fr' },
    { name: 'Italy', code: 'it' },
    { name: 'Spain', code: 'es' },
    { name: 'Brazil', code: 'br' },
    { name: 'Mexico', code: 'mx' },
    { name: 'Russia', code: 'ru' },
    { name: 'Poland', code: 'pl' }
  ];

  // Curated flagship commodities for homepage - clean, compact showcase of 3 iconic products (or flagged flagship products)
  const defaultFlagshipIds = ['whole-red-chili', 'cumin-seeds', 'turmeric'];
  const flagships = products.filter(p => p.isFlagship);
  const featuredProducts = flagships.length > 0
    ? flagships.slice(0, 3)
    : products.filter(p => defaultFlagshipIds.includes(p.id))
        .sort((a, b) => defaultFlagshipIds.indexOf(a.id) - defaultFlagshipIds.indexOf(b.id));

  return (
    <div className="bg-white text-[#0F172A]">
      
      {/* 1. HERO SECTION (Dynamic Spice Image & Matching Content Carousel) */}
      <section className="relative overflow-hidden min-h-[540px] sm:min-h-[580px] md:min-h-[640px] lg:min-h-[700px] flex items-center text-white">
        {/* Authentic Indian spice background slides (responsive mobile portrait vs desktop landscape) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentHeroSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10'
              }`}
            >
              <picture className="w-full h-full block">
                {/* Mobile Modern WebP (70KB) */}
                <source media="(max-width: 639px)" type="image/webp" srcSet={slide.mobileImage.replace(/\.jpg$/, '.webp')} />
                {/* Mobile Fallback JPEG */}
                <source media="(max-width: 639px)" type="image/jpeg" srcSet={slide.mobileImage} />
                {/* Desktop Modern WebP (150KB) */}
                <source media="(min-width: 640px)" type="image/webp" srcSet={slide.image.replace(/\.jpg$/, '.webp')} />
                {/* Desktop Fallback JPEG */}
                <img
                  src={slide.image}
                  alt={slide.alt}
                  width="1376"
                  height="768"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding={idx === 0 ? 'sync' : 'async'}
                  fetchPriority={idx === 0 ? 'high' : 'low'}
                  className={`w-full h-full object-cover object-[center_40%] sm:object-center transition-transform duration-[7000ms] ease-out ${
                    idx === currentHeroSlide ? 'scale-105' : 'scale-100'
                  }`}
                />
              </picture>
            </div>
          ))}

          {/* Desktop/Tablet Directional Editorial Gradient (left-to-right) */}
          <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#071120] via-[#071120]/90 via-50% lg:via-45% to-transparent z-[1]" />
          <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-[#071120]/80 via-transparent to-black/30 z-[1]" />

          {/* Mobile Directional Gradient: Calibrated subtle gradient letting photography shine while text remains crisp */}
          <div className="sm:hidden absolute inset-0 bg-gradient-to-b from-[#071120]/80 via-[#071120]/55 to-[#071120]/85 z-[1]" />
        </div>

        {/* ============================================================== */}
        {/* Mobile Hero section: Centered Text & Bottom Controls           */}
        {/* Large Title & Subtitle, Background Gradient, Bottom Navigation */}
        {/* ============================================================== */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="sm:hidden relative z-10 w-full px-4 pt-3.5 pb-3 flex flex-col justify-between min-h-[540px] h-[calc(100svh-110px)] max-h-[620px]"
        >
          {/* Top Row: Slide Counter on the side (NOT in the middle) */}
          <div className="flex justify-end w-full">
            <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-950/80 border border-white/20 backdrop-blur-md text-[10.5px] font-mono tracking-widest text-slate-200 shadow-md">
              <span className="text-[#38BDF8] font-bold">{String(currentHeroSlide + 1).padStart(2, '0')}</span>
              <span className="text-slate-300 mx-0.5">/</span>
              <span className="text-white font-medium">{String(heroSlides.length).padStart(2, '0')}</span>
            </div>
          </div>

          {/* Middle / Center Zone: Large Headline & Subtitle with proper contrast */}
          <div className={`transition-all duration-300 ease-out transform ${
            fadeState === 'in' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-[0.98]'
          } w-full max-w-[360px] mx-auto flex-1 flex flex-col items-center justify-center text-center py-3 space-y-2 relative`}>
            {/* Soft subtle backdrop for text legibility */}
            <div className="absolute inset-0 -inset-x-3 -inset-y-2 bg-[#071120]/25 rounded-3xl blur-xl -z-10 pointer-events-none" />
            
            {/* Commodity Editorial Eyebrow (Clean bespoke typography, no generic AI pill) */}
            <div className="flex items-center justify-center gap-2 pb-0.5">
              <span className="h-px w-4 bg-sky-400/50" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]">
                {currentSlideData.badge}
              </span>
              <span className="h-px w-4 bg-sky-400/50" />
            </div>

            {/* Main Headline (INCREASED SIZE for commanding visual impact) */}
            <h1 className="text-[1.82rem] sm:text-[2.1rem] font-display font-bold text-white tracking-tight leading-[1.14] text-center drop-shadow-[0_3px_14px_rgba(0,0,0,0.98)] max-w-[340px]">
              {currentSlideData.headline}
              <span className="text-[#38BDF8]">.</span>
            </h1>

            {/* Sourcing Corridor Subtitle (INCREASED SIZE) */}
            <p className="text-[13px] sm:text-[14px] font-semibold text-sky-200 flex items-center justify-center gap-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.98)] text-center pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span>{currentSlideData.eyebrow}</span>
            </p>

            {/* Description (INCREASED SIZE) */}
            <p className="text-[12px] sm:text-[13px] text-slate-100 font-normal leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.98)] max-w-[330px] text-center mx-auto pt-0.5">
              {currentSlideData.mobileDescription}
            </p>
          </div>

          {/* Bottom Zone: Placed firmly at the bottom */}
          <div className="w-full space-y-2.5 pt-2 pb-0.5">
            {/* CTAs matching user reference exactly with accessible min 44px tap targets */}
            <div className="grid grid-cols-2 gap-2.5 w-full">
              <button
                onClick={() => handleHeroCta(currentSlideData)}
                className="w-full bg-[#0070E0] hover:bg-[#005bb5] active:scale-[0.98] text-white py-3 px-3 min-h-[44px] rounded-full text-xs font-semibold tracking-wide cursor-pointer shadow-lg transition-all flex items-center justify-center space-x-1.5 border border-sky-400/30"
              >
                <span>{currentSlideData.mobileCtaText}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>

              <button
                onClick={() => handleSecondaryCta(currentSlideData)}
                className="w-full border border-white/35 hover:border-white text-white bg-black/40 hover:bg-black/60 backdrop-blur-md active:scale-[0.98] py-3 px-3 min-h-[44px] rounded-full text-xs font-semibold tracking-wide cursor-pointer transition-all flex items-center justify-center space-x-1.5"
              >
                <span>{currentSlideData.mobileSecondaryText}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 ml-0.5" />
              </button>
            </div>

            {/* Mobile Slide Dot Controls on Left & Next/Prev Circular Buttons on Right with 44px touch targets */}
            <div className="flex items-center justify-between w-full pt-1 px-0.5">
              <div className="flex items-center -space-x-1">
                {heroSlides.map((slide, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                    aria-label={`Slide ${idx + 1}: ${slide.badge}`}
                  >
                    <span
                      className={`h-1.5 rounded-full transition-all duration-300 block ${
                        idx === currentHeroSlide ? 'w-6 bg-[#0070E0]' : 'w-2 bg-white/70'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2 text-white/90">
                <button
                  onClick={() => goToSlide((currentHeroSlide - 1 + heroSlides.length) % heroSlides.length)}
                  className="w-11 h-11 rounded-full bg-black/55 backdrop-blur-xs flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => goToSlide((currentHeroSlide + 1) % heroSlides.length)}
                  className="w-11 h-11 rounded-full bg-black/55 backdrop-blur-xs flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DESKTOP & TABLET FOREGROUND (>= 640px)                         */}
        {/* Full-Bleed Cinematic Editorial Carousel                        */}
        {/* ============================================================== */}
        <div className="hidden sm:block container-x mx-auto max-w-[1440px] relative py-12 md:py-20 lg:py-28 z-10 w-full">
          <div className="max-w-xl sm:max-w-2xl lg:max-w-3xl space-y-4 md:space-y-6">
            
            {/* Animated Text Container with smooth transition */}
            <div className={`transition-all duration-300 ease-out transform ${
              fadeState === 'in' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            } space-y-4 md:space-y-5`}>
              
              {/* Sourcing Corridor & Commodity Eyebrow */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                  {currentSlideData.badge}
                </span>
                <span className="text-slate-300 font-light">•</span>
                <span className="text-xs sm:text-sm font-medium text-slate-200 tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                  {currentSlideData.eyebrow}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] font-display font-semibold text-white tracking-tight leading-tight sm:leading-[1.16] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {currentSlideData.headline}
                <span className="text-[#38BDF8]">.</span>
              </h1>

              {/* Body Description */}
              <p className="text-sm sm:text-base md:text-base lg:text-lg text-white/95 leading-relaxed font-normal max-w-xl lg:max-w-2xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                {currentSlideData.description}
              </p>

              {/* Technical Specifications Subline */}
              {currentSlideData.subline && (
                <div className="flex pt-0.5 text-xs sm:text-sm font-mono text-sky-200 items-center space-x-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shrink-0" />
                  <span className="truncate sm:whitespace-normal">{currentSlideData.subline}</span>
                </div>
              )}

              {/* CTAs */}
              <div className="pt-2 md:pt-3 flex flex-wrap items-center gap-3 md:gap-4">
                <button
                  onClick={() => handleHeroCta(currentSlideData)}
                  className="btn-pill btn-pill-primary bg-[#0070E0] hover:bg-[#005bb5] text-white px-5 md:px-7 py-2.5 md:py-3.5 text-sm font-semibold tracking-wide cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center space-x-2 shrink-0"
                >
                  <span>{currentSlideData.ctaText}</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>

                <button
                  onClick={() => handleSecondaryCta(currentSlideData)}
                  className="btn-pill btn-pill-outline border-white/30 hover:border-white text-white hover:bg-white/10 px-5 md:px-7 py-2.5 md:py-3.5 text-sm font-semibold tracking-wide cursor-pointer transition-all flex items-center space-x-2 shrink-0"
                >
                  <span>
                    {currentSlideData.id === 'spices-assortment' ? 'Explore Products' : 'View Specifications'}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Floating Slide Navigation Controls on Tablet / Desktop */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 lg:bottom-10 lg:right-10 z-20 hidden sm:flex items-center space-x-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-xl">
          <button
            onClick={() => goToSlide((currentHeroSlide - 1 + heroSlides.length) % heroSlides.length)}
            className="w-9 h-9 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Previous spice slide"
            title="Previous spice"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-0.5">
            {heroSlides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className="p-2 min-w-[28px] min-h-[28px] flex items-center justify-center cursor-pointer"
                title={slide.badge}
                aria-label={`Slide ${idx + 1}: ${slide.badge}`}
              >
                <span
                  className={`h-1.5 rounded-full transition-all duration-300 block ${
                    idx === currentHeroSlide ? 'w-6 bg-[#0070E0]' : 'w-2 bg-white/60 hover:bg-white/90'
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            onClick={() => goToSlide((currentHeroSlide + 1) % heroSlides.length)}
            className="w-9 h-9 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Next spice slide"
            title="Next spice"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 2. GLOBAL EXPORT DESTINATIONS MARQUEE (Immediately following Hero) */}
      <section className="py-3 sm:py-5 bg-[#F8F7F4] border-b border-slate-200/80 overflow-hidden relative">

        {/* Marquee Track with gradient fade edges */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-16 md:w-24 bg-gradient-to-r from-[#F8F7F4] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-16 md:w-24 bg-gradient-to-l from-[#F8F7F4] to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee flex items-center py-1 sm:py-2">
            {[...marqueeCountries, ...marqueeCountries].map((country, idx) => (
              <div 
                key={idx} 
                className="flex flex-col items-center justify-center shrink-0 mx-2 sm:mx-4 md:mx-5 group cursor-default"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 aspect-square rounded-full overflow-hidden shadow-2xs border border-slate-300/80 bg-white flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-md group-hover:border-[#0070E0]/60">
                  <img
                    src={`/flags/${country.code}.png`}
                    alt={`${country.name} Flag`}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
                <span className="mt-1 text-[8px] sm:text-[10px] md:text-[11px] font-bold tracking-wider text-slate-600 uppercase group-hover:text-[#0070E0] transition-colors whitespace-nowrap">
                  {country.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ABOUT ORIGINTRA */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
        <div className="container-x mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
                Premier Spices Exporter in India • Origintra Exim
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-[#0F172A] tracking-tight leading-tight">
                Built for Global Trade. Driven by Trust<span className="text-[#0070E0]">.</span>
              </h2>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Origintra Exim is a premier spices exporter in India, built around a simple principle — global trade works best when quality, transparency, and reliability move together.
              </p>

              <p className="text-base text-slate-600 leading-relaxed">
                As an APEDA and Spices Board of India registered merchant exporter, we work directly with verified farmgate sourcing networks across Gujarat, Andhra Pradesh, Rajasthan, and Kerala to connect international food manufacturers, spice grinders, and wholesale importers with export-grade whole spices, sortex seeds, and ground powders.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('about')}
                  className="btn-pill btn-pill-dark bg-[#0A1C3E] hover:bg-[#0070E0] text-white px-6 py-3 text-xs sm:text-sm font-semibold flex items-center space-x-2 cursor-pointer"
                >
                  <span>More About Origintra</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-sm aspect-4/3 border border-slate-200 group">
                  <img
                    src="/assets/about/spice-harvest-sourcing.jpg"
                    alt="Indian agricultural quality inspection and farm-gate spice sourcing by Origintra Exim"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                <div className="rounded-2xl overflow-hidden shadow-sm aspect-square border border-slate-200 group">
                  <img
                    src="/assets/hero/banner-red-chilli.jpg"
                    alt="Clean red chilli whole pods, ground powder, and export bags from India"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-6 sm:pt-8">
                <div className="rounded-2xl overflow-hidden shadow-sm aspect-square border border-slate-200 group">
                  <img
                    src="/assets/about/spice-processing-plant.jpg"
                    alt="Modern spice optical sorting, Sortex cleaning, and mechanical milling plant in India"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                <div className="rounded-2xl overflow-hidden shadow-sm aspect-4/3 border border-slate-200 group">
                  <img
                    src="/assets/about/container-ship-port.jpg"
                    alt="Mundra Port deep-water container terminal and global ocean freight dispatch of Indian spices"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. PRODUCTS SECTION */}
      <section className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200/80">
        <div className="container-x mx-auto max-w-[1440px]">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-14">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
                Indian Spices Exporter Catalog • 27 Export Commodities
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-semibold text-[#0F172A] tracking-tight mt-1.5 sm:mt-2">
                Export Quality Indian Spices & Agro Commodities<span className="text-[#0070E0]">.</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
                Featured flagship commodities from our 27-product portfolio: Guntur dry red chillies, Salem turmeric fingers, Unjha sortex cumin seeds, and Alleppey cardamom. Sourced directly from contracted regional farms across India.
              </p>
            </div>

            <button
              onClick={() => onNavigate('products')}
              className="btn-pill btn-pill-outline border-slate-300 text-slate-800 hover:border-[#0A1C3E] hover:text-[#0A1C3E] px-5 py-2.5 sm:px-6 sm:py-3 min-h-[44px] text-xs sm:text-sm font-semibold shrink-0 cursor-pointer self-start md:self-auto inline-flex items-center"
            >
              <span>View All 27 Products</span>
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Product Cards Grid - Concise 3-product showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Clean Commodity Visual Presentation */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Category Tag on top right */}
                    <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-[#0A1C3E] text-[11px] font-bold uppercase tracking-wider shadow-xs border border-white/80">
                      {product.category || 'Export Spice'}
                    </div>

                    {/* Flagship Badge on top left if applicable */}
                    {product.isFlagship && (
                      <div className="absolute top-3.5 left-3.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                        Flagship
                      </div>
                    )}
                  </div>

                  <div className="p-5 sm:p-6 space-y-3.5">
                    {/* Origin Belt Eyebrow & Quality Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100/90 border border-slate-200/80 text-[11px] font-semibold text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-[#0070E0] shrink-0" />
                        <span className="truncate max-w-[190px]">{product.origin.split('—')[0].trim()}</span>
                      </div>
                      <span className="inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-50 text-[#0070E0] border border-blue-200/60 shrink-0 font-mono">
                        Export Grade
                      </span>
                    </div>

                    {/* Commodity Title & Botanical Name */}
                    <div>
                      <a
                        href={`/products/${product.slug}`}
                        onClick={(e) => {
                          if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                            e.preventDefault();
                            onOpenProductDetail(product);
                          }
                        }}
                        className="group/title block"
                      >
                        <h3 className="text-xl font-display font-bold text-[#0A1C3E] group-hover/title:text-[#0070E0] transition-colors leading-snug tracking-tight">
                          {product.name}
                        </h3>
                      </a>
                      {product.botanicalName && (
                        <p className="text-[11px] text-slate-600 mt-0.5 font-sans font-medium italic tracking-wide">
                          Botanical: <span>{product.botanicalName}</span>
                        </p>
                      )}
                    </div>

                    {/* Commercial Trade Summary */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                      {product.shortDescription || product.tagline}
                    </p>

                    {/* Trade Specifications Panel */}
                    <div className="rounded-xl bg-slate-50/90 border border-slate-200/80 p-3 grid grid-cols-2 gap-3 text-xs">
                      <div className="min-w-0">
                        <span className="text-slate-600 font-semibold block text-[10px] uppercase tracking-wider font-sans">
                          Export Forms
                        </span>
                        <span className="text-slate-900 font-bold mt-0.5 block truncate text-xs">
                          {product.availableForms.slice(0, 2).map(f => f.toLowerCase().includes('powder') ? 'Powder' : 'Whole').join(' & ') || 'Whole & Ground'}
                        </span>
                      </div>
                      <div className="min-w-0 border-l border-slate-200/80 pl-3">
                        <span className="text-slate-600 font-semibold block text-[10px] uppercase tracking-wider font-sans">
                          Supply Grade
                        </span>
                        <span className="text-slate-900 font-bold mt-0.5 block truncate text-xs">
                          {product.grade ? product.grade.split('·')[0].trim() : 'Export Standard'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Symmetrical Executive Action Pair with 44px touch targets */}
                <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 mt-2 flex items-center gap-2.5">
                  <button
                    onClick={() => onOpenProductDetail(product)}
                    className="flex-1 py-3 px-3 min-h-[44px] rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  </button>

                  <button
                    onClick={() => onOpenQuoteWithProduct(product.name)}
                    className="flex-1 py-3 px-3 min-h-[44px] rounded-xl bg-[#0070E0] hover:bg-[#005bb5] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm hover:shadow"
                  >
                    <span>Request Quote</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View More Products CTA */}
          <div className="mt-8 sm:mt-12 text-center">
            <button
              onClick={() => onNavigate('products')}
              className="btn-pill btn-pill-dark bg-[#0A1C3E] hover:bg-[#0070E0] text-white px-6 sm:px-8 py-3.5 sm:py-3.5 min-h-[44px] text-xs sm:text-sm font-semibold inline-flex items-center space-x-2 shadow-sm transition-all cursor-pointer"
            >
              <span>Explore All 27 Export Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-slate-600 mt-2">
              Browse all 4 categories: Whole Spices (9) • Ground Spices (6) • Sortex Seeds (5) • Blends (7)
            </p>
          </div>

        </div>
      </section>

      {/* 5. WHY ORIGINTRA */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
        <div className="container-x mx-auto max-w-[1440px]">
          
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
              Value Proposition
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-[#0F172A] tracking-tight mt-2">
              Why International Buyers Choose Origintra<span className="text-[#0070E0]">.</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-3">
              Built on dependable agricultural supply chains, transparent communication, and disciplined export compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseBlocks.map((block, idx) => {
              const IconComp = block.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0070E0] flex items-center justify-center">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-[#0F172A]">
                    {block.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {block.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. STATUTORY EXPORT CERTIFICATES & ACCREDITATIONS (FSSAI, APEDA, Spice Board, IEC, GST, MSME) */}
      <section className="relative overflow-hidden py-20 sm:py-28 bg-[#0A1C3E] text-white">
        {/* Dotted Global Network Map Background (Faint Watermark with Routes & Nodes) */}
        <div 
          className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-[0.06]"
          aria-hidden="true"
        >
          <img 
            src="/assets/dotted-world-map.webp" 
            alt="" 
            width="1600"
            height="1000"
            className="w-full h-full object-cover object-center scale-105"
            loading="lazy"
            decoding="async"
          />
        </div>
        {/* Soft edge fade overlay for seamless background integration */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1C3E]/60 via-transparent to-[#0A1C3E]/60 pointer-events-none" />

        <div className="container-x mx-auto max-w-[1440px] relative z-10">
          
          {/* Executive Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-blue-900/60">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                Statutory Export Accreditations & Licensing
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-white tracking-tight mt-2">
                Government Verified & Certified for Global Trade<span className="text-[#38BDF8]">.</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Origintra Exim is a licensed Indian merchant exporter. Commercial spice consignments are governed by statutory food safety standards, lab clearances, and official trade certifications.
              </p>
            </div>

            <button
              onClick={() => onNavigate('quality')}
              className="px-5 py-3 min-h-[44px] rounded-xl bg-[#0070E0] hover:bg-[#005bb5] text-white text-xs sm:text-sm font-semibold shrink-0 cursor-pointer flex items-center space-x-2 transition-colors shadow-sm"
            >
              <span>View Full Quality & Compliance</span>
              <ArrowUpRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

          {/* 6 Accreditations - Only Logos in Big Size */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            
            {/* 1. FSSAI */}
            <div 
              onClick={() => onNavigate('quality')}
              className="bg-white rounded-2xl p-6 sm:p-7 flex items-center justify-center hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group shadow-md h-32 sm:h-38 md:h-44 border border-white/90"
              title="FSSAI - Food Safety and Standards Authority of India"
            >
              <img 
                src="/assets/certificates/fssai.png" 
                alt="FSSAI" 
                className="h-16 sm:h-20 md:h-24 w-auto max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-110" 
                loading="lazy"
              />
            </div>

            {/* 2. APEDA */}
            <div 
              onClick={() => onNavigate('quality')}
              className="bg-white rounded-2xl p-6 sm:p-7 flex items-center justify-center hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group shadow-md h-32 sm:h-38 md:h-44 border border-white/90"
              title="APEDA - Agricultural and Processed Food Products Export Development Authority"
            >
              <img 
                src="/assets/certificates/apeda.png" 
                alt="APEDA" 
                className="h-16 sm:h-20 md:h-24 w-auto max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-110" 
                loading="lazy"
              />
            </div>

            {/* 3. Spice Board */}
            <div 
              onClick={() => onNavigate('quality')}
              className="bg-white rounded-2xl p-6 sm:p-7 flex items-center justify-center hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group shadow-md h-32 sm:h-38 md:h-44 border border-white/90"
              title="Spices Board India - Ministry of Commerce and Industry"
            >
              <img 
                src="/assets/certificates/spices-board.png" 
                alt="Spices Board India" 
                className="h-16 sm:h-20 md:h-24 w-auto max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-110" 
                loading="lazy"
              />
            </div>

            {/* 4. IEC */}
            <div 
              onClick={() => onNavigate('quality')}
              className="bg-white rounded-2xl p-6 sm:p-7 flex items-center justify-center hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group shadow-md h-32 sm:h-38 md:h-44 border border-white/90"
              title="IEC - Import Export Code (DGFT, Ministry of Commerce)"
            >
              <img 
                src="/assets/certificates/iec.png" 
                alt="IEC DGFT License" 
                className="h-16 sm:h-20 md:h-24 w-auto max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-110" 
                loading="lazy"
              />
            </div>

            {/* 5. GST */}
            <div 
              onClick={() => onNavigate('quality')}
              className="bg-white rounded-2xl p-6 sm:p-7 flex items-center justify-center hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group shadow-md h-32 sm:h-38 md:h-44 border border-white/90"
              title="GST - Goods and Services Tax"
            >
              <img 
                src="/assets/certificates/gst.png" 
                alt="GST" 
                className="h-16 sm:h-20 md:h-24 w-auto max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-110" 
                loading="lazy"
              />
            </div>

            {/* 6. MSME */}
            <div 
              onClick={() => onNavigate('quality')}
              className="bg-white rounded-2xl p-6 sm:p-7 flex items-center justify-center hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group shadow-md h-32 sm:h-38 md:h-44 border border-white/90"
              title="MSME - Ministry of Micro, Small and Medium Enterprises"
            >
              <img 
                src="/assets/certificates/msme.svg" 
                alt="MSME" 
                className="h-16 sm:h-20 md:h-24 w-auto max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-110" 
                loading="lazy"
              />
            </div>

          </div>

        </div>
      </section>

      {/* 8.5 INTERNATIONAL BUYER TESTIMONIALS & TRADE REFERENCES (INFINITE MARQUEE) */}
      <section className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200/80 overflow-hidden">
        <div className="container-x mx-auto max-w-[1440px]">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
                Commercial Trade References
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-[#0F172A] tracking-tight mt-2">
                What Global Trade Partners Say<span className="text-[#0070E0]">.</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mt-3 max-w-2xl">
                Commercial feedback from international spice importers, food processors, and re-packers sourcing Indian commodities.
              </p>
            </div>

          </div>
        </div>

        {/* Continuous Infinite Marquee Track with Fade Masks */}
        <div className="relative w-full overflow-hidden">
          {/* Edge Gradient Fade Masks */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10" />

          {/* Seamless Infinite Marquee Track */}
          <div className="w-full overflow-hidden py-3">
            <div className="animate-marquee-slow flex gap-6 sm:gap-8 items-stretch pl-4">
              {(testimonials.length < 4
                ? [...testimonials, ...testimonials, ...testimonials, ...testimonials]
                : [...testimonials, ...testimonials]
              ).map((item, idx) => (
                <div 
                  key={`${item.id}-${idx}`}
                  className="w-[340px] sm:w-[400px] md:w-[440px] shrink-0 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-blue-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top metadata: Commodity & Contract Volume */}
                    <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 text-xs">
                      <span className="font-bold text-[#0070E0] truncate max-w-[220px]" title={item.commodity}>
                        {item.commodity}
                      </span>
                      <span className="text-slate-700 font-semibold font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 shrink-0">
                        {item.volumeOrType || 'FCL Container'}
                      </span>
                    </div>

                    {/* Port & Star Rating */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="text-slate-600 font-mono text-[11px] flex items-center gap-1 truncate font-medium">
                        <MapPin className="w-3 h-3 text-[#0070E0] shrink-0" />
                        <span className="truncate">{item.destinationPort}</span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0" title={`${item.rating || 5} out of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, sIdx) => (
                          <Star 
                            key={sIdx} 
                            className={`w-3.5 h-3.5 ${
                              sIdx < (item.rating || 5) 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-slate-200'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>

                    {/* Quote Icon & Testimonial Statement */}
                    <Quote className="w-7 h-7 text-blue-100 mb-2 group-hover:text-blue-200 transition-colors shrink-0" />
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic line-clamp-5 group-hover:line-clamp-none transition-all">
                      "{item.testimonial}"
                    </p>
                  </div>

                  {/* Author & Enterprise Credentials */}
                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      {item.avatar ? (
                        <img 
                          src={item.avatar} 
                          alt={item.author} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A1C3E] to-[#0070E0] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {item.author.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-[#0070E0] transition-colors">
                          {item.author}
                        </h3>
                        <p className="text-[11px] text-slate-600 font-medium truncate">
                          {item.role}
                        </p>
                        <p className="text-[11px] font-semibold text-[#0A1C3E] truncate flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{item.company}</span>
                          <span className="text-slate-600 font-normal shrink-0">({item.country})</span>
                        </p>
                      </div>
                    </div>

                    <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0" title="Verified Trade Consignment">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* 9. BLOG / INSIGHTS PREVIEW */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-200/80">
        <div className="container-x mx-auto max-w-[1440px]">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
                Market Knowledge
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-[#0F172A] tracking-tight mt-2">
                Export Insights & Trade Perspectives<span className="text-[#0070E0]">.</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mt-3">
                Practical articles on Indian agricultural crops, export compliance, and maritime logistics.
              </p>
            </div>

            <button
              onClick={() => onNavigate('blog')}
              className="btn-pill btn-pill-outline border-slate-300 text-slate-800 hover:border-[#0A1C3E] hover:text-[#0A1C3E] px-6 py-3 min-h-[44px] text-xs sm:text-sm font-semibold shrink-0 cursor-pointer"
            >
              <span>View All Articles</span>
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(0, 3).map((post) => (
              <a
                key={post.id}
                href={`/blog/${post.slug}`}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                    e.preventDefault();
                    onNavigate(`/blog/${post.slug}`);
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

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-semibold text-[#0070E0]">{post.category}</span>
                      <span className="font-medium">{post.readTime}</span>
                    </div>

                    <h3 className="text-lg font-display font-semibold text-[#0F172A] group-hover:text-[#0070E0] transition-colors leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="text-slate-600 font-medium">{post.date}</span>
                  <span className="text-[#0070E0] flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>

        </div>
      </section>

      {/* 9.5 B2B SPICE EXPORTER FAQ SECTION (SEO & Google Rich Snippets) */}
      <section className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200/80" id="faq">
        <div className="container-x mx-auto max-w-[1440px]">
          
          <div className="max-w-3xl mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0]">
              B2B Trade Intelligence & FAQs
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-[#0F172A] tracking-tight mt-2">
              Frequently Asked Questions About Sourcing & Exporting Indian Spices<span className="text-[#0070E0]">.</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mt-3 leading-relaxed">
              Commercial guidance, export documentation, container minimums, and port dispatch details for international spice procurement managers and commodity importers.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {HOME_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200 hover:border-slate-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-5 sm:px-8 sm:py-6 flex items-start justify-between gap-4 text-left cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg font-display font-semibold text-[#0F172A] leading-snug">
                      {faq.question}
                    </span>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? 'bg-[#0070E0] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 sm:px-8 sm:pb-7 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sourcing Desk Help Strip */}
          <div className="mt-12 max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl bg-white border border-sky-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0070E0] flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                  Have a specific commodity specification or target discharge port?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Our commercial trade team is ready to evaluate crop arrivals and prepare custom FOB / CIF container pricing.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenGeneralQuote}
              className="btn-pill btn-pill-dark bg-[#0A1C3E] hover:bg-[#0070E0] text-white px-6 py-3 min-h-[44px] text-xs sm:text-sm font-semibold shrink-0 cursor-pointer"
            >
              <span>Ask Our Trade Desk</span>
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </button>
          </div>

        </div>
      </section>

      {/* 10. REQUEST A QUOTE CTA SECTION */}
      <section className="py-20 sm:py-28 bg-[#0A1C3E] text-white">
        <div className="container-x mx-auto max-w-[1440px]">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
              Commercial Sourcing Desk
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-white tracking-tight">
              Ready to Discuss Your Spice Import Requirements?
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Share your target product grades, container volumes, and discharge port. Our commercial team will evaluate crop lot availability and provide a clear, competitive quotation.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-8 sm:gap-10">
              <button
                onClick={onOpenGeneralQuote}
                className="text-white hover:text-[#38BDF8] text-base sm:text-lg font-medium flex items-center space-x-2 transition-colors cursor-pointer group"
              >
                <span>Request a Quote</span>
                <ArrowUpRight className="w-5 h-5 ml-1 text-white group-hover:text-[#38BDF8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigate('contact')}
                className="rounded-full border border-white/40 hover:border-white text-white hover:bg-white/10 px-8 py-3 sm:px-9 sm:py-3 text-base font-medium transition-all duration-200 cursor-pointer"
              >
                <span>Contact Trade Desk</span>
              </button>
            </div>

            <div className="pt-6 text-xs text-slate-300 font-medium flex flex-wrap items-center justify-center gap-6">
              <span>✓ Responses dispatched within 24-48 business hours</span>
              <span>✓ Direct Indian farmgate sourcing</span>
              <span>✓ Customized container packaging</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
