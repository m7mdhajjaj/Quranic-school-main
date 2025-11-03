// ============================================================================
// TimetablePage - الصفحة الرئيسية لجدول الحصص الأسبوعي
// ============================================================================

import { useState, useEffect, useRef } from "react";
import { useTimetableSocket } from "../../Socket";
import { useTimetableData } from "./hooks/useTimetableData";
import { useTimetableActions } from "./hooks/useTimetableActions";
import { TimetableGrid } from "./components/TimetableGrid";
import { SessionModal } from "./components/SessionModal";
import PageHeader from "../../components/UI/PageHeader";
import { Button } from "../../components/UI/Button";
import { Alert } from "../../components/UI/Alert";
import type { Session } from "./types/timetable.types";
import { Calendar, Plus } from "lucide-react";

const TimetablePage = () => {
  // الحالة والبيانات
  const {
    sessions,
    setSessions,
    loading,
    error,
    teacherGroups,
    role,
    refetchSessions,
  } = useTimetableData();

  const { addSession, editSession, removeSession } = useTimetableActions({
    setSessions,
  });

  // Socket للتحديثات الفورية
  const {
    isConnected: socketConnected,
    lastUpdate: socketLastUpdate,
    socketId,
  } = useTimetableSocket();

  // حالات النافذة المنبثقة
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  // منع التحديث المتكرر باستخدام ref
  const lastUpdateTimeRef = useRef<number>(0);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLocalActionRef = useRef(false); // تتبع العمليات المحلية

  // 🔄 التحديث التلقائي عند استقبال تحديثات من Socket مع debounce
  useEffect(() => {
    if (socketLastUpdate) {
      const now = Date.now();

      // تجاهل التحديثات المتتالية خلال 5 ثواني
      if (now - lastUpdateTimeRef.current < 5000) {
        console.log("⏭️ تم تجاهل التحديث - قريب جداً من آخر تحديث");
        return;
      }

      // تجاهل التحديثات بعد عمليات محلية مباشرة
      if (isLocalActionRef.current) {
        console.log("⏭️ تم تجاهل التحديث - عملية محلية حديثة");
        isLocalActionRef.current = false;
        return;
      }

      // إلغاء أي timeout سابق
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // تأخير التحديث لتجنب التحديثات المتتالية
      updateTimeoutRef.current = setTimeout(() => {
        console.log(
          "🔄 Timetable Socket update received, refreshing sessions..."
        );
        lastUpdateTimeRef.current = now;
        refetchSessions();
      }, 1000); // زيادة التأخير إلى ثانية واحدة
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [socketLastUpdate, refetchSessions]);

  // التعامل مع إضافة/تعديل موعد
  const handleSubmitSession = async (formData: any, sessionId?: string) => {
    isLocalActionRef.current = true; // تعيين علامة العملية المحلية
    const result = sessionId
      ? await editSession(sessionId, formData)
      : await addSession(formData);

    // إعادة تعيين العلامة بعد 3 ثواني
    setTimeout(() => {
      isLocalActionRef.current = false;
    }, 3000);

    return result;
  };

  // التعامل مع حذف موعد
  const handleDeleteSession = async (session: Session) => {
    isLocalActionRef.current = true; // تعيين علامة العملية المحلية
    const result = await removeSession(session);

    // إعادة تعيين العلامة بعد 3 ثواني
    setTimeout(() => {
      isLocalActionRef.current = false;
    }, 3000);

    return result;
  };

  // فتح نافذة التعديل
  const handleEditClick = (session: Session) => {
    setEditingSession(session);
    setShowModal(true);
  };

  // فتح نافذة الإضافة
  const handleAddClick = () => {
    setEditingSession(null);
    setShowModal(true);
  };

  // إغلاق النافذة
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSession(null);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 md:p-6 lg:p-8"
      dir="rtl"
      lang="ar">
      {/* 🔌 Socket Connection Indicator - للمطورين فقط */}
      {import.meta.env.DEV && (
        <div className="fixed top-20 left-4 z-50">
          <div className="relative group">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                socketConnected
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-yellow-500"
              }`}
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-lg">
              <div className="font-semibold mb-1">
                {socketConnected ? "✓ متصل بالسوكت" : "⚠ غير متصل"}
              </div>
              {socketId && (
                <div className="text-gray-300 text-[10px] mb-1">
                  ID: {socketId.slice(0, 8)}...
                </div>
              )}
              {socketLastUpdate && (
                <div className="text-gray-400 text-[10px]">
                  آخر تحديث:{" "}
                  {new Date(socketLastUpdate).toLocaleTimeString("ar-EG")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <PageHeader
          title="جدول الحصص الأسبوعي"
          subtitle="كل خانة تمثل نصف ساعة — الحلقات مدموجة بين البداية والنهاية"
          icon={<Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-white" />}
        />

        {/* رسالة الخطأ */}
        {error && (
          <Alert
            variant="danger"
            title="خطأ في تحميل البيانات"
            className="mb-6">
            <p>{error}</p>
            <Button
              size="sm"
              variant="secondary"
              onClick={refetchSessions}
              className="mt-3">
              إعادة المحاولة
            </Button>
          </Alert>
        )}

        {/* زر إضافة موعد (للمعلمين والإداريين فقط) */}
        {(role === "teacher" || role === "admin") && (
          <div className="flex justify-center mb-6">
            <Button
              leftIcon={<Plus className="w-5 h-5" />}
              onClick={handleAddClick}
              size="lg">
              إضافة موعد حلقة
            </Button>
          </div>
        )}

        {/* الجدول */}
        <TimetableGrid
          sessions={sessions}
          loading={loading}
          role={role}
          onEdit={handleEditClick}
          onDelete={handleDeleteSession}
        />

        {/* معلومات إضافية للطلاب */}
        {role === "student" && sessions.length === 0 && !loading && (
          <div className="mt-6 text-center">
            <Alert
              variant="info"
              title="لا توجد مواعيد"
              className="max-w-2xl mx-auto">
              لم يتم تحديد مواعيد لحلقتك بعد. يرجى التواصل مع معلمك.
            </Alert>
          </div>
        )}
      </div>

      {/* نافذة إضافة/تعديل الموعد */}
      <SessionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitSession}
        editingSession={editingSession}
        role={role}
        teacherGroups={teacherGroups}
        sessions={sessions}
      />
    </div>
  );
};

export default TimetablePage;
