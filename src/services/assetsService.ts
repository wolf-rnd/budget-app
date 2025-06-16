import { apiClient } from './api';
import { AssetSnapshot } from '../types';

// Mock data import
import assetsData from '../data/assets.json';

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
  // GET / - קבלת כל תמונות מצב הנכסים (עם פילטרים)
  async getAllAssetSnapshots(filters?: AssetFilters): Promise<AssetSnapshot[]> {
    // TODO: Replace with actual API call
    // const params = new URLSearchParams();
    // if (filters?.startDate) params.append('startDate', filters.startDate);
    // if (filters?.endDate) params.append('endDate', filters.endDate);
    // if (filters?.page) params.append('page', filters.page.toString());
    // if (filters?.limit) params.append('limit', filters.limit.toString());
    // return apiClient.get<AssetSnapshot[]>(`/assets?${params.toString()}`);
    
    // Mock implementation
    return Promise.resolve(assetsData.assetsSnapshot);
  }

  // GET /latest - קבלת תמונת המצב האחרונה
  async getLatestAssetSnapshot(): Promise<AssetSnapshot | null> {
    // TODO: Replace with actual API call
    // return apiClient.get<AssetSnapshot>('/assets/latest');
    
    // Mock implementation
    const latest = assetsData.assetsSnapshot[0];
    return Promise.resolve(latest || null);
  }

  // GET /trends/summary - קבלת מגמות נכסים
  async getAssetTrends(): Promise<AssetTrends> {
    // TODO: Replace with actual API call
    // return apiClient.get<AssetTrends>('/assets/trends/summary');
    
    // Mock implementation
    const snapshots = assetsData.assetsSnapshot;
    const trends = snapshots.map(snapshot => {
      const totalAssets = snapshot.assets ? 
        Object.values(snapshot.assets).reduce((sum, amount) => sum + amount, 0) : 
        snapshot.totalSavings || 0;
      
      const totalLiabilities = snapshot.liabilities ? 
        Object.values(snapshot.liabilities).reduce((sum, amount) => sum + amount, 0) : 
        snapshot.totalLiabilities || 0;
      
      return {
        date: snapshot.date,
        assets: totalAssets,
        liabilities: totalLiabilities,
        netWorth: totalAssets - totalLiabilities
      };
    });
    
    return Promise.resolve({
      netWorthTrend: trends.map(t => ({ date: t.date, value: t.netWorth })),
      assetsTrend: trends.map(t => ({ date: t.date, value: t.assets })),
      liabilitiesTrend: trends.map(t => ({ date: t.date, value: t.liabilities })),
      monthlyChange: 0,
      yearlyChange: 0
    });
  }

  // GET /:id - קבלת תמונת מצב ספציפית
  async getAssetSnapshotById(id: string): Promise<AssetSnapshot | null> {
    // TODO: Replace with actual API call
    // return apiClient.get<AssetSnapshot>(`/assets/${id}`);
    
    // Mock implementation
    const snapshot = assetsData.assetsSnapshot.find(s => s.id === id);
    return Promise.resolve(snapshot || null);
  }

  // POST / - יצירת תמונת מצב חדשה
  async createAssetSnapshot(data: CreateAssetSnapshotRequest): Promise<AssetSnapshot> {
    // TODO: Replace with actual API call
    // return apiClient.post<AssetSnapshot>('/assets', data);
    
    // Mock implementation
    const newSnapshot: AssetSnapshot = {
      id: Date.now().toString(),
      ...data
    };
    
    return Promise.resolve(newSnapshot);
  }

  // PUT /:id - עדכון תמונת מצב
  async updateAssetSnapshot(id: string, data: UpdateAssetSnapshotRequest): Promise<AssetSnapshot> {
    // TODO: Replace with actual API call
    // return apiClient.put<AssetSnapshot>(`/assets/${id}`, data);
    
    // Mock implementation
    const existingSnapshot = assetsData.assetsSnapshot.find(s => s.id === id);
    if (!existingSnapshot) {
      throw new Error('Asset snapshot not found');
    }
    
    const updatedSnapshot: AssetSnapshot = {
      ...existingSnapshot,
      ...data
    };
    
    return Promise.resolve(updatedSnapshot);
  }

  // DELETE /:id - מחיקת תמונת מצב
  async deleteAssetSnapshot(id: string): Promise<void> {
    // TODO: Replace with actual API call
    // return apiClient.delete<void>(`/assets/${id}`);
    
    // Mock implementation
    console.log(`Deleting asset snapshot with id: ${id}`);
    return Promise.resolve();
  }
}

export const assetsService = new AssetsService();