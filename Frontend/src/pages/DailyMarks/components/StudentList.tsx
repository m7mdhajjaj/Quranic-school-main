import { useState } from "react";
import type { StudentListProps } from "../types/dailyMarks";
import { Select } from "../../../components/shared/Select";
import { Button } from "../../../components/shared/Button";
import { Card } from "../../../components/shared/Card";
import { Users, Plus, Edit, Trash2, Search, X } from "lucide-react";

/**
 * Enhanced Student list component with search, group filter, and statistics
 * Shows list of students for selected group with action buttons
 */
export const StudentList = ({
  students,
  teacherGroups,
  selectedGroup,
  selectedStudentId,
  onGroupChange,
  onStudentSelect,
  onAddSection,
  onBulkUpdate,
  onBulkDelete,
}: StudentListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter students by search term
  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.fatherName} ${student.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <Card padding="none" className="lg:col-span-1 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 py-5 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-10"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">قائمة الطلاب</h2>
              <p className="text-emerald-50 text-xs mt-0.5">
                {filteredStudents.length} من {students.length} طالب
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Group Filter */}
      <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
        <Select
          label="اختر الحلقة"
          value={selectedGroup}
          onChange={(e) => onGroupChange(e.target.value)}
          options={
            teacherGroups.length === 0
              ? [{ value: "", label: "لا توجد حلقات" }]
              : teacherGroups.map((groupName) => ({
                  value: groupName,
                  label: groupName,
                }))
          }
          icon={<Users size={18} />}
          required
        />
      </div>

      {/* Search Bar */}
      {students.length > 0 && (
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="ابحث عن طالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                title="مسح البحث"
                aria-label="مسح البحث"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-xs text-gray-500 mt-2">
              {filteredStudents.length === 0 
                ? "لا توجد نتائج" 
                : `تم العثور على ${filteredStudents.length} طالب`}
            </p>
          )}
        </div>
      )}

      <div className="p-4 max-h-80 overflow-y-auto custom-scrollbar">
        {teacherGroups.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <Users className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 font-medium">لا توجد حلقات مسجلة لك</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <Users className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 font-medium">لا يوجد طلاب في حلقة {selectedGroup}</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <Search className="text-gray-300 mx-auto mb-3" size={48} />
            <p className="text-gray-500 font-medium">لا توجد نتائج للبحث</p>
            <p className="text-gray-400 text-sm mt-1">جرب مصطلح بحث آخر</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredStudents
              .sort((a, b) =>
                `${a.firstName} ${a.lastName}`.localeCompare(
                  `${b.firstName} ${b.lastName}`
                )
              )
              .map((student, index) => (
                <li key={student._id} className="relative">
                  <button
                    onClick={() => onStudentSelect(student._id)}
                    className={`w-full text-right py-3 px-4 rounded-xl transition-all duration-200 ${
                      selectedStudentId === student._id
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg transform scale-[1.02]"
                        : "bg-white hover:bg-gray-50 hover:shadow-md border border-gray-200"
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        selectedStudentId === student._id
                          ? "bg-white/20 text-white"
                          : "bg-emerald-100 text-emerald-600"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 text-right">
                        <span className={`block font-medium ${
                          selectedStudentId === student._id ? "text-white" : "text-gray-800"
                        }`}>
                          {`${student.firstName} ${student.fatherName} ${student.lastName}`}
                        </span>
                        <span className={`text-xs mt-0.5 block ${
                          selectedStudentId === student._id ? "text-emerald-50" : "text-gray-500"
                        }`}>
                          {student.group}
                        </span>
                      </div>
                      {selectedStudentId === student._id && (
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* Action Buttons with enhanced styling */}
      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-t space-y-2.5">
        <Button
          onClick={onAddSection}
          variant="success"
          size="md"
          fullWidth
          leftIcon={<Plus size={20} />}
          gradient={true}
          className="shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
          إضافة مقطع للحلقة
        </Button>

        <Button
          onClick={onBulkUpdate}
          variant="primary"
          size="md"
          fullWidth
          leftIcon={<Edit size={20} />}
          gradient={true}
          className="shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
          تحديث المقاطع
        </Button>

        <Button
          onClick={onBulkDelete}
          variant="danger"
          size="md"
          fullWidth
          leftIcon={<Trash2 size={20} />}
          gradient={true}
          className="shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
          حذف المقاطع
        </Button>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
    </Card>
  );
};
