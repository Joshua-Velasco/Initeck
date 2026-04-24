import React, { useState, useEffect, useRef } from 'react';
import { Navigation, Phone, MessageSquare, MapPin, ChevronUp, ChevronDown, Clock, DollarSign } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SAFAR_API = '/initeck-flota/safar/api/';

const ESTATUS_CONFIG = {
  PENDIENTE: { label: 'Pendiente', cls: 'bg-warning text-dark' },
  EN_CAMINO: { label: 'En camino', cls: 'bg-primary text-white' },
  LLEGADO: { label: 'Llegué', cls: 'bg-info text-white' },
  INICIADO: { label: 'En curso', cls: 'bg-danger text-white' },
  COMPLETADO: { label: 'Completado', cls: 'bg-success text-white' },
  CANCELADO: { label: 'Cancelado', cls: 'bg-secondary text-white' },
};

/**
 * PersistentTripBar
 * Banner fijo siempre visible en la parte inferior.
 * Muestra el próximo viaje activo y botones de acción rápida.
 * Optimizado para uso seguro mientras se conduce (botones grandes ≥48px).
 */
export default function PersistentTripBar({
  trip,
  pos,
  onUpdateStatus,
  onComplete,
  onExpand,
}) {
  const [minimized, setMinimized] = useState(false);

  if (!trip) return null;

  const estatusCfg = ESTATUS_CONFIG[trip.CodigoEstatus] || { label: trip.CodigoEstatus, cls: 'bg-secondary text-white' };
  const metodo = (trip.MetodoPago || '').toUpperCase();
  const montoTotal = Number(trip.MontoFinal || 0);
  const montoDeposito = Number(trip.MontoDeposito || 0);
  const efectivoPendiente = metodo === 'EFECTIVO' ? montoTotal : metodo === 'EFECTIVO_DEPOSITO' ? montoTotal - montoDeposito : 0;

  const handleToggleMinimize = (e) => {
    e.stopPropagation();
    setMinimized(!minimized);
  };

  const handleExpand = (e) => {
    e.stopPropagation();
    onExpand && onExpand();
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1050,
        background: '#fff',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        borderRadius: '20px 20px 0 0',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Drag handle */}
      <div
        style={{ width: 36, height: 4, background: '#e0e0e0', borderRadius: 2, margin: '8px auto 0' }}
        onClick={handleToggleMinimize}
      />

      {/* Barra minimizada */}
      {minimized ? (
        <div
          onClick={handleToggleMinimize}
          style={{
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#b22222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Navigation size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>#{trip.Folio}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{estatusCfg.label}</div>
            </div>
          </div>
          <ChevronUp size={20} color="#888" />
        </div>
      ) : (
        /* Barra expandida */
        <div style={{ padding: '12px 20px 20px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#b22222',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Navigation size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>#{trip.Folio}</div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#b22222',
                    textTransform: 'uppercase',
                  }}
                >
                  {estatusCfg.label}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleToggleMinimize}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '1.5px solid #e0e0e0',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <ChevronDown size={18} color="#888" />
              </button>
              <button
                onClick={handleExpand}
                style={{
                  padding: '10px 16px',
                  borderRadius: 20,
                  border: 'none',
                  background: '#111',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Ver Mapa
              </button>
            </div>
          </div>

          {/* Destino */}
          <div
            style={{
              background: '#f8f8f8',
              borderRadius: 14,
              padding: 14,
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <MapPin size={20} color="#b22222" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>
                Destino
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {trip.DireccionDestino || '—'}
              </div>
            </div>
            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${trip.LatitudDestino},${trip.LongitudDestino}&travelmode=driving`,
                  '_blank'
                )
              }
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                border: 'none',
                background: '#111',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Navigation size={20} />
            </button>
          </div>

          {/* Info de pago */}
          {efectivoPendiente > 0 && (
            <div
              style={{
                background: '#fef3cd',
                border: '1.5px solid #ffc107',
                borderRadius: 12,
                padding: 12,
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <DollarSign size={18} color="#b45309" />
              <div>
                <div style={{ fontSize: 10, color: '#78350f', fontWeight: 700 }}>COBRAR EN EFECTIVO</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#b45309' }}>
                  ${efectivoPendiente.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción (≥48px para uso seguro) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {/* Teléfono */}
            <button
              onClick={() => trip.TelefonoCliente && (window.location.href = `tel:${trip.TelefonoCliente}`)}
              disabled={!trip.TelefonoCliente}
              style={{
                height: 56,
                borderRadius: 14,
                border: '1.5px solid #22c55e',
                background: trip.TelefonoCliente ? '#fff' : '#f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                cursor: trip.TelefonoCliente ? 'pointer' : 'not-allowed',
                opacity: trip.TelefonoCliente ? 1 : 0.4,
              }}
            >
              <Phone size={20} color="#22c55e" />
              <span style={{ fontSize: 9, fontWeight: 700, color: '#22c55e' }}>Llamar</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() =>
                trip.TelefonoCliente &&
                window.open(`https://wa.me/${trip.TelefonoCliente?.replace(/\D/g, '')}`, '_blank')
              }
              disabled={!trip.TelefonoCliente}
              style={{
                height: 56,
                borderRadius: 14,
                border: '1.5px solid #22c55e',
                background: trip.TelefonoCliente ? '#fff' : '#f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                cursor: trip.TelefonoCliente ? 'pointer' : 'not-allowed',
                opacity: trip.TelefonoCliente ? 1 : 0.4,
              }}
            >
              <MessageSquare size={20} color="#22c55e" />
              <span style={{ fontSize: 9, fontWeight: 700, color: '#22c55e' }}>WhatsApp</span>
            </button>

            {/* Botón de estado principal */}
            {trip.CodigoEstatus === 'EN_CAMINO' && (
              <button
                onClick={() => onUpdateStatus('LLEGADO')}
                style={{
                  height: 56,
                  borderRadius: 14,
                  border: 'none',
                  background: '#3b82f6',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Llegué
              </button>
            )}
            {trip.CodigoEstatus === 'LLEGADO' && (
              <button
                onClick={() => onUpdateStatus('INICIADO')}
                style={{
                  height: 56,
                  borderRadius: 14,
                  border: 'none',
                  background: '#b22222',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Iniciar
              </button>
            )}
            {trip.CodigoEstatus === 'INICIADO' && (
              <button
                onClick={() => onUpdateStatus('SOLICITAR_PAGO')}
                style={{
                  height: 56,
                  borderRadius: 14,
                  border: 'none',
                  background: efectivoPendiente > 0 ? '#f59e0b' : '#22c55e',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Finalizar
              </button>
            )}
            {trip.CodigoEstatus === 'PENDIENTE' && (
              <button
                onClick={() => onUpdateStatus('EN_CAMINO')}
                style={{
                  height: 56,
                  borderRadius: 14,
                  border: 'none',
                  background: '#111',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                En Camino
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
