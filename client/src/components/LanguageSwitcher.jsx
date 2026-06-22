import { useState, useRef, useEffect } from 'react';
import { useI18n, AVAILABLE_LANGUAGES } from '../i18n/index.jsx';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = AVAILABLE_LANGUAGES.find(l => l.code === language);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if (!open) return;
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-sm"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          minWidth: '60px',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>{current?.flag}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{current?.code.toUpperCase()}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Available languages"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '4px',
            minWidth: '160px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            zIndex: 1001,
            listStyle: 'none',
          }}
        >
          {AVAILABLE_LANGUAGES.map(lang => (
            <li
              key={lang.code}
              role="option"
              aria-selected={lang.code === language}
              onClick={() => { setLanguage(lang.code); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: lang.code === language ? '#f7c948' : 'rgba(255,255,255,0.7)',
                background: lang.code === language ? 'rgba(247,201,72,0.1)' : 'transparent',
                fontWeight: lang.code === language ? 600 : 400,
                fontSize: '0.9rem',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => {
                if (lang.code !== language) e.target.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={e => {
                if (lang.code !== language) e.target.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
              <span>{lang.name}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.5 }}>
                {lang.code.toUpperCase()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
