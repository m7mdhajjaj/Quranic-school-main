/**
 * Ranking Table Component
 * Displays all students in a table format
 * Uses shared Table component
 */

import type { RankingTableProps } from "../types/arrangement";
import type { StudentWithAverage } from "../types/arrangement";
import { getFullName } from "../utils/arrangementHelpers";
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

  // Define columns
  const columns: Column<StudentWithAverage>[] = [
    {
      key: "rank",
      header: "الترتيب",
      align: "right",
      width: "100px",
      render: (student) => (
        <div className="flex items-center">
          <span
            className={`font-bold flex items-center justify-center w-8 h-8 rounded-full text-white mr-2 ${getMedalClasses(
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
        <span className="font-medium">{getFullName(student)}</span>
      ),
    },
    {
      key: "overallAverage",
      header: "المعدل الكلي",
      align: "right",
      width: "120px",
      render: (student, index) => (
        <span
          className={`font-bold ${
            index < 3 ? "text-emerald-700" : "text-gray-700"
          }`}>
          {student.overallAverage.toFixed(1)}%
        </span>
      ),
    },
    {
      key: "memorizationAverage",
      header: "معدل الحفظ",
      align: "right",
      width: "120px",
      render: (student) => (
        <span className="text-gray-700">
          {student.memorizationAverage.toFixed(1)}%
        </span>
      ),
    },
    {
      key: "reviewAverage",
      header: "معدل المراجعة",
      align: "right",
      width: "120px",
      render: (student) => (
        <span className="text-gray-700">
          {student.reviewAverage.toFixed(1)}%
        </span>
      ),
    },
    {
      key: "totalMarks",
      header: "عدد العلامات",
      align: "right",
      width: "120px",
      render: (student) => (
        <span className="text-gray-700">{student.totalMarks}</span>
      ),
    },
  ];

  return (
    <div data-aos="fade-up" data-aos-delay="400" className="mb-8">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6 rounded-t-2xl shadow-lg">
        <h2 className="text-xl font-bold text-white">ترتيب جميع الطلاب</h2>
      </div>

      {/* Table using shared component */}
      <div className="rounded-b-2xl overflow-hidden shadow-lg bg-white">
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
          className="rounded-none !border-0 shadow-none [&>div]:!border-0"
          emptyMessage="لا يوجد طلاب للعرض"
          emptyDescription="لم يتم العثور على أي بيانات للطلاب"
          emptyIcon="👥"
        />
      </div>
    </div>
  );
};
