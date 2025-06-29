import React from 'react';
import { Heart, Target, TrendingUp, DollarSign } from 'lucide-react';
import { TitheSummary as TitheSummaryType } from '../../services/titheService';

interface TitheSummaryProps {
  summary: TitheSummaryType;
}

const TitheSummary: React.FC<TitheSummaryProps> = ({ summary }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const completionPercentage = summary.total_required > 0 
    ? Math.round((summary.total_given / summary.total_required) * 100)
    : 0;

  return (
    <div className="mx-4 mb-3">
      {/* כרטיסי סיכום */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-r-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">סה״כ הכנסות</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.total_income)}</p>
              <p className="text-xs text-gray-400">{summary.tithe_percentage}% מעשר</p>
            </div>
            <DollarSign className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-r-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">מעשר לתת</p>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(summary.total_required)}</p>
            </div>
            <Target className="text-orange-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-r-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">נתרם</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(summary.total_given)}</p>
            </div>
            <TrendingUp className="text-emerald-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border-r-4 border-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">נותר לתת</p>
              <p className={`text-xl font-bold ${
                summary.total_remaining > 0 ? 'text-pink-600' : 'text-emerald-600'
              }`}>
                {formatCurrency(Math.max(0, summary.total_remaining))}
              </p>
            </div>
            <Heart className="text-pink-500" size={24} />
          </div>
        </div>
      </div>

      {/* פס התקדמות */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">התקדמות מעשר</h3>
          <span className="text-sm font-bold text-gray-600">{completionPercentage}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              completionPercentage >= 100 
                ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                : 'bg-gradient-to-r from-pink-500 to-rose-500'
            }`}
            style={{ width: `${Math.min(completionPercentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-600">
          <span>נתרם: {formatCurrency(summary.total_given)}</span>
          <span>יעד: {formatCurrency(summary.total_required)}</span>
        </div>
      </div>

      {/* מעשרות אחרונים */}
      {summary.recent_tithes && summary.recent_tithes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">מעשרות אחרונים</h3>
          <div className="space-y-2">
            {summary.recent_tithes.slice(0, 3).map((tithe, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border border-pink-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-pink-800 truncate">{tithe.description}</p>
                  <p className="text-xs text-pink-600">
                    {new Date(tithe.date).toLocaleDateString('he-IL')}
                  </p>
                </div>
                <span className="text-sm font-bold text-pink-700 flex-shrink-0">
                  {formatCurrency(tithe.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TitheSummary;