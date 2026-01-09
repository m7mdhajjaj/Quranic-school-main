/**
 * Report Filters Component
 * Handles month/year selection and group filtering
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import type { ReportFiltersProps, MonthOption } from "@/types/report.types";

// Get last 6 months
const getLast6Months = (): MonthOption[] => {
  const months: MonthOption[] = [];
  const today = new Date();

  for (let i = 0; i < 6; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = date.getMonth() + 1; // 1-12
    const year = date.getFullYear();

    const monthNames = [
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

    months.push({
      value: `${month}-${year}`,
      label: `${monthNames[month - 1]} ${year}`,
      month,
      year,
    });
  }

  return months;
};

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  userRole,
  groups = [],
  selectedGroupId,
  onGroupChange,
}) => {
  const monthOptions = getLast6Months();

  // Handle month-year change
  const handleMonthYearChange = (value: string) => {
    if (!value) {
      onMonthChange(null);
      onYearChange(null);
      return;
    }

    const [month, year] = value.split("-").map(Number);
    onMonthChange(month);
    onYearChange(year);
  };

  // Get current selected value
  const selectedValue =
    selectedMonth && selectedYear ? `${selectedMonth}-${selectedYear}` : "";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>🔍</Text>
        </View>
        <Text style={styles.headerText}>تصفية وبحث:</Text>
      </View>

      <View style={styles.filtersRow}>
        {/* Group filter for teachers */}
        {userRole === "teacher" && groups.length > 0 && (
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>الحلقة</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedGroupId}
                onValueChange={(itemValue) => onGroupChange?.(itemValue)}
                style={styles.picker}>
                {groups.map((group) => (
                  <Picker.Item
                    key={group._id}
                    label={`${group.name} (${group.totalStudents} طالب)`}
                    value={group._id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {/* Month/Year filter */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>الفترة الزمنية</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedValue}
              onValueChange={handleMonthYearChange}
              style={styles.picker}>
              <Picker.Item label="آخر 6 أشهر (الكل)" value="" />
              {monthOptions.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F0FDFA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#99F6E4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: "#14B8A6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 16,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  filtersRow: {
    gap: 12,
  },
  pickerContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    textAlign: "right",
  },
  pickerWrapper: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#5EEAD4",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
});
