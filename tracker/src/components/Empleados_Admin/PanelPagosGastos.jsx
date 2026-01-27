import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Wallet, Zap, ChevronRight } from 'lucide-react';
import { EMPLEADOS_DATOS_DIARIOS_URL } from '../../config';

export default function PanelPagosGastos({ empleado, colorGuinda }) {
  const [datosDiarios, setDatosDiarios] = useState({
    fecha: new Date().toISOString().split('T')[0],
    ingresos: 0,
    gastos: 0,
    viajes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatosDiarios = async () => {
      if (!empleado?.id) return;
      setLoading(true);
      try {
        const res = await fetch(`${EMPLEADOS_DATOS_DIARIOS_URL}?empleado_id=${empleado.id}&fecha=${datosDiarios.fecha}`);
        const data = await res.json();

        setDatosDiarios(prev => ({
          ...prev,
          viajes: parseInt(data.total_viajes) || 0,
          gastos: parseFloat(data.total_gastos) || 0,
          ingresos: parseFloat(data.total_ingresos) || 0
        }));
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDatosDiarios();
  }, [empleado?.id, datosDiarios.fecha]);

  const f = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
  const balance = datosDiarios.ingresos - datosDiarios.gastos;

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      {/* Header con estilo Premium */}
      <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-bold mb-0 d-flex align-items-center" style={{ color: colorGuinda }}>
            <Zap className="me-2" size={18} fill={colorGuinda} />
            Estado de Cuenta del Turno
          </h6>
          <small className="text-muted">Monitoreo de flujos en tiempo real</small>
        </div>
        <div className="input-group input-group-sm w-auto shadow-sm rounded-3">
          <span className="input-group-text bg-white border-end-0"><Calendar size={14} /></span>
          <input
            type="date"
            className="form-control border-start-0 ps-0"
            value={datosDiarios.fecha}
            onChange={(e) => setDatosDiarios(p => ({ ...p, fecha: e.target.value }))}
          />
        </div>
      </div>

      <div className="card-body p-4 pt-0">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-guinda" style={{ color: colorGuinda }} /></div>
        ) : (
          <div className="row g-3">
            {/* Widget Ingresos */}
            <div className="col-md-4">
              <div className="p-3 rounded-4 border-0 position-relative overflow-hidden shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)' }}>
                <div className="position-absolute top-0 end-0 p-2 opacity-10"><TrendingUp size={60} /></div>
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-success text-white p-2 rounded-3 me-2 shadow-sm"><DollarSign size={18} /></div>
                  <span className="small fw-bold text-success text-uppercase">Ingresos</span>
                </div>
                <h3 className="fw-bold text-dark mb-0">{f(datosDiarios.ingresos)}</h3>
                <small className="text-success fw-medium">{datosDiarios.viajes} viajes registrados</small>
              </div>
            </div>

            {/* Widget Gastos */}
            <div className="col-md-4">
              <div className="p-3 rounded-4 border-0 position-relative overflow-hidden shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%)' }}>
                <div className="position-absolute top-0 end-0 p-2 opacity-10"><TrendingDown size={60} /></div>
                <div className="d-flex align-items-center mb-2">
                  <div className="bg-danger text-white p-2 rounded-3 me-2 shadow-sm"><TrendingDown size={18} /></div>
                  <span className="small fw-bold text-danger text-uppercase">Gastos</span>
                </div>
                <h3 className="fw-bold text-dark mb-0">{f(datosDiarios.gastos)}</h3>
                <small className="text-danger fw-medium">Combustible y otros</small>
              </div>
            </div>

            {/* Widget Balance */}
            <div className="col-md-4">
              <div className="p-3 rounded-4 border-0 position-relative overflow-hidden shadow-sm h-100" style={{ background: balance >= 0 ? 'linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%)' : 'linear-gradient(135deg, #fffaf0 0%, #fff5e6 100%)' }}>
                <div className="position-absolute top-0 end-0 p-2 opacity-10"><Wallet size={60} /></div>
                <div className="d-flex align-items-center mb-2">
                  <div className={`text-white p-2 rounded-3 me-2 shadow-sm ${balance >= 0 ? 'bg-primary' : 'bg-warning'}`}><Wallet size={18} /></div>
                  <span className={`small fw-bold text-uppercase ${balance >= 0 ? 'text-primary' : 'text-warning'}`}>Balance Neto</span>
                </div>
                <h3 className="fw-bold text-dark mb-0">{f(balance)}</h3>
                <small className={balance >= 0 ? 'text-primary' : 'text-warning'}>
                  {balance >= 0 ? 'Utilidad positiva' : 'Revisar discrepancia'}
                </small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}