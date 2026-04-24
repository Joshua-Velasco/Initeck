import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/initeck-flota/iniadmin/api_php': {
        target: 'http://localhost:80',
        changeOrigin: true,
      }
    }
  }
})
