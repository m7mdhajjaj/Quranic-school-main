import { useState, useEffect } from 'react';
import api from '../../../Api/api';

export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: { url: string };
  role: 'student' | 'teacher' | 'admin';
  teacherId?: number;
  studentId?: number;
  adminId?: number;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  image?: { url: string };
  teacher?: string;
}

export const useChatContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/chat/contacts');
        // Response now returns { contacts: [], groups: [] }
        setContacts(res.data.contacts || []);
        setGroups(res.data.groups || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  return { contacts, groups, loading, error };
};
