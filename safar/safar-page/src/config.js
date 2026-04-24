const hostname = window.location.hostname;
const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

// SAFAR API CONFIGURATION
export const API_URL = isLocal
  ? "http://localhost/initeck-flota/safar/api"
  : "https://safar.initeck.com.mx/api";

export const UPLOADS_URL = isLocal
  ? "http://localhost/initeck-flota/safar/api/uploads"
  : "https://safar.initeck.com.mx/api/uploads";

// STRIPE CONFIGURATION
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// HELPER FOR ASSETS
export const getAssetUrl = (path) => `${UPLOADS_URL}/${path}`;

console.log(`🚀 Safar Web Config:`, {
  environment: isLocal ? 'LOCAL' : 'PRODUCTION',
  apiUrl: API_URL,
  uploadsUrl: UPLOADS_URL
});
