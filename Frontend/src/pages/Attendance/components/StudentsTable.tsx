// components/StudentsTable.tsx
import { useState } from 'react';
import type { StudentsTableProps } from '../types/absence.types';

export const StudentsTable = ({
  students,
  selectedAll,
  onToggleAll,
  onTogglePresence,
}: StudentsTableProps) => {
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(
    null
  );

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
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-right text-sm font-semibold text-gray-600 w-[100px]">#</th>
                  <th className="py-4 px-6 text-right text-sm font-semibold text-gray-600">اسم الطالب</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600 w-[120px]">الغيابات</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600 w-[180px]">التفاصيل</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600 w-[120px]">
                    <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={onToggleAll}>
                      <span className="text-xs">حضور الكل</span>
                      <input
                        type="checkbox"
                        checked={selectedAll}
                        onChange={onToggleAll}
                        className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
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
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-base font-medium ${!s.isPresent ? 'text-red-700' : 'text-gray-900'}`}>
                          {s.name}
                        </span>
                        {s.group && <span className="text-xs text-gray-400">{s.group}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
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
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      {(s.absenceDates ?? []).length > 0 ? (
                        <div className="relative inline-block">
                          <button
                            onClick={() => setExpandedStudentId(expandedStudentId === s._id ? null : s._id)}
                            className="text-xs text-teal-600 hover:text-teal-700 font-medium hover:underline"
                          >
                            {expandedStudentId === s._id ? 'إخفاء' : 'عرض التواريخ'}
                          </button>
                          
                          {expandedStudentId === s._id && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 p-2">
                              <div className="text-xs font-semibold text-gray-400 mb-2 px-2">سجل الغياب</div>
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {s.absenceDates?.map((date, idx) => (
                                  <div key={idx} className="text-xs bg-gray-50 p-1.5 rounded text-gray-600 text-center">
                                    {date}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
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
            {students.map((s) => (
              <div
                key={s._id}
                className={`p-4 transition-colors ${!s.isPresent ? 'bg-red-50/30' : 'bg-white'}`}
                onClick={() => onTogglePresence(s._id)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-base font-bold truncate ${!s.isPresent ? 'text-red-700' : 'text-gray-900'}`}>
                        {s.name}
                      </h3>
                      {(s.totalAbsences ?? 0) > 0 && (
                        <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {s.totalAbsences} غياب
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{s.studentId}</span>
                      {s.group && (
                        <>
                          <span>•</span>
                          <span>{s.group}</span>
                        </>
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
                        setExpandedStudentId(expandedStudentId === s._id ? null : s._id);
                      }}
                      className="text-xs text-teal-600 font-medium flex items-center gap-1"
                    >
                      <span>{expandedStudentId === s._id ? 'إخفاء التواريخ' : 'عرض تواريخ الغياب'}</span>
                      <svg className={`w-3 h-3 transition-transform ${expandedStudentId === s._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedStudentId === s._id && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {s.absenceDates?.map((date, idx) => (
                          <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {date}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
