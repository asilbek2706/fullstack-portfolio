import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ command, isPreview }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@admin': path.resolve(__dirname, './admin'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    proxy:
      command === 'serve' && !isPreview
        ? {
            '/api': {
              target: 'http://localhost:8080',
              changeOrigin: true,
              secure: true,
              cookieDomainRewrite: '',
              configure(proxy) {
                proxy.on('proxyRes', (response) => {
                  const cookies = response.headers['set-cookie'];

                  if (!cookies) return;

                  response.headers['set-cookie'] = cookies.map((cookie) =>
                    cookie
                      .replace(/;\s*Secure\b/gi, '')
                      .replace(/;\s*SameSite=None\b/gi, '; SameSite=Lax'),
                  );
                });
              },
            },
          }
        : undefined,
  },
}));
