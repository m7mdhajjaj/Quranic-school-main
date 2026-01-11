import React from "react";
import { View, Text, FlatList } from "react-native";
import { AlertTriangle, Calendar, FileText } from "lucide-react-native";
import { Warning } from "@/types/warning.types";

interface StudentViewProps {
  warnings: Warning[];
}

export const StudentView: React.FC<StudentViewProps> = ({ warnings }) => {
  const getWarningColor = (type: string) => {
    switch (type) {
      case "warning":
        return {
          bg: "bg-yellow-100",
          border: "border-yellow-500",
          text: "text-yellow-700",
        };
      case "first":
        return {
          bg: "bg-orange-100",
          border: "border-orange-500",
          text: "text-orange-700",
        };
      case "second":
        return {
          bg: "bg-red-100",
          border: "border-red-500",
          text: "text-red-700",
        };
      case "third":
        return {
          bg: "bg-red-200",
          border: "border-red-700",
          text: "text-red-900",
        };
      default:
        return {
          bg: "bg-gray-100",
          border: "border-gray-500",
          text: "text-gray-700",
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const renderWarning = ({ item }: { item: Warning }) => {
    const colors = getWarningColor(item.type);

    return (
      <View
        className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-5 mb-4`}>
        {/* نوع الإنذار */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <View className={`${colors.bg} rounded-full p-2`}>
              <Text className="text-2xl">
                {item.type === "warning"
                  ? "💬"
                  : item.type === "first"
                    ? "1️⃣"
                    : item.type === "second"
                      ? "2️⃣"
                      : "3️⃣"}
              </Text>
            </View>
            <Text className={`text-xl font-bold ${colors.text}`}>
              {item.type === "warning"
                ? "تنبيه"
                : item.type === "first"
                  ? "إنذار أول"
                  : item.type === "second"
                    ? "إنذار ثاني"
                    : "إنذار ثالث"}
            </Text>
          </View>
        </View>

        {/* السبب */}
        <View className="bg-white rounded-xl p-3 mb-3">
          <View className="flex-row items-start gap-2">
            <Text className="text-gray-500 text-lg">📝</Text>
            <View className="flex-1">
              <Text className="text-gray-600 text-sm mb-1">السبب:</Text>
              <Text className="text-gray-800 font-semibold">{item.reason}</Text>
            </View>
          </View>
        </View>

        {/* التاريخ */}
        <View className="flex-row items-center gap-2">
          <Text className="text-gray-500">📅</Text>
          <Text className="text-gray-600 text-sm">
            {formatDate(item.createdAt)}
          </Text>
        </View>

        {/* اسم الحلقة */}
        <View className="flex-row items-center gap-2 mt-2">
          <Text className="text-gray-500">📚</Text>
          <Text className="text-gray-600 text-sm">{item.groupName}</Text>
        </View>
      </View>
    );
  };

  if (warnings.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-8xl mb-4">✅</Text>
        <Text className="text-gray-700 text-xl font-bold mb-2">
          ممتاز! لا توجد إنذارات
        </Text>
        <Text className="text-gray-500 text-center px-4">
          استمر في التفوق والالتزام
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* التحذير */}
      <View className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-4">
        <View className="flex-row items-center gap-3">
          <Text className="text-3xl">⚠️</Text>
          <View className="flex-1">
            <Text className="text-red-800 font-bold text-lg mb-1">
              لديك {warnings.length} إنذار
            </Text>
            <Text className="text-red-600 text-sm">
              الوصول لـ 3 إنذارات يؤدي للفصل من الحلقة
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={warnings}
        renderItem={renderWarning}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
