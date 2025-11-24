// components/TeacherToolbar.tsx
import { Card } from '@/components/UI/Card';
import { Input } from '@/components/UI/Input';
import { Select } from '@/components/UI/Select';
import { Alert } from '@/components/UI/Alert';
import { DatePicker } from '@/components/UI/DatePicker';
import { Users, Check, X } from 'lucide-react';
import StatCardSkeleton from '@/components/skeletons/StatCardSkeleton';
import type { TeacherToolbarProps } from '../types/absence.types';

export const TeacherToolbar = ({
  date,
  onDateChange,
  groupFilter,
  onGroupFilterChange,
  groupsAvailable,
  nameQuery,
  onNameQueryChange,
  totalStudents,
  presentCount,
  absentCount,
  attendanceRate,
  isDateTooOld,
  daysAgo,
  onSave,
  isSaving,
  isLoading = false,
}: TeacherToolbarProps) => {
  return (
    <div className="space-y-4">
      {/* Stats Cards - استخدام Card من UI Library */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card variant="elevated" className="border-r-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">إجمالي الطلاب</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {totalStudents}
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-500 opacity-30" />
              </div>
            </Card>

            <Card variant="elevated" className="border-r-4 border-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">الحاضرون</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {presentCount}
                  </p>
                </div>
                <Check className="w-12 h-12 text-emerald-500 opacity-30" />
              </div>
            </Card>

            <Card variant="elevated" className="border-r-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">الغائبون</p>
                  <p className="text-3xl font-bold text-red-600">
                    {absentCount}
                  </p>
                </div>
                <X className="w-12 h-12 text-red-500 opacity-30" />
              </div>
            </Card>

            <Card variant="elevated" className="border-r-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">نسبة الحضور</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {attendanceRate}%
                  </p>
                </div>
                <svg
                  className="w-12 h-12 text-purple-500 opacity-30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Filters Card - استخدام Card من UI Library */}
      <Card>
        <div className="space-y-4">
          {/* عنوان القسم */}
          <div className="border-b border-gray-200 pb-3">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-600" />
              أدوات الفلترة والبحث
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              اختر الحلقة وابحث عن الطلاب
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* الحلقة - استخدام Select من UI Library */}
            <div>
              <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-3">
                <Users className="h-5 w-5 text-emerald-600" />
                الحلقة
              </label>
              <Select
                value={groupFilter}
                onChange={(e) => onGroupFilterChange(e.target.value)}
                options={groupsAvailable.map((g) => ({
                  value: g,
                  label: g === 'all' ? 'جميع الحلقات' : g === '' ? 'بدون حلقة' : g,
                }))}
              />
            </div>

            {/* بحث */}
            <div>
              <label className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-3">
                <svg
                  className="h-5 w-5 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                بحث بالاسم
              </label>
              <Input
                type="text"
                placeholder="ابحث عن طالب..."
                value={nameQuery}
                onChange={(e) => onNameQueryChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Date and Save Card */}
      <Card>
        <div className="space-y-4">
          {/* عنوان القسم */}
          <div className="border-b border-gray-200 pb-3">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-emerald-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              التاريخ وحفظ السجل
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              اختر التاريخ واحفظ بيانات الحضور
            </p>
          </div>

          {/* تحذير - استخدام Alert من UI Library */}
          {isDateTooOld && (
            <Alert variant="warning">
              ⚠️ تحذير: هذا التاريخ قديم (مضى عليه {daysAgo} يوم). لا يمكن تعديل
              الحضور بعد مرور أسبوع.
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            {/* التاريخ */}
            <DatePicker label="التاريخ" value={date} onChange={onDateChange} />

            {/* زر الحفظ */}
            <div>
              <button
                onClick={onSave}
                disabled={isDateTooOld || isSaving}
                className={`w-full px-8 py-3 text-lg rounded-xl shadow-lg flex items-center justify-center gap-3 font-bold transition-all min-h-[52px] ${
                  isDateTooOld || isSaving
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
                title={
                  isDateTooOld
                    ? 'لا يمكن الحفظ - التاريخ أقدم من أسبوع'
                    : isSaving
                      ? 'جاري الحفظ...'
                      : 'حفظ السجل'
                }
              >
                {isSaving ? (
                  <svg
                    className="animate-spin h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {isDateTooOld
                  ? 'لا يمكن الحفظ (التاريخ قديم)'
                  : isSaving
                    ? 'جاري الحفظ...'
                    : 'حفظ السجل'}
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
