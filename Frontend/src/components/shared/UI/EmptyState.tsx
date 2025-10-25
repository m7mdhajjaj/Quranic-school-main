import React from 'react';
import { Button } from '../Form/Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  illustration?: 'no-data' | 'search' | 'error' | 'success';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  illustration,
}) => {
  const illustrations = {
    'no-data': '📭',
    search: '🔍',
    error: '❌',
    success: '✅',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-8xl mb-6 animate-bounce-slow">
        {icon || (illustration && illustrations[illustration]) || '📭'}
      </div>
      <h3 className="text-2xl font-bold text-gray-700 mb-3 text-center">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 mb-6 text-center max-w-md">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant="primary"
          size="lg"
          onClick={action.onClick}
          leftIcon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};
