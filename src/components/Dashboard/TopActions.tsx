import React from 'react';
import { Settings, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { BudgetYear } from '../../types';

interface TopActionsProps {
  selectedBudgetYear: BudgetYear | null;
  budgetYears: BudgetYear[];
  onBudgetYearChange: (budgetYear: BudgetYear) => void;
  onAddExpense: () => void;
  onAddIncome: () => void;
  onOpenSettings: () => void;
}

const TopActions: React.FC<TopActionsProps> = ({
  selectedBudgetYear,
  budgetYears,
  onBudgetYearChange,
  onAddExpense,
  onAddIncome,
  onOpenSettings
}) => {
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
              value={selectedBudgetYear?.id || ''}
              onChange={(e) => {
                const budgetYear = budgetYears.find(year => year.id === e.target.value);
                if (budgetYear) {
                  onBudgetYearChange(budgetYear);
                }
              }}
              className="p-2 border border-gray-300 rounded-md text-sm"
            >
              {budgetYears.map(year => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onAddExpense}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg"
          >
            <TrendingDown size={18} />
            הוספת הוצאה
          </button>
          
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

export default TopActions