import { Card } from "@/components/UI";
import { FileText, BookOpen, RotateCcw, ArrowLeft } from "lucide-react";
import SearchInput from "@/components/Filters/SearchInput";
import type { Section } from "../../../types/types";

interface SectionDetailsViewProps {
  section: Section;
  selectedGroup: string;
  studentSearchQuery: string;
  onStudentSearchChange: (query: string) => void;
  onBack: () => void;
  children: React.ReactNode;
}

/**
 * عرض تفاصيل المقطع مع جدول الطلاب
 */
export const SectionDetailsView = ({
  section,
  selectedGroup,
  studentSearchQuery,
  onStudentSearchChange,
  onBack,
  children,
}: SectionDetailsViewProps) => {
  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
        type="button"
      >
        <ArrowLeft size={20} />
        <span>العودة إلى المقاطع</span>
      </button>

      {/* Section Header */}
      <Card className="mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <FileText className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {new Date(section.date).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </h2>
                <p className="text-sm text-gray-600">{selectedGroup}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search Filter for Students */}
              <div className="flex-1 min-w-[250px] max-w-[400px]">
                <SearchInput
                  value={studentSearchQuery}
                  onChange={onStudentSearchChange}
                  placeholder="ابحث عن طالب..."
                  size="sm"
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Memorization Section Card */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl border-2 border-cyan-300 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-cyan-500 rounded-lg">
                  <BookOpen size={14} className="text-white" />
                </div>
                <p className="text-xs font-bold text-cyan-700 uppercase tracking-wide">مقطع الحفظ</p>
              </div>
              <p className="font-bold text-base text-cyan-900 pr-1">{section.memorizationSection}</p>
            </div>

            {/* Review Section Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border-2 border-emerald-300 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-emerald-500 rounded-lg">
                  <RotateCcw size={14} className="text-white" />
                </div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">مقطع المراجعة</p>
              </div>
              <p className="font-bold text-base text-emerald-900 pr-1">{section.reviewSection}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Students Table (passed as children) */}
      {children}
    </div>
  );
};
