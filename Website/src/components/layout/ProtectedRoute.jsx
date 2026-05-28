import { Navigate } from 'react-router-dom';
import { PATHS } from '../../routes/paths';

/**
 * ProtectedRoute
 * Guards routes that require authentication.
 * Checks for userId in localStorage — if absent, redirects to /login.
 */
export default function ProtectedRoute({ children }) {
  const userId = localStorage.getItem('userId');

  if (!userId) {
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  return children;
}
