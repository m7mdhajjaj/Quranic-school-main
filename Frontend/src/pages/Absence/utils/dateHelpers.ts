// utils/dateHelpers.ts

export const AR_MONTHS = [
  "يناير (01)",
  "فبراير (02)",
  "مارس (03)",
  "أبريل (04)",
  "مايو (05)",
  "يونيو (06)",
  "يوليو (07)",
  "أغسطس (08)",
  "سبتمبر (09)",
  "أكتوبر (10)",
  "نوفمبر (11)",
  "ديسمبر (12)",
];

export const todayISO = () => new Date().toISOString().split("T")[0];

export const isDateTooOld = (date: string): boolean => {
  const selectedDate = new Date(date);
  const now = new Date();
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  const timeDiff = now.getTime() - selectedDate.getTime();
  return timeDiff > ONE_WEEK;
};

export const getDaysAgo = (date: string): number => {
  const selectedDate = new Date(date);
  const now = new Date();
  const timeDiff = now.getTime() - selectedDate.getTime();
  return Math.round(timeDiff / (1000 * 60 * 60 * 24));
};
