import React, { useRef, useState } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';

interface AvatarUploadProps {
  currentImage?: string | null;
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  disabled?: boolean;
  showRemoveButton?: boolean;
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentImage,
  onImageSelect,
  onImageRemove,
  size = 'md',
  shape = 'circle',
  disabled = false,
  showRemoveButton = true,
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);

  const sizes = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
    xl: 'w-56 h-56',
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40,
  };

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

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  return (
    <div className={`relative inline-block ${className || ''}`}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          ${sizes[size]} ${shapeClass}
          relative overflow-hidden border-4 border-gray-300
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-emerald-500'}
          ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'bg-gray-100'}
          transition-all duration-200 group
        `}
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <User size={iconSizes[size]} className="text-gray-400" />
          </div>
        )}

        {/* Hover overlay */}
        {!disabled && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-1">
              <Camera size={iconSizes[size] / 1.5} className="text-white" />
              <span className="text-white text-xs font-medium">رفع صورة</span>
            </div>
          </div>
        )}

        {/* Upload icon when dragging */}
        {isDragging && (
          <div className="absolute inset-0 bg-emerald-500 bg-opacity-80 flex items-center justify-center">
            <Upload size={iconSizes[size]} className="text-white animate-bounce" />
          </div>
        )}
      </div>

      {/* Remove button */}
      {showRemoveButton && preview && !disabled && (
        <button
          onClick={handleRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
          aria-label="Remove image"
        >
          <X size={16} />
        </button>
      )}

      {/* Hidden file input */}
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
      />
    </div>
  );
};
