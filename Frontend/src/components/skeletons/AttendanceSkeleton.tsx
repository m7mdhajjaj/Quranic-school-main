// AttendanceSkeleton.tsx - Skeleton loaders for attendance pages
import { Calendar, CalendarDays } from "lucide-react";

// Skeleton for Student View
export const StudentViewSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
            <Calendar className="w-8 h-8 text-white opacity-50" />
          </div>
          <div className="space-y-2">
            <div className="h-8 w-64 bg-white/30 rounded-lg"></div>
            <div className="h-4 w-48 bg-white/20 rounded"></div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="h-4 w-32 bg-white/20 rounded mb-2"></div>
          <div className="flex gap-3">
            <div className="h-12 w-40 bg-white/30 rounded-xl"></div>
            <div className="h-12 w-32 bg-white/30 rounded-xl"></div>
          </div>
        </div>
      </div>

      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-3xl p-6 h-32"></div>
        ))}
      </div>

      {/* Timeline Skeleton */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-6 px-8">
          <div className="h-6 w-48 bg-white/30 rounded"></div>
        </div>
        <div className="p-8 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton for Teacher View
export const TeacherViewSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Toolbar Skeleton */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-48 bg-white/30 rounded"></div>
          <div className="h-10 w-48 bg-white/30 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white/20 rounded-2xl"></div>
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="py-4 px-6 bg-gray-50">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 px-6 flex items-center gap-4">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 w-8 bg-gray-200 rounded"></div>
              <div className="h-4 flex-1 bg-gray-200 rounded"></div>
              <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton for Groups Grid (Teacher)
export const GroupsGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 h-32"></div>
      ))}
    </div>
  );
};

// Skeleton for Admin View
export const AdminViewSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 h-28"></div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 py-6 px-8">
          <div className="h-8 w-64 bg-white/30 rounded"></div>
        </div>
        <div className="p-8">
          <div className="h-64 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};
