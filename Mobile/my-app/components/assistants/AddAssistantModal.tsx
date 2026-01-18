// ============================================================================
// AddAssistantModal - نموذج إضافة/تعديل مساعد
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
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  createTeacherAssistant,
  updateTeacherAssistant,
  checkDuplicate,
  getNextAssistantId,
  type TeacherAssistant,
  type TeacherAssistantFormData,
} from "@/Api/teacherAssistantApi";

interface AddAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assistant?: TeacherAssistant;
}

export const AddAssistantModal: React.FC<AddAssistantModalProps> = ({
  visible,
  onClose,
  onSuccess,
  assistant,
}) => {
  const isEditMode = !!assistant;

  // Form State
  const [formData, setFormData] = useState<TeacherAssistantFormData>({
    firstName: "",
    fatherName: "",
    grandFatherName: "",
    lastName: "",
    motherName: "",
    idNumber: "",
    email: "",
    phoneNumber: "",
    password: "",
    birthDate: "",
    gender: "ذكر",
    residence: "",
    allowedGroups: [],
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load data when editing
  useEffect(() => {
    if (visible && assistant) {
      setFormData({
        firstName: assistant.firstName || "",
        fatherName: assistant.fatherName || "",
        grandFatherName: assistant.grandFatherName || "",
        lastName: assistant.lastName || "",
        motherName: assistant.motherName || "",
        idNumber: assistant.idNumber || "",
        email: assistant.email || "",
        phoneNumber: assistant.phoneNumber || "",
        password: "",
        birthDate: assistant.birthDate || "",
        gender: assistant.gender || "ذكر",
        residence: assistant.residence || "",
        allowedGroups: assistant.allowedGroups || [],
        assistantId: assistant.assistantId,
      });
    } else if (visible && !assistant) {
      // Get next assistant ID for new assistant
      getNextAssistantId().then((response) => {
        if (response.success && response.data) {
          setFormData((prev) => ({ ...prev, assistantId: response.data }));
        }
      });
    }
  }, [visible, assistant]);

  // Reset form when closed
  useEffect(() => {
    if (!visible) {
      setFormData({
        firstName: "",
        fatherName: "",
        grandFatherName: "",
        lastName: "",
        motherName: "",
        idNumber: "",
        email: "",
        phoneNumber: "",
        password: "",
        birthDate: "",
        gender: "ذكر",
        residence: "",
        allowedGroups: [],
      });
      setErrors({});
    }
  }, [visible]);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName?.trim())
      newErrors.firstName = "الاسم الأول مطلوب";
    if (!formData.fatherName?.trim())
      newErrors.fatherName = "اسم الأب مطلوب";
    if (!formData.lastName?.trim())
      newErrors.lastName = "اسم العائلة مطلوب";
    if (!formData.idNumber?.trim())
      newErrors.idNumber = "رقم الهوية مطلوب";
    else if (formData.idNumber.length !== 9)
      newErrors.idNumber = "رقم الهوية يجب أن يكون 9 أرقام";
    if (!formData.email?.trim()) newErrors.email = "البريد الإلكتروني مطلوب";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "البريد الإلكتروني غير صالح";
    if (!formData.phoneNumber?.trim())
      newErrors.phoneNumber = "رقم الهاتف مطلوب";
    else if (!/^05\d{8}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";
    if (!isEditMode && !formData.password)
      newErrors.password = "كلمة المرور مطلوبة";
    else if (formData.password && formData.password.length < 6)
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    if (!formData.birthDate) newErrors.birthDate = "تاريخ الميلاد مطلوب";
    if (!formData.residence?.trim())
      newErrors.residence = "مكان السكن مطلوب";

    // Check age
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.birthDate = "يجب أن يكون العمر 18 سنة على الأقل";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("خطأ", "الرجاء تصحيح الأخطاء في النموذج");
      return;
    }

    setLoading(true);

    try {
      // Check for duplicates
      const duplicateCheck = await checkDuplicate({
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        idNumber: formData.idNumber,
        excludeId: isEditMode ? assistant?._id : undefined,
      });

      if (duplicateCheck.isDuplicate) {
        Alert.alert("خطأ", duplicateCheck.message || "البيانات موجودة مسبقاً");
        setLoading(false);
        return;
      }

      let response;
      if (isEditMode && assistant) {
        response = await updateTeacherAssistant(assistant._id, formData);
      } else {
        response = await createTeacherAssistant(formData);
      }

      if (response.success) {
        Alert.alert(
          "نجح",
          isEditMode
            ? "تم تحديث بيانات المساعد بنجاح"
            : "تم إضافة المساعد بنجاح"
        );
        onSuccess();
        onClose();
      } else {
        Alert.alert("خطأ", response.message || "فشلت العملية");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Alert.alert("خطأ", "حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      handleChange("birthDate", formattedDate);
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
          <View className="bg-gradient-to-l from-purple-600 to-indigo-600 rounded-t-3xl p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-xl font-bold flex-1">
                {isEditMode ? "تعديل مساعد" : "إضافة مساعد جديد"}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="bg-white/20 rounded-lg p-2">
                <Text className="text-white text-lg">✕</Text>
              </TouchableOpacity>
            </View>
            {isEditMode && assistant && (
              <Text className="text-white/80 text-sm mt-1">
                {assistant.firstName} {assistant.lastName}
              </Text>
            )}
          </View>

          {/* Form */}
          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            {/* الأسماء */}
            <View className="bg-purple-50 rounded-2xl p-4 mb-4 border border-purple-200">
              <Text className="text-purple-700 font-bold text-base mb-3">
                👤 الأسماء
              </Text>

              <View className="space-y-3">
                <View>
                  <Text className="text-gray-700 text-sm mb-1">
                    الاسم الأول *
                  </Text>
                  <TextInput
                    value={formData.firstName}
                    onChangeText={(text) => handleChange("firstName", text)}
                    placeholder="أدخل الاسم الأول"
                    className={`bg-white border-2 rounded-xl px-4 py-3 ${
                      errors.firstName ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {errors.firstName && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.firstName}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-gray-700 text-sm mb-1">
                    اسم الأب *
                  </Text>
                  <TextInput
                    value={formData.fatherName}
                    onChangeText={(text) => handleChange("fatherName", text)}
                    placeholder="أدخل اسم الأب"
                    className={`bg-white border-2 rounded-xl px-4 py-3 ${
                      errors.fatherName ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {errors.fatherName && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.fatherName}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-gray-700 text-sm mb-1">اسم الجد</Text>
                  <TextInput
                    value={formData.grandFatherName}
                    onChangeText={(text) =>
                      handleChange("grandFatherName", text)
                    }
                    placeholder="أدخل اسم الجد (اختياري)"
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3"
                  />
                </View>

                <View>
                  <Text className="text-gray-700 text-sm mb-1">
                    اسم العائلة *
                  </Text>
                  <TextInput
                    value={formData.lastName}
                    onChangeText={(text) => handleChange("lastName", text)}
                    placeholder="أدخل اسم العائلة"
                    className={`bg-white border-2 rounded-xl px-4 py-3 ${
                      errors.lastName ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {errors.lastName && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.lastName}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-gray-700 text-sm mb-1">اسم الأم</Text>
                  <TextInput
                    value={formData.motherName}
                    onChangeText={(text) => handleChange("motherName", text)}
                    placeholder="أدخل اسم الأم (اختياري)"
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3"
                  />
                </View>
              </View>
            </View>

            {/* بيانات الهوية والتواصل */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-200">
              <Text className="text-blue-700 font-bold text-base mb-3">
                💳 بيانات الهوية والتواصل
              </Text>

              <View className="space-y-3">
                {!isEditMode && (
                  <View>
                    <Text className="text-gray-700 text-sm mb-1">
                      رقم المساعد
                    </Text>
                    <TextInput
                      value={formData.assistantId?.toString() || ""}
                      editable={false}
                      placeholder="يتم توليده تلقائياً"
                      className="bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-500"
                    />
                  </View>
                )}

                <View>
                  <Text className="text-gray-700 text-sm mb-1">
                    رقم الهوية *
                  </Text>
                  <TextInput
                    value={formData.idNumber}
                    onChangeText={(text) => handleChange("idNumber", text)}
                    placeholder="أدخل رقم الهوية (9 أرقام)"
                    keyboardType="numeric"
                    maxLength={9}
                    className={`bg-white border-2 rounded-xl px-4 py-3 ${
                      errors.idNumber ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {errors.idNumber && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.idNumber}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-gray-700 text-sm mb-1">
                    📧 البريد الإلكتروني *
                  </Text>
                  <TextInput
                    value={formData.email}
                    onChangeText={(text) => handleChange("email", text)}
                    placeholder="example@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={`bg-white border-2 rounded-xl px-4 py-3 ${
                      errors.email ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {errors.email && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.email}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-gray-700 text-sm mb-1">
                    📱 رقم الهاتف *
                  </Text>
                  <TextInput
                    value={formData.phoneNumber}
                    onChangeText={(text) => handleChange("phoneNumber", text)}
                    placeholder="05XXXXXXXX"
                    keyboardType="phone-pad"
                    maxLength={10}
                    className={`bg-white border-2 rounded-xl px-4 py-3 ${
                      errors.phoneNumber ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {errors.phoneNumber && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.phoneNumber}
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="text-gray-700 text-sm mb-1">
                    🔒 كلمة المرور {!isEditMode && "*"}
                  </Text>
                  <View className="relative">
                    <TextInput
                      value={formData.password}
                      onChangeText={(text) => handleChange("password", text)}
                      placeholder={
                        isEditMode
                          ? "اتركها فارغة للإبقاء على الحالية"
                          : "أدخل كلمة المرور"
                      }
                      secureTextEntry={!showPassword}
                      className={`bg-white border-2 rounded-xl px-4 py-3 pr-12 ${
                        errors.password ? "border-red-400" : "border-gray-200"
                      }`}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Text className="text-gray-400 text-lg">
                        {showPassword ? "👁️" : "🙈"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* البيانات الشخصية */}
            <View className="bg-amber-50 rounded-2xl p-4 mb-4 border border-amber-200">
              <Text className="text-amber-700 font-bold text-base mb-3">
                📅 البيانات الشخصية
              </Text>

              <View className="space-y-3">
                <View>
                  <Text className="text-gray-700 text-sm mb-1">
                    تاريخ الميلاد *
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className={`bg-white border-2 rounded-xl px-4 py-3 ${
                      errors.birthDate ? "border-red-400" : "border-gray-200"
                    }`}>
                    <Text
                      className={
                        formData.birthDate ? "text-gray-800" : "text-gray-400"
                      }>
                      {formData.birthDate || "اختر تاريخ الميلاد"}
                    </Text>
                  </TouchableOpacity>
                  {errors.birthDate && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.birthDate}
                    </Text>
                  )}
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    value={
                      formData.birthDate
                        ? new Date(formData.birthDate)
                        : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                  />
                )}

                <View>
                  <Text className="text-gray-700 text-sm mb-2">الجنس *</Text>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => handleChange("gender", "ذكر")}
                      className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border-2 ${
                        formData.gender === "ذكر"
                          ? "bg-blue-50 border-blue-400"
                          : "bg-white border-gray-200"
                      }`}>
                      <Text className="text-lg">👨</Text>
                      <Text
                        className={
                          formData.gender === "ذكر"
                            ? "text-blue-700 font-semibold"
                            : "text-gray-600"
                        }>
                        ذكر
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleChange("gender", "أنثى")}
                      className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border-2 ${
                        formData.gender === "أنثى"
                          ? "bg-pink-50 border-pink-400"
                          : "bg-white border-gray-200"
                      }`}>
                      <Text className="text-lg">👩</Text>
                      <Text
                        className={
                          formData.gender === "أنثى"
                            ? "text-pink-700 font-semibold"
                            : "text-gray-600"
                        }>
                        أنثى
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View>
                  <Text className="text-gray-700 text-sm mb-1">
                    📍 مكان السكن *
                  </Text>
                  <TextInput
                    value={formData.residence}
                    onChangeText={(text) => handleChange("residence", text)}
                    placeholder="أدخل مكان السكن"
                    className={`bg-white border-2 rounded-xl px-4 py-3 ${
                      errors.residence ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {errors.residence && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.residence}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3 mt-6 mb-4">
              <TouchableOpacity
                onPress={onClose}
                disabled={loading}
                className="flex-1 bg-gray-200 rounded-xl py-4">
                <Text className="text-gray-700 font-bold text-center">
                  إلغاء
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-500 rounded-xl py-4">
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-center">
                    {isEditMode ? "تحديث" : "إضافة"}
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
