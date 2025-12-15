import React from "react";
import { StyleSheet, Text, View } from "react-native";

const InfoNote = () => {
  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Text style={styles.icon}>ℹ️</Text>
        <View style={styles.textWrap}>
          <Text style={styles.title}>ملاحظة</Text>
          <Text style={styles.text}>
            المواقيت المعروضة خاصة بمدينة نابلس، فلسطين. يتم تحديث المواقيت
            تلقائياً كل يوم.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "#d1fae5",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  icon: {
    fontSize: 22,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    textAlign: "right",
    marginBottom: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669",
    textAlign: "right",
    lineHeight: 18,
  },
});

export default InfoNote;
