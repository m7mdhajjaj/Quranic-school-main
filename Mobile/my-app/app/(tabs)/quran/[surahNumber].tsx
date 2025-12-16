import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getSurah, type SurahData } from "@/Api/quranAudioApi";
import { ArrowRight, Minus, Plus } from "lucide-react-native";
import { Card } from "@/components/ui";

const SurahReader = () => {
  const { surahNumber } = useLocalSearchParams();
  const router = useRouter();
  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(20);

  useEffect(() => {
    if (surahNumber) {
      fetchSurah();
    }
  }, [surahNumber]);

  const fetchSurah = async () => {
    try {
      setLoading(true);
      const data = await getSurah(Number(surahNumber));
      setSurahData(data);
    } catch (error) {
      console.error("Error fetching surah:", error);
    } finally {
      setLoading(false);
    }
  };

  const increaseFontSize = () => {
    if (fontSize < 32) {
      setFontSize(fontSize + 2);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 16) {
      setFontSize(fontSize - 2);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>جاري تحميل السورة...</Text>
      </View>
    );
  }

  if (!surahData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>حدث خطأ في تحميل السورة</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}>
          <ArrowRight size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{surahData.name}</Text>
          <Text style={styles.headerSubtitle}>
            {surahData.englishName} • {surahData.numberOfAyahs} آية
          </Text>
        </View>
      </View>

      {/* Font Size Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={decreaseFontSize}
          style={styles.controlButton}
          activeOpacity={0.7}>
          <Minus size={20} color="#059669" />
        </TouchableOpacity>
        <Text style={styles.fontSizeText}>حجم الخط: {fontSize}</Text>
        <TouchableOpacity
          onPress={increaseFontSize}
          style={styles.controlButton}
          activeOpacity={0.7}>
          <Plus size={20} color="#059669" />
        </TouchableOpacity>
      </View>

      {/* Ayahs - Page Style */}
      <ScrollView
        style={styles.ayahsContainer}
        contentContainerStyle={styles.ayahsContent}
        showsVerticalScrollIndicator={false}>
        <Card style={styles.pageCard}>
          <Text
            style={[styles.pageText, { fontSize, lineHeight: fontSize * 2 }]}>
            {surahData.ayahs.map((ayah, index) => (
              <Text key={ayah.number}>
                <Text style={styles.ayahTextInline}>{ayah.text}</Text>
                <Text style={styles.ayahNumberInline}>
                  {" "}
                  ﴿{ayah.numberInSurah}﴾{" "}
                </Text>
              </Text>
            ))}
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

export default SurahReader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
  errorContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
  },
  header: {
    backgroundColor: "#10b981",
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "right",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "right",
    marginTop: 4,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
  },
  fontSizeText: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "600",
  },
  ayahsContainer: {
    flex: 1,
    backgroundColor: "#fffef7",
  },
  ayahsContent: {
    flexGrow: 1,
  },
  pageCard: {
    backgroundColor: "#fffef7",
    padding: 24,
    minHeight: "100%",
    borderWidth: 0,
  },
  pageText: {
    color: "#1e293b",
    textAlign: "right",
    writingDirection: "rtl",
  },
  ayahTextInline: {
    color: "#1e293b",
  },
  ayahNumberInline: {
    color: "#059669",
    fontWeight: "bold",
    fontSize: 16,
  },
});
