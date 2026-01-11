// hooks/profile/useProfileAvatar.ts
import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadAvatar, deleteAvatar } from "@/Api/profileApi";
import type { UserProfile, Endpoint } from "@/types/profile.types";

export const useProfileAvatar = (
  user: UserProfile | null,
  endpoint: Endpoint,
  onSuccess?: () => void
) => {
  const [avatarFile, setAvatarFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("تنبيه", "نحتاج إذن للوصول إلى معرض الصور");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarFile(result.assets[0].uri);
    }
  };

  const uploadAvatarImage = async () => {
    if (!avatarFile) return;

    setIsUploading(true);

    try {
      const formData = new FormData();

      // Extract filename from URI
      const uriParts = avatarFile.split("/");
      const fileName = uriParts[uriParts.length - 1];

      formData.append("avatar", {
        uri: avatarFile,
        name: fileName,
        type: "image/jpeg",
      } as any);

      await uploadAvatar(formData);

      setAvatarFile(null);

      if (onSuccess) {
        onSuccess();
      }

      Alert.alert("نجح", "تم رفع الصورة بنجاح");
    } catch (error: any) {
      const message = error?.response?.data?.message || "فشل رفع الصورة";
      Alert.alert("خطأ", message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    Alert.alert("تأكيد الحذف", "هل أنت متأكد من حذف الصورة الشخصية؟", [
      {
        text: "إلغاء",
        style: "cancel",
      },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          setIsUploading(true);
          try {
            await deleteAvatar();
            setAvatarFile(null);

            if (onSuccess) {
              onSuccess();
            }

            Alert.alert("نجح", "تم حذف الصورة بنجاح");
          } catch (error: any) {
            const message = error?.response?.data?.message || "فشل حذف الصورة";
            Alert.alert("خطأ", message);
          } finally {
            setIsUploading(false);
          }
        },
      },
    ]);
  };

  const resetAvatar = () => {
    setAvatarFile(null);
  };

  return {
    avatarFile,
    isUploading,
    setAvatarFile,
    pickImage,
    uploadAvatarImage,
    handleDeleteAvatar,
    resetAvatar,
  };
};
