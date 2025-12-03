// ============================================================================
// GroupCard Component - بطاقة الحلقة
// ============================================================================

import type { GroupCardProps } from "../../types/warnings";
import { Card } from "@/components/UI";

export const GroupCard: React.FC<GroupCardProps> = ({ group, onClick }) => {
  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50/50 border-2 border-transparent hover:border-blue-200 relative overflow-hidden"
      padding="lg">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="text-center relative z-10">
        <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
          📚
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2 group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
          {group.name}
        </h3>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <p className="text-gray-600 font-medium">
            {group.students?.length || 0} طالب
          </p>
        </div>
      </div>
    </Card>
  );
};
