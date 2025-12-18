import { TeacherToolbar } from '../components/TeacherToolbar';
import { StudentsTable } from '../components/StudentsTable';
import { Card } from '@/components/UI/Card';
import type { TeacherGroup, AttendanceStudent, AttendanceStats } from '../types/absence.types';

interface TeacherAttendanceViewProps {
  group: TeacherGroup;
  onBack: () => void;
  startDate: string | null;
  endDate: string | null;
  setDateRange: (start: string | null, end: string | null) => void;
  nameQuery: string;
  setNameQuery: (query: string) => void;
  displayStats: AttendanceStats;
  isDateTooOld: boolean;
  daysAgo: number;
  handleSave: () => void;
  isSaving: boolean;
  isLoadingDate: boolean;
  students: AttendanceStudent[];
  selectedAll: boolean;
  toggleAllStudents: () => void;
  toggleStudentPresence: (id: string) => void;
  hasUnsavedChanges: boolean;
}

export const TeacherAttendanceView = ({
  group,
  onBack,
  startDate,
  endDate,
  setDateRange,
  nameQuery,
  setNameQuery,
  displayStats,
  isDateTooOld,
  daysAgo,
  handleSave,
  isSaving,
  isLoadingDate,
  students,
  selectedAll,
  toggleAllStudents,
  toggleStudentPresence,
  hasUnsavedChanges,
}: TeacherAttendanceViewProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <TeacherToolbar
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={setDateRange}
        currentGroupName={group.name}
        onBackToGroups={onBack}
        nameQuery={nameQuery}
        onNameQueryChange={setNameQuery}
        totalStudents={displayStats.totalStudents}
        presentCount={displayStats.presentCount}
        absentCount={displayStats.absentCount}
        attendanceRate={displayStats.attendanceRate}
        isDateTooOld={isDateTooOld}
        daysAgo={daysAgo}
        onSave={handleSave}
        isSaving={isSaving}
        isLoading={isLoadingDate}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* جدول الطلاب */}
      {isLoadingDate || isSaving ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="py-4 px-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-5 w-20 bg-gray-200 animate-pulse rounded md:hidden"></div>
          </div>
          <div className="p-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 border-b border-gray-100 bg-white animate-pulse"></div>
            ))}
          </div>
        </div>
      ) : (
        <StudentsTable
          students={students}
          selectedAll={selectedAll}
          onToggleAll={toggleAllStudents}
          onTogglePresence={toggleStudentPresence}
        />
      )}

      {/* تعليمات سريعة */}
      <Card className="min-h-[200px]">
        <h3 className="font-bold text-gray-700 mb-2 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-1 text-amber-500"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          تعليمات:
        </h3>
        <ul className="text-gray-600 text-sm mr-6 list-disc space-y-1">
          <li>انقر على صفّ الطالب لقلب حالته (حاضر/غائب).</li>
          <li>خانة التحديد العلوية لاختيار الكل بسرعة.</li>
          <li>اضغط "حفظ السجل" لحفظ التغييرات.</li>
          <li>
            سيتم تحذيرك عند وجود تغييرات غير محفوظة قبل الخروج.
          </li>
          <li>استخدم البحث لتسريع العمل.</li>
        </ul>
      </Card>
    </div>
  );
};
