// ============================================================================
// useSecretaryData Hook - جلب بيانات السكرتيرين
// ============================================================================

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getAllSecretaries,
  type Secretary,
  type SecretaryFilters,
} from "@/Api/secretaryApi";

interface UseSecretaryDataReturn {
  secretaries: Secretary[];
  loading: boolean;
  error: string | null;
  refetch: (filters?: SecretaryFilters) => Promise<void>;
  initialLoadDone: React.MutableRefObject<boolean>;
}

export const useSecretaryData = (
  initialFilters?: SecretaryFilters
): UseSecretaryDataReturn => {
  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const fetchSecretaries = useCallback(
    async (filters?: SecretaryFilters) => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAllSecretaries(filters || initialFilters);

        if (response.success && response.data) {
          setSecretaries(response.data as Secretary[]);
        } else {
          setError(response.message || "فشل في جلب السكرتيرين");
          setSecretaries([]);
        }
      } catch (err) {
        console.error("Error fetching secretaries:", err);
        setError("حدث خطأ أثناء جلب البيانات");
        setSecretaries([]);
      } finally {
        setLoading(false);
      }
    },
    [initialFilters]
  );

  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchSecretaries(initialFilters);
    }
  }, [fetchSecretaries, initialFilters]);

  return {
    secretaries,
    loading,
    error,
    refetch: fetchSecretaries,
    initialLoadDone,
  };
};

export default useSecretaryData;
