import { Income } from '../types';
import { ENV } from '../config/env';
import { apiClient } from './apiClient';

export interface CreateIncomeRequest {
  name: string;
  amount: number;
  month: number;
  year: number;
  date: string;
  source?: string;
  note?: string;
}

export interface UpdateIncomeRequest {
  name?: string;
  amount?: number;
  month?: number;
  year?: number;
  date?: string;
  source?: string;
  note?: string;
}

export interface IncomeFilters {
  budgetYearId?: string;
  month?: number;
  year?: number;
  source?: string;
  page?: number;
  limit?: number;
}

export interface IncomeSummary {
  totalIncome: number;
  monthlyAverage: number;
  currentMonthIncome: number;
  yearToDateIncome: number;
  incomeBySource: { source: string; amount: number }[];
  incomeByMonth: { month: number; amount: number }[];
}

class IncomesService {
  // GET /incomes - קבלת כל ההכנסות (עם פילטרים)
  async getAllIncomes(filters?: IncomeFilters): Promise<Income[]> {
    const params = new URLSearchParams();
    
    if (filters?.budgetYearId) params.append('budgetYearId', filters.budgetYearId);
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.source) params.append('source', filters.source);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/incomes?${queryString}` : '/incomes';
    
    const response = await apiClient.get<Income[]>(endpoint);
    return response.data;
  }

  // GET /incomes/:id - קבלת הכנסה ספציפית
  async getIncomeById(id: string): Promise<Income | null> {
    try {
      const response = await apiClient.get<Income>(`/incomes/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // GET /incomes/stats/summary - קבלת סטטיסטיקות הכנסות
  async getIncomeSummary(budgetYearId?: string): Promise<IncomeSummary> {
    const params = budgetYearId ? `?budgetYearId=${budgetYearId}` : '';
    const response = await apiClient.get<IncomeSummary>(`/incomes/stats/summary${params}`);
    return response.data;
  }

  // POST /incomes - יצירת הכנסה חדשה
  async createIncome(data: CreateIncomeRequest): Promise<Income> {
    const response = await apiClient.post<Income>('/incomes', data);
    return response.data;
  }

  // PUT /incomes/:id - עדכון הכנסה
  async updateIncome(id: string, data: UpdateIncomeRequest): Promise<Income> {
    const response = await apiClient.put<Income>(`/incomes/${id}`, data);
    return response.data;
  }

  // DELETE /incomes/:id - מחיקת הכנסה
  async deleteIncome(id: string): Promise<void> {
    await apiClient.delete<void>(`/incomes/${id}`);
  }
}

export const incomesService = new IncomesService();