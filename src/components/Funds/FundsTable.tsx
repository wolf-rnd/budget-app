import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import { GetFundRequest } from '../../services/fundsService';
import { GetCategoryRequest } from '../../services/categoriesService';
import { BudgetYear } from '../../services/budgetYearsService';
import FundRow from './FundRow';

interface FundsTableProps {
  funds: GetFundRequest[];
  categories: GetCategoryRequest[];
  budgetYears: BudgetYear[];
  onEditFund: (id: string) => void;
  onDeleteFund: (id: string) => void;
  onActivateFund: (id: string) => void;
  onDeactivateFund: (id: string) => void;
  onUpdateBudget: (fundId: string, budgetYearId: string, amount: number) => void;
}

const FundsTable: React.FC<FundsTableProps> = ({
  funds,
  categories,
  budgetYears,
  onEditFund,
  onDeleteFund,
  onActivateFund,
  onDeactivateFund,
  onUpdateBudget
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'type' | 'amount'>('level');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: 'name' | 'level' | 'type' | 'amount') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const sortedFunds = [...funds].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];

    if (sortBy === 'name') {
      aValue = aValue?.toLowerCase() || '';
      bValue = bValue?.toLowerCase() || '';
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mx-4">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Wallet size={20} />
          רשימת קופות ({funds.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                שם קופה {getSortIcon('name')}
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('type')}
              >
                סוג {getSortIcon('type')}
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amount')}
              >
                תקציב {getSortIcon('amount')}
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('level')}
              >
                רמה {getSortIcon('level')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                בתקציב
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                הוצאות
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ניתן
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                קטגוריות
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                סטטוס
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                פעולות
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedFunds.length > 0 ? (
              sortedFunds.map(fund => (
                <FundRow
                  key={fund.id}
                  fund={fund}
                  categories={categories}
                  budgetYears={budgetYears}
                  onEdit={onEditFund}
                  onDelete={onDeleteFund}
                  onActivate={onActivateFund}
                  onDeactivate={onDeactivateFund}
                  onUpdateBudget={onUpdateBudget}
                />
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Wallet size={48} className="text-gray-300" />
                    <p className="text-lg font-medium">אין קופות להצגה</p>
                    <p className="text-sm">לחץ על "הוספת קופה חדשה" כדי להתחיל</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FundsTable;