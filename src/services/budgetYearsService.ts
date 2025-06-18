import { ENV } from '../config/env';

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
  private baseURL = ENV.API_BASE_URL;

  // Helper method for making API calls
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T }> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': '11111111-1111-1111-1111-111111111111',
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

  // GET /budget-years - קבלת כל שנות התקציב
  async getAllBudgetYears(): Promise<BudgetYear[]> {
    try {
      const response = await this.apiCall<BudgetYear[]>('/budget-years');
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to fetch budget years:', error);
      }
      throw error;
    }
  }

  // GET /budget-years/active - קבלת שנת התקציב הפעילה
  async getActiveBudgetYear(): Promise<BudgetYear | null> {
    try {
      const response = await this.apiCall<BudgetYear>('/budget-years/active');
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to fetch active budget year:', error);
      }
      return null;
    }
  }

  // GET /budget-years/:id - קבלת שנת תקציב ספציפית
  async getBudgetYearById(id: string): Promise<BudgetYear | null> {
    try {
      const response = await this.apiCall<BudgetYear>(`/budget-years/${id}`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to fetch budget year ${id}:`, error);
      }
      return null;
    }
  }

  // POST /budget-years - יצירת שנת תקציב חדשה
  async createBudgetYear(data: CreateBudgetYearRequest): Promise<BudgetYear> {
    try {
      const response = await this.apiCall<BudgetYear>('/budget-years', {
        method: 'POST',
        body: JSON.stringify(data),
      });
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
      const response = await this.apiCall<BudgetYear>(`/budget-years/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
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
      const response = await this.apiCall<BudgetYear>(`/budget-years/${id}/activate`, {
        method: 'PUT',
      });
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
      await this.apiCall<void>(`/budget-years/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to delete budget year ${id}:`, error);
      }
      throw error;
    }
  }
}

export const budgetYearsService = new BudgetYearsService();