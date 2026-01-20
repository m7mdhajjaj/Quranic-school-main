// ============================================================================
// WarningsPageHeader - رأس صفحة الإنذارات
// ============================================================================

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const WarningsPageHeader: React.FC = React.memo(() => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-700 rounded-2xl shadow-xl p-6 border border-white/10">
      <div className="flex items-center gap-4">
        <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl">
          <ShieldAlert className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            ⚠️ إدارة الإنذارات
          </h1>
          <p className="text-white/70 text-sm mt-1">
            اختر الحلقة لعرض الطلاب وإدارة الإنذارات
          </p>
        </div>
      </div>
    </div>
  );
});

WarningsPageHeader.displayName = 'WarningsPageHeader';
