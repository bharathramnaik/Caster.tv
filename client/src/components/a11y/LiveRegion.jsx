import { useEffect, useRef } from 'react';

export default function LiveRegion({ message = '', priority = 'polite', className = '', ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && message) {
      ref.current.textContent = '';
      requestAnimationFrame(() => {
        if (ref.current) ref.current.textContent = message;
      });
    }
  }, [message]);

  return (
    <div
      ref={ref}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className={className}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
      {...props}
    />
  );
}
