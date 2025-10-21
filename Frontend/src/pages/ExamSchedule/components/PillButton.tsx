// ============================================================================
// PillButton Component
// ============================================================================

import React from "react";
import { cn } from "../utils";

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "warn" | "danger" | "neutral";
}

export const PillButton: React.FC<PillButtonProps> = ({
  variant = "primary",
  className,
  children,
  ...rest
}) => {
  const base =
    "px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  const palette: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white focus:ring-emerald-300 disabled:hover:from-emerald-500 disabled:hover:to-teal-600",
    warn: "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white focus:ring-amber-300 disabled:hover:from-amber-400 disabled:hover:to-orange-500",
    danger: "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white focus:ring-rose-300 disabled:hover:from-rose-500 disabled:hover:to-pink-600",
    neutral:
      "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-emerald-700 focus:ring-gray-300 disabled:hover:from-gray-100 disabled:hover:to-gray-200",
  };
  return (
    <button className={cn(base, palette[variant], className)} {...rest}>
      {children}
    </button>
  );
};
