import React from 'react';
import { ActivityCard } from './ActivityCard';
import type { Activity } from '../types/activities';

interface ActivityListProps {
  activities: Activity[];
  isTeacherOrAdmin: boolean;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

export const ActivityListComponent: React.FC<ActivityListProps> = ({
  activities,
  isTeacherOrAdmin,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {activities.map((activity, index) => (
        <ActivityCard
          key={activity._id}
          activity={activity}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
          isTeacherOrAdmin={isTeacherOrAdmin}
        />
      ))}
    </div>
  );
};
