import { useState, useCallback, useRef, useMemo } from "react";
import { getAllGroups, type Group, type GroupsQueryParams, type PaginationInfo } from "@/Api/groupApi";

export const useGroupsData = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  // Fetch groups with filters and pagination
  const fetchGroups = useCallback(async (params?: GroupsQueryParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAllGroups(params);

      if (result.success && result.data) {
        setGroups(result.data);
        if (result.pagination) {
          setPagination(result.pagination);
        }
        setError(null);
      } else {
        throw new Error(result.message || "البيانات المستلمة غير صحيحة");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ في تحميل البيانات";
      setError(errorMessage);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshGroups = useCallback((params?: GroupsQueryParams) => {
    fetchGroups(params);
  }, [fetchGroups]);

  return useMemo(() => ({
    groups,
    setGroups,
    pagination,
    isLoading,
    error,
    fetchGroups,
    refreshGroups,
    initialLoadDone,
  }), [groups, pagination, isLoading, error, fetchGroups, refreshGroups]);
};
