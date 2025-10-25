/**
 * Arrangement Page - Modular Version
 * Shows student ranking based on monthly averages
 */

import { useEffect, useState, useMemo } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useArrangementSocket } from "../../Socket";
import { useRankingData } from "./hooks/useRankingData";
import {
  generateAvailableYears,
  getCurrentPeriod,
} from "./utils/arrangementHelpers";
import type { User } from "./types/arrangement";
import { LoadingSpinner } from "../../components/shared/Feedback/LoadingSpinner";
import { Alert } from "../../components/shared/UI/Alert";
import { SocketIndicator } from "./components/SocketIndicator";
import { FilterPanel } from "./components/FilterPanel";
import { PageHeader } from "./components/PageHeader";
import { Podium } from "./components/Podium";
import { RankingTable } from "./components/RankingTable";
import { EmptyState } from "./components/EmptyState";
import { CriteriaCards } from "./components/CriteriaCards";

const ArrangementPage = () => {
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

  const { isConnected, socketId, lastUpdate } = useArrangementSocket();

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
  const { students, loading, error, refetch } = useRankingData(
    selectedMonth,
    selectedYear,
    selectedGroup,
    userAuth.user
  );

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

  // Get top three students
  const topThreeStudents = students.slice(0, 3);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4"
      dir="rtl">
      <div className="container mx-auto">
        {/* Socket Connection Indicator */}
        <SocketIndicator
          isConnected={isConnected}
          socketId={socketId}
          lastUpdate={lastUpdate}
        />

        {/* Page Header */}
        <PageHeader
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          studentsCount={students.length}
        />

        {/* Filter Panel */}
        <FilterPanel
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedGroup={selectedGroup}
          availableYears={availableYears}
          user={userAuth.user}
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
            {/* Show empty state if no students */}
            {students.length === 0 ? (
              <EmptyState
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            ) : (
              <>
                {/* Olympic-style podium for top 3 */}
                <Podium topThreeStudents={topThreeStudents} />

                {/* All students table */}
                <RankingTable students={students} />
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

export default ArrangementPage;
