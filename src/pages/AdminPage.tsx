import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  LayoutDashboard,
  Activity,
  FileText,
  Package,
  Inbox,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Check,
  AlertCircle,
  Search,
  Download,
  RefreshCw,
  Lock,
  Unlock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Globe,
  Sliders,
  Sparkles,
  ArrowUpRight,
  ArrowLeft,
  Save,
  X,
  Layers,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  User as UserIcon,
  Users,
  ShieldCheck,
  ShieldAlert,
  Image as ImageIcon,
  Upload,
  CheckCheck,
  Building,
  Building2,
  Flag,
  Award,
  Camera,
  UserPlus,
  Crown,
  PenTool,
  Briefcase,
  EyeOff,
  Quote,
  Star,
  Database,
  Cloud,
  Send,
  Copy,
  Key,
  UserCheck,
  Server,
  Loader2,
  Bell,
  ChevronDown,
  ArrowRight,
  Ship,
  Menu,
  Scale
} from 'lucide-react';
import { Product, BlogPost, Inquiry, TeamMember, User, UserRole, Testimonial } from '../types';
import { AdminStorage } from '../services/adminStorage';
import { supabase } from '../services/supabaseClient';
import { MailService, WelcomeEmailPayload, EmailCredentials } from '../services/mailService';
import { PRODUCT_CATEGORIES } from '../data/products';
import { MediaGalleryModal } from '../components/MediaGalleryModal';
import { LegalPoliciesManager } from '../components/LegalPoliciesManager';
import { ProductEditor } from '../components/ProductEditor';
import { SupabaseModal } from '../components/SupabaseModal';
import { GalleryImage } from '../data/gallery';
import { compressImage, compressDataUrl } from '../utils/imageCompressor';
import { slugify } from '../utils/slugify';
import { getCountryFlag, TRADE_DESTINATIONS } from '../utils/countryFlags';

interface AdminPageProps {
  onNavigate: (page: string) => void;
  onOpenProductDetail: (product: Product) => void;
}

type AdminTab = 'dashboard' | 'products' | 'blog' | 'team' | 'testimonials' | 'gallery' | 'inquiries' | 'users' | 'settings' | 'legal' | 'profile';

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate, onOpenProductDetail }) => {
  // === AUTH STATE ===
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => AdminStorage.isAuthenticated());
  const [currentUser, setCurrentUser] = useState<User | null>(() => AdminStorage.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => AdminStorage.getUsers());
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // === ROLE PERMISSIONS ===
  const currentRole: UserRole = currentUser?.role || 'admin';
  const canAccessProducts = ['admin', 'editor', 'sales'].includes(currentRole);
  const canAccessBlog = ['admin', 'editor', 'author'].includes(currentRole);
  const canAccessTeam = ['admin', 'editor'].includes(currentRole);
  const canAccessTestimonials = ['admin', 'editor'].includes(currentRole);
  const canAccessGallery = ['admin', 'editor', 'author'].includes(currentRole);
  const canAccessInquiries = ['admin', 'sales'].includes(currentRole);
  const canAccessUsers = currentRole === 'admin';
  const canAccessSettings = currentRole === 'admin';
  const canAccessLegal = ['admin', 'editor'].includes(currentRole);

  // === USER MANAGEMENT MODAL STATES ===
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserPassword, setNewUserPassword] = useState('');
  const [sendEmailOnCreate, setSendEmailOnCreate] = useState<boolean>(true);
  const [createdCredentialsModal, setCreatedCredentialsModal] = useState<WelcomeEmailPayload | null>(null);
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);
  const [copiedEmailText, setCopiedEmailText] = useState<boolean>(false);

  // === EMAIL & NODEMAILER SMTP STATE ===
  const [emailCreds, setEmailCreds] = useState<EmailCredentials>(() => MailService.getCredentials());
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [testEmailTarget, setTestEmailTarget] = useState(() => currentUser?.email || 'export@origintra.com');
  const [isVerifyingSmtp, setIsVerifyingSmtp] = useState(false);
  const [verifySmtpResult, setVerifySmtpResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isSavingEmailCreds, setIsSavingEmailCreds] = useState(false);
  const [saveEmailCredsSuccess, setSaveEmailCredsSuccess] = useState(false);
  const [mailLogs, setMailLogs] = useState<any[]>([]);
  const [mailQueueStatus, setMailQueueStatus] = useState<any>(null);
  const [isLoadingMailLogs, setIsLoadingMailLogs] = useState(false);

  const refreshMailDiagnostics = useCallback(async () => {
    setIsLoadingMailLogs(true);
    try {
      const [q, l] = await Promise.all([
        MailService.getQueueStatus(),
        MailService.getAuditLogs()
      ]);
      setMailQueueStatus(q);
      setMailLogs(l || []);
    } catch {} finally {
      setIsLoadingMailLogs(false);
    }
  }, []);

  // === NAVIGATION & TABS ===
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('origintra_dismissed_notifications');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const handleDismissNotification = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDismissedNotificationIds(prev => {
      const next = [...new Set([...prev, id])];
      localStorage.setItem('origintra_dismissed_notifications', JSON.stringify(next));
      return next;
    });
  };

  const handleClearAllNotifications = () => {
    const allIds = activeNotifications.map(n => n.id);
    setDismissedNotificationIds(prev => {
      const next = [...new Set([...prev, ...allIds])];
      localStorage.setItem('origintra_dismissed_notifications', JSON.stringify(next));
      return next;
    });
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('origintra_admin_sidebar_open');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(prev => !prev);
    } else {
      setSidebarOpen(prev => {
        const next = !prev;
        try {
          localStorage.setItem('origintra_admin_sidebar_open', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // === PROFILE FORM STATE ===
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || 'Patel Arsh',
    email: currentUser?.email || 'arsh@origintra.com',
    department: currentUser?.department || 'Corporate Admin & Global Trading Desk',
    phone: currentUser?.phone || '+91 70691 82990',
    avatar: currentUser?.avatar || '/assets/team/director.jpg',
    bio: currentUser?.bio || 'Founder & Global Head of International Trade at Origintra Exim, spearheading bulk spice sourcing, supply chain integrity, and worldwide export operations.',
    newPassword: '',
    confirmPassword: '',
  });
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    if (currentUser) {
      setProfileForm(prev => ({
        ...prev,
        name: currentUser.name || 'Patel Arsh',
        email: currentUser.email || 'arsh@origintra.com',
        department: currentUser.department || 'MD & Founder',
        phone: currentUser.phone || '+91 70691 82990',
        avatar: currentUser.avatar || '/assets/team/director.jpg',
        bio: currentUser.bio || '',
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'settings') {
      refreshMailDiagnostics();
    }
  }, [activeTab, refreshMailDiagnostics]);

  // === DATA STATES (Synced with Supabase Cloud PostgreSQL) ===
  const [products, setProducts] = useState<Product[]>(() => AdminStorage.getProducts());
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => AdminStorage.getBlogPosts());
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => AdminStorage.getTeamMembers());
  const [leadershipVisible, setLeadershipVisible] = useState(() => AdminStorage.getLeadershipVisibility());
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => AdminStorage.getTestimonials());
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => AdminStorage.getInquiries());

  // === DYNAMIC BUYER NOTIFICATIONS WITH DISMISS / CANCEL SUPPORT ===
  const activeNotifications = useMemo(() => {
    const dismissedSet = new Set(dismissedNotificationIds);
    return inquiries
      .filter(inq => !dismissedSet.has(inq.id) && inq.status !== 'closed')
      .map(inq => {
        let relTime = 'Recently';
        try {
          if (inq.createdAt) {
            const diffMs = Date.now() - new Date(inq.createdAt).getTime();
            const diffMin = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMin / 60);
            const diffDays = Math.floor(diffHours / 24);
            if (diffMin < 1) relTime = 'Just now';
            else if (diffMin < 60) relTime = `${diffMin}m ago`;
            else if (diffHours < 24) relTime = `${diffHours}h ago`;
            else if (diffDays === 1) relTime = 'Yesterday';
            else if (diffDays < 7) relTime = `${diffDays}d ago`;
            else relTime = new Date(inq.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
          }
        } catch {}

        return {
          id: inq.id,
          title: `Buyer RFQ: ${inq.product}`,
          message: `${inq.fullName}${inq.companyName ? ` (${inq.companyName})` : ''} requested ${inq.quantityRequired || 'FCL container'} rates.`,
          time: relTime,
          rawInquiry: inq,
          isNew: inq.status === 'new'
        };
      })
      .slice(0, 10);
  }, [inquiries, dismissedNotificationIds]);
  const [companyConfig, setCompanyConfig] = useState(() => AdminStorage.getCompanyConfig());
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(() => AdminStorage.getGalleryImages());
  const [dbStatus, setDbStatus] = useState(() => AdminStorage.getDatabaseStatus());

  // === REAL-TIME DYNAMIC METRICS FOR DASHBOARD KPI CARDS ===
  const productCategoriesCount = useMemo(() => {
    return new Set(products.map(p => p.category).filter(Boolean)).size || 1;
  }, [products]);

  const blogTopicsCount = useMemo(() => {
    return new Set(blogPosts.map(b => b.category).filter(Boolean)).size || 1;
  }, [blogPosts]);

  const galleryStats = useMemo(() => {
    const prod = galleryImages.filter(i => i.category === 'products').length;
    const team = galleryImages.filter(i => i.category === 'team').length;
    const other = galleryImages.length - prod - team;
    return { prod, team, other };
  }, [galleryImages]);

  const newInquiriesCount = useMemo(() => {
    return inquiries.filter(i => i.status === 'new').length;
  }, [inquiries]);

  const testimonialsRating = useMemo(() => {
    if (!testimonials.length) return '5.0';
    const sum = testimonials.reduce((acc, t) => acc + (Number(t.rating) || 5), 0);
    return (sum / testimonials.length).toFixed(1);
  }, [testimonials]);

  // === GLOBAL DASHBOARD SEARCH RESULTS ===
  const searchResults = useMemo(() => {
    const q = dashboardSearchQuery.trim().toLowerCase();
    if (!q) return { products: [], blog: [], inquiries: [] };
    return {
      products: products.filter(p => p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)).slice(0, 3),
      blog: blogPosts.filter(b => b.title.toLowerCase().includes(q) || (b.category || '').toLowerCase().includes(q)).slice(0, 3),
      inquiries: inquiries.filter(i => (i.fullName || '').toLowerCase().includes(q) || (i.companyName || '').toLowerCase().includes(q) || (i.product || '').toLowerCase().includes(q)).slice(0, 3)
    };
  }, [dashboardSearchQuery, products, blogPosts, inquiries]);

  // === SUPABASE DATABASE MODAL STATES ===
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => supabase.getConfig().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => supabase.getConfig().anonKey);
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  // === GALLERY MODAL & PICKER STATES ===
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryModalTarget, setGalleryModalTarget] = useState<'team' | 'product' | 'blog' | 'testimonial' | null>(null);
  const [galleryModalCategory, setGalleryModalCategory] = useState<'all' | 'team' | 'products' | 'facility' | 'banners' | 'certificates' | 'uploads'>('all');
  const [galleryModalTitle, setGalleryModalTitle] = useState('Select Photo from Gallery');

  // Full page gallery tab filters & states
  const [galleryTabCategory, setGalleryTabCategory] = useState('all');
  const [galleryTabSearch, setGalleryTabSearch] = useState('');
  const [previewLightboxImage, setPreviewLightboxImage] = useState<GalleryImage | null>(null);
  const [copiedGalleryUrl, setCopiedGalleryUrl] = useState<string | null>(null);

  // === FILTER & SEARCH STATES ===
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [blogSearch, setBlogSearch] = useState('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('all');
  const [customBlogCategories, setCustomBlogCategories] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('origintra_custom_blog_categories');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [isCreatingNewBlogCategory, setIsCreatingNewBlogCategory] = useState(false);
  const [newBlogCategoryInput, setNewBlogCategoryInput] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [testimonialSearch, setTestimonialSearch] = useState('');
  const [testimonialCommodityFilter, setTestimonialCommodityFilter] = useState('all');
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('all');

  // === MODAL STATES ===
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [blogPreviewPost, setBlogPreviewPost] = useState<BlogPost | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);

  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);
  const [isReplyingEmail, setIsReplyingEmail] = useState(false);
  const [emailReplySubject, setEmailReplySubject] = useState('');
  const [emailReplyMessage, setEmailReplyMessage] = useState('');
  const [isSendingEmailReply, setIsSendingEmailReply] = useState(false);

  // === TOAST NOTIFICATION ===
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync listener when data changes
  useEffect(() => {
    AdminStorage.fetchDatabaseStatus();
    AdminStorage.syncProductsFromServer().catch(() => {});
    AdminStorage.syncSettingsFromServer().catch(() => {});

    const handleProductsUpdated = () => setProducts(AdminStorage.getProducts());
    const handleBlogUpdated = () => setBlogPosts(AdminStorage.getBlogPosts());
    const handleTeamUpdated = () => setTeamMembers(AdminStorage.getTeamMembers());
    const handleLeadershipVisUpdated = () => setLeadershipVisible(AdminStorage.getLeadershipVisibility());
    const handleTestimonialsUpdated = () => setTestimonials(AdminStorage.getTestimonials());
    const handleInquiriesUpdated = () => setInquiries(AdminStorage.getInquiries());
    const handleCompanyUpdated = () => setCompanyConfig(AdminStorage.getCompanyConfig());
    const handleGalleryUpdated = () => setGalleryImages(AdminStorage.getGalleryImages());
    const handleUsersUpdated = () => setUsers(AdminStorage.getUsers());
    const handleDbStatusUpdated = () => setDbStatus(AdminStorage.getDatabaseStatus());
    const handleAuthUpdated = () => {
      setIsAuthenticated(AdminStorage.isAuthenticated());
      setCurrentUser(AdminStorage.getCurrentUser());
    };

    window.addEventListener('origintra_products_updated', handleProductsUpdated);
    window.addEventListener('origintra_blog_updated', handleBlogUpdated);
    window.addEventListener('origintra_team_updated', handleTeamUpdated);
    window.addEventListener('origintra_leadership_visibility_updated', handleLeadershipVisUpdated);
    window.addEventListener('origintra_testimonials_updated', handleTestimonialsUpdated);
    window.addEventListener('origintra_inquiries_updated', handleInquiriesUpdated);
    window.addEventListener('origintra_company_updated', handleCompanyUpdated);
    window.addEventListener('origintra_gallery_updated', handleGalleryUpdated);
    window.addEventListener('origintra_users_updated', handleUsersUpdated);
    window.addEventListener('origintra_db_status_updated', handleDbStatusUpdated);
    window.addEventListener('origintra_auth_updated', handleAuthUpdated);

    return () => {
      window.removeEventListener('origintra_products_updated', handleProductsUpdated);
      window.removeEventListener('origintra_blog_updated', handleBlogUpdated);
      window.removeEventListener('origintra_team_updated', handleTeamUpdated);
      window.removeEventListener('origintra_leadership_visibility_updated', handleLeadershipVisUpdated);
      window.removeEventListener('origintra_testimonials_updated', handleTestimonialsUpdated);
      window.removeEventListener('origintra_inquiries_updated', handleInquiriesUpdated);
      window.removeEventListener('origintra_company_updated', handleCompanyUpdated);
      window.removeEventListener('origintra_gallery_updated', handleGalleryUpdated);
      window.removeEventListener('origintra_users_updated', handleUsersUpdated);
      window.removeEventListener('origintra_db_status_updated', handleDbStatusUpdated);
      window.removeEventListener('origintra_auth_updated', handleAuthUpdated);
    };
  }, []);

  // === LOGIN & AUTH HANDLERS ===
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await AdminStorage.loginWithCredentials(loginEmail.trim(), loginPassword.trim());
    if (res.success && res.user) {
      setIsAuthenticated(true);
      setCurrentUser(res.user);
      setLoginError('');
      showToast(`Welcome back, ${res.user.name} (${res.user.role.toUpperCase()})`);
    } else {
      setLoginError(res.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleLogout = () => {
    AdminStorage.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    showToast('Logged out of Admin Portal.');
  };

  // === FILTERED LISTS ===
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = productCategoryFilter === 'all' || p.categoryKey === productCategoryFilter || p.category.toLowerCase().includes(productCategoryFilter.toLowerCase());
      const q = productSearch.toLowerCase().trim();
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || (p.botanicalName && p.botanicalName.toLowerCase().includes(q)) || p.origin.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, productSearch, productCategoryFilter]);

  const filteredBlogPosts = useMemo(() => {
    return blogPosts.filter(b => {
      const matchesCat = blogCategoryFilter === 'all' || b.category.toLowerCase() === blogCategoryFilter.toLowerCase();
      const q = blogSearch.toLowerCase().trim();
      const matchesSearch = !q || b.title.toLowerCase().includes(q) || b.excerpt.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [blogPosts, blogSearch, blogCategoryFilter]);

  const allBlogCategories = useMemo(() => {
    const defaults = [
      'Global Trade',
      'Indian Spices',
      'Export Insights',
      'Market Trends',
      'Sourcing',
      'Logistics',
      'Business Updates'
    ];
    const fromPosts = blogPosts.map(b => b.category).filter(Boolean);
    return Array.from(new Set([...defaults, ...fromPosts, ...customBlogCategories]));
  }, [blogPosts, customBlogCategories]);

  const handleAddNewBlogCategory = () => {
    const trimmed = newBlogCategoryInput.trim();
    if (!trimmed) {
      showToast('Please enter a valid category name.');
      return;
    }
    if (!customBlogCategories.includes(trimmed)) {
      const updated = [...customBlogCategories, trimmed];
      setCustomBlogCategories(updated);
      localStorage.setItem('origintra_custom_blog_categories', JSON.stringify(updated));
    }
    if (editingBlogPost) {
      setEditingBlogPost({ ...editingBlogPost, category: trimmed });
    }
    setIsCreatingNewBlogCategory(false);
    setNewBlogCategoryInput('');
    showToast(`Category "${trimmed}" created and selected!`);
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(i => {
      const matchesStatus = inquiryStatusFilter === 'all' || i.status === inquiryStatusFilter;
      const q = inquirySearch.toLowerCase().trim();
      const matchesSearch = !q || 
        i.fullName.toLowerCase().includes(q) || 
        i.companyName.toLowerCase().includes(q) || 
        i.businessEmail.toLowerCase().includes(q) || 
        i.product.toLowerCase().includes(q) ||
        i.country.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [inquiries, inquirySearch, inquiryStatusFilter]);

  const filteredTeamMembers = useMemo(() => {
    return teamMembers.filter(m => {
      const q = teamSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        (m.position && m.position.toLowerCase().includes(q)) ||
        (m.role && m.role.toLowerCase().includes(q)) ||
        (m.credentials && m.credentials.toLowerCase().includes(q)) ||
        (m.specialization && m.specialization.toLowerCase().includes(q))
      );
    });
  }, [teamMembers, teamSearch]);

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter(t => {
      const q = testimonialSearch.toLowerCase().trim();
      const matchSearch = !q || (
        t.author.toLowerCase().includes(q) ||
        t.company.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q) ||
        t.destinationPort.toLowerCase().includes(q) ||
        t.commodity.toLowerCase().includes(q) ||
        t.testimonial.toLowerCase().includes(q)
      );

      const matchCommodity = testimonialCommodityFilter === 'all' || 
        t.commodity.toLowerCase().includes(testimonialCommodityFilter.toLowerCase());

      return matchSearch && matchCommodity;
    });
  }, [testimonials, testimonialSearch, testimonialCommodityFilter]);

  // === PRODUCT CRUD HANDLERS ===
  const handleOpenAddProduct = () => {
    setEditingProduct({
      id: `product-${Date.now()}`,
      slug: '',
      name: '',
      botanicalName: '',
      scientific: '',
      category: 'Whole Spices',
      categoryKey: 'whole-spices',
      tagline: 'Export grade quality spice from India',
      isFlagship: false,
      isCustomSourcing: false,
      partUsed: 'Whole Dried Pods / Seeds',
      origin: 'Guntur, Andhra Pradesh, India',
      shortDescription: '',
      fullDescription: '',
      availableForms: ['Whole Form', 'Powder Form (Ground)'],
      packagingOptions: ['25kg PP Bags with PE Liner', '50kg Seaworthy Jute Sacks', 'Customized Private Label'],
      applications: ['Commercial Food Processing', 'Spice Blends & Seasonings', 'Retail Supermarket Packaging'],
      image: '/assets/products/whole-red-chili.jpg',
      gallery: [],
      specifications: [
        { label: 'Moisture Content', value: '10.0% Max' },
        { label: 'Sortex Cleanliness', value: '99.5% Min Cleaned' },
        { label: 'Harvest Belts', value: 'Prime Indian Farmgate Mandis' },
        { label: 'Extraneous Matter', value: '0.5% Max' }
      ],
      qualityProcess: ['Machine Pre-Cleaning', 'Sortex Color Sorting', 'Metal Detection', 'Phytosanitary Fumigation'],
      exportInfo: {
        minimumOrderQuantity: '1 x 20ft FCL (Full Container Load)',
        packagingStandard: 'Multi-layer food-grade hermetic seaworthy packaging',
        containerCapacity: '13-14 MT / 20ft FCL; 26 MT / 40ft HC',
        sampleAvailability: 'Complimentary 200g-500g samples via DHL/FedEx',
        leadTime: '7-12 working days from LC confirmation',
        incoterms: 'FOB Mundra / Nhava Sheva, CIF, CFR any global port'
      },
      faqs: [
        { question: 'What is your standard export lead time?', answer: 'We typically dispatch within 7 to 12 working days from formal Letter of Credit (LC) or TT confirmation.' },
        { question: 'Do you provide laboratory certificate of analysis (COA) with each batch?', answer: 'Yes, every export shipment includes a full laboratory COA, Phytosanitary Certificate, and Certificate of Origin.' }
      ]
    });
    setIsProductModalOpen(false);
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEditProduct = (prod: Product) => {
    const copy: Product = JSON.parse(JSON.stringify(prod));
    if (copy.slug && (copy.slug.startsWith('new-spice-') || copy.slug.startsWith('product-'))) {
      copy.slug = slugify(copy.name);
    }
    if (!copy.specifications || !Array.isArray(copy.specifications) || copy.specifications.length === 0) {
      copy.specifications = [
        { label: 'Moisture Content', value: '10.0% Max' },
        { label: 'Sortex Purity', value: '99.5% Min Cleaned' }
      ];
    }
    if (!copy.packagingOptions || !Array.isArray(copy.packagingOptions) || copy.packagingOptions.length === 0) {
      copy.packagingOptions = ['25kg PP Bags with Liner', '50kg Jute Bags', 'Customized Private Label'];
    }
    if (!copy.applications || !Array.isArray(copy.applications) || copy.applications.length === 0) {
      copy.applications = ['Commercial Food Processing', 'Spice Blends & Seasonings', 'Retail Packaging'];
    }
    if (!copy.availableForms || !Array.isArray(copy.availableForms)) {
      copy.availableForms = ['Whole Form'];
    }
    if (!copy.exportInfo) {
      copy.exportInfo = {
        minimumOrderQuantity: '1 x 20ft FCL',
        packagingStandard: 'Seaworthy Export Grade',
        containerCapacity: '13-14 MT per 20ft FCL; 26 MT per 40ft HC',
        sampleAvailability: 'Complimentary 200g-500g samples via DHL/FedEx',
        leadTime: '7-12 working days from LC confirmation',
        incoterms: 'FOB / CIF / CFR'
      };
    }
    if (!copy.faqs || !Array.isArray(copy.faqs)) {
      copy.faqs = [];
    }
    if (!copy.gallery || !Array.isArray(copy.gallery)) {
      copy.gallery = [];
    }
    setEditingProduct(copy);
    setIsProductModalOpen(false);
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProduct = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!editingProduct) return;

    const trimmedName = (editingProduct.name || '').trim();
    if (!trimmedName) {
      showToast('Product Name is required. Please enter a name.');
      return;
    }

    if (isSavingProduct) return;
    setIsSavingProduct(true);

    try {
      const prodToSave = { ...editingProduct };
      prodToSave.name = trimmedName;

      // Provide automatic fallback if short description is blank
      if (!prodToSave.shortDescription || !prodToSave.shortDescription.trim()) {
        prodToSave.shortDescription = prodToSave.tagline?.trim() || `${prodToSave.name} - Export grade agricultural commodity from Origintra Exim.`;
      }

      // 1. Offload heavy base64 images to server /api/upload.php to protect LocalStorage quota
      if (prodToSave.image && prodToSave.image.startsWith('data:')) {
        try {
          showToast('Uploading & optimizing spice photo...');
          const serverUrl = await AdminStorage.uploadBase64Image(prodToSave.image, slugify(prodToSave.name) || 'spice');
          if (serverUrl) {
            prodToSave.image = serverUrl;
          } else {
            prodToSave.image = await compressDataUrl(prodToSave.image, 480, 0.65);
          }
        } catch (imgErr) {
          console.warn('Image upload fallback, compressing dataUrl:', imgErr);
          try {
            prodToSave.image = await compressDataUrl(prodToSave.image, 480, 0.65);
          } catch {}
        }
      }

      let finalSlug = prodToSave.slug?.trim();
      if (!finalSlug || finalSlug.startsWith('new-spice-')) {
        finalSlug = slugify(prodToSave.name);
      } else {
        finalSlug = slugify(finalSlug);
      }
      if (!finalSlug) {
        finalSlug = `product-${Date.now()}`;
      }
      prodToSave.slug = finalSlug;

      if (!Array.isArray(prodToSave.availableForms)) {
        prodToSave.availableForms = [];
      }

      AdminStorage.saveProduct(prodToSave);
      setProducts(AdminStorage.getProducts());
      setIsProductModalOpen(false);
      setEditingProduct(null);
      showToast(`Product "${prodToSave.name}" saved successfully!`);
    } catch (err: any) {
      console.error('Failed to save spice:', err);
      showToast(`Failed to save spice: ${err?.message || 'Storage error'}`);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = (prod: Product) => {
    if (window.confirm(`Are you sure you want to delete product "${prod.name}"?`)) {
      AdminStorage.deleteProduct(prod.id);
      showToast(`Product "${prod.name}" deleted.`);
    }
  };

  // === BLOG POST CRUD HANDLERS ===
  const handleOpenAddBlogPost = () => {
    const now = new Date();
    const formattedToday = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const rawToday = now.toISOString().split('T')[0];
    const authorName = currentUser?.name || 'Origintra Commercial Research Desk';
    const authorRole = currentUser?.department || 'Trade Insights & Global Logistics';

    setEditingBlogPost({
      id: `post-${Date.now()}`,
      slug: '',
      title: '',
      category: 'Export Insights',
      date: formattedToday,
      rawDate: rawToday,
      readTime: '5 min read',
      author: authorName,
      authorRole: authorRole,
      authorId: currentUser?.id,
      excerpt: '',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80',
      seoTitle: '',
      metaDescription: '',
      tableOfContents: ['Introduction', 'Key Market Insights', 'Summary'],
      content: [
        {
          heading: 'Introduction',
          paragraphs: [
            'India continues to lead global spice production through deep agricultural heritage and modern processing standards.'
          ]
        },
        {
          heading: 'Key Market Insights',
          paragraphs: [
            'International importers and re-packers require documented certifications, tight moisture controls, and residue compliance.'
          ]
        },
        {
          heading: 'Summary',
          paragraphs: [
            'Origintra Exim facilitates certified farmgate procurement and full-container maritime transit to worldwide ports.'
          ]
        }
      ],
      relatedSlugs: []
    });
    setIsSlugManuallyEdited(false);
    // setIsBlogModalOpen(true);
  };

  const handleOpenEditBlogPost = (post: BlogPost) => {
    const copy: BlogPost = JSON.parse(JSON.stringify(post));
    if (copy.slug && copy.slug.startsWith('new-article-')) {
      copy.slug = slugify(copy.title);
    }
    if (!copy.rawDate && copy.date) {
      try {
        const d = new Date(copy.date);
        if (!isNaN(d.getTime())) {
          copy.rawDate = d.toISOString().split('T')[0];
        }
      } catch {}
    }
    setEditingBlogPost(copy);
    setIsSlugManuallyEdited(Boolean(copy.slug && copy.slug !== slugify(copy.title)));
    // setIsBlogModalOpen(true);
  };

  const handleSaveBlogPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlogPost || !editingBlogPost.title.trim()) return;

    let finalSlug = editingBlogPost.slug?.trim();
    if (!finalSlug || finalSlug.startsWith('new-article-')) {
      finalSlug = slugify(editingBlogPost.title);
    } else {
      finalSlug = slugify(finalSlug);
    }
    if (!finalSlug) {
      finalSlug = `article-${Date.now()}`;
    }
    editingBlogPost.slug = finalSlug;

    if (!editingBlogPost.seoTitle) {
      editingBlogPost.seoTitle = `${editingBlogPost.title} | Origintra Exim Insights`;
    }

    // Default author to currentUser if blank
    if (!editingBlogPost.author.trim() && currentUser) {
      editingBlogPost.author = currentUser.name;
      editingBlogPost.authorRole = currentUser.department || 'Trade Operations';
      editingBlogPost.authorId = currentUser.id;
    }

    AdminStorage.saveBlogPost(editingBlogPost);
    // setIsBlogModalOpen(false);
    setEditingBlogPost(null);
    showToast(`Article "${editingBlogPost.title}" published with clean SEO URL (/blog/${editingBlogPost.slug})!`);
  };

  const handleDeleteBlogPost = (post: BlogPost) => {
    if (window.confirm(`Are you sure you want to delete article "${post.title}"?`)) {
      AdminStorage.deleteBlogPost(post.id);
      showToast(`Article "${post.title}" deleted.`);
    }
  };

  // === USER MANAGEMENT (RBAC) HANDLERS ===
  const handleOpenAddUser = () => {
    setEditingUser({
      id: `usr-${Date.now()}`,
      name: '',
      email: '',
      role: 'author',
      department: 'Commodity Research Analyst',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date().toISOString()
    });
    setNewUserPassword('origintra123');
    setSendEmailOnCreate(true);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(JSON.parse(JSON.stringify(user)));
    setNewUserPassword('');
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.name.trim() || !editingUser.email.trim()) return;

    try {
      const isExisting = users.some(u => u.id === editingUser.id);
      if (isExisting) {
        await AdminStorage.updateUser(editingUser.id, {
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          department: editingUser.department,
          avatar: editingUser.avatar,
          ...(newUserPassword ? { password: newUserPassword } : {})
        });
        showToast(`User "${editingUser.name}" updated successfully.`);
        setIsUserModalOpen(false);
        setEditingUser(null);
        setNewUserPassword('');
      } else {
        const assignedPassword = newUserPassword || 'origintra123';
        await AdminStorage.createUser({
          name: editingUser.name,
          email: editingUser.email,
          password: assignedPassword,
          role: editingUser.role,
          department: editingUser.department,
          avatar: editingUser.avatar
        });

        const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin` : 'https://www.origintra.com/admin';
        const emailPayload: WelcomeEmailPayload = {
          toEmail: editingUser.email.trim(),
          userName: editingUser.name.trim(),
          password: assignedPassword,
          role: editingUser.role,
          department: editingUser.department?.trim() || 'Trade Operations',
          loginUrl: portalUrl,
          adminName: currentUser?.name || 'Origintra Exim Super Administrator'
        };

        // Dispatch email via Nodemailer / mail server (with fallback to client)
        if (sendEmailOnCreate) {
          MailService.dispatchWelcomeEmail(emailPayload).then((res) => {
            if (res.deliveredDirectly) {
              showToast(res.message);
            }
          }).catch(() => {});
        }

        setIsUserModalOpen(false);
        setEditingUser(null);
        setNewUserPassword('');

        // Open credentials confirmation & sharing modal
        setCreatedCredentialsModal(emailPayload);
        showToast(`User "${emailPayload.userName}" created! Credentials prepared.`);
      }
    } catch (err: any) {
      alert(err.message || 'Error saving user.');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('You cannot delete your own currently logged-in account.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete user "${user.name}" (${user.email})?`)) {
      try {
        await AdminStorage.deleteUser(user.id);
        showToast(`User "${user.name}" removed.`);
      } catch (err: any) {
        alert(err.message || 'Error deleting user.');
      }
    }
  };

  // === TEAM MEMBER HANDLERS ===
  const handleToggleLeadershipVisibility = async (newVal: boolean) => {
    setLeadershipVisible(newVal);
    await AdminStorage.setLeadershipVisibility(newVal);
    showToast(
      newVal
        ? 'Leadership & Key People component is now VISIBLE across all devices and indexed by Google.'
        : 'Leadership & Key People component is now HIDDEN across all devices and removed from Google indexing.'
    );
  };

  const handleOpenAddTeamMember = () => {
    setEditingTeamMember({
      id: `team-${Date.now()}`,
      name: '',
      position: 'Executive Trade Specialist',
      role: 'Procurement & Logistics Operations',
      photo: '/assets/team/director.jpg',
      credentials: '10+ Years International Trade',
      specialization: 'Commodity Inspection & Export Staging',
      bio: '',
      linkedIn: ''
    });
    setIsTeamModalOpen(true);
  };

  const handleOpenEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember(JSON.parse(JSON.stringify(member)));
    setIsTeamModalOpen(true);
  };

  const handleSaveTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeamMember || !editingTeamMember.name.trim()) return;

    AdminStorage.saveTeamMember(editingTeamMember);
    setIsTeamModalOpen(false);
    setEditingTeamMember(null);
    showToast(`Team profile for "${editingTeamMember.name}" saved successfully!`);
  };

  const handleDeleteTeamMember = (member: TeamMember) => {
    if (window.confirm(`Are you sure you want to remove "${member.name}" from the leadership roster?`)) {
      AdminStorage.deleteTeamMember(member.id);
      showToast(`Removed "${member.name}".`);
    }
  };

  // === BUYER TESTIMONIAL HANDLERS ===
  const handleOpenAddTestimonial = () => {
    setEditingTestimonial({
      id: `t-${Date.now()}`,
      author: '',
      role: 'Head of Agricultural Procurement',
      company: '',
      country: 'United Arab Emirates',
      destinationPort: 'Port of Jebel Ali, UAE',
      commodity: 'Guntur S17 Whole Chillies & Powder',
      volumeOrType: 'Commercial FCL Containers',
      rating: 5,
      testimonial: '',
      avatar: '',
      createdAt: new Date().toISOString()
    });
    setIsTestimonialModalOpen(true);
  };

  const handleOpenEditTestimonial = (item: Testimonial) => {
    setEditingTestimonial(JSON.parse(JSON.stringify(item)));
    setIsTestimonialModalOpen(true);
  };

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial || !editingTestimonial.author.trim() || !editingTestimonial.testimonial.trim()) {
      showToast('Please provide an author name and testimonial statement.');
      return;
    }

    AdminStorage.saveTestimonial(editingTestimonial);
    setIsTestimonialModalOpen(false);
    setEditingTestimonial(null);
    showToast(`Testimonial by "${editingTestimonial.author}" saved & updated on live marquee!`);
  };

  const handleDeleteTestimonial = (item: Testimonial) => {
    if (window.confirm(`Are you sure you want to delete the testimonial by "${item.author}" (${item.company})?`)) {
      AdminStorage.deleteTestimonial(item.id);
      showToast(`Deleted testimonial by "${item.author}".`);
    }
  };

  const handleResetTestimonials = async () => {
    if (window.confirm('Reset all buyer testimonials to factory export references? Any custom testimonials will be replaced.')) {
      await AdminStorage.resetTestimonials();
      showToast('Client testimonials reset to defaults.');
    }
  };

  const handleOpenTestimonialPhotoGallery = () => {
    setGalleryModalTarget('testimonial');
    setGalleryModalCategory('all');
    setGalleryModalTitle('Select Avatar / Portrait from Gallery');
    setIsGalleryModalOpen(true);
  };

  // === GALLERY HANDLERS ===
  const teamPortraits = useMemo(() => {
    return galleryImages.filter(img => img.category === 'team');
  }, [galleryImages]);

  const handleOpenTeamPhotoGallery = () => {
    setGalleryModalTarget('team');
    setGalleryModalCategory('team');
    setGalleryModalTitle('Select Leadership Portrait from Gallery');
    setIsGalleryModalOpen(true);
  };

  const handleOpenProductImageGallery = () => {
    setGalleryModalTarget('product');
    setGalleryModalCategory('products');
    setGalleryModalTitle('Select Product Image from Gallery');
    setIsGalleryModalOpen(true);
  };

  const handleOpenBlogImageGallery = () => {
    setGalleryModalTarget('blog');
    setGalleryModalCategory('all');
    setGalleryModalTitle('Select Blog Cover Image from Gallery');
    setIsGalleryModalOpen(true);
  };

  const handleSelectImageFromGallery = (url: string, title?: string) => {
    if (galleryModalTarget === 'team' && editingTeamMember) {
      setEditingTeamMember({ ...editingTeamMember, photo: url });
      showToast(`Selected portrait: ${title || 'Leader Photo'}`);
    } else if (galleryModalTarget === 'product' && editingProduct) {
      setEditingProduct({ ...editingProduct, image: url });
      showToast(`Selected photo: ${title || 'Product Image'}`);
    } else if (galleryModalTarget === 'blog' && editingBlogPost) {
      setEditingBlogPost({ ...editingBlogPost, image: url });
      showToast(`Selected cover: ${title || 'Blog Cover'}`);
    } else if (galleryModalTarget === 'testimonial' && editingTestimonial) {
      setEditingTestimonial({ ...editingTestimonial, avatar: url });
      showToast(`Selected avatar: ${title || 'Buyer Portrait'}`);
    }
  };

  const handleDevicePhotoUpload = async (file: File, target: 'team' | 'product' | 'blog' | 'testimonial' | 'profile') => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }
    try {
      showToast('Processing & uploading photo...');
      
      // 1. Try real server upload to /api/upload.php first
      let serverImageUrl: string | null = null;
      try {
        serverImageUrl = await AdminStorage.uploadImageFile(file);
      } catch (uploadErr) {
        console.warn('Server upload unavailable:', uploadErr);
      }

      // 2. If server upload failed, downscale image to lightweight base64
      let finalImageUrl = serverImageUrl;
      if (!finalImageUrl) {
        finalImageUrl = await compressImage(file, 900, 0.76);
      }

      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const newImg = await AdminStorage.addCustomGalleryImage({
        url: finalImageUrl,
        title: cleanName,
        category: target === 'team' ? 'team' : target === 'product' ? 'products' : 'uploads',
        tag: target === 'team' ? 'Leader' : target === 'testimonial' ? 'Buyer' : target === 'profile' ? 'Avatar' : 'Upload'
      });
      if (target === 'team' && editingTeamMember) {
        setEditingTeamMember({ ...editingTeamMember, photo: newImg.url });
      } else if (target === 'product' && editingProduct) {
        setEditingProduct({ ...editingProduct, image: newImg.url });
      } else if (target === 'blog' && editingBlogPost) {
        setEditingBlogPost({ ...editingBlogPost, image: newImg.url });
      } else if (target === 'testimonial' && editingTestimonial) {
        setEditingTestimonial({ ...editingTestimonial, avatar: newImg.url });
      } else if (target === 'profile') {
        setProfileForm(prev => ({ ...prev, avatar: newImg.url }));
      }
      showToast('Photo uploaded and set successfully!');
    } catch (err) {
      console.error('Photo upload failed:', err);
      showToast('Failed to upload photo. Please try again.');
    }
  };

  // === PROFILE SAVE HANDLER ===
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!profileForm.name.trim()) {
      showToast('Profile name cannot be blank.');
      return;
    }
    if (!profileForm.email.trim() || !profileForm.email.includes('@')) {
      showToast('Please enter a valid corporate email address.');
      return;
    }
    if (profileForm.newPassword) {
      if (profileForm.newPassword.length < 6) {
        showToast('New password must be at least 6 characters.');
        return;
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        showToast('New passwords do not match. Please verify.');
        return;
      }
    }

    setIsSavingProfile(true);
    try {
      const updated = await AdminStorage.updateUserProfile(currentUser.id, {
        name: profileForm.name,
        email: profileForm.email,
        department: profileForm.department,
        phone: profileForm.phone,
        bio: profileForm.bio,
        avatar: profileForm.avatar,
        newPassword: profileForm.newPassword || undefined,
      });

      if (updated) {
        setCurrentUser(updated);
        setProfileForm(prev => ({
          ...prev,
          newPassword: '',
          confirmPassword: '',
        }));
        showToast('Profile updated successfully!');
      } else {
        showToast('Failed to update profile.');
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      showToast(err?.message || 'Error updating profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // === INQUIRY HANDLERS ===
  const handleUpdateInquiryStatus = (id: string, status: Inquiry['status']) => {
    AdminStorage.updateInquiryStatus(id, status);
    showToast(`Lead status updated to ${status.toUpperCase()}.`);
  };

  const handleDeleteInquiry = (id: string) => {
    if (window.confirm('Delete this inquiry record?')) {
      AdminStorage.deleteInquiry(id);
      if (viewingInquiry?.id === id) {
        setViewingInquiry(null);
        setIsReplyingEmail(false);
      }
      showToast('Inquiry deleted.');
    }
  };

  const applyEmailTemplate = (template: 'acknowledgement' | 'quote' | 'sample', inq = viewingInquiry) => {
    if (!inq) return;
    const author = currentUser?.name || 'Patel Arsh';
    const dept = currentUser?.department || 'Managing Director & Global Head of Trade';
    const phone = currentUser?.phone || '+91 70691 82990';

    if (template === 'acknowledgement') {
      setEmailReplySubject(`Re: Commercial Inquiry for ${inq.product} - Origintra Exim`);
      setEmailReplyMessage(`Dear ${inq.fullName},\n\nThank you for reaching out to Origintra Exim regarding your requirement for ${inq.product}.\n\nWe have received your specifications for ${inq.quantityRequired}${inq.destinationPort ? ` discharging at ${inq.destinationPort}` : ''}.\n\nOur export desk is currently preparing the latest laboratory Certificate of Analysis (COA) and competitive FOB Mundra / CIF commercial quotation for you.\n\nWe will revert shortly with the complete documentation.\n\nWarm regards,\n${author}\n${dept}\nOrigintra Exim Private Limited\nPhone / WhatsApp: ${phone} | export@origintra.com\nwww.origintra.com`);
    } else if (template === 'quote') {
      setEmailReplySubject(`Quotation & Specifications: ${inq.product} - Origintra Exim`);
      setEmailReplyMessage(`Dear ${inq.fullName},\n\nFollowing up on your commercial inquiry for ${inq.product} (${inq.quantityRequired}), we are pleased to inform you that our export desk has prepared your custom pricing dossier.\n\nKey Export Parameters:\n- Commodity: ${inq.product}\n- Volume Required: ${inq.quantityRequired}\n- Quality: Export Grade 1 (Machine Cleaned / Sortex Purity)\n- Origin: Gujarat / Rajasthan, India\n- Port of Loading: Mundra / Kandla Port, India\n- Inspection: SGS / Geo-Chem certified prior to vessel stuffing\n\nPlease let us know if you would like us to send the detailed Proforma Invoice (PI) and laboratory analysis sheet.\n\nWarm regards,\n${author}\n${dept}\nOrigintra Exim Private Limited\nPhone / WhatsApp: ${phone} | export@origintra.com\nwww.origintra.com`);
    } else if (template === 'sample') {
      setEmailReplySubject(`Complimentary Sample Sourcing: ${inq.product} - Origintra Exim`);
      setEmailReplyMessage(`Dear ${inq.fullName},\n\nRegarding your inquiry for ${inq.product}, we would be delighted to courier an authentic commercial sample (100g - 500g) directly to your facility for physical and sensory quality appraisal.\n\nPlease confirm your preferred courier delivery address and recipient contact details, and our logistics team will dispatch the sample with DHL/FedEx tracking.\n\nWarm regards,\n${author}\n${dept}\nOrigintra Exim Private Limited\nPhone / WhatsApp: ${phone} | export@origintra.com\nwww.origintra.com`);
    }
  };

  const handleSendEmailReply = async () => {
    if (!viewingInquiry || !viewingInquiry.businessEmail) {
      showToast('Client email address is missing.');
      return;
    }
    if (!emailReplyMessage.trim()) {
      showToast('Please enter your reply message before sending.');
      return;
    }

    setIsSendingEmailReply(true);
    try {
      const author = currentUser?.name || 'Patel Arsh';
      const dept = currentUser?.department || 'Managing Director & Global Head of Trade';
      const phone = currentUser?.phone || '+91 70691 82990';
      const subject = emailReplySubject.trim() || `Re: Inquiry regarding ${viewingInquiry.product} - Origintra Exim`;

      const escapedMessage = emailReplyMessage
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: #0A1C3E; padding: 24px 28px; color: #ffffff;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td>
                  <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">ORIGINTRA EXIM</h2>
                  <p style="margin: 4px 0 0; font-size: 11px; color: #38BDF8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Global Export Trade Desk</p>
                </td>
                <td style="text-align: right;">
                  <span style="background: #0284c7; color: #ffffff; font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 9999px; text-transform: uppercase;">
                    Official Response
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <div style="padding: 28px; color: #334155; line-height: 1.6; font-size: 14px;">
            <div style="background-color: #f8fafc; border-left: 4px solid #0070E0; padding: 18px 20px; border-radius: 6px; margin-bottom: 24px; font-size: 14px; color: #1e293b; white-space: pre-wrap; line-height: 1.6;">${escapedMessage}</div>

            <div style="background: #f1f5f9; padding: 14px 18px; border-radius: 8px; margin: 24px 0; font-size: 12px; color: #475569; border: 1px solid #e2e8f0;">
              <strong style="color: #0f172a; display: block; margin-bottom: 6px;">Reference Inquiry Details:</strong>
              &bull; <strong>Commodity:</strong> ${viewingInquiry.product}<br/>
              &bull; <strong>Quantity / Volume:</strong> ${viewingInquiry.quantityRequired}<br/>
              ${viewingInquiry.destinationPort ? `&bull; <strong>Destination Port:</strong> ${viewingInquiry.destinationPort}<br/>` : ''}
              &bull; <strong>Lead ID:</strong> <code style="font-family: monospace; color: #0070E0;">${viewingInquiry.id}</code>
            </div>

            <p style="margin-top: 24px; margin-bottom: 4px; font-size: 13px; color: #64748b;">Best Regards,</p>
            <p style="margin: 0; font-weight: 700; color: #0A1C3E; font-size: 15px;">${author}</p>
            <p style="margin: 2px 0 0; font-size: 12px; color: #64748b; font-weight: 500;">${dept} &bull; Origintra Exim Private Limited</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #0070E0;">${phone} | export@origintra.com</p>
          </div>

          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 28px; text-align: center; font-size: 11px; color: #94a3b8;">
            Origintra Exim Private Limited &bull; Verified Indian Spices, Agro Commodities & Global Supply Chain &bull; <a href="https://www.origintra.com" style="color: #0070E0; text-decoration: none;">www.origintra.com</a>
          </div>
        </div>
      `;

      const result = await MailService.sendDirectEmail({
        to: viewingInquiry.businessEmail.trim(),
        subject,
        body: emailReplyMessage.trim(),
        html: htmlContent
      });

      if (result.success) {
        if (viewingInquiry.status === 'new') {
          handleUpdateInquiryStatus(viewingInquiry.id, 'contacted');
          setViewingInquiry({ ...viewingInquiry, status: 'contacted' });
        }
        setIsReplyingEmail(false);
        showToast(`Email reply sent successfully to ${viewingInquiry.businessEmail}!`);
      } else {
        showToast(`Email delivery error: ${result.message}`);
      }
    } catch (err: any) {
      console.error('Email send error:', err);
      showToast(`Error sending email: ${err?.message || err}`);
    } finally {
      setIsSendingEmailReply(false);
    }
  };

  // === COMPANY CONFIG SAVE ===
  const handleSaveCompanyConfig = (e: React.FormEvent) => {
    e.preventDefault();
    AdminStorage.saveCompanyConfig(companyConfig);
    showToast('Company profile & contact details updated!');
  };

  // Toggle Statutory Licensing Notice (push toast & header alert strip)
  const handleToggleLicensingNotice = (enabled: boolean) => {
    const updated = { ...companyConfig, licensingNoticeEnabled: enabled };
    setCompanyConfig(updated);
    AdminStorage.saveCompanyConfig(updated);
    showToast(enabled ? 'Statutory licensing notice enabled (visible to visitors).' : 'Statutory licensing notice disabled (hidden from website).');
  };

  // ==========================================
  // 1. LOGIN SCREEN (If not authenticated)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
        
        {/* Subtle World Map background watermark */}
        <div 
          className="absolute inset-0 opacity-10 bg-repeat pointer-events-none" 
          style={{ backgroundImage: `url('/assets/brand/dotted-world-map.svg')`, backgroundSize: '700px auto' }}
        />

        <div className="w-full max-w-md relative z-10 my-8">
          <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-7 sm:p-9 relative">
            
            {/* Language Selector Indicator */}
            <div className="flex items-center justify-end space-x-1 text-slate-500 text-xs font-semibold mb-2">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>EN</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {/* Card Header with Centered Official Logo */}
            <div className="text-center">
              <img
                src="/assets/logo/origintra-official-logo.webp?v=2"
                alt="Origintra Exim"
                className="h-12 sm:h-14 w-auto mx-auto object-contain mb-3"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/logo/origintra-official-logo.png?v=2';
                }}
              />
              
              <h2 className="text-2xl font-display font-extrabold text-[#0A1C3E]">
                Admin <span className="text-[#0070E0]">Portal</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sign in to manage your export business operations.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4 mt-6">
              
              {/* Field 1: Corporate Email Address */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. arsh@origintra.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0070E0] focus:ring-2 focus:ring-[#0070E0]/15 font-medium transition"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs font-semibold text-[#0070E0] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0070E0] focus:ring-2 focus:ring-[#0070E0]/15 font-medium transition"
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-slate-300 text-[#0070E0] focus:ring-[#0070E0]"
                  />
                  <span>Keep me signed in</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Please contact administrative IT desk at info@origintra.com for credential resets.')}
                  className="text-[#0070E0] hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#0A1C3E] hover:bg-[#061228] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-blue-900/20 transition-all flex items-center justify-center space-x-2 cursor-pointer group"
              >
                <span>Sign In to Admin Portal</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Return to Public Website */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
                >
                  <span>← Return to Public Website</span>
                </button>
              </div>

            </form>

          </div>
        </div>

      </div>
    );
  }

  // ==========================================
  // 2. MAIN ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-[#0A1C3E] text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500/40 flex items-center space-x-3 text-sm animate-in fade-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (STICKY FULL-HEIGHT ON DESKTOP, DRAWER ON MOBILE) */}
      {/* ========================================================= */}
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/50 z-40 md:hidden backdrop-blur-2xs"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out
        md:static md:h-screen md:sticky md:top-0 md:z-30
        ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl pointer-events-auto' : '-translate-x-full pointer-events-none md:pointer-events-auto'}
        ${sidebarOpen ? 'md:translate-x-0 md:w-64 md:opacity-100' : 'md:w-0 md:border-r-0 md:opacity-0 md:overflow-hidden md:pointer-events-none'}
      `}>
        <div className="w-64 min-w-[256px] flex flex-col justify-between h-full">
          {/* Top: Brand Logo Header */}
          <div className="h-[70px] px-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center min-w-0">
              <img
                src="/assets/logo/origintra-official-logo.webp?v=2"
                alt="Origintra Exim"
                className="h-10 sm:h-11 w-auto max-w-[170px] object-contain block"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/logo/origintra-official-logo.png?v=2';
                }}
              />
            </div>
            <button
              onClick={handleToggleSidebar}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer shrink-0"
              title="Close / Hide Sidebar"
              aria-label="Close / Hide Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        {/* Middle: Navigation Menu Items */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-1.5 scrollbar-thin">
          {/* Dashboard */}
          <button
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#0A1C3E] text-white shadow-xs font-bold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
          </button>

          {/* Product Catalog */}
          {canAccessProducts && (
            <button
              onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#0A1C3E] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Package className="w-4 h-4" />
                <span>Product Catalog</span>
              </div>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-sky-100 text-[#0070E0]'
              }`}>
                {products.length}
              </span>
            </button>
          )}

          {/* Blog & Articles */}
          {canAccessBlog && (
            <button
              onClick={() => { setActiveTab('blog'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'blog'
                  ? 'bg-[#0A1C3E] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4" />
                <span>Blog & Articles</span>
              </div>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                activeTab === 'blog' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {blogPosts.length}
              </span>
            </button>
          )}

          {/* Leadership Team */}
          {canAccessTeam && (
            <button
              onClick={() => { setActiveTab('team'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-[#0A1C3E] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4" />
                <span>Leadership Team</span>
              </div>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                activeTab === 'team' ? 'bg-white/20 text-white' : 'bg-sky-100 text-[#0070E0]'
              }`}>
                {teamMembers.length}
              </span>
            </button>
          )}

          {/* Client Reviews */}
          {canAccessTestimonials && (
            <button
              onClick={() => { setActiveTab('testimonials'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'testimonials'
                  ? 'bg-[#0A1C3E] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Quote className="w-4 h-4" />
                <span>Client Reviews</span>
              </div>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                activeTab === 'testimonials' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {testimonials.length}
              </span>
            </button>
          )}

          {/* Media Gallery */}
          {canAccessGallery && (
            <button
              onClick={() => { setActiveTab('gallery'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-[#0A1C3E] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ImageIcon className="w-4 h-4" />
                <span>Media Gallery</span>
              </div>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                activeTab === 'gallery' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {galleryImages.length}
              </span>
            </button>
          )}

          {/* Inquiries & Leads */}
          {canAccessInquiries && (
            <button
              onClick={() => { setActiveTab('inquiries'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-[#0A1C3E] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Inbox className="w-4 h-4" />
                <span>Inquiries & Leads</span>
              </div>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                activeTab === 'inquiries' ? 'bg-white/20 text-white' : 'bg-sky-100 text-[#0070E0]'
              }`}>
                {inquiries.length}
              </span>
            </button>
          )}

          {/* User Management */}
          {canAccessUsers && (
            <button
              onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#0A1C3E] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <UserCheck className="w-4 h-4" />
                <span>User Management</span>
              </div>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
              }`}>
                {users.length}
              </span>
            </button>
          )}

          {/* Website & Contact */}
          {canAccessSettings && (
            <button
              onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#0A1C3E] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Settings className="w-4 h-4" />
                <span>Website & Contact</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          )}
          {/* Legal Policies */}
          {canAccessLegal && (
            <button
              onClick={() => { setActiveTab('legal'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'legal'
                  ? 'bg-[#0A1C3E] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Scale className="w-4 h-4 text-sky-500" />
                <span>Legal Policies</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'legal' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                4
              </span>
            </button>
          )}

          {/* Edit Profile */}
          <button
            onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#0A1C3E] text-white shadow-xs font-bold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <UserIcon className="w-4 h-4" />
              <span>Edit Profile</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/50">
              Account
            </span>
          </button>
        </div>

        {/* Bottom: Sidebar System Meta */}
        <div className="p-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-500 bg-slate-50/50">
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-500">DB Engine</span>
            <strong className="text-slate-800 font-semibold">{supabase.isConfigured() ? 'Supabase' : 'Cloud DB'}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-500">Live Sync</span>
            <strong className="text-emerald-600 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-500">WhatsApp</span>
            <strong className="text-slate-700 font-mono font-semibold">{companyConfig.phone || '+917069182990'}</strong>
          </div>
        </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. RIGHT WORKSPACE CONTAINER (HEADER + MAIN CONTENT) */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Clean White Header Bar */}
        <header className="h-[70px] bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          
          {/* Left: 3-Line Sidebar Toggle & Global Search */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <button
              onClick={handleToggleSidebar}
              className={`p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer shrink-0 border border-slate-200/80 shadow-2xs items-center justify-center ${sidebarOpen ? 'flex md:hidden' : 'flex'}`}
              aria-label="Toggle Sidebar"
              title={sidebarOpen ? "Close Sidebar (Hide)" : "Show Sidebar"}
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>

            <img
              src="/assets/logo/origintra-official-logo.webp?v=2"
              alt="Origintra Exim"
              className={`h-6 sm:h-7 w-auto object-contain shrink-0 ${sidebarOpen ? 'md:hidden' : 'block'}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/logo/origintra-official-logo.png?v=2';
              }}
            />

            {/* Desktop / Tablet Search */}
            <div className="relative hidden sm:block sm:w-60 md:w-80 lg:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, inquiries, articles..."
                value={dashboardSearchQuery}
                onChange={(e) => setDashboardSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0070E0] focus:bg-white focus:ring-2 focus:ring-[#0070E0]/15 transition font-medium"
              />
              {dashboardSearchQuery && (
                <>
                  <button
                    onClick={() => setDashboardSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-1 text-xs space-y-3">
                    {searchResults.products.length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1">Products</div>
                        {searchResults.products.map(p => (
                          <div
                            key={p.id}
                            onClick={() => { setActiveTab('products'); setDashboardSearchQuery(''); }}
                            className="p-2 rounded-lg hover:bg-sky-50 flex items-center justify-between cursor-pointer"
                          >
                            <span className="font-semibold text-slate-800">{p.name}</span>
                            <span className="text-[10px] text-[#0070E0]">{p.category}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.blog.length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1">Articles</div>
                        {searchResults.blog.map(b => (
                          <div
                            key={b.id}
                            onClick={() => { setActiveTab('blog'); setDashboardSearchQuery(''); }}
                            className="p-2 rounded-lg hover:bg-purple-50 flex items-center justify-between cursor-pointer"
                          >
                            <span className="font-semibold text-slate-800 truncate">{b.title}</span>
                            <span className="text-[10px] text-purple-600">{b.category}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.inquiries.length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1">Inquiries</div>
                        {searchResults.inquiries.map(i => (
                          <div
                            key={i.id}
                            onClick={() => { setViewingInquiry(i); setActiveTab('inquiries'); setDashboardSearchQuery(''); }}
                            className="p-2 rounded-lg hover:bg-emerald-50 flex items-center justify-between cursor-pointer"
                          >
                            <div>
                              <span className="font-semibold text-slate-800 block">{i.fullName}</span>
                              <span className="text-[10px] text-slate-500">{i.product}</span>
                            </div>
                            <span className="text-[10px] text-emerald-600">{i.status}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.products.length === 0 && searchResults.blog.length === 0 && searchResults.inquiries.length === 0 && (
                      <div className="py-3 text-center text-slate-400 text-xs">
                        No records matching "{dashboardSearchQuery}".
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Search Icon Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="sm:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer shrink-0"
              title="Search Portal"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Notifications, User Profile, Live Site, Logout */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative flex items-center justify-center cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-600" />
                {activeNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 min-w-3.5 h-3.5 sm:min-w-4 sm:h-4 px-0.5 sm:px-1 bg-red-500 text-white text-[8px] sm:text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs animate-in zoom-in">
                    {activeNotifications.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">Notifications</span>
                      {activeNotifications.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                          {activeNotifications.length} New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5">
                      {activeNotifications.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllNotifications}
                          className="text-[10px] text-slate-500 hover:text-red-600 font-semibold transition cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                      <button 
                        onClick={() => setNotificationsOpen(false)}
                        className="text-[10px] text-[#0070E0] font-semibold hover:underline cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  <div className="py-2.5 space-y-2 text-xs max-h-80 overflow-y-auto scrollbar-thin">
                    {activeNotifications.length === 0 ? (
                      <div className="py-7 text-center text-slate-400">
                        <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="font-bold text-xs text-slate-800">All Caught Up!</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          No pending buyer inquiries or unread notifications.
                        </p>
                      </div>
                    ) : (
                      activeNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            setViewingInquiry(notif.rawInquiry);
                            setActiveTab('inquiries');
                            setNotificationsOpen(false);
                          }}
                          className="p-3 rounded-xl bg-sky-50/70 hover:bg-sky-100/80 border border-sky-100 flex items-start gap-2.5 transition cursor-pointer group relative"
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#0070E0]/10 text-[#0070E0] flex items-center justify-center shrink-0 mt-0.5">
                            <Inbox className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900 truncate">{notif.title}</p>
                              {notif.isNew && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0070E0] shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                              {notif.time}
                            </span>
                          </div>

                          {/* Cancel / Remove Option */}
                          <button
                            type="button"
                            onClick={(e) => handleDismissNotification(notif.id, e)}
                            className="absolute top-2.5 right-2.5 w-5 h-5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                            title="Cancel / Remove Notification"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill with Interactive Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(prev => !prev)}
                className={`flex items-center space-x-2 pl-1.5 sm:pl-2.5 pr-2 py-1.5 border-l border-slate-200 rounded-xl hover:bg-slate-100/70 transition cursor-pointer select-none text-left ${
                  userMenuOpen ? 'bg-slate-100/90 ring-1 ring-slate-300' : ''
                }`}
                title="Account Settings & Profile"
              >
                <div className="relative shrink-0">
                  <img
                    src={currentUser?.avatar || '/assets/team/director.jpg'}
                    alt={currentUser?.name || 'Patel Arsh'}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-slate-100 bg-slate-100 shadow-2xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/team/director.jpg';
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight max-w-[130px] truncate">
                      {currentUser?.name || 'Patel Arsh'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300/40">
                      {currentUser?.role?.toUpperCase() || 'ADMIN'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium max-w-[150px] truncate">
                    {currentUser?.department || 'MD & Founder'}
                  </p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden lg:block transition-transform duration-200 ${userMenuOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>

              {/* Dropdown Menu Popup */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100">
                  {/* User Overview */}
                  <div className="px-4 py-3 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                      <img
                        src={currentUser?.avatar || '/assets/team/director.jpg'}
                        alt={currentUser?.name || 'Patel Arsh'}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-2xs shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/team/director.jpg';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {currentUser?.name || 'Patel Arsh'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {currentUser?.email || 'arsh@origintra.com'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span className="text-[10px] font-semibold text-slate-600 truncate">
                            {currentUser?.department || 'MD & Founder'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2 Options as explicitly requested: Edit Profile & Logout */}
                  <div className="p-1.5 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('profile');
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 transition cursor-pointer text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <span className="block font-bold text-slate-800 group-hover:text-blue-700">Edit Profile</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Name, photo, email, phone & designation</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50/80 transition cursor-pointer text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <span className="block font-bold text-red-600">Logout</span>
                        <span className="block text-[10px] text-red-400 font-normal">Sign out of admin session</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Live Site */}
            <button
              onClick={() => onNavigate('home')}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
              title="View Live Public Site"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Live Site</span>
            </button>

          </div>
        </header>

        {/* Mobile Search Dropdown Bar */}
        {mobileSearchOpen && (
          <div className="sm:hidden px-4 py-2.5 bg-white border-b border-slate-200 sticky top-[70px] z-19 shadow-xs animate-in fade-in slide-in-from-top-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Search products, inquiries, articles..."
                value={dashboardSearchQuery}
                onChange={(e) => setDashboardSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0070E0] focus:bg-white transition"
              />
              {dashboardSearchQuery && (
                <button
                  onClick={() => setDashboardSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {dashboardSearchQuery && (
              <div className="mt-2 bg-white rounded-xl border border-slate-200 shadow-lg p-2 max-h-60 overflow-y-auto text-xs space-y-2">
                {searchResults.products.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1">Products</div>
                    {searchResults.products.map(p => (
                      <div
                        key={p.id}
                        onClick={() => { setActiveTab('products'); setDashboardSearchQuery(''); setMobileSearchOpen(false); }}
                        className="p-2 rounded-lg hover:bg-sky-50 flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-semibold text-slate-800">{p.name}</span>
                        <span className="text-[10px] text-[#0070E0]">{p.category}</span>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.blog.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1">Articles</div>
                    {searchResults.blog.map(b => (
                      <div
                        key={b.id}
                        onClick={() => { setActiveTab('blog'); setDashboardSearchQuery(''); setMobileSearchOpen(false); }}
                        className="p-2 rounded-lg hover:bg-purple-50 flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-semibold text-slate-800 truncate">{b.title}</span>
                        <span className="text-[10px] text-purple-600">{b.category}</span>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.inquiries.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1">Inquiries</div>
                    {searchResults.inquiries.map(i => (
                      <div
                        key={i.id}
                        onClick={() => { setViewingInquiry(i); setActiveTab('inquiries'); setDashboardSearchQuery(''); setMobileSearchOpen(false); }}
                        className="p-2 rounded-lg hover:bg-emerald-50 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 block">{i.fullName}</span>
                          <span className="text-[10px] text-slate-500">{i.product}</span>
                        </div>
                        <span className="text-[10px] text-emerald-600">{i.status}</span>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.products.length === 0 && searchResults.blog.length === 0 && searchResults.inquiries.length === 0 && (
                  <div className="py-2 text-center text-slate-400 text-xs">
                    No records matching "{dashboardSearchQuery}".
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto overflow-x-hidden space-y-6">
          
          {/* ======================================= */}
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {/* ======================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 sm:space-y-7">
              
              {/* 1. Hero Welcome Banner with Cargo Ship Background */}
              <div className="relative rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs bg-gradient-to-r from-sky-50 via-sky-100/50 to-blue-200/30 min-h-[170px] flex items-center p-6 sm:p-8">
                {/* Dotted World Map overlay watermark */}
                <div 
                  className="absolute inset-0 opacity-15 bg-repeat pointer-events-none" 
                  style={{ backgroundImage: `url('/assets/brand/dotted-world-map.svg')`, backgroundSize: '600px auto' }}
                />
                
                {/* Container Cargo Ship Image on Right with soft gradient blend */}
                <div className="absolute right-0 top-0 bottom-0 w-2/5 sm:w-1/2 pointer-events-none overflow-hidden hidden sm:block">
                  <img
                    src="/assets/admin/admin-hero-banner.jpg"
                    alt="Ocean Cargo Container Ship"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-50 via-transparent to-transparent" />
                </div>

                {/* Left Typography */}
                <div className="relative z-10 max-w-xl">
                  <span className="text-xs sm:text-sm font-semibold text-slate-600 block">
                    Welcome Back,
                  </span>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-[#0A1C3E] tracking-tight mt-0.5 flex items-center gap-2">
                    <span>{currentUser?.name || 'Patel Arsh'}</span>
                    <span className="text-2xl sm:text-3xl animate-bounce">👋</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-medium">
                    Manage Origintra Exim's export commodities portfolio, blog thought leadership, and incoming buyer RFQs.
                  </p>
                </div>

                {/* Floating Right Banner Text & Action */}
                <div className="hidden lg:flex flex-col items-end absolute right-8 z-10 text-right space-y-2">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 drop-shadow-xs leading-tight">
                    <p>Connecting Markets.</p>
                    <p>Moving Possibilities.</p>
                  </div>
                  <button
                    onClick={() => onNavigate('about')}
                    className="w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition hover:scale-105 cursor-pointer border border-slate-200/60"
                    title="View Global Export Infrastructure"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 2. Stat Metric Cards (6 Responsive Cards Grid) */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                
                {/* Card 1: Active Products */}
                <div
                  onClick={() => setActiveTab('products')}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 cursor-pointer hover:border-blue-400 hover:shadow-md transition relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0070E0] border border-sky-100 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">Active Products</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
                    {products.length}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <span className="text-emerald-600 font-semibold">{productCategoriesCount} Categories</span>
                    <span>• {products.length} Spices</span>
                  </div>
                  <Package className="w-12 h-12 text-slate-100 absolute -right-2 -bottom-2 pointer-events-none group-hover:scale-110 transition-transform" />
                </div>

                {/* Card 2: Published Articles */}
                <div
                  onClick={() => setActiveTab('blog')}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 cursor-pointer hover:border-purple-400 hover:shadow-md transition relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">Published Articles</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
                    {blogPosts.length}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <span className="text-purple-600 font-semibold">{blogTopicsCount} Topics</span>
                    <span>• {blogPosts.length} Articles</span>
                  </div>
                  <FileText className="w-12 h-12 text-slate-100 absolute -right-2 -bottom-2 pointer-events-none group-hover:scale-110 transition-transform" />
                </div>

                {/* Card 3: Leadership Roster */}
                <div
                  onClick={() => setActiveTab('team')}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 cursor-pointer hover:border-sky-400 hover:shadow-md transition relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0070E0] border border-sky-100 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">Leadership Roster</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
                    {teamMembers.length}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <span className={`font-semibold ${leadershipVisible ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {leadershipVisible ? 'Live on Site' : 'Hidden'}
                    </span>
                    <span>• {teamMembers.length} Leaders</span>
                  </div>
                  <Users className="w-12 h-12 text-slate-100 absolute -right-2 -bottom-2 pointer-events-none group-hover:scale-110 transition-transform" />
                </div>

                {/* Card 4: Media Gallery */}
                <div
                  onClick={() => setActiveTab('gallery')}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 cursor-pointer hover:border-indigo-400 hover:shadow-md transition relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">Media Gallery</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
                    {galleryImages.length}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <span className="text-indigo-600 font-semibold">{galleryStats.prod} Products</span>
                    <span>• {galleryStats.team} Leaders</span>
                  </div>
                  <ImageIcon className="w-12 h-12 text-slate-100 absolute -right-2 -bottom-2 pointer-events-none group-hover:scale-110 transition-transform" />
                </div>

                {/* Card 5: Buyer Inquiries */}
                <div
                  onClick={() => setActiveTab('inquiries')}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 cursor-pointer hover:border-orange-400 hover:shadow-md transition relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">Buyer Inquiries</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
                    {inquiries.length}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <span className="text-orange-600 font-semibold">{newInquiriesCount} New</span>
                    <span>{newInquiriesCount === 1 ? 'lead' : 'leads'} • {inquiries.length} Total</span>
                  </div>
                  <Mail className="w-12 h-12 text-slate-100 absolute -right-2 -bottom-2 pointer-events-none group-hover:scale-110 transition-transform" />
                </div>

                {/* Card 6: Client Reviews */}
                <div
                  onClick={() => setActiveTab('testimonials')}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 cursor-pointer hover:border-amber-400 hover:shadow-md transition relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                      <Quote className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">Client Reviews</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
                    {testimonials.length}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <span className="text-amber-600 font-semibold">{testimonialsRating}★ Rating</span>
                    <span>• {testimonials.length} Reviews</span>
                  </div>
                  <Quote className="w-12 h-12 text-slate-100 absolute -right-2 -bottom-2 pointer-events-none group-hover:scale-110 transition-transform" />
                </div>

              </div>

              {/* 3. Middle Section: Recent Inquiries Table & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7">
                
                {/* Recent Buyer Inquiries & Quotes Table */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold font-display text-slate-900">
                        Recent Buyer Inquiries & Quotes
                      </h2>
                      <p className="text-xs text-slate-500">
                        Overseas buyers requesting FCL rates and specifications.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('inquiries')}
                      className="text-xs font-semibold text-[#0070E0] hover:underline"
                    >
                      View All Leads ({inquiries.length}) →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="pb-3 w-8">#</th>
                          <th className="pb-3">BUYER & COMPANY</th>
                          <th className="pb-3">PRODUCT</th>
                          <th className="pb-3">COUNTRY</th>
                          <th className="pb-3">QUANTITY</th>
                          <th className="pb-3">STATUS</th>
                          <th className="pb-3 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inquiries.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400">
                              <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                              <p className="font-semibold text-xs text-slate-600">No buyer inquiries yet.</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">Incoming RFQs submitted through website forms appear here in real time.</p>
                            </td>
                          </tr>
                        ) : (
                          inquiries.slice(0, 5).map((inq, idx) => (
                          <tr key={inq.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 text-slate-500 font-semibold">{idx + 1}</td>
                            <td className="py-3">
                              <div className="font-semibold text-slate-900">{inq.fullName}</div>
                              <div className="text-[11px] text-slate-400">{inq.companyName || 'Independent Importer'}</div>
                            </td>
                            <td className="py-3 font-medium text-slate-700">{inq.product}</td>
                            <td className="py-3 text-slate-600">{inq.country || 'International Importer'}</td>
                            <td className="py-3 font-mono text-[11px] text-slate-500">{inq.quantityRequired || '20mt'}</td>
                            <td className="py-3">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-[#0070E0]">
                                {inq.status ? (inq.status.charAt(0).toUpperCase() + inq.status.slice(1)) : 'New'}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => { setViewingInquiry(inq); setActiveTab('inquiries'); }}
                                className="px-3 py-1 rounded-lg bg-slate-50 hover:bg-[#0A1C3E] hover:text-white text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3.5">
                  <h3 className="text-base font-bold font-display text-slate-900">
                    Quick Actions
                  </h3>

                  <div className="space-y-2.5">
                    <button
                      onClick={handleOpenAddProduct}
                      className="w-full p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-blue-300 transition text-xs font-semibold text-slate-800 flex items-center justify-between shadow-2xs group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Plus className="w-4 h-4 text-[#0070E0]" />
                        <span>Add New Export Spice</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={handleOpenAddBlogPost}
                      className="w-full p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-purple-300 transition text-xs font-semibold text-slate-800 flex items-center justify-between shadow-2xs group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Plus className="w-4 h-4 text-purple-600" />
                        <span>Publish New Blog Article</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={handleOpenAddTeamMember}
                      className="w-full p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-sky-300 transition text-xs font-semibold text-slate-800 flex items-center justify-between shadow-2xs group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Plus className="w-4 h-4 text-sky-600" />
                        <span>Add Leadership Member</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => setActiveTab('gallery')}
                      className="w-full p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-indigo-300 transition text-xs font-semibold text-slate-800 flex items-center justify-between shadow-2xs group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <ImageIcon className="w-4 h-4 text-indigo-600" />
                        <span>Browse Media & Photo Gallery</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => AdminStorage.exportInquiriesCSV()}
                      className="w-full p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 hover:border-emerald-300 transition text-xs font-semibold text-slate-800 flex items-center justify-between shadow-2xs group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Download className="w-4 h-4 text-emerald-600" />
                        <span>Download Inquiries (CSV)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

              </div>

              {/* 4. Bottom Row (3 Feature Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                
                {/* WhatsApp Business Desk */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block">
                        WhatsApp Business Desk
                      </span>
                      <div className="text-lg font-bold font-display text-slate-900 mt-0.5">
                        +91 70691 82990
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Direct Desk • 24/7 Availability
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/917069182990"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-semibold flex items-center gap-1 transition shrink-0"
                  >
                    <span>Open WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Supabase PostgreSQL */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-full bg-sky-50 text-[#0070E0] border border-sky-100 flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5 text-[#0070E0]" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block">
                        Supabase PostgreSQL
                      </span>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Connected</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Real-time Cloud Sync Active • 1 live browser
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSupabaseModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#0070E0] hover:text-white text-slate-700 text-xs font-semibold flex items-center gap-1 transition shrink-0 cursor-pointer"
                  >
                    <span>Manage Database</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Export Desk Information (Dark Navy Card) */}
                <div className="bg-[#0A1C3E] text-white rounded-2xl p-5 shadow-2xs flex items-center justify-between relative overflow-hidden">
                  <div className="flex items-start space-x-3.5 max-w-[85%]">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-[#38BDF8] border border-blue-400/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Ship className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8] block">
                        EXPORT DESK INFORMATION
                      </span>
                      <h4 className="text-sm font-bold font-display text-white">
                        Origintra Exim Global Desk
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        Sourcing out of Guntur, Unjha, Ramganj Mandi, and Cochin. Primary maritime gateways through Mundra and Pipavav ports.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white text-white hover:text-[#0A1C3E] flex items-center justify-center transition shrink-0 cursor-pointer"
                    title="Contact Export Desk"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* TAB 2: PRODUCT CATALOG MANAGEMENT */}
          {/* ======================================= */}
          {activeTab === 'products' && (
            editingProduct ? (
              <ProductEditor
                product={editingProduct}
                onChange={setEditingProduct}
                onSave={handleSaveProduct}
                onCancel={() => setEditingProduct(null)}
                onOpenGallery={handleOpenProductImageGallery}
                isSaving={isSavingProduct}
              />
            ) : (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-[#0F172A]">
                    Product Catalog Management
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage all {products.length} export spice commodities, specifications, origin belts, and forms.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all products back to the original 27 default spices?')) {
                        AdminStorage.resetProductsToDefault();
                        showToast('Products reset to defaults.');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center space-x-1"
                    title="Reset to default 27 spices"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <button
                    onClick={handleOpenAddProduct}
                    className="px-4 py-2.5 rounded-xl bg-[#0070E0] hover:bg-blue-600 text-white text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Spice</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by name, botanical name, origin..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
                  <button
                    onClick={() => setProductCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      productCategoryFilter === 'all'
                        ? 'bg-[#0A1C3E] text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    All ({products.length})
                  </button>
                  {PRODUCT_CATEGORIES.filter(c => c.key !== 'all').map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setProductCategoryFilter(cat.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                        productCategoryFilter === cat.key
                          ? 'bg-[#0A1C3E] text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Spice Commodity</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Origin Hub</th>
                        <th className="py-3 px-4">Available Forms</th>
                        <th className="py-3 px-4">Flagship</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                          
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={prod.image?.startsWith('/assets/products/') ? `${prod.image.split('?')[0]}?v=20261019_drive` : prod.image}
                                alt={prod.name}
                                className="w-12 h-14 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-50"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = '/assets/products/cumin-seeds.jpg?v=20261019_drive';
                                }}
                              />
                              <div>
                                <div className="font-semibold text-slate-800 text-sm">{prod.name}</div>
                                {prod.botanicalName && (
                                  <div className="text-[11px] text-slate-400 italic">{prod.botanicalName}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                              {prod.category}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {prod.origin.split('—')[0].split(',')[0]}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {prod.availableForms.slice(0, 2).map((form, idx) => (
                                <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                                  {form}
                                </span>
                              ))}
                              {prod.availableForms.length > 2 && (
                                <span className="text-[10px] text-slate-400 self-center">
                                  +{prod.availableForms.length - 2}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {prod.isFlagship ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                                Flagship
                              </span>
                            ) : (
                              <span className="text-slate-300 text-[11px]">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => { onOpenProductDetail(prod); }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                                title="View on site"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition"
                                title="Edit Product"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredProducts.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No products found matching your filter criteria.
                  </div>
                )}
              </div>

            </div>
            )
          )}

          {/* ======================================= */}
          {/* TAB 3: BLOG & ARTICLES MANAGEMENT */}
          {/* ======================================= */}
          {activeTab === 'blog' && (
            editingBlogPost ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header Card matching screenshot */}
                <div className="bg-[#0A1C3E] rounded-2xl px-6 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                  <div>
                    <button
                      type="button"
                      onClick={() => setEditingBlogPost(null)}
                      className="text-xs text-[#38BDF8] hover:text-white flex items-center space-x-1.5 font-semibold mb-2 transition cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to All Articles</span>
                    </button>
                    <span className="text-[10px] uppercase font-bold text-[#38BDF8] tracking-wider block">
                      Blog & Article Editor
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-0.5">
                      {editingBlogPost.title ? ('Edit Article: ' + editingBlogPost.title) : 'Write New Export Insight Article'}
                    </h2>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingBlogPost(null)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveBlogPost}
                      className="px-5 py-2 rounded-xl bg-[#0070E0] hover:bg-blue-600 text-white text-xs font-semibold transition cursor-pointer shadow-sm flex items-center space-x-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Publish Article</span>
                    </button>
                  </div>
                </div>

                {/* Main Full Page Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                  <form onSubmit={handleSaveBlogPost} className="space-y-5 text-xs">

              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Article Title *</label>
                  <input
                    type="text"
                    required
                    value={editingBlogPost.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      const updates: Partial<BlogPost> = { title: newTitle };
                      if (!isSlugManuallyEdited) {
                        updates.slug = slugify(newTitle);
                      }
                      setEditingBlogPost({ ...editingBlogPost, ...updates });
                    }}
                    placeholder="e.g. Navigating Indian Spice Harvest Calendars & Pricing Cycles"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-[#0070E0]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 block">
                      Article URL Slug (Permalink) *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSlugManuallyEdited(false);
                        setEditingBlogPost({
                          ...editingBlogPost,
                          slug: slugify(editingBlogPost.title)
                        });
                      }}
                      className="text-[11px] text-[#0070E0] hover:underline font-semibold cursor-pointer"
                    >
                      Auto-Generate from Title
                    </button>
                  </div>
                  <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus-within:ring-2 focus-within:ring-[#0070E0] focus-within:bg-white">
                    <span className="text-slate-400 font-mono text-xs select-none shrink-0">
                      /blog/
                    </span>
                    <input
                      type="text"
                      required
                      value={editingBlogPost.slug}
                      onChange={(e) => {
                        setIsSlugManuallyEdited(true);
                        setEditingBlogPost({
                          ...editingBlogPost,
                          slug: slugify(e.target.value)
                        });
                      }}
                      placeholder="e.g. how-to-import-spices-from-india"
                      className="w-full bg-transparent text-xs font-mono font-semibold text-slate-800 focus:outline-none pl-1"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 flex flex-wrap items-center justify-between gap-1">
                    <span>Clean URL: <span className="font-mono text-slate-700 font-semibold">origintra.com/blog/{editingBlogPost.slug || slugify(editingBlogPost.title) || 'article-name'}</span></span>
                    <span className="text-slate-500">Name-based clean permalink</span>
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 block text-xs sm:text-sm">Category *</label>
                    {!isCreatingNewBlogCategory ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingNewBlogCategory(true);
                          setNewBlogCategoryInput('');
                        }}
                        className="text-xs font-semibold text-[#0070E0] hover:text-blue-700 flex items-center gap-1 transition cursor-pointer hover:underline"
                        title="Create a new custom blog category"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Create New Category</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingNewBlogCategory(false);
                          setNewBlogCategoryInput('');
                        }}
                        className="text-xs font-medium text-slate-500 hover:text-slate-700 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {isCreatingNewBlogCategory ? (
                    <div className="flex items-center gap-2 animate-in fade-in duration-150">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          autoFocus
                          value={newBlogCategoryInput}
                          onChange={(e) => setNewBlogCategoryInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNewBlogCategory();
                            } else if (e.key === 'Escape') {
                              setIsCreatingNewBlogCategory(false);
                            }
                          }}
                          placeholder="Type new category name and press Enter..."
                          className="w-full px-3 py-2 rounded-lg border-2 border-[#0070E0] bg-blue-50/20 text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddNewBlogCategory}
                        disabled={!newBlogCategoryInput.trim()}
                        className="px-3.5 py-2 rounded-lg bg-[#0070E0] hover:bg-blue-600 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Add & Select</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingNewBlogCategory(false);
                          setNewBlogCategoryInput('');
                        }}
                        className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium transition cursor-pointer shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <select
                      value={editingBlogPost.category}
                      onChange={(e) => {
                        if (e.target.value === '__create_new__') {
                          setIsCreatingNewBlogCategory(true);
                          setNewBlogCategoryInput('');
                        } else {
                          setEditingBlogPost({ ...editingBlogPost, category: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0070E0] text-xs sm:text-sm text-slate-800 font-medium bg-white"
                    >
                      {allBlogCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option disabled value="">──────────────</option>
                      <option value="__create_new__" className="text-[#0070E0] font-bold">
                        ➕ + Create New Category...
                      </option>
                    </select>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 block">Author Name *</label>
                    {currentUser && (
                      <button
                        type="button"
                        onClick={() => setEditingBlogPost({
                          ...editingBlogPost,
                          author: currentUser.name,
                          authorRole: currentUser.department || `${currentUser.role.toUpperCase()} Contributor`,
                          authorId: currentUser.id
                        })}
                        className="text-[11px] text-[#0070E0] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <UserIcon className="w-3 h-3" />
                        <span>Stamp My Name ({currentUser.name.split(' ')[0]})</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={editingBlogPost.author}
                      onChange={(e) => setEditingBlogPost({ ...editingBlogPost, author: e.target.value })}
                      placeholder="e.g. Vikram Malhotra"
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0070E0] font-semibold"
                    />
                    {users.length > 0 && (
                      <select
                        value={users.some(u => u.name === editingBlogPost.author) ? editingBlogPost.author : ''}
                        onChange={(e) => {
                          const foundUser = users.find(u => u.name === e.target.value);
                          if (foundUser) {
                            setEditingBlogPost({
                              ...editingBlogPost,
                              author: foundUser.name,
                              authorRole: foundUser.department || `${foundUser.role.toUpperCase()} Author`,
                              authorId: foundUser.id
                            });
                          }
                        }}
                        className="w-36 px-2 py-2 rounded-lg border border-slate-300 bg-slate-50 text-[11px] text-slate-700"
                        title="Pick registered user as author"
                      >
                        <option value="">Pick Author...</option>
                        {users.map(u => (
                          <option key={u.id} value={u.name}>
                            {u.name} ({u.role})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estimated Read Time</label>
                  <input
                    type="text"
                    value={editingBlogPost.readTime}
                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, readTime: e.target.value })}
                    placeholder="e.g. 6 min read"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0070E0]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 block">Publication Date *</label>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const raw = now.toISOString().split('T')[0];
                          const formatted = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                          setEditingBlogPost({ ...editingBlogPost, rawDate: raw, date: formatted });
                        }}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const yest = new Date();
                          yest.setDate(yest.getDate() - 1);
                          const raw = yest.toISOString().split('T')[0];
                          const formatted = yest.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                          setEditingBlogPost({ ...editingBlogPost, rawDate: raw, date: formatted });
                        }}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                      >
                        Yesterday
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="date"
                        value={editingBlogPost.rawDate || ''}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw) {
                            const [y, m, d] = raw.split('-').map(Number);
                            const dateObj = new Date(y, m - 1, d);
                            const formatted = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                            setEditingBlogPost({ ...editingBlogPost, rawDate: raw, date: formatted });
                          } else {
                            setEditingBlogPost({ ...editingBlogPost, rawDate: raw });
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0070E0] text-xs font-mono"
                        title="Interactive Calendar Date Picker"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        value={editingBlogPost.date}
                        onChange={(e) => setEditingBlogPost({ ...editingBlogPost, date: e.target.value })}
                        placeholder="e.g. October 5, 2026"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0070E0] text-xs font-semibold"
                        title="Display publication date"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Pick from calendar or edit text to change date.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700 block">Cover Image URL *</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenBlogImageGallery}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0070E0] hover:bg-blue-100 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Select from Gallery
                    </button>
                    <label className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleDevicePhotoUpload(f, 'blog');
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {editingBlogPost.image && (
                    <div
                      onClick={handleOpenBlogImageGallery}
                      className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-[#0070E0] transition bg-slate-100"
                      title="Click to select from gallery"
                    >
                      <img src={editingBlogPost.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={editingBlogPost.image}
                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, image: e.target.value })}
                    placeholder="https://images.unsplash.com/... or /assets/..."
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 font-mono text-[11px] focus:ring-2 focus:ring-[#0070E0]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Article Excerpt (Summary) *</label>
                <textarea
                  rows={2}
                  required
                  value={editingBlogPost.excerpt}
                  onChange={(e) => setEditingBlogPost({ ...editingBlogPost, excerpt: e.target.value })}
                  placeholder="Brief synopsis appearing on article cards..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0070E0]"
                />
              </div>

              {/* Dynamic Sections */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Article Content Sections ({editingBlogPost.content.length})</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBlogPost({
                        ...editingBlogPost,
                        content: [
                          ...editingBlogPost.content,
                          { heading: 'New Heading', paragraphs: ['Write your paragraph text here...'] }
                        ]
                      });
                    }}
                    className="text-xs font-semibold text-[#0070E0] hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Section</span>
                  </button>
                </div>

                {editingBlogPost.content.map((sec, secIdx) => (
                  <div key={secIdx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={sec.heading || ''}
                        onChange={(e) => {
                          const updated = [...editingBlogPost.content];
                          updated[secIdx].heading = e.target.value;
                          setEditingBlogPost({ ...editingBlogPost, content: updated });
                        }}
                        placeholder={`Section ${secIdx + 1} Heading`}
                        className="font-bold text-xs bg-white px-2.5 py-1.5 rounded border border-slate-300 w-3/4"
                      />
                      {editingBlogPost.content.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingBlogPost.content.filter((_, i) => i !== secIdx);
                            setEditingBlogPost({ ...editingBlogPost, content: updated });
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <textarea
                      rows={3}
                      value={sec.paragraphs.join('\n\n')}
                      onChange={(e) => {
                        const updated = [...editingBlogPost.content];
                        updated[secIdx].paragraphs = e.target.value.split('\n\n').filter(Boolean);
                        setEditingBlogPost({ ...editingBlogPost, content: updated });
                      }}
                      placeholder="Write paragraph text here (separate paragraphs with blank line)..."
                      className="w-full bg-white px-2.5 py-1.5 rounded border border-slate-300 text-xs leading-relaxed"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingBlogPost(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0070E0] hover:bg-blue-600 text-white font-semibold transition shadow-sm"
                >
                  Publish Article
                </button>
              </div>

            
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-[#0F172A]">
                    Blog & Articles Management
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Write, edit, and publish international spice trade articles, sourcing guides, and market updates.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Reset articles back to default initial blog posts?')) {
                        AdminStorage.resetBlogPostsToDefault();
                        showToast('Blog posts reset to default.');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center space-x-1"
                    title="Reset to default articles"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <button
                    onClick={handleOpenAddBlogPost}
                    className="px-4 py-2.5 rounded-xl bg-[#0070E0] hover:bg-blue-600 text-white text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Write New Article</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    value={blogSearch}
                    onChange={(e) => setBlogSearch(e.target.value)}
                    placeholder="Search articles by title, author, topic..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="text-xs text-slate-500">
                  Showing <strong>{filteredBlogPosts.length}</strong> of {blogPosts.length} articles
                </div>
              </div>

              {/* Articles Grid / Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
                  >
                    <div>
                      <div className="relative aspect-16/9 overflow-hidden bg-slate-100">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-[#0A1C3E]/85 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          {post.category}
                        </div>
                      </div>

                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{post.date}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{post.readTime}</span>
                        </div>

                        <h3 className="font-display font-bold text-base text-[#0F172A] line-clamp-2 group-hover:text-[#0070E0] transition-colors">
                          {post.title}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-slate-100 mt-3 flex items-center justify-between">
                      <div className="text-[11px] font-medium text-slate-500">
                        By {post.author.split(' ')[0]}
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setBlogPreviewPost(post);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition cursor-pointer"
                          title="Preview Article"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditBlogPost(post)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition cursor-pointer"
                          title="Edit Article"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlogPost(post)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition cursor-pointer"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {filteredBlogPosts.length === 0 && (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                  No articles found. Click "Write New Article" to create your first post!
                </div>
              )}

            </div>
            )
          )}

          {/* TAB 4: LEADERSHIP & TEAM MANAGEMENT */}
          {/* ======================================= */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-[#0F172A]">
                    Leadership & Team Management
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage key leaders, verified photos, credentials, and operational responsibilities displayed on the About Us page.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Reset leadership roster back to default team members?')) {
                        AdminStorage.resetTeamMembersToDefault();
                        showToast('Leadership roster reset to default.');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center space-x-1"
                    title="Reset to default leaders"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <button
                    onClick={handleOpenAddTeamMember}
                    className="px-4 py-2.5 rounded-xl bg-[#0070E0] hover:bg-blue-600 text-white text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Leader</span>
                  </button>
                </div>
              </div>

              {/* Master Visibility & Search Indexing Toggle Card */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                leadershipVisible 
                  ? 'bg-blue-50/70 border-blue-200 shadow-2xs' 
                  : 'bg-amber-50/80 border-amber-200 shadow-2xs'
              }`}>
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    leadershipVisible ? 'bg-[#0070E0] text-white shadow-sm' : 'bg-amber-500 text-white shadow-sm'
                  }`}>
                    {leadershipVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[#0F172A]">
                        About Us Page: "Leadership & Key People" Component
                      </h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        leadershipVisible ? 'bg-blue-100 text-[#0070E0] border border-blue-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {leadershipVisible ? 'Visible & Google Indexed' : 'Hidden & Excluded from Indexing'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                      {leadershipVisible 
                        ? 'Active Mode: The component is fully displayed on the About Us page, and Googlebot crawls the executive profiles, verified photos, credentials, and Person structured data.'
                        : 'Hidden Mode: The component is completely removed from the page DOM. Googlebot and visitors cannot see or index any names, photos, or leadership details.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => handleToggleLeadershipVisibility(!leadershipVisible)}
                    className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      leadershipVisible ? 'bg-[#0070E0]' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={leadershipVisible}
                    title={leadershipVisible ? 'Click to hide component from website & search engines' : 'Click to show component on website & allow search indexing'}
                  >
                    <span className="sr-only">Toggle leadership visibility</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        leadershipVisible ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-bold ${leadershipVisible ? 'text-[#0070E0]' : 'text-slate-600'}`}>
                    {leadershipVisible ? 'Show' : 'Hide'}
                  </span>
                </div>
              </div>

              {/* Search & Stats Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    placeholder="Search leaders by name, position, credentials..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="text-xs text-slate-500">
                  Showing <strong>{filteredTeamMembers.length}</strong> of {teamMembers.length} leaders
                </div>
              </div>

              {/* Team Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredTeamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition group"
                  >
                    <div>
                      {/* Photo container */}
                      <div className="relative aspect-4/5 overflow-hidden bg-slate-100">
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-2.5 left-2.5 right-2.5">
                          <span className="bg-[#0070E0]/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-2xs">
                            {member.position}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-display font-bold text-[#0F172A] truncate">
                            {member.name}
                          </h3>
                          <ShieldCheck className="w-4 h-4 text-[#0070E0] shrink-0" />
                        </div>

                        <p className="text-xs font-semibold text-[#0070E0] truncate">
                          {member.role}
                        </p>

                        <div className="pt-0.5">
                          <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded inline-block">
                            {member.credentials}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 pt-1">
                          {member.bio}
                        </p>

                        {member.specialization && (
                          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                            <span className="text-slate-400">Focus: </span>
                            {member.specialization}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions footer */}
                    <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                      <button
                        onClick={() => handleOpenEditTeamMember(member)}
                        className="text-xs font-semibold text-[#0070E0] hover:underline flex items-center space-x-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Profile</span>
                      </button>

                      <button
                        onClick={() => handleDeleteTeamMember(member)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete Leader"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {filteredTeamMembers.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                  No leaders found matching "{teamSearch}".
                </div>
              )}

            </div>
          )}

          {/* ======================================= */}
          {/* TAB: CLIENT REVIEWS & MARQUEE TESTIMONIALS */}
          {/* ======================================= */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-[#0F172A] flex items-center gap-2.5">
                    <span>Client Reviews & Trade References</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                      {testimonials.length} Verified References
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage international buyer testimonials displayed in the homepage continuous infinite marquee and public trade reference sections.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleResetTestimonials}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center space-x-1"
                    title="Reset to default factory export reviews"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>

                  <button
                    onClick={handleOpenAddTestimonial}
                    className="px-4 py-2.5 rounded-xl bg-[#0070E0] hover:bg-blue-600 text-white text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Review</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    value={testimonialSearch}
                    onChange={(e) => setTestimonialSearch(e.target.value)}
                    placeholder="Search by buyer, company, country, commodity, or quote..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <select
                    value={testimonialCommodityFilter}
                    onChange={(e) => setTestimonialCommodityFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
                  >
                    <option value="all">All Commodities</option>
                    <option value="Chilli">Red Chilli</option>
                    <option value="Turmeric">Turmeric</option>
                    <option value="Cumin">Cumin</option>
                    <option value="Cardamom">Cardamom</option>
                    <option value="Pepper">Black Pepper</option>
                  </select>

                  <div className="text-xs text-slate-500 whitespace-nowrap">
                    Showing <strong>{filteredTestimonials.length}</strong> of {testimonials.length} reviews
                  </div>
                </div>
              </div>

              {/* Testimonials Grid (Homepage Synced Live Preview Design) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTestimonials.map((item) => {
                  const countryFlag = getCountryFlag(item.country || item.destinationPort);

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.08)] hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
                    >
                      {/* Top Section with Verified Testimonial Content */}
                      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Top Row: 5 Golden Stars + Trade Commodity Badge */}
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <div className="flex items-center space-x-1">
                              {[...Array(item.rating || 5)].map((_, sIdx) => (
                                <Star key={sIdx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                              ))}
                            </div>

                            {(item.volumeOrType || item.commodity) && (
                              <span className="text-[10px] font-semibold text-[#0070E0] bg-blue-50 border border-blue-100/80 px-2.5 py-0.5 rounded-full truncate max-w-[190px]">
                                {item.volumeOrType || item.commodity}
                              </span>
                            )}
                          </div>

                          {/* Testimonial Quote with Typographic Quotes */}
                          <p className="text-sm sm:text-[15px] text-[#0F172A] leading-relaxed font-normal">
                            <span className="font-serif text-lg text-[#0F172A] mr-1 select-none">“</span>
                            {item.testimonial}
                            <span className="font-serif text-lg text-[#0F172A] ml-1 select-none">”</span>
                          </p>
                        </div>

                        {/* Thin Horizontal Divider */}
                        <div className="border-t border-slate-100 my-5" />

                        {/* Bottom Row: Avatar & Author on Left, Country Flag Pill on Right */}
                        <div className="flex items-center justify-between gap-3 pt-0.5">
                          {/* Left: Avatar + Author Info */}
                          <div className="flex items-center space-x-3 min-w-0">
                            {item.avatar ? (
                              <img
                                src={item.avatar}
                                alt={item.author}
                                width="44"
                                height="44"
                                className="w-11 h-11 rounded-full object-cover shrink-0 shadow-2xs border border-slate-100"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 tracking-wider shadow-2xs">
                                {item.author.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-[#0F172A] truncate tracking-tight leading-snug">
                                {item.author}
                              </h4>
                              <p className="text-xs text-slate-500 font-normal truncate mt-0.5">
                                {item.role || item.company}
                              </p>
                            </div>
                          </div>

                          {/* Right: Modern Country Pill with National Flag */}
                          <div className="bg-slate-100/90 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5 border border-slate-200/60 shrink-0">
                            <img
                              src={`https://flagcdn.com/w40/${countryFlag.code}.png`}
                              srcSet={`https://flagcdn.com/w80/${countryFlag.code}.png 2x`}
                              alt={countryFlag.name}
                              width="18"
                              height="12"
                              className="w-4.5 h-3 object-cover rounded-[2px] shadow-2xs shrink-0"
                              loading="lazy"
                            />
                            <span className="text-xs font-semibold text-slate-700">
                              {countryFlag.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Actions Bar (Admin Management) */}
                      <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {item.id}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenEditTestimonial(item)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#0070E0] hover:border-blue-300 text-xs font-semibold transition cursor-pointer flex items-center space-x-1 shadow-2xs"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Delete Review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>


              {filteredTestimonials.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                  No testimonials found matching your filter "{testimonialSearch}".
                </div>
              )}

            </div>
          )}

          {/* ======================================= */}
          {/* TAB: MEDIA & DIGITAL ASSET GALLERY */}
          {/* ======================================= */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-[#0F172A] flex items-center gap-2.5">
                    <span>Media & Digital Asset Gallery</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                      {galleryImages.length} High-Res Photos
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Centralized visual repository for leadership executive portraits, export spices, farmgate sourcing, processing facilities, and certifications.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Reset media gallery back to default asset library (restores deleted default photos)?')) {
                        AdminStorage.resetCustomGallery();
                        showToast('Media gallery reset to defaults.');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center space-x-1"
                    title="Reset gallery"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <label className="px-4 py-2.5 rounded-xl bg-[#0070E0] hover:bg-blue-600 text-white text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-sm">
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo to Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDevicePhotoUpload(file, 'blog');
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Filter Tabs & Search */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="relative w-full md:w-80">
                    <input
                      type="text"
                      value={galleryTabSearch}
                      onChange={(e) => setGalleryTabSearch(e.target.value)}
                      placeholder="Search gallery photos by name, role, spice..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 text-xs">
                    {[
                      { key: 'all', label: 'All Photos', count: galleryImages.length },
                      { key: 'team', label: 'Leadership', count: galleryImages.filter(i => i.category === 'team').length },
                      { key: 'products', label: 'Products', count: galleryImages.filter(i => i.category === 'products').length },
                      { key: 'facility', label: 'Facility & Port', count: galleryImages.filter(i => i.category === 'facility').length },
                      { key: 'banners', label: 'Hero Banners', count: galleryImages.filter(i => i.category === 'banners').length },
                      { key: 'certificates', label: 'Certificates', count: galleryImages.filter(i => i.category === 'certificates').length },
                      { key: 'uploads', label: 'My Uploads', count: galleryImages.filter(i => i.isUploaded).length }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setGalleryTabCategory(tab.key)}
                        className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                          galleryTabCategory === tab.key
                            ? 'bg-[#0A1C3E] text-white shadow-2xs font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${galleryTabCategory === tab.key ? 'bg-white/20 text-white' : 'bg-white text-slate-500'}`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {galleryImages
                  .filter(img => {
                    const matchCat = galleryTabCategory === 'all' || (galleryTabCategory === 'uploads' ? img.isUploaded : img.category === galleryTabCategory);
                    const q = galleryTabSearch.toLowerCase().trim();
                    const matchSearch = !q || img.title.toLowerCase().includes(q) || (img.description && img.description.toLowerCase().includes(q)) || img.url.toLowerCase().includes(q);
                    return matchCat && matchSearch;
                  })
                  .map(img => (
                    <div
                      key={img.id}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
                    >
                      <div className="relative aspect-square bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setPreviewLightboxImage(img)}>
                        <img
                          src={img.url}
                          alt={img.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/team/director.jpg';
                          }}
                        />
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white rounded text-[9px] font-semibold capitalize">
                          {img.tag || img.category}
                        </span>
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1">
                          <Eye className="w-4 h-4" />
                          <span>View Full</span>
                        </div>
                      </div>

                      <div className="p-3 space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 truncate" title={img.title}>
                          {img.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono truncate" title={img.url}>
                          {img.url}
                        </p>
                      </div>

                      <div className="p-2 pt-0 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(img.url);
                            setCopiedGalleryUrl(img.url);
                            showToast(`Copied path: ${img.url}`);
                            setTimeout(() => setCopiedGalleryUrl(null), 2000);
                          }}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-[#0070E0] hover:text-white text-slate-600 text-[10px] font-semibold transition flex items-center gap-1 cursor-pointer"
                        >
                          {copiedGalleryUrl === img.url ? <CheckCheck className="w-3 h-3 text-emerald-500" /> : <Layers className="w-3 h-3" />}
                          <span>{copiedGalleryUrl === img.url ? 'Copied' : 'Copy Path'}</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${img.title}" from gallery?`)) {
                              AdminStorage.deleteGalleryImage(img.id);
                              showToast('Photo removed from gallery.');
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* TAB 5: INQUIRIES & RFQ LEADS */}
          {/* ======================================= */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-[#0F172A]">
                    Buyer Inquiries & Quote Leads
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Capture, manage, and follow up on commercial buyer RFQs submitted through the website.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => AdminStorage.exportInquiriesCSV()}
                    className="px-4 py-2.5 rounded-xl bg-[#0A1C3E] hover:bg-[#0070E0] text-white text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export to CSV</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    placeholder="Search by buyer name, company, email..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0070E0]"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Filter status:</span>
                  {(['all', 'new', 'contacted', 'negotiation', 'closed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setInquiryStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                        inquiryStatusFilter === st
                          ? 'bg-[#0A1C3E] text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inquiries Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Buyer & Company</th>
                        <th className="py-3 px-4">Contact Details</th>
                        <th className="py-3 px-4">Product & Volume</th>
                        <th className="py-3 px-4">Target Port</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-slate-50 transition">
                          
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(inq.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800 text-sm">{inq.fullName}</div>
                            <div className="text-[11px] text-slate-400 font-medium">{inq.companyName || 'Individual Trader'}</div>
                            <div className="text-[10px] text-blue-600">{inq.country}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-700 font-mono text-[11px]">{inq.businessEmail}</div>
                            <div className="text-slate-500 font-mono text-[11px]">{inq.phoneWhatsApp}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{inq.product}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{inq.quantityRequired}</div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {inq.destinationPort || '—'}
                          </td>

                          <td className="py-3.5 px-4">
                            <select
                              value={inq.status}
                              onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value as Inquiry['status'])}
                              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border focus:outline-none cursor-pointer ${
                                inq.status === 'new' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                                inq.status === 'contacted' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                                inq.status === 'negotiation' ? 'bg-purple-50 border-purple-200 text-purple-800' :
                                'bg-emerald-50 border-emerald-200 text-emerald-800'
                              }`}
                            >
                              <option value="new">NEW</option>
                              <option value="contacted">CONTACTED</option>
                              <option value="negotiation">NEGOTIATION</option>
                              <option value="closed">CLOSED</option>
                            </select>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => setViewingInquiry(inq)}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-[#0A1C3E] hover:text-white text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleDeleteInquiry(inq.id)}
                                className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredInquiries.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No inquiries found.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* TAB 5: WEBSITE & COMPANY SETTINGS */}
          {/* ======================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl">
              
              <div>
                <h1 className="text-2xl font-display font-bold text-[#0F172A]">
                  Company Profile & Website Settings
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update primary contact details, page component visibility, and corporate credentials.
                </p>
              </div>

              {/* Page Component Visibility & SEO Indexing Card */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                leadershipVisible 
                  ? 'bg-blue-50/70 border-blue-200 shadow-2xs' 
                  : 'bg-amber-50/80 border-amber-200 shadow-2xs'
              }`}>
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    leadershipVisible ? 'bg-[#0070E0] text-white shadow-sm' : 'bg-amber-500 text-white shadow-sm'
                  }`}>
                    {leadershipVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[#0F172A]">
                        About Us Page: "Leadership & Key People" Component
                      </h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        leadershipVisible ? 'bg-blue-100 text-[#0070E0] border border-blue-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {leadershipVisible ? 'Visible & Google Indexed' : 'Hidden & Excluded from Indexing'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                      {leadershipVisible 
                        ? 'Active Mode: The component is fully displayed on the About Us page, and Googlebot crawls the executive profiles, verified photos, credentials, and Person structured data.'
                        : 'Hidden Mode: The component is completely removed from the page DOM. Googlebot and visitors cannot see or index any names, photos, or leadership details.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => handleToggleLeadershipVisibility(!leadershipVisible)}
                    className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      leadershipVisible ? 'bg-[#0070E0]' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={leadershipVisible}
                    title={leadershipVisible ? 'Click to hide component from website & search engines' : 'Click to show component on website & allow search indexing'}
                  >
                    <span className="sr-only">Toggle leadership visibility</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        leadershipVisible ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-bold ${leadershipVisible ? 'text-[#0070E0]' : 'text-slate-600'}`}>
                    {leadershipVisible ? 'Show' : 'Hide'}
                  </span>
                </div>
              </div>

              {/* Statutory Licensing & GST Push Notification Banner Control */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                companyConfig.licensingNoticeEnabled !== false
                  ? 'bg-amber-50/80 border-amber-200 shadow-2xs'
                  : 'bg-emerald-50/70 border-emerald-200 shadow-2xs'
              }`}>
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    companyConfig.licensingNoticeEnabled !== false ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-emerald-600 text-white shadow-sm'
                  }`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[#0F172A]">
                        Statutory Licensing &amp; In-Process Push Notification Banner
                      </h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        companyConfig.licensingNoticeEnabled !== false 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {companyConfig.licensingNoticeEnabled !== false ? 'ACTIVE NOTICE (Shown to Visitors)' : 'DISABLED (Certificates Granted / Hidden)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                      {companyConfig.licensingNoticeEnabled !== false
                        ? 'Active Mode: The Push Notification Toast and Header Alert Strip are actively shown across the website to disclose that export licenses (IEC, Spices Board, FSSAI, APEDA) are in process and the company operates under GST. This legally protects against false certification claims.'
                        : 'Disabled Mode: The Push Notification Toast, Header Alert Strip, and Floating Pill are completely hidden from all website visitors. Turn this OFF when your official certificates are issued.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => handleToggleLicensingNotice(companyConfig.licensingNoticeEnabled === false)}
                    className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      companyConfig.licensingNoticeEnabled !== false ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={companyConfig.licensingNoticeEnabled !== false}
                    title={companyConfig.licensingNoticeEnabled !== false ? 'Click to turn OFF licensing notice' : 'Click to turn ON licensing notice'}
                  >
                    <span className="sr-only">Toggle statutory licensing notice</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        companyConfig.licensingNoticeEnabled !== false ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-bold ${companyConfig.licensingNoticeEnabled !== false ? 'text-amber-800' : 'text-slate-600'}`}>
                    {companyConfig.licensingNoticeEnabled !== false ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Statutory Licensing & GST Push Notification Banner Control */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                companyConfig.licensingNoticeEnabled !== false
                  ? 'bg-amber-50/80 border-amber-200 shadow-2xs'
                  : 'bg-emerald-50/70 border-emerald-200 shadow-2xs'
              }`}>
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    companyConfig.licensingNoticeEnabled !== false ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-emerald-600 text-white shadow-sm'
                  }`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[#0F172A]">
                        Statutory Licensing &amp; In-Process Push Notification Banner
                      </h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        companyConfig.licensingNoticeEnabled !== false 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {companyConfig.licensingNoticeEnabled !== false ? 'ACTIVE NOTICE (Shown to Visitors)' : 'DISABLED (Certificates Granted / Hidden)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                      {companyConfig.licensingNoticeEnabled !== false
                        ? 'Active Mode: The Push Notification Toast and Header Alert Strip are actively shown across the website to disclose that export licenses (IEC, Spices Board, FSSAI, APEDA) are in process and the company operates under GST. This legally protects against false certification claims.'
                        : 'Disabled Mode: The Push Notification Toast, Header Alert Strip, and Floating Pill are completely hidden from all website visitors. Turn this OFF when your official certificates are issued.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto bg-white/80 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => handleToggleLicensingNotice(companyConfig.licensingNoticeEnabled === false)}
                    className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      companyConfig.licensingNoticeEnabled !== false ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={companyConfig.licensingNoticeEnabled !== false}
                    title={companyConfig.licensingNoticeEnabled !== false ? 'Click to turn OFF licensing notice' : 'Click to turn ON licensing notice'}
                  >
                    <span className="sr-only">Toggle statutory licensing notice</span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        companyConfig.licensingNoticeEnabled !== false ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-bold ${companyConfig.licensingNoticeEnabled !== false ? 'text-amber-800' : 'text-slate-600'}`}>
                    {companyConfig.licensingNoticeEnabled !== false ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveCompanyConfig} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Company Trade Name</label>
                    <input
                      type="text"
                      value={companyConfig.name}
                      onChange={(e) => setCompanyConfig({ ...companyConfig, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Tagline</label>
                    <input
                      type="text"
                      value={companyConfig.tagline}
                      onChange={(e) => setCompanyConfig({ ...companyConfig, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">WhatsApp Export Hotline (Direct)</label>
                    <input
                      type="text"
                      value={companyConfig.whatsappDisplay}
                      onChange={(e) => setCompanyConfig({ ...companyConfig, whatsappDisplay: e.target.value, whatsapp: e.target.value.replace(/[^0-9+]/g, '') })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#0070E0]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Primary Export Email</label>
                    <input
                      type="email"
                      value={companyConfig.primaryEmail}
                      onChange={(e) => setCompanyConfig({ ...companyConfig, primaryEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Head Office City & Belts</label>
                    <input
                      type="text"
                      value={companyConfig.headOffice.city}
                      onChange={(e) => setCompanyConfig({
                        ...companyConfig,
                        headOffice: { ...companyConfig.headOffice, city: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">State / Sourcing Agro-Zones</label>
                    <input
                      type="text"
                      value={companyConfig.headOffice.state}
                      onChange={(e) => setCompanyConfig({
                        ...companyConfig,
                        headOffice: { ...companyConfig.headOffice, state: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Changes reflect immediately across the entire website and header/footer hotlines.
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#0070E0] hover:bg-blue-600 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
                  >
                    Save Company Profile
                  </button>
                </div>

              </form>

              {/* Password Management */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center space-x-2 text-slate-800">
                  <Lock className="w-5 h-5 text-[#0070E0]" />
                  <h3 className="font-display font-bold text-base">Change Admin Password</h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="password"
                    id="new-admin-pass"
                    placeholder="Enter new administrator password"
                    className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                  />
                  <button
                    onClick={() => {
                      const inp = document.getElementById('new-admin-pass') as HTMLInputElement;
                      if (inp && inp.value.trim().length >= 4) {
                        AdminStorage.changePassword(inp.value.trim());
                        inp.value = '';
                        showToast('Admin password changed successfully!');
                      } else {
                        alert('Password must be at least 4 characters.');
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#0A1C3E] hover:bg-[#0070E0] text-white text-xs font-semibold transition cursor-pointer whitespace-nowrap"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Email & Nodemailer SMTP Credentials Card */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0070E0] flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-base text-slate-800">
                          Email & SMTP Service Credentials
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                          Nodemailer
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Configure Hostinger Webmail, custom SMTP, or email services to send account credentials and system notifications directly.
                      </p>
                    </div>
                  </div>

                  {/* Preset Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailCreds({
                          ...emailCreds,
                          provider: 'hostinger_smtp',
                          smtpHost: 'smtp.hostinger.com',
                          smtpPort: 465,
                          smtpSecure: true,
                          senderEmail: emailCreds.senderEmail || 'export@origintra.com',
                          smtpUser: emailCreds.smtpUser || 'export@origintra.com'
                        });
                        showToast('Applied Hostinger Webmail SMTP preset (smtp.hostinger.com:465)');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition cursor-pointer"
                    >
                      Hostinger Webmail
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailCreds({
                          ...emailCreds,
                          provider: 'custom_smtp',
                          smtpHost: 'smtp.gmail.com',
                          smtpPort: 465,
                          smtpSecure: true
                        });
                        showToast('Applied Google Workspace / Gmail preset (smtp.gmail.com:465)');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition cursor-pointer"
                    >
                      Gmail
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailCreds({
                          ...emailCreds,
                          provider: 'custom_smtp',
                          smtpHost: 'smtp.office365.com',
                          smtpPort: 587,
                          smtpSecure: false
                        });
                        showToast('Applied Microsoft 365 / Outlook preset (smtp.office365.com:587)');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition cursor-pointer"
                    >
                      Outlook 365
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      SMTP Host Server *
                    </label>
                    <input
                      type="text"
                      value={emailCreds.smtpHost}
                      onChange={(e) => setEmailCreds({ ...emailCreds, smtpHost: e.target.value })}
                      placeholder="e.g. smtp.hostinger.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#0070E0]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      SMTP Port *
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={emailCreds.smtpPort}
                        onChange={(e) => setEmailCreds({ ...emailCreds, smtpPort: Number(e.target.value) || 465 })}
                        placeholder="465 or 587"
                        className="w-32 px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#0070E0]"
                      />
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
                        <input
                          type="checkbox"
                          checked={emailCreds.smtpSecure}
                          onChange={(e) => setEmailCreds({ ...emailCreds, smtpSecure: e.target.checked })}
                          className="rounded border-slate-300 text-[#0070E0] focus:ring-[#0070E0]"
                        />
                        <span className="font-medium text-[11px]">Secure SSL/TLS</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      SMTP Username / Account Email *
                    </label>
                    <input
                      type="email"
                      value={emailCreds.smtpUser}
                      onChange={(e) => setEmailCreds({ ...emailCreds, smtpUser: e.target.value })}
                      placeholder="e.g. export@origintra.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#0070E0]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      SMTP Password / App Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showSmtpPassword ? 'text' : 'password'}
                        value={emailCreds.smtpPassword}
                        onChange={(e) => setEmailCreds({ ...emailCreds, smtpPassword: e.target.value })}
                        placeholder="••••••••••••••••"
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#0070E0]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      From Email Address
                    </label>
                    <input
                      type="email"
                      value={emailCreds.senderEmail}
                      onChange={(e) => setEmailCreds({ ...emailCreds, senderEmail: e.target.value })}
                      placeholder="e.g. export@origintra.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#0070E0]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      From Display Name
                    </label>
                    <input
                      type="text"
                      value={emailCreds.senderName}
                      onChange={(e) => setEmailCreds({ ...emailCreds, senderName: e.target.value })}
                      placeholder="e.g. Origintra Exim Administration Desk"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">
                      Admin Alert Recipient Email(s) (Receives New Inquiries) *
                    </label>
                    <input
                      type="text"
                      value={emailCreds.adminAlertEmail}
                      onChange={(e) => setEmailCreds({ ...emailCreds, adminAlertEmail: e.target.value })}
                      placeholder="e.g. export@origintra.com, info@patelarsh.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#0070E0]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Multiple emails can be separated by commas (e.g. export@origintra.com, info@patelarsh.com). Whenever a buyer inquires on the website, this address receives the full dossier immediately.
                    </span>
                  </div>
                </div>

                {/* Notification Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={emailCreds.autoSendOnInquiry}
                        onChange={(e) => setEmailCreds({ ...emailCreds, autoSendOnInquiry: e.target.checked })}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0070E0] focus:ring-[#0070E0] cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">
                          Email admin when buyer submits trade inquiry
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Sends an immediate inquiry alert with buyer name, company, email, phone, commodity, required volume, and port.
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={emailCreds.autoConfirmBuyer}
                        onChange={(e) => setEmailCreds({ ...emailCreds, autoConfirmBuyer: e.target.checked })}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0070E0] focus:ring-[#0070E0] cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">
                          Email receipt confirmation to prospective buyer
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Sends a branded commercial acknowledgement confirming their inquiry was received and will be answered in 24 hours.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Auto Send Toggle */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={emailCreds.autoSendOnUserCreate}
                      onChange={(e) => setEmailCreds({ ...emailCreds, autoSendOnUserCreate: e.target.checked })}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0070E0] focus:ring-[#0070E0] cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">
                        Auto-dispatch welcome email via Nodemailer when user is created
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        When enabled, the server sends the email in the background directly through your SMTP connection, with fallback to the local mail client if needed.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Test & Verification Section */}
                <div className="bg-blue-50/50 border border-blue-200/70 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0070E0]" />
                      Nodemailer Test & Connection Verification
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isSendingTestEmail}
                        onClick={async () => {
                          setIsSendingTestEmail(true);
                          setTestEmailResult(null);
                          MailService.saveCredentials(emailCreds);
                          try {
                            const sampleInq = {
                              id: `inq-sample-${Date.now().toString().slice(-4)}`,
                              fullName: 'Alexander Wright',
                              companyName: 'Global Spice Trading Ltd',
                              businessEmail: testEmailTarget.trim() || 'export@origintra.com',
                              country: 'United Kingdom',
                              phoneWhatsApp: '+44 7911 123456',
                              product: 'Green Cardamom (8mm Bold)',
                              productForm: 'Whole Pods Export Grade',
                              quantityRequired: '2x 20ft FCL Container (28 Metric Tons)',
                              destinationPort: 'Felixstowe Port, UK',
                              packagingRequirement: '25kg Multiwall Kraft Bags with Poly Liner',
                              message: 'Sample test inquiry: Please provide CIF Felixstowe price quotation with laboratory pesticide screening certificate.',
                              createdAt: new Date().toISOString(),
                              status: 'new' as const,
                              source: 'quote_modal' as const
                            };
                            const res = await MailService.dispatchInquiryAlert(sampleInq);
                            setTestEmailResult({ ok: res.success, message: res.message });
                            if (res.success) {
                              showToast(`Sample inquiry alert sent to admin: ${emailCreds.adminAlertEmail}!`);
                            }
                          } catch (err: any) {
                            setTestEmailResult({ ok: false, message: err?.message || 'Send error' });
                          } finally {
                            setIsSendingTestEmail(false);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        title="Send sample inquiry alert to admin"
                      >
                        <Inbox className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Send Test Inquiry Alert</span>
                      </button>

                      <button
                        type="button"
                        disabled={isVerifyingSmtp}
                        onClick={async () => {
                          setIsVerifyingSmtp(true);
                          setVerifySmtpResult(null);
                          try {
                            const res = await MailService.verifySmtp(emailCreds);
                            setVerifySmtpResult({ ok: res.success, message: res.message });
                          } catch (err: any) {
                            setVerifySmtpResult({ ok: false, message: err?.message || 'Verification error' });
                          } finally {
                            setIsVerifyingSmtp(false);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isVerifyingSmtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0070E0]" /> : <Server className="w-3.5 h-3.5 text-[#0070E0]" />}
                        <span>{isVerifyingSmtp ? 'Verifying SMTP...' : 'Verify SMTP Connection'}</span>
                      </button>
                    </div>
                  </div>

                  {verifySmtpResult && (
                    <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      verifySmtpResult.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {verifySmtpResult.ok ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                      <span>{verifySmtpResult.message}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                    <input
                      type="email"
                      value={testEmailTarget}
                      onChange={(e) => setTestEmailTarget(e.target.value)}
                      placeholder="Enter test recipient email"
                      className="w-full sm:flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#0070E0]"
                    />
                    <button
                      type="button"
                      disabled={isSendingTestEmail}
                      onClick={async () => {
                        if (!testEmailTarget.trim()) {
                          alert('Please enter a test recipient email.');
                          return;
                        }
                        setIsSendingTestEmail(true);
                        setTestEmailResult(null);
                        MailService.saveCredentials(emailCreds);
                        try {
                          const res = await MailService.sendTestEmail(testEmailTarget.trim());
                          setTestEmailResult({ ok: res.success, message: res.message });
                          if (res.success) {
                            showToast(`Test email dispatched to ${testEmailTarget}!`);
                          }
                        } catch (err: any) {
                          setTestEmailResult({ ok: false, message: err?.message || 'Send error' });
                        } finally {
                          setIsSendingTestEmail(false);
                        }
                      }}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0A1C3E] hover:bg-[#0070E0] text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                    >
                      {isSendingTestEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{isSendingTestEmail ? 'Sending Test...' : 'Send Live Test Email'}</span>
                    </button>
                  </div>

                  {testEmailResult && (
                    <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      testEmailResult.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {testEmailResult.ok ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                      <span>{testEmailResult.message}</span>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-xs">
                    {saveEmailCredsSuccess ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-lg animate-in fade-in">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Credentials saved & active for Nodemailer!
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Credentials are stored securely and used by Nodemailer to dispatch welcome emails.
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={isSavingEmailCreds}
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsSavingEmailCreds(true);
                      setSaveEmailCredsSuccess(false);
                      try {
                        const res = await MailService.saveCredentials(emailCreds);
                        setSaveEmailCredsSuccess(true);
                        showToast(res.message || 'Email credentials saved successfully!');
                        setTimeout(() => setSaveEmailCredsSuccess(false), 4000);
                      } catch (err: any) {
                        showToast(err?.message || 'Failed to save email credentials.');
                      } finally {
                        setIsSavingEmailCreds(false);
                      }
                    }}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-sm cursor-pointer inline-flex items-center justify-center gap-2 ${
                      saveEmailCredsSuccess
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25'
                        : isSavingEmailCreds
                        ? 'bg-[#0070E0] opacity-80 text-white cursor-wait'
                        : 'bg-[#0070E0] hover:bg-blue-600 text-white shadow-blue-500/20 active:scale-95'
                    }`}
                  >
                    {isSavingEmailCreds ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Saving Credentials...</span>
                      </>
                    ) : saveEmailCredsSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Credentials Saved!</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Save Email Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* TAB: USER MANAGEMENT & ROLE CONTROL (RBAC) */}
          {/* ======================================= */}
          {activeTab === 'users' && canAccessUsers && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-display font-bold text-[#0F172A]">
                      User Management & Role Permissions
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                      {users.length} Users in Database
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assign role-based access control (RBAC). Authors post with their name and custom dates; Editors control commodities; Sales manage buyer inquiries.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5"
                    title="Configure Nodemailer & Email SMTP credentials"
                  >
                    <Mail className="w-4 h-4 text-[#0070E0]" />
                    <span>Email & Nodemailer Setup</span>
                  </button>
                  <button
                    onClick={handleOpenAddUser}
                    className="px-4 py-2.5 rounded-xl bg-[#0070E0] hover:bg-blue-600 text-white text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add New User</span>
                  </button>
                </div>
              </div>

              {/* Roles Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px] uppercase">
                      Admin
                    </span>
                    <span className="text-xs font-bold text-slate-700">{users.filter(u => u.role === 'admin').length} accounts</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Super Administrator</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Full privileges over all modules: products, blogs, team roster, inquiries, user creation & database config.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">
                      Editor
                    </span>
                    <span className="text-xs font-bold text-slate-700">{users.filter(u => u.role === 'editor').length} accounts</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Content Editor</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Can manage product catalog specs, publish and modify blog articles, leadership profiles & media assets.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase">
                      Author
                    </span>
                    <span className="text-xs font-bold text-slate-700">{users.filter(u => u.role === 'author').length} accounts</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Staff Author</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Can write, edit & publish trade insights articles with automatic author name stamp and calendar date picker.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 font-bold text-[10px] uppercase">
                      Sales
                    </span>
                    <span className="text-xs font-bold text-slate-700">{users.filter(u => u.role === 'sales').length} accounts</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Sales Specialist</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Reviews buyer quote inquiries, updates lead stages (negotiation/contacted), and exports CSV lead reports.
                  </p>
                </div>
              </div>

              {/* Users Roster Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-slate-800">
                    Registered Database Accounts
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    data/database.json • {users.length} active
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Assigned Role</th>
                        <th className="py-3 px-4">Department / Designation</th>
                        <th className="py-3 px-4">Created Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition">
                          
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={u.avatar || '/assets/team/director.jpg'}
                                alt={u.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 bg-slate-100 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/assets/team/director.jpg';
                                }}
                              />
                              <div>
                                <div className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {currentUser?.id === u.id && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-bold">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">{u.id}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-600">
                            {u.email}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-800'
                                : u.role === 'editor'
                                ? 'bg-blue-100 text-blue-800'
                                : u.role === 'author'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-cyan-100 text-cyan-800'
                            }`}>
                              {u.role}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {u.department || 'Trade Operations'}
                          </td>

                          <td className="py-3 px-4 text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => {
                                  const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin` : 'https://www.origintra.com/admin';
                                  const payload: WelcomeEmailPayload = {
                                    toEmail: u.email,
                                    userName: u.name,
                                    password: '(Existing password on record)',
                                    role: u.role,
                                    department: u.department,
                                    loginUrl: portalUrl,
                                    adminName: currentUser?.name || 'Origintra Exim Super Administrator'
                                  };
                                  MailService.openMailClient(payload);
                                  showToast(`Opened email client with credentials for ${u.email}`);
                                }}
                                className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition cursor-pointer"
                                title="Send / Resend Welcome Email with Portal Instructions"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditUser(u)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition cursor-pointer"
                                title="Edit User"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                disabled={currentUser?.id === u.id}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  currentUser?.id === u.id
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'hover:bg-red-50 text-slate-500 hover:text-red-600'
                                }`}
                                title={currentUser?.id === u.id ? 'Cannot delete active logged-in user' : 'Delete User'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}


          {/* ======================================= */}
          {/* TAB: LEGAL POLICIES MANAGER */}
          {/* ======================================= */}
          {activeTab === 'legal' && canAccessLegal && (
            <LegalPoliciesManager
              showToast={showToast}
              onNavigate={onNavigate}
            />
          )}

          {/* ======================================= */}
          {/* TAB: EDIT PROFILE (DEDICATED PROFILE PAGE) */}
          {/* ======================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-6xl animate-in fade-in duration-200">
              {/* Breadcrumb Navigation & Top Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="hover:text-[#0070E0] transition flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Dashboard</span>
                    </button>
                    <span>/</span>
                    <span className="text-slate-800 font-semibold">Account Settings</span>
                    <span>/</span>
                    <span className="text-blue-600 font-bold">Edit Profile</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0A1C3E] tracking-tight">
                    Edit Admin Profile
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Update your corporate identity, profile photo, contact details, designation, and login credentials.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Dashboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSaveProfile(e as any)}
                    disabled={isSavingProfile}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0070E0] to-[#0A1C3E] hover:from-blue-600 hover:to-slate-900 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </div>

              {/* Main 2-Column Responsive Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Avatar & Account Meta (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Avatar Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-4">
                    <div className="relative inline-block mx-auto">
                      <img
                        src={profileForm.avatar || '/assets/team/director.jpg'}
                        alt={profileForm.name}
                        className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-500/20 bg-slate-100 shadow-md mx-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/team/director.jpg';
                        }}
                      />
                      <label className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#0070E0] hover:bg-blue-600 text-white flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-105 ring-2 ring-white">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDevicePhotoUpload(file, 'profile');
                          }}
                        />
                      </label>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{profileForm.name || 'Patel Arsh'}</h3>
                      <p className="text-xs text-slate-500 font-medium">{profileForm.department || 'MD & Founder'}</p>
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300/40">
                          {currentUser?.role?.toUpperCase() || 'ADMIN'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Active Session
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <label className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-blue-700 text-xs font-bold transition cursor-pointer border border-blue-200/60">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload New Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDevicePhotoUpload(file, 'profile');
                          }}
                        />
                      </label>

                      {/* Direct Avatar URL Input */}
                      <div className="text-left pt-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Or Paste Avatar Photo URL:
                        </label>
                        <input
                          type="text"
                          value={profileForm.avatar}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, avatar: e.target.value }))}
                          placeholder="https://... or /assets/team/director.jpg"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#0070E0] bg-slate-50/50"
                        />
                      </div>

                      {/* Preset Avatars */}
                      <div className="text-left pt-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                          Quick Presets:
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setProfileForm(prev => ({ ...prev, avatar: '/assets/team/director.jpg' }))}
                            className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 hover:border-blue-400 bg-white font-medium text-slate-700 cursor-pointer transition hover:bg-blue-50"
                            title="Director Photo"
                          >
                            Director Photo
                          </button>
                          <button
                            type="button"
                            onClick={() => setProfileForm(prev => ({ ...prev, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' }))}
                            className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 hover:border-blue-400 bg-white font-medium text-slate-700 cursor-pointer transition hover:bg-blue-50"
                            title="Executive Portrait"
                          >
                            Executive 2
                          </button>
                          <button
                            type="button"
                            onClick={() => setProfileForm(prev => ({ ...prev, avatar: '/assets/team/director.jpg' }))}
                            className="px-2 py-1 text-[11px] rounded-lg border border-red-200 text-red-600 font-medium cursor-pointer transition hover:bg-red-50"
                            title="Reset to default"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Security Meta Info */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Security & Corporate Privileges</span>
                    </div>
                    <div className="space-y-2 text-slate-600">
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Security Encryption:</span>
                        <strong className="text-slate-800 font-mono text-[11px]">SHA-256 Validated</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Firm Affiliation:</span>
                        <strong className="text-slate-800 font-semibold">Origintra Exim</strong>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                        <span className="text-slate-500">Access Scope:</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">FULL ACCESS</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500">Account ID:</span>
                        <span className="font-mono text-[10px] text-slate-500 truncate max-w-[140px]">{currentUser?.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Profile Edit Form (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Card 1: Personal & Designation Details */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-[#0070E0]" />
                          <h3 className="text-sm font-bold text-slate-800">
                            Corporate Identity & Contact Information
                          </h3>
                        </div>
                        <span className="text-[11px] text-slate-400">* Required fields</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Profile Name */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={profileForm.name}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g. Patel Arsh"
                              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0070E0] focus:ring-2 focus:ring-blue-100 transition font-medium"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Appears across quotes, emails, and header.</p>
                        </div>

                        {/* Email Address */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Corporate Email <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              required
                              value={profileForm.email}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="e.g. arsh@origintra.com"
                              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0070E0] focus:ring-2 focus:ring-blue-100 transition font-medium"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Used for signing in and receiving RFQ notifications.</p>
                        </div>

                        {/* Designation / Role Title */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Designation / Job Title <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={profileForm.department}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))}
                              placeholder="e.g. MD & Founder / Global Trade Head"
                              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0070E0] focus:ring-2 focus:ring-blue-100 transition font-medium"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Shown beneath your name in the Admin header.</p>
                        </div>

                        {/* Contact Number / WhatsApp */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Contact Phone / WhatsApp <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              required
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="+91 70691 82990"
                              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0070E0] focus:ring-2 focus:ring-blue-100 transition font-medium"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Official phone number for trade correspondence.</p>
                        </div>
                      </div>

                      {/* Bio / Professional Summary */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Professional Bio & Executive Summary
                        </label>
                        <textarea
                          rows={3}
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Brief summary of your responsibilities at Origintra Exim..."
                          className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0070E0] focus:ring-2 focus:ring-blue-100 transition font-medium leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Card 2: Security & Password Update */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-amber-600" />
                          <h3 className="text-sm font-bold text-slate-800">
                            Security Credentials & Password
                          </h3>
                        </div>
                        <span className="text-[11px] text-slate-500">Optional — leave blank to keep current</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* New Password */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showProfilePassword ? 'text' : 'password'}
                              value={profileForm.newPassword}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              placeholder="Enter minimum 6 characters..."
                              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0070E0] focus:ring-2 focus:ring-blue-100 transition font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => setShowProfilePassword(prev => !prev)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                              title={showProfilePassword ? 'Hide password' : 'Show password'}
                            >
                              {showProfilePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm New Password */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showProfilePassword ? 'text' : 'password'}
                              value={profileForm.confirmPassword}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Re-type new password to verify..."
                              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0070E0] focus:ring-2 focus:ring-blue-100 transition font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      {profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword && (
                        <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Passwords do not match yet.</span>
                        </p>
                      )}

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Tip: Leaving password fields empty will retain your existing credentials intact. If changing password, it will be cryptographically updated immediately.
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (currentUser) {
                              setProfileForm({
                                name: currentUser.name || 'Patel Arsh',
                                email: currentUser.email || 'arsh@origintra.com',
                                department: currentUser.department || 'MD & Founder',
                                phone: currentUser.phone || '+91 70691 82990',
                                avatar: currentUser.avatar || '/assets/team/director.jpg',
                                bio: currentUser.bio || '',
                                newPassword: '',
                                confirmPassword: '',
                              });
                              showToast('Form reset to saved profile.');
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                        >
                          Discard Changes
                        </button>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0070E0] to-[#0A1C3E] hover:from-blue-600 hover:to-slate-900 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          {isSavingProfile ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span>{isSavingProfile ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

            {/* ======================================= */}
      {/* MODAL 3: INQUIRY DETAILS VIEW */}
      {/* ======================================= */}
      {viewingInquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
            
            <div className="bg-[#0A1C3E] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#38BDF8] tracking-wider">
                  Lead Information
                </span>
                <h3 className="text-base font-bold font-display text-white">
                  Inquiry from {viewingInquiry.fullName}
                </h3>
              </div>
              <button
                onClick={() => { setViewingInquiry(null); setIsReplyingEmail(false); }}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">Buyer Name</span>
                  <strong className="text-slate-800 text-sm">{viewingInquiry.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Company Name</span>
                  <strong className="text-slate-800">{viewingInquiry.companyName || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Email Address</span>
                  <a href={`mailto:${viewingInquiry.businessEmail}`} className="text-[#0070E0] font-mono hover:underline">
                    {viewingInquiry.businessEmail}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Phone / WhatsApp</span>
                  <a href={`https://wa.me/${viewingInquiry.phoneWhatsApp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-emerald-600 font-mono hover:underline">
                    {viewingInquiry.phoneWhatsApp}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Country</span>
                  <strong className="text-slate-800">{viewingInquiry.country}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Discharge Port</span>
                  <strong className="text-slate-800">{viewingInquiry.destinationPort || '—'}</strong>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100 space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Requested Commodity</span>
                <div className="text-sm font-bold text-[#0F172A]">{viewingInquiry.product}</div>
                <div className="text-xs text-slate-600">Volume: <strong className="text-slate-800">{viewingInquiry.quantityRequired}</strong></div>
                {viewingInquiry.packagingRequirement && (
                  <div className="text-xs text-slate-600">Packaging: <strong className="text-slate-800">{viewingInquiry.packagingRequirement}</strong></div>
                )}
              </div>

              {viewingInquiry.message && (
                <div className="space-y-1">
                  <span className="font-semibold text-slate-700 block">Buyer Message:</span>
                  <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 leading-relaxed italic">
                    "{viewingInquiry.message}"
                  </p>
                </div>
              )}

              {/* Inline Animated Email Reply Composer */}
              {isReplyingEmail && (
                <div className="p-4 bg-gradient-to-br from-blue-50/70 to-slate-50 rounded-2xl border border-blue-200/90 space-y-3.5 shadow-2xs animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2.5 border-b border-blue-100">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#0070E0] text-white flex items-center justify-center shadow-xs">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>Email Reply Composer</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-200">Pure Nodemailer</span>
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Sending directly to: <strong className="text-blue-700 font-mono">{viewingInquiry.businessEmail}</strong>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsReplyingEmail(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                      title="Close composer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 1-Click Response Template Chips */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      1-Click Response Templates:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => applyEmailTemplate('acknowledgement')}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/70 text-slate-700 font-medium transition cursor-pointer shadow-2xs"
                      >
                        💬 RFQ Acknowledgement
                      </button>
                      <button
                        type="button"
                        onClick={() => applyEmailTemplate('quote')}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/70 text-slate-700 font-medium transition cursor-pointer shadow-2xs"
                      >
                        📋 Quotation & Specifications
                      </button>
                      <button
                        type="button"
                        onClick={() => applyEmailTemplate('sample')}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/70 text-slate-700 font-medium transition cursor-pointer shadow-2xs"
                      >
                        📦 Courier Sample Offer
                      </button>
                    </div>
                  </div>

                  {/* Subject Line Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={emailReplySubject}
                      onChange={(e) => setEmailReplySubject(e.target.value)}
                      placeholder="e.g. Re: Commercial Inquiry for Bulk Indian Spices - Origintra Exim"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-[#0070E0] focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
                    />
                  </div>

                  {/* Reply Message Body */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Reply Message Body <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Branded Origintra Exim HTML template applied automatically</span>
                    </div>
                    <textarea
                      rows={6}
                      required
                      value={emailReplyMessage}
                      onChange={(e) => setEmailReplyMessage(e.target.value)}
                      placeholder="Write your email reply to the client here..."
                      className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium leading-relaxed focus:outline-none focus:border-[#0070E0] focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
                    />
                  </div>

                  {/* Composer Bottom Bar */}
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-blue-100">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>From: <strong>{currentUser?.name || 'Patel Arsh'}</strong> ({currentUser?.email || 'export@origintra.com'})</span>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setIsReplyingEmail(false)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleSendEmailReply}
                        disabled={isSendingEmailReply || !emailReplyMessage.trim()}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#0070E0] to-[#0A1C3E] hover:from-blue-600 hover:to-slate-900 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {isSendingEmailReply ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{isSendingEmailReply ? 'Sending to Client...' : 'Send Email to Client'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <select
                    value={viewingInquiry.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as Inquiry['status'];
                      handleUpdateInquiryStatus(viewingInquiry.id, newStatus);
                      setViewingInquiry({ ...viewingInquiry, status: newStatus });
                    }}
                    className="px-3 py-1.5 rounded-lg border font-semibold bg-white text-xs text-slate-800"
                  >
                    <option value="new">NEW</option>
                    <option value="contacted">CONTACTED</option>
                    <option value="negotiation">NEGOTIATION</option>
                    <option value="closed">CLOSED</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isReplyingEmail) {
                        setIsReplyingEmail(true);
                        applyEmailTemplate('acknowledgement');
                      } else {
                        setIsReplyingEmail(false);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-white font-semibold flex items-center space-x-1.5 transition cursor-pointer text-xs shadow-2xs ${
                      isReplyingEmail ? 'bg-slate-700 hover:bg-slate-800' : 'bg-[#0070E0] hover:bg-blue-600'
                    }`}
                    title="Send an email response directly to buyer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{isReplyingEmail ? 'Hide Email Composer' : 'Reply via Email'}</span>
                  </button>

                  <a
                    href={`https://wa.me/${viewingInquiry.phoneWhatsApp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(viewingInquiry.fullName)},%20thank%20you%20for%20contacting%20Origintra%20Exim%20regarding%20${encodeURIComponent(viewingInquiry.product)}.`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Reply on WhatsApp</span>
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL 4: BLOG ARTICLE PREVIEW */}
      {/* ======================================= */}
      {blogPreviewPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[85vh] flex flex-col">
            
            <div className="bg-[#0A1C3E] px-6 py-4 text-white flex items-center justify-between shrink-0">
              <span className="text-xs font-semibold text-[#38BDF8]">
                Article Live Preview
              </span>
              <button
                onClick={() => setBlogPreviewPost(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800">
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                  {blogPreviewPost.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0F172A]">
                  {blogPreviewPost.title}
                </h1>
                <p className="text-sm text-slate-500">
                  By {blogPreviewPost.author} • {blogPreviewPost.date} • {blogPreviewPost.readTime}
                </p>
              </div>

              <div className="rounded-xl overflow-hidden aspect-16/9 bg-slate-100">
                <img src={blogPreviewPost.image} alt={blogPreviewPost.title} className="w-full h-full object-cover" />
              </div>

              <p className="text-base text-slate-600 font-medium leading-relaxed border-l-4 border-[#0070E0] pl-4 italic">
                {blogPreviewPost.excerpt}
              </p>

              <div className="space-y-6 pt-4 border-t border-slate-100">
                {blogPreviewPost.content.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    {sec.heading && (
                      <h2 className="text-lg font-bold font-display text-[#0F172A]">
                        {sec.heading}
                      </h2>
                    )}
                    {sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-sm text-slate-600 leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setBlogPreviewPost(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* MODAL 5: ADD / EDIT LEADERSHIP TEAM MEMBER */}
      {/* =================================================== */}
      {isTeamModalOpen && editingTeamMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 bg-[#0A1C3E] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#38BDF8]" />
                <h3 className="font-display font-bold text-base">
                  {editingTeamMember.name ? `Edit Leader: ${editingTeamMember.name}` : 'Add New Leadership Member'}
                </h3>
              </div>
              <button
                onClick={() => setIsTeamModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeamMember} className="p-6 overflow-y-auto flex-1 space-y-5">
              
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {/* Photo Live Preview with Click-to-Select */}
                <div 
                  onClick={handleOpenTeamPhotoGallery}
                  className="w-28 h-36 rounded-2xl bg-slate-100 overflow-hidden border-2 border-dashed border-slate-300 hover:border-[#0070E0] shrink-0 shadow-2xs relative cursor-pointer group transition"
                  title="Click to select photo from gallery"
                >
                  {editingTeamMember.photo ? (
                    <img
                      src={editingTeamMember.photo}
                      alt="Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/team/director.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px] p-2 text-center">
                      <UserIcon className="w-6 h-6 mb-1 text-slate-300" />
                      <span>Photo Preview</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[11px] font-semibold text-center p-2">
                    <ImageIcon className="w-5 h-5 mb-1" />
                    <span>Choose Photo</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingTeamMember.name}
                      onChange={(e) => setEditingTeamMember({ ...editingTeamMember, name: e.target.value })}
                      placeholder="e.g. Rajesh V. Patel"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Position / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingTeamMember.position || ''}
                      onChange={(e) => setEditingTeamMember({ ...editingTeamMember, position: e.target.value })}
                      placeholder="e.g. Founder & Managing Director"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Leader Photo *
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleOpenTeamPhotoGallery}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer border border-sky-200"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                          <span>Select from Gallery</span>
                        </button>
                        <label className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleDevicePhotoUpload(f, 'team');
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <input
                      type="text"
                      required
                      value={editingTeamMember.photo || ''}
                      onChange={(e) => setEditingTeamMember({ ...editingTeamMember, photo: e.target.value })}
                      placeholder="Select from gallery or enter photo path..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#0070E0]"
                    />

                    {/* Quick Avatar Strip of Leadership Portraits */}
                    <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">Quick Pick:</span>
                      {teamPortraits.map((p) => {
                        const isMatch = editingTeamMember.photo === p.url;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setEditingTeamMember({ ...editingTeamMember, photo: p.url })}
                            className={`shrink-0 w-8 h-8 rounded-full border-2 overflow-hidden transition cursor-pointer ${
                              isMatch
                                ? 'border-[#0070E0] ring-2 ring-blue-300 scale-110 shadow-xs'
                                : 'border-slate-200 opacity-70 hover:opacity-100 hover:scale-105'
                            }`}
                            title={`${p.title} (${p.tag || 'Leader'})`}
                          >
                            <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={handleOpenTeamPhotoGallery}
                        className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-[#0070E0] bg-blue-50 rounded-full hover:bg-blue-100 transition cursor-pointer"
                      >
                        + All ({galleryImages.length})
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Operational Role / Department
                  </label>
                  <input
                    type="text"
                    value={editingTeamMember.role || ''}
                    onChange={(e) => setEditingTeamMember({ ...editingTeamMember, role: e.target.value })}
                    placeholder="e.g. Global Trade Strategy & Commercial Partnerships"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Credentials & Experience Pill
                  </label>
                  <input
                    type="text"
                    value={editingTeamMember.credentials || ''}
                    onChange={(e) => setEditingTeamMember({ ...editingTeamMember, credentials: e.target.value })}
                    placeholder="e.g. 18+ Years in Agri-Commodity Exports"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Specialization Focus Area
                </label>
                <input
                  type="text"
                  value={editingTeamMember.specialization || ''}
                  onChange={(e) => setEditingTeamMember({ ...editingTeamMember, specialization: e.target.value })}
                  placeholder="e.g. International Trade Finance, Export Compliance & Foreign Buyer Relations"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Short Biography (Displayed on About Us page)
                </label>
                <textarea
                  rows={3}
                  value={editingTeamMember.bio || ''}
                  onChange={(e) => setEditingTeamMember({ ...editingTeamMember, bio: e.target.value })}
                  placeholder="Describe trade responsibilities, background, and achievements..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  LinkedIn Profile URL (Optional)
                </label>
                <input
                  type="url"
                  value={editingTeamMember.linkedIn || ''}
                  onChange={(e) => setEditingTeamMember({ ...editingTeamMember, linkedIn: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0070E0] hover:bg-blue-600 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
                >
                  Save Leader Profile
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* MODAL: ADD / EDIT BUYER TESTIMONIAL (LIVE PREVIEW) */}
      {/* =================================================== */}
      {isTestimonialModalOpen && editingTestimonial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0A1C3E] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <Quote className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base">
                    {testimonials.some(t => t.id === editingTestimonial.id) 
                      ? `Edit Client Review: ${editingTestimonial.author || 'Buyer'}` 
                      : 'Add New Client Review'}
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    Will be synced directly into the database and displayed on the homepage infinite marquee.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTestimonialModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split Form + Live Card Preview */}
            <form onSubmit={handleSaveTestimonial} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Form Inputs (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Author Name & Designation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Buyer / Author Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingTestimonial.author}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, author: e.target.value })}
                        placeholder="e.g. Tariq Al-Mansoor"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Role / Designation *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingTestimonial.role}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                        placeholder="e.g. Head of Agricultural Procurement"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                      />
                    </div>
                  </div>

                  {/* Company & Commodity Supplied */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Company / Organization *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingTestimonial.company}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                        placeholder="e.g. Al-Ameen Food Distribution LLC"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Commodity Supplied
                      </label>
                      <input
                        type="text"
                        value={editingTestimonial.commodity}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, commodity: e.target.value })}
                        placeholder="e.g. Guntur S17 Whole Chillies & Powder"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                      />
                    </div>
                  </div>

                  {/* Destination & Country Selector with Dynamic Flag */}
                  <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#0070E0]" />
                        <span>Trade Destination Country & Flag *</span>
                      </label>
                      {/* Live Flag Badge in Form Header */}
                      {(() => {
                        const activeFlag = getCountryFlag(editingTestimonial.country || editingTestimonial.destinationPort);
                        return (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs self-start sm:self-auto">
                            <img
                              src={`https://flagcdn.com/w40/${activeFlag.code}.png`}
                              alt={activeFlag.name}
                              className="w-4.5 h-3 object-cover rounded-[2px] shadow-2xs"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                            <span className="text-[#0070E0]">{activeFlag.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({activeFlag.code.toUpperCase()})</span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Destination Select Dropdown & Country Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Select Destination Country (Dropdown)
                        </label>
                        <select
                          value={
                            TRADE_DESTINATIONS.some(d => d.country.toLowerCase() === (editingTestimonial.country || '').toLowerCase() || d.shortName.toLowerCase() === (editingTestimonial.country || '').toLowerCase())
                              ? TRADE_DESTINATIONS.find(d => d.country.toLowerCase() === (editingTestimonial.country || '').toLowerCase() || d.shortName.toLowerCase() === (editingTestimonial.country || '').toLowerCase())?.country
                              : 'custom'
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'custom') return;
                            const matched = TRADE_DESTINATIONS.find(d => d.country === val);
                            if (matched) {
                              setEditingTestimonial({
                                ...editingTestimonial,
                                country: matched.country,
                                destinationPort: matched.defaultPort
                              });
                            }
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:ring-2 focus:ring-[#0070E0] cursor-pointer"
                        >
                          <option value="" disabled>-- Select Export Destination --</option>
                          {['Middle East & GCC', 'Europe & UK', 'Asia-Pacific', 'Americas & Africa', 'South Asia', 'Domestic / Origin'].map(reg => (
                            <optgroup key={reg} label={reg}>
                              {TRADE_DESTINATIONS.filter(d => d.region === reg).map(d => (
                                <option key={d.code} value={d.country}>
                                  {d.emoji} {d.country} ({d.shortName})
                                </option>
                              ))}
                            </optgroup>
                          ))}
                          <option value="custom">✏️ Enter Custom Destination...</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Country Name (Editable) *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingTestimonial.country}
                          onChange={(e) => {
                            const newCountry = e.target.value;
                            const detected = getCountryFlag(newCountry);
                            const matchingDest = TRADE_DESTINATIONS.find(d => d.code === detected.code);
                            setEditingTestimonial({
                              ...editingTestimonial,
                              country: newCountry,
                              destinationPort: (!editingTestimonial.destinationPort || editingTestimonial.destinationPort === 'Port of Jebel Ali, UAE') && matchingDest
                                ? matchingDest.defaultPort
                                : editingTestimonial.destinationPort
                            });
                          }}
                          placeholder="e.g. United Arab Emirates, Netherlands, UK..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#0070E0]"
                        />
                      </div>
                    </div>

                    {/* Quick Pick Popular Destination Badges */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Quick Pick:</span>
                      {[
                        { name: 'UAE', country: 'United Arab Emirates', port: 'Port of Jebel Ali, UAE', emoji: '🇦🇪' },
                        { name: 'Saudi Arabia', country: 'Saudi Arabia', port: 'Jeddah Islamic Port, KSA', emoji: '🇸🇦' },
                        { name: 'Malaysia', country: 'Malaysia', port: 'Port Klang, Malaysia', emoji: '🇲🇾' },
                        { name: 'Singapore', country: 'Singapore', port: 'Port of Singapore (PSA)', emoji: '🇸🇬' },
                        { name: 'Netherlands', country: 'Netherlands', port: 'Port of Rotterdam, Netherlands', emoji: '🇳🇱' },
                        { name: 'Germany', country: 'Germany', port: 'Port of Hamburg, Germany', emoji: '🇩🇪' },
                        { name: 'UK', country: 'United Kingdom', port: 'Port of Felixstowe, UK', emoji: '🇬🇧' },
                        { name: 'USA', country: 'United States', port: 'Port of New York / New Jersey, USA', emoji: '🇺🇸' },
                        { name: 'Australia', country: 'Australia', port: 'Port of Melbourne, Australia', emoji: '🇦🇺' },
                        { name: 'Japan', country: 'Japan', port: 'Port of Yokohama / Tokyo, Japan', emoji: '🇯🇵' }
                      ].map((quick, qIdx) => (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => {
                            setEditingTestimonial({
                              ...editingTestimonial,
                              country: quick.country,
                              destinationPort: quick.port
                            });
                          }}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] transition cursor-pointer shrink-0 ${
                            editingTestimonial.country === quick.country || editingTestimonial.country === quick.name
                              ? 'bg-blue-100/90 border-[#0070E0] text-[#0070E0] font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{quick.emoji}</span>
                          <span>{quick.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Destination Discharge Port Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-600">
                          Destination Discharge Port (Customizable)
                        </label>
                        <span className="text-[10px] text-slate-400">Updates flag automatically based on port</span>
                      </div>
                      <input
                        type="text"
                        value={editingTestimonial.destinationPort}
                        onChange={(e) => {
                          const newPort = e.target.value;
                          const detected = getCountryFlag(newPort);
                          const matchingDest = TRADE_DESTINATIONS.find(d => d.code === detected.code);
                          setEditingTestimonial({
                            ...editingTestimonial,
                            destinationPort: newPort,
                            country: (!editingTestimonial.country || editingTestimonial.country === 'United Arab Emirates') && matchingDest
                              ? matchingDest.country
                              : editingTestimonial.country
                          });
                        }}
                        placeholder="e.g. Port of Jebel Ali, UAE / Port of Rotterdam / Port of Felixstowe"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#0070E0]"
                      />
                    </div>
                  </div>

                  {/* Volume/Order Type & Rating */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Contract Volume / Consignment Type
                      </label>
                      <input
                        type="text"
                        value={editingTestimonial.volumeOrType || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, volumeOrType: e.target.value })}
                        placeholder="e.g. Commercial FCL Containers / 120 MT Annual"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Star Rating ({editingTestimonial.rating || 5} / 5 Stars)
                      </label>
                      <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setEditingTestimonial({ ...editingTestimonial, rating: starVal })}
                            className="p-1 text-slate-300 hover:text-amber-400 transition cursor-pointer"
                            title={`${starVal} Star${starVal > 1 ? 's' : ''}`}
                          >
                            <Star
                              className={`w-5 h-5 ${
                                starVal <= (editingTestimonial.rating || 5)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-2">
                          {editingTestimonial.rating || 5}.0 / 5.0
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial Quote Statement */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Testimonial Statement / Commercial Feedback *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={editingTestimonial.testimonial}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, testimonial: e.target.value })}
                      placeholder="Commercial feedback regarding cargo quality, moisture levels, fumigation certificates, packaging compliance, and vessel transit reliability..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                    />
                  </div>

                  {/* Avatar / Portrait Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Buyer Avatar / Portrait Photo (Optional)
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleOpenTestimonialPhotoGallery}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer border border-sky-200"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                          <span>Select from Gallery</span>
                        </button>
                        <label className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleDevicePhotoUpload(f, 'testimonial');
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={editingTestimonial.avatar || ''}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, avatar: e.target.value })}
                      placeholder="Leave empty for auto-generated monogram or enter photo URL..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#0070E0]"
                    />

                    {/* Quick Preset Avatars Strip */}
                    <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">Quick Pick:</span>
                      {[
                        { name: 'Tariq', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
                        { name: 'Lars', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
                        { name: 'Mei-Ling', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
                        { name: 'Klaus', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80' },
                        { name: 'Marcus', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' }
                      ].map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setEditingTestimonial({ ...editingTestimonial, avatar: preset.url })}
                          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition cursor-pointer shrink-0 ${
                            editingTestimonial.avatar === preset.url
                              ? 'bg-blue-50 border-[#0070E0] text-[#0070E0] font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-4 h-4 rounded-full object-cover" />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                      {editingTestimonial.avatar && (
                        <button
                          type="button"
                          onClick={() => setEditingTestimonial({ ...editingTestimonial, avatar: '' })}
                          className="text-[11px] text-red-500 hover:text-red-700 font-semibold px-1 shrink-0 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Side: Live Card Preview (5 Cols) */}
                <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0070E0]" />
                      <span>Live Marquee Card Preview</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Real-time
                    </span>
                  </div>

                  {/* The Preview Card (identical to homepage infinite marquee) */}
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                    <div>
                      {/* Top Row: Stars + Trade Commodity Badge */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center space-x-1">
                          {[...Array(editingTestimonial.rating || 5)].map((_, sIdx) => (
                            <Star key={sIdx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>

                        {(editingTestimonial.volumeOrType || editingTestimonial.commodity) && (
                          <span className="text-[10px] font-semibold text-[#0070E0] bg-blue-50 border border-blue-100/80 px-2.5 py-0.5 rounded-full truncate max-w-[200px]">
                            {editingTestimonial.volumeOrType || editingTestimonial.commodity}
                          </span>
                        )}
                      </div>

                      {/* Testimonial Quote with Typographic Quotes */}
                      <p className="text-sm sm:text-base text-[#0F172A] leading-relaxed font-normal">
                        <span className="font-serif text-lg text-[#0F172A] mr-1 select-none">“</span>
                        {editingTestimonial.testimonial || 'Commercial buyer feedback statement will appear here as you type in the form.'}
                        <span className="font-serif text-lg text-[#0F172A] ml-1 select-none">”</span>
                      </p>
                    </div>

                    {/* Thin Horizontal Divider */}
                    <div className="border-t border-slate-100 my-5" />

                    {/* Bottom Metadata: Avatar & Author on Left, Country Flag Pill on Right */}
                    <div className="flex items-center justify-between gap-3 pt-0.5">
                      {/* Avatar + Author Info */}
                      <div className="flex items-center space-x-3 min-w-0">
                        {editingTestimonial.avatar ? (
                          <img
                            src={editingTestimonial.avatar}
                            alt="Avatar"
                            width="44"
                            height="44"
                            className="w-11 h-11 rounded-full object-cover border border-slate-100 shrink-0 shadow-2xs"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 tracking-wider shadow-2xs">
                            {(editingTestimonial.author || 'Buyer').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-sm sm:text-base font-bold text-[#0F172A] truncate tracking-tight leading-snug">
                            {editingTestimonial.author || 'Buyer Author Name'}
                          </h4>
                          <p className="text-xs text-slate-500 font-normal truncate mt-0.5">
                            {editingTestimonial.role || editingTestimonial.company || 'VP Sourcing & Procurement'}
                          </p>
                        </div>
                      </div>

                      {/* Right: Modern Country Pill with National Flag */}
                      {(() => {
                        const modalFlag = getCountryFlag(editingTestimonial.country || editingTestimonial.destinationPort);
                        return (
                          <div className="bg-slate-100/90 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5 border border-slate-200/60 shrink-0">
                            <img
                              src={`https://flagcdn.com/w40/${modalFlag.code}.png`}
                              srcSet={`https://flagcdn.com/w80/${modalFlag.code}.png 2x`}
                              alt={modalFlag.name}
                              width="18"
                              height="12"
                              className="w-4.5 h-3 object-cover rounded-[2px] shadow-2xs shrink-0"
                              loading="lazy"
                            />
                            <span className="text-xs font-semibold text-slate-700">
                              {modalFlag.name}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>


                  <p className="text-[11px] text-slate-400 text-center italic">
                    This card will seamlessly loop inside the infinite marquee on the homepage.
                  </p>
                </div>

              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsTestimonialModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0070E0] hover:bg-blue-600 text-white text-xs font-semibold transition cursor-pointer shadow-sm flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Review & Update Marquee</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL: ADD/EDIT ROLE-BASED USER */}
      {/* ======================================= */}
      {isUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-[#0A1C3E] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#38BDF8] tracking-wider">
                  Role-Based Access Control (RBAC)
                </span>
                <h3 className="text-base font-bold font-display text-white">
                  {users.some(u => u.id === editingUser.id) ? `Edit User: ${editingUser.name}` : 'Create New User Account'}
                </h3>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="e.g. Vikram Malhotra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0070E0] text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Business Email Address *</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="e.g. analyst@origintra.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0070E0] text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {users.some(u => u.id === editingUser.id) ? 'Account Password (Leave blank to keep current)' : 'Account Password *'}
                </label>
                <input
                  type="password"
                  required={!users.some(u => u.id === editingUser.id)}
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder={users.some(u => u.id === editingUser.id) ? '••••••••' : 'Enter password (min 4 chars)'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0070E0] text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assigned Role & Permissions *</label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { role: 'admin', label: 'Administrator', desc: 'Full System Control', icon: Crown, border: 'border-amber-400 bg-amber-50/50 text-amber-900' },
                    { role: 'editor', label: 'Content Editor', desc: 'Products, Blogs, Team, Media', icon: PenTool, border: 'border-blue-400 bg-blue-50/50 text-blue-900' },
                    { role: 'author', label: 'Staff Author', desc: 'Draft & Publish Blogs', icon: FileText, border: 'border-emerald-400 bg-emerald-50/50 text-emerald-900' },
                    { role: 'sales', label: 'Sales Lead', desc: 'Inquiries & Quote Requests', icon: Briefcase, border: 'border-cyan-400 bg-cyan-50/50 text-cyan-900' }
                  ].map((r) => {
                    const isSelected = editingUser.role === r.role;
                    const IconComp = r.icon;
                    return (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => setEditingUser({ ...editingUser, role: r.role as UserRole })}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                          isSelected ? `${r.border} ring-2 ring-[#0070E0]` : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <IconComp className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[11px]">{r.label}</div>
                          <div className="text-[10px] opacity-75">{r.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department / Designation</label>
                <input
                  type="text"
                  value={editingUser.department || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  placeholder="e.g. Agri Commodity Market Intelligence"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0070E0] text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Avatar Profile Photo URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingUser.avatar || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, avatar: e.target.value })}
                    placeholder="https://... or /assets/team/..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0070E0] text-xs font-mono"
                  />
                  {editingUser.avatar && (
                    <img
                      src={editingUser.avatar}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/team/director.jpg';
                      }}
                    />
                  )}
                </div>
              </div>

              {!users.some(u => u.id === editingUser.id) && (
                <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80 rounded-2xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sendEmailOnCreate}
                      onChange={(e) => setSendEmailOnCreate(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0070E0] focus:ring-[#0070E0] cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#0070E0]" />
                        Automatically email login credentials to this user
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Pre-fills an official enterprise welcome email with their login ID, password, portal URL, and login instructions. Also opens a copyable template modal for instant WhatsApp or Slack sharing.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0A1C3E] hover:bg-[#0070E0] text-white text-xs font-semibold transition cursor-pointer shadow-sm"
                >
                  Save User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL: USER CREATED CREDENTIALS & EMAIL DISPATCH */}
      {/* ======================================= */}
      {createdCredentialsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0A1C3E] to-[#0d2a60] px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                    <Check className="w-3 h-3" /> Account Created Successfully
                  </span>
                  <h3 className="text-base font-bold font-display text-white">
                    Credentials & Welcome Email
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setCreatedCredentialsModal(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-emerald-900">
                <p className="font-semibold text-xs text-emerald-950 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  Welcome notification prepared for {createdCredentialsModal.userName}!
                </p>
                <p className="text-[11px] text-emerald-800/90 mt-1 leading-relaxed">
                  The account has been created in Supabase database. You can launch your mail client pre-addressed to <strong>{createdCredentialsModal.toEmail}</strong> or copy the full welcome template to send via WhatsApp, Slack, or company email.
                </p>
              </div>

              {/* Account Details Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/70">
                  <span className="text-slate-500 font-medium">User Name:</span>
                  <span className="font-bold text-slate-800">{createdCredentialsModal.userName}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/70">
                  <span className="text-slate-500 font-medium">Recipient Email:</span>
                  <span className="font-mono font-bold text-[#0070E0]">{createdCredentialsModal.toEmail}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/70">
                  <span className="text-slate-500 font-medium">Assigned Role:</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                    {createdCredentialsModal.role}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/70">
                  <span className="text-slate-500 font-medium">Department:</span>
                  <span className="text-slate-700 font-semibold">{createdCredentialsModal.department}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/70">
                  <span className="text-slate-500 font-medium">Portal URL:</span>
                  <a
                    href={createdCredentialsModal.loginUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[#0070E0] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>{createdCredentialsModal.loginUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between py-1 bg-amber-50/80 -mx-4 -mb-4 px-4 py-3 rounded-b-2xl border-t border-amber-200/60">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                      Assigned Password
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {createdCredentialsModal.password}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentialsModal.password);
                      setCopiedPassword(true);
                      showToast('Password copied to clipboard!');
                      setTimeout(() => setCopiedPassword(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPassword ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    MailService.openMailClient(createdCredentialsModal);
                    showToast(`Opened mail client to send credentials to ${createdCredentialsModal.toEmail}`);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#0070E0] hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Launch Email Client (Outlook / Gmail / Apple Mail)</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const copied = await MailService.copyEmailTemplate(createdCredentialsModal);
                    if (copied) {
                      setCopiedEmailText(true);
                      showToast('Complete welcome email message copied to clipboard!');
                      setTimeout(() => setCopiedEmailText(false), 2000);
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {copiedEmailText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedEmailText ? 'Template Copied to Clipboard!' : 'Copy Formatted Email Text (for WhatsApp / Webmail)'}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCreatedCredentialsModal(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA GALLERY SELECTOR MODAL */}
      <MediaGalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        onSelectImage={handleSelectImageFromGallery}
        currentImage={
          galleryModalTarget === 'team'
            ? editingTeamMember?.photo
            : galleryModalTarget === 'product'
            ? editingProduct?.image
            : editingBlogPost?.image
        }
        defaultCategory={galleryModalCategory}
        title={galleryModalTitle}
      />

      {/* SUPABASE CLOUD DATABASE CONFIGURATION MODAL */}
      <SupabaseModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
        onSuccess={(msg) => {
          showToast(msg);
          setDbStatus(AdminStorage.getDatabaseStatus());
        }}
      />

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {previewLightboxImage && (
        <div 
          onClick={() => setPreviewLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl border border-slate-200"
          >
            <div className="px-6 py-4 bg-[#0A1C3E] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{previewLightboxImage.title}</h3>
                <span className="text-[11px] text-slate-300 font-mono capitalize">{previewLightboxImage.category} • {previewLightboxImage.tag || 'Asset'}</span>
              </div>
              <button 
                onClick={() => setPreviewLightboxImage(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center max-h-[65vh] overflow-hidden">
              <img 
                src={previewLightboxImage.url} 
                alt={previewLightboxImage.title}
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-600 truncate max-w-xs sm:max-w-md">{previewLightboxImage.url}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${previewLightboxImage.title}" from gallery?`)) {
                      AdminStorage.deleteGalleryImage(previewLightboxImage.id);
                      setPreviewLightboxImage(null);
                      showToast('Photo removed from gallery.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Delete image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(previewLightboxImage.url);
                    setCopiedGalleryUrl(previewLightboxImage.url);
                    showToast('Image path copied to clipboard!');
                    setTimeout(() => setCopiedGalleryUrl(null), 2000);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0070E0] text-white font-semibold text-xs hover:bg-[#005bb5] transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedGalleryUrl === previewLightboxImage.url ? <CheckCheck className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                  <span>{copiedGalleryUrl === previewLightboxImage.url ? 'Copied!' : 'Copy Path'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
