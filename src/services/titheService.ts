import { TitheGiven } from '../types';
import { ENV } from '../config/env';
import { apiClient, ApiError } from './apiClient';
import { mockTithes } from './mockData';

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
      
      const response = await apiClient.get<TitheGiven[]>(endpoint);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn('Failed to fetch tithes from API, using mock data:', error);
      }
      
      // Return mock data as fallback
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockTithes;
      }
      
      throw error;
    }
  }

  // GET /tithe/summary - קבלת סיכום מעשרות
  async getTitheSummary(): Promise<TitheSummary> {
    try {
      const response = await apiClient.get<TitheSummary>('/tithe/summary');
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn('Failed to fetch tithe summary from API:', error);
      }
      
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        const totalGiven = mockTithes.reduce((sum, tithe) => sum + tithe.amount, 0);
        return {
          totalGiven,
          totalRequired: 1500,
          totalRemaining: 1500 - totalGiven,
          tithePercentage: 10,
          totalIncome: 15000,
          recentTithes: mockTithes
        };
      }
      
      throw error;
    }
  }

  // GET /tithe/:id - קבלת מעשר ספציפי
  async getTitheById(id: string): Promise<TitheGiven | null> {
    try {
      const response = await apiClient.get<TitheGiven>(`/tithe/${id}`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn(`Failed to fetch tithe ${id} from API:`, error);
      }
      
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockTithes.find(tithe => tithe.id === id) || null;
      }
      
      return null;
    }
  }

  // POST /tithe - יצירת מעשר חדש
  async createTithe(data: CreateTitheRequest): Promise<TitheGiven> {
    try {
      const response = await apiClient.post<TitheGiven>('/tithe', data);
      return response.data;
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
      const response = await apiClient.put<TitheGiven>(`/tithe/${id}`, data);
      return response.data;
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
      await apiClient.delete<void>(`/tithe/${id}`);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to delete tithe ${id}:`, error);
      }
      throw error;
    }
  }
}

export const titheService = new TitheService();