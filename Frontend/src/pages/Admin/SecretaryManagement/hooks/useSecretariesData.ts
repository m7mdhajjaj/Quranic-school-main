import { useState, useEffect, useCallback } from "react";
import { getAllSecretaries } from "@/Api/secretaryApi";
import type { Secretary } from "../types";

export const useSecretariesData = () => {
  const [secretaries, setSecretaries] = useState<Secretary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSecretaries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getAllSecretaries();

      if (response.success && Array.isArray(response.data)) {
        setSecretaries(response.data);
      } else {
        throw new Error(response.message || "فشل في جلب بيانات السكرتيرين");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecretaries();
  }, [fetchSecretaries]);

  const refetch = useCallback(() => {
    fetchSecretaries();
  }, [fetchSecretaries]);

  return {
    secretaries,
    setSecretaries,
    isLoading,
    error,
    refetch,
  };
};
