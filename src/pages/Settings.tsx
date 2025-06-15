import React from 'react';
import { Settings as SettingsIcon, Calendar, Percent, Wallet, Users } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* כותרת העמוד */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon size={28} className="text-gray-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">הגדרות מערכת</h1>
              <p className="text-gray-600">הגדרות כלליות ותצורת המערכת</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* הגדרות שנת תקציב */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar size={24} className="text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-800">שנת תקציב</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  תחילת שנת תקציב
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400">
                  <option value="1">ינואר</option>
                  <option value="4">אפריל</option>
                  <option value="7">יולי</option>
                  <option value="10">אוקטובר</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שנת תקציב נוכחית
                </label>
                <input
                  type="number"
                  value="2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          {/* הגדרות צדקה */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Percent size={24} className="text-pink-500" />
              <h2 className="text-lg font-semibold text-gray-800">הגדרות צדקה</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  אחוז מעשר
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value="10"
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                  />
                  <span className="absolute left-3 top-2 text-gray-500">%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  תאריך תחילת שינוי
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
          </div>

          {/* הגדרות קופות */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wallet size={24} className="text-green-500" />
              <h2 className="text-lg font-semibold text-gray-800">הגדרות קופות</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  קופה מקבלת יתרת שוטף
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-400">
                  <option value="surplus">עודפים</option>
                  <option value="bonus">בונוסים</option>
                  <option value="savings">חיסכון</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  קופות הנכללות בתקציב
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" checked className="ml-2" />
                    <span className="text-sm text-gray-700">קופת שוטף</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked className="ml-2" />
                    <span className="text-sm text-gray-700">תקציב שנתי</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked className="ml-2" />
                    <span className="text-sm text-gray-700">תקציב מורחב</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="ml-2" />
                    <span className="text-sm text-gray-700">בונוסים</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* הגדרות רמות קופות */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users size={24} className="text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-800">רמות תצוגת קופות</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שורה ראשונה (רמה 1)
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-400">
                  <option value="daily">קופת שוטף</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שורה שנייה (רמה 2)
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" checked className="ml-2" />
                    <span className="text-sm text-gray-700">תקציב שנתי</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked className="ml-2" />
                    <span className="text-sm text-gray-700">תקציב מורחב</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שורה שלישית (רמה 3)
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" checked className="ml-2" />
                    <span className="text-sm text-gray-700">בונוסים</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked className="ml-2" />
                    <span className="text-sm text-gray-700">עודפים</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* כפתור שמירה */}
          <div className="flex justify-end">
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              שמירת הגדרות
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;