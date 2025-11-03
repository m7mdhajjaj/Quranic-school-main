// utils/editLimits.ts

// تحكم التعديلات - السماح بتعديل تاريخ الميلاد والجنس مرتين فقط كل شهر
const addOneMonth = (dt: Date) => {
  const d = new Date(dt);
  d.setMonth(d.getMonth() + 1);
  return d;
};

const pruneRolling = (timestamps: string[]) => {
  const now = new Date();
  return timestamps.filter((iso) => now < addOneMonth(new Date(iso)));
};

const keyFor = (field: "birthDate" | "gender", userId: string) =>
  `editHistory_${field}_${userId}`;

export const canEditFieldLocal = (
  field: "birthDate" | "gender",
  userId: string
) => {
  const raw = localStorage.getItem(keyFor(field, userId));
  const list = pruneRolling(raw ? JSON.parse(raw) : []);
  const allowed = list.length < 2;
  const remaining = Math.max(0, 2 - list.length);
  return { allowed, remaining, list };
};

export const recordEditLocal = (
  field: "birthDate" | "gender",
  userId: string
) => {
  const { list } = canEditFieldLocal(field, userId);
  const updated = [...list, new Date().toISOString()];
  localStorage.setItem(keyFor(field, userId), JSON.stringify(updated));
};
