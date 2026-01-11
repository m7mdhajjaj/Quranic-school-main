// ============================================================================
// AddTeacherModal - نموذج إضافة/تعديل معلم
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
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createTeacher, updateTeacher } from "@/Api/teacherApi";
import type { Teacher, TeacherFormData } from "@/types/teacher.types";

interface AddTeacherModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teacher?: Teacher;
}

export const AddTeacherModal: React.FC<AddTeacherModalProps> = ({
  visible,
  onClose,
  onSuccess,
  teacher,
}) => {
  const [formData, setFormData] = useState<TeacherFormData>({
    firstName: "",
    lastName: "",
    fatherName: "",
    grandFatherName: "",
    motherName: "",
    idNumber: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    gender: null,
    residence: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2000, 0, 1));

  useEffect(() => {
    if (teacher) {
      setFormData({
        firstName: teacher.firstName || "",
        lastName: teacher.lastName || "",
        fatherName: teacher.fatherName || "",
        grandFatherName: teacher.grandFatherName || "",
        motherName: teacher.motherName || "",
        idNumber: teacher.idNumber || "",
        email: teacher.email || "",
        phoneNumber: teacher.phoneNumber || "",
        birthDate: teacher.birthDate?.toString() || "",
        gender: (teacher.gender as any) || null,
        residence: teacher.residence || "",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        fatherName: "",
        grandFatherName: "",
        motherName: "",
        idNumber: "",
        email: "",
        phoneNumber: "",
        birthDate: "",
        gender: null,
        residence: "",
        password: "",
      });
    }
    setErrors({});
  }, [teacher, visible]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // الحقول المطلوبة
    if (!formData.firstName?.trim()) newErrors.firstName = "الاسم الأول مطلوب";
    if (!formData.lastName?.trim()) newErrors.lastName = "اسم العائلة مطلوب";
    if (!formData.fatherName?.trim()) newErrors.fatherName = "اسم الأب مطلوب";
    if (!formData.grandFatherName?.trim())
      newErrors.grandFatherName = "اسم الجد مطلوب";
    if (!formData.motherName?.trim()) newErrors.motherName = "اسم الأم مطلوب";
    if (!formData.idNumber?.trim()) {
      newErrors.idNumber = "رقم الهوية مطلوب";
    } else if (!/^\d{9}$/.test(formData.idNumber.trim())) {
      newErrors.idNumber = "رقم الهوية يجب أن يتكون من 9 أرقام";
    }
    if (!formData.birthDate?.trim())
      newErrors.birthDate = "تاريخ الميلاد مطلوب";
    if (!formData.gender) newErrors.gender = "الجنس مطلوب";
    if (!formData.residence?.trim()) newErrors.residence = "مكان السكن مطلوب";
    if (!formData.email?.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)
    ) {
      newErrors.email = "صيغة البريد الإلكتروني غير صحيحة";
    }
    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = "رقم الهاتف مطلوب";
    } else if (!/^05\d{8}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";
    }
    if (!teacher && !formData.password?.trim())
      newErrors.password = "كلمة المرور مطلوبة";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // تنظيف البيانات - جميع الحقول مطلوبة ما عدا password في التعديل
      const cleanedData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        fatherName: formData.fatherName.trim(),
        grandFatherName: formData.grandFatherName.trim(),
        motherName: formData.motherName.trim(),
        idNumber: formData.idNumber.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        birthDate: formData.birthDate.trim(),
        gender: formData.gender,
        residence: formData.residence.trim(),
      };

      // كلمة المرور فقط للمعلمين الجدد
      if (!teacher && formData.password?.trim()) {
        cleanedData.password = formData.password.trim();
      }

      console.log("📝 Submitting teacher:", {
        isEdit: !!teacher,
        teacherId: teacher?._id,
        cleanedData,
      });

      const result = teacher
        ? await updateTeacher(teacher._id || "", cleanedData)
        : await createTeacher(cleanedData);

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
            <Text className="text-2xl font-bold text-gray-900">
              {teacher ? "تعديل معلم" : "إضافة معلم جديد"}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-100 rounded-full p-2">
              <Text className="text-gray-600 text-xl">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            {/* First Name */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                الاسم الأول <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.firstName}
                onChangeText={(text) =>
                  setFormData({ ...formData, firstName: text })
                }
                placeholder="أدخل الاسم الأول"
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800 border border-gray-200"
              />
              {errors.firstName && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.firstName}
                </Text>
              )}
            </View>

            {/* Father Name */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                اسم الأب <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.fatherName}
                onChangeText={(text) =>
                  setFormData({ ...formData, fatherName: text })
                }
                placeholder="أدخل اسم الأب"
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800 border border-gray-200"
              />
              {errors.fatherName && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.fatherName}
                </Text>
              )}
            </View>

            {/* Grand Father Name */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                اسم الجد <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.grandFatherName}
                onChangeText={(text) =>
                  setFormData({ ...formData, grandFatherName: text })
                }
                placeholder="أدخل اسم الجد"
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800 border border-gray-200"
              />
              {errors.grandFatherName && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.grandFatherName}
                </Text>
              )}
            </View>

            {/* Mother Name */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                اسم الأم <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.motherName}
                onChangeText={(text) =>
                  setFormData({ ...formData, motherName: text })
                }
                placeholder="أدخل اسم الأم"
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800 border border-gray-200"
              />
              {errors.motherName && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.motherName}
                </Text>
              )}
            </View>

            {/* Last Name */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                اسم الشهرة <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.lastName}
                onChangeText={(text) =>
                  setFormData({ ...formData, lastName: text })
                }
                placeholder="أدخل اسم الشهرة"
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800 border border-gray-200"
              />
              {errors.lastName && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.lastName}
                </Text>
              )}
            </View>

            {/* ID Number */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                رقم الهوية (9 أرقام) <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.idNumber}
                onChangeText={(text) =>
                  setFormData({ ...formData, idNumber: text })
                }
                placeholder="123456789"
                keyboardType="numeric"
                maxLength={9}
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800 border border-gray-200"
              />
              {errors.idNumber && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.idNumber}
                </Text>
              )}
            </View>

            {/* Birth Date */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                تاريخ الميلاد <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 flex-row items-center justify-between">
                <Text className="text-gray-800">
                  {formData.birthDate
                    ? new Date(formData.birthDate).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "اختر تاريخ الميلاد"}
                </Text>
                <Text className="text-emerald-600">📅</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={
                    formData.birthDate
                      ? new Date(formData.birthDate)
                      : selectedDate
                  }
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (date) {
                      const formattedDate = date.toISOString().split("T")[0];
                      setFormData({ ...formData, birthDate: formattedDate });
                      setSelectedDate(date);
                    }
                  }}
                  maximumDate={new Date()}
                  minimumDate={new Date(1950, 0, 1)}
                />
              )}
              {errors.birthDate && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.birthDate}
                </Text>
              )}
            </View>

            {/* Gender */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                الجنس <Text className="text-red-500">*</Text>
              </Text>
              <View className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <Picker
                  selectedValue={formData.gender || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      gender: value === "" ? null : (value as any),
                    })
                  }
                  style={{ height: 50 }}>
                  <Picker.Item label="اختر الجنس" value="" />
                  <Picker.Item label="ذكر" value="ذكر" />
                  <Picker.Item label="أنثى" value="أنثى" />
                </Picker>
              </View>
              {errors.gender && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.gender}
                </Text>
              )}
            </View>

            {/* Residence */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                مكان السكن <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.residence}
                onChangeText={(text) =>
                  setFormData({ ...formData, residence: text })
                }
                placeholder="أدخل مكان السكن"
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800 border border-gray-200"
              />
              {errors.residence && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.residence}
                </Text>
              )}
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                البريد الإلكتروني <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800 border border-gray-200"
              />
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.email}
                </Text>
              )}
            </View>

            {/* Phone Number */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                رقم الهاتف <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.phoneNumber}
                onChangeText={(text) =>
                  setFormData({ ...formData, phoneNumber: text })
                }
                placeholder="0591234567"
                keyboardType="phone-pad"
                maxLength={10}
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800 border border-gray-200"
              />
              {errors.phoneNumber && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber}
                </Text>
              )}
            </View>

            {/* Password (only for new teacher) */}
            {!teacher && (
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-2">
                  كلمة المرور <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                  placeholder="أدخل كلمة المرور"
                  secureTextEntry
                  className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800 border border-gray-200"
                />
                {errors.password && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </Text>
                )}
              </View>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <Text className="text-red-700 text-center">
                  {errors.submit}
                </Text>
              </View>
            )}

            {/* Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-gray-200 rounded-xl py-4"
                disabled={isSubmitting}>
                <Text className="text-gray-700 font-bold text-center text-lg">
                  إلغاء
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                className="flex-1 bg-emerald-500 rounded-xl py-4"
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.6 : 1 }}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-center text-lg">
                    {teacher ? "حفظ التعديلات" : "إضافة معلم"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
