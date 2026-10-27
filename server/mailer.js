/**
 * ===============================================================
 * Origintra Exim - Dedicated Standalone Pure Nodemailer Service
 * ===============================================================
 * 
 * Standalone microservice for sending corporate emails via Nodemailer
 * on any Node.js hosting, VPS, or container (Hostinger Node / Render / Vercel).
 * 
 * Powered by MailerEngine:
 *   - Persistent Connection Pooling (pool: true)
 *   - Resilient Auto-Retry Queue (Zero Email Loss)
 *   - Audit Logging & Health Diagnostics
 * 
 * Run directly with:
 *   node server/mailer.js
 */

import http from 'http';
import mailerEngine from './mailerEngine.js';

const PORT = process.env.PORT || 3001;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const url = req.url ? req.url.split('?')[0] : '';

  // Health Check
  if (req.method === 'GET' && (url === '/health' || url === '/api/health')) {
    return sendJson(res, 200, {
      status: 'ok',
      service: 'Origintra Pure Nodemailer Service',
      port: PORT,
      queue: mailerEngine.getQueueStatus()
    });
  }

  // Queue Status
  if (req.method === 'GET' && url === '/api/mail-queue') {
    return sendJson(res, 200, mailerEngine.getQueueStatus());
  }

  // Audit Logs
  if (req.method === 'GET' && url === '/api/mail-logs') {
    return sendJson(res, 200, mailerEngine.getLogs());
  }

  // Verify SMTP Connection Endpoint
  if (req.method === 'POST' && (url === '/api/verify-smtp')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const result = await mailerEngine.verifySmtp(payload);
        return sendJson(res, result.success ? 200 : 400, result);
      } catch (err) {
        return sendJson(res, 400, { success: false, message: `SMTP verification failed: ${err.message || err}` });
      }
    });
    return;
  }

  // Save SMTP Configuration Endpoint
  if (req.method === 'POST' && (url === '/api/save-smtp')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const result = mailerEngine.saveConfig(payload);
        return sendJson(res, result.success ? 200 : 500, result);
      } catch (err) {
        return sendJson(res, 500, { success: false, message: `Failed to save configuration: ${err.message || err}` });
      }
    });
    return;
  }

  // Send Email Endpoint (Pure Nodemailer Pooled + Resilient Queue)
  if (req.method === 'POST' && (url === '/api/send-mail')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        if (!data.to) {
          return sendJson(res, 400, { success: false, message: 'Recipient email (to) is required.' });
        }

        const isUrgent = data.sync === true || (data.subject && data.subject.includes('[Test Verification]'));

        if (isUrgent) {
          try {
            const result = await mailerEngine.sendMailDirect(data);
            return sendJson(res, 200, result);
          } catch (directErr) {
            console.warn('[Standalone Mailer Direct Warning] Send error, enqueuing:', directErr.message);
            const queued = await mailerEngine.enqueueMail(data);
            return sendJson(res, 200, {
              success: true,
              queued: true,
              id: queued.id,
              message: `Email queued for guaranteed delivery: ${directErr.message}`
            });
          }
        }

        const result = await mailerEngine.enqueueMail(data);
        return sendJson(res, 200, result);
      } catch (err) {
        console.error('[Standalone Mailer Error]:', err);
        return sendJson(res, 500, {
          success: false,
          message: `Nodemailer delivery error: ${err.message || err}`
        });
      }
    });
    return;
  }

  // Not Found
  sendJson(res, 404, { error: 'Endpoint not found', path: url });
});

server.listen(PORT, () => {
  console.log(`[Origintra Exim] Dedicated Pure Nodemailer Service running at http://localhost:${PORT}`);
});
