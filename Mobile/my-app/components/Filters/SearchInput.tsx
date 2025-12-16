import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Search, X } from "lucide-react-native";

interface SearchInputProps extends TextInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  showClearButton?: boolean;
  size?: "sm" | "md" | "lg";
  containerStyle?: any;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = "ابحث...",
  showClearButton = true,
  size = "md",
  containerStyle,
  ...props
}) => {
  const handleClear = () => {
    onChangeText("");
  };

  const sizeStyles = {
    sm: { paddingVertical: 8, fontSize: 14 },
    md: { paddingVertical: 12, fontSize: 16 },
    lg: { paddingVertical: 16, fontSize: 18 },
  };

  const iconSizes = {
    sm: 18,
    md: 20,
    lg: 22,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Search Icon */}
      <View style={styles.searchIcon}>
        <Search size={iconSizes[size]} color="#10b981" />
      </View>

      {/* Input Field */}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, sizeStyles[size]]}
        textAlign="right"
        placeholderTextColor="#9ca3af"
        {...props}
      />

      {/* Clear Button */}
      {showClearButton && value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          activeOpacity={0.7}>
          <X size={iconSizes[size]} color="#6b7280" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  searchIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  input: {
    width: "100%",
    paddingRight: 48,
    paddingLeft: 48,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  clearButton: {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
    padding: 4,
    zIndex: 1,
  },
});
