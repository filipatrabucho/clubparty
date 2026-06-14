import { Link, useLocation } from 'react-router-dom';

export default function DashboardNav() {
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: '📊 Estatísticas' },
    { to: '/dashboard/members', label: '👥 Membros' },
    { to: '/dashboard/events', label: '📅 Eventos' },
    { to: '/dashboard/posts/history', label: '📜 Publicações' },
    { to: '/dashboard/bans', label: '🔨 Banidos' },
    { to: '/dashboard/logs', label: '📋 Logs' },
    { to: '/dashboard/sync', label: '🔄 Sincronizar' },
  ];

  return (
    <div className="dashboard-nav">
      {links.map(link => (
        <Link
          key={link.to}
          to={link.to}
          className={`dashboard-nav-link ${location.pathname === link.to ? 'dashboard-nav-link-active' : ''}`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}