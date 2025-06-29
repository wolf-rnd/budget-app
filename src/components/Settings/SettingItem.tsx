import React, { ReactNode } from 'react';

interface SettingItemProps {
  label: string;
  description?: string;
  children: ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({ label, description, children }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start gap-4">
      <div className="md:w-1/3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      <div className="md:w-2/3">
        {children}
      </div>
    </div>
  );
};

export default SettingItem;