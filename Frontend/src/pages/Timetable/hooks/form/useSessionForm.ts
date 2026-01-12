// ============================================================================
// useSessionForm - هوك لإدارة حالة فورم الجلسة
// ============================================================================
// ⚠️ النظام الجديد: يعتمد على sessionDate (التاريخ المحدد) وليس day

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Session, SessionFormData, UserRole } from "../../types/timetable.types";
import { getCurrentUser, formatDateForAPI, getTodayDate } from "../../utils";
import { getAvailableHours, getTeacherAvailableHours } from "@/Api/TimeTable.Api";
import { getSectionById } from "@/Api/DailyMark/sectionApi";
import { useSearchParams } from "react-router-dom";

interface UseSessionFormProps {
  editingSession: Session | null;
  role: UserRole;
  initialSectionId?: string;
  initialGroupName?: string;
}

export const useSessionForm = ({ 
  editingSession, 
  role, 
  initialSectionId, 
  initialGroupName 
}: UseSessionFormProps) => {
  const [searchParams] = useSearchParams();
  
  // جلب الأوقات المتاحة + المحجوزة من الـ Backend
  const [hours, setHours] = useState<string[]>([]);
  const [bookedHours, setBookedHours] = useState<string[]>([]);
  const [loadingHours, setLoadingHours] = useState(true);
  
  // Logic to determine initial sessionType - memoized
  const getInitialSessionType = useMemo(() => {
    if (editingSession?.sessionType) return editingSession.sessionType;
    const urlSessionType = searchParams.get('sessionType');
    return urlSessionType as any || undefined;
  }, [editingSession?.sessionType, searchParams]);

  // ⚠️ النموذج الجديد - sessionDate مطلوب!
  const [formData, setFormData] = useState<SessionFormData>(() => ({
    sessionDate: getTodayDate(), // ⚠️ تاريخ اليوم كقيمة افتراضية
    startHour: "",
    endHour: "",
    note: initialGroupName || "",
    description: "",
    sessionType: getInitialSessionType,
    teacherId: "",
    groupId: "",
    sectionId: initialSectionId || "",
  }));
  
  // ============================================
  // 🔄 جلب الأوقات من Backend API
  // ============================================
  useEffect(() => {
    const fetchAvailableHours = async () => {
      try {
        setLoadingHours(true);
        
        // 📅 Step 1: جلب جميع الأوقات العامة (صيفي/شتوي)
        const generalResponse = await getAvailableHours();
        if (generalResponse.success) {
          setHours(generalResponse.data.hours);
        }
        
        // 🔍 Step 2: جلب الأوقات المحجوزة للمعلم في التاريخ المحدد
        if (formData.teacherId && formData.sessionDate) {
          const excludeId = editingSession?._id;
          const teacherResponse = await getTeacherAvailableHours(
            formData.teacherId,
            formData.sessionDate, // ⚠️ إرسال التاريخ بدلاً من اليوم
            excludeId
          );
          
          if (teacherResponse.success) {
            const allHours = generalResponse.data.hours;
            const availableHours = teacherResponse.data.availableHours;
            const booked = allHours.filter(h => !availableHours.includes(h));
            setBookedHours(booked);
          }
        } else {
          setBookedHours([]);
        }
      } catch (error: any) {
        const errorMsg = error?.response?.data?.message || error?.message || "حدث خطأ في تحميل الأوقات المتاحة";
        await showErrorMessage("❌ خطأ في تحميل الأوقات", errorMsg);
        const fallbackHours = generateFallbackHours();
        setHours(fallbackHours);
        setBookedHours([]);
      } finally {
        setLoadingHours(false);
      }
    };
    
    fetchAvailableHours();
  }, [formData.teacherId, formData.sessionDate, editingSession?._id]);
  
  // ============================================
  // 📅 Auto-fill Date and SessionType from Section
  // ============================================
  useEffect(() => {
    if (initialSectionId && !editingSession) {
      const fetchSectionDetails = async () => {
        try {
          const section = await getSectionById(initialSectionId);
          if (section) {
            const updates: Partial<SessionFormData> = {};
            
            // تحديد التاريخ
            if (section.date) {
              const dateObj = new Date(section.date);
              const sessionDate = formatDateForAPI(dateObj);
              updates.sessionDate = sessionDate;
            }
            
            // تحديد نوع الحصة تلقائياً بناءً على المقاطع الموجودة
            const hasMemorization = !!(section.memorizationSection || section.memorizationMeta?.length);
            const hasReview = !!(section.reviewSection || section.reviewMeta?.length);
            
            if (hasMemorization && hasReview) {
              updates.sessionType = 'both'; // كلاهما
            } else if (hasMemorization) {
              updates.sessionType = 'hifz'; // حفظ فقط
            } else if (hasReview) {
              updates.sessionType = 'murajaah'; // مراجعة فقط
            }
            
            // Section auto-fill completed
            
            setFormData(prev => ({
              ...prev,
              ...updates,
            }));
          }
        } catch (error: any) {
          // خطأ صامت - لا نظهر رسالة للمستخدم لأنه auto-fill اختياري
        }
      };
      fetchSectionDetails();
    }
  }, [initialSectionId, editingSession]);

  // ============================================
  // 🔄 Fallback: توليد الأوقات محلياً - memoized
  // ============================================
  const generateFallbackHours = useCallback((): string[] => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const isSummer = month >= 5 && month <= 9;
    const fallbackHours: string[] = [];
    
    if (isSummer) {
      for (let h = 12; h <= 21; h++) {
        const display12 = h === 12 ? 12 : h > 12 ? h - 12 : h;
        fallbackHours.push(`${display12}:00 PM`);
        if (h < 21) fallbackHours.push(`${display12}:30 PM`);
      }
    } else {
      fallbackHours.push('11:00 AM', '11:30 AM');
      for (let h = 12; h <= 20; h++) {
        const display12 = h === 12 ? 12 : h > 12 ? h - 12 : h;
        fallbackHours.push(`${display12}:00 PM`);
        if (h < 20) fallbackHours.push(`${display12}:30 PM`);
      }
    }
    
    return fallbackHours;
  }, []);

  const [selectedGroup, setSelectedGroup] = useState<string>("");

  // ============================================
  // ⏰ دالة لتحديث وقت البداية - with useCallback
  // ============================================
  const handleStartHourChange = useCallback((newStartHour: string) => {
    const startIndex = hours.indexOf(newStartHour);
    const nextHour = startIndex >= 0 && startIndex < hours.length - 1 
      ? hours[startIndex + 1] 
      : hours[startIndex];
    
    setFormData(prev => ({ 
      ...prev, 
      startHour: newStartHour,
      endHour: nextHour 
    }));
  }, [hours]);
  
  // ============================================
  // 📅 دالة لتحديث التاريخ - with useCallback
  // ============================================
  const handleDateChange = useCallback((newDate: string) => {
    setFormData(prev => ({
      ...prev,
      sessionDate: newDate,
    }));
  }, []);
  
  // ============================================
  // 🔄 تحديث النموذج عند التعديل
  // ============================================
  useEffect(() => {
    if (editingSession) {
      const teacherIdValue = typeof editingSession.teacherId === 'string' 
        ? editingSession.teacherId 
        : editingSession.teacherId?._id || "";
      
      // التحقق من groupId إذا كان كائنًا
      let groupIdValue = "";
      if (editingSession.groupId) {
        groupIdValue = typeof editingSession.groupId === 'string'
          ? editingSession.groupId
          : String((editingSession.groupId as unknown as { _id?: string })?._id || "");
      }

      setFormData({
        sessionDate: editingSession.sessionDate ? formatDateForAPI(editingSession.sessionDate) : getTodayDate(),
        startHour: editingSession.startHour,
        endHour: editingSession.endHour,
        note: editingSession.note || "",
        description: editingSession.description || "",
        sessionType: editingSession.sessionType,
        teacherId: teacherIdValue,
        groupId: groupIdValue, // ✅ هنا كان الخلل، الآن نستخرجه بشكل صحيح
        sectionId: editingSession.sectionId || "",
      });
      
      if (role === "teacher" && editingSession.note) {
        setSelectedGroup(editingSession.note);
      }
    } else {
      // ➕ وضع الإضافة
      const currentUser = getCurrentUser();
      const defaultTeacherId = role === "teacher" && currentUser?._id ? currentUser._id : "";
      const urlSessionType = searchParams.get('sessionType') as any || undefined;
      
      setFormData(prev => ({
        sessionDate: prev.sessionDate || getTodayDate(),
        startHour: "",
        endHour: "",
        note: initialGroupName || "",
        description: "",
        sessionType: urlSessionType,
        teacherId: defaultTeacherId,
        groupId: "",
        sectionId: initialSectionId || "",
      }));
    }
  }, [editingSession, role, initialSectionId, initialGroupName, searchParams]);

  // ============================================
  // 🔄 تحديث sessionType عند تغيير sectionId يدوياً
  // ============================================
  useEffect(() => {
    // تجنب التنفيذ عند التحميل الأولي أو عند تحرير موعد موجود
    // أو إذا كان sectionId هو نفس initialSectionId (تم التعامل معه في useEffect السابق)
    if (!formData.sectionId || editingSession || formData.sectionId === initialSectionId) return;
    
    const updateSessionTypeFromSection = async () => {
      try {
        const section = await getSectionById(formData.sectionId);
        if (section) {
          const hasMemorization = !!(section.memorizationSection || section.memorizationMeta?.length);
          const hasReview = !!(section.reviewSection || section.reviewMeta?.length);
          
          let autoSessionType: 'hifz' | 'murajaah' | 'both' | undefined;
          
          if (hasMemorization && hasReview) {
            autoSessionType = 'both';
          } else if (hasMemorization) {
            autoSessionType = 'hifz';
          } else if (hasReview) {
            autoSessionType = 'murajaah';
          }
          
          // تحديث sessionType فقط إذا كان مختلفاً
          if (autoSessionType && autoSessionType !== formData.sessionType) {
            // Auto-updating sessionType from section
            
            setFormData(prev => ({
              ...prev,
              sessionType: autoSessionType,
            }));
          }
        }
      } catch (error: any) {
        // خطأ صامت - لا نظهر رسالة للمستخدم لأنه auto-update اختياري
      }
    };
    
    updateSessionTypeFromSection();
  }, [formData.sectionId, editingSession, initialSectionId]); // الاعتماديات الضرورية فقط

  // دالة لإعادة تعيين النموذج (reset) - with useCallback
  const resetForm = useCallback(() => {
    const currentUser = getCurrentUser();
    const defaultTeacherId = role === "teacher" && currentUser?._id ? currentUser._id : "";
    
    setFormData({
      sessionDate: getTodayDate(),
      startHour: "",
      endHour: "",
      note: initialGroupName || "",
      description: "",
      sessionType: undefined,
      teacherId: defaultTeacherId,
      groupId: "",
      sectionId: initialSectionId || "",
    });
    setSelectedGroup("");
    setBookedHours([]);
  }, [role, initialGroupName, initialSectionId]);

  return {
    formData,
    setFormData,
    selectedGroup,
    setSelectedGroup,
    hours,
    bookedHours,
    loadingHours,
    handleStartHourChange,
    handleDateChange, // 📅 جديد
    resetForm,
  };
};
