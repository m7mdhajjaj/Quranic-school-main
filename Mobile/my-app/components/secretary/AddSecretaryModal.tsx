// ============================================================================
// AddSecretaryModal - نموذج إضافة/تعديل سكرتير
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
  KeyboardAvoidingView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Calendar,
} from "lucide-react-native";
import { createSecretary, updateSecretary } from "@/Api/secretaryApi";
import {
  validateSecretaryForm,
  hasValidationErrors,
  calculateAge,
} from "@/Validation/secretaryValidation";
import type {
  Secretary,
  SecretaryFormData,
  SecretaryPermissions,
  AccessLevel,
} from "@/types/secretary.types";

interface AddSecretaryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  secretary?: Secretary;
}

export const AddSecretaryModal: React.FC<AddSecretaryModalProps> = ({
  visible,
  onClose,
  onSuccess,
  secretary,
}) => {
  const isUpdate = !!secretary;

  const [formData, setFormData] = useState<SecretaryFormData>({
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
    permissions: {
      groupsAccess: "none",
      teachersAccess: "none",
      studentsAccess: "none",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(1990, 0, 1));

  // Reset form when modal opens/closes or secretary changes
  useEffect(() => {
    if (secretary) {
      setFormData({
        firstName: secretary.firstName || "",
        lastName: secretary.lastName || "",
        fatherName: secretary.fatherName || "",
        grandFatherName: secretary.grandFatherName || "",
        motherName: secretary.motherName || "",
        idNumber: secretary.idNumber || "",
        email: secretary.email || "",
        phoneNumber: secretary.phoneNumber || "",
        birthDate: secretary.birthDate?.toString().split("T")[0] || "",
        gender:
          secretary.gender === "male"
            ? "ذكر"
            : secretary.gender === "female"
              ? "أنثى"
              : (secretary.gender as "ذكر" | "أنثى" | null),
        residence: secretary.residence || "",
        permissions: secretary.permissions || {
          groupsAccess: "none",
          teachersAccess: "none",
          studentsAccess: "none",
        },
      });
      if (secretary.birthDate) {
        setSelectedDate(new Date(secretary.birthDate));
      }
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
        permissions: {
          groupsAccess: "none",
          teachersAccess: "none",
          studentsAccess: "none",
        },
      });
      setSelectedDate(new Date(1990, 0, 1));
    }
    setErrors({});
  }, [secretary, visible]);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, birthDate: formattedDate }));
    }
  };

  const handlePermissionChange = (
    field: keyof SecretaryPermissions,
    value: AccessLevel
  ) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    // Validate form
    const validationErrors = validateSecretaryForm(formData, isUpdate);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      let result;
      if (isUpdate && secretary) {
        // Remove password if empty during update
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        result = await updateSecretary(secretary._id, updateData);
      } else {
        result = await createSecretary(formData);
      }

      if (result.success) {
        onSuccess();
      } else {
        setErrors({ submit: result.message || "حدث خطأ" });
      }
    } catch (error) {
      console.error("Error submitting secretary:", error);
      setErrors({ submit: "حدث خطأ أثناء الحفظ" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof SecretaryFormData,
    icon: React.ReactNode,
    options?: {
      keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
      secureTextEntry?: boolean;
      required?: boolean;
    }
  ) => (
    <View className="mb-4">
      <Text className="text-gray-700 font-medium mb-1">
        {label}
        {options?.required && <Text className="text-red-500"> *</Text>}
      </Text>
      <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200 px-3">
        {icon}
        <TextInput
          value={formData[field]?.toString() || ""}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, [field]: text }))
          }
          placeholder={label}
          keyboardType={options?.keyboardType || "default"}
          secureTextEntry={options?.secureTextEntry}
          className="flex-1 py-3 px-2 text-gray-800"
        />
      </View>
      {errors[field] && (
        <Text className="text-red-500 text-xs mt-1">{errors[field]}</Text>
      )}
    </View>
  );

  const renderPermissionPicker = (
    label: string,
    field: keyof SecretaryPermissions
  ) => (
    <View className="mb-4">
      <Text className="text-gray-700 font-medium mb-1">{label}</Text>
      <View className="bg-gray-50 rounded-lg border border-gray-200">
        <Picker
          selectedValue={formData.permissions?.[field] || "none"}
          onValueChange={(value) =>
            handlePermissionChange(field, value as AccessLevel)
          }
          style={{ height: 50 }}>
          <Picker.Item label="🚫 بدون وصول" value="none" />
          <Picker.Item label="👁️ عرض فقط" value="view" />
          <Picker.Item label="✏️ إدارة كاملة" value="manage" />
        </Picker>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-800">
                {isUpdate ? "تعديل السكرتير" : "إضافة سكرتير جديد"}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="bg-gray-100 p-2 rounded-full">
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
              {/* Error Message */}
              {errors.submit && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <Text className="text-red-600 text-center">
                    {errors.submit}
                  </Text>
                </View>
              )}

              {/* Names Section */}
              <Text className="text-lg font-bold text-gray-800 mb-3">
                📝 الأسماء
              </Text>
              {renderInput(
                "الاسم الأول",
                "firstName",
                <User size={18} color="#9ca3af" />,
                { required: true }
              )}
              {renderInput(
                "اسم الأب",
                "fatherName",
                <User size={18} color="#9ca3af" />
              )}
              {renderInput(
                "اسم الجد",
                "grandFatherName",
                <User size={18} color="#9ca3af" />
              )}
              {renderInput(
                "اسم العائلة",
                "lastName",
                <User size={18} color="#9ca3af" />,
                { required: true }
              )}
              {renderInput(
                "اسم الأم",
                "motherName",
                <User size={18} color="#9ca3af" />
              )}

              {/* Contact Section */}
              <Text className="text-lg font-bold text-gray-800 mb-3 mt-4">
                📞 معلومات الاتصال
              </Text>
              {renderInput(
                "البريد الإلكتروني",
                "email",
                <Mail size={18} color="#9ca3af" />,
                {
                  keyboardType: "email-address",
                  required: true,
                }
              )}
              {renderInput(
                "رقم الهاتف",
                "phoneNumber",
                <Phone size={18} color="#9ca3af" />,
                {
                  keyboardType: "phone-pad",
                  required: true,
                }
              )}
              {renderInput(
                "رقم الهوية",
                "idNumber",
                <User size={18} color="#9ca3af" />,
                {
                  keyboardType: "numeric",
                  required: true,
                }
              )}

              {/* Personal Data Section */}
              <Text className="text-lg font-bold text-gray-800 mb-3 mt-4">
                👤 البيانات الشخصية
              </Text>

              {/* Birth Date */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-1">
                  تاريخ الميلاد <Text className="text-red-500">*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200 px-3 py-3">
                  <Calendar size={18} color="#9ca3af" />
                  <Text className="flex-1 px-2 text-gray-800">
                    {formData.birthDate || "اختر تاريخ الميلاد"}
                  </Text>
                  {formData.birthDate && (
                    <Text className="text-gray-500 text-sm">
                      ({calculateAge(formData.birthDate)} سنة)
                    </Text>
                  )}
                </TouchableOpacity>
                {errors.birthDate && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.birthDate}
                  </Text>
                )}
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}

              {/* Gender */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-1">
                  الجنس <Text className="text-red-500">*</Text>
                </Text>
                <View className="bg-gray-50 rounded-lg border border-gray-200">
                  <Picker
                    selectedValue={formData.gender}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, gender: value }))
                    }
                    style={{ height: 50 }}>
                    <Picker.Item label="اختر الجنس" value={null} />
                    <Picker.Item label="ذكر" value="ذكر" />
                    <Picker.Item label="أنثى" value="أنثى" />
                  </Picker>
                </View>
                {errors.gender && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.gender}
                  </Text>
                )}
              </View>

              {renderInput(
                "مكان السكن",
                "residence",
                <MapPin size={18} color="#9ca3af" />,
                { required: true }
              )}

              {/* Password */}
              <Text className="text-lg font-bold text-gray-800 mb-3 mt-4">
                🔐 كلمة المرور
              </Text>
              {renderInput(
                isUpdate ? "كلمة المرور (اتركها فارغة للإبقاء)" : "كلمة المرور",
                "password",
                <Lock size={18} color="#9ca3af" />,
                {
                  secureTextEntry: true,
                  required: !isUpdate,
                }
              )}

              {/* Permissions Section */}
              <Text className="text-lg font-bold text-gray-800 mb-3 mt-4">
                🔑 الصلاحيات
              </Text>
              <View className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                <Text className="text-purple-700 text-sm text-center">
                  حدد صلاحيات السكرتير للوصول إلى أقسام النظام المختلفة
                </Text>
              </View>
              {renderPermissionPicker("صلاحية الطلاب", "studentsAccess")}
              {renderPermissionPicker("صلاحية المعلمين", "teachersAccess")}
              {renderPermissionPicker("صلاحية الحلقات", "groupsAccess")}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                className={`py-4 rounded-xl mt-4 mb-8 ${
                  isSubmitting ? "bg-purple-300" : "bg-purple-600"
                }`}>
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-bold text-lg">
                    {isUpdate ? "تحديث البيانات" : "إضافة السكرتير"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddSecretaryModal;
