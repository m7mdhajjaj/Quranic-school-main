import PageHeader from "@/components/UI/PageHeader";
import { Button, Badge } from "@/components/UI";
import type { ReactNode } from "react";

interface AzkarHeaderProps {
  title: string;
  icon: ReactNode;
  completedCount: number;
  totalCount: number;
  onBack: () => void;
  onReset: () => void;
}

const AzkarHeader = ({
  title,
  icon,
  completedCount,
  totalCount,
  onBack,
  onReset,
}: AzkarHeaderProps) => {
  return (
    <div className="mb-6">
      {/* استخدام PageHeader من shared */}
      <PageHeader
        title={title}
        icon={icon}
        showDivider={false}
        className="mb-4"
      />
      
      {/* الأزرار والشارة */}
      <div className="flex items-center justify-between gap-4 px-4">
        <Button
          onClick={onReset}
          variant="primary"
          size="md"
          className="bg-blue-500 hover:bg-blue-600">
          إعادة تعيين
        </Button>
        
        <Badge variant="success" size="lg">
          التقدم: {completedCount} / {totalCount}
        </Badge>
        
        <Button
          onClick={onBack}
          variant="ghost"
          size="md">
          <span className="font-medium">رجوع</span>
          <span className="text-2xl">→</span>
        </Button>
      </div>
    </div>
  );
};

export default AzkarHeader;
