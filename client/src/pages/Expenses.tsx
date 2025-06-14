import React from 'react';
import { TrendingDown, Filter, Search, Calendar } from 'lucide-react';

const Expenses: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* כותרת העמוד */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown size={28} className="text-expense-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">הוצאות</h1>
              <p className="text-gray-600">ניהול וצפייה בכל ההוצאות</p>
            </div>
          </div>

          {/* כלי סינון וחיפוש */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search size={18} className="absolute right-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="חיפוש הוצאה..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-expense-200 focus:border-expense-400"
              />
            </div>
            
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-expense-200 focus:border-expense-400">
              <option value="">כל הקטגוריות</option>
              <option value="מזון">מזון</option>
              <option value="תחבורה">תחבורה</option>
              <option value="ביגוד">ביגוד</option>
              <option value="דיור">דיור</option>
            </select>

            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-expense-200 focus:border-expense-400">
              <option value="">כל הקופות</option>
              <option value="daily">קופת שוטף</option>
              <option value="annual">תקציב שנתי</option>
              <option value="extended">תקציב מורחב</option>
            </select>

            <div className="relative">
              <Calendar size={18} className="absolute right-3 top-3 text-gray-400" />
              <input
                type="month"
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-expense-200 focus:border-expense-400"
              />
            </div>
          </div>
        </div>

        {/* טבלת הוצאות */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">רשימת הוצאות</h2>
              <button className="bg-expense-500 text-white px-4 py-2 rounded-lg hover:bg-expense-600 transition-colors flex items-center gap-2">
                <TrendingDown size={16} />
                הוספת הוצאה
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תיאור</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">קטגוריה</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">קופה</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סכום</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15/05/2024</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">קניות במכולת</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      מזון
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">קופת שוטף</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-expense-600">₪2,500</td>
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

export default Expenses;