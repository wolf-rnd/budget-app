import React, { useState, useEffect } from 'react';
import { Fund, Income, Expense, TitheGiven, Debt, Task, AssetSnapshot, Category, BudgetYear, FundBudget } from '../types';
import TopActions from '../components/Dashboard/TopActions';

import BudgetChart from '../components/Dashboard/BudgetChart';
import FundsGrid from '../components/Dashboard/FundsGrid';
import TitheSection from '../components/Dashboard/TitheSection';
import DebtsSection from '../components/Dashboard/DebtsSection';
import TasksSection from '../components/Dashboard/TasksSection';
import AssetsSection from '../components/Dashboard/AssetsSection';
import IncomeModal from '../components/Modals/IncomeModal';
import ExpenseModal from '../components/Modals/ExpenseModal';
import { useNotifications } from '../components/Notifications/NotificationSystem';

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
import { CreateExpenseRequest, expensesService } from '../services/expensesService';
import { titheService } from '../services/titheService';
import { debtsService } from '../services/debtsService';
import { tasksService } from '../services/tasksService';
import { assetsService } from '../services/assetsService';
import { categoriesService, GetCategoryRequest } from '../services/categoriesService';
import { fundsService } from '../services/fundsService';
import { apiClient } from '../services/apiClient';

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
  const [categories, setCategories] = useState<GetCategoryRequest[]>([]);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState<number>(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addNotification } = useNotifications();

  // Setup API client notification callback
  useEffect(() => {
    apiClient.setNotificationCallback(addNotification);
  }, [addNotification]);

  // טעינת כל הדאטה הראשונית (כולל בחירת שנת תקציב)
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          budgetYearsData,
          incomesData,
          expensesData,
          titheData,
          debtsData,
          tasksData,
          assetsData,
          categoriesData
        ] = await Promise.all([
          budgetYearsService.getAllBudgetYears(),
          incomesService.getAllIncomes(),
          expensesService.getAllExpenses(),
          titheService.getAllTithes(),
          debtsService.getAllDebts(),
          tasksService.getAllTasks(),
          assetsService.getAllAssetSnapshots(),
          categoriesService.getAllCategories()
        ]);
        setBudgetYears(budgetYearsData);
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
        initialBudgetYear = budgetYearsData.find(year => year.id === savedBudgetYearId) || null;
        initialBudgetYear = initialBudgetYear || getActiveBudgetYear(budgetYearsData) || getLatestBudgetYear(budgetYearsData);
        setSelectedBudgetYear(initialBudgetYear);
      } catch (err) {
        setError('שגיאה בטעינת נתוני הדשבורד');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // טען רק funds בכל החלפת שנת תקציב
  useEffect(() => {
    const loadFunds = async () => {
      if (!selectedBudgetYear) return;
      setLoading(true);
      setError(null);
      try {
        const fundsData = await fundsService.getAllFunds(selectedBudgetYear.id);
        setFunds(fundsData);
      } catch (err) {
        setError('שגיאה בטעינת קופות');
      } finally {
        setLoading(false);
      }
    };
    loadFunds();
  }, [selectedBudgetYear]);

  // Save selected budget year to localStorage
  useEffect(() => {
    if (selectedBudgetYear) {
      localStorage.setItem('selectedBudgetYearId', selectedBudgetYear.id);
    }
  }, [selectedBudgetYear]);

  // Calculate data based on selected budget year
  const currentBudgetYearIncomes = selectedBudgetYear ? filterIncomesByBudgetYear(incomes, selectedBudgetYear) : [];
  const currentBudgetYearExpenses = selectedBudgetYear ? filterExpensesByBudgetYear(expenses, selectedBudgetYear) : [];
  const allIncomesForTithe = getAllIncomesForTithe(incomes);

  // Calculate totals
  const totalBudget = funds
    .filter(fund => fund.include_in_budget)
    .reduce((sum, fund) => {
      return sum + (fund.type === 'monthly' ? fund.amount * 12 : fund.amount);
    }, 0);

  const totalIncome = currentBudgetYearIncomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = currentBudgetYearExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncomesForTithe = allIncomesForTithe.reduce((sum, income) => sum + income.amount, 0);

  // Handlers
  const handleBudgetYearChange = (year: BudgetYear) => {
    const selectedYear = budgetYears.find(y => y.id === year.id) || null;
    setSelectedBudgetYear(selectedYear);
    // טעינת קופות תתבצע אוטומטית דרך useEffect
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

      if (ENV.DEV_MODE) {
        console.log('הכנסה חדשה נוספה:', createdIncome);
      }
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to create income:', error);
      }
    }
  };

  const handleExpenseModalSubmit = async (newExpense: CreateExpenseRequest) => {
    try {
      const createdExpense = await expensesService.createExpense(newExpense);
      setExpenses([...expenses, createdExpense]);

      if (ENV.DEV_MODE) {
        console.log('הוצאה חדשה נוספה:', createdExpense);
      }
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to create expense:', error);
      }
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
          <p className="text-gray-600">מתחבר לשרת ומביא נתונים עדכניים</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-red-800 mb-2">שגיאה בטעינת הנתונים</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="text-sm text-red-600">
              <p>לא ניתן להתחבר לשרת או לטעון נתונים.</p>
              <p>אנא בדוק את החיבור לאינטרנט ונסה שוב.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedBudgetYear && budgetYears.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">אין שנות תקציב מוגדרות</h2>
            <p className="text-yellow-700">אנא הגדר שנת תקציב בהגדרות המערכת</p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
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
              מצב קופות - {selectedBudgetYear?.name}
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