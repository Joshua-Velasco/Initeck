// Central configuration for the API URL
// This ensures that all components use the same base path and simplifies debugging

const isProduction = import.meta.env.PROD;

// In production, we assume the API is at /api_php/index.php relative to the root
// In development, we use the .env variable or a local fallback
export const API_URL = import.meta.env.VITE_API_URL || 
  (isProduction 
    ? '/api_php/index.php' 
    : 'http://localhost/initeck-flota/INIBAY/api_php/index.php');

console.log('API_URL initialized as:', API_URL);
