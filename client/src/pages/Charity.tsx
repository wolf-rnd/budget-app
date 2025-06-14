import React from 'react';
import { Heart, Plus, TrendingUp, Target } from 'lucide-react';

const Charity: React.FC = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* כותרת העמוד */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart size={28} className="text-pink-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">צדקה ומעשרות</h1>
              <p className="text-gray-600">מעקב אחר מעשרות וצדקה שניתנה</p>
            </div>
          </div>
        </div>

        {/* סיכום מעשרות */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">סה״כ הכנסות</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(85000)}</p>
              </div>
              <TrendingUp className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">מעשר לתת (10%)</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(8500)}</p>
              </div>
              <Target className="text-orange-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">נתרם</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(1500)}</p>
              </div>
              <Heart className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">נותר לתת</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(7000)}</p>
              </div>
              <Target className="text-red-500" size={24} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* גריד הכנסות */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">הכנסות</h2>
                <button className="bg-income-500 text-white px-4 py-2 rounded-lg hover:bg-income-600 transition-colors flex items-center gap-2">
                  <Plus size={16} />
                  הוספת הכנסה
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">שם</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סכום</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">01/05/2024</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">משכורת ראשית</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-income-600">₪12,000</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">01/05/2024</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">משכורת שנייה</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-income-600">₪6,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* גריד צדקה שניתנה */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">צדקה שניתנה</h2>
                <button className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2">
                  <Plus size={16} />
                  הוספת מעשר
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תיאור</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סכום</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">01/05/2024</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">תרומה למוסד חינוך</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pink-600">₪1,000</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">20/04/2024</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">עזרה למשפחה</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pink-600">₪500</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charity;