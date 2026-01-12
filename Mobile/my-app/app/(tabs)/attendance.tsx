import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PageHeader } from "@/components/PageHeader/PageHeader";

export default function AttendanceScreen() {
  return (
    <View style={styles.container}>
      <PageHeader title="الحضور والغياب" showBackButton={false} />
      <View style={styles.content}>
        <Text style={styles.title}>شاشة الحضور والغياب</Text>
        <Text style={styles.subtitle}>قريباً سيتم إضافة محتوى هذه الشاشة</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
});
