import React, { useState } from 'react';
import { Fund, Income, Expense, TitheGiven, Debt, Task, AssetSnapshot } from '../types';
import TopActions from '../components/Dashboard/TopActions';
import BudgetChart from '../components/Dashboard/BudgetChart';
import FundsGrid from '../components/Dashboard/FundsGrid';
import TitheSection from '../components/Dashboard/TitheSection';
import DebtsSection from '../components/Dashboard/DebtsSection';
import TasksSection from '../components/Dashboard/TasksSection';
import AssetsSection from '../components/Dashboard/AssetsSection';
import QuickAddButtons from '../components/Dashboard/QuickAddButtons';
import IncomeModal from '../components/Modals/IncomeModal';

// Import JSON data
import budgetData from '../data/budget.json';
import incomeData from '../data/income.json';
import expensesData from '../data/expenses.json';
import titheData from '../data/tithe.json';
import debtsData from '../data/debts.json';
import tasksData from '../data/tasks.json';
import assetsData from '../data/assets.json';

const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(budgetData.budgetYear);
 const [funds, setFunds] = useState<Fund[]>(
  budgetData.funds.map((item) => ({
    ...item,
    type: item.type as "monthly" | "annual" | "savings",
  }))
);

  const [incomes, setIncomes] = useState<Income[]>(incomeData.incomes);
  const [expenses] = useState<Expense[]>(expensesData.expenses);
  const [titheGiven, setTitheGiven] = useState<TitheGiven[]>(titheData.titheGiven);
  const [debts, setDebts] = useState<Debt[]>(debtsData.debts);
  const [tasks, setTasks] = useState<Task[]>(tasksData.tasks);
  const [assetSnapshots, setAssetSnapshots] = useState<AssetSnapshot[]>(assetsData.assetsSnapshot);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return now.getMonth() + 1;
  });

  // חישוב סכומים
  const totalBudget = funds
    .filter(fund => fund.includeInBudget)
    .reduce((sum, fund) => sum + (fund.type === 'monthly' ? fund.amount * 12 : fund.amount), 0);
  
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expectedIncome = incomeData.expectedIncomes.reduce((sum, income) => sum + income.amount, 0);

  // Handlers
  const handleAddExpense = () => {
    console.log('הוספת הוצאה');
  };

  const handleAddIncome = () => {
    setIsIncomeModalOpen(true);
  };

  const handleIncomeModalSubmit = (newIncome: {
    name: string;
    amount: number;
    month: number;
    year: number;
    date: string;
    source: string;
    note?: string;
  }) => {
    const income: Income = {
      id: Date.now().toString(),
      name: newIncome.name,
      amount: newIncome.amount,
      month: newIncome.month,
      year: newIncome.year,
      date: newIncome.date
    };
    
    setIncomes([...incomes, income]);
    console.log('הכנסה חדשה נוספה:', newIncome);
  };

  const handleOpenSettings = () => {
    console.log('פתיחת הגדרות');
  };

  const getMonthName = (monthNumber: number) => {
    const months = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    return months[monthNumber - 1];
  };

  const getNextMonth = (currentMonth: number) => {
    return currentMonth === 12 ? 1 : currentMonth + 1;
  };

  const handleCloseDailyFund = (remainingAmount: number) => {
    const nextMonth = getNextMonth(currentMonth);
    
    setFunds(prevFunds => {
      return prevFunds.map(fund => {
        if (fund.id === 'daily') {
          
          // איפוס הקופה לחודש הבא עם הסכום שנותר במעטפה כניתן בפועל
          return {
            ...fund,
            amountGiven: remainingAmount
          };
        }
        
        // הוספת הסכום לקופת העודפים
        if (fund.id === 'surplus') {
          const dailyFund = prevFunds.find(f => f.id === 'daily');
          if (dailyFund) {
            const remainingToGive = dailyFund.amount - (dailyFund.amountGiven || 0);
            const amountToAdd = remainingAmount + remainingToGive;
            
            return {
              ...fund,
              amount: fund.amount + amountToAdd
            };
          }
        }
        
        return fund;
      });
    });
    
    // מעבר לחודש הבא
    setCurrentMonth(nextMonth);
    
    console.log(`סגירת חודש ${getMonthName(currentMonth)}: ${remainingAmount} ש"ח נותר במעטפה`);
    console.log(`מעבר לחודש ${getMonthName(nextMonth)}`);
  };

  const handleAddMoneyToEnvelope = (amount: number) => {
    // עדכון קופת השוטף - הוספה לניתן בפועל
    setFunds(prevFunds => 
      prevFunds.map(fund => 
        fund.id === 'daily' 
          ? { ...fund, amountGiven: (fund.amountGiven || 0) + amount }
          : fund
      )
    );
    console.log(`נוסף ${amount} ש"ח למעטפה`);
  };

  // הוספת מעשר - עכשיו מהרכיב עצמו
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

  // הוספת חוב - עכשיו מהרכיב עצמו עם סוג חוב
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

  // מחיקת חוב - פונקציה חדשה
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <TopActions
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          onAddExpense={handleAddExpense}
          onAddIncome={handleAddIncome}
          onOpenSettings={handleOpenSettings}
        />

        {/* שורה ראשונה - מעשרות, חובות ותזכורות */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <TitheSection
            totalIncome={totalIncome}
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

        {/* שורה שנייה - מצב קופות ותרשים עם סיכום */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* מצב קופות */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">מצב קופות</h2>
            <FundsGrid
              funds={funds}
              onCloseDailyFund={handleCloseDailyFund}
              onAddMoneyToEnvelope={handleAddMoneyToEnvelope}
            />
          </div>

          {/* תרשים עם סיכום מובנה */}
          <div>
            <BudgetChart
              totalBudget={totalBudget}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              currentMonth={currentMonth}
              totalDebts={debts.reduce((sum, debt) => sum + debt.amount, 0)}
              expectedIncome={expectedIncome}
            />
          </div>
        </div>

        {/* תמונת מצב נכסים - תחתית */}
        <div className="flex justify-center">
          <AssetsSection
            snapshots={assetSnapshots}
            onAddSnapshot={handleAddAssetSnapshot}
          />
        </div>

        {/* כפתורי הוספה מהירה */}
        <QuickAddButtons
          onAddTithe={handleAddTithe}
          onAddDebt={handleAddDebt}
          onAddTask={handleAddTask}
        />

        {/* מודל הוספת הכנסה */}
        <IncomeModal
          isOpen={isIncomeModalOpen}
          onClose={() => setIsIncomeModalOpen(false)}
          onAddIncome={handleIncomeModalSubmit}
        />
      </div>
    </div>
  );
};

export default Dashboard;