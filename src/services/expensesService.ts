import { apiClient } from './api';
import { Expense } from '../types';

// Mock data import
import expensesData from '../data/expenses.json';

export interface CreateExpenseRequest {
  name: string;
  amount: number;
  category: string;
  fund: string;
  date: string;
  note?: string;
}

export interface UpdateExpenseRequest {
  name?: string;
  amount?: number;
  category?: string;
  fund?: string;
  date?: string;
  note?: string;
}

export interface ExpenseFilters {
  budgetYearId?: string;
  category?: string;
  fund?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ExpenseSummary {
  totalExpenses: number;
  monthlyAverage: number;
  currentMonthExpenses: number;
  yearToDateExpenses: number;
  expensesByCategory: { category: string; amount: number }[];
  expensesByFund: { fund: string; amount: number }[];
  expensesByMonth: { month: number; amount: number }[];
}

class ExpensesService {
  // GET / - קבלת כל ההוצאות (עם פילטרים)
  async getAllExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    // TODO: Replace with actual API call
    // const params = new URLSearchParams();
    // if (filters?.budgetYearId) params.append('budgetYearId', filters.budgetYearId);
    // if (filters?.category) params.append('category', filters.category);
    // if (filters?.fund) params.append('fund', filters.fund);
    // if (filters?.startDate) params.append('startDate', filters.startDate);
    // if (filters?.endDate) params.append('endDate', filters.endDate);
    // if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
    // if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
    // if (filters?.search) params.append('search', filters.search);
    // if (filters?.page) params.append('page', filters.page.toString());
    // if (filters?.limit) params.append('limit', filters.limit.toString());
    // return apiClient.get<Expense[]>(`/expenses?${params.toString()}`);
    
    // Mock implementation
    let filteredExpenses = expensesData.expenses;
    
    if (filters?.category) {
      filteredExpenses = filteredExpenses.filter(expense => expense.category === filters.category);
    }
    if (filters?.fund) {
      filteredExpenses = filteredExpenses.filter(expense => expense.fund === filters.fund);
    }
    if (filters?.search) {
      filteredExpenses = filteredExpenses.filter(expense => 
        expense.description.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    return Promise.resolve(filteredExpenses);
  }

  // GET /:id - קבלת הוצאה ספציפית
  async getExpenseById(id: string): Promise<Expense | null> {
    // TODO: Replace with actual API call
    // return apiClient.get<Expense>(`/expenses/${id}`);
    
    // Mock implementation
    const expense = expensesData.expenses.find(exp => exp.id === id);
    return Promise.resolve(expense || null);
  }

  // GET /stats/summary - קבלת סטטיסטיקות הוצאות
  async getExpenseSummary(budgetYearId?: string): Promise<ExpenseSummary> {
    // TODO: Replace with actual API call
    // const params = budgetYearId ? `?budgetYearId=${budgetYearId}` : '';
    // return apiClient.get<ExpenseSummary>(`/expenses/stats/summary${params}`);
    
    // Mock implementation
    const totalExpenses = expensesData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return Promise.resolve({
      totalExpenses,
      monthlyAverage: totalExpenses / 12,
      currentMonthExpenses: totalExpenses,
      yearToDateExpenses: totalExpenses,
      expensesByCategory: [],
      expensesByFund: [],
      expensesByMonth: []
    });
  }

  // POST / - יצירת הוצאה חדשה
  async createExpense(data: CreateExpenseRequest): Promise<Expense> {
    // TODO: Replace with actual API call
    // return apiClient.post<Expense>('/expenses', data);
    
    // Mock implementation
    const newExpense: Expense = {
      id: Date.now().toString(),
      description: data.name,
      amount: data.amount,
      category: data.category,
      fund: data.fund,
      date: data.date
    };
    
    return Promise.resolve(newExpense);
  }

  // PUT /:id - עדכון הוצאה
  async updateExpense(id: string, data: UpdateExpenseRequest): Promise<Expense> {
    // TODO: Replace with actual API call
    // return apiClient.put<Expense>(`/expenses/${id}`, data);
    
    // Mock implementation
    const existingExpense = expensesData.expenses.find(exp => exp.id === id);
    if (!existingExpense) {
      throw new Error('Expense not found');
    }
    
    const updatedExpense: Expense = {
      ...existingExpense,
      description: data.name || existingExpense.description,
      amount: data.amount || existingExpense.amount,
      category: data.category || existingExpense.category,
      fund: data.fund || existingExpense.fund,
      date: data.date || existingExpense.date
    };
    
    return Promise.resolve(updatedExpense);
  }

  // DELETE /:id - מחיקת הוצאה
  async deleteExpense(id: string): Promise<void> {
    // TODO: Replace with actual API call
    // return apiClient.delete<void>(`/expenses/${id}`);
    
    // Mock implementation
    console.log(`Deleting expense with id: ${id}`);
    return Promise.resolve();
  }
}

export const expensesService = new ExpensesService();