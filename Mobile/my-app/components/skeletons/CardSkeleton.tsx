import React from "react";
import { View, StyleSheet } from "react-native";

interface CardSkeletonProps {
  hasImage?: boolean;
  contentLines?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  hasImage = true,
  contentLines = 3,
}) => {
  return (
    <View style={styles.container}>
      {hasImage && <View style={styles.image} />}

      <View style={styles.content}>
        {hasImage ? (
          <>
            <View style={styles.header}>
              <View style={styles.headerItem1} />
              <View style={styles.headerItem2} />
            </View>

            <View style={styles.title} />

            <View style={styles.lines}>
              {Array.from({ length: contentLines }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.line,
                    i === contentLines - 1 && styles.lineShort,
                  ]}
                />
              ))}
            </View>

            <View style={styles.button} />
          </>
        ) : (
          <>
            <View style={styles.avatarRow}>
              <View style={styles.avatar} />
              <View style={styles.avatarText}>
                <View style={styles.avatarTextLine1} />
                <View style={styles.avatarTextLine2} />
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    height: 200,
    backgroundColor: "#e5e7eb",
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerItem1: {
    width: 80,
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
  headerItem2: {
    width: 96,
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
  title: {
    height: 28,
    backgroundColor: "#d1d5db",
    borderRadius: 4,
    marginBottom: 16,
    width: "90%",
  },
  lines: {
    gap: 8,
  },
  line: {
    height: 16,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
  lineShort: {
    width: "66%",
  },
  button: {
    marginTop: 16,
    height: 40,
    width: 128,
    backgroundColor: "#a7f3d0",
    borderRadius: 12,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#d1d5db",
  },
  avatarText: {
    flex: 1,
    gap: 8,
  },
  avatarTextLine1: {
    height: 16,
    backgroundColor: "#d1d5db",
    borderRadius: 4,
    width: "60%",
  },
  avatarTextLine2: {
    height: 14,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    width: "40%",
  },
});
