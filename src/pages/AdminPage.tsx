import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
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
  Server
} from 'lucide-react';
import { Product, BlogPost, Inquiry, TeamMember, User, UserRole, Testimonial } from '../types';
import { AdminStorage } from '../services/adminStorage';
import { supabase } from '../services/supabaseClient';
import { MailService, WelcomeEmailPayload, EmailCredentials } from '../services/mailService';
import { PRODUCT_CATEGORIES } from '../data/products';
import { MediaGalleryModal } from '../components/MediaGalleryModal';
import { SupabaseModal } from '../components/SupabaseModal';
import { GalleryImage } from '../data/gallery';
import { compressImage } from '../utils/imageCompressor';
import { slugify } from '../utils/slugify';

interface AdminPageProps {
  onNavigate: (page: string) => void;
  onOpenProductDetail: (product: Product) => void;
}

type AdminTab = 'dashboard' | 'products' | 'blog' | 'team' | 'testimonials' | 'gallery' | 'inquiries' | 'users' | 'settings';

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

  // === NAVIGATION & TABS ===
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // === DATA STATES (Synced with Supabase Cloud PostgreSQL) ===
  const [products, setProducts] = useState<Product[]>(() => AdminStorage.getProducts());
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => AdminStorage.getBlogPosts());
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => AdminStorage.getTeamMembers());
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => AdminStorage.getTestimonials());
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => AdminStorage.getInquiries());
  const [companyConfig, setCompanyConfig] = useState(() => AdminStorage.getCompanyConfig());
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(() => AdminStorage.getGalleryImages());
  const [dbStatus, setDbStatus] = useState(() => AdminStorage.getDatabaseStatus());

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
  const [teamSearch, setTeamSearch] = useState('');
  const [testimonialSearch, setTestimonialSearch] = useState('');
  const [testimonialCommodityFilter, setTestimonialCommodityFilter] = useState('all');
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('all');

  // === MODAL STATES ===
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [blogPreviewPost, setBlogPreviewPost] = useState<BlogPost | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);

  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);

  // === TOAST NOTIFICATION ===
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync listener when data changes
  useEffect(() => {
    AdminStorage.fetchDatabaseStatus();

    const handleProductsUpdated = () => setProducts(AdminStorage.getProducts());
    const handleBlogUpdated = () => setBlogPosts(AdminStorage.getBlogPosts());
    const handleTeamUpdated = () => setTeamMembers(AdminStorage.getTeamMembers());
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
      category: 'Whole Spices',
      categoryKey: 'whole-spices',
      tagline: 'Export grade quality spice from India',
      isFlagship: false,
      origin: 'Guntur, Andhra Pradesh, India',
      shortDescription: '',
      fullDescription: '',
      availableForms: ['Whole Form', 'Powder Form (Ground)'],
      packagingOptions: ['25kg Woven Bags', '50kg Jute Bags'],
      applications: ['Culinary Seasoning', 'Food Processing'],
      image: '/assets/products/whole-red-chili.jpg',
      specifications: [
        { label: 'Moisture', value: '10% Max' },
        { label: 'Purity', value: '99% Min' }
      ],
      qualityProcess: ['Machine Sorting', 'Metal Detection'],
      exportInfo: {
        minimumOrderQuantity: '1 x 20ft FCL',
        packagingStandard: 'Seaworthy Export Grade',
        containerCapacity: '14 to 18 MT per 20ft',
        sampleAvailability: 'Available upon request',
        leadTime: '15-20 Days',
        incoterms: 'FOB / CIF / CFR'
      },
      faqs: [
        { question: 'What is the minimum order quantity?', answer: '1 x 20ft FCL container.' }
      ]
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    const copy: Product = JSON.parse(JSON.stringify(prod));
    if (copy.slug && copy.slug.startsWith('new-spice-')) {
      copy.slug = slugify(copy.name);
    }
    setEditingProduct(copy);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name.trim()) return;

    let finalSlug = editingProduct.slug?.trim();
    if (!finalSlug || finalSlug.startsWith('new-spice-')) {
      finalSlug = slugify(editingProduct.name);
    } else {
      finalSlug = slugify(finalSlug);
    }
    if (!finalSlug) {
      finalSlug = `product-${Date.now()}`;
    }
    editingProduct.slug = finalSlug;

    AdminStorage.saveProduct(editingProduct);
    setIsProductModalOpen(false);
    setEditingProduct(null);
    showToast(`Product "${editingProduct.name}" saved successfully!`);
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
    setIsBlogModalOpen(true);
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
    setIsBlogModalOpen(true);
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
    setIsBlogModalOpen(false);
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

  const handleDevicePhotoUpload = async (file: File, target: 'team' | 'product' | 'blog' | 'testimonial') => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }
    try {
      showToast('Processing photo...');
      const compressedDataUrl = await compressImage(file, 1400, 0.84);
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const newImg = await AdminStorage.addCustomGalleryImage({
        url: compressedDataUrl,
        title: cleanName,
        category: target === 'team' ? 'team' : target === 'product' ? 'products' : 'uploads',
        tag: target === 'team' ? 'Leader' : target === 'testimonial' ? 'Buyer' : 'Upload'
      });
      if (target === 'team' && editingTeamMember) {
        setEditingTeamMember({ ...editingTeamMember, photo: newImg.url });
      } else if (target === 'product' && editingProduct) {
        setEditingProduct({ ...editingProduct, image: newImg.url });
      } else if (target === 'blog' && editingBlogPost) {
        setEditingBlogPost({ ...editingBlogPost, image: newImg.url });
      } else if (target === 'testimonial' && editingTestimonial) {
        setEditingTestimonial({ ...editingTestimonial, avatar: newImg.url });
      }
      showToast('Photo uploaded and set successfully!');
    } catch (err) {
      console.error('Photo upload failed:', err);
      showToast('Failed to upload photo. Please try again.');
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
      if (viewingInquiry?.id === id) setViewingInquiry(null);
      showToast('Inquiry deleted.');
    }
  };

  // === COMPANY CONFIG SAVE ===
  const handleSaveCompanyConfig = (e: React.FormEvent) => {
    e.preventDefault();
    AdminStorage.saveCompanyConfig(companyConfig);
    showToast('Company profile & contact details updated!');
  };

  // ==========================================
  // 1. LOGIN SCREEN (If not authenticated)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0A1C3E] text-white mb-2 shadow-md">
              <ShieldCheck className="w-7 h-7 text-[#38BDF8]" />
            </div>
            <h1 className="text-2xl font-display font-bold text-[#0F172A]">
              Origintra Exim Admin
            </h1>
            <p className="text-xs text-slate-500">
              Authorized Corporate Portal · 256-Bit SSL/TLS Protected Authentication.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{supabase.isConfigured() ? 'Supabase Cloud PostgreSQL Active' : 'Live Cloud Database Active'}</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. arsh@origintra.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0070E0] text-xs font-mono"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-[#0070E0] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0070E0] text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#0A1C3E] hover:bg-[#0070E0] text-white font-semibold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Authenticate & Enter Portal</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-xs font-semibold text-slate-500 hover:text-[#0070E0] transition cursor-pointer"
            >
              ← Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. MAIN ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A1C3E] text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500/40 flex items-center space-x-3 text-sm animate-in fade-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Header */}
      <header className="bg-[#0A1C3E] text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="px-4 sm:px-8 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-[#38BDF8]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-base tracking-tight text-white">
                  Origintra Exim
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-[#38BDF8] text-[10px] font-bold uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Centralized CMS & Sourcing Management Desk
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Active User Profile Chip */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
                <img
                  src={currentUser.avatar || '/assets/team/director.jpg'}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-blue-400/40 bg-slate-800 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/team/director.jpg';
                  }}
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : currentUser.role === 'editor'
                        ? 'bg-blue-400/20 text-blue-300 border border-blue-400/40'
                        : currentUser.role === 'author'
                        ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                        : 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                    }`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{currentUser.department || 'Trade Operations'}</div>
                </div>
              </div>
            )}

            {/* Production Security Shield Badge */}
            <div className="hidden xl:flex items-center gap-1.5 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-[11px] text-emerald-300 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">Security Active · 256-Bit SSL/TLS</span>
            </div>

            <button
              onClick={() => onNavigate('home')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout: Sidebar + Workspace */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-2 sm:p-4 shrink-0">
          <div className="hidden md:flex text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2 items-center justify-between">
            <span>Navigation</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 font-bold uppercase text-slate-600">
              Role: {currentRole}
            </span>
          </div>

          {/* Mobile Horizontal Scrollable Tab Bar (<md) */}
          <div className="flex md:hidden overflow-x-auto py-1 gap-1.5 scrollbar-none items-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'dashboard' ? 'bg-[#0070E0] text-white shadow-xs' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            {canAccessProducts && (
              <button
                onClick={() => setActiveTab('products')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'products' ? 'bg-[#0070E0] text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Products ({products.length})</span>
              </button>
            )}
            {canAccessBlog && (
              <button
                onClick={() => setActiveTab('blog')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'blog' ? 'bg-[#0070E0] text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Blog ({blogPosts.length})</span>
              </button>
            )}
            {canAccessTeam && (
              <button
                onClick={() => setActiveTab('team')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'team' ? 'bg-[#0070E0] text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Team ({teamMembers.length})</span>
              </button>
            )}
            {canAccessTestimonials && (
              <button
                onClick={() => setActiveTab('testimonials')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'testimonials' ? 'bg-[#0070E0] text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Quote className="w-3.5 h-3.5" />
                <span>Reviews ({testimonials.length})</span>
              </button>
            )}
            {canAccessGallery && (
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'gallery' ? 'bg-[#0070E0] text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Gallery ({galleryImages.length})</span>
              </button>
            )}
            {canAccessInquiries && (
              <button
                onClick={() => setActiveTab('inquiries')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'inquiries' ? 'bg-[#0070E0] text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Leads ({inquiries.length})</span>
              </button>
            )}
            {canAccessUsers && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'users' ? 'bg-[#0070E0] text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Users ({users.length})</span>
              </button>
            )}
            {canAccessSettings && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 shrink-0 ${
                  activeTab === 'settings' ? 'bg-[#0070E0] text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            )}
          </div>

          {/* Desktop Vertical Nav (hidden on mobile) */}
          <div className="hidden md:block space-y-1.5">

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#0070E0] text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          {canAccessProducts && (
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#0070E0] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Package className="w-4 h-4" />
                <span>Product Catalog</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-bold">
                {products.length}
              </span>
            </button>
          )}

          {canAccessBlog && (
            <button
              onClick={() => setActiveTab('blog')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'blog'
                  ? 'bg-[#0070E0] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="w-4 h-4" />
                <span>Blog & Articles</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-bold">
                {blogPosts.length}
              </span>
            </button>
          )}

          {canAccessTeam && (
            <button
              onClick={() => setActiveTab('team')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-[#0070E0] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4" />
                <span>Leadership Team</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-bold">
                {teamMembers.length}
              </span>
            </button>
          )}

          {canAccessTestimonials && (
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'testimonials'
                  ? 'bg-[#0070E0] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Quote className="w-4 h-4" />
                <span>Client Reviews</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                {testimonials.length}
              </span>
            </button>
          )}

          {canAccessGallery && (
            <button
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-[#0070E0] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ImageIcon className="w-4 h-4" />
                <span>Media Gallery</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                {galleryImages.length}
              </span>
            </button>
          )}

          {canAccessInquiries && (
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-[#0070E0] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Inbox className="w-4 h-4" />
                <span>Inquiries & Leads</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                {inquiries.length}
              </span>
            </button>
          )}

          {canAccessUsers && (
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#0070E0] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4" />
                <span>User Management</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                {users.length}
              </span>
            </button>
          )}

          {canAccessSettings && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#0070E0] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Settings className="w-4 h-4" />
                <span>Website & Contact</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          )}

          {/* Quick System Stats in Sidebar (hidden on mobile, visible on desktop) */}
          <div className="pt-6 mt-6 border-t border-slate-100 px-3 space-y-2 text-[11px] text-slate-500">
            <div className="flex justify-between">
              <span>DB Engine</span>
              <strong className="text-slate-800 font-semibold">{supabase.isConfigured() ? 'Supabase PostgreSQL' : 'Cloud DB'}</strong>
            </div>
            <div className="flex justify-between">
              <span>Live Sync</span>
              <strong className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                PostgREST Synced
              </strong>
            </div>
            <div className="flex justify-between">
              <span>WhatsApp</span>
              <strong className="text-slate-700 font-mono">{companyConfig.phone}</strong>
            </div>
          </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl overflow-x-hidden">
          
          {/* ======================================= */}
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {/* ======================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#0F172A]">
                    Executive Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Manage Origintra Exim's export commodities portfolio, blog thought leadership, and incoming buyer RFQs.
                  </p>
                </div>

                {/* Live Database Engine Status Banner with Security Badges */}
                <div className="flex flex-wrap items-center gap-3 bg-white border border-emerald-200/80 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex flex-wrap items-center gap-1.5">
                        <span>{supabase.isConfigured() ? 'Supabase Cloud PostgreSQL' : (dbStatus?.engine || 'Cloud Database Active')}</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                          {supabase.isConfigured() ? (supabase.getConfig().url.replace('https://', '').split('.')[0] + '.supabase.co') : 'supabase.co'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                          <ShieldCheck className="w-3 h-3 text-blue-600" />
                          Auth & Rate-Limit Protected
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span>{supabase.isConfigured() ? 'Real-time Cloud Sync Active' : 'Cloud Sync Active'}</span>
                        {typeof dbStatus?.liveConnectedClients === 'number' ? (
                          <span>• {dbStatus.liveConnectedClients} live browser{dbStatus.liveConnectedClients === 1 ? '' : 's'}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSupabaseModalOpen(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                      title="Configure Supabase Cloud Database"
                    >
                      <Database className="w-3.5 h-3.5 text-white" />
                      <span>{supabase.isConfigured() ? 'Supabase Connected' : 'Connect Supabase'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await AdminStorage.downloadDatabaseBackup('json');
                        if (ok) {
                          showToast('Database backup snapshot (.json) exported successfully!');
                        } else {
                          alert('Failed to export database backup.');
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Export full JSON database backup to your computer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Export JSON</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        await AdminStorage.syncWithDatabase();
                        showToast('Synchronized with live database!');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      title="Force refresh from database"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                      <span>Sync</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
                
                <div 
                  onClick={() => setActiveTab('products')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 cursor-pointer hover:border-blue-400 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold">Active Products</span>
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold font-display text-[#0F172A]">
                    {products.length}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center space-x-1">
                    <span className="text-emerald-600 font-semibold">4 Categories</span>
                    <span>• 27 Spices</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('blog')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 cursor-pointer hover:border-purple-400 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold">Published Articles</span>
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold font-display text-[#0F172A]">
                    {blogPosts.length}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center space-x-1">
                    <span className="text-emerald-600 font-semibold">SEO Guides</span>
                    <span>• Sourcing</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('team')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 cursor-pointer hover:border-sky-400 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold">Leadership Roster</span>
                    <Users className="w-5 h-5 text-sky-600" />
                  </div>
                  <div className="text-3xl font-bold font-display text-[#0F172A]">
                    {teamMembers.length}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center space-x-1">
                    <span className="text-sky-600 font-semibold">About Us</span>
                    <span>• Photos & Bios</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('gallery')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 cursor-pointer hover:border-indigo-400 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold">Media Gallery</span>
                    <ImageIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-3xl font-bold font-display text-[#0F172A]">
                    {galleryImages.length}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center space-x-1">
                    <span className="text-indigo-600 font-semibold">9 Leaders</span>
                    <span>• 32 Products</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('inquiries')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 cursor-pointer hover:border-amber-400 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold">Buyer Inquiries</span>
                    <Inbox className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-3xl font-bold font-display text-[#0F172A]">
                    {inquiries.length}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center space-x-1">
                    <span className="text-amber-600 font-semibold">
                      {inquiries.filter(i => i.status === 'new').length} New
                    </span>
                    <span>leads</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('testimonials')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 cursor-pointer hover:border-amber-400 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold">Client Reviews</span>
                    <Quote className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-3xl font-bold font-display text-[#0F172A]">
                    {testimonials.length}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center space-x-1">
                    <span className="text-amber-600 font-semibold">Live Marquee</span>
                    <span>• 5-Star B2B</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold">WhatsApp Desk</span>
                    <Phone className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-base font-bold font-display text-[#0F172A] truncate">
                    +91 70691 82990
                  </div>
                  <div className="text-xs text-slate-500 flex items-center space-x-1">
                    <span className="text-emerald-600 font-semibold">Direct Desk</span>
                    <span>• 24/7 Desk</span>
                  </div>
                </div>

              </div>

              {/* Quick Actions & Recent Inquiries */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Recent Inquiries Panel */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold font-display text-[#0F172A]">
                        Recent Buyer Inquiries & Quotes
                      </h2>
                      <p className="text-xs text-slate-500">
                        Overseas buyers requesting FCL rates and specifications
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
                          <th className="pb-3">Buyer & Company</th>
                          <th className="pb-3">Product</th>
                          <th className="pb-3">Country</th>
                          <th className="pb-3">Quantity</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inquiries.slice(0, 5).map((inq) => (
                          <tr key={inq.id} className="hover:bg-slate-50 transition">
                            <td className="py-3">
                              <div className="font-semibold text-slate-800">{inq.fullName}</div>
                              <div className="text-[11px] text-slate-400">{inq.companyName}</div>
                            </td>
                            <td className="py-3 font-medium text-slate-700">{inq.product}</td>
                            <td className="py-3 text-slate-600">{inq.country}</td>
                            <td className="py-3 font-mono text-[11px] text-slate-500">{inq.quantityRequired}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                inq.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                inq.status === 'contacted' ? 'bg-amber-100 text-amber-800' :
                                inq.status === 'negotiation' ? 'bg-purple-100 text-purple-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {inq.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => { setViewingInquiry(inq); setActiveTab('inquiries'); }}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-[#0A1C3E] hover:text-white text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="lg:col-span-4 space-y-4">
                  
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
                    <h3 className="text-base font-bold font-display text-[#0F172A]">
                      Quick Shortcuts
                    </h3>

                    <div className="space-y-2">
                      <button
                        onClick={handleOpenAddProduct}
                        className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left text-xs font-semibold text-slate-800 hover:text-blue-700 transition flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <Plus className="w-4 h-4 text-blue-600" />
                          <span>Add New Export Spice</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </button>

                      <button
                        onClick={handleOpenAddBlogPost}
                        className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left text-xs font-semibold text-slate-800 hover:text-purple-700 transition flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <Plus className="w-4 h-4 text-purple-600" />
                          <span>Publish New Blog Article</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </button>

                      <button
                        onClick={handleOpenAddTeamMember}
                        className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-left text-xs font-semibold text-slate-800 hover:text-sky-700 transition flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <Plus className="w-4 h-4 text-sky-600" />
                          <span>Add Leadership Member</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </button>

                      <button
                        onClick={() => setActiveTab('gallery')}
                        className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left text-xs font-semibold text-slate-800 hover:text-indigo-700 transition flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <ImageIcon className="w-4 h-4 text-indigo-600" />
                          <span>Browse Media & Photo Gallery</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </button>

                      <button
                        onClick={() => AdminStorage.exportInquiriesCSV()}
                        className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left text-xs font-semibold text-slate-800 hover:text-emerald-700 transition flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <Download className="w-4 h-4 text-emerald-600" />
                          <span>Download Inquiries (CSV)</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                      </button>
                    </div>
                  </div>

                  {/* Operational Information */}
                  <div className="bg-[#0A1C3E] text-white rounded-2xl p-6 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8]">
                      Export Desk Information
                    </span>
                    <h4 className="text-base font-bold font-display text-white">
                      Origintra Exim Global Desk
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Sourcing out of Guntur, Unjha, Ramganj Mandi, and Cochin. Primary maritime gateways through Mundra and Pipavav ports.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="text-xs font-semibold text-[#38BDF8] hover:underline"
                      >
                        Edit Profile Details →
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* TAB 2: PRODUCT CATALOG MANAGEMENT */}
          {/* ======================================= */}
          {activeTab === 'products' && (
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
                                src={prod.image}
                                alt={prod.name}
                                className="w-12 h-14 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-50"
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
          )}

          {/* ======================================= */}
          {/* TAB 3: BLOG & ARTICLES MANAGEMENT */}
          {/* ======================================= */}
          {activeTab === 'blog' && (
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
          )}

          {/* ======================================= */}
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

              {/* Live Marquee Synced Banner */}
              <div className="bg-gradient-to-r from-blue-900 via-[#0A1C3E] to-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs border border-blue-800/40">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-[#38BDF8] shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>Homepage Infinite Marquee Synced</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </h4>
                    <p className="text-[11px] text-blue-200">
                      Changes saved here immediately update the continuous horizontal scrolling marquee on the public website with verified buyer credentials.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shrink-0 flex items-center space-x-1 cursor-pointer"
                >
                  <span>View on Homepage</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Testimonials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTestimonials.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Top Header: Discharge Port & Verified Buyer Badge */}
                      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#0070E0] shrink-0" />
                          <span className="truncate">{item.destinationPort}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-[10px] font-semibold tracking-wide shrink-0">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Verified Buyer</span>
                        </span>
                      </div>

                      {/* Commodity & Volume */}
                      <div className="mb-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#0070E0] mb-0.5">
                          {item.volumeOrType || 'Commercial FCL Consignment'}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {item.commodity}
                        </h4>
                      </div>

                      {/* Testimonial Quote */}
                      <blockquote className="my-3 pl-3 border-l-2 border-[#0070E0]/30 text-xs text-slate-600 leading-relaxed font-normal">
                        "{item.testimonial}"
                      </blockquote>

                      {/* Buyer Identity */}
                      <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center space-x-3">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.author}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 tracking-wider">
                            {item.author.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {item.author}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {item.role}
                          </p>
                          <p className="text-[11px] font-medium text-slate-700 truncate flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{item.company}</span>
                            <span className="text-slate-400 font-normal shrink-0">({item.country})</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Bar */}
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
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
                ))}
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
                      if (window.confirm('Reset custom media gallery uploads back to default asset library?')) {
                        AdminStorage.resetCustomGallery();
                        showToast('Custom uploaded media reset to defaults.');
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

                        {img.isUploaded && (
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this uploaded image from gallery?')) {
                                AdminStorage.deleteCustomGalleryImage(img.id);
                                showToast('Photo deleted.');
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Delete image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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
                  Update primary contact details, WhatsApp export hotline, and corporate credentials.
                </p>
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
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    Credentials are stored securely and used by Nodemailer to dispatch welcome emails.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      MailService.saveCredentials(emailCreds);
                      showToast('Nodemailer SMTP email credentials saved successfully!');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#0070E0] hover:bg-blue-600 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
                  >
                    Save Email Credentials
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

        </main>
      </div>

      {/* ======================================= */}
      {/* MODAL 1: ADD/EDIT PRODUCT */}
      {/* ======================================= */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            
            <div className="bg-[#0A1C3E] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#38BDF8] tracking-wider">
                  Product CMS
                </span>
                <h3 className="text-lg font-bold font-display text-white">
                  {editingProduct.name ? `Edit: ${editingProduct.name}` : 'Add New Export Spice'}
                </h3>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setEditingProduct(prev => {
                        if (!prev) return null;
                        const shouldUpdateSlug = !prev.slug || prev.slug.startsWith('new-spice-') || prev.slug === slugify(prev.name);
                        return {
                          ...prev,
                          name: newName,
                          slug: shouldUpdateSlug ? slugify(newName) : prev.slug
                        };
                      });
                    }}
                    placeholder="e.g. Green Cardamom Bold"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0070E0]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Product URL Slug (Permalink)
                  </label>
                  <div className="flex rounded-lg shadow-2xs border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-[#0070E0] focus-within:border-transparent">
                    <span className="inline-flex items-center px-2.5 bg-slate-100 text-slate-500 text-[11px] font-mono border-r border-slate-300 select-none">
                      /products/
                    </span>
                    <input
                      type="text"
                      value={editingProduct.slug || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, slug: slugify(e.target.value) })}
                      placeholder="e.g. green-cardamom-bold"
                      className="flex-1 px-3 py-2 font-mono text-[11px] text-slate-800 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Botanical / Scientific Name</label>
                  <input
                    type="text"
                    value={editingProduct.botanicalName || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, botanicalName: e.target.value })}
                    placeholder="e.g. Elettaria cardamomum"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 italic focus:ring-2 focus:ring-[#0070E0]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={editingProduct.categoryKey || 'whole-spices'}
                    onChange={(e) => {
                      const val = e.target.value;
                      const catObj = PRODUCT_CATEGORIES.find(c => c.key === val);
                      setEditingProduct({
                        ...editingProduct,
                        categoryKey: val,
                        category: catObj ? catObj.label : 'Whole Spices'
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0070E0]"
                  >
                    <option value="whole-spices">Whole Spices</option>
                    <option value="ground-spices">Ground Spices</option>
                    <option value="seeds">Seeds</option>
                    <option value="blends">Blends & Seasonings</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Primary Harvest Origin</label>
                  <input
                    type="text"
                    value={editingProduct.origin}
                    onChange={(e) => setEditingProduct({ ...editingProduct, origin: e.target.value })}
                    placeholder="e.g. Idukki, Kerala, India"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0070E0]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700 block">Product Image *</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenProductImageGallery}
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
                          if (f) handleDevicePhotoUpload(f, 'product');
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {editingProduct.image && (
                    <div
                      onClick={handleOpenProductImageGallery}
                      className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-[#0070E0] transition bg-slate-100"
                      title="Click to select different photo from gallery"
                    >
                      <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={editingProduct.image}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    placeholder="/assets/products/your-spice.jpg"
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 font-mono text-[11px] focus:ring-2 focus:ring-[#0070E0]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tagline</label>
                <input
                  type="text"
                  value={editingProduct.tagline || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                  placeholder="e.g. Export grade bold green pods with high volatile oil"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0070E0]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Short Description *</label>
                <textarea
                  rows={2}
                  required
                  value={editingProduct.shortDescription}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                  placeholder="Summary of product grade, aroma, and commercial applications..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0070E0]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Available Forms (Comma-separated)</label>
                <input
                  type="text"
                  value={editingProduct.availableForms.join(', ')}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    availableForms: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Whole Pods, Split, Ground Powder 80 Mesh"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0070E0]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="flagship-check"
                  checked={!!editingProduct.isFlagship}
                  onChange={(e) => setEditingProduct({ ...editingProduct, isFlagship: e.target.checked })}
                  className="rounded text-[#0070E0] focus:ring-[#0070E0]"
                />
                <label htmlFor="flagship-check" className="font-semibold text-slate-700">
                  Feature as Flagship Commodity (Displayed prominently on website)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0070E0] hover:bg-blue-600 text-white font-semibold transition shadow-sm"
                >
                  Save Spice
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MODAL 2: ADD/EDIT BLOG ARTICLE */}
      {/* ======================================= */}
      {isBlogModalOpen && editingBlogPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            
            <div className="bg-[#0A1C3E] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#38BDF8] tracking-wider">
                  Blog & Article Editor
                </span>
                <h3 className="text-lg font-bold font-display text-white">
                  {editingBlogPost.title ? `Edit Article: ${editingBlogPost.title}` : 'Write New Export Insight Article'}
                </h3>
              </div>
              <button
                onClick={() => setIsBlogModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlogPost} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              
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
                  <label className="font-semibold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={editingBlogPost.category}
                    onChange={(e) => setEditingBlogPost({ ...editingBlogPost, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#0070E0]"
                  >
                    <option value="Global Trade">Global Trade</option>
                    <option value="Indian Spices">Indian Spices</option>
                    <option value="Export Insights">Export Insights</option>
                    <option value="Market Trends">Market Trends</option>
                    <option value="Sourcing">Sourcing</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Business Updates">Business Updates</option>
                  </select>
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
                  onClick={() => setIsBlogModalOpen(false)}
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
      )}

      {/* ======================================= */}
      {/* MODAL 3: INQUIRY DETAILS VIEW */}
      {/* ======================================= */}
      {viewingInquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            
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
                onClick={() => setViewingInquiry(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
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

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <select
                    value={viewingInquiry.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as Inquiry['status'];
                      handleUpdateInquiryStatus(viewingInquiry.id, newStatus);
                      setViewingInquiry({ ...viewingInquiry, status: newStatus });
                    }}
                    className="px-3 py-1 rounded-lg border font-semibold"
                  >
                    <option value="new">NEW</option>
                    <option value="contacted">CONTACTED</option>
                    <option value="negotiation">NEGOTIATION</option>
                    <option value="closed">CLOSED</option>
                  </select>
                </div>

                <a
                  href={`https://wa.me/${viewingInquiry.phoneWhatsApp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(viewingInquiry.fullName)},%20thank%20you%20for%20contacting%20Origintra%20Exim%20regarding%20${encodeURIComponent(viewingInquiry.product)}.`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center space-x-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Reply on WhatsApp</span>
                </a>
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

                  {/* Company & Country */}
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
                        Buyer Country *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingTestimonial.country}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, country: e.target.value })}
                        placeholder="e.g. United Arab Emirates"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#0070E0]"
                      />
                    </div>
                  </div>

                  {/* Destination Port & Commodity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Destination Discharge Port
                      </label>
                      <input
                        type="text"
                        value={editingTestimonial.destinationPort}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, destinationPort: e.target.value })}
                        placeholder="e.g. Port of Jebel Ali, UAE"
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

                  {/* The Preview Card (identical to homepage) */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-md flex flex-col justify-between">
                    <div>
                      {/* Commodity & Volume */}
                      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 text-xs">
                        <span className="font-bold text-[#0070E0] truncate">
                          {editingTestimonial.commodity || 'Indian Whole Spices'}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 shrink-0">
                          {editingTestimonial.volumeOrType || 'FCL Container'}
                        </span>
                      </div>

                      {/* Port & Star Rating */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-[#0070E0] shrink-0" />
                          <span className="truncate">{editingTestimonial.destinationPort || 'Port of Destination'}</span>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {Array.from({ length: 5 }).map((_, sIdx) => (
                            <Star
                              key={sIdx}
                              className={`w-3.5 h-3.5 ${
                                sIdx < (editingTestimonial.rating || 5)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Quote Statement */}
                      <Quote className="w-6 h-6 text-blue-100 mb-2 shrink-0" />
                      <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-5">
                        "{editingTestimonial.testimonial || 'Commercial buyer feedback statement will appear here as you type in the form.'}"
                      </p>
                    </div>

                    {/* Author Bottom Row */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {editingTestimonial.avatar ? (
                          <img
                            src={editingTestimonial.avatar}
                            alt="Avatar"
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0A1C3E] to-[#0070E0] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {(editingTestimonial.author || 'Buyer').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {editingTestimonial.author || 'Buyer Author Name'}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate">
                            {editingTestimonial.role || 'Designation'}
                          </p>
                          <p className="text-[10px] font-semibold text-[#0A1C3E] truncate flex items-center gap-1 mt-0.5">
                            <Building2 className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span className="truncate">{editingTestimonial.company || 'Enterprise Company'}</span>
                            <span className="text-slate-400 font-normal shrink-0">({editingTestimonial.country || 'Country'})</span>
                          </p>
                        </div>
                      </div>

                      <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0" title="Verified Trade Consignment">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
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
            <div className="p-6 space-y-4 text-xs">
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
      )}

    </div>
  );
};
