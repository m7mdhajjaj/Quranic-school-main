import React from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { StudentWithWarnings, WarningType } from "@/types/warning.types";

interface StudentsListProps {
  students: StudentWithWarnings[];
  onAddWarning: (student: StudentWithWarnings) => void;
  onDeleteWarning: (student: StudentWithWarnings, type: WarningType) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  students,
  onAddWarning,
  onDeleteWarning,
}) => {
  const getFullName = (student: StudentWithWarnings) => {
    return `${student.firstName} ${student.middleName || ""} ${
      student.lastName
    }`.trim();
  };

  const getWarningColor = (count: number) => {
    if (count === 0) return "bg-gray-100 border-2 border-gray-300";
    if (count === 1) return "bg-yellow-400 border-2 border-yellow-600";
    if (count === 2) return "bg-orange-500 border-2 border-orange-700";
    return "bg-red-600 border-2 border-red-800";
  };

  const getWarningTextColor = (count: number) => {
    if (count === 0) return "text-gray-500";
    if (count >= 1) return "text-white";
    return "text-white";
  };

  const handleWarningPress = (
    student: StudentWithWarnings,
    type: WarningType
  ) => {
    const count = student.warnings[type];

    if (count === 0) {
      // لا يوجد إنذار - لا نفعل شيء
      return;
    }

    Alert.alert(
      "حذف إنذار",
      `هل تريد حذف إنذار ${type} من ${getFullName(student)}؟`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: () => onDeleteWarning(student, type),
        },
      ]
    );
  };

  const renderStudent = ({ item }: { item: StudentWithWarnings }) => {
    // حماية من البيانات المفقودة
    const warnings = item.warnings || {
      warning: 0,
      first: 0,
      second: 0,
      third: 0,
      total: 0,
      details: [],
    };

    const hasWarnings = warnings.total > 0;

    return (
      <View className="bg-white rounded-2xl p-5 mb-4 shadow-lg border-2 border-gray-200">
        {/* اسم الطالب */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800">
              {getFullName(item)}
            </Text>
            {hasWarnings && (
              <View className="bg-red-50 rounded-full px-3 py-1 mt-2 self-start">
                <Text className="text-red-700 font-bold text-sm">
                  ⚠️ {warnings.total} إنذار
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => onAddWarning(item)}
            className="bg-red-600 rounded-xl px-5 py-3 shadow-md"
            style={{ elevation: 4 }}>
            <Text className="text-white font-bold text-base">+ إنذار</Text>
          </TouchableOpacity>
        </View>

        {/* أنواع الإنذارات */}
        <View className="flex-row flex-wrap gap-2">
          {/* تنبيه */}
          <TouchableOpacity
            onPress={() => handleWarningPress(item, "warning")}
            disabled={warnings.warning === 0}
            activeOpacity={0.7}
            className="flex-1 min-w-[45%]">
            <View
              className={`${getWarningColor(
                warnings.warning
              )} rounded-xl p-4 items-center shadow-sm`}
              style={{ elevation: warnings.warning > 0 ? 3 : 0 }}>
              <Text
                className={`text-xs mb-2 font-bold ${getWarningTextColor(warnings.warning)}`}>
                تنبيه
              </Text>
              <Text
                className={`text-3xl font-bold ${getWarningTextColor(warnings.warning)}`}>
                {warnings.warning}
              </Text>
            </View>
          </TouchableOpacity>

          {/* إنذار أول */}
          <TouchableOpacity
            onPress={() => handleWarningPress(item, "first")}
            disabled={warnings.first === 0}
            activeOpacity={0.7}
            className="flex-1 min-w-[45%]">
            <View
              className={`${getWarningColor(
                warnings.first
              )} rounded-xl p-4 items-center shadow-sm`}
              style={{ elevation: warnings.first > 0 ? 3 : 0 }}>
              <Text
                className={`text-xs mb-2 font-bold ${getWarningTextColor(warnings.first)}`}>
                إنذار أول
              </Text>
              <Text
                className={`text-3xl font-bold ${getWarningTextColor(warnings.first)}`}>
                {warnings.first}
              </Text>
            </View>
          </TouchableOpacity>

          {/* إنذار ثاني */}
          <TouchableOpacity
            onPress={() => handleWarningPress(item, "second")}
            disabled={warnings.second === 0}
            activeOpacity={0.7}
            className="flex-1 min-w-[45%]">
            <View
              className={`${getWarningColor(
                warnings.second
              )} rounded-xl p-4 items-center shadow-sm`}
              style={{ elevation: warnings.second > 0 ? 3 : 0 }}>
              <Text
                className={`text-xs mb-2 font-bold ${getWarningTextColor(warnings.second)}`}>
                إنذار ثاني
              </Text>
              <Text
                className={`text-3xl font-bold ${getWarningTextColor(warnings.second)}`}>
                {warnings.second}
              </Text>
            </View>
          </TouchableOpacity>

          {/* إنذار ثالث */}
          <TouchableOpacity
            onPress={() => handleWarningPress(item, "third")}
            disabled={warnings.third === 0}
            activeOpacity={0.7}
            className="flex-1 min-w-[45%]">
            <View
              className={`${getWarningColor(
                warnings.third
              )} rounded-xl p-4 items-center shadow-sm`}
              style={{ elevation: warnings.third > 0 ? 3 : 0 }}>
              <Text
                className={`text-xs mb-2 font-bold ${getWarningTextColor(warnings.third)}`}>
                إنذار ثالث
              </Text>
              <Text
                className={`text-3xl font-bold ${getWarningTextColor(warnings.third)}`}>
                {warnings.third}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (students.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-6xl mb-4">👥</Text>
        <Text className="text-gray-500 text-lg">لا يوجد طلاب</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={students}
      renderItem={renderStudent}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    />
  );
};
