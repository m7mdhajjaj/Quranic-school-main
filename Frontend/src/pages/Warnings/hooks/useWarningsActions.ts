// ============================================================================
// useWarningsActions Hook - إدارة عمليات الإنذارات
// ============================================================================

import { useState, useCallback } from 'react';
import * as warningApi from '@/Api/warningApi';
import { validateCreateWarning } from '@/Validation/warningValidation';
import type {
  Student,
  WarningType,
  TeacherStatistics,
  UseWarningsActionsReturn,
} from '../types/warnings';

export const useWarningsActions = (): UseWarningsActionsReturn => {
  const [loadingStatistics, setLoadingStatistics] = useState(false);
  const [statistics, setStatistics] = useState<TeacherStatistics | null>(null);

  // ✅ جلب إحصائيات المعلم - محسّن بـ useCallback
  const fetchTeacherStatistics = useCallback(async () => {
    try {
      setLoadingStatistics(true);
      const data = await warningApi.getTeacherStatistics();
      setStatistics(data);
      return data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // تم إزالة Toast - سيتم عرض الأخطاء في SweetAlert فقط
      return null;
    } finally {
      setLoadingStatistics(false);
    }
  }, []);

  // ✅ إعطاء إنذار - محسّن بـ useCallback
  const giveWarning = useCallback(async (
    student: Student,
    type: WarningType,
    reason: string,
    groupName: string,
    teacherId: string
  ) => {
    // ✅ التحقق من صحة البيانات قبل الإرسال
    const validationResult = validateCreateWarning({
      studentId: student._id,
      teacherId,
      groupName,
      type,
      reason,
    });

    if (!validationResult.isValid) {
      throw new Error(validationResult.errors.join('<br>'));
    }

    try {
      await warningApi.createWarning({
        studentId: student._id,
        teacherId,
        groupName,
        type,
        reason,
      });

      // Socket سيقوم بالتحديث تلقائياً - لا داعي لاستدعاءات API إضافية
      
      return true;
    } catch (error: any) {
      console.error('❌ Error giving warning:', error);
      
      // معالجة أخطاء محددة وإرجاع رسالة الخطأ
      if (error?.response?.status === 400) {
        console.error('📋 Validation error details:', error?.response?.data);
        const errorData = error?.response?.data;
        
        // استخراج رسالة الخطأ
        let errorMessage = errorData?.message || 'بيانات غير صحيحة';
        
        // إذا كان هناك أخطاء تفصيلية
        if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors.map((err: any) => err.message || err).join('<br>');
        }
        
        throw new Error(errorMessage);
      }
      
      // أخطاء أخرى
      const errorMessage = error?.response?.data?.message || 'حدث خطأ أثناء إعطاء الإنذار';
      throw new Error(errorMessage);
    }
  }, []);

  // ✅ حذف إنذار - انتظار النتيجة الفعلية
  const deleteWarning = useCallback(async (student: Student, warningType: string): Promise<boolean> => {
    try {
      // ⚡ انتظار الحذف الفعلي من الـ API
      const response = await warningApi.deleteWarningByType(student._id, warningType);
      console.log('✅ Delete warning success:', response);
      return true;
    } catch (error: any) {
      console.error('❌ Error deleting warning:', error);
      console.error('❌ Error response:', error?.response?.data);
      return false;
    }
  }, []);

  // ✅ حذف تنبيه بالـ ID - انتظار النتيجة الفعلية
  const deleteWarningById = useCallback(async (warningId: string): Promise<boolean> => {
    try {
      // ⚡ انتظار الحذف الفعلي من الـ API
      const response = await warningApi.deleteWarningById(warningId);
      console.log('✅ Delete warning by ID success:', response);
      return true;
    } catch (error: any) {
      console.error('❌ Error deleting warning:', error);
      console.error('❌ Error response:', error?.response?.data);
      return false;
    }
  }, []);

  return {
    statistics,
    loadingStatistics,
    fetchTeacherStatistics,
    giveWarning,
    deleteWarning,
    deleteWarningById,
  };
};
