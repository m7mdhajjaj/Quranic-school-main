// ============================================================================
// useSessionForm - هوك لإدارة حالة فورم الجلسة
// ============================================================================

import { useState, useEffect } from "react";
import type { Session, SessionFormData, UserRole } from "../types/timetable.types";
import { WEEK_DAYS, getCurrentUser } from "../utils";
import { getAvailableHours, getAvailableHoursForTeacher } from "@/Api/TimeTable.Api";
import { getSectionById } from "@/Api/DailyMark/sectionApi";
import { useSearchParams } from "react-router-dom";

interface UseSessionFormProps {
  editingSession: Session | null;
  role: UserRole;
  teacherGroups?: string[];
  initialSectionId?: string;
  initialGroupName?: string;
}

export const useSessionForm = ({ editingSession, role, teacherGroups = [], initialSectionId, initialGroupName }: UseSessionFormProps) => {
  const [searchParams] = useSearchParams();
  // جلب كل الأوقات + الأوقات المحجوزة من الـ Backend
  const [hours, setHours] = useState<string[]>([]);
  const [bookedHours, setBookedHours] = useState<string[]>([]); // الأوقات المحجوزة (للتعطيل)
  const [loadingHours, setLoadingHours] = useState(true);
  
  // Logic to determine initial sessionType
  const getInitialSessionType = () => {
    if (editingSession?.sessionType) return editingSession.sessionType;
    const urlSessionType = searchParams.get('sessionType');
    return urlSessionType as any || undefined;
  };

  const [formData, setFormData] = useState<SessionFormData>(() => ({
    day: WEEK_DAYS[0],
    startHour: "",
    endHour: "",
    note: initialGroupName || "",
    description: "",
    sessionType: getInitialSessionType(),
    teacherId: "",
    sectionId: initialSectionId || "",
  }));
  
  // ============================================
  // 🔄 جلب الأوقات من Backend API
  // ============================================
  // يجلب:
  // 1. جميع الأوقات المتاحة حسب الموسم (صيفي/شتوي) من /sessions/available-hours
  // 2. الأوقات المحجوزة للمعلم من /sessions/available-hours-teacher
  useEffect(() => {
    const fetchAvailableHours = async () => {
      try {
        setLoadingHours(true);
        
        // 📅 Step 1: جلب جميع الأوقات العامة (صيفي/شتوي)
        const generalResponse = await getAvailableHours();
        if (generalResponse.success) {
          setHours(generalResponse.data.hours);
        }
        
        // 🔍 Step 2: جلب الأوقات المحجوزة للمعلم (إن وُجد)
        if (formData.teacherId && formData.day) {
          const excludeId = editingSession?._id; // استثناء الجلسة الحالية عند التعديل
          const teacherResponse = await getAvailableHoursForTeacher(
            formData.teacherId,
            formData.day,
            excludeId
          );
          
          if (teacherResponse.success) {
            // 🚫 حساب الأوقات المحجوزة = كل الأوقات - الأوقات المتاحة
            const allHours = generalResponse.data.hours;
            const availableHours = teacherResponse.data.availableHours;
            const booked = allHours.filter(h => !availableHours.includes(h));
            setBookedHours(booked);
          }
        } else {
          // ℹ️ لا يوجد محجوزات إذا لم يُحدد معلم أو يوم
          setBookedHours([]);
        }
      } catch (error) {
        console.error("❌ خطأ في جلب الأوقات:", error);
        // Fallback: استخدام توليد محلي إذا فشل الـ API
        const fallbackHours = generateFallbackHours();
        setHours(fallbackHours);
        setBookedHours([]);
      } finally {
        setLoadingHours(false);
      }
    };
    
    fetchAvailableHours();
  }, [formData.teacherId, formData.day, editingSession?._id]);
  
  // ============================================
  // � Auto-fill Day from Section Date
  // ============================================
  useEffect(() => {
    if (initialSectionId && !editingSession) {
      const fetchSectionDetails = async () => {
        try {
          const section = await getSectionById(initialSectionId);
          if (section?.date) {
            const dateObj = new Date(section.date);
            const jsDay = dateObj.getDay(); // 0 = Sunday
            // WEEK_DAYS starts with Saturday (0)
            // Sat(6) -> 0, Sun(0) -> 1
            const dayIndex = (jsDay + 1) % 7;
            const targetDay = WEEK_DAYS[dayIndex];
            
            setFormData(prev => ({
              ...prev,
              day: targetDay
            }));
          }
        } catch (error) {
          console.error("Failed to auto-fill day from section:", error);
        }
      };
      
      fetchSectionDetails();
    }
  }, [initialSectionId, editingSession]);

  // ============================================
  // �🔄 Fallback: توليد الأوقات محلياً (إذا فشل الـ API)
  // ============================================
  const generateFallbackHours = (): string[] => {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const isSummer = month >= 5 && month <= 9; // مايو-سبتمبر
    const fallbackHours: string[] = [];
    
    if (isSummer) {
      // ☀️ صيفي: 12:00 PM - 9:00 PM
      for (let h = 12; h <= 21; h++) {
        const display12 = h === 12 ? 12 : h > 12 ? h - 12 : h;
        fallbackHours.push(`${display12}:00 PM`);
        if (h < 21) fallbackHours.push(`${display12}:30 PM`);
      }
    } else {
      // ❄️ شتوي: 11:00 AM - 8:00 PM
      fallbackHours.push('11:00 AM', '11:30 AM');
      for (let h = 12; h <= 20; h++) {
        const display12 = h === 12 ? 12 : h > 12 ? h - 12 : h;
        fallbackHours.push(`${display12}:00 PM`);
        if (h < 20) fallbackHours.push(`${display12}:30 PM`);
      }
    }
    
    return fallbackHours;
  };

  const [selectedGroup, setSelectedGroup] = useState<string>("");

  // ============================================
  // ⏰ دالة لتحديث وقت البداية
  // ============================================
  // عند اختيار وقت بداية، تحدث وقت النهاية تلقائياً للسلوت التالي
  // مثال: إذا اختار 12:00 PM، يُحدّث النهاية تلقائياً إلى 12:30 PM
  const handleStartHourChange = (newStartHour: string) => {
    const startIndex = hours.indexOf(newStartHour);
    // اختيار الوقت التالي تلقائياً (slot بعده)
    const nextHour = startIndex >= 0 && startIndex < hours.length - 1 
      ? hours[startIndex + 1] 
      : hours[startIndex];
    
    setFormData({ 
      ...formData, 
      startHour: newStartHour,
      endHour: nextHour 
    });
  };
  
  // ============================================
  // 🔄 تحديث النموذج عند التعديل أو إعادة التعيين
  // ============================================
  useEffect(() => {
    if (editingSession) {
      // 📝 وضع التعديل: ملء النموذج ببيانات الجلسة الموجودة
      const teacherIdValue = typeof editingSession.teacherId === 'string' 
        ? editingSession.teacherId 
        : editingSession.teacherId?._id || "";
      
      setFormData({
        day: editingSession.day,
        startHour: editingSession.startHour, // محدد مسبقاً - وقت الحلقة الحالي
        endHour: editingSession.endHour,     // محدد مسبقاً - وقت الحلقة الحالي
        note: editingSession.note,
        description: editingSession.description || "",
        sessionType: editingSession.sessionType,
        teacherId: teacherIdValue,
        sectionId: editingSession.sectionId || "",
      });
      
      if (role === "teacher") {
        setSelectedGroup(editingSession.note);
      }
    } else {
      // ➕ وضع الإضافة: تعيين قيم افتراضية
      const currentUser = getCurrentUser();
      const defaultTeacherId = role === "teacher" && currentUser?._id ? currentUser._id : "";
      const urlSessionType = searchParams.get('sessionType') as any || undefined;
      
      setFormData({
        day: WEEK_DAYS[0], // اليوم الأول (السبت)
        startHour: "", // المستخدم يختار
        endHour: "",   // المستخدم يختار
        note: initialGroupName || "",
        description: "",
        sessionType: urlSessionType,
        teacherId: defaultTeacherId, // للمعلم: ID تلقائي، للأدمن: فارغ
        sectionId: initialSectionId || "",
      });
      
      if (role === "teacher" && teacherGroups.length > 0) {
        setSelectedGroup(teacherGroups[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSession, role, initialSectionId, initialGroupName, searchParams]);

  // دالة لإعادة تعيين النموذج (reset)
  const resetForm = () => {
    const currentUser = getCurrentUser();
    const defaultTeacherId = role === "teacher" && currentUser?._id ? currentUser._id : "";
    
    setFormData({
      day: WEEK_DAYS[0],
      startHour: "",
      endHour: "",
      note: initialGroupName || "",
      description: "",
      sessionType: undefined,
      teacherId: defaultTeacherId,
      sectionId: initialSectionId || "",
    });
    
    setSelectedGroup("");
    setBookedHours([]);
  };

  return {
    formData,
    setFormData,
    selectedGroup,
    setSelectedGroup,
    hours,
    bookedHours, // الأوقات المحجوزة (للتعطيل في الـ UI)
    loadingHours,
    handleStartHourChange,
    resetForm, // دالة لإعادة تعيين النموذج
  };
};
