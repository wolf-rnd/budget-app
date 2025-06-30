import { ENV } from '../config/env';
import { apiClient } from './apiClient';

export interface TitheGiven {
  id: string;
  description: string;
  amount: number;
  note: string;
  date: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface CreateTitheRequest {
  description: string;
  amount: number;
  note?: string;
  date: string;
}

export interface UpdateTitheRequest {
  id?: string;
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

export interface TitheResponse {
  data: TitheGiven[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface TitheSummary {
  total_given: number;
  total_required: number;
  total_remaining: number;
  tithe_percentage: number;
  total_income: number;
  recent_tithes: TitheGiven[];
}

class TitheService {
  // GET /tithe - קבלת כל המעשרות (עם פילטרים ו-pagination)
  async getAllTithes(filters?: TitheFilters): Promise<TitheGiven[]> {
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
  }

  // GET /tithe/summary - קבלת סיכום מעשרות
  async getTitheSummary(): Promise<TitheSummary> {
    const response = await apiClient.get<TitheSummary>('/tithe/summary');
    return response.data;
  }

  // GET /tithe/:id - קבלת מעשר ספציפי
  async getTitheById(id: string): Promise<TitheGiven | null> {
    try {
      const response = await apiClient.get<TitheGiven>(`/tithe/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // POST /tithe - יצירת מעשר חדש
  async createTithe(data: CreateTitheRequest): Promise<TitheGiven> {
    const response = await apiClient.post<TitheGiven>('/tithe', data);
    return response.data;
  }

  // PUT /tithe/:id - עדכון מעשר
  async updateTithe(id: string, data: UpdateTitheRequest): Promise<TitheGiven> {
    const response = await apiClient.put<TitheGiven>(`/tithe/${id}`, data);
    return response.data;
  }

  // DELETE /tithe/:id - מחיקת מעשר
  async deleteTithe(id: string): Promise<void> {
    await apiClient.delete<void>(`/tithe/${id}`);
  }
}

export const titheService = new TitheService();