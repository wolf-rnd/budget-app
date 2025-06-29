import React from 'react';
import { SortAsc, SortDesc } from 'lucide-react';
import { SortState } from './types';

interface ExpenseTableHeaderProps {
  sort: SortState;
  onSortChange: (field: SortState['field']) => void;
}

const ExpenseTableHeader: React.FC<ExpenseTableHeaderProps> = ({ sort, onSortChange }) => {
  const getSortIcon = (field: SortState['field']) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
  };

  const sortableFields: { field: SortState['field']; label: string }[] = [
    { field: 'date', label: 'תאריך' },
    { field: 'name', label: 'שם' },
    { field: 'category', label: 'קטגוריה' },
    { field: 'fund', label: 'קופה' },
    { field: 'amount', label: 'סכום' }
  ];

  return (
    <thead className="bg-gray-50 sticky top-0 z-30">
      <tr>
        {sortableFields.map(({ field, label }) => (
          <th
            key={field}
            className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            onClick={() => onSortChange(field)}
          >
            <div className="flex items-center gap-1">
              {label}
              {getSortIcon(field)}
            </div>
          </th>
        ))}
        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          הערה
        </th>
        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          פעולות
        </th>
      </tr>
    </thead>
  );
};

export default ExpenseTableHeader;