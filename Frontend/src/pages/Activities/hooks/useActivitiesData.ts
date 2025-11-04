import { useState, useEffect } from "react";
import { getAllActivities } from "@/Api/activityApi";
import type { Activity, User } from "../types/activities";

export const useActivitiesData = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isTeacherOrAdmin, setIsTeacherOrAdmin] = useState<boolean>(false);

  // Check user role
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const userData = JSON.parse(userJson) as User;
        setCurrentUser(userData);
        setIsTeacherOrAdmin(
          userData.role === "teacher" || userData.role === "admin"
        );
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  // Fetch activities
  const fetchActivities = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const data = await getAllActivities();
      setActivities(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("حدث خطأ أثناء جلب الأنشطة");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const refetchActivities = (showLoader = false) => {
    fetchActivities(showLoader);
  };

  return {
    activities,
    setActivities,
    loading,
    setLoading,
    error,
    setError,
    currentUser,
    isTeacherOrAdmin,
    refetchActivities,
  };
};
