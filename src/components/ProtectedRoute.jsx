import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

export default function ProtectedRoute({ children, roles = ['helper', 'mod', 'admin'] }) {
  const { user, loading } = useAuth();

  if (loading) return <p>A carregar...</p>;

  if (!user) return <Navigate to="/" replace />;

  if (!roles.includes(user.dashboard_role)) {
    return <p>Não tens permissão para ver esta página.</p>;
  }

  return children;
}