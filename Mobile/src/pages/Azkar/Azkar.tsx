import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useAzkar, useAzkarCategory, useAzkarCategories } from "./hooks";
import {
  AzkarHeader,
  DhikrCard,
  AzkarCategoryCard,
  PageHeader,
  InfoMessage,
} from "./components";

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

  const Container = Platform.OS === "web" ? View : ScrollView;
  const containerProps =
    Platform.OS === "web"
      ? { style: styles.content }
      : {
          style: styles.scroll,
          contentContainerStyle: styles.content,
          showsVerticalScrollIndicator: false,
        };

  // Category Detail View
  if (selectedCategory && categoryWithStats) {
    return (
      <LinearGradient
        colors={["#f0fdf4", "#ecfeff", "#f8fafc"]}
        style={Platform.OS === "web" ? styles.webGradient : styles.gradient}>
        <Container {...(containerProps as any)}>
          <View style={styles.stack}>
            <AzkarHeader
              title={categoryWithStats.title}
              icon={categoryWithStats.icon}
              completedCount={categoryWithStats.completedCount}
              totalCount={categoryWithStats.totalCount}
              onBack={() => setSelectedCategory(null)}
              onReset={() => resetCategory(selectedCategory)}
            />

            {isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator />
              </View>
            ) : (
              <View style={styles.stack}>
                {categoryWithStats.adhkar.map((dhikr) => (
                  <DhikrCard
                    key={dhikr.id}
                    text={dhikr.text}
                    count={dhikr.count}
                    originalCount={dhikr.originalCount}
                    isCompleted={dhikr.count === 0}
                    onPress={() => handleDhikrClick(selectedCategory, dhikr.id)}
                  />
                ))}
              </View>
            )}
          </View>
        </Container>
      </LinearGradient>
    );
  }

  // Main Categories View
  return (
    <LinearGradient
      colors={["#f0fdf4", "#ecfeff", "#f8fafc"]}
      style={Platform.OS === "web" ? styles.webGradient : styles.gradient}>
      <Container {...(containerProps as any)}>
        <View style={styles.stack}>
          <PageHeader />
          <InfoMessage />

          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator />
            </View>
          ) : (
            <View style={styles.stack}>
              {categoriesWithStats.map((category) => (
                <AzkarCategoryCard
                  key={category.id}
                  icon={category.icon}
                  title={category.title}
                  completedCount={category.completedCount}
                  totalCount={category.totalCount}
                  isFullyCompleted={category.isFullyCompleted}
                  onPress={() => setSelectedCategory(category.id)}
                />
              ))}
            </View>
          )}
        </View>
      </Container>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  webGradient: {
    width: "100%",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  stack: {
    gap: 14,
  },
  loadingBox: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

export default Azkar;
