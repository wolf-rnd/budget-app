import { ENV } from '../config/env';
import { apiClient } from './apiClient';

export interface Income {
  id: string;
  name: string;
  amount: number;
  month: number;
  year: number;
  date: string;
  source?: string;
  note?: string;
  budget_year_id?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface CreateIncomeRequest {
  name: string;
  amount: number;
  date: string;
  source?: string;
  note?: string;
}

export interface UpdateIncomeRequest {
  id?: string;
  name?: string;
  amount?: number;
  month?: number;
  year?: number;
  date?: string;
  source?: string;
  note?: string;
}

export interface IncomeFilters {
  budget_year_id?: string;
  month?: number;
  year?: number;
  source?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IncomeResponse {
  data: Income[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface IncomeSummary {
  total_income: number;
  monthly_average: number;
  current_month_income: number;
  year_to_date_income: number;
  income_by_source: { source: string; amount: number }[];
  income_by_month: { month: number; amount: number }[];
}

class IncomesService {
  // GET /incomes - קבלת כל ההכנסות (עם פילטרים ו-pagination)
  async getAllIncomes(filters?: IncomeFilters): Promise<Income[]> {
    const params = new URLSearchParams();

    if (filters?.budget_year_id) params.append('budgetYearId', filters.budget_year_id);
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.source) params.append('source', filters.source);
    if (filters?.search) params.append('search', filters.search);
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
  async getIncomeSummary(budget_year_id?: string): Promise<IncomeSummary> {
    const params = budget_year_id ? `?budgetYearId=${budget_year_id}` : '';
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