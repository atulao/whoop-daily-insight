import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      '/oauth-proxy': {
        target: 'https://api.prod.whoop.com',
        changeOrigin: true,
        rewrite: (path) => {
          const newPath = path.replace(/^\/oauth-proxy/, '');
          console.log(`Rewriting path: ${path} -> ${newPath}`);
          return newPath;
        },
        secure: false,
        headers: {
          'Origin': 'http://localhost:8080'
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
            
            // Log headers for debugging
            if (req.url?.includes('/developer')) {
              console.log('Request headers:', req.headers);
              console.log('Auth header:', req.headers.authorization ? 'Present' : 'Missing');
              console.log('Request URL:', req.url);
              console.log('Full target URL:', 'https://api.prod.whoop.com' + req.url.replace(/^\/oauth-proxy/, ''));
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from:', req.url, proxyRes.statusCode);
            
            // Enhanced response logging
            if (req.url?.includes('/developer')) {
              const chunks: Buffer[] = [];
              proxyRes.on('data', (chunk) => {
                chunks.push(chunk);
              });
              proxyRes.on('end', () => {
                try {
                  // Only attempt to log if we have successful responses
                  if (proxyRes.statusCode && proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
                    const body = Buffer.concat(chunks).toString('utf8');
                    console.log('Response body preview:', body.substring(0, 300) + (body.length > 300 ? '...' : ''));
                  }
                } catch (e) {
                  console.error('Error logging response body:', e);
                }
              });
            }
            
            // For debugging CORS issues
            if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
              console.log('Error response headers:', proxyRes.headers);
              console.log('Error URL:', req.url);
              console.log('Error status message:', proxyRes.statusMessage);
            }
          });
        }
      },
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger({
      prefix: "div",
      devServerName: "localhost",
      devServerPort: 8080,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
