import { Fund } from '../types';
import { ENV } from '../config/env';

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
  private baseURL = ENV.API_BASE_URL;

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
      if (ENV.DEV_MODE) {
        console.error('API request failed:', error);
      }
      throw error;
    }
  }

  // GET /funds - קבלת כל הקופות (עם אפשרות לסינון לפי שנת תקציב)
  async getAllFunds(budgetYearId?: string): Promise<Fund[]> {
    try {
      const params = budgetYearId ? `?budgetYearId=${budgetYearId}` : '';
      return await this.apiCall<Fund[]>(`/funds${params}`);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to fetch funds:', error);
      }
      throw error;
    }
  }

  // GET /funds/:id - קבלת קופה ספציפית
  async getFundById(id: string): Promise<Fund | null> {
    try {
      return await this.apiCall<Fund>(`/funds/${id}`);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to fetch fund ${id}:`, error);
      }
      return null;
    }
  }

  // POST /funds - יצירת קופה חדשה
  async createFund(data: CreateFundRequest): Promise<Fund> {
    try {
      return await this.apiCall<Fund>('/funds', {
        method: 'POST',
        body: JSON.stringify(data),
      });
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
      return await this.apiCall<Fund>(`/funds/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
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
      return await this.apiCall<Fund>(`/funds/${id}/budget/${budgetYearId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
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
      return await this.apiCall<Fund>(`/funds/${id}/deactivate`, {
        method: 'PUT',
      });
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
      return await this.apiCall<Fund>(`/funds/${id}/activate`, {
        method: 'PUT',
      });
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
      await this.apiCall<void>(`/funds/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to delete fund ${id}:`, error);
      }
      throw error;
    }
  }
}

export const fundsService = new FundsService();