import React from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Text,
} from "react-native";
import { Plus } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { useNewsData } from "./hooks/useNewsData";
import { NewsHeader } from "./components/NewsHeader";
import { NewsCard } from "./components/NewsCard";
import { NewsEmptyState } from "./components/NewsEmptyState";
import { NewsModal } from "./components/NewsModal";

export default function NewsPage() {
  const { user: currentUser } = useAuth();
  const {
    isLoading,
    error,
    newsItems,
    loadNews,
    isModalOpen,
    isEditMode,
    newNews,
    selectedImages,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleAddNews,
    handleEditNews,
    handleDeleteNews,
    handlePickImages,
    handleRemoveImage,
  } = useNewsData();
  const [refreshing, setRefreshing] = React.useState(false);

  // Check if user is teacher or admin
  const isTeacherOrAdmin =
    currentUser?.role === "teacher" || currentUser?.role === "admin";

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  }, [loadNews]);

  if (isLoading && newsItems.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#10b981"]}
          tintColor="#10b981"
        />
      }>
      <View style={styles.content}>
        <NewsHeader />

        {/* Add News Button for Teachers/Admins */}
        {isTeacherOrAdmin && newsItems.length > 0 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleOpenModal}
            activeOpacity={0.8}>
            <Plus size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>إضافة خبر</Text>
          </TouchableOpacity>
        )}

        {newsItems.length === 0 ? (
          <NewsEmptyState
            isTeacherOrAdmin={isTeacherOrAdmin}
            onAddNews={handleOpenModal}
          />
        ) : (
          <View style={styles.newsGrid}>
            {newsItems.map((item) => (
              <NewsCard
                key={item._id}
                news={item}
                isTeacherOrAdmin={isTeacherOrAdmin}
                currentUserId={currentUser?._id}
                currentUserRole={currentUser?.role}
                onEdit={handleEditNews}
                onDelete={handleDeleteNews}
              />
            ))}
          </View>
        )}
      </View>

      <NewsModal
        isOpen={isModalOpen}
        isEditMode={isEditMode}
        isLoading={isLoading}
        newNews={newNews}
        selectedImages={selectedImages}
        onClose={handleCloseModal}
        onSubmit={handleAddNews}
        onInputChange={handleInputChange}
        onPickImages={handlePickImages}
        onRemoveImage={handleRemoveImage}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  newsGrid: {
    gap: 8,
  },
});
