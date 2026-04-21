import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // All /api requests → backend Express server
      '/api': {
        target: 'http://172.16.0.36:5000',
        changeOrigin: true,
      },
      // Ad media files served from /uploads on the backend
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    }
  }
})