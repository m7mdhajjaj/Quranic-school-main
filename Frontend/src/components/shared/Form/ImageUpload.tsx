import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

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
}) => {
  const internalFileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = externalFileInputRef || internalFileInputRef;
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);

  // Update preview when currentImage changes
  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const handleFileSelect = (file: File) => {
    if (disabled) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار صورة فقط');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميغابايت');
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

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (onImageRemove) {
      onImageRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
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

      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          block w-full p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer
          transition-all group shadow-sm
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
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileSelect(file);
            }
          }}
          className="hidden"
          disabled={disabled}
          aria-label={label || 'اختر صورة'}
          title={label || 'اختر صورة'}
          placeholder="اختر صورة"
        />

        <div className="flex flex-col items-center gap-2">
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
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
          <AlertCircle size={16} />
          {error}
        </p>
      )}

      {/* Image Preview */}
      {preview && (
        <div className={`relative ${previewHeight} w-full rounded-lg overflow-hidden border-2 ${
          error ? 'border-red-200' : 'border-emerald-200'
        } bg-gray-50`}>
          <img
            src={preview}
            alt="معاينة"
            className="w-full h-full object-contain"
          />
          
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
        </div>
      )}
    </div>
  );
};
