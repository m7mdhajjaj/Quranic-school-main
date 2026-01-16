import React, { useState } from 'react';
import { Modal, Button } from '@/components/UI';
import { CheckCircle, ArrowRight, Trophy, BookOpen, Repeat } from 'lucide-react';
import { useCompletedSurahs } from '../hooks/data';

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

  const [activeTab, setActiveTab] = useState<'memorization' | 'review'>('memorization');

  // Filter list based on the active tab
  const filteredList = completedList.filter(s => (s.type || 'memorization') === activeTab);

  // --- Render Functions ---

  // 1. List View (Displays completed Surahs for the selected tab)
  const renderList = () => (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`bg-gradient-to-r ${activeTab === 'memorization' ? 'from-emerald-50 to-teal-50 border-emerald-100' : 'from-blue-50 to-indigo-50 border-blue-100'} border rounded-xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-right transition-colors duration-300`}>
         <div className={`p-3 bg-white rounded-full ${activeTab === 'memorization' ? 'text-emerald-600 ring-emerald-50' : 'text-blue-600 ring-blue-50'} shadow-sm ring-4`}>
            <Trophy size={28} />
         </div>
         <div>
            <h3 className="font-bold text-gray-900 text-lg">
                {activeTab === 'memorization' ? 'إنجازات الحفظ' : 'إنجازات المراجعة'}
            </h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
               {activeTab === 'memorization' 
                 ? "قائمة بالسور التي تم إتمام حفظها بالكامل لهذه الحلقة."
                 : "قائمة بالسور التي تم إتمام مراجعتها بالكامل لهذه الحلقة."}
            </p>
         </div>
      </div>
      
      {/* Type Selection Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl">
         <button
            onClick={() => setActiveTab('memorization')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'memorization' 
                 ? 'bg-white text-emerald-600 shadow-sm' 
                 : 'text-gray-500 hover:text-gray-700'
            }`}
         >
             <BookOpen size={16} />
             الحفظ
         </button>
         <button
            onClick={() => setActiveTab('review')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'review' 
                 ? 'bg-white text-blue-600 shadow-sm' 
                 : 'text-gray-500 hover:text-gray-700'
            }`}
         >
             <Repeat size={16} />
             المراجعة
         </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className={`animate-spin rounded-full h-10 w-10 border-b-2 ${activeTab === 'memorization' ? 'border-emerald-500' : 'border-blue-500'}`}></div>
          <p className={`text-sm ${activeTab === 'memorization' ? 'text-emerald-600' : 'text-blue-600'} animate-pulse`}>جاري تحميل الإنجازات...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="bg-white p-4 rounded-full mb-3 shadow-sm">
             <Trophy size={32} className="opacity-20 text-gray-500" />
          </div>
          <p className="font-medium">لا توجد سور مكتملة بعد</p>
          <p className="text-xs mt-1">ستظهر هنا السور المكتملة في {activeTab === 'memorization' ? 'الحفظ' : 'المراجعة'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-1 pb-4">
          {filteredList.map((surah) => (
            <div 
              key={`${surah.surahNumber}-${surah.type}`}
              onClick={() => handleSelectSurah(surah)}
              className={`group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer relative overflow-hidden ${activeTab === 'memorization' ? 'hover:border-emerald-400' : 'hover:border-blue-400'}`}
            >
              {/* Background Decoration */}
              <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500 opacity-50 ${activeTab === 'memorization' ? 'bg-emerald-50' : 'bg-blue-50'}`}></div>

              <div className="flex justify-between items-start relative z-10">
                 <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br border flex items-center justify-center font-bold text-xl group-hover:text-white group-hover:shadow-md transition-all duration-300
                        ${activeTab === 'memorization'
                            ? 'from-emerald-100 to-teal-50 border-emerald-100 text-emerald-700 group-hover:from-emerald-500 group-hover:to-teal-600'
                            : 'from-blue-100 to-indigo-50 border-blue-100 text-blue-700 group-hover:from-blue-500 group-hover:to-indigo-600'}
                    `}>
                       {surah.surahNumber}
                    </div>
                    <div>
                        <h4 className={`font-bold text-gray-800 text-lg leading-tight transition-colors ${activeTab === 'memorization' ? 'group-hover:text-emerald-700' : 'group-hover:text-blue-700'}`}>
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
                    <CheckCircle size={14} className={activeTab === 'memorization' ? 'text-emerald-500' : 'text-blue-500'} />
                    <span>تم في {new Date(surah.completedAt).toLocaleDateString('ar-EG', { timeZone: 'Asia/Jerusalem' })}</span>
                  </div>
                  <ArrowRight size={16} className={`text-gray-300 transform rotate-180 transition-all duration-300 group-hover:translate-x-[-4px] ${activeTab === 'memorization' ? 'group-hover:text-emerald-500' : 'group-hover:text-blue-500'}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 2. Details View (History for selected Surah)
  const renderHistory = () => {
    // Determine type from selectedSurah or fallback to activeTab
    const isMem = (selectedSurah?.type || activeTab) === 'memorization';
    
    // Dynamic styling based on type
    const colorClasses = {
        bg: isMem ? 'bg-emerald-500' : 'bg-blue-500',
        bgLight: isMem ? 'bg-emerald-100' : 'bg-blue-100',
        text: isMem ? 'text-emerald-700' : 'text-blue-700',
        ring: isMem ? 'ring-emerald-50' : 'ring-blue-50',
        border: isMem ? 'border-emerald-200' : 'border-blue-200',
        borderHover: isMem ? 'hover:border-emerald-200' : 'hover:border-blue-200',
        hoverText: isMem ? 'hover:text-emerald-600' : 'hover:text-blue-600'
    };
    
    return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
       <div className="flex items-center gap-3 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <button 
            type="button"
            aria-label="العودة للقائمة"
            title="العودة للقائمة"
            onClick={handleBack} 
            className={`p-2 bg-white hover:bg-gray-100 text-gray-600 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 group ${colorClasses.hoverText}`}
          >
              <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                سورة {selectedSurah?.surahName}
                <span className={`text-xs font-normal text-white px-2 py-0.5 rounded-md ${colorClasses.bg}`}>
                    {isMem ? 'حفظ كامل' : 'مراجعة كاملة'}
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                 سجل {isMem ? 'الحفظ' : 'المراجعة'} التاريخي للمقاطع
              </p>
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
            {/* Timeline Line (Desktop) */}
            <div className={`absolute right-[8.5rem] sm:right-[140px] top-4 bottom-4 w-0.5 bg-gradient-to-b ${isMem ? 'from-emerald-200' : 'from-blue-200'} via-gray-200 to-transparent z-0 hidden sm:block`}></div>

            <div className="space-y-6">
                {history.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-8 relative z-10 group">
                        {/* Date Column (Desktop) */}
                        <div className="w-full sm:w-[120px] text-right sm:text-left flex items-center sm:justify-end gap-2 pb-1 sm:pb-0">
                           <span className="text-xs sm:text-sm font-semibold text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
                              {new Date(item.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jerusalem' })}
                           </span>
                        </div>

                        {/* Content Card */}
                        <div className="flex-1 relative pr-4 sm:pr-0">
                            {/* Timeline Dot (Desktop) */}
                            <div className={`hidden sm:block absolute right-[-2.35rem] top-3 w-4 h-4 rounded-full border-2 border-white ${colorClasses.bg} shadow-md ring-4 ${colorClasses.ring} z-20 transition-transform group-hover:scale-110`}></div>
                            
                             {/* Timeline Line (Mobile) */}
                             <div className="sm:hidden absolute right-0 top-0 bottom-[-24px] w-0.5 bg-gray-200"></div>
                             {/* Timeline Dot (Mobile) */}
                             <div className={`sm:hidden absolute right-[-5px] top-3 w-3 h-3 rounded-full ${colorClasses.bg} ring-2 ring-white z-20`}></div>

                            <div className={`bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${colorClasses.borderHover}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`${colorClasses.text} text-xs font-bold px-2 py-1 rounded-md ${colorClasses.bgLight}`}>
                                            {isMem ? 'حفظ' : 'مراجعة'}
                                        </span>
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
                        <div className={`w-2 h-2 rounded-full ${isMem ? 'bg-emerald-400' : 'bg-blue-400'}`}></div>
                        بداية رحلة {isMem ? 'حفظ' : 'مراجعة'} السورة
                     </div>
                </div>
            </div>
         </div>
       )}
    </div>
    );
  };

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
