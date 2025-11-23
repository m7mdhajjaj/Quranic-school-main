import type { NewsModalProps } from "../utils/types";
import { Input, Textarea, Button, ImageUpload, DatePicker } from "@/components/UI";
import { MessageSquare, X, Plus, Edit } from 'lucide-react';

const NewsModal = ({
  isOpen,
  isEditMode,
  isLoading,
  newNews,
  selectedFile,
  fileInputRef,
  fieldErrors = {},
  onClose,
  onSubmit,
  onInputChange,
  onFileChange,
}: NewsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto relative overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between ${
          isEditMode 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
            : 'bg-gradient-to-r from-emerald-600 to-teal-600'
        }`}>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            {isEditMode ? <Edit size={32} /> : <Plus size={32} />}
            {isEditMode ? "تعديل الخبر" : "إضافة خبر جديد"}
          </h2>
          <button
            onClick={onClose}
            title="إغلاق"
            aria-label="إغلاق"
            className="text-white/90 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <form onSubmit={(e) => {
            console.log('📋 NewsModal form submitted');
            onSubmit(e);
          }} className="space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-base font-semibold text-gray-700">
                <MessageSquare size={20} className={isEditMode ? "text-blue-600" : "text-emerald-600"} />
                عنوان الخبر <span className="text-red-500">*</span>
              </label>
              <Input
                name="title"
                type="text"
                value={newNews.title}
                onChange={onInputChange}
                placeholder="أدخل عنوان الخبر"
                required
                disabled={isLoading}
                error={fieldErrors.title}
              />
            </div>

            {/* Date Field */}
            <DatePicker
              label="تاريخ الخبر"
              value={newNews.date || new Date().toISOString().split('T')[0]}
              onChange={(date) => {
                const event = {
                  target: { name: 'date', value: date }
                } as React.ChangeEvent<HTMLInputElement>;
                onInputChange(event);
              }}
              disabled={isLoading}
              error={fieldErrors.date}
              required
              minYear={2020}
              maxYear={new Date().getFullYear() + 5}
            />

            {/* Image Upload */}
            <ImageUpload
              label="صورة الخبر"
              currentImage={newNews.image}
              onImageSelect={(file) => {
                const event = {
                  target: { files: [file] }
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                onFileChange(event);
              }}
              onImageRemove={() => {
                // إزالة الصورة المختارة الجديدة والعودة للصورة الأصلية أو إزالة كليا
                const event = {
                  target: { name: 'image', value: '' }
                } as React.ChangeEvent<HTMLInputElement>;
                onInputChange(event);
                
                // إعادة تعيين file input
                if (fileInputRef?.current) {
                  fileInputRef.current.value = '';
                }
              }}
              disabled={isLoading}
              error={fieldErrors.image}
              showNewBadge={!!selectedFile}
              fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
            />

            {/* Content Field */}
            <Textarea
              label="محتوى الخبر"
              name="content"
              value={newNews.content}
              onChange={onInputChange}
              placeholder="أدخل محتوى الخبر"
              rows={4}
              required
              disabled={isLoading}
              error={fieldErrors.content}
            />

            {/* Footer Actions */}
            <div className="flex gap-3 pt-6 border-t mt-6">
              <Button
                type="button"
                onClick={() => {
                  console.log('❌ Cancel button clicked');
                  onClose();
                }}
                disabled={isLoading}
                loading={isLoading}
                variant="secondary"
                size="md"
                className="px-6 py-2 min-w-[120px]"
                leftIcon={<X size={20} />}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                variant="primary"
                size="md"
                className={`px-6 py-2 min-w-[160px] shadow-lg hover:shadow-xl ${
                  isEditMode 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                    : ''
                }`}
                leftIcon={isEditMode ? <Edit size={20} /> : <Plus size={20} />}
              >
                {isEditMode ? "تحديث الخبر" : "إضافة الخبر"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsModal;
