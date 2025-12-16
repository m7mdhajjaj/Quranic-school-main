import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react-native";

interface MonthYearFilterProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const MONTHS = [
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

export const MonthYearFilter: React.FC<MonthYearFilterProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const isCurrentMonth =
    selectedMonth === currentMonth && selectedYear === currentYear;

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      onMonthChange(12);
      onYearChange(selectedYear - 1);
    } else {
      onMonthChange(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      onMonthChange(1);
      onYearChange(selectedYear + 1);
    } else {
      onMonthChange(selectedMonth + 1);
    }
  };

  const handleCurrentMonth = () => {
    onMonthChange(currentMonth);
    onYearChange(currentYear);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={handlePreviousMonth}
        activeOpacity={0.7}>
        <ChevronRight size={24} color="#10b981" />
      </TouchableOpacity>

      <View style={styles.centerContent}>
        <Text style={styles.monthYear}>
          {MONTHS[selectedMonth - 1]} {selectedYear}
        </Text>
        {!isCurrentMonth && (
          <TouchableOpacity
            style={styles.currentButton}
            onPress={handleCurrentMonth}
            activeOpacity={0.7}>
            <RotateCcw size={16} color="#10b981" />
            <Text style={styles.currentButtonText}>الشهر الحالي</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.navButton}
        onPress={handleNextMonth}
        activeOpacity={0.7}>
        <ChevronLeft size={24} color="#10b981" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0fdf4",
  },
  centerContent: {
    alignItems: "center",
    gap: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  currentButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f0fdf4",
  },
  currentButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
});
