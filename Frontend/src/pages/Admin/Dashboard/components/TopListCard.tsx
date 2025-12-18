/**
 * TopListCard Component
 * Reusable component for displaying top students or teachers list
 * 
 * مستخدم في: pages/Admin/Dashboard/components/TopListsSection.tsx
 */

import React from "react";
import { Card } from "@/components/UI/Card";
import { FaMedal, FaStar } from "react-icons/fa";
import { Avatar } from "@/components/Avatar";

export interface TopListItem {
  name: string;
  value: number;
  avatar?: string;
  userId?: string;
  userRole?: string;
  user?: {
    _id?: string;
    firstName?: string;
    name?: string;
    gender?: string;
    role?: string;
    isActive?: boolean;
    avatar?: {
      url?: string;
      publicId?: string;
    };
  };
  rank?: number;
  [key: string]: any; // Allow additional properties
}

export interface TopListCardProps {
  title: string;
  icon?: React.ReactNode;
  items: TopListItem[];
  emptyMessage?: string;
  getMedalColor?: (index: number) => string;
  renderItem?: (item: TopListItem, index: number) => React.ReactNode;
}

const defaultGetMedalColor = (index: number): string => {
  const colors = [
    "text-yellow-500", // ذهبي
    "text-gray-400", // فضي
    "text-orange-600", // برونزي
    "text-emerald-500",
    "text-green-500",
  ];
  return colors[index] || "text-gray-500";
};

const defaultRenderItem = (item: TopListItem, index: number, getMedalColor: (index: number) => string) => (
  <div
    key={index}
    className="flex items-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100 group hover:border-green-300">
    {/* الترتيب */}
    <div
      className={`text-2xl sm:text-3xl font-bold ${getMedalColor(
        index
      )} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
      <FaMedal />
    </div>

    {/* الصورة الشخصية - استخدام Avatar component */}
    <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
      <Avatar
        src={item.avatar}
        userName={item.name}
        userId={item.userId}
        userRole={item.userRole}
        user={item.user}
        size="lg"
        showStatus={true}
        statusSize="sm"
        border="thick"
        autoFetch={true}
      />
    </div>

    {/* الاسم */}
    <div className="flex-1 min-w-0">
      <p className="font-bold text-sm sm:text-base text-gray-800 group-hover:text-green-600 transition-colors truncate" title={item.name || "غير محدد"}>
        {item.name || "غير محدد"}
      </p>
      <p className="text-xs sm:text-sm text-gray-500">المرتبة {index + 1}</p>
    </div>

    {/* القيمة */}
    <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
      <FaStar className="text-yellow-300 text-sm sm:text-base" />
      <span className="font-bold text-base sm:text-lg">{item.value || 0}</span>
    </div>
  </div>
);

export const TopListCard: React.FC<TopListCardProps> = React.memo(({
  title,
  icon,
  items,
  emptyMessage = "لا توجد بيانات لعرضها",
  getMedalColor = defaultGetMedalColor,
  renderItem,
}) => {
  return (
    <Card className="p-4 sm:p-5 lg:p-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
        {icon}
        {title}
      </h3>

      <div className="space-y-3 sm:space-y-4">
        {items.length > 0 ? (
          items.map((item, index) =>
            renderItem ? (
              renderItem(item, index)
            ) : (
              defaultRenderItem(item, index, getMedalColor)
            )
          )
        ) : (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <p className="text-base sm:text-lg">{emptyMessage}</p>
          </div>
        )}
      </div>
    </Card>
  );
});

export default TopListCard;
