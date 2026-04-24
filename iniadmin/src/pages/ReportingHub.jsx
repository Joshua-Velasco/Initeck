import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardCheck, Clock, CheckCircle2, AlertCircle, 
  ChevronRight, Calendar, User, Users, Search, Filter, 
  MessageSquare, TrendingUp, Target, Save, X, Plus
} from 'lucide-react';
import { API_URLS } from '../config';
import { useAuth } from '../context/AuthContext';

export default function ReportingHub() {
  const { user } = useAuth();
  const [proyectos, setProyectos] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [reportData, setReportData] = useState({
    avances: '',
    puntos_mejora: '',
    fecha_reporte: new Date().toISOString().split('T')[0]
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Get projects where user is supervisor (or all if admin)
      const resProj = await fetch(`${API_URLS.proyectos}listar.php`);
      const dataProj = await resProj.json();
      
      let filteredProj = Array.isArray(dataProj) ? dataProj : [];
      if (user.rol === 'supervisor') {
        filteredProj = filteredProj.filter(p => 
          p.personal?.some(pers => pers.empleado_id == user.empleado_id && pers.rol_en_proyecto === 'supervisor')
        );
      }
      setProyectos(filteredProj);

      // 2. Get history (filtered by supervisor if needed)
      const urlHistory = user.rol === 'admin' 
        ? `${API_URLS.reportes}listar.php`
        : `${API_URLS.reportes}listar.php?supervisor_id=${user.empleado_id}`;
      
      const resRep = await fetch(urlHistory);
      const dataRep = await resRep.json();
      setReportes(Array.isArray(dataRep) ? dataRep : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URLS.reportes}crear.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reportData,
          supervisor_id: user.empleado_id,
          empleado_id: selectedStaff.empleado_id,
          proyecto_id: selectedStaff.proyecto_id
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setReportData({ avances: '', puntos_mejora: '', fecha_reporte: new Date().toISOString().split('T')[0] });
        fetchData();
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    }
  };

  // List of unique staff members under the supervisor's charge
  const staffToReport = [];
  proyectos.forEach(p => {
    p.personal?.forEach(pers => {
      if (pers.rol_en_proyecto === 'empleado' || user.rol === 'admin') {
        staffToReport.push({ ...pers, proyecto_id: p.id, proyecto_nombre: p.nombre });
      }
    });
  });

  const filteredStaff = staffToReport.filter(s => 
    s.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.proyecto_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>Reporting Hub</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>Generación y revisión de informes de desempeño semanales.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>
        
        {/* Main Section — Reports History or Pending List */}
        <div>
          {/* Tabs / Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} size={16} />
              <input 
                type="text" 
                placeholder="Buscar por empleado o proyecto..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', padding: '9px 12px 9px 38px', 
                  borderRadius: '10px', border: '1.5px solid var(--gray-200)',
                  fontSize: '13px', outline: 'none'
                }}
              />
            </div>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: 'var(--gray-700)' }}>Reportes Recientes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reportes.map(rep => (
              <div key={rep.id} style={{ 
                background: 'white', padding: '16px', borderRadius: '14px', 
                border: '1.5px solid var(--gray-100)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ padding: '8px', background: 'var(--brand-50)', color: 'var(--brand-600)', borderRadius: '10px' }}>
                      <User size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{rep.empleado_nombre}</div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 600 }}>{rep.proyecto_nombre}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 600 }}>FECHA REPORTE</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gray-700)' }}>{rep.fecha_reporte}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px', padding: '12px', background: 'var(--gray-50)', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <TrendingUp size={10} /> AVANCES LOGRADOS
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--gray-600)', lineHeight: '1.4' }}>{rep.avances}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <Target size={10} /> PUNTOS DE MEJORA
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--gray-600)', lineHeight: '1.4' }}>{rep.puntos_mejora}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', gap: '8px' }}>
                   <div style={{ 
                     display: 'flex', alignItems: 'center', gap: '4px', 
                     fontSize: '11px', color: 'var(--gray-400)', fontWeight: 600 
                   }}>
                     <AlertCircle size={12} /> Por {rep.supervisor_nombre}
                   </div>
                </div>
              </div>
            ))}
            {reportes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', background: 'var(--gray-50)', borderRadius: '20px', border: '2px dashed var(--gray-200)' }}>
                <ClipboardCheck size={40} style={{ color: 'var(--gray-300)', marginBottom: '12px' }} />
                <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>No hay reportes generados para mostrar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — Personal a Cargo */}
        <div>
          <div style={{ background: 'white', borderRadius: '18px', border: '1.5px solid var(--gray-100)', padding: '20px', position: 'sticky', top: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--brand-600)" /> Personal a Cargo
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredStaff.map(s => (
                <div key={`${s.empleado_id}-${s.proyecto_id}`} style={{ 
                  padding: '12px', borderRadius: '12px', border: '1.5px solid var(--gray-50)',
                  transition: 'background 0.2s', background: 'var(--gray-100)30' 
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{s.nombre_completo}</div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '10px' }}>{s.proyecto_nombre}</div>
                  <button 
                    onClick={() => { setSelectedStaff(s); setShowAddModal(true); }}
                    style={{ width: '100%', padding: '7px', fontSize: '11px' }} className="btn-admin btn-primary"
                  >
                    Crear Reporte
                  </button>
                </div>
              ))}
              {filteredStaff.length === 0 && (
                <p style={{ fontSize: '12px', color: 'var(--gray-400)', textAlign: 'center' }}>No tienes personal asignado para reportar.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Reporte */}
      {showAddModal && selectedStaff && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content-admin" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px', background: 'var(--brand-600)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ClipboardCheck size={20} />
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Nuevo Reporte Semanal</h2>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmitReport} style={{ padding: '24px' }}>
              <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--brand-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)', fontWeight: 800 }}>
                  {selectedStaff.nombre_completo[0]}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{selectedStaff.nombre_completo}</div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Proyecto: {selectedStaff.proyecto_nombre}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--gray-700)' }}>FECHA DEL INFORME</label>
                  <input 
                    type="date" required value={reportData.fecha_reporte}
                    onChange={e => setReportData({...reportData, fecha_reporte: e.target.value})}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--gray-200)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#10b981' }}>AVANCES LOGRADOS</label>
                  <textarea 
                    required rows={4}
                    value={reportData.avances}
                    onChange={e => setReportData({...reportData, avances: e.target.value})}
                    placeholder="¿Qué logró el empleado esta semana?"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--gray-200)', fontSize: '13px', resize: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#f59e0b' }}>PUNTOS DE MEJORA</label>
                  <textarea 
                    required rows={4}
                    value={reportData.puntos_mejora}
                    onChange={e => setReportData({...reportData, puntos_mejora: e.target.value})}
                    placeholder="¿En qué áreas necesita mejorar?"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--gray-200)', fontSize: '13px', resize: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1 }} className="btn-admin btn-secondary">Cancelar</button>
                <button type="submit" style={{ flex: 2 }} className="btn-admin btn-primary"><Save size={16} /> Enviar Reporte</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="animate-spin" style={{ width: 30, height: 30, border: '3px solid var(--brand-600)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
        </div>
      )}
    </div>
  );
}
