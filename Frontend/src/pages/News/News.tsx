import { useEffect } from 'react';
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
import CardSkeleton from '@/components/skeletons/CardSkeleton';

const News = () => {
  const { user: currentUser } = useAuth();

  // Check if user is teacher or admin
  const isTeacherOrAdmin =
    currentUser?.role === 'teacher' || currentUser?.role === 'admin';

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

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
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
            onRetry={handleOpenModal} // Added missing required prop
            onAddNews={handleOpenModal}
          />
        ) : (
          filteredNews.map((item, index) => (
            <NewsCard
              key={item._id}
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
