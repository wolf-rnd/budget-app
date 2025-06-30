import React from 'react';
import { TrendingUp, Calendar, DollarSign, BarChart3 } from 'lucide-react';
import { IncomeSummary as IncomeSummaryType } from '../../services/incomesService';

interface IncomeSummaryProps {
  summary: IncomeSummaryType;
}

const IncomeSummary: React.FC<IncomeSummaryProps> = ({ summary }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="mx-4 mb-3">
      {/* כרטיסי סיכום */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-r-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">סה״כ הכנסות</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(summary.total_income)}</p>
            </div>
            <DollarSign className="text-emerald-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-r-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">ממוצע חודשי</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.monthly_average)}</p>
            </div>
            <BarChart3 className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-r-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">החודש הנוכחי</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(summary.current_month_income)}</p>
            </div>
            <Calendar className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-r-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">שנה עד כה</p>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(summary.year_to_date_income)}</p>
            </div>
            <TrendingUp className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* פירוט לפי מקורות */}
      {summary.income_by_source && summary.income_by_source.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">פירוט לפי מקורות הכנסה</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {summary.income_by_source.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-sm font-medium text-emerald-800">{item.source}</span>
                <span className="text-sm font-bold text-emerald-600">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeSummary;