import React, { useState } from 'react';
import { 
  CheckCircle2, Circle, Calendar, DollarSign, 
  Camera, FileText, AlertCircle, Clock, Upload, Settings
} from 'lucide-react';
import { VEHICULOS_UPLOADS_URL } from '../../config';

const ExpenseCard = ({ 
  title, 
  icon: Icon, 
  completed, 
  date, 
  limit, 
  evidence, 
  onToggle, 
  onDateChange, 
  onFileChange 
}) => {
  const f = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);

  return (
    <div className={`card border-0 shadow-sm rounded-4 mb-3 transition-all ${completed ? 'bg-success bg-opacity-10 border-start border-success border-4' : 'bg-white border-start border-light border-4'}`}>
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center gap-3">
            <div className={`p-2 rounded-3 ${completed ? 'bg-success text-white' : 'bg-light text-muted'}`}>
              <Icon size={20} />
            </div>
            <div>
              <h6 className="fw-bold mb-0">{title}</h6>
              <span className="text-muted small" style={{ fontSize: '0.7rem' }}>Presupuesto Anual: <strong className="text-dark">{f(limit)}</strong></span>
            </div>
          </div>
          <button 
            onClick={onToggle}
            className={`btn btn-sm rounded-pill px-3 d-flex align-items-center gap-2 ${completed ? 'btn-success' : 'btn-outline-secondary'}`}
          >
            {completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            {completed ? 'Realizado' : 'Pendiente'}
          </button>
        </div>

        {completed && (
          <div className="mt-3 p-3 bg-white rounded-3 border animate__animated animate__fadeIn">
            <div className="row g-2 align-items-center">
              <div className="col-12 col-md-6">
                <label className="text-muted small mb-1 d-flex align-items-center gap-1">
                  <Calendar size={14} /> Fecha de Pago
                </label>
                <input 
                  type="date" 
                  className="form-control form-control-sm border-0 bg-light" 
                  value={date || ''} 
                  onChange={(e) => onDateChange(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="text-muted small mb-1 d-flex align-items-center gap-1">
                  <Camera size={14} /> Evidencia (Ticket)
                </label>
                <div className="d-flex gap-2">
                  <div className="position-relative flex-grow-1">
                    <input 
                      type="file" 
                      className="form-control form-control-sm opacity-0 position-absolute top-0 start-0 h-100" 
                      onChange={(e) => onFileChange(e.target.files[0])}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="btn btn-sm btn-light w-100 d-flex align-items-center justify-content-center gap-2 border">
                      <Upload size={14} /> {evidence ? 'Cambiar Ticket' : 'Subir Ticket'}
                    </div>
                  </div>
                  {evidence && (
                    <a 
                      href={`${VEHICULOS_UPLOADS_URL}${evidence}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary"
                    >
                      <FileText size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-2 text-end">
                <span className="text-success small fw-bold d-flex align-items-center justify-content-end gap-1">
                    <Clock size={12} /> Pago Registrado
                </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper icons that were missing
const ShieldCheck = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);
const Leaf = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C10.9 14.36 12 15.48 12 18c0 2.5-2 3-10 3Z"/></svg>
);

export const VehicleFinance = ({ vehiculo, handleGuardarCambios }) => {
  const [loading, setLoading] = useState(false);

  if (!vehiculo) return null;

  const expenses = [
    { 
      key: 'placas', 
      title: 'Pago de Placas / Tenencia', 
      icon: FileText, 
      dateField: 'fecha_pago_placas', 
      limitField: 'costo_placas_anual',
      evidenceField: 'foto_placas'
    },
    { 
      key: 'seguro', 
      title: 'Seguro de Cobertura', 
      icon: ShieldCheck, 
      dateField: 'fecha_pago_seguro', 
      limitField: 'costo_seguro_anual',
      evidenceField: 'foto_circulacion'
    },
    { 
      key: 'ecologico', 
      title: 'Verificación Ecológica', 
      icon: Leaf, 
      dateField: 'fecha_pago_ecologico', 
      limitField: 'costo_ecologico_anual',
      evidenceField: 'foto_ecologico'
    },
    { 
      key: 'mantenimiento', 
      title: 'Mantenimiento General', 
      icon: Settings, 
      dateField: 'fecha_proximo_mantenimiento', 
      limitField: 'costo_servicio_general_anual',
      evidenceField: null
    }
  ];

  const onUpdateField = async (field, value, isFile = false) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('accion', 'editar_vehiculo');
    formData.append('id', vehiculo.id);
    
    // Add vehicle data from existing object to not lose it if the API expects it
    // Actually, looking at vehiculosModificar.php, it maps a lot of fields.
    // It's safer to send EVERYTHING or the API might null them out.
    Object.keys(vehiculo).forEach(key => {
        if (!['fotos_json', 'foto_placas', 'foto_ecologico', 'foto_circulacion'].includes(key)) {
            formData.append(key, vehiculo[key] ?? "");
        }
    });

    if (isFile) {
      formData.append(field, value);
    } else {
      formData.set(field, value);
    }

    const res = await handleGuardarCambios(formData);
    setLoading(false);
  };

  return (
    <div className="vehicle-finance-section">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h5 className="fw-bold text-dark mb-1">Checklist Financiero Anual</h5>
          <p className="text-muted small">Control de pagos, vencimientos y presupuestos por unidad.</p>
        </div>
        {loading && <div className="spinner-border spinner-border-sm text-primary"></div>}
      </div>

      <div className="row">
        <div className="col-12 col-xl-8">
          {expenses.map((expense) => {
            const isCompleted = !!vehiculo[expense.dateField];
            
            return (
              <ExpenseCard 
                key={expense.key}
                title={expense.title}
                icon={expense.icon}
                completed={isCompleted}
                date={vehiculo[expense.dateField]}
                limit={vehiculo[expense.limitField]}
                evidence={expense.evidenceField ? vehiculo[expense.evidenceField] : null}
                onToggle={() => {
                   if (isCompleted) {
                       onUpdateField(expense.dateField, "");
                   } else {
                       const today = new Date().toISOString().split('T')[0];
                       onUpdateField(expense.dateField, today);
                   }
                }}
                onDateChange={(val) => onUpdateField(expense.dateField, val)}
                onFileChange={(file) => onUpdateField(expense.evidenceField, file, true)}
              />
            );
          })}
        </div>

        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 bg-dark text-white p-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <AlertCircle size={18} className="text-warning" /> Nota de Control
            </h6>
            <p className="small opacity-75 mb-0">
              Esta sección te ayuda a llevar un control estricto de los gastos legales y operativos de la unidad. 
              Asegúrate de subir los tickets de pago para auditorías internas.
              <br/><br/>
              Los montos se sincronizan automáticamente con el presupuesto anual global.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleFinance;
