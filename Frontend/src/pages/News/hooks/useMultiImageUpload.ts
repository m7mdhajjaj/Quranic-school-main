import { useState, useEffect, useRef } from 'react';

interface UseMultiImageUploadProps {
  existingImages?: string[];
  maxImages?: number;
  mode?: 'single' | 'multiple';
  onImagesChange: (files: File[]) => void;
}

export const useMultiImageUpload = ({
  existingImages = [],
  maxImages = 10,
  mode = 'multiple',
  onImagesChange,
}: UseMultiImageUploadProps) => {
  const [previews, setPreviews] = useState<string[]>(existingImages);
  const [files, setFiles] = useState<File[]>([]);
  const [hasExistingImages, setHasExistingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveMaxImages = mode === 'single' ? 1 : maxImages;

  // Update previews when existingImages changes
  useEffect(() => {
    if (existingImages && existingImages.length > 0) {
      setPreviews(existingImages);
      setHasExistingImages(true);
      setFiles([]);
    } else {
      setPreviews([]);
      setHasExistingImages(false);
      setFiles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingImages?.join(',')]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const currentFiles = (mode === 'single' || hasExistingImages) ? [] : files;
    
    const totalImages = currentFiles.length + selectedFiles.length;
    if (totalImages > effectiveMaxImages) {
      const message = mode === 'single' 
        ? 'يمكنك رفع صورة واحدة فقط'
        : `يمكنك رفع حتى ${effectiveMaxImages} صور فقط`;
      alert(message);
      return;
    }

    const validFiles = selectedFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`الملف ${file.name} ليس صورة`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`الملف ${file.name} أكبر من 5MB`);
        return false;
      }
      const isDuplicate = currentFiles.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      );
      if (isDuplicate) {
        alert(`الصورة ${file.name} موجودة بالفعل`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const updatedFiles = hasExistingImages ? validFiles : [...currentFiles, ...validFiles];
    setFiles(updatedFiles);
    setHasExistingImages(false);

    onImagesChange(updatedFiles);

    const newPreviews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) {
          if (hasExistingImages || mode === 'single') {
            setPreviews(newPreviews);
          } else {
            setPreviews(prev => [...prev, ...newPreviews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    const newFiles = files.filter((_, i) => i !== index);
    
    setPreviews(newPreviews);
    setFiles(newFiles);
    setHasExistingImages(false);
    onImagesChange(newFiles);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return {
    previews,
    files,
    hasExistingImages,
    fileInputRef,
    effectiveMaxImages,
    handleFileSelect,
    removeImage,
    handleUploadClick,
  };
};
