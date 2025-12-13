import { useAzkar, useAzkarCategory, useAzkarCategories } from "./hooks";
import {
  AzkarHeader,
  DhikrCard,
  AzkarCategoryCard,
  PageHeader,
  InfoMessage,
} from "./components";
import { CardSkeleton } from "@/components/skeletons";

const Azkar = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    adhkarData,
    handleDhikrClick,
    resetCategory,
    getSelectedCategoryData,
    isLoading,
  } = useAzkar();

  const selectedCategoryData = getSelectedCategoryData();
  const { categoryWithStats } = useAzkarCategory(selectedCategoryData || null);
  const { categoriesWithStats } = useAzkarCategories(adhkarData);

  // Category Detail View
  if (selectedCategory && categoryWithStats) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100 p-4 md:p-8"
        dir="rtl">
        <div className="max-w-4xl mx-auto">
          <AzkarHeader
            title={categoryWithStats.title}
            icon={categoryWithStats.icon}
            completedCount={categoryWithStats.completedCount}
            totalCount={categoryWithStats.totalCount}
            onBack={() => setSelectedCategory(null)}
            onReset={() => resetCategory(selectedCategory)}
          />

          <div className="space-y-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <CardSkeleton key={index} hasImage={false} contentLines={3} />
                ))
              : categoryWithStats.adhkar.map((dhikr, index) => (
                  <DhikrCard
                    key={dhikr.id}
                    text={dhikr.text}
                    count={dhikr.count}
                    originalCount={dhikr.originalCount}
                    isCompleted={dhikr.count === 0}
                    onClick={() => handleDhikrClick(selectedCategory, dhikr.id)}
                    index={index}
                  />
                ))}
          </div>
        </div>
      </div>
    );
  }

  // Main Categories View
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-slate-100 p-4 md:p-8"
      dir="rtl">
      <div className="max-w-6xl mx-auto">
        <PageHeader />
        <InfoMessage />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} hasImage={false} contentLines={2} />
            ))
          ) : (
            categoriesWithStats.map((category) => (
              <AzkarCategoryCard
                key={category.id}
                icon={category.icon}
                title={category.title}
                completedCount={category.completedCount}
                totalCount={category.totalCount}
                isFullyCompleted={category.isFullyCompleted}
                onClick={() => setSelectedCategory(category.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Azkar;
