/**
 * ===============================================================
 * Origintra Exim - Enterprise Node.js & Express.js Backend Server
 * ===============================================================
 * 
 * High-performance, zero-inconsistency, unified Node.js backend.
 * Replaces legacy PHP endpoints with pure Node.js & Express.
 * 
 * Provides:
 *  - Single Source of Truth (SSOT) Products API (/api/products)
 *  - Self-healing image asset verification & responsive conversion
 *  - Multi-device global settings sync (/api/settings)
 *  - High-resolution image upload with Sharp optimization (/api/upload)
 *  - Nodemailer enterprise SMTP mail service (/api/send-mail)
 *  - Full SPA static serving & fallback routing for production
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
// Safe dynamic import for sharp (resilient startup)
let sharp = null;
try {
  const sharpModule = await import('sharp');
  sharp = sharpModule.default || sharpModule;
} catch (err) {
  console.warn('[Origintra Exim] Optional module "sharp" not found. Image optimization fallback active.');
}
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mailerEngine from './mailerEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DATA_DIR = path.join(PUBLIC_DIR, 'api');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

const PRODUCTS_FILE = path.join(DATA_DIR, 'products-data.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'site-settings.json');

// Ensure necessary directories exist
[PUBLIC_DIR, DATA_DIR, UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Supabase synchronization configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://wmdxsgvgaxlvgnibixsl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_9a6MH9kXxRCMLkLxnWR3zA_KZQohNKP';

const CANONICAL_IMAGE_MAP = {
  'cinnamon': '/assets/products/cinnamon.jpg',
  'coriander-seeds': '/assets/products/coriander-seeds.jpg',
  'clove': '/assets/products/clove.jpg',
  'cloves': '/assets/products/clove.jpg',
  'cumin-seeds': '/assets/products/cumin-seeds.jpg',
  'whole-turmeric': '/assets/products/whole-turmeric.jpg',
  'turmeric': '/assets/products/turmeric.jpg',
  'turmeric-powder': '/assets/products/turmeric.jpg',
  'black-pepper': '/assets/products/black-pepper.jpg',
  'fenugreek-seeds': '/assets/products/fenugreek-seeds.jpg',
  'fennel': '/assets/products/fennel.jpg',
  'fennel-seeds': '/assets/products/fennel.jpg',
  'dry-ginger': '/assets/products/dry-ginger.jpg',
  'ginger': '/assets/products/dry-ginger.jpg',
  'bay-leaf': '/assets/products/bay-leaf.jpg',
  'star-anise': '/assets/products/star-anise.jpg',
  'whole-red-chili': '/assets/products/whole-red-chili.jpg',
  'red-chilli': '/assets/products/whole-red-chili.jpg',
  'green-cardamom': '/assets/products/green-cardamom.jpg',
  'cardamom': '/assets/products/green-cardamom.jpg',
  'asafoetida': '/assets/products/asafoetida.jpg',
  'red-chili-powder': '/assets/products/red-chili-powder.jpg',
  'coriander-powder': '/assets/products/coriander-powder.jpg',
  'cumin-powder': '/assets/products/cumin-powder.jpg',
  'black-pepper-powder': '/assets/products/black-pepper-powder.jpg',
  'garam-masala': '/assets/products/garam-masala.jpg',
  'sambar-masala': '/assets/products/sambar-masala.jpg',
  'rasam-powder': '/assets/products/rasam-powder.jpg',
  'biryani-masala': '/assets/products/biryani-masala.jpg',
  'tandoori-masala': '/assets/products/tandoori-masala.jpg',
  'curry-powder': '/assets/products/curry-powder.jpg',
  'chaat-masala': '/assets/products/chaat-masala.jpg'
};

// Helper: Read Settings
function readSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[Settings] Error reading settings:', err);
  }
  return {
    leadershipVisible: false,
    deletedGalleryIds: [],
    deletedProductIds: ['mustard-seeds'],
    updatedAt: new Date().toISOString()
  };
}

// Helper: Write Settings
function writeSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[Settings] Error writing settings:', err);
    return false;
  }
}

// Helper: Read and Sanitize Products (Self-Healing File Checks)
function readProducts() {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    let products = JSON.parse(raw);
    if (!Array.isArray(products)) return [];

    const settings = readSettings();
    const deletedSet = new Set([...(settings.deletedProductIds || []), 'mustard-seeds', 'nutmeg']);

    // Filter out deleted products
    products = products.filter(p => !deletedSet.has(p.id) && !deletedSet.has(p.slug));

    // Self-healing: verify image existence on disk
    let healed = false;
    products = products.map(p => {
      let img = p.image || '';
      let isValid = false;

      if (img.startsWith('/assets/products/')) {
        const filePath = path.join(PUBLIC_DIR, img.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          isValid = true;
        }
      } else if (img.startsWith('/uploads/')) {
        const filePath = path.join(PUBLIC_DIR, img.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          isValid = true;
        }
      } else if (img.startsWith('http://') || img.startsWith('https://')) {
        isValid = true;
      }

      if (!isValid) {
        const canonical = CANONICAL_IMAGE_MAP[p.id] || CANONICAL_IMAGE_MAP[p.slug] || '/assets/products/cumin-seeds.jpg';
        p = { ...p, image: canonical };
        healed = true;
      }
      return p;
    });

    if (healed) {
      writeProducts(products, false);
    }

    return products;
  } catch (err) {
    console.error('[Products] Error reading products:', err);
    return [];
  }
}

// Helper: Write Products
function writeProducts(products, syncSupabase = true) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');

    if (syncSupabase && SUPABASE_URL && SUPABASE_KEY) {
      syncToSupabase(products).catch(err => {
        console.warn('[Supabase Sync Warning]:', err.message);
      });
    }
    return true;
  } catch (err) {
    console.error('[Products] Error writing products:', err);
    return false;
  }
}

// Helper: Async Supabase Sync
async function syncToSupabase(products) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  const rows = products.map((p, idx) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    hsn_code: p.hsCode || p.hsnCode || '',
    short_description: p.shortDescription || '',
    image: p.image || '',
    origin: p.origin || '',
    sort_order: p.sortOrder !== undefined ? p.sortOrder : idx,
    payload_json: p,
    updated_at: new Date().toISOString()
  }));

  const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(rows)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase upsert failed (${res.status}): ${txt}`);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer storage for uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are accepted!'), false);
    }
  }
});

// Cache control middleware for API
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// ===============================================================
// 1. PRODUCTS API
// ===============================================================

// GET /api/products & /api/products.php
const handleGetProducts = (req, res) => {
  const products = readProducts();
  res.json({
    success: true,
    count: products.length,
    products
  });
};
app.get('/api/products', handleGetProducts);
app.get('/api/products.php', handleGetProducts);

// POST /api/products & /api/products.php
const handlePostProducts = (req, res) => {
  try {
    const body = req.body;
    let listToSave = [];

    if (Array.isArray(body)) {
      listToSave = body;
    } else if (body && Array.isArray(body.products)) {
      listToSave = body.products;
    } else if (body && body.id) {
      const current = readProducts();
      const existingIdx = current.findIndex(p => p.id === body.id || p.slug === body.id);
      if (existingIdx >= 0) {
        current[existingIdx] = body;
        listToSave = current;
      } else {
        listToSave = [body, ...current];
      }
    } else {
      return res.status(400).json({ success: false, error: 'Invalid product payload' });
    }

    const settings = readSettings();
    const deletedSet = new Set([...(settings.deletedProductIds || []), 'mustard-seeds', 'nutmeg']);
    const sanitized = listToSave.filter(p => !deletedSet.has(p.id) && !deletedSet.has(p.slug));

    writeProducts(sanitized, true);

    res.json({
      success: true,
      count: sanitized.length,
      products: sanitized
    });
  } catch (err) {
    console.error('[Products POST Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
app.post('/api/products', handlePostProducts);
app.post('/api/products.php', handlePostProducts);

// DELETE /api/products/:id
app.delete('/api/products/:id', (req, res) => {
  try {
    const id = req.params.id;
    const current = readProducts();
    const target = current.find(p => p.id === id || p.slug === id);
    const filtered = current.filter(p => p.id !== id && p.slug !== id);

    // Update settings with deleted product ID
    const settings = readSettings();
    const idsToAdd = [id];
    if (target?.id && !idsToAdd.includes(target.id)) idsToAdd.push(target.id);
    if (target?.slug && !idsToAdd.includes(target.slug)) idsToAdd.push(target.slug);

    settings.deletedProductIds = Array.from(new Set([...(settings.deletedProductIds || []), ...idsToAdd]));
    settings.updatedAt = new Date().toISOString();
    writeSettings(settings);

    writeProducts(filtered, false);

    // Delete from Supabase
    if (SUPABASE_URL && SUPABASE_KEY) {
      fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }).catch(() => {});
    }

    res.json({
      success: true,
      deletedId: id,
      remainingCount: filtered.length
    });
  } catch (err) {
    console.error('[Products DELETE Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===============================================================
// 2. SETTINGS API
// ===============================================================

// GET /api/settings & /api/settings.php
const handleGetSettings = (req, res) => {
  const settings = readSettings();
  res.json({
    success: true,
    settings
  });
};
app.get('/api/settings', handleGetSettings);
app.get('/api/settings.php', handleGetSettings);

// POST /api/settings & /api/settings.php
const handlePostSettings = (req, res) => {
  try {
    const current = readSettings();
    const updates = req.body || {};

    const merged = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (Array.isArray(updates.deletedProductIds)) {
      merged.deletedProductIds = Array.from(new Set([...(current.deletedProductIds || []), ...updates.deletedProductIds]));
    }
    if (Array.isArray(updates.deletedGalleryIds)) {
      merged.deletedGalleryIds = Array.from(new Set([...(current.deletedGalleryIds || []), ...updates.deletedGalleryIds]));
    }

    writeSettings(merged);

    res.json({
      success: true,
      settings: merged
    });
  } catch (err) {
    console.error('[Settings POST Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
app.post('/api/settings', handlePostSettings);
app.post('/api/settings.php', handlePostSettings);

// ===============================================================
// 3. SECURE IMAGE UPLOAD API (with Sharp optimization)
// ===============================================================

async function processImageBuffer(buffer, originalName = 'upload', prefix = 'spice') {
  if (!sharp) {
    const timestamp = Math.floor(Date.now() / 1000);
    const hash = Math.random().toString(36).substring(2, 8);
    const baseName = `${prefix}_${timestamp}_${hash}`;
    const jpgFile = `${baseName}.jpg`;
    fs.writeFileSync(path.join(UPLOADS_DIR, jpgFile), buffer);
    return { master: '/uploads/' + jpgFile, webp: '/uploads/' + jpgFile, w450: '/uploads/' + jpgFile, thumb: '/uploads/' + jpgFile };
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const hash = Math.random().toString(36).substring(2, 8);
  const baseName = `${prefix}_${timestamp}_${hash}`;

  const jpgFile = `${baseName}.jpg`;
  const webpFile = `${baseName}.webp`;
  const w450File = `${baseName}-450.webp`;
  const thumbFile = `${baseName}-thumb.webp`;

  // Write high quality WebP
  await sharp(buffer)
    .webp({ quality: 88, effort: 4 })
    .toFile(path.join(UPLOADS_DIR, webpFile));

  // Write responsive 450px WebP
  await sharp(buffer)
    .resize(450, 450, { fit: 'cover', position: 'center' })
    .webp({ quality: 85 })
    .toFile(path.join(UPLOADS_DIR, w450File));

  // Write thumbnail 120px WebP
  await sharp(buffer)
    .resize(120, 120, { fit: 'cover', position: 'center' })
    .webp({ quality: 80 })
    .toFile(path.join(UPLOADS_DIR, thumbFile));

  // Write fallback JPEG
  await sharp(buffer)
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(UPLOADS_DIR, jpgFile));

  // Copy to dist/uploads if dist exists so production build serves immediately
  const distUploads = path.join(DIST_DIR, 'uploads');
  if (fs.existsSync(distUploads)) {
    try {
      [jpgFile, webpFile, w450File, thumbFile].forEach(f => {
        fs.copyFileSync(path.join(UPLOADS_DIR, f), path.join(distUploads, f));
      });
    } catch {}
  }

  return {
    url: `/uploads/${webpFile}`,
    fallbackUrl: `/uploads/${jpgFile}`,
    filename: webpFile
  };
}

// POST /api/upload & /api/upload.php
const handleUpload = async (req, res) => {
  try {
    // 1. Multipart file upload
    if (req.file) {
      const prefix = req.body?.prefix || 'spice';
      const result = await processImageBuffer(req.file.buffer, req.file.originalname, prefix);
      return res.json({
        success: true,
        url: result.url,
        fallbackUrl: result.fallbackUrl,
        filename: result.filename
      });
    }

    // 2. Base64 JSON upload
    if (req.body && req.body.dataUrl) {
      const { dataUrl, prefix = 'spice' } = req.body;
      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ success: false, error: 'Invalid base64 image data' });
      }

      const buffer = Buffer.from(matches[2], 'base64');
      const result = await processImageBuffer(buffer, 'base64-image', prefix);
      return res.json({
        success: true,
        url: result.url,
        fallbackUrl: result.fallbackUrl,
        filename: result.filename
      });
    }

    return res.status(400).json({ success: false, error: 'No image file or dataUrl provided' });
  } catch (err) {
    console.error('[Upload Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

app.post('/api/upload', upload.single('file'), handleUpload);
app.post('/api/upload.php', upload.single('file'), handleUpload);

// ===============================================================
// 4. NODEMAILER PURE POOLED & RESILIENT QUEUE EMAIL API
// ===============================================================

// POST /api/send-mail & /api/send-mail.php (strictly pure Nodemailer)
const handleSendMail = async (req, res) => {
  try {
    const data = req.body || {};
    if (!data.to) {
      return res.status(400).json({ success: false, message: 'Recipient email (to) is required.' });
    }

    // Direct synchronous send for urgent test verification emails
    const isTestOrUrgent = data.sync === true || (data.subject && data.subject.includes('[Test Verification]'));

    if (isTestOrUrgent) {
      try {
        const result = await mailerEngine.sendMailDirect(data);
        return res.json(result);
      } catch (directErr) {
        console.warn('[Nodemailer Direct Warning] Send error, enqueuing to resilient queue:', directErr.message);
        const queued = await mailerEngine.enqueueMail(data);
        return res.json({
          success: true,
          queued: true,
          id: queued.id,
          message: `Email queued for guaranteed delivery: ${directErr.message}`
        });
      }
    }

    // Enqueue to resilient persistent queue for instantaneous non-blocking delivery
    const result = await mailerEngine.enqueueMail(data);
    return res.json(result);
  } catch (err) {
    console.error('[Nodemailer Send-Mail Error]:', err);
    res.status(500).json({
      success: false,
      message: `Nodemailer delivery error: ${err.message || err}`
    });
  }
};
app.post('/api/send-mail', handleSendMail);
app.post('/api/send-mail.php', handleSendMail);

// POST /api/verify-smtp & /api/verify-smtp.php
const handleVerifySmtp = async (req, res) => {
  try {
    const result = await mailerEngine.verifySmtp(req.body || {});
    if (result.success) {
      return res.json(result);
    }
    return res.status(400).json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: `SMTP verification failed: ${err.message || err}`
    });
  }
};
app.post('/api/verify-smtp', handleVerifySmtp);
app.post('/api/verify-smtp.php', handleVerifySmtp);

// POST /api/save-smtp & /api/save-smtp.php - Persist credentials to server disk & reset pool
const handleSaveSmtp = (req, res) => {
  try {
    const result = mailerEngine.saveConfig(req.body || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || err });
  }
};
app.post('/api/save-smtp', handleSaveSmtp);
app.post('/api/save-smtp.php', handleSaveSmtp);

// GET /api/mail-queue & /api/mail-logs - Queue diagnostics & audit monitor
app.get('/api/mail-queue', (req, res) => {
  res.json(mailerEngine.getQueueStatus());
});

app.get('/api/mail-logs', (req, res) => {
  res.json(mailerEngine.getLogs());
});

// ===============================================================
// 5. SYSTEM HEALTH & DIAGNOSTICS
// ===============================================================
app.get('/api/health', (req, res) => {
  const products = readProducts();
  const settings = readSettings();
  res.json({
    status: 'ok',
    engine: 'Node.js & Express.js',
    timestamp: new Date().toISOString(),
    productsCount: products.length,
    deletedProducts: settings.deletedProductIds,
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
  });
});

// ===============================================================
// 6. STATIC FILES & PRODUCTION SPA FALLBACK
// ===============================================================
// Serve public assets (images, uploads, fonts)
app.use(express.static(PUBLIC_DIR));

// In production, serve dist folder if built
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}

// Explicitly serve sitemap and SEO assets with proper XML MIME types and CORS
app.get(['/sitemap', '/site-map'], (req, res) => {
  res.redirect(301, '/sitemap.xml');
});

app.get('/sitemap.xml', (req, res) => {
  const filePath = fs.existsSync(path.join(DIST_DIR, 'sitemap.xml'))
    ? path.join(DIST_DIR, 'sitemap.xml')
    : path.join(PUBLIC_DIR, 'sitemap.xml');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(filePath);
});

app.get('/robots.txt', (req, res) => {
  const filePath = fs.existsSync(path.join(DIST_DIR, 'robots.txt'))
    ? path.join(DIST_DIR, 'robots.txt')
    : path.join(PUBLIC_DIR, 'robots.txt');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.sendFile(filePath);
});

// 404 for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found', path: req.originalUrl });
});

// Production SPA fallback for all GET navigation routes
if (fs.existsSync(DIST_DIR)) {
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/assets') && !req.path.startsWith('/uploads')) {
      return res.sendFile('index.html', { root: DIST_DIR });
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`[Origintra Exim] Pure Node.js & Express server running on port ${PORT}`);
  console.log(`[Origintra Exim] API endpoints available at http://localhost:${PORT}/api/products`);
});

export default app;
