import { Expense } from '../types';
import { ENV } from '../config/env';
import { apiClient } from './apiClient';


export interface GetExpenseRequest {
  id: string;
  name: string;
  amount: number;
  category: string;
  fund: string;
  date: string;
  note?: string;
  budget_year_id?: string; // קישור לשנת תקציב
  // API response additions:
  categories?: {
    name: string;
    color_class?: string | null;
  };
  funds?: {
    name: string;
    type?: string;
    color_class?: string | null;
  };
}

export interface CreateExpenseRequest {
  name: string;
  amount: number;
  category_id: string;
  fund_id: string;
  date: string;
  note?: string;
}


export interface UpdateExpenseRequest {
  name: string;
  amount: number;
  category_id: string;
  fund_id: string;
  date: string;
  note?: string;
}

export interface ExpenseFilters {
  budget_year_id?: string;
  category?: string;
  fund?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort_field?: 'date' | 'name' | 'amount' | 'category' | 'fund';
  sort_direction?: 'asc' | 'desc';
}

export interface ExpenseResponse {
  data: Expense[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
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
  // GET /expenses - קבלת כל ההוצאות (עם פילטרים ו-pagination)
  async getAllExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    const params = new URLSearchParams();

    if (filters?.budget_year_id) params.append('budget_year_id', filters.budget_year_id);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.fund) params.append('fund', filters.fund);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.min_amount) params.append('min_amount', filters.min_amount.toString());
    if (filters?.max_amount) params.append('max_amount', filters.max_amount.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort_field) params.append('sort_field', filters.sort_field);
    if (filters?.sort_direction) params.append('sort_direction', filters.sort_direction);

    const queryString = params.toString();
    const endpoint = queryString ? `/expenses?${queryString}` : '/expenses';

    const response = await apiClient.get<Expense[]>(endpoint);
    return response.data;
  }

  // GET /expenses/:id - קבלת הוצאה ספציפית
  async getExpenseById(id: string): Promise<Expense | null> {
    try {
      const response = await apiClient.get<Expense>(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // GET /expenses/stats/summary - קבלת סטטיסטיקות הוצאות
  async getExpenseSummary(budgetYearId?: string): Promise<ExpenseSummary> {
    const params = budgetYearId ? `?budgetYearId=${budgetYearId}` : '';
    const response = await apiClient.get<ExpenseSummary>(`/expenses/stats/summary${params}`);
    return response.data;
  }

  // POST /expenses - יצירת הוצאה חדשה
  async createExpense(data: CreateExpenseRequest): Promise<Expense> {
    const response = await apiClient.post<Expense>('/expenses', data);
    return response.data;
  }

  // PUT /expenses/:id - עדכון הוצאה
  async updateExpense(id: string, data: UpdateExpenseRequest): Promise<Expense> {
    console.log(`🔄 Updating expense ${id} with data:`, data);
    const response = await apiClient.put<Expense>(`/expenses/${id}`, data);
    return response.data;
  }

  // DELETE /expenses/:id - מחיקת הוצאה
  async deleteExpense(id: string): Promise<void> {
    await apiClient.delete<void>(`/expenses/${id}`);
  }
}

export const expensesService = new ExpensesService();