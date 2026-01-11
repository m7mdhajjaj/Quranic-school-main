// ============================================================================
// AddGroupModal - نموذج إضافة/تعديل حلقة
// ============================================================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { createGroup, updateGroup } from "@/Api/groupApi";
import type { Group, GroupFormData } from "@/types/group.types";
import type { Teacher } from "@/Api/teacherApi";

interface AddGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group?: Group;
  teachers: Teacher[];
}

export const AddGroupModal: React.FC<AddGroupModalProps> = ({
  visible,
  onClose,
  onSuccess,
  group,
  teachers,
}) => {
  const [formData, setFormData] = useState<GroupFormData>({
    name: "",
    teacher: "",
    description: "",
    capacity: 30,
    activeStatus: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        teacher: group.teacher,
        description: group.description || "",
        capacity: group.capacity || 30,
        activeStatus: group.activeStatus,
      });
    } else {
      setFormData({
        name: "",
        teacher: "",
        description: "",
        capacity: 30,
        activeStatus: true,
      });
    }
    setErrors({});
  }, [group, visible]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "اسم الحلقة مطلوب";
    }
    if (!formData.teacher) {
      newErrors.teacher = "المعلم مطلوب";
    }
    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = "السعة يجب أن تكون أكبر من 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      console.log("📝 Submitting group:", {
        isEdit: !!group,
        groupId: group?._id,
        formData,
      });

      const result = group
        ? await updateGroup(group._id || "", formData)
        : await createGroup(formData);

      console.log("✅ Submit result:", result);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        console.error("❌ Submit failed:", result.message);
        setErrors({ submit: result.message || "حدث خطأ" });
      }
    } catch (error: any) {
      console.error("❌ Submit error:", error);
      setErrors({ submit: error?.message || "حدث خطأ" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[90%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-800">
              {group ? "تعديل الحلقة" : "إضافة حلقة جديدة"}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-100 rounded-full p-2 w-10 h-10 items-center justify-center">
              <Text className="text-gray-700 text-2xl">×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="p-6">
            {/* اسم الحلقة */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                اسم الحلقة *
              </Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="أدخل اسم الحلقة"
                className={`bg-gray-50 rounded-xl px-4 py-3 text-gray-800 ${
                  errors.name ? "border-2 border-red-500" : ""
                }`}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>
              )}
            </View>

            {/* المعلم */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">المعلم *</Text>
              <View
                className={`bg-gray-50 rounded-xl ${
                  errors.teacher ? "border-2 border-red-500" : ""
                }`}>
                <Picker
                  selectedValue={formData.teacher}
                  onValueChange={(value) =>
                    setFormData({ ...formData, teacher: value })
                  }
                  style={{ height: 50 }}>
                  <Picker.Item label="اختر المعلم" value="" />
                  {teachers.map((teacher) => (
                    <Picker.Item
                      key={teacher._id}
                      label={`${teacher.firstName} ${teacher.lastName}`}
                      value={teacher._id}
                    />
                  ))}
                </Picker>
              </View>
              {errors.teacher && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.teacher}
                </Text>
              )}
            </View>

            {/* السعة */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                السعة القصوى
              </Text>
              <TextInput
                value={formData.capacity?.toString() || ""}
                onChangeText={(text) =>
                  setFormData({ ...formData, capacity: parseInt(text) || 0 })
                }
                placeholder="30"
                keyboardType="number-pad"
                className={`bg-gray-50 rounded-xl px-4 py-3 text-gray-800 ${
                  errors.capacity ? "border-2 border-red-500" : ""
                }`}
              />
              {errors.capacity && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.capacity}
                </Text>
              )}
            </View>

            {/* الوصف */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">الوصف</Text>
              <TextInput
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="وصف الحلقة (اختياري)"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800"
                style={{ minHeight: 100 }}
              />
            </View>

            {/* الحالة */}
            <View className="flex-row items-center justify-between mb-4 bg-gray-50 rounded-xl p-4">
              <Text className="text-gray-700 font-semibold">الحلقة فعالة</Text>
              <Switch
                value={formData.activeStatus}
                onValueChange={(value) =>
                  setFormData({ ...formData, activeStatus: value })
                }
                trackColor={{ false: "#d1d5db", true: "#10b981" }}
                thumbColor={formData.activeStatus ? "#059669" : "#9ca3af"}
              />
            </View>

            {errors.submit && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <Text className="text-red-700 text-center">
                  {errors.submit}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
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
                  {group ? "حفظ التعديلات" : "إضافة الحلقة"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
