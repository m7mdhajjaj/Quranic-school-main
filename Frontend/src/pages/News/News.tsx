import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAuth } from "../../hooks/useAuth";
import NewsSkeleton from "../../components/Skeleton/NewsSkeleton";
import { useNewsData } from "./hooks/useNewsData";
import { 
  NewsHeader, 
  NewsCard, 
  NewsModal, 
  EmptyState
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

  // Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
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

      {/* News Grid */}
      {isLoading && newsItems.length === 0 ? (
        <NewsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {error && newsItems.length === 0 ? (
            <EmptyState 
              error={error}
              isTeacherOrAdmin={isTeacherOrAdmin}
              onAddNews={handleOpenModal}
              onRetry={refreshNews}
            />
          ) : newsItems.length === 0 ? (
            <EmptyState 
              error={null}
              isTeacherOrAdmin={isTeacherOrAdmin}
              onAddNews={handleOpenModal}
              onRetry={refreshNews}
            />
          ) : (
            newsItems.map((item, index) => (
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
