import { useState, useEffect } from "react";
import api from "@/Api/api";
import { useAuth } from "@/Context/AuthContext";
import { Alert } from "react-native";

interface Group {
  _id: string;
  name: string;
  teacher?: string;
}

export const useTeacherGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // استخدام الـ endpoint الصحيح مع teacher ID
        const response = await api.get(`/groups/teacher/${user._id}`);
        setGroups(response.data.data || response.data || []);
      } catch (error: any) {
        console.log(
          "Error fetching groups:",
          error.response?.data || error.message
        );
        Alert.alert(
          "خطأ",
          error?.response?.data?.message || "فشل تحميل الحلقات"
        );
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user?._id]);

  return { groups, loading };
};
