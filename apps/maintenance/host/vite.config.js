import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5000,
    strictPort: true,
  },
  plugins: [
    react(),
    federation({
      name: 'host',
      remotes: {
        dashboard: 'http://localhost:5001/assets/remoteEntry.js',
        units: 'http://localhost:5002/assets/remoteEntry.js',
        maintenance: 'http://localhost:5003/assets/remoteEntry.js',
        personnel: 'http://localhost:5004/assets/remoteEntry.js',
        fleetMonitor: 'http://localhost:5005/assets/remoteEntry.js',
        trips: 'http://localhost:5006/assets/remoteEntry.js',
        finances: 'http://localhost:5007/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'react-router-dom']
    })
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
})
