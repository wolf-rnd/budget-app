import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';

interface BudgetChartProps {
  totalBudget: number;
  totalIncome: number;
  totalExpenses: number;
  budgetYearMonths?: number; // מספר החודשים בשנת התקציב
}

const BudgetChart: React.FC<BudgetChartProps> = ({ 
  totalBudget, 
  totalIncome, 
  totalExpenses,
  budgetYearMonths = 12 // ברירת מחדל 12 חודשים
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const barsData = [
    {
      name: 'הכנסות',
      value: totalIncome,
      type: 'income'
    },
    {
      name: 'הוצאות', 
      value: totalExpenses,
      type: 'expense'
    }
  ];

  // חישוב סכום חודשי דינמי לפי מספר החודשים בשנת התקציב
  const monthlyAmount = totalBudget / budgetYearMonths;

  const CustomBarsTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalBudget) * 100).toFixed(1);
      const color = data.type === 'income' ? '#10b981' : '#f59e0b';
      
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color }}>
              {data.name}
            </p>
            <p className="text-lg font-bold" style={{ color }}>
              {formatCurrency(data.value)}
            </p>
            <p className="text-xs text-gray-500">
              {percentage}% מהתקציב
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const balance = totalIncome - totalExpenses;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 h-full">
      <div className="flex items-center justify-center gap-3 mb-6">
        <BarChart3 size={24} className="text-gray-600" />
        <h3 className="text-xl font-bold text-gray-800">הכנסות מול הוצאות</h3>
      </div>
      
      <div className="bg-gray-50 rounded-xl p-6 shadow-sm flex-1 mb-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={barsData} 
            margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
            barCategoryGap="20%"
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#059669" stopOpacity={0.7}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#d97706" stopOpacity={0.7}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="2 2" 
              stroke="#cbd5e1" 
              strokeOpacity={0.6}
            />
            
            <XAxis 
              dataKey="name"
              tick={{ fontSize: 12, fill: '#475569' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }}
            />
            
            <YAxis 
              tick={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }}
              domain={[0, totalBudget]}
            />
            
            <Tooltip 
              content={<CustomBarsTooltip />}
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            />
            
            {/* קווי ייחוס דינמיים לפי מספר החודשים */}
            {Array.from({ length: budgetYearMonths }, (_, index) => {
              const monthNumber = index + 1;
              const value = monthlyAmount * monthNumber;
              const monthStr = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;
              
              return (
                <ReferenceLine 
                  key={monthNumber}
                  y={value} 
                  stroke="#6366f1" 
                  strokeDasharray="3 3" 
                  strokeWidth={1}
                  strokeOpacity={0.7}
                  label={{ 
                    value: `חודש ${monthStr}`, 
                    position: "insideTopLeft", 
                    fill: "#6366f1", 
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}
                />
              );
            })}
            
            <Bar 
              dataKey="value" 
              radius={[8, 8, 0, 0]}
              strokeWidth={2}
            >
              {barsData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.type === 'income' ? 'url(#incomeGradient)' : 'url(#expenseGradient)'}
                  stroke={entry.type === 'income' ? '#10b981' : '#f59e0b'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="text-sm font-bold text-gray-700 mb-3 text-center">סיכום תקציב</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg shadow-sm p-3 border-r-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">תקציב כולל</p>
                <p className="text-sm font-semibold text-blue-600">{formatCurrency(totalBudget)}</p>
                <p className="text-xs text-gray-400">{budgetYearMonths} חודשים</p>
              </div>
              <DollarSign className="text-blue-500" size={18} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3 border-r-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">הכנסות</p>
                <p className="text-sm font-semibold text-emerald-600">{formatCurrency(totalIncome)}</p>
              </div>
              <TrendingUp className="text-emerald-500" size={18} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-3 border-r-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">הוצאות</p>
                <p className="text-sm font-semibold text-amber-600">{formatCurrency(totalExpenses)}</p>
              </div>
              <TrendingDown className="text-amber-500" size={18} />
            </div>
          </div>

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
      </div>
    </div>
  );
};

export default BudgetChart;