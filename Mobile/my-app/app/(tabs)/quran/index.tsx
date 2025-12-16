import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { Card } from "@/components/ui";
import { BookOpen, Search } from "lucide-react-native";
import { getAllSurahs, type Surah } from "@/Api/quranAudioApi";

const QuranPage = () => {
  const router = useRouter();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSurahs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSurahs(surahs);
    } else {
      const filtered = surahs.filter(
        (surah) =>
          surah.name.includes(searchQuery) ||
          surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          surah.number.toString().includes(searchQuery)
      );
      setFilteredSurahs(filtered);
    }
  }, [searchQuery, surahs]);

  const fetchSurahs = async () => {
    try {
      setLoading(true);
      const data = await getAllSurahs();
      setSurahs(data);
      setFilteredSurahs(data);
    } catch (error) {
      console.error("Error fetching surahs:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderSurahCard = ({ item }: { item: Surah }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        router.push({
          pathname: "/quran/[surahNumber]",
          params: { surahNumber: item.number },
        });
      }}>
      <Card style={styles.surahCard}>
        <View style={styles.surahNumber}>
          <Text style={styles.surahNumberText}>{item.number}</Text>
        </View>
        <View style={styles.surahInfo}>
          <Text style={styles.surahName}>{item.name}</Text>
          <Text style={styles.surahEnglishName}>{item.englishName}</Text>
          <Text style={styles.surahDetails}>
            {item.revelationType === "Meccan" ? "مكية" : "مدنية"} •{" "}
            {item.numberOfAyahs} آية
          </Text>
        </View>
        <View style={styles.iconContainer}>
          <BookOpen size={24} color="#059669" />
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>جاري تحميل سور القرآن الكريم...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader
        title="القرآن الكريم"
        subtitle="اقرأ واستمع وتدبر آيات الله في واجهة مريحة وجميلة ✨"
        icon={BookOpen}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن سورة..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Surahs List */}
      <FlatList
        data={filteredSurahs}
        renderItem={renderSurahCard}
        keyExtractor={(item) => item.number.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default QuranPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingTop: 24,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: "#1e293b",
    textAlign: "right",
  },
  listContainer: {
    paddingBottom: 24,
  },
  surahCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 16,
  },
  surahNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  surahNumberText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669",
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
    textAlign: "right",
  },
  surahEnglishName: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
    textAlign: "right",
  },
  surahDetails: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "right",
  },
  iconContainer: {
    marginLeft: 12,
  },
});
