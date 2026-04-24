import { createPortal } from 'react-dom';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'confirm' }) => {
  if (!isOpen) return null;

  const isAlert = type === 'alert' || type === 'success' || type === 'error';
  
  const getIcon = () => {
    switch (type) {
      case 'warning': return <AlertTriangle size={32} color="#ef4444" />;
      case 'success': return <CheckCircle size={32} color="#10b981" />;
      case 'error': return <AlertTriangle size={32} color="#ef4444" />;
      default: return <Info size={32} color="#3b82f6" />;
    }
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
        <button className="btn btn-ghost btn-icon-only" onClick={onClose} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
          <X size={18} />
        </button>
        
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            {getIcon()}
        </div>
        
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>{message}</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', width: '100%' }}>
          {!isAlert && (
            <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancelar
            </button>
          )}
          <button 
            className={`btn ${type === 'warning' || type === 'error' ? 'btn-danger' : 'btn-primary'}`} 
            onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
            }}
            style={{ flex: 1 }}
          >
            {isAlert ? 'Entendido' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
