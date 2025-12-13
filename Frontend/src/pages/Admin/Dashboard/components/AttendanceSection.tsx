import React from "react";
import { Card } from "@/components/UI/Card";
import { FaTimesCircle, FaUser, FaChalkboardTeacher, FaUsers } from "react-icons/fa";
import { AbsentStudentCardSkeleton } from "@/components/skeletons";
import { useAbsentStudents } from "../hooks/useAbsentStudents";

export const AttendanceSection: React.FC = () => {
  const { absentStudents, isLoading, lastUpdate } = useAbsentStudents();


  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="p-4 sm:p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FaTimesCircle className="text-red-600 text-base sm:text-lg" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
            الطلاب الغائبين لهذا اليوم
          </h3>
          {!isLoading && absentStudents.length > 0 && (
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs sm:text-sm font-bold">
              {absentStudents.length}
            </span>
          )}
        </div>
        {!isLoading && (
          <div className="text-xs text-gray-500">
            <span>آخر تحديث: {formatTime(lastUpdate)}</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <AbsentStudentCardSkeleton count={absentStudents.length > 0 ? absentStudents.length : 4} />
      ) : absentStudents.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-green-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <FaUser className="text-4xl text-green-500" />
          </div>
          <p className="text-base font-bold text-gray-600 mb-2">
            لا يوجد طلاب غائبين
          </p>
          <p className="text-sm text-gray-500">
            جميع الطلاب حاضرين اليوم
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 max-h-[400px] overflow-y-auto pr-1">
          {absentStudents.map((student, index) => (
            <div
              key={student._id || index}
              className="flex flex-col gap-1.5 p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <FaUser className="text-white text-xs" />
                  </div>
                </div>
                <p className="font-bold text-gray-800 text-sm truncate flex-1" title={student.fullName}>
                  {student.fullName}
                </p>
              </div>
              
              <div className="flex flex-col gap-1 text-xs text-gray-600">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FaChalkboardTeacher className="text-emerald-600 flex-shrink-0 text-xs" />
                  <span className="truncate" title={student.teacher}>
                    {student.teacher}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <FaUsers className="text-blue-600 flex-shrink-0 text-xs" />
                  <span className="truncate" title={student.group}>
                    {student.group}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
