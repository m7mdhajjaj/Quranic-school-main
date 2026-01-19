import React, { useState, memo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  showPasswordToggle?: boolean;
  required?: boolean;
  containerStyle?: ViewStyle;
}

const InputComponent: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  required,
  showPasswordToggle = false,
  secureTextEntry,
  value,
  containerStyle,
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  console.log('Input render:', { showPasswordToggle, value, secureTextEntry });

  const hasValue = Boolean(value);

  return (
    <View style={[fullWidth && styles.fullWidth, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <View
        style={[styles.inputContainer, error && styles.inputContainerError]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          value={value}
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            showPasswordToggle ? styles.inputWithPassword : undefined,
            style,
          ]}
          secureTextEntry={showPasswordToggle ? !showPassword : secureTextEntry}
          textAlign="right"
          placeholderTextColor="#9ca3af"
          {...props}
        />
        
        {/* Password Toggle - Always visible when showPasswordToggle is true */}
        {showPasswordToggle ? (
          <TouchableOpacity
            onPress={togglePassword}
            style={styles.eyeButton}
            activeOpacity={0.6}>
            {showPassword ? (
              <EyeOff size={24} color="#10b981" strokeWidth={2.5} />
            ) : (
              <Eye size={24} color="#10b981" strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIcon}>{rightIcon}</View>
        ) : null}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
};

export const Input = memo(InputComponent);

const styles = StyleSheet.create({
  fullWidth: {
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "right",
  },
  required: {
    color: "#ef4444",
  },
  inputContainer: {
    position: "relative",
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputContainerError: {
    borderColor: "#ef4444",
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: "#111827",
    textAlign: "right",
  },
  inputWithLeftIcon: {
    paddingLeft: 48,
  },
  inputWithPassword: {
    paddingRight: 60,
  },
  leftIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  rightIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    marginTop: -16,
    padding: 8,
    zIndex: 100,
  },
  passwordToggleWrapper: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    zIndex: 999,
  },
  passwordToggle: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: 6,
    textAlign: "right",
  },
  helperText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
    textAlign: "right",
  },
});
