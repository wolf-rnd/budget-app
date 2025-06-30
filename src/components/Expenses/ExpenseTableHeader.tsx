import React from 'react';
import { SortAsc, SortDesc } from 'lucide-react';
import { SortState } from './types';

interface ExpenseTableHeaderProps {
  sort: SortState;
  onSortChange: (field: SortState['field']) => void;
}

const ExpenseTableHeader: React.FC<ExpenseTableHeaderProps> = ({ sort, onSortChange }) => {
  const getSortIcon = (field: SortState['field']) => {
    if (sort.field !== field) return <div className="w-4 h-4" />; // placeholder לשמירת רוחב קבוע
    return sort.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
  };

  const sortableFields: { field: SortState['field']; label: string; width: string }[] = [
    { field: 'date', label: 'תאריך', width: 'w-24' },
    { field: 'name', label: 'שם', width: 'w-48' },
    { field: 'category', label: 'קטגוריה', width: 'w-32' },
    { field: 'fund', label: 'קופה', width: 'w-32' },
    { field: 'amount', label: 'סכום', width: 'w-28' }
  ];

  return (
    <thead className="bg-gray-50 sticky top-0 z-30">
      <tr>
        {sortableFields.map(({ field, label, width }) => (
          <th
            key={field}
            className={`${width} px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors`}
            onClick={() => onSortChange(field)}
          >
            <div className="flex items-center justify-between">
              <span className="truncate">{label}</span>
              <div className="flex-shrink-0 ml-1">
                {getSortIcon(field)}
              </div>
            </div>
          </th>
        ))}
        <th className="w-32 px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          הערה
        </th>
        <th className="w-20 px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          פעולות
        </th>
      </tr>
    </thead>
  );
};

export default ExpenseTableHeader;