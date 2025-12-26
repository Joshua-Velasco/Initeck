import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, User, Truck } from 'lucide-react';
import ViajeDetalle from './ViajesDetalle';

export default function ViajeTabla({ viajes, colorGuinda }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="card border-0 shadow-sm overflow-hidden">
      <table className="table align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th style={{ width: '40px' }}></th>
            <th>Fecha / ID</th>
            <th>Operador</th>
            <th>Unidad</th>
            <th>Monto</th>
            <th className="text-center">Pago</th>
          </tr>
        </thead>
        <tbody>
          {viajes.map((v) => (
            <React.Fragment key={v.id}>
              <tr onClick={() => setExpandedId(expandedId === v.id ? null : v.id)} style={{ cursor: 'pointer' }}>
                <td>{expandedId === v.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}</td>
                <td>
                  <div className="small fw-bold"><Calendar size={12} className="me-1"/>{new Date(v.fecha_viaje).toLocaleDateString()}</div>
                  <div className="text-muted" style={{fontSize: '10px'}}>VIA-{v.id}</div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <User size={14} className="me-2 text-muted"/>
                    <span className="small fw-bold">{v.nombre_empleado}</span>
                  </div>
                </td>
                <td>
                  <div className="badge bg-light text-dark border"><Truck size={12} className="me-1"/>{v.unidad_nombre}</div>
                </td>
                <td><span className="fw-bold">${v.monto_total}</span></td>
                <td className="text-center">
                    <span className="badge bg-secondary-subtle text-dark small">{v.metodo_pago}</span>
                </td>
              </tr>
              {expandedId === v.id && (
                <tr className="table-light">
                  <td colSpan="6" className="p-0 border-0">
                    <ViajeDetalle viaje={v} colorGuinda={colorGuinda} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}