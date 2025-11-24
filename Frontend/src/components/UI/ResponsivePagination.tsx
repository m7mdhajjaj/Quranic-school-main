import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface ResponsivePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemName?: string; // اسم العنصر (طالب، معلم، حلقة)
  showQuickJump?: boolean; // إظهار الانتقال السريع
  className?: string; // CSS classes إضافية
}

const ResponsivePagination: React.FC<ResponsivePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemName = 'عنصر',
  showQuickJump = true,
  className = '',
}) => {
  // حساب فهارس العناصر
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  // عدم عرض المكون إذا لم توجد أكثر من صفحة واحدة
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full min-h-[160px] ${className}`}
      dir="rtl"
    >
      {/* Mobile-First Layout */}
      <div className="flex flex-col space-y-4">
        {/* Results Info - Always visible */}
        <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-right">
          عرض <span className="font-semibold">{indexOfFirstItem + 1}</span> إلى{' '}
          <span className="font-semibold">{indexOfLastItem}</span> من{' '}
          <span className="font-semibold">{totalItems}</span> {itemName}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* First Page - Hidden on mobile when not needed */}
            {totalPages > 3 && currentPage > 2 && (
              <button
                onClick={() =>
                  currentPage !== 1 ? onPageChange(1) : undefined
                }
                className="hidden sm:flex px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:transform hover:scale-105 active:scale-95 transition-all"
                aria-label="الانتقال إلى الصفحة الأولى"
                title="انتقل إلى الصفحة الأولى"
              >
                الأولى
              </button>
            )}

            {/* Previous Button - Always visible */}
            <button
              onClick={() =>
                currentPage > 1 ? onPageChange(currentPage - 1) : undefined
              }
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 border rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentPage === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50 opacity-60'
                  : 'border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:transform hover:scale-105 active:scale-95'
              }`}
              aria-label="الصفحة السابقة"
              title={
                currentPage === 1
                  ? 'لا توجد صفحة سابقة'
                  : `انتقل إلى الصفحة ${currentPage - 1}`
              }
            >
              <FaChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden xs:inline">السابق</span>
            </button>

            {/* Page Numbers - Responsive display */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                const maxVisible = 5;

                if (totalPages <= maxVisible) {
                  pageNum = i + 1;
                } else if (currentPage <= Math.ceil(maxVisible / 2)) {
                  pageNum = i + 1;
                } else if (
                  currentPage >=
                  totalPages - Math.floor(maxVisible / 2)
                ) {
                  pageNum = totalPages - maxVisible + 1 + i;
                } else {
                  pageNum = currentPage - Math.floor(maxVisible / 2) + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() =>
                      currentPage !== pageNum
                        ? onPageChange(pageNum)
                        : undefined
                    }
                    disabled={currentPage === pageNum}
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105 cursor-default'
                        : 'border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:transform hover:scale-105 cursor-pointer active:scale-95'
                    }`}
                    aria-label={`الانتقال إلى الصفحة ${pageNum}`}
                    title={
                      currentPage === pageNum
                        ? `الصفحة الحالية: ${pageNum}`
                        : `انتقل إلى الصفحة ${pageNum}`
                    }
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button - Always visible */}
            <button
              onClick={() =>
                currentPage < totalPages
                  ? onPageChange(currentPage + 1)
                  : undefined
              }
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 border rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentPage === totalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50 opacity-60'
                  : 'border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:transform hover:scale-105 active:scale-95'
              }`}
              aria-label="الصفحة التالية"
              title={
                currentPage === totalPages
                  ? 'لا توجد صفحة تالية'
                  : `انتقل إلى الصفحة ${currentPage + 1}`
              }
            >
              <span className="hidden xs:inline">التالي</span>
              <FaChevronLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>

            {/* Last Page - Hidden on mobile when not needed */}
            {totalPages > 3 && currentPage < totalPages - 1 && (
              <button
                onClick={() => onPageChange(totalPages)}
                className="hidden sm:flex px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-all"
              >
                الأخيرة
              </button>
            )}
          </div>
        </div>

        {/* Mobile Jump to Page - Only on small screens when many pages */}
        {showQuickJump && totalPages > 5 && (
          <div className="flex sm:hidden items-center justify-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-600">انتقال سريع:</span>
            <select
              value={currentPage}
              onChange={(e) => onPageChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              aria-label="اختيار الصفحة"
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  صفحة {i + 1}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-500">من {totalPages}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsivePagination;
