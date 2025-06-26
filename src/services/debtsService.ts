import { Debt } from '../types';
import { ENV } from '../config/env';
import { apiClient } from './apiClient';

export interface CreateDebtRequest {
  description: string;
  amount: number;
  note?: string;
  type: 'owed_to_me' | 'i_owe';
  is_paid?: boolean;
}

export interface UpdateDebtRequest {
  description?: string;
  amount?: number;
  note?: string;
  type?: 'owed_to_me' | 'i_owe';
  is_paid?: boolean;
}

export interface DebtFilters {
  type?: 'owed_to_me' | 'i_owe';
  is_paid?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DebtSummary {
  total_debts_iowe: number;
  total_debts_owed_to_me: number;
  net_debt_position: number;
  paid_debts: number;
  unpaid_debts: number;
  recent_debts: Debt[];
}

class DebtsService {
  // GET /debts - קבלת כל החובות (עם פילטרים)
  async getAllDebts(filters?: DebtFilters): Promise<Debt[]> {
    const params = new URLSearchParams();
    
    if (filters?.type) params.append('type', filters.type);
    if (filters?.is_paid !== undefined) params.append('is_paid', filters.is_paid.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/debts?${queryString}` : '/debts';
    
    const response = await apiClient.get<Debt[]>(endpoint);
    return response.data;
  }

  // GET /debts/summary - קבלת סיכום חובות
  async getDebtSummary(): Promise<DebtSummary> {
    const response = await apiClient.get<DebtSummary>('/debts/summary');
    return response.data;
  }

  // GET /debts/:id - קבלת חוב ספציפי
  async getDebtById(id: string): Promise<Debt | null> {
    try {
      const response = await apiClient.get<Debt>(`/debts/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  // POST /debts - יצירת חוב חדש
  async createDebt(data: CreateDebtRequest): Promise<Debt> {
    const response = await apiClient.post<Debt>('/debts', data);
    return response.data;
  }

  // PUT /debts/:id - עדכון חוב
  async updateDebt(id: string, data: UpdateDebtRequest): Promise<Debt> {
    const response = await apiClient.put<Debt>(`/debts/${id}`, data);
    return response.data;
  }

  // PUT /debts/:id/pay - סימון חוב כשולם
  async markDebtAsPaid(id: string): Promise<Debt> {
    const response = await apiClient.put<Debt>(`/debts/${id}/pay`);
    return response.data;
  }

  // PUT /debts/:id/unpay - ביטול סימון שולם
  async markDebtAsUnpaid(id: string): Promise<Debt> {
    const response = await apiClient.put<Debt>(`/debts/${id}/unpay`);
    return response.data;
  }

  // DELETE /debts/:id - מחיקת חוב
  async deleteDebt(id: string): Promise<void> {
    await apiClient.delete<void>(`/debts/${id}`);
  }
}

export const debtsService = new DebtsService();