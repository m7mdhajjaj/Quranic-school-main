// ============================================================================
// Warning Icon Helper - إرجاع أيقونة الإنذار المناسبة
// ============================================================================

import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  AlertOctagon,
  Ban,
} from 'lucide-react';

// ✅ Modern icon mapping for warnings
export const getWarningIcon = (type: string): React.ReactElement => {
  switch (type) {
    case 'warning':
      return <AlertTriangle className="w-6 h-6" />;
    case 'first':
      return <ShieldAlert className="w-6 h-6" />;
    case 'second':
      return <AlertOctagon className="w-6 h-6" />;
    case 'third':
      return <Ban className="w-6 h-6" />;
    default:
      return <AlertTriangle className="w-6 h-6" />;
  }
};
