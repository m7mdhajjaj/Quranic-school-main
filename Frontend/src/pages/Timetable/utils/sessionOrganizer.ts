// ============================================================================
// Session Organizer - تنظيم وفرز الحصص
// ============================================================================
// ⚠️ النظام الجديد: يعتمد على sessionDate (التاريخ المحدد)

import type { Session } from '../types/timetable.types';
import { WEEK_DAYS, getDayNameFromDate } from './timetableHelpers';

/**
 * تنظيم الحصص حسب التاريخ
 * @param sessions - مصفوفة الحصص
 * @returns كائن يحتوي على الحصص مجمعة حسب التاريخ (YYYY-MM-DD)
 */
export const organizeSessionsByDate = (sessions: Session[]): Record<string, Session[]> => {
  const organized: Record<string, Session[]> = {};
  
  sessions.forEach(session => {
    if (!session.sessionDate) return;
    
    const dateKey = session.sessionDate.split('T')[0]; // YYYY-MM-DD
    if (!organized[dateKey]) {
      organized[dateKey] = [];
    }
    organized[dateKey].push(session);
  });
  
  // ترتيب الحصص داخل كل يوم حسب وقت البداية
  Object.keys(organized).forEach(dateKey => {
    organized[dateKey].sort((a, b) => {
      const aTime = a.startHour.toLowerCase();
      const bTime = b.startHour.toLowerCase();
      return aTime.localeCompare(bTime);
    });
  });
  
  return organized;
};

/**
 * تنظيم الحصص حسب اسم اليوم (للتوافق مع العرض الأسبوعي)
 * ⚠️ يستخدم sessionDate للحصول على اسم اليوم
 */
export const organizeSessionsByDay = (sessions: Session[]): Record<string, Session[]> => {
  const organized: Record<string, Session[]> = {};
  
  // تهيئة كل يوم بمصفوفة فارغة
  WEEK_DAYS.forEach(day => {
    organized[day] = [];
  });
  
  // ⚠️ تجميع الحصص حسب اليوم المشتق من sessionDate
  sessions.forEach(session => {
    const dayName = session.day || (session.sessionDate ? getDayNameFromDate(session.sessionDate) : null);
    if (dayName && organized[dayName]) {
      organized[dayName].push(session);
    }
  });
  
  // ترتيب الحصص داخل كل يوم حسب وقت البداية
  Object.keys(organized).forEach(day => {
    organized[day].sort((a, b) => {
      const aTime = a.startHour.toLowerCase();
      const bTime = b.startHour.toLowerCase();
      return aTime.localeCompare(bTime);
    });
  });
  
  return organized;
};

/**
 * فلترة الحصص حسب معايير معينة
 * ⚠️ يدعم الفلترة بالتاريخ (sessionDate)
 */
export const filterSessions = (
  sessions: Session[],
  filters: {
    sessionDate?: string;  // ⚠️ فلترة بالتاريخ
    day?: string;          // للتوافق - يُشتق من sessionDate
    teacherId?: string;
    sessionType?: string;
    groupName?: string;
  }
): Session[] => {
  return sessions.filter(session => {
    // ⚠️ فلترة بالتاريخ
    if (filters.sessionDate) {
      const sessionDateKey = session.sessionDate?.split('T')[0];
      if (sessionDateKey !== filters.sessionDate) return false;
    }
    
    // فلترة باليوم (للتوافق)
    if (filters.day) {
      const dayName = session.day || (session.sessionDate ? getDayNameFromDate(session.sessionDate) : null);
      if (dayName !== filters.day) return false;
    }
    
    if (filters.teacherId) {
      const sessionTeacherId = typeof session.teacherId === 'object' 
        ? session.teacherId._id 
        : session.teacherId;
      if (sessionTeacherId !== filters.teacherId) return false;
    }
    
    if (filters.sessionType && session.sessionType !== filters.sessionType) return false;
    
    if (filters.groupName && session.note !== filters.groupName) return false;
    
    return true;
  });
};

/**
 * البحث في الحصص
 * @param sessions - مصفوفة الحصص
 * @param searchTerm - نص البحث
 * @returns الحصص المطابقة
 */
export const searchSessions = (sessions: Session[], searchTerm: string): Session[] => {
  if (!searchTerm || searchTerm.trim() === '') return sessions;
  
  const term = searchTerm.toLowerCase().trim();
  
  return sessions.filter(session => {
    // البحث في اسم الحلقة
    if (session.note?.toLowerCase().includes(term)) return true;
    
    // البحث في اسم المعلم
    if (typeof session.teacherId === 'object') {
      const teacherName = `${session.teacherId.firstName} ${session.teacherId.lastName}`.toLowerCase();
      if (teacherName.includes(term)) return true;
    }
    
    // البحث في الوصف
    if (session.description?.toLowerCase().includes(term)) return true;
    
    // البحث في اليوم
    if (session.day.toLowerCase().includes(term)) return true;
    
    return false;
  });
};

/**
 * حساب إحصائيات الحصص
 * @param sessions - مصفوفة الحصص
 * @returns كائن يحتوي على الإحصائيات
 */
export const getSessionsStats = (sessions: Session[]) => {
  const stats = {
    total: sessions.length,
    byDay: {} as Record<string, number>,
    byType: {
      hifz: 0,
      murajaah: 0,
      both: 0,
      undefined: 0,
    },
    byTeacher: {} as Record<string, number>,
  };
  
  sessions.forEach(session => {
    // إحصائيات حسب اليوم
    stats.byDay[session.day] = (stats.byDay[session.day] || 0) + 1;
    
    // إحصائيات حسب النوع
    if (session.sessionType === 'hifz') {
      stats.byType.hifz++;
    } else if (session.sessionType === 'murajaah') {
      stats.byType.murajaah++;
    } else if (session.sessionType === 'both') {
      stats.byType.both++;
    } else {
      stats.byType.undefined++;
    }
    
    // إحصائيات حسب المعلم
    if (session.teacherId) {
      const teacherId = typeof session.teacherId === 'object' 
        ? session.teacherId._id 
        : session.teacherId;
      stats.byTeacher[teacherId] = (stats.byTeacher[teacherId] || 0) + 1;
    }
  });
  
  return stats;
};
