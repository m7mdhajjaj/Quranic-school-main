// ============================================================================
// VideoUploadButton.tsx - رفع فيديو الخلفية للأدمن
// ============================================================================

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaTimes, FaCheck, FaSpinner, FaVideo } from 'react-icons/fa';

interface VideoUploadButtonProps {
  onVideoUploaded?: (url: string) => void;
}

const VideoUploadButton = ({ onVideoUploaded }: VideoUploadButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cloudinary config
  // ملاحظة: تحتاج إنشاء unsigned upload preset في Cloudinary
  // اذهب إلى: Settings > Upload > Add upload preset
  // اجعله Unsigned وسميه: quranic_upload
  const CLOUDINARY_CLOUD_NAME = 'dfi5r4ssx';
  const CLOUDINARY_FOLDER = 'quranic-school/QuestPage';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('الرجاء اختيار ملف فيديو فقط');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('حجم الفيديو يجب أن يكون أقل من 100MB');
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'quranic_upload'); // تأكد من إنشاء هذا في Cloudinary
      formData.append('folder', CLOUDINARY_FOLDER);
      formData.append('resource_type', 'video');
      formData.append('public_id', `Quest_${Date.now()}`); // اسم فريد للفيديو

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
          console.log(`📤 جاري الرفع: ${progress}%`);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const videoUrl = response.secure_url;
          
          setUploadedUrl(videoUrl);
          setUploading(false);
          
          localStorage.setItem('welcomePageVideoUrl', videoUrl);
          
          if (onVideoUploaded) {
            onVideoUploaded(videoUrl);
          }
          
          console.log('✅ تم رفع الفيديو بنجاح:', videoUrl);
          console.log('📁 المجلد:', CLOUDINARY_FOLDER);
          
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          throw new Error('فشل رفع الفيديو');
        }
      });

      xhr.addEventListener('error', () => {
        setError('حدث خطأ أثناء رفع الفيديو - تحقق من الإنترنت');
        setUploading(false);
        console.error('❌ خطأ في الرفع');
      });

      xhr.addEventListener('loadend', () => {
        if (xhr.status !== 200 && !uploadedUrl) {
          let errorMsg = 'حدث خطأ أثناء الرفع';
          if (xhr.status === 400) {
            errorMsg = 'خطأ 400: Upload Preset غير صحيح. تحتاج إنشاء "quranic_upload" في Cloudinary';
            console.error('❌ خطأ 400: تحتاج إنشاء unsigned upload preset باسم "quranic_upload"');
            console.log('📝 الخطوات: Settings > Upload > Add upload preset > Unsigned > قم بتسميته: quranic_upload');
          } else if (xhr.status === 401) {
            errorMsg = 'خطأ 401: غير مصرح - تحقق من الإعدادات';
          }
          setError(errorMsg);
          setUploading(false);
        }
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`);
      xhr.send(formData);
      
    } catch (err) {
      console.error('خطأ في رفع الفيديو:', err);
      setError('حدث خطأ أثناء رفع الفيديو');
      setUploading(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('welcomePageVideoUrl');
    setUploadedUrl('');
    window.location.reload();
  };

  return (
    <>
      {/* زر فتح النافذة */}
      {(import.meta.env.DEV || localStorage.getItem('isAdmin')) && (
        <motion.button
          onClick={() => setIsOpen(true)}
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
              onClick={() => !uploading && setIsOpen(false)}
            />

            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-purple-500/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <FaVideo className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">رفع فيديو خلفية</h2>
                      <p className="text-gray-400 text-sm">QuestPage Folder</p>
                    </div>
                  </div>
                  {!uploading && (
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label="إغلاق"
                      title="إغلاق"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
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
                        title="اختر ملف فيديو"
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

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/20 border border-red-500/50 rounded-xl p-4"
                    >
                      <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                  )}

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <h3 className="text-blue-400 font-bold mb-2">📋 المعلومات:</h3>
                    <ul className="text-gray-400 text-sm space-y-1">
                      <li>• الحجم الأقصى: 100MB</li>
                      <li>• الدقة: 1920x1080 (موصى)</li>
                      <li>• التنسيق: MP4, WebM, MOV</li>
                      <li>• المجلد: quranic-school/QuestPage</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                    <h3 className="text-yellow-400 font-bold mb-2">⚙️ إعداد Cloudinary:</h3>
                    <ol className="text-gray-400 text-xs space-y-1">
                      <li>1. اذهب إلى Cloudinary Dashboard</li>
                      <li>2. Settings → Upload → Upload presets</li>
                      <li>3. Add upload preset</li>
                      <li>4. Signing Mode: <span className="text-yellow-300">Unsigned</span></li>
                      <li>5. Upload preset name: <span className="text-yellow-300">quranic_upload</span></li>
                      <li>6. Save</li>
                    </ol>
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
