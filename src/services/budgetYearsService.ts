import { ENV } from '../config/env';
import { apiClient } from './apiClient';

export interface BudgetYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBudgetYearRequest {
  name: string;
  start_date: string;
  end_date: string;
}

export interface UpdateBudgetYearRequest {
  name?: string;
  start_date?: string;
  end_date?: string;
}

class BudgetYearsService {
  // GET /budget-years - קבלת כל שנות התקציב
  async getAllBudgetYears(): Promise<BudgetYear[]> {
    const response = await apiClient.get<BudgetYear[]>('/budget-years');
    return response.data;
  }

  // GET /budget-years/active - קבלת שנת התקציב הפעילה
  async getActiveBudgetYear(): Promise<BudgetYear | null> {
    try {
      const response = await apiClient.get<BudgetYear>('/budget-years/active');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // GET /budget-years/:id - קבלת שנת תקציב ספציפית
  async getBudgetYearById(id: string): Promise<BudgetYear | null> {
    try {
      const response = await apiClient.get<BudgetYear>(`/budget-years/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // POST /budget-years - יצירת שנת תקציב חדשה
  async createBudgetYear(data: CreateBudgetYearRequest): Promise<BudgetYear> {
    const response = await apiClient.post<BudgetYear>('/budget-years', data);
    return response.data;
  }

  // PUT /budget-years/:id - עדכון שנת תקציב
  async updateBudgetYear(id: string, data: UpdateBudgetYearRequest): Promise<BudgetYear> {
    const response = await apiClient.put<BudgetYear>(`/budget-years/${id}`, data);
    return response.data;
  }

  // PUT /budget-years/:id/activate - הפעלת שנת תקציב
  async activateBudgetYear(id: string): Promise<BudgetYear> {
    const response = await apiClient.put<BudgetYear>(`/budget-years/${id}/activate`);
    return response.data;
  }

  // DELETE /budget-years/:id - מחיקת שנת תקציב
  async deleteBudgetYear(id: string): Promise<void> {
    await apiClient.delete<void>(`/budget-years/${id}`);
  }
}

export const budgetYearsService = new BudgetYearsService();