import { TitheGiven } from '../types';
import { ENV } from '../config/env';

export interface CreateTitheRequest {
  description: string;
  amount: number;
  note?: string;
  date: string;
}

export interface UpdateTitheRequest {
  description?: string;
  amount?: number;
  note?: string;
  date?: string;
}

export interface TitheFilters {
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TitheSummary {
  totalGiven: number;
  totalRequired: number;
  totalRemaining: number;
  tithePercentage: number;
  totalIncome: number;
  recentTithes: TitheGiven[];
}

class TitheService {
  private baseURL = ENV.API_BASE_URL;

  // Helper method for making API calls
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

  // GET /tithe - קבלת כל המעשרות (עם פילטרים)
  async getAllTithes(filters?: TitheFilters): Promise<TitheGiven[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const endpoint = queryString ? `/tithe?${queryString}` : '/tithe';
      
      return await this.apiCall<TitheGiven[]>(endpoint);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to fetch tithes:', error);
      }
      throw error;
    }
  }

  // GET /tithe/summary - קבלת סיכום מעשרות
  async getTitheSummary(): Promise<TitheSummary> {
    try {
      return await this.apiCall<TitheSummary>('/tithe/summary');
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to fetch tithe summary:', error);
      }
      throw error;
    }
  }

  // GET /tithe/:id - קבלת מעשר ספציפי
  async getTitheById(id: string): Promise<TitheGiven | null> {
    try {
      return await this.apiCall<TitheGiven>(`/tithe/${id}`);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to fetch tithe ${id}:`, error);
      }
      return null;
    }
  }

  // POST /tithe - יצירת מעשר חדש
  async createTithe(data: CreateTitheRequest): Promise<TitheGiven> {
    try {
      return await this.apiCall<TitheGiven>('/tithe', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to create tithe:', error);
      }
      throw error;
    }
  }

  // PUT /tithe/:id - עדכון מעשר
  async updateTithe(id: string, data: UpdateTitheRequest): Promise<TitheGiven> {
    try {
      return await this.apiCall<TitheGiven>(`/tithe/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to update tithe ${id}:`, error);
      }
      throw error;
    }
  }

  // DELETE /tithe/:id - מחיקת מעשר
  async deleteTithe(id: string): Promise<void> {
    try {
      await this.apiCall<void>(`/tithe/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to delete tithe ${id}:`, error);
      }
      throw error;
    }
  }
}

export const titheService = new TitheService();