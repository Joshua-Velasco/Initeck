/**
 * Format a number as currency (Mexican Peso)
 * @param {number|string} value - The value to format
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} Formatted currency string
 */
export const f = (value, currency = '$') => {
  const num = parseFloat(value) || 0;
  return `${currency}${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * Format a number with thousand separators
 * @param {number|string} value - The value to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (value) => {
  const num = parseFloat(value) || 0;
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Parse a formatted currency string back to a number
 * @param {string} formattedValue - The formatted currency string
 * @returns {number} Parsed number
 */
export const parseCurrency = (formattedValue) => {
  if (typeof formattedValue !== 'string') return parseFloat(formattedValue) || 0;
  return parseFloat(formattedValue.replace(/[$,]/g, '')) || 0;
};
