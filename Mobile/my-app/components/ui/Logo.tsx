import React from "react";
import { View, Image, ActivityIndicator, StyleSheet } from "react-native";
import { Image as ImageIcon } from "lucide-react-native";

interface LogoProps {
  logoUrl: string | null;
  logoLoading: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  alt?: string;
  showGlow?: boolean;
  variant?: "default" | "header";
}

export const Logo: React.FC<LogoProps> = ({
  logoUrl,
  logoLoading,
  size = "lg",
  showGlow = true,
  variant = "default",
}) => {
  const sizeStyles = {
    sm: { width: 64, height: 64 },
    md: { width: 112, height: 112 },
    lg: { width: 192, height: 192 },
    xl: { width: 224, height: 224 },
  };

  const iconSizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
  };

  const containerStyle = [
    styles.container,
    variant === "header" ? styles.headerContainer : styles.defaultContainer,
    sizeStyles[size],
  ];

  return (
    <View style={styles.wrapper}>
      {/* Glow Effect */}
      {showGlow && variant !== "header" && <View style={styles.glow} />}

      {logoLoading ? (
        // Loading Skeleton
        <View style={[containerStyle, styles.loadingSkeleton]}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : logoUrl ? (
        // Logo Image
        <View style={containerStyle}>
          <Image
            source={{ uri: logoUrl }}
            style={[styles.image, sizeStyles[size]]}
            resizeMode="cover"
          />
        </View>
      ) : (
        // Fallback Icon
        <View style={[containerStyle, styles.defaultIcon]}>
          <ImageIcon size={iconSizes[size]} color="#10b981" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    top: -16,
    left: -16,
    right: -16,
    bottom: -16,
    backgroundColor: "#6ee7b7",
    borderRadius: 999,
    opacity: 0.3,
  },
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  defaultContainer: {
    borderRadius: 999,
    borderWidth: 4,
    borderColor: "rgba(16, 185, 129, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  headerContainer: {
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingSkeleton: {
    backgroundColor: "#e5e7eb",
  },
  defaultIcon: {
    backgroundColor: "#d1fae5",
  },
  image: {
    borderRadius: 999,
  },
});
