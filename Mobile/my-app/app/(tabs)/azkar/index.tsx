import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAzkar } from "./hooks/useAzkar";
import { AzkarCategoryCard } from "./components/AzkarCategoryCard";
import { DhikrCard } from "./components/DhikrCard";
import { AzkarHeader } from "./components/AzkarHeader";
import { InfoMessage } from "./components/InfoMessage";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { BookMarked } from "lucide-react-native";

export default function AzkarPage() {
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

  // Calculate category stats
  const categoriesWithStats = useMemo(() => {
    return adhkarData.map((category) => {
      const completedCount = category.adhkar.filter(
        (d) => d.count === 0
      ).length;
      const totalCount = category.adhkar.length;
      const isFullyCompleted = completedCount === totalCount;

      return {
        ...category,
        completedCount,
        totalCount,
        isFullyCompleted,
      };
    });
  }, [adhkarData]);

  // Calculate selected category stats
  const categoryWithStats = useMemo(() => {
    if (!selectedCategoryData) return null;

    const completedCount = selectedCategoryData.adhkar.filter(
      (d) => d.count === 0
    ).length;
    const totalCount = selectedCategoryData.adhkar.length;

    return {
      ...selectedCategoryData,
      completedCount,
      totalCount,
    };
  }, [selectedCategoryData]);

  // Category Detail View
  if (selectedCategory && categoryWithStats) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <AzkarHeader
            title={categoryWithStats.title}
            icon={categoryWithStats.icon}
            completedCount={categoryWithStats.completedCount}
            totalCount={categoryWithStats.totalCount}
            onBack={() => setSelectedCategory(null)}
            onReset={() => resetCategory(selectedCategory)}
          />

          <View style={styles.dhikrList}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10b981" />
              </View>
            ) : (
              categoryWithStats.adhkar.map((dhikr) => (
                <DhikrCard
                  key={dhikr.id}
                  text={dhikr.text}
                  count={dhikr.count}
                  originalCount={dhikr.originalCount}
                  isCompleted={dhikr.count === 0}
                  onClick={() => handleDhikrClick(selectedCategory, dhikr.id)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  // Main Categories View
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <PageHeader
          title="الأذكار"
          subtitle="اختر نوع الأذكار التي تريد قراءتها"
          icon={BookMarked}
        />
        <InfoMessage />

        <View style={styles.categoriesGrid}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10b981" />
            </View>
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
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
  },
  categoriesGrid: {
    gap: 8,
  },
  dhikrList: {
    gap: 8,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
