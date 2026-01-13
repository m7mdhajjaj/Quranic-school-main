import React from 'react';

export const StudentAttendanceSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="relative overflow-hidden bg-gray-200 rounded-3xl shadow-2xl p-8 h-64"></div>
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-200 py-6 px-8 h-24"></div>
        <div className="p-6 md:p-8 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6 h-48"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const GroupsGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[180px] rounded-xl bg-white border border-gray-200 shadow-sm p-4 animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="w-3/4 h-6 bg-gray-200 rounded mb-2"></div>
            <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const TeacherAttendanceViewSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="py-4 px-6 border-b border-gray-100 bg-gray-50">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
      </div>
      <div className="p-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 border-b border-gray-100 bg-white px-6 flex items-center gap-4">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminAttendanceSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="relative overflow-hidden bg-gray-200 rounded-3xl shadow-2xl p-8 h-32"></div>
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-200 py-6 px-8 h-24"></div>
        <div className="p-6 md:p-8">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
