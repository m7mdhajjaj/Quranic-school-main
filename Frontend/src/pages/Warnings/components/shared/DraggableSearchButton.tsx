// ============================================================================
// DraggableSearchButton - زر البحث القابل للسحب
// ============================================================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface DraggableSearchButtonProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const DraggableSearchButton: React.FC<DraggableSearchButtonProps> = ({
  onSearch,
  placeholder = 'ابحث عن طالب...',
}) => {
  const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const buttonRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ✅ Handle mouse down - start dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position]);

  // ✅ Handle mouse move - dragging with RAF for performance
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const deltaX = Math.abs(e.clientX - (dragStart.x + position.x));
    const deltaY = Math.abs(e.clientY - (dragStart.y + position.y));
    
    // Only consider it moved if dragged more than 3px (reduced threshold)
    if (deltaX > 3 || deltaY > 3) {
      setHasMoved(true);
    }
    
    // Use requestAnimationFrame for smooth 60fps updates
    requestAnimationFrame(() => {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Keep button within viewport with dynamic width calculation
      const buttonWidth = isExpanded ? 320 : 56; // w-80 = 320px, w-14 = 56px
      const maxX = window.innerWidth - buttonWidth;
      const maxY = window.innerHeight - 56;

      setPosition({
        x: Math.max(20, Math.min(newX, maxX)),
        y: Math.max(20, Math.min(newY, maxY)),
      });
    });
  }, [isDragging, dragStart, position, isExpanded]);

  // ✅ Handle mouse up - stop dragging
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      const wasNotMoved = !hasMoved;
      setIsDragging(false);
      
      // If didn't move significantly, toggle expanded input
      if (wasNotMoved) {
        setTimeout(() => {
          setIsExpanded(prev => !prev);
          if (!isExpanded) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
          }
        }, 50);
      }
      
      // Reset after a brief delay
      setTimeout(() => setHasMoved(false), 100);
    }
  }, [isDragging, hasMoved, isExpanded]);

  // ✅ Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  }, [onSearch]);

  // ✅ Handle close expanded search
  const handleCloseExpanded = useCallback(() => {
    setIsExpanded(false);
    setSearchQuery('');
    onSearch('');
  }, [onSearch]);

  // ✅ Handle close modal search
  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
    onSearch('');
  }, [onSearch]);

  // ✅ Setup mouse event listeners with passive: false for better performance
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      
      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // ✅ Close search on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSearchOpen) {
          handleCloseSearch();
        } else if (isExpanded) {
          handleCloseExpanded();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isExpanded, handleCloseSearch, handleCloseExpanded]);

  return (
    <>
      {/* Draggable Button/Search Bar */}
      <div
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 9998,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          touchAction: 'none',
        }}
        className={`
          ${isExpanded ? 'w-80' : 'w-14'} h-14 rounded-full
          bg-gradient-to-br from-emerald-500 to-teal-600
          text-white shadow-2xl
          flex items-center gap-2
          cursor-${isDragging ? 'grabbing' : 'grab'}
          ${!isDragging && 'hover:scale-105'}
          active:scale-95
          ${isExpanded ? 'transition-all duration-300' : 'transition-transform duration-150'}
          ${isDragging ? 'scale-105 shadow-3xl transition-none' : ''}
          overflow-hidden
          will-change-transform
        `}
        title={isExpanded ? "اسحب لتحريك أو اكتب للبحث" : "اسحب أو اضغط للبحث"}
      >
        <div className="flex items-center justify-center w-14 h-14 shrink-0">
          <Search className={`w-6 h-6 ${isDragging ? 'animate-pulse' : ''}`} />
        </div>
        
        {isExpanded && (
          <div className="flex-1 flex items-center gap-2 pr-3 animate-fade-in">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder={placeholder}
              className="flex-1 bg-transparent outline-none text-white placeholder-white/70 text-sm"
              dir="rtl"
            />
            <button
              onClick={handleCloseExpanded}
              onMouseDown={(e) => e.stopPropagation()}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-start justify-center p-4 animate-fade-in"
          onClick={handleCloseSearch}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border-2 border-emerald-500/20 w-full max-w-2xl mt-20 animate-fade-in-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-200">
              <Search className="w-5 h-5 text-emerald-600" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={placeholder}
                className="flex-1 text-lg outline-none text-gray-800"
                dir="rtl"
              />
              <button
                onClick={handleCloseSearch}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="إغلاق"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Search Info */}
            {searchQuery && (
              <div className="p-4 text-center text-sm text-gray-600" dir="rtl">
                جاري البحث عن: <span className="font-bold text-emerald-600">{searchQuery}</span>
              </div>
            )}

            {/* Help Text */}
            {!searchQuery && (
              <div className="p-6 text-center text-gray-500" dir="rtl">
                <p className="text-sm">اكتب اسم الطالب للبحث</p>
                <p className="text-xs mt-2">اضغط ESC للإغلاق</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
