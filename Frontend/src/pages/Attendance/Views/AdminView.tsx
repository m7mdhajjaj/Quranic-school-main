// AdminView.tsx - صفحة مراقبة الحضور للأدمن
import { Calendar, Users, CheckCircle, XCircle, TrendingUp, ArrowLeft } from "lucide-react";
import { Card } from "@/components/UI/Card";
import { DateRangePicker } from '@/components/UI/DateRangePicker';
import type { AdminGroupStudent, AdminGroup } from "@/Api/attendanceApi";
import { StudentsTable } from "../components/StudentsTable";
import { GroupsGridSkeleton, TeacherAttendanceViewSkeleton } from "@/components/skeletons";
import { useAdminAttendance } from "../hooks";

// ============================================================================
// Admin Groups Grid Component
// ============================================================================
interface AdminGroupsGridProps {
  groups: AdminGroup[];
  onSelectGroup: (group: AdminGroup) => void;
  isLoading: boolean;
  summary: {
    totalGroups: number;
    totalStudents: number;
    presentToday: number;
    absentToday: number;
    attendanceRate: number;
  };
}

const AdminGroupsGrid = ({ groups, onSelectGroup, isLoading, summary }: AdminGroupsGridProps) => {
  if (isLoading) {
    return <GroupsGridSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* إجمالي الطلاب */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 backdrop-blur-sm rounded-2xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="px-3 py-1 bg-blue-100 rounded-full border border-blue-200">
                <span className="text-xs font-bold text-blue-700">الكل</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-700">إجمالي الطلاب</p>
              <p className="text-4xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {summary.totalStudents}
              </p>
            </div>
          </div>
        </Card>

        {/* الحاضرون */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200 hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/10 backdrop-blur-sm rounded-2xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="px-3 py-1 bg-emerald-100 rounded-full border border-emerald-200">
                <span className="text-xs font-bold text-emerald-700">اليوم</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-700">الحاضرون اليوم</p>
              <p className="text-4xl font-black bg-gradient-to-br from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {summary.presentToday}
              </p>
            </div>
          </div>
        </Card>

        {/* الغائبون */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-100 border-red-200 hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/10 backdrop-blur-sm rounded-2xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="px-3 py-1 bg-red-100 rounded-full border border-red-200">
                <span className="text-xs font-bold text-red-700">اليوم</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-red-700">الغائبون اليوم</p>
              <p className="text-4xl font-black bg-gradient-to-br from-red-600 to-rose-600 bg-clip-text text-transparent">
                {summary.absentToday}
              </p>
            </div>
          </div>
        </Card>

        {/* نسبة الحضور */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200 hover:shadow-xl transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/10 backdrop-blur-sm rounded-2xl">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div className="px-3 py-1 bg-amber-100 rounded-full border border-amber-200">
                <span className="text-xs font-bold text-amber-700">النسبة</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-700">نسبة الحضور</p>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl font-black bg-gradient-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {summary.attendanceRate}
                </p>
                <p className="text-2xl font-black bg-gradient-to-br from-amber-500 to-orange-500 bg-clip-text text-transparent">%</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Groups Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">الحلقات الفعالة ({groups.length})</h2>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-700">لا توجد حلقات نشطة</h3>
          <p className="text-gray-500 mt-2">لم يتم العثور على حلقات نشطة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group._id}
              onClick={() => onSelectGroup(group)}
              className="group cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
            >
              <Card 
                variant="elevated" 
                className="h-full border-t-4 border-emerald-500 hover:shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-20 h-20 bg-emerald-50 rounded-br-full -translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                      <Users className="w-8 h-8" />
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 group-hover:text-emerald-500 transition-colors">
                      <span className="text-sm font-medium">عرض</span>
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-700 transition-colors">
                      {group.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-1">المعلم: {group.teacherName}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        {group.totalStudents} طالب
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        {group.absentToday} غياب
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Admin Group Students View
// ============================================================================
interface AdminGroupStudentsViewProps {
  group: AdminGroup;
  students: AdminGroupStudent[];
  teacherName: string;
  date: string;
  availableDates: string[];
  onDateChange: (start: string | null, end: string | null) => void;
  onBack: () => void;
  isLoading: boolean;
}

const AdminGroupStudentsView = ({ 
  group, 
  students, 
  teacherName,
  date,
  availableDates,
  onDateChange,
  onBack, 
  isLoading 
}: AdminGroupStudentsViewProps) => {
  const presentCount = students.filter(s => s.isPresent).length;
  const absentCount = students.filter(s => !s.isPresent).length;

  if (isLoading) {
    return <TeacherAttendanceViewSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 rounded-3xl shadow-2xl p-6">
        <div className="flex flex-col gap-4">
          {/* Top Row: Back Button, Title, DatePicker */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                title="رجوع للحلقات"
              >
                <ArrowLeft className="w-6 h-6 text-white rotate-180" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-white">{group.name}</h2>
                <p className="text-emerald-100 text-sm">المعلم: {teacherName}</p>
              </div>
            </div>
            
            {/* Date Picker */}
            <div className="w-full md:w-auto min-w-[280px]">
              <DateRangePicker 
                startDate={date} 
                endDate={date} 
                onChange={onDateChange} 
                className="w-full"
                singleDate={true}
                enabledDates={availableDates}
              />
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold text-white">{students.length}</p>
              <p className="text-xs text-purple-100">طالب</p>
            </div>
            <div className="bg-emerald-500/30 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold text-white">{presentCount}</p>
              <p className="text-xs text-emerald-100">حاضر</p>
            </div>
            <div className="bg-red-500/30 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-bold text-white">{absentCount}</p>
              <p className="text-xs text-red-100">غائب</p>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table - Read Only */}
      <StudentsTable
        students={students.map(s => ({
          ...s,
          teacher: teacherName
        }))}
        selectedAll={false}
        onToggleAll={() => {}} // No action for admin
        onTogglePresence={() => {}} // No action for admin
        readOnly={true} // 🆕 Admin mode - no editing
      />

      {/* Note */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-4 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-emerald-900 font-bold mb-2">وضع المشاهدة فقط</p>
            <p className="text-sm text-emerald-800 leading-relaxed">
              أنت تشاهد بيانات الحضور كمسؤول. لتعديل الحضور، يرجى التواصل مع معلم الحلقة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main AdminView Component
// ============================================================================
export const AdminView = () => {
  const {
    // Groups
    groups,
    summary,
    isLoading,
    error,
    fetchGroups,
    
    // Selected group
    selectedGroup,
    selectedGroupStudents,
    selectedGroupTeacher,
    isLoadingStudents,
    
    // Date
    date,
    availableDates,
    handleDateChange,
    
    // Actions
    handleSelectGroup,
    handleBackToGroups,
  } = useAdminAttendance();

  // Error state
  if (error && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card variant="elevated" className="max-w-md w-full p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">تنبيه</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchGroups}
              className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Content */}
      {!selectedGroup ? (
        <AdminGroupsGrid
          groups={groups}
          onSelectGroup={handleSelectGroup}
          isLoading={isLoading}
          summary={summary}
        />
      ) : (
        <AdminGroupStudentsView
          group={selectedGroup}
          students={selectedGroupStudents}
          teacherName={selectedGroupTeacher || selectedGroup.teacherName}
          date={date}
          availableDates={availableDates}
          onDateChange={handleDateChange}
          onBack={handleBackToGroups}
          isLoading={isLoadingStudents}
        />
      )}
    </div>
  );
};
