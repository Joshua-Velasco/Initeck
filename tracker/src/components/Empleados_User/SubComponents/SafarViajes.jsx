import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Clock, DollarSign, Calendar, ChevronDown, ChevronUp, Navigation, Phone, MessageSquare, Wallet, Users, Star, AlertTriangle, Car, User } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Nuevos componentes del sistema de gestión Safar

import DriverCapacityGrid from './DriverCapacityGrid';
import PersistentTripBar from './PersistentTripBar';

import { SAFAR_API_URL, BASE_API } from '../../../config';

const SAFAR_API = SAFAR_API_URL;


const ESTATUS_CONFIG = {
  PENDIENTE:   { label: 'Pendiente',   cls: 'bg-warning text-dark' },
  EN_CAMINO:   { label: 'En camino',   cls: 'bg-primary text-white' },
  LLEGADO:     { label: 'Llegué',      cls: 'bg-info text-white' },
  INICIADO:    { label: 'En curso',    cls: 'bg-danger text-white' },
  COMPLETADO:  { label: 'Completado',  cls: 'bg-success text-white' },
  CANCELADO:   { label: 'Cancelado',   cls: 'bg-secondary text-white' },
};

const PAGO_CONFIG = {
  STRIPE:             { label: 'Tarjeta',    short: 'Tarjeta',  cls: 'bg-success text-white',  icon: '💳', color: '#16a34a' },
  EFECTIVO_DEPOSITO:  { label: 'Dep.+Efvo.', short: 'Dep.+Efvo', cls: 'bg-warning text-dark',   icon: '💵', color: '#d97706' },
  EFECTIVO:           { label: 'Efectivo',   short: 'Efectivo', cls: 'bg-danger text-white',   icon: '💵', color: '#b22222' },
};

const INCIDENCIA_CONFIG = {
  NINGUNA:            { label: 'Sin incidencia',   icon: '✅', color: '#22c55e' },
  PAGADO_PREVIAMENTE: { label: 'Ya había pagado',  icon: '💳', color: '#3b82f6' },
  CLIENTE_NO_PAGO:    { label: 'No pagó',          icon: '❌', color: '#ef4444' },
  CLIENTE_RECHAZO:    { label: 'Rechazó cobro',    icon: '⚠️', color: '#f59e0b' },
  MONTO_INCORRECTO:   { label: 'Monto incorrecto', icon: '💰', color: '#8b5cf6' },
  OTRO:               { label: 'Otro',             icon: '📝', color: '#6b7280' },
};

function formatFecha(fechaStr) {
  if (!fechaStr) return '—';
  const d = new Date(fechaStr);
  return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function PaymentDetail({ trip }) {
  const metodo = (trip.MetodoPago || '').toUpperCase();
  const total    = Number(trip.MontoFinal   || 0);
  const deposito = Number(trip.MontoDeposito || 0);
  const pendiente = Number(trip.EfectivoPendiente || 0);

  if (metodo === 'STRIPE') {
    return (
      <div className="d-flex align-items-center gap-2 p-2 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-25">
        <span style={{ fontSize: 18 }}>💳</span>
        <div>
          <div className="fw-bold text-success" style={{ fontSize: 13 }}>Pago con tarjeta completado</div>
          <div className="text-muted" style={{ fontSize: 12 }}>${total.toFixed(2)} cobrado por Stripe</div>
        </div>
      </div>
    );
  }

  if (metodo === 'EFECTIVO_DEPOSITO') {
    return (
      <div className="p-2 rounded-3 border" style={{ borderColor: '#e0a800', background: '#fffdf0' }}>
        <div className="d-flex justify-content-between mb-1">
          <span style={{ fontSize: 12, color: '#6b6b6b' }}>Depósito cobrado (30%)</span>
          <span className="fw-bold text-success" style={{ fontSize: 13 }}>${deposito > 0 ? deposito.toFixed(2) : (total * 0.30).toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between">
          <span style={{ fontSize: 12, color: '#6b6b6b' }}>💵 Cobrar en efectivo</span>
          <span className="fw-bold text-danger" style={{ fontSize: 13 }}>${pendiente > 0 ? pendiente.toFixed(2) : (total * 0.70).toFixed(2)}</span>
        </div>
        <div className="border-top mt-2 pt-1 d-flex justify-content-between">
          <span style={{ fontSize: 11, color: '#6b6b6b' }}>Total del viaje</span>
          <span className="fw-semibold" style={{ fontSize: 12 }}>${total.toFixed(2)}</span>
        </div>
      </div>
    );
  }

  // EFECTIVO puro
  return (
    <div className="d-flex align-items-center gap-2 p-2 rounded-3 bg-danger bg-opacity-10 border border-danger border-opacity-25">
      <span style={{ fontSize: 18 }}>💵</span>
      <div>
        <div className="fw-bold text-danger" style={{ fontSize: 13 }}>Cobrar en efectivo</div>
        <div className="text-muted" style={{ fontSize: 12 }}>Monto total: ${total.toFixed(2)}</div>
      </div>
    </div>
  );
}

function TripMap({ trip }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Limpiar instancia previa
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const lat = Number(trip.LatitudOrigen)  || 31.69;
    const lng = Number(trip.LongitudOrigen) || -106.42;

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const layers = L.featureGroup();

    // Marcador Origen (A)
    if (trip.LatitudOrigen && trip.LongitudOrigen) {
      const iconA = L.divIcon({
        html: `<div style="width:28px;height:28px;border-radius:50%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">A</div>`,
        iconSize: [28, 28],
        className: '',
      });
      L.marker([Number(trip.LatitudOrigen), Number(trip.LongitudOrigen)], { icon: iconA }).addTo(map);
      layers.addLayer(L.marker([Number(trip.LatitudOrigen), Number(trip.LongitudOrigen)], { icon: iconA }));
    }

    // Marcador Destino (B)
    if (trip.LatitudDestino && trip.LongitudDestino) {
      const iconB = L.divIcon({
        html: `<div style="width:28px;height:28px;border-radius:50%;background:#b22222;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">B</div>`,
        iconSize: [28, 28],
        className: '',
      });
      L.marker([Number(trip.LatitudDestino), Number(trip.LongitudDestino)], { icon: iconB }).addTo(map);
      layers.addLayer(L.marker([Number(trip.LatitudDestino), Number(trip.LongitudDestino)], { icon: iconB }));
    }

    // Ruta GeoJSON
    if (trip.GeoJSON_Ruta) {
      const routeLayer = L.geoJSON(trip.GeoJSON_Ruta, {
        style: { color: '#1a1a1a', weight: 4, opacity: 0.85 },
      }).addTo(map);
      layers.addLayer(routeLayer);
    }

    if (layers.getLayers().length > 0) {
      try {
        const bounds = layers.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [32, 32] });
      } catch (_) {}
    }

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [trip.IdOrdenServicio]);

  return (
    <div ref={mapRef} style={{ height: 200, borderRadius: 12, overflow: 'hidden', background: '#e8e8e8' }} />
  );
}

function TripCard({ trip, onStart }) {
  const [expanded, setExpanded] = useState(false);

  const estatusCfg = ESTATUS_CONFIG[trip.CodigoEstatus] || { label: trip.CodigoEstatus, cls: 'bg-secondary text-white' };
  const pagoCfg    = PAGO_CONFIG[(trip.MetodoPago || '').toUpperCase()] || { label: trip.MetodoPago, cls: 'bg-secondary text-white', icon: '💰' };

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-3 overflow-hidden">
      {/* Header clickeable */}
      <div
        className="card-body p-3 d-flex gap-3 align-items-start"
        onClick={() => setExpanded(p => !p)}
        style={{ cursor: 'pointer' }}
      >
        {/* Columna izquierda: fecha + folio */}
        <div style={{ minWidth: 52, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {new Date(trip.FechaProgramadaInicio).toLocaleDateString('es-MX', { month: 'short' })}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>
            {new Date(trip.FechaProgramadaInicio).getDate()}
          </div>
          <div style={{ fontSize: 10, color: '#aaa' }}>
            {new Date(trip.FechaProgramadaInicio).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Columna central: ruta + badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="d-flex gap-1 flex-wrap mb-1">
            <span className={`badge rounded-pill ${estatusCfg.cls}`} style={{ fontSize: 10 }}>{estatusCfg.label}</span>
            <span className={`badge rounded-pill ${pagoCfg.cls}`} style={{ fontSize: 10 }}>{pagoCfg.icon} {pagoCfg.label}</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {trip.DireccionOrigen || '—'}
          </div>
          <div style={{ fontSize: 11, color: '#6b6b6b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            → {trip.DireccionDestino || '—'}
          </div>
          {trip.NombreCliente && (
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
              Cliente: {trip.NombreCliente}
            </div>
          )}
        </div>

        {/* Columna derecha: total + chevron */}
        <div className="d-flex flex-column align-items-end gap-1">
          <span className="fw-bold" style={{ fontSize: 15, color: '#b22222' }}>
            ${Number(trip.MontoFinal || 0).toFixed(2)}
          </span>
          {expanded ? <ChevronUp size={16} color="#aaa" /> : <ChevronDown size={16} color="#aaa" />}
        </div>
      </div>

      {/* Detalle expandido */}
      {expanded && (
        <div className="border-top px-3 pb-3 pt-2" style={{ background: '#fafafa' }}>
          {/* Mapa */}
          {(trip.LatitudOrigen && trip.LatitudDestino) && (
            <div className="mb-3">
              <TripMap trip={trip} />
            </div>
          )}

          {/* Stats ruta */}
          <div className="d-flex gap-2 mb-3">
            {trip.Distancia && (
              <div className="flex-1 text-center p-2 bg-white rounded-3 border" style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distancia</div>
                <div className="fw-bold" style={{ fontSize: 14 }}>{trip.Distancia}</div>
              </div>
            )}
            {trip.TiempoEstimado && (
              <div className="flex-1 text-center p-2 bg-white rounded-3 border" style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tiempo est.</div>
                <div className="fw-bold" style={{ fontSize: 14 }}>{trip.TiempoEstimado}</div>
              </div>
            )}
            <div className="flex-1 text-center p-2 bg-white rounded-3 border" style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Folio</div>
              <div className="fw-bold" style={{ fontSize: 12 }}>#{trip.Folio}</div>
            </div>
          </div>

          {/* Detalle de pago */}
          <PaymentDetail trip={trip} />

        </div>
      )}
      {/* Botón Comenzar — siempre visible, sin expandir */}
      {onStart && trip.CodigoEstatus === 'PENDIENTE' && (
        <div className="px-3 pb-3">
          <button
            onClick={(e) => { e.stopPropagation(); onStart(trip, 'EN_CAMINO'); }}
            className="btn btn-dark w-100 rounded-3 fw-bold"
            style={{ fontSize: 16, minHeight: 56 }}
          >
            🚗 Comenzar Viaje
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Available Trip Card (acepta en 1 tap) ────────────────────────────────────
function AvailableCard({ trip, codigoChofer, onAccepted }) {
  const [accepting, setAccepting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [err, setErr] = useState('');
  const pagoCfg = PAGO_CONFIG[(trip.MetodoPago || '').toUpperCase()] || { icon: '💵', short: trip.MetodoPago, color: '#888' };

  const fecha = trip.FechaProgramadaInicio ? new Date(trip.FechaProgramadaInicio) : null;
  // Ajuste: usar tiempo actual del sistema para detectar expiración
  const isPast = fecha && fecha < new Date();
  const hora = fecha ? fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : '—';
  const diaLabel = fecha ? fecha.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }) : '';

  const shortAddr = (addr) => addr ? addr.split(',')[0].trim() : '—';

  const handleAceptar = async () => {
    setAccepting(true);
    setErr('');
    try {
      const res = await fetch(`${SAFAR_API}aceptar_viaje.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigoChofer, idDestino: trip.IdDestino }),
      });
      const data = await res.json();
      if (data.success) { onAccepted(); }
      else { setErr(data.message || 'Error al aceptar.'); setConfirm(false); }
    } catch (_) { setErr('Error de conexión.'); setConfirm(false); }
    finally { setAccepting(false); }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 18,
      marginBottom: 10,
      boxShadow: '0 1px 6px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.05)',
      overflow: 'hidden',
    }}>
      {/* Top row: hora · fecha   precio */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px 8px',
        borderBottom: '1px solid #f5f5f5',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ 
            fontSize: 20, 
            fontWeight: 900, 
            color: isPast ? '#ef4444' : '#111', 
            letterSpacing: '-0.5px',
            textDecoration: isPast ? 'line-through' : 'none'
          }}>{hora}</span>
          <span style={{ 
            fontSize: 12, 
            color: isPast ? '#fca5a5' : '#aaa', 
            fontWeight: 500,
            textDecoration: isPast ? 'line-through' : 'none'
          }}>{diaLabel}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Payment chip */}
          <span style={{
            fontSize: 11, fontWeight: 700, color: pagoCfg.color,
            background: `${pagoCfg.color}18`,
            borderRadius: 20, padding: '3px 9px',
            whiteSpace: 'nowrap',
          }}>
            {pagoCfg.icon} {pagoCfg.short}
          </span>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#800020' }}>
            ${Number(trip.MontoFinal || 0).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Bottom row: ruta + botón */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px 12px', gap: 12 }}>
        {/* Ruta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#16a34a', flexShrink: 0,
              boxShadow: '0 0 0 2px #dcfce7',
            }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {shortAddr(trip.DireccionOrigen)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 8, height: 8, borderRadius: 2, background: '#800020', flexShrink: 0,
              boxShadow: '0 0 0 2px #fce7e7',
            }} />
            <span style={{ fontSize: 13, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {shortAddr(trip.DireccionDestino)}
            </span>
          </div>
          {err && <div style={{ fontSize: 11, color: '#b22222', marginTop: 6 }}>{err}</div>}
        </div>

        {/* Botón aceptar — pill elegante o estado expirado */}
        {isPast ? (
          <div style={{
            background: '#fee2e2', color: '#dc2626',
            borderRadius: 12, padding: '10px 14px',
            fontSize: 11, fontWeight: 800, border: '1px solid #fecaca',
            flexShrink: 0, whiteSpace: 'nowrap',
          }}>INCOMPLETO</div>
        ) : !confirm ? (
          <button onClick={() => setConfirm(true)} style={{
            background: '#111', color: '#fff', border: 'none',
            borderRadius: 12, padding: '10px 18px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            flexShrink: 0, whiteSpace: 'nowrap',
            boxShadow: '0 3px 10px rgba(0,0,0,0.18)',
            transition: 'transform 0.1s',
          }}>Tomar</button>
        ) : (
          <button onClick={handleAceptar} disabled={accepting} style={{
            background: accepting ? '#aaa' : '#16a34a', color: '#fff', border: 'none',
            borderRadius: 12, padding: '10px 18px',
            fontSize: 13, fontWeight: 700, cursor: accepting ? 'not-allowed' : 'pointer',
            flexShrink: 0, whiteSpace: 'nowrap',
            boxShadow: '0 3px 10px rgba(22,163,74,0.3)',
          }}>{accepting ? '...' : '✓ Sí'}</button>
        )}
      </div>
    </div>
  );
}

// ─── Ganancias Panel ─────────────────────────────────────────────────────────
function GananciasPanel({ codigoChofer }) {
  const [periodo, setPeriodo]   = useState('hoy');
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchData = useCallback(async () => {
    if (!codigoChofer) return;
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${SAFAR_API}chofer_finanzas_safar.php?codigoChofer=${encodeURIComponent(codigoChofer)}&periodo=${periodo}`);
      const d = await res.json();
      if (d.success) setData(d);
      else setErr(d.message || 'Error al cargar ganancias.');
    } catch (_) { setErr('Error de conexión.'); }
    finally { setLoading(false); }
  }, [codigoChofer, periodo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      {/* Period selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[['hoy','Hoy'],['semana','Semana'],['mes','Este Mes']].map(([k, lbl]) => (
          <button key={k} onClick={() => setPeriodo(k)}
            style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', fontWeight: 700,
              fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              background: periodo === k ? '#111' : '#f0f0f0',
              color: periodo === k ? '#fff' : '#555', transition: 'all 0.15s' }}>
            {lbl}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div className="spinner-border text-danger" style={{ width: 28, height: 28, borderWidth: 3 }} />
        </div>
      )}
      {err && <div className="alert alert-danger rounded-3 mb-3" style={{ fontSize: 12 }}>{err}</div>}

      {!loading && data && (() => {
        const { resumen, viajes } = data;
        const total = resumen.pagado_stripe + resumen.cobrado_efectivo;
        return (
          <>
            {/* Cards tarjeta / efectivo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div style={{ background: '#f0faf5', borderRadius: 18, padding: '16px 14px', border: '2px solid #bbf7d0' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>💳</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Tarjeta / Stripe</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>${resumen.pagado_stripe.toFixed(2)}</div>
                <div style={{ fontSize: 9, color: '#888', marginTop: 4 }}>Pago digital</div>
              </div>
              <div style={{ background: '#fffbeb', borderRadius: 18, padding: '16px 14px', border: '2px solid #fde68a' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>💵</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Efectivo cobrado</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#b45309', lineHeight: 1 }}>${resumen.cobrado_efectivo.toFixed(2)}</div>
                <div style={{ fontSize: 9, color: '#888', marginTop: 4 }}>Depósito + efectivo</div>
              </div>
            </div>

            {/* Total + viajes count */}
            <div style={{ background: '#111', borderRadius: 18, padding: '16px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Total del periodo</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>${total.toFixed(2)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{resumen.total_viajes_completados}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase' }}>viajes completados</div>
              </div>
            </div>

            {/* Lista detalle */}
            {viajes.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                  Detalle · {viajes.length} viaje{viajes.length !== 1 ? 's' : ''}
                </div>
                {viajes.map(v => {
                  const metodo      = (v.MetodoPago || '').toUpperCase();
                  const esStripe    = metodo === 'STRIPE';
                  const esDeposito  = metodo === 'EFECTIVO_DEPOSITO';
                  const montoFinal  = parseFloat(v.MontoFinal   || 0);
                  const montoDepo   = parseFloat(v.MontoDeposito || 0);
                  const montoCobrado  = parseFloat(v.monto_cobrado || 0);
                  const montoEsperado = parseFloat(v.monto_esperado_cobro || 0);
                  const estadoCobro   = v.estado_cobro || 'PENDIENTE';
                  const cobroOk     = estadoCobro === 'NINGUNA';
                  const cobroPend   = estadoCobro === 'PENDIENTE';
                  const hayIncidencia = !cobroOk && !cobroPend;
                  const diferencia  = montoCobrado - montoEsperado;
                  const fecha       = v.fecha_cobro_real || v.FechaProgramadaInicio;
                  const distKm      = v.Distancia ? `${parseFloat(v.Distancia).toFixed(1)} km` : null;
                  const isOpen      = expandedId === v.IdOrdenServicio;

                  // accent color
                  const accentColor = esStripe ? '#16a34a' : cobroOk ? '#16a34a' : cobroPend ? '#d97706' : '#dc2626';
                  const accentBg    = esStripe ? '#dcfce7' : cobroOk ? '#dcfce7' : cobroPend ? '#fef9c3' : '#fee2e2';
                  const badgeLabel  = esStripe
                    ? '💳 Digital'
                    : cobroOk   ? '✅ Cobrado'
                    : cobroPend ? '⏳ Pendiente'
                    : `⚠️ ${INCIDENCIA_CONFIG[estadoCobro]?.label || estadoCobro}`;

                  const metodoPagoLabel = esStripe ? 'Tarjeta / Stripe' : esDeposito ? 'Depósito + Efectivo' : 'Efectivo';

                  return (
                    <div key={v.IdOrdenServicio} style={{ background: '#fff', borderRadius: 16, marginBottom: 10,
                      border: '1.5px solid #f0f0f0', overflow: 'hidden',
                      boxShadow: isOpen ? '0 4px 16px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.05)',
                      transition: 'box-shadow 0.2s' }}>

                      {/* Accent bar top */}
                      <div style={{ height: 3, background: accentColor, opacity: 0.7 }} />

                      {/* Tap row — always visible */}
                      <button
                        onClick={() => setExpandedId(isOpen ? null : v.IdOrdenServicio)}
                        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                          padding: '12px 14px 10px', display: 'flex', alignItems: 'center', gap: 10,
                          textAlign: 'left', fontFamily: 'inherit' }}>

                        {/* Pago icon circle */}
                        <div style={{ width: 38, height: 38, borderRadius: 12, background: accentBg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 18, flexShrink: 0 }}>
                          {esStripe ? '💳' : esDeposito ? '💰' : '💵'}
                        </div>

                        {/* Folio + ruta truncada */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>#{v.Folio}</span>
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20,
                              background: accentBg, color: accentColor }}>
                              {badgeLabel}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {v.DireccionOrigen} → {v.DireccionDestino}
                          </div>
                        </div>

                        {/* Monto + chevron */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 900, color: '#111' }}>${montoFinal.toFixed(2)}</div>
                          <div style={{ fontSize: 18, color: '#ccc', lineHeight: 1 }}>{isOpen ? '▲' : '▼'}</div>
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {isOpen && (
                        <div style={{ borderTop: '1px solid #f4f4f4', padding: '12px 14px 14px', background: '#fafafa' }}>

                          {/* Fecha + km */}
                          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', marginBottom: 2 }}>Fecha del viaje</div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>
                                {fecha ? new Date(fecha).toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                              </div>
                              <div style={{ fontSize: 11, color: '#888' }}>
                                {fecha ? new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''}
                              </div>
                            </div>
                            {distKm && (
                              <div>
                                <div style={{ fontSize: 9, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', marginBottom: 2 }}>Distancia</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{distKm}</div>
                              </div>
                            )}
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', marginBottom: 2 }}>Método</div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: '#333' }}>{metodoPagoLabel}</div>
                            </div>
                          </div>

                          {/* Ruta completa */}
                          <div style={{ background: '#fff', borderRadius: 10, padding: 10, marginBottom: 12, border: '1px solid #ebebeb' }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                                <div style={{ width: 1.5, flex: 1, background: '#ddd', margin: '2px 0' }} />
                                <div style={{ width: 8, height: 8, borderRadius: 2, background: '#ef4444', flexShrink: 0 }} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, color: '#333', marginBottom: 8, lineHeight: 1.3 }}>{v.DireccionOrigen || '—'}</div>
                                <div style={{ fontSize: 11, color: '#333', lineHeight: 1.3 }}>{v.DireccionDestino || '—'}</div>
                              </div>
                            </div>
                          </div>

                          {/* Desglose financiero */}
                          <div style={{ background: '#fff', borderRadius: 10, padding: 10, border: '1px solid #ebebeb' }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', marginBottom: 8 }}>Desglose de cobro</div>

                            {esStripe ? (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: '#555' }}>💳 Cobrado por Stripe</span>
                                <span style={{ fontSize: 14, fontWeight: 800, color: '#16a34a' }}>${montoFinal.toFixed(2)}</span>
                              </div>
                            ) : (
                              <>
                                {esDeposito && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
                                    <span style={{ fontSize: 12, color: '#555' }}>💳 Depósito cobrado</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6' }}>${montoDepo.toFixed(2)}</span>
                                  </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                  <span style={{ fontSize: 12, color: '#555' }}>💵 Efectivo esperado</span>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>${montoEsperado.toFixed(2)}</span>
                                </div>
                                {montoCobrado > 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, color: '#555' }}>Cobrado real</span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>${montoCobrado.toFixed(2)}</span>
                                  </div>
                                )}
                                {Math.abs(diferencia) > 0.01 && montoCobrado > 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between',
                                    paddingTop: 8, marginTop: 4, borderTop: '1px solid #f0f0f0' }}>
                                    <span style={{ fontSize: 12, color: '#555' }}>
                                      {diferencia > 0 ? '🎁 Propina' : '📉 Diferencia'}
                                    </span>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: diferencia > 0 ? '#16a34a' : '#ef4444' }}>
                                      {diferencia > 0 ? '+' : ''}${diferencia.toFixed(2)}
                                    </span>
                                  </div>
                                )}
                                {hayIncidencia && (
                                  <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 8,
                                    background: '#fef2f2', border: '1px solid #fecaca',
                                    fontSize: 11, color: '#dc2626', fontWeight: 600 }}>
                                    {INCIDENCIA_CONFIG[estadoCobro]?.icon} {INCIDENCIA_CONFIG[estadoCobro]?.label || estadoCobro}
                                    {v.observaciones ? ` — ${v.observaciones}` : ''}
                                  </div>
                                )}
                              </>
                            )}

                            {/* Total */}
                            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #f0f0f0',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#888' }}>TOTAL VIAJE</span>
                              <span style={{ fontSize: 16, fontWeight: 900, color: '#111' }}>${montoFinal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {viajes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#ccc' }}>
                <div style={{ fontSize: 36 }}>📊</div>
                <div style={{ fontSize: 13, marginTop: 8, fontWeight: 500 }}>Sin viajes en este periodo</div>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}

// ─── Agenda Calendar helpers ──────────────────────────────────────────────────
const CAL_HOURS = Array.from({ length: 24 }, (_, i) => i);

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

const fmtTime = (s) => new Date(s).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
const fmtDow  = (d) => d.toLocaleString('es', { weekday: 'short' }).toUpperCase().replace('.','');

function getWeekDays(anchor) {
  const d = new Date(anchor); d.setHours(0,0,0,0);
  const dow = d.getDay(); const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => { const x = new Date(d); x.setDate(d.getDate()+i); return x; });
}

function tripStyle(trip, codigoChofer) {
  const isPast = new Date(trip.FechaProgramadaInicio) < new Date();
  if (isPast)                                     return { bg: '#f6f6f6', border: '#d0d0d0', text: '#aaa' };
  if (trip.CodigoUsuarioChofer === codigoChofer)  return { bg: '#fff0f0', border: '#b22222', text: '#b22222' };
  if (trip.CodigoUsuarioChofer)                   return { bg: '#f4f4f4', border: '#999',    text: '#555' };
  return                                                 { bg: '#edfaf1', border: '#22c55e', text: '#14532d' };
}

// ─── AgendaCalendar component ─────────────────────────────────────────────────
function AgendaCalendar({ trips, codigoChofer, onTripSelect, footer }) {
  const [calView,   setCalView]   = useState('week'); // 'day' | 'week'
  const [currentDay, setCurrentDay] = useState(new Date());
  const scrollRef = useRef(null);
  const [nowMin, setNowMin] = useState(() => { const n=new Date(); return n.getHours()*60+n.getMinutes(); });

  useEffect(() => {
    const id = setInterval(() => { const n=new Date(); setNowMin(n.getHours()*60+n.getMinutes()); }, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (calView === 'day' && scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, (nowMin/60)*72 - 150);
    }
  }, [calView, nowMin]);

  const weekDays = getWeekDays(currentDay);
  const today    = new Date(); today.setHours(0,0,0,0);
  const isToday  = isSameDay(currentDay, new Date());

  // Group all trips by date key
  const byDate = {};
  trips.forEach(t => {
    const k = toDateKey(new Date(t.FechaProgramadaInicio));
    if (!byDate[k]) byDate[k] = [];
    byDate[k].push(t);
  });

  const navDay = (dir) => {
    const d = new Date(currentDay);
    d.setDate(d.getDate() + (calView === 'day' ? dir : dir * 7));
    setCurrentDay(d);
  };

  // ── Day view ──
  const renderDay = () => {
    const hourH = 72;
    const dayKey = toDateKey(currentDay);
    const dayTrips = (byDate[dayKey] || []).sort((a,b) => new Date(a.FechaProgramadaInicio)-new Date(b.FechaProgramadaInicio));

    return (
      <div ref={scrollRef} style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch' }}>
        <div style={{ display:'flex', minHeight:'100%' }}>
          {/* Gutter */}
          <div style={{ width:52, flexShrink:0 }}>
            {CAL_HOURS.map(h => (
              <div key={h} style={{ height:hourH, display:'flex', alignItems:'flex-start', justifyContent:'flex-end', paddingRight:8, boxSizing:'border-box' }}>
                <span style={{ fontSize:11, color:'#bbb', fontWeight:500, transform:'translateY(-9px)', display:'block', whiteSpace:'nowrap' }}>
                  {h === 0 ? '' : `${String(h).padStart(2,'0')}:00`}
                </span>
              </div>
            ))}
          </div>
          {/* Events */}
          <div style={{ flex:1, position:'relative', height:hourH*24, borderLeft:'1px solid #f0f0f0' }}>
            {CAL_HOURS.map(h => (
              <div key={h} style={{ position:'absolute', left:0, right:0, top:h*hourH, height:1, background:'#f0f0f0' }} />
            ))}
            {isToday && (
              <div style={{ position:'absolute', left:0, right:0, top:(nowMin/60)*hourH, display:'flex', alignItems:'center', zIndex:10, pointerEvents:'none' }}>
                <div style={{ width:9, height:9, borderRadius:'50%', background:'#ea4335', flexShrink:0 }} />
                <div style={{ flex:1, height:2, background:'#ea4335' }} />
              </div>
            )}
            {dayTrips.map(trip => {
              const mins = new Date(trip.FechaProgramadaInicio).getHours()*60 + new Date(trip.FechaProgramadaInicio).getMinutes();
              const top  = (mins/60)*hourH;
              const h    = Math.max(hourH*0.75, 60);
              const s    = tripStyle(trip, codigoChofer);
              const isPast = new Date(trip.FechaProgramadaInicio) < new Date();
              return (
                <div key={trip.IdOrdenServicio} onClick={() => onTripSelect(trip)}
                  style={{ position:'absolute', left:6, right:6, top, height:h,
                    background:s.bg, borderLeft:`4px solid ${s.border}`, borderRadius:10,
                    padding:'6px 10px', cursor:'pointer', overflow:'hidden',
                    display:'flex', flexDirection:'column', gap:3,
                    boxShadow:'0 2px 6px rgba(0,0,0,0.07)',
                    opacity: isPast ? 0.5 : 1,
                  }}>
                  <span style={{ fontSize:11, fontWeight:700, color:s.border }}>{fmtTime(trip.FechaProgramadaInicio)}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:'#111', textDecoration:isPast?'line-through':'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    #{trip.Folio}
                  </span>
                  <span style={{ fontSize:10, fontWeight:600, color:s.text }}>
                    {trip.CodigoUsuarioChofer === codigoChofer ? '✓ Tu viaje' : trip.NombreChofer || (trip.CodigoUsuarioChofer ? 'Asignado' : 'Disponible')}
                  </span>
                </div>
              );
            })}
            {dayTrips.length === 0 && (
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:13, color:'#ccc', whiteSpace:'nowrap', pointerEvents:'none' }}>
                Sin viajes este día
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Week / agenda view ──
  const renderWeek = () => {
    const hasAny = weekDays.some(d => byDate[toDateKey(d)]?.length);
    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Day pill strip */}
        <div style={{ 
          display:'flex', 
          gap:8, 
          padding:'16px 14px 14px', 
          overflowX:'auto', 
          scrollbarWidth:'none', 
          flexShrink:0, 
          borderBottom:'1px solid #f2f2f2', 
          background:'#fff' 
        }}>
          {weekDays.map((d, i) => {
            const isT   = isSameDay(d, today);
            const isSel = isSameDay(d, currentDay);
            const hasTr = !!(byDate[toDateKey(d)]?.length);
            return (
              <button key={i} onClick={() => { setCurrentDay(new Date(d)); setCalView('day'); }}
                style={{ 
                  display:'flex', 
                  flexDirection:'column', 
                  alignItems:'center', 
                  gap:6, 
                  minWidth:48,
                  padding:'10px 4px 12px', 
                  borderRadius:18, 
                  border:'none', 
                  cursor:'pointer', 
                  position:'relative', 
                  flexShrink:0,
                  background: isSel ? '#1a1a1a' : '#fff', 
                  transition:'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isSel ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                }}>
                <span style={{ 
                  fontSize:10, 
                  fontWeight:800, 
                  letterSpacing:'0.5px',
                  textTransform: 'uppercase',
                  color: isSel ? 'rgba(255,255,255,0.5)' : isT ? '#ea4335' : '#999' 
                }}>
                  {fmtDow(d)}
                </span>
                <span style={{ 
                  fontSize:18, 
                  fontWeight:800, 
                  color: isSel ? '#fff' : isT ? '#ea4335' : '#1a1a1a' 
                }}>
                  {d.getDate()}
                </span>
                {hasTr && !isSel && (
                  <span style={{ 
                    width:4, 
                    height:4, 
                    borderRadius:'50%', 
                    position:'absolute', 
                    bottom:6,
                    background: isT ? '#ea4335' : '#22c55e' 
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Agenda list */}
        <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'14px 14px 32px' }}>
          {!hasAny && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'48px 0', color:'#ccc', gap:10 }}>
              <span style={{ fontSize:36 }}>📅</span>
              <p style={{ fontSize:14, margin:0, fontWeight:500 }}>Sin viajes esta semana</p>
            </div>
          )}
          {weekDays.map((d, di) => {
            const key      = toDateKey(d);
            const dayTrips = (byDate[key] || []).sort((a,b) => new Date(a.FechaProgramadaInicio)-new Date(b.FechaProgramadaInicio));
            if (!dayTrips.length) return null;
            const isT   = isSameDay(d, today);
            const dayLabel = d.toLocaleString('es', { weekday:'long', day:'numeric', month:'long' });
            return (
              <div key={di} style={{ marginBottom:22 }}>
                <div style={{ fontSize:11, fontWeight:700, color: isT ? '#ea4335' : '#bbb',
                  textTransform:'capitalize', letterSpacing:'0.4px',
                  paddingBottom:8, marginBottom:8, borderBottom:'1px solid #f4f4f4' }}>
                  {isT ? 'Hoy · ' : ''}{dayLabel}
                </div>
                {dayTrips.map(trip => {
                  const s = tripStyle(trip, codigoChofer);
                  const isPast = new Date(trip.FechaProgramadaInicio) < new Date();
                  const isMe = trip.CodigoUsuarioChofer === codigoChofer;
                  const driverLabel = isMe ? '✓ Tu viaje' : trip.NombreChofer || (trip.CodigoUsuarioChofer ? trip.CodigoUsuarioChofer : 'Disponible');
                  return (
                    <div key={trip.IdOrdenServicio} onClick={() => onTripSelect(trip)}
                      style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
                        borderRadius:14, borderLeft:`4px solid ${s.border}`, marginBottom:8, cursor:'pointer',
                        background:s.bg, boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
                        opacity: isPast ? 0.55 : 1, transition:'filter 0.15s' }}>
                      {/* Time */}
                      <span style={{ fontSize:13, fontWeight:700, color:s.border, whiteSpace:'nowrap', flexShrink:0, minWidth:48, textDecoration: isPast ? 'line-through' : 'none' }}>
                        {fmtTime(trip.FechaProgramadaInicio)}
                      </span>
                      {/* Info */}
                      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:3 }}>
                        <span style={{ fontSize:15, fontWeight:700, color:'#111', textDecoration: isPast ? 'line-through' : 'none' }}>
                          #{trip.Folio}
                        </span>
                        <span style={{ fontSize:11, color:'#888', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {trip.DireccionOrigen || '—'} → {trip.DireccionDestino || '—'}
                        </span>
                        {/* Driver badge */}
                        <span style={{ fontSize:11, fontWeight:700, color:s.text, display:'inline-flex', alignItems:'center', gap:4 }}>
                          {!trip.CodigoUsuarioChofer && '🟢 '}
                          {isMe && '✓ '}
                          {!isMe && trip.CodigoUsuarioChofer && '👤 '}
                          {driverLabel}
                        </span>
                      </div>
                      {/* Price + arrow */}
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:14, fontWeight:800, color:'#b22222' }}>
                          ${Number(trip.MontoFinal||0).toFixed(0)}
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color:'#ccc', marginTop:2 }}>
                          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
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
    <div style={{
      display:'flex',
      flexDirection:'column',
      ...(footer ? {} : { height:'100%' }),
      background:'#fff',
      borderRadius:24,
      overflow:'hidden',
      boxShadow:'0 2px 20px rgba(0,0,0,0.08)',
      border: '1px solid #f0f0f0'
    }}>
      {/* Calendar header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px 10px', borderBottom:'1px solid #f0f0f0', flexShrink:0 }}>
        <button onClick={() => navDay(-1)} style={{ background:'none', border:'none', width:36, height:36, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#333', fontSize:20 }}>‹</button>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#111', textTransform:'capitalize' }}>
            {calView === 'day'
              ? currentDay.toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long' })
              : (() => { const w=getWeekDays(currentDay); return `${w[0].toLocaleDateString('es-MX',{day:'numeric',month:'short'})} – ${w[6].toLocaleDateString('es-MX',{day:'numeric',month:'short'})}`; })()
            }
          </div>
          {!isSameDay(currentDay, new Date()) && (
            <button onClick={() => setCurrentDay(new Date())}
              style={{ background:'none', border:'none', padding:0, fontSize:11, color:'#ea4335', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              Hoy
            </button>
          )}
        </div>
        <button onClick={() => navDay(1)} style={{ background:'none', border:'none', width:36, height:36, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#333', fontSize:20 }}>›</button>
      </div>

      {/* View toggle & Legend */}
      <div style={{ 
        display:'flex', 
        alignItems: 'center',
        padding:'10px 14px', 
        gap:8, 
        flexShrink:0, 
        borderBottom:'1px solid #f2f2f2' 
      }}>
        <div style={{ display:'flex', background:'#f4f4f7', borderRadius:20, padding:2 }}>
          {[['week','Semana'],['day','Día']].map(([key, label]) => (
            <button key={key} onClick={() => setCalView(key)}
              style={{ 
                padding:'6px 16px', 
                borderRadius:18, 
                border:'none', 
                cursor:'pointer', 
                fontWeight:800, 
                fontSize:11, 
                fontFamily:'inherit',
                transition:'all 0.2s',
                background: calView===key ? '#1a1a1a' : 'transparent', 
                color: calView===key ? '#fff' : '#666' 
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginLeft:'auto', fontSize:10, color:'#999', fontWeight:600 }}>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e' }} /> Libre
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#b22222' }} /> Tuyo
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#d0d0d0' }} /> Asignado
          </div>
        </div>
      </div>

      {calView === 'day' ? renderDay() : renderWeek()}

      {footer && (
        <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px 14px 4px' }}>
          {footer}
        </div>
      )}
    </div>
  );
}

// ─── Agenda General: row card ─────────────────────────────────────────────────
function AgendaCard({ trip, codigoChofer, isPast, onPreview }) {
  const isMyTrip   = trip.CodigoUsuarioChofer === codigoChofer;
  const isAssigned = !!trip.CodigoUsuarioChofer;

  return (
    <div
      onClick={() => onPreview(trip)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        background: isPast ? '#fafafa' : '#fff',
        borderRadius: 14,
        marginBottom: 8,
        cursor: 'pointer',
        opacity: isPast ? 0.55 : 1,
        border: isMyTrip
          ? '1.5px solid #b22222'
          : isAssigned
            ? '1.5px solid #d0d0d0'
            : '1.5px solid #e8e8e8',
        boxShadow: isPast ? 'none' : '0 1px 6px rgba(0,0,0,0.07)',
        transition: 'box-shadow 0.15s',
        position: 'relative',
      }}
    >
      {/* Time column */}
      <div style={{ minWidth: 42, textAlign: 'center', flexShrink: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 800,
          color: isPast ? '#aaa' : '#1a1a1a',
          textDecoration: isPast ? 'line-through' : 'none',
        }}>
          {new Date(trip.FechaProgramadaInicio).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div style={{ fontSize: 10, color: '#b22222', fontWeight: 700 }}>
          ${Number(trip.MontoFinal || 0).toFixed(0)}
        </div>
      </div>

      {/* Vertical line */}
      <div style={{ width: 2, alignSelf: 'stretch', borderRadius: 2, background: isMyTrip ? '#b22222' : isAssigned ? '#aaa' : '#d0d0d0', flexShrink: 0 }} />

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Folio */}
        <div style={{ fontSize: 10, fontWeight: 700, color: '#888', letterSpacing: '0.05em', marginBottom: 1 }}>
          #{trip.Folio}
        </div>
        {/* Origin */}
        <div style={{
          fontSize: 12, fontWeight: 600,
          color: isPast ? '#aaa' : '#1a1a1a',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          textDecoration: isPast ? 'line-through' : 'none',
        }}>
          {trip.DireccionOrigen || '—'}
        </div>
        {/* Destination */}
        <div style={{
          fontSize: 11, color: isPast ? '#bbb' : '#6b6b6b',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          textDecoration: isPast ? 'line-through' : 'none',
        }}>
          → {trip.DireccionDestino || '—'}
        </div>

        {/* Driver status */}
        <div style={{ marginTop: 5 }}>
          {isMyTrip ? (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#b22222', background: '#fff0f0', borderRadius: 20, padding: '2px 8px' }}>
              ✓ Tu viaje
            </span>
          ) : isAssigned ? (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#555', background: '#f0f0f0', borderRadius: 20, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 12 }}>👤</span>
              {trip.NombreChofer || trip.CodigoUsuarioChofer}
            </span>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#2e7d32', background: '#e8f5e9', borderRadius: 20, padding: '2px 8px' }}>
              Disponible
            </span>
          )}
        </div>
      </div>

      {/* Chevron */}
      <div style={{ color: '#ccc', fontSize: 16, flexShrink: 0 }}>›</div>
    </div>
  );
}

// ─── Agenda Preview Panel ──────────────────────────────────────────────────────
function AgendaPreviewPanel({ trip, codigoChofer, onClose, onAccepted }) {
  const [accepting, setAccepting] = useState(false);
  const [feedback,  setFeedback]  = useState('');

  const isMyTrip   = trip.CodigoUsuarioChofer === codigoChofer;
  const isAssigned = !!trip.CodigoUsuarioChofer;
  const isPast     = new Date(trip.FechaProgramadaInicio) < new Date();

  const handleAceptar = async () => {
    setAccepting(true);
    setFeedback('');
    try {
      const res = await fetch(`${SAFAR_API}aceptar_viaje.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigoChofer, idDestino: trip.IdDestino }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('✓ Viaje aceptado');
        onAccepted();
      } else {
        setFeedback(data.message || 'Error al aceptar.');
      }
    } catch (_) {
      setFeedback('Error de conexión.');
    } finally {
      setAccepting(false);
    }
  };

  return (
    /* Overlay */
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '92vh',
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          overflowY: 'auto',
          padding: '0 0 32px',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#ddd' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px 12px' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Reserva #{trip.Folio}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>
              {new Date(trip.FechaProgramadaInicio).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' · '}
              {new Date(trip.FechaProgramadaInicio).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f0f0f0', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>×</button>
        </div>

        {/* Map */}
        {(trip.LatitudOrigen && trip.LatitudDestino) && (
          <div style={{ margin: '0 18px 14px' }}>
            <TripMap trip={trip} />
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 8, margin: '0 18px 14px' }}>
          <div style={{ flex: 1, textAlign: 'center', background: '#f6f6f6', borderRadius: 12, padding: '10px 6px' }}>
            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#b22222' }}>${Number(trip.MontoFinal || 0).toFixed(2)}</div>
          </div>
          {trip.Distancia && (
            <div style={{ flex: 1, textAlign: 'center', background: '#f6f6f6', borderRadius: 12, padding: '10px 6px' }}>
              <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distancia</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{trip.Distancia}</div>
            </div>
          )}
          {trip.TiempoEstimado && (
            <div style={{ flex: 1, textAlign: 'center', background: '#f6f6f6', borderRadius: 12, padding: '10px 6px' }}>
              <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tiempo</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{trip.TiempoEstimado}</div>
            </div>
          )}
        </div>

        {/* Route */}
        <div style={{ margin: '0 18px 14px', background: '#f6f6f6', borderRadius: 14, padding: '12px 14px' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1a1a1a', flexShrink: 0 }} />
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{trip.DireccionOrigen || '—'}</div>
          </div>
          <div style={{ width: 2, height: 14, background: '#ddd', marginLeft: 4, marginBottom: 6 }} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#b22222', flexShrink: 0 }} />
            <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{trip.DireccionDestino || '—'}</div>
          </div>
          {trip.NombreCliente && (
            <div style={{ marginTop: 8, fontSize: 11, color: '#888' }}>Cliente: {trip.NombreCliente}</div>
          )}
        </div>

        {/* Driver assignment — prominent block */}
        <div style={{ margin: '0 18px 18px' }}>
          {isMyTrip ? (
            <div style={{ background: '#fff0f0', border: '1.5px solid #f5b5b5', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 28 }}>✅</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#b22222' }}>Este es tu viaje</div>
                <div style={{ fontSize: 11, color: '#888' }}>Ya lo tienes asignado</div>
              </div>
            </div>
          ) : isAssigned ? (
            <div style={{ background: '#f4f4f4', border: '1.5px solid #e0e0e0', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 28 }}>👤</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#333' }}>{trip.NombreChofer || trip.CodigoUsuarioChofer}</div>
                <div style={{ fontSize: 11, color: '#888' }}>Chofer asignado · {trip.UnidadChofer || '—'}</div>
              </div>
            </div>
          ) : (
            <div style={{ background: '#e8f5e9', border: '1.5px solid #a5d6a7', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 28 }}>🟢</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#2e7d32' }}>Sin chofer asignado</div>
                <div style={{ fontSize: 11, color: '#555' }}>Disponible para tomar</div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback */}
        {feedback && (
          <div style={{
            margin: '0 18px 14px',
            background: feedback.startsWith('✓') ? '#e8f5e9' : '#fdecea',
            color: feedback.startsWith('✓') ? '#2e7d32' : '#b71c1c',
            borderRadius: 10, padding: '8px 14px', fontSize: 12, fontWeight: 600,
          }}>
            {feedback}
          </div>
        )}

        {/* Action button */}
        {!isPast && !isMyTrip && codigoChofer && (
          <div style={{ padding: '0 18px' }}>
            <button
              onClick={handleAceptar}
              disabled={accepting}
              style={{
                width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                background: isAssigned ? '#555' : '#1a1a1a',
                color: '#fff', fontSize: 15, fontWeight: 800, cursor: accepting ? 'wait' : 'pointer',
                opacity: accepting ? 0.7 : 1,
              }}
            >
              {accepting ? 'Procesando...' : isAssigned ? 'Tomar de todas formas' : 'Aceptar viaje'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente de Viaje en Tiempo Real ───────────────────────────────────────
function ViajeActivoPanel({ trip, pos, onUpdateStatus, onComplete }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const driverMarker = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) return;

    const lat = Number(trip.LatitudOrigen) || 31.69;
    const lng = Number(trip.LongitudOrigen) || -106.42;

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const iconA = L.divIcon({
      html: `<div style="width:24px;height:24px;border-radius:50%;background:#1a1a1a;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:10px;box-shadow:0 2px 5px rgba(0,0,0,0.3)">A</div>`,
      iconSize: [24, 24],
      className: '',
    });
    const iconB = L.divIcon({
      html: `<div style="width:24px;height:24px;border-radius:50%;background:#b22222;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:10px;box-shadow:0 2px 5px rgba(0,0,0,0.3)">B</div>`,
      iconSize: [24, 24],
      className: '',
    });

    if (trip.LatitudOrigen && trip.LongitudOrigen) {
      L.marker([Number(trip.LatitudOrigen), Number(trip.LongitudOrigen)], { icon: iconA }).addTo(map);
    }
    if (trip.LatitudDestino && trip.LongitudDestino) {
      L.marker([Number(trip.LatitudDestino), Number(trip.LongitudDestino)], { icon: iconB }).addTo(map);
    }

    if (trip.GeoJSON_Ruta) {
      L.geoJSON(trip.GeoJSON_Ruta, { style: { color: '#1a1a1a', weight: 4, opacity: 0.8 } }).addTo(map);
    }

    // Marcador del Chofer (Mismo diseño Premium que el Monitor de Flota)
    const color = "#b22222";
    const size = 36;
    const iconDriver = L.divIcon({
      html: `
            <div class="vehicle-marker-wrapper" style="width: ${size}px; height: ${size}px; position: relative; perspective: 1000px;">
                <div class="pulse-ring ring-1" style="border-color: ${color}4d;"></div>
                <div class="pulse-ring ring-2" style="border-color: ${color}26;"></div>
                <div class="vehicle-icon-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 512 512" width="${size}" height="${size}" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); transform: rotate(-90deg);">
                        <defs>
                            <linearGradient id="bodyGrad_${size}_p" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#3d000f;stop-opacity:1" />
                            </linearGradient>
                            <linearGradient id="glassGrad_${size}" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style="stop-color:rgba(255,255,255,0.7);stop-opacity:1" />
                                <stop offset="100%" style="stop-color:rgba(255,255,255,0.2);stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <path fill="url(#bodyGrad_${size}_p)" stroke="#fff" stroke-width="10" 
                              d="M128 160c0-44.2 35.8-80 80-80h96c44.2 0 80 35.8 80 80v224c0 35.3-28.7 64-64 64H192c-35.3 0-64-28.7-64-64V160z"/>
                        <path fill="url(#glassGrad_${size})" 
                              d="M164 160c0-17.7 14.3-32 32-32h120c17.7 0 32 14.3 32 32v48H164v-48z"/>
                        <rect x="160" y="420" width="40" height="12" rx="4" fill="#ff0000" opacity="0.8"/>
                        <rect x="312" y="420" width="40" height="12" rx="4" fill="#ff0000" opacity="0.8"/>
                        <path fill="#fff" d="M160 88h32v8h-32zM320 88h32v8h-32z" opacity="0.9"/>
                    </svg>
                </div>
            </div>
            <style>
                .pulse-ring {
                    position: absolute;
                    top: -50%; left: -50%;
                    width: 200%; height: 200%;
                    border-radius: 50%;
                    border: 4px solid;
                    animation: m-pulse 3s cubic-bezier(0.2, 0, 0.2, 1) infinite;
                }
                .ring-2 { animation-delay: 1.5s; }
                @keyframes m-pulse { 0% { transform: scale(0.4); opacity: 1; } 100% { transform: scale(1.1); opacity: 0; } }
            </style>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      className: '',
    });
    driverMarker.current = L.marker([lat, lng], { icon: iconDriver }).addTo(map);

    mapInstance.current = map;
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, [trip.IdOrdenServicio]);

  // Actualizar posición del chofer
  useEffect(() => {
    if (pos && driverMarker.current && mapInstance.current) {
      driverMarker.current.setLatLng(pos);
      // Solo centrar si el chofer está lejos del centro actual
      const center = mapInstance.current.getCenter();
      const dist = mapInstance.current.distance(center, pos);
      if (dist > 500) mapInstance.current.panTo(pos);
    }
  }, [pos]);

  const status = trip.CodigoEstatus;

  // Clasificar tipo de pago para el panel
  const metodo = (trip.MetodoPago || '').toUpperCase();
  const efectivoPendiente = Number(trip.EfectivoPendiente || 0);
  const montoTotal = Number(trip.MontoFinal || 0);
  const montoDeposito = Number(trip.MontoDeposito || 0);
  const esPagadoCompleto = efectivoPendiente <= 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1060, background: '#f0f0f0', display: 'flex', flexDirection: 'column' }}>

      {/* Mapa: ocupa TODO el espacio disponible */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* ── Header flotante minimalista (TOP) ── */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1001, padding: '12px 14px 0' }}>
          {/* Folio + Estatus */}
          <div style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)', borderRadius: 18, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: '#b22222', borderRadius: 10, padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Navigation size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.2, color: '#111' }}>#{trip.Folio}</div>
                <div style={{ fontSize: 10, color: '#b22222', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{ESTATUS_CONFIG[status]?.label || status}</div>
              </div>
            </div>
            <button
              onClick={() => onComplete(null)}
              style={{ background: '#f0f0f0', border: 'none', borderRadius: 20, padding: '6px 14px', fontWeight: 700, fontSize: 12, color: '#333', cursor: 'pointer' }}
            >Minimizar</button>
          </div>

          {/* Card de Destino – debajo del header */}
          <div style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)', borderRadius: 16, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Destino</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.DireccionDestino}</div>
            </div>
            <button
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${trip.LatitudDestino},${trip.LongitudDestino}&travelmode=driving`, '_blank')}
              style={{ background: '#1a1a1a', border: 'none', borderRadius: 12, padding: '8px 14px', color: '#fff', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, cursor: 'pointer' }}
            >
              <Navigation size={13} /> GPS
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom Sheet Premium ── */}
      <div style={{ background: '#fff', borderRadius: '28px 28px 0 0', padding: '8px 20px 28px', boxShadow: '0 -8px 30px rgba(0,0,0,0.15)', minHeight: 200 }}>

        {/* Drag handle visual */}
        <div style={{ width: 36, height: 4, background: '#e0e0e0', borderRadius: 2, margin: '0 auto 16px' }} />

        {/* ── Badge de estado de pago ── */}
        {esPagadoCompleto ? (
          <div style={{ background: '#f0faf5', border: '1.5px solid #22c55e', borderRadius: 12, padding: '8px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>✅</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#16a34a' }}>VIAJE PAGADO</div>
              <div style={{ fontSize: 10, color: '#555' }}>Pago completo recibido — {metodo === 'STRIPE' ? 'Tarjeta/Stripe' : 'Depósito bancario'}</div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#fffbeb', border: '1.5px solid #f59e0b', borderRadius: 12, padding: '8px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>💵</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#b45309' }}>COBRAR EN EFECTIVO</div>
              <div style={{ fontSize: 10, color: '#555' }}>
                {metodo === 'EFECTIVO_DEPOSITO'
                  ? `Depósito: $${montoDeposito.toFixed(2)} — Restante: $${efectivoPendiente.toFixed(2)}`
                  : `Total en efectivo: $${efectivoPendiente.toFixed(2)}`}
              </div>
            </div>
          </div>
        )}

        {/* ── Info Cliente ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {trip.FotoCliente ? (
              <img src={`${SAFAR_API}${trip.FotoCliente}`} alt="Pasajero"
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
            )}
            <div>
              <div style={{ fontSize: 10, color: '#aaa', fontWeight: 700, textTransform: 'uppercase' }}>Pasajero</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>{trip.NombreCliente || trip.CodigoUsuarioCliente || 'Sin identificar'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              disabled={!trip.TelefonoCliente}
              onClick={() => trip.TelefonoCliente && (window.location.href = `tel:${trip.TelefonoCliente}`)}
              style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid #22c55e', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: trip.TelefonoCliente ? 1 : 0.3 }}
            ><Phone size={18} color="#22c55e" /></button>
            <button
              disabled={!trip.TelefonoCliente}
              onClick={() => trip.TelefonoCliente && window.open(`https://wa.me/${trip.TelefonoCliente?.replace(/\D/g,'')}`, '_blank')}
              style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid #22c55e', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: trip.TelefonoCliente ? 1 : 0.3 }}
            ><MessageSquare size={18} color="#22c55e" /></button>
          </div>
        </div>

        {/* ── Botón de Acción Principal ── */}
        {status === 'EN_CAMINO' && (
          <button onClick={() => onUpdateStatus('LLEGADO')}
            style={{ width: '100%', padding: '16px', borderRadius: 18, border: 'none', background: '#1a1a1a', color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
          >📍 Llegué al origen</button>
        )}
        {status === 'LLEGADO' && (
          <button onClick={() => onUpdateStatus('INICIADO')}
            style={{ width: '100%', padding: '16px', borderRadius: 18, border: 'none', background: '#b22222', color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 4px 15px rgba(178,34,34,0.4)' }}
          >🚀 Pasajero a bordo — Iniciar</button>
        )}
        {status === 'INICIADO' && (
          <button onClick={() => onUpdateStatus('SOLICITAR_PAGO')}
            style={{ width: '100%', padding: '16px', borderRadius: 18, border: 'none', background: esPagadoCompleto ? '#16a34a' : '#f59e0b', color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: `0 4px 15px ${esPagadoCompleto ? 'rgba(22,163,74,0.35)' : 'rgba(245,158,11,0.35)'}` }}
          >{esPagadoCompleto ? '✅ Finalizar Viaje (Pagado)' : '💵 Finalizar y Cobrar'}</button>
        )}
      </div>
    </div>
  );
}

// ─── Carga de Choferes (read-only workload panel) ────────────────────────────
function CargaChoferesPanel() {
  const [choferes, setChoferes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recomendacion, setRecomendacion] = useState('');

  useEffect(() => {
    const fetchDisponibilidad = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const fecha = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:00`;
        const res = await fetch(`${SAFAR_API}verificar_disponibilidad.php?fecha=${encodeURIComponent(fecha)}&ventana_minutos=60`);
        const data = await res.json();
        if (data.success) {
          setChoferes(data.choferes || []);
          setRecomendacion(data.recomendacion || '');
        } else {
          setError(data.message || 'Error al cargar disponibilidad.');
        }
      } catch {
        setError('Error de conexión.');
      } finally {
        setLoading(false);
      }
    };
    fetchDisponibilidad();
  }, []);

  const choferesOrdenados = [...choferes].sort((a, b) => {
    if (a.codigo_chofer === recomendacion) return -1;
    if (b.codigo_chofer === recomendacion) return 1;
    return a.porcentaje_carga - b.porcentaje_carga;
  });

  const disponibles = choferes.filter(c => c.disponible).length;
  const total = choferes.length;

  return (
    <div style={{ marginTop: 24, borderTop: '2px dashed #eee', paddingTop: 16 }}>
      {/* Section header */}
      <div style={{ fontSize: 12, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <Users size={14} /> Carga de choferes
        {!loading && total > 0 && (
          <span style={{ background: disponibles > 0 ? '#d1fae5' : '#fef2f2', color: disponibles > 0 ? '#16a34a' : '#dc2626', borderRadius: 20, fontSize: 9, fontWeight: 800, padding: '2px 8px' }}>
            {disponibles}/{total} libre{disponibles !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 20, color: '#888', fontSize: 13 }}>Cargando...</div>
      ) : error ? (
        <div style={{ background: '#fdecea', color: '#b71c1c', borderRadius: 12, padding: 12, fontSize: 12 }}>{error}</div>
      ) : (
        <div>
          {/* Summary */}
          <div style={{ background: '#f8f8f8', borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 10, color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Choferes disponibles</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#111' }}>
                  {disponibles} <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>de {total}</span>
                </div>
              </div>
              <div style={{ background: disponibles > 0 ? '#d1fae5' : '#fef2f2', color: disponibles > 0 ? '#16a34a' : '#dc2626', borderRadius: 12, padding: '7px 13px', fontSize: 12, fontWeight: 700 }}>
                {disponibles > 0 ? '✓ Disponible' : '✗ Saturado'}
              </div>
            </div>
            {recomendacion && (
              <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, flexWrap: 'nowrap', overflow: 'hidden' }}>
                <Star size={13} color="#f59e0b" style={{ flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                  Recomendamos: <strong>{choferes.find(c => c.codigo_chofer === recomendacion)?.nombre}</strong>{' '}
                  <span style={{ opacity: 0.7 }}>(menor carga)</span>
                </span>
              </div>
            )}
          </div>

          {/* Driver list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {choferesOrdenados.map(chofer => {
              const isRecomendado = chofer.codigo_chofer === recomendacion;
              const colorCarga = chofer.porcentaje_carga < 50 ? '#22c55e' : chofer.porcentaje_carga < 80 ? '#f59e0b' : '#ef4444';
              return (
                <div key={chofer.codigo_chofer} style={{ background: '#fff', border: `1.5px solid ${chofer.disponible ? '#e8e8e8' : '#f0f0f0'}`, borderRadius: 14, padding: '12px 14px', opacity: chofer.disponible ? 1 : 0.6, position: 'relative', overflow: 'hidden' }}>
                  {isRecomendado && (
                    <div style={{ position: 'absolute', top: 0, right: 0, background: '#f59e0b', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: '0 12px 0 10px', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={9} /> RECOMENDADO
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: colorCarga, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                      <User size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{chofer.nombre}</div>
                      <div style={{ fontSize: 11, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Car size={11} /> {chofer.unidad || 'Sin unidad'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: '#888' }}>{chofer.viajes_en_ventana} / {chofer.max_viajes} viaje/hr</span>
                    <span style={{ fontWeight: 700, color: colorCarga }}>{chofer.porcentaje_carga}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: '#f0f0f0', overflow: 'hidden' }}>
                    <div style={{ width: `${chofer.porcentaje_carga}%`, height: '100%', background: colorCarga, borderRadius: 3, transition: 'width 0.3s ease' }} />
                  </div>
                  {chofer.disponible ? (
                    <div style={{ marginTop: 6, fontSize: 11, color: '#22c55e', fontWeight: 600 }}>
                      ✓ {chofer.slots_disponibles} slot{chofer.slots_disponibles !== 1 ? 's' : ''} disponible
                    </div>
                  ) : (
                    <div style={{ marginTop: 6, fontSize: 11, color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={11} /> Saturado — No disponible en este horario
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SafarViajes({ user, pos }) {
  const [trips, setTrips]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [activeTab, setActiveTab]         = useState('viajes'); // 'viajes' | 'disponibles' | 'ganancias'
  const [showHistorial, setShowHistorial] = useState(false);
  const [agendaTrips, setAgendaTrips]     = useState([]);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [totalDrivers, setTotalDrivers]   = useState(1);
  const [codigoChofer, setCodigoChofer]   = useState(user?.usuario || '');
  const [previewTrip, setPreviewTrip]     = useState(null);

  // --- NUEVOS ESTADOS PARA OPERATIVA ---
  const [activeTrip, setActiveTrip]   = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [updating, setUpdating]       = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // --- ESTADOS PARA COBRO INLINE ---
  const [montoCobrado, setMontoCobrado]   = useState('');
  const [incidencia, setIncidencia]       = useState('NINGUNA');
  const [observaciones, setObservaciones] = useState('');
  const [cobroError, setCobroError]       = useState('');
  const [esCambio, setEsCambio]           = useState(false); // true=dar cambio, false=propina

  // Resolve codigoChofer once on mount if not in user object
  useEffect(() => {
    if (codigoChofer) return;
    if (!user?.usuario_id) {
      setLoading(false);
      return;
    }
    fetch(`${BASE_API}empleados/usuario/get_usuario_login.php?usuario_id=${user.usuario_id}`)
      .then(r => r.json())
      .then(d => { 
        if (d?.usuario) {
          setCodigoChofer(d.usuario);
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [user, codigoChofer]);

  const fetchAgenda = useCallback(async () => {
    const chofer = codigoChofer;
    if (!chofer) {
      setError('Cierra sesión y vuelve a iniciarla para cargar tu agenda Safar.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${SAFAR_API}driver_agenda.php?codigoChofer=${encodeURIComponent(chofer)}&t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setTrips(data.trips || []);
        setError('');
      } else {
        setError(data.message || 'Error al cargar agenda.');
      }
    } catch (_) {
      setError('Error de conexión con Safar.');
    } finally {
      setLoading(false);
    }
  }, [codigoChofer]);

  const fetchAgendaGeneral = useCallback(async () => {
    setAgendaLoading(true);
    try {
      const res = await fetch(`${SAFAR_API}agenda_general.php?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setAgendaTrips(data.trips || []);
        setTotalDrivers(data.total_drivers || 1);
      }
    } catch (_) {}
    finally {
      setAgendaLoading(false);
    }
  }, []);

  useEffect(() => {
    if (codigoChofer) fetchAgenda();
  }, [fetchAgenda, codigoChofer]);

  // Cargar agenda general al iniciar (para mostrar viajes disponibles)
  useEffect(() => {
    fetchAgendaGeneral();
  }, [fetchAgendaGeneral]);

  // Auto-refresh cada 30s — chofer no toca pantalla
  useEffect(() => {
    if (!codigoChofer) return;
    const id = setInterval(() => { fetchAgenda(); fetchAgendaGeneral(); }, 30000);
    return () => clearInterval(id);
  }, [fetchAgenda, fetchAgendaGeneral, codigoChofer]);

  const ahora = new Date();
  const proximos  = trips.filter(t => new Date(t.FechaProgramadaInicio) >= ahora && t.CodigoEstatus !== 'CANCELADO');
  const historial = trips.filter(t => new Date(t.FechaProgramadaInicio) <  ahora || t.CodigoEstatus === 'CANCELADO' || t.CodigoEstatus === 'COMPLETADO');

  const totalPendiente = trips
    .filter(t => t.CodigoEstatus !== 'CANCELADO')
    .reduce((acc, t) => acc + Number(t.EfectivoPendiente || 0), 0);

  // Auto-detectar viaje activo
  useEffect(() => {
    // Calculamos temporales aquí para no depender de variables que cambian en cada render
    const tpProx = trips.filter(t => new Date(t.FechaProgramadaInicio) >= new Date() && t.CodigoEstatus !== 'CANCELADO');
    const running = tpProx.find(t => ['EN_CAMINO', 'LLEGADO', 'INICIADO'].includes(t.CodigoEstatus));
    
    if (running) {
       // Si el viaje activo cambió, lo actualizamos
       if (!activeTrip || activeTrip.IdOrdenServicio !== running.IdOrdenServicio || activeTrip.CodigoEstatus !== running.CodigoEstatus) {
         setActiveTrip(running);
       }
    } else {
      setActiveTrip(null);
      setIsMinimized(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trips]);

  const handleUpdateStatus = async (arg1, arg2 = null) => {
    let id = null;
    let newStatus = null;

    if (typeof arg1 === 'object' && arg1 !== null) {
      // Caso 1: handleUpdateStatus(tripObject, 'NUEVO_ESTATUS')
      id = arg1.IdOrdenServicio;
      newStatus = arg2;
    } else if (typeof arg1 === 'string' && arg2 === null) {
      // Caso 2: handleUpdateStatus('NUEVO_ESTATUS') -> usa el activeTrip
      id = activeTrip?.IdOrdenServicio;
      newStatus = arg1;
    } else {
      // Caso 3: handleUpdateStatus(id, 'NUEVO_ESTATUS')
      id = arg1;
      newStatus = arg2;
    }
    
    if (!id) {
      alert("⚠️ No hay un viaje activo identificado.");
      return;
    }

    if (newStatus === 'SOLICITAR_PAGO') {
      setShowPayModal(true);
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`${SAFAR_API}actualizar_estatus_viaje.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ IdOrdenServicio: id, NuevoEstatus: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchAgenda(); // Recargar datos
      } else {
        alert("❌ " + (data.message || "Error al actualizar estatus"));
      }
    } catch (e) {
      console.error("Error en updateStatus:", e);
      alert("⚠️ Error de conexión al actualizar estatus. Por favor verifica tu internet.");
    } finally {
      setUpdating(false);
    }
  };

  // Reset cobro form cuando abre el modal de pago
  useEffect(() => {
    if (showPayModal) {
      setMontoCobrado('');
      setIncidencia('NINGUNA');
      setObservaciones('');
      setCobroError('');
      setEsCambio(false);
    }
  }, [showPayModal]);

  const handleConfirmarCobro = async () => {
    if (!activeTrip) return;
    const montoEsperado = Number(activeTrip.EfectivoPendiente || 0);
    if (montoEsperado > 0 && (!montoCobrado || parseFloat(montoCobrado) < 0)) {
      setCobroError('Ingresa el monto cobrado.');
      return;
    }
    setUpdating(true);
    setCobroError('');
    try {
      const r1 = await fetch(`${SAFAR_API}registrar_cobro_efectivo.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          IdOrdenServicio: activeTrip.IdOrdenServicio,
          CodigoChofer: codigoChofer,
          MontoCobrado: montoEsperado > 0
            ? (esCambio ? montoEsperado : parseFloat(montoCobrado))
            : 0,
          Incidencia: incidencia,
          Observaciones: observaciones,
        }),
      });
      const d1 = await r1.json();
      if (!d1.success) { setCobroError(d1.message || 'Error al registrar cobro.'); setUpdating(false); return; }

      const r2 = await fetch(`${SAFAR_API}actualizar_estatus_viaje.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ IdOrdenServicio: activeTrip.IdOrdenServicio, NuevoEstatus: 'COMPLETADO' }),
      });
      const d2 = await r2.json();
      if (d2.success) {
        setShowPayModal(false);
        setMontoCobrado('');
        setIncidencia('NINGUNA');
        setObservaciones('');
        setActiveTrip(null);
        setIsMinimized(false);
        fetchAgenda();
      } else {
        setCobroError(d2.message || 'Error al completar viaje.');
      }
    } catch (_) {
      setCobroError('Error de conexión.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-danger mb-3" role="status" />
        <span className="text-muted fw-semibold">Cargando agenda Safar...</span>
      </div>
    );
  }

  // error se muestra inline, no bloquea la vista de disponibles

  // Viajes sin chofer asignado, pendientes de aceptar
  const allAvailable = agendaTrips.filter(
    t => !t.CodigoUsuarioChofer && t.CodigoEstatus === 'PENDIENTE'
  );

  // Separar en próximos e historial (pasados)
  const ahoraJS = new Date();
  const upcomingAvailable = allAvailable.filter(
    t => t.FechaProgramadaInicio && new Date(t.FechaProgramadaInicio) >= ahoraJS
  );
  const pastAvailable = allAvailable.filter(
    t => t.FechaProgramadaInicio && new Date(t.FechaProgramadaInicio) < ahoraJS
  );

  const availableTripsCount = upcomingAvailable.length;

  return (
    <div>
      {/* Error inline */}
      {error && (
        <div className="alert alert-danger rounded-4 shadow-sm mb-3" style={{ fontSize: 12 }}>{error}</div>
      )}

      {/* ── Header: tabs + efectivo en una fila ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', background: '#f4f4f7', borderRadius: 12, padding: 3, gap: 2, flex: 1 }}>
          {[
            { key: 'viajes',      label: 'Mis Viajes',  badge: proximos.length },
            { key: 'disponibles', label: 'Disponibles', badge: availableTripsCount },
            { key: 'ganancias',   label: 'Ganancias',   badge: null },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex: 1, padding: '7px 4px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 11, fontFamily: 'inherit',
              transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              background: activeTab === tab.key ? '#800020' : 'transparent',
              color: activeTab === tab.key ? '#fff' : '#888',
            }}>
              {tab.label}
              {tab.badge !== null && tab.badge > 0 && (
                <span style={{
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.3)' : '#800020',
                  color: '#fff', borderRadius: 20, fontSize: 9, fontWeight: 900,
                  padding: '1px 5px', lineHeight: 1.4,
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Mis Viajes ── */}
      {activeTab === 'viajes' && (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 420 }}>
          <AgendaCalendar
            trips={trips}
            codigoChofer={codigoChofer}
            onTripSelect={(trip) => setPreviewTrip(trip)}
          />

          {/* Lista de próximos viajes debajo de la agenda */}
          <div style={{ marginTop: 24, paddingBottom: 20 }}>
            <div style={{ 
              fontSize: 12, 
              fontWeight: 800, 
              color: '#888', 
              textTransform: 'uppercase', 
              letterSpacing: 1,
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ width: 4, height: 16, background: '#800020', borderRadius: 2 }}></span>
              Próximos Viajes ({proximos.length})
            </div>
            
            {proximos.length > 0 ? (
              proximos.map(trip => (
                <TripCard 
                  key={trip.IdOrdenServicio} 
                  trip={trip} 
                  onStart={handleUpdateStatus} 
                />
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px 20px', 
                background: '#f9f9f9', 
                borderRadius: 16,
                color: '#aaa',
                fontSize: 13
              }}>
                No tienes viajes programados próximamente.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Disponibles ── */}
      {activeTab === 'disponibles' && (
        <div>
          <AgendaCalendar
            trips={agendaTrips}
            codigoChofer={codigoChofer}
            onTripSelect={(trip) => setPreviewTrip(trip)}
            footer={
              <div style={{ paddingBottom: 12 }}>
                {/* Header con contador y refresh */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>
                    {agendaLoading ? 'Buscando...' : (
                      upcomingAvailable.length > 0
                        ? <span>{upcomingAvailable.length} viaje{upcomingAvailable.length !== 1 ? 's' : ''} disponible{upcomingAvailable.length !== 1 ? 's' : ''}</span>
                        : <span style={{ color: '#aaa' }}>Sin nuevos viajes</span>
                    )}
                  </div>
                  <button
                    onClick={fetchAgendaGeneral}
                    disabled={agendaLoading}
                    style={{
                      background: 'none', border: '1.5px solid #e0e0e0', borderRadius: 20,
                      padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      color: '#555', display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    <span style={{ display: 'inline-block', transition: 'transform 0.4s', transform: agendaLoading ? 'rotate(360deg)' : 'none' }}>↻</span>
                    Actualizar
                  </button>
                </div>

                {agendaLoading && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ height: 90, borderRadius: 16, background: '#f5f5f5', animation: 'pulse 1.5s ease infinite' }} />
                    ))}
                  </div>
                )}

                {!agendaLoading && allAvailable.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '50px 20px', color: '#ccc' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🕐</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#999', marginBottom: 6 }}>Sin viajes por ahora</div>
                    <div style={{ fontSize: 12, color: '#bbb' }}>Actualiza para ver nuevos viajes disponibles</div>
                  </div>
                )}

                {!agendaLoading && (() => {
                  const grupos = {};
                  upcomingAvailable.forEach(t => {
                    const d = t.FechaProgramadaInicio ? new Date(t.FechaProgramadaInicio).toDateString() : 'Sin fecha';
                    if (!grupos[d]) grupos[d] = [];
                    grupos[d].push(t);
                  });

                  const renderGrupo = (g) => Object.entries(g).map(([dia, viajes]) => {
                    const labelDia = dia !== 'Sin fecha'
                      ? new Date(dia).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
                      : 'Sin fecha';
                    return (
                      <div key={dia} style={{ marginBottom: 20 }}>
                        <div style={{
                          fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1,
                          color: '#888', marginBottom: 10, paddingBottom: 6,
                          borderBottom: '1px solid #f0f0f0',
                        }}>
                          📅 {labelDia} · {viajes.length} viaje{viajes.length !== 1 ? 's' : ''}
                        </div>
                        {viajes.map(t => (
                          <AvailableCard
                            key={t.IdOrdenServicio || t.IdDestino}
                            trip={t}
                            codigoChofer={codigoChofer}
                            onAccepted={fetchAgendaGeneral}
                          />
                        ))}
                      </div>
                    );
                  });

                  return renderGrupo(grupos);
                })()}

                <CargaChoferesPanel />

                {pastAvailable.length > 0 && (
                  <div style={{ marginTop: 24, borderTop: '2px dashed #eee', paddingTop: 16 }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: '#aaa',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      marginBottom: 12,
                      textAlign: 'center'
                    }}>
                      🕒 Historial de viajes no tomados
                    </div>
                    <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
                      {(() => {
                        const gruposHist = {};
                        pastAvailable.forEach(t => {
                          const d = t.FechaProgramadaInicio ? new Date(t.FechaProgramadaInicio).toDateString() : 'Sin fecha';
                          if (!gruposHist[d]) gruposHist[d] = [];
                          gruposHist[d].push(t);
                        });
                        return Object.entries(gruposHist).map(([dia, viajes]) => {
                          const labelDia = dia !== 'Sin fecha'
                            ? new Date(dia).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
                            : 'Sin fecha';
                          return (
                            <div key={dia} style={{ marginBottom: 20 }}>
                              <div style={{
                                fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1,
                                color: '#888', marginBottom: 10, paddingBottom: 6,
                                borderBottom: '1px solid #f0f0f0',
                              }}>
                                📅 {labelDia} · {viajes.length} viaje{viajes.length !== 1 ? 's' : ''}
                              </div>
                              {viajes.map(t => (
                                <AvailableCard
                                  key={t.IdOrdenServicio || t.IdDestino}
                                  trip={t}
                                  codigoChofer={codigoChofer}
                                  onAccepted={fetchAgendaGeneral}
                                />
                              ))}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>
            }
          />
        </div>
      )}

      {/* ── Tab: Ganancias ── */}
      {activeTab === 'ganancias' && (
        <GananciasPanel codigoChofer={codigoChofer} />
      )}

      {/* Route preview panel */}
      {previewTrip && (
        <AgendaPreviewPanel
          trip={previewTrip}
          codigoChofer={codigoChofer}
          onClose={() => setPreviewTrip(null)}
          onAccepted={() => {
            setPreviewTrip(null);
            fetchAgendaGeneral();
            fetchAgenda();
          }}
        />
      )}

      {/* PANEL DE VIAJE ACTIVO (OVERLAY) */}
      {activeTrip && !isMinimized && (
        <ViajeActivoPanel 
          trip={activeTrip} 
          pos={pos} 
          onUpdateStatus={handleUpdateStatus}
          onComplete={() => setIsMinimized(true)}
        />
      )}

      {/* PANEL DE VIAJE ACTIVO - Persistent Trip Bar */}
      {activeTrip && (
        <PersistentTripBar
          trip={activeTrip}
          pos={pos}
          onUpdateStatus={handleUpdateStatus}
          onComplete={() => setIsMinimized(true)}
          onExpand={() => setIsMinimized(false)}
        />
      )}

      {/* MODAL DE COBRO + FINALIZACIÓN (todo en uno) */}
      {showPayModal && activeTrip && (() => {
        const metodo   = (activeTrip.MetodoPago || '').toUpperCase();
        const efectivo = Number(activeTrip.EfectivoPendiente || 0);
        const deposito = Number(activeTrip.MontoDeposito || 0);
        const total    = Number(activeTrip.MontoFinal || 0);
        const pagadoCompleto = efectivo <= 0;

        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1070, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: '24px 24px 0 0', padding: '8px 24px 36px', width: '100%', maxWidth: 480, boxShadow: '0 -8px 40px rgba(0,0,0,0.2)', maxHeight: '92vh', overflowY: 'auto' }}>

              {/* Drag handle */}
              <div style={{ width: 36, height: 4, background: '#e0e0e0', borderRadius: 2, margin: '0 auto 20px' }} />

              {pagadoCompleto ? (
                /* ── STRIPE / DEPÓSITO COMPLETO — sin cobro ── */
                <>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 52, marginBottom: 6 }}>✅</div>
                    <div style={{ fontWeight: 800, fontSize: 20, color: '#16a34a', marginBottom: 4 }}>¡Viaje Liquidado!</div>
                    <div style={{ fontSize: 13, color: '#666' }}>
                      {metodo === 'STRIPE' ? 'Pago con tarjeta/Stripe completo.' : 'Depósito bancario completo.'} No necesitas cobrar nada.
                    </div>
                  </div>
                  <div style={{ background: '#f0faf5', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: '#555' }}>Monto total</span>
                      <span style={{ fontWeight: 800, fontSize: 14, color: '#111' }}>${total.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: '#16a34a' }}>✓ Ya pagado</span>
                      <span style={{ fontWeight: 800, fontSize: 14, color: '#16a34a' }}>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Incidencias — por si algo salió mal */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>¿Alguna incidencia?</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {Object.entries(INCIDENCIA_CONFIG).map(([key, cfg]) => (
                        <button key={key} onClick={() => setIncidencia(key)}
                          style={{ padding: '8px 10px', borderRadius: 10, border: incidencia === key ? `2px solid ${cfg.color}` : '1.5px solid #e0e0e0',
                            background: incidencia === key ? `${cfg.color}18` : '#fff', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600,
                            color: incidencia === key ? cfg.color : '#555' }}>
                          <span style={{ fontSize: 14 }}>{cfg.icon}</span>{cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {incidencia !== 'NINGUNA' && (
                    <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)}
                      placeholder="Describe lo que sucedió..." rows={2}
                      style={{ width: '100%', padding: 10, fontSize: 13, border: '1.5px solid #e0e0e0', borderRadius: 10, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 16 }} />
                  )}

                  {cobroError && <div style={{ background: '#fdecea', color: '#b71c1c', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 600, marginBottom: 14 }}>{cobroError}</div>}

                  <button disabled={updating} onClick={handleConfirmarCobro}
                    style={{ width: '100%', padding: '16px', borderRadius: 18, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 800, fontSize: 16, cursor: updating ? 'wait' : 'pointer', opacity: updating ? 0.7 : 1 }}>
                    {updating ? 'Finalizando...' : '✅ Confirmar Finalización'}
                  </button>
                </>
              ) : (
                /* ── EFECTIVO PENDIENTE — cobrar ── */
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Cobrar en efectivo</div>
                    <div style={{ background: '#f8f8f8', borderRadius: 14, padding: '14px 16px' }}>
                      {metodo === 'EFECTIVO_DEPOSITO' && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: '#888' }}>Tarifa total</span>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>${total.toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: '#22c55e' }}>✓ Depósito pagado</span>
                            <span style={{ fontWeight: 600, fontSize: 13, color: '#22c55e' }}>- ${deposito.toFixed(2)}</span>
                          </div>
                          <div style={{ height: 1, background: '#e0e0e0', margin: '6px 0' }} />
                        </>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>A cobrar</span>
                        <span style={{ fontSize: 24, fontWeight: 900, color: '#b45309' }}>${efectivo.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Campo monto cobrado */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 6 }}>¿Cuánto cobraste?</div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 20, fontWeight: 800, color: '#888' }}>$</span>
                      <input type="number" step="0.01" value={montoCobrado} onChange={e => setMontoCobrado(e.target.value)}
                        placeholder={efectivo.toFixed(2)}
                        style={{ width: '100%', padding: '14px 14px 14px 34px', fontSize: 26, fontWeight: 900, border: '2px solid #e0e0e0', borderRadius: 14, outline: 'none', boxSizing: 'border-box', color: '#111' }}
                        onFocus={e => e.target.style.borderColor = '#f59e0b'}
                        onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
                    </div>
                    {/* Extra: propina o cambio */}
                    {montoCobrado && parseFloat(montoCobrado) > efectivo + 0.01 && (() => {
                      const extra = parseFloat(montoCobrado) - efectivo;
                      return (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6,
                            color: esCambio ? '#b45309' : '#16a34a' }}>
                            {esCambio ? `💵 Dar cambio: $${extra.toFixed(2)}` : `🎁 Propina: $${extra.toFixed(2)}`}
                          </div>
                          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                            <button onClick={() => setEsCambio(false)}
                              style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                                fontWeight: 700, fontSize: 12, fontFamily: 'inherit',
                                background: !esCambio ? '#d1fae5' : '#f0f0f0',
                                color: !esCambio ? '#16a34a' : '#666' }}>
                              🎁 Es propina
                            </button>
                            <button onClick={() => setEsCambio(true)}
                              style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                                fontWeight: 700, fontSize: 12, fontFamily: 'inherit',
                                background: esCambio ? '#fef3cd' : '#f0f0f0',
                                color: esCambio ? '#b45309' : '#666' }}>
                              💵 Dar cambio
                            </button>
                          </div>
                          {esCambio && (
                            <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 10,
                              padding: '8px 12px', fontSize: 12, color: '#b45309', fontWeight: 600 }}>
                              Cliente pagó ${parseFloat(montoCobrado).toFixed(2)} — regresa ${extra.toFixed(2)} de cambio
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    {/* Faltante */}
                    {montoCobrado && parseFloat(montoCobrado) < efectivo - 0.01 && (
                      <div style={{ marginTop: 6, fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
                        ⚠️ Faltan ${(efectivo - parseFloat(montoCobrado)).toFixed(2)} — monto esperado: ${efectivo.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Incidencias */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>¿Alguna incidencia?</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {Object.entries(INCIDENCIA_CONFIG).map(([key, cfg]) => (
                        <button key={key} onClick={() => setIncidencia(key)}
                          style={{ padding: '8px 10px', borderRadius: 10, border: incidencia === key ? `2px solid ${cfg.color}` : '1.5px solid #e0e0e0',
                            background: incidencia === key ? `${cfg.color}18` : '#fff', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600,
                            color: incidencia === key ? cfg.color : '#555' }}>
                          <span style={{ fontSize: 14 }}>{cfg.icon}</span>{cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {incidencia !== 'NINGUNA' && (
                    <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)}
                      placeholder="Describe lo que sucedió..." rows={2}
                      style={{ width: '100%', padding: 10, fontSize: 13, border: '1.5px solid #e0e0e0', borderRadius: 10, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 14 }} />
                  )}

                  {cobroError && <div style={{ background: '#fdecea', color: '#b71c1c', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 600, marginBottom: 14 }}>{cobroError}</div>}

                  <button disabled={updating} onClick={handleConfirmarCobro}
                    style={{ width: '100%', padding: '16px', borderRadius: 18, border: 'none', background: '#b45309', color: '#fff', fontWeight: 800, fontSize: 16, cursor: updating ? 'wait' : 'pointer', opacity: updating ? 0.7 : 1, boxShadow: '0 4px 15px rgba(180,83,9,0.35)' }}>
                    {updating ? 'Registrando...' : '💵 Cobrado — Finalizar Viaje'}
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
