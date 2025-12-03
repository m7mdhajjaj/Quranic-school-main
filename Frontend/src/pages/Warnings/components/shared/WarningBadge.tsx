// ============================================================================
// WarningBadge Component - شارة الإنذار
// ============================================================================

import { AlertTriangle, AlertCircle, ShieldAlert, XCircle } from 'lucide-react';
import type { WarningBadgeProps } from "../../types/warnings";
import { getWarningLabel } from "../../types/Constans";
import { Badge } from "@/components/UI/Badge";

// Helper function to get warning icon component
const getWarningIconComponent = (type: string) => {
  switch (type) {
    case 'warning':
      return <AlertTriangle className="w-3.5 h-3.5" />;
    case 'first':
      return <AlertCircle className="w-3.5 h-3.5" />;
    case 'second':
      return <ShieldAlert className="w-3.5 h-3.5" />;
    case 'third':
      return <ShieldAlert className="w-3.5 h-3.5" />;
    case 'expulsion':
      return <XCircle className="w-3.5 h-3.5" />;
    default:
      return <AlertTriangle className="w-3.5 h-3.5" />;
  }
};

export const WarningBadge: React.FC<WarningBadgeProps> = ({
  type,
  count = 1,
  onDelete,
  showDelete = false,
}) => {
  const getVariant = () => {
    switch (type) {
      case "warning":
        return "warning" as const;
      case "expulsion":
        return "gray" as const;
      default:
        return "danger" as const;
    }
  };

  const badgeContent = (
    <div className="flex items-center gap-1.5">
      {getWarningIconComponent(type)}
      <span>{getWarningLabel(type)}</span>
      {count > 1 && type === "warning" && (
        <span className="ml-1 px-1.5 py-0.5 bg-white/30 rounded-full text-xs font-semibold">
          {count}
        </span>
      )}
    </div>
  );

  if (showDelete && onDelete) {
    return (
      <div className="inline-flex items-center gap-1">
        <Badge variant={getVariant()} size="sm">
          {badgeContent}
        </Badge>
        <button
          onClick={onDelete}
          className="hover:bg-red-100 rounded-full p-1 transition-colors text-red-600"
          title="حذف الإنذار"
          aria-label="حذف الإنذار">
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <Badge variant={getVariant()} size="sm">
      {badgeContent}
    </Badge>
  );
};
