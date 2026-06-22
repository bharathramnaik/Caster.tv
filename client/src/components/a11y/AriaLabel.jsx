import { generateId } from '../../utils/accessibility.js';

export default function AriaLabel({ label, children, as: Tag = 'span' }) {
  const id = generateId('aria-label');
  return (
    <Tag aria-labelledby={id} {...(typeof children === 'string' ? {} : { 'aria-label': label })}>
      {typeof children === 'string' ? children : children}
      {typeof children !== 'string' && (
        <span id={id} style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
          {label}
        </span>
      )}
    </Tag>
  );
}
