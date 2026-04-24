export const Footer = ({ onViewChange }) => {
  const socialLinks = [
    { name: 'Tecnobyte', url: 'https://www.facebook.com/TecknobyteTech', platform: 'facebook' },
    { name: 'Initeck', url: 'https://www.facebook.com/IniteckTechnology', platform: 'facebook' },
    { name: 'InibyteTv', url: 'https://www.facebook.com/profile.php?id=61582547274890', platform: 'facebook' },
    { name: 'Target.In', url: 'https://www.instagram.com/target.in25?igsh=OXltODYxamgwZ3Bk', platform: 'instagram' }
  ];

  return (
    <footer style={{ padding: '6rem 0 3rem', background: 'black', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: '800', fontSize: '1.8rem', fontFamily: 'var(--heading)' }}>
          <img src="/IniteckLogo.png" alt="Initeck Logo" style={{ height: '36px', width: 'auto' }} />
        </div>
        
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['tecnobyte', 'initeck', 'InibyteTv', 'targetin'].map(id => (
            <button 
              key={id} 
              onClick={() => onViewChange(id === 'targetin' ? 'targetin' : id)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'color 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'white'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {id === 'targetin' ? 'Target.In' : id === 'InibyteTv' ? 'InibyteTv' : id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {socialLinks.map(social => (
            <a 
              key={social.name} 
              href={social.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.color = social.platform === 'facebook' ? '#1877F2' : '#E4405F'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            >
              {social.platform === 'facebook' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              )}
              {social.name}
            </a>
          ))}
        </div>

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginTop: '2rem' }}>© 2026 Initeck International. Innovación sin fronteras.</p>
      </div>
    </footer>
  );
};
