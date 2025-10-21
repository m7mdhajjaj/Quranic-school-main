import { useEffect, useMemo, useState } from 'react';
import { useExamScheduleSocket } from '../../../Socket';
import { getAllExams, getExamAverage, type Exam, type ExamAverage } from '../../../Api/examApi';
import { getTeacherPossibleNames, isTeacherMatch } from '../utils';

export function useExamData(role: 'student' | 'teacher' | 'admin') {
  const { isConnected, lastUpdate: socketLastUpdate, socketId } = useExamScheduleSocket();

  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [examAverages, setExamAverages] = useState<Record<string, number | null>>({});

  const fetchExamAverage = async (examId: string): Promise<number | null> => {
    try {
      const data: ExamAverage = await getExamAverage(examId);
      return typeof data?.average === 'number' ? data.average : null;
    } catch {
      return null;
    }
  };

  const refreshAverageForExam = async (examId: string) => {
    const avg = await fetchExamAverage(examId);
    setExamAverages((prev) => ({ ...prev, [examId]: avg }));
  };

  type ExamWithAvg = Exam & { _id?: string; id?: string; examAverage?: number | null };
  const refreshAllAverages = useMemo(
    () => async (list: Exam[]) => {
      const entries = (list as ExamWithAvg[]).map((ex) => {
        const id = String(ex._id ?? ex.id);
        const avg = ex.examAverage ?? null;
        return [id, avg] as const;
      });
      setExamAverages(Object.fromEntries(entries));

      const examsWithoutAverage = (list as ExamWithAvg[]).filter((ex) => ex.examAverage === null || ex.examAverage === undefined);
      if (examsWithoutAverage.length > 0) {
        const fetchedAverages = await Promise.all(
          examsWithoutAverage.map(async (ex) => {
            const id = String(ex._id ?? ex.id);
            const avg = await fetchExamAverage(id);
            return [id, avg] as const;
          })
        );
        setExamAverages((prev) => ({
          ...prev,
          ...Object.fromEntries(fetchedAverages),
        }));
      }
    },
    []
  );

  const filterExamsByRole = async (list: Exam[]): Promise<Exam[]> => {
    let out = list;

    if (role === 'student') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const currentUser = JSON.parse(userStr);
        const studentGroup = currentUser.group as string | undefined;
        if (studentGroup) {
          out = out.filter((exam) => !exam.group || exam.group === studentGroup);
        } else {
          out = out.filter((exam) => !exam.group);
        }
      }
      return out;
    }

    if (role === 'teacher') {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const currentUser = JSON.parse(userStr);
          const { getAllGroups } = await import('../../../Api/groupApi');
          const groupsRes = await getAllGroups();
          if (groupsRes.success && Array.isArray(groupsRes.data)) {
            const possibleNames = getTeacherPossibleNames(currentUser);
            const teacherGroupsData = groupsRes.data.filter((group: { teacher?: string }) => {
              if (!group.teacher) return false;
              return isTeacherMatch(group.teacher, possibleNames);
            }) as Array<{ name: string }>;
            const teacherGroupNames = teacherGroupsData.map((g) => g.name);
            if (teacherGroupNames.length > 0) {
              out = out.filter((exam) => !exam.group || teacherGroupNames.includes(exam.group));
            } else {
              out = out.filter((exam) => !exam.group);
            }
          } else {
            out = out.filter((exam) => !exam.group);
          }
        }
      } catch (err) {
        console.error('خطأ في فلترة امتحانات المعلم:', err);
      }
      return out;
    }

    return out; // admin sees all
  };

  const loadExams = async () => {
    setLoadingExams(true);
    try {
      let list = await getAllExams();
      list = await filterExamsByRole(list);
      setExams(list);
      await refreshAllAverages(list);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setExams([]);
      setExamAverages({});
    } finally {
      setLoadingExams(false);
    }
  };

  useEffect(() => {
    loadExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (socketLastUpdate) {
      loadExams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketLastUpdate]);

  const reloadExams = () => loadExams();

  return { exams, loadingExams, examAverages, refreshAverageForExam, reloadExams, isConnected, socketLastUpdate, socketId } as const;
}
