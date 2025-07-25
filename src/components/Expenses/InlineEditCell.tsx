import React from 'react';
import { Check, X } from 'lucide-react';
import { InlineEditState } from './types';
import { GetExpenseRequest } from '../../services/expensesService';

interface InlineEditCellProps {
  expense: GetExpenseRequest;
  field: 'name' | 'amount' | 'note';
  value: string | number;
  type?: 'text' | 'number';
  inlineEdit: InlineEditState;
  onStartEdit: (expenseId: string, field: 'name' | 'amount' | 'note', currentValue: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (value: string) => void;
  onEditKeyPress: (e: React.KeyboardEvent) => void;
  editInputRef: React.RefObject<HTMLInputElement>;
}

const InlineEditCell: React.FC<InlineEditCellProps> = ({
  expense,
  field,
  value,
  type = 'text',
  inlineEdit,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditChange,
  onEditKeyPress,
  editInputRef
}) => {
  const isEditing = inlineEdit.expenseId === expense.id && inlineEdit.field === field;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={editInputRef}
          type={type}
          value={inlineEdit.value}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={onEditKeyPress}
          onBlur={onSaveEdit}
          className="w-full p-1 border border-blue-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
        />
        <button
          onClick={onSaveEdit}
          className="text-green-600 hover:text-green-800 p-1"
          title="שמירה"
        >
          <Check size={14} />
        </button>
        <button
          onClick={onCancelEdit}
          className="text-red-600 hover:text-red-800 p-1"
          title="ביטול"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDoubleClick={() => onStartEdit(expense.id, field, String(value))}
      className="cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors"
      title="לחץ פעמיים לעריכה"
    >
      {field === 'amount' ? formatCurrency(Number(value)) : value}
    </div>
  );
};

export default InlineEditCell;