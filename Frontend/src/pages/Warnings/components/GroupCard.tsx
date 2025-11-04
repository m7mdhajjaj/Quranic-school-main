// ============================================================================
// GroupCard Component - بطاقة الحلقة
// ============================================================================

import type { GroupCardProps } from "../types/warnings";
import { Card } from "@/components/UI";

export const GroupCard: React.FC<GroupCardProps> = ({ group, onClick }) => {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
      padding="lg">
      <div className="text-center">
        <div className="text-5xl mb-4">📚</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{group.name}</h3>
        <p className="text-gray-600">{group.students?.length || 0} طالب</p>
      </div>
    </Card>
  );
};
