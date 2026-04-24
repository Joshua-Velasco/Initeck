import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '../config';
import './SignIn.css';

const SignIn = ({ revealRef, setActiveView, setAuthUser }) => {
  // Modes: 'login', 'register', 'verify', 'forgot', 'reset'
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Password Strength
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    // Check password strength
    const pwd = formData.password;
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[a-z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    setPasswordStrength(strength);
  }, [formData.password]);

  // Handle Google Redirect Result
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const access_token = params.get('access_token');
      
      if (access_token) {
        // We simulate the credential object that handleGoogleSuccess expects
        handleGoogleSuccess({ access_token });
        // Clean up the URL hash
        window.history.replaceState(null, null, window.location.pathname);
      }
    }
  }, []);

  const validatePassword = () => {
    return passwordStrength === 4;
  };

  const handleApiCall = async (action, extraData = {}) => {
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const payload = { action, ...formData, ...extraData };
      const response = await fetch(`${API_URL}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
        setIsLoading(false);
        return data;
      } catch (parseErr) {
        console.error("Parse error:", parseErr, responseText);
        setError(`Error inesperado del servidor.`);
        setIsLoading(false);
        return null;
      }
    } catch (err) {
      console.error("Network error:", err);
      setError('Error de conexión con el servidor.');
      setIsLoading(false);
      return null;
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();

    if (mode === 'register') {
      if (!formData.name) {
        setError('Por favor, ingresa tu nombre completo.');
        return;
      }
      if (!validatePassword()) {
        setError('La contraseña no cumple con los requisitos de seguridad.');
        return;
      }
      
      const data = await handleApiCall('register_email');
      if (data) {
        if (data.requires_verification) {
          setMessage(data.message);
          setMode('verify');
        } else if (data.success) {
          setAuthUser(data.user);
          setActiveView('dashboard');
        } else {
          setError(data.message);
        }
      }
    } else if (mode === 'login') {
      const data = await handleApiCall('login_email');
      if (data) {
        if (data.requires_verification) {
          setMessage(data.message);
          setMode('verify');
        } else if (data.success) {
          setAuthUser(data.user);
          setActiveView(data.user.perfilCompleto ? 'dashboard' : 'profile-setup');
        } else {
          setError(data.message);
        }
      }
    } else if (mode === 'verify') {
      const data = await handleApiCall('verify_otp');
      if (data && data.success) {
        // Once verified, log them in
        const loginData = await handleApiCall('login_email');
        if (loginData && loginData.success) {
          setAuthUser(loginData.user);
          // New registrations always go to profile-setup first
          setActiveView('profile-setup');
        } else {
          setError('Cuenta verificada, pero no se pudo iniciar sesión.');
          setMode('login');
        }
      } else if (data) {
        setError(data.message);
      }
    } else if (mode === 'forgot') {
      const data = await handleApiCall('forgot_password');
      if (data && data.success) {
        setMessage(data.message);
        setFormData(prev => ({ ...prev, otp: '' })); // Limpiar OTP viejo
        setMode('reset');
      } else if (data) {
        setError(data.message);
      }
    } else if (mode === 'reset') {
      if (!validatePassword()) {
        setError('La nueva contraseña no cumple con los requisitos de seguridad.');
        return;
      }
      const data = await handleApiCall('reset_password');
      if (data && data.success) {
        setMessage(data.message);
        setMode('login');
      } else if (data) {
        setError(data.message);
      }
    }
  };

  const handleResendOtp = async () => {
    const data = await handleApiCall('resend_otp');
    if (data && data.success) {
      setMessage(data.message);
    } else if (data) {
      setError(data.message);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setError('');
    setIsLoading(true);
    try {
      // Si recibimos un token de acceso (flow implicit)
      const resUser = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${credential.access_token}`);
      const decodedInfo = await resUser.json();
      
      const email = decodedInfo.email;
      const name = decodedInfo.name;

      const response = await fetch(`${API_URL}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login_google', email, name })
      });

      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
        if (data.success) {
          setAuthUser(data.user);
          setActiveView(data.user.perfilCompleto ? 'dashboard' : 'profile-setup');
        } else {
          setError(data.message);
        }
      } catch (parseErr) {
        setError('Error inesperado al conectar con Google.');
      }
    } catch (err) {
      setError('Error procesando el inicio de sesión con Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Error al conectar con Google.'),
    flow: 'implicit',
    ux_mode: 'redirect',
    redirect_uri: 'https://safar.initeck.com.mx',
    prompt: 'select_account'
  });

  const renderPasswordStrength = () => {
    if (mode !== 'register' && mode !== 'reset') return null;
    
    return (
      <div className="password-strength-container">
        <div className="strength-bars">
          {[1, 2, 3, 4].map(level => (
            <div 
              key={level} 
              className={`strength-bar ${passwordStrength >= level ? `active-${passwordStrength}` : ''}`} 
            />
          ))}
        </div>
        <ul className="strength-rules">
          <li className={formData.password.length >= 8 ? 'valid' : ''}>Mínimo 8 caracteres</li>
          <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>Al menos una mayúscula</li>
          <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>Al menos una minúscula</li>
          <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>Al menos un número</li>
        </ul>
      </div>
    );
  };

  return (
    <section className="signin-container">
      <div className="signin-bg-glow"></div>
      
      <div ref={revealRef} className="reveal signin-card">
        <div className="signin-header">
          <div className="signin-logo-container">
            <h1 className="signin-brand">SAFAR</h1>
          </div>
          <h2 className="signin-title">
            {mode === 'register' && 'Crear Cuenta'}
            {mode === 'login' && 'Iniciar Sesión'}
            {mode === 'verify' && 'Verificar Cuenta'}
            {mode === 'forgot' && 'Recuperar Contraseña'}
            {mode === 'reset' && 'Nueva Contraseña'}
          </h2>
          <p className="signin-subtitle">
            {mode === 'register' && 'Únete a Safar y reserva tu viaje Elite'}
            {mode === 'login' && 'Accede a tu panel y reservas Elite'}
            {mode === 'verify' && 'Hemos enviado un código a tu correo.'}
            {mode === 'forgot' && 'Ingresa tu correo para recibir un código de recuperación.'}
            {mode === 'reset' && 'Ingresa el código que enviamos y tu nueva contraseña.'}
          </p>
        </div>

        {error && <div className="signin-error">{error}</div>}
        {message && <div className="signin-message">{message}</div>}

        <form className="signin-form" onSubmit={handleEmailAuth}>
          {mode === 'register' && (
            <div className="input-field">
              <label>Nombre Completo</label>
              <input 
                type="text" 
                placeholder="Juan Pérez" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          )}
          
          {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
            <div className="input-field">
              <label>Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="tu@correo.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          )}

          {(mode === 'verify' || mode === 'reset') && (
            <div className="input-field">
              <label>Código de Verificación (OTP)</label>
              <input 
                type="text" 
                placeholder="000000" 
                maxLength="6"
                style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.2rem' }}
                value={formData.otp}
                onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/[^0-9]/g, '')})}
                required
              />
            </div>
          )}
          
          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <div className="input-field">
              <label>{mode === 'reset' ? 'Nueva Contraseña' : 'Contraseña'}</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              {renderPasswordStrength()}
            </div>
          )}

          <button type="submit" className="signin-submit-btn" disabled={isLoading}>
            {isLoading 
              ? 'PROCESANDO...' 
              : mode === 'register' ? 'REGISTRARSE'
              : mode === 'login' ? 'INICIAR SESIÓN'
              : mode === 'verify' ? 'VERIFICAR CÓDIGO'
              : mode === 'forgot' ? 'ENVIAR RECUPERACIÓN'
              : 'ACTUALIZAR CONTRASEÑA'
            }
          </button>
        </form>

        <div className="auth-toggle-container">
          {mode === 'login' && (
            <>
              <button type="button" className="auth-toggle-btn" onClick={() => { 
                setMode('forgot'); 
                setError(''); 
                setMessage(''); 
                setFormData(prev => ({ ...prev, otp: '', password: '' }));
              }}>
                ¿Olvidaste tu contraseña?
              </button>
              <span className="auth-toggle-text">¿No tienes cuenta?</span>
              <button type="button" className="auth-toggle-btn" onClick={() => { setMode('register'); setError(''); setMessage(''); setFormData({ name: '', email: '', password: '', otp: '' }); }}>
                Regístrate aquí
              </button>
            </>
          )}

          {mode === 'register' && (
            <>
              <span className="auth-toggle-text">¿Ya tienes cuenta?</span>
              <button type="button" className="auth-toggle-btn" onClick={() => { setMode('login'); setError(''); setMessage(''); setFormData({ name: '', email: '', password: '', otp: '' }); }}>
                Inicia sesión aquí
              </button>
            </>
          )}

          {mode === 'verify' && (
            <>
              <span className="auth-toggle-text">¿No recibiste el código?</span>
              <button type="button" className="auth-toggle-btn" onClick={handleResendOtp} disabled={isLoading}>
                Reenviar código
              </button>
              <button type="button" className="auth-toggle-btn" onClick={() => setMode('login')} style={{marginTop: '10px'}}>
                Volver al Login
              </button>
            </>
          )}

          {(mode === 'forgot' || mode === 'reset') && (
            <button type="button" className="auth-toggle-btn" onClick={() => { setMode('login'); setError(''); setMessage(''); }}>
              Volver al Login
            </button>
          )}
        </div>

        {(mode === 'login' || mode === 'register') && (
          <>
            <div className="signin-divider">
              <span>O {mode === 'register' ? 'regístrate' : 'ingresa'} con</span>
            </div>

            <div className="google-auth-container">
              <button 
                type="button" 
                className="google-custom-btn" 
                onClick={() => loginWithGoogle()}
                disabled={isLoading}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
                <span>Acceder con Google</span>
              </button>
            </div>
          </>
        )}

        <button className="signin-back-btn" onClick={() => setActiveView('home')}>
          VOLVER AL INICIO
        </button>
      </div>
    </section>
  );
};

export default SignIn;
