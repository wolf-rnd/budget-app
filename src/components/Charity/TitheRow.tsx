import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { TitheRowProps } from './types';
import InlineEditCell from './InlineEditCell';

const TitheRow: React.FC<TitheRowProps> = ({
  tithe,
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
      <td className="w-24 px-3 py-2 whitespace-nowrap text-sm text-gray-900">
        {formatDate(tithe.date)}
      </td>
      <td className="w-64 px-3 py-2 text-sm text-gray-900">
        <div className="truncate">
          <InlineEditCell
            tithe={tithe}
            field="description"
            value={tithe.description}
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
      <td className="w-28 px-3 py-2 whitespace-nowrap text-sm font-medium text-pink-600">
        <InlineEditCell
          tithe={tithe}
          field="amount"
          value={tithe.amount}
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
      <td className="w-48 px-3 py-2 text-sm text-gray-700">
        <div className="truncate">
          <InlineEditCell
            tithe={tithe}
            field="note"
            value={tithe.note || ''}
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
            onClick={() => onEdit(tithe.id)}
            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
            title="עריכה מלאה"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(tithe.id)}
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

export default TitheRow;