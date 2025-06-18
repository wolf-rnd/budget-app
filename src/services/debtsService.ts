import { Debt } from '../types';
import { ENV } from '../config/env';
import { apiClient, ApiError } from './apiClient';
import { mockDebts } from './mockData';

export interface CreateDebtRequest {
  description: string;
  amount: number;
  note?: string;
  type: 'owed_to_me' | 'i_owe';
  isPaid?: boolean;
}

export interface UpdateDebtRequest {
  description?: string;
  amount?: number;
  note?: string;
  type?: 'owed_to_me' | 'i_owe';
  isPaid?: boolean;
}

export interface DebtFilters {
  type?: 'owed_to_me' | 'i_owe';
  isPaid?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DebtSummary {
  totalDebtsIOwe: number;
  totalDebtsOwedToMe: number;
  netDebtPosition: number;
  paidDebts: number;
  unpaidDebts: number;
  recentDebts: Debt[];
}

class DebtsService {
  // GET /debts - קבלת כל החובות (עם פילטרים)
  async getAllDebts(filters?: DebtFilters): Promise<Debt[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.type) params.append('type', filters.type);
      if (filters?.isPaid !== undefined) params.append('isPaid', filters.isPaid.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const endpoint = queryString ? `/debts?${queryString}` : '/debts';
      
      const response = await apiClient.get<Debt[]>(endpoint);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn('Failed to fetch debts from API, using mock data:', error);
      }
      
      // Return mock data as fallback
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockDebts;
      }
      
      throw error;
    }
  }

  // GET /debts/summary - קבלת סיכום חובות
  async getDebtSummary(): Promise<DebtSummary> {
    try {
      const response = await apiClient.get<DebtSummary>('/debts/summary');
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn('Failed to fetch debt summary from API:', error);
      }
      
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        const totalDebtsOwedToMe = mockDebts
          .filter(debt => debt.type === 'owed_to_me')
          .reduce((sum, debt) => sum + debt.amount, 0);
        
        return {
          totalDebtsIOwe: 0,
          totalDebtsOwedToMe,
          netDebtPosition: totalDebtsOwedToMe,
          paidDebts: 0,
          unpaidDebts: mockDebts.length,
          recentDebts: mockDebts
        };
      }
      
      throw error;
    }
  }

  // GET /debts/:id - קבלת חוב ספציפי
  async getDebtById(id: string): Promise<Debt | null> {
    try {
      const response = await apiClient.get<Debt>(`/debts/${id}`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.warn(`Failed to fetch debt ${id} from API:`, error);
      }
      
      if (ENV.ENABLE_MOCK_DATA || error instanceof ApiError) {
        return mockDebts.find(debt => debt.id === id) || null;
      }
      
      return null;
    }
  }

  // POST /debts - יצירת חוב חדש
  async createDebt(data: CreateDebtRequest): Promise<Debt> {
    try {
      const response = await apiClient.post<Debt>('/debts', data);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to create debt:', error);
      }
      throw error;
    }
  }

  // PUT /debts/:id - עדכון חוב
  async updateDebt(id: string, data: UpdateDebtRequest): Promise<Debt> {
    try {
      const response = await apiClient.put<Debt>(`/debts/${id}`, data);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to update debt ${id}:`, error);
      }
      throw error;
    }
  }

  // PUT /debts/:id/pay - סימון חוב כשולם
  async markDebtAsPaid(id: string): Promise<Debt> {
    try {
      const response = await apiClient.put<Debt>(`/debts/${id}/pay`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to mark debt as paid ${id}:`, error);
      }
      throw error;
    }
  }

  // PUT /debts/:id/unpay - ביטול סימון שולם
  async markDebtAsUnpaid(id: string): Promise<Debt> {
    try {
      const response = await apiClient.put<Debt>(`/debts/${id}/unpay`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to mark debt as unpaid ${id}:`, error);
      }
      throw error;
    }
  }

  // DELETE /debts/:id - מחיקת חוב
  async deleteDebt(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/debts/${id}`);
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to delete debt ${id}:`, error);
      }
      throw error;
    }
  }
}

export const debtsService = new DebtsService();