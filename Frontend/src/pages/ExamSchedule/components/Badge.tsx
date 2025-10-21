// ============================================================================
// Badge Component
// ============================================================================

import React from "react";
import { cn } from "../utils";

interface BadgeProps {
  intent?: "success" | "muted";
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ intent = "muted", children, className }) => (
  <span
    className={cn(
      "inline-flex items-center justify-center px-2 md:px-2.5 py-0.5 md:py-1 rounded-full text-xs font-semibold border shadow-sm transition-all",
      intent === "success"
        ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-300 hover:shadow-md"
        : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border-gray-300",
      className
    )}>
    {children}
  </span>
);
