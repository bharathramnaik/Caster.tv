import { useI18n } from '../../i18n/index.jsx';

export default function SkipToContent() {
  const { t } = useI18n();

  function handleSkip(e) {
    e.preventDefault();
    const main = document.getElementById('main-content');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
    }
  }

  return (
    <a
      href="#main-content"
      onClick={handleSkip}
      style={{
        position: 'absolute',
        top: '-100%',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--accent)',
        color: '#000',
        padding: '12px 24px',
        borderRadius: '0 0 12px 12px',
        fontWeight: 700,
        fontSize: '0.9rem',
        zIndex: 10000,
        textDecoration: 'none',
        transition: 'top 0.2s ease',
      }}
      onFocus={(e) => { e.target.style.top = '0'; }}
      onBlur={(e) => { e.target.style.top = '-100%'; }}
    >
      {t('common.skipToMainContent')}
    </a>
  );
}
