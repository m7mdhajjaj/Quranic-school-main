// ============================================================================
// GroupCard Component - بطاقة الحلقة
// ============================================================================

import React from 'react';
import { BookOpen } from 'lucide-react';
import type { GroupCardProps } from "../../types/warnings";
import { Card } from "@/components/UI";

export const GroupCard: React.FC<GroupCardProps> = React.memo(({ group, onClick }) => {
  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer bg-gradient-to-br from-white to-blue-50/50 border-2 border-transparent hover:border-blue-200 shadow-xl hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden will-change-[box-shadow]"
      padding="lg">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      <div className="text-center relative z-10">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2 group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300">
          {group.name}
        </h3>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-gray-600 font-medium">
            {group.students?.length || 0} طالب
          </p>
        </div>
      </div>
    </Card>
  );
}, (prevProps, nextProps) => {
  // ✅ مقارنة مخصصة
  return (
    prevProps.group._id === nextProps.group._id &&
    prevProps.group.students?.length === nextProps.group.students?.length
  );
});
