import React from 'react';
import { X, UserX } from 'lucide-react';
import type { Student } from '../../types/warnings';

interface SuspendedStudentsSidebarProps {
  suspendedStudents: Student[];
  isOpen: boolean;
  onToggle: () => void;
}

export const SuspendedStudentsSidebar: React.FC<SuspendedStudentsSidebarProps> = ({
  suspendedStudents,
  isOpen,
  onToggle,
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b flex justify-between items-center bg-red-50">
          <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
            <UserX className="w-5 h-5" />
            الطلاب المفصولين ({suspendedStudents.length})
          </h2>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-red-100 rounded-full text-red-600 transition-colors"
            aria-label="إغلاق القائمة الجانبية"
            title="إغلاق القائمة الجانبية"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
          {suspendedStudents.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-medium">لا يوجد طلاب مفصولين</p>
              <p className="text-sm text-gray-400 mt-2">جميع الطلاب نشطين في الحلقة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suspendedStudents.map((student) => (
                <div 
                  key={student._id}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center text-red-700 font-bold shrink-0">
                      {student.firstName?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <span>⛔</span>
                        <span>تم فصل الطالب (إنذار ثالث)</span>
                      </p>
                    </div>
                  </div>
                  {/* عرض عدد الإنذارات */}
                  {student.warningsCount > 0 && (
                    <div className="mt-2 pt-2 border-t border-red-200">
                      <p className="text-xs text-gray-600">
                        إجمالي الإنذارات: <span className="font-bold text-red-700">{student.warningsCount}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
