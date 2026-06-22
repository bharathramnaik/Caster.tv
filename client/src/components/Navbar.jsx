import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/library', label: 'Templates' },
    { path: '/editor', label: 'Editor' },
    { path: '/scenes', label: 'Scenes' },
    { path: '/live', label: 'Live' },
    { path: '/teams', label: 'Teams' },
    { path: '/points', label: 'Points' },
    { path: '/integrations', label: 'Integrations' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/bugs', label: 'Bugs' },
  ];

  return (
    <nav className="navbar animated-gradient-header">
      <div className="nav-brand">
        <Link to="/" className="shimmer">⚡ BroadcastStudio</Link>
      </div>
      <div className="nav-links">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="nav-actions">
        <button onClick={toggle} className="btn btn-sm">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
}
