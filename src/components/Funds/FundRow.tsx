import React, { useState } from 'react';
import { Edit, Trash2, Check, X, Power, PowerOff } from 'lucide-react';
import { FundRowProps, BudgetEditState } from './types';
import ColorBadge from '../UI/ColorBadge';

const FundRow: React.FC<FundRowProps> = ({
  fund,
  categories,
  budgetYears,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onUpdateBudget
}) => {
  const [budgetEdit, setBudgetEdit] = useState<BudgetEditState>({
    fundId: null,
    budgetYearId: null,
    value: '',
    originalValue: ''
  });

  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount) return '₪0';
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly': return 'חודשי';
      case 'annual': return 'שנתי';
      case 'savings': return 'חיסכון';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'monthly': return '#10b981';
      case 'annual': return '#3b82f6';
      case 'savings': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return '#10b981';
      case 2: return '#3b82f6';
      case 3: return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const fundCategories = categories.filter(cat => 
    fund.categories?.includes(cat.id) || fund.categories?.includes(cat.name)
  );


  const handleBudgetEdit = (budgetYearId: string, currentAmount: number) => {
    setBudgetEdit({
      fundId: fund.id,
      budgetYearId,
      value: currentAmount.toString(),
      originalValue: currentAmount.toString()
    });
  };

  const handleBudgetSave = () => {
    if (budgetEdit.fundId && budgetEdit.budgetYearId) {
      const newAmount = Number(budgetEdit.value);
      if (!isNaN(newAmount) && newAmount >= 0) {
        onUpdateBudget(budgetEdit.fundId, budgetEdit.budgetYearId, newAmount);
      }
    }
    setBudgetEdit({ fundId: null, budgetYearId: null, value: '', originalValue: '' });
  };

  const handleBudgetCancel = () => {
    setBudgetEdit({ fundId: null, budgetYearId: null, value: '', originalValue: '' });
  };

  const handleBudgetKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBudgetSave();
    } else if (e.key === 'Escape') {
      handleBudgetCancel();
    }
  };

  const isEditingBudget = budgetEdit.fundId === fund.id;

  return (
    <tr className={`hover:bg-gray-50`}>
      {/* שם קופה */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div>
            <div className="text-sm font-medium text-gray-900">{fund.name}</div>
            {fund.color_class && (
              <ColorBadge color={fund.color_class} size="sm" className="mt-1">
                צבע
              </ColorBadge>
            )}
          </div>
        </div>
      </td>

      {/* סוג */}
      <td className="px-6 py-4 whitespace-nowrap">
        <ColorBadge color={getTypeColor(fund.type)}>
          {getTypeLabel(fund.type)}
        </ColorBadge>
      </td>

      {/* תקציב */}
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditingBudget ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={budgetEdit.value}
              onChange={(e) => setBudgetEdit(prev => ({ ...prev, value: e.target.value }))}
              onKeyDown={handleBudgetKeyPress}
              className="w-24 p-1 border border-blue-300 rounded text-sm"
              autoFocus
            />
            <button
              onClick={handleBudgetSave}
              className="text-green-600 hover:text-green-800 p-1"
            >
              <Check size={14} />
            </button>
            <button
              onClick={handleBudgetCancel}
              className="text-red-600 hover:text-red-800 p-1"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div
            className="text-sm text-gray-900 cursor-pointer hover:bg-blue-50 p-1 rounded"
            onDoubleClick={() => handleBudgetEdit(fund.budget_year_id || '', fund.amount || 0)}
            title="לחץ פעמיים לעריכה"
          >
            {formatCurrency(fund.amount)}
          </div>
        )}
      </td>

      {/* רמה */}
      <td className="px-6 py-4 whitespace-nowrap">
        <ColorBadge color={getLevelColor(fund.level)}>
          רמה {fund.level}
        </ColorBadge>
      </td>

      {/* בתקציב */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          fund.include_in_budget 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {fund.include_in_budget ? 'כן' : 'לא'}
        </span>
      </td>

      {/* הוצאות */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
        {formatCurrency(fund.spent)}
      </td>

      {/* ניתן */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">
        {formatCurrency(fund.amount_given)}
      </td>

      {/* קטגוריות */}
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {fundCategories.length > 0 ? (
            fundCategories.slice(0, 3).map(category => (
              <ColorBadge key={category.id} color={category.color_class} size="sm">
                {category.name}
              </ColorBadge>
            ))
          ) : (
            <span className="text-xs text-gray-400">אין קטגוריות</span>
          )}
          {fundCategories.length > 3 && (
            <span className="text-xs text-gray-500">+{fundCategories.length - 3}</span>
          )}
        </div>
      </td>

      {/* סטטוס
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          false 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {false ? 'פעיל' : 'לא פעיל'}
        </span>
      </td> */}

      {/* פעולות */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex gap-2">
          {/* {false ? (
            <button
              onClick={() => onDeactivate(fund.id)}
              className="text-orange-600 hover:text-orange-900 p-1 rounded-md hover:bg-orange-50 transition-colors"
              title="השבת קופה"
            >
              <PowerOff size={16} />
            </button>
          ) : (
            <button
              onClick={() => onActivate(fund.id)}
              className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors"
              title="הפעל קופה"
            >
              <Power size={16} />
            </button>
          )} */}
          
          <button
            onClick={() => onEdit(fund.id)}
            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
            title="עריכה"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={() => onDelete(fund.id)}
            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
            title="מחיקה"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default FundRow;