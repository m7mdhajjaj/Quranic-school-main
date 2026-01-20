import { lazy, Suspense, useMemo, startTransition } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNewsData } from './hooks/useNewsData';
import { useNewsFilter } from './hooks/useNewsFilter';
import {
  NewsHeader,
  NewsCard,
  NewsFilters,
  NewsEmptyState,
} from './components';
import CardSkeleton from '@/components/skeletons/CardSkeleton';

// Lazy load modal and resource hints for better performance
const NewsModal = lazy(() => import('./components/NewsModal'));
const NewsResourceHints = lazy(() => import('./components/NewsResourceHints'));

const News = () => {
  const { user: currentUser } = useAuth();

  // Check if user is teacher or admin - memoized to prevent re-renders
  const isTeacherOrAdmin = useMemo(
    () => currentUser?.role === 'teacher' || currentUser?.role === 'admin',
    [currentUser?.role]
  );

  // Use custom hook for all news data management
  const {
    isModalOpen,
    isEditMode,
    isLoading,
    error,
    newsItems,
    newNews,
    fieldErrors,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleFileChange,
    handleAddNews,
    handleEditNews,
    handleDeleteNews,
  } = useNewsData();

  // Use custom hook for filtering and sorting
  const {
    searchTerm,
    sortOrder,
    filterType,
    filteredNews,
    handleSearchChange,
    handleSortChange,
    handleFilterTypeChange,
    handleClearFilters,
  } = useNewsFilter(newsItems);

  // ترتيب العرض حسب المطلوب:
  // 1. عند mount: يبدأ التحميل ويظهر Skeleton فقط
  // 2. بعد التحميل: تظهر البيانات أو رسالة فارغة
  if (isLoading && newsItems.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20" dir="rtl">
        <NewsHeader />
        <div className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton
                key={i}
                hasImage={true}
                imageHeight="h-64 sm:h-72 md:h-80"
                contentLines={3}
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // بعد التحميل: تظهر الصفحة كاملة
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-slate-50 to-teal-50/20" dir="rtl">
      <Suspense fallback={null}>
        <NewsResourceHints newsItems={newsItems} />
      </Suspense>
      <NewsHeader />
      <div className="max-w-[98%] mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
        <NewsFilters
          searchTerm={searchTerm}
          sortOrder={sortOrder}
          filterType={filterType}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          onFilterTypeChange={handleFilterTypeChange}
          onClearFilters={handleClearFilters}
          filteredCount={filteredNews.length}
          totalCount={newsItems.length}
          onAddNews={handleOpenModal}
          isTeacherOrAdmin={isTeacherOrAdmin}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNews.length === 0 ? (
            <NewsEmptyState
              hasError={!!error && newsItems.length === 0}
              error={error}
              hasNews={newsItems.length > 0}
              isFiltered={newsItems.length > 0 && filteredNews.length === 0}
              isTeacherOrAdmin={isTeacherOrAdmin}
              onRetry={handleOpenModal}
              onAddNews={handleOpenModal}
            />
          ) : (
            filteredNews.map((item, index) => (
              <NewsCard
                key={`news-${item._id}`}
                news={item}
                index={index}
                isTeacherOrAdmin={isTeacherOrAdmin}
                currentUserId={currentUser?._id}
                currentUserRole={currentUser?.role}
                onEdit={handleEditNews}
                onDelete={handleDeleteNews}
              />
            ))
          )}
        </div>
      </div>
      <Suspense fallback={null}>
        <NewsModal
          isOpen={isModalOpen}
          isEditMode={isEditMode}
          isLoading={isLoading}
          newNews={newNews}
          fieldErrors={fieldErrors}
          onClose={handleCloseModal}
          onSubmit={handleAddNews}
          onInputChange={handleInputChange}
          onFileChange={handleFileChange}
        />
      </Suspense>
    </main>
  );
};

export default News;
