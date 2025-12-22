import { useState } from 'react';
import api from '../../../Api/api';

export const useGroupConversations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeGroupConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/chat/initialize-groups');
      return res.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { initializeGroupConversations, loading, error };
};
