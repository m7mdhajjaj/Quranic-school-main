import { useState, useEffect, useCallback } from "react";
import { getAllTeacherAssistants, type TeacherAssistantFiltersParams } from "@/Api/teacherAssistantApi";
import { socketManager } from "@/Socket/SocketManager";
import { DEBOUNCE_TIME, MESSAGES } from "../constants";
import type { TeacherAssistant } from "../types";

export const useTeacherAssistantsData = (filters?: TeacherAssistantFiltersParams) => {
  const [assistants, setAssistants] = useState<TeacherAssistant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for real-time status updates
  useEffect(() => {
    const handleUserStatus = (...args: unknown[]) => {
      const data = args[0] as { userId: string; isActive: boolean; timestamp: string };
      if (data && data.userId) {
        setAssistants((prevAssistants) =>
          prevAssistants.map((assistant) =>
            assistant._id === data.userId
              ? { ...assistant, lastSeen: new Date(data.timestamp) }
              : assistant
          )
        );
      }
    };

    socketManager.on('user-status', handleUserStatus);

    return () => {
      socketManager.off('user-status', handleUserStatus);
    };
  }, []);

  const fetchAssistants = useCallback(async (filterParams?: TeacherAssistantFiltersParams) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getAllTeacherAssistants(filterParams);

      if (response.success && Array.isArray(response.data)) {
        setAssistants(response.data as TeacherAssistant[]);
      } else {
        throw new Error(response.message || MESSAGES.ERROR.FETCH_DATA);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : MESSAGES.ERROR.UNEXPECTED;
      setError(errorMessage);
      console.error('Error fetching assistants:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced fetch with configurable delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAssistants(filters);
    }, DEBOUNCE_TIME.FILTERS);

    return () => clearTimeout(timeoutId);
  }, [fetchAssistants, filters]);

  const refetch = useCallback(() => {
    fetchAssistants(filters);
  }, [fetchAssistants, filters]);

  return {
    assistants,
    setAssistants,
    isLoading,
    error,
    refetch,
  };
};
