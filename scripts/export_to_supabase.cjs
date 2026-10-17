const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

function escapePg(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  const str = String(val);
  return "'" + str.replace(/'/g, "''") + "'";
}

function exportToSupabase() {
  const dbPath = path.join(process.cwd(), 'data', 'origintra.sqlite');
  if (!fs.existsSync(dbPath)) {
    console.error('SQLite database not found at:', dbPath);
    process.exit(1);
  }

  const db = new DatabaseSync(dbPath);
  const outPath = path.join(process.cwd(), 'supabase_schema.sql');
  const lines = [];

  lines.push('-- ===============================================================');
  lines.push('-- ORIGINTRA EXIM - SUPABASE (POSTGRESQL) SCHEMA & SEED DATA');
  lines.push('-- Generated: ' + new Date().toISOString());
  lines.push('-- Copy & paste this entire script into your Supabase SQL Editor and click "Run"');
  lines.push('-- ===============================================================');
  lines.push('');

  // 1. users table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- 1. Table: users');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS users CASCADE;');
  lines.push(`CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  department TEXT,
  created_at TEXT NOT NULL,
  last_login TEXT
);`);
  lines.push('ALTER TABLE users ENABLE ROW LEVEL SECURITY;');
  lines.push('CREATE POLICY "Allow full access for users" ON users FOR ALL USING (true) WITH CHECK (true);');
  lines.push('');

  const users = db.prepare('SELECT * FROM users').all();
  if (users.length) {
    lines.push('INSERT INTO users (id, name, email, password, role, avatar, department, created_at, last_login) VALUES');
    const uVals = users.map(u => 
      `(${escapePg(u.id)}, ${escapePg(u.name)}, ${escapePg(u.email)}, ${escapePg(u.password)}, ${escapePg(u.role)}, ${escapePg(u.avatar)}, ${escapePg(u.department)}, ${escapePg(u.created_at)}, ${escapePg(u.last_login)})`
    );
    lines.push(uVals.join(',\n') + ';');
    lines.push('');
  }

  // 2. products table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- 2. Table: products');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS products CASCADE;');
  lines.push(`CREATE TABLE products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  hsn_code TEXT,
  short_description TEXT,
  image TEXT,
  origin TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  payload_json JSONB NOT NULL,
  updated_at TEXT NOT NULL
);`);
  lines.push('CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);');
  lines.push('CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);');
  lines.push('ALTER TABLE products ENABLE ROW LEVEL SECURITY;');
  lines.push('CREATE POLICY "Allow full access for products" ON products FOR ALL USING (true) WITH CHECK (true);');
  lines.push('');

  const products = db.prepare('SELECT * FROM products').all();
  if (products.length) {
    lines.push('INSERT INTO products (id, slug, name, category, hsn_code, short_description, image, origin, sort_order, payload_json, updated_at) VALUES');
    const pVals = products.map(p => 
      `(${escapePg(p.id)}, ${escapePg(p.slug)}, ${escapePg(p.name)}, ${escapePg(p.category)}, ${escapePg(p.hsn_code)}, ${escapePg(p.short_description)}, ${escapePg(p.image)}, ${escapePg(p.origin)}, ${p.sort_order || 0}, ${escapePg(p.payload_json)}::jsonb, ${escapePg(p.updated_at)})`
    );
    lines.push(pVals.join(',\n') + ';');
    lines.push('');
  }

  // 3. blog_posts table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- 3. Table: blog_posts');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS blog_posts CASCADE;');
  lines.push(`CREATE TABLE blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  date TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT false,
  image TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  payload_json JSONB NOT NULL,
  updated_at TEXT NOT NULL
);`);
  lines.push('CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts (slug);');
  lines.push('ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;');
  lines.push('CREATE POLICY "Allow full access for blog_posts" ON blog_posts FOR ALL USING (true) WITH CHECK (true);');
  lines.push('');

  const blogs = db.prepare('SELECT * FROM blog_posts').all();
  if (blogs.length) {
    lines.push('INSERT INTO blog_posts (id, slug, title, category, author, date, featured, image, sort_order, payload_json, updated_at) VALUES');
    const bVals = blogs.map(b => 
      `(${escapePg(b.id)}, ${escapePg(b.slug)}, ${escapePg(b.title)}, ${escapePg(b.category)}, ${escapePg(b.author)}, ${escapePg(b.date)}, ${Boolean(b.featured)}, ${escapePg(b.image)}, ${b.sort_order || 0}, ${escapePg(b.payload_json)}::jsonb, ${escapePg(b.updated_at)})`
    );
    lines.push(bVals.join(',\n') + ';');
    lines.push('');
  }

  // 4. team_members table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- 4. Table: team_members');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS team_members CASCADE;');
  lines.push(`CREATE TABLE team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  payload_json JSONB NOT NULL,
  updated_at TEXT NOT NULL
);`);
  lines.push('ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;');
  lines.push('CREATE POLICY "Allow full access for team_members" ON team_members FOR ALL USING (true) WITH CHECK (true);');
  lines.push('');

  const team = db.prepare('SELECT * FROM team_members').all();
  if (team.length) {
    lines.push('INSERT INTO team_members (id, name, role, department, email, phone, photo, sort_order, payload_json, updated_at) VALUES');
    const tVals = team.map(t => 
      `(${escapePg(t.id)}, ${escapePg(t.name)}, ${escapePg(t.role)}, ${escapePg(t.department)}, ${escapePg(t.email)}, ${escapePg(t.phone)}, ${escapePg(t.photo)}, ${t.sort_order || 0}, ${escapePg(t.payload_json)}::jsonb, ${escapePg(t.updated_at)})`
    );
    lines.push(tVals.join(',\n') + ';');
    lines.push('');
  }

  // 5. inquiries table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- 5. Table: inquiries');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS inquiries CASCADE;');
  lines.push(`CREATE TABLE inquiries (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  company_name TEXT,
  business_email TEXT NOT NULL,
  country TEXT,
  phone_whatsapp TEXT,
  product TEXT NOT NULL,
  product_form TEXT,
  quantity_required TEXT,
  packaging_requirement TEXT,
  destination_port TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT NOT NULL DEFAULT 'quote_modal',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);`);
  lines.push('CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);');
  lines.push('ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;');
  lines.push('CREATE POLICY "Allow full access for inquiries" ON inquiries FOR ALL USING (true) WITH CHECK (true);');
  lines.push('');

  const inquiries = db.prepare('SELECT * FROM inquiries').all();
  if (inquiries.length) {
    lines.push('INSERT INTO inquiries (id, full_name, company_name, business_email, country, phone_whatsapp, product, product_form, quantity_required, packaging_requirement, destination_port, message, status, source, created_at, updated_at) VALUES');
    const iVals = inquiries.map(i => 
      `(${escapePg(i.id)}, ${escapePg(i.full_name)}, ${escapePg(i.company_name)}, ${escapePg(i.business_email)}, ${escapePg(i.country)}, ${escapePg(i.phone_whatsapp)}, ${escapePg(i.product)}, ${escapePg(i.product_form)}, ${escapePg(i.quantity_required)}, ${escapePg(i.packaging_requirement)}, ${escapePg(i.destination_port)}, ${escapePg(i.message)}, ${escapePg(i.status)}, ${escapePg(i.source)}, ${escapePg(i.created_at)}, ${escapePg(i.updated_at || i.created_at)})`
    );
    lines.push(iVals.join(',\n') + ';');
    lines.push('');
  }

  // 6. company_config table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- 6. Table: company_config');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS company_config CASCADE;');
  lines.push(`CREATE TABLE company_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL,
  legal_name TEXT,
  tagline TEXT,
  primary_email TEXT,
  export_email TEXT,
  phone TEXT,
  phone_display TEXT,
  whatsapp_number TEXT,
  whatsapp_display TEXT,
  whatsapp_url TEXT,
  payload_json JSONB NOT NULL,
  updated_at TEXT NOT NULL
);`);
  lines.push('ALTER TABLE company_config ENABLE ROW LEVEL SECURITY;');
  lines.push('CREATE POLICY "Allow full access for company_config" ON company_config FOR ALL USING (true) WITH CHECK (true);');
  lines.push('');

  const company = db.prepare('SELECT * FROM company_config').all();
  if (company.length) {
    lines.push('INSERT INTO company_config (id, name, legal_name, tagline, primary_email, export_email, phone, phone_display, whatsapp_number, whatsapp_display, whatsapp_url, payload_json, updated_at) VALUES');
    const cVals = company.map(c => 
      `(1, ${escapePg(c.name)}, ${escapePg(c.legal_name)}, ${escapePg(c.tagline)}, ${escapePg(c.primary_email)}, ${escapePg(c.export_email)}, ${escapePg(c.phone)}, ${escapePg(c.phone_display)}, ${escapePg(c.whatsapp_number)}, ${escapePg(c.whatsapp_display)}, ${escapePg(c.whatsapp_url)}, ${escapePg(c.payload_json)}::jsonb, ${escapePg(c.updated_at)})`
    );
    lines.push(cVals.join(',\n') + ';');
    lines.push('');
  }

  // 7. custom_gallery table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- 7. Table: custom_gallery');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS custom_gallery CASCADE;');
  lines.push(`CREATE TABLE custom_gallery (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  tag TEXT,
  is_uploaded BOOLEAN NOT NULL DEFAULT true,
  created_at TEXT NOT NULL
);`);
  lines.push('ALTER TABLE custom_gallery ENABLE ROW LEVEL SECURITY;');
  lines.push('CREATE POLICY "Allow full access for custom_gallery" ON custom_gallery FOR ALL USING (true) WITH CHECK (true);');
  lines.push('');

  const gallery = db.prepare('SELECT * FROM custom_gallery').all();
  if (gallery.length) {
    lines.push('INSERT INTO custom_gallery (id, url, title, category, description, tag, is_uploaded, created_at) VALUES');
    const gVals = gallery.map(g => 
      `(${escapePg(g.id)}, ${escapePg(g.url)}, ${escapePg(g.title)}, ${escapePg(g.category)}, ${escapePg(g.description)}, ${escapePg(g.tag)}, ${Boolean(g.is_uploaded)}, ${escapePg(g.created_at)})`
    );
    lines.push(gVals.join(',\n') + ';');
    lines.push('');
  }

  // 8. testimonials table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- 8. Table: testimonials');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS testimonials CASCADE;');
  lines.push(`CREATE TABLE testimonials (
  id TEXT PRIMARY KEY,
  buyer_name TEXT NOT NULL,
  company TEXT,
  country TEXT,
  flag TEXT,
  product_supplied TEXT,
  container_type TEXT,
  quote TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  verified BOOLEAN NOT NULL DEFAULT true,
  date TEXT,
  created_at TEXT NOT NULL,
  payload_json JSONB
);`);
  lines.push('ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;');
  lines.push('CREATE POLICY "Allow full access for testimonials" ON testimonials FOR ALL USING (true) WITH CHECK (true);');
  lines.push('');

  const testimonials = db.prepare('SELECT * FROM testimonials').all();
  if (testimonials.length) {
    lines.push('INSERT INTO testimonials (id, buyer_name, company, country, flag, product_supplied, container_type, quote, rating, verified, date, created_at, payload_json) VALUES');
    const tVals = testimonials.map(t => 
      `(${escapePg(t.id)}, ${escapePg(t.buyer_name)}, ${escapePg(t.company)}, ${escapePg(t.country)}, ${escapePg(t.flag)}, ${escapePg(t.product_supplied)}, ${escapePg(t.container_type)}, ${escapePg(t.quote)}, ${t.rating || 5}, ${Boolean(t.verified)}, ${escapePg(t.date)}, ${escapePg(t.created_at)}, ${escapePg(t.payload_json)}::jsonb)`
    );
    lines.push(tVals.join(',\n') + ';');
    lines.push('');
  }

  // 9. audit_logs table
  lines.push('-- -------------------------------------------------------------');
  lines.push('-- 9. Table: audit_logs');
  lines.push('-- -------------------------------------------------------------');
  lines.push('DROP TABLE IF EXISTS audit_logs CASCADE;');
  lines.push(`CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL
);`);
  lines.push('ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;');
  lines.push('CREATE POLICY "Allow full access for audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);');
  lines.push('');

  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`[Supabase Export] Successfully exported SQLite database to ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

exportToSupabase();
