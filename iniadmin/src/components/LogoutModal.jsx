import React from 'react';
import { LogOut, X, AlertCircle } from 'lucide-react';

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content-admin animate-fade-in-scale" style={{ maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
        <div style={{ 
          width: '64px', height: '64px', borderRadius: '50%', background: 'var(--red-50)', 
          color: 'var(--red-600)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <AlertCircle size={32} />
        </div>
        
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '12px' }}>
          ¿Cerrar Sesión?
        </h3>
        
        <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '32px', lineHeight: '1.6' }}>
          ¿Estás seguro que deseas salir del sistema? Tendrás que volver a ingresar tus credenciales para acceder.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button 
            className="btn-admin btn-secondary" 
            onClick={onClose}
            style={{ padding: '12px' }}
          >
            Cancelar
          </button>
          <button 
            className="btn-admin btn-primary" 
            onClick={onConfirm}
            style={{ padding: '12px', background: 'var(--danger)' }}
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
