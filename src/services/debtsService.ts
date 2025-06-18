import { Debt } from '../types';
import { ENV } from '../config/env';

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
      
      const response = await this.apiCall<Debt[]>(endpoint);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to fetch debts:', error);
      }
      throw error;
    }
  }

  // GET /debts/summary - קבלת סיכום חובות
  async getDebtSummary(): Promise<DebtSummary> {
    try {
      const response = await this.apiCall<DebtSummary>('/debts/summary');
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error('Failed to fetch debt summary:', error);
      }
      throw error;
    }
  }

  // GET /debts/:id - קבלת חוב ספציפי
  async getDebtById(id: string): Promise<Debt | null> {
    try {
      const response = await this.apiCall<Debt>(`/debts/${id}`);
      return response.data;
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to fetch debt ${id}:`, error);
      }
      return null;
    }
  }

  // POST /debts - יצירת חוב חדש
  async createDebt(data: CreateDebtRequest): Promise<Debt> {
    try {
      const response = await this.apiCall<Debt>('/debts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
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
      const response = await this.apiCall<Debt>(`/debts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
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
      const response = await this.apiCall<Debt>(`/debts/${id}/pay`, {
        method: 'PUT',
      });
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
      const response = await this.apiCall<Debt>(`/debts/${id}/unpay`, {
        method: 'PUT',
      });
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
      await this.apiCall<void>(`/debts/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      if (ENV.DEV_MODE) {
        console.error(`Failed to delete debt ${id}:`, error);
      }
      throw error;
    }
  }
}

export const debtsService = new DebtsService();