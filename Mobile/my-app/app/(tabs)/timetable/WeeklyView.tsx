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

// props: sessions: Array<{ sessionDate, startHour, endHour, groupName, note, sessionType }>, currentDate: Date
const WeeklyView = ({ sessions, currentDate }) => {
  // حساب بداية الأسبوع (السبت)
  const weekStart = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay());
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
    const map = {};
    weekDates.forEach((date, i) => {
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
          return (
            <View key={key} style={styles.dayCol}>
              <Text style={styles.dayName}>{WEEK_DAYS[idx]}</Text>
              <Text style={styles.dayDate}>
                {date.getDate()} / {date.getMonth() + 1}
              </Text>
              {daySessions.length === 0 ? (
                <Text style={styles.noSession}>لا يوجد</Text>
              ) : (
                daySessions.map((s, i) => (
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
                    <Text style={styles.sessionType}>
                      {s.sessionType === "hifz"
                        ? "حفظ"
                        : s.sessionType === "murajaah"
                          ? "مراجعة"
                          : "شامل"}
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
  container: { marginBottom: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  headerText: { fontSize: 16, fontWeight: "700", color: "#10b981" },
  daysRow: { flexDirection: "row" },
  dayCol: {
    minWidth: 120,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 8,
    padding: 10,
    alignItems: "center",
    elevation: 2,
  },
  dayName: { fontWeight: "700", color: "#374151", fontSize: 14 },
  dayDate: { color: "#6b7280", fontSize: 12, marginBottom: 6 },
  noSession: { color: "#9ca3af", fontSize: 12, marginTop: 12 },
  sessionCard: {
    width: "100%",
    marginTop: 8,
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  hifz: { backgroundColor: "#dbeafe", borderColor: "#60a5fa" },
  murajaah: { backgroundColor: "#fef3c7", borderColor: "#fbbf24" },
  both: { backgroundColor: "#e9d5ff", borderColor: "#a78bfa" },
  sessionTitle: { fontWeight: "700", color: "#1e293b", fontSize: 13 },
  sessionTime: { color: "#10b981", fontSize: 12, marginVertical: 2 },
  sessionType: { fontSize: 11, color: "#6b7280" },
});

export default WeeklyView;
