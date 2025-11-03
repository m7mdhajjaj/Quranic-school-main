import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Swal from 'sweetalert2';
import { SOCKET_URL } from '../../config/config';

interface PrayerData {
  prayerName: string;
  prayerTime: string;
  emoji: string;
  minutesRemaining?: number;
  timestamp: Date;
}

/**
 * مكون لاستقبال وعرض إشعارات الصلاة من Backend
 * يستقبل نوعين من الإشعارات:
 * 1. prayerReminder: تنبيه قبل 10 دقائق من الأذان
 * 2. prayerAdhan: إشعار وقت الأذان مع تشغيل صوت الأذان
 */
export const PrayerAlertHandler = () => {
import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Swal from 'sweetalert2';
import { SOCKET_URL } from '../../config/config';

interface PrayerData {
  prayerName: string;
  prayerTime: string;
  emoji: string;
  minutesRemaining?: number;
  timestamp: Date;
}

/**
 * مكون لاستقبال وعرض إشعارات الصلاة من Backend
 * يستقبل نوعين من الإشعارات:
 * 1. prayerReminder: تنبيه قبل 10 دقائق من الأذان
 * 2. prayerAdhan: إشعار وقت الأذان مع تشغيل صوت الأذان
 */
export const PrayerAlertHandler = () => {
  const socketRef = useRef<Socket | null>(null);
  const adhanAudioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * تشغيل صوت الأذان
   */
  const playAdhanSound = useCallback(() => {
    try {
      // إيقاف أي صوت سابق
      if (adhanAudioRef.current) {
        adhanAudioRef.current.pause();
        adhanAudioRef.current.currentTime = 0;
      }

      // تشغيل صوت الأذان
      const audio = new Audio('/sounds/adhan.mp3');
      audio.volume = 0.7;
      audio.play().catch((err) => {
        console.log('⚠️ Could not play adhan sound:', err);
      });

      adhanAudioRef.current = audio;
    } catch (error) {
      console.log('⚠️ Error initializing adhan sound:', error);
    }
  }, []);

  /**
   * إيقاف صوت الأذان
   */
  const stopAdhanSound = useCallback(() => {
    if (adhanAudioRef.current) {
      adhanAudioRef.current.pause();
      adhanAudioRef.current.currentTime = 0;
      adhanAudioRef.current = null;
    }
  }, []);

  /**
   * عرض تنبيه قبل 10 دقائق من الصلاة
   */
  const showPrayerReminderAlert = useCallback((data: PrayerData) => {
    const { prayerName, prayerTime, emoji, minutesRemaining = 10 } = data;

    Swal.fire({
      position: 'top-end',
      icon: 'info',
      title: `${emoji} تنبيه صلاة ${prayerName}`,
      html: `
        <div style="text-align: center; direction: rtl;">
          <p style="font-size: 18px; margin: 10px 0;">
            <strong>باقي ${minutesRemaining} دقائق على صلاة ${prayerName}</strong>
          </p>
          <p style="font-size: 16px; color: #666;">
            ⏰ الوقت: ${prayerTime}
          </p>
          <p style="font-size: 14px; color: #888; margin-top: 10px;">
            استعدوا للصلاة
          </p>
        </div>
      `,
      showConfirmButton: false,
      timer: 8000,
      timerProgressBar: true,
      toast: true,
      background: '#fff3cd',
      customClass: {
        popup: 'prayer-reminder-alert',
      },
    });
  }, []);

  /**
   * عرض إشعار الأذان مع تشغيل صوت الأذان
   */
  const showPrayerAdhanAlert = useCallback((data: PrayerData) => {
    const { prayerName, prayerTime, emoji } = data;

    // تشغيل صوت الأذان
    playAdhanSound();

    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: `${emoji} أذان ${prayerName}`,
      html: `
        <div style="text-align: center; direction: rtl;">
          <p style="font-size: 24px; margin: 15px 0; font-weight: bold;">
            🕌 الله أكبر الله أكبر
          </p>
          <p style="font-size: 20px; margin: 10px 0;">
            <strong>حان وقت صلاة ${prayerName}</strong>
          </p>
          <p style="font-size: 18px; color: #666;">
            ⏰ الوقت: ${prayerTime}
          </p>
          <p style="font-size: 16px; color: #28a745; margin-top: 15px;">
            بارك الله فيكم
          </p>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: '🤲 حسناً',
      confirmButtonColor: '#28a745',
      timer: 15000,
      timerProgressBar: true,
      toast: true,
      background: '#d4edda',
      customClass: {
        popup: 'prayer-adhan-alert',
      },
      didClose: () => {
        // إيقاف صوت الأذان عند إغلاق الإشعار
        stopAdhanSound();
      },
    });
  }, [playAdhanSound, stopAdhanSound]);
    // التحقق من تسجيل دخول المستخدم
    const userToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!userToken || !userData) {
      console.log('⚠️ User not logged in, prayer alerts disabled');
      return;
    }

    // إنشاء اتصال Socket.IO
    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🕌 Prayer alerts connected');
    });

    socket.on('disconnect', () => {
      console.log('🕌 Prayer alerts disconnected');
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ Prayer socket connection error:', error.message);
    });

    // استقبال تنبيه قبل 10 دقائق من الصلاة
    socket.on('prayerReminder', (data: any) => {
      console.log('⏰ Prayer reminder received:', data);
      showPrayerReminderAlert(data);
    });

    // استقبال إشعار الأذان
    socket.on('prayerAdhan', (data: any) => {
      console.log('🔔 Prayer adhan received:', data);
      showPrayerAdhanAlert(data);
    });

    return () => {
      socket.close();
      if (adhanAudioRef.current) {
        adhanAudioRef.current.pause();
        adhanAudioRef.current = null;
      }
    };
  }, []);

  /**
   * عرض تنبيه قبل 10 دقائق من الصلاة
   */
  const showPrayerReminderAlert = (data: any) => {
    const { prayerName, prayerTime, emoji, minutesRemaining = 10 } = data;

    Swal.fire({
      position: 'top-end',
      icon: 'info',
      title: `${emoji} تنبيه صلاة ${prayerName}`,
      html: `
        <div style="text-align: center; direction: rtl;">
          <p style="font-size: 18px; margin: 10px 0;">
            <strong>باقي ${minutesRemaining} دقائق على صلاة ${prayerName}</strong>
          </p>
          <p style="font-size: 16px; color: #666;">
            ⏰ الوقت: ${prayerTime}
          </p>
          <p style="font-size: 14px; color: #888; margin-top: 10px;">
            استعدوا للصلاة
          </p>
        </div>
      `,
      showConfirmButton: false,
      timer: 8000,
      timerProgressBar: true,
      toast: true,
      background: '#fff3cd',
      customClass: {
        popup: 'prayer-reminder-alert',
      },
    });
  };

  /**
   * عرض إشعار الأذان مع تشغيل صوت الأذان
   */
  const showPrayerAdhanAlert = (data: any) => {
    const { prayerName, prayerTime, emoji } = data;

    // تشغيل صوت الأذان
    playAdhanSound();

    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: `${emoji} أذان ${prayerName}`,
      html: `
        <div style="text-align: center; direction: rtl;">
          <p style="font-size: 24px; margin: 15px 0; font-weight: bold;">
            🕌 الله أكبر الله أكبر
          </p>
          <p style="font-size: 20px; margin: 10px 0;">
            <strong>حان وقت صلاة ${prayerName}</strong>
          </p>
          <p style="font-size: 18px; color: #666;">
            ⏰ الوقت: ${prayerTime}
          </p>
          <p style="font-size: 16px; color: #28a745; margin-top: 15px;">
            بارك الله فيكم
          </p>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: '🤲 حسناً',
      confirmButtonColor: '#28a745',
      timer: 15000,
      timerProgressBar: true,
      toast: true,
      background: '#d4edda',
      customClass: {
        popup: 'prayer-adhan-alert',
      },
      didClose: () => {
        // إيقاف صوت الأذان عند إغلاق الإشعار
        stopAdhanSound();
      },
    });
  };

  /**
   * تشغيل صوت الأذان
   */
  const playAdhanSound = () => {
    try {
      // إيقاف أي صوت سابق
      if (adhanAudioRef.current) {
        adhanAudioRef.current.pause();
        adhanAudioRef.current.currentTime = 0;
      }

      // تشغيل صوت الأذان
      const audio = new Audio('/sounds/adhan.mp3');
      audio.volume = 0.7;
      audio.play().catch((err) => {
        console.log('⚠️ Could not play adhan sound:', err);
      });

      adhanAudioRef.current = audio;
    } catch (error) {
      console.log('⚠️ Error initializing adhan sound:', error);
    }
  };

  /**
   * إيقاف صوت الأذان
   */
  const stopAdhanSound = () => {
    if (adhanAudioRef.current) {
      adhanAudioRef.current.pause();
      adhanAudioRef.current.currentTime = 0;
      adhanAudioRef.current = null;
    }
  };

  return null; // هذا المكون لا يعرض أي UI
};
