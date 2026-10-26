/**
 * ===============================================================
 * Origintra Exim - Enterprise Pure Nodemailer Delivery Engine
 * ===============================================================
 * 
 * High-performance, 100% pure Nodemailer delivery micro-engine.
 * Features:
 *   - Persistent SMTP Connection Pooling (pool: true) for sub-second delivery
 *   - Zero-Email-Loss Resilient Queue with exponential backoff auto-retry
 *   - Persistent file-backed queue (server/data/mail-queue.json)
 *   - Persistent server-side SMTP configuration (server/data/smtp-config.json)
 *   - Comprehensive delivery audit logging (server/data/mail-logs.json)
 *   - Strictly ZERO PHP / ZERO external sendmail dependence
 */

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CONFIG_FILE = path.join(DATA_DIR, 'smtp-config.json');
const QUEUE_FILE = path.join(DATA_DIR, 'mail-queue.json');
const LOGS_FILE = path.join(DATA_DIR, 'mail-logs.json');

// Default SMTP Configuration (Hostinger Webmail Defaults)
const DEFAULT_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === 'true' : true,
  user: process.env.SMTP_USER || 'export@origintra.com',
  pass: process.env.SMTP_PASS || '',
  fromEmail: process.env.SMTP_FROM || 'export@origintra.com',
  fromName: process.env.SMTP_NAME || 'Origintra Exim Administration Desk',
  adminAlertEmail: process.env.ADMIN_ALERT_EMAIL || 'export@origintra.com, info@patelarsh.com',
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit: 5, // max 5 messages / second to avoid mail-host rate limits
  rateDelta: 1000
};

let currentConfig = loadConfig();
let activeTransporter = null;
let queueProcessing = false;
let workerInterval = null;

// Helper: Load persistent config
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (err) {
    console.error('[MailerEngine] Failed to read config file:', err.message);
  }
  return { ...DEFAULT_CONFIG };
}

// Helper: Save persistent config
export function saveConfig(newConfig) {
  try {
    currentConfig = {
      ...currentConfig,
      ...newConfig,
      port: Number(newConfig.port) || currentConfig.port,
      secure: newConfig.secure !== undefined ? Boolean(newConfig.secure) : (Number(newConfig.port) === 465)
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), 'utf8');
    // Invalidate cached transporter to pick up new credentials immediately
    resetTransporter();
    console.log('[MailerEngine] Saved SMTP credentials to server disk & reset connection pool.');
    return { success: true, message: 'SMTP configuration saved securely on server.' };
  } catch (err) {
    console.error('[MailerEngine] Error saving config:', err);
    return { success: false, message: `Failed to save configuration: ${err.message}` };
  }
}

export function getConfig() {
  // Never expose raw password in plain text if called publicly, but return configured flag
  const masked = { ...currentConfig };
  masked.hasPassword = Boolean(currentConfig.pass && currentConfig.pass.length > 0);
  masked.pass = masked.hasPassword ? '********' : '';
  return masked;
}

// Reset pooled transporter
function resetTransporter() {
  if (activeTransporter) {
    try {
      activeTransporter.close();
    } catch {}
    activeTransporter = null;
  }
}

// Create or return pooled Nodemailer transporter
export function getTransporter(override) {
  if (override && override.pass) {
    // Custom one-off transporter (e.g. during verify test of unsaved form)
    const host = override.host || currentConfig.host;
    const port = Number(override.port) || currentConfig.port;
    const secure = override.secure !== undefined ? Boolean(override.secure) : (port === 465);
    const user = override.user || currentConfig.user;
    const pass = override.pass;

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000
    });
  }

  if (activeTransporter) {
    return activeTransporter;
  }

  const { host, port, secure, user, pass, pool, maxConnections, maxMessages, rateLimit, rateDelta } = currentConfig;

  const transportOpts = {
    host,
    port,
    secure,
    auth: pass ? { user, pass } : undefined,
    pool: pool !== false,
    maxConnections: maxConnections || 5,
    maxMessages: maxMessages || 100,
    rateLimit: rateLimit || 5,
    rateDelta: rateDelta || 1000,
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000
  };

  activeTransporter = nodemailer.createTransport(transportOpts);

  activeTransporter.on('idle', () => {
    // Pool is idle and ready for messages
  });

  activeTransporter.on('error', (err) => {
    console.warn('[MailerEngine Transporter Error]:', err?.message || err);
  });

  return activeTransporter;
}

// Verify SMTP connection
export async function verifySmtp(creds) {
  const startTime = Date.now();
  try {
    const transporter = creds && creds.pass ? getTransporter(creds) : getTransporter();
    await transporter.verify();
    const duration = Date.now() - startTime;
    return {
      success: true,
      message: `SMTP connection to ${creds?.host || currentConfig.host}:${creds?.port || currentConfig.port} verified successfully (${duration}ms)!`,
      latencyMs: duration
    };
  } catch (err) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      message: `SMTP verification failed: ${err.message || err}`,
      latencyMs: duration
    };
  }
}

// Load persistent queue from disk
function loadQueue() {
  try {
    if (fs.existsSync(QUEUE_FILE)) {
      const raw = fs.readFileSync(QUEUE_FILE, 'utf8');
      const items = JSON.parse(raw);
      return Array.isArray(items) ? items : [];
    }
  } catch (err) {
    console.error('[MailerEngine] Error loading mail queue:', err.message);
  }
  return [];
}

// Save persistent queue to disk
function saveQueue(queue) {
  try {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2), 'utf8');
  } catch (err) {
    console.error('[MailerEngine] Error saving mail queue:', err.message);
  }
}

// Append delivery audit log
function appendLog(logEntry) {
  try {
    let logs = [];
    if (fs.existsSync(LOGS_FILE)) {
      try {
        logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8')) || [];
      } catch {}
    }
    logs.unshift(logEntry);
    if (logs.length > 200) {
      logs = logs.slice(0, 200);
    }
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8');
  } catch (err) {
    console.error('[MailerEngine] Error writing audit log:', err.message);
  }
}

export function getLogs() {
  try {
    if (fs.existsSync(LOGS_FILE)) {
      return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8')) || [];
    }
  } catch {}
  return [];
}

export function getQueueStatus() {
  const queue = loadQueue();
  const pending = queue.filter(q => q.status === 'pending');
  const sending = queue.filter(q => q.status === 'sending');
  const failed = queue.filter(q => q.status === 'failed');

  return {
    engine: 'Nodemailer Pure SMTP Pool',
    host: currentConfig.host,
    port: currentConfig.port,
    user: currentConfig.user,
    configured: Boolean(currentConfig.pass),
    poolActive: Boolean(activeTransporter),
    totalQueued: queue.length,
    pendingCount: pending.length,
    sendingCount: sending.length,
    failedCount: failed.length,
    recentPending: pending.slice(0, 10)
  };
}

/**
 * Enqueue an email for reliable delivery with persistent disk backing
 */
export async function enqueueMail(mailOptions) {
  const { to, subject, body, text, html, senderEmail, senderName, smtp } = mailOptions;

  if (!to) {
    throw new Error('Recipient email (to) is required.');
  }

  const queue = loadQueue();
  const item = {
    id: `mail_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`,
    to,
    subject: subject || 'Origintra Exim Corporate Notification',
    text: body || text || '',
    html: html || undefined,
    fromEmail: senderEmail || currentConfig.fromEmail || currentConfig.user,
    fromName: senderName || currentConfig.fromName,
    smtpOverride: smtp && smtp.pass ? smtp : null,
    status: 'pending',
    attempts: 0,
    maxAttempts: 5,
    nextAttemptAt: Date.now(),
    createdAt: new Date().toISOString(),
    error: null
  };

  queue.push(item);
  saveQueue(queue);

  console.log(`[MailerEngine] Queued email ${item.id} -> ${to} ("${item.subject}")`);

  // Trigger processing immediately in the background
  triggerQueueWorker();

  return {
    success: true,
    queued: true,
    id: item.id,
    message: `Email queued for guaranteed delivery to ${to}`
  };
}

/**
 * Direct send attempt via pooled transporter
 */
export async function sendMailDirect(mailOptions) {
  const startTime = Date.now();
  const { to, subject, body, text, html, senderEmail, senderName, smtp } = mailOptions;

  if (!to) {
    throw new Error('Recipient email (to) is required.');
  }

  const transporter = smtp && smtp.pass ? getTransporter(smtp) : getTransporter();
  const fromName = senderName || currentConfig.fromName;
  const fromEmail = senderEmail || currentConfig.fromEmail || currentConfig.user;

  const mailPayload = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: subject || 'Origintra Exim Corporate Notification',
    text: body || text || '',
    html: html || undefined,
    replyTo: fromEmail,
    headers: {
      'X-Mailer': 'Origintra Exim Pure Nodemailer Delivery Engine v2.0',
      'X-Priority': '1 (Highest)',
      'Importance': 'High'
    }
  };

  const info = await transporter.sendMail(mailPayload);
  const duration = Date.now() - startTime;

  appendLog({
    id: `direct_${Date.now()}`,
    to,
    subject: mailPayload.subject,
    status: 'delivered',
    durationMs: duration,
    messageId: info.messageId,
    timestamp: new Date().toISOString()
  });

  return {
    success: true,
    message: `Email dispatched successfully to ${to} via Nodemailer (${duration}ms)`,
    durationMs: duration,
    messageId: info.messageId,
    method: `Nodemailer (${currentConfig.host}:${currentConfig.port})`
  };
}

/**
 * Background Queue Worker with Exponential Backoff
 */
const RETRY_DELAYS = [1000, 3000, 10000, 30000, 60000]; // 1s, 3s, 10s, 30s, 60s

async function processQueue() {
  if (queueProcessing) return;
  queueProcessing = true;

  try {
    const queue = loadQueue();
    const now = Date.now();
    const eligibleIndices = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'pending' && now >= (item.nextAttemptAt || 0)) {
        eligibleIndices.push(i);
      }
    }

    if (eligibleIndices.length === 0) {
      queueProcessing = false;
      return;
    }

    for (const idx of eligibleIndices) {
      const item = queue[idx];
      item.status = 'sending';
      item.attempts = (item.attempts || 0) + 1;
      saveQueue(queue);

      const startTime = Date.now();
      try {
        const transporter = item.smtpOverride ? getTransporter(item.smtpOverride) : getTransporter();
        const info = await transporter.sendMail({
          from: `"${item.fromName}" <${item.fromEmail}>`,
          to: item.to,
          subject: item.subject,
          text: item.text,
          html: item.html,
          replyTo: item.fromEmail,
          headers: {
            'X-Mailer': 'Origintra Exim Pure Nodemailer Resilient Queue v2.0',
            'X-Delivery-Attempt': String(item.attempts)
          }
        });

        const duration = Date.now() - startTime;
        item.status = 'delivered';
        item.deliveredAt = new Date().toISOString();
        item.durationMs = duration;
        item.messageId = info.messageId;
        item.error = null;

        console.log(`[MailerEngine] \x1b[32m✔ Delivered email ${item.id} to ${item.to} in ${duration}ms (Message ID: ${info.messageId})\x1b[0m`);

        appendLog({
          id: item.id,
          to: item.to,
          subject: item.subject,
          status: 'delivered',
          attempts: item.attempts,
          durationMs: duration,
          messageId: info.messageId,
          timestamp: item.deliveredAt
        });
      } catch (err) {
        const duration = Date.now() - startTime;
        item.error = err.message || String(err);
        console.error(`[MailerEngine] \x1b[31m✖ Attempt ${item.attempts} failed for ${item.id} (${item.to}): ${item.error}\x1b[0m`);

        if (item.attempts >= item.maxAttempts) {
          item.status = 'failed';
          item.failedAt = new Date().toISOString();
          appendLog({
            id: item.id,
            to: item.to,
            subject: item.subject,
            status: 'failed',
            attempts: item.attempts,
            error: item.error,
            timestamp: item.failedAt
          });
        } else {
          item.status = 'pending';
          const delay = RETRY_DELAYS[Math.min(item.attempts - 1, RETRY_DELAYS.length - 1)];
          item.nextAttemptAt = Date.now() + delay;
          console.log(`[MailerEngine] Scheduled retry #${item.attempts + 1} for ${item.id} in ${delay / 1000}s`);
        }
      }

      saveQueue(queue);
    }

    // Keep only last 100 delivered/failed items in queue file
    const cleanedQueue = loadQueue().filter(item => {
      if (item.status === 'pending' || item.status === 'sending') return true;
      const age = now - new Date(item.deliveredAt || item.failedAt || 0).getTime();
      return age < 24 * 60 * 60 * 1000; // retain 24 hours
    });
    saveQueue(cleanedQueue);

  } catch (outerErr) {
    console.error('[MailerEngine] Queue worker cycle error:', outerErr);
  } finally {
    queueProcessing = false;
  }
}

export function triggerQueueWorker() {
  setImmediate(processQueue);
}

// Start recurring worker loop (every 5 seconds)
export function startQueueWorker() {
  if (workerInterval) return;
  workerInterval = setInterval(processQueue, 5000);
  if (workerInterval.unref) {
    workerInterval.unref();
  }
  console.log('[MailerEngine] Persistent Nodemailer Queue Worker started (5s check interval).');
  // Run first cycle immediately
  setImmediate(processQueue);
}

export function stopQueueWorker() {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
  }
}

// Automatically start background queue worker
startQueueWorker();

export default {
  saveConfig,
  getConfig,
  getTransporter,
  verifySmtp,
  enqueueMail,
  sendMailDirect,
  getQueueStatus,
  getLogs,
  triggerQueueWorker,
  startQueueWorker,
  stopQueueWorker
};
