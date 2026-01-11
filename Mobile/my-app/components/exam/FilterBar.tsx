import React from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { Search, Filter } from "lucide-react-native";
import { ExamFilters } from "@/types/exam.types";

interface FilterBarProps {
  filters: ExamFilters;
  onFiltersChange: (filters: Partial<ExamFilters>) => void;
  showMarksFilter?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  showMarksFilter = false,
}) => {
  return (
    <View className="mb-4">
      {/* شريط البحث */}
      <View className="bg-white rounded-xl shadow-sm border border-gray-200 flex-row items-center px-4 py-3 mb-3">
        <Search size={20} color="#9ca3af" />
        <TextInput
          value={filters.query}
          onChangeText={(text) => onFiltersChange({ query: text })}
          placeholder="ابحث عن امتحان أو مادة..."
          placeholderTextColor="#9ca3af"
          className="flex-1 mr-3 text-gray-800 text-right"
        />
      </View>

      {/* الفلاتر */}
      <View className="flex-row gap-2 flex-wrap">
        {/* فلتر التاريخ */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() =>
              onFiltersChange({
                dateFilter: filters.dateFilter === "" ? "upcoming" : "",
              })
            }
            className={`px-4 py-2 rounded-full ${
              filters.dateFilter === "upcoming"
                ? "bg-emerald-500"
                : "bg-gray-200"
            }`}>
            <Text
              className={`text-sm font-semibold ${
                filters.dateFilter === "upcoming"
                  ? "text-white"
                  : "text-gray-700"
              }`}>
              القادمة
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              onFiltersChange({
                dateFilter: filters.dateFilter === "past" ? "" : "past",
              })
            }
            className={`px-4 py-2 rounded-full ${
              filters.dateFilter === "past" ? "bg-emerald-500" : "bg-gray-200"
            }`}>
            <Text
              className={`text-sm font-semibold ${
                filters.dateFilter === "past" ? "text-white" : "text-gray-700"
              }`}>
              السابقة
            </Text>
          </TouchableOpacity>
        </View>

        {/* فلتر النوع */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() =>
              onFiltersChange({
                typeFilter: filters.typeFilter === "تحريري" ? "" : "تحريري",
              })
            }
            className={`px-4 py-2 rounded-full ${
              filters.typeFilter === "تحريري" ? "bg-blue-500" : "bg-gray-200"
            }`}>
            <Text
              className={`text-sm font-semibold ${
                filters.typeFilter === "تحريري" ? "text-white" : "text-gray-700"
              }`}>
              تحريري
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              onFiltersChange({
                typeFilter: filters.typeFilter === "شفهي" ? "" : "شفهي",
              })
            }
            className={`px-4 py-2 rounded-full ${
              filters.typeFilter === "شفهي" ? "bg-purple-500" : "bg-gray-200"
            }`}>
            <Text
              className={`text-sm font-semibold ${
                filters.typeFilter === "شفهي" ? "text-white" : "text-gray-700"
              }`}>
              شفهي
            </Text>
          </TouchableOpacity>
        </View>

        {/* فلتر العلامات (للمعلمين فقط) */}
        {showMarksFilter && (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() =>
                onFiltersChange({
                  marksFilter:
                    filters.marksFilter === "entered" ? "" : "entered",
                })
              }
              className={`px-4 py-2 rounded-full ${
                filters.marksFilter === "entered"
                  ? "bg-green-500"
                  : "bg-gray-200"
              }`}>
              <Text
                className={`text-sm font-semibold ${
                  filters.marksFilter === "entered"
                    ? "text-white"
                    : "text-gray-700"
                }`}>
                تم الإدخال
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                onFiltersChange({
                  marksFilter:
                    filters.marksFilter === "not-entered" ? "" : "not-entered",
                })
              }
              className={`px-4 py-2 rounded-full ${
                filters.marksFilter === "not-entered"
                  ? "bg-yellow-500"
                  : "bg-gray-200"
              }`}>
              <Text
                className={`text-sm font-semibold ${
                  filters.marksFilter === "not-entered"
                    ? "text-white"
                    : "text-gray-700"
                }`}>
                لم يُدخل
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};
