import React from 'react';
import { Modal, Button } from '@/components/UI';
import { CheckCircle, ArrowRight, Trophy } from 'lucide-react';
import { useCompletedSurahs } from '../hooks/useCompletedSurahs';

interface CompletedSurahsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroup: string;
}

export const CompletedSurahsModal: React.FC<CompletedSurahsModalProps> = ({
  isOpen,
  onClose,
  selectedGroup
}) => {
  const {
      loading,
      completedList,
      selectedSurah,
      history,
      loadingHistory,
      handleSelectSurah,
      handleBack
  } = useCompletedSurahs(selectedGroup, isOpen);

  // --- Render Views ---

  // 1. List View
  const renderList = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-right">
         <div className="p-3 bg-white rounded-full text-emerald-600 shadow-sm ring-4 ring-emerald-50">
            <Trophy size={28} />
         </div>
         <div>
            <h3 className="font-bold text-gray-900 text-lg">إنجازات الحفظ</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
               قائمة بالسور التي تم إتمام حفظها بالكامل لهذه الحلقة. هذه الإنجازات تعكس تقدم الطلاب وتفانيهم.
            </p>
         </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          <p className="text-sm text-emerald-600 animate-pulse">جاري تحميل الإنجازات...</p>
        </div>
      ) : completedList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="bg-white p-4 rounded-full mb-3 shadow-sm">
             <Trophy size={32} className="opacity-20 text-gray-500" />
          </div>
          <p className="font-medium">لا توجد سور مكتملة بعد</p>
          <p className="text-xs mt-1">ستظهر هنا السور التي يتم حفظ جميع آياتها</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-1 pb-4">
          {completedList.map((surah) => (
            <div 
              key={surah.surahNumber}
              onClick={() => handleSelectSurah(surah)}
              className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500 opacity-50"></div>

              <div className="flex justify-between items-start relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white group-hover:shadow-md transition-all duration-300">
                       {surah.surahNumber}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-emerald-700 transition-colors">
                          سورة {surah.surahName}
                        </h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full mt-1.5 inline-block group-hover:bg-white/80 transition-colors">
                           {surah.totalAyahs} آية
                        </span>
                    </div>
                 </div>
              </div>
              
              <div className="mt-5 flex items-center justify-between text-xs border-t border-gray-100 pt-3 relative z-10">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span>تم في {new Date(surah.completedAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-emerald-500 transform rotate-180 transition-all duration-300 group-hover:translate-x-[-4px]" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 2. Details View (History)
  const renderHistory = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
       <div className="flex items-center gap-3 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <button 
            onClick={handleBack} 
            className="p-2 bg-white hover:bg-gray-100 text-gray-600 hover:text-emerald-600 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 group"
          >
              <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                سورة {selectedSurah?.surahName}
                <span className="text-xs font-normal text-white bg-emerald-500 px-2 py-0.5 rounded-md">مكتملة</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">سجل الحفظ التاريخي للمقاطع</p>
          </div>
       </div>

       {loadingHistory ? (
         <div className="space-y-6 px-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 animate-pulse">
                 <div className="w-16 h-4 bg-gray-200 rounded mt-2"></div>
                 <div className="flex-1 space-y-2 border-r-2 border-gray-100 pr-4">
                    <div className="h-12 bg-gray-100 rounded-lg w-full"></div>
                 </div>
              </div>
            ))}
         </div>
       ) : (
         <div className="relative pr-2 max-h-[55vh] overflow-y-auto custom-scrollbar pl-2">
            {/* Timeline Line */}
            <div className="absolute right-[8.5rem] sm:right-[140px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-200 via-gray-200 to-transparent z-0 hidden sm:block"></div>

            <div className="space-y-6">
                {history.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-8 relative z-10 group">
                        {/* Date Column (Desktop) */}
                        <div className="w-full sm:w-[120px] text-right sm:text-left flex items-center sm:justify-end gap-2 pb-1 sm:pb-0">
                           <span className="text-xs sm:text-sm font-semibold text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
                              {new Date(item.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}
                           </span>
                        </div>

                        {/* Content Card */}
                        <div className="flex-1 relative pr-4 sm:pr-0">
                            {/* Timeline Dot (Desktop) */}
                            <div className="hidden sm:block absolute right-[-2.35rem] top-3 w-4 h-4 rounded-full border-2 border-white bg-emerald-500 shadow-md ring-4 ring-emerald-50 z-20 transition-transform group-hover:scale-110"></div>
                            
                             {/* Timeline Line (Mobile) */}
                             <div className="sm:hidden absolute right-0 top-0 bottom-[-24px] w-0.5 bg-gray-200"></div>
                             {/* Timeline Dot (Mobile) */}
                             <div className="sm:hidden absolute right-[-5px] top-3 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white z-20"></div>

                            <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md">حفظ</span>
                                        <span className="font-bold text-gray-800 text-sm sm:text-base">
                                            من الآية {item.ayahStart} إلى {item.ayahEnd}
                                        </span>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                        item.status === 'completed' 
                                          ? 'bg-green-50 text-green-700 border-green-100' 
                                          : 'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                        {item.status === 'completed' ? 'ممتاز' : 'جاري الحفظ'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400">
                                   عدد الآيات: {(item.ayahEnd - item.ayahStart + 1)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Start Marker */}
                <div className="flex items-center gap-8 justify-end sm:justify-start mt-8 opacity-60">
                     <div className="w-[120px] hidden sm:block"></div>
                     <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full mx-auto sm:mx-0">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        بداية رحلة حفظ السورة
                     </div>
                </div>
            </div>
         </div>
       )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="الإنجازات المكتملة"
      size="lg"
    >
      <div className="p-1">
         {selectedSurah ? renderHistory() : renderList()}
      </div>
      
      <div className="mt-6 flex justify-end gap-3 border-t pt-4">
         <Button onClick={onClose} variant="secondary">
            إغلاق
         </Button>
      </div>
    </Modal>
  );
};

export default CompletedSurahsModal;
