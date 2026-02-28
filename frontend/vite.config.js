import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
    '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true, credentials: true },
    '/login': { target: 'http://127.0.0.1:5000', changeOrigin: true, credentials: true },
    '/signup': { target: 'http://127.0.0.1:5000', changeOrigin: true, credentials: true },
    '/logout': { target: 'http://127.0.0.1:5000', changeOrigin: true, credentials: true },
    '/artworks': { target: 'http://127.0.0.1:5000', changeOrigin: true, credentials: true },
    '/artwork': { target: 'http://127.0.0.1:5000', changeOrigin: true, credentials: true },
    '/make-glb': { target: 'http://127.0.0.1:5000', changeOrigin: true, credentials: true },
    '/seller': { target: 'http://127.0.0.1:5000', changeOrigin: true, credentials: true },
    },
  },
});
