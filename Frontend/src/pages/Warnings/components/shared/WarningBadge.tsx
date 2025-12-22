// ============================================================================
// WarningBadge Component - شارة الإنذار
// ============================================================================

import React from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert, XCircle } from 'lucide-react';
import type { WarningBadgeProps } from "../../types/warnings";
import { getWarningLabel, getWarningBadgeVariant, getWarningIconType } from "../../types/Constans";
import { Badge } from "@/components/UI/Badge";

// ✅ Icon components map
const ICON_COMPONENTS = {
  AlertTriangle: <AlertTriangle className="w-3.5 h-3.5" />,
  AlertCircle: <AlertCircle className="w-3.5 h-3.5" />,
  ShieldAlert: <ShieldAlert className="w-3.5 h-3.5" />,
  XCircle: <XCircle className="w-3.5 h-3.5" />,
} as const;

export const WarningBadge: React.FC<WarningBadgeProps> = React.memo(({
  type,
  count = 1,
  onDelete,
  showDelete = false,
}) => {
  const iconType = getWarningIconType(type);
  const icon = ICON_COMPONENTS[iconType as keyof typeof ICON_COMPONENTS] || ICON_COMPONENTS.AlertTriangle;

  const badgeContent = (
    <div className="flex items-center gap-1.5">
      {icon}
      <span>{getWarningLabel(type)}</span>
      {count > 1 && type === "warning" && (
        <span className="mr-1 px-1.5 py-0.5 bg-white/30 rounded-full text-xs font-semibold">
          {count}
        </span>
      )}
    </div>
  );

  if (showDelete && onDelete) {
    return (
      <div className="inline-flex items-center gap-1">
        <Badge variant={getWarningBadgeVariant(type)} size="sm">
          {badgeContent}
        </Badge>
        <button
          onClick={onDelete}
          className="hover:bg-red-100 rounded-full p-1 transition-colors text-red-600"
          title="حذف الإنذار"
          aria-label="حذف الإنذار"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <Badge variant={getWarningBadgeVariant(type)} size="sm">
      {badgeContent}
    </Badge>
  );
});

WarningBadge.displayName = 'WarningBadge';
