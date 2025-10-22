import type { NewsModalProps } from "../utils/types";

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
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                عنوان الخبر
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newNews.title}
                onChange={onInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all outline-none ${
                  fieldErrors.title
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                }`}
                placeholder="أدخل عنوان الخبر"
                required
                disabled={isLoading}
              />
              {fieldErrors.title && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {fieldErrors.title}
                </p>
              )}
            </div>

            {/* Date Field */}
            <div className="space-y-2">
              <label
                htmlFor="date"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                تاريخ الخبر (ميلادي)
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={newNews.date}
                onChange={onInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all outline-none ${
                  fieldErrors.date
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                }`}
                placeholder="اختر التاريخ"
                disabled={isLoading}
              />
              {fieldErrors.date && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {fieldErrors.date}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label
                htmlFor="image"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                صورة الخبر
              </label>

              <label
                htmlFor="image"
                className="block w-full p-6 border-2 border-dashed border-emerald-300 rounded-lg text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group">
                <input
                  type="file"
                  id="image"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                  disabled={isLoading}
                />

                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="w-12 h-12 text-emerald-400 group-hover:text-emerald-500 transition-colors"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48">
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-sm text-emerald-700 font-medium">
                    اضغط لاختيار صورة أو اسحبها هنا
                  </p>
                  <p className="text-xs text-emerald-600">
                    PNG, JPG, GIF حتى 5MB
                  </p>
                </div>
              </label>

              {/* Image Error */}
              {fieldErrors.image && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {fieldErrors.image}
                </p>
              )}

              {/* Image Preview */}
              {newNews.image && (
                <div className="relative h-64 w-full rounded-lg overflow-hidden border-2 border-emerald-200 bg-gray-50">
                  <img
                    src={newNews.image}
                    alt="معاينة"
                    className="w-full h-full object-contain"
                  />
                  {selectedFile && (
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      صورة جديدة
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content Field */}
            <div className="space-y-2">
              <label
                htmlFor="content"
                className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
                محتوى الخبر
              </label>
              <textarea
                id="content"
                name="content"
                value={newNews.content}
                onChange={onInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all outline-none resize-none ${
                  fieldErrors.content
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                }`}
                placeholder="أدخل محتوى الخبر"
                rows={4}
                required
                disabled={isLoading}
              />
              {fieldErrors.content && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {fieldErrors.content}
                </p>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 pt-6 border-t mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {isEditMode ? "تحديث الخبر" : "إضافة الخبر"}
              </>
            )}
          </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewsModal;
