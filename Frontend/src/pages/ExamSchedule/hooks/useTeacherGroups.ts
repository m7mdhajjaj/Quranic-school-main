import { useEffect, useState } from 'react';

export function useTeacherGroups(role: 'student' | 'teacher' | 'admin') {
  const [teacherGroups, setTeacherGroups] = useState<string[]>([]);
  const [loadingTeacherGroups, setLoadingTeacherGroups] = useState(false);

  useEffect(() => {
    const fetchTeacherGroups = async () => {
      if (role !== 'teacher') {
        setTeacherGroups([]);
        return;
      }
      setLoadingTeacherGroups(true);
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const currentUser = JSON.parse(userStr);

  const { getAllGroups } = await import("@/Api/groupApi");
        const groupsRes = await getAllGroups();
        if (!groupsRes.success || !Array.isArray(groupsRes.data)) {
          setTeacherGroups([]);
          return;
        }

        const possibleNames = getTeacherPossibleNames(currentUser);
        const teacherGroupsData = groupsRes.data.filter((group: { teacher?: string }) => {
          if (!group.teacher) return false;
          return isTeacherMatch(group.teacher, possibleNames);
        }) as Array<{ name: string }>;

        const groupNames = teacherGroupsData.map((g) => g.name).sort((a, b) => a.localeCompare(b, 'ar'));
        setTeacherGroups(groupNames);
      } catch (error) {
        console.error('خطأ في جلب حلقات المعلم:', error);
        setTeacherGroups([]);
      } finally {
        setLoadingTeacherGroups(false);
      }
    };

    fetchTeacherGroups();
  }, [role]);

  // helpers duplicated locally to keep hook self-contained
  const getTeacherPossibleNames = (user: { firstName?: string; fatherName?: string; lastName?: string }) => {
    const firstLast = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    const firstFatherLast = `${user.firstName ?? ''} ${user.fatherName ?? ''} ${user.lastName ?? ''}`.trim().replace(/\s+/g, ' ');
    return [firstLast, firstFatherLast, user.firstName ?? ''].filter((n): n is string => !!n && n.length > 0);
  };

  const isTeacherMatch = (studentTeacher: string, possibleNames: string[]) => {
    const studentTeacherNormalized = studentTeacher.trim().replace(/\s+/g, ' ').toLowerCase();
    return possibleNames.some((possibleName) => {
      const normalizedPossible = possibleName.toLowerCase();
      return (
        studentTeacherNormalized === normalizedPossible ||
        studentTeacherNormalized.includes(normalizedPossible) ||
        normalizedPossible.includes(studentTeacherNormalized)
      );
    });
  };

  return { teacherGroups, loadingTeacherGroups } as const;
}
