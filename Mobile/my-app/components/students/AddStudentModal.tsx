// ============================================================================
// AddStudentModal - نموذج إضافة/تعديل طالب
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
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createStudent, updateStudent } from "@/Api/studentApi";
import { getAllGroups } from "@/Api/groupApi";
import type { Student, StudentFormData } from "@/types/student.types";
import type { Group } from "@/types/group.types";

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student?: Student;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  visible,
  onClose,
  onSuccess,
  student,
}) => {
  const [formData, setFormData] = useState<StudentFormData>({
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
    teacher: "",
    group: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2010, 0, 1));
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const result = await getAllGroups();
        if (result.success && result.data) {
          setGroups(result.data);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoadingGroups(false);
      }
    };

    if (visible) {
      fetchGroups();
    }
  }, [visible]);

  // Auto-fill teacher when group is selected
  useEffect(() => {
    if (formData.group) {
      const selectedGroup = groups.find((g) => g.name === formData.group);
      if (selectedGroup && selectedGroup.teacher) {
        setFormData((prev) => ({
          ...prev,
          teacher: selectedGroup.teacher || "",
        }));
      }
    }
  }, [formData.group, groups]);

  useEffect(() => {
    if (student) {
      console.log("📝 Student data for editing:", student);
      setFormData({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        fatherName: student.fatherName || "",
        grandFatherName: student.grandFatherName || "",
        motherName: student.motherName || "",
        idNumber: student.idNumber || "",
        email: student.email || "",
        phoneNumber: student.phoneNumber || "",
        birthDate: student.birthDate?.toString().split("T")[0] || "",
        gender: (student.gender as any) || null,
        residence: student.residence || "",
        teacher: student.teacher || "",
        group: student.group || "",
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
        teacher: "",
        group: "",
        password: "",
      });
    }
    setErrors({});
  }, [student, visible]);

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
    if (!formData.group?.trim()) newErrors.group = "الحلقة مطلوبة";
    if (!student && !formData.password?.trim())
      newErrors.password = "كلمة المرور مطلوبة";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // تنظيف البيانات
      const cleanedData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        fatherName: formData.fatherName.trim(),
        grandFatherName: formData.grandFatherName.trim(),
        motherName: formData.motherName.trim(),
        idNumber: formData.idNumber.trim(),
        email: formData.email?.trim() || "",
        phoneNumber: formData.phoneNumber.trim(),
        birthDate: formData.birthDate.trim(),
        gender: formData.gender,
        residence: formData.residence.trim(),
        group: formData.group.trim(),
        teacher: formData.teacher.trim(),
      };

      // كلمة المرور فقط للطلاب الجدد
      if (!student && formData.password?.trim()) {
        cleanedData.password = formData.password.trim();
      }

      console.log("📝 Submitting student:", {
        isEdit: !!student,
        studentId: student?._id,
        cleanedData,
      });

      const result = student
        ? await updateStudent(student._id || "", cleanedData)
        : await createStudent(cleanedData);

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
              {student ? "تعديل طالب" : "إضافة طالب جديد"}
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
                <Text className="text-blue-600">📅</Text>
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

            {/* Group */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                الحلقة <Text className="text-red-500">*</Text>
              </Text>
              <View className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <Picker
                  selectedValue={formData.group}
                  onValueChange={(value) =>
                    setFormData({ ...formData, group: value })
                  }
                  enabled={!loadingGroups}
                  style={{ height: 50 }}>
                  <Picker.Item
                    label={loadingGroups ? "جاري التحميل..." : "اختر الحلقة"}
                    value=""
                  />
                  {groups.map((group) => (
                    <Picker.Item
                      key={group._id}
                      label={group.name}
                      value={group.name}
                    />
                  ))}
                </Picker>
              </View>
              {errors.group && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.group}
                </Text>
              )}
            </View>

            {/* Teacher (Auto-filled) */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">المعلم</Text>
              <TextInput
                value={formData.teacher}
                editable={false}
                placeholder={
                  formData.group ? "يتم التعيين تلقائياً" : "اختر الحلقة أولاً"
                }
                className="bg-gray-100 rounded-xl px-4 py-3 text-gray-500 border border-gray-200"
              />
              <Text className="text-gray-500 text-xs mt-1">
                يتم تعيين المعلم تلقائياً بناءً على الحلقة المختارة
              </Text>
            </View>

            {/* Password (only for new student) */}
            {!student && (
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
                className="flex-1 bg-blue-500 rounded-xl py-4"
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.6 : 1 }}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-center text-lg">
                    {student ? "حفظ التعديلات" : "إضافة طالب"}
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
