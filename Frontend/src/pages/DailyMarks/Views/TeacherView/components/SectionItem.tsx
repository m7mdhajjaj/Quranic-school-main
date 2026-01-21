import { Card } from "@/components/UI";
import { DropdownMenu } from "@/components/UI/DropdownMenu";
import { Calendar, Edit, Trash2, Users, RotateCcw, BookOpen, Clock, AlertTriangle } from "lucide-react";
import type { Section as SectionBase } from "../../../types/types";

type Section = SectionBase & {
  memorizationMeta?: any[];
};
import { useNavigate } from "react-router-dom";

interface SectionItemProps {
  section: Section;
  onSectionSelect: (section: Section) => void;
  onEditSection?: (section: Section) => void;
  onDeleteSection?: (sectionId: string) => void;
}

const SectionItemComponent = ({
  section,
  onSectionSelect,
  onEditSection,
  onDeleteSection,
}: SectionItemProps) => {
  const navigate = useNavigate();
  const marksStatus = section.marksStatus || "not_started";
  const marksProgress = section.marksProgress;
  const date = new Date(section.date);
  
  // Format dates using Intl for better performance than toLocaleDateString in loops
  const formattedDate = new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
  
  const shortDate = new Intl.DateTimeFormat("ar-SA", {
    month: "short",
    day: "numeric",
  }).format(date);

  const handleAddSchedule = (e: React.MouseEvent) => {
    e.stopPropagation();
    let sessionType = "both";
    
    // Check both legacy strings and new structured meta data
    const sectionAny = section as any;
    const hasMemMeta = sectionAny.memorizationMeta && Array.isArray(sectionAny.memorizationMeta) && sectionAny.memorizationMeta.length > 0;
    const hasRevMeta = sectionAny.reviewMeta && Array.isArray(sectionAny.reviewMeta) && sectionAny.reviewMeta.length > 0;
    
    const hasMemLegacy = section.memorizationSection && section.memorizationSection.trim() !== "";
    const hasRevLegacy = section.reviewSection && section.reviewSection.trim() !== "";

    const hasMem = hasMemMeta || hasMemLegacy;
    const hasRev = hasRevMeta || hasRevLegacy;
    
    if (hasMem && !hasRev) {
      sessionType = "hifz";
    } else if (!hasMem && hasRev) {
      sessionType = "murajaah";
    }
    navigate(`/timetable?addSession=true&sectionId=${section._id}&groupName=${encodeURIComponent(section.group || "")}&sessionType=${sessionType}`);
  };

  const handleEditSchedule = (e: React.MouseEvent) => {
    e.stopPropagation();
    const timetable = section.timetableId as any;
    
    // Handle both populated object and string ID
    const timetableId = (timetable && typeof timetable === 'object') ? timetable._id : timetable;
    
    if (!timetableId) return;
    
    // Navigate to timetable page with edit mode
    navigate(`/timetable?editSession=${timetableId}`);
  };

  const statusConfig = {
    completed: {
      iconColor: "text-emerald-600",
      statusBadgeBg: "bg-emerald-100",
      statusBadgeText: "text-emerald-700",
      statusBadgeBorder: "border-emerald-300",
      statusDot: "bg-emerald-500",
      statusText: "تم رصد علامات",
      borderColor: "border-emerald-500",
    },
    in_progress: {
      iconColor: "text-amber-600",
      statusBadgeBg: "bg-amber-100",
      statusBadgeText: "text-amber-700",
      statusBadgeBorder: "border-amber-300",
      statusDot: "bg-amber-500",
      statusText: "لم يكتمل",
      borderColor: "border-amber-500",
    },
    not_started: {
      iconColor: "text-gray-600",
      statusBadgeBg: "bg-gray-100",
      statusBadgeText: "text-gray-700",
      statusBadgeBorder: "border-gray-300",
      statusDot: "bg-gray-500",
      statusText: "لم يرصد بعد",
      borderColor: "border-gray-400",
    },
  };

  const config = statusConfig[marksStatus] || statusConfig.not_started;

  return (
    <Card
      onClick={() => onSectionSelect(section)}
      className={`cursor-pointer hover:shadow-lg transition-all duration-200 border bg-white ${
        marksStatus === "completed" 
          ? "border-emerald-400 hover:border-emerald-500" 
          : marksStatus === "in_progress"
          ? "border-amber-400 hover:border-amber-500"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="p-5 relative">
        {/* Dropdown Menu */}
        {onEditSection && (
          <div 
            className="absolute top-3 left-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu
              items={[
                {
                  label: "تعديل المقطع",
                  icon: <Edit size={16} />,
                  onClick: () => onEditSection(section),
                  variant: "warning",
                },
                {
                  label: "حذف المقطع",
                  icon: <Trash2 size={16} />,
                  onClick: () => onDeleteSection?.(section._id),
                  variant: "danger",
                },
              ]}
              position="left"
              buttonClassName="hover:bg-gray-100"
            />
          </div>
        )}

        {/* Header with Date */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className={config.iconColor} size={18} />
            <h3 className="text-base font-bold text-gray-800">{shortDate}</h3>
          </div>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>

        {/* Status Badge */}
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${config.statusBadgeBg} ${config.statusBadgeText} rounded-md text-xs font-semibold border ${config.statusBadgeBorder}`}>
            <div className={`w-1.5 h-1.5 ${config.statusDot} rounded-full`}></div>
            {config.statusText}
          </span>
          
          {marksProgress && marksStatus === "in_progress" && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>التقدم</span>
                <span className="font-medium">{marksProgress.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.min(marksProgress.percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {marksProgress.studentsWithMarks} من {marksProgress.totalStudents} طالب
              </p>
            </div>
          )}
        </div>
        
        {/* Sections Info */}
        <div className="space-y-2 mb-4">
          <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
            <div className="flex items-center gap-1.5 mb-1">
              <BookOpen size={14} className="text-teal-600" />
              <span className="text-xs font-semibold text-teal-700">مقطع الحفظ</span>
            </div>
            {section.memorizationMeta && section.memorizationMeta.length > 0 ? (
               <div className="space-y-1.5">
                  <p className="text-sm text-gray-800 line-clamp-2">{section.memorizationSection}</p>
                  {section.memorizationMeta.some((m: any) => m.completionNote) && (
                      <div className="bg-amber-50 border border-amber-100 rounded p-2" onClick={e => e.stopPropagation()}>
                          <div className="flex items-start gap-1.5">
                              <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 rounded font-bold shrink-0">تنبيه</span>
                              <div className="text-xs text-amber-700">
                                  {section.memorizationMeta
                                      .filter((m: any) => m.completionNote)
                                      .map((m: any, i: number) => (
                                      <p key={i}>{m.completionNote}</p>
                                  ))}
                              </div>
                          </div>
                      </div>
                  )}
               </div>
            ) : (
                <p className="text-sm text-gray-800 line-clamp-2">{section.memorizationSection || "لا يوجد"}</p>
            )}
          </div>
          
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-1.5 mb-1">
              <RotateCcw size={14} className="text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">مقطع المراجعة</span>
            </div>
            <p className="text-sm text-gray-800 line-clamp-2">{section.reviewSection || "لا يوجد"}</p>
          </div>
        </div>
        
        {/* Scheduled Time Info */}
        {section.timetableId ? (
           (typeof section.timetableId === 'object' && 'day' in (section.timetableId as any)) ? (
             // ✅ الحالة الأولى: بيانات الموعد كاملة موجودة (populated)
              <div className="mb-3 bg-cyan-50 border border-cyan-100 rounded-lg p-2.5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-800">
                    <Clock size={14} className="text-cyan-600" />
                    <span className="text-xs font-semibold">موعد الحلقة:</span>
                    <span className="text-xs">{(section.timetableId as any).day}</span>
                    <span className="text-cyan-300">|</span>
                    <span className="text-xs font-mono">{(section.timetableId as any).startHour} - {(section.timetableId as any).endHour}</span>
                  </div>
                  <button
                    onClick={handleEditSchedule}
                    className="text-xs text-cyan-600 hover:text-cyan-800 hover:bg-cyan-100 px-2 py-1 rounded transition-colors font-medium"
                  >
                    تعديل
                  </button>
                </div>
              </div>
           ) : (
              // ✅ الحالة الثانية: الموعد موجود ولكن كـ ID فقط (ليس populated)
              <div className="mb-3 bg-cyan-50 border border-cyan-100 rounded-lg p-2.5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-800">
                    <Clock size={14} className="text-cyan-600" />
                    <span className="text-xs font-semibold">الموعد محجوز</span>
                    <span className="text-[10px] text-cyan-600">(اضغط للتفاصيل)</span>
                  </div>
                  <button
                    onClick={handleEditSchedule}
                    className="text-xs text-cyan-600 hover:text-cyan-800 hover:bg-cyan-100 px-2 py-1 rounded transition-colors font-medium"
                  >
                    عرض/تعديل
                  </button>
                </div>
              </div>
           )
        ) : (
        // ✅ الحالة الثالثة: لا يوجد موعد (إظهار زر الإضافة)
           <div className="mb-3 bg-amber-50 border border-amber-100 rounded-lg p-2.5" onClick={(e) => e.stopPropagation()}>
             <div className="flex items-center gap-1.5 mb-2">
               <AlertTriangle className="text-amber-500" size={14} />
               <p className="text-xs text-amber-700 font-medium">لم يتم تحديد موعد للحلقة</p>
             </div>
             <button
               onClick={handleAddSchedule}
               className="w-full py-1.5 bg-white border border-amber-200 text-amber-600 rounded text-xs font-semibold hover:bg-amber-50 transition-colors flex items-center justify-center gap-1.5"
             >
               <Clock size={12} />
               إضافة موعد
             </button>
           </div>
        )}

        {/* Action Hint */}
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 pt-3 border-t border-gray-100 font-medium">
          <Users size={16} />
          <span>اضغط لعرض الطلاب والعلامات</span>
        </div>
      </div>
    </Card>
  );
};

export const SectionItem = SectionItemComponent;
