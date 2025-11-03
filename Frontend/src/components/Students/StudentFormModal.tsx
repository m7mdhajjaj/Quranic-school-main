import React from "react";
import AddStudentFormWithYup from "../../Forms/AddStudentForm";
import type { Student } from "../../Api/studentApi";

interface StudentFormModalProps {
  isVisible: boolean;
  isEditMode: boolean;
  student?: Student | null;
  onSuccess: () => void;
  onClose: () => void;
  defaultGroup?: string;
  restrictToGroup?: string;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isVisible,
  isEditMode,
  student,
  onSuccess,
  onClose,
  defaultGroup,
  restrictToGroup,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Gradient Header */}
        <div
          className={`p-6 ${
            isEditMode
              ? "bg-gradient-to-r from-blue-500 to-indigo-600"
              : "bg-gradient-to-r from-emerald-500 to-teal-600"
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                {isEditMode ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                )}
              </div>
              <h2 className="text-xl font-bold text-white">
                {isEditMode ? "تعديل الطالب" : "إضافة طالب جديد"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition"
              title="إغلاق"
              aria-label="إغلاق">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 max-h-[calc(90vh-88px)] overflow-y-auto">
          <AddStudentFormWithYup
            student={student || undefined}
            onSuccess={onSuccess}
            onClose={onClose}
            defaultGroup={defaultGroup}
            restrictToGroup={restrictToGroup}
          />
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};
