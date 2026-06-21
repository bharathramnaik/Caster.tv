const ROLE_STYLES = {
  admin: {
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#a855f7',
    border: '1px solid rgba(139, 92, 246, 0.3)'
  },
  editor: {
    background: 'rgba(59, 130, 246, 0.15)',
    color: '#3b82f6',
    border: '1px solid rgba(59, 130, 246, 0.3)'
  },
  viewer: {
    background: 'rgba(100, 116, 139, 0.15)',
    color: '#94a3b8',
    border: '1px solid rgba(100, 116, 139, 0.3)'
  }
};

export default function PermissionBadge({ role = 'viewer', size = 'sm' }) {
  const style = ROLE_STYLES[role] || ROLE_STYLES.viewer;
  const sizeStyles = size === 'lg'
    ? { padding: '6px 14px', fontSize: '0.8rem' }
    : { padding: '2px 8px', fontSize: '0.68rem' };

  return (
    <span
      className="permission-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '9999px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        ...style,
        ...sizeStyles
      }}
    >
      {role}
    </span>
  );
}
