import { useMemo } from "react";
import type { Group, GroupStats } from "../types";

export const useGroupsStats = (groups: Group[]): GroupStats => {
  return useMemo(() => {
    const totalGroups = groups.length;
    const totalStudents = groups.reduce(
      (sum, g) => sum + (g.currentStudents || 0),
      0
    );
    const fullGroups = groups.filter(
      (g) =>
        g.isFull ||
        (g.currentStudents && g.capacity && g.currentStudents >= g.capacity)
    ).length;
    const emptyGroups = groups.filter(
      (g) => (g.currentStudents || 0) === 0
    ).length;
    const totalCapacity = groups.reduce((sum, g) => sum + (g.capacity || 0), 0);
    const availableSeats = Math.max(0, totalCapacity - totalStudents);

    return {
      totalGroups,
      totalStudents,
      fullGroups,
      emptyGroups,
      totalCapacity,
      availableSeats,
    };
  }, [groups]);
};
