import { apiClient } from './api';
import { TitheGiven } from '../types';

// Mock data import
import titheData from '../data/tithe.json';

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
  // GET / - קבלת כל המעשרות (עם פילטרים)
  async getAllTithes(filters?: TitheFilters): Promise<TitheGiven[]> {
    // TODO: Replace with actual API call
    // const params = new URLSearchParams();
    // if (filters?.startDate) params.append('startDate', filters.startDate);
    // if (filters?.endDate) params.append('endDate', filters.endDate);
    // if (filters?.search) params.append('search', filters.search);
    // if (filters?.page) params.append('page', filters.page.toString());
    // if (filters?.limit) params.append('limit', filters.limit.toString());
    // return apiClient.get<TitheGiven[]>(`/tithe?${params.toString()}`);
    
    // Mock implementation
    let filteredTithes = titheData.titheGiven;
    
    if (filters?.search) {
      filteredTithes = filteredTithes.filter(tithe => 
        tithe.description.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    return Promise.resolve(filteredTithes);
  }

  // GET /summary - קבלת סיכום מעשרות
  async getTitheSummary(): Promise<TitheSummary> {
    // TODO: Replace with actual API call
    // return apiClient.get<TitheSummary>('/tithe/summary');
    
    // Mock implementation
    const totalGiven = titheData.titheGiven.reduce((sum, tithe) => sum + tithe.amount, 0);
    const totalIncome = 85000; // From income data
    const tithePercentage = 10;
    const totalRequired = (totalIncome * tithePercentage) / 100;
    const totalRemaining = totalRequired - totalGiven;
    
    return Promise.resolve({
      totalGiven,
      totalRequired,
      totalRemaining,
      tithePercentage,
      totalIncome,
      recentTithes: titheData.titheGiven.slice(0, 5)
    });
  }

  // GET /:id - קבלת מעשר ספציפי
  async getTitheById(id: string): Promise<TitheGiven | null> {
    // TODO: Replace with actual API call
    // return apiClient.get<TitheGiven>(`/tithe/${id}`);
    
    // Mock implementation
    const tithe = titheData.titheGiven.find(t => t.id === id);
    return Promise.resolve(tithe || null);
  }

  // POST / - יצירת מעשר חדש
  async createTithe(data: CreateTitheRequest): Promise<TitheGiven> {
    // TODO: Replace with actual API call
    // return apiClient.post<TitheGiven>('/tithe', data);
    
    // Mock implementation
    const newTithe: TitheGiven = {
      id: Date.now().toString(),
      ...data
    };
    
    return Promise.resolve(newTithe);
  }

  // PUT /:id - עדכון מעשר
  async updateTithe(id: string, data: UpdateTitheRequest): Promise<TitheGiven> {
    // TODO: Replace with actual API call
    // return apiClient.put<TitheGiven>(`/tithe/${id}`, data);
    
    // Mock implementation
    const existingTithe = titheData.titheGiven.find(t => t.id === id);
    if (!existingTithe) {
      throw new Error('Tithe not found');
    }
    
    const updatedTithe: TitheGiven = {
      ...existingTithe,
      ...data
    };
    
    return Promise.resolve(updatedTithe);
  }

  // DELETE /:id - מחיקת מעשר
  async deleteTithe(id: string): Promise<void> {
    // TODO: Replace with actual API call
    // return apiClient.delete<void>(`/tithe/${id}`);
    
    // Mock implementation
    console.log(`Deleting tithe with id: ${id}`);
    return Promise.resolve();
  }
}

export const titheService = new TitheService();