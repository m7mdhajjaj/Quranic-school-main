import React from "react";
import { FaMedal, FaStar } from "react-icons/fa";
import { TopListCard, type TopListItem } from "@/components/TopList";

interface TopStudent {
  name: string;
  value: number;
  avatar?: string;
  userId?: string;
  userRole?: string;
  user?: {
    _id?: string;
    name?: string;
    role?: string;
  };
  avgMark?: number;
  attendanceRate?: number;
  group?: string;
}

interface TopTeacher {
  name: string;
  value: number;
  avatar?: string;
  userId?: string;
  userRole?: string;
  user?: {
    _id?: string;
    name?: string;
    role?: string;
  };
  studentCount?: number;
  marksCount?: number;
  attendanceCount?: number;
  memorizedCount?: number;
  reviewCount?: number;
  group?: string;
  groups?: string[];
}

interface TopListsSectionProps {
  topStudents: TopStudent[];
  topTeachers: TopTeacher[];
}

export const TopListsSection: React.FC<TopListsSectionProps> = ({
  topStudents,
  topTeachers,
}) => {
  // تحويل البيانات إلى TopListItem format
  const studentsItems: TopListItem[] = topStudents.map((student) => ({
    name: student.name,
    value: student.value,
    avatar: student.avatar,
    userId: student.userId,
    userRole: student.userRole || "student",
    user: student.user,
    avgMark: student.avgMark,
    group: student.group,
  }));

  const teachersItems: TopListItem[] = topTeachers.map((teacher) => ({
    name: teacher.name,
    value: teacher.value,
    avatar: teacher.avatar,
    userId: teacher.userId,
    userRole: teacher.userRole || "teacher",
    user: teacher.user,
    studentCount: teacher.studentCount,
    groups: teacher.groups,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <TopListCard
        title="أفضل 5 طلاب"
        icon={<FaMedal className="text-yellow-500" />}
        items={studentsItems}
        emptyMessage="لا توجد بيانات لعرضها"
      />
      <TopListCard
        title="أفضل 5 معلمين"
        icon={<FaStar className="text-green-600" />}
        items={teachersItems}
        emptyMessage="لا توجد بيانات لعرضها"
      />
    </div>
  );
};
