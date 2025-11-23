import React from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useImageUpload } from '../Hooks/useImageUpload';

interface ImageUploadProps {
  currentImage?: string | null;
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  previewHeight?: string;
  showNewBadge?: boolean;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  maxSizeMB?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageSelect,
  onImageRemove,
  disabled = false,
  error,
  label,
  helperText = 'PNG, JPG, GIF حتى 5MB',
  required = false,
  className,
  previewHeight = 'h-64',
  showNewBadge = false,
  fileInputRef: externalFileInputRef,
  maxSizeMB = 5,
}) => {
  // استخدام الـ hook المشترك بدلاً من تكرار الكود
  const {
    preview,
    isDragging,
    fileInputRef,
    selectedFileInfo,
    handleClick,
    handleRemove,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleInputChange,
  } = useImageUpload({
    currentImage,
    onImageSelect,
    onImageRemove,
    disabled,
    maxSizeMB,
    externalFileInputRef,
  });

  // دوال مساعدة لعرض معلومات الصورة
  const getImageType = (url?: string, file?: File | null) => {
    // إذا كان هناك ملف جديد، استخدم نوعه
    if (file) {
      if (file.type === 'image/jpeg') return 'JPEG';
      if (file.type === 'image/png') return 'PNG';
      if (file.type === 'image/gif') return 'GIF';
      if (file.type === 'image/webp') return 'WEBP';
      return file.type.replace('image/', '').toUpperCase();
    }
    
    // للصور الموجودة
    if (!url) return 'صورة';
    if (url.includes('.jpg') || url.includes('.jpeg')) return 'JPEG';
    if (url.includes('.png')) return 'PNG';
    if (url.includes('.gif')) return 'GIF';
    if (url.includes('.webp')) return 'WEBP';
    if (url.includes('cloudinary.com')) return 'مُحسّنة';
    return 'صورة';
  };

  const getImageDimensions = () => {
    return 'متجاوبة';
  };

  const getImageSize = (file?: File | null) => {
    // إذا كان هناك ملف جديد، احسب حجمه الحقيقي
    if (file) {
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB < 0.1) {
        return `${(file.size / 1024).toFixed(0)} KB`;
      }
      return `${sizeInMB.toFixed(2)} MB`;
    }
    
    // للصور الموجودة
    if (showNewBadge) return '< 5MB';
    if (currentImage?.includes('cloudinary.com')) return 'مُحسّنة';
    return 'مضغوطة';
  };

  const getImageInfo = () => {
    if (!preview) return null;
    
    return {
      type: getImageType(currentImage, selectedFileInfo),
      dimensions: getImageDimensions(),
      size: getImageSize(selectedFileInfo)
    };
  };

  return (
    <div className={`space-y-2 ${className || ''}`}>
      {/* Label */}
      {label && (
        <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-3">
          <ImageIcon size={20} className="text-emerald-600" />
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Upload Area / Image Preview - موحد في div واحد */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative block w-full ${previewHeight} border-2 border-dashed rounded-2xl cursor-pointer
          transition-all group shadow-sm overflow-hidden
          ${isDragging 
            ? 'border-emerald-500 bg-emerald-50' 
            : error 
            ? 'border-red-300 hover:border-red-400 hover:bg-red-50/30' 
            : 'border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/30'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
          aria-label={label || 'اختر صورة'}
          title={label || 'اختر صورة'}
          placeholder="اختر صورة"
        />

        {/* إما عرض الصورة أو منطقة الرفع */}
        {preview ? (
          <>
            {/* عرض الصورة */}
            <img
              src={preview}
              alt="معاينة"
              className="w-full h-full object-contain"
            />
            
            {/* Overlay للتفاعل */}
            <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="text-white text-center px-4">
                <p className="font-medium mb-3">اضغط لتغيير الصورة</p>
                {/* عرض معلومات الصورة دائماً */}
                {(() => {
                  const info = getImageInfo();
                  return info ? (
                    <div className="text-xs space-y-1 bg-black/50 rounded-lg p-3 backdrop-blur-sm">
                      <p className="flex items-center justify-center gap-1">
                        <span>📄</span> نوع: {info.type}
                      </p>
                      <p className="flex items-center justify-center gap-1">
                        <span>📏</span> أبعاد: {info.dimensions}
                      </p>
                      <p className="flex items-center justify-center gap-1">
                        <span>💾</span> حجم: {info.size}
                      </p>
                      {showNewBadge && (
                        <p className="flex items-center justify-center gap-1 text-emerald-300 font-medium mt-2">
                          <span>✨</span> جاهزة للرفع
                        </p>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            {/* New Badge */}
            {showNewBadge && (
              <div className="absolute top-2 right-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                صورة جديدة
              </div>
            )}

            {/* Remove Button */}
            {onImageRemove && !disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                aria-label="Remove image"
                type="button"
              >
                <X size={16} />
              </button>
            )}
          </>
        ) : (
          /* منطقة الرفع */
          <div className="h-full flex flex-col items-center justify-center gap-2 p-6">
            {isDragging ? (
              <Upload 
                size={48} 
                className="text-emerald-500 animate-bounce" 
              />
            ) : (
              <svg
                className={`w-12 h-12 transition-colors ${
                  error 
                    ? 'text-red-400 group-hover:text-red-500' 
                    : 'text-emerald-400 group-hover:text-emerald-500'
                }`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            <p className={`text-sm font-medium ${
              error ? 'text-red-700' : 'text-emerald-700'
            }`}>
              {isDragging ? 'أفلت الصورة هنا' : 'اضغط لاختيار صورة أو اسحبها هنا'}
            </p>
            {helperText && (
              <p className={`text-xs ${
                error ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <AlertCircle size={16} />
          {error}
        </p>
      )}
    </div>
  );
};
