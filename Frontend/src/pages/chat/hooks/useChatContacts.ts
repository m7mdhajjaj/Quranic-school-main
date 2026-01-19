import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../../Api/api';
import type { Contact as ApiContact, ContactsResponse } from '../../../Api/chatApi';

// Re-export Contact type with all 5 roles
export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: { url: string };
  role: 'student' | 'teacher' | 'admin' | 'secretary' | 'teacherAssistant';
  teacherId?: string;
  studentId?: string;
  adminId?: string;
  secretaryId?: string;
  assistantId?: string;
  group?: string;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  image?: { url: string };
  teacher?: string;
}

// Cache to prevent excessive fetches
let lastFetchTime = 0;
const FETCH_COOLDOWN = 3000; // 3 seconds

export const useChatContacts = (search?: string) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const currentSearchRef = useRef(search);

  const fetchContacts = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && (now - lastFetchTime) < FETCH_COOLDOWN) {
      return;
    }
    
    setLoading(true);
    lastFetchTime = now;
    
    try {
      const res = await api.get('/chat/contacts', {
        params: { search: currentSearchRef.current }
      });
      // Response returns { contacts: [], groups: [] }
      setContacts(res.data.contacts || []);
      setGroups(res.data.groups || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchContacts(true);
    }
  }, [fetchContacts]);

  // Fetch on search change
  useEffect(() => {
    if (currentSearchRef.current !== search) {
      currentSearchRef.current = search;
      fetchContacts(true);
    }
  }, [search, fetchContacts]);

  return { contacts, groups, loading, error, refetch: () => fetchContacts(true) };
};
