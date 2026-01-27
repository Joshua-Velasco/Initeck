import { CheckCircle, AlertTriangle, X } from 'lucide-react';

export const Notification = ({ notification, onClose }) => {
  if (!notification.show) return null;

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
      <div className={`alert alert-${notification.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show d-flex align-items-center shadow-lg`} role="alert">
        {notification.type === 'success' ? <CheckCircle size={20} className="me-2" /> : <AlertTriangle size={20} className="me-2" />}
        <div className="flex-grow-1">{notification.message}</div>
        <button type="button" className="btn-close" onClick={onClose}><X size={16} /></button>
      </div>
    </div>
  );
};