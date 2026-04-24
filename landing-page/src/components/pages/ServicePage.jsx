import { useScrollReveal } from '../../hooks/useScrollReveal';
import { BackIcon } from '../shared/Icons';
import { PlansLayout } from '../services/PlansLayout';
import { SingleServiceLayout } from '../services/SingleServiceLayout';
import { getThemeStyles } from '../services/ServiceStyles';

export function ServicePage(props) {
  const { theme, bgImage, onViewChange, plans } = props;
  const { textPrimary } = getThemeStyles(theme);
  
  const hasPlans = Array.isArray(plans) && plans.length > 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: bgImage
        ? `url(${bgImage}) center/cover no-repeat fixed`
        : theme === 'blue'
          ? 'radial-gradient(circle at 50% -20%, #1e3a8a 0%, #000000 80%)'
          : theme === 'green'
            ? 'radial-gradient(circle at 50% -20%, #064e3b 0%, #000000 80%)'
          : theme === 'gold' || theme === 'yellow'
            ? 'radial-gradient(circle at 50% -20%, #2b2200 0%, #000000 85%)'
            : 'black',
      color: textPrimary,
      padding: '6rem 2rem 5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <button
        onClick={() => onViewChange('home')}
        style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: textPrimary, cursor: 'pointer', opacity: 0.7, fontWeight: '600', zIndex: 100 }}
        onMouseEnter={e => (e.currentTarget.style.opacity = 1)}
        onMouseLeave={e => (e.currentTarget.style.opacity = 0.7)}
      >
        <BackIcon /> Volver al Inicio
      </button>

      {hasPlans ? (
        <PlansLayout {...props} />
      ) : (
        <SingleServiceLayout {...props} />
      )}
    </div>
  );
}
