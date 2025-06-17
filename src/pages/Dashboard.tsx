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

// Import JSON data
import budgetData from '../data/budget.json';
import incomeData from '../data/income.json';
import expensesData from '../data/expenses.json';
import titheData from '../data/tithe.json';
import debtsData from '../data/debts.json';
import tasksData from '../data/tasks.json';
import assetsData from '../data/assets.json';
import categoriesData from '../data/categories.json';
import budgetYearsData from '../data/budgetYears.json';
import fundBudgetsData from '../data/fundBudgets.json';

const Dashboard: React.FC = () => {
  // State management
  const [budgetYears] = useState<BudgetYear[]>(budgetYearsData.budgetYears);
  const [selectedBudgetYear, setSelectedBudgetYear] = useState<BudgetYear | null>(null);
  const [fundBudgets, setFundBudgets] = useState<FundBudget[]>(fundBudgetsData.fundBudgets);
  
  const allowedTypes = ["monthly", "annual", "savings"] as const;
  const [funds] = useState<Fund[]>(
    budgetData.funds
      .filter((item): item is typeof item & { type: "monthly" | "annual" | "savings" } => 
        allowedTypes.includes(item.type as "monthly" | "annual" | "savings")
      )
      .map((item) => ({
        ...item,
        type: item.type as "monthly" | "annual" | "savings",
      })) as Fund[]
  );

  const [incomes, setIncomes] = useState<Income[]>(incomeData.incomes);
  const [expenses, setExpenses] = useState<Expense[]>(expensesData.expenses);
  const [titheGiven, setTitheGiven] = useState<TitheGiven[]>(titheData.titheGiven);
  const [debts, setDebts] = useState<Debt[]>(debtsData.debts);
  const [tasks, setTasks] = useState<Task[]>(tasksData.tasks);
  const [assetSnapshots, setAssetSnapshots] = useState<AssetSnapshot[]>(assetsData.assetsSnapshot);
  const [categories] = useState<Category[]>(categoriesData.categories);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Initialize selected budget year
  useEffect(() => {
    const savedBudgetYearId = localStorage.getItem('selectedBudgetYearId');
    let initialBudgetYear: BudgetYear | null = null;

    if (savedBudgetYearId) {
      initialBudgetYear = budgetYears.find(year => year.id === savedBudgetYearId) || null;
    }

    if (!initialBudgetYear) {
      initialBudgetYear = getActiveBudgetYear(budgetYears) || getLatestBudgetYear(budgetYears);
    }

    setSelectedBudgetYear(initialBudgetYear);
  }, [budgetYears]);

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

  // Get fund budgets for current year
  const getCurrentFundBudgets = () => {
    if (!selectedBudgetYear) return [];
    return fundBudgets.filter(fb => fb.budgetYearId === selectedBudgetYear.id);
  };

  const currentFundBudgets = getCurrentFundBudgets();

  // Calculate totals
  const totalBudget = currentFundBudgets
    .filter(fb => {
      const fund = funds.find(f => f.id === fb.fundId);
      return fund?.includeInBudget;
    })
    .reduce((sum, fb) => {
      const fund = funds.find(f => f.id === fb.fundId);
      return sum + (fund?.type === 'monthly' ? fb.amount * 12 : fb.amount);
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

  const handleIncomeModalSubmit = (newIncome: {
    name: string;
    amount: number;
    date: string;
    source?: string;
    note?: string;
  }) => {
    const income: Income = {
      id: Date.now().toString(),
      name: newIncome.name,
      amount: newIncome.amount,
      month: new Date(newIncome.date).getMonth() + 1,
      year: new Date(newIncome.date).getFullYear(),
      date: newIncome.date,
      source: newIncome.source,
      note: newIncome.note
    };
    
    setIncomes([...incomes, income]);
    console.log('הכנסה חדשה נוספה:', newIncome);
  };

  const handleExpenseModalSubmit = (newExpense: {
    name: string;
    amount: number;
    category: string;
    fund: string;
    date: string;
    note?: string;
  }) => {
    const expense: Expense = {
      id: Date.now().toString(),
      name: newExpense.name,
      amount: newExpense.amount,
      category: newExpense.category,
      fund: newExpense.fund,
      date: newExpense.date,
      note: newExpense.note
    };
    
    setExpenses([...expenses, expense]);
    
    // Update fund budgets
    setFundBudgets(prevFundBudgets => 
      prevFundBudgets.map(fb => {
        const fund = funds.find(f => f.id === fb.fundId && f.name === newExpense.fund);
        if (fund && selectedBudgetYear && fb.budgetYearId === selectedBudgetYear.id) {
          if (fund.type === 'monthly') {
            return { 
              ...fb, 
              amountGiven: (fb.amountGiven || 0) - newExpense.amount 
            };
          } else {
            return { 
              ...fb, 
              spent: (fb.spent || 0) + newExpense.amount 
            };
          }
        }
        return fb;
      })
    );
    
    console.log('הוצאה חדשה נוספה:', newExpense);
  };

  const handleOpenSettings = () => {
    console.log('פתיחת הגדרות');
  };

  const handleCloseDailyFund = (remainingAmount: number) => {
    if (!selectedBudgetYear) return;

    setFundBudgets(prevFundBudgets => {
      return prevFundBudgets.map(fb => {
        const fund = funds.find(f => f.id === fb.fundId);
        
        if (fund?.id === 'daily' && fb.budgetYearId === selectedBudgetYear.id) {
          return {
            ...fb,
            amountGiven: remainingAmount
          };
        }
        
        if (fund?.id === 'surplus' && fb.budgetYearId === selectedBudgetYear.id) {
          const dailyFundBudget = prevFundBudgets.find(f => {
            const dailyFund = funds.find(fund => fund.id === f.fundId && fund.id === 'daily');
            return dailyFund && f.budgetYearId === selectedBudgetYear.id;
          });
          
          if (dailyFundBudget) {
            const remainingToGive = dailyFundBudget.amount - (dailyFundBudget.amountGiven || 0);
            const amountToAdd = remainingAmount + remainingToGive;
            
            return {
              ...fb,
              amount: fb.amount + amountToAdd
            };
          }
        }
        
        return fb;
      });
    });
    
    console.log(`סגירת חודש: ${remainingAmount} ש"ח נותר במעטפה`);
  };

  const handleAddMoneyToEnvelope = (amount: number) => {
    if (!selectedBudgetYear) return;

    setFundBudgets(prevFundBudgets => 
      prevFundBudgets.map(fb => {
        const fund = funds.find(f => f.id === fb.fundId);
        if (fund?.id === 'daily' && fb.budgetYearId === selectedBudgetYear.id) {
          return { ...fb, amountGiven: (fb.amountGiven || 0) + amount };
        }
        return fb;
      })
    );
    console.log(`נוסף ${amount} ש"ח למעטפה בחודש ${getMonthName(currentDisplayMonth)}`);
  };

  const handleAddTithe = (amount: number, description: string) => {
    const newTithe: TitheGiven = {
      id: Date.now().toString(),
      description,
      amount,
      note: '',
      date: new Date().toISOString().split('T')[0]
    };
    setTitheGiven([...titheGiven, newTithe]);
  };

  const handleAddDebt = (amount: number, description: string, note: string = '', type: 'owed_to_me' | 'i_owe' = 'i_owe') => {
    const newDebt: Debt = {
      id: Date.now().toString(),
      description,
      amount,
      note,
      type
    };
    setDebts([...debts, newDebt]);
  };

  const handleDeleteDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };

  const handleAddTask = (description: string, important: boolean = false) => {
    const newTask: Task = {
      id: Date.now().toString(),
      description,
      important,
      completed: false
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updates } : task));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleAddAssetSnapshot = (assets: Record<string, number>, liabilities: Record<string, number>, note: string) => {
    const newSnapshot: AssetSnapshot = {
      id: Date.now().toString(),
      assets,
      liabilities,
      date: new Date().toISOString().split('T')[0],
      note
    };
    setAssetSnapshots([newSnapshot, ...assetSnapshots]);
  };

  // Convert fund budgets to display format
  const displayFunds = funds.map(fund => {
    const fundBudget = currentFundBudgets.find(fb => fb.fundId === fund.id);
    return {
      ...fund,
      amount: fundBudget?.amount || 0,
      amountGiven: fundBudget?.amountGiven,
      spent: fundBudget?.spent
    };
  });

  if (!selectedBudgetYear) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">אין שנות תקציב מוגדרות</h2>
          <p className="text-gray-600">אנא הגדר שנת תקציב בהגדרות המערכת</p>
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
          onOpenSettings={handleOpenSettings}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <TitheSection
            totalIncome={totalIncomesForTithe}
            tithePercentage={budgetData.tithePercentage}
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
              מצב קופות - {selectedBudgetYear.name}
            </h2>
            <FundsGrid
              funds={displayFunds}
              onCloseDailyFund={handleCloseDailyFund}
              onAddMoneyToEnvelope={handleAddMoneyToEnvelope}
            />
          </div>

          <div>
            <BudgetChart
              totalBudget={totalBudget}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              budgetYearMonths={calculateBudgetYearMonths(selectedBudgetYear)}
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