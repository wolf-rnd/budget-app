import { Income } from '../types';

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
  private baseURL = 'https://messing-family-budget-api.netlify.app/api';

  // Helper method for making API calls
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET /incomes - קבלת כל ההכנסות (עם פילטרים)
  async getAllIncomes(filters?: IncomeFilters): Promise<Income[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.budgetYearId) params.append('budgetYearId', filters.budgetYearId);
      if (filters?.month) params.append('month', filters.month.toString());
      if (filters?.year) params.append('year', filters.year.toString());
      if (filters?.source) params.append('source', filters.source);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const endpoint = queryString ? `/incomes?${queryString}` : '/incomes';
      
      return await this.apiCall<Income[]>(endpoint);
    } catch (error) {
      console.error('Failed to fetch incomes:', error);
      throw error;
    }
  }

  // GET /incomes/:id - קבלת הכנסה ספציפית
  async getIncomeById(id: string): Promise<Income | null> {
    try {
      return await this.apiCall<Income>(`/incomes/${id}`);
    } catch (error) {
      console.error(`Failed to fetch income ${id}:`, error);
      return null;
    }
  }

  // GET /incomes/stats/summary - קבלת סטטיסטיקות הכנסות
  async getIncomeSummary(budgetYearId?: string): Promise<IncomeSummary> {
    try {
      const params = budgetYearId ? `?budgetYearId=${budgetYearId}` : '';
      return await this.apiCall<IncomeSummary>(`/incomes/stats/summary${params}`);
    } catch (error) {
      console.error('Failed to fetch income summary:', error);
      throw error;
    }
  }

  // POST /incomes - יצירת הכנסה חדשה
  async createIncome(data: CreateIncomeRequest): Promise<Income> {
    try {
      return await this.apiCall<Income>('/incomes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to create income:', error);
      throw error;
    }
  }

  // PUT /incomes/:id - עדכון הכנסה
  async updateIncome(id: string, data: UpdateIncomeRequest): Promise<Income> {
    try {
      return await this.apiCall<Income>(`/incomes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Failed to update income ${id}:`, error);
      throw error;
    }
  }

  // DELETE /incomes/:id - מחיקת הכנסה
  async deleteIncome(id: string): Promise<void> {
    try {
      await this.apiCall<void>(`/incomes/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Failed to delete income ${id}:`, error);
      throw error;
    }
  }
}

export const incomesService = new IncomesService();