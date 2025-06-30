import React from 'react';
import { Heart, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { GroupBy, PaginationState, InlineEditState, SortState } from './types';
import TitheTableHeader from './TitheTableHeader';
import TitheRow from './TitheRow';
import { TitheGiven } from '../../services/titheService';

interface TitheTableProps {
  tithes: TitheGiven[];
  groupBy: GroupBy;
  groupedTithes: Record<string, TitheGiven[]>;
  groupSums: Record<string, number>;
  expandedGroups: Record<string, boolean>;
  pagination: PaginationState;
  sort: SortState;
  inlineEdit: InlineEditState;
  dataLoaded: boolean;
  loadingRef: React.RefObject<HTMLDivElement>;
  editInputRef: React.RefObject<HTMLInputElement>;
  onSortChange: (field: SortState['field']) => void;
  onToggleGroup: (groupName: string) => void;
  onEditTithe: (id: string) => void;
  onDeleteTithe: (id: string) => void;
  onStartInlineEdit: (titheId: string, field: 'description' | 'amount' | 'note', currentValue: string) => void;
  onSaveInlineEdit: () => void;
  onCancelInlineEdit: () => void;
  onInlineEditChange: (value: string) => void;
  onInlineEditKeyPress: (e: React.KeyboardEvent) => void;
}

const TitheTable: React.FC<TitheTableProps> = ({
  tithes,
  groupBy,
  groupedTithes,
  groupSums,
  expandedGroups,
  pagination,
  sort,
  inlineEdit,
  dataLoaded,
  loadingRef,
  editInputRef,
  onSortChange,
  onToggleGroup,
  onEditTithe,
  onDeleteTithe,
  onStartInlineEdit,
  onSaveInlineEdit,
  onCancelInlineEdit,
  onInlineEditChange,
  onInlineEditKeyPress
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderTitheRow = (tithe: TitheGiven) => (
    <TitheRow
      key={tithe.id}
      tithe={tithe}
      onEdit={onEditTithe}
      onDelete={onDeleteTithe}
      inlineEdit={inlineEdit}
      onStartInlineEdit={onStartInlineEdit}
      onSaveInlineEdit={onSaveInlineEdit}
      onCancelInlineEdit={onCancelInlineEdit}
      onInlineEditChange={onInlineEditChange}
      onInlineEditKeyPress={onInlineEditKeyPress}
      editInputRef={editInputRef}
    />
  );

  const renderEmptyState = () => (
    <tr>
      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
        <div className="flex flex-col items-center gap-2">
          <Heart size={48} className="text-gray-300" />
          <p className="text-lg font-medium">אין מעשרות להצגה</p>
          <p className="text-sm">נסה לשנות את הפילטרים או להוסיף מעשר חדש</p>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mx-4">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <TitheTableHeader sort={sort} onSortChange={onSortChange} />
          <tbody className="bg-white divide-y divide-gray-200">
            {groupBy === 'none' ? (
              // תצוגה רגילה ללא קיבוץ
              tithes.length > 0 ? (
                tithes.map(renderTitheRow)
              ) : (
                dataLoaded && !pagination.loading && renderEmptyState()
              )
            ) : (
              // תצוגה מקובצת
              Object.keys(groupedTithes).length > 0 ? (
                Object.entries(groupedTithes).map(([groupName, groupTithes]) => (
                  <React.Fragment key={groupName}>
                    {/* כותרת הקבוצה */}
                    <tr 
                      className="bg-gray-100 hover:bg-gray-200 cursor-pointer" 
                      onClick={() => onToggleGroup(groupName)}
                    >
                      <td colSpan={5} className="px-3 py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {expandedGroups[groupName] ? (
                              <ChevronDown size={14} className="text-gray-600" />
                            ) : (
                              <ChevronUp size={14} className="text-gray-600" />
                            )}
                            <span className="font-semibold text-gray-800 text-sm">
                              {groupName} ({groupTithes.length})
                            </span>
                          </div>
                          <span className="font-bold text-pink-600 text-sm">
                            {formatCurrency(groupSums[groupName])}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {/* שורות הקבוצה */}
                    {expandedGroups[groupName] && groupTithes.map(renderTitheRow)}
                  </React.Fragment>
                ))
              ) : (
                dataLoaded && !pagination.loading && renderEmptyState()
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Loading indicator */}
      <div 
        ref={loadingRef}
        className="px-3 py-2 border-t border-gray-200 bg-gray-50"
      >
        {pagination.loading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader size={14} className="animate-spin text-pink-600" />
            <span className="text-xs text-gray-600">טוען עוד נתונים...</span>
          </div>
        ) : pagination.hasMore ? (
          <div className="text-center text-xs text-gray-500">
            <div className="mb-1">🔄 גלול למטה לטעינת עוד נתונים</div>
            <div className="text-xs text-gray-400">
              נטענו {tithes.length} מעשרות
              {groupBy !== 'none' && ` (מקובצות לפי ${groupBy === 'month' ? 'חודש' : 'שנה'})`}
            </div>
          </div>
        ) : tithes.length > 0 ? (
          <div className="text-center text-xs text-gray-500">
            ✅ כל הנתונים נטענו ({tithes.length} מעשרות)
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TitheTable;