/**
 * Ranking Table Component
 * Displays all students in a table format
 */

import type { RankingTableProps } from "../types/arrangement";
import { getFullName, getMedalColor } from "../utils/arrangementHelpers";

export const RankingTable = ({ students }: RankingTableProps) => {
  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
      data-aos="fade-up"
      data-aos-delay="400">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 py-4 px-6">
        <h2 className="text-xl font-bold text-white">ترتيب جميع الطلاب</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr className="text-right">
              <th className="py-3 px-6 text-sm font-medium text-gray-600">
                الترتيب
              </th>
              <th className="py-3 px-6 text-sm font-medium text-gray-600">
                الطالب
              </th>
              <th className="py-3 px-6 text-sm font-medium text-gray-600">
                المعدل الكلي
              </th>
              <th className="py-3 px-6 text-sm font-medium text-gray-600">
                معدل الحفظ
              </th>
              <th className="py-3 px-6 text-sm font-medium text-gray-600">
                معدل المراجعة
              </th>
              <th className="py-3 px-6 text-sm font-medium text-gray-600">
                عدد العلامات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student, index) => (
              <tr
                key={student._id}
                className={`hover:bg-gray-50 ${
                  index < 3 ? "bg-emerald-50/50" : ""
                }`}>
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <span
                      className="font-bold flex items-center justify-center w-8 h-8 rounded-full text-white mr-2"
                      style={{
                        backgroundColor: getMedalColor(student.rank),
                      }}>
                      {student.rank}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#e9f5f2] flex items-center justify-center mr-3">
                      <span className="text-[#1f6357] font-bold">
                        {student.rank}
                      </span>
                    </div>
                    <span className="font-medium">{getFullName(student)}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`font-bold ${
                      index < 3 ? "text-emerald-700" : "text-gray-700"
                    }`}>
                    {student.overallAverage.toFixed(1)}%
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-700">
                  {student.memorizationAverage.toFixed(1)}%
                </td>
                <td className="py-4 px-6 text-gray-700">
                  {student.reviewAverage.toFixed(1)}%
                </td>
                <td className="py-4 px-6 text-gray-700">
                  {student.totalMarks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
