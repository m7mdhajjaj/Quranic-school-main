import React from "react";
import { Card } from "@/components/UI/Card";
import { FaMedal, FaStar } from "react-icons/fa";

interface TopStudent {
  name: string;
  value: number;
  avatar?: string;
  avgMark?: number;
  attendanceRate?: number;
  group?: string;
}

interface TopTeacher {
  name: string;
  value: number;
  avatar?: string;
  studentCount?: number;
  marksCount?: number;
  attendanceCount?: number;
  memorizedCount?: number;
  reviewCount?: number;
  group?: string;
}

interface TopListsSectionProps {
  topStudents: TopStudent[];
  topTeachers: TopTeacher[];
}

export const TopListsSection: React.FC<TopListsSectionProps> = ({
  topStudents,
  topTeachers,
}) => {
  const getMedalColor = (index: number): string => {
    const colors = [
      "text-yellow-500", // ذهبي
      "text-gray-400", // فضي
      "text-orange-600", // برونزي
      "text-emerald-500",
      "text-green-500",
    ];
    return colors[index] || "text-gray-500";
  };

  const renderStudentsList = (
    items: TopStudent[],
    title: string,
    icon: React.ReactNode
  ) => (
    <Card className="p-4 sm:p-5 lg:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
        {icon}
        {title}
      </h3>

      <div className="space-y-3 sm:space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100 group hover:border-green-300">
            {/* الترتيب */}
            <div
              className={`text-2xl sm:text-3xl font-bold ${getMedalColor(
                index
              )} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
              <FaMedal />
            </div>

            {/* الصورة الشخصية */}
            {item.avatar ? (
              <img
                src={item.avatar}
                alt={item.name || "طالب"}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 sm:border-3 border-white shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                {item.name ? item.name.charAt(0).toUpperCase() : "؟"}
              </div>
            )}

            {/* الاسم */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-green-600 transition-colors truncate" title={item.name || "غير محدد"}>
                {item.name || "غير محدد"}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">المرتبة {index + 1}</p>
            </div>

            {/* القيمة */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
              <FaStar className="text-yellow-300 text-sm sm:text-base" />
              <span className="font-bold text-base sm:text-lg">{item.value || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <p className="text-base sm:text-lg">لا توجد بيانات لعرضها</p>
        </div>
      )}
    </Card>
  );

  const renderTeachersList = (
    items: TopTeacher[],
    title: string,
    icon: React.ReactNode
  ) => (
    <Card className="p-4 sm:p-5 lg:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
        {icon}
        {title}
      </h3>

      <div className="space-y-3 sm:space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100 group hover:border-green-300">
            {/* الترتيب */}
            <div
              className={`text-2xl sm:text-3xl font-bold ${getMedalColor(
                index
              )} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
              <FaMedal />
            </div>

            {/* الصورة الشخصية */}
            {item.avatar ? (
              <img
                src={item.avatar}
                alt={item.name || "معلم"}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 sm:border-3 border-white shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                {item.name ? item.name.charAt(0).toUpperCase() : "؟"}
              </div>
            )}

            {/* الاسم */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-green-600 transition-colors truncate" title={item.name || "غير محدد"}>
                {item.name || "غير محدد"}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">المرتبة {index + 1}</p>
            </div>

            {/* القيمة */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
              <FaStar className="text-yellow-300 text-sm sm:text-base" />
              <span className="font-bold text-base sm:text-lg">{item.value || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <p className="text-base sm:text-lg">لا توجد بيانات لعرضها</p>
        </div>
      )}
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {renderStudentsList(
        topStudents,
        "أفضل 5 طلاب",
        <FaMedal className="text-yellow-500" />
      )}
      {renderTeachersList(
        topTeachers,
        "أفضل 5 معلمين",
        <FaStar className="text-green-600" />
      )}
    </div>
  );
};
