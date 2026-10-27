import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    // Permite cualquier host para el túnel de Cloudflare (evita 403 Forbidden en Vite)
    allowedHosts: true,
    // Proxy reverso: llamadas a /nw-api se redirigen al backend en localhost:5000
    proxy: {
      '/nw-api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (ruta) => ruta.replace(/^\/nw-api/, ''),
      },
    },
  },
});
