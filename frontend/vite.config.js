import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/login': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/signup': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/logout': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/artworks': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/artwork': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/make-glb': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/seller': { target: 'http://127.0.0.1:5000', changeOrigin: true },

    },
  },
});
