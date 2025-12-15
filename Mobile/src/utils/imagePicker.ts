import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

/**
 * Image & Document Picker Helper for React Native
 */

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

/**
 * طلب صلاحية الكاميرا
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    alert("عذراً، نحتاج إلى صلاحية الوصول للكاميرا!");
    return false;
  }
  return true;
};

/**
 * طلب صلاحية المعرض
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    alert("عذراً، نحتاج إلى صلاحية الوصول للمعرض!");
    return false;
  }
  return true;
};

/**
 * اختيار صورة من المعرض
 */
export const pickImage = async (): Promise<PickedImage | null> => {
  // طلب الصلاحية
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) return null;

  // اختيار الصورة
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.uri.split("/").pop() || "image.jpg",
      type: "image/jpeg",
      size: asset.fileSize,
    };
  }

  return null;
};

/**
 * اختيار صور متعددة من المعرض
 */
export const pickMultipleImages = async (): Promise<PickedImage[]> => {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) return [];

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    quality: 0.8,
  });

  if (!result.canceled && result.assets) {
    return result.assets.map((asset) => ({
      uri: asset.uri,
      name: asset.uri.split("/").pop() || "image.jpg",
      type: "image/jpeg",
      size: asset.fileSize,
    }));
  }

  return [];
};

/**
 * التقاط صورة من الكاميرا
 */
export const takePhoto = async (): Promise<PickedImage | null> => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return null;

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: `photo_${Date.now()}.jpg`,
      type: "image/jpeg",
      size: asset.fileSize,
    };
  }

  return null;
};

/**
 * اختيار مستند
 */
export const pickDocument = async (): Promise<PickedImage | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || "application/octet-stream",
        size: asset.size,
      };
    }

    return null;
  } catch (error) {
    console.error("Error picking document:", error);
    return null;
  }
};

/**
 * عرض خيارات اختيار الصورة
 */
export const showImagePickerOptions = async (): Promise<PickedImage | null> => {
  // في React Native، يمكن استخدام ActionSheet أو Alert
  // هنا مثال بسيط، يمكن تحسينه باستخدام مكتبة مثل react-native-action-sheet

  return new Promise((resolve) => {
    // يمكن استخدام مكون custom لعرض الخيارات
    // Camera أو Gallery
    // هذا مثال بسيط، يُفضل إنشاء مكون UI مخصص
    resolve(null);
  });
};

export default {
  pickImage,
  pickMultipleImages,
  takePhoto,
  pickDocument,
  requestCameraPermission,
  requestMediaLibraryPermission,
};
