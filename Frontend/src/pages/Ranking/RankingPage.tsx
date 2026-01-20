/**
 * Ranking Page - Modular Version
 * Shows student ranking based on monthly averages
 */

import { useEffect, useState, useMemo } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useRankingSocket } from "../../Socket";
import { useRankingData } from "./hooks/useRankingData";
import {
  generateAvailableYears,
  getCurrentPeriod,
} from "./utils/rankingHelpers";
import type { User } from "./types/ranking";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { Alert } from "@/components/UI/Alert";
import { FilterPanel } from "./components/FilterPanel";
import { PageHeader } from "./components/PageHeader";
import { Podium } from "./components/Podium";
import { RankingTable } from "./components/RankingTable";
import { EmptyState } from "./components/EmptyState";
import { CriteriaCards } from "./components/CriteriaCards";

const RankingPage = () => {
  // Memoized user authentication check
  const userAuth = useMemo(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) return { user: null };

    try {
      const userData = JSON.parse(userJson) as User;
      return { user: userData };
    } catch (err) {
      console.error("Error parsing user data:", err);
      return { user: null };
    }
  }, []);

  const { lastUpdate } = useRankingSocket();

  // Get current period
  const currentPeriod = getCurrentPeriod();

  // State management
  const [selectedMonth, setSelectedMonth] = useState(currentPeriod.month);
  const [selectedYear, setSelectedYear] = useState(currentPeriod.year);
  const [availableYears] = useState(generateAvailableYears());
  const [selectedGroup, setSelectedGroup] = useState(
    userAuth.user?.role === "teacher" && userAuth.user.groups?.[0]
      ? userAuth.user.groups[0].name
      : userAuth.user?.group || ""
  );

  // Fetch ranking data
  const { students, teacherGroups, loading, error, refetch } = useRankingData(
    selectedMonth,
    selectedYear,
    selectedGroup,
    userAuth.user
  );

  // Update selectedGroup when teacherGroups are loaded (if empty or invalid)
  useEffect(() => {
    if (
      userAuth.user?.role === "teacher" &&
      teacherGroups &&
      teacherGroups.length > 0
    ) {
      // If no group selected, OR selected group is not in the list of available groups (e.g. it was inactive)
      if (!selectedGroup || !teacherGroups.includes(selectedGroup)) {
        setSelectedGroup(teacherGroups[0]);
      }
    }
  }, [teacherGroups, selectedGroup, userAuth.user]);

  // Socket: Refresh data when socket updates
  useEffect(() => {
    if (lastUpdate) {
      console.log("📡 Socket update received, refreshing rankings...");
      refetch();
    }
  }, [lastUpdate, refetch]);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      easing: "ease-in-out",
    });
  }, []);

  // Get top three students who have marks (totalMarks > 0)
  const studentsWithMarks = students.filter(student => student.totalMarks > 0);
  const topThreeStudents = studentsWithMarks.slice(0, 3);
  const showPodium = topThreeStudents.length > 0; // Show podium if we have at least 1 student

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20 py-12 px-4"
      dir="rtl">
      <div className="max-w-[98%] mx-auto">
       

        {/* Page Header */}
        <PageHeader
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          studentsCount={studentsWithMarks.length}
        />

        {/* Filter Panel */}
        <FilterPanel
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedGroup={selectedGroup}
          availableYears={availableYears}
          user={userAuth.user}
          teacherGroups={teacherGroups}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          onGroupChange={setSelectedGroup}
        />

        <br />

        {/* Loading indicator */}
        {loading && <LoadingSpinner size="lg" text="جاري تحميل الترتيب..." />}

        {/* Error message */}
        {!loading && error && (
          <Alert variant="danger" className="mb-8">
            {error}
          </Alert>
        )}

        {/* Main content when data is loaded */}
        {!loading && !error && (
          <>
            {/* Show empty state if no students or no students with marks */}
            {students.length === 0 || studentsWithMarks.length === 0 ? (
              <EmptyState
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            ) : (
              <>
                {/* Info message when less than 3 students have marks */}
                {!showPodium && studentsWithMarks.length > 0 && studentsWithMarks.length < 3 && (
                  <Alert variant="info" className="mb-8">
                    يوجد {studentsWithMarks.length} طالب فقط بعلامات في هذا الشهر. يتطلب عرض المنصة 3 طلاب على الأقل.
                  </Alert>
                )}

                {/* Olympic-style podium for top 3 - Only show if we have 3 students with marks */}
                {showPodium && <Podium topThreeStudents={topThreeStudents} />}

                {/* All students table */}
                <RankingTable students={studentsWithMarks} />
              </>
            )}
          </>
        )}

        {/* Criteria Cards */}
        <CriteriaCards />
      </div>
    </div>
  );
};

export default RankingPage;
