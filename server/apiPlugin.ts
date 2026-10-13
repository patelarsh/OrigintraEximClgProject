import { Plugin } from 'vite';
import { db } from './db';
import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) { // 50MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

// Track active Server-Sent Events (SSE) clients for real-time live sync across all browsers
const sseClients = new Set<ServerResponse>();

db.onDatabaseChange((event) => {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
});

// Keep-alive heartbeat every 25s for SSE connections
setInterval(() => {
  const ping = `: heartbeat ${Date.now()}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(ping);
    } catch {
      sseClients.delete(client);
    }
  }
}, 25000).unref();

export async function handleApiMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) {
  const url = req.url || '';

  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS' && url.startsWith('/api/')) {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return;
  }

  // Direct static serving for user uploads
  if (url.startsWith('/uploads/')) {
    const cleanPath = url.split('?')[0].replace(/^\/+/, '');
    const filePath = path.join(process.cwd(), 'public', cleanPath);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeMap: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml'
      };
      res.statusCode = 200;
      res.setHeader('Content-Type', mimeMap[ext] || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  if (!url.startsWith('/api/')) {
    return next();
  }

  const [pathname] = url.split('?');
  const method = req.method?.toUpperCase() || 'GET';

  try {
    // --- Real-Time SSE Event Stream (/api/events) ---
    if (pathname === '/api/events' && method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);
      sseClients.add(res);

      req.on('close', () => {
        sseClients.delete(res);
      });
      return;
    }

    // --- Health & SQLite Database Status ---
    if (pathname === '/api/health') {
      return sendJson(res, 200, {
        status: 'ok',
        engine: 'SQLite 3 (WAL)',
        liveClients: sseClients.size,
        timestamp: new Date().toISOString()
      });
    }

    if (pathname === '/api/db-status' && method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        data: {
          ...db.getDatabaseStatus(),
          liveConnectedClients: sseClients.size
        }
      });
    }

    // --- Bootstrap / All Data ---
    if (pathname === '/api/bootstrap' || pathname === '/api/all') {
      return sendJson(res, 200, {
        success: true,
        data: {
          ...db.getAllData(),
          dbStatus: {
            ...db.getDatabaseStatus(),
            liveConnectedClients: sseClients.size
          }
        }
      });
    }

    // --- Auth Login ---
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseJsonBody(req);
      const identifier = (body.email || body.username || body.identifier || '').toString();
      const password = (body.password || '').toString();
      const authResult = db.authenticate(identifier, password);
      if (!authResult) {
        return sendJson(res, 401, {
          success: false,
          error: 'Incorrect email/username or password.'
        });
      }
      return sendJson(res, 200, { success: true, ...authResult });
    }

    // --- Users (RBAC) ---
    if (pathname === '/api/users') {
      if (method === 'GET') {
        return sendJson(res, 200, { success: true, data: db.getUsers() });
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        if (!body.name || !body.email || !body.role) {
          return sendJson(res, 400, { success: false, error: 'Name, email, and role are required.' });
        }
        const newUser = db.createUser(body);
        return sendJson(res, 201, { success: true, data: newUser });
      }
    }

    if (pathname.startsWith('/api/users/')) {
      const id = pathname.replace('/api/users/', '');
      if (method === 'PUT') {
        const body = await parseJsonBody(req);
        const updated = db.updateUser(id, body);
        if (!updated) {
          return sendJson(res, 404, { success: false, error: 'User not found.' });
        }
        return sendJson(res, 200, { success: true, data: updated });
      }
      if (method === 'DELETE') {
        const deleted = db.deleteUser(id);
        if (!deleted) {
          return sendJson(res, 400, { success: false, error: 'Could not delete user.' });
        }
        return sendJson(res, 200, { success: true, message: 'User deleted.' });
      }
    }

    // --- Products ---
    if (pathname === '/api/products') {
      if (method === 'GET') {
        return sendJson(res, 200, { success: true, data: db.getProducts() });
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        const saved = db.saveProduct(body);
        return sendJson(res, 200, { success: true, data: saved });
      }
    }

    if (pathname === '/api/products/reset' && method === 'POST') {
      const reset = db.resetProducts();
      return sendJson(res, 200, { success: true, data: reset });
    }

    if (pathname.startsWith('/api/products/')) {
      const slugOrId = decodeURIComponent(pathname.replace('/api/products/', ''));
      if (method === 'GET') {
        const prod = db.getProducts().find(p => p.slug === slugOrId || p.id === slugOrId);
        if (prod) {
          return sendJson(res, 200, { success: true, data: prod });
        }
        return sendJson(res, 404, { success: false, error: 'Product not found' });
      }
      if (method === 'DELETE') {
        const deleted = db.deleteProduct(slugOrId);
        return sendJson(res, 200, { success: deleted });
      }
    }

    // --- Blog Posts ---
    if (pathname === '/api/blog') {
      if (method === 'GET') {
        return sendJson(res, 200, { success: true, data: db.getBlogPosts() });
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        const saved = db.saveBlogPost(body);
        return sendJson(res, 200, { success: true, data: saved });
      }
    }

    if (pathname === '/api/blog/reset' && method === 'POST') {
      const reset = db.resetBlogPosts();
      return sendJson(res, 200, { success: true, data: reset });
    }

    if (pathname.startsWith('/api/blog/')) {
      const slugOrId = decodeURIComponent(pathname.replace('/api/blog/', ''));
      if (method === 'GET') {
        const post = db.getBlogPosts().find(p => p.slug === slugOrId || p.id === slugOrId);
        if (post) {
          return sendJson(res, 200, { success: true, data: post });
        }
        return sendJson(res, 404, { success: false, error: 'Post not found' });
      }
      if (method === 'DELETE') {
        const deleted = db.deleteBlogPost(slugOrId);
        return sendJson(res, 200, { success: deleted });
      }
    }

    // --- Team Members ---
    if (pathname === '/api/team') {
      if (method === 'GET') {
        return sendJson(res, 200, { success: true, data: db.getTeamMembers() });
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        const saved = db.saveTeamMember(body);
        return sendJson(res, 200, { success: true, data: saved });
      }
    }

    if (pathname === '/api/team/reset' && method === 'POST') {
      const reset = db.resetTeamMembers();
      return sendJson(res, 200, { success: true, data: reset });
    }

    if (pathname.startsWith('/api/team/')) {
      const id = pathname.replace('/api/team/', '');
      if (method === 'DELETE') {
        const deleted = db.deleteTeamMember(id);
        return sendJson(res, 200, { success: deleted });
      }
    }

    // --- Inquiries ---
    if (pathname === '/api/inquiries') {
      if (method === 'GET') {
        return sendJson(res, 200, { success: true, data: db.getInquiries() });
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        const added = db.addInquiry(body);
        return sendJson(res, 201, { success: true, data: added });
      }
    }

    if (pathname.startsWith('/api/inquiries/') && pathname.endsWith('/status') && method === 'PATCH') {
      const parts = pathname.split('/');
      const id = parts[3];
      const body = await parseJsonBody(req);
      const updated = db.updateInquiryStatus(id, body.status);
      return sendJson(res, 200, { success: updated });
    }

    if (pathname.startsWith('/api/inquiries/')) {
      const id = pathname.replace('/api/inquiries/', '');
      if (method === 'DELETE') {
        const deleted = db.deleteInquiry(id);
        return sendJson(res, 200, { success: deleted });
      }
    }

    // --- Company Config ---
    if (pathname === '/api/company') {
      if (method === 'GET') {
        return sendJson(res, 200, { success: true, data: db.getCompanyConfig() });
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        const saved = db.saveCompanyConfig(body);
        return sendJson(res, 200, { success: true, data: saved });
      }
    }

    // --- Gallery ---
    if (pathname === '/api/gallery') {
      if (method === 'GET') {
        return sendJson(res, 200, { success: true, data: db.getCustomGallery() });
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        const added = db.addCustomGallery(body);
        return sendJson(res, 201, { success: true, data: added });
      }
    }

    if (pathname === '/api/gallery/reset' && method === 'POST') {
      const reset = db.resetCustomGallery();
      return sendJson(res, 200, { success: true, data: reset });
    }

    // --- Dedicated Fast Image Upload ---
    if (pathname === '/api/upload' && method === 'POST') {
      const body = await parseJsonBody(req);
      const dataUrl = body.data || body.url || '';
      if (!dataUrl) {
        return sendJson(res, 400, { success: false, error: 'No image data provided' });
      }

      const cleanUrl = db.saveBase64ToFile(dataUrl, body.prefix || 'upload');
      const galleryItem = db.addCustomGallery({
        url: cleanUrl,
        title: body.title || 'Uploaded Image',
        category: body.category || 'uploads',
        tag: body.tag || 'Upload',
        description: body.description || 'Uploaded photo'
      });

      return sendJson(res, 201, {
        success: true,
        url: cleanUrl,
        image: galleryItem
      });
    }

    if (pathname.startsWith('/api/gallery/')) {
      const id = pathname.replace('/api/gallery/', '');
      if (method === 'DELETE') {
        const deleted = db.deleteCustomGallery(id);
        return sendJson(res, 200, { success: deleted });
      }
    }

    // --- Testimonials / Buyer Reviews ---
    if (pathname === '/api/testimonials') {
      if (method === 'GET') {
        return sendJson(res, 200, { success: true, data: db.getTestimonials() });
      }
      if (method === 'POST') {
        const body = await parseJsonBody(req);
        const saved = db.saveTestimonial(body);
        return sendJson(res, 201, { success: true, data: saved });
      }
    }

    if (pathname === '/api/testimonials/reset' && method === 'POST') {
      const reset = db.resetTestimonials();
      return sendJson(res, 200, { success: true, data: reset });
    }

    if (pathname.startsWith('/api/testimonials/')) {
      const id = pathname.replace('/api/testimonials/', '');
      if (method === 'PUT') {
        const body = await parseJsonBody(req);
        const saved = db.saveTestimonial({ ...body, id });
        return sendJson(res, 200, { success: true, data: saved });
      }
      if (method === 'DELETE') {
        const deleted = db.deleteTestimonial(id);
        return sendJson(res, 200, { success: deleted });
      }
    }

    return sendJson(res, 404, { success: false, error: `Route ${method} ${pathname} not found.` });
  } catch (err: any) {
    console.error('[API Error]', err);
    return sendJson(res, 500, { success: false, error: err.message || 'Internal Server Error' });
  }
}

export function apiPlugin(): Plugin {
  return {
    name: 'origintra-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        handleApiMiddleware(req, res, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        handleApiMiddleware(req, res, next);
      });
    }
  };
}
