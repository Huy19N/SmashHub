import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { PATHS } from '../../routes/paths';
import { presenceService } from '../../utils/presenceService';

/**
 * ProtectedRoute
 * Guards routes that require authentication.
 * Checks for userId in localStorage — if absent, redirects to /login.
 * Also initializes the global SignalR presence connection for authenticated users.
 */
export default function ProtectedRoute({ children }) {
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      // Start the presence connection globally as long as the user is authenticated
      presenceService.startConnection();
    }
  }, [userId]);

  if (!userId) {
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  return children;
}
