import { useState, useRef, useCallback, useEffect } from 'react';
import { getCaretCoordinates } from '../../../utils/caretCoordinates';
import api from '../../../Api/api';
import type { User, ChatType } from '../types';

// MentionUser extends User with required fields for mentions
export interface MentionUser extends Pick<User, '_id' | 'firstName' | 'lastName' | 'avatar'> {}

export const useMentions = (chatType: ChatType = 'GROUP', groupId?: string) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [users, setUsers] = useState<MentionUser[]>([]);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [triggerIndex, setTriggerIndex] = useState<number | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch users based on query - only for GROUP chats
  useEffect(() => {
    if (!isOpen || chatType !== 'GROUP') {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        // Pass groupId and query to get group members only
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (groupId) params.append('groupId', groupId);
        
        const { data } = await api.get(`/mentions/search?${params.toString()}`);
        
        // Filter locally by firstName or lastName if query exists
        let filteredUsers = data.data || [];
        if (query && query.trim()) {
          const searchTerm = query.toLowerCase().trim();
          filteredUsers = filteredUsers.filter((user: MentionUser) => {
            const firstName = (user.firstName || '').toLowerCase();
            const lastName = (user.lastName || '').toLowerCase();
            const fullName = `${firstName} ${lastName}`;
            return firstName.includes(searchTerm) || 
                   lastName.includes(searchTerm) || 
                   fullName.includes(searchTerm);
          });
        }
        
        setUsers(filteredUsers);
        setActiveIndex(0);
      } catch (error) {
        console.error("Failed to fetch mention users", error);
      }
    };

    const timeoutId = setTimeout(fetchUsers, 200); // Faster debounce
    return () => clearTimeout(timeoutId);
  }, [query, isOpen, chatType, groupId]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value, selectionStart } = e.target;
    const textarea = e.target; // Use event target directly
    
    // Check if we are typing a mention
    // Look backwards from cursor to find the last @
    const textBeforeCaret = value.slice(0, selectionStart);
    const lastAtPos = textBeforeCaret.lastIndexOf('@');

    if (lastAtPos !== -1 && chatType === 'GROUP') {
      const textAfterAt = textBeforeCaret.slice(lastAtPos + 1);
      
      // Allow spaces for full names like "محمد أحمد"
      // Stop at newline only
      if (!textAfterAt.includes('\n') && (textAfterAt.length <= 25)) { // Limit search length
        setTriggerIndex(lastAtPos);
        setQuery(textAfterAt);
        setIsOpen(true);
        
        // Calculate position using event target directly
        const coords = getCaretCoordinates(textarea, lastAtPos);
        const rect = textarea.getBoundingClientRect();
        
        // Calculate absolute position relative to viewport
        // Subtract scrollTop to handle scrolling within the textarea
        setPosition({ 
          top: rect.top + coords.top - textarea.scrollTop, 
          left: rect.left + coords.left - textarea.scrollLeft
        });
        
        // Update ref for later use
        textareaRef.current = textarea;
        return;
      }
    }

    setIsOpen(false);
    setTriggerIndex(null);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    // When searching, don't count "All" option
    const totalOptions = query.trim() ? users.length : users.length + 1;
    if (totalOptions === 0) return;

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
