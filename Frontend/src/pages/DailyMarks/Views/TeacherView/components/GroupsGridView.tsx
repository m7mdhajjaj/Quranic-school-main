import { Card } from "@/components/UI";
import { Users, BookOpen } from "lucide-react";

interface GroupsGridViewProps {
  groupsWithStats: Array<{
    name: string;
    studentsCount: number;
    sectionsCount: number;
    hasStudents: boolean;
    loading?: boolean;
  }>;
  onGroupSelect: (groupName: string) => void;
  isLoading?: boolean;
}



/**
 * عرض Grid للحلقات مع إحصائياتها
 */
export const GroupsGridView = ({ 
  groupsWithStats, 
  onGroupSelect,
  isLoading = false 
}: GroupsGridViewProps) => {
  // Skeleton logic removed per user request
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">اختر حلقة</h2>
        <p className="text-gray-600">اختر حلقة لعرض مقاطعها وعلاماتها</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupsWithStats.map((group) => (
          <Card
            key={group.name}
            onClick={() => onGroupSelect(group.name)}
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-gray-200 hover:border-emerald-400 bg-gradient-to-br from-white to-emerald-50/30"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-700 rounded-xl shadow-lg">
                  <Users className="text-white" size={24} />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-3">{group.name}</h3>
              
              {/* Statistics Section */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <Users className="text-emerald-600" size={18} />
                    <div>
                      <p className="text-xs text-emerald-600 mb-0.5">عدد الطلاب</p>
                      <p className="text-lg font-bold text-emerald-700">{group.studentsCount}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
                  <div className="flex items-center gap-2">
                    <BookOpen className="text-teal-600" size={18} />
                    <div>
                      <p className="text-xs text-teal-600 mb-0.5">عدد المقاطع</p>
                      <p className="text-lg font-bold text-teal-700">
                        {group.loading || isLoading ? "..." : group.sectionsCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-emerald-600 mt-4 pt-4 border-t border-emerald-200 font-semibold">
                <BookOpen size={16} />
                <span>اضغط لعرض المقاطع</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
