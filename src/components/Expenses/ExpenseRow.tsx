import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { ExpenseRowProps } from './types';
import ColorBadge from '../UI/ColorBadge';
import InlineEditCell from './InlineEditCell';

const ExpenseRow: React.FC<ExpenseRowProps> = ({
  expense,
  onEdit,
  onDelete,
  inlineEdit,
  onStartInlineEdit,
  onSaveInlineEdit,
  onCancelInlineEdit,
  onInlineEditChange,
  onInlineEditKeyPress,
  editInputRef
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
        {formatDate(expense.date)}
      </td>
      <td className="px-4 py-2 text-sm text-gray-900">
        <InlineEditCell
          expense={expense}
          field="name"
          value={expense.name}
          inlineEdit={inlineEdit}
          onStartEdit={onStartInlineEdit}
          onSaveEdit={onSaveInlineEdit}
          onCancelEdit={onCancelInlineEdit}
          onEditChange={onInlineEditChange}
          onEditKeyPress={onInlineEditKeyPress}
          editInputRef={editInputRef}
        />
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <ColorBadge color={expense.categories?.color_class}>
          {expense.categories?.name}
        </ColorBadge>
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <ColorBadge color={expense.funds?.color_class}>
          {expense.funds?.name}
        </ColorBadge>
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-amber-600">
        <InlineEditCell
          expense={expense}
          field="amount"
          value={expense.amount}
          type="number"
          inlineEdit={inlineEdit}
          onStartEdit={onStartInlineEdit}
          onSaveEdit={onSaveInlineEdit}
          onCancelEdit={onCancelInlineEdit}
          onEditChange={onInlineEditChange}
          onEditKeyPress={onInlineEditKeyPress}
          editInputRef={editInputRef}
        />
      </td>
      <td className="px-4 py-2 text-sm text-gray-700">
        <InlineEditCell
          expense={expense}
          field="note"
          value={expense.note || ''}
          inlineEdit={inlineEdit}
          onStartEdit={onStartInlineEdit}
          onSaveEdit={onSaveInlineEdit}
          onCancelEdit={onCancelInlineEdit}
          onEditChange={onInlineEditChange}
          onEditKeyPress={onInlineEditKeyPress}
          editInputRef={editInputRef}
        />
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(expense.id)}
            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
            title="עריכה מלאה"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(expense.id)}
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

export default ExpenseRow;