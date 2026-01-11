import { useState } from 'react';
import { showSuccessToast } from '@/utils/toastUtils';
import { showErrorMessage, showCenteredSwal } from '@/utils/sweetalertUtils';
import { repairSequence } from '@/Api/DailyMark/sectionApi';

export const useAiRepair = (selectedGroup: string, onSuccess?: () => void) => {
  const [isRepairing, setIsRepairing] = useState(false);

  const handleAutoRepair = async () => {
    if (!selectedGroup) return;

    const result = await showCenteredSwal({
      title: "🤖 المصحح الآلي",
      html: `
        <div class="text-right space-y-6" dir="rtl">
          <!-- Header Section -->
          <div class="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100/60 relative overflow-hidden group">
            <div class="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
            <div class="absolute bottom-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-xl translate-x-1/3 translate-y-1/3"></div>
            
            <div class="relative z-10">
              <p class="text-sm text-gray-700 leading-relaxed font-medium">
                تحليل ذكي للجدول الزمني لترميم الفجوات وضبط التواريخ تلقائياً.
              </p>
            </div>
          </div>
          
          <div class="space-y-5">
            <!-- Max Verses Slider -->
            <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
               <div class="flex justify-between items-center mb-4">
                  <label class="text-xs font-bold text-gray-800 flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    تقسيم الحصص اليومي
                    <span class="text-[10px] text-gray-400 font-normal mr-1">(أقصى عدد آيات)</span>
                  </label>
                  <span id="range-value-display" class="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">تلقائي</span>
               </div>
               
               <div class="relative py-2">
                 <input id="swal-max-verses" type="range" min="5" max="100" step="5" value="0"
                  class="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
                  oninput="const v = this.value; const d = document.getElementById('range-value-display'); if(v==='0' || v===0) { d.innerText='تلقائي'; d.className='text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md'; } else { d.innerText = v + ' آية'; d.className='text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100'; }"
                 />
                 <div class="flex justify-between text-[10px] text-gray-400 mt-2 font-medium px-1">
                    <span>تلقائي</span>
                    <span>50</span>
                    <span>100</span>
                 </div>
               </div>
            </div>

            <!-- Dynamic Dates Section -->
            <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
               <div class="flex justify-between items-center mb-3">
                  <label class="text-xs font-bold text-gray-800 flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    اقتراح أيام للتعويض
                  </label>
                  <button type="button" id="add-date-btn" class="text-[10px] bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 border border-gray-200 hover:border-emerald-200 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 font-bold">
                    <span>+</span> إضافة تاريخ
                  </button>
               </div>

               <div id="dates-container" class="space-y-2 min-h-[0px] transition-all">
                  <!-- JS will inject dates here -->
                  <div id="no-dates-msg" class="text-center py-4 border-2 border-dashed border-gray-100 rounded-lg">
                    <p class="text-[10px] text-gray-400">لا توجد تواريخ محددة (سيتم اختيار أقرب وقت متاح)</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      `,
      didOpen: (popup) => {
        const slider = popup.querySelector('#swal-max-verses') as HTMLInputElement;
        // Reset slider visual state
        slider.value = '0'; 

        const addBtn = popup.querySelector('#add-date-btn');
        const container = popup.querySelector('#dates-container');
        const noDatesMsg = popup.querySelector('#no-dates-msg');

        if(addBtn && container) {
            addBtn.addEventListener('click', () => {
                if(noDatesMsg) noDatesMsg.style.display = 'none';

                const wrapper = document.createElement('div');
                wrapper.className = 'group flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200';
                
                // Get today's date in YYYY-MM-DD format for default
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const defaultDate = `${year}-${month}-${day}`;

                wrapper.innerHTML = `
                  <div class="relative flex-1">
                    <input type="date" value="${defaultDate}" class="swal-dynamic-date w-full pl-3 pr-10 py-2 text-sm bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg outline-none transition-all text-gray-600 font-medium font-mono" />
                    <div class="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                  </div>
                  <button type="button" class="delete-date-btn px-3 py-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                  </button>
                `;
                
                const deleteBtn = wrapper.querySelector('.delete-date-btn');
                deleteBtn?.addEventListener('click', () => {
                    wrapper.remove();
                    if(container.children.length === 0 || (container.children.length === 1 && container.contains(noDatesMsg))) {
                        if(noDatesMsg) noDatesMsg.style.display = 'block';
                    }
                });

                container.appendChild(wrapper);
            });
        }
      },
      showCancelButton: true,
      confirmButtonText: "بدء المعالجة",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#10b981", // Emerald 500
      cancelButtonColor: "#9ca3af",
      focusConfirm: false,
      customClass: {
        popup: "rtl:text-right !rounded-3xl !p-0 overflow-hidden font-cairo !w-[450px]",
        title: "!pt-6 !pb-2 !text-lg !text-gray-800 !font-black",
        htmlContainer: "!px-6 !pb-6",
        actions: "!p-5 !bg-gray-50/80 !m-0 !w-full !justify-between !flex-row-reverse gap-4 border-t border-gray-100",
        confirmButton: "!m-0 !bg-gradient-to-l !from-emerald-500 !to-teal-500 !shadow-lg !shadow-emerald-500/20 hover:!shadow-emerald-500/40 !px-8 !py-3 !rounded-xl !text-sm !font-bold flex-1 !tracking-wide transition-all hover:!scale-[1.02]",
        cancelButton: "!m-0 !bg-white !text-gray-500 !border !border-gray-200 hover:!bg-white hover:!text-gray-700 hover:!border-gray-300 !px-6 !py-3 !rounded-xl !text-sm !font-bold transition-all hover:!scale-[1.02]"
      },
      preConfirm: () => {
        const maxVersesInput = (document.getElementById('swal-max-verses') as HTMLInputElement);
        const maxVerses = maxVersesInput.value === '0' ? undefined : parseInt(maxVersesInput.value);
        
        const dateInputs = document.querySelectorAll('.swal-dynamic-date') as NodeListOf<HTMLInputElement>;
        const suggestedDates: string[] = [];
        dateInputs.forEach(input => {
            if(input.value) suggestedDates.push(input.value);
        });

        return {
          maxVersesPerDay: maxVerses,
          suggestedDates: suggestedDates.length > 0 ? suggestedDates : undefined
        };
      }
    });

    if (result.isConfirmed) {
      const options = result.value;
      setIsRepairing(true);
      try {
        const res = await repairSequence(selectedGroup, undefined, options);
        if (res?.repaired === false) {
           showSuccessToast(res.message || "السجلات سليمة ومحدثة.");
        } else {
           showSuccessToast(res?.message || "تمت عملية الإصلاح بنجاح");
           if (onSuccess) onSuccess(); 
        }
      } catch (error: any) {
        console.error(error);
        showErrorMessage("خطأ في الإصلاح", error.response?.data?.message || "حدث خطأ غير متوقع");
      } finally {
        setIsRepairing(false);
      }
    }
  };

  return { isRepairing, handleAutoRepair };
};
