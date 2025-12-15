import { useMemo } from 'react';
import type { NewsModalProps } from '../Types/types';
import { Input, Textarea, Button, DatePicker } from '@/components/UI';
import MultiImageUpload from './MultiImageUpload';
import { MessageSquare, X, Plus, Edit, Globe, Users } from 'lucide-react';

const NewsModal = ({
  isOpen,
  isEditMode,
  isLoading,
  newNews,
  fieldErrors = {},
  onClose,
  onSubmit,
  onInputChange,
  onFileChange,
}: NewsModalProps) => {
  const existingImages = useMemo(() => {
    return newNews.images && newNews.images.length > 0
      ? newNews.images.map((img) => img.url)
      : newNews.image
      ? [newNews.image]
      : [];
  }, [newNews.images, newNews.image]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[200] p-4 bg-black/50 backdrop-blur-sm"
      dir="rtl"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto relative overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between flex-shrink-0 ${
            isEditMode
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600'
          }`}
        >
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            {isEditMode ? <Edit size={32} /> : <Plus size={32} />}
            {isEditMode ? 'تعديل الخبر' : 'إضافة خبر جديد'}
          </h2>
          <button
            onClick={onClose}
            title="إغلاق"
            aria-label="إغلاق"
            className="text-white/90 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form
            onSubmit={(e) => {
              console.log('📋 NewsModal form submitted');
              onSubmit(e);
            }}
            className="space-y-6"
          >
            {/* Title Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-base font-semibold text-gray-700">
                <MessageSquare
                  size={20}
                  className={isEditMode ? 'text-blue-600' : 'text-emerald-600'}
                />
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
                  target: { name: 'date', value: date },
                } as React.ChangeEvent<HTMLInputElement>;
                onInputChange(event);
              }}
              disabled={isLoading}
              error={fieldErrors.date}
              required
              minYear={new Date().getFullYear()}
              maxYear={new Date().getFullYear() + 5}
              minDate={new Date().toISOString().split('T')[0]} // Minimum date is today
            />

            {/* Visibility Selection */}
            <div className="space-y-2">
              <label className="block text-base font-semibold text-gray-700">
                نوع الخبر <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    newNews.visibility === 'general' || !newNews.visibility
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value="general"
                    checked={newNews.visibility === 'general' || !newNews.visibility}
                    onChange={onInputChange}
                    className="absolute opacity-0 w-full h-full cursor-pointer"
                  />
                  <Globe size={24} className="mb-2" />
                  <span className="font-bold">عام</span>
                  <span className="text-xs text-center mt-1 opacity-80">يظهر لجميع الطلاب والمعلمين</span>
                </label>

                <label
                  className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    newNews.visibility === 'group'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value="group"
                    checked={newNews.visibility === 'group'}
                    onChange={onInputChange}
                    className="absolute opacity-0 w-full h-full cursor-pointer"
                  />
                  <Users size={24} className="mb-2" />
                  <span className="font-bold">طلاب المعلم</span>
                  <span className="text-xs text-center mt-1 opacity-80">يظهر لطلابك فقط</span>
                </label>
              </div>
            </div>

            {/* Multiple Images Upload */}
            <MultiImageUpload
              label="صور الخبر"
              mode="multiple"
              existingImages={existingImages}
              onImagesChange={(files) => {
                console.log(
                  '📸 NewsModal: تمرير',
                  files.length,
                  'صور إلى handleFileChange'
                );
                onFileChange(files as any);
              }}
              maxImages={10}
              error={fieldErrors.image}
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
            <div className="flex justify-between items-center gap-3 pt-6 border-t mt-6">
              {/* زر الإلغاء - أقصى اليسار */}
              <Button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                variant="danger"
                size="md"
                className="px-6 py-2 min-w-[120px] bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                leftIcon={<X size={20} />}
              >
                إلغاء
              </Button>

              {/* زر الإضافة/التحديث - أقصى اليمين */}
              <Button
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                variant="primary"
                size="md"
                className={`px-6 py-2 min-w-[160px] shadow-lg hover:shadow-xl transition-all ${
                  isEditMode
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                }`}
                leftIcon={isEditMode ? <Edit size={20} /> : <Plus size={20} />}
              >
                {isEditMode ? 'تحديث الخبر' : 'إضافة الخبر'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default NewsModal;
