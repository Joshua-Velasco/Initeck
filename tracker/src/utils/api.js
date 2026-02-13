/**
 * Utilidades de API para manejo dinámico de URLs
 * Centraliza la lógica de detección de entorno y construcción de URLs
 */

import {
  BASE_API,
  buildApiUrl,
  buildUploadUrl,
  isLocalEnvironment,
  AUTH_SESSION_KEEPALIVE_URL,
  AUTH_CHECK_SESSION_URL,
  AUTH_LOGIN_URL
} from '../config.js';
import { compressImage } from './imageOptimizer.js';

/**
 * Función especializada para requests de autenticación
 * @param {string} endpoint - Endpoint de auth (session_keepalive, check_session, login)
 * @param {Object} options - Opciones de fetch
 * @returns {Promise} Response del fetch
 */
export const authFetch = async (endpoint, options = {}) => {
  let url;

  // Determinar la URL correcta según el endpoint
  switch (endpoint) {
    case 'session_keepalive':
      url = AUTH_SESSION_KEEPALIVE_URL;
      break;
    case 'check_session':
      url = AUTH_CHECK_SESSION_URL;
      break;
    case 'login':
      url = AUTH_LOGIN_URL;
      break;
    default:
      throw new Error(`Endpoint de autenticación no reconocido: ${endpoint}`);
  }

  // Agregar headers por defecto si no se especifican
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    // credentials: 'include', // Temporalmente desactivado para CORS
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);

    // Log para debugging en desarrollo
    if (isLocalEnvironment()) {
      console.log(`🔐 Auth Request: ${options.method || 'GET'} ${url}`, {
        status: response.status,
        ok: response.ok
      });
    }

    return response;
  } catch (error) {
    console.error(`❌ Auth Error: ${options.method || 'GET'} ${url}`, error);
    throw error;
  }
};

/**
 * Función para hacer fetch con manejo automático de entorno
 * @param {string} endpoint - Endpoint de la API (opcional si se usa URL completa)
 * @param {Object} options - Opciones de fetch
 * @returns {Promise} Response del fetch
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : buildApiUrl(endpoint);

  // Agregar headers por defecto si no se especifican
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    // credentials: 'include', // Temporalmente desactivado para CORS
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);

    // Log para debugging en desarrollo
    if (isLocalEnvironment()) {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`, {
        status: response.status,
        ok: response.ok
      });
    }

    return response;
  } catch (error) {
    console.error(`❌ API Error: ${options.method || 'GET'} ${url}`, error);
    throw error;
  }
};

/**
 * Función para subir archivos
 * @param {string} endpoint - Endpoint para subir archivos
 * @param {FormData} formData - FormData con los archivos
 * @returns {Promise} Response del fetch
 */
export const uploadFile = async (endpoint, formData) => {
  const url = buildApiUrl(endpoint);

  // 🔄 AUTO-COMPRESIÓN DE IMÁGENES
  // Iteramos sobre el FormData original para buscar imágenes y comprimirlas
  const processedFormData = new FormData();
  
  // Nota: formData.entries() puede no estar soportado en navegadores muy viejos, 
  // pero para Capacitor/Modern Web está bien.
  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.type.startsWith('image/')) {
      try {
        const compressedFile = await compressImage(value, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920
        });
        processedFormData.append(key, compressedFile, value.name);
      } catch (err) {
        console.warn('Fallo compresión automática, usando original:', err);
        processedFormData.append(key, value);
      }
    } else {
      processedFormData.append(key, value);
    }
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: processedFormData,
      credentials: 'include'
      // No Content-Type para que el navegador lo establezca automáticamente con boundary
    });

    if (isLocalEnvironment()) {
      console.log(`📤 File Upload: POST ${url}`, {
        status: response.status,
        ok: response.ok
      });
    }

    return response;
  } catch (error) {
    console.error(`❌ Upload Error: POST ${url}`, error);
    throw error;
  }
};

/**
 * Construye URL para imágenes y archivos estáticos
 * @param {string} path - Ruta del archivo (opcional)
 * @returns {string} URL completa del archivo
 */
export const getAssetUrl = (path = '') => {
  return buildUploadUrl(path);
};

/**
 * Verifica si la respuesta fue exitosa
 * @param {Response} response - Response de fetch
 * @returns {boolean} True si la respuesta es exitosa
 */
export const isResponseOk = (response) => {
  return response.ok && response.status >= 200 && response.status < 300;
};

/**
 * Maneja errores de API de forma estandarizada
 * @param {Response} response - Response de fetch
 * @param {string} customMessage - Mensaje personalizado (opcional)
 * @returns {Promise} Datos de la respuesta o error
 */
export const handleApiResponse = async (response, customMessage = '') => {
  try {
    const data = await response.json();

    if (!isResponseOk(response)) {
      const errorMessage = data.message || customMessage || 'Error en la solicitud';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Error al procesar la respuesta del servidor');
  }
};

/**
 * Obtiene información del entorno actual
 * @returns {Object} Información del entorno
 */
export const getEnvironmentInfo = () => {
  return {
    isLocal: isLocalEnvironment(),
    isProduction: !isLocalEnvironment(),
    baseUrl: BASE_API,
    hostname: window.location.hostname,
    pathname: window.location.pathname
  };
};


/**
 * Convierte un Data URL (Base64) a Blob para envío en FormData
 * @param {string} dataURL - El string base64 completo
 * @returns {Blob} El archivo como Blob
 */
export const dataURLtoBlob = (dataURL) => {
  if (!dataURL) return null;

  // Si ya es un Blob o File (capturado por <input type="file">), retornarlo directamente
  if (dataURL instanceof Blob || dataURL instanceof File) {
    return dataURL;
  }

  // Si no es un string, no podemos procesarlo
  if (typeof dataURL !== 'string') return null;

  if (!dataURL.includes(',')) return null;

  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// Export default para compatibilidad
export default {
  apiFetch,
  authFetch,
  uploadFile,
  dataURLtoBlob,
  isResponseOk,
  handleApiResponse,
  getEnvironmentInfo
};