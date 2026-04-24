import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MonitorPlay, LogIn, UserPlus } from 'lucide-react';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (isRegistering) {
      const res = await register(username, password, adminCode);
      if (res.success) {
        setSuccess('Usuario registrado exitosamente. Ahora puedes Iniciar Sesión.');
        setIsRegistering(false);
        setPassword('');
        setAdminCode('');
        setDebugInfo('');
      } else {
        setError(res.error);
        setDebugInfo(res.debugInfo || '');
      }
    } else {
      const res = await login(username, password);
      if (res.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(res.error);
        setDebugInfo(res.debugInfo || '');
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card glass-panel animate-fade-in">
        <div className="login-header">
          <MonitorPlay size={40} color="var(--primary)" />
          <h1>INIBAY <span>Manager</span></h1>
          <p>{isRegistering ? 'Crea un nuevo usuario administrativo' : 'Inicia sesión para acceder al panel'}</p>
        </div>

        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        {debugInfo && (
          <div className="debug-container">
            <button 
              type="button" 
              className="debug-toggle"
              onClick={() => setShowDebug(!showDebug)}
            >
              {showDebug ? 'Ocultar detalles técnicos' : 'Ver respuesta del servidor'}
            </button>
            {showDebug && (
              <pre className="debug-content">
                {debugInfo}
              </pre>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input 
              type="text" 
              id="username" 
              className="form-control" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              autoComplete="username"
              required 
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              required 
              disabled={isLoading}
            />
          </div>
          
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="adminCode">Código de Autorización Admin</label>
              <input 
                type="password" 
                id="adminCode" 
                className="form-control" 
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="Código requerido"
                required 
                disabled={isLoading}
              />
            </div>
          )}
          
          <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
            {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
            {isLoading ? 'Procesando...' : (isRegistering ? 'Registrarse' : 'Ingresar')}
          </button>
        </form>

        <div className="login-toggle">
          {isRegistering ? (
            <p>¿Ya tienes una cuenta? <span onClick={() => { setIsRegistering(false); setError(''); setSuccess(''); setDebugInfo(''); }}>Inicia Sesión</span></p>
          ) : (
            <p>¿No tienes acceso? <span onClick={() => { setIsRegistering(true); setError(''); setSuccess(''); setDebugInfo(''); }}>Crea una cuenta</span></p>
          )}
        </div>
      </div>
      
      <style>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: var(--bg-base);
          background-image: 
            radial-gradient(circle at 15% 50%, rgba(74, 222, 128, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 85% 30%, rgba(45, 212, 191, 0.05) 0%, transparent 50%);
          padding: 1rem;
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px var(--primary-glow);
          border-top: 2px solid var(--border-focus);
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-header h1 {
          font-size: 1.75rem;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          letter-spacing: -0.025em;
        }
        .login-header h1 span {
          color: var(--primary);
        }
        .login-header p {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
        .login-error {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--danger);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          width: 100%;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          text-align: center;
        }
        .login-success {
          background-color: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
          color: var(--primary);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          width: 100%;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          text-align: center;
        }
        .debug-container {
          width: 100%;
          margin-bottom: 1.5rem;
        }
        .debug-toggle {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.75rem;
          text-decoration: underline;
          cursor: pointer;
          display: block;
          margin: 0 auto;
          opacity: 0.7;
        }
        .debug-toggle:hover {
          opacity: 1;
          color: var(--primary);
        }
        .debug-content {
          background-color: #1a1a1a;
          color: #10b981;
          padding: 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.7rem;
          max-height: 200px;
          overflow-y: auto;
          margin-top: 0.5rem;
          white-space: pre-wrap;
          word-break: break-all;
          border: 1px solid var(--border);
        }
        .login-form {
          width: 100%;
        }
        .login-btn {
          width: 100%;
          justify-content: center;
          margin-top: 1rem;
          padding: 0.8rem;
          font-size: 1rem;
        }
        .login-toggle {
          margin-top: 1.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .login-toggle span {
          color: var(--primary);
          cursor: pointer;
          font-weight: 600;
        }
        .login-toggle span:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Login;
