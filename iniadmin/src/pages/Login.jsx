import React, { useState } from 'react';
import { Shield, User, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm]       = useState({ usuario: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);
  const [error, setError]      = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.usuario || !form.password) return;
    setLoading(true);
    setError('');
    const result = await login(form.usuario, form.password);
    if (!result.ok) setError(result.message || 'Error al iniciar sesión');
    setLoading(false);
  };

  return (
    <div style={{
      height: '100vh',
      background: 'var(--gradient-brand)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decoraciones de fondo */}
      <div style={{ position: 'absolute', top: -120, right: -120, width: 420, height: 420, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -180, left: -120, width: 520, height: 520, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', left: '15%', width: 180, height: 180, borderRadius: '50%', background: 'rgba(239,68,68,0.06)', pointerEvents: 'none' }} />

      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-2xl), 0 0 0 1px rgba(0,0,0,0.04)',
        width: '100%',
        maxWidth: 420,
        padding: '44px 40px',
        position: 'relative',
        animation: 'fadeInScale 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 60, height: 60,
            background: 'var(--gradient-brand)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
            boxShadow: '0 8px 28px rgba(185,28,28,0.35)',
          }}>
            <Shield size={30} color="white" strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--gray-900)', margin: '0 0 6px', letterSpacing: '-0.6px' }}>
            IniAdmin
          </h1>
          <p style={{ fontSize: 13, color: 'var(--gray-400)', margin: 0, fontWeight: 500 }}>
            Panel de Procesos Internos — Initeck
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="animate-fade-in" style={{
            background: 'var(--danger-light)', color: '#991b1b',
            border: '1px solid var(--red-200)',
            borderRadius: 'var(--radius-md)', padding: '10px 14px',
            fontSize: 13, fontWeight: 500, marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Campo usuario */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', display: 'block', marginBottom: 7, letterSpacing: '0.2px' }}>
              USUARIO
            </label>
            <div style={{ position: 'relative' }}>
              <User size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
              <input
                className="input-admin"
                type="text"
                placeholder="Ingresa tu usuario"
                value={form.usuario}
                onChange={e => setForm(p => ({ ...p, usuario: e.target.value }))}
                style={{ paddingLeft: 38 }}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          {/* Campo contraseña */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', display: 'block', marginBottom: 7, letterSpacing: '0.2px' }}>
              CONTRASEÑA
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
              <input
                className="input-admin"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                style={{ paddingLeft: 38, paddingRight: 42 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--gray-400)', padding: 4, display: 'flex', alignItems: 'center',
                  borderRadius: 'var(--radius-sm)', transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gray-600)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-400)'}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Botón submit */}
          <button
            type="submit"
            disabled={loading || !form.usuario || !form.password}
            className="btn-admin btn-primary"
            style={{
              width: '100%', justifyContent: 'center',
              padding: '13px', fontSize: 14, fontWeight: 700,
              marginTop: 4, letterSpacing: '0.2px',
            }}
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Verificando...</>
              : 'Iniciar Sesión'}
          </button>

        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--gray-300)', marginTop: 28, marginBottom: 0 }}>
          Initeck · Sistema de Administración Interna
        </p>
      </div>
    </div>
  );
}
