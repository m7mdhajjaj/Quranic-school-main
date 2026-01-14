import { Button } from '@/components/UI';
import { Bot, Settings2 } from 'lucide-react';
import { useAiRepair } from '../hooks/teacher';

interface AiRepairButtonProps {
  selectedGroup: string;
  onSuccess?: () => void;
  className?: string;
}

export const AiRepairButton = ({
  selectedGroup,
  onSuccess,
  className
}: AiRepairButtonProps) => {
  const { isRepairing, handleAutoRepair } = useAiRepair(selectedGroup, onSuccess);

  return (
    <Button
      onClick={handleAutoRepair}
      className={`
        relative overflow-hidden
        bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700
        text-white border border-white/10
        shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40
        transition-all duration-300
        h-[38px] px-3 min-w-[130px] flex items-center justify-between gap-2.5 group
        rounded-lg
        ${className || ''}
      `}
      type="button"
      dir="rtl"
      title="المصحح الآلي"
      disabled={isRepairing}
      loading={isRepairing}
    >
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] z-0"></div>

      <div className="flex flex-col items-start leading-none pt-0.5 relative z-10">
        <span className="text-[8px] text-emerald-50 font-black uppercase tracking-widest flex items-center gap-1 px-1.5 py-[1px] bg-white/10 rounded-full mb-0.5 border border-white/10 backdrop-blur-[2px]">
          AI OPTIMIZER <Settings2 size={8} className="group-hover:animate-spin" />
        </span>
        <span className="text-xs font-bold text-white tracking-wide drop-shadow-sm">
          المصحح الآلي
        </span>
      </div>
      
      {!isRepairing && (
        <div className="relative z-10 w-7 h-7 flex items-center justify-center rounded-md bg-white/10 text-emerald-50 border border-white/20 group-hover:bg-white group-hover:text-emerald-600 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-inner">
          <Bot size={16} className="filter drop-shadow-sm" />
        </div>
      )}
    </Button>
  );
};
