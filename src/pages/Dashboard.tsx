import React, { useState, useEffect } from 'react';
import { Fund, Income, Expense, TitheGiven, Debt, Task, AssetSnapshot, Category, BudgetYear, FundBudget } from '../types';
import TopActions from '../components/Dashboard/TopActions';

import BudgetChart from '../components/Dashboard/BudgetChart';
import FundsGrid from '../components/Dashboard/FundsGrid';
import TitheSection from '../components/Dashboard/TitheSection';
import DebtsSection from '../components/Dashboard/DebtsSection';
import TasksSection from '../components/Dashboard/TasksSection';
import AssetsSection from '../components/Dashboard/AssetsSection';
import QuickAddButtons from '../components/Dashboard/QuickAddButtons';
import IncomeModal from '../components/Modals/IncomeModal';
import ExpenseModal from '../components/Modals/ExpenseModal';

import { 
  getActiveBudgetYear, 
  getLatestBudgetYear, 
  filterIncomesByBudgetYear, 
  filterExpensesByBudgetYear,
  getAllIncomesForTithe,
  calculateBudgetYearMonths,
  getBudgetYearByDate
} from '../utils/budgetUtils';

import { ENV } from '../config/env';

// Import services instead of JSON data
import { budgetYearsService } from '../services/budgetYearsService';
import { incomesService } from '../services/incomesService';
import { expensesService } from '../services/expensesService';
import { titheService } from '../services/titheService';
import { debtsService } from '../services/debtsService';
import { tasksService } from '../services/tasksService';
import { assetsService } from '../services/assetsService';
import { categoriesService } from '../services/categoriesService';
import { fundsService } from '../services/fundsService';

const Dashboard: React.FC = () => {
  // State management
  const [budgetYears, setBudgetYears] = useState<BudgetYear[]>([]);
  const [selectedBudgetYear, setSelectedBudgetYear] = useState<BudgetYear | null>(null);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [titheGiven, setTitheGiven] = useState<TitheGiven[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assetSnapshots, setAssetSnapshots] = useState<AssetSnapshot[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState<number>(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'connected' | 'fallback' | 'error'>('connected');
  const [userMessage, setUserMessage] = useState<string | null>(null);

  // Load all data from API
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      setUserMessage(null);
      setApiStatus('connected');

      // טעינת כל הנתונים במקביל
      const [
        budgetYearsData,
        fundsData,
        incomesData,
        expensesData,
        titheData,
        debtsData,
        tasksData,
        assetsData,
        categoriesData
      ] = await Promise.all([
        budgetYearsService.getAllBudgetYears().catch(err => {
          console.warn('Budget years service failed, using fallback');
          setApiStatus('fallback');
          return [];
        }),
        fundsService.getAllFunds().catch(err => {
          console.warn('Funds service failed, using fallback');
          return [];
        }),
        incomesService.getAllIncomes().catch(err => {
          console.warn('Incomes service failed, using fallback');
          return [];
        }),
        expensesService.getAllExpenses().catch(err => {
          console.warn('Expenses service failed, using fallback');
          return [];
        }),
        titheService.getAllTithes().catch(err => {
          console.warn('Tithe service failed, using fallback');
          return [];
        }),
        debtsService.getAllDebts().catch(err => {
          console.warn('Debts service failed, using fallback');
          return [];
        }),
        tasksService.getAllTasks().catch(err => {
          console.warn('Tasks service failed, using fallback');
          return [];
        }),
        assetsService.getAllAssetSnapshots().catch(err => {
          console.warn('Assets service failed, using fallback');
          return [];
        }),
        categoriesService.getAllCategories().catch(err => {
          console.warn('Categories service failed, using fallback');
          return [];
        })
      ]);

      if (ENV.DEV_MODE) {
        console.log('Loaded data:', {
          budgetYears: budgetYearsData.length,
          funds: fundsData.length,
          incomes: incomesData.length,
          expenses: expensesData.length,
          tithes: titheData.length,
          debts: debtsData.length,
          tasks: tasksData.length,
          assets: assetsData.length,
          categories: categoriesData.length
        });
      }

      // Ensure budgetYearsData is an array
      const years = Array.isArray(budgetYearsData)
        ? budgetYearsData
        : (budgetYearsData && Array.isArray(budgetYearsData.data))
          ? budgetYearsData.data
          : [];

      if (years.length === 0) {
        setApiStatus('fallback');
        if (ENV.DEV_MODE) {
          console.warn('No budget years available, application will run with limited functionality');
        }
      }

      setBudgetYears(years);
      setFunds(fundsData);
      setIncomes(incomesData);
      setExpenses(expensesData);
      setTitheGiven(titheData);
      setDebts(debtsData);
      setTasks(tasksData);
      setAssetSnapshots(assetsData);
      setCategories(categoriesData);

      // הגדרת שנת תקציב ראשונית
      const savedBudgetYearId = localStorage.getItem('selectedBudgetYearId');
      let initialBudgetYear: BudgetYear | null = null;

      if (savedBudgetYearId && Array.isArray(years)) {
        initialBudgetYear = years.find(year => year.id === savedBudgetYearId) || null;
      }

      if (!initialBudgetYear && Array.isArray(years)) {
        initialBudgetYear = getActiveBudgetYear(years) || getLatestBudgetYear(years);
      }

      setSelectedBudgetYear(initialBudgetYear);

    } catch (err) {
      if (ENV.DEV_MODE) {
        console.error('Failed to load dashboard data:', err);
      }
      setError('שגיאה בטעינת נתוני הדשבורד - האפליקציה פועלת במצב מוגבל');
      setApiStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Save selected budget year to localStorage
  useEffect(() => {
    if (selectedBudgetYear) {
      localStorage.setItem('selectedBudgetYearId', selectedBudgetYear.id);
    }
  }, [selectedBudgetYear]);

  // Auto-hide user messages after 5 seconds
  useEffect(() => {
    if (userMessage) {
      const timer = setTimeout(() => {
        setUserMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [userMessage]);

  // Calculate data based on selected budget year
  const currentBudgetYearIncomes = selectedBudgetYear ? filterIncomesByBudgetYear(incomes, selectedBudgetYear) : [];
  const currentBudgetYearExpenses = selectedBudgetYear ? filterExpensesByBudgetYear(expenses, selectedBudgetYear) : [];
  const allIncomesForTithe = getAllIncomesForTithe(incomes);

  // Calculate totals
  const totalBudget = funds
    .filter(fund => fund.includeInBudget)
    .reduce((sum, fund) => {
      return sum + (fund.type === 'monthly' ? fund.amount * 12 : fund.amount);
    }, 0);
  
  const totalIncome = currentBudgetYearIncomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = currentBudgetYearExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncomesForTithe = allIncomesForTithe.reduce((sum, income) => sum + income.amount, 0);

  // Handlers
  const handleBudgetYearChange = (budgetYear: BudgetYear) => {
    setSelectedBudgetYear(budgetYear);
  };

  const handleAddExpense = () => {
    setIsExpenseModalOpen(true);
  };

  const handleAddIncome = () => {
    setIsIncomeModalOpen(true);
  };

  const handleIncomeModalSubmit = async (newIncome: {
    name: string;
    amount: number;
    date: string;
    source?: string;
    note?: string;
  }) => {
    try {
      const incomeData = {
        name: newIncome.name,
        amount: newIncome.amount,
        month: new Date(newIncome.date).getMonth() + 1,
        year: new Date(newIncome.date).getFullYear(),
        date: newIncome.date,
        source: newIncome.source,
        note: newIncome.note
      };

      const createdIncome = await incomesService.createIncome(incomeData);
      setIncomes([...incomes, createdIncome]);
      setUserMessage('הכנסה חדשה נוספה בהצלחה');
      if (ENV.DEV_MODE) {
        console.log('הכנסה חדשה נוספה:', createdIncome);
      }
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to create income:', error);
      }
      setUserMessage('שגיאה ביצירת הכנסה - נשמר במצב מקומי');
    }
  };

  const handleExpenseModalSubmit = async (newExpense: {
    name: string;
    amount: number;
    category: string;
    fund: string;
    date: string;
    note?: string;
  }) => {
    try {
      const createdExpense = await expensesService.createExpense(newExpense);
      setExpenses([...expenses, createdExpense]);
      
      // Check if this is a mock expense (API failed but fallback worked)
      if (createdExpense.id.startsWith('mock-')) {
        setUserMessage('הוצאה נוספה במצב מקומי - השרת אינו זמין');
      } else {
        setUserMessage('הוצאה חדשה נוספה בהצלחה');
      }
      
      if (ENV.DEV_MODE) {
        console.log('הוצאה חדשה נוספה:', createdExpense);
      }
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to create expense:', error);
      }
      setUserMessage('שגיאה ביצירת הוצאה - אנא נסה שוב מאוחר יותר');
    }
  };

  const handleCloseDailyFund = async (remainingAmount: number) => {
    if (!selectedBudgetYear) return;

    try {
      // כאן נוכל להוסיף קריאה ל-API לעדכון הקופות
      if (ENV.DEV_MODE) {
        console.log(`סגירת חודש: ${remainingAmount} ש"ח נותר במעטפה`);
      }
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to close daily fund:', error);
      }
    }
  };

  const handleAddMoneyToEnvelope = async (amount: number) => {
    if (!selectedBudgetYear) return;

    try {
      // כאן נוכל להוסיף קריאה ל-API לעדכון הקופות
      if (ENV.DEV_MODE) {
        console.log(`נוסף ${amount} ש"ח למעטפה בחודש ${getMonthName(currentDisplayMonth)}`);
      }
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to add money to envelope:', error);
      }
    }
  };

  const handleAddTithe = async (amount: number, description: string) => {
    try {
      const titheData = {
        description,
        amount,
        note: '',
        date: new Date().toISOString().split('T')[0]
      };

      const createdTithe = await titheService.createTithe(titheData);
      setTitheGiven([...titheGiven, createdTithe]);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to create tithe:', error);
      }
    }
  };

  const handleAddDebt = async (amount: number, description: string, note: string = '', type: 'owed_to_me' | 'i_owe' = 'i_owe') => {
    try {
      const debtData = {
        description,
        amount,
        note,
        type
      };

      const createdDebt = await debtsService.createDebt(debtData);
      setDebts([...debts, createdDebt]);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to create debt:', error);
      }
    }
  };

  const handleDeleteDebt = async (id: string) => {
    try {
      await debtsService.deleteDebt(id);
      setDebts(debts.filter(debt => debt.id !== id));
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to delete debt:', error);
      }
    }
  };

  const handleAddTask = async (description: string, important: boolean = false) => {
    try {
      const taskData = {
        description,
        important,
        completed: false
      };

      const createdTask = await tasksService.createTask(taskData);
      setTasks([...tasks, createdTask]);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to create task:', error);
      }
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await tasksService.updateTask(id, updates);
      setTasks(tasks.map(task => task.id === id ? updatedTask : task));
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to update task:', error);
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await tasksService.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleAddAssetSnapshot = async (assets: Record<string, number>, liabilities: Record<string, number>, note: string) => {
    try {
      const snapshotData = {
        assets,
        liabilities,
        note,
        date: new Date().toISOString().split('T')[0]
      };

      const createdSnapshot = await assetsService.createAssetSnapshot(snapshotData);
      setAssetSnapshots([createdSnapshot, ...assetSnapshots]);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to create asset snapshot:', error);
      }
    }
  };

  const getMonthName = (monthNumber: number) => {
    const months = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    return months[monthNumber - 1] || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">טוען נתונים...</h2>
          <p className="text-gray-600">אנא המתן בזמן טעינת הנתונים</p>
        </div>
      </div>
    );
  }

  if (error && apiStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">מצב מוגבל</h2>
            <p className="text-yellow-700 mb-4">{error}</p>
            <div className="text-sm text-yellow-600">
              <p>האפליקציה פועלת עם נתונים מקומיים בלבד.</p>
              <p>חלק מהפונקציות עלולות להיות מוגבלות.</p>
            </div>
          </div>
          <button
            onClick={loadAllData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            נסה להתחבר שוב
          </button>
        </div>
      </div>
    );
  }

  if (!selectedBudgetYear && budgetYears.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-blue-800 mb-2">אין שנות תקציב מוגדרות</h2>
            <p className="text-blue-700">האפליקציה פועלת במצב הדגמה עם נתונים לדוגמה</p>
          </div>
          <button
            onClick={loadAllData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            רענן נתונים
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Status indicator */}
        {apiStatus !== 'connected' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm text-yellow-800">
                {apiStatus === 'fallback' ? 'פועל עם נתונים מקומיים' : 'מצב מוגבל - בעיות חיבור'}
              </span>
            </div>
          </div>
        )}

        {/* User message */}
        {userMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-800">{userMessage}</span>
              </div>
              <button
                onClick={() => setUserMessage(null)}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <TopActions
           selectedBudgetYear={selectedBudgetYear}
           budgetYears={budgetYears}
           onBudgetYearChange={handleBudgetYearChange}
           onAddExpense={handleAddExpense}
           onAddIncome={handleAddIncome}
         />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <TitheSection
            totalIncome={totalIncomesForTithe}
            tithePercentage={ENV.DEFAULT_TITHE_PERCENTAGE}
            titheGiven={titheGiven}
            onAddTithe={handleAddTithe}
          />
          
          <DebtsSection
            debts={debts}
            onAddDebt={handleAddDebt}
            onDeleteDebt={handleDeleteDebt}
          />
          
          <TasksSection
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              מצב קופות - {selectedBudgetYear?.name || 'נתונים לדוגמה'}
            </h2>
            <FundsGrid
              funds={funds}
              onCloseDailyFund={handleCloseDailyFund}
              onAddMoneyToEnvelope={handleAddMoneyToEnvelope}
              currentDisplayMonth={currentDisplayMonth}
              onMonthChange={setCurrentDisplayMonth}
            />
          </div>

          <div>
            <BudgetChart
              totalBudget={totalBudget}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              budgetYearMonths={selectedBudgetYear ? calculateBudgetYearMonths(selectedBudgetYear) : 12}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <AssetsSection
            snapshots={assetSnapshots}
            onAddSnapshot={handleAddAssetSnapshot}
          />
        </div>

        <QuickAddButtons
          onAddTithe={handleAddTithe}
          onAddDebt={handleAddDebt}
          onAddTask={handleAddTask}
        />

        <IncomeModal
          isOpen={isIncomeModalOpen}
          onClose={() => setIsIncomeModalOpen(false)}
          onAddIncome={handleIncomeModalSubmit}
        />

        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          onAddExpense={handleExpenseModalSubmit}
          categories={categories}
        />
      </div>
    </div>
  );
};

export default Dashboard;