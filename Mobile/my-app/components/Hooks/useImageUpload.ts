import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

interface UseImageUploadOptions {
  currentImage?: string | null;
  onImageSelect: (uri: string) => void;
  onImageRemove?: () => void;
  disabled?: boolean;
  maxSizeMB?: number;
}

export const useImageUpload = ({
  currentImage,
  onImageSelect,
  onImageRemove,
  disabled = false,
  maxSizeMB = 5,
}: UseImageUploadOptions) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  /**
   * طلب صلاحيات الكاميرا
   */
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("خطأ", "نحتاج صلاحيات الوصول للمعرض");
      return false;
    }
    return true;
  };

  /**
   * اختيار صورة من المعرض
   */
  const handleImagePick = async () => {
    if (disabled) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;

        // التحقق من حجم الملف (تقريبي)
        // في React Native لا يمكن الحصول على حجم الملف مباشرة من URI
        // يمكن استخدام expo-file-system للتحقق الدقيق

        setPreview(uri);
        onImageSelect(uri);
      }
    } catch (error) {
      Alert.alert("خطأ", "فشل اختيار الصورة");
      console.error("Image pick error:", error);
    }
  };

  /**
   * التقاط صورة بالكاميرا
   */
  const handleCameraCapture = async () => {
    if (disabled) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("خطأ", "نحتاج صلاحيات الوصول للكاميرا");
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setPreview(uri);
        onImageSelect(uri);
      }
    } catch (error) {
      Alert.alert("خطأ", "فشل التقاط الصورة");
      console.error("Camera error:", error);
    }
  };

  /**
   * إزالة الصورة
   */
  const handleRemove = () => {
    setPreview(null);
    if (onImageRemove) {
      onImageRemove();
    }
  };

  return {
    preview,
    handleImagePick,
    handleCameraCapture,
    handleRemove,
    disabled,
  };
};
