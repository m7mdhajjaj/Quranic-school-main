import { useState } from 'react';
import { showSuccessToast } from '@/utils/toastUtils';
import { showErrorMessage, showCenteredSwal } from '@/utils/sweetalertUtils';
import { repairSequence, createSection, type CreateSectionData } from '@/Api/DailyMark/sectionApi';
import Swal from 'sweetalert2';

interface GapInfo {
  surahNumber: number;
  surahName: string;
  gapsCount: number;
  gaps: Array<{
    ayahStart: number;
    ayahEnd: number;
    reason?: string;
  }>;
}

interface AnalysisResult {
  success: boolean;
  repaired: boolean;
  surahsAnalyzed?: number;
  totalGaps?: number;
  surahsWithGaps?: GapInfo[];
  suggestions?: Array<{
    surahNumber: number;
    surahName: string;
    ayahStart: number;
    ayahEnd: number;
    date?: string;
    dateKey?: string;
    suggestedDate?: string;
    size?: number;
    reason?: string;
  }>;
  message: string;
}

export const useAiRepair = (selectedGroup: string, onSuccess?: () => void) => {
  const [isRepairing, setIsRepairing] = useState(false);

  const handleAutoRepair = async () => {
    if (!selectedGroup) return;

    setIsRepairing(true);

    try {
      // Step 1: Analyze gaps
      const analysisResult = await repairSequence(selectedGroup, undefined, {}) as AnalysisResult;

      if (!analysisResult) {
        showErrorMessage("خطأ", "فشل في تحليل الجدول");
        return;
      }

      // If no gaps found
      if (!analysisResult.totalGaps || analysisResult.totalGaps === 0) {
        await showCenteredSwal({
          icon: 'success',
          title: '✅ السجلات سليمة',
          html: `
            <div class="text-center py-4" dir="rtl">
              <div class="w-20 h-20 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg class="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p class="text-gray-600 text-sm">
                تم فحص <strong class="text-emerald-600">${analysisResult.surahsAnalyzed || 0}</strong> سورة
              </p>
              <p class="text-gray-500 text-xs mt-2">لا توجد فجوات في تسلسل الحفظ</p>
            </div>
          `,
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#10b981',
          customClass: {
            popup: '!rounded-2xl',
          }
        });
        return;
      }

      // Step 2: Show gaps with details
      const gapsHtml = buildGapsHtml(analysisResult);

      const result = await showCenteredSwal({
        title: '🔍 تحليل الفجوات',
        html: gapsHtml,
        showCancelButton: true,
        confirmButtonText: '🔧 إصلاح الفجوات',
        cancelButtonText: 'إغلاق',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#9ca3af',
        width: 500,
        customClass: {
          popup: '!rounded-2xl !p-0 overflow-hidden',
          title: '!pt-5 !pb-2 !text-lg !font-bold',
          htmlContainer: '!px-0 !py-0 !m-0',
          actions: '!p-4 !bg-gray-50 !m-0 border-t border-gray-100',
          confirmButton: '!rounded-xl !px-6 !py-2.5 !text-sm !font-bold',
          cancelButton: '!rounded-xl !px-6 !py-2.5 !text-sm !font-bold'
        }
      });

      if (result.isConfirmed && analysisResult.surahsWithGaps) {
        // Step 3: Confirm repair action
        const confirmResult = await Swal.fire({
          title: 'تأكيد الإصلاح',
          text: `سيتم إنشاء حصص تعويضية لسد ${analysisResult.totalGaps} فجوة. هل تريد المتابعة؟`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'نعم، أصلح',
          cancelButtonText: 'إلغاء',
          confirmButtonColor: '#10b981',
        });

        if (confirmResult.isConfirmed && analysisResult.suggestions && analysisResult.suggestions.length > 0) {
          // إظهار رسالة تحميل
          Swal.fire({
            title: 'جاري الإصلاح...',
            html: `<div class="text-center py-4" dir="rtl">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              <p class="text-gray-600 text-sm">جاري إنشاء ${analysisResult.suggestions.length} مقطع...</p>
            </div>`,
            allowOutsideClick: false,
            showConfirmButton: false,
          });

          let successCount = 0;
          let failCount = 0;
          const errorMessages: string[] = [];

          // إنشاء المقاطع واحداً تلو الآخر
          for (let i = 0; i < analysisResult.suggestions.length; i++) {
            const suggestion = analysisResult.suggestions[i];
            try {
              // توليد تاريخ جديد: غداً + i أيام (لضمان ترتيب صحيح وتجنب التعارض)
              const dateToUse = new Date();
              dateToUse.setDate(dateToUse.getDate() + 1 + i); // غداً + i
              const year = dateToUse.getFullYear();
              const month = String(dateToUse.getMonth() + 1).padStart(2, '0');
              const day = String(dateToUse.getDate()).padStart(2, '0');
              const dateString = `${year}-${month}-${day}`;

              const sectionData: CreateSectionData = {
                date: dateString,
                group: selectedGroup,
                memorizationMeta: [{
                  surahNumber: suggestion.surahNumber,
                  surahName: suggestion.surahName,
                  ayahStart: suggestion.ayahStart,
                  ayahEnd: suggestion.ayahEnd,
                }],
                memorizationSection: `${suggestion.surahName} (${suggestion.ayahStart}-${suggestion.ayahEnd})`,
              };

              await createSection(sectionData);
              successCount++;
            } catch (err: any) {
              console.error('Failed to create section:', err);
              const errorMsg = err?.response?.data?.message || err?.message || 'خطأ غير معروف';
              errorMessages.push(`${suggestion.surahName} (${suggestion.ayahStart}-${suggestion.ayahEnd}): ${errorMsg}`);
              failCount++;
            }
          }

          Swal.close();

          if (successCount > 0) {
            showSuccessToast(`تم إنشاء ${successCount} مقطع بنجاح!`);
            if (onSuccess) onSuccess();
          }
          
          if (failCount > 0) {
            const errorDetails = errorMessages.slice(0, 3).join('\n');
            showErrorMessage('تحذير', `فشل إنشاء ${failCount} مقطع:\n${errorDetails}`);
          }
        }
      }

    } catch (error: any) {
      console.error('Failed to repair sequence:', error);
      showErrorMessage('خطأ في التحليل', error.response?.data?.message || 'حدث خطأ غير متوقع');
    } finally {
      setIsRepairing(false);
    }
  };

  return { isRepairing, handleAutoRepair };
};

/**
 * Build HTML for gaps display
 */
function buildGapsHtml(result: AnalysisResult): string {
  const { totalGaps, surahsWithGaps, surahsAnalyzed } = result;

  let surahsHtml = '';
  
  if (surahsWithGaps && surahsWithGaps.length > 0) {
    surahsHtml = surahsWithGaps.map(surah => {
      const gapsListHtml = surah.gaps.map(gap => `
        <div class="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded-lg">
          <span class="text-xs text-gray-600">الآيات ${gap.ayahStart} - ${gap.ayahEnd}</span>
          <span class="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">فجوة</span>
        </div>
      `).join('');

      return `
        <div class="border border-gray-200 rounded-xl overflow-hidden">
          <div class="bg-gradient-to-l from-amber-50 to-orange-50 px-4 py-3 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm font-bold">${surah.surahNumber}</span>
                <span class="font-bold text-gray-800">${surah.surahName}</span>
              </div>
              <span class="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">
                ${surah.gapsCount} فجوة
              </span>
            </div>
          </div>
          <div class="p-3 space-y-2 max-h-32 overflow-y-auto">
            ${gapsListHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  return `
    <div class="text-right" dir="rtl">
      <!-- Summary Header -->
      <div class="bg-gradient-to-l from-amber-500 to-orange-500 text-white px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-2xl font-black">${totalGaps}</p>
            <p class="text-xs opacity-90">فجوة مكتشفة</p>
          </div>
          <div class="text-left">
            <p class="text-lg font-bold">${surahsWithGaps?.length || 0}</p>
            <p class="text-xs opacity-90">سورة متأثرة</p>
          </div>
          <div class="text-left">
            <p class="text-lg font-bold">${surahsAnalyzed || 0}</p>
            <p class="text-xs opacity-90">سورة تم فحصها</p>
          </div>
        </div>
      </div>

      <!-- Gaps List -->
      <div class="p-4 space-y-3 max-h-64 overflow-y-auto">
        ${surahsHtml || '<p class="text-center text-gray-500 py-4">لا توجد تفاصيل</p>'}
      </div>

      <!-- Info Footer -->
      <div class="px-4 pb-4">
        <div class="bg-blue-50 border border-blue-100 rounded-xl p-3">
          <p class="text-xs text-blue-700 flex items-start gap-2">
            <span class="mt-0.5">💡</span>
            <span>الفجوة هي نطاق آيات مفقود بين حصتين متتاليتين. الإصلاح سينشئ حصص تعويضية لسد هذه الفجوات.</span>
          </p>
        </div>
      </div>
    </div>
  `;
}
