import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function nodemailerPlugin(): Plugin {
  return {
    name: 'vite-plugin-nodemailer',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === 'POST' && (req.url === '/api/send-mail' || req.url === '/api/send-mail.php')) {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const { to, subject, body: bodyText, html, smtp, senderEmail, senderName } = data;
              
              if (!to) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Recipient email (to) is required.' }));
                return;
              }

              const nodemailerModule = await import('nodemailer');
              const nodemailer = nodemailerModule.default || nodemailerModule;
              
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
                tls: {
                  rejectUnauthorized: false
                }
              });

              const info = await transporter.sendMail({
                from: `"${fromName}" <${fromEmail}>`,
                to,
                subject: subject || 'Origintra Exim Corporate Notification',
                text: bodyText || '',
                html: html || undefined
              });

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                message: `Email dispatched successfully to ${to} via Nodemailer`,
                method: `Nodemailer (${host}:${port})`,
                messageId: info.messageId
              }));
            } catch (err: any) {
              console.error('[Nodemailer Dev Plugin Error]:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                message: `Nodemailer delivery error: ${err.message || err}`
              }));
            }
          });
          return;
        }

        if (req.method === 'POST' && req.url === '/api/verify-smtp') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const { host, port, secure, user, pass } = data;

              const nodemailerModule = await import('nodemailer');
              const nodemailer = nodemailerModule.default || nodemailerModule;

              const transporter = nodemailer.createTransport({
                host: host || 'smtp.hostinger.com',
                port: Number(port) || 465,
                secure: secure !== undefined ? Boolean(secure) : (Number(port) === 465),
                auth: { user, pass },
                tls: { rejectUnauthorized: false }
              });

              await transporter.verify();

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                message: `SMTP connection to ${host}:${port} successfully verified!`
              }));
            } catch (err: any) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                message: `SMTP verification failed: ${err.message || err}`
              }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

function inlineCssPlugin() {
  return {
    name: 'inline-css-plugin',
    enforce: 'post' as const,
    transformIndexHtml(html: string, ctx: any) {
      if (!ctx.bundle) return html;
      let inlinedHtml = html;
      for (const [fileName, chunk] of Object.entries(ctx.bundle)) {
        if (fileName.endsWith('.css') && (chunk as any).source) {
          const cssCode = (chunk as any).source.toString();
          // Escape any </style> in the css if needed, though rare
          const safeCss = cssCode.replace(/<\/style>/gi, '<\\/style>');
          const linkRegex = new RegExp(`<link[^>]*href=["'][^"']*${fileName}["'][^>]*>`, 'g');
          if (linkRegex.test(inlinedHtml)) {
            inlinedHtml = inlinedHtml.replace(linkRegex, `<style>${safeCss}</style>`);
          } else {
            inlinedHtml = inlinedHtml.replace('</head>', `<style>${safeCss}</style></head>`);
          }
        }
      }
      return inlinedHtml;
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), inlineCssPlugin(), nodemailerPlugin()],
  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/three')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/canvas-confetti')) {
            return 'vendor-confetti';
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
