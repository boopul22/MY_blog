import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TabContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasError: (tab: string) => boolean;
  setTabError: (tab: string, hasError: boolean) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

interface TabContainerProps {
  children: ReactNode;
  defaultTab: string;
  className?: string;
}

export const TabContainer: React.FC<TabContainerProps> = ({ 
  children, 
  defaultTab, 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [tabErrors, setTabErrors] = useState<Record<string, boolean>>({});

  const hasError = (tab: string) => tabErrors[tab] || false;
  
  const setTabError = (tab: string, hasError: boolean) => {
    setTabErrors(prev => ({ ...prev, [tab]: hasError }));
  };

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab, hasError, setTabError }}>
      <div className={`w-full ${className}`}>
        {children}
      </div>
    </TabContext.Provider>
  );
};

interface TabListProps {
  children: ReactNode;
  className?: string;
}

export const TabList: React.FC<TabListProps> = ({ children, className = '' }) => {
  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <nav className="flex space-x-8" aria-label="Tabs">
        {children}
      </nav>
    </div>
  );
};

interface TabProps {
  id: string;
  children: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export const Tab: React.FC<TabProps> = ({ 
  id, 
  children, 
  icon, 
  disabled = false, 
  className = '' 
}) => {
  const context = useContext(TabContext);
  if (!context) throw new Error('Tab must be used within TabContainer');

  const { activeTab, setActiveTab, hasError } = context;
  const isActive = activeTab === id;
  const hasTabError = hasError(id);

  return (
    <button
      type="button"
      onClick={() => !disabled && setActiveTab(id)}
      disabled={disabled}
      className={`
        group relative py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
        ${isActive 
          ? 'border-primary text-primary dark:text-primary' 
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${hasTabError ? 'text-red-600 dark:text-red-400' : ''}
        ${className}
      `}
      aria-selected={isActive}
      role="tab"
    >
      <div className="flex items-center space-x-2">
        {icon && (
          <span className={`
            w-5 h-5 transition-colors duration-200
            ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}
            ${hasTabError ? 'text-red-500' : ''}
          `}>
            {icon}
          </span>
        )}
        <span>{children}</span>
        {hasTabError && (
          <span className="w-2 h-2 bg-red-500 rounded-full" aria-label="Has errors" />
        )}
      </div>
    </button>
  );
};

interface TabPanelProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  id,
  children,
  className = ''
}) => {
  const context = useContext(TabContext);
  if (!context) throw new Error('TabPanel must be used within TabContainer');

  const { activeTab } = context;
  const isActive = activeTab === id;

  if (!isActive) return null;

  return (
    <div
      className={`flex-1 overflow-hidden ${className}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
    >
      {children}
    </div>
  );
};

// Hook to use tab context
export const useTabContext = () => {
  const context = useContext(TabContext);
  if (!context) throw new Error('useTabContext must be used within TabContainer');
  return context;
};
