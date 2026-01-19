import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  error?: string;
}

const monthsInArabic = [
  { value: "01", label: "يناير" },
  { value: "02", label: "فبراير" },
  { value: "03", label: "مارس" },
  { value: "04", label: "أبريل" },
  { value: "05", label: "مايو" },
  { value: "06", label: "يونيو" },
  { value: "07", label: "يوليو" },
  { value: "08", label: "أغسطس" },
  { value: "09", label: "سبتمبر" },
  { value: "10", label: "أكتوبر" },
  { value: "11", label: "نوفمبر" },
  { value: "12", label: "ديسمبر" },
];

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
}) => {
  const currentYear = new Date().getFullYear();
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Parse existing value
  React.useEffect(() => {
    if (value) {
      const [y, m, d] = value.split("-");
      setYear(y);
      setMonth(m);
      setDay(d);
    }
  }, [value]);

  const handleDateChange = (d: string, m: string, y: string) => {
    if (d && m && y) {
      const dateString = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      onChange(dateString);
    }
  };

  const handleDaySelect = (selectedDay: string) => {
    setDay(selectedDay);
    setShowDayPicker(false);
    handleDateChange(selectedDay, month, year);
  };

  const handleMonthSelect = (selectedMonth: string) => {
    setMonth(selectedMonth);
    setShowMonthPicker(false);
    handleDateChange(day, selectedMonth, year);
  };

  const handleYearSelect = (selectedYear: string) => {
    setYear(selectedYear);
    setShowYearPicker(false);
    handleDateChange(day, month, selectedYear);
  };

  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const years = Array.from({ length: 96 }, (_, i) =>
    (currentYear - 5 - i).toString()
  );

  const getMonthLabel = (monthValue: string) => {
    return (
      monthsInArabic.find((m) => m.value === monthValue)?.label || monthValue
    );
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
      )}

      <View style={styles.pickerRow}>
        {/* اليوم */}
        <TouchableOpacity
          style={[styles.picker, error && styles.pickerError]}
          onPress={() => {
            setShowDayPicker(!showDayPicker);
            setShowMonthPicker(false);
            setShowYearPicker(false);
          }}>
          <Text style={styles.pickerText}>{day || "اليوم"}</Text>
        </TouchableOpacity>

        {/* الشهر */}
        <TouchableOpacity
          style={[styles.picker, error && styles.pickerError]}
          onPress={() => {
            setShowMonthPicker(!showMonthPicker);
            setShowDayPicker(false);
            setShowYearPicker(false);
          }}>
          <Text style={styles.pickerText}>
            {month ? getMonthLabel(month) : "الشهر"}
          </Text>
        </TouchableOpacity>

        {/* السنة */}
        <TouchableOpacity
          style={[styles.picker, error && styles.pickerError]}
          onPress={() => {
            setShowYearPicker(!showYearPicker);
            setShowDayPicker(false);
            setShowMonthPicker(false);
          }}>
          <Text style={styles.pickerText}>{year || "السنة"}</Text>
        </TouchableOpacity>
      </View>

      {/* Day Picker */}
      {showDayPicker && (
        <ScrollView 
          style={styles.dropdownContainer}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}>
          {days.map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.dropdownItem,
                day === d && styles.dropdownItemSelected,
              ]}
              onPress={() => handleDaySelect(d)}>
              <Text
                style={[
                  styles.dropdownItemText,
                  day === d && styles.dropdownItemTextSelected,
                ]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Month Picker */}
      {showMonthPicker && (
        <ScrollView 
          style={styles.dropdownContainer}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}>
          {monthsInArabic.map((m) => (
            <TouchableOpacity
              key={m.value}
              style={[
                styles.dropdownItem,
                month === m.value && styles.dropdownItemSelected,
              ]}
              onPress={() => handleMonthSelect(m.value)}>
              <Text
                style={[
                  styles.dropdownItemText,
                  month === m.value && styles.dropdownItemTextSelected,
                ]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Year Picker */}
      {showYearPicker && (
        <ScrollView 
          style={styles.dropdownContainer}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}>
          {years.map((y) => (
            <TouchableOpacity
              key={y}
              style={[
                styles.dropdownItem,
                year === y && styles.dropdownItemSelected,
              ]}
              onPress={() => handleYearSelect(y)}>
              <Text
                style={[
                  styles.dropdownItemText,
                  year === y && styles.dropdownItemTextSelected,
                ]}>
                {y}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "right",
  },
  labelError: {
    color: "#EF4444",
  },
  pickerRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  picker: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    alignItems: "center",
  },
  pickerError: {
    borderColor: "#EF4444",
  },
  pickerText: {
    fontSize: 14,
    color: "#374151",
  },
  dropdownContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemSelected: {
    backgroundColor: "#ECFDF5",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "right",
  },
  dropdownItemTextSelected: {
    color: "#059669",
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
    textAlign: "right",
  },
});
