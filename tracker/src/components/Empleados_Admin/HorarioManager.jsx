import React, { useState } from 'react';
import { Clock, Save, X, Loader2 } from 'lucide-react';
import { COLORS } from '../../constants/theme';
import { EMPLEADOS_ACTUALIZAR_HORARIO_URL } from '../../config';

export const HorarioManager = ({ empleado, onSave, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [horario, setHorario] = useState({
        entrada: empleado?.horario_entrada || '',
        salida: empleado?.horario_salida || ''
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch(EMPLEADOS_ACTUALIZAR_HORARIO_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    empleado_id: empleado.id,
                    horario_entrada: horario.entrada,
                    horario_salida: horario.salida
                })
            });

            const result = await response.json();
            if (result.status === 'success') {
                onSave(); // Refrescar lista de empleados
                onClose();
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            console.error("Error guardando horario:", error);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card border-0 shadow-lg">
            <div className="card-header border-0 bg-white p-4 pb-0 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-light p-2 rounded-circle">
                        <Clock size={24} className="text-primary" />
                    </div>
                    <div>
                        <h5 className="fw-bold mb-0 text-dark">Gestionar Horario</h5>
                        <p className="text-muted small mb-0">{empleado.nombre_completo}</p>
                    </div>
                </div>
                <button onClick={onClose} className="btn btn-light btn-sm rounded-circle p-2">
                    <X size={20} />
                </button>
            </div>

            <div className="card-body p-4">
                <div className="row g-3">
                    <div className="col-6">
                        <label className="form-label small fw-bold text-muted">Hora de Entrada</label>
                        <input
                            type="time"
                            className="form-control"
                            value={horario.entrada}
                            onChange={(e) => setHorario(p => ({ ...p, entrada: e.target.value }))}
                        />
                    </div>
                    <div className="col-6">
                        <label className="form-label small fw-bold text-muted">Hora de Salida</label>
                        <input
                            type="time"
                            className="form-control"
                            value={horario.salida}
                            onChange={(e) => setHorario(p => ({ ...p, salida: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="mt-4 bg-light p-3 rounded-3 border border-dashed text-center">
                    <span className="small text-muted d-block">
                        El sistema usará este horario para calcular retardos y horas extra automáticamente en los reportes de asistencia.
                    </span>
                </div>
            </div>

            <div className="card-footer bg-white border-0 p-4 pt-0 d-flex justify-content-end gap-2">
                <button onClick={onClose} className="btn btn-light rounded-3 px-4 fw-bold text-muted">Cancelar</button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn btn-primary rounded-3 px-4 fw-bold d-flex align-items-center gap-2"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Guardar Cambios
                </button>
            </div>
        </div>
    );
};
