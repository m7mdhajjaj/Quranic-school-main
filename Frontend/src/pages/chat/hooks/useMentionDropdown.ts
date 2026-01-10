// ============================================================================
// useMentionDropdown.ts - Mention Dropdown Logic Hook
// ============================================================================

import { useEffect, useState, useMemo } from 'react';

interface MentionUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: { url: string };
}

interface Position {
  top: number;
  left: number;
}

interface UseMentionDropdownProps {
  isOpen: boolean;
  users: MentionUser[];
  position: Position;
}

interface Coordinates {
  top: number;
  left: number;
}

interface AllOption {
  _id: 'all';
  firstName: string;
  lastName: string;
}

type DisplayItem = MentionUser | AllOption;

interface UseMentionDropdownReturn {
  coords: Coordinates;
  displayList: DisplayItem[];
  hasNoResults: boolean;
  allOption: AllOption;
}

const MENU_WIDTH = 256; // w-64 in pixels
const ITEM_HEIGHT = 50; // Approximate height per item
const HEADER_HEIGHT = 100; // Header + padding
const MAX_MENU_HEIGHT = 240;
const SCREEN_PADDING = 10;
const LINE_HEIGHT_OFFSET = 25;
const MENU_OFFSET = 5;

export const useMentionDropdown = ({
  isOpen,
  users,
  position
}: UseMentionDropdownProps): UseMentionDropdownReturn => {
  const [coords, setCoords] = useState<Coordinates>({ top: 0, left: 0 });

  /**
   * All users option
   */
  const allOption: AllOption = useMemo(() => ({
    _id: 'all',
    firstName: 'الجميع',
    lastName: '(All)'
  }), []);

  /**
   * Combined display list with "all" option first
   */
  const displayList = useMemo((): DisplayItem[] => {
    return [allOption, ...users];
  }, [allOption, users]);

  /**
   * Check if there are no search results
   */
  const hasNoResults = users.length === 0;

  /**
   * Calculate and adjust position to prevent overflow
   */
  useEffect(() => {
    if (!isOpen) return;

    const viewportWidth = window.innerWidth;
    const menuHeight = Math.min(users.length * ITEM_HEIGHT + HEADER_HEIGHT, MAX_MENU_HEIGHT);

    let newLeft = position.left;
    // Position the bottom of the menu slightly above the caret line
    let newTop = position.top - menuHeight - MENU_OFFSET;

    // Prevent going off right screen
    if (newLeft + MENU_WIDTH > viewportWidth) {
      newLeft = viewportWidth - MENU_WIDTH - (SCREEN_PADDING * 2);
    }

    // Prevent going off left screen
    if (newLeft < SCREEN_PADDING) {
      newLeft = SCREEN_PADDING;
    }

    // If top is too high (off screen), show below instead
    if (newTop < SCREEN_PADDING) {
      newTop = position.top + LINE_HEIGHT_OFFSET;
    }

    setCoords({ top: newTop, left: newLeft });
  }, [position, isOpen, users.length]);

  return {
    coords,
    displayList,
    hasNoResults,
    allOption
  };
};

export type { MentionUser, Position, DisplayItem, AllOption };
