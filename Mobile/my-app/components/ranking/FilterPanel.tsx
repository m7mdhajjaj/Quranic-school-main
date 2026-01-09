/**
 * Filter Panel Component
 * Handles year, month, and group selection
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import type { FilterPanelProps } from "@/types/ranking.types";
import { getMonthName } from "@/utils/rankingHelpers";

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedYear,
  selectedMonth,
  selectedGroup,
  availableYears,
  user,
  teacherGroups,
  onYearChange,
  onMonthChange,
  onGroupChange,
}) => {
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1),
  }));

  // Debug log
  console.log("FilterPanel Debug:", {
    userRole: user?.role,
    teacherGroups: teacherGroups,
    teacherGroupsLength: teacherGroups?.length,
    selectedGroup: selectedGroup,
  });

  return (
    <View style={styles.container}>
      {/* Year selector */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>السنة</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedYear}
            onValueChange={(itemValue) => onYearChange(itemValue)}
            style={styles.picker}>
            {availableYears.map((year) => (
              <Picker.Item key={year} label={year.toString()} value={year} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Month selector */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>الشهر</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue) => onMonthChange(itemValue)}
            style={styles.picker}>
            {monthOptions.map((month) => (
              <Picker.Item
                key={month.value}
                label={month.label}
                value={month.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Group selector for teachers only */}
      {user?.role === "teacher" &&
        teacherGroups &&
        teacherGroups.length > 0 && (
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>الحلقة</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedGroup}
                onValueChange={(itemValue) => onGroupChange(itemValue)}
                style={styles.picker}>
                {teacherGroups.map((group) => (
                  <Picker.Item key={group} label={group} value={group} />
                ))}
              </Picker>
            </View>
          </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  pickerContainer: {
    minWidth: 120,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#10B981",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  groupDisplay: {
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#34D399",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  groupText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#047857",
    textAlign: "center",
  },
});
