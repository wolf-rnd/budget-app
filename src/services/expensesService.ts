import { Expense } from '../types';
import { ENV } from '../config/env';

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
  private baseURL = ENV.API_BASE_URL;

  // Helper method for making API calls
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T }> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': '11111111-1111-1111-1111-111111111111',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('API request failed:', error);
      }
      throw error;
    }
  }

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
      
      const response = await this.apiCall<Expense[]>(endpoint);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to fetch expenses:', error);
      }
      throw error;
    }
  }

  // GET /expenses/:id - קבלת הוצאה ספציפית
  async getExpenseById(id: string): Promise<Expense | null> {
    try {
      const response = await this.apiCall<Expense>(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to fetch expense ${id}:`, error);
      }
      return null;
    }
  }

  // GET /expenses/stats/summary - קבלת סטטיסטיקות הוצאות
  async getExpenseSummary(budgetYearId?: string): Promise<ExpenseSummary> {
    try {
      const params = budgetYearId ? `?budgetYearId=${budgetYearId}` : '';
      const response = await this.apiCall<ExpenseSummary>(`/expenses/stats/summary${params}`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to fetch expense summary:', error);
      }
      throw error;
    }
  }

  // POST /expenses - יצירת הוצאה חדשה
  async createExpense(data: CreateExpenseRequest): Promise<Expense> {
    try {
      const response = await this.apiCall<Expense>('/expenses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
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
      const response = await this.apiCall<Expense>(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
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
      await this.apiCall<void>(`/expenses/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to delete expense ${id}:`, error);
      }
      throw error;
    }
  }
}

export const expensesService = new ExpensesService();