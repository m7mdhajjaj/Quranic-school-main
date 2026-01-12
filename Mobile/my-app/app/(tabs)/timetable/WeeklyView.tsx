// WeeklyView.tsx - عرض الجدول الأسبوعي للموبايل
import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Calendar } from "lucide-react-native";

const WEEK_DAYS = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];

interface Session {
  _id: string;
  sessionDate: string;
  startHour: string;
  endHour: string;
  note?: string;
  groupName?: string;
  sessionType?: "hifz" | "murajaah" | "both";
}

interface WeeklyViewProps {
  sessions: Session[];
  currentDate: Date;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({ sessions, currentDate }) => {
  // حساب بداية الأسبوع (السبت) - في JavaScript: السبت = 6
  const weekStart = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay(); // 0=الأحد, 6=السبت
    const diff = day === 6 ? 0 : day + 1; // المسافة من السبت
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate]);

  // توليد تواريخ الأسبوع
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });
  }, [weekStart]);

  // تجميع الحصص حسب اليوم
  const sessionsByDay = useMemo(() => {
    const map: Record<string, Session[]> = {};
    weekDates.forEach((date) => {
      const key = date.toISOString().split("T")[0];
      map[key] = [];
    });
    sessions.forEach((s) => {
      const key = s.sessionDate.split("T")[0];
      if (map[key]) map[key].push(s);
    });
    return map;
  }, [sessions, weekDates]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Calendar size={22} color="#10b981" />
        <Text style={styles.headerText}>جدول الأسبوع الحالي</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daysRow}>
        {weekDates.map((date, idx) => {
          const key = date.toISOString().split("T")[0];
          const daySessions = sessionsByDay[key] || [];
          const isToday = new Date().toISOString().split("T")[0] === key;
          return (
            <View key={key} style={[styles.dayCol, isToday && styles.todayCol]}>
              <Text style={[styles.dayName, isToday && styles.todayText]}>
                {WEEK_DAYS[idx]}
              </Text>
              <Text style={[styles.dayDate, isToday && styles.todayDate]}>
                {date.getDate()} / {date.getMonth() + 1}
              </Text>
              {daySessions.length === 0 ? (
                <View style={styles.noSessionContainer}>
                  <Text style={styles.noSessionIcon}>📅</Text>
                  <Text style={styles.noSession}>لا يوجد مواعيد</Text>
                </View>
              ) : (
                daySessions.map((s: Session, i: number) => (
                  <View
                    key={i}
                    style={[
                      styles.sessionCard,
                      s.sessionType === "hifz"
                        ? styles.hifz
                        : s.sessionType === "murajaah"
                          ? styles.murajaah
                          : styles.both,
                    ]}>
                    <Text style={styles.sessionTitle}>
                      {s.groupName || s.note || "حلقة"}
                    </Text>
                    <Text style={styles.sessionTime}>
                      {s.startHour} - {s.endHour}
                    </Text>
                    <Text style={styles.sessionTypeText}>
                      {s.sessionType === "hifz"
                        ? "📖 حفظ"
                        : s.sessionType === "murajaah"
                          ? "🔄 مراجعة"
                          : "📚 شامل"}
                    </Text>
                  </View>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#10b981",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10b981",
  },
  daysRow: {
    flexDirection: "row",
  },
  dayCol: {
    minWidth: 150,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginRight: 12,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minHeight: 180,
  },
  todayCol: {
    borderColor: "#10b981",
    borderWidth: 2,
    backgroundColor: "#ecfdf5",
  },
  dayName: {
    fontWeight: "700",
    color: "#1f2937",
    fontSize: 16,
    marginBottom: 4,
  },
  todayText: {
    color: "#10b981",
  },
  dayDate: {
    color: "#6b7280",
    fontSize: 13,
    marginBottom: 14,
    fontWeight: "600",
  },
  todayDate: {
    color: "#059669",
    fontWeight: "700",
  },
  noSessionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    width: "100%",
    minHeight: 100,
  },
  noSessionIcon: {
    fontSize: 32,
    marginBottom: 8,
    opacity: 0.5,
  },
  noSession: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  sessionCard: {
    width: "100%",
    marginTop: 10,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  hifz: {
    backgroundColor: "#dbeafe",
    borderColor: "#3b82f6",
  },
  murajaah: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
  },
  both: {
    backgroundColor: "#e9d5ff",
    borderColor: "#a855f7",
  },
  sessionTitle: {
    fontWeight: "700",
    color: "#1e293b",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 6,
  },
  sessionTime: {
    color: "#10b981",
    fontSize: 13,
    marginVertical: 4,
    fontWeight: "700",
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sessionTypeText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    marginTop: 4,
  },
});

export default WeeklyView;
