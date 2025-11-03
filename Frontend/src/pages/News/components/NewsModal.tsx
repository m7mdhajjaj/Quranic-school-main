import type { NewsModalProps } from "../utils/types";
import { Input, Textarea, Button, LoadingSpinner, ImageUpload } from '../../../components/UI';
import { MessageSquare, Calendar, X, Plus } from 'lucide-react';

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
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            {isEditMode ? "تعديل الخبر" : "إضافة خبر جديد"}
          </h2>
          <button
            onClick={onClose}
            title="إغلاق"
            aria-label="إغلاق"
            className="text-white/90 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Title Field */}
            <Input
              label="عنوان الخبر"
              name="title"
              type="text"
              value={newNews.title}
              onChange={onInputChange}
              placeholder="أدخل عنوان الخبر"
              required
              disabled={isLoading}
              error={fieldErrors.title}
              leftIcon={<MessageSquare size={20} className="text-emerald-600" />}
            />

            {/* Date Field */}
            <Input
              label="تاريخ الخبر (ميلادي)"
              name="date"
              type="date"
              value={newNews.date}
              onChange={onInputChange}
              placeholder="اختر التاريخ"
              disabled={isLoading}
              error={fieldErrors.date}
              leftIcon={<Calendar size={20} className="text-emerald-600" />}
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
                onClick={onClose}
                disabled={isLoading}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                <X size={20} />
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                variant="primary"
                size="lg"
                className="flex-1 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    {isEditMode ? "تحديث الخبر" : "إضافة الخبر"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsModal;
