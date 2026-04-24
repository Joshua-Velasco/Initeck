import { useState } from 'react';
import { BackIcon, CheckIcon } from '../shared/Icons';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { CoverageMap } from '../shared/CoverageMap';
import { getThemeStyles } from './ServiceStyles';

function WhatsAppModal({ 
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

export function PlansLayout({
  id, tag, name, tagline, description, image,
  features, plans, installFee, phone, facebook, instagram, accent, theme,
  imgScale = 1, imgFilter = 'none'
}) {
  useScrollReveal();
  const [modalPlan, setModalPlan] = useState(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
  const { textMuted, textPrimary, titleColor, glassBg, glassBorder } = getThemeStyles(theme);

  const rawPhone = phone ? phone.replace(/\D/g, '') : '';
  const waNumber = rawPhone.length === 10 ? `52${rawPhone}` : rawPhone;

  return (
    <>
      {modalPlan && (
        <WhatsAppModal 
          isOpen={!!modalPlan}
          onClose={() => setModalPlan(null)}
          projectName={name}
          planInfo={{ label: 'Paquete', value: modalPlan.speed }}
          price={modalPlan.price}
          accent={accent}
          textMuted={textMuted}
          waNumber={waNumber}
        />
      )}

      <div className="container" style={{ maxWidth: '1200px', margin: '3rem auto 0 auto', padding: '0 1.5rem' }}>
        <div className="reveal" style={{ background: glassBg, backdropFilter: 'blur(24px)', border: `1px solid ${glassBorder}`, borderRadius: '32px' }}>
          <div style={{ position: 'relative', width: '100%', height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at center, ${accent}18 0%, transparent 70%)`, borderRadius: '32px 32px 0 0' }}>
            <img
              src={image} alt={name}
              style={{ height: '340px', width: 'auto', maxWidth: '100%', objectFit: 'contain', transform: `scale(${imgScale})`, filter: imgFilter, animation: 'float-hero 8s ease-in-out infinite', position: 'relative', zIndex: 1 }}
            />
          </div>

          <div style={{ padding: '3rem 3.5rem' }}>
            <div style={{ display: 'inline-block', background: `${accent}20`, border: `1px solid ${accent}40`, borderRadius: '99px', padding: '0.4rem 1.4rem', fontSize: '0.75rem', fontWeight: '800', color: accent, marginBottom: '1.5rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {tag}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.2rem' }}>
              <div>
                <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: '1', margin: 0, color: titleColor }}>{name}</h1>
                <p style={{ fontSize: '1.2rem', color: accent, fontWeight: '700', margin: '0.6rem 0 0' }}>{tagline}</p>
              </div>
              {phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: textMuted, fontSize: '0.9rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '99px', padding: '0.5rem 1.2rem' }}>
                    <span>📞</span>
                    <strong style={{ color: textPrimary }}>{phone}</strong>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    {facebook && (
                      <a 
                        href={facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          width: '38px', 
                          height: '38px', 
                          background: 'rgba(255,255,255,0.04)', 
                          border: '1px solid rgba(255,255,255,0.08)', 
                          borderRadius: '50%', 
                          color: textMuted,
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = '#1877F2';
                          e.currentTarget.style.background = 'rgba(24, 119, 242, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(24, 119, 242, 0.3)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = textMuted;
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                      </a>
                    )}

                    {instagram && (
                      <a 
                        href={instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          width: '38px', 
                          height: '38px', 
                          background: 'rgba(255,255,255,0.04)', 
                          border: '1px solid rgba(255,255,255,0.08)', 
                          borderRadius: '50%', 
                          color: textMuted,
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = '#E4405F';
                          e.currentTarget.style.background = 'rgba(228, 64, 95, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(228, 64, 95, 0.3)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = textMuted;
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <p style={{ color: textMuted, lineHeight: '1.8', fontSize: '1rem', marginBottom: '2rem', maxWidth: '700px' }}>{description}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2.5rem' }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: `${accent}10`, border: `1px solid ${accent}25`, borderRadius: '99px', padding: '0.4rem 1rem', fontSize: '0.85rem', color: titleColor }}>
                  <CheckIcon color={accent} size={14} /> {f}
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginBottom: '2rem' }} />
            <div style={{ fontSize: '0.7rem', color: textMuted, fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.2rem' }}>Planes disponibles</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {plans.map((plan, i) => {
                const isSelected = selectedPlanIndex === i;
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedPlanIndex(isSelected ? null : i)}
                    style={{
                      background: isSelected ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : `${accent}12`,
                      border: isSelected ? `2px solid ${accent}` : `1px solid ${accent}35`,
                      borderRadius: '18px',
                      padding: '1.8rem 1.2rem',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      transform: isSelected ? 'translateY(-6px) scale(1.03)' : 'translateY(0)',
                      boxShadow: isSelected ? `0 16px 40px ${accent}35` : 'none'
                    }}
                  >
                    {isSelected && (
                      <div style={{ fontSize: '0.6rem', fontWeight: '900', background: 'rgba(255,255,255,0.25)', borderRadius: '99px', padding: '0.2rem 0.8rem', color: 'white', letterSpacing: '0.1em' }}>SELECCIONADO</div>
                    )}
                    <div style={{ fontSize: '0.85rem', color: isSelected ? 'rgba(255,255,255,0.85)' : textMuted, fontWeight: '600' }}>{plan.speed}</div>
                    <div style={{ fontSize: '1.9rem', fontWeight: '900', color: isSelected ? 'white' : accent, lineHeight: '1' }}>{plan.price}</div>
                    <div style={{ fontSize: '0.65rem', color: isSelected ? 'rgba(255,255,255,0.6)' : textMuted }}>/ mensual</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setModalPlan(plan); }}
                      style={{
                        marginTop: '1rem', width: '100%',
                        background: isSelected ? 'rgba(255,255,255,0.2)' : accent,
                        border: isSelected ? '1px solid rgba(255,255,255,0.4)' : 'none',
                        color: isSelected ? 'white' : (theme === 'yellow' || theme === 'gold' ? 'black' : 'white'), 
                        padding: '0.65rem 0.5rem',
                        borderRadius: '10px', fontWeight: '800', fontSize: '0.78rem',
                        cursor: 'pointer', transition: 'all 0.2s',
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                      }}
                    >
                      Contratar Ahora
                    </button>
                  </div>
                );
              })}
            </div>

            {installFee && (
              <div style={{ fontSize: '0.85rem', color: textMuted, textAlign: 'center' }}>
                Costo de instalación: <strong style={{ color: textPrimary }}>{installFee}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {id === 'tecnobyte' && (
        <div className="container" style={{ paddingBottom: '8rem' }}>
          <CoverageMap />
        </div>
      )}
    </>
  );
}
