import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { PATHS } from '../../routes/paths';
import { presenceService } from '../../utils/presenceService';

/**
 * ProtectedRoute
 * Guards routes that require authentication.
 * Checks for userId in localStorage — if absent, redirects to /login.
 * Checks for isActive — if false, redirects to /profile to verify email.
 * Also initializes the global SignalR presence connection for authenticated users.
 */
export default function ProtectedRoute({ children }) {
  const userId = localStorage.getItem('userId');
  const isActiveStr = localStorage.getItem('isActive');
  // Consider verified if it's explicitly 'true' or if we don't have this field yet (legacy support)
  const isActive = isActiveStr === 'true' || isActiveStr === 'True' || isActiveStr === null;
  const location = useLocation();

  useEffect(() => {
    if (userId) {
      // Start the presence connection globally as long as the user is authenticated
      presenceService.startConnection();
    }
  }, [userId]);

  if (!userId) {
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  // If user is logged in but not active/verified, restrict access to everything except PROFILE
  if (!isActive && location.pathname !== PATHS.PROFILE) {
    return <Navigate to={PATHS.PROFILE} state={{ requireActivation: true }} replace />;
  }

  return children;
}
