import { Card } from '@/components/UI/Card';
import { Users, ArrowLeft } from 'lucide-react';
import type { TeacherGroup } from '../types/absence.types';

interface TeacherGroupsGridProps {
  groups: TeacherGroup[];
  onSelectGroup: (group: TeacherGroup) => void;
  isLoading: boolean;
}

export const TeacherGroupsGrid = ({ groups, onSelectGroup, isLoading }: TeacherGroupsGridProps) => {
  // Filter only active groups
  const activeGroups = groups.filter(g => g.status === 'active' || !g.status);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-[180px] rounded-xl bg-white border border-gray-200 shadow-sm p-4 animate-pulse flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
            <div>
              <div className="w-3/4 h-6 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activeGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <Users className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-700">لا توجد حلقات نشطة</h3>
        <p className="text-gray-500 mt-2">لم يتم العثور على حلقات نشطة مرتبطة بحسابك.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">اختر الحلقة لتسجيل الحضور</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeGroups.map((group) => (
          <div
            key={group._id}
            onClick={() => onSelectGroup(group)}
            className="group cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
          >
            <Card 
              variant="elevated" 
              className="h-full border-t-4 border-teal-500 hover:shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-20 h-20 bg-teal-50 rounded-br-full -translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-500" />
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-teal-100 rounded-xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                    <Users className="w-8 h-8" />
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 group-hover:text-teal-500 transition-colors">
                    <span className="text-sm font-medium">تسجيل</span>
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-teal-700 transition-colors">
                    {group.name}
                  </h3>
                  <p className="text-gray-500 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {group.totalStudents || 0} طالب
                  </p>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
