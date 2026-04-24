export const getThemeStyles = (theme) => {
  const textPrimary = theme === 'yellow' ? '#eab308' : theme === 'gold' ? '#fde047' : 'white';
  const textMuted   = theme === 'yellow' ? 'rgba(234,179,8,0.7)' : theme === 'gold' ? 'rgba(253,224,71,0.7)' : 'rgba(255,255,255,0.6)';
  const glassBg     = theme === 'white'  ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.02)';
  const glassBorder = theme === 'white'  ? 'rgba(0,0,0,0.1)'        : 'rgba(255,255,255,0.08)';
  const titleColor  = theme === 'white'  ? '#000000' : 'white';

  return { textPrimary, textMuted, glassBg, glassBorder, titleColor };
};
