import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { Card } from "@/components/ui/Card";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Users,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react-native";
import { INews } from "@/Api/newsApi";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32; // 16px padding on each side

interface NewsCardProps {
  news: INews;
  isTeacherOrAdmin?: boolean;
  currentUserId?: string;
  currentUserRole?: string;
  onEdit?: (news: INews) => void;
  onDelete?: (_id: string) => Promise<void>;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  news,
  isTeacherOrAdmin,
  currentUserId,
  currentUserRole,
  onEdit,
  onDelete,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  // Extract images
  const images =
    news.images && news.images.length > 0
      ? news.images
          .map((img) => img.url)
          .filter((url) => url && url.trim() !== "")
      : news.image && news.image.trim() !== ""
        ? [news.image]
        : [];

  const hasMultipleImages = images.length > 1;
  const currentImage =
    images[currentImageIndex] ||
    "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+الخبر";

  // Format date
  const displayDate = news.createdAt || news.date;
  const formattedDate = displayDate
    ? new Date(displayDate).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // Extract author name
  const authorName =
    typeof news.author === "object" && news.author !== null
      ? news.author.name ||
        `${news.author.firstName || ""} ${news.author.lastName || ""}`.trim()
      : "";

  // Extract author ID
  const newsAuthorId =
    typeof news.author === "string" ? news.author : news.author?._id;

  // Check if user can edit/delete
  const canEditOrDelete =
    isTeacherOrAdmin &&
    (currentUserRole === "admin" || newsAuthorId === currentUserId);

  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) {
      onEdit(news);
    }
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (onDelete) {
      onDelete(news._id);
    }
  };

  // Calculate time ago
  const getTimeAgo = () => {
    if (!displayDate) return "";
    const now = new Date();
    const newsDate = new Date(displayDate);
    const diffMs = now.getTime() - newsDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 30) return `منذ ${diffDays} يوم`;
    return formattedDate;
  };

  return (
    <Card style={styles.card}>
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: currentImage }}
          style={styles.image}
          resizeMode="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />

        {/* Image Navigation */}
        {hasMultipleImages && (
          <>
            <TouchableOpacity
              style={[styles.navButton, styles.navButtonLeft]}
              onPress={() => {
                setCurrentImageIndex((prev) =>
                  prev === 0 ? images.length - 1 : prev - 1
                );
                setImageLoading(true);
              }}>
              <ChevronLeft size={24} color="#ffffff" strokeWidth={3} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, styles.navButtonRight]}
              onPress={() => {
                setCurrentImageIndex((prev) =>
                  prev === images.length - 1 ? 0 : prev + 1
                );
                setImageLoading(true);
              }}>
              <ChevronRight size={24} color="#ffffff" strokeWidth={3} />
            </TouchableOpacity>

            {/* Image Counter */}
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1} / {images.length}
              </Text>
            </View>

            {/* Image Indicators */}
            <View style={styles.indicators}>
              {images.map((_, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setCurrentImageIndex(idx);
                    setImageLoading(true);
                  }}
                  style={[
                    styles.indicator,
                    currentImageIndex === idx && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          </>
        )}

        {/* Visibility Badge */}
        <View style={styles.visibilityBadge}>
          {news.visibility === "group" ? (
            <Users size={14} color="#ffffff" />
          ) : (
            <Globe size={14} color="#ffffff" />
          )}
          <Text style={styles.visibilityText}>
            {news.visibility === "group" ? "خاص" : "عام"}
          </Text>
        </View>

        {/* Actions Menu for Teachers/Admins */}
        {canEditOrDelete && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowMenu(!showMenu)}
              activeOpacity={0.7}>
              <MoreVertical size={20} color="#ffffff" />
            </TouchableOpacity>

            {showMenu && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleEdit}
                  activeOpacity={0.7}>
                  <Edit size={18} color="#f59e0b" />
                  <Text style={[styles.menuItemText, { color: "#f59e0b" }]}>
                    تعديل
                  </Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleDelete}
                  activeOpacity={0.7}>
                  <Trash2 size={18} color="#ef4444" />
                  <Text style={[styles.menuItemText, { color: "#ef4444" }]}>
                    حذف
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Date and Author */}
        <View style={styles.metaContainer}>
          <Text style={styles.timeAgo}>{getTimeAgo()}</Text>
          {authorName && (
            <Text style={styles.author}>بواسطة: {authorName}</Text>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title}>{news.title}</Text>

        {/* Content */}
        <Text style={styles.description} numberOfLines={3}>
          {news.content}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 240,
    position: "relative",
    backgroundColor: "#f3f4f6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -20 }],
    backgroundColor: "#10b981",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  navButtonLeft: {
    left: 12,
  },
  navButtonRight: {
    right: 12,
  },
  imageCounter: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  imageCounterText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  indicators: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  indicatorActive: {
    backgroundColor: "#ffffff",
    width: 24,
  },
  visibilityBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  visibilityText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timeAgo: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },
  author: {
    fontSize: 12,
    color: "#6b7280",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "right",
  },
  description: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
    textAlign: "right",
  },
  actionsContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 40,
  },
  menuButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownMenu: {
    position: "absolute",
    top: 44,
    right: 0,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "600",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
});
