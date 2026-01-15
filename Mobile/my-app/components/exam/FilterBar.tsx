import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { Search, X, Filter, ChevronDown, Plus } from "lucide-react-native";
import { ExamFilters } from "@/types/exam.types";

interface FilterBarProps {
  filters: ExamFilters;
  onFiltersChange: (filters: Partial<ExamFilters>) => void;
  showMarksFilter?: boolean;
  showAddButton?: boolean;
  onAddExam?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  showMarksFilter = false,
  showAddButton = false,
  onAddExam,
}) => {
  const [showAllFilters, setShowAllFilters] = useState(false);

  const hasActiveFilters =
    filters.query ||
    filters.dateFilter ||
    filters.typeFilter ||
    filters.marksFilter;

  const clearAllFilters = () => {
    onFiltersChange({
      query: "",
      dateFilter: "",
      typeFilter: "",
      marksFilter: "",
    });
  };

  return (
    <View style={styles.container}>
      {/* شريط البحث وزر الإضافة */}
      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchContainer,
            showAddButton && styles.searchContainerWithButton,
          ]}>
          <Search size={20} color="#9ca3af" />
          <TextInput
            value={filters.query}
            onChangeText={(text) => onFiltersChange({ query: text })}
            placeholder="ابحث عن امتحان..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
          />
          {filters.query ? (
            <TouchableOpacity onPress={() => onFiltersChange({ query: "" })}>
              <X size={20} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* زر إضافة امتحان */}
        {showAddButton && onAddExam && (
          <TouchableOpacity style={styles.addButton} onPress={onAddExam}>
            <Plus size={22} color="white" />
            <Text style={styles.addButtonText}>إضافة</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* زر الفلاتر */}
      <View style={styles.filterHeader}>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowAllFilters(!showAllFilters)}>
          <Filter size={18} color="#059669" />
          <Text style={styles.filterToggleText}>الفلاتر</Text>
          <ChevronDown
            size={18}
            color="#059669"
            style={{
              transform: [{ rotate: showAllFilters ? "180deg" : "0deg" }],
            }}
          />
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity
            onPress={clearAllFilters}
            style={styles.clearButton}>
            <X size={14} color="#ef4444" />
            <Text style={styles.clearButtonText}>مسح الكل</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* الفلاتر */}
      {showAllFilters && (
        <View style={styles.filtersSection}>
          {/* فلتر التاريخ */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>التاريخ</Text>
            <View style={styles.filterChips}>
              <TouchableOpacity
                onPress={() =>
                  onFiltersChange({
                    dateFilter:
                      filters.dateFilter === "upcoming" ? "" : "upcoming",
                  })
                }
                style={[
                  styles.chip,
                  filters.dateFilter === "upcoming" && styles.chipActive,
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    filters.dateFilter === "upcoming" && styles.chipTextActive,
                  ]}>
                  القادمة
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  onFiltersChange({
                    dateFilter: filters.dateFilter === "past" ? "" : "past",
                  })
                }
                style={[
                  styles.chip,
                  filters.dateFilter === "past" && styles.chipActive,
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    filters.dateFilter === "past" && styles.chipTextActive,
                  ]}>
                  السابقة
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* فلتر النوع */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>النوع</Text>
            <View style={styles.filterChips}>
              <TouchableOpacity
                onPress={() =>
                  onFiltersChange({
                    typeFilter: filters.typeFilter === "تحريري" ? "" : "تحريري",
                  })
                }
                style={[
                  styles.chip,
                  filters.typeFilter === "تحريري" && styles.chipWritten,
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    filters.typeFilter === "تحريري" && styles.chipTextActive,
                  ]}>
                  تحريري
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  onFiltersChange({
                    typeFilter: filters.typeFilter === "شفهي" ? "" : "شفهي",
                  })
                }
                style={[
                  styles.chip,
                  filters.typeFilter === "شفهي" && styles.chipOral,
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    filters.typeFilter === "شفهي" && styles.chipTextActive,
                  ]}>
                  شفهي
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* فلتر العلامات (للمعلمين فقط) */}
          {showMarksFilter && (
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>العلامات</Text>
              <View style={styles.filterChips}>
                <TouchableOpacity
                  onPress={() =>
                    onFiltersChange({
                      marksFilter:
                        filters.marksFilter === "entered" ? "" : "entered",
                    })
                  }
                  style={[
                    styles.chip,
                    filters.marksFilter === "entered" && styles.chipEntered,
                  ]}>
                  <Text
                    style={[
                      styles.chipText,
                      filters.marksFilter === "entered" &&
                        styles.chipTextActive,
                    ]}>
                    تم الإدخال
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    onFiltersChange({
                      marksFilter:
                        filters.marksFilter === "not-entered"
                          ? ""
                          : "not-entered",
                    })
                  }
                  style={[
                    styles.chip,
                    filters.marksFilter === "not-entered" &&
                      styles.chipNotEntered,
                  ]}>
                  <Text
                    style={[
                      styles.chipText,
                      filters.marksFilter === "not-entered" &&
                        styles.chipTextActive,
                    ]}>
                    لم يُدخل
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  // Search Row
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  // Search
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchContainerWithButton: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
    textAlign: "right",
  },
  // Add Button
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  // Filter Header
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fef2f2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  clearButtonText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "500",
  },
  // Filters Section
  filtersSection: {
    marginTop: 12,
    gap: 12,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chipActive: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  chipWritten: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  chipOral: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
  },
  chipEntered: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  chipNotEntered: {
    backgroundColor: "#f59e0b",
    borderColor: "#f59e0b",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  chipTextActive: {
    color: "white",
  },
});
