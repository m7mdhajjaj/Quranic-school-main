import { useState, memo, useMemo } from "react";
import type { StudentListProps } from "../types/types";
import { Select, Button,Card } from "@/components/UI";
import { SearchInput } from "@/components/Filters";
import { Users, Plus, Edit, Trash2 } from "lucide-react";

/**
 * Enhanced Student list component with search, group filter, and statistics
 * Shows list of students for selected group with action buttons
 */
const StudentListComponent = ({
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

  // Pre-compute student data with full names - memoized
  const studentsWithNames = useMemo(() => {
    return students.map(student => ({
      ...student,
      fullName: `${student.firstName} ${student.fatherName} ${student.lastName}`,
      fullNameLower: `${student.firstName} ${student.fatherName} ${student.lastName}`.toLowerCase()
    }));
  }, [students]);

  // Filter students by search term - memoized
  const filteredStudents = useMemo(() => {
    return studentsWithNames.filter((student) => {
      return student.fullNameLower.includes(searchTerm.toLowerCase());
    });
  }, [studentsWithNames, searchTerm]);

  return (
    <Card padding="none" className="lg:col-span-1 overflow-hidden">
      {/* Header */}
      <div className="bg-emerald-600 py-4 px-5 border-b border-emerald-700">
        <div className="flex items-center gap-2.5">
          <Users className="text-white" size={20} />
          <div>
            <h2 className="text-lg font-bold text-white">قائمة الطلاب</h2>
            <p className="text-emerald-100 text-xs mt-0.5">
              {filteredStudents.length} من {students.length} طالب
            </p>
          </div>
        </div>
      </div>

      {/* Group Filter */}
      <div className="p-4 border-b bg-gray-50">
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
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="ابحث عن طالب..."
            size="sm"
          />
          {searchTerm && (
            <p className="text-xs text-gray-500 mt-2">
              {filteredStudents.length === 0 
                ? "لا توجد نتائج" 
                : `تم العثور على ${filteredStudents.length} طالب`}
            </p>
          )}
        </div>
      )}

      <div className="p-4 max-h-80 min-h-[320px] overflow-y-auto custom-scrollbar">
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
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <Users className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 font-medium">لا توجد نتائج للبحث</p>
            <p className="text-gray-400 text-sm mt-1">جرب مصطلح بحث آخر</p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {filteredStudents
              .sort((a, b) =>
                `${a.firstName} ${a.lastName}`.localeCompare(
                  `${b.firstName} ${b.lastName}`
                )
              )
              .map((student) => (
                <li key={student._id}>
                  <button
                    onClick={() => onStudentSelect(student._id)}
                    type="button"
                    data-selected={selectedStudentId === student._id}
                    className="student-btn">
                    {student.fullName}
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-gray-50 border-t space-y-2 min-h-[180px]">
        <Button
          onClick={onAddSection}
          variant="success"
          size="md"
          fullWidth
          leftIcon={<Plus size={18} />}>
          إضافة مقطع للحلقة
        </Button>

        <Button
          onClick={onBulkUpdate}
          variant="primary"
          size="md"
          fullWidth
          leftIcon={<Edit size={18} />}>
          تحديث المقاطع
        </Button>

        <Button
          onClick={onBulkDelete}
          variant="danger"
          size="md"
          fullWidth
          leftIcon={<Trash2 size={18} />}>
          حذف المقاطع
        </Button>
      </div>

      {/* Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        .student-btn {
          width: 100%;
          text-align: right;
          padding: 10px 16px;
          background: white;
          color: #374151;
          font-size: 14px;
          border-radius: 6px;
        }
        .student-btn:hover {
          background: #f9fafb;
        }
        .student-btn[data-selected="true"] {
          background: #10b981;
          color: white;
          font-weight: 500;
        }
      `}</style>
    </Card>
  );
};

export const StudentList = memo(StudentListComponent);
