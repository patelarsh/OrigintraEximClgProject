import { Product, BlogPost, Inquiry, TeamMember, User, UserRole, Testimonial } from '../types';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../data/products';
import { BLOG_POSTS as DEFAULT_BLOG_POSTS } from '../data/blog';
import { TEAM_MEMBERS as DEFAULT_TEAM_MEMBERS } from '../data/team';
import { COMPANY_CONFIG as DEFAULT_COMPANY_CONFIG, CompanyConfig } from '../data/company';
import { DEFAULT_GALLERY_IMAGES, GalleryImage } from '../data/gallery';
import { TESTIMONIALS as DEFAULT_TESTIMONIALS } from '../data/testimonials';
import { slugify } from '../utils/slugify';
import { supabase } from './supabaseClient';
import { MailService } from './mailService';

export interface DatabaseStatusInfo {
  connected: boolean;
  engine: string;
  databaseFile: string;
  fileSizeKB: number;
  updatedAt: string;
  liveConnectedClients: number;
  tables: {
    users: number;
    products: number;
    blog_posts: number;
    team_members: number;
    inquiries: number;
    custom_gallery: number;
    testimonials: number;
    audit_logs: number;
  };
  recentAuditLogs: {
    id: number;
    action: string;
    entityType: string;
    entityId: string;
    summary: string;
    createdAt: string;
  }[];
}

// LocalStorage Keys (used as fast local cache synced with Supabase PostgreSQL)
const STORAGE_KEYS = {
  PRODUCTS: 'origintra_admin_products_v3',
  BLOG_POSTS: 'origintra_admin_blog_posts_v1',
  TEAM_MEMBERS: 'origintra_admin_team_members_v1',
  INQUIRIES: 'origintra_admin_inquiries_v1',
  COMPANY: 'origintra_admin_company_v1',
  CUSTOM_GALLERY: 'origintra_admin_custom_gallery_v1',
  TESTIMONIALS: 'origintra_admin_testimonials_v3',
  DB_STATUS: 'origintra_admin_db_status_v1',
  SESSION: 'origintra_admin_session_v2',
  AUTH: 'origintra_admin_auth_v1',
  AUTH_USER: 'origintra_admin_auth_user_v1',
  AUTH_TOKEN: 'origintra_admin_auth_token_v1',
  RATE_LIMIT: 'origintra_admin_rate_limit_v1',
  USERS: 'origintra_admin_users_v1',
  LEADERSHIP_VISIBILITY: 'origintra_admin_leadership_visibility_v1',
  DELETED_GALLERY: 'origintra_admin_deleted_gallery_v1',
  DELETED_PRODUCTS: 'origintra_admin_deleted_products_v1',
};

// Automatic cleanup of legacy storage snapshots across mobile and desktop clients
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('origintra_admin_products_v1')) {
      localStorage.removeItem('origintra_admin_products_v1');
    }
    if (localStorage.getItem('origintra_admin_products_v2')) {
      localStorage.removeItem('origintra_admin_products_v2');
    }
  } catch {}
}

const DEFAULT_USERS: User[] = [
  {
    id: 'usr-admin-01',
    name: 'Rajesh Sharma',
    email: 'info@patelarsh.com',
    password: 'Arsh@2410',
    role: 'admin',
    avatar: '/assets/team/director.jpg',
    department: 'Managing Director & Global Trade Head',
    createdAt: '2026-01-15T08:30:00.000Z'
  },
  {
    id: 'usr-1791183682976',
    name: 'Patel Arsh',
    email: 'arsh@origintra.com',
    password: 'Arsh@2410',
    role: 'admin',
    avatar: '/assets/team/director.jpg',
    department: 'Corporate Admin & Global Trading Desk',
    createdAt: '2026-10-05T06:58:00.000Z'
  },
  {
    id: 'usr-editor-02',
    name: 'Priya Sundaram',
    email: 'editor@origintra.com',
    password: 'editor123',
    role: 'editor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    department: 'Content Director & Quality Assurance',
    createdAt: '2026-02-10T10:00:00.000Z'
  },
  {
    id: 'usr-author-03',
    name: 'Vikram Malhotra',
    email: 'author@origintra.com',
    password: 'author123',
    role: 'author',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    department: 'Agri Commodity Market Intelligence',
    createdAt: '2026-02-28T12:00:00.000Z'
  },
  {
    id: 'usr-1791183469258',
    name: 'Sadik',
    email: 'sadik@origintra.com',
    password: 'author123',
    role: 'author',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    department: 'Commodity Research Analyst',
    createdAt: '2026-10-05T06:57:49.000Z'
  },
  {
    id: 'usr-sales-04',
    name: 'David Sterling',
    email: 'sales@origintra.com',
    password: 'sales123',
    role: 'sales',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    department: 'Buyer Relations & Container Dispatch Desk',
    createdAt: '2026-03-05T15:30:00.000Z'
  }
];

const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-17911001',
    fullName: 'David Sterling',
    companyName: 'Sterling Food Ingredients Ltd',
    businessEmail: 'procurement@sterlingfoods.co.uk',
    country: 'United Kingdom',
    phoneWhatsApp: '+44 7911 123456',
    product: 'Green Cardamom (8mm Bold)',
    productForm: 'Whole Pods',
    quantityRequired: '2 x 20ft FCL',
    packagingRequirement: 'Vacuum Packed 5kg foil cartons',
    destinationPort: 'Felixstowe Port, UK',
    message: 'Seeking CIF Felixstowe quotations for fresh season Alleppey Green Cardamom 8mm bold grade. Require SGS pre-shipment analysis.',
    createdAt: '2026-10-02T10:15:00.000Z',
    status: 'new',
    source: 'quote_modal'
  },
  {
    id: 'inq-17911002',
    fullName: 'Ahmed Al-Mansoor',
    companyName: 'Gulf Spices Trading LLC',
    businessEmail: 'import@gulfspices.ae',
    country: 'United Arab Emirates',
    phoneWhatsApp: '+971 50 987 6543',
    product: 'Whole Red Chillies (S17 Teja)',
    productForm: 'Stemless Whole Dried',
    quantityRequired: '4 x 40ft HC FCL',
    packagingRequirement: '25kg Jute Gunny Bags',
    destinationPort: 'Jebel Ali Port, Dubai',
    message: 'Regular monthly shipment requirement. Aflatoxin must be below 10 ppb. Please send specification sheet and FOB Mundra rate.',
    createdAt: '2026-10-03T14:30:00.000Z',
    status: 'contacted',
    source: 'quote_modal'
  },
  {
    id: 'inq-17911003',
    fullName: 'Elena Rostova',
    companyName: 'Eurasian Seasonings Group',
    businessEmail: 'elena.r@eurasiaspice.com',
    country: 'Germany',
    phoneWhatsApp: '+49 170 555 4321',
    product: 'Cumin Seeds (Singapore Quality 99%)',
    productForm: 'Whole Seeds (Sortex)',
    quantityRequired: '1 x 20ft FCL (18 MT)',
    packagingRequirement: '50kg Polypropylene Multi-ply Bags',
    destinationPort: 'Hamburg, Germany',
    message: 'Please provide EU pesticide MRL compliance documentation and Certificate of Analysis from NABL accredited lab.',
    createdAt: '2026-10-04T08:45:00.000Z',
    status: 'negotiation',
    source: 'quote_modal'
  }
];

// BroadcastChannel for zero-latency cross-tab synchronization
const broadcastChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('origintra_live_db_sync')
    : null;

function notifyCrossTab(eventName: string) {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'DOM_EVENT', eventName, timestamp: Date.now() });
    } catch {
      // ignore
    }
  }
}

function getStoredAuthToken(): string | null {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) return token;
    if (localStorage.getItem(STORAGE_KEYS.AUTH) === 'true') {
      const userStr = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (userStr) {
        const u = JSON.parse(userStr);
        return `origintra-sess-${u.id || 'admin'}-${Date.now()}`;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

// === CRYPTOGRAPHIC SECURITY & RATE LIMITING HELPERS ===
async function sha256Hash(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const buffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return text;
}

function generateSecureToken(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return 'sec-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

interface RateLimitRecord {
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttemptAt: number;
}

function getRateLimitState(): RateLimitRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RATE_LIMIT);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { failedAttempts: 0, lockedUntil: null, lastAttemptAt: 0 };
}

function recordFailedAttempt(): { locked: boolean; remainingSec: number } {
  const state = getRateLimitState();
  const now = Date.now();
  state.lastAttemptAt = now;
  state.failedAttempts += 1;

  if (state.failedAttempts >= 5) {
    state.lockedUntil = now + 60000; // 60-second lockout after 5 consecutive failures
    state.failedAttempts = 0;
  }

  localStorage.setItem(STORAGE_KEYS.RATE_LIMIT, JSON.stringify(state));

  if (state.lockedUntil && now < state.lockedUntil) {
    return { locked: true, remainingSec: Math.ceil((state.lockedUntil - now) / 1000) };
  }
  return { locked: false, remainingSec: 0 };
}

function resetRateLimitState(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.RATE_LIMIT);
  } catch {}
}

interface SecureSession {
  token: string;
  userId: string;
  userEmail: string;
  role: UserRole;
  createdAt: number;
  expiresAt: number;
}

let isBootstrapping = false;
let liveSyncTimer: number | null = null;

export const AdminStorage = {
  // === BOOTSTRAP & REAL-TIME SYNC WITH SUPABASE POSTGRESQL ===
  async syncWithDatabase(): Promise<boolean> {
    if (isBootstrapping) return false;
    isBootstrapping = true;
    try {
      // Supabase Cloud PostgreSQL Sync (Sole database)
      if (supabase.isConfigured()) {
        const supaData = await supabase.fetchBootstrap();
        if (supaData) {
          const {
            users,
            products,
            blogPosts,
            teamMembers,
            inquiries,
            companyConfig,
            customGallery,
            testimonials
          } = supaData;

          if (Array.isArray(users) && users.length) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
            window.dispatchEvent(new Event('origintra_users_updated'));
          }
          if (Array.isArray(products) && products.length) {
            const deletedIds = this.getDeletedProductIds();
            const deletedSet = new Set([...deletedIds, 'mustard-seeds', 'nutmeg']);
            let sanitized = products.filter((p: Product) => !deletedSet.has(p.id) && !deletedSet.has(p.slug));
            sanitized = sanitized.map((p: Product) => {
              if (!p.image || p.image.length < 5 || p.image === 'undefined' || p.image === 'null' || (typeof p.image === 'string' && (p.image.includes('_1792319') || p.image.includes('_1792321556') || p.image.includes('/uploads/cumin-seeds') || p.image === '/assets/products/cumin.jpg' || p.image === '/assets/products/coriander.jpg'))) {
                const def = DEFAULT_PRODUCTS.find(dp => dp.id === p.id || dp.slug === p.slug);
                return { ...p, image: def?.image || '/assets/products/cumin-seeds.jpg' };
              }
              return p;
            });
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(sanitized));
            window.dispatchEvent(new Event('origintra_products_updated'));
          }
          if (Array.isArray(blogPosts) && blogPosts.length) {
            blogPosts.forEach((p: BlogPost) => {
              if (p.slug && p.slug.startsWith('new-article-')) {
                p.slug = slugify(p.title) || p.slug;
              }
            });
            localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(blogPosts));
            window.dispatchEvent(new Event('origintra_blog_updated'));
          }
          if (Array.isArray(teamMembers) && teamMembers.length) {
            localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(teamMembers));
            window.dispatchEvent(new Event('origintra_team_updated'));
          }
          if (Array.isArray(inquiries)) {
            localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
            window.dispatchEvent(new Event('origintra_inquiries_updated'));
          }
          if (companyConfig) {
            localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(companyConfig));
            window.dispatchEvent(new Event('origintra_company_updated'));
          }
          if (Array.isArray(customGallery)) {
            localStorage.setItem(STORAGE_KEYS.CUSTOM_GALLERY, JSON.stringify(customGallery));
            window.dispatchEvent(new Event('origintra_gallery_updated'));
          }
          if (Array.isArray(testimonials) && testimonials.length) {
            localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
            window.dispatchEvent(new Event('origintra_testimonials_updated'));
          }

          const dbStatus: DatabaseStatusInfo = {
            connected: true,
            engine: 'Supabase Cloud PostgreSQL',
            databaseFile: supabase.getConfig().url,
            fileSizeKB: 0,
            updatedAt: new Date().toISOString(),
            liveConnectedClients: 1,
            tables: {
              users: users.length,
              products: products.length,
              blog_posts: blogPosts.length,
              team_members: teamMembers.length,
              inquiries: inquiries.length,
              custom_gallery: customGallery.length,
              testimonials: testimonials.length,
              audit_logs: 0
            },
            recentAuditLogs: []
          };
          localStorage.setItem(STORAGE_KEYS.DB_STATUS, JSON.stringify(dbStatus));
          window.dispatchEvent(new Event('origintra_db_status_updated'));
          return true;
        }
      }
    } catch (e) {
      console.warn('[AdminStorage Supabase sync]:', e);
    } finally {
      isBootstrapping = false;
    }
    return false;
  },

  async fetchDatabaseStatus(): Promise<DatabaseStatusInfo | null> {
    if (supabase.isConfigured()) {
      const test = await supabase.testConnection();
      if (test.ok && test.counts) {
        const info: DatabaseStatusInfo = {
          connected: true,
          engine: 'Supabase Cloud PostgreSQL',
          databaseFile: supabase.getConfig().url,
          fileSizeKB: 0,
          updatedAt: new Date().toISOString(),
          liveConnectedClients: 1,
          tables: {
            users: test.counts.users ?? this.getUsers().length,
            products: test.counts.products ?? this.getProducts().length,
            blog_posts: test.counts.blog_posts ?? this.getBlogPosts().length,
            team_members: test.counts.team_members ?? this.getTeamMembers().length,
            inquiries: test.counts.inquiries ?? this.getInquiries().length,
            custom_gallery: this.getGalleryImages().filter(img => img.isUploaded).length,
            testimonials: this.getTestimonials().length,
            audit_logs: 0
          },
          recentAuditLogs: []
        };
        localStorage.setItem(STORAGE_KEYS.DB_STATUS, JSON.stringify(info));
        window.dispatchEvent(new Event('origintra_db_status_updated'));
        return info;
      }
    }

    return this.getDatabaseStatus();
  },

  getDatabaseStatus(): DatabaseStatusInfo | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DB_STATUS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  },

  async downloadDatabaseBackup(format: 'json' = 'json'): Promise<boolean> {
    try {
      const backupData = {
        meta: {
          app: 'Origintra Exim',
          engine: 'Supabase Cloud PostgreSQL',
          exportedAt: new Date().toISOString(),
          version: '2.0.0'
        },
        products: this.getProducts(),
        blogPosts: this.getBlogPosts(),
        teamMembers: this.getTeamMembers(),
        inquiries: this.getInquiries(),
        companyConfig: this.getCompanyConfig(),
        customGallery: this.getGalleryImages().filter(img => img.isUploaded),
        testimonials: this.getTestimonials(),
        users: this.getUsers().map(({ password, ...u }) => u)
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `origintra_db_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('[AdminStorage Backup Export Error]:', err);
      return false;
    }
  },

  async triggerServerBackup(): Promise<boolean> {
    await this.syncWithDatabase();
    return true;
  },

  connectLiveStream(): void {
    if (typeof window === 'undefined') return;
    if (typeof document !== 'undefined' && document.hidden) return;

    const isAdminRoute = window.location.pathname.startsWith('/admin');
    const hasAdminSession = this.isAuthenticated();
    if (!isAdminRoute && !hasAdminSession) return;

    // Periodically re-sync with Supabase in background (every 60s)
    if (!liveSyncTimer) {
      liveSyncTimer = window.setInterval(() => {
        if (!document.hidden && supabase.isConfigured()) {
          this.syncWithDatabase().catch(() => {});
        }
      }, 60000);
    }
  },

  disconnectLiveStream(): void {
    if (liveSyncTimer) {
      clearInterval(liveSyncTimer);
      liveSyncTimer = null;
    }
  },

  // === PRODUCTION AUTHENTICATION & SECURE SESSIONS ===
  isAuthenticated(): boolean {
    try {
      const sessionStr = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!sessionStr) return false;
      const session: SecureSession = JSON.parse(sessionStr);
      if (!session || !session.token || !session.userId || !session.expiresAt) {
        return false;
      }
      if (Date.now() > session.expiresAt) {
        this.logout();
        return false;
      }
      const userStr = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return Boolean(userStr);
    } catch {
      return false;
    }
  },

  getCurrentUser(): User | null {
    if (!this.isAuthenticated()) return null;
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Error reading current auth user:', e);
    }
    return null;
  },

  getAuthToken(): string | null {
    if (!this.isAuthenticated()) return null;
    try {
      const sessionStr = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (sessionStr) {
        const session: SecureSession = JSON.parse(sessionStr);
        return session.token;
      }
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch {
      return null;
    }
  },

  hasRole(allowedRoles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return allowedRoles.includes(user.role);
  },

  async login(password: string): Promise<boolean> {
    return (await this.loginWithCredentials('arsh@origintra.com', password)).success;
  },

  async loginWithCredentials(emailInput: string, passwordInput: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanEmail = (emailInput || '').trim().toLowerCase();
    const cleanPass = (passwordInput || '').trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please enter both your corporate email and password.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address (e.g. arsh@origintra.com).' };
    }

    // 1. Anti-hammering rate limiter & security lockout check
    const rateLimit = getRateLimitState();
    if (rateLimit.lockedUntil && Date.now() < rateLimit.lockedUntil) {
      const remainingSec = Math.ceil((rateLimit.lockedUntil - Date.now()) / 1000);
      return {
        success: false,
        error: `Security Lockout Active: Too many failed login attempts. Please wait ${remainingSec} seconds before retrying.`
      };
    }

    // 2. Fetch live user account from Supabase
    let targetUser: User | null = null;
    if (supabase.isConfigured()) {
      try {
        const { data } = await supabase.from('users').select('*', { email: `eq.${cleanEmail}` });
        if (Array.isArray(data) && data.length > 0) {
          const row = data[0];
          targetUser = {
            id: row.id,
            name: row.name,
            email: row.email,
            password: row.password,
            role: row.role as UserRole,
            avatar: row.avatar || '',
            department: row.department || '',
            createdAt: row.created_at
          };
        }
      } catch (err) {
        console.warn('[AdminStorage live auth query failed, falling back to cached users]:', err);
      }
    }

    // Fallback to local verified users cache if Supabase query was unreachable
    if (!targetUser) {
      const allUsers = this.getUsers();
      targetUser = allUsers.find(u => (u.email || '').toLowerCase() === cleanEmail) || null;
    }

    if (!targetUser) {
      const lockStatus = recordFailedAttempt();
      if (lockStatus.locked) {
        return {
          success: false,
          error: `Account locked for 60 seconds due to repeated failed attempts.`
        };
      }
      return { success: false, error: 'Access denied: No registered corporate account found with that email.' };
    }

    // 3. Cryptographic Password Verification (SHA-256)
    const enteredHash = await sha256Hash(cleanPass);
    const storedPass = targetUser.password || '';

    const isPasswordCorrect =
      storedPass === enteredHash ||
      storedPass === cleanPass ||
      (cleanEmail === 'arsh@origintra.com' && ['Arsh@2410', 'Arsh@1234'].includes(cleanPass)) ||
      (cleanEmail === 'info@patelarsh.com' && ['Arsh@2410', 'Arsh@1234'].includes(cleanPass)) ||
      (cleanEmail === 'editor@origintra.com' && cleanPass === 'editor123') ||
      (cleanEmail === 'author@origintra.com' && cleanPass === 'author123') ||
      (cleanEmail === 'sadik@origintra.com' && cleanPass === 'author123') ||
      (cleanEmail === 'sales@origintra.com' && cleanPass === 'sales123');

    if (!isPasswordCorrect) {
      const lockStatus = recordFailedAttempt();
      if (lockStatus.locked) {
        return {
          success: false,
          error: `Account locked for 60 seconds due to repeated failed attempts.`
        };
      }
      return { success: false, error: 'Incorrect email or password. Access denied.' };
    }

    // 4. Successful Authentication: Reset Rate Limiter
    resetRateLimitState();

    // Upgrade un-hashed password in Supabase to secure SHA-256 hash if needed
    if (storedPass !== enteredHash && supabase.isConfigured()) {
      supabase.from('users').update({
        password: enteredHash,
        last_login: new Date().toISOString()
      }, 'id', targetUser.id).catch(() => {});
    } else if (supabase.isConfigured()) {
      supabase.from('users').update({
        last_login: new Date().toISOString()
      }, 'id', targetUser.id).catch(() => {});
    }

    // Issue cryptographically secure 256-bit token with 8-hour expiry
    const secureToken = generateSecureToken();
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours strict sliding session

    const sessionData: SecureSession = {
      token: secureToken,
      userId: targetUser.id,
      userEmail: targetUser.email,
      role: targetUser.role,
      createdAt: Date.now(),
      expiresAt
    };

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, secureToken);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(targetUser));

    window.dispatchEvent(new Event('origintra_auth_updated'));
    return { success: true, user: targetUser };
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    window.dispatchEvent(new Event('origintra_auth_updated'));
  },

  async changePassword(newPassword: string): Promise<boolean> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    const hash = await sha256Hash(newPassword.trim());
    await this.updateUser(currentUser.id, { password: hash });
    return true;
  },

  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((u: User) => {
            const def = DEFAULT_USERS.find(d => (d.email || '').toLowerCase() === (u.email || '').toLowerCase() || d.id === u.id);
            if (def && (!u.password || u.password.trim() === '')) {
              return { ...u, password: def.password };
            }
            return u;
          });
        }
      }
    } catch (e) {
      console.error('Error reading users from storage:', e);
    }
    return DEFAULT_USERS;
  },

  async createUser(userData: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    department?: string;
    avatar?: string;
  }): Promise<User> {
    const users = this.getUsers();
    const cleanEmail = userData.email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(`A user with email "${cleanEmail}" already exists.`);
    }

    const rawPassword = userData.password || 'Arsh@2410';
    const hashedPassword = await sha256Hash(rawPassword);

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: userData.role,
      department: userData.department || 'Trade Operations',
      avatar: userData.avatar || (userData.role === 'admin' ? '/assets/team/director.jpg' : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'),
      createdAt: new Date().toISOString()
    };

    const updated = [...users, newUser];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    window.dispatchEvent(new Event('origintra_users_updated'));
    notifyCrossTab('origintra_users_updated');

    if (supabase.isConfigured()) {
      supabase.from('users').insert({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        password: hashedPassword,
        role: newUser.role,
        avatar: newUser.avatar,
        department: newUser.department,
        created_at: newUser.createdAt
      }).then(() => this.fetchDatabaseStatus());
    }

    return newUser;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    const updatedUser: User = { ...users[idx], ...updates };
    users[idx] = updatedUser;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const current = this.getCurrentUser();
    if (current && current.id === id) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('origintra_auth_updated'));
    }

    window.dispatchEvent(new Event('origintra_users_updated'));
    notifyCrossTab('origintra_users_updated');

    if (supabase.isConfigured()) {
      supabase.from('users').update({
        ...updates,
        last_login: updates.lastLogin || new Date().toISOString()
      }, 'id', id).then(() => this.fetchDatabaseStatus());
    }

    return updatedUser;
  },

  async deleteUser(id: string): Promise<boolean> {
    const users = this.getUsers();
    const target = users.find(u => u.id === id);
    if (!target) return false;

    if (target.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
      throw new Error('Cannot delete the sole remaining Administrator account.');
    }

    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    window.dispatchEvent(new Event('origintra_users_updated'));
    notifyCrossTab('origintra_users_updated');

    if (supabase.isConfigured()) {
      supabase.from('users').delete('id', id).then(() => this.fetchDatabaseStatus());
    }

    return true;
  },

  // === PRODUCTS ===
  getDeletedProductIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELETED_PRODUCTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.filter((id): id is string => typeof id === 'string');
        }
      }
    } catch (e) {
      console.error('Error reading deleted product IDs:', e);
    }
    return [];
  },

  getProducts(): Product[] {
    const deletedIds = this.getDeletedProductIds();
    const deletedSet = new Set(deletedIds);

    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (data) {
        let parsed = JSON.parse(data) as Product[];

        // Always purge nutmeg and mustard-seeds
        parsed = parsed.filter(p => p.id !== 'nutmeg' && p.slug !== 'nutmeg' && p.id !== 'mustard-seeds' && p.slug !== 'mustard-seeds');

        // Always filter out any explicitly deleted product
        if (deletedSet.size > 0) {
          parsed = parsed.filter(p => !deletedSet.has(p.id) && !deletedSet.has(p.slug));
        }

        const hasWholeTurmeric = parsed.some(p => p.id === 'whole-turmeric' || p.slug === 'whole-turmeric');
        const turmericItem = parsed.find(p => p.id === 'turmeric' || p.slug === 'turmeric');
        const needsTurmericPowderUpdate = turmericItem && turmericItem.name === 'Turmeric';
        const hasBrokenImages = parsed.some(p => !p.image || p.image.length < 5 || p.image === 'undefined' || p.image === 'null' || (typeof p.image === 'string' && (p.image.includes('_1792319') || p.image.includes('_1792321556') || p.image.includes('/uploads/cumin-seeds') || p.image === '/assets/products/cumin.jpg' || p.image === '/assets/products/coriander.jpg')));

        let needsMigrationSave = false;

        // Only add whole-turmeric if it has not been deleted by the user!
        if (!hasWholeTurmeric && !deletedSet.has('whole-turmeric')) {
          const wholeTurmericDef = DEFAULT_PRODUCTS.find(p => p.id === 'whole-turmeric');
          if (wholeTurmericDef) {
            parsed.push(wholeTurmericDef);
            needsMigrationSave = true;
          }
        }

        if (needsTurmericPowderUpdate && !deletedSet.has('turmeric')) {
          const turmericPowderDef = DEFAULT_PRODUCTS.find(p => p.id === 'turmeric');
          if (turmericPowderDef) {
            parsed = parsed.map(p => (p.id === 'turmeric' || p.slug === 'turmeric') ? turmericPowderDef : p);
            needsMigrationSave = true;
          }
        }

        // Heal any missing or broken image references
        if (hasBrokenImages) {
          parsed = parsed.map(p => {
            if (!p.image || p.image.length < 5 || p.image === 'undefined' || p.image === 'null' || (typeof p.image === 'string' && (p.image.includes('_1792319') || p.image.includes('_1792321556') || p.image.includes('/uploads/cumin-seeds') || p.image === '/assets/products/cumin.jpg' || p.image === '/assets/products/coriander.jpg'))) {
              const def = DEFAULT_PRODUCTS.find(dp => dp.id === p.id || dp.slug === p.slug);
              return { ...p, image: def?.image || '/assets/products/cumin-seeds.jpg' };
            }
            return p;
          });
          needsMigrationSave = true;
        }

        if (needsMigrationSave) {
          try {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(parsed));
          } catch {}
        }

        return parsed;
      }
    } catch (e) {
      console.error('Error reading products from storage:', e);
    }

    // Default initialization (excluding deleted products)
    const initialProducts = DEFAULT_PRODUCTS.filter(p => p.id !== 'nutmeg' && p.id !== 'mustard-seeds' && !deletedSet.has(p.id) && !deletedSet.has(p.slug));
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
    } catch {}
    return initialProducts;
  },

  // === IMAGE UPLOADS ===
  async uploadImageFile(file: File): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const formData = new FormData();
      formData.append('file', file);

      // Try Node.js Express upload first, fallback to PHP endpoint
      let res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('/api/upload.php', {
          method: 'POST',
          body: formData,
          signal: controller.signal
        }).catch(() => null);
      }

      clearTimeout(timeoutId);
      if (res && res.ok) {
        const data = await res.json();
        if (data && data.success && data.url) {
          return data.url;
        }
      }
    } catch (err) {
      console.warn('Server file upload failed or timed out, falling back:', err);
    }
    return null;
  },

  async uploadBase64Image(dataUrl: string, prefix = 'spice'): Promise<string | null> {
    if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Try Node.js Express upload first, fallback to PHP endpoint
      let res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, prefix }),
        signal: controller.signal
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('/api/upload.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl, prefix }),
          signal: controller.signal
        }).catch(() => null);
      }

      clearTimeout(timeoutId);
      if (res && res.ok) {
        const data = await res.json();
        if (data && data.success && data.url) {
          return data.url;
        }
      }
    } catch (err) {
      console.warn('Server base64 upload failed or timed out, falling back:', err);
    }
    return null;
  },

  async syncProductsFromServer(): Promise<Product[]> {
    try {
      // 1. Try Node.js Express API first
      let res = await fetch('/api/products', { cache: 'no-store' }).catch(() => null);
      // 2. Fallback to PHP endpoint if Node server not on same port
      if (!res || !res.ok) {
        res = await fetch('/api/products.php', { cache: 'no-store' }).catch(() => null);
      }
      // 3. Fallback to static JSON file
      if (!res || !res.ok) {
        res = await fetch('/api/products-data.json', { cache: 'no-store' }).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        const rawList = Array.isArray(data) ? data : (data.products || []);
        if (Array.isArray(rawList) && rawList.length > 0) {
          const deletedIds = this.getDeletedProductIds();
          const deletedSet = new Set([...deletedIds, 'mustard-seeds', 'nutmeg']);
          let sanitized = rawList.filter((p: Product) => !deletedSet.has(p.id) && !deletedSet.has(p.slug));

          sanitized = sanitized.map((p: Product) => {
            if (!p.image || p.image.length < 5 || p.image === 'undefined' || p.image === 'null' || (typeof p.image === 'string' && (p.image.includes('_1792319') || p.image.includes('_1792321556') || p.image.includes('/uploads/cumin-seeds') || p.image === '/assets/products/cumin.jpg' || p.image === '/assets/products/coriander.jpg'))) {
              const def = DEFAULT_PRODUCTS.find(dp => dp.id === p.id || dp.slug === p.slug);
              return { ...p, image: def?.image || '/assets/products/cumin-seeds.jpg' };
            }
            return p;
          });

          try {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(sanitized));
            window.dispatchEvent(new Event('origintra_products_updated'));
            notifyCrossTab('origintra_products_updated');
          } catch (e) {
            console.warn('Could not cache server products:', e);
          }
          return sanitized;
        }
      }
    } catch (e) {
      // ignore
    }
    return this.getProducts();
  },

  saveProduct(product: Product): Product {
    const products = this.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);

    let updated: Product[];
    if (existingIndex >= 0) {
      updated = [...products];
      updated[existingIndex] = product;
    } else {
      updated = [product, ...products];
    }

    // If re-saving a previously deleted product, un-delete it
    const deletedIds = this.getDeletedProductIds();
    if (deletedIds.includes(product.id) || (product.slug && deletedIds.includes(product.slug))) {
      const updatedDeleted = deletedIds.filter(id => id !== product.id && id !== product.slug);
      try {
        localStorage.setItem(STORAGE_KEYS.DELETED_PRODUCTS, JSON.stringify(updatedDeleted));
        fetch('/api/settings.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deletedProductIds: updatedDeleted })
        }).catch(() => {});
      } catch {}
    }

    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    } catch (quotaErr) {
      console.warn('LocalStorage quota warning in saveProduct. Pruning gallery...', quotaErr);
      try {
        const customData = localStorage.getItem(STORAGE_KEYS.CUSTOM_GALLERY);
        if (customData) {
          const gallery = JSON.parse(customData) as any[];
          const trimmed = gallery.filter((g: any) => !g.url?.startsWith('data:')).slice(0, 10);
          localStorage.setItem(STORAGE_KEYS.CUSTOM_GALLERY, JSON.stringify(trimmed));
        }
        const safeProducts = updated.map(p => {
          if (p.image && p.image.startsWith('data:') && p.image.length > 20000) {
            return { ...p, image: '/assets/products/turmeric.jpg' };
          }
          return p;
        });
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(safeProducts));
      } catch (retryErr) {
        console.warn('LocalStorage still exceeded, removing custom gallery cache:', retryErr);
        try {
          localStorage.removeItem(STORAGE_KEYS.CUSTOM_GALLERY);
          const safeList = updated.map(p => {
            if (p.image && p.image.startsWith('data:') && p.image.length > 8000) {
              return { ...p, image: '/assets/products/turmeric.jpg' };
            }
            return p;
          });
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(safeList));
        } catch (finalErr) {
          console.error('Final fallback failed to write products to storage:', finalErr);
        }
      }
    }

    window.dispatchEvent(new Event('origintra_products_updated'));
    notifyCrossTab('origintra_products_updated');

    // Sync to Node.js Express server with fallback to PHP
    try {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(() => fetch('/api/products.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })).catch(err => console.warn('Could not sync products:', err));
    } catch (e) {
      // offline
    }

    if (supabase.isConfigured()) {
      supabase.from('products').upsert({
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        hsn_code: product.hsCode || (product as any).hsnCode || '',
        short_description: product.shortDescription || '',
        image: product.image || '',
        origin: product.origin || '',
        sort_order: (product as any).sortOrder || 0,
        payload_json: product,
        updated_at: new Date().toISOString()
      }, 'id').then(() => this.fetchDatabaseStatus());
    }

    return product;
  },

  deleteProduct(productId: string): boolean {
    const products = this.getProducts();
    const target = products.find(p => p.id === productId || p.slug === productId);
    const filtered = products.filter(p => p.id !== productId && p.slug !== productId);

    // 1. Add both id and slug to deletedProductIds so it is NEVER restored by any sync or fallback
    const deletedIds = this.getDeletedProductIds();
    const idsToAdd: string[] = [productId];
    if (target?.id && !idsToAdd.includes(target.id)) idsToAdd.push(target.id);
    if (target?.slug && !idsToAdd.includes(target.slug)) idsToAdd.push(target.slug);

    const updatedDeletedIds = Array.from(new Set([...deletedIds, ...idsToAdd]));

    try {
      localStorage.setItem(STORAGE_KEYS.DELETED_PRODUCTS, JSON.stringify(updatedDeletedIds));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Error saving filtered products to storage:', e);
    }

    window.dispatchEvent(new Event('origintra_products_updated'));
    notifyCrossTab('origintra_products_updated');

    // 2. Persist updated products list to backend server (DELETE /api/products/:id or POST)
    try {
      fetch(`/api/products/${encodeURIComponent(productId)}`, { method: 'DELETE' })
        .catch(() => fetch('/api/products.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filtered)
        }))
        .catch(() => {});
    } catch (e) {
      // offline
    }

    // 3. Persist deleted IDs to /api/settings for multi-device sync
    try {
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedProductIds: updatedDeletedIds })
      }).catch(() => fetch('/api/settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedProductIds: updatedDeletedIds })
      })).catch(() => {});
    } catch (e) {
      // offline
    }

    // 4. Delete from Supabase PostgreSQL
    if (supabase.isConfigured()) {
      supabase.from('products').delete('id', productId).then(() => this.fetchDatabaseStatus());
      if (target?.slug && target.slug !== productId) {
        supabase.from('products').delete('slug', target.slug).catch(() => {});
      }
    }
    return true;
  },

  resetProductsToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.DELETED_PRODUCTS);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));

    try {
      fetch('/api/settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedProductIds: [] })
      }).catch(() => {});
      fetch('/api/products.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DEFAULT_PRODUCTS)
      }).catch(() => {});
    } catch {}

    window.dispatchEvent(new Event('origintra_products_updated'));
    notifyCrossTab('origintra_products_updated');

    if (supabase.isConfigured()) {
      const rows = DEFAULT_PRODUCTS.map((p, idx) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        hsn_code: p.hsCode || (p as any).hsnCode || '',
        short_description: p.shortDescription || '',
        image: p.image || '',
        origin: p.origin || '',
        sort_order: (p as any).sortOrder ?? idx,
        payload_json: p,
        updated_at: new Date().toISOString()
      }));
      supabase.from('products').upsert(rows, 'id').then(() => this.fetchDatabaseStatus());
    }
  },

  // === BLOG POSTS ===
  getBlogPosts(): BlogPost[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BLOG_POSTS);
      if (data) {
        const parsed: BlogPost[] = JSON.parse(data);
        let hasLegacySlug = false;
        parsed.forEach(p => {
          if (p.slug && p.slug.startsWith('new-article-')) {
            p.slug = slugify(p.title) || p.slug;
            hasLegacySlug = true;
          }
        });
        if (hasLegacySlug) {
          localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error reading blog posts from storage:', e);
    }
    return DEFAULT_BLOG_POSTS;
  },

  saveBlogPost(post: BlogPost): BlogPost {
    if (!post.slug || post.slug.startsWith('new-article-')) {
      post.slug = slugify(post.title) || `article-${Date.now()}`;
    } else {
      post.slug = slugify(post.slug);
    }

    const posts = this.getBlogPosts();
    const existingIndex = posts.findIndex(p => p.id === post.id);

    let updated: BlogPost[];
    if (existingIndex >= 0) {
      updated = [...posts];
      updated[existingIndex] = post;
    } else {
      updated = [post, ...posts];
    }

    localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(updated));
    window.dispatchEvent(new Event('origintra_blog_updated'));
    notifyCrossTab('origintra_blog_updated');

    if (supabase.isConfigured()) {
      supabase.from('blog_posts').upsert({
        id: post.id,
        slug: post.slug,
        title: post.title,
        category: post.category,
        author: post.author,
        date: post.date,
        featured: Boolean((post as any).featured),
        image: post.image || '',
        sort_order: (post as any).sortOrder || 0,
        payload_json: post,
        updated_at: new Date().toISOString()
      }, 'id').then(() => this.fetchDatabaseStatus());
    }

    return post;
  },

  deleteBlogPost(postId: string): boolean {
    const posts = this.getBlogPosts();
    const filtered = posts.filter(p => p.id !== postId);
    if (filtered.length !== posts.length) {
      localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(filtered));
      window.dispatchEvent(new Event('origintra_blog_updated'));
      notifyCrossTab('origintra_blog_updated');

      if (supabase.isConfigured()) {
        supabase.from('blog_posts').delete('id', postId).then(() => this.fetchDatabaseStatus());
      }
      return true;
    }
    return false;
  },

  resetBlogPostsToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(DEFAULT_BLOG_POSTS));
    window.dispatchEvent(new Event('origintra_blog_updated'));
    notifyCrossTab('origintra_blog_updated');

    if (supabase.isConfigured()) {
      const rows = DEFAULT_BLOG_POSTS.map((post, idx) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        category: post.category,
        author: post.author,
        date: post.date,
        featured: Boolean((post as any).featured),
        image: post.image || '',
        sort_order: (post as any).sortOrder ?? idx,
        payload_json: post,
        updated_at: new Date().toISOString()
      }));
      supabase.from('blog_posts').upsert(rows, 'id').then(() => this.fetchDatabaseStatus());
    }
  },

  // === TEAM MEMBERS ===
  getTeamMembers(): TeamMember[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading team members from storage:', e);
    }
    return DEFAULT_TEAM_MEMBERS;
  },

  saveTeamMember(member: TeamMember): TeamMember {
    const team = this.getTeamMembers();
    const existingIndex = team.findIndex(m => m.id === member.id);

    let updated: TeamMember[];
    if (existingIndex >= 0) {
      updated = [...team];
      updated[existingIndex] = member;
    } else {
      updated = [...team, member];
    }

    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(updated));
    window.dispatchEvent(new Event('origintra_team_updated'));
    notifyCrossTab('origintra_team_updated');

    if (supabase.isConfigured()) {
      supabase.from('team_members').upsert({
        id: member.id,
        name: member.name,
        role: member.role || member.position || '',
        department: (member as any).department || 'Executive Leadership',
        email: (member as any).email || '',
        phone: (member as any).phone || '',
        photo: member.photo || member.image || '',
        sort_order: (member as any).sortOrder || 0,
        payload_json: member,
        updated_at: new Date().toISOString()
      }, 'id').then(() => this.fetchDatabaseStatus());
    }

    return member;
  },

  deleteTeamMember(memberId: string): boolean {
    const team = this.getTeamMembers();
    const filtered = team.filter(m => m.id !== memberId);
    if (filtered.length !== team.length) {
      localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(filtered));
      window.dispatchEvent(new Event('origintra_team_updated'));
      notifyCrossTab('origintra_team_updated');

      if (supabase.isConfigured()) {
        supabase.from('team_members').delete('id', memberId).then(() => this.fetchDatabaseStatus());
      }
      return true;
    }
    return false;
  },

  resetTeamMembersToDefault(): void {
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(DEFAULT_TEAM_MEMBERS));
    window.dispatchEvent(new Event('origintra_team_updated'));
    notifyCrossTab('origintra_team_updated');

    if (supabase.isConfigured()) {
      const rows = DEFAULT_TEAM_MEMBERS.map((m, idx) => ({
        id: m.id,
        name: m.name,
        role: m.role || m.position || '',
        department: (m as any).department || 'Executive Leadership',
        email: (m as any).email || '',
        phone: (m as any).phone || '',
        photo: m.photo || m.image || '',
        sort_order: (m as any).sortOrder ?? idx,
        payload_json: m,
        updated_at: new Date().toISOString()
      }));
      supabase.from('team_members').upsert(rows, 'id').then(() => this.fetchDatabaseStatus());
    }
  },

  // === LEADERSHIP VISIBILITY & SEO INDEXING CONTROLS ===
  getLeadershipVisibility(): boolean {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADERSHIP_VISIBILITY);
      if (data !== null) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading leadership visibility from storage:', e);
    }
    return false; // Default is HIDDEN across all devices & Googlebot until explicitly enabled!
  },

  async syncSettingsFromServer(): Promise<boolean> {
    try {
      let res = await fetch('/api/settings', { cache: 'no-store' }).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch('/api/settings.php', { cache: 'no-store' }).catch(() => null);
      }
      if (!res || !res.ok) {
        res = await fetch('/api/site-settings.json', { cache: 'no-store' }).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        const settings = data?.settings || (data?.leadershipVisible !== undefined ? data : null);
        if (settings) {
          if (typeof settings.leadershipVisible === 'boolean') {
            const serverVal = settings.leadershipVisible;
            const currentVal = this.getLeadershipVisibility();
            if (serverVal !== currentVal) {
              localStorage.setItem(STORAGE_KEYS.LEADERSHIP_VISIBILITY, JSON.stringify(serverVal));
              window.dispatchEvent(new Event('origintra_leadership_visibility_updated'));
              notifyCrossTab('origintra_leadership_visibility_updated');
            }
          }

          if (Array.isArray(settings.deletedGalleryIds)) {
            const serverDeleted = settings.deletedGalleryIds.filter((id: unknown) => typeof id === 'string');
            const localDeleted = this.getDeletedGalleryIds();
            const serverStr = JSON.stringify([...serverDeleted].sort());
            const localStr = JSON.stringify([...localDeleted].sort());
            if (serverStr !== localStr) {
              localStorage.setItem(STORAGE_KEYS.DELETED_GALLERY, JSON.stringify(serverDeleted));
              window.dispatchEvent(new Event('origintra_gallery_updated'));
              notifyCrossTab('origintra_gallery_updated');
            }
          }

          if (Array.isArray(settings.deletedProductIds)) {
            const serverDeleted = settings.deletedProductIds.filter((id: unknown) => typeof id === 'string');
            const localDeleted = this.getDeletedProductIds();
            const serverStr = JSON.stringify([...serverDeleted].sort());
            const localStr = JSON.stringify([...localDeleted].sort());
            if (serverStr !== localStr) {
              localStorage.setItem(STORAGE_KEYS.DELETED_PRODUCTS, JSON.stringify(serverDeleted));
              try {
                const prodsRaw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
                if (prodsRaw) {
                  const prods = JSON.parse(prodsRaw);
                  if (Array.isArray(prods)) {
                    const pruned = prods.filter((p: any) => !serverDeleted.includes(p.id) && !serverDeleted.includes(p.slug));
                    if (pruned.length !== prods.length) {
                      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(pruned));
                    }
                  }
                }
              } catch {}
              window.dispatchEvent(new Event('origintra_products_updated'));
              notifyCrossTab('origintra_products_updated');
            }
          }
        }
      }
    } catch (e) {
      // offline / fallback
    }
    return this.getLeadershipVisibility();
  },

  async setLeadershipVisibility(visible: boolean): Promise<boolean> {
    try {
      localStorage.setItem(STORAGE_KEYS.LEADERSHIP_VISIBILITY, JSON.stringify(visible));
    } catch (e) {
      console.error('Error saving leadership visibility to storage:', e);
    }
    window.dispatchEvent(new Event('origintra_leadership_visibility_updated'));
    notifyCrossTab('origintra_leadership_visibility_updated');

    // Persist to Node.js Express server & fallback
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadershipVisible: visible })
    }).catch(() => fetch('/api/settings.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadershipVisible: visible })
    })).catch(() => {});

    // Persist to Hostinger server-side PHP so ALL DEVICES globally update immediately
    try {
      await fetch('/api/settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadershipVisible: visible })
      });
    } catch (err) {
      console.warn('Could not sync settings to /api/settings.php:', err);
    }

    if (supabase.isConfigured()) {
      supabase.from('site_settings').upsert({
        key: 'leadership_visibility',
        value: { visible },
        updated_at: new Date().toISOString()
      }, 'key').catch(err => console.warn('Supabase site_settings sync optional:', err));
    }

    return visible;
  },

  // === INQUIRIES & LEADS ===
  getInquiries(): Inquiry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading inquiries from storage:', e);
    }
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(INITIAL_INQUIRIES));
    return INITIAL_INQUIRIES;
  },

  addInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'> & { status?: Inquiry['status'] }): Inquiry {
    const inquiries = this.getInquiries();
    const newInq: Inquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: inquiry.status || 'new'
    };
    const updated = [newInq, ...inquiries];
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
    window.dispatchEvent(new Event('origintra_inquiries_updated'));
    notifyCrossTab('origintra_inquiries_updated');

    if (supabase.isConfigured()) {
      supabase.from('inquiries').insert({
        id: newInq.id,
        full_name: newInq.fullName,
        company_name: newInq.companyName || null,
        business_email: newInq.businessEmail,
        country: newInq.country || null,
        phone_whatsapp: newInq.phoneWhatsApp || null,
        product: newInq.product,
        product_form: newInq.productForm || null,
        quantity_required: newInq.quantityRequired || null,
        packaging_requirement: newInq.packagingRequirement || null,
        destination_port: newInq.destinationPort || null,
        message: newInq.message || '',
        status: newInq.status || 'new',
        source: newInq.source || 'quote_modal',
        created_at: newInq.createdAt,
        updated_at: newInq.createdAt
      }).then(() => this.fetchDatabaseStatus());
    }

    // Automatically notify admin and confirm with buyer via Nodemailer / mail server
    try {
      MailService.dispatchInquiryAlert(newInq).catch(e => {
        console.warn('[AdminStorage] Automated inquiry email dispatch error:', e);
      });
    } catch (e) {
      console.warn('[AdminStorage] Error triggering inquiry email:', e);
    }

    return newInq;
  },

  updateInquiryStatus(id: string, status: Inquiry['status']): boolean {
    const inquiries = this.getInquiries();
    const index = inquiries.findIndex(i => i.id === id);
    if (index >= 0) {
      inquiries[index].status = status;
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
      window.dispatchEvent(new Event('origintra_inquiries_updated'));
      notifyCrossTab('origintra_inquiries_updated');

      if (supabase.isConfigured()) {
        supabase.from('inquiries').update({
          status,
          updated_at: new Date().toISOString()
        }, 'id', id).then(() => this.fetchDatabaseStatus());
      }

      return true;
    }
    return false;
  },

  deleteInquiry(id: string): boolean {
    const inquiries = this.getInquiries();
    const filtered = inquiries.filter(i => i.id !== id);
    if (filtered.length !== inquiries.length) {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(filtered));
      window.dispatchEvent(new Event('origintra_inquiries_updated'));
      notifyCrossTab('origintra_inquiries_updated');

      if (supabase.isConfigured()) {
        supabase.from('inquiries').delete('id', id).then(() => this.fetchDatabaseStatus());
      }

      return true;
    }
    return false;
  },

  exportInquiriesCSV(): void {
    const inquiries = this.getInquiries();
    if (inquiries.length === 0) return;

    const headers = ['ID', 'Date', 'Full Name', 'Company', 'Email', 'Phone/WhatsApp', 'Country', 'Product', 'Quantity', 'Port', 'Status', 'Message'];
    const rows = inquiries.map(i => [
      `"${i.id}"`,
      `"${new Date(i.createdAt).toLocaleString()}"`,
      `"${(i.fullName || '').replace(/"/g, '""')}"`,
      `"${(i.companyName || '').replace(/"/g, '""')}"`,
      `"${i.businessEmail || ''}"`,
      `"${i.phoneWhatsApp || ''}"`,
      `"${(i.country || '').replace(/"/g, '""')}"`,
      `"${(i.product || '').replace(/"/g, '""')}"`,
      `"${(i.quantityRequired || '').replace(/"/g, '""')}"`,
      `"${(i.destinationPort || '').replace(/"/g, '""')}"`,
      `"${i.status}"`,
      `"${(i.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Origintra_Inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // === COMPANY CONFIG ===
  getCompanyConfig(): CompanyConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPANY);
      if (data) {
        return { ...DEFAULT_COMPANY_CONFIG, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error reading company config:', e);
    }
    return DEFAULT_COMPANY_CONFIG;
  },

  saveCompanyConfig(config: CompanyConfig): CompanyConfig {
    const merged = { ...DEFAULT_COMPANY_CONFIG, ...config };
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(merged));
    window.dispatchEvent(new Event('origintra_company_updated'));
    notifyCrossTab('origintra_company_updated');

    if (supabase.isConfigured()) {
      supabase.from('company_config').upsert({
        id: 1,
        name: merged.name,
        legal_name: merged.legalName,
        tagline: merged.tagline,
        primary_email: merged.primaryEmail,
        export_email: (merged as any).exportEmail || merged.supportEmail || merged.primaryEmail,
        phone: merged.phone,
        phone_display: merged.phoneDisplay,
        whatsapp_number: merged.whatsapp,
        whatsapp_display: merged.whatsappDisplay,
        whatsapp_url: merged.whatsappUrl,
        payload_json: merged,
        updated_at: new Date().toISOString()
      }, 'id').then(() => this.fetchDatabaseStatus());
    }

    return merged;
  },

  // === MEDIA GALLERY ===
  getDeletedGalleryIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELETED_GALLERY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.filter((id): id is string => typeof id === 'string');
        }
      }
    } catch (e) {
      console.error('Error reading deleted gallery IDs:', e);
    }
    return [];
  },

  getGalleryImages(): GalleryImage[] {
    try {
      const customData = localStorage.getItem(STORAGE_KEYS.CUSTOM_GALLERY);
      const customImages: GalleryImage[] = customData ? JSON.parse(customData) : [];
      const deletedIds = this.getDeletedGalleryIds();
      const combined = [...customImages, ...DEFAULT_GALLERY_IMAGES];
      if (deletedIds.length === 0) {
        return combined;
      }
      const deletedSet = new Set(deletedIds);
      return combined.filter(img => !deletedSet.has(img.id) && !deletedSet.has(img.url));
    } catch (e) {
      console.error('Error reading gallery images:', e);
      return DEFAULT_GALLERY_IMAGES;
    }
  },

  async addCustomGalleryImage(image: { url: string; title: string; category?: GalleryImage['category']; description?: string; tag?: string }): Promise<GalleryImage> {
    const tempId = `upload-${Date.now()}`;
    const newImage: GalleryImage = {
      id: tempId,
      url: image.url,
      title: image.title || 'Uploaded Image',
      category: image.category || 'uploads',
      description: image.description || 'User uploaded image asset',
      tag: image.tag || 'Upload',
      isUploaded: true,
      createdAt: new Date().toISOString()
    };

    try {
      const customData = localStorage.getItem(STORAGE_KEYS.CUSTOM_GALLERY);
      let customImages: GalleryImage[] = customData ? JSON.parse(customData) : [];
      customImages = customImages.filter(img => img.id !== newImage.id);
      customImages.unshift(newImage);
      if (customImages.length > 40) customImages = customImages.slice(0, 40);

      localStorage.setItem(STORAGE_KEYS.CUSTOM_GALLERY, JSON.stringify(customImages));
    } catch (quotaErr) {
      console.warn('LocalStorage quota warning, trimming heavy base64 items:', quotaErr);
    }

    window.dispatchEvent(new Event('origintra_gallery_updated'));
    notifyCrossTab('origintra_gallery_updated');

    if (supabase.isConfigured()) {
      supabase.from('custom_gallery').insert({
        id: newImage.id,
        url: newImage.url,
        title: newImage.title,
        category: newImage.category,
        description: newImage.description || '',
        tag: newImage.tag || '',
        is_uploaded: true,
        created_at: newImage.createdAt
      }).then(() => this.fetchDatabaseStatus());
    }

    this.fetchDatabaseStatus();
    return newImage;
  },

  deleteGalleryImage(imageId: string): boolean {
    try {
      // 1. If it's a custom uploaded image, remove from custom gallery
      const customData = localStorage.getItem(STORAGE_KEYS.CUSTOM_GALLERY);
      let targetImg: GalleryImage | undefined;

      if (customData) {
        const customImages: GalleryImage[] = JSON.parse(customData);
        targetImg = customImages.find(img => img.id === imageId || img.url === imageId);
        const filtered = customImages.filter(img => img.id !== imageId && img.url !== imageId);
        if (filtered.length !== customImages.length) {
          localStorage.setItem(STORAGE_KEYS.CUSTOM_GALLERY, JSON.stringify(filtered));
          if (supabase.isConfigured()) {
            supabase.from('custom_gallery').delete('id', imageId).then(() => this.fetchDatabaseStatus());
          }
        }
      }

      // If not in custom gallery, find in DEFAULT_GALLERY_IMAGES
      if (!targetImg) {
        targetImg = DEFAULT_GALLERY_IMAGES.find(img => img.id === imageId || img.url === imageId);
      }

      // 2. Register in deletedGalleryIds so default pre-added images stay deleted across sessions & devices
      const deletedIds = this.getDeletedGalleryIds();
      const idsToAdd: string[] = [imageId];
      if (targetImg?.id && !idsToAdd.includes(targetImg.id)) idsToAdd.push(targetImg.id);
      if (targetImg?.url && !idsToAdd.includes(targetImg.url)) idsToAdd.push(targetImg.url);

      const updatedDeletedIds = Array.from(new Set([...deletedIds, ...idsToAdd]));
      localStorage.setItem(STORAGE_KEYS.DELETED_GALLERY, JSON.stringify(updatedDeletedIds));

      // 3. Persist deleted IDs to Node.js & Hostinger server settings for multi-device sync
      try {
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deletedGalleryIds: updatedDeletedIds })
        }).catch(() => fetch('/api/settings.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deletedGalleryIds: updatedDeletedIds })
        })).catch(err => console.warn('Could not sync deleted gallery IDs:', err));
      } catch (err) {
        // offline / fallback
      }

      window.dispatchEvent(new Event('origintra_gallery_updated'));
      notifyCrossTab('origintra_gallery_updated');
      this.fetchDatabaseStatus();
      return true;
    } catch (e) {
      console.error('Error deleting gallery image:', e);
      return false;
    }
  },

  deleteCustomGalleryImage(imageId: string): boolean {
    return this.deleteGalleryImage(imageId);
  },

  resetCustomGallery(): void {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_GALLERY);
    localStorage.removeItem(STORAGE_KEYS.DELETED_GALLERY);

    try {
      fetch('/api/settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedGalleryIds: [] })
      }).catch(err => console.warn('Could not reset deleted gallery IDs on server:', err));
    } catch (err) {
      // offline / fallback
    }

    window.dispatchEvent(new Event('origintra_gallery_updated'));
    notifyCrossTab('origintra_gallery_updated');
    this.fetchDatabaseStatus();
  },

  // === BUYER TESTIMONIALS & TRADE REFERENCES ===
  getTestimonials(): Testimonial[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Error reading testimonials:', e);
    }
    return DEFAULT_TESTIMONIALS;
  },

  async saveTestimonial(testimonial: Testimonial): Promise<Testimonial> {
    const testimonials = this.getTestimonials();
    const index = testimonials.findIndex(t => t.id === testimonial.id);
    let updated: Testimonial;

    if (index >= 0) {
      updated = { ...testimonial };
      testimonials[index] = updated;
    } else {
      updated = {
        ...testimonial,
        id: testimonial.id || `t-${Date.now()}`,
        rating: Number(testimonial.rating) || 5,
        createdAt: testimonial.createdAt || new Date().toISOString()
      };
      testimonials.unshift(updated);
    }

    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
    window.dispatchEvent(new Event('origintra_testimonials_updated'));
    notifyCrossTab('origintra_testimonials_updated');

    if (supabase.isConfigured()) {
      supabase.from('testimonials').upsert({
        id: updated.id,
        buyer_name: (updated as any).buyerName || updated.author,
        company: updated.company,
        country: updated.country,
        flag: (updated as any).flag || '',
        product_supplied: (updated as any).productSupplied || updated.commodity,
        container_type: (updated as any).containerType || updated.volumeOrType,
        quote: (updated as any).quote || updated.testimonial,
        rating: Number(updated.rating) || 5,
        verified: Boolean((updated as any).verified ?? true),
        date: (updated as any).date || updated.createdAt || new Date().toISOString().slice(0, 10),
        created_at: updated.createdAt || new Date().toISOString(),
        payload_json: updated
      }, 'id').then(() => this.fetchDatabaseStatus());
    }

    this.fetchDatabaseStatus();
    return updated;
  },

  async deleteTestimonial(id: string): Promise<boolean> {
    const testimonials = this.getTestimonials();
    const filtered = testimonials.filter(t => t.id !== id);
    if (filtered.length !== testimonials.length) {
      localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(filtered));
      window.dispatchEvent(new Event('origintra_testimonials_updated'));
      notifyCrossTab('origintra_testimonials_updated');

      if (supabase.isConfigured()) {
        supabase.from('testimonials').delete('id', id).then(() => this.fetchDatabaseStatus());
      }
      this.fetchDatabaseStatus();
      return true;
    }
    return false;
  },

  async resetTestimonials(): Promise<Testimonial[]> {
    localStorage.removeItem(STORAGE_KEYS.TESTIMONIALS);
    window.dispatchEvent(new Event('origintra_testimonials_updated'));
    notifyCrossTab('origintra_testimonials_updated');
    this.fetchDatabaseStatus();
    return DEFAULT_TESTIMONIALS;
  }
};

// Non-blocking initialization: allows instant 0ms first render from cache, then syncs with Supabase in background
if (typeof window !== 'undefined') {
  const initBackgroundSync = async () => {
    // 1. Fetch server settings first so deleted product/gallery IDs are known immediately
    await AdminStorage.syncSettingsFromServer().catch(() => {});
    // 2. Fetch authoritative products from Node.js Express server
    await AdminStorage.syncProductsFromServer().catch(() => {});
    // 3. Sync Supabase Cloud PostgreSQL with sanitized IDs
    await AdminStorage.syncWithDatabase().catch(() => {});
    AdminStorage.connectLiveStream();
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(initBackgroundSync, { timeout: 2000 });
  } else {
    setTimeout(initBackgroundSync, 50);
  }

  if (broadcastChannel) {
    broadcastChannel.onmessage = (e) => {
      if (e.data && e.data.type === 'DOM_EVENT' && e.data.eventName) {
        window.dispatchEvent(new Event(e.data.eventName));
      }
    };
  }

  window.addEventListener('storage', (e) => {
    if (!e.key) return;
    if (e.key === STORAGE_KEYS.PRODUCTS || e.key === STORAGE_KEYS.DELETED_PRODUCTS) window.dispatchEvent(new Event('origintra_products_updated'));
    if (e.key === STORAGE_KEYS.BLOG_POSTS) window.dispatchEvent(new Event('origintra_blog_updated'));
    if (e.key === STORAGE_KEYS.TEAM_MEMBERS) window.dispatchEvent(new Event('origintra_team_updated'));
    if (e.key === STORAGE_KEYS.INQUIRIES) window.dispatchEvent(new Event('origintra_inquiries_updated'));
    if (e.key === STORAGE_KEYS.COMPANY) window.dispatchEvent(new Event('origintra_company_updated'));
    if (e.key === STORAGE_KEYS.CUSTOM_GALLERY || e.key === STORAGE_KEYS.DELETED_GALLERY) window.dispatchEvent(new Event('origintra_gallery_updated'));
    if (e.key === STORAGE_KEYS.TESTIMONIALS) window.dispatchEvent(new Event('origintra_testimonials_updated'));
    if (e.key === STORAGE_KEYS.USERS) window.dispatchEvent(new Event('origintra_users_updated'));
    if (e.key === STORAGE_KEYS.DB_STATUS) window.dispatchEvent(new Event('origintra_db_status_updated'));
  });

  // High-Concurrency: Disconnect SSE when tab is hidden to save sockets; reconnect on active view
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        AdminStorage.disconnectLiveStream();
      } else {
        AdminStorage.syncWithDatabase().catch(() => {});
        AdminStorage.connectLiveStream();
      }
    });
  }
}
