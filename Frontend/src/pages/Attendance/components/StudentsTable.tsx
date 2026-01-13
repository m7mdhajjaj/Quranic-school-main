// components/StudentsTable.tsx
import { useState } from 'react';
import type { StudentsTableProps } from '../types/absence.types';
import { X, Calendar } from 'lucide-react';

export const StudentsTable = ({
  students,
  selectedAll,
  onToggleAll,
  onTogglePresence,
}: StudentsTableProps) => {
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ name: string; absenceDates: string[] } | null>(null);

  const openModal = (studentName: string, absenceDates: string[]) => {
    setSelectedStudent({ name: studentName, absenceDates });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="py-4 px-6 border-b border-emerald-600 flex justify-between items-center bg-gradient-to-r from-emerald-500 to-teal-500">
        <h2 className="text-lg font-bold text-white">
          قائمة الطلاب <span className="text-emerald-100 font-normal text-sm mr-2">({students.length})</span>
        </h2>
        
        {/* Mobile Select All */}
        <div className="md:hidden flex items-center gap-2">
          <label className="text-sm text-white font-medium cursor-pointer" htmlFor="mobile-select-all">تحديد الكل</label>
          <input
            id="mobile-select-all"
            type="checkbox"
            checked={selectedAll}
            onChange={onToggleAll}
            className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
            title="تحديد الكل"
          />
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">لا يوجد طلاب</h3>
          <p className="text-gray-500 mt-1">لم يتم العثور على طلاب مطابقين للبحث</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto -mx-2 px-2">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 pr-3 pl-0 text-right text-sm font-semibold text-gray-600 w-[50px]">#</th>
                  <th className="py-3 px-0 text-right text-sm font-semibold text-gray-600">اسم الطالب</th>
                  <th className="py-3 px-0 text-center text-sm font-semibold text-gray-600 w-[80px]">الجنس</th>
                  <th className="py-3 px-0 text-center text-sm font-semibold text-gray-600 w-[120px]">رقم الهاتف</th>
                  <th className="py-3 px-3 text-center text-sm font-semibold text-gray-600 w-[85px]">الغيابات</th>
                  <th className="py-3 px-3 text-center text-sm font-semibold text-gray-600 w-[100px]">التفاصيل</th>
                  <th className="py-3 px-3 text-center text-sm font-semibold text-gray-600 w-[100px]">
                    <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={onToggleAll}>
                      <span className="text-xs">حضور الكل</span>
                      <input
                        type="checkbox"
                        checked={selectedAll}
                        readOnly
                        className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 pointer-events-none"
                        title="حضور الكل"
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s, index) => (
                  <tr
                    key={s._id}
                    className={`
                      group transition-colors hover:bg-gray-50
                      ${!s.isPresent ? 'bg-red-50/30' : ''}
                    `}
                    onClick={() => onTogglePresence(s._id)}
                  >
                    <td className="pr-3 pl-0 py-3 text-sm text-gray-500 font-mono">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-0 py-3">
                      <span className={`text-base font-bold ${!s.isPresent ? 'text-red-700' : 'text-gray-900'}`}>
                        {s.name}
                      </span>
                    </td>
                    <td className="px-0 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        s.gender === 'female' 
                          ? 'bg-pink-100 text-pink-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {s.gender === 'female' ? 'أنثى' : 'ذكر'}
                      </span>
                    </td>
                    <td className="px-0 py-3 text-center">
                      <span className="text-sm text-gray-600 font-mono" dir="ltr">
                        {s.phoneNumber || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`
                          inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${(s.totalAbsences ?? 0) === 0 ? 'bg-green-100 text-green-800' : 
                            (s.totalAbsences ?? 0) <= 3 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}
                        `}
                      >
                        {s.totalAbsences ?? 0}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      {(s.absenceDates ?? []).length > 0 ? (
                        <button
                          onClick={() => openModal(s.name, s.absenceDates || [])}
                          className="text-xs text-teal-600 hover:text-teal-700 font-medium hover:underline flex items-center gap-1 mx-auto"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>عرض التواريخ</span>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={s.isPresent}
                          onChange={() => onTogglePresence(s._id)}
                          className="w-6 h-6 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                          title={`تغيير حضور الطالب ${s.name}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className="md:hidden divide-y divide-gray-100">
            {students.map((s, index) => (
              <div
                key={s._id}
                className={`p-4 transition-colors ${!s.isPresent ? 'bg-red-50/30' : 'bg-white'}`}
                onClick={() => onTogglePresence(s._id)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className={`text-sm sm:text-base font-bold ${!s.isPresent ? 'text-red-700' : 'text-gray-900'}`}>
                        {s.name}
                      </h3>
                      {(s.totalAbsences ?? 0) > 0 && (
                        <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {s.totalAbsences} غياب
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-mono text-gray-400">#{index + 1}</span>
                      <span>{s.studentId}</span>
                      {s.group && (
                        <>
                          <span>•</span>
                          <span>{s.group}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        s.gender === 'female' 
                          ? 'bg-pink-100 text-pink-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {s.gender === 'female' ? '👧 أنثى' : '👦 ذكر'}
                      </span>
                      {s.phoneNumber && (
                        <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono" dir="ltr">
                          📞 {s.phoneNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={s.isPresent}
                        onChange={() => onTogglePresence(s._id)}
                        className="w-7 h-7 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                        title={`تغيير حضور الطالب ${s.name}`}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Mobile Absence Details */}
                {(s.absenceDates ?? []).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(s.name, s.absenceDates || []);
                      }}
                      className="text-xs text-teal-600 font-medium flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>عرض تواريخ الغياب</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {modalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">سجل الغياب</h3>
                  <p className="text-sm text-red-50">{selectedStudent.name}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  إجمالي أيام الغياب: <span className="font-bold text-red-600">{selectedStudent.absenceDates.length}</span>
                </p>
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                {selectedStudent.absenceDates.map((date, idx) => {
                  // تحويل التاريخ من DD/MM/YYYY إلى كائن Date
                  const [day, month, year] = date.split('/').map(Number);
                  const dateObj = new Date(year, month - 1, day);
                  const dayName = dateObj.toLocaleDateString('ar-SA', { weekday: 'long' });
                  
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold group-hover:bg-red-200 transition-colors">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{date}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{dayName}</p>
                      </div>
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
