import { AssetSnapshot } from '../types';
import { ENV } from '../config/env';
import { apiClient, ApiError } from './apiClient';
import { mockAssetSnapshots } from './mockData';

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
    try {
      const params = new URLSearchParams();
      
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const endpoint = queryString ? `/assets?${queryString}` : '/assets';
      
      const response = await apiClient.get<AssetSnapshot[]>(endpoint);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn('Failed to fetch asset snapshots from API, using mock data:', error);
      }
      
      // Return mock data as fallback
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockAssetSnapshots;
      }
      
      throw error;
    }
  }

  // GET /assets/latest - קבלת תמונת המצב האחרונה
  async getLatestAssetSnapshot(): Promise<AssetSnapshot | null> {
    try {
      const response = await apiClient.get<AssetSnapshot>('/assets/latest');
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn('Failed to fetch latest asset snapshot from API:', error);
      }
      
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockAssetSnapshots[0] || null;
      }
      
      return null;
    }
  }

  // GET /assets/trends/summary - קבלת מגמות נכסים
  async getAssetTrends(): Promise<AssetTrends> {
    try {
      const response = await apiClient.get<AssetTrends>('/assets/trends/summary');
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn('Failed to fetch asset trends from API:', error);
      }
      
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return {
          netWorthTrend: [{ date: new Date().toISOString().split('T')[0], value: 850000 }],
          assetsTrend: [{ date: new Date().toISOString().split('T')[0], value: 1650000 }],
          liabilitiesTrend: [{ date: new Date().toISOString().split('T')[0], value: 800000 }],
          monthlyChange: 5000,
          yearlyChange: 60000
        };
      }
      
      throw error;
    }
  }

  // GET /assets/:id - קבלת תמונת מצב ספציפית
  async getAssetSnapshotById(id: string): Promise<AssetSnapshot | null> {
    try {
      const response = await apiClient.get<AssetSnapshot>(`/assets/${id}`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn(`Failed to fetch asset snapshot ${id} from API:`, error);
      }
      
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockAssetSnapshots.find(snapshot => snapshot.id === id) || null;
      }
      
      return null;
    }
  }

  // POST /assets - יצירת תמונת מצב חדשה
  async createAssetSnapshot(data: CreateAssetSnapshotRequest): Promise<AssetSnapshot> {
    try {
      const response = await apiClient.post<AssetSnapshot>('/assets', data);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to create asset snapshot:', error);
      }
      throw error;
    }
  }

  // PUT /assets/:id - עדכון תמונת מצב
  async updateAssetSnapshot(id: string, data: UpdateAssetSnapshotRequest): Promise<AssetSnapshot> {
    try {
      const response = await apiClient.put<AssetSnapshot>(`/assets/${id}`, data);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to update asset snapshot ${id}:`, error);
      }
      throw error;
    }
  }

  // DELETE /assets/:id - מחיקת תמונת מצב
  async deleteAssetSnapshot(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/assets/${id}`);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to delete asset snapshot ${id}:`, error);
      }
      throw error;
    }
  }
}

export const assetsService = new AssetsService();