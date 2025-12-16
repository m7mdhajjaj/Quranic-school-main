import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { Button, Input } from "@/components/ui";
import { LogIn, Info } from "lucide-react-native";

export interface LoginFormData {
  userId: string;
  password: string;
}

interface LoginFormProps {
  formData: LoginFormData;
  error: string;
  isLoading: boolean;
  rememberMe: boolean;
  onFormChange: (name: string, value: string) => void;
  onRememberMeChange: (checked: boolean) => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  error,
  isLoading,
  rememberMe,
  onFormChange,
  onRememberMeChange,
  onSubmit,
  onForgotPassword,
}) => {
  return (
    <View>
      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Login Form */}
      <View style={styles.form}>
        <Input
          label="رقم المستخدم"
          value={formData.userId}
          onChangeText={(value) => onFormChange("userId", value)}
          placeholder="أدخل رقم المستخدم"
          autoComplete="username"
          required
        />

        <Input
          label="كلمة المرور / رقم الهوية"
          value={formData.password}
          onChangeText={(value) => onFormChange("password", value)}
          placeholder="أدخل كلمة المرور أو رقم الهوية"
          autoComplete="password"
          secureTextEntry
          required
          showPasswordToggle={true}
        />

        {/* Remember Me & Forgot Password */}
        <View style={styles.optionsContainer}>
          <View style={styles.rememberMeContainer}>
            {/* Toggle Switch */}
            <Switch
              value={rememberMe}
              onValueChange={onRememberMeChange}
              trackColor={{ false: "#d1d5db", true: "#6ee7b7" }}
              thumbColor={rememberMe ? "#10b981" : "#f3f4f6"}
            />
            <Text style={styles.rememberMeText}>تذكرني</Text>

            {/* Info Icon with Tooltip */}
            <TouchableOpacity
              style={styles.infoButton}
              activeOpacity={0.7}
              onPress={() => {
                // يمكن إضافة modal أو tooltip هنا
              }}>
              <Info size={14} color="#10b981" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onForgotPassword} activeOpacity={0.7}>
            <Text style={styles.forgotPasswordText}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <Button
          variant="primary"
          size="md"
          fullWidth
          loading={isLoading}
          gradient={true}
          leftIcon={!isLoading && <LogIn size={16} color="#fff" />}
          onPress={onSubmit}
          disabled={isLoading}>
          {isLoading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#991b1b",
    fontSize: 14,
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  optionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rememberMeText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  infoButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#d1fae5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    alignItems: "center",
    justifyContent: "center",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "600",
  },
});
