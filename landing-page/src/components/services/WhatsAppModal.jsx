import { useState } from 'react';

export function WhatsAppModal({ 
  isOpen, onClose, 
  projectName, planInfo, price, 
  accent, textMuted, waNumber 
}) {
  const [form, setForm] = useState({ nombre: '', direccion: '', telefono: '', mensaje: '' });
  const [sent, setSent] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    const now = new Date();
    const fecha = now.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const text = encodeURIComponent(
      `¡Hola! Me interesa contratar un servicio de *${projectName}*.\n\n` +
      `📦 *${planInfo.label}:* ${planInfo.value}\n💰 *Precio:* ${price}/mes\n📅 *Fecha de solicitud:* ${fecha}\n\n` +
      `📛 *Nombre:* ${form.nombre}\n📍 *Dirección:* ${form.direccion}\n📱 *Teléfono:* ${form.telefono}` +
      (form.mensaje ? `\n💬 *Nota:* ${form.mensaje}` : '')
    );
    window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
    setSent(true);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#0d1117', border: `1px solid ${accent}40`, borderRadius: '24px', padding: '2.5rem', maxWidth: '460px', width: '100%', boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 40px ${accent}20` }}
      >
        {sent ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '0.5rem' }}>¡Mensaje enviado!</h3>
            <p style={{ color: textMuted, marginBottom: '2rem' }}>
              Se abrió WhatsApp con tu solicitud. Nuestro equipo te contactará pronto.
            </p>
            <button onClick={onClose} style={{ background: accent, color: 'white', border: 'none', padding: '0.9rem 2.5rem', borderRadius: '99px', fontWeight: '800', cursor: 'pointer', fontSize: '0.95rem' }}>
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: accent, fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{projectName} · {planInfo.value}</div>
                <h3 style={{ color: 'white', fontSize: '1.6rem', fontWeight: '900', margin: 0 }}>Contratar Servicio</h3>
                <p style={{ color: textMuted, fontSize: '0.9rem', marginTop: '0.3rem' }}>Precio: <strong style={{ color: accent }}>{price}/mes</strong></p>
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSend} style={{ display: 'grid', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: textMuted, fontWeight: '700', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nombre completo *</label>
                <input
                  required
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej. Juan García López"
                  style={{ width: '100%', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = accent)}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: textMuted, fontWeight: '700', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dirección *</label>
                <input
                  required
                  type="text"
                  value={form.direccion}
                  onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
                  placeholder="Ej. Calle Roble #123, Col. Centro"
                  style={{ width: '100%', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = accent)}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: textMuted, fontWeight: '700', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Teléfono *</label>
                <input
                  required
                  type="tel"
                  value={form.telefono}
                  onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                  placeholder="Ej. 656-123-4567"
                  style={{ width: '100%', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = accent)}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', color: textMuted, fontWeight: '700', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Nota adicional (opcional)</label>
                <textarea
                  rows={3}
                  value={form.mensaje}
                  onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
                  placeholder="Dirección, dudas, horario preferido..."
                  style={{ width: '100%', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '1rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = accent)}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
              <button
                type="submit"
                style={{ background: '#25D366', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
              >
                <span style={{ fontSize: '1.2rem' }}>💬</span> Enviar por WhatsApp
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
