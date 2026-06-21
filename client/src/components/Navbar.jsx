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
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">⚡ BroadcastStudio</Link>
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
