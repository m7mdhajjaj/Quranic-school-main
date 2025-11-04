// components/TeacherToolbar.tsx
import { Card } from "@/components/UI/Card";
import { Input } from "@/components/UI/Input";
import { Button } from "@/components/UI/Button";
import { Select } from "@/components/UI/Select";
import { Alert } from "@/components/UI/Alert";
import { CalendarDays, Users, Check, X } from "lucide-react";

interface TeacherToolbarProps {
  date: string;
  onDateChange: (date: string) => void;
  groupFilter: string;
  onGroupFilterChange: (group: string) => void;
  groupsAvailable: string[];
  nameQuery: string;
  onNameQueryChange: (query: string) => void;
  selectedAll: boolean;
  onToggleAll: () => void;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
  isDateTooOld: boolean;
  daysAgo: number;
}

export const TeacherToolbar = ({
  date,
  onDateChange,
  groupFilter,
  onGroupFilterChange,
  groupsAvailable,
  nameQuery,
  onNameQueryChange,
  selectedAll,
  onToggleAll,
  presentCount,
  absentCount,
  attendanceRate,
  isDateTooOld,
  daysAgo,
}: TeacherToolbarProps) => {
  return (
    <div className="space-y-4">
      {/* Stats Cards - استخدام Card من UI Library */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <p className="text-3xl font-bold text-red-600">{absentCount}</p>
            </div>
            <X className="w-12 h-12 text-red-500 opacity-30" />
          </div>
        </Card>

        <Card variant="elevated" className="border-r-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">نسبة الحضور</p>
              <p className="text-3xl font-bold text-blue-600">
                {attendanceRate}%
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-500 opacity-30" />
          </div>
        </Card>
      </div>

      {/* Controls - استخدام Card من UI Library */}
      <Card>
        <div className="space-y-4">
          {/* تحذير - استخدام Alert من UI Library */}
          {isDateTooOld && (
            <Alert variant="warning">
              ⚠️ تحذير: هذا التاريخ قديم (مضى عليه {daysAgo} يوم). لا يمكن تعديل
              الحضور بعد مرور أسبوع.
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* التاريخ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarDays className="w-4 h-4 inline-block ml-1" />
                التاريخ
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
              />
            </div>

            {/* الحلقة - استخدام Select من UI Library */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحلقة
              </label>
              <Select
                value={groupFilter}
                onChange={(e) => onGroupFilterChange(e.target.value)}
                options={groupsAvailable.map((g) => ({
                  value: g,
                  label: g === "all" ? "الكل" : g,
                }))}
              />
            </div>

            {/* بحث */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                بحث بالاسم
              </label>
              <Input
                type="text"
                placeholder="ابحث..."
                value={nameQuery}
                onChange={(e) => onNameQueryChange(e.target.value)}
              />
            </div>

            {/* أزرار */}
            <div className="flex items-end">
              <Button
                onClick={onToggleAll}
                variant={selectedAll ? "secondary" : "primary"}
                className="w-full">
                {selectedAll ? "إلغاء التحديد" : "تحديد الكل"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
