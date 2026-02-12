import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

const DateContext = createContext();

/**
 * Proveedor de contexto para manejar la fecha y tipo de vista globalmente.
 * Sincroniza el estado con los parámetros de búsqueda de la URL (?date=...&view=...).
 */
export const DateProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Helper para obtener fecha inicial
  const getInitialDate = () => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      try {
        const d = new Date(dateParam + 'T12:00:00');
        if (!isNaN(d.getTime())) return d;
      } catch (e) {
        console.error("Error parsing date from URL", e);
      }
    }
    return new Date();
  };

  // Helper para obtener tipo de vista inicial
  const getInitialView = () => {
    const viewParam = searchParams.get('view');
    const validViews = ['day', 'week', 'month', 'year', 'dia', 'semana', 'mes', 'anio'];
    if (viewParam && validViews.includes(viewParam.toLowerCase())) {
      return viewParam.toLowerCase();
    }
    return 'week';
  };

  const [date, setDate] = useState(getInitialDate());
  const [view, setView] = useState(getInitialView());

  // Sincronizar estado local con la URL cuando cambia
  useEffect(() => {
    const dateStr = date.toISOString().split('T')[0];
    const currentParams = Object.fromEntries(searchParams.entries());
    
    if (currentParams.date !== dateStr || currentParams.view !== view) {
      setSearchParams({
        ...currentParams,
        date: dateStr,
        view: view
      }, { replace: true });
    }
  }, [date, view, setSearchParams, searchParams]);

  // Manejar cambios en la URL (ej: botón atrás del navegador)
  useEffect(() => {
    const dateParam = searchParams.get('date');
    const viewParam = searchParams.get('view');
    
    if (dateParam) {
      const newDate = new Date(dateParam + 'T12:00:00');
      if (!isNaN(newDate.getTime()) && newDate.toISOString().split('T')[0] !== date.toISOString().split('T')[0]) {
        setDate(newDate);
      }
    }
    
    if (viewParam && viewParam !== view) {
      setView(viewParam);
    }
  }, [searchParams]);

  const value = {
    date,
    setDate,
    view,
    setView
  };

  return (
    <DateContext.Provider value={value}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useDate debe usarse dentro de un DateProvider');
  }
  return context;
};
