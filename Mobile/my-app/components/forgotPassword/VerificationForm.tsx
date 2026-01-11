import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DatePicker } from "./DatePicker";
import type {
  ForgotPasswordFormData,
  FieldErrors,
} from "../../types/forgotPassword.types";

interface VerificationFormProps {
  formData: ForgotPasswordFormData;
  fieldErrors: FieldErrors;
  error: string;
  isLoading: boolean;
  onChange: (field: keyof ForgotPasswordFormData, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({
  formData,
  fieldErrors,
  error,
  isLoading,
  onChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      {/* Info Alert */}
      <View style={styles.infoAlert}>
        <Ionicons name="information-circle" size={20} color="#3B82F6" />
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>معلومة هامة</Text>
          <Text style={styles.infoText}>
            الرجاء إدخال بياناتك الشخصية بدقة كما هي مسجلة في النظام للتحقق من
            هويتك
          </Text>
        </View>
      </View>

      {/* Error Alert */}
      {error && (
        <View style={styles.errorAlert}>
          <Ionicons name="alert-circle" size={20} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Form Fields */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>الاسم الأول</Text>
        <TextInput
          style={[styles.input, fieldErrors.firstName && styles.inputError]}
          value={formData.firstName}
          onChangeText={(text) => onChange("firstName", text)}
          placeholder="أدخل الاسم الأول"
          placeholderTextColor="#9CA3AF"
          textAlign="right"
        />
        {fieldErrors.firstName && (
          <Text style={styles.fieldError}>{fieldErrors.firstName}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>اسم الأب</Text>
        <TextInput
          style={[styles.input, fieldErrors.fatherName && styles.inputError]}
          value={formData.fatherName}
          onChangeText={(text) => onChange("fatherName", text)}
          placeholder="أدخل اسم الأب"
          placeholderTextColor="#9CA3AF"
          textAlign="right"
        />
        {fieldErrors.fatherName && (
          <Text style={styles.fieldError}>{fieldErrors.fatherName}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>اسم الجد</Text>
        <TextInput
          style={[
            styles.input,
            fieldErrors.grandFatherName && styles.inputError,
          ]}
          value={formData.grandFatherName}
          onChangeText={(text) => onChange("grandFatherName", text)}
          placeholder="أدخل اسم الجد"
          placeholderTextColor="#9CA3AF"
          textAlign="right"
        />
        {fieldErrors.grandFatherName && (
          <Text style={styles.fieldError}>{fieldErrors.grandFatherName}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>اسم العائلة</Text>
        <TextInput
          style={[styles.input, fieldErrors.lastName && styles.inputError]}
          value={formData.lastName}
          onChangeText={(text) => onChange("lastName", text)}
          placeholder="أدخل اسم العائلة"
          placeholderTextColor="#9CA3AF"
          textAlign="right"
        />
        {fieldErrors.lastName && (
          <Text style={styles.fieldError}>{fieldErrors.lastName}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>اسم الأم</Text>
        <TextInput
          style={[styles.input, fieldErrors.motherName && styles.inputError]}
          value={formData.motherName}
          onChangeText={(text) => onChange("motherName", text)}
          placeholder="أدخل اسم الأم"
          placeholderTextColor="#9CA3AF"
          textAlign="right"
        />
        {fieldErrors.motherName && (
          <Text style={styles.fieldError}>{fieldErrors.motherName}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>رقم الهوية</Text>
        <TextInput
          style={[styles.input, fieldErrors.idNumber && styles.inputError]}
          value={formData.idNumber}
          onChangeText={(text) => onChange("idNumber", text)}
          placeholder="أدخل رقم الهوية (9 أرقام)"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          maxLength={9}
          textAlign="right"
        />
        {fieldErrors.idNumber && (
          <Text style={styles.fieldError}>{fieldErrors.idNumber}</Text>
        )}
      </View>

      <DatePicker
        label="تاريخ الميلاد"
        value={formData.birthDate}
        onChange={(date) => onChange("birthDate", date)}
        error={fieldErrors.birthDate}
      />

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={isLoading}>
          <Text style={styles.cancelButtonText}>إلغاء</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={onSubmit}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>التحقق من الهوية</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  infoAlert: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
    textAlign: "right",
  },
  infoText: {
    fontSize: 11,
    color: "#3B82F6",
    textAlign: "right",
  },
  errorAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: "#EF4444",
    textAlign: "right",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "right",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#1F2937",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  fieldError: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
    textAlign: "right",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  submitButton: {
    flex: 2,
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
