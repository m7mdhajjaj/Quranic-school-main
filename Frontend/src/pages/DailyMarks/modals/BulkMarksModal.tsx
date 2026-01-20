import { Modal, Button, Card } from '@/components/UI';
import { RangeSlider } from '@/components/UI';
import { Users, Loader2, Calendar } from 'lucide-react';
import type { Section } from '../types/types';
import { useBulkMarksModal } from '../hooks/modals';

interface BulkMarksModalProps {
  isOpen: boolean;
  section: Section | null;
  group: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BulkMarksModal = ({
  isOpen,
  section,
  group,
  onClose,
  onSuccess,
}: BulkMarksModalProps) => {
  const {
    students,
    studentMarks,
    loading,
    submitting,
    error,
    marksCount,
    fetchStudents,
    updateStudentMark,
    handleSubmit,
  } = useBulkMarksModal(isOpen, section, group);

  // ✅ تحديد ما إذا كان المقطع يحتوي على حفظ أو مراجعة
  const hasMemorization = !!(
    section?.memorizationSection?.trim() || 
    (section?.memorizationMeta && section.memorizationMeta.length > 0)
  );
  const hasReview = !!(
    section?.reviewSection?.trim() || 
    (section?.reviewMeta && section.reviewMeta.length > 0)
  );

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit(onSuccess);
    if (success) {
      onClose();
    }
  };

  if (!isOpen || !section) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`إضافة/تحديث علامات لجميع طلاب الحلقة - ${group}`}
      size="lg"
    >
      <form onSubmit={onFormSubmit}>
        {/* Section Info */}
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 mb-6 p-4 border border-emerald-200">
          <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            معلومات المقطع:
          </h4>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700">
              <span className="font-semibold">التاريخ:</span>{' '}
              {new Date(section.date).toLocaleDateString('ar-SA', {
                timeZone: 'Asia/Jerusalem',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </p>
            {hasReview && (
              <p className="text-gray-700">
                <span className="font-semibold">مقطع المراجعة:</span>{' '}
                <span className="text-emerald-700">{section.reviewSection}</span>
              </p>
            )}
            {hasMemorization && (
              <p className="text-gray-700">
                <span className="font-semibold">مقطع الحفظ:</span>{' '}
                <span className="text-teal-700">{section.memorizationSection}</span>
              </p>
            )}
          </div>
        </Card>

        {/* Students List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="mr-3 text-gray-600">جاري جلب الطلاب...</span>
          </div>
        ) : error ? (
          <Card className="bg-red-50 border-red-200 p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <Button
              type="button"
              onClick={fetchStudents}
              variant="primary"
              className="mt-3 bg-red-600 hover:bg-red-700"
            >
              إعادة المحاولة
            </Button>
          </Card>
        ) : students.length === 0 ? (
          <Card className="bg-gray-50 p-6 text-center mb-6">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">لا يوجد طلاب في هذه الحلقة</p>
          </Card>
        ) : (
          <div className="mb-6">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              طلاب الحلقة ({students.length} طالب)
            </h4>
            <div className="max-h-96 overflow-y-auto space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
              {studentMarks.map((studentMark, index) => (
                <Card
                  key={studentMark.studentId}
                  className="bg-white p-4 border border-gray-200 hover:border-emerald-300 transition-colors"
                >
                  <div className="mb-4">
                    <h5 className="font-semibold text-gray-800 mb-1">
                      {studentMark.student.firstName} {studentMark.student.fatherName}{' '}
                      {studentMark.student.lastName}
                    </h5>
                    <p className="text-xs text-gray-500">
                      رقم الطالب: {studentMark.student.studentId}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ✅ Review Mark - فقط إذا كان هناك مقطع مراجعة */}
                    {hasReview && (
                      <div>
                        <RangeSlider
                          label="علامة المراجعة"
                          min={6}
                          max={10}
                          step={0.5}
                          value={studentMark.reviewMark ?? 6}
                          onChange={(value) =>
                            updateStudentMark(
                              studentMark.studentId,
                              'reviewMark',
                              value
                            )
                          }
                          showValue={true}
                          color="emerald"
                        />
                      </div>
                    )}

                    {/* ✅ Memorization Mark - فقط إذا كان هناك مقطع حفظ */}
                    {hasMemorization && (
                      <div>
                        <RangeSlider
                          label="علامة الحفظ"
                          min={6}
                          max={10}
                          step={0.5}
                          value={studentMark.memorizationMark ?? 6}
                          onChange={(value) =>
                            updateStudentMark(
                              studentMark.studentId,
                              'memorizationMark',
                              value
                            )
                          }
                          showValue={true}
                          color="teal"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            disabled={submitting}
            className="flex-1 py-3 px-6 rounded-xl min-h-[52px]"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || loading || students.length === 0}
            loading={submitting}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-3 px-8 rounded-xl shadow-lg hover:shadow-xl min-h-[52px]"
          >
            {submitting ? 'جاري الحفظ...' : `حفظ العلامات (${marksCount})`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

