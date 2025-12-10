// ============================================================================
// useSessionForm - هوك لإدارة حالة فورم الجلسة
// ============================================================================

import { useState, useEffect } from "react";
import type { Session, SessionFormData, UserRole } from "../types/timetable.types";
import { WEEK_DAYS, getCurrentUser } from "../utils";
import { getAvailableHours, getAvailableHoursForTeacher } from "@/Api/TimeTable.Api";

interface UseSessionFormProps {
  editingSession: Session | null;
  role: UserRole;
  teacherGroups?: string[];
}

export const useSessionForm = ({ editingSession, role, teacherGroups = [] }: UseSessionFormProps) => {
  // جلب كل الأوقات + الأوقات المحجوزة من الـ Backend
  const [hours, setHours] = useState<string[]>([]);
  const [bookedHours, setBookedHours] = useState<string[]>([]); // الأوقات المحجوزة (للتعطيل)
  const [loadingHours, setLoadingHours] = useState(true);
  const [formData, setFormData] = useState<SessionFormData>(() => ({
    day: WEEK_DAYS[0],
    startHour: "",
    endHour: "",
    note: "",
    description: "",
    sessionType: undefined,
    teacherId: "",
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
  // 🔄 Fallback: توليد الأوقات محلياً (إذا فشل الـ API)
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
        startHour: editingSession.startHour,
        endHour: editingSession.endHour,
        note: editingSession.note,
        description: editingSession.description || "",
        sessionType: editingSession.sessionType,
        teacherId: teacherIdValue,
      });
      
      if (role === "teacher") {
        setSelectedGroup(editingSession.note);
      }
    } else {
      // ➕ وضع الإضافة: تعيين قيم افتراضية
      const currentUser = getCurrentUser();
      const defaultTeacherId = role === "teacher" && currentUser?._id ? currentUser._id : "";
      
      setFormData({
        day: WEEK_DAYS[0], // اليوم الأول (السبت)
        startHour: "", // المستخدم يختار
        endHour: "",   // المستخدم يختار
        note: "",
        description: "",
        sessionType: undefined,
        teacherId: defaultTeacherId, // للمعلم: ID تلقائي، للأدمن: فارغ
      });
      
      if (role === "teacher" && teacherGroups.length > 0) {
        setSelectedGroup(teacherGroups[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSession, role]);

  // دالة لإعادة تعيين النموذج (reset)
  const resetForm = () => {
    const currentUser = getCurrentUser();
    const defaultTeacherId = role === "teacher" && currentUser?._id ? currentUser._id : "";
    
    setFormData({
      day: WEEK_DAYS[0],
      startHour: "",
      endHour: "",
      note: "",
      description: "",
      sessionType: undefined,
      teacherId: defaultTeacherId,
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
