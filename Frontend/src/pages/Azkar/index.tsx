import { useAzkar } from "./hooks/useAzkar";
import AzkarHeader from "./components/AzkarHeader";
import DhikrCard from "./components/DhikrCard";
import AzkarCategoryCard from "./components/AzkarCategoryCard";
import PageHeader from "./components/PageHeader";
import InfoMessage from "./components/InfoMessage";

const Azkar = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    adhkarData,
    handleDhikrClick,
    resetCategory,
    getSelectedCategoryData,
  } = useAzkar();

  const selectedCategoryData = getSelectedCategoryData();

  // Category Detail View
  if (selectedCategory && selectedCategoryData) {
    const completedCount = selectedCategoryData.adhkar.filter(
      (d: { count: number }) => d.count === 0
    ).length;

    return (
      <div
        className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4 md:p-8"
        dir="rtl">
        <div className="max-w-4xl mx-auto">
          <AzkarHeader
            title={selectedCategoryData.title}
            icon={selectedCategoryData.icon}
            completedCount={completedCount}
            totalCount={selectedCategoryData.adhkar.length}
            onBack={() => setSelectedCategory(null)}
            onReset={() => resetCategory(selectedCategory)}
          />

          <div className="space-y-4">
            {selectedCategoryData.adhkar.map((dhikr: { id: number; text: string; count: number; originalCount: number }, index: number) => (
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
      className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4 md:p-8"
      dir="rtl">
      <div className="max-w-6xl mx-auto">
        <PageHeader />
        <InfoMessage />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adhkarData.map((category: { id: string; icon: string; title: string; adhkar: { count: number }[] }) => {
            const completedCount = category.adhkar.filter(
              (d: { count: number }) => d.count === 0
            ).length;
            const totalCount = category.adhkar.length;

            return (
              <AzkarCategoryCard
                key={category.id}
                icon={category.icon}
                title={category.title}
                completedCount={completedCount}
                totalCount={totalCount}
                isFullyCompleted={completedCount === totalCount}
                onClick={() => setSelectedCategory(category.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Azkar;
