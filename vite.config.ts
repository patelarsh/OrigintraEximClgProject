import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { apiPlugin } from './server/apiPlugin';

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
  plugins: [react(), apiPlugin(), inlineCssPlugin()],
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
  }
});
