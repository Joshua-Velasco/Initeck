import React, { useState } from 'react';
import './TripsCalendar.css';

const TripsCalendar = ({ trips, onTripSelect, selectedTrip }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper to get start of the week (Sunday)
  const getStartOfWeek = (date) => {
    const newDate = new Date(date);
    const day = newDate.getDay();
    newDate.setDate(newDate.getDate() - day);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const nextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const today = () => setCurrentDate(new Date());

  // Format month name
  const monthName = currentDate.toLocaleString('es', { month: 'long', year: 'numeric' });

  // Group trips by date string "YYYY-MM-DD"
  const tripsByDate = {};
  trips.forEach(trip => {
    const d = new Date(trip.FechaProgramadaInicio);
    const dateStr = d.toISOString().split('T')[0];
    if (!tripsByDate[dateStr]) {
      tripsByDate[dateStr] = [];
    }
    tripsByDate[dateStr].push(trip);
  });

  return (
    <div className="trips-calendar-container">
      <div className="calendar-header">
        <h3 className="calendar-month-title">{monthName}</h3>
        <div className="calendar-nav">
          <button onClick={prevWeek}>&lt;</button>
          <button onClick={nextWeek}>&gt;</button>
        </div>
      </div>

      <div className="calendar-grid">
        {weekDays.map((date, idx) => {
          const dateStr = date.toISOString().split('T')[0];
          
          const todayDate = new Date();
          todayDate.setHours(0,0,0,0);
          const currentLoopDate = new Date(date);
          currentLoopDate.setHours(0,0,0,0);
          const diffDays = Math.round((currentLoopDate - todayDate) / (1000 * 60 * 60 * 24));
          
          let dayNameStr = date.toLocaleString('es', { weekday: 'short' });
          let isClose = false;

          if (diffDays === 0) {
            dayNameStr = "Hoy";
            isClose = true;
          } else if (diffDays === 1) {
            dayNameStr = "Mañana";
            isClose = true;
          } else if (diffDays === -1) {
            dayNameStr = "Ayer";
            isClose = true;
          }

          const isToday = diffDays === 0;
          const dayTrips = tripsByDate[dateStr] || [];

          return (
            <div key={idx} className={`calendar-day ${isToday ? 'today' : ''}`}>
              <div className="day-header">
                {isClose ? (
                  <>
                    <span className="day-name">{dayNameStr}</span>
                    <span className="day-number">{date.getDate()}</span>
                  </>
                ) : (
                  <span className="day-name" style={{fontSize: '0.85rem', marginTop: '0.5rem'}}>
                    {date.getDate()} {date.toLocaleString('es', { month: 'short' })}
                  </span>
                )}
              </div>
              
              <div className="day-events">
                {dayTrips.sort((a,b) => new Date(a.FechaProgramadaInicio) - new Date(b.FechaProgramadaInicio)).map(trip => {
                  const tDate = new Date(trip.FechaProgramadaInicio);
                  const timeStr = tDate.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
                  const isSelected = selectedTrip?.IdOrdenServicio === trip.IdOrdenServicio;
                  
                  return (
                    <div 
                      key={trip.IdOrdenServicio} 
                      className={`calendar-event ${isSelected ? 'selected' : ''}`}
                      onClick={() => onTripSelect(trip)}
                    >
                      <div className="event-time">{timeStr}</div>
                      <div className="event-title">Folio: {trip.Folio}</div>
                      <div className={`event-status ${trip.CodigoEstatus?.toLowerCase()}`}>
                        {trip.CodigoEstatus || 'PENDIENTE'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TripsCalendar;
