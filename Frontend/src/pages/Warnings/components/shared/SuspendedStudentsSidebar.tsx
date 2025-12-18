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
            الطلاب الموقوفين
          </h2>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-red-100 rounded-full text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
          {suspendedStudents.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>لا يوجد طلاب موقوفين</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suspendedStudents.map((student) => (
                <div 
                  key={student._id}
                  className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center text-red-700 font-bold">
                    {student.firstName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-red-600">
                      تم إيقاف الطالب
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
