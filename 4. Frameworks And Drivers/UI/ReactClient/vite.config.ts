import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // Necesario para aceptar el Host del túnel de Cloudflare (evita 403 de Vite)
    allowedHosts: true,
    // El navegador llama a /api en el mismo origen (túnel) y Vite lo reenvía
    // al backend local (WSL2 expone localhost:5000 hacia Windows).
    proxy: {
      '/nw-api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Quita el prefijo: /nw-api/Foo -> http://localhost:5000/Foo
        rewrite: (ruta) => ruta.replace(/^\/nw-api/, ''),
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
