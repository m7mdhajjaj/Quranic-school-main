import React, { memo } from "react";
import { Card } from "@/components/UI";
import { DropdownMenu } from "@/components/UI/DropdownMenu";
import { Calendar, Edit, Trash2, Users, RotateCcw, BookOpen } from "lucide-react";
import type { Section } from "../../../types/types";
import type { MarkStatus } from "../../../components/SectionStatusBadge";

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
      className={`cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-100 border-2 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 ${
        marksStatus === "completed" 
          ? "border-emerald-500 hover:border-emerald-600" 
          : marksStatus === "in_progress"
          ? "border-amber-500 hover:border-amber-600"
          : "border-gray-400 hover:border-gray-500"
      }`}
    >
      <div className="p-6 relative">
        {/* Dropdown Menu */}
        {onEditSection && (
          <div 
            className="absolute top-4 left-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu
              items={[
                {
                  label: "تعديل المقطع",
                  icon: <Edit size={18} />,
                  onClick: () => onEditSection(section),
                  variant: "warning",
                },
                {
                  label: "حذف المقطع",
                  icon: <Trash2 size={18} />,
                  onClick: () => {
                    if (onDeleteSection) {
                      onDeleteSection(section._id);
                    }
                  },
                  variant: "danger",
                },
              ]}
              position="left"
              buttonClassName="hover:bg-emerald-100"
              menuClassName="shadow-2xl"
            />
          </div>
        )}

        {/* Header with Date */}
        <div className="mb-4 pr-0">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className={config.iconColor} size={20} />
            <h3 className="text-lg font-bold text-gray-800">{shortDate}</h3>
          </div>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 ${config.statusBadgeBg} ${config.statusBadgeText} rounded-lg text-xs font-bold border ${config.statusBadgeBorder}`}>
            <div className={`w-2 h-2 ${config.statusDot} rounded-full animate-pulse`}></div>
            {config.statusText}
          </span>
          {marksProgress && marksStatus === "in_progress" && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                <span>التقدم</span>
                <span className="font-semibold">{marksProgress.percentage}%</span>
              </div>
              <progress
                value={Math.min(marksProgress.percentage, 100)}
                max={100}
                aria-label="تقدم رصد العلامات"
                className="w-full h-2.5 overflow-hidden rounded-full shadow-inner [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-amber-500 [&::-webkit-progress-value]:rounded-full"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                {marksProgress.studentsWithMarks} من {marksProgress.totalStudents} طالب
              </p>
            </div>
          )}
        </div>
        
        {/* Sections Info */}
        <div className="space-y-3 mb-5">
          <div className="bg-white/80 p-3.5 rounded-lg border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <RotateCcw size={16} className="text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">مقطع المراجعة</span>
            </div>
            <p className="text-sm font-medium text-gray-800 pr-1 line-clamp-2 leading-relaxed">{section.reviewSection || "لا يوجد"}</p>
          </div>
          <div className="bg-white/80 p-3.5 rounded-lg border border-teal-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-teal-600" />
              <span className="text-xs font-semibold text-teal-700">مقطع الحفظ</span>
            </div>
            <p className="text-sm font-medium text-gray-800 pr-1 line-clamp-2 leading-relaxed">{section.memorizationSection || "لا يوجد"}</p>
          </div>
        </div>
        
        {/* Action Hint */}
        <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 pt-4 border-t border-emerald-200/60 font-semibold">
          <Users size={18} />
          <span>اضغط لعرض الطلاب والعلامات</span>
        </div>
      </div>
    </Card>
  );
};

export const SectionItem = SectionItemComponent;
