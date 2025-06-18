import { Fund } from '../types';
import { ENV } from '../config/env';
import { apiClient, ApiError } from './apiClient';
import { mockFunds } from './mockData';

export interface CreateFundRequest {
  name: string;
  type: 'monthly' | 'annual' | 'savings';
  level: 1 | 2 | 3;
  includeInBudget: boolean;
  categories: string[];
}

export interface UpdateFundRequest {
  name?: string;
  type?: 'monthly' | 'annual' | 'savings';
  level?: 1 | 2 | 3;
  includeInBudget?: boolean;
  categories?: string[];
}

export interface UpdateFundBudgetRequest {
  amount: number;
  amountGiven?: number;
  spent?: number;
}

class FundsService {
  // GET /funds - קבלת כל הקופות (עם אפשרות לסינון לפי שנת תקציב)
  async getAllFunds(budgetYearId?: string): Promise<Fund[]> {
    try {
      const params = budgetYearId ? `?budgetYearId=${budgetYearId}` : '';
      const response = await apiClient.get<Fund[]>(`/funds${params}`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn('Failed to fetch funds from API, using mock data:', error);
      }
      
      // Return mock data as fallback
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockFunds;
      }
      
      throw error;
    }
  }

  // GET /funds/:id - קבלת קופה ספציפית
  async getFundById(id: string): Promise<Fund | null> {
    try {
      const response = await apiClient.get<Fund>(`/funds/${id}`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn(`Failed to fetch fund ${id} from API:`, error);
      }
      
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockFunds.find(fund => fund.id === id) || null;
      }
      
      return null;
    }
  }

  // POST /funds - יצירת קופה חדשה
  async createFund(data: CreateFundRequest): Promise<Fund> {
    try {
      const response = await apiClient.post<Fund>('/funds', data);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to create fund:', error);
      }
      throw error;
    }
  }

  // PUT /funds/:id - עדכון קופה
  async updateFund(id: string, data: UpdateFundRequest): Promise<Fund> {
    try {
      const response = await apiClient.put<Fund>(`/funds/${id}`, data);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to update fund ${id}:`, error);
      }
      throw error;
    }
  }

  // PUT /funds/:id/budget/:budgetYearId - עדכון תקציב קופה לשנה ספציפית
  async updateFundBudget(id: string, budgetYearId: string, data: UpdateFundBudgetRequest): Promise<Fund> {
    try {
      const response = await apiClient.put<Fund>(`/funds/${id}/budget/${budgetYearId}`, data);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to update fund budget ${id}:`, error);
      }
      throw error;
    }
  }

  // PUT /funds/:id/deactivate - השבתת קופה
  async deactivateFund(id: string): Promise<Fund> {
    try {
      const response = await apiClient.put<Fund>(`/funds/${id}/deactivate`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to deactivate fund ${id}:`, error);
      }
      throw error;
    }
  }

  // PUT /funds/:id/activate - הפעלת קופה
  async activateFund(id: string): Promise<Fund> {
    try {
      const response = await apiClient.put<Fund>(`/funds/${id}/activate`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to activate fund ${id}:`, error);
      }
      throw error;
    }
  }

  // DELETE /funds/:id - מחיקת קופה
  async deleteFund(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/funds/${id}`);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to delete fund ${id}:`, error);
      }
      throw error;
    }
  }
}

export const fundsService = new FundsService();