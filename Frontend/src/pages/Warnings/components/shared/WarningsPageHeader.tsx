// ============================================================================
// WarningsPageHeader - رأس صفحة الإنذارات
// ============================================================================

import PageHeader from '@/components/UI/PageHeader';

export const WarningsPageHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <PageHeader
        title="📋 إدارة الإنذارات"
        subtitle="اختر الحلقة لعرض الطلاب وإدارة الإنذارات"
        showDivider={true}
      />
    </div>
  );
};
