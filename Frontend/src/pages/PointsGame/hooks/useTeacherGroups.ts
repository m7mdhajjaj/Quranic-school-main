// hooks/useTeacherGroups.ts
import { useState, useEffect, useCallback } from "react";
import { getTeacherGroupsForPointsGame } from "@/Api/pointsGameApi";

interface Group {
  _id: string;
  name: string;
  totalStudents: number;
}

export const useTeacherGroups = () => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTeacherGroupsForPointsGame();
      setGroups(data || []);
      // اختيار أول حلقة تلقائياً
      if (data && data.length > 0) {
        setSelectedGroupId(data[0]._id);
      }
    } catch (error) {
      console.error("Error loading teacher groups:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return {
    loading,
    groups,
    selectedGroupId,
    setSelectedGroupId,
  };
};
