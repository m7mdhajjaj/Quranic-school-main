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
        
        // حفظ في localStorage للاستخدام الفوري
        localStorage.setItem('welcomePageVideoUrl', videoUrl);
        
        if (onVideoUploaded) {
          onVideoUploaded(videoUrl);
        }
        
        console.log('✅ تم رفع الفيديو بنجاح:', videoUrl);
        
        // إعادة تحميل الصفحة بعد ثانيتين
        setTimeout(() => {
          window.location.reload();
        }, 2000);
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
      // حذف من Backend
      await api.delete('/upload/welcome-video');
      
      // مسح من localStorage
      localStorage.removeItem('welcomePageVideoUrl');
      setUploadedUrl('');
      
      console.log('✅ تم استعادة الفيديو الافتراضي');
      
      window.location.reload();
    } catch (err) {
      console.error('❌ خطأ في حذف الفيديو:', err);
      // حتى لو فشل، نمسح من localStorage
      localStorage.removeItem('welcomePageVideoUrl');
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
