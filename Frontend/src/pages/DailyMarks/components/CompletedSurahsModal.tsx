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
    <div className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-center gap-3">
         <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
            <Trophy size={24} />
         </div>
         <div>
            <h3 className="font-bold text-emerald-800">إنجازات الحفظ</h3>
            <p className="text-sm text-emerald-600">
               قائمة بالسور التي تم إتمام حفظها بالكامل لهذه الحلقة.
            </p>
         </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : completedList.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>لا توجد سور مكتملة بعد لهذه الحلقة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar px-1">
          {completedList.map((surah) => (
            <div 
              key={surah.surahNumber}
              onClick={() => handleSelectSurah(surah)}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                       {surah.surahNumber}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 text-lg">{surah.surahName}</h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                           {surah.totalAyahs} آية
                        </span>
                    </div>
                 </div>
                 <ArrowRight size={20} className="text-gray-300 group-hover:text-emerald-500 transform rotate-180 transition-colors" />
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 border-t pt-3">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span>تم الإتمام في: {new Date(surah.completedAt).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 2. Details View (History)
  const renderHistory = () => (
    <div className="space-y-4 animate-fade-in">
       <div className="flex items-center gap-2 mb-4">
          <button 
            onClick={handleBack} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="عودة إلى القائمة"
          >
              <ArrowRight size={20} className="text-gray-600" />
          </button>
          <div>
              <h3 className="font-bold text-xl text-gray-800">سورة {selectedSurah?.surahName}</h3>
              <p className="text-xs text-gray-500">سجل الحفظ التاريخي</p>
          </div>
       </div>

       {loadingHistory ? (
         <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
         </div>
       ) : (
         <div className="relative border-r-2 border-emerald-200 mr-4 space-y-6 pr-6 max-h-[55vh] overflow-y-auto">
            {history.map((item, index) => (
                <div key={index} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full border-2 border-emerald-500 bg-white shadow-sm z-10"></div>
                    
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-2 text-emerald-700 font-bold">
                                 <span className="text-lg">الآيات {item.ayahStart} - {item.ayahEnd}</span>
                             </div>
                             <span className="text-xs text-gray-400 font-mono">
                                {new Date(item.date).toLocaleDateString('ar-EG')}
                             </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className={`px-2 py-0.5 rounded-md ${
                                item.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                item.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                            }`}>
                                {item.status === 'completed' ? 'ممتاز' : 'جاري الحفظ'}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Start Marker */}
            <div className="relative">
                 <div className="absolute -right-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 shadow-sm z-10"></div>
                 <div className="text-sm text-gray-400 pr-2 pt-1 font-medium">بداية الحفظ</div>
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
