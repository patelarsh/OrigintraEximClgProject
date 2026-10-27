import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function nodemailerPlugin(): Plugin {
  return {
    name: 'vite-plugin-nodemailer',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        // Handle POST /api/send-mail
        if (req.method === 'POST' && (url === '/api/send-mail')) {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              if (!data.to) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Recipient email (to) is required.' }));
                return;
              }

              const mailerModule = await import('./server/mailerEngine.js');
              const mailer = mailerModule.default || mailerModule;

              const isUrgent = data.sync === true || (data.subject && data.subject.includes('[Test Verification]'));
              if (isUrgent) {
                try {
                  const result = await mailer.sendMailDirect(data);
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(result));
                  return;
                } catch (directErr: any) {
                  const queued = await mailer.enqueueMail(data);
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: true,
                    queued: true,
                    id: queued.id,
                    message: `Email queued for guaranteed delivery: ${directErr.message}`
                  }));
                  return;
                }
              }

              const result = await mailer.enqueueMail(data);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
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

        // Handle POST /api/verify-smtp
        if (req.method === 'POST' && (url === '/api/verify-smtp')) {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const mailerModule = await import('./server/mailerEngine.js');
              const mailer = mailerModule.default || mailerModule;

              const result = await mailer.verifySmtp(data);
              res.statusCode = result.success ? 200 : 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
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

        // Handle POST /api/save-smtp
        if (req.method === 'POST' && (url === '/api/save-smtp')) {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const mailerModule = await import('./server/mailerEngine.js');
              const mailer = mailerModule.default || mailerModule;

              const result = mailer.saveConfig(data);
              res.statusCode = result.success ? 200 : 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                message: `Failed to save configuration: ${err.message || err}`
              }));
            }
          });
          return;
        }

        // Handle GET /api/mail-queue & /api/mail-logs
        if (req.method === 'GET' && url === '/api/mail-queue') {
          const mailerModule = await import('./server/mailerEngine.js');
          const mailer = mailerModule.default || mailerModule;
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(mailer.getQueueStatus()));
          return;
        }

        if (req.method === 'GET' && url === '/api/mail-logs') {
          const mailerModule = await import('./server/mailerEngine.js');
          const mailer = mailerModule.default || mailerModule;
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(mailer.getLogs()));
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
