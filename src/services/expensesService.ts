import { Expense } from '../types';
import { ENV } from '../config/env';
import { apiClient } from './apiClient';

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
    const response = await apiClient.put<Expense>(`/expenses/${id}`, data);
    return response.data;
  }

  // DELETE /expenses/:id - מחיקת הוצאה
  async deleteExpense(id: string): Promise<void> {
    await apiClient.delete<void>(`/expenses/${id}`);
  }
}

export const expensesService = new ExpensesService();