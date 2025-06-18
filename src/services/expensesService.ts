import { Expense } from '../types';
import { ENV } from '../config/env';
import { apiClient, ApiError } from './apiClient';
import { mockExpenses } from './mockData';

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
  // GET /expenses - קבלת כל ההוצאות (עם פילטרים)
  async getAllExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.budgetYearId) params.append('budgetYearId', filters.budgetYearId);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.fund) params.append('fund', filters.fund);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
      if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const endpoint = queryString ? `/expenses?${queryString}` : '/expenses';
      
      const response = await apiClient.get<Expense[]>(endpoint);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn('Failed to fetch expenses from API, using mock data:', error);
      }
      
      // Return mock data as fallback
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockExpenses;
      }
      
      throw error;
    }
  }

  // GET /expenses/:id - קבלת הוצאה ספציפית
  async getExpenseById(id: string): Promise<Expense | null> {
    try {
      const response = await apiClient.get<Expense>(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn(`Failed to fetch expense ${id} from API:`, error);
      }
      
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockExpenses.find(expense => expense.id === id) || null;
      }
      
      return null;
    }
  }

  // GET /expenses/stats/summary - קבלת סטטיסטיקות הוצאות
  async getExpenseSummary(budgetYearId?: string): Promise<ExpenseSummary> {
    try {
      const params = budgetYearId ? `?budgetYearId=${budgetYearId}` : '';
      const response = await apiClient.get<ExpenseSummary>(`/expenses/stats/summary${params}`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn('Failed to fetch expense summary from API:', error);
      }
      
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        return {
          totalExpenses,
          monthlyAverage: totalExpenses / 12,
          currentMonthExpenses: totalExpenses,
          yearToDateExpenses: totalExpenses,
          expensesByCategory: [{ category: 'מזון', amount: totalExpenses }],
          expensesByFund: [{ fund: 'קופת יומיום', amount: totalExpenses }],
          expensesByMonth: [{ month: new Date().getMonth() + 1, amount: totalExpenses }]
        };
      }
      
      throw error;
    }
  }

  // POST /expenses - יצירת הוצאה חדשה
  async createExpense(data: CreateExpenseRequest): Promise<Expense> {
    try {
      const response = await apiClient.post<Expense>('/expenses', data);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to create expense:', error);
      }
      throw error;
    }
  }

  // PUT /expenses/:id - עדכון הוצאה
  async updateExpense(id: string, data: UpdateExpenseRequest): Promise<Expense> {
    try {
      const response = await apiClient.put<Expense>(`/expenses/${id}`, data);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to update expense ${id}:`, error);
      }
      throw error;
    }
  }

  // DELETE /expenses/:id - מחיקת הוצאה
  async deleteExpense(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/expenses/${id}`);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to delete expense ${id}:`, error);
      }
      throw error;
    }
  }
}

export const expensesService = new ExpensesService();