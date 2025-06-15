import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'https://localhost:7214',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});