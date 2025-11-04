import React from "react";
import { Card, Button } from "../UI";
import {
  FaEdit,
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUserGraduate,
} from "react-icons/fa";
import type { Student } from "@/Api/studentApi";

interface StudentGridViewProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentGridView: React.FC<StudentGridViewProps> = ({
  students,
  onEdit,
  onDelete,
}) => {
  if (students.length === 0) {
    return (
      <Card variant="elevated" padding="xl">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-8xl mb-6 animate-bounce-slow">👥</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-3 text-center">
            لا يوجد طلاب
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            لم يتم إضافة أي طلاب في هذه الحلقة بعد
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {students.map((student) => (
        <Card
          key={student._id}
          variant="elevated"
          padding="lg"
          hover
          className="border-r-4 border-emerald-500">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {student.firstName} {student.fatherName} {student.lastName}
              </h3>
              <p className="text-sm text-gray-500">
                رقم الطالب: {student.studentId}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                student.gender === "ذكر"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-pink-100 text-pink-800"
              }`}>
              {student.gender}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaUserGraduate className="text-emerald-600" />
              <span>رقم الهوية: {student.idNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaPhone className="text-emerald-600" />
              <span>{student.phoneNumber || "-"}</span>
            </div>
            {student.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FaEnvelope className="text-emerald-600" />
                <span className="truncate">{student.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaMapMarkerAlt className="text-emerald-600" />
              <span>{student.residence || "-"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onEdit(student)}
              leftIcon={<FaEdit />}
              className="flex-1"
              gradient={false}>
              تعديل
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(student)}
              leftIcon={<FaTrash />}
              className="flex-1">
              حذف
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
