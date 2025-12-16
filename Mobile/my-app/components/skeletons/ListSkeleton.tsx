import React from "react";
import { View, StyleSheet } from "react-native";

interface ListSkeletonProps {
  count?: number;
  showAvatar?: boolean;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  count = 5,
  showAvatar = true,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.item}>
          <View style={styles.medal} />

          {showAvatar && <View style={styles.avatar} />}

          <View style={styles.content}>
            <View style={styles.title} />
            <View style={styles.subtitle} />
          </View>

          <View style={styles.badge}>
            <View style={styles.badgeIcon} />
            <View style={styles.badgeValue} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  medal: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#d1d5db",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#d1d5db",
  },
  content: {
    flex: 1,
    gap: 8,
  },
  title: {
    height: 20,
    backgroundColor: "#d1d5db",
    borderRadius: 4,
    width: 128,
  },
  subtitle: {
    height: 14,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: 80,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  badgeIcon: {
    width: 16,
    height: 16,
    backgroundColor: "#d1d5db",
    borderRadius: 4,
  },
  badgeValue: {
    width: 32,
    height: 20,
    backgroundColor: "#d1d5db",
    borderRadius: 4,
  },
});

export default ListSkeleton;
