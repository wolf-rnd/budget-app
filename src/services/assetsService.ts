import { AssetSnapshot } from '../types';

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
  private baseURL = 'https://messing-family-budget-api.netlify.app/api';

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
      console.error('API request failed:', error);
      throw error;
    }
  }

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
      
      return await this.apiCall<AssetSnapshot[]>(endpoint);
    } catch (error) {
      console.error('Failed to fetch asset snapshots:', error);
      throw error;
    }
  }

  // GET /assets/latest - קבלת תמונת המצב האחרונה
  async getLatestAssetSnapshot(): Promise<AssetSnapshot | null> {
    try {
      return await this.apiCall<AssetSnapshot>('/assets/latest');
    } catch (error) {
      console.error('Failed to fetch latest asset snapshot:', error);
      return null;
    }
  }

  // GET /assets/trends/summary - קבלת מגמות נכסים
  async getAssetTrends(): Promise<AssetTrends> {
    try {
      return await this.apiCall<AssetTrends>('/assets/trends/summary');
    } catch (error) {
      console.error('Failed to fetch asset trends:', error);
      throw error;
    }
  }

  // GET /assets/:id - קבלת תמונת מצב ספציפית
  async getAssetSnapshotById(id: string): Promise<AssetSnapshot | null> {
    try {
      return await this.apiCall<AssetSnapshot>(`/assets/${id}`);
    } catch (error) {
      console.error(`Failed to fetch asset snapshot ${id}:`, error);
      return null;
    }
  }

  // POST /assets - יצירת תמונת מצב חדשה
  async createAssetSnapshot(data: CreateAssetSnapshotRequest): Promise<AssetSnapshot> {
    try {
      return await this.apiCall<AssetSnapshot>('/assets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to create asset snapshot:', error);
      throw error;
    }
  }

  // PUT /assets/:id - עדכון תמונת מצב
  async updateAssetSnapshot(id: string, data: UpdateAssetSnapshotRequest): Promise<AssetSnapshot> {
    try {
      return await this.apiCall<AssetSnapshot>(`/assets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Failed to update asset snapshot ${id}:`, error);
      throw error;
    }
  }

  // DELETE /assets/:id - מחיקת תמונת מצב
  async deleteAssetSnapshot(id: string): Promise<void> {
    try {
      await this.apiCall<void>(`/assets/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Failed to delete asset snapshot ${id}:`, error);
      throw error;
    }
  }
}

export const assetsService = new AssetsService();