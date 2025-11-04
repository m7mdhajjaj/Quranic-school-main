import type { NewsCardProps } from '../utils/types';
import AddedAgo from "@/components/UI/AddedAgo";
import { Button, Card } from "@/components/UI";
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

const NewsCard = ({
  news,
  index,
  isTeacherOrAdmin,
  onEdit,
  onDelete,
}: NewsCardProps) => {
  const displayDate = news.createdAt || news.date;

  return (
    <div 
      data-aos="fade-up"
      data-aos-delay={index * 100}
    >
      <Card
        variant="gradient"
        padding="none"
        hover={true}
        className="relative group overflow-hidden animate-fadeIn bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border border-emerald-100"
      >
      <div className="relative overflow-hidden h-60 sm:h-64 md:h-72 flex items-center justify-center bg-gradient-to-t from-emerald-100 to-white">
        <img
          src={news.image}
          alt={news.title}
          loading={index < 2 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={index === 0 ? "high" : "auto"}
          className="w-full h-full object-cover rounded-t-3xl transition-transform duration-500 shadow-sm group-hover:brightness-105 group-hover:scale-100"
          onError={(e) => {
            const imgElement = e.target as HTMLImageElement;
            const originalSrc = news.image;
            if (originalSrc.includes('placehold.co')) return;
            if (originalSrc.includes('uploads/news/')) {
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
            imgElement.src =
              'https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+الخبر';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
        {/* Author top right, Date top left */}
        {news.authorName && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1">
            <span className="bg-white/90 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full shadow border border-teal-100 flex items-center gap-1 backdrop-blur-sm">
              <svg
                className="w-4 h-4 text-teal-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 4v1a1 1 0 001 1h12a1 1 0 001-1v-1c0-2-3-4-7-4z" />
              </svg>
              الناشر: {news.authorName}
            </span>
          </div>
        )}
      </div>
      <div className="px-6 pt-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-emerald-700">أخبار</h3>
        <AddedAgo date={displayDate} />
      </div>
      <div className="p-6 pt-2 pb-4 flex flex-col gap-3">
        <h2 className="text-2xl font-extrabold text-emerald-800 transition-colors mb-2 line-clamp-2 group-hover:text-emerald-900 leading-tight">
          {news.title}
        </h2>
        <p className="text-gray-600 text-base leading-relaxed line-clamp-4 mb-3">
          {news.content}
        </p>
        <div className="flex flex-wrap justify-between items-center mt-2 gap-2">
          <Button
            variant="primary"
            size="md"
            className="rounded-xl shadow-md hover:shadow-lg group/btn"
          >
            <span>اقرأ المزيد</span>
            <ArrowLeft size={20} className="group-hover/btn:translate-x-1 transition-transform" />
          </Button>
          {isTeacherOrAdmin && (
            <div className="flex gap-2">
              <Button
                variant="warning"
                size="md"
                className="rounded-lg shadow-md hover:shadow-lg"
                title="تعديل الخبر"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(news);
                }}
              >
                <Edit size={20} />
                <span>تعديل</span>
              </Button>
              <Button
                variant="danger"
                size="md"
                className="rounded-lg shadow-md hover:shadow-lg"
                title="حذف الخبر"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(news._id);
                }}
              >
                <Trash2 size={20} />
                <span>حذف</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
    </div>
  );
};

export default NewsCard;
