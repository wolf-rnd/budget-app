import React, { useState } from 'react';
import { Settings as SettingsIcon, Calendar, Percent, Wallet, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { BudgetYear } from '../types';
import { formatBudgetYearName } from '../utils/budgetUtils';

import budgetYearsData from '../data/budgetYears.json';

const Settings: React.FC = () => {
  const [budgetYears, setBudgetYears] = useState<BudgetYear[]>(budgetYearsData.budgetYears);
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [newYearStart, setNewYearStart] = useState('');
  const [newYearEnd, setNewYearEnd] = useState('');

  const handleAddBudgetYear = () => {
    if (newYearStart && newYearEnd) {
      const newYear: BudgetYear = {
        id: Date.now().toString(),
        name: formatBudgetYearName(newYearStart, newYearEnd),
        startDate: newYearStart,
        endDate: newYearEnd,
        isActive: false
      };

      setBudgetYears([...budgetYears, newYear]);
      setNewYearStart('');
      setNewYearEnd('');
      setIsAddingYear(false);
    }
  };

  const handleDeleteBudgetYear = (id: string) => {
    setBudgetYears(budgetYears.filter(year => year.id !== id));
  };

  const handleSetActive = (id: string) => {
    setBudgetYears(budgetYears.map(year => ({
      ...year,
      isActive: year.id === id
    })));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
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
          {/* הגדרות שנות תקציב */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar size={24} className="text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-800">שנות תקציב</h2>
              </div>
              <button
                onClick={() => setIsAddingYear(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                הוספת שנת תקציב
              </button>
            </div>

            {isAddingYear && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-md font-semibold text-blue-800 mb-4">הוספת שנת תקציב חדשה</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      תחילת שנת תקציב
                    </label>
                    <input
                      type="date"
                      value={newYearStart}
                      onChange={(e) => setNewYearStart(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      סוף שנת תקציב
                    </label>
                    <input
                      type="date"
                      value={newYearEnd}
                      onChange={(e) => setNewYearEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    />
                  </div>
                </div>

                {newYearStart && newYearEnd && (
                  <div className="mb-4 p-3 bg-white rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      <strong>שם שנת התקציב:</strong> {formatBudgetYearName(newYearStart, newYearEnd)}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleAddBudgetYear}
                    disabled={!newYearStart || !newYearEnd}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    הוספה
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingYear(false);
                      setNewYearStart('');
                      setNewYearEnd('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    ביטול
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {budgetYears.map(year => (
                <div key={year.id} className={`p-4 rounded-lg border-2 ${
                  year.isActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{year.name}</h3>
                        {year.isActive && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                            פעיל
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(year.startDate).toLocaleDateString('he-IL')} - {new Date(year.endDate).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {!year.isActive && (
                        <button
                          onClick={() => handleSetActive(year.id)}
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        >
                          הפעל
                        </button>
                      )}
                      <button
                        onClick={() => console.log('עריכה:', year.id)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
                        title="עריכה"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteBudgetYear(year.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                        title="מחיקה"
                        disabled={year.isActive}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
                    defaultValue="10"
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
                    <input type="checkbox" defaultChecked className="ml-2" />
                    <span className="text-sm text-gray-700">קופת שוטף</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="ml-2" />
                    <span className="text-sm text-gray-700">תקציב שנתי</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="ml-2" />
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
                    <input type="checkbox" defaultChecked className="ml-2" />
                    <span className="text-sm text-gray-700">תקציב שנתי</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="ml-2" />
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
                    <input type="checkbox" defaultChecked className="ml-2" />
                    <span className="text-sm text-gray-700">בונוסים</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="ml-2" />
                    <span className="text-sm text-gray-700">עודפים</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

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