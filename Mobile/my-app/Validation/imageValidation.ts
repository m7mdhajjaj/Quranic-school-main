/**
 * دوال مساعدة للتحقق من صحة الصور - Mobile
 * يستخدم في ImageUpload و AvatarUpload في React Native
 */

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface ImageValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface ImageAsset {
  uri: string;
  type?: string;
  fileSize?: number;
  fileName?: string;
  width?: number;
  height?: number;
}

/**
 * التحقق من نوع الملف
 */
export const validateFileType = (
  image: ImageAsset,
  allowedTypes: string[] = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ]
): ImageValidationResult => {
  if (!image.type) {
    // في React Native قد لا يكون type موجود دائماً
    // يمكن التحقق من الامتداد من اسم الملف
    if (image.fileName) {
      const extension = image.fileName.split(".").pop()?.toLowerCase();
      const typeFromExtension = `image/${extension}`;
      if (allowedTypes.includes(typeFromExtension)) {
        return { valid: true };
      }
    }
    return { valid: false, error: "يرجى اختيار صورة فقط" };
  }

  if (!image.type.startsWith("image/")) {
    return { valid: false, error: "يرجى اختيار صورة فقط" };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(image.type)) {
    return {
      valid: false,
      error: `الصيغ المسموحة: ${allowedTypes.map((t) => t.split("/")[1].toUpperCase()).join(", ")}`,
    };
  }

  return { valid: true };
};

/**
 * التحقق من حجم الملف
 */
export const validateFileSize = (
  image: ImageAsset,
  maxSizeMB: number = 5
): ImageValidationResult => {
  if (!image.fileSize) {
    return { valid: true }; // السماح بالمرور إذا لم يكن الحجم متاحاً
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (image.fileSize > maxSizeBytes) {
    return {
      valid: false,
      error: `حجم الصورة يجب أن يكون أقل من ${maxSizeMB} ميغابايت`,
    };
  }

  return { valid: true };
};

/**
 * التحقق من أبعاد الصورة
 */
export const validateImageDimensions = (
  image: ImageAsset,
  options: {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  }
): ImageValidationResult => {
  const { minWidth, minHeight, maxWidth, maxHeight } = options;

  if (!image.width || !image.height) {
    return { valid: true }; // السماح بالمرور إذا لم تكن الأبعاد متاحة
  }

  if (minWidth && image.width < minWidth) {
    return {
      valid: false,
      error: `عرض الصورة يجب أن يكون على الأقل ${minWidth} بكسل`,
    };
  }

  if (minHeight && image.height < minHeight) {
    return {
      valid: false,
      error: `ارتفاع الصورة يجب أن يكون على الأقل ${minHeight} بكسل`,
    };
  }

  if (maxWidth && image.width > maxWidth) {
    return {
      valid: false,
      error: `عرض الصورة يجب أن يكون أقل من ${maxWidth} بكسل`,
    };
  }

  if (maxHeight && image.height > maxHeight) {
    return {
      valid: false,
      error: `ارتفاع الصورة يجب أن يكون أقل من ${maxHeight} بكسل`,
    };
  }

  return { valid: true };
};

/**
 * التحقق الشامل من الصورة
 */
export const validateImage = (
  image: ImageAsset,
  options: ImageValidationOptions = {}
): ImageValidationResult => {
  const {
    maxSizeMB = 5,
    allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ],
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  } = options;

  // التحقق من النوع
  const typeValidation = validateFileType(image, allowedTypes);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // التحقق من الحجم
  const sizeValidation = validateFileSize(image, maxSizeMB);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  // التحقق من الأبعاد إذا كانت محددة
  if (minWidth || minHeight || maxWidth || maxHeight) {
    const dimensionsValidation = validateImageDimensions(image, {
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
    });
    if (!dimensionsValidation.valid) {
      return dimensionsValidation;
    }
  }

  return { valid: true };
};

/**
 * الحصول على معلومات الصورة من URI
 * هذه الدالة مساعدة للحصول على معلومات الصورة من URI
 */
export const getImageInfo = (
  image: ImageAsset
): {
  uri: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  size?: number;
  type?: string;
  fileName?: string;
} => {
  return {
    uri: image.uri,
    width: image.width,
    height: image.height,
    aspectRatio:
      image.width && image.height ? image.width / image.height : undefined,
    size: image.fileSize,
    type: image.type,
    fileName: image.fileName,
  };
};

/**
 * التحقق من URI صالح
 */
export const isValidImageUri = (uri: string): boolean => {
  if (!uri) return false;
  // التحقق من أن URI يبدأ بـ file:// أو http:// أو https:// أو content://
  return /^(file|http|https|content):\/\/.+/.test(uri);
};
