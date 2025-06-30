import React, { ReactNode } from 'react';

interface SettingsSectionProps {
  icon: ReactNode;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ icon, title, action, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        {action}
      </div>
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default SettingsSection;