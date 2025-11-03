import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook لإدارة رفع الصور مع معاينة والسحب والإفلات
 * يستخدم في ImageUpload و AvatarUpload لتجنب تكرار الكود
 */

interface UseImageUploadOptions {
  currentImage?: string | null;
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  disabled?: boolean;
  maxSizeMB?: number;
  externalFileInputRef?: React.RefObject<HTMLInputElement>;
}

export const useImageUpload = ({
  currentImage,
  onImageSelect,
  onImageRemove,
  disabled = false,
  maxSizeMB = 5,
  externalFileInputRef,
}: UseImageUploadOptions) => {
  const internalFileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = externalFileInputRef || internalFileInputRef;
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);

  // Update preview when currentImage changes
  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  /**
   * التحقق من صحة الملف
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'يرجى اختيار صورة فقط' };
    }

    // Validate file size
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
   * معالجة اختيار الملف
   */
  const handleFileSelect = (file: File) => {
    if (disabled) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageSelect(file);
  };

  /**
   * فتح نافذة اختيار الملف
   */
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  /**
   * إزالة الصورة
   */
  const handleRemove = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setPreview(null);
    if (onImageRemove) {
      onImageRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * معالجة السحب فوق المنطقة
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  /**
   * معالجة مغادرة منطقة السحب
   */
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  /**
   * معالجة إفلات الملف
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * معالجة تغيير الـ input
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return {
    // State
    preview,
    isDragging,
    fileInputRef,

    // Handlers
    handleClick,
    handleRemove,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleInputChange,
    handleFileSelect,

    // Utilities
    validateFile,
  };
};
