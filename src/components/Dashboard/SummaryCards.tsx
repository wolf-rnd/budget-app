import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';

interface SummaryCardsProps {
  totalBudget: number;
  totalIncome: number;
  totalExpenses: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalBudget,
  totalIncome,
  totalExpenses
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const balance = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* תקציב כולל */}
      <div className="bg-white rounded-lg shadow-sm p-3 border-r-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">תקציב כולל</p>
            <p className="text-sm font-semibold text-blue-600">{formatCurrency(totalBudget)}</p>
          </div>
          <DollarSign className="text-blue-500" size={18} />
        </div>
      </div>

      {/* הכנסות */}
      <div className="bg-white rounded-lg shadow-sm p-3 border-r-4 border-emerald-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">הכנסות</p>
            <p className="text-sm font-semibold text-emerald-600">{formatCurrency(totalIncome)}</p>
          </div>
          <TrendingUp className="text-emerald-500" size={18} />
        </div>
      </div>

      {/* הוצאות */}
      <div className="bg-white rounded-lg shadow-sm p-3 border-r-4 border-amber-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">הוצאות</p>
            <p className="text-sm font-semibold text-amber-600">{formatCurrency(totalExpenses)}</p>
          </div>
          <TrendingDown className="text-amber-500" size={18} />
        </div>
      </div>

      {/* איזון */}
      <div className={`bg-white rounded-lg shadow-sm p-3 border-r-4 ${
        balance >= 0 ? 'border-gray-400' : 'border-red-500'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">איזון</p>
            <p className={`text-sm font-semibold ${
              balance >= 0 ? 'text-gray-700' : 'text-red-600'
            }`}>
              {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
            </p>
          </div>
          <CreditCard className={
            balance >= 0 ? 'text-gray-500' : 'text-red-500'
          } size={18} />
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;