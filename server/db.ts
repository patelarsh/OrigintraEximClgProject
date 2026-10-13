import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { PRODUCTS as DEFAULT_PRODUCTS } from '../src/data/products';
import { BLOG_POSTS as DEFAULT_BLOG_POSTS } from '../src/data/blog';
import { TEAM_MEMBERS as DEFAULT_TEAM_MEMBERS } from '../src/data/team';
import { COMPANY_CONFIG as DEFAULT_COMPANY_CONFIG } from '../src/data/company';
import { TESTIMONIALS as DEFAULT_TESTIMONIALS } from '../src/data/testimonials';

const require = createRequire(import.meta.url);

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'author' | 'sales';
  avatar?: string;
  department?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuditLogRecord {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
}

export interface DbChangeEvent {
  type: 'db_updated';
  entity: 'products' | 'blog' | 'team' | 'inquiries' | 'company' | 'gallery' | 'testimonials' | 'users' | 'all';
  action: string;
  entityId?: string;
  timestamp: string;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const SQLITE_FILE = path.resolve(DB_DIR, 'origintra.sqlite');
const LEGACY_JSON_FILE = path.resolve(DB_DIR, 'database.json');

// Default initial inquiries
const INITIAL_INQUIRIES = [
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

// Default initial users
const INITIAL_USERS: UserRecord[] = [
  {
    id: 'usr-admin-01',
    name: 'Rajesh Sharma',
    email: 'admin@origintra.com',
    password: 'admin',
    role: 'admin',
    avatar: '/assets/team/director.jpg',
    department: 'Managing Director & Global Trade Head',
    createdAt: '2026-01-15T08:30:00.000Z',
    lastLogin: '2026-10-05T07:15:00.000Z'
  },
  {
    id: 'usr-1791183682976',
    name: 'Patel Arsh',
    email: 'arsh@origintra.com',
    password: 'Arsh@2410',
    role: 'admin',
    avatar: '/assets/team/director.jpg',
    department: 'Corporate Admin & Global Trading Desk',
    createdAt: '2026-10-05T06:58:00.000Z',
    lastLogin: '2026-10-11T09:00:00.000Z'
  },
  {
    id: 'usr-editor-02',
    name: 'Priya Sundaram',
    email: 'editor@origintra.com',
    password: 'editor123',
    role: 'editor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    department: 'Content Director & Quality Assurance',
    createdAt: '2026-02-10T10:00:00.000Z',
    lastLogin: '2026-10-04T14:20:00.000Z'
  },
  {
    id: 'usr-author-03',
    name: 'Vikram Malhotra',
    email: 'author@origintra.com',
    password: 'author123',
    role: 'author',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    department: 'Agri Commodity Market Intelligence',
    createdAt: '2026-02-28T12:00:00.000Z',
    lastLogin: '2026-10-05T09:15:00.000Z'
  },
  {
    id: 'usr-sales-04',
    name: 'David Sterling',
    email: 'sales@origintra.com',
    password: 'sales123',
    role: 'sales',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    department: 'Buyer Relations & Container Dispatch Desk',
    createdAt: '2026-03-05T15:30:00.000Z',
    lastLogin: '2026-10-05T11:00:00.000Z'
  }
];

function cleanSlug(text: string): string {
  return (text || 'article')
    .toLowerCase()
    .trim()
    .replace(/&/g, '-and-')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `item-${Date.now()}`;
}

class SQLiteDatabaseEngine {
  private sqlite: any = null;
  private listeners: Set<(event: DbChangeEvent) => void> = new Set();

  constructor() {
    this.init();
  }

  public onDatabaseChange(listener: (event: DbChangeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitChange(
    entity: DbChangeEvent['entity'],
    action: string,
    entityId?: string,
    summary?: string
  ) {
    const timestamp = new Date().toISOString();
    try {
      this.ensureOpen();
      this.sqlite
        .prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
        .run('updated_at', timestamp);

      if (summary) {
        this.sqlite
          .prepare('INSERT INTO audit_logs (action, entity_type, entity_id, summary, created_at) VALUES (?, ?, ?, ?, ?)')
          .run(action, entity, entityId || '', summary, timestamp);
      }
    } catch (err) {
      console.error('[SQLite] Error writing audit/meta:', err);
    }

    const event: DbChangeEvent = {
      type: 'db_updated',
      entity,
      action,
      entityId,
      timestamp
    };

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (e) {
        console.error('[SQLite] Listener error:', e);
      }
    }
  }

  private ensureOpen() {
    if (this.sqlite) return this.sqlite;

    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    const { DatabaseSync } = require('node:sqlite');
    this.sqlite = new DatabaseSync(SQLITE_FILE);

    // Enable WAL mode for high concurrency and crash resilience
    this.sqlite.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA foreign_keys = ON;
      PRAGMA busy_timeout = 5000;
    `);

    this.createSchema();
    this.seedOrMigrateIfNeeded();

    return this.sqlite;
  }

  private init() {
    try {
      this.ensureOpen();
      console.log('[SQLite DB] Connected to relational SQLite database:', SQLITE_FILE);
    } catch (err) {
      console.error('[SQLite DB] Initialization error:', err);
    }
  }

  private createSchema() {
    this.sqlite.exec(`
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        avatar TEXT,
        department TEXT,
        created_at TEXT NOT NULL,
        last_login TEXT
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        hsn_code TEXT,
        short_description TEXT,
        image TEXT,
        origin TEXT,
        sort_order INTEGER DEFAULT 0,
        payload_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

      CREATE TABLE IF NOT EXISTS blog_posts (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT,
        author TEXT,
        date TEXT,
        featured INTEGER DEFAULT 0,
        image TEXT,
        sort_order INTEGER DEFAULT 0,
        payload_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);

      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        department TEXT,
        email TEXT,
        phone TEXT,
        photo TEXT,
        sort_order INTEGER DEFAULT 0,
        payload_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS inquiries (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        company_name TEXT,
        business_email TEXT NOT NULL,
        country TEXT,
        phone_whatsapp TEXT,
        product TEXT,
        product_form TEXT,
        quantity_required TEXT,
        packaging_requirement TEXT,
        destination_port TEXT,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        source TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
      CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at);

      CREATE TABLE IF NOT EXISTS company_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        name TEXT,
        legal_name TEXT,
        tagline TEXT,
        primary_email TEXT,
        export_email TEXT,
        phone TEXT,
        phone_display TEXT,
        whatsapp_number TEXT,
        whatsapp_display TEXT,
        whatsapp_url TEXT,
        payload_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS custom_gallery (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        tag TEXT,
        is_uploaded INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS testimonials (
        id TEXT PRIMARY KEY,
        buyer_name TEXT NOT NULL,
        company TEXT,
        country TEXT NOT NULL,
        flag TEXT,
        product_supplied TEXT,
        container_type TEXT,
        quote TEXT NOT NULL,
        rating INTEGER NOT NULL DEFAULT 5,
        verified INTEGER DEFAULT 1,
        date TEXT,
        created_at TEXT NOT NULL,
        payload_json TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        summary TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
  }

  private seedOrMigrateIfNeeded() {
    const row = this.sqlite.prepare('SELECT value FROM meta WHERE key = ?').get('seeded');
    if (row && row.value === 'true') {
      return;
    }

    let seedSource = 'defaults';
    let usersToSeed: UserRecord[] = INITIAL_USERS;
    let productsToSeed: any[] = DEFAULT_PRODUCTS;
    let blogPostsToSeed: any[] = DEFAULT_BLOG_POSTS;
    let teamMembersToSeed: any[] = DEFAULT_TEAM_MEMBERS;
    let inquiriesToSeed: any[] = INITIAL_INQUIRIES;
    let companyConfigToSeed: any = DEFAULT_COMPANY_CONFIG;
    let galleryToSeed: any[] = [];
    let testimonialsToSeed: any[] = DEFAULT_TESTIMONIALS;

    if (fs.existsSync(LEGACY_JSON_FILE)) {
      try {
        const raw = fs.readFileSync(LEGACY_JSON_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        seedSource = 'database.json migration';
        if (Array.isArray(parsed.users) && parsed.users.length) usersToSeed = parsed.users;
        if (Array.isArray(parsed.products) && parsed.products.length) productsToSeed = parsed.products;
        if (Array.isArray(parsed.blogPosts) && parsed.blogPosts.length) blogPostsToSeed = parsed.blogPosts;
        if (Array.isArray(parsed.teamMembers) && parsed.teamMembers.length) teamMembersToSeed = parsed.teamMembers;
        if (Array.isArray(parsed.inquiries) && parsed.inquiries.length) inquiriesToSeed = parsed.inquiries;
        if (parsed.companyConfig && typeof parsed.companyConfig === 'object') companyConfigToSeed = parsed.companyConfig;
        if (Array.isArray(parsed.customGallery)) galleryToSeed = parsed.customGallery;
        if (Array.isArray(parsed.testimonials) && parsed.testimonials.length) testimonialsToSeed = parsed.testimonials;
        console.log('[SQLite DB] Migrating existing data from legacy database.json into SQLite relational tables...');
      } catch (err) {
        console.warn('[SQLite DB] Failed to read legacy database.json, seeding from defaults:', err);
      }
    }

    const now = new Date().toISOString();
    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      // 1. Seed Users
      const insertUser = this.sqlite.prepare(`
        INSERT OR REPLACE INTO users (id, name, email, password, role, avatar, department, created_at, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const u of usersToSeed) {
        insertUser.run(
          u.id || `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          u.name || 'User',
          (u.email || '').toLowerCase(),
          u.password || 'origintra123',
          u.role || 'editor',
          u.avatar || '/assets/team/director.jpg',
          u.department || 'Trade Operations',
          u.createdAt || now,
          u.lastLogin || null
        );
      }

      // 2. Seed Products
      const insertProduct = this.sqlite.prepare(`
        INSERT OR REPLACE INTO products (id, slug, name, category, hsn_code, short_description, image, origin, sort_order, payload_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      productsToSeed.forEach((p, idx) => {
        insertProduct.run(
          p.id,
          p.slug || cleanSlug(p.name),
          p.name,
          p.category || 'Whole Spices',
          p.hsnCode || '',
          p.shortDescription || '',
          p.image || '',
          p.origin || 'India',
          idx,
          JSON.stringify(p),
          now
        );
      });

      // 3. Seed Blog Posts
      const insertBlog = this.sqlite.prepare(`
        INSERT OR REPLACE INTO blog_posts (id, slug, title, category, author, date, featured, image, sort_order, payload_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      blogPostsToSeed.forEach((post, idx) => {
        if (!post.slug || post.slug.startsWith('new-article-')) {
          post.slug = cleanSlug(post.title);
        }
        insertBlog.run(
          post.id,
          post.slug,
          post.title || 'Untitled Article',
          post.category || 'Market Intelligence',
          post.author || 'Origintra Desk',
          post.date || now.slice(0, 10),
          post.featured ? 1 : 0,
          post.image || '',
          idx,
          JSON.stringify(post),
          now
        );
      });

      // 4. Seed Team Members
      const insertTeam = this.sqlite.prepare(`
        INSERT OR REPLACE INTO team_members (id, name, role, department, email, phone, photo, sort_order, payload_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      teamMembersToSeed.forEach((m, idx) => {
        insertTeam.run(
          m.id,
          m.name,
          m.role || '',
          m.department || '',
          m.email || '',
          m.phone || '',
          m.photo || '',
          idx,
          JSON.stringify(m),
          now
        );
      });

      // 5. Seed Inquiries
      const insertInquiry = this.sqlite.prepare(`
        INSERT OR REPLACE INTO inquiries (
          id, full_name, company_name, business_email, country, phone_whatsapp,
          product, product_form, quantity_required, packaging_requirement,
          destination_port, message, status, source, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const inq of inquiriesToSeed) {
        insertInquiry.run(
          inq.id || `inq-${Date.now()}`,
          inq.fullName || '',
          inq.companyName || '',
          inq.businessEmail || '',
          inq.country || '',
          inq.phoneWhatsApp || '',
          inq.product || '',
          inq.productForm || '',
          inq.quantityRequired || '',
          inq.packagingRequirement || '',
          inq.destinationPort || '',
          inq.message || '',
          inq.status || 'new',
          inq.source || 'quote_modal',
          inq.createdAt || now,
          now
        );
      }

      // 6. Seed Company Config
      this.sqlite.prepare(`
        INSERT OR REPLACE INTO company_config (
          id, name, legal_name, tagline, primary_email, export_email,
          phone, phone_display, whatsapp_number, whatsapp_display, whatsapp_url,
          payload_json, updated_at
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        companyConfigToSeed.name || DEFAULT_COMPANY_CONFIG.name || '',
        companyConfigToSeed.legalName || DEFAULT_COMPANY_CONFIG.legalName || '',
        companyConfigToSeed.tagline || DEFAULT_COMPANY_CONFIG.tagline || '',
        companyConfigToSeed.primaryEmail || DEFAULT_COMPANY_CONFIG.primaryEmail || '',
        companyConfigToSeed.supportEmail || companyConfigToSeed.exportEmail || DEFAULT_COMPANY_CONFIG.supportEmail || '',
        companyConfigToSeed.phone || DEFAULT_COMPANY_CONFIG.phone || '',
        companyConfigToSeed.phoneDisplay || DEFAULT_COMPANY_CONFIG.phoneDisplay || '',
        companyConfigToSeed.whatsapp || companyConfigToSeed.whatsappNumber || DEFAULT_COMPANY_CONFIG.whatsapp || '',
        companyConfigToSeed.whatsappDisplay || DEFAULT_COMPANY_CONFIG.whatsappDisplay || '',
        companyConfigToSeed.whatsappUrl || DEFAULT_COMPANY_CONFIG.whatsappUrl || '',
        JSON.stringify(companyConfigToSeed),
        now
      );

      // 7. Seed Custom Gallery
      const insertGallery = this.sqlite.prepare(`
        INSERT OR REPLACE INTO custom_gallery (id, url, title, category, description, tag, is_uploaded, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const img of galleryToSeed) {
        insertGallery.run(
          img.id || `upload-${Date.now()}`,
          img.url || '',
          img.title || 'Uploaded Image',
          img.category || 'uploads',
          img.description || '',
          img.tag || 'Upload',
          img.isUploaded === false ? 0 : 1,
          img.createdAt || now
        );
      }

      // 8. Seed Testimonials
      const insertTestimonial = this.sqlite.prepare(`
        INSERT OR REPLACE INTO testimonials (
          id, buyer_name, company, country, flag, product_supplied,
          container_type, quote, rating, verified, date, created_at, payload_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of testimonialsToSeed) {
        insertTestimonial.run(
          t.id || `t-${Date.now()}`,
          t.author || t.buyerName || '',
          t.company || '',
          t.country || '',
          t.flag || '🌐',
          t.commodity || t.productSupplied || '',
          t.volumeOrType || t.containerType || '',
          t.testimonial || t.quote || '',
          Number(t.rating) || 5,
          t.verified === false ? 0 : 1,
          t.date || '',
          t.createdAt || now,
          JSON.stringify(t)
        );
      }

      // 9. Mark Meta
      this.sqlite.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run('seeded', 'true');
      this.sqlite.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run('version', '2.0-sqlite');
      this.sqlite.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run('updated_at', now);

      // 10. Audit Log
      this.sqlite
        .prepare('INSERT INTO audit_logs (action, entity_type, entity_id, summary, created_at) VALUES (?, ?, ?, ?, ?)')
        .run('INIT_DB', 'all', 'origintra.sqlite', `Initialized SQLite relational database (${seedSource})`, now);

      this.sqlite.exec('COMMIT');
      console.log(`[SQLite DB] Successfully seeded relational tables (${seedSource})`);
    } catch (err) {
      this.sqlite.exec('ROLLBACK');
      console.error('[SQLite DB] Seed transaction failed:', err);
      throw err;
    }
  }

  // === DATABASE DIAGNOSTICS & STATUS ===
  public getDatabaseStatus() {
    this.ensureOpen();
    const count = (table: string): number => {
      const row = this.sqlite.prepare(`SELECT COUNT(*) as cnt FROM ${table}`).get();
      return row ? Number(row.cnt) : 0;
    };

    const updatedAtRow = this.sqlite.prepare('SELECT value FROM meta WHERE key = ?').get('updated_at');
    const recentLogs = this.sqlite
      .prepare('SELECT id, action, entity_type as entityType, entity_id as entityId, summary, created_at as createdAt FROM audit_logs ORDER BY id DESC LIMIT 20')
      .all();

    let fileSizeBytes = 0;
    try {
      if (fs.existsSync(SQLITE_FILE)) {
        fileSizeBytes = fs.statSync(SQLITE_FILE).size;
      }
    } catch {
      // ignore
    }

    return {
      connected: true,
      engine: 'SQLite 3 Relational Engine (WAL Mode)',
      databaseFile: 'data/origintra.sqlite',
      fileSizeKB: Math.round((fileSizeBytes / 1024) * 10) / 10,
      updatedAt: updatedAtRow ? updatedAtRow.value : new Date().toISOString(),
      tables: {
        users: count('users'),
        products: count('products'),
        blog_posts: count('blog_posts'),
        team_members: count('team_members'),
        inquiries: count('inquiries'),
        custom_gallery: count('custom_gallery'),
        testimonials: count('testimonials'),
        audit_logs: count('audit_logs')
      },
      recentAuditLogs: recentLogs
    };
  }

  // === BOOTSTRAP / ALL DATA ===
  public getAllData() {
    this.ensureOpen();
    const updatedAtRow = this.sqlite.prepare('SELECT value FROM meta WHERE key = ?').get('updated_at');

    return {
      version: '2.0-sqlite',
      engine: 'SQLite 3 (WAL)',
      updatedAt: updatedAtRow ? updatedAtRow.value : new Date().toISOString(),
      users: this.getUsers(),
      products: this.getProducts(),
      blogPosts: this.getBlogPosts(),
      teamMembers: this.getTeamMembers(),
      inquiries: this.getInquiries(),
      companyConfig: this.getCompanyConfig(),
      customGallery: this.getCustomGallery(),
      testimonials: this.getTestimonials()
    };
  }

  // === FILE / IMAGE UPLOAD HELPER ===
  public saveBase64ToFile(dataUrl: string, prefix = 'upload'): string {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      return dataUrl;
    }
    try {
      const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!match) return dataUrl;
      let ext = match[1].toLowerCase();
      if (ext === 'jpeg') ext = 'jpg';
      if (ext.includes('svg')) ext = 'svg';
      if (ext.includes('png')) ext = 'png';
      if (ext.includes('webp')) ext = 'webp';

      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, Buffer.from(match[2], 'base64'));
      return `/uploads/${filename}`;
    } catch (e) {
      console.error('[SQLite DB] Failed to save base64 image to file:', e);
      return dataUrl;
    }
  }

  // === AUTHENTICATION & USERS ===
  private getAllUsersWithPasswords(): UserRecord[] {
    this.ensureOpen();
    const rows = this.sqlite.prepare(`
      SELECT id, name, email, password, role, avatar, department, created_at as createdAt, last_login as lastLogin
      FROM users
      ORDER BY created_at ASC
    `).all();
    return rows.map((r: any) => ({ ...r }));
  }

  public authenticate(identifier: string, password: string): { token: string; user: Omit<UserRecord, 'password'> } | null {
    const users = this.getAllUsersWithPasswords();
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    let user = users.find(u => u.email.toLowerCase() === cleanId);

    if (!user && cleanId) {
      user = users.find(u => u.email.split('@')[0].toLowerCase() === cleanId);
    }

    if (!user && cleanId) {
      user = users.find(u => {
        const nameLower = u.name.toLowerCase();
        return nameLower === cleanId || nameLower.includes(cleanId);
      });
    }

    const isAdminKeyword = !cleanId || ['admin', 'administrator', 'root', 'superadmin', 'admin@origintra.com', 'origintra'].includes(cleanId);
    if (!user && isAdminKeyword) {
      user = users.find(u => u.role === 'admin' && (u.email.toLowerCase().includes('arsh') || u.name.toLowerCase().includes('arsh')))
          || users.find(u => u.role === 'admin')
          || users[0];
    }

    if (!user) return null;

    const isExactPassword = user.password === cleanPass;

    if (isExactPassword) {
      const now = new Date().toISOString();
      this.sqlite.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(now, user.id);
      user.lastLogin = now;
      const token = `origintra-sess-${user.id}-${Date.now()}`;
      const { password: _, ...safeUser } = user;
      return { token, user: safeUser };
    }

    return null;
  }

  public getUsers(): Omit<UserRecord, 'password'>[] {
    return this.getAllUsersWithPasswords().map(({ password, ...u }) => u);
  }

  public createUser(userData: {
    name: string;
    email: string;
    password?: string;
    role: 'admin' | 'editor' | 'author' | 'sales';
    department?: string;
    avatar?: string;
  }): Omit<UserRecord, 'password'> {
    this.ensureOpen();
    const cleanEmail = userData.email.trim().toLowerCase();
    const existing = this.sqlite.prepare('SELECT id FROM users WHERE lower(email) = ?').get(cleanEmail);
    if (existing) {
      throw new Error(`A user with email "${cleanEmail}" already exists.`);
    }

    const cleanAvatar = userData.avatar
      ? this.saveBase64ToFile(userData.avatar, 'avatar')
      : (userData.role === 'admin' ? '/assets/team/director.jpg' : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80');

    const newUser: UserRecord = {
      id: `usr-${Date.now()}`,
      name: userData.name.trim(),
      email: cleanEmail,
      password: (userData.password && userData.password.trim()) || 'origintra123',
      role: userData.role,
      department: userData.department || 'Trade Operations',
      avatar: cleanAvatar,
      createdAt: new Date().toISOString()
    };

    this.sqlite.prepare(`
      INSERT INTO users (id, name, email, password, role, avatar, department, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newUser.id,
      newUser.name,
      newUser.email,
      newUser.password,
      newUser.role,
      newUser.avatar,
      newUser.department,
      newUser.createdAt
    );

    this.emitChange('users', 'CREATE_USER', newUser.id, `Created user ${newUser.name} (${newUser.role})`);
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  }

  public updateUser(id: string, updates: Partial<UserRecord>): Omit<UserRecord, 'password'> | null {
    this.ensureOpen();
    const existing = this.sqlite.prepare(`
      SELECT id, name, email, password, role, avatar, department, created_at as createdAt, last_login as lastLogin
      FROM users WHERE id = ?
    `).get(id) as UserRecord | undefined;

    if (!existing) return null;

    const updated: UserRecord = {
      ...existing,
      name: updates.name !== undefined ? updates.name.trim() : existing.name,
      email: updates.email !== undefined ? updates.email.trim().toLowerCase() : existing.email,
      role: updates.role !== undefined ? updates.role : existing.role,
      department: updates.department !== undefined ? updates.department : existing.department,
      avatar: updates.avatar !== undefined ? this.saveBase64ToFile(updates.avatar, 'avatar') : existing.avatar,
      password: updates.password && updates.password.trim() ? updates.password.trim() : existing.password
    };

    this.sqlite.prepare(`
      UPDATE users
      SET name = ?, email = ?, password = ?, role = ?, avatar = ?, department = ?
      WHERE id = ?
    `).run(
      updated.name,
      updated.email,
      updated.password,
      updated.role,
      updated.avatar,
      updated.department,
      id
    );

    this.emitChange('users', 'UPDATE_USER', id, `Updated user ${updated.name}`);
    const { password: _, ...safeUser } = updated;
    return safeUser;
  }

  public deleteUser(id: string): boolean {
    this.ensureOpen();
    const userToDelete = this.sqlite.prepare('SELECT id, name, role FROM users WHERE id = ?').get(id) as any;
    if (!userToDelete) return false;

    if (userToDelete.role === 'admin') {
      const adminCountRow = this.sqlite.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'").get() as any;
      if (Number(adminCountRow?.cnt || 0) <= 1) {
        throw new Error('Cannot delete the only remaining Administrator account.');
      }
    }

    this.sqlite.prepare('DELETE FROM users WHERE id = ?').run(id);
    this.emitChange('users', 'DELETE_USER', id, `Deleted user ${userToDelete.name}`);
    return true;
  }

  // === PRODUCTS ===
  public getProducts(): any[] {
    this.ensureOpen();
    const rows = this.sqlite.prepare('SELECT payload_json FROM products ORDER BY sort_order ASC, updated_at DESC').all();
    return rows.map((r: any) => JSON.parse(r.payload_json));
  }

  public saveProduct(product: any) {
    this.ensureOpen();
    if (product.image) {
      product.image = this.saveBase64ToFile(product.image, 'product');
    }
    if (!product.id) {
      product.id = `prod-${Date.now()}`;
    }
    if (!product.slug) {
      product.slug = cleanSlug(product.name);
    }

    const existing = this.sqlite.prepare('SELECT sort_order FROM products WHERE id = ?').get(product.id) as any;
    const sortOrder = existing ? existing.sort_order : -1;
    const now = new Date().toISOString();

    this.sqlite.prepare(`
      INSERT INTO products (id, slug, name, category, hsn_code, short_description, image, origin, sort_order, payload_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        slug = excluded.slug,
        name = excluded.name,
        category = excluded.category,
        hsn_code = excluded.hsn_code,
        short_description = excluded.short_description,
        image = excluded.image,
        origin = excluded.origin,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `).run(
      product.id,
      product.slug,
      product.name || 'Unnamed Product',
      product.category || 'Whole Spices',
      product.hsnCode || '',
      product.shortDescription || '',
      product.image || '',
      product.origin || 'India',
      sortOrder,
      JSON.stringify(product),
      now
    );

    this.emitChange('products', existing ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT', product.id, `Saved product "${product.name}"`);
    return product;
  }

  public deleteProduct(idOrSlug: string): boolean {
    this.ensureOpen();
    const existing = this.sqlite.prepare('SELECT id, name FROM products WHERE id = ? OR slug = ?').get(idOrSlug, idOrSlug) as any;
    if (!existing) return false;

    this.sqlite.prepare('DELETE FROM products WHERE id = ?').run(existing.id);
    this.emitChange('products', 'DELETE_PRODUCT', existing.id, `Deleted product "${existing.name}"`);
    return true;
  }

  public resetProducts() {
    this.ensureOpen();
    const now = new Date().toISOString();
    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      this.sqlite.exec('DELETE FROM products');
      const insertProduct = this.sqlite.prepare(`
        INSERT INTO products (id, slug, name, category, hsn_code, short_description, image, origin, sort_order, payload_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      DEFAULT_PRODUCTS.forEach((p, idx) => {
        insertProduct.run(
          p.id,
          p.slug || cleanSlug(p.name),
          p.name,
          p.category || 'Whole Spices',
          p.hsnCode || '',
          p.shortDescription || '',
          p.image || '',
          p.origin || 'India',
          idx,
          JSON.stringify(p),
          now
        );
      });
      this.sqlite.exec('COMMIT');
    } catch (e) {
      this.sqlite.exec('ROLLBACK');
      throw e;
    }

    this.emitChange('products', 'RESET_PRODUCTS', 'all', 'Reset products catalog to factory defaults');
    return this.getProducts();
  }

  // === BLOG POSTS ===
  public getBlogPosts(): any[] {
    this.ensureOpen();
    const rows = this.sqlite.prepare('SELECT payload_json FROM blog_posts ORDER BY sort_order ASC, updated_at DESC').all();
    return rows.map((r: any) => JSON.parse(r.payload_json));
  }

  public saveBlogPost(post: any) {
    this.ensureOpen();
    if (post.image) {
      post.image = this.saveBase64ToFile(post.image, 'blog');
    }
    if (!post.id) {
      post.id = `blog-${Date.now()}`;
    }
    if (!post.slug || post.slug.startsWith('new-article-')) {
      post.slug = cleanSlug(post.title);
    }

    const existing = this.sqlite.prepare('SELECT sort_order FROM blog_posts WHERE id = ?').get(post.id) as any;
    const sortOrder = existing ? existing.sort_order : -1;
    const now = new Date().toISOString();

    this.sqlite.prepare(`
      INSERT INTO blog_posts (id, slug, title, category, author, date, featured, image, sort_order, payload_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        slug = excluded.slug,
        title = excluded.title,
        category = excluded.category,
        author = excluded.author,
        date = excluded.date,
        featured = excluded.featured,
        image = excluded.image,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `).run(
      post.id,
      post.slug,
      post.title || 'Untitled Article',
      post.category || 'Market Intelligence',
      post.author || 'Origintra Desk',
      post.date || now.slice(0, 10),
      post.featured ? 1 : 0,
      post.image || '',
      sortOrder,
      JSON.stringify(post),
      now
    );

    this.emitChange('blog', existing ? 'UPDATE_BLOG' : 'CREATE_BLOG', post.id, `Saved blog post "${post.title}"`);
    return post;
  }

  public deleteBlogPost(idOrSlug: string): boolean {
    this.ensureOpen();
    const existing = this.sqlite.prepare('SELECT id, title FROM blog_posts WHERE id = ? OR slug = ?').get(idOrSlug, idOrSlug) as any;
    if (!existing) return false;

    this.sqlite.prepare('DELETE FROM blog_posts WHERE id = ?').run(existing.id);
    this.emitChange('blog', 'DELETE_BLOG', existing.id, `Deleted blog post "${existing.title}"`);
    return true;
  }

  public resetBlogPosts() {
    this.ensureOpen();
    const now = new Date().toISOString();
    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      this.sqlite.exec('DELETE FROM blog_posts');
      const insertBlog = this.sqlite.prepare(`
        INSERT INTO blog_posts (id, slug, title, category, author, date, featured, image, sort_order, payload_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      DEFAULT_BLOG_POSTS.forEach((post, idx) => {
        insertBlog.run(
          post.id,
          post.slug || cleanSlug(post.title),
          post.title,
          post.category || 'Market Intelligence',
          post.author || 'Origintra Desk',
          post.date || now.slice(0, 10),
          post.featured ? 1 : 0,
          post.image || '',
          idx,
          JSON.stringify(post),
          now
        );
      });
      this.sqlite.exec('COMMIT');
    } catch (e) {
      this.sqlite.exec('ROLLBACK');
      throw e;
    }

    this.emitChange('blog', 'RESET_BLOG', 'all', 'Reset blog articles to factory defaults');
    return this.getBlogPosts();
  }

  // === TEAM MEMBERS ===
  public getTeamMembers(): any[] {
    this.ensureOpen();
    const rows = this.sqlite.prepare('SELECT payload_json FROM team_members ORDER BY sort_order ASC, updated_at ASC').all();
    return rows.map((r: any) => JSON.parse(r.payload_json));
  }

  public saveTeamMember(member: any) {
    this.ensureOpen();
    if (member.photo) {
      member.photo = this.saveBase64ToFile(member.photo, 'team');
    }
    if (!member.id) {
      member.id = `team-${Date.now()}`;
    }

    const existing = this.sqlite.prepare('SELECT sort_order FROM team_members WHERE id = ?').get(member.id) as any;
    let sortOrder = existing ? existing.sort_order : 999;
    if (!existing) {
      const maxRow = this.sqlite.prepare('SELECT COALESCE(MAX(sort_order), 0) + 1 as nextOrder FROM team_members').get() as any;
      sortOrder = Number(maxRow?.nextOrder || 1);
    }
    const now = new Date().toISOString();

    this.sqlite.prepare(`
      INSERT INTO team_members (id, name, role, department, email, phone, photo, sort_order, payload_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        role = excluded.role,
        department = excluded.department,
        email = excluded.email,
        phone = excluded.phone,
        photo = excluded.photo,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `).run(
      member.id,
      member.name || 'Team Member',
      member.role || '',
      member.department || '',
      member.email || '',
      member.phone || '',
      member.photo || '',
      sortOrder,
      JSON.stringify(member),
      now
    );

    this.emitChange('team', existing ? 'UPDATE_TEAM' : 'CREATE_TEAM', member.id, `Saved team member "${member.name}"`);
    return member;
  }

  public deleteTeamMember(id: string): boolean {
    this.ensureOpen();
    const existing = this.sqlite.prepare('SELECT id, name FROM team_members WHERE id = ?').get(id) as any;
    if (!existing) return false;

    this.sqlite.prepare('DELETE FROM team_members WHERE id = ?').run(id);
    this.emitChange('team', 'DELETE_TEAM', id, `Deleted team member "${existing.name}"`);
    return true;
  }

  public resetTeamMembers() {
    this.ensureOpen();
    const now = new Date().toISOString();
    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      this.sqlite.exec('DELETE FROM team_members');
      const insertTeam = this.sqlite.prepare(`
        INSERT INTO team_members (id, name, role, department, email, phone, photo, sort_order, payload_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      DEFAULT_TEAM_MEMBERS.forEach((m, idx) => {
        insertTeam.run(
          m.id,
          m.name,
          m.role || '',
          m.department || '',
          m.email || '',
          m.phone || '',
          m.photo || '',
          idx,
          JSON.stringify(m),
          now
        );
      });
      this.sqlite.exec('COMMIT');
    } catch (e) {
      this.sqlite.exec('ROLLBACK');
      throw e;
    }

    this.emitChange('team', 'RESET_TEAM', 'all', 'Reset leadership team to factory defaults');
    return this.getTeamMembers();
  }

  // === INQUIRIES ===
  public getInquiries(): any[] {
    this.ensureOpen();
    const rows = this.sqlite.prepare(`
      SELECT
        id,
        full_name as fullName,
        company_name as companyName,
        business_email as businessEmail,
        country,
        phone_whatsapp as phoneWhatsApp,
        product,
        product_form as productForm,
        quantity_required as quantityRequired,
        packaging_requirement as packagingRequirement,
        destination_port as destinationPort,
        message,
        status,
        source,
        created_at as createdAt
      FROM inquiries
      ORDER BY created_at DESC
    `).all();
    return rows.map((r: any) => ({ ...r }));
  }

  public addInquiry(inquiry: any) {
    this.ensureOpen();
    const now = new Date().toISOString();
    const newInq = {
      ...inquiry,
      id: inquiry.id || `inq-${Date.now()}`,
      createdAt: inquiry.createdAt || now,
      status: inquiry.status || 'new',
      source: inquiry.source || 'quote_modal'
    };

    this.sqlite.prepare(`
      INSERT INTO inquiries (
        id, full_name, company_name, business_email, country, phone_whatsapp,
        product, product_form, quantity_required, packaging_requirement,
        destination_port, message, status, source, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newInq.id,
      newInq.fullName || '',
      newInq.companyName || '',
      newInq.businessEmail || '',
      newInq.country || '',
      newInq.phoneWhatsApp || '',
      newInq.product || '',
      newInq.productForm || '',
      newInq.quantityRequired || '',
      newInq.packagingRequirement || '',
      newInq.destinationPort || '',
      newInq.message || '',
      newInq.status,
      newInq.source,
      newInq.createdAt,
      now
    );

    this.emitChange('inquiries', 'CREATE_INQUIRY', newInq.id, `New trade inquiry from ${newInq.fullName} (${newInq.country})`);
    return newInq;
  }

  public updateInquiryStatus(id: string, status: string): boolean {
    this.ensureOpen();
    const existing = this.sqlite.prepare('SELECT id, full_name FROM inquiries WHERE id = ?').get(id) as any;
    if (!existing) return false;

    const now = new Date().toISOString();
    this.sqlite.prepare('UPDATE inquiries SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id);
    this.emitChange('inquiries', 'UPDATE_INQUIRY_STATUS', id, `Updated inquiry ${id} status to "${status}"`);
    return true;
  }

  public deleteInquiry(id: string): boolean {
    this.ensureOpen();
    const existing = this.sqlite.prepare('SELECT id, full_name FROM inquiries WHERE id = ?').get(id) as any;
    if (!existing) return false;

    this.sqlite.prepare('DELETE FROM inquiries WHERE id = ?').run(id);
    this.emitChange('inquiries', 'DELETE_INQUIRY', id, `Deleted inquiry from ${existing.full_name}`);
    return true;
  }

  // === COMPANY CONFIG ===
  public getCompanyConfig(): any {
    this.ensureOpen();
    const row = this.sqlite.prepare('SELECT payload_json FROM company_config WHERE id = 1').get() as any;
    if (row && row.payload_json) {
      try {
        return JSON.parse(row.payload_json);
      } catch {
        // fallback
      }
    }
    return DEFAULT_COMPANY_CONFIG;
  }

  public saveCompanyConfig(config: any) {
    this.ensureOpen();
    const now = new Date().toISOString();
    const merged = { ...DEFAULT_COMPANY_CONFIG, ...config };

    this.sqlite.prepare(`
      INSERT INTO company_config (
        id, name, legal_name, tagline, primary_email, export_email,
        phone, phone_display, whatsapp_number, whatsapp_display, whatsapp_url,
        payload_json, updated_at
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        legal_name = excluded.legal_name,
        tagline = excluded.tagline,
        primary_email = excluded.primary_email,
        export_email = excluded.export_email,
        phone = excluded.phone,
        phone_display = excluded.phone_display,
        whatsapp_number = excluded.whatsapp_number,
        whatsapp_display = excluded.whatsapp_display,
        whatsapp_url = excluded.whatsapp_url,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at
    `).run(
      merged.name || '',
      merged.legalName || '',
      merged.tagline || '',
      merged.primaryEmail || '',
      merged.supportEmail || merged.exportEmail || '',
      merged.phone || '',
      merged.phoneDisplay || '',
      merged.whatsapp || merged.whatsappNumber || '',
      merged.whatsappDisplay || '',
      merged.whatsappUrl || '',
      JSON.stringify(merged),
      now
    );

    this.emitChange('company', 'UPDATE_COMPANY_CONFIG', '1', `Updated corporate profile & contact settings`);
    return merged;
  }

  // === CUSTOM GALLERY ===
  public getCustomGallery(): any[] {
    this.ensureOpen();
    const rows = this.sqlite.prepare(`
      SELECT id, url, title, category, description, tag, is_uploaded as isUploaded, created_at as createdAt
      FROM custom_gallery
      ORDER BY created_at DESC
    `).all();
    return rows.map((r: any) => ({
      ...r,
      isUploaded: Boolean(r.isUploaded)
    }));
  }

  public addCustomGallery(image: any) {
    this.ensureOpen();
    const cleanUrl = this.saveBase64ToFile(image.url, 'gallery');
    const now = new Date().toISOString();
    const newImg = {
      id: image.id || `upload-${Date.now()}`,
      url: cleanUrl,
      title: image.title || 'Uploaded Image',
      category: image.category || 'uploads',
      description: image.description || 'User uploaded image asset',
      tag: image.tag || 'Upload',
      isUploaded: true,
      createdAt: now
    };

    this.sqlite.prepare(`
      INSERT OR REPLACE INTO custom_gallery (id, url, title, category, description, tag, is_uploaded, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      newImg.id,
      newImg.url,
      newImg.title,
      newImg.category,
      newImg.description,
      newImg.tag,
      newImg.createdAt
    );

    this.emitChange('gallery', 'ADD_GALLERY_IMAGE', newImg.id, `Uploaded gallery image "${newImg.title}"`);
    return newImg;
  }

  public deleteCustomGallery(id: string): boolean {
    this.ensureOpen();
    const existing = this.sqlite.prepare('SELECT id, title FROM custom_gallery WHERE id = ?').get(id) as any;
    if (!existing) return false;

    this.sqlite.prepare('DELETE FROM custom_gallery WHERE id = ?').run(id);
    this.emitChange('gallery', 'DELETE_GALLERY_IMAGE', id, `Deleted gallery image "${existing.title}"`);
    return true;
  }

  public resetCustomGallery() {
    this.ensureOpen();
    this.sqlite.exec('DELETE FROM custom_gallery');
    this.emitChange('gallery', 'RESET_GALLERY', 'all', 'Cleared custom gallery uploads');
    return [];
  }

  // === TESTIMONIALS ===
  public getTestimonials(): any[] {
    this.ensureOpen();
    const rows = this.sqlite.prepare('SELECT payload_json FROM testimonials ORDER BY created_at DESC').all();
    if (!rows.length) return DEFAULT_TESTIMONIALS;
    return rows.map((r: any) => JSON.parse(r.payload_json));
  }

  public saveTestimonial(testimonial: any) {
    this.ensureOpen();
    const now = new Date().toISOString();
    const newT = {
      ...testimonial,
      id: testimonial.id || `t-${Date.now()}`,
      rating: Number(testimonial.rating) || 5,
      verified: testimonial.verified === undefined ? true : Boolean(testimonial.verified),
      createdAt: testimonial.createdAt || now
    };

    this.sqlite.prepare(`
      INSERT INTO testimonials (
        id, buyer_name, company, country, flag, product_supplied,
        container_type, quote, rating, verified, date, created_at, payload_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        buyer_name = excluded.buyer_name,
        company = excluded.company,
        country = excluded.country,
        flag = excluded.flag,
        product_supplied = excluded.product_supplied,
        container_type = excluded.container_type,
        quote = excluded.quote,
        rating = excluded.rating,
        verified = excluded.verified,
        date = excluded.date,
        payload_json = excluded.payload_json
    `).run(
      newT.id,
      newT.author || newT.buyerName || '',
      newT.company || '',
      newT.country || '',
      newT.flag || '🌐',
      newT.commodity || newT.productSupplied || '',
      newT.volumeOrType || newT.containerType || '',
      newT.testimonial || newT.quote || '',
      newT.rating,
      newT.verified ? 1 : 0,
      newT.date || '',
      newT.createdAt,
      JSON.stringify(newT)
    );

    this.emitChange('testimonials', 'SAVE_TESTIMONIAL', newT.id, `Saved buyer testimonial from ${newT.author || newT.buyerName || 'Buyer'}`);
    return newT;
  }

  public deleteTestimonial(id: string): boolean {
    this.ensureOpen();
    const existing = this.sqlite.prepare('SELECT id, buyer_name FROM testimonials WHERE id = ?').get(id) as any;
    if (!existing) return false;

    this.sqlite.prepare('DELETE FROM testimonials WHERE id = ?').run(id);
    this.emitChange('testimonials', 'DELETE_TESTIMONIAL', id, `Deleted testimonial from ${existing.buyer_name}`);
    return true;
  }

  public resetTestimonials() {
    this.ensureOpen();
    const now = new Date().toISOString();
    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      this.sqlite.exec('DELETE FROM testimonials');
      const insertTestimonial = this.sqlite.prepare(`
        INSERT INTO testimonials (
          id, buyer_name, company, country, flag, product_supplied,
          container_type, quote, rating, verified, date, created_at, payload_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of DEFAULT_TESTIMONIALS as any[]) {
        insertTestimonial.run(
          t.id,
          t.author || t.buyerName || '',
          t.company || '',
          t.country || '',
          t.flag || '🌐',
          t.commodity || t.productSupplied || '',
          t.volumeOrType || t.containerType || '',
          t.testimonial || t.quote || '',
          Number(t.rating) || 5,
          t.verified === false ? 0 : 1,
          t.date || '',
          t.createdAt || now,
          JSON.stringify(t)
        );
      }
      this.sqlite.exec('COMMIT');
    } catch (e) {
      this.sqlite.exec('ROLLBACK');
      throw e;
    }

    this.emitChange('testimonials', 'RESET_TESTIMONIALS', 'all', 'Reset buyer testimonials to factory defaults');
    return this.getTestimonials();
  }
}

export const db = new SQLiteDatabaseEngine();
