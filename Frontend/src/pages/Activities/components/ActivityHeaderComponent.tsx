import React from 'react';
import { Button } from '../../../components/UI';
import  PageHeader  from '../../../components/UI/PageHeader';
import { Plus, Sparkles } from 'lucide-react';

interface ActivityHeaderProps {
  isTeacherOrAdmin: boolean;
  onAddClick: () => void;
}

export const ActivityHeaderComponent: React.FC<ActivityHeaderProps> = ({
  isTeacherOrAdmin,
  onAddClick,
}) => {
  return (
    <div data-aos="fade-down">
      {/* استخدام PageHeader الجاهز */}
      <PageHeader
        title="أنشطة المدرسة القرآنية"
        subtitle="أنشطة وفعاليات متنوعة للطلاب لتعزيز مهارات الحفظ والتجويد والتلاوة"
        icon={<Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-white" />}
        className="mb-8"
      />

      {/* زر إضافة نشاط */}
      {isTeacherOrAdmin && (
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button
            variant="primary"
            size="md"
            onClick={onAddClick}
            leftIcon={<Plus className="h-5 w-5" />}
          >
            إضافة نشاط جديد
          </Button>
        </div>
      )}
    </div>
  );
};
