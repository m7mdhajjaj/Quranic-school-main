import { useEffect, useMemo, useState, useCallback } from 'react';
import { getMyExams, getExamAverage, type Exam, type ExamAverage } from "@/Api/ExamShedule";

interface UseExamDataOptions {
  search?: string;
  date?: string;
  type?: string;
  marksStatus?: string;
}

export function useExamData(_role: 'student' | 'teacher' | 'admin', options: UseExamDataOptions = {}) {

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

  const loadExams = useCallback(async () => {
    setLoadingExams(true);
    try {
      // Backend handles all role-based filtering
      const list = await getMyExams(options.search, options.date, options.type, options.marksStatus);
      
      setExams(list);
      await refreshAllAverages(list);
    } catch (error) {
      console.error('Error fetching exams:', error);
      setExams([]);
      setExamAverages({});
    } finally {
      setLoadingExams(false);
    }
  }, [options.search, options.date, options.type, options.marksStatus]);

  useEffect(() => {
    loadExams();
  }, [loadExams, options.search, options.date, options.type, options.marksStatus]);

  const reloadExams = () => loadExams();

  return { exams, loadingExams, examAverages, refreshAverageForExam, reloadExams } as const;
}
