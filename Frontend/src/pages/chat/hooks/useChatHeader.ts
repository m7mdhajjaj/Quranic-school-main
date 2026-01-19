// ============================================================================
// useChatHeader.ts - Chat Header Logic Hook
// ============================================================================

import { useCallback } from 'react';
import api from '../../../Api/api';
import { showErrorMessage } from '../../../utils/sweetalertUtils';
import { showSuccessToast } from '../../../utils/toastUtils';
import type { ChatType } from '../types';

interface DropdownItem {
  label: string;
  icon?: string;
  onClick: () => void;
}

export const useChatHeader = (chatType: ChatType, targetId: string): { getHeaderDropdownItems: () => DropdownItem[] } => {
  const handleMute = useCallback(async (duration: number) => {
    try {
      await api.post('/chat/conversations/mute', {
        chatType,
        targetId,
        duration
      });
      showSuccessToast(
        duration === 0 ? "✅ تم إلغاء كتم الإشعارات" : "✅ تم كتم الإشعارات بنجاح"
      );
    } catch (error) {
      showErrorMessage("خطأ", "فشل تحديث إعدادات الإشعارات");
    }
  }, [chatType, targetId]);

  const getHeaderDropdownItems = useCallback((): DropdownItem[] => [
    {
      label: "كتم لمدة ساعة",
      onClick: () => handleMute(60),
    },
    {
      label: "كتم لمدة يوم",
      onClick: () => handleMute(24 * 60),
    },
    {
      label: "كتم دائماً",
      onClick: () => handleMute(-1),
    },
    {
      label: "إلغاء الكتم",
      onClick: () => handleMute(0),
    }
  ], [handleMute]);

  return { getHeaderDropdownItems };
};
