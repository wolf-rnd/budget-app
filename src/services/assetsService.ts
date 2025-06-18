import { AssetSnapshot } from '../types';
import { ENV } from '../config/env';
import { apiClient } from './apiClient';

export interface CreateAssetSnapshotRequest {
  assets: Record<string, number>;
  liabilities: Record<string, number>;
  note?: string;
  date: string;
}

export interface UpdateAssetSnapshotRequest {
  assets?: Record<string, number>;
  liabilities?: Record<string, number>;
  note?: string;
  date?: string;
}

export interface AssetFilters {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AssetTrends {
  netWorthTrend: { date: string; value: number }[];
  assetsTrend: { date: string; value: number }[];
  liabilitiesTrend: { date: string; value: number }[];
  monthlyChange: number;
  yearlyChange: number;
}

class AssetsService {
  // GET /assets - קבלת כל תמונות מצב הנכסים (עם פילטרים)
  async getAllAssetSnapshots(filters?: AssetFilters): Promise<AssetSnapshot[]> {
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/assets?${queryString}` : '/assets';
    
    const response = await apiClient.get<AssetSnapshot[]>(endpoint);
    return response.data;
  }

  // GET /assets/latest - קבלת תמונת המצב האחרונה
  async getLatestAssetSnapshot(): Promise<AssetSnapshot | null> {
    try {
      const response = await apiClient.get<AssetSnapshot>('/assets/latest');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // GET /assets/trends/summary - קבלת מגמות נכסים
  async getAssetTrends(): Promise<AssetTrends> {
    const response = await apiClient.get<AssetTrends>('/assets/trends/summary');
    return response.data;
  }

  // GET /assets/:id - קבלת תמונת מצב ספציפית
  async getAssetSnapshotById(id: string): Promise<AssetSnapshot | null> {
    try {
      const response = await apiClient.get<AssetSnapshot>(`/assets/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // POST /assets - יצירת תמונת מצב חדשה
  async createAssetSnapshot(data: CreateAssetSnapshotRequest): Promise<AssetSnapshot> {
    const response = await apiClient.post<AssetSnapshot>('/assets', data);
    return response.data;
  }

  // PUT /assets/:id - עדכון תמונת מצב
  async updateAssetSnapshot(id: string, data: UpdateAssetSnapshotRequest): Promise<AssetSnapshot> {
    const response = await apiClient.put<AssetSnapshot>(`/assets/${id}`, data);
    return response.data;
  }

  // DELETE /assets/:id - מחיקת תמונת מצב
  async deleteAssetSnapshot(id: string): Promise<void> {
    await apiClient.delete<void>(`/assets/${id}`);
  }
}

export const assetsService = new AssetsService();