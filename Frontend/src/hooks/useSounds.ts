/**
 * Hook مخصص لاستخدام الأصوات في مكونات React
 * يستخدم مكتبة use-sound للحصول على أداء أفضل
 */

import useSound from 'use-sound';

export interface UseSoundsReturn {
  playAdd: () => void;
  playUpdate: () => void;
  playDelete: () => void;
  playNotification: () => void;
  playError: () => void;
}

/**
 * Hook للتحكم في الأصوات باستخدام مكتبة use-sound
 * @returns كائن يحتوي على وظائف التحكم في الأصوات
 * 
 * @example
 * ```tsx
 * import { useSounds } from '@/hooks/useSounds';
 * 
 * function TeacherManagement() {
 *   const { playAdd, playUpdate, playDelete, playError } = useSounds();
 * 
 *   const handleCreate = async () => {
 *     try {
 *       await api.create();
 *       playAdd(); // 🔊 صوت الإضافة
 *     } catch (error) {
 *       playError(); // 🔊 صوت الخطأ
 *     }
 *   };
 * 
 *   const handleUpdate = async () => {
 *     try {
 *       await api.update();
 *       playUpdate(); // 🔊 صوت التعديل
 *     } catch (error) {
 *       playError();
 *     }
 *   };
 * 
 *   const handleDelete = async () => {
 *     try {
 *       await api.delete();
 *       playDelete(); // 🔊 صوت الحذف
 *     } catch (error) {
 *       playError();
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={handleCreate}>إضافة</button>
 *       <button onClick={handleUpdate}>تعديل</button>
 *       <button onClick={handleDelete}>حذف</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useSounds = (): UseSoundsReturn => {
  // استخدام مكتبة use-sound لتحميل الأصوات
  const [playAddSound] = useSound('/sounds/add.mp3', { 
    volume: 0.5,
    interrupt: true // السماح بمقاطعة الصوت إذا تم تشغيله مرة أخرى
  });
  
  const [playUpdateSound] = useSound('/sounds/update.mp3', { 
    volume: 0.5,
    interrupt: true 
  });
  
  const [playDeleteSound] = useSound('/sounds/delete.mp3', { 
    volume: 0.5,
    interrupt: true 
  });
  
  const [playNotificationSound] = useSound('/sounds/notification.mp3', { 
    volume: 0.5,
    interrupt: true 
  });
  
  const [playErrorSound] = useSound('/sounds/error.mp3', { 
    volume: 0.6,
    interrupt: true 
  });

  return {
    playAdd: playAddSound,
    playUpdate: playUpdateSound,
    playDelete: playDeleteSound,
    playNotification: playNotificationSound,
    playError: playErrorSound,
  };
};

export default useSounds;
