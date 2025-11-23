import { useEffect, useState, useMemo, useCallback } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useAuth } from '@/hooks/useAuth';
import { useNewsData } from './hooks/useNewsData';
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
    selectedFile,
    fileInputRef,
    fieldErrors,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleFileChange,
    handleAddNews,
    handleEditNews,
    handleDeleteNews,
    refreshNews,
  } = useNewsData();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // Filter and sort news
  const filteredNews = useMemo(() => {
    let filtered = newsItems;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        const titleMatch = item.title?.toLowerCase().includes(searchLower);
        const contentMatch = item.content?.toLowerCase().includes(searchLower);
        return titleMatch || contentMatch;
      });
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [newsItems, searchTerm, sortOrder]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortOrder(value as 'newest' | 'oldest');
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSortOrder('newest');
  }, []);

  // ترتيب العرض حسب المطلوب:
  // 1. عند mount: يبدأ التحميل ويظهر Skeleton فقط
  // 2. بعد التحميل: تظهر البيانات أو رسالة فارغة
  if (isLoading && newsItems.length === 0) {
    return (
      <main className="container mx-auto px-4 py-12" dir="rtl">
        <NewsHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton
              key={i}
              hasImage={true}
              imageHeight="h-60 sm:h-64 md:h-72"
              contentLines={3}
            />
          ))}
        </div>
      </main>
    );
  }

  // بعد التحميل: تظهر الصفحة كاملة
  return (
    <main className="container mx-auto px-4 py-12" dir="rtl">
      <NewsHeader />
      <div className="space-y-4">
        <NewsFilters
          searchTerm={searchTerm}
          sortOrder={sortOrder}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          onClearFilters={handleClearFilters}
          filteredCount={filteredNews.length}
          totalCount={newsItems.length}
        />
        {isTeacherOrAdmin && (
          <div className="flex justify-end">
            <button
              onClick={handleOpenModal}
              className="px-6 py-3 w-[200px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span>
              إضافة خبر جديد
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredNews.length === 0 ? (
          <NewsEmptyState
            hasError={!!error && newsItems.length === 0}
            error={error}
            hasNews={newsItems.length > 0}
            isFiltered={newsItems.length > 0 && filteredNews.length === 0}
            isTeacherOrAdmin={isTeacherOrAdmin}
            onRetry={refreshNews}
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
        selectedFile={selectedFile}
        fileInputRef={fileInputRef}
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
