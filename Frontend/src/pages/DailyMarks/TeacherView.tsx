import type { TeacherViewProps } from "./types/dailyMarks";
import { StudentList } from "./components/StudentList";
import { SectionsTable } from "./components/SectionsTable";
import { AveragesBar } from "./components/AveragesBar";
import { EmptyState, Card } from "@/components/UI";

/**
 * Teacher view component - 2-column layout with student list and marks table
 */
export const TeacherView = ({
  students,
  filteredStudents,
  teacherGroups,
  selectedGroup,
  selectedStudentId,
  sections,
  marks,
  loadingMarks,
  averages,
  onGroupChange,
  onStudentSelect,
  onAddSection,
  onBulkUpdate,
  onBulkDelete,
  onAddMark,
  onUpdateMark,
  onEditSection,
  onDeleteSection,
}: TeacherViewProps) => {
  const getSelectedStudent = () => {
    return students.find((s) => s._id === selectedStudentId);
  };

  const selectedStudent = getSelectedStudent();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-fade-in">
      {/* Student List Card */}
      <StudentList
        students={filteredStudents}
        teacherGroups={teacherGroups}
        selectedGroup={selectedGroup}
        selectedStudentId={selectedStudentId}
        onGroupChange={onGroupChange}
        onStudentSelect={onStudentSelect}
        onAddSection={onAddSection}
        onBulkUpdate={onBulkUpdate}
        onBulkDelete={onBulkDelete}
      />

      {/* Student Details and Marks */}
      <div className="xl:col-span-3">
        {selectedStudentId && selectedStudent ? (
          <Card className="overflow-hidden p-0 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            {/* Enhanced Header with gradient and student info */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 py-6 px-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-5"></div>
              <div className="absolute top-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full translate-x-16 translate-y-16"></div>
              
              <div className="relative flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {`${selectedStudent.firstName} ${selectedStudent.fatherName} ${selectedStudent.lastName}`}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                        📚 {selectedStudent.group}
                      </span>
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                        📊 {sections.length} مقطع
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-0">
              <SectionsTable
                sections={sections}
                marks={marks}
                loadingMarks={loadingMarks}
                isTeacher={true}
                onAddMark={onAddMark}
                onUpdateMark={onUpdateMark}
                onEditSection={onEditSection}
                onDeleteSection={onDeleteSection}
              />
            </div>

            {/* Averages Section for Teacher View */}
            {selectedStudentId && sections.length > 0 && (
              <AveragesBar
                reviewAverage={averages.reviewAverage}
                memorizationAverage={averages.memorizationAverage}
                overallAverage={averages.overallAverage}
                totalMarks={averages.totalMarks}
              />
            )}
          </Card>
        ) : (
          <EmptyState
            title="الرجاء اختيار طالب"
            description="اختر طالباً من القائمة لعرض علاماته"
          />
        )}
      </div>
    </div>
  );
};
