/**
 * Utilidades para manejo de fechas operacionales (Regla de las 4 AM)
 */

/**
 * Calcula el rango de fechas operacional basado en una fecha de referencia y un tipo de vista.
 * Sigue la regla de que el día laboral termina a las 3:59:59 AM del día siguiente.
 * 
 * @param {Date|string} dateInput Fecha de referencia
 * @param {string} viewType 'day' | 'week' | 'month' | 'year' (o sus versiones en español)
 * @returns { { start: Date, end: Date } }
 */
export const getOperationalDateRange = (dateInput = new Date(), viewType = 'week') => {
  const ref = new Date(dateInput);
  // Normalizar a mediodía para evitar problemas de zona horaria al cambiar días
  ref.setHours(12, 0, 0, 0);
  
  const start = new Date(ref);
  const end = new Date(ref);

  // Normalizar viewType a inglés para consistencia interna
  const type = viewType.toLowerCase();
  const isDay = type === 'day' || type === 'dia';
  const isWeek = type === 'week' || type === 'semana';
  const isMonth = type === 'month' || type === 'mes';
  const isYear = type === 'year' || type === 'anio';

  if (isDay) {
    start.setHours(4, 0, 0, 0);
    end.setDate(start.getDate() + 1);
    end.setHours(3, 59, 59, 999);
  } 
  else if (isWeek) {
    const day = ref.getDay(); // 0: Dom, 1: Lun, 2: Mar, ...
    
    // Lógica Estándar: La semana comienza el Lunes.
    // Lun(1)->0, Mar(2)->1, ..., Dom(0)->6
    const daysToSubtract = day === 0 ? 6 : day - 1;
    
    start.setDate(ref.getDate() - daysToSubtract);
    start.setHours(4, 0, 0, 0);
    
    // 7 días exactos: Termina el siguiente Lunes a las 03:59:59
    end.setTime(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
  } 
  else if (isMonth) {
    start.setDate(1);
    start.setHours(4, 0, 0, 0);
    const nextMonthBoundary = new Date(start);
    nextMonthBoundary.setMonth(start.getMonth() + 1);
    nextMonthBoundary.setHours(3, 59, 59, 999);
    end.setTime(nextMonthBoundary.getTime());
  } 
  else if (isYear) {
    start.setMonth(0, 1);
    start.setHours(4, 0, 0, 0);
    const nextYearBoundary = new Date(start);
    nextYearBoundary.setFullYear(start.getFullYear() + 1);
    nextYearBoundary.setHours(3, 59, 59, 999);
    end.setTime(nextYearBoundary.getTime());
  }

  return { start, end };
};

/**
 * Formatea una fecha para la API (YYYY-MM-DD)
 * @param {Date} date 
 * @returns {string}
 */
export const formatDateForApi = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Obtiene el número de semana de una fecha
 * @param {Date} d 
 * @returns {number}
 */
export const getWeekNumber = (d) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};
