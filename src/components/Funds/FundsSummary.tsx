import React from 'react';
import { Wallet, TrendingUp, Target, DollarSign } from 'lucide-react';
import { GetFundRequest } from '../../services/fundsService';

interface FundsSummaryProps {
  funds: GetFundRequest[];
}

const FundsSummary: React.FC<FundsSummaryProps> = ({ funds }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // חישוב סטטיסטיקות
  const totalFunds = funds.length;
  const totalBudget = funds
    .filter(fund => fund.include_in_budget)
    .reduce((sum, fund) => sum + (fund.amount || 0), 0);
  const totalSpent = funds.reduce((sum, fund) => sum + (fund.spent || 0), 0);
  const totalGiven = funds.reduce((sum, fund) => sum + (fund.amount_given || 0), 0);

  const fundsByLevel = {
    level1: funds.filter(fund => fund.level === 1).length,
    level2: funds.filter(fund => fund.level === 2).length,
    level3: funds.filter(fund => fund.level === 3).length
  };

  const fundsByType = {
    monthly: funds.filter(fund => fund.type === 'monthly').length,
    annual: funds.filter(fund => fund.type === 'annual').length,
    savings: funds.filter(fund => fund.type === 'savings').length
  };

  return (
    <div className="mx-4 mb-6">
      {/* כרטיסי סיכום ראשיים */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border-r-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">סה״כ קופות</p>
              <p className="text-xl font-bold text-blue-600">{totalFunds}</p>
            </div>
            <Wallet className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-r-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">תקציב כולל</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalBudget)}</p>
            </div>
            <DollarSign className="text-emerald-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-r-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">סה״כ הוצאות</p>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(totalSpent)}</p>
            </div>
            <TrendingUp className="text-orange-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-r-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">סה״כ ניתן</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(totalGiven)}</p>
            </div>
            <Target className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* פירוט לפי רמות וסוגים */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* פירוט לפי רמות */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">פירוט לפי רמות</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
              <span className="text-sm font-medium text-emerald-800">רמה 1 (שוטף)</span>
              <span className="text-sm font-bold text-emerald-600">{fundsByLevel.level1} קופות</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-800">רמה 2 (שנתי)</span>
              <span className="text-sm font-bold text-blue-600">{fundsByLevel.level2} קופות</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-yellow-800">רמה 3 (עודפים)</span>
              <span className="text-sm font-bold text-yellow-600">{fundsByLevel.level3} קופות</span>
            </div>
          </div>
        </div>

        {/* פירוט לפי סוגים */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">פירוט לפי סוגים</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-800">חודשי</span>
              <span className="text-sm font-bold text-green-600">{fundsByType.monthly} קופות</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-indigo-50 rounded-lg">
              <span className="text-sm font-medium text-indigo-800">שנתי</span>
              <span className="text-sm font-bold text-indigo-600">{fundsByType.annual} קופות</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-purple-800">חיסכון</span>
              <span className="text-sm font-bold text-purple-600">{fundsByType.savings} קופות</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundsSummary;