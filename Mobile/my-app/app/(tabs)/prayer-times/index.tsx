import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { usePrayerTimes, useNextPrayer } from "./hooks";
import { DateCard, NextPrayerCard, PrayerCard, InfoNote } from "./components";
import { Home } from "lucide-react-native";

const PrayerTimes = () => {
  const { prayerTimes, loading, currentDate, hijriDate } = usePrayerTimes();
  const nextPrayer = useNextPrayer(prayerTimes);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>جاري تحميل مواقيت الصلاة...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      {/* Header */}
      <PageHeader
        title="مواقيت الصلاة"
        subtitle="نابلس، فلسطين 🇵🇸"
        icon={Home}
      />

      {/* التاريخ */}
      <View style={styles.section}>
        <DateCard currentDate={currentDate} hijriDate={hijriDate} />
      </View>

      {/* الصلاة القادمة */}
      {nextPrayer && (
        <View style={styles.section}>
          <NextPrayerCard nextPrayer={nextPrayer} />
        </View>
      )}

      {/* مواقيت الصلاة */}
      <View style={styles.prayerTimesGrid}>
        {prayerTimes.map((prayer, index) => (
          <PrayerCard key={index} prayer={prayer} />
        ))}
      </View>

      {/* ملاحظة */}
      <View style={styles.section}>
        <InfoNote />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>🕋 حافظ على صلاتك في أوقاتها</Text>
        <Text style={styles.footerSubText}>البيانات مقدمة من API Aladhan</Text>
      </View>
    </ScrollView>
  );
};

export default PrayerTimes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
  },
  section: {
    marginBottom: 24,
  },
  prayerTimesGrid: {
    marginBottom: 24,
  },
  footer: {
    alignItems: "center",
    marginTop: 16,
  },
  footerText: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 8,
  },
  footerSubText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
});
