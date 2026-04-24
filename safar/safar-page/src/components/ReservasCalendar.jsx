import React, { useState, useEffect, useRef } from 'react';
import './ReservasCalendar.css';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const STATUS_COLORS = {
  pendiente:  { bg: '#fff8e1', border: '#f59e0b', text: '#92400e' },
  asignado:   { bg: '#e0f2fe', border: '#3b82f6', text: '#1e40af' },
  en_curso:   { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8' },
  completado: { bg: '#f3f4f6', border: '#9ca3af', text: '#6b7280' },
};

const isCompletado = (raw) => (raw || '').toLowerCase().replace(/\s+/g,'_') === 'completado';

const STATUS_LABELS = {
  pendiente:  'Pago Pendiente',
  asignado:   'Asignado',
  en_curso:   'En Curso',
  completado: 'Completado',
  cancelado:  'Cancelado',
};

const getStatusKey = (raw) => (raw || 'pendiente').toLowerCase().replace(/\s+/g, '_');
const getStatusStyle = (raw) => STATUS_COLORS[getStatusKey(raw)] || STATUS_COLORS.pendiente;
const getStatusLabel = (raw) => STATUS_LABELS[getStatusKey(raw)] ?? raw ?? 'Pendiente';

const getMinutes = (dateStr) => {
  const d = new Date(dateStr);
  return d.getHours() * 60 + d.getMinutes();
};

const fmtTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

const fmtDay = (date) =>
  date.toLocaleString('es', { weekday: 'short' }).toUpperCase().replace('.', '');

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// ─────────────────────────────────────────────────
const ReservasCalendar = ({
  trips, onTripSelect, selectedTrip,
  view, currentDay, onNav, onSetDay, onGoToday,
}) => {
  const scrollRef   = useRef(null);
  const timeLineRef = useRef(null);
  const [nowMinutes, setNowMinutes] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setNowMinutes(n.getHours() * 60 + n.getMinutes());
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll day view to current time
  useEffect(() => {
    if (view === 'day' && scrollRef.current) {
      const hourH = 72;
      scrollRef.current.scrollTop = Math.max(0, (nowMinutes / 60) * hourH - 150);
    }
  }, [view, nowMinutes]);

  const toDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Group trips by date
  const tripsByDate = {};
  trips.forEach(trip => {
    const key = toDateKey(new Date(trip.FechaProgramadaInicio));
    if (!tripsByDate[key]) tripsByDate[key] = [];
    tripsByDate[key].push(trip);
  });

  // Mon–Sun week from anchor
  const getWeekDays = (anchor) => {
    const d = new Date(anchor);
    d.setHours(0, 0, 0, 0);
    const dow = d.getDay();
    const diffToMon = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + diffToMon);
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(d);
      day.setDate(d.getDate() + i);
      return day;
    });
  };

  const weekDays = getWeekDays(currentDay);
  const today    = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday  = isSameDay(currentDay, new Date());

  // ── DAY VIEW ────────────────────────────────────
  const renderDayView = () => {
    const dayKey   = toDateKey(currentDay);
    const dayTrips = (tripsByDate[dayKey] || []).slice().sort(
      (a, b) => new Date(a.FechaProgramadaInicio) - new Date(b.FechaProgramadaInicio)
    );
    const hourH = 72;

    return (
      <div className="rc-day-view" ref={scrollRef}>
        <div className="rc-timeline">
          {/* Time gutter */}
          <div className="rc-gutter">
            {HOURS.map(h => (
              <div key={h} className="rc-gutter-hour" style={{ height: hourH }}>
                <span className="rc-gutter-label">
                  {h === 0 ? '' : `${String(h).padStart(2, '0')}:00`}
                </span>
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="rc-events-col" style={{ height: hourH * 24, position: 'relative' }}>
            {HOURS.map(h => (
              <div key={h} className="rc-hour-line" style={{ top: h * hourH }} />
            ))}

            {isToday && (
              <div
                className="rc-now-line"
                ref={timeLineRef}
                style={{ top: (nowMinutes / 60) * hourH }}
              >
                <div className="rc-now-dot" />
                <div className="rc-now-bar" />
              </div>
            )}

            {dayTrips.map(trip => {
              const mins   = getMinutes(trip.FechaProgramadaInicio);
              const top    = (mins / 60) * hourH;
              const height = Math.max(hourH * 0.75, 60);
              const raw    = trip.EstatusOrden || trip.CodigoEstatus;
              const style  = getStatusStyle(raw);
              const done   = isCompletado(raw);
              const isSel  = selectedTrip?.IdOrdenServicio === trip.IdOrdenServicio;
              return (
                <div
                  key={trip.IdOrdenServicio}
                  className={`rc-event-block${isSel ? ' selected' : ''}${done ? ' rc-done' : ''}`}
                  style={{ top, height, background: style.bg, borderLeftColor: style.border, opacity: done ? 0.7 : 1 }}
                  onClick={() => onTripSelect(trip)}
                >
                  <span className="rc-event-time" style={{ color: style.border }}>
                    {fmtTime(trip.FechaProgramadaInicio)}
                  </span>
                  <span className="rc-event-name" style={{ textDecoration: done ? 'line-through' : 'none', color: done ? '#9ca3af' : undefined }}>#{trip.Folio}</span>
                  <span className="rc-event-status" style={{ color: style.text }}>
                    {getStatusLabel(raw)}
                  </span>
                </div>
              );
            })}

            {dayTrips.length === 0 && (
              <div className="rc-empty-day">Sin reservas este día</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── WEEK VIEW (agenda) ───────────────────────────
  const renderWeekView = () => {
    const hasAnyTrip = weekDays.some(d => tripsByDate[toDateKey(d)]?.length);

    return (
      <div className="rc-week-view">
        {/* Day selector pills */}
        <div className="rc-day-selector">
          {weekDays.map((d, i) => {
            const isT    = isSameDay(d, today);
            const isSel  = isSameDay(d, currentDay);
            const hasTr  = !!(tripsByDate[toDateKey(d)]?.length);
            return (
              <button
                key={i}
                className={`rc-day-pill${isT ? ' today-pill' : ''}${isSel ? ' selected-pill' : ''}`}
                onClick={() => onSetDay(new Date(d))}
              >
                <span className="rc-pill-dow">{fmtDay(d)}</span>
                <span className="rc-pill-num">{d.getDate()}</span>
                {hasTr && <span className="rc-pill-dot" />}
              </button>
            );
          })}
        </div>

        {/* Agenda list */}
        <div className="rc-agenda-list">
          {!hasAnyTrip && (
            <div className="rc-agenda-empty">
              <div className="rc-agenda-empty-icon">📅</div>
              <p>Sin reservas esta semana</p>
            </div>
          )}

          {weekDays.map((d, di) => {
            const key      = toDateKey(d);
            const dayTrips = (tripsByDate[key] || []).slice().sort(
              (a, b) => new Date(a.FechaProgramadaInicio) - new Date(b.FechaProgramadaInicio)
            );
            if (dayTrips.length === 0) return null;

            const isT    = isSameDay(d, today);
            const dayStr = d.toLocaleString('es', { weekday: 'long', day: 'numeric', month: 'long' });

            return (
              <div key={di} className="rc-agenda-day">
                <div className={`rc-agenda-day-label${isT ? ' today-label' : ''}`}>
                  {isT ? 'Hoy · ' : ''}{dayStr}
                </div>

                {dayTrips.map(trip => {
                  const raw    = trip.EstatusOrden || trip.CodigoEstatus;
                  const style  = getStatusStyle(raw);
                  const done   = isCompletado(raw);
                  const isSel  = selectedTrip?.IdOrdenServicio === trip.IdOrdenServicio;
                  return (
                    <div
                      key={trip.IdOrdenServicio}
                      className={`rc-agenda-card${isSel ? ' selected' : ''}${done ? ' rc-done' : ''}`}
                      style={{ background: style.bg, borderLeftColor: style.border, opacity: done ? 0.75 : 1 }}
                      onClick={() => onTripSelect(trip)}
                    >
                      <span className="rc-agenda-time" style={{ color: style.border }}>
                        {fmtTime(trip.FechaProgramadaInicio)}
                      </span>
                      <div className="rc-agenda-info">
                        <span className="rc-agenda-folio" style={{ textDecoration: done ? 'line-through' : 'none', color: done ? '#9ca3af' : undefined }}>#{trip.Folio}</span>
                        <span className="rc-agenda-status" style={{ color: style.text }}>
                          {getStatusLabel(raw)}
                        </span>
                      </div>
                      <svg className="rc-agenda-arrow" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="rc-container">
      {view === 'day' ? renderDayView() : renderWeekView()}
    </div>
  );
};

export default ReservasCalendar;
