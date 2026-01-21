import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { Card } from "@/components/ui";
import { Music, Play, Pause, Volume2 } from "lucide-react-native";
import {
  getAllSurahs,
  getReciters,
  type Surah,
  type Reciter,
} from "@/Api/quranAudioApi";
import { Audio } from "expo-av";
import { AudioControlBar } from "@/components/quran-audio";

const QuranAudio = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [reciters] = useState<Reciter[]>(getReciters());
  const [selectedReciter, setSelectedReciter] = useState<string>("ar.alafasy");
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    fetchSurahs();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const fetchSurahs = async () => {
    try {
      setLoading(true);
      const data = await getAllSurahs();
      setSurahs(data);
    } catch (error) {
      console.error("Error fetching surahs:", error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (surah: Surah) => {
    try {
      // Stop current audio if playing
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      const reciter = reciters.find((r) => r.code === selectedReciter);
      if (!reciter) return;

      const surahNumber = surah.number.toString().padStart(3, "0");
      const audioUrl = `${reciter.baseUrls[0]}${surahNumber}.mp3`;

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
      );

      setSound(newSound);
      setSelectedSurah(surah);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resumeAudio = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  // Handle play/pause toggle for AudioControlBar
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  }, [isPlaying, sound]);

  // Get current reciter name
  const currentReciterName =
    reciters.find((r) => r.code === selectedReciter)?.name || "";

  const renderReciterCard = ({ item }: { item: Reciter }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setSelectedReciter(item.code)}>
      <View
        style={
          selectedReciter === item.code
            ? [styles.reciterCard, styles.reciterCardActive]
            : styles.reciterCard
        }>
        <View style={styles.reciterContent}>
          <Volume2
            size={20}
            color={selectedReciter === item.code ? "#059669" : "#64748b"}
          />
          <Text
            style={[
              styles.reciterName,
              selectedReciter === item.code && styles.reciterNameActive,
            ]}>
            {item.name}
          </Text>
          {selectedReciter === item.code && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>✓</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSurahCard = ({ item }: { item: Surah }) => {
    const isCurrentlyPlaying =
      selectedSurah?.number === item.number && isPlaying;

    const handlePlayPause = () => {
      if (isCurrentlyPlaying) {
        pauseAudio();
      } else if (selectedSurah?.number === item.number) {
        resumeAudio();
      } else {
        playAudio(item);
      }
    };

    return (
      <View
        style={
          selectedSurah?.number === item.number
            ? [styles.surahCard, styles.surahCardActive]
            : styles.surahCard
        }>
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
        <TouchableOpacity
          onPress={handlePlayPause}
          activeOpacity={0.7}
          style={[
            styles.playButton,
            isCurrentlyPlaying && styles.playButtonActive,
          ]}>
          {isCurrentlyPlaying ? (
            <Pause size={24} color="#ffffff" />
          ) : (
            <Play size={24} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>جاري تحميل القرآن الكريم...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PageHeader
        title="القرآن الكريم - صوتي"
        subtitle="استمع إلى القرآن الكريم بأصوات القراء المشهورين 🎧"
        icon={Music}
      />

      {/* Reciters Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>اختر القارئ المفضل</Text>
        <FlatList
          data={reciters}
          renderItem={renderReciterCard}
          keyExtractor={(item) => item.code}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recitersContainer}
        />
      </View>

      {/* Surahs List */}
      <FlatList
        data={surahs}
        renderItem={renderSurahCard}
        keyExtractor={(item) => item.number.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* 🎵 Audio Control Bar */}
      <AudioControlBar
        sound={sound}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        surahName={selectedSurah?.name}
        reciterName={currentReciterName}
      />
    </View>
  );
};

export default QuranAudio;

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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "right",
  },
  recitersContainer: {
    paddingRight: 4,
  },
  reciterCard: {
    marginRight: 12,
    minWidth: 150,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  reciterCardActive: {
    borderWidth: 2,
    borderColor: "#059669",
    backgroundColor: "#d1fae5",
  },
  reciterContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reciterName: {
    fontSize: 14,
    color: "#64748b",
    flex: 1,
    textAlign: "right",
  },
  reciterNameActive: {
    color: "#059669",
    fontWeight: "600",
  },
  selectedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 160, // Space for AudioControlBar
  },
  surahCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  surahCardActive: {
    borderWidth: 2,
    borderColor: "#059669",
    backgroundColor: "#ecfdf5",
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
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  playButtonActive: {
    backgroundColor: "#dc2626",
  },
});
