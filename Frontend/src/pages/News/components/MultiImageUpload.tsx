import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/UI';
import { useMultiImageUpload } from '../hooks/useMultiImageUpload';

interface MultiImageUploadProps {
  onImagesChange: (files: File[]) => void;
  existingImages?: string[];
  maxImages?: number;
  label?: string;
  error?: string;
  mode?: 'single' | 'multiple'; // وضع الرفع: صورة واحدة أو متعدد
}

/**
 * مكون رفع صور متعددة
 * 
 * مستخدم في: pages/News/components/NewsModal.tsx
 */
const MultiImageUpload = ({
  onImagesChange,
  existingImages = [],
  maxImages = 10,
  label = 'الصور',
  error,
  mode = 'multiple', // الوضع الافتراضي: متعدد
}: MultiImageUploadProps) => {
  const {
    previews,
    hasExistingImages,
    fileInputRef,
    effectiveMaxImages,
    handleFileSelect,
    removeImage,
    handleUploadClick,
  } = useMultiImageUpload({
    existingImages,
    maxImages,
    mode,
    onImagesChange,
  });

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        <span className="text-gray-500 text-xs mr-2">
          {mode === 'single' 
            ? '(صورة واحدة، حتى 5MB)'
            : `(حتى ${effectiveMaxImages} صور، كل صورة حتى 5MB)`
          }
        </span>
      </label>

      {/* تنبيه عند وجود صور قديمة */}
      {hasExistingImages && previews.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <span className="font-semibold">ℹ️ ملاحظة:</span> عند اختيار {mode === 'single' ? 'صورة جديدة' : 'صور جديدة'}، سيتم استبدال {mode === 'single' ? 'الصورة القديمة' : `الصور القديمة (${previews.length})`} بالكامل
        </div>
      )}

      {/* منطقة الرفع */}
      <div className="space-y-3">
        {previews.length < effectiveMaxImages && (
          <div
            onClick={handleUploadClick}
            className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-200"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple={mode === 'multiple'}
              onChange={handleFileSelect}
              className="hidden"
              aria-label={mode === 'single' ? 'اختيار صورة' : 'اختيار صور'}
            />
            <Upload className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
            <p className="text-sm text-gray-600 font-medium mb-1">
              {mode === 'single' ? 'اضغط لاختيار صورة' : 'اضغط لاختيار الصور'}
            </p>
            <p className="text-xs text-gray-500">
              {mode === 'single' 
                ? (previews.length === 1 ? 'صورة واحدة محملة' : 'لا توجد صورة')
                : `${previews.length} / ${effectiveMaxImages} صور محملة`
              }
            </p>
          </div>
        )}

        {/* معاينة الصور */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-emerald-400 transition-all"
              >
                <img
                  src={preview}
                  alt={`معاينة ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="rounded-full p-2"
                  >
                    <X size={16} />
                  </Button>
                </div>
                <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* رسالة عندما لا توجد صور */}
        {previews.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <ImageIcon className="mx-auto h-16 w-16 mb-2 opacity-50" />
            <p className="text-sm">لم يتم تحديد أي صور بعد</p>
          </div>
        )}
      </div>

      {/* رسالة خطأ */}
      {error && (
        <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
          <X size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

export default MultiImageUpload;
