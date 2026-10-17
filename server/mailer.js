/**
 * ===============================================================
 * Origintra Exim - Dedicated Node.js Nodemailer Mail Service
 * ===============================================================
 * 
 * Standalone microservice for sending corporate emails via Nodemailer
 * on any Node.js hosting, VPS, or container (Hostinger Node / Render / Vercel).
 * 
 * Run directly with:
 *   node server/mailer.js
 */

import http from 'http';
import nodemailer from 'nodemailer';

const PORT = process.env.PORT || 3001;

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health Check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'Origintra Nodemailer Service', port: PORT }));
    return;
  }

  // Verify SMTP Connection Endpoint
  if (req.method === 'POST' && req.url === '/api/verify-smtp') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { host, port, secure, user, pass } = JSON.parse(body || '{}');
        const transporter = nodemailer.createTransport({
          host: host || 'smtp.hostinger.com',
          port: Number(port) || 465,
          secure: secure !== undefined ? Boolean(secure) : (Number(port) === 465),
          auth: { user, pass },
          tls: { rejectUnauthorized: false }
        });

        await transporter.verify();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `SMTP connection to ${host}:${port} successfully verified!`
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: `SMTP verification failed: ${err.message || err}`
        }));
      }
    });
    return;
  }

  // Send Email Endpoint
  if (req.method === 'POST' && (req.url === '/api/send-mail' || req.url === '/api/send-mail.php')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const { to, subject, body: bodyText, html, smtp, senderEmail, senderName } = data;

        if (!to) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Recipient email (to) is required.' }));
          return;
        }

        const host = smtp?.host || 'smtp.hostinger.com';
        const port = Number(smtp?.port) || 465;
        const secure = smtp?.secure !== undefined ? Boolean(smtp.secure) : (port === 465);
        const user = smtp?.user || senderEmail || 'export@origintra.com';
        const pass = smtp?.pass || '';
        const fromName = senderName || 'Origintra Exim Administration';
        const fromEmail = senderEmail || user;

        const transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: pass ? { user, pass } : undefined,
          tls: { rejectUnauthorized: false }
        });

        const info = await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to,
          subject: subject || 'Origintra Exim Corporate Notification',
          text: bodyText || '',
          html: html || undefined
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Email dispatched successfully to ${to} via Nodemailer`,
          method: `Nodemailer (${host}:${port})`,
          messageId: info.messageId
        }));
      } catch (err) {
        console.error('[Nodemailer Server Error]:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: `Nodemailer delivery error: ${err.message || err}`
        }));
      }
    });
    return;
  }

  // Not Found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`[Origintra Exim] Nodemailer Service running at http://localhost:${PORT}`);
});
