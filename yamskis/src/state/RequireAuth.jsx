import { useContext } from 'react';
import { Navigate } from 'react-router-dom';

import { AuthContext } from './AuthContext.jsx';

export function RequireAuth({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useContext(AuthContext);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}

