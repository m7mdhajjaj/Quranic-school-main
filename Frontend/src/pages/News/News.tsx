import { useEffect, useMemo } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useAuth } from '@/hooks/useAuth';
import { useDisableBodyScroll } from '@/hooks/useDisableBodyScroll';
import { useNewsData } from './hooks/useNewsData';
import { useNewsFilter } from './hooks/useNewsFilter';
import {
  NewsHeader,
  NewsCard,
  NewsModal,
  NewsFilters,
  NewsEmptyState,
} from './components';
import NewsResourceHints from './components/NewsResourceHints';
import CardSkeleton from '@/components/skeletons/CardSkeleton';

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

  // تعطيل scroll الصفحة عند فتح الـ Modal
  useDisableBodyScroll(isModalOpen);

  // Initialize AOS - deferred to idle time for better performance
  useEffect(() => {
    // Defer AOS initialization to avoid blocking main thread
    const initAOS = () => {
      AOS.init({ 
        duration: 800, 
        once: true,
        // Performance optimizations
        disable: 'mobile', // Disable on mobile for better performance
        startEvent: 'DOMContentLoaded',
        useClassNames: false,
        disableMutationObserver: true, // Reduce overhead
        throttleDelay: 99, // Throttle scroll events
        debounceDelay: 50, // Debounce resize events
      });
    };

    // Use requestIdleCallback to defer initialization
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initAOS, { timeout: 2000 });
    } else {
      // Fallback: defer with setTimeout
      const timer = setTimeout(initAOS, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // ترتيب العرض حسب المطلوب:
  // 1. عند mount: يبدأ التحميل ويظهر Skeleton فقط
  // 2. بعد التحميل: تظهر البيانات أو رسالة فارغة
  if (isLoading && newsItems.length === 0) {
    return (
      <main className="container mx-auto px-4 py-6" dir="rtl">
        <NewsHeader />
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
      </main>
    );
  }

  // بعد التحميل: تظهر الصفحة كاملة
  return (
    <main className="container mx-auto px-4 py-6" dir="rtl">
      <NewsResourceHints newsItems={newsItems} />
      <NewsHeader />
      <div className="space-y-4">
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
    </main>
  );
};

export default News;
