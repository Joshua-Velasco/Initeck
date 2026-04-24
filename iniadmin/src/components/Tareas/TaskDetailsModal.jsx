import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, AlignLeft, Users, Edit, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export default function TaskDetailsModal({ task, onClose, onEdit, onDelete, isDeleting }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!task) return null;

  const handleDeleteClick = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(task.id);
  };

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ padding: 20 }}
    >
      <div
        className="modal-content-admin animate-fade-in-scale"
        style={{ width: '100%', maxWidth: 500, background: 'white', overflow: 'hidden' }}
      >
        {/* Color accent bar */}
        <div style={{ height: 5, background: task.color || 'var(--gray-300)' }} />

        <div style={{ padding: '24px 28px' }}>

          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: 'var(--gray-900)', margin: 0, lineHeight: 1.25, flex: 1 }}>
              {task.titulo}
            </h2>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 4, borderRadius: 'var(--radius-sm)', flexShrink: 0, display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-100)'; e.currentTarget.style.color = 'var(--gray-600)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--gray-400)'; }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'var(--gray-100)', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              {task.estado}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'var(--red-50)', color: 'var(--red-700)', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={10} /> {task.departamento}
            </span>
            {task.prioridad && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'var(--warning-light)', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                {task.prioridad}
              </span>
            )}
          </div>

          {/* Dates */}
          <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 18, border: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 700, margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={11} /> Inicio
                </p>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', margin: 0 }}>
                  {task.fecha_inicio
                    ? new Date(task.fecha_inicio + 'T12:00:00Z').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
                    : 'No asignada'}
                </p>
                {task.hora_inicio && (
                  <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} /> {task.hora_inicio}
                  </p>
                )}
              </div>
              <div>
                <p style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 700, margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> Límite
                </p>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', margin: 0 }}>
                  {task.fecha_fin
                    ? new Date(task.fecha_fin + 'T12:00:00Z').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
                    : 'Sin límite'}
                </p>
                {task.hora_fin && (
                  <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} /> {task.hora_fin}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Assigned to */}
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={11} /> Asignado a
            </p>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', margin: 0 }}>
              {task.empleado_nombre
                ? `👤 ${task.empleado_nombre}`
                : task.equipo_nombre
                  ? `👥 Equipo: ${task.equipo_nombre}`
                  : 'Sin asignar'}
            </p>
          </div>

          {/* Description */}
          {task.responsabilidades && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlignLeft size={11} /> Descripción
              </p>
              <div style={{ fontSize: 13, color: 'var(--gray-600)', background: 'var(--gray-50)', padding: '10px 14px', borderRadius: 'var(--radius-md)', whiteSpace: 'pre-wrap', lineHeight: 1.5, border: '1px solid var(--gray-100)' }}>
                {task.responsabilidades}
              </div>
            </div>
          )}

          {/* Materials */}
          {task.materiales?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Materiales
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {task.materiales.map((m, i) => (
                  <span key={i} style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 'var(--radius-sm)', background: 'var(--gray-100)', color: 'var(--gray-600)' }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Confirm delete warning */}
          {confirmDelete && (
            <div style={{
              background: '#fff5f5',
              border: '1px solid var(--red-200)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <AlertTriangle size={16} color="var(--red-600)" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 12, color: 'var(--red-700)', fontWeight: 600, lineHeight: 1.4 }}>
                ¿Eliminar esta tarea? Si tiene rango de fechas desaparecerá de todos los días. Esta acción no se puede deshacer.
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--gray-100)', paddingTop: 18, gap: 10 }}>

            {/* Delete */}
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="btn-admin"
              style={{
                background: confirmDelete ? 'var(--danger)' : 'white',
                color: confirmDelete ? 'white' : 'var(--danger)',
                border: `1.5px solid ${confirmDelete ? 'var(--danger)' : 'var(--red-200)'}`,
                fontSize: 13,
                transition: 'all 0.2s',
                opacity: isDeleting ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!confirmDelete) { e.currentTarget.style.background = 'var(--danger-light)'; e.currentTarget.style.borderColor = 'var(--danger)'; } }}
              onMouseLeave={e => { if (!confirmDelete) { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--red-200)'; } }}
            >
              {isDeleting
                ? <><Loader2 size={14} className="animate-spin" /> Eliminando...</>
                : confirmDelete
                  ? <><Trash2 size={14} /> Confirmar eliminación</>
                  : <><Trash2 size={14} /> Eliminar</>}
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              {confirmDelete && (
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="btn-admin btn-secondary"
                  style={{ fontSize: 13 }}
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={() => { onClose(); onEdit(); }}
                className="btn-admin"
                style={{ background: 'var(--gray-100)', color: 'var(--gray-700)', border: 'none', fontSize: 13 }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-200)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--gray-100)'}
              >
                <Edit size={14} /> Editar
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
