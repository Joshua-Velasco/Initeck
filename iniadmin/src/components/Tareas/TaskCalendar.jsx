import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';

export default function TaskCalendar({ fechaInicio, fechaFin, onChange }) {
  // Use today if no date is provided
  const baseDate = fechaInicio ? new Date(fechaInicio + 'T12:00:00Z') : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));

  const handlePrev = (e) => {
    e.preventDefault();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const handleNext = (e) => {
    e.preventDefault();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  // Format YYYY-MM-DD
  const formatObj = (d) => {
     return [
       d.getFullYear(),
       String(d.getMonth() + 1).padStart(2, '0'),
       String(d.getDate()).padStart(2, '0')
     ].join('-');
  };

  const strInicio = fechaInicio || null;
  const strFin = fechaFin || null;

  const handleDayClick = (e, day) => {
    e.preventDefault();
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const clickedStr = formatObj(clickedDate);

    // Logic for range selection
    if (!strInicio || (strInicio && strFin)) {
      // Start fresh range
      onChange({ inicio: clickedStr, fin: '' });
    } else {
      // Second click
      // If clicked date is before start date, restart the range backwards
      const sDate = new Date(strInicio + 'T12:00:00Z');
      if (clickedDate < sDate) {
        onChange({ inicio: clickedStr, fin: strInicio });
      } else {
        onChange({ inicio: strInicio, fin: clickedStr });
      }
    }
  };

  const renderCells = () => {
    const cells = [];
    const weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];
    
    // Header
    weekDays.forEach(w => {
      cells.push(
        <div key={`th-${w}`} style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textAlign: 'center', marginBottom: 8 }}>
          {w}
        </div>
      );
    });

    // Blanks
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`blank-${i}`} />);
    }

    // Days
    const todayStr = formatObj(new Date());

    for (let d = 1; d <= daysInMonth; d++) {
      const currentCellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
      const strCell = formatObj(currentCellDate);
      
      const isToday = strCell === todayStr;
      
      // Determine selection status
      const isStart = strCell === strInicio;
      const isEnd = strCell === strFin;
      let inRange = false;
      
      if (strInicio && strFin) {
        const s = new Date(strInicio + 'T12:00:00Z');
        const f = new Date(strFin + 'T12:00:00Z');
        if (currentCellDate > s && currentCellDate < f) {
          inRange = true;
        }
      }

      // If it's a single day selection (no end date yet), highlight just the start
      const isSelected = isStart || isEnd;

      let bg = 'transparent';
      let color = 'var(--gray-700)';
      let borderRad = '6px';
      
      if (isSelected) {
        bg = 'var(--brand)';
        color = 'white';
        if (isStart && isEnd) {
          borderRad = '6px';
        } else if (isStart && strFin) {
          borderRad = '6px 0 0 6px';
        } else if (isEnd && strInicio) {
          borderRad = '0 6px 6px 0';
        } else {
          borderRad = '6px'; // Single
        }
      } else if (inRange) {
        bg = 'var(--red-100)';
        color = 'var(--brand)';
        borderRad = '0';
      } else if (isToday) {
        color = 'var(--brand)';
        bg = 'var(--gray-100)';
      }

      cells.push(
        <button
          key={`day-${d}`}
          onClick={(e) => handleDayClick(e, d)}
          style={{
            height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: isSelected || isToday ? 700 : 500,
            background: bg, color: color, cursor: 'pointer', border: 'none',
            outline: 'none', borderRadius: borderRad, transition: 'all 0.1s',
            boxShadow: isStart && !strFin ? '0 0 0 2px var(--red-200)' : 'none'
          }}
          onMouseEnter={e => {
            if (!isSelected && !inRange) e.currentTarget.style.background = 'var(--gray-200)';
          }}
          onMouseLeave={e => {
            if (!isSelected && !inRange) e.currentTarget.style.background = isToday ? 'var(--gray-100)' : 'transparent';
          }}
        >
          {d}
        </button>
      );
    }
    
    return cells;
  };

  const monthName = currentMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  return (
    <div style={{ background: 'white', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', padding: 16, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={handlePrev} type="button" style={{ width: 28, height: 28, border: 'none', background: 'var(--gray-100)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gray-600)' }}>
          <ChevronLeft size={16} />
        </button>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 6 }}>
          <CalIcon size={14} color="var(--brand)" />
          {monthName}
        </div>
        <button onClick={handleNext} type="button" style={{ width: 28, height: 28, border: 'none', background: 'var(--gray-100)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gray-600)' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 0' }}>
        {renderCells()}
      </div>
      
      {/* Footer Info */}
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--gray-100)', fontSize: 11, color: 'var(--gray-500)', textAlign: 'center' }}>
        {!strInicio ? 'Selecciona una fecha de inicio' : !strFin ? '✅ Ahora selecciona fecha de término (o la misma para 1 día)' : 'Rango seleccionado'}
      </div>
    </div>
  );
}
