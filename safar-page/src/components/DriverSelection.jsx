import React, { useState, useEffect } from 'react';
import { User, Car, Clock, CheckCircle, AlertTriangle, Loader2, Star } from 'lucide-react';

const SAFAR_API = '/initeck-flota/safar/api/';

/**
 * DriverSelection
 * Componente para que el cliente seleccione chofer al crear una reserva.
 * Muestra choferes con su carga actual y disponibilidad.
 */
export default function DriverSelection({
  fechaSeleccionada,
  choferPreferido = '',
  onChoferSeleccionado,
}) {
  const [choferes, setChoferes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [choferSeleccionado, setChoferSeleccionado] = useState(choferPreferido);
  const [recomendacion, setRecomendacion] = useState('');

  useEffect(() => {
    if (!fechaSeleccionada) return;
    fetchDisponibilidad();
  }, [fechaSeleccionada]);

  const fetchDisponibilidad = async () => {
    setLoading(true);
    setError('');
    try {
      const fecha = fechaSeleccionada instanceof Date 
        ? fechaSeleccionada.toISOString().slice(0, 19).replace('T', ' ')
        : fechaSeleccionada;

      const res = await fetch(
        `${SAFAR_API}verificar_disponibilidad.php?fecha=${encodeURIComponent(fecha)}&ventana_minutos=90`
      );
      const data = await res.json();

      if (data.success) {
        setChoferes(data.choferes || []);
        setRecomendacion(data.recomendacion || '');
      } else {
        setError(data.message || 'Error al cargar disponibilidad.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionar = (codigoChofer) => {
    setChoferSeleccionado(codigoChofer);
    onChoferSeleccionado && onChoferSeleccionado(codigoChofer);
  };

  // Ordenar: recomendados primero, luego por carga
  const choferesOrdenados = [...choferes].sort((a, b) => {
    // Recomendado primero
    if (a.codigo_chofer === recomendacion) return -1;
    if (b.codigo_chofer === recomendacion) return 1;
    // Luego por disponibilidad (disponibles primero)
    if (a.disponible && !b.disponible) return -1;
    if (!a.disponible && b.disponible) return 1;
    // Luego por menor carga
    return a.porcentaje_carga - b.porcentaje_carga;
  });

  if (!fechaSeleccionada) {
    return (
      <div style={{ textAlign: 'center', padding: 30, color: '#888' }}>
        <Clock size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
        <p style={{ fontSize: 14 }}>Selecciona una fecha y hora para ver choferes disponibles.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 30 }}>
        <Loader2 size={28} className="animate-spin" style={{ color: '#b22222' }} />
        <span style={{ fontSize: 13, color: '#888', marginTop: 10 }}>Cargando choferes disponibles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#fdecea', color: '#b71c1c', borderRadius: 14, padding: 16, fontSize: 13 }}>
        ⚠️ {error}
      </div>
    );
  }

  if (choferes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 30, color: '#888' }}>
        <User size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
        <p style={{ fontSize: 14 }}>No hay choferes disponibles en el sistema.</p>
      </div>
    );
  }

  const disponibles = choferes.filter((c) => c.disponible).length;
  const total = choferes.length;

  return (
    <div>
      {/* Header con resumen */}
      <div
        style={{
          background: '#f8f8f8',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
              Choferes disponibles
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#111' }}>
              {disponibles} <span style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>de {total}</span>
            </div>
          </div>
          <div
            style={{
              background: disponibles > 0 ? '#d1fae5' : '#fef2f2',
              color: disponibles > 0 ? '#16a34a' : '#dc2626',
              borderRadius: 12,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {disponibles > 0 ? '✓ Disponible' : '✗ Saturado'}
          </div>
        </div>

        {recomendacion && (
          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #f59e0b',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: 12,
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Star size={14} color="#f59e0b" />
            Recomendamos: <strong>{choferes.find((c) => c.codigo_chofer === recomendacion)?.nombre}</strong> (menor carga)
          </div>
        )}
      </div>

      {/* Lista de choferes */}
      <div style={{ display: 'grid', gap: 10 }}>
        {choferesOrdenados.map((chofer) => {
          const isSelected = choferSeleccionado === chofer.codigo_chofer;
          const isRecomendado = chofer.codigo_chofer === recomendacion;
          const colorCarga =
            chofer.porcentaje_carga < 50
              ? '#22c55e'
              : chofer.porcentaje_carga < 80
              ? '#f59e0b'
              : '#ef4444';

          return (
            <button
              key={chofer.codigo_chofer}
              onClick={() => chofer.disponible && handleSeleccionar(chofer.codigo_chofer)}
              disabled={!chofer.disponible}
              style={{
                background: isSelected ? '#111' : '#fff',
                color: isSelected ? '#fff' : '#111',
                border: isSelected ? '2px solid #111' : chofer.disponible ? '1.5px solid #e0e0e0' : '1.5px solid #f0f0f0',
                borderRadius: 16,
                padding: '14px 16px',
                cursor: chofer.disponible ? 'pointer' : 'not-allowed',
                opacity: chofer.disponible ? 1 : 0.5,
                transition: 'all 0.15s',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (chofer.disponible && !isSelected) {
                  e.currentTarget.style.borderColor = '#111';
                  e.currentTarget.style.background = '#fafafa';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.background = '#fff';
                }
              }}
            >
              {/* Badge de recomendado */}
              {isRecomendado && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: '#f59e0b',
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '0 14px 0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Star size={10} /> RECOMENDADO
                </div>
              )}

              {/* Header del chofer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                {/* Avatar */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: isSelected ? '#fff' : colorCarga,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? '#111' : '#fff',
                    flexShrink: 0,
                  }}
                >
                  <User size={20} />
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>
                    {chofer.nombre}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Car size={12} />
                    {chofer.unidad || 'Sin unidad'}
                  </div>
                </div>

                {/* Check de selección */}
                {isSelected && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle size={16} color="#fff" />
                  </div>
                )}
              </div>

              {/* Barra de carga */}
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span style={{ opacity: 0.7 }}>
                    {chofer.viajes_en_ventana} / {chofer.max_viajes} viajes en ventana
                  </span>
                  <span style={{ fontWeight: 700, color: colorCarga }}>{chofer.porcentaje_carga}%</span>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background: isSelected ? 'rgba(255,255,255,0.2)' : '#f0f0f0',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${chofer.porcentaje_carga}%`,
                      height: '100%',
                      background: colorCarga,
                      borderRadius: 3,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* Slots disponibles */}
              {chofer.disponible && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: isSelected ? 'rgba(255,255,255,0.8)' : '#22c55e',
                    fontWeight: 600,
                  }}
                >
                  ✓ {chofer.slots_disponibles} slot{chofer.slots_disponibles !== 1 ? 's' : ''} disponible
                  {chofer.slots_disponibles === 1 && ' — ¡Reserva pronto!'}
                </div>
              )}

              {/* Sin disponibilidad */}
              {!chofer.disponible && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: '#ef4444',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <AlertTriangle size={12} />
                  Saturado — No disponible en este horario
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Nota inferior */}
      <div
        style={{
          marginTop: 16,
          fontSize: 11,
          color: '#888',
          textAlign: 'center',
          padding: '8px 0',
        }}
      >
        {disponibles === total
          ? 'Todos los choferes están disponibles. Selecciona tu preferido.'
          : disponibles > 0
          ? `Solo ${disponibles} chofer${disponibles !== 1 ? 'es' : ''} disponible${disponibles !== 1 ? 's' : ''} en este horario.`
          : 'No hay choferes disponibles. Intenta otro horario.'}
      </div>
    </div>
  );
}
