import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// API base is proxied in dev so the SPA and backend can run side by side.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
