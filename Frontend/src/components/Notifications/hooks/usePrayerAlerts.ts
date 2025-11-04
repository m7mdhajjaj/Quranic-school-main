// ============================================================================
// usePrayerAlerts Hook
// ============================================================================
// Custom hook للاستماع لأحداث الصلاة وعرض التنبيهات

import { useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { socketManager } from '@/Socket';
import { useSound } from '@/components/Hooks/useSounds';
import type { PrayerData } from '../types';

export const usePrayerAlerts = () => {
  // صوت الأذان بحجم منخفض نسبياً
  const { playSound: playAdhan, stopSound: stopAdhan } = useSound({
    soundPath: '/sounds/Adhan.mp3',
    volume: 0.5,
  });

  // عرض تنبيه قبل الصلاة (10 دقائق)
  const showPrayerReminder = useCallback((data: PrayerData) => {
    const minutes = data.minutesRemaining || 10;
    
    Swal.fire({
      title: `${data.emoji} تنبيه صلاة ${data.prayerName}`,
      html: `
        <div class="text-center">
          <div class="text-6xl mb-4">${data.emoji}</div>
          <p class="text-xl mb-2">باقي <strong>${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}</strong> على صلاة ${data.prayerName}</p>
          <p class="text-lg text-gray-600">الوقت: ${data.prayerTime}</p>
          <p class="text-md text-emerald-600 mt-4">🕌 استعدوا للصلاة</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'حسناً',
      confirmButtonColor: '#10b981',
      timer: 8000,
      timerProgressBar: true,
      backdrop: `rgba(0,123,255,0.1) left top no-repeat`,
    });
  }, []);

  // عرض تنبيه قبل الأذان (4 دقائق) - تنبيه ثاني
  const showPreAdhanReminder = useCallback((data: PrayerData) => {
    Swal.fire({
      title: `${data.emoji} تنبيه أذان ${data.prayerName}`,
      html: `
        <div class="text-center">
          <div class="text-7xl mb-4 animate-pulse">${data.emoji}</div>
          <p class="text-2xl font-bold mb-2 text-orange-600">⏰ باقي 4 دقائق على الأذان</p>
          <p class="text-xl mb-2">صلاة ${data.prayerName}</p>
          <p class="text-lg text-gray-600 mb-4">الوقت: ${data.prayerTime}</p>
          <div class="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
            <p class="text-md text-orange-700 font-semibold">🕌 حان وقت التوجه للصلاة</p>
          </div>
        </div>
      `,
      icon: 'warning',
      confirmButtonText: 'حسناً',
      confirmButtonColor: '#f59e0b',
      timer: 8000,
      timerProgressBar: true,
      backdrop: `rgba(245,158,11,0.15) left top no-repeat`,
      customClass: {
        popup: 'animate__animated animate__headShake',
      },
    });
  }, []);

  // عرض إشعار الأذان
  const showPrayerAdhan = useCallback(
    (data: PrayerData) => {
      // تشغيل صوت الأذان
      playAdhan();

      Swal.fire({
        title: `${data.emoji} أذان ${data.prayerName}`,
        html: `
        <div class="text-center">
          <div class="text-8xl mb-4 animate-bounce">${data.emoji}</div>
          <p class="text-2xl font-bold mb-2">🕌 حان وقت صلاة ${data.prayerName}</p>
          <p class="text-xl text-gray-600 mb-4">${data.prayerTime}</p>
          <div class="text-3xl text-emerald-600 font-arabic mb-2">
            الله أكبر الله أكبر
          </div>
          <p class="text-lg text-gray-500">بارك الله فيكم</p>
        </div>
      `,
        icon: 'success',
        confirmButtonText: 'الذهاب للصلاة',
        confirmButtonColor: '#059669',
        showCloseButton: true,
        allowOutsideClick: false,
        backdrop: `rgba(16,185,129,0.2) left top no-repeat`,
        customClass: {
          popup: 'animate__animated animate__fadeInDown',
        },
        didClose: () => {
          // إيقاف الصوت عند إغلاق الإشعار
          stopAdhan();
        },
      });
    },
    [playAdhan, stopAdhan]
  );

  // الاستماع لأحداث الصلاة
  useEffect(() => {
    const socketInstance = socketManager.getSocket();
    if (!socketInstance) return;

    // التنبيه الأول: قبل 10 دقائق
    const handlePrayerReminder = (data: PrayerData) => {
      console.log('⏰ Prayer reminder received (10 min):', data);
      showPrayerReminder(data);
    };

    // التنبيه الثاني: قبل 4 دقائق من الأذان
    const handlePreAdhanReminder = (data: PrayerData) => {
      console.log('⚠️ Pre-adhan reminder received (4 min):', data);
      showPreAdhanReminder(data);
    };

    // الأذان: وقت الصلاة
    const handlePrayerAdhan = (data: PrayerData) => {
      console.log('🔔 Prayer adhan received:', data);
      showPrayerAdhan(data);
    };

    socketInstance.on('prayerReminder', handlePrayerReminder);
    socketInstance.on('preAdhanReminder', handlePreAdhanReminder);
    socketInstance.on('prayerAdhan', handlePrayerAdhan);

    return () => {
      socketInstance.off('prayerReminder', handlePrayerReminder);
      socketInstance.off('preAdhanReminder', handlePreAdhanReminder);
      socketInstance.off('prayerAdhan', handlePrayerAdhan);
      // إيقاف الصوت عند unmount
      stopAdhan();
    };
  }, [showPrayerReminder, showPreAdhanReminder, showPrayerAdhan, stopAdhan]);

  return {
    showPrayerReminder,
    showPreAdhanReminder,
    showPrayerAdhan,
  };
};
