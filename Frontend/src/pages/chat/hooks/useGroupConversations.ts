import { useState, useCallback, useRef } from 'react';
import api from '../../../Api/api';

// Cache to prevent multiple initializations across component instances
let isInitializing = false;
let lastInitTime = 0;
const INIT_COOLDOWN = 30000; // 30 seconds cooldown

export const useGroupConversations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);

  const initializeGroupConversations = useCallback(async (force = false) => {
    // Prevent multiple simultaneous calls
    if (isInitializing) {
      console.log('🔄 [GroupConversations] Already initializing, skipping...');
      return null;
    }

    // Check cooldown (unless forced)
    const now = Date.now();
    if (!force && lastInitTime && (now - lastInitTime) < INIT_COOLDOWN) {
      console.log('⏳ [GroupConversations] Cooldown active, skipping...');
      return null;
    }

    // Prevent re-initialization in same component instance
    if (!force && hasInitializedRef.current) {
      console.log('✅ [GroupConversations] Already initialized in this instance');
      return null;
    }

    isInitializing = true;
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.post('/chat/initialize-groups');
      lastInitTime = Date.now();
      hasInitializedRef.current = true;
      console.log('✅ [GroupConversations] Initialized successfully');
      return res.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
      isInitializing = false;
    }
  }, []);

  return { initializeGroupConversations, loading, error };
};
