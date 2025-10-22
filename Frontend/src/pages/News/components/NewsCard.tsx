import { buildNewsImageUrl } from "../../../Api/newsApi";
import type { NewsCardProps } from "../utils/types";

const NewsCard = ({ news, index, isTeacherOrAdmin, onEdit, onDelete }: NewsCardProps) => {
  return (
    <div
      key={news._id}
  className="relative group bg-gradient-to-br from-emerald-50 via-white to-emerald-100 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 border border-emerald-100 animate-fadeIn"
      data-aos="fade-up"
      data-aos-delay={index * 100}
    >
      <div className="relative overflow-hidden h-60 sm:h-64 md:h-72 flex items-center justify-center bg-gradient-to-t from-emerald-100 to-white">
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover rounded-t-3xl transition-transform duration-500 shadow-sm group-hover:brightness-105 group-hover:scale-100"
          onError={(e) => {
            // ...existing code...
            const imgElement = e.target as HTMLImageElement;
            const originalSrc = news.image;
            if (originalSrc.includes("placehold.co")) return;
            if (originalSrc.includes("uploads/news/")) {
              if (originalSrc.includes("/api/uploads/")) {
                imgElement.src = originalSrc.replace("/api/uploads/", "/uploads/");
                return;
              }
              if (originalSrc.startsWith("uploads/")) {
                imgElement.src = buildNewsImageUrl(originalSrc);
                return;
              }
            }
            imgElement.src = "https://placehold.co/600x400/e9f5f2/1f6357?text=صورة+الخبر";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <span className="bg-white/80 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full shadow border border-emerald-100 flex items-center gap-1">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {news.date}
          </span>
        </div>
      </div>
      <div className="p-6 pb-4 flex flex-col gap-3">
  <h2 className="text-2xl font-extrabold text-emerald-800 transition-colors mb-1 line-clamp-2 group-hover:text-emerald-900">
          {news.title}
        </h2>
        <p className="text-gray-700 text-base leading-relaxed line-clamp-3 mb-2">{news.content}</p>
        <div className="flex flex-wrap justify-between items-center mt-2 gap-2">
          <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-1 shadow-md hover:shadow-lg group/btn font-semibold">
            <span>اقرأ المزيد</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
          {isTeacherOrAdmin && (
            <div className="flex gap-2">
              <button
                title="تعديل الخبر"
                className="px-3 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all duration-200 flex items-center gap-1 shadow-md hover:shadow-lg font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(news);
                }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span>تعديل</span>
              </button>
              <button
                title="حذف الخبر"
                className="px-3 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-200 flex items-center gap-1 shadow-md hover:shadow-lg font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(news._id);
                }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>حذف</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
