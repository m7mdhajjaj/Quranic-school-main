// ============================================================================
// WarningsPageHeader - رأس صفحة الإنذارات
// ============================================================================

import React from 'react';
import PageHeader from '@/components/UI/PageHeader';

export const WarningsPageHeader: React.FC = React.memo(() => {
  return (
    <div className="mb-8">
      <PageHeader
        title="إدارة الإنذارات"
        subtitle="اختر الحلقة لعرض الطلاب وإدارة الإنذارات"
        showDivider={true}
      />
    </div>
  );
});

WarningsPageHeader.displayName = 'WarningsPageHeader';
