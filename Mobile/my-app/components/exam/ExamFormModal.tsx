import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Exam, ExamFormData } from "@/types/exam.types";
import { useTeacherGroups } from "@/hooks/exam/useTeacherGroups";

interface ExamFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ExamFormData) => Promise<void>;
  editingExam?: Exam | null;
  isSubmitting: boolean;
}

export const ExamFormModal: React.FC<ExamFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  editingExam,
  isSubmitting,
}) => {
  const { groups, loading: groupsLoading } = useTeacherGroups();

  const [formData, setFormData] = useState<ExamFormData>({
    name: "",
    date: "",
    examType: "تحريري",
    subject: "",
    totalMarks: 100,
    groups: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // تحديث البيانات عند التعديل
  useEffect(() => {
    if (editingExam) {
      setFormData({
        name: editingExam.name,
        date: editingExam.date.split("T")[0],
        examType: editingExam.examType,
        subject: editingExam.subject,
        totalMarks: editingExam.totalMarks,
        groups: editingExam.groups,
      });
    } else {
      setFormData({
        name: "",
        date: "",
        examType: "تحريري",
        subject: "",
        totalMarks: 100,
        groups: [],
      });
    }
    setErrors({});
  }, [editingExam, visible]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "اسم الامتحان مطلوب";
    }
    if (!formData.subject.trim()) {
      newErrors.subject = "المادة مطلوبة";
    }
    if (!formData.date) {
      newErrors.date = "التاريخ مطلوب";
    }
    if (formData.totalMarks <= 0) {
      newErrors.totalMarks = "العلامة الكلية يجب أن تكون أكبر من صفر";
    }
    if (formData.groups.length === 0) {
      newErrors.groups = "يجب اختيار حلقة واحدة على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // الخطأ يُعالج في useExamActions
    }
  };

  const toggleGroup = (groupId: string) => {
    setFormData((prev) => ({
      ...prev,
      groups: prev.groups.includes(groupId)
        ? prev.groups.filter((id) => id !== groupId)
        : [...prev.groups, groupId],
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[90%]">
          {/* الرأس */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-800">
              {editingExam ? "تعديل امتحان" : "إضافة امتحان جديد"}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-100 rounded-full p-2 w-10 h-10 items-center justify-center">
              <Text className="text-gray-700 text-2xl">×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="p-6">
            {/* اسم الامتحان */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                اسم الامتحان *
              </Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
                placeholder="مثال: امتحان نصف السنة"
                className={`bg-gray-50 rounded-xl px-4 py-3 text-gray-800 ${
                  errors.name ? "border-2 border-red-500" : ""
                }`}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>
              )}
            </View>

            {/* المادة */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">المادة *</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                <Text className="text-gray-500 text-lg">📚</Text>
                <TextInput
                  value={formData.subject}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, subject: text }))
                  }
                  placeholder="مثال: التجويد"
                  className={`flex-1 mr-3 text-gray-800 ${
                    errors.subject ? "border-2 border-red-500 rounded-xl" : ""
                  }`}
                />
              </View>
              {errors.subject && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.subject}
                </Text>
              )}
            </View>

            {/* التاريخ */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                التاريخ *
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                <Text className="text-gray-500 text-lg">📅</Text>
                <TextInput
                  value={formData.date}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, date: text }))
                  }
                  placeholder="YYYY-MM-DD"
                  className={`flex-1 mr-3 text-gray-800 ${
                    errors.date ? "border-2 border-red-500 rounded-xl" : ""
                  }`}
                />
              </View>
              {errors.date && (
                <Text className="text-red-500 text-sm mt-1">{errors.date}</Text>
              )}
            </View>

            {/* نوع الامتحان */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                نوع الامتحان *
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, examType: "تحريري" }))
                  }
                  className={`flex-1 py-3 rounded-xl ${
                    formData.examType === "تحريري"
                      ? "bg-blue-500"
                      : "bg-gray-200"
                  }`}>
                  <Text
                    className={`text-center font-bold ${
                      formData.examType === "تحريري"
                        ? "text-white"
                        : "text-gray-700"
                    }`}>
                    تحريري
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, examType: "شفهي" }))
                  }
                  className={`flex-1 py-3 rounded-xl ${
                    formData.examType === "شفهي"
                      ? "bg-purple-500"
                      : "bg-gray-200"
                  }`}>
                  <Text
                    className={`text-center font-bold ${
                      formData.examType === "شفهي"
                        ? "text-white"
                        : "text-gray-700"
                    }`}>
                    شفهي
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* العلامة الكلية */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                العلامة الكلية *
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3">
                <Text className="text-gray-500 text-lg">#</Text>
                <TextInput
                  value={formData.totalMarks.toString()}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      totalMarks: parseInt(text) || 0,
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="100"
                  className={`flex-1 mr-3 text-gray-800 ${
                    errors.totalMarks
                      ? "border-2 border-red-500 rounded-xl"
                      : ""
                  }`}
                />
              </View>
              {errors.totalMarks && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.totalMarks}
                </Text>
              )}
            </View>

            {/* اختيار الحلقات */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-3 text-lg">
                الحلقات * ({formData.groups.length} محدد)
              </Text>
              {groupsLoading ? (
                <ActivityIndicator size="small" color="#10b981" />
              ) : groups.length === 0 ? (
                <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <Text className="text-yellow-700 text-center">
                    لا توجد حلقات متاحة
                  </Text>
                </View>
              ) : (
                <View
                  className="border-2 border-gray-200 rounded-xl p-2"
                  style={{ maxHeight: 250 }}>
                  {groups.map((group) => (
                    <TouchableOpacity
                      key={group._id}
                      onPress={() => toggleGroup(group._id)}
                      activeOpacity={0.7}
                      className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${
                        formData.groups.includes(group._id)
                          ? "bg-emerald-500 shadow-lg"
                          : "bg-white border-2 border-gray-300"
                      }`}
                      style={{
                        elevation: formData.groups.includes(group._id) ? 4 : 0,
                      }}>
                      <Text
                        className={`font-bold text-base ${
                          formData.groups.includes(group._id)
                            ? "text-white"
                            : "text-gray-800"
                        }`}>
                        {group.name}
                      </Text>
                      {formData.groups.includes(group._id) && (
                        <View className="bg-white rounded-full w-7 h-7 items-center justify-center">
                          <Text className="text-emerald-500 font-bold text-lg">
                            ✓
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {errors.groups && (
                <Text className="text-red-500 text-sm mt-2 font-semibold">
                  {errors.groups}
                </Text>
              )}
            </View>
          </ScrollView>

          {/* أزرار الإجراءات */}
          <View className="p-6 border-t border-gray-200 flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-200 rounded-xl py-4">
              <Text className="text-center font-bold text-gray-700">إلغاء</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-emerald-500 rounded-xl py-4">
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center font-bold text-white">
                  {editingExam ? "حفظ التعديلات" : "إضافة الامتحان"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
