import React, { type ReactNode } from "react";

// ====================================
// Types & Interfaces
// ====================================

export interface Column<T = unknown> {
  key: string;
  header: string | ReactNode;
  render?: (row: T, index: number) => ReactNode;
  width?: string; // e.g., "150px", "20%", "auto"
  align?: "left" | "center" | "right";
  sortable?: boolean;
  className?: string;
}

export interface TableProps<T = unknown> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  onRowClick?: (row: T, index: number) => void;
  rowClassName?: (row: T, index: number) => string;
  showHeader?: boolean;
  stickyHeader?: boolean;
  hoverable?: boolean;
  striped?: boolean;
  bordered?: boolean;
  dense?: boolean;
  maxHeight?: string;
  responsive?: boolean;
  className?: string;
  renderActions?: (row: T, index: number) => ReactNode;
  actionsWidth?: string;
  actionsHeader?: string;
}



// ====================================
// Empty State
// ====================================

const EmptyState: React.FC<{
  message?: string;
  description?: string;
  icon?: ReactNode;
  columns: number;
}> = ({
  message = "لا توجد بيانات للعرض",
  description,
  icon = "📭",
  columns,
}) => {
  return (
    <tr>
      <td colSpan={columns} className="px-4 py-8 md:px-6 md:py-12 text-center">
        <div className="flex flex-col items-center justify-center gap-2 md:gap-3">
          <div className="text-4xl md:text-6xl opacity-30">{icon}</div>
          <div className="text-gray-500 font-medium text-base md:text-lg">
            {message}
          </div>
          {description && (
            <div className="text-gray-400 text-xs md:text-sm">
              {description}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

// ====================================
// Main Table Component
// ====================================

export const Table = <T,>({
  columns,
  data,
  loading = false,
  emptyMessage,
  emptyDescription,
  emptyIcon,
  onRowClick,
  rowClassName,
  showHeader = true,
  stickyHeader = false,
  hoverable = true,
  striped = false,
  bordered = true,
  dense = false,
  maxHeight,
  className = "",
  renderActions,
  actionsWidth = "150px",
  actionsHeader = "الإجراءات",
}: TableProps<T>) => {
  // Calculate total columns including actions column
  const totalColumns = columns.length + (renderActions ? 1 : 0);

  // Base table classes
  const tableClasses = [
    "w-full",
    "text-right",
    "rtl",
    bordered && "border-collapse",
  ]
    .filter(Boolean)
    .join(" ");

  // Container classes
  const containerClasses = [
    "rounded-2xl",
    "border-2",
    "border-emerald-200",
    "bg-gradient-to-br from-white via-emerald-50/20 to-white",
    "shadow-[0_8px_30px_rgb(16,185,129,0.12)]",
    "backdrop-blur-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Get cell alignment class
  const getAlignClass = (align?: "left" | "center" | "right") => {
    if (align === "center") return "text-center";
    if (align === "left") return "text-left";
    return "text-right";
  };

  return (
    <div className={containerClasses}>
      <div
        className={maxHeight ? "overflow-y-auto" : ""}
        {...(maxHeight && {
          style: { ["--max-height" as string]: maxHeight },
        })}>
        <table className={tableClasses}>
          {/* Table Header */}
          {showHeader && (
            <thead
              className={[
                "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600",
                "text-white",
                "shadow-lg shadow-emerald-200/50",
                stickyHeader && "sticky top-0 z-10",
              ]
                .filter(Boolean)
                .join(" ")}>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.key || index}
                    className={[
                      dense
                        ? "px-3 py-2 md:px-4 md:py-3 lg:px-6 lg:py-4"
                        : "px-4 py-3 md:px-6 md:py-4",
                      "font-bold",
                      "text-sm md:text-base",
                      "whitespace-nowrap",
                      "align-middle",
                      getAlignClass(column.align),
                      column.className,
                      column.sortable && "cursor-pointer hover:bg-white/10",
                      column.width && `w-[${column.width}]`,
                    ]
                      .filter(Boolean)
                      .join(" ")}>
                    {column.sortable ? (
                      <div
                        className={[
                          "flex items-center gap-2",
                          column.align === "center"
                            ? "justify-center"
                            : column.align === "left"
                            ? "justify-start"
                            : "justify-end",
                        ]
                          .filter(Boolean)
                          .join(" ")}>
                        {column.header}
                        <span className="text-xs opacity-50">⇅</span>
                      </div>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}

                {/* Actions Column Header */}
                {renderActions && (
                  <th
                    className={[
                      dense
                        ? "px-3 py-2 md:px-4 md:py-3"
                        : "px-4 py-3 md:px-6 md:py-4",
                      "font-bold",
                      "text-sm md:text-base",
                      "text-center",
                      "whitespace-nowrap",
                      "align-middle",
                      `w-[${actionsWidth}]`,
                    ]
                      .filter(Boolean)
                      .join(" ")}>
                    {actionsHeader}
                  </th>
                )}
              </tr>
            </thead>
          )}

          {/* Table Body */}
          <tbody className="divide-y divide-emerald-100/50 bg-white/80">
            {loading ? (
              <tr>
                <td colSpan={totalColumns} className="px-4 py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-3 border-emerald-600 border-t-transparent"></div>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <EmptyState
                message={emptyMessage}
                description={emptyDescription}
                icon={emptyIcon}
                columns={totalColumns}
              />
            ) : (
              data.map((row, rowIndex) => {
                const customRowClass = rowClassName
                  ? rowClassName(row, rowIndex)
                  : "";
                const rowClasses = [
                  hoverable &&
                    "hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-300",
                  striped && rowIndex % 2 === 0 && "bg-emerald-50/30",
                  onRowClick && "cursor-pointer",
                  customRowClass,
                ]
                  .filter(Boolean)
                  .join(" ");

                const rowAny = row as Record<string, unknown>;
                const rowKey = (rowAny.id || rowAny._id || rowIndex) as
                  | string
                  | number;

                return (
                  <tr
                    key={rowKey}
                    className={rowClasses}
                    onClick={() => onRowClick?.(row, rowIndex)}>
                    {columns.map((column, colIndex) => (
                      <td
                        key={`${column.key}-${colIndex}`}
                        className={[
                          dense
                            ? "px-3 py-2 md:px-4 md:py-3 lg:px-6 lg:py-4"
                            : "px-4 py-3 md:px-6 md:py-4",
                          "text-xs md:text-sm",
                          "text-gray-900",
                          "align-top",
                          getAlignClass(column.align),
                          column.className,
                          column.width && `w-[${column.width}]`,
                        ]
                          .filter(Boolean)
                          .join(" ")}>
                        {column.render
                          ? column.render(row, rowIndex)
                          : String(rowAny[column.key] ?? "")}
                      </td>
                    ))}

                    {/* Actions Column */}
                    {renderActions && (
                      <td
                        className={[
                          dense
                            ? "px-2 py-2 md:px-4 md:py-3"
                            : "px-3 py-3 md:px-6 md:py-4",
                          "text-center",
                          "align-top",
                          `w-[${actionsWidth}]`,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={(e) => e.stopPropagation()} // Prevent row click
                      >
                        <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
                          {renderActions(row, rowIndex)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ====================================
// Export Default
// ====================================

export default Table;
