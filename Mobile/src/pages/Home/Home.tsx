import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../Context";
import { getHeroImage, uploadHeroImage } from "../../Api/uploadApi";
import { HeroSection, ValuesSection, VisionSection } from "./components/index";
import { UserHeader } from "../../components/Layout/User/Header";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const Home = () => {
  const { user: currentUser } = useAuth();

  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroImageLoading, setHeroImageLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const isTeacherOrAdmin = useMemo(() => {
    return currentUser?.role === "teacher" || currentUser?.role === "admin";
  }, [currentUser?.role]);

  const fetchHeroImage = useCallback(async () => {
    setHeroImageLoading(true);
    try {
      const data = await getHeroImage();
      if (data?.success && data?.url) {
        setHeroImage(data.url);
      }
    } catch (error) {
      console.error("Error fetching hero image:", error);
    } finally {
      setHeroImageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroImage();
  }, [fetchHeroImage]);

  const handleStartJourney = () => {
    Alert.alert("قريباً", "هذه الميزة ستكون متاحة قريباً إن شاء الله");
  };

  const handlePickAndUploadHeroImage = async () => {
    if (!isTeacherOrAdmin) return;
    if (uploading) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "صلاحيات مطلوبة",
        "يرجى السماح بالوصول للصور لاختيار صورة الهيرو"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE_BYTES) {
      Alert.alert(
        "خطأ في حجم الملف",
        "حجم الصورة يجب أن يكون أقل من 5 ميجابايت"
      );
      return;
    }

    setUploading(true);
    try {
      const name = asset.fileName || "hero.jpg";
      const type = asset.mimeType || "image/jpeg";

      const data = await uploadHeroImage({ uri: asset.uri, name, type });
      if (data?.success && data?.url) {
        setHeroImage(data.url);
        Alert.alert("تم التحديث", "تم تحديث صورة الهيرو بنجاح");
      } else {
        Alert.alert("فشل الرفع", "حدث خطأ أثناء رفع الصورة. حاول مرة أخرى");
      }
    } catch (error) {
      console.error("Error uploading hero image:", error);
      Alert.alert("خطأ", "تعذر رفع الصورة. تحقق من الإنترنت وحاول مرة أخرى");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient
        colors={["#f0fdf4", "#ecfeff", "#f8fafc"]}
        style={styles.gradient}>
        <UserHeader title="الرئيسية" breadcrumb="الرئيسية / الرئيسية" />
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <HeroSection
            currentUser={currentUser}
            heroImage={heroImage}
            heroImageLoading={heroImageLoading}
            uploading={uploading}
            isTeacherOrAdmin={isTeacherOrAdmin}
            onEditHeroImage={handlePickAndUploadHeroImage}
            onStartJourney={handleStartJourney}
          />

          <VisionSection />
          <ValuesSection />

          {heroImageLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator />
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  gradient: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 20,
  },
  loadingRow: {
    paddingVertical: 16,
    alignItems: "center",
  },
});

export default Home;
