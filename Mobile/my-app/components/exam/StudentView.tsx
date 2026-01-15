import React from "react";
import { View, Text } from "react-native";
import { Calendar, BookOpen, Award, Clock } from "lucide-react-native";
import { StudentExamResult } from "@/types/exam.types";

interface StudentViewProps {
  exams: StudentExamResult[];
}

export const StudentView: React.FC<StudentViewProps> = ({ exams }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(date);
  };

  const renderExamCard = (item: StudentExamResult) => {
    const { exam, mark, status } = item;
    const isPast = new Date(exam.date) < new Date();

    return (
      <View className="bg-white rounded-2xl p-5 mb-4 shadow-md border border-gray-100">
        {/* العنوان والنوع */}
        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800 mb-1">
              {exam.name}
            </Text>
            <View className="flex-row items-center gap-2">
              <BookOpen size={16} color="#6b7280" />
              <Text className="text-gray-600 text-sm">{exam.subject}</Text>
            </View>
          </View>
          <View
            className={`px-3 py-1.5 rounded-full ${
              exam.examType === "تحريري" ? "bg-blue-100" : "bg-purple-100"
            }`}>
            <Text
              className={`text-xs font-bold ${
                exam.examType === "تحريري" ? "text-blue-700" : "text-purple-700"
              }`}>
              {exam.examType}
            </Text>
          </View>
        </View>

        {/* التاريخ */}
        <View className="flex-row items-center gap-2 mb-4 bg-gray-50 p-3 rounded-xl">
          <Calendar size={18} color="#059669" />
          <Text className="text-gray-700 flex-1">{formatDate(exam.date)}</Text>
        </View>

        {/* العلامة */}
        {status === "graded" && mark ? (
          <View className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Award size={22} color="#059669" />
                <Text className="text-gray-700 font-semibold">علامتك:</Text>
              </View>
              <Text className="text-2xl font-bold text-emerald-600">
                {mark.mark} / {exam.totalMarks}
              </Text>
            </View>
            {/* النسبة المئوية */}
            <View className="mt-3">
              <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <View
                  className="bg-emerald-500 h-full"
                  style={{
                    width: `${(mark.mark / exam.totalMarks) * 100}%`,
                  }}
                />
              </View>
              <Text className="text-gray-600 text-xs mt-1 text-center">
                {((mark.mark / exam.totalMarks) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        ) : isPast ? (
          <View className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <View className="flex-row items-center gap-2">
              <Clock size={18} color="#d97706" />
              <Text className="text-yellow-700">لم يتم إدخال العلامة بعد</Text>
            </View>
          </View>
        ) : (
          <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <View className="flex-row items-center gap-2">
              <Clock size={18} color="#2563eb" />
              <Text className="text-blue-700">الامتحان لم يبدأ بعد</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (!exams || exams.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Calendar size={64} color="#d1d5db" />
        <Text className="text-gray-500 text-lg mt-4">لا توجد امتحانات</Text>
      </View>
    );
  }

  // تصفية العناصر الصالحة فقط (التي تحتوي على exam و _id)
  const validExams = exams.filter((item) => item && item.exam && item.exam._id);

  return (
    <View style={{ paddingBottom: 20 }}>
      {validExams.map((item) => (
        <View key={item.exam._id}>{renderExamCard(item)}</View>
      ))}
    </View>
  );
};
