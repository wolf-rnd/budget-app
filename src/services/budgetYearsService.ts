import { ENV } from '../config/env';
import { apiClient, ApiError } from './apiClient';
import { mockBudgetYears } from './mockData';

export interface BudgetYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBudgetYearRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateBudgetYearRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
}

class BudgetYearsService {
  // GET /budget-years - קבלת כל שנות התקציב
  async getAllBudgetYears(): Promise<BudgetYear[]> {
    try {
      const response = await apiClient.get<BudgetYear[]>('/budget-years');
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn('Failed to fetch budget years from API, using mock data:', error);
      }
      
      // Return mock data as fallback
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockBudgetYears;
      }
      
      throw error;
    }
  }

  // GET /budget-years/active - קבלת שנת התקציב הפעילה
  async getActiveBudgetYear(): Promise<BudgetYear | null> {
    try {
      const response = await apiClient.get<BudgetYear>('/budget-years/active');
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn('Failed to fetch active budget year from API:', error);
      }
      
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockBudgetYears.find(year => year.isActive) || null;
      }
      
      return null;
    }
  }

  // GET /budget-years/:id - קבלת שנת תקציב ספציפית
  async getBudgetYearById(id: string): Promise<BudgetYear | null> {
    try {
      const response = await apiClient.get<BudgetYear>(`/budget-years/${id}`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn(`Failed to fetch budget year ${id} from API:`, error);
      }
      
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockBudgetYears.find(year => year.id === id) || null;
      }
      
      return null;
    }
  }

  // POST /budget-years - יצירת שנת תקציב חדשה
  async createBudgetYear(data: CreateBudgetYearRequest): Promise<BudgetYear> {
    try {
      const response = await apiClient.post<BudgetYear>('/budget-years', data);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to create budget year:', error);
      }
      throw error;
    }
  }

  // PUT /budget-years/:id - עדכון שנת תקציב
  async updateBudgetYear(id: string, data: UpdateBudgetYearRequest): Promise<BudgetYear> {
    try {
      const response = await apiClient.put<BudgetYear>(`/budget-years/${id}`, data);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to update budget year ${id}:`, error);
      }
      throw error;
    }
  }

  // PUT /budget-years/:id/activate - הפעלת שנת תקציב
  async activateBudgetYear(id: string): Promise<BudgetYear> {
    try {
      const response = await apiClient.put<BudgetYear>(`/budget-years/${id}/activate`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to activate budget year ${id}:`, error);
      }
      throw error;
    }
  }

  // DELETE /budget-years/:id - מחיקת שנת תקציב
  async deleteBudgetYear(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/budget-years/${id}`);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to delete budget year ${id}:`, error);
      }
      throw error;
    }
  }
}

export const budgetYearsService = new BudgetYearsService();