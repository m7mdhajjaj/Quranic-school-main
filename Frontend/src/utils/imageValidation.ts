/**
 * دوال مساعدة للتحقق من صحة الصور
 * يستخدم في ImageUpload و AvatarUpload
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

/**
 * التحقق من نوع الملف
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
): ImageValidationResult => {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'يرجى اختيار صورة فقط' };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `الصيغ المسموحة: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}` 
    };
  }

  return { valid: true };
};

/**
 * التحقق من حجم الملف
 */
export const validateFileSize = (
  file: File,
  maxSizeMB: number = 5
): ImageValidationResult => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return { 
      valid: false, 
      error: `حجم الصورة يجب أن يكون أقل من ${maxSizeMB} ميغابايت` 
    };
  }

  return { valid: true };
};

/**
 * التحقق من أبعاد الصورة
 */
export const validateImageDimensions = (
  file: File,
  options: {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  }
): Promise<ImageValidationResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const { minWidth, minHeight, maxWidth, maxHeight } = options;

      if (minWidth && img.width < minWidth) {
        resolve({ 
          valid: false, 
          error: `عرض الصورة يجب أن يكون على الأقل ${minWidth} بكسل` 
        });
        return;
      }

      if (minHeight && img.height < minHeight) {
        resolve({ 
          valid: false, 
          error: `ارتفاع الصورة يجب أن يكون على الأقل ${minHeight} بكسل` 
        });
        return;
      }

      if (maxWidth && img.width > maxWidth) {
        resolve({ 
          valid: false, 
          error: `عرض الصورة يجب أن يكون أقل من ${maxWidth} بكسل` 
        });
        return;
      }

      if (maxHeight && img.height > maxHeight) {
        resolve({ 
          valid: false, 
          error: `ارتفاع الصورة يجب أن يكون أقل من ${maxHeight} بكسل` 
        });
        return;
      }

      resolve({ valid: true });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ valid: false, error: 'فشل تحميل الصورة' });
    };

    img.src = objectUrl;
  });
};

/**
 * التحقق الشامل من الصورة
 */
export const validateImage = async (
  file: File,
  options: ImageValidationOptions = {}
): Promise<ImageValidationResult> => {
  const {
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  } = options;

  // التحقق من النوع
  const typeValidation = validateFileType(file, allowedTypes);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // التحقق من الحجم
  const sizeValidation = validateFileSize(file, maxSizeMB);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  // التحقق من الأبعاد إذا كانت محددة
  if (minWidth || minHeight || maxWidth || maxHeight) {
    const dimensionsValidation = await validateImageDimensions(file, {
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
 * تحويل الملف إلى Base64 للمعاينة
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('فشل قراءة الملف'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * ضغط الصورة (اختياري)
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // حساب الأبعاد الجديدة
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('فشل إنشاء canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('فشل ضغط الصورة'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('فشل تحميل الصورة'));
    };

    img.src = objectUrl;
  });
};

/**
 * الحصول على معلومات الصورة
 */
export const getImageInfo = (file: File): Promise<{
  width: number;
  height: number;
  aspectRatio: number;
  size: number;
  type: string;
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height,
        size: file.size,
        type: file.type,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('فشل تحميل الصورة'));
    };

    img.src = objectUrl;
  });
};
