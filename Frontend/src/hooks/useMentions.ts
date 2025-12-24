import { useState, useRef, useCallback, useEffect } from 'react';
import { getCaretCoordinates } from '../utils/caretCoordinates';
import api from '../Api/api';

interface MentionUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: { url: string };
}

interface UseMentionsProps {
  onSelect: (user: MentionUser | 'all') => void;
}

export const useMentions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [users, setUsers] = useState<MentionUser[]>([]);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [triggerIndex, setTriggerIndex] = useState<number | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch users based on query
  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      try {
        const { data } = await api.get(`/mentions/search?q=${query}`);
        setUsers(data.data);
        setActiveIndex(0);
      } catch (error) {
        console.error("Failed to fetch mention users", error);
      }
    };

    const timeoutId = setTimeout(fetchUsers, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [query, isOpen]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value, selectionStart } = e.target;
    
    // Check if we are typing a mention
    // Look backwards from cursor to find the last @
    const textBeforeCaret = value.slice(0, selectionStart);
    const lastAtPos = textBeforeCaret.lastIndexOf('@');

    if (lastAtPos !== -1) {
      const textAfterAt = textBeforeCaret.slice(lastAtPos + 1);
      
      // Valid mention if no spaces (or handle spaces if you want "John Doe")
      // Here we assume simple names or allow spaces if needed, but usually stop at newline
      if (!textAfterAt.includes('\n') && (textAfterAt.length <= 15)) { // Limit search length
        setTriggerIndex(lastAtPos);
        setQuery(textAfterAt);
        setIsOpen(true);
        
        // Calculate position
        if (textareaRef.current) {
          const coords = getCaretCoordinates(textareaRef.current, lastAtPos);
          const rect = textareaRef.current.getBoundingClientRect();
          
          // Calculate absolute position relative to viewport
          // Subtract scrollTop to handle scrolling within the textarea
          setPosition({ 
            top: rect.top + coords.top - textareaRef.current.scrollTop, 
            left: rect.left + coords.left - textareaRef.current.scrollLeft
          });
        }
        return;
      }
    }

    setIsOpen(false);
    setTriggerIndex(null);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const totalOptions = users.length + 1; // +1 for "All"

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % totalOptions);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + totalOptions) % totalOptions);
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        // Select logic handled by component calling this hook or return a select function
        // We'll return the selected item here
        return true; // Signal that we handled it
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
    return false;
  }, [isOpen, users.length]);

  const closeMentions = useCallback(() => {
    setIsOpen(false);
    setTriggerIndex(null);
    setUsers([]);
  }, []);

  return {
    isOpen,
    query,
    activeIndex,
    users,
    position,
    triggerIndex,
    textareaRef,
    handleChange,
    handleKeyDown,
    closeMentions
  };
};
