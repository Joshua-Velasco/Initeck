/**
 * Ejemplos de cómo usar las utilidades de API
 * Este archivo sirve como guía para desarrolladores
 */

import { apiFetch, uploadFile, getAssetUrl, handleApiResponse } from './api.js';

// Ejemplo 1: GET request simple
export const fetchEmpleados = async () => {
  try {
    const response = await apiFetch('empleados/empleados.php');
    const data = await handleApiResponse(response);
    return data;
  } catch (error) {
    console.error('Error al obtener empleados:', error.message);
    throw error;
  }
};

// Ejemplo 2: POST request con datos
export const createEmpleado = async (empleadoData) => {
  try {
    const response = await apiFetch('empleados/empleados.php', {
      method: 'POST',
      body: JSON.stringify(empleadoData)
    });
    const data = await handleApiResponse(response);
    return data;
  } catch (error) {
    console.error('Error al crear empleado:', error.message);
    throw error;
  }
};

// Ejemplo 3: PUT request para actualizar
export const updateEmpleado = async (id, empleadoData) => {
  try {
    const response = await apiFetch(`empleados/empleados.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(empleadoData)
    });
    const data = await handleApiResponse(response);
    return data;
  } catch (error) {
    console.error('Error al actualizar empleado:', error.message);
    throw error;
  }
};

// Ejemplo 4: DELETE request
export const deleteEmpleado = async (id) => {
  try {
    const response = await apiFetch(`empleados/empleados.php?id=${id}`, {
      method: 'DELETE'
    });
    const data = await handleApiResponse(response);
    return data;
  } catch (error) {
    console.error('Error al eliminar empleado:', error.message);
    throw error;
  }
};

// Ejemplo 5: Subida de archivos
export const subirArchivo = async (file, additionalData = {}) => {
  const formData = new FormData();
  formData.append('archivo', file);
  
  // Agregar datos adicionales
  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key]);
  });

  try {
    const response = await uploadFile('uploads/subir_archivo.php', formData);
    const data = await handleApiResponse(response);
    return data;
  } catch (error) {
    console.error('Error al subir archivo:', error.message);
    throw error;
  }
};

// Ejemplo 6: Obtener URL de imagen
export const getImagenUrl = (imageName) => {
  return getAssetUrl(imageName);
};

// Ejemplo 7: Request con headers personalizados
export const fetchConAuth = async (endpoint, token) => {
  try {
    const response = await apiFetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Custom-Header': 'valor-personalizado'
      }
    });
    const data = await handleApiResponse(response);
    return data;
  } catch (error) {
    console.error('Error en request con autenticación:', error.message);
    throw error;
  }
};

// Ejemplo 8: Manejo de errores específicos
export const fetchConErrorHandling = async () => {
  try {
    const response = await apiFetch('endpoint/que/puede/fallar.php');
    const data = await handleApiResponse(response, 'Error personalizado para este endpoint');
    return data;
  } catch (error) {
    // Manejo específico de errores
    if (error.message.includes('permisos')) {
      // Redirigir a login o mostrar modal de permisos
      console.warn('Usuario sin permisos suficientes');
    } else if (error.message.includes('conexión')) {
      // Mostrar notificación de problemas de red
      console.warn('Problemas de conexión detectados');
    }
    
    throw error;
  }
};
