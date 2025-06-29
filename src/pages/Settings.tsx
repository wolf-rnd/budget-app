import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Calendar, Percent, Wallet, Users, Plus, Edit, Trash2, Save, AlertTriangle, Check, Loader } from 'lucide-react';
import { BudgetYear } from '../types';
import { formatBudgetYearName } from '../utils/budgetUtils';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { useNotifications } from '../components/Notifications/NotificationSystem';

// Import services
import { budgetYearsService } from '../services/budgetYearsService';

// Components
import SettingsSection from '../components/Settings/SettingsSection';
import SettingItem from '../components/Settings/SettingItem';
import ConfirmDialog from '../components/Settings/ConfirmDialog';

const Settings: React.FC = () => {
  // System settings hook
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    getSettingValue,
    updateSetting,
    loadSettings
  } = useSystemSettings();

  // Budget years state
  const [budgetYears, setBudgetYears] = useState<BudgetYear[]>([]);
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [newYearStart, setNewYearStart] = useState('');
  const [newYearEnd, setNewYearEnd] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Notifications
  const { addNotification } = useNotifications();

  // Settings state
  const [tithePercentage, setTithePercentage] = useState<number>(10);
  const [defaultCurrency, setDefaultCurrency] = useState<string>('ILS');
  const [surplusFund, setSurplusFund] = useState<string>('surplus');
  const [includedFunds, setIncludedFunds] = useState<Record<string, boolean>>({
    daily: true,
    annual: true,
    extended: true,
    bonus: false
  });

  // Load budget years from API
  useEffect(() => {
    loadBudgetYears();
  }, []);

  // Load settings values
  useEffect(() => {
    if (settings.length > 0) {
      // Load tithe percentage
      const titheValue = getSettingValue('tithe_percentage', 10);
      setTithePercentage(Number(titheValue));

      // Load default currency
      const currencyValue = getSettingValue('default_currency', 'ILS');
      setDefaultCurrency(String(currencyValue));

      // Load surplus fund
      const surplusValue = getSettingValue('surplus_fund', 'surplus');
      setSurplusFund(String(surplusValue));

      // Load included funds
      const includedFundsValue = getSettingValue('included_funds', {
        daily: true,
        annual: true,
        extended: true,
        bonus: false
      });
      
      if (typeof includedFundsValue === 'object') {
        setIncludedFunds(includedFundsValue);
      }
    }
  }, [settings, getSettingValue]);

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
        
        addNotification({
          type: 'success',
          title: 'שנת תקציב נוספה בהצלחה',
          message: `שנת התקציב ${newYear.name} נוספה בהצלחה`
        });
      } catch (error) {
        console.error('Failed to create budget year:', error);
        addNotification({
          type: 'error',
          title: 'שגיאה ביצירת שנת תקציב',
          message: 'אירעה שגיאה בעת יצירת שנת התקציב. נסה שוב.'
        });
      }
    }
  };

  const handleDeleteBudgetYear = async (id: string) => {
    const yearToDelete = budgetYears.find(year => year.id === id);
    if (!yearToDelete) return;

    setConfirmDialog({
      isOpen: true,
      title: 'מחיקת שנת תקציב',
      message: `האם אתה בטוח שברצונך למחוק את שנת התקציב "${yearToDelete.name}"? פעולה זו אינה הפיכה.`,
      onConfirm: async () => {
        try {
          await budgetYearsService.deleteBudgetYear(id);
          setBudgetYears(budgetYears.filter(year => year.id !== id));
          
          addNotification({
            type: 'success',
            title: 'שנת תקציב נמחקה',
            message: `שנת התקציב ${yearToDelete.name} נמחקה בהצלחה`
          });
        } catch (error) {
          console.error('Failed to delete budget year:', error);
          addNotification({
            type: 'error',
            title: 'שגיאה במחיקת שנת תקציב',
            message: 'אירעה שגיאה בעת מחיקת שנת התקציב. נסה שוב.'
          });
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleSetActive = async (id: string) => {
    try {
      await budgetYearsService.activateBudgetYear(id);
      setBudgetYears(budgetYears.map(year => ({
        ...year,
        is_active: year.id === id
      })));
      
      const activatedYear = budgetYears.find(year => year.id === id);
      if (activatedYear) {
        addNotification({
          type: 'success',
          title: 'שנת תקציב הופעלה',
          message: `שנת התקציב ${activatedYear.name} הופעלה בהצלחה`
        });
      }
    } catch (error) {
      console.error('Failed to activate budget year:', error);
      addNotification({
        type: 'error',
        title: 'שגיאה בהפעלת שנת תקציב',
        message: 'אירעה שגיאה בעת הפעלת שנת התקציב. נסה שוב.'
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      
      // שמירת אחוז מעשר
      await updateSetting('tithe_percentage', tithePercentage, 'number');
      
      // שמירת מטבע ברירת מחדל
      await updateSetting('default_currency', defaultCurrency, 'string');
      
      // שמירת קופת עודפים
      await updateSetting('surplus_fund', surplusFund, 'string');
      
      // שמירת קופות כלולות בתקציב
      await updateSetting('included_funds', includedFunds, 'json');
      
      // רענון הגדרות
      await loadSettings();
      
      addNotification({
        type: 'success',
        title: 'הגדרות נשמרו בהצלחה',
        message: 'כל ההגדרות נשמרו בהצלחה'
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      addNotification({
        type: 'error',
        title: 'שגיאה בשמירת הגדרות',
        message: 'אירעה שגיאה בעת שמירת ההגדרות. נסה שוב.'
      });
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading || settingsLoading) {
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

  if (error || settingsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">שגיאה בטעינת ההגדרות</h2>
          <p className="text-red-600 mb-4">{error || settingsError}</p>
          <button
            onClick={() => {
              loadBudgetYears();
              loadSettings();
            }}
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
          <SettingsSection 
            icon={<Calendar size={24} className="text-blue-500" />}
            title="שנות תקציב"
            action={
              <button
                onClick={() => setIsAddingYear(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                הוספת שנת תקציב
              </button>
            }
          >
            {isAddingYear && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-4">הוספת שנת תקציב חדשה</h3>
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
          </SettingsSection>

          {/* הגדרות צדקה */}
          <SettingsSection 
            icon={<Percent size={24} className="text-pink-500" />}
            title="הגדרות צדקה"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingItem
                label="אחוז מעשר"
                description="אחוז המעשר מתוך ההכנסות"
              >
                <div className="relative">
                  <input
                    type="number"
                    value={tithePercentage}
                    onChange={(e) => setTithePercentage(Number(e.target.value))}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                  />
                  <span className="absolute left-3 top-2 text-gray-500">%</span>
                </div>
              </SettingItem>
              
              <SettingItem
                label="מטבע ברירת מחדל"
                description="מטבע לחישוב מעשרות"
              >
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-200 focus:border-pink-400"
                >
                  <option value="ILS">₪ שקל (ILS)</option>
                  <option value="USD">$ דולר (USD)</option>
                  <option value="EUR">€ אירו (EUR)</option>
                </select>
              </SettingItem>
            </div>
          </SettingsSection>

          {/* הגדרות קופות */}
          <SettingsSection 
            icon={<Wallet size={24} className="text-green-500" />}
            title="הגדרות קופות"
          >
            <div className="space-y-4">
              <SettingItem
                label="קופה מקבלת יתרת שוטף"
                description="הקופה שתקבל את היתרה מהשוטף בסוף החודש"
              >
                <select
                  value={surplusFund}
                  onChange={(e) => setSurplusFund(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-400"
                >
                  <option value="surplus">עודפים</option>
                  <option value="bonus">בונוסים</option>
                  <option value="savings">חיסכון</option>
                </select>
              </SettingItem>

              <SettingItem
                label="קופות הנכללות בתקציב"
                description="קופות שיחושבו כחלק מהתקציב הכולל"
              >
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includedFunds.daily}
                      onChange={(e) => setIncludedFunds(prev => ({ ...prev, daily: e.target.checked }))}
                      className="form-checkbox h-5 w-5 text-green-600 ml-2"
                    />
                    <span className="text-sm text-gray-700">קופת שוטף</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includedFunds.annual}
                      onChange={(e) => setIncludedFunds(prev => ({ ...prev, annual: e.target.checked }))}
                      className="form-checkbox h-5 w-5 text-green-600 ml-2"
                    />
                    <span className="text-sm text-gray-700">תקציב שנתי</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includedFunds.extended}
                      onChange={(e) => setIncludedFunds(prev => ({ ...prev, extended: e.target.checked }))}
                      className="form-checkbox h-5 w-5 text-green-600 ml-2"
                    />
                    <span className="text-sm text-gray-700">תקציב מורחב</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includedFunds.bonus}
                      onChange={(e) => setIncludedFunds(prev => ({ ...prev, bonus: e.target.checked }))}
                      className="form-checkbox h-5 w-5 text-green-600 ml-2"
                    />
                    <span className="text-sm text-gray-700">בונוסים</span>
                  </label>
                </div>
              </SettingItem>
            </div>
          </SettingsSection>

          {/* הגדרות רמות קופות */}
          <SettingsSection 
            icon={<Users size={24} className="text-purple-500" />}
            title="רמות תצוגת קופות"
          >
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">הגדרות תצוגה</h4>
                  <p className="text-sm text-yellow-700">
                    הגדרות אלו משפיעות רק על תצוגת הקופות בדשבורד ולא על הפונקציונליות שלהן.
                    שינוי רמת תצוגה של קופה נעשה בעמוד ניהול הקופות.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <SettingItem
                label="שורה ראשונה (רמה 1)"
                description="קופות שיוצגו בשורה הראשונה בדשבורד"
              >
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">קופת שוטף</p>
                </div>
              </SettingItem>

              <SettingItem
                label="שורה שנייה (רמה 2)"
                description="קופות שיוצגו בשורה השנייה בדשבורד"
              >
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">תקציב שנתי, תקציב מורחב</p>
                </div>
              </SettingItem>

              <SettingItem
                label="שורה שלישית (רמה 3)"
                description="קופות שיוצגו בשורה השלישית בדשבורד"
              >
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">בונוסים, עודפים</p>
                </div>
              </SettingItem>
            </div>
          </SettingsSection>

          <div className="flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:bg-blue-300"
            >
              {savingSettings ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <Save size={16} />
                  שמירת הגדרות
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default Settings;