import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': root,
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});