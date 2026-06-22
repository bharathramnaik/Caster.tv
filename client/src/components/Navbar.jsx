import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useI18n } from '../i18n/index.jsx';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/library', label: t('nav.templates') },
    { path: '/editor', label: t('nav.editor') },
    { path: '/scenes', label: t('nav.scenes') },
    { path: '/live', label: t('nav.live') },
    { path: '/teams', label: t('nav.teams') },
    { path: '/points', label: t('nav.points') },
    { path: '/integrations', label: t('nav.integrations') },
    { path: '/analytics', label: t('nav.analytics') },
    { path: '/bugs', label: t('nav.bugs') },
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
        <LanguageSwitcher />
        <button onClick={toggle} className="btn btn-sm">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
}
