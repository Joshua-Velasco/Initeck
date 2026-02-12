import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isCapacitor = process.env.VITE_IS_CAPACITOR === 'true';
  
  // Base path logic:
  // - Capacitor: './' (relative)
  // - Web Production: '/uber/' (subdirectory)
  // - Web Dev: '/' (root)
  let base = '/';
  if (isCapacitor) {
    base = './';
  } else if (mode === 'production') {
    base = '/uber/';
  }

  return {
    plugins: [react()],
    base: base,
    server: {
      proxy: {
        "/initeck-flota": {
          target: "http://localhost",
          changeOrigin: true,
          secure: false,
        },
        "/Inimovil": {
          target: "http://localhost",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      target: 'es2015',
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        external: isCapacitor ? [] : [
          '@capacitor/geolocation',
          '@capacitor/core',
          '@capacitor-community/background-geolocation'
        ]
      }
    },
    optimizeDeps: {
      exclude: isCapacitor ? [] : [
        '@capacitor/geolocation',
        '@capacitor/core', 
        '@capacitor-community/background-geolocation'
      ]
    }
  };
});
