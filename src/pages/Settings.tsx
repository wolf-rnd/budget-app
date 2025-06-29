import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Calendar, Percent, Wallet, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { BudgetYear } from '../types';
import { formatBudgetYearName } from '../utils/budgetUtils';

// Import services instead of JSON data
import { budgetYearsService } from '../services/budgetYearsService';

const Settings: React.FC = () => {
  const [budgetYears, setBudgetYears] = useState<BudgetYear[]>([]);
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [newYearStart, setNewYearStart] = useState('');
  const [newYearEnd, setNewYearEnd] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load budget years from API
  useEffect(() => {
    loadBudgetYears();
  }, []);

  const loadBudgetYears = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await budgetYearsService.getAllBudgetYears();
      setBudgetYears(data);
    } catch (err) {
      console.error('Failed to load budget years:', err);
      setError('שגיאה בטעינת שנות התקציב');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudgetYear = async () => {
    if (newYearStart && newYearEnd) {
      try {
        const budgetYearData = {
          name: formatBudgetYearName(newYearStart, newYearEnd),
          start_date: newYearStart,
          end_date: newYearEnd
        };

        const newYear = await budgetYearsService.createBudgetYear(budgetYearData);
        setBudgetYears([...budgetYears, newYear]);
        setNewYearStart('');
        setNewYearEnd('');
        setIsAddingYear(false);
      } catch (error) {
        console.error('Failed to create budget year:', error);
      }
    }
  };

  const handleDeleteBudgetYear = async (id: string) => {
    try {
      await budgetYearsService.deleteBudgetYear(id);
      setBudgetYears(budgetYears.filter(year => year.id !== id));
    } catch (error) {
      console.error('Failed to delete budget year:', error);
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await budgetYearsService.activateBudgetYear(id);
      setBudgetYears(budgetYears.map(year => ({
        ...year,
        isActive: year.id === id
      })));
    } catch (error) {
      console.error('Failed to activate budget year:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">טוען הגדרות...</h2>
          <p className="text-gray-600">אנא המתן בזמן טעינת הנתונים מהשרת</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">שגיאה בטעינת ההגדרות</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadBudgetYears}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

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
                  year.is_active 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{year.name}</h3>
                        {year.is_active && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                            פעיל
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(year.start_date).toLocaleDateString('he-IL')} - {new Date(year.end_date).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      {!year.is_active && (
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
                        disabled={year.is_active}
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