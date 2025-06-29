import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { IncomeRowProps } from './types';
import InlineEditCell from './InlineEditCell';

const IncomeRow: React.FC<IncomeRowProps> = ({
  income,
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

  const getMonthName = (month: number) => {
    const months = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    return months[month - 1] || month.toString();
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="w-24 px-3 py-2 whitespace-nowrap text-sm text-gray-900">
        {formatDate(income.date)}
      </td>
      <td className="w-48 px-3 py-2 text-sm text-gray-900">
        <div className="truncate">
          <InlineEditCell
            income={income}
            field="name"
            value={income.name}
            inlineEdit={inlineEdit}
            onStartEdit={onStartInlineEdit}
            onSaveEdit={onSaveInlineEdit}
            onCancelEdit={onCancelInlineEdit}
            onEditChange={onInlineEditChange}
            onEditKeyPress={onInlineEditKeyPress}
            editInputRef={editInputRef}
          />
        </div>
      </td>
      <td className="w-32 px-3 py-2 text-sm text-gray-700">
        <div className="truncate">
          <InlineEditCell
            income={income}
            field="source"
            value={income.source || 'ללא מקור'}
            inlineEdit={inlineEdit}
            onStartEdit={onStartInlineEdit}
            onSaveEdit={onSaveInlineEdit}
            onCancelEdit={onCancelInlineEdit}
            onEditChange={onInlineEditChange}
            onEditKeyPress={onInlineEditKeyPress}
            editInputRef={editInputRef}
          />
        </div>
      </td>
      <td className="w-20 px-3 py-2 whitespace-nowrap text-sm text-gray-700">
        {getMonthName(income.month)}
      </td>
      <td className="w-20 px-3 py-2 whitespace-nowrap text-sm text-gray-700">
        {income.year}
      </td>
      <td className="w-28 px-3 py-2 whitespace-nowrap text-sm font-medium text-emerald-600">
        <InlineEditCell
          income={income}
          field="amount"
          value={income.amount}
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
      <td className="w-32 px-3 py-2 text-sm text-gray-700">
        <div className="truncate">
          <InlineEditCell
            income={income}
            field="note"
            value={income.note || ''}
            inlineEdit={inlineEdit}
            onStartEdit={onStartInlineEdit}
            onSaveEdit={onSaveInlineEdit}
            onCancelEdit={onCancelInlineEdit}
            onEditChange={onInlineEditChange}
            onEditKeyPress={onInlineEditKeyPress}
            editInputRef={editInputRef}
          />
        </div>
      </td>
      <td className="w-20 px-3 py-2 whitespace-nowrap text-sm text-gray-500">
        <div className="flex gap-1 justify-center">
          <button
            onClick={() => onEdit(income.id)}
            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
            title="עריכה מלאה"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(income.id)}
            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
            title="מחיקה"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default IncomeRow;