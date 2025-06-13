import React, { useState, useEffect } from 'react';
import budgetData from '../../data/budget.json';
import expensesData from '../../data/expenses.json';
import incomeData from '../../data/income.json';
import debtsData from '../../data/debts.json';
import BudgetChart from './BudgetChart';

interface Fund {
  name: string;
  amount: number;
  type: 'monthly' | 'annual' | 'savings';
}

interface Expense {
  name: string;
  amount: number;
  category: string;
}

interface Income {
  source: string;
  amount: number;
  expectedAmount?: number;
}

interface Debt {
  name: string;
  amount: number;
}

const Dashboard: React.FC = () => {
  const mapFundType = (type: string): 'monthly' | 'annual' | 'savings' => {
    if (type === 'monthly' || type === 'annual' || type === 'savings') return type;
    return 'monthly';
  };

  const [funds] = useState<Fund[]>(
    budgetData.funds.map(f => ({
      ...f,
      type: mapFundType(f.type),
    }))
  );

  const [expenses] = useState<Expense[]>(expensesData.expenses);
  const [income] = useState<Income[]>(incomeData.income);
  const [debts] = useState<Debt[]>(debtsData.debts);

  const totalBudget = funds.reduce((sum, fund) => sum + fund.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const expectedIncome = income.reduce((sum, inc) => sum + (inc.expectedAmount ?? inc.amount), 0);

  const currentMonth = new Date().getMonth() + 1; // ינואר = 1

  return (
    <div>
      <h1>לוח בקרה</h1>
      <BudgetChart
        totalBudget={totalBudget}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        expectedIncome={expectedIncome}
        totalDebts={debts.reduce((sum, debt) => sum + debt.amount, 0)}
        currentMonth={currentMonth}
      />
    </div>
  );
};

export default Dashboard;
