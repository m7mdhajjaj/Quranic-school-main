import React from 'react';
import { Card, Badge, DropdownMenu, Button } from "@/components/UI";
import AddedAgo from "@/components/UI/AddedAgo";
import type { Activity } from '../types/activities';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  index?: number;
  onEdit?: (activity: Activity) => void;
  onDelete?: (id: string) => void;
  isTeacherOrAdmin: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  index = 0,
  onEdit,
  onDelete,
  isTeacherOrAdmin,
}) => {
  const menuItems = [];

  if (onEdit) {
    menuItems.push({
      label: 'تعديل النشاط',
      icon: <Edit size={18} />,
      onClick: () => onEdit(activity),
      variant: 'warning' as const,
    });
  }

  if (onDelete) {
    menuItems.push({
      label: 'حذف النشاط',
      icon: <Trash2 size={18} />,
      onClick: () => onDelete(activity._id!),
      variant: 'danger' as const,
    });
  }

  return (
    <div data-aos="fade-up" data-aos-delay={index * 100}>
      <Card
        variant="gradient"
        padding="none"
        hover={true}
        className="relative group overflow-hidden animate-fadeIn bg-gradient-to-br from-purple-50 via-white to-purple-100 border border-purple-100"
      >
        <div className="relative overflow-hidden h-60 sm:h-64 md:h-72 flex items-center justify-center bg-gradient-to-t from-purple-100 to-white">
          <img
            src={activity.image}
            alt={activity.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover rounded-t-3xl transition-transform duration-500 shadow-sm group-hover:brightness-105 group-hover:scale-100"
            onError={(e) => {
              const imgElement = e.target as HTMLImageElement;
              const originalSrc = activity.image;
              if (originalSrc?.includes('placehold.co')) return;

              // Try to fix common URL issues
              if (originalSrc?.includes('uploads/activities/')) {
                if (originalSrc.includes('/api/uploads/')) {
                  imgElement.src = originalSrc.replace(
                    '/api/uploads/',
                    '/uploads/'
                  );
                  return;
                }
                if (originalSrc.startsWith('uploads/')) {
                  imgElement.src = originalSrc;
                  return;
                }
              }

              // Fallback to placeholder
              imgElement.src =
                'https://placehold.co/600x400/f3e8ff/6b21a8?text=صورة+النشاط';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>

          {/* Badge التصنيف */}
          {activity.category && (
            <div className="absolute top-4 right-4 z-20">
              <Badge
                variant="info"
                size="md"
                rounded="full"
                className="bg-white/90 text-purple-700 border-purple-100 shadow backdrop-blur-sm"
              >
                {activity.category}
              </Badge>
            </div>
          )}

          {/* زر المزيد */}
          {isTeacherOrAdmin && menuItems.length > 0 && (
            <div className="absolute top-4 left-4 z-20">
              <DropdownMenu
                items={menuItems}
                position="left"
                buttonClassName="text-purple-700"
              />
            </div>
          )}
        </div>

        <div className="px-6 pt-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-purple-700">أنشطة</h3>
          <AddedAgo date={activity.createdAt || activity.date} />
        </div>

        <div className="p-6 pt-2 pb-4 flex flex-col gap-3">
          <h2 className="text-2xl font-extrabold text-purple-800 transition-colors mb-2 line-clamp-2 group-hover:text-purple-900 leading-tight">
            {activity.title}
          </h2>

          <p className="text-gray-600 text-base leading-relaxed line-clamp-4 mb-3">
            {activity.description}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-2">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium">
                {new Date(activity.date).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* زر المزيد */}
            {isTeacherOrAdmin && menuItems.length > 0 && (
              <Button
                variant="success"
                size="sm"
                onClick={() => {}}
                className="flex-row-reverse"
              >
                <MoreHorizontal size={16} className="mr-1" />
                المزيد
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
