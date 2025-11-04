import { useEffect, useState, useMemo, useCallback } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAuth } from "@/hooks/useAuth";
import { EmptyState } from "@/components/UI";
import { SearchInput, FilterSelect, FilterContainer } from "@/components/Filters";
import type { FilterOption } from "@/components/Filters";
import { useNewsData } from "./hooks/useNewsData";
import { 
  NewsHeader, 
  NewsCard, 
  NewsModal
} from "./components";

const News = () => {
  const { user: currentUser } = useAuth();
  
  // Check if user is teacher or admin
  const isTeacherOrAdmin =
    currentUser?.role === "teacher" || currentUser?.role === "admin";

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
    socketConnected,
    socketLastUpdate,
    socketId,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

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
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [newsItems, searchTerm, sortOrder]);

  const sortOptions = useMemo((): FilterOption[] => [
    { value: "newest", label: "الأحدث أولاً" },
    { value: "oldest", label: "الأقدم أولاً" },
  ], []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortOrder(value as "newest" | "oldest");
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSortOrder("newest");
  }, []);

  return (
    <main className="container mx-auto px-4 py-12" dir="rtl">
      {/* Header Section */}
      <NewsHeader 
        isTeacherOrAdmin={isTeacherOrAdmin}
        onAddNews={handleOpenModal}
        socketConnected={socketConnected}
        socketId={socketId}
        socketLastUpdate={socketLastUpdate}
      />

      {/* Filter Container */}
      {newsItems.length > 0 && (
        <FilterContainer
          title="البحث والفلترة"
          resultsCount={filteredNews.length}
          resultsLabel="خبر"
          onClear={handleClearFilters}
          showClearButton={searchTerm !== "" || sortOrder !== "newest"}
          variant="gradient"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="ابحث في الأخبار..."
              size="md"
            />

            <FilterSelect
              label="الترتيب"
              value={sortOrder}
              options={sortOptions}
              onChange={handleSortChange}
              showAllOption={false}
            />
          </div>
        </FilterContainer>
      )}

      {/* News Grid */}
      {isLoading && newsItems.length === 0 ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {error && newsItems.length === 0 ? (
            <div className="col-span-2">
              <EmptyState 
                illustration="error"
                title="حدث خطأ!"
                description={error}
                action={{
                  label: "إعادة المحاولة",
                  onClick: refreshNews,
                  icon: <span>🔄</span>
                }}
              />
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="col-span-2">
              <EmptyState 
                illustration={newsItems.length === 0 ? "no-data" : "search"}
                title={newsItems.length === 0 ? "لا توجد أخبار متاحة حالياً" : "لم يتم العثور على نتائج"}
                description={newsItems.length === 0 ? "لم يتم نشر أي أخبار بعد. تابعنا للحصول على آخر المستجدات!" : "جرب تغيير معايير البحث أو الفلترة"}
                action={isTeacherOrAdmin && newsItems.length === 0 ? {
                  label: "إضافة خبر جديد",
                  onClick: handleOpenModal,
                  icon: <span>➕</span>
                } : undefined}
              />
            </div>
          ) : (
            filteredNews.map((item, index) => (
              <NewsCard 
                key={item._id}
                news={item}
                index={index}
                isTeacherOrAdmin={isTeacherOrAdmin}
                onEdit={handleEditNews}
                onDelete={handleDeleteNews}
              />
            ))
          )}
        </div>
      )}

      {/* News Modal */}
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
