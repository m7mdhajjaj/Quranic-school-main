import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  StudentWithWarnings,
  CreateWarningData,
  WarningType,
} from "@/types/warning.types";

interface AddWarningModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWarningData) => Promise<void>;
  student: StudentWithWarnings | null;
  teacherId: string;
  groupName: string;
  isSubmitting: boolean;
}

export const AddWarningModal: React.FC<AddWarningModalProps> = ({
  visible,
  onClose,
  onSubmit,
  student,
  teacherId,
  groupName,
  isSubmitting,
}) => {
  const [selectedType, setSelectedType] = useState<WarningType>("warning");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const getWarningTypeLabel = (type: WarningType) => {
    const labels = {
      warning: "تنبيه",
      first: "إنذار أول",
      second: "إنذار ثاني",
      third: "إنذار ثالث",
    };
    return labels[type];
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("السبب مطلوب");
      return;
    }

    if (!student) return;

    try {
      await onSubmit({
        studentId: student._id,
        teacherId,
        groupName,
        type: selectedType,
        reason: reason.trim(),
      });
      setReason("");
      setError("");
      onClose();
    } catch (error) {
      // الخطأ يُعالج في useWarningsActions
    }
  };

  const getFullName = () => {
    if (!student) return "";
    return `${student.firstName} ${student.middleName || ""} ${student.lastName}`.trim();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          {/* الرأس */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-800">
              إضافة إنذار
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-100 rounded-full p-2 w-10 h-10 items-center justify-center">
              <Text className="text-gray-700 text-2xl">×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="p-6">
            {/* اسم الطالب */}
            <View className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
              <Text className="text-gray-600 text-sm mb-1">الطالب:</Text>
              <Text className="text-gray-800 font-bold text-lg">
                {getFullName()}
              </Text>
            </View>

            {/* نوع الإنذار */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-3 text-lg">
                نوع الإنذار *
              </Text>
              <View className="flex-row flex-wrap gap-3">
                <TouchableOpacity
                  onPress={() => setSelectedType("warning")}
                  className="flex-1 min-w-[45%]">
                  <View
                    className={`py-4 rounded-xl items-center ${
                      selectedType === "warning"
                        ? "bg-yellow-500"
                        : "bg-gray-200"
                    }`}>
                    <Text className="text-2xl mb-1">💬</Text>
                    <Text
                      className={`font-bold ${
                        selectedType === "warning"
                          ? "text-white"
                          : "text-gray-700"
                      }`}>
                      تنبيه
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedType("first")}
                  className="flex-1 min-w-[45%]">
                  <View
                    className={`py-4 rounded-xl items-center ${
                      selectedType === "first" ? "bg-orange-500" : "bg-gray-200"
                    }`}>
                    <Text className="text-2xl mb-1">1️⃣</Text>
                    <Text
                      className={`font-bold ${
                        selectedType === "first"
                          ? "text-white"
                          : "text-gray-700"
                      }`}>
                      إنذار أول
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedType("second")}
                  className="flex-1 min-w-[45%]">
                  <View
                    className={`py-4 rounded-xl items-center ${
                      selectedType === "second" ? "bg-red-500" : "bg-gray-200"
                    }`}>
                    <Text className="text-2xl mb-1">2️⃣</Text>
                    <Text
                      className={`font-bold ${
                        selectedType === "second"
                          ? "text-white"
                          : "text-gray-700"
                      }`}>
                      إنذار ثاني
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedType("third")}
                  className="flex-1 min-w-[45%]">
                  <View
                    className={`py-4 rounded-xl items-center ${
                      selectedType === "third" ? "bg-red-700" : "bg-gray-200"
                    }`}>
                    <Text className="text-2xl mb-1">3️⃣</Text>
                    <Text
                      className={`font-bold ${
                        selectedType === "third"
                          ? "text-white"
                          : "text-gray-700"
                      }`}>
                      إنذار ثالث
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* السبب */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">السبب *</Text>
              <TextInput
                value={reason}
                onChangeText={(text) => {
                  setReason(text);
                  setError("");
                }}
                placeholder="اكتب سبب الإنذار..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className={`bg-gray-50 rounded-xl px-4 py-3 text-gray-800 ${
                  error ? "border-2 border-red-500" : ""
                }`}
                style={{ minHeight: 100 }}
              />
              {error && (
                <Text className="text-red-500 text-sm mt-1">{error}</Text>
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
              className="flex-1 bg-red-500 rounded-xl py-4">
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center font-bold text-white">
                  إضافة الإنذار
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
