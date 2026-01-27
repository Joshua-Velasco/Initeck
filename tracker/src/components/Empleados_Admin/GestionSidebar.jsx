import { Car, Edit2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { VEHICULO_LISTAR_URL, buildUploadUrl } from '../../config';

export const GestionSidebar = ({ empleado, colorGuinda, onUnidadChange }) => {
  const [editandoUnidad, setEditandoUnidad] = useState(false);
  const [unidadTemporal, setUnidadTemporal] = useState(empleado.vehiculo_id || '');
  const [guardando, setGuardando] = useState(false);
  const [unidadesDisponibles, setUnidadesDisponibles] = useState([]);

  useEffect(() => {
    fetch(VEHICULO_LISTAR_URL)
      .then(res => res.json())
      .then(data => setUnidadesDisponibles(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, []);

  const handleGuardar = async () => {
    setGuardando(true);
    await onUnidadChange(unidadTemporal); // Función que debe venir del padre
    setGuardando(false);
    setEditandoUnidad(false);
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* CARD UNIDAD */}
      <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
        <h6 className="fw-bold small text-uppercase mb-3 text-muted">Gestión de Unidad</h6>
        <div className="p-4 rounded-4 border-2 text-center bg-light" style={{ border: '2px dashed #e2e8f0' }}>
          {editandoUnidad ? (
            <div>
              <select className="form-select mb-3 border-0 shadow-sm" value={unidadTemporal} onChange={e => setUnidadTemporal(e.target.value)}>
                <option value="">Seleccionar Unidad</option>
                {unidadesDisponibles.map(u => <option key={u.id} value={u.id}>{u.nombre_vehiculo}</option>)}
              </select>
              <div className="d-flex gap-2">
                <button className="btn btn-dark w-100 rounded-pill btn-sm" onClick={handleGuardar} disabled={guardando}>Guardar</button>
                <button className="btn btn-outline-secondary w-100 rounded-pill btn-sm" onClick={() => setEditandoUnidad(false)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white p-3 rounded-circle d-inline-block shadow-sm mb-3">
                <Car size={28} style={{ color: colorGuinda }} />
              </div>
              <h5 className="fw-bold mb-1 text-dark text-truncate px-2">{empleado.nombre_vehiculo || 'No Asignado'}</h5>
              <button className="btn btn-link btn-sm text-decoration-none fw-bold" style={{ color: colorGuinda }} onClick={() => setEditandoUnidad(true)}>
                <Edit2 size={12} className="me-1" /> Editar Unidad
              </button>
            </>
          )}
        </div>
      </div>

      {/* CARD DOCUMENTACIÓN */}
      <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
        <h6 className="fw-bold small text-uppercase mb-3 text-muted">Documentación</h6>
        <div className="d-grid gap-2">
          {[{ label: 'Identificación INE', key: 'foto_ine' }, { label: 'Licencia Federal', key: 'foto_licencia' }].map((doc, i) => (
            <div key={i} className="d-flex justify-content-between align-items-center p-2 px-3 rounded-3 bg-light border">
              <div className="d-flex align-items-center gap-2">
                {empleado[doc.key] ? <CheckCircle size={16} className="text-success" /> : <XCircle size={16} className="text-danger opacity-50" />}
                <span className="small fw-medium">{doc.label}</span>
              </div>
              {empleado[doc.key] && (
                <a href={buildUploadUrl(empleado[doc.key])} target="_blank" rel="noreferrer" className="text-dark">
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};