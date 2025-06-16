import { apiClient } from './api';
import { Income } from '../types';

// Mock data import
import incomeData from '../data/income.json';

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
  // GET / - קבלת כל ההכנסות (עם פילטרים)
  async getAllIncomes(filters?: IncomeFilters): Promise<Income[]> {
    // TODO: Replace with actual API call
    // const params = new URLSearchParams();
    // if (filters?.budgetYearId) params.append('budgetYearId', filters.budgetYearId);
    // if (filters?.month) params.append('month', filters.month.toString());
    // if (filters?.year) params.append('year', filters.year.toString());
    // if (filters?.source) params.append('source', filters.source);
    // if (filters?.page) params.append('page', filters.page.toString());
    // if (filters?.limit) params.append('limit', filters.limit.toString());
    // return apiClient.get<Income[]>(`/incomes?${params.toString()}`);
    
    // Mock implementation
    let filteredIncomes = incomeData.incomes;
    
    if (filters?.month) {
      filteredIncomes = filteredIncomes.filter(income => income.month === filters.month);
    }
    if (filters?.year) {
      filteredIncomes = filteredIncomes.filter(income => income.year === filters.year);
    }
    
    return Promise.resolve(filteredIncomes);
  }

  // GET /:id - קבלת הכנסה ספציפית
  async getIncomeById(id: string): Promise<Income | null> {
    // TODO: Replace with actual API call
    // return apiClient.get<Income>(`/incomes/${id}`);
    
    // Mock implementation
    const income = incomeData.incomes.find(inc => inc.id === id);
    return Promise.resolve(income || null);
  }

  // GET /stats/summary - קבלת סטטיסטיקות הכנסות
  async getIncomeSummary(budgetYearId?: string): Promise<IncomeSummary> {
    // TODO: Replace with actual API call
    // const params = budgetYearId ? `?budgetYearId=${budgetYearId}` : '';
    // return apiClient.get<IncomeSummary>(`/incomes/stats/summary${params}`);
    
    // Mock implementation
    const totalIncome = incomeData.incomes.reduce((sum, income) => sum + income.amount, 0);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const currentMonthIncome = incomeData.incomes
      .filter(income => income.month === currentMonth && income.year === currentYear)
      .reduce((sum, income) => sum + income.amount, 0);
    
    const yearToDateIncome = incomeData.incomes
      .filter(income => income.year === currentYear)
      .reduce((sum, income) => sum + income.amount, 0);
    
    return Promise.resolve({
      totalIncome,
      monthlyAverage: totalIncome / 12,
      currentMonthIncome,
      yearToDateIncome,
      incomeBySource: [],
      incomeByMonth: []
    });
  }

  // POST / - יצירת הכנסה חדשה
  async createIncome(data: CreateIncomeRequest): Promise<Income> {
    // TODO: Replace with actual API call
    // return apiClient.post<Income>('/incomes', data);
    
    // Mock implementation
    const newIncome: Income = {
      id: Date.now().toString(),
      ...data
    };
    
    return Promise.resolve(newIncome);
  }

  // PUT /:id - עדכון הכנסה
  async updateIncome(id: string, data: UpdateIncomeRequest): Promise<Income> {
    // TODO: Replace with actual API call
    // return apiClient.put<Income>(`/incomes/${id}`, data);
    
    // Mock implementation
    const existingIncome = incomeData.incomes.find(inc => inc.id === id);
    if (!existingIncome) {
      throw new Error('Income not found');
    }
    
    const updatedIncome: Income = {
      ...existingIncome,
      ...data
    };
    
    return Promise.resolve(updatedIncome);
  }

  // DELETE /:id - מחיקת הכנסה
  async deleteIncome(id: string): Promise<void> {
    // TODO: Replace with actual API call
    // return apiClient.delete<void>(`/incomes/${id}`);
    
    // Mock implementation
    console.log(`Deleting income with id: ${id}`);
    return Promise.resolve();
  }
}

export const incomesService = new IncomesService();