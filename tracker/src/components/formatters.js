// Utilidades para formateo de números y fechas

/**
 * Formatea un número agregando comas cada tres dígitos
 * @param {string|number} value - Valor a formatear
 * @returns {string} - Número formateado con comas
 */
export const formatNumberWithCommas = (value) => {
  // Si el valor está vacío o es nulo, devolver cadena vacía
  if (!value || value === '') return '';
  
  // Remover caracteres no numéricos excepto comas y puntos (para decimales)
  const cleanValue = String(value).replace(/[^\d,.]/g, '');
  
  // Si después de limpiar no hay dígitos, devolver cadena vacía
  if (!cleanValue.match(/\d/)) return '';
  
  // Separar parte entera y decimal
  const parts = cleanValue.split('.');
  let integerPart = parts[0] || '';
  let decimalPart = parts[1] || '';
  
  // Remover comas existentes de la parte entera
  integerPart = integerPart.replace(/,/g, '');
  
  // Formatear la parte entera con comas cada tres dígitos
  if (integerPart) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  // Limitar decimales a 2 dígitos para evitar problemas
  if (decimalPart) {
    decimalPart = decimalPart.substring(0, 2);
  }
  
  // Unir partes con punto decimal si hay decimales
  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
};

/**
 * Limpia un número formateado para obtener solo el valor numérico
 * @param {string} formattedValue - Valor formateado con comas
 * @returns {string} - Valor numérico sin comas
 */
export const cleanFormattedNumber = (formattedValue) => {
  // Remover comas pero mantener el punto decimal
  return String(formattedValue).replace(/,/g, '');
};

/**
 * Maneja el cambio en un input numérico formateado
 * @param {Function} setter - Función para actualizar el estado
 * @param {string} fieldName - Nombre del campo
 * @param {Event} e - Evento del input
 */
export const handleNumericInputChange = (setter, fieldName, e) => {
  const formattedValue = formatNumberWithCommas(e.target.value);
  setter(prev => ({ ...prev, [fieldName]: formattedValue }));
};

/**
 * Formatea un número para mostrarlo con comas y decimales
 * @param {number} value - Valor numérico
 * @param {number} decimals - Número de decimales (default: 2)
 * @returns {string} - Número formateado
 */
export const formatCurrency = (value, decimals = 2) => {
  const num = parseFloat(value) || 0;
  return num.toLocaleString('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Formatea kilometraje con comas
 * @param {number} value - Valor del kilometraje
 * @returns {string} - Kilometraje formateado
 */
export const formatKilometraje = (value) => {
  const num = parseFloat(value) || 0;
  return num.toLocaleString('es-MX');
};

/**
 * Maneja el cambio en un input numérico con decimales y comas
 * @param {string} value - Valor actual del input
 * @returns {string} - Valor formateado para mostrar
 */
export const handleDecimalInput = (value) => {
  // Si está vacío, devolver vacío (esto permite empezar con punto decimal)
  if (!value || value === '') return '';
  
  // Permitir solo números, comas y punto decimal
  let cleanValue = String(value).replace(/[^\d,.]/g, '');
  
  // Caso especial: si empieza con punto decimal, añadir 0 al inicio
  if (cleanValue.startsWith('.')) {
    cleanValue = '0' + cleanValue;
  }
  
  // Prevenir múltiples puntos decimales
  const parts = cleanValue.split('.');
  if (parts.length > 2) {
    // Si hay múltiples puntos, mantener solo el primero y los siguientes dígitos
    cleanValue = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Separar parte entera y decimal
  const finalParts = cleanValue.split('.');
  let integerPart = finalParts[0] || '';
  let decimalPart = finalParts[1] || '';
  
  // Remover comas de la parte entera para formatear correctamente
  integerPart = integerPart.replace(/,/g, '');
  
  // Formatear la parte entera con comas
  if (integerPart) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  // Limitar decimales a 2 dígitos
  if (decimalPart) {
    decimalPart = decimalPart.substring(0, 2);
  }
  
  // Unir las partes
  const result = decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  
  return result;
};
