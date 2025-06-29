import { BudgetYear, Income, Expense } from '../types';

export const getBudgetYearByDate = (date: string, budgetYears: BudgetYear[]): BudgetYear | null => {
  const targetDate = new Date(date);
  
  return budgetYears.find(budgetYear => {
    const startDate = new Date(budgetYear.start_date);
    const endDate = new Date(budgetYear.end_date);
    return targetDate >= startDate && targetDate <= endDate;
  }) || null;
};

export const getActiveBudgetYear = (budgetYears: BudgetYear[]): BudgetYear | null => {
  return budgetYears.find(year => year.is_active) || budgetYears[0] || null;
};

export const getLatestBudgetYear = (budgetYears: BudgetYear[]): BudgetYear | null => {
  if (budgetYears.length === 0) return null;
  
  return budgetYears.reduce((latest, current) => {
    const latestEndDate = new Date(latest.end_date);
    const currentEndDate = new Date(current.end_date);
    return currentEndDate > latestEndDate ? current : latest;
  });
};

export const formatBudgetYearName = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startMonth = String(start.getMonth() + 1).padStart(2, '0');
  const startYear = String(start.getFullYear()).slice(-2);
  const endMonth = String(end.getMonth() + 1).padStart(2, '0');
  const endYear = String(end.getFullYear()).slice(-2);
  
  return `${startMonth}/${startYear} - ${endMonth}/${endYear}`;
};

export const calculateBudgetYearMonths = (budgetYear: BudgetYear): number => {
  const startDate = new Date(budgetYear.start_date);
  const endDate = new Date(budgetYear.end_date);
  
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  
  return yearDiff * 12 + monthDiff + 1;
};

export const filterIncomesByBudgetYear = (incomes: Income[], budgetYear: BudgetYear): Income[] => {
  return incomes.filter(income => {
    const incomeDate = new Date(income.date);
    const startDate = new Date(budgetYear.start_date);
    const endDate = new Date(budgetYear.end_date);
    return incomeDate >= startDate && incomeDate <= endDate;
  });
};

export const filterExpensesByBudgetYear = (expenses: Expense[], budgetYear: BudgetYear): Expense[] => {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const startDate = new Date(budgetYear.start_date);
    const endDate = new Date(budgetYear.end_date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
};

export const getAllIncomesForTithe = (incomes: Income[]): Income[] => {
  // מעשרות מחושבות על כל ההכנסות מכל שנות התקציב
  return incomes;
};