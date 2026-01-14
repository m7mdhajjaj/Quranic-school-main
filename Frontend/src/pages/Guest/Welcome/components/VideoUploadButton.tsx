// ============================================================================
// VideoUploadButton.tsx - زر رفع فيديو الترحيب (مبسط مع hook)
// ============================================================================

import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaTimes, FaCheck, FaSpinner, FaVideo } from 'react-icons/fa';
import { useVideoUpload } from '../Hooks';

interface VideoUploadButtonProps {
  onVideoUploaded?: (url: string) => void;
}

const VideoUploadButton = ({ onVideoUploaded }: VideoUploadButtonProps) => {
  const {
    isOpen,
    uploading,
    uploadProgress,
    uploadedUrl,
    error,
    fileInputRef,
    openModal,
    closeModal,
    handleFileSelect,
    handleReset,
  } = useVideoUpload(onVideoUploaded);

  return (
    <>
      {/* زر فتح النافذة */}
      {(import.meta.env.DEV || localStorage.getItem('isAdmin')) && (
        <motion.button
          onClick={openModal}
          className="fixed bottom-8 left-8 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="رفع فيديو خلفية جديد"
        >
          <FaVideo className="text-2xl" />
        </motion.button>
      )}

      {/* نافذة الرفع */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />

            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-purple-500/20">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <FaVideo className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">رفع فيديو الترحيب</h2>
                      <p className="text-gray-400 text-sm">عبر Backend API</p>
                    </div>
                  </div>
                  {!uploading && (
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label="إغلاق"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* زر الرفع */}
                  {!uploadedUrl && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                        aria-label="اختر ملف فيديو"
                      />
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {uploading ? (
                          <>
                            <FaSpinner className="animate-spin text-xl" />
                            جاري الرفع... {uploadProgress}%
                          </>
                        ) : (
                          <>
                            <FaUpload className="text-xl" />
                            اختر فيديو للرفع
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {uploading && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-gray-400 text-sm text-center">
                        جاري رفع الفيديو... {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {/* Success Message */}
                  {uploadedUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-500/20 border border-green-500/50 rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <FaCheck className="text-green-400 text-xl" />
                        <p className="text-green-400 font-bold">تم رفع الفيديو بنجاح!</p>
                      </div>
                      <p className="text-gray-400 text-sm mb-3 break-all">
                        {uploadedUrl}
                      </p>
                      <button
                        onClick={handleReset}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold transition-colors"
                      >
                        استعادة الفيديو الافتراضي
                      </button>
                    </motion.div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/20 border border-red-500/50 rounded-xl p-4"
                    >
                      <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                  )}

                  {/* Info Box */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <h3 className="text-blue-400 font-bold mb-2">📋 المعلومات:</h3>
                    <ul className="text-gray-400 text-sm space-y-1">
                      <li>• الحجم الأقصى: 100MB</li>
                      <li>• الدقة الموصى بها: 1920x1080</li>
                      <li>• التنسيق: MP4, WebM, MOV</li>
                      <li>• يتم الرفع عبر Backend API</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoUploadButton;
