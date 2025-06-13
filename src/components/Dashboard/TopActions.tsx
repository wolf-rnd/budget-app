import React from 'react';
import { Settings, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface TopActionsProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  onAddExpense: () => void;
  onAddIncome: () => void;
  onOpenSettings: () => void;
}

const TopActions: React.FC<TopActionsProps> = ({
  selectedYear,
  onYearChange,
  onAddExpense,
  onAddIncome,
  onOpenSettings
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Settings size={18} />
            הגדרות
          </button>
          
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="p-2 border border-gray-300 rounded-md text-sm"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* כפתור הוספת הוצאה - בצבע הוצאות */}
          <button
            onClick={onAddExpense}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg"
          >
            <TrendingDown size={18} />
            הוספת הוצאה
          </button>
          
          {/* כפתור הוספת הכנסה - בצבע הכנסות */}
          <button
            onClick={onAddIncome}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors shadow-md hover:shadow-lg"
          >
            <TrendingUp size={18} />
            הוספת הכנסה
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopActions;