import React from 'react';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react';
import { FilterState, GroupBy } from './types';
import ColorBadge from '../UI/ColorBadge';

interface IncomeFiltersProps {
  filters: FilterState;
  groupBy: GroupBy;
  showFilters: boolean;
  showGroupBy: boolean;
  uniqueSources: (string | undefined)[];
  onFilterChange: (field: keyof FilterState, value: string) => void;
  onGroupByChange: (groupBy: GroupBy) => void;
  onToggleFilters: () => void;
  onToggleGroupBy: () => void;
  onClearFilters: () => void;
  onAddIncome: () => void;
}

const IncomeFilters: React.FC<IncomeFiltersProps> = ({
  filters,
  groupBy,
  showFilters,
  showGroupBy,
  uniqueSources,
  onFilterChange,
  onGroupByChange,
  onToggleFilters,
  onToggleGroupBy,
  onClearFilters,
  onAddIncome
}) => {
  const hasActiveFilters = Object.values(filters).some(value => value);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: '1', label: 'ינואר' },
    { value: '2', label: 'פברואר' },
    { value: '3', label: 'מרץ' },
    { value: '4', label: 'אפריל' },
    { value: '5', label: 'מאי' },
    { value: '6', label: 'יוני' },
    { value: '7', label: 'יולי' },
    { value: '8', label: 'אוגוסט' },
    { value: '9', label: 'ספטמבר' },
    { value: '10', label: 'אוקטובר' },
    { value: '11', label: 'נובמבר' },
    { value: '12', label: 'דצמבר' }
  ];

  return (
    <div className="sticky top-0 z-40 bg-white shadow-md border-b border-gray-200 mx-4 rounded-lg mb-3">
      <div className="p-3">
        {/* כלי בקרה עליונים */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            {/* חיפוש */}
            <div className="relative">
              <Search size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                placeholder="חיפוש..."
                className="pr-8 pl-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 w-40 text-sm"
              />
            </div>

            {/* מקור הכנסה */}
            <select
              value={filters.source}
              onChange={(e) => onFilterChange('source', e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 text-sm w-32"
            >
              <option value="">מקור הכנסה</option>
              {uniqueSources.map(source => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>

            {/* חודש */}
            <select
              value={filters.month}
              onChange={(e) => onFilterChange('month', e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 text-sm w-24"
            >
              <option value="">חודש</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            {/* שנה */}
            <select
              value={filters.year}
              onChange={(e) => onFilterChange('year', e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 text-sm w-20"
            >
              <option value="">שנה</option>
              {years.map(year => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>

            {/* סכום מינימלי */}
            <input
              type="number"
              value={filters.minAmount}
              onChange={(e) => onFilterChange('minAmount', e.target.value)}
              placeholder="מינימום"
              className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 text-sm w-20"
            />

            {/* סכום מקסימלי */}
            <input
              type="number"
              value={filters.maxAmount}
              onChange={(e) => onFilterChange('maxAmount', e.target.value)}
              placeholder="מקסימום"
              className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 text-sm w-20"
            />

            {/* תאריך התחלה */}
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange('startDate', e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 text-sm w-32"
            />

            {/* תאריך סיום */}
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange('endDate', e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-200 focus:border-emerald-400 text-sm w-32"
            />

            {/* כפתור פילטרים מתקדמים */}
            <button
              onClick={onToggleFilters}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md border transition-colors text-sm ${
                showFilters 
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter size={14} />
              פילטרים
            </button>

            {/* כפתור קיבוץ */}
            <div className="relative">
              <button
                onClick={onToggleGroupBy}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md border transition-colors text-sm ${
                  groupBy !== 'none' 
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronDown size={14} />
                קיבוץ
              </button>

              {/* תפריט קיבוץ */}
              {showGroupBy && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                  <div className="p-1">
                    <button
                      onClick={() => onGroupByChange('none')}
                      className={`w-full text-right px-2 py-1.5 rounded-md text-sm transition-colors ${
                        groupBy === 'none' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      ללא קיבוץ
                    </button>
                    <button
                      onClick={() => onGroupByChange('source')}
                      className={`w-full text-right px-2 py-1.5 rounded-md text-sm transition-colors ${
                        groupBy === 'source' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      לפי מקור
                    </button>
                    <button
                      onClick={() => onGroupByChange('month')}
                      className={`w-full text-right px-2 py-1.5 rounded-md text-sm transition-colors ${
                        groupBy === 'month' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      לפי חודש
                    </button>
                    <button
                      onClick={() => onGroupByChange('year')}
                      className={`w-full text-right px-2 py-1.5 rounded-md text-sm transition-colors ${
                        groupBy === 'year' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      לפי שנה
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* כפתור ניקוי פילטרים */}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="px-2 py-1.5 text-xs text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
              >
                נקה
              </button>
            )}
          </div>

          <button
            onClick={onAddIncome}
            className="bg-emerald-500 text-white px-3 py-1.5 rounded-md hover:bg-emerald-600 transition-colors flex items-center gap-1 shadow-md text-sm"
          >
            <Plus size={14} />
            הוספה
          </button>
        </div>

        {/* פילטרים מתקדמים */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                פילטרים מתקדמים - כל הפילטרים כבר זמינים בשורה העליונה
              </div>
              <button
                onClick={onToggleFilters}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
              >
                סגור פילטרים
              </button>
            </div>
          </div>
        )}

        {/* סיכום פילטרים פעילים */}
        {(hasActiveFilters || groupBy !== 'none') && (
          <div className="mt-2 p-2 bg-gray-100 rounded-md border border-gray-200">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-600">פעיל:</span>
              {filters.source && (
                <ColorBadge color="#10b981" size="sm">
                  {filters.source}
                </ColorBadge>
              )}
              {filters.month && (
                <ColorBadge color="#3b82f6" size="sm">
                  חודש {filters.month}
                </ColorBadge>
              )}
              {filters.year && (
                <ColorBadge color="#8b5cf6" size="sm">
                  {filters.year}
                </ColorBadge>
              )}
              {filters.search && (
                <ColorBadge color="#6b7280" size="sm">
                  "{filters.search}"
                </ColorBadge>
              )}
              {(filters.minAmount || filters.maxAmount) && (
                <ColorBadge color="#f59e0b" size="sm">
                  סכום: {filters.minAmount || '0'}-{filters.maxAmount || '∞'}
                </ColorBadge>
              )}
              {(filters.startDate || filters.endDate) && (
                <ColorBadge color="#06b6d4" size="sm">
                  תאריך: {filters.startDate || '...'} - {filters.endDate || '...'}
                </ColorBadge>
              )}
              {groupBy !== 'none' && (
                <ColorBadge color="#10b981" size="sm">
                  קיבוץ: {groupBy === 'source' ? 'מקור' : groupBy === 'month' ? 'חודש' : 'שנה'}
                </ColorBadge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeFilters;