import React from 'react';
import { TrendingUp, Plus, Calendar } from 'lucide-react';

const Income: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* כותרת העמוד */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={28} className="text-income-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">הכנסות</h1>
              <p className="text-gray-600">ניהול וצפייה בכל ההכנסות</p>
            </div>
          </div>

          {/* כלי סינון */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-income-200 focus:border-income-400">
              <option value="">כל השנים</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>

            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-income-200 focus:border-income-400">
              <option value="">כל החודשים</option>
              <option value="1">ינואר</option>
              <option value="2">פברואר</option>
              <option value="3">מרץ</option>
              <option value="4">אפריל</option>
              <option value="5">מאי</option>
            </select>

            <button className="bg-income-500 text-white px-4 py-2 rounded-lg hover:bg-income-600 transition-colors flex items-center gap-2">
              <Plus size={16} />
              הוספת הכנסה
            </button>
          </div>
        </div>

        {/* סיכום הכנסות */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">הכנסות החודש</p>
                <p className="text-2xl font-bold text-income-600">₪18,000</p>
              </div>
              <TrendingUp className="text-income-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">הכנסות השנה</p>
                <p className="text-2xl font-bold text-income-600">₪85,000</p>
              </div>
              <Calendar className="text-income-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">ממוצע חודשי</p>
                <p className="text-2xl font-bold text-income-600">₪17,000</p>
              </div>
              <TrendingUp className="text-income-500" size={32} />
            </div>
          </div>
        </div>

        {/* טבלת הכנסות */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">רשימת הכנסות</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">שם</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">חודש</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">שנה</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סכום</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">01/05/2024</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">משכורת ראשית</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">מאי</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-income-600">₪12,000</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900 ml-2">עריכה</button>
                    <button className="text-red-600 hover:text-red-900">מחיקה</button>
                  </td>
                </tr>
                {/* עוד שורות... */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Income;