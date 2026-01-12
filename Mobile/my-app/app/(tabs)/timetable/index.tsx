// ============================================================================
// TimetablePage - صفحة جدول الحصص الشهري للموبايل
// ============================================================================

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Dimensions,
} from "react-native";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
  X,
  BookOpen,
  RotateCcw,
} from "lucide-react-native";
import { useAuth } from "@/Context/AuthContext";
import { getMonthlyPlan, Timetable } from "@/Api/TimeTable.Api";
import WeeklyView from "./WeeklyView"; // تأكد من مسار الاستيراد الصحيح لمكون العرض الأسبوعي

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// Types
// ============================================================================

interface Session {
  _id: string;
  sessionDate: string;
  day?: string;
  startHour: string;
  endHour: string;
  note?: string;
  groupName?: string;
  description?: string;
  sessionType?: "hifz" | "murajaah" | "both";
  sectionDetails?: {
    surahName?: string;
    memorizationSection?: string;
    reviewSection?: string;
    marksStatus?: string;
  };
  sectionInfo?: {
    memorizationSection?: string;
    reviewSection?: string;
    marksStatus?: string;
  };
}

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const WEEK_DAYS = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];
const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

// ============================================================================
// Helper Functions
// ============================================================================

const mapTimetableToSession = (timetable: Timetable): Session => {
  const groupInfo =
    typeof timetable.groupId === "object" && timetable.groupId
      ? timetable.groupId
      : null;

  return {
    _id: timetable._id || "",
    sessionDate: timetable.sessionDate,
    day: timetable.day,
    startHour: timetable.startHour,
    endHour: timetable.endHour,
    note: timetable.note,
    groupName: groupInfo?.name || timetable.note,
    description: timetable.description,
    sessionType: timetable.sessionType,
    sectionInfo: timetable.sectionInfo,
  };
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const formatDateForComparison = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ============================================================================
// Component
// ============================================================================

const TimetablePage = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // ============================================
  // Data Fetching
  // ============================================

  const fetchMonthlyData = useCallback(async () => {
    try {
      setError(null);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const response = await getMonthlyPlan(month, year);

      if (response.success && response.data) {
        const mappedSessions = response.data.map(mapTimetableToSession);
        setSessions(mappedSessions);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error("Error fetching timetable:", err);
      setError("حدث خطأ في تحميل الجدول");
      setSessions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentDate]);

  useEffect(() => {
    setLoading(true);
    fetchMonthlyData();
  }, [fetchMonthlyData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMonthlyData();
  }, [fetchMonthlyData]);

  // ============================================
  // Calendar Navigation
  // ============================================

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // ============================================
  // Calendar Days Generation
  // ============================================

  const calendarDays = useMemo((): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Get the day index (Saturday = 0 for Arabic calendar)
    let startDayIndex = firstDayOfMonth.getDay() + 1;
    if (startDayIndex === 7) startDayIndex = 0;

    const days: CalendarDay[] = [];

    // Previous month days
    for (let i = 0; i < startDayIndex; i++) {
      const date = new Date(year, month, -(startDayIndex - i - 1));
      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        day: i,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
      });
    }

    // Next month days (fill to complete grid)
    const remainingSlots = 42 - days.length;
    if (remainingSlots > 0 && remainingSlots < 7) {
      for (let i = 1; i <= remainingSlots; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
          date,
          day: i,
          isCurrentMonth: false,
          isToday: isSameDay(date, today),
        });
      }
    }

    return days;
  }, [currentDate]);

  // ============================================
  // Get Sessions for a Day
  // ============================================

  const getSessionsForDay = useCallback(
    (date: Date): Session[] => {
      const dateStr = formatDateForComparison(date);
      return sessions.filter((session) => {
        if (!session.sessionDate) return false;
        const sessionDateStr = session.sessionDate.split("T")[0];
        return sessionDateStr === dateStr;
      });
    },
    [sessions]
  );

  const selectedDaySessions = useMemo(() => {
    if (!selectedDate) return [];
    return getSessionsForDay(selectedDate);
  }, [selectedDate, getSessionsForDay]);

  // ============================================
  // Modal Handlers
  // ============================================

  const openDayModal = (date: Date) => {
    setSelectedDate(date);
    setModalVisible(true);
  };

  const closeDayModal = () => {
    setModalVisible(false);
    setSelectedDate(null);
  };

  // ============================================
  // Render Session Type Badge
  // ============================================

  const getSessionTypeStyle = (type?: string) => {
    switch (type) {
      case "hifz":
        return {
          bg: "#dbeafe",
          text: "#1d4ed8",
          border: "#bfdbfe",
          label: "حفظ",
        };
      case "murajaah":
        return {
          bg: "#fef3c7",
          text: "#b45309",
          border: "#fde68a",
          label: "مراجعة",
        };
      default:
        return {
          bg: "#e9d5ff",
          text: "#7c3aed",
          border: "#d8b4fe",
          label: "شامل",
        };
    }
  };

  // ============================================
  // Render
  // ============================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>جاري تحميل الجدول...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10b981"]}
            tintColor="#10b981"
          />
        }>
        {/* Weekly View */}
        <WeeklyView sessions={sessions} currentDate={currentDate} />

        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View style={styles.headerIconContainer}>
            <Calendar size={28} color="#ffffff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.pageTitle}>جدول الحصص الشهري</Text>
            <Text style={styles.pageSubtitle}>عرض مواعيد حلقتك</Text>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <View style={styles.calendarTitleSection}>
            <View style={styles.calendarIconContainer}>
              <Calendar size={20} color="#10b981" />
              {loading && <View style={styles.loadingDot} />}
            </View>
            <View>
              <Text style={styles.calendarTitle}>
                {ARABIC_MONTHS[currentDate.getMonth()]}{" "}
                {currentDate.getFullYear()}
              </Text>
              <Text style={styles.calendarSubtitle}>عرض الخطة الشهرية</Text>
            </View>
          </View>

          <View style={styles.navigationButtons}>
            <TouchableOpacity style={styles.navButton} onPress={prevMonth}>
              <ChevronRight size={20} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
              <Text style={styles.todayButtonText}>اليوم</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={nextMonth}>
              <ChevronLeft size={20} color="#6b7280" />
            </TouchableOpacity>
            <View style={styles.navDivider} />
          </View>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {/* Week Days Header */}
          <View style={styles.weekDaysHeader}>
            {WEEK_DAYS.map((day) => (
              <View key={day} style={styles.weekDayCell}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Days */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((dayInfo, index) => {
              const daySessions = getSessionsForDay(dayInfo.date);
              const hasSession = daySessions.length > 0;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    !dayInfo.isCurrentMonth && styles.dayCellInactive,
                    dayInfo.isToday && styles.dayCellToday,
                    hasSession && styles.dayCellWithSession,
                  ]}
                  onPress={() => openDayModal(dayInfo.date)}
                  activeOpacity={0.7}>
                  {/* Day Number */}
                  <View style={styles.dayHeader}>
                    <View
                      style={[
                        styles.dayNumber,
                        dayInfo.isToday && styles.dayNumberToday,
                      ]}>
                      <Text
                        style={[
                          styles.dayNumberText,
                          !dayInfo.isCurrentMonth && styles.dayNumberInactive,
                          dayInfo.isToday && styles.dayNumberTextToday,
                        ]}>
                        {dayInfo.day}
                      </Text>
                    </View>
                    {hasSession && dayInfo.isCurrentMonth && (
                      <View style={styles.sessionCountBadge}>
                        <Text style={styles.sessionCountText}>
                          {daySessions.length}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Session Preview */}
                  {hasSession && dayInfo.isCurrentMonth && (
                    <View style={styles.sessionPreviewContainer}>
                      {daySessions.slice(0, 2).map((session) => {
                        const typeStyle = getSessionTypeStyle(
                          session.sessionType
                        );
                        return (
                          <View
                            key={session._id}
                            style={[
                              styles.sessionPreview,
                              {
                                backgroundColor: typeStyle.bg,
                                borderColor: typeStyle.border,
                              },
                            ]}>
                            <Text
                              style={[
                                styles.sessionPreviewText,
                                { color: typeStyle.text },
                              ]}
                              numberOfLines={1}>
                              {session.groupName || session.note || "حلقة"}
                            </Text>
                          </View>
                        );
                      })}
                      {daySessions.length > 2 && (
                        <Text style={styles.moreSessionsText}>
                          +{daySessions.length - 2}
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Empty State */}
        {sessions.length === 0 && !loading && !error && (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>لا توجد مواعيد</Text>
            <Text style={styles.emptyStateText}>
              لم يتم تحديد مواعيد لحلقتك بعد. يرجى التواصل مع معلمك.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Day Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDayModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate &&
                  `${WEEK_DAYS[(selectedDate.getDay() + 1) % 7]} ${selectedDate.getDate()} ${ARABIC_MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeDayModal}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody}>
              {selectedDaySessions.length > 0 ? (
                selectedDaySessions.map((session) => {
                  const typeStyle = getSessionTypeStyle(session.sessionType);
                  return (
                    <View
                      key={session._id}
                      style={[
                        styles.sessionCard,
                        { borderLeftColor: typeStyle.text },
                      ]}>
                      {/* Session Header */}
                      <View style={styles.sessionHeader}>
                        <View>
                          <Text style={styles.sessionTitle}>
                            {session.groupName || session.note || "حلقة"}
                          </Text>
                          <View style={styles.sessionTime}>
                            <Clock size={14} color="#10b981" />
                            <Text style={styles.sessionTimeText}>
                              {session.startHour} - {session.endHour}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={[
                            styles.typeBadge,
                            {
                              backgroundColor: typeStyle.bg,
                              borderColor: typeStyle.border,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.typeBadgeText,
                              { color: typeStyle.text },
                            ]}>
                            {typeStyle.label}
                          </Text>
                        </View>
                      </View>

                      {/* Section Details */}
                      {(session.sectionDetails || session.sectionInfo) && (
                        <View style={styles.sectionDetails}>
                          {(session.sectionDetails?.memorizationSection ||
                            session.sectionInfo?.memorizationSection) && (
                            <View style={styles.sectionItem}>
                              <BookOpen size={14} color="#1d4ed8" />
                              <Text style={styles.sectionLabel}>حفظ:</Text>
                              <Text style={styles.sectionValue}>
                                {session.sectionDetails?.memorizationSection ||
                                  session.sectionInfo?.memorizationSection}
                              </Text>
                            </View>
                          )}
                          {(session.sectionDetails?.reviewSection ||
                            session.sectionInfo?.reviewSection) && (
                            <View style={styles.sectionItem}>
                              <RotateCcw size={14} color="#b45309" />
                              <Text
                                style={[
                                  styles.sectionLabel,
                                  { color: "#b45309" },
                                ]}>
                                مراجعة:
                              </Text>
                              <Text style={styles.sectionValue}>
                                {session.sectionDetails?.reviewSection ||
                                  session.sectionInfo?.reviewSection}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                      {/* Description */}
                      {session.description && (
                        <Text style={styles.sessionDescription}>
                          {session.description}
                        </Text>
                      )}
                    </View>
                  );
                })
              ) : (
                <View style={styles.modalEmpty}>
                  <Calendar size={40} color="#d1d5db" />
                  <Text style={styles.modalEmptyText}>
                    لا توجد مواعيد في هذا اليوم
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
    fontFamily: "System",
  },

  // Page Header
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    gap: 16,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "right",
  },
  pageSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 4,
    textAlign: "right",
  },

  // Error
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: "#fee2e2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "600",
  },

  // Calendar Header
  calendarHeader: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  calendarIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "right",
  },
  calendarSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    textAlign: "right",
  },
  navigationButtons: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 4,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  refreshing: {
    opacity: 0.5,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  navDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#d1d5db",
    marginHorizontal: 4,
  },

  // Calendar Container
  calendarContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  weekDaysHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  weekDayCell: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: (SCREEN_WIDTH - 32) / 7,
    minHeight: 80,
    padding: 4,
    borderWidth: 0.5,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  dayCellInactive: {
    backgroundColor: "#f9fafb",
    opacity: 0.6,
  },
  dayCellToday: {
    backgroundColor: "#ecfdf5",
  },
  dayCellWithSession: {
    backgroundColor: "#fefce8",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  dayNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  dayNumberToday: {
    backgroundColor: "#10b981",
  },
  dayNumberText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  dayNumberInactive: {
    color: "#9ca3af",
  },
  dayNumberTextToday: {
    color: "#ffffff",
  },
  sessionCountBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sessionCountText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#10b981",
  },
  sessionPreviewContainer: {
    gap: 2,
  },
  sessionPreview: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  sessionPreviewText: {
    fontSize: 9,
    fontWeight: "600",
  },
  moreSessionsText: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "right",
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    padding: 20,
  },
  sessionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "right",
  },
  sessionTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sessionTimeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionDetails: {
    marginTop: 12,
    gap: 8,
  },
  sectionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1d4ed8",
  },
  sectionValue: {
    fontSize: 12,
    color: "#374151",
    flex: 1,
    textAlign: "right",
  },
  sessionDescription: {
    marginTop: 12,
    fontSize: 13,
    color: "#6b7280",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    textAlign: "right",
  },
  modalEmpty: {
    alignItems: "center",
    paddingVertical: 40,
  },
  modalEmptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#9ca3af",
  },
});

export default TimetablePage;
