import { apiClient } from './api';
import { Fund, Income, Expense, Debt, Task } from '../types';

// Mock data imports
import budgetData from '../data/budget.json';
import incomeData from '../data/income.json';
import expensesData from '../data/expenses.json';
import debtsData from '../data/debts.json';
import tasksData from '../data/tasks.json';

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  totalBudget: number;
  balance: number;
  totalDebts: number;
  funds: Fund[];
  recentExpenses: Expense[];
  pendingTasks: Task[];
  titheRequired: number;
  titheGiven: number;
  titheRemaining: number;
}

class DashboardService {
  // GET /summary - קבלת סיכום דשבורד
  async getDashboardSummary(budgetYearId?: string): Promise<DashboardSummary> {
    // TODO: Replace with actual API call
    // const params = budgetYearId ? `?budgetYearId=${budgetYearId}` : '';
    // return apiClient.get<DashboardSummary>(`/dashboard/summary${params}`);
    
    // Mock implementation
    const totalIncome = incomeData.incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expensesData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalBudget = budgetData.funds
      .filter(fund => fund.includeInBudget)
      .reduce((sum, fund) => sum + (fund.type === 'monthly' ? fund.amount * 12 : fund.amount), 0);
    const balance = totalIncome - totalExpenses;
    const totalDebts = debtsData.debts.reduce((sum, debt) => sum + debt.amount, 0);
    
    const tithePercentage = 10; // From budget data
    const titheRequired = (totalIncome * tithePercentage) / 100;
    const titheGiven = 1500; // From tithe data
    const titheRemaining = titheRequired - titheGiven;
    
    const recentExpenses = expensesData.expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    const pendingTasks = tasksData.tasks.filter(task => !task.completed);
    
    return Promise.resolve({
      totalIncome,
      totalExpenses,
      totalBudget,
      balance,
      totalDebts,
      funds: budgetData.funds,
      recentExpenses,
      pendingTasks,
      titheRequired,
      titheGiven,
      titheRemaining
    });
  }
}

export const dashboardService = new DashboardService();