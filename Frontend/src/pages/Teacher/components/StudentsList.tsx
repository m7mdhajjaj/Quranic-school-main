import React, { useEffect } from "react";
import { ArrowRight, Plus, Edit, Trash2, Users, Search, Phone, Mail, GraduationCap, User, UserCheck, Cake, MapPin, Filter, X, CreditCard } from "lucide-react";
import { useGroupStudents, useStudentsListLogic } from "../hooks";
import type { Student } from "@/Api/studentApi";
import { EmptyState } from "@/components/UI/EmptyState";
import { DropdownMenu } from "@/components/UI/DropdownMenu";
import Avatar from "@/components/Avatar/Avatar";
import { CardSkeleton } from "@/components/skeletons";
import { useUserStatusSocket } from "@/Socket/StatusSocket";

interface StudentsListProps {
  groupId: string;
  groupName: string;
  onBack: () => void;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  groupId,
  groupName,
  onBack,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
}) => {

  const { joinRoom, leaveRoom } = useUserStatusSocket();
  
  // استخدام الـ hook لفصل منطق البحث والفلترة
  const {
    searchTerm,
    setSearchTerm,
    clearSearch,
    debouncedSearchTerm,
    genderFilter,
    setGenderFilter,
  } = useStudentsListLogic();

  // Join students room for real-time updates
  useEffect(() => {
    joinRoom('students');
    return () => leaveRoom('students');
  }, [joinRoom, leaveRoom]);

  const { students, error, isLoading } = useGroupStudents(groupId, {
    search: debouncedSearchTerm.trim() || undefined,
    gender: genderFilter !== 'all' ? genderFilter : undefined,
  });

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-6" dir="rtl">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h3 className="font-semibold text-red-900 mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gray-50" dir="rtl">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50 rounded-2xl shadow-lg border-2 border-emerald-100 overflow-hidden p-6 mb-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-cyan-50/30 pointer-events-none" />
          
          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={onBack}
                className="p-2.5 hover:bg-white/60 rounded-xl transition-all hover:scale-110"
                title="العودة"
                aria-label="العودة إلى قائمة الحلقات"
              >
                <ArrowRight className="w-6 h-6 text-emerald-700" />
              </button>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                      {groupName}
                    </h1>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-emerald-600/80 font-medium">إدارة طلاب الحلقة</p>
                      <span className="text-emerald-400">•</span>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-700">
                          إجمالي: <span className="text-base font-bold">{students.length}</span>
                        </span>
                        {(searchTerm || genderFilter !== 'all') && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold border border-emerald-200">
                            مفلتر
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onAddStudent}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl font-semibold transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              إضافة طالب
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-400" />
              <input
                type="text"
                placeholder="بحث عن طالب (الاسم الكامل أو رقم الهوية)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-white/90 backdrop-blur-sm border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-md hover:shadow-lg"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="مسح البحث"
                  aria-label="مسح البحث"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Gender Filter */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">فلتر حسب الجنس:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGenderFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    genderFilter === 'all'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-105'
                      : 'bg-white/80 text-gray-700 hover:bg-emerald-50 border-2 border-emerald-100'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setGenderFilter('ذكر')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    genderFilter === 'ذكر'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                      : 'bg-white/80 text-gray-700 hover:bg-blue-50 border-2 border-blue-100'
                  }`}
                >
                  ذكر
                </button>
                <button
                  onClick={() => setGenderFilter('أنثى')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    genderFilter === 'أنثى'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg scale-105'
                      : 'bg-white/80 text-gray-700 hover:bg-pink-50 border-2 border-pink-100'
                  }`}
                >
                  أنثى
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} hasImage={false} contentLines={4} />
            ))}
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            icon={<Users className="w-12 h-12" />}
            title={searchTerm || genderFilter !== 'all' ? "لا توجد نتائج" : "لا يوجد طلاب"}
            description={
              searchTerm || genderFilter !== 'all'
                ? "لم يتم العثور على طلاب يطابقون البحث أو الفلتر"
                : "ابدأ بإضافة أول طالب إلى هذه الحلقة"
            }
            action={
              !searchTerm && genderFilter === 'all'
                ? {
                    label: "إضافة طالب جديد",
                    onClick: onAddStudent,
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student, index) => {
              // ألوان متناسقة مع الأخضر - تدرجات خضراء مختلفة
              const colorVariants = [
                { gradient: "from-emerald-500 via-teal-500 to-cyan-500", bg: "from-emerald-50 via-teal-50/60 to-cyan-50/40", border: "border-emerald-200", icon: "text-emerald-600", hoverBorder: "hover:border-emerald-400" },
                { gradient: "from-teal-500 via-cyan-500 to-emerald-500", bg: "from-teal-50 via-cyan-50/60 to-emerald-50/40", border: "border-teal-200", icon: "text-teal-600", hoverBorder: "hover:border-teal-400" },
                { gradient: "from-cyan-500 via-emerald-500 to-teal-500", bg: "from-cyan-50 via-emerald-50/60 to-teal-50/40", border: "border-cyan-200", icon: "text-cyan-600", hoverBorder: "hover:border-cyan-400" },
                { gradient: "from-emerald-600 via-teal-600 to-cyan-600", bg: "from-emerald-50/80 via-teal-50/50 to-cyan-50/30", border: "border-emerald-300", icon: "text-emerald-700", hoverBorder: "hover:border-emerald-500" },
                { gradient: "from-teal-600 via-emerald-500 to-cyan-500", bg: "from-teal-50/80 via-emerald-50/50 to-cyan-50/30", border: "border-teal-300", icon: "text-teal-700", hoverBorder: "hover:border-teal-500" },
                { gradient: "from-cyan-600 via-teal-500 to-emerald-500", bg: "from-cyan-50/80 via-teal-50/50 to-emerald-50/30", border: "border-cyan-300", icon: "text-cyan-700", hoverBorder: "hover:border-cyan-500" },
              ];
              const colors = colorVariants[index % colorVariants.length];

              return (
                <div
                  key={student._id}
                  className={`group relative bg-gradient-to-br ${colors.bg} rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 ${colors.border} ${colors.hoverBorder}`}
                  dir="rtl"
                >
                  {/* شريط علوي ملون */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${colors.gradient}`}></div>

                  <div className="relative z-10 p-6">
                    {/* رأس الكارد - Avatar والاسم */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="relative flex-shrink-0">
                        <Avatar
                          key={`avatar-${student._id}-${typeof student.avatar === 'object' ? student.avatar?.url : student.avatar || 'no-avatar'}`}
                          user={{
                            _id: student._id,
                            firstName: student.firstName,
                            lastName: student.lastName,
                            gender: student.gender,
                            role: 'student',
                            isActive: student.isActive,
                            avatar: typeof student.avatar === 'object' 
                              ? student.avatar 
                              : student.avatar 
                                ? { url: student.avatar } 
                                : undefined,
                          }}
                          userName={`${student.firstName || ''} ${student.lastName || ''}`.trim()}
                          gender={student.gender as 'male' | 'female' | 'ذكر' | 'أنثى' | undefined}
                          src={typeof student.avatar === 'object' ? student.avatar?.url : student.avatar || undefined}
                          size="lg"
                          border="ring"
                          showStatus={true}
                          statusSize="md"
                          autoFetch={true}
                          userId={student._id}
                          userRole="student"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors truncate">
                            {student.firstName} {student.lastName}
                          </h3>
                          {/* Dropdown Menu */}
                          <DropdownMenu
                            items={[
                              {
                                label: "تعديل",
                                icon: <Edit className="w-4 h-4" />,
                                onClick: () => onEditStudent(student),
                                variant: 'default',
                              },
                              {
                                label: "حذف",
                                icon: <Trash2 className="w-4 h-4" />,
                                onClick: () => {
                                  if (window.confirm(`هل أنت متأكد من حذف ${student.firstName} ${student.lastName}؟`)) {
                                    onDeleteStudent(student._id!);
                                  }
                                },
                                variant: 'danger',
                              },
                            ]}
                            position="left"
                            buttonClassName="hover:bg-white/80"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-white/80 text-gray-700 border border-gray-200 shadow-sm">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            #{student.studentId}
                          </span>
                        </div>
                        {student.fatherName && (
                          <p className="text-xs text-gray-600 truncate">{student.fatherName}</p>
                        )}
                      </div>
                    </div>

                    {/* معلومات الاتصال */}
                    <div className="space-y-2 mb-5">
                      {student.idNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-lg px-3 py-2 border border-white/80">
                          <CreditCard className={`w-4 h-4 ${colors.icon} flex-shrink-0`} />
                          <span className="font-mono text-xs truncate" dir="ltr">{student.idNumber}</span>
                        </div>
                      )}
                      {student.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-lg px-3 py-2 border border-white/80">
                          <Phone className={`w-4 h-4 ${colors.icon} flex-shrink-0`} />
                          <span className="font-mono text-xs truncate" dir="ltr">{student.phoneNumber}</span>
                        </div>
                      )}
                      {student.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-lg px-3 py-2 border border-white/80">
                          <Mail className={`w-4 h-4 ${colors.icon} flex-shrink-0`} />
                          <span className="text-xs truncate">{student.email}</span>
                        </div>
                      )}
                      {student.residence && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-lg px-3 py-2 border border-white/80">
                          <MapPin className={`w-4 h-4 ${colors.icon} flex-shrink-0`} />
                          <span className="text-xs truncate">{student.residence}</span>
                        </div>
                      )}
                      {student.gender && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-lg px-3 py-2 border border-white/80">
                          {student.gender === "ذكر" ? (
                            <User className={`w-4 h-4 ${colors.icon} flex-shrink-0`} />
                          ) : (
                            <UserCheck className={`w-4 h-4 ${colors.icon} flex-shrink-0`} />
                          )}
                          <span className="text-xs">{student.gender}</span>
                        </div>
                      )}
                      {student.age && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-lg px-3 py-2 border border-white/80">
                          <Cake className={`w-4 h-4 ${colors.icon} flex-shrink-0`} />
                          <span className="text-xs">{student.age} سنة</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
