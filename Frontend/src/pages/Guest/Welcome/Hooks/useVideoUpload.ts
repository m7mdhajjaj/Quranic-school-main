// ============================================================================
// useVideoUpload.ts - Hook لرفع فيديو الترحيب عبر Backend
// ============================================================================

import { useState, useRef, useCallback } from 'react';
import api from '@/Api/api';

interface UseVideoUploadReturn {
  isOpen: boolean;
  uploading: boolean;
  uploadProgress: number;
  uploadedUrl: string;
  error: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  openModal: () => void;
  closeModal: () => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReset: () => void;
}

export const useVideoUpload = (onVideoUploaded?: (url: string) => void): UseVideoUploadReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => {
    if (!uploading) setIsOpen(false);
  }, [uploading]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('video/')) {
      setError('الرجاء اختيار ملف فيديو فقط');
      return;
    }

    // التحقق من حجم الملف (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      setError('حجم الفيديو يجب أن يكون أقل من 100MB');
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);

      console.log('🎬 جاري رفع الفيديو عبر Backend...');
      console.log('📁 الحجم:', (file.size / (1024 * 1024)).toFixed(2), 'MB');

      // رفع عبر Backend API
      const response = await api.post('/upload/welcome-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setUploadProgress(progress);
            console.log(`📤 جاري الرفع: ${progress}%`);
          }
        },
      });

      if (response.data.success) {
        const videoUrl = response.data.data.url;
        
        setUploadedUrl(videoUrl);
        setUploading(false);
        
        if (onVideoUploaded) {
          onVideoUploaded(videoUrl);
        }
        
        console.log('✅ تم رفع الفيديو بنجاح وحفظه في قاعدة البيانات:', videoUrl);
        console.log('🔄 جاري تحديث الفيديو في الصفحة...');
        
        // تحديث الـ cache في localStorage
        localStorage.setItem('welcomeVideoUrl', videoUrl);
        localStorage.setItem('welcomeVideoTimestamp', Date.now().toString());
        
        // إعادة تحميل الصفحة بعد 1.5 ثانية لعرض الفيديو الجديد
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error(response.data.message || 'فشل رفع الفيديو');
      }
    } catch (err: unknown) {
      console.error('❌ خطأ في رفع الفيديو:', err);
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء رفع الفيديو';
      setError(errorMessage);
      setUploading(false);
    }
  }, [onVideoUploaded]);

  const handleReset = useCallback(async () => {
    try {
      // حذف من Backend (قاعدة البيانات و Cloudinary)
      await api.delete('/upload/welcome-video');
      
      setUploadedUrl('');
      
      // حذف الـ cache من localStorage
      localStorage.removeItem('welcomeVideoUrl');
      localStorage.removeItem('welcomeVideoTimestamp');
      
      console.log('✅ تم حذف الفيديو من قاعدة البيانات واستعادة الافتراضي');
      
      // إعادة تحميل الصفحة لجلب الفيديو الافتراضي
      window.location.reload();
    } catch (err) {
      console.error('❌ خطأ في حذف الفيديو:', err);
      
      // حذف الـ cache حتى في حالة الخطأ
      localStorage.removeItem('welcomeVideoUrl');
      localStorage.removeItem('welcomeVideoTimestamp');
      
      setUploadedUrl('');
      window.location.reload();
    }
  }, []);

  return {
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
  };
};

export default useVideoUpload;
