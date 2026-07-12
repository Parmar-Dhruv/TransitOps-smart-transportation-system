import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(new URL('.', import.meta.url).pathname, "./src"),
    },
  },
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:5002',
        changeOrigin: true
      },
      '/vehicles': {
        target: 'http://localhost:5002',
        changeOrigin: true
      },
      '/drivers': {
        target: 'http://localhost:5002',
        changeOrigin: true
      },
      '/trips': {
        target: 'http://localhost:5002',
        changeOrigin: true
      },
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true
      }
    }
  }
})
