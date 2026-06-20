import { useEffect, useState } from 'react';
import { presenceService } from '../utils/presenceService';

export const usePresenceSignalR = (userId, initialStatus) => {
  const [isOnline, setIsOnline] = useState(initialStatus);

  // Sync state if initialStatus prop changes from a re-fetch
  useEffect(() => {
    setIsOnline(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to presence changes
    const unsubscribe = presenceService.subscribe((changedUserId, status) => {
      // The backend might send the ID as an integer or string, so use string comparison
      if (String(changedUserId) === String(userId)) {
        setIsOnline(status);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return isOnline;
};
