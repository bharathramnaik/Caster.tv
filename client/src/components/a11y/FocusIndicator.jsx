import { useEffect, useRef } from 'react';

export default function FocusIndicator({ children, className = '', style = {}, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onFocus() { el.classList.add('focus-visible'); }
    function onBlur() { el.classList.remove('focus-visible'); }

    el.addEventListener('focus', onFocus);
    el.addEventListener('blur', onBlur);
    return () => {
      el.removeEventListener('focus', onFocus);
      el.removeEventListener('blur', onBlur);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`focus-indicator ${className}`}
      style={{
        outline: 'none',
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid var(--accent)';
        e.currentTarget.style.outlineOffset = '2px';
        e.currentTarget.style.borderRadius = 'var(--radius-sm)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
}
