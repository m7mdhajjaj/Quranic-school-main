import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  className,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const variants = {
    default: {
      container: 'border-b border-gray-200',
      tab: 'px-4 py-2 border-b-2 transition-colors',
      active: 'border-emerald-500 text-emerald-600 font-medium',
      inactive: 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300',
    },
    pills: {
      container: 'bg-gray-100 p-1 rounded-lg',
      tab: 'px-4 py-2 rounded-md transition-colors',
      active: 'bg-white text-emerald-600 font-medium shadow-sm',
      inactive: 'text-gray-600 hover:text-gray-800',
    },
    underline: {
      container: 'space-x-2 space-x-reverse',
      tab: 'px-4 py-2 relative transition-colors',
      active: 'text-emerald-600 font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500',
      inactive: 'text-gray-600 hover:text-gray-800',
    },
  };

  const config = variants[variant];
  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      <div className={`flex ${config.container}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`${config.tab} ${
              activeTab === tab.id ? config.active : config.inactive
            }`}
          >
            <div className="flex items-center gap-2">
              {tab.icon && tab.icon}
              {tab.label}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-6">{activeContent}</div>
    </div>
  );
};
