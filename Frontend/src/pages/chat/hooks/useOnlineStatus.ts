// ============================================================================
// useOnlineStatus.ts - Online Status & Last Seen Hook
// ============================================================================

import { useState, useEffect, useContext } from 'react';
import { UserStatusContext } from '../../../Context/UserStatusContext';
import api from '../../../Api/api';

export const useOnlineStatus = (chatType: 'DM' | 'GROUP', targetId: string) => {
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const statusContext = useContext(UserStatusContext);
  
  const userStatus = chatType === 'DM' && statusContext 
    ? statusContext.getUserStatus(targetId) 
    : null;
    
  const isOnline = userStatus?.isActive || false;

  useEffect(() => {
    if (chatType === 'DM' && targetId && !isOnline) {
      if (userStatus?.timestamp && !userStatus.isActive) {
        setLastSeen(userStatus.timestamp);
      }

      const fetchLastSeen = async () => {
        try {
          const res = await api.get(`/users/${targetId}/status`);
          if (res.data?.lastSeen) {
            setLastSeen((prev) => {
              const newTimestamp = res.data.lastSeen;
              if (!prev || new Date(newTimestamp) > new Date(prev)) {
                return newTimestamp;
              }
              return prev;
            });
          }
        } catch (error) {
          console.error("Failed to fetch last seen:", error);
        }
      };
      
      fetchLastSeen();
      const pollInterval = setInterval(fetchLastSeen, 30000);
      return () => clearInterval(pollInterval);
    } else {
      setLastSeen(null);
    }
  }, [chatType, targetId, isOnline, userStatus?.timestamp, userStatus?.isActive]);

  return { isOnline, lastSeen };
};
