import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useNextPrayer, usePrayerTimes } from "./hooks";
import {
  DateCard,
  InfoNote,
  NextPrayerCard,
  PageHeader,
  PrayerCard,
} from "./components";

const PrayerTimes = () => {
  const { prayerTimes, loading, currentDate, hijriDate } = usePrayerTimes();
  const nextPrayer = useNextPrayer(prayerTimes);

  const Container = Platform.OS === "web" ? View : ScrollView;
  const containerProps =
    Platform.OS === "web"
      ? { style: styles.content }
      : {
          style: styles.scroll,
          contentContainerStyle: styles.content,
          showsVerticalScrollIndicator: false,
        };

  if (loading) {
    return (
      <LinearGradient
        colors={["#f0fdf4", "#ecfeff", "#f8fafc"]}
        style={Platform.OS === "web" ? styles.webGradient : styles.gradient}>
        <View style={styles.loadingBox}>
          <ActivityIndicator />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#f0fdf4", "#ecfeff", "#f8fafc"]}
      style={Platform.OS === "web" ? styles.webGradient : styles.gradient}>
      <Container {...(containerProps as any)}>
        <View style={styles.stack}>
          {/* Header */}
          <PageHeader />

          {/* التاريخ */}
          <DateCard currentDate={currentDate} hijriDate={hijriDate} />

          {/* الصلاة القادمة */}
          {nextPrayer && <NextPrayerCard nextPrayer={nextPrayer} />}

          {/* مواقيت الصلاة */}
          <View style={styles.stack}>
            {prayerTimes.map((prayer, index) => (
              <PrayerCard key={`${prayer.name}-${index}`} prayer={prayer} />
            ))}
          </View>

          {/* ملاحظة */}
          <InfoNote />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>🕋 حافظ على صلاتك في أوقاتها</Text>
            <Text style={styles.footerSubText}>
              البيانات مقدمة من API Aladhan
            </Text>
          </View>
        </View>
      </Container>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  webGradient: {
    width: "100%",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  stack: {
    gap: 14,
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4b5563",
    textAlign: "center",
  },
  footerSubText: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    color: "#6b7280",
    textAlign: "center",
  },
});

export default PrayerTimes;
