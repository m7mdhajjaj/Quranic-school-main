/**
 * Ranking Table Component
 * Displays all students in a table format
 * Uses shared Table component
 */

import type { RankingTableProps } from "../types/ranking";
import type { StudentWithAverage } from "../types/ranking";
import { getFullName } from "../utils/rankingHelpers";
import { Table } from "@/components/UI/Table";
import type { Column } from "@/components/UI/Table";

export const RankingTable = ({ students }: RankingTableProps) => {
  // Medal colors helper
  const getMedalClasses = (rank: number) => {
    if (rank === 1) return "bg-yellow-400";
    if (rank === 2) return "bg-gray-400";
    if (rank === 3) return "bg-orange-600";
    return "bg-gray-300";
  };

  // Mobile card view for each student
  const renderMobileCard = (student: StudentWithAverage, index: number) => (
    <div
      key={student._id}
      className={`p-4 rounded-lg border-2 ${
        index < 3 ? "bg-emerald-50/50 border-emerald-200" : "bg-white border-gray-200"
      } shadow-sm hover:shadow-md transition-shadow`}
    >
      {/* Header: Rank + Name */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span
            className={`font-bold flex items-center justify-center w-10 h-10 rounded-full text-white ${getMedalClasses(
              student.rank
            )}`}
          >
            {student.rank}
          </span>
          <div>
            <h3 className="font-bold text-base text-gray-800">
              {getFullName(student)}
            </h3>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Overall Average */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">المعدل الكلي</p>
          <p className={`text-lg font-bold ${index < 3 ? "text-emerald-700" : "text-gray-700"}`}>
            {student.overallAverage.toFixed(1)}%
          </p>
        </div>

        {/* Total Marks */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">عدد العلامات</p>
          <p className="text-lg font-bold text-gray-700">{student.totalMarks}</p>
        </div>

        {/* Memorization */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">معدل الحفظ</p>
          <p className="text-base font-semibold text-gray-700">
            {student.memorizationAverage.toFixed(1)}%
          </p>
        </div>

        {/* Review */}
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">معدل المراجعة</p>
          <p className="text-base font-semibold text-gray-700">
            {student.reviewAverage.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );

  // Define columns
  const columns: Column<StudentWithAverage>[] = [
    {
      key: "rank",
      header: "الترتيب",
      align: "right",
      width: "80px",
      render: (student) => (
        <div className="flex items-center justify-center sm:justify-start">
          <span
            className={`font-bold flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white text-sm sm:text-base ${getMedalClasses(
              student.rank
            )}`}>
            {student.rank}
          </span>
        </div>
      ),
    },
    {
      key: "student",
      header: "الطالب",
      align: "right",
      render: (student) => (
        <span className="font-medium text-sm sm:text-base whitespace-nowrap">{getFullName(student)}</span>
      ),
    },
    {
      key: "overallAverage",
      header: "المعدل الكلي",
      align: "right",
      width: "100px",
      render: (student, index) => (
        <span
          className={`font-bold text-sm sm:text-base ${
            index < 3 ? "text-emerald-700" : "text-gray-700"
          }`}>
          {student.overallAverage.toFixed(1)}%
        </span>
      ),
    },
    {
      key: "memorizationAverage",
      header: "الحفظ",
      align: "right",
      width: "90px",
      render: (student) => (
        <span className="text-gray-700 text-sm sm:text-base">
          {student.memorizationAverage.toFixed(1)}%
        </span>
      ),
    },
    {
      key: "reviewAverage",
      header: "المراجعة",
      align: "right",
      width: "90px",
      render: (student) => (
        <span className="text-gray-700 text-sm sm:text-base">
          {student.reviewAverage.toFixed(1)}%
        </span>
      ),
    },
    {
      key: "totalMarks",
      header: "العلامات",
      align: "right",
      width: "80px",
      render: (student) => (
        <span className="text-gray-700 text-sm sm:text-base">{student.totalMarks}</span>
      ),
    },
  ];

  return (
    <div data-aos="fade-up" data-aos-delay="400" className="mb-8 mx-2 sm:mx-0">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-3 sm:py-4 px-4 sm:px-6 rounded-t-2xl shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold text-white">ترتيب جميع الطلاب</h2>
      </div>

      {/* Mobile View - Cards (visible on small screens) */}
      <div className="sm:hidden bg-white rounded-b-2xl shadow-lg p-4">
        <div className="space-y-3">
          {students.length > 0 ? (
            students.map((student, index) => renderMobileCard(student, index))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg mb-2">👥</p>
              <p className="text-gray-600 font-medium">لا يوجد طلاب للعرض</p>
              <p className="text-gray-500 text-sm">لم يتم العثور على أي بيانات للطلاب</p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop/Tablet View - Table (hidden on small screens) */}
      <div className="hidden sm:block rounded-b-2xl overflow-hidden shadow-lg bg-white overflow-x-auto">
        <Table
          columns={columns}
          data={students}
          rowClassName={(_, index) => (index < 3 ? "bg-emerald-50/50" : "")}
          hoverable={true}
          responsive={true}
          showHeader={true}
          stickyHeader={false}
          bordered={false}
          dense={false}
          className="rounded-none !border-0 shadow-none [&>div]:!border-0 min-w-full"
          emptyMessage="لا يوجد طلاب للعرض"
          emptyDescription="لم يتم العثور على أي بيانات للطلاب"
          emptyIcon="👥"
        />
      </div>
    </div>
  );
};
