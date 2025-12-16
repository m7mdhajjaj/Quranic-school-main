import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, RefreshControl } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { getHeroImage } from "@/Api/uploadApi";
import { HeroSection, VisionSection, ValuesSection } from "./components";
import { Footer } from "@/components/Layout";

const Home = () => {
  const { user: currentUser } = useAuth();

  // Hero Image State
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroImageLoading, setHeroImageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load Hero Image
  const fetchHeroImage = async () => {
    setHeroImageLoading(true);
    try {
      const data = await getHeroImage();
      if (data.success && data.url) {
        setHeroImage(data.url);
      }
    } catch (error) {
      console.error("Error fetching hero image:", error);
    } finally {
      setHeroImageLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroImage();
  }, []);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHeroImage();
    setRefreshing(false);
  };

  // Check if user is teacher or admin
  const isTeacherOrAdmin =
    currentUser?.role === "teacher" || currentUser?.role === "admin";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.innerContainer}>
        {/* Hero Section */}
        <HeroSection
          currentUser={currentUser}
          heroImage={heroImage}
          heroImageLoading={heroImageLoading}
          uploading={false}
          isTeacherOrAdmin={isTeacherOrAdmin}
        />

        {/* Vision Section */}
        <VisionSection />

        {/* Values Section */}
        <ValuesSection />
      </View>

      {/* Footer */}
      <Footer />
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    paddingBottom: 32,
  },
  innerContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
});
