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
  headerClassName?: string;
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
      <td colSpan={columns} className="px-3 py-6 sm:px-4 sm:py-8 md:px-6 md:py-12 text-center">
        <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
          <div className="text-3xl sm:text-4xl md:text-6xl opacity-30">{icon}</div>
          <div className="text-gray-500 font-medium text-sm sm:text-base md:text-lg">
            {message}
          </div>
          {description && (
            <div className="text-gray-400 text-xs sm:text-sm">
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
  headerClassName = "",
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

  // Container classes - removed border since parent handles it
  const containerClasses = [
    "overflow-hidden",
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
                headerClassName || "bg-gray-50",
                headerClassName ? "" : "border-b border-gray-200",
                stickyHeader && "sticky top-0 z-10",
              ]
                .filter(Boolean)
                .join(" ")}>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.key || index}
                    style={column.width ? { width: column.width } : undefined}
                    className={[
                      dense
                        ? "px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3"
                        : "px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4",
                      "font-semibold",
                      "text-xs sm:text-sm",
                      headerClassName ? "text-white" : "text-gray-900",
                      "whitespace-nowrap",
                      "align-middle",
                      getAlignClass(column.align),
                      column.className,
                      column.sortable && "cursor-pointer",
                      column.sortable && (headerClassName ? "hover:bg-white/20" : "hover:bg-gray-100"),
                    ]
                      .filter(Boolean)
                      .join(" ")}>
                    {column.header}
                  </th>
                ))}

                {/* Actions Column Header */}
                {renderActions && (
                  <th
                    style={{ width: actionsWidth }}
                    className={[
                      dense
                        ? "px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3"
                        : "px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4",
                      "font-semibold",
                      "text-xs sm:text-sm",
                      headerClassName ? "text-white" : "text-gray-900",
                      "text-center",
                      "whitespace-nowrap",
                      "align-middle",
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
          <tbody className={`divide-y ${headerClassName ? "divide-emerald-100/50" : "divide-gray-100"} bg-white`}>
            {loading ? (
              <tr>
                <td colSpan={totalColumns} className="px-3 py-6 sm:px-4 sm:py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 border-emerald-600 border-t-transparent"></div>
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
                  hoverable && "hover:bg-gray-50 transition-colors duration-150",
                  striped && rowIndex % 2 === 0 && "bg-gray-50/50",
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
                        style={column.width ? { width: column.width } : undefined}
                        className={[
                          dense
                            ? "px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3"
                            : "px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4",
                          "text-xs sm:text-sm",
                          "text-gray-900",
                          "align-middle",
                          getAlignClass(column.align),
                          column.className,
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
                        style={{ width: actionsWidth }}
                        className={[
                          dense
                            ? "px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3"
                            : "px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4",
                          "text-center",
                          "align-middle",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={(e) => e.stopPropagation()} // Prevent row click
                      >
                        <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
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
