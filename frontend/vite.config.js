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
    host: '0.0.0.0',  // keep this
    allowedHosts: ['rachal-unperfidious-arnulfo.ngrok-free.dev'],
    historyApiFallback: true,
    proxy: {
      '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true, credentials: true },
      '/login': { target: 'http://127.0.0.1:5000', changeOrigin: true, credentials: true },
      '/signup': { target: 'http://127.0.0.1:5000', changeOrigin: true, credentials: true },
      '/logout': { target: 'http://127.0.0.1:5000', changeOrigin: true, credentials: true },
      '/artworks': { target: 'http://127.0.0.1:5000', changeOrigin: true, credentials: true },
      '/artwork': { target: 'http://127.0.0.1:5000', changeOrigin: true, credentials: true },
      '/make-glb': { target: 'http://127.0.0.1:5000', changeOrigin: true, credentials: true },
      '/seller/artworks': { target: 'http://127.0.0.1:5000', changeOrigin: true, credentials: true },
    },
    hmr: {
      protocol: 'ws',
      host: 'rachal-unperfidious-arnulfo.ngrok-free.app',
      port: 5173,
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(css)$/i.test(name ?? '')) {
            return 'css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    cssCodeSplit: true,
    reportCompressedSize: true,
  },
});