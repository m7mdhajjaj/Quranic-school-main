export type UserNameLike = { firstName?: string; fatherName?: string; lastName?: string };

export const getTeacherPossibleNames = (user: UserNameLike): string[] => {
  const firstLast = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  const firstFatherLast = `${user.firstName ?? ''} ${user.fatherName ?? ''} ${user.lastName ?? ''}`
    .trim()
    .replace(/\s+/g, ' ');
  return [firstLast, firstFatherLast, user.firstName ?? ''].filter(
    (name): name is string => !!name && name.length > 0
  );
};

export const isTeacherMatch = (studentTeacher: string, possibleNames: string[]): boolean => {
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
